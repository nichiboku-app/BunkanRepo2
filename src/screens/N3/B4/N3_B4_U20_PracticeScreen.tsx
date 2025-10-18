// ⏱ BLOQUE 4 — 20 Momento exacto —「〜とたん(に)」「〜かと思うと」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b4_u20.webp

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
  N3_B4_U20_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B4_U20_Practice">;

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

/* ------------- Guía clara — ES & JA (hiragana) ------------- */
const GUIA_CLARA_ES = `⏱ Tema: Momento exacto — 「〜とたん（に）」「〜かと思うと／かと思ったら」

1) 「Vた とたん（に）B」
• Forma: Verbo pasado (Vた) + とたん（に）
• Significado: “Justo al / en el instante en que A, B (ocurrió repentinamente)”.
• Restricción: sujeto suele ser el mismo; B es algo no intencional / inesperado.
• Ej.: ドアを開けたとたん（に）、ねこが飛び出した。→ En cuanto abrí la puerta, salió el gato.

2) 「Vた かと思うと／かと思ったら B」
• Uso: describe cambios rápidos casi simultáneos; a veces con contraste A⇄B.
• Matiz: ‘parece que A (y) en seguida B’; se usa mucho para narrar.
• Ej.: 雨が降ったかと思うと、もうやんだ。→ Apenas empezó a llover, ya paró.

Diferencias:
• とたん（に） = foco en el “instante exacto”, B suele ser algo inesperado/no controlado.
• かと思うと = secuencia casi inmediata A→B; sirve para contrastes o cambios repetidos.`;

const GUIA_CLARA_JA = `⏱ ピンポイントの瞬間：「〜とたん（に）」「〜かとおもうと」

① Vた + とたん（に）
・A した そのしゅんかん に、B が おきる（どちらかといえば ひょうしぬけ／ふい）。
・例：ドアを あけた とたん（に）、ねこが とびだした。

② Vた + かと思うと／かと思ったら
・『A した と おもうと、すぐ B』の いめーじ。へんか・たいしょう を よく言う。
・例：雨が ふった かと おもうと、もう やんだ。

🧭 まとめ
・とたん＝「その瞬間！」＋予想外/ふい
・かと思うと＝「A したら すぐ B」くりかえし／対比にも◎`;

