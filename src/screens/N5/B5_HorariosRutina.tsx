// src/screens/N5/B5_HorariosRutina.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_HorariosRutina — Horarios y rutina diaria (N5)
 * - Explicación clara (に para la hora; verbo al final; ます = hábito/presente o futuro cercano)
 * - Vocabulario de acciones + TTS
 * - Ejemplos con TTS
 * - 2 minijuegos
 * - Sección de 10 KANJI con trazos blancos (fondo blanco), ON/KUN, significado y TTS
 * - Logro y XP al completar
 *
 * Genera las imágenes de kanji (trazo blanco):
 *   時(6642) 分(5206) 半(534a) 前(524d) 後(5f8c) 朝(671d) 昼(663c) 夕(5915) 夜(591c) 週(9031)
 *
 * Comando:
 *   node scripts/make_kanji_webp.js --level n5 --suffix nums --stroke=white 6642 5206 534a 524d 5f8c 671d 663c 5915 591c 9031
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

/* ============== Explicación básica (arriba) ============== */
const EXPLICACION = [
  "Usamos に con la hora para decir CUÁNDO pasa algo: ７じ に おきます。",
  "El verbo en japonés va al FINAL de la oración: わたし は ６じ に おきます。",
  "La forma ます expresa hábito (presente) y también futuro cercano según el contexto.",
  "Para rutina diaria, combina: momento + (lugar で) + objeto を + verbo ます。",
  "Ej.: ７じ に あさごはん を たべます。 １０じ はん に ねます。",
];

/* ============== Vocabulario (rutina) ============== */
type VItem = { jp: string; roma: string; es: string };
const VOCAB: VItem[] = [
  { jp: "おきます", roma: "okimasu", es: "despertarse / levantarse" },
  { jp: "ねます", roma: "nemasu", es: "dormir / acostarse" },
  { jp: "たべます", roma: "tabemasu", es: "comer" },
  { jp: "のみます", roma: "nomimasu", es: "beber" },
  { jp: "べんきょう します", roma: "benkyou shimasu", es: "estudiar" },
  { jp: "はたらきます", roma: "hatarakimasu", es: "trabajar" },
  { jp: "いきます", roma: "ikimasu", es: "ir" },
  { jp: "かえります", roma: "kaerimasu", es: "volver / regresar" },
  { jp: "シャワー を あびます", roma: "shawā o abimasu", es: "ducharse" },
  { jp: "は を みがきます", roma: "ha o migakimasu", es: "lavarse los dientes" },
  { jp: "テレビ を みます", roma: "terebi o mimasu", es: "ver la tele" },
  { jp: "うんどう します", roma: "undō shimasu", es: "hacer ejercicio" },
];

/* ============== Ejemplos con TTS ============== */
const EJEMPLOS: { jp: string; es: string }[] = [
  { jp: "わたし は ６じ に おきます。", es: "Yo me levanto a las 6." },
  { jp: "７じ に あさごはん を たべます。", es: "A las 7 desayuno." },
  { jp: "８じ に べんきょう します。", es: "A las 8 estudio." },
  { jp: "１２じ に ひるごはん を たべます。", es: "A las 12 como (almuerzo)." },
  { jp: "３じ に テレビ を みます。", es: "A las 3 veo la tele." },
  { jp: "７じ に うんどう します。", es: "A las 7 hago ejercicio." },
  { jp: "９じ に シャワー を あびます。", es: "A las 9 me ducho." },
  { jp: "１０じ はん に ねます。", es: "A las 10 y media me duermo." },
];

/* ============== Juegos ============== */
// A) “¿Qué haces a…?” → elige la acción correcta
type QA = { prompt: string; options: string[]; correct: string };
const QUIZ_A: QA[] = [
  { prompt: "６じ に ……？", options: ["おきます", "ねます", "シャワー を あびます"], correct: "おきます" },
  { prompt: "７じ に ……？", options: ["たべます", "はたらきます", "かえります"], correct: "たべます" },
  { prompt: "１２じ に ……？", options: ["のみます", "たべます", "ねます"], correct: "たべます" },
  { prompt: "３じ に ……？", options: ["テレビ を みます", "は を みがきます", "うんどう します"], correct: "テレビ を みます" },
  { prompt: "１０じ はん に ……？", options: ["ねます", "いきます", "べんきょう します"], correct: "ねます" },
];

