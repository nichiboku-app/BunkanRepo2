// src/screens/N1/N1KanjiGameScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { N1_KANJI_META } from "../../data/n1_kanji_meta";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type Word = { jp: string; reading: string; es: string };

type Params = {
  id?: string;
  hex?: string;
  kanji?: string;
  on?: string[];
  kun?: string[];
  es?: string;
  words?: Word[];
};
type RootStackParamList = {
  N1KanjiGame: Params;
  N1KanjiLesson: Required<Params>;
};

type Nav = NativeStackNavigationProp<RootStackParamList, "N1KanjiGame">;

const { width } = Dimensions.get("window");

// ---------- helpers seguros ----------
const S = (v: any, fb = "—"): string =>
  typeof v === "string" && v.trim() ? v.trim() : fb;

const A = (v: any, fb: string[] = []): string[] =>
  Array.isArray(v) ? v.filter(Boolean).map(String) : fb;

const W = (v: any, fb: Word[] = []): Word[] =>
  Array.isArray(v)
    ? v
        .map((w) => ({
          jp: S(w?.jp, ""),
          reading: S(w?.reading, ""),
          es: S(w?.es, ""),
        }))
        .filter((x) => x.jp || x.reading || x.es)
    : fb;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickDistinct<T>(
  src: T[],
  count: number,
  not: T | T[] = [] as any,
  pred?: (x: T) => boolean
): T[] {
  const blk = new Set(Array.isArray(not) ? not : [not]);
  const pool = src.filter((x) => !blk.has(x) && (pred ? pred(x) : true));
  return shuffle(pool).slice(0, Math.max(0, count));
}

