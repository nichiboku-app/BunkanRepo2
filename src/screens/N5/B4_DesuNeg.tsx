// src/screens/N5/B4_DesuNeg.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos de acierto/error
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_DesuNeg — A は B じゃありません
 * - Negación cortés del copulativo です: “A no es B”.
 * - Vocabulario (30) con TTS → luego 15 oraciones con TTS.
 * - Actividad de 10 preguntas.
 * - Logro: “DESU negativo” (10 XP la primera vez).
 */

type QA = {
  jp: string;        // correcta (jp)
  es: string;        // enunciado ES
  options: string[]; // 4 opciones (una correcta)
};

const PAPER = "#F7F7FB";
const INK = "#0F172A";
const TEAL = "#0D9488";
const INDIGO = "#4338CA";
const ROSE = "#BE185D";
const ORANGE = "#C2410C";
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
  { jp: "あのひと", es: "aquella persona" },
  { jp: "こちら", es: "esta persona (formal)" },
  { jp: "えんぴつ", es: "lápiz" },
  { jp: "いす", es: "silla" },
  { jp: "でんわ", es: "teléfono" },
  { jp: "ほん", es: "libro" },
  { jp: "ねこ", es: "gato" },
  { jp: "いぬ", es: "perro" },
  { jp: "ねずみ", es: "ratón" },
  { jp: "テーブル", es: "mesa" },
  { jp: "テレビ", es: "televisión" },
  { jp: "かばん", es: "bolso/mochila" },
  { jp: "つくえ", es: "pupitre/escritorio" },
  { jp: "とけい", es: "reloj" },
  { jp: "くるま", es: "auto/coche" },
  { jp: "じしょ", es: "diccionario" },
  { jp: "かさ", es: "paraguas" },
  { jp: "シャツ", es: "camisa" },
  { jp: "がっこう", es: "escuela" },
  { jp: "かいしゃ", es: "empresa" },
  { jp: "エンジニア", es: "ingeniero/a" },
  { jp: "せんせい", es: "maestro/a" },
  { jp: "がくせい", es: "estudiante" },
];

// =============== POOL DE DATOS PARA PREGUNTAS ===============
const ITEMS: { A: string; B: string; esNeg: string }[] = [
  { A: "これ", B: "ほん", esNeg: "Esto no es un libro." },
  { A: "それ", B: "でんわ", esNeg: "Eso no es un teléfono." },
  { A: "あれ", B: "いす", esNeg: "Aquello no es una silla." },
  { A: "ねこ", B: "ペット", esNeg: "El gato no es una mascota." },
  { A: "いぬ", B: "ペット", esNeg: "El perro no es una mascota." },
  { A: "テーブル", B: "あたらしい", esNeg: "La mesa no es nueva." },
  { A: "ラーメン", B: "おいしい", esNeg: "El ramen no es delicioso." },
  { A: "この ほん", B: "たかい", esNeg: "Este libro no es caro." },
  { A: "あの ひと", B: "せんせい", esNeg: "Aquella persona no es maestra." },
  { A: "こちら", B: "がくせい", esNeg: "Esta persona no es estudiante." },
  { A: "パソコン", B: "たかい", esNeg: "La computadora no es cara." },
  { A: "ねずみ", B: "ペット", esNeg: "El ratón no es una mascota." },
  { A: "くるま", B: "あたらしい", esNeg: "El coche no es nuevo." },
  { A: "かばん", B: "たかい", esNeg: "La mochila no es cara." },
  { A: "とけい", B: "たかい", esNeg: "El reloj no es caro." },
  { A: "たなかさん", B: "せんせい", esNeg: "El Sr. Tanaka no es maestro." },
  { A: "マリオ", B: "エンジニア", esNeg: "Mario no es ingeniero." },
  { A: "さくら", B: "にほんじん", esNeg: "Sakura no es japonesa." },
];

// =============== EJEMPLOS (15) ===============
const EXAMPLES_15: { jp: string; es: string }[] = [
  { jp: "これ は ほん じゃありません。", es: "Esto no es un libro." },
  { jp: "それ は でんわ じゃありません。", es: "Eso no es un teléfono." },
  { jp: "あれ は いす じゃありません。", es: "Aquello no es una silla." },
  { jp: "わたし は がくせい じゃありません。", es: "Yo no soy estudiante." },
  { jp: "たなかさん は せんせい じゃありません。", es: "El Sr. Tanaka no es maestro." },
  { jp: "さくら は にほんじん じゃありません。", es: "Sakura no es japonesa." },
  { jp: "ねこ は ペット じゃありません。", es: "El gato no es una mascota." },
  { jp: "この ほん は たかく じゃありません。", es: "Este libro no es caro." }, // simplificado para primaria
  { jp: "あの ひと は いしゃ じゃありません。", es: "Aquella persona no es doctora." },
  { jp: "ラーメン は おいしく じゃありません。", es: "El ramen no es delicioso." }, // simple didáctico
  { jp: "テーブル は あたらしく じゃありません。", es: "La mesa no es nueva." },
  { jp: "こちら は がくせい じゃありません。", es: "Esta persona no es estudiante." },
  { jp: "パソコン は たかく じゃありません。", es: "La computadora no es cara." },
  { jp: "かばん は たかく じゃありません。", es: "La mochila no es cara." },
  { jp: "とけい は たかく じゃありません。", es: "El reloj no es caro." },
];

