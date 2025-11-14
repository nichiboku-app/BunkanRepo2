// src/screens/N5/B5_TiempoDuracion.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_TiempoDuracion — Duración y límites: ～かん, から, まで
 *
 * Para esta versión:
 *  - Se eliminaron TODOS los ejemplos con kanji de números (一, 二, 三, ...).
 *  - Todo el vocab y ejemplos están en HIRAGANA (ej.: いちじかん, さんじゅっぷんかん, くじ).
 *  - Se refuerzan ejemplos con ～かん.
 *
 * Kanji de trazos (間) se mantiene para la sección visual de kanji, como en las demás pantallas.
 *
 * Comando (opcional) para la imagen del kanji 間 (trazos blancos):
 *   node scripts/make_kanji_webp.js --level n5 --suffix nums --stroke white 9593
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

/* ---------- helpers ---------- */
const speakJP = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.98 });
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ---------- Kanji (trazos BLANCOS) ---------- */
const KANJI_IMG = {
  "間": require("../../../assets/kanjivg/n5/9593_nums.webp"),
} as const;

const KANJI_INFO: Record<string, { yomi: string; es: string; note: string }> = {
  間: { yomi: "あいだ／かん", es: "intervalo / duración / entre", note: "En esta unidad usamos sobre todo かん como sufijo de duración（～じかん／～ふんかん…）。" },
};

/* ---------- VOCAB: Duración + “desde/hasta” (TODO en HIRAGANA) ---------- */
// Duraciones con ～じかん (horas) y ～ふんかん (minutos).
const DUR_HORAS = [
  { jp: "いちじかん", roma: "ichijikan", es: "una hora" },
  { jp: "にじかん", roma: "nijikan", es: "dos horas" },
  { jp: "さんじかん", roma: "sanjikan", es: "tres horas" },
  { jp: "よじかん", roma: "yojikan", es: "cuatro horas" },
  { jp: "ごじかん", roma: "gojikan", es: "cinco horas" },
  { jp: "ろくじかん", roma: "rokujikan", es: "seis horas" },
];

const DUR_MIN = [
  { jp: "いっぷんかん", roma: "ippunkan", es: "un minuto (de duración)" },
  { jp: "ごふんかん", roma: "gofunkan", es: "cinco minutos (de duración)" },
  { jp: "じゅっぷんかん", roma: "juppunkan", es: "diez minutos (de duración)" },
  { jp: "にじゅっぷんかん", roma: "nijuppunkan", es: "20 minutos (de duración)" },
  { jp: "さんじゅっぷんかん", roma: "sanjuppunkan", es: "30 minutos (de duración)" },
  { jp: "よんじゅっぷんかん", roma: "yonjuppunkan", es: "40 minutos (de duración)" },
];

// から／まで： expresiones frecuentes (TODO en HIRAGANA)
const LIMITES = [
  { jp: "くじ から じゅうじ まで", roma: "kuji kara juuji made", es: "de 9 a 10" },
  { jp: "げつようび から きんようび まで", roma: "getsuyoubi kara kinyoubi made", es: "de lunes a viernes" },
  { jp: "きょう から あした まで", roma: "kyou kara ashita made", es: "de hoy a mañana" },
  { jp: "がっこう から いえ まで", roma: "gakkou kara ie made", es: "de la escuela a la casa" },
  { jp: "はちじ から", roma: "hachi ji kara", es: "desde las 8" },
  { jp: "ごじ まで", roma: "go ji made", es: "hasta las 5" },
];

/* ---------- Explicación simple (arriba) ---------- */
const EXPLICACION = [
  "～じかん／～ふんかん: dice cuánto dura algo. 「かん」（間） = “duración”.",
  "Ej.: いちじかん（una hora）、さんじゅっぷんかん（30 minutos de duración）.",
  "「から」 = “desde…”. 「まで」 = “hasta…”. Juntas marcan un tramo de tiempo.",
  "Ej.: くじ から じゅうじ まで（de 9 a 10）.",
  "Diferencia: 「くじ に はじまります」 (momento exacto) vs. 「くじ から」 (inicio de tramo).",
];

