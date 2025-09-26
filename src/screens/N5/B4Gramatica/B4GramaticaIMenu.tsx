// src/screens/N5/B4Gramatica/B4GramaticaIMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Solo rutas del bloque B4 (estrecha el tipo para satisfy navigate) */
type B4Route =
  | "B4_Desu"
  | "B4_DesuNeg"
  | "B4_PregKa"
  | "B4_KoreSoreAre"
  | "B4_NoModifier"
  | "B4_WaGa"
  | "B4_Wo"
  | "B4_NiHe"
  | "B4_De"
  | "B4_ArimasuImasu"
  | "B4_Adjetivos"
  | "B4_Mo"
  | "B4_Tiempo"
  | "B4_MasuIntro"
  | "B4_MasuNeg";

/** ===================== Datos ===================== */
type Topic = {
  key: string;
  route: B4Route;
  jp: string;
  es: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TOPICS: Topic[] = [
  { key: "desu",        route: "B4_Desu",        jp: "A は B です",       es: "Oración copulativa",   desc: "A es B. Afirmación básica con です.", icon: "pricetag-outline" },
  { key: "desuNeg",     route: "B4_DesuNeg",     jp: "〜じゃありません",   es: "Negación de です",     desc: "Forma cortés negativa del copulativo.", icon: "remove-circle-outline" },
  { key: "pregKa",      route: "B4_PregKa",      jp: "〜ですか",          es: "Preguntas con か",     desc: "Convierte la oración en pregunta.", icon: "help-circle-outline" },
  { key: "koreSoreAre", route: "B4_KoreSoreAre", jp: "これ／それ／あれ",   es: "Demostrativos",        desc: "Esto/eso/aquello + です.", icon: "cube-outline" },
  { key: "koreNo",      route: "B4_NoModifier",  jp: "N1 の N2",          es: "Modificador の",       desc: "Posesión / pertenencia / clasificación.", icon: "link-outline" },
  { key: "waGa",        route: "B4_WaGa",        jp: "は・が",             es: "Tópico vs. sujeto",    desc: "Contraste básico de は y が (N5).", icon: "contrast-outline" },
  { key: "wo",          route: "B4_Wo",          jp: "を",                es: "Objeto directo",       desc: "Marca el objeto de la acción.", icon: "ellipse-outline" },
  { key: "niHe",        route: "B4_NiHe",        jp: "に／へ",             es: "Destino y tiempo",     desc: "Meta del movimiento / punto temporal.", icon: "navigate-outline" },
  { key: "de",          route: "B4_De",          jp: "で",                es: "Lugar de la acción",   desc: "Dónde ocurre la acción (medio/lugar).", icon: "pin-outline" },
  { key: "arimasuImasu",route: "B4_ArimasuImasu",jp: "あります／います",   es: "Existencia",           desc: "Hay/está (cosas vs. seres animados).", icon: "leaf-outline" },
  { key: "adjetivos",   route: "B4_Adjetivos",   jp: "い形容詞／な形容詞", es: "Adjetivos い/な",       desc: "Afirm./neg. presente (N5).", icon: "color-wand-outline" },
  { key: "mo",          route: "B4_Mo",          jp: "も",                es: "También",              desc: "Suma/igualdad semántica: N も ...", icon: "add-circle-outline" },
  { key: "tiempo",      route: "B4_Tiempo",      jp: "時間・曜日・に",      es: "Tiempo y días",        desc: "Horas, minutos, días y partículas clave.", icon: "time-outline" },
  { key: "masuIntro",   route: "B4_MasuIntro",   jp: "ます形（現在）",       es: "Verbos -ます",         desc: "Presente/ habitual afirmativo.", icon: "flash-outline" },
  { key: "masuNeg",     route: "B4_MasuNeg",     jp: "〜ません",            es: "Negación -ます",       desc: "Presente negativo cortés.", icon: "close-circle-outline" },
];

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

/** ===================== UI ===================== */
export default function B4GramaticaIMenu() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />
      <ScrollView contentContainerStyle={s.c}>
        <View style={s.header}>
          <Text style={s.kicker}>文法ブロック 4</Text>
          <Text style={s.title}>Gramática I — ぶんぽう（初級）</Text>
          <Text style={s.jpSub}>Estructuras básicas, partículas y oraciones con です</Text>
          <View style={s.tagsRow}><Tag label="入門" /><Tag label="N5" /><Tag label="パターン練習" /></View>
        </View>

        <View style={s.guide}>
          <Text style={s.h2}>¿Cómo estudiar este bloque?</Text>
          <Text style={s.p}>
            Te sugerimos el orden: <Text style={s.bold}>AはBです → 〜ですか → これ/それ/あれ → の → partículas（を・に/へ・で） → あります/います → い/な形容詞 → も → verbos -ます</Text>.
            Cada tarjeta te lleva a una pantalla con ejemplos y práctica guiada.
          </Text>
        </View>

        <View style={s.grid}>
          {TOPICS.map((t) => (
            <TopicCard
              key={t.key}
              topic={t}
              onPress={() => navigation.navigate(t.route)}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

/** ===================== Componentes ===================== */
function TopicCard({ topic, onPress }: { topic: Topic; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={s.cardInner}
      >
        <View style={s.iconWrap}>
          <Ionicons name={topic.icon} size={20} color={CRIMSON} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardJp}>{topic.jp}</Text>
          <Text style={s.cardEs}>{topic.es}</Text>
          <Text style={s.cardDesc}>{topic.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

function Tag({ label }: { label: string }) {
  return (<View style={s.tag}><Text style={s.tagTxt}>{label}</Text></View>);
}

function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.round(Math.random() * 10);
        const x = Math.round(Math.random() * (width - size));
        const delay = Math.round(Math.random() * 2500);
        const rotStart = Math.random() * 360;
        const duration = 6000 + Math.round(Math.random() * 2000);
        return { id: i, size, x, delay, rotStart, duration };
      }),
    [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((p) => (
        <Petal key={p.id} {...p} H={height} />
      ))}
    </View>
  );
}
function Petal({
  size,
  x,
  delay,
  rotStart,
  duration,
  H,
}: {
  size: number;
  x: number;
  delay: number;
  rotStart: number;
  duration: number;
  H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true }).start(() => {
        if (!alive) return;
        setTimeout(fall, Math.random() * 1000);
      });
    };
    const rotLoop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const start = setTimeout(() => {
      fall();
      rotLoop.start();
      swayLoop.start();
    }, delay);
    return () => {
      alive = false;
      clearTimeout(start);
      rot.stopAnimation();
      sway.stopAnimation();
      y.stopAnimation();
    };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });
  return (
    <Animated.View
      style={[
        s.petal,
        {
          width: size,
          height: size * 1.4,
          borderRadius: size,
          transform: [{ translateX }, { translateY: y }, { rotate }],
        },
      ]}
    />
  );
}



const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    backgroundColor: "#fffdf7",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  guide: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", padding: 16 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },

  grid: { marginTop: 8, gap: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  cardInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f6",
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  cardJp: { color: INK, fontSize: 15, fontWeight: "900" },
  cardEs: { color: "#374151", marginTop: 2, fontWeight: "700" },
  cardDesc: { color: "#6B7280", marginTop: 2, fontSize: 12 },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
});
