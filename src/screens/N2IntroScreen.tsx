// src/screens/N2IntroScreen.tsx
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
    Text,
    View,
} from "react-native";

/* ---------------- Tipos de rutas ---------------- */
type RootStackParamList = {
  N2Intro: undefined;
  CursoN2: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N2Intro">;

/* ---------------- Pantalla ---------------- */
export default function N2IntroScreen() {
  const navigation = useNavigation<Nav>();
  const soundRef = useRef<Audio.Sound | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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
    ]).start();
  }, [fade, scale]);

  // Audio + navegación automática
  useEffect(() => {
    let mounted = true;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        // Reproduce en silencio iOS y con ducking en Android
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // ⚠️ Asegúrate de tener este archivo en tu proyecto
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/audio/spooky-gongwav-14904.mp3"),
          { volume: 1.0, shouldPlay: true }
        );
        soundRef.current = sound;

        // Si por alguna razón no llega el callback, hacemos fallback
        safetyTimer = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN2");
        }, 10000);

        // Cuando termine el audio, pasamos a la pantalla del curso
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!mounted) return;
          if ("didJustFinish" in status && status.didJustFinish) {
            if (safetyTimer) clearTimeout(safetyTimer);
            navigation.navigate("CursoN2");
          }
        });
      } catch (e) {
        // Si falla el asset o la reproducción, navegamos tras 5s
        safetyTimer = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN2");
        }, 5000);
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
    navigation.navigate("CursoN2");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <ImageBackground
          // 🖼️ Fondo N2 (jardín) en WEBP
          source={require("../../assets/images/n2/n2_intro_bg.webp")}
          style={styles.full}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View pointerEvents="none" style={styles.centerOverlay}>
            <Animated.View
              style={{
                alignItems: "center",
                justifyContent: "center",
                opacity: fade,
                transform: [{ scale }],
              }}
            >
              {/* Logo PANDA */}
              <ExpoImage
                source={require("../../assets/images/cursos/n2_pandabueno.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Nivel N2 Panda</Text>
            </Animated.View>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: { width: 140, height: 140, marginBottom: 10, opacity: 0.98 },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
});
