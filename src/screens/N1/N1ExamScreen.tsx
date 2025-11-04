// src/screens/N1/N1ExamScreen.tsx
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

/* --------- TYPES --------- */
type QType = "kanji" | "vocab" | "grammar" | "reading" | "mixed";
type Q = {
  id: string;
  type: QType;
  prompt: string;
  choices: string[];
  answerIndex: number;
  tip?: string;
};

/* ---------- HELPERS ---------- */
const { width } = Dimensions.get("window");

// Duración por actividad (minutos)
const MINUTES_PER_ACTIVITY = 12; // 12 min x 5 = 60 min total aprox

const COLORS = {
  bg: "#0B0F19",
  card: "#111727",
  border: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.78)",
  hair: "rgba(255,255,255,0.08)",
  primary: "#2B7FFF",
  pillBg: "rgba(99,102,241,0.18)",
  pillBd: "rgba(99,102,241,0.35)",
  sel: "#2742A0",
  ok: "#1F7A3D",
  bad: "#7A1F1F",
};

/* ---------- SEEDS (unas cuantas reales por actividad) ---------- */
// 1) KANJI
const SEED_KANJI: Q[] = [
  { id: "k1", type: "kanji", prompt: "【難航】の読みは？", choices: ["なんこう", "なんかん", "むずこう", "こんなん"], answerIndex: 0, tip: "『航』= 船/飛行。" },
  { id: "k2", type: "kanji", prompt: "【緩和】の意味は？", choices: ["ゆるめること", "強めること", "置き換えること", "まとめること"], answerIndex: 0 },
  { id: "k3", type: "kanji", prompt: "【阻む】の読みは？", choices: ["はばむ", "さまたげる", "とどこおる", "ふせぐ"], answerIndex: 0 },
  { id: "k4", type: "kanji", prompt: "【是正】の最も近い意味は？", choices: ["正すこと", "示すこと", "増やすこと", "除くこと"], answerIndex: 0 },
  { id: "k5", type: "kanji", prompt: "【堅調】の反対語に最も近いのは？", choices: ["不振", "順調", "上昇", "回復"], answerIndex: 0 },
];

// 2) VOCAB
const SEED_VOCAB: Q[] = [
  { id: "v1", type: "vocab", prompt: "最も近い意味：『示唆する』", choices: ["ほのめかす", "拒否する", "主張する", "模倣する"], answerIndex: 0 },
  { id: "v2", type: "vocab", prompt: "『遺憾』に最も近いのは？", choices: ["残念だ", "喜ばしい", "退屈だ", "羨ましい"], answerIndex: 0 },
  { id: "v3", type: "vocab", prompt: "『妥当』の反対に近いのは？", choices: ["不当", "適正", "適当", "有効"], answerIndex: 0 },
  { id: "v4", type: "vocab", prompt: "『精査』の意味として正しいのは？", choices: ["詳しく調べる", "略す", "雑に見る", "削る"], answerIndex: 0 },
  { id: "v5", type: "vocab", prompt: "『示談』は？", choices: ["当事者間の合意", "公開討論", "裁判官の評決", "世論調査"], answerIndex: 0 },
];

// 3) GRAMMAR
const SEED_GRAMMAR: Q[] = [
  { id: "g1", type: "grammar", prompt: "文法：『〜(の)いかんによらず』の用法は？", choices: ["〜に関係なく", "〜のおかげで", "〜に先立って", "〜にしては"], answerIndex: 0 },
  { id: "g2", type: "grammar", prompt: "文法：『〜ずじまい』の意味は？", choices: ["結局〜しなかった", "ぜひ〜したい", "うっかり〜した", "ほとんど〜しない"], answerIndex: 0 },
  { id: "g3", type: "grammar", prompt: "文法：『〜にあって』の用法は？", choices: ["特定の状況で", "対比", "原因", "仮定"], answerIndex: 0 },
  { id: "g4", type: "grammar", prompt: "文法：『〜きらいがある』は？", choices: ["よくない傾向がある", "確実に起こる", "稀にある", "望ましい傾向"], answerIndex: 0 },
  { id: "g5", type: "grammar", prompt: "文法：『〜を余儀なくされる』は？", choices: ["仕方なく〜する", "望んで〜する", "気軽に〜する", "無理に〜しない"], answerIndex: 0 },
];

