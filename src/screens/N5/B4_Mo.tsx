// src/screens/N5/B4_Mo.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_Mo — Partícula も (“también / además”)
 * - Explicación sencilla: uso con sustantivos, contraste con は, negativo 〜も〜ません.
 * - Vocabulario con TTS.
 * - 15 oraciones con TTS y traducción.
 * - Juegos:
 *    (A) Quiz de 10 preguntas.
 *    (B) Elige は o も (12 ítems).
 * - Logro: “Partícula も — también” (+10 XP, idempotente).
 */

type QA = { hintES: string; correctJP: string; options: string[] };

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const FUCHSIA = "#A21CAF";
const EMERALD = "#059669";
const GOLD = "#C6A15B";
const ROSE = "#E11D48";
const CARD = "#FFFFFF";

function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

/* ======================= VOCABULARIO ======================= */
const VOCAB: { jp: string; es: string }[] = [
  { jp: "がくせい", es: "estudiante" },
  { jp: "せんせい", es: "docente" },
  { jp: "にほんじん", es: "persona japonesa" },
  { jp: "メキシコじん", es: "persona mexicana" },
  { jp: "スペインご", es: "idioma español" },
  { jp: "にほんご", es: "idioma japonés" },
  { jp: "コーヒー", es: "café" },
  { jp: "おちゃ", es: "té" },
  { jp: "ぎゅうにゅう", es: "leche" },
  { jp: "パン", es: "pan" },
  { jp: "さかな", es: "pescado" },
  { jp: "にく", es: "carne" },
  { jp: "スポーツ", es: "deporte(s)" },
  { jp: "えいが", es: "película" },
  { jp: "ほん", es: "libro" },
  { jp: "としょかん", es: "biblioteca" },
  { jp: "がっこう", es: "escuela" },
  { jp: "ともだち", es: "amistad/amigo" },
  { jp: "あさごはん", es: "desayuno" },
  { jp: "ひるごはん", es: "comida (mediodía)" },
  { jp: "ばんごはん", es: "cena" },
  { jp: "にく が すき", es: "me gusta la carne" },
  { jp: "さかな が すき", es: "me gusta el pescado" },
  { jp: "コーヒー を のみます", es: "bebo café" },
  { jp: "おちゃ を のみます", es: "bebo té" },
  { jp: "えいが を みます", es: "veo películas" },
  { jp: "ほん を よみます", es: "leo libros" },
  { jp: "スポーツ を します", es: "practico deportes" },
  { jp: "がっこう へ いきます", es: "voy a la escuela" },
  { jp: "としょかん へ いきます", es: "voy a la biblioteca" },
];

/* ======================= EXPLICACIÓN (PRIMARIA) ======================= */
/**
 * ¿Qué significa も?
 * も = “también / además”. Se usa cuando algo es igual que lo anterior.
 *
 * ¿Dónde va?
 * Reemplaza a は o が después de un sustantivo:
 *   A は がくせい です。B も がくせい です。
 *   (“A es estudiante. B también es estudiante.”)
 *
 * Negativo con も:
 *  “Nadie / ninguno” en ese grupo: だれ も 〜ません / 何(なに) も 〜ません
 *   きょう は コーヒー も のみません。 “Hoy tampoco tomo café.”
 *
 * も VS は (idea rápida)
 * - は: introduce/contrasta un tema (“de esto voy a hablar”).
 * - も: añade a lo ya dicho (“ese también entra en el mismo grupo”).
 */

const DEMOS: { jp: string; es: string }[] = [
  { jp: "わたし は がくせい です。", es: "Yo soy estudiante." },
  { jp: "トム も がくせい です。", es: "Tom también es estudiante." },
  { jp: "これは コーヒー です。", es: "Esto es café." },
  { jp: "それ も コーヒー です。", es: "Eso también es café." },
  { jp: "わたし は えいが が すき です。", es: "Me gustan las películas." },
  { jp: "ともだち も えいが が すき です。", es: "Mi amigo también gusta de películas." },
  { jp: "きょう は コーヒー を のみません。", es: "Hoy no tomo café." },
  { jp: "おちゃ も のみません。", es: "Tampoco tomo té." },
];

