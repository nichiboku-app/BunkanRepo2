// src/helpers/awardOnSuccess.ts
import { auth } from '../config/firebaseConfig';
import { awardFromScreen, getAwardMode } from '../services/award';

export async function awardOnSuccess(screenKey: string, meta?: Record<string, any>) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { awarded: false, reason: 'no-uid' as const };
  if (getAwardMode(screenKey) !== 'onSuccess') {
    return { awarded: false, reason: 'wrong-mode' as const };
  }
  return awardFromScreen(uid, screenKey, meta);
}
