import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AccessibilityRole, StyleProp, ViewStyle } from "react-native";
import {
  Animated,
  Easing,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";

// ✅ Hook global de sonidos (tu ruta real)
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

// React Native Aria
import { useButton } from "@react-native-aria/button";
import { useFocusRing } from "@react-native-aria/focus";
import { usePress } from "@react-native-aria/interactions";

/* ================== Tipos & Datos ================== */
type Place = {
  key: string;
  kana: string;
  ro: string;
  es: string;
  emoji?: string;
  x: number;
  y: number;
};
type PressState = { pressed: boolean; focused: boolean };

function speakJA(t: string) {
  if (!t) return;
  try {
    Speech.stop();
    Speech.speak(t, { language: "ja-JP", rate: 0.98 });
  } catch {}
}
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* === Metadatos del bloque/pantalla === */
const BLOCK_ID = "N5-B3";
const SCREEN_ID = "B3_LugaresCiudad";

/* === Lugares (8 hotspots) === */
const PLACES: Place[] = [
  { key: "eki",         kana: "えき",         ro: "eki",         es: "estación",     emoji: "🚉", x: 0.12, y: 0.15 },
  { key: "ginkou",      kana: "ぎんこう",     ro: "ginkō",       es: "banco",        emoji: "🏦", x: 0.35, y: 0.28 },
  { key: "yuubinkyoku", kana: "ゆうびんきょく", ro: "yūbinkyoku", es: "correo",       emoji: "📮", x: 0.78, y: 0.20 },
  { key: "toshokan",    kana: "としょかん",   ro: "toshokan",    es: "biblioteca",   emoji: "📚", x: 0.65, y: 0.40 },
  { key: "byouin",      kana: "びょういん",   ro: "byōin",       es: "hospital",     emoji: "🏥", x: 0.18, y: 0.55 },
  { key: "suupaa",      kana: "スーパー",     ro: "sūpā",        es: "supermercado", emoji: "🛒", x: 0.42, y: 0.62 },
  { key: "resutoran",   kana: "レストラン",   ro: "resutoran",   es: "restaurante",  emoji: "🍽️", x: 0.80, y: 0.58 },
  { key: "kouen",       kana: "こうえん",     ro: "kōen",        es: "parque",       emoji: "🌳", x: 0.55, y: 0.80 },
];

/* ================== Botón accesible reutilizable ================== */
type AriaButtonProps = {
  label: string; // accessibilityLabel
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((states: PressState) => StyleProp<ViewStyle>);
  role?: AccessibilityRole;
};
function AriaButton({
  label,
  onPress,
  disabled,
  children,
  style,
  role = "button",
}: AriaButtonProps) {
  const ref = React.useRef<any>(null);

  const { buttonProps, isPressed } = useButton(
    { onPress, isDisabled: disabled },
    ref
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  usePress({ isDisabled: disabled }); // opcional; útil si luego quieres hover/longPress

  const resolvedStyle: StyleProp<ViewStyle> =
    typeof style === "function"
      ? style({ pressed: !!isPressed, focused: isFocusVisible })
      : style;

  return (
    <RNPressable
      ref={ref}
      {...buttonProps}
      {...focusProps}
      accessibilityRole={role}
      accessibilityLabel={label}
      // ⛔ no poner `pressed` en accessibilityState (tu SDK no lo tipa)
      accessibilityState={{ disabled: !!disabled }}
      style={resolvedStyle}
    >
      {children}
    </RNPressable>
  );
}

/* ================== Pantalla ================== */
export default function B3_LugaresCiudad() {
  const { width } = useWindowDimensions();
  const MAP_SIZE = Math.min(width - 32, 520);

  // ✅ Hook global de sonidos
  const { playCorrect, playWrong, ready: soundsReady } = useFeedbackSounds();

  const [mode, setMode] = useState<"explore" | "quiz">("quiz");

  const rounds = 6;
  const deck = useMemo(() => shuffle(PLACES).slice(0, rounds), []);
  const [i, setI] = useState(0);
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [okCount, setOkCount] = useState(0);
  const target = deck[i];

  // Animación de “pulso” sobre objetivo mientras no eliges
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const onPick = useCallback(async (place: Place) => {
    if (mode === "explore") {
      speakJA(place.kana);
      Vibration.vibrate(10);
      return;
    }
    if (pickedKey) return;

    setPickedKey(place.key);
    const ok = place.key === target.key;

    try {
      if (ok) {
        setOkCount((s) => s + 1);         // ✅ suma puntos locales
        Vibration.vibrate(25);
        await playCorrect();               // ✅ sonido “correct”
      } else {
        Vibration.vibrate([0, 15, 60, 15]);
        await playWrong();                 // ✅ sonido “wrong”
      }
    } catch {}
    speakJA(place.kana);                   // ✅ voz
  }, [mode, pickedKey, target, playCorrect, playWrong]);

  const next = () => {
    if (i + 1 >= deck.length) {
      setI(0);
      setPickedKey(null);
      setOkCount(0);
      return;
    }
    setI((v) => v + 1);
    setPickedKey(null);
  };

  const placeColor = (p: Place) => {
    if (mode === "explore") return "#ffffff";
    if (!pickedKey) return "#ffffff";
    if (p.key === target.key) return "#e6f7ee"; // correcto
    if (p.key === pickedKey) return "#fde2e2";  // mal elegido
    return "#ffffff";
  };
  const placeBorder = (p: Place) => {
    if (mode === "explore") return "#e5e7eb";
    if (!pickedKey) return "#e5e7eb";
    if (p.key === target.key) return "#2fb344";
    if (p.key === pickedKey) return "#e03131";
    return "#e5e7eb";
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />

      <ScrollView contentContainerStyle={s.c}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>Lugares de la ciudad — まち の ばしょ</Text>
          <Text style={s.jpSub}>〜 は どこ ですか。／ 〜 は どこに ありますか。</Text>
          <View style={s.tagsRow}>
            <Tag label="マップ" />
            <Tag label={mode === "explore" ? "探索" : "クイズ"} />
            <Tag label={soundsReady ? "音✅" : "音…"} />
          </View>

          {/* Segment con Aria */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <AriaButton
              label="Cambiar a Explorar"
              onPress={() => setMode("explore")}
              style={({ pressed, focused }: PressState) => [
                btn.segment,
                mode === "explore" && btn.segmentActive,
                pressed && { opacity: 0.85 },
                focused && btn.focusRing,
              ]}
            >
              <Text style={[btn.segmentTxt, mode === "explore" && btn.segmentTxtActive]}>Explorar</Text>
            </AriaButton>

            <AriaButton
              label="Cambiar a Quiz"
              onPress={() => setMode("quiz")}
              style={({ pressed, focused }: PressState) => [
                btn.segment,
                mode === "quiz" && btn.segmentActive,
                pressed && { opacity: 0.85 },
                focused && btn.focusRing,
              ]}
            >
              <Text style={[btn.segmentTxt, mode === "quiz" && btn.segmentTxtActive]}>Quiz</Text>
            </AriaButton>
          </View>
        </View>

        <MiniGuide />

        {/* ====== MAPA ====== */}
        <View style={s.card}>
          <Text style={s.h2}>Mapa interactivo (toca cada lugar)</Text>
          <Text style={[s.p, { marginTop: 6 }]}>
            {mode === "quiz"
              ? <>¿Dónde está <Text style={s.bold}>{target.es}</Text>? <Text style={s.kbd}>{target.es}</Text> は どこ ですか。</>
              : <>Toca un lugar para escuchar su pronunciación.</>}
          </Text>

          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Mapa de la ciudad con ocho lugares interactivos"
            style={[stylesMap.canvas, { width: MAP_SIZE, height: MAP_SIZE }]}
          >
            {/* Calles */}
            <View style={[stylesMap.roadH, { top: MAP_SIZE * 0.22 }]} />
            <View style={[stylesMap.roadH, { top: MAP_SIZE * 0.50 }]} />
            <View style={[stylesMap.roadH, { top: MAP_SIZE * 0.78 }]} />
            <View style={[stylesMap.roadV, { left: MAP_SIZE * 0.22 }]} />
            <View style={[stylesMap.roadV, { left: MAP_SIZE * 0.50 }]} />
            <View style={[stylesMap.roadV, { left: MAP_SIZE * 0.78 }]} />

            {/* Hotspots */}
            {PLACES.slice(0, 8).map((p) => {
              const left = p.x * MAP_SIZE - 28;
              const top = p.y * MAP_SIZE - 28;
              const isTarget = p.key === target.key;
              const chosen = !!pickedKey;
              const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

              return (
                <Animated.View
                  key={p.key}
                  style={[
                    stylesMap.placeWrap,
                    { left, top, transform: isTarget && mode === "quiz" && !chosen ? [{ scale }] : [] },
                  ]}
                >
                  <AriaButton
                    label={`${p.es} (${p.kana})`}
                    onPress={() => onPick(p)}
                    style={({ pressed, focused }: PressState) => ([
                      stylesMap.place,
                      { backgroundColor: placeColor(p), borderColor: placeBorder(p) },
                      pressed && { transform: [{ scale: 0.97 }] },
                      focused && stylesMap.placeFocus,
                    ])}
                  >
                    <>
                      <Text style={stylesMap.placeEmoji}>{p.emoji ?? "📍"}</Text>
                      <Text style={stylesMap.placeEs}>{p.es}</Text>
                      <Text style={stylesMap.placeKana}>{p.kana}</Text>
                    </>
                  </AriaButton>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ====== PRACTICA QUIZ ====== */}
        <View style={[s.card, { marginTop: 14 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Práctica: ¿Dónde está…?</Text>
            <Text style={s.meta}>Puntos: {okCount} / {rounds}</Text>
          </View>

          <AriaButton
            label="Reproducir ejemplo en japonés"
            onPress={() => speakJA(`${target.kana} は どこ ですか。`)}
            style={({ pressed, focused }: PressState) => ([
              btn.play,
              { alignSelf: "flex-start", marginTop: 8 },
              pressed && { opacity: 0.85 },
              focused && btn.focusRing,
            ])}
          >
            <Text style={btn.playTxt}>▶︎ Ejemplo</Text>
          </AriaButton>

          <AriaButton
            label="Siguiente pregunta"
            onPress={next}
            disabled={mode === "quiz" && !pickedKey}
            style={({ pressed, focused }: PressState) => ([
              s.primaryBtn,
              { marginTop: 12, opacity: (mode === "quiz" && !pickedKey) ? 0.5 : 1 },
              pressed && { transform: [{ scale: 0.99 }] },
              focused && btn.focusRing,
            ])}
          >
            <Text style={s.primaryBtnText}>
              {i + 1 >= rounds ? "Reiniciar" : "Siguiente"}
            </Text>
          </AriaButton>
        </View>

        {/* ===== Vocabulario ===== */}
        <View style={[s.card, { marginTop: 14 }]}>
          <Text style={s.h2}>Vocabulario (vista rápida)</Text>
          <Text style={[s.p, { marginTop: 6 }]}>Toca para escuchar la pronunciación.</Text>
          <View style={[s.grid, { marginTop: 10 }]}>
            {PLACES.slice(0, 8).map((p) => (
              <View key={p.key} style={s.smallCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={s.emoji}>{p.emoji ?? "📍"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{p.es}</Text>
                    <Text style={s.cardJP}>{p.kana}</Text>
                  </View>
                  <AriaButton
                    label={`Escuchar ${p.es} en japonés`}
                    onPress={() => speakJA(p.kana)}
                    style={({ pressed, focused }: PressState) => ([
                      btn.iconBtn,
                      pressed && { transform: [{ scale: 0.96 }] },
                      focused && btn.focusRing,
                    ])}
                  >
                    <Ionicons name="volume-high-outline" size={16} color={CRIMSON} />
                  </AriaButton>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/* ================== Mini Guía ================== */
function MiniGuide() {
  const [romaji, setRomaji] = useState(true);
  const [esp, setEsp] = useState(true);

  const ex = [
    { ja: "としょかん は どこ ですか。", ro: "toshokan wa doko desu ka?", es: "¿Dónde está la biblioteca?" },
    { ja: "としょかん は あそこ です。", ro: "toshokan wa asoko desu.", es: "La biblioteca está allá." },
    { ja: "えき は ここ です。",         ro: "eki wa koko desu.",        es: "La estación está aquí." },
    { ja: "ゆうびんきょく は どこに ありますか。", ro: "yūbinkyoku wa doko ni arimasu ka?", es: "¿Dónde se encuentra el correo?" },
    { ja: "こうえん は そこに あります。",       ro: "kōen wa soko ni arimasu.",       es: "El parque está ahí." },
  ];

  return (
    <View style={s.card}>
      <Text style={s.h2}>Mini-guía: どこですか vs どこにありますか</Text>
      <Text style={s.p}>
        <Text style={s.kbd}>〜 は どこ ですか。</Text> = “¿dónde está ~?” (ubicación).{"\n"}
        <Text style={s.kbd}>〜 は どこに ありますか。</Text> = “¿en qué lugar se encuentra ~?” (enfatiza sitio).{"\n"}
        Con seres vivos: <Text style={s.kbd}>います</Text>; con objetos/lugares: <Text style={s.kbd}>あります</Text>.
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <AriaButton
          label="Alternar rōmaji"
          onPress={() => setRomaji((v) => !v)}
          style={({ pressed, focused }: PressState) => ([btn.outline, pressed && { opacity: 0.85 }, focused && btn.focusRing])}
        >
          <Text style={btn.outlineTxt}>{romaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}</Text>
        </AriaButton>
        <AriaButton
          label="Alternar español"
          onPress={() => setEsp((v) => !v)}
          style={({ pressed, focused }: PressState) => ([btn.outline, pressed && { opacity: 0.85 }, focused && btn.focusRing])}
        >
          <Text style={btn.outlineTxt}>{esp ? "Ocultar ES" : "Mostrar ES"}</Text>
        </AriaButton>
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        {ex.map((e, i) => (
          <View key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.line}>{e.ja}</Text>
              <AriaButton
                label="Escuchar oración"
                onPress={() => speakJA(e.ja)}
                style={({ pressed, focused }: PressState) => ([btn.iconBtn, pressed && { transform: [{ scale: 0.96 }] }, focused && btn.focusRing])}
              >
                <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
              </AriaButton>
            </View>
            {romaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
            {esp ? <Text style={s.es}>{e.es}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ================== Helpers ================== */
function Tag({ label }: { label: string }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagTxt}>{label}</Text>
    </View>
  );
}

/* ================== Sakura background ================== */
function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.round(Math.random() * 10);
        const x = Math.round(Math.random() * (width - size));
        const delay = Math.round(Math.random() * 2500);
        const rotStart = Math.random() * 360;
        const duration = 6000 + Math.round(Math.random() * 2000);
        return { id: i, size, x, delay, rotStart, duration };
      }),
    [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((p) => (
        <Petal key={p.id} {...p} H={height} />
      ))}
    </View>
  );
}
function Petal({
  size,
  x,
  delay,
  rotStart,
  duration,
  H,
}: {
  size: number;
  x: number;
  delay: number;
  rotStart: number;
  duration: number;
  H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, {
        toValue: H + size + 20,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (!alive) return;
        setTimeout(fall, Math.random() * 1000);
      });
    };
    const rotLoop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const start = setTimeout(() => {
      fall();
      rotLoop.start();
      swayLoop.start();
    }, delay);
    return () => {
      alive = false;
      clearTimeout(start);
      rot.stopAnimation();
      sway.stopAnimation();
      y.stopAnimation();
    };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(
    new Animated.Value(x),
    sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] })
  );
  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`],
  });
  return (
    <Animated.View
      style={[
        s.petal,
        {
          width: size,
          height: size * 1.4,
          borderRadius: size,
          transform: [{ translateX }, { translateY: y }, { rotate }],
        },
      ]}
    />
  );
}

/* ================== Estilos ================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    backgroundColor: "#fffdf7",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    overflow: "hidden",
    padding: 16,
  },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },

  grid: { marginTop: 10, gap: 10 },
  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: INK },
  cardJP: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emoji: { fontSize: 18 },

  meta: { fontSize: 12, color: "#6B7280", fontWeight: "700" },
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

  play: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  playTxt: { color: "#fff", fontWeight: "900" },

  // Segment
  segment: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  segmentActive: { backgroundColor: "#111827", borderColor: "#111827" },
  segmentTxt: { color: "#111827", fontWeight: "900" },
  segmentTxtActive: { color: "#fff", fontWeight: "900" },

  // Focus ring visible
  focusRing: {
    shadowColor: CRIMSON,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    // para web:
    outlineStyle: "solid" as any,
    outlineWidth: 2,
    outlineColor: CRIMSON,
    borderRadius: 12,
  },
});

const stylesMap = StyleSheet.create({
  canvas: {
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: "#f7faf5",
    borderWidth: 1,
    borderColor: "#e4ebdf",
    overflow: "hidden",
  },
  roadH: { position: "absolute", left: 0, right: 0, height: 18, backgroundColor: "#dfe6d8" },
  roadV: { position: "absolute", top: 0, bottom: 0, width: 18, backgroundColor: "#dfe6d8" },
  placeWrap: { position: "absolute" },
  place: {
    width: 100,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: "#fff",
  },
  placeFocus: {
    shadowColor: CRIMSON,
    shadowOpacity: 0.4,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    borderColor: CRIMSON,
  },
  placeEmoji: { fontSize: 18 },
  placeEs: { fontWeight: "800", color: INK, marginTop: 2 },
  placeKana: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});
