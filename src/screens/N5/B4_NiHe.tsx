// src/screens/N5/B4_NiHe.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Sonidos correcto/incorrecto
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// Gamificación
import { awardAchievement, awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/**
 * B4_NiHe — Partículas に y へ (destino / dirección / tiempo puntual)
 * - Explicación nivel primaria con comparación simple に vs へ + verbos de movimiento.
 * - Vocabulario (30) con TTS (bocina; sin botón stop).
 * - 15 oraciones ejemplo con TTS.
 * - Actividad 1: Quiz de 10 preguntas (elige に o へ / tiempo con に).
 * - Actividad 2: Mini-juego “Construye la frase” (tap-to-build como drag&drop).
 * - Logro: “Partículas に・へ — destino/tiempo” +10 XP (idempotente).
 */

type QA = {
  hintES: string;
  correctJP: string;
  options: string[];
};

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
  { jp: "に", es: "partícula: destino/llegada; TIEMPO puntual" },
  { jp: "へ", es: "partícula: dirección hacia (rumbo)" },
  { jp: "がっこう", es: "escuela" },
  { jp: "いえ", es: "casa" },
  { jp: "だいがく", es: "universidad" },
  { jp: "スーパー", es: "supermercado" },
  { jp: "えき", es: "estación" },
  { jp: "にほん", es: "Japón" },
  { jp: "としょかん", es: "biblioteca" },
  { jp: "こうえん", es: "parque" },
  { jp: "きょう", es: "hoy" },
  { jp: "あした", es: "mañana" },
  { jp: "きのう", es: "ayer" },
  { jp: "げつようび", es: "lunes" },
  { jp: "かようび", es: "martes" },
  { jp: "３じ", es: "las 3 en punto" },
  { jp: "７じはん", es: "7 y media" },
  { jp: "あさ", es: "mañana (temprano)" },
  { jp: "ばん", es: "noche" },
  { jp: "しゅうまつ", es: "fin de semana" },
  // verbos de movimiento
  { jp: "いきます", es: "ir (me muevo hacia allí)" },
  { jp: "きます", es: "venir (se mueve hacia aquí)" },
  { jp: "かえります", es: "volver/regresar (a un lugar base)" },
  // otros útiles para ejemplos de tiempo
  { jp: "はじまります", es: "empezar/iniciar" },
  { jp: "おわります", es: "terminar/acabar" },
  { jp: "べんきょうします", es: "estudiar" },
  { jp: "アルバイト", es: "trabajo de medio tiempo" },
  { jp: "テスト", es: "examen" },
  { jp: "パーティー", es: "fiesta" },
  { jp: "イベント", es: "evento" },
];

/* ======================= EXPLICACIÓN BÁSICA + VERBOS ======================= */
const EXAMPLES_15: { jp: string; es: string }[] = [
  // Destino/llegada con に
  { jp: "がっこう に いきます。", es: "Voy a la escuela. (llegada/destino)" },
  { jp: "いえ に かえります。", es: "Regreso a casa. (destino)" },
  { jp: "としょかん に きます。", es: "Vengo a la biblioteca. (destino)" },
  // Dirección con へ
  { jp: "にほん へ いきます。", es: "Voy hacia Japón. (rumbo/dirección)" },
  { jp: "こうえん へ いきます。", es: "Voy hacia el parque. (rumbo)" },
  // Tiempo puntual con に
  { jp: "３じ に はじまります。", es: "Empieza a las 3." },
  { jp: "７じはん に おわります。", es: "Termina a las 7:30." },
  { jp: "げつようび に テスト です。", es: "El lunes hay examen. (lunes = punto temporal)" },
  // Frases naturales mixtas
  { jp: "あした がっこう に いきます。", es: "Mañana voy a la escuela." },
  { jp: "しゅうまつ に パーティー があります。", es: "Hay una fiesta el fin de semana." },
  { jp: "あさ に べんきょうします。", es: "Estudio por la mañana. (punto del día)" },
  { jp: "ばん に かえります。", es: "Regreso por la noche." },
  // へ con matiz de “rumbo a…”
  { jp: "えき へ いきます。", es: "Voy hacia la estación." },
  { jp: "スーパー へ いきます。", es: "Voy hacia el súper." },
  { jp: "だいがく へ いきます。", es: "Voy hacia la universidad." },
];

