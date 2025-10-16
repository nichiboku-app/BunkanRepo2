// src/screens/N3/B2/N3_B2_U3_PracticeScreen.tsx
// BLOQUE 2 — 03 Expresar lo que se dice o se cree（わけだ・わけではない）— PRÁCTICA
// Hero: assets/images/n3/b2_u3.webp

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

// ✅ Hook de sonidos
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B2_U3: undefined | { from?: string };
  N3_B2_U3_Practice: undefined | { from?: "N3_B2_U3" };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B2_U3_Practice">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ---------------- Gramática "como en primaria" ---------------- */
/**
  Tema: Expresar lo que se deduce/cree y matizar —「〜わけだ」「〜わけではない」

  1) ¿Qué significan?
    ・〜わけだ ＝ “con razón… / entonces… / de ahí que…”
       → Conclusión lógica a partir de datos previos (“ah, claro”).
    ・〜わけではない ＝ “no es que… / no necesariamente…”
       → Negación parcial para matizar (evita una interpretación absoluta).

  2) ¿Cómo se unen? (todas las formas)
    Regla base: 普通形 (forma simple) + わけだ／わけではない
    A) 〜わけだ（conclusión）
       - Verbo（普通形）+ わけだ
         例）毎日練習している。上手な わけだ。
       - いAdj（普通形）+ わけだ
         例）道が混んでいる。遅れる わけだ。
       - なAdj + な + わけだ（coloquial）／ なAdj + という わけだ（más neutro）
       - 名 + という わけだ
         例）つまり彼は先生 という わけだ（= “en otras palabras, es profesor”）

    B) 〜わけではない（negación parcial）
       - Verbo／いAdj（普通形）+ わけではない
       - なAdj + な + わけではない ／ なAdj + という わけではない
       - 名 + という わけではない
         例）高い わけではない（no es que sea caro）／先生 という わけではない

  3) Cuándo usar (regla corta)
    ✔ Explicas una consecuencia natural de A → B + わけだ（“con razón…”）
    ✔ Suavizas o niegas una interpretación total → 〜わけではない（“no necesariamente…”）
       Frases típicas: 必ずしも〜わけではない（no necesariamente）／全部(が)〜わけではない（no todo）／別に〜わけではない（no especialmente）

  4) Diferencias rápidas
    ・〜はずだ：expectativa/probabilidad (“debería/seguro”), no “con razón”.
    ・〜らしい：rumor/impresión general; ・〜ということだ：“según/por lo visto”.
    ・〜わけがない：imposible/rotundo (mucho más fuerte que 〜わけではない).

  5) Recetas rápidas
    ・Hecho A → (だから／それで／つまり) → B + わけだ
      例）毎日3時間練習してる。だから上手な わけだ。
    ・必ずしも／全部(が)／別に + X（普通形）+ わけではない
      例）必ずしも簡単 な わけではない（no necesariamente fácil）。

  6) Con pasado/negativo (simple)
    普通形 primero, luego + わけだ／わけではない.
    例）降った わけだ／降らない わけだ／便利だった という わけだ／
        便利 という わけではない（también con pasado según contexto）
*/
const PRIMARIA = {
  definiciones: [
    { tag: "〜わけだ", exp: "Conclusión/interpretación lógica: ‘con razón… / de ahí que…’" },
    { tag: "〜わけではない", exp: "Negación parcial/matiz: ‘no es que… / no necesariamente…’" },
  ],
  union: [
    {
      titulo: "Conclusión — 〜わけだ",
      items: [
        "V(普通形) + わけだ　例）毎日練習している。上手な わけだ。",
        "いAdj(普通形) + わけだ　例）混んでいる。遅れる わけだ。",
        "なAdj + な + わけだ（口語）／ なAdj + という わけだ（中立）",
        "名 + という わけだ　例）つまり彼は先生 という わけだ。",
      ],
    },
    {
      titulo: "Matiz — 〜わけではない",
      items: [
        "V／いAdj(普通形) + わけではない",
        "なAdj + な + わけではない ／ なAdj + という わけではない",
        "名 + という わけではない",
        "Fórmulas: 必ずしも〜わけではない／全部(が)〜わけではない／別に〜わけではない",
      ],
    },
  ],
  usos: [
    "🧭 Deducción evidente por lo dicho → 〜わけだ（‘con razón…’）",
    "🎯 Negar interpretación absoluta → 〜わけではない（‘no necesariamente…’）",
  ],
  diferencias: [
    "〜はずだ：expectativa/probabilidad (no ‘con razón’).",
    "〜らしい：rumor; 〜ということだ：‘según/por lo visto’.",
    "〜わけがない：imposible/rotundo (mucho más fuerte).",
  ],
  tips: [
    "Con 名／なAdj formales, usa 〜というわけだ／〜というわけではない.",
    "Conectores típicos de consecuencia: だから／それで／つまり → 〜わけだ.",
    "Para suavizar: 必ずしも・別に + 〜わけではない.",
  ],
};

