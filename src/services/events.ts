// src/services/events.ts
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export type UserEventType =
  | "lesson_completed"
  | "quiz_passed"
  | "daily_checkin"
  | "video_watched"
  | "level_cleared"
  | "achievement_unlocked"
  | string;

export interface PushEventOptions {
  meta?: Record<string, any>;
}

/** Crea un evento en Usuarios/{uid}/events/{id} */
export async function pushUserEvent(
  uid: string,
  type: UserEventType,
  amount: number,
  opts: PushEventOptions = {}
) {
  if (!uid) throw new Error("Missing uid");
  const id = doc(db, "_").id; // genera id

  const path = `Usuarios/${uid}/events/${id}`;
  await setDoc(doc(db, path), {
    type,
    amount,
    ...(opts.meta ? { meta: opts.meta } : {}),
    createdAt: serverTimestamp(),
  });

  return { id, path };
}
