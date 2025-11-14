// src/screens/N5/B4_PregKa.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_PregKa — A は B ですか？
 * - Pregunta con か: convierte la afirmación en pregunta cortés.
 * - Vocabulario (30) con TTS → 15 oraciones con TTS.
 * - Actividad: 10 preguntas “Convierte la oración en pregunta”.
 * - Logro: “DESU pregunta (か)” con 10 XP (solo primera vez).
 */

type QA = {
  baseAffirm: string; // Afirmación base (JP)
  correctQ: string;   // Pregunta correcta (JP)
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

// =============== VOCABULARIO (30) ===============
const VOCAB: { jp: string; es: string }[] = [
  { jp: "これ", es: "esto" },
  { jp: "それ", es: "eso" },
  { jp: "あれ", es: "aquello" },
  { jp: "この", es: "este/esta (det.)" },
  { jp: "その", es: "ese/esa (det.)" },
  { jp: "あの", es: "aquel/aquella (det.)" },
  { jp: "ひと", es: "persona" },
  { jp: "こちら", es: "esta persona (formal)" },
  { jp: "たなかさん", es: "Sr./Sra. Tanaka" },
  { jp: "さくら", es: "Sakura (nombre)" },
  { jp: "はな", es: "Hana (nombre)" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "いしゃ", es: "doctor/a" },
  { jp: "がくせい", es: "estudiante" },
  { jp: "にほんじん", es: "japonés/a (nacionalidad)" },
  { jp: "エンジニア", es: "ingeniero/a" },
  { jp: "ラーメン", es: "ramen" },
  { jp: "おいしい", es: "delicioso/a" },
  { jp: "あたらしい", es: "nuevo/a" },
  { jp: "たかい", es: "caro/a; alto" },
  { jp: "きれい", es: "bonito/limpio" },
  { jp: "ほん", es: "libro" },
  { jp: "でんわ", es: "teléfono" },
  { jp: "いす", es: "silla" },
  { jp: "テーブル", es: "mesa" },
  { jp: "パソコン", es: "computadora" },
  { jp: "はい", es: "sí" },
  { jp: "いいえ", es: "no" },
  { jp: "ですか", es: "¿es? (partícula か)" },
  { jp: "か", es: "partícula de pregunta" },
];

// =============== EJEMPLOS (15) ===============
const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "これは えんぴつ ですか？", es: "¿Esto es un lápiz?" },
  { jp: "それは いす ですか？", es: "¿Eso es una silla?" },
  { jp: "あれは でんわ ですか？", es: "¿Aquello es un teléfono?" },
  { jp: "あなたは がくせい ですか？", es: "¿Eres estudiante?" },
  { jp: "たなかさんは せんせい ですか？", es: "¿El Sr. Tanaka es maestro?" },
  { jp: "さくらは にほんじん ですか？", es: "¿Sakura es japonesa?" },
  { jp: "ねこは ペット ですか？", es: "¿El gato es una mascota?" },
  { jp: "この ほんは たかい ですか？", es: "¿Este libro es caro?" },
  { jp: "あの ひとは いしゃ ですか？", es: "¿Aquella persona es doctora?" },
  { jp: "ラーメンは おいしい ですか？", es: "¿El ramen es delicioso?" },
  { jp: "テーブルは あたらしい ですか？", es: "¿La mesa es nueva?" },
  { jp: "こちらは がくせい ですか？", es: "¿Esta persona es estudiante?" },
  { jp: "パソコンは たかい ですか？", es: "¿La computadora es cara?" },
  { jp: "はなは きれい ですか？", es: "¿Hana es bonita?" },
  { jp: "これは ほん ですか？", es: "¿Esto es un libro?" },
];

// =============== POOL PARA ACTIVIDAD (A→Q) ===============
const ITEMS_AFFIRM: { A: string; B: string }[] = [
  { A: "これ", B: "ほん" },
  { A: "それ", B: "でんわ" },
  { A: "あれ", B: "いす" },
  { A: "わたし", B: "がくせい" },
  { A: "たなかさん", B: "せんせい" },
  { A: "さくら", B: "にほんじん" },
  { A: "ねこ", B: "ペット" },
  { A: "この ほん", B: "たかい" },
  { A: "あの ひと", B: "いしゃ" },
  { A: "ラーメン", B: "おいしい" },
  { A: "テーブル", B: "あたらしい" },
  { A: "こちら", B: "がくせい" },
  { A: "パソコン", B: "たかい" },
  { A: "はな", B: "きれい" },
  { A: "これ", B: "えんぴつ" },
];

