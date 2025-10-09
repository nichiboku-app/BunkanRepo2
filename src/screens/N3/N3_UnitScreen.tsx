// src/screens/N3/N3_UnitScreen.tsx
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

/* ───────────────── types ───────────────── */
type RootStackParamList = {
  N3_Unit: { block: number; unit: number; title: string } | undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_Unit">;
type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type Kanji = { hex: string; char: string; gloss: string; sample: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };

/* ──────────────── kanji (10) — SOLO assets que existen ────────────────
   Archivos esperados: assets/kanjivg/n3/<hex>_web.webp
   76ee 目 / 7684 的 / 6a19 標 / 6c7a 決 / 5b9a 定
   5909 変 / 7fd2 習 / 7df4 練 / 8a66 試 / 5408 合
*/
const KANJI: Kanji[] = [
  { hex: "76ee", char: "目", gloss: "meta / ojo",        sample: "目的（もくてき）" },
  { hex: "7684", char: "的", gloss: "objetivo / -mente", sample: "目的（もくてき）" },
  { hex: "6a19", char: "標", gloss: "señal / blanco",    sample: "目標（もくひょう）" },
  { hex: "6c7a", char: "決", gloss: "decidir",           sample: "決定（けってい）" },
  { hex: "5b9a", char: "定", gloss: "fijar / decidir",   sample: "予定（よてい）" },
  { hex: "5909", char: "変", gloss: "cambiar",           sample: "変更（へんこう）" },
  { hex: "7fd2", char: "習", gloss: "aprender",          sample: "練習（れんしゅう）" },
  { hex: "7df4", char: "練", gloss: "practicar",         sample: "練習（れんしゅう）" },
  { hex: "8a66", char: "試", gloss: "probar / examen",   sample: "試験（しけん）" },
  { hex: "5408", char: "合", gloss: "unir / aprobar",    sample: "合格（ごうかく）" },
];

/* ─────────────── pantalla ─────────────── */
export default function N3_Block1_Unit1Screen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  /* hero parallax */
  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 0, 60] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  /* Explicación “como primaria” */
  const PATTERNS = [
    { p: "V（辞書形）＋ために", desc: "PARA (meta directa que controlas)" },
    { p: "N ＋ の ＋ ために",  desc: "PARA + sustantivo (por el bien de / con fin de)" },
    { p: "V（辞書形）＋ように", desc: "PARA QUE (lograr un estado / poder…)" },
    { p: "V（ない形）＋ように", desc: "PARA QUE NO (evitar algo)" },
    { p: "〜ようにする",        desc: "me esfuerzo por… (hábito objetivo)" },
    { p: "〜ようになる",        desc: "llegar a poder / empezar a…" },
  ];
  const QUICK = [
    { k: "Meta concreta", v: "合格するために勉強する（Estudio para aprobar）" },
    { k: "Resultado/posible", v: "話せるように練習する（Practico para poder hablar）" },
    { k: "Evitar", v: "遅れないように早く出る（Salgo para no llegar tarde）" },
    { k: "Con sustantivo", v: "健康のために野菜を食べる（Por salud…）" },
  ];
  const RECETAS = [
    { jp: "JLPTに合格するために、毎日３ページ解く。", es: "Para aprobar el JLPT, resuelvo 3 páginas al día." },
    { jp: "聞き取れるように、ニュースを毎朝聞く。", es: "Para poder entender, escucho noticias cada mañana." },
    { jp: "忘れないように、リマインダーを２つ入れる。", es: "Para no olvidar, pongo dos recordatorios." },
  ];

  /* ejemplos (TTS) */
  const EXAMPLES: Ex[] = [
    { jp: "合格するために毎日勉強します。", romaji: "gōkaku suru tame ni mainichi benkyō shimasu", es: "Estudio todos los días para aprobar." },
    { jp: "健康のために野菜を食べています。", romaji: "kenkō no tame ni yasai o tabete imasu", es: "Como verduras por mi salud." },
    { jp: "遅れないように早く家を出た。",     romaji: "okurenai yō ni hayaku ie o deta", es: "Salí temprano para no llegar tarde." },
    { jp: "日本語が話せるように練習しています。", romaji: "nihongo ga hanaseru yō ni renshū shite imasu", es: "Practico para poder hablar japonés." },
    { jp: "忘れないようにメモしておきます。", romaji: "wasurenai yō ni memo shite okimasu", es: "Lo anoto para no olvidarlo." },
    { jp: "試験に受かるためにこの本を買った。", romaji: "shiken ni ukaru tame ni kono hon o katta", es: "Compré este libro para pasar el examen." },
  ];

  /* mini-quiz (elige) */
  const QUIZ: Q[] = [
    { id: 1, stem: "日本語が読める___、毎日漢字を練習しています。", options: ["ために", "ように"], answer: "ように", explain: "Habilidad/resultado → ように" },
    { id: 2, stem: "健康___、毎朝果物を食べます。",                 options: ["ために", "ように"], answer: "のために", explain: "N＋の＋ために（健康のために）" },
    { id: 3, stem: "遅れない___、早めに出ましょう。",               options: ["ために", "ように"], answer: "ように", explain: "Evitar negativo → 〜ない＋ように" },
    { id: 4, stem: "試験に合格する___、このコースを受けています。",   options: ["ために", "ように"], answer: "ために", explain: "Meta concreta → ために" },
    { id: 5, stem: "事故が起きない___、ルールを守ってください。",     options: ["ために", "ように"], answer: "ように", explain: "Evitar accidente → ように" },
  ];

  /* construye la oración (ordenar) */
  const ORDERS: OrderQ[] = [
    {
      id: 1,
      jp: "合格するために毎日勉強します。",
      romaji: "gōkaku suru tame ni mainichi benkyō shimasu",
      es: "Estudio todos los días para aprobar.",
      tokens: ["合格","する","ために","毎日","勉強","します。"],
    },
    {
      id: 2,
      jp: "遅れないように早く家を出た。",
      romaji: "okurenai yō ni hayaku ie o deta",
      es: "Salí temprano para no llegar tarde.",
      tokens: ["遅れない","ように","早く","家","を","出た。"],
    },
    {
      id: 3,
      jp: "健康のために野菜を食べています。",
      romaji: "kenkō no tame ni yasai o tabete imasu",
      es: "Como verduras por mi salud.",
      tokens: ["健康","の","ために","野菜","を","食べています。"],
    },
  ];

  /* práctica extra (respuesta oculta) */
  const EXTRA: Ex[] = [
    { jp: "忘れないように、スマホに書きました。", romaji: "", es: "Para no olvidar, lo anoté en el móvil." },
    { jp: "母のために、料理を作っています。", romaji: "", es: "Cocino para mi mamá." },
    { jp: "聞き取れるように、もう一度お願いします。", romaji: "", es: "Para poder entender, otra vez por favor." },
    { jp: "体力をつけるために、毎朝走る。", romaji: "", es: "Para ganar resistencia, corro cada mañana." },
    { jp: "事故が起きないように、気をつけて。", romaji: "", es: "Para que no haya accidentes, ten cuidado." },
    { jp: "将来のために、お金を貯めています。", romaji: "", es: "Ahorro para el futuro." },
  ];

  const [picked, setPicked] = useState<Record<number, string>>({});
  const onPick = (q: Q, op: string) => {
    if (picked[q.id]) return;
    const ok = op === q.answer;
    setPicked((p) => ({ ...p, [q.id]: op }));
    ok ? playCorrect() : playWrong();
  };

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  /* ─────────────── render ─────────────── */
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* HERO — usa la imagen del león (b1_u1.webp) */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../assets/images/n3/b1_u1.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 1 — Propósitos & metas</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ために</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>〜ように</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* RESUMEN “como primaria” */}
        <View style={styles.card}>
          <Text style={styles.h2}>📌 En una línea</Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>ために</Text> = **PARA** (meta que haces a propósito).{"  "}
            <Text style={styles.bold}>ように</Text> = **PARA QUE** (resultado / poder / evitar).
          </Text>

          <Text style={[styles.h3, { marginTop: 12 }]}>🧩 Patrones clave</Text>
          {PATTERNS.map((it, i) => (
            <View key={i} style={styles.codeBlock}>
              <Text style={styles.code}>{it.p}</Text>
              <Text style={styles.gray}>{it.desc}</Text>
            </View>
          ))}

          <Text style={[styles.h3, { marginTop: 12 }]}>🔤 Mini-guía rápida</Text>
          {QUICK.map((it, i) => (
            <Text key={i} style={styles.p}>
              <Text style={styles.bold}>{it.k}:</Text> {it.v}
            </Text>
          ))}

          <Text style={[styles.h3, { marginTop: 12 }]}>🍳 Recetas modelo</Text>
          {RECETAS.map((r, i) => (
            <Text key={i} style={styles.p}>・{r.jp}（{r.es}）</Text>
          ))}
        </View>

        {/* EJEMPLOS con TTS */}
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
          <Text style={styles.p}>Toca “Trazos” para ver el orden; toca el altavoz para escuchar el compuesto.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>

        {/* CONSTRUYE LA ORACIÓN */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧱 Construye la oración（並び替え）</Text>
          <Text style={styles.p}>Toca las fichas en orden. Se corrige al completar.</Text>
          {ORDERS.map((oq) => (
            <OrderQuestion
              key={oq.id}
              q={oq}
              onSpeak={() => speakJa(oq.jp)}
              playCorrect={playCorrect}
              playWrong={playWrong}
            />
          ))}
        </View>

        {/* MINI-QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Practica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => {
            const sel = picked[q.id];
            const done = !!sel;
            return (
              <View key={q.id} style={styles.qItem}>
                <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
                <View style={styles.optRow}>
                  {q.options.map((op) => {
                    const pickedNow = sel === op;
                    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : pickedNow ? "#EF4444" : "rgba(0,0,0,0.08)";
                    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : pickedNow ? "rgba(239,68,68,.12)" : "transparent";
                    const col = done && op === q.answer ? "#0f9a6a" : done && pickedNow ? "#c62828" : "#0E1015";
                    return (
                      <Pressable key={op} onPress={() => onPick(q, op)} style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}>
                        <Text style={[styles.optTxt, { color: col }]}>{op}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {done && <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{q.explain}</Text>}
              </View>
            );
          })}
        </View>

        {/* PRÁCTICA EXTRA — respuesta oculta */}
        <View style={styles.card}>
          <Text style={styles.h2}>📝 Práctica extra (toca para revelar)</Text>
          {EXTRA.map((ex, i) => (
            <Reveal key={i} jp={ex.jp} es={ex.es} onSpeak={() => speakJa(ex.jp)} />
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

/* ────────── Kanji card ────────── */
function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);

  // SOLO archivos existentes:
  const REQ: Record<string, any> = {
    "76ee": require("../../../assets/kanjivg/n3/76ee_web.webp"),
    "7684": require("../../../assets/kanjivg/n3/7684_web.webp"),
    "6a19": require("../../../assets/kanjivg/n3/6a19_web.webp"),
    "6c7a": require("../../../assets/kanjivg/n3/6c7a_web.webp"),
    "5b9a": require("../../../assets/kanjivg/n3/5b9a_web.webp"),
    "5909": require("../../../assets/kanjivg/n3/5909_web.webp"),
    "7fd2": require("../../../assets/kanjivg/n3/7fd2_web.webp"),
    "7df4": require("../../../assets/kanjivg/n3/7df4_web.webp"),
    "8a66": require("../../../assets/kanjivg/n3/8a66_web.webp"),
    "5408": require("../../../assets/kanjivg/n3/5408_web.webp"),
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
        <Pressable
          onPress={() => src && setShowStroke((s) => !s)}
          style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}
        >
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={onSpeak} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ────────── Reveal (extra) ────────── */
function Reveal({ jp, es, onSpeak }: { jp: string; es: string; onSpeak: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 10 }}>
      <Pressable style={styles.revealBtn} onPress={() => setOpen(o => !o)}>
        <Text style={styles.revealBtnTxt}>{open ? "Ocultar respuesta" : "Mostrar respuesta"}</Text>
        <Pressable onPress={onSpeak} style={styles.kIconBtn}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
      </Pressable>
      {open && (
        <View style={styles.revealBox}>
          <Text style={styles.jp}>{jp}</Text>
          <Text style={styles.es}>{es}</Text>
        </View>
      )}
    </View>
  );
}

/* ────────── OrderQuestion component ────────── */
function OrderQuestion({
  q,
  onSpeak,
  playCorrect,
  playWrong,
}: {
  q: OrderQ;
  onSpeak: () => void;
  playCorrect: () => void;
  playWrong: () => void;
}) {
  // barajamos una única vez por ítem:
  const pool = useRef<number[]>(
    (() => {
      const idx = q.tokens.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      return idx;
    })()
  ).current;

  const [sel, setSel] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [ok, setOk] = useState(false);

  const onPickToken = (ti: number) => {
    if (done) return;
    if (sel.includes(ti)) return;
    const next = [...sel, ti];
    setSel(next);
    if (next.length === q.tokens.length) {
      const correct = next.every((v, i) => v === i);
      setDone(true);
      setOk(correct);
      correct ? playCorrect() : playWrong();
    }
  };

  const undo = () => {
    if (done) return;
    setSel((s) => s.slice(0, -1));
  };

  const reset = () => {
    setSel([]);
    setDone(false);
    setOk(false);
  };

  const answerTokens = sel.map((i) => q.tokens[i]);
  const answerStr = answerTokens.join("");

  return (
    <View style={styles.orderWrap}>
      {/* Respuesta en construcción */}
      <View style={[styles.answerBox, done && ok ? styles.answerOk : done ? styles.answerBad : null]}>
        <Text style={styles.answerTxt}>
          {answerTokens.length ? answerStr : "— arma la oración —"}
        </Text>
        <View style={styles.orderBtns}>
          <Pressable onPress={undo} style={[styles.smallBtn, { opacity: done || sel.length === 0 ? 0.5 : 1 }]}>
            <Text style={styles.smallBtnTxt}>Deshacer</Text>
          </Pressable>
          <Pressable onPress={reset} style={[styles.smallBtn, { opacity: sel.length === 0 && !done ? 0.5 : 1 }]}>
            <Text style={styles.smallBtnTxt}>Reiniciar</Text>
          </Pressable>
          <Pressable onPress={onSpeak} style={styles.kIconBtn}>
            <MCI name="volume-high" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Pool de fichas */}
      <View style={styles.tokensRow}>
        {pool.map((ti) => {
          const picked = sel.includes(ti);
          return (
            <Pressable
              key={ti}
              onPress={() => onPickToken(ti)}
              style={[
                styles.tokenChip,
                picked ? styles.tokenPicked : null,
              ]}
            >
              <Text style={[styles.tokenTxt, picked ? styles.tokenTxtPicked : null]}>
                {q.tokens[ti]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Feedback */}
      {done && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.p, { fontWeight: "800", color: ok ? "#0f9a6a" : "#c62828" }]}>
            {ok ? "¡Correcto!" : "Casi! Revisa el orden y vuelve a intentar."}
          </Text>
          <Text style={[styles.jp, { marginTop: 4 }]}>{q.jp}</Text>
          <Text style={styles.romaji}>{q.romaji}</Text>
          <Text style={styles.es}>{q.es}</Text>
        </View>
      )}
    </View>
  );
}

/* ───────────────── styles ───────────────── */
const R = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },

  /* hero */
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  /* card base */
  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015", marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "900", color: "#0E1015", marginTop: 2, marginBottom: 6 },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },
  codeBlock: { backgroundColor: "#0b0c0f", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  code: { color: "#fff", fontWeight: "800", marginBottom: 4 },

  /* ejemplos */
  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  /* kanji grid */
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

  /* quiz */
  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  /* CTA */
  primaryBtn: { marginHorizontal: 16, backgroundColor: "#AF0F2A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnTxt: { color: "#fff", fontWeight: "900" },

  /* order question */
  orderWrap: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 12 },
  answerBox: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#F6F7FB" },
  answerOk: { borderColor: "rgba(16,185,129,.5)", backgroundColor: "rgba(16,185,129,.08)" },
  answerBad: { borderColor: "rgba(239,68,68,.5)", backgroundColor: "rgba(239,68,68,.08)" },
  answerTxt: { fontWeight: "800", color: "#0E1015" },
  orderBtns: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  smallBtnTxt: { color: "#fff", fontWeight: "900" },
  tokensRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 },
  tokenChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "#fff" },
  tokenPicked: { backgroundColor: "rgba(59,130,246,.10)", borderColor: "rgba(59,130,246,.4)" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },
  tokenTxtPicked: { color: "#1e3a8a" },

  /* Reveal extra */
  revealBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0E1015", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginTop: 8 },
  revealBtnTxt: { color: "#fff", fontWeight: "900" },
  revealBox: { marginTop: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#F6F7FB", padding: 10, borderRadius: 10 },
});
