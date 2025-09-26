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
// Hook global (misma ruta que usas)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========== Datos (solo KANA, explicado como en primaria) ========== */
type Choice = { key: "wo" | "wa" | "ga"; jp: string; es: string };
const CHOICES: Choice[] = [
  { key: "wo", jp: "を", es: "objeto directo (lo que se hace)" },
  { key: "wa", jp: "は", es: "tema (de qué hablamos)" },
  { key: "ga", jp: "が", es: "sujeto / aparece (nuevo)" },
];

type GapItem = {
  ja: string;    // con ___ para la particula
  es: string;
  answer: Choice["key"];
  explain: string; // explicación en modo primaria
};

// Ejemplos N5, sin kanji ni rōmaji
const BANK: GapItem[] = [
  { ja: "ほん ___ よみます。", es: "Leo un libro.", answer: "wo",
    explain: "La acción es 'leer' y el libro es lo que se lee → objeto directo → を。" },
  { ja: "おちゃ ___ のみます。", es: "Bebo té.", answer: "wo",
    explain: "『飲みます』(beber) necesita el objeto (qué bebes) → を。" },
  { ja: "りんご ___ たべます。", es: "Como una manzana.", answer: "wo",
    explain: "『食べます』(comer) necesita lo que se come → を。" },
  { ja: "えいが ___ みます。", es: "Veo una película.", answer: "wo",
    explain: "『見る』(ver) → la película es objeto → を。" },

  // Distractores: tema o existencia
  { ja: "わたし ___ がくせい です。", es: "Yo soy estudiante.", answer: "wa",
    explain: "Aquí decimos de qué hablamos (yo = tema) → は." },
  { ja: "いぬ ___ います。", es: "Hay un perro.", answer: "ga",
    explain: "Existencia → が (aparece/algo existe)." },

  // Más oraciones con を aplicadas a movimiento / compras
  { ja: "まち ___ あるきます。", es: "Camino por la ciudad.", answer: "wo",
    explain: "Si el verbo indica 'recorrer' un lugar con foco en la ruta/objeto, usamos を (forma: まちをあるきます)." },
  { ja: "かいもの ___ します。", es: "Hago compras.", answer: "wo",
    explain: "『買い物をする』(hacer compras) -> 買い物 es objeto de 'hacer' → を。" },

  // Preguntas modelo para distinguir
  { ja: "なに ___ たべますか。", es: "¿Qué comes?", answer: "wo",
    explain: "Con 'qué' preguntamos el objeto directo → なに を たべますか." },
  { ja: "だれ ___ きますか。", es: "¿Quién viene?", answer: "ga",
    explain: "Con だれ/来る usamos が (quién es el que viene) → が。" },
];

/** ========== Utilidades ========== */
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

/** ========== Screen ========== */
export default function B4_Wo() {
  const [showES, setShowES] = useState(true);
  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  // hook global de sonidos
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
    const tail = CHOICES.find(c => c.key === item.answer)!.jp;
    const text = stripMeta(item.ja).replace("___", tail);
    speakJA(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StarField count={10} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header morado con sticker */}
        <View style={s.header}>
          <View style={s.sticker}><Ionicons name="ellipse-outline" size={22} color={ACCENT_DARK} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
            <Text style={s.title}>を — Objeto directo (qué se hace)</Text>
            <Text style={s.jpSub}>を は「すること」の対象（lo que recibe la acción）</Text>
          </View>
          <View style={s.pill}><Text style={s.pillTxt}>N5</Text></View>
        </View>

        {/* Mini-guía simple (modo primaria) */}
        <View style={s.card}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• Cuando haces algo a algo (leer, comer, ver), el "algo" es el <Text style={s.bold}>objeto</Text>.</Text>
          <Text style={s.p}>• En japonés ponemos <Text style={s.bold}>を</Text> después del objeto: <Text style={s.kbd}>ほん を よみます</Text> → "Leo un libro".</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "ほん を よみます。", es: "Leo un libro." },
              { ja: "おちゃ を のみます。", es: "Bebo té." },
              { ja: "りんご を たべます。", es: "Como una manzana." },
            ].map((e, idx) => (
              <View key={idx}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={s.line}>{e.ja}</Text>
                  <IconSpeaker onPress={() => speakJA(e.ja)} />
                </View>
                {showES && <Text style={s.es}>{e.es}</Text>}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable onPress={() => setShowES(v => !v)} style={s.toggleBtn}>
              <Ionicons name="globe-outline" size={16} color={ACCENT_DARK} />
              <Text style={s.toggleTxt}>{showES ? "Ocultar ES" : "Mostrar ES"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Truco y cuidado */}
        <View style={[s.card, { backgroundColor: CARD_LIGHT }]}>
          <Text style={s.h2}>Truco ✨</Text>
          <Text style={s.p}>Si el verbo es <Text style={s.bold}>transitivo</Text> (leer, comer, ver, comprar...), busca el objeto y pon <Text style={s.bold}>を</Text>.</Text>
          <Text style={s.p}>Si la oración habla del tema o dice "hay" alguien, usa otras partículas (は/が).</Text>
        </View>

        {/* Quiz */}
        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Elige la partícula correcta</Text>
            <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.bigLine}>{item.ja}</Text>
              <IconSpeaker onPress={pronounceCorrect} />
            </View>
            {showES && <Text style={s.es}>{item.es}</Text>}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
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

          {/* Explicación al responder */}
          {picked && (
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name={picked === item.answer ? "checkmark-circle" : "close-circle"} size={20} color={picked === item.answer ? "#059669" : "#DC2626"} />
                <Text style={[s.h2, { color: picked === item.answer ? "#065F46" : "#7F1D1D" }]}>
                  {picked === item.answer ? "¡Correcto!" : "Respuesta incorrecta"}
                </Text>
              </View>
              <Text style={s.p}><Text style={s.bold}>Por qué: </Text>{item.explain}</Text>
              <Text style={[s.p, { marginTop: 6 }]}>
                <Text style={s.bold}>Recuerda:</Text> Verbos que actúan sobre algo → <Text style={s.kbd}>を</Text>.
              </Text>
            </View>
          )}

          <Pressable onPress={next} disabled={picked == null} style={[s.primaryBtn, { opacity: picked == null ? 0.5 : 1 }]}>
            <Text style={s.primaryBtnText}>{i + 1 >= deck.length ? "Reiniciar" : "Siguiente"}</Text>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/** ========== Componentes/Tiny helpers ========== */
function IconSpeaker({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.speakerBtn}>
      <Ionicons name="volume-high-outline" size={16} color={ACCENT_DARK} />
    </Pressable>
  );
}

