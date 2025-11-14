// src/screens/N5/B5_Contadores.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, LayoutChangeEvent, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación (XP y logros)
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_Contadores — Clasificadores básicos (N5)
 * – Botones bonitos (8 básicos, TTS, 2 juegos)
 * – Sección: Trazos de los kanji (orden) con WebP (trazo BLANCO)
 *   Genera las imágenes con blanco:
 *   node scripts/make_kanji_webp.js --level n5 --suffix nums --stroke white 4eba 679a 672c 5339 53f0 518a 56de 500b
 */

type QA = { prompt: string; options: string[]; correct: string };
type VocabItem = { contador: string; lectura: string; uso: string; icon: keyof typeof Ionicons.glyphMap | "pricetags"; ejemplos: { jp: string; es: string }[] };

const PAPER = "#0b1020";
const WHITE = "#FFFFFF";
const INK_DARK = "#0b1020";
const VIOLET = "#8B5CF6";
const MINT = "#34D399";
const PINK = "#EC4899";
const AMBER = "#F59E0B";
const CARD = "rgba(255,255,255,0.08)";
const STROKE = "rgba(255,255,255,0.14)";
const GOLD = "#F2C94C";
const ROSE = "#FB7185";

/* ----------------- helpers ----------------- */
function speakJP(text: string) {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
}
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ----------------- KANJI IMÁGENES (WebP estáticos, trazo BLANCO) ----------------- */
const KANJI_IMG = {
  "人": require("../../../assets/kanjivg/n5/4eba_nums.webp"),
  "枚": require("../../../assets/kanjivg/n5/679a_nums.webp"),
  "本": require("../../../assets/kanjivg/n5/672c_nums.webp"),
  "匹": require("../../../assets/kanjivg/n5/5339_nums.webp"),
  "台": require("../../../assets/kanjivg/n5/53f0_nums.webp"),
  "冊": require("../../../assets/kanjivg/n5/518a_nums.webp"),
  "回": require("../../../assets/kanjivg/n5/56de_nums.webp"),
  "個": require("../../../assets/kanjivg/n5/500b_nums.webp"),
} as const;

const KANJI_READ = {
  "人": "ひと",
  "枚": "まい",
  "本": "ほん",
  "匹": "ひき",
  "台": "だい",
  "冊": "さつ",
  "回": "かい",
  "個": "こ",
} as const;

const KANJI_MEAN = {
  "人": "persona",
  "枚": "lámina/hoja (plano)",
  "本": "objeto alargado (botella, lápiz)",
  "匹": "animal pequeño",
  "台": "máquina/vehículo",
  "冊": "volumen/libro/cuaderno",
  "回": "vez/ocasión",
  "個": "pieza/unidad",
} as const;

/* ----------------- datos ----------------- */
const CONTADORES: VocabItem[] = [
  { contador: "人", lectura: "にん（ひとり／ふたり 特別）", uso: "personas", icon: "people",
    ejemplos: [{ jp: "りょこうしゃ が 二人 います。", es: "Hay dos viajeros." }, { jp: "クラス に 三人 います。", es: "En la clase hay tres personas." }] },
  { contador: "枚", lectura: "まい", uso: "cosas planas (hojas, tickets, platos)", icon: "albums",
    ejemplos: [{ jp: "かみ を 三枚 ください。", es: "Tres hojas de papel, por favor." }, { jp: "チケット を 二枚 かいます。", es: "Compro dos boletos." }] },
  { contador: "本", lectura: "ほん／ぼん／ぽん", uso: "cosas alargadas (lápices, botellas, paraguas)", icon: "flash",
    ejemplos: [{ jp: "えんぴつ が 二本 あります。", es: "Hay dos lápices." }, { jp: "ペットボトル を 三本 かいます。", es: "Compro tres botellas." }] },
  { contador: "匹", lectura: "ひき／びき／ぴき", uso: "animales pequeños (gatos, perros, peces)", icon: "paw",
    ejemplos: [{ jp: "ねこ が 二匹 います。", es: "Hay dos gatos." }, { jp: "さかな を 三匹 かいます。", es: "Compro tres peces." }] },
  { contador: "台", lectura: "だい", uso: "máquinas/vehículos (coches, compus)", icon: "car",
    ejemplos: [{ jp: "くるま が 一台 あります。", es: "Hay un coche." }, { jp: "パソコン を 二台 もちます。", es: "Tengo dos computadoras." }] },
  { contador: "冊", lectura: "さつ", uso: "libros/cuadernos", icon: "book",
    ejemplos: [{ jp: "ほん を 三冊 よみます。", es: "Leo tres libros." }, { jp: "ノート を 二冊 かいました。", es: "Compré dos cuadernos." }] },
  { contador: "回", lectura: "かい", uso: "veces/ocasiones", icon: "refresh",
    ejemplos: [{ jp: "いっしゅうかん に 二回 うんどうします。", es: "Hago ejercicio dos veces por semana." }, { jp: "そのえいが を 三回 みました。", es: "Vi esa película tres veces." }] },
  { contador: "個", lectura: "こ", uso: "piezas/unidades pequeñas (manzanas, huevos)", icon: "pricetags",
    ejemplos: [{ jp: "りんご を 二個 ください。", es: "Dos manzanas, por favor." }, { jp: "たまご を 六個 かいます。", es: "Compro seis huevos." }] },
];

