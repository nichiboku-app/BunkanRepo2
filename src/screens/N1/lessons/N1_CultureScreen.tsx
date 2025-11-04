// N1_CultureScreen.tsx
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

function speakJP(t: string) { try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {} }
function speakES(t: string) { try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {} }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
function PillBtn({ label, onPress, kind = "primary", disabled }: { label: string; onPress: () => void; kind?: "primary"|"ghost"; disabled?: boolean; }) {
  const base = kind === "primary" ? styles.primaryBtn : styles.ghostBtn;
  const baseTxt = kind === "primary" ? styles.primaryTxt : styles.ghostTxt;
  return <Pressable style={[base, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}><Text style={baseTxt}>{label}</Text></Pressable>;
}
function Choice({ label, selected, state, onPress, disabled }: { label: string; selected?: boolean; state?: "neutral"|"correct"|"wrong"; onPress: () => void; disabled?: boolean; }) {
  let bg = "#101827"; if (selected) bg = "#2742A0"; if (state==="correct") bg="#1F7A3D"; if (state==="wrong") bg="#7A1F1F";
  return <Pressable style={[styles.choice, { backgroundColor: bg }]} onPress={onPress} disabled={!!disabled}><Text style={styles.choiceTxt}>{label}</Text></Pressable>;
}

/* ------------ Vocab 20 ------------ */
type Vocab = { jp: string; reading: string; es: string };
const VOCAB: Vocab[] = [
  { jp: "文化的多様性", reading: "ぶんかてきたようせい", es: "diversidad cultural" },
  { jp: "表現の自由", reading: "ひょうげんのじゆう", es: "libertad de expresión" },
  { jp: "世論", reading: "よろん", es: "opinión pública" },
  { jp: "偏見", reading: "へんけん", es: "prejuicio" },
  { jp: "差別表現", reading: "さべつひょうげん", es: "expresión discriminatoria" },
  { jp: "文化的適応", reading: "ぶんかてきてきおう", es: "adaptación cultural" },
  { jp: "同調圧力", reading: "どうちょうあつりょく", es: "presión de conformidad" },
  { jp: "風刺", reading: "ふうし", es: "sátira" },
  { jp: "検閲", reading: "けんえつ", es: "censura" },
  { jp: "多文化共生", reading: "たぶんかきょうせい", es: "convivencia multicultural" },
  { jp: "文化資本", reading: "ぶんかしほん", es: "capital cultural" },
  { jp: "公共圏", reading: "こうきょうけん", es: "esfera pública" },
  { jp: "映像表現", reading: "えいぞうひょうげん", es: "expresión audiovisual" },
  { jp: "報道倫理", reading: "ほうどうりんり", es: "ética periodística" },
  { jp: "消費文化", reading: "しょうひぶんか", es: "cultura del consumo" },
  { jp: "文化盗用", reading: "ぶんかとうよう", es: "apropiación cultural" },
  { jp: "象徴性", reading: "しょうちょうせい", es: "simbolismo" },
  { jp: "世代間ギャップ", reading: "せだいかんぎゃっぷ", es: "brecha generacional" },
  { jp: "言説", reading: "げんせつ", es: "discurso (narrativa)" },
  { jp: "表象", reading: "ひょうしょう", es: "representación (cultural)" },
];

/* ------------ Gramática 7 ------------ */
type GPoint = { pat: string; uso: string; tradu: string; matices: string; ejJP: string; ejES: string };
const GRAMMAR: GPoint[] = [
  { pat: "〜にかけては", uso: "Se destaca superioridad/habilidad en un ámbito.", tradu: "en cuanto a / en lo que respecta a (con superioridad)", matices: "Se usa para alabar o afirmar pericia.", ejJP: "映像編集にかけては、彼女は右に出る者がいない。", ejES: "En edición audiovisual, nadie la supera." },
  { pat: "〜にひきかえ", uso: "Comparación contrastiva marcada.", tradu: "en contraste con", matices: "Registro formal; contrasta dos extremos.", ejJP: "前作にひきかえ、新作は批評家から高く評価された。", ejES: "En contraste con la obra previa, la nueva fue mejor valorada." },
  { pat: "〜を踏まえて", uso: "Basarse en X para argumentar/actuar.", tradu: "a partir de / basándose en", matices: "Muy usado en ensayos y debate público.", ejJP: "世論調査を踏まえて、番組構成を見直した。", ejES: "Con base en las encuestas, revisaron el programa." },
  { pat: "〜にもまして", uso: "Más que nunca / más que X.", tradu: "más que / por encima de", matices: "Intensifica grado en comparación.", ejJP: "多様性の尊重が、今にもまして重要だ。", ejES: "El respeto a la diversidad es más importante que nunca." },
  { pat: "〜に即して", uso: "Conforme a la realidad/contexto cultural.", tradu: "conforme a / ajustado a", matices: "Similar a la de Tech pero aplicado a cultura.", ejJP: "地域の事情に即して、表現ガイドを策定する。", ejES: "Se redactan guías de expresión conforme al contexto local." },
  { pat: "〜といえども", uso: "Incluso si… (concesivo alto).", tradu: "aunque / incluso si", matices: "Registro elevado, opinión y crítica.", ejJP: "風刺といえども、差別を正当化することはできない。", ejES: "Aunque sea sátira, no justifica la discriminación." },
  { pat: "〜めく", uso: "Tinte/apariencia de X (literario).", tradu: "con aire de / teñido de", matices: "Suele modificar sustantivos.", ejJP: "ノスタルジーめく演出が世代を超えて受けた。", ejES: "Una puesta en escena con aire nostálgico fue bien recibida." },
];

/* ------------ Lecturas 3 (5 preguntas c/u) ------------ */
type RQ = { id: string; prompt: string; choices: string[]; answerIndex: number; expJP: string; expES: string };
type Reading = { id: string; title: string; jp: string; es: string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id: "c1",
    title: "Sátira y límites éticos",
    jp: "風刺は権力批判の手段である一方、固定観念を強化する危険もはらむ。文脈に即し、弱者を標的化しない配慮が求められる。",
    es: "La sátira critica al poder, pero puede reforzar estereotipos. Debe cuidarse el contexto y evitar apuntar a grupos vulnerables.",
    questions: [
      { id: "c1q1", prompt: "本文の主旨は？", choices: ["風刺の二面性", "風刺の全面禁止", "風刺の無制限擁護", "風刺と文化資本の同一性"], answerIndex: 0, expJP: "利点と危険の両面。", expES: "Resalta pros y riesgos de la sátira." },
      { id: "c1q2", prompt: "配慮が必要なのは？", choices: ["弱者の標的化回避", "制作費の抑制", "視聴率の確保", "著作権の放棄"], answerIndex: 0, expJP: "弱者を守る配慮。", expES: "Evitar apuntar a grupos vulnerables." },
      { id: "c1q3", prompt: "『文脈に即し』の意味に近いのは？", choices: ["状況に合わせ", "偶然に", "強制的に", "形式的に"], answerIndex: 0, expJP: "状況・文脈に合わせること。", expES: "Ajustarse al contexto." },
      { id: "c1q4", prompt: "危険として言及されるのは？", choices: ["固定観念の強化", "字幕の誤字", "機材の老朽化", "国際配信の遅延"], answerIndex: 0, expJP: "ステレオタイプ強化。", expES: "Reforzar estereotipos." },
      { id: "c1q5", prompt: "本文のトーンは？", choices: ["均衡志向", "断定的礼賛", "感情的否定", "無関心"], answerIndex: 0, expJP: "バランス重視。", expES: "Equilibrada." },
    ],
  },
  {
    id: "c2",
    title: "Censura, plataformas y esfera pública",
    jp: "プラットフォーム規約は表現の流通を左右する。公的規制より即応的だが、透明性や異議申立て手続の整備が課題である。",
    es: "Las normas de plataformas determinan la circulación de contenidos. Responden más rápido que la regulación estatal, pero faltan transparencia y vías de apelación.",
    questions: [
      { id: "c2q1", prompt: "課題は何か？", choices: ["透明性と異議申立て", "即応性の欠如", "制作費増", "字幕誤字"], answerIndex: 0, expJP: "透明性・不服申立てが弱い。", expES: "Falta transparencia y apelación." },
      { id: "c2q2", prompt: "規約の特徴は？", choices: ["即応的", "恒久不変", "法的拘束皆無", "公共性が皆無"], answerIndex: 0, expJP: "変化へ素早く対応。", expES: "Alta capacidad de respuesta." },
      { id: "c2q3", prompt: "『左右する』に近いのは？", choices: ["影響を与える", "無関係だ", "偶発する", "削除する"], answerIndex: 0, expJP: "影響与える。", expES: "Influir/condicionar." },
      { id: "c2q4", prompt: "本文の比較対象は？", choices: ["公的規制", "私的検閲", "著作権法", "視聴率"], answerIndex: 0, expJP: "国家規制との比較。", expES: "Regulación estatal." },
      { id: "c2q5", prompt: "全体の論調は？", choices: ["改善提案", "全面禁止", "全面容認", "無批判"], answerIndex: 0, expJP: "課題を指摘し改善を促す。", expES: "Propone mejoras." },
    ],
  },
  {
    id: "c3",
    title: "Representación y diversidad",
    jp: "多様な表象は共感の幅を広げるが、単一の記号化は偏見を再生産する。制作現場の多様性が質の担保につながる。",
    es: "Representaciones diversas amplían la empatía; las codificaciones únicas reproducen prejuicios. Equipos diversos mejoran la calidad.",
    questions: [
      { id: "c3q1", prompt: "利点として述べられるのは？", choices: ["共感の拡張", "制作費の節約", "上映時間の短縮", "広告収入の増大"], answerIndex: 0, expJP: "共感の幅が広がる。", expES: "Amplía la empatía." },
      { id: "c3q2", prompt: "問題点は？", choices: ["単一記号化", "長編化", "邦題", "国際化"], answerIndex: 0, expJP: "一面的表現の固定化。", expES: "Codificación única." },
      { id: "c3q3", prompt: "質担保に資するのは？", choices: ["制作現場の多様性", "上映回数の増加", "SNS広告", "字幕の色変更"], answerIndex: 0, expJP: "作り手側の多様性。", expES: "Diversidad en el equipo." },
      { id: "c3q4", prompt: "『再生産』の意味は？", choices: ["再び生み出す", "破棄する", "輸入する", "解体する"], answerIndex: 0, expJP: "繰り返し生じさせること。", expES: "Producir de nuevo / replicar." },
      { id: "c3q5", prompt: "本文の主張の核は？", choices: ["多様性が質に寄与", "規制の完全撤廃", "消費文化の否定", "報道倫理の放棄"], answerIndex: 0, expJP: "多様性は質向上に寄与。", expES: "La diversidad mejora la calidad." },
    ],
  },
];

