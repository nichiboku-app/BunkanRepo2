// src/screens/N2/N2_B1_U1.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import UnitTemplate from "./UnitTemplate";

/* =========================================================
   Setup
========================================================= */
const { width } = Dimensions.get("window");
const accent = "#C01E2E"; // rojo elegante (B1)
const PROGRESS_KEY = "progress:N2_B1_U1";

function safeSpeak(lang: string, text?: string, opts?: Speech.SpeechOptions) {
  if (!text) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: lang, ...opts });
  } catch {}
}
const speakJP = (t?: string) => safeSpeak("ja-JP", t, { rate: 0.98, pitch: 1.02 });
const speakES = (t?: string) => safeSpeak("es-MX", t, { rate: 1.0, pitch: 1.0 });

/* =========================================================
   Tipos
========================================================= */
type Word = { jp: string; reading: string; es: string };
type Ex = { jp: string; reading: string; es: string; tag: "わけではない" | "とは限らない" | "に違いない" };
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  hex?: string;
  strokeAsset?: any;
  words?: Word[];
};

/* =========================================================
   Kanjis (sin 理) — usa tus *_nums.webp en assets/kanjivg/n2
========================================================= */
const STROKE_ASSETS: Record<string, any> = {
  "7537": require("../../../assets/kanjivg/n2/7537_nums.webp"), // 男
  "597d": require("../../../assets/kanjivg/n2/597d_nums.webp"), // 好
  "96e3": require("../../../assets/kanjivg/n2/96e3_nums.webp"), // 千
  "5fc5": require("../../../assets/kanjivg/n2/5fc5_nums.webp"), // 必
  "7136": require("../../../assets/kanjivg/n2/7136_nums.webp"), // 然
  "8a3c": require("../../../assets/kanjivg/n2/8a3c_nums.webp"), // 証
  "78ba": require("../../../assets/kanjivg/n2/78ba_nums.webp"), // 確
  "7591": require("../../../assets/kanjivg/n2/7591_nums.webp"), // 疑
  "5b9a": require("../../../assets/kanjivg/n2/5b9a_nums.webp"), // 定
  "610f": require("../../../assets/kanjivg/n2/610f_nums.webp"), // 意
  "898b": require("../../../assets/kanjivg/n2/898b_nums.webp"), // 見
};

