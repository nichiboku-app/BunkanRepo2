// src/screens/N2/N2_B2_U1.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
const accent = "#9B1221"; // B2
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
function ExampleRow({ jp, es, note }: { jp: string; es: string; note?: string }) {
  return (
    <View style={styles.example}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => speakJP(jp)} style={[styles.playBtn, { borderColor: accent }]}>
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
  icon, title, desc, onPress,
}: { icon: keyof typeof MCI.glyphMap; title: string; desc: string; onPress?: () => void }) {
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

// Ajuste fino por kanji (en % del ancho del contenedor). 100 = mitad derecha exacta.
// Sube o baja 1–3 puntos si un kanji queda un pelín descentrado.
const KANJI_RIGHT_BIAS: Record<string, number> = {
  "参": 101, // ejemplo: empuja 1% más a la izquierda si hace falta
  // añade más si ves alguno levemente corrido
};


/* =========================================================
   DRAW PAD — pizarra (SVG) CONTROLADA
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
  const end = () => {
    current.current = "";
  };

  const undo = () => {
    if (strokes.length > 0) setStrokesArray(strokes.slice(0, -1));
  };
  const clear = () => setStrokesArray([]);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={[styles.drawWrap, { width: size, height: size, backgroundColor: "#fff" }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          start(locationX, locationY);
          onDrawingChange?.(true);
        }}
        onResponderMove={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          move(locationX, locationY);
        }}
        onResponderRelease={() => {
          end();
          onDrawingChange?.(false);
        }}
        onResponderTerminate={() => {
          end();
          onDrawingChange?.(false);
        }}
      >
        <Svg width={size} height={size}>
          <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
          <Rect
            x={1.5}
            y={1.5}
            width={size - 3}
            height={size - 3}
            fill="none"
            stroke="#D0D4DA"
            strokeWidth={3}
          />
          {strokes.map((s, i) => (
            <Path
              key={`stroke-${i}`}
              d={s.d}
              fill="none"
              stroke="#111111"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
   KANJI — data + modal (controlado desde el screen)
========================================================= */
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  strokeAsset?: any;
  words: { jp: string; reading: string; es: string }[];
};

