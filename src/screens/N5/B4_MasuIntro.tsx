// src/screens/N5/B4_MasuIntro.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación (XP y logros)
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_MasuIntro — Verbos en ます (presente habitual afirmativo)
 * - Explicación básica (arriba): qué es ます, por qué terminan así, presente/futuro por contexto,
 *   y verbo al final de la oración (orden japonés).
 * - Vocabulario (20 verbos en ます) con TTS.
 * - 15 oraciones con traducción y audio.
 * - Juegos: (A) Quiz de 10, (B) “Elige la forma ます”.
 * - Logro: “Verbos ます — Presente habitual” (+10 XP, idempotente).
 */

type QA = { prompt: string; options: string[]; correct: string };
type Conj = { dict: string; masu: string; es: string };

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const EMERALD = "#059669";
const GOLD = "#C6A15B";
const CARD = "#FFFFFF";

function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

/* ================== VOCAB (20 verbos en ます) ================== */
const VERBOS_MASU: { jp: string; es: string; ejemploJP: string; ejemploES: string }[] = [
  { jp: "たべます", es: "comer", ejemploJP: "まいにち あさごはん を たべます.", ejemploES: "Como desayuno todos los días." },
  { jp: "のみます", es: "beber", ejemploJP: "あさ コーヒー を のみます。", ejemploES: "Por la mañana tomo café." },
  { jp: "よみます", es: "leer", ejemploJP: "よる ほん を よみます。", ejemploES: "Por la noche leo un libro." },
  { jp: "みます", es: "ver / mirar", ejemploJP: "しゅうまつ えいが を みます。", ejemploES: "Los fines de semana veo películas." },
  { jp: "ききます", es: "escuchar", ejemploJP: "まいにち おんがく を ききます。", ejemploES: "Escucho música todos los días." },
  { jp: "かきます", es: "escribir", ejemploJP: "まいにち にっきを かきます。", ejemploES: "Escribo un diario todos los días." },
  { jp: "はなします", es: "hablar", ejemploJP: "クラスで にほんご を はなします。", ejemploES: "En clase hablo japonés." },
  { jp: "べんきょうします", es: "estudiar", ejemploJP: "よる にほんご を べんきょうします。", ejemploES: "Por la noche estudio japonés." },
  { jp: "れんしゅうします", es: "practicar", ejemploJP: "まいにち かんじ を れんしゅうします。", ejemploES: "Practico kanji todos los días." },
  { jp: "あいます", es: "reunirse / ver a (alguien)", ejemploJP: "きんようび ともだち に あいます。", ejemploES: "Los viernes veo a un amigo." },
  { jp: "かいます", es: "comprar", ejemploJP: "スーパーで くだもの を かいます。", ejemploES: "Compro fruta en el súper." },
  { jp: "つくります", es: "hacer / preparar", ejemploJP: "よく カレー を つくります。", ejemploES: "A menudo preparo curry." },
  { jp: "いきます", es: "ir", ejemploJP: "まいにち がっこう に いきます。", ejemploES: "Voy a la escuela todos los días." },
  { jp: "きます", es: "venir", ejemploJP: "ともだち は よく うち に きます。", ejemploES: "Mi amigo viene seguido a mi casa." },
  { jp: "かえります", es: "volver / regresar", ejemploJP: "６じ に いえ に かえります。", ejemploES: "Regreso a casa a las 6." },
  { jp: "おきます", es: "levantarse", ejemploJP: "７じ に おきます。", ejemploES: "Me levanto a las 7." },
  { jp: "ねます", es: "dormir / acostarse", ejemploJP: "１１じ に ねます。", ejemploES: "Me duermo a las 11." },
  { jp: "あそびます", es: "jugar / convivir", ejemploJP: "どようび に ともだち と あそびます。", ejemploES: "Los sábados salgo con amigos." },
  { jp: "そうじします", es: "limpiar", ejemploJP: "まいしゅう へや を そうじします。", ejemploES: "Limpio mi cuarto cada semana." },
  { jp: "うんどうします", es: "hacer ejercicio", ejemploJP: "まいあさ うんどうします。", ejemploES: "Hago ejercicio cada mañana." },
];

