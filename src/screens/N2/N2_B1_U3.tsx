// src/screens/N2/N2_B1_U3.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import UnitTemplate from "./UnitTemplate";

/* ---------- Nav / theme ---------- */
type Nav = NativeStackNavigationProp<any>;
const accent = "#C01E2E";
const { width } = Dimensions.get("window");

/* ---------- TTS helpers ---------- */
function speakJP(text: string, opts?: Speech.SpeechOptions) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 0.98, pitch: 1.02, ...opts });
  } catch {}
}
function speakES(text: string, opts?: Speech.SpeechOptions) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "es-MX", rate: 1.0, pitch: 1.0, ...opts });
  } catch {}
}

/* ---------- Reusable UI ---------- */
function GramLabel({ kana, kanji }: { kana: string; kanji: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillTxt}>
        {kana}（{kanji}）
      </Text>
    </View>
  );
}
function ExampleRow({
  jp,
  es,
  note,
}: {
  jp: string;
  es: string;
  note?: string;
}) {
  return (
    <View style={styles.example}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => speakJP(jp)}
          style={[styles.playBtn, { borderColor: accent }]}
        >
          <MCI name="play" size={18} color={accent} />
        </Pressable>
        <Text style={styles.jp}>{jp}</Text>
      </View>
      <Text style={styles.es}>{es}</Text>
      {!!note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}
function ActivityCard({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: keyof typeof MCI.glyphMap;
  title: string;
  desc: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.cardAct}>
      <LinearGradient colors={["#161922", "#121319"]} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.iconWrap, { borderColor: accent }]}>
          <MCI name={icon} size={22} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actTitle}>{title}</Text>
          <Text style={styles.actDesc}>{desc}</Text>
        </View>
        <MCI name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
      </View>
    </Pressable>
  );
}

