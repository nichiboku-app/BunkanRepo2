import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ========== DATA (solo hiragana/katakana) ========== */
type Item = { id: string; es: string; jp: string; emoji: string };

const DATA: Item[] = [
  { id: "sensei", es: "Maestro/a", jp: "せんせい", emoji: "🎓" },
  { id: "isha", es: "Doctor/a", jp: "いしゃ", emoji: "🩺" },
  { id: "kangoshi", es: "Enfermero/a", jp: "かんごし", emoji: "🏥" },
  { id: "keisatsukan", es: "Policía", jp: "けいさつかん", emoji: "🚓" },
  { id: "shouboushi", es: "Bombero", jp: "しょうぼうし", emoji: "🚒" },
  { id: "shefu", es: "Chef", jp: "シェフ", emoji: "👩‍🍳" },
  { id: "puroguramaa", es: "Programador/a", jp: "プログラマー", emoji: "💻" },
  { id: "enjiniyaa", es: "Ingeniero/a", jp: "エンジニア", emoji: "🛠️" },
  { id: "bengoshi", es: "Abogado/a", jp: "べんごし", emoji: "⚖️" },
  { id: "kenchikuka", es: "Arquitecto/a", jp: "けんちくか", emoji: "🏗️" },
  { id: "ongakuka", es: "Músico/a", jp: "おんがくか", emoji: "🎼" },
  { id: "kaishain", es: "Empleado/a", jp: "かいしゃいん", emoji: "🏢" },
];

/* ========== utils ========== */
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Question = { target: Item; options: Item[] };

function makeQuestion(pool: Item[], used: Set<string>): Question {
  let remaining = pool.filter((i) => !used.has(i.id));
  if (remaining.length === 0) { used.clear(); remaining = [...pool]; }
  const target = remaining[Math.floor(Math.random() * remaining.length)];
  used.add(target.id);
  const distract = shuffle(pool.filter((i) => i.id !== target.id)).slice(0, 2);
  return { target, options: shuffle([target, ...distract]) };
}

/* ========== Temas (和紙 / 夜) ========== */
const themeLight = {
  bg: "#faf6ef",
  text: "#2f2a22",
  sub: "#6c6556",
  line: "#e7dfc6",
  card: "#ffffff",
  pill: "#ffffff",
  rightBg: "#e7f6e9",
  rightLine: "#7fd38d",
  wrongBg: "#fde9ea",
  wrongLine: "#f19aa2",
  primary: "#e84b3c",
};
const themeDark = {
  bg: "#0f1014",
  text: "#f5efe5",
  sub: "#c9c1b3",
  line: "#2a2b33",
  card: "#171821",
  pill: "#1c1d27",
  rightBg: "#123222",
  rightLine: "#3bbb7d",
  wrongBg: "#3b1b23",
  wrongLine: "#ff7d8f",
  primary: "#ff625f",
};
type Theme = typeof themeLight;

