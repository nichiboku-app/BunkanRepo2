// src/screens/N5/B5Gramatica/B5_HorariosRutina.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

const { width: W, height: H } = Dimensions.get("window");

/** 🌸 Pétalos */
function Petal({ delay = 0 }: { delay?: number }) {
  const fall = useRef(new Animated.Value(0)).current;
  const x0 = useRef(Math.random() * W).current;
  const size = useRef(16 + Math.random() * 16).current;
  const duration = useRef(9000 + Math.random() * 6000).current;
  const drift = useRef(20 + Math.random() * 40).current;
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-60, H + 60] });
  const translateX = fall.interpolate({ inputRange: [0, 0.5, 1], outputRange: [x0 - drift, x0 + drift, x0 - drift] });

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(fall, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duration, fall]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: size,
        transform: [{ translateX }, { translateY }, { rotate }],
        opacity: Platform.select({ ios: 0.9, android: 0.85, default: 0.9 }),
      }}
    >
      🌸
    </Animated.Text>
  );
}

/* ===== Paleta ===== */
const WASHI = "rgba(255,255,255,0.9)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

/* ======= Utilidad TTS ======= */
function speakJa(text: string) {
  // velocidad un poquito más lenta en iOS para claridad
  Speech.speak(text, {
    language: "ja-JP",
    rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    pitch: 1.0,
  });
}
function stopTTS() {
  Speech.stop();
}

/* =========================
   CONTENIDO DIDÁCTICO (con TTS)
   ========================= */

/** Tarjeta amarilla (reglas) — ejemplo con audio */
const HOW = [
  {
    line: "に = “en ese momento exacto”.",
    jp: "7じ に おきます。",
    tts: "しちじ に おきます。",
  },
  {
    line: "から／まで = “desde / hasta”.",
    jp: "8じ から 11じ まで べんきょう します。",
    tts: "はちじ から じゅういちじ まで べんきょう します。",
  },
  {
    line: "ごろ = “más o menos a esa hora” (sin に).",
    jp: "12じ ごろ たべます。",
    tts: "じゅうにじ ごろ たべます。",
  },
];

/** Tabla de reglas */
const TABLA = [
  {
    tipo: "に（punto exacto）",
    que: "Para horas/fechas exactas.",
    formula: "[Hora/Fecha] に + Verbo",
    ejemplo: "7じ に おきます。",
    tts: "しちじ に おきます。",
    mini: "🎯 Marca un punto preciso.",
  },
  {
    tipo: "から（desde）",
    que: "Inicio de un rango.",
    formula: "[A] から + [Acción/Periodo]",
    ejemplo: "8じ から べんきょう します。",
    tts: "はちじ から べんきょう します。",
    mini: "🚦 Empieza aquí.",
  },
  {
    tipo: "まで（hasta）",
    que: "Final del rango.",
    formula: "[B] まで + [Acción/Periodo]",
    ejemplo: "11じ まで べんきょう します。",
    tts: "じゅういちじ まで べんきょう します。",
    mini: "🏁 Termina aquí.",
  },
  {
    tipo: "から～まで（de… a…）",
    que: "Rango completo.",
    formula: "[A] から [B] まで + Acción",
    ejemplo: "8じ から 11じ まで べんきょう します。",
    tts: "はちじ から じゅういちじ まで べんきょう します。",
    mini: "↔️ De A a B.",
  },
  {
    tipo: "ごろ（aprox.）",
    que: "Hora aproximada.",
    formula: "[Hora] ごろ + Verbo",
    ejemplo: "12じ ごろ たべます。",
    tts: "じゅうにじ ごろ たべます。",
    mini: "🌗 Alrededor de esa hora.",
  },
];

