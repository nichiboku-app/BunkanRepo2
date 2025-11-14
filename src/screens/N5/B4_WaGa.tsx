// src/screens/N5/B4_WaGa.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_WaGa — は vs が (tópico vs. sujeto / contraste)
 * - Explicación “primaria” súper clara en español.
 * - Vocabulario (30) con TTS (botón bocina; sin botón stop).
 * - 15 oraciones de ejemplo con TTS.
 * - Actividad: 10 preguntas (elige la opción correcta con は o が).
 * - Logro: “は vs が — tópico/sujeto” con +10 XP (idempotente).
 */

type QA = {
  hintES: string;     // pista en español
  correctJP: string;  // opción correcta (con は/が)
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

function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

/* ======================= VOCABULARIO (30) ======================= */
const VOCAB: { jp: string; es: string }[] = [
  { jp: "は", es: "partícula de TÓPICO (tema/contraste)" },
  { jp: "が", es: "partícula de SUJETO (identifica/nuevo)" },
  { jp: "わたし", es: "yo" },
  { jp: "あなた", es: "tú" },
  { jp: "たなかさん", es: "Sr./Sra. Tanaka" },
  { jp: "がくせい", es: "estudiante" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "いしゃ", es: "doctor/a" },
  { jp: "にほんじん", es: "japonés/a (nacionalidad)" },
  { jp: "ともだち", es: "amigo/a" },
  { jp: "ねこ", es: "gato" },
  { jp: "いぬ", es: "perro" },
  { jp: "ごはん", es: "comida/arroz" },
  { jp: "おいしい", es: "delicioso/a" },
  { jp: "たかい", es: "caro/a; alto" },
  { jp: "あたらしい", es: "nuevo/a" },
  { jp: "きれい", es: "bonito/limpio" },
  { jp: "だれ", es: "quién" },
  { jp: "なに", es: "qué" },
  { jp: "どこ", es: "dónde" },
  { jp: "これ", es: "esto" },
  { jp: "それ", es: "eso" },
  { jp: "あれ", es: "aquello" },
  { jp: "ほん", es: "libro" },
  { jp: "でんわ", es: "teléfono" },
  { jp: "パソコン", es: "computadora" },
  { jp: "テーブル", es: "mesa" },
  { jp: "きょう", es: "hoy" },
  { jp: "にほんご", es: "japonés (idioma)" },
  { jp: "むずかしい", es: "difícil" },
];

/* ======================= EJEMPLOS (15) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // Tópico neutro
  { jp: "わたし は がくせい です。", es: "Yo (en cuanto a mí), soy estudiante." },
  { jp: "たなかさん は せんせい です。", es: "El Sr./Sra. Tanaka (sobre él/ella) es maestro/a." },
  { jp: "にほんご は むずかしい です。", es: "El japonés (tema) es difícil." },
  { jp: "ごはん は おいしい です。", es: "La comida (tema) es rica." },

  // Identificación / nuevo dato con が
  { jp: "だれ が せんせい ですか？", es: "¿Quién es el maestro/la maestra?" },
  { jp: "たなかさん が せんせい です。", es: "El que es maestro/a es Tanaka. (identificación)" },
  { jp: "なに が いい ですか？", es: "¿Qué es bueno/qué prefieres?" },
  { jp: "これ が いい です。", es: "Este es el bueno/este prefiero. (enfatiza el sujeto)" },

  // Contraste con は
  { jp: "にく は すき です。", es: "La carne me gusta (como tema)." },
  { jp: "さかな は すき じゃありません。", es: "El pescado no me gusta (contraste)." },
  { jp: "きょう は ひま です。", es: "Hoy (tema) estoy libre." },
  { jp: "あした は ひま じゃありません。", es: "Mañana (tema) no estoy libre." },

  // Localización/énfasis de sujeto
  { jp: "どこ が いちばん すき ですか？", es: "¿Qué lugar te gusta más? (qué lugar = sujeto)" },
  { jp: "ここ が いちばん すき です。", es: "Este lugar es el que más me gusta. (énfasis sujeto)" },
  { jp: "ねこ が います。", es: "Hay un gato. (aparece/“nuevo” → が)" },
];

/* ======================= PREGUNTAS (10) ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  // Tema vs identificación
  {
    hintES: "“Yo soy estudiante” (tema simple).",
    correct: "わたし は がくせい です。",
    distractors: ["わたし が がくせい です。", "わたし は がくせい ですか？", "わたし が がくせい ですか？"],
  },
  {
    hintES: "“¿Quién es el maestro?” (pregunta de identificación).",
    correct: "だれ が せんせい ですか？",
    distractors: ["だれ は せんせい ですか？", "だれ が せんせい です。", "だれ は せんせい です。"],
  },
  {
    hintES: "“El maestro es Tanaka” (el que lo es = Tanaka).",
    correct: "たなかさん が せんせい です。",
    distractors: ["たなかさん は せんせい です。", "たなかさん は せんせい ですか？", "だれ が せんせい です。"],
  },
  {
    hintES: "“El japonés es difícil” (como tema general).",
    correct: "にほんご は むずかしい です。",
    distractors: ["にほんご が むずかしい です。", "にほんご は むずかしい ですか？", "にほんご が むずかしい ですか？"],
  },
  {
    hintES: "“¿Qué es bueno/qué prefieres?” (qué = sujeto).",
    correct: "なに が いい ですか？",
    distractors: ["なに は いい ですか？", "なに が いい です。", "なに は いい です。"],
  },
  {
    hintES: "“Este es el bueno (el que es bueno es este)” (énfasis en sujeto).",
    correct: "これ が いい です。",
    distractors: ["これ は いい です。", "これ が いい ですか？", "それ が いい です。"],
  },
  {
    hintES: "“La carne me gusta (como tema)” (contraste con otros).",
    correct: "にく は すき です。",
    distractors: ["にく が すき です。", "にく は すき ですか？", "にく が すき ですか？"],
  },
  {
    hintES: "“¿Dónde está? (qué lugar = sujeto)”",
    correct: "どこ が いい ですか？",
    distractors: ["どこ は いい ですか？", "どこ が いい です。", "どこ は いい です。"],
  },
  {
    hintES: "“Hay un gato” (aparece algo nuevo → sujeto con が).",
    correct: "ねこ が います。",
    distractors: ["ねこ は います。", "ねこ が いますか？", "ねこ は いますか？"],
  },
  {
    hintES: "“Hoy estoy libre” (tema: hoy).",
    correct: "きょう は ひま です。",
    distractors: ["きょう が ひま です。", "きょう は ひま ですか？", "きょう が ひま ですか？"],
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

export default function B4_WaGa() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_WaGa";
  const ACHIEVEMENT_ID = "wa_ga_topic_subject";
  const ACHIEVEMENT_TITLE = "は vs が — tópico/sujeto";

  // On enter (solo tracking)
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
          <Ionicons name="contrast" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>は vs が — tópico y sujeto</Text>
        <Text style={s.subtitle}>Usa <Text style={{ fontWeight: "900" }}>は</Text> para el <Text style={{ fontWeight: "900" }}>tema</Text> y <Text style={{ fontWeight: "900" }}>が</Text> para <Text style={{ fontWeight: "900" }}>identificar o presentar</Text>.</Text>

        {/* EXPLICACIÓN BÁSICA */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica (como primaria)</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>
              <Text style={s.kbd}>は</Text> marca de qué <Text style={{ fontWeight: "800" }}>estamos hablando</Text> (tema). Es como decir “en cuanto a…”.
            </Text>
            <Text style={s.li}>
              <Text style={s.kbd}>にほんご は むずかしい です。</Text> → “En cuanto al japonés, es difícil.”
            </Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>
              <Text style={s.kbd}>が</Text> marca <Text style={{ fontWeight: "800" }}>quién/qué</Text> hace o es algo (sujeto), especialmente cuando <Text style={{ fontWeight: "800" }}>lo identificas</Text> o aparece como <Text style={{ fontWeight: "800" }}>información nueva</Text>.
            </Text>
            <Text style={s.li}>
              <Text style={s.kbd}>だれ が せんせい ですか？</Text> → “¿Quién es el maestro?”
            </Text>
            <Text style={s.li}>
              <Text style={s.kbd}>たなかさん が せんせい です。</Text> → “(El que) es maestro es Tanaka.”
            </Text>
          </View>

          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Regla rápida</Text>
            <Text style={s.li}>• Tema general o contraste → <Text style={s.kbd}>は</Text>.</Text>
            <Text style={s.li}>• Identificar al “quién/qué” (respuesta a ¿quién?, ¿qué?, “aparece”) → <Text style={s.kbd}>が</Text>.</Text>
          </View>

          <View style={[s.block, s.warnCard]}>
            <Text style={s.warnTitle}>Errores comunes</Text>
            <Text style={s.li}>• Poner <Text style={s.kbd}>が</Text> en frases de tema simple (ej.: “Yo soy…” normalmente usa <Text style={s.kbd}>は</Text>).</Text>
            <Text style={s.li}>• Olvidar que <Text style={s.kbd}>が</Text> responde a “¿quién/qué?” con énfasis en el sujeto.</Text>
            <Text style={s.li}>• En contraste (“yo sí/él no”), usa <Text style={s.kbd}>は</Text>.</Text>
          </View>

          {/* Audio botones básicos */}
          <View style={s.pronounceRow}>
            <View style={s.pronounceItem}>
              <Text style={s.pronounceJP}>は（わ）</Text>
              <Text style={s.pronounceRoma}>wa (partícula)</Text>
            </View>
            <Pressable style={s.ttsBtnLg} onPress={() => speakJP("は")}>
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={s.ttsBtnLgTxt}>Escuchar</Text>
            </Pressable>
          </View>
          <View style={[s.pronounceRow, { marginTop: 8 }]}>
            <View style={s.pronounceItem}>
              <Text style={s.pronounceJP}>が</Text>
              <Text style={s.pronounceRoma}>ga (partícula)</Text>
            </View>
            <Pressable style={s.ttsBtnLg} onPress={() => speakJP("が")}>
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={s.ttsBtnLgTxt}>Escuchar</Text>
            </Pressable>
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

        {/* 15 ORACIONES (con TTS) */}
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

        {/* CTA / Inicio de Actividad */}
        {!started && qIndex === 0 && score === 0 && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="clipboard" size={18} color={INK} />
              <Text style={s.h}>Actividad: 10 preguntas</Text>
            </View>
            <Text style={s.p}>
              Lee la pista y elige la oración correcta con <Text style={s.kbd}>は</Text> o <Text style={s.kbd}>が</Text>.
            </Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Ejemplos rápidos</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>だれ が せんせい ですか？</Text> → identificación (usa が)</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>にほんご は むずかしい です。</Text> → tema/contraste (usa は)</Text>
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

  /* TTS */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
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