function createKanji(
  kanji: string,
  readingJP: string,
  meaningEs: string,
  hex?: string,
  words: Word[] = []
): KanjiItem {
  const normalizedHex = hex ? hex.replace(/^0+/, "").toLowerCase() : undefined;
  const strokeAsset = normalizedHex ? STROKE_ASSETS[normalizedHex] : undefined;
  return { kanji, readingJP, meaningEs, hex: normalizedHex, strokeAsset, words };
}
const KANJIS: KanjiItem[] = [
  // 男
  createKanji("男", "おとこ／だん", "hombre", "7537", [
    { jp: "男性", reading: "だんせい", es: "hombre (sexo masculino)" },
    { jp: "男子", reading: "だんし", es: "varón; chico" },
    { jp: "長男", reading: "ちょうなん", es: "hijo mayor" },
    { jp: "男友達", reading: "おとこともだち", es: "amigo (varón)" },
    { jp: "男子校", reading: "だんしこう", es: "escuela de varones" },
  ]),

  // 好
  createKanji("好", "す(き)／こう", "gustar", "597d", [
    { jp: "好き", reading: "すき", es: "gustar; favorito" },
    { jp: "好物", reading: "こうぶつ", es: "comida favorita" },
    { jp: "好印象", reading: "こういんしょう", es: "buena impresión" },
    { jp: "好条件", reading: "こうじょうけん", es: "buenas condiciones" },
    { jp: "好調", reading: "こうちょう", es: "buen rendimiento" },
  ]),

  // 千
  createKanji("千", "せん", "mil", "96e3", [
    { jp: "千円", reading: "せんえん", es: "mil yenes" },
    { jp: "千羽鶴", reading: "せんばづる", es: "mil grullas (origami)" },
    { jp: "千年", reading: "せんねん", es: "mil años; milenio" },
    { jp: "数千", reading: "すうせん", es: "varios miles" },
    { jp: "千人", reading: "せんにん", es: "mil personas" },
  ]),

  // 必
  createKanji("必", "ひつ", "necesario", "5fc5", [
    { jp: "必要", reading: "ひつよう", es: "necesario; necesidad" },
    { jp: "必勝", reading: "ひっしょう", es: "victoria segura" },
    { jp: "必修", reading: "ひっしゅう", es: "obligatorio (curso)" },
    { jp: "必死", reading: "ひっし", es: "desesperado; a muerte" },
    { jp: "必然", reading: "ひつぜん", es: "inevitabilidad" },
  ]),

  // 然
  createKanji("然", "ぜん", "así; natural", "7136", [
    { jp: "自然", reading: "しぜん", es: "naturaleza" },
    { jp: "当然", reading: "とうぜん", es: "por supuesto; natural" },
    { jp: "天然", reading: "てんねん", es: "natural (no artificial)" },
    { jp: "全然", reading: "ぜんぜん", es: "(no) en absoluto / totalmente*" },
    { jp: "公然", reading: "こうぜん", es: "público; abierto" },
  ]),

  // 証
  createKanji("証", "しょう", "prueba", "8a3c", [
    { jp: "証明", reading: "しょうめい", es: "demostración; comprobación" },
    { jp: "保証", reading: "ほしょう", es: "garantía (responsabilidad/seguro)" },
    { jp: "証拠", reading: "しょうこ", es: "evidencia; prueba" },
    { jp: "証言", reading: "しょうげん", es: "testimonio" },
    { jp: "証券", reading: "しょうけん", es: "valores; títulos" },
  ]),

  // 確
  createKanji("確", "かく", "seguro", "78ba", [
    { jp: "確認", reading: "かくにん", es: "confirmación" },
    { jp: "正確", reading: "せいかく", es: "preciso; exacto" },
    { jp: "確率", reading: "かくりつ", es: "probabilidad" },
    { jp: "確保", reading: "かくほ", es: "aseguramiento; reserva" },
    { jp: "確信", reading: "かくしん", es: "convicción" },
  ]),

  // 疑
  createKanji("疑", "ぎ", "duda", "7591", [
    { jp: "疑問", reading: "ぎもん", es: "duda; cuestión" },
    { jp: "疑念", reading: "ぎねん", es: "sospecha; recelo" },
    { jp: "容疑", reading: "ようぎ", es: "sospecha (delito)" },
    { jp: "疑惑", reading: "ぎわく", es: "sospecha; escándalo" },
    { jp: "半信半疑", reading: "はんしんはんぎ", es: "con dudas; escéptico" },
  ]),

  // 定
  createKanji("定", "てい／さだ(める)", "fijar; decidir", "5b9a", [
    { jp: "決定", reading: "けってい", es: "decisión" },
    { jp: "定義", reading: "ていぎ", es: "definición" },
    { jp: "一定", reading: "いってい", es: "constante; fijo" },
    { jp: "予定", reading: "よてい", es: "plan; agenda" },
    { jp: "定価", reading: "ていか", es: "precio fijo" },
  ]),

  // 意
  createKanji("意", "い", "intención; idea", "610f", [
    { jp: "意見", reading: "いけん", es: "opinión" },
    { jp: "意識", reading: "いしき", es: "conciencia" },
    { jp: "意図", reading: "いと", es: "intención" },
    { jp: "決意", reading: "けつい", es: "determinación" },
    { jp: "意外", reading: "いがい", es: "inesperado; sorprendente" },
  ]),

  // 見
  createKanji("見", "み(る)／けん", "ver", "898b", [
    { jp: "見学", reading: "けんがく", es: "visita de estudio/inspección" },
    { jp: "発見", reading: "はっけん", es: "descubrimiento" },
    { jp: "見本", reading: "みほん", es: "muestra; ejemplar" },
    { jp: "見直す", reading: "みなおす", es: "revisar; reconsiderar" },
    { jp: "見解", reading: "けんかい", es: "punto de vista; opinión" },
  ]),
];


