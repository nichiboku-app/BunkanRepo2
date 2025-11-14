// src/screens/N5/B4_Adjetivos.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto (tu hook)
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_Adjetivos — i-adjetivos / na-adjetivos (presente: afirmación y negativo)
 * - Explicación clara tipo primaria (cómo identificarlos + negativo).
 * - Vocabulario (30) con TTS.
 * - 15 oraciones con TTS.
 * - Juegos:
 *    (A) Quiz de 10 preguntas (opción múltiple).
 *    (B) Clasificador i/na (12 ítems: elige si es i-adj o na-adj).
 * - Logro: “Adjetivos i・na — presente” (+10 XP, idempotente).
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

/* ======================= VOCABULARIO (30) ======================= */
const VOCAB: { jp: string; es: string; kind?: "i" | "na" | "misc" }[] = [
  // Reglas/partes
  { jp: "い-けいようし", es: "adjetivo tipo i", kind: "misc" },
  { jp: "な-けいようし", es: "adjetivo tipo na", kind: "misc" },
  { jp: "〜い", es: "terminación típica de i-adjetivo", kind: "misc" },
  { jp: "〜くない", es: "negativo de i-adjetivo (presente)", kind: "misc" },
  { jp: "〜です", es: "cópula / formal", kind: "misc" },
  { jp: "〜じゃありません", es: "negativo formal para na-adjetivo/sustantivo", kind: "misc" },

  // i-adjetivos frecuentes (kind: "i")
  { jp: "たかい", es: "alto/caro", kind: "i" },
  { jp: "やすい", es: "barato", kind: "i" },
  { jp: "おいしい", es: "rico/delicioso", kind: "i" },
  { jp: "まずい", es: "malo de sabor", kind: "i" },
  { jp: "たのしい", es: "divertido", kind: "i" },
  { jp: "はやい", es: "rápido/temprano", kind: "i" },
  { jp: "おそい", es: "lento/tarde", kind: "i" },
  { jp: "あつい", es: "caliente (clima/objeto)", kind: "i" },
  { jp: "さむい", es: "frío (clima)", kind: "i" },
  { jp: "やさしい", es: "amable/fácil (según contexto)", kind: "i" },

  // na-adjetivos frecuentes (kind: "na")
  { jp: "しずか", es: "tranquilo", kind: "na" },
  { jp: "にぎやか", es: "animado", kind: "na" },
  { jp: "ゆうめい", es: "famoso", kind: "na" },   // termina en い (sonido) pero es NA
  { jp: "べんり", es: "práctico/útil", kind: "na" },// idem
  { jp: "きれい", es: "bonito/limpio", kind: "na" },// idem
  { jp: "げんき", es: "con energía/bien", kind: "na" },// idem

  // Sustantivos para armar frases
  { jp: "まち", es: "ciudad/pueblo", kind: "misc" },
  { jp: "レストラン", es: "restaurante", kind: "misc" },
  { jp: "きょうしつ", es: "salón de clase", kind: "misc" },
  { jp: "たべもの", es: "comida", kind: "misc" },
  { jp: "てんき", es: "clima", kind: "misc" },
  { jp: "にほんご", es: "japonés (idioma)", kind: "misc" },
  { jp: "こうえん", es: "parque", kind: "misc" },
  { jp: "テスト", es: "examen", kind: "misc" },
  { jp: "せんせい", es: "maestro/a", kind: "misc" },
];

/* ======================= EXPLICACIÓN (PRIMARIA) ======================= */
/**
 * ¿Cómo identificar?
 * 1) i-adjetivos: suelen terminar en い (kana). Ej.: おいしい、たかい、はやい…
 * 2) na-adjetivos: se usan con な ante un sustantivo (きれい な こうえん).
 *    Como predicado van con です: きれい です。
 *
 * ⚠️ Excepciones famosas (terminan en “i” pero SON na-adjetivos):
 *   きれい、ゆうめい、べんり、げんき、きらい（※ “no gustar”）
 *   → Trátalos como na-adjetivos: きれい です / きれい じゃありません
 *
 * Negativo (presente):
 *   • i-adjetivo: (…い) → quita い → + くない です
 *     おいしい → おいしくない です
 *   • na-adjetivo: base + じゃありません
 *     しずか → しずか じゃありません
 */

