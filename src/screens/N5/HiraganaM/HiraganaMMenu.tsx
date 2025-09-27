// src/screens/N5/HiraganaM/HiraganaMMenu.tsx
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, AudioWaveform, Mic } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W, height: H } = Dimensions.get("window");

/* ===================== FONDO “FUJI + SEIGAIHA” ===================== */
function RisingSun() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const op = t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 60,
        left: W * 0.15,
        width: 180,
        height: 180,
        borderRadius: 180,
        backgroundColor: "#FF5E5B",
        opacity: op,
        transform: [{ scale }],
        shadowColor: "#FF5E5B",
        shadowOpacity: 0.7,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

function Fuji() {
  // Monte como triángulo con borde
  const base = W * 0.62;
  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom: H * 0.36, left: (W - base) / 2 }}>
      {/* Montaña */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: base / 2,
          borderRightWidth: base / 2,
          borderBottomWidth: base * 0.52,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#2C2E43",
          opacity: 0.96,
        }}
      />
      {/* Cumbre nevada */}
      <View
        style={{
          position: "absolute",
          top: base * 0.20,
          left: base * 0.5 - (base * 0.20) / 2,
          width: 0,
          height: 0,
          borderLeftWidth: (base * 0.20) / 2,
          borderRightWidth: (base * 0.20) / 2,
          borderBottomWidth: base * 0.12,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#F4F7FA",
        }}
      />
    </View>
  );
}

function WaveStrip({
  y,
  color = "#1F5673",
  size = 56,
  speed = 12000,
  offset = 0,
}: {
  y: number;
  color?: string;
  size?: number; // diámetro de los arcos
  speed?: number;
  offset?: number;
}) {
  // “Seigaiha” simplificado: fila de círculos recortados por arriba.
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(offset),
        Animated.timing(t, { toValue: 1, duration: speed, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [offset, speed, t]);

  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [0, -size] });

  // Genera suficientes “ondas” para cubrir 2 anchos y permitir scroll infinito
  const count = Math.ceil((W * 2) / size) + 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: y,
        left: 0,
        right: 0,
        height: size * 0.5,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          transform: [{ translateX: tx }],
          opacity: 0.96,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <View
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              marginRight: 0,
              marginTop: size * 0.25, // solo asoma el arco
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

/* ===================== BOTÓN (indigo aizome + dashed “sashiko”) ===================== */
function IndigoButton({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
}) {
  const ref = useRef<View>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const { pressProps, isPressed } = usePress({
    onPress: () => {
      Vibration.vibrate(8);
      onPress();
    },
    ref,
  });

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isPressed ? 0.97 : 1,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [isPressed, scale]);

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Pressable
        ref={ref as any}
        {...pressProps}
        android_ripple={{ color: "rgba(255,255,255,0.12)" }}
        style={({ pressed }) => [styles.cardIndigo, pressed && { opacity: 0.96 }]}
      >
        {!!icon && <View style={styles.iconBadge}>{icon}</View>}
        <Text style={styles.cardTitle}> {title} </Text>
        {!!subtitle && <Text style={styles.cardSub}>{subtitle}</Text>}
      </Pressable>
    </Animated.View>
  );
}

function VermilionCTA({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const ref = useRef<View>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const { pressProps, isPressed } = usePress({
    onPress: () => {
      Vibration.vibrate(8);
      onPress();
    },
    ref,
  });

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isPressed ? 0.97 : 1,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [isPressed, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        ref={ref as any}
        {...pressProps}
        android_ripple={{ color: "rgba(255,255,255,0.18)" }}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.96 }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.ctaSub}>{subtitle}</Text>}
        </View>
        <ArrowRight size={22} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

/* ===================== PANTALLA ===================== */
export default function HiraganaMMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1626" }}>
      {/* Cielo gradiente simple con discos suaves */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0A1626" }]} />
      <View style={{ position: "absolute", top: -H * 0.25, left: -W * 0.3, width: W * 1.2, height: W * 1.2, borderRadius: W, backgroundColor: "rgba(20, 66, 114, 0.35)" }} />
      <View style={{ position: "absolute", top: H * 0.1, right: -W * 0.4, width: W * 1.1, height: W * 1.1, borderRadius: W, backgroundColor: "rgba(255, 210, 150, 0.16)" }} />

      <RisingSun />
      <Fuji />
      {/* Olas en parallax */}
      <WaveStrip y={H * 0.28} color="#1A4C6E" size={64} speed={14000} />
      <WaveStrip y={H * 0.23} color="#0E3B57" size={54} speed={12000} offset={800} />
      <WaveStrip y={H * 0.18} color="#082C42" size={46} speed={10000} offset={1400} />

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>🧩 Hiragana</Text>
          <Text style={styles.h}>Grupo M（ま・み・む・め・も）</Text>
          <Text style={styles.sub}>Dictado + práctica con voz, con fondo Fuji/Seigaiha.</Text>
        </View>

        {/* Grid 2×2 compacto */}
        <View style={styles.grid}>
          <IndigoButton
            title="Dictado (M)"
            subtitle="Escucha y escribe las sílabas del grupo M."
            icon={<AudioWaveform size={22} color="#E8F1FF" />}
            onPress={() => navigation.navigate("M_Dictado")}
          />
          <IndigoButton
            title="Práctica con voz"
            subtitle="Pronuncia y recibe retroalimentación básica."
            icon={<Mic size={22} color="#E8F1FF" />}
            onPress={() => navigation.navigate("M_PracticaVoz")}
          />
        </View>

        {/* CTAs ancho completo */}
        <VermilionCTA
          title="Ir a Y–R（や・ゆ・よ／ら・り・る・れ・ろ）"
          subtitle="Lectura y ritmo de frases cortas"
          onPress={() => navigation.navigate("HiraganaYRMenu")}
        />
        <VermilionCTA
          title="Ir a W–N（わ・を・ん / contracciones）"
          subtitle="Cierre con ん y lectura guiada"
          onPress={() => navigation.navigate("HiraganaWNMenu")}
        />

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/* ===================== ESTILOS ===================== */
const INDIGO = "#102C54";
const INDIGO_DARK = "#0B2344";
const STITCH = "rgba(232, 241, 255, 0.7)";
const VERMILION = "#B32133";

const styles = StyleSheet.create({
  c: { padding: 16, paddingTop: 100, gap: 12 },

  header: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 12,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#FFDFAF", opacity: 0.85, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", marginTop: 2 },
  sub: { marginTop: 2, color: "rgba(255,255,255,0.85)" },

  grid: { flexDirection: "row", gap: 12 },

  cardWrap: { flex: 1 },
  cardIndigo: {
    backgroundColor: INDIGO,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: STITCH,
    borderStyle: "dashed",
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: INDIGO_DARK,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: STITCH,
  },
  cardTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 18, textAlign: "center" },
  cardSub: { color: "rgba(232,241,255,0.9)", fontWeight: "700", fontSize: 12, textAlign: "center" },

  cta: {
    marginTop: 8,
    backgroundColor: VERMILION,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  ctaTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  ctaSub: { color: "rgba(255,255,255,0.92)", fontWeight: "700" },
});