/* ======================= 15 ORACIONES (con TTS) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // Afirmaciones “también”
  { jp: "わたし は メキシコじん です。", es: "Yo soy mexicana/o." },
  { jp: "かれ も メキシコじん です。", es: "Él también es mexicano." },
  { jp: "マリア は せんせい です。", es: "María es docente." },
  { jp: "アンナ も せんせい です。", es: "Anna también es docente." },
  { jp: "わたし は にほんご を べんきょう します。", es: "Yo estudio japonés." },
  { jp: "ともだち も にほんご を べんきょう します。", es: "Mi amigo también estudia japonés." },
  { jp: "あさごはん は パン です。", es: "El desayuno es pan." },
  { jp: "ひるごはん も パン です。", es: "La comida también es pan." },

  // Negativos con も
  { jp: "きょう は コーヒー を のみません。", es: "Hoy no tomo café." },
  { jp: "おちゃ も のみません。", es: "Tampoco tomo té." },
  { jp: "にく は たべません。", es: "No como carne." },
  { jp: "さかな も たべません。", es: "Tampoco como pescado." },

  // “Todos/tampoco” idea
  { jp: "クラス の みんな も スポーツ を します。", es: "Todos en la clase también hacen deporte." },
  { jp: "きょう は えいが も ほん も みません。", es: "Hoy no veo ni película ni libros (tampoco leo)." },
  { jp: "きのう は としょかん へ いきました。きょう も いきます。", es: "Ayer fui a la biblioteca. Hoy también voy." },
];

/* ======================= QUIZ (10) ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  {
    hintES: "“Tom también es estudiante.”",
    correct: "トム も がくせい です。",
    distractors: ["トム は がくせい です。", "トム が がくせい です。", "トム も がくせい じゃありません。"],
  },
  {
    hintES: "“Eso también es café.” (kore/sore/are)",
    correct: "それ も コーヒー です。",
    distractors: ["それ は コーヒー も です。", "それ は コーヒー です。", "それ が コーヒー です。"],
  },
  {
    hintES: "“Mi amigo también estudia japonés.”",
    correct: "ともだち も にほんご を べんきょう します。",
    distractors: ["ともだち は にほんご も べんきょう します。", "ともだち は にほんご を べんきょう します。", "ともだち も にほんご は べんきょう します。"],
  },
  {
    hintES: "“Hoy tampoco tomo té.” (usa も + negativo)",
    correct: "きょう は おちゃ も のみません。",
    distractors: ["きょう は おちゃ は のみません。", "きょう は おちゃ を のみません。", "きょう は おちゃ が のみません。"],
  },
  {
    hintES: "“María también es docente.”",
    correct: "マリア も せんせい です。",
    distractors: ["マリア は せんせい です。", "マリア が せんせい です。", "マリア も せんせい じゃありません。"],
  },
  {
    hintES: "“Yo también practico deportes.”",
    correct: "わたし も スポーツ を します。",
    distractors: ["わたし は スポーツ も します。", "わたし は スポーツ を します。", "わたし が スポーツ を します。"],
  },
  {
    hintES: "“Hoy tampoco voy a la escuela.”",
    correct: "きょう も がっこう へ いきません。",
    distractors: ["きょう は がっこう も いきません。", "きょう は がっこう へ いきません。", "きょう が がっこう へ いきません。"],
  },
  {
    hintES: "“Mi amigo también es mexicano.”",
    correct: "ともだち も メキシコじん です。",
    distractors: ["ともだち は メキシコじん です。", "ともだち が メキシコじん です。", "ともだち も メキシコじん じゃありません。"],
  },
  {
    hintES: "“Yo no leo libros. Tampoco veo películas.” (segunda con も)",
    correct: "えいが も みません。",
    distractors: ["えいが は みません。", "えいが を みません。", "えいが が みません。"],
  },
  {
    hintES: "Completa la idea “también”: “Esto también es pan.”",
    correct: "これ も パン です。",
    distractors: ["これ は パン も です。", "これ は パン です。", "これ が パン です。"],
  },
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

/* ============ Juego B: Elige は o も (12 ítems) ============ */
type HamoItem = { jpGap: string; answer: "wa" | "mo"; full: string; es: string };

