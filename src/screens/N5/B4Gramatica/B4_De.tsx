import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";

// Hook global (misma ruta que usas en las otras pantallas)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ======= Tip: choices y mapa ======= */
type Choice = { key: "de" | "ni" | "he"; jp: "で" | "に" | "へ"; es: string };
const CHOICES: Choice[] = [
  { key: "de", jp: "で", es: "lugar / medio" },
  { key: "ni", jp: "に", es: "destino / tiempo" },
  { key: "he", jp: "へ", es: "dirección / hacia" },
];
const CMAP = Object.fromEntries(CHOICES.map(c => [c.key, c])) as Record<Choice["key"], Choice>;

type GapItem = {
  ja: string;    // frase con ___
  es: string;    // traducción simple
  answer: Choice["key"];
  explain: string;
};

/** ======= Banco (mezcla de で vs に vs へ para practicar) ======= */
const BANK: GapItem[] = [
  { ja: "がっこう ___ べんきょう します。", es: "Estudio en la escuela.", answer: "de", explain: "El lugar donde ocurre la acción → で." },
  { ja: "バス ___ いきます。", es: "Voy en autobús.", answer: "de", explain: "Medio/transporte → で (voy en X)." },
  { ja: "えき ___ いきます。", es: "Voy a la estación.", answer: "ni", explain: "Destino final → に." },
  { ja: "こうえん ___ あるきます。", es: "Camino hacia el parque.", answer: "he", explain: "Dirección/hacia → へ." },
  { ja: "レストラン ___ しょくじ します。", es: "Como en el restaurante.", answer: "de", explain: "Lugar de la acción → で." },
  { ja: "はし ___ たべます。", es: "Como con palillos.", answer: "de", explain: "Instrumento/medio (palillos) → で." },
  { ja: "にちようび ___ でかけます。", es: "Salgo el domingo.", answer: "ni", explain: "Día/fecha específica → に." },
  { ja: "ほんや ___ いきます。", es: "Voy a la librería.", answer: "ni", explain: "Llegar a un sitio final → に." },
  { ja: "えいがかん ___ いきます。", es: "Voy hacia el cine.", answer: "he", explain: "Dirección simple → へ." },
  { ja: "こうばん ___ で はたらきます。", es: "Trabajo en la comisaría.", answer: "de", explain: "Lugar donde ocurre la acción → で." },
];

