// src/services/stats.ts
import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export type Stats = {
  points: number;
  weeklyProgress: number;
  weeklyGoal: number;
  streakCount: number;
};

const DEFAULT_STATS: Stats = {
  points: 0,
  weeklyProgress: 0,
  weeklyGoal: 100,
  streakCount: 0,
};

/** Asegura que Usuarios/{uid}.stats sea un MAP (no null) y tenga claves base. */
export async function ensureStats(uid: string) {
  const uref = doc(db, 'Usuarios', uid);
  const snap = await getDoc(uref);

  if (!snap.exists()) {
    await setDoc(uref, { stats: DEFAULT_STATS, lastActiveAt: serverTimestamp() }, { merge: true });
    return;
  }

  const stats = snap.get('stats');
  const isMap = stats && typeof stats === 'object' && !Array.isArray(stats);
  if (!isMap) {
    // Si era null/otro tipo, lo sobreescribimos como mapa con defaults
    await setDoc(uref, { stats: DEFAULT_STATS }, { merge: true });
  } else {
    // Completa claves faltantes sin pisar las existentes
    const patch: Partial<Stats> = {};
    (['points','weeklyProgress','weeklyGoal','streakCount'] as const).forEach(k => {
      if (typeof stats[k] !== 'number') (patch as any)[k] = DEFAULT_STATS[k];
    });
    if (Object.keys(patch).length) {
      await setDoc(uref, { stats: { ...stats, ...patch } }, { merge: true });
    }
  }
}

/** Suma puntos al perfil y a la meta semanal. Asegura stats antes de incrementar. */
export async function addPoints(uid: string, delta: number) {
  await ensureStats(uid);
  await updateDoc(doc(db, 'Usuarios', uid), {
    'stats.points': increment(delta),
    'stats.weeklyProgress': increment(delta),
    lastActiveAt: serverTimestamp(),
  });
}
