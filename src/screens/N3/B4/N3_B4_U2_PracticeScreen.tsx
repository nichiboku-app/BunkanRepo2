// ⏱ BLOQUE 4 — 2 Después / antes —「〜あとで」「〜まえに」「〜てから」— PRÁCTICA
// Hero: ../../../../assets/images/n3/b4_u2.webp

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

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B4_U2_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B4_U2_Practice">;

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
/* ---------------- Guía clara (nivel primaria) — VISIBLE ---------------- */
const GUIA_CLARA_TEXT = `① 「A の あとで B」= “Después de A, B”
   • A = どうし（じしょけい）／名詞（N）+ の。B = つぎにおこる こうどう。
   れい）かいぎ の あとで ほうこくします。= “Después de la reunión, reporto.”

② 「A まえに B」= “Antes de A, B”
   • A = どうし（じしょけい・かこ ではない）。B が さきに おこる。
   れい）ねる まえに は を みがきます。= “Antes de dormir, me cepillo los dientes.”

③ 「A てから B」= “(Primero) A y luego B”
   • A = どうし（てけい）+ から → A の あと すぐ B。
   れい）ごはん を たべてから べんきょうします。= “Como y luego estudio。”

くらべかた（ちがい）:
• あとで → A が おわってから B。  • まえに → B が さき、そのあと A。  • てから → A → B が つよく つながる。`;

