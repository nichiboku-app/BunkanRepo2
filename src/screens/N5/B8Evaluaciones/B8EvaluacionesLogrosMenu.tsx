import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

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
   🌌 EndgameBG — Fondo (montaje diferido para carga rápida)
   ========================================================= */
export function EndgameBG() {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const wind = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const D = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const P = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const W = Animated.loop(
      Animated.sequence([
        Animated.timing(wind, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(wind, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    D.start(); P.start(); W.start();
    return () => { D.stop(); P.stop(); W.stop(); };
  }, [drift, pulse, wind]);

  const driftX = drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const driftXslow = drift.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const auraScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] });
  const ribbonShift = wind.interpolate({ inputRange: [0, 1], outputRange: [-120, 120] });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#081226", zIndex: 0 }]}>
      {/* Auras */}
      <Animated.View style={[stylesBG.ellipse, { top: -120, left: -80, backgroundColor: "rgba(90,220,255,0.10)", transform: [{ scale: auraScale }, { rotate: "-18deg" }] }]} />
      <Animated.View style={[stylesBG.ellipse, { top: -60, right: -120, backgroundColor: "rgba(250,140,255,0.10)", transform: [{ scale: auraScale }, { rotate: "22deg" }] }]} />
      <Animated.View style={[stylesBG.ellipse, { bottom: -140, left: -60, backgroundColor: "rgba(120,180,255,0.08)" }]} />

      {/* Auroras */}
      <Animated.View style={[stylesBG.ribbon, { top: 80, left: -160, transform: [{ translateX: ribbonShift }, { skewX: "18deg" }] }]} />
      <Animated.View style={[stylesBG.ribbonSoft, { top: 120, right: -160, transform: [{ translateX: Animated.multiply(ribbonShift, -1) }, { skewX: "-16deg" }] }]} />

      {/* Estrellas */}
      <StarField />
      <ShootingStar delay={300} startX={10} startY={40} />
      <ShootingStar delay={1800} startX={120} startY={70} />
      <ShootingStar delay={2800} startX={220} startY={110} />
      <ShootingStar delay={4200} startX={40} startY={150} />

      {/* Montañas */}
      <Animated.View style={{ transform: [{ translateX: driftX }] }}>
        <Mountain x={-30} y={260} size={180} color="#0c1a34" />
        <Mountain x={100} y={270} size={160} color="#0a1630" />
        <Mountain x={220} y={255} size={190} color="#0e1e3e" />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: driftXslow }] }}>
        <Mountain x={-10} y={300} size={220} color="#0a1832" />
        <Mountain x={180} y={305} size={210} color="#0b1a36" />
      </Animated.View>

      {/* Torii + faroles */}
      <Torii bottom={46} />
      <Lantern x={110} y={220} delay={0} />
      <Lantern x={230} y={226} delay={400} />
      <Lantern x={60} y={236} delay={800} />
    </View>
  );
}
function ShootingStar({ delay = 0, startX = 20, startY = 40, duration = 2200 }: { delay?: number; startX?: number; startY?: number; duration?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1800 + Math.random() * 2200),
      ])
    );
    anim.start(); return () => anim.stop();
  }, [delay, duration, t]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, 90] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View style={{ position: "absolute", left: startX, top: startY, transform: [{ translateX }, { translateY }, { rotateZ: "-20deg" }], opacity }}>
      <Text style={{ fontSize: 18, color: "#f7fbff" }}>✦</Text>
    </Animated.View>
  );
}
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: 10 + ((i * 27) % 340),
        top: 70 + ((i * 19) % 180),
        size: i % 7 === 0 ? 12 : 10,
        dly: (i * 123) % 2000,
      })),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => <Twinkle key={i} left={s.left} top={s.top} size={s.size} delay={s.dly} />)}
    </View>
  );
}
function Twinkle({ left, top, size = 10, delay = 0 }: { left: number; top: number; size?: number; delay?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    loop.start(); return () => loop.stop();
  }, [a, delay]);
  const opacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  return (
    <Animated.Text style={{ position: "absolute", left, top, fontSize: size, color: "#eaf4ff", opacity, transform: [{ scale }] }}>
      ✨
    </Animated.Text>
  );
}
function Mountain({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <View style={{
      position: "absolute",
      left: x, top: y, width: 0, height: 0,
      borderLeftWidth: size, borderRightWidth: size, borderBottomWidth: size * 0.8,
      borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color,
    }} />
  );
}
function Torii({ bottom = 40 }: { bottom?: number }) {
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom }}>
      <View style={{ alignSelf: "center", width: 280, height: 10, backgroundColor: "#4a1212", borderRadius: 6 }} />
      <View style={{ alignSelf: "center", width: 240, height: 8, marginTop: 6, backgroundColor: "rgba(106,22,22,1)", borderRadius: 6 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignSelf: "center", width: 280, marginTop: 8 }}>
        <View style={{ width: 20, height: 92, backgroundColor: "#571414", borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
        <View style={{ width: 20, height: 92, backgroundColor: "#571414", borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
      </View>
      <View style={{ alignSelf: "center", width: 210, height: 6, marginTop: 6, backgroundColor: "#3a0f0f", borderRadius: 4 }} />
    </View>
  );
}
function Lantern({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  const swing = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(swing, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start(); return () => anim.stop();
  }, [delay, swing]);

  const rotate = swing.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, transform: [{ rotate }] }}>
      <View style={{ width: 2, height: 16, backgroundColor: "rgba(255,255,255,0.6)", alignSelf: "center" }} />
      <View style={{ alignItems: "center" }}>
        <View style={stylesBG.lanternGlow} />
        <View style={stylesBG.lanternCore} />
        <View style={stylesBG.lanternCap} />
      </View>
    </Animated.View>
  );
}
const stylesBG = StyleSheet.create({
  ellipse: { position: "absolute", width: 380, height: 380, borderRadius: 9999 },
  ribbon: { position: "absolute", width: 420, height: 60, borderRadius: 40, backgroundColor: "rgba(80,200,255,0.12)" },
  ribbonSoft: { position: "absolute", width: 420, height: 50, borderRadius: 40, backgroundColor: "rgba(255,150,240,0.10)" },
  lanternCore: {
    width: 22, height: 22, borderRadius: 14, backgroundColor: "rgba(255,205,110,0.95)",
    elevation: 6, shadowColor: "#ffcf6e", shadowOpacity: 0.85, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  lanternGlow: { position: "absolute", width: 42, height: 42, borderRadius: 30, backgroundColor: "rgba(255,200,100,0.18)" },
  lanternCap: { width: 12, height: 4, backgroundColor: "rgba(150,60,18,0.9)", borderBottomLeftRadius: 6, borderBottomRightRadius: 6, marginTop: 2 },
});

/* =========================================================
   🧪 Hook mini-quiz genérico
   ========================================================= */
type Q = { stemJP?: string; stemES?: string; speak?: string; opts: string[]; correct: number };
function useMiniQuiz(qs: Q[]) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const total = qs.length;
  const done = i >= total;
  const q = done ? null : qs[i];

  const pick = (k: number, onResult?: (ok: boolean) => void) => {
    if (picked !== null || !q) return;
    const ok = k === q.correct;
    setPicked(k);
    if (ok) setScore(s => s + 1);
    onResult?.(ok);
  };
  const next = () => { if (!done) { setI(v => v + 1); setPicked(null); } };
  const reset = () => { setI(0); setPicked(null); setScore(0); };

  return { q, i, total, picked, score, done, pick, next, reset };
}

