// src/screens/N5/B5_AdverbiosFrecuencia.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_AdverbiosFrecuencia — Adverbios: いつも・たいてい・よく・ときどき・たまに・あまり〜ません・ぜんぜん〜ません…
 * - Vocabulario con audio + ejemplos con audio
 * - 2 minijuegos (significado y completar oraciones)
 * - Modal de logro al terminar ambos
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

const speakJP = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.98 });
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ================= Explicación ultra simple ================= */
const EXPLICACION = [
  "Los adverbios de frecuencia dicen cada cuánto pasa algo.",
  "• いつも = siempre   • たいてい = casi siempre / generalmente",
  "• よく = a menudo   • ときどき = a veces   • たまに = rara vez",
  "• あまり〜ません = casi no (usa verbo en negativo)",
  "• ぜんぜん〜ません = nunca / nada (usa verbo en negativo)",
  "También puedes usar まいにち（todos los días）, まいしゅう（todas las semanas）, まいつき（todos los meses）.",
  "El verbo generalmente va al final: まいにち べんきょう します。",
];

/* ================= Vocabulario principal ================= */
type VItem = { jp: string; roma: string; es: string };
const VOCAB: VItem[] = [
  { jp: "いつも", roma: "itsumo", es: "siempre" },
  { jp: "たいてい", roma: "taitei", es: "casi siempre / generalmente" },
  { jp: "よく", roma: "yoku", es: "a menudo" },
  { jp: "ときどき", roma: "tokidoki", es: "a veces" },
  { jp: "たまに", roma: "tamani", es: "rara vez" },
  { jp: "あまり（〜ません）", roma: "amari (~masen)", es: "casi no (con negativo)" },
  { jp: "ぜんぜん（〜ません）", roma: "zenzen (~masen)", es: "nunca / nada (con negativo)" },
  { jp: "まいにち", roma: "mainichi", es: "todos los días" },
  { jp: "まいしゅう", roma: "maishuu", es: "todas las semanas" },
  { jp: "まいつき", roma: "maitsuki", es: "todos los meses" },
];

/* ================= Ejemplos con audio ================= */
const EJEMPLOS: { jp: string; es: string }[] = [
  { jp: "わたし は いつも あさ ごはん を たべます。", es: "Siempre desayuno." },
  { jp: "たいてい しちじ に おきます。", es: "Casi siempre me levanto a las 7." },
  { jp: "かれ は よく ほん を よみます。", es: "Él lee libros a menudo." },
  { jp: "ときどき カフェ に いきます。", es: "A veces voy a un café." },
  { jp: "かのじょ は たまに りょうり を します。", es: "Ella cocina de vez en cuando." },
  { jp: "あまり テレビ を みません。", es: "Casi no veo la tele." },
  { jp: "ぜんぜん サッカー を しません。", es: "Nunca juego fútbol." },
  { jp: "まいにち にほんご を べんきょう します。", es: "Estudio japonés todos los días." },
  { jp: "まいしゅう ともだち と あそびます。", es: "Todas las semanas salgo con amigos." },
  { jp: "まいつき えいが を みます。", es: "Veo una película todos los meses." },
];

/* ================= Juegos ================= */
// A) “Significado correcto”: español → selecciona el adverbio
type QA = { prompt: string; options: string[]; correct: string };
const QUIZ_A: QA[] = [
  { prompt: "“siempre”", options: ["よく", "ときどき", "いつも"], correct: "いつも" },
  { prompt: "“casi siempre / generalmente”", options: ["たいてい", "たまに", "ぜんぜん（〜ません）"], correct: "たいてい" },
  { prompt: "“a menudo”", options: ["あまり（〜ません）", "よく", "まいつき"], correct: "よく" },
  { prompt: "“a veces”", options: ["ときどき", "いつも", "まいにち"], correct: "ときどき" },
  { prompt: "“rara vez”", options: ["たまに", "ぜんぜん（〜ません）", "たいてい"], correct: "たまに" },
  { prompt: "“casi no (con negativo)”", options: ["あまり（〜ません）", "よく", "いつも"], correct: "あまり（〜ません）" },
  { prompt: "“nunca / nada (con negativo)”", options: ["ぜんぜん（〜ません）", "ときどき", "まいしゅう"], correct: "ぜんぜん（〜ません）" },
];

