// src/screens/N5/B5Gramatica/B5GramaticaIIMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";
import type { RootStackParamList } from "../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Item = {
  key: keyof RootStackParamList;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const { width: W, height: H } = Dimensions.get("window");

/** ===================== Sakura Petals ===================== */
const PETALS = 16;
function Petal({ delay = 0 }: { delay?: number }) {
  const fall = useRef(new Animated.Value(0)).current; // 0 -> 1
  const x0 = useRef(Math.random() * W).current;
  const size = useRef(16 + Math.random() * 16).current; // 16–32
  const duration = useRef(9000 + Math.random() * 6000).current; // 9–15s
  const drift = useRef(20 + Math.random() * 40).current; // sway
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${Math.random() > 0.5 ? "" : "-"}360deg`],
  });
  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, H + 60],
  });
  const translateX = fall.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [x0 - drift, x0 + drift, x0 - drift],
  });
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(fall, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duration, fall]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: size,
        transform: [{ translateX }, { translateY }, { rotate }],
        opacity: Platform.select({ ios: 0.9, android: 0.85, default: 0.9 }),
      }}
    >
      🌸
    </Animated.Text>
  );
}

export default function B5GramaticaIIMenu() {
  const nav = useNavigation<Nav>();
  const { playCorrect, ready } = useFeedbackSounds();

  const items: Item[] = useMemo(
    () => [
      { key: "B5_Contadores", title: "Contadores（助数詞）", subtitle: "人・本・枚・匹…", icon: "file-tray-stacked-outline" },
      { key: "B5_TiempoPuntos", title: "Tiempo: puntos", subtitle: "Horas y fechas con に", icon: "time-outline" },
      { key: "B5_TiempoDuracion", title: "Tiempo: duración", subtitle: "～間 / から / まで", icon: "hourglass-outline" },
      { key: "B5_Frecuencia", title: "Frecuencia", subtitle: "週に2回・ときどき…", icon: "repeat-outline" },
      { key: "B5_AdverbiosFrecuencia", title: "Adverbios de frecuencia", subtitle: "いつも・よく・たいてい…", icon: "pulse-outline" },
      { key: "B5_DiasMeses", title: "Días y meses", subtitle: "Fechas y excepciones", icon: "calendar-outline" },
      { key: "B5_HorariosRutina", title: "Horarios y rutina", subtitle: "に para horarios", icon: "alarm-outline" },
      { key: "B5_VecesContador", title: "Veces: ～回", subtitle: "いっかい・にかい・さんかい…", icon: "reload-outline" },
      { key: "B5_ParticulasTiempo", title: "Partículas de tiempo", subtitle: "に・から・まで・ごろ・ぐらい", icon: "layers-outline" },
    ],
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.9 }}
      >
        {/* Lluvia de pétalos */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: PETALS }).map((_, i) => (
            <Petal key={i} delay={i * 450} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c}>
          <View style={s.headerWrap}>
            <Text style={s.preH}>⛩️ 文法 II</Text>
            <Text style={s.h}>Bloque 5: Gramática II</Text>
            <Text style={s.sub}>
              👉 Contadores, tiempo, frecuencia… <Text style={{ fontSize: 12 }}>（助数詞・時間・頻度）</Text>
            </Text>
          </View>

          {/* Tarjeta de nota / introducción */}
          <View style={s.note}>
            <Text style={s.noteTitle}>Guía rápida</Text>
            <Text style={s.noteTxt}>
              Practica cuándo usar <Text style={s.bold}>に</Text> para puntos de tiempo,{" "}
              <Text style={s.bold}>～間</Text> para duración, <Text style={s.bold}>～回</Text> para “veces”, y domina los
              contadores básicos (人・本・枚・匹). ¡Todo con ejemplos claros y audio!
            </Text>
          </View>

          {/* Grid de tarjetas */}
          <View style={s.grid}>
            {items.map((it) => (
              <Card
                key={String(it.key)}
                title={it.title}
                subtitle={it.subtitle}
                icon={it.icon}
                onPress={async () => {
                  Vibration.vibrate(10);
                  if (ready) await playCorrect();
                  nav.navigate(it.key as any);
                }}
              />
            ))}
          </View>

          {/* Espaciado final para scroll confortable */}
          <View style={{ height: 32 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

function Card({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  const animateOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        style={s.cardInner}
      >
        <View style={s.cardHeader}>
          <Ionicons name={icon} size={22} />
          <Text style={s.cardTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

/** ===================== Estilos ===================== */
const WASHI = "rgba(255,255,255,0.86)";
const BORDER = "#e8dcc8"; // tono papel washi
const INK = "#3b2f2f"; // tinta café oscuro

const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },
  headerWrap: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  preH: {
    fontSize: 12,
    letterSpacing: 1,
    color: INK,
    opacity: 0.8,
    marginBottom: 2,
    fontWeight: "700",
  },
  h: { fontSize: 22, fontWeight: "900", color: INK },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },
  note: {
    backgroundColor: "rgba(255,251,240,0.92)", // pergamino suave
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  noteTitle: { fontWeight: "900", marginBottom: 6, color: INK },
  noteTxt: { color: INK, lineHeight: 18 },
  bold: { fontWeight: "900", color: INK },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    width: "48%", // dos columnas
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInner: { padding: 14, borderRadius: 18 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cardTitle: { fontWeight: "800", fontSize: 14, color: INK, flexShrink: 1 },
  cardSub: { fontSize: 12, opacity: 0.9, color: INK },
});
