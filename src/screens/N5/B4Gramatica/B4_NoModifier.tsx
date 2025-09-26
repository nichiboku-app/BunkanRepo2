import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
// Hook global (tu ruta)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ============ Tipos y datos (solo KANA) ============ */
type Choice = { key: "no" | "wa" | "ni"; jp: string; es: string };
const CHOICES: Choice[] = [
  { key: "no", jp: "の", es: "de (N1 de N2)" },
  { key: "wa", jp: "は", es: "tema" },
  { key: "ni", jp: "に", es: "a / en (lugar/tiempo)" },
];
const CMAP = Object.fromEntries(CHOICES.map(c => [c.key, c])) as Record<Choice["key"], Choice>;

type GapItem = {
  ja: string;    // oración con ___
  es: string;    // traducción sencilla
  answer: Choice["key"];
  explain: string; // explicación tipo primaria
};

// ⚠️ SIN rōmaji, SIN kanji.
const BANK: GapItem[] = [
  // Posesión / pertenencia
  { ja: "これは わたし ___ ほん です。", es: "Esto es mi libro.", answer: "no",
    explain: "“de” → わたし の ほん = libro DE mí → mi libro." },
  { ja: "それ は フアン ___ でんわ です。", es: "Eso es el teléfono de フアン.", answer: "no",
    explain: "Nombre + の + cosa: “teléfono DE Juan”." },
  { ja: "これは がくせい ___ かばん です。", es: "Esto es la bolsa del estudiante.", answer: "no",
    explain: "Persona/grupo + の + objeto." },

  // Origen / categoría / país
  { ja: "あれ は にほん ___ アニメ です。", es: "Aquello es anime de Japón.", answer: "no",
    explain: "País + の + cosa: “anime DE Japón”." },
  { ja: "これは りんご ___ ジュース です。", es: "Esto es jugo de manzana.", answer: "no",
    explain: "Ingrediente + の + producto: “jugo DE manzana”." },
  { ja: "それ は プラスチック ___ コップ です。", es: "Eso es un vaso de plástico.", answer: "no",
    explain: "Material + の + objeto." },

  // Parte / lugar-relación
  { ja: "あれ は きょうしつ ___ ドア です。", es: "Aquello es la puerta del salón.", answer: "no",
    explain: "Lugar + の + parte: “puerta DEL salón”." },
  { ja: "ここ は がっこう ___ しょくどう です。", es: "Aquí es el comedor de la escuela.", answer: "no",
    explain: "Lugar grande + の + lugar dentro: “comedor DE la escuela”." },
  { ja: "そこ は えき ___ まえ です。", es: "Ahí es frente de la estación.", answer: "no",
    explain: "Sitio + の + まえ（frente）: “frente DE la estación”." },

  // Distractores para pensar (no = は / に)
  { ja: "ここ ___ きっさてん です。", es: "Aquí es una cafetería.", answer: "wa",
    explain: "Tema de la oración: ここ は（no の）." },
  { ja: "あした えき ___ いきます。", es: "Mañana voy a la estación.", answer: "ni",
    explain: "Destino se marca con に（no の）." },
  { ja: "これは せんせい ___ つくえ です。", es: "Esto es el escritorio del profesor.", answer: "no",
    explain: "Persona + の + objeto: “escritorio DEL profesor”." },
];

