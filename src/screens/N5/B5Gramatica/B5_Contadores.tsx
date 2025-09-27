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

const WASHI = "rgba(255,255,255,0.86)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

/* ======= Lecturas 1–10 para cada contador ======= */
const MAI = ["いちまい","にまい","さんまい","よんまい","ごまい","ろくまい","ななまい","はちまい","きゅうまい","じゅうまい"];
const HON = ["いっぽん","にほん","さんぼん","よんほん","ごほん","ろっぽん","ななほん","はっぽん","きゅうほん","じゅっぽん"]; // 10も「じっぽん」OK
const KO  = ["いっこ","にこ","さんこ","よんこ","ごこ","ろっこ","ななこ","はっこ","きゅうこ","じゅっこ"];           // 10も「じっこ」OK
const TSU = ["ひとつ","ふたつ","みっつ","よっつ","いつつ","むっつ","ななつ","やっつ","ここのつ","とお"];

type CKey = "mai" | "hon" | "ko" | "tsu";
const COUNTER_LABEL: Record<CKey, string> = {
  mai: "枚（まい）— planos",
  hon: "本（ほん）— largos",
  ko:  "個（こ）— piezas pequeñas",
  tsu: "つ — genérico nativo (1–10)",
};

function reading(counter: CKey, n: number) {
  const idx = n - 1;
  switch (counter) {
    case "mai": return MAI[idx];
    case "hon": return HON[idx];
    case "ko":  return KO[idx];
    case "tsu": return TSU[idx];
  }
}

/* ======= 10 oraciones de ejemplo ======= */
const SENTENCES = [
  { jp: "紙を三枚ください。", es: "Deme tres hojas de papel." },
  { jp: "鉛筆を二本買いました。", es: "Compré dos lápices." },
  { jp: "りんごを五つ買いました。", es: "Compré cinco manzanas." },
  { jp: "傘を二本持っています。", es: "Tengo dos paraguas." },
  { jp: "皿を四枚洗いました。", es: "Lavé cuatro platos." },
  { jp: "水を六本買いました。", es: "Compré seis botellas de agua." },
  { jp: "写真を八枚撮りました。", es: "Tomé ocho fotos." },
  { jp: "木を七本植えました。", es: "Planté siete árboles." },
  { jp: "キャンディーを九個もらいました。", es: "Recibí nueve caramelos." },
  { jp: "みかんを十個ください。", es: "Diez mandarinas, por favor." },
];

/* ======= Ejercicio interactivo ======= */
type Quiz = {
  id: number;
  n: number;
  thingEs: string;
  nounJp: string;
  correct: CKey[];
  hint: string;
};
const QUIZ: Quiz[] = [
  { id:1, n:3, thingEs:"hojas de papel", nounJp:"紙", correct:["mai"], hint:"Superficies planas → 枚（まい）" },
  { id:2, n:2, thingEs:"lápices", nounJp:"鉛筆", correct:["hon"], hint:"Objetos largos/cilíndricos → 本（ほん）" },
  { id:3, n:5, thingEs:"manzanas", nounJp:"りんご", correct:["ko","tsu"], hint:"Piezas pequeñas → 個; también つ (1–10)" },
  { id:4, n:2, thingEs:"paraguas", nounJp:"傘", correct:["hon"], hint:"Paraguas = objetos largos → 本" },
  { id:5, n:4, thingEs:"platos", nounJp:"皿", correct:["mai"], hint:"Platos son planos → 枚" },
  { id:6, n:6, thingEs:"botellas de agua", nounJp:"（ペット）ボトル", correct:["hon"], hint:"Botellas = cilíndricas → 本" },
  { id:7, n:8, thingEs:"fotografías", nounJp:"写真", correct:["mai"], hint:"Fotos (hojas) → 枚" },
  { id:8, n:7, thingEs:"árboles", nounJp:"木", correct:["hon"], hint:"Troncos/árboles = largos → 本" },
  { id:9, n:9, thingEs:"caramelos", nounJp:"キャンディー", correct:["ko","tsu"], hint:"Piezas pequeñas → 個; つ también válido (1–10)" },
  { id:10,n:10,thingEs:"naranjas", nounJp:"みかん", correct:["ko","tsu"], hint:"Piezas pequeñas → 個; つ también válido (1–10)" },
];

