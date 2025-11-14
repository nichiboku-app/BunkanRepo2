// src/screens/N5/B5_ParticulasTiempo.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_ParticulasTiempo — に・から・まで・ごろ・ぐらい
 * - Explicación simple (arriba)
 * - Vocabulario con TTS
 * - Ejemplos con audio (sin へ)
 * - 2 minijuegos + sonidos
 * - Logro al finalizar: tiempo_particulas_n5 (+10 XP)
 */

const PAPER = "#0b1020";
const WHITE = "#fff";
const STROKE = "rgba(255,255,255,0.14)";
const CARD = "rgba(255,255,255,0.08)";
const VIOLET = "#8B5CF6";
const MINT = "#34D399";
const ROSE = "#FB7185";
const AMBER = "#F59E0B";
const GOLD = "#F2C94C";
const INK_DARK = "#0b1020";

const speakJP = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.97 });
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ========== Explicación básica (arriba) ========== */
const EXPLICACION: string[] = [
  "に: marca un **momento exacto**. Se usa con horas y fechas (7じに, 10がつ3にちに). No se usa con palabras como きょう, あした, まいにち.",
  "から: significa **desde** (inicio de un periodo). ７じから はたらきます。",
  "まで: significa **hasta** (fin de un periodo). ５じまで はたらきます。",
  "から〜まで: **desde… hasta…** para rangos de tiempo. ９じから １２じまで べんきょうします。",
  "ごろ: **aprox. a esa hora** (punto en el tiempo). ８じごろ でかけます。",
  "ぐらい（くらい）: **aproximadamente** (cantidad o **duración**). ３０ぷんぐらい べんきょうします。",
];

/* ========== Vocabulario clave (TTS) ========== */
type VItem = { jp: string; hint: string; es: string; say?: string };
const VOCAB: VItem[] = [
  { jp: "に", hint: "hora/fecha exacta", es: "en, a (momento)", say: "に" },
  { jp: "から", hint: "inicio", es: "desde", say: "から" },
  { jp: "まで", hint: "fin", es: "hasta", say: "まで" },
  { jp: "ごろ", hint: "hora aprox.", es: "alrededor de (hora)", say: "ごろ" },
  { jp: "ぐらい（くらい）", hint: "duración/cantidad aprox.", es: "aproximadamente", say: "ぐらい" },
];

/* ========== Ejemplos con audio (sin へ) ========== */
const EJEMPLOS: { jp: string; es: string }[] = [
  { jp: "わたし は ７じに おきます。", es: "Me levanto a las 7 (en punto)." },
  { jp: "８じごろ いえ を でます。", es: "Salgo de casa alrededor de las 8." },
  { jp: "９じから ５じまで はたらきます。", es: "Trabajo de 9 a 5." },
  { jp: "３０ぷんぐらい べんきょうします。", es: "Estudio unos 30 minutos." },
  { jp: "あした は ６じに ジムで うんどうします。", es: "Mañana hago ejercicio en el gimnasio a las 6." },
  { jp: "まいにち は に を つけません。", es: "Con “cada día” no usamos に." },
];

/* ========== Minijuego A: Elige la partícula correcta ========== */
type QA = { prompt: string; options: string[]; correct: string; speak?: string };
const QUIZ_A: QA[] = [
  { prompt: "（　） ７じ おきます。", options: ["に", "から", "ぐらい"], correct: "に", speak: "に しちじ おきます" },
  { prompt: "９じ（　） ５じ（　） はたらきます。", options: ["から／まで", "に／に", "ごろ／ぐらい"], correct: "から／まで", speak: "くじ から ごじ まで はたらきます" },
  { prompt: "８じ（　） でかけます。", options: ["ごろ", "ぐらい", "まで"], correct: "ごろ", speak: "はちじ ごろ でかけます" },
  { prompt: "３０ぷん（　） べんきょうします。", options: ["ぐらい", "ごろ", "に"], correct: "ぐらい", speak: "さんじゅっぷん ぐらい べんきょうします" },
  { prompt: "あした（　） に は つけません。", options: ["は", "に", "から"], correct: "は", speak: "あした は に は つけません" },
];

