// 🌀 BLOQUE 3 — 3 Expresar concesiones o hipótesis
// U3: Suposiciones imaginarias（〜としたら・〜とすれば）— PRÁCTICA

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
  N3_B3_U3_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B3_U3_Practice">;

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
1) としたら ＝ “si (IMAGINANDO que) …”
   • Lo usamos para soñar, imaginar, decidir algo personal.
   • Ej.: 「100万円もらえるとしたら、何を買う？」

2) とすれば ＝ “si (DAMOS POR HECHO que) …”
   • Lo usamos para pensar con la cabeza y sacar conclusiones lógicas.
   • Ej.: 「データが正しいとすれば、結果はAだ」

COMPARA:
• 〜としても ＝ “aunque A, B no cambia” (concesión).
• 〜ても     ＝ “aunque …” (concesión cotidiana).

FORMACIÓN:
• V / Adjい / Adjな(だ) / N(だ) + としたら・とすれば
------------------------------------------------------------------*/

type Row = { base: string; toshitara: string; tosureba: string; matiz: string };
const GRAM_TABLE: Row[] = [
  { base: "V（行く・できる）", toshitara: "行くとしたら", tosureba: "行くとすれば", matiz: "imaginar (personal) vs. razonar (objetivo)" },
  { base: "Adjい（高い）", toshitara: "高いとしたら", tosureba: "高いとすれば", matiz: "‘si fuera caro…’" },
  { base: "Adjな（便利）", toshitara: "便利だとしたら", tosureba: "便利だとすれば", matiz: "‘si resultara conveniente…’" },
  { base: "Sust.（学生）", toshitara: "学生だとしたら", tosureba: "学生だとすれば", matiz: "‘si (asumimos que) es estudiante…’" },
  { base: "Negativo", toshitara: "行かないとしたら", tosureba: "行かないとすれば", matiz: "‘si (por hipótesis) no va…’" },
];

