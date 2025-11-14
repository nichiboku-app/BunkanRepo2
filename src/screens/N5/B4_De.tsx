// src/screens/N5/B4_De.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto (tu hook)
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_De — Partícula で (lugar de la acción / medio, con qué)
 * - Explicación clara nivel primaria.
 * - Vocabulario (30) con TTS.
 * - 15 oraciones de ejemplo con TTS.
 * - Quiz de 10 preguntas (elige la frase correcta con で vs に / で (medio)).
 * - Logro: “Partícula で — lugar/medio” +10 XP (idempotente).
 */

type QA = { hintES: string; correctJP: string; options: string[] };

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
  { jp: "で", es: "partícula: lugar donde ocurre la acción / medio (con qué)" },
  { jp: "に", es: "partícula: destino/llegada; tiempo puntual (¡no lugar de acción!)" },
  { jp: "がっこう", es: "escuela" },
  { jp: "いえ", es: "casa" },
  { jp: "だいがく", es: "universidad" },
  { jp: "としょかん", es: "biblioteca" },
  { jp: "こうえん", es: "parque" },
  { jp: "レストラン", es: "restaurante" },
  { jp: "スーパー", es: "supermercado" },
  { jp: "かいしゃ", es: "empresa" },
  { jp: "えき", es: "estación" },
  { jp: "カフェ", es: "café" },
  { jp: "きょうしつ", es: "salón de clase" },
  { jp: "うち", es: "casa (coloquial)" },
  { jp: "ともだち", es: "amigo/a" },
  { jp: "ひとりで", es: "solo/a (como medio/manera)" },
  { jp: "みんなで", es: "todos juntos (como medio/manera)" },
  { jp: "バスで", es: "en autobús" },
  { jp: "くるまで", es: "en coche" },
  { jp: "でんしゃで", es: "en tren" },
  { jp: "にほんごで", es: "en japonés (medio/idioma)" },
  { jp: "えいごで", es: "en inglés" },
  { jp: "はしで", es: "con palillos" },
  { jp: "スプーンで", es: "con cuchara" },
  { jp: "ペンで", es: "con bolígrafo" },
  { jp: "スマホで", es: "con/por smartphone" },
  { jp: "べんきょうします", es: "estudiar" },
  { jp: "たべます", es: "comer" },
  { jp: "はなします", es: "hablar" },
  { jp: "あそびます", es: "jugar" },
];

/* ======================= ORACIONES (15) ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // Lugar donde ocurre la acción
  { jp: "がっこう で べんきょうします。", es: "Estudio en la escuela. (lugar de la acción)" },
  { jp: "としょかん で ほん を よみます。", es: "Leo libros en la biblioteca." },
  { jp: "こうえん で あそびます。", es: "Juego en el parque." },
  { jp: "レストラン で たべます。", es: "Como en el restaurante." },
  { jp: "うち で えいが を みます。", es: "Veo una película en casa." },
  { jp: "きょうしつ で せんせい と はなします。", es: "Hablo con la maestra en el salón." },
  { jp: "かいしゃ で はたらきます。", es: "Trabajo en la empresa." },

  // Medio / con qué / en qué
  { jp: "バス で いきます。", es: "Voy en autobús. (medio)" },
  { jp: "くるま で きます。", es: "Viene en coche. (medio)" },
  { jp: "でんしゃ で かえります。", es: "Regreso en tren. (medio)" },
  { jp: "にほんご で はなします。", es: "Hablo en japonés. (idioma como medio)" },
  { jp: "えいご で かきます。", es: "Escribo en inglés. (idioma/medio)" },
  { jp: "はし で たべます。", es: "Como con palillos. (herramienta)" },
  { jp: "スプーン で たべます。", es: "Como con cuchara. (herramienta)" },
  { jp: "ペン で かきます。", es: "Escribo con pluma/bolígrafo. (herramienta)" },
];

/* ======================= QUIZ (10) ======================= */
// Regla didáctica: “lugar de la acción” → で (no に),
// “medio” (transporte/idioma/herramienta) → で.
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "Estudio en la escuela. (lugar de acción)", correct: "がっこう で べんきょうします。", distractors: ["がっこう に べんきょうします。", "がっこう を べんきょうします。", "がっこう へ べんきょうします。"] },
  { hintES: "Como en el restaurante. (lugar de acción)", correct: "レストラン で たべます。", distractors: ["レストラン に たべます。", "レストラン を たべます。", "レストラン へ たべます。"] },
  { hintES: "Juego en el parque. (lugar de acción)", correct: "こうえん で あそびます。", distractors: ["こうえん に あそびます。", "こうえん を あそびます。", "こうえん へ あそびます。"] },
  { hintES: "Veo películas en casa. (lugar de acción)", correct: "うち で えいが を みます。", distractors: ["うち に えいが を みます。", "うち を えいが を みます。", "うち へ えいが を みます。"] },
  { hintES: "Hablo en japonés. (medio/idioma)", correct: "にほんご で はなします。", distractors: ["にほんご に はなします。", "にほんご を はなします。", "にほんご へ はなします。"] },
  { hintES: "Escribo con bolígrafo. (herramienta)", correct: "ペン で かきます。", distractors: ["ペン に かきます。", "ペン を かきます。", "ペン へ かきます。"] },
  { hintES: "Regreso en tren. (medio/transporte)", correct: "でんしゃ で かえります。", distractors: ["でんしゃ に かえります。", "でんしゃ を かえります。", "でんしゃ へ かえります。"] },
  { hintES: "Hablo con la maestra en el salón. (lugar de acción)", correct: "きょうしつ で せんせい と はなします。", distractors: ["きょうしつ に せんせい と はなします。", "きょうしつ を せんせい と はなします。", "きょうしつ へ せんせい と はなします。"] },
  { hintES: "Voy en autobús. (medio/transporte)", correct: "バス で いきます。", distractors: ["バス に いきます。", "バス を いきます。", "バス へ いきます。"] },
  { hintES: "Escribo en inglés. (medio/idioma)", correct: "えいご で かきます。", distractors: ["えいご に かきます。", "えいご を かきます。", "えいご へ かきます。"] },
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