/* ---------- 12 kanjis (Keigo) — usando imágenes *_nums.webp ---------- */
const KANJI_12_B2U1: KanjiItem[] = [
  {
    kanji: "尊",
    readingJP: "そん／とうと(い)",
    meaningEs: "respetar / digno",
    strokeAsset: require("../../../assets/kanjivg/n2/05c0a_nums.webp"),
    words: [
      { jp: "尊敬", reading: "そんけい", es: "respeto" },
      { jp: "尊重", reading: "そんちょう", es: "respeto / consideración" },
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
      { jp: "敬具", reading: "けいぐ", es: "atentamente (cierre de carta)" },
    ],
  },
  {
    kanji: "謙",
    readingJP: "けん",
    meaningEs: "humildad",
    strokeAsset: require("../../../assets/kanjivg/n2/08b19_nums.webp"),
    words: [
      { jp: "謙遜", reading: "けんそん", es: "modestia / humildad" },
      { jp: "謙譲語", reading: "けんじょうご", es: "lenguaje humilde" },
      { jp: "謙虚", reading: "けんきょ", es: "modesto / humilde" },
      { jp: "へりくだる", reading: "へりくだる", es: "mostrarse humilde" },
    ],
  },
  {
    kanji: "譲",
    readingJP: "じょう／ゆず(る)",
    meaningEs: "ceder / transferir",
    strokeAsset: require("../../../assets/kanjivg/n2/08b72_nums.webp"),
    words: [
      { jp: "譲渡", reading: "じょうと", es: "transferencia (derechos/prop.)" },
      { jp: "譲歩", reading: "じょうほ", es: "concesión" },
      { jp: "譲る", reading: "ゆずる", es: "ceder / traspasar" },
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
      { jp: "お伺い", reading: "おうかがい", es: "consulta/visita (hum.)" },
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
      { jp: "申す", reading: "もうす", es: "decir (humilde)" },
      { jp: "申し上げる", reading: "もうしあげる", es: "decir/ofrecer (hum.)" },
      { jp: "申請", reading: "しんせい", es: "solicitud (form.)" },
      { jp: "申し込み", reading: "もうしこみ", es: "inscripción / solicitud" },
    ],
  },
  {
    kanji: "致",
    readingJP: "いた(す)",
    meaningEs: "hacer (hum.) / causar",
    strokeAsset: require("../../../assets/kanjivg/n2/081f4_nums.webp"),
    words: [
      { jp: "致す", reading: "いたす", es: "hacer (humilde)" },
      { jp: "一致", reading: "いっち", es: "coincidencia" },
      { jp: "合致", reading: "がっち", es: "concordar / coincidir" },
      { jp: "致命", reading: "ちめい", es: "fatal / letal" },
    ],
  },
  {
    kanji: "存",
    readingJP: "そん",
    meaningEs: "existir / conocer (hum.)",
    strokeAsset: require("../../../assets/kanjivg/n2/05b58_nums.webp"),
    words: [
      { jp: "存じる", reading: "ぞんじる", es: "conocer/saber (hum.)" },
      { jp: "ご存知", reading: "ごぞんじ", es: "saber (hon.)" },
      { jp: "保存", reading: "ほぞん", es: "guardar / conservar" },
      { jp: "存続", reading: "そんぞく", es: "continuar / subsistir" },
    ],
  },
  {
    kanji: "参",
    readingJP: "さん／まい(る)",
    meaningEs: "participar / ir (hum.)",
    strokeAsset: require("../../../assets/kanjivg/n2/053c2_nums.webp"),
    words: [
      { jp: "参る", reading: "まいる", es: "ir/venir (humilde)" },
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
      { jp: "拝見", reading: "はいけん", es: "ver (humilde)" },
      { jp: "拝読", reading: "はいどく", es: "leer (humilde)" },
      { jp: "拝受", reading: "はいじゅ", es: "recibir (humilde)" },
      { jp: "拝啓", reading: "はいけい", es: "Estimado... (inicio carta)" },
    ],
  },
  {
    kanji: "御",
    readingJP: "ご／おん",
    meaningEs: "honorífico (prefijo)",
    strokeAsset: require("../../../assets/kanjivg/n2/05fa1_nums.webp"),
    words: [
      { jp: "御社", reading: "おんしゃ", es: "su empresa (hon.)" },
      { jp: "御中", reading: "おんちゅう", es: "A la atención de (empresas)" },
      { jp: "御礼", reading: "おれい", es: "agradecimiento (formal)" },
      { jp: "ご案内", reading: "ごあんない", es: "anuncio / guía (hon.)" },
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
      { jp: "様々", reading: "さまざま", es: "varios / diverso" },
    ],
  },
];

/* ---------- Kanji Modal (recorte mitad derecha + centrado) ---------- */
function KanjiModal({
  visible,
  onClose,
  data,
  strokes,
  onChangeStrokes,
}: {
  visible: boolean;
  onClose: () => void;
  data: KanjiItem | null;
  strokes: Stroke[];
  onChangeStrokes: (next: Stroke[]) => void;
}) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  if (!data) return null;
  const IMG_SIZE = Math.min(width - 24, 400); // más grande

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

