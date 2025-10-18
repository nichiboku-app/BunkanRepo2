// ⏱ BLOQUE 4 — 3 Al mismo tiempo —「〜ながら」「〜つつ」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b4_u3.webp

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
  N3_B4_U3_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B4_U3_Practice">;

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

/* ------------- Guía clara (hiragana) — visible ------------- */
/* ------------- Guía clara (hiragana) — visible ------------- */
/* ------------- Guía clara — ES & JA (hiragana) ------------- */
const GUIA_CLARA_ES = `🌸 Tema: Acciones simultáneas — 「ながら」 y 「つつ」

1) 「A ながら B」
• Uso: el más común y natural (conversación).
• Forma: Verbo (raíz -ます) + ながら
• Significado: B ocurre mientras haces A (mismo sujeto).
• Ejemplo: おんがく を ききながら べんきょうする。
  → Estudio mientras escucho música.

2) 「A つつ B」
• Uso: más formal / estilo escrito.
• Forma: Verbo (raíz -ます) + つつ
• Significados:
  (a) Simultáneo formal: “B mientras A”.
      例: あんぜん を いしき しつつ、さぎょう を すすめる。
  (b) Contradicción (〜つつも): “Aunque A, también B”.
      例: 体 に わるい と しりつつ（も）、すって しまう。
      → Aunque sé que es malo, fumo.

Diferencia clave:
• ながら = natural y cotidiano; conversación.
• つつ = formal/escrito; además permite “aunque…” con つつ（も）.`;

const GUIA_CLARA_JA = `🌸 どうじ の こうどう：「ながら」 と 「つつ」

① 「A ながら B」
・かたち：V（ます を とる）+ ながら
・いみ：A と B を おなじ ひと が どうじ に する。
・れい：おんがく を ききながら べんきょうする。

② 「A つつ B」
・かたち：V（ます を とる）+ つつ
・いみ１：フォーマル に「A しながら B」。
・いみ２：「〜つつ（も）」＝『A と わかって いる が、B』。
  れい：体 に わるい と しりつつ（も）、すって しまう。

🧭 まとめ
・ながら → にちじょう・かいわ。
・つつ → フォーマル・ぶんしょう。「つつ（も）」＝『〜だが…』。`;

