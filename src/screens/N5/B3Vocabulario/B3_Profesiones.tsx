// src/screens/N5/B3Vocabulario/B3_Profesiones.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

type Job = {
  key: string;
  jp: string;
  kana: string;
  ro: string;
  es: string;
  emoji?: string;
};

const JOBS: Job[] = [
  { key: "sensei", jp: "先生", kana: "せんせい", ro: "sensei", es: "Profesor/a", emoji: "👩‍🏫" },
  { key: "gakusei", jp: "学生", kana: "がくせい", ro: "gakusei", es: "Estudiante", emoji: "🧑‍🎓" },
  { key: "isha", jp: "医者", kana: "いしゃ", ro: "isha", es: "Médico/a", emoji: "🩺" },
  { key: "kangoshi", jp: "看護師", kana: "かんごし", ro: "kangoshi", es: "Enfermero/a", emoji: "🚑" },
  { key: "keisatsukan", jp: "警察官", kana: "けいさつかん", ro: "keisatsukan", es: "Policía", emoji: "👮" },
  { key: "shouboushi", jp: "消防士", kana: "しょうぼうし", ro: "shōbōshi", es: "Bombero/a", emoji: "🚒" },
  { key: "ryourinin", jp: "料理人", kana: "りょうりにん", ro: "ryōrinin", es: "Cocinero/a", emoji: "👨‍🍳" },
  { key: "tenin", jp: "店員", kana: "てんいん", ro: "ten'in", es: "Dependiente/a", emoji: "🛍️" },
  { key: "untenshu", jp: "運転手", kana: "うんてんしゅ", ro: "untenshu", es: "Conductor/a", emoji: "🚌" },
  { key: "enjinia", jp: "エンジニア", kana: "エンジニア", ro: "enjiniā", es: "Ingeniero/a", emoji: "🧑‍💻" },
  { key: "ongakuka", jp: "音楽家", kana: "おんがくか", ro: "ongakuka", es: "Músico/a", emoji: "🎵" },
  { key: "kashu", jp: "歌手", kana: "かしゅ", ro: "kashu", es: "Cantante", emoji: "🎤" },
];

function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}

