// src/screens/N3/B2/N3_B2_U4_PracticeScreen.tsx
// BLOQUE 2 — 04 Expresión subjetiva（気がする・ような気がする）— PRÁCTICA
// Hero: assets/images/n3/b2_u4.webp

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
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B2_U4: undefined | { from?: string };
  N3_B2_U4_Practice: undefined | { from?: "N3_B2_U4" };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B2_U4_Practice">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ---------------- Gramática “como en primaria” ---------------- */
/**
  Tema: Expresión subjetiva — 「〜気がする」「〜ような気がする」

  🧠 ¿Qué expresan?
    ・〜気がする: “me da la sensación / tengo la impresión…”. Intuición leve, subjetiva.
    ・〜ような気がする: igual que arriba pero más **suave/prudente** (“como si…”).

  🔧 Cómo se unen (regla base: 普通形 + 気がする):
    A) Verbo（普通形）+ 気がする ／ + ような気がする
       例）雨が降る 気がする。／降らない 気がする。／降る ような 気がする。
    B) い形容詞（普通形）+ 気がする ／ + ような気がする
       例）今日は寒い 気がする。／寒い ような 気がする。
    C) な形容詞 + な + 気がする ／ + な + ような気がする
       例）この道は安全 な 気がする。／安全 な ような 気がする。
    D) 名詞 + の + 気がする ／ + の + ような気がする
       例）ここは港 の 気がする。／港 の ような 気がする。

  🧭 Cuándo usar
    ✔ Intuición/sensación (no certeza) — a menudo con なんとなく／どうも／なぜか.
    ✔ Para sonar menos tajante → 「〜ような気がする」.

  🔄 Diferencias express
    ・〜と思う = “creo que…” (opinión consciente/racional).
    ・〜らしい／〜そうだ（伝聞） = “según/dicen…”.
    ・〜わけだ = “con razón…” (conclusión lógica).
    ・〜気がしない = “no me da la sensación de…”.

  💡 Tips
    ・Con 名／なAdj recuerda 「の／な」 antes de 気がする（y antes de ような気がする）.
*/
const PRIMARIA = {
  definiciones: [
    { tag: "〜気がする", exp: "‘me da la sensación / tengo la impresión…’ (subjetivo, leve)" },
    { tag: "〜ような気がする", exp: "‘tengo la sensación **como si**…’ (más suave/prudente)" },
  ],
  patrones: [
    "V(普通形) + 気がする ／ V(普通形) + ような気がする",
    "いAdj(普通形) + 気がする ／ いAdj(普通形) + ような気がする",
    "なAdj + な + 気がする ／ なAdj + な + ような気がする",
    "名 + の + 気がする ／ 名 + の + ような気がする",
  ],
  pistas: [
    "なんとなく／どうも／なぜか → 〜気がする（intuición).",
    "Para suavizar (hedge) → 〜ような気がする.",
    "Rumores NO: usa 〜らしい／〜そうだ（伝聞）.",
  ],
};

/* ---------------- Contenido — PRÁCTICA ---------------- */
// 1) 気がする（impresión directa）
const EX_KIGA: Ex[] = [
  { jp: "なんとなく、この道で合っている気がする。", romaji: "Nantonaku, kono michi de atte iru ki ga suru.", es: "Siento que este camino es el correcto." },
  { jp: "今日は寒い気がする。", romaji: "Kyō wa samui ki ga suru.", es: "Hoy tengo la sensación de que hace frío." },
  { jp: "最近、日本語が上達してきた気がする。", romaji: "Saikin, nihongo ga jōtatsu shite kita ki ga suru.", es: "Últimamente siento que mi japonés ha mejorado." },
  { jp: "ここ, 前にも来た気がする。", romaji: "Koko, mae ni mo kita ki ga suru.", es: "Siento que ya vine aquí antes." },
  { jp: "この道は夜でも安全な気がする。", romaji: "Kono michi wa yoru demo anzen na ki ga suru.", es: "Tengo la impresión de que esta calle es segura incluso de noche." },
  { jp: "彼は嘘をついていない気がする。", romaji: "Kare wa uso o tsuite inai ki ga suru.", es: "Me da la sensación de que él no miente." },
];