const LECTURAS: Record<string, string[]> = {
  人: ["ひとり", "ふたり", "さんにん", "よにん", "ごにん"],
  本: ["いっぽん", "にほん", "さんぼん", "よんほん", "ごほん"],
  匹: ["いっぴき", "にひき", "さんびき", "よんひき", "ごひき"],
  枚: ["いちまい", "にまい", "さんまい", "よんまい", "ごまい"],
  台: ["いちだい", "にだい", "さんだい", "よんだい", "ごだい"],
  冊: ["いっさつ", "にさつ", "さんさつ", "よんさつ", "ごさつ"],
  回: ["いっかい", "にかい", "さんかい", "よんかい", "ごかい"],
  個: ["いっこ", "にこ", "さんこ", "よんこ", "ごこ"],
};

const ORACIONES_15: { jp: string; es: string }[] = [
  { jp: "わたし は りんご を 二個 かいます。", es: "Compro dos manzanas." },
  { jp: "えんぴつ を 三本 もっています。", es: "Tengo tres lápices." },
  { jp: "ねこ が 二匹 います。", es: "Hay dos gatos." },
  { jp: "ノート を 二冊 かいました。", es: "Compré dos cuadernos." },
  { jp: "くるま が 一台 あります。", es: "Hay un coche." },
  { jp: "チケット を 二枚 ください。", es: "Dos boletos, por favor." },
  { jp: "この ほん を 三冊 よみます。", es: "Leeré (leo) tres libros de este." },
  { jp: "ペットボトル を 三本 かいます。", es: "Compro tres botellas." },
  { jp: "いっしゅうかん に 二回 うんどうします。", es: "Hago ejercicio dos veces por semana." },
  { jp: "りょこうしゃ は 三人 です。", es: "Somos tres viajeros." },
  { jp: "たまご を 六個 ください。", es: "Seis huevos, por favor." },
  { jp: "いぬ が 一匹 います。", es: "Hay un perro." },
  { jp: "スマホ を 二台 もちます。", es: "Tengo dos celulares." },
  { jp: "しゃしん を 五枚 とりました。", es: "Tomé cinco fotos." },
  { jp: "その えいが を 三回 みました。", es: "Vi esa película tres veces." },
];

