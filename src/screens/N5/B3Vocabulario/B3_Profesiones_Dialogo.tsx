import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

type Line = { who: "A" | "B"; ja: string; es: string };

function ja(t: string) { Speech.speak(t, { language: "ja-JP", rate: 0.95 }); }

const DIALOG: Line[] = [
  { who: "A", ja: "はじめまして。わたし は さくら です。", es: "Mucho gusto. Soy Sakura." },
  { who: "B", ja: "はじめまして。わたし は けん です。", es: "Mucho gusto. Soy Ken." },
  { who: "A", ja: "なんさい ですか。", es: "¿Cuántos años tienes?" },
  { who: "B", ja: "わたし は じゅうはっさい です。", es: "Tengo 18 años." },
  { who: "A", ja: "しごと は なん ですか。", es: "¿A qué te dedicas?" },
  { who: "B", ja: "わたし は がくせい です。あなた は？", es: "Soy estudiante. ¿Y tú?" },
  { who: "A", ja: "わたし は てんいん です。", es: "Soy dependiente." },
  { who: "B", ja: "そうですか。よろしく おねがいします。", es: "Ya veo. Encantado/a." },
];

export default function B3_Profesiones_Dialogo() {
  const [showES, setShowES] = useState(false);
  const [myTrans, setMyTrans] = useState("");

  const playAll = async () => {
    for (const line of DIALOG) {
      ja(line.ja);
      await new Promise(r => setTimeout(r, 1200));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={s.header}>
          <Text style={s.kicker}>Lectura y traducción</Text>
          <Text style={s.title}>Presentación, edad y trabajo (ひらがな)</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Toggle icon="volume-high-outline" label="Reproducir diálogo" onPress={playAll} />
            <Toggle icon="language" label={showES ? "Ocultar solución" : "Mostrar solución"} onPress={() => setShowES(v => !v)} />
          </View>
        </View>

        <View style={s.card}>
          {DIALOG.map((l, i) => (
            <View key={i} style={s.lineRow}>
              <View style={s.badge}><Text style={s.badgeTxt}>{l.who}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.ja}>{l.ja}</Text>
                {showES ? <Text style={s.es}>{l.es}</Text> : null}
              </View>
              <Pressable onPress={() => ja(l.ja)} style={s.iconBtn}>
                <Ionicons name="play-outline" size={18} color={CRIMSON} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Traducción libre del estudiante */}
        <View style={s.card}>
          <Text style={s.h2}>Traduce el diálogo al español</Text>
          <Text style={s.p}>Escribe tu versión y luego compárala con la solución.</Text>
          <TextInput
            value={myTrans}
            onChangeText={setMyTrans}
            placeholder="Escribe aquí tu traducción en español…"
            multiline
            numberOfLines={6}
            style={s.textarea}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Toggle icon="language" label={showES ? "Ocultar solución" : "Mostrar solución"} onPress={() => setShowES(v => !v)} />
            <Toggle icon="refresh" label="Borrar" onPress={() => setMyTrans("")} />
          </View>
        </View>

        {/* Comprensión rápida */}
        <View style={s.card}>
          <Text style={s.h2}>Comprensión</Text>
          <QA q="A: なんさい ですか。 ¿Qué pregunta?" a="¿Cuántos años tienes?" />
          <QA q="B: わたし は がくせい です。 ¿Qué profesión tiene B?" a="Estudiante." />
          <QA q="A: しごと は なん ですか。 ¿Qué significa?" a="¿A qué te dedicas?" />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.q}>{q}</Text>
      {show ? <Text style={s.a}>✅ {a}</Text> : null}
      <Pressable onPress={() => setShow(v => !v)} style={[s.iconBtn, { alignSelf: "flex-start", marginTop: 6 }]}>
        <Ionicons name="help-circle-outline" size={18} color={CRIMSON} />
        <Text style={{ marginLeft: 6, color: CRIMSON, fontWeight: "900" }}>{show ? "Ocultar" : "Ver respuesta"}</Text>
      </Pressable>
    </View>
  );
}

function Toggle({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={s.toggle}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={s.toggleTxt}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: INK, marginTop: 2 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", padding: 16, marginTop: 12 },

  lineRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  badge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  badgeTxt: { color: CRIMSON, fontWeight: "900" },
  ja: { color: INK },
  es: { color: "#6B7280", marginTop: 2 },

  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6 },

  q: { color: INK, fontWeight: "800" },
  a: { color: "#065f46", marginTop: 2 },

  toggle: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  toggleTxt: { color: CRIMSON, fontWeight: "900" },

  iconBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },

  textarea: { marginTop: 10, minHeight: 160, textAlignVertical: "top", padding: 12, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#fff", color: INK },
});
