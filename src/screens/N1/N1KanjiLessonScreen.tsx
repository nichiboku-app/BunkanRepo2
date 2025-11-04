// src/screens/N1/N1KanjiLessonScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { N1_KANJIVG } from "../../data/n1_kanjivg";

type Word = { jp: string; reading: string; es: string };

type RootStackParamList = {
  N1KanjiLesson: {
    id: string; hex: string; kanji: string;
    on: string[]; kun: string[]; es: string;
    words: Word[];
  };
  // Pasamos TODO al Quiz para evitar "undefined"
  N1Quiz: {
    id: string; hex: string; kanji: string;
    es: string; on: string[]; kun: string[]; words: Word[];
  };
  // El juego necesita estos campos
  N1Game: { id: string; hex: string; kanji: string; es: string; words: Word[] };
};

type Nav = NativeStackNavigationProp<RootStackParamList, "N1KanjiLesson">;

const { width } = Dimensions.get("window");
const PROGRESS_KEY = "n1_kanji_progress_v1";

const speakJP = (t: string) => {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
};
const speakES = (t: string) => {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
};

export default function N1KanjiLessonScreen() {
  const nav = useNavigation<Nav>();
  const { params } = useRoute() as any;
  const { id, hex, kanji, on, kun, es, words } = params as RootStackParamList["N1KanjiLesson"];

  const markOk = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      set.add(id);
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
    } catch {}
    nav.goBack();
  };

  const startQuiz = () => {
    nav.navigate("N1Quiz", { id, hex, kanji, es, on, kun, words });
  };

  const startGame = () => {
    nav.navigate("N1Game", { id, hex, kanji, es, words });
  };

  // asset del trazo (webp) por hex
  const src =
    (N1_KANJIVG as any)[hex?.toLowerCase?.()] ||
    (N1_KANJIVG as any)[hex?.toUpperCase?.()];

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Header */}
        <View style={styles.topRow}>
          <Text style={styles.big}>{kanji}</Text>
          <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}>
            <Text style={styles.closeTxt}>Cerrar</Text>
          </Pressable>
        </View>
        <Text style={styles.mean}>{es}</Text>

        {/* Lecturas + audio */}
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>ON:</Text>
          <Text style={styles.readTxt}>{on?.length ? on.join("・") : "—"}</Text>
          <Pressable style={styles.audBtn} onPress={() => speakJP(on?.join("、") || "")}>
            <Text style={styles.audTxt}>🔊</Text>
          </Pressable>
        </View>
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>KUN:</Text>
          <Text style={styles.readTxt}>{kun?.length ? kun.join("・") : "—"}</Text>
          <Pressable style={styles.audBtn} onPress={() => speakJP(kun?.join("、") || "")}>
            <Text style={styles.audTxt}>🔊</Text>
          </Pressable>
        </View>

        {/* Trazos */}
        <Text style={styles.section}>Orden de trazos</Text>
        {src ? (
          <ExpoImage
            key={hex}                 // re-render al cambiar kanji
            source={src}
            tintColor="#FFFFFF"       // ❄️ trazo blanco
            cachePolicy="none"        // evita cache oscuro
            style={{ width: width - 32, height: width - 32, alignSelf: "center" }}
            contentFit="contain"
            transition={250}
          />
        ) : (
          <View style={styles.noStroke}>
            <Text style={styles.noStrokeTitle}>Sin trazo disponible</Text>
            <Text style={styles.noStrokeHex}>hex: {hex}</Text>
          </View>
        )}

        {/* Ejemplos */}
        <Text style={styles.section}>Ejemplos</Text>
        <View style={{ gap: 8 }}>
          {words?.map((w, i) => (
            <View key={`${w.jp}_${i}`} style={styles.wordCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordJP}>
                  {w.jp} <Text style={styles.wordRd}>{w.reading}</Text>
                </Text>
                <Text style={styles.wordES}>{w.es}</Text>
              </View>
              <Pressable style={styles.play} onPress={() => speakJP(w.jp)}>
                <Text style={styles.playTxt}>JP</Text>
              </Pressable>
              <Pressable style={styles.play} onPress={() => speakES(w.es)}>
                <Text style={styles.playTxt}>ES</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Acciones rápidas */}
        <Text style={styles.section}>Actividades</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={startQuiz}>
            <Text style={styles.quickTxt}>Quiz</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={startGame}>
            <Text style={styles.quickTxt}>Juego</Text>
          </Pressable>
        </View>

        {/* Marcar OK */}
        <Pressable style={styles.cta} onPress={markOk}>
          <Text style={styles.ctaTxt}>Marcar OK</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19" },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  big: { color: "#FFFFFF", fontSize: 56, fontWeight: "900" },
  closeBtn: { backgroundColor: "rgba(255,255,255,0.10)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  closeTxt: { color: "#CFE4FF", fontWeight: "900" },
  mean: { color: "rgba(255,255,255,0.92)", fontWeight: "800", marginTop: 4 },

  readRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
  readLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "900" },
  readTxt: { color: "#EAF1FF", fontWeight: "800", flexShrink: 1 },
  audBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)" },
  audTxt: { color: "#EAF1FF", fontWeight: "900" },

  section: { color: "#CFE4FF", fontWeight: "900", marginTop: 16, marginBottom: 8, letterSpacing: 0.3 },

  noStroke: {
    height: width - 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  noStrokeTitle: { color: "#FFD27A", fontWeight: "900" },
  noStrokeHex: { color: "rgba(255,255,255,0.75)", marginTop: 6 },

  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: 10,
  },
  wordJP: { color: "#FFFFFF", fontWeight: "900" },
  wordRd: { color: "rgba(255,255,255,0.75)", fontWeight: "700" },
  wordES: { color: "rgba(255,255,255,0.9)" },
  play: { backgroundColor: "#2B7FFF", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  playTxt: { color: "#EAF1FF", fontWeight: "900" },

  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  quickTxt: { color: "#EAF1FF", fontWeight: "900" },

  cta: { marginTop: 18, backgroundColor: "#33DAC6", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  ctaTxt: { color: "#053A38", fontWeight: "900", letterSpacing: 0.3 },
});
