import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/* =========================
   Tipos y utilidades
   ========================= */
type DirKey = "U" | "D" | "L" | "R";
const DIRS: Record<DirKey, { dx: number; dy: number; jp: string; label: string }> = {
  U: { dx: 0, dy: -1, jp: "まっすぐ", label: "↑" },
  D: { dx: 0, dy: 1, jp: "もどる", label: "↓" },
  L: { dx: -1, dy: 0, jp: "ひだり に まがって", label: "←" },
  R: { dx: 1, dy: 0, jp: "みぎ に まがって", label: "→" },
};

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* =========================
   POIs del mapa (obstáculos)
   ========================= */
type Poi = { x: number; y: number; emoji: string; name: string };
const DECOS = [
  { emoji: "🏠", name: "いえ" },
  { emoji: "🌳", name: "こうえん" },
  { emoji: "🏪", name: "みせ" },
  { emoji: "🏬", name: "びる" },
];

const TARGETS = [
  { emoji: "🏪", name: "みせ" },
  { emoji: "🚉", name: "えき" },
  { emoji: "🚓", name: "こうばん" },
];

/* =========================================================
   Componente principal (solo mapa con 4 ejercicios)
   ========================================================= */
export default function B6_Direcciones() {
  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>🗺️ ほうこう（Direcciones）— 4 ejercicios</Text>
      <Text style={s.small}>
        Sigue las instrucciones. El taxi no atraviesa 🏠🌳🏪🏬. Siempre existe un camino libre.
      </Text>
      <FourMissionsMap />
    </ScrollView>
  );
}

/* =========================================================
   Mapa con 4 misiones (todas con ruta válida sin choques)
   ========================================================= */
type Step = { turn: "L" | "R" } | { straight: number };
type Goal = { x: number; y: number; emoji: string; name: string };
type Mission = {
  goal: Goal;
  plan: Step[];
  pathSet: Set<string>;
  decor: Poi[];
};

