// ⏱ BLOQUE 4 — 4 Cambios graduales —「〜につれて」「〜にしたがって」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b4_u4.webp

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
  N3_B4_U4_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B4_U4_Practice">;

type Quiz = {
  id: number; stem: string; options: string[]; answer: string;
  jp_full: string; es: string; why: string;
};
type Fill = {
  id: number; hint: string; jp_base: string; answer: string;
  jp_full: string; es: string; why: string;
};
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ------------- Guía clara — ES & JA (kana liviano) ------------- */
const GUIA_CLARA_ES = `🌸 Tema: Cambios graduales — 「につれて」 y 「にしたがって」

1) 「A に つれて B」
• Forma: N / V(る) + につれて
• Significado: “Aumenta/cambia A → de forma gradual cambia B”.
• Uso: procesos naturales, tendencia general (habla neutra).
• Ej.: 気温が下がるにつれて、木の色が かわる。
  → A medida que baja la temperatura, cambian los colores de los árboles.

2) 「A に したがって B」
• Forma: N / V(る) + にしたがって
• Significado: parecido a につれて, pero más formal/objetivo.
• También: “seguir una regla/orden” (※ otro uso de したがって).
• Ej.: 年齢が上がるにしたがって、体力は すこしずつ おちる。
  → Conforme sube la edad, la resistencia baja poco a poco.

Diferencia rápida:
• につれて → cambio natural/progresivo (tono neutral).
• にしたがって → cambio progresivo con tono más formal/objetivo.`;

const GUIA_CLARA_JA = `🌸 しだい に かわる： 「につれて」 と 「にしたがって」
① A につれて B：A が だんだん かわる と、B も かわる（ふつう）。
② A にしたがって B：ほぼ おなじ いみ、でも かたい・こうしき。
🧭 まとめ：にしたがって の ほう が フォーマル。`;

