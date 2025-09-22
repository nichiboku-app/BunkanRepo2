// /src/screens/N5/B3_ProfesionesScreen/B3_ProfesionesScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import type { RootStackParamList } from "../../../../types";

/* =========================================================
   🎎 Estética japonesa sutil
   - Fondo tipo pergamino con sobrecapa translúcida
   - Encabezado con título JP (職業 / しょくぎょう)
   - Separador decorativo (seigaiha simplificado)
   - Botones tipo "tarjeta pergamino" con sombra suave
   ========================================================= */

type Nav = NativeStackNavigationProp<RootStackParamList>;

function SeigaihaDivider({ height = 28 }: { height?: number }) {
  // Patrón de olas estilizado minimal
  return (
    <Svg width="100%" height={height} viewBox="0 0 300 28">
      <G fill="none" stroke="#c9bfa6" strokeWidth={1.1}>
        <Path d="M0 20 Q15 8 30 20 T60 20 T90 20 T120 20 T150 20 T180 20 T210 20 T240 20 T270 20 T300 20" />
        <Path d="M0 26 Q15 14 30 26 T60 26 T90 26 T120 26 T150 26 T180 26 T210 26 T240 26 T270 26 T300 26" />
      </G>
    </Svg>
  );
}

function SakuraBullet() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <G fill="none" stroke="#d66b7b" strokeWidth={1.2}>
        <Path d="M12 2 C10.5 4.5 9 6 9 7.8C7.2 7.8 5.5 9.3 5.5 11.3C5.5 13.5 7.3 15 9.4 15C9.5 16.8 10.6 18.5 12 19.8C13.4 18.5 14.5 16.8 14.6 15C16.7 15 18.5 13.5 18.5 11.3C18.5 9.3 16.8 7.8 15 7.8C15 6 13.5 4.5 12 2Z" />
      </G>
    </Svg>
  );
}

function MenuButton({
  title,
  subtitle,
  rightHint,
  onPress,
}: {
  title: string;
  subtitle?: string;
  rightHint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }], opacity: 0.97 }]}
    >
      <View style={styles.cardLeft}>
        <SakuraBullet />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.cardRight}>{rightHint ?? "›"}</Text>
    </Pressable>
  );
}

export default function B3_ProfesionesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ImageBackground
      source={require("../../../../assets/images/final_home_background.png")}
      resizeMode="cover"
      style={styles.bg}
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.kana}>しょくぎょう</Text>
          <Text style={styles.kanji}>職 業</Text>
          <Text style={styles.title}>Profesiones</Text>
        </View>

        <SeigaihaDivider />

        {/* Grid de opciones */}
        <View style={styles.grid}>
          <MenuButton
            title="Tarjetas ilustradas"
            subtitle="Flashcards con audio"
            rightHint="🃏"
            onPress={() => navigation.navigate("B3_Profesiones_Flashcards")}
          />
          <MenuButton
            title="Emparejar"
            subtitle="Arrastra imagen ⇄ nombre"
            rightHint="🧩"
            onPress={() => navigation.navigate("B3_Profesiones_Matching")}
          />
          <MenuButton
            title="Dictado visual"
            subtitle="Escucha y elige"
            rightHint="🎧"
            onPress={() => navigation.navigate("B3_Profesiones_Dictado")}
          />
          <MenuButton
            title="Roleplay"
            subtitle="わたしは〜です"
            rightHint="🎤"
            onPress={() => navigation.navigate("B3_Profesiones_Roleplay")}
          />
          <MenuButton
            title="Quiz"
            subtitle="Opción múltiple"
            rightHint="📝"
            onPress={() => navigation.navigate("B3_Profesiones_Quiz")}
          />
        </View>

        {/* Nota inferior */}
        <View style={styles.footerNote}>
          <LineDecor />
          <Text style={styles.hint}>Consejo: practica diciendo «わたしは せんせい です». </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function LineDecor() {
  return (
    <Svg width="100%" height={20} viewBox="0 0 200 20">
      <G stroke="#c9bfa6" strokeWidth={1} fill="none">
        <Line x1="0" y1="10" x2="200" y2="10" />
        <Circle cx="10" cy="10" r="2.5" fill="#d66b7b" />
        <Circle cx="190" cy="10" r="2.5" fill="#d66b7b" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#f2efe6" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
  },
  container: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  kana: {
    fontSize: 14,
    letterSpacing: 2,
    color: "#7a7463",
  },
  kanji: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 8,
    color: "#2e2a23",
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3a352c",
    marginTop: 6,
    marginBottom: 6,
  },
  grid: {
    gap: 12,
    marginTop: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e7dfc6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardLeft: {
    width: 26,
    alignItems: "center",
    marginRight: 10,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#2f2a22" },
  cardSub: { fontSize: 13, color: "#7b7464", marginTop: 3 },
  cardRight: { fontSize: 20, marginLeft: 8 },
  footerNote: { marginTop: 16 },
  hint: { textAlign: "center", color: "#746c5a", marginTop: 6 },
});
