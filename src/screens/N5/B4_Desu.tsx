// src/screens/N5/B4_Desu.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos de acierto/error
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación (tu servicio real)
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_Desu — A は B です
 * - Oración copulativa afirmativa básica: “A es B”.
 * - Explicación en bloques coloridos + 14 oraciones con TTS JP.
 * - Vocabulario usado (cada ítem con TTS).
 * - Actividad de 10 preguntas con opciones y feedback sonoro.
 * - Logro: “Verbo DESU” (10 XP la primera vez).
 */

type QA = {
  jp: string;        // respuesta correcta en japonés
  es: string;        // enunciado en español mostrado
  options: string[]; // 4 opciones en japonés (una correcta)
};

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const EMPHASIS = "#0F766E";   // teal
const BLUE = "#2563EB";
const GREEN = "#16A34A";
const AMBER = "#D97706";
const PINK = "#DB2777";
const GOLD = "#C6A15B";
const WASHI = "#FFFEF8";

const ALL_ITEMS: { A: string; B: string; es: string }[] = [
  { A: "さくら",     B: "がくせい",   es: "Sakura es estudiante." },
  { A: "たなかさん", B: "せんせい",   es: "El Sr. Tanaka es maestro." },
  { A: "マリオ",     B: "エンジニア", es: "Mario es ingeniero." },
  { A: "はな",       B: "きれい",     es: "Hana es bonita." },         // simplificado
  { A: "ねこ",       B: "ペット",     es: "El gato es una mascota." },
  { A: "リン",       B: "にほんじん", es: "Lin es japonesa." },
  { A: "テーブル",   B: "あたらしい", es: "La mesa es nueva." },
  { A: "ラーメン",   B: "おいしい",   es: "El ramen es delicioso." },
  { A: "こちら",     B: "せんせい",   es: "Esta persona es maestra." },
  { A: "これ",       B: "ほん",       es: "Esto es un libro." },
  { A: "パソコン",   B: "たかい",     es: "La computadora es cara." },
  { A: "あのひと",   B: "いしゃ",     es: "Aquella persona es doctora." },
];

// === 14 oraciones con TTS ===
const EXAMPLES_14: { jp: string; es: string }[] = [
  { jp: "これ は えんぴつ です。", es: "Esto es un lápiz." },
  { jp: "それ は いす です。", es: "Eso es una silla." },
  { jp: "あれ は でんわ です。", es: "Aquello es un teléfono." },
  { jp: "わたし は がくせい です。", es: "Yo soy estudiante." },
  { jp: "たなかさん は せんせい です。", es: "El Sr. Tanaka es maestro." },
  { jp: "さくら は にほんじん です。", es: "Sakura es japonesa." },
  { jp: "ねこ は ペット です。", es: "El gato es una mascota." },
  { jp: "この ほん は たかい です。", es: "Este libro es caro." },
  { jp: "あの ひと は いしゃ です。", es: "Aquella persona es doctora." },
  { jp: "ラーメン は おいしい です。", es: "El ramen es delicioso." },
  { jp: "テーブル は あたらしい です。", es: "La mesa es nueva." },
  { jp: "こちら は せんせい です。", es: "Esta persona es maestra." },
  { jp: "はな は きれい です。", es: "Hana es bonita." },
  { jp: "パソコン は たかい です。", es: "La computadora es cara." },
];