/* =========================================================
   🎉 Confeti por librería — 4 esquinas con +2s de retraso
   ========================================================= */
function useCornerConfetti() {
  const { width: W, height: H } = Dimensions.get("window");

  const [mounted, setMounted] = useState(false); // montaje perezoso
  // contadores para forzar remount de cada cañón
  const [fires, setFires] = useState({ tl: 0, tr: 0, bl: 0, br: 0 });

  const play = (opts?: { perCorner?: number; fallSpeed?: number; explosionSpeed?: number; fadeOut?: boolean }) => {
    if (!mounted) setMounted(true);
    const perCorner = opts?.perCorner ?? 80;
    const common = {
      count: perCorner,
      fadeOut: opts?.fadeOut ?? true,
      explosionSpeed: opts?.explosionSpeed ?? 250,
      fallSpeed: opts?.fallSpeed ?? 2500,
    };

    // Disparo secuencial por esquina: 0ms, +2000ms, +4000ms, +6000ms
    setFires((f) => ({ ...f, tl: f.tl + 1 }));
    setTimeout(() => setFires((f) => ({ ...f, tr: f.tr + 1 })), 2000);
    setTimeout(() => setFires((f) => ({ ...f, bl: f.bl + 1 })), 4000);
    setTimeout(() => setFires((f) => ({ ...f, br: f.br + 1 })), 6000);

    return common; // por si quieres reutilizar config
  };

  const Viewport = () => {
    if (!mounted) return null;
    const common = { count: 70, fadeOut: true, explosionSpeed: 250, fallSpeed: 2500 };

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { position: "absolute", zIndex: 9999, elevation: 9999 } // 👈 siempre por delante
        ]}
      >
        {fires.tl !== 0 && (
          <ConfettiCannon key={`tl-${fires.tl}`} autoStart {...common} origin={{ x: 0, y: 0 }} />
        )}
        {fires.tr !== 0 && (
          <ConfettiCannon key={`tr-${fires.tr}`} autoStart {...common} origin={{ x: W, y: 0 }} />
        )}
        {fires.bl !== 0 && (
          <ConfettiCannon key={`bl-${fires.bl}`} autoStart {...common} origin={{ x: 0, y: H }} />
        )}
        {fires.br !== 0 && (
          <ConfettiCannon key={`br-${fires.br}`} autoStart {...common} origin={{ x: W, y: H }} />
        )}
      </View>
    );
  };

  return { play, Viewport };
}