/* ======================= QUIZ (10) ======================= */
const ITEMS_QA: { hintES: string; correct: string; distractors: string[] }[] = [
  { hintES: "Voy a la escuela (destino).", correct: "がっこう に いきます。", distractors: ["がっこう へ いきます。", "がっこう を いきます。", "がっこう で いきます。"] },
  { hintES: "Voy hacia el parque (rumbo).", correct: "こうえん へ いきます。", distractors: ["こうえん に いきます。", "こうえん を いきます。", "こうえん で いきます。"] },
  { hintES: "Regreso a casa (destino).", correct: "いえ に かえります。", distractors: ["いえ へ かえります。", "いえ を かえります。", "いえ で かえります。"] },
  { hintES: "Vengo a la biblioteca (destino).", correct: "としょかん に きます。", distractors: ["としょかん へ きます。", "としょかん を きます。", "としょかん で きます。"] },
  { hintES: "Voy hacia Japón (rumbo).", correct: "にほん へ いきます。", distractors: ["にほん に いきます。", "にほん を いきます。", "にほん で いきます。"] },
  { hintES: "Empieza a las 3. (tiempo puntual)", correct: "３じ に はじまります。", distractors: ["３じ へ はじまります。", "３じ を はじまります。", "３じ で はじまります。"] },
  { hintES: "Termina a las 7:30. (tiempo puntual)", correct: "７じはん に おわります。", distractors: ["７じはん へ おわります。", "７じはん を おわります。", "７じはん で おわります。"] },
  { hintES: "El lunes hay examen. (punto temporal)", correct: "げつようび に テスト です。", distractors: ["げつようび へ テスト です。", "げつようび を テスト です。", "げつようび で テスト です。"] },
  { hintES: "Mañana voy a la escuela.", correct: "あした がっこう に いきます。", distractors: ["あした がっこう へ いきます。", "あした がっこう を いきます。", "あした がっこう で いきます。"] },
  { hintES: "Voy hacia la estación (rumbo).", correct: "えき へ いきます。", distractors: ["えき に いきます。", "えき を いきます。", "えき で いきます。"] },
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

/* ======================= MINI-JUEGO: Construye la frase ======================= */
/**
 * Tap-to-build: eliges 3 fichas en orden:
 * [Lugar] + [に/へ ESPECÍFICO según “destino/rumbo”] + [Verbo de movimiento]
 */
type BuildRound = {
  place: string;
  verb: "いきます" | "きます" | "かえります";
  require: "に" | "へ"; // pista obliga a una
  hint: string;        // pista ES
};

const PLACES = ["がっこう", "いえ", "としょかん", "だいがく", "こうえん", "えき", "スーパー", "にほん"] as const;
const VERBS = ["いきます", "きます", "かえります"] as const;

function makeBuildDeck(len = 6): BuildRound[] {
  const rounds: BuildRound[] = [];
  for (let i = 0; i < len; i++) {
    const place = PLACES[Math.floor(Math.random() * PLACES.length)];
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
    const require = Math.random() < 0.5 ? "に" : "へ";
    const hint =
      require === "に"
        ? `Arma: “Voy/Vengo/Vuelvo A (destino)”. Usa に.`
        : `Arma: “Voy HACIA (rumbo) …”. Usa へ.`;
    rounds.push({ place, verb, require, hint });
  }
  return rounds;
}

export default function B4_NiHe() {
  // Gamificación
  const LEVEL = "N5";
  const SCREEN_KEY = "B4_NiHe";
  const ACHIEVEMENT_ID = "ni_he_destination_time";
  const ACHIEVEMENT_TITLE = "Partículas に・へ — destino/tiempo";

  // On Enter (solo tracking)
  useAwardOnEnter(SCREEN_KEY, { xpOnEnter: 0, repeatXp: 0, meta: { level: LEVEL } });

  // Feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  // === QUIZ ===
  const questions = useMemo(() => makeQuestionPool(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // === MINI-JUEGO BUILD ===
  const buildDeck = useMemo(() => makeBuildDeck(6), []);
  const [bIndex, setBIndex] = useState(0);
  const [trayPlace] = useState<string[]>(PLACES as unknown as string[]);
  const [trayParticle] = useState<("に" | "へ")[]>(["に", "へ"]);
  const [trayVerb] = useState<(typeof VERBS[number])[]>(VERBS as unknown as (typeof VERBS[number])[]);
  const [picked, setPicked] = useState<string[]>([]); // 0: place 1: particle 2: verb
  const [buildFlash, setBuildFlash] = useState<"ok" | "bad" | null>(null);

  // Modal logro
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState<number>(0);

  const current = questions[qIndex];
  const currentBuild = buildDeck[bIndex];

  /* ====== QUIZ HANDLERS ====== */
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
        // No cerramos aquí, se muestra resumen y además puedes jugar el mini-juego abajo.
      }
    }, 650);
  };

  /* ====== BUILD HANDLERS ====== */
  const canPick = (token: string) => {
    // En orden: 1) place  2) particle  3) verb
    if (picked.length === 0) {
      // Debe ser lugar (de la lista)
      return trayPlace.includes(token);
    }
    if (picked.length === 1) {
      // Debe ser partícula
      return token === "に" || token === "へ";
    }
    if (picked.length === 2) {
      // Debe ser verbo
      return (VERBS as unknown as string[]).includes(token);
    }
    return false;
  };

  const onPick = async (token: string) => {
    if (!currentBuild) return;
    if (!canPick(token)) return;
    const next = [...picked, token];
    setPicked(next);

    // Auto-check al completar 3
    if (next.length === 3) {
      const place = next[0];
      const particle = next[1] as "に" | "へ";
      const verb = next[2] as "いきます" | "きます" | "かえります";
      const ok =
        place === currentBuild.place &&
        particle === currentBuild.require &&
        verb === currentBuild.verb;

      if (ok) {
        setBuildFlash("ok");
        await playCorrect();
        // TTS oración completa
        const phrase = `${place} ${particle} ${verb}。`;
        speakJP(phrase);
      } else {
        setBuildFlash("bad");
        await playWrong();
      }

      setTimeout(() => {
        setBuildFlash(null);
        setPicked([]);
        if (bIndex + 1 < buildDeck.length) setBIndex(bIndex + 1);
        // Si termina el mini-juego, otorgamos logro/XP (si no se dio aún en esta pantalla)
        else void handleFinishAll();
      }, 800);
    }
  };

  const removePicked = (i: number) => {
    const copy = picked.slice();
    copy.splice(i, 1);
    setPicked(copy);
  };

  /* ====== FIN / LOGRO ====== */
  const handleFinishAll = useCallback(async () => {
    // Marca éxito de pantalla (solo primera vez otorga XP si lo configuras)
    await awardOnSuccess(SCREEN_KEY, { xpOnSuccess: 0, meta: { level: LEVEL, quiz: questions.length, build: buildDeck.length, score } });
    const res = await awardAchievement(ACHIEVEMENT_ID, {
      xp: 10,
      sub: ACHIEVEMENT_TITLE,
      meta: { screenKey: SCREEN_KEY, level: LEVEL, quiz: questions.length, build: buildDeck.length, score },
    });
    setModalPoints(res.firstTime ? 10 : 0);
    setRewardModalVisible(true);
  }, [questions.length, buildDeck.length, score]);

  return (
    <>
      <ScrollView contentContainerStyle={s.container}>
        {/* Cinta */}
        <View style={s.ribbon}>
          <Ionicons name="navigate" size={16} color={INK} />
          <Text style={s.ribbonTxt}>Gramática N5</Text>
        </View>

        <Text style={s.title}>Partículas に・へ — destino, dirección y tiempo</Text>
        <Text style={s.subtitle}>Fácil: <Text style={{ fontWeight: "900" }}>に = destino/llegada + TIEMPO</Text>, <Text style={{ fontWeight: "900" }}>へ = dirección (rumbo)</Text>.</Text>

        {/* EXPLICACIÓN (nivel primaria) */}
        <View style={[s.infoCard, { borderColor: INDIGO, backgroundColor: "#EEF2FF" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="information-circle" size={18} color={INDIGO} />
            <Text style={[s.h, { color: INDIGO }]}>Explicación básica</Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}>
              Con verbos de movimiento (<Text style={s.kbd}>いきます / きます / かえります</Text>):
            </Text>
            <Text style={s.li}>• <Text style={s.kbd}>に</Text> marca <Text style={{ fontWeight: "900" }}>destino/llegada</Text>: <Text style={s.kbd}>がっこう に いきます。</Text></Text>
            <Text style={s.li}>• <Text style={s.kbd}>へ</Text> marca <Text style={{ fontWeight: "900" }}>rumbo/dirección</Text>: <Text style={s.kbd}>こうえん へ いきます。</Text></Text>
          </View>

          <View style={s.block}>
            <Text style={s.p}><Text style={s.kbd}>に</Text> también marca <Text style={{ fontWeight: "900" }}>tiempo puntual</Text> (hora/día):</Text>
            <Text style={s.li}>• <Text style={s.kbd}>３じ に はじまります。</Text> → “Empieza a las 3”.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>げつようび に テスト です。</Text> → “El lunes hay examen”.</Text>
          </View>

          {/* Verbos clave con definición y audio */}
          <View style={[s.block, s.verbGrid]}>
            <View style={s.verbCard}>
              <View style={s.rowBetween}>
                <View>
                  <Text style={s.verbJP}>いきます</Text>
                  <Text style={s.verbES}>ir (me muevo hacia allí)</Text>
                </View>
                <Pressable style={s.ttsBtn} onPress={() => speakJP("いきます")}>
                  <Ionicons name="volume-high" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={s.verbCard}>
              <View style={s.rowBetween}>
                <View>
                  <Text style={s.verbJP}>きます</Text>
                  <Text style={s.verbES}>venir (al lugar del hablante)</Text>
                </View>
                <Pressable style={s.ttsBtn} onPress={() => speakJP("きます")}>
                  <Ionicons name="volume-high" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={s.verbCard}>
              <View style={s.rowBetween}>
                <View>
                  <Text style={s.verbJP}>かえります</Text>
                  <Text style={s.verbES}>volver/regresar (a casa/base)</Text>
                </View>
                <Pressable style={s.ttsBtn} onPress={() => speakJP("かえります")}>
                  <Ionicons name="volume-high" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[s.block, s.tipCard]}>
            <Text style={s.tipTitle}>Regla rápida</Text>
            <Text style={s.li}>• <Text style={s.kbd}>に</Text> → destino/llegada o tiempo puntual.</Text>
            <Text style={s.li}>• <Text style={s.kbd}>へ</Text> → rumbo/hacia (sin enfatizar llegada).</Text>
            <Text style={s.li}>• Para TIEMPO, solo <Text style={s.kbd}>に</Text>.</Text>
          </View>
        </View>

        {/* VOCABULARIO */}
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
                  <Pressable style={s.ttsBtn} onPress={() => speakJP(ex.jp)} accessibilityLabel="Pronunciar oración">
                    <Ionicons name="volume-high" size={18} color="#fff" />
                  </Pressable>
                </View>
                <Text style={s.exampleES}>{ex.es}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === ACTIVIDAD 1: QUIZ === */}
        {!started && qIndex === 0 && score === 0 && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="clipboard" size={18} color={INK} />
              <Text style={s.h}>Actividad 1: Quiz (10 preguntas)</Text>
            </View>
            <Text style={s.p}>
              Lee la pista y elige la frase correcta usando <Text style={s.kbd}>に</Text> (destino/tiempo) o <Text style={s.kbd}>へ</Text> (rumbo).
            </Text>
            <View style={s.hintBox}>
              <Text style={s.hintTitle}>Ejemplos rápidos</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>がっこう に いきます。</Text> → destino/llegada</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>こうえん へ いきます。</Text> → hacia el parque</Text>
              <Text style={s.hintBody}><Text style={s.kbd}>３じ に はじまります。</Text> → tiempo puntual</Text>
            </View>
            <Pressable style={s.btnPrimary} onPress={start}>
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={s.btnTxt}>Comenzar</Text>
            </Pressable>
          </View>
        )}

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

        {!started && (qIndex > 0) && (
          <View style={s.playCard}>
            <View style={s.cardHeaderRow}>
              <Ionicons name="ribbon" size={18} color={INK} />
              <Text style={s.h}>Resumen del quiz</Text>
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

        {/* === ACTIVIDAD 2: MINI-JUEGO “CONSTRUYE LA FRASE” === */}
        <View style={[s.infoCard, { borderColor: "#10B981", backgroundColor: "#ECFDF5" }]}>
          <View style={s.cardHeaderRow}>
            <Ionicons name="construct" size={18} color={"#065F46"} />
            <Text style={[s.h, { color: "#065F46" }]}>Actividad 2: Construye la frase (6 rondas)</Text>
          </View>
          <Text style={s.p}>
            Arma la oración en este orden: <Text style={s.kbd}>[Lugar] + [に/へ] + [Verbo]</Text>. Sigue la pista:
            si dice “A (destino)” usa <Text style={s.kbd}>に</Text>, si dice “HACIA (rumbo)” usa <Text style={s.kbd}>へ</Text>.
          </Text>

          <View style={[s.buildCard, buildFlash === "ok" ? s.okFlash : buildFlash === "bad" ? s.badFlash : null]}>
            <View style={s.rowBetween}>
              <Chip icon="bookmark" label={`Ronda ${bIndex + 1}/${buildDeck.length}`} />
            </View>
            <Text style={[s.prompt, { marginTop: 6 }]}>{currentBuild.hint}</Text>

            {/* Slots */}
            <View style={s.slotsWrap}>
              {[0, 1, 2].map((i) => (
                <Pressable key={i} onPress={() => removePicked(i)} style={[s.slot, picked[i] && s.slotFilled]}>
                  <Text style={[s.slotTxt, picked[i] && s.slotTxtFull]}>{picked[i] ?? "＿＿"}</Text>
                </Pressable>
              ))}
            </View>

            {/* Bandejas */}
            <Text style={s.sectionSmall}>1) Lugares</Text>
            <View style={s.trayWrap}>
              {trayPlace.map((t) => (
                <Pressable key={t} onPress={() => onPick(t)} style={s.token}>
                  <Text style={s.tokenTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.sectionSmall}>2) Partícula</Text>
            <View style={s.trayWrap}>
              {trayParticle.map((t) => (
                <Pressable key={t} onPress={() => onPick(t)} style={s.tokenParticle}>
                  <Text style={s.tokenParticleTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.sectionSmall}>3) Verbo</Text>
            <View style={s.trayWrap}>
              {trayVerb.map((t) => (
                <Pressable key={t} onPress={() => onPick(t)} style={s.tokenVerb}>
                  <Text style={s.tokenTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.helpSmall}>Tip: toca un cuadro de arriba para quitarlo y reintentar.</Text>
          </View>

          {/* Al acabar todas las rondas, aparece el modal de logro desde handleFinishAll() */}
        </View>

        {/* CTA Final manual (por si el usuario no quiere terminar todas las rondas) */}
        <View style={{ height: 16 }} />
        <Pressable style={[s.btnPrimary, { alignSelf: "center" }]} onPress={handleFinishAll}>
          <Ionicons name="trophy" size={16} color="#fff" />
          <Text style={s.btnTxt}>Marcar pantalla como completada</Text>
        </Pressable>
        <View style={{ height: 24 }} />
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

  /* Verbos */
  verbGrid: { marginTop: 8, gap: 8 },
  verbCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  verbJP: { fontSize: 18, fontWeight: "900", color: INK },
  verbES: { marginTop: 2, color: "#6B7280", fontSize: 12 },

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

  /* Game (Quiz) */
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

  /* Build game */
  buildCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#10B98120",
    marginTop: 10,
  },
  slotsWrap: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 10, marginBottom: 6, flexWrap: "wrap" },
  slot: {
    minWidth: 70,
    minHeight: 40,
    borderWidth: 2,
    borderColor: "#065F46",
    borderStyle: "dashed",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
  },
  slotFilled: { borderStyle: "solid", backgroundColor: "#ECFDF5" },
  slotTxt: { fontSize: 18, fontWeight: "900", color: "#94A3B8" },
  slotTxtFull: { color: INK },

  trayWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  token: {
    backgroundColor: "#FFF",
    borderColor: "#D1FAE5",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tokenVerb: {
    backgroundColor: "#FFF",
    borderColor: "#BFDBFE",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tokenParticle: {
    backgroundColor: "#FFF",
    borderColor: "#FDE68A",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tokenTxt: { fontSize: 16, fontWeight: "800", color: INK },
  tokenParticleTxt: { fontSize: 18, fontWeight: "900", color: "#B45309" },

  sectionSmall: { fontWeight: "900", marginTop: 6, color: "#065F46" },
  helpSmall: { marginTop: 8, color: "#6b7280", fontSize: 12, textAlign: "center" },

  /* TTS */
  ttsBtn: { backgroundColor: INK, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
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
