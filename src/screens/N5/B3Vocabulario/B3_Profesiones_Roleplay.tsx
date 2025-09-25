// src/screens/N5/B3Vocabulario/B3_Profesiones_Roleplay.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Choice = { key: string; kana: string; es: string };

const CHOICES: Choice[] = [
  { key: "sensei", kana: "せんせい", es: "profesor/a" },
  { key: "gakusei", kana: "がくせい", es: "estudiante" },
  { key: "いしゃ", kana: "いしゃ", es: "médico/a" },
  { key: "かんごし", kana: "かんごし", es: "enfermero/a" },
  { key: "けいさつかん", kana: "けいさつかん", es: "policía" },
  { key: "りょうりにん", kana: "りょうりにん", es: "cocinero/a" },
  { key: "うんてんしゅ", kana: "うんてんしゅ", es: "conductor/a" },
  { key: "エンジニア", kana: "エンジニア", es: "ingeniero/a" },
];

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

function ja(t: string) {
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}

export default function B3_Profesiones_Roleplay() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mine, setMine] = useState<Choice | null>(null);
  const [other, setOther] = useState<Choice | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  const advance = (to: 1 | 2 | 3 | 4) => {
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start(() => {
      setStep(to);
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.in(Easing.quad) }).start();
    });
  };

  useMemo(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={s.header}>
          <Text style={s.kicker}>Roleplay</Text>
          <Text style={s.title}>しごと を 紹介しよう — ¡Presenta tu profesión!</Text>
          <Text style={s.jpSub}>Practica frases cortas con です／ではありません + pregunta しごと は なん ですか。</Text>
        </View>

        <Animated.View style={{ opacity: fade }}>
          {step === 1 && (
            <View style={s.card}>
              <Text style={s.h2}>Paso 1 — Saludo y pregunta</Text>
              <Text style={s.p}>Pulsa para escuchar y repite en voz alta.</Text>
              <Line ja="はじめまして。わたし は レスリー です。" es="Mucho gusto. Soy Leslie." />
              <Line ja="しごと は なん ですか。" es="¿A qué te dedicas?" />
              <View style={s.actions}>
                <PrimaryBtn label="Elegir mi profesión" icon="briefcase-outline" onPress={() => advance(2)} />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={s.card}>
              <Text style={s.h2}>Paso 2 — Elige tu profesión</Text>
              <Text style={s.p}>Selecciona una opción y repite la frase.</Text>
              <View style={s.grid}>
                {CHOICES.map((c) => (
                  <Chip
                    key={c.key}
                    label={`${c.kana}（${c.es}）`}
                    selected={mine?.key === c.key}
                    onPress={() => {
                      setMine(c);
                      ja(`わたし は ${c.kana} です。`);
                    }}
                  />
                ))}
              </View>
              {mine ? (
                <View style={s.quote}>
                  <Text style={s.qja}>わたし は {mine.kana} です。</Text>
                  <Text style={s.qes}>“Yo soy {mine.es}.”</Text>
                </View>
              ) : null}
              <View style={s.actions}>
                <PrimaryBtn label="Continuar" icon="chevron-forward" onPress={() => advance(3)} disabled={!mine} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={s.card}>
              <Text style={s.h2}>Paso 3 — Responder la otra persona</Text>
              <Text style={s.p}>Elige la profesión de la otra persona y escucha su respuesta.</Text>
              <View style={s.grid}>
                {CHOICES.map((c) => (
                  <Chip
                    key={c.key + "_other"}
                    label={`${c.kana}（${c.es}）`}
                    selected={other?.key === c.key}
                    onPress={() => {
                      setOther(c);
                      ja(`わたし は ${c.kana} です。あなた は？`);
                    }}
                  />
                ))}
              </View>
              {other ? (
                <View style={s.quote}>
                  <Text style={s.qja}>わたし は {other.kana} です。あなた は？</Text>
                  <Text style={s.qes}>“Yo soy {other.es}. ¿Y tú?”</Text>
                </View>
              ) : null}
              <View style={s.actions}>
                <PrimaryBtn label="Práctica negativa" icon="remove-circle-outline" onPress={() => advance(4)} disabled={!other} />
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={s.card}>
              <Text style={s.h2}>Paso 4 — Forma negativa cortés</Text>
              <Text style={s.p}>
                Di lo que **no** eres con <Text style={s.kbd}>では ありません</Text>.
              </Text>

              <View style={{ gap: 8, marginTop: 6 }}>
                {mine && (
                  <PracticeLine
                    ja={`わたし は ${mine.kana} では ありません。`}
                    es={`Yo no soy ${mine.es}.`}
                  />
                )}
                {other && (
                  <PracticeLine
                    ja={`${other.kana} は せんせい では ありません。`}
                    es={`(Él/Ella) no es profesor/a.`}
                  />
                )}
              </View>

              <View style={s.actions}>
                <PrimaryBtn label="Repetir roleplay" icon="refresh" onPress={() => { setMine(null); setOther(null); advance(1); }} />
              </View>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Line({ ja: j, es }: { ja: string; es: string }) {
  return (
    <View style={s.lineRow}>
      <Text style={s.lineJA}>{j}</Text>
      <Pressable onPress={() => ja(j)} style={s.iconBtn}><Ionicons name="volume-high-outline" size={18} color={CRIMSON} /></Pressable>
      <Text style={s.lineES}>{es}</Text>
    </View>
  );
}

function PracticeLine({ ja: j, es }: { ja: string; es: string }) {
  return (
    <View style={s.practice}>
      <Text style={s.qja}>{j}</Text>
      <Text style={s.qes}>{es}</Text>
      <Pressable onPress={() => ja(j)} style={s.iconBtn}><Ionicons name="volume-high-outline" size={18} color={CRIMSON} /></Pressable>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void; }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && s.chipSel]}>
      <Text style={[s.chipTxt, selected && s.chipTxtSel]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryBtn({ label, icon, onPress, disabled }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean; }) {
  return (
    <Pressable onPress={!disabled ? onPress : undefined} style={[s.primary, disabled && { opacity: 0.5 }]}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={s.primaryTxt}>{label}</Text>
    </Pressable>
  );
}

/* ====== Estilos ====== */
const s = StyleSheet.create({
  header: {
    backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", padding: 16, marginTop: 12 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  chipSel: { backgroundColor: "#fff5f6", borderColor: "#f2c9cf" },
  chipTxt: { color: INK, fontWeight: "700" },
  chipTxtSel: { color: CRIMSON },

  lineRow: { gap: 6, marginTop: 8 },
  lineJA: { color: INK },
  lineES: { color: "#6B7280", marginTop: 2 },

  practice: { marginTop: 8, gap: 4, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  qja: { fontWeight: "900", color: INK },
  qes: { color: "#6B7280" },

  actions: { marginTop: 12, flexDirection: "row", gap: 10 },
  primary: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: CRIMSON },
  primaryTxt: { color: "#fff", fontWeight: "900" },

  iconBtn: { marginTop: 6, padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf", alignSelf: "flex-start" },
});
