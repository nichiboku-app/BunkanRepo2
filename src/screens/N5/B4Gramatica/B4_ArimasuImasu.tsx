import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Opciones ========= */
type Choice = { key: "aru" | "iru"; jp: "あります" | "います"; es: string };
const CHOICES: Choice[] = [
  { key: "aru", jp: "あります", es: "objetos / cosas" },
  { key: "iru", jp: "います", es: "personas / animales" },
];
const CMAP = Object.fromEntries(CHOICES.map(c => [c.key, c])) as Record<Choice["key"], Choice>;

type GapItem = {
  ja: string;
  es: string;
  answer: Choice["key"];
  explain: string;
};

/** ========= Banco de preguntas ========= */
const BANK: GapItem[] = [
  {
    ja: "こうえん に いぬ が ___。",
    es: "Hay un perro en el parque.",
    answer: "iru",
    explain: "いぬ (perro) es un ser vivo → usamos います."
  },
  {
    ja: "へや に いす が ___。",
    es: "Hay una silla en la habitación.",
    answer: "aru",
    explain: "いす (silla) es un objeto → usamos あります."
  },
  {
    ja: "まち に き が ___。",
    es: "Hay un árbol en la ciudad.",
    answer: "aru",
    explain: "き (árbol) es una cosa → usamos あります."
  },
  {
    ja: "がっこう に せんせい が ___。",
    es: "Hay un maestro en la escuela.",
    answer: "iru",
    explain: "せんせい (maestro) es una persona → usamos います."
  },
  {
    ja: "いえ に ねこ が ___。",
    es: "Hay un gato en la casa.",
    answer: "iru",
    explain: "ねこ (gato) es un ser vivo → usamos います."
  },
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

/** ========= Pantalla principal ========= */
export default function B4_ArimasuImasu() {
  const [showES, setShowES] = useState(true);

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
    if (i + 1 >= deck.length) { setI(0); setPicked(null); setScore(0); return; }
    setI(v => v + 1);
    setPicked(null);
  };

  const pronounceCorrect = () => {
    const tail = CMAP[item.answer].jp;
    speakJA(item.ja.replace("___", tail));
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Encabezado */}
      <View style={s.header}>
        <Ionicons name="leaf-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>あります ／ います — Existencia</Text>
          <Text style={s.subtitle}>
            <Text style={s.bold}>あります</Text>: cosas u objetos{"  "}
            <Text style={s.bold}>います</Text>: personas o animales
          </Text>
        </View>
      </View>

      {/* Explicación como primaria */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📖 Definición</Text>
        <Text style={s.text}>
          En japonés hay dos maneras de decir “hay” o “existe”:
        </Text>
        <Text style={s.text}>
          • <Text style={s.bold}>あります</Text> se usa con <Text style={s.bold}>cosas que no viven</Text> como mesas, árboles o libros.
        </Text>
        <Text style={s.text}>
          • <Text style={s.bold}>います</Text> se usa con <Text style={s.bold}>seres vivos</Text> como personas y animales.
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>📌 Diferencias</Text>
        <Text style={s.text}>• あります → cosas sin vida</Text>
        <Text style={s.text}>• います → seres vivos</Text>
        <Text style={s.text}>
          Estructura: <Text style={s.bold}>Lugar + に + sujeto + が + あります／います</Text>
        </Text>
      </View>

      {/* Ejemplos */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🧪 Ejemplos</Text>
        <Text style={s.text}>こうえん に いぬ が います。— Hay un perro en el parque.</Text>
        <Text style={s.text}>へや に いす が あります。— Hay una silla en la habitación.</Text>
        <Text style={s.text}>がっこう に せんせい が います。— Hay un maestro en la escuela.</Text>
      </View>

      {/* Quiz */}
      <View style={s.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.cardTitle}>🎯 Quiz: Elige あります o います</Text>
          <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.bigLine}>{item.ja}</Text>
            <Pressable onPress={pronounceCorrect} style={btn.icon}>
              <Ionicons name="volume-high-outline" size={16} color={ACCENT} />
            </Pressable>
          </View>
          {showES && <Text style={s.es}>{item.es}</Text>}
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
                style={[s.qbtn, { backgroundColor: bg }]}
              >
                <Text style={s.qbtnJp}>{c.jp}</Text>
                <Text style={s.qbtnEs}>{c.es}</Text>
              </Pressable>
            );
          })}
        </View>

        {picked && (
          <View style={[s.explainBox, { borderColor: picked === item.answer ? "#16A34A" : "#DC2626" }]}>
            <Text style={s.explain}>
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
const BG = "#ECFDF5";
const ACCENT = "#047857";

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#065F46", lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#065F46" },
  text: { color: "#1E293B", lineHeight: 22 },

  meta: { fontSize: 12, color: "#065F46", fontWeight: "700" },
  bigLine: { color: "#065F46", marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#374151", marginTop: 4 },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#F0FDF4" },
  explain: { color: "#1E293B" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});

const btn = StyleSheet.create({
  icon: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
});
