// 🌀 BLOQUE 3 — 2 Condiciones reales o naturales
// U2: Condicionales II（〜なら・〜と）— PRÁCTICA
// Hero: assets/images/n3/b3_u2.webp

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

/* ---------------- Guía “como de primaria” ----------------
SIGNIFICADO & TRADUCCIÓN:

◆ なら — “si es el caso de… / en cuanto a…”
  • Responde a un TEMA dado y propone/aconseja.
  • Traducciones: “si (en cuanto a) X…”, “si vas a X…”.
  • Admite voluntad/órdenes/sugerencias en B (〜ましょう／〜たほうがいい…).

◆ と — “cuando/siempre que… (resultado natural)”
  • Relación automática A⇒B: leyes, máquinas, hábitos, rutas.
  • Traducciones: “cuando/en cuanto A, (inevitablemente) B”.
  • NO pongas voluntad/órdenes en B.

Comparación útil:
  ・たら = “si/cuando (una vez ocurra A) ⇒ B”, admite voluntad.
  ・なら = condición basada en el tema/consejo.
  ・と   = patrón general/resultado natural, sin voluntad.
----------------------------------------------------------*/

/* ---------------- Tabla de formación y uso ---------------- */
type Row = { patron: string; ejemplo: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  {
    patron: "N/Adjな + なら",
    ejemplo: "大阪ならたこ焼きがおすすめ",
    tradu: "Si es Osaka / en cuanto a Osaka, (te) recomiendo takoyaki.",
    nota: "Tema dado → consejo/propuesta",
  },
  {
    patron: "V/Adjい + なら",
    ejemplo: "時間がないならタクシーにしよう",
    tradu: "Si no tienes tiempo, mejor taxi.",
    nota: "Admite voluntad/propuesta en B",
  },
  {
    patron: "V(辞書形) + と",
    ejemplo: "春になると桜が咲く",
    tradu: "Cuando llega la primavera, florecen los cerezos.",
    nota: "Ley natural / patrón general",
  },
  {
    patron: "操作 + と",
    ejemplo: "ボタンを押すと電気がつく",
    tradu: "Si presionas el botón, se enciende la luz.",
    nota: "Mecanismos / consecuencia automática",
  },
  {
    patron: "進路 + と",
    ejemplo: "右に曲がると駅が見える",
    tradu: "Si doblas a la derecha, ves la estación.",
    nota: "Rutas / resultado inevitable",
  },
];

/* ---------------- Mini-reglas (chuleta) ---------------- */
const MINI_REGLAS = [
  "なら = ‘si es el caso de… / en cuanto a…’ → perfecto para consejo/propuesta.",
  "と = ‘cuando/siempre que…’ → resultado natural/automático, sin voluntad.",
  "Voluntad/órdenes: ✔️ con なら ／ ❌ con と.",
  "Rutas, máquinas, naturaleza: usa と.",
  "Responder a lo que dijo el otro (‘tema’): usa なら.",
];