const HAMO_POOL: HamoItem[] = [
  { jpGap: "トム [__] がくせい です。", answer: "mo", full: "トム も がくせい です。", es: "Tom también es estudiante." },
  { jpGap: "マリア [__] せんせい です。", answer: "mo", full: "マリア も せんせい です。", es: "María también es docente." },
  { jpGap: "これは コーヒー です。 それ [__] コーヒー です。", answer: "mo", full: "それ も コーヒー です。", es: "Eso también es café." },
  { jpGap: "わたし [__] にほんじん です。", answer: "wa", full: "わたし は にほんじん です。", es: "Yo soy japonesa/o. (tema nuevo)" },
  { jpGap: "きょう [__] がっこう へ いきません。", answer: "mo", full: "きょう も がっこう へ いきません。", es: "Hoy tampoco voy a la escuela." },
  { jpGap: "あさごはん [__] パン です。", answer: "wa", full: "あさごはん は パン です。", es: "El desayuno es pan." },
  { jpGap: "ひるごはん [__] パン です。", answer: "mo", full: "ひるごはん も パン です。", es: "La comida también es pan." },
  { jpGap: "にく [__] たべません。", answer: "wa", full: "にく は たべません。", es: "No como carne. (primer dato)" },
  { jpGap: "さかな [__] たべません。", answer: "mo", full: "さかな も たべません。", es: "Tampoco como pescado." },
  { jpGap: "わたし [__] スポーツ を します。", answer: "wa", full: "わたし は スポーツ を します。", es: "Yo practico deportes. (tema nuevo)" },
  { jpGap: "ともだち [__] スポーツ を します。", answer: "mo", full: "ともだち も スポーツ を します。", es: "Mi amigo también practica deportes." },
  { jpGap: "これ [__] パン です。", answer: "wa", full: "これ は パン です。", es: "Esto es pan. (primera info)" },
];

function makeHamoPool(): HamoItem[] {
  return pick(HAMO_POOL, Math.min(12, HAMO_POOL.length));
}

