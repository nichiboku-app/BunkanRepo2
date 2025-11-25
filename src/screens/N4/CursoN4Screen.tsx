// src/screens/N4/CursoN4Screen.tsx
import { AntDesign } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Alert,
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
import { useUserPlan } from "../../context/UserPlanContext";

const { width: W } = Dimensions.get("window");

/* ========= ASSETS (según tu carpeta assets/cursoN4/) ========= */
const BANNER_IMG = require("../../../assets/cursoN4/banner_warm_cropped.webp");
const FOX_BANNER = require("../../../assets/cursoN4/fox_banner.webp");

// Imágenes con nombres en español (y algunos con typos, tal como existen)
const CASA                 = require("../../../assets/cursoN4/casa.webp");
const RESTAURANTE          = require("../../../assets/cursoN4/restaurante.webp");
const TRANSPORTE_TYPO      = require("../../../assets/cursoN4/trasnporte.webp");            // (typo) existe así
const ESCUELA              = require("../../../assets/cursoN4/escuela.webp");
const HOSPITAL             = require("../../../assets/cursoN4/hospital.webp");
const PLANES_CITAS         = require("../../../assets/cursoN4/planes_citas.webp");
const OFICINA              = require("../../../assets/cursoN4/oficina.webp");
const DAR_INSTRUCCIONES    = require("../../../assets/cursoN4/darintrucciones.webp");       // (typo) existe así
const OPINIONES_CONSEJO    = require("../../../assets/cursoN4/opiniones_consejo.webp");
const CAUSA_CONSECUENCIAS  = require("../../../assets/cursoN4/causa_consecuencias.webp");
const COMPARACIONES        = require("../../../assets/cursoN4/comparaciones.webp");
const DESEO_ESPERANZAS     = require("../../../assets/cursoN4/deseo_esperanzas.webp");
const PASADO               = require("../../../assets/cursoN4/pasado.webp");
const NARRAR_HISTORIAS     = require("../../../assets/cursoN4/narrar_historias.webp");
const EVENTOS_FIESTAS_TYPO = require("../../../assets/cursoN4/evetnos_fiestas.webp");       // (typo) existe así
const RUTINA               = require("../../../assets/cursoN4/rutina.webp");
const TRANSFORMACIONES     = require("../../../assets/cursoN4/transformaciones.webp");
const SUPOSICIONES         = require("../../../assets/cursoN4/suposiciones.webp");
const PERMISO_PROHIBICION  = require("../../../assets/cursoN4/permiso_prohibicion.webp");
const CONDICIONALES        = require("../../../assets/cursoN4/condicionales.webp");
const INTENCION            = require("../../../assets/cursoN4/intencion.webp");
// (también tienes intension.webp, pero usamos intencion.webp)
const PERMISO_CAUSATIVO    = require("../../../assets/cursoN4/permiso_causativo.webp");
const PARTICULAS_AVANZADAS = require("../../../assets/cursoN4/particulas_avanzadas.webp");
const REPASO_FINAL_TYPO    = require("../../../assets/cursoN4/repasofinal.webp");           // (typo) existe así
const SOLICITUD_FORMAL_TYPO= require("../../../assets/cursoN4/solicitudformal.webp");       // (typo) existe así

// 4 fotos sueltas que tienes en esa carpeta (las usamos para completar mapeos faltantes)
const PHOTO_45   = require("../../../assets/cursoN4/photo_2025_11_03_18_28_45.webp");
const PHOTO_54   = require("../../../assets/cursoN4/photo_2025_11_03_18_28_54.webp");
const PHOTO_2912 = require("../../../assets/cursoN4/photo_2025_11_03_18_29_12.webp");
const PHOTO_2919 = require("../../../assets/cursoN4/photo_2025_11_03_18_29_19.webp");

