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
   Helpers de audio (TTS)
   ========================= */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.05,
      rate: Platform.OS === "ios" ? 0.5 : 1.0,
    });
  } catch {}
}

/* =========================
   DATOS
   ========================= */
type VRow = { jp: string; es: string; nota?: string; ejemplo: string; trad: string };
const VOCAB: VRow[] = [
  { jp: "いつも", es: "siempre", ejemplo: "いつも あさ 7じ に おきます。", trad: "Siempre me levanto a las 7." },
  { jp: "よく", es: "a menudo", ejemplo: "よく よる に べんきょう します。", trad: "A menudo estudio por la noche." },
  { jp: "たいてい", es: "por lo general", ejemplo: "たいてい あさ コーヒー を のみます。", trad: "Por lo general tomo café por la mañana." },
  { jp: "ときどき", es: "a veces", ejemplo: "ときどき アニメ を みます。", trad: "A veces veo anime." },
  { jp: "あまり（〜ません）", es: "no mucho / casi no", nota: "SIEMPRE con 〜ません", ejemplo: "あまり ジュース を のみません。", trad: "Casi no tomo jugo." },
  { jp: "ぜんぜん（〜ません）", es: "nunca", nota: "SIEMPRE con 〜ません", ejemplo: "ぜんぜん ジム に いきません。", trad: "Nunca voy al gym." },
];

type PatRow = { patron: string; uso: string; ejemplo: string; trad: string };
const PATRONES: PatRow[] = [
  { patron: "A は ［Adv］ ［Verbo］", uso: "posición típica", ejemplo: "わたし は いつも はやく ねます。", trad: "Siempre me duermo temprano." },
  { patron: "A は ［Tiempo］ ［Adv］ ［Verbo］", uso: "con tiempo", ejemplo: "わたし は よる に よく べんきょう します。", trad: "A menudo estudio por la noche." },
  { patron: "［Adv］ ［Verbo］", uso: "A omitido", ejemplo: "ときどき さんぽ します。", trad: "A veces paseo." },
  { patron: "あまり／ぜんぜん + ［Verbo］ません", uso: "negativa obligatoria", ejemplo: "ぜんぜん コーラ を のみません。", trad: "Nunca tomo refresco." },
];

type Ex = { jp: string; es: string };
const EJEMPLOS: Ex[] = [
  { jp: "わたし は いつも あさ 7じ に おきます。", es: "Siempre me levanto a las 7." },
  { jp: "よく にほんご を べんきょう します。", es: "A menudo estudio japonés." },
  { jp: "たいてい うち で ばんごはん を たべます。", es: "Por lo general ceno en casa." },
  { jp: "ときどき ともだち と カフェ に いきます。", es: "A veces voy al café con amigos." },
  { jp: "あまり テレビ を みません。", es: "Casi no veo TV." },
  { jp: "ぜんぜん おさけ を のみません。", es: "Nunca bebo alcohol." },
  { jp: "まいあさ コーヒー を のみます。", es: "Cada mañana tomo café. (hábito con まい〜)" },
  { jp: "1しゅうかん に 2かい ジム に いきます。", es: "Voy al gym 2 veces por semana. (frecuencia con に)" },
  { jp: "2じかん べんきょう します。", es: "Estudio 2 horas. (DURACIÓN, no adverbio)" },
  { jp: "きょう は ときどき あめ が ふります。", es: "Hoy a veces llueve. (expresivo)" },
];

/* Chips del cuadro amarillo con texto a pronunciar */
const SCALE_CHIPS: { label: string; say: string }[] = [
  { label: "いつも", say: "いつも" },
  { label: "よく", say: "よく" },
  { label: "たいてい", say: "たいてい" },
  { label: "ときどき", say: "ときどき" },
  { label: "あまり（〜ません）", say: "あまり" },
  { label: "ぜんぜん（〜ません）", say: "ぜんぜん" },
];

/* =========================
   QUIZ (sonidos SOLO aquí)
   ========================= */
type QA = {
  id: number;
  promptEs: string;
  choices: string[];
  correctIdx: number;
  explain: string;
};

