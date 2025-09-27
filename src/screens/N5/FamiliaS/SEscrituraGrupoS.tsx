// src/screens/N5/FamiliaS/FamiliaSScreen.tsx
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  BookOpen,
  BookText,
  Headphones,
  MoveRight,
  PencilRuler,
  PenLine,
  Sparkles,
  Type,
} from "lucide-react-native";
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

/* ===== Fondo animado: Sol + Nubes + Koinobori ===== */
function SunGlow() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const op = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.95] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 60,
        right: 40,
        width: 170,
        height: 170,
        borderRadius: 170,
        backgroundColor: "#FFD166",
        opacity: op,
        transform: [{ scale }],
        shadowColor: "#FFD166",
        shadowOpacity: 0.85,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}
function Cloud({ x, y, size = 42, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 14000 + Math.random() * 4000, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [x, -100] });
  return (
    <Animated.Text style={{ position: "absolute", top: y, left: 0, transform: [{ translateX: tx }], fontSize: size, opacity: 0.9 }}>
      ☁️
    </Animated.Text>
  );
}
function Koinobori({
  y,
  delay = 0,
  size = 34,
  variant = "single",
  direction = "ltr",
}: {
  y: number;
  delay?: number;
  size?: number;
  variant?: "single" | "double" | "triple";
  direction?: "ltr" | "rtl";
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 9000 + Math.random() * 2200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);
  const from = direction === "ltr" ? -80 : W + 80;
  const to = direction === "ltr" ? W + 80 : -80;
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const bob = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-6, 6, -6] });
  const flip = direction === "rtl" ? { transform: [{ scaleX: -1 }] } : null;
  const fishes = variant === "triple" ? ["🎏", "🎏", "🎏"] : variant === "double" ? ["🎏", "🎏"] : ["🎏"];
  return (
    <Animated.View style={{ position: "absolute", top: y, left: 0, transform: [{ translateX: tx }, { translateY: bob }] }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: size * 0.9, marginRight: 4 }}>🎐</Text>
        <View style={[{ flexDirection: "row", gap: 2, alignItems: "center" }, flip as any]}>
          {fishes.map((f, i) => (
            <Text key={i} style={{ fontSize: size - i * 2, textShadowColor: "rgba(255,140,140,0.35)", textShadowRadius: 6 }}>
              {f}
            </Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

/* ===== Grid helpers ===== */
const H_PADDING = 16;
const GAP = 10;
const COLS = 2; // forzamos 2 columnas para el look 2×2 donde aplique
const BASE = (W - H_PADDING * 2 - GAP * (COLS - 1)) / COLS;
const widthFor = (span: 1 | "full" = 1) => (span === "full" ? W - H_PADDING * 2 : BASE);

/* ===== Tile ===== */
function Tile({
  title,
  subtitle,
  icon,
  onPress,
  span = 1,
  tone = "mint",
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  span?: 1 | "full";
  tone?: "mint" | "sky" | "peach" | "ink";
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
      toValue: isPressed ? 0.96 : 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [isPressed, scale]);

  const bg =
    tone === "mint" ? styles.tileMint : tone === "sky" ? styles.tileSky : tone === "peach" ? styles.tilePeach : styles.tileInk;
  const textColor = tone === "ink" ? "#fff" : "#0b2e59";
  const subColor = tone === "ink" ? "rgba(255,255,255,0.92)" : "rgba(11,46,89,0.9)";

  return (
    <Animated.View style={[styles.tile, { width: widthFor(span), transform: [{ scale }] }]}>
      <Pressable
        ref={ref as any}
        accessibilityRole="button"
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        {...pressProps}
        style={({ pressed }) => [styles.tileInner, bg, pressed && { opacity: 0.96 }]}
      >
        <View style={[styles.iconBadge, tone === "ink" && { backgroundColor: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.45)" }]}>
          {icon}
        </View>
        <Text style={[styles.tileTitle, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.tileSubtitle, { color: subColor }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ===== Pantalla ===== */
export default function FamiliaSScreen() {
  const navigation = useNavigation<Nav>();
  const go = (route: string) => (navigation as any).navigate(route as never);

  return (
    <View style={{ flex: 1, backgroundColor: "#EAF6FF" }}>
      {/* Fondo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#EAF6FF" }]} />
      <View style={{ position: "absolute", left: -100, top: -80, width: W * 0.9, height: W * 0.9, borderRadius: W * 0.9, backgroundColor: "rgba(173,216,230,0.25)" }} />
      <View style={{ position: "absolute", right: -100, top: H * 0.2, width: W * 0.9, height: W * 0.9, borderRadius: W * 0.9, backgroundColor: "rgba(186,230,253,0.30)" }} />
      <SunGlow />
      <Cloud x={W} y={80} size={50} />
      <Cloud x={W * 1.2} y={140} size={40} delay={1200} />
      <Cloud x={W * 0.9} y={210} size={44} delay={2200} />
      <Koinobori y={H * 0.30} delay={300} size={36} variant="double" direction="ltr" />
      <Koinobori y={H * 0.36} delay={900} size={40} variant="single" direction="rtl" />
      <Koinobori y={H * 0.43} delay={1500} size={42} variant="triple" direction="ltr" />
      <Koinobori y={H * 0.50} delay={2200} size={38} variant="double" direction="rtl" />

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.kicker}>🧩 Hiragana</Text>
          <Text style={styles.h}>Familias S y T</Text>
          <Text style={styles.sub}>Distribución 2×2 donde conviene y CTAs a lo ancho.</Text>
        </View>

        {/* Grupo S — 2×2 */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Grupo S（さ・し・す・せ・そ）</Text>
          <Sparkles size={16} color="#0b2e59" />
        </View>
        <View style={styles.note}>
          <Text style={styles.noteTxt}>
            Empieza por <Text style={styles.bold}>Escritura</Text> y revisa{" "}
            <Text style={styles.bold}>Ejemplos</Text>. Luego practica con{" "}
            <Text style={styles.bold}>Caligrafía digital</Text> y{" "}
            <Text style={styles.bold}>Lectura</Text>.
          </Text>
        </View>

        <View style={styles.grid}>
          {/* Fila 1 */}
          <Tile
            title="Escritura (S)"
            subtitle="Orden de trazos y forma"
            icon={<PenLine size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("SEscrituraGrupoS")}
            tone="mint"
            span={1}
          />
          <Tile
            title="Ejemplos (S)"
            subtitle="Palabras con さ し す せ そ"
            icon={<BookOpen size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("SEjemplosGrupoS")}
            tone="mint"
            span={1}
          />
          {/* Fila 2 */}
          <Tile
            title="Caligrafía digital (S)"
            subtitle="Práctica guiada en pantalla"
            icon={<PencilRuler size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("SCaligrafiaDigital")}
            tone="peach"
            span={1}
          />
          <Tile
            title="Lectura de sílabas (S)"
            subtitle="Reconoce y pronuncia"
            icon={<Type size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("SLecturaSilabas")}
            tone="sky"
            span={1}
          />
        </View>

        {/* Grupo T — 2×1 (dos lado a lado) */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Grupo T（た・ち・つ・て・と）</Text>
          <BookText size={16} color="#0b2e59" />
        </View>
        <View style={styles.note}>
          <Text style={styles.noteTxt}>
            Refuerza el <Text style={styles.bold}>trazo</Text> y la{" "}
            <Text style={styles.bold}>escucha</Text> de la familia T.
          </Text>
        </View>

        <View style={styles.grid}>
          <Tile
            title="Gif interactivo del trazo (T)"
            subtitle="Visualiza y repite"
            icon={<PencilRuler size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("TTrazoGif")}
            tone="peach"
            span={1}
          />
          <Tile
            title="Quiz de escucha (T)"
            subtitle="Identifica た・ち・つ・て・と"
            icon={<Headphones size={28} color="#0b2e59" />}
            onPress={() => navigation.navigate("TQuizEscucha")}
            tone="sky"
            span={1}
          />
        </View>

        {/* CTA — ancho completo, azul oscuro + texto blanco */}
        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Siguiente bloque</Text>
          <MoveRight size={16} color="#0b2e59" />
        </View>
        <View style={styles.grid}>
          <Tile
            title="Familias N y H →"
            subtitle="Lectura guiada + Roleplay は"
            icon={<MoveRight size={28} color="#fff" />}
            onPress={() => go("FamiliaNH")}
            tone="ink"
            span="full"
          />
        </View>

        <View style={[styles.sectionHead, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Próxima unidad</Text>
          <Sparkles size={16} color="#0b2e59" />
        </View>
        <View style={styles.grid}>
          <Tile
            title="Hiragana M (まみむめも) →"
            subtitle="Dictado + práctica con voz"
            icon={<Type size={28} color="#fff" />}
            onPress={() => go("HiraganaMMenu")}
            tone="ink"
            span="full"
          />
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  c: { padding: H_PADDING, paddingTop: 90, gap: 12 },

  header: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(10,46,89,0.12)",
    padding: 12,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#0b2e59", opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: "#0b2e59", marginTop: 2 },
  sub: { marginTop: 2, color: "#0b2e59", opacity: 0.8 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(10,46,89,0.12)",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0b2e59" },

  note: {
    backgroundColor: "rgba(217, 239, 255, 0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(10,46,89,0.14)",
    padding: 10,
  },
  noteTxt: { color: "#0b2e59", opacity: 0.95, fontWeight: "700" },
  bold: { fontWeight: "900" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },

  tile: {},
  tileInner: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 120, // tamaño óptimo para 2×2
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  /* Paleta */
  tileMint:  { backgroundColor: "#B9FBC0", borderColor: "rgba(11,46,89,0.16)" },
  tileSky:   { backgroundColor: "#A3D8FF", borderColor: "rgba(11,46,89,0.16)" },
  tilePeach: { backgroundColor: "#FFD6A5", borderColor: "rgba(11,46,89,0.16)" },
  tileInk:   { backgroundColor: "#0b2e59", borderColor: "rgba(255,255,255,0.28)" },

  iconBadge: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 2, borderColor: "rgba(11,46,89,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  tileTitle: { fontWeight: "900", fontSize: 16, textAlign: "center" },
  tileSubtitle: { fontWeight: "700", fontSize: 12, textAlign: "center" },
});