// Demos con audio en la explicación
const DEMOS: { jp: string; es: string }[] = [
  { jp: "この りんご は おいしい です。", es: "Esta manzana es deliciosa. (i-afirmación)" },
  { jp: "この りんご は おいしくない です。", es: "Esta manzana no es deliciosa. (i-negativo)" },
  { jp: "この まち は しずか です。", es: "Esta ciudad es tranquila. (na-afirmación)" },
  { jp: "この まち は しずか じゃありません。", es: "Esta ciudad no es tranquila. (na-negativo)" },
  { jp: "きれい な こうえん です。", es: "Es un parque bonito. (na + な + sustantivo)" },
  { jp: "たのしい クラス です。", es: "Es una clase divertida. (i + sustantivo)" },
];

/* ======================= 15 ORACIONES (con TTS) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // i-afirmación
  { jp: "この レストラン は おいしい です。", es: "Este restaurante es rico." },
  { jp: "この くつ は やすい です。", es: "Estos zapatos son baratos." },
  { jp: "きょう の てんき は あつい です。", es: "El clima de hoy está caliente." },
  { jp: "この バス は はやい です。", es: "Este autobús es rápido." },
  { jp: "この きょうかしょ は やさしい です。", es: "Este libro de texto es fácil." },

  // i-negativo
  { jp: "この りょうり は おいしくない です。", es: "Este platillo no es delicioso." },
  { jp: "その えいが は たのしくない です。", es: "Esa película no es divertida." },
  { jp: "へや は さむくない です。", es: "La habitación no está fría." },

  // na-afirmación
  { jp: "ここ は しずか です。", es: "Aquí es tranquilo." },
  { jp: "この まち は にぎやか です。", es: "Esta ciudad es animada." },
  { jp: "せんせい は ゆうめい です。", es: "La maestra es famosa." },
  { jp: "この じかんわり は べんり です。", es: "Este horario es práctico." },

  // na-negativo
  { jp: "この きょうしつ は しずか じゃありません。", es: "Este salón no es tranquilo." },
  { jp: "この みせ は べんり じゃありません。", es: "Esta tienda no es práctica." },
  { jp: "にほんご は かんたん じゃありません。", es: "El japonés no es fácil." },
];

/* ======================= QUIZ (10) ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "Esta ciudad es tranquila. (na-afirmación)", correct: "この まち は しずか です。", distractors: ["この まち は しずかい です。", "この まち は しずか じゃありません。", "この まち は しずかな です。"] },
  { hintES: "Este platillo no es delicioso. (i-negativo)", correct: "この りょうり は おいしくない です。", distractors: ["この りょうり は おいしい じゃありません。", "この りょうり は おいしいくない です。", "この りょうり は おいしい です。"] },
  { hintES: "El salón no es tranquilo. (na-negativo)", correct: "この きょうしつ は しずか じゃありません。", distractors: ["この きょうしつ は しずかくない です。", "この きょうしつ は しずかい です。", "この きょうしつ は しずか です。"] },
  { hintES: "Este autobús es rápido. (i-afirmación)", correct: "この バス は はやい です。", distractors: ["この バス は はやくない です。", "この バス は はやい じゃありません。", "この バス は はやい な です。"] },
  { hintES: "La maestra es famosa. (na-afirmación)", correct: "せんせい は ゆうめい です。", distractors: ["せんせい は ゆうめい な です。", "せんせい は ゆうめいくない です。", "せんせい は ゆうめい じゃありません。"] },
  { hintES: "Estos zapatos son baratos. (i-afirmación)", correct: "この くつ は やすい です。", distractors: ["この くつ は やすくない です。", "この くつ は やすい な です。", "この くつ は やすい じゃありません。"] },
  { hintES: "Esta tienda no es práctica. (na-negativo)", correct: "この みせ は べんり じゃありません。", distractors: ["この みせ は べんりくない です。", "この みせ は べんりい です。", "この みせ は べんり です。"] },
  { hintES: "El clima de hoy está caliente. (i-afirmación)", correct: "きょう の てんき は あつい です。", distractors: ["きょう の てんき は あつくない です。", "きょう の てんき は あつい な です。", "きょう の てんき は あつい じゃありません。"] },
  { hintES: "El japonés no es fácil. (na-negativo)", correct: "にほんご は かんたん じゃありません。", distractors: ["にほんご は かんたんくない です。", "にほんご は かんたんい です。", "にほんご は かんたん です。"] },
  { hintES: "Esa película no es divertida. (i-negativo)", correct: "その えいが は たのしくない です。", distractors: ["その えいが は たのしい です。", "その えいが は たのしい じゃありません。", "その えいが は たのしい な です。"] },
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

/* ============ Juego B: Clasificador i/na (12 ítems) ============ */
type Kind = "i" | "na";
type ClassItem = { jp: string; es: string; kind: Kind };