/* ===================== EXPLICACIÓN BÁSICA (arriba) =====================
• ¿Por qué “ます”?  Es la forma cortés (educada) de los verbos en japonés.
  Sirve para hablar “bonito” con gente que no es cercana (clases, trabajo, etc.).
• Presente y “futuro” con la misma forma:
  El japonés no separa presente/futuro como el español. 「たべます」 puede ser:
    – hábito / verdad: “(yo) como”; “como todos los días”.
    – futuro por contexto: “mañana como con mi familia”.
• El verbo va al final:
  El orden natural es: [Sujeto は] [Tiempo/Lugar] [Objeto を] [Verbo ます]。
  Ej.: わたし は あした がっこう で べんきょうします。
       (Yo, mañana, en la escuela, estudio.) → el verbo siempre cierra la idea.
• Señales de hábito: まいにち (cada día), よく (a menudo), いつも (siempre), しゅうまつ (fin de semana)… 
====================================================================== */

const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "わたし は あさごはん を たべます。", es: "Yo como desayuno." },
  { jp: "まいにち にほんご を べんきょうします。", es: "Estudio japonés todos los días." },
  { jp: "しゅうまつ えいが を みます。", es: "Los fines de semana veo películas." },
  { jp: "よる ほん を よみます。", es: "Por la noche leo un libro." },
  { jp: "あさ コーヒー を のみます。", es: "Por la mañana tomo café." },
  { jp: "どようび に ともだち と あそびます。", es: "Los sábados salgo con amigos." },
  { jp: "まいあさ うんどうします。", es: "Hago ejercicio cada mañana." },
  { jp: "クラスで にほんご を はなします。", es: "En clase hablo japonés." },
  { jp: "スーパーで くだもの を かいます。", es: "Compro fruta en el súper." },
  { jp: "よく カレー を つくります。", es: "A menudo preparo curry." },
  { jp: "７じ に おきます。", es: "Me levanto a las 7." },
  { jp: "１１じ に ねます。", es: "Me duermo a las 11." },
  { jp: "まいにち がっこう に いきます。", es: "Voy a la escuela todos los días." },
  { jp: "ともだち は よく うち に きます。", es: "Mi amigo viene seguido a mi casa." },
  { jp: "６じ に いえ に かえります。", es: "Regreso a casa a las 6." },
];

/* ===================== QUIZ (10 preguntas) ===================== */
const QUIZ_ITEMS: QA[] = [
  { prompt: "“Estudio japonés todos los días.” (elige la correcta)", options: ["まいにち にほんご を べんきょうします。", "まいにち にほんご を べんきょうしません。", "まいにち にほんご を べんきょうしました。", "にほんご を べんきょうする。"], correct: "まいにち にほんご を べんきょうします。" },
  { prompt: "Significado: 「あさ コーヒー を のみます。」", options: ["Tomo café por la mañana.", "Tomé café por la mañana.", "No tomo café por la mañana.", "Tomaré café por la mañana."], correct: "Tomo café por la mañana." },
  { prompt: "Elige la forma ます de “ver”", options: ["みます", "みません", "みました", "みる"], correct: "みます" },
  { prompt: "“Voy a la escuela todos los días.”", options: ["まいにち がっこう に いきます。", "まいにち がっこう に いきました。", "まいにち がっこう に いきません。", "まいにち がっこう に いく。"], correct: "まいにち がっこう に いきます。" },
  { prompt: "Significado: 「よる ほん を よみます。」", options: ["Por la noche leo un libro.", "Por la noche leí un libro.", "Por la noche no leo un libro.", "Por la noche leeré un libro."], correct: "Por la noche leo un libro." },
  { prompt: "Elige la forma ます de “escribir”", options: ["かきます", "かきました", "かきません", "かく"], correct: "かきます" },
  { prompt: "“Hago ejercicio cada mañana.”", options: ["まいあさ うんどうします。", "まいあさ うんどうしません。", "まいあさ うんどうしました。", "まいあさ うんどうする。"], correct: "まいあさ うんどうします。" },
  { prompt: "Significado: 「クラスで にほんご を はなします。」", options: ["En clase hablo japonés.", "En clase hablé japonés.", "En clase no hablo japonés.", "En clase hablaré japonés."], correct: "En clase hablo japonés." },
  { prompt: "Elige la forma ます de “comer”", options: ["たべます", "たべません", "たべました", "たべる"], correct: "たべます" },
  { prompt: "“Regreso a casa a las 6.”", options: ["６じ に いえ に かえります。", "６じ に いえ に かえりました。", "６じ に いえ に かえりません。", "６じ に いえ に かえる。"], correct: "６じ に いえ に かえります。" },
];