/* ---------------- PRÁCTICA: Elige la forma correcta ---------------- */
const PRACTICE: Quiz[] = [
  {
    id: 1,
    stem: "京都に行く＿＿、この神社が一番きれいだよ。",
    options: ["なら", "と", "たら"],
    answer: "なら",
    jp_full: "京都に行くなら、この神社が一番きれいだよ。",
    es: "Si vas a Kioto / en cuanto a Kioto, este santuario es el más bonito.",
    why: "Consejo/propuesta en base al tema ‘Kioto’ → なら.",
  },
  {
    id: 2,
    stem: "春になる＿＿、花粉が増える。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "春になると、花粉が増える。",
    es: "Cuando llega la primavera, aumenta el polen.",
    why: "Fenómeno natural/patrón general → と.",
  },
  {
    id: 3,
    stem: "時間がない＿＿、先に出ましょう。",
    options: ["なら", "と"],
    answer: "なら",
    jp_full: "時間がないなら、先に出ましょう。",
    es: "Si no hay tiempo, salgamos primero.",
    why: "Voluntad/propuesta en B → なら (no と).",
  },
  {
    id: 4,
    stem: "このボタンを押す＿＿、音が鳴る。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "このボタンを押すと、音が鳴る。",
    es: "Si presionas este botón, suena.",
    why: "Mecanismo/resultado automático → と.",
  },
  {
    id: 5,
    stem: "雨＿＿、延期しましょう。",
    options: ["なら", "と"],
    answer: "なら",
    jp_full: "雨なら、延期しましょう。",
    es: "Si llueve, aplazamos.",
    why: "Propuesta/decisión humana → なら. (Con と no se pone voluntad).",
  },
  {
    id: 6,
    stem: "左に曲がる＿＿、川に出ます。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "左に曲がると、川に出ます。",
    es: "Si doblas a la izquierda, sales al río.",
    why: "Ruta/resultado inevitable → と.",
  },
  {
    id: 7,
    stem: "その本が面白い＿＿、私も読んでみたい。",
    options: ["なら", "と"],
    answer: "なら",
    jp_full: "その本が面白いなら、私も読んでみたい。",
    es: "Si ese libro es interesante, también quiero leerlo.",
    why: "Deseo/voluntad en B → なら.",
  },
  {
    id: 8,
    stem: "夏になる＿＿、夜でも蒸し暑い。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "夏になると、夜でも蒸し暑い。",
    es: "Cuando llega el verano, hasta de noche hace bochorno.",
    why: "Patrón estacional → と.",
  },
  {
    id: 9,
    stem: "大阪＿＿、たこ焼きは外せないよ。",
    options: ["なら", "と"],
    answer: "なら",
    jp_full: "大阪なら、たこ焼きは外せないよ。",
    es: "Si es Osaka / hablando de Osaka, el takoyaki es imperdible.",
    why: "‘En cuanto a Osaka’ (tema) + recomendación → なら.",
  },
  {
    id: 10,
    stem: "カードを入れる＿＿、ドアが開きます。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "カードを入れると、ドアが開きます。",
    es: "Si introduces la tarjeta, la puerta se abre.",
    why: "Mecanismo/resultado automático → と.",
  },
  {
    id: 11,
    stem: "早く終わりたい＿＿、手伝ってください。",
    options: ["なら", "と"],
    answer: "なら",
    jp_full: "早く終わりたいなら、手伝ってください。",
    es: "Si quieres terminar rápido, por favor ayuda.",
    why: "Petición en B → なら.",
  },
  {
    id: 12,
    stem: "窓を開ける＿＿、風が入ってくる。",
    options: ["なら", "と"],
    answer: "と",
    jp_full: "窓を開けると、風が入ってくる。",
    es: "Si abres la ventana, entra el viento.",
    why: "Relación física directa → と.",
  },
];