// ---------- componente ----------
export default function N1KanjiGameScreen() {
  const nav = useNavigation<Nav>();
  const { params: p } = useRoute() as any;

  // Normaliza/recupera datos del kanji
  const meta = useMemo(() => {
    const inKanji = S(p?.kanji, "");
    const inHex = S(p?.hex, "");
    const found =
      N1_KANJI_META.find((m) => m.k === inKanji) ||
      N1_KANJI_META.find((m) => m.hex?.toLowerCase() === inHex.toLowerCase());

    const id = S(p?.id, found?.hex || inHex || inKanji || "n1-item");
    const hex = S(inHex || found?.hex, "0000");
    const kanji = S(inKanji || found?.k, "※");
    const on = A(p?.on, A(found?.on, ["—"]));
    const kun = A(p?.kun, A(found?.kun, ["—"]));
    const es = S(p?.es, S(found?.es, "—"));
    const words = W(p?.words, W(found?.words, []));
    const safeWords =
      words.length > 0
        ? words
        : [{ jp: `${kanji}例`, reading: "れい", es: "ejemplo" }];

    return { id, hex, kanji, on, kun, es, words: safeWords };
  }, [p]);

  const { id, hex, kanji, on, kun, es, words } = meta;

  // Sonidos y animaciones
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const scaleOK = useRef(new Animated.Value(0)).current;
  const scaleNG = useRef(new Animated.Value(0)).current;
  const pulse = (v: Animated.Value) => {
    v.setValue(0);
    Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start(() =>
      Animated.timing(v, { toValue: 0, duration: 220, useNativeDriver: true }).start()
    );
  };

  const others = useMemo(() => N1_KANJI_META.filter((m) => m.k !== kanji), [kanji]);

  // =========================
  //       ESTADO GLOBAL
  // =========================
  type Phase = 1 | 2 | 3 | 4; // 1 grid, 2 lecturas, 3 palabra, 4 fin
  const [phase, setPhase] = useState<Phase>(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25); // tiempo por fase
  const [locked, setLocked] = useState(false);

  // temporizador simple por fase
  useEffect(() => {
    if (phase === 4) return;
    setTimeLeft(25);
  }, [phase]);

  useEffect(() => {
    if (phase === 4) return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          // se acaba el tiempo → siguiente fase
          setLocked(true);
          setTimeout(() => {
            setLocked(false);
            setCombo(0);
            setPhase((ph) => (ph < 3 ? ((ph + 1) as Phase) : 4));
          }, 450);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // =========================
  //   FASE 1 — Encuentra el kanji
  // =========================
  const f1GridItems = useMemo(() => {
    // 9 celdas: 1 kanji objetivo + 8 distractores (kanji de otros)
    const distract = pickDistinct(
      others.map((o) => o.k),
      8,
      kanji,
      (x) => !!x && x !== "—"
    );
    return shuffle([kanji, ...distract]);
  }, [others, kanji]);

  const [f1Found, setF1Found] = useState(0); // necesitas 3 aciertos para pasar
  const onPickF1 = async (k: string) => {
    if (locked) return;
    setLocked(true);
    const ok = k === kanji;
    if (ok) {
      setF1Found((x) => x + 1);
      setScore((s) => s + 50 + combo * 5);
      setCombo((c) => c + 1);
      if (ready) await playCorrect();
      pulse(scaleOK);
      setTimeout(() => {
        setLocked(false);
        if (f1Found + 1 >= 3) {
          setPhase(2);
        }
      }, 380);
    } else {
      setCombo(0);
      if (ready) await playWrong();
      pulse(scaleNG);
      setTimeout(() => setLocked(false), 320);
    }
  };

  // =========================
  //   FASE 2 — Lectura correcta
  // =========================
  const f2Options = useMemo(() => {
    const correct = S(on[0] || kun[0], "—");
    const poolReadings = others.flatMap((o) => [...o.on, ...o.kun]).map((x) => S(x));
    const distract = pickDistinct(poolReadings, 3, correct, (x) => !!x && x !== "—");
    const opts = shuffle([correct, ...distract]);
    return { opts, correctIndex: Math.max(0, opts.indexOf(correct)) };
  }, [others, on, kun]);

  const onPickF2 = async (idx: number) => {
    if (locked) return;
    setLocked(true);
    const ok = idx === f2Options.correctIndex;
    if (ok) {
      setScore((s) => s + 60 + combo * 6);
      setCombo((c) => c + 1);
      if (ready) await playCorrect();
      pulse(scaleOK);
      setTimeout(() => {
        setLocked(false);
        setPhase(3);
      }, 420);
    } else {
      setCombo(0);
      if (ready) await playWrong();
      pulse(scaleNG);
      setTimeout(() => setLocked(false), 360);
    }
  };

  // =========================
  //   FASE 3 — Completa la palabra
  // =========================
  const f3Data = useMemo(() => {
    const base = words[0] ?? { jp: `${kanji}語`, reading: "ご", es: S(es) };
    const masked = base.jp.replaceAll(kanji, "□");
    const distractK = pickDistinct(
      others.map((o) => o.k),
      3,
      kanji,
      (x) => !!x && x !== "—"
    );
    const opts = shuffle([kanji, ...distractK]);
    return {
      prompt: `${masked}  (${S(base.reading)})`,
      meaning: S(base.es),
      opts,
      correctIndex: Math.max(0, opts.indexOf(kanji)),
    };
  }, [words, kanji, others, es]);

  const onPickF3 = async (idx: number) => {
    if (locked) return;
    setLocked(true);
    const ok = idx === f3Data.correctIndex;
    if (ok) {
      setScore((s) => s + 80 + combo * 8);
      setCombo((c) => c + 1);
      if (ready) await playCorrect();
      pulse(scaleOK);
      setTimeout(() => {
        setLocked(false);
        setPhase(4);
      }, 440);
    } else {
      setCombo(0);
      if (ready) await playWrong();
      pulse(scaleNG);
      setTimeout(() => setLocked(false), 360);
    }
  };

  // =========================
  //            UI
  // =========================
  if (phase === 4) {
    return (
      <View style={styles.wrap}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#0B0F19", "#0f1724"]} style={StyleSheet.absoluteFillObject} />

        <View style={styles.header}>
          <Text style={styles.badge}>N1 · JUEGO</Text>
          <Text style={styles.title}>¡Completado!</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.bigKanji}>{kanji}</Text>
          <Text style={styles.mean}>{es}</Text>
          <View style={{ height: 12 }} />
          <Text style={styles.scoreTxt}>Puntaje: {score}</Text>
          <Text style={styles.scoreSub}>
            {score < 120 ? "¡Buen comienzo!" : score < 220 ? "¡Vas muy bien!" : "¡Dominio excelente!"}
          </Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => nav.goBack()}>
              <Text style={styles.btnGhostTxt}>Cerrar</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() =>
                nav.navigate("N1KanjiLesson", {
                  id,
                  hex,
                  kanji,
                  on,
                  kun,
                  es,
                  words,
                })
              }
            >
              <Text style={styles.btnPrimaryTxt}>Revisar lección</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0B0F19", "#0f1724"]} style={StyleSheet.absoluteFillObject} />

      {/* Header compacto */}
      <View style={styles.header}>
        <Text style={styles.badge}>N1 · JUEGO</Text>
        <Text style={styles.title}>{kanji} — {es}</Text>
      </View>

      {/* Barra de estado */}
      <View style={styles.stateRow}>
        <Text style={styles.stateTxt}>⏱ {timeLeft}s</Text>
        <Text style={styles.stateTxt}>⭐ {score}</Text>
        <Text style={styles.stateTxt}>🔥 {combo}x</Text>
      </View>

      {/* Feedback */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burstOk,
          { transform: [{ scale: scaleOK.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
        ]}
      >
        <Text style={styles.burstOkTxt}>¡Bien!</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burstWrong,
          { transform: [{ scale: scaleNG.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
        ]}
      >
        <Text style={styles.burstWrongTxt}>Ups…</Text>
      </Animated.View>

      {/* Tarjeta de fase */}
      <View style={styles.phaseCard}>
        {phase === 1 && (
          <>
            <Text style={styles.phaseTitle}>1) Encuentra el kanji</Text>
            <Text style={styles.phaseSub}>Toca 「{kanji}」 en la cuadrícula. Acierta 3 veces.</Text>
            <View style={styles.grid}>
              {f1GridItems.map((k, i) => (
                <Pressable
                  key={`g-${i}`}
                  style={styles.gridCell}
                  onPress={() => onPickF1(k)}
                  disabled={locked}
                >
                  <Text style={styles.gridKanji}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.smallHint}>Aciertos: {f1Found} / 3</Text>
          </>
        )}

        {phase === 2 && (
          <>
            <Text style={styles.phaseTitle}>2) Lectura correcta</Text>
            <Text style={styles.phaseSub}>Elige una lectura ON/KUN válida para 「{kanji}」</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {f2Options.opts.map((opt, i) => (
                <Pressable
                  key={`o-${i}`}
                  style={[
                    styles.optBtn,
                  ]}
                  onPress={() => onPickF2(i)}
                  disabled={locked}
                >
                  <Text style={styles.optTxt}>{S(opt)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {phase === 3 && (
          <>
            <Text style={styles.phaseTitle}>3) Completa la palabra</Text>
            <Text style={styles.phaseSub}>Toca la opción que completa la palabra:</Text>
            <View style={styles.wordBox}>
              <Text style={styles.wordMain}>{f3Data.prompt}</Text>
              <Text style={styles.wordSub}>Significado: {f3Data.meaning}</Text>
            </View>
            <View style={{ gap: 10 }}>
              {f3Data.opts.map((opt, i) => (
                <Pressable
                  key={`k-${i}`}
                  style={styles.optBtn}
                  onPress={() => onPickF3(i)}
                  disabled={locked}
                >
                  <Text style={styles.optTxt}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Salir */}
      <View style={styles.footer}>
        <Pressable style={styles.pill} onPress={() => nav.goBack()}>
          <Text style={styles.pillTxt}>Salir</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------- estilos ----------
const CELL = Math.floor((width - 32 - 16) / 3);
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19" },
  header: { paddingTop: (StatusBar.currentHeight ?? 0) + 10, paddingHorizontal: 16, paddingBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    color: "#063A3A",
    backgroundColor: "#36D9C6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "900",
  },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 8 },

  stateRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 6 },
  stateTxt: { color: "rgba(255,255,255,0.8)", fontWeight: "800" },

  phaseCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    gap: 12,
  },
  phaseTitle: { color: "#EAF1FF", fontWeight: "900", fontSize: 18 },
  phaseSub: { color: "rgba(255,255,255,0.78)" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  gridCell: {
    width: CELL,
    height: CELL,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  gridKanji: { color: "#fff", fontWeight: "900", fontSize: 28 },

  smallHint: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 6 },

  optBtn: {
    minHeight: 54,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
  },
  optTxt: { color: "#EAF1FF", fontWeight: "900", fontSize: 16 },

  wordBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 12,
    gap: 6,
  },
  wordMain: { color: "#fff", fontWeight: "900", fontSize: 18 },
  wordSub: { color: "rgba(255,255,255,0.75)" },

  // feedback
  burstOk: {
    position: "absolute",
    top: 120,
    right: 16,
    backgroundColor: "rgba(51,218,198,0.15)",
    borderColor: "rgba(51,218,198,0.9)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  burstOkTxt: { color: "#BFF8EF", fontWeight: "900" },
  burstWrong: {
    position: "absolute",
    top: 120,
    right: 16,
    backgroundColor: "rgba(255,86,86,0.12)",
    borderColor: "rgba(255,86,86,0.9)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  burstWrongTxt: { color: "#FFD7D7", fontWeight: "900" },

  resultCard: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
  },
  bigKanji: { color: "#FFFFFF", fontSize: 54, fontWeight: "900" },
  mean: { color: "rgba(255,255,255,0.92)", fontWeight: "800", marginTop: 4 },
  scoreTxt: { color: "#EAF1FF", fontWeight: "900", fontSize: 20, marginTop: 8 },
  scoreSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },

  row: { flexDirection: "row", gap: 10, width: "100%", marginTop: 14 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.18)" },
  btnGhostTxt: { color: "#EAF1FF", fontWeight: "900" },
  btnPrimary: { backgroundColor: "#2B7FFF", borderColor: "rgba(255,255,255,0)" },
  btnPrimaryTxt: { color: "#EAF1FF", fontWeight: "900" },

  footer: { alignItems: "center", padding: 16 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  pillTxt: { color: "#BFD9FF", fontWeight: "800" },
});
