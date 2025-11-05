// src/screens/N5/Hiragana/HiraganaScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePress } from "@react-native-aria/interactions";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
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

/* ==== Grid helpers ==== */
const H_PADDING = 16;
const GAP = 12;
const COLS = W >= 820 ? 3 : 2; // 3 tablet, 2 mobile
const BASE = (W - H_PADDING * 2 - GAP * (COLS - 1)) / COLS;
const widthFor = (span = 1) => BASE * span + GAP * (span - 1);

/* ===== Tile ===== */
type MiniTileProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  span?: 1 | 2;
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
        android_ripple={{ color: "rgba(0,0,0,0.08)" }}
        {...pressProps}
        style={({ pressed }) => [styles.tileInner, pressed && styles.tilePressed]}
      >
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.tileText} numberOfLines={2}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ===== CTA grande: Tema y gramática — Familia ===== */
function HeroFamiliaCTA({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.heroWrap}>
      <View style={styles.heroGlowA} />
      <View style={styles.heroGlowB} />
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Tema y gramática</Text>
        <Text style={styles.heroTitle}>👨‍👩‍👧‍👦 Familia (N5)</Text>
        <Text style={styles.heroSub}>
          Presenta a tu familia, edades（～さい）, contador de personas（～人 にん）,{" "}
          <Text style={{ fontWeight: "900" }}>います</Text> para “tener”, partículas{" "}
          <Text style={{ fontWeight: "900" }}>は・に・か</Text> y patrón{" "}
          <Text style={{ fontWeight: "900" }}>～に すんでいます</Text>.
        </Text>

        <Pressable
          onPress={onPress}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.heroBtnTxt}>Entrar ahora ➝</Text>
        </Pressable>

        <Text style={styles.heroNote}>Incluye audio TTS japonés y tabla de contadores.</Text>
      </View>
    </View>
  );
}

