// src/screens/N3/B3/N3_B3_U5_PracticeScreen.tsx
// 🌀 BLOQUE 3 — 5 Decisiones futuras — PRÁCTICA
// Gramática: 「〜つもりだ」「〜予定だ」 (expresar intención o planes futuros)
// Hero: ../../../../assets/images/n3/b3_u5.webp

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
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B3_U5_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B3_U5_Practice">;

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

/* ---------------- Guía clara (nivel primaria) ----------------
① 〜つもりだ ＝ “tengo la intención de / pienso …”
   • Decisión personal (en tu cabeza).
   • Forma: V(辞書形/ない形) + つもりだ
   例）来年日本に行くつもりだ。= “Pienso ir a Japón el año que viene.”
   例）今日は運動しないつもりです。= “Hoy pienso no hacer ejercicio.”

② 〜予定だ ＝ “está programado / previsto …”
   • Plan OBJETIVO (en agenda/calendario, comunicado).
   • Forma: V(辞書形)+予定だ ／ N(の)+予定だ
   例）来週は出張の予定だ。= “Hay plan de viaje de trabajo.”
   例）３時に会議をする予定です。= “Está previsto tener reunión a las 3.”

Comparación rápida:
• つもり＝intención personal (cambia con tu idea).
• 予定＝plan en agenda (cambia con el calendario).
------------------------------------------------------------------*/

const GUIA_CLARA = [
  "① 〜つもりだ ＝ “tengo la intención de / pienso …”",
  "• Decisión personal (en tu cabeza).",
  "• Forma: V(辞書形/ない形) + つもりだ",
  "例）来年日本に行くつもりだ。= “Pienso ir a Japón el año que viene.”",
  "例）今日は運動しないつもりです。= “Hoy pienso no hacer ejercicio.”",
  "",
  "② 〜予定だ ＝ “está programado / previsto …”",
  "• Plan OBJETIVO (en agenda/calendario, comunicado).",
  "• Forma: V(辞書形)+予定だ ／ N(の)+予定だ",
  "例）来週は出張の予定だ。= “Hay plan de viaje de trabajo.”",
  "例）３時に会議をする予定です。= “Está previsto tener reunión a las 3.”",
  "",
  "Comparación rápida:",
  "• つもり＝intención personal (cambia con tu idea).",
  "• 予定＝plan en agenda (cambia con el calendario).",
];

/* ---------------- Tabla de gramática ---------------- */
type Row = { patron: string; forma: string; tradu: string; nota: string };
const GRAM_TABLE: Row[] = [
  { patron: "Intención afirmativa", forma: "V辞書 + つもりだ", tradu: "‘pienso…’", nota: "decisión personal" },
  { patron: "Intención negativa", forma: "Vない + つもりだ", tradu: "‘pienso no…’", nota: "negar la intención" },
  { patron: "Plan (verbal)", forma: "V辞書 + 予定だ", tradu: "‘está previsto…’", nota: "agenda/calendario" },
  { patron: "Plan (sustantivo)", forma: "N(の) + 予定だ", tradu: "‘hay plan de N’", nota: "evento/actividad" },
  { patron: "Matiz", forma: "つもり ↔ 予定", tradu: "‘idea’ ↔ ‘agenda’", nota: "no confundir tono personal vs. oficial" },
];

