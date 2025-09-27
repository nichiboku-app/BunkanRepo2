// src/screens/N5/B6Vida/B6VidaCotidianaMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

/* ============ Farolito (🏮) con balanceo y vaivén vertical ============ */
function Lantern({
  x = 40,
  y = 60,
  size = 34,
  delay = 0,
  swingDeg = 6,
  bob = 6,
}: {
  x?: number;
  y?: number;
  size?: number;
  delay?: number;
  swingDeg?: number;
  bob?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  const rotate = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [`-${swingDeg}deg`, `${swingDeg}deg`, `-${swingDeg}deg`],
  });
  const translateY = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, bob, 0],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {/* cuerda */}
      <View
        style={{
          position: "absolute",
          left: x + size / 2 - 1,
          top: 0,
          width: 2,
          height: y - 6,
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      />
      {/* farol */}
      <Animated.Text
        style={{
          position: "absolute",
          left: x,
          top: y,
          fontSize: size,
          transform: [{ rotate }, { translateY }],
          textShadowColor: "rgba(255, 120, 80, 0.6)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
          opacity: Platform.select({ ios: 0.95, android: 0.9, default: 0.95 }),
        }}
      >
        🏮
      </Animated.Text>
    </View>
  );
}

/* ============ Luciérnaga (puntito brillante que sube) ============ */
function Firefly({ x = 100, delay = 0 }: { x?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [H * 0.2 + Math.random() * H * 0.4, -30],
  });
  const opacity = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.9, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x + Math.random() * 40 - 20,
        width: 6,
        height: 6,
        borderRadius: 6,
        backgroundColor: "rgba(255,240,120,0.95)",
        shadowColor: "#fff7b3",
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    />
  );
}

export default function B6VidaCotidianaMenu() {
  /* Animación de entrada del contenido */
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, slideUp]);

  const cards = [
    { icon: "cart-outline", label: "Compras" },
    { icon: "restaurant-outline", label: "Restaurante" },
    { icon: "train-outline", label: "Transporte" },
    { icon: "cash-outline", label: "Dinero" },
    { icon: "map-outline", label: "Direcciones" },
    { icon: "pricetags-outline", label: "Tiendas" },
    { icon: "bed-outline", label: "Hotel" },
    { icon: "medkit-outline", label: "Emergencias" },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1221" }}>
      {/* Fondo: degradado simple con bandas suaves */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0b1221" }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#0e1630",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            transform: [{ translateY: H * 0.28 }],
          },
        ]}
      />
      {/* niebla suave */}
      <View
        style={{
          position: "absolute",
          left: -40,
          top: -60,
          width: W * 0.9,
          height: W * 0.9,
          borderRadius: W * 0.9,
          backgroundColor: "rgba(80,120,255,0.10)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -60,
          top: H * 0.25,
          width: W * 0.9,
          height: W * 0.9,
          borderRadius: W * 0.9,
          backgroundColor: "rgba(255,120,120,0.10)",
        }}
      />

      {/* Farolitos (nuevos, no usados antes) */}
      <Lantern x={36} y={46} delay={0} />
      <Lantern x={132} y={60} delay={400} size={36} swingDeg={7} bob={7} />
      <Lantern x={228} y={52} delay={800} size={38} swingDeg={5} bob={5} />
      <Lantern x={W - 80} y={58} delay={1200} size={34} swingDeg={6} bob={6} />

      {/* Luciérnagas */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Firefly key={i} x={20 + (i * (W - 40)) / 12} delay={i * 260} />
      ))}

      {/* Contenido */}
      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <View style={s.header}>
            <Text style={s.kicker}>⛩️ Bloque 6</Text>
            <Text style={s.h}>Vida cotidiana</Text>
            <Text style={s.sub}>Frases y situaciones útiles: compras, restaurante, transporte & más.</Text>
          </View>

          {/* Chips de “atajos” */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6, gap: 8 }}
          >
            {[
              { t: "Frases clave", i: "sparkles-outline" },
              { t: "Cortés ✨", i: "hand-left-outline" },
              { t: "Números ¥", i: "cash-outline" },
              { t: "Direcciones", i: "map-outline" },
            ].map((c, idx) => (
              <View key={idx} style={s.chip}>
                <Ionicons name={c.i as any} size={14} color="#0b1221" />
                <Text style={s.chipTxt}>{c.t}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Grid de tarjetas */}
          <View style={s.grid}>
            {cards.map((c, idx) => (
              <Pressable
                key={c.label}
                onPress={() => {
                  Vibration.vibrate(8);
                }}
                android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
                style={[s.card]}
              >
                <View style={s.cardIconWrap}>
                  <Ionicons name={c.icon as any} size={24} color="#0b1221" />
                </View>
                <Text style={s.cardTxt}>{c.label}</Text>
                <View style={s.arrow}>
                  <Ionicons name="chevron-forward-outline" size={16} color="#fff" />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Nota “como primaria” */}
          <View style={s.note}>
            <Text style={s.noteTitle}>¿Qué veremos aquí?</Text>
            <Text style={s.noteTxt}>
              Practicaremos frases cortas y claras para la vida real en Japón: pedir comida,
              preguntar precios, comprar boletos y moverse en tren o bus. Todo con ejemplos
              sencillos, paso a paso, como si fuera un juego.
            </Text>
          </View>

          <View style={{ height: 36 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { padding: 16, paddingTop: 110, gap: 14 },
  header: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    padding: 16,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1,
    color: "#0b1221",
    opacity: 0.8,
    fontWeight: "700",
  },
  h: { fontSize: 24, fontWeight: "900", color: "#0b1221", marginTop: 2 },
  sub: { marginTop: 4, color: "#0b1221", opacity: 0.85 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffebb7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
  },
  chipTxt: { color: "#0b1221", fontWeight: "800", fontSize: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    flexBasis: (W - 16 * 2 - 12) / 2, // 2 columnas con gap 12
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 12,
    overflow: "hidden",
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ffcf9b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTxt: { color: "#0b1221", fontWeight: "900" },
  arrow: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 6,
    borderRadius: 999,
  },

  note: {
    backgroundColor: "rgba(255,235,183,0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
    padding: 14,
  },
  noteTitle: { fontWeight: "900", color: "#0b1221", marginBottom: 6 },
  noteTxt: { color: "#0b1221", opacity: 0.9, lineHeight: 18 },
});