// === Vocabulario usado (JP → ES) ===
const VOCAB: { jp: string; es: string }[] = [
  { jp: "これ", es: "esto" },
  { jp: "それ", es: "eso" },
  { jp: "あれ", es: "aquello" },
  { jp: "この", es: "este/esta (det.)" },
  { jp: "あの", es: "aquel/aquella (det.)" },
  { jp: "ひと", es: "persona" },
  { jp: "あのひと", es: "aquella persona" },
  { jp: "こちら", es: "esta persona (formal)" },
  { jp: "えんぴつ", es: "lápiz" },
  { jp: "いす", es: "silla" },
  { jp: "でんわ", es: "teléfono" },
  { jp: "ほん", es: "libro" },
  { jp: "ねこ", es: "gato" },
  { jp: "ペット", es: "mascota" },
  { jp: "たなかさん", es: "Sr./Sra. Tanaka" },
  { jp: "さくら", es: "Sakura (nombre)" },
  { jp: "はな", es: "Hana (nombre)" },
  { jp: "ラーメン", es: "ramen" },
  { jp: "テーブル", es: "mesa" },
  { jp: "パソコン", es: "computadora" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "いしゃ", es: "doctor/a" },
  { jp: "がくせい", es: "estudiante" },
  { jp: "にほんじん", es: "japonés/a (nacionalidad)" },
  { jp: "エンジニア", es: "ingeniero/a" },
  { jp: "おいしい", es: "delicioso/a" },
  { jp: "あたらしい", es: "nuevo/a" },
  { jp: "たかい", es: "caro/a; alto" },
  { jp: "きれい", es: "bonito/limpio" },
];

// utils
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

function buildJP(a: string, b: string) {
  // Molde básico: “A は B です”
  return `${a} は ${b} です`;
}

function makeQuestionPool(): QA[] {
  const base = pick(ALL_ITEMS, 10);
  return base.map((it) => {
    const correct = buildJP(it.A, it.B);
    const pool = shuffle(ALL_ITEMS).filter((x) => x !== it);
    const d1 = buildJP(it.B, it.A);           // A/B invertidos
    const d2 = `${it.A} を ${it.B} です`;     // partícula incorrecta
    const d3 = `${it.A} は ${it.B}`;          // falta “です”
    const fallback = pool.length ? buildJP(pool[0].A, pool[0].B) : `${it.A} が ${it.B} です`;
    const options = shuffle([correct, d1, d2, d3 === correct ? fallback : d3]).slice(0, 4);
    return { jp: correct, es: it.es, options };
  });
}

// === Helpers TTS ===
function speakJP(text: string) {
  // Ajustes suaves para japonés
  Speech.speak(text, {
    language: "ja-JP",
    pitch: 1.0,
    rate: 0.98,
  });
}
function stopSpeak() {
  Speech.stop();
}

