// src/screens/N1/lessons/N1_EconomyScreen.tsx
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
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds"; // ✅ ruta correcta

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

/* ---------------- VOCAB Economía (20+) ---------------- */
const VOCAB: { jp: string; reading: string; es: string }[] = [
  { jp: "景気", reading: "けいき", es: "coyuntura económica" },
  { jp: "金融政策", reading: "きんゆうせいさく", es: "política monetaria" },
  { jp: "財政出動", reading: "ざいせいしゅつどう", es: "estímulo fiscal" },
  { jp: "物価上昇", reading: "ぶっかじょうしょう", es: "alza de precios" },
  { jp: "消費者物価指数", reading: "しょうひしゃぶっかしすう", es: "IPC" },
  { jp: "為替", reading: "かわせ", es: "tipo de cambio" },
  { jp: "貿易収支", reading: "ぼうえきしゅうし", es: "balanza comercial" },
  { jp: "国内総生産", reading: "こくないそうせいさん", es: "PIB" },
  { jp: "雇用", reading: "こよう", es: "empleo" },
  { jp: "投資", reading: "とうし", es: "inversión" },
  { jp: "景気後退", reading: "けいきこうたい", es: "recesión" },
  { jp: "賃上げ", reading: "ちんあげ", es: "aumento salarial" },
  { jp: "賃金", reading: "ちんぎん", es: "salario" },
  { jp: "企業統治", reading: "きぎょうとうち", es: "gobernanza corporativa" },
  { jp: "株主", reading: "かぶぬし", es: "accionista" },
  { jp: "労働参加率", reading: "ろうどうさんかりつ", es: "tasa de participación laboral" },
  { jp: "非正規雇用", reading: "ひせいきこよう", es: "empleo no regular" },
  { jp: "産業構造", reading: "さんぎょうこうぞう", es: "estructura industrial" },
  { jp: "生産性", reading: "せいさんせい", es: "productividad" },
  { jp: "付加価値", reading: "ふかかち", es: "valor agregado" },
];

/* ---------------- GRAMMAR (mismo set que Política) ---------------- */
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
    matices: "Muy usado en lineamientos y avisos económicos.",
    ejJP: "支援金の支給は企業規模のいかんによらず同一基準とする。",
    ejES: "El otorgamiento de apoyo se realizará con el mismo criterio, sin importar el tamaño de la empresa.",
  },
  {
    pat: "〜にあって",
    uso: "Marca el marco/situación institucional.",
    tradu: "“En (el marco de) / En”.",
    matices: "Formal en reportes y lineamientos.",
    ejJP: "物価高にあって、家計負担の軽減策が急務となっている。",
    ejES: "En el contexto de la inflación, urge aliviar la carga de los hogares.",
  },
  {
    pat: "〜をもって",
    uso: "Medio o punto temporal.",
    tradu: "“mediante / con / a partir de (fecha)”.",
    matices: "Frecuente en comunicados y resoluciones.",
    ejJP: "本日をもって、当社の配当方針を一部改定する。",
    ejES: "A partir de hoy, se reforma parcialmente la política de dividendos.",
  },
  {
    pat: "〜に即して（そくして）",
    uso: "Conforme a/según cierta realidad.",
    tradu: "“conforme a / de acuerdo con / según”.",
    matices: "Políticas basadas en evidencia.",
    ejJP: "データに即して、最低賃金の引き上げ幅を検討する。",
    ejES: "De acuerdo con los datos, se evaluará el aumento del salario mínimo.",
  },
  {
    pat: "〜とあって",
    uso: "Causa notable.",
    tradu: "“Dado que / Puesto que (especial)”",
    matices: "Resultado esperable por lo excepcional.",
    ejJP: "大規模投資計画の公表とあって、株価が急伸した。",
    ejES: "Dado que se anunció un gran plan de inversión, las acciones subieron con fuerza.",
  },
  {
    pat: "〜べく",
    uso: "‘Con el fin de’.",
    tradu: "“con el fin de / para”.",
    matices: "Registro alto, informes técnicos.",
    ejJP: "生産性を高めるべく、研究開発投資を拡充した。",
    ejES: "Para elevar la productividad, se amplió la inversión en I+D.",
  },
];