function FourMissionsMap() {
  const SIZE = 9;
  const start = { x: Math.floor(SIZE / 2), y: SIZE - 1 };

  // Pre-creamos 4 misiones con caminos válidos
  const [missions, setMissions] = useState<Mission[]>(() => {
    const arr: Mission[] = [];
    for (let i = 0; i < 4; i++) arr.push(createMission(SIZE, start));
    return arr;
  });
  const [mi, setMi] = useState(0); // índice de misión 0..3
  const m = missions[mi];

  // Estado de juego (se reinicia al cambiar misión)
  const [pos, setPos] = useState(start);
  const [steps, setSteps] = useState(0);
  const [idxPlan, setIdxPlan] = useState(0);
  const [straightLeft, setStraightLeft] = useState<number>(() => currentStraight(m.plan, 0));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // al cambiar de misión, resetea estado de juego acorde al nuevo plan
    setPos(start);
    setSteps(0);
    setIdxPlan(0);
    setStraightLeft(currentStraight(m.plan, 0));
    setError(null);
    setDone(false);
  }, [mi]); // eslint-disable-line

  const grid = useMemo(() => {
    const rows: string[][] = [];
    const decoMap = new Map<string, Poi>();
    for (const d of m.decor) decoMap.set(keyOf(d.x, d.y), d);

    for (let y = 0; y < SIZE; y++) {
      const row: string[] = [];
      for (let x = 0; x < SIZE; x++) {
        const k = keyOf(x, y);
        if (x === pos.x && y === pos.y) row.push("🚕");
        else if (x === m.goal.x && y === m.goal.y) row.push(m.goal.emoji);
        else if (decoMap.has(k)) row.push(decoMap.get(k)!.emoji);
        else row.push("");
      }
      rows.push(row);
    }
    return rows;
  }, [pos, m.decor, m.goal]);

  function isBlocked(x: number, y: number) {
    // Se puede entrar al objetivo; lo demás con decor se bloquea
    if (x === m.goal.x && y === m.goal.y) return false;
    return m.decor.some((d) => d.x === x && d.y === y);
  }

  function handlePress(d: DirKey) {
    if (done) return;
    setError(null);

    const step = m.plan[idxPlan];
    if (!step) return;

    if ("turn" in step) {
      if (d !== step.turn) {
        setError(`まちがい： primero ${DIRS[step.turn].jp}`);
        return;
      }
      const nextIdx = idxPlan + 1;
      setIdxPlan(nextIdx);
      setStraightLeft(currentStraight(m.plan, nextIdx));
      return;
    }

    // tramo recto
    if (d !== "U") {
      setError("まちがい： まっすぐ を おして");
      return;
    }

    const nx = pos.x + DIRS.U.dx;
    const ny = pos.y + DIRS.U.dy;
    if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) {
      setError("はし（borde）です");
      return;
    }
    if (isBlocked(nx, ny)) {
      setError("とおれません（obstáculo）");
      return;
    }

    const np = { x: nx, y: ny };
    setPos(np);
    setSteps((s) => s + 1);

    const left = straightLeft - 1;
    if (left > 0) {
      setStraightLeft(left);
    } else {
      const nextIdx = idxPlan + 1;
      setIdxPlan(nextIdx);
      setStraightLeft(currentStraight(m.plan, nextIdx));
    }

    if (np.x === m.goal.x && np.y === m.goal.y) setDone(true);
  }

  function resetMission(keepSameGoal = true) {
    if (keepSameGoal) {
      // Reinicia la misma misión (mismo destino/obstáculos)
      setPos(start);
      setSteps(0);
      setIdxPlan(0);
      setStraightLeft(currentStraight(m.plan, 0));
      setError(null);
      setDone(false);
    } else {
      // Re-roll SOLO de la misión actual (nuevo destino/obstáculos seguros)
      const newMissions = [...missions];
      newMissions[mi] = createMission(SIZE, start);
      setMissions(newMissions);
      // el useEffect de [mi] reseteará estado
      setPos(start);
      setSteps(0);
      setIdxPlan(0);
      setStraightLeft(0);
      setError(null);
      setDone(false);
    }
  }

  function nextMission() {
    if (mi < 3) setMi(mi + 1);
  }

  const prettyPlan = useMemo(() => renderPlan(m.plan, straightLeft, idxPlan), [m.plan, straightLeft, idxPlan]);

  return (
    <View style={s.box}>
      <Text style={s.b}>
        🚦 Misión {mi + 1} de 4 — Llega a {m.goal.emoji}（{m.goal.name}）
      </Text>
      <Text style={s.small}>
        Orden: primero <Text style={s.bold}>みぎ／ひだり に まがって</Text>, luego <Text style={s.bold}>まっすぐ × N</Text>.
      </Text>

      {/* Mapa */}
      <View style={stylesMap.grid}>
        {grid.map((row, y) => (
          <View key={`r${y}`} style={stylesMap.row}>
            {row.map((cell, x) => (
              <View key={`c${x}`} style={[stylesMap.cell, (x + y) % 2 === 0 ? stylesMap.c1 : stylesMap.c2]}>
                <Text style={stylesMap.cellTxt}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Instrucciones */}
      <View style={stylesMap.planBox}>
        <Text style={stylesMap.planTitle}>📜 ルート（ruta）</Text>
        <Text style={stylesMap.plan}>{prettyPlan}</Text>
        {straightLeft > 0 && <Text style={s.tip}>👉 ahora: まっすぐ × {straightLeft}</Text>}
      </View>

      {/* Controles */}
      <View style={stylesMap.pad}>
        <View style={stylesMap.padRow}>
          <PadBtn label="↑ まっすぐ" onPress={() => handlePress("U")} />
        </View>
        <View style={stylesMap.padRow}>
          <PadBtn label="← ひだり" onPress={() => handlePress("L")} />
          <PadBtn label="→ みぎ" onPress={() => handlePress("R")} />
        </View>
        <View style={stylesMap.padRow}>
          <PadBtn label="↓ もどる" onPress={() => handlePress("D")} />
        </View>
      </View>

      {/* Estado y acciones */}
      <View style={s.statusRow}>
        <Text style={s.small}>Pasos: {steps}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => resetMission(true)} style={s.btnGhost}>
            <Text style={s.btnGhostTxt}>Reiniciar</Text>
          </Pressable>
          <Pressable onPress={() => resetMission(false)} style={s.btnGhost}>
            <Text style={s.btnGhostTxt}>Nuevo destino</Text>
          </Pressable>
        </View>
      </View>

      {error && <Text style={s.bad}>✖ {error}</Text>}
      {done && (
        <View style={{ marginTop: 8 }}>
          <Text style={s.good}>✔ つきました！（¡Llegaste!）</Text>
          {mi < 3 ? (
            <Pressable onPress={nextMission} style={[s.btn, { marginTop: 8 }]}>
              <Text style={s.btnTxt}>Siguiente misión</Text>
            </Pressable>
          ) : (
            <Text style={[s.good, { marginTop: 6 }]}>🎉 ¡Completaste las 4 misiones!</Text>
          )}
        </View>
      )}
    </View>
  );
}

/* ======= botones ======= */
function PadBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={stylesMap.padBtn}>
      <Text style={stylesMap.padTxt}>{label}</Text>
    </Pressable>
  );
}

/* ======= helpers de ruta / generación segura ======= */
function createMission(SIZE: number, start: { x: number; y: number }): Mission {
  // coloca objetivo en mitad superior; genera plan y decora evitando el camino
  const t = TARGETS[rnd(0, TARGETS.length - 1)];
  const goal: Goal = { x: rnd(0, SIZE - 1), y: rnd(0, Math.floor(SIZE / 2)), emoji: t.emoji, name: t.name };

  const plan = makePlanFromTo(start, goal);
  const pathCells = computePathCellsFromPlan(start, plan);
  const blocked = new Set<string>(pathCells.map((p) => keyOf(p.x, p.y)));
  blocked.add(keyOf(start.x, start.y));
  blocked.add(keyOf(goal.x, goal.y));

  const decor = generateDecor(SIZE, 22, blocked);
  return { goal, plan, pathSet: blocked, decor };
}

function makePlanFromTo(
  start: { x: number; y: number },
  goal: { x: number; y: number }
): Step[] {
  // Ruta didáctica: horizontal (con giro) → vertical hacia arriba.
  const plan: Step[] = [];
  const dx = goal.x - start.x;
  const dy = start.y - goal.y;

  if (dx > 0) { plan.push({ turn: "R" }); plan.push({ straight: dx }); plan.push({ turn: "L" }); }
  else if (dx < 0) { plan.push({ turn: "L" }); plan.push({ straight: -dx }); plan.push({ turn: "R" }); }

  if (dy > 0) plan.push({ straight: dy });

  return plan.filter((p) => !("straight" in p) || p.straight > 0);
}

function computePathCellsFromPlan(
  start: { x: number; y: number },
  plan: Step[]
) {
  let facing: "U" | "L" | "R" = "U";
  let x = start.x, y = start.y;
  const cells: { x: number; y: number }[] = [];

  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    if ("turn" in step) {
      facing = step.turn; // giramos momentáneamente a L o R
    } else {
      for (let k = 0; k < step.straight; k++) {
        if (facing === "U") y += DIRS.U.dy;
        else if (facing === "L") x += DIRS.L.dx;
        else if (facing === "R") x += DIRS.R.dx;
        cells.push({ x, y });
      }
      // tras el tramo recto suele venir un giro que nos devuelve a "U"
      if (i + 1 < plan.length && "turn" in plan[i + 1]) facing = "U";
    }
  }
  return cells;
}

