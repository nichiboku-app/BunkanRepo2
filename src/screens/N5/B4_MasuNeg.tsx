// src/screens/N5/B4_MasuNeg.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación (XP y logros)
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_MasuNeg — Verbos en ません (presente negativo cortés)
 * - Explicación básica (arriba): qué es ～ません, cómo se forma desde ～ます, significado,
 *   presente/futuro por contexto y “el verbo va al final”.
 * - Vocabulario (formas ません) con TTS.
 * - 15 oraciones con traducción y audio.
 * - Juegos: (A) Quiz de 10, (B) “Elige la forma ません”.
 * - Logro: “Verbos ません — Presente negativo” (+10 XP, idempotente).
 */

type QA = { prompt: string; options: string[]; correct: string };
type Conj = { dict: string; masen: string; es: string };

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const ROSE = "#E11D48";
const EMERALD = "#059669";
const GOLD = "#C6A15B";
const CARD = "#FFFFFF";

function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

/* ================== VOCAB (20 verbos en ません) ================== */
const VERBOS_MASEN: { jp: string; es: string; ejemploJP: string; ejemploES: string }[] = [
  { jp: "たべません", es: "no comer", ejemploJP: "わたし は あさごはん を たべません。", ejemploES: "Yo no desayuno." },
  { jp: "のみません", es: "no beber", ejemploJP: "コーヒー を のみません。", ejemploES: "No tomo café." },
  { jp: "よみません", es: "no leer", ejemploJP: "よる ほん を よみません。", ejemploES: "Por la noche no leo libros." },
  { jp: "みません", es: "no ver/mirar", ejemploJP: "テレビ を みません。", ejemploES: "No veo la tele." },
  { jp: "ききません", es: "no escuchar", ejemploJP: "おんがく を ききません。", ejemploES: "No escucho música." },
  { jp: "かきません", es: "no escribir", ejemploJP: "まいにち にっき を かきません。", ejemploES: "No escribo diario cada día." },
  { jp: "はなしません", es: "no hablar", ejemploJP: "クラスで えいご は はなしません。", ejemploES: "En clase no hablo inglés." },
  { jp: "べんきょうしません", es: "no estudiar", ejemploJP: "きょう は べんきょうしません。", ejemploES: "Hoy no estudio." },
  { jp: "れんしゅうしません", es: "no practicar", ejemploJP: "かんじ を れんしゅうしません。", ejemploES: "No practico kanji." },
  { jp: "あいません", es: "no ver (a alguien)", ejemploJP: "にちようび ともだち に あいません。", ejemploES: "El domingo no veo a mi amigo." },
  { jp: "かいません", es: "no comprar", ejemploJP: "きょう は なにも かいません。", ejemploES: "Hoy no compro nada." },
  { jp: "つくりません", es: "no hacer/preparar", ejemploJP: "よる ごはん を つくりません。", ejemploES: "Por la noche no preparo cena." },
  { jp: "いきません", es: "no ir", ejemploJP: "あした がっこう に いきません。", ejemploES: "Mañana no voy a la escuela." },
  { jp: "きません", es: "no venir", ejemploJP: "きょう せんせい は きません。", ejemploES: "Hoy la maestra no viene." },
  { jp: "かえりません", es: "no volver", ejemploJP: "７じ に いえ に かえりません。", ejemploES: "No regreso a casa a las 7." },
  { jp: "おきません", es: "no levantarse", ejemploJP: "はやく おきません。", ejemploES: "No me levanto temprano." },
  { jp: "ねません", es: "no dormir", ejemploJP: "１２じ まえ に ねません。", ejemploES: "No duermo antes de las 12." },
  { jp: "あそびません", es: "no jugar/salir", ejemploJP: "どようび は あそびません。", ejemploES: "Los sábados no salgo." },
  { jp: "そうじしません", es: "no limpiar", ejemploJP: "へや を そうじしません。", ejemploES: "No limpio mi cuarto." },
  { jp: "うんどうしません", es: "no hacer ejercicio", ejemploJP: "まいあさ うんどうしません。", ejemploES: "No hago ejercicio cada mañana." },
];