export default function B4_Desu() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_Desu";
  const ACHIEVEMENT_ID = "verbo_desu";
  const ACHIEVEMENT_TITLE = "Verbo DESU";

  // No damos XP al entrar; sólo se registra progreso.
  useAwardOnEnter(SCREEN_KEY, {
    xpOnEnter: 0,
    repeatXp: 0,
    meta: { level: LEVEL },
  });

  // Sonidos de feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Preguntas
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // Modal de recompensa
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);

  const current = questions[qIndex];

  const start = () => {
    setStarted(true);
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setFlash(null);
  };

  const onAnswer = async (value: string) => {
    if (!current || selected !== null) return;
    const isCorrect = value === current.jp;
    setSelected(value);

    if (isCorrect) {
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
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
      } else {
        setStarted(false);
        void handleFinish();
      }
    }, 650);
  };

  const handleFinish = useCallback(async () => {
    // Marca éxito (sin XP extra)
    await awardOnSuccess(SCREEN_KEY, {
      xpOnSuccess: 0,
      meta: { level: LEVEL, total: questions.length, score },
    });

    // Logro: 10 XP la primera vez
    const res = await awardAchievement(ACHIEVEMENT_ID, {
      xp: 10,
      sub: ACHIEVEMENT_TITLE,
      meta: { screenKey: SCREEN_KEY, level: LEVEL, total: questions.length, score },
    });

    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
  }, [questions.length, score]);

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* encabezado cinta */}
        <View style={s.ribbon}>
          <Ionicons name="book" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>A は B です</Text>
        <Text style={s.subtitle}>Oración copulativa — <Text style={{ fontWeight: "900" }}>“A es B”</Text></Text>

        {/* Bloques coloridos de explicación */}
        <View style={[s.infoCard, { borderColor: BLUE, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={BLUE} />
            <Text style={[s.h, { color: BLUE }]}>Explicación básica</Text>
          </View>
          <Text style={s.p}>
            <Text style={s.kbd}>は</Text> (se lee <Text style={{ fontStyle: "italic" }}>wa</Text>) marca el tema (de quién o de qué hablamos).
            <Text>{" "}</Text>
            <Text style={s.kbd}>です</Text> es como “es/soy/son” en registro educado.
          </Text>
          <Text style={s.p}>
            Molde: <Text style={s.kbd}>A は B です</Text> → <Text style={{ fontWeight: "800" }}>“A es B”.</Text>
          </Text>
        </View>

        <View style={[s.infoCard, { borderColor: GREEN, backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="checkmark-circle" size={18} color={GREEN} />
            <Text style={[s.h, { color: GREEN }]}>Reglas rápidas</Text>
          </View>
          <Text style={s.p}>• <Text style={s.kbd}>は</Text> se escribe “ha” pero suena <Text style={{ fontStyle: "italic" }}>wa</Text>.</Text>
          <Text style={s.p}>• <Text style={s.kbd}>です</Text> va al final para sonar amable.</Text>
          <Text style={s.p}>• Funciona igual con sustantivos y con adjetivos: <Text style={s.kbd}>おいしい / あたらしい / きれい</Text>.</Text>
        </View>

        {/* 14 oraciones ejemplo con TTS */}
        <View style={[s.infoCard, { borderColor: PINK, backgroundColor: "#FDF2F8" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color={PINK} />
            <Text style={[s.h, { color: PINK }]}>14 oraciones de ejemplo (escúchalas)</Text>
          </View>
          <View style={s.examplesGrid}>
            {EXAMPLES_14.map((ex, i) => (
              <View key={i} style={s.exampleTile}>
                <View style={s.rowBetween}>
                  <Text style={s.exampleJP}>{ex.jp}</Text>
                  <View style={s.audioRow}>
                    <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)} accessibilityLabel="Reproducir">
                      <Ionicons name="volume-high" size={18} color="#fff" />
                    </Pressable>
                    <Pressable style={[s.ttsBtn, s.ttsStop]} onPress={stopSpeak} accessibilityLabel="Detener">
                      <Ionicons name="stop" size={16} color="#111" />
                    </Pressable>
                  </View>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vocabulario con TTS */}
        <View style={[s.infoCard, { borderColor: AMBER, backgroundColor: "#FFFBEB" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="albums" size={18} color={AMBER} />
            <Text style={[s.h, { color: AMBER }]}>Vocabulario usado (toca el altavoz)</Text>
          </View>
          <View style={s.vocabGrid}>
            {VOCAB.map((v, i) => (
              <View key={`${v.jp}-${i}`} style={s.vocabItem}>
                <Text style={s.vocabJP}>{v.jp}</Text>
                <Text style={s.vocabES}>{v.es}</Text>
                <View style={s.audioRow}>
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(v.jp)} accessibilityLabel="Reproducir">
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                  <Pressable style={[s.ttsBtn, s.ttsStop]} onPress={stopSpeak} accessibilityLabel="Detener">
                    <Ionicons name="stop" size={16} color="#111" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Instrucciones / CTA */}
        {!started && qIndex === 0 && score === 0 && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="clipboard" size={18} color={INK} />
              <Text style={s.h}>Actividad: 10 preguntas</Text>
            </View>
            <Text style={s.p}>Lee la oración en <Text style={{ fontWeight: "900" }}>español</Text> y elige su versión correcta en <Text style={{ fontWeight: "900" }}>japonés</Text>.</Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Formato</Text>
              <Text style={s.hintBody}>Usa siempre el molde: <Text style={s.kbd}>A は B です</Text></Text>
            </View>
            <Pressable style={s.btnPrimary} onPress={start}>
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={s.btnTxt}>Comenzar</Text>
            </Pressable>
          </View>
        )}

        {/* Juego */}
        {started && current && (
          <View style={[s.gameCard, flash === "ok" ? s.okFlash : flash === "bad" ? s.badFlash : null]}>
            <View style={s.rowBetween}>
              <Chip icon="bookmark" label={`Pregunta ${qIndex + 1}/${questions.length}`} />
              <Chip icon="star" label={`${score} pts`} />
            </View>

            <View style={s.progressWrap}>
              <View style={[s.progressBar, { width: `${((qIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            <View style={s.promptWrap}>
              <Text style={s.promptHelp}>Traduce al japonés:</Text>
              <Text style={s.prompt}>{current.es}</Text>
            </View>

            <View style={s.optionsGrid}>
              {current.options.map((opt, i) => {
                const chosen = selected !== null && selected === opt;
                const isRight = selected !== null && opt === current.jp;
                return (
                  <Pressable
                    key={`${i}-${opt}`}
                    onPress={() => onAnswer(opt)}
                    style={({ pressed }) => [
                      s.option,
                      pressed && s.optionPressed,
                      chosen && s.optionChosen,
                      isRight && s.optionRight,
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

        {/* Resumen post-juego (visible además del modal) */}
        {!started && (qIndex > 0) && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="ribbon" size={18} color={INK} />
              <Text style={s.h}>Resumen</Text>
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
      </ScrollView>

      {/* Modal de logro */}
      <Modal
        animationType="fade"
        transparent
        visible={rewardModalVisible}
        onRequestClose={() => setRewardModalVisible(false)}
      >
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
function Chip({ icon, label, big }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark"; label: string; big?: boolean }) {
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

  infoCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    marginTop: 10,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { marginTop: 6, color: "#374151", lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  examplesGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  exampleTile: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5D0E6",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  exampleJP: { fontSize: 18, fontWeight: "900", color: INK, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: "#6B7280", fontSize: 12 },
  audioRow: { flexDirection: "row", gap: 8 },
  ttsBtn: {
    backgroundColor: INK,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ttsStop: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
  },

  vocabGrid: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  vocabItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  vocabJP: { fontSize: 18, fontWeight: "900", color: INK },
  vocabES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

  playCard: {
    backgroundColor: WASHI,
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
    backgroundColor: EMPHASIS,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0d6a54",
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    minWidth: 180,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  hintBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  hintTitle: { fontWeight: "900", color: INK, marginBottom: 4 },
  hintBody: { color: "#374151" },

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

  progressWrap: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBar: { height: 8, backgroundColor: GOLD },

  promptWrap: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFE6D7",
    backgroundColor: "#fffcf5",
  },
  promptHelp: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  prompt: { fontSize: 18, fontWeight: "900", color: INK, textAlign: "center" },

  optionsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  option: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 16, fontWeight: "700", color: INK, textAlign: "center" },
  optionChosen: { borderColor: "#D1D5DB", backgroundColor: "#fafafa" },
  optionRight: { borderColor: "#16a34a", backgroundColor: "#eaf7ee" },
  optionWrong: { borderColor: "#dc2626", backgroundColor: "#fdecec" },

  okFlash: { borderColor: "#16a34a" },
  badFlash: { borderColor: "#dc2626" },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: INK,
    alignItems: "center",
    gap: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: EMPHASIS },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: INK, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: INK, marginTop: 2, marginBottom: 10 },
  modalButton: {
    backgroundColor: INK,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "800" },
});

const stylesChip = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  txt: { fontSize: 12, color: INK, fontWeight: "700" },
  big: { paddingVertical: 8, paddingHorizontal: 12 },
  txtBig: { fontSize: 14 },
});