// 4) READING
const SEED_READING: Q[] = [
  { id: "r1", type: "reading", prompt: "『短期的利益がある一方、長期的持続性に疑問』意図は？", choices: ["長期的課題の指摘", "全面支持", "利益否定", "責任断定"], answerIndex: 0 },
  { id: "r2", type: "reading", prompt: "『透明性の確保は信頼に直結する』趣旨は？", choices: ["透明性→信頼", "価格のみ", "修辞重視", "逸話中心"], answerIndex: 0 },
  { id: "r3", type: "reading", prompt: "『現場実態に即した見直し』最も近いのは？", choices: ["データに基づく修正", "印象で判断", "一律運用", "偶然性重視"], answerIndex: 0 },
  { id: "r4", type: "reading", prompt: "『多様性を受け入れることが創造性の土壌』何を主張？", choices: ["創造性の促進", "同一性の維持", "多様性の否定", "規律の強化"], answerIndex: 0 },
  { id: "r5", type: "reading", prompt: "『利害が交錯し調整が不可欠』は？", choices: ["利害調整の必要性", "放置を推奨", "対話不要", "偶然で解決"], answerIndex: 0 },
];

// 5) MIXED (combinado)
const SEED_MIXED: Q[] = [
  { id: "m1", type: "mixed", prompt: "【逼迫】の読みは？", choices: ["ひっぱく", "はくはく", "ひつぱく", "びっぱく"], answerIndex: 0, tip: "N1ビジネス文脈で頻出。" },
  { id: "m2", type: "mixed", prompt: "『看過できない』の最も近い意味は？", choices: ["見逃せない", "見当違いだ", "見栄えがいい", "見込みがない"], answerIndex: 0 },
  { id: "m3", type: "mixed", prompt: "『〜といえども』の用法は？", choices: ["たとえ〜でも", "〜であればこそ", "〜に限って", "〜とはいえ"], answerIndex: 0 },
  { id: "m4", type: "mixed", prompt: "読解：『反証可能性は科学の条件』意味は？", choices: ["反証可能であるべき", "反証は不要", "反証は困難", "反証は禁じる"], answerIndex: 0 },
  { id: "m5", type: "mixed", prompt: "語彙：『峻別』の意味は？", choices: ["はっきり区別する", "曖昧にする", "統合する", "棚上げする"], answerIndex: 0 },
];

/* ---------- expandTo30: duplica semillas variando enunciado/ID ---------- */
function expandTo30(seed: Q[], kind: QType): Q[] {
  const out: Q[] = [];
  const need = 30;
  let i = 0;
  while (out.length < need) {
    const base = seed[i % seed.length];
    const n = Math.floor(out.length / seed.length) + 1;
    out.push({
      ...base,
      id: `${kind}-${out.length + 1}`,
      prompt:
        out.length < seed.length
          ? base.prompt
          : `${base.prompt}（バリエーション${n}）`,
    });
    i++;
  }
  return out;
}

/* ---------- Construimos las 5 actividades (30 c/u) ---------- */
const BANK = {
  kanji: expandTo30(SEED_KANJI, "kanji"),
  vocab: expandTo30(SEED_VOCAB, "vocab"),
  grammar: expandTo30(SEED_GRAMMAR, "grammar"),
  reading: expandTo30(SEED_READING, "reading"),
  mixed: expandTo30(SEED_MIXED, "mixed"),
};
const ACTIVITY_KEYS = ["kanji", "vocab", "grammar", "reading", "mixed"] as const;
type ActivityKey = typeof ACTIVITY_KEYS[number];

function titleFor(k: ActivityKey) {
  switch (k) {
    case "kanji":
      return "Actividad 1 · Kanji (30)";
    case "vocab":
      return "Actividad 2 · Vocabulario (30)";
    case "grammar":
      return "Actividad 3 · Gramática (30)";
    case "reading":
      return "Actividad 4 · Lectura (30)";
    case "mixed":
      return "Actividad 5 · Mixta (30)";
  }
}

