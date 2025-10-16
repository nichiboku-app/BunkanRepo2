// 🌀 BLOQUE 3 — 2 Condiciones hipotéticas o instrucciones
// U2: Hipótesis y concesión（〜ても・〜としても）— PRÁCTICA
// Hero: ../../../../assets/images/n3/b3_u2.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
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
  N3_B3_U2_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B3_U2_Practice">;

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

/* ---------------- Gramática clara (nivel primaria) ----------------
PISTA RÁPIDA:
1) 〜ても ＝ “aunque …, (B)”
   • Concedo A, pero hago/vale B igual.
   • Uso diario, natural: 雨が降っても行く（aunque llueva, voy）

   Formación:
   • Vて + も（行っても／食べても）
   • Adjい → くても（高くても）
   • Adjな／N → でも（便利でも／学生でも）
   • Negativo → 〜なくても（行かなくても）

2) 〜としても ＝ “aun si (lo damos por caso) …, (B no cambia)”
   • Asumo A como hipótesis para argumentar; suena más lógico/serio.
   • 彼が犯人だとしても、証拠が必要だ（aunque fuera culpable, igual se necesita prueba）

   Formación:
   • V・Adjい・Adjな(だ)・N(だ) + としても

TRUCOS:
• 「いくら／どんなに〜ても」＝ “por más que…”
• 「疑問詞 + ても」＝ “no importa quién/cuándo/dónde…”
• OJO con 〜なくても： puede significar “no hace falta…” (行かなくてもいい).
------------------------------------------------------------------*/

type Row = { patron: string; ejemplo: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "Vて + も", ejemplo: "雨が降っても行く", tradu: "Aunque llueva, voy.", nota: "Concesión directa / cotidiano" },
  { patron: "Adjい → くても", ejemplo: "高くても買わない", tradu: "Aunque sea caro, no compro.", nota: "Con い-adjetivo" },
  { patron: "Adjな／N → でも", ejemplo: "便利でも買わない／学生でも入れる", tradu: "Aunque sea conveniente / Incluso siendo estudiante", nota: "Valor ‘aunque / incluso’" },
  { patron: "否定 → 〜なくても", ejemplo: "行かなくてもいい", tradu: "No hace falta ir.", nota: "Permiso/ausencia de necesidad" },
  { patron: "V・Adj・N + としても", ejemplo: "間違いだとしても責任を取る", tradu: "Aun si fuera un error, asumo responsabilidad.", nota: "Hipótesis asumida para argumentar" },
  { patron: "Refuerzos", ejemplo: "いくら説明しても／誰が言っても", tradu: "Por más que explique / No importa quién lo diga", nota: "Fórmulas hechas con ても" },
];

