// src/screens/N3/N3_Block1_Unit3Screen.tsx
// BLOQUE 1 — 03 Hábitos y rutinas
// Imagen: assets/images/n3/b1_u3.webp (asegúrate de colocarla)

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
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../../src/hooks/useFeedbackSounds";

/* ---------------- Types (local) ---------------- */
type RootStackParamList = {
  N3_Unit: { block: number; unit: number; title: string } | undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_Unit">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string };

/* ---------------- Data: Ejemplos ---------------- */
const EXAMPLES: Ex[] = [
  { jp: "健康のため、毎朝30分歩くようにしている。", romaji: "kenkō no tame, mai-asa sanjippun aruku yō ni shite iru", es: "Por salud, procuro caminar 30 min cada mañana." },
  { jp: "砂糖を入れないようにしています。", romaji: "satō o irenai yō ni shite imasu", es: "Procuro no poner azúcar." },
  { jp: "日本に来てから、野菜をよく食べるようになった。", romaji: "nihon ni kite kara, yasai o yoku taberu yō ni natta", es: "Desde que vine a Japón, empecé a comer más verduras." },
  { jp: "テレビを見ずに寝た。", romaji: "terebi o mi-zu ni neta", es: "Me dormí sin ver la tele." },
  { jp: "朝ごはんを食べないで出かけた。", romaji: "asagohan o tabenaide dekaketa", es: "Salí sin desayunar." },
  { jp: "写真を撮らないでください。", romaji: "shashin o toranaide kudasai", es: "Por favor, no tome fotos." },
  { jp: "彼は傘を持たずに外へ出た。", romaji: "kare wa kasa o motazu ni soto e deta", es: "Él salió sin paraguas." },
  { jp: "無駄遣いしないようにしている。", romaji: "mudazukai shinai yō ni shite iru", es: "Procuro no malgastar." },
  { jp: "風邪をひかないように、手をよく洗うようにしている。", romaji: "kaze o hikanai yō ni, te o yoku arau yō ni shite iru", es: "Para no resfriarme, procuro lavarme bien las manos." },
];

/* ---------------- Data: Ordenar ---------------- */
const ORDERS: OrderQ[] = [
  { id: 1, jp: "毎朝コーヒーを飲まないようにしている。", romaji: "mai-asa kōhī o nomanai yō ni shite iru", es: "Procuro no tomar café cada mañana.", tokens: ["毎朝","コーヒー","を","飲まない","ように","している。"] },
  { id: 2, jp: "日本に来てから早く起きるようになった。", romaji: "nihon ni kite kara hayaku okiru yō ni natta", es: "Desde que llegué a Japón, empecé a levantarme temprano.", tokens: ["日本に","来てから","早く","起きる","ように","なった。"] },
  { id: 3, jp: "朝ごはんを食べずに学校へ行った。", romaji: "asagohan o tabezu ni gakkō e itta", es: "Fui a la escuela sin desayunar.", tokens: ["朝ごはん","を","食べずに","学校へ","行った。"] },
];

/* ---------------- Data: Quiz ---------------- */
const QUIZ: Q[] = [
  { id: 1, stem: "健康のため、毎日野菜を食べる___。", options: ["ようにする","ようになった","ずに"], answer: "ようにする", explain: "『〜ようにする』 = esfuerzo/hábito que quieres mantener." },
  { id: 2, stem: "日本に住んで、ニュースを日本語で見る___。", options: ["ようにする","ようになった","ないで"], answer: "ようになった", explain: "『〜ようになった』 = cambio de estado/hábito (antes no, ahora sí)." },
  { id: 3, stem: "昨夜はスマホを見___寝ました。", options: ["ないで","ずに","ようにして"], answer: "ずに", explain: "『〜ずに』 = “sin hacer X” (estilo algo más formal/escrito).『ないで』 también vale, pero si hay dos opciones, suele pedirse『ずに』." },
  { id: 4, stem: "この図書館では、静かにして、話さ___ください。", options: ["ずに","ないで","ように"], answer: "ないで", explain: "『〜ないでください』 = petición/prohibición cortés.（『〜ずにください』 no se usa）" },
  { id: 5, stem: "遅れ___ように、早めに出発しましょう。", options: ["ないで","ずに","ない"], answer: "ない", explain: "『V-ない ように』 = “para no (llegar tarde)”. Aquí va la forma negativa sin で/に de ‘sin hacer’." },
  { id: 6, stem: "彼は財布を持た___出かけた。", options: ["ずに","ないで","ように"], answer: "ずに", explain: "Acción A（salir） sin B（llevar cartera）→ 『〜ずに』." },
  { id: 7, stem: "最近、夜更かししない___しています。", options: ["ように","ようにする","ずに"], answer: "ようにする", explain: "Hábito que intentas mantener → 『ようにする』." },
  { id: 8, stem: "砂糖を入れ___コーヒーを飲みます。", options: ["ないで","ずに","ように"], answer: "ずに", explain: "Frase neutra de ‘sin…’ → mejor 『ずに』." },
];

/* ---------------- Mini guía (primaria) ---------------- */
const PRIMARIA = {
  definiciones: [
    { tag: "〜ようにする", exp: "Costumbre por esfuerzo propio: “procuro / intento hacer …”" },
    { tag: "〜ようになった", exp: "Cambio de hábito: “(ahora) me he acostumbrado a … / empecé a …”" },
    { tag: "〜ないようにする", exp: "Hábito evitativo: “procuro no …”" },
    { tag: "〜ずに", exp: "Acción A sin hacer B (estilo + formal): “BずにA”" },
    { tag: "〜ないで", exp: "Acción A sin B (coloquial) / Petición: “V-ないでください”" },
  ],
  pistas: [
    "🧍‍♀️ ¿Esfuerzo/hábito que mantienes tú? → 〜ようにする",
    "🔁 ¿Cambio de estado (antes no, ahora sí/no)? → 〜ようになった／〜なくなった",
    "🚫 ¿‘Sin hacer B’ para realizar A? → 〜ずに／〜ないで（文体：ずに＞ないで）",
    "🙅 Peticiones/prohibiciones corteses → 〜ないでください（※ ずにください ×）",
  ],
};

/* ---------------- Data: Kanji (10 de la lección) ---------------- */
const KANJI: Kanji[] = [
  { hex: "6bce", char: "毎", gloss: "cada / todos",      sample: "毎朝（まいあさ）" },
  { hex: "671d", char: "朝", gloss: "mañana (a.m.)",     sample: "朝食（ちょうしょく）" },
  { hex: "591c", char: "夜", gloss: "noche",             sample: "夜更かし（よふかし）" },
  { hex: "65e9", char: "早", gloss: "temprano / pronto", sample: "早起き（はやおき）" },
  { hex: "9045", char: "遅", gloss: "tarde / lento",     sample: "遅刻（ちこく）" },
  { hex: "7fd2", char: "習", gloss: "aprender / hábito", sample: "習慣（しゅうかん）" },
  { hex: "6163", char: "慣", gloss: "acostumbrarse",     sample: "慣れる（なれる）" },
  { hex: "4f53", char: "体", gloss: "cuerpo",            sample: "体力（たいりょく）" },
  { hex: "5065", char: "健", gloss: "saludable",         sample: "健康（けんこう）" },
  { hex: "5eb7", char: "康", gloss: "salud / bienestar", sample: "健康（けんこう）" },
];

/* ---------------- Screen ---------------- */
export default function N3_Block1_Unit3Screen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../assets/images/n3/b1_u3.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 1 — Hábitos y rutinas</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ようにする</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ようになった</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ずに／〜ないで</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* RESUMEN */}
        <View style={styles.card}>
          <Text style={styles.h2}>📌 En una línea</Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>〜ようにする</Text> = “procuro (hacer/no hacer)”.{"  "}
            <Text style={styles.bold}>〜ようになった</Text> = “me acostumbré / empecé a”.{"  "}
            <Text style={styles.bold}>〜ずに／〜ないで</Text> = “sin (hacer)”. ＊「〜ないでください」 = “por favor, no…”.
          </Text>

          <Text style={[styles.h3, { marginTop: 10 }]}>🧩 Patrones clave</Text>
          {[
            "V（辞書形）＋ようにする ／ V（ない形）＋ようにする",
            "V（辞書形）＋ようになる ／ V（ない形）＋なくなる",
            "V（ない形）＋で → 〜ないでA（sin B, A）／〜ないでください",
            "V（ない形）＋ずに → 〜ずにA（sin B, A）※ する→せずに",
          ].map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}
        </View>

        {/* PRIMARIA */}
        <View style={styles.card}>
          <Text style={styles.h2}>💡 Gramática como en primaria</Text>
          <Text style={styles.h3}>Definiciones rápidas</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text></View>
          ))}
          <Text style={styles.h3}>Pistas para elegir</Text>
          {PRIMARIA.pistas.map((s, i) => (<View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>))}
          <Text style={styles.gray}>Nota: 『〜ずに』 es más escrito/formal; 『〜ないで』 es más coloquial y además sirve para “no hagas…” con ください.</Text>
        </View>

        {/* EJEMPLOS */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos (toca el altavoz)</Text>
          {EXAMPLES.map((ex, i) => (
            <View key={i} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* KANJI DEL BLOQUE */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji del bloque（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver el orden y el ejemplo; toca el altavoz para escuchar el compuesto.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>

        {/* ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
          {ORDERS.map((o) => (<OrderQuestion key={o.id} q={o} onCorrect={() => {}} />))}
        </View>

        {/* QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Practica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => (
            <QuizItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        <View style={{ height: 8 }} />
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnTxt}>Volver al curso</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function OrderQuestion({ q, onCorrect }: { q: OrderQ; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<null | boolean>(null);

  const pool = useRef<string[]>([...q.tokens].sort(() => Math.random() - 0.5)).current;

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const onPick = (t: string) => {
    if (done !== null) return;
    const arr = [...picked, t];
    setPicked(arr);
    if (arr.length === q.tokens.length) {
      const ok = arr.join("") === q.tokens.join("");
      setDone(ok);
      if (ok) onCorrect();
    }
  };

  const undo = () => { if (done !== null) return; setPicked((a) => a.slice(0, -1)); };
  const reset = () => { setPicked([]); setDone(null); };

  const border = done === null ? "rgba(0,0,0,0.08)" : done ? "#10B981" : "#EF4444";
  const bg = done === null ? "transparent" : done ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)";
  const col = done === null ? "#0E1015" : done ? "#0f9a6a" : "#c62828";

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.p}>{q.es}</Text>
      <View style={[styles.answerBox, { borderColor: border, backgroundColor: bg }]}>
        <Text style={[styles.jp, { color: col }]}>{picked.join("") || "　"}</Text>
      </View>
      <View style={styles.tokenRow}>
        {pool.map((t, i) => (
          <Pressable key={i} onPress={() => onPick(t)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={undo} style={styles.kBtn}><Text style={styles.kBtnTxt}>Deshacer</Text></Pressable>
        <Pressable onPress={reset} style={styles.kBtn}><Text style={styles.kBtnTxt}>Reiniciar</Text></Pressable>
        <Pressable onPress={() => speakJa(q.jp)} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
      {done !== null && (
        <Text style={[styles.gray, { marginTop: 6 }]}>
          <Text style={styles.bold}>Solución: </Text>{q.jp}（{q.romaji}）
        </Text>
      )}
    </View>
  );
}

function QuizItem({ q, idx, onResult }: { q: Q; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const optStyle = (op: string) => {
    const pickedNow = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : pickedNow ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : pickedNow ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && pickedNow ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === q.answer);
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{q.explain}</Text>}
    </View>
  );
}

function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);

  // ⚠️ Asegúrate de que estos archivos EXISTAN (generados como *_web.webp).
  const REQ: Record<string, any> = {
    "6bce": require("../../../assets/kanjivg/n3/6bce_web.webp"),
    "671d": require("../../../assets/kanjivg/n3/671d_web.webp"),
    "591c": require("../../../assets/kanjivg/n3/591c_web.webp"),
    "65e9": require("../../../assets/kanjivg/n3/65e9_web.webp"),
    "9045": require("../../../assets/kanjivg/n3/9045_web.webp"),
    "7fd2": require("../../../assets/kanjivg/n3/7fd2_web.webp"),
    "6163": require("../../../assets/kanjivg/n3/6163_web.webp"),
    "4f53": require("../../../assets/kanjivg/n3/4f53_web.webp"),
    "5065": require("../../../assets/kanjivg/n3/5065_web.webp"),
    "5eb7": require("../../../assets/kanjivg/n3/5eb7_web.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
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
        <Pressable onPress={onSpeak} style={styles.kIconBtn}>
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
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015", marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "900", color: "#0E1015", marginTop: 2, marginBottom: 6 },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },
  codeBlock: { backgroundColor: "#0b0c0f", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  code: { color: "#fff", fontWeight: "800", marginBottom: 4 },

  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

  // Kanji grid
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  primaryBtn: { marginHorizontal: 16, backgroundColor: "#AF0F2A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnTxt: { color: "#fff", fontWeight: "900" },

  liDot: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#E5E7EB", marginVertical: 4 },
  liCross: { paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: "#FCA5A5", marginVertical: 4 },
});