/* =========================================================
   Guía rápida — español + unión y diferencias
   Tema: 〜わけではない / 〜とは限らない / 〜に違いない
========================================================= */
const QUICK = [
  {
    title: "〜わけではない",
    lines: [
      "Significa: “no es que…”, “no necesariamente…”. Niega una interpretación absoluta.",
      "i-adjetivo:  高い わけではない。",
      "na-adjetivo:  便利 な わけではない。 (usa な antes de わけではない)",
      "Sustantivo:  先生 な わけではない。 (sustantivo + な + わけではない)",
      "Verbo (forma simple): 行く わけではない／行った わけではない。",
      "Matiz: corrige la generalización; NO significa “para nada”.",
    ],
    color: "#EF4444",
    examples: [
      {
        jp: "高いからといって、品質が良いわけではない。",
        reading: "たかい から といって、ひんしつ が よい わけではない。",
        es: "Que sea caro no significa que tenga buena calidad.",
      },
      {
        jp: "日本人でも、皆が敬語が上手なわけではない。",
        reading: "にほんじん でも、みなが けいご が じょうず な わけではない。",
        es: "Incluso siendo japonés, no todos dominan el keigo.",
      },
      {
        jp: "静かだから集中できるわけではない。",
        reading: "しずか だから しゅうちゅう できる わけではない。",
        es: "Que esté silencioso no implica que puedas concentrarte.",
      },
    ],
  },
  {
    title: "〜とは限らない",
    lines: [
      "Significa: “no siempre…”, “no necesariamente…”. Indica que hay excepciones.",
      "i-adjetivo:  高い とは限らない。",
      "na-adjetivo:  便利(だ) とは限らない。 (だ suele omitirse en habla)",
      "Sustantivo:  先生(だ) とは限らない。",
      "Verbo (forma simple): 行く とは限らない。",
      "Matiz: idea estadística/empírica: existen casos que no cumplen.",
    ],
    color: "#F59E0B",
    examples: [
      {
        jp: "安いからといって、悪いとは限らない。",
        reading: "やすい から といって、わるい とは かぎらない。",
        es: "Que sea barato no siempre significa que sea malo.",
      },
      {
        jp: "大きい会社が安心(だ)とは限らない。",
        reading: "おおきい かいしゃ が あんしん だ と は かぎらない。",
        es: "Una empresa grande no siempre es sinónimo de seguridad.",
      },
      {
        jp: "新製品が前より優れているとは限らない。",
        reading: "しんせいひん が まえ より すぐれて いる と は かぎらない。",
        es: "Un producto nuevo no necesariamente es mejor que el anterior.",
      },
    ],
  },
  {
    title: "〜に違いない",
    lines: [
      "Significa: “seguro que…”, “sin duda…”. Deducción fuerte del hablante.",
      "i-adjetivo:  高い に違いない。",
      "na-adjetivo:  便利(だ) に違いない。 (だ puede omitirse)",
      "Sustantivo:  先生(だ) に違いない。",
      "Verbo (forma simple): 行く に違いない。",
      "Matiz: alta certeza subjetiva; no necesariamente evidencia objetiva.",
    ],
    color: "#10B981",
    examples: [
      {
        jp: "この匂い、カレーに違いない。",
        reading: "この におい、かれー に ちがいない。",
        es: "Ese olor, seguro es curry.",
      },
      {
        jp: "電気が消えている。もう帰ったに違いない。",
        reading: "でんき が きえて いる。もう かえった に ちがいない。",
        es: "Las luces están apagadas. Sin duda ya se fue.",
      },
      {
        jp: "反応が遅い。サーバーが混んでいるに違いない。",
        reading: "はんのう が おそい。さーばー が こんで いる に ちがいない。",
        es: "La respuesta es lenta. Seguro el servidor está saturado.",
      },
    ],
  },
];