/* ------------ Actividades 2x8 ------------ */
type Q = { id: string; type: "kanji"|"vocab"|"grammar"|"reading"; prompt: string; choices: string[]; answerIndex: number; expJP: string; expES: string; tip?: string; };
const ACTIVITY_A: Q[] = [
  { id:"ca1", type:"vocab", prompt:"『文化盗用』の訳は？", choices:["apropiación cultural","diversidad cultural","censura","caricatura"], answerIndex:0, expJP:"文化要素の不適切流用。", expES:"Uso inapropiado de elementos culturales." },
  { id:"ca2", type:"vocab", prompt:"『表象』に近いのは？", choices:["representación","reputación","reparación","refracción"], answerIndex:0, expJP:"何かの示し方。", expES:"Representación." },
  { id:"ca3", type:"grammar", prompt:"『〜にもまして』のニュアンスは？", choices:["以前より一層","少しだけ","同等","むしろ弱い"], answerIndex:0, expJP:"程度の上昇。", expES:"Más que antes." },
  { id:"ca4", type:"reading", prompt:"c2の課題は？", choices:["透明性・異議申立て","制作費","演者の人気","上映規模"], answerIndex:0, expJP:"本文参照。", expES:"Transparencia y apelación." },
  { id:"ca5", type:"vocab", prompt:"『世論』の意味は？", choices:["opinión pública","gasto público","público objetivo","dominio público"], answerIndex:0, expJP:"一般の意見。", expES:"Opinión pública." },
  { id:"ca6", type:"grammar", prompt:"『〜を踏まえて』の用法は？", choices:["根拠・前提に基づく","仮定","命令","譲歩"], answerIndex:0, expJP:"根拠に基づく。", expES:"Basarse en X." },
  { id:"ca7", type:"reading", prompt:"c1のリスクは？", choices:["固定観念強化","制作費増","視聴率低下","違法配信"], answerIndex:0, expJP:"ステレオタイプ強化。", expES:"Refuerzo de estereotipos." },
  { id:"ca8", type:"vocab", prompt:"『検閲』は？", choices:["censura","edición","traducción","curaduría"], answerIndex:0, expJP:"内容の事前審査・制限。", expES:"Censura." },
];
const ACTIVITY_B: Q[] = [
  { id:"cb1", type:"grammar", prompt:"『〜といえども』のレジスターは？", choices:["高い","口語","俗語","命令"], answerIndex:0, expJP:"やや硬い。", expES:"Registro alto." },
  { id:"cb2", type:"vocab", prompt:"『同調圧力』に最も近いのは？", choices:["presión de conformidad","presión fiscal","presión alta","presión de vapor"], answerIndex:0, expJP:"周囲に合わせる圧力。", expES:"Conformidad social." },
  { id:"cb3", type:"reading", prompt:"c3の核心は？", choices:["多様性→質向上","コスト削減","宣伝強化","輸出促進"], answerIndex:0, expJP:"多様性が質に寄与。", expES:"Diversidad mejora calidad." },
  { id:"cb4", type:"vocab", prompt:"『言説』の意味は？", choices:["discurso","cita","sello","canon"], answerIndex:0, expJP:"語られ方。", expES:"Discurso." },
  { id:"cb5", type:"grammar", prompt:"『〜めく』の意味は？", choices:["〜の雰囲気がある","必ず〜する","全く〜しない","〜に等しい"], answerIndex:0, expJP:"雰囲気・色合い。", expES:"Con aire de." },
  { id:"cb6", type:"vocab", prompt:"『報道倫理』は？", choices:["ética periodística","ética médica","ética laboral","ética comercial"], answerIndex:0, expJP:"報道に関する倫理。", expES:"Ética periodística." },
  { id:"cb7", type:"reading", prompt:"c2の比較対象は？", choices:["公的規制","国際条約","著作権","字幕"], answerIndex:0, expJP:"国家規制。", expES:"Regulación estatal." },
  { id:"cb8", type:"vocab", prompt:"『公共圏』は？", choices:["esfera pública","plaza pública","sector público","dominio público"], answerIndex:0, expJP:"公共の議論空間。", expES:"Esfera pública." },
];

