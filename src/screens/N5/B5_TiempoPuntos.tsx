// src/screens/N5/B5_TiempoPuntos.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B5_TiempoPuntos — Puntos de tiempo: horas y fechas (N5)
 * – Vocab: horas（～時）, minutos（～分）, días de la semana（～曜日）, fechas (～日・月・年）
 * – TTS en todo
 * – Juegos: 1) lectura de horas/minutos  2) uso de に en hora/fecha
 * – Kanji con fondo BLANCO para trazos en blanco (WebP)
 *
 * Genera las imágenes con el script:
 *   node scripts/make_kanji_webp.js --level n5 --suffix nums --stroke white 6642 5206 65e5 6708 5e74 9031 66dc 4eca
 *     時(6642) 分(5206) 日(65e5) 月(6708) 年(5e74) 週(9031) 曜(66dc) 今(4eca)
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
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/* ---------- Kanji (trazos BLANCOS) ---------- */
const KANJI_IMG = {
  "時": require("../../../assets/kanjivg/n5/6642_nums.webp"),
  "分": require("../../../assets/kanjivg/n5/5206_nums.webp"),
  "日": require("../../../assets/kanjivg/n5/65e5_nums.webp"),
  "月": require("../../../assets/kanjivg/n5/6708_nums.webp"),
  "年": require("../../../assets/kanjivg/n5/5e74_nums.webp"),
  "週": require("../../../assets/kanjivg/n5/9031_nums.webp"),
  "曜": require("../../../assets/kanjivg/n5/66dc_nums.webp"),
  "今": require("../../../assets/kanjivg/n5/4eca_nums.webp"),
} as const;

const KANJI_INFO: Record<string, { yomi: string; es: string }> = {
  時: { yomi: "とき／じ", es: "hora / tiempo" },
  分: { yomi: "ふん／ぶん／ぷん", es: "minuto / parte" },
  日: { yomi: "ひ／にち／じつ", es: "día / sol" },
  月: { yomi: "つき／げつ／がつ", es: "luna / mes" },
  年: { yomi: "とし／ねん", es: "año" },
  週: { yomi: "しゅう", es: "semana" },
  曜: { yomi: "よう", es: "día de la semana" },
  今: { yomi: "いま／こん", es: "ahora / este" },
};

/* ---------- Vocab: HORAS / MINUTOS / DÍAS / FECHAS ---------- */
// Horas (～時)
const HORAS: { jp: string; roma: string }[] = [
  { jp: "一時", roma: "いちじ" },
  { jp: "二時", roma: "にじ" },
  { jp: "三時", roma: "さんじ" },
  { jp: "四時", roma: "よじ" },
  { jp: "五時", roma: "ごじ" },
  { jp: "六時", roma: "ろくじ" },
  { jp: "七時", roma: "しちじ" },
  { jp: "八時", roma: "はちじ" },
  { jp: "九時", roma: "くじ" },
  { jp: "十時", roma: "じゅうじ" },
  { jp: "十一時", roma: "じゅういちじ" },
  { jp: "十二時", roma: "じゅうにじ" },
];

// Minutos (～分) — patrones básicos
const MINUTOS: { jp: string; roma: string }[] = [
  { jp: "一分", roma: "いっぷん" },
  { jp: "二分", roma: "にふん" },
  { jp: "三分", roma: "さんぷん" },
  { jp: "四分", roma: "よんぷん" },
  { jp: "五分", roma: "ごふん" },
  { jp: "六分", roma: "ろっぷん" },
  { jp: "七分", roma: "ななふん" },
  { jp: "八分", roma: "はっぷん" },
  { jp: "九分", roma: "きゅうふん" },
  { jp: "十分", roma: "じゅっぷん／じっぷん" },
  { jp: "二十五分", roma: "にじゅうごふん" },
  { jp: "三十分", roma: "さんじゅっぷん" },
];

