// src/screens/N5/B6Hotel/B6_Hotel.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* =============== TTS helper =============== */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    });
  } catch {}
}

/* =============== Fondo bonito =============== */
function PrettyBG() {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(a1, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a1, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(a2, { toValue: 1, duration: 7200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a2, { toValue: 0, duration: 7200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop1.start(); loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, [a1, a2]);

  const f1 = {
    transform: [
      { translateY: a1.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
      { translateX: a1.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
      { rotate: a1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "3deg"] }) },
    ],
  };
  const f2 = {
    transform: [
      { translateY: a2.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) },
      { translateX: a2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
      { rotate: a2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-3deg"] }) },
    ],
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Usa tu imagen de fondo si la tienes en esta ruta; si no, cambia la ruta o quita el ImageBackground */}
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.92 }}
      >
        <Animated.Text style={[styles.bgEmoji, { top: 36, left: 18 }, f1]}>🏨</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { top: 110, right: 26 }, f2]}>🛏️</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { bottom: 90, left: 28 }, f2]}>🧳</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { bottom: 36, right: 24 }, f1]}>🛁</Animated.Text>
      </ImageBackground>
    </View>
  );
}

/* =============== UI pequeños =============== */
function Phrase({ jp, es }: { jp: string; es: string }) {
  return (
    <View style={styles.phraseRow}>
      <Text style={styles.jp}>{jp}</Text>
      <Pressable onPress={() => speakJP(jp)} style={styles.speakChip} accessibilityLabel="Escuchar frase">
        <Ionicons name="volume-high-outline" size={16} color="#3b2f2f" />
      </Pressable>
      <Text style={styles.es}>/ {es}</Text>
    </View>
  );
}

function StepCard({
  title,
  tips,
}: {
  title: string;
  tips: Array<{ jp: string; es: string }>;
}) {
  return (
    <View style={s.box}>
      <Text style={s.b}>{title}</Text>
      {tips.map((t, i) => (
        <Phrase key={i} jp={t.jp} es={t.es} />
      ))}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSel]}>
      <Text style={[styles.chipTxt, selected && styles.chipTxtSel]}>{label}</Text>
    </Pressable>
  );
}

/* =============== Datos: pasos =============== */
// 1) Buscar y elegir
const STEP1 = [
  { jp: "えき の ちかく の ホテル を さがして います。", es: "Estoy buscando un hotel cerca de la estación." },
  { jp: "ひとばん いくら ですか。", es: "¿Cuánto cuesta por noche?" },
  { jp: "ちょうしょく つき ですか。", es: "¿Incluye desayuno?" },
  { jp: "きんえん ルーム は ありますか。", es: "¿Hay cuarto para no fumar?" },
];
// 2) Reservar (teléfono/online)
const STEP2 = [
  { jp: "よやく を おねがい します。", es: "Quisiera hacer una reserva." },
  { jp: "○ はく、○ めい です。", es: "Son ○ noches, ○ personas." },
  { jp: "しんぐる／ついん／だぶる で おねがい します。", es: "Single/Twin/Double, por favor." },
  { jp: "なまえ は 〜 です。", es: "Mi nombre es ~." },
  { jp: "でんわばんごう は 〜 です。", es: "Mi número es ~." },
  { jp: "めーる あどれす は 〜 です。", es: "Mi correo es ~." },
];
// 3) Llegada / check-in
const STEP3 = [
  { jp: "よやく して います。", es: "Tengo una reserva." },
  { jp: "ちぇっくいん を おねがい します。", es: "Quisiera hacer check-in." },
  { jp: "ぱすぽーと を おみせ します。", es: "Le muestro el pasaporte." },
  { jp: "しはらい は カード で おねがい します。", es: "Pago con tarjeta, por favor." },
  { jp: "にほんご が にがて です。ゆっくり おねがい します。", es: "No hablo mucho japonés; despacio, por favor." },
];
// 4) Durante la estancia
const STEP4 = [
  { jp: "Wi-Fi は ありますか。", es: "¿Hay Wi-Fi?" },
  { jp: "Wi-Fi の ぱすわーど は なん ですか。", es: "¿Cuál es la contraseña de Wi-Fi?" },
  { jp: "たおる を かえて ください。", es: "Por favor cambien las toallas." },
  { jp: "そうじ は けっこう です。", es: "No necesito limpieza (hoy)." },
  { jp: "でんき が つきません。", es: "La luz no enciende." },
  { jp: "くうちょう を おねがい します。", es: "¿Me ayuda con el aire acondicionado?" },
];
// 5) Check-out
const STEP5 = [
  { jp: "ちぇっくあうと を おねがい します。", es: "Quisiera hacer check-out." },
  { jp: "りょうしゅうしょ を ください。", es: "Un recibo, por favor." },
  { jp: "てにもつ を あずけて も いい ですか。", es: "¿Puedo dejar mi equipaje (después del check-out)?" },
  { jp: "れいと ちぇっくあうと は できますか。", es: "¿Puedo hacer late check-out?" },
  { jp: "しはらい は げんきん で。", es: "Pago en efectivo." },
];

