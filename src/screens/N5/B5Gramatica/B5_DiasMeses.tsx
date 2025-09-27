// src/screens/N5/B5Gramatica/B5_DiasSemana_Kanji.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Speech from "expo-speech"; // 🔊 TTS
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

// ✅ Imágenes WEBP locales (KanjiVG exactos)
import imgDO from "../../../../assets/kanjivg/weekdays/do_web.webp";
import imgGETSU from "../../../../assets/kanjivg/weekdays/getsu_web.webp";
import imgKA from "../../../../assets/kanjivg/weekdays/ka_web.webp";
import imgKIN from "../../../../assets/kanjivg/weekdays/kin_web.webp";
import imgMOKU from "../../../../assets/kanjivg/weekdays/moku_web.webp";
import imgNICHI from "../../../../assets/kanjivg/weekdays/nichi_web.webp";
import imgSUI from "../../../../assets/kanjivg/weekdays/sui_web.webp";

const IMG_BY_KANJI: Record<string, any> = {
  "月": imgGETSU,
  "火": imgKA,
  "水": imgSUI,
  "木": imgMOKU,
  "金": imgKIN,
  "土": imgDO,
  "日": imgNICHI,
};

const { width: W, height: H } = Dimensions.get("window");

/** 🌸 Pétalos */
function Petal({ delay = 0 }: { delay?: number }) {
  const fall = useRef(new Animated.Value(0)).current;
  const x0 = useRef(Math.random() * W).current;
  const size = useRef(16 + Math.random() * 16).current;
  const duration = useRef(9000 + Math.random() * 6000).current;
  const drift = useRef(20 + Math.random() * 40).current;
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-60, H + 60] });
  const translateX = fall.interpolate({ inputRange: [0, 0.5, 1], outputRange: [x0 - drift, x0 + drift, x0 - drift] });

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(fall, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duration, fall]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: size,
        transform: [{ translateX }, { translateY }, { rotate }],
        opacity: Platform.select({ ios: 0.9, android: 0.85, default: 0.9 }),
      }}
    >
      🌸
    </Animated.Text>
  );
}

/* ===== Paleta ===== */
const WASHI = "rgba(255,255,255,0.9)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

/* ====== TTS helper ====== */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    });
  } catch {}
}

/** Datos “como primaria” */
type Dia = {
  kanji: "月" | "火" | "水" | "木" | "金" | "土" | "日";
  youbi: string;    // げつようび…
  esp: string;      // Lunes…
  on: string;       // ON-yomi relevantes
  significado: string; // luna, fuego…
  planeta: string;  // regente tradicional
  trazos: number;
  tips: string[];
};

const DIAS: Dia[] = [
  { kanji: "月", youbi: "げつようび", esp: "Lunes", on: "ゲツ／ガツ", significado: "luna", planeta: "Luna", trazos: 4,
    tips: ["1: línea horizontal arriba", "2: vertical izquierda", "3: horizontal media", "4: horizontal inferior"] },
  { kanji: "火", youbi: "かようび", esp: "Martes", on: "カ", significado: "fuego", planeta: "Marte (かせい)", trazos: 4,
    tips: ["1: diagonal ↙", "2: diagonal ↘", "3: vertical central", "4: corto a la izquierda abajo"] },
  { kanji: "水", youbi: "すいようび", esp: "Miércoles", on: "スイ", significado: "agua", planeta: "Mercurio (すいせい)", trazos: 4,
    tips: ["1: vertical largo", "2: diagonal corta ↙", "3: diagonal ↘", "4: pequeño trazo arriba derecha"] },
  { kanji: "木", youbi: "もくようび", esp: "Jueves", on: "モク", significado: "árbol/madera", planeta: "Júpiter (もくせい)", trazos: 4,
    tips: ["1: horizontal arriba", "2: vertical al centro", "3: diagonal ↙", "4: diagonal ↘"] },
  { kanji: "金", youbi: "きんようび", esp: "Viernes", on: "キン", significado: "oro/metal", planeta: "Venus (きんせい)", trazos: 8,
    tips: ["Corona corta arriba → vertical → ‘brazos’ laterales → base"] },
  { kanji: "土", youbi: "どようび", esp: "Sábado", on: "ド", significado: "tierra/suelo", planeta: "Saturno (どせい)", trazos: 3,
    tips: ["1: horizontal arriba", "2: vertical", "3: horizontal inferior larga"] },
  { kanji: "日", youbi: "にちようび", esp: "Domingo", on: "ニチ／ジツ", significado: "sol/día", planeta: "Sol", trazos: 4,
    tips: ["1: horizontal arriba", "2: vertical izquierda", "3: horizontal abajo", "4: trazo interior"] },
];

