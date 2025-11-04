// src/screens/N1/lessons/N1_PoliticsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
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
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds"; // ✅ ruta correcta (desde lessons/)

type RootStackParamList = { N1Home: undefined };
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;

const { width } = Dimensions.get("window");
const PALETTE = {
  bg: "#0B0F19",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  blue: "#2B7FFF",
  aqua: "#33DAC6",
  text: "#FFFFFF",
};

function speakJP(t: string, rate = 1.0) {
  try {
    Speech.stop();
    Speech.speak(t, { language: "ja-JP", rate });
  } catch {}
}
function speakES(t: string, rate = 1.0) {
  try {
    Speech.stop();
    Speech.speak(t, { language: "es-MX", rate });
  } catch {}
}
const speakSlowJP = (t: string) => speakJP(t, 0.8);
const speakSlowES = (t: string) => speakES(t, 0.9);

/* ---------------- VOCAB (20+) ---------------- */
const VOCAB: { jp: string; reading: string; es: string }[] = [
  { jp: "憲法", reading: "けんぽう", es: "constitución" },
  { jp: "改正", reading: "かいせい", es: "reforma (legal)" },
  { jp: "政権", reading: "せいけん", es: "administración / gobierno" },
  { jp: "野党", reading: "やとう", es: "oposición (partido)" },
  { jp: "与党", reading: "よとう", es: "partido en el poder" },
  { jp: "世論", reading: "よろん／せろん", es: "opinión pública" },
  { jp: "合意", reading: "ごうい", es: "acuerdo/consenso" },
  { jp: "施行", reading: "しこう", es: "promulgación / entrada en vigor" },
  { jp: "審議", reading: "しんぎ", es: "deliberación" },
  { jp: "成立", reading: "せいりつ", es: "aprobación/entrada en vigor (ley)" },
  { jp: "撤回", reading: "てっかい", es: "retirada/revocación (medida)" },
  { jp: "官僚", reading: "かんりょう", es: "burócrata" },
  { jp: "地方自治", reading: "ちほうじち", es: "autonomía local" },
  { jp: "透明性", reading: "とうめいせい", es: "transparencia" },
  { jp: "利害関係者", reading: "りがいかんけいしゃ", es: "partes interesadas" },
  { jp: "汚職", reading: "おしょく", es: "corrupción" },
  { jp: "監視", reading: "かんし", es: "vigilancia/monitoreo" },
  { jp: "有権者", reading: "ゆうけんしゃ", es: "elector(es)" },
  { jp: "投票率", reading: "とうひょうりつ", es: "tasa de participación" },
  { jp: "公正", reading: "こうせい", es: "equidad/imparcialidad" },
  { jp: "法治主義", reading: "ほうちしゅぎ", es: "estado de derecho" },
  { jp: "説明責任", reading: "せつめいせきにん", es: "rendición de cuentas" },
];

/* ---------------- GRAMMAR ---------------- */
type GPoint = {
  pat: string;
  uso: string;
  tradu: string;
  matices: string;
  ejJP: string;
  ejES: string;
};
const GRAMMAR: GPoint[] = [
  {
    pat: "〜(の)いかんによらず／〜(の)いかんにかかわらず",
    uso: "Resultado ‘sin importar’ el estado/tipo de X. Registro formal y normativo.",
    tradu: "“Independientemente de X / Sin importar X”.",
    matices: "Más administrativo que 〜に関わらず; típico de lineamientos y avisos oficiales.",
    ejJP: "申請の受理は、所属機関の種類のいかんによらず同一基準で行う。",
    ejES: "La aceptación de solicitudes se hará con el mismo criterio, independientemente del tipo de institución.",
  },
  {
    pat: "〜にあって",
    uso: "Marca el marco institucional o de situación: ‘en el contexto de’.",
    tradu: "“En (el marco de) / En”.",
    matices: "Más formal que 〜において; papers/políticas.",
    ejJP: "地方自治にあって、住民参加の質は政策の受容性を左右する。",
    ejES: "En la autonomía local, la calidad de la participación determina la aceptación de las políticas.",
  },
  {
    pat: "〜をもって",
    uso: "Medio (‘mediante’) o punto temporal (‘a partir de’).",
    tradu: "“mediante / con / a partir de (fecha)”.",
    matices: "Muy común en resoluciones (本日をもって…).",
    ejJP: "本決議をもって、当該条例の一部を改正する。",
    ejES: "Mediante esta resolución, se reforma parcialmente la ordenanza.",
  },
  {
    pat: "〜に即して（そくして）",
    uso: "Conforme a/según cierta norma o realidad.",
    tradu: "“conforme a / de acuerdo con / según”.",
    matices: "Frecuente en políticas basadas en evidencia.",
    ejJP: "現状に即して、支援体制の再設計を行う必要がある。",
    ejES: "Es necesario rediseñar el sistema de apoyo conforme a la situación actual.",
  },
  {
    pat: "〜とあって",
    uso: "Causa notable: ‘dado que (hecho especial)…’",
    tradu: "“Dado que / Puesto que (especial)”",
    matices: "Se espera el resultado por lo excepcional de la causa.",
    ejJP: "大型予算の見直しとあって、国民の関心が高まっている。",
    ejES: "Dado que se revisa un gran presupuesto, crece el interés ciudadano.",
  },
  {
    pat: "〜べく",
    uso: "‘Con el fin de’ (registro alto).",
    tradu: "“con el fin de / para”.",
    matices: "Equivalente elevado de 〜ために.",
    ejJP: "透明性を高めるべく、情報公開制度を拡充した。",
    ejES: "Para aumentar la transparencia, se amplió el acceso a la información.",
  },
];