/* ---------------- Contenido — PRÁCTICA ---------------- */
// 1) 〜わけだ（conclusión/interpretación）
const EX_WAKE_DA: Ex[] = [
  { jp: "毎日3時間も練習しているのか。上手なわけだ。", romaji: "Mainichi san-jikan mo renshū shite iru no ka. Jōzu na wake da.", es: "¿Practica 3 horas al día? Con razón es bueno." },
  { jp: "電車が止まっていた。それで遅れたわけだ。", romaji: "Densha ga tomatte ita. Sore de okureta wake da.", es: "El tren se detuvo. Por eso se retrasó; con razón." },
  { jp: "この店は口コミが高評価だ。混むわけだ。", romaji: "Kono mise wa kuchikomi ga kōhyōka da. Komu wake da.", es: "Este local tiene reseñas altas. Con razón se llena." },
  { jp: "彼は大阪に長く住んでいた。関西弁なわけだ。", romaji: "Kare wa Ōsaka ni nagaku sunde ita. Kansai-ben na wake da.", es: "Vivió mucho en Osaka. Con razón habla dialecto de Kansai." },
  { jp: "資料を読んでいなかったのか。理解できないわけだ。", romaji: "Shiryō o yonde inakatta no ka. Rikai dekinai wake da.", es: "¿No leyó el material? Con razón no lo entiende." },
  { jp: "ここは標高が高い。夏でも涼しいわけだ。", romaji: "Koko wa hyōkō ga takai. Natsu demo suzushii wake da.", es: "Aquí la altitud es alta. De ahí que sea fresco en verano." },
];

// 2) 〜わけではない（negación parcial/matiz）
const EX_WAKE_DEWA_NAI: Ex[] = [
  { jp: "高いわけではないが、安くもない。", romaji: "Takai wake de wa nai ga, yasu ku mo nai.", es: "No es que sea caro, pero tampoco barato." },
  { jp: "日本文化が嫌いなわけではない。むしろ好きだ。", romaji: "Nihon bunka ga kirai na wake de wa nai. Mushiro suki da.", es: "No es que no me guste la cultura japonesa; al contrario, me gusta." },
  { jp: "全部が正しいわけではない。", romaji: "Zenbu ga tadashii wake de wa nai.", es: "No todo es correcto." },
  { jp: "必ずしも成功というわけではない。", romaji: "Kanarazushimo seikō to iu wake de wa nai.", es: "No es necesariamente un éxito." },
  { jp: "彼が悪いというわけではないが、注意は必要だ。", romaji: "Kare ga warui to iu wake de wa nai ga, chūi wa hitsuyō da.", es: "No es que él tenga la culpa, pero sí hay que tener cuidado." },
  { jp: "オンラインなら簡単なわけではない。", romaji: "Onrain nara kantan na wake de wa nai.", es: "Por ser en línea no significa que sea fácil." },
];

