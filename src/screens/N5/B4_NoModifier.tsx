// src/screens/N5/B4_NoModifier.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_NoModifier — N1 の N2 (posesión/pertenencia/clasificación/modificador)
 * - Explicación “primaria” con ejemplos muy claros.
 * - Vocabulario (30) con TTS.
 * - 15 oraciones ejemplo con TTS.
 * - Actividad: 10 preguntas (elige la frase correcta según pista ES).
 * - Logro: “Partícula の — posesión/modificador” con +10 XP (solo primera vez).
 */

type QA = {
  hintES: string;     // pista en español
  correctJP: string;  // opción correcta
  options: string[];  // 4 opciones
};

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const FUCHSIA = "#A21CAF";
const AMBER = "#D97706";
const EMERALD = "#059669";
const GOLD = "#C6A15B";
const CARD = "#FFFFFF";

// =============== TTS helper ===============
function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

// =============== VOCABULARIO (30) ===============
const VOCAB: { jp: string; es: string }[] = [
  { jp: "の", es: "partícula de posesión/modificador" },
  { jp: "わたし", es: "yo" },
  { jp: "あなた", es: "tú" },
  { jp: "たなかさん", es: "Sr./Sra. Tanaka" },
  { jp: "さくら", es: "Sakura (nombre)" },
  { jp: "がくせい", es: "estudiante" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "いしゃ", es: "doctor/a" },
  { jp: "かいしゃいん", es: "empleado/a de empresa" },
  { jp: "にほん", es: "Japón" },
  { jp: "スペイン", es: "España" },
  { jp: "にほんご", es: "idioma japonés" },
  { jp: "スペインご", es: "idioma español" },
  { jp: "こうこう", es: "preparatoria" },
  { jp: "だいがく", es: "universidad" },
  { jp: "せいと", es: "alumno/a" },
  { jp: "ほん", es: "libro" },
  { jp: "ノート", es: "cuaderno" },
  { jp: "かばん", es: "bolsa/mochila" },
  { jp: "いえ", es: "casa" },
  { jp: "くるま", es: "auto" },
  { jp: "ねこ", es: "gato" },
  { jp: "いぬ", es: "perro" },
  { jp: "がっこう", es: "escuela" },
  { jp: "せんせいの", es: "del maestro/de la maestra" },
  { jp: "がくせいの", es: "del estudiante" },
  { jp: "にほんの", es: "de Japón; japonés (de origen)" },
  { jp: "スペインの", es: "de España; español (de origen)" },
  { jp: "ともだち", es: "amigo/a" },
  { jp: "かぞく", es: "familia" },
];

// =============== EJEMPLOS (15) ===============
const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "わたし の ほん です。", es: "Es mi libro." },
  { jp: "たなかさん の くるま です。", es: "Es el auto del Sr. Tanaka." },
  { jp: "さくら の かばん です。", es: "Es la mochila de Sakura." },
  { jp: "せんせい の いえ です。", es: "Es la casa del maestro/de la maestra." },
  { jp: "がくせい の ノート です。", es: "Es el cuaderno del estudiante." },
  { jp: "にほん の くるま です。", es: "Es un auto japonés (de Japón)." },
  { jp: "スペイン の ほん です。", es: "Es un libro español (de España)." },
  { jp: "にほんご の せんせい です。", es: "Es profesor/a de japonés." },
  { jp: "だいがく の せんせい です。", es: "Es profesor/a de universidad." },
  { jp: "がっこう の ともだち です。", es: "Es amigo/a de la escuela." },
  { jp: "いぬ の エサ です。", es: "Es comida del perro." },
  { jp: "ねこ の おもちゃ です。", es: "Es el juguete del gato." },
  { jp: "わたし の かぞく です。", es: "Es mi familia." },
  { jp: "せんせい の がくせい です。", es: "Es estudiante del maestro/de la maestra." },
  { jp: "こうこう の せいと です。", es: "Es alumno/a de preparatoria." },
];

