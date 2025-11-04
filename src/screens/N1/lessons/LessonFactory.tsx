import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

type RootStackParamList = { N1Home: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;

const { width } = Dimensions.get("window");
const PALETTE = {
  bg: "#0B0F19",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  blue: "#2B7FFF",
  aqua: "#33DAC6",
  text: "#FFFFFF",
};

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* ---------------- Types ---------------- */
export type GrammarPoint = {
  pat: string;
  uso: string;
  tradu: string;
  matices: string;
  difs?: string;
  ejJP: string;
  ejES: string;
};

export type VocabItem = {
  jp: string;
  reading: string;
  es: string;
};

export type RQ = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
};

export type Reading = {
  id: string;
  title: string;
  jp: string;
  es: string;
  questions: RQ[];
};

export type QuizQ = {
  id: string;
  type: "grammar" | "vocab" | "reading" | "usage";
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
  tip?: string;
};

export type LessonConfig = {
  title: string;
  kicker?: string;
  subtitle: string;
  hero: any; // require(...)
  vocab: VocabItem[];               // 20+
  grammar: GrammarPoint[];          // >= 7
  readings: Reading[];              // 3 × 5
  activities: {
    id: string;
    title: string;
    questions: QuizQ[];            // 8
  }[];
};

/* ---------------- UI mini-components ---------------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function WordCard({ w }: { w: VocabItem }) {
  return (
    <View style={styles.wordCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.wordJP}>
          {w.jp} <Text style={styles.wordRd}>{w.reading}</Text>
        </Text>
        <Text style={styles.wordES}>{w.es}</Text>
      </View>
      <Pressable style={styles.play} onPress={() => speakJP(w.jp)}>
        <Text style={styles.playTxt}>JP</Text>
      </Pressable>
      <Pressable style={styles.play} onPress={() => speakES(w.es)}>
        <Text style={styles.playTxt}>ES</Text>
      </Pressable>
    </View>
  );
}

function Choice({
  label,
  selected,
  state,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  state?: "neutral" | "correct" | "wrong";
  onPress: () => void;
  disabled?: boolean;
}) {
  let bg = "#101827";
  if (selected) bg = "#2742A0";
  if (state === "correct") bg = "#1F7A3D";
  if (state === "wrong") bg = "#7A1F1F";
  return (
    <Pressable style={[styles.choice, { backgroundColor: bg }]} onPress={onPress} disabled={!!disabled}>
      <Text style={styles.choiceTxt}>{label}</Text>
    </Pressable>
  );
}

function GrammarBlock({ data }: { data: GrammarPoint }) {
  return (
    <View style={styles.gramCard}>
      <Text style={styles.gramPat}>{data.pat}</Text>
      <Text style={styles.gramH}>¿Cuándo se usa?</Text>
      <Text style={styles.gramTxt}>{data.uso}</Text>
      <Text style={styles.gramH}>Traducción natural</Text>
      <Text style={styles.gramTxt}>{data.tradu}</Text>
      <Text style={styles.gramH}>Matices</Text>
      <Text style={styles.gramTxt}>{data.matices}</Text>
      {!!data.difs && (
        <>
          <Text style={styles.gramH}>Diferencias</Text>
          <Text style={styles.gramTxt}>{data.difs}</Text>
        </>
      )}

      {/* Audio buttons JP/ES */}
      <View style={styles.audioRow}>
        <Pressable style={styles.primaryBtn} onPress={() => speakJP(`${data.pat}。 ${data.ejJP}`)}>
          <Text style={styles.primaryTxt}>🔊 Escuchar JP</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={() => speakES(`${data.tradu}. Ejemplo: ${data.ejES}`)}>
          <Text style={styles.ghostTxt}>🔊 Explicación ES</Text>
        </Pressable>
      </View>

      <Text style={styles.gramExJP}>例) {data.ejJP}</Text>
      <Text style={styles.gramExES}>→ {data.ejES}</Text>
    </View>
  );
}

