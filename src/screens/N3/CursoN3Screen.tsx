import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  CursoN3: undefined;

  // ✅ Rutas REALES registradas en App.tsx
  N3_Unit: { block: number; unit: number; title: string } | undefined; // 01 Metas y finalidad
  N3_Block1_Unit2: undefined; // 02 Decisiones & cambios

  // ✅ PRUEBA FINAL (debe existir también en App.tsx)
  N3_FinalExam: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "CursoN3">;

type Unit = { title: string; minutes?: number; icon?: string; color?: string };
type Block = { emoji: string; title: string; accent: string; units: Unit[] };

/* --------- Marco japonés en esquinas --------- */
function Corners({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={styles.cornersWrap}>
      <View style={[styles.corner, styles.tl, { borderColor: color }]} />
      <View style={[styles.corner, styles.tr, { borderColor: color }]} />
      <View style={[styles.corner, styles.bl, { borderColor: color }]} />
      <View style={[styles.corner, styles.br, { borderColor: color }]} />
    </View>
  );
}

/* ---------------- Screen ---------------- */
export default function CursoN3Screen() {
  const navigation = useNavigation<Nav>();

  // ===== Mapa de rutas por Bloque/Unidad =====
  const ROUTES = useMemo(
    () =>
      [
        // BLOQUE 1 — Propósitos, decisiones y acciones
        [
          "N3_Unit",           // 01 Metas y finalidad
          "N3_Block1_Unit2",   // 02 Decisiones & cambios
          "N3_Block1_Unit3",   // 03 Hábitos y rutinas
          "N3_Block1_Unit4",   // 04 Acciones “sin…”
          "N3_Block1_Unit5",   // 05 Reglas y permisos
        ],
        // BLOQUE 2 — Opiniones...
        ["N3_B2_U1", "N3_B2_U2_Practice", "N3_B2_U3_Practice", "N3_B2_U4_Practice", "N3_B2_U10_Practice"],
        // BLOQUE 3 — Condicionales...
        ["N3_B3_U1_Practice", "N3_B3_U2_Practice", "N3_B3_U3_Practice", "N3_B3_U4_Practice", "N3_B3_U5_Practice"],
        // BLOQUE 4 — Tiempo...
        ["N3_B4_U1_Practice", "N3_B4_U2_Practice", "N3_B4_U3_Practice", "N3_B4_U4_Practice", "N3_B4_U20_Practice"],
        // BLOQUE 5 — Relaciones...
        ["N3_B5_U1_Practice", "N3_B5_U2_Practice", "N3_B5_U3_Practice", "N3_B5_U4_Practice", "N3_B5_U5_Practice"],
        // BLOQUE 6 — Japonés real...
        ["N3_B6_U2_Practice", "N3_B6_U3_Practice", "N3_B6_U4_Practice","N3_B6_U5_Practice", "N3_B6_U6_Practice"],
      ] as const,
    []
  );

  // ===== DATA (títulos + iconos) =====
  const BLOCKS: Block[] = useMemo(
    () => [
      {
        emoji: "🧠",
        title: "BLOQUE 1 — Propósitos, decisiones y acciones",
        accent: "#F97316",
        units: [
          { title: "Metas y finalidad", minutes: 12, icon: "target", color: "#F97316" },
          { title: "Decisiones & cambios", minutes: 12, icon: "repeat-variant", color: "#EF4444" },
          { title: "Hábitos y rutinas", minutes: 10, icon: "clock-time-three-outline", color: "#10B981" },
          { title: "Acciones “sin…”", minutes: 9, icon: "block-helper", color: "#6B7280" },
          { title: "Reglas y permisos", minutes: 12, icon: "shield-check-outline", color: "#3B82F6" },
        ],
      },
      {
        emoji: "🗣",
        title: "BLOQUE 2 — Opiniones, conjeturas y apariencias",
        accent: "#3B82F6",
        units: [
          { title: "Apariencias y suposiciones", minutes: 12, icon: "eye-outline", color: "#3B82F6" },
          { title: "Lo que se dice / fuentes", minutes: 11, icon: "newspaper-variant-outline", color: "#8B5CF6" },
          { title: "Conclusiones y matices", minutes: 11, icon: "puzzle-outline", color: "#06B6D4" },
          { title: "Intuiciones y sensaciones", minutes: 9, icon: "star-four-points-outline", color: "#F59E0B" },
          { title: "Certeza y convicción", minutes: 10, icon: "check-decagram-outline", color: "#10B981" },
        ],
      },
      {
        emoji: "🌀",
        title: "BLOQUE 3 — Condicionales e hipótesis",
        accent: "#06B6D4",
        units: [
          { title: "Condiciones reales", minutes: 10, icon: "weather-partly-cloudy", color: "#06B6D4" },
          { title: "Condiciones hipotéticas", minutes: 10, icon: "flask-outline", color: "#8B5CF6" },
          { title: "Concesiones", minutes: 10, icon: "handshake-outline", color: "#10B981" },
          { title: "Suposiciones irreales", minutes: 10, icon: "brain", color: "#F43F5E" },
          { title: "Intenciones y planes", minutes: 10, icon: "calendar-clock", color: "#F59E0B" },
        ],
      },
      {
        emoji: "⏱",
        title: "BLOQUE 4 — Tiempo, secuencia y contexto",
        accent: "#10B981",
        units: [
          { title: "Durante / mientras", minutes: 10, icon: "timeline-clock-outline", color: "#10B981" },
          { title: "Antes / después", minutes: 10, icon: "swap-vertical", color: "#3B82F6" },
          { title: "Simultaneidad", minutes: 9, icon: "magic-staff", color: "#F59E0B" },
          { title: "Cambios graduales", minutes: 10, icon: "chart-areaspline", color: "#06B6D4" },
          { title: "Acciones repentinas", minutes: 10, icon: "lightning-bolt-outline", color: "#EF4444" },
        ],
      },
      {
        emoji: "📊",
        title: "BLOQUE 5 — Relaciones y comparación",
        accent: "#8B5CF6",
        units: [
          { title: "Acumulación & contraste", minutes: 10, icon: "plus-minus-variant", color: "#8B5CF6" },
          { title: "Causa / agente", minutes: 9, icon: "source-branch", color: "#10B981" },
          { title: "Relación y comparación", minutes: 10, icon: "scale-balance", color: "#F97316" },
          { title: "Tema y referencia", minutes: 9, icon: "label-outline", color: "#3B82F6" },
          { title: "Según / de acuerdo con", minutes: 9, icon: "bullhorn-outline", color: "#EF4444" },
        ],
      },
      {
        emoji: "🌏",
        title: "BLOQUE 6 — Japonés real y situaciones",
        accent: "#EF4444",
        units: [
          { title: "Consejos y sugerencias", minutes: 10, icon: "lightbulb-on-outline", color: "#F59E0B" },
          { title: "Pedir con cortesía", minutes: 9, icon: "hand-heart-outline", color: "#10B981" },
          { title: "Reacciones naturales", minutes: 9, icon: "emoticon-surprised-outline", color: "#3B82F6" },
          { title: "Opiniones con matiz", minutes: 10, icon: "tune-variant", color: "#8B5CF6" },
          { title: "Modismos & recordatorios", minutes: 9, icon: "comment-quote-outline", color: "#06B6D4" },
        ],
      },
    ],
    []
  );

  // ===== Parallax héroe =====
  const heroH = 360;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-40, 0, 40] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  // ===== Navegación por tema =====
  const openUnit = (blockIdx: number, unitIdx: number, title: string) => {
    const routeName = ROUTES[blockIdx]?.[unitIdx];

    if (routeName === "N3_Unit") {
      navigation.navigate("N3_Unit", { block: blockIdx + 1, unit: unitIdx + 1, title });
      return;
    }

    if (routeName) {
      navigation.navigate(routeName as any);
    } else {
      navigation.navigate("N3_Unit", { block: blockIdx + 1, unit: unitIdx + 1, title });
    }
  };

  // ===== Ir a la prueba final =====
  const goToFinalExam = () => navigation.navigate("N3_FinalExam");

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ==== HERO ==== */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../assets/images/n3_hero_leon.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <BlurView tint="dark" intensity={28} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroInner}>
            <ExpoImage
              source={require("../../../assets/images/leon_blanco_transparente.webp")}
              style={styles.heroMark}
              contentFit="contain"
            />
            <Text style={styles.heroTitle}>Nivel N3 — León 「中級」</Text>

            <View style={styles.chipsRow}>
              <View style={styles.chip}><Text style={styles.chipTxt}>JLPT N3</Text></View>
              <View style={styles.chip}><Text style={styles.chipTxt}>Intermedio</Text></View>
              <View style={styles.chip}><Text style={styles.chipTxt}>6 bloques · 30 temas</Text></View>
            </View>

            <Text style={styles.heroSub}>
              Domina estructuras intermedias para conversar con naturalidad, entender textos y audios más complejos,
              y aprobar el JLPT N3.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ==== CONTENIDO ==== */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Plan */}
        <View style={styles.cardIntro}>
          <Text style={styles.cardTitle}>📘 Plan completo — Nivel N3</Text>
          <Text style={styles.cardBody}>
            Objetivo general: dominar estructuras intermedias del japonés para comunicarse con naturalidad,
            comprender textos y audios más complejos, y aprobar el examen JLPT N3.
          </Text>
        </View>

        {/* Bloques → Unidades clicables */}
        {BLOCKS.map((b, bi) => (
          <View key={bi} style={[styles.blockCard, { borderColor: b.accent }]}>
            <Text style={styles.blockHeader}>{b.emoji} {b.title}</Text>
            <Corners color={b.accent} />

            <View style={styles.unitGrid}>
              {b.units.map((u, ui) => {
                const isLast = ui === b.units.length - 1;
                return (
                  <Pressable
                    key={ui}
                    style={[
                      styles.unit,
                      isLast && styles.unitSpan2,
                      { borderColor: b.accent },
                    ]}
                    onPress={() => openUnit(bi, ui, u.title)}
                  >
                    <LinearGradient colors={["#FFFFFF", "#F6F7FB"]} style={StyleSheet.absoluteFill} />

                    <View style={styles.unitHead}>
                      <View style={[styles.unitBadge, { backgroundColor: b.accent }]}>
                        <Text style={styles.unitBadgeTxt}>{String(ui + 1).padStart(2, "0")}</Text>
                      </View>
                      {!!u.icon && <MCI name={u.icon as any} size={22} color={u.color || b.accent} />}
                    </View>

                    <Text style={styles.unitTitle} numberOfLines={2}>{u.title}</Text>

                    <View style={styles.unitFooter}>
                      <Text style={[styles.unitMeta, { color: b.accent }]}>{u.minutes ?? 10} min</Text>
                      <Text style={[styles.unitCta, { color: b.accent }]}>Ver unidad ›</Text>
                    </View>

                    <Corners color={b.accent} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* PRUEBA FINAL */}
        <Pressable style={styles.examCard} onPress={goToFinalExam}>
          <LinearGradient colors={["#E31D1A", "#AF0F2A"]} style={StyleSheet.absoluteFill} />
          <Text style={styles.examTitle}>🦁 Prueba final — Nivel N3</Text>
          <Text style={styles.examSub}>Simulacro JLPT N3 • Lectura • Gramática • Audio</Text>
          <View style={styles.examPills}>
            <View style={styles.examPill}><Text style={styles.examPillTxt}>40 preguntas</Text></View>
            <View style={styles.examPill}><Text style={styles.examPillTxt}>Tiempo: 45 min</Text></View>
            <View style={styles.examPill}><Text style={styles.examPillTxt}>Certifica tu avance</Text></View>
          </View>
          <Text style={styles.examCta}>Comenzar evaluación ›</Text>
        </Pressable>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const R = 18;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },

  /* HERO */
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  heroInner: { alignItems: "center", textAlign: "center" },
  heroMark: { width: 88, height: 88, marginBottom: 6, opacity: 0.96, alignSelf: "center" },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowRadius: 12,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  heroSub: {
    color: "rgba(255,255,255,0.96)",
    marginTop: 8,
    lineHeight: 20,
    textAlign: "center",
  },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8, justifyContent: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  chipTxt: { color: "#fff", fontWeight: "800" },

  /* INTRO */
  cardIntro: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#121319",
    borderRadius: R,
    padding: 16,
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  cardBody: { color: "rgba(255,255,255,0.92)" },

  /* BLOQUES */
  blockCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: R,
    backgroundColor: "#fff",
    padding: 14,
    borderWidth: 1.5,
  },
  blockHeader: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 10 },

  /* GRID */
  unitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  unit: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  unitSpan2: { width: "100%" },
  unitHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  unitBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  unitBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
  unitTitle: { marginTop: 8, fontWeight: "800", color: "#0E1015" },
  unitFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  unitMeta: { fontWeight: "800" },
  unitCta: { fontWeight: "900" },

  /* Marco japonés (esquinas en L) */
  cornersWrap: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  corner: { position: "absolute", width: 16, height: 16, borderRadius: 2 },
  tl: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },

  /* EXAMEN FINAL */
  examCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
  },
  examTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  examSub: { color: "rgba(255,255,255,0.95)", marginTop: 6 },
  examPills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  examPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  examPillTxt: { color: "#fff", fontWeight: "800" },
  examCta: { color: "#fff", fontWeight: "900", marginTop: 12, textAlign: "right" },
});