/* ========== Componente ========== */
export default function ProfesionesDictado() {
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const pool = useMemo(() => DATA, []);
  const usedIds = useRef<Set<string>>(new Set());

  const [q, setQ] = useState<Question>(() => makeQuestion(pool, usedIds.current));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const TOTAL = 10;

  const [night, setNight] = useState(false);
  const T: Theme = night ? themeDark : themeLight;

  // TTS
  const stopTTS = useCallback(() => Speech.stop(), []);
  useEffect(() => () => { stopTTS(); }, [stopTTS]);

  const speakWord = useCallback((slow = false) => {
    stopTTS();
    Speech.speak(q.target.jp, { language: "ja-JP", rate: slow ? 0.75 : 1.0, pitch: 1.0 });
  }, [q.target.jp, stopTTS]);

  const speakPhrase = useCallback((slow = false) => {
    stopTTS();
    Speech.speak(`わたしは ${q.target.jp} です。`, { language: "ja-JP", rate: slow ? 0.8 : 1.0, pitch: 1.0 });
  }, [q.target.jp, stopTTS]);

  const check = useCallback(async (id: string) => {
    if (selectedId) return;
    const ok = id === q.target.id;
    setSelectedId(id);
    if (ok) {
      setScore((s) => s + 1);
      playCorrect();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      playWrong();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [q.target.id, selectedId, playCorrect, playWrong]);

  const next = useCallback(() => {
    stopTTS();
    setSelectedId(null);
    setQ(makeQuestion(pool, usedIds.current));
    setRound((r) => r + 1);
  }, [pool, stopTTS]);

  // Progreso
  const progress = Math.min(round - 1, TOTAL) / TOTAL;

  return (
    <View style={[styles.flex1, { backgroundColor: T.bg }]}>
      {/* Sakura detrás de todo */}
      <SakuraLayer night={night} />

      {/* Header SIN absolute, el gradiente envuelve el contenido */}
      <LinearGradient
        colors={night ? ["#14151d", "#1b1c26"] : ["#fff5f0", "#fde3de"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.kouhaku}>
          <View style={[styles.kouhakuRed, { backgroundColor: T.primary }]} />
          <View style={styles.kouhakuWhite} />
        </View>

        <Text style={[styles.title, { color: T.text }]}>Dictado visual</Text>
        <Text style={[styles.subtitle, { color: T.sub }]}>しょくぎょう · ききとり</Text>
        <Text style={[styles.note, { color: T.sub }]}>
          Pulsa ▶️ para escuchar y elige la opción correcta.
        </Text>

        <View style={[styles.progressRail, { backgroundColor: night ? "#222433" : "#efe6d4" }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: T.primary }]} />
        </View>

        <Pressable
          onPress={() => setNight((v) => !v)}
          style={({ pressed }) => [
            styles.nightPill,
            { backgroundColor: T.pill, borderColor: T.line },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: T.text }}>
            {night ? "☀️ 昼モード" : "🌙 夜モード"}
          </Text>
        </Pressable>
      </LinearGradient>

      {/* Contenido */}
      <ScrollView style={styles.flex1} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.controls}>
          <Pill label="▶️ ことば" onPress={() => speakWord(false)} T={T} />
          <Pill label="🐢 おそい" onPress={() => speakWord(true)}  T={T} />
          <Pill label="🗣️ フレーズ" onPress={() => speakPhrase(false)} T={T} />
        </View>
        {!ready && (
          <Text style={[styles.smallNote, { color: T.sub }]}>
            Cargando sonidos… si no escuchas japonés, instala la voz “Japanese”.
          </Text>
        )}

        <View style={styles.optionsCol}>
          {q.options.map((opt) => (
            <OptionCard
              key={opt.id}
              opt={opt}
              correctId={q.target.id}
              disabled={!!selectedId}
              selected={selectedId === opt.id}
              onPress={() => check(opt.id)}
              phrase={`わたしは ${q.target.jp} です`}
              T={T}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={{ color: T.sub }}>Ronda {round} · Puntaje {score}</Text>
          <Pressable
            onPress={next}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: T.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.primaryTxt}>{selectedId ? "つぎへ ▶" : "スキップ ▶"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ====== Subcomponentes ====== */

function Pill({ label, onPress, T }: { label: string; onPress: () => void; T: Theme }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: T.pill, borderColor: T.line },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.pillTxt, { color: T.text }]}>{label}</Text>
    </Pressable>
  );
}

function OptionCard({
  opt, correctId, selected, disabled, onPress, phrase, T,
}: {
  opt: Item; correctId: string; selected: boolean; disabled: boolean;
  onPress: () => void; phrase: string; T: Theme;
}) {
  const isRight = selected && opt.id === correctId;
  const isWrong = selected && opt.id !== correctId;

  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <View
        style={[
          styles.card,
          { backgroundColor: T.card, borderColor: T.line, shadowOpacity: 0.06 },
          isRight && { backgroundColor: T.rightBg, borderColor: T.rightLine },
          isWrong && { backgroundColor: T.wrongBg, borderColor: T.wrongLine },
        ]}
      >
        <View style={styles.cardRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: T.bg, borderColor: T.line },
              isRight && { backgroundColor: T.rightBg, borderColor: T.rightLine },
              isWrong && { backgroundColor: T.wrongBg, borderColor: T.wrongLine },
            ]}
          >
            <Text style={styles.badgeEmoji}>{opt.emoji}</Text>
          </View>
          <View style={styles.cardTextCol}>
            <Text style={[styles.cardTitle, { color: T.text }]}>{opt.es}</Text>
            {selected && (
              <Text style={[styles.cardSub, { color: T.sub }]}>
                {isRight ? `${phrase} ✅` : `✖︎ もういちど`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* Pétalos de sakura animados (detrás del contenido) */
function SakuraLayer({ night }: { night: boolean }) {
  const [h, setH] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);
  const petals = useMemo(() => Array.from({ length: 8 }).map((_, i) => i), []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: -1 }]} onLayout={onLayout}>
      {petals.map((i) => <FallingPetal key={i} index={i} height={h} night={night} />)}
    </View>
  );
}

function FallingPetal({ index, height, night }: { index: number; height: number; night: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const delay = 400 * index + (index % 3) * 250;
  const dur = 7000 + (index % 5) * 900;
  const startX = (index * 37) % 320;
  const drift = (index % 2 === 0 ? 1 : -1) * (8 + (index % 7) * 2);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true, delay }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      { iterations: -1 }
    );
    loop.start();
    return () => loop.stop();
  }, [progress, dur, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, Math.max(200, height) + 40],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + drift, startX - drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${index % 2 === 0 ? 180 : -180}deg`],
  });
  const opacity = night ? 0.06 : 0.08;

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top: 0, left: 0,
        transform: [{ translateX }, { translateY }, { rotate }],
        opacity,
        fontSize: 48,
      }}
    >
      🌸
    </Animated.Text>
  );
}

/* ========== estilos ========== */
const styles = StyleSheet.create({
  flex1: { flex: 1 },

  /* Header con gradiente envolvente (sin absolute) */
  hero: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  kouhaku: { flexDirection: "row", alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, marginBottom: 10 },
  kouhakuRed: { width: 24, height: 6, backgroundColor: "#e84b3c" },
  kouhakuWhite: { width: 24, height: 6, backgroundColor: "#fff" },

  title: { fontSize: 24, fontWeight: "800", marginBottom: 2 },
  subtitle: { letterSpacing: 1, marginBottom: 6 },
  note: { marginBottom: 10 },

  progressRail: { height: 8, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },

  nightPill: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },

  /* Contenido */
  content: { padding: 16, paddingBottom: 36, gap: 12 },

  /* Pills */
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillTxt: { fontWeight: "800" },

  /* Opciones */
  optionsCol: { gap: 10, marginTop: 4 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  badgeEmoji: { fontSize: 30 },
  cardTextCol: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  cardSub: { marginTop: 6 },

  /* Footer */
  footer: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primary: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryTxt: { color: "#fff", fontWeight: "900" },

  /* Notas */
  smallNote: { marginTop: 2, fontSize: 12 },
});