// =============== PREGUNTAS (10) ===============
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "Es el libro de Tanaka.", correct: "たなかさん の ほん です。", distractors: ["たなかさん は ほん です。", "たなかさん の ほん ですか。", "たなかさん が ほん です。"] },
  { hintES: "Es mi cuaderno.", correct: "わたし の ノート です。", distractors: ["わたし は ノート です。", "わたし の ノート ですか。", "わたし が ノート です。"] },
  { hintES: "Es el auto de Sakura.", correct: "さくら の くるま です。", distractors: ["さくら は くるま です。", "さくら の くるま ですか。", "さくら が くるま です。"] },
  { hintES: "Es el maestro de japonés.", correct: "にほんご の せんせい です。", distractors: ["にほんご は せんせい です。", "にほんご の せんせい ですか。", "にほんご が せんせい です。"] },
  { hintES: "Es un auto japonés (de Japón).", correct: "にほん の くるま です。", distractors: ["にほん は くるま です。", "にほん の くるま ですか。", "にほん が くるま です。"] },
  { hintES: "Es un libro español (de España).", correct: "スペイン の ほん です。", distractors: ["スペイン は ほん です。", "スペイン の ほん ですか。", "スペイン が ほん です。"] },
  { hintES: "Es amigo de la escuela.", correct: "がっこう の ともだち です。", distractors: ["がっこう は ともだち です。", "がっこう の ともだち ですか。", "がっこう が ともだち です。"] },
  { hintES: "Es el juguete del gato.", correct: "ねこ の おもちゃ です。", distractors: ["ねこ は おもちゃ です。", "ねこ の おもちゃ ですか。", "ねこ が おもちゃ です。"] },
  { hintES: "Es la casa del maestro.", correct: "せんせい の いえ です。", distractors: ["せんせい は いえ です。", "せんせい の いえ ですか。", "せんせい が いえ です。"] },
  { hintES: "Es estudiante de universidad.", correct: "だいがく の がくせい です。", distractors: ["だいがく は がくせい です。", "だいがく の がくせい ですか。", "だいがく が がくせい です。"] },
];

// =============== utils ===============
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);
function makeQuestionPool(): QA[] {
  const base = pick(ITEMS_QA, 10);
  return base.map((it) => {
    const opts = shuffle([it.correct, ...pick(it.distractors, 3)]);
    return { hintES: it.hintES, correctJP: it.correct, options: opts };
  });
}

