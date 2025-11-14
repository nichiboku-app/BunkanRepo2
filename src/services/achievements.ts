// src/services/achievements.ts
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { pushUserEvent } from './events';

/** ================================
 *  Tipos
 *  ================================ */

// 👇 Tipo amplio para mantener compatibilidad con pantallas que lo usan.
// El servicio realmente solo utiliza xp, sub y meta; el resto es metadata opcional.
export type AchievementPayload = {
  title?: string;
  description?: string;
  icon?: string;
  badgeColor?: string;
  points?: number;
  xp?: number;
  score?: number;
  total?: number;
  type?: string;        // 'quiz', 'practice', etc.
  quizKey?: string;
  sub?: string;
  version?: number;
  createdAt?: number;
  meta?: Record<string, any>;
};

export type AwardOnEnterOptions = {
  /** XP que se otorga al entrar (solo 1ª vez, a menos que configures repeatXp) */
  xpOnEnter?: number;
  /** Id de logro que se debe otorgar en la primera entrada */
  achievementId?: string;
  /** Texto/etiqueta del logro (opcional) */
  achievementSub?: string;
  /** XP que se otorga en re-entradas (repeticiones) */
  repeatXp?: number;
  /** Meta extra para eventos */
  meta?: Record<string, any>;
};

export type AwardOnSuccessOptions = {
  /** XP que se otorga al éxito */
  xpOnSuccess?: number;
  /** Id de logro que se debe otorgar al éxito (idempotente) */
  achievementId?: string;
  /** Texto/etiqueta del logro (opcional) */
  achievementSub?: string;
  /** Meta extra para eventos */
  meta?: Record<string, any>;
};

export type AwardAchievementOptions = {
  /** XP a sumar al otorgar el logro (solo 1ª vez) */
  xp?: number;
  /** Subtítulo/etiqueta a guardar con el logro */
  sub?: string;
  /** Meta extra para eventos */
  meta?: Record<string, any>;
};

/** ================================
 *  Helpers internos
 *  ================================ */

function nowTS() {
  return serverTimestamp();
}

async function addXP(uid: string, amount: number) {
  if (!amount) return;
  const userRef = doc(db, 'Usuarios', uid);
  await updateDoc(userRef, {
    'stats.points': increment(amount),
    'stats.weeklyProgress': increment(amount),
    updatedAt: nowTS(),
    lastActiveAt: nowTS(),
  }).catch(async () => {
    // Si el doc no existe aún, crea base mínima
    await setDoc(
      userRef,
      {
        stats: { points: amount, weeklyProgress: amount },
        updatedAt: nowTS(),
        lastActiveAt: nowTS(),
      },
      { merge: true },
    );
  });
}

async function writeUserEvent(
  uid: string,
  type: string,
  amount: number,
  meta?: Record<string, any>,
) {
  try {
    await pushUserEvent(uid, type as any, amount, meta);
  } catch {
    // no romper flujo de UI si el evento falla
  }
}

/** Crea/actualiza un documento de progreso por pantalla. */
async function touchScreenProgress(uid: string, screenKey: string) {
  const ref = doc(db, 'Usuarios', uid, 'userProgress', screenKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      screenKey,
      firstOpenAt: nowTS(),
      visits: 1,
      lastOpenAt: nowTS(),
      successAt: null,
    });
    return { ref, wasFirstOpen: true };
  }
  await updateDoc(ref, {
    visits: increment(1),
    lastOpenAt: nowTS(),
  });
  return { ref, wasFirstOpen: false };
}

/** Marca éxito de una pantalla si no estaba marcado. Devuelve si fue primera vez. */
async function markScreenSuccess(uid: string, screenKey: string) {
  const ref = doc(db, 'Usuarios', uid, 'userProgress', screenKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Si alguien llama a success sin haber entrado antes, inicializamos y marcamos
    await setDoc(ref, {
      screenKey,
      firstOpenAt: nowTS(),
      visits: 1,
      lastOpenAt: nowTS(),
      successAt: nowTS(),
    });
    return { ref, wasFirstSuccess: true };
  }
  const data = snap.data();
  if (!data?.successAt) {
    await updateDoc(ref, { successAt: nowTS() });
    return { ref, wasFirstSuccess: true };
  }
  return { ref, wasFirstSuccess: false };
}

