// src/screens/N4/N4TopicScreen.tsx
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

type RootStackParamList = {
  N4_Tema: { id: number; title: string };
};

type N4TopicRoute = RouteProp<RootStackParamList, "N4_Tema">;

export default function N4TopicScreen() {
  const navigation = useNavigation();
  const route = useRoute<N4TopicRoute>();
  const { id, title } = route.params ?? { id: 0, title: "Tema N4" };

  // Fondo animado suave (distinto a N5 y a la lista N4)
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 6000, useNativeDriver: false }),
        Animated.timing(t, { toValue: 0, duration: 6000, useNativeDriver: false }),
      ])
    ).start();
  }, [t]);

  const cA = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F6EAF4", "#EDE7FB"], // lila/rosa pastel
  });
  const cB = t.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFF7FE", "#FDF3FF"],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#ffffff", "#fffafc"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.bgBlob, { backgroundColor: cA, top: -H * 0.15, left: -W * 0.2 }]} />
        <Animated.View style={[styles.bgBlob, { backgroundColor: cB, bottom: -H * 0.2, right: -W * 0.1 }]} />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header propio con botón atrás */}
        <View style={styles.header}>
          <Pressable
            onPress={() => (navigation as any).goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {title.replace(/^\d+\.\s*/, "")}
            </Text>
            <Text style={styles.headerSub}>Tema {id} · Nivel N4</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* CTA inicio rápido */}
          <LinearGradient colors={["#F2CBD8", "#E9B9D0"]} style={styles.cta}>
            <Text style={styles.ctaTitle}>¡Empecemos!</Text>
            <Text style={styles.ctaText}>
              Practica el vocabulario y la gramática clave del tema {id}. Al final podrás hacer un mini
              simulacro con diálogo realista.
            </Text>
            <View style={styles.ctaRow}>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [styles.ctaBtn, pressed && { transform: [{ translateY: 1 }] }]}
              >
                <Text style={styles.ctaBtnText}>Vocabulario</Text>
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [styles.ctaBtn, pressed && { transform: [{ translateY: 1 }] }]}
              >
                <Text style={styles.ctaBtnText}>Gramática</Text>
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [styles.ctaBtn, pressed && { transform: [{ translateY: 1 }] }]}
              >
                <Text style={styles.ctaBtnText}>Diálogo</Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Bloques de progreso/estado (placeholders, luego los conectamos a Firestore) */}
          <View style={styles.grid}>
            <View style={styles.tile}>
              <Text style={styles.tileTitle}>Progreso</Text>
              <Text style={styles.tileText}>0% completado</Text>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileTitle}>Recompensas</Text>
              <Text style={styles.tileText}>0 logros</Text>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileTitle}>Favoritos</Text>
              <Text style={styles.tileText}>0 guardados</Text>
            </View>
          </View>

          {/* Contenido principal (plantilla) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Objetivos del tema</Text>
            <Text style={styles.cardText}>
              • Identificar expresiones clave del tema.{"\n"}
              • Usar estructuras gramaticales propias del N4.{"\n"}
              • Practicar con oraciones modelo y diálogo breve.{"\n"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gramática destacada</Text>
            <Text style={styles.cardText}>
              Añade aquí la lista de patrones (por ejemplo, 「〜から」「〜ので」, condicionales, causativo/pasivo, etc.).
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mini diálogo</Text>
            <Text style={styles.cardText}>
              Escribe un diálogo corto que represente una situación real del tema {id}. Luego lo convertiremos en
              ejercicio interactivo (escucha, completa, ordena la frase, etc.).
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgBlob: {
    position: "absolute",
    width: W * 1.3,
    height: H * 0.8,
    borderRadius: W,
    opacity: 0.55,
    transform: [{ rotate: "18deg" }],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 26, fontWeight: "900", color: "#5C0A14", marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#5C0A14" },
  headerSub: { fontSize: 12, fontWeight: "700", color: "#7E0D18", opacity: 0.8 },

  cta: {
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ctaTitle: { fontSize: 18, fontWeight: "900", color: "#4E0E17", marginBottom: 4 },
  ctaText: { color: "#4E0E17", fontWeight: "600", opacity: 0.85 },
  ctaRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  ctaBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(180,120,140,0.25)",
  },
  ctaBtnText: { fontWeight: "900", color: "#5C0A14" },

  grid: { flexDirection: "row", gap: 10, marginTop: 14 },
  tile: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.25)",
  },
  tileTitle: { fontWeight: "900", color: "#531019", marginBottom: 6 },
  tileText: { color: "#531019", opacity: 0.85, fontWeight: "600" },

  card: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(190,120,140,0.25)",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#3E0B12", marginBottom: 6 },
  cardText: { color: "#3E0B12", fontWeight: "600", opacity: 0.9, lineHeight: 20 },
});
