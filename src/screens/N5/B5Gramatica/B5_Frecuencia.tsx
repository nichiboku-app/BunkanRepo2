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
   TABLAS Y DATOS
   ========================= */
type PeriodRow = { es: string; jp: string; ejemplo: string };
const PERIODOS: PeriodRow[] = [
  { es: "por semana", jp: "しゅう に", ejemplo: "しゅう に 2かい ジム へ いきます。" },
  { es: "por mes", jp: "つき に", ejemplo: "つき に 3かい にほんご を べんきょう します。" },
  { es: "por año", jp: "ねん に", ejemplo: "ねん に 1かい りょこう します。" },
  { es: "por día", jp: "1にち に", ejemplo: "1にち に 2かい は を みがきます。" },
  { es: "por hora", jp: "1じかん に", ejemplo: "1じかん に 1かい やすみます。" },
];

type VecesRow = { n: string; lectura: string; ejemplo: string };
const VECES: VecesRow[] = [
  { n: "1", lectura: "いっかい", ejemplo: "1にち に いっかい" },
  { n: "2", lectura: "にかい", ejemplo: "しゅう に にかい" },
  { n: "3", lectura: "さんかい", ejemplo: "つき に さんかい" },
  { n: "4", lectura: "よんかい", ejemplo: "ねん に よんかい" },
  { n: "5", lectura: "ごかい", ejemplo: "しゅう に ごかい" },
  { n: "6", lectura: "ろっかい", ejemplo: "1じかん に ろっかい" },
  { n: "7", lectura: "ななかい", ejemplo: "1にち に ななかい" },
  { n: "8", lectura: "はっかい", ejemplo: "つき に はっかい" },
  { n: "9", lectura: "きゅうかい", ejemplo: "ねん に きゅうかい" },
  { n: "10", lectura: "じゅっかい／じっかい", ejemplo: "しゅう に じゅっかい" },
];

/** Comparación rápida */
const COMPARA = [
  { forma: "［PERÍODO］ に ［N］かい + Verbo", uso: "VEces POR período (frecuencia)", ej: "しゅう に 2かい" },
  { forma: "まい〜（まいしゅう・まいつき・まいにち・まいとし）", uso: "CADA semana/mes/día/año (hábito)", ej: "まいしゅう サッカー を します" },
  { forma: "［～かん］（2じかん など）", uso: "DURACIÓN (no frecuencia)", ej: "2じかん べんきょう します（に ×）" },
];

/** Ejemplos */
const EJEMPLOS = [
  { jp: "しゅう に 2かい ジム へ いきます。", es: "Voy al gym dos veces por semana." },
  { jp: "つき に 3かい にほんご を べんきょう します。", es: "Estudio japonés 3 veces al mes." },
  { jp: "ねん に 1かい りょこう します。", es: "Viajo una vez al año." },
  { jp: "1にち に 2かい は を みがきます。", es: "Me cepillo los dientes dos veces al día." },
  { jp: "1じかん に 1かい やすみます。", es: "Descanso una vez por hora." },
  { jp: "まいしゅう サッカー を します。", es: "Juego fútbol cada semana." },
  { jp: "まいにち 1かい かんじ を れんしゅう します。", es: "Practico kanji una vez cada día." },
  { jp: "2じかん べんきょう します。", es: "Estudio dos horas. (DURACIÓN, no frecuencia)" },
  { jp: "つき に なんかい カフェ に いきますか。", es: "¿Cuántas veces al mes vas al café?" },
  { jp: "ねん に よんかい かぞく と でかけます。", es: "Salgo con mi familia cuatro veces al año." },
];

/* =========================
   QUIZ — sonidos SOLO aquí
   ========================= */
type MCQ = {
  id: number;
  promptEs: string;
  choices: string[];
  correctIdx: number;
  explain: string;
};

