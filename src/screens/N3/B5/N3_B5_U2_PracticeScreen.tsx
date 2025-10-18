// src/screens/N3/B5/N3_B5_U2_PracticeScreen.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import type { ImageSourcePropType } from "react-native";
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

/* ------------- Types ------------- */
type RootStackParamList = {
  N3_B5_U2_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B5_U2_Practice">;

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
type Kanji = {
  hex: string;
  char: string;
  gloss: string;
  sample: string;
  strokes: number;
};

const speakJa = (t: string) =>
  Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ------------- Guía clara — ES & JA (hiragana) ------------- */
const GUIA_ES = `🔗 Por medio de / gracias a — 「〜によって」「〜により」

Usos principales:
1) Medio/causa: N + によって／により
   → “por / a través de / gracias a”.
   例：努力『どりょく』によって 合格した。→ Aprobé gracias al esfuerzo.
   ※ 『書き言葉』により = más formal.

2) Agente en pasiva: N + によって（～られる）
   例：この建物は 有名な建築家によって 設計された。
   → Fue diseñado por un arquitecto famoso.

3) Variación / depende de: N + によって（は）
   例：人によって 好みが ちがう。→ Depende de la persona.
   例：場合によっては 中止します。→ Según el caso, se cancela.

Comparación rápida:
・によって = núcleo general (medio, causa, agente, variación).
・により = equivalente más formal (documentos/anuncios).
・によっては = “en algunos casos / dependiendo de…, puede que A”.`;

const GUIA_JA = `🔗 手段・原因／受け身の行為者／違い：「〜によって／により」

① 手段・原因：N + によって／により（硬い）
　努力によって 合格した。

② 受け身の行為者：N + によって V-られる
　この橋は 技術者によって 建設された。

③ 個人差・場合分け：N + によって（は）
　人によって 考え方が ちがう。
　場合によっては 中止することが ある。`;

/* ------------- Tabla breve ------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  {
    patron: "手段／原因",
    forma: "N ＋ によって／により",
    tradu: "por medio de / gracias a",
    nota: "により = formal",
  },
  {
    patron: "受け身の行為者",
    forma: "N ＋ によって ＋ V-受け身",
    tradu: "por (agente) en pasiva",
    nota: "自然現象にもOK（地震によって…）",
  },
  {
    patron: "違い・場合分け",
    forma: "N ＋ によって（は）",
    tradu: "según / depende de",
    nota: "によっては＝『ある場合は…』",
  },
];

/* ------------- PRÁCTICA (elige) — 12 ------------- */
const PRACTICE: Quiz[] = [
  {
    id: 1,
    stem: "このプロジェクトは 多くの協力（　　　）成功した。",
    options: ["によって", "により", "について"],
    answer: "によって",
    jp_full: "このプロジェクトは 多くの協力によって成功した。",
    es: "Este proyecto tuvo éxito gracias a mucha colaboración.",
    why: "Medio/causa → によって。",
  },
  {
    id: 2,
    stem: "この寺は 16世紀の僧（　　　）建てられた。",
    options: ["によって", "に", "までに"],
    answer: "によって",
    jp_full: "この寺は 16世紀の僧によって建てられた。",
    es: "Este templo fue construido por un monje del siglo XVI.",
    why: "Agente en voz pasiva → によって。",
  },
  {
    id: 3,
    stem: "結果は 人（　　　）ちがいます。",
    options: ["によって", "について", "だけでなく"],
    answer: "によって",
    jp_full: "結果は 人によってちがいます。",
    es: "Los resultados varían según la persona.",
    why: "Variación ‘depende de’ → によって。",
  },
  {
    id: 4,
    stem: "この規則は 状況（　　　）は 例外が認められる。",
    options: ["によって", "により", "によっては"],
    answer: "によっては",
    jp_full: "この規則は 状況によっては 例外が認められる。",
    es: "Según la situación, se permiten excepciones.",
    why: "‘en algunos casos’ → によっては。",
  },
  {
    id: 5,
    stem: "最新の研究（　　　）、治療法が改善された。",
    options: ["により", "によっては", "について"],
    answer: "により",
    jp_full: "最新の研究により、治療法が改善された。",
    es: "Gracias a la investigación más reciente, se mejoró el tratamiento.",
    why: "Estilo formal escrito → により。",
  },
  {
    id: 6,
    stem: "台風（　　　）大きな被害が出た。",
    options: ["によって", "により", "について"],
    answer: "により",
    jp_full: "台風により大きな被害が出た。",
    es: "Debido al tifón, hubo grandes daños.",
    why: "Noticias/comunicados formales → により。",
  },
  {
    id: 7,
    stem: "この商品は 生産者（　　　）直送されます。",
    options: ["によって", "について", "ばかりでなく"],
    answer: "によって",
    jp_full: "この商品は 生産者によって直送されます。",
    es: "Este producto se envía directamente por el productor.",
    why: "Agente de la pasiva → によって。",
  },
  {
    id: 8,
    stem: "文化（　　　）挨拶の仕方は 異なる。",
    options: ["によって", "により", "については"],
    answer: "によって",
    jp_full: "文化によって挨拶の仕方は異なる。",
    es: "La forma de saludar cambia según la cultura.",
    why: "Variación → によって。",
  },
  {
    id: 9,
    stem: "個人情報は 法律（　　　）厳しく守られている。",
    options: ["により", "によっては", "について"],
    answer: "により",
    jp_full: "個人情報は 法律により厳しく守られている。",
    es: "La información personal está protegida estrictamente por ley.",
    why: "Registro formal → により。",
  },
  {
    id: 10,
    stem: "この映画は 多くの人々（　　　）愛されている。",
    options: ["によって", "について", "により"],
    answer: "によって",
    jp_full: "この映画は 多くの人々によって愛されている。",
    es: "Esta película es querida por muchas personas.",
    why: "Agente plural en pasiva → によって。",
  },
  {
    id: 11,
    stem: "成績は テストの形式（　　　）左右されることがある。",
    options: ["によって", "により", "によっては"],
    answer: "によって",
    jp_full: "成績は テストの形式によって左右されることがある。",
    es: "Las notas pueden verse influidas según el formato del examen.",
    why: "Variación condicionada → によって。",
  },
  {
    id: 12,
    stem: "場合（　　　）追加料金がかかります。",
    options: ["によっては", "により", "については"],
    answer: "によっては",
    jp_full: "場合によっては追加料金がかかります。",
    es: "En algunos casos se cobra una tarifa adicional.",
    why: "‘en algunos casos’ → によっては。",
  },
];

/* ------------- EXTRA — Rellenar (6) ------------- */
const EXTRA: Fill[] = [
  {
    id: 1,
    hint: "medio/causa",
    jp_base: "新しい技術____ 生産性が 上がった。",
    answer: "によって",
    jp_full: "新しい技術によって 生産性が 上がった。",
    es: "Gracias a la nueva tecnología, subió la productividad.",
    why: "Medio → によって。",
  },
  {
    id: 2,
    hint: "formal escrito",
    jp_base: "事故は 人為的ミス____ 起きたと考えられる。",
    answer: "により",
    jp_full: "事故は 人為的ミスにより 起きたと考えられる。",
    es: "Se considera que el accidente ocurrió por un error humano.",
    why: "Comunicado/registro formal → により。",
  },
  {
    id: 3,
    hint: "agente pasiva",
    jp_base: "この像は 有名な彫刻家____ 作られた。",
    answer: "によって",
    jp_full: "この像は 有名な彫刻家によって 作られた。",
    es: "Esta estatua fue hecha por un escultor famoso.",
    why: "Agente → によって。",
  },
  {
    id: 4,
    hint: "depende de",
    jp_base: "評価は 面接官____ 変わることがある。",
    answer: "によって",
    jp_full: "評価は 面接官によって 変わることがある。",
    es: "La evaluación puede variar según el entrevistador.",
    why: "Variación → によって。",
  },
  {
    id: 5,
    hint: "en algunos casos",
    jp_base: "天候____ 出発を見合わせます。",
    answer: "によっては",
    jp_full: "天候によっては 出発を見合わせます。",
    es: "Según el clima, podríamos aplazar la salida.",
    why: "‘algunos casos’ → によっては。",
  },
  {
    id: 6,
    hint: "formal escrito",
    jp_base: "本イベントは 都合____ 中止となりました。",
    answer: "により",
    jp_full: "本イベントは 都合により 中止となりました。",
    es: "Este evento se canceló por motivos de organización.",
    why: "Fórmula fija en anuncios → により。",
  },
];

/* ------------- Kanji de la unidad (10) ------------- */
const KANJI: Kanji[] = [
  { hex: "50be", char: "傾", gloss: "inclinarse",  sample: "傾向（けいこう）", strokes: 13 },
  { hex: "79fb", char: "移", gloss: "moverse",    sample: "移動（いどう）", strokes: 11 },
  { hex: "63a8", char: "推", gloss: "empujar/estimar", sample: "推測（すいそく）", strokes: 11 },
  { hex: "7387", char: "率", gloss: "tasa",       sample: "確率（かくりつ）", strokes: 11 },
  { hex: "4f38", char: "伸", gloss: "estirar",    sample: "伸びる（のびる）", strokes: 7 },
  { hex: "7e2e", char: "縮", gloss: "encoger",    sample: "縮小（しゅくしょう）", strokes: 17 },
  { hex: "5f37", char: "強", gloss: "fuerte",     sample: "強い（つよい）", strokes: 11 },
  { hex: "5f31", char: "弱", gloss: "débil",      sample: "弱い（よわい）", strokes: 10 },
  { hex: "5f71", char: "影", gloss: "sombra",     sample: "影響（えいきょう）", strokes: 15 },
  { hex: "9077", char: "遷", gloss: "trasladar",  sample: "遷移（せんい）", strokes: 15 },
];

/* assets *_nums.webp */
const HAS_WEB: Record<string, boolean> = {};
const STROKES_NUMS: Record<string, ImageSourcePropType> = {
  "50be": require("../../../../assets/kanjivg/n3/50be_nums.webp"),
  "79fb": require("../../../../assets/kanjivg/n3/79fb_nums.webp"),
  "63a8": require("../../../../assets/kanjivg/n3/63a8_nums.webp"),
  "7387": require("../../../../assets/kanjivg/n3/7387_nums.webp"),
  "4f38": require("../../../../assets/kanjivg/n3/4f38_nums.webp"),
  "7e2e": require("../../../../assets/kanjivg/n3/7e2e_nums.webp"),
  "5f37": require("../../../../assets/kanjivg/n3/5f37_nums.webp"),
  "5f31": require("../../../../assets/kanjivg/n3/5f31_nums.webp"),
  "5f71": require("../../../../assets/kanjivg/n3/5f71_nums.webp"),
  "9077": require("../../../../assets/kanjivg/n3/9077_nums.webp"),
};
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {
  // opcional si quieres mostrar contorno sin números:
  // "50be": require("../../../../assets/kanjivg/n3/50be_web.webp"),
};
function strokeSrc(hex: string): ImageSourcePropType | null {
  if (HAS_WEB[hex] && STROKES_WEB[hex]) return STROKES_WEB[hex]!;
  return STROKES_NUMS[hex] ?? null;
}

/* ------------- Pantalla ------------- */
export default function N3_B5_U2_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [-80, 60, 100],
  });
  const scale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.08, 1],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b5_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            B5 — 02 Por medio de / gracias a（によって・により）
          </Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋によって</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋により（書）</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>によっては</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Guía */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía clara — Español</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_ES}</Text></View>
          <Text style={[styles.h2, { marginTop: 10 }]}>🧭 ガイド — にほんご（かな）</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_JA}</Text></View>
        </View>

        {/* Tabla */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 かたち と ニュアンス</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.2 }]}>パターン</Text>
              <Text style={[styles.th, { flex: 1.6 }]}>かたち</Text>
              <Text style={[styles.th, { flex: 1.0 }]}>意味（ES）</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>メモ</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.6 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.0 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.4 }]}>{r.nota}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Práctica elección */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (12)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem
              key={q.id}
              q={q}
              idx={idx}
              onResult={(ok) => (ok ? playCorrect() : playWrong())}
            />
          ))}
        </View>

        {/* Rellenar */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra — Rellenar (6)</Text>
          {EXTRA.map((f) => (
            <FillItem key={f.id} f={f} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Pulsa “Trazos” para ver el orden numerado.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (<KanjiCard key={k.hex} k={k} />))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ------------- Subcomponentes ------------- */
function ChoiceItem({
  q,
  idx,
  onResult,
}: {
  q: Quiz;
  idx: number;
  onResult: (ok: boolean) => void;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;
  const pick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === q.answer);
  };

  const optStyle = (op: string) => {
    const picked = sel === op;
    const ok = op === q.answer;
    const border = !done
      ? "rgba(0,0,0,0.08)"
      : ok
      ? "#10B981"
      : picked
      ? "#EF4444"
      : "rgba(0,0,0,0.08)";
    const bg = !done
      ? "transparent"
      : ok
      ? "rgba(16,185,129,.12)"
      : picked
      ? "rgba(239,68,68,.12)"
      : "transparent";
    const col = done && ok ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>
        {String(idx + 1).padStart(2, "0")}．{q.stem}
      </Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable
              key={op}
              onPress={() => pick(op)}
              style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}
            >
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
            <Pressable onPress={() => speakJa(q.jp_full)} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function FillItem({
  f,
  onResult,
}: {
  f: Fill;
  onResult: (ok: boolean) => void;
}) {
  const [state, setState] = useState<null | boolean>(null);
  const BANK = ["によって", "により", "によっては"];

  const check = (ans: string) => {
    const ok = ans === f.answer;
    setState(ok);
    onResult(ok);
  };

  const palette =
    state === null
      ? { b: "rgba(0,0,0,0.08)", bg: "transparent", col: "#0E1015" }
      : state
      ? { b: "#10B981", bg: "rgba(16,185,129,.12)", col: "#0f9a6a" }
      : { b: "#EF4444", bg: "rgba(239,68,68,.12)", col: "#c62828" };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.gray}>Pista: {f.hint}</Text>
      <View style={[styles.answerBox, { borderColor: palette.b, backgroundColor: palette.bg }]}>
        <Text style={[styles.jp, { color: palette.col }]}>
          {f.jp_base.replace("____", "＿＿")}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
        {BANK.map((op) => (
          <Pressable key={op} onPress={() => check(op)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{op}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {state !== null && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{f.jp_full}</Text>
          <Text style={styles.esSmall}>{f.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{f.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={() => speakJa(f.jp_full)} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/* Kanji Card */
function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);
  const src = strokeSrc(k.hex);
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
        <Pressable onPress={() => setShowStroke(s => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={() => Speech.speak(k.sample, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ------------- Styles ------------- */
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
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

  /* KANJI grid */
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
