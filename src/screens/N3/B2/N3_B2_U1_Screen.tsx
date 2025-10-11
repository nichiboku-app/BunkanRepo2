// src/screens/N3/B2/N3_B2_U1_PracticeScreen.tsx
// BLOQUE 2 — 01 Parecer y apariencia（ようだ・らしい・みたい）— PRÁCTICA
// Hero: assets/images/n3/b2_u1.webp

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

// ✅ Ruta del hook (desde src/screens/N3/B2 → subir 3 niveles)
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B2_U1: undefined | { from?: string };
  N3_B2_U1_Practice: undefined | { from?: "N3_B2_U1" };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B2_U1_Practice">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string };

/* ---------------- Gramática como en primaria ---------------- */
const PRIMARIA = {
  definiciones: [
    { tag: "ようだ", exp: "‘Parece…’ por evidencia/lo que percibes tú (ves, oyes, contexto)." },
    { tag: "らしい", exp: "‘Dicen que…’/se rumorea; info de terceros, noticia, gente." },
    { tag: "みたい", exp: "‘Se ve como…’ coloquial; mismo sentido que ようだ pero más casual." },
  ],
  pistas: [
    "👀 Si lo deduces por lo que tú ves/oyes → ようだ",
    "🗣️ Si te lo contaron/lo leíste en noticias/rumor → らしい",
    "💬 En conversación casual, suena más natural → みたい",
  ],
  patrones: [
    "N ＋ のようだ　／　いAdj ＋ ようだ　／　なAdj ＋ なようだ　／　V(普通形) ＋ ようだ",
    "N ＋ らしい　／　いAdj ＋ らしい　／　なAdj ＋ らしい　／　V(普通形) ＋ らしい",
    "N ＋ みたい　／　いAdj ＋ みたい　／　なAdj ＋ みたい　／　V(普通形) ＋ みたい",
  ],
};

/* ---------------- Contenido — PRÁCTICA ---------------- */
// 7 ejemplos por cada patrón

// 1) ようだ（evidencia propia）
const EX_YOUDA: Ex[] = [
  { jp: "空が赤くなってきた。夕方のようだ。", romaji: "Sora ga akaku nattekita. Yūgata no yō da.", es: "El cielo se puso rojo. Parece atardecer." },
  { jp: "人が外で並んでいる。新しい店のオープンのようだ。", romaji: "Hito ga soto de narande iru. Atarashii mise no ōpun no yō da.", es: "La gente hace fila. Parece la apertura de una tienda." },
  { jp: "教室が静かだ。授業が始まったようだ。", romaji: "Kyōshitsu ga shizuka da. Jugyō ga hajimatta yō da.", es: "El aula está silenciosa. Parece que empezó la clase." },
  { jp: "道が濡れている。さっき雨が降ったようだ。", romaji: "Michi ga nurete iru. Sakki ame ga futta yō da.", es: "El camino está mojado. Parece que llovió hace un rato." },
  { jp: "窓が開いている。誰もいないようだ。", romaji: "Mado ga aite iru. Dare mo inai yō da.", es: "La ventana está abierta. Parece que no hay nadie." },
  { jp: "電気が消えている。店は閉まっているようだ。", romaji: "Denki ga kiete iru. Mise wa shimatte iru yō da.", es: "Las luces están apagadas. Parece que la tienda está cerrada." },
  { jp: "カバンが軽い。教科書を忘れたようだ。", romaji: "Kaban ga karui. Kyōkasho o wasureta yō da.", es: "La mochila está ligera. Parece que olvidé el libro." },
];