/* =========================================================
   🧊 Retos por tema (10×5)
   ========================================================= */
const QS_LISTEN: Q[] = [
  { stemES: "「こんにちは」", speak: "こんにちは", opts: ["Buen día", "Perdón", "Gracias"], correct: 0 },
  { stemES: "「すみません」", speak: "すみません", opts: ["Perdón / Disculpe", "Por favor", "Nos vemos"], correct: 0 },
  { stemES: "「いくら ですか」", speak: "いくら ですか", opts: ["¿Cuánto cuesta?", "¿Dónde?", "¿Qué hora?"], correct: 0 },
  { stemES: "「みず を ください」", speak: "みず を ください", opts: ["Agua, por favor", "Sal, por favor", "Cuenta, por favor"], correct: 0 },
  { stemES: "「トイレ は どこ ですか」", speak: "トイレ は どこ ですか", opts: ["¿Dónde está el baño?", "¿Dónde está la tienda?", "¿Dónde está la estación?"], correct: 0 },
];
const QS_SHOP: Q[] = [
  { stemES: "Lectura de 100円", speak: "ひゃくえん", opts: ["ひゃくえん", "せんえん", "いちまん"], correct: 0 },
  { stemJP: "この サイズ は ありますか。", stemES: "Elige el significado", opts: ["¿Tiene esta talla?", "¿Es gratis?", "¿Dónde está la caja?"], correct: 0 },
  { stemJP: "カード つかえますか。", stemES: "Significado", opts: ["¿Aceptan tarjeta?", "¿Hay agua?", "¿Dónde el tren?"], correct: 0 },
  { stemES: "「れしーと を ください」", opts: ["El recibo, por favor", "La mesa, por favor", "El mapa, por favor"], correct: 0 },
  { stemES: "Para probar ropa", opts: ["しちゃく できますか", "よやく が あります", "のりかえ どこ ですか"], correct: 0 },
];
const QS_DIR: Q[] = [
  { stemES: "「まっすぐ」", speak: "まっすぐ", opts: ["Recto", "Derecha", "Izquierda"], correct: 0 },
  { stemES: "「みぎ」", speak: "みぎ", opts: ["Derecha", "Izquierda", "Atrás"], correct: 0 },
  { stemES: "「ひだり」", speak: "ひだり", opts: ["Izquierda", "Recto", "Parada"], correct: 0 },
  { stemJP: "えき は どこ ですか。", stemES: "Significado", opts: ["¿Dónde está la estación?", "¿Dónde está el dinero?", "¿Dónde está la luna?"], correct: 0 },
  { stemJP: "ここ まで おねがい します。", stemES: "Situación", opts: ["Taxi: aquí, por favor", "Tienda: esto, por favor", "Hotel: mañana, por favor"], correct: 0 },
];
const QS_EMER: Q[] = [
  { stemES: "「たすけて ください」", speak: "たすけて ください", opts: ["¡Ayuda, por favor!", "¡Alto!", "Adiós"], correct: 0 },
  { stemES: "「けいさつ」", speak: "けいさつ", opts: ["Policía", "Hospital", "Tienda"], correct: 0 },
  { stemJP: "よやく が あります。", stemES: "En hotel", opts: ["Tengo reserva", "No tengo comida", "Quiero mapa"], correct: 0 },
  { stemJP: "チェックイン おねがい します。", stemES: "En hotel", opts: ["Quiero hacer check-in", "Quiero comprar agua", "Quiero pagar en yenes"], correct: 0 },
  { stemJP: "びょういん は どこ ですか。", stemES: "Pregunta", opts: ["¿Dónde está el hospital?", "¿Dónde está el hotel?", "¿Dónde está la tienda?"], correct: 0 },
];
const QS_RESTA: Q[] = [
  { stemJP: "すみません、メニュー ください。", stemES: "Significado", opts: ["El menú, por favor", "La cuenta, por favor", "Más agua, por favor"], correct: 0 },
  { stemJP: "おすすめ は なん ですか。", stemES: "Significado", opts: ["¿Cuál es la recomendación?", "¿Cuánto cuesta?", "¿Es picante?"], correct: 0 },
  { stemJP: "みず もう 1つ ください。", stemES: "Situación", opts: ["Más agua, por favor", "Más arroz, por favor", "Más sal, por favor"], correct: 0 },
  { stemJP: "べつべつ で おねがい します。", stemES: "En caja", opts: ["Por separado, por favor", "Todo junto, por favor", "Sin pagar"], correct: 0 },
  { stemJP: "おかいけい おねがい します。", stemES: "Frase", opts: ["La cuenta, por favor", "El baño, por favor", "El tren, por favor"], correct: 0 },
];
const QS_TRAIN: Q[] = [
  { stemJP: "えき は どこ ですか。", stemES: "Significado", opts: ["¿Dónde está la estación?", "¿Dónde está el hotel?", "¿Dónde está el dinero?"], correct: 0 },
  { stemJP: "きっぷ 1まい ください。", stemES: "Frase", opts: ["Un boleto, por favor", "Un agua, por favor", "Un mapa, por favor"], correct: 0 },
  { stemJP: "とうきょう いき ですか。", stemES: "Pregunta", opts: ["¿Va a Tokio?", "¿Va al baño?", "¿Va al hotel?"], correct: 0 },
  { stemJP: "のりかえ は どこ ですか。", stemES: "Pregunta", opts: ["¿Dónde es el transbordo?", "¿Dónde es la cena?", "¿Dónde es la tienda?"], correct: 0 },
  { stemJP: "でんしゃ は なんじ ですか。", stemES: "Pregunta", opts: ["¿A qué hora es el tren?", "¿Cuánto cuesta?", "¿Dónde estoy?"], correct: 0 },
];
const QS_TIME: Q[] = [
  { stemJP: "いま なんじ ですか。", stemES: "Pregunta", opts: ["¿Qué hora es?", "¿Dónde estoy?", "¿Cuánto cuesta?"], correct: 0 },
  { stemES: "7:00 se lee…", speak: "しちじ", opts: ["しちじ", "ななじ", "しちご"], correct: 0 },
  { stemES: "“lunes” (día) es…", speak: "げつようび", opts: ["げつようび", "かようび", "すいようび"], correct: 0 },
  { stemES: "“fin de semana”", opts: ["どようび と にちようび", "げつようび と かようび", "すいようび と もくようび"], correct: 0 },
  { stemES: "“mañana / tarde / noche”", opts: ["あさ・ひる・よる", "きょう・あした・きのう", "うえ・した・なか"], correct: 0 },
];
const QS_WEATHER: Q[] = [
  { stemJP: "きょう は あつい です。", stemES: "Significado", opts: ["Hoy hace calor", "Hoy hace frío", "Hoy llueve"], correct: 0 },
  { stemJP: "きょう は さむい です。", stemES: "Significado", opts: ["Hoy hace frío", "Hoy hace viento", "Hoy está nublado"], correct: 0 },
  { stemJP: "あめ です。かさ ありますか。", stemES: "Frase", opts: ["Llueve. ¿Tienes paraguas?", "Nieva. ¿Tienes café?", "Viento. ¿Tienes tren?"], correct: 0 },
  { stemJP: "はれ です。", stemES: "Significado", opts: ["Está despejado", "Está nublado", "Está nevando"], correct: 0 },
  { stemES: "Ropa para frío", opts: ["こーと と まふらー", "T-shirt と さんだる", "ゆかた（verano）"], correct: 0 },
];
const QS_FAMILY: Q[] = [
  { stemJP: "かぞく です。", stemES: "Significado", opts: ["Es mi familia", "Es mi dinero", "Es mi tren"], correct: 0 },
  { stemJP: "ちち と はは", stemES: "Se refiere a…", opts: ["Padre y madre", "Hermano y hermana", "Abuelo y abuela"], correct: 0 },
  { stemJP: "いもうと", stemES: "Palabra", opts: ["Hermana menor", "Hermano menor", "Tía"], correct: 0 },
  { stemJP: "おとうと", stemES: "Palabra", opts: ["Hermano menor", "Hermana menor", "Primo"], correct: 0 },
  { stemJP: "ともだち と あいます。", stemES: "Frase", opts: ["Me encuentro con un amigo", "Compro agua", "Duermo"], correct: 0 },
];
const QS_CULTURE: Q[] = [
  { stemJP: "いただきます。", stemES: "Momento", opts: ["Antes de comer", "Después de comer", "Al entrar al tren"], correct: 0 },
  { stemJP: "ごちそうさまでした。", stemES: "Momento", opts: ["Después de comer", "Antes de dormir", "Al pagar"], correct: 0 },
  { stemJP: "くつ を ぬぎます。", stemES: "Situación", opts: ["Me quito los zapatos", "Me pongo el abrigo", "Me siento"], correct: 0 },
  { stemJP: "ならびます。", stemES: "Acción", opts: ["Hago fila", "Corro", "Canto"], correct: 0 },
  { stemJP: "ごみ は どこ ですか。", stemES: "Pregunta", opts: ["¿Dónde va la basura?", "¿Dónde está el bus?", "¿Dónde está el hotel?"], correct: 0 },
];