/* ---------------- PRÁCTICA (elige) — 12 ítems ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "来年、日本へ留学する＿＿です。", options: ["つもり", "予定"], answer: "つもり", jp_full: "来年、日本へ留学するつもりです。", es: "Pienso ir a estudiar a Japón el año que viene.", why: "Decisión personal → つもり。" },
  { id: 2, stem: "明日は会社の健康診断の＿＿だ。", options: ["つもり", "予定"], answer: "予定", jp_full: "明日は会社の健康診断の予定だ。", es: "Mañana hay examen médico (programado).", why: "Evento de agenda → 予定。" },
  { id: 3, stem: "今日は運動しない＿＿です。", options: ["つもり", "予定"], answer: "つもり", jp_full: "今日は運動しないつもりです。", es: "Hoy pienso no hacer ejercicio.", why: "Intención negativa → つもり。" },
  { id: 4, stem: "会議は3時から始める＿＿です。", options: ["予定", "つもり"], answer: "予定", jp_full: "会議は3時から始める予定です。", es: "Está previsto empezar la reunión a las 3.", why: "Horario establecido → 予定。" },
  { id: 5, stem: "今年は旅行に行く＿＿だったが、やめた。", options: ["つもり", "予定"], answer: "つもり", jp_full: "今年は旅行に行くつもりだったが、やめた。", es: "Pensaba viajar, pero lo dejé.", why: "Cambio de idea personal → つもり。" },
  { id: 6, stem: "夏休みは家族で京都に行く＿＿だ。", options: ["予定", "つもり"], answer: "予定", jp_full: "夏休みは家族で京都に行く予定だ。", es: "Está previsto ir a Kioto con la familia.", why: "Plan familiar/agenda → 予定。" },
  { id: 7, stem: "試験まで毎日１時間勉強する＿＿です。", options: ["つもり", "予定"], answer: "つもり", jp_full: "試験まで毎日１時間勉強するつもりです。", es: "Pienso estudiar diario hasta el examen.", why: "Compromiso personal → つもり。" },
  { id: 8, stem: "来週の金曜日は出社しない＿＿です。", options: ["予定", "つもり"], answer: "予定", jp_full: "来週の金曜日は出社しない予定です。", es: "No está previsto ir a la oficina el viernes.", why: "Agenda laboral → 予定。" },
  { id: 9, stem: "卒業したら、すぐ働く＿＿だ。", options: ["つもり", "予定"], answer: "つもり", jp_full: "卒業したら、すぐ働くつもりだ。", es: "Cuando me gradúe, pienso trabajar enseguida.", why: "Voluntad personal → つもり。" },
  { id: 10, stem: "来月は新製品を発表する＿＿です。", options: ["予定", "つもり"], answer: "予定", jp_full: "来月は新製品を発表する予定です。", es: "Está previsto anunciar el producto el próximo mes.", why: "Comunicación oficial → 予定。" },
  { id: 11, stem: "今日は早く寝る＿＿なんだけど、課題が多い。", options: ["予定", "つもり"], answer: "つもり", jp_full: "今日は早く寝るつもりなんだけど、課題が多い。", es: "Pienso dormir temprano, pero hay muchas tareas.", why: "Plan mental propio → つもり。" },
  { id: 12, stem: "週末は友達の結婚式の＿＿がある。", options: ["つもり", "予定"], answer: "予定", jp_full: "週末は友達の結婚式の予定がある。", es: "El fin de semana tengo la boda (en agenda).", why: "Evento fijo en calendario → 予定。" },
];

/* ---------------- EXTRA A (rellenar guiado) — 8 ---------------- */
const EXTRA_A: Fill[] = [
  { id: 1, hint: "intención personal", jp_base: "今年はN3に合格する＿＿です。", answer: "つもり", jp_full: "今年はN3に合格するつもりです。", es: "Pienso aprobar N3 este año.", why: "Decisión propia." },
  { id: 2, hint: "agenda/oficial", jp_base: "来週は面接を受ける＿＿だ。", answer: "予定", jp_full: "来週は面接を受ける予定だ。", es: "La semana que viene está previsto hacer una entrevista.", why: "Plan en agenda." },
  { id: 3, hint: "negativa", jp_base: "今日は甘い物を食べない＿＿です。", answer: "つもり", jp_full: "今日は甘い物を食べないつもりです。", es: "Hoy pienso no comer dulces.", why: "Intención negativa." },
  { id: 4, hint: "sustantivo + 予定", jp_base: "来月は旅行（りょこう）の＿＿です。", answer: "予定", jp_full: "来月は旅行の予定です。", es: "El próximo mes hay plan de viaje.", why: "N(の)+予定。" },
  { id: 5, hint: "matiz", jp_base: "それは会社として発表する＿＿です。", answer: "予定", jp_full: "それは会社として発表する予定です。", es: "Está previsto anunciarlo como empresa.", why: "Comunicación/agenda." },
  { id: 6, hint: "cambio de idea", jp_base: "引っ越しする＿＿だったが、やめた。", answer: "つもり", jp_full: "引っ越しするつもりだったが、やめた。", es: "Pensaba mudarme, pero lo dejé.", why: "‘つもりだった’ → idea que cambió." },
  { id: 7, hint: "familia/calendario", jp_base: "夏休みは家族で海に行く＿＿だ。", answer: "予定", jp_full: "夏休みは家族で海に行く予定だ。", es: "Está previsto ir al mar con la familia.", why: "Plan familiar agendado." },
  { id: 8, hint: "compromiso propio", jp_base: "毎日30分は日本語を読む＿＿です。", answer: "つもり", jp_full: "毎日30分は日本語を読むつもりです。", es: "Pienso leer japonés 30 min al día.", why: "Intención personal concreta." },
];