/* ---------------- Lecturas con 5 preguntas — con explicaciones JP/ES ---------------- */
type RQ = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
};
type Reading = { id: string; title: string; jp: string; es: string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id: "r1",
    title: "Transparencia y participación",
    jp:
      "近年、政治的意思決定において透明性の確保が強く求められている。特に大規模な制度改革や予算配分の" +
      "見直しでは、国会での審議に加え、市民や利害関係者の意見をどのように政策形成へ反映させるかが課題だ。" +
      "政府はオンライン意見募集や地方レベルでの公聴会など、多様なチャネルを整えているものの、参加機会の" +
      "均等性や情報のわかりやすさには改善の余地が大きい。政策の妥当性は短期的効果にとどまらず、長期的な" +
      "持続可能性と社会的包摂の観点から検証されるべきであり、そのためにも説明責任の徹底と独立した監視体制の強化が不可欠である。",
    es:
      "Se exige asegurar la transparencia en la toma de decisiones. En grandes reformas y reasignaciones presupuestarias, " +
      "el reto es incorporar la voz ciudadana y de las partes interesadas, además del debate parlamentario. Hay consultas en línea " +
      "y audiencias locales, pero faltan igualdad de acceso y claridad informativa. La validez de las políticas debe evaluarse por " +
      "su sostenibilidad e inclusión social; se requiere rendición de cuentas rigurosa y supervisión independiente.",
    questions: [
      {
        id: "r1q1",
        prompt: "本文の主旨として最も適切なのは？",
        choices: ["透明性と参加の質を高める必要性", "予算配分は短期効果のみ重視", "国会審議だけで十分", "監視体制は不要"],
        answerIndex: 0,
        expJP: "本文全体は透明性・参加・監視強化の重要性を論じているため、選択肢①が要旨に合致します。",
        expES: "El texto insiste en transparencia, participación y supervisión; por eso la opción 1 resume la idea central.",
      },
      {
        id: "r1q2",
        prompt: "課題として挙げられていないものは？",
        choices: ["参加機会の均等性", "情報のわかりやすさ", "監視体制の強化", "市民の移住促進"],
        answerIndex: 3,
        expJP: "本文には『移住促進』は出てこないため③ではなく④が不該当項目です。",
        expES: "El texto no menciona ‘promover la migración’; por eso la correcta es la 4.",
      },
      {
        id: "r1q3",
        prompt: "『政策の妥当性』の検証観点に含まれるのは？",
        choices: ["長期的持続可能性", "政党支持率", "為替レート", "輸入依存度"],
        answerIndex: 0,
        expJP: "妥当性は短期に限らず「長期的持続可能性」から検証すべきと述べられる。",
        expES: "Se indica evaluar también la ‘sostenibilidad a largo plazo’.",
      },
      {
        id: "r1q4",
        prompt: "筆者の態度として近いのは？",
        choices: ["改善の必要性を提起", "現状を全面的に肯定", "政治参加を否定", "監視の縮小を推奨"],
        answerIndex: 0,
        expJP: "現状の課題を指摘し、改善や強化を求める立場。",
        expES: "El autor pide mejoras, no niega la participación ni reduce la supervisión.",
      },
      {
        id: "r1q5",
        prompt: "文脈に最も近い語は？『説明責任』",
        choices: ["アカウンタビリティ", "コンプライアンス", "ガバナンス分権", "イデオロギー"],
        answerIndex: 0,
        expJP: "説明責任＝accountability（アカウンタビリティ）。",
        expES: "‘Rendición de cuentas’ equivale a ‘accountability’.",
      },
    ],
  },
];

