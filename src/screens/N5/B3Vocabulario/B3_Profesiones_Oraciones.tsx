// src/screens/N5/B3Vocabulario/B3_Profesiones_Oraciones.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
// ⬇️ ✅ SONIDOS DE FEEDBACK (ajusta la ruta si lo necesitas)
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

type Ex = {
  id: number;
  segments: string[];   // trozos fijos (answers.length + 1)
  answers: string[];    // huecos a rellenar en orden
  options: string[];    // banco de palabras (incluye las correctas)
  hintES: string;
};

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

function ja(t: string) { try { Speech.speak(t, { language: "ja-JP", rate: 0.95 }); } catch {} }

const EXS: Ex[] = [
  { id: 1, segments: ["わたし ", " せんせい ", "。"], answers: ["は", "です"], options: ["は", "が", "を", "です", "か"], hintES: "Yo soy profesor/a." },
  { id: 2, segments: ["わたし は ", " ", "。"], answers: ["がくせい", "では ありません"], options: ["がくせい", "です", "では ありません", "か"], hintES: "Yo no soy estudiante." },
  { id: 3, segments: ["しごと は ", " ですか。"], answers: ["なん"], options: ["なん", "どこ", "いつ"], hintES: "¿A qué te dedicas?" },
  { id: 4, segments: ["かれ は ", " ", "。"], answers: ["いしゃ", "です"], options: ["いしゃ", "か", "です"], hintES: "Él es médico." },
  { id: 5, segments: ["あなた は ", " ですか。"], answers: ["なんさい"], options: ["なんさい", "どの", "なに"], hintES: "¿Cuántos años tienes?" },
  { id: 6, segments: ["わたし は ", " です。"], answers: ["じゅうはっさい"], options: ["じゅうはっさい", "じゅうはち", "はちさい"], hintES: "Tengo 18 años." },
  { id: 7, segments: ["おとうと は ", " ", "。"], answers: ["てんいん", "です"], options: ["てんいん", "です", "か"], hintES: "Mi hermano menor es dependiente." },
  { id: 8, segments: ["わたし は ", " ", "。"], answers: ["うんてんしゅ", "では ありません"], options: ["うんてんしゅ", "では ありません", "です"], hintES: "Yo no soy conductor/a." },
];

export default function B3_Profesiones_Oraciones() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);

  // ⬇️ ✅ Hook de sonidos (igual que en TQuizEscucha)
  const { playCorrect, playWrong, ready: sndReady } = useFeedbackSounds();

  const ex = EXS[idx];
  const fullSentence = useMemo(() => {
    let out = "";
    for (let i = 0; i < ex.answers.length; i++) {
      out += ex.segments[i] + (picked[i] ?? "____");
    }
    out += ex.segments[ex.answers.length];
    return out;
  }, [ex, picked]);

  const onPick = (w: string) => {
    if (checked !== null) return;
    if (picked.length >= ex.answers.length) return;
    setPicked(prev => [...prev, w]);
  };

  const onReset = () => { setPicked([]); setChecked(null); };

  const onCheck = async () => {
    if (picked.length !== ex.answers.length) return;
    const ok = ex.answers.every((a, i) => a === picked[i]);
    setChecked(ok);
    if (ok) {
      setScore(s => s + 1);
      Vibration.vibrate(12);
      if (sndReady) { try { await playCorrect(); } catch {} }
    } else {
      Vibration.vibrate([0, 30, 40, 30]);
      if (sndReady) { try { await playWrong(); } catch {} }
    }
  };

  const onNext = () => {
    if (idx < EXS.length - 1) {
      setIdx(i => i + 1);
    } else {
      setIdx(0);
      setScore(0);
    }
    setPicked([]);
    setChecked(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Header score={score} total={EXS.length} />

        <View style={s.card}>
          <Text style={s.h2}>Ejercicio {idx + 1} / {EXS.length}</Text>
          <Text style={s.p}>Completa la oración en ひらがな. Pista: {ex.hintES}</Text>

          <View style={s.sentenceBox}>
            <Text style={s.ja}>{fullSentence}</Text>
            <Pressable onPress={() => ja(fullSentence)} style={s.iconBtn}>
              <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
            </Pressable>
          </View>

          <View style={s.bank}>
            {ex.options.map((w, i) => (
              <Chip
                key={i + w + idx}
                label={w}
                disabled={picked.includes(w) && ex.options.filter(x => x === w).length === 1}
                onPress={() => onPick(w)}
              />
            ))}
          </View>

          <View style={s.actions}>
            <Btn kind="ghost" icon="refresh" label="Reiniciar" onPress={onReset} />
            <Btn kind="primary" icon="checkmark-circle-outline" label="Comprobar" onPress={onCheck} disabled={picked.length !== ex.answers.length} />
          </View>

          {checked !== null && (
            <View style={[s.feedback, checked ? s.ok : s.bad]}>
              <Ionicons name={checked ? "checkmark-circle-outline" : "close-circle-outline"} size={18} color={checked ? "#059669" : "#b91c1c"} />
              <Text style={{ color: checked ? "#065f46" : "#7f1d1d", fontWeight: "800" }}>
                {checked ? "¡Correcto!" : "Intenta de nuevo o pulsa “Siguiente”."}
              </Text>
            </View>
          )}

          <View style={s.actions}>
            <Btn kind="outline" icon="chevron-forward" label={idx + 1 >= EXS.length ? "Reiniciar" : "Siguiente"} onPress={onNext} />
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Header({ score, total }: { score: number; total: number }) {
  return (
    <View style={s.header}>
      <Text style={s.kicker}>Práctica: armar oraciones</Text>
      <Text style={s.title}>です・では ありません・しごと は なん ですか</Text>
      <Text style={s.jpSub}>Todo en ひらがな</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <View style={s.tag}><Text style={s.tagTxt}>Puntaje: {score} / {total}</Text></View>
      </View>
    </View>
  );
}

/* UI */
function Chip({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void; }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[s.chip, disabled && { opacity: 0.5 }]}>
      <Text style={s.chipTxt}>{label}</Text>
    </Pressable>
  );
}

function Btn({ kind, icon, label, onPress, disabled }:{
  kind: "primary" | "outline" | "ghost";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const base = [s.btn, kind === "primary" && s.btnPrimary, kind === "outline" && s.btnOutline, kind === "ghost" && s.btnGhost, disabled && { opacity: 0.5 }];
  return (
    <Pressable onPress={!disabled ? onPress : undefined} style={base}>
      <Ionicons name={icon} size={18} color={kind === "primary" ? "#fff" : CRIMSON} />
      <Text style={[s.btnTxt, kind === "primary" && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

/* estilos */
const s = StyleSheet.create({
  header: {
    backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", padding: 16, marginTop: 12 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },

  sentenceBox: { marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", flexDirection: "row", alignItems: "center", gap: 8 },
  ja: { fontSize: 16, color: INK, flex: 1 },

  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  chipTxt: { color: INK, fontWeight: "800" },

  actions: { marginTop: 12, flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  btnPrimary: { backgroundColor: CRIMSON },
  btnOutline: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  btnGhost: { backgroundColor: "#fffdf7", borderWidth: 1, borderColor: "#f8e7ea" },
  btnTxt: { color: CRIMSON, fontWeight: "900" },

  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },

  feedback: { marginTop: 10, gap: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  ok: { borderColor: "#86efac", backgroundColor: "#ecfdf5" },
  bad: { borderColor: "#fecaca", backgroundColor: "#fff1f2" },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },
});
