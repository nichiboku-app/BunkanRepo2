import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Dimensions,
  InteractionManager,
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

export default function B6VidaCotidianaMenu() {
  const navigation = useNavigation<Nav>();
  const [isPushing, setIsPushing] = useState(false);

  const cards = [
    { icon: "cart-outline", label: "Compras", route: "B6_Compras" as const },
    { icon: "restaurant-outline", label: "Restaurante", route: "B6_Restaurante" as const },
    { icon: "train-outline", label: "Transporte", route: "B6_Transporte" as const },
    { icon: "cash-outline", label: "Dinero", route: "B6_Dinero" as const },
    { icon: "map-outline", label: "Direcciones", route: "B6_Direcciones" as const },
    { icon: "pricetags-outline", label: "Tiendas", route: "B6_Tiendas" as const },
    { icon: "bed-outline", label: "Hotel", route: "B6_Hotel" as const },
    { icon: "medkit-outline", label: "Emergencias", route: "B6_Emergencias" as const },
  ];

  function go(route: keyof RootStackParamList) {
    if (isPushing) return; // antirebote por si hay doble tap
    setIsPushing(true);
    Vibration.vibrate(8);
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(route);
      // liberamos el bloqueo tras un pequeño tiempo
      setTimeout(() => setIsPushing(false), 500);
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1221" }}>
      {/* Fondo estático, cero animaciones */}
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
      {/* halos suaves (sin animar) */}
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

      {/* Contenido */}
      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.kicker}>⛩️ Bloque 6</Text>
          <Text style={s.h}>Vida cotidiana</Text>
          <Text style={s.sub}>Frases y situaciones útiles: compras, restaurante, transporte & más.</Text>
        </View>

        {/* Chips de “atajos” (horizontal ≠ orientación principal, así no choca) */}
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
          {cards.map((c) => (
            <Pressable
              key={c.label}
              onPress={() => go(c.route)}
              accessibilityRole="button"
              android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
              style={s.card}
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

        {/* Nota */}
        <View style={s.note}>
          <Text style={s.noteTitle}>¿Qué veremos aquí?</Text>
          <Text style={s.noteTxt}>
            Practicaremos frases cortas y claras para la vida real en Japón: pedir comida,
            preguntar precios, comprar boletos y moverse en tren o bus. Todo con ejemplos
            sencillos, paso a paso, como si fuera un juego.
          </Text>
        </View>

        <View style={{ height: 36 }} />
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
    flexBasis: (W - 16 * 2 - 12) / 2,
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
