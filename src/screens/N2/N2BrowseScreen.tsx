// src/screens/N2/N2BrowseScreen.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { coverFor } from "./covers";

type RootStackParamList = {
  N2Browse: undefined;
  N2_Unit?: { block: number; unit: number; title: string };
  N2_B1_U1?: undefined;
  N2_B1_U2?: undefined;
  N2_B1_U3?: undefined;
  N2_B2_U1?: undefined;
  N2_B2_U2?: undefined;
  N2_B2_U3?: undefined;
  N2_B3_U1?: undefined;
  N2_B3_U2?: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N2Browse">;

type UnitItem = { title: string; subtitle: string; cover: any; block: number; unit: number };
type Row = { key: string; label: string; accent: string; items: UnitItem[] };

/* ---------- helper: ruta por bloque/unidad ---------- */
function routeFor(block: number, unit: number) {
  if (block === 1 && unit === 1) return "N2_B1_U1";
  if (block === 1 && unit === 2) return "N2_B1_U2";
  if (block === 1 && unit === 3) return "N2_B1_U3";
  // B2
  if (block === 2 && unit === 1) return "N2_B2_U1";
  if (block === 2 && unit === 2) return "N2_B2_U2";
  if (block === 2 && unit === 3) return "N2_B2_U3";
  // B3
  if (block === 3 && unit === 1) return "N2_B3_U1";
  if (block === 3 && unit === 2) return "N2_B3_U2";
  if (block === 3 && unit === 3) return "N2_B3_U3"; // temporal
  return "N2_Unit"; // fallback
}

/* -------- Tarjeta con animación de selección -------- */
function PosterCard({
  item,
  accent,
  w,
  h,
  onOpen,
  isLast,
}: {
  item: UnitItem;
  accent: string;
  w: number;
  h: number;
  onOpen: (block: number, unit: number, title: string) => void;
  isLast?: boolean;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const growing = useRef(new Animated.Value(0)).current;
  const animatingRef = useRef(false);

  const scale = Animated.multiply(
    pressScale,
    growing.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })
  );
  const overlayOpacity = fade;

  const tap = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    Animated.timing(pressScale, {
      toValue: 0.98,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      Animated.parallel([
        Animated.timing(growing, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onOpen(item.block, item.unit, item.title);
        // reset
        pressScale.setValue(1);
        growing.setValue(0);
        fade.setValue(0);
        animatingRef.current = false;
      });
    });
  };

  return (
    <Animated.View
      style={{
        width: w,
        height: h,
        marginRight: isLast ? 12 : 12,
        transform: [{ scale }],
        borderRadius: 16,
      }}
      pointerEvents={animatingRef.current ? "none" : "auto"}
    >
      <Pressable onPress={tap} style={styles.poster}>
        <ExpoImage source={item.cover} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
        {/* Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderWidth: 2,
              borderRadius: 16,
              borderColor: accent,
              opacity: growing.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
            },
          ]}
        />
        {/* Overlay fade */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "#000", opacity: overlayOpacity, borderRadius: 16 },
          ]}
        />
        <View style={styles.posterInfo}>
          <View style={[styles.tag, { borderColor: accent }]}>
            <Text style={[styles.tagTxt, { color: accent }]}>{item.subtitle}</Text>
          </View>
          <Text numberOfLines={2} style={styles.posterTitle}>
            {item.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function N2BrowseScreen() {
  const navigation = useNavigation<Nav>();
  const width = Dimensions.get("window").width;

  // ===== HERO con efecto "fold-away 3D" + Ken Burns + Parallax + Shine =====
  const hero = require("../../../assets/images/n2/n2_hero_street.webp");
  const heroH = 360;

  // Scroll animado (ONLY transforms & opacity → useNativeDriver: true)
  const scrollY = useRef(new Animated.Value(0)).current;
  const clamped = Animated.diffClamp(scrollY, 0, heroH);

  // Hero se traslada y "se dobla" en X
  const headerTranslateY = clamped.interpolate({
    inputRange: [0, heroH],
    outputRange: [0, -heroH],
    extrapolate: "clamp",
  });
  const foldRotateX = clamped.interpolate({
    inputRange: [0, heroH],
    outputRange: ["0deg", "72deg"],
    extrapolate: "clamp",
  });
  const foldScale = clamped.interpolate({
    inputRange: [0, heroH],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });
  const heroOpacity = clamped.interpolate({
    inputRange: [0, heroH * 0.5, heroH],
    outputRange: [1, 0.55, 0],
    extrapolate: "clamp",
  });

  // Parallax de imagen (sutil)
  const heroImgTY = clamped.interpolate({
    inputRange: [0, heroH],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });

  // Brillo diagonal que cruza el hero al hacer scroll
  const shineTX = clamped.interpolate({
    inputRange: [0, heroH],
    outputRange: [-width, width * 1.4],
    extrapolate: "clamp",
  });
  const shineOpacity = clamped.interpolate({
    inputRange: [0, heroH * 0.2, heroH * 0.5, heroH],
    outputRange: [0.0, 0.18, 0.06, 0.0],
    extrapolate: "clamp",
  });

  // Mini top bar aparece al final
  const miniOpacity = clamped.interpolate({
    inputRange: [heroH * 0.6, heroH],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const miniTranslateY = clamped.interpolate({
    inputRange: [heroH * 0.6, heroH],
    outputRange: [-10, 0],
    extrapolate: "clamp",
  });

  // Ken Burns loop (zoom-in/out lento que se combina con foldScale)
  const kb = useRef(new Animated.Value(0)).current;
  const kbScale = kb.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(kb, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(kb, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [kb]);
  const finalScale = Animated.multiply(foldScale, kbScale);

  // ===== DATA por filas =====
  const rows: Row[] = useMemo(
    () => [
      {
        key: "b1",
        label: "B1 — Causa / consecuencia",
        accent: "#C01E2E",
        items: [
          { title: "〜にしたがって・〜につれて", subtitle: "B1・U1", cover: coverFor(1, 1), block: 1, unit: 1 },
          { title: "〜せいで・〜おかげで・〜ために", subtitle: "B1・U2", cover: coverFor(1, 2), block: 1, unit: 2 },
          { title: "〜からには・〜以上（は）", subtitle: "B1・U3", cover: coverFor(1, 3), block: 1, unit: 3 },
        ],
      },
      {
        key: "b2",
        label: "B2 — Lenguaje formal (Keigo)",
        accent: "#9B1221",
        items: [
          { title: "尊敬語・謙譲語・丁寧語", subtitle: "B2・U1", cover: coverFor(2, 1), block: 2, unit: 1 },
          { title: "Correos / llamadas", subtitle: "B2・U2", cover: coverFor(2, 2), block: 2, unit: 2 },
          { title: "〜させていただきます", subtitle: "B2・U3", cover: coverFor(2, 3), block: 2, unit: 3 },
        ],
      },
      {
        key: "b3",
        label: "B3 — Opiniones y matices",
        accent: "#7E0D18",
        items: [
          { title: "〜わけだ／〜とは限らない", subtitle: "B3・U1", cover: coverFor(3, 1), block: 3, unit: 1 },
          { title: "〜っけ・〜ものだ", subtitle: "B3・U2", cover: coverFor(3, 2), block: 3, unit: 2 },
          { title: "〜に違いない・〜かもしれない", subtitle: "B3・U3", cover: coverFor(3, 3), block: 3, unit: 3 },
        ],
      },
      {
        key: "b4",
        label: "B4 — Noticias y medios",
        accent: "#5C0A14",
        items: [
          { title: "Titulares reales", subtitle: "B4・U1", cover: coverFor(4, 1), block: 4, unit: 1 },
          { title: "〜をめぐって・〜において", subtitle: "B4・U2", cover: coverFor(4, 2), block: 4, unit: 2 },
          { title: "〜そうだ／〜らしい", subtitle: "B4・U3", cover: coverFor(4, 3), block: 4, unit: 3 },
        ],
      },
      {
        key: "b5",
        label: "B5 — Vida urbana / trabajo",
        accent: "#4A0A12",
        items: [
          { title: "Etiqueta en empresas", subtitle: "B5・U1", cover: coverFor(5, 1), block: 5, unit: 1 },
          { title: "Cortesía natural", subtitle: "B5・U2", cover: coverFor(5, 2), block: 5, unit: 2 },
          { title: "Hospital / restaurante", subtitle: "B5・U3", cover: coverFor(5, 3), block: 5, unit: 3 },
        ],
      },
    ],
    []
  );

  // ===== UI consts =====
  const POSTER_W = Math.round(width * 0.42);
  const POSTER_H = Math.round(POSTER_W * 1.35);

  const openUnit = (block: number, unit: number, title: string) => {
    const route = routeFor(block, unit) as any;
    if (route === "N2_Unit") {
      (navigation as any).navigate("N2_Unit", { block, unit, title });
    } else {
      (navigation as any).navigate(route);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ===== HERO con efecto 3D + shine ===== */}
      <Animated.View
        style={[
          styles.heroWrap,
          {
            height: heroH,
            transform: [
              { translateY: headerTranslateY },
              { perspective: 1000 },
              { rotateX: foldRotateX },
              { scale: finalScale as any },
            ],
          },
        ]}
      >
        {/* Imagen base con parallax sutil */}
        <Animated.Image
          source={hero}
          style={[styles.heroImg, { transform: [{ translateY: heroImgTY }] }]}
          resizeMode="cover"
        />

        {/* Degradado para texto legible */}
        <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.88)"]} style={StyleSheet.absoluteFill} />

        {/* BRILLO DIAGONAL animado */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shine,
            {
              opacity: shineOpacity,
              transform: [{ translateX: shineTX }, { rotateZ: "-18deg" }],
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Top bar sobre hero */}
        <Animated.View style={[styles.topBar, { opacity: heroOpacity }]}>
          <Text style={styles.brand}>N2</Text>
          <View style={{ flexDirection: "row" }}>
            <MCI name="magnify" size={24} color="#fff" style={{ marginRight: 12 }} />
            <MCI name="account-circle-outline" size={26} color="#fff" />
          </View>
        </Animated.View>

        {/* Contenido del hero */}
        <Animated.View style={[styles.heroContent, { opacity: heroOpacity }]}>
          <Text style={styles.heroKicker}>Jitsuyō • 実用</Text>
          <Text style={styles.heroTitle}>El japonés de la vida real</Text>
          <Text style={styles.heroDesc}>
            Aprende a comunicarte con naturalidad en trabajo, estudios y ciudad:
            escuchar y responder con soltura, escribir correos formales claros,
            entender titulares reales y decidir en situaciones auténticas.
            La gramática se trabaja en contexto — para hablar y entender mejor.
          </Text>
          <View style={styles.heroChips}>
            <View style={styles.chip}><Text style={styles.chipTxt}>JLPT N2</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>Keigo</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>Noticias</Text></View>
          </View>
        </Animated.View>

        {/* Sombra inferior para integración con contenido */}
        <View pointerEvents="none" style={styles.bottomShadow}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </Animated.View>

      {/* Mini top bar que aparece cuando el hero ya se ocultó */}
      <Animated.View style={[styles.miniBar, { opacity: miniOpacity, transform: [{ translateY: miniTranslateY }] }]}>
        <Text style={styles.miniBrand}>N2 • Browse</Text>
        <View style={{ flexDirection: "row" }}>
          <MCI name="magnify" size={22} color="#fff" style={{ marginRight: 10 }} />
          <MCI name="account-circle-outline" size={24} color="#fff" />
        </View>
      </Animated.View>

      {/* ===== CONTENIDO (debajo del hero) ===== */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true, // SOLO transforms/opacidad (ultra fluido)
        })}
        scrollEventThrottle={16}
      >
        {rows.map((row) => (
          <View key={row.key} style={{ marginTop: 8 }}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{row.label}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              decelerationRate="fast"
              snapToAlignment="start"
            >
              {row.items.map((it, i) => (
                <PosterCard
                  key={`${row.key}-${i}`}
                  item={it}
                  accent={row.accent}
                  w={POSTER_W}
                  h={POSTER_H}
                  onOpen={(b, u, t) => {
                    // micro haptic feel (visualmente)
                    openUnit(b, u, t);
                  }}
                  isLast={i === row.items.length - 1}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const R = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C10" },

  /* HERO (3D fold-away) */
  heroWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    overflow: "hidden",
    zIndex: 2,
    backgroundColor: "#000",
  },
  heroImg: { position: "absolute", width: "100%", height: "100%" },

  topBar: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  brand: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 0.4 },

  heroContent: { position: "absolute", left: 16, right: 16, bottom: 18 },
  heroKicker: { color: "rgba(255,255,255,0.92)", fontWeight: "800" },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 10,
  },
  heroDesc: { color: "rgba(255,255,255,0.95)", marginTop: 8, lineHeight: 18 },
  heroChips: { flexDirection: "row", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  chipTxt: { color: "#fff", fontWeight: "800" },

  // BRILLO diagonal
  shine: {
    position: "absolute",
    top: -60,
    bottom: -60,
    width: 180,
    left: -180,
  },

  // Sombra inferior de integración
  bottomShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 50,
  },

  // MINI BAR
  miniBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: "rgba(10,11,17,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    zIndex: 3,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  miniBrand: { color: "#fff", fontWeight: "900", fontSize: 16 },

  /* ROWS */
  rowHeader: { paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },

  /* POSTERS */
  poster: {
    flex: 1,
    borderRadius: R,
    overflow: "hidden",
    backgroundColor: "#151821",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  posterInfo: { position: "absolute", left: 10, right: 10, bottom: 10 },
  posterTitle: { color: "#fff", fontWeight: "900", fontSize: 14, marginTop: 6 },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  tagTxt: { fontWeight: "900", fontSize: 12, color: "#0B0C10" },
});
