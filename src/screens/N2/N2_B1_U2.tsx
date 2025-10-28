// src/screens/N2/N2_B1_U2.tsx
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

const KANJI_12_U2: KanjiItem[] = [
  {
    kanji: "原",
    readingJP: "げん",
    meaningEs: "origen / causa",
    strokeAsset: require("../../../assets/kanjivg/n2/0539f_nums.webp"),
    words: [
      { jp: "原因", reading: "げんいん", es: "causa" },
      { jp: "原則", reading: "げんそく", es: "principio / regla" },
      { jp: "原料", reading: "げんりょう", es: "materia prima" },
      { jp: "野原", reading: "のはら", es: "pradera / campo" },
    ],
  },
  {
    kanji: "因",
    readingJP: "いん",
    meaningEs: "motivo / razón",
    strokeAsset: require("../../../assets/kanjivg/n2/056e0_nums.webp"),
    words: [
      { jp: "要因", reading: "よういん", es: "factor" },
      { jp: "因果", reading: "いんが", es: "causa y efecto" },
      { jp: "死因", reading: "しいん", es: "causa de muerte" },
      { jp: "原因", reading: "げんいん", es: "causa (término afín)" },
    ],
  },
  {
    kanji: "結",
    readingJP: "けつ",
    meaningEs: "unir / concluir",
    strokeAsset: require("../../../assets/kanjivg/n2/07d50_nums.webp"),
    words: [
      { jp: "結果", reading: "けっか", es: "resultado" },
      { jp: "結論", reading: "けつろん", es: "conclusión" },
      { jp: "結婚", reading: "けっこん", es: "matrimonio" },
      { jp: "結ぶ", reading: "むすぶ", es: "atar / concluir" },
    ],
  },
  {
    kanji: "果",
    readingJP: "か",
    meaningEs: "fruto / efecto",
    strokeAsset: require("../../../assets/kanjivg/n2/0679c_nums.webp"),
    words: [
      { jp: "成果", reading: "せいか", es: "resultado / logro" },
      { jp: "果たす", reading: "はたす", es: "cumplir / realizar" },
      { jp: "果物", reading: "くだもの", es: "fruta" },
      { jp: "効果", reading: "こうか", es: "efecto (afinidad con 効)" },
    ],
  },
  {
    kanji: "功",
    readingJP: "こう",
    meaningEs: "mérito / logro",
    strokeAsset: require("../../../assets/kanjivg/n2/0529f_nums.webp"),
    words: [
      { jp: "成功", reading: "せいこう", es: "éxito" },
      { jp: "功績", reading: "こうせき", es: "mérito / logros" },
      { jp: "功労", reading: "こうろう", es: "servicios meritorios" },
      { jp: "有功者", reading: "ゆうこうしゃ", es: "persona meritoria" },
    ],
  },
  {
    kanji: "失",
    readingJP: "しつ",
    meaningEs: "perder / error",
    strokeAsset: require("../../../assets/kanjivg/n2/05931_nums.webp"),
    words: [
      { jp: "失敗", reading: "しっぱい", es: "fracaso / error" },
      { jp: "失礼", reading: "しつれい", es: "descortesía / disculpe" },
      { jp: "失業", reading: "しつぎょう", es: "desempleo" },
      { jp: "喪失", reading: "そうしつ", es: "pérdida" },
    ],
  },
  {
    kanji: "敗",
    readingJP: "はい",
    meaningEs: "derrota",
    strokeAsset: require("../../../assets/kanjivg/n2/06557_nums.webp"),
    words: [
      { jp: "敗北", reading: "はいぼく", es: "derrota" },
      { jp: "惨敗", reading: "ざんぱい", es: "derrota aplastante" },
      { jp: "敗者", reading: "はいしゃ", es: "perdedor" },
      { jp: "勝敗", reading: "しょうはい", es: "victoria o derrota" },
    ],
  },
  {
    kanji: "努",
    readingJP: "ど",
    meaningEs: "esfuerzo",
    strokeAsset: require("../../../assets/kanjivg/n2/052aa_nums.webp"),
    words: [
      { jp: "努力", reading: "どりょく", es: "esfuerzo" },
      { jp: "努める", reading: "つとめる", es: "esforzarse" },
      { jp: "努めて", reading: "つとめて", es: "en lo posible" },
      { jp: "奮努", reading: "ふんど", es: "gran esfuerzo" },
    ],
  },
  {
    kanji: "力",
    readingJP: "りょく",
    meaningEs: "fuerza / capacidad",
    strokeAsset: require("../../../assets/kanjivg/n2/0529b_nums.webp"),
    words: [
      { jp: "能力", reading: "のうりょく", es: "capacidad / habilidad" },
      { jp: "協力", reading: "きょうりょく", es: "cooperación" },
      { jp: "体力", reading: "たいりょく", es: "fuerza física" },
      { jp: "影響力", reading: "えいきょうりょく", es: "poder de influencia" },
    ],
  },
  {
    kanji: "影",
    readingJP: "えい",
    meaningEs: "sombra / influencia",
    strokeAsset: require("../../../assets/kanjivg/n2/05f71_nums.webp"),
    words: [
      { jp: "影響", reading: "えいきょう", es: "influencia / impacto" },
      { jp: "影", reading: "かげ", es: "sombra" },
      { jp: "面影", reading: "おもかげ", es: "semblanza" },
      { jp: "影響力", reading: "えいきょうりょく", es: "poder de influencia" },
    ],
  },
  {
    kanji: "響",
    readingJP: "きょう",
    meaningEs: "resonar / afectar",
    strokeAsset: require("../../../assets/kanjivg/n2/097ff_nums.webp"),
    words: [
      { jp: "影響", reading: "えいきょう", es: "influencia / efecto" },
      { jp: "響く", reading: "ひびく", es: "resonar / repercutir" },
      { jp: "反響", reading: "はんきょう", es: "repercusión / eco" },
      { jp: "音響", reading: "おんきょう", es: "acústica / sonoridad" },
    ],
  },
  {
    kanji: "効",
    readingJP: "こう",
    meaningEs: "efecto / eficacia",
    strokeAsset: require("../../../assets/kanjivg/n2/052b9_nums.webp"),
    words: [
      { jp: "効果", reading: "こうか", es: "efecto / eficacia" },
      { jp: "有効", reading: "ゆうこう", es: "válido / eficaz" },
      { jp: "無効", reading: "むこう", es: "inválido" },
      { jp: "効率", reading: "こうりつ", es: "eficiencia" },
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
   GRAMMAR — Guía rápida (modal)
========================================================= */
function GramRefModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardWhite}>
          <View style={styles.modalHeaderWhite}>
            <Text style={styles.modalTitleDark}>Guía rápida · せいで・おかげで・ために</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.sectionH}>1) ¿Cuál elijo?</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>〜せいで</Text> → <Text style={styles.kb}>negativo / culpa</Text>. Resultado indeseado.</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>〜おかげで</Text> → <Text style={styles.kb}>positivo / agradecimiento</Text>. Causa beneficiosa.</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>〜ために</Text> → <Text style={styles.kb}>neutral (causa)</Text> o <Text style={styles.kb}>finalidad</Text> (con V intencional).</Text>

            <Text style={styles.sectionH}>2) Patrones</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>N + のせいで</Text> ／ <Text style={styles.kb}>V-た/辞書形 + せいで</Text></Text>
            <ExampleRow jp="雨のせいで、試合は中止になった。" es="Por la lluvia, el partido se canceló." />
            <Text style={[styles.p,{marginTop:6}]}>• <Text style={styles.kb}>N + のおかげで</Text> ／ <Text style={styles.kb}>V-た + おかげで</Text></Text>
            <ExampleRow jp="皆さんのご協力のおかげで、成功しました。" es="Gracias a su cooperación, tuvimos éxito." />
            <Text style={[styles.p,{marginTop:6}]}>• <Text style={styles.kb}>N + のために</Text> ／ <Text style={styles.kb}>V-た/辞書形 + ために</Text>（causa）</Text>
            <ExampleRow jp="台風のために、学校は休校になった。" es="Debido al tifón, se suspendieron clases." />
            <Text style={styles.p}>• <Text style={styles.kb}>V-辞書形 + ために</Text> ／ <Text style={styles.kb}>N + のために</Text>（propósito）</Text>
            <ExampleRow jp="渋滞を避けるために、早めに出発した。" es="Para evitar el tráfico, salí temprano." />

            <Text style={styles.sectionH}>3) Registro y cortesía</Text>
            <Text style={styles.p}>• Evita culpar personas con <Text style={styles.kb}>〜せいで</Text> en correos. Suaviza con <Text style={styles.kb}>影響で／事情により／不具合により</Text>.</Text>
            <Text style={styles.p}>• Fórmula fija: <Text style={styles.kb}>おかげさまで</Text> (agradecimiento cortés).</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>〜ために</Text> es seguro en avisos neutros; con V intencional = propósito.</Text>

            <Text style={styles.sectionH}>4) Conexiones</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>〜ので／〜から</Text> (causa neutra conversacional) &lt; carga que せいで/おかげで.</Text>
            <ExampleRow jp="雨なので、試合は中止です。" es="Como llueve, el partido se cancela." />
            <Text style={styles.p}>• <Text style={styles.kb}>〜によって</Text>: causa formal/técnica.</Text>
            <ExampleRow jp="台風によって、被害が出た。" es="Hubo daños a causa del tifón." />
            <Text style={styles.p}>• <Text style={styles.kb}>〜ように</Text> (resultado fuera de control) vs <Text style={styles.kb}>〜ために</Text> (propósito con control).</Text>

            <Text style={styles.sectionH}>5) Errores típicos</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>おかげで</Text> con resultado negativo (✖) → usa <Text style={styles.kb}>せいで／影響で</Text>.</Text>
            <Text style={styles.p}>• <Text style={styles.kb}>Nのために</Text> ambiguo (causa/propósito) → desambigua por contexto o alternativas.</Text>

            <Text style={styles.sectionH}>6) Checklist rápido</Text>
            <Text style={styles.p}>① ¿Resultado bueno? → <Text style={styles.kb}>おかげで</Text></Text>
            <Text style={styles.p}>② ¿Molestia/culpa? → <Text style={styles.kb}>せいで</Text>（o <Text style={styles.kb}>影響で</Text> suave）</Text>
            <Text style={styles.p}>③ ¿Aviso neutral? → <Text style={styles.kb}>ために</Text>（causa）</Text>
            <Text style={styles.p}>④ ¿Propósito? → <Text style={styles.kb}>V辞書形 + ために</Text></Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   MINI DRAMA — correo de disculpa por retraso
