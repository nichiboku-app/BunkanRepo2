// /src/screens/N5/B3_ProfesionesScreen/ProfesionesFlashcards.tsx
import * as Speech from "expo-speech";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

/* =========================================================
   ✅ Sin assets locales: usa TTS (expo-speech) + íconos emoji
   🔤 Solo HIRAGANA/KATAKANA (sin kanji)
   ========================================================= */

type Profesion = {
  id: string;
  es: string;
  jp: string; // solo hira/kata
  romaji: string;
  sentenceJP: string; // solo hira/kata
  sentenceES: string;
  emoji: string;
};

const P: Profesion[] = [
  { id: "sensei", es: "Maestro/a", jp: "せんせい", romaji: "sensei", sentenceJP: "わたしは せんせい です。", sentenceES: "Yo soy maestro/a.", emoji: "🎓" },
  { id: "isha", es: "Doctor/a", jp: "いしゃ", romaji: "isha", sentenceJP: "かれは いしゃ です。", sentenceES: "Él es doctor.", emoji: "🩺" },
  { id: "kangoshi", es: "Enfermero/a", jp: "かんごし", romaji: "kangoshi", sentenceJP: "あのひとは かんごし です。", sentenceES: "Esa persona es enfermera.", emoji: "🏥" },
  { id: "keisatsukan", es: "Policía", jp: "けいさつかん", romaji: "keisatsukan", sentenceJP: "おとうとは けいさつかん です。", sentenceES: "Mi hermano menor es policía.", emoji: "🚓" },
  { id: "shouboushi", es: "Bombero", jp: "しょうぼうし", romaji: "shouboushi", sentenceJP: "かれは しょうぼうし です。", sentenceES: "Él es bombero.", emoji: "🚒" },
  { id: "shefu", es: "Chef", jp: "シェフ", romaji: "shefu", sentenceJP: "かのじょは シェフ です。", sentenceES: "Ella es chef.", emoji: "👩‍🍳" },
  { id: "ryourinin", es: "Cocinero/a", jp: "りょうりにん", romaji: "ryourinin", sentenceJP: "いとこは りょうりにん です。", sentenceES: "Mi primo es cocinero.", emoji: "🍳" },
  { id: "puroguramaa", es: "Programador/a", jp: "プログラマー", romaji: "puroguramaa", sentenceJP: "わたしは プログラマー です。", sentenceES: "Yo soy programador/a.", emoji: "💻" },
  { id: "enjiniyaa", es: "Ingeniero/a", jp: "エンジニア", romaji: "enjiniyaa", sentenceJP: "かれは エンジニア です。", sentenceES: "Él es ingeniero.", emoji: "🛠️" },
  { id: "bengoshi", es: "Abogado/a", jp: "べんごし", romaji: "bengoshi", sentenceJP: "かのじょは べんごし です。", sentenceES: "Ella es abogada.", emoji: "⚖️" },
  { id: "saibankan", es: "Juez", jp: "さいばんかん", romaji: "saibankan", sentenceJP: "おじは さいばんかん です。", sentenceES: "Mi tío es juez.", emoji: "🧑‍⚖️" },
  { id: "kenchikuka", es: "Arquitecto/a", jp: "けんちくか", romaji: "kenchikuka", sentenceJP: "あねは けんちくか です。", sentenceES: "Mi hermana mayor es arquitecta.", emoji: "🏗️" },
  { id: "geijutsuka", es: "Artista", jp: "げいじゅつか", romaji: "geijutsuka", sentenceJP: "かれは げいじゅつか です。", sentenceES: "Él es artista.", emoji: "🎨" },
  { id: "ongakuka", es: "Músico/a", jp: "おんがくか", romaji: "ongakuka", sentenceJP: "かのじょは おんがくか です。", sentenceES: "Ella es música.", emoji: "🎼" },
  { id: "untenshu", es: "Conductor/a", jp: "うんてんしゅ", romaji: "untenshu", sentenceJP: "ちちは バスの うんてんしゅ です。", sentenceES: "Mi papá es conductor de autobús.", emoji: "🚌" },
  { id: "pairotto", es: "Piloto", jp: "パイロット", romaji: "pairotto", sentenceJP: "かれは パイロット です。", sentenceES: "Él es piloto.", emoji: "✈️" },
  { id: "ueitaa", es: "Mesero/a", jp: "ウエイター", romaji: "ueitaa", sentenceJP: "レストランで ウエイター です。", sentenceES: "Trabajo como mesero en un restaurante.", emoji: "🍽️" },
  { id: "kaishain", es: "Empleado/a de empresa", jp: "かいしゃいん", romaji: "kaishain", sentenceJP: "あには かいしゃいん です。", sentenceES: "Mi hermano mayor es empleado de empresa.", emoji: "🏢" },
  { id: "kagakusha", es: "Científico/a", jp: "かがくしゃ", romaji: "kagakusha", sentenceJP: "かれは かがくしゃ です。", sentenceES: "Él es científico.", emoji: "🔬" },
  { id: "keieisha", es: "Empresario/a, gerente", jp: "けいえいしゃ", romaji: "keieisha", sentenceJP: "かのじょは けいえいしゃ です。", sentenceES: "Ella es empresaria.", emoji: "👔" },
];