/* ---------- Ejemplos con audio (TODO en HIRAGANA y reforzando ～かん) ---------- */
const ORACIONES: { jp: string; es: string }[] = [
  { jp: "べんきょう は にじかん します。", es: "Estudio por dos horas." },
  { jp: "うんどう は よんじゅっぷんかん します。", es: "Hago ejercicio por 40 minutos." },
  { jp: "テスト は さんじゅっぷんかん です。", es: "El examen dura 30 minutos." },
  { jp: "クラス は くじ から じゅうじ まで です。", es: "La clase es de 9 a 10." },
  { jp: "しごと は げつようび から きんようび まで です。", es: "El trabajo es de lunes a viernes." },
  { jp: "わたし は はちじ から はたらきます。", es: "Yo trabajo desde las 8." },
  { jp: "ミーティング は ごじ まで つづきます。", es: "La reunión continúa hasta las 5." },
  { jp: "アニメ を いちじかん みます。", es: "Veo anime por una hora." },
  { jp: "やすみ は きょう から あした まで です。", es: "El descanso es de hoy a mañana." },
  { jp: "ゲーム は にじかん はん しました。", es: "Jugué dos horas y media." },
  { jp: "どようび は さんじかん うたいます。", es: "El sábado canto por tres horas." },
  { jp: "しゅくだい は いっぷんかん では できません。", es: "La tarea no se puede hacer en un minuto (de duración)." },
];

/* ---------- Juegos (no usan kanji numéricos) ---------- */
type QA = { prompt: string; options: string[]; correct: string };

const QUIZ_DURACION: QA[] = [
  { prompt: "“2 horas” → elige la lectura", options: ["にじかん", "にじ", "にじゅっぷん"], correct: "にじかん" },
  { prompt: "“30 minutos (de duración)” → elige", options: ["さんじゅっぷん", "さんじゅっぷんかん", "さんぷんかん"], correct: "さんじゅっぷんかん" },
  { prompt: "“1 hora” → elige la lectura", options: ["いちじ", "いちじかん", "いっぷんかん"], correct: "いちじかん" },
  { prompt: "“10 minutos (de duración)” → elige", options: ["じゅっぷんかん", "じっぷん", "じゅうふんかん"], correct: "じゅっぷんかん" },
  { prompt: "“40 minutos (de duración)” → elige", options: ["よんじゅっぷん", "よんじゅっぷんかん", "よんぷんかん"], correct: "よんじゅっぷんかん" },
];

const QUIZ_KARA_MADE: QA[] = [
  { prompt: "Completa: クラス は くじ ___ じゅうじ ___ です。", options: ["から／まで", "に／まで", "から／に"], correct: "から／まで" },
  { prompt: "“desde las 8” → elige", options: ["はちじ に", "はちじ まで", "はちじ から"], correct: "はちじ から" },
  { prompt: "“hasta las 5” → elige", options: ["ごじ まで", "ごじ に", "ごじ から"], correct: "ごじ まで" },
  { prompt: "Completa: しごと は げつようび ___ きんようび ___ です。", options: ["から／まで", "に／に", "まで／から"], correct: "から／まで" },
  { prompt: "¿Cuál habla de tramo de tiempo?", options: ["くじ に はじまります", "くじ から はじまります", "くじ に おわります"], correct: "くじ から はじまります" },
];

