import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Tipos ========= */
type Choice = { key: "mo" | "no"; jp: "も" | "✗"; es: string };
const CHOICES: Choice[] = [
  { key: "mo", jp: "も", es: "Sí, lleva も" },
  { key: "no", jp: "✗", es: "No lleva も" },
];

/** ========= Banco ========= */
const BANK = [
  { ja: "わたし ___ がくせい です。", es: "Yo también soy estudiante.", answer: "mo", explain: "Usamos も para decir 'también'." },
  { ja: "みず ___ のみます。", es: "También bebo agua.", answer: "mo", explain: "も sustituye a を en esta oración." },
  { ja: "にほんご ___ はなします。", es: "También hablo japonés.", answer: "mo", explain: "も se usa para agregar algo igual." },
  { ja: "ともだち ___ きました。", es: "También vino un amigo.", answer: "mo", explain: "も sustituye a が." },
  { ja: "このほん ___ おもしろい です。", es: "Este libro también es interesante.", answer: "mo", explain: "も indica que comparte la misma característica." },
  { ja: "パン ___ たべます。", es: "También como pan.", answer: "mo", explain: "も se usa en listas o cosas adicionales." },
  { ja: "すし ___ すき です。", es: "También me gusta el sushi.", answer: "mo", explain: "も marca 'también' para gustos." },
  { ja: "きのう ___ いきました。", es: "También fui ayer.", answer: "mo", explain: "も puede usarse con expresiones de tiempo." },
  { ja: "わたし ___ テレビ を みません。", es: "Yo tampoco veo televisión.", answer: "mo", explain: "も funciona para 'tampoco' en frases negativas." },
  { ja: "にほん ___ いきました。", es: "Fui a Japón.", answer: "no", explain: "Aquí no hay idea de 'también', así que no usamos も." },
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
export default function B4_Mo() {
  const [showES, setShowES] = useState(true);

  // quiz
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
        <Ionicons name="repeat-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>も — “También”</Text>
          <Text style={s.subtitle}>Aprende a usar も para agregar ideas similares ✨</Text>
        </View>
      </View>

      {/* Definición fácil */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📖 Definición fácil</Text>
        <Text style={s.text}>
          <Text style={s.bold}>も</Text> significa “también” y se usa para <Text style={s.bold}>añadir</Text> algo igual a lo dicho antes.
        </Text>
        <Text style={s.text}>
          Sustituye a <Text style={s.bold}>は / が / を</Text> en la oración, pero <Text style={s.bold}>nunca</Text> se usa junto con ellos.
        </Text>
      </View>

      {/* Diferencias */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🔎 Diferencias</Text>
        <Text style={s.text}>• は / が / を → se usan normalmente.</Text>
        <Text style={s.text}>• も → se usa cuando queremos decir “también”.</Text>
        <Text style={s.text}>• Si la oración es negativa, también sirve para “tampoco”.</Text>
      </View>

      {/* Ejemplos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🧪 Ejemplos</Text>
        {[
          { ja: "わたし も がくせい です。", es: "Yo también soy estudiante." },
          { ja: "みず も のみます。", es: "También bebo agua." },
          { ja: "きのう も いきました。", es: "También fui ayer." },
          { ja: "わたし も テレビ を みません。", es: "Yo tampoco veo televisión." },
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
        <Text style={s.cardTitle}>🎯 Quiz — ¿Lleva も?</Text>
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
const BG = "#F0FDF4";
const ACCENT = "#15803D";

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#14532D", lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#14532D" },
  text: { color: "#1E293B", lineHeight: 22 },

  example: { fontSize: 18, fontWeight: "800", color: "#14532D" },
  translation: { color: "#374151", marginTop: 2 },

  meta: { fontSize: 13, fontWeight: "800", color: "#14532D", marginTop: 4 },

  bigLine: { color: "#14532D", fontSize: 18, fontWeight: "800" },

  qbtn: { flexDirection: "column", alignItems: "center", borderRadius: 12, paddingVertical: 12 },
  qbtnJp: { color: "#fff", fontSize: 22, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#F0FDF4" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

const btn = StyleSheet.create({
  icon: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
});
