// src/screens/N2/UnitTemplate.tsx
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type CTA = { label: string; onPress?: () => void };

type Props = {
  hero?: any;                 // require(...) o { uri }
  accent?: string;            // color principal
  breadcrumb?: string;        // "B1 · U1"
  title: string;              // título
  subtitle?: string;          // breve explicación
  ctas?: CTA[];               // botones en el header (scroll horizontal)
  progress?: number;          // 0..1 (para el FAB)
  onContinue?: () => void;    // callback FAB
  continueLabel?: string;     // texto FAB
  contentStyle?: ViewStyle;   // estilos extra para el contenedor de children
  children?: React.ReactNode; // contenido
};

const HEADER_H = 320;

export default function UnitTemplate({
  hero,
  accent = "#C01E2E",
  breadcrumb,
  title,
  subtitle,
  ctas = [],
  progress = 0,
  onContinue,
  continueLabel = "Continuar",
  contentStyle,
  children,
}: Props) {
  const handleContinue = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onContinue?.();
  };

  const pct = Math.max(0, Math.min(1, progress ?? 0));

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0C10" }}>
      <StatusBar barStyle="light-content" />

      {/* ===== CABECERA FIJA ===== */}
      <View style={styles.header} pointerEvents="auto">
        {/* Hero */}
        {hero ? (
          <ExpoImage source={hero} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0B0C10" }]} />
        )}

        {/* Scrim para legibilidad */}
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.92)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Contenido del header */}
        <View style={styles.headerContent}>
          {!!breadcrumb && <Text style={styles.breadcrumb}>{breadcrumb}</Text>}
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* CTAs — scroll horizontal */}
          {!!ctas.length && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ctaRow}
            >
              {ctas.map((c, i) => (
                <Pressable
                  key={`${c.label}-${i}`}
                  onPress={c.onPress}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={c.label}
                  style={[
                    styles.cta,
                    { borderColor: accent },
                    i === 0 && { marginLeft: 0 },
                  ]}
                  android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
                >
                  <Text style={[styles.ctaTxt, { color: accent }]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Base sólida para que no “se meta” el scroll debajo */}
        <View style={styles.headerFooter} />
      </View>

      {/* ===== CONTENIDO SCROLL (empieza DESPUÉS del header) ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingTop: HEADER_H + 10, paddingBottom: onContinue ? 130 : 24 },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* ===== FAB CONTINUAR ===== */}
      {onContinue && (
        <Pressable
          onPress={handleContinue}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
          style={[styles.fab, styles.shadow]}
        >
          <LinearGradient
            colors={[accent, "#1a1a1a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.fabTxt}>{continueLabel}</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${pct * 100}%`, backgroundColor: "#fff" }]} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const R = 16;

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: HEADER_H,
    zIndex: 20,
  },
  headerContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  headerFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 24,
    backgroundColor: "#0B0C10",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },

  breadcrumb: { color: "rgba(255,255,255,0.92)", fontWeight: "800" },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 10,
  },
  subtitle: { color: "rgba(255,255,255,0.95)", marginTop: 8, lineHeight: 18 },

  /* CTA horizontal bar */
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingRight: 4,
  },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    marginRight: 10,
  },
  ctaTxt: {
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 16,
    bottom: 38, // subido 20 px como pediste
    borderRadius: 999,
    minWidth: 160,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 6 },
    }),
  },
  fabTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },
  track: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  bar: { height: 4, borderRadius: 4 },

  /* sombra iOS */
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});
 