/* ------------- Tabla de gramática (simple) ------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "につれて",     forma: "N / V(る) + につれて、B", tradu: "A medida que A, B", nota: "tendencia natural / neutral" },
  { patron: "にしたがって", forma: "N / V(る) + にしたがって、B", tradu: "Conforme A, B", nota: "más formal / objetivo" },
];

/* ------------- PRÁCTICA (elige) — 12 ------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "年齢が上がる（　　　）、体力は少しずつ落ちる。", options: ["につれて", "にしたがって", "ながら"], answer: "にしたがって", jp_full: "年齢が上がるにしたがって、体力は少しずつ落ちる。", es: "Conforme sube la edad, baja la resistencia.", why: "Tono objetivo/formal → にしたがって。" },
  { id: 2, stem: "気温が下がる（　　　）、紅葉が広がる。", options: ["につれて", "にしたがって", "てから"], answer: "につれて", jp_full: "気温が下がるにつれて、紅葉が広がる。", es: "A medida que baja la temperatura, se extienden los colores otoñales.", why: "Proceso natural → につれて。" },
  { id: 3, stem: "データが集まる（　　　）、分析は正確になる。", options: ["につれて", "にしたがって", "うちに"], answer: "にしたがって", jp_full: "データが集まるにしたがって、分析は正確になる。", es: "Conforme se acumulan datos, el análisis se vuelve más preciso.", why: "Informe/objetivo → にしたがって。" },
  { id: 4, stem: "日が長くなる（　　　）、朝の気温も上がってきた。", options: ["につれて", "にしたがって", "ところで"], answer: "につれて", jp_full: "日が長くなるにつれて、朝の気温も上がってきた。", es: "A medida que los días se alargan, sube la temperatura matinal.", why: "Cambio natural de estación。" },
  { id: 5, stem: "技術が進歩する（　　　）、生活は便利になる。", options: ["にしたがって", "につれて", "ながら"], answer: "にしたがって", jp_full: "技術が進歩するにしたがって、生活は便利になる。", es: "Conforme avanza la tecnología, la vida se hace más cómoda.", why: "Tono expositivo → にしたがって。" },
  { id: 6, stem: "山を登る（　　　）、空気がうすくなる。", options: ["につれて", "にしたがって", "ところ"], answer: "につれて", jp_full: "山を登るにつれて、空気がうすくなる。", es: "A medida que subes la montaña, el aire se vuelve más fino.", why: "Fenómeno físico natural → につれて。" },
  { id: 7, stem: "経験が増える（　　　）、判断は落ち着いてくる。", options: ["にしたがって", "につれて", "てから"], answer: "にしたがって", jp_full: "経験が増えるにしたがって、判断は落ち着いてくる。", es: "Conforme aumenta la experiencia, el juicio se serena.", why: "Tono evaluativo/formal。" },
  { id: 8, stem: "時間が経つ（　　　）、記憶はあいまいになる。", options: ["につれて", "にしたがって", "まえに"], answer: "につれて", jp_full: "時間が経つにつれて、記憶はあいまいになる。", es: "A medida que pasa el tiempo, el recuerdo se vuelve difuso.", why: "Tendencia natural del recuerdo。" },
  { id: 9, stem: "利用者が増える（　　　）、システムを拡張した。", options: ["にしたがって", "につれて", "あとで"], answer: "にしたがって", jp_full: "利用者が増えるにしたがって、システムを拡張した。", es: "Conforme crecían los usuarios, se amplió el sistema.", why: "Redacción de informe → にしたがって。" },
  { id:10, stem: "試合が進む（　　　）、会場は盛り上がっていった。", options: ["につれて", "にしたがって", "ところで"], answer: "につれて", jp_full: "試合が進むにつれて、会場は盛り上がっていった。", es: "A medida que avanzaba el partido, el público se animó.", why: "Movimiento natural del ambiente。" },
  { id:11, stem: "年数を重ねる（　　　）、彼の作風は成熟した。", options: ["にしたがって", "につれて", "うちに"], answer: "にしたがって", jp_full: "年数を重ねるにしたがって、彼の作風は成熟した。", es: "Con los años, su estilo maduró.", why: "Narración formal/biográfica。" },
  { id:12, stem: "スマホの性能が上がる（　　　）、写真はさらに美しくなった。", options: ["につれて", "にしたがって", "てから"], answer: "につれて", jp_full: "スマホの性能が上がるにつれて、写真はさらに美しくなった。", es: "A medida que mejoró el móvil, las fotos se hicieron mejores.", why: "Tendencia visible / cotidiano。" },
];

/* ------------- EXTRA A (rellenar) — 7 ------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "natural", jp_base: "夜がふける____、町はしずかになる。", answer: "につれて", jp_full: "夜がふけるにつれて、町はしずかになる。", es: "A medida que avanza la noche, la ciudad se calma.", why: "Cambio natural → につれて。" },
  { id: 2, hint: "formal", jp_base: "人口がふえる____、政策の見直しが必要だ。", answer: "にしたがって", jp_full: "人口がふえるにしたがって、政策の見直しが必要だ。", es: "Conforme crece la población, hay que revisar políticas.", why: "Tono de informe → にしたがって。" },
  { id: 3, hint: "natural", jp_base: "雲が多くなる____、気温は下がった。", answer: "につれて", jp_full: "雲が多くなるにつれて、気温は下がった。", es: "A medida que aumentaron las nubes, bajó la temperatura.", why: "Fenómeno del clima。" },
  { id: 4, hint: "formal", jp_base: "売上が上がる____、投資をひろげた。", answer: "にしたがって", jp_full: "売上が上がるにしたがって、投資をひろげた。", es: "Conforme subieron las ventas, ampliaron inversión.", why: "Redacción empresarial。" },
  { id: 5, hint: "natural", jp_base: "音量を上げる____、ひずみが出てくる。", answer: "につれて", jp_full: "音量を上げるにつれて、ひずみが出てくる。", es: "Al subir el volumen, aparece distorsión.", why: "Relación gradual directa。" },
  { id: 6, hint: "formal", jp_base: "年次が進む____、要件はきびしくなる。", answer: "にしたがって", jp_full: "年次が進むにしたがって、要件はきびしくなる。", es: "Conforme avanza el curso, las exigencias aumentan.", why: "Tono académico。" },
  { id: 7, hint: "natural", jp_base: "川に近づく____、風がつめたく感じた。", answer: "につれて", jp_full: "川に近づくにつれて、風がつめたく感じた。", es: "A medida que me acercaba al río, el viento se sentía más frío.", why: "Percepción física/natural。" },
];

/* ------------- EXTRA B (rápidas) — 6 ------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "formal", jp_base: "データ量がふえる____、処理時間ものびる。", answer: "にしたがって", jp_full: "データ量がふえるにしたがって、処理時間ものびる。", es: "Con más datos, crece el tiempo de proceso.", why: "Informe técnico。" },
  { id: 2, hint: "natural", jp_base: "練習を重ねる____、発音はなめらかになる。", answer: "につれて", jp_full: "練習を重ねるにつれて、発音はなめらかになる。", es: "Con práctica, la pronunciación se suaviza.", why: "Mejora gradual natural。" },
  { id: 3, hint: "formal", jp_base: "年齢層が上がる____、ニーズは多様になる。", answer: "にしたがって", jp_full: "年齢層が上がるにしたがって、ニーズは多様になる。", es: "Conforme aumenta la edad del grupo, cambian las necesidades.", why: "Redacción objetiva。" },
  { id: 4, hint: "natural", jp_base: "空が明るくなる____、鳥の声がふえる。", answer: "につれて", jp_full: "空が明るくなるにつれて、鳥の声がふえる。", es: "Al aclarar el cielo, aumentan los cantos.", why: "Fenómeno natural。" },
  { id: 5, hint: "formal", jp_base: "要件がふくざつになる____、レビュー回数をふやした。", answer: "にしたがって", jp_full: "要件がふくざつになるにしたがって、レビュー回数をふやした。", es: "Conforme se hizo complejo, aumentaron las revisiones.", why: "Memoria de proyecto。" },
  { id: 6, hint: "natural", jp_base: "町がにぎやかになる____、屋台がならんだ。", answer: "につれて", jp_full: "町がにぎやかになるにつれて、屋台がならんだ。", es: "A medida que se animó el pueblo, aparecieron puestos.", why: "Evolución espontánea。" },
];

/* ------------- Kanji de la unidad（10） ------------- */
const KANJI: Kanji[] = [
  { hex: "50be", char: "傾", gloss: "tender/inclinar", sample: "傾向（けいこう）", strokes: 13 },
  { hex: "79fb", char: "移", gloss: "mover/cambiar", sample: "移動（いどう）", strokes: 11 },
  { hex: "63a8", char: "推", gloss: "empujar/estimar", sample: "推移（すいい）", strokes: 11 },
  { hex: "7387", char: "率", gloss: "tasa", sample: "率（りつ）", strokes: 11 },
  { hex: "4f38", char: "伸", gloss: "estirar", sample: "伸びる（のびる）", strokes: 7 },
  { hex: "7e2e", char: "縮", gloss: "encoger", sample: "縮小（しゅくしょう）", strokes: 17 },
  { hex: "5f37", char: "強", gloss: "fuerte", sample: "強い（つよい）", strokes: 11 },
  { hex: "5f31", char: "弱", gloss: "débil", sample: "弱い（よわい）", strokes: 10 },
  { hex: "5f71", char: "影", gloss: "sombra/impacto", sample: "影響（えいきょう）", strokes: 15 },
  { hex: "9077", char: "遷", gloss: "trasladar", sample: "遷移（せんい）", strokes: 15 },
];

/* ------------- Helpers ------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ------------- Screen ------------- */
export default function N3_B4_U4_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b4_u4.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B4 — 4 Cambios graduales（につれて・にしたがって）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>につれて</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>にしたがって</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16} showsVerticalScrollIndicator={false}
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
          <Text style={styles.h2}>📘 Forma y matiz</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.0 }]}>Patrón</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Forma</Text>
              <Text style={[styles.th, { flex: 1.0 }]}>Traducción</Text>
              <Text style={[styles.th, { flex: 1.3 }]}>Nota</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.0, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.0 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.3 }]}>{r.nota}</Text>
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
          <Text style={styles.p}>Pulsa “Trazos” para ver la imagen de trazos (nums).</Text>
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
  const BANK = ["につれて", "にしたがって"];

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
        <Text style={[styles.jpStrong, { color: palette.col }]}>{f.jp_base.replace("____", "＿＿")}</Text>
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

/* ------------- Kanji Card (sin require dinámico) ------------- */
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
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = { /* opcional */ };

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