/* ------------ ReadingBlock ------------ */
function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const correctCount = useMemo(() => data.questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0), [answers, data.questions]);
  const onPick = (q: RQ, idx: number) => { const ok = idx === q.answerIndex; ok ? playCorrect() : playWrong(); setAnswers(p => ({ ...p, [q.id]: idx })); };
  return (
    <View style={styles.readingCard}>
      <Text style={styles.readingTitle}>{data.title}</Text>
      <Text style={styles.listenJP}>{data.jp}</Text>
      <View style={styles.listenBtns}>
        <PillBtn label="Reproducir lectura (JP)" onPress={() => speakJP(data.jp)} />
        <PillBtn label={showES ? "Ocultar traducción" : "Mostrar traducción"} kind="ghost" onPress={() => setShowES(v=>!v)} />
      </View>
      {showES && (<><Text style={styles.listenESTitle}>Traducción (ES)</Text><Text style={styles.listenES}>{data.es}</Text></>)}
      <View style={{ height: 8 }} />
      {data.questions.map((q, idx) => {
        const sel = answers[q.id];
        const state: "neutral" | "correct" | "wrong" = sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
        return (
          <View key={q.id} style={styles.cardQ}>
            <Text style={styles.qMeta}>{idx + 1}/{data.questions.length} · LECTURA</Text>
            <Text style={styles.prompt}>{q.prompt}</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {q.choices.map((c, i) => <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i ? state : "neutral"} onPress={() => onPick(q, i)} />)}
            </View>
            {sel != null && (
              <View style={styles.expBox}>
                <Text style={styles.expHeader}>{sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}</Text>
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

/* ------------ Screen ------------ */
export default function N1_CultureScreen() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answersA, setAnswersA] = useState<Record<string, number | undefined>>({});
  const [answersB, setAnswersB] = useState<Record<string, number | undefined>>({});
  const scoreA = useMemo(() => ACTIVITY_A.reduce((acc, q) => acc + ((answersA[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0), [answersA]);
  const scoreB = useMemo(() => ACTIVITY_B.reduce((acc, q) => acc + ((answersB[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0), [answersB]);
  const pickA = (q: Q, i: number) => { (i === q.answerIndex ? playCorrect() : playWrong()); setAnswersA(p => ({ ...p, [q.id]: i })); };
  const pickB = (q: Q, i: number) => { (i === q.answerIndex ? playCorrect() : playWrong()); setAnswersB(p => ({ ...p, [q.id]: i })); };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Cultura y medios</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key: "content" }]}
        keyExtractor={(it) => it.key}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={() => (
          <>
            <View style={styles.hero}>
              <ExpoImage source={coverFor("culture")} style={styles.heroImg} contentFit="cover" />
              <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject} />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>N1 · Cultura y medios</Text>
                <Text style={styles.heroTitle}>Tendencias, artes y esfera pública</Text>
                <Text style={styles.heroSub}>Vocabulario cultural, gramática de crítica y lecturas de opinión.</Text>
              </View>
            </View>

            <Section title="Vocabulario clave (20)">
              <View style={{ gap: 8 }}>
                {VOCAB.map((w, i) => (
                  <View key={i} style={styles.wordCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordJP}>{w.jp} <Text style={styles.wordRd}>{w.reading}</Text></Text>
                      <Text style={styles.wordES}>{w.es}</Text>
                    </View>
                    <Pressable style={styles.play} onPress={() => speakJP(w.jp)}><Text style={styles.playTxt}>JP</Text></Pressable>
                    <Pressable style={styles.play} onPress={() => speakES(w.es)}><Text style={styles.playTxt}>ES</Text></Pressable>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Gramática para análisis cultural (7)">
              <View style={{ gap: 12 }}>
                {GRAMMAR.map((g, i) => (
                  <View key={i} style={styles.gramCard}>
                    <Text style={styles.gramPat}>{g.pat}</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <PillBtn label="🔊 Pronunciación (JP)" kind="ghost" onPress={() => speakJP(g.pat)} />
                      <PillBtn label="🎧 Explicación (ES)" kind="ghost" onPress={() => speakES(`${g.tradu}. ${g.uso}. ${g.matices}.`)} />
                    </View>
                    <Text style={styles.gramH}>¿Cuándo se usa?</Text><Text style={styles.gramTxt}>{g.uso}</Text>
                    <Text style={styles.gramH}>Traducción natural</Text><Text style={styles.gramTxt}>{g.tradu}</Text>
                    <Text style={styles.gramH}>Matices y diferencias</Text><Text style={styles.gramTxt}>{g.matices}</Text>
                    <Text style={styles.gramExJP}>例) {g.ejJP}</Text><Text style={styles.gramExES}>→ {g.ejES}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
              <View style={{ gap: 14 }}>
                {READING_PASSAGES.map((block) => (<ReadingBlock key={block.id} data={block} />))}
              </View>
            </Section>

            <Section title="Actividad A (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_A.map((q, idx) => {
                  const sel = answersA[q.id];
                  const state: "neutral" | "correct" | "wrong" = sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>{idx + 1}/{ACTIVITY_A.length} · {q.type.toUpperCase()}</Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i ? state : "neutral"} onPress={() => { (i===q.answerIndex ? playCorrect() : playWrong()); setAnswersA(p => ({ ...p, [q.id]: i })); }} />
                        ))}
                      </View>
                      {sel != null && (
                        <View style={styles.expBox}>
                          <Text style={styles.expHeader}>{sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}</Text>
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

            <Section title="Actividad B (8 preguntas)">
              <View style={{ gap: 12 }}>
                {ACTIVITY_B.map((q, idx) => {
                  const sel = answersB[q.id];
                  const state: "neutral" | "correct" | "wrong" = sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
                  return (
                    <View key={q.id} style={styles.cardQ}>
                      <Text style={styles.qMeta}>{idx + 1}/{ACTIVITY_B.length} · {q.type.toUpperCase()}</Text>
                      <Text style={styles.prompt}>{q.prompt}</Text>
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {q.choices.map((c, i) => (
                          <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i ? state : "neutral"} onPress={() => { (i===q.answerIndex ? playCorrect() : playWrong()); setAnswersB(p => ({ ...p, [q.id]: i })); }} />
                        ))}
                      </View>
                      {sel != null && (
                        <View style={styles.expBox}>
                          <Text style={styles.expHeader}>{sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}</Text>
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

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  topBar:{height:56+(StatusBar.currentHeight??0),paddingTop:(StatusBar.currentHeight??0),paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"rgba(8,12,18,0.8)",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:"rgba(255,255,255,0.08)"},
  topTitle:{color:"#EAF1FF",fontWeight:"900",fontSize:18}, closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:999,backgroundColor:"rgba(255,255,255,0.08)"}, closeTxt:{color:"#BFD9FF",fontWeight:"800"},
  hero:{margin:14,height:220,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,0.07)"},
  heroImg:{...StyleSheet.absoluteFillObject,width,height:220}, heroIn:{flex:1,padding:16,justifyContent:"flex-end",gap:6},
  kicker:{color:"#C5FFF9",fontWeight:"900",letterSpacing:0.6}, heroTitle:{color:"#FFF",fontSize:26,lineHeight:28,fontWeight:"900"}, heroSub:{color:"rgba(255,255,255,0.9)"},
  section:{paddingHorizontal:14,paddingTop:8,paddingBottom:12}, sectionTitle:{color:"#FFFFFF",fontWeight:"900",fontSize:16,marginBottom:8},
  wordCard:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",borderRadius:12,padding:10},
  wordJP:{color:"#FFFFFF",fontWeight:"900"}, wordRd:{color:"rgba(255,255,255,0.75)",fontWeight:"700"}, wordES:{color:"rgba(255,255,255,0.9)"},
  play:{backgroundColor:"#2B7FFF",paddingHorizontal:10,paddingVertical:8,borderRadius:10}, playTxt:{color:"#EAF1FF",fontWeight:"900"},
  gramCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:12},
  gramPat:{color:"#8FF1F2",fontWeight:"900",marginBottom:6,fontSize:15}, gramH:{color:"#CFE4FF",fontWeight:"900",marginTop:2},
  gramTxt:{color:"rgba(255,255,255,0.9)"}, gramExJP:{color:"#FFFFFF",marginTop:6,fontWeight:"900"}, gramExES:{color:"rgba(255,255,255,0.9)"},
  readingCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:14},
  readingTitle:{color:"#EAF1FF",fontWeight:"900",marginBottom:8,fontSize:15},
  cardQ:{backgroundColor:"#111727",borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,0.06)",padding:14},
  qMeta:{color:"rgba(255,255,255,0.6)",fontWeight:"800",marginBottom:6},
  prompt:{color:"white",fontSize:16,fontWeight:"900",lineHeight:22},
  choice:{paddingHorizontal:12,paddingVertical:12,borderRadius:10,borderWidth:1,borderColor:"rgba(255,255,255,0.06)"},
  choiceTxt:{color:"#EAF1FF",fontWeight:"800"},
  expBox:{marginTop:10,backgroundColor:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.18)",borderWidth:1,borderRadius:10,padding:10,gap:4},
  expHeader:{color:"#EAF1FF",fontWeight:"900"}, expJP:{color:"#FFFFFF"}, expES:{color:"rgba(255,255,255,0.92)"},
  scoreTxt:{color:"#D3FFF7",fontWeight:"900",textAlign:"center",marginTop:8},
  primaryBtn:{backgroundColor:PALETTE.blue,paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  primaryTxt:{color:"#EAF1FF",fontWeight:"900",letterSpacing:0.3},
  ghostBtn:{backgroundColor:"transparent",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  ghostTxt:{color:"rgba(255,255,255,0.9)",fontWeight:"900",letterSpacing:0.3},
  listenJP:{color:"#fff"}, listenESTitle:{color:"#CFE4FF",fontWeight:"900",marginTop:8}, listenES:{color:"rgba(255,255,255,0.95)"}, listenBtns:{flexDirection:"row",gap:8,marginTop:8,flexWrap:"wrap"},
});
