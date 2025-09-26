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
// Hook global (ruta que usas)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ============ Tipos y datos (solo KANA) ============ */
type Choice = { key: "wa" | "ga"; jp: "は" | "が"; es: string };
const CHOICES: Choice[] = [
  { key: "wa", jp: "は", es: "tema (de qué hablamos)" },
  { key: "ga", jp: "が", es: "sujeto (nuevo/enfoque)" },
];
const CMAP = Object.fromEntries(CHOICES.map(c => [c.key, c])) as Record<Choice["key"], Choice>;

type GapItem = {
  ja: string;     // oración con ___ para は／が
  es: string;     // traducción simple
  answer: Choice["key"];
  explain: string; // explicación muy simple (modo primaria)
};

// ⚠️ SIN rōmaji, SIN kanji. Reglas claras para evitar ambigüedad.
const BANK: GapItem[] = [
  // Tema claro → は
  { ja: "わたし ___ がくせい です。", es: "Yo soy estudiante.", answer: "wa",
    explain: "Hablamos de “yo” como tema → は." },
  { ja: "あの ひと ___ たなかさん です。", es: "Esa persona es たなかさん.", answer: "wa",
    explain: "Identificamos a esa persona: tema → は." },
  { ja: "この ほん ___ わたし の です。", es: "Este libro (en cuanto a eso) es mío.", answer: "wa",
    explain: "Marcamos el objeto como tema → は." },
  { ja: "にちようび ___ やすみ です。", es: "El domingo (en cuanto a ese día) es descanso.", answer: "wa",
    explain: "Ponemos tema “domingo” → は." },

  // Nuevo / existe / pregunta “quién/qué” → が
  { ja: "いぬ ___ います。", es: "Hay un perro.", answer: "ga",
    explain: "Existencia: “aparece” algo → が." },
  { ja: "ここ に ほん ___ あります。", es: "Aquí hay un libro.", answer: "ga",
    explain: "Existencia (cosas) → が." },
  { ja: "にほんご ___ すき です。", es: "Me gusta el japonés.", answer: "ga",
    explain: "Con すき/きらい decimos “X が すき” → が." },
  { ja: "おんがく ___ すき です。", es: "Me gusta la música.", answer: "ga",
    explain: "Gusto/preferencia → “X が すき”." },

  // Palabras de pregunta → が
  { ja: "だれ ___ せんせい ですか。", es: "¿Quién es la/el maestra/o?", answer: "ga",
    explain: "Con だれ/なに/どれ… va が." },
  { ja: "なに ___ すき ですか。", es: "¿Qué te gusta?", answer: "ga",
    explain: "“¿qué?” + が すき ですか." },

  // Contraste sencillo (tema) → は
  { ja: "りんご ___ すき です。", es: "Las manzanas (en cuanto a eso) me gustan.", answer: "wa",
    explain: "Contraste/tema (hablamos de manzanas) → は." },
  { ja: "わたし ___ せんせい じゃありません。", es: "Yo no soy maestro/a.", answer: "wa",
    explain: "Tema “yo” + 〜じゃありません → は." },
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
export default function B4_WaGa() {
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
      <ConfettiDrift count={14} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header con estilo distinto (menta + bordes diagonales) */}
        <View style={s.headerMint}>
          <View style={s.heroIcon}>
            <Ionicons name="contrast-outline" size={22} color={MINT_DARK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
            <Text style={s.title}>は・が — テーマ と しゅじんこう</Text>
            <Text style={s.jpSub}>は = てーま（話の だいめい）／ が = しゅじんこう（新しい・だれ/なに）</Text>
          </View>
          <Pill label="N5" />
        </View>

        {/* Explicación modo primaria */}
        <View style={s.cardRidge}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• <Text style={s.bold}>は</Text> = “de qué hablamos”. Como poner una etiqueta al tema.</Text>
          <Text style={s.p}>• <Text style={s.bold}>が</Text> = “quién/qué aparece” o “lo nuevo/importante”.</Text>
          <Text style={s.p}>• Con <Text style={s.bold}>すき・きらい</Text> y con <Text style={s.bold}>だれ／なに</Text> usamos <Text style={s.bold}>が</Text>.</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "わたし は がくせい です。", es: "Yo (tema) soy estudiante." },
              { ja: "いぬ が います。", es: "Hay un perro. (aparece → が)" },
              { ja: "にほんご が すき です。", es: "Me gusta el japonés. (X が すき)" },
              { ja: "だれ が せんせい ですか。", es: "¿Quién es la/el maestra/o? (pregunta → が)" },
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

        {/* Truco y Cuidado con formato diferente */}
        <View style={[s.card, { backgroundColor: "#ECFDF5" }]}>
          <Text style={s.h2}>Truco ✨</Text>
          <Text style={s.p}>Si presentas el <Text style={s.bold}>tema</Text> → usa <Text style={s.bold}>は</Text>. Si dices que “<Text style={s.bold}>hay</Text>” o “<Text style={s.bold}>quién/qué</Text>” → usa <Text style={s.bold}>が</Text>.</Text>
        </View>

        <View style={[s.card, { backgroundColor: "#F0FDFA" }]}>
          <Text style={s.h2}>Cuidado 🧩</Text>
          <Text style={s.p}>Evita oraciones ambiguas en este nivel. Usa ejemplos con regla clara.</Text>
          <Text style={s.p}>Con 〜は すき です también existe, pero hoy practicamos el patrón claro <Text style={s.bold}>X が すき</Text>.</Text>
        </View>

        {/* Quiz: elige は / が */}
        <View style={[s.card, { backgroundColor: "#F7FEE7" }]}>
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
              const bg = !chosen ? "#0F766E" : isRight ? "#059669" : isPicked ? "#DC2626" : "#64748B";
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
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626", backgroundColor: "#F8FFFB" }]}>
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
                <Text style={s.bold}>Recuerda:</Text> は = tema ／ が = sujeto nuevo・“hay”・“quién/qué”.
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

/** ============ UI helpers / Estética distinta (Confeti menta) ============ */
function ToggleBtn({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={MINT_DARK} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}
function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={MINT_DARK} />
    </Pressable>
  );
}
function Pill({ label }: { label: string }) {
  return (<View style={s.pill}><Text style={s.pillTxt}>{label}</Text></View>);
}

