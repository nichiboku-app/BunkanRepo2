// src/services/userStats.ts
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export type UserStats = {
  points: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakCount: number;
  streakUpdatedOn: string; // YYYY-MM-DD
  updatedAt?: any;
};

export function subscribeUserStats(
  uid: string,
  onData: (stats: UserStats | null) => void
): Unsubscribe {
  const ref = doc(db, `Usuarios/${uid}/stats/general`);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return onData(null);
    onData({
      points: snap.get("points") ?? 0,
      weeklyGoal: snap.get("weeklyGoal") ?? 350,
      weeklyProgress: snap.get("weeklyProgress") ?? 0,
      streakCount: snap.get("streakCount") ?? 0,
      streakUpdatedOn: snap.get("streakUpdatedOn") ?? "",
      updatedAt: snap.get("updatedAt"),
    });
  });
}