const QUIZ: MCQ[] = [
  {
    id: 1,
    promptEs: "«Dos veces por semana voy al gym».",
    choices: ["しゅう に 2かい ジム へ いきます。", "2しゅう に ジム へ 2かい いきます。"],
    correctIdx: 0,
    explain: "Patrón: [PERÍODO] に [VECES] かい + Verbo.",
  },
  {
    id: 2,
    promptEs: "«Estudio japonés tres veces al mes».",
    choices: ["つき に さんかい にほんご を べんきょう します。", "まいつき さんかい に べんきょう します。"],
    correctIdx: 0,
    explain: "Con ‘por mes/semana…’ va に después del período.",
  },
  {
    id: 3,
    promptEs: "«Viajo una vez al año».",
    choices: ["ねん に いっかい りょこう します。", "1ねん に いちど 2かい りょこう します。"],
    correctIdx: 0,
    explain: "1回＝いっかい／いちど. Aquí basta ねん に いっかい.",
  },
  {
    id: 4,
    promptEs: "¿Cuál expresa DURACIÓN (no frecuencia)?",
    choices: ["2じかん べんきょう します。", "1じかん に 2かい べんきょう します。"],
    correctIdx: 0,
    explain: "～かん = duración. ‘1じかん に’ es ‘por hora’.",
  },
  {
    id: 5,
    promptEs: "«¿Cuántas veces al día te lavas los dientes?»",
    choices: ["1にち に なんかい は を みがきますか。", "まいにち なんにち は を みがきますか。"],
    correctIdx: 0,
    explain: "Pregunta de veces: なんかい.",
  },
  {
    id: 6,
    promptEs: "Elige la opción con lectura correcta de ‘1 vez’:",
    choices: ["1にち に いちかい", "1にち に いっかい"],
    correctIdx: 1,
    explain: "1回 = いっかい (contracción).",
  },
  {
    id: 7,
    promptEs: "«Cada semana juego fútbol».",
    choices: ["しゅう に 1かい サッカー を します。", "まいしゅう サッカー を します。"],
    correctIdx: 1,
    explain: "Con ‘cada…’ usamos まい〜 (sin に).",
  },
  {
    id: 8,
    promptEs: "«Descanso una vez por hora».",
    choices: ["1じかん に いっかい やすみます。", "1じかん いっかい に やすみます。"],
    correctIdx: 0,
    explain: "Orden: PERÍODO に + 回 + verbo.",
  },
  {
    id: 9,
    promptEs: "«Voy al café ocho veces al mes».",
    choices: ["つき に はっかい カフェ に いきます。", "つき は はっかい カフェ に いきます。"],
    correctIdx: 0,
    explain: "‘8回’ = はっかい. El período lleva に.",
  },
  {
    id: 10,
    promptEs: "«Salgo con mi familia cuatro veces al año».",
    choices: ["ねん に よんかい かぞく と でかけます。", "まいとし よんかい に かぞく と でかけます。"],
    correctIdx: 0,
    explain: "Si usas まいとし no va に; con ねん に sí.",
  },
];

/* =========================
   COMPONENTE
   ========================= */
