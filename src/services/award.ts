// src/services/award.ts
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { AwardCfg, SCREEN_AWARDS, SCREEN_PATTERNS } from './award.config';
import { pushUserEvent } from './events';

function findAwardFor(screenKey: string): AwardCfg | null {
  // 1) exact match
  const exact = SCREEN_AWARDS[screenKey] || SCREEN_AWARDS[`${screenKey}.tsx`];
  if (exact) return exact;

  // 2) patterns
  for (const p of SCREEN_PATTERNS) {
    if (p.test.test(screenKey)) {
      const idSuffix = screenKey.replace(/\.tsx$/, '');
      const achievementId = p.cfg.achievementPrefix
        ? `${p.cfg.achievementPrefix}_${idSuffix}`.toLowerCase()
        : undefined;
      return { points: p.cfg.points, mode: p.cfg.mode, achievementId };
    }
  }
  return null;
}

/**
 * Otorga PX/Logro UNA sola vez por pantalla y usuario:
 * - Marca /Usuarios/{uid}/userProgress/{screenKey}
 * - Llama pushUserEvent (suma puntos, racha, weekly, evento, logro opcional)
 */
export async function awardFromScreen(uid: string, screenKey: string, meta?: Record<string, any>) {
  if (!uid) throw new Error('Missing uid');

  const cfg = findAwardFor(screenKey);
  if (!cfg) return { awarded: false, reason: 'no-config' as const };

  const progressRef = doc(db, 'Usuarios', uid, 'userProgress', screenKey);
  let awarded = false;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(progressRef);
    if (snap.exists()) return;          // idempotente

    tx.set(progressRef, {
      completedAt: serverTimestamp(),
      points: cfg.points,
      achievementId: cfg.achievementId ?? null,
      meta: meta ?? null,
    });
    awarded = true; // la escritura se hace en la tx, el pushUserEvent se hace fuera
  });

  if (awarded) {
    await pushUserEvent(uid, 'screen_completed', cfg.points, {
      achievementId: cfg.achievementId,
      meta: { screenKey, ...(meta ?? {}) },
    });
  }
  return { awarded, points: cfg.points, achievementId: cfg.achievementId ?? null };
}

export function getAwardMode(screenKey: string) {
  const cfg = findAwardFor(screenKey);
  return cfg?.mode;
}