// B) “Completa la frase”: se da una pista y eliges el adverbio
const QUIZ_B: QA[] = [
  { prompt: "Pista: ‘todos los días’", options: ["まいにち", "たまに", "あまり（〜ません）"], correct: "まいにち" },
  { prompt: "Pista: ‘todas las semanas’", options: ["たいてい", "まいしゅう", "よく"], correct: "まいしゅう" },
  { prompt: "Pista: ‘todos los meses’", options: ["まいつき", "ぜんぜん（〜ません）", "ときどき"], correct: "まいつき" },
  { prompt: "Pista: ‘a veces’", options: ["ときどき", "いつも", "よく"], correct: "ときどき" },
  { prompt: "Pista: ‘nunca (con negativo)’", options: ["ぜんぜん（〜ません）", "たいてい", "まいにち"], correct: "ぜんぜん（〜ません）" },
  { prompt: "Pista: ‘casi siempre / generalmente’", options: ["たいてい", "たまに", "あまり（〜ません）"], correct: "たいてい" },
];

/* ================= Pantalla ================= */
export default function B5_AdverbiosFrecuencia() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_AdverbiosFrecuencia";
  const ACHIEVEMENT_ID = "adv_frecuencia_n5";
  const ACHIEVEMENT_TITLE = "Adverbios de frecuencia N5";
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

  // tabs & quiz states
  const [tab, setTab] = useState<"significados" | "completa">("significados");

  const quizA = useMemo(() => shuffle(QUIZ_A), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  const quizB = useMemo(() => shuffle(QUIZ_B), []);
  const [bIdx, setBIdx] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [bSel, setBSel] = useState<string | null>(null);
  const [bFlash, setBFlash] = useState<"ok" | "bad" | null>(null);
  const [bStarted, setBStarted] = useState(false);

  // logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState(0);
  const [hasAwarded, setHasAwarded] = useState(false);

  const giveAchievementOnce = async () => {
    if (hasAwarded) return;
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
    const res = await awardAchievement(ACHIEVEMENT_ID, {
      xp: 10,
      sub: ACHIEVEMENT_TITLE,
      meta: { screenKey: SCREEN_KEY, level: LEVEL },
    });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
    setHasAwarded(true);
  };

  const endIfBothDone = () => {
    const aDone = !aStarted && aIdx > 0;
    const bDone = !bStarted && bIdx > 0;
    if (aDone && bDone) void giveAchievementOnce();
  };

  const answerA = async (opt: string) => {
    if (aSel !== null) return;
    const ok = opt === quizA[aIdx].correct;
    setASel(opt);
    if (ok) { setAScore((s) => s + 100); setAFlash("ok"); await playCorrect(); }
    else { setAFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setAFlash(null); setASel(null);
      if (aIdx + 1 < quizA.length) setAIdx(i => i + 1); else { setAStarted(false); endIfBothDone(); }
    }, 600);
  };

  const answerB = async (opt: string) => {
    if (bSel !== null) return;
    const ok = opt === quizB[bIdx].correct;
    setBSel(opt);
    if (ok) { setBScore((s) => s + 100); setBFlash("ok"); await playCorrect(); }
    else { setBFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setBFlash(null); setBSel(null);
      if (bIdx + 1 < quizB.length) setBIdx(i => i + 1); else { setBStarted(false); endIfBothDone(); }
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
          <Text style={s.title}>いつも？ ときどき？ たいてい？</Text>
          <Text style={s.subtitle}>Adverbios de frecuencia claros, con audio y práctica.</Text>
        </View>

        {/* EXPLICACIÓN */}
        <Section title="Explicación básica（やさしい）" tint="violet">
          {EXPLICACION.map((t, i) => (
            <Text key={i} style={s.infoLine}>• <Text style={{ color: WHITE }}>{t}</Text></Text>
          ))}
        </Section>

        {/* VOCABULARIO */}
        <Section title="Vocabulario con audio" tint="mint">
          <View style={s.grid}>
            {VOCAB.map((v, i) => (
              <VocabCard key={i} title={v.jp} sub={`${v.roma} — ${v.es}`} onSpeak={() => speakJP(v.jp)} />
            ))}
          </View>
        </Section>

        {/* EJEMPLOS */}
        <Section title="Ejemplos con audio" tint="pink">
          <View style={{ gap: 12 }}>
            {EJEMPLOS.map((ex, i) => (
              <View key={i} style={s.exampleTile}>
                <View style={s.exampleHead}>
                  <Text style={s.exampleJP}>{ex.jp}</Text>
                  <Pressable style={[s.ttsBtn, { backgroundColor: "#FBCFE8" }]} onPress={() => speakJP(ex.jp)}>
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* TABS JUEGOS */}
        <View style={s.tabsRow}>
          <TabBtn label="Significados" active={tab === "significados"} onPress={() => setTab("significados")} icon="sparkles" />
          <TabBtn label="Completar" active={tab === "completa"} onPress={() => setTab("completa")} icon="pencil" />
        </View>

        {/* Juego A: Significados */}
        {tab === "significados" && (
          <>
            {!aStarted && aIdx === 0 && aScore === 0 && (
              <PlayCard
                title="アクティビティ A: Significados"
                desc="Elige el adverbio correcto según el significado en español."
                cta="はじめる"
                tone="mint"
                onPress={() => { setAStarted(true); setAIdx(0); setAScore(0); setASel(null); }}
              />
            )}
            {aStarted && quizA[aIdx] && (
              <GameCard flash={aFlash}>
                <HeaderRow left={<Chip icon="bookmark" label={`もんだい ${aIdx + 1}/${quizA.length}`} />} right={<Chip icon="star" label={`${aScore} pts`} />} />
                <Prompt>Significado: {quizA[aIdx].prompt}</Prompt>
                <Options options={quizA[aIdx].options} chosen={aSel} correct={quizA[aIdx].correct} onChoose={answerA} />
              </GameCard>
            )}
            {!aStarted && aIdx > 0 && (
              <SummaryCard title="けっか（アクティビティ A）" list={[{ icon: "star", text: `Puntaje: ${aScore}` }, { icon: "book", text: `Preguntas: ${quizA.length}` }]} />
            )}
          </>
        )}

        {/* Juego B: Completar */}
        {tab === "completa" && (
          <>
            {!bStarted && bIdx === 0 && bScore === 0 && (
              <PlayCard
                title="アクティビティ B: Completar"
                desc="Elige el adverbio que encaja con la pista."
                cta="はじめる"
                tone="amber"
                onPress={() => { setBStarted(true); setBIdx(0); setBScore(0); setBSel(null); }}
              />
            )}
            {bStarted && quizB[bIdx] && (
              <GameCard flash={bFlash}>
                <HeaderRow left={<Chip icon="bookmark" label={`もんだい ${bIdx + 1}/${quizB.length}`} />} right={<Chip icon="star" label={`${bScore} pts`} />} />
                <Prompt>Pista: {quizB[bIdx].prompt}</Prompt>
                <Options options={quizB[bIdx].options} chosen={bSel} correct={quizB[bIdx].correct} onChoose={answerB} />
              </GameCard>
            )}
            {!bStarted && bIdx > 0 && (
              <SummaryCard title="けっか（アクティビティ B）" list={[{ icon: "star", text: `Puntaje: ${bScore}` }, { icon: "book", text: `Preguntas: ${quizB.length}` }]} />
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de logro */}
      <Modal animationType="fade" transparent visible={rewardModalVisible} onRequestClose={() => setRewardModalVisible(false)}>
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

/* ================= Subcomponentes UI ================= */
function Section({ title, tint, children }: { title: string; tint: "violet" | "mint" | "pink"; children: React.ReactNode }) {
  const color = tint === "violet" ? VIOLET : tint === "mint" ? MINT : ROSE;
  const bg = tint === "violet" ? "rgba(139,92,246,0.10)" : tint === "mint" ? "rgba(52,211,153,0.10)" : "rgba(251,113,133,0.10)";
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

const VocabCard = ({ title, sub, onSpeak }: { title: string; sub?: string; onSpeak?: () => void }) => (
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

const Chip = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark"; label: string }) => (
  <View style={stylesChip.chip}><Ionicons name={icon as any} size={14} color={INK_DARK} /><Text style={stylesChip.txt}>{label}</Text></View>
);

const HeaderRow = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <View style={s.rowBetween}>{left}{right}</View>
);

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <View style={s.promptWrap}><Text style={s.prompt}>{children}</Text></View>
);

function Options({ options, chosen, correct, onChoose }:{ options: string[]; chosen: string | null; correct: string; onChoose: (o: string) => void }) {
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

const TabBtn = ({ label, active, onPress, icon }:{
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "sparkles" | "pencil";
}) => (
  <Pressable onPress={onPress} style={[s.tabBtn, active && s.tabActive]}>
    <Ionicons name={icon as any} size={14} color={active ? INK_DARK : "#E5E7EB"} />
    <Text style={[s.tabTxt, active && s.tabTxtActive]}>{label}</Text>
  </Pressable>
);

const PlayCard = ({ title, desc, cta, onPress, tone }:{
  title: string; desc: string; cta: string; onPress: () => void; tone: "mint" | "amber";
}) => {
  const border = tone === "mint" ? "#34D399" : "#F59E0B";
  const bg = tone === "mint" ? "rgba(167,243,208,0.12)" : "rgba(253,230,138,0.12)";
  return (
    <View style={[s.playCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={s.cardHeaderRow}><Ionicons name="clipboard" size={18} color={WHITE} /><Text style={s.h}> {title}</Text></View>
      <Text style={s.p}>{desc}</Text>
      <Pressable style={[s.btnPrimary, { backgroundColor: border, borderColor: border }]} onPress={onPress}>
        <Ionicons name="play" size={16} color={INK_DARK} /><Text style={[s.btnTxt, { color: INK_DARK }]}>{cta}</Text>
      </Pressable>
    </View>
  );
};

const GameCard = ({ children, flash }:{ children: React.ReactNode; flash: "ok" | "bad" | null }) => (
  <View style={[s.gameCard, flash === "ok" ? { borderColor: MINT, shadowColor: MINT } : flash === "bad" ? { borderColor: ROSE, shadowColor: ROSE } : null]}>
    {children}
  </View>
);

const SummaryCard = ({ title, list }:{ title: string; list: { icon: keyof typeof Ionicons.glyphMap | "star" | "book"; text: string }[] }) => (
  <View style={s.playCard}>
    <View style={s.cardHeaderRow}><Ionicons name="ribbon" size={18} color={WHITE} /><Text style={s.h}>{title}</Text></View>
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

/* ================= Estilos ================= */
const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  hero: { borderRadius: 22, padding: 18, overflow: "hidden", borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.04)" },
  blob1: { position: "absolute", top: -60, left: -40, width: 180, height: 180, borderRadius: 999, backgroundColor: "rgba(14,165,233,0.20)" },
  blob2: { position: "absolute", bottom: -70, right: -50, width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(139,92,246,0.16)" },
  blob3: { position: "absolute", top: 30, right: -60, width: 120, height: 120, borderRadius: 999, backgroundColor: "rgba(236,72,153,0.18)" },
  glowDot: { position: "absolute", top: 24, left: 24, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.35)" },

  kicker: { color: "#C7D2FE", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: "900", color: WHITE, letterSpacing: 0.2 },
  subtitle: { color: "#E5E7EB", marginTop: 6 },

  section: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  badge: { width: 10, height: 10, borderRadius: 999 },
  sectionTitle: { fontWeight: "900", fontSize: 16 },
  infoLine: { marginTop: 6, color: "#93C5FD" },

  grid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  vcard: { width: "48%", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: STROKE, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  vTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  vSub: { marginTop: 4, color: WHITE, opacity: 0.9, fontSize: 12 },

  exampleTile: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, paddingVertical: 12, paddingHorizontal: 12 },
  exampleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  exampleJP: { fontSize: 16, fontWeight: "900", color: WHITE, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: WHITE, fontSize: 12 },

  tabsRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  tabBtn: { flexDirection: "row", gap: 6, alignItems: "center", borderWidth: 1, borderColor: STROKE, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)" },
  tabActive: { backgroundColor: "#FDE68A" },
  tabTxt: { color: WHITE, fontWeight: "800" },
  tabTxtActive: { color: INK_DARK },

  playCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: WHITE, fontSize: 16 },
  p: { marginTop: 6, color: WHITE, lineHeight: 20 },

  btnPrimary: {
    marginTop: 14, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", borderWidth: 1,
    flexDirection: "row", gap: 8, alignSelf: "center", minWidth: 220, justifyContent: "center",
  },
  btnTxt: { fontWeight: "900", letterSpacing: 0.3 },

  gameCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12, shadowColor: MINT, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  promptWrap: { marginTop: 10, alignItems: "center", paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(253,230,138,0.35)", backgroundColor: "rgba(253,230,138,0.10)" },
  prompt: { fontSize: 18, fontWeight: "900", color: WHITE, textAlign: "center" },

  optionsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  option: {
    width: "48%", borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14, borderRadius: 14, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 16, fontWeight: "800", color: WHITE, textAlign: "center" },
  optionChosen: { borderColor: "#93C5FD", backgroundColor: "rgba(147,197,253,0.14)" },
  optionRight: { borderColor: MINT, backgroundColor: "rgba(52,211,153,0.14)" },
  optionWrong: { borderColor: ROSE, backgroundColor: "rgba(251,113,133,0.14)" },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },

  ttsBtn: { backgroundColor: "#93C5FD", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 380, backgroundColor: INK_DARK, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: "#1f2937", alignItems: "center", gap: 6 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#A7F3D0" },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: WHITE, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: GOLD, marginTop: 2, marginBottom: 10 },
  modalButton: { backgroundColor: "#FDE68A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 160, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  modalButtonText: { color: INK_DARK, fontWeight: "800" },
});

const stylesChip = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDE68A", borderWidth: 0, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  txt: { fontSize: 12, color: "#0b1020", fontWeight: "900" },
});