/* ===== FAB flotante con pulso ===== */
function FloatingFamiliaFab({ onPress }: { onPress: () => void }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const opacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View style={[styles.fabWrap, { transform: [{ scale }], opacity }]}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        style={({ pressed }) => [styles.fabBtn, pressed && { opacity: 0.9 }]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.fabTxt}>Familia</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ===== Helpers TTS ===== */
function openSystemTTSSettings() {
  try {
    Linking.openSettings();
  } catch {
    Alert.alert("No se pudo abrir Ajustes", "Abre Ajustes del sistema y busca 'Texto a voz'.");
  }
}
function openPlayStoreTTS() {
  const pkg = "com.google.android.tts";
  const uri = Platform.OS === "android" ? `market://details?id=${pkg}` : "https://apps.apple.com";
  Linking.openURL(uri).catch(() =>
    Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`)
  );
}
async function testJapaneseVoice() {
  try {
    const msg = "こんにちは！ にほんご の こえ を ためしています。";
    Speech.stop();
    await Speech.speak(msg, { language: "ja-JP", pitch: 1.0, rate: 1.0 });
  } catch {
    Alert.alert("No fue posible reproducir TTS", "Instala la voz japonesa（日本語）y sube el volumen multimedia.");
  }
}

const TABS = ["Grupo A", "Actividades A", "Grupo K", "Actividades K"] as const;
type TabKey = typeof TABS[number];

export default function HiraganaScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>("Grupo A");

  const tipText = useMemo(
    () =>
      "Los cuadros blancos son seleccionables. Cada actividad tiene 40+ ejercicios. Completa para avanzar con el botón rojo en la siguiente pantalla.",
    []
  );

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

        {/* CTA directa a Familia */}
        <HeroFamiliaCTA onPress={() => navigation.navigate("TemaGramaticaFamiliaN5")} />

        {/* Nota progreso */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Cómo avanzar</Text>
          <Text style={styles.progressTxt}>{tipText}</Text>
        </View>

        {/* TTS */}
        <View style={styles.ttsCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Ionicons name="musical-notes-outline" size={18} color="#0b1221" />
            <Text style={styles.ttsTitle}>¿Cómo activar la voz japonesa (TTS)?</Text>
          </View>
          <Text style={styles.ttsStep}>1) En <Text style={styles.bold}>Motor preferido</Text> elige <Text style={styles.bold}>Speech Services by Google</Text>.</Text>
          <Text style={styles.ttsStep}>2) Engranaje → <Text style={styles.bold}>Instalar datos de voz</Text> → <Text style={styles.bold}>日本語</Text> → Descargar.</Text>
          <Text style={styles.ttsStep}>3) Sube el volumen de <Text style={styles.bold}>Multimedia</Text> y prueba 🎵.</Text>

          <View style={styles.ttsActions}>
            <Pressable onPress={openSystemTTSSettings} style={({ pressed }) => [styles.ttsBtn, pressed && { opacity: 0.9 }]}><Text style={styles.ttsBtnTxt}>Abrir Ajustes</Text></Pressable>
            <Pressable onPress={openPlayStoreTTS} style={({ pressed }) => [styles.ttsBtn, pressed && { opacity: 0.9 }]}><Text style={styles.ttsBtnTxt}>Play Store (Google TTS)</Text></Pressable>
            <Pressable onPress={testJapaneseVoice} style={({ pressed }) => [styles.ttsBtnPrimary, pressed && { opacity: 0.9 }]}><Text style={styles.ttsBtnPrimaryTxt}>Probar voz</Text></Pressable>
          </View>
        </View>

        {/* Tabs — grandes, blanco/negro (seleccionables) */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              >
                <Ionicons
                  name={
                    t.includes("Actividades")
                      ? "sparkles-outline"
                      : t.includes("Grupo A")
                      ? "leaf-outline"
                      : "book-outline"
                  }
                  size={18}
                  color="#0b1221"
                />
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Etiqueta de sección grande */}
        <SectionHeader
          title={
            tab === "Grupo A"
              ? "GRUPO A"
              : tab === "Actividades A"
              ? "ACTIVIDADES A"
              : tab === "Grupo K"
              ? "GRUPO K"
              : "ACTIVIDADES K"
          }
        />

        {/* Grid */}
        <View style={styles.grid}>
          {tab === "Grupo A" && (
            <>
              <MiniTile title="Trazos" icon={<PenNib size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("TrazosGrupoA")} />
              <MiniTile title="Pronunciación" icon={<SpeakerHigh size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("PronunciacionGrupoA")} />
              <MiniTile title="Ejemplos" icon={<BookOpen size={36} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("EjemplosGrupoA")} />
              {/* Se eliminó el tile "Tema y gramática: Familia" del grid */}
            </>
          )}

          {tab === "Actividades A" && (
            <>
              <MiniTile title="Tarjetas" icon={<Cards size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("ATarjetas")} />
              <MiniTile title="Trazo animado" icon={<PencilSimpleLine size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("ATrazoAnimado")} />
              <MiniTile title="Dictado visual" icon={<Headphones size={36} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("ADictadoVisual")} />
            </>
          )}

          {tab === "Grupo K" && (
            <>
              <MiniTile title="Trazo" icon={<PenNib size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("TrazoGrupoK")} />
              <MiniTile title="Vocabulario" icon={<TextAa size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("VocabularioGrupoK")} />
            </>
          )}

          {tab === "Actividades K" && (
            <>
              <MiniTile title="Matching" icon={<ArrowsLeftRight size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("MatchingGrupoK")} />
              <MiniTile title="Memoria" icon={<Brain size={36} color="#0b1221" weight="duotone" />} onPress={() => navigation.navigate("MemoriaGrupoK")} />
              <MiniTile title="Mini-juego" icon={<GameController size={36} color="#0b1221" weight="duotone" />} span={2} onPress={() => navigation.navigate("MemoriaGrupoK")} />
            </>
          )}
        </View>

        {/* Consejo y siguiente */}
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

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB flotante */}
      <FloatingFamiliaFab onPress={() => navigation.navigate("TemaGramaticaFamiliaN5")} />
    </View>
  );
}

/* ===== Header de sección ===== */
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTxt}>{title}</Text>
    </View>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  c: { padding: H_PADDING, paddingTop: 100, gap: 12 },

  header: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 14,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#0b1221", opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 24, fontWeight: "900", color: "#0b1221", marginTop: 2 },
  sub: { marginTop: 2, color: "#0b1221", opacity: 0.8 },

  /* Nota progreso */
  progressCard: {
    marginTop: 8,
    backgroundColor: "rgba(255,235,183,0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.85)",
    padding: 12,
  },
  progressTitle: { fontWeight: "900", color: "#0b1221", marginBottom: 4, fontSize: 14 },
  progressTxt: { color: "#0b1221", opacity: 0.95, fontSize: 13 },

  /* Tarjeta TTS */
  ttsCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    padding: 12,
  },
  ttsTitle: { fontWeight: "900", color: "#0b1221" },
  ttsStep: { color: "#0b1221", marginTop: 2 },
  bold: { fontWeight: "900", color: "#0b1221" },
  ttsActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  ttsBtn: {
    paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: "#efefef", borderWidth: 1, borderColor: "#e5e7eb",
  },
  ttsBtnTxt: { color: "#0b1221", fontWeight: "800" },
  ttsBtnPrimary: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: "#B32133", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  ttsBtnPrimaryTxt: { color: "#fff", fontWeight: "900" },

  /* Tabs (seleccionables) */
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, marginBottom: 10 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBtnActive: { borderColor: "#0b1221", shadowOpacity: 0.12 },
  tabTxt: { color: "#0b1221", fontWeight: "900", fontSize: 14, letterSpacing: 0.4 },
  tabTxtActive: { color: "#0b1221" },

  /* Header de sección */
  sectionHeader: {
    marginTop: 6,
    marginBottom: 4,
    alignSelf: "flex-start",
    backgroundColor: "#ffcf9b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0C0C0C",
  },
  sectionHeaderTxt: { fontWeight: "900", color: "#0b1221", letterSpacing: 0.6 },

  /* Grid */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },

  /* Tile */
  tile: {},
  tileInner: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minHeight: 112,
  },
  tilePressed: { opacity: 0.96 },

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffcf9b",
    borderWidth: 2,
    borderColor: "#0C0C0C",
  },
  tileText: { fontWeight: "900", color: "#0b1221", fontSize: 14, textAlign: "center" },

  /* Consejo y siguiente */
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
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  nextButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  /* HERO */
  heroWrap: { marginTop: 10, marginBottom: 8, position: "relative" },
  heroGlowA: {
    position: "absolute",
    top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 235, 183, 0.25)",
  },
  heroGlowB: {
    position: "absolute",
    top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 120, 120, 0.10)",
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    padding: 14,
  },
  heroKicker: { color: "#B32133", fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },
  heroTitle: { color: "#0b1221", fontWeight: "900", fontSize: 20, marginTop: 2 },
  heroSub: { color: "#0b1221", opacity: 0.9, marginTop: 6, lineHeight: 20 },
  heroBtn: {
    marginTop: 10,
    backgroundColor: "#B32133",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  heroBtnTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  heroNote: { marginTop: 6, color: "#6b7280", fontSize: 12 },

  /* FAB */
  fabWrap: {
    position: "absolute",
    right: 16,
    bottom: 18,
    zIndex: 20,
    elevation: 20,
  },
  fabBtn: {
    backgroundColor: "#B32133",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabTxt: { color: "#fff", fontWeight: "900" },
});