/* ---------------- PRÁCTICA (elige) ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "明日、試験がある＿＿、今日は早く寝よう。", options: ["としたら", "としても", "とすれば"], answer: "としたら", jp_full: "明日、試験があるとしたら、今日は早く寝よう。", es: "Si (imaginando que) hay examen mañana, durmamos temprano.", why: "Decisión personal basada en suposición → としたら。" },
  { id: 2, stem: "この計画を続ける＿＿、費用の見直しが必要だ。", options: ["としたら", "とすれば", "ても"], answer: "とすれば", jp_full: "この計画を続けるとすれば、費用の見直しが必要だ。", es: "Si (dando por supuesto que) seguimos el plan, hay que revisar costos.", why: "Conclusión lógica/objetiva → とすれば。" },
  { id: 3, stem: "彼が来ない＿＿、先に始めます。", options: ["としたら", "とすれば", "としても"], answer: "とすれば", jp_full: "彼が来ないとすれば、先に始めます。", es: "Si asumimos que él no viene, empezamos antes.", why: "Plan basado en premisa operativa → とすれば。" },
  { id: 4, stem: "留学できる＿＿、どの国に行きたい？", options: ["としたら", "としても", "ても"], answer: "としたら", jp_full: "留学できるとしたら、どの国に行きたい？", es: "Si pudieras irte de intercambio, ¿a qué país te gustaría?", why: "Pregunta imaginaria/soñada → としたら。" },
  { id: 5, stem: "それが事実だ＿＿、説明が合わない。", options: ["としても", "とすれば", "としたら"], answer: "とすれば", jp_full: "それが事実だとすれば、説明が合わない。", es: "Si eso fuera un hecho, la explicación no cuadra.", why: "Razonamiento a partir de premisa → とすれば。" },
  { id: 6, stem: "台風が来る＿＿、イベントは中止だろう。", options: ["としたら", "とすれば", "ても"], answer: "としたら", jp_full: "台風が来るとしたら、イベントは中止だろう。", es: "Si (imaginando que) viene un tifón, seguramente se cancele.", why: "Predicción desde ‘supongamos que…’ → としたら。" },
  { id: 7, stem: "安い＿＿、品質を確認すべきだ。", options: ["としても", "としたら", "とすれば"], answer: "とすれば", jp_full: "安いとすれば、品質を確認すべきだ。", es: "Si fuera barato, habría que comprobar la calidad.", why: "Recomendación lógica → とすれば。" },
  { id: 8, stem: "彼が社長だ＿＿、どう接すればいい？", options: ["としたら", "としても", "ても"], answer: "としたら", jp_full: "彼が社長だとしたら、どう接すればいい？", es: "Si él fuera el director, ¿cómo debería tratarlo?", why: "Escenario imaginado para conducta → としたら。" },
  { id: 9, stem: "このデータが正しい＿＿、結果は逆になるはずだ。", options: ["とすれば", "としたら", "としても"], answer: "とすれば", jp_full: "このデータが正しいとすれば、結果は逆になるはずだ。", es: "Si damos por correcta esta data, el resultado debería invertirse.", why: "Inferencia técnica → とすれば。" },
  { id: 10, stem: "試験が難しい＿＿、諦めないで。", options: ["としても", "としたら", "とすれば"], answer: "としても", jp_full: "試験が難しいとしても、諦めないで。", es: "Aun si el examen fuera difícil, no te rindas.", why: "Concesión que no cambia la postura → 〜としても。" },
];

/* ---------------- EXTRA A (rellenar guiado) ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "hipótesis imaginaria", jp_base: "行ける____、行きたい所は京都です。", answer: "としたら", jp_full: "行けるとしたら、行きたい所は京都です。", es: "Si pudiera ir, el lugar sería Kioto.", why: "Deseo bajo suposición imaginaria → としたら。" },
  { id: 2, hint: "premisa lógica", jp_base: "原因が雨____、対応はこうだ。", answer: "とすれば", jp_full: "原因が雨とすれば、対応はこうだ。", es: "Si la causa es la lluvia, esta es la medida.", why: "Planteo técnico → とすれば。" },
  { id: 3, hint: "Nだ + としたら", jp_base: "あなたが先生____、どう説明しますか。", answer: "だとしたら", jp_full: "あなたが先生だとしたら、どう説明しますか。", es: "Si tú fueras el profesor, ¿cómo lo explicarías?", why: "N(だ)+としたら。" },
  { id: 4, hint: "Adjい", jp_base: "安くない____、買う価値がある？", answer: "とすれば", jp_full: "安くないとすれば、買う価値がある？", es: "Si no es barato, ¿vale la pena comprarlo?", why: "Evaluación racional → とすれば。" },
  { id: 5, hint: "negativo", jp_base: "彼が来ない____、席を一つ減らそう。", answer: "としたら", jp_full: "彼が来ないとしたら、席を一つ減らそう。", es: "Si (imaginamos que) no viene, quitemos un asiento.", why: "Ajuste práctico con hipótesis → としたら。" },
  { id: 6, hint: "concesión contraste", jp_base: "忙しい____、やるべきだ。", answer: "としても", jp_full: "忙しいとしても、やるべきだ。", es: "Aunque estés ocupado, hay que hacerlo.", why: "Recordatorio de 〜としても。" },
  { id: 7, hint: "V辞書形", jp_base: "引っ越す____、どこに住みたい？", answer: "としたら", jp_full: "引っ越すとしたら、どこに住みたい？", es: "Si te mudaras, ¿dónde te gustaría vivir?", why: "Pregunta hipotética personal → としたら。" },
];

/* ---------------- EXTRA B (rápidas) ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "objetivo/lógico", jp_base: "真実____、彼は無罪だ。", answer: "だとすれば", jp_full: "真実だとすれば、彼は無罪だ。", es: "Si eso es verdad, es inocente.", why: "Conclusión lógica → とすれば。" },
  { id: 2, hint: "imaginaria", jp_base: "100万円もらえる____、何を買う？", answer: "としたら", jp_full: "100万円もらえるとしたら、何を買う？", es: "Si te dieran un millón de yenes, ¿qué comprarías?", why: "Escenario soñado → としたら。" },
  { id: 3, hint: "repaso concesión", jp_base: "雨____、出かけます。", answer: "でも", jp_full: "雨でも、出かけます。", es: "Aunque llueva, salgo.", why: "N + でも (repaso U2)." },
  { id: 4, hint: "negativo lógico", jp_base: "必要がない____、提出は不要だ。", answer: "とすれば", jp_full: "必要がないとすれば、提出は不要だ。", es: "Si no es necesario, no hace falta entregar.", why: "Razonamiento objetivo。" },
  { id: 5, hint: "Nだ", jp_base: "学生____、割引があります。", answer: "だとしたら", jp_full: "学生だとしたら、割引があります。", es: "Si fueras estudiante, hay descuento.", why: "Condición amable/hipotética → としたら。" },
  { id: 6, hint: "comparar", jp_base: "安い____、品質を調べよう。", answer: "とすれば", jp_full: "安いとすれば、品質を調べよう。", es: "Si es barato (asumiéndolo), verifiquemos la calidad.", why: "Acción derivada de premisa。" },
];

/* ---------------- Kanji de esta unidad (10) ---------------- */
const KANJI: Kanji[] = [
  { hex: "53ef", char: "可", gloss: "posible",        sample: "可能（かのう）", strokes: 5 },
  { hex: "80fd", char: "能", gloss: "capacidad",      sample: "能力（のうりょく）", strokes: 10 },
  { hex: "5fc5", char: "必", gloss: "necesario",      sample: "必要（ひつよう）", strokes: 5 },
  { hex: "8981", char: "要", gloss: "esencial",       sample: "重要（じゅうよう）", strokes: 9 },
  { hex: "524d", char: "前", gloss: "anterior",       sample: "前提（ぜんてい）", strokes: 9 },
  { hex: "63d0", char: "提", gloss: "proponer",       sample: "提案（ていあん）", strokes: 12 },
  { hex: "7d50", char: "結", gloss: "conclusión/atar",sample: "結果（けっか）", strokes: 12 },
  { hex: "679c", char: "果", gloss: "resultado",      sample: "成果（せいか）", strokes: 8 },
  { hex: "8ad6", char: "論", gloss: "discutir/tesis", sample: "理論（りろん）", strokes: 15 },
  { hex: "8a2d", char: "設", gloss: "establecer",     sample: "設定（せってい）", strokes: 11 },
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
export default function N3_B3_U3_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b3_u3.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>B3 — 3 Suposiciones imaginarias（としたら／とすれば）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>としたら</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>とすれば</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Tabla de formación y matiz</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.3 }]}>Base</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>〜としたら</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>〜とすれば</Text>
              <Text style={[styles.th, { flex: 1.7 }]}>Matiz</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.3, fontWeight: "800" }]}>{r.base}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.toshitara}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.tosureba}</Text>
                <Text style={[styles.td, { flex: 1.7 }]}>{r.matiz}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.gray, { marginTop: 6 }]}>
            Regla rápida: <Text style={styles.bold}>としたら</Text> = suposición imaginaria (tono personal);{" "}
            <Text style={styles.bold}>とすれば</Text> = premisa para razonar (tono objetivo).{" "}
            Contraste: <Text style={styles.bold}>としても</Text> = concesión.
          </Text>
        </View>

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (10)</Text>
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
function ChoiceItem({ q, idx, onResult }: { q: Quiz; idx: number; onResult: (ok: boolean) => void }) {
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

function FillItem({ f, onResult }: { f: Fill; onResult: (ok: boolean) => void }) {
  const [state, setState] = useState<null | boolean>(null);
  const BANK = ["としたら", "とすれば", "としても", "でも", "だとしたら", "だとすれば", "なくても"];

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
function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);

  const REQ: Record<string, any> = {
    "53ef": require("../../../../assets/kanjivg/n3/53ef_nums.webp"),
    "80fd": require("../../../../assets/kanjivg/n3/80fd_nums.webp"),
    "5fc5": require("../../../../assets/kanjivg/n3/5fc5_nums.webp"),
    "8981": require("../../../../assets/kanjivg/n3/8981_nums.webp"),
    "524d": require("../../../../assets/kanjivg/n3/524d_nums.webp"),
    "63d0": require("../../../../assets/kanjivg/n3/63d0_nums.webp"),
    "7d50": require("../../../../assets/kanjivg/n3/7d50_nums.webp"),
    "679c": require("../../../../assets/kanjivg/n3/679c_nums.webp"),
    "8ad6": require("../../../../assets/kanjivg/n3/8ad6_nums.webp"),
    "8a2d": require("../../../../assets/kanjivg/n3/8a2d_nums.webp"),
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