/* ====================== COMPONENTE ====================== */
export default function B4_Mo() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_Mo";
  const ACHIEVEMENT_ID = "mo_aditivo_basico";
  const ACHIEVEMENT_TITLE = "Partícula も — también";

  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Tabs juegos
  const [activeTab, setActiveTab] = useState<"quiz" | "hamo">("quiz");
  const [hasAwarded, setHasAwarded] = useState(false);

  // === Juego A: Quiz
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // === Juego B: は / も
  const [items, setItems] = useState<HamoItem[]>(() => makeHamoPool());
  const [iIndex, setIIndex] = useState(0);
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

  /* === は / も === */
  const choose = async (choice: "wa" | "mo") => {
    const cur = items[iIndex];
    if (!cur) return;
    const ok = cur.answer === choice;
    if (ok) {
      setHScore(s => s + 100);
      setStreak(st => st + 1);
      await playCorrect();
    } else {
      setStreak(0);
      await playWrong();
    }
    setTimeout(() => {
      if (iIndex + 1 < items.length) setIIndex(i => i + 1);
      else {
        void giveAchievementOnce();
      }
    }, 450);
  };

  const restartHamo = () => {
    setItems(makeHamoPool());
    setIIndex(0);
    setHScore(0);
    setStreak(0);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* Cinta */}
        <View style={s.ribbon}>
          <Ionicons name="book" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Partícula も — “también”</Text>
        <Text style={s.subtitle}>
          <Text style={{ fontWeight: "900" }}>も</Text> añade algo al mismo grupo: “también / además”.
          Reemplaza <Text style={{ fontWeight: "900" }}>は</Text> tras el sustantivo si compartes la misma idea.
          Con negativo, marca “tampoco”: <Text style={{ fontWeight: "900" }}>〜も〜ません</Text>.
        </Text>

        {/* EXPLICACIÓN */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación rápida (nivel primaria)</Text>
          </View>

          <View style={s.block}>
            <Text style={s.li}>• も = “también / además”.</Text>
            <Text style={s.li}>• Va después del sustantivo y suele <Text style={s.kbd}>reemplazar は</Text>.</Text>
            <Text style={s.li}>• En negativo: “tampoco”. Ej.: <Text style={s.kbd}>おちゃ も のみません</Text> (tampoco tomo té).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>は</Text> presenta un tema; <Text style={s.kbd}>も</Text> dice que otro entra “también”.</Text>
          </View>

          <View style={[s.block, s.patternCard]}>
            <Text style={s.pattern}>[A] は X です。 [B] も X です。</Text>
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

        {/* VOCABULARIO */}
        <View style={[s.infoCard, { borderColor: TEAL, backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>Vocabulario (toca el altavoz)</Text>
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

        {/* ORACIONES (15) */}
        <View style={[s.infoCard, { borderColor: FUCHSIA, backgroundColor: "#FAE8FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color={FUCHSIA} />
            <Text style={[s.h, { color: FUCHSIA }]}>15 oraciones con も (escúchalas)</Text>
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

        {/* TABS de JUEGO */}
        <View style={s.tabsRow}>
          <Pressable onPress={() => setActiveTab("quiz")} style={[s.tabBtn, activeTab === "quiz" && s.tabActive]}>
            <Ionicons name="help-buoy" size={14} color={activeTab === "quiz" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "quiz" && s.tabTxtActive]}>Quiz 10</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("hamo")} style={[s.tabBtn, activeTab === "hamo" && s.tabActive]}>
            <Ionicons name="swap-horizontal" size={14} color={activeTab === "hamo" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "hamo" && s.tabTxtActive]}>Elige は / も</Text>
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
                  Marca la frase correcta que use <Text style={s.kbd}>も</Text> para “también”
                  (y <Text style={s.kbd}>〜も〜ません</Text> para “tampoco”).
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

        {/* === Juego B: は / も === */}
        {activeTab === "hamo" && (
          <>
            {items[iIndex] ? (
              <View style={s.classCard}>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Ítem ${iIndex + 1}/${items.length}`} />
                  <Chip icon="star" label={`${hScore} pts`} />
                  <Chip icon="flame" label={`x${streak}`} />
                </View>

                <View style={s.bigPrompt}>
                  <Text style={s.bigJP}>{items[iIndex].jpGap}</Text>
                  <Text style={s.bigES}>{items[iIndex].es}</Text>
                </View>

                <View style={s.classBtnsRow}>
                  <Pressable style={[s.classBtn, { backgroundColor: "#111" }]} onPress={() => choose("wa")}>
                    <Text style={s.classBtnTxt}>は</Text>
                  </Pressable>
                  <Pressable style={[s.classBtn, { backgroundColor: ROSE }]} onPress={() => choose("mo")}>
                    <Text style={s.classBtnTxt}>も</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={s.playCard}>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="ribbon" size={18} color={INK} />
                  <Text style={s.h}>Resumen (は / も)</Text>
                </View>
                <View style={s.summaryRow}>
                  <Chip icon="star" label={`Puntaje: ${hScore}`} big />
                  <Chip icon="flame" label={`Racha máx: ${streak}`} big />
                </View>
                <Pressable style={[s.btnPrimary, { marginTop: 14 }]} onPress={restartHamo}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={s.btnTxt}>Reintentar</Text>
                </Pressable>
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

  title: { fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 10, color: INK },
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

  /* Vocab */
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

  /* Juego B — は / も */
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
  bigJP: { fontSize: 24, fontWeight: "900", color: INK, textAlign: "center" },
  bigES: { marginTop: 6, color: "#475569", textAlign: "center" },
  classBtnsRow: { flexDirection: "row", gap: 12, justifyContent: "center", marginTop: 14 },
  classBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  classBtnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

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
