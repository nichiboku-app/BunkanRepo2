// src/screens/N5/B5Gramatica/B5_TiempoDuracion.tsx
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
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
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
const WASHI = "rgba(255,255,255,0.86)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

/* ====== TTS helpers ====== */
function speakJa(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    });
  } catch {}
}
const AudioBtn = ({ text, size = 18, label }: { text: string; size?: number; label?: string }) => (
  <Pressable
    onPress={() => speakJa(text)}
    style={s.audioBtn}
    accessibilityRole="button"
    accessibilityLabel={label ?? "Reproducir audio"}
    android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
  >
    <Ionicons name="volume-high-outline" size={size} color={INK} />
  </Pressable>
);

/* =========================
   EXPLICACIÓN / TABLAS (explicaciones en español, oraciones en kana)
   ========================= */
type Row = { icon: any; titulo: string; ejemplos: string[]; regla: string };

const PATRONES_RANGE: Row[] = [
  { icon: "time-outline", titulo: "Horas exactas", ejemplos: ["9じ から 5じ まで"], regla: "Marca el inicio (から) y el fin (まで) de un horario." },
  { icon: "calendar-outline", titulo: "Fechas / días", ejemplos: ["3がつ3にち から 3がつ5にち まで", "げつようび から きんようび まで"], regla: "Rango de días concretos del calendario." },
  { icon: "calendar-number-outline", titulo: "Años y meses", ejemplos: ["2024ねん から 2025ねん まで", "3がつ から 4がつ まで"], regla: "Periodos más largos (meses / años)." },
  { icon: "navigate-outline", titulo: "Lugares", ejemplos: ["いえ から かいしゃ まで", "えき から がっこう まで"], regla: "Trayecto de un lugar a otro." },
  { icon: "list-outline", titulo: "Números", ejemplos: ["1 から 10 まで"], regla: "Rango numérico “de… a…”." },
];

const REGLAS_CLAVE = [
  { icon: "swap-vertical-outline", txt: "Patrón: [A] から [B] まで" },
  { icon: "close-circle-outline", txt: "No uses に junto con から/まで (✗ 9じ に から)" },
  { icon: "hourglass-outline", txt: "Duración pura usa ～かん: 2じかん べんきょう します (sin に)" },
  { icon: "information-circle-outline", txt: "Se puede combinar con lugar/tema: としょかん で 9じ から べんきょう します" },
];

/* =========================
   Ejemplos cortos (con audio)
   ========================= */
const EJEMPLOS = [
  { jp: "9じ から 5じ まで しごと を します。", es: "Trabajo de 9 a 5." },
  { jp: "げつようび から きんようび まで がっこう に いきます。", es: "Voy a la escuela de lunes a viernes." },
  { jp: "3がつ3にち から 3がつ5にち まで りょこう です。", es: "Viajo del 3 al 5 de marzo." },
  { jp: "いえ から かいしゃ まで あるきます。", es: "Camino desde casa hasta la empresa." },
  { jp: "1 から 10 まで かぞえます。", es: "Cuento del 1 al 10." },
];

/* =========================
   Oraciones extra (10) — todas con altavoz
   ========================= */
const ORACIONES = [
  { jp: "6じ に おきます。", es: "Me levanto a las 6." },
  { jp: "7じ から 8じ まで あさごはん を たべます。", es: "Desayuno de 7 a 8." },
  { jp: "30ふん かん べんきょう します。", es: "Estudio durante 30 minutos." },
  { jp: "12じ ごろ でかけます。", es: "Salgo alrededor de las 12." },
  { jp: "きょう から あした まで やすみます。", es: "Descanso desde hoy hasta mañana." },
  { jp: "1じかん うんどう します。", es: "Hago ejercicio 1 hora." },
  { jp: "げつようび から すいようび まで しごと です。", es: "Trabajo de lunes a miércoles." },
  { jp: "3がつ1にち から 3がつ5にち まで りょこう します。", es: "Viajo del 1 al 5 de marzo." },
  { jp: "9じ から ねます。", es: "Me duermo desde las 9." },
  { jp: "9じ から 9じはん まで べんきょう します。", es: "Estudio de 9 a 9:30." },
];

/* =========================
   QUIZ — Arma la oración con から／まで
   ========================= */
