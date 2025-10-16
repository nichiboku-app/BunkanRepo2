// src/screens/N3/B4/N3_B4_U1_PracticeScreen.tsx
// ⏱ BLOQUE 4 — 1 Mientras / durante —「〜間に」「〜うちに」「〜ところ」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b4_u1.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B4_U1_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B4_U1_Practice">;

type Quiz = {
  id: number;
  stem: string;
  options: string[];
  answer: string;
  jp_full: string;
  es: string;
  why: string;
};
type Fill = {
  id: number;
  hint: string;
  jp_base: string;
  answer: string;
  jp_full: string;
  es: string;
  why: string;
};
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ---------------- Guía clara (nivel primaria) — VISIBLE ---------------- */
const GUIA_CLARA_TEXT = `① 〜間に（あいだに）＝ “mientras / durante (algo ocurre)”
   • Dos acciones simultáneas pero distintas.
   • Forma: V(ている)間に + otra acción
   例）父が昼寝している間に、私は宿題をした。
       = “Mientras papá dormía, hice la tarea.”

② 〜うちに ＝ “mientras (aún ocurre algo) / antes de que cambie”
   • Aprovechar una condición temporal limitada.
   • Forma: V(る／ている／ない)・いAdj・なAdjな・Nの + うちに
   例）若いうちに日本へ行きたい。
       = “Quiero ir a Japón mientras sea joven.”

③ 〜ところ（に／で／を）＝ “en el momento exacto de…”
   • Describe un instante preciso de acción.
   • Forma: V(辞書／ている／た) + ところ
   例）出かけるところです。= “Estoy a punto de salir。”
       例）食べているところを見られた。= “Me vieron justo mientras comía。”

Comparación rápida:
• 間に → dos acciones paralelas.
• うちに → aprovechar un momento limitado.
• ところ → punto exacto de una acción.`;