/* ---------- Componente ---------- */
export default function N1ExamScreen() {
  const nav = useNavigation<Nav>();

  // pestaña/actividad activa
  const [tab, setTab] = useState<ActivityKey>("kanji");

  // estados por actividad
  type ActState = {
    answers: Record<string, number | undefined>;
    submitted: boolean;
    secondsLeft: number;
  };
  const initAct = (): ActState => ({
    answers: {},
    submitted: false,
    secondsLeft: MINUTES_PER_ACTIVITY * 60,
  });

  const [kanjiS, setKanjiS] = useState<ActState>(initAct());
  const [vocabS, setVocabS] = useState<ActState>(initAct());
  const [grammarS, setGrammarS] = useState<ActState>(initAct());
  const [readingS, setReadingS] = useState<ActState>(initAct());
  const [mixedS, setMixedS] = useState<ActState>(initAct());

  const stateMap: Record<ActivityKey, [ActState, React.Dispatch<React.SetStateAction<ActState>>]> =
    {
      kanji: [kanjiS, setKanjiS],
      vocab: [vocabS, setVocabS],
      grammar: [grammarS, setGrammarS],
      reading: [readingS, setReadingS],
      mixed: [mixedS, setMixedS],
    };

  // timer por actividad (solo corre la activa y no enviada)
  useEffect(() => {
    const [st, setSt] = stateMap[tab];
    if (st.submitted) return;
    const id = setInterval(() => {
      setSt((prev) => {
        if (prev.submitted) return prev;
        const next = prev.secondsLeft - 1;
        if (next <= 0) {
          clearInterval(id);
          // auto entregar
          return { ...prev, submitted: true, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: next };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [tab]); // eslint-disable-line

  // helpers para actividad activa
  const data = BANK[tab];
  const [st, setSt] = stateMap[tab];

  const mmss = useMemo(() => {
    const m = Math.floor(st.secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (st.secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [st.secondsLeft]);

  const correctCount = useMemo(() => {
    return data.reduce((acc, q) => {
      const ai = st.answers[q.id];
      return acc + (ai === q.answerIndex ? 1 : 0);
    }, 0);
  }, [st.answers, tab]);

  const percent = Math.round((correctCount / data.length) * 100);

  const selectChoice = (qid: string, idx: number) => {
    if (st.submitted) return;
    setSt((prev) => ({
      ...prev,
      answers: { ...prev.answers, [qid]: prev.answers[qid] === idx ? undefined : idx },
    }));
  };

  const submitCurrent = (auto = false) => {
    if (st.submitted) return;
    setSt((prev) => ({ ...prev, submitted: true }));
    if (!auto) {
      Alert.alert(
        "Actividad entregada",
        `${titleFor(tab)}\nAciertos: ${correctCount}/${data.length} (${percent}%)`,
        [{ text: "OK" }]
      );
    }
  };

  const resetCurrent = () => {
    setSt(initAct());
  };

  // totalizador global (cuando las 5 actividades estén entregadas)
  const allStates = [kanjiS, vocabS, grammarS, readingS, mixedS];
  const allSubmitted = allStates.every((s) => s.submitted);
  const totalCorrect = useMemo(() => {
    let sum = 0;
    sum += BANK.kanji.reduce((a, q) => a + ((kanjiS.answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    sum += BANK.vocab.reduce((a, q) => a + ((vocabS.answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    sum += BANK.grammar.reduce((a, q) => a + ((grammarS.answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    sum += BANK.reading.reduce((a, q) => a + ((readingS.answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    sum += BANK.mixed.reduce((a, q) => a + ((mixedS.answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    return sum;
  }, [kanjiS, vocabS, grammarS, readingS, mixedS]);

  const deliverAll = () => {
    const total = 150;
    const percent = Math.round((totalCorrect / total) * 100);
    Alert.alert("Examen N1 entregado", `Aciertos: ${totalCorrect}/${total} (${percent}%)`, [
      { text: "Volver a N1 Home", onPress: () => nav.replace("N1Home") },
      {
        text: "Reintentar todo",
        onPress: () => {
          setKanjiS(initAct());
          setVocabS(initAct());
          setGrammarS(initAct());
          setReadingS(initAct());
          setMixedS(initAct());
          setTab("kanji");
        },
      },
    ]);
  };

  /* ---------- UI ---------- */
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Examen N1 · Nivel Dragón</Text>
      <View style={styles.timerPill}>
        <Text style={styles.timerTxt}>{mmss}</Text>
      </View>
    </View>
  );

  const Segments = () => (
    <View style={styles.tabs}>
      {ACTIVITY_KEYS.map((k) => {
        const active = tab === k;
        return (
          <Pressable
            key={k}
            onPress={() => setTab(k)}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
          >
            <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>
              {titleFor(k).split(" · ")[0].replace("Actividad ", "A")}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <Header />
      <Segments />

      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>{titleFor(tab)}</Text>
        <Text style={styles.progressTxt}>
          Aciertos: {correctCount}/{data.length} ({percent}%)
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 140 }}
        renderItem={({ item: q, index }) => {
          const sel = st.answers[q.id];
          const isCorrect = st.submitted && sel === q.answerIndex;
          const isWrong = st.submitted && sel != null && sel !== q.answerIndex;

          let bg = COLORS.card;
          if (!st.submitted && sel != null) bg = COLORS.sel;
          if (isCorrect) bg = COLORS.ok;
          if (isWrong) bg = COLORS.bad;

          return (
            <View style={styles.card}>
              <Text style={styles.qMeta}>
                {index + 1}/{data.length} · {q.type.toUpperCase()}
              </Text>
              <Text style={styles.prompt}>{q.prompt}</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {q.choices.map((c, i) => {
                  const chosen = sel === i;
                  const showSel = !st.submitted && chosen;
                  const showOk = st.submitted && i === q.answerIndex;
                  const showBad = st.submitted && chosen && i !== q.answerIndex;

                  let cbg = "#101827";
                  if (showSel) cbg = COLORS.sel;
                  if (showOk) cbg = COLORS.ok;
                  if (showBad) cbg = COLORS.bad;

                  return (
                    <Pressable
                      key={i}
                      style={[styles.choice, { backgroundColor: cbg }]}
                      onPress={() => selectChoice(q.id, i)}
                    >
                      <Text style={styles.choiceTxt}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {st.submitted && q.tip ? (
                <Text style={styles.tip}>💡 {q.tip}</Text>
              ) : null}
            </View>
          );
        }}
      />

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {!st.submitted ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={resetCurrent}>
              <Text style={styles.secondaryTxt}>Reiniciar actividad</Text>
            </Pressable>
            <Pressable style={[styles.primaryBtn, { flex: 1 }]} onPress={() => submitCurrent(false)}>
              <Text style={styles.primaryTxt}>Entregar actividad</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={() => setTab(nextTab(tab))}
            >
              <Text style={styles.secondaryTxt}>Siguiente actividad</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={() => {
                // permitir reintentar esta actividad
                setSt(initAct());
              }}
            >
              <Text style={styles.primaryTxt}>Reintentar esta</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 10 }} />
        <Pressable
          style={[
            styles.primaryBtn,
            { backgroundColor: allSubmitted ? COLORS.primary : "rgba(43,127,255,0.35)" },
          ]}
          onPress={deliverAll}
          disabled={!allSubmitted}
        >
          <Text style={styles.primaryTxt}>
            {allSubmitted
              ? `Entregar TODO (Total ${totalCorrect}/150)`
              : "Entrega total (habilitada cuando completes las 5)"}
          </Text>
        </Pressable>

        <View style={{ height: 8 }} />
        <Pressable style={styles.linkBtn} onPress={() => nav.replace("N1Home")}>
          <Text style={styles.linkTxt}>Volver a N1 Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

function nextTab(t: ActivityKey): ActivityKey {
  const idx = ACTIVITY_KEYS.indexOf(t);
  const next = (idx + 1) % ACTIVITY_KEYS.length;
  return ACTIVITY_KEYS[next];
}

/* --------- STYLES --------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: 64 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hair,
  },
  headerTitle: { color: COLORS.text, fontWeight: "900", fontSize: 16, letterSpacing: 0.3 },
  timerPill: {
    backgroundColor: COLORS.pillBg,
    borderColor: COLORS.pillBd,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerTxt: { color: "#C7D2FE", fontWeight: "800", letterSpacing: 0.3 },

  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hair,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "transparent",
  },
  tabBtnActive: {
    backgroundColor: "rgba(43,127,255,0.15)",
    borderColor: "rgba(43,127,255,0.6)",
  },
  tabTxt: { color: "rgba(255,255,255,0.86)", fontWeight: "800", letterSpacing: 0.2 },
  tabTxtActive: { color: "#DCEBFF" },

  tabHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabTitle: { color: "#EAF1FF", fontWeight: "900", fontSize: 16 },
  progressTxt: { color: "rgba(255,255,255,0.78)", fontWeight: "800" },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  qMeta: { color: "rgba(255,255,255,0.6)", fontWeight: "800", marginBottom: 6 },
  prompt: { color: COLORS.text, fontSize: 16, fontWeight: "900", lineHeight: 22 },

  choice: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primary,
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

  linkBtn: { paddingVertical: 10, alignItems: "center" },
  linkTxt: { color: "#BFD9FF", fontWeight: "900" },
});
