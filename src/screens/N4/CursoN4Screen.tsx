import { AntDesign } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Fuji, Lantern, Sakura, Torii } from "../../../components/icons/JapaneseIcons";

const { width: W } = Dimensions.get("window");

/* ========= ASSETS ========= */
const BANNER_IMG = require("../../../assets/cursoN4/banner_2.webp");
const FOX_BANNER = require("../../../assets/cursoN4/fox_banner.webp");

/* ========= HELPERS ========= */
const MASK_GRAMMAR_TITLES = true;
const maskTitle = (title: string) => {
  let t = title.replace(/「[^」]*」/g, "").replace(/"[^"]*"/g, "");
  t = t.split("–")[0].trim();
  return t.replace(/\s{2,}/g, " ");
};
const splitLeadingEmoji = (text: string) => {
  const m = text.match(/^\p{Extended_Pictographic}/u);
  if (!m) return { emoji: "", text };
  return { emoji: m[0], text: text.slice(m[0].length).trim() };
};

/* ========= DATA ========= */
type TopicRow =
  | { type: "section"; key: string; title: string; emoji: string }
  | { type: "topic"; key: string; title: string; subtitle?: string; num: number };

const DATA: TopicRow[] = [
  { type: "section", key: "sec1", title: "Vida cotidiana y comunicación básica", emoji: "🏠" },
  { type: "topic", key: "t1",  num: 1,  title: "🗣 Presentaciones avanzadas – Hablar de ti, tu pasado y tus metas" },
  { type: "topic", key: "t2",  num: 2,  title: "🏡 Conversaciones en casa – Pedir favores, dar órdenes y consejos" },
  { type: "topic", key: "t3",  num: 3,  title: "🍱 En un restaurante – Hacer pedidos, expresar preferencias" },
  { type: "topic", key: "t4",  num: 4,  title: "🏪 En tiendas y centros comerciales – Pedir tallas, precios y ofertas" },
  { type: "topic", key: "t5",  num: 5,  title: "🚉 Transporte y viajes – Preguntar rutas, horarios, retrasos" },
  { type: "topic", key: "t6",  num: 6,  title: "🏫 En la escuela – Hablar de asignaturas, horarios y eventos" },
  { type: "topic", key: "t7",  num: 7,  title: "🏥 En el hospital – Explicar síntomas, pedir ayuda médica" },
  { type: "topic", key: "t8",  num: 8,  title: "📅 Planes y citas – Acordar fechas, sugerir actividades, rechazar planes" },

  { type: "section", key: "sec2", title: "Trabajo, responsabilidades y opiniones", emoji: "💼" },
  { type: "topic", key: "t9",  num: 9,  title: "💻 En la oficina – Expresar tareas, responsabilidades y permisos" },
  { type: "topic", key: "t10", num: 10, title: "📈 Proyectos y metas – Expresar intenciones, objetivos y planes futuros" },
  { type: "topic", key: "t11", num: 11, title: "🧑‍💼 Solicitudes formales – 〜ていただけますか" },
  { type: "topic", key: "t12", num: 12, title: "🧭 Dar instrucciones – Forma imperativa y causativa" },
  { type: "topic", key: "t13", num: 13, title: "🤔 Opiniones y pensamientos – Puntos de vista y razones" },
  { type: "topic", key: "t14", num: 14, title: "📰 Dar explicaciones – 「〜から」「〜ので」「〜のに」" },
  { type: "topic", key: "t15", num: 15, title: "🧩 Comparaciones y preferencias – 「〜より」「〜のほうが」" },
  { type: "topic", key: "t16", num: 16, title: "🪄 Deseos y esperanzas – 「〜たい」「〜てほしい」「〜と思う」" },

  { type: "section", key: "sec3", title: "Historias, recuerdos y experiencias", emoji: "🧠" },
  { type: "topic", key: "t17", num: 17, title: "🏞 Hablar del pasado – 「〜たことがある」" },
  { type: "topic", key: "t18", num: 18, title: "📸 Narrar historias – Conectores y secuencias" },
  { type: "topic", key: "t19", num: 19, title: "🎉 Eventos y fiestas – Celebraciones y planes" },
  { type: "topic", key: "t20", num: 20, title: "🧭 Causas y consecuencias – 「〜ために」「〜ので」「〜のに」" },
  { type: "topic", key: "t21", num: 21, title: "⏱ Rutinas y hábitos – 「〜ながら」「〜とき」「〜まえに」「〜あとで」" },
  { type: "topic", key: "t22", num: 22, title: "🪐 Cambios y transformaciones – 「〜になる」「〜ようになる」" },

  { type: "section", key: "sec4", title: "Comunicación avanzada y expresiones naturales", emoji: "📚" },
  { type: "topic", key: "t23", num: 23, title: "📢 Dar opiniones y consejos – 「〜たほうがいい」「〜べき」" },
  { type: "topic", key: "t24", num: 24, title: "🧩 Suposiciones y probabilidades – 「〜でしょう」「〜かもしれない」" },
  { type: "topic", key: "t25", num: 25, title: "📑 Permiso y prohibición – 「〜てもいい」「〜てはいけない」" },
  { type: "topic", key: "t26", num: 26, title: "💭 Condicionales – 「〜たら」「〜ば」「〜なら」" },
  { type: "topic", key: "t27", num: 27, title: "🪄 Intención – 「〜つもり」「〜ようと思う」" },
  { type: "topic", key: "t28", num: 28, title: "🔄 Pasivo y causativo – 「〜られる」「〜せる」" },
  { type: "topic", key: "t29", num: 29, title: "📊 Partículas avanzadas – 「〜について」「〜によって」「〜だけ」" },
  { type: "topic", key: "t30", num: 30, title: "🎓 Repaso final + simulacro de conversación JLPT N4" },
];