export default function B4_NoModifier() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_NoModifier";
  const ACHIEVEMENT_ID = "no_modifier_posesion";
  const ACHIEVEMENT_TITLE = "Partícula の — posesión/modificador";

  // On enter
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Quiz state
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // Modal logro
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
        void handleFinish();
      }
    }, 650);
  };

  const handleFinish = useCallback(async () => {
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL, total: questions.length, score } });
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
        {/* Cinta */}
        <View style={s.ribbon}>
          <Ionicons name="link" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>N1 の N2 — “de / pertenencia / tipo”</Text>
        <Text style={s.subtitle}>La partícula <Text style={{ fontWeight: "900" }}>の</Text> une dos palabras: <Text style={{ fontWeight: "900" }}>N1 の N2</Text>.</Text>

        {/* Explicación básica */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica (nivel primaria)</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>
              <Text style={s.kbd}>の</Text> funciona como **“de”** en español. Conecta dos nombres:
              <Text> </Text>
              <Text style={s.kbd}>N1 の N2</Text> → “N2 <Text style={{ fontWeight: "800" }}>de</Text> N1”.
            </Text>
            <Text style={s.li}>• <Text style={s.kbd}>わたし の ほん</Text> → “el libro <Text style={{ fontWeight: "800" }}>de</Text> mí” = **mi libro**.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>にほん の くるま</Text> → “auto <Text style={{ fontWeight: "800" }}>de</Text> Japón” = **auto japonés** (clasificación/origen).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>がっこう の ともだち</Text> → **amigo de la escuela** (relación).</Text>
          </View>

          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Cómo se usa</Text>
            <Text style={s.li}>1) Escribe N1 (propietario/origen/tipo).</Text>
            <Text style={s.li}>2) Agrega <Text style={s.kbd}>の</Text>.</Text>
            <Text style={s.li}>3) Escribe N2 (la cosa o persona principal).</Text>
            <Text style={s.li}>4) Si quieres oración, añade <Text style={s.kbd}>です</Text> al final: <Text style={s.kbd}>N1 の N2 です。</Text></Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>Pronunciación (toca el altavoz):</Text>
            <View style={s.rowAudio}>
              <View>
                <Text style={s.exampleJP}>N1 の N2</Text>
                <Text style={s.exampleES}>N2 de N1</Text>
              </View>
              <Pressable style={s.ttsBtnLg} onPress={() => speakJP("の")}>
                <Ionicons name="volume-high" size={20} color="#fff" />
                <Text style={s.ttsBtnLgTxt}>Escuchar「の」</Text>
              </Pressable>
            </View>
          </View>

          <View style={[s.block, s.warnCard]}>
            <Text style={s.warnTitle}>Tips / errores</Text>
            <Text style={s.li}>• Orden correcto: **N1 の N2** (no “N2 の N1” a menos que cambies el sentido).</Text>
            <Text style={s.li}>• <Text style={s.kbd}>の</Text> no significa “ser”: para oración usa <Text style={s.kbd}>です</Text> al final.</Text>
            <Text style={s.li}>• Clasificación: <Text style={s.kbd}>にほん の ほん</Text> = **libro japonés** (de Japón).</Text>
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

        {/* 15 ORACIONES */}
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
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)} accessibilityLabel="Pronunciar oración">
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
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
            <Text style={s.p}>
              Lee la pista en <Text style={{ fontWeight: "900" }}>español</Text> y elige la oración correcta en <Text style={{ fontWeight: "900" }}>japonés</Text> usando
              <Text> </Text><Text style={s.kbd}>N1 の N2</Text>.
            </Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Ejemplo</Text>
              <Text style={s.hintBody}>“Es mi libro.” → <Text style={s.kbd}>わたし の ほん です。</Text></Text>
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
              <Text style={s.promptHelp}>Elige la opción correcta:</Text>
              <Text style={s.prompt}>{current.hintES}</Text>
            </View>

            <View style={s.optionsGrid}>
              {current.options.map((opt, i) => {
                const chosen = selected !== null && selected === opt;
                const isRight = selected !== null && opt === current.correctJP;
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

        {/* Resumen post-juego */}
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

  title: { fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 10, color: INK },
  subtitle: { textAlign: "center", fontSize: 13, color: "#4B5563", marginTop: 4, marginBottom: 12 },

  infoCard: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 10, backgroundColor: CARD },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { marginTop: 6, color: "#374151", lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  block: { marginTop: 8 },
  tipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 10,
    marginTop: 8,
  },
  tipTitle: { fontWeight: "900", color: INK, marginBottom: 4 },

  warnCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
    padding: 10,
    marginTop: 8,
  },
  warnTitle: { fontWeight: "900", color: AMBER, marginBottom: 4 },

  li: { marginTop: 4, color: "#374151", lineHeight: 20 },

  /* Vocab */
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  vocabJP: { fontSize: 18, fontWeight: "900", color: INK },
  vocabES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

  /* Examples */
  examplesList: { marginTop: 8, gap: 10 },
  exampleTile: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  exampleJP: { fontSize: 18, fontWeight: "900", color: INK, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

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
    minWidth: 180,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  /* Game */
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

  promptWrap: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    backgroundColor: "#FFF1F2",
  },
  promptHelp: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  prompt: { fontSize: 18, fontWeight: "900", color: INK, textAlign: "center" },

  optionsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
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

  /* TTS button (sin stop) */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  ttsBtnLg: {
    backgroundColor: INK,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  ttsBtnLgTxt: { color: "#fff", fontWeight: "900" },
  rowAudio: { flexDirection: "row", gap: 10, marginTop: 6 },

  /* Modal */
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
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
  modalTitle: { fontSize: 16, fontWeight: "900", color: TEAL },
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
