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
// Hook global (ruta relativa desde esta pantalla)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========== Datos (solo KANA) ========== */
type Choice = { key: "ni" | "he"; jp: "に" | "へ"; es: string };
const CHOICES: Choice[] = [
  { key: "ni", jp: "に", es: "destino / tiempo (a las X)" },
  { key: "he", jp: "へ", es: "dirección / hacia (destino)" },
];
const CMAP = Object.fromEntries(CHOICES.map(c => [c.key, c])) as Record<Choice["key"], Choice>;

type GapItem = {
  ja: string;    // frase con ___
  es: string;    // traducción simple
  answer: Choice["key"];
  explain: string; // explicación clara, estilo primaria
};

// ⚠️ SIN kanji, SIN rōmaji — ejemplos N5 en kana/katakana
const BANK: GapItem[] = [
  { ja: "がっこう ___ いきます。", es: "Voy a la escuela.", answer: "ni",
    explain: "Destino: に marca a dónde vas. También sirve para decir 'a las X' (tiempo)." },
  { ja: "とうきょう ___ いきます。", es: "Voy a Tokio.", answer: "he",
    explain: "Dirección/hacia: へ pone atención en la 'dirección' (hacia Tokio)." },
  { ja: "ともだち ___ いきます。", es: "Voy a casa de un amigo.", answer: "ni",
    explain: "Si piensas en 'llegar a' un lugar usamos に." },
  { ja: "こうえん ___ あるきます。", es: "Camino hacia el parque.", answer: "he",
    explain: "Si quieres decir 'hacia' o 'en dirección a', puedes usar へ." },
  { ja: "しちじ ___ おきます。", es: "Me levanto a las 7.", answer: "ni",
    explain: "Para tiempo específico usamos に (a las 7)." },
  { ja: "にちようび ___ でかけます。", es: "Salgo el domingo.", answer: "ni",
    explain: "Día/fecha específica → に." },
  { ja: "くうこう ___ いきます。", es: "Voy al aeropuerto.", answer: "he",
    explain: "Dirección: 'hacia el aeropuerto' → へ." },
  { ja: "ほんや ___ いきます。", es: "Voy a la librería.", answer: "ni",
    explain: "Si la idea es 'llegar a la librería' (sitio final) → に." },
  { ja: "えき ___ いきますか。", es: "¿Vas a la estación?", answer: "ni",
    explain: "Pregunta de destino: に es la opción común." },
  { ja: "えいがかん ___ いきます。", es: "Voy hacia el cine.", answer: "he",
    explain: "Cuando contamos dirección simple (hacia el cine) → へ." },
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
export default function B4_NiHe() {
  const [showES, setShowES] = useState(true);

  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  // Hook global de sonidos
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
    // defensa: por si item o CMAP no existen (muy improbable si BANK está bien)
    if (!item) return;
    const mapEntry = CMAP[item.answer];
    if (!mapEntry) return;
    const tail = mapEntry.jp;
    speakJA(stripMeta(item.ja).replace("___", tail));
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <RibbonWave count={10} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header distinto: paleta naranja + cinta */}
        <View style={s.header}>
          <View style={s.ribbonIcon}><Ionicons name="navigate-outline" size={20} color={ACCENT_DARK} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>ぶんぽう ブロック 4</Text>
            <Text style={s.title}>に／へ — みち と じかん</Text>
            <Text style={s.jpSub}>に = しゅうてん（destino）／ に = じかん（a las X） · へ = ほうこう（hacia）</Text>
          </View>
          <View style={s.tag}><Text style={s.tagTxt}>N5</Text></View>
        </View>

        {/* Explicación en modo primaria */}
        <View style={s.card}>
          <Text style={s.h2}>Piensa así 🧸</Text>
          <Text style={s.p}>• <Text style={s.bold}>に</Text> dice <Text style={s.bold}>a dónde llegas</Text> y también <Text style={s.bold}>a qué hora</Text> (tiempo específico).</Text>
          <Text style={s.p}>• <Text style={s.bold}>へ</Text> dice <Text style={s.bold}>hacia</Text>, la dirección. No se usa para tiempo.</Text>
          <Text style={s.p}>• Ejemplo fácil: <Text style={s.kbd}>がっこう に いきます</Text> = 'llego a la escuela'.</Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {[
              { ja: "がっこう に いきます。", es: "Voy a la escuela." },
              { ja: "とうきょう へ いきます。", es: "Voy hacia Tokio." },
              { ja: "しちじ に おきます。", es: "Me levanto a las 7." },
              { ja: "こうえん へ あるきます。", es: "Camino hacia el parque." },
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
            <ToggleBtn icon="globe-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
          </View>
        </View>

        {/* Truco y Cuidado */}
        <View style={[s.card, { marginTop: 12, backgroundColor: CARD_ACCENT }]}>
          <Text style={s.h2}>Truco ✨</Text>
          <Text style={s.p}>Piensa: si dices <Text style={s.bold}>a qué hora</Text> o <Text style={s.bold}>llegas a</Text>, usa <Text style={s.bold}>に</Text>.</Text>
          <Text style={s.p}>Si solo dices la <Text style={s.bold}>dirección</Text> (hacia), usa <Text style={s.bold}>へ</Text>.</Text>
        </View>

        <View style={[s.card, { marginTop: 12 }]}>
          <Text style={s.h2}>Cuidado 🧩</Text>
          <Text style={s.p}>No uses へ para tiempo. <Text style={s.bold}>に</Text> puede hacer las dos cosas (lugar de llegada y tiempo).</Text>
        </View>

        {/* Quiz */}
        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Elige に o へ</Text>
            <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.bigLine}>{item.ja}</Text>
              <IconBtn onPress={pronounceCorrect} />
            </View>
            {showES && <Text style={s.es}>{item.es}</Text>}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
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

          {/* explicación */}
          {picked && (
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name={picked === item.answer ? "checkmark-circle" : "close-circle"} size={20}
                  color={picked === item.answer ? "#059669" : "#DC2626"} />
                <Text style={[s.h2, { color: picked === item.answer ? "#065F46" : "#7F1D1D" }]}>
                  {picked === item.answer ? "¡Perfecto!" : "Intenta otra vez"}
                </Text>
              </View>
              <Text style={s.p}><Text style={s.bold}>Por qué:</Text> {item.explain}</Text>
              <Text style={[s.p, { marginTop: 6 }]}><Text style={s.bold}>Recuerda:</Text> に = destino / tiempo · へ = dirección (no tiempo).</Text>
            </View>
          )}

          <Pressable onPress={next} disabled={picked == null} style={[s.primaryBtn, { marginTop: 12, opacity: picked == null ? 0.5 : 1 }]}>
            <Text style={s.primaryBtnText}>{i + 1 >= deck.length ? "Reiniciar" : "Siguiente"}</Text>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/** ========== UI helpers / decoracion: cinta animada ========== */
function ToggleBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={16} color={ACCENT_DARK} />
      <Text style={btn.txt}>{label}</Text>
    </Pressable>
  );
}
function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.icon}>
      <Ionicons name="volume-high-outline" size={16} color={ACCENT_DARK} />
    </Pressable>
  );
}