/** ======= Utilidades ======= */
function speakJA(t: string) {
  if (!t) return;
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
function stripMeta(s: string) {
  return s.replace(/（.*?）/g, "").trim();
}

/** ======= Componente ======= */
export default function B4_De() {
  const [showES, setShowES] = useState(true);

  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  // Hook global de sonidos (igual que en la otra pantalla)
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
    if (i + 1 >= deck.length) { setI(0); setPicked(null); setScore(0); return; }
    setI(v => v + 1);
    setPicked(null);
  };

  const pronounceCorrect = () => {
    if (!item) return;
    const mapEntry = CMAP[item.answer];
    if (!mapEntry) return;
    const tail = mapEntry.jp;
    speakJA(stripMeta(item.ja).replace("___", tail));
  };

  // Ejemplos fijos para la parte de explicación (no el quiz)
  const ejemplos = [
    { ja: "がっこう で べんきょう します。", es: "Estudio en la escuela." },
    { ja: "バス で いきます。", es: "Voy en autobús." },
    { ja: "はし で たべます。", es: "Como con palillos." },
  ];

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="construct-outline" size={28} color={ACCENT_DARK} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>で — Lugar de la acción / Medio</Text>
          <Text style={s.subtitle}>
            Marca <Text style={s.bold}>dónde ocurre</Text> la acción o el <Text style={s.bold}>medio</Text> que se usa.
          </Text>
        </View>
      </View>

      {/* Idea */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Idea básica</Text>
        <Text style={s.text}>
          Usa <Text style={s.bold}>で</Text> para expresar el <Text style={s.bold}>lugar</Text> donde pasa algo y para indicar el{" "}
          <Text style={s.bold}>medio</Text> o instrumento con el que se hace una acción.
        </Text>
      </View>

      {/* Ejemplos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Ejemplos</Text>
        {ejemplos.map((e, idx) => (
          <View key={idx} style={s.exampleRow}>
            <Pressable onPress={() => speakJA(e.ja)} style={s.soundBtn}>
              <Ionicons name="volume-high-outline" size={18} color={ACCENT_DARK} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={s.ja}>{e.ja}</Text>
              {showES && <Text style={s.es}>{e.es}</Text>}
            </View>
          </View>
        ))}

        <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setShowES(v => !v)} style={btn.outline}>
            <Ionicons name="globe-outline" size={16} color={ACCENT_DARK} />
            <Text style={btn.txt}>{showES ? "Ocultar ES" : "Mostrar ES"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Tip */}
      <View style={[s.card, { backgroundColor: "#F0F9FF" }]}>
        <Text style={s.cardTitle}>Truco</Text>
        <Text style={s.text}>Pregunta: 「どこで Xしますか？」 = “¿Dónde haces X?” → usa で.</Text>
      </View>

      {/* ======= QUIZ ======= */}
      <View style={[s.card, { marginTop: 6 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.cardTitle}>Quiz: Elige で / に / へ</Text>
          <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
        </View>

        <View style={{ marginTop: 10, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.bigLine}>{item.ja}</Text>
            <Pressable onPress={pronounceCorrect} style={btn.icon}>
              <Ionicons name="volume-high-outline" size={16} color={ACCENT_DARK} />
            </Pressable>
          </View>
          {showES && <Text style={s.es}>{item.es}</Text>}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {CHOICES.map(c => {
            const chosen = picked != null;
            const isPicked = picked === c.key;
            const isRight = chosen && c.key === item.answer;
            const bg = !chosen ? ACCENT_DARK : isRight ? "#059669" : isPicked ? "#DC2626" : "#6B7280";
            return (
              <Pressable
                key={c.key}
                onPress={() => onPick(c.key)}
                disabled={chosen}
                style={[s.qbtn, { backgroundColor: bg }]}
              >
                <Text style={s.qbtnJp}>{c.jp}</Text>
                <Text style={s.qbtnEs}>{c.es}</Text>
              </Pressable>
            );
          })}
        </View>

        {picked && (
          <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name={picked === item.answer ? "checkmark-circle" : "close-circle"} size={20}
                color={picked === item.answer ? "#059669" : "#DC2626"} />
              <Text style={[s.h2, { color: picked === item.answer ? "#065F46" : "#7F1D1D" }]}>
                {picked === item.answer ? "¡Perfecto!" : "Intenta otra vez"}
              </Text>
            </View>
            <Text style={s.p}><Text style={s.bold}>Por qué:</Text> {item.explain}</Text>
          </View>
        )}

        <Pressable onPress={next} disabled={picked == null} style={[s.primaryBtn, { marginTop: 12, opacity: picked == null ? 0.5 : 1 }]}>
          <Text style={s.primaryBtnText}>{i + 1 >= deck.length ? "Reiniciar" : "Siguiente"}</Text>
        </Pressable>
      </View>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

/** ======= Estilos ======= */
const BG = "#E0F2FE";
const ACCENT_DARK = "#0C4A6E";

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#BAE6FD",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7DD3FC",
  },
  title: { fontSize: 20, fontWeight: "900", color: ACCENT_DARK },
  subtitle: { marginTop: 4, color: "#075985", lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT_DARK },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1E3A8A" },
  text: { color: "#1E293B", lineHeight: 20 },

  exampleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  soundBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#7DD3FC",
  },
  ja: { fontSize: 16, fontWeight: "600", color: ACCENT_DARK },
  es: { color: "#334155" },

  // quiz styles
  meta: { fontSize: 12, color: "#1E3A8A", fontWeight: "700" },
  bigLine: { color: "#0C4A6E", marginLeft: 6, fontSize: 18, fontWeight: "800" },
  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#FFFBF8" },

  primaryBtn: { backgroundColor: "#0C4A6E", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  h2: { fontSize: 16, fontWeight: "900", color: "#0C4A6E" },
  p: { color: "#1E293B", marginTop: 6, lineHeight: 20 },

  ribbon: { width: 64, height: 8, borderRadius: 6, backgroundColor: "#93C5FD", opacity: 0.95 },
});

const btn = StyleSheet.create({
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#BFDBFE" },
  txt: { color: ACCENT_DARK, fontWeight: "900" },
  icon: { padding: 6, borderRadius: 999, backgroundColor: "#E0F2FE", borderWidth: 1, borderColor: "#7DD3FC" }
});