// Fallback rotatorio por si algún número no tuviera asignación directa
const TOPIC_COVERS = [
  CASA, RESTAURANTE, TRANSPORTE_TYPO, ESCUELA, HOSPITAL, PLANES_CITAS, OFICINA,
  OPINIONES_CONSEJO, CAUSA_CONSECUENCIAS, COMPARACIONES, DESEO_ESPERANZAS, PASADO,
  NARRAR_HISTORIAS, EVENTOS_FIESTAS_TYPO, RUTINA, TRANSFORMACIONES, SUPOSICIONES,
  PERMISO_PROHIBICION, CONDICIONALES, INTENCION, PERMISO_CAUSATIVO, PARTICULAS_AVANZADAS,
  REPASO_FINAL_TYPO, PHOTO_45, PHOTO_54, PHOTO_2912, PHOTO_2919,
] as const;

const coverForIdx = (n: number) => {
  const m = TOPIC_COVERS.length;
  const seed = (n * 9301 + 49297) % 233280;
  const idx = seed % m;
  return TOPIC_COVERS[idx];
};

// Mapeo 1:1 por número de tema → imagen con el nombre que tienes
const IMG_BY_TOPIC: Record<number, any> = {
  1: PHOTO_45,              // Presentaciones avanzadas (foto)
  2: CASA,                  // Casa
  3: RESTAURANTE,           // Restaurante
  4: PHOTO_54,              // Tiendas y centros (usamos una foto)
  5: TRANSPORTE_TYPO,       // Transporte (archivo existe como "trasnporte.webp")
  6: ESCUELA,               // Escuela
  7: HOSPITAL,              // Hospital
  8: PLANES_CITAS,          // Planes y citas
  9: OFICINA,               // Oficina
  10: PHOTO_2912,           // Proyectos y metas (foto)
  11: SOLICITUD_FORMAL_TYPO,// Solicitudes formales (archivo existe como "solicitudformal.webp")
  12: DAR_INSTRUCCIONES,    // Dar instrucciones (archivo existe como "darintrucciones.webp")
  13: OPINIONES_CONSEJO,    // Opiniones y pensamientos
  14: CAUSA_CONSECUENCIAS,  // Dar explicaciones (usamos causas/consecuencias)
  15: COMPARACIONES,        // Comparaciones y preferencias
  16: DESEO_ESPERANZAS,     // Deseos y esperanzas
  17: PASADO,               // Hablar del pasado
  18: NARRAR_HISTORIAS,     // Narrar historias
  19: EVENTOS_FIESTAS_TYPO, // Eventos y fiestas (archivo existe como "evetnos_fiestas.webp")
  20: CAUSA_CONSECUENCIAS,  // Causas y consecuencias
  21: RUTINA,               // Rutinas y hábitos
  22: TRANSFORMACIONES,     // Transformaciones
  23: OPINIONES_CONSEJO,    // Dar opiniones y consejos
  24: SUPOSICIONES,         // Suposiciones y probabilidades
  25: PERMISO_PROHIBICION,  // Permiso y prohibición
  26: CONDICIONALES,        // Condicionales
  27: INTENCION,            // Intención
  28: PERMISO_CAUSATIVO,    // Pasivo y causativo (usamos permiso_causativo)
  29: PARTICULAS_AVANZADAS, // Partículas avanzadas
  30: REPASO_FINAL_TYPO,    // Repaso final (archivo existe como "repasofinal.webp")
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

/* ========= Agrupación ========= */
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

// Temas gratuitos en este curso
const FREE_TOPICS = [1, 2];

/* ========= Screen ========= */
type RootStackParamList = {
  CursoN4: undefined;
  N4_Tema: { id: number; title: string };
};

export default function CursoN4Screen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const GROUPS = useMemo(() => buildGroups(DATA), []);
  const { plan, planStatus, isPremium } = useUserPlan();

  const hasPremiumAccess = isPremium && planStatus === "active";

  const imageForTopic = (num: number) => IMG_BY_TOPIC[num] ?? coverForIdx(num);

  const handlePressTopic = (topic: Topic) => {
    const isPremiumTopic = !FREE_TOPICS.includes(topic.num);
    const isLocked = isPremiumTopic && !hasPremiumAccess;

    if (isLocked) {
      Alert.alert(
        "Contenido Premium",
        "Este tema forma parte de Nichiboku Premium.\n\nSe desbloquea al activar tu plan Premium."
      );
      return;
    }

    navigation.navigate("N4_Tema", { id: Number(topic.num), title: topic.title });
  };

  const planBannerText = (() => {
    if (hasPremiumAccess) {
      return "Curso N4 completo incluido en tu plan Premium activo ✨";
    }
    if (plan === "premium" && planStatus === "inactive") {
      return "Tu plan Premium está inactivo. Reactívalo para desbloquear todos los temas del Curso N4.";
    }
    return "Las unidades 1 y 2 son gratuitas. El resto del Curso N4 se desbloquea con Nichiboku Premium.";
  })();

  const planBannerSubText = (() => {
    if (hasPremiumAccess) {
      return "Explora libremente las 30 unidades con ejemplos reales y gramática aplicada.";
    }
    return "Actualiza a Nichiboku Premium para acceder a las 30 unidades completas del curso.";
  })();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ====== BANNER ====== */}
      <SafeAreaView>
        <View style={styles.banner}>
          <ExpoImage
            source={BANNER_IMG}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top center"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.30)", "rgba(0,0,0,0.10)", "transparent", "rgba(0,0,0,0.35)"]}
            locations={[0, 0.22, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle} numberOfLines={1}>Kitsune・Curso N4</Text>
            <Text style={styles.bannerSub} numberOfLines={2}>
              30 unidades ・ Temas reales ・ Gramática con propósito
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ====== Medallón ====== */}
      <View style={styles.foxMedallionWrap}>
        <View style={styles.goldRingOuter}>
          <View style={styles.goldRingInner}>
            <View style={styles.foxCircle}>
              <ExpoImage source={FOX_BANNER} style={StyleSheet.absoluteFill} contentFit="cover" />
            </View>
          </View>
        </View>
        <Text style={styles.heroJP}>N4 レベルへようこそ</Text>
        <Text style={styles.heroES} numberOfLines={2}>
          「努力は必ず実を結ぶ」 — el esfuerzo siempre da frutos.
        </Text>
      </View>

      {/* ====== Banner de plan ====== */}
      <View style={styles.planBanner}>
        <Text style={styles.planBannerText}>{planBannerText}</Text>
        <Text style={styles.planBannerSubText}>{planBannerSubText}</Text>
      </View>

      {/* ====== Secciones + carruseles ====== */}
      <FlatList
        data={GROUPS}
        keyExtractor={(g) => g.key}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 6 }}
        renderItem={({ item }) => (
          <View style={{ marginTop: 14 }}>
            <View style={styles.sectionRow}>
              {({
                "Vida cotidiana y comunicación básica": <Sakura size={18} color="#E5C7A2" style={{ marginRight: 6 }} />,
                "Trabajo, responsabilidades y opiniones": <Lantern size={18} color="#E5C7A2" style={{ marginRight: 6 }} />,
                "Historias, recuerdos y experiencias": <Fuji size={18} color="#E5C7A2" style={{ marginRight: 6 }} />,
                "Comunicación avanzada y expresiones naturales": <Torii size={18} color="#E5C7A2" style={{ marginRight: 6 }} />,
              } as Record<string, React.ReactNode>)[item.title] ?? (
                <Torii size={18} color="#E5C7A2" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.sectionTitle} numberOfLines={1}>{item.title}</Text>
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
                const emoji = (t.title.match(/^\p{Extended_Pictographic}/u) || ["✦"])[0];
                const text = t.title.replace(/^\p{Extended_Pictographic}\s*/u, "");
                const isPremiumTopic = !FREE_TOPICS.includes(t.num);
                const isLocked = isPremiumTopic && !hasPremiumAccess;

                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      isLocked && styles.cardLocked,
                      pressed && { transform: [{ translateY: 1 }] },
                    ]}
                    onPress={() => handlePressTopic(t)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir tema ${t.num}`}
                  >
                    <ExpoImage
                      source={imageForTopic(t.num)}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.35)","rgba(0,0,0,0.70)"]}
                      locations={[0,0.45,1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.cardIn}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.leadIcon}>
                          <Text style={styles.leadEmoji}>{emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{text}</Text>
                        </View>
                        <View style={styles.trailing}>
                          {isPremiumTopic && (
                            <View style={[styles.premiumPill, isLocked && styles.premiumPillLocked]}>
                              <AntDesign name="lock" size={11} color="#FCE9C8" style={{ marginRight: 4 }} />
                              <Text style={styles.premiumPillText}>
                                {hasPremiumAccess ? "Incluido" : "Premium"}
                              </Text>
                            </View>
                          )}
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{t.num}</Text>
                          </View>
                          <AntDesign name="right" size={16} color="#F3D9B6" style={{ marginLeft: 6 }} />
                        </View>
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
const CREMA = "#F6E7D3";
const CREMA_SUB = "rgba(246,231,211,0.92)";
const BG = "#171C27";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  banner: {
    height: 220,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    marginHorizontal: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  bannerTextBox: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 100,
    minHeight: 56,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bannerTitle: {
    fontSize: 24, fontWeight: "900", color: CREMA, letterSpacing: 0.3,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  bannerSub: {
    marginTop: 4, fontSize: 13, fontWeight: "700", color: CREMA_SUB, lineHeight: 18,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  foxMedallionWrap: {
    alignItems: "center",
    marginTop: -75,
    paddingBottom: 4,
  },
  goldRingOuter: {
    width: 132, height: 132, borderRadius: 66,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,215,170,0.35)",
    shadowColor: "#F7D190",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  goldRingInner: {
    width: 124, height: 124, borderRadius: 62,
    borderWidth: 10, borderColor: "#E7C26A",
    backgroundColor: BG,
    alignItems: "center", justifyContent: "center",
  },
  foxCircle: {
    width: 92, height: 92, borderRadius: 46,
    overflow: "hidden", borderWidth: 2, borderColor: "#F5E2C7", backgroundColor: "#fff",
  },
  heroJP: { marginTop: 10, color: CREMA, fontWeight: "900", fontSize: 16, letterSpacing: 1 },
  heroES: {
    marginTop: 4,
    color: "rgba(246,231,211,0.8)",
    fontWeight: "600",
    fontSize: 12,
    paddingHorizontal: 16,
    textAlign: "center",
  },

  /* Banner de plan */
  planBanner: {
    marginTop: 4,
    marginBottom: 4,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(246,231,211,0.4)",
    backgroundColor: "rgba(23,28,39,0.96)",
  },
  planBannerText: {
    color: "#F6E7D3",
    fontSize: 13,
    fontWeight: "800",
  },
  planBannerSubText: {
    marginTop: 2,
    color: "rgba(246,231,211,0.86)",
    fontSize: 11,
    fontWeight: "500",
  },

  sectionRow: {
    marginTop: 12, marginBottom: 8, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#EBD9C4" },

  card: {
    width: CARD_W,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1E2533",
    borderWidth: 1,
    borderColor: "rgba(246,231,211,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardLocked: {
    opacity: 0.92,
    borderColor: "rgba(246,231,211,0.10)",
  },
  cardIn: { flex: 1, padding: 14, justifyContent: "flex-end" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center" },
  leadIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(246,231,211,0.14)",
    alignItems: "center", justifyContent: "center",
    marginRight: 10, borderWidth: 1, borderColor: "rgba(246,231,211,0.28)",
  },
  leadEmoji: { fontSize: 17 },
  cardTitle: { color: "#FFF5E5", fontWeight: "900", fontSize: 14, lineHeight: 18 },
  trailing: { flexDirection: "row", alignItems: "center", marginLeft: 10 },

  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    backgroundColor: "rgba(255,233,198,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,233,198,0.85)",
  },
  premiumPillLocked: {
    backgroundColor: "rgba(15,15,20,0.75)",
    borderColor: "rgba(255,233,198,0.45)",
  },
  premiumPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FCE9C8",
  },

  badge: {
    minWidth: 26, height: 26, paddingHorizontal: 6, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFE9C6", borderWidth: 1, borderColor: "#E3BBB3",
  },
  badgeText: { fontWeight: "900", color: "#6B3C2F", fontSize: 12 },
});