export default function B3_Profesiones() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />
      <ScrollView contentContainerStyle={s.c}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>Profesiones — 職業（しょくぎょう）</Text>
          {/* Subtítulo solo con hiragana */}
          <Text style={s.jpSub}>じこしょうかい：なにを していますか？（¿A qué te dedicas?）</Text>

          <View style={s.tagsRow}>
            <Tag label="ロールプレイ" />
            <Tag label="カード" />
            <Tag label="ボイス" />
          </View>

          {/* Acciones */}
          <View style={s.row}>
            <BigBtn
              icon="briefcase-outline"
              label="Tarjetas"
              onPress={() => navigation.navigate("B3_Profesiones_Tarjetas")}
            />
            <BigBtn
              icon="chatbubbles-outline"
              label="Roleplay"
              onPress={() => navigation.navigate("B3_Profesiones_Roleplay")}
            />
          </View>
          <View style={[s.row, { marginTop: 8 }]}>
            <BigBtn
              icon="list-outline"
              label="Oraciones"
              onPress={() => navigation.navigate("B3_Profesiones_Oraciones")}
            />
            <BigBtn
              icon="document-text-outline"
              label="Diálogo"
              onPress={() => navigation.navigate("B3_Profesiones_Dialogo")}
            />
          </View>
        </View>

        <MiniGuideJobs />

        {/* Vista previa de vocabulario */}
        <View style={s.grid}>
          {JOBS.map((j) => (
            <PreviewCard key={j.key} job={j} onSpeak={() => speakJA(j.kana)} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/* ===== Mini Guía (modo primaria) ===== */
function MiniGuideJobs() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  // ejemplos con glosa palabra-por-palabra
  const EX = [
    {
      ja: "わたし は せんせい です。",
      ro: "watashi wa sensei desu.",
      es: "Yo soy profesor/a.",
      gloss: [
        ["わたし", "yo"],
        ["は", "tema (de mí)"],
        ["せんせい", "profesor/a"],
        ["です", "es/soy (amable)"],
      ],
    },
    {
      ja: "わたし は がくせい では ありません。",
      ro: "watashi wa gakusei dewa arimasen.",
      es: "Yo no soy estudiante.",
      gloss: [
        ["わたし", "yo"],
        ["は", "tema"],
        ["がくせい", "estudiante"],
        ["では ありません", "no es (amable)"],
      ],
    },
    {
      ja: "しごと は なん ですか。",
      ro: "shigoto wa nan desu ka?",
      es: "¿A qué te dedicas?",
      gloss: [
        ["しごと", "trabajo"],
        ["は", "tema (del trabajo)"],
        ["なん", "qué"],
        ["ですか", "es? (pregunta)"],
      ],
    },
    {
      ja: "おかあさん は かいしゃいん です。",
      ro: "okaasan wa kaishain desu.",
      es: "Mi mamá es empleada de oficina.",
      gloss: [
        ["おかあさん", "mamá"],
        ["は", "tema"],
        ["かいしゃいん", "empleada"],
        ["です", "es (amable)"],
      ],
    },
  ] as const;

  return (
    <View style={s.card}>
      <Text style={s.h2}>Mini-guía: profesiones (como en primaria)</Text>

      {/* 1. Decimos "de quién" + は */}
      <View style={s.stepRow}>
        <View style={s.badge}><Text style={s.badgeTxt}>1</Text></View>
        <Text style={s.p}>
          Primero decimos <Text style={s.bold}>de quién hablamos</Text> (yo, mamá, él…)
          y le pegamos <Text style={s.kbd}>は</Text>. Eso marca el <Text style={s.bold}>tema</Text>.
        </Text>
      </View>
      <View style={s.glossRow}>
        <View style={s.glossChip}><Text style={s.glossJp}>わたし</Text><Text style={s.glossEs}>yo</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>は</Text><Text style={s.glossEs}>tema</Text></View>
      </View>

      {/* 2. Decimos la profesión */}
      <View style={s.stepRow}>
        <View style={s.badge}><Text style={s.badgeTxt}>2</Text></View>
        <Text style={s.p}>
          Luego decimos <Text style={s.bold}>la profesión</Text> (せんせい, がくせい, いしゃ, てんいん…).
        </Text>
      </View>
      <View style={s.glossRow}>
        <View style={s.glossChip}><Text style={s.glossJp}>せんせい</Text><Text style={s.glossEs}>profesor/a</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>がくせい</Text><Text style={s.glossEs}>estudiante</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>いしゃ</Text><Text style={s.glossEs}>médico/a</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>てんいん</Text><Text style={s.glossEs}>dependiente</Text></View>
      </View>

      {/* 3. Cerramos la frase */}
      <View style={s.stepRow}>
        <View style={s.badge}><Text style={s.badgeTxt}>3</Text></View>
        <Text style={s.p}>
          Terminamos con <Text style={s.kbd}>です</Text> para hablar <Text style={s.bold}>amable</Text>.{"\n"}
          Si es <Text style={s.bold}>NO</Text>, usamos <Text style={s.kbd}>では ありません</Text>.{"\n"}
          Si es <Text style={s.bold}>pregunta</Text>, acabamos en <Text style={s.kbd}>ですか</Text>.
        </Text>
      </View>
      <View style={s.glossRow}>
        <View style={s.glossChip}><Text style={s.glossJp}>です</Text><Text style={s.glossEs}>es/soy (amable)</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>では ありません</Text><Text style={s.glossEs}>no es</Text></View>
        <View style={s.glossChip}><Text style={s.glossJp}>ですか</Text><Text style={s.glossEs}>es? (¿...?)</Text></View>
      </View>

      {/* Ejemplos auditivos con glosa */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <ToggleBtn icon="text" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji(v => !v)} />
        <ToggleBtn icon="language" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
      </View>

      <View style={{ marginTop: 8, gap: 10 }}>
        {EX.map((e, i) => (
          <View key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.line}>{e.ja}</Text>
              <IconBtn onPress={() => speakJA(e.ja)} />
            </View>
            {showRomaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
            {showES ? <Text style={s.es}>{e.es}</Text> : null}
            {/* glosa tipo fichas */}
            <View style={s.glossRow}>
              {e.gloss.map(([jp, es], k) => (
                <View key={k} style={s.glossChip}>
                  <Text style={s.glossJp}>{jp}</Text>
                  <Text style={s.glossEs}>{es}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text style={s.note}>
        Tip: en japonés muchas veces <Text style={s.bold}>omitimos</Text> el sujeto si ya se entiende.
        Con <Text style={s.kbd}>は</Text> presentamos el tema; con <Text style={s.kbd}>です</Text> afirmamos de forma amable.{"\n"}
        Para negar: <Text style={s.kbd}>では ありません</Text>. Para preguntar: <Text style={s.kbd}>ですか</Text>.
      </Text>
    </View>
  );
}

/* ====== Cards / UI ====== */
function PreviewCard({ job, onSpeak }: { job: Job; onSpeak: () => void }) {
  return (
    <View style={s.smallCard}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={s.emoji}>{job.emoji ?? "💼"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{job.es}</Text>
          <Text style={s.cardJP}>{job.jp}（{job.kana}）</Text>
        </View>
        <Pressable onPress={onSpeak} style={btn.iconBtn}>
          <Ionicons name="volume-high-outline" size={16} color={CRIMSON} />
        </Pressable>
      </View>
    </View>
  );
}

function BigBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={s.bigBtn}>
        <Ionicons name={icon} size={20} color={CRIMSON} />
        <Text style={s.bigBtnTxt}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ====== Helpers UI ====== */
function ToggleBtn({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagTxt}>{label}</Text>
    </View>
  );
}

/** Sakura background (ligero) */
function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () => Array.from({ length: count }).map((_, i) => {
      const size = 8 + Math.round(Math.random() * 10);
      const x = Math.round(Math.random() * (width - size));
      const delay = Math.round(Math.random() * 2500);
      const rotStart = Math.random() * 360;
      const duration = 6000 + Math.round(Math.random() * 2000);
      return { id: i, size, x, delay, rotStart, duration };
    }),
    [count, width],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map(p => (<Petal key={p.id} {...p} H={height} />))}
    </View>
  );
}

function Petal({ size, x, delay, rotStart, duration, H }:{
  size: number; x: number; delay: number; rotStart: number; duration: number; H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true })
        .start(() => { if (!alive) return; setTimeout(fall, Math.random() * 1000); });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const start = setTimeout(() => { fall(); rotLoop.start(); swayLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, sway, y]);

  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });

  return (
    <Animated.View style={[s.petal, { width: size, height: size * 1.4, borderRadius: size, transform: [{ translateX }, { translateY: y }, { rotate }] }]} />
  );
}

/* ====== Estilos ====== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

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
  row: { flexDirection: "row", gap: 10, marginTop: 12 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 12, overflow: "hidden", padding: 16 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },
  note: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  grid: { marginTop: 10, gap: 10 },

  bigBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  bigBtnTxt: { color: CRIMSON, fontWeight: "900" },

  cardTitle: { fontSize: 15, fontWeight: "800", color: INK },
  cardJP: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
  emoji: { fontSize: 18 },

  /* Tag */
  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },

  /* Mini-guía extra */
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  badge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  badgeTxt: { color: CRIMSON, fontWeight: "900" },

  glossRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  glossChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  glossJp: { fontWeight: "900", color: INK },
  glossEs: { color: "#6B7280" },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});