/* ---------------- Lectura breve Economía ---------------- */
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
    title: "Precios y salarios",
    jp:
      "近年、物価上昇の局面において、賃上げの広がりが注目されている。家計の実質購買力を維持するためには、" +
      "一時的な給付に頼るだけでなく、持続的な賃金上昇と生産性の底上げが重要だ。企業統治の改善や、" +
      "労働参加率の引き上げ、人的投資の拡充など、複合的な施策が求められている。",
    es:
      "Con el alza de precios, la atención se centra en los aumentos salariales. Para mantener el poder adquisitivo real " +
      "no basta con apoyos temporales; se requieren incrementos sostenibles de salarios y mayor productividad. " +
      "Hacen falta medidas combinadas: mejor gobernanza corporativa, mayor participación laboral e inversión en capital humano.",
    questions: [
      {
        id: "r1q1",
        prompt: "本文の焦点に最も近いのは？",
        choices: ["賃上げと生産性の重要性", "減税のみで十分", "一時給付の常態化", "為替介入が唯一の解"],
        answerIndex: 0,
        expJP: "賃上げの持続性と生産性向上が鍵だと述べている。",
        expES: "Subidas salariales sostenibles y productividad son claves, según el texto.",
      },
      {
        id: "r1q2",
        prompt: "複合的な施策に含まれないのは？",
        choices: ["企業統治の改善", "労働参加率の向上", "人的投資の拡充", "商品券の常設化"],
        answerIndex: 3,
        expJP: "恒常的な商品券は本文の提案に含まれない。",
        expES: "El texto no propone ‘vales permanentes’.",
      },
      {
        id: "r1q3",
        prompt: "本文の背景状況は？",
        choices: ["物価上昇局面", "デフレ深化", "完全雇用の停止", "金融危機の直後"],
        answerIndex: 0,
        expJP: "物価上昇＝インフレ局面を背景に述べている。",
        expES: "Se habla en contexto de alza de precios (inflación).",
      },
      {
        id: "r1q4",
        prompt: "政策の方向性として近いのは？",
        choices: ["持続的な賃上げ＋生産性", "一時支援のみ", "賃下げ", "雇用縮小"],
        answerIndex: 0,
        expJP: "持続的な賃上げと生産性底上げの併走が必要。",
        expES: "Salarios sostenibles + productividad como dirección de política.",
      },
      {
        id: "r1q5",
        prompt: "人的投資の例として適切なのは？",
        choices: ["職業訓練の拡充", "港湾使用料の引き上げ", "通信税の新設", "営業時間規制の強化"],
        answerIndex: 0,
        expJP: "人的投資＝教育・訓練・スキル向上への投資。",
        expES: "Inversión en capital humano: formación y capacitación.",
      },
    ],
  },
];

/* ---------------- MiniTest breve (2) ---------------- */
type Q2 = {
  id: string;
  type: "kanji" | "vocab" | "grammar" | "reading";
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
};
const MINI_QUESTIONS: Q2[] = [
  {
    id: "p1",
    type: "vocab",
    prompt: "『国内総生産』は？",
    choices: ["PIB", "IPC", "Tipo de cambio", "Balanza de pagos"],
    answerIndex: 0,
    expJP: "国内総生産＝PIB (GDP)。",
    expES: "‘PIB’ (GDP) corresponde a ‘国内総生産’.",
  },
  {
    id: "p2",
    type: "grammar",
    prompt: "「〜に即して」の意味は？",
    choices: ["conforme a / según", "a pesar de", "en lugar de", "aparte de"],
    answerIndex: 0,
    expJP: "〜に即して＝〜に合わせて／〜に基づいて。",
    expES: "Equivale a ‘conforme a / de acuerdo con’.",
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

/* ---------------- Reading block ---------------- */
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

/* ---------------- Main ---------------- */
export default function N1_EconomyScreen() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

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

  const selectChoice = (q: Q2, idx: number) => {
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
        <Text style={styles.topTitle}>Economía y negocios</Text>
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
                source={require("../../../assets/images/n1/economy.webp")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} pointerEvents="none" />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>N1 · Indicadores y empresas</Text>
                <Text style={styles.heroTitle}>Economía y negocios</Text>
                <Text style={styles.heroSub}>
                  Vocabulario técnico · gramática formal · una lectura con ejercicios y MiniTest.
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

            {/* GRAMÁTICA (con audio JP/ES) */}
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

            {/* LECTURA */}
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

/* ---------------- STYLES (reutilizados) ---------------- */
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
  playGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playGhostTxt: { color: "rgba(255,255,255,0.92)", fontWeight: "900" },

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
