// src/screens/N3/N3_Block1_Unit4Screen.tsx
// BLOQUE 1 — 04 Acciones “sin…”（〜ずに／〜ないで） 
// Hero: assets/images/n3/b1_u4.webp

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
import { useFeedbackSounds } from "../../../src/hooks/useFeedbackSounds";

/* ---------------- Types (local) ---------------- */
type RootStackParamList = {
  N3_Unit: { block: number; unit: number; title: string } | undefined;
  N3_Block1_Unit4: undefined | { block: number; unit: number; title?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_Block1_Unit4">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string };

/* ---------------- Data: Ejemplos por gramática (5 c/u) ---------------- */
// 1) 〜ずに
const EX_ZUNI: Ex[] = [
  { jp: "朝ごはんを食べずに出かけた。", romaji: "asagohan o tabezu ni dekaketa", es: "Salí sin desayunar." },
  { jp: "連絡せずに会場へ向かった。", romaji: "renraku sezu ni kaijō e mukatta", es: "Fui al lugar sin avisar." },
  { jp: "傘を持たずに来た。", romaji: "kasa o motazu ni kita", es: "Vine sin paraguas." },
  { jp: "彼は理由を言わずに帰った。", romaji: "kare wa riyū o iwazu ni kaetta", es: "Él se fue sin decir la razón." },
  { jp: "薬を飲まずに寝た。", romaji: "kusuri o nomazu ni neta", es: "Me dormí sin tomar la medicina." },
];

// 2) 〜ないで
const EX_NAIDE: Ex[] = [
  { jp: "音楽を聞かないで勉強した。", romaji: "ongaku o kikanaide benkyō shita", es: "Estudié sin escuchar música." },
  { jp: "メモを取らないで覚えられますか。", romaji: "memo o toranaide oboeraremasu ka", es: "¿Puedes recordarlo sin tomar notas?" },
  { jp: "砂糖を入れないで飲みます。", romaji: "satō o irenaide nomimasu", es: "Lo bebo sin azúcar." },
  { jp: "靴を脱がないで部屋に入った。", romaji: "kutsu o nuganai de heya ni haitta", es: "Entré al cuarto sin quitarme los zapatos." },
  { jp: "彼はスマホを見ないで食事する。", romaji: "kare wa sumaho o minaide shokuji suru", es: "Él come sin mirar el móvil." },
];

// 3) V-ない ように（propósito: “para no …”）
const EX_NAI_YOUNI: Ex[] = [
  { jp: "忘れないようにメモします。", romaji: "wasurenai yō ni memo shimasu", es: "Para no olvidar, tomo notas." },
  { jp: "風邪をひかないように手をよく洗う。", romaji: "kaze o hikanai yō ni te o yoku arau", es: "Para no resfriarme, me lavo bien las manos." },
  { jp: "遅れないように早めに家を出る。", romaji: "okurenai yō ni hayame ni ie o deru", es: "Para no llegar tarde, salgo de casa temprano." },
  { jp: "太らないように甘い物を控える。", romaji: "futoranai yō ni amaimono o hikaeru", es: "Para no engordar, evito los dulces." },
  { jp: "迷わないように地図を印刷する。", romaji: "mayowanai yō ni chizu o insatsu suru", es: "Para no perderme, imprimo un mapa." },
];

// 4) 〜ようにする（hábito / intento）
const EX_YOUNI_SURU: Ex[] = [
  { jp: "毎日運動するようにしている。", romaji: "mainichi undō suru yō ni shite iru", es: "Procuro hacer ejercicio todos los días." },
  { jp: "夜は遅く食べないようにしている。", romaji: "yoru wa osoku tabenai yō ni shite iru", es: "Procuro no comer tarde por la noche." },
  { jp: "早く寝るようにする。", romaji: "hayaku neru yō ni suru", es: "Intento dormir temprano." },
  { jp: "無駄遣いをしないようにしている。", romaji: "mudazukai o shinai yō ni shite iru", es: "Procuro no malgastar." },
  { jp: "週に一回友だちに連絡するようにしている。", romaji: "shū ni ikkai tomodachi ni renraku suru yō ni shite iru", es: "Procuro contactar a mis amigos una vez por semana." },
];

/* ---------------- Data: Ordenar ---------------- */
const ORDERS: OrderQ[] = [
  { id: 1, jp: "薬を飲まずに寝た。", romaji: "kusuri o nomazu ni neta", es: "Me dormí sin tomar la medicina.", tokens: ["薬を","飲まずに","寝た。"] },
  { id: 2, jp: "必要な準備をしないで出発した。", romaji: "hitsuyō na junbi o shinaide shuppatsu shita", es: "Partí sin hacer los preparativos necesarios.", tokens: ["必要な","準備を","しないで","出発した。"] },
  { id: 3, jp: "連絡せずに会場へ向かった。", romaji: "renraku sezu ni kaijō e mukatta", es: "Fui al lugar sin avisar.", tokens: ["連絡せずに","会場へ","向かった。"] },
];

/* ---------------- Data: Quiz ---------------- */
const QUIZ: Q[] = [
  { id: 1, stem: "傘を持た___、駅まで走った。", options: ["ないで","ずに","ように"], answer: "ずに", explain: "『〜ずに』 = “sin hacer…”, estilo un poco más formal/neutro." },
  { id: 2, stem: "メッセージを送ら___ください。", options: ["ずに","ないで","ように"], answer: "ないで", explain: "Prohibición/petición cortés → 『V-ないでください』." },
  { id: 3, stem: "最近は夜食を食べ___ようにしている。", options: ["ないで","ずに","なく"], answer: "ないで", explain: "Hábito: “procuro no comer (de noche)” → ‘V-ないで + …している’ también es natural." },
  { id: 4, stem: "無駄遣いをし___、家計簿をつけます。", options: ["ないように","ずに","ないで"], answer: "ないように", explain: "Propósito preventivo → 『V-ない ように』." },
  { id: 5, stem: "大事なことは忘れ___ように、メモします。", options: ["ずに","ないで","ない"], answer: "ない", explain: "『忘れない ように』 = para no olvidar." },
  { id: 6, stem: "彼は規則を守ら___出て行った。", options: ["ずに","ないで","ように"], answer: "ずに", explain: "Acción A sin B → 『守らずに』." },
  { id: 7, stem: "忘れ___ように、カレンダーに書きます。", options: ["ずに","ないで","ない"], answer: "ない", explain: "Propósito preventivo → V-ない ように（忘れないように）" },
  { id: 8, stem: "ここで食べ___ください。", options: ["ずに","ないで","ない"], answer: "ないで", explain: "Petición/prohibición → V-ないでください（食べないでください）" },
];

/* ---------------- Mini guía (actualizada) ---------------- */
const PRIMARIA = {
  definiciones: [
    { tag: "B せずに A", exp: "Hacer A sin hacer B (un poco más formal/escrito). する→せずに／来る→こずに" },
    { tag: "B しないで A", exp: "Hacer A sin hacer B (coloquial/neutro). También: 〜ないでください = 'por favor, no…'" },
    { tag: "V-ない ように", exp: "Propósito preventivo: 'para no…' (忘れないように…)" },
    { tag: "〜ようにする", exp: "Hábito/esfuerzo: 'procuro…' (見ないようにする)" },
  ],
  pistas: [
    "🧾 Prohibición/petición → 〜ないでください",
    "🧩 'A sin B': (formal) 〜ずに ／ (coloquial) 〜ないで",
    "🛡️ Prevención/objetivo → V-ない ように",
    "🔁 Hábito → （V／V-ない）ようにする",
  ],
};

/* ---------------- Cuadro comparativo (nuevo) ---------------- */
const COMPARA = [
  {
    patron: "B せずに A",
    uso: "A sin hacer B (tono algo formal)",
    forma: "V-ない語幹 + ずに（する→せずに／来る→こずに）",
    ok: "連絡せずに会場へ向かった。",
    es: "Fui al lugar sin avisar.",
  },
  {
    patron: "B しないで A",
    uso: "A sin B (coloquial/neutro) / petición negativa",
    forma: "V-ない + で",
    ok: "朝ごはんを食べないで出かけた。",
    es: "Salí sin desayunar.",
  },
  {
    patron: "V-ないでください",
    uso: "Por favor, no… (petición/prohibición)",
    forma: "V-ない + でください",
    ok: "ここで写真を撮らないでください。",
    es: "Por favor, no tome fotos aquí.",
  },
  {
    patron: "V-ない ように",
    uso: "Para no… (objetivo preventivo)",
    forma: "V-ない + ように",
    ok: "忘れないように、メモします。",
    es: "Para no olvidar, tomo notas.",
  },
  {
    patron: "〜ようにする",
    uso: "Hábito/esfuerzo",
    forma: "(V辞書形／V-ない) + ようにする",
    ok: "夜は見ないようにする。",
    es: "Procuro no mirar por la noche.",
  },
];

/* ---------------- Kanji (10 nuevos, tema “evitar / reglas / preparación”) ---------------- */
const KANJI: Kanji[] = [
  { hex: "6b62", char: "止", gloss: "detener / parar",        sample: "停止（ていし）" },
  { hex: "7981", char: "禁", gloss: "prohibir",                sample: "禁止（きんし）" },
  { hex: "7121", char: "無", gloss: "sin / nada",              sample: "無理（むり）" },
  { hex: "5fc5", char: "必", gloss: "necesario",               sample: "必要（ひつよう）" },
  { hex: "8981", char: "要", gloss: "requerir / punto clave",  sample: "重要（じゅうよう）" },
  { hex: "5fd8", char: "忘", gloss: "olvidar",                 sample: "忘れる（わすれる）" },
  { hex: "899a", char: "覚", gloss: "recordar / sentir",       sample: "覚える（おぼえる）" },
  { hex: "6e96", char: "準", gloss: "preparar / estándar",     sample: "準備（じゅんび）" },
  { hex: "5099", char: "備", gloss: "equipar / preparar",      sample: "設備（せつび）" },
  { hex: "7d04", char: "約", gloss: "promesa / abreviar",      sample: "予約（よやく）" },
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
export default function N3_Block1_Unit4Screen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  // Toggles para los bloques
  const [openZuni, setOpenZuni] = useState(true);
  const [openNaide, setOpenNaide] = useState(false);
  const [openNaiYouni, setOpenNaiYouni] = useState(false);
  const [openYouniSuru, setOpenYouniSuru] = useState(false);

  const rZuni = useChevron(openZuni);
  const rNaide = useChevron(openNaide);
  const rNaiYouni = useChevron(openNaiYouni);
  const rYouniSuru = useChevron(openYouniSuru);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../assets/images/n3/b1_u4.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 1 — Acciones “sin…”</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ずに</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ないで</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>V-ない ように</Text></View>
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
            <Text style={styles.bold}>〜ずに／〜ないで</Text> = “sin (hacer)”.{"  "}
            <Text style={styles.bold}>〜ないでください</Text> = “por favor, no…”.{"  "}
            <Text style={styles.bold}>V-ない ように</Text> = “para no …” (propósito).
          </Text>

          <Text style={[styles.h3, { marginTop: 10 }]}>🧩 Patrones clave</Text>
          {[
            "V（ない）＋で → 〜ないでA ／ 〜ないでください",
            "V（ない語幹）＋ずに → 〜ずにA　※ する→せずに／来る→こずに",
            "V（ない）＋ように → 例）忘れないように、メモします。",
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
        </View>

        {/* COMPARACIÓN RÁPIDA */}
        <View style={styles.card}>
          <Text style={styles.h2}>🔎 Comparación rápida</Text>
          {COMPARA.map((row, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={styles.jp}><Text style={styles.bold}>{row.patron}</Text> — {row.uso}</Text>
              <Text style={styles.romaji}>Forma: {row.forma}</Text>
              <Text style={styles.p}><Text style={styles.bold}>Ejemplo: </Text>{row.ok}</Text>
              <Text style={styles.es}>{row.es}</Text>
            </View>
          ))}
        </View>

        {/* EJEMPLOS POR GRAMÁTICA CON TOGGLES */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos por gramática</Text>

          {/* 1) 〜ずに */}
          <Pressable onPress={() => setOpenZuni(!openZuni)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) 〜ずに</Text>
            <Animated.View style={{ transform: [{ rotate: rZuni }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openZuni && EX_ZUNI.map((ex, i) => (
            <View key={`z-${i}`} style={styles.exampleRow}>
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

          {/* 2) 〜ないで */}
          <Pressable onPress={() => setOpenNaide(!openNaide)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) 〜ないで</Text>
            <Animated.View style={{ transform: [{ rotate: rNaide }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNaide && EX_NAIDE.map((ex, i) => (
            <View key={`nd-${i}`} style={styles.exampleRow}>
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

          {/* 3) V-ない ように */}
          <Pressable onPress={() => setOpenNaiYouni(!openNaiYouni)} style={styles.toggleHeader}>
            <Text style={styles.h3}>3) V-ない ように（propósito）</Text>
            <Animated.View style={{ transform: [{ rotate: rNaiYouni }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNaiYouni && EX_NAI_YOUNI.map((ex, i) => (
            <View key={`ny-${i}`} style={styles.exampleRow}>
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

          {/* 4) 〜ようにする */}
          <Pressable onPress={() => setOpenYouniSuru(!openYouniSuru)} style={styles.toggleHeader}>
            <Text style={styles.h3}>4) 〜ようにする（hábito）</Text>
            <Animated.View style={{ transform: [{ rotate: rYouniSuru }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openYouniSuru && EX_YOUNI_SURU.map((ex, i) => (
            <View key={`ys-${i}`} style={styles.exampleRow}>
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
          <Text style={styles.p}>Toca “Trazos” para ver el orden; toca el altavoz para escuchar el compuesto.</Text>
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
  // Asegúrate de generar estos archivos con el script (hex_web.webp)
  const REQ: Record<string, any> = {
    "6b62": require("../../../assets/kanjivg/n3/6b62_web.webp"), // 止
    "7981": require("../../../assets/kanjivg/n3/7981_web.webp"), // 禁
    "7121": require("../../../assets/kanjivg/n3/7121_web.webp"), // 無
    "5fc5": require("../../../assets/kanjivg/n3/5fc5_web.webp"), // 必
    "8981": require("../../../assets/kanjivg/n3/8981_web.webp"), // 要
    "5fd8": require("../../../assets/kanjivg/n3/5fd8_web.webp"), // 忘
    "899a": require("../../../assets/kanjivg/n3/899a_web.webp"), // 覚
    "6e96": require("../../../assets/kanjivg/n3/6e96_web.webp"), // 準
    "5099": require("../../../assets/kanjivg/n3/5099_web.webp"), // 備
    "7d04": require("../../../assets/kanjivg/n3/7d04_web.webp"), // 約
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

  // Toggle header
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