/** RibbonWave: pequeñas cintas que se mueven horizontalmente */
function RibbonWave({ count = 10 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const ribbons = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const y = Math.round(Math.random() * (height - 40));
    const delay = Math.round(Math.random() * 2000);
    const duration = 4000 + Math.round(Math.random() * 3000);
    const left = Math.round(Math.random() * (width - 30));
    return { id: i, y, delay, duration, left };
  }), [count, width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {ribbons.map(r => <Ribbon key={r.id} {...r} />)}
    </View>
  );
}
function Ribbon({ y, delay, duration, left }: { y: number; delay: number; duration: number; left: number }) {
  const x = useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      x.setValue(-120);
      Animated.timing(x, { toValue: 400, duration, easing: Easing.linear, useNativeDriver: true }).start(() => {
        if (!alive) return;
        setTimeout(loop, Math.random() * 800);
      });
    };
    const start = setTimeout(loop, delay);
    return () => { alive = false; clearTimeout(start); x.stopAnimation(); };
  }, [delay, duration, x]);

  return (
    <Animated.View style={{ position: "absolute", top: y, left, transform: [{ translateX: x }] }}>
      <View style={s.ribbon} />
    </Animated.View>
  );
}

/** ========== Estilos (paleta naranja) ========== */
const BG = "#FFF8F1";
const ACCENT = "#FB923C";
const ACCENT_DARK = "#C2410C";
const CARD_ACCENT = "#FFF7ED";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#FFF6ED", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#FFE8D0"
  },
  ribbonIcon: {
    width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFF8F3", borderWidth: 1, borderColor: "#FFE8D0"
  },
  kicker: { color: ACCENT_DARK, fontWeight: "900", letterSpacing: 0.4 },
  title: { fontSize: 20, fontWeight: "900", color: "#3B2B14" },
  jpSub: { color: "#7C2E00", marginTop: 2 },

  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#FCECDC" },

  h2: { fontSize: 16, fontWeight: "900", color: ACCENT_DARK },
  p: { color: "#6B3A12", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: ACCENT_DARK },
  kbd: { fontWeight: "900", color: ACCENT_DARK, backgroundColor: "#FFF4E6", paddingHorizontal: 6, borderRadius: 6 },

  line: { color: "#3B2B14", marginLeft: 6 },
  bigLine: { color: "#3B2B14", marginLeft: 6, fontSize: 18, fontWeight: "800" },
  es: { color: "#7A4B1C", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#7A4B1C", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12, opacity: 0.95 },

  explainBox: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: "#FFFBF8" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#FFF8F3", borderRadius: 999, borderWidth: 1, borderColor: "#FFE8D0" },
  tagTxt: { fontSize: 12, fontWeight: "800", color: ACCENT_DARK },

  ribbon: { width: 64, height: 8, borderRadius: 6, backgroundColor: "#FFD8A8", opacity: 0.95 },

  ribbonIconSmall: { width: 10, height: 10, borderRadius: 4, backgroundColor: "#FFD8A8" },

  qbtnJpSmall: { color: "#fff", fontSize: 16, fontWeight: "900" },

  explainText: { color: "#6B3A12" },
});

const btn = StyleSheet.create({
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#FFE8D0" },
  txt: { color: ACCENT_DARK, fontWeight: "900" },
  icon: { padding: 6, borderRadius: 999, backgroundColor: "#FFF8F3", borderWidth: 1, borderColor: "#FFE8D0" }
});
