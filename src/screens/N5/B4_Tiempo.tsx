// src/screens/N5/B4_Tiempo.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_Tiempo — jikan / youbi / horas y minutos + に (punto temporal)
 * - Vocabulario primero: días de la semana, horas y minutos (con TTS).
 * - Explicación clara (nivel primaria) y “por qué に”.
 * - Tabla de HORAS y MINUTOS (irregularidades) — aquí misma (vocab primero).
 * - 9 verbos (ます) con ejemplos y audio — solo に (tiempo) + を (objeto).
 * - Vocabulario general (30) con TTS.
 * - 15 oraciones con TTS (sin へ).
 * - Juegos: Quiz (10) y “Digital → Japonés” (12).
 * - Logro: “Tiempo y に — básico” (+10 XP, idempotente).
 */

type QA = { hintES: string; correctJP: string; options: string[] };
type HourItem = { digital: string; correct: string; options: string[]; es: string };

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const FUCHSIA = "#A21CAF";
const EMERALD = "#059669";
const GOLD = "#C6A15B";
const CARD = "#FFFFFF";

function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

/* ======================= VOCABULARIO GENERAL (30) ======================= */
const VOCAB: { jp: string; es: string }[] = [
  // Días de la semana
  { jp: "にちようび", es: "domingo" },
  { jp: "げつようび", es: "lunes" },
  { jp: "かようび", es: "martes" },
  { jp: "すいようび", es: "miércoles" },
  { jp: "もくようび", es: "jueves" },
  { jp: "きんようび", es: "viernes" },
  { jp: "どようび", es: "sábado" },

  // Momentos del día
  { jp: "あさ", es: "mañana (temprano)" },
  { jp: "ひる", es: "mediodía / día" },
  { jp: "ゆうがた", es: "tarde (atardecer)" },
  { jp: "よる", es: "noche" },

  // Palabras clave de tiempo
  { jp: "きょう", es: "hoy" },
  { jp: "あした", es: "mañana (día siguiente)" },
  { jp: "きのう", es: "ayer" },
  { jp: "まいにち", es: "cada día" },
  { jp: "こんしゅう", es: "esta semana" },

  // Hora y minuto
  { jp: "〜じ", es: "〜 en punto (hora)" },
  { jp: "〜ふん / 〜ぷん", es: "〜 minutos" },
  { jp: "いちじ", es: "la 1" },
  { jp: "にじ", es: "las 2" },
  { jp: "さんじ", es: "las 3" },
  { jp: "よじ", es: "las 4 (irregular)" },
  { jp: "ごじ", es: "las 5" },
  { jp: "ろくじ", es: "las 6" },
  { jp: "しちじ", es: "las 7 (también ななじ)" },
  { jp: "はちじ", es: "las 8" },
  { jp: "くじ", es: "las 9 (irregular)" },
  { jp: "じゅうじ", es: "las 10" },
  { jp: "じゅういちじ", es: "las 11" },
  { jp: "じゅうにじ", es: "las 12" },
  { jp: "はん", es: "y media (30 min)" },
];

/* ===== DÍAS (para el bloque de vocab primero) ===== */
const DAYS: { jp: string; es: string }[] = [
  { jp: "にちようび", es: "domingo" },
  { jp: "げつようび", es: "lunes" },
  { jp: "かようび", es: "martes" },
  { jp: "すいようび", es: "miércoles" },
  { jp: "もくようび", es: "jueves" },
  { jp: "きんようび", es: "viernes" },
  { jp: "どようび", es: "sábado" },
];

/* ======================= TABLAS: HORAS & MINUTOS (con TTS) ======================= */
const TABLE_HOURS: { num: string; jp: string; note?: string }[] = [
  { num: "1", jp: "いちじ" },
  { num: "2", jp: "にじ" },
  { num: "3", jp: "さんじ" },
  { num: "4", jp: "よじ", note: "irregular" },
  { num: "5", jp: "ごじ" },
  { num: "6", jp: "ろくじ" },
  { num: "7", jp: "しちじ", note: "también ななじ" },
  { num: "8", jp: "はちじ" },
  { num: "9", jp: "くじ", note: "irregular" },
  { num: "10", jp: "じゅうじ" },
  { num: "11", jp: "じゅういちじ" },
  { num: "12", jp: "じゅうにじ" },
  { num: "Media", jp: "はん", note: "y media" },
];

