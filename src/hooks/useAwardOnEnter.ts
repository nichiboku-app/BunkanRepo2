// src/hooks/useAwardOnEnter.ts
import { useEffect } from 'react';
import { auth } from '../config/firebaseConfig';
import { awardFromScreen, getAwardMode } from '../services/award';

export function useAwardOnEnter(screenKey: string) {
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (getAwardMode(screenKey) !== 'onEnter') return;

    awardFromScreen(uid, screenKey).catch((e) => {
      console.warn('useAwardOnEnter error', e);
    });
  }, [screenKey]);
}
