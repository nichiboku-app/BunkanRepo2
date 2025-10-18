// ⿡ BLOQUE 5 — 2 Comparaciones —「〜だけでなく」「〜ばかりでなく」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b5_u2.webp

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
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ------------- Guía clara — ES & JA (hiragana) ------------- */
const GUIA_CLARA_ES = `⿡ Tema: Comparaciones・acumulación — 「〜だけでなく」「〜ばかりでなく」

1) 「A だけでなく B も」
• Forma:［名/普通形］+ だけでなく、B も
• Significado: “no solo A, sino también B”.
• Registro neutro y muy común. だけではなく también OK.
• Ej.: 彼は日本語だけでなく、英語も話せる。

2) 「A ばかりでなく B も」
• Más enfático/formal que だけでなく. A veces suena “además de A (excesivo), también B”.
• Ej.: 雨ばかりでなく、風も強かった。

Notas:
• Antes de だけでなく／ばかりでなく: 名詞/普通形（ナ形ならだ省略可）。
• Si B lleva も/まで/すら, refuerza la acumulación.`;

const GUIA_CLARA_JA = `⿡ 比較・付け足し：「〜だけでなく」「〜ばかりでなく」

① ［名・普通形］+ だけでなく、B（も）
・意味：A だけではなく B も。
・くだけた〜ふつう。

② ［名・普通形］+ ばかりでなく、B（も）
・ややかたい／つよい言い方。A にくわえて B も。
・例：雨ばかりでなく、風もつよかった。

★ ポイント
・B に「も／まで／すら」をよくつける。`;

