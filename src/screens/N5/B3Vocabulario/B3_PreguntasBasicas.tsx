// src/screens/N5/B3Vocabulario/B3_PreguntasBasicas.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, Easing, Pressable, ScrollView, StyleSheet, Text,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
// ✅ Hook global de sonidos (ruta correcta desde esta screen)
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ===================== Datos base ===================== */
type QWord = { key: "nani" | "nan" | "dare" | "doko"; jp: string; ro: string; es: string };
const QWORDS: QWord[] = [
  { key: "nani", jp: "なに", ro: "nani", es: "qué" },
  { key: "nan",  jp: "なん", ro: "nan",  es: "qué (antes de です/だ)" },
  { key: "dare", jp: "だれ", ro: "dare", es: "quién" },
  { key: "doko", jp: "どこ", ro: "doko", es: "dónde" },
];
const QMAP = Object.fromEntries(QWORDS.map(q => [q.key, q])) as Record<QWord["key"], QWord>;

type GapItem = {
  ja: string;         // oración con hueco ___
  ro: string;         // lectura con hueco
  es: string;         // traducción
  answer: QWord["key"];
  explain: string;    // explicación breve del porqué
};

// ✅ 16 ejercicios, con uso correcto de 「なん」 antes de です/だ
const BANK: GapItem[] = [
  // 「なん」 (qué) antes de です/だ
  { ja: "___ は なん ですか。", ro: "___ wa nan desu ka?", es: "¿Qué es ___?", answer: "nan",
    explain: "Antes de です/だ, 「なに」 se pronuncia/usa como 「なん」 → なんですか。" },
  { ja: "これは ___ ですか。", ro: "kore wa ___ desu ka?", es: "¿Qué es esto?", answer: "nan",
    explain: "Con ですか se usa 「なん」: これは なんですか。" },
  { ja: "おしごと は ___ ですか。", ro: "oshigoto wa ___ desu ka?", es: "¿Cuál es tu trabajo?", answer: "nan",
    explain: "Pide el tipo/identidad del trabajo; al ir con ですか → 「なん」." },
  { ja: "その ことば の いみ は ___ ですか。", ro: "sono kotoba no imi wa ___ desu ka?", es: "¿Qué significa esa palabra?", answer: "nan",
    explain: "Significado (definición) y ですか → forma 「なん」." },

  // 「だれ」 (quién)
  { ja: "あの ひと は ___ ですか。", ro: "ano hito wa ___ desu ka?", es: "¿Quién es esa persona?", answer: "dare",
    explain: "Identidad de una persona → 「だれ」." },
  { ja: "こちら は ___ ですか。", ro: "kochira wa ___ desu ka?", es: "¿Quién es (esta persona)?", answer: "dare",
    explain: "Con こちら (esta persona, formal) se pregunta por identidad → 「だれ」." },
  { ja: "しんせつ な かた は ___ ですか。", ro: "shinsetsu na kata wa ___ desu ka?", es: "¿Quién es la persona amable?", answer: "dare",
    explain: "Identificar a qué persona se refiere → 「だれ」." },
  { ja: "あなた の せんせい は ___ ですか。", ro: "anata no sensei wa ___ desu ka?", es: "¿Quién es tu profesor/a?", answer: "dare",
    explain: "Se pide identidad de la persona → 「だれ」." },

  // 「どこ」 (dónde)
  { ja: "トイレ は ___ ですか。", ro: "toire wa ___ desu ka?", es: "¿Dónde está el baño?", answer: "doko",
    explain: "Ubicación/lugar → 「どこ」." },
  { ja: "えき は ___ ですか。", ro: "eki wa ___ desu ka?", es: "¿Dónde está la estación?", answer: "doko",
    explain: "Se pregunta por lugar → 「どこ」." },
  { ja: "せんせい は ___ ですか。", ro: "sensei wa ___ desu ka?", es: "¿Dónde está el/la profe?", answer: "doko",
    explain: "Aunque sea persona, la intención es ubicación → 「どこ」." },
  { ja: "がくせい は ___ ですか。", ro: "gakusei wa ___ desu ka?", es: "¿Dónde está el/la estudiante?", answer: "doko",
    explain: "Se busca el lugar de la persona → 「どこ」." },
  { ja: "ミーティングルーム は ___ ですか。", ro: "miitingu ruumu wa ___ desu ka?", es: "¿Dónde está la sala de reuniones?", answer: "doko",
    explain: "Lugar/ubicación de un sitio → 「どこ」." },

  // combinadas/contexto real
  { ja: "あの ひとの なまえ は ___ ですか。", ro: "ano hito no namae wa ___ desu ka?", es: "¿Cuál es el nombre de esa persona?", answer: "nan",
    explain: "Se pregunta el ‘contenido’ del nombre y va con ですか → 「なん」." },
  { ja: "にゅうがくしき は ___ ですか。", ro: "nyūgakushiki wa ___ desu ka?", es: "¿Dónde es la ceremonia de ingreso?", answer: "doko",
    explain: "Lugar de un evento → 「どこ」." },
];

