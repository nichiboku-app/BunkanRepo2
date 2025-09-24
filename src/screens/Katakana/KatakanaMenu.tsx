// src/screens/Katakana/KatakanaMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/** ============ Tipos de navegación ============ */
type RowKey = "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W";

type Nav = {
  navigate: (route: string, params?: any) => void;
};

/** ============ Datos del menú ============ */
const FAMILIES: { key: RowKey; title: string; sample: string; hint: string }[] = [
  { key: "A", title: "A (ア行)", sample: "ア・イ・ウ・エ・オ", hint: "Base y trazos rectos" },
  { key: "K", title: "K (カ行)", sample: "カ・キ・ク・ケ・コ", hint: "Muchas diagonales" },
  { key: "S", title: "S (サ行)", sample: "サ・シ・ス・セ・ソ", hint: "¡Ojo con シ・ツ・ソ!" },
  { key: "T", title: "T (タ行)", sample: "タ・チ・ツ・テ・ト", hint: "Orden de puntos" },
  { key: "N", title: "N (ナ行)", sample: "ナ・ニ・ヌ・ネ・ノ", hint: "Formas sencillas" },
  { key: "H", title: "H (ハ行)", sample: "ハ・ヒ・フ・ヘ・ホ", hint: "Similares entre sí" },
  { key: "M", title: "M (マ行)", sample: "マ・ミ・ム・メ・モ", hint: "Variación sutil" },
  { key: "Y", title: "Y (ヤ行)", sample: "ヤ・ユ・ヨ", hint: "Corta y directa" },
  { key: "R", title: "R (ラ行)", sample: "ラ・リ・ル・レ・ロ", hint: "¡Confunde poco!" },
  { key: "W", title: "W (ワ行)", sample: "ワ・ヲ・ン", hint: "Finales y partícula" },
];

/** ============ Componente ============ */
export default function KatakanaMenu() {
  const navigation = useNavigation<Nav>();

  const openRow = (row: RowKey) => {
    navigation.navigate("KatakanaRow", { row });
  };

  const openChallenge = () => {
    navigation.navigate("KatakanaChallenge");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Katakana — Menú de estudio</Text>
        <Text style={styles.subtitle}>
          Elige una familia para practicar trazos y pronunciación, o prueba el desafío cronometrado.
        </Text>
      </View>

      {/* Hero: Historia breve */}
      <View style={styles.cardHero}>
        <View style={styles.rowHead}>
          <Ionicons name="book" size={18} color={INK} />
          <Text style={styles.h}>Historia del katakana (versión exprés)</Text>
        </View>
        <Text style={styles.p}>
          El <Text style={styles.bold}>katakana</Text> nació en la época Heian como un sistema de
          anotaciones rápidas basado en caracteres chinos. Con el tiempo se consolidó como uno de
          los dos silabarios del japonés (junto al hiragana), pensado para representar sonidos de
          forma clara y compacta.
        </Text>
      </View>

      {/* Importancia hoy */}
      <View style={styles.card}>
        <View style={styles.rowHead}>
          <Ionicons name="star" size={18} color={INK} />
          <Text style={styles.h}>¿Por qué es importante hoy?</Text>
        </View>
        <View style={styles.bullets}>
          <Bullet>Se usa para <Text style={styles.bold}>préstamos del inglés</Text> (コンピューター, バス).</Bullet>
          <Bullet>Para <Text style={styles.bold}>nombres extranjeros</Text> y marcas (マリア, コカコーラ).</Bullet>
          <Bullet>Para <Text style={styles.bold}>onomatopeyas</Text> y énfasis en textos (ドキドキ, キラキラ).</Bullet>
          <Bullet>En <Text style={styles.bold}>tecnología/ciencia</Text>, especies, menús, señalética...</Bullet>
          <Bullet>Es clave para <Text style={styles.bold}>leer el día a día</Text> en Japón (labels, carteles, apps).</Bullet>
        </View>
      </View>

      {/* CTA desafío */}
      <Pressable onPress={openChallenge} style={styles.cta}>
        <Ionicons name="flash" size={18} color="#fff" />
        <Text style={styles.ctaTxt}>Desafío cronometrado</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </Pressable>

      {/* Grid de familias */}
      <Text style={styles.section}>Familias básicas</Text>
      <View style={styles.grid}>
        {FAMILIES.map((f) => (
          <Pressable key={f.key} onPress={() => openRow(f.key)} style={styles.tile}>
            <View style={styles.tileHeader}>
              <Text style={styles.tileTitle}>{f.title}</Text>
              <Ionicons name="enter-outline" size={16} color={INK} />
            </View>
            <Text style={styles.tileSample}>{f.sample}</Text>
            <Text style={styles.tileHint}>{f.hint}</Text>
          </Pressable>
        ))}
      </View>

      {/* Tips para aprender más rápido */}
      <Text style={styles.section}>Tips para aprender más rápido</Text>
      <View style={styles.card}>
        <View style={styles.bullets}>
          <Bullet>Estudia por <Text style={styles.bold}>familias</Text> (A→K→S...). Sesiones cortas (10–15 min).</Bullet>
          <Bullet>Respeta el <Text style={styles.bold}>orden de trazos</Text> (usa las pantallas de cada letra).</Bullet>
          <Bullet>Contrasta pares difíciles: <Text style={styles.mono}>シ vs ツ</Text>, <Text style={styles.mono}>ソ vs ン</Text>, <Text style={styles.mono}>リ vs ル</Text>.</Bullet>
          <Bullet>Lee <Text style={styles.bold}>katakana del mundo real</Text>: empaques, apps, carteles (1 min al día).</Bullet>
          <Bullet>Haz tu lista de <Text style={styles.bold}>préstamos comunes</Text>: アイス, コーヒー, バナナ…</Bullet>
          <Bullet>Usa <Text style={styles.bold}>repetición espaciada</Text> y “shadowing” con audio.</Bullet>
        </View>
      </View>
    </ScrollView>
  );
}

/** ============ Bullet helper ============ */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.p}>{children}</Text>
    </View>
  );
}

/** ============ Estilos ============ */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const GOLD = "#C6A15B";
const CRIMSON = "#B32133";
const WASHI = "#fffdf7";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },

  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "900", color: INK, textAlign: "center" },
  subtitle: {
    textAlign: "center",
    color: "#4B5563",
    marginTop: 6,
    paddingHorizontal: 12,
    fontSize: 13,
  },

  section: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 16,
    fontWeight: "900",
    color: INK,
  },

  cardHero: {
    backgroundColor: WASHI,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  rowHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { color: "#374151", fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  mono: { fontFamily: "monospace" },

  bullets: { gap: 6 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: GOLD,
    marginTop: 7,
  },

  cta: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: CRIMSON,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#9f1c2c",
  },
  ctaTxt: { color: "#fff", fontWeight: "900" },

  grid: {
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  tile: {
    flexBasis: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tileHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tileTitle: { fontWeight: "900", color: INK },
  tileSample: { marginTop: 6, fontSize: 16, fontWeight: "900", color: INK },
  tileHint: { marginTop: 4, color: "#6B7280", fontSize: 12 },
});
