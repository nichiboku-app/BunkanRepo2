// src/services/profile.ts
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export type ProfileStats = {
  points: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakCount: number;
  streakUpdatedOn: string;
};

export type Ranks = { world: number | null; local: number | null };

export type ProfileLive = {
  displayName: string;
  email?: string;
  countryCode: string;
  lastActiveAt?: any;
  stats: ProfileStats | null;
};

/* =========================
 * Semana ISO (tz-aware)
 * ========================= */
export function isoWeekKey(date = new Date(), tz = "America/Mexico_City") {
  const local = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  const tmp = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7; // lunes=0
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 +
        ((firstThursday.getUTCDay() + 6) % 7)) / 7,
    );
  return `${tmp.getUTCFullYear()}_${String(week).padStart(2, "0")}`;
}

/* ============================================
 * Stream unificado: siempre emite objeto completo
 * ============================================ */
export function streamProfile(uid: string, cb: (p: ProfileLive) => void): Unsubscribe {
  const userRef = doc(db, "Usuarios", uid);
  const statsRef = doc(db, "Usuarios", uid, "stats", "general");

  let cur: ProfileLive = {
    displayName: "",
    email: "",
    countryCode: "XX",
    lastActiveAt: undefined,
    stats: null,
  };

  const emit = () => cb({ ...cur });

  const unsubUser = onSnapshot(userRef, (snap) => {
    const d = snap.exists() ? snap.data() : {};
    cur.displayName = (d?.displayName ?? "") as string;
    cur.email = (d?.email ?? "") as string | undefined;
    cur.countryCode = (d?.countryCode ?? "XX") as string;
    cur.lastActiveAt = d?.lastActiveAt;
    emit();
  });

  const unsubStats = onSnapshot(statsRef, (snap) => {
    if (!snap.exists()) {
      cur.stats = null;
    } else {
      const s = snap.data() as any;
      cur.stats = {
        points: s.points ?? 0,
        weeklyGoal: s.weeklyGoal ?? 350,
        weeklyProgress: s.weeklyProgress ?? 0,
        streakCount: s.streakCount ?? 0,
        streakUpdatedOn: s.streakUpdatedOn ?? "",
      };
    }
    emit();
  });

  return () => {
    unsubUser();
    unsubStats();
  };
}

/* ============================================
 * Ranks (LOCAL real; WORLD ≈ semanal global)
 * - Maneja permission-denied devolviendo null
 * ============================================ */
export async function getRanks(uid: string): Promise<Ranks> {
  try {
    // País del usuario
    const userRef = doc(db, "Usuarios", uid);
    const userSnap = await getDoc(userRef);
    const country = (userSnap.get("countryCode") ?? "XX") as string;

    // Puntos del usuario
    const statsRef = doc(db, "Usuarios", uid, "stats", "general");
    const statsSnap = await getDoc(statsRef);
    const userPointsAll = (statsSnap.get("points") ?? 0) as number;

    // LOCAL: leaderboards_local/{country}/users con pointsAllTime
    let localRank: number | null = null;
    try {
      const localCol = collection(db, "leaderboards_local", country, "users");
      const localQ = query(localCol, where("pointsAllTime", ">", userPointsAll));
      const localCount = await getCountFromServer(localQ);
      localRank = 1 + (localCount.data().count || 0);
    } catch {
      // Si no hay permisos o no existe la colección aún
      localRank = null;
    }

    // WORLD (aprox) = tablero semanal global
    let worldRank: number | null = null;
    try {
      const weekKey = isoWeekKey();
      const weeklyCol = collection(db, "leaderboards_weekly", weekKey, "users");
      const weeklyMe = await getDoc(doc(weeklyCol, uid));
      const weeklyPoints = weeklyMe.exists() ? (weeklyMe.get("points") ?? 0) : 0;
      if (weeklyPoints > 0) {
        const worldQ = query(weeklyCol, where("points", ">", weeklyPoints));
        const worldCount = await getCountFromServer(worldQ);
        worldRank = 1 + (worldCount.data().count || 0);
      } else {
        worldRank = null; // sin puntos esta semana => no rank visible
      }
    } catch {
      worldRank = null;
    }

    return { world: worldRank, local: localRank };
  } catch {
    // fallback ultra defensivo
    return { world: null, local: null };
  }
}

/* =======================
 * Actualizar displayName
 * ======================= */
export async function updateDisplayName(uid: string, displayName: string) {
  await updateDoc(doc(db, "Usuarios", uid), { displayName });
}