const TABLE_MINUTES: { num: string; jp: string; note?: string }[] = [
  { num: "1", jp: "いっぷん", note: "ppun" },
  { num: "2", jp: "にふん" },
  { num: "3", jp: "さんぷん", note: "ppun" },
  { num: "4", jp: "よんぷん", note: "ppun" },
  { num: "5", jp: "ごふん" },
  { num: "6", jp: "ろっぷん", note: "ppun" },
  { num: "7", jp: "ななふん" },
  { num: "8", jp: "はっぷん", note: "ppun" },
  { num: "9", jp: "きゅうふん" },
  { num: "10", jp: "じゅっぷん", note: "ppun" },
  { num: "15", jp: "じゅうごふん" },
  { num: "20", jp: "にじゅっぷん", note: "ppun" },
  { num: "25", jp: "にじゅうごふん" },
  { num: "30", jp: "さんじゅっぷん / はん", note: "‘はん’ = media" },
  { num: "40", jp: "よんじゅっぷん", note: "ppun" },
  { num: "45", jp: "よんじゅうごふん" },
  { num: "50", jp: "ごじゅっぷん", note: "ppun" },
  { num: "55", jp: "ごじゅうごふん" },
];

/* ======================= EXPLICACIÓN (PRIMARIA) + POR QUÉ に ======================= */
const DEMOS: { jp: string; es: string }[] = [
  { jp: "７じ に おきます。", es: "Me levanto a las 7." },
  { jp: "７じ はん に あさごはん を たべます。", es: "Desayuno a las 7:30." },
  { jp: "かようび に にほんご を べんきょうします。", es: "Estudio japonés el martes." },
  { jp: "２じかん サッカー を します。", es: "Juego fútbol por 2 horas. (duración)" },
  { jp: "２じ に サッカー を します。", es: "Juego fútbol a las 2. (hora exacta)" },
  { jp: "きょう は ほん を よみます。", es: "Hoy leo un libro. (sin に)" },
];

/* ======================= 9 VERBOS (ます) + ejemplos con に & を ======================= */
const VERBOS_MASU: { verbo: string; es: string; ejemploJP: string; ejemploES: string }[] = [
  { verbo: "たべます", es: "comer", ejemploJP: "１２じ に ひるごはん を たべます。", ejemploES: "Como (almuerzo) a las 12." },
  { verbo: "のみます", es: "beber", ejemploJP: "６じ はん に コーヒー を のみます。", ejemploES: "Tomo café a las 6:30." },
  { verbo: "よみます", es: "leer", ejemploJP: "よる ９じ に ほん を よみます。", ejemploES: "A las 9 de la noche leo un libro." },
  { verbo: "みます", es: "ver/mirar", ejemploJP: "あした よる に えいが を みます。", ejemploES: "Mañana por la noche veré una película." },
  { verbo: "ききます", es: "escuchar", ejemploJP: "あさ ７じ に おんがく を ききます。", ejemploES: "A las 7 de la mañana escucho música." },
  { verbo: "かきます", es: "escribir", ejemploJP: "ごご ４じ に てがみ を かきます。", ejemploES: "A las 4 de la tarde escribo una carta." },
  { verbo: "べんきょうします", es: "estudiar", ejemploJP: "かようび に にほんご を べんきょうします。", ejemploES: "Estudio japonés el martes." },
  { verbo: "はじめます", es: "empezar (trans.)", ejemploJP: "３じ に しゅくだい を はじめます。", ejemploES: "Empiezo la tarea a las 3." },
  { verbo: "します", es: "hacer/practicar", ejemploJP: "６じ に スポーツ を します。", ejemploES: "Hago deporte a las 6." },
];