// B) “Completa la rutina” → elige el final correcto para la frase
const QUIZ_B: QA[] = [
  { prompt: "８じ に ……", options: ["べんきょう します", "かえります", "ねます"], correct: "べんきょう します" },
  { prompt: "７じ に ……", options: ["あさごはん を たべます", "テレビ を みます", "シャワー を あびます"], correct: "あさごはん を たべます" },
  { prompt: "９じ に ……", options: ["シャワー を あびます", "は を みがきます", "うんどう します"], correct: "シャワー を あびます" },
  { prompt: "６じ に ……", options: ["おきます", "ねます", "かえります"], correct: "おきます" },
  { prompt: "７じ に ……", options: ["うんどう します", "べんきょう します", "かえります"], correct: "うんどう します" },
];

/* ============== KANJI (10) con trazos blancos ============== */
const KANJI_IMG = {
  時: require("../../../assets/kanjivg/n5/6642_nums.webp"), // tiempo / hora
  分: require("../../../assets/kanjivg/n5/5206_nums.webp"), // minuto / dividir
  半: require("../../../assets/kanjivg/n5/534a_nums.webp"), // mitad / y media
  前: require("../../../assets/kanjivg/n5/524d_nums.webp"), // antes
  後: require("../../../assets/kanjivg/n5/5f8c_nums.webp"), // después
  朝: require("../../../assets/kanjivg/n5/671d_nums.webp"), // mañana (temprano)
  昼: require("../../../assets/kanjivg/n5/663c_nums.webp"), // mediodía/día
  夕: require("../../../assets/kanjivg/n5/5915_nums.webp"), // tarde (atardecer)
  夜: require("../../../assets/kanjivg/n5/591c_nums.webp"), // noche
  週: require("../../../assets/kanjivg/n5/9031_nums.webp"), // semana
} as const;

type KanjiMeta = { on: string[]; kun: string[]; es: string; note?: string };
const KANJI_INFO: Record<keyof typeof KANJI_IMG, KanjiMeta> = {
  時: { on: ["ジ"], kun: ["とき"], es: "hora / tiempo", note: "７じ（しちじ）= las 7" },
  分: { on: ["ブン","フン","プン"], kun: ["わ(ける)"], es: "minuto / dividir", note: "５ふん, １０ぷん" },
  半: { on: ["ハン"], kun: [], es: "mitad / y media", note: "〜じ はん = y media" },
  前: { on: ["ゼン"], kun: ["まえ"], es: "antes / delante", note: "ごぜん = a.m." },
  後: { on: ["ゴ","コウ"], kun: ["あと","うし(ろ)"], es: "después / atrás", note: "ごご = p.m." },
  朝: { on: [], kun: ["あさ"], es: "mañana (temprano)", note: "あさごはん = desayuno" },
  昼: { on: [], kun: ["ひる"], es: "mediodía/día", note: "ひるごはん = comida" },
  夕: { on: ["セキ"], kun: ["ゆう"], es: "tarde (atardecer)", note: "ゆうごはん = cena (coloquial: ばんごはん)" },
  夜: { on: ["ヤ"], kun: ["よる"], es: "noche", note: "よる = noche" },
  週: { on: ["シュウ"], kun: [], es: "semana", note: "まいしゅう = cada semana" },
};