/* =========================================================
   🎖️ Config de modos
   ========================================================= */
const MODES = [
  { key: "listening",  label: "Escucha",      icon: "ear-outline",       qs: QS_LISTEN },
  { key: "shop",       label: "Compras",      icon: "pricetag-outline",  qs: QS_SHOP },
  { key: "directions", label: "Direcciones",  icon: "navigate-outline",  qs: QS_DIR },
  { key: "help",       label: "Ayuda/Hotel",  icon: "medical-outline",   qs: QS_EMER },
  { key: "restaurant", label: "Restaurante",  icon: "fast-food-outline", qs: QS_RESTA },
  { key: "train",      label: "Tren",         icon: "train-outline",     qs: QS_TRAIN },
  { key: "time",       label: "Días/Hora",    icon: "time-outline",      qs: QS_TIME },
  { key: "weather",    label: "Clima",        icon: "cloud-outline",     qs: QS_WEATHER },
  { key: "family",     label: "Familia",      icon: "people-outline",    qs: QS_FAMILY },
  { key: "culture",    label: "Cultura",      icon: "star-outline",      qs: QS_CULTURE },
] as const;
type ModeKey = typeof MODES[number]["key"];

/* =========================================================
   🏅 Medalla + Logro Platino
   ========================================================= */
function Medal({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[styles.medal, active ? styles.medalOn : styles.medalOff]}>
      <Text style={styles.medalIcon}>{active ? "🏅" : "🎗️"}</Text>
      <Text style={styles.medalTxt}>{label}</Text>
    </View>
  );
}
function PlatinumBadge() {
  return (
    <View style={styles.platinumCard}>
      <Text style={styles.platinumIcon}>🦝💎</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.platinumTitle}>Logro Platino — nivel mapache</Text>
        <Text style={styles.platinumSub}>Todas correctas en todo el bloque. ¡Impecable!</Text>
      </View>
    </View>
  );
}