// =============== utils / helpers ===============
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

const jpAffirm = (a: string, b: string) => `${a} は ${b} です`;
const jpQuestion = (a: string, b: string) => `${a} は ${b} ですか？`;

// Genera 10 preguntas: se muestra la AFIRMACIÓN y deben escoger la PREGUNTA correcta
function makeQuestionPool(): QA[] {
  const base = pick(ITEMS_AFFIRM, 10);
  return base.map((it) => {
    const affirm = jpAffirm(it.A, it.B);
    const correct = jpQuestion(it.A, it.B);
    const d1 = `${it.A} が ${it.B} ですか？`;   // partícula mal
    const d2 = `${it.A} は ${it.B} です。`;     // sigue afirmación (con punto)
    const d3 = `${it.A} は ${it.B} じゃありませんか？`; // negativo en pregunta (trampa)
    const options = shuffle([correct, d1, d2, d3]);
    return { baseAffirm: affirm, correctQ: correct, options };
  });
}

// =============== TTS helpers ===============
function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

export default function B4_PregKa() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_PregKa";
  const ACHIEVEMENT_ID = "desu_pregunta_ka";
  const ACHIEVEMENT_TITLE = "DESU pregunta (か)";

  // On enter (sin XP, registra progreso)
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Quiz state
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // Modal recompensa
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
    const ok = value === current.correctQ;
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
          <Ionicons name="help-circle" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>A は B ですか？</Text>
        <Text style={s.subtitle}>Convierte la oración en <Text style={{ fontWeight: "900" }}>pregunta</Text> con <Text style={{ fontWeight: "900" }}>か</Text>.</Text>

        {/* Explicación básica (enriquecida) */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica</Text>
          </View>

          {/* Qué hace KA */}
          <View style={s.block}>
            <Text style={s.p}>
              <Text style={s.kbd}>か</Text> es la <Text style={{ fontWeight: "900" }}>partícula de pregunta</Text>. Va <Text style={{ fontWeight: "900" }}>al final</Text> de la frase:
              <Text> </Text>
              <Text style={s.kbd}>A は B ですか？</Text> = <Text style={{ fontWeight: "900" }}>“¿A es B?”</Text>
            </Text>
          </View>

          {/* Cómo formarla */}
          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Cómo formarla (paso a paso)</Text>
            <Text style={s.li}>1) Empieza con la afirmación: <Text style={s.kbd}>A は B です</Text> (A es B).</Text>
            <Text style={s.li}>2) No cambies partículas ni orden.</Text>
            <Text style={s.li}>3) Agrega <Text style={s.kbd}>か</Text> al final → <Text style={s.kbd}>A は B ですか？</Text></Text>
          </View>

          {/* Traducción al español */}
          <View style={s.block}>
            <Text style={s.p}>En español se traduce normalmente con <Text style={{ fontWeight: "900" }}>“ser”</Text>:</Text>
            <Text style={s.li}>• <Text style={s.kbd}>これは ほん ですか？</Text> → ¿Esto es un libro?</Text>
            <Text style={s.li}>• <Text style={s.kbd}>たなかさんは せんせい ですか？</Text> → ¿El Sr. Tanaka es maestro?</Text>
            <Text style={s.li}>• <Text style={s.kbd}>ラーメンは おいしい ですか？</Text> → ¿El ramen es delicioso?</Text>
          </View>

          {/* Respuestas cortas */}
          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Respuestas cortas</Text>
            <Text style={s.li}><Text style={s.kbd}>はい、そうです。</Text> → “Sí, así es.”</Text>
            <Text style={s.li}><Text style={s.kbd}>いいえ、ちがいます。</Text> → “No, no es así.”</Text>
          </View>

          {/* Palabras interrogativas */}
          <View style={s.block}>
            <Text style={s.p}>Con palabras interrogativas, <Text style={s.kbd}>か</Text> sigue al final:</Text>
            <Text style={s.li}>• <Text style={s.kbd}>これは なん ですか？</Text> → ¿Qué es esto?</Text>
            <Text style={s.li}>• <Text style={s.kbd}>トイレは どこ ですか？</Text> → ¿Dónde está el baño?</Text>
            <Text style={s.li}>• <Text style={s.kbd}>だれ ですか？</Text> → ¿Quién es?</Text>
          </View>

          {/* Errores comunes */}
          <View style={[s.block, s.warnCard]}>
            <Text style={s.warnTitle}>Errores comunes</Text>
            <Text style={s.li}>• Poner <Text style={s.kbd}>か</Text> en medio: ❌ <Text style={s.kbd}>A は か B です</Text> → Debe ir al final.</Text>
            <Text style={s.li}>• Cambiar <Text style={s.kbd}>は</Text> por <Text style={s.kbd}>が</Text> sin motivo.</Text>
            <Text style={s.li}>• Olvidar <Text style={s.kbd}>です</Text> antes de <Text style={s.kbd}>か</Text>.</Text>
          </View>

          {/* Audio ですか */}
          <View style={s.pronounceRow}>
            <View style={s.pronounceItem}>
              <Text style={s.pronounceJP}>ですか</Text>
              <Text style={s.pronounceRoma}>desu ka</Text>
            </View>
            <Pressable style={s.ttsBtnLg} onPress={() => speakJP("ですか")} accessibilityLabel="Pronunciar ですか">
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={s.ttsBtnLgTxt}>Escuchar</Text>
            </Pressable>
          </View>

          {/* 10 conversiones rápidas */}
          <View style={[s.block, s.examplesCard]}>
            <Text style={s.examplesTitle}>10 conversiones rápidas</Text>
            <Text style={s.li}>
              <Text style={{ fontWeight: "800" }}>1)</Text> <Text style={s.kbd}>これは えんぴつ です</Text> → <Text style={s.kbd}>これは えんぴつ ですか？</Text> → ¿Esto es un lápiz?
            </Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>2)</Text> それは いす です → それは いす ですか？ → ¿Eso es una silla?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>3)</Text> あれは でんわ です → あれは でんわ ですか？ → ¿Aquello es un teléfono?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>4)</Text> たなかさんは せんせい です → …ですか？ → ¿El Sr. Tanaka es maestro?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>5)</Text> さくらは にほんじん です → …ですか？ → ¿Sakura es japonesa?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>6)</Text> ねこは ペット です → …ですか？ → ¿El gato es una mascota?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>7)</Text> この ほんは たかい です → …ですか？ → ¿Este libro es caro?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>8)</Text> あの ひとは いしゃ です → …ですか？ → ¿Aquella persona es doctora?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>9)</Text> ラーメンは おいしい です → …ですか？ → ¿El ramen es delicioso?</Text>
            <Text style={s.li}><Text style={{ fontWeight: "800" }}>10)</Text> パソコンは たかい です → …ですか？ → ¿La computadora es cara?</Text>
          </View>
        </View>

        {/* VOCABULARIO (primero) */}
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
              Convierte la frase en <Text style={{ fontWeight: "900" }}>pregunta</Text> agregando <Text style={s.kbd}>か</Text>.
            </Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Ejemplo</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>これは ほん です</Text> → <Text style={s.kbd}>これは ほん ですか？</Text></Text>
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
              <Text style={s.promptHelp}>Convierte a pregunta:</Text>
              <Text style={s.promptJP}>{current.baseAffirm}</Text>
              <Pressable style={[s.ttsBtn, { alignSelf: "center", marginTop: 8 }]} onPress={() => speakJP(current.baseAffirm)}>
                <Ionicons name="volume-high" size={18} color="#fff" />
              </Pressable>
            </View>

            <View style={s.optionsGrid}>
              {current.options.map((opt, i) => {
                const chosen = selected !== null && selected === opt;
                const isRight = selected !== null && opt === current.correctQ;
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

  title: { fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 10, color: INK },
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

  examplesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    padding: 10,
    marginTop: 8,
  },
  examplesTitle: { fontWeight: "900", color: INK, marginBottom: 4 },

  li: { marginTop: 4, color: "#374151", lineHeight: 20 },

  pronounceRow: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pronounceItem: { flexDirection: "column" },
  pronounceJP: { fontSize: 18, fontWeight: "900", color: INK },
  pronounceRoma: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  ttsBtnLg: {
    backgroundColor: INK,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ttsBtnLgTxt: { color: "#fff", fontWeight: "900" },

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
    borderColor: "#EDE9FE",
    backgroundColor: "#FAF5FF",
  },
  promptHelp: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  promptJP: { fontSize: 18, fontWeight: "900", color: INK, textAlign: "center" },

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

  /* TTS button */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },

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
