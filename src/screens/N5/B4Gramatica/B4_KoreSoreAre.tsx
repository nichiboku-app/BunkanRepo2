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
// Hook global (ruta que usas en tu app)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ============ Tipos y datos (solo KANA, sin kanji/romaji) ============ */
type Demo = { key: "kore" | "sore" | "are"; jp: string; es: string };
const DEMOS: Demo[] = [
  { key: "kore", jp: "これ", es: "esto (cerca de mí)" },
  { key: "sore", jp: "それ", es: "eso (cerca de ti)" },
  { key: "are",  jp: "あれ", es: "aquello (lejos de los dos)" },
];
const DMAP = Object.fromEntries(DEMOS.map(d => [d.key, d])) as Record<Demo["key"], Demo>;

type GapItem = {
  ja: string;     // oración con ___ para これ／それ／あれ
  es: string;     // traducción simple
  answer: Demo["key"];
  explain: string; // explicación muy simple (modo primaria)
};

// ⚠️ SIN romaji, SIN kanji. Vocabulario N5 en kana/katakana.
const BANK: GapItem[] = [
  // “Esto / eso / aquello” con です・じゃありません・ですか
  { ja: "___ は ほん です。", es: "Esto es un libro.", answer: "kore",
    explain: "“esto (cerca de mí)” = これ。" },
  { ja: "___ は ぺん です。", es: "Eso es un ぼりぐらふぉ（ぺん）.", answer: "sore",
    explain: "“eso (cerca de ti)” = それ。" },
  { ja: "___ は えんぴつ です。", es: "Aquello es un lápiz.", answer: "are",
    explain: "“aquello (lejos de los dos)” = あれ。" },

  { ja: "___ は でんわ ですか。", es: "¿Esto es un teléfono?", answer: "kore",
    explain: "Pregunta sobre “esto” → これ + ですか。" },
  { ja: "___ は かばん じゃありません。", es: "Eso no es una bolsa.", answer: "sore",
    explain: "Negamos “eso” → それ + じゃありません。" },
  { ja: "___ は いす ですか。", es: "¿Aquello es una silla?", answer: "are",
    explain: "Pregunta sobre “aquello” → あれ + ですか。" },

  // Con lugares/espacios cercanos o lejanos en la escena
  { ja: "___ は つくえ です。", es: "Esto es un escritorio.", answer: "kore",
    explain: "Objeto junto a mí → これ。" },
  { ja: "___ は とけい です。", es: "Eso es un reloj.", answer: "sore",
    explain: "Objeto junto a ti → それ。" },
  { ja: "___ は テレビ です。", es: "Aquello es una tele.", answer: "are",
    explain: "Objeto lejos de los dos → あれ。" },

  // Un poco de contexto con “aquí/ahí/allá” (sin kanji)
  { ja: "（わたし の ちかく）___ は みず です。", es: "(Cerca de mí) Esto es agua.", answer: "kore",
    explain: "Cerca de mí → これ。" },
  { ja: "（あなた の ちかく）___ は りんご です。", es: "(Cerca de ti) Eso es una manzana.", answer: "sore",
    explain: "Cerca de ti → それ。" },
  { ja: "（とおい）___ は かさ です。", es: "(Lejos) Aquello es un paraguas.", answer: "are",
    explain: "Lejos de los dos → あれ。" },
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
function stripMeta(s: string) {
  // Quita etiquetas como （とおい） para la locución
  return s.replace(/（.*?）/g, "").trim();
}

/** ============ Screen ============ */
export default function B4_KoreSoreAre() {
  const [showES, setShowES] = useState(true);

  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Demo["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  const { playCorrect, playWrong } = useFeedbackSounds();

  const onPick = (k: Demo["key"]) => {
    if (picked) return;
    setPicked(k);
    const ok = k === item.answer;
    if (ok) { setScore((s) => s + 1); Vibration.vibrate(12); playCorrect().catch(()=>{}); }
    else { Vibration.vibrate([0,30,40,30]); playWrong().catch(()=>{}); }
  };

  const next = () => {
    if (i + 1 >= deck.length) { setI(0); setPicked(null); setScore(0); return; }
    setI((v) => v + 1);
    setPicked(null);
  };

  const pronounceCorrect = () => {
    const tail = DMAP[item.answer].jp;
    const text = stripMeta(item.ja).replace("___", tail);
    speakJA(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={12} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
          <Text style={s.title}>これ／それ／あれ — Demostrativos</Text>
          <Text style={s.jpSub}>これ = ここ（わたし の ちかく）／ それ = そこ（あなた の ちかく）／ あれ = あそこ（とおい）</Text>
          <View style={s.tagsRow}><Tag label="N5" /><Tag label="かんたん" /><Tag label="れんしゅう" /></View>
        </View>

        {/* Explicación modo primaria */}
        <View style={s.card}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• <Text style={s.bold}>これ</Text> = “<Text style={s.bold}>esto</Text>” (cerca de mí).</Text>
          <Text style={s.p}>• <Text style={s.bold}>それ</Text> = “<Text style={s.bold}>eso</Text>” (cerca de ti).</Text>
          <Text style={s.p}>• <Text style={s.bold}>あれ</Text> = “<Text style={s.bold}>aquello</Text>” (lejos de los dos).</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "これは ほん です。", es: "Esto es un libro." },
              { ja: "それ は ぺん です。", es: "Eso es un bolígrafo." },
              { ja: "あれ は テレビ です。", es: "Aquello es una tele." },
              { ja: "それ は かばん じゃありません。", es: "Eso no es una bolsa." },
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
        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.h2}>Truco ✨</Text>
          <Text style={s.p}>Mira la <Text style={s.bold}>distancia</Text>:</Text>
          <Text style={s.p}>— Junto a mí → これ</Text>
          <Text style={s.p}>— Junto a ti → それ</Text>
          <Text style={s.p}>— Lejos de los dos → あれ</Text>
        </View>

        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.h2}>Cuidado 🧩</Text>
          <Text style={s.p}>No mezcles con <Text style={s.bold}>ここ／そこ／あそこ</Text> (lugares). Aquí estudiamos <Text style={s.bold}>esto/eso/aquello</Text> (cosas).</Text>
          <Text style={s.p}>Para preguntar “¿cuál?”, existe <Text style={s.bold}>どれ</Text>（no lo usamos en el quiz de hoy）.</Text>
        </View>

        {/* Quiz: elige これ／それ／あれ */}
        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row, ", justifyContent: "space-between" }}>
            <Text style={s.h2}>Elige la palabra correcta</Text>
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
            {DEMOS.map((d) => {
              const chosen = picked != null;
              const isPicked = picked === d.key;
              const isRight = chosen && d.key === item.answer;
              const bg = !chosen ? "#111827" : isRight ? "#059669" : isPicked ? "#DC2626" : "#374151";
              return (
                <Pressable
                  key={d.key}
                  onPress={() => onPick(d.key)}
                  disabled={chosen}
                  style={[s.qbtn, { backgroundColor: bg }]}
                >
                  <Text style={s.qbtnJp}>{d.jp}</Text>
                  <Text style={s.qbtnEs}>{d.es}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Explicación al responder */}
          {picked && (
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626" }]}>
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
                <Text style={s.bold}>Recuerda:</Text> これ（cerca de mí）／ それ（cerca de ti）／ あれ（lejos）.
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

/** ============ UI helpers / Sakura ============ */
function ToggleBtn({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}
function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}
function Tag({ label }: { label: string }) {
  return (<View style={s.tag}><Text style={s.tagTxt}>{label}</Text></View>);
}

function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () => Array.from({ length: count }).map((_, i) => {
      const size = 8 + Math.round(Math.random() * 10);
      const x = Math.round(Math.random() * (width - size));
      const delay = Math.round(Math.random() * 2500);
      const rotStart = Math.random() * 360;
      const duration = 6000 + Math.round(Math.random() * 2000);
      return { id: i, size, x, delay, rotStart, duration };
    }), [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map(p => (<Petal key={p.id} {...p} H={height} />))}
    </View>
  );
}
function Petal({ size, x, delay, rotStart, duration, H }:{
  size: number; x: number; delay: number; rotStart: number; duration: number; H: number;
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
        .start(() => { if (!alive) return; setTimeout(fall, Math.random() * 1000); });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const start = setTimeout(() => { fall(); rotLoop.start(); swayLoop.start(); }, delay);
    return () => {
      alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation();
    };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });
  return (
    <Animated.View style={[s.petal, { width: size, height: size * 1.4, borderRadius: size,
      transform: [{ translateX }, { translateY: y }, { rotate }] }]} />
  );
}

/** ============ Estilos ============ */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: { backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8 },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 12, overflow: "hidden", padding: 16 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  bigLine: { color: INK, marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#6B7280", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#FFFCFC" },

  primaryBtn: { backgroundColor: CRIMSON, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});