/* =========================================================
   Ejemplos con audio (10) + filtro por estructura
========================================================= */
const EXAMPLES: Ex[] = [
  { tag: "わけではない",
    jp: "辛い物が嫌いなわけではないが、得意でもない。",
    reading: "からい もの が きらい な わけではない が、とくい でも ない。",
    es: "No es que odie lo picante, pero tampoco se me da muy bien." },
  { tag: "わけではない",
    jp: "高いからといって、品質が良いわけではない。",
    reading: "たかい から といって、ひんしつ が よい わけではない。",
    es: "Que sea caro no significa que tenga buena calidad." },
  { tag: "わけではない",
    jp: "日本人だからといって、皆が敬語が上手なわけではない。",
    reading: "にほんじん だから といって、みなが けいご が じょうず な わけではない。",
    es: "Ser japonés no significa que todos usen bien el keigo." },

  { tag: "とは限らない",
    jp: "安いからといって、悪いとは限らない。",
    reading: "やすい から といって、わるい とは かぎらない。",
    es: "Que sea barato no siempre significa que sea malo." },
  { tag: "とは限らない",
    jp: "リモートワークが誰にでも合うとは限らない。",
    reading: "りもーとわーく が だれ に でも あう とは かぎらない。",
    es: "El trabajo remoto no necesariamente le funciona a todos." },
  { tag: "とは限らない",
    jp: "大きい会社が安心(だ)とは限らない。",
    reading: "おおきい かいしゃ が あんしん だ と は かぎらない。",
    es: "Una empresa grande no siempre es sinónimo de seguridad." },
  { tag: "とは限らない",
    jp: "便利(だ)からといって、皆が使うとは限らない。",
    reading: "べんり だ から といって、みなが つかう とは かぎらない。",
    es: "Aunque sea práctico, no todos lo usarán necesariamente." },

  { tag: "に違いない",
    jp: "この匂い、カレーに違いない。",
    reading: "この におい、かれー に ちがいない。",
    es: "Ese olor, seguro es curry." },
  { tag: "に違いない",
    jp: "電気が消えている。もう帰ったに違いない。",
    reading: "でんき が きえて いる。もう かえった に ちがいない。",
    es: "Las luces están apagadas. Sin duda ya se fue." },
  { tag: "に違いない",
    jp: "空が暗い。今日は雨になるに違いない。",
    reading: "そら が くらい。きょう は あめ に なる に ちがいない。",
    es: "El cielo está oscuro. Seguro hoy lloverá." },
];

/* =========================================================
   Mini-historia (5 oraciones) — Debate con ejemplo real
   (Casi sin kanji; enfoque en comprensión y uso de la gramática)
========================================================= */
const STORY_LINES = [
  {
    jp: "やすいからといって、わるい とは 限らない。",
    es: "Que algo sea barato no necesariamente es malo.",
    tag: "とは限らない" as const,
  },
  {
    jp: "みんなが すき と いう わけではない。",
    es: "No es que a todo el mundo le guste.",
    tag: "わけではない" as const,
  },
  {
    jp: "このしずかな ふんいき、よるの あめ に ちがいない。",
    es: "Con este ambiente silencioso, seguro que va a llover por la noche.",
    tag: "に違いない" as const,
  },
  {
    jp: "りゅうがく したからといって、にほんご が うまい わけではない。",
    es: "Haber estudiado en Japón no significa automáticamente que hables bien japonés.",
    tag: "わけではない" as const,
  },
  {
    jp: "くちこみ が おおくても、しつ が たかい とは 限らない。",
    es: "Aunque haya muchas reseñas, la calidad no siempre es alta.",
    tag: "とは限らない" as const,
  },
];

