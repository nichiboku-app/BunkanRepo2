// src/screens/N5/B6Tiendas/B6_Tiendas.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

/* =======================
   Imágenes (KanjiVG exactos)
   ======================= */
import imgEN from "../../../../assets/kanjivg/tiendas/en_web.webp"; // 円
import imgHYAKU from "../../../../assets/kanjivg/tiendas/hyaku_web.webp"; // 百
import imgMAN from "../../../../assets/kanjivg/tiendas/man_web.webp"; // 万
import imgMISE from "../../../../assets/kanjivg/tiendas/mise_web.webp"; // 店
import imgSEN from "../../../../assets/kanjivg/tiendas/sen_web.webp"; // 千

const IMG_BY_KANJI: Record<string, any> = {
  "円": imgEN,
  "千": imgSEN,
  "百": imgHYAKU,
  "万": imgMAN,
  "店": imgMISE,
};

/* =========================================================
   🔊 TTS helper
   ========================================================= */
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

/* =========================================================
   🌈 Fondo bonito (degradado + emojis flotando)
   ========================================================= */
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
        Animated.timing(a2, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a2, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop1.start(); loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, [a1, a2]);

  const f1 = {
    transform: [
      { translateY: a1.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
      { translateX: a1.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
      { rotate: a1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "4deg"] }) },
    ],
    opacity: 0.9,
  };
  const f2 = {
    transform: [
      { translateY: a2.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) },
      { translateX: a2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
      { rotate: a2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-4deg"] }) },
    ],
    opacity: 0.85,
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.9 }}
      >
        <Animated.Text style={[styles.bgEmoji, { top: 40, left: 18 }, f1]}>💴</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { top: 120, right: 28 }, f2]}>🛍️</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { bottom: 90, left: 28 }, f2]}>🏪</Animated.Text>
        <Animated.Text style={[styles.bgEmoji, { bottom: 40, right: 24 }, f1]}>🧾</Animated.Text>
      </ImageBackground>
    </View>
  );
}

/* =========================================================
   🗣️ Frases con audio (20)
   ========================================================= */
function Phrase({ jp, es }: { jp: string; es: string }) {
  return (
    <View style={styles.phraseRow}>
      <Text style={styles.phraseJP}>{jp}</Text>
      <Pressable onPress={() => speakJP(jp)} style={styles.playBtn} accessibilityLabel="Escuchar en japonés">
        <Ionicons name="volume-high-outline" size={16} color="#3b2f2f" />
      </Pressable>
      <Text style={styles.phraseES}>/ {es}</Text>
    </View>
  );
}

const FRASES_20: Array<{ jp: string; es: string }> = [
  { jp: "しちゃく できますか。", es: "¿Puedo probármelo?" },
  { jp: "この サイズ は ありますか。", es: "¿Tiene esta talla?" },
  { jp: "べつ の サイズ は ありますか。", es: "¿Hay otra talla?" },
  { jp: "べつ の いろ は ありますか。", es: "¿Hay otro color?" },
  { jp: "これは いくら ですか。", es: "¿Cuánto cuesta esto?" },
  { jp: "もっと やすい の は ありますか。", es: "¿Tiene algo más barato?" },
  { jp: "わりびき は ありますか。", es: "¿Hay descuento?" },
  { jp: "セール は ありますか。", es: "¿Hay rebajas hoy?" },
  { jp: "カード は つかえますか。", es: "¿Aceptan tarjeta?" },
  { jp: "げんきん で はらって も いい ですか。", es: "¿Puedo pagar en efectivo?" },
  { jp: "レジ は どこ ですか。", es: "¿Dónde está la caja?" },
  { jp: "レシート を ください。", es: "Me da el recibo, por favor." },
  { jp: "ふくろ は いりません。", es: "Bolsa no, gracias." },
  { jp: "かみぶくろ を ください。", es: "Una bolsa de papel, por favor." },
  { jp: "ギフト よう に つつんで ください。", es: "Por favor, envuélvalo para regalo." },
  { jp: "へんぴん できますか。", es: "¿Puedo devolverlo?" },
  { jp: "こうかん できますか。", es: "¿Puedo cambiarlo (por otro)?" },
  { jp: "とりおき できますか。", es: "¿Puede apartarlo/reservarlo?" },
  { jp: "うけとり は いつ ですか。", es: "¿Cuándo puedo recogerlo?" },
  { jp: "いっかつ しはらい で おねがい します。", es: "Pago en una sola exhibición, por favor." },
];