/* ------------- Tabla de gramática (simple, sin kanji) ------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "ながら",     forma: "V（raíz -ます）+ ながら、B",     tradu: "B mientras A", nota: "Uso cotidiano; mismo sujeto" },
  { patron: "つつ",       forma: "V（raíz -ます）+ つつ、B",       tradu: "B mientras A", nota: "Formal/escrito" },
  { patron: "つつ（も）", forma: "V（raíz -ます）+ つつ（も）、B", tradu: "Aunque A, B",  nota: "Contradicción/reflexión" },
];



/* ------------- PRÁCTICA (elige) — 12 ------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "音楽を聞き（　　　）、宿題をする。", options: ["ながら", "つつ", "てから"], answer: "ながら", jp_full: "音楽を聞きながら、宿題をする。", es: "Hago la tarea mientras escucho música.", why: "Uso normal y neutro → ながら。" },
  { id: 2, stem: "ニュースを見（　　　）、朝ごはんを食べた。", options: ["ながら", "つつ", "まえに"], answer: "ながら", jp_full: "ニュースを見ながら、朝ごはんを食べた。", es: "Desayuné mientras veía las noticias.", why: "Simultáneo con mismo sujeto。" },
  { id: 3, stem: "安全を考え（　　　）、作業を進めます。", options: ["ながら", "つつ", "ところで"], answer: "つつ", jp_full: "安全を考えつつ、作業を進めます。", es: "Avanzamos el trabajo mientras pensamos en la seguridad.", why: "Registro formal → つつ。" },
  { id: 4, stem: "彼は笑い（　　　）、話し続けた。", options: ["ながら", "つつ", "あとで"], answer: "ながら", jp_full: "彼は笑いながら、話し続けた。", es: "Seguía hablando mientras reía.", why: "Uso coloquial → ながら。" },
  { id: 5, stem: "改善の必要性を認め（　　　）、放置している。", options: ["ながら", "つつ", "てから"], answer: "つつ", jp_full: "改善の必要性を認めつつ、放置している。", es: "Aunque reconoce que hay que mejorar, lo deja así.", why: "つつ tiene matiz ‘aunque al tiempo que’, formal." },
  { id: 6, stem: "歩き（　　　）スマホを使うのは危ない。", options: ["ながら", "つつ", "ところ"], answer: "ながら", jp_full: "歩きながらスマホを使うのは危ない。", es: "Usar el móvil mientras caminas es peligroso.", why: "Expresión fija ‘歩きながら…’。" },
  { id: 7, stem: "資料を確認し（　　　）、議論を進めた。", options: ["つつ", "ながら", "まえに"], answer: "つつ", jp_full: "資料を確認しつつ、議論を進めた。", es: "Avanzamos la discusión mientras revisábamos los materiales.", why: "Tono formal de reunión → つつ。" },
  { id: 8, stem: "泣き（　　　）、本当の気持ちを話した。", options: ["つつ", "ながら", "あとで"], answer: "ながら", jp_full: "泣きながら、本当の気持ちを話した。", es: "Habló de sus verdaderos sentimientos mientras lloraba.", why: "Emocional/coloquial → ながら。" },
  { id: 9, stem: "危険を承知し（　　　）、前へ進む。", options: ["ながら", "つつ", "てから"], answer: "つつ", jp_full: "危険を承知しつつ、前へ進む。", es: "Aun sabiendo el riesgo, sigo adelante.", why: "‘aunque…’ matiz formal de つつ。" },
  { id:10, stem: "音声を聞き（　　　）メモを取ってください。", options: ["ながら", "つつ", "まえに"], answer: "ながら", jp_full: "音声を聞きながらメモを取ってください。", es: "Escuchen el audio mientras toman notas.", why: "Instrucción directa → ながら。" },
  { id:11, stem: "反省し（　　　）、次の案を考える。", options: ["ながら", "つつ", "ところで"], answer: "つつ", jp_full: "反省しつつ、次の案を考える。", es: "Mientras reflexionamos, pensamos la siguiente propuesta.", why: "Acta / redacción formal → つつ。" },
  { id:12, stem: "歌い（　　　）歩くのが好きだ。", options: ["つつ", "ながら", "てから"], answer: "ながら", jp_full: "歌いながら歩くのが好きだ。", es: "Me gusta caminar cantando.", why: "Uso natural → ながら。" },
];

/* ------------- EXTRA A (rellenar) — 7 ------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "ふつう", jp_base: "テレビを見____ ごはんを食べる。", answer: "ながら", jp_full: "テレビを見ながら ごはんを食べる。", es: "Como mientras veo la tele.", why: "ながら = uso común." },
  { id: 2, hint: "かたい", jp_base: "周囲を気にし____ 仕事を進めた。", answer: "つつ", jp_full: "周囲を気にしつつ 仕事を進めた。", es: "Avancé el trabajo teniendo en cuenta el entorno.", why: "Formal → つつ。" },
  { id: 3, hint: "どうしゅ おなじ", jp_base: "スマホを使い____ 歩くのは危険。", answer: "ながら", jp_full: "スマホを使いながら 歩くのは危険。", es: "Caminar usando el móvil es peligroso.", why: "Mismo sujeto, acción simultánea." },
  { id: 4, hint: "れんしゅう会議文体", jp_base: "問題点を認め____、対策を検討する。", answer: "つつ", jp_full: "問題点を認めつつ、対策を検討する。", es: "Reconociendo los problemas, se estudian medidas.", why: "Estilo acta → つつ。" },
  { id: 5, hint: "感情＋動作", jp_base: "笑い____ 写真を撮った。", answer: "ながら", jp_full: "笑いながら 写真を撮った。", es: "Tomé la foto mientras reía.", why: "Coloquial → ながら。" },
  { id: 6, hint: "かたい", jp_base: "安全を意識し____ 作業してください。", answer: "つつ", jp_full: "安全を意識しつつ 作業してください。", es: "Trabajen siendo conscientes de la seguridad.", why: "Instrucción formal → つつ。" },
  { id: 7, hint: "ふつう", jp_base: "音楽を聞き____ 走る。", answer: "ながら", jp_full: "音楽を聞きながら 走る。", es: "Corro mientras escucho música.", why: "Uso natural → ながら。" },
];

/* ------------- EXTRA B (rápidas) — 6 ------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "ふつう", jp_base: "本を読み____ 寝てしまった。", answer: "ながら", jp_full: "本を読みながら 寝てしまった。", es: "Me dormí mientras leía.", why: "ながら。" },
  { id: 2, hint: "かたい", jp_base: "資料を参照し____ 作成する。", answer: "つつ", jp_full: "資料を参照しつつ 作成する。", es: "Se elabora consultando los materiales.", why: "Formal → つつ。" },
  { id: 3, hint: "ふつう", jp_base: "歌い____ 掃除する。", answer: "ながら", jp_full: "歌いながら 掃除する。", es: "Limpio cantando.", why: "ながら。" },
  { id: 4, hint: "かたい", jp_base: "課題を意識し____ 前進する。", answer: "つつ", jp_full: "課題を意識しつつ 前進する。", es: "Avanzamos siendo conscientes de los retos.", why: "Acta/boletín → つつ。" },
  { id: 5, hint: "ふつう", jp_base: "話し____ 料理を作った。", answer: "ながら", jp_full: "話しながら 料理を作った。", es: "Cocinaba mientras hablaba.", why: "Coloquial → ながら。" },
  { id: 6, hint: "かたい", jp_base: "改善を図り____ 運用する。", answer: "つつ", jp_full: "改善を図りつつ 運用する。", es: "Operar buscando mejoras.", why: "Técnico → つつ。" },
];

/* ------------- Kanji nuevos de la unidad（10） ------------- */
const KANJI: Kanji[] = [
  { hex: "5fd9", char: "忙", gloss: "ocupado",     sample: "忙しい（いそがしい）", strokes: 6 },
  { hex: "696d", char: "業", gloss: "actividad",   sample: "作業（さぎょう）", strokes: 13 },
  { hex: "8077", char: "職", gloss: "empleo",      sample: "職場（しょくば）", strokes: 18 },
  { hex: "6df1", char: "深", gloss: "profundo",    sample: "深い（ふかい）", strokes: 11 },
  { hex: "6d45", char: "浅", gloss: "superficial", sample: "浅い（あさい）", strokes: 9 },
  { hex: "5ff5", char: "念", gloss: "idea",        sample: "記念（きねん）", strokes: 8 },
  { hex: "5909", char: "変", gloss: "cambiar",     sample: "変更（へんこう）", strokes: 9 },
  { hex: "5897", char: "増", gloss: "aumentar",    sample: "増える（ふえる）", strokes: 14 },
  { hex: "6e1b", char: "減", gloss: "disminuir",   sample: "減る（へる）", strokes: 12 },
  { hex: "8868", char: "表", gloss: "expresar",    sample: "発表（はっぴょう）", strokes: 8 },
];