/* ---------------- Tabla de gramática ---------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "Paralelas", forma: "Vている + 間に", tradu: "mientras / durante", nota: "dos acciones distintas en paralelo" },
  { patron: "Ventana limitada", forma: "Vる/ている/ない・Adj・Nの + うちに", tradu: "mientras (aún) / antes de que cambie", nota: "aprovechar el momento" },
  { patron: "Instante exacto", forma: "V辞書/ている/た + ところ（に/で/を）", tradu: "en el momento de", nota: "に＝impacto; で＝en ese momento; を＝si te ven/atrapan" },
];

/* ---------------- PRÁCTICA (elige) — 12 ítems ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "父が昼寝している＿＿、私は宿題をした。", options: ["間に", "うちに", "ところ"], answer: "間に", jp_full: "父が昼寝している間に、私は宿題をした。", es: "Mientras papá dormía, hice la tarea.", why: "Dos acciones paralelas → 間に。" },
  { id: 2, stem: "雨が降らない＿＿、買い物に行こう。", options: ["間に", "うちに", "ところに"], answer: "うちに", jp_full: "雨が降らないうちに、買い物に行こう。", es: "Antes de que llueva / mientras no llueve, vamos de compras.", why: "Aprovechar ventana limitada → うちに。" },
  { id: 3, stem: "ちょうど出かける＿＿、電話が鳴った。", options: ["間に", "うちに", "ところに"], answer: "ところに", jp_full: "ちょうど出かけるところに、電話が鳴った。", es: "Justo cuando iba a salir, sonó el teléfono.", why: "Instante exacto + evento que impacta → ところに。" },
  { id: 4, stem: "授業を受けている＿＿、メッセージを送らないで。", options: ["間に", "うちに", "ところで"], answer: "間に", jp_full: "授業を受けている間に、メッセージを送らないで。", es: "Mientras estoy en clase, no me envíes mensajes.", why: "Actividad prolongada + otra acción → 間に。" },
  { id: 5, stem: "温かい＿＿、食べてください。", options: ["ところを", "うちに", "間に"], answer: "うちに", jp_full: "温かいうちに、食べてください。", es: "Cómelo mientras esté caliente.", why: "Aprovechar estado temporal → うちに。" },
  { id: 6, stem: "ちょうど食べている＿＿、友だちに見られた。", options: ["ところで", "ところを", "間に"], answer: "ところを", jp_full: "ちょうど食べているところを、友だちに見られた。", es: "Me vieron justo mientras comía.", why: "‘ser visto en el acto’ → ところを。" },
  { id: 7, stem: "電車を待っている＿＿、ニュースを読んだ。", options: ["うちに", "ところ", "間に"], answer: "間に", jp_full: "電車を待っている間に、ニュースを読んだ。", es: "Mientras esperaba el tren, leí noticias.", why: "Paralelas → 間に。" },
  { id: 8, stem: "若い＿＿、いろいろ挑戦したほうがいい。", options: ["間に", "ところ", "うちに"], answer: "うちに", jp_full: "若いうちに、いろいろ挑戦したほうがいい。", es: "Mientras seas joven, conviene intentar muchas cosas.", why: "Etapa limitada → うちに。" },
  { id: 9, stem: "今調べている＿＿、少々お待ちください。", options: ["ところです", "間に", "うちに"], answer: "ところです", jp_full: "今調べているところです。少々お待ちください。", es: "Estoy justo revisándolo ahora; espere un momento.", why: "Progreso exacto de la acción → 〜ているところです。" },
  { id: 10, stem: "会議が終わった＿＿、すぐ連絡します。", options: ["ところに", "ところで", "ところを"], answer: "ところで", jp_full: "会議が終わったところで、すぐ連絡します。", es: "Justo al terminar la reunión, te contacto.", why: "Resultado inmediato → ところで。" },
  { id: 11, stem: "出発する＿＿、忘れ物に気づいた。", options: ["間に", "うちに", "ところに"], answer: "ところに", jp_full: "出発するところに、忘れ物に気づいた。", es: "Justo al salir, noté que olvidé algo.", why: "Instante que es interrumpido → ところに。" },
  { id: 12, stem: "授業が始まる＿＿、静かにしてください。", options: ["うちに", "ところで", "間に"], answer: "ところで", jp_full: "授業が始まるところで、静かにしてください。", es: "Está por comenzar la clase, silencio por favor.", why: "‘a punto de’ con aviso → ところで。" },
];

/* ---------------- EXTRA A (rellenar guiado) — 7 ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "paralelas", jp_base: "母が買い物している____、僕は料理を作った。", answer: "間に", jp_full: "母が買い物している間に、僕は料理を作った。", es: "Mientras mi mamá hacía compras, yo cociné.", why: "Dos acciones distintas en paralelo → 間に。" },
  { id: 2, hint: "ventana limitada", jp_base: "暇な____、この本を読んでおこう。", answer: "うちに", jp_full: "暇なうちに、この本を読んでおこう。", es: "Mientras tengo tiempo, leeré este libro.", why: "Aprovechar tiempo limitado → うちに。" },
  { id: 3, hint: "momento exacto (ser visto)", jp_base: "帰ろうとしている____、先生に呼ばれた。", answer: "ところを", jp_full: "帰ろうとしているところを、先生に呼ばれた。", es: "Justo cuando iba a irme, el profe me llamó.", why: "Intercepción del acto → ところを。" },
  { id: 4, hint: "a punto de", jp_base: "今、出かける____です。", answer: "ところ", jp_full: "今、出かけるところです。", es: "Estoy a punto de salir ahora.", why: "V辞書 + ところです。" },
  { id: 5, hint: "durante clase", jp_base: "授業を受けている____、スマホを見ないで。", answer: "間に", jp_full: "授業を受けている間に、スマホを見ないで。", es: "Durante la clase, no mires el móvil.", why: "Actividad prolongada → 間に。" },
  { id: 6, hint: "‘mientras esté fresco’", jp_base: "記憶が新しいうち____、メモしておこう。", answer: "に", jp_full: "記憶が新しいうちに、メモしておこう。", es: "Mientras lo recuerde fresco, lo anoto.", why: "うちに requiere に。" },
  { id: 7, hint: "momento exacto (lugar/tiempo)", jp_base: "会議が終わった____、報告します。", answer: "ところで", jp_full: "会議が終わったところで、報告します。", es: "Al terminar la reunión, reporto.", why: "Resultado inmediato → ところで。" },
];

/* ---------------- EXTRA B (rápidas) — 6 ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "aprovechar estado", jp_base: "天気がいい____、散歩しよう。", answer: "うちに", jp_full: "天気がいいうちに、散歩しよう。", es: "Mientras haga buen tiempo, salgamos a caminar.", why: "Ventana limitada → うちに。" },
  { id: 2, hint: "instante exacto (impacto)", jp_base: "発表している____、質問された。", answer: "ところに", jp_full: "発表しているところに、質問された。", es: "Justo mientras presentaba, me preguntaron.", why: "Interrupción del instante → ところに。" },
  { id: 3, hint: "paralelas", jp_base: "電車を待っている____、音楽を聞く。", answer: "間に", jp_full: "電車を待っている間に、音楽を聞く。", es: "Mientras espero el tren, escucho música.", why: "Paralelas → 間に。" },
  { id: 4, hint: "a punto de", jp_base: "今、寝る____。", answer: "ところです", jp_full: "今、寝るところです。", es: "Estoy a punto de dormir.", why: "V辞書 + ところです。" },
  { id: 5, hint: "ventana limitada", jp_base: "学生の____に、海外旅行をしたい。", answer: "うち", jp_full: "学生のうちに、海外旅行をしたい。", es: "Quiero viajar al extranjero mientras sea estudiante.", why: "Nのうちに → etapa." },
  { id: 6, hint: "ser visto", jp_base: "勉強している____、先生に褒められた。", answer: "ところを", jp_full: "勉強しているところを、先生に褒められた。", es: "El profe me elogió cuando me vio estudiando.", why: "Observación del acto → ところを。" },
];

/* ---------------- Kanji de esta unidad（10） ---------------- */
const KANJI: Kanji[] = [
  { hex: "6642", char: "時", gloss: "tiempo",     sample: "時間（じかん）", strokes: 10 },
  { hex: "9593", char: "間", gloss: "intervalo",  sample: "間に（あいだに）", strokes: 12 },
  { hex: "4eca", char: "今", gloss: "ahora",      sample: "今（いま）", strokes: 4 },
  { hex: "65e9", char: "早", gloss: "temprano",   sample: "早く（はやく）", strokes: 6 },
  { hex: "6674", char: "晴", gloss: "despejar",   sample: "晴れる（はれる）", strokes: 12 },
  { hex: "671d", char: "朝", gloss: "mañana",     sample: "朝ごはん", strokes: 12 },
  { hex: "591c", char: "夜", gloss: "noche",      sample: "今夜（こんや）", strokes: 8 },
  { hex: "663c", char: "昼", gloss: "mediodía",   sample: "昼ごはん", strokes: 9 },
  { hex: "5f8c", char: "後", gloss: "después",    sample: "午後（ごご）", strokes: 9 },
  { hex: "524d", char: "前", gloss: "antes",      sample: "午前（ごぜん）", strokes: 9 },
];

