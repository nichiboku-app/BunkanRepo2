// src/services/events.ts
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // ajusta la ruta

export type UserEventType =
  | "lesson_completed"
  | "quiz_passed"
  | "daily_checkin"
  | "video_watched"
  | "level_cleared"
  | string;

export async function pushUserEvent(
  uid: string,
  type: UserEventType,
  amount: number,
  meta?: Record<string, any>
) {
  if (!uid) throw new Error("Missing uid");

  // Genera un id y escribe el evento en la subcolección
  const id = doc(db, "_").id; // solo para crear un id
  const path = `Usuarios/${uid}/events/${id}`;
  await setDoc(doc(db, path), {
    type,
    amount,
    ...(meta ? { meta } : {}),
    createdAt: serverTimestamp(),
  });

  return { id, path };
}
