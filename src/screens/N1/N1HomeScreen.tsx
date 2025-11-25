// src/screens/N1/N1HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Tipo compartido del proyecto
import type { RootStackParamList } from "../../types";
// Datos (cartelera N1)
import { N1_LESSONS } from "../../data/n1.lessons";
// Helper que mapea id -> ruta (N1_Politics, N1_Tech, etc.)
import { routeForN1 } from "../../navigation/routeForN1";
// Mapeador de portadas centralizado
import { coverFor } from "./covers";
// Contexto de plan de usuario
import { useUserPlan } from "../../context/UserPlanContext";

/* ---------------- NAV ---------------- */
type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;

/* --------------- CONSTS --------------- */
const { width } = Dimensions.get("window");
const P = 16;
const PALETTE = {
  bg: "#0B0F19",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  aqua: "#33DAC6",
  blue: "#2B7FFF",
  chip: "rgba(100,116,255,0.12)",
  chipBorder: "rgba(100,116,255,0.32)",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.78)",
};
const TOPBAR_H = 64 + (StatusBar.currentHeight ?? 0);
const TOP_OFFSET = TOPBAR_H + 12;

/* --------- CHIPS --------- */
const CHIP_ORDER = [
  "HOY",
  "RECOMENDADO",
  "RECIENTES",
  "GRAMÁTICA",
  "LECTURA",
  "LISTENING",
  "KANJI",
] as const;
type ChipKey = (typeof CHIP_ORDER)[number];

const CHIP_TIPS: Record<
  ChipKey,
  { emoji: string; title: string; body: string; cta?: string }
> = {
  HOY: {
    emoji: "🗓️",
    title: "Tu foco de hoy",
    body:
      "Empieza con un bloque corto (15–20 min). Repite 3 ciclos: Gramática → Lectura → Repaso rápido. Cierra con 5 kanji del hub.",
    cta: "Armar rutina de 20 min",
  },
  RECOMENDADO: {
    emoji: "✨",
    title: "Selección inteligente",
    body:
      "Tomamos tu avance y dificultades recientes para sugerirte la siguiente lección con mayor impacto por minuto estudiado.",
    cta: "Abrir lección sugerida",
  },
  RECIENTES: {
    emoji: "🧭",
    title: "Continúa donde quedaste",
    body:
      "Reanuda tus últimas actividades. Sube 10–15 puntos de confianza sin costo cognitivo alto.",
    cta: "Continuar mi sesión",
  },
  GRAMÁTICA: {
    emoji: "⚙️",
    title: "Fino control del matiz",
    body:
      "Trabaja parejas confusables (〜にしては / 〜わりに). Alterna reconocimiento → producción. Cierra con 5 oraciones propias.",
    cta: "Practicar parejas difíciles",
  },
  LECTURA: {
    emoji: "📖",
    title: "Lectura estratégica",
    body:
      "Lee por capas: (1) skimming, (2) palabras clave, (3) idea central y relación causa–efecto. Subraya conectores.",
    cta: "Abrir lectura guiada",
  },
  LISTENING: {
    emoji: "🎧",
    title: "Oído a N1",
    body:
      "Primera pasada sin subtítulos; segunda con transcripción; tercera, shadowing en frases cortas. Registra dudas.",
    cta: "Ir al modo Shadowing",
  },
  KANJI: {
    emoji: "🀄",
    title: "Kanji con propósito",
    body:
      "Agrupa por tema (política/empresa/salud). Practica escritura mental con trazos blancos y crea 4 palabras por kanji.",
    cta: "Ir al hub de 200",
  },
};