export default function B5_Frecuencia() {
  // 👇 Hook de sonidos SOLO en el quiz
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
          {Array.from({ length: 12 }).map((_, i) => (
            <Petal key={i} delay={i * 400} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⏳ Frecuencia</Text>
            <Text style={s.h}>Cómo decir “X veces por…” en japonés</Text>
            <Text style={s.sub}>
              Fórmula base: <Text style={s.bold}>[PERÍODO] に [VECES] かい + [verbo]</Text> — ej.: <Text style={s.bold}>しゅう に 2かい いきます。</Text>
            </Text>
          </View>

          {/* === CUADRO AMARILLO: explicación como en primaria (ajustado) === */}
          <View style={s.yellowPanel}>
            <View style={s.panelHeader}>
              <Ionicons name="sparkles-outline" size={18} color={INK} />
              <Text style={s.panelTitle}>Explícalo fácil 🙂</Text>
            </View>

            {/* Paso 1 */}
            <View style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>1</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTxt}>
                  Elige el <Text style={s.bold}>PERÍODO</Text> (¿cada cuánto?): semana, mes, año, día u hora.
                </Text>
                <View style={s.chipsRow}>
                  {["しゅう", "つき", "ねん", "1にち", "1じかん"].map((t) => (
                    <View key={t} style={s.chip}><Text style={s.chipTxt}>{t} に</Text></View>
                  ))}
                </View>
              </View>
            </View>

            {/* Paso 2 */}
            <View style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>2</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTxt}>
                  Di cuántas <Text style={s.bold}>VECES</Text>: いっかい, にかい, さんかい… ¿cuántas veces? <Text style={s.bold}>なんかい？</Text>
                </Text>
                <View style={s.chipsRow}>
                  {["いっかい", "にかい", "さんかい", "よんかい", "はっかい", "じゅっかい"].map((t) => (
                    <View key={t} style={s.chip}><Text style={s.chipTxt}>{t}</Text></View>
                  ))}
                </View>
              </View>
            </View>

            {/* Paso 3 */}
            <View style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>3</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTxt}>
                  Une todo con el <Text style={s.bold}>verbo</Text>.
                </Text>
                <View style={s.exampleBox}>
                  <Text style={s.exampleTxt}>しゅう に 2かい ジム へ いきます。</Text>
                  <Text style={s.exampleHint}>“Voy al gym dos veces por semana”.</Text>
                </View>
              </View>
            </View>

            {/* Paso 4: OJO */}
            <View style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>¡Ojo!</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTxt}>
                  <Text style={s.bold}>～かん</Text> es DURACIÓN: <Text style={s.bold}>2じかん べんきょう します</Text> (no lleva に).
                </Text>
              </View>
            </View>
          </View>

          {/* Tabla PERIODOS (scroll horizontal) */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="reader-outline" size={16} color={INK} /> Período + に
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 740 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colMd]}>Español</Text>
                  <Text style={[s.th, s.colMd]}>Forma (jp)</Text>
                  <Text style={[s.th, s.colLg]}>Ejemplo</Text>
                </View>

                {PERIODOS.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colMd]}>{r.es}</Text>
                    <Text style={[s.td, s.colMd]}>{r.jp}</Text>
                    <Text style={[s.td, s.colLg]}>{r.ejemplo}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tabla VECES 回 */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="list-outline" size={16} color={INK} /> Contador de veces（～かい）
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 760 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colSm]}>N°</Text>
                  <Text style={[s.th, s.colMd]}>Lectura</Text>
                  <Text style={[s.th, s.colLg]}>Ejemplo con período</Text>
                </View>

                {VECES.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colSm]}>{r.n}</Text>
                    <Text style={[s.td, s.colMd]}>{r.lectura}</Text>
                    <Text style={[s.td, s.colLg]}>{r.ejemplo}</Text>
                  </View>
                ))}

                {/* Tips dentro del scroll (se ajustan) */}
                <View style={s.infoRow}>
                  <View style={s.infoItem}>
                    <Ionicons name="bulb-outline" size={13} color={INK} />
                    <Text style={s.infoTxt}>Pregunta: なんかい？（¿cuántas veces?）</Text>
                  </View>
                  <View style={s.infoItem}>
                    <Ionicons name="alert-circle-outline" size={13} color={INK} />
                    <Text style={s.infoTxt}>1＝いっかい, 6＝ろっかい, 8＝はっかい, 10＝じゅっかい／じっかい</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Comparación rápida */}
          <View style={s.compare}>
            <View style={s.cardHeader}>
              <Ionicons name="swap-vertical-outline" size={18} color={INK} />
              <Text style={s.cardTitle}>Compara</Text>
            </View>
            {COMPARA.map((c, i) => (
              <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                <Text style={[s.td, { flex: 1 }]}><Text style={s.bold}>{c.forma}</Text> — {c.uso}. Ej.: {c.ej}</Text>
              </View>
            ))}
          </View>

          {/* Ejemplos */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Ejemplos</Text>
            </View>
            {EJEMPLOS.map((row, i) => (
              <View key={i} style={s.row}>
                <Text style={s.jp}>{row.jp}</Text>
                <Text style={s.es}>{row.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== QUIZ (sonidos SOLO aquí) ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="school-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz: elige la frase correcta</Text>
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

  /* === Cuadro amarillo (explicación primaria) === */
  yellowPanel: {
    backgroundColor: "rgba(255,251,240,0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 10,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  panelTitle: { fontWeight: "900", color: INK, fontSize: 16 },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start", // permite varias líneas
    gap: 10,
  },
  stepNum: {
    backgroundColor: "rgba(59,47,47,0.08)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stepNumTxt: { fontWeight: "900", color: INK, fontSize: 12 },
  stepContent: { flex: 1, minWidth: 0, gap: 6 }, // minWidth evita desbordes
  stepTxt: { color: INK, lineHeight: 20, flexShrink: 1, fontSize: 14 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipTxt: { color: INK, fontWeight: "800", fontSize: 12 },

  exampleBox: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 8,
    gap: 4,
  },
  exampleTxt: { color: INK, fontWeight: "900" },
  exampleHint: { color: INK, opacity: 0.9, fontSize: 12 },

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

  table: { minWidth: 720 },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  colSm: { width: 80, paddingHorizontal: 6 },
  colMd: { width: 200, paddingHorizontal: 6 },
  colLg: { width: 360, paddingHorizontal: 6 },

  td: { color: INK, fontSize: 14, lineHeight: 18 },

  infoRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoTxt: { color: INK, fontSize: 12, flexShrink: 1, minWidth: 0 },

  compare: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 4,
  },

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

  /* QUIZ */
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
