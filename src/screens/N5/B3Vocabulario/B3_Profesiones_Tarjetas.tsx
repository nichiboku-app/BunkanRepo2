// src/screens/N5/B3Vocabulario/B3_Profesiones_Tarjetas.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type CardItem = {
  key: string;
  jp: string;
  kana: string;
  ro: string;
  es: string;
  emoji?: string;
};

const CARDS: CardItem[] = [
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

const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}

export default function B3_Profesiones_Tarjetas() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={s.header}>
          <Text style={s.kicker}>Tarjetas animadas</Text>
          <Text style={s.title}>職業（しょくぎょう）— Profesiones</Text>
          <Text style={s.jpSub}>Toca una tarjeta para escuchar la pronunciación.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Toggle icon="text-outline" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji(v => !v)} />
            <Toggle icon="translate-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
          </View>
        </View>

        {CARDS.map((c) => (<FlipCard key={c.key} item={c} showRomaji={showRomaji} showES={showES} />))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

/* ====== Flip Card ====== */
function FlipCard({ item, showRomaji, showES }:{
  item: CardItem; showRomaji: boolean; showES: boolean;
}) {
  const rotate = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    Animated.timing(rotate, { toValue: flipped ? 0 : 1, duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
      setFlipped(!flipped);
      if (!flipped) speakJA(item.kana);
    });
  };

  const frontInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <View style={{ height: 120 }}>
      {/* Front */}
      <Animated.View style={[s.card, s.cardAbs, { transform: [{ rotateY: frontInterpolate }] }]}>
        <Pressable onPress={flip} style={s.cardInner}>
          <Text style={s.emoji}>{item.emoji ?? "💼"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cardJP}>{item.jp}（{item.kana}）</Text>
            {showRomaji ? <Text style={s.romaji}>{item.ro}</Text> : null}
            {showES ? <Text style={s.es}>{item.es}</Text> : null}
          </View>
          <Ionicons name="swap-horizontal" size={18} color={CRIMSON} />
        </Pressable>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[s.card, s.cardAbs, { transform: [{ rotateY: backInterpolate }] }]}>
        <Pressable onPress={flip} style={[s.cardInner, { justifyContent: "center" }]}>
          <Text style={[s.cardJP, { fontWeight: "900" }]}>わたし は {item.kana} です。</Text>
          <Text style={s.es}>“Yo soy {item.es.toLowerCase()}.”</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <IconBtn onPress={() => speakJA(`わたし は ${item.kana} です。`)} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* ====== UI helpers ====== */
function Toggle({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={s.toggle}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={s.toggleTxt}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

/* ====== Estilos ====== */
const s = StyleSheet.create({
  header: {
    backgroundColor: "#fffdf7", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  cardAbs: { position: "absolute", top: 0, left: 0, right: 0, height: "100%", backfaceVisibility: "hidden" as any },
  cardInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, height: "100%" },

  cardJP: { fontSize: 16, color: INK },
  romaji: { fontSize: 12, color: "#374151", marginTop: 2 },
  es: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  toggle: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  toggleTxt: { color: CRIMSON, fontWeight: "900" },

  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  emoji: { fontSize: 20 },
});