/* ===================== EXPLICACIÓN BÁSICA (arriba) =====================
• ¿Qué es 「～ません」?  Es la forma cortés (educada) NEGATIVA del verbo.
  Sirve para decir “NO hago …”.
• ¿Cómo se forma?  Cambia 「～ます」 → 「～ません」.
  たべます → たべません、よみます → よみません、いきます → いきません、きます(来ます) → きません、します → しません
  (Ojo con verbos de grupo ごだん: かえります → かえりません, はなします → はなしません, など)
• Presente y “futuro” depende del contexto:
  El japonés no separa formalmente. 「いきません」 puede ser “no voy (en general)”
  o “mañana no voy (futuro)”, si agregas palabras de tiempo (あした/らいしゅう).
• El verbo va al final:
  Orden: [Sujeto は] [Tiempo/Lugar] [Objeto を] [Verbo ません]。
  Ej.: わたし は あした がっこう で べんきょうしません。→ “Mañana no estudio en la escuela”.
• Palabras útiles: きょう (hoy), あした (mañana), まいにち (cada día), あまり (poco), ぜんぜん (nada en absoluto + negativo).
====================================================================== */

const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "わたし は あさごはん を たべません。", es: "Yo no desayuno." },
  { jp: "まいにち コーヒー を のみません。", es: "No tomo café todos los días." },
  { jp: "よる ほん を よみません。", es: "Por la noche no leo libros." },
  { jp: "テレビ を みません。", es: "No veo la tele." },
  { jp: "クラスで えいご は はなしません。", es: "En clase no hablo inglés." },
  { jp: "きょう は べんきょうしません。", es: "Hoy no estudio." },
  { jp: "にちようび ともだち に あいません。", es: "El domingo no veo a mi amigo." },
  { jp: "きょう は なにも かいません。", es: "Hoy no compro nada." },
  { jp: "よる ごはん を つくりません。", es: "Por la noche no preparo la cena." },
  { jp: "あした がっこう に いきません。", es: "Mañana no voy a la escuela." },
  { jp: "きょう せんせい は きません。", es: "Hoy la maestra no viene." },
  { jp: "７じ に いえ に かえりません。", es: "No regreso a casa a las 7." },
  { jp: "はやく おきません。", es: "No me levanto temprano." },
  { jp: "１２じ まえ に ねません。", es: "No duermo antes de las 12." },
  { jp: "へや を そうじしません。", es: "No limpio mi cuarto." },
];

/* ===================== QUIZ (10 preguntas) ===================== */
const QUIZ_ITEMS: QA[] = [
  { prompt: "“No estudio japonés hoy.” (elige la correcta)", options: ["きょう は にほんご を べんきょうしません。", "きょう は にほんご を べんきょうします。", "きょう は にほんご を べんきょうしました。", "きょう は にほんご を べんきょうしない。"], correct: "きょう は にほんご を べんきょうしません。" },
  { prompt: "Significado: 「テレビ を みません。」", options: ["No veo la tele.", "Veo la tele.", "Vi la tele.", "No veré la tele ayer."], correct: "No veo la tele." },
  { prompt: "Elige la forma ません de “comer”", options: ["たべません", "たべませんでした", "たべます", "たべない"], correct: "たべません" },
  { prompt: "“Mañana no voy a la escuela.”", options: ["あした がっこう に いきません。", "あした がっこう に いきます。", "あした がっこう に いきました。", "あした がっこう に いかない。"], correct: "あした がっこう に いきません。" },
  { prompt: "Significado: 「はやく おきません。」", options: ["No me levanto temprano.", "Me levanto temprano.", "No me levanté temprano.", "Me levantaré temprano."], correct: "No me levanto temprano." },
  { prompt: "Elige la forma ません de “hablar” (はなす)", options: ["はなしません", "はなします", "はなせません", "はなさない"], correct: "はなしません" },
  { prompt: "“No compro nada hoy.”", options: ["きょう は なにも かいません。", "きょう は なにも かいます。", "きょう は なにも かいました。", "きょう は なにも かわない。"], correct: "きょう は なにも かいません。" },
  { prompt: "Elige la forma ません de “volver” (かえる)", options: ["かえりません", "かえりませんでした", "かえりませんだ", "かえりない"], correct: "かえりません" },
  { prompt: "Significado: 「１２じ まえ に ねません。」", options: ["No duermo antes de las 12.", "Duermo antes de las 12.", "No dormí antes de las 12.", "Dormí antes de las 12."], correct: "No duermo antes de las 12." },
  { prompt: "Elige la forma ません de “hacer” (する)", options: ["しません", "します", "できません", "しない"], correct: "しません" },
];