/** 12 oraciones de ejemplo (cada una con TTS) */
const RUTINA = [
  { jp: "7じ に おきます。", es: "Me levanto a las 7.", nota: "Punto exacto → に", tts: "しちじ に おきます。" },
  { jp: "8じ から 11じ まで べんきょう します.", es: "Estudio de 8 a 11.", nota: "Rango → から～まで", tts: "はちじ から じゅういちじ まで べんきょう します。" },
  { jp: "12じ ごろ ひるごはん を たべます。", es: "Como alrededor de las 12.", nota: "Aproximado → ごろ", tts: "じゅうにじ ごろ ひるごはん を たべます。" },
  { jp: "6じ に ジムへ いきます。", es: "Voy al gym a las 6.", nota: "Punto exacto → に", tts: "ろくじ に じむ へ いきます。" },
  { jp: "6じ から 7じ まで にほんご を べんきょう します。", es: "Estudio japonés de 6 a 7.", nota: "Rango → から～まで", tts: "ろくじ から しちじ まで にほんご を べんきょう します。" },
  { jp: "7じ ごろ ねます。", es: "Duermo cerca de las 7.", nota: "Aproximado → ごろ", tts: "しちじ ごろ ねます。" },
  { jp: "あさ 7じ に コーヒー を のみます。", es: "Por la mañana, tomo café a las 7.", nota: "Hora exacta → に", tts: "あさ しちじ に こーひー を のみます。" },
  { jp: "9じ から しごと を します。", es: "Trabajo desde las 9.", nota: "Inicio → から", tts: "くじ から しごと を します。" },
  { jp: "5じ まで しごと です。", es: "Trabajo hasta las 5.", nota: "Fin → まで", tts: "ごじ まで しごと です。" },
  { jp: "よる 8じ ごろ うち に かえります。", es: "Vuelvo a casa sobre las 8 de la noche.", nota: "Aproximado → ごろ", tts: "よる はちじ ごろ うち に かえります。" },
  { jp: "10じ に ねます。", es: "Me acuesto a las 10.", nota: "Punto exacto → に", tts: "じゅうじ に ねます。" },
  { jp: "1じ から 2じ まで やすみ ます。", es: "Descanso de 1 a 2.", nota: "Rango → から～まで", tts: "いちじ から にじ まで やすみ ます。" },
];

/* =========================
   QUIZ 1 — Elige la partícula (hook SOLO aquí)
   ========================= */
type QA = { id: number; prompt: string; opciones: string[]; answer: string; explain: string };
const QUIZ1: QA[] = [
  { id: 1, prompt: "（　）7じ おきます。", opciones: ["に", "から", "まで", "ごろ"], answer: "に", explain: "Punto exacto → に." },
  { id: 2, prompt: "8じ （　） 11じ べんきょう します。", opciones: ["に", "から", "まで", "ごろ"], answer: "から", explain: "Inicio del rango → から." },
  { id: 3, prompt: "8じ から 11じ （　） べんきょう します。", opciones: ["に", "から", "まで", "ごろ"], answer: "まで", explain: "Fin del rango → まで." },
  { id: 4, prompt: "12じ （　） ひるごはん を たべます。", opciones: ["に", "から", "まで", "ごろ"], answer: "ごろ", explain: "Aproximado → ごろ (sin に)." },
  { id: 5, prompt: "6じ （　） ジムへ いきます。", opciones: ["に", "から", "まで", "ごろ"], answer: "に", explain: "Punto exacto → に." },
  { id: 6, prompt: "9じ （　） しごと を します。", opciones: ["に", "から", "まで", "ごろ"], answer: "から", explain: "‘Desde’ → から." },
  { id: 7, prompt: "5じ （　） しごと です。", opciones: ["に", "から", "まで", "ごろ"], answer: "まで", explain: "‘Hasta’ → まで." },
  { id: 8, prompt: "よる 8じ （　） かえります。", opciones: ["に", "から", "まで", "ごろ"], answer: "ごろ", explain: "Aproximado → ごろ." },
  { id: 9, prompt: "10じ （　） ねます。", opciones: ["に", "から", "まで", "ごろ"], answer: "に", explain: "Punto exacto → に." },
  { id:10, prompt: "1じ （　） 2じ （   ） やすみ ます。", opciones: ["に", "から", "まで", "ごろ"], answer: "から", explain: "Primero marca el inicio: 1じ から… (luego 2じ まで)." },
];

type AnsMap1 = Record<number, { choice?: string; correct?: boolean }>;

/* =========================
   QUIZ 2 — Arma la oración (hook SOLO aquí)
   ========================= */