/* =========================================================
   🧩 Bloque evaluable reutilizable
   ========================================================= */
function EvalBlock({
  title,
  qs,
  onFinish,
  onPerfectMode,
  onMedalMode,
}: {
  title: string;
  qs: Q[];
  onFinish: (score: number, total: number) => void;
  onPerfectMode: () => void;
  onMedalMode: () => void;
}) {
  const { q, i, total, picked, score, done, pick, next, reset } = useMiniQuiz(qs);
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  useEffect(() => { return () => { Speech.stop(); }; }, []);

  if (done) {
    const gotAll = score === total;
    const gotMedal = score >= Math.ceil(total * 0.8);
    return (
      <View style={s.box}>
        <View style={styles.cardHeader}>
          <Ionicons name="ribbon-outline" size={18} color="#2e2e2e" />
          <Text style={styles.cardTitle}>{title} — Resultado</Text>
        </View>
        <Text style={styles.resultTxt}>Puntuación: {score} / {total}</Text>
        {gotAll && <Text style={[styles.resultTxt, { color: "#0a7a0a" }]}>¡Perfecto!</Text>}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
          <Pressable onPress={() => {
            if (gotAll) onPerfectMode(); else if (gotMedal) onMedalMode();
            onFinish(score, total);
          }} style={styles.btn}>
            <Text style={styles.btnTxt}>Guardar</Text>
          </Pressable>
          <Pressable onPress={() => { reset(); }} style={styles.btnGhost}>
            <Text style={styles.btnGhostTxt}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="school-outline" size={18} color="#2e2e2e" />
        <Text style={styles.cardTitle}>{title} — {i + 1}/{total}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {!!q?.stemJP && <Text style={styles.jp}>{q.stemJP}</Text>}
        {!!q?.stemES && <Text style={styles.es}>{q.stemES}</Text>}
        {!!q?.speak && (
          <Pressable onPress={() => speakJP(q.speak!)} style={styles.speakChip}>
            <Ionicons name="volume-high-outline" size={16} color="#2e2e2e" />
          </Pressable>
        )}
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        {q?.opts.map((o, idx) => {
          const isPicked = picked === idx;
          const isRight = picked !== null && idx === q.correct;
          const isWrong = picked !== null && isPicked && idx !== q.correct;
          return (
            <Pressable
              key={idx}
              onPress={() => { pick(idx, (ok) => { if (ready) (ok ? playCorrect() : playWrong()); }); }}
              style={[styles.choice, isRight && styles.choiceRight, isWrong && styles.choiceWrong]}
            >
              <Text style={styles.choiceTxt}>{o}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 10, flexDirection: "row", gap: 10 }}>
        <Pressable onPress={next} disabled={picked === null} style={[styles.btn, picked === null && { opacity: 0.6 }]}>
          <Text style={styles.btnTxt}>Siguiente</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   🎯 Pantalla principal
   ========================================================= */
export default function B8EvaluacionesLogrosMenu() {
  const { play: playCorners, Viewport: ConfettiViewport } = useCornerConfetti();

  const [open, setOpen] = useState<ModeKey | null>(null);
  const [bgReady, setBgReady] = useState(false); // para carga percibida más rápida

  // Monta el fondo animado después del primer frame + interacción
  useEffect(() => {
    let canceled = false;
    requestAnimationFrame(() => {
      InteractionManager.runAfterInteractions(() => {
        if (!canceled) setBgReady(true);
      });
    });
    return () => { canceled = true; };
  }, []);

  const [scores, setScores] = useState<Record<ModeKey, number>>(
    () => MODES.reduce((acc, m) => (acc[m.key as ModeKey] = 0, acc), {} as Record<ModeKey, number>)
  );

  const totalsByMode = useMemo(() => {
    const o: Record<ModeKey, number> = {} as any;
    MODES.forEach(m => { o[m.key as ModeKey] = m.qs.length; });
    return o;
  }, []);

  const totalScore = useMemo(() => MODES.reduce((sum, m) => sum + (scores[m.key as ModeKey] || 0), 0), [scores]);
  const totalMax = useMemo(() => MODES.reduce((sum, m) => sum + m.qs.length, 0), []);
  const rank = totalScore >= totalMax * 0.9 ? "S" : totalScore >= totalMax * 0.75 ? "A" : totalScore >= totalMax * 0.6 ? "B" : "C";
  const got = (key: ModeKey) => (scores[key] ?? 0) >= Math.ceil((totalsByMode[key] ?? 5) * 0.8);
  const isPlatinum = totalScore === totalMax && totalMax > 0;

  const platinumShownRef = useRef(false);
  useEffect(() => {
    if (isPlatinum && !platinumShownRef.current) {
      platinumShownRef.current = true;
      // platino → lanza secuencia por esquinas
      playCorners({ perCorner: 120, fallSpeed: 2600, explosionSpeed: 220, fadeOut: true });
    }
  }, [isPlatinum, playCorners]);

  const saveScore = (key: ModeKey) => (sc: number, _tot: number) => {
    setScores((s) => ({ ...s, [key]: Math.max(s[key] ?? 0, sc) }));
    setOpen(null);
  };

  useEffect(() => { return () => { Speech.stop(); }; }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Fondo épico (montaje diferido para que el contenido salga rápido) */}
      {bgReady && <EndgameBG />}

      {/* Contenido */}
      <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>B8 — Evaluaciones y logros</Text>
          <Text style={s.h}>¡Último empujón! 10 modos × 5 preguntas</Text>
          <Text style={s.sub}>Frases sencillas, poco kanji (ej. 円), sin forma -て. Con audio y feedback.</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.round((totalScore / totalMax) * 100)}%` }]} />
          </View>
          <Text style={styles.progressTxt}>Progreso: {totalScore} / {totalMax} • Rango: {rank}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 8, alignItems: "center" }}>
            <Pressable onPress={() => playCorners({ perCorner: 90 })} style={styles.btn}>
              <Text style={styles.btnTxt}>🎉 Probar confeti</Text>
            </Pressable>
            {isPlatinum && <PlatinumBadge />}
          </View>
        </View>

        {/* Medallas */}
        <View style={s.box}>
          <Text style={s.b}>🏅 Medallas</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MODES.map(m => (
              <Medal key={m.key} active={got(m.key as ModeKey)} label={m.label} />
            ))}
          </View>
        </View>

        {/* Selector de modos */}
        {open === null && (
          <View style={s.box}>
            <Text style={s.b}>Elige un reto</Text>
            <View style={styles.modeGrid}>
              {MODES.map((m) => (
                <ModeBtn
                  key={m.key}
                  icon={m.icon as any}
                  label={m.label}
                  subtitle={`${scores[m.key as ModeKey] ?? 0}/${totalsByMode[m.key as ModeKey] ?? m.qs.length}`}
                  onPress={() => setOpen(m.key as ModeKey)}
                />
              ))}
            </View>
            <Text style={styles.hint}>Tip: 80% o más en un modo = medalla 🏅. Todas correctas en TODOS los modos = 🦝💎 Platino.</Text>
          </View>
        )}

        {/* Bloques evaluables */}
        {MODES.map((m) =>
          open === (m.key as ModeKey) ? (
            <EvalBlock
              key={m.key}
              title={m.label}
              qs={m.qs}
              onFinish={saveScore(m.key as ModeKey)}
              onPerfectMode={() => playCorners({ perCorner: 100 })}
              onMedalMode={() => playCorners({ perCorner: 70 })}
            />
          ) : null
        )}

        {/* Cierre */}
        <View style={s.box}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy-outline" size={18} color="#2e2e2e" />
            <Text style={styles.cardTitle}>Cierre</Text>
          </View>
          <Text style={styles.es}>
            Completa las 10 medallas para celebrar con confeti. Si logras todas correctas en todo el bloque, ganas el
            <Text style={{ fontWeight: "900" }}> Logro Platino — nivel mapache</Text> 🦝💎.
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={() => {
                const msg = isPlatinum ? "かんぺき！プラチナ ランク、マパチェ！" : `すばらしい！ランク は ${rank}。`;
                speakJP(msg);
              }}
              style={styles.btn}
            >
              <Text style={styles.btnTxt}>🔊 Felicitación</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const zero = MODES.reduce((acc, m) => (acc[m.key as ModeKey] = 0, acc), {} as Record<ModeKey, number>);
                (platinumShownRef as any).current = false;
                setScores(zero);
              }}
              style={styles.btnGhost}
            >
              <Text style={styles.btnGhostTxt}>Reiniciar progreso</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confeti SIEMPRE al frente */}
      <ConfettiViewport />
    </View>
  );
}

/* =========================================================
   UI helpers & estilos
   ========================================================= */
function ModeBtn({ icon, label, subtitle, onPress }: { icon: any; label: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.modeBtn}>
      <Ionicons name={icon} size={20} color="#2e2e2e" />
      <Text style={styles.modeLbl}>{label}</Text>
      {!!subtitle && <Text style={styles.modeSub}>{subtitle}</Text>}
    </Pressable>
  );
}

const WASHI = "rgba(255,255,255,0.92)";
const BORDER = "#e8e2cc";
const INK = "#2e2e2e";

const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },
  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 8 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { color: INK, opacity: 0.9 },
  box: {
    backgroundColor: "rgba(255,251,240,0.95)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  b: { fontWeight: "900", fontSize: 18, color: INK },
});

const styles = StyleSheet.create({
  /* Progreso */
  progressBar: {
    height: 10, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
  },
  progressFill: { height: "100%", backgroundColor: "rgba(255,220,120,0.9)" },
  progressTxt: { marginTop: 6, color: INK, fontWeight: "800" },

  /* Medallas */
  medal: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  medalOn:  { borderColor: "#ffd24d", backgroundColor: "rgba(255,210,77,0.15)" },
  medalOff: { borderColor: BORDER, backgroundColor: "rgba(255,255,255,0.7)" },
  medalIcon: { fontSize: 18 },
  medalTxt: { fontWeight: "800", color: INK },

  /* Logro Platino */
  platinumCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "#cfe8ff", backgroundColor: "rgba(200,230,255,0.25)",
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14,
  },
  platinumIcon: { fontSize: 22 },
  platinumTitle: { fontWeight: "900", color: INK },
  platinumSub: { color: INK, opacity: 0.9, fontSize: 12 },

  /* Card y textos */
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  es: { color: INK },
  resultTxt: { fontWeight: "900", color: INK, marginTop: 6 },

  /* Botones */
  btn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "rgba(255,255,255,0.96)",
  },
  btnTxt: { fontWeight: "800", color: INK },
  btnGhost: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "transparent",
  },
  btnGhostTxt: { fontWeight: "800", opacity: 0.8, color: INK },

  /* Opciones */
  choice: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  choiceTxt: { fontWeight: "800", color: INK },
  choiceRight: { borderColor: "#61c96f", backgroundColor: "rgba(97,201,111,0.12)" },
  choiceWrong: { borderColor: "#e36a6a", backgroundColor: "rgba(227,106,106,0.12)" },

  /* Selección de modos */
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeBtn: {
    width: "48%", minHeight: 66,
    borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 10,
    backgroundColor: "rgba(255,255,255,0.96)", gap: 6,
  },
  modeLbl: { fontWeight: "900", color: INK },
  modeSub: { color: INK, opacity: 0.8, fontSize: 12 },

  /* Tips */
  hint: { color: INK, opacity: 0.9, marginTop: 6 },

  /* Chip de TTS */
  speakChip: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "rgba(255,255,255,0.96)"
  },
});