/* ---------------- 並び替え（Ordenar） ---------------- */
const ORDERS: OrderQ[] = [
  { id: 1, jp: "電車が止まっていた。それで遅れたわけだ。", romaji: "Densha ga tomatte ita. Sore de okureta wake da.", es: "El tren se detuvo. Por eso, con razón se retrasó.", tokens: ["電車が","止まっていた。","それで","遅れた","わけだ。"] },
  { id: 2, jp: "毎日練習した。上手なわけだ。", romaji: "Mainichi renshū shita. Jōzu na wake da.", es: "Practicó a diario. Con razón es bueno.", tokens: ["毎日","練習した。","上手な","わけだ。"] },
  { id: 3, jp: "全部が正しいわけではない。", romaji: "Zenbu ga tadashii wake de wa nai.", es: "No todo es correcto.", tokens: ["全部が","正しい","わけではない。"] },
  { id: 4, jp: "必ずしも成功というわけではない。", romaji: "Kanarazushimo seikō to iu wake de wa nai.", es: "No es necesariamente un éxito.", tokens: ["必ずしも","成功","という","わけではない。"] },
  { id: 5, jp: "ここは標高が高い。夏でも涼しいわけだ。", romaji: "Koko wa hyōkō ga takai. Natsu demo suzushii wake da.", es: "La altitud es alta. De ahí que sea fresco.", tokens: ["ここは","標高が","高い。","夏でも","涼しい","わけだ。"] },
  { id: 6, jp: "日本文化が嫌いなわけではない。", romaji: "Nihon bunka ga kirai na wake de wa nai.", es: "No es que odie la cultura japonesa.", tokens: ["日本文化が","嫌いな","わけではない。"] },
];

/* ---------------- QUIZ（multiple choice） ---------------- */
const QUIZ: Q[] = [
  { id: 1, stem: "渋滞だって？ それで遅れた＿＿。", options: ["わけだ", "わけではない"], answer: "わけだ", explain: "Conclusión natural por el hecho anterior." },
  { id: 2, stem: "全部正しい＿＿。", options: ["わけだ", "わけではない"], answer: "わけではない", explain: "Negación parcial: ‘no todo…’" },
  { id: 3, stem: "彼、毎日走ってるよ。体力がある＿＿。", options: ["わけだ", "わけではない"], answer: "わけだ", explain: "Deducción lógica (‘con razón…’)." },
  { id: 4, stem: "外国語だから難しい＿＿。", options: ["わけではない", "わけだ"], answer: "わけではない", explain: "‘No es que sea difícil necesariamente’." },
  { id: 5, stem: "レビューが高評価だ。人気な＿＿。", options: ["わけだ", "わけではない"], answer: "わけだ", explain: "Consecuencia esperable por la premisa." },
  { id: 6, stem: "オンラインなら簡単な＿＿。", options: ["わけではない", "わけだ"], answer: "わけではない", explain: "Matiz de negación (‘no por ser online es fácil’)." },
  { id: 7, stem: "彼が悪い＿＿が、注意は必要だ。", options: ["というわけではない", "わけだ"], answer: "というわけではない", explain: "Con 名/評価, という suena más neutro." },
  { id: 8, stem: "つまり、彼は先生＿＿。", options: ["というわけだ", "わけではない"], answer: "というわけだ", explain: "Paráfrasis/conclusión con 名." },
];

