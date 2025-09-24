// src/screens/Katakana/KatakanaRow.tsx
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";

/* ===================== Navegación / datos ===================== */
type RowKey = "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W";
type Params = { row: RowKey };
type Route = RouteProp<Record<"KatakanaRow", Params>, "KatakanaRow">;

type KanaItem = { kana: string; romaji: string };

const ROW_MAP: Record<RowKey, KanaItem[]> = {
  A: [
    { kana: "ア", romaji: "a" },
    { kana: "イ", romaji: "i" },
    { kana: "ウ", romaji: "u" },
    { kana: "エ", romaji: "e" },
    { kana: "オ", romaji: "o" },
  ],
  K: [
    { kana: "カ", romaji: "ka" },
    { kana: "キ", romaji: "ki" },
    { kana: "ク", romaji: "ku" },
    { kana: "ケ", romaji: "ke" },
    { kana: "コ", romaji: "ko" },
  ],
  S: [
    { kana: "サ", romaji: "sa" },
    { kana: "シ", romaji: "shi" },
    { kana: "ス", romaji: "su" },
    { kana: "セ", romaji: "se" },
    { kana: "ソ", romaji: "so" },
  ],
  T: [
    { kana: "タ", romaji: "ta" },
    { kana: "チ", romaji: "chi" },
    { kana: "ツ", romaji: "tsu" },
    { kana: "テ", romaji: "te" },
    { kana: "ト", romaji: "to" },
  ],
  N: [
    { kana: "ナ", romaji: "na" },
    { kana: "ニ", romaji: "ni" },
    { kana: "ヌ", romaji: "nu" },
    { kana: "ネ", romaji: "ne" },
    { kana: "ノ", romaji: "no" },
  ],
  H: [
    { kana: "ハ", romaji: "ha" },
    { kana: "ヒ", romaji: "hi" },
    { kana: "フ", romaji: "fu" },
    { kana: "ヘ", romaji: "he" },
    { kana: "ホ", romaji: "ho" },
  ],
  M: [
    { kana: "マ", romaji: "ma" },
    { kana: "ミ", romaji: "mi" },
    { kana: "ム", romaji: "mu" },
    { kana: "メ", romaji: "me" },
    { kana: "モ", romaji: "mo" },
  ],
  Y: [
    { kana: "ヤ", romaji: "ya" },
    { kana: "ユ", romaji: "yu" },
    { kana: "ヨ", romaji: "yo" },
  ],
  R: [
    { kana: "ラ", romaji: "ra" },
    { kana: "リ", romaji: "ri" },
    { kana: "ル", romaji: "ru" },
    { kana: "レ", romaji: "re" },
    { kana: "ロ", romaji: "ro" },
  ],
  W: [
    { kana: "ワ", romaji: "wa" },
    { kana: "ヲ", romaji: "wo" },
    { kana: "ン", romaji: "n" },
  ],
};

/* ===================== Audios (mp3 locales, requires estáticos) ===================== */
const AUDIO_BY_ROMAJI: Record<string, any> = {
  a: require("../../../assets/audio/katakana/a.mp3"),
  i: require("../../../assets/audio/katakana/i.mp3"),
  u: require("../../../assets/audio/katakana/u.mp3"),
  e: require("../../../assets/audio/katakana/e.mp3"),
  o: require("../../../assets/audio/katakana/o.mp3"),
  ka: require("../../../assets/audio/katakana/ka.mp3"),
  ki: require("../../../assets/audio/katakana/ki.mp3"),
  ku: require("../../../assets/audio/katakana/ku.mp3"),
  ke: require("../../../assets/audio/katakana/ke.mp3"),
  ko: require("../../../assets/audio/katakana/ko.mp3"),
  sa: require("../../../assets/audio/katakana/sa.mp3"),
  shi: require("../../../assets/audio/katakana/shi.mp3"),
  su: require("../../../assets/audio/katakana/su.mp3"),
  se: require("../../../assets/audio/katakana/se.mp3"),
  so: require("../../../assets/audio/katakana/so.mp3"),
  ta: require("../../../assets/audio/katakana/ta.mp3"),
  chi: require("../../../assets/audio/katakana/chi.mp3"),
  tsu: require("../../../assets/audio/katakana/tsu.mp3"),
  te: require("../../../assets/audio/katakana/te.mp3"),
  to: require("../../../assets/audio/katakana/to.mp3"),
  na: require("../../../assets/audio/katakana/na.mp3"),
  ni: require("../../../assets/audio/katakana/ni.mp3"),
  nu: require("../../../assets/audio/katakana/nu.mp3"),
  ne: require("../../../assets/audio/katakana/ne.mp3"),
  no: require("../../../assets/audio/katakana/no.mp3"),
  ha: require("../../../assets/audio/katakana/ha.mp3"),
  hi: require("../../../assets/audio/katakana/hi.mp3"),
  fu: require("../../../assets/audio/katakana/fu.mp3"),
  he: require("../../../assets/audio/katakana/he.mp3"),
  ho: require("../../../assets/audio/katakana/ho.mp3"),
  ma: require("../../../assets/audio/katakana/ma.mp3"),
  mi: require("../../../assets/audio/katakana/mi.mp3"),
  mu: require("../../../assets/audio/katakana/mu.mp3"),
  me: require("../../../assets/audio/katakana/me.mp3"),
  mo: require("../../../assets/audio/katakana/mo.mp3"),
  ya: require("../../../assets/audio/katakana/ya.mp3"),
  yu: require("../../../assets/audio/katakana/yu.mp3"),
  yo: require("../../../assets/audio/katakana/yo.mp3"),
  ra: require("../../../assets/audio/katakana/ra.mp3"),
  ri: require("../../../assets/audio/katakana/ri.mp3"),
  ru: require("../../../assets/audio/katakana/ru.mp3"),
  re: require("../../../assets/audio/katakana/re.mp3"),
  ro: require("../../../assets/audio/katakana/ro.mp3"),
  wa: require("../../../assets/audio/katakana/wa.mp3"),
  wo: require("../../../assets/audio/katakana/wo.mp3"),
  n: require("../../../assets/audio/katakana/n.mp3"),
};