/* =========================================================
   Test de matices (10 ítems)
========================================================= */
type RPTag = "わけではない" | "とは限らない" | "に違いない";
type NuItem = {
  stem: string;
  options: RPTag[];
  answer: RPTag;
  why: string;
};
const NU_TEST: NuItem[] = [
  { stem: "値段が高ければ品質が良い（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "とは限らない", why: "‘No siempre’ → 〜とは限らない。" },
  { stem: "静かな人＝内気（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "わけではない", why: "Niega una equivalencia automática → 〜わけではない。" },
  { stem: "この結果…バグが原因（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "に違いない", why: "Deducción fuerte del hablante → 〜に違いない。" },
  { stem: "在宅勤務が誰にでも合う（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "とは限らない", why: "No necesariamente para todos → 〜とは限らない。" },
  { stem: "レビューが多い＝満足度が高い（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "わけではない", why: "No implica automáticamente esa conclusión → 〜わけではない。" },
  { stem: "あの音…花火（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "に違いない", why: "Convicción fuerte por indicios → 〜に違いない。" },
  { stem: "資格がある人が常に活躍する（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "とは限らない", why: "No en todos los casos → 〜とは限らない。" },
  { stem: "彼が無口＝協調性がない（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "わけではない", why: "Negar interpretación absoluta → 〜わけではない。" },
  { stem: "電気が消えた。もう帰宅した（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "に違いない", why: "Deducción con alta certeza → 〜に違いない。" },
  { stem: "安い＝壊れやすい（　　）。", options: ["わけではない","とは限らない","に違いない"], answer: "とは限らない", why: "No siempre es así → 〜とは限らない。" },
];

/* =========================================================
   UI Helpers
========================================================= */
const Chip = ({ label, onPress, on }: { label: string; onPress: () => void; on: boolean }) => (
  <Pressable onPress={onPress} style={[styles.chip, on ? styles.chipOn : null]}>
    <Text style={styles.chipTxt}>{label}</Text>
  </Pressable>
);
const IconPlay = () => (
  <View style={styles.pill}>
    <MCI name="play" size={14} color="#fff" />
  </View>
);
const IconVol = () => (
  <View style={styles.pill}>
    <MCI name="volume-high" size={14} color="#fff" />
  </View>
);

function KaraokeLine({ text, reading }: { text: string; reading: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
    const id = setInterval(() => setIdx((x) => Math.min(reading.length, x + 1)), 22);
    return () => clearInterval(id);
  }, [reading]);
  return (
    <View>
      <Text style={styles.jp}>・{text}</Text>
      <Text style={styles.reading}>
        <Text style={{ color: accent, fontWeight: "900" }}>{reading.slice(0, idx)}</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>{reading.slice(idx)}</Text>
      </Text>
    </View>
  );
}

/* =========================================================
   Secciones
========================================================= */
function QuickBox() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Guía rápida</Text>

      {QUICK.map((q, i) => (
        <View key={i} style={[styles.explBox, { borderColor: q.color }]}>
          <Text style={styles.boxTitle}>{q.title}</Text>

          {/* Uniones / reglas */}
          {q.lines.map((l, j) => (
            <Text key={j} style={styles.note}>・{l}</Text>
          ))}

          {/* Ejemplos con audio */}
          <View style={{ marginTop: 8, gap: 8 }}>
            {q.examples?.map((ex, k) => (
              <View key={k} style={styles.exampleRow}>
                <Pressable onPress={() => speakJP(ex.jp)}>
                  <View style={styles.pill}>
                    <MCI name="play" size={14} color="#fff" />
                  </View>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jp}>「{ex.jp}」</Text>
                  <Text style={styles.reading}>{ex.reading}</Text>
                  <View style={styles.transRow}>
                    <Pressable onPress={() => speakES(ex.es)}>
                      <View style={styles.pill}>
                        <MCI name="volume-high" size={14} color="#fff" />
                      </View>
                    </Pressable>
                    <Text style={styles.esLine}>{ex.es}</Text>
                  </View>
                </View>
                <View style={[styles.tagPill, { backgroundColor: q.color }]}>
                  <Text style={styles.tagTxt}>{q.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}


function ExamplesBox() {
  const [filter, setFilter] = useState<Ex["tag"] | "all">("all");
  const list = EXAMPLES.filter((e) => (filter === "all" ? true : e.tag === filter));
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ejemplos (10) con audio + lectura + traducción</Text>
      <View style={styles.controlsRow}>
        <Chip label="Todos" on={() => setFilter("all")} on={filter === "all"} />
        <Chip label="〜わけではない" on={() => setFilter("わけではない")} on={filter === "わけではない"} />
        <Chip label="〜とは限らない" on={() => setFilter("とは限らない")} on={filter === "とは限らない"} />
        <Chip label="〜に違いない" on={() => setFilter("に違いない")} on={filter === "に違いない"} />
      </View>
      <View style={{ gap: 10, marginTop: 8 }}>
        {list.map((ex, i) => (
          <View key={i} style={styles.exampleRow}>
            <Pressable onPress={() => speakJP(ex.jp)}>
              <IconPlay />
            </Pressable>
            <View style={{ flex: 1 }}>
              <KaraokeLine text={ex.jp} reading={ex.reading} />
              <View style={styles.transRow}>
                <Pressable onPress={() => speakES(ex.es)}>
                  <IconVol />
                </Pressable>
                <Text style={styles.esLine}>{ex.es}</Text>
              </View>
            </View>
            <View
              style={[
                styles.tagPill,
                ex.tag === "わけではない"
                  ? { backgroundColor: "#991B1B" }
                  : ex.tag === "とは限らない"
                  ? { backgroundColor: "#B45309" }
                  : { backgroundColor: "#047857" },
              ]}
            >
              <Text style={styles.tagTxt}>{ex.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- Debate: Historia de 5 oraciones ---------- */
function DebateBox() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Historia breve — uso en contexto (5 oraciones)</Text>
      <Text style={styles.li}>
        Lee la historia y detecta dónde se usa “no significa (〜わけではない)”, “no siempre (〜とは限らない)” y “seguro que (〜に違いない)”.
        Toca para escuchar.
      </Text>

      {STORY_LINES.map((line, i) => (
        <View key={i} style={[styles.explBox, { marginTop: 8, borderColor: line.tag === "に違いない" ? "#10B981" : line.tag === "とは限らない" ? "#F59E0B" : "#EF4444" }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.boxTitle}>
              #{i + 1} · <Text style={{ color: "#fff" }}>{line.tag}</Text>
            </Text>
            <Pressable onPress={() => speakJP(line.jp)} style={styles.pill}>
              <MCI name="play" size={14} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.jp}>「{line.jp}」</Text>
          <Text style={[styles.esLine, { marginTop: 4 }]}>{line.es}</Text>
        </View>
      ))}

      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Reto</Text>
        <Text style={styles.note}>Escribe 3 oraciones propias: una con “no significa (〜わけではない)”, otra con “no siempre (〜とは限らない)” y otra con “seguro que (〜に違いない)”.</Text>
      </View>
    </View>
  );
}

function NuanceTest() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; why: string }>(null);
  const item = NU_TEST[i];

  useEffect(() => {
    setPick(null);
    setFeedback(null);
  }, [i]);

  const choose = (opt: NuItem["answer"]) => {
    if (pick) return;
    const ok = opt === item.answer;
    setPick(opt);
    setFeedback({ ok, why: item.why });
    speakES(ok ? "¡Muy bien!" : "Revisa el matiz…");
  };

  return (
    <View style={styles.card}>
    <Text style={styles.cardTitle}>Test de matices — elige lo correcto (10)</Text>
      <View style={styles.puzzleBox}>
        <Text style={styles.jp}>{item.stem}</Text>
      </View>
      <View style={[styles.bankRow, { marginTop: 8 }]}>
        {item.options.map((o, k) => {
          const on = pick === o;
          const color = o === "わけではない" ? "#991B1B" : o === "とは限らない" ? "#B45309" : "#047857";
          return (
            <Pressable
              key={k}
              onPress={() => choose(o)}
              style={[styles.dndChip, { borderColor: color, backgroundColor: on ? color : "transparent" }]}
            >
              <Text style={styles.dndTxt}>{o}</Text>
            </Pressable>
          );
        })}
      </View>

      {feedback && (
        <View style={[styles.explBox, { marginTop: 8, borderColor: feedback.ok ? "#34D399" : "#F87171" }]}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>{feedback.ok ? "✔ Correcto" : "✖ Incorrecto"}</Text>
          <Text style={styles.note}>• {feedback.why}</Text>
        </View>
      )}

      <View style={[styles.controlsRow, { marginTop: 10 }]}>
        <Pressable onPress={() => setI((x) => Math.max(0, x - 1))} style={styles.ctrlBtn}>
          <MCI name="arrow-left-bold" size={18} color="#fff" />
          <Text style={styles.ctrlTxt}>Anterior</Text>
        </Pressable>
        <Pressable onPress={() => setI((x) => Math.min(NU_TEST.length - 1, x + 1))} style={styles.ctrlBtn}>
          <MCI name="arrow-right-bold" size={18} color="#fff" />
          <Text style={styles.ctrlTxt}>Siguiente</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Kanji Modal + Grid ---------- */
function KanjiModal({ visible, onClose, data }: { visible: boolean; onClose: () => void; data: KanjiItem | null }) {
  if (!data) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kanji: {data.kanji}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MCI name="close" size={22} color="#fff" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalReading} onPress={() => speakJP(data.readingJP)}>
              {data.readingJP} · {data.meaningEs} <Text style={{ opacity: 0.7, color: "#fff" }}>(Toca para oír)</Text>
            </Text>

            {data.strokeAsset ? (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <ExpoImage
                  source={data.strokeAsset}
                  style={{
                    width: Math.min(width - 32, 330),
                    height: Math.min(width - 32, 330),
                    borderRadius: 16,
                    backgroundColor: "#0B0F19",
                    tintColor: "#fff",
                  }}
                  contentFit="contain"
                />
                <Text style={{ color: "#fff", fontSize: 12, textAlign: "center", marginTop: 6 }}>
                  Orden de trazos (KanjiVG)
                </Text>
              </View>
            ) : (
              <Text style={{ color: "#fff", opacity: 0.7, marginTop: 10 }}>Sin imagen de trazos.</Text>
            )}

            <View style={{ marginTop: 16 }}>
              <Text style={styles.wordsTitle}>Palabras con「{data.kanji}」</Text>
              {(data.words ?? []).map((w, i) => (
                <Pressable key={i} onPress={() => speakJP(w.jp)} style={styles.wordItem}>
                  <Text style={styles.wordJp}>{w.jp}</Text>
                  <Text style={styles.wordReading}>{w.reading}</Text>
                  <Text style={styles.wordEs}>{w.es}</Text>
                  <MCI name="play" size={18} color="#fff" />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function KanjiGrid() {
  const [show, setShow] = useState(false);
  const [cur, setCur] = useState<KanjiItem | null>(null);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Kanjis del tema (sin 理)</Text>
      <Text style={styles.li}>Toca para ver trazos y ejemplos con audio.</Text>
      <View style={styles.kanjiGrid}>
        {KANJIS.map((k, idx) => (
          <Pressable
            key={idx}
            onPress={() => {
              setCur(k);
              setShow(true);
            }}
            style={[styles.kanjiCell, { borderColor: "rgba(255,255,255,0.1)" }]}
          >
            <Text style={styles.kanjiBig}>{k.kanji}</Text>
            <Text style={styles.kanjiReading}>{k.readingJP}</Text>
            <Text style={styles.kanjiEs}>{k.meaningEs}</Text>
          </Pressable>
        ))}
      </View>
      <KanjiModal visible={show} onClose={() => setShow(false)} data={cur} />
    </View>
  );
}

/* ---------- Tabs (sin Roleplay) ---------- */
type TabKey = "quick" | "examples" | "debate" | "nuance" | "kanji";
const TAB_LABELS: Record<TabKey, string> = {
  quick: "Guía",
  examples: "Ejemplos",
  debate: "Debate",
  nuance: "Test",
  kanji: "Kanjis",
};
function TabBar({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const labels: TabKey[] = ["quick", "examples", "debate", "nuance", "kanji"];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 16, marginBottom: 6 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {labels.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnOn]}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtOn]}>{TAB_LABELS[t]}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

/* =========================================================
   Screen
========================================================= */
export default function N2_B1_U1() {
  const [tab, setTab] = useState<TabKey>("quick");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(PROGRESS_KEY);
        if (v) setProgress(Number(v));
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (np: number) => {
    try { await AsyncStorage.setItem(PROGRESS_KEY, String(np)); } catch {}
  }, []);

  const next = useCallback(() => {
    setProgress((p) => {
      const np = Math.min(1, p + 0.25);
      persist(np);
      return np;
    });
  }, [persist]);

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b1_u1.webp")}
      accent={accent}
      breadcrumb="B1 · U1"
      title="〜わけではない／〜とは限らない／〜に違いない"
      subtitle="Niega absolutos, reconoce excepciones y argumenta con deducción fuerte"
      ctas={[
        { label: "Escuchar guía", onPress: () => speakES("Hoy veremos 〜わけではない、〜とは限らない y 〜に違いない con usos claros.") },
        { label: "Ir al test", onPress: () => setTab("nuance") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Marcar avance"
    >
      <TabBar tab={tab} setTab={setTab} />
      {tab === "quick" && <QuickBox />}
      {tab === "examples" && <ExamplesBox />}
      {tab === "debate" && <DebateBox />}
      {tab === "nuance" && <NuanceTest />}
      {tab === "kanji" && <KanjiGrid />}

      {progress >= 1 && (
        <View style={[styles.card, { borderColor: "rgba(192,30,46,0.4)" }]}>
          <Text style={styles.cardTitle}>🏅 ¡Unidad completada!</Text>
          <Text style={styles.li}>Repasaste teoría, ejemplos, debate y test. ¡Excelente!</Text>
        </View>
      )}
    </UnitTemplate>
  );
}

/* =========================================================
   Styles — oscuro
========================================================= */
const R = 16;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B0F19",
    borderRadius: R,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "900", marginBottom: 8, fontSize: 16 },
  li: { color: "rgba(255,255,255,0.94)", marginBottom: 6 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0F1117",
  },
  chipOn: { backgroundColor: "#C01E2E", borderColor: "#FCA5A5" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  exampleRow: {
    backgroundColor: "#0B0F19",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  jp: { color: "#fff", fontWeight: "800", flexWrap: "wrap" },
  reading: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  transRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  esLine: { color: "#fff", fontSize: 13, flexShrink: 1, flexWrap: "wrap", marginLeft: 6 },
  pill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tagPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: "center" },
  tagTxt: { color: "#fff", fontWeight: "900", fontSize: 11 },

  explBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  boxTitle: { color: "#fff", fontWeight: "900", marginBottom: 6 },
  note: { color: "#fff", marginTop: 4 },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },
  ctrlBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctrlTxt: { color: "#fff", fontWeight: "800" },

  choiceRow: {
    backgroundColor: "#0F1117",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  choiceKey: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  choiceKeyTxt: { color: "#fff", fontWeight: "900" },
  transBubble: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },

  tileRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  formTile: { backgroundColor: "#0B1222", borderWidth: 1.5, borderRadius: 14, padding: 10, minWidth: 150 },
  tileHead: { fontWeight: "900", fontSize: 12, color: "#fff" },

  puzzleBox: {
    backgroundColor: "#0B0F19",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  bankRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  dndChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, backgroundColor: "transparent" },
  dndTxt: { color: "#fff", fontWeight: "900" },

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
  kanjiReading: { color: "#fff", marginTop: 4 },
  kanjiEs: { color: "#fff", fontSize: 12, marginTop: 2, textAlign: "center", paddingHorizontal: 6 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#0B0F19",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "92%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0B0F19",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  modalReading: { color: "#fff", marginTop: 6 },

  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0F1117",
  },
  tabBtnOn: { backgroundColor: "#C01E2E", borderColor: "#FCA5A5" },
  tabTxt: { color: "#fff", fontWeight: "800" },
  tabTxtOn: { color: "#fff", fontWeight: "900" },

  wordsTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },
  wordItem: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordJp: { color: "#fff", fontWeight: "900", fontSize: 16 },
  wordReading: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  wordEs: { color: "#fff", fontSize: 13, opacity: 0.95, flex: 1 },
});