/* ======================= 15 ORACIONES (con TTS, sin へ) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "６じ に おきます。", es: "Me levanto a las 6." },
  { jp: "６じ はん に コーヒー を のみます。", es: "Tomo café a las 6:30." },
  { jp: "７じ に うち を でます。", es: "Salgo de casa a las 7." },
  { jp: "８じ に べんきょう を します。", es: "Estudio a las 8." },
  { jp: "１２じ に ひるごはん を たべます。", es: "Almuerzo a las 12." },
  { jp: "５じ に かえります。", es: "Vuelvo a casa a las 5." },
  { jp: "かようび に テスト が あります。", es: "Hay examen el martes." },
  { jp: "きんようび に ともだち と あそびます。", es: "El viernes juego/convivo con amigos." },
  { jp: "まいにち にほんご を べんきょうします。", es: "Estudio japonés todos los días. (sin に)" },
  { jp: "あした よる に えいが を みます。", es: "Mañana en la noche veré una película." },
  { jp: "１じかん うんどう を します。", es: "Hago ejercicio por 1 hora. (duración)" },
  { jp: "３じ に ミーティング が あります。", es: "Hay reunión a las 3." },
  { jp: "にちようび に サッカー を します。", es: "Juego fútbol el domingo." },
  { jp: "９じ に ねます。", es: "Me duermo a las 9." },
  { jp: "きのう は べんきょう しません でした。", es: "Ayer no estudié. (sin に)" },
];

/* ======================= QUIZ (10) — sin へ ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "“Me levanto a las 7.” (usa に)", correct: "７じ に おきます。", distractors: ["７じ おきます。", "７じかん に おきます。", "７じ はん に おきます。"] },
  { hintES: "“Desayuno a las 7:30.”", correct: "７じ はん に あさごはん を たべます。", distractors: ["７じ３０ふん に あさごはん を たべます。", "７じ に あさごはん を たべます。", "あさ に あさごはん を たべます。"] },
  { hintES: "“Estudio japonés todos los días.” (sin に)", correct: "まいにち にほんご を べんきょうします。", distractors: ["まいにち に にほんご を べんきょうします。", "まいにち は にほんご を べんきょうします。", "にほんご は べんきょうします。"] },
  { hintES: "“Hay reunión a las 3.”", correct: "３じ に ミーティング が あります。", distractors: ["３じ ミーティング が あります。", "３じかん に ミーティング が あります。", "さんじ は ミーティング が あります。"] },
  { hintES: "“Juego fútbol por 2 horas.” (duración)", correct: "２じかん サッカー を します。", distractors: ["２じ に サッカー を します。", "２じ サッカー を します。", "サッカー を します。"] },
  { hintES: "“El examen es el martes.” (usa youbi + に)", correct: "かようび に テスト が あります。", distractors: ["かようび テスト が あります。", "かようび は テスト が あります。", "かようび を テスト が あります。"] },
  { hintES: "“Estudio a las 8.”", correct: "８じ に べんきょう を します。", distractors: ["８じ べんきょう を します。", "８じ は べんきょう を します。", "べんきょう に ８じ を します。"] },
  { hintES: "“Me duermo a las 9.”", correct: "９じ に ねます。", distractors: ["９じ ねます。", "９じかん に ねます。", "９じ はん に ねます。"] },
  { hintES: "“No uses に con ‘hoy’” (elige la correcta)", correct: "きょう にほんご を べんきょうします。", distractors: ["きょう に にほんご を べんきょうします。", "きょう は に にほんご を べんきょうします。", "に にほんご を べんきょうします。"] },
  { hintES: "“Media hora” (elige la que usa はん correctamente)", correct: "７じ はん に おきます。", distractors: ["７じ ３０ふん はん に おきます。", "７じ はん ふん に おきます。", "７じ に はん します。"] },
];

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);
function makeQuestionPool(): QA[] {
  const base = pick(ITEMS_QA, 10);
  return base.map((it) => {
    const opts = shuffle([it.correct, ...pick(it.distractors, 3)]);
    return { hintES: it.hintES, correctJP: it.correct, options: opts };
  });
}

/* ============ Juego B: “Digital → Japonés” (12 ítems) ============ */
function jpHour(h: number) {
  switch (h) {
    case 1: return "いちじ";
    case 2: return "にじ";
    case 3: return "さんじ";
    case 4: return "よじ";
    case 5: return "ごじ";
    case 6: return "ろくじ";
    case 7: return "しちじ";
    case 8: return "はちじ";
    case 9: return "くじ";
    case 10: return "じゅうじ";
    case 11: return "じゅういちじ";
    case 12: return "じゅうにじ";
    default: return `${h}じ`;
  }
}
function jpMinute(m: number) {
  if (m === 0) return "";
  const table: Record<number, string> = {
    1: "いっぷん", 2: "にふん", 3: "さんぷん", 4: "よんぷん", 5: "ごふん",
    6: "ろっぷん", 7: "ななふん", 8: "はっぷん", 9: "きゅうふん",
    10: "じゅっぷん", 15: "じゅうごふん", 20: "にじゅっぷん", 25: "にじゅうごふん",
    30: "はん", 35: "さんじゅうごふん", 40: "よんじゅっぷん", 45: "よんじゅうごふん",
    50: "ごじゅっぷん", 55: "ごじゅうごふん",
  };
  return table[m] ?? `${m}ふん`;
}
function makeHourItem(h: number, m: number): HourItem {
  const digital = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  const H = jpHour(((h - 1) % 12) + 1);
  const M = jpMinute(m);
  const correct = M === "" ? `${H}` : M === "はん" ? `${H} はん` : `${H} ${M}`;
  const wrongs = new Set<string>();
  wrongs.add(`${H} に ${M || ""}`.trim()); // distracción: colocar に donde no va
  wrongs.add(`${H} ${M === "はん" ? "さんじゅっぷん" : "はん"}`);
  wrongs.add(`${jpHour((((h + 1) - 1) % 12) + 1)} ${M || ""}`.trim());
  const options = shuffle([correct, ...Array.from(wrongs).slice(0, 3)]);
  const es = m === 0 ? `${h}:00` : `${h}:${m.toString().padStart(2, "0")}`;
  return { digital, correct, options, es };
}
function makeHourPool(): HourItem[] {
  const pairs: [number, number][] = [
    [6, 0], [6, 30], [7, 0], [7, 30], [8, 0], [8, 15],
    [9, 45], [10, 0], [10, 30], [11, 20], [12, 0], [5, 55],
  ];
  return pairs.map(([h, m]) => makeHourItem(h, m));
}