{data.strokeAsset && (
  <View style={{ alignItems: "center", marginTop: 12 }}>
    <View
      style={{
        width: Math.min(width - 24, 640), // más grande
        height: Math.min(width - 24, 640),
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Mostrar solo la MITAD DERECHA del sprite (kanji) y centrarlo */}
      <ExpoImage
        key={data.kanji}
        source={data.strokeAsset}
        style={{
          position: "absolute",
          width: "200%",      // el sprite completo (2 paneles)
          height: "100%",
          left: `-${(KANJI_RIGHT_BIAS[data.kanji] ?? 100)}%`, // -100% = mitad derecha exacta
          top: 0,
        }}
        contentFit="cover"
        priority="high"
      />
    </View>
  </View>
)}





            <View style={{ marginTop: 12 }}>
              <DrawPad
                size={Math.min(width - 32, 330)}
                value={strokes}
                onChange={onChangeStrokes}
                onDrawingChange={(drawing) => setScrollEnabled(!drawing)}
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={styles.wordsTitleDark}>Palabras con「{data.kanji}」</Text>
              {(data.words ?? []).map((w, i) => (
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
   GRAMMAR — Guía rápida (mejorada + tabla 10 verbos)
========================================================= */
type VerbRow = {
  base: string;
  teineigo: string;
  sonkeigo: string;
  kenjogo: string;
  notes?: string;
};
const VERB_TABLE: VerbRow[] = [
  { base: "行く", teineigo: "行きます", sonkeigo: "いらっしゃる／おいでになる", kenjogo: "参る", notes: "来る/行く/いる → いらっしゃる（尊）, 参る（謙）" },
  { base: "来る", teineigo: "来ます", sonkeigo: "いらっしゃる／おいでになる", kenjogo: "参る", notes: "電話や訪問で多用" },
  { base: "いる", teineigo: "います", sonkeigo: "いらっしゃる", kenjogo: "おる", notes: "社内側は『おります』" },
  { base: "する", teineigo: "します", sonkeigo: "なさる", kenjogo: "いたす", notes: "報告・依頼：〜いたします（謙）" },
  { base: "言う", teineigo: "言います", sonkeigo: "おっしゃる", kenjogo: "申す／申し上げる", notes: "自己紹介＝申します；相手の発言＝おっしゃる" },
  { base: "見る", teineigo: "見ます", sonkeigo: "ご覧になる", kenjogo: "拝見する", notes: "資料を拝見する" },
  { base: "食べる／飲む", teineigo: "食べます／飲みます", sonkeigo: "召し上がる", kenjogo: "いただく", notes: "接客の定番" },
  { base: "会う", teineigo: "会います", sonkeigo: "お会いになる", kenjogo: "お目にかかる", notes: "来週お目にかかります" },
  { base: "知っている", teineigo: "知っています", sonkeigo: "ご存じだ", kenjogo: "存じている／存じ上げる", notes: "相手＝ご存じ／自分＝存じております" },
  { base: "聞く／訪ねる", teineigo: "聞きます／訪ねます", sonkeigo: "お聞きになる", kenjogo: "伺う", notes: "質問・訪問＝伺う" },
];

/* — Tabla UI — */
function TableCell({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.td, style]}><Text style={styles.tdTxt}>{children}</Text></View>;
}
function VerbTable() {
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.trHead]}>
        <TableCell style={[styles.th, { flex: 1.1 }]}>Diccionario</TableCell>
        <TableCell style={styles.th}>丁寧語</TableCell>
        <TableCell style={styles.th}>尊敬語</TableCell>
        <TableCell style={styles.th}>謙譲語</TableCell>
        <TableCell style={[styles.th, { flex: 1.3 }]}>Notas</TableCell>
      </View>
      {VERB_TABLE.map((r, i) => (
        <View key={i} style={[styles.tr, i % 2 ? styles.trStriped : null]}>
          <TableCell style={{ flex: 1.1 }}>{r.base}</TableCell>
          <TableCell>{r.teineigo}</TableCell>
          <TableCell>{r.sonkeigo}</TableCell>
          <TableCell>{r.kenjogo}</TableCell>
          <TableCell style={{ flex: 1.3 }}>{r.notes ?? ""}</TableCell>
        </View>
      ))}
    </View>
  );
}

function GramRefModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Guía rápida · Keigo (explicado bien)</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.sectionH}>1) ¿Qué es 敬語 (keigo)?</Text>
            <Text style={styles.p}>Es el <Text style={styles.kb}>conjunto</Text> de formas para hablar con cortesía y respeto en japonés. Incluye:</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>丁寧語 (teineigo)</Text>: forma “bonita” con 〜ます／です. Se usa siempre en contexto formal.</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>尊敬語 (sonkeigo)</Text>: <Text style={styles.kb}>sube</Text> al interlocutor o a personas de estatus alto. Cambia el verbo de la <Text style={styles.kb}>persona de la que hablas</Text>.</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>謙譲語 (kenjōgo)</Text>: <Text style={styles.kb}>te bajas</Text> tú o tu equipo para mostrar modestia; se usa cuando tu acción afecta al otro.</Text>

            <Text style={styles.sectionH}>2) ¿Cuándo usar cada uno?</Text>
            <Text style={styles.p}>• Hablas de <Text style={styles.kb}>tu</Text> acción → <Text style={styles.kb}>謙譲語</Text>（例：私が伺います）</Text>
            <Text style={styles.p}>• Hablas de la acción del <Text style={styles.kb}>cliente/jefe</Text> → <Text style={styles.kb}>尊敬語</Text>（例：社長がいらっしゃいます）</Text>
            <Text style={styles.p}>• Mantén siempre <Text style={styles.kb}>丁寧語</Text> encima (〜ます／です, ございます, でございます).</Text>

            <Text style={styles.sectionH}>3) Reglas de oro</Text>
            <Text style={styles.p}>✔ No mezcles 尊敬語＋謙譲語 para el <Text style={styles.kb}>mismo sujeto</Text>.</Text>
            <Text style={styles.p}>✔ Yo nunca uso 尊敬語 para mí mismo (✖ 私はおっしゃいます).</Text>
            <Text style={styles.p}>✔ Prefijos rápidos: <Text style={styles.kb}>お〜</Text> (nativas) / <Text style={styles.kb}>ご〜</Text> (sinojaponesas).</Text>

            <Text style={styles.sectionH}>4) Tabla de conjugación (10 verbos)</Text>
            <VerbTable />

            <Text style={styles.sectionH}>5) Frases plantillas útiles</Text>
            <ExampleRow jp="（電話）アオイの田中と申します。" es="(Teléfono) Soy Tanaka de Aoi (humilde)." />
            <ExampleRow jp="社長がいらっしゃいます。" es="El presidente está/aquí (respeto)." />
            <ExampleRow jp="資料を拝見しました。" es="He visto los documentos (humilde)." />
            <ExampleRow jp="お手数ですが、ご確認お願いいたします。" es="Disculpe la molestia; por favor revise." />

            <Text style={styles.sectionH}>6) Errores frecuentes</Text>
            <Text style={styles.p}>• Decir <Text style={styles.kb}>おっしゃいます</Text> para mí mismo (✖). Para mí: <Text style={styles.kb}>申します</Text>.</Text>
            <Text style={styles.p}>• Usar <Text style={styles.kb}>拝見</Text> solo (✖). Debe ser <Text style={styles.kb}>拝見する</Text> / <Text style={styles.kb}>拝見しました</Text>.</Text>
            <Text style={styles.p}>• Recordar: <Text style={styles.kb}>いただく</Text> (yo recibo/comer/beber) es 謙譲; <Text style={styles.kb}>召し上がる</Text> es 尊敬.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   MINI DRAMA — Teléfono / visita (5 líneas)