/** ===================== Utilidades ===================== */
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

/** ===================== Screen ===================== */
export default function B3_PreguntasBasicas() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  const deck = useMemo(() => shuffle(BANK), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<QWord["key"] | null>(null);
  const [score, setScore] = useState(0);
  const item = deck[i];

  // 🔊 Hook global de feedback sonoro
  const { playCorrect, playWrong } = useFeedbackSounds();

  const onPick = (k: QWord["key"]) => {
    if (picked) return;
    setPicked(k);
    const ok = k === item.answer;
    if (ok) {
      setScore((s) => s + 1);
      Vibration.vibrate(12);
      playCorrect().catch(() => {});
    } else {
      Vibration.vibrate([0, 30, 40, 30]);
      playWrong().catch(() => {});
    }
  };

  const next = () => {
    if (i + 1 >= deck.length) {
      setI(0);
      setPicked(null);
      setScore(0);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
  };

  // Reproduce la oración con el hueco lleno usando la respuesta correcta
  const pronounceCorrect = () => {
    const jp = QMAP[item.answer].jp; // 「なん」/「なに」/「だれ」/「どこ」
    // Si en la frase ya hay ‘なん’ escrito (como recomendación), igual reemplazamos por la opción elegida
    speakJA(item.ja.replace("___", jp));
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />
      <ScrollView contentContainerStyle={s.c}>
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>Preguntas básicas — きほん の しつもん</Text>
          <Text style={s.jpSub}>なに・なん・だれ・どこ（qué / quién / dónde）</Text>
          <View style={s.tagsRow}><Tag label="ロールプレイ" /><Tag label="クイズ" /><Tag label="ボイス" /></View>
        </View>

        <MiniGuide
          showRomaji={showRomaji}
          showES={showES}
          setShowRomaji={setShowRomaji}
          setShowES={setShowES}
        />

        <View style={[s.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Elige la palabra correcta</Text>
            <Text style={s.meta}>Aciertos: {score}/{deck.length}</Text>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.bigLine}>{item.ja}</Text>
              <IconBtn onPress={pronounceCorrect} />
            </View>
            {showRomaji && <Text style={s.romaji}>{item.ro}</Text>}
            {showES && <Text style={s.es}>{item.es}</Text>}
          </View>

          {/* Opciones */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            {QWORDS.map((q) => {
              const chosen = picked != null;
              const isPicked = picked === q.key;
              const isRight = chosen && q.key === item.answer;
              const bg = !chosen ? "#111827" : isRight ? "#059669" : isPicked ? "#DC2626" : "#374151";
              return (
                <Pressable
                  key={q.key}
                  onPress={() => onPick(q.key)}
                  disabled={chosen}
                  style={[s.qbtn, { backgroundColor: bg }]}
                >
                  <Text style={s.qbtnJp}>{q.jp}</Text>
                  <Text style={s.qbtnEs}>{q.es}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Explicación después de contestar */}
          {picked && (
            <View style={[s.explainBox, { borderColor: picked === item.answer ? "#059669" : "#DC2626" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={picked === item.answer ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={picked === item.answer ? "#059669" : "#DC2626"}
                />
                <Text style={[s.h2, { color: picked === item.answer ? "#065F46" : "#7F1D1D" }]}>
                  {picked === item.answer ? "¡Correcto!" : "Respuesta incorrecta"}
                </Text>
              </View>

              <Text style={s.p}>
                <Text style={s.bold}>Por qué:</Text> {item.explain}
              </Text>

              <View style={{ marginTop: 8 }}>
                <Text style={[s.p, { marginBottom: 4 }]}>
                  <Text style={s.bold}>Forma modelo: </Text>
                  <Text style={s.kbd}>[tema] は [interrogativo] ですか。</Text>
                </Text>
                <Text style={s.p}>
                  <Text style={s.bold}>Notas:</Text> 「なに」 → 「なん」 antes de です/だ · 「だれ」 = quién · 「どこ」 = dónde.
                </Text>
              </View>
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

/** ===================== Mini-guía ===================== */
function MiniGuide({
  showRomaji, showES, setShowRomaji, setShowES,
}:{
  showRomaji: boolean; showES: boolean;
  setShowRomaji: (v: (b:boolean)=>boolean | boolean) => void;
  setShowES: (v: (b:boolean)=>boolean | boolean) => void;
}) {
  const EX = [
    { ja: "これは なん ですか。", ro: "kore wa nan desu ka?", es: "¿Qué es esto?" },
    { ja: "あの ひと は だれ ですか。", ro: "ano hito wa dare desu ka?", es: "¿Quién es esa persona?" },
    { ja: "えき は どこ ですか。", ro: "eki wa doko desu ka?", es: "¿Dónde está la estación?" },
  ];
  return (
    <View style={s.card}>
      <Text style={s.h2}>Mini-guía (cómo preguntar)</Text>
      <Text style={s.p}>
        Usa <Text style={s.kbd}>なに／なん</Text> (qué), <Text style={s.kbd}>だれ</Text> (quién), <Text style={s.kbd}>どこ</Text> (dónde).{"\n"}
        Regla práctica: <Text style={s.kbd}>「なに」 → 「なん」</Text> justo antes de <Text style={s.kbd}>です/だ</Text>.{"\n"}
        Estructura: <Text style={s.kbd}>[tema] は [interrogativo] ですか</Text>.
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <ToggleBtn icon="text" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji((v:any)=>!v)} />
        <ToggleBtn icon="globe-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES((v:any)=>!v)} />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        {EX.map((e, i) => (
          <View key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.line}>{e.ja}</Text>
              <IconBtn onPress={() => speakJA(e.ja)} />
            </View>
            {showRomaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
            {showES ? <Text style={s.es}>{e.es}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** ===================== UI helpers / estilos ===================== */
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
  const petals = useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
      const size = 8 + Math.round(Math.random() * 10);
      const x = Math.round(Math.random() * (width - size));
      const delay = Math.round(Math.random() * 2500);
      const rotStart = Math.random() * 360;
      const duration = 6000 + Math.round(Math.random() * 2000);
      return { id: i, size, x, delay, rotStart, duration };
    }), [count, width]);
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
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });
  return (
    <Animated.View
      style={[s.petal, { width: size, height: size * 1.4, borderRadius: size,
      transform: [{ translateX }, { translateY: y }, { rotate }] }]}
    />
  );
}

/** ===================== Estilos ===================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: { backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8 },
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
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },

  meta: { fontSize: 12, color: "#6B7280", fontWeight: "700" },

  qbtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  qbtnJp: { color: "#fff", fontSize: 22, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

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