type TokenQuiz = { id: number; tokens: string[]; answers: string[]; hint?: string; explain: string };
type AnsState = { used: boolean[]; order: number[]; correct?: boolean };

const QUIZ2: TokenQuiz[] = [
  {
    id: 1,
    tokens: ["8じ", "から", "11じ", "まで", "べんきょう", "します"],
    answers: ["8じ から 11じ まで べんきょう します"],
    hint: "Rango A→B",
    explain: "Rango completo: [A] から [B] まで + acción.",
  },
  {
    id: 2,
    tokens: ["12じ", "ごろ", "ひるごはん", "を", "たべます"],
    answers: ["12じ ごろ ひるごはん を たべます"],
    hint: "Aproximado",
    explain: "Hora aproximada: [Hora] ごろ + verbo (sin に).",
  },
  {
    id: 3,
    tokens: ["7じ", "に", "おきます"],
    answers: ["7じ に おきます"],
    explain: "Punto exacto: [Hora] に + verbo.",
  },
  {
    id: 4,
    tokens: ["9じ", "から", "しごと", "を", "します"],
    answers: ["9じ から しごと を します"],
    explain: "‘Desde’ marca inicio: 〜から + acción.",
  },
  {
    id: 5,
    tokens: ["5じ", "まで", "しごと", "です"],
    answers: ["5じ まで しごと です"],
    explain: "‘Hasta’ marca fin: 〜まで.",
  },
];

function joinTokens(tokens: string[], order: number[]) {
  return order.map((i) => tokens[i]).join(" ");
}

/* =========================
   COMPONENTE
   ========================= */
