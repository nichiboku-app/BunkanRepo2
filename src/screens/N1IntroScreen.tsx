import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    ImageBackground,
    Pressable,
    StyleSheet,
    View
} from "react-native";

/* ---------------- Tipos de rutas ---------------- */
type RootStackParamList = {
  N1Intro: undefined;
  CursoN1: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Intro">;

/* ---------------- Pantalla ---------------- */
export default function N1IntroScreen() {
  const navigation = useNavigation<Nav>();
  const soundRef = useRef<Audio.Sound | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const glow = useRef(new Animated.Value(0)).current;

  // Animaciones iniciales
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // glow suave en loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, [fade, scale, glow]);

  // Audio + navegación automática
// Audio + navegación automática
useEffect(() => {
  let mounted = true;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;

  (async () => {
    try {
      // ✅ Config mínima compatible con SDK 54 (sin enums)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/taiko-32609.mp3"),
        { volume: 1.0 } // no usamos shouldPlay; hacemos playAsync()
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!mounted) return;
        if (!status.isLoaded) return;
        // opcional: logs de depuración
        // console.log("loaded", status.isLoaded, "pos", status.positionMillis, "playing", status.isPlaying);
        if (status.didJustFinish) {
          if (safetyTimer) clearTimeout(safetyTimer);
          navigation.navigate("CursoN1");
        }
      });

      // 🔊 forzar reproducción (clave en Android)
      await sound.playAsync();

      // Fallback por si no llega didJustFinish
      safetyTimer = setTimeout(() => {
        if (mounted) navigation.navigate("CursoN1");
      }, 10000);
    } catch (err) {
      console.warn("Audio error:", err);
      safetyTimer = setTimeout(() => mounted && navigation.navigate("CursoN1"), 5000);
    }
  })();

  return () => {
    mounted = false;
    if (safetyTimer) clearTimeout(safetyTimer);
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  };
}, [navigation]);



  // Tap para saltar
  const handleTap = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    navigation.navigate("CursoN1");
  };

  // Interpolación del brillo
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] });

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <ImageBackground
          // 🖼️ Fondo N1 (calle japonesa) en WEBP
          source={require("../../assets/images/n1/n1_intro_bg.webp")}
          style={styles.full}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View pointerEvents="none" style={styles.centerOverlay}>
            {/* Fondo circular + glow detrás del dragón */}
            <Animated.View
              style={[
                styles.logoWrap,
                { opacity: fade, transform: [{ scale }] },
              ]}
            >
              {/* Glow pulsante */}
              <Animated.View
                style={[
                  styles.glow,
                  { opacity: glowOpacity, transform: [{ scale: glowScale }] },
                ]}
              />
              {/* Disco base y anillo */}
              <View style={styles.disc} />
              <View style={styles.ring} />

              {/* Logo del dragón */}
              <ExpoImage
                source={require("../../assets/images/cursos/n1_dragon.webp")}
                style={styles.logo}
                contentFit="contain"
              />
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity: fade, transform: [{ scale }] }]}>
              Nivel Dragón N1
            </Animated.Text>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

/* ---------------- Estilos ---------------- */
const styles = StyleSheet.create({
  full: { flex: 1, width: "100%", height: "100%" },
  centerOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  /* === Fondo para el logo === */
  logoWrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  // brillo suave expandible
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#FF3648", // rojo dragón
    shadowColor: "#FF1C2E",
    shadowOpacity: 0.9,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  // disco base detrás del logo (oscuro translúcido)
  disc: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  // anillo fino externo
  ring: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
  },
  logo: { width: 160, height: 160, opacity: 0.98 },

  title: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
});