type TokenQuiz = {
  id: number;
  promptEs: string;
  hintJp?: string;
  tokens: string[];
  answers: string[];
  explain: string;
};
const Q: TokenQuiz[] = [
  { id: 1, promptEs: "Arma: «Trabajo de 9 a 5.»", hintJp: "9じ / 5じ / しごと / します", tokens: ["5じ まで", "します", "9じ から", "しごと を"], answers: ["9じ から 5じ まで しごと を します"], explain: "Rango temporal: 9じ から 5じ まで + acción." },
  { id: 2, promptEs: "Arma: «Voy a la escuela de lunes a viernes.»", hintJp: "げつようび / きんようび / がっこう / いきます", tokens: ["きんようび まで", "いきます", "げつようび から", "がっこう に"], answers: ["げつようび から きんようび まで がっこう に いきます"], explain: "Días concretos → から／まで." },
  { id: 3, promptEs: "Arma: «El festival es del 3 al 5 de marzo.»", hintJp: "まつり / 3がつ3にち / 3がつ5にち / です", tokens: ["3がつ3にち から", "です", "3がつ5にち まで", "まつり は"], answers: ["まつり は 3がつ3にち から 3がつ5にち まで です"], explain: "Tema + rango + です." },
  { id: 4, promptEs: "Arma: «Desde hoy hasta mañana descanso.»", hintJp: "きょう / あした / やすみます", tokens: ["きょう から", "やすみます", "あした まで"], answers: ["きょう から あした まで やすみます"], explain: "Palabras relativas (きょう・あした) también usan から／まで." },
  { id: 5, promptEs: "Arma: «La biblioteca abre de 10 a 18.»", hintJp: "としょかん / 10じ / 18じ / あいています", tokens: ["18じ まで", "としょかん は", "あいています", "10じ から"], answers: ["としょかん は 10じ から 18じ まで あいています"], explain: "Entidad + rango + estado (あいています)." },
  { id: 6, promptEs: "Arma: «La clase es de 2 a 4.»", hintJp: "クラス / 2じ / 4じ / です", tokens: ["クラス は", "2じ から", "4じ まで", "です"], answers: ["クラス は 2じ から 4じ まで です"], explain: "X は A から B まで です." },
  { id: 7, promptEs: "Arma: «Estamos de vacaciones del 1 al 7 de agosto.»", hintJp: "8がつ1にち / 7にち / やすみ", tokens: ["8がつ1にち から", "やすみ です", "7にち まで"], answers: ["8がつ1にち から 7にち まで やすみ です"], explain: "Fechas concretas → から／まで." },
  { id: 8, promptEs: "Arma: «Cuento del 1 al 10.»", hintJp: "1 / 10 / かぞえます", tokens: ["10 まで", "かぞえます", "1 から"], answers: ["1 から 10 まで かぞえます"], explain: "Rango numérico." },
  { id: 9, promptEs: "Arma: «Voy desde casa hasta la empresa.»", hintJp: "いえ / かいしゃ / いきます", tokens: ["かいしゃ まで", "いえ から", "いきます"], answers: ["いえ から かいしゃ まで いきます"], explain: "Rango de lugar." },
  { id: 10, promptEs: "Arma: «De 6 a 7 estudio japonés.»", hintJp: "6じ / 7じ / にほんご / べんきょう します", tokens: ["にほんご を", "7じ まで", "6じ から", "べんきょう します"], answers: ["6じ から 7じ まで にほんご を べんきょう します"], explain: "Rango + objeto を + verbo." },
];

/* ===== Helpers quiz ===== */
type AnsState = { used: boolean[]; order: number[]; correct?: boolean; showSolution?: boolean };
type AnsMap = Record<number, AnsState>;
function joinTokens(tokens: string[], order: number[]) {
  return order.map((i) => tokens[i]).join(" ");
}

/* =========================
   COMPONENTE
   ========================= */