/* ========== Minijuego B: ¿Qué significa? ========== */
const QUIZ_B: QA[] = [
  { prompt: "ごろ →", options: ["aprox. a esa hora", "aprox. duración", "desde"], correct: "aprox. a esa hora", speak: "ごろ" },
  { prompt: "ぐらい →", options: ["hasta", "aprox. duración/cantidad", "en (hora exacta)"], correct: "aprox. duración/cantidad", speak: "ぐらい" },
  { prompt: "に（tiempo）→", options: ["en/punto exacto", "desde", "aprox. a esa hora"], correct: "en/punto exacto", speak: "に" },
  { prompt: "から →", options: ["hasta", "desde", "aprox. duración"], correct: "desde", speak: "から" },
  { prompt: "まで →", options: ["hasta", "aprox. a esa hora", "desde"], correct: "hasta", speak: "まで" },
];

/* ========== Componente principal ========== */
export default function B5_ParticulasTiempo() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_ParticulasTiempo";
  const ACHIEVEMENT_ID = "tiempo_particulas_n5";
  const ACHIEVEMENT_TITLE = "Partículas de tiempo (N5)";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  const { playCorrect, playWrong } = useFeedbackSounds();

  // hero anim
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: false }),
      ])
    ).start();
  }, [glow]);
  const glowSize = glow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] });

  // Quiz A
  const qaA = useMemo(() => shuffle(QUIZ_A), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  // Quiz B
  const qaB = useMemo(() => shuffle(QUIZ_B), []);
  const [bIdx, setBIdx] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [bSel, setBSel] = useState<string | null>(null);
  const [bFlash, setBFlash] = useState<"ok" | "bad" | null>(null);
  const [bStarted, setBStarted] = useState(false);

  // logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState(0);
  const [hasAwarded, setHasAwarded] = useState(false);

  const maybeAward = async () => {
    if (hasAwarded) return;
    const aDone = !aStarted && aIdx > 0;
    const bDone = !bStarted && bIdx > 0;
    if (aDone && bDone) {
      await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
      const res = await awardAchievement(ACHIEVEMENT_ID, {
        xp: 10,
        sub: ACHIEVEMENT_TITLE,
        meta: { screenKey: SCREEN_KEY, level: LEVEL },
      });
      setModalPoints(res.firstTime ? 10 : 0);
      setRewardModalVisible(true);
      setHasAwarded(true);
    }
  };

  const chooseA = async (opt: string) => {
    if (aSel !== null) return;
    const ok = opt === qaA[aIdx].correct;
    setASel(opt);
    if (ok) { setAScore(s => s + 100); setAFlash("ok"); await playCorrect(); }
    else { setAFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setAFlash(null); setASel(null);
      if (aIdx + 1 < qaA.length) setAIdx(i => i + 1);
      else { setAStarted(false); maybeAward(); }
    }, 600);
  };

  const chooseB = async (opt: string) => {
    if (bSel !== null) return;
    const ok = opt === qaB[bIdx].correct;
    setBSel(opt);
    if (ok) { setBScore(s => s + 100); setBFlash("ok"); await playCorrect(); }
    else { setBFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setBFlash(null); setBSel(null);
      if (bIdx + 1 < qaB.length) setBIdx(i => i + 1);
      else { setBStarted(false); maybeAward(); }
    }, 600);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />
          <View style={s.blob3} />
          <Animated.View style={[s.glowDot, { width: glowSize, height: glowSize }]} />
          <Text style={s.kicker}>BLOQUE 5 · N5</Text>
          <Text style={s.title}>Partículas de tiempo</Text>
          <Text style={s.subtitle}>に・から・まで・ごろ・ぐらい</Text>
        </View>

        {/* EXPLICACIÓN (SIEMPRE VISIBLE) */}
        <Section title="Explicación básica（やさしい）" tint="violet">
          {EXPLICACION.map((t, i) => (
            <Text key={i} style={s.infoLine}>
              • <Text style={{ color: WHITE }}>{t}</Text>
            </Text>
          ))}
        </Section>

        {/* VOCABULARIO (SIEMPRE VISIBLE) */}
        <Section title="Vocabulario clave（音声つき）" tint="mint">
          <View style={s.grid}>
            {VOCAB.map((v, i) => (
              <VocabCard
                key={i}
                title={`${v.jp} — ${v.hint}`}
                sub={v.es}
                onSpeak={() => speakJP(v.say ?? v.jp)}
              />
            ))}
          </View>
        </Section>

        {/* EJEMPLOS (SIEMPRE VISIBLE) */}
        <Section title="Ejemplos con audio" tint="pink">
          <View style={{ gap: 12 }}>
            {EJEMPLOS.map((ex, i) => (
              <View key={i} style={s.exampleTile}>
                <View style={s.exampleHead}>
                  <Text style={s.exampleJP}>{ex.jp}</Text>
                  <Pressable
                    style={[s.ttsBtn, { backgroundColor: "#FBCFE8" }]}
                    onPress={() => speakJP(ex.jp)}
                  >
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* JUEGO A */}
        <View style={{ marginTop: 14 }}>
          {!aStarted && aIdx === 0 && aScore === 0 ? (
            <PlayCard
              title="アクティビティ A: Elige la partícula"
              desc="Completa con に・から・まで・ごろ・ぐらい según el significado."
              cta="はじめる"
              tone="mint"
              onPress={() => {
                setAStarted(true);
                setAIdx(0);
                setAScore(0);
                setASel(null);
              }}
            />
          ) : null}

          {aStarted && qaA[aIdx] && (
            <GameCard flash={aFlash}>
              <HeaderRow
                left={<Chip icon="bookmark" label={`もんだい ${aIdx + 1}/${qaA.length}`} />}
                right={<Chip icon="star" label={`${aScore} pts`} />}
              />
              <Prompt>
                {qaA[aIdx].prompt}
                {!!qaA[aIdx].speak && (
                  <Pressable
                    onPress={() => speakJP(qaA[aIdx].speak!)}
                    style={[s.ttsInline, { marginLeft: 8 }]}
                  >
                    <Ionicons name="volume-high" size={16} color={INK_DARK} />
                  </Pressable>
                )}
              </Prompt>
              <Options
                options={qaA[aIdx].options}
                chosen={aSel}
                correct={qaA[aIdx].correct}
                onChoose={chooseA}
              />
            </GameCard>
          )}

          {!aStarted && aIdx > 0 && (
            <SummaryCard
              title="けっか（アクティビティ A）"
              list={[
                { icon: "star", text: `Puntaje: ${aScore}` },
                { icon: "book", text: `Preguntas: ${qaA.length}` },
              ]}
            />
          )}
        </View>

        {/* JUEGO B */}
        <View style={{ marginTop: 14 }}>
          {!bStarted && bIdx === 0 && bScore === 0 ? (
            <PlayCard
              title="アクティビティ B: ¿Qué significa?"
              desc="Elige el significado correcto (ごろ / ぐらい / に / から / まで)."
              cta="はじめる"
              tone="amber"
              onPress={() => {
                setBStarted(true);
                setBIdx(0);
                setBScore(0);
                setBSel(null);
              }}
            />
          ) : null}

          {bStarted && qaB[bIdx] && (
            <GameCard flash={bFlash}>
              <HeaderRow
                left={<Chip icon="bookmark" label={`もんだい ${bIdx + 1}/${qaB.length}`} />}
                right={<Chip icon="star" label={`${bScore} pts`} />}
              />
              <Prompt>
                {qaB[bIdx].prompt}
                {!!qaB[bIdx].speak && (
                  <Pressable
                    onPress={() => speakJP(qaB[bIdx].speak!)}
                    style={[s.ttsInline, { marginLeft: 8 }]}
                  >
                    <Ionicons name="volume-high" size={16} color={INK_DARK} />
                  </Pressable>
                )}
              </Prompt>
              <Options
                options={qaB[bIdx].options}
                chosen={bSel}
                correct={qaB[bIdx].correct}
                onChoose={chooseB}
              />
            </GameCard>
          )}

          {!bStarted && bIdx > 0 && (
            <SummaryCard
              title="けっか（アクティビティ B）"
              list={[
                { icon: "star", text: `Puntaje: ${bScore}` },
                { icon: "book", text: `Preguntas: ${qaB.length}` },
              ]}
            />
          )}
        </View>
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
            <Ionicons name="trophy" size={30} color={GOLD} />
            <Text style={s.modalTitle}>¡Logro desbloqueado!</Text>
            <Text style={s.modalAchievementName}>{ACHIEVEMENT_TITLE}</Text>
            <Text style={s.modalPoints}>+{modalPoints} XP</Text>
            <Pressable style={s.modalButton} onPress={() => setRewardModalVisible(false)}>
              <Ionicons name="checkmark" size={16} color={INK_DARK} />
              <Text style={s.modalButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ========== Subcomponentes UI reusables ========== */
function Section({
  title,
  tint,
  children,
}: {
  title: string;
  tint: "violet" | "mint" | "pink";
  children: React.ReactNode;
}) {
  const color = tint === "violet" ? VIOLET : tint === "mint" ? MINT : ROSE;
  const bg =
    tint === "violet"
      ? "rgba(139,92,246,0.10)"
      : tint === "mint"
      ? "rgba(52,211,153,0.10)"
      : "rgba(251,113,133,0.10)";
  return (
    <View style={[s.section, { borderColor: color, backgroundColor: bg }]}>
      <View style={s.sectionHead}>
        <View style={[s.badge, { backgroundColor: color }]} />
        <Text style={[s.sectionTitle, { color: WHITE }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const VocabCard = ({
  title,
  sub,
  onSpeak,
}: {
  title: string;
  sub?: string;
  onSpeak?: () => void;
}) => (
  <View style={s.vcard}>
    <View style={{ flex: 1 }}>
      <Text style={s.vTitle}>{title}</Text>
      {!!sub && <Text style={s.vSub}>{sub}</Text>}
    </View>
    {onSpeak && (
      <Pressable style={s.ttsBtn} onPress={onSpeak}>
        <Ionicons name="volume-high" size={18} color={INK_DARK} />
      </Pressable>
    )}
  </View>
);

const Chip = ({
  icon,
  label,
}: {
  icon:
    | keyof typeof Ionicons.glyphMap
    | "star"
    | "book"
    | "bookmark";
  label: string;
}) => (
  <View style={stylesChip.chip}>
    <Ionicons name={icon as any} size={14} color={INK_DARK} />
    <Text style={stylesChip.txt}>{label}</Text>
  </View>
);

const HeaderRow = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <View style={s.rowBetween}>
    {left}
    {right}
  </View>
);

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <View style={s.promptWrap}>
    <Text style={s.prompt}>{children}</Text>
  </View>
);

function Options({
  options,
  chosen,
  correct,
  onChoose,
}: {
  options: string[];
  chosen: string | null;
  correct: string;
  onChoose: (o: string) => void;
}) {
  return (
    <View style={s.optionsGrid}>
      {options.map((opt, i) => {
        const chosenNow = chosen !== null && chosen === opt;
        const isRight = chosen !== null && opt === correct;
        return (
          <Pressable
            key={`${i}-${opt}`}
            onPress={() => onChoose(opt)}
            style={({ pressed }) => [
              s.option,
              pressed && s.optionPressed,
              chosenNow && s.optionChosen,
              isRight && s.optionRight,
              chosen && !isRight && chosenNow && s.optionWrong,
            ]}
          >
            <Text style={s.optionTxt}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PlayCard = ({
  title,
  desc,
  cta,
  onPress,
  tone,
}: {
  title: string;
  desc: string;
  cta: string;
  onPress: () => void;
  tone: "mint" | "amber";
}) => {
  const border = tone === "mint" ? "#34D399" : "#F59E0B";
  const bg = tone === "mint" ? "rgba(167,243,208,0.12)" : "rgba(253,230,138,0.12)";
  return (
    <View style={[s.playCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={s.cardHeaderRow}>
        <Ionicons name="clipboard" size={18} color={WHITE} />
        <Text style={s.h}> {title}</Text>
      </View>
      <Text style={s.p}>{desc}</Text>
      <Pressable
        style={[s.btnPrimary, { backgroundColor: border, borderColor: border }]}
        onPress={onPress}
      >
        <Ionicons name="play" size={16} color={INK_DARK} />
        <Text style={[s.btnTxt, { color: INK_DARK }]}>{cta}</Text>
      </Pressable>
    </View>
  );
};

const GameCard = ({
  children,
  flash,
}: {
  children: React.ReactNode;
  flash: "ok" | "bad" | null;
}) => (
  <View
    style={[
      s.gameCard,
      flash === "ok"
        ? { borderColor: MINT, shadowColor: MINT }
        : flash === "bad"
        ? { borderColor: ROSE, shadowColor: ROSE }
        : null,
    ]}
  >
    {children}
  </View>
);

const SummaryCard = ({
  title,
  list,
}: {
  title: string;
  list: { icon: keyof typeof Ionicons.glyphMap | "star" | "book"; text: string }[];
}) => (
  <View style={s.playCard}>
    <View style={s.cardHeaderRow}>
      <Ionicons name="ribbon" size={18} color={WHITE} />
      <Text style={s.h}>{title}</Text>
    </View>
    <View style={s.summaryRow}>
      {list.map((it, i) => (
        <View key={i} style={stylesChip.chip}>
          <Ionicons name={it.icon as any} size={14} color={INK_DARK} />
          <Text style={stylesChip.txt}>{it.text}</Text>
        </View>
      ))}
    </View>
  </View>
);

/* ========== Estilos ========== */
const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  hero: {
    borderRadius: 22,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: STROKE,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  blob1: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(14,165,233,0.20)",
  },
  blob2: {
    position: "absolute",
    bottom: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.16)",
  },
  blob3: {
    position: "absolute",
    top: 30,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(236,72,153,0.18)",
  },
  glowDot: {
    position: "absolute",
    top: 24,
    left: 24,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  kicker: { color: "#C7D2FE", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: "900", color: WHITE, letterSpacing: 0.2 },
  subtitle: { color: "#E5E7EB", marginTop: 4 },

  section: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  badge: { width: 10, height: 10, borderRadius: 999 },
  sectionTitle: { fontWeight: "900", fontSize: 16 },
  infoLine: { marginTop: 6, color: "#93C5FD" },

  grid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  vcard: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: STROKE,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  vTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  vSub: { marginTop: 4, color: WHITE, opacity: 0.9, fontSize: 12 },

  exampleTile: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: STROKE,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  exampleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  exampleJP: { fontSize: 16, fontWeight: "900", color: WHITE, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: WHITE, fontSize: 12 },

  playCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: STROKE,
    marginTop: 12,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: WHITE, fontSize: 16 },
  p: { marginTop: 6, color: WHITE, lineHeight: 20 },

  btnPrimary: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    minWidth: 220,
    justifyContent: "center",
  },
  btnTxt: { fontWeight: "900", letterSpacing: 0.3 },

  gameCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: STROKE,
    marginTop: 12,
    shadowColor: MINT,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  promptWrap: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(253,230,138,0.35)",
    backgroundColor: "rgba(253,230,138,0.10)",
  },
  prompt: { fontSize: 18, fontWeight: "900", color: WHITE, textAlign: "center" },

  optionsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  option: {
    width: "48%",
    borderWidth: 1,
    borderColor: STROKE,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 16, fontWeight: "800", color: WHITE, textAlign: "center" },
  optionChosen: { borderColor: "#93C5FD", backgroundColor: "rgba(147,197,253,0.14)" },
  optionRight: { borderColor: MINT, backgroundColor: "rgba(52,211,153,0.14)" },
  optionWrong: { borderColor: ROSE, backgroundColor: "rgba(251,113,133,0.14)" },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },

  ttsBtn: { backgroundColor: "#93C5FD", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  ttsInline: { backgroundColor: "#FDE68A", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: INK_DARK,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    gap: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#A7F3D0" },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: WHITE, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: GOLD, marginTop: 2, marginBottom: 10 },
  modalButton: {
    backgroundColor: "#FDE68A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  modalButtonText: { color: INK_DARK, fontWeight: "800" },
});

const stylesChip = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FDE68A",
    borderWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  txt: { fontSize: 12, color: "#0b1020", fontWeight: "900" },
});
