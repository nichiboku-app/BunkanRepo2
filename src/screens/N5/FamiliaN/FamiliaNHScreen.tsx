// src/screens/N5/FamiliaS/FamiliaNHScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

/* ========= Fondo: noche japonesa (bambú + luna + luciérnagas + furin) ========= */

function MoonGlow() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const op = t.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 58,
        right: 30,
        width: 180,
        height: 180,
        borderRadius: 180,
        backgroundColor: "#F5E6A3",
        opacity: op,
        transform: [{ scale }],
        shadowColor: "#F5E6A3",
        shadowOpacity: 0.9,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

function Bamboo({ x, h = 200, delay = 0 }: { x: number; h?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 4800 + Math.random() * 1200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  const rot = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-1.2deg", "1.2deg", "-1.2deg"] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: x,
        transform: [{ rotate: rot }],
      }}
    >
      <View
        style={{
          width: 10,
          height: h,
          backgroundColor: "#4C7F5C",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.2)",
        }}
      />
      {Array.from({ length: Math.max(3, Math.floor(h / 60)) }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            bottom: 10 + i * 50,
            left: -2,
            width: 14,
            height: 6,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.14)",
          }}
        />
      ))}
      <View
        style={{
          position: "absolute",
          bottom: h - 30,
          left: 8,
          width: 36,
          height: 12,
          borderRadius: 12,
          backgroundColor: "#6BAA75",
          transform: [{ rotate: "-12deg" }],
          opacity: 0.9,
        }}
      />
    </Animated.View>
  );
}

function Firefly({ delay = 0 }: { delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const x0 = useRef(Math.random() * W).current;
  const y0 = useRef(H * 0.25 + Math.random() * (H * 0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 6000 + Math.random() * 3000, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  const tx = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [x0 - 25, x0 + 25, x0 - 25] });
  const ty = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [y0, y0 - 12, y0] });
  const op = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 1, 0.15] });
  const size = 6 + Math.random() * 3;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: "#F9F871",
        transform: [{ translateX: tx }, { translateY: ty }],
        opacity: op,
        shadowColor: "#F9F871",
        shadowOpacity: 0.8,
        shadowRadius: 10,
      }}
    />
  );
}

function Furin({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);

  const rot = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] });

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: "absolute",
        top: y,
        left: x,
        transform: [{ rotate: rot }],
        fontSize: 28,
        opacity: 0.9,
      }}
    >
      🎐
    </Animated.Text>
  );
}

/* ================= Botón accesible con usePress (spring + ripple) ================ */

function OptionButton({
  title,
  subtitle,
  onPress,
  tone = "indigo",
  icon,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: "indigo" | "vermillion";
  icon?: React.ReactNode;
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
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [isPressed, scale]);

  const bg = tone === "vermillion" ? styles.cardVermillion : styles.cardIndigo;

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <Pressable
        ref={ref as any}
        {...pressProps}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        style={({ pressed }) => [styles.card, bg, pressed && { opacity: 0.96 }]}
        hitSlop={12}
      >
        <View style={styles.cardRow}>
          {!!icon && <View style={styles.iconBubble}>{icon}</View>}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            {!!subtitle && <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.95)" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ============================ Pantalla ============================ */

export default function FamiliaNHScreen() {
  const navigation = useNavigation<Nav>();
  const go = (route: string) => (navigation as any).navigate(route as never);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1026" }}>
      {/* Fondo animado */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0A1026" }]} />
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: H * 0.5, backgroundColor: "rgba(17,28,65,0.8)" }} />
      <MoonGlow />
      {[{ x: 20, h: 240 }, { x: 58, h: 210 }, { x: 98, h: 260 }, { x: 140, h: 220 }, { x: W - 60, h: 230 }, { x: W - 90, h: 200 }, { x: W - 120, h: 250 }]
        .map((b, i) => <Bamboo key={i} x={b.x} h={b.h} delay={i * 300} />)}
      <Furin x={W * 0.18} y={90} delay={300} />
      <Furin x={W * 0.32} y={120} delay={900} />
      <Furin x={W * 0.70} y={80} delay={1500} />
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {Array.from({ length: 18 }).map((_, i) => <Firefly key={i} delay={i * 260} />)}
      </View>

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>🧩 Hiragana</Text>
          <Text style={styles.h1}>Familias N y H</Text>
          <Text style={styles.sub}>Bambú que se mece, campanillas y luciérnagas.</Text>
        </View>

        {/* ===== Grupo N — botón a ANCHO COMPLETO ===== */}
        <Text style={styles.sectionTitle}>Grupo N（な・に・ぬ・ね・の）</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Lectura <Text style={styles.bold}>guiada</Text> con imágenes para reforzar{" "}
            <Text style={styles.bold}>comprensión</Text> y <Text style={styles.bold}>pronunciación</Text>.
          </Text>
        </View>
        <View style={styles.gridRowFull}>
          <OptionButton
            title="Lectura guiada con imágenes (N)"
            subtitle="📖🎴 Asocia y lee en voz alta"
            onPress={() => go("NLecturaGuiada")}
            tone="indigo"
            icon={<Ionicons name="book" size={22} color="#0B1220" />}
          />
        </View>

        {/* ===== Grupo H — botón a ANCHO COMPLETO ===== */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Grupo H（は・ひ・ふ・へ・ほ）</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Roleplay para presentarte usando <Text style={styles.bold}>は</Text> (se pronuncia “wa”).
          </Text>
        </View>
        <View style={styles.gridRowFull}>
          <OptionButton
            title='Roleplay: "Hola, me llamo..." (H)'
            subtitle="🎤 Usa は (wa) al presentarte"
            onPress={() => go("HRoleplaySaludo")}
            tone="vermillion"
            icon={<Ionicons name="mic" size={22} color="#0B1220" />}
          />
        </View>

        <View style={{ height: 26 }} />
      </ScrollView>
    </View>
  );
}

/* ============================ Estilos ============================ */

const INDIGO_BTN = "#1C2E5E";
const VERMILION_BTN = "#C73A2C";
const FRAME = "rgba(255,255,255,0.45)";

const styles = StyleSheet.create({
  c: { padding: 16, paddingTop: 90, gap: 12 },

  header: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 12,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#E6EDF9", opacity: 0.85, fontWeight: "700" },
  h1: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", marginTop: 2 },
  sub: { marginTop: 2, color: "rgba(255,255,255,0.85)" },

  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#F5F7FF", marginTop: 8, marginBottom: 8 },

  infoBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 8,
  },
  infoText: { color: "#E6EDF9", fontWeight: "700" },
  bold: { fontWeight: "900" },

  // Fila de 2 columnas (si tuvieras dos opciones)
  grid: { flexDirection: "row", gap: 12 },

  // Fila de ANCHO COMPLETO (un solo botón que se estira 100%)
  gridRowFull: { flexDirection: "row", gap: 12, alignItems: "stretch" },

  card: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: FRAME,
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 88, // un poco más alto para look de botón grande
  },
  cardIndigo: { backgroundColor: INDIGO_BTN },
  cardVermillion: { backgroundColor: VERMILION_BTN },

  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBubble: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(0,0,0,0.25)",
  },

  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  cardSubtitle: { color: "rgba(255,255,255,0.95)", fontWeight: "700", marginTop: 2 },
});