/* =========================================================
   🈶 KanjiVG Cards
   ========================================================= */
type KanjiItem = {
  kanji: "円" | "千" | "百" | "万" | "店";
  yomi: string;
  on?: string;
  esp: string;
  trazos: number;
  ejemplo: string;
  audio?: string;
};
const KANJI_LIST: KanjiItem[] = [
  { kanji: "店", yomi: "みせ", on: "テン", esp: "tienda", trazos: 8, ejemplo: "コンビニ は みせ です。", audio: "みせ" },
  { kanji: "円", yomi: "えん", on: "", esp: "yen", trazos: 4, ejemplo: "ひゃくえん。", audio: "えん" },
  { kanji: "百", yomi: "ひゃく", on: "ヒャク", esp: "cien", trazos: 6, ejemplo: "ひゃくえん。", audio: "ひゃく" },
  { kanji: "千", yomi: "せん", on: "セン", esp: "mil", trazos: 3, ejemplo: "せんえん。", audio: "せん" },
  { kanji: "万", yomi: "まん", on: "マン", esp: "diez mil", trazos: 3, ejemplo: "いちまんえん。", audio: "まん" },
];

function KanjiVGCard({ item }: { item: KanjiItem }) {
  const img = IMG_BY_KANJI[item.kanji];
  return (
    <View style={styles.kanjiCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.kanjiBig}>{item.kanji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.reading}>{item.yomi} {!!item.on && <Text style={styles.light}>・{item.on}</Text>}</Text>
          <Text style={styles.meaning}>{item.esp} ・ <Text style={styles.light}>trazos: {item.trazos}</Text></Text>
        </View>
        <Pressable onPress={() => speakJP(item.audio ?? item.yomi)} style={styles.speakBtn} accessibilityLabel="Escuchar lectura">
          <Ionicons name="volume-high-outline" size={18} color="#3b2f2f" />
        </Pressable>
      </View>
      <View style={styles.svgBox}>
        <Image source={img} style={{ width: 220, height: 220 }} contentFit="contain" />
      </View>
      <Text style={styles.example}>例：<Text style={styles.bold}>{item.ejemplo}</Text></Text>
      <Text style={styles.svgCaption}>Diagrama con orden de trazos (KanjiVG)</Text>
    </View>
  );
}

/* =========================================================
   🏬 Tipos de tiendas (con audio)
   ========================================================= */
type StoreType = { jp: string; es: string; ex?: string };
const STORE_TYPES: StoreType[] = [
  { jp: "コンビニ", es: "tienda 24 h (pagos de servicios, boletos, envío, comida rápida)" },
  { jp: "スーパー", es: "supermercado (alimentos y productos diarios)" },
  { jp: "デパート", es: "grandes almacenes (secciones por piso; subsuelo de comida muy bueno)" },
  { jp: "ドラッグストア", es: "farmacia/beauty (medicinas OTC, cosméticos, limpieza; buenos precios)" },
  { jp: "ひゃくえんショップ", es: "tienda de 100 yenes (variedad barata para el día a día)" },
  { jp: "リサイクルショップ", es: "segunda mano (electrodomésticos, ropa, muebles)" },
  { jp: "ほんや", es: "librería (revistas, manga, material escolar básico)" },
  { jp: "ぶんぼうぐや", es: "papelería (útiles, agendas, washi tape)" },
  { jp: "でんきや", es: "tienda de electrónica (electrodomésticos, gadgets, point cards)" },
  { jp: "ホームセンター", es: "bricolaje/hogar (herramientas, jardín, organización)" },
  { jp: "パンや", es: "panadería (panes dulces/salados, sándwiches)" },
  { jp: "きっさてん", es: "cafetería clásica (café, tostadas, desayunos simples)" },
];

