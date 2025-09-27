import { Ionicons } from "@expo/vector-icons";
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
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${Math.random() > 0.5 ? "" : "-"}360deg`],
  });
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

/* =========================
   DATOS — HORAS / DÍAS DE SEMANA / DÍAS DE MES
   ========================= */
type HourRow = { n: number; lectura: string; ejemplo: string };
type WeekRow = { es: string; jp: string; ejemplo: string };
type DayRow = { n: number; lectura: string; ejemplo: string };

/** Horas (1–12) */
const HOURS: HourRow[] = [
  { n: 1, lectura: "いちじ", ejemplo: "いちじ に おきます" },
  { n: 2, lectura: "にじ", ejemplo: "にじ に ねます" },
  { n: 3, lectura: "さんじ", ejemplo: "さんじ に べんきょう します" },
  { n: 4, lectura: "よじ", ejemplo: "よじ に かえります" },
  { n: 5, lectura: "ごじ", ejemplo: "ごじ に りょうり します" },
  { n: 6, lectura: "ろくじ", ejemplo: "ろくじ に おきます" },
  { n: 7, lectura: "しちじ", ejemplo: "しちじ に あさごはん を たべます" },
  { n: 8, lectura: "はちじ", ejemplo: "はちじ に しごと を します" },
  { n: 9, lectura: "くじ", ejemplo: "くじ に テレビ を みます" },
  { n: 10, lectura: "じゅうじ", ejemplo: "じゅうじ に ねます" },
  { n: 11, lectura: "じゅういちじ", ejemplo: "じゅういちじ に ねます" },
  { n: 12, lectura: "じゅうにじ", ejemplo: "じゅうにじ に ひるごはん です" },
];

/** Días de la semana */
const WEEK: WeekRow[] = [
  { es: "lunes", jp: "げつようび", ejemplo: "げつようび に がっこう に いきます" },
  { es: "martes", jp: "かようび", ejemplo: "かようび に しごと を します" },
  { es: "miércoles", jp: "すいようび", ejemplo: "すいようび に ジム へ いきます" },
  { es: "jueves", jp: "もくようび", ejemplo: "もくようび に ピアノ を ならいます" },
  { es: "viernes", jp: "きんようび", ejemplo: "きんようび に えいが を みます" },
  { es: "sábado", jp: "どようび", ejemplo: "どようび に かいもの を します" },
  { es: "domingo", jp: "にちようび", ejemplo: "にちようび に やすみます" },
];

/** Días del mes (1–31) */
const DOM_LECTURAS: Record<number, string> = {
  1: "ついたち", 2: "ふつか", 3: "みっか", 4: "よっか", 5: "いつか",
  6: "むいか", 7: "なのか", 8: "ようか", 9: "ここのか", 10: "とおか",
  11: "じゅういちにち", 12: "じゅうににち", 13: "じゅうさんにち", 14: "じゅうよっか",
  15: "じゅうごにち", 16: "じゅうろくにち", 17: "じゅうしちにち", 18: "じゅうはちにち",
  19: "じゅうくにち", 20: "はつか",
  21: "にじゅういちにち", 22: "にじゅうににち", 23: "にじゅうさんにち", 24: "にじゅうよっか",
  25: "にじゅうごにち", 26: "にじゅうろくにち", 27: "にじゅうしちにち", 28: "にじゅうはちにち",
  29: "にじゅうくにち", 30: "さんじゅうにち", 31: "さんじゅういちにち",
};
const DAYS: DayRow[] = Array.from({ length: 31 }, (_, i) => {
  const n = i + 1;
  return { n, lectura: DOM_LECTURAS[n], ejemplo: `${DOM_LECTURAS[n]} に テスト が あります` };
});

/* =========================
   ORACIONES (10)
   ========================= */
const EXAMPLES = [
  { jp: "しちじ に おきます。", es: "Me levanto a las 7." },
  { jp: "にちようび に ともだち と あいます。", es: "El domingo me veo con amigos." },
  { jp: "はつか に たんじょうび です。", es: "Mi cumpleaños es el día 20." },
  { jp: "ようか に りょこう に いきます。", es: "Viajo el día 8." },
  { jp: "げつようび に かいぎ が あります。", es: "Hay reunión el lunes." },
  { jp: "くじ に コーヒー を のみます。", es: "Tomo café a las 9." },
  { jp: "じゅうよっか に カルテット の コンサート です。", es: "Concierto el día 14." },
  { jp: "かようび に べんきょう します。", es: "Estudio el martes." },
  { jp: "よじ に かえります。", es: "Vuelvo a las 4." },
  { jp: "にじゅうよっか に りょうしん が きます。", es: "Mis padres vienen el 24." },
];

/* =========================
   QUIZ (10) — lecturas correctas
   ========================= */
type MCQ = {
  id: number;
  promptEs: string;
  question: string; // jp/esp
  choices: string[];
  correctIdx: number;
  explain: string;
};

const QUIZ: MCQ[] = [
  { id: 1, promptEs: "¿Cómo se dice «las 4 en punto»?", question: "", choices: ["よじ", "よんじ"], correctIdx: 0, explain: "‘4’ con horas es irregular: よじ (no よんじ)." },
  { id: 2, promptEs: "¿Cómo se dice «las 7 en punto»?", question: "", choices: ["しちじ", "ななじ"], correctIdx: 0, explain: "La forma natural es しちじ." },
  { id: 3, promptEs: "¿Cómo se dice «las 9 en punto»?", question: "", choices: ["くじ", "きゅうじ"], correctIdx: 0, explain: "Irregular: くじ (no きゅうじ)." },
  { id: 4, promptEs: "¿Cómo se dice «día 1 del mes»?", question: "", choices: ["ついたち", "いちにち"], correctIdx: 0, explain: "El 1 del mes es ついたち." },
  { id: 5, promptEs: "¿Cómo se dice «día 2 del mes»?", question: "", choices: ["ふつか", "ににち"], correctIdx: 0, explain: "El 2 es ふつか." },
  { id: 6, promptEs: "¿Cómo se dice «día 4 del mes»?", question: "", choices: ["よっか", "よんにち"], correctIdx: 0, explain: "El 4 es よっか." },
  { id: 7, promptEs: "¿Cómo se dice «día 9 del mes»?", question: "", choices: ["ここのか", "きゅうにち"], correctIdx: 0, explain: "El 9 es ここのか." },
  { id: 8, promptEs: "¿Cómo se dice «día 20 del mes»?", question: "", choices: ["はつか", "にじゅうにち"], correctIdx: 0, explain: "El 20 es irregular: はつか." },
  { id: 9, promptEs: "¿Cómo se dice «día 24 del mes»?", question: "", choices: ["にじゅうよっか", "にじゅうよんにち"], correctIdx: 0, explain: "El 24 es にじゅうよっか." },
  { id: 10, promptEs: "¿Cómo se dice «lunes»?", question: "", choices: ["げつようび", "げつにち"], correctIdx: 0, explain: "Día de la semana: げつようび." },
];

/* =========================
   COMPONENTE
   ========================= */
export default function B5_TiempoPuntos() {
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const [picked, setPicked] = useState<Record<number, number | undefined>>({});
  const [correct, setCorrect] = useState<Record<number, boolean | undefined>>({});

  const score = Object.values(correct).filter(Boolean).length;

  const choose = (q: MCQ, idx: number) => {
    const ok = idx === q.correctIdx;
    if (ready) (ok ? playCorrect() : playWrong());
    Vibration.vibrate(ok ? 10 : 18);
    setPicked((p) => ({ ...p, [q.id]: idx }));
    setCorrect((p) => ({ ...p, [q.id]: ok }));
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
          {Array.from({ length: 16 }).map((_, i) => (
            <Petal key={i} delay={i * 440} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⏳ Puntos de tiempo（に）</Text>
            <Text style={s.h}>Contadores: horas・días de la semana・días del mes</Text>
            <Text style={s.sub}>
              Usa <Text style={s.bold}>に</Text> con **puntos exactos** (horas, un día de la semana concreto, un día del mes).
              Las lecturas tienen **irregularidades**: por ejemplo 4: <Text style={s.bold}>よじ</Text>, 9: <Text style={s.bold}>くじ</Text>,
              1 del mes: <Text style={s.bold}>ついたち</Text>, 20: <Text style={s.bold}>はつか</Text>, 24: <Text style={s.bold}>にじゅうよっか</Text>.
            </Text>
          </View>

          {/* ===== Tabla: HORAS ===== */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="time-outline" size={16} color={INK} /> Horas（～じ）
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 620 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colSm]}>N°</Text>
                  <Text style={[s.th, s.colMd]}>Lectura</Text>
                  <Text style={[s.th, s.colLg]}>Ejemplo con に</Text>
                </View>

                {HOURS.map((h, i) => (
                  <View key={h.n} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colSm]}>{h.n}</Text>
                    <Text style={[s.td, s.colMd]}>{h.lectura}</Text>
                    <Text style={[s.td, s.colLg]}>{h.ejemplo}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ===== Tabla: DÍAS DE LA SEMANA ===== */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="calendar-outline" size={16} color={INK} /> Días de la semana（～ようび）
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 640 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colMd]}>Español</Text>
                  <Text style={[s.th, s.colMd]}>Lectura</Text>
                  <Text style={[s.th, s.colLg]}>Ejemplo con に</Text>
                </View>

                {WEEK.map((w, i) => (
                  <View key={w.jp} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colMd]}>{w.es}</Text>
                    <Text style={[s.td, s.colMd]}>{w.jp}</Text>
                    <Text style={[s.td, s.colLg]}>{w.ejemplo}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ===== Tabla: DÍAS DEL MES ===== */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="calendar-number-outline" size={16} color={INK} /> Días del mes（ついたち…～にち）
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 820 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colSm]}>Día</Text>
                  <Text style={[s.th, s.colMd]}>Lectura</Text>
                  <Text style={[s.th, s.colLg]}>Ejemplo con に</Text>
                </View>

                {DAYS.map((d, i) => (
                  <View key={d.n} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colSm]}>{d.n}</Text>
                    <Text style={[s.td, s.colMd]}>{d.lectura}</Text>
                    <Text style={[s.td, s.colLg]}>{d.ejemplo}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ===== Oraciones ===== */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>10 oraciones de referencia</Text>
            </View>
            {EXAMPLES.map((e, i) => (
              <View key={i} style={s.row}>
                <Text style={s.jp}>{e.jp}</Text>
                <Text style={s.es}>{e.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== Quiz ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="school-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz: lecturas de horas y días del mes</Text>
            </View>

            <View style={s.score}>
              <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
              <Text style={s.scoreTxt}>Aciertos: {score} / {QUIZ.length}</Text>
            </View>

            {QUIZ.map((q) => {
              const sel = picked[q.id];
              const ok = correct[q.id];
              return (
                <View key={q.id} style={s.quizItem}>
                  <Text style={s.quizPrompt}>• {q.promptEs}</Text>

                  <View style={s.choiceRow}>
                    {q.choices.map((c, idx) => {
                      const selected = sel === idx;
                      const right = selected && ok;
                      const wrong = selected && ok === false;
                      return (
                        <Pressable
                          key={idx}
                          onPress={() => choose(q, idx)}
                          style={[
                            s.choiceBtn,
                            selected && (right ? s.choiceRight : s.choiceWrong),
                          ]}
                          android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                        >
                          <Text style={s.choiceTag}>{c}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {typeof ok !== "undefined" ? (
                    <View style={[s.resultBox, ok ? s.okBox : s.errBox]}>
                      <Text style={[s.resultTitle, ok ? s.okTxt : s.errTxt]}>
                        {ok ? "¡Correcto!" : "Incorrecto"}
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

  /* tablas */
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

  table: { minWidth: 620 },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  colSm: { width: 80, paddingHorizontal: 6 },
  colMd: { width: 180, paddingHorizontal: 6 },
  colLg: { width: 320, paddingHorizontal: 6 },

  td: { color: INK, fontSize: 14, lineHeight: 18 },

  /* tarjetas */
  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },

  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  es: { color: INK, opacity: 0.9, marginTop: 2 },

  /* quiz */
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
    backgroundColor: WASHI,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  quizPrompt: { fontWeight: "900", color: INK },

  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  choiceBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 110,
    alignItems: "center",
  },
  choiceRight: { borderColor: "#5cb85c" },
  choiceWrong: { borderColor: "#d9534f" },
  choiceTag: { fontWeight: "900", color: INK, fontSize: 16 },

  resultBox: { marginTop: 8, borderRadius: 12, borderWidth: 1, padding: 10 },
  okBox: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.08)" },
  errBox: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.08)" },
  resultTitle: { fontWeight: "900", marginBottom: 4 },
  okTxt: { color: "#2b7a2b" },
  errTxt: { color: "#a33833" },
  resultMsg: { color: INK, lineHeight: 18 },
});