/* ----------------- Juegos ----------------- */
const QUIZ_CONTADOR: QA[] = [
  { prompt: "“dos gatos” → ¿qué contador?", options: ["枚", "匹", "台", "回"], correct: "匹" },
  { prompt: "“tres botellas” → ¿qué contador?", options: ["本", "人", "冊", "個"], correct: "本" },
  { prompt: "“cinco fotos” → ¿qué contador?", options: ["枚", "回", "匹", "冊"], correct: "枚" },
  { prompt: "“dos computadoras” → ¿qué contador?", options: ["台", "冊", "本", "回"], correct: "台" },
  { prompt: "“tres libros” → ¿qué contador?", options: ["冊", "枚", "人", "個"], correct: "冊" },
  { prompt: "“cuatro personas” → ¿qué contador?", options: ["人", "匹", "回", "台"], correct: "人" },
  { prompt: "“seis huevos” → ¿qué contador?", options: ["個", "本", "台", "冊"], correct: "個" },
  { prompt: "“dos veces por semana” → ¿qué contador?", options: ["回", "枚", "冊", "人"], correct: "回" },
  { prompt: "“un perro” → ¿qué contador?", options: ["匹", "個", "人", "冊"], correct: "匹" },
  { prompt: "“dos lápices” → ¿qué contador?", options: ["本", "冊", "個", "回"], correct: "本" },
];

const QUIZ_LECTURAS: QA[] = [
  { prompt: "“dos perros (匹)” → elige lectura", options: ["にひき", "にびき", "にぴき", "にかい"], correct: "にひき" },
  { prompt: "“tres botellas (本)” → elige lectura", options: ["さんぼん", "さんほん", "さんぽん", "さんまい"], correct: "さんぼん" },
  { prompt: "“dos botellas (本)” → elige lectura", options: ["にほん", "にぼん", "にぽん", "にこ"], correct: "にほん" },
  { prompt: "“un animal (匹)” → elige lectura", options: ["いっぴき", "いちひき", "いちびき", "いちまい"], correct: "いっぴき" },
  { prompt: "“tres hojas (枚)” → elige lectura", options: ["さんまい", "さんこ", "さんだい", "さんかい"], correct: "さんまい" },
  { prompt: "“dos libros (冊)” → elige lectura", options: ["にさつ", "にしょ", "にほん", "にだい"], correct: "にさつ" },
  { prompt: "“cinco personas (人)” → elige lectura", options: ["ごにん", "ごひと", "ごじん", "ごかい"], correct: "ごにん" },
  { prompt: "“tres unidades (個)” → elige lectura", options: ["さんこ", "さんにん", "さんぼん", "さんびき"], correct: "さんこ" },
  { prompt: "“una vez (回)” → elige lectura", options: ["いっかい", "いちかい", "いちまい", "いっこ"], correct: "いっかい" },
  { prompt: "“cuatro lápices (本)” → elige lectura", options: ["よんほん", "よんぼん", "よんぽん", "よんこ"], correct: "よんほん" },
];