type AnswerMap = Record<number, { choice?: CKey; correct?: boolean }>;

export default function B5_Contadores() {
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const [answers, setAnswers] = useState<AnswerMap>({});

  const score = Object.values(answers).filter(a => a.correct).length;

  /** 📣 Solo TTS — sin sonido del hook */
  function onHear(counter: CKey, n: number) {
    const phrase = reading(counter, n)!;
    try {
      Speech.stop();
      Speech.speak(phrase, { language: "ja-JP", pitch: 1.0, rate: 0.95 });
    } catch {}
  }

  function onPick(q: Quiz, key: CKey) {
    const isRight = q.correct.includes(key);
    Vibration.vibrate(isRight ? 12 : 18);
    if (ready) (isRight ? playCorrect() : playWrong());
    setAnswers(prev => ({ ...prev, [q.id]: { choice: key, correct: isRight } }));
  }

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
          {Array.from({ length: 16 }).map((_, i) => <Petal key={i} delay={i * 450} />)}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⛩️ 文法 II</Text>
            <Text style={s.h}>Contadores（助数詞）— 枚・本・個・つ</Text>
            <Text style={s.sub}>Tabla 1–10 con audio, oraciones y práctica con feedback</Text>
          </View>

          {/* Explicación breve */}
          <View style={s.note}>
            <Text style={s.noteTitle}>¿Cuándo usar cada uno?</Text>
            <Text style={s.noteTxt}>• <Text style={s.bold}>枚（まい）</Text>: cosas planas (papel, fotos, platos, billetes).</Text>
            <Text style={s.noteTxt}>• <Text style={s.bold}>本（ほん）</Text>: largas/cilíndricas (lápices, botellas, paraguas, árboles).</Text>
            <Text style={s.noteTxt}>• <Text style={s.bold}>個（こ）</Text>: piezas pequeñas/contables (fruta, dulces, juguetes pequeños).</Text>
            <Text style={s.noteTxt}>• <Text style={s.bold}>つ</Text>: genérico nativo (1–10). Útil en N5.</Text>
          </View>

          {/* ===== Tabla 1–10 (scroll horizontal + TTS) ===== */}
          <View style={s.tableWrap}>
            {/* Título fuera del scroll, compacto */}
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>Lecturas 1–10</Text>
            </View>

            {/* Scroll horizontal: incluye indicaciones dentro para que no se salgan */}
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={s.table}>
                {/* Indicaciones dentro de la tabla (scrollables) */}
                <View style={s.infoRow}>
                  <View style={s.infoItem}>
                    <Ionicons name="volume-high-outline" size={13} color={INK} />
                    <Text style={s.infoTxt}>Toca cualquier lectura para oírla</Text>
                  </View>
                  <View style={s.infoItem}>
                    <Ionicons name="arrow-forward-circle-outline" size={13} color={INK} />
                    <Text style={s.infoTxt}>Desliza a la derecha para ver todos los contadores</Text>
                  </View>
                </View>

                {/* Encabezado */}
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colNo]}>#</Text>
                  <Text style={[s.th, s.colCounter]}>枚（mai）</Text>
                  <Text style={[s.th, s.colCounter]}>本（hon）</Text>
                  <Text style={[s.th, s.colCounter]}>個（ko）</Text>
                  <Text style={[s.th, s.colCounter]}>つ（tsu）</Text>
                </View>

                {/* Filas 1–10 */}
                {Array.from({ length: 10 }).map((_, idx) => {
                  const n = idx + 1;
                  return (
                    <View key={n} style={[s.tr, idx % 2 ? s.trAlt : null]}>
                      <Text style={[s.td, s.colNo]}>{n}</Text>

                      {/* 枚 */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Reproducir ${MAI[idx]}`}
                        onPress={() => onHear("mai", n)}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                        style={[s.colCounter, s.cellBtn]}
                      >
                        <View style={s.cellContent}>
                          <Text style={s.cellText}>{MAI[idx]}</Text>
                          <Ionicons name="volume-high-outline" size={12} color={INK} style={{ opacity: 0.7 }} />
                        </View>
                      </Pressable>

                      {/* 本 */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Reproducir ${HON[idx]}`}
                        onPress={() => onHear("hon", n)}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                        style={[s.colCounter, s.cellBtn]}
                      >
                        <View style={s.cellContent}>
                          <Text style={s.cellText}>{HON[idx]}</Text>
                          <Ionicons name="volume-high-outline" size={12} color={INK} style={{ opacity: 0.7 }} />
                        </View>
                      </Pressable>

                      {/* 個 */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Reproducir ${KO[idx]}`}
                        onPress={() => onHear("ko", n)}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                        style={[s.colCounter, s.cellBtn]}
                      >
                        <View style={s.cellContent}>
                          <Text style={s.cellText}>{KO[idx]}</Text>
                          <Ionicons name="volume-high-outline" size={12} color={INK} style={{ opacity: 0.7 }} />
                        </View>
                      </Pressable>

                      {/* つ */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Reproducir ${TSU[idx]}`}
                        onPress={() => onHear("tsu", n)}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                        style={[s.colCounter, s.cellBtn]}
                      >
                        <View style={s.cellContent}>
                          <Text style={s.cellText}>{TSU[idx]}</Text>
                          <Ionicons name="volume-high-outline" size={12} color={INK} style={{ opacity: 0.7 }} />
                        </View>
                      </Pressable>
                    </View>
                  );
                })}

                {/* Pie de tabla (tip) */}
                <View style={s.infoRow}>
                  <View style={s.infoItem}>
                    <Ionicons name="bulb-outline" size={13} color={INK} />
                    <Text style={s.infoTxt}>“何枚 / 何本 / 何個 / いくつ” para preguntar “¿cuántos?”</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* ===== Oraciones ===== */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="book-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Oraciones de ejemplo</Text>
            </View>
            {SENTENCES.map((r, i) => (
              <View key={i} style={s.row}>
                <Text style={s.jp}>{r.jp}</Text>
                <Text style={s.es}>{r.es}</Text>
              </View>
            ))}
          </View>

          {/* ===== Ejercicio ===== */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="school-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Elige el contador correcto</Text>
            </View>

            {/* Score */}
            <View style={s.score}>
              <Ionicons name="checkmark-circle-outline" size={18} color={INK} />
              <Text style={s.scoreTxt}>Aciertos: {score} / {QUIZ.length}</Text>
            </View>

            {QUIZ.map(q => {
              const ans = answers[q.id];
              const picked = ans?.choice;
              const isRight = ans?.correct;

              const exampleCorrect = picked && isRight
                ? `${q.nounJp}を${reading(picked, q.n)} ${exVerbFor(q.nounJp)}。`
                : null;

              return (
                <View key={q.id} style={s.quizItem}>
                  <Text style={s.quizPrompt}>{`• ${capital(q.thingEs)}: ${q.n} ${q.thingEs}`}</Text>
                  <Text style={s.quizSub}>{q.nounJp}（{q.thingEs}）</Text>

                  <View style={s.choiceRow}>
                    {(["mai","hon","ko","tsu"] as CKey[]).map(key => (
                      <Pressable
                        key={key}
                        onPress={() => onPick(q, key)}
                        style={[
                          s.choiceBtn,
                          picked === key && (isRight ? s.choiceRight : s.choiceWrong),
                        ]}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                      >
                        <Text style={s.choiceTag}>
                          {COUNTER_LABEL[key].split("—")[0].trim()}
                        </Text>
                        <Text style={s.choiceHelp}>
                          {COUNTER_LABEL[key].split("—")[1].trim()}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Resultado y explicación */}
                  {picked ? (
                    <View style={[s.resultBox, isRight ? s.okBox : s.errBox]}>
                      <Text style={[s.resultTitle, isRight ? s.okTxt : s.errTxt]}>
                        {isRight ? "¡Correcto!" : "Incorrecto"}
                      </Text>
                      <Text style={s.resultMsg}>
                        {isRight ? expOk(q, picked) : expWrong(q, picked)}
                      </Text>

                      {/* Lectura y ejemplo correcto */}
                      <Text style={s.readingLine}>
                        {`Lectura: ${reading(picked, q.n)}`}
                      </Text>
                      {exampleCorrect ? <Text style={s.exampleLine}>例：{exampleCorrect}</Text> : null}
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

/* ======= helpers para explicaciones ======= */
function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function expOk(q: Quiz, picked: CKey) {
  const lbl = COUNTER_LABEL[picked];
  if (q.correct.length > 1) {
    return `Bien: para ${q.thingEs}, ${lbl}. Aquí aceptamos ambas formas (${q.correct.map(c=>COUNTER_LABEL[c].split("—")[0].trim()).join(" / ")}).`;
  }
  return `Bien: ${q.hint}`;
}
function expWrong(q: Quiz, picked: CKey) {
  const need = q.correct.map(c => COUNTER_LABEL[c].split("—")[0].trim()).join(" / ");
  const why = q.hint;
  return `Para “${q.thingEs}” se usa: ${need}. ${why}`;
}
function exVerbFor(nounJp: string) {
  if (nounJp === "紙" || nounJp === "写真" || nounJp === "皿") return "ください";
  if (nounJp === "鉛筆" || nounJp.includes("ボトル")) return "買いました";
  if (nounJp === "傘") return "持っています";
  if (nounJp === "木") return "植えました";
  return "あります";
}

/* ======= estilos ======= */
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

  note: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  noteTitle: { fontWeight: "900", marginBottom: 6, color: INK },
  noteTxt: { color: INK, lineHeight: 18 },
  bold: { fontWeight: "900", color: INK },

  tableWrap: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    gap: 8,
  },
  tableHeaderRow: { flexDirection: "row", alignItems: "center" },
  tableTitle: { fontWeight: "900", color: INK },

  table: { minWidth: 760 }, // ancho de la tabla (hace scroll horizontal)
  infoRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  infoItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 },
  infoTxt: { color: INK, fontSize: 12, marginLeft: 4 },

  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontWeight: "900", color: INK, fontSize: 12 },
  td: { color: INK, fontSize: 14 },
  colNo: { width: 40, textAlign: "center" },
  colCounter: { width: 160, paddingHorizontal: 6 },

  cellBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cellContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cellText: { color: INK, fontSize: 14, fontWeight: "700" },

  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  row: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  es: { color: INK, opacity: 0.9, marginTop: 2 },

  quizCard: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    gap: 8,
  },
  score: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  scoreTxt: { color: INK, fontWeight: "800" },

  quizItem: {
    backgroundColor: WASHI,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 10,
  },
  quizPrompt: { fontWeight: "900", color: INK },
  quizSub: { color: INK, opacity: 0.9, marginTop: 2, marginBottom: 8 },

  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choiceBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  choiceRight: { borderColor: "#5cb85c" },
  choiceWrong: { borderColor: "#d9534f" },
  choiceTag: { fontWeight: "900", color: INK },
  choiceHelp: { fontSize: 12, color: INK, opacity: 0.8 },

  resultBox: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  okBox: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.08)" },
  errBox: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.08)" },
  resultTitle: { fontWeight: "900", marginBottom: 4 },
  okTxt: { color: "#2b7a2b" },
  errTxt: { color: "#a33833" },
  resultMsg: { color: INK, lineHeight: 18 },
  readingLine: { marginTop: 6, color: INK },
  exampleLine: { marginTop: 2, color: INK, fontWeight: "800" },
});
