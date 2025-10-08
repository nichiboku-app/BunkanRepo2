// src/screens/N4IntroScreen.tsx
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

type RootStackParamList = {
  N4Intro: undefined;
  CursoN4: undefined; // lista del nivel N4
};

type Nav = NativeStackNavigationProp<RootStackParamList, "N4Intro">;

export default function N4IntroScreen() {
  const navigation = useNavigation<Nav>();
  const soundRef = useRef<Audio.Sound | null>(null);

  // Animaciones sutiles
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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

  // Reproduce audio (opcional) y navega automáticamente
  useEffect(() => {
    let mounted = true;
    let t: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/audio/sakurajapanese2.mp3")
        );
        soundRef.current = sound;
        await sound.playAsync();

        t = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN4");
        }, 3500);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!mounted) return;
          if ("didJustFinish" in status && status.didJustFinish) {
            if (t) clearTimeout(t);
            navigation.navigate("CursoN4");
          }
        });
      } catch {
        t = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN4");
        }, 1500);
      }
    })();

    return () => {
      mounted = false;
      if (t) clearTimeout(t);
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [navigation]);

  // Tap para saltar inmediatamente
  const handleTap = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    navigation.navigate("CursoN4");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <ImageBackground
          source={require("../../assets/images/n4.webp")}
          style={styles.full}
          imageStyle={{ resizeMode: "cover" }}
        >
          {/* Overlay centrado (no bloquea el tap) */}
          <View pointerEvents="none" style={styles.centerOverlay}>
            <Animated.View
              style={{
                alignItems: "center",
                justifyContent: "center",
                opacity: fade,
                transform: [
                  { scale },
                  { translateX: -250 }, // ⬅️ 250 px a la izquierda
                  { translateY: -150 },  // ⬆️ 30 px hacia arriba
                ],
              }}
            >
              <ExpoImage
                source={require("../../assets/images/zorron4.webp")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Nivel Zorro N4</Text>
            </Animated.View>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%", height: "100%" },
  centerOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,   // mitad del tamaño original
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 14, // mitad del tamaño original
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.4,
  },
});
