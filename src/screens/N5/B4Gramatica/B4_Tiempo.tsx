import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Tipos ========= */
type Choice = { key: "ni" | "omit"; jp: "に" | "✗"; es: string };
const CHOICES: Choice[] = [
  { key: "ni", jp: "に", es: "Sí, lleva に" },
  { key: "omit", jp: "✗", es: "No se usa に" },
];

/** ========= Banco de preguntas ========= */
const BANK = [
  { ja: "３じ ___ おきます。", es: "Me levanto a las 3.", answer: "ni", explain: "Usamos に para horas específicas." },
  { ja: "げつようび ___ がっこう へ いきます。", es: "Voy a la escuela el lunes.", answer: "ni", explain: "Se usa に con días de la semana." },
  { ja: "１２がつ ５か ___ しけん が あります。", es: "Hay examen el 5 de diciembre.", answer: "ni", explain: "Se usa に con fechas." },
  { ja: "あさ ___ コーヒー を のみます。", es: "Tomo café por la mañana.", answer: "omit", explain: "Con momentos del día (あさ・よる・ひる) に puede omitirse." },
  { ja: "きょう ___ がっこう へ いきます。", es: "Voy a la escuela hoy.", answer: "omit", explain: "Con palabras como きょう o あした no se usa に." },
  { ja: "しゅうまつ ___ えいが を みます。", es: "Veo una película el fin de semana.", answer: "ni", explain: "Con しゅうまつ sí usamos に." },
  { ja: "あした ___ パーティー が あります。", es: "Hay una fiesta mañana.", answer: "omit", explain: "Con あした no se usa に." },
  { ja: "よる ___ ほん を よみます。", es: "Leo un libro por la noche.", answer: "omit", explain: "Con expresiones generales del día, に es opcional y suele omitirse." },
  { ja: "にちようび ___ ともだち に あいます。", es: "Me reúno con un amigo el domingo.", answer: "ni", explain: "Con días concretos usamos に." },
  { ja: "まいにち ___ さんぽ を します。", es: "Paseo todos los días.", answer: "omit", explain: "Con expresiones de frecuencia (まいにち, まいばん) no se usa に." },
];

/** ========= Utilidades ========= */
function speakJA(t: string) {
  Speech.speak(t, { language: "ja-JP", rate: 0.98 });
}
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ========= Pantalla ========= */
export default function B4_Tiempo() {
  const [showES, setShowES] = useState(true);

  // Quiz
  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  const { playCorrect, playWrong } = useFeedbackSounds();

  const onPick = (k: Choice["key"]) => {
    if (picked) return;
    setPicked(k);
    const ok = k === item.answer;
    if (ok) {
      setScore(s => s + 1);
      Vibration.vibrate(12);
      playCorrect().catch(() => {});
    } else {
      Vibration.vibrate([0, 30, 40, 30]);
      playWrong().catch(() => {});
    }
  };

  const next = () => {
    if (picked == null) return;
    if (i + 1 >= deck.length) {
      setI(0);
      setScore(0);
      setPicked(null);
      return;
    }
    setI(v => v + 1);
    setPicked(null);
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="time-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>⏰ Tiempo — 時間・曜日・に</Text>
          <Text style={s.subtitle}>Aprende a usar に con horas, días y fechas 📅</Text>
        </View>
      </View>

      {/* Definición */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📖 Definición fácil</Text>
        <Text style={s.text}>
          <Text style={s.bold}>に</Text> se usa para indicar el <Text style={s.bold}>tiempo específico</Text> en que ocurre algo: hora, día, fecha, mes o año.
        </Text>
        <Text style={s.text}>Ej: ３じ に おきます。→ “Me levanto a las 3.”</Text>
      </View>

      {/* Diferencias */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🔎 Cuándo se omite</Text>
        <Text style={s.text}>• No se usa con palabras como きょう (hoy), あした (mañana), まいにち (cada día).</Text>
        <Text style={s.text}>• Puede omitirse con partes del día (あさ, ひる, よる).</Text>
      </View>

      {/* Ejemplos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🧪 Ejemplos</Text>
        {[
          { ja: "３じ に おきます。", es: "Me levanto a las 3." },
          { ja: "げつようび に がっこう へ いきます。", es: "Voy a la escuela el lunes." },
          { ja: "きょう は にちようび です。", es: "Hoy es domingo." },
          { ja: "まいにち さんぽ を します。", es: "Paseo todos los días." },
        ].map((e, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.example}>{e.ja}</Text>
              <Pressable onPress={() => speakJA(e.ja)} style={btn.icon}>
                <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
              </Pressable>
            </View>
            {showES && <Text style={s.translation}>{e.es}</Text>}
          </View>
        ))}
      </View>

      {/* Quiz */}
      <View style={[s.card, { marginTop: 20 }]}>
        <Text style={s.cardTitle}>🎯 Quiz — ¿Se usa に?</Text>
        <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>

        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.bigLine}>{item.ja}</Text>
            <Pressable onPress={() => speakJA(item.ja)} style={btn.icon}>
              <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
            </Pressable>
          </View>
          {showES && <Text style={s.translation}>{item.es}</Text>}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {CHOICES.map(c => {
            const chosen = picked != null;
            const isPicked = picked === c.key;
            const isRight = chosen && c.key === item.answer;
            const bg = !chosen ? ACCENT : isRight ? "#16A34A" : isPicked ? "#DC2626" : "#6B7280";
            return (
              <Pressable
                key={c.key}
                onPress={() => onPick(c.key)}
                disabled={chosen}
                style={[s.qbtn, { backgroundColor: bg, flex: 1 }]}
              >
                <Text style={s.qbtnJp}>{c.jp}</Text>
                <Text style={s.qbtnEs}>{c.es}</Text>
              </Pressable>
            );
          })}
        </View>

        {picked && (
          <View style={[s.explainBox, { borderColor: picked === item.answer ? "#16A34A" : "#DC2626" }]}>
            <Text style={s.text}>
              <Text style={s.bold}>Por qué:</Text> {item.explain}
            </Text>
          </View>
        )}

        <Pressable
          onPress={next}
          disabled={picked == null}
          style={[s.primaryBtn, { marginTop: 12, opacity: picked == null ? 0.5 : 1 }]}
        >
          <Text style={s.primaryBtnText}>{i + 1 >= deck.length ? "Reiniciar" : "Siguiente"}</Text>
        </Pressable>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/** ======= Estilos ======= */
const BG = "#EFF6FF";
const ACCENT = "#1D4ED8";

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#1E3A8A", lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1E3A8A" },
  text: { color: "#1E293B", lineHeight: 22 },

  example: { fontSize: 18, fontWeight: "800", color: "#1E3A8A" },
  translation: { color: "#374151", marginTop: 2 },

  meta: { fontSize: 13, fontWeight: "800", color: "#1E3A8A", marginTop: 4 },

  bigLine: { color: "#1E3A8A", fontSize: 18, fontWeight: "800" },

  qbtn: { flexDirection: "column", alignItems: "center", borderRadius: 12, paddingVertical: 12 },
  qbtnJp: { color: "#fff", fontSize: 22, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#EFF6FF" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

const btn = StyleSheet.create({
  icon: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
});
