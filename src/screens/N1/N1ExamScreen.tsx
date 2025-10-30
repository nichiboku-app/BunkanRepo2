import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* --------- NAV TYPES --------- */
type RootStackParamList = {
  N1Home: undefined;
  N1Exam: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Exam">;

/* --------- MOCK QUESTIONS (DEMO) --------- */
type Q = {
  id: string;
  type: "kanji" | "vocab" | "grammar" | "reading";
  prompt: string;
  choices: string[];
  answerIndex: number;
  tip?: string;
};

const QUESTIONS: Q[] = [
  {
    id: "q1",
    type: "kanji",
    prompt: "【難航】の読みは？",
    choices: ["なんこう", "なんかん", "むずこう", "こんなん"],
    answerIndex: 0,
    tip: "N1頻出の熟語。『航』= 船/飛行の意。",
  },
  {
    id: "q2",
    type: "vocab",
    prompt: "最も近い意味：『示唆する』",
    choices: ["ほのめかす", "拒否する", "主張する", "模倣する"],
    answerIndex: 0,
  },
  {
    id: "q3",
    type: "grammar",
    prompt: "文法：『～(の)いかんによらず』の用法に最も近いのは？",
    choices: [
      "〜に関係なく",
      "〜のおかげで",
      "〜に先立って",
      "〜にしては",
    ],
    answerIndex: 0,
  },
  {
    id: "q4",
    type: "reading",
    prompt:
      "文章の意図：『当該政策は短期的な利益をもたらす一方、長期的な持続性に疑問が残る。』",
    choices: ["政策を全面的に支持している", "長期的課題を指摘している", "利益を否定している", "責任の所在を断定している"],
    answerIndex: 1,
  },
  {
    id: "q5",
    type: "kanji",
    prompt: "【緩和】の意味として最も近いのは？",
    choices: ["ゆるめること", "強めること", "置き換えること", "まとめること"],
    answerIndex: 0,
  },
  {
    id: "q6",
    type: "vocab",
    prompt: "最も近い意味：『遺憾』",
    choices: ["残念だ", "喜ばしい", "退屈だ", "面倒だ"],
    answerIndex: 0,
  },
  {
    id: "q7",
    type: "grammar",
    prompt: "文法：『〜にあって』の適切な用法は？",
    choices: [
      "特定の状況・立場で",
      "対比の強調で",
      "原因を示すとき",
      "仮定条件のとき",
    ],
    answerIndex: 0,
  },
  {
    id: "q8",
    type: "reading",
    prompt:
      "『同調圧力に屈せず多様性を受け入れることが、創造性の土壌となる。』趣旨は？",
    choices: ["同一性の維持", "多様性の否定", "創造性の促進", "規律の強化"],
    answerIndex: 2,
  },
  {
    id: "q9",
    type: "kanji",
    prompt: "【阻む】の読みは？",
    choices: ["はばむ", "さまたげる", "とどこおる", "ふせぐ"],
    answerIndex: 0,
  },
  {
    id: "q10",
    type: "grammar",
    prompt: "文法：『〜ずじまい』の意味は？",
    choices: ["結局〜しなかった", "ぜひ〜したい", "たまたま〜してしまった", "ほとんど〜しない"],
    answerIndex: 0,
  },
];

/* --------- UI HELPERS --------- */
const { width } = Dimensions.get("window");
const MINUTES = 10; // ⏱️ demo: 10 minutos para todo el examen

export default function N1ExamScreen() {
  const nav = useNavigation<Nav>();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MINUTES * 60); // seconds
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
  const startExam = () => {
    setStarted(true);
  };

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
      { text: "Revisar en casa", onPress: () => {} },
      { text: "Volver a N1 Home", style: "default", onPress: () => nav.replace("N1Home") },
    ]);
  };

  /* ---------- Renders ---------- */
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Examen N1 · Demo</Text>
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
          <Text style={styles.heroTitle}>Nivel Dragón · Mock Test</Text>
          <Text style={styles.heroSub}>
            10 reactivos mixtos (漢字・語彙・文法・読解) · {MINUTES} min
          </Text>
          <Pressable style={styles.primaryBtn} onPress={startExam}>
            <Text style={styles.primaryTxt}>Comenzar</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, { marginTop: 10 }]}
            onPress={() => nav.replace("N1Home")}
          >
            <Text style={styles.secondaryTxt}>Volver a N1 Home</Text>
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

                  let bg = "#101827";
                  if (isSel) bg = "#2742A0";
                  if (isCorrect) bg = "#1F7A3D";
                  if (isWrong) bg = "#7A1F1F";

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
              onPress={() => nav.replace("N1Home")}
            >
              <Text style={styles.secondaryTxt}>Volver a N1 Home</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={() => {
                setAnswers({});
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
  wrap: { flex: 1, backgroundColor: "#0B0F19" },

  header: {
    height: 64 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 16,
    backgroundColor: "#0B0F19",
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
    backgroundColor: "#111727",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
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
    borderColor: "rgba(255,255,255,0.06)",
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
    backgroundColor: "#2B7FFF",
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