/** Otorga un logro (idempotente). Devuelve si fue la primera vez. */
async function grantAchievement(
  uid: string,
  achievementId: string,
  opts?: AwardAchievementOptions,
) {
  const ref = doc(db, 'Usuarios', uid, 'logros', achievementId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { ref, wasFirst: false };

  await setDoc(ref, {
    id: achievementId,
    unlockedAt: nowTS(),
    sub: opts?.sub ?? null,
  });

  if (opts?.xp && opts.xp > 0) {
    await addXP(uid, opts.xp);
    await writeUserEvent(uid, 'achievement_unlocked', opts.xp, {
      achievementId,
      ...(opts.meta ?? {}),
    });
  } else {
    await writeUserEvent(uid, 'achievement_unlocked', 0, {
      achievementId,
      ...(opts?.meta ?? {}),
    });
  }

  return { ref, wasFirst: true };
}

/** ================================
 *  API pública
 *  ================================ */

/**
 * Lee un logro del usuario actual. Devuelve el doc (con id, sub, unlockedAt)
 * o null si no existe.
 */
export async function getAchievement(achievementId: string) {
  const u = auth.currentUser;
  if (!u) return null;
  const ref = doc(db, 'Usuarios', u.uid, 'logros', achievementId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: achievementId, ...(snap.data() as any) };
}

/**
 * Hook para pantallas “onEnter”.
 * - Suma XP la primera vez (xpOnEnter).
 * - Puede sumar XP por repeticiones (repeatXp).
 * - Puede otorgar un logro al entrar (achievementId).
 */
export function useAwardOnEnter(
  screenKey: string,
  options?: AwardOnEnterOptions,
) {
  useEffect(() => {
    const u = auth.currentUser;
    if (!u || !screenKey) return;

    (async () => {
      const { wasFirstOpen } = await touchScreenProgress(u.uid, screenKey);

      // 1) XP de primera vez
      if (wasFirstOpen && (options?.xpOnEnter ?? 0) > 0) {
        const amount = options!.xpOnEnter!;
        await addXP(u.uid, amount);
        await writeUserEvent(u.uid, 'screen_open_first', amount, {
          screenKey,
          ...(options?.meta ?? {}),
        });
      }

      // 2) XP por repetición
      if (!wasFirstOpen && (options?.repeatXp ?? 0) > 0) {
        const amount = options!.repeatXp!;
        await addXP(u.uid, amount);
        await writeUserEvent(u.uid, 'screen_open_repeat', amount, {
          screenKey,
          ...(options?.meta ?? {}),
        });
      }

      // 3) Logro de primera visita (si se pidió)
      if (options?.achievementId) {
        await grantAchievement(u.uid, options.achievementId, {
          xp: 0, // si quieres XP del logro al entrar, pásalo con xpOnEnter o cámbialo aquí
          sub: options.achievementSub,
          meta: { screenKey, ...(options.meta ?? {}) },
        });
      }
    })().catch((e) => {
      console.warn('[useAwardOnEnter] error:', e);
    });
  }, [screenKey]);
}

/**
 * Llamar cuando la pantalla alcanza su “éxito”.
 * - Marca successAt (idempotente).
 * - Suma XP de éxito (solo la primera vez).
 * - Puede otorgar un logro asociado al éxito (idempotente).
 */
export async function awardOnSuccess(
  screenKey: string,
  options?: AwardOnSuccessOptions,
) {
  const u = auth.currentUser;
  if (!u) return { ok: false, reason: 'NO_AUTH' };

  const { wasFirstSuccess } = await markScreenSuccess(u.uid, screenKey);

  // 1) XP por éxito (solo si fue primera vez)
  if (wasFirstSuccess && (options?.xpOnSuccess ?? 0) > 0) {
    const amount = options!.xpOnSuccess!;
    await addXP(u.uid, amount);
    await writeUserEvent(u.uid, 'screen_success', amount, {
      screenKey,
      ...(options?.meta ?? {}),
    });
  }

  // 2) Logro de éxito (idempotente)
  if (options?.achievementId) {
    await grantAchievement(u.uid, options.achievementId, {
      xp: 0, // si el logro debería dar XP extra, cámbialo a >0
      sub: options.achievementSub,
      meta: { screenKey, ...(options?.meta ?? {}) },
    });
  }

  return { ok: true, firstTime: wasFirstSuccess };
}

/**
 * Otorga un logro manualmente (idempotente).
 * Si pasas xp>0, suma puntos solo la primera vez que se otorga ese logro.
 */
export async function awardAchievement(
  achievementId: string,
  opts?: AwardAchievementOptions,
) {
  const u = auth.currentUser;
  if (!u) return { ok: false, reason: 'NO_AUTH' };

  const { wasFirst } = await grantAchievement(u.uid, achievementId, opts);

  // Si no dimos XP (xp=0 o undefined), al menos deja constancia del evento
  if (!opts?.xp) {
    await writeUserEvent(u.uid, 'achievement_unlocked', 0, {
      achievementId,
      ...(opts?.meta ?? {}),
    });
  }

  return { ok: true, firstTime: wasFirst };
}