function generateDecor(size: number, count: number, blocked: Set<string>): Poi[] {
  const out: Poi[] = [];
  const used = new Set<string>(blocked);
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const d = DECOS[rnd(0, DECOS.length - 1)];
    const x = rnd(0, size - 1);
    const y = rnd(0, size - 1);
    const k = keyOf(x, y);
    if (used.has(k)) continue; // no encima del camino/start/goal ni solapes
    used.add(k);
    out.push({ x, y, emoji: d.emoji, name: d.name });
  }
  return out;
}

function currentStraight(plan: Step[], i: number) {
  const step = plan[i];
  return step && "straight" in step ? step.straight : 0;
}

function renderPlan(plan: Step[], straightLeft: number, idx: number) {
  const parts = plan.map((p, i) => {
    if ("turn" in p) {
      const txt = p.turn === "L" ? "ひだり に まがって" : "みぎ に まがって";
      return i === idx ? `[${txt}]` : txt;
    }
    const n = i === idx && straightLeft > 0 ? straightLeft : p.straight;
    const txt = `まっすぐ × ${n}`;
    return i === idx ? `[${txt}]` : txt;
  });
  return parts.join(" → ");
}

function keyOf(x: number, y: number) { return `${x},${y}`; }

/* =========================
   Estilos
   ========================= */
const s = StyleSheet.create({
  c: { padding: 16, gap: 14, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: "900", marginBottom: 4 },
  small: { fontSize: 14, opacity: 0.85, marginTop: 2 },
  bold: { fontWeight: "900" },

  box: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  btnTxt: { fontWeight: "800" },

  btnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "transparent",
  },
  btnGhostTxt: { fontWeight: "800", opacity: 0.8 },

  good: { fontWeight: "900", color: "#0a7a0a" },
  bad: { fontWeight: "900", color: "#8a0b0b" },
  tip: { marginTop: 6, fontSize: 14, opacity: 0.9 },
  b: { fontWeight: "900", fontSize: 18, marginBottom: 6 },
});

const stylesMap = StyleSheet.create({
  grid: { marginTop: 10, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  row: { flexDirection: "row" },
  cell: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  c1: { backgroundColor: "rgba(0,0,0,0.03)" },
  c2: { backgroundColor: "rgba(255,255,255,0.9)" },
  cellTxt: { fontSize: 18 },

  planBox: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.04)" },
  planTitle: { fontWeight: "900", marginBottom: 4 },
  plan: { fontSize: 14 },

  pad: { marginTop: 12, gap: 8, alignItems: "center" },
  padRow: { flexDirection: "row", gap: 8 },
  padBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "rgba(255,255,255,0.96)",
    minWidth: 110,
    alignItems: "center",
  },
  padTxt: { fontWeight: "800" },
});