/* ---------- Componente ---------- */
export default function B5_TiempoDuracion() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_TiempoDuracion";
  const ACHIEVEMENT_ID = "tiempo_duracion";
  const ACHIEVEMENT_TITLE = "Duración y límites N5";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  const { playCorrect, playWrong } = useFeedbackSounds();

  // hero aura
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

  // Anclas
  const svRef = useRef<ScrollView>(null);
  const [yVocab, setYVocab] = useState(0);
  const [yKanji, setYKanji] = useState(0);
  const [yEj, setYEj] = useState(0);
  const [yJuegos, setYJuegos] = useState(0);
  const scrollTo = (y: number) => svRef.current?.scrollTo({ y, animated: true });

  // Juegos (A y B)
  const [tab, setTab] = useState<"dur" | "km">("dur");

  const quizA = useMemo(() => shuffle(QUIZ_DURACION), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  const quizB = useMemo(() => shuffle(QUIZ_KARA_MADE), []);
  const [bIdx, setBIdx] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [bSel, setBSel] = useState<string | null>(null);
  const [bFlash, setBFlash] = useState<"ok" | "bad" | null>(null);
  const [bStarted, setBStarted] = useState(false);

  // logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState(0);
  const [hasAwarded, setHasAwarded] = useState(false);
  const giveAchievementOnce = useCallback(async () => {
    if (hasAwarded) return;
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL } });
    const res = await awardAchievement(ACHIEVEMENT_ID, { xp: 10, sub: ACHIEVEMENT_TITLE, meta: { screenKey: SCREEN_KEY, level: LEVEL } });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
    setHasAwarded(true);
  }, [hasAwarded]);

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

  // Zoom kanji
  const [zoomKanji, setZoomKanji] = useState<null | { k: keyof typeof KANJI_IMG }>(null);

  return (
    <>
      <ScrollView ref={svRef} contentContainerStyle={s.container}>
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />
          <View style={s.blob3} />
          <Animated.View style={[s.glowDot, { width: glowSize, height: glowSize }]} />
          <Text style={s.kicker}>BLOQUE 5 · N5</Text>
          <Text style={s.title}>じかん（～かん）・から・まで</Text>
          <Text style={s.subtitle}>Di cuánto dura algo y expresa “desde… hasta…”, todo en hiragana.</Text>

          <View style={s.heroButtons}>
            <FancyHeroButton label="Vocab" icon="sparkles" tone="mint" onPress={() => scrollTo(yVocab)} />
            <FancyHeroButton label="Trazos" icon="brush" tone="violet" onPress={() => scrollTo(yKanji)} />
            <FancyHeroButton label="Ejemplos" icon="musical-notes" tone="amber" onPress={() => scrollTo(yEj)} />
            <FancyHeroButton label="Juegos" icon="game-controller" tone="mint" onPress={() => scrollTo(yJuegos)} />
          </View>
        </View>

        {/* EXPLICACIÓN BÁSICA */}
        <Section title="Explicación básica (muy fácil)" tint="violet">
          {EXPLICACION.map((t, i) => <Info key={i}>{t}</Info>)}
        </Section>

        {/* VOCABULARIO */}
        <View onLayout={(e) => setYVocab(e.nativeEvent.layout.y - 12)}>
          <Section title="Vocabulario — Duración（～じかん／～ふんかん）" tint="mint">
            <Text style={{ color: WHITE, marginBottom: 6 }}>
              <Text style={{ fontWeight: "900" }}>～じかん／～ふんかん</Text> indica cuánto dura algo.{" "}
              <Text style={{ fontWeight: "900" }}>「かん」</Text> señala “duración”.
            </Text>
            <CardGrid>
              {DUR_HORAS.map((x, i) => (
                <VocabCard key={`h-${i}`} title={x.jp} sub={`${x.roma} — ${x.es}`} onSpeak={() => speakJP(x.jp)} />
              ))}
              {DUR_MIN.map((x, i) => (
                <VocabCard key={`m-${i}`} title={x.jp} sub={`${x.roma} — ${x.es}`} onSpeak={() => speakJP(x.jp)} />
              ))}
            </CardGrid>
          </Section>

          <Section title="Vocabulario — Tramo “desde / hasta”（から／まで）" tint="mint">
            <CardGrid>
              {LIMITES.map((x, i) => (
                <VocabCard key={`l-${i}`} title={x.jp} sub={`${x.roma} — ${x.es}`} onSpeak={() => speakJP(x.jp)} />
              ))}
            </CardGrid>
          </Section>
        </View>

        {/* KANJI TRAZOS (間) — Fondo BLANCO + explicación kun/on */}
        <View onLayout={(e) => setYKanji(e.nativeEvent.layout.y - 12)}>
          <Section title="Trazos del kanji（間）· Lecturas" tint="mint">
            <Text style={s.kExplain}>
              El recuadro es <Text style={{ fontWeight: "900", color: WHITE }}>blanco</Text> para que los trazos se vean nítidos.{"\n"}
              Lecturas: <Text style={{ fontWeight: "900", color: WHITE }}>くんよみ</Text>: あいだ（entre/intervalo）.{"\n"}
              <Text style={{ fontWeight: "900", color: WHITE }}>おんよみ</Text>: かん（duración: ～じかん／～ふんかん）.{"\n"}
              <Text style={{ fontWeight: "900", color: WHITE }}>En esta unidad usamos sobre todo 「かん」</Text> como sufijo de duración.
            </Text>

            <View style={s.kanjiGrid}>
              <View style={s.kanjiCard}>
                <Pressable onPress={() => setZoomKanji({ k: "間" })}>
                  <View style={s.kanjiImgWrap}>
                    <Image source={KANJI_IMG["間"]} style={s.kanjiImg} resizeMode="contain" />
                  </View>
                </Pressable>
                <View style={s.kanjiRow}>
                  <Text style={s.kanjiTxt}>間</Text>
                  <Pressable style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]} onPress={() => speakJP(KANJI_INFO["間"].yomi)}>
                    <Ionicons name="volume-high" size={16} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={s.kanjiReadingSmall}>よみかた: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO["間"].yomi}</Text></Text>
                <Text style={s.kanjiMeaning}>いみ: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO["間"].es}</Text></Text>
                <Text style={s.kanjiNote}>{KANJI_INFO["間"].note}</Text>
              </View>
            </View>
          </Section>
        </View>

        {/* EJEMPLOS (con audio, en HIRAGANA) */}
        <View onLayout={(e) => setYEj(e.nativeEvent.layout.y - 12)}>
          <Section title="Ejemplos con audio" tint="pink">
            <View style={s.examplesList}>
              {ORACIONES.map((ex, i) => (
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
        </View>

        {/* JUEGOS */}
        <View onLayout={(e) => setYJuegos(e.nativeEvent.layout.y - 12)}>
          <View style={s.tabsRow}>
            <TabBtn label="よみ（～かん）" active={tab === "dur"} onPress={() => setTab("dur")} icon="time" />
            <TabBtn label="から／まで" active={tab === "km"} onPress={() => setTab("km")} icon="swap-horizontal" />
          </View>

          {/* Juego A: duraciones */}
          {tab === "dur" && (
            <>
              {!aStarted && aIdx === 0 && aScore === 0 && (
                <PlayCard
                  title="アクティビティ A: じかん／ふんかん"
                  desc="Elige la lectura correcta de cada duración. Todo en hiragana."
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

          {/* Juego B: から／まで */}
          {tab === "km" && (
            <>
              {!bStarted && bIdx === 0 && bScore === 0 && (
                <PlayCard
                  title="アクティビティ B: から／まで"
                  desc="Elige correctamente para marcar el tramo de tiempo."
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
        </View>
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

      {/* Modal zoom kanji (fondo BLANCO) */}
      <Modal animationType="fade" transparent visible={!!zoomKanji} onRequestClose={() => setZoomKanji(null)}>
        <View style={s.zoomBackdrop}>
          <View style={s.zoomCard}>
            {zoomKanji && (
              <>
                <View style={s.zoomImgWrap}>
                  <Image source={KANJI_IMG[zoomKanji.k]} style={s.zoomImg} resizeMode="contain" />
                </View>
                <View style={s.zoomRow}>
                  <Text style={s.zoomTitle}>{zoomKanji.k}・{KANJI_INFO[zoomKanji.k].yomi}</Text>
                  <Pressable style={[s.ttsBtn, { backgroundColor: "#FDE68A" }]} onPress={() => speakJP(KANJI_INFO[zoomKanji.k].yomi)}>
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={[s.kanjiMeaning, { marginTop: 4 }]}>
                  いみ: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO[zoomKanji.k].es}</Text>
                </Text>
                <Pressable onPress={() => setZoomKanji(null)} style={s.zoomCloseBtn}>
                  <Ionicons name="close" size={18} color={INK_DARK} />
                  <Text style={s.zoomCloseTxt}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------- Subcomponentes UI ---------- */
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
const CardGrid = ({ children }: { children: React.ReactNode }) => (<View style={s.grid}>{children}</View>);
const Info = ({ children }: { children: React.ReactNode }) => (<Text style={s.infoLine}>• <Text style={{ color: WHITE }}>{children}</Text></Text>);
const Chip = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark"; label: string }) => (
  <View style={stylesChip.chip}><Ionicons name={icon as any} size={14} color={INK_DARK} /><Text style={stylesChip.txt}>{label}</Text></View>
);
const HeaderRow = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (<View style={s.rowBetween}>{left}{right}</View>);
const Prompt = ({ children }: { children: React.ReactNode }) => (<View style={s.promptWrap}><Text style={s.prompt}>{children}</Text></View>);
function Options({ options, chosen, correct, onChoose }:{ options: string[]; chosen: string | null; correct: string; onChoose: (o: string) => void }) {
  return (
    <View style={s.optionsGrid}>
      {options.map((opt, i) => {
        const chosenNow = chosen !== null && chosen === opt;
        const isRight = chosen !== null && opt === correct;
        return (
          <Pressable key={`${i}-${opt}`} onPress={() => onChoose(opt)} style={({ pressed }) => [
            s.option, pressed && s.optionPressed, chosenNow && s.optionChosen, isRight && s.optionRight, chosen && !isRight && chosenNow && s.optionWrong,
          ]}>
            <Text style={s.optionTxt}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const TabBtn = ({ label, active, onPress, icon }:{
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "time" | "swap-horizontal";
}) => (
  <Pressable onPress={onPress} style={[s.tabBtn, active && s.tabActive]}>
    <Ionicons name={icon as any} size={14} color={active ? INK_DARK : "#E5E7EB"} />
    <Text style={[s.tabTxt, active && s.tabTxtActive]}>{label}</Text>
  </Pressable>
);
const PlayCard = ({ title, desc, cta, onPress, tone }:{
  title: string; desc: string; cta: string; onPress: () => void; tone: "mint" | "amber";
}) => {
  const bg = tone === "mint" ? "rgba(167,243,208,0.12)" : "rgba(253,230,138,0.12)";
  const border = tone === "mint" ? "#34D399" : "#F59E0B";
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
  <View style={[s.gameCard, flash === "ok" ? { borderColor: MINT, shadowColor: MINT } : flash === "bad" ? { borderColor: ROSE, shadowColor: ROSE } : null]}>{children}</View>
);
const SummaryCard = ({ title, list }:{ title: string; list: { icon: keyof typeof Ionicons.glyphMap | "star" | "book"; text: string }[] }) => (
  <View style={s.playCard}>
    <View style={s.cardHeaderRow}><Ionicons name="ribbon" size={18} color={WHITE} /><Text style={s.h}>{title}</Text></View>
    <View style={s.summaryRow}>{list.map((it, i) => (<View key={i} style={stylesChip.chip}><Ionicons name={it.icon as any} size={14} color={INK_DARK} /><Text style={stylesChip.txt}>{it.text}</Text></View>))}</View>
  </View>
);

/* ---------- Estilos ---------- */
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

  heroButtons: { flexDirection: "row", gap: 10, marginTop: 14 },

  section: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  badge: { width: 10, height: 10, borderRadius: 999 },
  sectionTitle: { fontWeight: "900", fontSize: 16 },

  infoLine: { marginTop: 6, color: "#93C5FD" },

  grid: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  vcard: { width: "48%", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: STROKE, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  vTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  vSub: { marginTop: 4, color: WHITE, opacity: 0.9, fontSize: 12 },

  kExplain: { color: WHITE, marginTop: 2, lineHeight: 20 },

  kanjiGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  kanjiCard: { width: "100%", backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, padding: 10 },
  kanjiImgWrap: { width: "100%", height: 200, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  kanjiImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  kanjiRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kanjiTxt: { fontSize: 22, fontWeight: "900", color: WHITE },
  kanjiReadingSmall: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiMeaning: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiNote: { marginTop: 4, color: "#C7D2FE", fontSize: 12 },

  examplesList: { marginTop: 8, gap: 12 },
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

  zoomBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  zoomCard: { width: "100%", maxWidth: 420, backgroundColor: "#0f172a", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  zoomImgWrap: { width: "100%", height: 360, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  zoomImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  zoomRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  zoomTitle: { fontSize: 18, fontWeight: "900", color: WHITE },
  zoomCloseBtn: { marginTop: 12, alignSelf: "center", backgroundColor: "#A7F3D0", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  zoomCloseTxt: { color: INK_DARK, fontWeight: "900" },
});

const stylesChip = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDE68A", borderWidth: 0, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  txt: { fontSize: 12, color: "#0b1020", fontWeight: "900" },
});

/* ---------- Hero Buttons ---------- */
function FancyHeroButton({ label, icon, tone, onPress }:{
  label: string; icon: keyof typeof Ionicons.glyphMap | "sparkles" | "brush" | "musical-notes" | "game-controller";
  tone: "mint" | "violet" | "amber"; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  const bg = tone === "mint" ? ["rgba(167,243,208,0.95)"] : tone === "violet" ? ["rgba(221,214,254,0.95)"] : ["rgba(253,230,138,0.95)"];
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}
        style={({ pressed }) => [s.fancyBtn, { backgroundColor: bg[0], borderColor: "rgba(0,0,0,0.08)", opacity: pressed ? 0.95 : 1 }]}>
        <View style={s.fancyBtnGlow} />
        <Ionicons name={icon as any} size={16} color={INK_DARK} />
        <Text style={s.fancyBtnTxt}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
Object.assign(s, {
  fancyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  fancyBtnGlow: { position: "absolute", inset: 0, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  fancyBtnTxt: { color: INK_DARK, fontWeight: "900", letterSpacing: 0.3, fontSize: 13 },
});