/** Confeti que cae en diagonal (diferente a sakura/burbujas) */
function ConfettiDrift({ count = 14 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
      const size = 6 + Math.round(Math.random() * 10);
      const x = Math.round(Math.random() * (width - size));
      const delay = Math.round(Math.random() * 2000);
      const duration = 5000 + Math.round(Math.random() * 2500);
      const rotStart = Math.random() * 360;
      const swayAmp = 6 + Math.random() * 6;
      const colorPick = i % 3;
      return { id: i, size, x, delay, duration, rotStart, swayAmp, colorPick };
    }), [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map(p => (<Confetti key={p.id} {...p} H={height} />))}
    </View>
  );
}
function Confetti({ size, x, delay, duration, rotStart, swayAmp, colorPick, H }:{
  size: number; x: number; delay: number; duration: number; rotStart: number; swayAmp: number; colorPick: number; H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true })
        .start(() => { if (!alive) return; setTimeout(fall, Math.random() * 900); });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const start = setTimeout(() => { fall(); rotLoop.start(); swayLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-swayAmp, swayAmp] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });
  const bg = colorPick === 0 ? "#BBF7D0" : colorPick === 1 ? "#A7F3D0" : "#DCFCE7";
  return (
    <Animated.View
      style={[s.confetti, {
        width: size, height: size * 1.2, backgroundColor: bg,
        transform: [{ translateX }, { translateY: y }, { rotate }]
      }]}
    />
  );
}

/** ============ Estilos (paleta menta) ============ */
const PAPER = "#F0FDF4";       // green-50
const INK = "#052E1B";         // green-950
const MINT = "#34D399";        // green-400
const MINT_DARK = "#047857";   // green-700
const BORDER = "#BBF7D0";      // green-200

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },

  headerMint: {
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#ECFDF5", borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: BORDER
  },
  heroIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#D1FAE5"
  },
  kicker: { color: MINT_DARK, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: INK },
  jpSub: { color: "#065F46", marginTop: 2 },

  cardRidge: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: BORDER, borderStyle: "dashed"
  },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: BORDER
  },

  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#065F46", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },

  line: { color: INK, marginLeft: 6 },
  bigLine: { color: INK, marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#065F46", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#065F46", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 },

  primaryBtn: { backgroundColor: MINT, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  pill: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#F0FDF4", borderRadius: 999, borderWidth: 1, borderColor: "#A7F3D0" },
  pillTxt: { fontSize: 12, fontWeight: "800", color: INK },

  confetti: { position: "absolute", top: -30, left: 0, borderRadius: 3, opacity: 0.7 },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: BORDER },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF" },
  outlineTxt: { color: MINT_DARK, fontWeight: "900" },
});
