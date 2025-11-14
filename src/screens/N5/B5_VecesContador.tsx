// src/screens/N5/B5_VecesContador.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_VecesContador — Contador de “veces” 回（かい）
 * - Explicación clara: 1回=いっかい, 6回=ろっかい, 8回=はっかい, 10回=じゅっかい; 何回=¿cuántas veces?
 * - Kanji del tema: 回・毎・週・何 (con imágenes de trazos, fondo blanco)
 * - Vocabulario 1〜10 回 (con TTS)
 * - Ejemplos con TTS (sin kanji de números, usamos cifras y kana)
 * - 2 minijuegos (lectura / completa la frase)
 * - Logro + XP
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

/* ========== Explicación básica (arriba) ========== */
const EXPLICACION = [
  "回（かい）es un contador que significa “veces”. Se agrega al número: 1回（いっかい）= una vez.",
  "Irregularidades importantes: 1回=いっかい, 6回=ろっかい, 8回=はっかい, 10回=じゅっかい.",
  "Para preguntar: 何回（なんかい）？ = ¿cuántas veces?",
  "Puedes combinar con tiempo: １しゅうかんに ２回、１かげつに ３回… (por semana / por mes).",
];

/* ========== KANJI del tema (con trazos blancos) ========== */
type KanjiItem = {
  hex: string; // para el require del webp
  k: string;   // kanji
  yomi: string; // lectura(s) simple
  es: string; // significado ES
};
const KANJI_SET: KanjiItem[] = [
  { hex: "56de", k: "回", yomi: "かい / まわ(る)", es: "veces / girar" },
  { hex: "6bce", k: "毎", yomi: "まい", es: "cada" },
  { hex: "9031", k: "週", yomi: "しゅう", es: "semana" },
  { hex: "4f55", k: "何", yomi: "なに / なん", es: "qué" },
];

/* ========== Vocabulario — 1〜10 回 (kana y TTS) ========== */
type VItem = { label: string; jp: string; es: string };
const VOCAB: VItem[] = [
  { label: "1回", jp: "いっかい", es: "una vez" },
  { label: "2回", jp: "にかい",   es: "dos veces" },
  { label: "3回", jp: "さんかい", es: "tres veces" },
  { label: "4回", jp: "よんかい", es: "cuatro veces" },
  { label: "5回", jp: "ごかい",   es: "cinco veces" },
  { label: "6回", jp: "ろっかい", es: "seis veces" },
  { label: "7回", jp: "ななかい", es: "siete veces" },
  { label: "8回", jp: "はっかい", es: "ocho veces" },
  { label: "9回", jp: "きゅうかい", es: "nueve veces" },
  { label: "10回", jp: "じゅっかい（じっかい）", es: "diez veces" },
];

/* ========== Ejemplos con audio (sin kanji de números) ========== */
const EJEMPLOS: { jp: string; es: string }[] = [
  { jp: "わたし は １しゅうかんに ２回 ジム に いきます。", es: "Voy al gimnasio 2 veces por semana." },
  { jp: "１にちに ３回 みず を のみます。", es: "Bebo agua 3 veces al día." },
  { jp: "１かげつに １回 びょういん へ いきます。", es: "Voy al hospital 1 vez al mes." },
  { jp: "なん回 べんきょう します か。", es: "¿Cuántas veces estudias?" },
  { jp: "まいにち １回 うんどう します。", es: "Hago ejercicio 1 vez cada día." },
];

