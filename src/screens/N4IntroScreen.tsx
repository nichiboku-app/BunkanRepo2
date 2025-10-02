// src/screens/N4IntroScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import React, { useEffect, useRef } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";

type RootStackParamList = {
  N4Intro: undefined;
  CursoN4: undefined; // ← pantalla donde están todos los temas (tu lista del nivel N4)
};

type Nav = NativeStackNavigationProp<RootStackParamList, "N4Intro">;

export default function N4IntroScreen() {
  const navigation = useNavigation<Nav>();
  const soundRef = useRef<Audio.Sound | null>(null);

  // ⏯️ Reproduce audio (si lo agregas) y navega automáticamente al terminar.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 🔊 Cuando tengas el archivo, descomenta las 2 líneas de "require".
         const { sound } = await Audio.Sound.createAsync(
          require("../../assets/audio/sakurajapanese2.mp3") // <-- coloca aquí tu mp3
         );
         soundRef.current = sound;
         await sound.playAsync();

        // ⏱️ Navegación automática con o sin audio (fallback 3.5s)
        const t = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN4");
        }, 3500);

        // Si decides usar el audio, puedes navegar al terminar:
         sound.setOnPlaybackStatusUpdate((status) => {
           if (!mounted) return;
           if (status.isLoaded && status.didJustFinish) {
            navigation.navigate("CursoN4");
          }
         });

        return () => clearTimeout(t);
      } catch (e) {
        // Si falla audio, hacemos fallback rápido
        const t = setTimeout(() => {
          if (mounted) navigation.navigate("CursoN4");
        }, 1500);
        return () => clearTimeout(t);
      }
    })();

    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [navigation]);

  // 👆 Un toque en la imagen también avanza de inmediato
  const handleTap = () => navigation.navigate("CursoN4");

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <ImageBackground
          source={require("../../assets/images/n4.webp")} // coloca aquí tu n4.webp
          style={styles.full}
          imageStyle={{ resizeMode: "cover" }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%", height: "100%" },
});