// 2) ような気がする（suavizar/hedge）
const EX_YOUNA: Ex[] = [
  { jp: "雨が降り出しそうな気がする。", romaji: "Ame ga furidashi-sō na ki ga suru.", es: "Me parece (como si) fuera a empezar a llover." },
  { jp: "今日は人が少ないような気がする。", romaji: "Kyō wa hito ga sukunai yō na ki ga suru.", es: "Tengo la sensación de que hoy hay menos gente." },
  { jp: "この答えで合っているような気がする。", romaji: "Kono kotae de atte iru yō na ki ga suru.", es: "Siento como que esta respuesta está bien." },
  { jp: "彼の話、どこか矛盾しているような気がする。", romaji: "Kare no hanashi, dokoka mujun shite iru yō na ki ga suru.", es: "Tengo la impresión de que su historia se contradice en algo." },
  { jp: "ここは昔の港のような気がする。", romaji: "Koko wa mukashi no minato no yō na ki ga suru.", es: "Siento que esto es como un puerto antiguo." },
  { jp: "あの人、前に会ったような気がする。", romaji: "Ano hito, mae ni atta yō na ki ga suru.", es: "Siento como si lo hubiera visto antes." },
];

/* ---------------- 並び替え（Ordenar） ---------------- */
const ORDERS: OrderQ[] = [
  { id: 1, jp: "今日は人が少ないような気がする。", romaji: "Kyō wa hito ga sukunai yō na ki ga suru.", es: "Siento que hoy hay poca gente.", tokens: ["今日は","人が","少ない","ような","気がする。"] },
  { id: 2, jp: "ここ、前にも来た気がする。", romaji: "Koko, mae ni mo kita ki ga suru.", es: "Siento que ya vine aquí antes.", tokens: ["ここ、","前に","も","来た","気がする。"] },
  { id: 3, jp: "この答えで合っているような気がする。", romaji: "Kono kotae de atte iru yō na ki ga suru.", es: "Siento que esta respuesta está bien.", tokens: ["この答えで","合っている","ような","気がする。"] },
  { id: 4, jp: "なんとなく、この道で合っている気がする。", romaji: "Nantonaku, kono michi de atte iru ki ga suru.", es: "Me da la sensación de que este camino es el correcto.", tokens: ["なんとなく、","この道で","合っている","気がする。"] },
  { id: 5, jp: "ここは昔の港のような気がする。", romaji: "Koko wa mukashi no minato no yō na ki ga suru.", es: "Siento que esto es como un puerto antiguo.", tokens: ["ここは","昔の","港","の","ような","気がする。"] },
  { id: 6, jp: "彼は嘘をついていない気がする。", romaji: "Kare wa uso o tsuite inai ki ga suru.", es: "Me da la sensación de que él no miente.", tokens: ["彼は","嘘を","ついていない","気がする。"] },
];

/* ---------------- QUIZ（multiple choice） ---------------- */
const QUIZ: Q[] = [
  { id: 1, stem: "なんとなく、この道で合っている＿＿。", options: ["気がする", "ような気がする"], answer: "気がする", explain: "Intuición directa; ‘ような’ no es necesario." },
  { id: 2, stem: "今日は寒い＿＿。", options: ["気がする", "ような気がする"], answer: "気がする", explain: "Frase simple de sensación." },
  { id: 3, stem: "人が少ない＿＿。※suaviza", options: ["ような気がする", "気がする"], answer: "ような気がする", explain: "‘ような’ baja el tono/afirma con prudencia." },
  { id: 4, stem: "ここ、昔の港 の ＿＿。", options: ["気がする", "ような気がする"], answer: "ような気がする", explain: "Con 名 usa の + ような気がする para símil suave." },
  { id: 5, stem: "彼は嘘をついていない＿＿.", options: ["気がする", "ような気がする"], answer: "気がする", explain: "Afirmación de intuición personal." },
  { id: 6, stem: "この答えで合っている＿＿。※prudente", options: ["ような気がする", "気がする"], answer: "ような気がする", explain: "Se percibe como conjetura suave." },
  { id: 7, stem: "なぜか、音が小さい＿＿。", options: ["気がする", "ような気がする"], answer: "気がする", explain: "Estructura típica con adverbio de intuición." },
  { id: 8, stem: "安全 ＿ 気がする（なAdj）", options: ["な", "の"], answer: "な", explain: "Con なAdj → ‘な + 気がする’." },
];