/* ========= Agrupación para carruseles ========= */
type Topic = Extract<TopicRow, { type: "topic" }>;
type Group = { key: string; title: string; items: Topic[] };
const buildGroups = (rows: TopicRow[]): Group[] => {
  const out: Group[] = [];
  let current: Group | null = null;
  rows.forEach((r) => {
    if (r.type === "section") {
      current = { key: r.key, title: r.title, items: [] };
      out.push(current);
    } else {
      if (!current) {
        current = { key: "misc", title: "Otros", items: [] };
        out.push(current);
      }
      current.items.push(r);
    }
  });
  return out;
};

/* ========= UI ========= */
// Tipado local mínimo para este screen (coincide con tu App.tsx)
type RootStackParamList = {
  CursoN4: undefined;
  N4_Tema: { id: number; title: string };
};

export default function CursoN4Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const LIST_DATA = useMemo(
    () =>
      MASK_GRAMMAR_TITLES
        ? DATA.map((i) => (i.type === "topic" ? { ...i, title: maskTitle(i.title) } : i))
        : DATA,
    []
  );

  const GROUPS = useMemo(() => buildGroups(LIST_DATA), [LIST_DATA]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Banner superior (SIN desvanecer) */}
      <SafeAreaView>
        <View style={styles.banner}>
          <ExpoImage
            source={BANNER_IMG}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top center"
          />
        </View>
      </SafeAreaView>

      {/* Banda roja */}
      <LinearGradient
        colors={["#C8736B", "#B86259"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBand}
      >
        <Text style={styles.headerTitle}>Kitsune · Curso N4</Text>
        <Text style={styles.headerSub}>30 unidades • Temas reales + Gramática</Text>
      </LinearGradient>

      {/* HERO “papel flotante” */}
      <View style={styles.heroWrap}>
        {/* líneas finas detrás (look cuaderno) */}
        <View style={[styles.line, { top: 18 }]} />
        <View style={[styles.line, { top: 66 }]} />
        <View style={[styles.line, { top: 114 }]} />
        <View style={[styles.line, { top: 162 }]} />

        {/* tarjeta papel con círculo del zorro */}
        <View style={styles.heroCard}>
          <View style={styles.foxRing}>
            <View style={styles.foxCircle}>
              <ExpoImage
                source={FOX_BANNER}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                contentPosition="top center"
              />
            </View>
          </View>
          <Text style={styles.heroTitle}>N4 レベルへようこそ</Text>
        </View>

        <View style={styles.heroShadow} />
      </View>

      {/* Secciones + Carruseles */}
      <FlatList
        data={GROUPS}
        keyExtractor={(g) => g.key}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={{ marginTop: 18 }}>
            <View style={styles.sectionRow}>
              {({
                "Vida cotidiana y comunicación básica": <Sakura size={18} color="#7E4A45" style={{ marginRight: 6 }} />,
                "Trabajo, responsabilidades y opiniones": <Lantern size={18} color="#7E4A45" style={{ marginRight: 6 }} />,
                "Historias, recuerdos y experiencias": <Fuji size={18} color="#7E4A45" style={{ marginRight: 6 }} />,
                "Comunicación avanzada y expresiones naturales": <Torii size={18} color="#7E4A45" style={{ marginRight: 6 }} />,
              } as Record<string, React.ReactNode>)[item.title] ?? (
                <Torii size={18} color="#7E4A45" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>

            <FlatList
              data={item.items}
              keyExtractor={(t) => t.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              decelerationRate="fast"
              snapToInterval={CARD_W + 12}
              snapToAlignment="start"
              renderItem={({ item: t }) => {
                const { emoji, text } = splitLeadingEmoji(t.title);
                return (
                  <Pressable
                    style={({ pressed }) => [styles.card, pressed && { transform: [{ translateY: 1 }] }]}
                    onPress={() =>
                      navigation.navigate("N4_Tema", {
                        // 👇 nos aseguramos que sea número (por si algún día viene como string)
                        id: Number(t.num),
                        title: t.title,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir tema ${t.num}`}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.leadIcon}>
                        <Text style={styles.leadEmoji}>{emoji || "✦"}</Text>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {text}
                      </Text>

                      <View style={styles.trailing}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{t.num}</Text>
                        </View>
                        <AntDesign name="right" size={16} color="#B36B60" style={{ marginLeft: 6 }} />
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

/* ========= STYLES ========= */
const CARD_W = Math.floor(W * 0.86);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F3EF" },

  /* Banner superior (sin fade) */
  banner: {
    height: 120,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  /* Banda roja */
  headerBand: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub:   { marginTop: 2, fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.9)" },

  /* HERO board */
  heroWrap: {
    marginTop: 10,
    marginHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "#EFE8E2",
    overflow: "hidden",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(120,70,60,0.18)",
  },
  heroCard: {
    marginHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#FFFBF6",
    borderWidth: 1,
    borderColor: "#EAD9D1",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  /* Zorro (mejor encuadre + aro) */
  foxRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#E4C7B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 8,
  },
  foxCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#EAD9D1",
    backgroundColor: "#fff",
  },

  /* Título japonés dentro del hero */
  heroTitle: {
    fontWeight: "900",
    color: "#6E2B27",
    fontSize: 16,
    letterSpacing: 1,
  },

  /* sombra bajo la tarjeta */
  heroShadow: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#000",
    opacity: 0.08,
  },

  /* Secciones */
  sectionRow: {
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#7E4A45" },

  /* Tarjetas (carrusel) */
  card: {
    width: CARD_W,
    minHeight: 86,
    borderRadius: 16,
    backgroundColor: "#FFFBF6",
    borderWidth: 1,
    borderColor: "#EAD9D1",
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  leadIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F3E3DD",
    alignItems: "center", justifyContent: "center",
    marginRight: 12, borderWidth: 1, borderColor: "#E5CFC7",
  },
  leadEmoji: { fontSize: 18 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: "#3E0B12", lineHeight: 22 },
  trailing: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  badge: {
    minWidth: 28, height: 28, paddingHorizontal: 6, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3BBB3",
  },
  badgeText: { fontWeight: "900", color: "#B36B60" },
});