/* ---------------- EXTRA B (rápidas) — 6 ---------------- */
const EXTRA_B: Fill[] = [
  { id: 1, hint: "agenda concreta", jp_base: "金曜日は在宅勤務の＿＿です。", answer: "予定", jp_full: "金曜日は在宅勤務の予定です。", es: "El viernes está previsto trabajar desde casa.", why: "Calendario laboral." },
  { id: 2, hint: "decisión propia", jp_base: "今週はSNSを見ない＿＿だ。", answer: "つもり", jp_full: "今週はSNSを見ないつもりだ。", es: "Esta semana pienso no mirar redes sociales.", why: "Intención personal." },
  { id: 3, hint: "N(の)+予定", jp_base: "来月は展示会の＿＿があります。", answer: "予定", jp_full: "来月は展示会の予定があります。", es: "El mes próximo hay plan de exposición.", why: "Sustantivo + 予定。" },
  { id: 4, hint: "decisión de estudio", jp_base: "毎朝単語を50個覚える＿＿です。", answer: "つもり", jp_full: "毎朝単語を50個覚えるつもりです。", es: "Pienso memorizar 50 palabras cada mañana.", why: "Compromiso personal." },
  { id: 5, hint: "anuncio oficial", jp_base: "新機能は来週公開する＿＿です。", answer: "予定", jp_full: "新機能は来週公開する予定です。", es: "Está previsto publicar la nueva función la próxima semana.", why: "Comunicación/agenda." },
  { id: 6, hint: "objetivo personal", jp_base: "今学期は成績を上げる＿＿だ。", answer: "つもり", jp_full: "今学期は成績を上げるつもりだ。", es: "Este semestre pienso subir mis calificaciones.", why: "Intención propia." },
];

/* ---------------- Kanji (10) vinculados a planes/agenda ---------------- */
const KANJI: Kanji[] = [
  { hex: "4e88", char: "予", gloss: "previo/prever", sample: "予定（よてい）", strokes: 4 },
  { hex: "5b9a", char: "定", gloss: "fijar/decidir", sample: "決定（けってい）", strokes: 8 },
  { hex: "8a08", char: "計", gloss: "medir/planear", sample: "計画（けいかく）", strokes: 9 },
  { hex: "753b", char: "画", gloss: "trazar/plan", sample: "計画（けいかく）", strokes: 8 },
  { hex: "7d04", char: "約", gloss: "promesa/recorte", sample: "予約（よやく）", strokes: 9 },
  { hex: "65c5", char: "旅", gloss: "viaje", sample: "旅行（りょこう）", strokes: 10 },
  { hex: "884c", char: "行", gloss: "ir/realizar", sample: "行事（ぎょうじ）", strokes: 6 },
  { hex: "9031", char: "週", gloss: "semana", sample: "来週（らいしゅう）", strokes: 11 },
  { hex: "6765", char: "来", gloss: "venir/próx.", sample: "来月（らいげつ）", strokes: 7 },
  { hex: "672b", char: "末", gloss: "fin", sample: "月末（げつまつ）", strokes: 5 },
];

/* ---------------- Helpers ---------------- */
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ---------------- Pantalla principal ---------------- */
export default function N3_B3_U5_PracticeScreen() {
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
          source={require("../../../../assets/images/n3/b3_u5.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>B3 — 5 Decisiones futuras（つもり／予定）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>つもり</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>予定</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 🧭 Guía clara integrada */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía clara — Nivel primaria</Text>
          <View style={styles.tipBox}>
            {GUIA_CLARA.map((line, i) => (
              <Text key={i} style={styles.p}>{line}</Text>
            ))}
          </View>
        </View>

        {/* 📘 Tabla de formación y matiz */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Tabla de formación y matiz</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex: 1.2 }]}>Patrón</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>Forma</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Traducción</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Nota</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.2, fontWeight: "800" }]}>{r.patron}</Text>
                <Text style={[styles.td, { flex: 1.1 }]}>{r.forma}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{r.tradu}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{r.nota}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.gray, { marginTop: 6 }]}>
            <Text style={styles.bold}>Regla rápida: </Text>
            <Text style={styles.bold}>つもり</Text> = intención personal;{" "}
            <Text style={styles.bold}>予定</Text> = plan en agenda/comunicación.
          </Text>
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
          <Text style={styles.h2}>⭐ Extra A — Rellenar (8)</Text>
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
  const BANK = ["つもり", "予定"];

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
        <Text style={[styles.jp, { color: palette.col }]}>{f.jp_base.replace("＿＿", "＿＿")}</Text>
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
    "4e88": require("../../../../assets/kanjivg/n3/4e88_nums.webp"), // 予
    "5b9a": require("../../../../assets/kanjivg/n3/5b9a_nums.webp"), // 定
    "8a08": require("../../../../assets/kanjivg/n3/8a08_nums.webp"), // 計
    "753b": require("../../../../assets/kanjivg/n3/753b_nums.webp"), // 画
    "7d04": require("../../../../assets/kanjivg/n3/7d04_nums.webp"), // 約
    "65c5": require("../../../../assets/kanjivg/n3/65c5_nums.webp"), // 旅
    "884c": require("../../../../assets/kanjivg/n3/884c_nums.webp"), // 行
    "9031": require("../../../../assets/kanjivg/n3/9031_nums.webp"), // 週
    "6765": require("../../../../assets/kanjivg/n3/6765_nums.webp"), // 来
    "672b": require("../../../../assets/kanjivg/n3/672b_nums.webp"), // 末
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
  p: { color: "#1f2330", lineHeight: 20, marginBottom: 2 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },

  tipBox: { backgroundColor: "#FFF8F2", borderLeftWidth: 4, borderLeftColor: "#B32133", padding: 12, borderRadius: 10 },

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