/* ===================== Audio perezoso (on-demand) ===================== */
async function ensurePlaybackMode() {
  await Audio.setIsEnabledAsync(true);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeAndroid: 1,
    interruptionModeIOS: 1,
  });
}

function useLazyAudio<T extends string>(bank: Record<T, any>) {
  const cacheRef = useRef(new Map<T, Audio.Sound>());
  const currentRef = useRef<Audio.Sound | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      (async () => {
        try { await currentRef.current?.unloadAsync(); } catch {}
        for (const s of cacheRef.current.values()) { try { await s.unloadAsync(); } catch {} }
        cacheRef.current.clear();
      })();
    };
  }, []);

  const playRomaji = useCallback(async (key: T) => {
    const mod = bank[key];
    if (!mod || busy) return;
    setBusy(true);
    try {
      await ensurePlaybackMode();

      let sound = cacheRef.current.get(key);
      if (!sound) {
        const asset = Asset.fromModule(mod);
        await asset.downloadAsync();
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: asset.localUri || asset.uri },
          { shouldPlay: false, volume: 1.0 }
        );
        cacheRef.current.set(key, s);
        sound = s;
      }

      if (currentRef.current && currentRef.current !== sound) {
        try { await currentRef.current.stopAsync(); } catch {}
      }
      currentRef.current = sound;

      await sound.setPositionAsync(0);
      await sound.playAsync();
    } finally {
      setTimeout(() => setBusy(false), 120);
    }
  }, [bank, busy]);

  return { busy, playRomaji };
}

/* ===================== Trazos: conteos y pistas ===================== */
type XY = { x: number; y: number };

/* Conteo de trazos (para fallback de números) */
const STROKE_COUNT: Record<string, number> = {
  // A
  "ア": 3, "イ": 2, "ウ": 3, "エ": 3, "オ": 3,
  // K
  "カ": 2, "キ": 3, "ク": 2, "ケ": 3, "コ": 2,
  // S
  "サ": 3, "シ": 3, "ス": 2, "セ": 3, "ソ": 2,
  // T
  "タ": 3, "チ": 3, "ツ": 3, "テ": 3, "ト": 2,
  // N
  "ナ": 2, "ニ": 2, "ヌ": 2, "ネ": 4, "ノ": 1,
  // H
  "ハ": 2, "ヒ": 2, "フ": 1, "ヘ": 1, "ホ": 4,
  // M
  "マ": 2, "ミ": 3, "ム": 2, "メ": 2, "モ": 3,
  // Y
  "ヤ": 2, "ユ": 2, "ヨ": 3,
  // R
  "ラ": 2, "リ": 2, "ル": 2, "レ": 1, "ロ": 3,
  // W + N
  "ワ": 2, "ヲ": 3, "ン": 2,
};

/* Pistas manuales (globos rojos) para varias letras.
   Si una letra no está aquí, generamos posiciones automáticamente. */