/* ----------------- TIP OVERLAY (SIEMPRE ENCIMA) ----------------- */
function TipOverlay({
  visible,
  chip,
  notchLeft,
  onClose,
}: {
  visible: boolean;
  chip: ChipKey | null;
  notchLeft: number;
  onClose: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !chip) return null;
  const tip = CHIP_TIPS[chip];

  return (
    <View
      pointerEvents="box-none"
      style={styles.tipContainer}
    >
      {/* Fondo oscurecido que cierra al tocar */}
      <Pressable onPress={onClose} style={styles.tipBackdrop} />

      {/* Tarjeta flotante arriba */}
      <Animated.View
        style={[
          styles.tipCardTopWrap,
          { opacity, transform: [{ scale }, { translateY }] },
        ]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={["rgba(24,31,53,0.96)", "rgba(12,16,28,0.96)"]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Notch/triangulito apuntando al chip */}
        <View style={[styles.tipNotch, { left: notchLeft }]} />

        {/* Botón cerrar (✕) en la esquina de la tarjeta */}
        <Pressable onPress={onClose} style={styles.tipCloseBtn} hitSlop={10}>
          <Text style={styles.tipCloseTxt}>✕</Text>
        </Pressable>

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipTitle}>{tip.title}</Text>
          </View>

          <Text style={styles.tipBody}>{tip.body}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            {tip.cta ? (
              <Pressable onPress={onClose} style={styles.tipPrimaryBtn}>
                <Text style={styles.tipPrimaryTxt}>{tip.cta}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} style={styles.tipGhostBtn}>
              <Text style={styles.tipGhostTxt}>Cerrar esta ventana</Text>
            </Pressable>
          </View>
        </View>

        {/* Brillo decorativo */}
        <View style={styles.tipGlow} />
      </Animated.View>
    </View>
  );
}

/* ------------- NAVEGACIÓN ROBUSTA ------------- */
function goTo(nav: any, name: keyof RootStackParamList) {
  try {
    nav.navigate(name);
    return;
  } catch {}
  const parent = nav.getParent?.();
  if (parent) {
    try {
      parent.navigate(name as any);
      return;
    } catch {}
    const grand = parent.getParent?.();
    if (grand) {
      try {
        grand.navigate(name as any);
        return;
      } catch {}
    }
  }
  Alert.alert(
    "No se encontró la ruta",
    `No pude ir a "${String(name)}". Revisa que exista <Stack.Screen name="${String(
      name
    )}" ... /> en App.tsx`
  );
}

export default function N1HomeScreen() {
  const nav = useNavigation<Nav>();
  const { plan, planStatus, isPremium } = useUserPlan();
  const hasPremiumAccess = isPremium && planStatus === "active";

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

  /* ---- Estado de tips (chips) ---- */
  const [tipVisible, setTipVisible] = useState(false);
  const [tipChip, setTipChip] = useState<ChipKey | null>(null);
  const [chipsLayout, setChipsLayout] = useState<
    Record<ChipKey, { x: number; w: number }>
  >({} as any);
  const [chipScrollX, setChipScrollX] = useState(0);

  const notchLeft = useMemo(() => {
    if (!tipChip || !chipsLayout[tipChip]) return 24;
    const { x, w } = chipsLayout[tipChip];
    const chipCenterScreen = x - chipScrollX + w / 2;
    const notchHalf = 8;
    const rel = Math.max(
      16,
      Math.min(width - P * 2 - 16, chipCenterScreen - P - notchHalf)
    );
    return rel;
  }, [tipChip, chipsLayout, chipScrollX]);

  const chipsListRef = useRef<FlatList<ChipKey>>(null);

  const onChipPress = (key: ChipKey) => {
    setTipChip(key);
    const layout = chipsLayout[key];
    if (layout) {
      const targetCenter = layout.x + layout.w / 2;
      const desired = Math.max(0, targetCenter - width / 2);
      chipsListRef.current?.scrollToOffset({ offset: desired, animated: true });
    }
    setTipVisible(true);
  };

  const onChipLayout =
    (key: ChipKey) =>
    (e: LayoutChangeEvent): void => {
      const { x, width: w } = e.nativeEvent.layout;
      setChipsLayout((prev) => ({ ...prev, [key]: { x, w } }));
    };

  const onChipsScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setChipScrollX(e.nativeEvent.contentOffset.x);
  };

  const chips: ChipKey[] = [...CHIP_ORDER];

  /* ---- Gating de lecciones N1 ---- */
  const isLessonFree = (lesson: (typeof N1_LESSONS)[number]) => {
    const routeName = routeForN1(lesson.id);
    // Solo Política y sociedad es básica
    return routeName === "N1_Politics";
  };

  const openLesson = (item: (typeof N1_LESSONS)[number]) => {
    const routeName = routeForN1(item.id);
    const free = isLessonFree(item);
    const isPremiumLesson = !free;
    const isLocked = isPremiumLesson && !hasPremiumAccess;

    if (isLocked) {
      Alert.alert(
        "Contenido Premium",
        "Esta lección forma parte de Nichiboku Premium.\n\nSe desbloquea al activar tu plan Premium."
      );
      return;
    }

    if (routeName) return goTo(nav, routeName as keyof RootStackParamList);
    nav.navigate("N1Lesson", { id: item.id });
  };

  const requirePremium = (onOk: () => void) => {
    if (!hasPremiumAccess) {
      Alert.alert(
        "Contenido Premium",
        "El examen diagnóstico y el centro de kanji del Nivel N1 se desbloquean con Nichiboku Premium."
      );
      return;
    }
    onOk();
  };

  const planBannerTitle = (() => {
    if (hasPremiumAccess) {
      return "Todo el contenido N1 está incluido en tu plan Premium activo ✨";
    }
    if (plan === "premium" && planStatus === "inactive") {
      return "Tu plan Premium está inactivo.";
    }
    return "Política y sociedad está incluida en tu plan básico. El resto del Nivel N1 es contenido Premium.";
  })();

  const planBannerBody = (() => {
    if (hasPremiumAccess) {
      return "Explora todas las lecciones, el examen diagnóstico y el centro de kanji sin límites.";
    }
    if (plan === "premium" && planStatus === "inactive") {
      return "Reactiva tu plan para desbloquear todas las lecciones, el examen diagnóstico y el hub de kanji de N1.";
    }
    return "Actualiza a Nichiboku Premium para desbloquear el examen diagnóstico, el centro de kanji y todas las demás lecciones N1.";
  })();

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />

      {/* ----- Tip Overlay SIEMPRE ENCIMA ----- */}
      <TipOverlay
        visible={tipVisible}
        chip={tipChip}
        notchLeft={notchLeft}
        onClose={() => setTipVisible(false)}
      />

      {/* ----- TopBar “vidrio” ----- */}
      <View style={[styles.topBar, headerShadow]}>
        <Text style={styles.topTitle}>Nivel Dragón · N1</Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            style={[styles.kanjiPill, { backgroundColor: "#7C8CFD" }]}
            onPress={() =>
              requirePremium(() => nav.navigate("N1KanjiMock"))
            }
          >
            <Text style={[styles.kanjiPillTxt, { color: "#0B0F19" }]}>
              MOCK KANJI
            </Text>
          </Pressable>

          <Pressable
            style={styles.kanjiPill}
            onPress={() =>
              requirePremium(() => nav.navigate("N1KanjiHub"))
            }
          >
            <Text style={styles.kanjiPillTxt}>KANJI (200)</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={N1_LESSONS}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={
          <>
            {/* ----- HERO con progreso y CTAs ----- */}
            <View style={styles.hero}>
              <ExpoImage
                source={require("../../../assets/images/n1/n1_intro_bg.webp")}
                style={styles.heroImg}
                contentFit="cover"
              />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.55)",
                  "rgba(0,0,0,0.35)",
                  "rgba(11,15,25,0.98)",
                ]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroIn}>
                <Text style={styles.kicker}>BIENVENIDA AL</Text>
                <Text style={styles.heroTitle}>NIVEL DRAGÓN</Text>
                <Text style={styles.heroSub}>
                  Domina N1 con práctica real: Gramática avanzada · Lectura
                  crítica · Listening JLPT · Kanji con propósito
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
                  <Pressable
                    style={styles.btnPrimary}
                    onPress={() =>
                      requirePremium(() => nav.navigate("N1Exam"))
                    }
                  >
                    <Text style={styles.btnPrimaryTxt}>
                      EXAMEN DE DIAGNÓSTICO
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.btnGhost}
                    onPress={() =>
                      requirePremium(() => nav.navigate("N1KanjiHub"))
                    }
                  >
                    <Text style={styles.btnGhostTxt}>CENTRO DE KANJI</Text>
                  </Pressable>
                </View>

                {/* Acceso directo al Mock de Kanji */}
                <Pressable
                  style={[styles.mockBtn]}
                  onPress={() =>
                    requirePremium(() => nav.navigate("N1KanjiMock"))
                  }
                >
                  <Text style={styles.mockBtnTxt}>
                    🎯 MOCK TEST: 200 KANJI
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Banner de plan / Premium */}
            <View style={styles.planBanner}>
              <Text style={styles.planBannerTitle}>{planBannerTitle}</Text>
              <Text style={styles.planBannerBody}>{planBannerBody}</Text>
            </View>

            {/* chips */}
            <FlatList
              ref={chipsListRef}
              data={chips}
              keyExtractor={(s) => s}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: P,
                paddingTop: 8,
                paddingBottom: 2,
              }}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              onScroll={onChipsScroll}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => onChipPress(item)}
                  onLayout={onChipLayout(item)}
                  style={[styles.chip, index === 0 && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipTxt,
                      index === 0 && styles.chipActiveTxt,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={styles.sectionTitle}>CARTELERA N1</Text>
          </>
        }
        renderItem={({ item }) => {
          const free = isLessonFree(item);
          const isPremiumLesson = !free;
          const isLocked = isPremiumLesson && !hasPremiumAccess;
          return (
            <LessonCard
              item={item}
              onPress={() => openLesson(item)}
              isPremium={isPremiumLesson}
              isLocked={isLocked}
            />
          );
        }}
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
  isPremium,
  isLocked,
}: {
  item: (typeof N1_LESSONS)[number];
  onPress: () => void;
  isPremium: boolean;
  isLocked: boolean;
}) {
  const startLabel = isPremium
    ? isLocked
      ? "PREMIUM"
      : "INCLUIDO"
    : "EMPEZAR";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.posterWrap}>
        <ExpoImage
          source={coverFor(item.id)}
          style={styles.poster}
          contentFit="cover"
          transition={200}
        />
        {/* degradado para legibilidad */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.45)",
            "rgba(0,0,0,0.75)",
          ]}
          style={StyleSheet.absoluteFillObject}
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
          <Text style={styles.minTxt}>
            {(item as any).durationMin ?? 65} MIN
          </Text>
          <View style={styles.spacer} />
          <View
            style={[
              styles.startPill,
              isPremium && styles.startPillPremium,
              isPremium && isLocked && styles.startPillPremiumLocked,
            ]}
          >
            <Text
              style={[
                styles.startTxt,
                isPremium && styles.startTxtPremium,
              ]}
            >
              {startLabel}
            </Text>
          </View>
        </View>

        {/* Botón por si el press en la tarjeta falla en algún Android */}
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

  /* ---- TOP BAR ---- */
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: TOPBAR_H,
    paddingTop: StatusBar.currentHeight ?? 0,
    paddingHorizontal: P,
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(13,17,27,0.65)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  topTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.3,
  },
  kanjiPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.aqua,
  },
  kanjiPillTxt: { color: "#052D29", fontWeight: "900", letterSpacing: 0.3 },

  /* ---- HERO ---- */
  hero: {
    marginTop: TOPBAR_H + 10,
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    marginHorizontal: P,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width, height: 260 },
  heroIn: { flex: 1, padding: 16, justifyContent: "flex-end", gap: 10 },
  kicker: { color: "#C5FFF9", fontWeight: "900", letterSpacing: 0.6 },
  heroTitle: {
    color: "#FFF",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  heroSub: { color: "rgba(255,255,255,0.88)", marginTop: 2 },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
  },
  bar: {
    width: "32%",
    height: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.aqua,
  },
  progressPct: { color: "#D7FDF9", fontWeight: "900" },

  ctaRow: { flexDirection: "row", gap: 10, marginTop: 4 },

  // Botón Premium principal (Examen diagnóstico)
  btnPrimary: {
    flex: 1,
    backgroundColor: "#FDE047",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FACC15",
  },
  btnPrimaryTxt: {
    color: "#111827",
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // Botón Premium secundario (Centro de Kanji)
  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FACC15",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(250,204,21,0.18)",
  },
  btnGhostTxt: {
    color: "#111827",
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  mockBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#7C8CFD",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  mockBtnTxt: {
    color: "#0B0F19",
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  /* ---- BANNER PLAN ---- */
  planBanner: {
    marginHorizontal: P,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "#101118",
  },
  planBannerTitle: {
    color: "#F9FAFB",
    fontWeight: "800",
    fontSize: 13,
  },
  planBannerBody: {
    marginTop: 2,
    color: "rgba(249,250,251,0.88)",
    fontWeight: "500",
    fontSize: 11,
  },

  /* ---- CHIPS ---- */
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

  /* ---- SECTION ---- */
  sectionTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
    paddingHorizontal: P,
    marginTop: 10,
    marginBottom: 8,
  },

  /* ---- CARD ---- */
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

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
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
  startTxt: {
    color: "#8FF1F2",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.2,
  },

  // Estado Premium (efecto oro)
  startPillPremium: {
    backgroundColor: "#FDE047",
    borderColor: "#FACC15",
  },
  startPillPremiumLocked: {
    backgroundColor: "#EAB308",
    borderColor: "#CA8A04",
  },
  startTxtPremium: {
    color: "#111827",
  },

  cardBtn: {
    alignSelf: "flex-start",
    backgroundColor: PALETTE.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  cardBtnTxt: {
    color: "#EAF1FF",
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  /* ---- TIP OVERLAY (siempre por encima) ---- */
  tipContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  tipBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tipCardTopWrap: {
    position: "absolute",
    left: P,
    right: P,
    top: TOP_OFFSET,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    zIndex: 10000,
    elevation: 10000,
  },
  tipNotch: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(24,31,53,0.96)",
  },
  tipCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    zIndex: 10001,
  },
  tipCloseTxt: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 16,
  },

  tipCard: {
    padding: 14,
    paddingTop: 48, // deja espacio para el botón ✕
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  tipEmoji: { fontSize: 20 },
  tipTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  tipBody: {
    color: "rgba(255,255,255,0.86)",
    lineHeight: 20,
    marginTop: 2,
  },
  tipPrimaryBtn: {
    backgroundColor: "#2B7FFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tipPrimaryTxt: {
    color: "#EAF1FF",
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  tipGhostBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tipGhostTxt: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  tipGlow: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: -12,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(60,140,255,0.25)",
    opacity: 0.35,
  },
});