/* ========== Minijuegos ========== */
type QA = { prompt: string; options: string[]; correct: string };
// A) “¿Cómo se lee?” → mapea 1回, 6回, 8回, 10回, etc.
const QUIZ_A: QA[] = [
  { prompt: "1回 →", options: ["いちかい", "いっかい", "ひとかい"], correct: "いっかい" },
  { prompt: "6回 →", options: ["ろっかい", "ろくかい", "むっかい"], correct: "ろっかい" },
  { prompt: "8回 →", options: ["はちかい", "はっかい", "やっかい"], correct: "はっかい" },
  { prompt: "10回 →", options: ["じゅっかい", "じゅうかい", "じっかい"], correct: "じゅっかい" },
  { prompt: "4回 →", options: ["よんかい", "し かい", "よっかい"], correct: "よんかい" },
];
// B) “Completa la frase” → elige frecuencia correcta
const QUIZ_B: QA[] = [
  { prompt: "わたし は １しゅうかんに …… ジム に いきます。", options: ["１回", "２回", "５回"], correct: "２回" },
  { prompt: "１にちに …… みず を のみます。", options: ["１回", "３回", "９回"], correct: "３回" },
  { prompt: "１かげつに …… えいが を みます。", options: ["１回", "４回", "８回"], correct: "１回" },
  { prompt: "まいしゅう …… サッカー を します。", options: ["１回", "２回", "５回"], correct: "２回" },
  { prompt: "なん回 べんきょう します か。…… べんきょう します。", options: ["１回", "３回", "１０回"], correct: "３回" },
];