const QUIZ: QA[] = [
  {
    id: 1,
    promptEs: "«Siempre desayuno arroz.»",
    choices: ["いつも ごはん を たべます。", "いつも ごはん を たべません。"],
    correctIdx: 0,
    explain: "‘Siempre’ (いつも) va con afirmativa si la idea es positiva.",
  },
  {
    id: 2,
    promptEs: "«Casi no tomo café.»",
    choices: ["あまり コーヒー を のみます。", "あまり コーヒー を のみません。"],
    correctIdx: 1,
    explain: "あまり/ぜんぜん requieren forma negativa 〜ません.",
  },
  {
    id: 3,
    promptEs: "«Nunca voy al gym.»",
    choices: ["ぜんぜん ジム に いきます。", "ぜんぜん ジム に いきません。"],
    correctIdx: 1,
    explain: "ぜんぜん + 〜ません.",
  },
  {
    id: 4,
    promptEs: "«A veces veo anime.»",
    choices: ["ときどき アニメ を みます。", "ときどき アニメ を みません。"],
    correctIdx: 0,
    explain: "ときどき no exige negativa.",
  },
  {
    id: 5,
    promptEs: "«A menudo estudio por la noche.» (elige la partícula correcta)",
    choices: ["よく よる に べんきょう します。", "よく よる を べんきょう します。"],
    correctIdx: 0,
    explain: "Tiempo → に. ‘よる を’ es incorrecto.",
  },
  {
    id: 6,
    promptEs: "«Por lo general me ducho por la mañana.»",
    choices: ["たいてい あさ に シャワー を あびます。", "たいてい あさ シャワー を あびません。"],
    correctIdx: 0,
    explain: "Oración afirmativa con たいてい; ‘あさ に’ para el tiempo.",
  },
  {
    id: 7,
    promptEs: "«Casi nunca como dulces.»",
    choices: ["あまり おかし を たべません。", "あまり おかし を たべます。"],
    correctIdx: 0,
    explain: "あまり + 〜ません.",
  },
  {
    id: 8,
    promptEs: "«Nunca juego videojuegos.»",
    choices: ["ぜんぜん ゲーム を しません。", "ぜんぜん ゲーム を します。"],
    correctIdx: 0,
    explain: "ぜんぜん + 〜ません.",
  },
  {
    id: 9,
    promptEs: "«A veces voy en bici a la escuela.» (elige la partícula correcta)",
    choices: ["ときどき じてんしゃ で がっこう に いきます。", "ときどき じてんしゃ に がっこう へ いきます。"],
    correctIdx: 0,
    explain: "Medio de transporte → で.",
  },
  {
    id: 10,
    promptEs: "«Suelo escuchar música por la tarde.»",
    choices: ["たいてい ゆうがた に おんがく を ききます。", "たいてい ゆうがた おんがく を ききません。"],
    correctIdx: 0,
    explain: "Afirmativa con たいてい; tiempo con に.",
  },
];

/* =========================
   COMPONENTE
   ========================= */
