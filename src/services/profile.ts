// src/services/profile.ts
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export type Stats = {
  points: number;
  weeklyProgress: number;
  weeklyGoal: number;
  streakCount: number;
  updatedAt?: any;
  lastDailyAt?: any;
};

export type ProfileLive = {
  displayName: string;
  email?: string | null;
  countryCode?: string;
  photoURL?: string;
  photoBase64?: string;
  avatarUpdatedAt?: number | string;
  lastActiveAt?: any;
  stats: Stats | null;
};

export type Ranks = { world: number | null; local: number | null };

/**
 * Suscribe en TIEMPO REAL al documento Usuarios/{uid}
 * y entrega el objeto normalizado al callback.
 */
export function streamProfile(
  uid: string,
  cb: (piece: Partial<ProfileLive>) => void
) {
  const ref = doc(db, "Usuarios", uid);
  const unsub = onSnapshot(ref, (snap) => {
    const d = snap.data() || {};
    cb({
      displayName: d.displayName ?? "",
      email: d.email ?? auth.currentUser?.email ?? null,
      countryCode: d.countryCode ?? "MX",
      photoURL: d.photoURL,
      photoBase64: d.photoBase64,
      avatarUpdatedAt: d.avatarUpdatedAt,
      lastActiveAt: d.lastActiveAt,
      stats: d.stats ?? null, // 👈 incluye stats en vivo
    });
  });
  return unsub;
}

// Placeholders simples (evitan romper la UI si aún no tienes los LB)
export async function getRanks(_uid: string): Promise<Ranks> {
  return { world: null, local: null };
}

export async function updateDisplayName(uid: string, name: string) {
  const { updateDoc, doc: d } = await import("firebase/firestore");
  await updateDoc(d(db, "Usuarios", uid), { displayName: name });
}