export default function B5_TiempoDuracion() {
  const { playCorrect, playWrong, ready } = useFeedbackSounds(); // SOLO se usa en el quiz
  const [ans, setAns] = useState<AnsMap>({});

  const score = Q.reduce((acc, q) => acc + (ans[q.id]?.correct ? 1 : 0), 0);

  const onPick = (q: TokenQuiz, idx: number) => {
    setAns((prev) => {
      const cur: AnsState = prev[q.id] ?? { used: Array(q.tokens.length).fill(false), order: [] };
      if (cur.used[idx] || cur.correct) return prev;
      const nextUsed = [...cur.used]; nextUsed[idx] = true;
      const nextOrder = [...cur.order, idx];
      return { ...prev, [q.id]: { ...cur, used: nextUsed, order: nextOrder } };
    });
  };
  const onUndo = (q: TokenQuiz) => {
    setAns((prev) => {
      const cur = prev[q.id]; if (!cur || cur.order.length === 0 || cur.correct) return prev;
      const last = cur.order[cur.order.length - 1];
      const nextOrder = cur.order.slice(0, -1);
      const nextUsed = [...cur.used]; nextUsed[last] = false;
      return { ...prev, [q.id]: { ...cur, used: nextUsed, order: nextOrder } };
    });
  };
  const onReset = (q: TokenQuiz) => {
    setAns((prev) => ({ ...prev, [q.id]: { used: Array(q.tokens.length).fill(false), order: [] } }));
  };
  const onCheck = (q: TokenQuiz) => {
    const cur = ans[q.id]; if (!cur) return;
    const built = joinTokens(q.tokens, cur.order);
    const ok = q.answers.some((a) => a === built);
    Vibration.vibrate(ok ? 12 : 18);
    if (ready) (ok ? playCorrect() : playWrong());
    setAns((prev) => ({ ...prev, [q.id]: { ...prev[q.id], correct: ok } }));
  };
  const onToggleSolution = (q: TokenQuiz) => {
    setAns((prev) => ({
      ...prev,
      [q.id]: {
        ...(prev[q.id] ?? { used: Array(q.tokens.length).fill(false), order: [] }),
        showSolution: !prev[q.id]?.showSolution,
      },
    }));
  };

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
          {Array.from({ length: 14 }).map((_, i) => (
            <Petal key={i} delay={i * 420} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⏳ から・まで / ～かん</Text>
            <Text style={s.h}>Tiempo: duración y rango</Text>
            <Text style={s.sub}>
              <Text style={s.bold}>から</Text> = “desde”; <Text style={s.bold}>まで</Text> = “hasta”. Para “durante X tiempo”, usa <Text style={s.bold}>～かん</Text> (sin に).
            </Text>
          </View>

          {/* Reglas clave */}
          <View style={s.rules}>
            {REGLAS_CLAVE.map((r, i) => (
              <View key={i} style={s.ruleItem}>
                <Ionicons name={r.icon as any} size={16} color={INK} />
                <Text style={s.ruleTxt}>{r.txt}</Text>
              </View>
            ))}
          </View>

          {/* Tabla con scroll horizontal y audio por ejemplo */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="reader-outline" size={16} color={INK} /> Patrones comunes con から／まで
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todos</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 800 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colTipo]}>Tipo</Text>
                  <Text style={[s.th, s.colEj]}>Ejemplo（にほんご）</Text>
                  <Text style={[s.th, s.colRegla]}>Nota</Text>
                </View>

                {PATRONES_RANGE.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <View style={[s.tdBox, s.colTipo]}>
                      <View style={s.typeBadge}>
                        <Ionicons name={r.icon as any} size={14} color={INK} />
                        <Text style={s.typeTxt}>{r.titulo}</Text>
                      </View>
                    </View>

                    <View style={[s.tdBox, s.colEj, { gap: 6 }]}>
                      {r.ejemplos.map((ej, k) => (
                        <View key={k} style={s.exRow}>
                          <Text style={s.tdText}>{ej}</Text>
                          <AudioBtn text={ej} size={16} label={`Escuchar ejemplo ${k + 1}`} />
                        </View>
                      ))}
                    </View>

                    <View style={[s.tdBox, s.colRegla]}>
                      <Text style={s.tdText}>{r.regla}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Ejemplos cortos con audio */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Ejemplos</Text>
            </View>
            {EJEMPLOS.map((e, i) => (
              <View key={i} style={[s.row, { gap: 6 }]}>
                <View style={s.jpRow}>
                  <Text style={s.jp}>{e.jp}</Text>
                  <AudioBtn text={e.jp} label="Escuchar oración" />
                </View>
                <Text style={s.es}>{e.es}</Text>
              </View>
            ))}
          </View>

          {/* 10 oraciones extra con audio */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="list-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>10 oraciones para practicar</Text>
            </View>
            {ORACIONES.map((e, i) => (
              <View key={i} style={[s.row, { gap: 6 }]}>
                <View style={s.jpRow}>
                  <Text style={s.jp}>{e.jp}</Text>
                  <AudioBtn text={e.jp} label="Escuchar oración" />
                </View>
                <Text style={s.es}>{e.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== QUIZ ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="construct-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz: arma la oración con から／まで</Text>
            </View>

            <View style={s.score}>
              <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
              <Text style={s.scoreTxt}>Aciertos: {score} / {Q.length}</Text>
            </View>

            {Q.map((q) => {
              const cur: AnsState = ans[q.id] ?? { used: Array(q.tokens.length).fill(false), order: [] };
              const built = joinTokens(q.tokens, cur.order);
              const isRight = cur.correct === true;

              return (
                <View key={q.id} style={s.quizItem}>
                  <Text style={s.quizPrompt}>• {q.promptEs}</Text>
                  {q.hintJp ? (
                    <View style={s.hintRow}>
                      <Ionicons name="bulb-outline" size={14} color={INK} />
                      <Text style={s.hintTxt}>{q.hintJp}</Text>
                    </View>
                  ) : null}

                  <View style={s.assemblyBox}>
                    <Text style={s.assembly}>{built || "Toca las piezas en orden…"}</Text>
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
                      onPress={() => onCheck(q)}
                      disabled={isRight || cur.order.length === 0}
                      style={[s.btnPrimary, (isRight || cur.order.length === 0) && s.btnDisabled]}
                    >
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text style={[s.btnTxt, { color: "#fff" }]}>Comprobar</Text>
                    </Pressable>
                    <Pressable onPress={() => onToggleSolution(q)} style={s.btnGhost}>
                      <Ionicons name="eye-outline" size={16} color={INK} />
                      <Text style={s.btnTxt}>Solución</Text>
                    </Pressable>
                  </View>

                  {typeof cur.correct !== "undefined" ? (
                    <View style={[s.resultBox, cur.correct ? s.okBox : s.errBox]}>
                      <Text style={[s.resultTitle, cur.correct ? s.okTxt : s.errTxt]}>
                        {cur.correct ? "¡Correcto!" : "Incorrecto"}
                      </Text>
                      <Text style={s.resultMsg}>{q.explain}</Text>
                    </View>
                  ) : null}

                  {cur.showSolution ? (
                    <View style={s.solutionBox}>
                      <Ionicons name="key-outline" size={14} color={INK} />
                      <Text style={s.solutionTxt}>{q.answers[0]}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

/* =========================
   ESTILOS
   ========================= */
const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },

  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },
  bold: { fontWeight: "900", color: INK },

  rules: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
  },
  ruleItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleTxt: { color: INK, flexShrink: 1 }, // evita desborde

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

  table: { minWidth: 780 },
  tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  colTipo: { width: 180, paddingHorizontal: 6 },
  colEj: { width: 360, paddingHorizontal: 6 },
  colRegla: { width: 280, paddingHorizontal: 6 },

  tdBox: { justifyContent: "center" },
  tdText: { color: INK, fontSize: 14, lineHeight: 18, flexShrink: 1 },

  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeTxt: { fontWeight: "800", fontSize: 12 },

  // fila ejemplo + audio
  exRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },

  // botón audio
  audioBtn: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  card: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },

  jpRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  jp: { fontSize: 16, fontWeight: "800", color: INK, flexShrink: 1 },
  es: { color: INK, opacity: 0.9, marginTop: 2 },

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

  quizItem: { backgroundColor: WASHI, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 12, gap: 8 },
  quizPrompt: { fontWeight: "900", color: INK },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintTxt: { color: INK, opacity: 0.9, fontSize: 12 },

  assemblyBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 10,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
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
  tokenUsed: { opacity: 0.35 },
  tokenDisabled: { opacity: 0.5 },
  tokenTxt: { color: INK, fontWeight: "800", fontSize: 14 },

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
  btnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
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

  solutionBox: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  solutionTxt: { color: INK, fontWeight: "800" },
});