/* =============== Glosario útil (con audio) =============== */
const GLOSARIO = [
  { jp: "しんぐる", es: "cuarto con una cama (single)" },
  { jp: "だぶる", es: "cama doble (double)" },
  { jp: "ついん", es: "dos camas (twin)" },
  { jp: "きんえん", es: "no fumar" },
  { jp: "きつえん", es: "fumar" },
  { jp: "ちょうしょく つき", es: "con desayuno" },
  { jp: "ちょうしょく なし", es: "sin desayuno" },
  { jp: "いっぱく", es: "una noche (contador de noches)" },
  { jp: "〜 はく", es: "~ noches" },
  { jp: "〜 めい", es: "~ personas" },
];

/* =============== Constructor de frase (interactivo) =============== */
const TYPES = ["しんぐる", "ついん", "だぶる"] as const;
type TypeKey = typeof TYPES[number];

export default function B6_Hotel() {
  // constructor
  const [nights, setNights] = useState(2);
  const [people, setPeople] = useState(2);
  const [type, setType] = useState<TypeKey>("ついん");
  const [nonSmoke, setNonSmoke] = useState(true);

  const sentence =
    (nonSmoke ? "きんえん の " : "") +
    type +
    " を おねがい します。 " +
    nights +
    " はく、" +
    people +
    " めい です。";

useEffect(() => {
  return () => {
    void Speech.stop(); // <- descarta el Promise para que el cleanup sea void
  };
}, []);

  return (
    <View style={{ flex: 1 }}>
      <PrettyBG />
      <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>🏨 Hotel</Text>
          <Text style={s.h}>Paso a paso para rentar una habitación</Text>
          <Text style={s.sub}>Frases en hiragana/katakana + audio para cada etapa.</Text>
        </View>

        {/* Paso 1: Buscar */}
        <StepCard title="1) さがす（Buscar y elegir）" tips={STEP1} />
        {/* Paso 2: Reservar */}
        <StepCard title="2) よやく（Hacer la reserva）" tips={STEP2} />
        {/* Constructor de frase */}
        <View style={s.box}>
          <Text style={s.b}>Arma tu frase de reserva（よやく の ぶん）</Text>

          <Text style={styles.hint}>Tipo de cuarto</Text>
          <View style={styles.row}>
            {TYPES.map((t) => (
              <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} />
            ))}
          </View>

          <Text style={styles.hint}>¿No fumar?</Text>
          <View style={styles.row}>
            <Chip label="きんえん（no fumar）" selected={nonSmoke} onPress={() => setNonSmoke(true)} />
            <Chip label="きつえん（fumar）" selected={!nonSmoke} onPress={() => setNonSmoke(false)} />
          </View>

          <Text style={styles.hint}>Noches（はく）</Text>
          <View style={styles.row}>
            {[1,2,3,4,5,6].map((n) => (
              <Chip key={n} label={String(n)} selected={nights === n} onPress={() => setNights(n)} />
            ))}
          </View>

          <Text style={styles.hint}>Personas（めい）</Text>
          <View style={styles.row}>
            {[1,2,3,4].map((m) => (
              <Chip key={m} label={String(m)} selected={people === m} onPress={() => setPeople(m)} />
            ))}
          </View>

          <View style={styles.sentenceBox}>
            <Text style={styles.sentenceJP}>{sentence}</Text>
            <Pressable onPress={() => speakJP(sentence)} style={styles.speakBtn} accessibilityLabel="Escuchar frase armada">
              <Ionicons name="volume-high-outline" size={18} color="#3b2f2f" />
            </Pressable>
          </View>

          <Text style={styles.sentenceES}>
            Español: {nonSmoke ? "Habitación de no fumar, " : "Habitación de fumar, "}
            {type === "しんぐる" ? "single" : type === "ついん" ? "twin (dos camas)" : "double"}; {nights} noche(s), {people} persona(s).
          </Text>
        </View>

        {/* Paso 3: Check-in */}
        <StepCard title="3) ちぇっくいん（Llegada y check-in）" tips={STEP3} />
        {/* Paso 4: Durante */}
        <StepCard title="4) とまって いる あいだ（Durante la estancia）" tips={STEP4} />
        {/* Paso 5: Check-out */}
        <StepCard title="5) ちぇっくあうと（Salida）" tips={STEP5} />

        {/* Glosario */}
        <View style={s.box}>
          <Text style={s.b}>Palabras útiles（ことば）</Text>
          {GLOSARIO.map((g, i) => (
            <View key={i} style={styles.glRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.jpStrong}>{g.jp}</Text>
                <Pressable onPress={() => speakJP(g.jp)} style={styles.speakChip} accessibilityLabel="Escuchar palabra">
                  <Ionicons name="volume-high-outline" size={14} color="#3b2f2f" />
                </Pressable>
              </View>
              <Text style={styles.es}>{g.es}</Text>
            </View>
          ))}
          <Text style={styles.tipLine}>
            ⏰ Tip: horas comunes — check-in 15:00 / check-out 10:00〜11:00（varía por hotel）.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* =============== Estilos =============== */
const WASHI = "rgba(255,255,255,0.94)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },
  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },

  box: {
    backgroundColor: "rgba(255,251,240,0.96)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  b: { fontWeight: "900", fontSize: 18, color: INK },
});

const styles = StyleSheet.create({
  bgEmoji: { position: "absolute", fontSize: 42 },

  phraseRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  jpStrong: { fontSize: 16, fontWeight: "900", color: INK },
  es: { fontSize: 14, opacity: 0.95, color: INK },
  speakChip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.97)",
  },

  chip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "white",
    marginRight: 8, marginBottom: 8,
  },
  chipSel: { backgroundColor: "rgba(92,184,92,0.10)", borderColor: "#5cb85c" },
  chipTxt: { fontWeight: "800", color: INK },
  chipTxtSel: { color: INK },

  row: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },

  hint: { fontSize: 13, color: INK, opacity: 0.85, marginTop: 6 },

  sentenceBox: {
    marginTop: 10, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.98)", flexDirection: "row", alignItems: "center", gap: 10,
  },
  sentenceJP: { fontSize: 16, fontWeight: "900", color: INK, flex: 1, flexWrap: "wrap" },
  sentenceES: { marginTop: 4, color: INK, opacity: 0.9 },

  speakBtn: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  glRow: { gap: 2, marginBottom: 6 },
  tipLine: { marginTop: 6, fontSize: 12, color: INK, opacity: 0.9 },
});