/* ========== Componente principal ========== */
export default function B5_VecesContador() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_VecesContador";
  const ACHIEVEMENT_ID = "veces_kai_n5";
  const ACHIEVEMENT_TITLE = "Veces con 回 (N5)";
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
  const [tab, setTab] = useState<"kanji" | "vocab" | "ejemplos">("kanji");

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
          <Text style={s.title}>Contador de veces：回（かい）</Text>
          <Text style={s.subtitle}>Aprende 1〜10 回, la pregunta 何回 y practica con audio.</Text>
        </View>

        {/* EXPLICACIÓN */}
        <Section title="Explicación básica（やさしい）" tint="violet">
          {EXPLICACION.map((t, i) => (
            <Text key={i} style={s.infoLine}>• <Text style={{ color: WHITE }}>{t}</Text></Text>
          ))}
        </Section>

        {/* KANJI DEL TEMA */}
        <Section title="Kanji del tema（筆順・よみ・意味）" tint="pink">
          <View style={s.kanjiWrap}>
            {KANJI_SET.map((k) => (
              <View key={k.hex} style={s.kCard}>
                {/* Fondo BLANCO para que resalten los trazos en blanco */}
                <View style={s.kImgBox}>
                  <Image
                    source={require(`../../../assets/kanjivg/n5/56de_nums.webp`)}
                    style={[s.kImg, { display: k.hex === "56de" ? "flex" : "none" }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require(`../../../assets/kanjivg/n5/6bce_nums.webp`)}
                    style={[s.kImg, { display: k.hex === "6bce" ? "flex" : "none" }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require(`../../../assets/kanjivg/n5/9031_nums.webp`)}
                    style={[s.kImg, { display: k.hex === "9031" ? "flex" : "none" }]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require(`../../../assets/kanjivg/n5/4f55_nums.webp`)}
                    style={[s.kImg, { display: k.hex === "4f55" ? "flex" : "none" }]}
                    resizeMode="contain"
                  />
                </View>

                <View style={s.kInfo}>
                  <Text style={s.kHead}>{k.k}</Text>
                  <Text style={s.kYomi}>{k.yomi}</Text>
                  <Text style={s.kEs}>{k.es}</Text>
                </View>

                <Pressable style={s.ttsBtnLight} onPress={() => speakJP(k.k)}>
                  <Ionicons name="volume-high" size={18} color={INK_DARK} />
                </Pressable>
              </View>
            ))}
          </View>
        </Section>

        {/* VOCABULARIO — 1〜10回 */}
        <Section title="Vocabulario：1〜10 回（音声つき）" tint="mint">
          <View style={s.grid}>
            {VOCAB.map((v, i) => (
              <VocabCard
                key={i}
                title={`${v.label} — ${v.jp}`}
                sub={v.es}
                onSpeak={() => speakJP(v.jp)}
              />
            ))}
            <VocabCard title={"何回（なんかい）"} sub={"¿cuántas veces?"} onSpeak={() => speakJP("なんかい")} />
          </View>
        </Section>

        {/* EJEMPLOS CON AUDIO */}
        <Section title="Ejemplos con audio（X回 / 何回）" tint="pink">
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
          <TabBtn label="¿Cómo se lee?" active={tab === "vocab"} onPress={() => setTab("vocab")} icon="school" />
          <TabBtn label="Completa la frase" active={tab === "ejemplos"} onPress={() => setTab("ejemplos")} icon="pencil" />
          <TabBtn label="Kanji" active={tab === "kanji"} onPress={() => setTab("kanji")} icon="book" />
        </View>

        {/* Juego A */}
        {tab === "vocab" && (
          <>
            {!aStarted && aIdx === 0 && aScore === 0 && (
              <PlayCard
                title="アクティビティ A: Lectura de 回"
                desc="Elige la lectura correcta (いっかい／ろっかい／はっかい／じゅっかい…)."
                cta="はじめる"
                tone="mint"
                onPress={() => { setAStarted(true); setAIdx(0); setAScore(0); setASel(null); }}
              />
            )}
            {aStarted && quizA[aIdx] && (
              <GameCard flash={aFlash}>
                <HeaderRow left={<Chip icon="bookmark" label={`もんだい ${aIdx + 1}/${quizA.length}`} />} right={<Chip icon="star" label={`${aScore} pts`} />} />
                <Prompt>{quizA[aIdx].prompt}</Prompt>
                <Options options={quizA[aIdx].options} chosen={aSel} correct={quizA[aIdx].correct} onChoose={answerA} />
              </GameCard>
            )}
            {!aStarted && aIdx > 0 && (
              <SummaryCard title="けっか（アクティビティ A）" list={[{ icon: "star", text: `Puntaje: ${aScore}` }, { icon: "book", text: `Preguntas: ${quizA.length}` }]} />
            )}
          </>
        )}

        {/* Juego B */}
        {tab === "ejemplos" && (
          <>
            {!bStarted && bIdx === 0 && bScore === 0 && (
              <PlayCard
                title="アクティビティ B: Completa la frase"
                desc="Elige cuántas veces corresponde (１回／２回／３回…)."
                cta="はじめる"
                tone="amber"
                onPress={() => { setBStarted(true); setBIdx(0); setBScore(0); setBSel(null); }}
              />
            )}
            {bStarted && quizB[bIdx] && (
              <GameCard flash={bFlash}>
                <HeaderRow left={<Chip icon="bookmark" label={`もんだい ${bIdx + 1}/${quizB.length}`} />} right={<Chip icon="star" label={`${bScore} pts`} />} />
                <Prompt>{quizB[bIdx].prompt}</Prompt>
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

/* ========== Subcomponentes UI reusables ========== */
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
function Options({ options, chosen, correct, onChoose }:{
  options: string[]; chosen: string | null; correct: string; onChoose: (o: string) => void;
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
const TabBtn = ({ label, active, onPress, icon }:{
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "school" | "pencil" | "book";
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

/* ========== Estilos ========== */
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

  /* Kanji area */
  kanjiWrap: { marginTop: 6, gap: 12 },
  kCard: { backgroundColor: "#ffffff", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  kImgBox: { backgroundColor: "#ffffff", borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  kImg: { width: "100%", height: 140 },
  kInfo: { marginTop: 8 },
  kHead: { fontSize: 20, fontWeight: "900", color: "#111827" },
  kYomi: { marginTop: 2, color: "#374151", fontWeight: "700" },
  kEs: { marginTop: 2, color: "#4B5563" },
  ttsBtnLight: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "#FDE68A", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },

  /* Vocab & examples */
  grid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  vcard: { width: "48%", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: STROKE, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  vTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  vSub: { marginTop: 4, color: WHITE, opacity: 0.9, fontSize: 12 },

  exampleTile: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, paddingVertical: 12, paddingHorizontal: 12 },
  exampleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  exampleJP: { fontSize: 16, fontWeight: "900", color: WHITE, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: WHITE, fontSize: 12 },

  tabsRow: { flexDirection: "row", gap: 8, marginTop: 20, flexWrap: "wrap" },
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
