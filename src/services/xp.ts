// src/services/xp.ts
import {
    doc,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { pushUserEvent } from "./events";

/** Suma XP al perfil y registra el evento (idempotencia no requerida). */
export async function awardXp(uid: string, amount: number, meta?: any) {
  if (!uid) throw new Error("Missing uid");
  const userRef = doc(db, "Usuarios", uid);

  await updateDoc(userRef, {
    "stats.points": increment(amount),
    "stats.weeklyProgress": increment(amount),
    lastActiveAt: serverTimestamp(),
  }).catch(async () => {
    // Si no existe el doc, créalo con stats base
    await setDoc(
      userRef,
      {
        stats: {
          points: amount,
          weeklyProgress: amount,
          weeklyGoal: 0,
          streakCount: 0,
        },
        lastActiveAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await pushUserEvent(uid, "xp_awarded", amount, meta ?? {});
}

/** Helper para usar con el usuario actual. */
export async function awardXpCurrentUser(amount: number, meta?: any) {
  const u = auth.currentUser;
  if (!u) throw new Error("No hay usuario autenticado");
  return awardXp(u.uid, amount, meta);
}