// NOTA: Para accesibilidad “nivel primaria”, usamos el molde copulativo con adjetivos
// sin entrar en toda la morfología (～くないです). Si prefieres くないです, avísame y lo adapto.

// =============== utils / helpers ===============
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

const jpNeg = (a: string, b: string) => `${a} は ${b} じゃありません`;

function makeQuestionPool(): QA[] {
  const base = pick(ITEMS, 10);
  return base.map((it) => {
    const correct = jpNeg(it.A, it.B);
    const d1 = `${it.A} は ${it.B} です`;              // afirmativa
    const d2 = `${it.A} を ${it.B} じゃありません`;      // partícula mal
    const d3 = `${it.A} は ${it.B}`;                    // falta です/じゃありません
    const options = shuffle([correct, d1, d2, d3]);
    return { jp: correct, es: it.esNeg, options };
  });
}

// =============== TTS helpers ===============
function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}

export default function B4_DesuNeg() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_DesuNeg";
  const ACHIEVEMENT_ID = "desu_negativo";
  const ACHIEVEMENT_TITLE = "DESU negativo";

  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Preguntas
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
    const ok = value === current.jp;
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
        {/* Encabezado */}
        <View style={s.ribbon}>
          <Ionicons name="book" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>A は B じゃありません</Text>
        <Text style={s.subtitle}>Negación cortés de です — <Text style={{ fontWeight: "900" }}>“A no es B”</Text></Text>

        {/* Info: ¿じゃありません vs ではありません? */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación rápida</Text>
          </View>

          <Text style={s.p}><Text style={s.kbd}>じゃありません</Text> es la forma cortés negativa: “no es”.</Text>
          <Text style={s.p}><Text style={s.kbd}>ではありません</Text> significa lo mismo y suena un poco más formal.</Text>
          <Text style={s.p}>Molde: <Text style={s.kbd}>A は B じゃありません</Text> → <Text style={{ fontWeight: "800" }}>“A no es B”.</Text></Text>

          {/* Botones de audio de pronunciación solicitados */}
          <View style={[s.pronounceRow]}>
            <View style={s.pronounceItem}>
              <Text style={s.pronounceJP}>じゃありません</Text>
              <Text style={s.pronounceRoma}>jya arimasen</Text>
            </View>
            <Pressable style={s.ttsBtnLg} onPress={() => speakJP("じゃありません")} accessibilityLabel="Pronunciar じゃありません">
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={s.ttsBtnLgTxt}>Escuchar</Text>
            </Pressable>
          </View>

          <View style={[s.pronounceRow]}>
            <View style={s.pronounceItem}>
              <Text style={s.pronounceJP}>ではありません</Text>
              <Text style={s.pronounceRoma}>de wa arimasen</Text>
            </View>
            <Pressable style={s.ttsBtnLg} onPress={() => speakJP("ではありません")} accessibilityLabel="Pronunciar ではありません">
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

        {/* 15 ORACIONES */}
        <View style={[s.infoCard, { borderColor: ROSE, backgroundColor: "#FFF1F2" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="sparkles" size={18} color={ROSE} />
            <Text style={[s.h, { color: ROSE }]}>15 oraciones de ejemplo (escúchalas)</Text>
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
            <Text style={s.p}>Lee la oración en <Text style={{ fontWeight: "900" }}>español</Text> y elige su versión correcta en <Text style={{ fontWeight: "900" }}>japonés</Text>.</Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Formato</Text>
              <Text style={s.hintBody}>Usa: <Text style={s.kbd}>A は B じゃありません</Text></Text>
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
              <Text style={s.promptHelp}>Traduce al japonés (negativo):</Text>
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
    borderColor: "#FBCFE8",
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
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0e8c82",
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

  /* TTS button (único, sin stop) */
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
  modalTitle: { fontSize: 16, fontWeight: "900", color: EMERALD },
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