export default function B5_HorariosRutina() {
  // ✅ Hook de sonidos SOLO en ejercicios
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // Estado Quiz 1
  const [ans1, setAns1] = useState<AnsMap1>({});
  const score1 = Object.values(ans1).filter((a) => a.correct).length;

  // Estado Quiz 2
  const [ans2, setAns2] = useState<Record<number, AnsState>>({});
  const score2 = QUIZ2.reduce((acc, q) => acc + (ans2[q.id]?.correct ? 1 : 0), 0);

  const choose = (q: QA, choice: string) => {
    const ok = q.answer === choice;
    Vibration.vibrate(ok ? 12 : 18);
    if (ready) (ok ? playCorrect() : playWrong());
    setAns1((prev) => ({ ...prev, [q.id]: { choice, correct: ok } }));
  };

  const onPick = (q: TokenQuiz, idx: number) => {
    setAns2((prev) => {
      const cur = prev[q.id] ?? { used: Array(q.tokens.length).fill(false), order: [] };
      if (cur.used[idx] || cur.correct) return prev;
      const used = [...cur.used]; used[idx] = true;
      const order = [...cur.order, idx];
      return { ...prev, [q.id]: { ...cur, used, order } };
    });
  };
  const onUndo = (q: TokenQuiz) => {
    setAns2((prev) => {
      const cur = prev[q.id]; if (!cur || cur.order.length === 0 || cur.correct) return prev;
      const last = cur.order[cur.order.length - 1];
      const used = [...cur.used]; used[last] = false;
      const order = cur.order.slice(0, -1);
      return { ...prev, [q.id]: { ...cur, used, order } };
    });
  };
  const onReset = (q: TokenQuiz) => {
    setAns2((prev) => ({ ...prev, [q.id]: { used: Array(q.tokens.length).fill(false), order: [] } }));
  };
  const onCheck = (q: TokenQuiz) => {
    const cur = ans2[q.id]; if (!cur) return;
    const built = joinTokens(q.tokens, cur.order);
    const ok = q.answers.some((a) => a === built);
    Vibration.vibrate(ok ? 12 : 18);
    if (ready) (ok ? playCorrect() : playWrong());
    setAns2((prev) => ({ ...prev, [q.id]: { ...prev[q.id], correct: ok } }));
  };

  useEffect(() => {
    // limpiar TTS al salir
    return () => stopTTS();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.9 }}
      >
        {/* 🌸 Pétalos */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Petal key={i} delay={i * 400} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>に・から・まで・ごろ</Text>
            <Text style={s.h}>Horarios y rutina — explicado como en primaria</Text>
            <Text style={s.sub}>
              Usa <Text style={s.bold}>に</Text> para una hora exacta,{" "}
              <Text style={s.bold}>から／まで</Text> para el camino de A→B, y{" "}
              <Text style={s.bold}>ごろ</Text> cuando es aproximado.
            </Text>
          </View>

          {/* Tarjeta amarilla “como primaria” con audios */}
          <View style={s.how}>
            <View style={s.howRow}>
              <Ionicons name="time-outline" size={18} color={INK} />
              <Text style={s.howTitle}>Reglas fáciles</Text>
            </View>
            {HOW.map((h, i) => (
              <View key={i} style={s.howLineRow}>
                <Text style={s.howLine}>
                  <Text style={s.kbd}>
                    {h.line.split("=")[0].trim()}
                  </Text>{" "}
                  = {h.line.split("=").slice(1).join("=").trim()}{" "}
                  <Text style={s.eg}>{h.jp}</Text>
                </Text>
                <Pressable
                  accessibilityLabel={`Escuchar ejemplo ${i + 1}`}
                  onPress={() => speakJa(h.tts)}
                  onLongPress={stopTTS}
                  style={s.soundBtn}
                >
                  <Ionicons name="volume-high-outline" size={16} color={INK} />
                  <Text style={s.soundTxt}>Escuchar</Text>
                </Pressable>
              </View>
            ))}
            <View style={s.hintRow}>
              <Ionicons name="alert-circle-outline" size={13} color={INK} />
              <Text style={s.hintTxt}>Toca 🔊 para oír. Mantén pulsado para <Text style={{ fontWeight: "800" }}>detener</Text>.</Text>
            </View>
          </View>

          {/* Tabla con fórmulas (scroll horizontal) + audios en “Ejemplo” */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}><Ionicons name="reader-outline" size={16} color={INK} /> Tabla de uso rápido</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todo</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 820 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colTipo]}>Partícula</Text>
                  <Text style={[s.th, s.colQue]}>¿Para qué?</Text>
                  <Text style={[s.th, s.colFormula]}>Fórmula</Text>
                  <Text style={[s.th, s.colEj]}>Ejemplo</Text>
                  <Text style={[s.th, s.colMini]}>Mini truco</Text>
                </View>

                {TABLA.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colTipo]}>{r.tipo}</Text>
                    <Text style={[s.td, s.colQue]}>{r.que}</Text>
                    <Text style={[s.td, s.colFormula]}>{r.formula}</Text>

                    <View style={[s.tdEjCell, s.colEj]}>
                      <Text style={s.tdEjText}>{r.ejemplo}</Text>
                      <Pressable
                        onPress={() => speakJa(r.tts)}
                        onLongPress={stopTTS}
                        style={s.tdPlay}
                      >
                        <Ionicons name="play-circle-outline" size={18} color={INK} />
                      </Pressable>
                    </View>

                    <Text style={[s.td, s.colMini]}>{r.mini}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Ejemplos claros (cada fila con audio) */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Ejemplos</Text>
            </View>
            {RUTINA.map((r, i) => (
              <View key={i} style={s.row}>
                <View style={s.rowTop}>
                  <Text style={s.jp}>{r.jp}</Text>
                  <Pressable onPress={() => speakJa(r.tts)} onLongPress={stopTTS} style={s.inlineAudio}>
                    <Ionicons name="volume-high-outline" size={16} color={INK} />
                  </Pressable>
                </View>
                <Text style={s.es}>{r.es}</Text>
                <Text style={s.nota}>• {r.nota}</Text>
              </View>
            ))}
          </View>

          {/* ===== QUIZ 1: elige la partícula ===== */}
          <QuizParticulas ans1={ans1} setAns1={setAns1} />

          {/* ===== QUIZ 2: arma la oración ===== */}
          <QuizArmar
            ans2={ans2}
            setAns2={setAns2}
            onPick={onPick}
            onUndo={onUndo}
            onReset={onReset}
            onCheck={onCheck}
            score2={score2}
          />

          <View style={{ height: 32 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

/* ===== Subcomponentes de Quiz (para mantener limpio el árbol) ===== */
function QuizParticulas({ ans1, setAns1 }: { ans1: AnsMap1; setAns1: React.Dispatch<React.SetStateAction<AnsMap1>> }) {
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const score1 = Object.values(ans1).filter((a) => a.correct).length;

  const choose = (q: QA, choice: string) => {
    const ok = q.answer === choice;
    Vibration.vibrate(ok ? 12 : 18);
    if (ready) (ok ? playCorrect() : playWrong());
    setAns1((prev) => ({ ...prev, [q.id]: { choice, correct: ok } }));
  };

  return (
    <View style={s.quizCard}>
      <View style={s.cardHeader}>
        <Ionicons name="school-outline" size={20} color={INK} />
        <Text style={s.cardTitle}>Quiz 1: elige la partícula correcta</Text>
      </View>

      <View style={s.score}>
        <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
        <Text style={s.scoreTxt}>Aciertos: {score1} / {QUIZ1.length}</Text>
      </View>

      {QUIZ1.map((q) => {
        const picked = ans1[q.id]?.choice;
        const isRight = ans1[q.id]?.correct;
        return (
          <View key={q.id} style={s.quizItem}>
            <Text style={s.quizPrompt}>• {q.prompt}</Text>
            <View style={s.choiceRow}>
              {q.opciones.map((op) => (
                <Pressable
                  key={op}
                  onPress={() => choose(q, op)}
                  style={[
                    s.choiceBtn,
                    picked === op && (isRight ? s.choiceRight : s.choiceWrong),
                  ]}
                  android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                >
                  <Text style={s.choiceTag}>{op}</Text>
                </Pressable>
              ))}
            </View>
            {picked ? (
              <View style={[s.resultBox, isRight ? s.okBox : s.errBox]}>
                <Text style={[s.resultTitle, isRight ? s.okTxt : s.errTxt]}>
                  {isRight ? "¡Correcto!" : "Incorrecto"}
                </Text>
                <Text style={s.resultMsg}>{q.explain}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function QuizArmar(props: {
  ans2: Record<number, AnsState>;
  setAns2: React.Dispatch<React.SetStateAction<Record<number, AnsState>>>;
  onPick: (q: TokenQuiz, idx: number) => void;
  onUndo: (q: TokenQuiz) => void;
  onReset: (q: TokenQuiz) => void;
  onCheck: (q: TokenQuiz) => void;
  score2: number;
}) {
  const { ans2, setAns2, onPick, onUndo, onReset, onCheck, score2 } = props;
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // (No añadimos TTS en los ejercicios para no mezclar con el hook; solo feedback)
  return (
    <View style={s.quizCard}>
      <View style={s.cardHeader}>
        <Ionicons name="construct-outline" size={20} color={INK} />
        <Text style={s.cardTitle}>Quiz 2: arma la oración</Text>
      </View>

      <View style={s.score}>
        <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
        <Text style={s.scoreTxt}>Aciertos: {score2} / {QUIZ2.length}</Text>
      </View>

      {QUIZ2.map((q) => {
        const cur = ans2[q.id] ?? { used: Array(q.tokens.length).fill(false), order: [] };
        const built = joinTokens(q.tokens, cur.order);
        const isRight = cur.correct === true;

        return (
          <View key={q.id} style={s.quizItem}>
            {q.hint ? (
              <View style={s.hintRow}>
                <Ionicons name="bulb-outline" size={14} color={INK} />
                <Text style={s.hintTxt}>{q.hint}</Text>
              </View>
            ) : null}

            <View style={s.assemblyBox}>
              <Text style={s.assembly}>{built || "Toca los bloques para formar la oración…"}</Text>
            </View>

            <View style={s.tokensRow}>
              {q.tokens.map((t, i) => {
                const used = cur.used[i];
                return (
                  <Pressable
                    key={i}
                    onPress={() => onPick(q, i)}
                    disabled={used || isRight}
                    style={[s.token, used ? s.tokenUsed : null, isRight ? s.tokenDisabled : null]}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                  >
                    <Text style={s.tokenTxt}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.actions}>
              <Pressable
                onPress={() => onUndo(q)}
                disabled={isRight || cur.order.length === 0}
                style={[s.btn, (isRight || cur.order.length === 0) && s.btnDisabled]}
              >
                <Ionicons name="arrow-undo-outline" size={16} color={INK} />
                <Text style={s.btnTxt}>Deshacer</Text>
              </Pressable>
              <Pressable
                onPress={() => onReset(q)}
                disabled={isRight || cur.order.length === 0}
                style={[s.btn, (isRight || cur.order.length === 0) && s.btnDisabled]}
              >
                <Ionicons name="refresh-outline" size={16} color={INK} />
                <Text style={s.btnTxt}>Reiniciar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const ok = q.answers.some((a) => a === built);
                  Vibration.vibrate(ok ? 12 : 18);
                  if (ready) (ok ? playCorrect() : playWrong());
                  onCheck(q);
                }}
                disabled={isRight || cur.order.length === 0}
                style={[s.btnPrimary, (isRight || cur.order.length === 0) && s.btnDisabled]}
              >
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text style={[s.btnTxt, { color: "#fff" }]}>Comprobar</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* =========================
   ESTILOS
   ========================= */
const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },

  header: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },
  bold: { fontWeight: "900", color: INK },

  /* Tarjeta amarilla (como primaria) */
  how: {
    backgroundColor: "rgba(255,251,240,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
  },
  howRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  howTitle: { fontWeight: "900", color: INK },
  howLineRow: {
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  howLine: { color: INK, lineHeight: 18 },
  soundBtn: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.95)" },
  soundTxt: { color: INK, fontWeight: "800", fontSize: 12 },
  kbd: {
    fontWeight: "900",
    borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  eg: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }), color: INK },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" },
  hintTxt: { color: INK, fontSize: 12, flexShrink: 1 },

  /* Tabla */
  tableWrap: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    gap: 8,
  },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tableTitle: { fontWeight: "900", color: INK },
  tableHint: { fontSize: 12, color: INK, opacity: 0.9 },

  table: { minWidth: 820 },
  tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, gap: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 4 },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  colTipo: { width: 160, paddingHorizontal: 6 },
  colQue: { width: 190, paddingHorizontal: 6 },
  colFormula: { width: 200, paddingHorizontal: 6 },
  colEj: { width: 180, paddingHorizontal: 6 },
  colMini: { width: 200, paddingHorizontal: 6 },

  td: { color: INK, fontSize: 14, lineHeight: 18 },
  tdEjCell: { flexDirection: "row", alignItems: "center", gap: 8 },
  tdEjText: { color: INK, fontSize: 14, lineHeight: 18 },
  tdPlay: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.95)" },

  /* Tarjeta ejemplos */
  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  inlineAudio: { borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.95)" },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  es: { color: INK, opacity: 0.9, marginTop: 2 },
  nota: { color: INK, opacity: 0.8, marginTop: 2, fontSize: 12 },

  /* Quiz comunes */
  quizCard: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 10,
  },
  score: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  scoreTxt: { color: INK, fontWeight: "800" },

  quizItem: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  quizPrompt: { fontWeight: "900", color: INK },

  /* Quiz 1: opciones */
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceBtn: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
    alignItems: "center",
  },
  choiceTag: { fontWeight: "900", color: INK, fontSize: 16 },
  choiceRight: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.10)" },
  choiceWrong: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.10)" },

  /* Quiz 2: tokens */
  assemblyBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 10,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  assembly: { color: INK, fontWeight: "800" },
  tokensRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  token: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tokenTxt: { color: INK, fontWeight: "800", fontSize: 14 },
  tokenUsed: { opacity: 0.35 },
  tokenDisabled: { opacity: 0.55 },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#3b2f2f",
  },
  btnTxt: { color: INK, fontWeight: "800" },
  btnDisabled: { opacity: 0.5 },

  resultBox: { marginTop: 4, borderRadius: 12, borderWidth: 1, padding: 10 },
  okBox: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.08)" },
  errBox: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.08)" },
  resultTitle: { fontWeight: "900", marginBottom: 4 },
  okTxt: { color: "#2b7a2b" },
  errTxt: { color: "#a33833" },
  resultMsg: { color: INK, lineHeight: 18 },
});
