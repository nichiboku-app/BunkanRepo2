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

/** ============ Tipos y datos (solo KANA) ============ */
type Form = { key: "ja" | "dewa" | "desu" | "ka"; jp: string; es: string };
const FORMS: Form[] = [
  { key: "ja",   jp: "じゃありません", es: "no es (cortés)" },
  { key: "dewa", jp: "ではありません", es: "no es (muy formal)" },
  { key: "desu", jp: "です", es: "es" },
  { key: "ka",   jp: "ですか", es: "¿es?" },
];
const FMAP = Object.fromEntries(FORMS.map(f => [f.key, f])) as Record<Form["key"], Form>;

type GapItem = {
  ja: string;   // oración con ___
  es: string;   // traducción
  answer: Form["key"];
  explain: string; // explicación muy simple (modo primaria)
};

// ⚠️ SIN romaji, SIN kanji. Solo sustantivos y な-adjetivos en el quiz.
const BANK: GapItem[] = [
  // Conversación normal → じゃありません
  { ja: "これは ぺん ___ 。", es: "Esto no es un bolígrafo.", answer: "ja",
    explain: "Cuando decimos que NO es algo, en plática normal decimos じゃありません." },
  { ja: "それ は じしょ ___ 。", es: "Eso no es un diccionario.", answer: "ja",
    explain: "Negamos con じゃありません: “no es”." },
  { ja: "あれ は わたし の かばん ___ 。", es: "Aquello no es mi bolsa.", answer: "ja",
    explain: "También para pertenencia: “no es mío/a” = じゃありません." },

  // Más formal (letrero/anuncio) → ではありません
  { ja: "（ふだ・おしらせ）ここ は きょうしつ ___ 。", es: "(Letrero) Esto no es un salón.", answer: "dewa",
    explain: "En letreros o anuncios usamos ではありません (suena más serio)." },
  { ja: "（ふだ・おしらせ）こちら は かいぎしつ ___ 。", es: "(Letrero) Aquí no es la sala de juntas.", answer: "dewa",
    explain: "En avisos formales: ではありません." },

  // Contraste simple con “es” y “¿es?”
  { ja: "これは ほん ___ 。", es: "Esto es un libro.", answer: "desu",
    explain: "Si SÍ es, usamos です (es)." },
  { ja: "それ は ほん ___ 。", es: "¿Eso es un libro?", answer: "ka",
    explain: "Para preguntar ponemos ですか: “¿es?”." },

  // な-adjetivos con negación
  { ja: "この へや は しずか ___ 。", es: "Este cuarto no es tranquilo.", answer: "dewa",
    explain: "Con adjetivo な (しずか) también podemos negar con ではありません." },
  { ja: "まち は にぎやか ___ 。", es: "La ciudad no es animada.", answer: "dewa",
    explain: "Adjetivo な + ではありません (o じゃありません en plática)." },

  // Extra natural
  { ja: "わたし は いしゃ ___ 。", es: "Yo no soy médico/a.", answer: "ja",
    explain: "En plática normal, negamos con じゃありません." },
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
  // Quita etiquetas como （ふだ・おしらせ）
  return s.replace(/（.*?）/g, "").trim();
}

/** ============ Screen ============ */
export default function B4_DesuNeg() {
  const [showES, setShowES] = useState(true);

  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Form["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  const { playCorrect, playWrong } = useFeedbackSounds();

  const onPick = (k: Form["key"]) => {
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
    const tail = FMAP[item.answer].jp;
    speakJA(stripMeta(item.ja).replace("___", tail));
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={10} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
          <Text style={s.title}>「です」の ひてい — やさしい せつめい</Text>
          <Text style={s.jpSub}>です = “es” ／ じゃありません = “no es” ／ ではありません = “no es (muy formal)”</Text>
          <View style={s.tagsRow}><Tag label="N5" /><Tag label="かんたん" /><Tag label="れんしゅう" /></View>
        </View>

        {/* Explicación Modo Primaria */}
        <View style={s.card}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• <Text style={s.bold}>です</Text> es como una <Text style={s.bold}>estampita</Text> que dice: “<Text style={s.bold}>sí es</Text>”. Va al final.</Text>
          <Text style={s.p}>• <Text style={s.bold}>じゃありません</Text> es la estampita: “<Text style={s.bold}>no es</Text>”. También va al final.</Text>
          <Text style={s.p}>• <Text style={s.bold}>ではありません</Text> es lo mismo que “no es”, pero <Text style={s.bold}>muy formal</Text> (como un letrero).</Text>
          <Text style={s.p}>• Para preguntar, usamos <Text style={s.bold}>ですか</Text>: “¿es?”.</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "これは ほん です。", es: "Esto es un libro. (sí es)" },
              { ja: "それ は ぺん ですか。", es: "¿Eso es un bolígrafo? (¿es?)" },
              { ja: "あれ は えんぴつ じゃありません。", es: "Aquello no es un lápiz. (no es)" },
              { ja: "（ふだ）ここ は きょうしつ ではありません。", es: "(Letrero) Esto no es un salón. (no es muy formal)" },
            ].map((e, idx) => (
              <View key={idx}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={s.line}>{e.ja}</Text>
                  <IconBtn onPress={() => speakJA(stripMeta(e.ja))} />
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
          <Text style={s.p}>Si suena como <Text style={s.bold}>plática normal</Text> → usa <Text style={s.bold}>じゃありません</Text>.</Text>
          <Text style={s.p}>Si parece <Text style={s.bold}>letrero o anuncio</Text> → usa <Text style={s.bold}>ではありません</Text>.</Text>
        </View>

        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.h2}>Cuidado 🧩</Text>
          <Text style={s.p}>Con adjetivos <Text style={s.bold}>な</Text>: 「しずか ではありません／じゃありません」.</Text>
          <Text style={s.p}>Con adjetivos <Text style={s.bold}>い</Text>: se usa 「〜くない です」 (ej.: 「たかく ない です」). (No hacemos quiz de esto aquí).</Text>
        </View>

        {/* Quiz */}
        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Elige la forma correcta</Text>
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
            {FORMS.map((f) => {
              const chosen = picked != null;
              const isPicked = picked === f.key;
              const isRight = chosen && f.key === item.answer;
              const bg = !chosen ? "#111827" : isRight ? "#059669" : isPicked ? "#DC2626" : "#374151";
              return (
                <Pressable
                  key={f.key}
                  onPress={() => onPick(f.key)}
                  disabled={chosen}
                  style={[s.qbtn, { backgroundColor: bg }]}
                >
                  <Text style={s.qbtnJp}>{f.jp}</Text>
                  <Text style={s.qbtnEs}>{f.es}</Text>
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
                <Text style={s.bold}>Recuerda:</Text> です = es ／ じゃありません = no es（plática）／ ではありません = no es（letrero）／ ですか = ¿es?
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

function SakuraRain({ count = 10 }: { count?: number }) {
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