/* ------------- Tabla de gramática (simple) ------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "〜とたん（に）", forma: "Vた + とたん（に）", tradu: "Justo al A, B", nota: "B suele ser inesperado/no intencional" },
  { patron: "〜かと思うと",   forma: "Vた + かと思うと",   tradu: "A y enseguida B", nota: "contraste/cambio rápido" },
  { patron: "〜かと思ったら", forma: "Vた + かと思ったら", tradu: "A y de inmediato B", nota: "igual que arriba; narración" },
];

/* ------------- PRÁCTICA (elige) — 12 ------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "ドアを開けた（　　　）、強い風が入ってきた。", options: ["とたんに", "かと思うと", "ながら"], answer: "とたんに", jp_full: "ドアを開けたとたんに、強い風が入ってきた。", es: "Apenas abrí la puerta, entró un viento fuerte.", why: "Instante + suceso inesperado → とたん（に）。" },
  { id: 2, stem: "雨が降った（　　　）、もう晴れてきた。", options: ["かと思うと", "とたんに", "つつ"], answer: "かと思うと", jp_full: "雨が降ったかと思うと、もう晴れてきた。", es: "Apenas empezó a llover, ya estaba despejando.", why: "Cambio rápido/contraste → かと思うと。" },
  { id: 3, stem: "席に座った（　　　）、眠くなってしまった。", options: ["とたんに", "かと思うと", "てから"], answer: "とたんに", jp_full: "席に座ったとたんに、眠くなってしまった。", es: "En cuanto me senté, me dio sueño.", why: "Instante + reacción involuntaria。" },
  { id: 4, stem: "ベルが鳴った（　　　）、学生たちは教室を出た。", options: ["かと思うと", "とたんに", "ながら"], answer: "かと思うと", jp_full: "ベルが鳴ったかと思うと、学生たちは教室を出た。", es: "Sonó la campana y en seguida los alumnos salieron.", why: "Secuencia inmediata observada。" },
  { id: 5, stem: "窓を閉めた（　　　）、静かになった。", options: ["とたんに", "かと思うと", "まえに"], answer: "とたんに", jp_full: "窓を閉めたとたんに、静かになった。", es: "Justo al cerrar la ventana, se hizo silencio.", why: "Efecto instantáneo。" },
  { id: 6, stem: "赤ちゃんは泣いた（　　　）、すぐ笑い出した。", options: ["かと思うと", "とたんに", "つつ"], answer: "かと思うと", jp_full: "赤ちゃんは泣いたかと思うと、すぐ笑い出した。", es: "El bebé lloró y, casi de inmediato, empezó a reír.", why: "Cambio A→B muy rápido。" },
  { id: 7, stem: "駅に着いた（　　　）、電車のドアが閉まった。", options: ["とたんに", "かと思うと", "ところで"], answer: "とたんに", jp_full: "駅に着いたとたんに、電車のドアが閉まった。", es: "Apenas llegué a la estación, se cerraron las puertas.", why: "Instante puntual + evento fuera de control。" },
  { id: 8, stem: "季節は春になった（　　　）、また寒くなった。", options: ["かと思うと", "とたんに", "ながら"], answer: "かと思うと", jp_full: "季節は春になったかと思うと、また寒くなった。", es: "Parecía que ya era primavera y volvió a hacer frío.", why: "Contraste rápido/ir y venirの感じ。" },
  { id: 9, stem: "薬を飲んだ（　　　）、眠気がきた。", options: ["とたんに", "かと思うと", "てから"], answer: "とたんに", jp_full: "薬を飲んだとたんに、眠気がきた。", es: "En cuanto tomé la medicina, me entró sueño.", why: "Reacción inmediata e involuntaria。" },
  { id:10, stem: "雲が出た（　　　）、すぐ消えた。", options: ["かと思うと", "とたんに", "ところ"], answer: "かと思うと", jp_full: "雲が出たかと思うと、すぐ消えた。", es: "Salieron nubes y al instante desaparecieron.", why: "Secuencia brevísima。" },
  { id:11, stem: "席を立った（　　　）、電話が鳴った。", options: ["とたんに", "かと思うと", "まえに"], answer: "とたんに", jp_full: "席を立ったとたんに、電話が鳴った。", es: "Justo me levanté y sonó el teléfono.", why: "Momento exacto + suceso fortuito。" },
  { id:12, stem: "さっき雨がやんだ（　　　）、また降り出した。", options: ["かと思うと", "とたんに", "つつ"], answer: "かと思うと", jp_full: "さっき雨がやんだかと思うと、また降り出した。", es: "Recién había parado y volvió a llover.", why: "A⇄B contraste inmediato。" },
];

/* ------------- EXTRA A (rellenar) — 6 ------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "ふい の できごと", jp_base: "外に出____ くしゃみが出た。", answer: "とたんに", jp_full: "外に出たとたんに くしゃみが出た。", es: "Apenas salí, estornudé.", why: "Reacción inesperada → とたん。" },
  { id: 2, hint: "はやい へんか", jp_base: "さっきまで暑かった____、急に寒くなった。", answer: "かと思うと", jp_full: "さっきまで暑かったかと思うと、急に寒くなった。", es: "Parecía que hacía calor y de golpe hizo frío.", why: "Cambio rápido/contraste。" },
  { id: 3, hint: "ふい", jp_base: "テレビをつけ____ 停電になった。", answer: "とたんに", jp_full: "テレビをつけたとたんに 停電になった。", es: "Justo encendí la TV y se cortó la luz.", why: "Suceso fortuito。" },
  { id: 4, hint: "すぐB", jp_base: "店が開いた____、人がならび始めた。", answer: "かと思うと", jp_full: "店が開いたかと思うと、人がならび始めた。", es: "Abrió la tienda y enseguida la gente hizo fila.", why: "Secuencia inmediata。" },
  { id: 5, hint: "ふい", jp_base: "座り____ 腰が痛くなった。", answer: "とたんに", jp_full: "座ったとたんに 腰が痛くなった。", es: "Apenas me senté, me dolió la cintura.", why: "Reacción involuntaria。" },
  { id: 6, hint: "たいしょう", jp_base: "晴れた____、また雨。", answer: "かと思うと", jp_full: "晴れたかと思うと、また雨。", es: "Parece que aclara y otra vez llueve.", why: "A⇄B alternancia。" },
];

/* ------------- Kanji nuevos de la unidad（10） ------------- */
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

/* ------------- Helpers ------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ------------- Screen ------------- */
export default function N3_B4_U20_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b4_u20.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B4 — 20 Momento exacto（とたん・かと思うと）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>とたん（に）</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>かと思うと</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 🧭 Guía clara */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía clara — Español</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_CLARA_ES}</Text></View>
          <Text style={[styles.h2, { marginTop: 10 }]}>🧭 ガイド — にほんご（かな）</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_CLARA_JA}</Text></View>
        </View>

        {/* 📘 Tabla */}
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

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (12)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* ⭐ EXTRA A */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra — Rellenar (6)</Text>
          {EXTRA_A.map((f) => (
            <FillItem key={f.id} f={f} onResult={(ok) => (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Pulsa “Trazos” para ver la imagen si la tienes generada.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (<KanjiCard key={k.hex} k={k} />))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ------------- Subcomponentes ------------- */
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
  const BANK = ["とたんに", "かと思うと"];

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

/* ------------- Kanji Card (usa *_nums.webp) ------------- */
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
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {};

function strokeSrc(hex: string): ImageSourcePropType | null {
  if (HAS_WEB[hex] && STROKES_WEB[hex]) return STROKES_WEB[hex]!;
  return STROKES_NUMS[hex] ?? null;
}

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