// Días de la semana
const WEEK: { jp: string; roma: string; es: string }[] = [
  { jp: "月曜日", roma: "げつようび", es: "lunes" },
  { jp: "火曜日", roma: "かようび", es: "martes" },
  { jp: "水曜日", roma: "すいようび", es: "miércoles" },
  { jp: "木曜日", roma: "もくようび", es: "jueves" },
  { jp: "金曜日", roma: "きんようび", es: "viernes" },
  { jp: "土曜日", roma: "どようび", es: "sábado" },
  { jp: "日曜日", roma: "にちようび", es: "domingo" },
];

// Fechas típicas (N5)
const FECHAS: { jp: string; roma: string; es: string }[] = [
  { jp: "一日", roma: "ついたち", es: "día 1" },
  { jp: "二日", roma: "ふつか", es: "día 2" },
  { jp: "三日", roma: "みっか", es: "día 3" },
  { jp: "四日", roma: "よっか", es: "día 4" },
  { jp: "五日", roma: "いつか", es: "día 5" },
  { jp: "六日", roma: "むいか", es: "día 6" },
  { jp: "七日", roma: "なのか", es: "día 7" },
  { jp: "八日", roma: "ようか", es: "día 8" },
  { jp: "九日", roma: "ここのか", es: "día 9" },
  { jp: "十日", roma: "とおか", es: "día 10" },
  { jp: "十四日", roma: "じゅうよっか", es: "día 14" },
  { jp: "二十日", roma: "はつか", es: "día 20" },
  { jp: "二十四日", roma: "にじゅうよっか", es: "día 24" },
  { jp: "三十一日", roma: "さんじゅういちにち", es: "día 31" },
];

/* ---------- Ejemplos con audio ---------- */
const ORACIONES: { jp: string; es: string }[] = [
  { jp: "わたし は 九時 に おきます。", es: "Me levanto a las 9." },
  { jp: "かいぎ は 三時 に はじまります。", es: "La reunión empieza a las 3." },
  { jp: "テスト は 金曜日 に あります。", es: "Hay examen el viernes." },
  { jp: "しけん は 十一月 二日 に あります。", es: "El examen es el 2 de noviembre." },
  { jp: "しゅくだい を 八時 に します。", es: "Hago la tarea a las 8." },
  { jp: "えいが は 七時 三十分 に はじまります。", es: "La película empieza a las 7:30." },
  { jp: "たんじょうび は 四月 五日 です。", es: "Mi cumpleaños es el 5 de abril." },
  { jp: "ミーティング は 月曜日 に あります。", es: "La junta es el lunes." },
  { jp: "クラス は 十時 十分 に おわります。", es: "La clase termina a las 10:10." },
  { jp: "いま は 三時 です。", es: "Ahora son las 3." },
];

/* ---------- Juegos ---------- */
type QA = { prompt: string; options: string[]; correct: string };

const QUIZ_HORA: QA[] = [
  { prompt: "“3:10” → elige lectura", options: ["さんじ じゅっぷん", "さんじ じゅうふん", "みっか じゅっぷん"], correct: "さんじ じゅっぷん" },
  { prompt: "“7:30” → elige lectura", options: ["しちじ さんじゅっぷん", "ななにち さんじゅうぷん", "しちじ さんぷん"], correct: "しちじ さんじゅっぷん" },
  { prompt: "“4:00” → elige lectura", options: ["よじ", "よんじ", "よっぷん"], correct: "よじ" },
  { prompt: "“9:05” → elige lectura", options: ["くじ ごふん", "きゅうにち ごふん", "くじ ごぷん"], correct: "くじ ごふん" },
  { prompt: "“1:08” → elige lectura", options: ["いちじ はっぷん", "いちじ はちふん", "ついたち はっぷん"], correct: "いちじ はっぷん" },
];

const QUIZ_NI: QA[] = [
  { prompt: "Completa: かいぎ ___ 三時 に はじまります。", options: ["に", "を", "で"], correct: "に" },
  { prompt: "Completa: テスト は 金曜日 ___ あります。", options: ["に", "を", "で"], correct: "に" },
  { prompt: "Completa: クラス ___ 十時 に おわります。", options: ["は", "に", "を"], correct: "は" },
  { prompt: "¿Cuál lleva に? 「九時 __ おきます」", options: ["に", "を", "で"], correct: "に" },
  { prompt: "¿Cuál NO lleva に? 「えき __ いきます」", options: ["に", "で", "を"], correct: "を" }, // (no usamos へ aquí)
];

