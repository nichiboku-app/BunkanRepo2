// src/screens/N1/N1KanjiQuizScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
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

type QuizParams = {
  id?: string;
  hex?: string;
  kanji?: string;
  on?: string[];
  kun?: string[];
  es?: string;
  words?: Word[];
};

type RootStackParamList = {
  N1KanjiQuiz: QuizParams;
  N1KanjiLesson: Required<QuizParams>;
};

type Nav = NativeStackNavigationProp<RootStackParamList, "N1KanjiQuiz">;

const { width } = Dimensions.get("window");

// ---------- utils seguros ----------
const str = (v: any, fallback = "—"): string =>
  typeof v === "string" && v.trim().length ? v.trim() : fallback;

const arr = (v: any, fallback: string[] = []): string[] =>
  Array.isArray(v) ? v.filter(Boolean).map(String) : fallback;

const wordsArr = (v: any, fallback: Word[] = []): Word[] =>
  Array.isArray(v)
    ? v
        .map((w) => ({
          jp: str(w?.jp, ""),
          reading: str(w?.reading, ""),
          es: str(w?.es, ""),
        }))
        .filter((w) => w.jp || w.reading || w.es)
    : fallback;

function shuffle<T>(a: T[]): T[] {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function pickDistinct<T>(
  source: T[],
  count: number,
  notEqualTo?: T | T[],
  filter?: (x: T) => boolean
): T[] {
  const blacklist = new Set<T>(
    Array.isArray(notEqualTo) ? notEqualTo : notEqualTo ? [notEqualTo] : []
  );
  const pool = source.filter((x) => !blacklist.has(x) && (filter ? filter(x) : true));
  return shuffle(pool).slice(0, Math.max(0, count));
}

// ---------- componente ----------
export default function N1KanjiQuizScreen() {
  const nav = useNavigation<Nav>();
  const { params: rawParams } = useRoute() as any;

  // ---------- Normaliza/recupera datos del kanji ----------
  const safeData = useMemo(() => {
    // 1) toma params
    const inKanji = str(rawParams?.kanji, "");
    const inHex = str(rawParams?.hex, "");
    // 2) busca en el catálogo si falta algo
    let meta =
      N1_KANJI_META.find((m) => m.k === inKanji) ||
      N1_KANJI_META.find((m) => m.hex?.toLowerCase() === inHex.toLowerCase());

    // 3) arma paquete final seguro
    const id = str(rawParams?.id, meta ? meta.hex : inHex || inKanji || "n1-item");
    const hex = str(inHex || meta?.hex, "0000");
    const kanji = str(inKanji || meta?.k, "※");
    const on = arr(rawParams?.on, arr(meta?.on, ["—"]));
    const kun = arr(rawParams?.kun, arr(meta?.kun, ["—"]));
    const es = str(rawParams?.es, str(meta?.es, "—"));
    const words = wordsArr(rawParams?.words, wordsArr(meta?.words, []));

    // asegura al menos 1 palabra para las preguntas
    const safeWords: Word[] =
      words.length > 0
        ? words
        : [
            {
              jp: `${kanji}例`,
              reading: "れい",
              es: "ejemplo",
            },
          ];

    return { id, hex, kanji, on, kun, es, words: safeWords };
  }, [rawParams]);

  const { id, hex, kanji, on, kun, es, words } = safeData;

  // Sonidos y animaciones
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const scaleOk = useRef(new Animated.Value(0)).current;
  const scaleWrong = useRef(new Animated.Value(0)).current;

  const popOk = () => {
    scaleOk.setValue(0);
    Animated.spring(scaleOk, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start(
      () => Animated.timing(scaleOk, { toValue: 0, duration: 220, useNativeDriver: true }).start()
    );
  };
  const popWrong = () => {
    scaleWrong.setValue(0);
    Animated.spring(scaleWrong, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start(
      () => Animated.timing(scaleWrong, { toValue: 0, duration: 220, useNativeDriver: true }).start()
    );
  };

  // Para distractores
  const others = useMemo(() => N1_KANJI_META.filter((m) => m.k !== kanji), [kanji]);

  type Question = {
    id: string;
    prompt: string;
    subtitle?: string;
    options: string[];
    correctIndex: number;
  };

  const questions: Question[] = useMemo(() => {
    // --- 1) ON ---
    const onCorrect = str(on[0], "—");
    const onDistr = pickDistinct(
      others.flatMap((e) => e.on).map((x) => str(x)),
      3,
      onCorrect,
      (x) => !!x && x !== "—"
    );
    const onOpts = shuffle([onCorrect, ...onDistr]).map((s) => str(s));
    const q1: Question = {
      id: "q1",
      prompt: `¿Cuál es una lectura ON de 「${kanji}」?`,
      options: onOpts,
      correctIndex: Math.max(0, onOpts.indexOf(onCorrect)),
    };

    // --- 2) KUN ---
    const kunCorrect = str(kun[0], "—");
    const kunDistr = pickDistinct(
      others.flatMap((e) => e.kun).map((x) => str(x)),
      3,
      kunCorrect,
      (x) => !!x && x !== "—"
    );
    const kunOpts = shuffle([kunCorrect, ...kunDistr]).map((s) => str(s));
    const q2: Question = {
      id: "q2",
      prompt: `¿Cuál es una lectura KUN de 「${kanji}」?`,
      options: kunOpts,
      correctIndex: Math.max(0, kunOpts.indexOf(kunCorrect)),
    };

    // --- 3) Significado ES ---
    const esCorrect = str(es, "—");
    const esDistr = pickDistinct(
      others.map((e) => str(e.es)).filter((x) => !!x && x !== "—"),
      3,
      esCorrect
    );
    const esOpts = shuffle([esCorrect, ...esDistr]).map((s) => str(s));
    const q3: Question = {
      id: "q3",
      prompt: `Elige el significado principal de 「${kanji}」`,
      options: esOpts,
      correctIndex: Math.max(0, esOpts.indexOf(esCorrect)),
    };

    // --- 4) Lectura de ejemplo ---
    const w1 = words[0];
    const w1Correct = str(w1.reading, "—");
    const wReadDistr = pickDistinct(
      others.flatMap((e) => e.words.map((w) => str(w.reading))).filter((x) => !!x && x !== "—"),
      3,
      w1Correct
    );
    const wReadOpts = shuffle([w1Correct, ...wReadDistr]).map((s) => str(s));
    const q4: Question = {
      id: "q4",
      prompt: `¿Cuál es la lectura de ${str(w1.jp, "—")}?`,
      subtitle: `Significado: ${str(w1.es, "—")}`,
      options: wReadOpts,
      correctIndex: Math.max(0, wReadOpts.indexOf(w1Correct)),
    };

    // --- 5) Palabra JP por significado ---
    const w2 = words[1] ?? words[0];
    const w2Correct = str(w2.jp, "—");
    const wJpDistr = pickDistinct(
      others.flatMap((e) => e.words.map((w) => str(w.jp))).filter((x) => !!x && x !== "—"),
      3,
      w2Correct
    );
    const wJpOpts = shuffle([w2Correct, ...wJpDistr]).map((s) => str(s));
    const q5: Question = {
      id: "q5",
      prompt: `¿Cuál palabra (JP) corresponde a: “${str(w2.es, "—")}”?`,
      options: wJpOpts,
      correctIndex: Math.max(0, wJpOpts.indexOf(w2Correct)),
    };

    // --- 6) ¿Cuál contiene el kanji? ---
    const withKanji = str(words[2]?.jp || `${kanji}語`, `${kanji}語`);
    const notContaining = pickDistinct(
      others.flatMap((e) => e.words.map((w) => str(w.jp))).filter((jp) => !!jp && !jp.includes(kanji)),
      3
    ).map((s) => str(s, "—"));
    const containOpts = shuffle([withKanji, ...notContaining]).map((s) => str(s));
    const q6: Question = {
      id: "q6",
      prompt: `Elige la opción que contiene el kanji 「${kanji}」`,
      options: containOpts,
      correctIndex: Math.max(0, containOpts.indexOf(withKanji)),
    };

    // Garantiza 4 opciones llenando con "—" si hiciera falta
    const normalize = (q: Question): Question => {
      const filled = [...q.options];
      while (filled.length < 4) filled.push("—");
      return { ...q, options: filled.slice(0, 4) };
    };

    return [q1, q2, q3, q4, q5, q6].map(normalize);
  }, [kanji, on, kun, es, words, others]);

  // estado del quiz
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const current = questions[index];

  const onSelect = async (i: number) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);

    const isCorrect = i === current.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (ready) await playCorrect();
      popOk();
    } else {
      if (ready) await playWrong();
      popWrong();
    }

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((x) => x + 1);
        setSelected(null);
        setLocked(false);
      } else {
        // final
        setLocked(true);
      }
    }, 650);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setLocked(false);
  };

  const progressPct = Math.round(((index + (locked ? 1 : 0)) / questions.length) * 100);

  // ----------- Pantalla final -----------
  if (index === questions.length - 1 && locked) {
    return (
      <View style={styles.wrap}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#0B0F19", "#0f1724"]} style={StyleSheet.absoluteFillObject} />

        <View style={styles.header}>
          <Text style={styles.badge}>N1 · QUIZ</Text>
          <Text style={styles.title}>Resultados</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.bigKanji}>{kanji}</Text>
          <Text style={styles.scoreTxt}>
            {score} / {questions.length}
          </Text>
          <Text style={styles.scoreSub}>
            {score <= 2 ? "¡A practicarlo más!" : score <= 4 ? "¡Buen avance!" : "¡Excelente dominio!"}
          </Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={restart}>
              <Text style={styles.btnGhostTxt}>Reintentar</Text>
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

        <View style={styles.footer}>
          <Pressable style={styles.pill} onPress={() => nav.goBack()}>
            <Text style={styles.pillTxt}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ----------- Pantalla quiz -----------
  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0B0F19", "#0f1724"]} style={StyleSheet.absoluteFillObject} />

      {/* Presentación (como te gustó) */}
      <View style={styles.topCard}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.bigKanji}>{kanji}</Text>
          <Pressable style={styles.pill} onPress={() => nav.goBack()}>
            <Text style={styles.pillTxt}>Salir</Text>
          </Pressable>
        </View>
        <Text style={styles.mean}>{es}</Text>
        <View style={styles.readRow}>
          <Text style={styles.readLbl}>ON:</Text>
          <Text style={styles.readTxt}>{on.length ? on.join("・") : "—"}</Text>
        </View>
        <View style={styles.readRow}>
          <Text style={styles.readLbl}>KUN:</Text>
          <Text style={styles.readTxt}>{kun.length ? kun.join("・") : "—"}</Text>
        </View>
      </View>

      {/* Progreso */}
      <View style={styles.progressBox}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${(index / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressTxt}>
          {index + 1} / {questions.length} · {progressPct}%
        </Text>
      </View>

      {/* Pregunta */}
      <View style={styles.promptCard}>
        <Text style={styles.prompt}>{current.prompt}</Text>
        {!!current.subtitle && <Text style={styles.promptSub}>{current.subtitle}</Text>}
      </View>

      {/* Feedback */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burstOk,
          { transform: [{ scale: scaleOk.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
        ]}
      >
        <Text style={styles.burstOkTxt}>¡Correcto!</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burstWrong,
          { transform: [{ scale: scaleWrong.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
        ]}
      >
        <Text style={styles.burstWrongTxt}>Ups…</Text>
      </Animated.View>

      {/* Opciones */}
      <View style={styles.options}>
        {current.options.map((opt, i) => {
          const isSel = selected === i;
          const isCorrect = current.correctIndex === i;
          const show = selected !== null;

          const box = [styles.optBtn];
          if (show && isCorrect) box.push(styles.optCorrect);
          else if (show && isSel && !isCorrect) box.push(styles.optWrong);
          else if (isSel) box.push(styles.optSelected);

          return (
            <Pressable key={`${current.id}-${i}`} style={box} disabled={locked} onPress={() => onSelect(i)}>
              <Text
                style={[
                  styles.optTxt,
                  show && isCorrect ? styles.optTxtCorrect : undefined,
                  show && isSel && !isCorrect ? styles.optTxtWrong : undefined,
                ]}
                numberOfLines={3}
              >
                {str(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer} />
    </View>
  );
}

// ---------- estilos ----------
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19" },

  // top presentation
  topCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
  },
  bigKanji: { color: "#FFFFFF", fontSize: 54, fontWeight: "900" },
  mean: { color: "rgba(255,255,255,0.92)", fontWeight: "800", marginTop: 4 },
  readRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  readLbl: { color: "rgba(255,255,255,0.66)", fontWeight: "900" },
  readTxt: { color: "#EAF1FF", fontWeight: "800", flexShrink: 1 },

  // header tiny
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
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 8 },

  // progress
  progressBox: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, overflow: "hidden" },
  progressBar: { height: 8, backgroundColor: "#2B7FFF", borderRadius: 999 },
  progressTxt: { color: "rgba(255,255,255,0.72)", fontWeight: "800" },

  // prompt
  promptCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
  },
  prompt: { color: "#EAF1FF", fontWeight: "900", fontSize: 18, lineHeight: 24 },
  promptSub: { color: "rgba(255,255,255,0.78)", marginTop: 6, fontSize: 13 },

  // options
  options: { paddingHorizontal: 16, gap: 10, marginTop: 10 },
  optBtn: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
  },
  optSelected: { borderColor: "rgba(43,127,255,0.85)", backgroundColor: "rgba(43,127,255,0.12)" },
  optCorrect: { borderColor: "rgba(51,218,198,0.9)", backgroundColor: "rgba(51,218,198,0.10)" },
  optWrong: { borderColor: "rgba(255,86,86,0.9)", backgroundColor: "rgba(255,86,86,0.10)" },
  optTxt: { color: "#EAF1FF", fontWeight: "900", fontSize: 16 },
  optTxtCorrect: { color: "#CFFAF4" },
  optTxtWrong: { color: "#FFD7D7" },

  // bursts
  burstOk: {
    position: "absolute",
    top: 140,
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
    top: 140,
    right: 16,
    backgroundColor: "rgba(255,86,86,0.12)",
    borderColor: "rgba(255,86,86,0.9)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  burstWrongTxt: { color: "#FFD7D7", fontWeight: "900" },

  // result
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
  scoreTxt: { color: "#EAF1FF", fontWeight: "900", fontSize: 20, marginTop: 8 },
  scoreSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  row: { flexDirection: "row", gap: 10, width: "100%", marginTop: 14 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.18)" },
  btnGhostTxt: { color: "#EAF1FF", fontWeight: "900" },
  btnPrimary: { backgroundColor: "#2B7FFF", borderColor: "rgba(255,255,255,0)" },
  btnPrimaryTxt: { color: "#EAF1FF", fontWeight: "900" },

  // footer
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