function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = useMemo(
    () => data.questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answers, data.questions]
  );

  const onPick = (q: RQ, idx: number) => {
    const isCorrect = idx === q.answerIndex;
    if (isCorrect) playCorrect(); else playWrong();
    setAnswers((p) => ({ ...p, [q.id]: idx }));
  };

  return (
    <View style={styles.readingCard}>
      <Text style={styles.readingTitle}>{data.title}</Text>
      <Text style={styles.listenJP}>{data.jp}</Text>

      <View style={styles.listenBtns}>
        <Pressable style={styles.primaryBtn} onPress={() => speakJP(data.jp)}>
          <Text style={styles.primaryTxt}>Reproducir lectura (JP)</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={() => setShowES((v) => !v)}>
          <Text style={styles.ghostTxt}>{showES ? "Ocultar traducción" : "Mostrar traducción"}</Text>
        </Pressable>
      </View>

      {showES && (
        <>
          <Text style={styles.listenESTitle}>Traducción (ES)</Text>
          <Text style={styles.listenES}>{data.es}</Text>
        </>
      )}

      <View style={{ height: 8 }} />
      {data.questions.map((q, idx) => {
        const sel = answers[q.id];
        const state: "neutral" | "correct" | "wrong" =
          sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
        return (
          <View key={q.id} style={styles.cardQ}>
            <Text style={styles.qMeta}>{idx + 1}/{data.questions.length} · LECTURA</Text>
            <Text style={styles.prompt}>{q.prompt}</Text>

            <View style={{ gap: 8, marginTop: 8 }}>
              {q.choices.map((c, i) => (
                <Choice
                  key={i}
                  label={c}
                  selected={sel === i && state === "neutral"}
                  state={sel === i ? state : "neutral"}
                  onPress={() => onPick(q, i)}
                />
              ))}
            </View>

            {sel != null && (
              <View style={styles.expBox}>
                <Text style={styles.expHeader}>
                  {sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}
                </Text>
                <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                <Text style={styles.expES}>【ES】{q.expES}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!submitted ? (
        <Pressable style={[styles.primaryBtn, { marginTop: 8 }]} onPress={() => setSubmitted(true)}>
          <Text style={styles.primaryTxt}>Entregar lectura</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.scoreTxt}>Resultado: {correctCount}/{data.questions.length}</Text>
          <Pressable
            style={[styles.ghostBtn, { marginTop: 6 }]}
            onPress={() => { setSubmitted(false); setAnswers({}); }}
          >
            <Text style={styles.ghostTxt}>Reintentar lectura</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ActivityBlock({ title, questions }: { title: string; questions: LessonConfig["activities"][number]["questions"] }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = useMemo(
    () => questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answers, questions]
  );

  const onPick = (q: LessonConfig["activities"][number]["questions"][number], idx: number) => {
    if (submitted) return;
    const ok = idx === q.answerIndex;
    if (ok) playCorrect(); else playWrong();
    setAnswers((p) => ({ ...p, [q.id]: idx }));
  };

  return (
    <View style={styles.activityCard}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={{ gap: 12 }}>
        {questions.map((q, idx) => {
          const sel = answers[q.id];
          const state: "neutral" | "correct" | "wrong" =
            sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
          return (
            <View key={q.id} style={styles.cardQ}>
              <Text style={styles.qMeta}>{idx + 1}/{questions.length} · {q.type.toUpperCase()}</Text>
              <Text style={styles.prompt}>{q.prompt}</Text>

              <View style={{ gap: 8, marginTop: 8 }}>
                {q.choices.map((c, i) => (
                  <Choice
                    key={i}
                    label={c}
                    selected={sel === i && state === "neutral"}
                    state={sel === i ? state : "neutral"}
                    onPress={() => onPick(q, i)}
                    disabled={submitted}
                  />
                ))}
              </View>

              {sel != null && (
                <View style={styles.expBox}>
                  <Text style={styles.expHeader}>
                    {sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}
                  </Text>
                  <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                  <Text style={styles.expES}>【ES】{q.expES}</Text>
                  {"tip" in q && q.tip ? <Text style={styles.tip}>💡 {q.tip}</Text> : null}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: 10 }} />
      {!submitted ? (
        <Pressable style={styles.primaryBtn} onPress={() => setSubmitted(true)}>
          <Text style={styles.primaryTxt}>Entregar actividad</Text>
        </Pressable>
      ) : (
        <Text style={styles.scoreTxt}>Resultado: {correctCount}/{questions.length}</Text>
      )}
    </View>
  );
}

/* ---------------- Main Factory ---------------- */
export default function LessonFactory(cfg: LessonConfig) {
  const nav = useNavigation<Nav>();

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{cfg.title}</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}>
          <Text style={styles.closeTxt}>Cerrar</Text>
        </Pressable>
      </View>

      <FlatList
        data={[{ key: "content" }]}
        keyExtractor={(it) => it.key}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={() => (
          <>
            {/* HERO */}
            <View style={styles.hero}>
              <ExpoImage source={cfg.hero} style={styles.heroImg} contentFit="cover" />
              <View style={styles.heroOverlay} pointerEvents="none" />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>{cfg.kicker ?? "N1 · Contenido avanzado"}</Text>
                <Text style={styles.heroTitle}>{cfg.title}</Text>
                <Text style={styles.heroSub}>{cfg.subtitle}</Text>
              </View>
            </View>

            {/* VOCABULARIO (20+) */}
            <Section title="Vocabulario clave (20+)">
              <View style={{ gap: 8 }}>
                {cfg.vocab.map((w, i) => <WordCard key={`${w.jp}-${i}`} w={w} />)}
              </View>
            </Section>

            {/* GRAMMAR */}
            <Section title="Gramática formal en contexto">
              <View style={{ gap: 12 }}>
                {cfg.grammar.map((g, i) => <GrammarBlock key={i} data={g} />)}
              </View>
            </Section>

            {/* READINGS */}
            <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
              <View style={{ gap: 14 }}>
                {cfg.readings.map((r) => <ReadingBlock key={r.id} data={r} />)}
              </View>
            </Section>

            {/* ACTIVITIES */}
            {cfg.activities.map((act) => (
              <Section key={act.id} title={act.title}>
                <ActivityBlock title={act.title} questions={act.questions} />
              </Section>
            ))}
          </>
        )}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: PALETTE.bg },

  topBar: {
    height: 56 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(8,12,18,0.8)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  topTitle: { color: "#EAF1FF", fontWeight: "900", fontSize: 18 },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  closeTxt: { color: "#BFD9FF", fontWeight: "800" },

  hero: {
    margin: 14,
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width, height: 220 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  heroIn: { flex: 1, padding: 16, justifyContent: "flex-end", gap: 6 },
  kicker: { color: "#C5FFF9", fontWeight: "900", letterSpacing: 0.6 },
  heroTitle: { color: "#FFF", fontSize: 26, lineHeight: 28, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.9)" },

  section: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16, marginBottom: 8 },

  /* vocab */
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: 10,
  },
  wordJP: { color: "#FFFFFF", fontWeight: "900" },
  wordRd: { color: "rgba(255,255,255,0.75)", fontWeight: "700" },
  wordES: { color: "rgba(255,255,255,0.9)" },
  play: { backgroundColor: "#2B7FFF", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  playTxt: { color: "#EAF1FF", fontWeight: "900" },

  /* gramática */
  gramCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
  },
  gramPat: { color: "#8FF1F2", fontWeight: "900", marginBottom: 6, fontSize: 15 },
  gramH: { color: "#CFE4FF", fontWeight: "900", marginTop: 2 },
  gramTxt: { color: "rgba(255,255,255,0.9)" },
  gramExJP: { color: "#FFFFFF", marginTop: 6, fontWeight: "900" },
  gramExES: { color: "rgba(255,255,255,0.9)" },
  audioRow: { flexDirection: "row", gap: 10, marginVertical: 8, flexWrap: "wrap" },

  /* lectura */
  readingCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  readingTitle: { color: "#EAF1FF", fontWeight: "900", marginBottom: 8, fontSize: 15 },
  listenJP: { color: "#FFFFFF", lineHeight: 20, fontWeight: "700" },
  listenBtns: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 8, flexWrap: "wrap" },
  listenESTitle: { color: "CFE4FF", fontWeight: "900", marginTop: 6, marginBottom: 4 },
  listenES: { color: "rgba(255,255,255,0.9)", lineHeight: 20 },

  /* preguntas */
  cardQ: {
    backgroundColor: "#111727",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
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

  expBox: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  expHeader: { color: "#EAF1FF", fontWeight: "900" },
  expJP: { color: "#FFFFFF" },
  expES: { color: "rgba(255,255,255,0.92)" },

  scoreTxt: { color: "#D3FFF7", fontWeight: "900", textAlign: "center", marginTop: 8 },

  /* botones */
  primaryBtn: {
    backgroundColor: PALETTE.blue,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.3 },
  ghostBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostTxt: { color: "rgba(255,255,255,0.9)", fontWeight: "900", letterSpacing: 0.3 },
});