const HINTS: Record<string, XY[]> = {
  // Familia A (completa)
  "ア": [{ x: 0.34, y: 0.28 }, { x: 0.60, y: 0.28 }, { x: 0.52, y: 0.56 }],
  "イ": [{ x: 0.50, y: 0.24 }, { x: 0.58, y: 0.54 }],
  "ウ": [{ x: 0.52, y: 0.24 }, { x: 0.38, y: 0.46 }, { x: 0.62, y: 0.60 }],
  "エ": [{ x: 0.40, y: 0.30 }, { x: 0.58, y: 0.30 }, { x: 0.48, y: 0.56 }],
  "オ": [{ x: 0.44, y: 0.24 }, { x: 0.60, y: 0.24 }, { x: 0.50, y: 0.56 }],

  // Confusiones típicas
  "シ": [{ x: 0.38, y: 0.26 }, { x: 0.46, y: 0.40 }, { x: 0.54, y: 0.56 }],
  "ツ": [{ x: 0.44, y: 0.24 }, { x: 0.58, y: 0.24 }, { x: 0.66, y: 0.56 }],
  "ソ": [{ x: 0.46, y: 0.26 }, { x: 0.62, y: 0.56 }],
  "ン": [{ x: 0.46, y: 0.28 }, { x: 0.60, y: 0.60 }],
  "リ": [{ x: 0.46, y: 0.30 }, { x: 0.62, y: 0.52 }],
  "ル": [{ x: 0.46, y: 0.30 }, { x: 0.64, y: 0.62 }],
  "ロ": [{ x: 0.40, y: 0.26 }, { x: 0.66, y: 0.26 }, { x: 0.66, y: 0.62 }],
};

function autoHints(count: number): XY[] {
  if (count <= 0) return [];
  const pts: XY[] = [];
  const start = { x: 0.32, y: 0.28 };
  const end = { x: 0.68, y: 0.62 };
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    pts.push({ x: start.x * (1 - t) + end.x * t, y: start.y * (1 - t) + end.y * t });
  }
  return pts;
}

/* ===================== Frame estilo “antes” (amarillo + grid + globos) ===================== */
function TraceFrameKata({
  char,
  showGrid = true,
  showGuide = true,
  showNumbers = true,
  size = 320,
}: {
  char: string;
  showGrid?: boolean;
  showGuide?: boolean;
  showNumbers?: boolean;
  size?: number;
}) {
  const grid = [1, 2, 3].map((i) => (i * size) / 4);
  const fontSize = size * 0.62;
  const manual = HINTS[char] || [];
  const count = STROKE_COUNT[char] ?? manual.length;
  const hints = manual.length > 0 ? manual : autoHints(count);
  const showHints = showGuide && showNumbers && hints.length > 0;

  return (
    <View style={styles.frameWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Fondo y borde */}
        <Rect x={0} y={0} width={size} height={size} rx={16} fill="#FFF6C2" stroke="#EAD48A" strokeWidth={2} />
        {/* Cuadrícula */}
        {showGrid && (
          <>
            {grid.map((p, i) => (
              <G key={`g-${i}`}>
                <Line x1={p} y1={0} x2={p} y2={size} stroke="#E6D37B" strokeWidth={1} />
                <Line x1={0} y1={p} x2={size} y2={p} stroke="#E6D37B" strokeWidth={1} />
              </G>
            ))}
            <Line x1={size / 2} y1={10} x2={size / 2} y2={size - 10} stroke="#E0B94A" strokeDasharray="6 8" strokeWidth={2} />
            <Line x1={10} y1={size / 2} x2={size - 10} y2={size / 2} stroke="#E0B94A" strokeDasharray="6 8" strokeWidth={2} />
          </>
        )}
        {/* Glyph exacto como guía */}
        {showGuide && (
          <SvgText
            x={size / 2}
            y={size / 2 + fontSize * 0.03}
            fontSize={fontSize}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#6B7280"
            opacity={0.26}
            stroke="#111827"
            strokeWidth={1.5}
          >
            {char}
          </SvgText>
        )}
        {/* Globos con números */}
        {showHints &&
          hints.map((h, i) => (
            <G key={`hint-${i}`} opacity={0.96}>
              <Circle cx={h.x * size} cy={h.y * size} r={12} fill="#B32133" />
              <SvgText
                x={h.x * size}
                y={h.y * size + 1}
                fontSize={12}
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {i + 1}
              </SvgText>
            </G>
          ))}
      </Svg>
      <Text style={{ textAlign: "center", marginTop: 6, fontWeight: "800", color: "#111827" }}>
        {count ? `${count} trazos` : "Trazos"}
      </Text>
    </View>
  );
}