// 2) らしい（rumor / info de terceros）
const EX_RASHII: Ex[] = [
  { jp: "彼は海外で働くことになったらしい。", romaji: "Kare wa kaigai de hataraku koto ni natta rashii.", es: "Dicen que trabajará en el extranjero." },
  { jp: "この町では桜が早く咲くらしい。", romaji: "Kono machi de wa sakura ga hayaku saku rashii.", es: "Se dice que aquí las sakura florecen temprano." },
  { jp: "そのレストランは値上げしたらしい。", romaji: "Sono resutoran wa neage shita rashii.", es: "Parece que ese restaurante subió los precios (se comenta)." },
  { jp: "明日は雨らしい。", romaji: "Ashita wa ame rashii.", es: "Dicen que mañana lloverá." },
  { jp: "彼女は関西出身らしい。", romaji: "Kanojo wa Kansai shusshin rashii.", es: "Se dice que ella es de Kansai." },
  { jp: "あの映画はとても人気らしい。", romaji: "Ano eiga wa totemo ninki rashii.", es: "Parece que esa película es muy popular." },
  { jp: "部長は来週休みらしい。", romaji: "Buchō wa raishū yasumi rashii.", es: "Al parecer, el jefe estará de descanso la próxima semana." },
];

// 3) みたい（coloquial, ‘se ve como’）
const EX_MITAI: Ex[] = [
  { jp: "電車が遅れているみたい。", romaji: "Densha ga okurete iru mitai.", es: "Parece que el tren viene retrasado." },
  { jp: "この靴、少し大きいみたい。", romaji: "Kono kutsu, sukoshi ōkii mitai.", es: "Estos zapatos parecen un poco grandes." },
  { jp: "雨は止んだみたい。", romaji: "Ame wa yanda mitai.", es: "Parece que dejó de llover." },
  { jp: "彼、風邪みたいだ。", romaji: "Kare, kaze mitai da.", es: "Él parece resfriado." },
  { jp: "ここ、Wi-Fiが弱いみたい。", romaji: "Koko, Wi-Fi ga yowai mitai.", es: "Aquí el Wi-Fi parece débil." },
  { jp: "あの子、ねむいみたい。", romaji: "Ano ko, nemui mitai.", es: "Ese niño parece con sueño." },
  { jp: "道を間違えたみたい。", romaji: "Michi o machigaeta mitai.", es: "Parece que nos equivocamos de camino." },
];

// Ordenar (並び替え)
const ORDERS: OrderQ[] = [
  { id: 1, jp: "人が集まっている。イベントのようだ。", romaji: "Hito ga atsumatte iru. Ibento no yō da.", es: "Hay gente reunida. Parece un evento.", tokens: ["人が集まっている。","イベントの","ようだ。"] },
  { id: 2, jp: "彼は日本へ行ったらしい。", romaji: "Kare wa Nihon e itta rashii.", es: "Dicen que él se fue a Japón.", tokens: ["彼は","日本へ","行った","らしい。"] },
  { id: 3, jp: "あの店、休みみたい。", romaji: "Ano mise, yasumi mitai.", es: "Esa tienda parece cerrada.", tokens: ["あの店、","休み","みたい。"] },
];

// Quiz (múltiple opción)
const QUIZ: Q[] = [
  { id: 1, stem: "空が暗い。雨が降りそう___。", options: ["ようだ","らしい","みたい"], answer: "ようだ", explain: "Deducción por evidencia (lo ves) → ようだ。" },
  { id: 2, stem: "彼女は引っ越した___よ。", options: ["ようだ","らしい","みたい"], answer: "らしい", explain: "Información escuchada de terceros → らしい。" },
  { id: 3, stem: "ここ、静か___ね。", options: ["らしい","みたい","ようだ"], answer: "みたい", explain: "Comentario coloquial en conversación → みたい。" },
  { id: 4, stem: "この服、彼に似合いそう___。", options: ["らしい","みたい","ようだ"], answer: "ようだ", explain: "Juicio propio por la apariencia → ようだ。" },
  { id: 5, stem: "その映画、面白い___。", options: ["ようだ","らしい","みたい"], answer: "らしい", explain: "“Se dice/escuché que es buena” → らしい。" },
];