========================================================= */
type DramaLine = { speaker: "A" | "B"; jp: string; es: string };
const DRAMA_SCRIPT: DramaLine[] = [
  {
    speaker: "A",
    jp: "昨晩のシステム障害のせいで、今朝の提出が遅れました。申し訳ありません。",
    es: "Por la falla del sistema anoche, se retrasó la entrega de esta mañana. Disculpe.",
  },
  {
    speaker: "B",
    jp: "状況は理解しました。復旧作業のために、優先タスクを入れ替えましょう。",
    es: "Entiendo la situación. Para la restauración, cambiemos las prioridades.",
  },
  {
    speaker: "A",
    jp: "サポートの迅速な対応のおかげで、主要機能は復旧しました。",
    es: "Gracias a la respuesta rápida de soporte, las funciones principales ya están restauradas.",
  },
  {
    speaker: "B",
    jp: "では、影響範囲を整理して、取引先に説明します。",
    es: "Entonces, ordenemos el alcance del impacto y expliquemos al cliente.",
  },
  {
    speaker: "A",
    jp: "再発防止のために、手順を見直して文書化します。",
    es: "Para evitar que ocurra de nuevo, revisaremos y documentaremos el procedimiento.",
  },
];

function MiniDramaModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
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
            <Text style={styles.modalTitleDark}>Mini drama · Correo de disculpa</Text>
            <Pressable onPress={onClose} style={styles.closeBtnLight}>
              <MCI name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <View style={{ padding: 16 }}>
            <View style={[styles.bubble, { borderColor: line.speaker === "A" ? "#93C5FD" : "#FCA5A5" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={[styles.speakerDot, { backgroundColor: line.speaker === "A" ? "#3B82F6" : "#EF4444" }]} />
                <Text style={styles.speakerName}>{line.speaker === "A" ? "A（担当者）" : "B（上司）"}</Text>
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
                <Text style={{ fontWeight: "900" }}>Pista:</Text> せいで = negativo/culpa · おかげで = positivo/agradecimiento · ために = causa neutra/intencionalidad.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   ROLEPLAY — ¿Culpar, agradecer o neutral?
========================================================= */
type RPScenario = {
  context: string; // ES
  jpBase: string; // frase con ___
  options: { tag: "せいで" | "おかげで" | "ために"; good?: boolean; why: string }[];
  solution: "せいで" | "おかげで" | "ために";
};
const RP: RPScenario[] = [
  {
    context: "Presentación salió bien gracias a soporte del equipo.",
    jpBase: "チームのサポート___、発表はうまくいきました。",
    options: [
      { tag: "せいで", why: "‘culpa de’ (negativo) — no encaja con éxito." },
      { tag: "おかげで", why: "Agradecimiento/positivo — perfecto.", good: true },
      { tag: "ために", why: "Causa neutral; aquí mejor expresar gratitud." },
    ],
    solution: "おかげで",
  },
  {
    context: "Reunión se retrasó por tráfico pesado.",
    jpBase: "渋滞___、会議の開始が遅れました。",
    options: [
      { tag: "せいで", why: "Culpa/impacto negativo — correcto.", good: true },
      { tag: "おかげで", why: "Agradecer por retraso — no." },
      { tag: "ために", why: "Posible, pero せいで marca mejor el matiz negativo." },
    ],
    solution: "せいで",
  },
  {
    context: "Paramos el sistema para mantenimiento (intencional).",
    jpBase: "保守作業を実施する___、一時的にシステムを停止します。",
    options: [
      { tag: "せいで", why: "Culpa — no hay juicio negativo aquí." },
      { tag: "おかげで", why: "Agradecimiento — no aplica." },
      { tag: "ために", why: "Finalidad/causa neutral — correcto.", good: true },
    ],
    solution: "ために",
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
    if (!visible) {
      setIdx(0);
      setPicked(null);
    }
  }, [visible]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const op = scn.options[i];
    if (op.good) speakES("¡Bien! Matiz correcto.");
    else speakES("Casi. Revisa el matiz (positivo/negativo/neutral).");
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
            <Text style={styles.modalTitleDark}>Roleplay · Matiz correcto</Text>
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
                Elige la partícula adecuada para completar.
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
                    <Text
                      style={{
                        color: ok || bad ? "#fff" : isMe ? "#fff" : "#111",
                        fontWeight: "800",
                      }}
                    >
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
                <Text style={{ color: "#374151", marginTop: 4 }}>
                  {scn.options[picked].why}
                </Text>
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
  {
    type: "mc",
    id: 1,
    stem: "大雨___、本日の配送に遅れが出ています。",
    options: ["せいで", "おかげで", "ために"],
    answer: "せいで",
    why: "Impacto negativo (retraso) → せいで.",
  },
  {
    type: "mc",
    id: 2,
    stem: "皆様のご協力___、イベントは無事終了しました。",
    options: ["せいで", "おかげで", "ために"],
    answer: "おかげで",
    why: "Agradecimiento por resultado positivo → おかげで.",
  },
  {
    type: "mc",
    id: 3,
    stem: "システム移行作業実施___、22時から0時まで停止します。",
    options: ["せいで", "おかげで", "ために"],
    answer: "ために",
    why: "Aviso técnico/operativo con finalidad/causa neutral → ために.",
  },
  {
    type: "fill",
    id: 4,
    stem: "新機能が安定した__、サポート窓口への問い合わせが減りました。（gracias a）",
    answer: "おかげで",
    why: "Resultado positivo atribuido a causa benéfica.",
  },
  {
    type: "fill",
    id: 5,
    stem: "担当者の手違い__、請求書の発行が遅れました。（por culpa de）",
    answer: "のせいで",
    why: "Forma sustantivada ‘のせいで’ (culpa).",
  },
  {
    type: "fill",
    id: 6,
    stem: "安全性を高める__、手順を一部変更します。（con el fin de / debido a）",
    answer: "ために",
    why: "Intencionalidad/causa neutral → ために.",
  },
];

function QuizModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
            <Text style={styles.modalTitleDark}>Quiz · せいで / おかげで / ために</Text>
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

/* =========================================================
   SCREEN
========================================================= */
export default function N2_B1_U2() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  const [showDrama, setShowDrama] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [showRef, setShowRef] = useState(false);
  const [showKanji, setShowKanji] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiItem | null>(null);

  const examples_1 = useMemo(
    () => [
      {
        jp: "雨のせいで、試合は中止になりました。",
        es: "Por culpa de la lluvia, el partido se canceló.",
        note: "せいで añade juicio negativo (culpa/impacto desfavorable).",
      },
      { jp: "彼のミスのせいで、作業が遅れた。", es: "Por su error, el trabajo se retrasó." },
      { jp: "交通事故のせいで、道路が混雑している。", es: "Por el accidente, la carretera está congestionada." },
    ],
    []
  );

  const examples_2 = useMemo(
    () => [
      {
        jp: "皆さんのご協力のおかげで、無事に成功しました。",
        es: "Gracias a su cooperación, salió bien.",
        note: "おかげで expresa gratitud (resultado positivo).",
      },
      { jp: "薬を飲んだおかげで、熱が下がった。", es: "Gracias a la medicina, bajó la fiebre." },
      { jp: "経験豊富な先輩のおかげで、早く慣れました。", es: "Gracias al senpai con experiencia, me acostumbré rápido." },
    ],
    []
  );

  const examples_3 = useMemo(
    () => [
      {
        jp: "渋滞を避けるために、早めに出発した。",
        es: "Salí temprano para evitar el tráfico.",
        note: "ために puede ser causa/finalidad neutral (con verbo intencional).",
      },
      { jp: "台風の接近のために、学校は休校になった。", es: "Debido a la cercanía del tifón, se suspendieron clases." },
      { jp: "健康のために、毎日歩いています。", es: "Camino todos los días por mi salud." },
    ],
    []
  );

  const openKanji = (k: KanjiItem) => { setCurrentKanji(k); setShowKanji(true); };

  const next = () => {
    const np = Math.min(1, progress + 0.33);
    setProgress(np);
    if (np >= 1) {
      navigation.navigate("CursoN2" as never);
    }
  };

  const KANJIS = useMemo(() => KANJI_12_U2, []);

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b1_u2.webp")}
      accent={accent}
      breadcrumb="B1 · U2"
      title="〜せいで・〜おかげで・〜ために"
      subtitle="‘Por culpa de / gracias a / debido a’: elige el matiz adecuado en contextos formales."
      outcomes={[
        "Diferenciar matices negativo/positivo/neutral",
        "Usarlas con naturalidad en correos y reuniones",
        "Conectar con ので／から／によって／ように",
      ]}
      dynamics={[
        "Mini drama: correo de disculpa por retraso",
        "Roleplay: dar crédito vs responsabilizar",
        "Quiz: titulares y avisos reales",
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
          <GramLabel kana="せいで" kanji="所為で" />
          <GramLabel kana="おかげで" kanji="御蔭で" />
          <GramLabel kana="ために" kanji="為に" />
        </View>
        <Text style={[styles.li, { marginTop: 10 }]}>
          Toca ▶ para escuchar cada ejemplo con TTS.
        </Text>
      </View>

      {/* ===== ① せいで ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>① 〜せいで</Text>
        <Text style={styles.li}>
          Matiz negativo/culpa. Se usa cuando la causa trajo un resultado desfavorable o molesto.
        </Text>
        {examples_1.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== ② おかげで ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>② 〜おかげで</Text>
        <Text style={styles.li}>
          Matiz positivo/agradecimiento. Se atribuye el buen resultado a la causa.
        </Text>
        {examples_2.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== ③ ために ===== */}
      <View style={styles.card}>
        <Text style={styles.gramTitle}>③ 〜ために</Text>
        <Text style={styles.li}>
          Causa o finalidad en registro formal/neutro. Con verbos intencionales, suele leerse como “con el fin de…”.
        </Text>
        {examples_3.map((x, i) => (<ExampleRow key={i} {...x} />))}
      </View>

      {/* ===== Actividades ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actividades</Text>
        <ActivityCard icon="book-information-variant" title="Guía rápida" desc="Resumen con formas, matices y conexiones." onPress={() => setShowRef(true)} />
        <ActivityCard icon="email-edit-outline" title="Mini drama" desc="Correo de disculpa por retraso (sin auto-play)." onPress={() => setShowDrama(true)} />
        <ActivityCard icon="account-voice" title="Roleplay" desc="Elige el matiz correcto según el contexto." onPress={() => setShowRole(true)} />
        <ActivityCard icon="clipboard-check-outline" title="Quiz" desc="Titulares y avisos reales." onPress={() => setShowQuiz(true)} />
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
      <QuizModal visible={showQuiz} onClose={() => setShowQuiz(false)} />
    </UnitTemplate>
  );
}

/* ---------- Styles ---------- */
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
