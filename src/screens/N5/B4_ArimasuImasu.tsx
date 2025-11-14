// src/screens/N5/B4_ArimasuImasu.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_ArimasuImasu — Existencia: あります (cosas) / います (seres vivos)
 * - Vocabulario (30) con TTS (bocina).
 * - Explicación básica “nivel primaria” con に (lugar) + が (sujeto que existe).
 * - 15 oraciones ejemplo con TTS.
 * - Quiz 10 preguntas (elige la correcta con あります/います + に/が).
 * - Logro: “Hay / Está — あります・います” (+10 XP, idempotente).
 */

type QA = { hintES: string; correctJP: string; options: string[] };

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

/* ======================= VOCABULARIO (30) ======================= */
const VOCAB: { jp: string; es: string }[] = [
  { jp: "あります", es: "hay/está (COSAS, lugares, plantas… inanimado)" },
  { jp: "います", es: "hay/está (SERES VIVOS: personas, animales)" },
  { jp: "に", es: "marca LUGAR donde existe" },
  { jp: "が", es: "marca lo que existe (el sujeto)" },
  { jp: "テーブル", es: "mesa" },
  { jp: "いす", es: "silla" },
  { jp: "ほん", es: "libro" },
  { jp: "コンピューター", es: "computadora" },
  { jp: "でんき", es: "luz/eléctrico (la luz encendida)" },
  { jp: "き", es: "árbol" },
  { jp: "ねこ", es: "gato" },
  { jp: "いぬ", es: "perro" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "がくせい", es: "estudiante" },
  { jp: "こども", es: "niño/a" },
  { jp: "にわ", es: "jardín" },
  { jp: "こうえん", es: "parque" },
  { jp: "きょうしつ", es: "salón de clase" },
  { jp: "へや", es: "habitación" },
  { jp: "いえ", es: "casa" },
  { jp: "つくえ", es: "escritorio" },
  { jp: "かばん", es: "bolsa/mochila" },
  { jp: "ねずみ", es: "ratón" },
  { jp: "とり", es: "pájaro" },
  { jp: "さかな", es: "pez" },
  { jp: "にほん", es: "Japón" },
  { jp: "メキシコ", es: "México" },
  { jp: "がっこう", es: "escuela" },
  { jp: "としょかん", es: "biblioteca" },
  { jp: "いりぐち", es: "entrada" },
];

/* ======================= EXPLICACIÓN NIVEL PRIMARIA ======================= */
/**
 * Forma base: [LUGAR] に [SUJETO] が あります/います。
 * あります → cosas (no viven).  います → seres vivos (personas/animales).
 */

// Demos dentro de la explicación con TTS + traducción visible
const PATTERN_DEMOS: { jp: string; es: string }[] = [
  { jp: "へや に つくえ が あります。", es: "En la habitación hay un escritorio." },
  { jp: "こうえん に こども が います。", es: "En el parque hay niños." },
];

