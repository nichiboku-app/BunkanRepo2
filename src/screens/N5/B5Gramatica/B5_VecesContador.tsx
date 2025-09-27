// src/screens/N5/B5Gramatica/B5_VecesContador.tsx
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

/** 🌸 Pétalos decorativos */
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
const WASHI = "rgba(255,255,255,0.9)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

/* ====== TTS helpers ====== */
function speakJa(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.48, android: 1.0, default: 1.0 }),
    });
  } catch {}
}

function AudioButton({ text, size = 18, label }: { text: string; size?: number; label?: string }) {
  return (
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
}

/* =========================
   Datos didácticos
   ========================= */
const REGLAS = [
  { icon: "ellipse-outline", txt: "回（かい） = “veces”. Cuenta cuántas veces repites algo." },
  { icon: "git-branch-outline", txt: "Patrón 1: [Periodo] に [Veces] 回 + Verbo  →  しゅう に 2回 およぎます。" },
  { icon: "checkmark-done-outline", txt: "Patrón 2: [Veces] 回 + Verbo  →  3回 れんしゅう しました。" },
  { icon: "help-circle-outline", txt: "Pregunta: 何回（なんかい）？ = ¿Cuántas veces?" },
  { icon: "sparkles-outline", txt: "Ojo con 1,6,8,10回: いっかい／ろっかい／はっかい／じゅっかい（じっかい）。" },
];

type Row = { numero: string; lectura: string; nota?: string; tts?: string };
const LECTURAS: Row[] = [
  { numero: "1回", lectura: "いっかい", tts: "いっかい" },
  { numero: "2回", lectura: "にかい", tts: "にかい" },
  { numero: "3回", lectura: "さんかい", tts: "さんかい" },
  { numero: "4回", lectura: "よんかい", tts: "よんかい" },
  { numero: "5回", lectura: "ごかい", tts: "ごかい" },
  { numero: "6回", lectura: "ろっかい", tts: "ろっかい" },
  { numero: "7回", lectura: "ななかい", tts: "ななかい" },
  { numero: "8回", lectura: "はっかい", nota: "（はちかい も OK）", tts: "はっかい" },
  { numero: "9回", lectura: "きゅうかい", tts: "きゅうかい" },
  { numero: "10回", lectura: "じゅっかい／じっかい", tts: "じゅっかい", },
  { numero: "何回", lectura: "なんかい", nota: "¿cuántas veces?", tts: "なんかい" },
];

const ORACIONES = [
  { jp: "1にち に 2回 は を みがきます。", es: "Me cepillo los dientes 2 veces al día." },
  { jp: "しゅう に 3回 ぷーる で およぎます。", es: "Nado 3 veces por semana." },
  { jp: "つき に 1回 びょういん へ いきます。", es: "Voy al médico 1 vez al mes." },
  { jp: "ねん に 1回 りょこう します。", es: "Viajo 1 vez al año." },
  { jp: "きのう 3回 にほんご を れんしゅう しました。", es: "Ayer practiqué japonés 3 veces." },
  { jp: "なん回 て を あらいますか。", es: "¿Cuántas veces te lavas las manos?" },
  { jp: "8回 うんどう しました。", es: "Hice ejercicio 8 veces." },
  { jp: "きょう は 1回 だけ べんきょう しました。", es: "Hoy solo estudié 1 vez." },
  { jp: "しゅう に 1回 ともだち と あいます。", es: "Veo a mis amigos 1 vez por semana." },
  { jp: "つき に 3回 てれび を みます。", es: "Veo la tele 3 veces al mes." },
];

/* =========================
   QUIZ 1 — Elige la lectura correcta
   ========================= */
type QA1 = { id: number; pregunta: string; opciones: string[]; answer: string; explain: string };
const QUIZ1: QA1[] = [
  { id: 1, pregunta: "6回 の よみかた は？", opciones: ["ろくかい", "ろっかい", "ろうかい"], answer: "ろっかい", explain: "6→促音（っ）で『ろっかい』。" },
  { id: 2, pregunta: "8回 の よみかた は？", opciones: ["はっかい", "はちかい", "はつかい"], answer: "はっかい", explain: "基本は『はっかい』（はちかい も OK）。" },
  { id: 3, pregunta: "10回 の よみかた は？", opciones: ["じゅっかい／じっかい", "じゅうかい", "じゅかい"], answer: "じゅっかい／じっかい", explain: "10→『じゅっかい（じっかい）』。" },
  { id: 4, pregunta: "1回 の よみかた は？", opciones: ["いちかい", "いっかい", "ひとかい"], answer: "いっかい", explain: "1→『いっかい』。" },
  { id: 5, pregunta: "何回 の よみかた は？", opciones: ["なんかい", "なにかい", "なんこ"], answer: "なんかい", explain: "疑問：何回（なんかい）。" },
  { id: 6, pregunta: "4回 の よみかた は？", opciones: ["しかい", "よっかい", "よんかい"], answer: "よんかい", explain: "4→『よんかい』。" },
];

/* =========================
   QUIZ 2 — Arma la oración
   ========================= */
type TokenQuiz = { id: number; tokens: string[]; answers: string[]; tip?: string; explain: string };
type AnsState = { used: boolean[]; order: number[]; correct?: boolean };

const QUIZ2: TokenQuiz[] = [
  {
    id: 1,
    tokens: ["しゅう", "に", "2回", "にほんご", "を", "れんしゅう", "します"],
    answers: ["しゅう に 2回 にほんご を れんしゅう します"],
    tip: "Período + に + 回",
    explain: "Patrón 1: [Periodo] に [Veces] 回 + Verbo。",
  },
  {
    id: 2,
    tokens: ["つき", "に", "1回", "びょういん", "へ", "いきます"],
    answers: ["つき に 1回 びょういん へ いきます"],
    explain: "Período: つき（mes）。",
  },
  {
    id: 3,
    tokens: ["8回", "うんどう", "しました"],
    answers: ["8回 うんどう しました"],
    tip: "Solo 回 + verbo",
    explain: "Patrón 2: [Veces] 回 + Verbo。",
  },
  {
    id: 4,
    tokens: ["1にち", "に", "3回", "て", "を", "あらいます"],
    answers: ["1にち に 3回 て を あらいます"],
    explain: "1日（いちにち）= un día → 1にち。",
  },
  {
    id: 5,
    tokens: ["なん回", "てれび", "を", "みます", "か"],
    answers: ["なん回 てれび を みます か"],
    explain: "Pregunta con なん回。",
  },
];

/* ===== Helpers ===== */
function joinTokens(tokens: string[], order: number[]) {
  return order.map((i) => tokens[i]).join(" ");
}

/* =========================
   COMPONENTE PRINCIPAL
   ========================= */
export default function B5_VecesContador() {
  // ✅ Hook global SOLO en los ejercicios
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // Estado Quiz 1
  const [ans1, setAns1] = useState<Record<number, { choice?: string; correct?: boolean }>>({});
  const score1 = Object.values(ans1).filter((a) => a.correct).length;

  // Estado Quiz 2
  const [ans2, setAns2] = useState<Record<number, AnsState>>({});
  const score2 = QUIZ2.reduce((acc, q) => acc + (ans2[q.id]?.correct ? 1 : 0), 0);

  const choose = (q: QA1, choice: string) => {
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
            <Text style={s.kicker}>回（かい）</Text>
            <Text style={s.h}>Veces: cómo contar repeticiones</Text>
            <Text style={s.sub}>
              Piensa: “¿Cuántas veces?”. Eso es <Text style={s.bold}>回（かい）</Text>.{"\n"}
              Con período: <Text style={s.bold}>[Periodo] に [Veces] 回 + Verbo</Text>.  Sin período: <Text style={s.bold}>[Veces] 回 + Verbo</Text>.
            </Text>
          </View>

          {/* Caja amarilla — como primaria */}
          <View style={s.how}>
            <View style={s.howHead}>
              <Ionicons name="school-outline" size={18} color={INK} />
              <Text style={s.howTitle}>Reglas fáciles</Text>
            </View>
            {REGLAS.map((r, i) => (
              <View key={i} style={s.howRow}>
                <Ionicons name={r.icon as any} size={14} color={INK} />
                <Text style={s.howTxt}>{r.txt}</Text>
              </View>
            ))}
            <View style={s.howHint}>
              <Ionicons name="alert-circle-outline" size={13} color={INK} />
              <Text style={s.howHintTxt}>“に” ≈ “por” (por semana, por mes…): しゅう に 2回</Text>
            </View>
          </View>

          {/* Tabla de lecturas (scroll horizontal + audio por fila) */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="reader-outline" size={16} color={INK} /> Lecturas de ～回（1–10） + 何回
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todo</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 760 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colNum]}>Número</Text>
                  <Text style={[s.th, s.colLect]}>Lectura</Text>
                  <Text style={[s.th, s.colNota]}>Nota</Text>
                  <Text style={[s.th, s.colAudio]}>Audio</Text>
                </View>

                {LECTURAS.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colNum]}>{r.numero}</Text>
                    <View style={[s.tdRow, s.colLect]}>
                      <Text style={[s.td, s.strong, { paddingHorizontal: 0 }]}>{r.lectura}</Text>
                    </View>
                    <Text style={[s.td, s.colNota]}>{r.nota ?? "—"}</Text>
                    <View style={[s.colAudio, { alignItems: "center" }]}>
                      <AudioButton text={r.tts ?? r.lectura} label={`Escuchar ${r.lectura}`} />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Oraciones modelo con audio */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>10 oraciones fáciles</Text>
            </View>
            {ORACIONES.map((o, idx) => (
              <View key={idx} style={[s.row, { gap: 6 }]}>
                <View style={s.jpRow}>
                  <Text style={s.jp}>{o.jp}</Text>
                  <AudioButton text={o.jp} label="Escuchar oración" />
                </View>
                <Text style={s.es}>{o.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== QUIZ 1: Lecturas ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="help-buoy-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz 1: ¿Cómo se lee?</Text>
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
                  <Text style={s.quizPrompt}>• {q.pregunta}</Text>
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

          {/* ===== QUIZ 2: Arma la oración ===== */}
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
                  {q.tip ? (
                    <View style={s.hintRow}>
                      <Ionicons name="bulb-outline" size={14} color={INK} />
                      <Text style={s.hintTxt}>{q.tip}</Text>
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
                      onPress={() => onCheck(q)}
                      disabled={isRight || cur.order.length === 0}
                      style={[s.btnPrimary, (isRight || cur.order.length === 0) && s.btnDisabled]}
                    >
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text style={[s.btnTxt, { color: "#fff" }]}>Comprobar</Text>
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

  /* Caja amarilla */
  how: {
    backgroundColor: "rgba(255,251,240,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
  },
  howHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  howTitle: { fontWeight: "900", color: INK },
  howRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  howTxt: { color: INK, lineHeight: 18, flexShrink: 1 },
  howHint: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  howHintTxt: { color: INK, fontSize: 12, flexShrink: 1 },

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

  table: { minWidth: 760 },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 4 },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  colNum: { width: 140, paddingHorizontal: 6 },
  colLect: { width: 260, paddingHorizontal: 6 },
  colNota: { width: 280, paddingHorizontal: 6 },
  colAudio: { width: 80, paddingHorizontal: 6 },

  td: { color: INK, fontSize: 14, lineHeight: 18 },
  strong: { fontWeight: "800" },

  tdRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  /* Botón de audio */
  audioBtn: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

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

  jpRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  jp: { fontSize: 16, fontWeight: "800", color: INK, flexShrink: 1 },
  es: { color: INK, opacity: 0.9, marginTop: 2 },

  /* Quizzes */
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

  /* Opciones */
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceBtn: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 90,
    alignItems: "center",
  },
  choiceTag: { fontWeight: "900", color: INK, fontSize: 16 },
  choiceRight: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.10)" },
  choiceWrong: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.10)" },

  /* Armar oración */
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  hintTxt: { color: INK, fontSize: 12, flexShrink: 1 },
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