/* ---------------- UI helpers ---------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ---------------- Screen ---------------- */
export default function N3_B4_U1_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b4_u1.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>B4 — 1 Mientras / durante（間に・うちに・ところ）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>間に</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>うちに</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>ところ</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 🧭 Guía clara — visible */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía clara — Nivel primaria</Text>
          <View style={styles.tipBox}>
            <Text style={styles.p}>{GUIA_CLARA_TEXT}</Text>
          </View>
        </View>

        {/* 📘 Tabla de formación y matiz */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Tabla de formación y matiz</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.2 }]}>Patrón</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Forma</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Traducción</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Nota</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{r.nota}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.gray, { marginTop: 6 }]}>
            <Text style={styles.bold}>Regla rápida: </Text>
            <Text style={styles.bold}>間に</Text> = paralelas; <Text style={styles.bold}>うちに</Text> = ventana limitada; <Text style={styles.bold}>ところ</Text> = instante exacto.
          </Text>
        </View>

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (12)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* ⭐ EXTRA A */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra A — Rellenar (7)</Text>
          {EXTRA_A.map((f) => (
            <FillItem key={f.id} f={f} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* 🌱 EXTRA B */}
        <View style={styles.card}>
          <Text style={styles.h2}>🌱 Extra B — Rápidas (6)</Text>
          {EXTRA_B.map((f) => (
            <FillItem key={f.id} f={f} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver la imagen cuando esté disponible.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (<KanjiCard key={k.hex} k={k} />))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function ChoiceItem({ q, idx, onResult }: { q: Quiz; idx: number; onResult: (ok: boolean) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;
  const pick = (op: string) => { if (done) return; setSel(op); onResult(op === q.answer); };

  const optStyle = (op: string) => {
    const picked = sel === op;
    const ok = op === q.answer;
    const border = !done ? "rgba(0,0,0,0.08)" : ok ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : ok ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && ok ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => pick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>

      {done && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{q.jp_full}</Text>
          <Text style={styles.esSmall}>{q.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{q.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={() => Speech.speak(q.jp_full, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function FillItem({ f, onResult }: { f: Fill; onResult: (ok: boolean) => void }) {
  const [state, setState] = useState<null | boolean>(null);
  const BANK = ["間に", "うちに", "ところに", "ところで", "ところを", "ところ", "ところです", "うち"];

  const check = (ans: string) => { const ok = ans === f.answer; setState(ok); onResult(ok); };

  const palette = state === null
    ? { b: "rgba(0,0,0,0.08)", bg: "transparent", col: "#0E1015" }
    : state
    ? { b: "#10B981", bg: "rgba(16,185,129,.12)", col: "#0f9a6a" }
    : { b: "#EF4444", bg: "rgba(239,68,68,.12)", col: "#c62828" };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.gray}>Pista: {f.hint}</Text>
      <View style={[styles.answerBox, { borderColor: palette.b, backgroundColor: palette.bg }]}>
        <Text style={[styles.jp, { color: palette.col }]}>{f.jp_base.replace("____", "＿＿")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
        {BANK.map((op) => (
          <Pressable key={op} onPress={() => check(op)} style={styles.tokenBtn}><Text style={styles.tokenTxt}>{op}</Text></Pressable>
        ))}
      </ScrollView>

      {state !== null && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{f.jp_full}</Text>
          <Text style={styles.esSmall}>{f.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{f.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={() => Speech.speak(f.jp_full, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/* ---------------- Kanji Card ---------------- */
/**
 * Mientras uses los .webp de placeholder (con números grandes),
 * el botón “Trazos” se mantiene ACTIVO pero no muestra la imagen;
 * avisa por voz que faltan los trazos reales.
 * Cuando conviertas los SVG reales a *_nums.webp, marca el kanji como false
 * en PLACEHOLDER para que sí muestre la imagen.
 */
const PLACEHOLDER: Record<string, boolean> = {
  "6642": true, "9593": true, "4eca": true, "65e9": true, "6674": true,
  "671d": true, "591c": true, "663c": true, "5f8c": true, "524d": true,
};

function strokeSrc(hex: string) {
  switch (hex) {
    case "6642": return require("../../../../assets/kanjivg/n3/6642_nums.webp");
    case "9593": return require("../../../../assets/kanjivg/n3/9593_nums.webp");
    case "4eca": return require("../../../../assets/kanjivg/n3/4eca_nums.webp");
    case "65e9": return require("../../../../assets/kanjivg/n3/65e9_nums.webp");
    case "6674": return require("../../../../assets/kanjivg/n3/6674_nums.webp");
    case "671d": return require("../../../../assets/kanjivg/n3/671d_nums.webp");
    case "591c": return require("../../../../assets/kanjivg/n3/591c_nums.webp");
    case "663c": return require("../../../../assets/kanjivg/n3/663c_nums.webp");
    case "5f8c": return require("../../../../assets/kanjivg/n3/5f8c_nums.webp");
    case "524d": return require("../../../../assets/kanjivg/n3/524d_nums.webp");
    default: return null;
  }
}

function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);
  const isPlaceholder = PLACEHOLDER[k.hex];
  const src = isPlaceholder ? null : strokeSrc(k.hex);

  const onToggle = () => {
    if (isPlaceholder) {
      Speech.speak("Faltan los trazos reales para este kanji. Sube el SVG y convierte a WebP.", { language: "es-MX", rate: 1 });
      return;
    }
    setShowStroke(s => !s);
  };

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {showStroke && src
          ? <ExpoImage source={src} style={{ width: "100%", height: "100%" }} contentFit="contain" />
          : <Text style={styles.kChar}>{k.char}</Text>
        }
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={onToggle} style={[styles.kBtn, { opacity: 1 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={() => Speech.speak(k.sample, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015" },
  p: { color: "#1f2330", lineHeight: 20, marginBottom: 2 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },

  tipBox: { backgroundColor: "#F3F7FF", borderLeftWidth: 4, borderLeftColor: "#3757FF", padding: 12, borderRadius: 10 },

  table: { marginTop: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  trHead: { backgroundColor: "#0b0c0f" },
  th: { color: "#fff", fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
  td: { paddingHorizontal: 8, paddingVertical: 8, color: "#0E1015" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explainBox: { backgroundColor: "#F6F7FB", borderRadius: 12, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  jpStrong: { fontSize: 15, fontWeight: "900", color: "#0E1015" },
  esSmall: { color: "#374151", marginTop: 2 },
  why: { color: "#1f2330", marginTop: 4 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center", marginTop: 6 },
  inlineBtns: { flexDirection: "row", gap: 8 },

  // Kanji grid
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  strokeBadge: { position: "absolute", right: 8, top: 8, backgroundColor: "#0E1015", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  strokeBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