/* ---------------- Kanji de la unidad (sensación/mente/sonido) ---------------- */
const KANJI: Kanji[] = [
  { hex: "6c17", char: "気", gloss: "espíritu/ánimo", sample: "気（き）", strokes: 6 },
  { hex: "611f", char: "感", gloss: "sentir", sample: "感覚（かんかく）", strokes: 13 },
  { hex: "899a", char: "覚", gloss: "percibir/recordar", sample: "感覚（かんかく）・覚える", strokes: 12 },
  { hex: "5fc3", char: "心", gloss: "corazón/mente", sample: "心（こころ）", strokes: 4 },
  { hex: "4e0d", char: "不", gloss: "no-/anti-", sample: "不安（ふあん）", strokes: 4 },
  { hex: "5b89", char: "安", gloss: "seguro/barato", sample: "安心（あんしん）", strokes: 6 },
  { hex: "58f0", char: "声", gloss: "voz", sample: "声（こえ）", strokes: 7 },
  { hex: "97f3", char: "音", gloss: "sonido", sample: "音（おと）", strokes: 9 },
  { hex: "76f4", char: "直", gloss: "directo/arreglar", sample: "正直（しょうじき）", strokes: 8 },
  { hex: "5146", char: "兆", gloss: "indicio/señal", sample: "兆し（きざし）", strokes: 6 },
];

/* ---------------- Helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [open]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  return rotate;
}

/* ---------------- Screen ---------------- */
export default function N3_B2_U4_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const [openKiga, setOpenKiga] = useState(true);
  const [openYouna, setOpenYouna] = useState(false);
  const r1 = useChevron(openKiga);
  const r2 = useChevron(openYouna);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b2_u4.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 2 — Práctica</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>気がする</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>ような気がする</Text></View>
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
          <Text style={styles.h2}>📘 Gramática como en primaria</Text>

          <Text style={styles.h3}>Definiciones & uso</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}>
              <Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Cómo se une</Text>
          {PRIMARIA.patrones.map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}

          <Text style={styles.h3}>Pistas</Text>
          {PRIMARIA.pistas.map((s, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>
          ))}
        </View>

        {/* 🗣️ Ejemplos */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos para escuchar y leer</Text>

          <Pressable onPress={() => setOpenKiga(!openKiga)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) 〜気がする（impresión directa）</Text>
            <Animated.View style={{ transform: [{ rotate: r1 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openKiga && EX_KIGA.map((ex, i) => (
            <View key={`kg-${i}`} style={styles.exampleRow}>
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

          <Pressable onPress={() => setOpenYouna(!openYouna)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) 〜ような気がする（suavizar）</Text>
            <Animated.View style={{ transform: [{ rotate: r2 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openYouna && EX_YOUNA.map((ex, i) => (
            <View key={`yn-${i}`} style={styles.exampleRow}>
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

        {/* 🧩 ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
          {ORDERS.map((o) => (<OrderQuestion key={o.id} q={o} onCorrect={playCorrect} />))}
        </View>

        {/* ✅ QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Practica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => (
            <QuizItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver la imagen numerada. El badge muestra el total de trazos.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>
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

  // Mapa a *_nums.webp (genera con tu script si aún no existen)
  const REQ: Record<string, any> = {
    "6c17": require("../../../../assets/kanjivg/n3/6c17_nums.webp"),
    "611f": require("../../../../assets/kanjivg/n3/611f_nums.webp"),
    "899a": require("../../../../assets/kanjivg/n3/899a_nums.webp"),
    "5fc3": require("../../../../assets/kanjivg/n3/5fc3_nums.webp"),
    "4e0d": require("../../../../assets/kanjivg/n3/4e0d_nums.webp"),
    "5b89": require("../../../../assets/kanjivg/n3/5b89_nums.webp"),
    "58f0": require("../../../../assets/kanjivg/n3/58f0_nums.webp"),
    "97f3": require("../../../../assets/kanjivg/n3/97f3_nums.webp"),
    "76f4": require("../../../../assets/kanjivg/n3/76f4_nums.webp"),
    "5146": require("../../../../assets/kanjivg/n3/5146_nums.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        {/* Badge de nº de trazos */}
        <View style={styles.strokeBadge}>
          <Text style={styles.strokeBadgeTxt}>{k.strokes}</Text>
        </View>

        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage
            source={src}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            cachePolicy="none"                               // 🔧 evita caché
            key={`${k.hex}-${showStroke ? "nums" : "char"}`} // 🔧 fuerza re-render
          />
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

  liDot: { marginTop: 4 },

  toggleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

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
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  // Badge de nº de trazos
  strokeBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#0E1015",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  strokeBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