/* ---------------- EXTRA A — Rellenar guiado ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "tema + consejo", jp_base: "京都____、紅葉の季節が最高です。", answer: "なら", jp_full: "京都なら、紅葉の季節が最高です。", es: "Si es Kioto / en cuanto a Kioto, el otoño es lo mejor.", why: "Tema dado + recomendación → なら." },
  { id: 2, hint: "patrón general", jp_base: "夜になる____、気温が下がる。", answer: "と", jp_full: "夜になると、気温が下がる。", es: "Cuando se hace de noche, baja la temperatura.", why: "Fenómeno general → と." },
  { id: 3, hint: "voluntad", jp_base: "お金がない____、家で食べよう。", answer: "なら", jp_full: "お金がないなら、家で食べよう。", es: "Si no hay dinero, comamos en casa.", why: "Propuesta humana → なら." },
  { id: 4, hint: "mecanismo", jp_base: "カードをかざす____、支払いができる。", answer: "と", jp_full: "カードをかざすと、支払いができる。", es: "Al acercar la tarjeta, se puede pagar.", why: "Acción ⇢ efecto automático → と." },
  { id: 5, hint: "respuesta a ‘tema’", jp_base: "大阪に住む____、通勤はどう？", answer: "なら", jp_full: "大阪に住むなら、通勤はどう？", es: "Si vas a vivir en Osaka, ¿cómo será el commute?", why: "Responder a un plan/tema → なら." },
];

/* ---------------- EXTRA B — Rápidas ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "ruta", jp_base: "右に曲がる____、海が見える。", answer: "と", jp_full: "右に曲がると、海が見える。", es: "Si giras a la derecha, se ve el mar.", why: "Ruta visible/resultado inevitable → と." },
  { id: 2, hint: "petición", jp_base: "寒い____、窓を閉めてください。", answer: "なら", jp_full: "寒いなら、窓を閉めてください。", es: "Si tienes frío, por favor cierra la ventana.", why: "Petición en B → なら." },
  { id: 3, hint: "hábito", jp_base: "犬は知らない人を見る____、よく吠える。", answer: "と", jp_full: "犬は知らない人を見ると、よく吠える。", es: "Cuando los perros ven desconocidos, ladran mucho.", why: "Tendencia/hábito → と." },
  { id: 4, hint: "consejo", jp_base: "暇____、このドラマを見てみて。", answer: "なら", jp_full: "暇なら、このドラマを見てみて。", es: "Si tienes tiempo libre, mira este drama.", why: "Consejo/sugerencia → なら." },
];

/* ---------------- Kanji de la unidad（opcional/continuidad） ---------------- */
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
  { hex: "60f3", char: "想", gloss: "pensar", sample: "想像（そうぞう）", strokes: 13 },
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

  const [showGuide, setShowGuide] = useState(true);
  const rot = useChevron(showGuide);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b3_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>B3 — 2 Condiciones reales（〜なら・〜と）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>なら</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>と</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Guía y Tabla */}
        <View style={styles.card}>
          <Pressable onPress={() => setShowGuide(s => !s)} style={styles.headerRow}>
            <Text style={styles.h2}>📘 Guía rápida y tabla de uso</Text>
            <Animated.View style={{ transform: [{ rotate: rot }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>

          {showGuide && (
            <>
              <Text style={[styles.p, { marginTop: 6 }]}>
                <Text style={styles.bold}>Idea clave: </Text>
                <Text>「なら」 = consejo/propuesta según un tema (“si es el caso de…”). 「と」 = resultado natural/automático (“cuando/siempre que…”).</Text>
              </Text>

              <View style={[styles.tipBox, { marginTop: 8 }]}>
                {MINI_REGLAS.map((t, i) => (
                  <Text key={i} style={styles.gray}>• {t}</Text>
                ))}
              </View>

              <View style={styles.table}>
                <View style={[styles.tr, styles.trHead]}>
                  <Text style={[styles.th, { flex: 1.4 }]}>Patrón</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Ejemplo</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Traducción</Text>
                  <Text style={[styles.th, { flex: 1.4 }]}>Nota</Text>
                </View>
                {GRAM_TABLE.map((r, i) => (
                  <View key={i} style={styles.tr}>
                    <Text style={[styles.td, { flex: 1.4, fontWeight: "800" }]}>{r.patron}</Text>
                    <Text style={[styles.td, { flex: 1.5 }]}>{r.ejemplo}</Text>
                    <Text style={[styles.td, { flex: 1.5 }]}>{r.tradu}</Text>
                    <Text style={[styles.td, { flex: 1.4 }]}>{r.nota}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.gray, { marginTop: 6 }]}>
                Chuleta: voluntad/órdenes → <Text style={styles.bold}>なら</Text>. Naturaleza/máquinas/rutas → <Text style={styles.bold}>と</Text>.
              </Text>
            </>
          )}
        </View>

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (12)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* ⭐ EXTRA A */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra A — Rellenar (5)</Text>
          {EXTRA_A.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🌱 EXTRA B */}
        <View style={styles.card}>
          <Text style={styles.h2}>🌱 Extra B — Rápidas (4)</Text>
          {EXTRA_B.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🈶 KANJI (opcional) */}
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
  const BANK = ["なら","と","たら"]; // recordatorio: aquí practicamos なら・と, con alguna mención de たら

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

function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);

  // Usa solo hex ya existentes para evitar errores de bundling
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
        <Text style={styles.kStrokesLine}>Trazos: {k.strokes}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke(s => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
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

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  table: { marginTop: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  trHead: { backgroundColor: "#0b0c0f" },
  th: { color: "#fff", fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
  td: { paddingHorizontal: 8, paddingVertical: 8, color: "#0E1015" },

  tipBox: { backgroundColor: "#F6F7FB", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },

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
  kStrokesLine: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  strokeBadge: { position: "absolute", right: 8, top: 8, backgroundColor: "#0E1015", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  strokeBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
