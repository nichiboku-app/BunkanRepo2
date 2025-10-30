// src/screens/N1/N1HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { N1_LESSONS } from "../../data/n1.lessons";

/* ---------------- NAV ---------------- */
type RootStackParamList = {
  N1Home: undefined;
  N1Lesson: { id: string };
  N1KanjiHub: undefined;
  N1Exam: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;

/* --------------- CONSTS --------------- */
const { width } = Dimensions.get("window");
const P = 16;
const PALETTE = {
  bg: "#0B0F19",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  aqua: "#33DAC6",
  aquaDark: "#0AA89A",
  blue: "#2B7FFF",
  chip: "rgba(100,116,255,0.12)",
  chipBorder: "rgba(100,116,255,0.32)",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.78)",
};

export default function N1HomeScreen() {
  const nav = useNavigation<Nav>();

  const headerShadow = useMemo(
    () => ({
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 16,
    }),
    []
  );

  const chips = ["HOY", "RECOMENDADO", "RECIENTES", "GRAMÁTICA", "LECTURA", "LISTENING", "KANJI"];

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* ----- TopBar “vidrio” ----- */}
      <View style={[styles.topBar, headerShadow]}>
        <Text style={styles.topTitle}>Nivel Dragón · N1</Text>

        <Pressable style={styles.kanjiPill} onPress={() => nav.navigate("N1KanjiHub")}>
          <Text style={styles.kanjiPillTxt}>KANJI (200)</Text>
        </Pressable>
      </View>

      <FlatList
        data={N1_LESSONS}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={
          <>
            {/* ----- HERO con progreso y CTAs ----- */}
            <View style={styles.hero}>
              <ExpoImage
                // 🔁 usamos el fondo webp final
                source={require("../../../assets/images/n1/n1_intro_bg.webp")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.35)", "rgba(11,15,25,0.98)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>BIENVENIDA AL</Text>
                <Text style={styles.heroTitle}>NIVEL DRAGÓN</Text>
                <Text style={styles.heroSub}>
                  Domina N1 con práctica real: Gramática avanzada · Lectura crítica · Listening JLPT · Kanji con propósito
                </Text>

                {/* progreso */}
                <View style={styles.progressRow}>
                  <View style={styles.track}>
                    <View style={styles.bar} />
                  </View>
                  <Text style={styles.progressPct}>32%</Text>
                </View>

                {/* CTAs */}
                <View style={styles.ctaRow}>
                  <Pressable style={styles.btnPrimary} onPress={() => nav.navigate("N1Exam")}>
                    <Text style={styles.btnPrimaryTxt}>EXAMEN DE DIAGNÓSTICO</Text>
                  </Pressable>
                  <Pressable style={styles.btnGhost} onPress={() => nav.navigate("N1KanjiHub")}>
                    <Text style={styles.btnGhostTxt}>CENTRO DE KANJI</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* chips */}
            <FlatList
              data={chips}
              keyExtractor={(s) => s}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: P, paddingTop: 8, paddingBottom: 2 }}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item, index }) => (
                <View style={[styles.chip, index === 0 && styles.chipActive]}>
                  <Text style={[styles.chipTxt, index === 0 && styles.chipActiveTxt]}>{item}</Text>
                </View>
              )}
            />

            <Text style={styles.sectionTitle}>CARTELERA N1</Text>
          </>
        }
        renderItem={({ item }) => <LessonCard item={item} onPress={() => nav.navigate("N1Lesson", { id: item.id })} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: P, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* --------- Card ancha con overlay (estilo cartelera) --------- */
function LessonCard({
  item,
  onPress,
}: {
  item: (typeof N1_LESSONS)[number];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.posterWrap}>
        <ExpoImage
          // 🖼 si en tu data ya pusimos rutas nuevas, respétalas;
          // fallback a una imagen temática si falta
          source={
            item.image ||
            require("../../../assets/images/n1/tech.jpg") // fallback
          }
          style={styles.poster}
          contentFit="cover"
          transition={200}
        />
        {/* degradado para legibilidad */}
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.75)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <View style={styles.badgesRow}>
          <View style={styles.levelPill}>
            <Text style={styles.levelTxt}>N1</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.minTxt}>{(item as any).durationMin ?? 65} MIN</Text>

          <View style={styles.spacer} />

          <View style={styles.startPill}>
            <Text style={styles.startTxt}>EMPEZAR</Text>
          </View>
        </View>

        <Pressable style={styles.cardBtn} onPress={onPress}>
          <Text style={styles.cardBtnTxt}>{item.cta || "Ver lección"}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: PALETTE.bg },

  /* top bar */
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64 + (StatusBar.currentHeight ?? 0),
    paddingTop: (StatusBar.currentHeight ?? 0),
    paddingHorizontal: P,
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(13,17,27,0.65)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  topTitle: { color: "#FFF", fontWeight: "900", fontSize: 18, letterSpacing: 0.3 },
  kanjiPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.aqua,
  },
  kanjiPillTxt: { color: "#052D29", fontWeight: "900", letterSpacing: 0.3 },

  /* hero */
  hero: {
    marginTop: 64 + (StatusBar.currentHeight ?? 0) + 10,
    height: 225,
    borderRadius: 18,
    overflow: "hidden",
    marginHorizontal: P,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width, height: 225 },
  heroIn: { flex: 1, padding: 16, justifyContent: "flex-end" },
  kicker: { color: "#C5FFF9", fontWeight: "900", letterSpacing: 0.6 },
  heroTitle: { color: "#FFF", fontSize: 28, lineHeight: 30, fontWeight: "900", marginTop: 2 },
  heroSub: { color: "rgba(255,255,255,0.88)", marginTop: 6 },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  track: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999 },
  bar: {
    width: "32%",
    height: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.aqua,
  },
  progressPct: { color: "#D7FDF9", fontWeight: "900" },

  ctaRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnPrimary: {
    flex: 1,
    backgroundColor: PALETTE.blue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimaryTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.3 },
  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  btnGhostTxt: { color: "rgba(255,255,255,0.92)", fontWeight: "900", letterSpacing: 0.3 },

  /* chips */
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.chip,
    borderWidth: 1,
    borderColor: PALETTE.chipBorder,
  },
  chipTxt: { color: "#C7D2FE", fontWeight: "800" },
  chipActive: { backgroundColor: PALETTE.aqua, borderColor: PALETTE.aqua },
  chipActiveTxt: { color: "#052D29" },

  sectionTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
    paddingHorizontal: P,
    marginTop: 10,
    marginBottom: 8,
  },

  /* card */
  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: "hidden",
  },
  posterWrap: { height: 140, width: "100%" },
  poster: { width: "100%", height: "100%" },

  cardContent: { padding: 12 },
  cardTitle: { color: PALETTE.text, fontWeight: "900", fontSize: 16 },
  cardSub: { color: PALETTE.sub, fontSize: 13, marginTop: 4 },

  badgesRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(99,102,241,0.18)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
  },
  levelTxt: { color: "#C7D2FE", fontWeight: "800", fontSize: 12 },
  dot: { color: "rgba(255,255,255,0.55)", marginHorizontal: 6 },
  minTxt: { color: "rgba(255,255,255,0.9)", fontWeight: "800" },
  spacer: { flex: 1 },
  startPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(46,190,213,0.17)",
    borderWidth: 1,
    borderColor: "rgba(46,190,213,0.6)",
  },
  startTxt: { color: "#8FF1F2", fontWeight: "900", fontSize: 12, letterSpacing: 0.2 },

  cardBtn: {
    alignSelf: "flex-start",
    backgroundColor: PALETTE.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  cardBtnTxt: { color: "#EAF1FF", fontWeight: "900", letterSpacing: 0.2 },
});