/* ---------------- MiniTest (10) con explicaciones JP/ES ---------------- */
type Q = {
  id: string;
  type: "kanji" | "vocab" | "grammar" | "reading";
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
  tip?: string;
};
const MINI_QUESTIONS: Q[] = [
  {
    id: "p1",
    type: "vocab",
    prompt: "『説明責任』の最も近い意味は？",
    choices: ["説明義務／rendición de cuentas", "秘密保持", "監視回避", "優遇措置"],
    answerIndex: 0,
    expJP: "説明責任は “accountability”。説明する義務・責任を指す。",
    expES: "‘Rendición de cuentas’ = responsabilidad de explicar y responder.",
    tip: "説明責任＝accountability",
  },
  {
    id: "p2",
    type: "reading",
    prompt: "本文の趣旨：長期的持続性と包摂を？",
    choices: ["重視すべき", "不要", "否定すべき", "不明"],
    answerIndex: 0,
    expJP: "本文で妥当性は長期持続性と包摂から検証すべきと述べる。",
    expES: "Se pide evaluar sostenibilidad e inclusión social.",
  },
];

/* ---------------- UI helpers ---------------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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

/* ---------------- Reading block (toggle traducción + explicación al elegir) ---------------- */
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
        <Pressable style={styles.playGhost} onPress={() => speakES(data.es)}>
          <Text style={styles.playGhostTxt}>📢 Leer traducción (ES)</Text>
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
                  disabled={false}
                />
              ))}
            </View>

            {/* Explicación inmediata JP/ES cuando hay selección */}
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
  );
}

