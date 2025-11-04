// src/screens/N1/N1QuickExam.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* --------- NAV TYPES --------- */
type RootStackParamList = {
  N1KanjiHub: undefined;
  N1QuickExam: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1QuickExam">;

/* --------- QUESTION TYPES --------- */
type Q = {
  id: string;
  type: "kanji" | "vocab" | "grammar" | "reading";
  prompt: string;
  choices: string[];
  answerIndex: number;
  tip?: string;
};

/* --------- BASE QUESTIONS (10) ---------
   Se replican/rotan para generar 40 ítems.
   Puedes sustituir este set por tu banco real y mantener el expand a 40. */
const BASE_QUESTIONS: Q[] = [
  {
    id: "b1",
    type: "kanji",
    prompt: "【難航】の読みは？",
    choices: ["なんこう", "なんかん", "むずこう", "こんなん"],
    answerIndex: 0,
    tip: "N1頻出の熟語。『航』= 船/飛行の意。",
  },
  {
    id: "b2",
    type: "vocab",
    prompt: "最も近い意味：『示唆する』",
    choices: ["ほのめかす", "拒否する", "主張する", "模倣する"],
    answerIndex: 0,
  },
  {
    id: "b3",
    type: "grammar",
    prompt: "文法：『～(の)いかんによらず』の用法に最も近いのは？",
    choices: ["〜に関係なく", "〜のおかげで", "〜に先立って", "〜にしては"],
    answerIndex: 0,
  },
  {
    id: "b4",
    type: "reading",
    prompt:
      "文章の意図：『当該政策は短期的な利益をもたらす一方、長期的な持続性に疑問が残る。』",
    choices: ["政策を全面的に支持している", "長期的課題を指摘している", "利益を否定している", "責任の所在を断定している"],
    answerIndex: 1,
  },
  {
    id: "b5",
    type: "kanji",
    prompt: "【緩和】の意味として最も近いのは？",
    choices: ["ゆるめること", "強めること", "置き換えること", "まとめること"],
    answerIndex: 0,
  },
  {
    id: "b6",
    type: "vocab",
    prompt: "最も近い意味：『遺憾』",
    choices: ["残念だ", "喜ばしい", "退屈だ", "面倒だ"],
    answerIndex: 0,
  },
  {
    id: "b7",
    type: "grammar",
    prompt: "文法：『〜にあって』の適切な用法は？",
    choices: ["特定の状況・立場で", "対比の強調で", "原因を示すとき", "仮定条件のとき"],
    answerIndex: 0,
  },
  {
    id: "b8",
    type: "reading",
    prompt:
      "『同調圧力に屈せず多様性を受け入れることが、創造性の土壌となる。』趣旨は？",
    choices: ["同一性の維持", "多様性の否定", "創造性の促進", "規律の強化"],
    answerIndex: 2,
  },
  {
    id: "b9",
    type: "kanji",
    prompt: "【阻む】の読みは？",
    choices: ["はばむ", "さまたげる", "とどこおる", "ふせぐ"],
    answerIndex: 0,
  },
  {
    id: "b10",
    type: "grammar",
    prompt: "文法：『〜ずじまい』の意味は？",
    choices: ["結局〜しなかった", "ぜひ〜したい", "たまたま〜してしまった", "ほとんど〜しない"],
    answerIndex: 0,
  },
];

/* --------- EXPAND A 40 --------- */
function expandTo40(base: Q[]): Q[] {
  const out: Q[] = [];
  const target = 40;
  for (let i = 0; i < target; i++) {
    const b = base[i % base.length];
    out.push({
      ...b,
      id: `q${i + 1}`,
      // Variación mínima en opciones para evitar IDs idénticos
      choices:
        i < base.length
          ? b.choices
          : [...b.choices].map((c, idx) => (idx === 0 && i % 2 === 1 ? c + "・" : c)),
    });
  }
  return out;
}

const QUESTIONS: Q[] = expandTo40(BASE_QUESTIONS);

/* --------- CONSTS --------- */
const MINUTES = 25; // ⏱️ 25 minutos
const PALETTE = {
  bg: "#0B0F19",
  card: "#111727",
  border: "rgba(255,255,255,0.06)",
  blue: "#2B7FFF",
  ok: "#1F7A3D",
  wrong: "#7A1F1F",
  text: "#FFFFFF",
};

export default function N1QuickExam() {
  const nav = useNavigation<Nav>();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MINUTES * 60);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = useMemo(
    () =>
      QUESTIONS.reduce((acc, q) => {
        const ai = answers[q.id];
        return acc + (ai === q.answerIndex ? 1 : 0);
      }, 0),
    [answers]
  );

  /* ---------- Timer ---------- */
  useEffect(() => {
    if (!started || submitted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, submitted]);

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  /* ---------- Actions ---------- */
  const startExam = () => setStarted(true);

  const selectChoice = (qid: string, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: prev[qid] === idx ? undefined : idx }));
  };

  const handleSubmit = (auto = false) => {
    setSubmitted(true);
    const total = QUESTIONS.length;
    const score = correctCount;
    const percent = Math.round((score / total) * 100);

    const title = auto ? "Tiempo agotado" : "Examen entregado";
    const msg = `Aciertos: ${score}/${total}  (${percent}%)`;

    Alert.alert(title, msg, [
      { text: "Revisar después", onPress: () => {} },
      {
        text: "Volver al Centro de Kanji",
        onPress: () => nav.replace("N1KanjiHub"),
      },
    ]);
  };

  /* ---------- UI ---------- */
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Examen Rápido · N1</Text>
      <View style={styles.timerPill}>
        <Text style={styles.timerTxt}>{mmss}</Text>
      </View>
    </View>
  );

  if (!started) {
    return (
      <View style={styles.wrap}>
        <StatusBar barStyle="light-content" />
        <Header />
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>Mock · 40 reactivos</Text>
          <Text style={styles.heroSub}>漢字・語彙・文法・読解 · {MINUTES} min</Text>
          <Pressable style={styles.primaryBtn} onPress={startExam}>
            <Text style={styles.primaryTxt}>Comenzar</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, { marginTop: 10 }]}
            onPress={() => nav.replace("N1KanjiHub")}
          >
            <Text style={styles.secondaryTxt}>Volver al Centro de Kanji</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <Header />

      <FlatList
        data={QUESTIONS}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        renderItem={({ item: q, index }) => {
          const selected = answers[q.id];
          return (
            <View style={styles.card}>
              <Text style={styles.qMeta}>
                {index + 1}/{QUESTIONS.length} · {q.type.toUpperCase()}
              </Text>
              <Text style={styles.prompt}>{q.prompt}</Text>

              <View style={{ gap: 8, marginTop: 8 }}>
                {q.choices.map((c, i) => {
                  const isSel = selected === i;
                  const isCorrect = submitted && i === q.answerIndex;
                  const isWrong = submitted && isSel && i !== q.answerIndex;

                  let bg = PALETTE.card;
                  if (isSel) bg = "#2742A0";
                  if (isCorrect) bg = PALETTE.ok;
                  if (isWrong) bg = PALETTE.wrong;

                  return (
                    <Pressable
                      key={i}
                      style={[styles.choice, { backgroundColor: bg }]}
                      onPress={() => selectChoice(q.id, i)}
                    >
                      <Text style={styles.choiceTxt}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {submitted && q.tip ? (
                <Text style={styles.tip}>💡 {q.tip}</Text>
              ) : null}
            </View>
          );
        }}
      />

      <View style={styles.bottomBar}>
        {!submitted ? (
          <Pressable style={styles.primaryBtn} onPress={() => handleSubmit(false)}>
            <Text style={styles.primaryTxt}>Entregar examen</Text>
          </Pressable>
        ) : (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => nav.replace("N1KanjiHub")}
            >
              <Text style={styles.secondaryTxt}>Centro de Kanji</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={() => {
                // reset
                const fresh: Record<string, number | undefined> = {};
                setAnswers(fresh);
                setSubmitted(false);
                setTimeLeft(MINUTES * 60);
                setStarted(true);
              }}
            >
              <Text style={styles.primaryTxt}>Reintentar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

/* --------- STYLES --------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: PALETTE.bg },

  header: {
    height: 64 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 16,
    backgroundColor: PALETTE.bg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16, letterSpacing: 0.3 },
  timerPill: {
    backgroundColor: "rgba(99,102,241,0.18)",
    borderColor: "rgba(99,102,241,0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerTxt: { color: "#C7D2FE", fontWeight: "800", letterSpacing: 0.3 },

  heroBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  heroTitle: { color: "white", fontSize: 22, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.78)", textAlign: "center" },

  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 14,
    marginBottom: 12,
  },
  qMeta: { color: "rgba(255,255,255,0.6)", fontWeight: "800", marginBottom: 6 },
  prompt: { color: "white", fontSize: 16, fontWeight: "900", lineHeight: 22 },

  choice: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  choiceTxt: { color: "#EAF1FF", fontWeight: "800" },
  tip: { color: "rgba(255,255,255,0.75)", marginTop: 8, fontStyle: "italic" },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  primaryBtn: {
    backgroundColor: PALETTE.blue,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.3 },

  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryTxt: { color: "rgba(255,255,255,0.9)", fontWeight: "900", letterSpacing: 0.3 },
});