/* ------------- Tabla de gramática (simple) ------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "〜だけでなく",   forma: "名/普通形 + だけでなく、B（も）", tradu: "No solo A, sino también B", nota: "registro neutro・muy común" },
  { patron: "〜ばかりでなく", forma: "名/普通形 + ばかりでなく、B（も）", tradu: "No solo A, incluso/además B", nota: "un poco más enfático/formal" },
];

/* ------------- PRÁCTICA (elige) — 12 ------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "彼は日本語（　　　）、英語も話せる。", options: ["だけでなく", "ばかりでなく", "につれて"], answer: "だけでなく", jp_full: "彼は日本語だけでなく、英語も話せる。", es: "No solo japonés: también habla inglés.", why: "Acumulación neutra → だけでなく。" },
  { id: 2, stem: "この店は味（　　　）、サービスもいい。", options: ["だけでなく", "ばかりでなく", "にしても"], answer: "だけでなく", jp_full: "この店は味だけでなく、サービスもいい。", es: "No solo el sabor: también el servicio es bueno.", why: "Listado positivo normal。" },
  { id: 3, stem: "昨日は雨（　　　）、雷まで鳴った。", options: ["ばかりでなく", "だけでなく", "こそ"], answer: "ばかりでなく", jp_full: "昨日は雨ばかりでなく、雷まで鳴った。", es: "No solo llovió: hasta hubo truenos.", why: "Matiz fuerte + まで → ばかりでなく。" },
  { id: 4, stem: "彼女は歌（　　　）、ダンスもプロ級だ。", options: ["だけでなく", "ばかりでなく", "など"], answer: "だけでなく", jp_full: "彼女は歌だけでなく、ダンスもプロ級だ。", es: "No solo cantar: también baila a nivel pro.", why: "Enumeración natural。" },
  { id: 5, stem: "この問題は学生（　　　）、先生にとっても難しい。", options: ["だけでなく", "ばかりでなく", "にとって"], answer: "だけでなく", jp_full: "この問題は学生だけでなく、先生にとっても難しい。", es: "No solo para alumnos: también para profesores es difícil.", why: "Acumulación de grupos。" },
  { id: 6, stem: "最近は大人（　　　）、子供までもスマホを持っている。", options: ["ばかりでなく", "だけでなく", "こそ"], answer: "ばかりでなく", jp_full: "最近は大人ばかりでなく、子供までもスマホを持っている。", es: "No solo los adultos: incluso los niños tienen smartphone.", why: "Enfático + までも → ばかりでなく。" },
  { id: 7, stem: "この映画は映像（　　　）、ストーリーも素晴らしい。", options: ["だけでなく", "ばかりでなく", "として"], answer: "だけでなく", jp_full: "この映画は映像だけでなく、ストーリーも素晴らしい。", es: "No solo la imagen: también la historia es excelente.", why: "Comparación equilibrada。" },
  { id: 8, stem: "彼は自分の仕事（　　　）、部下の仕事まで手伝う。", options: ["ばかりでなく", "だけでなく", "に限らず"], answer: "ばかりでなく", jp_full: "彼は自分の仕事ばかりでなく、部下の仕事まで手伝う。", es: "No solo su trabajo: ayuda hasta con el de sus subordinados.", why: "Enfático + まで → ばかりでなく。" },
  { id: 9, stem: "この町は自然（　　　）、文化も豊かだ。", options: ["だけでなく", "ばかりでなく", "からして"], answer: "だけでなく", jp_full: "この町は自然だけでなく、文化も豊かだ。", es: "No solo naturaleza: también cultura rica.", why: "Listado neutro。" },
  { id:10, stem: "事故は運転手（　　　）、会社の管理にも問題があった。", options: ["だけでなく", "ばかりでなく", "に違いない"], answer: "だけでなく", jp_full: "事故は運転手だけでなく、会社の管理にも問題があった。", es: "No solo el conductor: también hubo problemas de gestión.", why: "Acumulación explicativa。" },
  { id:11, stem: "彼は頭がいい（　　　）、性格もいい。", options: ["だけでなく", "ばかりでなく", "せいで"], answer: "だけでなく", jp_full: "彼は頭がいいだけでなく、性格もいい。", es: "No solo inteligente: también buen carácter.", why: "Atributos positivos." },
  { id:12, stem: "台風のせいで雨（　　　）、風まで強くなった。", options: ["ばかりでなく", "だけでなく", "くらい"], answer: "ばかりでなく", jp_full: "台風のせいで雨ばかりでなく、風まで強くなった。", es: "No solo lluvia: hasta el viento se intensificó.", why: "Enfático + まで。" },
];

/* ------------- EXTRA A (rellenar) — 6 ------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "acumulación neutra", jp_base: "東京（　　　）、大阪にも支社がある。", answer: "だけでなく", jp_full: "東京だけでなく、大阪にも支社がある。", es: "No solo Tokio: también Osaka.", why: "‘A だけでなく、B も’ patrón base。" },
  { id: 2, hint: "enfático + まで", jp_base: "値段（　　　）、デザインまで最高だ。", answer: "ばかりでなく", jp_full: "値段ばかりでなく、デザインまで最高だ。", es: "No solo el precio: hasta el diseño es top.", why: "ばかりでなく + まで。" },
  { id: 3, hint: "frase/verbo", jp_base: "走る（　　　）、泳ぐことも好きだ。", answer: "だけでなく", jp_full: "走るだけでなく、泳ぐことも好きだ。", es: "No solo correr: también nadar.", why: "普通形 + だけでなく。" },
  { id: 4, hint: "grupos", jp_base: "学生（　　　）、社会人も参加できる。", answer: "だけでなく", jp_full: "学生だけでなく、社会人も参加できる。", es: "No solo estudiantes: también trabajadores.", why: "名詞 + だけでなく。" },
  { id: 5, hint: "enfático", jp_base: "彼は成績（　　　）、スポーツも得意だ。", answer: "だけでなく", jp_full: "彼は成績だけでなく、スポーツも得意だ。", es: "No solo notas: también es bueno en deportes.", why: "Acumulación positiva。" },
  { id: 6, hint: "clima enfático", jp_base: "雨（　　　）、雪まで降ってきた。", answer: "ばかりでなく", jp_full: "雨ばかりでなく、雪まで降ってきた。", es: "No solo lluvia: incluso nevó.", why: "ばかりでなく + まで で強調。" },
];

/* ------------- Kanji de la unidad（10） ------------- */
/* Usa los mismos kanji/recursos que ya generaste en N3 (nombres *_nums.webp) */
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
export default function N3_B5_U2_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b5_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B5 — 2 Comparaciones（だけでなく・ばかりでなく）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>だけでなく</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>ばかりでなく</Text></View>
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
  const BANK = ["だけでなく", "ばかりでなく"];

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
        <Text style={[styles.jp, { color: palette.col }]}>{f.jp_base}</Text>
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
