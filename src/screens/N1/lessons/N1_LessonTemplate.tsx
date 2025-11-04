// N1_LessonBase.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

import type { RootStackParamList } from "../../../../types";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";
import { coverFor } from "../covers";

type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;
const { width } = Dimensions.get("window");

const PALETTE = {
  bg: "#0B0F19",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  blue: "#2B7FFF",
};

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* ---------- Tipos de datos ---------- */
export type Vocab = { jp: string; reading: string; es: string };
export type GPoint = { pat: string; uso: string; tradu: string; matices: string; ejJP: string; ejES: string };
export type RQ = { id: string; prompt: string; choices: string[]; answerIndex: number; expJP: string; expES: string };
export type Reading = { id: string; title: string; jp: string; es: string; questions: RQ[] };
export type Q = { id: string; type: "kanji" | "vocab" | "grammar" | "reading"; prompt: string; choices: string[]; answerIndex: number; expJP: string; expES: string; tip?: string };

export type LessonProps = {
  headerTitle: string;        // Título de la appbar
  heroKicker: string;         // Linea superior
  heroTitle: string;          // Título grande
  heroSub: string;            // Subtítulo
  coverKey: string;           // key para coverFor()
  vocab: Vocab[];             // 20
  grammar: GPoint[];          // 7
  readings: Reading[];        // 3 (5 preguntas c/u)
  activityA: Q[];             // 8
  activityB: Q[];             // 8
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PillBtn({
  label,
  onPress,
  kind = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[
        kind === "primary" ? styles.primaryBtn : styles.ghostBtn,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={kind === "primary" ? styles.primaryTxt : styles.ghostTxt}>{label}</Text>
    </Pressable>
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

function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const correctCount = useMemo(
    () => data.questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answers, data.questions]
  );
  const onPick = (q: RQ, idx: number) => {
    const ok = idx === q.answerIndex;
    ok ? playCorrect() : playWrong();
    setAnswers((p) => ({ ...p, [q.id]: idx }));
  };

  return (
    <View style={styles.readingCard}>
      <Text style={styles.readingTitle}>{data.title}</Text>

      <Text style={styles.listenJP}>{data.jp}</Text>
      <View style={styles.listenBtns}>
        <PillBtn label="Reproducir lectura (JP)" onPress={() => speakJP(data.jp)} />
        <PillBtn label={showES ? "Ocultar traducción" : "Mostrar traducción"} kind="ghost" onPress={() => setShowES(v => !v)} />
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
            <Text style={styles.qMeta}>
              {idx + 1}/{data.questions.length} · LECTURA
            </Text>
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

      <Text style={styles.scoreTxt}>Resultado: {correctCount}/{data.questions.length}</Text>
    </View>
  );
}

export default function N1_LessonBase(props: LessonProps) {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const [answersA, setAnswersA] = useState<Record<string, number | undefined>>({});
  const [answersB, setAnswersB] = useState<Record<string, number | undefined>>({});

  const scoreA = useMemo(
    () => props.activityA.reduce((acc, q) => acc + ((answersA[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answersA, props.activityA]
  );
  const scoreB = useMemo(
    () => props.activityB.reduce((acc, q) => acc + ((answersB[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answersB, props.activityB]
  );

  const onPickA = (q: Q, i: number) => {
    (i === q.answerIndex ? playCorrect() : playWrong());
    setAnswersA(p => ({ ...p, [q.id]: i }));
  };
  const onPickB = (q: Q, i: number) => {
    (i === q.answerIndex ? playCorrect() : playWrong());
    setAnswersB(p => ({ ...p, [q.id]: i }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{props.headerTitle}</Text>
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
              <ExpoImage source={coverFor(props.coverKey)} style={styles.heroImg} contentFit="cover" />
              <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject} />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>{props.heroKicker}</Text>
                <Text style={styles.heroTitle}>{props.heroTitle}</Text>
                <Text style={styles.heroSub}>{props.heroSub}</Text>
              </View>
            </View>

            {/* VOCAB */}
            <Section title="Vocabulario clave (20)">
              <View style={{ gap: 8 }}>
                {props.vocab.map((w, i) => (
                  <View key={i} style={styles.wordCard}>
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
                ))}
              </View>
            </Section>

            {/* GRAMÁTICA */}
            <Section title="Gramática en contexto (7)">
              <View style={{ gap: 12 }}>
                {props.grammar.map((g, i) => (
                  <View key={i} style={styles.gramCard}>
                    <Text style={styles.gramPat}>{g.pat}</Text>

                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <PillBtn label="🔊 Pronunciación (JP)" kind="ghost" onPress={() => speakJP(g.pat)} />
                      <PillBtn label="🎧 Explicación (ES)" kind="ghost" onPress={() => speakES(`${g.tradu}. ${g.uso}. ${g.matices}.`)} />
                    </View>

                    <Text style={styles.gramH}>¿Cuándo se usa?</Text>
                    <Text style={styles.gramTxt}>{g.uso}</Text>
                    <Text style={styles.gramH}>Traducción natural</Text>
                    <Text style={styles.gramTxt}>{g.tradu}</Text>
                    <Text style={styles.gramH}>Matices y diferencias</Text>
                    <Text style={styles.gramTxt}>{g.matices}</Text>
                    <Text style={styles.gramExJP}>例) {g.ejJP}</Text>
                    <Text style={styles.gramExES}>→ {g.ejES}</Text>
                  </View>
                ))}
              </View>
            </Section>

            {/* LECTURAS */}
            <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
              <View style={{ gap: 14 }}>
                {props.readings.map((block) => (
                  <ReadingBlock key={block.id} data={block} />
                ))}
              </View>
            </Section>

            {/* ACTIVIDAD A */}
            <Section title="Actividad A (8 preguntas)">
              <View style={{ gap: 12 }}>
                {props.activityA.map((q, idx) => {
                  const sel = answersA[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>
                        {idx + 1}/{props.activityA.length} · {q.type.toUpperCase()}
                      </Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>

                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice
                            key={i}
                            label={c}
                            selected={sel === i && state === "neutral"}
                            state={sel === i ? state : "neutral"}
                            onPress={() => onPickA(q, i)}
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
              </View>
              <Text style={styles.scoreTxt}>Resultado: {scoreA}/{props.activityA.length}</Text>
            </Section>

            {/* ACTIVIDAD B */}
            <Section title="Actividad B (8 preguntas)">
              <View style={{ gap: 12 }}>
                {props.activityB.map((q, idx) => {
                  const sel = answersB[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>
                        {idx + 1}/{props.activityB.length} · {q.type.toUpperCase()}
                      </Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>

                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice
                            key={i}
                            label={c}
                            selected={sel === i && state === "neutral"}
                            state={sel === i ? state : "neutral"}
                            onPress={() => onPickB(q, i)}
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
              </View>
              <Text style={styles.scoreTxt}>Resultado: {scoreB}/{props.activityB.length}</Text>
            </Section>
          </>
        )}
      />
    </View>
  );
}

/* ---------- estilos ---------- */
const styles = StyleSheet.create({
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
  closeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  closeTxt: { color: "#BFD9FF", fontWeight: "800" },

  hero: { margin: 14, height: 220, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  heroImg: { ...StyleSheet.absoluteFillObject, width, height: 220 },
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
  play: { backgroundColor: PALETTE.blue, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  playTxt: { color: "#EAF1FF", fontWeight: "900" },

  /* gramática */
  gramCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12 },
  gramPat: { color: "#8FF1F2", fontWeight: "900", marginBottom: 6, fontSize: 15 },
  gramH: { color: "#CFE4FF", fontWeight: "900", marginTop: 2 },
  gramTxt: { color: "rgba(255,255,255,0.9)" },
  gramExJP: { color: "#FFFFFF", marginTop: 6, fontWeight: "900" },
  gramExES: { color: "rgba(255,255,255,0.9)" },

  /* lectura */
  readingCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 14 },
  readingTitle: { color: "#EAF1FF", fontWeight: "900", marginBottom: 8, fontSize: 15 },

  /* preguntas */
  cardQ: { backgroundColor: "#111727", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", padding: 14 },
  qMeta: { color: "rgba(255,255,255,0.6)", fontWeight: "800", marginBottom: 6 },
  prompt: { color: "white", fontSize: 16, fontWeight: "900", lineHeight: 22 },
  choice: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  choiceTxt: { color: "#EAF1FF", fontWeight: "800" },

  expBox: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderRadius: 10, padding: 10, gap: 4 },
  expHeader: { color: "#EAF1FF", fontWeight: "900" },
  expJP: { color: "#FFFFFF" },
  expES: { color: "rgba(255,255,255,0.92)" },

  scoreTxt: { color: "#D3FFF7", fontWeight: "900", textAlign: "center", marginTop: 8 },

  primaryBtn: { backgroundColor: PALETTE.blue, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primaryTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.3 },
  ghostBtn: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ghostTxt: { color: "rgba(255,255,255,0.9)", fontWeight: "900", letterSpacing: 0.3 },

  listenJP: { color: "#fff" },
  listenESTitle: { color: "#CFE4FF", fontWeight: "900", marginTop: 8 },
  listenES: { color: "rgba(255,255,255,0.95)" },
  listenBtns: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
});
