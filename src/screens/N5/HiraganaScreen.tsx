// src/screens/N5/Hiragana/HiraganaScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowsLeftRight,
  BookOpen,
  Brain,
  Cards,
  GameController,
  Headphones,
  PencilSimpleLine,
  PenNib,
  SpeakerHigh,
  TextAa,
} from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
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
import type { RootStackParamList } from "../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W, height: H } = Dimensions.get("window");

/* ===== Fondo con 🏮 y luciérnagas ===== */
function Lantern({ x, y, size = 30, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
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
  const rot = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] });
  const bob = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 5, 0] });
  return (
    <>
      <View style={{ position: "absolute", left: x + size / 2 - 1, top: 0, width: 2, height: y - 6, backgroundColor: "rgba(255,255,255,0.35)" }} />
      <Animated.Text style={{ position: "absolute", left: x, top: y, fontSize: size, transform: [{ rotate: rot }, { translateY: bob }], textShadowColor: "rgba(255,120,80,0.6)", textShadowRadius: 8 }}>
        🏮
      </Animated.Text>
    </>
  );
}
function Firefly({ x, delay = 0 }: { x: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 3400, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);
  const y = t.interpolate({ inputRange: [0, 1], outputRange: [H * 0.28 + Math.random() * H * 0.35, -20] });
  const op = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.95, 0] });
  const sc = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x + (Math.random() * 24 - 12),
        width: 6,
        height: 6,
        borderRadius: 6,
        backgroundColor: "rgba(255,240,120,0.95)",
        shadowColor: "#fff7b3",
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateY: y }, { scale: sc }],
        opacity: op,
      }}
    />
  );
}

/* ==== Grid helpers para “span 2” ==== */
const H_PADDING = 16;
const GAP = 10;
const COLS = W >= 820 ? 3 : 2; // 3 en tablets anchas, 2 en móviles
const BASE = (W - H_PADDING * 2 - GAP * (COLS - 1)) / COLS;
const widthFor = (span = 1) => BASE * span + GAP * (span - 1);

/* ===== Tile con efecto usePress ===== */
type MiniTileProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  span?: 1 | 2; // ← soporta tiles anchos
};
function MiniTile({ title, icon, onPress, span = 1 }: MiniTileProps) {
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
      useNativeDriver: true,
      friction: 5,
      tension: 180,
    }).start();
  }, [isPressed, scale]);

  return (
    <Animated.View style={[styles.tile, { width: widthFor(span), transform: [{ scale }] }]}>
      <Pressable
        ref={ref as any}
        accessibilityRole="button"
        android_ripple={{ color: "rgba(255,255,255,0.15)" }}
        {...pressProps}
        style={({ pressed }) => [styles.tileInner, pressed && styles.tilePressed]}
      >
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.tileText} numberOfLines={1}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const TABS = ["Grupo A", "Actividades A", "Grupo K", "Actividades K"] as const;
type TabKey = typeof TABS[number];

export default function HiraganaScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>("Grupo A");

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1221" }}>
      {/* Fondo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0b1221" }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0e1630", borderTopLeftRadius: 40, borderTopRightRadius: 40, transform: [{ translateY: H * 0.26 }] }]} />
      <View style={{ position: "absolute", left: -40, top: -60, width: W * 0.9, height: W * 0.9, borderRadius: W * 0.9, backgroundColor: "rgba(80,120,255,0.10)" }} />
      <View style={{ position: "absolute", right: -60, top: H * 0.22, width: W * 0.9, height: W * 0.9, borderRadius: W * 0.9, backgroundColor: "rgba(255,120,120,0.10)" }} />
      <Lantern x={32} y={42} />
      <Lantern x={120} y={56} />
      <Lantern x={W - 90} y={54} size={32} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Firefly key={i} x={20 + (i * (W - 40)) / 10} delay={i * 240} />
      ))}

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>⛩️ Hiragana</Text>
          <Text style={styles.h}>Menú</Text>
          <Text style={styles.sub}>Todo organizado en pestañas para que avances rápido.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              >
                <Ionicons
                  name={
                    t.includes("Actividades")
                      ? "sparkles-outline"
                      : t.includes("Grupo A")
                      ? "leaf-outline"
                      : "book-outline"
                  }
                  size={14}
                  color={active ? "#0b1221" : "#e5e7eb"}
                />
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {tab === "Grupo A" && (
            <>
              <MiniTile title="Trazos" icon={<PenNib size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("TrazosGrupoA")} />
              <MiniTile title="Pronunciación" icon={<SpeakerHigh size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("PronunciacionGrupoA")} />
              {/* ⬇️ Tile ancho (span 2) */}
              <MiniTile title="Ejemplos" icon={<BookOpen size={28} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("EjemplosGrupoA")} />
            </>
          )}

          {tab === "Actividades A" && (
            <>
              <MiniTile title="Tarjetas" icon={<Cards size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("ATarjetas")} />
              <MiniTile title="Trazo animado" icon={<PencilSimpleLine size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("ATrazoAnimado")} />
              {/* ⬇️ Tile ancho (span 2) */}
              <MiniTile title="Dictado visual" icon={<Headphones size={28} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("ADictadoVisual")} />
            </>
          )}

          {tab === "Grupo K" && (
            <>
              <MiniTile title="Trazo" icon={<PenNib size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("TrazoGrupoK")} />
              <MiniTile title="Vocabulario" icon={<TextAa size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("VocabularioGrupoK")} />
            </>
          )}

          {tab === "Actividades K" && (
            <>
              <MiniTile title="Matching" icon={<ArrowsLeftRight size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("MatchingGrupoK")} />
              <MiniTile title="Memoria" icon={<Brain size={28} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("MemoriaGrupoK")} />
              {/* ⬇️ Tile ancho (span 2) */}
              <MiniTile title="Mini-juego" icon={<GameController size={28} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("MemoriaGrupoK")} />
            </>
          )}
        </View>

        {/* Nota y botón siguiente */}
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Consejo</Text>
          <Text style={styles.noteTxt}>Completa primero “Trazos” y “Pronunciación”, luego juega en “Actividades”.</Text>
        </View>

        <View style={{ marginTop: 18, alignItems: "center" }}>
          <Pressable
            style={({ pressed }) => [styles.nextButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => navigation.navigate("FamiliaS")}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          >
            <Text style={styles.nextButtonText}>Ir a Familias S y T ➝</Text>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  c: { padding: H_PADDING, paddingTop: 100, gap: 12 },

  header: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 12,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#0b1221", opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: "#0b1221", marginTop: 2 },
  sub: { marginTop: 2, color: "#0b1221", opacity: 0.8 },

  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, marginBottom: 6 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabBtnActive: { backgroundColor: "#ffebb7", borderColor: "#ffebb7" },
  tabTxt: { color: "#e5e7eb", fontWeight: "800", fontSize: 12 },
  tabTxtActive: { color: "#0b1221" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },

  tile: { /* width se calcula dinámicamente con widthFor(span) */ },

  tileInner: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    minHeight: 96,
  },
  tilePressed: { opacity: 0.96 },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffcf9b",
    borderWidth: 2,
    borderColor: "#0C0C0C",
  },
  tileText: { fontWeight: "900", color: "#0b1221", fontSize: 13, textAlign: "center" },

  note: {
    marginTop: 8,
    backgroundColor: "rgba(255,235,183,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.85)",
    padding: 12,
  },
  noteTitle: { fontWeight: "900", color: "#0b1221", marginBottom: 4 },
  noteTxt: { color: "#0b1221", opacity: 0.9 },

  nextButton: {
    backgroundColor: "#B32133",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  nextButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