// Kanji de esta unidad
const KANJI: Kanji[] = [
  { hex: "69d8", char: "様", gloss: "aspecto / señor(a)", sample: "様子（ようす）" },
  { hex: "4f3c", char: "似", gloss: "parecido", sample: "似ている" },
  { hex: "98a8", char: "風", gloss: "viento / estilo", sample: "風（かぜ）" },
  { hex: "5642", char: "噂", gloss: "rumor", sample: "噂（うわさ）" }, // U+5642
  { hex: "7684", char: "的", gloss: "‘-al’ / de tipo", sample: "的（てき）" },
  { hex: "611f", char: "感", gloss: "sentimiento", sample: "感（かん）" },
  { hex: "5f7c", char: "彼", gloss: "él", sample: "彼（かれ）" },
  { hex: "5973", char: "女", gloss: "mujer", sample: "女性（じょせい）" },
  { hex: "898b", char: "見", gloss: "ver", sample: "見る（みる）" },
  { hex: "5916", char: "外", gloss: "afuera", sample: "外（そと）" },
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
export default function N3_B2_U1_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  // Toggles
  const [openYouda, setOpenYouda] = useState(true);
  const [openRashii, setOpenRashii] = useState(false);
  const [openMitai, setOpenMitai] = useState(false);

  const rYouda = useChevron(openYouda);
  const rRashii = useChevron(openRashii);
  const rMitai = useChevron(openMitai);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b2_u1.webp")}
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
            <View style={styles.chip}><Text style={styles.chipTxt}>ようだ</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>らしい</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>みたい</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática como en primaria */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Gramática como en primaria</Text>

          <Text style={styles.h3}>Definiciones rápidas</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}>
              <Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Pistas para elegir</Text>
          {PRIMARIA.pistas.map((s, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>
          ))}

          <Text style={styles.h3}>Patrones clave</Text>
          {PRIMARIA.patrones.map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}
        </View>

        {/* 🗣️ Ejemplos por gramática (TOGGLES) */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos para escuchar y leer</Text>

          {/* ようだ */}
          <Pressable onPress={() => setOpenYouda(!openYouda)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) ようだ（parece por evidencia）</Text>
            <Animated.View style={{ transform: [{ rotate: rYouda }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openYouda && EX_YOUDA.map((ex, i) => (
            <View key={`yd-${i}`} style={styles.exampleRow}>
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

          {/* らしい */}
          <Pressable onPress={() => setOpenRashii(!openRashii)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) らしい（dicen que / rumor）</Text>
            <Animated.View style={{ transform: [{ rotate: rRashii }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openRashii && EX_RASHII.map((ex, i) => (
            <View key={`rs-${i}`} style={styles.exampleRow}>
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

          {/* みたい */}
          <Pressable onPress={() => setOpenMitai(!openMitai)} style={styles.toggleHeader}>
            <Text style={styles.h3}>3) みたい（coloquial: ‘se ve como’）</Text>
            <Animated.View style={{ transform: [{ rotate: rMitai }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openMitai && EX_MITAI.map((ex, i) => (
            <View key={`mt-${i}`} style={styles.exampleRow}>
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
          <Text style={styles.p}>Toca “Trazos” para ver el orden; toca el altavoz para escuchar el compuesto.</Text>
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

/* ---------------- Subcomponentes (misma UI que B1_U4) ---------------- */
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
  // ✅ Rutas a ../../../../assets/kanjivg/n3
  const REQ: Record<string, any> = {
    "69d8": require("../../../../assets/kanjivg/n3/69d8_web.webp"), // 様
    "4f3c": require("../../../../assets/kanjivg/n3/4f3c_web.webp"), // 似
    "98a8": require("../../../../assets/kanjivg/n3/98a8_web.webp"), // 風
    "5642": require("../../../../assets/kanjivg/n3/5642_web.webp"), // 噂
    "7684": require("../../../../assets/kanjivg/n3/7684_web.webp"), // 的
    "611f": require("../../../../assets/kanjivg/n3/611f_web.webp"), // 感
    "5f7c": require("../../../../assets/kanjivg/n3/5f7c_web.webp"), // 彼
    "5973": require("../../../../assets/kanjivg/n3/5973_web.webp"), // 女
    "898b": require("../../../../assets/kanjivg/n3/898b_web.webp"), // 見
    "5916": require("../../../../assets/kanjivg/n3/5916_web.webp"), // 外
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
});
