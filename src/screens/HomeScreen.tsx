// src/screens/HomeScreen.tsx
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { doc, onSnapshot } from "firebase/firestore";
import AvatarWithFrame from "../components/AvatarWithFrame";
import { auth, db } from "../config/firebaseConfig";
import { getAvatarUri } from "../services/uploadAvatar";
import { openDrawerDeep } from "../utils/nav";

import IntroVideoModal from "../components/IntroVideoModal";
import {
  getIntroVideoUrl,
  markIntroVideoSeen,
  wasIntroVideoSeen,
} from "../services/introVideo";

const { width } = Dimensions.get("window");

// ==== Navegación (solo tipos locales) ====
type RootStackParamList = {
  Home: undefined;
  ProgresoN5: undefined;
  Notas: undefined;
  Calendario: undefined;
  BienvenidaCursoN5: undefined;
  CursoN5: undefined;
  CursoN4: undefined;
  CursoN3: undefined;
  Perfil: undefined;
  Notificaciones: undefined;
  Chat: undefined;
  ActividadesN5?: undefined;
  N3Intro: undefined;
  N4Intro: undefined;
  N2Intro: undefined;
  N1Intro: undefined;
};
type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNav>();

  useFocusEffect(
    useCallback(() => {
      const parent = (navigation as any).getParent?.();
      parent?.setOptions?.({ headerShown: false });
      return () => parent?.setOptions?.({ headerShown: true });
    }, [navigation])
  );

  const [ready, setReady] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  // =============================
  // Animaciones
  // =============================
  const aProgress = useRef(new Animated.Value(0)).current;
  const aPanel = useRef(new Animated.Value(0)).current;
  const aCard1 = useRef(new Animated.Value(0)).current;
  const aCard2 = useRef(new Animated.Value(0)).current;
  const aCard3 = useRef(new Animated.Value(0)).current;
  const aMore = useRef(new Animated.Value(0)).current;
  const hamburgerAnim = useRef(new Animated.Value(1)).current;

  const fadeUpStyle = useCallback(
    (val: Animated.Value, fromY = 18) => ({
      opacity: val,
      transform: [
        {
          translateY: val.interpolate({
            inputRange: [0, 1],
            outputRange: [fromY, 0],
          }),
        },
      ],
    }),
    []
  );

  const runAppear = useCallback(() => {
    Animated.sequence([
      Animated.timing(aProgress, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(aPanel, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.stagger(120, [
        Animated.timing(aCard1, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(aCard2, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(aCard3, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(aMore, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [aProgress, aPanel, aCard1, aCard2, aCard3, aMore]);

  useEffect(() => {
    if (ready) runAppear();
  }, [ready, runAppear]);

  useEffect(() => {
    async function preloadImages() {
      try {
        await Asset.loadAsync([
          require("../../assets/images/final_home_background.webp"),
          require("../../assets/images/cloud_swirl.webp"),
          require("../../assets/images/cursos/n5_mapache.webp"),
          require("../../assets/images/cursos/n4_zorro.webp"),
          require("../../assets/images/cursos/n1_dragon.webp"), // N1
          require("../../assets/images/cursos/rueda2.webp"),
          require("../../assets/icons/hamburger.webp"),
          require("../../assets/images/avatar_formal.webp"),
          require("../../assets/images/avatar_frame.webp"),
          require("../../assets/images/cuadroNotas.webp"),
          require("../../assets/images/Notas.webp"),
          require("../../assets/images/Calendario.webp"),
          require("../../assets/icons/bell.webp"),
          require("../../assets/icons/heart.webp"),
          require("../../assets/icons/ia.webp"),
          require("../../assets/images/gradient_red.webp"),
          // nuevos / corregidos
          require("../../assets/images/cursos/n2_pandabueno.png"), // Panda recortado
          require("../../assets/images/cursos/leon_blanco_transparente.webp"), // N3 (Raion)
        ]);
      } catch (e) {
        console.warn("Error precargando imágenes", e);
      } finally {
        setReady(true);
      }
    }
    preloadImages();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const seen = await wasIntroVideoSeen();
        if (seen) return;
        const url = await getIntroVideoUrl();
        if (!alive) return;
        setVideoUrl(url);
        setShowIntro(true);
      } catch (e) {
        console.warn("No se pudo cargar el video de introducción", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "Usuarios", uid), (snap) => {
      setUserDoc({ id: snap.id, ...snap.data() });
    });
  }, []);

  const openDrawer = () => {
    const ok = openDrawerDeep(navigation as any);
    if (__DEV__ && !ok) {
      console.warn("No se pudo abrir el Drawer (verifica id='AppDrawer').");
    }
  };

  const handlePressIn = () => {
    Animated.spring(hamburgerAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(hamburgerAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const navigateToHomeStack = (
    screen: "BienvenidaCursoN5" | "Calendario" | "Notas" | "CursoN5" | "ActividadesN5",
    params?: Record<string, any>
  ) => {
    (navigation as any).navigate("Main" as never, { screen, params } as never);
  };

  const go = (route: keyof RootStackParamList) => {
    switch (route) {
      case "BienvenidaCursoN5":
      case "Calendario":
      case "Notas":
      case "CursoN5":
      case "ActividadesN5":
        navigateToHomeStack(route);
        break;
      case "ProgresoN5":
        navigateToHomeStack("ActividadesN5");
        break;
      case "Perfil":
      case "Notificaciones":
      case "Chat":
        (navigation as any).getParent?.()?.navigate(route as never);
        break;
      default:
        (navigation as any).navigate(route as never);
        break;
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#7E0D18" />
      </View>
    );
  }

  const avatarUri = getAvatarUri(userDoc);
  const displayName =
    userDoc?.displayName || auth.currentUser?.displayName || "Mapache";
  const firstName = (displayName || "Mapache").split(" ")[0];

  // ==== Rojos (más intensos) ====
  const RED_START = "#9D0012"; // profundo
  const RED_MID = "#C7081F"; // medio saturado
  const RED_END = "#FF2B3B"; // vivo

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/final_home_background.webp")}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: "cover" }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.hamburger}
              onPress={openDrawer}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú de navegación"
            >
              <Animated.View style={{ transform: [{ scale: hamburgerAnim }] }}>
                <Image
                  source={require("../../assets/icons/hamburger.webp")}
                  style={styles.hamburgerIcon}
                />
              </Animated.View>
            </Pressable>

            <Text style={styles.headerTitle}>Hola, {firstName}</Text>

            <TouchableOpacity
              onPress={() =>
                (navigation as any).getParent?.()?.navigate("Perfil" as never)
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Ir a mi perfil"
            >
              <AvatarWithFrame size={80} uri={avatarUri} />
            </TouchableOpacity>
          </View>

          {/* Progreso / Dojo de pruebas */}
          <Animated.View style={[styles.progressCard, fadeUpStyle(aProgress)]}>
            <Image
              source={require("../../assets/images/cloud_swirl.webp")}
              style={styles.cloudDecor}
              resizeMode="contain"
            />
            <View style={styles.progressRow}>
              <View style={styles.levelCircle}>
                <ExpoImage
                  source={require("../../assets/images/cursos/rueda2.webp")}
                  style={styles.levelIcon}
                  contentFit="contain"
                />
              </View>
              <View style={styles.progressTextCol}>
                <Text style={styles.progressTitle}>
                  Dojo de pruebas:{"\n"}ponte a prueba de N5 a N1
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.progressBtn}
              onPress={() => go("ProgresoN5")}
              activeOpacity={0.9}
            >
              <Text style={styles.progressBtnText}>
                Entrar al dojo de nivel 🏯
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Panel Notas / Calendario */}
          <Animated.View style={[styles.panelWrap, fadeUpStyle(aPanel)]}>
            <ImageBackground
              source={require("../../assets/images/cuadroNotas.webp")}
              style={styles.panelBg}
              imageStyle={styles.panelBgImage}
            >
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => go("Notas")}
                  style={styles.actionBtn}
                  activeOpacity={0.9}
                >
                  <Image
                    source={require("../../assets/images/Notas.webp")}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Notas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => go("Calendario")}
                  style={styles.actionBtn}
                  activeOpacity={0.9}
                >
                  <Image
                    source={require("../../assets/images/Calendario.webp")}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Calendario</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </Animated.View>

          {/* Tarjetas de cursos */}
          <View style={styles.cardsGrid}>
            {/* N5 */}
            <Animated.View
              style={[
                fadeUpStyle(aCard1, 24),
                { width: (width - 16 * 2 - 12) / 2 },
              ]}
            >
              <CourseCard
                title="Tanuki: Nivel N5"
                image={require("../../assets/images/cursos/n5_mapache.webp")}
                onPress={() => go("BienvenidaCursoN5")}
                iconW={160}
                iconH={90}
                colors={[RED_START, RED_MID, RED_END]}
              />
            </Animated.View>

            {/* N4 */}
            <Animated.View
              style={[
                fadeUpStyle(aCard2, 24),
                { width: (width - 16 * 2 - 12) / 2 },
              ]}
            >
              <CourseCard
                title="Kitsune: Nivel N4"
                image={require("../../assets/images/cursos/n4_zorro.webp")}
                onPress={() => go("N4Intro")}
                iconW={160}
                iconH={90}
                colors={[RED_START, RED_MID, RED_END]}
              />
            </Animated.View>

            {/* N3 (wide) — Raion con león blanco */}
            <Animated.View style={[fadeUpStyle(aCard3, 24), { width: "100%" }]}>
              <CourseWide
                title="Raion: Nivel N3"
                image={require("../../assets/images/cursos/leon_blanco_transparente.webp")}
                onPress={() => go("N3Intro")}
                colors={[RED_START, RED_MID, RED_END]}
              />
            </Animated.View>

            {/* N2 Panda y N1 Dragón */}
            <Animated.View style={[styles.extraRow, fadeUpStyle(aMore, 24)]}>
              <CourseCard
                title="Panda: Nivel N2"
                image={require("../../assets/images/cursos/n2_pandabueno.png")}
                onPress={() => go("N2Intro")}
                iconW={160}
                iconH={90}
                colors={[RED_START, RED_MID, RED_END]}
              />
              <CourseCard
                title="Dragón: Nivel N1"
                image={require("../../assets/images/cursos/n1_dragon.webp")}
                onPress={() => go("N1Intro")}
                iconW={160}
                iconH={90}
                colors={[RED_START, RED_MID, RED_END]}
              />
            </Animated.View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Barra inferior fija */}
        <View pointerEvents="box-none" style={styles.bottomBarFixed}>
          <View style={styles.bottomBg}>
            <TouchableOpacity
              onPress={() => go("Notificaciones")}
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/bell.webp")}
                style={styles.bottomIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => go("Notas")}
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/heart.webp")}
                style={styles.bottomIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => go("Chat")}
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/ia.webp")}
                style={styles.bottomIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <IntroVideoModal
        visible={showIntro}
        sourceUrl={videoUrl}
        onClose={() => setShowIntro(false)}
        onDontShowAgain={async () => {
          await markIntroVideoSeen();
          setShowIntro(false);
        }}
      />
    </View>
  );
}

/* ==== Cards ==== */
function CourseCard({
  title,
  image,
  onPress,
  iconW = 160,
  iconH = 90,
  colors = ["#9D0012", "#C7081F", "#FF2B3B"],
}: {
  title: string;
  image: any;
  onPress: () => void;
  iconW?: number;
  iconH?: number;
  colors?: string[];
}) {
  const { width } = Dimensions.get("window");
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: (width - 16 * 2 - 12) / 2,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardArt}>
        <Image
          source={image}
          style={{ width: iconW, height: iconH, resizeMode: "contain" }}
        />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function CourseWide({
  title,
  image,
  onPress,
  colors = ["#9D0012", "#C7081F", "#FF2B3B"],
}: {
  title: string;
  image: any;
  onPress: () => void;
  colors?: string[];
}) {
  return (
    <TouchableOpacity style={styles.wide} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.wideRow}>
        <Image source={image} style={styles.wideIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.wideTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 50, paddingBottom: 120 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Hamburguesa más pequeña
  hamburger: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  hamburgerIcon: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 26, // más pequeño
    fontWeight: "800",
    color: "#5C0A14",
  },

  // Progreso / Dojo
  progressCard: {
    backgroundColor: "#7E0D18",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  cloudDecor: {
    position: "absolute",
    right: 14,
    top: 10,
    width: 90,
    height: 60,
    opacity: 0.9,
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: { width: 64, height: 64 },
  progressTextCol: { flex: 1, paddingRight: 60 },
  progressTitle: {
    color: "#fff",
    fontSize: 14, // más pequeño
    fontWeight: "800",
    lineHeight: 20,
  },
  progressBtn: {
    backgroundColor: "#FFF3F3",
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  progressBtnText: {
    fontWeight: "800",
    color: "#7E0D18",
  },

  // Notas / Calendario
  panelWrap: { marginTop: 12, paddingHorizontal: 16 },
  panelBg: { height: 118, justifyContent: "center", paddingHorizontal: 18 },
  panelBgImage: { resizeMode: "stretch", borderRadius: 14 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 14,
  },
  actionBtn: {
    width: "42%",
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionIcon: { width: 26, height: 26, resizeMode: "contain" },
  actionText: { fontWeight: "800", fontSize: 16, color: "#6B0F17" },

  // Cards
  cardsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    rowGap: 12,
    columnGap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  extraRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  card: {
    borderRadius: 18,
    padding: 12,
    overflow: "hidden",
  },
  cardArt: {
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowRadius: 6,
  },

  // Wide
  wide: { width: "100%", borderRadius: 22, padding: 14, overflow: "hidden" },
  wideRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wideIcon: { width: 105, height: 105, resizeMode: "contain" },
  wideTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowRadius: 6,
  },

  // Barra inferior (subida 25 px)
  bottomBarFixed: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 37, // antes 12 → subido ~25px
    alignItems: "center",
    pointerEvents: "box-none",
  },
  bottomBg: {
    width: "70%",
    height: 74,
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "rgba(30, 8, 10, 0.95)",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bottomItem: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIcon: { width: 32, height: 32, resizeMode: "contain" },
});
