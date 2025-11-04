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
  View
} from "react-native";

import type { RootStackParamList } from "../../../../types"; // ajusta si tu tipo vive en otra ruta
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

/* ----------------- helpers voz ----------------- */
function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* ----------------- componentes UI reusables ----------------- */
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
  const base =
    kind === "primary" ? styles.primaryBtn : styles.ghostBtn;
  const baseTxt =
    kind === "primary" ? styles.primaryTxt : styles.ghostTxt;
  return (
    <Pressable style={[base, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
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
    <Pressable style={[styles.choice, { backgroundColor: bg }]} onPress={onPress} disabled={!!disabled}>
      <Text style={styles.choiceTxt}>{label}</Text>
    </Pressable>
  );
}

/* ----------------- VOCAB (20) con audio ----------------- */
type Vocab = { jp: string; reading: string; es: string };
const VOCAB: Vocab[] = [
  { jp: "技術革新", reading: "ぎじゅつかくしん", es: "innovación tecnológica" },
  { jp: "人工知能", reading: "じんこうちのう", es: "inteligencia artificial" },
  { jp: "機械学習", reading: "きかいがくしゅう", es: "aprendizaje automático (ML)" },
  { jp: "深層学習", reading: "しんそうがくしゅう", es: "aprendizaje profundo (DL)" },
  { jp: "自動化", reading: "じどうか", es: "automatización" },
  { jp: "最適化", reading: "さいてきか", es: "optimización" },
  { jp: "データ駆動", reading: "データくどう", es: "impulsado por datos" },
  { jp: "分散処理", reading: "ぶんさんしょり", es: "procesamiento distribuido" },
  { jp: "拡張現実", reading: "かくちょうげんじつ", es: "realidad aumentada" },
  { jp: "仮想現実", reading: "かそうげんじつ", es: "realidad virtual" },
  { jp: "量子計算", reading: "りょうしけいさん", es: "cómputo cuántico" },
  { jp: "倫理指針", reading: "りんりししん", es: "lineamientos éticos" },
  { jp: "説明可能性", reading: "せつめいかのうせい", es: "explicabilidad (IA)" },
  { jp: "偏り", reading: "かたより", es: "sesgo" },
  { jp: "プライバシー保護", reading: "プライバシーほご", es: "protección de la privacidad" },
  { jp: "相互運用性", reading: "そうごうんようせい", es: "interoperabilidad" },
  { jp: "冗長化", reading: "じょうちょうか", es: "redundancia (técnica)" },
  { jp: "可用性", reading: "かようせい", es: "disponibilidad (SRE)" },
  { jp: "拡張性", reading: "かくちょうせい", es: "escalabilidad" },
  { jp: "信頼性", reading: "しんらいせい", es: "fiabilidad" },
];

/* ----------------- GRAMMAR (7) con audio ----------------- */
type GPoint = { pat: string; uso: string; tradu: string; matices: string; ejJP: string; ejES: string };
const GRAMMAR: GPoint[] = [
  {
    pat: "〜に即して（そくして）",
    uso: "Conforme a datos, normas o realidad técnica.",
    tradu: "conforme a / de acuerdo con",
    matices: "Registro formal en informes y guías.",
    ejJP: "実運用のデータに即して、モデルを再学習した。",
    ejES: "Se reentrenó el modelo conforme a los datos de operación real.",
  },
  {
    pat: "〜をもって",
    uso: "Medio (‘mediante’) o límite temporal (‘a partir de’).",
    tradu: "mediante / a partir de",
    matices: "Frecuente en resoluciones y changelogs formales.",
    ejJP: "本日のパッチをもって、脆弱性を修正した。",
    ejES: "Con el parche de hoy, se corrigió la vulnerabilidad.",
  },
  {
    pat: "〜とあって",
    uso: "Causa notable por carácter excepcional.",
    tradu: "dado que (caso especial)",
    matices: "Explica interés/reacción esperable.",
    ejJP: "大規模言語モデルの公開とあって、注目が集まった。",
    ejES: "Dado que se liberó un LLM grande, atrajo mucha atención.",
  },
  {
    pat: "〜にあって",
    uso: "Marca el marco/situación institucional.",
    tradu: "en (el marco de)",
    matices: "Más formal que 〜において.",
    ejJP: "倫理指針にあって、透明性は重要な原則である。",
    ejES: "En el marco de las guías éticas, la transparencia es clave.",
  },
  {
    pat: "〜いかんによらず／〜いかんにかかわらず",
    uso: "Resultado independientemente de X.",
    tradu: "independientemente de / sin importar",
    matices: "Estilo normativo/administrativo.",
    ejJP: "入力データの形式いかんによらず、検証を通過しなければならない。",
    ejES: "Independientemente del formato, debe pasar la validación.",
  },
  {
    pat: "〜べく",
    uso: "Finalidad de registro alto.",
    tradu: "con el fin de / para",
    matices: "Elevado; reemplaza 〜ために.",
    ejJP: "説明可能性を高めるべく、可視化機能を実装した。",
    ejES: "Con el fin de mejorar la explicabilidad, se implementaron visualizaciones.",
  },
  {
    pat: "〜に即した",
    uso: "Adjetival: ‘ajustado a / conforme a’.",
    tradu: "ajustado a / conforme a",
    matices: "Modifica nombres (現場に即した設計).",
    ejJP: "現場に即した設計指針を整備する。",
    ejES: "Se preparan lineamientos de diseño ajustados al contexto operativo.",
  },
];

/* ----------------- LECTURAS (3) con 5 preguntas c/u ----------------- */
type RQ = { id: string; prompt: string; choices: string[]; answerIndex: number; expJP: string; expES: string };
type Reading = { id: string; title: string; jp: string; es: string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id: "t1",
    title: "IA explicable en producción",
    jp:
      "実運用における説明可能性は、モデルの性能評価だけでなく、意思決定の正当性を支える。特に高リスク領域" +
      "では、出力の根拠提示やデータ由来の偏りの検出が求められる。一方で、可視化の単純化は誤解を招く恐れも" +
      "あるため、理解可能性と正確性のバランスが課題となる。",
    es:
      "La explicabilidad en producción no sólo evalúa el rendimiento, sino que legitima las decisiones. En ámbitos de alto riesgo " +
      "se exige mostrar fundamentos y detectar sesgos. No obstante, una visualización simplista puede inducir errores; equilibrar " +
      "comprensibilidad y precisión es un reto.",
    questions: [
      {
        id: "t1q1",
        prompt: "本文の主旨として最も近いのは？",
        choices: ["説明可能性の役割と課題の両面", "性能だけ見れば十分", "可視化は不要", "高リスク領域でも根拠不要"],
        answerIndex: 0,
        expJP: "役割（正当性）と課題（バランス）を述べる。",
        expES: "Explica funciones y retos: legitimidad y equilibrio.",
      },
      {
        id: "t1q2",
        prompt: "課題として挙げられるのは？",
        choices: ["理解と正確性のバランス", "モデル圧縮", "データ拡張", "前処理自動化"],
        answerIndex: 0,
        expJP: "可視化の単純化が招く誤解などのバランス問題。",
        expES: "El equilibrio entre comprensibilidad y precisión.",
      },
      {
        id: "t1q3",
        prompt: "高リスク領域に『求められる』のは？",
        choices: ["根拠提示と偏り検出", "UIの暗色化", "GPUの増設", "推論の完全離線化"],
        answerIndex: 0,
        expJP: "根拠とバイアス検出が鍵。",
        expES: "Fundamentos y detección de sesgos.",
      },
      {
        id: "t1q4",
        prompt: "可視化の『単純化』の問題は？",
        choices: ["誤解を招く恐れ", "速度低下", "電力消費増", "保守性低下"],
        answerIndex: 0,
        expJP: "単純化しすぎると誤解につながる。",
        expES: "Demasiada simplificación puede confundir.",
      },
      {
        id: "t1q5",
        prompt: "本文のトーンは？",
        choices: ["実務的・均衡志向", "感情的", "皮肉的", "攻撃的"],
        answerIndex: 0,
        expJP: "現実的なバランス論。",
        expES: "Práctico y equilibrado.",
      },
    ],
  },
  {
    id: "t2",
    title: "Datos de operación y reentrenamiento",
    jp:
      "モデルの継続的改善には、実運用データの取り込みが不可欠だ。もっとも、データ品質のばらつきや " +
      "ラベルの一貫性確保は容易ではない。再学習の頻度を保守・運用体制に合わせ、監視指標とアラートを " +
      "設計することで、性能劣化を早期に検知できる。",
    es:
      "Para mejorar continuamente un modelo hay que incorporar datos de operación. Sin embargo, la calidad y la consistencia " +
      "de etiquetas no son triviales. Ajustar la cadencia de reentrenamiento al equipo y diseñar métricas/alertas permite " +
      "detectar pronto la degradación.",
    questions: [
      {
        id: "t2q1",
        prompt: "本文の焦点は？",
        choices: ["運用データの活用と保守設計", "推論の完全停止", "ハード換装", "匿名化の否定"],
        answerIndex: 0,
        expJP: "データ活用と運用設計が主眼。",
        expES: "Uso de datos y diseño operativo.",
      },
      {
        id: "t2q2",
        prompt: "課題として挙がるのは？",
        choices: ["品質ばらつき・ラベル一貫性", "Wi-Fi整備", "色覚対応UI", "オフライン文書化"],
        answerIndex: 0,
        expJP: "品質とラベルの問題が重要。",
        expES: "Calidad y consistencia de etiquetas.",
      },
      {
        id: "t2q3",
        prompt: "推奨されるのは？",
        choices: ["監視指標・アラート設計", "監視放棄", "ベンチ不要", "単発学習で十分"],
        answerIndex: 0,
        expJP: "指標とアラートの設計。",
        expES: "Diseñar métricas y alertas.",
      },
      {
        id: "t2q4",
        prompt: "再学習頻度はどうすべき？",
        choices: ["体制に合わせて調整", "常に毎時", "常に年1回", "不要"],
        answerIndex: 0,
        expJP: "体制に合わせるのが現実的。",
        expES: "Ajustarla a la capacidad del equipo.",
      },
      {
        id: "t2q5",
        prompt: "本文の態度に近いのは？",
        choices: ["現実重視の提案", "理想論のみ", "否定一辺倒", "感情論"],
        answerIndex: 0,
        expJP: "現実的対策の提案。",
        expES: "Propuestas prácticas.",
      },
    ],
  },
  {
    id: "t3",
    title: "Interoperabilidad y escalabilidad",
    jp:
      "複数のシステムが相互運用するには、標準化と契約レベルの取り決めが不可欠である。高い拡張性を維持する" +
      "には、疎結合なアーキテクチャと冗長化を含む設計が望ましい。他方で、標準化の徹底は柔軟性を損なう恐れ" +
      "もあり、段階的な適用が現実的な折衷案となる。",
    es:
      "Para interoperar se requieren estándares y acuerdos contractuales. La escalabilidad se favorece con arquitecturas " +
      "débilmente acopladas y redundancia. Sin embargo, una estandarización rígida puede restar flexibilidad; aplicarla por " +
      "etapas es una salida realista.",
    questions: [
      {
        id: "t3q1",
        prompt: "相互運用性の前提は？",
        choices: ["標準化と取り決め", "ハードの統一", "単一言語化", "GUIの統一色"],
        answerIndex: 0,
        expJP: "標準・契約の整備が必要。",
        expES: "Estándares y acuerdos.",
      },
      {
        id: "t3q2",
        prompt: "拡張性に資するのは？",
        choices: ["疎結合・冗長化", "密結合", "単一障害点", "手動同期"],
        answerIndex: 0,
        expJP: "疎結合＋冗長化が有利。",
        expES: "Acoplamiento débil + redundancia.",
      },
      {
        id: "t3q3",
        prompt: "標準化のデメリットは？",
        choices: ["柔軟性の低下", "負荷増大のみ", "停電増加", "安全性低下のみ"],
        answerIndex: 0,
        expJP: "過度な標準化は柔軟性を奪う恐れ。",
        expES: "Puede quitar flexibilidad.",
      },
      {
        id: "t3q4",
        prompt: "現実的折衷案は？",
        choices: ["段階的適用", "全面即時適用", "一切不適用", "部署別バラバラ運用"],
        answerIndex: 0,
        expJP: "段階的に進める案。",
        expES: "Aplicarla por etapas.",
      },
      {
        id: "t3q5",
        prompt: "本文全体の性格は？",
        choices: ["実務志向の設計論", "感情論", "政治論", "文学評論"],
        answerIndex: 0,
        expJP: "実務的な設計上の議論。",
        expES: "Enfoque de diseño práctico.",
      },
    ],
  },
];