/* ============== Componente principal ============== */
export default function B5_HorariosRutina() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_HorariosRutina";
  const ACHIEVEMENT_ID = "rutina_horarios_n5";
  const ACHIEVEMENT_TITLE = "Rutinas y horarios N5";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  const { playCorrect, playWrong } = useFeedbackSounds();

  // hero animación
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
  const [tab, setTab] = useState<"acciones" | "ejemplos">("acciones");

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
          <Text style={s.title}>Horarios y rutina diaria</Text>
          <Text style={s.subtitle}>Di qué haces y a qué hora, con oraciones claras y audio.</Text>
        </View>

        {/* EXPLICACIÓN */}
        <Section title="Explicación básica（やさしい）" tint="violet">
          {EXPLICACION.map((t, i) => (
            <Text key={i} style={s.infoLine}>• <Text style={{ color: WHITE }}>{t}</Text></Text>
          ))}
        </Section>

        {/* VOCABULARIO — acciones */}
        <Section title="Vocabulario: acciones de rutina（音声つき）" tint="mint">
          <View style={s.grid}>
            {VOCAB.map((v, i) => (
              <VocabCard
                key={i}
                title={v.jp}
                sub={`${v.roma} — ${v.es}`}
                onSpeak={() => speakJP(v.jp)}
              />
            ))}
          </View>
        </Section>

        {/* KANJI DE RUTINA (trazos blancos) */}
        <Section title="Trazos y lecturas — Kanji de rutina" tint="mint">
          <Text style={s.kExplain}>
            Recuadro <Text style={{ fontWeight: "900", color: WHITE }}>blanco</Text> para ver bien los trazos en blanco.{"\n"}
            <Text style={{ fontWeight: "900", color: WHITE }}>おんよみ（ON）</Text> = lectura “china” / compuestos.{"  "}
            <Text style={{ fontWeight: "900", color: WHITE }}>くんよみ（KUN）</Text> = lectura nativa japonesa.
          </Text>
          <View style={s.kanjiGrid}>
            {(Object.keys(KANJI_IMG) as (keyof typeof KANJI_IMG)[]).map((k) => (
              <View key={k} style={s.kanjiCard}>
                <View style={s.kanjiImgWrap}>
                  <Image source={KANJI_IMG[k]} style={s.kanjiImg} resizeMode="contain" />
                </View>
                <View style={s.kanjiRow}>
                  <Text style={s.kanjiBig}>{k}</Text>
                  <Pressable
                    style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]}
                    onPress={() => speakJP([...(KANJI_INFO[k].kun ?? []), ...(KANJI_INFO[k].on ?? [])].join("、"))}
                  >
                    <Ionicons name="volume-high" size={16} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={s.kanjiLine}><Text style={s.bold}>ON:</Text> {KANJI_INFO[k].on.join("・") || "—"}</Text>
                <Text style={s.kanjiLine}><Text style={s.bold}>KUN:</Text> {KANJI_INFO[k].kun.join("・") || "—"}</Text>
                <Text style={s.kanjiLine}><Text style={s.bold}>Significado:</Text> {KANJI_INFO[k].es}</Text>
                {!!KANJI_INFO[k].note && <Text style={s.kanjiNote}>{KANJI_INFO[k].note}</Text>}
              </View>
            ))}
          </View>
        </Section>

        {/* EJEMPLOS CON AUDIO */}
        <Section title="Ejemplos con audio（に + hora + verbo）" tint="pink">
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
          <TabBtn label="¿Qué haces a…?" active={tab === "acciones"} onPress={() => setTab("acciones")} icon="time" />
          <TabBtn label="Completa la rutina" active={tab === "ejemplos"} onPress={() => setTab("ejemplos")} icon="pencil" />
        </View>

        {/* Juego A */}
        {tab === "acciones" && (
          <>
            {!aStarted && aIdx === 0 && aScore === 0 && (
              <PlayCard
                title="アクティビティ A: ¿Qué haces a…？"
                desc="Elige la acción que mejor combina con la hora dada."
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
                title="アクティビティ B: Completa la rutina"
                desc="Elige el final correcto para la frase (に + hora + ...)."
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

/* ============== Subcomponentes UI ============== */
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
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "time" | "pencil";
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

/* ============== Estilos ============== */
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

  kExplain: { color: WHITE, marginTop: 2, lineHeight: 20 },
  kanjiGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  kanjiCard: { width: "48%", backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, padding: 10 },
  kanjiImgWrap: { width: "100%", height: 160, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden" },
  kanjiImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  kanjiRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kanjiBig: { fontSize: 22, fontWeight: "900", color: WHITE },
  kanjiLine: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiNote: { marginTop: 4, color: "#C7D2FE", fontSize: 12 },

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