/* ======================= ORACIONES (15) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // COSAS → あります
  { jp: "へや に つくえ が あります。", es: "En la habitación hay un escritorio." },
  { jp: "テーブル の うえ に ほん が あります。", es: "Sobre la mesa hay un libro." },
  { jp: "こうえん に き が あります。", es: "En el parque hay árboles." },
  { jp: "かばん の なか に コンピューター が あります。", es: "En la mochila hay una computadora." },
  { jp: "いえ に でんき が あります。", es: "En la casa hay luz." },

  // SERES VIVOS → います
  { jp: "にわ に ねこ が います。", es: "En el jardín hay un gato." },
  { jp: "いえ に いぬ が います。", es: "En la casa hay un perro." },
  { jp: "きょうしつ に せんせい が います。", es: "En el salón está la maestra." },
  { jp: "こうえん に こども が います。", es: "En el parque hay niños." },
  { jp: "としょかん に がくせい が います。", es: "En la biblioteca hay estudiantes." },

  // Más naturales
  { jp: "メキシコ に にほんじん が います。", es: "En México hay japoneses." },
  { jp: "にほん に さかな が たくさん あります。", es: "En Japón hay muchos peces." },
  { jp: "いりぐち に いぬ が います。", es: "En la entrada hay un perro." },
  { jp: "へや に いす が ２つ あります。", es: "En la habitación hay dos sillas." },
  { jp: "つくえ の した に ねずみ が います。", es: "Debajo del escritorio hay un ratón." },
];

/* ======================= QUIZ (10) ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "En el salón hay una maestra. (ser vivo)", correct: "きょうしつ に せんせい が います。", distractors: ["きょうしつ に せんせい が あります。", "きょうしつ へ せんせい が います。", "きょうしつ で せんせい が います。"] },
  { hintES: "En el parque hay árboles. (cosas)", correct: "こうえん に き が あります。", distractors: ["こうえん に き が います。", "こうえん で き が あります。", "こうえん へ き が あります。"] },
  { hintES: "En la casa hay un perro. (ser vivo)", correct: "いえ に いぬ が います。", distractors: ["いえ に いぬ が あります。", "いえ で いぬ が います。", "いえ へ いぬ が います。"] },
  { hintES: "Sobre la mesa hay un libro. (cosa)", correct: "テーブル の うえ に ほん が あります。", distractors: ["テーブル の うえ に ほん が います。", "テーブル の うえ で ほん が あります。", "テーブル の うえ へ ほん が あります。"] },
  { hintES: "En el jardín hay un gato. (ser vivo)", correct: "にわ に ねこ が います。", distractors: ["にわ に ねこ が あります。", "にわ で ねこ が います。", "にわ へ ねこ が います。"] },
  { hintES: "En la mochila hay una computadora. (cosa)", correct: "かばん の なか に コンピューター が あります。", distractors: ["かばん の なか に コンピューター が います。", "かばん の なか で コンピューター が あります。", "かばん の なか へ コンピューター が あります。"] },
  { hintES: "En la biblioteca hay estudiantes. (seres vivos)", correct: "としょかん に がくせい が います。", distractors: ["としょかん に がくせい が あります。", "としょかん で がくせい が います。", "としょかん へ がくせい が います。"] },
  { hintES: "En la habitación hay dos sillas. (cosas)", correct: "へや に いす が ２つ あります。", distractors: ["へや に いす が ２つ います。", "へや で いす が ２つ あります。", "へや へ いす が ２つ あります。"] },
  { hintES: "Debajo del escritorio hay un ratón. (ser vivo)", correct: "つくえ の した に ねずみ が います。", distractors: ["つくえ の した に ねずみ が あります。", "つくえ の した で ねずみ が います。", "つくえ の した へ ねずみ が います。"] },
  { hintES: "En Japón hay muchos peces. (cosas)", correct: "にほん に さかな が たくさん あります。", distractors: ["にほん に さかな が たくさん います。", "にほん で さかな が たくさん あります。", "にほん へ さかな が たくさん あります。"] },
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

export default function B4_ArimasuImasu() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_ArimasuImasu";
  const ACHIEVEMENT_ID = "exist_arimasu_imasu";
  const ACHIEVEMENT_TITLE = "Hay / Está — あります・います";

  // On Enter (solo tracking)
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
          <Ionicons name="location" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Hay / Está — あります・います</Text>
        <Text style={s.subtitle}>
          <Text style={{ fontWeight: "900" }}>あります</Text> = cosas.{"  "}
          <Text style={{ fontWeight: "900" }}>います</Text> = seres vivos.{" "}
          Patrón: <Text style={{ fontWeight: "900" }}>[LUGAR] に [SUJETO] が あります/います。</Text>
        </Text>

        {/* EXPLICACIÓN (nivel primaria) */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>Piensa así:</Text>
            <Text style={s.li}>• <Text style={s.kbd}>に</Text> = ¿Dónde? (lugar). Marca el sitio donde “existe/alguien está”.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>が</Text> = ¿Qué/Quién? Marca lo que existe.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>あります</Text> → cosas (no viven). <Text style={s.kbd}>います</Text> → seres vivos.</Text>
          </View>

          {/* Demos con audio + traducción visible */}
          <View style={[s.block, s.patternCard]}>
            <Text style={s.pattern}>[LUGAR] に [SUJETO] が あります/います。</Text>
            <View style={s.rowWrap}>
              {PATTERN_DEMOS.map((ex, i) => (
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

        {/* VOCABULARIO (30) */}
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
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)}>
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA / Inicio de actividad */}
        {!started && qIndex === 0 && score === 0 && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="clipboard" size={18} color={INK} />
              <Text style={s.h}>Actividad: 10 preguntas</Text>
            </View>
            <Text style={s.p}>
              Elige la oración correcta. Recuerda: <Text style={s.kbd}>あります</Text> (cosas),
              <Text style={s.kbd}> います</Text> (seres vivos). Patrón <Text style={s.kbd}>LUGAR に SUJETO が …</Text>
            </Text>

            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Mini recordatorio</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>にわ に ねこ が います。</Text> (ser vivo)</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>へや に いす が あります。</Text> (cosa)</Text>
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

        {/* Resumen */}
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
  patternCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 10,
    marginTop: 8,
  },
  pattern: { fontWeight: "900", color: INK, textAlign: "center" },

  li: { marginTop: 4, color: "#374151", lineHeight: 20 },

  /* DEMOS en explicación */
  rowWrap: { marginTop: 10, gap: 10 },
  demoTile: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
  },
  demoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  demoJP: { fontSize: 16, fontWeight: "900", color: INK, flex: 1, paddingRight: 8 },
  demoES: { marginTop: 4, color: "#6B7280", fontSize: 12 },

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
    minWidth: 220,
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