/* ---------- Componente ---------- */
export default function B5_TiempoPuntos() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B5_TiempoPuntos";
  const ACHIEVEMENT_ID = "tiempo_puntos";
  const ACHIEVEMENT_TITLE = "Puntos de tiempo N5";
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  const { playCorrect, playWrong } = useFeedbackSounds();

  // hero aura
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: false }),
    ])).start();
  }, [glow]);
  const glowSize = glow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] });

  // anclas
  const svRef = useRef<ScrollView>(null);
  const [yVocab, setYVocab] = useState(0);
  const [yKanji, setYKanji] = useState(0);
  const [yEj, setYEj] = useState(0);
  const [yJuegos, setYJuegos] = useState(0);
  const scrollTo = (y: number) => svRef.current?.scrollTo({ y, animated: true });

  // juegos
  const [tab, setTab] = useState<"hora" | "ni">("hora");
  const quizA = useMemo(() => shuffle(QUIZ_HORA), []);
  const [aIdx, setAIdx] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [aSel, setASel] = useState<string | null>(null);
  const [aFlash, setAFlash] = useState<"ok" | "bad" | null>(null);
  const [aStarted, setAStarted] = useState(false);

  const quizB = useMemo(() => shuffle(QUIZ_NI), []);
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
    if (ok) { setAScore(s => s + 100); setAFlash("ok"); await playCorrect(); } else { setAFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setAFlash(null); setASel(null);
      if (aIdx + 1 < quizA.length) setAIdx(i => i + 1); else { setAStarted(false); endIfBothDone(); }
    }, 600);
  };

  const answerB = async (opt: string) => {
    if (bSel !== null) return;
    const ok = opt === quizB[bIdx].correct;
    setBSel(opt);
    if (ok) { setBScore(s => s + 100); setBFlash("ok"); await playCorrect(); } else { setBFlash("bad"); await playWrong(); }
    setTimeout(() => {
      setBFlash(null); setBSel(null);
      if (bIdx + 1 < quizB.length) setBIdx(i => i + 1); else { setBStarted(false); endIfBothDone(); }
    }, 600);
  };

  // zoom kanji
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
          <Text style={s.title}>Puntos de tiempo（時・分・日）</Text>
          <Text style={s.subtitle}>Aprende a decir la hora y las fechas. ¡Escucha, mira los kanji y juega!</Text>

          <View style={s.heroButtons}>
            <FancyHeroButton label="Vocab" icon="sparkles" tone="mint" onPress={() => scrollTo(yVocab)} />
            <FancyHeroButton label="Trazos" icon="brush" tone="violet" onPress={() => scrollTo(yKanji)} />
            <FancyHeroButton label="Ejemplos" icon="musical-notes" tone="amber" onPress={() => scrollTo(yEj)} />
            <FancyHeroButton label="Juegos" icon="game-controller" tone="mint" onPress={() => scrollTo(yJuegos)} />
          </View>
        </View>

        {/* EXPLICACIÓN BÁSICA (muy fácil, SIN KANJI) */}
        <Section title="Explicación básica (muy fácil)" tint="violet">
          <Info>En japonés, para decir la hora usamos <Kbd>～じ</Kbd> (se lee “ji”). Ejemplo: <Kbd>さんじ</Kbd> = las tres.</Info>
          <Info>Para decir los minutos usamos <Kbd>～ふん／ぷん</Kbd> (se lee “fun” o “pun”). Ejemplo: <Kbd>ごふん</Kbd> = cinco minutos.</Info>
          <Info>La partícula <Kbd>に</Kbd> indica <Kbd>cuándo</Kbd> pasa algo: “a las…”, “el día…”.</Info>
          <Info>Ejemplo: <Kbd>くじ に おきます</Kbd> → Me levanto a las 9.</Info>
          <Info>Las <Kbd>fechas</Kbd> en japonés son los <Kbd>días del mes</Kbd> y algunos tienen nombres especiales (como <Kbd>ついたち</Kbd> para el día 1).</Info>
          <Info>Ejemplo: <Kbd>しけん は じゅうにがつ ふつか に あります。</Kbd> → El examen es el 2 de diciembre.</Info>
        </Section>

        {/* VOCAB — HORAS */}
        <Anchor onLayoutY={setYVocab}>
          <Section title="Vocabulario — Horas（～時）" tint="mint">
            <CardGrid>
              {HORAS.map((h, i) => (
                <VocabCard key={i} title={h.jp} sub={h.roma} onSpeak={() => speakJP(h.roma)} />
              ))}
            </CardGrid>
          </Section>

          <Section title="Vocabulario — Minutos（～分）" tint="mint">
            <CardGrid>
              {MINUTOS.map((m, i) => (
                <VocabCard key={i} title={m.jp} sub={m.roma} onSpeak={() => speakJP(m.roma)} />
              ))}
            </CardGrid>
          </Section>

          <Section title="Vocabulario — Días de la semana（～曜日）" tint="mint">
            <CardGrid>
              {WEEK.map((d, i) => (
                <VocabCard key={i} title={d.jp} sub={`${d.roma} — ${d.es}`} onSpeak={() => speakJP(d.roma)} />
              ))}
            </CardGrid>
          </Section>

          <Section title="Vocabulario — Fechas（～日／～月／～年）" tint="mint">
            <Text style={{ color: WHITE, marginBottom: 6 }}>
              Estos son los <Text style={{ fontWeight: "900" }}>días del mes</Text> en japonés. Algunos tienen nombres especiales y no siguen el número normal.
            </Text>
            <CardGrid>
              {FECHAS.map((d, i) => (
                <VocabCard key={i} title={d.jp} sub={`${d.roma} — ${d.es}`} onSpeak={() => speakJP(d.roma)} />
              ))}
            </CardGrid>
          </Section>
        </Anchor>

        {/* KANJI TRAZOS (fondo BLANCO + explicación kun/on) */}
        <Anchor onLayoutY={setYKanji}>
          <Section title="Trazos de los kanji (orden) · Lecturas" tint="mint">
            <Text style={s.kExplain}>
              El recuadro es <Text style={{ fontWeight: "900", color: WHITE }}>blanco</Text> para que los trazos se vean nítidos.{"\n"}
              En los kanji hay dos formas de leerlos:{"\n"}
              <Text style={{ fontWeight: "900", color: WHITE }}>Kun’yomi（くんよみ）</Text>: lectura japonesa, se usa cuando el kanji va solo (p. ej. 「月」= つき).{"\n"}
              <Text style={{ fontWeight: "900", color: WHITE }}>On’yomi（おんよみ）</Text>: lectura china, se usa en palabras compuestas (p. ej. 「月曜日」= げつようび).{"\n"}
              <Text style={{ fontWeight: "900", color: WHITE }}>En esta unidad usaremos sobre todo la lectura on’yomi</Text> porque estudiamos palabras compuestas de tiempo.
            </Text>

            <View style={s.kanjiGrid}>
              {Object.keys(KANJI_IMG).map((k) => (
                <View key={k} style={s.kanjiCard}>
                  <Pressable onPress={() => setZoomKanji({ k: k as keyof typeof KANJI_IMG })}>
                    <View style={s.kanjiImgWrap}>
                      <Image source={KANJI_IMG[k as keyof typeof KANJI_IMG]} style={s.kanjiImg} resizeMode="contain" />
                    </View>
                  </Pressable>
                  <View style={s.kanjiRow}>
                    <Text style={s.kanjiTxt}>{k}</Text>
                    <Pressable style={[s.ttsBtn, { backgroundColor: "#A7F3D0" }]} onPress={() => speakJP(KANJI_INFO[k].yomi)}>
                      <Ionicons name="volume-high" size={16} color={INK_DARK} />
                    </Pressable>
                  </View>
                  <Text style={s.kanjiReadingSmall}>読み方: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO[k].yomi}</Text></Text>
                  <Text style={s.kanjiMeaning}>Significa: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO[k].es}</Text></Text>
                </View>
              ))}
            </View>
          </Section>
        </Anchor>

        {/* EJEMPLOS CON AUDIO */}
        <Anchor onLayoutY={setYEj}>
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
        </Anchor>

        {/* JUEGOS */}
        <Anchor onLayoutY={setYJuegos}>
          <View style={s.tabsRow}>
            <TabBtn label="Lectura de hora" active={tab === "hora"} onPress={() => setTab("hora")} icon="time" />
            <TabBtn label="Partícula に" active={tab === "ni"} onPress={() => setTab("ni")} icon="help-buoy" />
          </View>

          {/* Juego A */}
          {tab === "hora" && (
            <>
              {!aStarted && aIdx === 0 && aScore === 0 && (
                <PlayCard
                  title="Actividad A: Hora y minutos"
                  desc="Elige la lectura correcta de cada hora."
                  cta="Comenzar"
                  tone="mint"
                  onPress={() => { setAStarted(true); setAIdx(0); setAScore(0); setASel(null); }}
                />
              )}
              {aStarted && quizA[aIdx] && (
                <GameCard flash={aFlash}>
                  <HeaderRow left={<Chip icon="bookmark" label={`Pregunta ${aIdx + 1}/${quizA.length}`} />} right={<Chip icon="star" label={`${aScore} pts`} />} />
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
          {tab === "ni" && (
            <>
              {!bStarted && bIdx === 0 && bScore === 0 && (
                <PlayCard
                  title="Actividad B: ¿Lleva に?"
                  desc="Completa o elige la opción correcta cuando se usa に para tiempo."
                  cta="Comenzar"
                  tone="amber"
                  onPress={() => { setBStarted(true); setBIdx(0); setBScore(0); setBSel(null); }}
                />
              )}
              {bStarted && quizB[bIdx] && (
                <GameCard flash={bFlash}>
                  <HeaderRow left={<Chip icon="bookmark" label={`Pregunta ${bIdx + 1}/${quizB.length}`} />} right={<Chip icon="star" label={`${bScore} pts`} />} />
                  <Prompt>{quizB[bIdx].prompt}</Prompt>
                  <Options options={quizB[bIdx].options} chosen={bSel} correct={quizB[bIdx].correct} onChoose={answerB} />
                </GameCard>
              )}
              {!bStarted && bIdx > 0 && (
                <SummaryCard title="Resumen (Actividad B)" list={[{ icon: "star", text: `Puntaje: ${bScore}` }, { icon: "book", text: `Preguntas: ${quizB.length}` }]} />
              )}
            </>
          )}
        </Anchor>
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

      {/* Modal zoom kanji (imagen sobre fondo BLANCO) */}
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
                  Significa: <Text style={{ fontWeight: "900", color: WHITE }}>{KANJI_INFO[zoomKanji.k].es}</Text>
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
const Anchor = ({ onLayoutY, children }: { onLayoutY: (y: number) => void; children: React.ReactNode }) => (
  <View onLayout={(e) => onLayoutY(e.nativeEvent.layout.y - 12)}>{children}</View>
);
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
const Kbd = ({ children }: { children: React.ReactNode }) => (<Text style={s.kbd}>{children}</Text>);
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
  label: string; active: boolean; onPress: () => void; icon: keyof typeof Ionicons.glyphMap | "time" | "help-buoy";
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
  kbd: { fontWeight: "900", color: WHITE },

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
  kanjiTxt: { fontSize: 22, fontWeight: "900", color: WHITE },
  kanjiReadingSmall: { marginTop: 2, color: WHITE, fontSize: 12 },
  kanjiMeaning: { marginTop: 2, color: WHITE, fontSize: 12 },

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