export default function B4_De() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_De";
  const ACHIEVEMENT_ID = "particle_de_place_means";
  const ACHIEVEMENT_TITLE = "Partícula で — lugar/medio";

  // On Enter (solo tracking; sin XP de entrada)
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Feedback auditivo
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
          <Ionicons name="school" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Partícula で — lugar de acción y “medio”</Text>
        <Text style={s.subtitle}>
          <Text style={{ fontWeight: "900" }}>で</Text> dice **dónde** pasa la acción y **con qué** la haces (transporte, idioma, herramienta).
        </Text>

        {/* EXPLICACIÓN — nivel primaria */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>Piensa así:</Text>
            <Text style={s.li}>• <Text style={s.kbd}>で</Text> = “<Text style={{ fontWeight: "900" }}>en</Text>” + acción. Ej.: <Text style={s.kbd}>がっこう <Text>で</Text> べんきょうします。</Text> → “Estudio <Text style={{ fontWeight: "900" }}>en</Text> la escuela”.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>で</Text> = “<Text style={{ fontWeight: "900" }}>con / en (medio)</Text>”. Ej.: <Text style={s.kbd}>バス <Text>で</Text> いきます。</Text> → “Voy <Text style={{ fontWeight: "900" }}>en</Text> autobús”.</Text>
          </View>

          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Regla rápida</Text>
            <Text style={s.li}>• Si la palabra es un LUGAR donde sucede la acción → usa <Text style={s.kbd}>で</Text>.</Text>
            <Text style={s.li}>• Si la palabra es un MEDIO (transporte/idioma/herramienta) → usa <Text style={s.kbd}>で</Text>.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>に</Text> NO es lugar de acción; <Text style={s.kbd}>に</Text> marca destino/llegada o tiempo.</Text>
          </View>
        </View>

        {/* VOCABULARIO (30) con TTS */}
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

        {/* 15 ORACIONES con TTS */}
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
            <Text style={s.p}>Elige la frase correcta con <Text style={s.kbd}>で</Text> cuando se trate de lugar de acción o medio.</Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Recuerda</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>こうえん で あそびます。</Text> (en el parque)</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>バス で いきます。</Text> (en autobús)</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>に</Text> es destino/tiempo, no lugar de acción.</Text>
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
  tipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 10,
    marginTop: 8,
  },
  tipTitle: { fontWeight: "900", color: INK, marginBottom: 4 },

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
    minWidth: 200,
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