/* ------------- Helpers ------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ------------- Screen ------------- */
export default function N3_B4_U3_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b4_u3.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B4 — 3 Al mismo tiempo（ながら・つつ）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>ながら</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>つつ</Text></View>
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
              <Text style={[styles.th, { flex: 1.0 }]}>パターン</Text>
              <Text style={[styles.th, { flex: 1.6 }]}>かたち</Text>
              <Text style={[styles.th, { flex: 1.0 }]}>意味（ES）</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>メモ</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.0, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.6 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.0 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.nota}</Text>
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
  const BANK = ["ながら", "つつ"];

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

/* ------------- Kanji Card (sin require dinámico) ------------- */

// marca en true cuando tengas *_web.webp
const HAS_WEB: Record<string, boolean> = {};

// *_nums.webp (añade estos archivos al repo: ver comando abajo)
const STROKES_NUMS: Record<string, ImageSourcePropType> = {
  "5fd9": require("../../../../assets/kanjivg/n3/5fd9_nums.webp"),
  "696d": require("../../../../assets/kanjivg/n3/696d_nums.webp"),
  "8077": require("../../../../assets/kanjivg/n3/8077_nums.webp"),
  "6df1": require("../../../../assets/kanjivg/n3/6df1_nums.webp"),
  "6d45": require("../../../../assets/kanjivg/n3/6d45_nums.webp"),
  "5ff5": require("../../../../assets/kanjivg/n3/5ff5_nums.webp"),
  "5909": require("../../../../assets/kanjivg/n3/5909_nums.webp"),
  "5897": require("../../../../assets/kanjivg/n3/5897_nums.webp"),
  "6e1b": require("../../../../assets/kanjivg/n3/6e1b_nums.webp"),
  "8868": require("../../../../assets/kanjivg/n3/8868_nums.webp"),
};

// si luego generas *_web.webp
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {
  // "5fd9": require("../../../../assets/kanjivg/n3/5fd9_web.webp"),
};

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