========================================================= */
type DramaLine = { speaker: "A" | "B"; jp: string; es: string };
const DRAMA_SCRIPT: DramaLine[] = [
  { speaker: "A", jp: "お世話になっております。株式会社アオイの田中と申します。", es: "Mucho gusto. Habla Tanaka de Aoi S.A." },
  { speaker: "B", jp: "いつもありがとうございます。鈴木はただいま席を外しております。", es: "Gracias como siempre. Suzuki está fuera de su puesto ahora." },
  { speaker: "A", jp: "後ほど改めて伺いますが、来週の打ち合わせについてご相談したく存じます。", es: "Volveré más tarde; quería consultar sobre la reunión de la próxima semana." },
  { speaker: "B", jp: "承知いたしました。ご希望の日時をお知らせいただけますか。", es: "Entendido. ¿Podría indicar fecha y hora deseadas?" },
  { speaker: "A", jp: "ありがとうございます。では、詳細はメールにてご連絡申し上げます。", es: "Gracias. Entonces le escribiré con los detalles." },
];
function MiniDramaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!visible) {
      setIdx(0);
      Speech.stop();
    }
  }, [visible]);
  const line = DRAMA_SCRIPT[idx];
  const play = () => speakJP(line.jp);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Mini drama · Teléfono/visita</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <View style={{ padding: 16 }}>
            <View style={[styles.bubble, { borderColor: line.speaker === "A" ? "#93C5FD" : "#FCA5A5" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={[styles.speakerDot, { backgroundColor: line.speaker === "A" ? "#3B82F6" : "#EF4444" }]} />
                <Text style={styles.speakerName}>{line.speaker === "A" ? "A（発信者）" : "B（受付）"}</Text>
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
              <Pressable
                onPress={() => setIdx((i) => (i - 1 + DRAMA_SCRIPT.length) % DRAMA_SCRIPT.length)}
                style={styles.ctrlBtn}
              >
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
                <Text style={{ fontWeight: "900" }}>Pista:</Text> A usa 謙譲語（申す／伺う／存じる／申し上げる）, B responde en 丁寧語／尊敬語 según el cliente.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   ROLEPLAY — Elige la forma en Keigo
========================================================= */
type RPScenario = {
  stem: string;
  options: { jp: string; good?: boolean; why: string }[];
};
const RP: RPScenario[] = [
  {
    stem: "（電話）『田中』と（　　）。",
    options: [
      { jp: "申します", good: true, why: "謙譲語（自分を下げる）" },
      { jp: "言います", why: "丁寧語だが, 自己紹介 es más natural con『申します』" },
      { jp: "おっしゃいます", why: "尊敬語（相手）。Para uno mismo no se usa" },
    ],
  },
  {
    stem: "資料は私が（　　）します。",
    options: [
      { jp: "拝見", why: "『拝見する』 para verbalizar. Solo『拝見』 suena cortado" },
      { jp: "確認いたし", why: "Falta completar: 『確認いたします』" },
      { jp: "確認いたします", good: true, why: "謙譲＋丁寧（expresión estándar de negocios）" },
    ],
  },
  {
    stem: "社長が（　　）ので、少々お待ちください。",
    options: [
      { jp: "参る", why: "謙譲語（yo/mi grupo）. Para el presidente va 尊敬語" },
      { jp: "いらっしゃる", good: true, why: "尊敬語：来る/いる/行く → いらっしゃる" },
      { jp: "おります", why: "謙譲（yo/mi lado）. Para el presidente no aplica" },
    ],
  },
];
function RoleplayModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const scn = RP[idx];

  useEffect(() => {
    if (!visible) {
      setIdx(0);
      setPicked(null);
    }
  }, [visible]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const op = scn.options[i];
    if (op.good) speakES("¡Correcto!");
    else speakES(op.why);
  };
  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % RP.length);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Roleplay · Elige la forma</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <View style={[styles.bubble, { borderColor: "#E5E7EB" }]}>
              <Text style={styles.dramaJP}>{scn.stem.replace("(　　)", "（　　）")}</Text>
              <Text style={{ color: "#374151", marginTop: 6, fontSize: 12 }}>
                Selecciona la opción natural en Keigo.
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
                      {op.jp}
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
  { type: "mc", id: 1, stem: "（自己紹介）田中と（　　）。", options: ["申します", "言います", "おっしゃいます"], answer: "申します", why: "Presentarte a ti mismo → 謙譲『申します』。" },
  { type: "mc", id: 2, stem: "（尊敬）社長が（　　）ので、会議室へご案内します。", options: ["参りました", "いらっしゃいました", "伺いました"], answer: "いらっしゃいました", why: "Sujeto de alto estatus → 尊敬『いらっしゃる』。" },
  { type: "fill", id: 3, stem: "資料を__（ver, humilde）", answer: "拝見します", why: "『拝見する』＝（謙譲）ver" },
  { type: "fill", id: 4, stem: "後ほど__（contactar, humilde）", answer: "ご連絡申し上げます", why: "『申し上げる』 para acciones hacia el destinatario." },
];

/* =========================================================
   SCREEN
========================================================= */
export default function N2_B2_U1() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  const [showRef, setShowRef] = useState(false);
  const [showDrama, setShowDrama] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [showKanji, setShowKanji] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiItem | null>(null);

  // ---- Persistencia de trazos por kanji (AsyncStorage) ----
  const STORAGE_KEY = "N2_B2_U1__sketchesByKanji";
  const [sketchesByKanji, setSketchesByKanji] = useState<Record<string, Stroke[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSketchesByKanji(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sketchesByKanji));
      } catch {}
    })();
  }, [sketchesByKanji]);

  const setStrokesForKanji = (kanji: string, next: Stroke[]) => {
    setSketchesByKanji((m) => ({ ...m, [kanji]: next }));
  };

  const examples_sonkeigo = useMemo(
    () => [
      { jp: "社長は会議室にいらっしゃいます。", es: "El presidente está en la sala de juntas.", note: "尊敬語：いる→いらっしゃる" },
      { jp: "ご覧になった資料はいかがでしたか。", es: "¿Qué le parecieron los documentos que vio?", note: "見る→ご覧になる" },
    ],
    []
  );
  const examples_kenjo = useMemo(
    () => [
      { jp: "私が伺いますので、入口でお待ちください。", es: "Iré a verle, por favor espere en la entrada.", note: "行く→伺う（謙譲）" },
      { jp: "田中と申します。初めてご連絡申し上げます。", es: "Soy Tanaka. Es la primera vez que me comunico.", note: "言う→申す／申し上げる" },
    ],
    []
  );
  const examples_teinei = useMemo(
    () => [
      { jp: "明日、資料を送付します。", es: "Mañana enviaré los materiales.", note: "丁寧語（-ます）" },
      { jp: "ご確認をお願いいたします.", es: "Le agradeceré su revisión.", note: "お／ご + 名詞 + いただく（謙譲＋丁寧）" },
    ],
    []
  );

  const openKanji = (k: KanjiItem) => {
    setCurrentKanji(k);
    setShowKanji(true);
  };

  // ✅ KANJIS es el array de kanjis
  const KANJIS = useMemo<KanjiItem[]>(() => KANJI_12_B2U1, []);

  const next = () => {
    const np = Math.min(1, progress + 0.33);
    setProgress(np);
    if (np >= 1) {
      navigation.navigate("CursoN2" as never);
    }
  };

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b2_u1.webp")}
      accent={accent}
      breadcrumb="B2 · U1"
      title="尊敬語・謙譲語・丁寧語"
      subtitle="Keigo práctico para llamadas, correos y visitas de negocio."
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
          <GramLabel kana="そんけいご" kanji="尊敬語" />
          <GramLabel kana="けんじょうご" kanji="謙譲語" />
          <GramLabel kana="ていねいご" kanji="丁寧語" />
        </View>
        <Text style={[styles.li, { marginTop: 10 }]}>Toca ▶ para escuchar cada ejemplo con TTS.</Text>
      </View>

      {/* ===== 尊敬語 ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>① 尊敬語（elevar al interlocutor）</Text>
        {examples_sonkeigo.map((x, i) => (
          <ExampleRow key={i} {...x} />
        ))}
      </View>

      {/* ===== 謙譲語 ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>② 謙譲語（bajarte a ti/tu grupo）</Text>
        {examples_kenjo.map((x, i) => (
          <ExampleRow key={i} {...x} />
        ))}
      </View>

      {/* ===== 丁寧語 ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>③ 丁寧語（-ます／-です + お／ご）</Text>
        {examples_teinei.map((x, i) => (
          <ExampleRow key={i} {...x} />
        ))}
      </View>

      {/* ===== Actividades ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actividades</Text>
        <ActivityCard
          icon="book-information-variant"
          title="Guía rápida"
          desc="Resumen claro, tabla de verbos y fórmulas."
          onPress={() => setShowRef(true)}
        />
        <ActivityCard icon="phone" title="Mini drama" desc="Llamada/visita con Keigo natural." onPress={() => setShowDrama(true)} />
        <ActivityCard icon="account-voice" title="Roleplay" desc="Elige la forma correcta según el contexto." onPress={() => setShowRole(true)} />
        <ActivityCard icon="clipboard-check-outline" title="Quiz" desc="MC + completar (correos reales)." onPress={() => setShowQuiz(true)} />
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
            <Text style={styles.listKanjiHead}>
              「{k.kanji}」 {k.readingJP} — {k.meaningEs}
            </Text>
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
      <KanjiModal
        visible={showKanji}
        onClose={() => setShowKanji(false)}
        data={currentKanji}
        strokes={currentKanji ? sketchesByKanji[currentKanji.kanji] ?? [] : []}
        onChangeStrokes={(next) => {
          if (currentKanji) setStrokesForKanji(currentKanji.kanji, next);
        }}
      />
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

  useEffect(() => {
    if (!visible) {
      setIndex(0);
      setAnswer(null);
      setScore(0);
    }
  }, [visible]);

  const check = (opt: string) => {
    if (answer !== null) return;
    setAnswer(opt);
    if (opt === q.answer) {
      setScore((s) => s + 1);
      speakES("¡Correcto!");
    } else {
      speakES("Respuesta incorrecta");
    }
  };

  const next = () => {
    if (index < QUIZ.length - 1) {
      setIndex(index + 1);
      setAnswer(null);
    } else {
      speakES(`Has terminado el quiz con ${score} puntos.`);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Quiz · Keigo</Text>
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
                  <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>(Toca para ver la respuesta)</Text>
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

/* ---------- Styles ---------- */
const R = 16;
const styles = StyleSheet.create({
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

  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
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
  kanjiEs: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2, textAlign: "center", paddingHorizontal: 6 },

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

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },

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

  drawWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  toolsRow: { flexDirection: "row", gap: 12, marginTop: 10, alignItems: "center", justifyContent: "center" },
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

  bubble: { borderWidth: 2, borderRadius: 16, padding: 12, backgroundColor: "#fff", marginTop: 8 },
  speakerDot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  speakerName: { color: "#1F2937", fontWeight: "900" },
  dramaJP: { color: "#111827", fontSize: 18, fontWeight: "900", marginTop: 6 },
  dramaES: { color: "rgba(17,24,39,0.9)", marginTop: 4 },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },
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

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  quizStem: { color: "#111827", fontWeight: "900", marginBottom: 8 },
  fillBox: { backgroundColor: "#fff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  feedbackBox: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  explBox: { backgroundColor: "#F3F4F6", borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "#E5E7EB" },

  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  tr: { flexDirection: "row", alignItems: "stretch" },
  trHead: { backgroundColor: "#F3F4F6", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  trStriped: { backgroundColor: "#FAFAFA" },
  th: { flex: 1, paddingVertical: 8, paddingHorizontal: 8 },
  td: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: "#E5E7EB" },
  tdTxt: { color: "#111827" },

  sectionH: { color: "#111827", fontWeight: "900", marginTop: 10, marginBottom: 6 },
  p: { color: "#1F2937", marginBottom: 6, lineHeight: 20 },
  kb: { fontWeight: "900", color: "#111827" },
});
