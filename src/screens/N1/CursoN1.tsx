// src/screens/N1/CursoN1Screen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RootStackParamList = {
  N1Intro: undefined;
  CursoN1: undefined;
  N1Home: undefined;   // ✅ nueva ruta de destino
  Home?: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "CursoN1">;

const { width, height } = Dimensions.get("window");

// Helper para animaciones “wow”
const createAnim = () => ({
  fade: new Animated.Value(0),
  scale: new Animated.Value(0.9),
});

const SLIDES = [
  {
    key: "go",
    gradFrom: "#0BC0E2",
    gradTo: "#0B2230",
    btn: "#43C6FF",
    dot: "#0CE0FF",
    hero: require("../../../assets/images/logos/pag1.webp"),
    title: "¡Conoce tu nivel Dragón!",
    body: "Vive la experiencia completa: gramática real, audición nativa, lectura crítica y kanji N1.",
    tilt: -12,
    offsetX: -40,
  },
  {
    key: "modules",
    gradFrom: "#7F2B76",
    gradTo: "#2A103C",
    btn: "#B480FF",
    dot: "#D7A7FF",
    hero: require("../../../assets/images/logos/pag2.webp"),
    title: "Elige tus módulos favoritos",
    body: "Lectura NHK, Listening JLPT, Gramática avanzada y Vocabulario temático. Activa tus favoritos.",
    tilt: -10,
    offsetX: -28,
  },
  {
    key: "kanji",
    gradFrom: "#F0B434",
    gradTo: "#4C2F00",
    btn: "#FFC44D",
    dot: "#FFE6AA",
    hero: require("../../../assets/images/logos/pag3.webp"),
    title: "Kanji N1 con propósito",
    body: "Frecuencia + ejemplos reales + audio + pruebas rápidas. Entra al modo ‘Examen’.",
    tilt: -10,
    offsetX: -30,
  },
] as const;

export default function CursoN1Screen() {
  const navigation = useNavigation<Nav>();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView | null>(null);
  const animations = useMemo(() => SLIDES.map(() => createAnim()), []);

  const last = index === SLIDES.length - 1;

  /** Efecto al entrar: reproduce animación de la primera pantalla */
  useEffect(() => {
    playAnim(0);
  }, []);

  /** Reproduce animaciones “wow” */
  const playAnim = (i: number) => {
    Animated.parallel([
      Animated.timing(animations[i].fade, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(animations[i].scale, {
        toValue: 1,
        speed: 0.8,
        bounciness: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /** Maneja scroll lateral */
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) {
      setIndex(i);
      playAnim(i);
    }
  };

  /** Botones */
  const goNext = () => {
    if (!last && ref.current) {
      ref.current.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      // ✅ Ir al home de N1 al terminar el slider
      navigation.replace("N1Home"); 
      // Si N1Home está DENTRO del Drawer:
      // navigation.navigate("Home" as never, { screen: "N1Home" } as never);
    }
  };

  const skip = () => {
    // ✅ También saltar directo al home de N1
    navigation.replace("N1Home");
    // Alternativa si vive en el Drawer:
    // navigation.navigate("Home" as never, { screen: "N1Home" } as never);
  };

  /** Dots */
  const dots = useMemo(
    () =>
      SLIDES.map((s, i) => (
        <View
          key={s.key}
          style={[
            styles.dot,
            {
              backgroundColor: s.dot,
              opacity: index === i ? 1 : 0.35,
              transform: [{ scale: index === i ? 1.2 : 1 }],
            },
          ]}
        />
      )),
    [index]
  );

  const parallaxFor = (i: number, base: number) => {
    const dist = i - index;
    return base + dist * 10;
  };

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* Dots arriba + Saltar */}
      <View style={styles.topRow}>
        <View style={styles.dotsTop}>{dots}</View>
        <Pressable onPress={skip} hitSlop={16} style={styles.skipBtn}>
          <Text style={styles.skip}>Saltar</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s, i) => (
          <View key={s.key} style={{ width, height }}>
            <LinearGradient colors={[s.gradFrom, s.gradTo]} style={styles.gradient} />

            {/* Imagen hero con animación */}
            <Animated.View
              style={{
                opacity: animations[i].fade,
                transform: [
                  { scale: animations[i].scale },
                  { rotate: `${s.tilt}deg` },
                ],
              }}
            >
              <ExpoImage
                source={s.hero}
                style={[
                  styles.hero,
                  {
                    top: parallaxFor(i, 80),
                    left: parallaxFor(i, s.offsetX),
                  },
                ]}
                contentFit="contain"
              />
            </Animated.View>

            {/* Panel inferior */}
            <View style={styles.bottomPanel}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>

              <Pressable style={[styles.cta, { backgroundColor: s.btn }]} onPress={goNext}>
                <Text style={styles.ctaLabel}>{last ? "Empezar N1" : "Continuar"}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------------------- styles ---------------------------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0B0B" },
  gradient: { ...StyleSheet.absoluteFillObject },

  topRow: {
    position: "absolute",
    top: 12 + (StatusBar.currentHeight ?? 0),
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dotsTop: { alignSelf: "center", flexDirection: "row", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 5 },
  skipBtn: { position: "absolute", right: 16, top: 0, padding: 6 },
  skip: { color: "rgba(255,255,255,0.9)", fontWeight: "800", letterSpacing: 0.3 },

  hero: {
    position: "absolute",
    width: width * 1.05,
    height: height * 0.60,
  },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  body: {
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginHorizontal: 8,
    marginBottom: 18,
  },
  cta: {
    alignSelf: "center",
    width: width - 40,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 8,
  },
  ctaLabel: { color: "#0A0F14", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
});
