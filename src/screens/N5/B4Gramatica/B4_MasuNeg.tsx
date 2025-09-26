import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Tipos ========= */
type Choice = { key: "neg" | "pos"; jp: "〜ません" | "〜ます"; es: string };
const CHOICES: Choice[] = [
  { key: "neg", jp: "〜ません", es: "Forma negativa" },
  { key: "pos", jp: "〜ます", es: "Forma afirmativa" },
];

/** ========= Banco de preguntas ========= */
const BANK = [
  { ja: "コーヒー を のみません。", es: "No tomo café.", answer: "neg", explain: "〜ません es la forma negativa cortés." },
  { ja: "テレビ を みません。", es: "No veo televisión.", answer: "neg", explain: "〜ません indica que no haces la acción." },
  { ja: "まいにち はしりません。", es: "No corro todos los días.", answer: "neg", explain: "〜ません se usa en presente negativo habitual." },
  { ja: "にほんご を べんきょうしません。", es: "No estudio japonés.", answer: "neg", explain: "〜ません = no hacer la acción." },
  { ja: "パン を たべません。", es: "No como pan.", answer: "neg", explain: "〜ません se agrega a la raíz del verbo." },
  { ja: "おちゃ を のみません。", es: "No tomo té.", answer: "neg", explain: "〜ません expresa negación educada." },
  { ja: "くるま を うんてんしません。", es: "No manejo un coche.", answer: "neg", explain: "〜ません indica acción que no ocurre." },
  { ja: "えいが を みません。", es: "No veo películas.", answer: "neg", explain: "〜ません = no lo hago." },
  { ja: "がっこう へ いきません。", es: "No voy a la escuela.", answer: "neg", explain: "〜ません niega el verbo 行きます (ir)." },
  { ja: "ほん を よみません。", es: "No leo libros.", answer: "neg", explain: "〜ません niega el verbo 読みます (leer)." },
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
export default function B4_MasuNeg() {
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
        <Ionicons name="close-circle-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>❌ Negación — 〜ません</Text>
          <Text style={s.subtitle}>Aprende cómo decir que <Text style={s.bold}>NO</Text> haces algo</Text>
        </View>
      </View>

      {/* Definición fácil */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📖 Explicación fácil</Text>
        <Text style={s.text}>
          Para decir que <Text style={s.bold}>NO haces una acción</Text> en japonés de forma educada, usamos la forma <Text style={s.bold}>〜ません</Text>.
        </Text>
        <Text style={s.text}>📌 Se agrega a la raíz del verbo:</Text>
        <Text style={s.text}>・のみます → のみません (no beber)</Text>
        <Text style={s.text}>・みます → みません (no ver)</Text>
      </View>

      {/* Uso de は con negativo */}
      <View style={[s.card, { backgroundColor: "#FFF5F5" }]}>
        <Text style={s.cardTitle}>🧠 Cómo usar 「は」 con verbos negativos</Text>
        <Text style={s.text}>
          「は」 se usa para marcar el **tema** incluso con la forma negativa. Sirve para **enfatizar** o **contrastar** que algo *no ocurre*.
        </Text>
        <Text style={s.text}>📍 Estructura: 【tema】<Text style={s.bold}>は</Text> 【〜ません】</Text>

        <Text style={s.text}>🔎 Ejemplos:</Text>
        <Text style={s.text}>・わたし <Text style={s.bold}>は</Text> コーヒー を のみません。→ Yo no tomo café.</Text>
        <Text style={s.text}>・にほんちゃ <Text style={s.bold}>は</Text> のみません。→ Té japonés no tomo (pero tal vez sí tomo té negro).</Text>
        <Text style={s.text}>・テレビ <Text style={s.bold}>は</Text> みません。→ Televisión no veo (pero sí leo libros).</Text>

        <Text style={[s.text, { marginTop: 8 }]}>✅ Diferencia:</Text>
        <Text style={s.text}>・コーヒー を のみません。→ No tomo café. (neutral)</Text>
        <Text style={s.text}>・コーヒー <Text style={s.bold}>は</Text> のみません。→ *Café* no tomo. (contraste)</Text>
      </View>

      {/* Ejemplos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🧪 Ejemplos</Text>
        {[
          { ja: "コーヒー は のみません。", es: "Café no tomo." },
          { ja: "テレビ は みません。", es: "Televisión no veo." },
          { ja: "パン は たべません。", es: "Pan no como." },
          { ja: "がっこう へ は いきません。", es: "No voy a la escuela." },
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
        <Text style={s.cardTitle}>🎯 Quiz — ¿Es negativa?</Text>
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
const BG = "#FEF2F2";
const ACCENT = "#DC2626";

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#7F1D1D", lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#7F1D1D" },
  text: { color: "#1E293B", lineHeight: 22 },

  example: { fontSize: 18, fontWeight: "800", color: "#7F1D1D" },
  translation: { color: "#374151", marginTop: 2 },

  meta: { fontSize: 13, fontWeight: "800", color: "#7F1D1D", marginTop: 4 },

  bigLine: { color: "#7F1D1D", fontSize: 18, fontWeight: "800" },

  qbtn: { flexDirection: "column", alignItems: "center", borderRadius: 12, paddingVertical: 12 },
  qbtnJp: { color: "#fff", fontSize: 22, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#FEE2E2" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

const btn = StyleSheet.create({
  icon: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