/* ---------------- PRÁCTICA (elige) ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "たとえ雨が降っ＿＿、行きます。", options: ["ても","としても"], answer: "ても", jp_full: "たとえ雨が降っても、行きます。", es: "Aunque llueva, voy.", why: "Fórmula fija: たとえ〜ても." },
  { id: 2, stem: "今から出発する＿＿、間に合わない。", options: ["ても","としても"], answer: "としても", jp_full: "今から出発するとしても、間に合わない。", es: "Aun saliendo ahora, no alcanzamos.", why: "Hipótesis adoptada para razonar → としても." },
  { id: 3, stem: "いくら説明し＿＿、分からない。", options: ["ても","としても"], answer: "ても", jp_full: "いくら説明しても、分からない。", es: "Por más que explique, no entiende.", why: "Patrón intensificador いくら〜ても." },
  { id: 4, stem: "彼が犯人だ＿＿、証拠が必要だ。", options: ["ても","としても"], answer: "としても", jp_full: "彼が犯人だとしても、証拠が必要だ。", es: "Aun si fuera el culpable, se necesitan pruebas.", why: "Argumento lógico → としても." },
  { id: 5, stem: "高く＿＿、買いません。", options: ["ても","としても"], answer: "ても", jp_full: "高くても、買いません。", es: "Aunque esté caro, no lo compro.", why: "Concesión cotidiana → ても." },
  { id: 6, stem: "学生だ＿＿、入場は有料です。", options: ["ても","としても"], answer: "としても", jp_full: "学生だとしても、入場は有料です。", es: "Aun si fueras estudiante, la entrada cuesta.", why: "Asumo el caso ‘ser estudiante’ → としても." },
  { id: 7, stem: "誰が言っ＿＿、同じだ。", options: ["ても","としても"], answer: "ても", jp_full: "誰が言っても、同じだ。", es: "Da igual quién lo diga, es lo mismo.", why: "疑問詞 + ても = ‘no importa quién’." },
  { id: 8, stem: "彼女に会え＿＿、伝えることがある。", options: ["ても","としても"], answer: "としても", jp_full: "彼女に会えるとしても、伝えることがある。", es: "Incluso si pudiera verla, tengo algo que decir.", why: "Caso poco probable adoptado → としても." },
  { id: 9, stem: "忙しく＿＿、運動するべきだ。", options: ["ても","としても"], answer: "ても", jp_full: "忙しくても、運動するべきだ。", es: "Aunque estés ocupado, deberías ejercitar.", why: "Concesión directa con い形容詞." },
  { id: 10, stem: "間違いだ＿＿、責任を取ります。", options: ["ても","としても"], answer: "としても", jp_full: "間違いだとしても、責任を取ります。", es: "Aun si fuera un error, asumiré la responsabilidad.", why: "Postura declarada bajo hipótesis → としても." },
  { id: 11, stem: "寒く＿＿、外で遊びたい。", options: ["ても","としても"], answer: "ても", jp_full: "寒くても、外で遊びたい。", es: "Aunque haga frío, quiero jugar afuera.", why: "Concesión de estado → ても." },
  { id: 12, stem: "彼が来ない＿＿、始めます。", options: ["ても","としても"], answer: "としても", jp_full: "彼が来ないとしても、始めます。", es: "Aun si él no viene, empezamos.", why: "Hipótesis para planear → としても." },
  { id: 13, stem: "たとえ一人＿＿、やり抜く。", options: ["でも","としても"], answer: "でも", jp_full: "たとえ一人でも、やり抜く。", es: "Aunque esté solo, lo terminaré.", why: "Con N/Adjな se usa でも (valor ‘incluso’)." },
  { id: 14, stem: "安い＿＿、品質は大事だ。", options: ["としても","ても"], answer: "としても", jp_full: "安いとしても、品質は大事だ。", es: "Aun si fuera barato, la calidad importa.", why: "Comparación lógica con caso hipotético → としても." },
];

/* ---------------- EXTRA A (rellenar guiado) ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "いくら〜ても", jp_base: "いくら待っ____、来ない。", answer: "ても", jp_full: "いくら待っても、来ない。", es: "Por más que espere, no viene.", why: "Patrón intensificador いくら〜ても." },
  { id: 2, hint: "たとえ〜ても", jp_base: "たとえ失敗し____、続けます。", answer: "ても", jp_full: "たとえ失敗しても、続けます。", es: "Aunque fracase, seguiré.", why: "Fórmula fuerte de concesión." },
  { id: 3, hint: "Nだとしても", jp_base: "子ども____、責任がある。", answer: "だとしても", jp_full: "子どもだとしても、責任がある。", es: "Aun si es un niño, tiene responsabilidad.", why: "Sustantivo + だとしても." },
  { id: 4, hint: "Adjい", jp_base: "難しく____、挑戦したい。", answer: "ても", jp_full: "難しくても、挑戦したい。", es: "Aunque sea difícil, quiero intentarlo.", why: "い形容詞 + くても." },
  { id: 5, hint: "Adjな", jp_base: "便利____、買わない。", answer: "でも", jp_full: "便利でも、買わない。", es: "Aunque sea conveniente, no lo compro.", why: "な形容詞 + でも." },
  { id: 6, hint: "V否定仮定", jp_base: "行かない____、連絡して。", answer: "としても", jp_full: "行かないとしても、連絡して。", es: "Aun si no vas, avisa.", why: "Caso adoptado (no ir) para dar instrucción." },
  { id: 7, hint: "誰が〜ても", jp_base: "誰が言っ____、事実は事実だ。", answer: "ても", jp_full: "誰が言っても、事実は事実だ。", es: "Da igual quién lo diga, un hecho es un hecho.", why: "疑問詞 + ても." },
  { id: 8, hint: "Nでも", jp_base: "雨____、試合はある。", answer: "でも", jp_full: "雨でも、試合はある。", es: "Incluso con lluvia, hay partido.", why: "Con N se usa でも." },
  { id: 9, hint: "Vて + も", jp_base: "食べ____、まだ足りない。", answer: "ても", jp_full: "食べても、まだ足りない。", es: "Aunque coma, aún no alcanza.", why: "動詞て + も." },
  { id: 10, hint: "V可能形 + としても", jp_base: "行ける____、行かない。", answer: "としても", jp_full: "行けるとしても、行かない。", es: "Aun si pudiera ir, no voy.", why: "Hipótesis asumida para postura." },
  { id: 11, hint: "Vなくても", jp_base: "連絡し____大丈夫です。", answer: "なくても", jp_full: "連絡しなくても大丈夫です。", es: "No hace falta llamar / Aunque no llames, OK.", why: "Concesión/permiso negativo." },
  { id: 12, hint: "時間", jp_base: "時間がなく____、諦めない。", answer: "ても", jp_full: "時間がなくても、諦めない。", es: "Aunque no tenga tiempo, no me rindo.", why: "名詞由来の形容詞 + ても." },
  { id: 13, hint: "Nだとしても", jp_base: "仮説____、検証が必要だ。", answer: "だとしても", jp_full: "仮説だとしても、検証が必要だ。", es: "Aun si fuera hipótesis, hay que verificar.", why: "Sustantivo + だとしても." },
  { id: 14, hint: "Vて + も", jp_base: "頑張っ____、結果がすぐ出ないこともある。", answer: "ても", jp_full: "頑張っても、結果がすぐ出ないこともある。", es: "Aunque te esfuerces, a veces no hay resultados inmediatos.", why: "Concesión general." },
];

/* ---------------- EXTRA B (rápidas) ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "ても", jp_base: "寒く____、行きます。", answer: "ても", jp_full: "寒くても、行きます。", es: "Aunque haga frío, voy.", why: "い形容詞 + くても." },
  { id: 2, hint: "としても", jp_base: "今から行く____、遅いです。", answer: "としても", jp_full: "今から行くとしても、遅いです。", es: "Aun si vamos ahora, será tarde.", why: "Caso adoptado." },
  { id: 3, hint: "でも", jp_base: "学生____、買えます。", answer: "でも", jp_full: "学生でも、買えます。", es: "Incluso siendo estudiante, se puede comprar.", why: "N + でも." },
  { id: 4, hint: "ても", jp_base: "高く____、買います。", answer: "ても", jp_full: "高くても、買います。", es: "Aunque sea caro, lo compro.", why: "Concesión simple." },
  { id: 5, hint: "としても", jp_base: "雨じゃない____、濡れるかも。", answer: "としても", jp_full: "雨じゃないとしても、濡れるかも。", es: "Aun si no es lluvia, quizá te mojes.", why: "Hipótesis lógica." },
  { id: 6, hint: "ても", jp_base: "忙しく____、休みます。", answer: "ても", jp_full: "忙しくても、休みます。", es: "Aunque esté ocupado, descanso.", why: "Concesión de estado." },
  { id: 7, hint: "なくても", jp_base: "行か____いいです。", answer: "なくても", jp_full: "行かなくてもいいです。", es: "No hace falta ir.", why: "Permiso/ausencia de necesidad." },
  { id: 8, hint: "ても", jp_base: "小さく____、見える。", answer: "ても", jp_full: "小さくても、見える。", es: "Aunque sea pequeño, se ve.", why: "Concesión." },
  { id: 9, hint: "としても", jp_base: "安い____、買わない。", answer: "としても", jp_full: "安いとしても、買わない。", es: "Aun si fuera barato, no compro.", why: "Comparación lógica." },
  { id: 10, hint: "でも", jp_base: "雨____行こう。", answer: "でも", jp_full: "雨でも行こう。", es: "Aunque llueva, vamos.", why: "N + でも." },
  { id: 11, hint: "ても", jp_base: "食べ____お腹がすく。", answer: "ても", jp_full: "食べてもお腹がすく。", es: "Aunque coma, me da hambre.", why: "Vて + も." },
  { id: 12, hint: "としても", jp_base: "できる____、今はしない。", answer: "としても", jp_full: "できるとしても、今はしない。", es: "Aunque pudiera, ahora no lo hago.", why: "Hipótesis asumida." },
  { id: 13, hint: "でも", jp_base: "一人____頑張る。", answer: "でも", jp_full: "一人でも頑張る。", es: "Aunque esté solo, me esfuerzo.", why: "N + でも (incluso)." },
  { id: 14, hint: "ても", jp_base: "どんなに遠く____行きたい。", answer: "ても", jp_full: "どんなに遠くでも行きたい。", es: "Por más lejos que esté, quiero ir.", why: "どんなに〜ても." },
];

/* ---------------- Kanji de esta unidad (10) ---------------- */
const KANJI: Kanji[] = [
  { hex: "96e3", char: "難", gloss: "difícil", sample: "難しい（むずかしい）", strokes: 18 },
  { hex: "6613", char: "易", gloss: "fácil", sample: "容易（ようい）", strokes: 8 },
  { hex: "5f37", char: "強", gloss: "fuerte", sample: "強い（つよい）", strokes: 11 },
  { hex: "9ad8", char: "高", gloss: "alto/caro", sample: "高い（たかい）", strokes: 10 },
  { hex: "65e9", char: "早", gloss: "temprano", sample: "早い（はやい）", strokes: 6 },
  { hex: "9045", char: "遅", gloss: "tarde/lento", sample: "遅い（おそい）", strokes: 12 },
  { hex: "8ca0", char: "負", gloss: "cargar/perder", sample: "負ける（まける）", strokes: 9 },
  { hex: "5b9f", char: "実", gloss: "realidad", sample: "実は（じつは）", strokes: 8 },
  { hex: "4eee", char: "仮", gloss: "provisional", sample: "仮に（かりに）", strokes: 6 },
  { hex: "60f3", char: "想", gloss: "pensar/imaginación", sample: "想像（そうぞう）", strokes: 13 },
];