/* ===================== Pantalla (diseño anterior) ===================== */
export default function KatakanaRow() {
  const route = useRoute<Route>();
  const rowKey = route.params?.row ?? "A";
  const data = useMemo(() => ROW_MAP[rowKey] ?? [], [rowKey]);

  const [index, setIndex] = useState(0);
  const [showNums, setShowNums] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const current = data[index];

  // Audio on-demand
  const { busy: isAudioBusy, playRomaji } = useLazyAudio(AUDIO_BY_ROMAJI);
  const hasAudio = !!AUDIO_BY_ROMAJI[current.romaji];
  const hasHints = !!(HINTS[current.kana] || STROKE_COUNT[current.kana]);

  const goPrev = () => index > 0 && setIndex(index - 1);
  const goNext = () => index < data.length - 1 && setIndex(index + 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Katakana — {rowKey} 行</Text>
        <Text style={styles.subtitle}>
          Marco amarillo con cuadrícula y globos rojos del orden de trazos.
        </Text>
      </View>

      {/* Navegación */}
      <View style={styles.navRow}>
        <Pressable onPress={goPrev} disabled={index === 0} style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}>
          <Ionicons name="chevron-back" size={20} />
          <Text style={styles.navTxt}>Anterior</Text>
        </Pressable>

        <View style={styles.kanaPill}>
          <Text style={styles.kana}>{current.kana}</Text>
          <Text style={styles.roma}>{current.romaji}</Text>
        </View>

        <Pressable onPress={goNext} disabled={index === data.length - 1} style={[styles.navBtn, index === data.length - 1 && styles.navBtnDisabled]}>
          <Text style={styles.navTxt}>Siguiente</Text>
          <Ionicons name="chevron-forward" size={20} />
        </Pressable>
      </View>

      {/* Cómo se escribe */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="create" size={18} />
          <Text style={styles.h}>Cómo se escribe</Text>
        </View>

        <TraceFrameKata char={current.kana} showNumbers={showNums} size={320} />

        <View style={styles.row}>
          <Pressable style={styles.btnSecondary} onPress={() => setShowNums((v) => !v)} disabled={!hasHints}>
            <Ionicons name="grid" size={16} />
            <Text style={[styles.btnSecondaryTxt, !hasHints && { opacity: 0.5 }]}>
              {showNums ? "Ocultar números" : "Mostrar números"}
            </Text>
          </Pressable>

          <Pressable style={styles.btnSecondary} onPress={() => setModalOpen(true)}>
            <Ionicons name="expand" size={16} />
            <Text style={styles.btnSecondaryTxt}>Ampliar</Text>
          </Pressable>
        </View>
      </View>

      {/* Pronunciación */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="volume-high" size={18} />
          <Text style={styles.h}>Pronunciación</Text>
        </View>

        <Text style={styles.p}>
          Escucha <Text style={styles.bold}>{current.kana}</Text> ({current.romaji}).
        </Text>

        <View style={styles.row}>
          <Pressable
            onPress={() => playRomaji(current.romaji as any)}
            disabled={isAudioBusy || !hasAudio}
            style={[styles.btn, (isAudioBusy || !hasAudio) && styles.btnDisabled]}
          >
            <Ionicons name={isAudioBusy ? "hourglass" : "play"} size={16} color="#fff" />
            <Text style={styles.btnTxt}>{isAudioBusy ? "Cargando..." : "Escuchar"}</Text>
          </Pressable>
          {!hasAudio && <Text style={styles.hint}>Sin audio para esta letra.</Text>}
        </View>
      </View>

      {/* Paginación */}
      <View style={styles.pagination}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Modal ampliado */}
      <Modal transparent animationType="fade" visible={modalOpen} onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {current.kana} — {current.romaji}
              </Text>
              <Pressable onPress={() => setModalOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={22} />
              </Pressable>
            </View>
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <TraceFrameKata char={current.kana} showNumbers={showNums} size={360} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

/* ===================== Estilos (mismo look & feel de antes) ===================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const GOLD = "#C6A15B";
const CRIMSON = "#B32133";
const WASHI = "#fffdf7";

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },
  header: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "900", color: INK },
  subtitle: { color: "#4B5563", marginTop: 4 },

  navRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  navBtnDisabled: { opacity: 0.5 },
  navTxt: { fontWeight: "700", color: INK },
  kanaPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ffffffaa",
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
  },
  kana: { fontSize: 26, fontWeight: "900", color: INK, lineHeight: 28 },
  roma: { fontSize: 12, color: "#6B7280" },

  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  p: { color: "#374151", marginTop: 4 },
  bold: { fontWeight: "900", color: INK },

  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },

  // Botón rojo (como antes)
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CRIMSON,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#9f1c2c",
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnSecondaryTxt: { fontWeight: "800", color: INK },

  hint: { color: "#6B7280" },

  frameWrap: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAD48A",
    backgroundColor: "#FFF6C2",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: WASHI,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 16, fontWeight: "900", color: INK },
  modalClose: { padding: 4, marginLeft: 8 },

  pagination: { marginTop: 10, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#E5E7EB" },
  dotActive: { backgroundColor: GOLD },
});