/* ----------------- ACTIVIDADES (2 x 8) ----------------- */
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
  { id: "a1", type: "vocab", prompt: "『拡張性』の意味は？",
    choices: ["scalabilidad", "seguridad", "latencia", "portabilidad"],
    answerIndex: 0, expJP:"拡張性＝スケーラビリティ。", expES:"‘拡張性’ = capacidad de escalar." },
  { id: "a2", type: "vocab", prompt: "『冗長化』は？",
    choices: ["redundancia", "minificación", "inferencia", "serialización"],
    answerIndex: 0, expJP:"冗長化＝冗長系の確保。", expES:"Redundancia." },
  { id: "a3", type: "grammar", prompt: "「〜をもって」の用法に含まれるのは？",
    choices: ["手段・時点", "譲歩", "反例", "比較"],
    answerIndex: 0, expJP:"手段/時点を表す。", expES:"Medio o punto temporal." },
  { id: "a4", type: "reading", prompt: "高リスク領域に必要なのは？",
    choices: ["根拠提示と偏り検出", "UIの明色化", "完全匿名化不要", "再学習禁止"],
    answerIndex: 0, expJP:"本文参照。", expES:"Fundamentos + sesgos." },
  { id: "a5", type: "vocab", prompt: "『説明可能性』は？",
    choices: ["explicabilidad", "capacidad de predicción", "privacidad", "coherencia transaccional"],
    answerIndex: 0, expJP:"XAI。", expES:"Explicabilidad (XAI)." },
  { id: "a6", type: "grammar", prompt: "「〜に即して」の訳は？",
    choices: ["conforme a", "aparte de", "a pesar de", "por más que"],
    answerIndex: 0, expJP:"現実/基準に合わせて。", expES:"Conforme a / según." },
  { id: "a7", type: "reading", prompt: "再学習頻度は？",
    choices: ["体制に合わせる", "常に毎分", "固定年1回", "不要"],
    answerIndex: 0, expJP:"本文参照。", expES:"Ajustar a la capacidad." },
  { id: "a8", type: "vocab", prompt: "『最適化』は？",
    choices: ["optimización", "indexación", "triangulación", "transpilación"],
    answerIndex: 0, expJP:"最適化＝optimization。", expES:"Optimización." },
];