function StoreTypeRow({ jp, es, ex }: StoreType) {
  return (
    <View style={styles.storeRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
        <Text style={styles.storeJP}>{jp}</Text>
        <Pressable onPress={() => speakJP(jp)} style={styles.speakChip} accessibilityLabel={`Escuchar ${jp}`}>
          <Ionicons name="volume-high-outline" size={14} color="#3b2f2f" />
        </Pressable>
      </View>
      <Text style={styles.storeES}>{es}{ex ? ` — ${ex}` : ""}</Text>
    </View>
  );
}

/* =========================================================
   💡 Tips de compra (con mini frases 🔊)
   ========================================================= */
type Tip = { title: string; body: string; jp?: string };
const TIPS: Tip[] = [
  { title: "Saludo en tienda", body: "“いらっしゃいませ” es un saludo del staff; no tienes que responder." },
  { title: "Método de pago", body: "Efectivo todavía es muy usado; tarjeta y IC (Suica/PASMO) en la mayoría de cadenas.", jp: "ICカード は つかえますか。" },
  { title: "Bolsas", body: "Las bolsas suelen costar; di “no, gracias”.", jp: "ふくろ は いりません。" },
  { title: "Recibo", body: "Guarda el recibo para cambios/devoluciones.", jp: "レシート を ください。" },
  { title: "Self-checkout", body: "Cada vez más tiendas tienen caja automática (セルフレジ)." },
  { title: "Tallas", body: "Las tallas pueden ser más pequeñas; prueba antes si es posible.", jp: "しちゃく できますか。" },
  { title: "Tax-Free", body: "Muchas cadenas ofrecen tax-free a turistas; lleva el pasaporte y pregunta.", jp: "たっくすふりー は ありますか。" },
  { title: "Precios", body: "A veces verás precios con/sin impuesto (税込／税別); el total se ve en la caja." },
  { title: "Pedir algo", body: "Señala y di: “esto, por favor”.", jp: "これ を ください。" },
  { title: "Konbini hacks", body: "En コンビニ puedes pagar servicios, imprimir, recoger envíos y calentar comida." },
];

function TipItem({ title, body, jp }: Tip) {
  return (
    <View style={styles.tipItem}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="bulb-outline" size={16} color="#3b2f2f" />
        <Text style={styles.tipTitle}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Text style={styles.tipBody}>{body}</Text>
        {!!jp && (
          <Pressable onPress={() => speakJP(jp)} style={styles.speakChip} accessibilityLabel="Escuchar frase del tip">
            <Text style={styles.tipJP}>{jp} 🔊</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   ✅ Hook universal (local para el quiz)
   ========================================================= */
// Reemplaza por tu hook global si ya lo tienes:
// import { useUniversalQuiz } from "../../../hooks/useUniversalQuiz";
type QuizQ = { id: string; qJP?: string; qES?: string; options: string[]; correct: number; speak?: string };
function useUniversalQuiz(questions: QuizQ[]) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const total = questions.length;
  const finished = idx >= total;
  const question = finished ? null : questions[idx];

  function pick(i: number) {
    if (picked !== null || !question) return;
    setPicked(i);
    if (i === question.correct) setScore((s) => s + 1);
  }
  function next() { if (!finished) { setIdx((n) => n + 1); setPicked(null); } }
  function reset() { setIdx(0); setPicked(null); setScore(0); }
  return { idx, total, question, picked, score, finished, pick, next, reset };
}

/* =========================================================
   🧪 Quiz (10 preguntas, con audio)
   ========================================================= */
const QUIZ_ITEMS: QuizQ[] = [
  { id: "q1", qES: "¿Cómo dices: “¿Cuánto cuesta esto?”", options: ["これは いくら ですか。", "これは なん ですか。", "どこ ですか。"], correct: 0, speak: "これは いくら ですか。" },
  { id: "q2", qJP: "しちゃく できますか。", options: ["¿Puedo probármelo?", "¿Aceptan tarjeta?", "¿Puedo devolverlo?"], correct: 0, speak: "しちゃく できますか。" },
  { id: "q3", qES: "¿Cómo dices: “¿Aceptan tarjeta?”", options: ["カード は つかえますか。", "カード を ください。", "カード は いりません。"], correct: 0, speak: "カード は つかえますか。" },
  { id: "q4", qJP: "レシート を ください。", options: ["Una bolsa, por favor.", "Me da el recibo, por favor.", "¿Hay descuento?"], correct: 1, speak: "レシート を ください。" },
  { id: "q5", qES: "Pides otra talla:", options: ["べつ の サイズ は ありますか。", "べつ の いろ は ありますか。", "もっと やすい の は ありますか。"], correct: 0, speak: "べつ の サイズ は ありますか。" },
  { id: "q6", qES: "¿Cómo lees 10,000 yenes?", options: ["ひゃくえん", "せんえん", "いちまんえん"], correct: 2, speak: "いちまんえん" },
  { id: "q7", qES: "¿Cómo dices: “¿Puedo devolverlo?”", options: ["こうかん できますか。", "へんぴん できますか。", "とりおき できますか。"], correct: 1, speak: "へんぴん できますか。" },
  { id: "q8", qJP: "もっと やすい の は ありますか。", options: ["¿Hay algo más barato?", "¿Cuándo puedo recogerlo?", "¿Puedo pagar en efectivo?"], correct: 0, speak: "もっと やすい の は ありますか。" },
  { id: "q9", qES: "Di “Bolsa no, gracias.”", options: ["ふくろ は いりません。", "ふくろ を ください。", "かみぶくろ ください。"], correct: 0, speak: "ふくろ は いりません。" },
  { id: "q10", qJP: "ギフト よう に つつんで ください。", options: ["Envuélvalo para regalo, por favor.", "Aceptan tarjeta, por favor.", "¿Tiene esta talla?"], correct: 0, speak: "ギフト よう に つつんで ください。" },
];

function QuizBlock() {
  const { question, idx, total, picked, score, finished, pick, next, reset } = useUniversalQuiz(QUIZ_ITEMS);
  if (finished) {
    return (
      <View style={s.box}>
        <View style={styles.cardHeader}>
          <Ionicons name="ribbon-outline" size={20} color="#3b2f2f" />
          <Text style={styles.cardTitle}>Resultados</Text>
        </View>
        <Text style={styles.quizQ}>Puntuación: {score} / {total}</Text>
        <Pressable onPress={reset} style={styles.choice}>
          <Text style={styles.choiceTxt}>Repetir quiz</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="school-outline" size={20} color="#3b2f2f" />
        <Text style={styles.cardTitle}>Quiz — Pregunta {idx + 1} de {total}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {!!question?.qJP && <Text style={styles.quizQ}>{question.qJP}</Text>}
        {!!question?.qES && <Text style={styles.quizQ}>{question.qES}</Text>}
        {!!question?.speak && (
          <Pressable onPress={() => speakJP(question.speak!)} style={styles.speakBtn} accessibilityLabel="Escuchar pregunta">
            <Ionicons name="volume-high-outline" size={18} color="#3b2f2f" />
          </Pressable>
        )}
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        {question?.options.map((opt, i) => {
          const isPicked = picked === i;
          const isRight = picked !== null && i === question.correct;
          const isWrong = picked !== null && isPicked && picked !== question.correct;
          return (
            <Pressable
              key={i}
              onPress={() => pick(i)}
              style={[
                styles.choice,
                isRight && styles.choiceRight,
                isWrong && styles.choiceWrong,
              ]}
            >
              <Text style={styles.choiceTxt}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 10, flexDirection: "row", gap: 10 }}>
        <Pressable onPress={next} disabled={picked === null} style={[styles.choice, picked === null && { opacity: 0.6 }]}>
          <Text style={styles.choiceTxt}>Siguiente</Text>
        </Pressable>
        <Text style={[styles.quizQ, { opacity: 0.8 }]}>Aciertos: {score}</Text>
      </View>
    </View>
  );
}

/* =========================================================
   🖼️ Pantalla principal
   ========================================================= */
export default function B6_Tiendas() {
  useEffect(() => () => Speech.stop(), []);
  return (
    <View style={{ flex: 1 }}>
      <PrettyBG />
      <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>🏪 Tiendas</Text>
          <Text style={s.h}>Frases con audio + Tipos de tiendas + KanjiVG + Quiz</Text>
          <Text style={s.sub}>Contenido N5 con hiragana/katakana y diagramas KanjiVG para el trazo exacto.</Text>
        </View>

        {/* Frases (20) */}
        <View style={s.box}>
          <Text style={s.b}>🗣️ 20 frases útiles</Text>
          {FRASES_20.map((f, i) => <Phrase key={i} jp={f.jp} es={f.es} />)}
        </View>

        {/* Tipos de tiendas */}
        <View style={s.box}>
          <Text style={s.b}>🏬 Tipos de tiendas en Japón</Text>
          {STORE_TYPES.map((t, i) => <StoreTypeRow key={i} {...t} />)}
        </View>

        {/* Tips */}
        <View style={s.box}>
          <Text style={s.b}>💡 Tips rápidos para comprar</Text>
          {TIPS.map((t, i) => <TipItem key={i} {...t} />)}
        </View>

        {/* KanjiVG (exacto) */}
        <View style={s.box}>
          <Text style={s.b}>🈶 Kanji de compras（trazo exacto KanjiVG）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 12 }}>
            {KANJI_LIST.map((k) => <KanjiVGCard key={k.kanji} item={k} />)}
          </ScrollView>
          <Text style={styles.credit}>Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0</Text>
        </View>

        {/* Quiz 10 */}
        <QuizBlock />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   🎨 Estilos
   ========================================================= */
const WASHI = "rgba(255,255,255,0.92)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },
  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },

  box: {
    backgroundColor: "rgba(255,251,240,0.95)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  b: { fontWeight: "900", fontSize: 18, color: INK },
  t: { color: INK, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
});

const styles = StyleSheet.create({
  bgEmoji: { position: "absolute", fontSize: 42 },

  phraseRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  phraseJP: { fontSize: 16, fontWeight: "800", color: INK },
  phraseES: { fontSize: 14, opacity: 0.9, color: INK },
  playBtn: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* Tarjetas KanjiVG */
  kanjiCard: {
    width: 260, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  kanjiBig: { fontSize: 38, fontWeight: "900", color: INK, width: 52, textAlign: "center" },
  reading: { fontSize: 16, fontWeight: "800", color: INK },
  meaning: { fontSize: 14, color: INK, opacity: 0.85 },
  light: { opacity: 0.8, color: INK },
  speakBtn: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  svgBox: { alignItems: "center", justifyContent: "center", height: 240 },
  svgCaption: { fontSize: 12, color: INK, opacity: 0.8, marginTop: 6, textAlign: "center" },
  example: { color: INK, marginTop: 4 },

  credit: { fontSize: 11, color: INK, opacity: 0.7, marginTop: 6, textAlign: "center" },

  /* Store types */
  storeRow: { gap: 4, marginBottom: 8 },
  storeJP: { fontSize: 16, fontWeight: "900", color: INK },
  storeES: { color: INK, opacity: 0.95 },
  speakChip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* Tips */
  tipItem: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 8, marginBottom: 8, gap: 6,
  },
  tipTitle: { fontWeight: "800", color: INK },
  tipBody: { color: INK, flexShrink: 1 },
  tipJP: { color: INK, fontWeight: "800" },

  /* Quiz */
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  quizQ: { fontWeight: "900", color: INK },
  choice: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "white",
  },
  choiceTxt: { fontWeight: "800", color: INK },
  choiceRight: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.10)" },
  choiceWrong: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.10)" },
});