/* ---------------- Tabla de gramática ---------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "あとで（あと）", forma: "A（V じしょけい／N の）+ あとで、B", tradu: "después de A, B", nota: "A を おえてから B" },
  { patron: "まえに（まえ）", forma: "A（V じしょけい）+ まえに、B", tradu: "antes de A, B", nota: "B が さき → そのあと A" },
  { patron: "てから",       forma: "A（V てけい）+ から、B", tradu: "tras A, B", nota: "A の すぐ あとに B" },
];


/* ---------------- PRÁCTICA (elige) — 12 ítems ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "寝る（　　　）、歯をみがきます。", options: ["あとで", "まえに", "てから"], answer: "まえに", jp_full: "寝るまえに、歯をみがきます。", es: "Antes de dormir, me cepillo los dientes.", why: "B (cepillar) primero → まえに。" },
  { id: 2, stem: "授業（　　　） 図書館へ行きます。", options: ["の まえに", "の あとで", "てから"], answer: "の あとで", jp_full: "授業のあとで、図書館へ行きます。", es: "Después de la clase, voy a la biblioteca.", why: "Sustantivo + の + あとで。" },
  { id: 3, stem: "朝ごはんを食べ（　　　） 出かけます。", options: ["あとで", "てから", "まえに"], answer: "てから", jp_full: "朝ごはんを食べてから 出かけます。", es: "Después de comer, salgo.", why: "Secuencia A→B unida → てから。" },
  { id: 4, stem: "メールを送る（　　　）、内容をもう一度確認した。", options: ["まえに", "あとで", "てから"], answer: "まえに", jp_full: "メールを送るまえに、内容をもう一度確認した。", es: "Antes de enviar el correo, verifiqué el contenido.", why: "B primero (verificar)." },
  { id: 5, stem: "出張（しゅっちょう）の（　　　）、資料を準備した。", options: ["あとで", "まえに", "てから"], answer: "まえに", jp_full: "出張のまえに、資料を準備した。", es: "Antes del viaje de trabajo, preparé los materiales.", why: "Nの + まえに。" },
  { id: 6, stem: "会議が終わった（　　　）、すぐ上司に連絡した。", options: ["まえに", "ところで", "あとで"], answer: "あとで", jp_full: "会議が終わったあとで、すぐ上司に連絡した。", es: "Después de que terminó la reunión, llamé al jefe.", why: "Evento A completado → あとで。" },
  { id: 7, stem: "資料を印刷し（　　　） 配りましょう。", options: ["てから", "まえに", "あとで"], answer: "てから", jp_full: "資料を印刷してから 配りましょう。", es: "Imprimamos y luego repartamos los materiales.", why: "Cadena A→B." },
  { id: 8, stem: "日本へ行く（　　　）、パスポートを作った。", options: ["てから", "まえに", "あとで"], answer: "まえに", jp_full: "日本へ行くまえに、パスポートを作った。", es: "Antes de ir a Japón, saqué el pasaporte.", why: "‘B primero’." },
  { id: 9, stem: "分析（ぶんせき）をして（　　　） 報告書を提出する。", options: ["あとで", "まえに", "てから"], answer: "てから", jp_full: "分析をしてから 報告書を提出する。", es: "Después de analizar, entrego el informe.", why: "Paso A→B." },
  { id:10, stem: "雨がやんだ（　　　）、外に出た。", options: ["てから", "まえに", "あとで"], answer: "あとで", jp_full: "雨がやんだあとで、外に出た。", es: "Después de que paró la lluvia, salí.", why: "Evento completado → あとで。" },
  { id:11, stem: "運動する（　　　）、水を飲みましょう。", options: ["あとで", "まえに", "てから"], answer: "まえに", jp_full: "運動するまえに、水を飲みましょう。", es: "Antes de hacer ejercicio, tomemos agua.", why: "Hidratación antes → まえに。" },
  { id:12, stem: "予約を確認し（　　　） 出発してください。", options: ["てから", "まえに", "あとで"], answer: "てから", jp_full: "予約を確認してから 出発してください。", es: "Confirma la reserva y luego sal.", why: "Secuencia fuerte." },
];

/* ---------------- EXTRA A (rellenar guiado) — 7 ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "B primero", jp_base: "会う____、時間と場所を決めましょう。", answer: "まえに", jp_full: "会うまえに、時間と場所を決めましょう。", es: "Antes de vernos, decidamos hora y lugar.", why: "Planificación previa → まえに。" },
  { id: 2, hint: "N の + あとで", jp_base: "試験____、ゆっくり休みます。", answer: "のあとで", jp_full: "試験のあとで、ゆっくり休みます。", es: "Después del examen, descansaré.", why: "Sustantivo + のあとで。" },
  { id: 3, hint: "A→B", jp_base: "手を洗って____ 食事を始めましょう。", answer: "から", jp_full: "手を洗ってから 食事を始めましょう。", es: "Primero lávate las manos y luego empezamos a comer.", why: "Forma て + から。" },
  { id: 4, hint: "diccionario + まえに", jp_base: "出発する____、天気を確認した。", answer: "まえに", jp_full: "出発するまえに、天気を確認した。", es: "Antes de partir, revisé el clima.", why: "V辞書 + まえに。" },
  { id: 5, hint: "evento completado", jp_base: "会議が終わった____、要点をまとめた。", answer: "あとで", jp_full: "会議が終わったあとで、要点をまとめた。", es: "Tras acabar la reunión, resumí los puntos.", why: "A completado → あとで。" },
  { id: 6, hint: "cadena", jp_base: "準備を終えて____、すぐに連絡します。", answer: "から", jp_full: "準備を終えてから、すぐに連絡します。", es: "Cuando termine de prepararme, te contacto en seguida.", why: "てから = secuencia." },
  { id: 7, hint: "N の + まえに", jp_base: "面接____、会社の情報を調べた。", answer: "のまえに", jp_full: "面接のまえに、会社の情報を調べた。", es: "Antes de la entrevista, investigué la empresa.", why: "Nのまえに。" },
];

/* ---------------- EXTRA B (rápidas) — 6 ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "A→B", jp_base: "昼ごはんを食べて____ 会議に参加する。", answer: "から", jp_full: "昼ごはんを食べてから 会議に参加する。", es: "Como y luego entro a la reunión.", why: "てから。" },
  { id: 2, hint: "B primero", jp_base: "出かける____、電気を消してください。", answer: "まえに", jp_full: "出かけるまえに、電気を消してください。", es: "Antes de salir, apaga la luz.", why: "Prevención → まえに。" },
  { id: 3, hint: "evento terminado", jp_base: "仕事が終わった____、友だちと会う。", answer: "あとで", jp_full: "仕事が終わったあとで、友だちと会う。", es: "Después del trabajo, veo a mis amigos.", why: "A terminado → あとで。" },
  { id: 4, hint: "diccionario + まえに", jp_base: "運転する____、ルートを confirmar する。", answer: "まえに", jp_full: "運転するまえに、ルートを確認する。", es: "Antes de conducir, confirmo la ruta.", why: "Regla まえに。" },
  { id: 5, hint: "cadena", jp_base: "予約をとって____、計画を立てよう。", answer: "から", jp_full: "予約をとってから、計画を立てよう。", es: "Reservemos y luego hacemos el plan.", why: "てから。" },
  { id: 6, hint: "N の + あとで", jp_base: "大会____、結果を発表します。", answer: "のあとで", jp_full: "大会のあとで、結果を発表します。", es: "Después del torneo, anunciaremos resultados.", why: "Nのあとで。" },
];

/* ---------------- Kanji de esta unidad（10） — N3 más difíciles y NO repetidos ---------------- */
const KANJI: Kanji[] = [
  { hex: "6e96", char: "準", gloss: "preparar",     sample: "準備（じゅんび）", strokes: 13 },
  { hex: "5099", char: "備", gloss: "equipar",      sample: "設備（せつび）", strokes: 12 },
  { hex: "9023", char: "連", gloss: "conectar",     sample: "連絡（れんらく）", strokes: 10 },
  { hex: "7d9a", char: "続", gloss: "continuar",    sample: "続ける（つづける）", strokes: 13 },
  { hex: "7d04", char: "約", gloss: "promesa/cita", sample: "予約（よやく）", strokes: 9  },
  { hex: "4e88", char: "予", gloss: "anticipar",    sample: "予習（よしゅう）", strokes: 4  },
  { hex: "5b9a", char: "定", gloss: "fijar",        sample: "予定（よてい）", strokes: 8  },
  { hex: "6e08", char: "済", gloss: "terminado",    sample: "支払い済み", strokes: 11 },
  { hex: "671f", char: "期", gloss: "período",      sample: "学期（がっき）", strokes: 12 },
  { hex: "7531", char: "由", gloss: "origen",       sample: "理由（りゆう）", strokes: 5  },
];