export default function B5_AdverbiosFrecuencia() {
  // 👇 Hook SOLO para el quiz
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const [sel, setSel] = useState<Record<number, number | undefined>>({});
  const [okMap, setOkMap] = useState<Record<number, boolean | undefined>>({});

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const score = Object.values(okMap).filter(Boolean).length;

  const choose = (q: QA, idx: number) => {
    const ok = idx === q.correctIdx;
    if (ready) (ok ? playCorrect() : playWrong());
    Vibration.vibrate(ok ? 10 : 18);
    setSel((p) => ({ ...p, [q.id]: idx }));
    setOkMap((p) => ({ ...p, [q.id]: ok }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.9 }}
      >
        {/* Pétalos */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: 14 }).map((_, i) => (
            <Petal key={i} delay={i * 420} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>ふくし（adverbios）</Text>
            <Text style={s.h}>Adverbios de frecuencia</Text>
            <Text style={s.sub}>
              Colocación típica: <Text style={s.bold}>A は ［Adv］ ［Verbo］</Text>. Con <Text style={s.bold}>あまり／ぜんぜん</Text> usa <Text style={s.bold}>〜ません</Text>.
            </Text>
          </View>

          {/* Escala de frecuencia (chips con audio) */}
          <View style={s.scaleCard}>
            <View style={s.cardHeader}>
              <Ionicons name="pulse-outline" size={18} color={INK} />
              <Text style={s.cardTitle}>De más a menos frecuencia</Text>
            </View>

            <View style={s.chipsRow}>
              {SCALE_CHIPS.map((w) => (
                <Pressable key={w.label} style={s.chip} onPress={() => speakJP(w.say)}>
                  <Ionicons name="volume-high-outline" size={12} color={INK} />
                  <Text style={s.chipTxt}>{w.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.scaleHint}>
              Pista: <Text style={s.bold}>あまり／ぜんぜん</Text> van con <Text style={s.bold}>negativo（〜ません）</Text>.
            </Text>
          </View>

          {/* Tabla de vocabulario (scroll horizontal) */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="reader-outline" size={16} color={INK} /> Vocabulario + ejemplos
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 880 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colSm]}>JP</Text>
                  <Text style={[s.th, s.colMd]}>Español</Text>
                  <Text style={[s.th, s.colMd]}>Regla</Text>
                  <Text style={[s.th, s.colXl]}>Ejemplo</Text>
                  <Text style={[s.th, s.colLg]}>Traducción</Text>
                </View>

                {VOCAB.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colSm]}>{r.jp}</Text>
                    <Text style={[s.td, s.colMd]}>{r.es}</Text>
                    <Text style={[s.td, s.colMd]}>{r.nota ?? "—"}</Text>
                    <Text style={[s.td, s.colXl]}>{r.ejemplo}</Text>
                    <Text style={[s.td, s.colLg]}>{r.trad}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tabla de colocación */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="swap-vertical-outline" size={16} color={INK} /> ¿Dónde va el adverbio?
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todas las columnas</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 820 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colLg]}>Patrón</Text>
                  <Text style={[s.th, s.colMd]}>Uso</Text>
                  <Text style={[s.th, s.colXl]}>Ejemplo</Text>
                  <Text style={[s.th, s.colLg]}>Traducción</Text>
                </View>

                {PATRONES.map((r, i) => (
                  <View key={i} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colLg]}>{r.patron}</Text>
                    <Text style={[s.td, s.colMd]}>{r.uso}</Text>
                    <Text style={[s.td, s.colXl]}>{r.ejemplo}</Text>
                    <Text style={[s.td, s.colLg]}>{r.trad}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Ejemplos rápidos (con botón de audio) */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>10 oraciones (lectura fácil)</Text>
            </View>

            {EJEMPLOS.map((e, idx) => (
              <View key={idx} style={s.row}>
                <View style={s.rowTop}>
                  <Text style={s.jp}>{e.jp}</Text>
                  <Pressable onPress={() => speakJP(e.jp)} style={s.playInline}>
                    <Ionicons name="volume-high-outline" size={16} color={INK} />
                  </Pressable>
                </View>
                <Text style={s.es}>{e.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== QUIZ (sonidos SOLO aquí) ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="school-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz: elige la opción correcta</Text>
            </View>

            <View style={s.score}>
              <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
              <Text style={s.scoreTxt}>Aciertos: {score} / {QUIZ.length}</Text>
            </View>

            {QUIZ.map((q) => {
              const picked = sel[q.id];
              const isRight = okMap[q.id];

              return (
                <View key={q.id} style={s.quizItem}>
                  <Text style={s.quizPrompt}>• {q.promptEs}</Text>

                  <View style={s.choiceRow}>
                    {q.choices.map((c, idx) => {
                      const selected = picked === idx;
                      const right = selected && isRight;
                      const wrong = selected && isRight === false;
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

                  {typeof isRight !== "undefined" ? (
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

  /* Escala (cuadro amarillo) */
  scaleCard: {
    backgroundColor: "rgba(255,251,240,0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipTxt: { color: INK, fontWeight: "800", fontSize: 12 },
  scaleHint: { color: INK, fontSize: 12 },

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

  colSm: { width: 120, paddingHorizontal: 6 },
  colMd: { width: 200, paddingHorizontal: 6 },
  colLg: { width: 300, paddingHorizontal: 6 },
  colXl: { width: 360, paddingHorizontal: 6 },

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
  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  playInline: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
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

  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
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
