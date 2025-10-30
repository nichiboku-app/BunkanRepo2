import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { N1_KANJI_META, type N1KanjiMeta } from "../../data/n1_kanji_meta";
import { N1_KANJIVG } from "../../data/n1_kanjivg"; // mapa hex->require(...)

/* ---------- NAV ---------- */
type RootStackParamList = {
  N1Home: undefined;
  N1KanjiHub: undefined;
  N1Lesson: { id: string };
  N1KanjiLesson: {
    id: string; hex: string; kanji: string;
    on: string[]; kun: string[]; es: string;
    words: { jp: string; reading: string; es: string }[];
  };
  N1Exam: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1KanjiHub">;

/* ---------- CONST ---------- */
const { width } = Dimensions.get("window");
const PROGRESS_KEY = "n1_kanji_progress_v1";

// paleta para variar colores por tarjeta
const PALETTE = [
  { bg: "rgba(46,190,213,0.10)", bd: "rgba(46,190,213,0.55)", ink: "#8FF1F2" },
  { bg: "rgba(100,116,255,0.10)", bd: "rgba(100,116,255,0.55)", ink: "#C7D2FE" },
  { bg: "rgba(59,130,246,0.10)", bd: "rgba(59,130,246,0.55)", ink: "#BFD9FF" },
  { bg: "rgba(51,218,198,0.10)", bd: "rgba(51,218,198,0.55)", ink: "#CFFAF4" },
];

/* ---------- DATA ---------- */
type Item = N1KanjiMeta & { id: string };
const ALL_ITEMS: Item[] = N1_KANJI_META
  .filter(m => m.hex && (N1_KANJIVG as any)[m.hex.toLowerCase()] || (N1_KANJIVG as any)[m.hex.toUpperCase()])
  .map((m, i) => ({ ...m, id: `n1_${i + 1}_${m.hex}` }));

export default function N1KanjiHubScreen() {
  const nav = useNavigation<Nav>();
  const [filter, setFilter] = useState<"all" | "pend" | "hard">("all");
  const [learned, setLearned] = useState<Set<string>>(new Set());

  // progreso guardado
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROGRESS_KEY);
        setLearned(new Set<string>(raw ? JSON.parse(raw) : []));
      } catch {}
    })();
  }, []);

  const total = ALL_ITEMS.length;
  const learnedCount = learned.size;
  const progressPct = Math.round((learnedCount / Math.max(total, 1)) * 100);

  const data = useMemo(() => {
    if (filter === "pend") return ALL_ITEMS.filter(it => !learned.has(it.id));
    if (filter === "hard") return ALL_ITEMS.slice(0, 12); // placeholder “difíciles”
    return ALL_ITEMS;
  }, [filter, learned]);

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centro de Kanji · N1</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}>
          <Text style={styles.closeTxt}>Cerrar</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <ExpoImage
          source={require("../../../assets/images/n1/kanji_hero.webp")}
          style={styles.heroImg}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.12)", "rgba(8,12,18,0.96)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroInside}>
          <Text style={styles.badge}>N1 · {total} KANJI</Text>
          <Text style={styles.title}>Centro de Kanji</Text>
          <Text style={styles.subtitle}>
            Trazo, vocabulario, lectura y mini-juegos. Domina los {total} kanji clave.
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressTxt}>{progressPct}%</Text>
          </View>

          <View style={styles.ctas}>
            <Pressable style={styles.ctaPrimary} onPress={() => nav.navigate("N1Exam")}>
              <Text style={styles.ctaPrimaryTxt}>EXAMEN RÁPIDO</Text>
            </Pressable>
            <Pressable style={styles.ctaGhost} onPress={() => setFilter("pend")}>
              <Text style={styles.ctaGhostTxt}>PENDIENTES</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Chips */}
      <View style={styles.chipsRow}>
        <Chip label="TODOS" active={filter === "all"} onPress={() => setFilter("all")} />
        <Chip label="PENDIENTES" active={filter === "pend"} onPress={() => setFilter("pend")} />
        <Chip label="DIFÍCILES" active={filter === "hard"} onPress={() => setFilter("hard")} />
      </View>

      {/* Grid */}
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 28 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item, index }) => {
          const isOk = learned.has(item.id);
          const tone = PALETTE[index % PALETTE.length];

          return (
            <Pressable
              style={[styles.card, { borderColor: tone.bd, backgroundColor: tone.bg }, isOk && styles.cardOk]}
              onPress={() =>
                nav.navigate("N1KanjiLesson", {
                  id: item.id, hex: item.hex, kanji: item.k,
                  on: item.on, kun: item.kun, es: item.es, words: item.words,
                })
              }
            >
              <View style={[styles.kanjiCircle, { backgroundColor: tone.bg, borderColor: tone.bd }]}>
                <Text style={[styles.kanjiTxt, { color: tone.ink }]}>{item.k}</Text>
              </View>

              <Text style={styles.mean}>{item.es}</Text>
              <Text style={styles.reads}>
                <Text style={styles.readLabel}>ON: </Text>{item.on.join("・")}　
                <Text style={styles.readLabel}>KUN: </Text>{item.kun.length ? item.kun.join("・") : "—"}
              </Text>

              {/* 4 palabras */}
              <View style={styles.wordsRow}>
                {item.words.slice(0, 4).map((w, i) => (
                  <View key={i} style={styles.wordPill}>
                    <Text style={styles.wordPillTxt}>{w.jp}</Text>
                  </View>
                ))}
              </View>

              {isOk && (
                <View style={styles.badgeLearned}>
                  <Text style={styles.badgeLearnedTxt}>OK</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/* ----- UI atoms ----- */
function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: "rgba(100,116,255,0.24)", borderColor: "rgba(100,116,255,0.85)" },
      ]}
    >
      <Text style={[styles.chipTxt, active && { color: "#E7EBFF", fontWeight: "900" }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#080C12" },

  header: {
    height: 56 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(8,12,18,0.8)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: { color: "#EAF1FF", fontSize: 18, fontWeight: "900" },
  closeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  closeTxt: { color: "#BFD9FF", fontWeight: "800" },

  hero: { margin: 14, height: 240, borderRadius: 18, overflow: "hidden" },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroInside: { flex: 1, padding: 16, justifyContent: "flex-end" },
  badge: { alignSelf: "flex-start", color: "#063A3A", backgroundColor: "#36D9C6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontWeight: "900" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 8 },
  subtitle: { color: "rgba(255,255,255,0.92)", marginTop: 4 },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  track: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, overflow: "hidden" },
  bar: { height: 8, backgroundColor: "#33DAC6", borderRadius: 999 },
  progressTxt: { color: "#D3FFF7", fontWeight: "900" },

  ctas: { flexDirection: "row", gap: 10, marginTop: 12 },
  ctaPrimary: { flex: 1, backgroundColor: "#2B7FFF", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  ctaPrimaryTxt: { color: "#EAF1FF", fontWeight: "900" },
  ctaGhost: { flex: 1, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)", paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  ctaGhostTxt: { color: "rgba(255,255,255,0.92)", fontWeight: "900" },

  chipsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 8 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(100,116,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(100,116,255,0.32)",
  },
  chipTxt: { color: "#C7D2FE", fontWeight: "800" },

  card: {
    flex: 1,
    minHeight: 170,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardOk: { borderColor: "rgba(51,218,198,0.8)", backgroundColor: "rgba(51,218,198,0.10)" },

  kanjiCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8, borderWidth: 1,
  },
  kanjiTxt: { fontSize: 32, fontWeight: "900" },
  mean: { color: "rgba(255,255,255,0.9)", fontWeight: "800", marginTop: 2 },
  reads: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2, textAlign: "center" },
  readLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "900" },

  wordsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, justifyContent: "center" },
  wordPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  wordPillTxt: { color: "#EAF1FF", fontWeight: "900", fontSize: 12 },

  badgeLearned: { position: "absolute", top: 10, right: 10, backgroundColor: "#33DAC6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeLearnedTxt: { color: "#053A38", fontWeight: "900" },
});