function makeClassifierPool(): ClassItem[] {
  const iList = VOCAB.filter(v => v.kind === "i").map(v => ({ jp: v.jp, es: v.es, kind: "i" as Kind }));
  const naList = VOCAB.filter(v => v.kind === "na").map(v => ({ jp: v.jp, es: v.es, kind: "na" as Kind }));
  const pool = shuffle([...iList, ...naList]);
  return pick(pool, Math.min(12, pool.length));
}

export default function B4_Adjetivos() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_Adjetivos";
  const ACHIEVEMENT_ID = "adj_i_na_basico";
  const ACHIEVEMENT_TITLE = "Adjetivos i・na — presente";

  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Estado general
  const [activeTab, setActiveTab] = useState<"quiz" | "classify">("quiz");
  const [hasAwarded, setHasAwarded] = useState(false);

  // === Juego A: Quiz
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // === Juego B: Clasificador
  const [classItems, setClassItems] = useState<ClassItem[]>(() => makeClassifierPool());
  const [cIndex, setCIndex] = useState(0);
  const [cScore, setCScore] = useState(0);
  const [cStreak, setCStreak] = useState(0);
  const currentClass = classItems[cIndex];

  // Modal logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);

  /* =================== Helpers premio =================== */
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

  /* =================== Juego A (Quiz) =================== */
  const start = () => {
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
      setScore((s) => s + 100);
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

  /* =================== Juego B (Clasificador) =================== */
  const pickKind = async (choice: Kind) => {
    if (!currentClass) return;
    const ok = currentClass.kind === choice;
    if (ok) {
      setCScore(s => s + 100);
      setCStreak(st => st + 1);
      await playCorrect();
    } else {
      setCStreak(0);
      await playWrong();
    }
    setTimeout(() => {
      if (cIndex + 1 < classItems.length) setCIndex(i => i + 1);
      else {
        // fin de ronda
        void giveAchievementOnce();
      }
    }, 450);
  };

  const restartClassifier = () => {
    setClassItems(makeClassifierPool());
    setCIndex(0);
    setCScore(0);
    setCStreak(0);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* Cinta */}
        <View style={s.ribbon}>
          <Ionicons name="book" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Adjetivos: i・na — presente</Text>
        <Text style={s.subtitle}>
          <Text style={{ fontWeight: "900" }}>i-adj</Text> → termina en い: <Text style={{ fontWeight: "900" }}>おいしい</Text>. Negativo: <Text style={{ fontWeight: "900" }}>おいしくない です</Text>.{"\n"}
          <Text style={{ fontWeight: "900" }}>na-adj</Text> → con <Text style={{ fontWeight: "900" }}>な</Text> antes del sustantivo / con です como predicado. Negativo: <Text style={{ fontWeight: "900" }}>〜じゃありません</Text>.
        </Text>

        {/* EXPLICACIÓN */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>Cómo identificarlos:</Text>
            <Text style={s.li}>• <Text style={s.kbd}>i-adjetivo</Text>: casi siempre termina en <Text style={s.kbd}>…い</Text> (kana). Ej.: <Text style={s.kbd}>おいしい、たかい、はやい</Text>.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>na-adjetivo</Text>: antes de sustantivo usa <Text style={s.kbd}>な</Text> → <Text style={s.kbd}>きれい な こうえん</Text>. Como predicado: <Text style={s.kbd}>きれい です</Text>.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Excepciones</Text> (parecen i-adj pero son <Text style={s.kbd}>na</Text>): <Text style={s.kbd}>きれい・ゆうめい・べんり・げんき・きらい</Text>.</Text>
          </View>

          <View style={[s.block, s.warnCard]}>
            <Text style={s.hSmall}>Cómo hacer el negativo (presente)</Text>
            <Text style={s.li}>• i-adj: quita <Text style={s.kbd}>い</Text> → + <Text style={s.kbd}>くない です</Text> (formal).</Text>
            <Text style={s.li}>• na-adj: + <Text style={s.kbd}>じゃありません</Text> (formal).</Text>
            <View style={s.demoGrid}>
              {DEMOS.map((ex, i) => (
                <View key={i} style={s.demoTile}>
                  <View style={s.demoHeader}>
                    <Text style={s.demoJP}>{ex.jp}</Text>
                    <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)}>
                      <Ionicons name="volume-high" size={18} color="#fff" />
                    </Pressable>
                  </View>
                  <Text style={s.demoES}>{ex.es}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* VOCABULARIO */}
        <View style={[s.infoCard, { borderColor: TEAL, backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>Vocabulario usado (toca el altavoz)</Text>
          </View>

          <View style={s.vocabGrid}>
            {VOCAB.map((v, i) => (
              <View key={`${v.jp}-${i}`} style={s.vocabItem}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.vocabJP}>{v.jp}</Text>
                    <Text style={s.vocabES}>{v.es}</Text>
                  </View>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(v.jp)} accessibilityLabel={`Pronunciar ${v.jp}`}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ORACIONES */}
        <View style={[s.infoCard, { borderColor: FUCHSIA, backgroundColor: "#FAE8FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color={FUCHSIA} />
            <Text style={[s.h, { color: FUCHSIA }]}>15 oraciones de ejemplo (escúchalas)</Text>
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
          <Pressable onPress={() => setActiveTab("classify")} style={[s.tabBtn, activeTab === "classify" && s.tabActive]}>
            <Ionicons name="git-branch" size={14} color={activeTab === "classify" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "classify" && s.tabTxtActive]}>Clasificador i/na</Text>
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
                  Elige la frase correcta. Recuerda: i-adj negativo → <Text style={s.kbd}>〜くない です</Text>; na-adj negativo → <Text style={s.kbd}>〜じゃありません</Text>.
                </Text>
                <Pressable style={s.btnPrimary} onPress={start}>
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
                <Pressable style={[s.btnGhost, { marginTop: 14 }]} onPress={start}>
                  <Ionicons name="refresh" size={16} color={INK} />
                  <Text style={s.btnGhostTxt}>Jugar otra vez</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {/* === Juego B: Clasificador i/na === */}
        {activeTab === "classify" && (
          <>
            {currentClass && (
              <View style={s.classCard}>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Ítem ${cIndex + 1}/${classItems.length}`} />
                  <Chip icon="star" label={`${cScore} pts`} />
                  <Chip icon="flame" label={`x${cStreak}`} />
                </View>

                <View style={s.bigPrompt}>
                  <Text style={s.bigJP}>{currentClass.jp}</Text>
                  <Text style={s.bigES}>{currentClass.es}</Text>
                  <Pressable style={[s.ttsBtn, { alignSelf: "center", marginTop: 8 }]} onPress={() => speakJP(currentClass.jp)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>

                <View style={s.classBtnsRow}>
                  <Pressable style={[s.classBtn, { backgroundColor: "#111" }]} onPress={() => pickKind("i")}>
                    <Text style={s.classBtnTxt}>i-adjetivo</Text>
                  </Pressable>
                  <Pressable style={[s.classBtn, { backgroundColor: ROSE }]} onPress={() => pickKind("na")}>
                    <Text style={s.classBtnTxt}>na-adjetivo</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {!currentClass && (
              <View style={s.playCard}>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="ribbon" size={18} color={INK} />
                  <Text style={s.h}>Resumen (Clasificador)</Text>
                </View>
                <View style={s.summaryRow}>
                  <Chip icon="star" label={`Puntaje: ${cScore}`} big />
                  <Chip icon="flame" label={`Racha máx: ${cStreak}`} big />
                </View>
                <Pressable style={[s.btnPrimary, { marginTop: 14 }]} onPress={restartClassifier}>
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
  hSmall: { fontWeight: "900", color: INK, fontSize: 14, marginTop: 6 },
  p: { marginTop: 6, color: "#374151", lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  block: { marginTop: 8 },
  warnCard: { backgroundColor: "#FFF7ED", borderRadius: 12, borderWidth: 1, borderColor: "#FED7AA", padding: 10, marginTop: 8 },

  demoGrid: { marginTop: 8, gap: 10 },
  demoTile: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", padding: 10 },
  demoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  demoJP: { fontSize: 16, fontWeight: "900", color: INK, flex: 1, paddingRight: 8 },
  demoES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

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

  /* Juego B — Clasificador */
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
  bigPrompt: {
    marginTop: 8, alignItems: "center",
    paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "#DBEAFE", backgroundColor: "#EFF6FF",
  },
  bigJP: { fontSize: 34, fontWeight: "900", color: INK },
  bigES: { marginTop: 6, color: "#475569" },
  classBtnsRow: { flexDirection: "row", gap: 12, justifyContent: "center", marginTop: 14 },
  classBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  classBtnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  /* TTS */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },

  /* Secundarios */
  btnGhost: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  btnGhostTxt: { color: INK, fontWeight: "900" },

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
