// src/screens/N1/lessons/N1_InternationalScreen.tsx
// Screen N1 - Internacional (mismo patrón que Environment/Law/Opinion)

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
  aqua: "#33DAC6",
  text: "#FFFFFF",
};

function speakJP(t: string) {
  try {
    Speech.stop();
    Speech.speak(t, { language: "ja-JP", rate: 1.0 });
  } catch {}
}
function speakES(t: string) {
  try {
    Speech.stop();
    Speech.speak(t, { language: "es-MX", rate: 1.0 });
  } catch {}
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const base = kind === "primary" ? styles.primaryBtn : styles.ghostBtn;
  const baseTxt = kind === "primary" ? styles.primaryTxt : styles.ghostTxt;
  return (
    <Pressable
      style={[base, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={baseTxt}>{label}</Text>
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
    <Pressable
      style={[styles.choice, { backgroundColor: bg }]}
      onPress={onPress}
      disabled={!!disabled}
    >
      <Text style={styles.choiceTxt}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Datos (del CFG que enviaste) ---------- */
type Vocab = { jp: string; reading: string; es: string };
const VOCAB: Vocab[] = [
  { jp: "多国間協力", reading: "たこくかんきょうりょく", es: "cooperación multilateral" },
  { jp: "国益", reading: "こくえき", es: "interés nacional" },
  { jp: "主権", reading: "しゅけん", es: "soberanía" },
  { jp: "合意文書", reading: "ごういぶんしょ", es: "instrumento de acuerdo" },
  { jp: "条約", reading: "じょうやく", es: "tratado" },
  { jp: "批准", reading: "ひじゅん", es: "ratificación" },
  { jp: "履行", reading: "りこう", es: "cumplimiento" },
  { jp: "調停", reading: "ちょうてい", es: "mediación" },
  { jp: "仲裁", reading: "ちゅうさい", es: "arbitraje" },
  { jp: "越境課題", reading: "えっきょうかだい", es: "problemas transfronterizos" },
  { jp: "制裁", reading: "せいさい", es: "sanciones" },
  { jp: "援助", reading: "えんじょ", es: "asistencia" },
  { jp: "人道", reading: "じんどう", es: "humanitario" },
  { jp: "難民保護", reading: "なんみんほご", es: "protección de refugiados" },
  { jp: "合意形成", reading: "ごういけいせい", es: "formación de consensos" },
  { jp: "信頼醸成", reading: "しんらいじょうせい", es: "medidas de confianza" },
  { jp: "二国間", reading: "にこくかん", es: "bilateral" },
  { jp: "監視団", reading: "かんしだん", es: "misión de observación" },
  { jp: "停戦", reading: "ていせん", es: "alto el fuego" },
  { jp: "開発協力", reading: "かいはつきょうりょく", es: "cooperación para el desarrollo" },
];

type GPoint = {
  pat: string;
  uso: string;
  tradu: string;
  matices: string;
  difs?: string;
  ejJP: string;
  ejES: string;
};
const GRAMMAR: GPoint[] = [
  {
    pat: "〜に先立ち",
    uso: "Antes de (cumbres/firmas).",
    tradu: "previo a",
    matices: "Diplomacia formal.",
    difs: "〜前に。",
    ejJP: "署名に先立ち最終協議が行われた。",
    ejES: "Antes de la firma se celebró la negociación final.",
  },
  {
    pat: "〜をめぐって",
    uso: "En torno a temas de disputa.",
    tradu: "en torno a",
    matices: "Controversias.",
    difs: "〜について。",
    ejJP: "領有権をめぐって緊張が高まる。",
    ejES: "Aumenta la tensión en torno a la soberanía.",
  },
  {
    pat: "〜に基づき",
    uso: "Con base en normas/tratados.",
    tradu: "con base en",
    matices: "Textos jurídicos.",
    difs: "〜に即して。",
    ejJP: "憲章に基づき調停を要請する。",
    ejES: "Se solicita mediación con base en la carta.",
  },
  {
    pat: "〜にもかかわらず",
    uso: "A pesar de X.",
    tradu: "a pesar de",
    matices: "Contraste fuerte.",
    difs: "〜のに（hablado）",
    ejJP: "停戦合意にもかかわらず小競り合いが続く。",
    ejES: "Pese al alto el fuego, continúan escaramuzas.",
  },
  {
    pat: "〜に限り",
    uso: "Limitación/condición específica.",
    tradu: "solo para",
    matices: "Acuerdos técnicos.",
    difs: "〜だけ。",
    ejJP: "査察は事前通告のある場合に限り認める。",
    ejES: "Las inspecciones se permiten solo con aviso previo.",
  },
  {
    pat: "〜ない限り",
    uso: "Salvo que...",
    tradu: "a menos que",
    matices: "Condición dura.",
    difs: "〜なければ。",
    ejJP: "合意が得られない限り発効しない。",
    ejES: "A menos que haya acuerdo, no entra en vigor.",
  },
  {
    pat: "〜に加えて",
    uso: "Además de X.",
    tradu: "además de",
    matices: "Acumulativo.",
    difs: "〜のみならず。",
    ejJP: "人道支援に加えて復興支援を拡充する。",
    ejES: "Además de la ayuda humanitaria, se amplía la reconstrucción.",
  },
];

type RQ = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  expJP: string;
  expES: string;
};
type Reading = {
  id: string;
  title: string;
  jp: string;
  es: string;
  questions: RQ[];
};

const READING_PASSAGES: Reading[] = [
  {
    id: "intl1",
    title: "Cooperación y equilibrios",
    jp: "本テキストはテーマに関する背景と課題を概説する。複数の利害が交錯し、調整が不可欠である。",
    es: "El texto describe el contexto, retos y la necesidad de conciliar intereses.",
    questions: [
      {
        id: "intl1q1",
        prompt: "本文の主旨は？",
        choices: ["要点の整理", "無関係", "誤情報", "宣伝のみ"],
        answerIndex: 0,
        expJP: "中心主張の整理。",
        expES: "Idea principal.",
      },
      {
        id: "intl1q2",
        prompt: "課題として挙げられるのは？",
        choices: ["具体的課題", "無関係", "偶然", "対話不要"],
        answerIndex: 0,
        expJP: "課題提示。",
        expES: "Problema señalado.",
      },
      {
        id: "intl1q3",
        prompt: "語彙の意味として最も近いのは？",
        choices: ["適切な定義", "反対語", "無関係", "固有名詞"],
        answerIndex: 0,
        expJP: "文脈定義。",
        expES: "Definición contextual.",
      },
      {
        id: "intl1q4",
        prompt: "本文の態度は？",
        choices: ["実務的/均衡", "攻撃的", "皮肉的", "無関心"],
        answerIndex: 0,
        expJP: "落ち着いた論調。",
        expES: "Tono equilibrado/práctico.",
      },
      {
        id: "intl1q5",
        prompt: "示唆された解決策は？",
        choices: ["改善策の提示", "放置", "回避", "無視"],
        answerIndex: 0,
        expJP: "改善提案。",
        expES: "Vías de mejora.",
      },
    ],
  },
  {
    id: "intl2",
    title: "Diseño institucional y evidencia",
    jp: "制度設計は現場の実態に即して見直されるべきだ。データに基づく検証が鍵となる。",
    es: "El diseño institucional debe revisarse conforme a la realidad; la verificación basada en datos es clave.",
    questions: [
      {
        id: "intl2q1",
        prompt: "本文の主旨は？",
        choices: ["要点の整理", "無関係", "誤情報", "宣伝のみ"],
        answerIndex: 0,
        expJP: "中心主張。",
        expES: "Idea principal.",
      },
      {
        id: "intl2q2",
        prompt: "課題は？",
        choices: ["具体的課題", "無関係", "偶然", "対話不要"],
        answerIndex: 0,
        expJP: "課題提示。",
        expES: "Problema señalado.",
      },
      {
        id: "intl2q3",
        prompt: "語彙の意味は？",
        choices: ["適切な定義", "反対語", "無関係", "固有名詞"],
        answerIndex: 0,
        expJP: "文脈定義。",
        expES: "Definición contextual.",
      },
      {
        id: "intl2q4",
        prompt: "本文の態度は？",
        choices: ["実務的/均衡", "攻撃的", "皮肉的", "無関心"],
        answerIndex: 0,
        expJP: "実務的。",
        expES: "Práctico/equilibrado.",
      },
      {
        id: "intl2q5",
        prompt: "示唆は？",
        choices: ["改善策の提示", "放置", "回避", "無視"],
        answerIndex: 0,
        expJP: "改善提案。",
        expES: "Vías de mejora.",
      },
    ],
  },
  {
    id: "intl3",
    title: "Transparencia y confianza",
    jp: "利点とリスクは表裏一体であり、透明性の確保が信頼に直結する。",
    es: "Beneficios y riesgos coexisten; asegurar transparencia se vincula con la confianza.",
    questions: [
      {
        id: "intl3q1",
        prompt: "本文の主旨は？",
        choices: ["要点の整理", "無関係", "誤情報", "宣伝のみ"],
        answerIndex: 0,
        expJP: "中心主張。",
        expES: "Idea principal.",
      },
      {
        id: "intl3q2",
        prompt: "課題は？",
        choices: ["具体的課題", "無関係", "偶然", "対話不要"],
        answerIndex: 0,
        expJP: "課題提起。",
        expES: "Problema señalado.",
      },
      {
        id: "intl3q3",
        prompt: "語彙の意味は？",
        choices: ["適切な定義", "反対語", "無関係", "固有名詞"],
        answerIndex: 0,
        expJP: "文脈定義。",
        expES: "Definición contextual.",
      },
      {
        id: "intl3q4",
        prompt: "態度は？",
        choices: ["実務的/均衡", "攻撃的", "皮肉的", "無関心"],
        answerIndex: 0,
        expJP: "落ち着いた論調。",
        expES: "Equilibrado/práctico.",
      },
      {
        id: "intl3q5",
        prompt: "示唆は？",
        choices: ["改善策の提示", "放置", "回避", "無視"],
        answerIndex: 0,
        expJP: "改善提案。",
        expES: "Vías de mejora.",
      },
    ],
  },
];

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

const ACTIVITY_A: Q[] = [
  { id: "ia1", type: "grammar", prompt: "『〜に先立ち』の自然な使い方は？", choices: ["式典前の手続き", "単なる並列", "未来推量", "禁止"], answerIndex: 0, expJP: "前置手続を表す。", expES: "Acción previa formal." },
  { id: "ia2", type: "vocab", prompt: "『批准』の最適訳は？", choices: ["ratificación", "remoción", "revisión somera", "difusión"], answerIndex: 0, expJP: "条約の国内承認。", expES: "Aprobación formal de un tratado." },
  { id: "ia3", type: "reading", prompt: "intl1の示唆は？", choices: ["改善策の提示", "広告増加", "無作為抽出", "為替介入"], answerIndex: 0, expJP: "改善提案。", expES: "Sugerencia de mejora." },
  { id: "ia4", type: "vocab", prompt: "『越境課題』は？", choices: ["problemas transfronterizos", "problemas domésticos", "activos financieros", "conclusiones tácitas"], answerIndex: 0, expJP: "国境を越える課題。", expES: "Temas que cruzan fronteras." },
  { id: "ia5", type: "grammar", prompt: "『〜に限り』の語感は？", choices: ["限定条件", "強制", "願望", "推量"], answerIndex: 0, expJP: "条件限定。", expES: "Limitación específica." },
  { id: "ia6", type: "vocab", prompt: "『信頼醸成』は？", choices: ["medidas de confianza", "medidas de coerción", "medidas presupuestales", "actos notariales"], answerIndex: 0, expJP: "相互信頼を作る措置。", expES: "Medidas para generar confianza." },
  { id: "ia7", type: "reading", prompt: "intl2の鍵は？", choices: ["データ検証", "スローガン", "偶然要素", "比喩中心"], answerIndex: 0, expJP: "証拠に基づく検証。", expES: "Verificación basada en datos." },
  { id: "ia8", type: "grammar", prompt: "『〜にもかかわらず』は？", choices: ["逆行する事態", "軽い列挙", "時刻指定", "婉曲否定"], answerIndex: 0, expJP: "逆接・逆境。", expES: "Contraste fuerte.", },
];

const ACTIVITY_B: Q[] = [
  { id: "ib1", type: "vocab", prompt: "『合意形成』は？", choices: ["formación de consensos", "formación de gabinete", "formación de bloques militares", "formación de portafolios"], answerIndex: 0, expJP: "同意を作る過程。", expES: "Proceso para llegar a consensos." },
  { id: "ib2", type: "grammar", prompt: "『〜をめぐって』の用法は？", choices: ["争点を中心に", "時間の前後", "累加", "譲歩"], answerIndex: 0, expJP: "争点・中心話題。", expES: "Alrededor de un punto en disputa." },
  { id: "ib3", type: "reading", prompt: "intl3の核心は？", choices: ["透明性→信頼", "価格のみ", "装飾表現", "個人逸話"], answerIndex: 0, expJP: "透明性が信頼を生む。", expES: "Transparencia vincula confianza." },
  { id: "ib4", type: "vocab", prompt: "『監視団』は？", choices: ["misión de observación", "misión de combate", "misión cultural", "misión de vacunación"], answerIndex: 0, expJP: "観察・監視の任務。", expES: "Equipo de observación/monitoreo." },
  { id: "ib5", type: "grammar", prompt: "『〜に基づき』の相性は？", choices: ["憲章/条約/規則", "感想/印象", "冗談/比喩", "擬音語"], answerIndex: 0, expJP: "法規・根拠テキストと好相性。", expES: "Va con cartas, tratados, normas." },
  { id: "ib6", type: "vocab", prompt: "『停戦』は？", choices: ["alto el fuego", "elecciones", "plebiscito", "arancel"], answerIndex: 0, expJP: "戦闘休止。", expES: "Cese temporal de hostilidades." },
  { id: "ib7", type: "reading", prompt: "intl2の態度は？", choices: ["実務的/均衡", "攻撃的", "皮肉的", "無関心"], answerIndex: 0, expJP: "落ち着いた論調。", expES: "Práctico/equilibrado." },
  { id: "ib8", type: "grammar", prompt: "『〜に加えて』は？", choices: ["追加・累加", "対立", "因果", "譲歩"], answerIndex: 0, expJP: "付け加える。", expES: "Añade/Acumula elementos." },
];

/* ---------- Bloque de lectura con preguntas ---------- */
function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const correctCount = useMemo(
    () =>
      data.questions.reduce(
        (acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0),
        0
      ),
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
        <PillBtn
          label={showES ? "Ocultar traducción" : "Mostrar traducción"}
          kind="ghost"
          onPress={() => setShowES((v) => !v)}
        />
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
      <Text style={styles.scoreTxt}>
        Resultado: {correctCount}/{data.questions.length}
      </Text>
    </View>
  );
}

/* ---------- Screen ---------- */
export default function N1_InternationalScreen() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answersA, setAnswersA] = useState<Record<string, number | undefined>>(
    {}
  );
  const [answersB, setAnswersB] = useState<Record<string, number | undefined>>(
    {}
  );
  const scoreA = useMemo(
    () =>
      ACTIVITY_A.reduce(
        (a, q) => a + ((answersA[q.id] ?? -1) === q.answerIndex ? 1 : 0),
        0
      ),
    [answersA]
  );
  const scoreB = useMemo(
    () =>
      ACTIVITY_B.reduce(
        (a, q) => a + ((answersB[q.id] ?? -1) === q.answerIndex ? 1 : 0),
        0
      ),
    [answersB]
  );

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Internacional</Text>
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
                source={coverFor("international")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>N1 · Contenido aplicado</Text>
                <Text style={styles.heroTitle}>Relaciones y acuerdos</Text>
                <Text style={styles.heroSub}>
                  Vocabulario diplomático, gramática formal y lectura crítica.
                </Text>
              </View>
            </View>

            {/* VOCAB */}
            <Section title="Vocabulario clave (20)">
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

            {/* GRAMMAR */}
            <Section title="Gramática en contexto (7)">
              <View style={{ gap: 12 }}>
                {GRAMMAR.map((g, i) => (
                  <View key={i} style={styles.gramCard}>
                    <Text style={styles.gramPat}>{g.pat}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <PillBtn
                        label="🔊 Pronunciación (JP)"
                        kind="ghost"
                        onPress={() => speakJP(g.pat)}
                      />
                      <PillBtn
                        label="🎧 Explicación (ES)"
                        kind="ghost"
                        onPress={() =>
                          speakES(`${g.tradu}. ${g.uso}. ${g.matices}.`)
                        }
                      />
                    </View>
                    <Text style={styles.gramH}>¿Cuándo se usa?</Text>
                    <Text style={styles.gramTxt}>{g.uso}</Text>
                    <Text style={styles.gramH}>Traducción natural</Text>
                    <Text style={styles.gramTxt}>{g.tradu}</Text>
                    {g.difs ? (
                      <>
                        <Text style={styles.gramH}>Matices y diferencias</Text>
                        <Text style={styles.gramTxt}>
                          {g.matices}（Dif: {g.difs}）
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.gramH}>Matices</Text>
                        <Text style={styles.gramTxt}>{g.matices}</Text>
                      </>
                    )}
                    <Text style={styles.gramExJP}>例) {g.ejJP}</Text>
                    <Text style={styles.gramExES}>→ {g.ejES}</Text>
                  </View>
                ))}
              </View>
            </Section>

            {/* LECTURAS */}
            <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
              <View style={{ gap: 14 }}>
                {READING_PASSAGES.map((b) => (
                  <ReadingBlock key={b.id} data={b} />
                ))}
              </View>
            </Section>

            {/* ACTIVIDAD A */}
            <Section title="Actividad A (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_A.map((q, idx) => {
                  const [answersA, setAnswersA] = [
                    (N1_InternationalScreen as any)._answersA,
                    (N1_InternationalScreen as any)._setAnswersA,
                  ];
                  // (Nota: gestionamos state real abajo)
                  return null;
                })}
              </View>
            </Section>
          </>
        )}
        ListFooterComponent={
          <View style={{ paddingHorizontal: 14 }}>
            {/* Render real de actividades con estado */}
            <Section title="Actividad A (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_A.map((q, idx) => {
                  const [answersAState, setAnswersAState] = [answersA, setAnswersA];
                  const sel = answersAState[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null
                      ? "neutral"
                      : sel === q.answerIndex
                      ? "correct"
                      : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>
                        {idx + 1}/{ACTIVITY_A.length} · {q.type.toUpperCase()}
                      </Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice
                            key={i}
                            label={c}
                            selected={sel === i && state === "neutral"}
                            state={sel === i ? state : "neutral"}
                            onPress={() => {
                              i === q.answerIndex ? playCorrect() : playWrong();
                              setAnswersAState((p) => ({ ...p, [q.id]: i }));
                            }}
                          />
                        ))}
                      </View>
                      {sel != null && (
                        <View style={styles.expBox}>
                          <Text style={styles.expHeader}>
                            {sel === q.answerIndex
                              ? "✅ 正解 / ¡Correcto!"
                              : "❌ 不正解 / Incorrecto"}
                          </Text>
                          <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                          <Text style={styles.expES}>【ES】{q.expES}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              <Text style={styles.scoreTxt}>
                Resultado: {scoreA}/{ACTIVITY_A.length}
              </Text>
            </Section>

            <Section title="Actividad B (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_B.map((q, idx) => {
                  const sel = answersB[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null
                      ? "neutral"
                      : sel === q.answerIndex
                      ? "correct"
                      : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>
                        {idx + 1}/{ACTIVITY_B.length} · {q.type.toUpperCase()}
                      </Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice
                            key={i}
                            label={c}
                            selected={sel === i && state === "neutral"}
                            state={sel === i ? state : "neutral"}
                            onPress={() => {
                              i === q.answerIndex ? playCorrect() : playWrong();
                              setAnswersB((p) => ({ ...p, [q.id]: i }));
                            }}
                          />
                        ))}
                      </View>
                      {sel != null && (
                        <View style={styles.expBox}>
                          <Text style={styles.expHeader}>
                            {sel === q.answerIndex
                              ? "✅ 正解 / ¡Correcto!"
                              : "❌ 不正解 / Incorrecto"}
                          </Text>
                          <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                          <Text style={styles.expES}>【ES】{q.expES}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              <Text style={styles.scoreTxt}>
                Resultado: {scoreB}/{ACTIVITY_B.length}
              </Text>
            </Section>
          </View>
        }
      />
    </View>
  );
}

/* ---------- styles (coherentes con las otras N1) ---------- */
const styles = StyleSheet.create({
  topBar: {
    height: 56 + (StatusBar.currentHeight ?? 0),
    paddingTop: StatusBar.currentHeight ?? 0,
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
  heroIn: { flex: 1, padding: 16, justifyContent: "flex-end", gap: 6 },
  kicker: { color: "#C5FFF9", fontWeight: "900", letterSpacing: 0.6 },
  heroTitle: { color: "#FFF", fontSize: 26, lineHeight: 28, fontWeight: "900" },
  heroSub: { color: "rgba(255,255,255,0.9)" },

  section: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16, marginBottom: 8 },

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

  readingCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  readingTitle: { color: "#EAF1FF", fontWeight: "900", marginBottom: 8, fontSize: 15 },

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

  listenJP: { color: "#fff" },
  listenESTitle: { color: "#CFE4FF", fontWeight: "900", marginTop: 8 },
  listenES: { color: "rgba(255,255,255,0.95)" },
  listenBtns: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
});
