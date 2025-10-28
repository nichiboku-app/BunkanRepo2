// src/screens/N3IntroScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

type RootStackParamList = { N3Intro: undefined; CursoN3: undefined; };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3Intro">;

export default function N3IntroScreen() {
  const navigation = useNavigation<Nav>();
  const soundRef = useRef<Audio.Sound | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
    ]).start();
  }, [fade, scale]);

  useEffect(() => {
    let mounted = true;
    let t: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/audio/n3intro.mp3")
        );
        soundRef.current = sound;
        await sound.playAsync();

        t = setTimeout(() => { if (mounted) navigation.navigate("CursoN3"); }, 5000);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!mounted) return;
          if ("didJustFinish" in status && status.didJustFinish) {
            if (t) clearTimeout(t);
            navigation.navigate("CursoN3");
          }
        });
      } catch {
        t = setTimeout(() => { if (mounted) navigation.navigate("CursoN3"); }, 5000);
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

  const handleTap = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    navigation.navigate("CursoN3");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <ImageBackground
          // 🖼️ Nueva imagen WEBP
          source={require("../../assets/images/n3/n3_intro_castle.webp")}
          style={styles.full}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View pointerEvents="none" style={styles.centerOverlay}>
            <Animated.View
              style={{
                alignItems: "center",
                justifyContent: "center",
                opacity: fade,
                transform: [{ scale }, { translateX: -250 }, { translateY: -150 }],
              }}
            >
              <ExpoImage
                source={require("../../assets/images/leonn3.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Nivel N3 — León</Text>
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
    paddingHorizontal: 24
  },
  logo: { width: 120, height: 120, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: "800", color: "#000", letterSpacing: 0.4 },
});