/* ---------------- Main Screen ---------------- */
export default function N1_PoliticsScreen() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  // MiniTest
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8 * 60);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

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
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const correctCount = useMemo(
    () => MINI_QUESTIONS.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answers]
  );

  const selectChoice = (q: Q, idx: number) => {
    if (!started || submitted) return;
    const isCorrect = idx === q.answerIndex;
    if (isCorrect) playCorrect(); else playWrong();
    setAnswers((p) => ({ ...p, [q.id]: idx }));
  };

  const handleSubmit = (auto = false) => {
    setSubmitted(true);
    const total = MINI_QUESTIONS.length;
    const score = correctCount;
    const percent = Math.round((score / total) * 100);
    Alert.alert(auto ? "Tiempo agotado" : "MiniTest entregado", `Aciertos: ${score}/${total}  (${percent}%)`);
  };

  const resetMini = () => {
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(8 * 60);
    setStarted(false);
  };

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Política y sociedad</Text>
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
              <ExpoImage
                source={require("../../../assets/images/n1/politics.webp")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} pointerEvents="none" />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>N1 · Sociedad y Estado</Text>
                <Text style={styles.heroTitle}>Política y sociedad</Text>
                <Text style={styles.heroSub}>
                  Lectura crítica · gramática formal · vocabulario clave. Tres lecturas con ejercicios.
                </Text>
              </View>
            </View>

            {/* VOCAB */}
            <Section title="Vocabulario clave (20+)">
              <View style={{ gap: 8 }}>
                {VOCAB.map((w, i) => (
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
            <Section title="Gramática formal en contexto">
              <View style={{ gap: 12 }}>
                {GRAMMAR.map((g, i) => (
                  <View key={i} style={styles.gramCard}>
                    <Text style={styles.gramPat}>{g.pat}</Text>

                    {/* 🔊 Audio JP/ES para patrón y ejemplo */}
                    <View style={styles.gramSpeakRow}>
                      <Pressable style={styles.play} onPress={() => speakJP(g.pat)}>
                        <Text style={styles.playTxt}>🔊 Patrón (JP)</Text>
                      </Pressable>
                      <Pressable style={styles.playGhost} onPress={() => speakSlowJP(g.pat)}>
                        <Text style={styles.playGhostTxt}>🔉 Lento (JP)</Text>
                      </Pressable>
                      <Pressable style={styles.playGhost} onPress={() => speakES(g.tradu)}>
                        <Text style={styles.playGhostTxt}>📢 Patrón (ES)</Text>
                      </Pressable>
                    </View>
                    <View style={styles.gramSpeakRow}>
                      <Pressable style={styles.play} onPress={() => speakJP(g.ejJP)}>
                        <Text style={styles.playTxt}>🗣️ Ejemplo (JP)</Text>
                      </Pressable>
                      <Pressable style={styles.playGhost} onPress={() => speakSlowJP(g.ejJP)}>
                        <Text style={styles.playGhostTxt}>🔉 Lento (JP)</Text>
                      </Pressable>
                      <Pressable style={styles.playGhost} onPress={() => speakES(g.ejES)}>
                        <Text style={styles.playGhostTxt}>📢 Ejemplo (ES)</Text>
                      </Pressable>
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
            <Section title="Comprensión de lectura (1 pasaje · 5 preguntas)">
              <View style={{ gap: 14 }}>
                {READING_PASSAGES.map((block) => (
                  <ReadingBlock key={block.id} data={block} />
                ))}
              </View>
            </Section>

            {/* MiniTest */}
            <Section title="MiniTest de la lección (2 preguntas · 8 min)">
              <View style={styles.testHeader}>
                <Text style={styles.timerLabel}>Tiempo</Text>
                <View style={styles.timerPill}>
                  <Text style={styles.timerTxt}>{mmss}</Text>
                </View>
                <View style={{ flex: 1 }} />
                {!started && !submitted ? (
                  <Pressable style={styles.primaryBtn} onPress={() => setStarted(true)}>
                    <Text style={styles.primaryTxt}>Comenzar</Text>
                  </Pressable>
                ) : submitted ? (
                  <Pressable style={styles.ghostBtn} onPress={resetMini}>
                    <Text style={styles.ghostTxt}>Reiniciar</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={{ gap: 12 }}>
                {MINI_QUESTIONS.map((q, idx) => {
                  const sel = answers[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
                  const allowPress = started && !submitted;
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>
                        {idx + 1}/{MINI_QUESTIONS.length} · {q.type.toUpperCase()}
                      </Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>

                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice
                            key={i}
                            label={c}
                            selected={sel === i && state === "neutral"}
                            state={sel === i ? state : "neutral"}
                            onPress={() => allowPress && selectChoice(q, i)}
                            disabled={!allowPress}
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

                      {submitted && q.tip ? <Text style={styles.tip}>💡 {q.tip}</Text> : null}
                    </View>
                  );
                })}
              </View>

              <View style={{ height: 10 }} />
              {!submitted && started ? (
                <Pressable style={styles.primaryBtn} onPress={() => handleSubmit(false)}>
                  <Text style={styles.primaryTxt}>Entregar MiniTest</Text>
                </Pressable>
              ) : submitted ? (
                <Text style={styles.scoreTxt}>Resultado: {correctCount}/{MINI_QUESTIONS.length}</Text>
              ) : null}
            </Section>
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
  gramH: { color: "#CFE4FF", fontWeight: "900", marginTop: 8 },
  gramTxt: { color: "rgba(255,255,255,0.9)" },
  gramExJP: { color: "#FFFFFF", marginTop: 6, fontWeight: "900" },
  gramExES: { color: "rgba(255,255,255,0.9)" },
  gramSpeakRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },

  /* lectura */
  readingCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  readingTitle: { color: "#EAF1FF", fontWeight: "900", marginBottom: 8, fontSize: 15 },

  /* listening & lectura comunes */
  listenJP: { color: "#FFFFFF", lineHeight: 20, fontWeight: "700" },
  listenBtns: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 8, flexWrap: "wrap" },
  listenESTitle: { color: "#CFE4FF", fontWeight: "900", marginTop: 6, marginBottom: 4 },
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

  /* minitest */
  testHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  timerLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "800" },
  timerPill: {
    backgroundColor: "rgba(99,102,241,0.18)",
    borderColor: "rgba(99,102,241,0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerTxt: { color: "#C7D2FE", fontWeight: "800", letterSpacing: 0.3 },

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
  playGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playGhostTxt: { color: "rgba(255,255,255,0.92)", fontWeight: "900" },
});
