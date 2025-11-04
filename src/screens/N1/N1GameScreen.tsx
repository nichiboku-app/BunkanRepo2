import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { N1_KANJIVG } from "../../data/n1_kanjivg";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type Word = { jp: string; reading: string; es: string };
type RouteParams = {
  id: string;
  hex: string;
  kanji: string;
  es: string;
  words: Word[];
};

type RootStackParamList = {
  N1Game: RouteParams;
  N1KanjiLesson: any;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Game">;

const { width } = Dimensions.get("window");
const PROGRESS_KEY = "n1_kanji_progress_v1";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function N1GameScreen() {
  const nav = useNavigation<Nav>();
  const { params } = useRoute() as any as { params: RouteParams };
  const { id, hex, kanji, es, words } = params;

  // assets
  const vgSrc =
    (N1_KANJIVG as any)[hex?.toLowerCase?.()] ||
    (N1_KANJIVG as any)[hex?.toUpperCase?.()];

  // sonidos
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // juego: “Encuentra la palabra correcta”
  // Mostramos una definición en ES y 4 opciones JP (una correcta)
  const rounds = useMemo(() => {
    const base = (words && words.length ? words : []).slice(0, 8); // hasta 8 rondas por kanji
    return shuffle(base);
  }, [words]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = rounds[roundIndex];
  const options = useMemo(() => {
    if (!current) return [];
    const pool = shuffle(words.length >= 4 ? words : [...words, ...words]); // fallback
    const unique = [current, ...pool.filter(w => w.jp !== current.jp).slice(0, 3)];
    return shuffle(unique);
  }, [current, words]);

  useEffect(() => {
    if (hearts <= 0 || roundIndex >= rounds.length) {
      setFinished(true);
    }
  }, [hearts, roundIndex, rounds.length]);

  const onPick = async (opt: Word) => {
    if (locked || finished) return;
    setLocked(true);
    const isOk = opt.jp === current.jp;
    if (isOk) {
      playCorrect();
      setScore(s => s + 100);
      setTimeout(() => {
        setRoundIndex(i => i + 1);
        setLocked(false);
      }, 350);
    } else {
      playWrong();
      setHearts(h => Math.max(0, h - 1));
      setTimeout(() => setLocked(false), 300);
    }
  };

  const markOkAndExit = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      set.add(id);
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
    } catch {}
    nav.goBack();
  };

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.hTitle}>Mini-juego · {kanji}</Text>
        <Pressable style={styles.hClose} onPress={() => nav.goBack()}>
          <Text style={styles.hCloseTxt}>Cerrar</Text>
        </Pressable>
      </View>

      {/* Hero con trazo en blanco */}
      <View style={styles.hero}>
        <LinearGradient
          colors={["#0B0F19", "#0B0F19"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={styles.kanjiBadge}>
            <Text style={styles.kanji}>{kanji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mean}>{es}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Puntos: {score}</Text>
              <Text style={styles.stat}>❤ {hearts}</Text>
              <Text style={styles.stat}>
                {Math.min(roundIndex + 1, rounds.length)}/{rounds.length || 1}
              </Text>
            </View>
          </View>
        </View>

        {vgSrc ? (
          <ExpoImage
            source={vgSrc}
            tintColor="#FFFFFF"
            style={styles.vg}
            contentFit="contain"
            transition={250}
          />
        ) : (
          <View style={styles.vgFallback}>
            <Text style={styles.vgFallbackTxt}>Sin trazo</Text>
          </View>
        )}
      </View>

      {/* Ronda */}
      {!finished ? (
        <>
          <Text style={styles.qTitle}>¿Cuál palabra corresponde a:</Text>
          <View style={styles.qCard}>
            <Text style={styles.qEs}>{current?.es}</Text>
          </View>

          <View style={styles.grid}>
            {options.map((opt, i) => (
              <Pressable
                key={`${opt.jp}_${i}`}
                disabled={locked}
                onPress={() => onPick(opt)}
                style={({ pressed }) => [
                  styles.opt,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.optJP}>{opt.jp}</Text>
                <Text style={styles.optRd}>{opt.reading}</Text>
              </Pressable>
            ))}
          </View>

          {!ready && (
            <Text style={styles.hint}>Cargando sonidos…</Text>
          )}
        </>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            {hearts > 0 ? "¡Excelente!" : "Buen intento"}
          </Text>
          <Text style={styles.resultScore}>Puntuación: {score}</Text>
          <View style={styles.resultRow}>
            <Pressable style={styles.ctaPrimary} onPress={markOkAndExit}>
              <Text style={styles.ctaPrimaryTxt}>Marcar como OK</Text>
            </Pressable>
            <Pressable
              style={styles.ctaGhost}
              onPress={() => {
                // reiniciar
                setScore(0);
                setHearts(3);
                setRoundIndex(0);
                setFinished(false);
              }}
            >
              <Text style={styles.ctaGhostTxt}>Reintentar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19", padding: 16 },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  hTitle: { color: "#EAF1FF", fontWeight: "900", fontSize: 18 },
  hClose: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  hCloseTxt: { color: "#BFD9FF", fontWeight: "800" },

  hero: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  kanjiBadge: {
    backgroundColor: "rgba(51,218,198,0.14)",
    borderColor: "rgba(51,218,198,0.55)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kanji: { color: "#33DAC6", fontSize: 26, fontWeight: "900", letterSpacing: 1 },
  mean: { color: "#FFFFFF", fontWeight: "900", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    alignItems: "center",
  },
  stat: { color: "#CFE4FF", fontWeight: "800" },

  vg: {
    width: width - 56,
    height: width - 56,
    alignSelf: "center",
    marginTop: 10,
  },
  vgFallback: {
    width: width - 56,
    height: width - 56,
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  vgFallbackTxt: { color: "#FFD27A", fontWeight: "900" },

  qTitle: { color: "#CFE4FF", fontWeight: "900", marginTop: 2 },
  qCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  qEs: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  grid: {
    marginTop: 12,
    gap: 10,
  },
  opt: {
    backgroundColor: "rgba(100,116,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(100,116,255,0.45)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optJP: { color: "#EAF1FF", fontWeight: "900", fontSize: 16 },
  optRd: { color: "rgba(231,235,255,0.8)", fontWeight: "700" },

  hint: { color: "rgba(231,235,255,0.6)", textAlign: "center", marginTop: 8 },

  resultBox: {
    marginTop: 12,
    backgroundColor: "rgba(51,218,198,0.10)",
    borderWidth: 1,
    borderColor: "rgba(51,218,198,0.45)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  resultTitle: { color: "#CFFAF4", fontWeight: "900", fontSize: 18 },
  resultScore: { color: "#EAF1FF", fontWeight: "900", marginTop: 6 },
  resultRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  ctaPrimary: {
    backgroundColor: "#33DAC6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaPrimaryTxt: { color: "#053A38", fontWeight: "900" },
  ctaGhost: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  ctaGhostTxt: { color: "rgba(255,255,255,0.92)", fontWeight: "900" },
});
