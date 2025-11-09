// src/services/rank.ts
import {
    collection,
    doc,
    getCountFromServer,
    getDoc,
    query,
    where,
} from "firebase/firestore";
import { dailyKey, isoWeekKey } from "../../utils/leaderboardKeys";
import { db } from "../config/firebaseConfig";

/**
 * Rank mundial por puntos totales (leaderboards_local/{CC}/users/{uid} también usa pointsAllTime,
 * pero para MUNDIAL consultamos leaderboards_local/* TODAS las regiones -> simplificamos:
 * guardamos el total del usuario y comparamos contra un espejo global: leaderboards_world/users/{uid}
 * Si aún no tienes ese espejo global, calcula "world rank" con la colección local más grande o
 * usa leaderboards_weekly/daily. Debajo está el cálculo genérico con una colección dada.
 */

// Utilidad genérica para calcular rank: 1 + usuarios con valor > que el del usuario
async function rankByField(
  collPath: string, // p.ej. "leaderboards_local/MX/users"
  field: string,    // "pointsAllTime" | "points"
  myValue: number
) {
  if (myValue <= 0) return 0;
  const qGt = query(collection(db, collPath), where(field, ">", myValue));
  const snap = await getCountFromServer(qGt);
  return snap.data().count + 1;
}

/** Rank local por país usando pointsAllTime */
export async function getLocalRank(uid: string, countryCode: string) {
  const base = `leaderboards_local/${countryCode}/users`;
  const meRef = doc(db, `${base}/${uid}`);
  const me = await getDoc(meRef);
  const my = me.exists() ? (me.get("pointsAllTime") as number) ?? 0 : 0;
  if (my === 0) return { rank: 0, points: 0 };

  const rank = await rankByField(base, "pointsAllTime", my);
  return { rank, points: my };
}

/** Rank semanal */
export async function getWeeklyRank(uid: string, weekKey = isoWeekKey()) {
  const base = `leaderboards_weekly/${weekKey}/users`;
  const meRef = doc(db, `${base}/${uid}`);
  const me = await getDoc(meRef);
  const my = me.exists() ? (me.get("points") as number) ?? 0 : 0;
  if (my === 0) return { rank: 0, points: 0 };

  const rank = await rankByField(base, "points", my);
  return { rank, points: my };
}

/** Rank diario (por si lo quieres mostrar en otro lado) */
export async function getDailyRank(uid: string, dKey = dailyKey()) {
  const base = `leaderboards_daily/${dKey}/users`;
  const meRef = doc(db, `${base}/${uid}`);
  const me = await getDoc(meRef);
  const my = me.exists() ? (me.get("points") as number) ?? 0 : 0;
  if (my === 0) return { rank: 0, points: 0 };

  const rank = await rankByField(base, "points", my);
  return { rank, points: my };
}