/* ----------------- componente ----------------- */
export default function B5_Contadores() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_Contadores";
  const ACHIEVEMENT_ID = "contadores_basicos";
  const ACHIEVEMENT_TITLE = "Contadores básicos N5";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Anim hero
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: false }),
    ])).start();
  }, [glow]);
  const glowSize = glow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] });

  // Scroll y anclas
  const svRef = useRef<ScrollView>(null);
  const [yVocab, setYVocab] = useState(0);
  const [yExamples, setYExamples] = useState(0);
  const [yGames, setYGames] = useState(0);
  const [yKanji, setYKanji] = useState(0);
  const onLayoutVocab = (e: LayoutChangeEvent) => setYVocab(e.nativeEvent.layout.y - 12);
  const onLayoutExamples = (e: LayoutChangeEvent) => setYExamples(e.nativeEvent.layout.y - 12);
  const onLayoutGames = (e: LayoutChangeEvent) => setYGames(e.nativeEvent.layout.y - 12);
  const onLayoutKanji = (e: LayoutChangeEvent) => setYKanji(e.nativeEvent.layout.y - 12);
  const scrollTo = (y: number) => svRef.current?.scrollTo({ y, animated: true });

  // Tabs juegos
  const [activeTab, setActiveTab] = useState<"contador" | "lecturas">("contador");

  // Quiz A
  const quizA = useMemo(() => shuffle(QUIZ_CONTADOR).slice(0, 10), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  // Quiz B
  const quizB = useMemo(() => shuffle(QUIZ_LECTURAS).slice(0, 10), []);
  const [bIdx, setBIdx] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [bSel, setBSel] = useState<string | null>(null);
  const [bFlash, setBFlash] = useState<"ok" | "bad" | null>(null);
  const [bStarted, setBStarted] = useState(false);

  // Logro modal
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);
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
    const cur = quizA[aIdx];
    const ok = opt === cur.correct;
    setASel(opt);
    if (ok) { setAScore(s => s + 100); setAFlash("ok"); await playCorrect(); }
    else { setAFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setAFlash(null); setASel(null);
      if (aIdx + 1 < quizA.length) setAIdx(i => i + 1);
      else { setAStarted(false); endIfBothDone(); }
    }, 600);
  };

  const answerB = async (opt: string) => {
    if (bSel !== null) return;
    const cur = quizB[bIdx];
    const ok = opt === cur.correct;
    setBSel(opt);
    if (ok) { setBScore(s => s + 100); setBFlash("ok"); await playCorrect(); }
    else { setBFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setBFlash(null); setBSel(null);
      if (bIdx + 1 < quizB.length) setBIdx(i => i + 1);
      else { setBStarted(false); endIfBothDone(); }
    }, 600);
  };

  // Modal de zoom de kanji
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
          <Text style={s.title}>Contadores（助数詞）</Text>
          <Text style={s.subtitle}>Cuenta como nativo: número + contador. ¡Escucha y juega!</Text>

          <View style={s.heroButtons}>
            <FancyHeroButton label="8 básicos" icon="sparkles" gradient="mint" onPress={() => scrollTo(yVocab)} />
            <FancyHeroButton label="TTS" icon="musical-notes" gradient="violet" onPress={() => scrollTo(yExamples)} />
            <FancyHeroButton label="2 juegos" icon="game-controller" gradient="amber" onPress={() => { scrollTo(yGames); setActiveTab("contador"); }} />
          </View>
        </View>

        {/* EXPLICACIÓN */}
        <Section title="Explicación básica (super fácil)" tint="violet">
          <InfoLine>En japonés usamos <Kbd>contadores</Kbd> para diferentes cosas.</InfoLine>
          <InfoLine>Se dice: <Kbd>número + contador</Kbd>. Ej.: <Kbd>二枚</Kbd> (dos hojas), <Kbd>三人</Kbd> (tres personas).</InfoLine>
          <InfoLine>Algunas lecturas cambian: <Kbd>一本(いっぽん)</Kbd>・<Kbd>三本(さんぼん)</Kbd>・<Kbd>一匹(いっぴき)</Kbd>.</InfoLine>
          <InfoLine>Orden: <Kbd>[Objeto を] [número+contador] [Verbo]</Kbd>. Ej.: りんご を <Kbd>二個</Kbd> かいます。</InfoLine>
          <InfoLine>Hoy: <Kbd>人, 枚, 本, 匹, 台, 冊, 回, 個</Kbd>.</InfoLine>
        </Section>

        {/* VOCABULARIO por contador — TODO EN TEXTO BLANCO */}
        <View onLayout={onLayoutVocab}>
          <Section title="Vocabulario por contador" tint="mint">
            <View style={s.cardsWrap}>
              {CONTADORES.map((c, idx) => (
                <View key={`${c.contador}-${idx}`} style={s.counterCard}>
                  <View style={s.counterHeader}>
                    <View style={s.counterIconWrap}>
                      <Ionicons name={c.icon as any} size={18} color={INK_DARK} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.counterTop}>
                        {c.contador} <Text style={s.counterReading}>（{c.lectura}）</Text>
                      </Text>
                      <Text style={s.counterSub}>Uso: <Text style={{ fontWeight: "900", color: WHITE }}>{c.uso}</Text></Text>
                    </View>
                    <Pressable style={s.ttsBtn} onPress={() => speakJP(`${c.contador}、${c.lectura.replace("（", "").replace("）", "")}`)}>
                      <Ionicons name="volume-high" size={18} color={INK_DARK} />
                    </Pressable>
                  </View>

                  {c.ejemplos.map((e, i) => (
                    <View key={i} style={s.exampleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.exampleJP}>{e.jp}</Text>
                        <Text style={s.exampleES}>{e.es}</Text>
                      </View>
                      <Pressable style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]} onPress={() => speakJP(e.jp)}>
                        <Ionicons name="volume-high" size={18} color={INK_DARK} />
                      </Pressable>
                    </View>
                  ))}

                  {LECTURAS[c.contador as keyof typeof LECTURAS] && (
                    <View style={s.chipsWrap}>
                      {LECTURAS[c.contador as keyof typeof LECTURAS].map((r, i) => (
                        <Pressable key={`${r}-${i}`} style={s.chipRead} onPress={() => speakJP(r)}>
                          <Ionicons name="volume-high" size={12} color={WHITE} />
                          <Text style={s.chipReadTxt}>{r}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Section>
        </View>

        {/* KANJI: trazos (BLANCO de fondo para ver bien los trazos blancos) */}
        <View onLayout={onLayoutKanji}>
          <Section title="Trazos de los kanji (orden)" tint="mint">
            <Text style={s.kExplain}>
              Toca para ver GRANDE el orden de trazos. El recuadro es <Text style={{ fontWeight: "900", color: WHITE }}>blanco</Text> para que los trazos se vean nítidos.
            </Text>
            <View style={s.kanjiGrid}>
              {Object.keys(KANJI_IMG).map((k) => (
                <View key={k} style={s.kanjiCard}>
                  <Pressable onPress={() => setZoomKanji({ k: k as keyof typeof KANJI_IMG })}>
                    {/* 👇 Fondo blanco para el área de dibujo */}
                    <View style={s.kanjiImgWrap}>
                      <Image source={KANJI_IMG[k as keyof typeof KANJI_IMG]} style={s.kanjiImg} resizeMode="contain" />
                    </View>
                  </Pressable>
                  <View style={s.kanjiRow}>
                    <Text style={s.kanjiTxt}>{k}</Text>
                    <Pressable style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]} onPress={() => speakJP(KANJI_READ[k as keyof typeof KANJI_READ])}>
                      <Ionicons name="volume-high" size={16} color={INK_DARK} />
                    </Pressable>
                  </View>
                  <Text style={s.kanjiReadingSmall}>読み方: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_READ[k as keyof typeof KANJI_READ]}</Text></Text>
                  <Text style={s.kanjiMeaning}>Significa: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_MEAN[k as keyof typeof KANJI_MEAN]}</Text></Text>
                </View>
              ))}
            </View>
          </Section>
        </View>

        {/* ORACIONES */}
        <View onLayout={onLayoutExamples}>
          <Section title="15 oraciones con audio" tint="pink">
            <View style={s.examplesList}>
              {ORACIONES_15.map((ex, i) => (
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

        {/* TABS JUEGOS */}
        <View onLayout={onLayoutGames} style={s.tabsRow}>
          <Pressable onPress={() => setActiveTab("contador")} style={[s.tabBtn, activeTab === "contador" && s.tabActive]}>
            <Ionicons name="help-buoy" size={14} color={activeTab === "contador" ? INK_DARK : "#E5E7EB"} />
            <Text style={[s.tabTxt, activeTab === "contador" && s.tabTxtActive]}>Elige el contador</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("lecturas")} style={[s.tabBtn, activeTab === "lecturas" && s.tabActive]}>
            <Ionicons name="create" size={14} color={activeTab === "lecturas" ? INK_DARK : "#E5E7EB"} />
            <Text style={[s.tabTxt, activeTab === "lecturas" && s.tabTxtActive]}>Elige la lectura</Text>
          </Pressable>
        </View>

        {/* Juego A */}
        {activeTab === "contador" && (
          <>
            {!aStarted && aIdx === 0 && aScore === 0 && (
              <PlayCard title="Actividad A: 10 preguntas" desc="Lee la pista y elige el contador correcto." cta="Comenzar"
                onPress={() => { setAStarted(true); setAIdx(0); setAScore(0); setASel(null); }} tone="mint" />
            )}
            {aStarted && quizA[aIdx] && (
              <GameCard flash={aFlash}>
                <HeaderRow left={<ScoreChip icon="bookmark" label={`Pregunta ${aIdx + 1}/${quizA.length}`} />} right={<ScoreChip icon="star" label={`${aScore} pts`} />} />
                <Prompt>{quizA[aIdx].prompt}</Prompt>
                <Options options={quizA[aIdx].options} chosen={aSel} correct={quizA[aIdx].correct} onChoose={answerA} />
              </GameCard>
            )}
            {!aStarted && aIdx > 0 && (
              <SummaryCard title="Resumen (Actividad A)" list={[{ icon: "star", text: `Puntaje: ${aScore}` }, { icon: "book", text: `Preguntas: ${quizA.length}` }]} />
            )}
          </>
        )}

        {/* Juego B */}
        {activeTab === "lecturas" && (
          <>
            {!bStarted && bIdx === 0 && bScore === 0 && (
              <PlayCard title="Actividad B: 10 preguntas" desc="Elige la lectura correcta del número + contador (ej.: 一本＝いっぽん)." cta="Comenzar"
                onPress={() => { setBStarted(true); setBIdx(0); setBScore(0); setBSel(null); }} tone="amber" />
            )}
            {bStarted && quizB[bIdx] && (
              <GameCard flash={bFlash}>
                <HeaderRow left={<ScoreChip icon="bookmark" label={`Pregunta ${bIdx + 1}/${quizB.length}`} />} right={<ScoreChip icon="star" label={`${bScore} pts`} />} />
                <Prompt>{quizB[bIdx].prompt}</Prompt>
                <Options options={quizB[bIdx].options} chosen={bSel} correct={bIdx < quizB.length ? quizB[bIdx].correct : ""} onChoose={answerB} />
              </GameCard>
            )}
            {!bStarted && bIdx > 0 && (
              <SummaryCard title="Resumen (Actividad B)" list={[{ icon: "star", text: `Puntaje: ${bScore}` }, { icon: "book", text: `Preguntas: ${quizB.length}` }]} />
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

      {/* Modal de zoom Kanji (también con fondo BLANCO en la imagen) */}
      <Modal animationType="fade" transparent visible={!!zoomKanji} onRequestClose={() => setZoomKanji(null)}>
        <View style={s.zoomBackdrop}>
          <View style={s.zoomCard}>
            {zoomKanji && (
              <>
                <View style={s.zoomImgWrap}>
                  <Image source={KANJI_IMG[zoomKanji.k]} style={s.zoomImg} resizeMode="contain" />
                </View>
                <View style={s.zoomRow}>
                  <Text style={s.zoomTitle}>{zoomKanji.k}・{KANJI_READ[zoomKanji.k]}</Text>
                  <Pressable style={[s.ttsBtn, { backgroundColor: "#FDE68A" }]} onPress={() => speakJP(KANJI_READ[zoomKanji.k])}>
                    <Ionicons name="volume-high" size={18} color={INK_DARK} />
                  </Pressable>
                </View>
                <Text style={[s.kanjiMeaning, { marginTop: 4 }]}>
                  Significa: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_MEAN[zoomKanji.k]}</Text>
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

/* ----------------- Subcomponentes UI ----------------- */
function Section({ title, tint, children }: { title: string; tint: "violet" | "mint" | "pink"; children: React.ReactNode }) {
  const color = tint === "violet" ? VIOLET : tint === "mint" ? MINT : PINK;
  const bg = tint === "violet" ? "rgba(139,92,246,0.10)" : tint === "mint" ? "rgba(52,211,153,0.10)" : "rgba(236,72,153,0.10)";
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
function InfoLine({ children }: { children: React.ReactNode }) { return <Text style={s.infoLine}>• <Text style={{ color: WHITE }}>{children}</Text></Text>; }
function Kbd({ children }: { children: React.ReactNode }) { return <Text style={s.kbd}>{children}</Text>; }
function HeaderRow({ left, right }: { left: React.ReactNode; right: React.ReactNode }) { return <View style={s.rowBetween}>{left}{right}</View>; }
function ScoreChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap | "star" | "book" | "bookmark"; label: string }) {
  return (<View style={stylesChip.chip}><Ionicons name={icon as any} size={14} color="#0b1020" /><Text style={stylesChip.txt}>{label}</Text></View>);
}
function Prompt({ children }: { children: React.ReactNode }) { return (<View style={s.promptWrap}><Text style={s.prompt}>{children}</Text></View>); }
function Options({ options, chosen, correct, onChoose }: { options: string[]; chosen: string | null; correct: string; onChoose: (opt: string) => void }) {
  return (
    <View style={s.optionsGrid}>
      {options.map((opt, i) => {
        const isChosen = chosen !== null && chosen === opt;
        const isRight = chosen !== null && opt === correct;
        return (
          <Pressable key={`${i}-${opt}`} onPress={() => onChoose(opt)} style={({ pressed }) => [
            s.option, pressed && s.optionPressed, isChosen && s.optionChosen, isRight && s.optionRight, chosen && !isRight && isChosen && s.optionWrong,
          ]}>
            <Text style={s.optionTxt}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
function FancyHeroButton({ label, icon, gradient, onPress }:{
  label: string; icon: keyof typeof Ionicons.glyphMap | "sparkles" | "game-controller" | "musical-notes";
  gradient: "mint" | "violet" | "amber"; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  const bg = gradient === "mint" ? ["rgba(167,243,208,0.95)"] : gradient === "violet" ? ["rgba(221,214,254,0.95)"] : ["rgba(253,230,138,0.95)"];
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
function PlayCard({ title, desc, cta, onPress, tone }:{ title: string; desc: string; cta: string; onPress: () => void; tone: "mint" | "amber" }) {
  const bg = tone === "mint" ? "rgba(167,243,208,0.12)" : "rgba(253,230,138,0.12)";
  const border = tone === "mint" ? "#34D399" : "#F59E0B";
  return (
    <View style={[s.playCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={s.cardHeaderRow}><Ionicons name="clipboard" size={18} color={WHITE} /><Text style={s.h}>{title}</Text></View>
      <Text style={s.p}>{desc}</Text>
      <Pressable style={[s.btnPrimary, { backgroundColor: border, borderColor: border }]} onPress={onPress}>
        <Ionicons name="play" size={16} color={INK_DARK} /><Text style={[s.btnTxt, { color: INK_DARK }]}>{cta}</Text>
      </Pressable>
    </View>
  );
}
function GameCard({ children, flash }:{ children: React.ReactNode; flash: "ok" | "bad" | null }) {
  return (<View style={[s.gameCard, flash === "ok" ? { borderColor: MINT, shadowColor: MINT } : flash === "bad" ? { borderColor: ROSE, shadowColor: ROSE } : null]}>{children}</View>);
}
function SummaryCard({ title, list }:{ title: string; list: { icon: keyof typeof Ionicons.glyphMap | "star" | "book"; text: string }[] }) {
  return (
    <View style={s.playCard}>
      <View style={s.cardHeaderRow}><Ionicons name="ribbon" size={18} color={WHITE} /><Text style={s.h}>{title}</Text></View>
      <View style={s.summaryRow}>{list.map((it, i) => (<View key={i} style={stylesChip.chip}><Ionicons name={it.icon as any} size={14} color={INK_DARK} /><Text style={stylesChip.txt}>{it.text}</Text></View>))}</View>
    </View>
  );
}

/* ----------------- Estilos ----------------- */
const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  // HERO
  hero: { borderRadius: 22, padding: 18, overflow: "hidden", borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.04)" },
  blob1: { position: "absolute", top: -60, left: -40, width: 180, height: 180, borderRadius: 999, backgroundColor: "rgba(14,165,233,0.20)" },
  blob2: { position: "absolute", bottom: -70, right: -50, width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(139,92,246,0.16)" },
  blob3: { position: "absolute", top: 30, right: -60, width: 120, height: 120, borderRadius: 999, backgroundColor: "rgba(236,72,153,0.18)" },
  glowDot: { position: "absolute", top: 24, left: 24, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.35)" },

  kicker: { color: "#C7D2FE", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: "900", color: WHITE, letterSpacing: 0.2 },
  subtitle: { color: "#E5E7EB", marginTop: 6 },

  // Botones del héroe
  heroButtons: { flexDirection: "row", gap: 10, marginTop: 14 },
  fancyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  fancyBtnGlow: { position: "absolute", inset: 0, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  fancyBtnTxt: { color: INK_DARK, fontWeight: "900", letterSpacing: 0.3, fontSize: 13 },

  // Section
  section: { borderRadius: 18, borderWidth: 2, padding: 14, marginTop: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  badge: { width: 10, height: 10, borderRadius: 999 },
  sectionTitle: { fontWeight: "900", fontSize: 16 },

  infoLine: { marginTop: 6, color: "#93C5FD" },
  kbd: { fontWeight: "900", color: WHITE },

  // Vocab por contador (TODO BLANCO)
  cardsWrap: { marginTop: 6, gap: 12 },
  counterCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, padding: 12 },
  counterHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  counterIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#A7F3D0", alignItems: "center", justifyContent: "center" },
  counterTop: { fontSize: 18, fontWeight: "900", color: WHITE },
  counterReading: { color: WHITE, fontSize: 13, fontWeight: "900" },
  counterSub: { color: WHITE, fontSize: 12 },

  exampleRow: {
    marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12, padding: 10,
  },
  exampleJP: { fontSize: 16, fontWeight: "900", color: WHITE, flexShrink: 1, paddingRight: 8 },
  exampleES: { marginTop: 4, color: WHITE, fontSize: 12 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chipRead: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.14)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  chipReadTxt: { fontSize: 12, color: WHITE, fontWeight: "900" },

  // Kanji grid
  kExplain: { color: WHITE, marginTop: 2 },
  kanjiGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  kanjiCard: { width: "48%", backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, padding: 10 },
  // 👇 Caja blanca detrás de la imagen
  kanjiImgWrap: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  // 👇 La imagen ahora descansa sobre fondo blanco
  kanjiImg: { width: "100%", height: "100%", backgroundColor: WHITE },
  kanjiRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kanjiTxt: { fontSize: 22, fontWeight: "900", color: WHITE },
  kanjiReadingSmall: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiMeaning: { marginTop: 2, color: WHITE, fontSize: 12 },

  // Oraciones
  examplesList: { marginTop: 8, gap: 12 },
  exampleTile: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: STROKE, paddingVertical: 12, paddingHorizontal: 12 },
  exampleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  // Tabs
  tabsRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  tabBtn: { flexDirection: "row", gap: 6, alignItems: "center", borderWidth: 1, borderColor: STROKE, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)" },
  tabActive: { backgroundColor: "#FDE68A" },
  tabTxt: { color: WHITE, fontWeight: "800" },
  tabTxtActive: { color: INK_DARK },

  // Cards de juego
  playCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: WHITE, fontSize: 16 },
  p: { marginTop: 6, color: WHITE, lineHeight: 20 },
  btnPrimary: {
    marginTop: 14, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", borderWidth: 1,
    flexDirection: "row", gap: 8, alignSelf: "center", minWidth: 220, justifyContent: "center",
  },
  btnTxt: { fontWeight: "900", letterSpacing: 0.3 },

  gameCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18, padding: 16, borderWidth: 1, borderColor: STROKE, marginTop: 12,
    shadowColor: MINT, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
  },
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

  // TTS solo bocina
  ttsBtn: { backgroundColor: "#93C5FD", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },

  // Modal logro
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: {
    width: "100%", maxWidth: 380, backgroundColor: INK_DARK, borderRadius: 16,
    paddingVertical: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: "#1f2937", alignItems: "center", gap: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#A7F3D0" },
  modalAchievementName: { fontSize: 22, fontWeight: "900", color: WHITE, textAlign: "center" },
  modalPoints: { fontSize: 26, fontWeight: "900", color: GOLD, marginTop: 2, marginBottom: 10 },
  modalButton: { backgroundColor: "#FDE68A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 160, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  modalButtonText: { color: INK_DARK, fontWeight: "800" },

  // Modal zoom kanji (imagen sobre fondo 100% blanco)
  zoomBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  zoomCard: { width: "100%", maxWidth: 420, backgroundColor: "#0f172a", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  zoomImgWrap: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
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