/* ===================== TTS helpers ===================== */
const pickJaVoice = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const ja = voices.find((v) => v.language?.startsWith("ja"));
    return ja?.identifier;
  } catch {
    return undefined;
  }
};

const speakJP = async (jp: string, fallbackRomaji?: string) => {
  const voice = await pickJaVoice();
  if (voice) {
    Speech.speak(jp, { language: "ja-JP", voice, rate: 0.95 });
  } else {
    Speech.speak(fallbackRomaji || jp, { language: "en-US", rate: 0.95 });
  }
};

/* ======================= UI bits ======================= */
function SakuraBadge() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48">
      <G>
        <Circle cx={24} cy={24} r={22} fill="#fcf7eb" stroke="#e7dfc6" />
        <Path
          d="M24 8c-1.9 2.8-3.2 4.7-3.2 6.4-1.7 0-3.6 1.4-3.6 3.6 0 2.4 2 4 4.2 4.1.2 1.9 1.2 3.9 2.6 5.2 1.4-1.3 2.4-3.3 2.6-5.2 2.2-.1 4.2-1.7 4.2-4.1 0-2.2-1.9-3.6-3.6-3.6 0-1.7-1.3-3.6-3.2-6.4z"
          fill="#d66b7b"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}

function EmojiIcon({ emoji }: { emoji: string }) {
  return (
    <View style={styles.emojiWrap}>
      <SakuraBadge />
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
      <Text style={styles.btnTxt}>{label}</Text>
    </Pressable>
  );
}

function ProfCard({ item }: { item: Profesion }) {
  const [revealed, setRevealed] = useState(false);

  const onWord = useCallback(() => {
    speakJP(item.jp, item.romaji);
  }, [item.jp, item.romaji]);

  const onSentence = useCallback(() => {
    speakJP(item.sentenceJP, item.romaji);
  }, [item.sentenceJP, item.romaji]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <EmojiIcon emoji={item.emoji} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.es}>{item.es}</Text>
          </View>
          <Text style={styles.jp}>{revealed ? item.jp : "···"}</Text>
          <Text style={styles.romaji}>{revealed ? item.romaji : ""}</Text>
          <View style={styles.actions}>
            <ActionButton label="🔊 Palabra" onPress={onWord} />
            <ActionButton label="🎧 Oración" onPress={onSentence} />
            <Pressable
              onPress={() => setRevealed((v) => !v)}
              style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}
            >
              <Text style={styles.btnGhostTxt}>{revealed ? "Ocultar JP" : "Mostrar JP"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.sentenceBox}>
        <Text style={styles.sentenceJP}>{item.sentenceJP}</Text>
        <Text style={styles.sentenceES}>{item.sentenceES}</Text>
      </View>
    </View>
  );
}

export default function ProfesionesFlashcards() {
  const total = useMemo(() => P.length, []);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>たーじゃ しょくぎょう · Tarjetas ilustradas</Text>
      <Text style={styles.subtitle}>{total} profesiones con audio TTS y oraciones (ひらがな・カタカナ)</Text>
      <View style={styles.grid}>
        {P.map((item) => (
          <ProfCard key={item.id} item={item} />
        ))}
      </View>
      <Text style={styles.footerTip}>Consejo: si no escuchas japonés, instala la voz "Japanese" en tu dispositivo.</Text>
    </ScrollView>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5dc",
    padding: 16,
    paddingBottom: 28,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#2f2a22" },
  subtitle: { marginTop: 4, marginBottom: 12, opacity: 0.75, color: "#6c6556" },
  grid: { gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e7dfc6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    padding: 14,
  },
  row: { flexDirection: "row" },
  emojiWrap: { width: 64, height: 64, marginRight: 12, alignItems: "center", justifyContent: "center" },
  emoji: { position: "absolute", fontSize: 28 },

  info: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  es: { fontSize: 18, fontWeight: "800", color: "#2f2a22" },
  jp: { fontSize: 20, marginTop: 4, color: "#2e2a23" },
  romaji: { fontSize: 12, color: "#857d6a", marginTop: 2 },

  actions: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  btn: {
    backgroundColor: "#fff",
    borderColor: "#e7dfc6",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnPressed: { opacity: 0.85 },
  btnTxt: { fontWeight: "700", color: "#2f2a22" },

  btnGhost: {
    backgroundColor: "#f7f2e3",
    borderColor: "#e7dfc6",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnGhostPressed: { opacity: 0.85 },
  btnGhostTxt: { fontWeight: "700", color: "#6c6556" },

  sentenceBox: {
    marginTop: 10,
    backgroundColor: "#fcfaf4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efe6cc",
    padding: 10,
  },
  sentenceJP: { fontSize: 16, color: "#2e2a23" },
  sentenceES: { fontSize: 12, color: "#7b7464", marginTop: 4 },
  footerTip: { textAlign: "center", color: "#746c5a", marginTop: 14 },
});