const ACTIVITY_B: Q[] = [
  { id: "b1", type: "grammar", prompt: "「〜とあって」の含意は？",
    choices: ["特別要因ゆえの結果", "逆接", "丁寧要請", "条件仮定"],
    answerIndex: 0, expJP:"特別な事情を理由に結果。", expES:"Causa especial → resultado." },
  { id: "b2", type: "vocab", prompt: "『量子計算』は？",
    choices: ["cómputo cuántico", "cómputo analógico", "cómputo humano", "cómputo manual"],
    answerIndex: 0, expJP:"量子ビット等。", expES:"Computación cuántica." },
  { id: "b3", type: "reading", prompt: "相互運用性の前提は？",
    choices: ["標準化と取り決め", "GPU共有", "同一OS", "同一言語"],
    answerIndex: 0, expJP:"本文参照。", expES:"Estándares y acuerdos." },
  { id: "b4", type: "vocab", prompt: "『可用性』は？",
    choices: ["availability", "accuracy", "auditability", "accountability"],
    answerIndex: 0, expJP:"可用性＝稼働し続けられる度合い。", expES:"Disponibilidad." },
  { id: "b5", type: "grammar", prompt: "「〜べく」のレジスターは？",
    choices: ["高い/書き言葉", "口語的", "俗語", "命令的"],
    answerIndex: 0, expJP:"やや硬い目的表現。", expES:"Registro elevado de finalidad." },
  { id: "b6", type: "vocab", prompt: "『偏り』は？",
    choices: ["sesgo", "ruido", "latencia", "rendimiento"],
    answerIndex: 0, expJP:"データのバイアス。", expES:"Bias/sesgo." },
  { id: "b7", type: "reading", prompt: "標準化のデメリットは？",
    choices: ["柔軟性低下", "電気代増", "訴訟増", "学習時間増"],
    answerIndex: 0, expJP:"柔軟性とのトレードオフ。", expES:"Menos flexibilidad." },
  { id: "b8", type: "vocab", prompt: "『相互運用性』は？",
    choices: ["interoperabilidad", "interactividad", "interpretabilidad", "intercambiabilidad"],
    answerIndex: 0, expJP:"他システムと連携可能。", expES:"Interoperabilidad." },
];