/** ============ Utilidades ============ */
function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.98 });
}
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** ============ Screen ============ */
export default function B4_NoModifier() {
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
    if (ok) { setScore((s) => s + 1); Vibration.vibrate(10); playCorrect().catch(()=>{}); }
    else { Vibration.vibrate([0,25,35,25]); playWrong().catch(()=>{}); }
  };

  const next = () => {
    if (i + 1 >= deck.length) { setI(0); setPicked(null); setScore(0); return; }
    setI((v) => v + 1);
    setPicked(null);
  };

  const pronounceCorrect = () => {
    const tail = CMAP[item.answer].jp;
    speakJA(item.ja.replace("___", tail));
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <BubbleRise count={9} />
      <ScrollView contentContainerStyle={s.c}>

        {/* Header distinto: franja celeste, icono grande */}
        <View style={s.headerAlt}>
          <View style={s.iconHero}><Ionicons name="link-outline" size={22} color="#0369A1" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
            <Text style={s.title}>N1 の N2 — 「の」 para unir</Text>
            <Text style={s.jpSub}>“de” en español: わたし の ほん = “libro DE mí” → mi libro</Text>
          </View>
          <Chip label="N5" />
        </View>

        {/* Guía estilo “dashed” */}
        <View style={s.cardDashed}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• <Text style={s.bold}>の</Text> es como la palabra <Text style={s.bold}>“de”</Text>.</Text>
          <Text style={s.p}>• Decimos: <Text style={s.kbd}>N1 の N2</Text> = “N2 DE N1”.</Text>
          <Text style={s.p}>• Orden: <Text style={s.bold}>primero</Text> quién/qué, <Text style={s.bold}>luego</Text> la cosa.</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "これは わたし の ほん です。", es: "Esto es mi libro." },
              { ja: "それ は にほん の アニメ です。", es: "Eso es anime de Japón." },
              { ja: "あれ は きょうしつ の ドア です。", es: "Aquello es la puerta del salón." },
            ].map((e, idx) => (
              <View key={idx}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={s.line}>{e.ja}</Text>
                  <IconBtn onPress={() => speakJA(e.ja)} />
                </View>
                {showES && <Text style={s.es}>{e.es}</Text>}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <ToggleBtn icon="globe-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v=>!v)} />
          </View>
        </View>

        {/* Truco y Cuidado */}
        <View style={[s.card, { backgroundColor: "#ECFEFF" }]}>
          <Text style={s.h2}>Truco ✨</Text>
          <Text style={s.p}>Si en español dices “de…”, en japonés pon <Text style={s.bold}>の</Text>.</Text>
          <Text style={s.p}>わたし <Text style={s.kbd}>の</Text> かぞく（familia DE mí）／ りんご <Text style={s.kbd}>の</Text> ジュース（jugo DE manzana）</Text>
        </View>

        <View style={[s.card, { backgroundColor: "#F0FDFA" }]}>
          <Text style={s.h2}>Cuidado 🧩</Text>
          <Text style={s.p}>No confundas <Text style={s.bold}>の</Text> con <Text style={s.bold}>は</Text>（tema） ni con <Text style={s.bold}>に</Text>（destino/tiempo）.</Text>
          <Text style={s.p}>Puedes encadenar: <Text style={s.kbd}>N1 の N2 の N3</Text>（hoy no lo usamos en el quiz）.</Text>
        </View>

        {/* Quiz: elige の / は / に */}
        <View style={[s.card, { backgroundColor: "#E0F7FF" }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Pon la mejor opción</Text>
            <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.bigLine}>{item.ja}</Text>
              <IconBtn onPress={pronounceCorrect} />
            </View>
            {showES && <Text style={s.es}>{item.es}</Text>}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {CHOICES.map((c) => {
              const chosen = picked != null;
              const isPicked = picked === c.key;
              const isRight = chosen && c.key === item.answer;
              const bg = !chosen ? "#075985" : isRight ? "#059669" : isPicked ? "#DC2626" : "#64748B";
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

          {/* Explicación al responder */}
          {picked && (
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626", backgroundColor: "#F8FDFF" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={picked === item.answer ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={picked === item.answer ? "#059669" : "#DC2626"}
                />
                <Text style={[s.h2, { color: picked === item.answer ? "#065F46" : "#7F1D1D" }]}>
                  {picked === item.answer ? "¡Muy bien!" : "Casi, casi…"}
                </Text>
              </View>
              <Text style={s.p}><Text style={s.bold}>Por qué: </Text>{item.explain}</Text>
              <Text style={[s.p, { marginTop: 6 }]}>
                <Text style={s.bold}>Recuerda:</Text> N1 <Text style={s.kbd}>の</Text> N2 = “N2 DE N1”. ここ <Text style={s.kbd}>は</Text>…（tema）／ えき <Text style={s.kbd}>に</Text> いきます（destino）.
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

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/** ============ UI helpers y decoración distinta (Burbujas) ============ */
function ToggleBtn({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={ACCENT_DARK} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}
function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={ACCENT_DARK} />
    </Pressable>
  );
}
function Chip({ label }: { label: string }) {
  return (
    <View style={s.chip}><Text style={s.chipTxt}>{label}</Text></View>
  );
}

/** Pequeña animación “BubbleRise” en vez de Sakura */
function BubbleRise({ count = 9 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const bubbles = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const size = 8 + Math.round(Math.random() * 16);
    const x = Math.round(Math.random() * (width - size));
    const delay = Math.round(Math.random() * 2000);
    const duration = 5000 + Math.round(Math.random() * 2500);
    const swayAmp = 8 + Math.random() * 8;
    return { id: i, size, x, delay, duration, swayAmp };
  }), [count, width]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bubbles.map(b => (<Bubble key={b.id} {...b} H={height} />))}
    </View>
  );
}
function Bubble({ size, x, delay, duration, swayAmp, H }:{
  size: number; x: number; delay: number; duration: number; swayAmp: number; H: number;
}) {
  const y = useRef(new Animated.Value(H + size + 20)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const rise = () => {
      if (!alive) return;
      y.setValue(H + size + 20);
      Animated.timing(y, { toValue: -size - 20, duration, easing: Easing.linear, useNativeDriver: true })
        .start(() => { if (!alive) return; setTimeout(rise, Math.random() * 800); });
    };
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const start = setTimeout(() => { rise(); swayLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, size, sway, y]);
  const translateX = Animated.add(new Animated.Value(x),
    sway.interpolate({ inputRange: [0, 1], outputRange: [-swayAmp, swayAmp] })
  );
  return (
    <Animated.View
      style={[s.bubble, {
        width: size, height: size, borderRadius: size,
        transform: [{ translateX }, { translateY: y }]
      }]}
    />
  );
}

/** ============ Estilos (paleta celeste) ============ */
const PAPER = "#F0F9FF";       // sky-50
const INK = "#082F49";         // cyan-950
const ACCENT = "#0EA5E9";      // sky-500
const ACCENT_DARK = "#0369A1"; // sky-700
const BORDER = "#BAE6FD";      // sky-200

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },

  headerAlt: {
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#E0F2FE", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: BORDER
  },
  iconHero: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "#F0FDFF", borderWidth: 1, borderColor: "#A5F3FC"
  },
  kicker: { color: ACCENT_DARK, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: INK },
  jpSub: { color: "#0C4A6E", marginTop: 2 },

  cardDashed: {
    backgroundColor: "#ECFEFF", borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: BORDER, borderStyle: "dashed"
  },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: BORDER
  },

  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#0C4A6E", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK, backgroundColor: "#E0F2FE", paddingHorizontal: 6, borderRadius: 6 },

  line: { color: INK, marginLeft: 6 },
  bigLine: { color: INK, marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#075985", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#0C4A6E", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  chip: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#F0FDFA", borderRadius: 999, borderWidth: 1, borderColor: "#99F6E4" },
  chipTxt: { fontSize: 12, fontWeight: "800", color: INK },

  bubble: { position: "absolute", bottom: -30, left: 0, backgroundColor: "#A5F3FC", opacity: 0.5 },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: BORDER },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#ECFEFF", borderWidth: 1, borderColor: BORDER },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF" },
  outlineTxt: { color: ACCENT_DARK, fontWeight: "900" },
});