/* =========================================================
   DRAW PAD — pizarra controlada por kanji (SVG)
========================================================= */
type Stroke = { d: string };
function DrawPad({
  size = Math.min(width - 32, 340),
  value,
  onChange,
  onDrawingChange,
}: {
  size?: number;
  value?: Stroke[];
  onChange?: (next: Stroke[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
}) {
  const [internal, setInternal] = useState<Stroke[]>([]);
  const isControlled = value !== undefined && onChange !== undefined;
  const strokes = Array.isArray(value) ? value : internal;

  const setStrokesArray = (next: Stroke[]) => {
    if (isControlled) onChange!(next);
    else setInternal(next);
  };

  const current = useRef<string>("");

  const start = (x: number, y: number) => {
    current.current = `M${x},${y}`;
    setStrokesArray([...strokes, { d: current.current }]);
  };
  const move = (x: number, y: number) => {
    if (!current.current) return;
    current.current += ` L${x},${y}`;
    const next = strokes.slice();
    next[next.length - 1] = { d: current.current };
    setStrokesArray(next);
  };
  const end = () => { current.current = ""; };

  const undo = () => {
    if (strokes.length === 0) return;
    setStrokesArray(strokes.slice(0, -1));
  };
  const clear = () => setStrokesArray([]);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={[styles.drawWrap, { width: size, height: size, backgroundColor: "#fff" }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => { const { locationX, locationY } = e.nativeEvent; start(locationX, locationY); onDrawingChange?.(true); }}
        onResponderMove={(e) => { const { locationX, locationY } = e.nativeEvent; move(locationX, locationY); }}
        onResponderRelease={() => onDrawingChange?.(false)}
        onResponderTerminate={() => onDrawingChange?.(false)}
      >
        <Svg width={size} height={size}>
          <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
          <Rect x={1.5} y={1.5} width={size - 3} height={size - 3} fill="none" stroke="#D0D4DA" strokeWidth={3} />
          <Path d={`M${size / 2},0 L${size / 2},${size}`} stroke="#E5E7EB" strokeWidth={2} />
          <Path d={`M0,${size / 2} L${size},${size / 2}`} stroke="#E5E7EB" strokeWidth={2} />
          <Path d={`M0,0 L${size},${size}`} stroke="#F0F2F5" strokeWidth={1.5} />
          <Path d={`M${size},0 L0,${size}`} stroke="#F0F2F5" strokeWidth={1.5} />
          {strokes.map((s, i) => (
            <Path key={`stroke-${i}`} d={s.d} fill="none" stroke="#111111" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
      <View style={styles.toolsRow}>
        <Pressable onPress={undo} style={styles.toolBtn}>
          <MCI name="undo" size={18} color="#fff" />
          <Text style={styles.toolTxt}>Deshacer</Text>
        </Pressable>
        <Pressable onPress={clear} style={styles.toolBtn}>
          <MCI name="trash-can-outline" size={18} color="#fff" />
          <Text style={styles.toolTxt}>Borrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   KANJI — data + modal
========================================================= */
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  strokeAsset?: any;
  words: { jp: string; reading: string; es: string }[];
};

const KANJI_12_U3: KanjiItem[] = [
  { kanji: "決", readingJP: "けつ／き(める)", meaningEs: "decidir", strokeAsset: require("../../../assets/kanjivg/n2/06c7a_nums.webp"),
    words: [
      { jp: "決定", reading: "けってい", es: "decisión" },
      { jp: "解決", reading: "かいけつ", es: "solución" },
      { jp: "決心", reading: "けっしん", es: "determinación" },
      { jp: "決める", reading: "きめる", es: "decidir (v.)" },
    ],
  },
  { kanji: "定", readingJP: "てい／さだ(める)", meaningEs: "fijar / establecer", strokeAsset: require("../../../assets/kanjivg/n2/05b9a_nums.webp"),
    words: [
      { jp: "予定", reading: "よてい", es: "plan / agenda" },
      { jp: "決定", reading: "けってい", es: "decisión" },
      { jp: "設定", reading: "せってい", es: "configuración" },
      { jp: "定める", reading: "さだめる", es: "establecer (v.)" },
    ],
  },
  { kanji: "参", readingJP: "さん", meaningEs: "participar / referirse", strokeAsset: require("../../../assets/kanjivg/n2/053c2_nums.webp"),
    words: [
      { jp: "参加", reading: "さんか", es: "participación" },
      { jp: "参考", reading: "さんこう", es: "referencia" },
      { jp: "参照", reading: "さんしょう", es: "consulta / referencia" },
      { jp: "参議院", reading: "さんぎいん", es: "Cámara Alta (JP)" },
    ],
  },
  { kanji: "加", readingJP: "か／くわ(える)", meaningEs: "añadir / unirse", strokeAsset: require("../../../assets/kanjivg/n2/052a0_nums.webp"),
    words: [
      { jp: "参加", reading: "さんか", es: "participar" },
      { jp: "追加", reading: "ついか", es: "agregar" },
      { jp: "加速", reading: "かそく", es: "aceleración" },
      { jp: "加える", reading: "くわえる", es: "añadir (v.)" },
    ],
  },
  { kanji: "断", readingJP: "だん／ことわ(る)", meaningEs: "cortar / rechazar / decidir", strokeAsset: require("../../../assets/kanjivg/n2/065ad_nums.webp"),
    words: [
      { jp: "判断", reading: "はんだん", es: "juicio / decisión" },
      { jp: "断念", reading: "だんねん", es: "renuncia a algo" },
      { jp: "無断", reading: "むだん", es: "sin permiso" },
      { jp: "断る", reading: "ことわる", es: "rechazar / avisar" },
    ],
  },
  { kanji: "由", readingJP: "ゆ", meaningEs: "origen / razón", strokeAsset: require("../../../assets/kanjivg/n2/07531_nums.webp"),
    words: [
      { jp: "理由", reading: "りゆう", es: "razón / motivo" },
      { jp: "自由", reading: "じゆう", es: "libertad" },
      { jp: "由来", reading: "ゆらい", es: "origen / procedencia" },
      { jp: "不自由", reading: "ふじゆう", es: "inconveniencia / discapacidad" },
    ],
  },
  { kanji: "訳", readingJP: "やく／わけ", meaningEs: "traducir / razón", strokeAsset: require("../../../assets/kanjivg/n2/08a33_nums.webp"),
    words: [
      { jp: "翻訳", reading: "ほんやく", es: "traducción (escrita)" },
      { jp: "通訳", reading: "つうやく", es: "interpretación (oral)" },
      { jp: "言い訳", reading: "いいわけ", es: "excusa" },
      { jp: "訳", reading: "わけ", es: "razón / sentido" },
    ],
  },
  { kanji: "必", readingJP: "ひつ／かなら(ず)", meaningEs: "necesario", strokeAsset: require("../../../assets/kanjivg/n2/05fc5_nums.webp"),
    words: [
      { jp: "必要", reading: "ひつよう", es: "necesario" },
      { jp: "必須", reading: "ひっす", es: "indispensable" },
      { jp: "必ず", reading: "かならず", es: "sin falta / siempre" },
      { jp: "必然", reading: "ひつぜん", es: "inevitabilidad" },
    ],
  },
  { kanji: "然", readingJP: "ぜん／しか(し)", meaningEs: "así / naturaleza", strokeAsset: require("../../../assets/kanjivg/n2/07136_nums.webp"),
    words: [
      { jp: "自然", reading: "しぜん", es: "naturaleza" },
      { jp: "当然", reading: "とうぜん", es: "por supuesto / natural" },
      { jp: "必然", reading: "ひつぜん", es: "inevitable" },
      { jp: "全然", reading: "ぜんぜん", es: "en absoluto / totalmente" },
    ],
  },
  { kanji: "証", readingJP: "しょう", meaningEs: "prueba / certificado", strokeAsset: require("../../../assets/kanjivg/n2/08a3c_nums.webp"),
    words: [
      { jp: "証明", reading: "しょうめい", es: "demostración / prueba" },
      { jp: "保証", reading: "ほしょう", es: "garantía" },
      { jp: "証拠", reading: "しょうこ", es: "evidencia" },
      { jp: "証券", reading: "しょうけん", es: "título / valor" },
    ],
  },
  { kanji: "責", readingJP: "せき", meaningEs: "responsabilidad / culpar", strokeAsset: require("../../../assets/kanjivg/n2/08cac_nums.webp"),
    words: [
      { jp: "責任", reading: "せきにん", es: "responsabilidad" },
      { jp: "責任者", reading: "せきにんしゃ", es: "responsable (cargo)" },
      { jp: "責める", reading: "せめる", es: "culpar / reprochar" },
      { jp: "職責", reading: "しょくせき", es: "responsabilidad del puesto" },
    ],
  },
  { kanji: "任", readingJP: "にん", meaningEs: "cargo / confiar", strokeAsset: require("../../../assets/kanjivg/n2/04efb_nums.webp"),
    words: [
      { jp: "責任", reading: "せきにん", es: "responsabilidad" },
      { jp: "任命", reading: "にんめい", es: "nombramiento" },
      { jp: "主任", reading: "しゅにん", es: "jefe de sección" },
      { jp: "任せる", reading: "まかせる", es: "encargar / confiar" },
    ],
  },
];

// ==== Kanjis (12) — N2_B2_U1 (Keigo) ====
// Requiere que exista el tipo: export type KanjiItem = { kanji:string; readingJP:string; meaningEs:string; strokeAsset?:any; words:{jp:string; reading:string; es:string}[]; };

const KANJI_12_B2_U1: KanjiItem[] = [
  {
    kanji: "尊",
    readingJP: "そん／とうと(い)",
    meaningEs: "respetar / digno",
    strokeAsset: require("../../../assets/kanjivg/n2/05c0a_nums.webp"),
    words: [
      { jp: "尊敬", reading: "そんけい", es: "respeto" },
      { jp: "尊重", reading: "そんちょう", es: "consideración" },
      { jp: "尊厳", reading: "そんげん", es: "dignidad" },
      { jp: "尊い", reading: "とうとい", es: "valioso / noble" },
    ],
  },
  {
    kanji: "敬",
    readingJP: "けい",
    meaningEs: "respeto / reverencia",
    strokeAsset: require("../../../assets/kanjivg/n2/0656c_nums.webp"),
    words: [
      { jp: "敬語", reading: "けいご", es: "lenguaje honorífico" },
      { jp: "敬意", reading: "けいい", es: "respeto" },
      { jp: "敬称", reading: "けいしょう", es: "tratamiento honorífico" },
      { jp: "敬具", reading: "けいぐ", es: "atentamente (carta)" },
    ],
  },
  {
    kanji: "謙",
    readingJP: "けん",
    meaningEs: "humildad",
    strokeAsset: require("../../../assets/kanjivg/n2/08b19_nums.webp"),
    words: [
      { jp: "謙遜", reading: "けんそん", es: "modestia" },
      { jp: "謙譲語", reading: "けんじょうご", es: "lenguaje humilde" },
      { jp: "謙虚", reading: "けんきょ", es: "modesto" },
      { jp: "へりくだる", reading: "へりくだる", es: "mostrarse humilde" },
    ],
  },
  {
    kanji: "譲",
    readingJP: "じょう／ゆず(る)",
    meaningEs: "ceder / transferir",
    strokeAsset: require("../../../assets/kanjivg/n2/08b72_nums.webp"),
    words: [
      { jp: "譲渡", reading: "じょうと", es: "transferencia" },
      { jp: "譲歩", reading: "じょうほ", es: "concesión" },
      { jp: "譲る", reading: "ゆずる", es: "ceder" },
      { jp: "譲り受ける", reading: "ゆずりうける", es: "recibir por cesión" },
    ],
  },
  {
    kanji: "伺",
    readingJP: "うかが(う)",
    meaningEs: "visitar / consultar (hum.)",
    strokeAsset: require("../../../assets/kanjivg/n2/04f3a_nums.webp"),
    words: [
      { jp: "伺う", reading: "うかがう", es: "visitar/preguntar (hum.)" },
      { jp: "お伺い", reading: "おうかがい", es: "consulta/visita" },
      { jp: "ご機嫌伺い", reading: "ごきげんうかがい", es: "saludo de cortesía" },
      { jp: "伺い先", reading: "うかがいさき", es: "destino de visita" },
    ],
  },
  {
    kanji: "申",
    readingJP: "もう(す)",
    meaningEs: "decir (hum.) / solicitar",
    strokeAsset: require("../../../assets/kanjivg/n2/07533_nums.webp"),
    words: [
      { jp: "申す", reading: "もうす", es: "decir (hum.)" },
      { jp: "申し上げる", reading: "もうしあげる", es: "decir/ofrecer (hum.)" },
      { jp: "申請", reading: "しんせい", es: "solicitud" },
      { jp: "申し込み", reading: "もうしこみ", es: "inscripción / solicitud" },
    ],
  },
  {
    kanji: "致",
    readingJP: "いた(す)",
    meaningEs: "hacer (hum.) / causar",
    strokeAsset: require("../../../assets/kanjivg/n2/081f4_nums.webp"),
    words: [
      { jp: "致す", reading: "いたす", es: "hacer (hum.)" },
      { jp: "一致", reading: "いっち", es: "coincidencia" },
      { jp: "合致", reading: "がっち", es: "concordar" },
      { jp: "致命", reading: "ちめい", es: "letal" },
    ],
  },
  {
    kanji: "存",
    readingJP: "そん",
    meaningEs: "existir / conocer (hum.)",
    strokeAsset: require("../../../assets/kanjivg/n2/05b58_nums.webp"),
    words: [
      { jp: "存じる", reading: "ぞんじる", es: "saber/conocer (hum.)" },
      { jp: "ご存知", reading: "ごぞんじ", es: "saber (hon.)" },
      { jp: "保存", reading: "ほぞん", es: "guardar" },
      { jp: "存続", reading: "そんぞく", es: "continuar" },
    ],
  },
  {
    kanji: "参",
    readingJP: "さん／まい(る)",
    meaningEs: "participar / ir (hum.)",
    strokeAsset: require("../../../assets/kanjivg/n2/053c2_nums.webp"),
    words: [
      { jp: "参る", reading: "まいる", es: "ir/venir (hum.)" },
      { jp: "参加", reading: "さんか", es: "participación" },
      { jp: "参考", reading: "さんこう", es: "referencia" },
      { jp: "参照", reading: "さんしょう", es: "consulta / ver" },
    ],
  },
  {
    kanji: "拝",
    readingJP: "はい",
    meaningEs: "reverencia / humilde",
    strokeAsset: require("../../../assets/kanjivg/n2/062dd_nums.webp"),
    words: [
      { jp: "拝見", reading: "はいけん", es: "ver (hum.)" },
      { jp: "拝読", reading: "はいどく", es: "leer (hum.)" },
      { jp: "拝受", reading: "はいじゅ", es: "recibir (hum.)" },
      { jp: "拝啓", reading: "はいけい", es: "Estimado… (inicio carta)" },
    ],
  },
  {
    kanji: "御",
    readingJP: "ご／おん",
    meaningEs: "honorífico (prefijo)",
    strokeAsset: require("../../../assets/kanjivg/n2/05fa1_nums.webp"),
    words: [
      { jp: "御社", reading: "おんしゃ", es: "su empresa (hon.)" },
      { jp: "御中", reading: "おんちゅう", es: "A la atención de" },
      { jp: "御礼", reading: "おれい", es: "agradecimiento (formal)" },
      { jp: "ご案内", reading: "ごあんない", es: "anuncio / guía" },
    ],
  },
  {
    kanji: "様",
    readingJP: "さま／よう",
    meaningEs: "señor/a; forma/estilo",
    strokeAsset: require("../../../assets/kanjivg/n2/069d8_nums.webp"),
    words: [
      { jp: "〜様", reading: "〜さま", es: "Sr./Sra. (hon.)" },
      { jp: "様式", reading: "ようしき", es: "formato / estilo" },
      { jp: "同様", reading: "どうよう", es: "similar" },
      { jp: "様々", reading: "さまざま", es: "diverso" },
    ],
  },
];

/* ---------- Kanji Modal (blanco) ---------- */
function KanjiModal({
  visible,
  onClose,
  data,
}: {
  visible: boolean;
  onClose: () => void;
  data: KanjiItem | null;
}) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [sketchesByKanji, setSketchesByKanji] = useState<Record<string, Stroke[]>>({});

  if (!data) return null;
  const IMG_SIZE = Math.min(width - 32, 330);
  const strokes = sketchesByKanji[data.kanji] ?? [];
  const updateStrokes = (next: Stroke[]) =>
    setSketchesByKanji((m) => ({ ...m, [data.kanji]: next }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>{data.kanji}</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalReadingDark} onPress={() => speakJP(data.readingJP)}>
              {data.readingJP} · {data.meaningEs} <Text style={{ opacity: 0.7 }}>(Toca para oír)</Text>
            </Text>

            {data.strokeAsset ? (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <ExpoImage
                  source={data.strokeAsset}
                  style={{ width: IMG_SIZE, height: IMG_SIZE, borderRadius: 16, backgroundColor: "#fff" }}
                  contentFit="contain"
                />
                <Text style={[styles.subtleDark, { marginTop: 6 }]}>Orden de trazos (KanjiVG)</Text>
              </View>
            ) : (
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Text style={styles.subtleDark}>No hay imagen de trazos; practica en la cuadrícula.</Text>
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <DrawPad
                size={Math.min(width - 32, 330)}
                value={strokes}
                onChange={updateStrokes}
                onDrawingChange={(drawing) => setScrollEnabled(!drawing)}
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={styles.wordsTitleDark}>Palabras con「{data.kanji}」</Text>
              {data.words.map((w, i) => (
                <Pressable key={i} onPress={() => speakJP(w.jp)} style={styles.wordItemLight}>
                  <Text style={styles.wordJpDark}>{w.jp}</Text>
                  <Text style={styles.wordReadingDark}>{w.reading}</Text>
                  <Text style={styles.wordEsDark}>{w.es}</Text>
                  <MCI name="play" size={18} color={accent} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   GRAMMAR — Guía rápida (modal) からには・以上（は）
========================================================= */
/* =========================================================
   GRAMMAR — Guía rápida (からには・以上（は） por categoría gramatical)
========================================================= */
function GramRefModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  // pequeñas celdas reutilizables
  const Tip = ({ children }: { children: React.ReactNode }) => (
    <View style={{ backgroundColor: "#F3F4F6", borderRadius: 10, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#E5E7EB" }}>
      <Text style={{ color: "#111827" }}>{children}</Text>
    </View>
  );
  const Row = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
    <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#E5E7EB" }}>
      <View style={{ flex: 0.9, padding: 10, backgroundColor: "#F9FAFB" }}>
        <Text style={{ color: "#111827", fontWeight: "900" }}>{left}</Text>
      </View>
      <View style={{ flex: 2, padding: 10 }}>
        <Text style={{ color: "#111827" }}>{right}</Text>
      </View>
    </View>
  );
  const Table = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
      <View style={{ backgroundColor: "#EFF6FF", paddingVertical: 8, paddingHorizontal: 10 }}>
        <Text style={{ color: "#111827", fontWeight: "900" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
  const Ex = ({ jp, es }: { jp: string; es: string }) => (
    <View style={{ marginTop: 6 }}>
      <Text style={{ color: "#111827", fontWeight: "900" }}>{jp}</Text>
      <Text style={{ color: "#374151" }}>{es}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Guía rápida · 〜からには／〜以上（は）</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {/* 1) Significado */}
            <Text style={styles.sectionH}>1) Significado en una frase</Text>
            <Text style={styles.p}>
              <Text style={styles.kb}>〜からには</Text> = “ya que / una vez que (yo/tú/ellos decidieron o se dio la condición), entonces (me/les) corresponde…” → matiz de
              <Text style={styles.kb}> compromiso personal</Text>.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.kb}>〜以上（は）</Text> = “dado que (hecho/decisión/condición objetiva), entonces por norma/expectativa general…” → matiz
              <Text style={styles.kb}> institucional/objetivo</Text>.
            </Text>

            {/* 2) Conexiones típicas */}
            <Text style={styles.sectionH}>2) Conexiones típicas que combinan bien</Text>
            <Text style={styles.p}>Suelen ir seguidas de: <Text style={styles.kb}>〜べきだ／〜なければならない／〜つもりだ／〜ないわけにはいかない／〜はずだ</Text>.</Text>

            {/* 3) Formación por categoría gramatical */}
            <Text style={styles.sectionH}>3) Formación por categoría (verbo, い/な, sustantivo)</Text>

            <Table title="A) 〜からには (compromiso del sujeto)">
              <Row
                left="Verbo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>V（普通形）＋からには</Text>】</Text>
                    <Ex jp="挑戦するからには、全力でやります。" es="Ya que me voy a retar, lo haré con todo." />
                    <Ex jp="参加したからには、最後まで責任を持つべきだ。" es="Una vez que participaste, debes asumir responsabilidad hasta el final." />
                  </>
                }
              />
              <Row
                left="い-adjetivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>Aい（普通形）＋からには</Text>】</Text>
                    <Ex jp="必要であるからには、費用をかけても導入すべきだ。" es="Si es necesario, deberíamos implementarlo aunque cueste." />
                    <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                      Nota: con 形容詞, es menos frecuente; aparece en registros explicativos/argumentativos.
                    </Text>
                  </>
                }
              />
              <Row
                left="な-adjetivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>Aな＋である＋からには</Text>】</Text>
                    <Ex jp="重要であるからには、確認を怠ってはならない。" es="Si es importante, no debemos omitir la verificación." />
                  </>
                }
              />
              <Row
                left="Sustantivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>N＋である＋からには</Text>】</Text>
                    <Ex jp="責任者であるからには、説明すべきだ。" es="Siendo el responsable, debes dar una explicación." />
                  </>
                }
              />
            </Table>

            <Table title="B) 〜以上（は） (regla/expectativa general)">
              <Row
                left="Verbo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>V（普通形）＋以上（は）</Text>】</Text>
                    <Ex jp="契約を締結した以上（は）、義務を果たさなければならない。" es="Habiéndose firmado el contrato, deben cumplirse las obligaciones." />
                  </>
                }
              />
              <Row
                left="い-adjetivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>Aい（普通形）＋以上（は）</Text>】</Text>
                    <Ex jp="安全である以上（は）、運用を開始できる。" es="Si es seguro, se puede iniciar la operación." />
                  </>
                }
              />
              <Row
                left="な-adjetivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>Aな＋である＋以上（は）</Text>】</Text>
                    <Ex jp="正式である以上（は）、手順に従うべきだ。" es="Siendo formal, hay que seguir los procedimientos." />
                  </>
                }
              />
              <Row
                left="Sustantivo"
                right={
                  <>
                    <Text>【<Text style={styles.kb}>N＋である＋以上（は）</Text>】</Text>
                    <Ex jp="学生である以上（は）、学則を守らなければならない。" es="Siendo estudiante, debes acatar el reglamento escolar." />
                  </>
                }
              />
            </Table>

            {/* 4) Cuándo usar cada una */}
            <Text style={styles.sectionH}>4) ¿Cuándo uso cada una?</Text>
            <Tip>
              <Text>
                • Hablo de mi decisión/implicación → <Text style={styles.kb}>からには</Text>{"\n"}
                • Anuncio/reglamento/política/decisión formal → <Text style={styles.kb}>以上（は）</Text>{"\n"}
                • En manuales, correos formales y reglas, <Text style={styles.kb}>以上（は）</Text> suena más natural.{"\n"}
                • En promesas personales o metas auto-impuestas, <Text style={styles.kb}>からには</Text> encaja mejor.
              </Text>
            </Tip>

            {/* 5) Errores */}
            <Text style={styles.sectionH}>5) Errores frecuentes</Text>
            <Text style={styles.p}>• Usar <Text style={styles.kb}>からには</Text> en comunicados oficiales cuando el tono debe ser neutral → mejor <Text style={styles.kb}>以上（は）</Text>.</Text>
            <Text style={styles.p}>• Olvidar <Text style={styles.kb}>である</Text> con <Text style={styles.kb}>名詞/な形</Text> (ambas formas): <Text style={styles.kb}>N／Aな＋である＋からには／以上（は）</Text>.</Text>
            <Text style={styles.p}>• No cerrar con consecuencia lógica: acompáñalo con <Text style={styles.kb}>〜べきだ／〜なければならない／〜つもりだ</Text>, etc.</Text>

            {/* 6) Plantillas */}
            <Text style={styles.sectionH}>6) Plantillas rápidas</Text>
            <Tip>
              <Text>
                【からには】V普 ＋ からには、〜べきだ／〜つもりだ／〜ないわけにはいかない。{"\n"}
                例）参加するからには、最後までやり遂げます。{"\n"}{"\n"}
                【以上（は）】普（N・な形は「である」）＋ 以上（は）、〜なければならない／〜のは当然だ。{"\n"}
                例）承認された以上（は）、計画を進めるべきだ。
              </Text>
            </Tip>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   MINI DRAMA — “ya que aceptaste…”
========================================================= */
type DramaLine = { speaker: "A" | "B"; jp: string; es: string };
const DRAMA_SCRIPT: DramaLine[] = [
  { speaker: "A", jp: "この案件を引き受けたからには、最後まで責任を持って対応します。", es: "Ya que acepté este proyecto, me haré responsable hasta el final." },
  { speaker: "B", jp: "お願いします。決定した以上は、スケジュールの遵守が前提です。", es: "Gracias. Dado que ya se decidió, cumplir el cronograma es básico." },
  { speaker: "A", jp: "関係部署の承認が下りた以上は、正式に開始できますね。", es: "Como ya tenemos la aprobación, podemos empezar oficialmente." },
  { speaker: "B", jp: "参加するからには、議事録と報告もお願いします。", es: "Si participas, te encargo acta y reporte." },
  { speaker: "A", jp: "了解です。必要書類を準備した上で、説明に伺います。", es: "Entendido. Prepararé los documentos necesarios y luego iré a explicar." },
];

function MiniDramaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (!visible) { setIdx(0); Speech.stop(); } }, [visible]);

  const line = DRAMA_SCRIPT[idx];
  const play = () => speakJP(line.jp);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Mini drama · Compromiso lógico</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <View style={{ padding: 16 }}>
            <View style={[styles.bubble, { borderColor: line.speaker === "A" ? "#93C5FD" : "#FCA5A5" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={[styles.speakerDot, { backgroundColor: line.speaker === "A" ? "#3B82F6" : "#EF4444" }]} />
                <Text style={styles.speakerName}>{line.speaker === "A" ? "A（担当）" : "B（上司）"}</Text>
                <View style={{ flex: 1 }} />
                <Pressable onPress={play} style={styles.ctrlBtnAlt}>
                  <MCI name="play" size={16} color="#111" />
                  <Text style={styles.ctrlTxtAlt}>JP</Text>
                </Pressable>
              </View>
              <Text style={styles.dramaJP}>{line.jp}</Text>
              <Text style={styles.dramaES}>{line.es}</Text>
            </View>

            <View style={styles.controlsRow}>
              <Pressable onPress={() => setIdx((i) => (i - 1 + DRAMA_SCRIPT.length) % DRAMA_SCRIPT.length)} style={styles.ctrlBtn}>
                <MCI name="skip-previous" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Anterior</Text>
              </Pressable>
              <Pressable onPress={() => setIdx((i) => (i + 1) % DRAMA_SCRIPT.length)} style={styles.ctrlBtn}>
                <MCI name="skip-next" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Siguiente</Text>
              </Pressable>
            </View>

            <View style={[styles.feedbackBox, { marginTop: 12 }]}>
              <Text style={{ color: "#111827" }}>
                <Text style={{ fontWeight: "900" }}>Pista:</Text> からには = “ya que / una vez que” (hablante se implica); 以上(は) = más institucional/objetivo (“dado que…”).
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   ROLEPLAY — ¿「からには」 o 「以上（は）」?
========================================================= */
type RPScenario = {
  context: string;
  jpBase: string;
  options: { tag: "からには" | "以上(は)"; good?: boolean; why: string }[];
  solution: "からには" | "以上(は)";
};
const RP: RPScenario[] = [
  {
    context: "El equipo ya tomó la decisión formal.",
    jpBase: "採用を決定した___、募集は締め切ります。",
    options: [
      { tag: "からには", why: "Implica resolución personal; aquí suena menos institucional." },
      { tag: "以上(は)", why: "Norma/decisión formal → tono institucional.", good: true },
    ],
    solution: "以上(は)",
  },
  {
    context: "Yo (hablante) me presenté voluntariamente.",
    jpBase: "ボランティアに参加する___、最後までやり遂げたいです。",
    options: [
      { tag: "からには", why: "Compromiso del hablante → perfecto.", good: true },
      { tag: "以上(は)", why: "Más impersonal; también posible, pero menos natural aquí." },
    ],
    solution: "からには",
  },
  {
    context: "La política fue publicada oficialmente.",
    jpBase: "新方針が公表された___、社内での遵守は必須です。",
    options: [
      { tag: "からには", why: "Matiz personal; el hecho es institucional." },
      { tag: "以上(は)", why: "Hecho objetivo + expectativa general → natural.", good: true },
    ],
    solution: "以上(は)",
  },
];

function RoleplayModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const scn = RP[idx];

  useEffect(() => {
    if (!visible) { setIdx(0); setPicked(null); }
  }, [visible]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const op = scn.options[i];
    if (op.good) speakES("¡Bien! Registro/compromiso correcto.");
    else speakES("Casi. ¿Es personal (からには) o institucional (以上は)?");
  };

  const next = () => { setPicked(null); setIdx((i) => (i + 1) % RP.length); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Roleplay · ¿Compromiso o regla?</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={{ color: "#6B7280" }}>Contexto (ES)</Text>
            <Text style={{ color: "#111827", fontWeight: "900", marginTop: 2 }}>
              {scn.context}
            </Text>

            <View style={[styles.bubble, { borderColor: "#E5E7EB", marginTop: 10 }]}>
              <Text style={styles.dramaJP}>{scn.jpBase.replace("___", "（　　）")}</Text>
              <Text style={{ color: "#374151", marginTop: 6, fontSize: 12 }}>
                Elige la forma que cuadra con el registro.
              </Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {scn.options.map((op, i) => {
                const isMe = picked === i;
                const ok = isMe && !!op.good;
                const bad = isMe && !op.good;
                return (
                  <Pressable
                    key={i}
                    disabled={picked !== null}
                    onPress={() => choose(i)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: ok ? "#16A34A" : bad ? "#DC2626" : isMe ? "#111827" : "#F3F4F6",
                        borderColor: ok || bad ? "transparent" : "#E5E7EB",
                      },
                    ]}
                  >
                    <Text style={{ color: ok || bad ? "#fff" : isMe ? "#fff" : "#111", fontWeight: "800" }}>
                      {op.tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {picked !== null && (
              <View style={[styles.feedbackBox, { marginTop: 10 }]}>
                <Text style={{ color: "#111827", fontWeight: "900" }}>
                  {scn.options[picked].good ? "✔ Correcto" : "✖ Incorrecto"}
                </Text>
                <Text style={{ color: "#374151", marginTop: 4 }}>{scn.options[picked].why}</Text>
                {!scn.options[picked].good && (
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                    Lo natural aquí es: {scn.solution}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.controlsRow}>
              <Pressable onPress={next} style={styles.ctrlBtn}>
                <MCI name="arrow-right-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Siguiente</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   QUIZ — MC + Fill
========================================================= */
type QuizQ =
  | { type: "mc"; id: number; stem: string; options: string[]; answer: string; why: string }
  | { type: "fill"; id: number; stem: string; answer: string; why: string };

const QUIZ: QuizQ[] = [
  { type: "mc", id: 1, stem: "契約を締結した（　　）、遵守しなければならない。", options: ["からには", "以上(は)"], answer: "以上(は)", why: "Hecho formal/objetivo → ‘以上(は)’ suena más institucional." },
  { type: "mc", id: 2, stem: "挑戦すると（　　）、全力でやります.", options: ["からには", "以上(は)"], answer: "からには", why: "Compromiso del hablante al decidir actuar → ‘からには’." },
  { type: "fill", id: 3, stem: "参加を表明した__、途中で投げ出すわけにはいかない。", answer: "からには", why: "Asume responsabilidad personal por haber elegido participar." },
  { type: "fill", id: 4, stem: "規定が改定された__、新ルールに従います。", answer: "以上(は)", why: "Hecho reglamentario → expectativa general → 以上(は)." },
];

/* =========================================================
   SCREEN
========================================================= */
export default function N2_B1_U3() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  const [showRef, setShowRef] = useState(false);
  const [showDrama, setShowDrama] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [showKanji, setShowKanji] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiItem | null>(null);

  const examples_karaniva = useMemo(
    () => [
      {
        jp: "引き受けたからには、最後までやり遂げます。",
        es: "Ya que lo acepté, lo completaré hasta el final.",
        note: "Compromiso del hablante; expectativa autoimpuesta.",
      },
      { jp: "参加するからには、準備を怠れない。", es: "Si voy a participar, no puedo descuidar la preparación." },
      { jp: "公開したからには、説明責任が生じる。", es: "Una vez publicado, surge la responsabilidad de explicar." },
    ],
    []
  );
  const examples_ijo = useMemo(
    () => [
      {
        jp: "採用した以上（は）、規定に従って運用します。",
        es: "Dado que lo adoptamos, operamos según la normativa.",
        note: "Hecho objetivo + expectativa general/institucional.",
      },
      { jp: "契約を締結した以上（は）、義務を果たすべきだ。", es: "Al haberse firmado el contrato, deben cumplirse las obligaciones." },
      { jp: "承認が下りた以上（は）、計画を進めましょう。", es: "Con la aprobación concedida, avancemos con el plan." },
    ],
    []
  );
  const examples_con = useMemo(
    () => [
      {
        jp: "V（辞書形）＋からには",
        es: "Con verbos; expresa ‘ya que (decidiste/vas a)… entonces…’.",
        note: "Frecuente con: ～つもりだ／～べきだ／～ないわけにはいかない。",
      },
      {
        jp: "普通形（名・な形＋である）＋以上（は）",
        es: "Registro más formal/objetivo. Manuales, anuncios, reglas.",
        note: "Muy natural con: ～べきだ／～なければならない／～のは当然だ。",
      },
    ],
    []
  );

  const openKanji = (k: KanjiItem) => { setCurrentKanji(k); setShowKanji(true); };
  const KANJIS = useMemo(() => KANJI_12_U3, []);

  const next = () => {
    const np = Math.min(1, progress + 0.33);
    setProgress(np);
    if (np >= 1) {
      navigation.navigate("CursoN2" as never);
    }
  };

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b1_u3.webp")}
      accent={accent}
      breadcrumb="B1 · U3"
      title="〜からには・〜以上（は）"
      subtitle="‘Una vez que…’: obligación o compromiso lógico en anuncios y oficina."
      outcomes={[
        "Expresar compromiso/expectativa con naturalidad",
        "Elegir からには vs 以上(は) según el contexto",
        "Aplicarlas en correos, reportes y reuniones",
      ]}
      dynamics={[
        "Guía rápida: patrones y registro",
        "Mini drama: ya que aceptaste el proyecto…",
        "Roleplay: reglas y compromisos",
        "Quiz: manuales internos y noticias",
      ]}
      ctas={[
        { label: "Guía rápida", onPress: () => setShowRef(true) },
        { label: "Mini drama", onPress: () => setShowDrama(true) },
        { label: "Roleplay", onPress: () => setShowRole(true) },
        { label: "Quiz", onPress: () => setShowQuiz(true) },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Continuar"
    >
      {/* ===== Lectura ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lectura</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <GramLabel kana="からには" kanji="—" />
          <GramLabel kana="以上（は）" kanji="いじょう（は）" />
        </View>
        <Text style={[styles.li, { marginTop: 10 }]}>
          Toca ▶ para escuchar cada ejemplo con TTS.
        </Text>
      </View>

      {/* ===== ① からには ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>① 〜からには</Text>
        <Text style={styles.li}>Decisión/elección del sujeto → crea compromiso o expectativa lógica.</Text>
        {examples_karaniva.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== ② 以上（は） ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>② 〜以上（は）</Text>
        <Text style={styles.li}>Hecho objetivo/condición ya fijada → expectativa normativa/institucional.</Text>
        {examples_ijo.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== Conexión / Fórmulas ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>Conexión y combinaciones típicas</Text>
        {examples_con.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== Actividades ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actividades</Text>
        <ActivityCard icon="book-information-variant" title="Guía rápida" desc="Resumen con formas, matices y conexiones." onPress={() => setShowRef(true)} />
        <ActivityCard icon="email-edit-outline" title="Mini drama" desc="Compromiso lógico tras decidir algo." onPress={() => setShowDrama(true)} />
        <ActivityCard icon="account-voice" title="Roleplay" desc="Elige la forma según el registro." onPress={() => setShowRole(true)} />
        <ActivityCard icon="clipboard-check-outline" title="Quiz" desc="Titulares y manuales." onPress={() => setShowQuiz(true)} />
      </View>

      {/* ===== Kanjis del bloque (12) ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kanjis nuevos（12）</Text>
        <View style={styles.kanjiGrid}>
          {KANJIS.map((k) => (
            <Pressable
              key={k.kanji}
              onPress={() => openKanji(k)}
              style={[styles.kanjiCell, { borderColor: "rgba(255,255,255,0.1)" }]}
            >
              <Text style={styles.kanjiBig}>{k.kanji}</Text>
              <Text style={styles.kanjiReading}>{k.readingJP}</Text>
              <Text style={styles.kanjiEs}>{k.meaningEs}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ===== Palabras para examen ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Palabras clave por kanji（para examen）</Text>
        <Text style={[styles.li, { marginBottom: 8 }]}>Toca cada palabra para oírla.</Text>
        {KANJIS.map((k) => (
          <View key={`list-${k.kanji}`} style={{ marginBottom: 10 }}>
            <Text style={styles.listKanjiHead}>「{k.kanji}」 {k.readingJP} — {k.meaningEs}</Text>
            {k.words.map((w, i) => (
              <Pressable key={i} onPress={() => speakJP(w.jp)} style={styles.wordItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wordJpInline}>{w.jp}</Text>
                  <Text style={styles.wordReadingInline}>{w.reading}</Text>
                </View>
                <Text style={styles.wordEsInline}>{w.es}</Text>
                <MCI name="play" size={18} color="#fff" />
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* MODALES */}
      <GramRefModal visible={showRef} onClose={() => setShowRef(false)} />
      <KanjiModal visible={showKanji} onClose={() => setShowKanji(false)} data={currentKanji} />
      <MiniDramaModal visible={showDrama} onClose={() => setShowDrama(false)} />
      <RoleplayModal visible={showRole} onClose={() => setShowRole(false)} />
      <QuizModalUI visible={showQuiz} onClose={() => setShowQuiz(false)} />
    </UnitTemplate>
  );
}

/* ---------- Quiz Modal UI ---------- */
function QuizModalUI({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = QUIZ[index];

  useEffect(() => { if (!visible) { setIndex(0); setAnswer(null); setScore(0); } }, [visible]);

  const check = (opt: string) => {
    if (answer !== null) return;
    setAnswer(opt);
    if (opt === q.answer) { setScore((s) => s + 1); speakES("¡Correcto!"); }
    else { speakES("Respuesta incorrecta"); }
  };

  const next = () => {
    if (index < QUIZ.length - 1) { setIndex(index + 1); setAnswer(null); }
    else { speakES(`Has terminado el quiz con ${score} puntos.`); onClose(); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Quiz · からには / 以上(は)</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={{ color: "#111827", fontWeight: "900" }}>
              Pregunta {index + 1} / {QUIZ.length}
            </Text>
            <Text style={[styles.quizStem, { marginTop: 8 }]}>{q.stem}</Text>

            {q.type === "mc" && (
              <View style={{ gap: 8 }}>
                {q.options.map((opt, i) => {
                  const picked = answer === opt;
                  const ok = picked && opt === q.answer;
                  const wrong = picked && opt !== q.answer;
                  return (
                    <Pressable
                      key={i}
                      disabled={answer !== null}
                      onPress={() => check(opt)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: ok ? "#16A34A" : wrong ? "#DC2626" : picked ? "#111827" : "#F3F4F6",
                          borderColor: ok || wrong ? "transparent" : "#E5E7EB",
                        },
                      ]}
                    >
                      <Text style={{ color: ok || wrong ? "#fff" : picked ? "#fff" : "#111", fontWeight: "800" }}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {q.type === "fill" && (
              <View style={{ marginTop: 8 }}>
                <Pressable
                  onPress={() => check(q.answer)}
                  style={[styles.fillBox, { backgroundColor: answer ? "#F9FAFB" : "#fff" }]}
                >
                  <Text style={{ color: "#111827" }}>
                    {answer ? q.stem.replace("__", q.answer) : q.stem}
                  </Text>
                </Pressable>
                {!answer && (
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                    (Toca para ver la respuesta)
                  </Text>
                )}
              </View>
            )}

            {answer && (
              <View style={styles.explBox}>
                <Text style={{ color: "#111827", fontWeight: "900" }}>
                  {answer === q.answer ? "✔ Correcto" : "✖ Incorrecto"}
                </Text>
                <Text style={{ color: "#374151", marginTop: 4 }}>{q.why}</Text>
              </View>
            )}

            <View style={[styles.controlsRow, { marginTop: 16 }]}>
              <Pressable onPress={next} style={styles.ctrlBtn}>
                <MCI name="arrow-right-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Siguiente</Text>
              </Pressable>
              <View style={[styles.ctrlBtnAlt, { gap: 4 }]}>
                <MCI name="star" size={16} color="#111" />
                <Text style={styles.ctrlTxtAlt}>Puntaje: {score}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Styles (alineados con U2) ---------- */
const R = 16;
const styles = StyleSheet.create({
  /* cards base (pantalla) */
  card: {
    backgroundColor: "#121319",
    borderRadius: R,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "900", marginBottom: 8, fontSize: 16 },

  gramTitle: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  li: { color: "rgba(255,255,255,0.94)", marginBottom: 6 },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pillTxt: { color: "#fff", fontWeight: "800" },

  example: {
    backgroundColor: "#0F1117",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 8,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  jp: { color: "#fff", fontWeight: "800", flex: 1, flexWrap: "wrap" },
  es: { color: "rgba(255,255,255,0.92)", marginTop: 6 },
  note: { color: "rgba(255,255,255,0.85)", marginTop: 6, fontSize: 12 },

  /* actividades */
  cardAct: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actTitle: { color: "#fff", fontWeight: "900" },
  actDesc: { color: "rgba(255,255,255,0.9)", marginTop: 2, fontSize: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  /* kanji grid */
  kanjiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  kanjiCell: {
    width: "30.8%",
    backgroundColor: "#0F1117",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  kanjiBig: { color: "#fff", fontSize: 28, fontWeight: "900" },
  kanjiReading: { color: "rgba(255,255,255,0.92)", marginTop: 4 },
  kanjiEs: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: 6,
  },

  /* lista examen (pantalla principal, oscuro) */
  listKanjiHead: { color: "#fff", fontWeight: "900", marginBottom: 6 },
  wordItemRow: {
    backgroundColor: "#0F1117",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  wordJpInline: { color: "#fff", fontWeight: "900" },
  wordReadingInline: { color: "rgba(255,255,255,0.88)", fontSize: 12 },
  wordEsInline: { color: "rgba(255,255,255,0.9)", marginRight: 6 },

  /* modal backdrop */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  /* modal card BLANCO */
  modalCardWhite: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeaderWhite: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  closeBtnLight: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  modalTitleDark: { color: "#111827", fontSize: 22, fontWeight: "900" },
  modalReadingDark: { color: "#1F2937", marginTop: 6 },
  subtleDark: { color: "#6B7280", fontSize: 12, textAlign: "center" },

  /* draw pad */
  drawWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  toolsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toolBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toolTxt: { color: "#fff", fontWeight: "800" },

  /* lista de palabras en modal blanco */
  wordsTitleDark: { color: "#111827", fontWeight: "900", fontSize: 16 },
  wordItemLight: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  wordJpDark: { color: "#111827", fontWeight: "900", marginRight: 8 },
  wordReadingDark: { color: "#4B5563", fontSize: 12, marginRight: 8 },
  wordEsDark: { color: "#111827", flex: 1 },

  /* diálogo / chips / quiz */
  bubble: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  speakerDot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  speakerName: { color: "#1F2937", fontWeight: "900" },
  dramaJP: { color: "#111827", fontSize: 18, fontWeight: "900", marginTop: 6 },
  dramaES: { color: "rgba(17,24,39,0.9)", marginTop: 4 },

  controlsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  ctrlBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctrlTxt: { color: "#fff", fontWeight: "800" },
  ctrlBtnAlt: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctrlTxtAlt: { color: "#111", fontWeight: "800" },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quizStem: { color: "#111827", fontWeight: "900", marginBottom: 8 },
  fillBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  feedbackBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  explBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  /* Gram ref headings */
  sectionH: { color: "#111827", fontWeight: "900", marginTop: 10, marginBottom: 6, fontSize: 16 },
  p: { color: "#111827", marginBottom: 4 },
  kb: { fontWeight: "900", color: "#111827" },
});