/* ====================== COMPONENTE ====================== */
export default function B4_Tiempo() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_Tiempo";
  const ACHIEVEMENT_ID = "tiempo_ni_basico";
  const ACHIEVEMENT_TITLE = "Tiempo y に — básico";

  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Tabs juegos
  const [activeTab, setActiveTab] = useState<"quiz" | "hour">("quiz");
  const [hasAwarded, setHasAwarded] = useState(false);

  // === Juego A: Quiz
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // === Juego B: Digital → Japonés
  const hourItems = useMemo(() => makeHourPool(), []);
  const [hIndex, setHIndex] = useState(0);
  const [hScore, setHScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Modal logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);

  const giveAchievementOnce = useCallback(async () => {
    if (hasAwarded) return;
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
    const res = await awardAchievement(ACHIEVEMENT_ID, {
      xp: 10,
      sub: ACHIEVEMENT_TITLE,
      meta: { screenKey: SCREEN_KEY, level: LEVEL },
    });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
    setHasAwarded(true);
  }, [hasAwarded]);

  /* === Quiz === */
  const startQuiz = () => {
    setStarted(true);
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setFlash(null);
  };

  const onAnswer = async (value: string) => {
    const current = questions[qIndex];
    if (!current || selected !== null) return;
    const ok = value === current.correctJP;
    setSelected(value);
    if (ok) {
      setFlash("ok");
      setScore(s => s + 100);
      await playCorrect();
    } else {
      setFlash("bad");
      await playWrong();
    }
    setTimeout(() => {
      setFlash(null);
      setSelected(null);
      if (qIndex + 1 < questions.length) setQIndex(qIndex + 1);
      else {
        setStarted(false);
        void giveAchievementOnce();
      }
    }, 650);
  };

  /* === Digital → Japonés === */
  const chooseHour = async (value: string) => {
    const cur = hourItems[hIndex];
    if (!cur) return;
    const ok = value === cur.correct;
    if (ok) {
      setHScore(s => s + 100);
      setStreak(st => st + 1);
      await playCorrect();
    } else {
      setStreak(0);
      await playWrong();
    }
    setTimeout(() => {
      if (hIndex + 1 < hourItems.length) setHIndex(i => i + 1);
      else {
        void giveAchievementOnce();
      }
    }, 450);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* Cinta */}
        <View style={s.ribbon}>
          <Ionicons name="time" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Tiempo y に — horas・minutos・días</Text>
        <Text style={s.subtitle}>
          Primero aprende el <Text style={{ fontWeight: "900" }}>vocabulario</Text> clave (días, horas, minutos). Luego verás <Text style={{ fontWeight: "900" }}>por qué</Text> usamos <Text style={{ fontWeight: "900" }}>に</Text>.
        </Text>

        {/* ===== VOCABULARIO PRIMERO: DÍAS + HORAS + MINUTOS ===== */}
        <View style={[s.infoCard, { borderColor: "#10B981", backgroundColor: "#EDFFF8" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color="#059669" />
            <Text style={[s.h, { color: "#059669" }]}>Vocabulario: días de la semana</Text>
          </View>

          <View style={s.vocabGrid}>
            {DAYS.map((d, i) => (
              <View key={`${d.jp}-${i}`} style={s.vocabItem}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.vocabJP}>{d.jp}</Text>
                    <Text style={s.vocabES}>{d.es}</Text>
                  </View>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(d.jp)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View style={[s.cardHeaderRow, { marginTop: 12 }]}>
            <Ionicons name="grid" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>Horas (〜じ)</Text>
          </View>

          <Text style={s.p}>Toca el altavoz para escuchar la lectura.</Text>
          <View style={s.tableGrid}>
            {TABLE_HOURS.map((h) => (
              <View key={h.num} style={s.cell}>
                <Text style={s.cellTop}>{h.num}</Text>
                <View style={s.rowBetween}>
                  <Text style={s.cellMain}>{h.jp}</Text>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(h.jp)}>
                    <Ionicons name="volume-high" size={16} color="#fff" />
                  </Pressable>
                </View>
                {h.note ? <Text style={s.cellNote}>{h.note}</Text> : null}
              </View>
            ))}
          </View>

          <View style={[s.cardHeaderRow, { marginTop: 12 }]}>
            <Ionicons name="grid" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>Minutos (〜ふん/〜ぷん)</Text>
          </View>

          <View style={s.tableGrid}>
            {TABLE_MINUTES.map((m) => (
              <View key={m.num} style={s.cell}>
                <Text style={s.cellTop}>{m.num}</Text>
                <View style={s.rowBetween}>
                  <Text style={s.cellMain}>{m.jp}</Text>
                  <Pressable
                    style={s.ttsBtn}
                    onPress={() => speakJP(m.jp.includes(" / ") ? m.jp.split(" / ")[0] : m.jp)}
                  >
                    <Ionicons name="volume-high" size={16} color="#fff" />
                  </Pressable>
                </View>
                {m.note ? <Text style={s.cellNote}>{m.note}</Text> : null}
              </View>
            ))}
          </View>
        </View>

        {/* ===== EXPLICACIÓN + POR QUÉ に ===== */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica (por qué usamos に)</Text>
          </View>

          <View style={s.block}>
            <Text style={s.li}>• <Text style={s.kbd}>に</Text> = “chincheta” en el reloj/calendario: indica el <Text style={s.kbd}>punto exacto</Text>.</Text>
            <Text style={s.li}>• Usa <Text style={s.kbd}>に</Text> con horas/minutos y días específicos: <Text style={s.kbd}>７じ に / かようび に</Text>.</Text>
            <Text style={s.li}>• NO uses に con <Text style={s.kbd}>きょう・あした・きのう・まいにち</Text> (ya señalan tiempo).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>〜じ</Text> = hora; <Text style={s.kbd}>〜ふん/〜ぷん</Text> = minuto; <Text style={s.kbd}>はん</Text> = “y media”.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>〜じかん</Text> = duración (SIN に).</Text>
            <Text style={[s.li, { marginTop: 6, fontStyle: "italic" }]}>En esta pantalla NO usamos へ. Solo に (tiempo) y を (objeto).</Text>
          </View>

          <View style={[s.block, s.patternCard]}>
            <Text style={s.pattern}>[Hora] に [Acción]。 / [Youbi] に [Acción]。</Text>
            <View style={s.examplesList}>
              {DEMOS.map((ex, i) => (
                <View key={i} style={s.exampleTile}>
                  <View style={s.rowBetween}>
                    <Text style={s.exampleJP}>{ex.jp}</Text>
                    <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)}>
                      <Ionicons name="volume-high" size={18} color="#fff" />
                    </Pressable>
                  </View>
                  <Text style={s.exampleES}>{ex.es}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ===== 9 VERBOS (ます) + ejemplos — solo に & を ===== */}
        <View style={[s.infoCard, { borderColor: FUCHSIA, backgroundColor: "#FAE8FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="flash" size={18} color={FUCHSIA} />
            <Text style={[s.h, { color: FUCHSIA }]}>9 verbos útiles (forma ます) con に・を</Text>
          </View>

          <View style={s.verbsGrid}>
            {VERBOS_MASU.map((v, i) => (
              <View key={`${v.verbo}-${i}`} style={s.verbCard}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.verbMain}>{v.verbo}</Text>
                    <Text style={s.verbSub}>{v.es}</Text>
                  </View>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(v.verbo)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
                <View style={{ marginTop: 8 }}>
                  <View style={s.rowBetween}>
                    <Text style={s.exampleJP}>{v.ejemploJP}</Text>
                    <Pressable style={s.ttsBtn} onPress={() => speakJP(v.ejemploJP)}>
                      <Ionicons name="volume-high" size={18} color="#fff" />
                    </Pressable>
                  </View>
                  <Text style={s.exampleES}>{v.ejemploES}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== VOCABULARIO GENERAL (30) — con TTS ===== */}
        <View style={[s.infoCard, { borderColor: "#0ea5e9", backgroundColor: "#ECFEFF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="book" size={18} color="#0284c7" />
            <Text style={[s.h, { color: "#0284c7" }]}>Vocabulario ampliado (30)</Text>
          </View>
          <View style={s.vocabGrid}>
            {VOCAB.map((v, i) => (
              <View key={`${v.jp}-${i}`} style={s.vocabItem}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.vocabJP}>{v.jp}</Text>
                    <Text style={s.vocabES}>{v.es}</Text>
                  </View>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(v.jp)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== ORACIONES (15) — sin へ ===== */}
        <View style={[s.infoCard, { borderColor: "#FB7185", backgroundColor: "#FFF1F2" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color="#FB7185" />
            <Text style={[s.h, { color: "#FB7185" }]}>15 oraciones (escúchalas)</Text>
          </View>

          <View style={s.examplesList}>
            {EXAMPLES_15.map((ex, i) => (
              <View key={i} style={s.exampleTile}>
                <View style={s.rowBetween}>
                  <Text style={s.exampleJP}>{ex.jp}</Text>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== TABS de JUEGO ===== */}
        <View style={s.tabsRow}>
          <Pressable onPress={() => setActiveTab("quiz")} style={[s.tabBtn, activeTab === "quiz" && s.tabActive]}>
            <Ionicons name="help-buoy" size={14} color={activeTab === "quiz" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "quiz" && s.tabTxtActive]}>Quiz 10</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("hour")} style={[s.tabBtn, activeTab === "hour" && s.tabActive]}>
            <Ionicons name="alarm" size={14} color={activeTab === "hour" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "hour" && s.tabTxtActive]}>Digital → Japonés</Text>
          </Pressable>
        </View>

        {/* === Juego A: Quiz === */}
        {activeTab === "quiz" && (
          <>
            {!started && qIndex === 0 && score === 0 && (
              <View style={s.playCard}>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="clipboard" size={18} color={INK} />
                  <Text style={s.h}>Actividad: 10 preguntas</Text>
                </View>
                <Text style={s.p}>
                  <Text style={s.kbd}>に</Text> = punto exacto. <Text style={s.kbd}>〜じ</Text> hora, <Text style={s.kbd}>〜ふん/〜ぷん</Text> minuto, <Text style={s.kbd}>はん</Text> media,
                  y <Text style={s.kbd}>〜じかん</Text> es duración (sin に).
                </Text>
                <Pressable style={s.btnPrimary} onPress={startQuiz}>
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={s.btnTxt}>Comenzar</Text>
                </Pressable>
              </View>
            )}

            {started && questions[qIndex] && (
              <View style={[s.gameCard, flash === "ok" ? s.okFlash : flash === "bad" ? s.badFlash : null]}>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Pregunta ${qIndex + 1}/${questions.length}`} />
                  <Chip icon="star" label={`${score} pts`} />
                </View>

                <View style={s.progressWrap}>
                  <View style={[s.progressBar, { width: `${((qIndex + 1) / questions.length) * 100}%` }]} />
                </View>

                <View style={s.promptWrap}>
                  <Text style={s.promptHelp}>Elige la opción correcta:</Text>
                  <Text style={s.prompt}>{questions[qIndex].hintES}</Text>
                </View>

                <View style={s.optionsGrid}>
                  {questions[qIndex].options.map((opt, i) => {
                    const chosen = selected !== null && selected === opt;
                    const isRight = selected !== null && opt === questions[qIndex].correctJP;
                    return (
                      <Pressable
                        key={`${i}-${opt}`}
                        onPress={() => onAnswer(opt)}
                        style={({ pressed }) => [
                          s.option, pressed && s.optionPressed,
                          chosen && s.optionChosen, isRight && s.optionRight,
                          selected && !isRight && chosen && s.optionWrong,
                        ]}
                      >
                        <Text style={s.optionTxt}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {!started && qIndex > 0 && (
              <View style={s.playCard}>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="ribbon" size={18} color={INK} />
                  <Text style={s.h}>Resumen (Quiz)</Text>
                </View>
                <View style={s.summaryRow}>
                  <Chip icon="star" label={`Puntaje: ${score}`} big />
                  <Chip icon="book" label={`Preguntas: ${questions.length}`} big />
                </View>
              </View>
            )}
          </>
        )}

        {/* === Juego B: Digital → Japonés === */}
        {activeTab === "hour" && (
          <>
            {hourItems[hIndex] ? (
              <View style={s.classCard}>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Ítem ${hIndex + 1}/${hourItems.length}`} />
                  <Chip icon="star" label={`${hScore} pts`} />
                  <Chip icon="flame" label={`x${streak}`} />
                </View>

                <View style={s.bigPrompt}>
                  <Text style={s.bigJP}>{hourItems[hIndex].digital}</Text>
                  <Text style={s.bigES}>{hourItems[hIndex].es}</Text>
                </View>

                <View style={s.optionsGrid}>
                  {hourItems[hIndex].options.map((opt, idx) => (
                    <Pressable
                      key={`${idx}-${opt}`}
                      onPress={() => chooseHour(opt)}
                      style={({ pressed }) => [s.option, pressed && s.optionPressed]}
                    >
                      <Text style={s.optionTxt}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={s.playCard}>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="ribbon" size={18} color={INK} />
                  <Text style={s.h}>Resumen (Reloj)</Text>
                </View>
                <View style={s.summaryRow}>
                  <Chip icon="star" label={`Puntaje: ${hScore}`} big />
                  <Chip icon="flame" label={`Racha máx: ${streak}`} big />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de logro */}
      <Modal animationType="fade" transparent visible={rewardModalVisible} onRequestClose={() => setRewardModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Ionicons name="trophy" size={28} color={GOLD} />
            <Text style={s.modalTitle}>¡Logro desbloqueado!</Text>
            <Text style={s.modalAchievementName}>{ACHIEVEMENT_TITLE}</Text>
            <Text style={s.modalPoints}>+{modalPoints} XP</Text>
            <Pressable style={s.modalButton} onPress={() => setRewardModalVisible(false)}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={s.modalButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ===== UI helpers ===== */
function Chip({ icon, label, big }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark" | "flame"; label: string; big?: boolean }) {
  return (
    <View style={[stylesChip.chip, big && stylesChip.big]}>
      <Ionicons name={icon as any} size={big ? 18 : 14} color={INK} />
      <Text style={[stylesChip.txt, big && stylesChip.txtBig]}>{label}</Text>
    </View>
  );
}

/* ===== Estilos ===== */
const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  ribbon: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffffcc",
    borderColor: GOLD,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  ribbonTxt: { fontWeight: "900", letterSpacing: 0.4, color: INK },

  title: { fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 10, color: INK },
  subtitle: { textAlign: "center", fontSize: 13, color: "#4B5563", marginTop: 4, marginBottom: 12 },

  infoCard: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 10, backgroundColor: CARD },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { marginTop: 6, color: "#374151", lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  block: { marginTop: 8 },
  patternCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", padding: 10, marginTop: 8 },
  pattern: { fontWeight: "900", color: INK, textAlign: "center" },

  li: { marginTop: 4, color: "#374151", lineHeight: 20 },

  /* Tablas / vocab grids */
  smallTitle: { fontWeight: "900", color: INK },
  tableGrid: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  cell: { width: "48%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#D1FAE5", paddingVertical: 10, paddingHorizontal: 12 },
  cellTop: { color: "#64748B", fontSize: 12 },
  cellMain: { fontSize: 18, fontWeight: "900", color: INK },
  cellNote: { marginTop: 2, color: "#64748B", fontSize: 12 },

  verbsGrid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  verbCard: { width: "48%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#F5D0FE", paddingVertical: 12, paddingHorizontal: 12 },
  verbMain: { fontSize: 18, fontWeight: "900", color: INK },
  verbSub: { color: "#6B7280", fontSize: 12 },

  vocabGrid: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  vocabItem: { width: "48%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#D1FAE5", paddingVertical: 12, paddingHorizontal: 12 },
  vocabJP: { fontSize: 18, fontWeight: "900", color: INK },
  vocabES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

  /* Oraciones */
  examplesList: { marginTop: 8, gap: 10 },
  exampleTile: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E9D5FF", paddingVertical: 10, paddingHorizontal: 12 },
  exampleJP: { fontSize: 18, fontWeight: "900", color: INK, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

  /* Tabs */
  tabsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  tabBtn: {
    flexDirection: "row", gap: 6, alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 999, backgroundColor: "#fff",
  },
  tabActive: { backgroundColor: INK, borderColor: INK },
  tabTxt: { color: INK, fontWeight: "800" },
  tabTxtActive: { color: "#fff" },

  /* CTA / Play */
  playCard: {
    backgroundColor: "#FFFEF8",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  btnPrimary: {
    marginTop: 14,
    backgroundColor: EMERALD,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0f8a60",
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    minWidth: 220,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  /* Juego A */
  gameCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#11182710",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  progressWrap: { height: 8, backgroundColor: "#eee", borderRadius: 999, overflow: "hidden", marginTop: 4 },
  progressBar: { height: 8, backgroundColor: GOLD },

  promptWrap: { marginTop: 10, alignItems: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "#FFE4E6", backgroundColor: "#FFF1F2" },
  promptHelp: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  prompt: { fontSize: 18, fontWeight: "900", color: INK, textAlign: "center" },

  optionsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  option: {
    width: "48%", borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
    paddingVertical: 14, borderRadius: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 16, fontWeight: "700", color: INK, textAlign: "center" },
  optionChosen: { borderColor: "#D1D5DB", backgroundColor: "#fafafa" },
  optionRight: { borderColor: "#16a34a", backgroundColor: "#eaf7ee" },
  optionWrong: { borderColor: "#dc2626", backgroundColor: "#fdecec" },

  okFlash: { borderColor: "#16a34a" },
  badFlash: { borderColor: "#dc2626" },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },

  /* Juego B — Reloj */
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#11182710",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  bigPrompt: { marginTop: 8, alignItems: "center", paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "#DBEAFE", backgroundColor: "#EFF6FF" },
  bigJP: { fontSize: 36, fontWeight: "900", color: INK, textAlign: "center" },
  bigES: { marginTop: 6, color: "#475569", textAlign: "center" },

  /* TTS */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },

  /* Modal */
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: {
    width: "100%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 16,
    paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: INK, alignItems: "center", gap: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: TEAL },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: INK, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: INK, marginTop: 2, marginBottom: 10 },
  modalButton: {
    backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    minWidth: 160, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "800" },
});

const stylesChip = StyleSheet.create({
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#E5E7EB",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  txt: { fontSize: 12, color: INK, fontWeight: "700" },
  big: { paddingVertical: 8, paddingHorizontal: 12 },
  txtBig: { fontSize: 14 },
});