/* ====== Juego B: “Elige la forma ます” (12) — dict→ます ====== */
const CONJ_POOL: Conj[] = [
  { dict: "たべる", masu: "たべます", es: "comer" },
  { dict: "のむ", masu: "のみます", es: "beber" },
  { dict: "よむ", masu: "よみます", es: "leer" },
  { dict: "みる", masu: "みます", es: "ver / mirar" },
  { dict: "きく", masu: "ききます", es: "escuchar" },
  { dict: "かく", masu: "かきます", es: "escribir" },
  { dict: "はなす", masu: "はなします", es: "hablar" },
  { dict: "いく", masu: "いきます", es: "ir" },
  { dict: "くる", masu: "きます", es: "venir" },
  { dict: "かえる", masu: "かえります", es: "volver" },
  { dict: "あそぶ", masu: "あそびます", es: "jugar" },
  { dict: "する", masu: "します", es: "hacer" },
];

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

/* ====================== COMPONENTE ====================== */
export default function B4_MasuIntro() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_MasuIntro";
  const ACHIEVEMENT_ID = "masu_presente_intro";
  const ACHIEVEMENT_TITLE = "Verbos ます — Presente habitual";

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

  /* ==== Conjugación (elige ます) ==== */
  const chooseMasu = async (opt: string) => {
    const cur = conjItems[cIndex];
    const ok = opt === cur.masu;
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

        <Text style={s.title}>Verbos en ます — Presente habitual</Text>

        {/* === EXPLICACIÓN BÁSICA (ARRIBA) === */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica (como 1º de primaria)</Text>
          </View>
          <View style={s.block}>
            <Text style={s.li}>• <Text style={s.kbd}>ます</Text> es la <Text style={s.kbd}>forma cortés</Text> del verbo. Se usa para hablar educado.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Presente / Futuro</Text>: en japonés, <Text style={s.kbd}>～ます</Text> sirve para hábito (“como”) y también futuro según el contexto (“mañana como”).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>Verbo al final</Text>: el verbo va al final de la oración: <Text style={s.kbd}>[Sujeto は] [Tiempo/Lugar] [Objeto を] [Verbo ます]</Text>。</Text>
            <Text style={s.li}>• Señales de hábito: <Text style={s.kbd}>まいにち・よく・いつも・しゅうまつ</Text>.</Text>
            <Text style={[s.li, { marginTop: 6 }]}><Text style={s.kbd}>Ejemplo</Text>: わたし は あした がっこう で べんきょうします。→ “Mañana estudio en la escuela”.</Text>
          </View>
        </View>

        {/* VOCABULARIO: verbos ます */}
        <View style={[s.infoCard, { borderColor: TEAL, backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color={TEAL} />
            <Text style={[s.h, { color: TEAL }]}>20 verbos comunes (forma ます)</Text>
          </View>

          <View style={s.verbsGrid}>
            {VERBOS_MASU.map((v, i) => (
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

        {/* TABS */}
        <View style={s.tabsRow}>
          <Pressable onPress={() => setActiveTab("quiz")} style={[s.tabBtn, activeTab === "quiz" && s.tabActive]}>
            <Ionicons name="help-buoy" size={14} color={activeTab === "quiz" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "quiz" && s.tabTxtActive]}>Quiz 10</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("conj")} style={[s.tabBtn, activeTab === "conj" && s.tabActive]}>
            <Ionicons name="create" size={14} color={activeTab === "conj" ? "#fff" : INK} />
            <Text style={[s.tabTxt, activeTab === "conj" && s.tabTxtActive]}>Elige la forma ます</Text>
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
                <Text style={s.p}>Elige la opción correcta. Recuerda: ます = cortés; cubre presente y también futuro según el contexto; el verbo va al final.</Text>
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

        {/* === Juego B: Elige la forma ます === */}
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
                  <Text style={s.bigES}>({conjItems[cIndex].es}) → elige la forma ます</Text>
                </View>

                <View style={s.optionsGrid}>
                  {shuffle([
                    conjItems[cIndex].masu,
                    ...pick(CONJ_POOL.filter(c => c.masu !== conjItems[cIndex].masu).map(c => c.masu), 3),
                  ]).map((opt, idx) => (
                    <Pressable key={`${idx}-${opt}`} onPress={() => chooseMasu(opt)} style={({ pressed }) => [s.option, pressed && s.optionPressed]}>
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