/* ====== Juego B: “Elige la forma ません” (12) — dict→ません ====== */
const CONJ_POOL: Conj[] = [
  { dict: "たべる", masen: "たべません", es: "comer" },
  { dict: "のむ", masen: "のみません", es: "beber" },
  { dict: "よむ", masen: "よみません", es: "leer" },
  { dict: "みる", masen: "みません", es: "ver / mirar" },
  { dict: "きく", masen: "ききません", es: "escuchar" },
  { dict: "かく", masen: "かきません", es: "escribir" },
  { dict: "はなす", masen: "はなしません", es: "hablar" },
  { dict: "いく", masen: "いきません", es: "ir" },
  { dict: "くる", masen: "きません", es: "venir" },
  { dict: "かえる", masen: "かえりません", es: "volver" }, // ごだん 注意
  { dict: "あそぶ", masen: "あそびません", es: "jugar" },
  { dict: "する", masen: "しません", es: "hacer" },
];

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

/* ====================== COMPONENTE ====================== */
export default function B4_MasuNeg() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_MasuNeg";
  const ACHIEVEMENT_ID = "masu_presente_neg";
  const ACHIEVEMENT_TITLE = "Verbos ません — Presente negativo";

  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Tabs
  const [activeTab, setActiveTab] = useState<"quiz" | "conj">("quiz");

  // Quiz
  const quiz = useMemo(() => shuffle(QUIZ_ITEMS).slice(0, 10), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // Conjugación
  const conjItems = useMemo(() => pick(CONJ_POOL, 12), []);
  const [cIndex, setCIndex] = useState(0);
  const [cScore, setCScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Logro modal
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);
  const [hasAwarded, setHasAwarded] = useState(false);

  const giveAchievementOnce = useCallback(async () => {
    if (hasAwarded) return;
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
    const res = await awardAchievement(ACHIEVEMENT_ID, { xp: 10, sub: ACHIEVEMENT_TITLE, meta: { screenKey: SCREEN_KEY, level: LEVEL } });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
    setHasAwarded(true);
  }, [hasAwarded]);

  /* ==== Quiz ==== */
  const startQuiz = () => { setStarted(true); setQIndex(0); setSelected(null); setScore(0); setFlash(null); };
  const onAnswer = async (opt: string) => {
    if (selected !== null) return;
    const cur = quiz[qIndex];
    const ok = opt === cur.correct;
    setSelected(opt);
    if (ok) { setScore(s => s + 100); setFlash("ok"); await playCorrect(); }
    else { setFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setFlash(null); setSelected(null);
      if (qIndex + 1 < quiz.length) setQIndex(i => i + 1);
      else { setStarted(false); void giveAchievementOnce(); }
    }, 650);
  };

  /* ==== Conjugación (elige ません) ==== */
  const chooseMasen = async (opt: string) => {
    const cur = conjItems[cIndex];
    const ok = opt === cur.masen;
    if (ok) { setCScore(s => s + 100); setStreak(st => st + 1); await playCorrect(); }
    else { setStreak(0); await playWrong(); }
    setTimeout(() => {
      if (cIndex + 1 < conjItems.length) setCIndex(i => i + 1);
      else { void giveAchievementOnce(); }
    }, 450);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* Header / cinta */}
        <View style={s.ribbon}>
          <Ionicons name="book" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Verbos en ません — Presente negativo</Text>

        {/* === EXPLICACIÓN BÁSICA (ARRIBA) === */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica (como 1º de primaria)</Text>
          </View>
          <View style={s.block}>
            <Text style={s.li}>• <Text style={s.kbd}>～ません</Text> es la <Text style={s.kbd}>forma cortés negativa</Text>. Significa “NO hago…”.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Formación</Text>: cambia <Text style={s.kbd}>～ます → ～ません</Text>. Ej.: たべます→たべません、よみます→よみません、いきます→いきません、します→しません、きます→きません、かえります→かえりません。</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Presente/Futuro por contexto</Text>: <Text style={s.kbd}>～ません</Text> cubre ambos; con palabras de tiempo decides si es hábito (“no como”) o futuro (“mañana no como”).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Verbo al final</Text>: orden típico <Text style={s.kbd}>[Sujeto は] [Tiempo/Lugar] [Objeto を] [Verbo ません]</Text>。</Text>
            <Text style={[s.li, { marginTop: 6 }]}><Text style={s.kbd}>Ejemplo</Text>: わたし は あした がっこう で べんきょうしません。→ “Mañana no estudio en la escuela”.</Text>
          </View>
        </View>

        {/* VOCABULARIO: verbos ません */}
        <View style={[s.infoCard, { borderColor: TEAL, backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>20 verbos comunes (forma ません)</Text>
          </View>

          <View style={s.verbsGrid}>
            {VERBOS_MASEN.map((v, i) => (
              <View key={`${v.jp}-${i}`} style={s.verbCard}>
                <View style={s.rowBetween}>
                  <View>
                    <Text style={s.verbMain}>{v.jp}</Text>
                    <Text style={s.verbSub}>{v.es}</Text>
                  </View>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(v.jp)}>
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

        {/* 15 ORACIONES con audio */}
        <View style={[s.infoCard, { borderColor: ROSE, backgroundColor: "#FFF1F2" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color={ROSE} />
            <Text style={[s.h, { color: ROSE }]}>15 oraciones negativas (escúchalas)</Text>
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

        {/* TABS */}
        <View style={s.tabsRow}>
          <Pressable onPress={() => setActiveTab("quiz")} style={[s.tabBtn, activeTab === "quiz" && s.tabActive]}>
            <Ionicons name="help-buoy" size={14} color={activeTab === "quiz" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "quiz" && s.tabTxtActive]}>Quiz 10</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("conj")} style={[s.tabBtn, activeTab === "conj" && s.tabActive]}>
            <Ionicons name="create" size={14} color={activeTab === "conj" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "conj" && s.tabTxtActive]}>Elige la forma ません</Text>
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
                <Text style={s.p}>Elige la opción correcta. Recuerda: ません = cortés y negativo; puede ser presente o futuro según contexto; el verbo cierra la oración.</Text>
                <Pressable style={s.btnPrimary} onPress={startQuiz}>
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={s.btnTxt}>Comenzar</Text>
                </Pressable>
              </View>
            )}

            {started && quiz[qIndex] && (
              <View style={[s.gameCard, flash === "ok" ? s.okFlash : flash === "bad" ? s.badFlash : null]}>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Pregunta ${qIndex + 1}/${quiz.length}`} />
                  <Chip icon="star" label={`${score} pts`} />
                </View>

                <View style={s.promptWrap}>
                  <Text style={s.prompt}>{quiz[qIndex].prompt}</Text>
                </View>

                <View style={s.optionsGrid}>
                  {quiz[qIndex].options.map((opt, i) => {
                    const chosen = selected !== null && selected === opt;
                    const isRight = selected !== null && opt === quiz[qIndex].correct;
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
                  <Chip icon="book" label={`Preguntas: ${quiz.length}`} big />
                </View>
              </View>
            )}
          </>
        )}

        {/* === Juego B: Elige la forma ません === */}
        {activeTab === "conj" && (
          <View style={s.classCard}>
            {conjItems[cIndex] ? (
              <>
                <View style={s.rowBetween}>
                  <Chip icon="bookmark" label={`Ítem ${cIndex + 1}/${conjItems.length}`} />
                  <Chip icon="star" label={`${cScore} pts`} />
                  <Chip icon="flame" label={`x${streak}`} />
                </View>

                <View style={s.bigPrompt}>
                  <Text style={s.bigJP}>{conjItems[cIndex].dict}</Text>
                  <Text style={s.bigES}>({conjItems[cIndex].es}) → elige la forma ません</Text>
                </View>

                <View style={s.optionsGrid}>
                  {shuffle([
                    conjItems[cIndex].masen,
                    ...pick(CONJ_POOL.filter(c => c.masen !== conjItems[cIndex].masen).map(c => c.masen), 3),
                  ]).map((opt, idx) => (
                    <Pressable key={`${idx}-${opt}`} onPress={() => chooseMasen(opt)} style={({ pressed }) => [s.option, pressed && s.optionPressed]}>
                      <Text style={s.optionTxt}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View>
                <View style={s.cardHeaderRow}>
                  <Ionicons name="ribbon" size={18} color={INK} />
                  <Text style={s.h}>Resumen (Conjugación)</Text>
                </View>
                <View style={s.summaryRow}>
                  <Chip icon="star" label={`Puntaje: ${cScore}`} big />
                  <Chip icon="flame" label={`Racha máx: ${streak}`} big />
                </View>
              </View>
            )}
          </View>
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

  infoCard: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 10, backgroundColor: CARD },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { marginTop: 6, color: "#374151", lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  verbsGrid: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  verbCard: { width: "48%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", paddingVertical: 12, paddingHorizontal: 12 },
  verbMain: { fontSize: 18, fontWeight: "900", color: INK },
  verbSub: { color: "#6B7280", fontSize: 12 },

  block: { marginTop: 8 },
  li: { marginTop: 4, color: "#374151", lineHeight: 20 },

  examplesList: { marginTop: 8, gap: 10 },
  exampleTile: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#FBCFE8", paddingVertical: 10, paddingHorizontal: 12 },
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

  promptWrap: { marginTop: 10, alignItems: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "#FFE4E6", backgroundColor: "#FFF1F2" },
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

  /* Juego B */
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