/* ---------------- UI helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [open]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
}
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ---------------- Screen ---------------- */
export default function N3_B3_U2_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/n3_b3_u3.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>B3 — 2 Hipótesis y concesión（〜ても・〜としても）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>ても</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>としても</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática clara + tabla */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 ¿Cuándo uso 〜ても y 〜としても?</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.4 }]}>Patrón</Text>
              <Text style={[styles.th, { flex: 1.6 }]}>Ejemplo</Text>
              <Text style={[styles.th, { flex: 1.6 }]}>Traducción</Text>
              <Text style={[styles.th, { flex: 1.3 }]}>Nota</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.4, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.6 }]}>{r.ejemplo}</Text>
                <Text style={[styles.td, { flex: 1.6 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.3 }]}>{r.nota}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.tipBox, { marginTop: 8 }]}>
            <Text style={styles.gray}>• <Text style={styles.bold}>ても</Text> = “aunque…”. Uso diario, natural.</Text>
            <Text style={styles.gray}>• <Text style={styles.bold}>としても</Text> = “aun si (lo damos por caso)…”. Tono lógico.</Text>
            <Text style={styles.gray}>• いくら／どんなに〜ても = “por más que…”.</Text>
            <Text style={styles.gray}>• 疑問詞 + ても = “no importa quién/cuándo/dónde…”</Text>
            <Text style={styles.gray}>• 〜なくてもいい = “no hace falta…”.</Text>
          </View>
        </View>

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (14)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* ⭐ EXTRA A */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra A — Rellenar (14)</Text>
          {EXTRA_A.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🌱 EXTRA B */}
        <View style={styles.card}>
          <Text style={styles.h2}>🌱 Extra B — Más fácil (14)</Text>
          {EXTRA_B.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver la imagen numerada.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (<KanjiCard key={k.hex} k={k} />))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function ChoiceItem({ q, idx, onResult }: { q: Quiz; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;
  const pick = (op: string) => { if (done) return; setSel(op); onResult(op === q.answer); };

  const optStyle = (op: string) => {
    const picked = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
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

function FillItem({ f, onResult }: { f: Fill; onResult: (ok:boolean)=>void }) {
  const [state, setState] = useState<null | boolean>(null);
  const BANK = ["ても","としても","でも","なくても","だとしても"];

  const check = (ans: string) => { const ok = ans === f.answer; setState(ok); onResult(ok); };

  const palette = state === null ? { b: "rgba(0,0,0,0.08)", bg: "transparent", col: "#0E1015" }
    : state ? { b: "#10B981", bg: "rgba(16,185,129,.12)", col: "#0f9a6a" }
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
function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);

  const REQ: Record<string, any> = {
    "96e3": require("../../../../assets/kanjivg/n3/96e3_nums.webp"),
    "6613": require("../../../../assets/kanjivg/n3/6613_nums.webp"),
    "5f37": require("../../../../assets/kanjivg/n3/5f37_nums.webp"),
    "9ad8": require("../../../../assets/kanjivg/n3/9ad8_nums.webp"),
    "65e9": require("../../../../assets/kanjivg/n3/65e9_nums.webp"),
    "9045": require("../../../../assets/kanjivg/n3/9045_nums.webp"),
    "8ca0": require("../../../../assets/kanjivg/n3/8ca0_nums.webp"),
    "5b9f": require("../../../../assets/kanjivg/n3/5b9f_nums.webp"),
    "4eee": require("../../../../assets/kanjivg/n3/4eee_nums.webp"),
    "60f3": require("../../../../assets/kanjivg/n3/60f3_nums.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage source={src} style={{ width: "100%", height: "100%" }} contentFit="contain" />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke((s) => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
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
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015" },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },

  table: { marginTop: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  trHead: { backgroundColor: "#0b0c0f" },
  th: { color: "#fff", fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
  td: { paddingHorizontal: 8, paddingVertical: 8, color: "#0E1015" },

  tipBox: { backgroundColor: "#F6F7FB", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },

  // Quiz
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