/* ---------------- Helpers ---------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ---------------- Screen ---------------- */
export default function N3_B4_U2_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b4_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B4 — 2 Después / antes（あとで・まえに・てから）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>あとで</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>まえに</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>てから</Text></View>
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
          <Text style={styles.h2}>🧭 Guía clara — Nivel primaria</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_CLARA_TEXT}</Text></View>
        </View>

        {/* 📘 Tabla */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Tabla de formación y matiz</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.2 }]}>Patrón</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Forma</Text>
              <Text style={[styles.th, { flex: 1.0 }]}>Traducción</Text>
              <Text style={[styles.th, { flex: 1.6 }]}>Nota</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.0 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.6 }]}>{r.nota}</Text>
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
  const BANK = ["あとで", "のあとで", "まえに", "のまえに", "てから", "から"];

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

/* ---------------- Kanji Card (SIN require dinámico) ---------------- */

// Marca en true los que tengan *_web.webp cuando los generes
const HAS_WEB: Record<string, boolean> = {
  // "6e96": true,
};

// *_nums.webp (todos existen)
const STROKES_NUMS: Record<string, ImageSourcePropType> = {
  "6e96": require("../../../../assets/kanjivg/n3/6e96_nums.webp"),
  "5099": require("../../../../assets/kanjivg/n3/5099_nums.webp"),
  "9023": require("../../../../assets/kanjivg/n3/9023_nums.webp"),
  "7d9a": require("../../../../assets/kanjivg/n3/7d9a_nums.webp"),
  "7d04": require("../../../../assets/kanjivg/n3/7d04_nums.webp"),
  "4e88": require("../../../../assets/kanjivg/n3/4e88_nums.webp"),
  "5b9a": require("../../../../assets/kanjivg/n3/5b9a_nums.webp"),
  "6e08": require("../../../../assets/kanjivg/n3/6e08_nums.webp"),
  "671f": require("../../../../assets/kanjivg/n3/671f_nums.webp"),
  "7531": require("../../../../assets/kanjivg/n3/7531_nums.webp"),
};

// (Opcional) *_web.webp solo si existen
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {
  // "6e96": require("../../../../assets/kanjivg/n3/6e96_web.webp"),
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

/* ---------------- Styles (idéntico estilo a U1) ---------------- */
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