/** ========== Decoración: estrellas que flotan ========== */
function StarField({ count = 10 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const size = 6 + Math.round(Math.random() * 10);
    const x = Math.round(Math.random() * (width - size));
    const delay = Math.round(Math.random() * 2500);
    const duration = 5000 + Math.round(Math.random() * 3000);
    const rotStart = Math.random() * 360;
    return { id: i, size, x, delay, duration, rotStart };
  }), [count, width]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map(s => (<Star key={s.id} {...s} H={height} />))}
    </View>
  );
}
function Star({ size, x, delay, duration, rotStart, H }: { size: number; x: number; delay: number; duration: number; rotStart: number; H: number; }) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true }).start(() => {
        if (!alive) return;
        setTimeout(fall, Math.random() * 1200);
      });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const start = setTimeout(() => { fall(); rotLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, y]);
  const translateX = new Animated.Value(x);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 360}deg`] });
  return <Animated.View style={[s.star, { width: size, height: size, borderRadius: size, transform: [{ translateX }, { translateY: y }, { rotate }] }]} />;
}

/** ========== Estilos (paleta morada) ========== */
const BG = "#FBF7FF";
const ACCENT = "#7C3AED";
const ACCENT_DARK = "#5B21B6";
const CARD_LIGHT = "#F7F2FF";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#F6F0FF", padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "#EDE9FE"
  },
  sticker: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "#FDF7FF", borderWidth: 1, borderColor: "#F3E8FF"
  },
  kicker: { color: ACCENT_DARK, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: "#241332" },
  jpSub: { color: "#5B21B6", marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#F7F2FF", borderRadius: 999, borderWidth: 1, borderColor: "#EDE9FE" },
  pillTxt: { color: ACCENT_DARK, fontWeight: "900" },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#F3E8FF" },
  h2: { fontSize: 16, fontWeight: "900", color: ACCENT_DARK },
  p: { color: "#4C1D95", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT_DARK },
  kbd: { fontWeight: "900", color: ACCENT_DARK, backgroundColor: "#F5E8FF", paddingHorizontal: 6, borderRadius: 6 },

  line: { color: "#241332", marginLeft: 6 },
  bigLine: { color: "#241332", marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#6D28D9", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#6D28D9", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 11, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#FFFBFF" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  speakerBtn: { padding: 6, borderRadius: 999, backgroundColor: "#F7F2FF", borderWidth: 1, borderColor: "#F3E8FF" },

  star: { position: "absolute", top: -30, left: 0, backgroundColor: "#E9D5FF", opacity: 0.9 },

  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#F3E8FF" },
  toggleTxt: { color: ACCENT_DARK, fontWeight: "900" },

  kbdInline: { fontWeight: "900", color: ACCENT_DARK },

  line2: { color: "#241332" },
});

const btn = StyleSheet.create({
  q: { padding: 6, borderRadius: 8 },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#EDE9FE", backgroundColor: "#fff" },
  outlineTxt: { color: ACCENT_DARK, fontWeight: "900" },
});