/* ---------------- Kanji de esta unidad (con nº de trazos) ---------------- */
const KANJI: Kanji[] = [
  { hex: "96ea", char: "雪", gloss: "nieve", sample: "雪（ゆき）", strokes: 11 },
  { hex: "5bfa", char: "寺", gloss: "templo", sample: "寺（てら）", strokes: 6 },
  { hex: "6728", char: "木", gloss: "árbol", sample: "木（き）", strokes: 4 },
  { hex: "679c", char: "果", gloss: "fruta", sample: "果物（くだもの）", strokes: 8 },
  { hex: "67ff", char: "柿", gloss: "caqui/persimón", sample: "柿（かき）", strokes: 9 },
  { hex: "7d05", char: "紅", gloss: "carmesí/rojo", sample: "紅葉（こうよう）", strokes: 9 },
  { hex: "98a8", char: "風", gloss: "viento/estilo", sample: "風（かぜ）", strokes: 9 },
  { hex: "5bd2", char: "寒", gloss: "frío", sample: "寒い（さむい）", strokes: 12 },
  { hex: "666f", char: "景", gloss: "paisaje", sample: "景色（けしき）", strokes: 12 },
  { hex: "6a4b", char: "橋", gloss: "puente", sample: "橋（はし）", strokes: 16 },
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
export default function N3_B2_U3_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  // Toggles
  const [openWakeDa, setOpenWakeDa] = useState(true);
  const [openWakeDewa, setOpenWakeDewa] = useState(false);
  const r1 = useChevron(openWakeDa);
  const r2 = useChevron(openWakeDewa);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b2_u3.webp")}
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
            <View style={styles.chip}><Text style={styles.chipTxt}>わけだ</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>わけではない</Text></View>
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
            <View key={`def-${i}`} style={styles.liDot}>
              <Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Cómo se une (reglas cortas)</Text>
          {PRIMARIA.union.map((sec, i) => (
            <View key={`u-${i}`} style={{ marginTop: 6 }}>
              <Text style={[styles.p, styles.bold]}>{sec.titulo}</Text>
              {sec.items.map((ln, j) => (
                <View key={`u-${i}-${j}`} style={styles.codeBlock}>
                  <Text style={styles.code}>{ln}</Text>
                </View>
              ))}
            </View>
          ))}

          <Text style={styles.h3}>Cuándo usar</Text>
          {PRIMARIA.usos.map((t, i) => (
            <View key={`uso-${i}`} style={styles.liDot}><Text style={styles.p}>{t}</Text></View>
          ))}

          <Text style={styles.h3}>Diferencias clave</Text>
          {PRIMARIA.diferencias.map((t, i) => (
            <View key={`dif-${i}`} style={styles.liDot}><Text style={styles.p}>{t}</Text></View>
          ))}

          <Text style={styles.h3}>Trucos útiles</Text>
          {PRIMARIA.tips.map((t, i) => (
            <View key={`tip-${i}`} style={styles.liDot}><Text style={styles.p}>{t}</Text></View>
          ))}
        </View>

        {/* 🗣️ Ejemplos (toggles) */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos para escuchar y leer</Text>

          {/* わけだ */}
          <Pressable onPress={() => setOpenWakeDa(!openWakeDa)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) 〜わけだ（conclusión / interpretación）</Text>
            <Animated.View style={{ transform: [{ rotate: r1 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openWakeDa && EX_WAKE_DA.map((ex, i) => (
            <View key={`wd-${i}`} style={styles.exampleRow}>
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

          {/* わけではない */}
          <Pressable onPress={() => setOpenWakeDewa(!openWakeDewa)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) 〜わけではない（negación parcial / matiz）</Text>
            <Animated.View style={{ transform: [{ rotate: r2 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openWakeDewa && EX_WAKE_DEWA_NAI.map((ex, i) => (
            <View key={`wn-${i}`} style={styles.exampleRow}>
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
          <Text style={styles.p}>Toca “Trazos” para ver la imagen con números (si ya generaste los *_nums.webp). El badge muestra el total de trazos.</Text>
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

  // ✅ Mapa a *_nums.webp (si generaste los numerados reales, verás los números)
  const REQ: Record<string, any> = {
    "96ea": require("../../../../assets/kanjivg/n3/96ea_nums.webp"),
    "5bfa": require("../../../../assets/kanjivg/n3/5bfa_nums.webp"),
    "6728": require("../../../../assets/kanjivg/n3/6728_nums.webp"),
    "679c": require("../../../../assets/kanjivg/n3/679c_nums.webp"),
    "67ff": require("../../../../assets/kanjivg/n3/67ff_nums.webp"),
    "7d05": require("../../../../assets/kanjivg/n3/7d05_nums.webp"),
    "98a8": require("../../../../assets/kanjivg/n3/98a8_nums.webp"),
    "5bd2": require("../../../../assets/kanjivg/n3/5bd2_nums.webp"),
    "666f": require("../../../../assets/kanjivg/n3/666f_nums.webp"),
    "6a4b": require("../../../../assets/kanjivg/n3/6a4b_nums.webp"),
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
            // cachePolicy="none" // ← descomenta durante pruebas para evitar caché
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