/* ----------------- Lectura re-usable con audio y feedback ----------------- */
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
    if (ok) playCorrect(); else playWrong();
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

/* ----------------- Pantalla principal ----------------- */
export default function N1_TechScreen() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Estado para actividades
  const [answersA, setAnswersA] = useState<Record<string, number | undefined>>({});
  const [answersB, setAnswersB] = useState<Record<string, number | undefined>>({});
  const scoreA = useMemo(
    () => ACTIVITY_A.reduce((acc, q) => acc + ((answersA[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answersA]
  );
  const scoreB = useMemo(
    () => ACTIVITY_B.reduce((acc, q) => acc + ((answersB[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answersB]
  );

  const pickA = (q: Q, i: number) => {
    const ok = i === q.answerIndex;
    ok ? playCorrect() : playWrong();
    setAnswersA(p => ({ ...p, [q.id]: i }));
  };
  const pickB = (q: Q, i: number) => {
    const ok = i === q.answerIndex;
    ok ? playCorrect() : playWrong();
    setAnswersB(p => ({ ...p, [q.id]: i }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Ciencia y tecnología</Text>
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
                source={coverFor("tech")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>N1 · Ciencia y tecnología</Text>
                <Text style={styles.heroTitle}>Innovación, IA y futuro</Text>
                <Text style={styles.heroSub}>Vocabulario técnico, gramática formal y lecturas aplicadas.</Text>
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

            {/* GRAMÁTICA */}
            <Section title="Gramática formal en contexto (7)">
              <View style={{ gap: 12 }}>
                {GRAMMAR.map((g, i) => (
                  <View key={i} style={styles.gramCard}>
                    <Text style={styles.gramPat}>{g.pat}</Text>

                    {/* Botones de audio JP/ES */}
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
                {READING_PASSAGES.map((block) => (
                  <ReadingBlock key={block.id} data={block} />
                ))}
              </View>
            </Section>

            {/* ACTIVIDAD A */}
            <Section title="Actividad A (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_A.map((q, idx) => {
                  const sel = answersA[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
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
                            onPress={() => pickA(q, i)}
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
              <Text style={styles.scoreTxt}>Resultado: {scoreA}/{ACTIVITY_A.length}</Text>
            </Section>

            {/* ACTIVIDAD B */}
            <Section title="Actividad B (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_B.map((q, idx) => {
                  const sel = answersB[q.id];
                  const state: "neutral" | "correct" | "wrong" =
                    sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
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
                            onPress={() => pickB(q, i)}
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
              <Text style={styles.scoreTxt}>Resultado: {scoreB}/{ACTIVITY_B.length}</Text>
            </Section>
          </>
        )}
      />
    </View>
  );
}

/* ----------------- styles ----------------- */
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

  /* lectura */
  readingCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  readingTitle: { color: "#EAF1FF", fontWeight: "900", marginBottom: 8, fontSize: 15 },

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