/** Tira didáctica: base + よう + び */
const BASES = [
  { kanji: "月", base: "げつ", palabra: "げつようび", esp: "Lunes"   },
  { kanji: "火", base: "か",   palabra: "かようび",   esp: "Martes"  },
  { kanji: "水", base: "すい", palabra: "すいようび", esp: "Miércoles" },
  { kanji: "木", base: "もく", palabra: "もくようび", esp: "Jueves"  },
  { kanji: "金", base: "きん", palabra: "きんようび", esp: "Viernes" },
  { kanji: "土", base: "ど",   palabra: "どようび",   esp: "Sábado"  },
  { kanji: "日", base: "にち", palabra: "にちようび", esp: "Domingo" },
] as const;

/** Quiz: kanji → lectura corta del día */
const QUIZ_OPTS = ["げつ", "か", "すい", "もく", "きん", "ど", "にち"] as const;
type Opcion = typeof QUIZ_OPTS[number];

export default function B5_DiasSemana_Kanji() {
  // ✅ Sonidos solo en el quiz
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const [pairs, setPairs] = useState<Record<string, Opcion | undefined>>({});

  useEffect(() => {
    return () => Speech.stop(); // parar TTS al salir
  }, []);

  const checkOne = (k: string, chosen: Opcion) => {
    const correct: Record<string, Opcion> = {
      "月": "げつ", "火": "か", "水": "すい", "木": "もく", "金": "きん", "土": "ど", "日": "にち",
    };
    const ok = correct[k] === chosen;
    Vibration.vibrate(ok ? 10 : 18);
    if (ready) (ok ? playCorrect() : playWrong());
    setPairs((p) => ({ ...p, [k]: chosen }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.9 }}
      >
        {/* 🌸 Pétalos */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Petal key={i} delay={i * 450} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⛩️ Kanji — Días de la semana</Text>
            <Text style={s.h}>Trazo exacto + explicación fácil</Text>
            <Text style={s.sub}>
              Usamos los diagramas oficiales de KanjiVG (orden numerado). Mira, nombra y repite cada paso.
            </Text>
          </View>

          {/* Explicación “como primaria” */}
          <View style={s.howCard}>
            <View style={s.cardHeader}>
              <Ionicons name="sparkles-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>¿Cómo se forman los días?</Text>
            </View>

            <Text style={s.howBig}>
              Fórmula mágica: <Text style={s.mono}>[Base] + よう + び</Text>
            </Text>
            <Text style={s.howTxt}>
              • <Text style={s.bold}>[Base]</Text> es una “cosita del cielo o la naturaleza”:{' '}
              <Text style={s.mono}>月</Text> luna (<Text style={s.mono}>げつ</Text>), <Text style={s.mono}>火</Text> fuego (<Text style={s.mono}>か</Text>),
              <Text> 水</Text> agua (<Text style={s.mono}>すい</Text>), <Text style={s.mono}>木</Text> árbol (<Text style={s.mono}>もく</Text>),
              <Text> 金</Text> oro (<Text style={s.mono}>きん</Text>), <Text style={s.mono}>土</Text> tierra (<Text style={s.mono}>ど</Text>),
              <Text> 日</Text> sol (<Text style={s.mono}>にち</Text>).
            </Text>
            <Text style={s.howTxt}>
              • <Text style={s.mono}>よう（曜）</Text> = “día de la semana”. • <Text style={s.mono}>び（日）</Text> = “día” (al final suena <Text style={s.bold}>び</Text>).
            </Text>

            {/* Tira horizontal con tarjetas base → palabra (con 🔊) */}
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingVertical: 6, gap: 10 }}>
              {BASES.map((b) => (
                <View key={b.palabra} style={s.baseCard}>
                  <View style={s.baseTopRow}>
                    <Text style={s.baseKanji}>{b.kanji}</Text>
                    <Pressable style={s.speakBtn} onPress={() => speakJP(b.palabra)}>
                      <Ionicons name="volume-high-outline" size={16} color={INK} />
                    </Pressable>
                  </View>
                  <Text style={s.baseLine}><Text style={s.tag}>Base:</Text> <Text style={s.mono}>{b.base}</Text></Text>
                  <Text style={s.baseLine}><Text style={s.tag}>Se arma:</Text> <Text style={s.mono}>{b.base} + よう + び</Text></Text>
                  <Text style={s.baseWord}>
                    {b.palabra} <Text style={s.light}>（{b.esp}）</Text>
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={s.tipBox}>
              <Ionicons name="bulb-outline" size={14} color={INK} />
              <Text style={s.tipText}>
                Truco: “<Text style={s.mono}>すい</Text> + <Text style={s.mono}>よう</Text> + <Text style={s.mono}>び</Text>” → <Text style={s.mono}>すいようび</Text> (miércoles). Toca 🔊 para escuchar.
              </Text>
            </View>
          </View>

          {/* Tabla explicativa (con 🔊 en la lectura) */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableTitle}>
                <Ionicons name="reader-outline" size={16} color={INK} /> ¿Qué significan y cómo se leen?
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={INK} />
                <Text style={s.tableHint}>Desliza a la derecha para ver todo</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={[s.table, { minWidth: 920 }]}>
                <View style={[s.tr, s.thRow]}>
                  <Text style={[s.th, s.colKanji]}>Kanji</Text>
                  <Text style={[s.th, s.colYoubi]}>Lectura día</Text>
                  <Text style={[s.th, s.colOn]}>Lecturas ON</Text>
                  <Text style={[s.th, s.colSignif]}>Significado</Text>
                  <Text style={[s.th, s.colPlaneta]}>Origen (planeta)</Text>
                  <Text style={[s.th, s.colTrazos]}># de trazos</Text>
                  <Text style={[s.th, s.colTips]}>“Pasos” para escribir</Text>
                </View>

                {DIAS.map((d, i) => (
                  <View key={d.kanji} style={[s.tr, i % 2 ? s.trAlt : null]}>
                    <Text style={[s.td, s.colKanjiTxt]}>{d.kanji}</Text>

                    <View style={[s.tdYoubiWrap]}>
                      <Text style={[s.td, s.colYoubiTxt]}>{d.youbi}</Text>
                      <Pressable onPress={() => speakJP(d.youbi)} style={s.speakChip}>
                        <Ionicons name="volume-high-outline" size={14} color={INK} />
                      </Pressable>
                    </View>

                    <Text style={[s.td]}>{d.on}</Text>
                    <Text style={[s.td]}>{d.significado}</Text>
                    <Text style={[s.td]}>{d.planeta}</Text>
                    <Text style={[s.td]}>{d.trazos}</Text>
                    <View style={[s.tdTips]}>
                      {d.tips.map((t, j) => (
                        <View key={j} style={s.tipRow}>
                          <Ionicons name="create-outline" size={12} color={INK} />
                          <Text style={s.tipTxt}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Galería (WEBP locales) con 🔊 */}
          <View style={s.gallery}>
            <View style={s.cardHeader}>
              <Ionicons name="color-wand-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Trazo exacto (KanjiVG)</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator>
              {DIAS.map((d) => (
                <View key={d.kanji} style={s.svgCard}>
                  <View style={s.svgTitleRow}>
                    <Text style={s.svgTitle}>
                      {d.kanji} ・ {d.youbi} ({d.esp})
                    </Text>
                    <Pressable onPress={() => speakJP(d.youbi)} style={s.speakBtn}>
                      <Ionicons name="volume-high-outline" size={16} color={INK} />
                    </Pressable>
                  </View>
                  <View style={s.svgBox}>
                    <Image
                      source={IMG_BY_KANJI[d.kanji]}
                      style={{ width: 220, height: 220 }}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={s.svgCaption}>Diagrama con orden de trazos (KanjiVG)</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={s.credit}>
              Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0
            </Text>
          </View>

          {/* Quiz: une kanji → lectura corta */}
          <View style={s.quizCard}>
            <View style={s.cardHeader}>
              <Ionicons name="school-outline" size={20} color={INK} />
              <Text style={s.cardTitle}>Quiz: ¿qué lectura lleva el día?</Text>
            </View>

            {DIAS.map((d) => {
              const picked = pairs[d.kanji];
              const correct: Record<string, Opcion> = {
                "月": "げつ", "火": "か", "水": "すい", "木": "もく", "金": "きん", "土": "ど", "日": "にち",
              };
              const isRight = picked && picked === correct[d.kanji];
              return (
                <View key={d.kanji} style={s.quizRow}>
                  <Text style={s.quizQ}>
                    {d.kanji}（{d.esp}） →
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 8 }}>
                    {(["げつ","か","すい","もく","きん","ど","にち"] as Opcion[]).map((o) => (
                      <Pressable
                        key={o}
                        onPress={() => checkOne(d.kanji, o)}
                        style={[
                          s.choice,
                          picked === o && (isRight ? s.choiceRight : s.choiceWrong),
                        ]}
                        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                      >
                        <Text style={s.choiceTxt}>{o}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

/* ===== Estilos ===== */
const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },

  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },

  /* How it works */
  howCard: {
    backgroundColor: "rgba(255,251,240,0.95)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  howBig: { fontWeight: "900", color: INK },
  howTxt: { color: INK, lineHeight: 18 },
  baseCard: {
    width: 180, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  baseTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  baseKanji: { fontSize: 28, fontWeight: "900", color: INK, textAlign: "center" },
  baseLine: { color: INK, fontSize: 12, marginBottom: 2 },
  baseWord: { color: INK, fontWeight: "900", marginTop: 4, textAlign: "center" },
  tag: { fontWeight: "900", color: INK },
  mono: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }), color: INK },
  light: { opacity: 0.8 },

  tipBox: {
    marginTop: 6, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    backgroundColor: "rgba(255,255,255,0.92)", padding: 8, flexDirection: "row", alignItems: "center", gap: 8,
  },
  tipText: { color: INK, flexShrink: 1 },

  /* Tabla */
  tableWrap: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 10, gap: 8 },
  tableHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tableTitle: { fontWeight: "900", color: INK },
  tableHint: { fontSize: 12, color: INK, opacity: 0.9 },
  table: { minWidth: 920 },
  tr: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, gap: 8 },
  trAlt: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 10 },
  thRow: { borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 4 },
  th: { fontWeight: "900", color: INK, fontSize: 12 },

  td: { color: INK, fontSize: 14, lineHeight: 18, width: 130, paddingHorizontal: 6 },
  colKanji: { width: 70, paddingHorizontal: 6 },
  colKanjiTxt: { width: 70, fontSize: 22, fontWeight: "900", color: INK, textAlign: "center" },

  /* Lectura con chip 🔊 */
  colYoubi: { width: 170 },
  tdYoubiWrap: { width: 170, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6 },
  colYoubiTxt: { fontWeight: "800", color: INK, flexShrink: 1 },

  colOn: { width: 120 }, colSignif: { width: 130 }, colPlaneta: { width: 140 }, colTrazos: { width: 90 },
  colTips: { width: 260 },
  tdTips: { width: 260, gap: 4, paddingRight: 8 },
  tipRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  tipTxt: { color: INK, fontSize: 13 },

  /* Galería */
  gallery: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8 },
  svgCard: {
    width: 260, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)", marginRight: 12,
  },
  svgTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  svgTitle: { fontWeight: "900", color: INK, marginBottom: 8, flexShrink: 1, marginRight: 8 },
  svgBox: { alignItems: "center", justifyContent: "center", height: 240 },
  svgCaption: { fontSize: 12, color: INK, opacity: 0.8, marginTop: 8, textAlign: "center" },
  credit: { fontSize: 11, color: INK, opacity: 0.7, marginTop: 6, textAlign: "center" },

  /* Botones de audio */
  speakBtn: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  speakChip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* Quiz */
  quizCard: {
    backgroundColor: "rgba(255,251,240,0.92)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 10,
  },
  quizRow: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 10, marginBottom: 10, gap: 8,
  },
  quizQ: { fontWeight: "900", color: INK },
  choice: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "white",
  },
  choiceTxt: { fontWeight: "800", color: INK },
  choiceRight: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.10)" },
  choiceWrong: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.10)" },
});
