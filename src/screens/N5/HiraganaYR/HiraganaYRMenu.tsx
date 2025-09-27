// src/screens/N5/HiraganaYR/HiraganaYRMenu.tsx
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, Headphones, Puzzle, Sparkles } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
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

/* ============ Fondo (cielo nocturno + estrellas arriba) ============ */
function Star({ x, y, size = 2, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 1600 + Math.random() * 1400, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 1300 + Math.random() * 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: "white",
        opacity,
      }}
    />
  );
}

function Starfield({ count = 36 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: Math.random() * W,
        y: Math.random() * (H * 0.45), // ★ solo mitad superior
        size: 1 + Math.floor(Math.random() * 2),
        delay: Math.floor(Math.random() * 1200) + i * 25,
      })),
    [count]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <Star key={i} x={s.x} y={s.y} size={s.size} delay={s.delay} />
      ))}
    </View>
  );
}

/* ============ Piezas Tanabata reutilizables ============ */
function Tanzaku({
  x,
  y,
  color,
  delay = 0,
}: {
  x: number;
  y: number;
  color: string;
  delay?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  const sway = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] });
  const bob = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-3, 3, -3] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: 12,
        height: 56,
        backgroundColor: color,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.25)",
        transform: [{ rotate: sway as any }, { translateY: bob }],
      }}
    />
  );
}

/* ============ NUEVA escena inferior (dentro del scroll) ============ */
function TanabataFooterScene() {
  // Contenedor relativo: todo lo de adentro se posiciona respecto a este bloque,
  // así “vive” al final, en ese espacio donde no hay botones.
  return (
    <View style={styles.footerScene}>
      {/* “suelo” de bambú */}
      <View style={styles.footerGround} />
      {/* Mástiles de bambú en los lados */}
      <View style={[styles.footerPole, { left: 18, transform: [{ rotate: "-8deg" }] }]} />
      <View style={[styles.footerPole, { right: 18, transform: [{ rotate: "8deg" }] }]} />

      {/* Hojas simples */}
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={`leafL-${i}`}
          style={[
            styles.footerLeaf,
            { left: 32, top: 18 + i * 28, transform: [{ rotate: "-18deg" }] },
          ]}
        />
      ))}
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={`leafR-${i}`}
          style={[
            styles.footerLeaf,
            { right: 32, top: 22 + i * 28, transform: [{ rotate: "18deg" }] },
          ]}
        />
      ))}

      {/* Tanzaku colgando (abajo, visibles) */}
      <Tanzaku x={W * 0.18} y={18} color="#E4572E" />
      <Tanzaku x={W * 0.28} y={48} color="#F0A202" delay={400} />
      <Tanzaku x={W * 0.72} y={20} color="#3AB795" />
      <Tanzaku x={W * 0.82} y={50} color="#5DADEC" delay={500} />
    </View>
  );
}

/* ============ Botón Edo (igual que antes) ============ */
function EdoButton({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const ref = useRef<View>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const shineX = useRef(new Animated.Value(-140)).current;

  const { pressProps, isPressed } = usePress({
    ref,
    onPress: () => {
      Vibration.vibrate(8);
      shineX.setValue(-140);
      Animated.timing(shineX, { toValue: 260, duration: 650, useNativeDriver: true }).start();
      onPress();
    },
  });

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isPressed ? 0.97 : 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [isPressed, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        ref={ref as any}
        {...pressProps}
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glint,
            {
              transform: [{ translateX: shineX }, { rotate: "-16deg" }],
            },
          ]}
        />
        <View style={styles.row}>
          <View style={styles.iconBadge}>{icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {title}
            </Text>
            {!!subtitle && (
              <Text style={styles.cardSub} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
          <ArrowRight size={18} color="#fff" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ============ Pantalla ============ */
export default function HiraganaYRMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: "#0E1530" }}>
      {/* capas de color superiores */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#0E1530" }]} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -H * 0.2,
          left: -W * 0.3,
          width: W * 1.2,
          height: W * 1.2,
          borderRadius: W * 1.2,
          backgroundColor: "rgba(26,43,87,0.55)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: H * 0.18,
          right: -W * 0.2,
          width: W * 0.9,
          height: W * 0.9,
          borderRadius: W * 0.9,
          backgroundColor: "rgba(18,98,116,0.35)",
        }}
      />

      <Starfield count={36} />

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Sparkles size={16} color="#A3E9FF" />
            <Text style={styles.kicker}>Hiragana — Grupo Y–R</Text>
          </View>
          <Text style={styles.title}>や・ゆ・よ ／ ら・り・る・れ・ろ</Text>
          <Text style={styles.subtitle}>Noche de Tanabata: escucha y construye palabras.</Text>
        </View>

        {/* Botones */}
        <EdoButton
          title="Audio interactivo"
          subtitle="Escucha, toca y repite las sílabas."
          icon={<Headphones size={22} color="#0E1530" />}
          onPress={() => navigation.navigate("YR_AudioInteractivo")}
        />
        <EdoButton
          title="Completar palabras"
          subtitle="Selecciona sílabas para formar palabras."
          icon={<Puzzle size={22} color="#0E1530" />}
          onPress={() => navigation.navigate("YR_CompletarPalabras")}
        />

        {/* Tip */}
        <View style={styles.tip}>
          <Text style={styles.tipTxt}>
            Consejo: repite en voz alta y marca el ritmo con palmadas para memorizar や・ゆ・よ y ら行.
          </Text>
        </View>

        {/* NUEVA escena decorativa al final: aquí “bajamos” los elementos */}
        <TanabataFooterScene />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

/* ============ Estilos ============ */
const INK = "#0E1530";
const ARMOR = "#0F1C3A";
const BORDER = "rgba(255,255,255,0.14)";

const styles = StyleSheet.create({
  c: { padding: 16, paddingTop: 90, paddingBottom: 36, gap: 12 },

  header: {
    backgroundColor: "rgba(15,28,58,0.78)",
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  kicker: { color: "#A3E9FF", fontWeight: "900", letterSpacing: 1 },
  title: { color: "#fff", fontWeight: "900", fontSize: 18 },
  subtitle: { color: "rgba(255,255,255,0.92)", marginTop: 2, fontWeight: "700" },

  card: {
    backgroundColor: ARMOR,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  glint: {
    position: "absolute",
    top: -20,
    width: 140,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#A3E9FF",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(0,0,0,0.2)",
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  cardSub: { color: "rgba(255,255,255,0.9)", fontWeight: "700", marginTop: 2 },

  tip: {
    backgroundColor: "rgba(163,233,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(163,233,255,0.25)",
    padding: 10,
    marginTop: 2,
  },
  tipTxt: { color: "#DFF7FF", fontWeight: "700" },

  /* Escena inferior */
  footerScene: {
    height: 180,
    marginTop: 6,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(15,28,58,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  footerGround: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 46,
    backgroundColor: "rgba(30,52,68,0.9)",
  },
  footerPole: {
    position: "absolute",
    bottom: 46,
    width: 6,
    height: 120,
    backgroundColor: "#2F5233",
    borderRadius: 3,
    shadowColor: "#2F5233",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  footerLeaf: {
    position: "absolute",
    width: 38,
    height: 12,
    backgroundColor: "#3A7D44",
    borderRadius: 12,
    opacity: 0.95,
  },
});
