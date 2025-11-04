// src/kanji/srs.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SRSCard = {
  id: string;            // ej. n1_12_61f2
  hex: string;           // "61f2"
  due: number;           // timestamp ms
  interval: number;      // días
  ef: number;            // easiness factor
  reps: number;          // repeticiones seguidas correctas
  lapses: number;        // fallos
};

const KEY = "n1_srs_cards_v1";

export async function loadAll(): Promise<Record<string, SRSCard>> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
export async function saveAll(map: Record<string, SRSCard>) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}

export function ensureCard(map: Record<string, SRSCard>, id: string, hex: string): SRSCard {
  if (!map[id]) {
    map[id] = { id, hex, due: Date.now(), interval: 0, ef: 2.5, reps: 0, lapses: 0 };
  }
  return map[id];
}

// quality: 0–5 (0=total fallo, 3=regular, 5=perfecto)
// Devuelve card actualizada + cuándo vuelve a salir (due)
export function review(card: SRSCard, quality: 0|1|2|3|4|5): SRSCard {
  // SM-2 básico
  let ef = card.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  if (quality < 3) {
    card.reps = 0;
    card.interval = 0;
    card.lapses += 1;
  } else {
    card.reps += 1;
    if (card.reps === 1) card.interval = 1;
    else if (card.reps === 2) card.interval = 6;
    else card.interval = Math.round(card.interval * ef);
  }
  card.ef = ef;
  const nextDays = card.interval <= 0 ? 0 : card.interval;
  card.due = Date.now() + nextDays * 24 * 60 * 60 * 1000;
  return card;
}

export function dueCards(map: Record<string, SRSCard>, limit = 20): SRSCard[] {
  const now = Date.now();
  return Object.values(map)
    .filter(c => c.due <= now)
    .sort((a,b)=>a.due-b.due)
    .slice(0, limit);
}
