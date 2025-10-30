// src/screens/N2/N2_B3_U3.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
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
const accent = "#06B6D4"; // cian juvenil

function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 0.98, pitch: 1.02 });
  } catch {}
}
function speakES(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: "es-MX", rate: 1.0, pitch: 1.0 });
  } catch {}
}

/* =========================================================
   Tipos
========================================================= */
type Word = { jp: string; reading: string; es: string };
type Ex = { jp: string; reading: string; es: string; tag: "に違いない" | "かもしれない" };
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  hex?: string;
  strokeAsset?: any;
  words?: Word[];
};

/* =========================================================
   Kanji (12) — usa tus *_nums.webp ya generados
========================================================= */
const STROKE_ASSETS: Record<string, any> = {
  "63a8": require("../../../assets/kanjivg/n2/63a8_nums.webp"), // 推
  "60f3": require("../../../assets/kanjivg/n2/60f3_nums.webp"), // 想
  "7591": require("../../../assets/kanjivg/n2/7591_nums.webp"), // 疑
  "4e88": require("../../../assets/kanjivg/n2/4e88_nums.webp"), // 予
  "5146": require("../../../assets/kanjivg/n2/5146_nums.webp"), // 兆
  "7684": require("../../../assets/kanjivg/n2/7684_nums.webp"), // 的
  "53ef": require("../../../assets/kanjivg/n2/53ef_nums.webp"), // 可
  "80fd": require("../../../assets/kanjivg/n2/80fd_nums.webp"), // 能
  "78ba": require("../../../assets/kanjivg/n2/78ba_nums.webp"), // 確
  "6e2c": require("../../../assets/kanjivg/n2/6e2c_nums.webp"), // 測
  "6839": require("../../../assets/kanjivg/n2/6839_nums.webp"), // 根
  "62e0": require("../../../assets/kanjivg/n2/62e0_nums.webp"), // 拠
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
  createKanji("推", "お(す)／すい", "empujar; inferir", "63a8", [
    { jp: "推測", reading: "すいそく", es: "inferencia" },
  ]),
  createKanji("想", "おも(う)／そう", "pensar; idea", "60f3", [
    { jp: "想像", reading: "そうぞう", es: "imaginación" },
  ]),
  createKanji("疑", "うたが(う)／ぎ", "duda", "7591", [
    { jp: "疑問", reading: "ぎもん", es: "duda/pregunta" },
  ]),
  createKanji("予", "よ", "antes; prever", "4e88", [
    { jp: "予想", reading: "よそう", es: "pronóstico" },
  ]),
  createKanji("兆", "ちょう／きざ(し)", "indicio; señal", "5146", [
    { jp: "兆候", reading: "ちょうこう", es: "síntoma/indicio" },
  ]),
  createKanji("的", "てき", "relativo a; objetivo", "7684", [
    { jp: "目的", reading: "もくてき", es: "objetivo" },
  ]),
  createKanji("可", "か", "posible; aprobable", "53ef", [
    { jp: "可能", reading: "かのう", es: "posible" },
  ]),
  createKanji("能", "のう", "capacidad; poder", "80fd", [
    { jp: "能力", reading: "のうりょく", es: "capacidad" },
  ]),
  createKanji("確", "たし(か)／かく", "seguro; confirmar", "78ba", [
    { jp: "確信", reading: "かくしん", es: "convicción" },
  ]),
  createKanji("測", "はか(る)／そく", "medir; estimar", "6e2c", [
    { jp: "推測", reading: "すいそく", es: "suposición" },
  ]),
  createKanji("根", "ね／こん", "raíz; base", "6839", [
    { jp: "根拠", reading: "こんきょ", es: "fundamento" },
  ]),
  createKanji("拠", "きょ", "apoyarse; base", "62e0", [
    { jp: "証拠", reading: "しょうこ", es: "prueba" },
  ]),
];

/* =========================================================
   Guía rápida (qué es / cómo se une)
========================================================= */
const QUICK = [
  {
    title: "〜に違いない（alta convicción del hablante）",
    lines: [
      "Significa: “debe ser… / sin duda… (según yo)”. Certeza subjetiva basada en indicios.",
      "Conjugación / unión:",
      "• Con VERBO: 普通形（dic./pasado/negativo）＋ に違いない",
      "  Ej: 彼は来ないに違いない（Seguro no vendrá）",
      "• Con い形容詞: い形容詞（普通形）＋ に違いない",
      "  Ej: これは難しいに違いない（Debe ser difícil）",
      "• Con な形容詞 / 名詞: [語幹/名詞]＋『である』＋ に違いない（registro cuidado）",
      "  Ej: 学生であるに違いない（Sin duda es estudiante）",
      "Comparables: きっと〜だ, 間違いない, に相違ない（muy formal/escrito）",
    ],
    color: "#22D3EE",
  },
  {
    title: "〜かもしれない（posibilidad baja a media）",
    lines: [
      "Significa: “quizá / puede que…”. Expresa duda, suaviza la afirmación.",
      "Conjugación / unión:",
      "• Con VERBO: 普通形（dic./pasado/negativo）＋ かもしれない",
      "• Con い形容詞: い形容詞（普通形）＋ かもしれない",
      "• Con な形容詞 / 名詞: [語幹/名詞]＋ かもしれない（no pide だ/である antes）",
      "  Coloquial: ～かも／～かもね",
      "No lo uses si necesitas compromiso u orden; es tentativo.",
    ],
    color: "#34D399",
  },
];

const EQUIV = [
  "Alta seguridad del hablante → 〜に違いない",
  "Posibilidad sin afirmar → 〜かもしれない（＝〜かも）",
];

const PITFALLS = [
  "〜に違いない NO es objetiva: es deducción del hablante. En informes fríos usa 〜と考えられる／〜と思われる.",
  "Con 名詞/な形 antes de に違いない, suele usarse である para registro más cuidado.",
  "〜かもしれない expresa duda; evita usarlo cuando debes dar instrucciones firmes.",
];

/* =========================================================
   Ejemplos con audio (10)
========================================================= */
const EXAMPLES: Ex[] = [
  { tag: "に違いない", jp: "この足跡は彼のものに違いない。", reading: "この あしあと は かれ の もの に ちがいない。", es: "Estas huellas deben ser de él." },
  { tag: "に違いない", jp: "窓が割れている… 風の影響に違いない。", reading: "まど が われている… かぜ の えいきょう に ちがいない。", es: "La ventana está rota… seguro fue por el viento." },
  { tag: "に違いない", jp: "あの表情… 彼は怒っているに違いない。", reading: "あの ひょうじょう… かれ は おこって いる に ちがいない。", es: "Esa expresión… sin duda está enojado." },
  { tag: "かもしれない", jp: "今日は雨が降るかもしれない。", reading: "きょう は あめ が ふる かもしれない。", es: "Quizá hoy llueva." },
  { tag: "かもしれない", jp: "彼はもう出発したかもしれない。", reading: "かれ は もう しゅっぱつ した かもしれない。", es: "Puede que él ya haya salido." },
  { tag: "かもしれない", jp: "この結論は正しくないかもしれない。", reading: "この けつろん は ただしく ない かもしれない。", es: "Puede que esta conclusión no sea correcta." },
  { tag: "に違いない", jp: "この音は機械の劣化に違いない。", reading: "この おと は きかい の れっか に ちがいない。", es: "Este sonido debe ser deterioro de la máquina." },
  { tag: "かもしれない", jp: "会議は延長になるかもしれない。", reading: "かいぎ は えんちょう に なる かもしれない。", es: "Puede que la reunión se extienda." },
  { tag: "に違いない", jp: "原因はセンサーの誤差に違いない。", reading: "げんいん は センサー の ごさ に ちがいない。", es: "La causa debe ser el error del sensor." },
  { tag: "かもしれない", jp: "データの一部が欠けているかもしれない。", reading: "データ の いちぶ が かけて いる かもしれない。", es: "Puede que falte una parte de los datos." },
];

/* =========================================================
   Historia — líneas JP y traducción ES (con audio)
========================================================= */
const STORY_LINES = [
  "昨夜、研究室の電源が突然落ちたに違いないと思った。",
  "温度センサーのログが不自然だから、冷却不良が原因に違いない。",
  "でも、近所で停電があったかもしれないとも感じた。",
  "サーバーのファン音が弱かった… これは劣化の兆候に違いない。",
  "一方で、設定を誰かが変更したかもしれないという可能性も残る。",
  "まず原因を切り分ければ、無駄な交換を避けられるかもしれない。",
  "結論として、換気とセンサー校正は必要に違いない。",
  "念のため、非常電源の点検も依頼しておくかもしれない。",
];

const STORY_LINES_ES = [
  "Anoche, pensé que sin duda la energía del laboratorio se había cortado.",
  "Como los registros del sensor de temperatura eran extraños, debía ser una falla de enfriamiento.",
  "Pero también sentí que quizá hubo un apagón en el vecindario.",
  "El sonido débil del ventilador del servidor era, sin duda, una señal de deterioro.",
  "Por otro lado, aún quedaba la posibilidad de que alguien hubiera cambiado la configuración.",
  "Si primero separamos las causas, quizá podamos evitar un reemplazo innecesario.",
  "En conclusión, la ventilación y la calibración del sensor son sin duda necesarias.",
  "Por si acaso, también podría pedir una revisión de la fuente de energía de emergencia.",
];

/* =========================================================
   Dinámicas — Roleplay interactivo con ramificación
========================================================= */
type RPTag = "に違いない" | "かもしれない";
type RPChoice = { key: "A" | "B" | "C"; jp: string; es: string; tag: RPTag };
type RPStep = { prompt: string; choices: RPChoice[]; tip?: string };
type RPScene = { title: string; context: string; steps: RPStep[] };

const ROLEPLAY_SCENES: RPScene[] = [
  {
    title: "現場推理：オフィスの異常電源",
    context:
      "Servidor se apagó anoche. Decide si muestras alta convicción (〜に違いない) o posibilidad (〜かもしれない).",
    steps: [
      {
        prompt: "1) Hipótesis inicial",
        tip: "Alta convicción = に違いない / posibilidad = かもしれない",
        choices: [
          { key: "A", jp: "温度センサーの誤作動に違いない。", es: "Debe haber sido el sensor de temperatura.", tag: "に違いない" },
          { key: "B", jp: "電圧の揺れがあったのかもしれない。", es: "Puede que hubiera una fluctuación de voltaje.", tag: "かもしれない" },
          { key: "C", jp: "誰かが設定を変えたのかもしれない。", es: "Quizá alguien cambió la configuración.", tag: "かもしれない" },
        ],
      },
      {
        prompt: "2) Tras revisar los logs",
        choices: [
          { key: "A", jp: "エラーコードを見る限り、冷却不良に違いない。", es: "Por el código de error, seguro fue mala refrigeración.", tag: "に違いない" },
          { key: "B", jp: "原因は一つじゃないかもしれない。", es: "Puede que no sea una sola causa.", tag: "かもしれない" },
          { key: "C", jp: "停電の影響かもしれない。", es: "Podría ser efecto de un apagón.", tag: "かもしれない" },
        ],
      },
      {
        prompt: "3) Cierre con recomendación",
        choices: [
          { key: "A", jp: "再発防止には換気の見直しが必要に違いない。", es: "Para evitarlo, seguro hay que revisar la ventilación.", tag: "に違いない" },
          { key: "B", jp: "まず原因を切り分けるべきかもしれない。", es: "Quizá debamos delimitar causas primero.", tag: "かもしれない" },
          { key: "C", jp: "センサーの校正が必要に違いない。", es: "Debe calibrarse el sensor, sin duda.", tag: "に違いない" },
        ],
      },
    ],
  },
  {
    title: "日常判断：忘れ物の主",
    context: "En clase apareció una cartera. ¿Cómo lo dices sin/ con seguridad?",
    steps: [
      {
        prompt: "1) Observación",
        choices: [
          { key: "A", jp: "この財布、山田さんのに違いない。", es: "Esta cartera debe ser de Yamada.", tag: "に違いない" },
          { key: "B", jp: "留学生のものかもしれない。", es: "Puede que sea de un estudiante internacional.", tag: "かもしれない" },
          { key: "C", jp: "先生の忘れ物かもしれない。", es: "Quizá sea del profesor.", tag: "かもしれない" },
        ],
      },
      {
        prompt: "2) Revisión de credencial dentro",
        choices: [
          { key: "A", jp: "写真がある…やっぱり山田さんのに違いない。", es: "Hay una foto… sin duda es de Yamada.", tag: "に違いない" },
          { key: "B", jp: "名前が見えない…クラスBの誰かかもしれない。", es: "No se ve el nombre… puede que sea de alguien del grupo B.", tag: "かもしれない" },
          { key: "C", jp: "担任に預けたほうがいいかもしれない。", es: "Quizá convenga entregarla al tutor.", tag: "かもしれない" },
        ],
      },
    ],
  },
];

/* =========================================================
   Test de matices (8)
========================================================= */
type NuItem = {
  stem: string;
  options: ("に違いない" | "かもしれない")[];
  answer: "に違いない" | "かもしれない";
  why: string;
};
const NU_TEST: NuItem[] = [
  { stem: "足跡が濡れている… さっきまで雨が降っていた（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Indicios fuertes → alta convicción." },
  { stem: "彼、今日は来ない（　　）。メッセージの既読がつかないし。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Falta certeza; suena mejor probabilidad media/baja." },
  { stem: "この結論には計算ミスがある（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "El hablante está convencido por evidencia." },
  { stem: "明日は会場が混む（　　）。連休だから。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Razón objetiva conocida (vacaciones) → alta convicción." },
  { stem: "彼はもう家に着いた（　　）。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Sin datos concretos, solo posibilidad." },
  { stem: "この音はファンの劣化が原因（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Síntomas coinciden claramente con el fallo." },
  { stem: "ネットが遅い… プロバイダの障害（　　）。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Podría ser, pero hay varias causas posibles." },
  { stem: "ログを見る限り、設定ミス（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Los logs apuntan directamente a esa causa." },
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
          {q.lines.map((l, j) => (
            <Text key={j} style={styles.note}>
              ・{l}
            </Text>
          ))}
        </View>
      ))}
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Elección rápida</Text>
        {EQUIV.map((s, i) => (
          <Text key={i} style={styles.note}>
            • {s}
          </Text>
        ))}
      </View>
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Errores comunes</Text>
        {PITFALLS.map((s, i) => (
          <Text key={i} style={styles.note}>
            • {s}
          </Text>
        ))}
      </View>
    </View>
  );
}

function ExamplesBox() {
  const [filter, setFilter] = useState<Ex["tag"] | "all">("all");
  const list = EXAMPLES.filter((e) => (filter === "all" ? true : e.tag === filter));
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ejemplos con audio + lectura + traducción</Text>
      <View style={styles.controlsRow}>
        <Chip label="Todos" on={() => setFilter("all")} on={filter === "all"} />
        <Chip label="〜に違いない" on={() => setFilter("に違いない")} on={filter === "に違いない"} />
        <Chip label="〜かもしれない" on={() => setFilter("かもしれない")} on={filter === "かもしれない"} />
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
                ex.tag === "に違いない" ? { backgroundColor: "#0891B2" } : { backgroundColor: "#047857" },
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

/* ---------- Roleplay interactivo y ramificado ---------- */
function RoleplayBox() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [transcript, setTranscript] = useState<RPChoice[]>([]);
  const [used, setUsed] = useState<{ "に違いない": boolean; "かもしれない": boolean }>({
    "に違いない": false,
    "かもしれない": false,
  });

  const scene = ROLEPLAY_SCENES[sceneIdx];
  const step = scene.steps[stepIdx];

  useEffect(() => {
    setStepIdx(0);
    setTranscript([]);
    setUsed({ "に違いない": false, "かもしれない": false });
  }, [sceneIdx]);

  const pick = (choice: RPChoice) => {
    setTranscript((prev) => [...prev, choice]);
    setUsed((u) => ({ ...u, [choice.tag]: true }));
    speakJP(choice.jp);
    if (stepIdx < scene.steps.length - 1) {
      setStepIdx(stepIdx + 1);
    }
  };

  const goBackOne = () => {
    if (!transcript.length) return;
    const copy = [...transcript];
    copy.pop();
    setTranscript(copy);
    setStepIdx((x) => Math.max(0, x - 1));
    const flags = { "に違いない": false, "かもしれない": false };
    for (const c of copy) flags[c.tag] = true;
    setUsed(flags);
  };

  const resetScene = () => {
    setStepIdx(0);
    setTranscript([]);
    setUsed({ "に違いない": false, "かもしれない": false });
  };

  const finished = stepIdx >= scene.steps.length - 1 && transcript.length === scene.steps.length;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Roleplay — ¿Alta convicción o posibilidad?</Text>
      <Text style={styles.li}>
        Elige A/B/C en cada turno y decide el tono: seguridad (に違いない) vs probabilidad (かもしれない).
      </Text>

      {/* Selector de escena */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {ROLEPLAY_SCENES.map((sc, i) => {
            const on = i === sceneIdx;
            return (
              <Pressable key={i} onPress={() => setSceneIdx(i)} style={[styles.tabBtn, on && styles.tabBtnOn]}>
                <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{sc.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Contexto */}
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Contexto</Text>
        <Text style={styles.note}>{scene.context}</Text>
      </View>

      {/* Paso actual */}
      {!(finished && transcript.length) && (
        <View style={[styles.explBox, { marginTop: 8 }]}>
          <Text style={styles.boxTitle}>
            Turno {stepIdx + 1} / {scene.steps.length}
          </Text>
          <Text style={styles.note}>→ {step.prompt}</Text>

          <View style={{ gap: 8, marginTop: 10 }}>
            {step.choices.map((ch) => {
              const color = ch.tag === "に違いない" ? "#0891B2" : "#047857";
              return (
                <Pressable key={ch.key} onPress={() => pick(ch)} style={[styles.choiceRow, { borderColor: color }]}>
                  <View style={[styles.choiceKey, { backgroundColor: color }]}>
                    <Text style={styles.choiceKeyTxt}>{ch.key}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jp}>「{ch.jp}」</Text>
                    <Text style={[styles.esLine, { opacity: 0.85 }]}>{ch.es}</Text>
                  </View>
                  <Pressable onPress={() => speakJP(ch.jp)} style={styles.pill}>
                    <MCI name="play" size={14} color="#fff" />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.controlsRow, { marginTop: 10 }]}>
            {stepIdx > 0 && transcript.length > 0 && (
              <Pressable onPress={goBackOne} style={styles.ctrlBtn}>
                <MCI name="arrow-left-bold" size={18} color="#fff" />
                <Text style={styles.ctrlTxt}>Atrás</Text>
              </Pressable>
            )}
            <Pressable onPress={resetScene} style={styles.ctrlBtn}>
              <MCI name="refresh" size={18} color="#fff" />
              <Text style={styles.ctrlTxt}>Reiniciar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Transcript */}
      {!!transcript.length && (
        <View style={[styles.explBox, { marginTop: 8 }]}>
          <Text style={styles.boxTitle}>Diálogo generado</Text>
          {transcript.map((t, i) => (
            <View key={i} style={styles.transBubble}>
              <Text style={styles.note}>
                <Text style={{ fontWeight: "900", color: "#fff" }}>{t.key} · </Text>
                <Text style={{ color: "#22D3EE" }}>{t.tag}</Text>
              </Text>
              <Text style={styles.jp}>「{t.jp}」</Text>
              <Text style={[styles.esLine, { marginTop: 2 }]}>{t.es}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Fin y evaluación */}
      {finished && (
        <View style={[styles.explBox, { marginTop: 8, borderColor: "rgba(34,211,238,0.5)" }]}>
          <Text style={styles.boxTitle}>🏁 Cierre del roleplay</Text>
          <Text style={styles.note}>Usaste:</Text>
          <Text style={styles.note}>• 〜に違いない: {used["に違いない"] ? "✔" : "✖"}</Text>
          <Text style={styles.note}>• 〜かもしれない: {used["かもしれない"] ? "✔" : "✖"}</Text>

          <View style={[styles.controlsRow, { marginTop: 10 }]} >
            <Pressable onPress={() => {
              const msg = used["に違いない"] && used["かもしれない"]
                ? "¡Dominaste ambos matices! 🏅"
                : "Buen intento. Repite usando ambos.";
              speakES(msg);
            }} style={styles.ctrlBtn}>
              <MCI name="star" size={18} color="#fff" />
              <Text style={styles.ctrlTxt}>Evaluar intento</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function DebateBox() {
  const p = {
    hook: "原因はセンサーの誤差に違いない？ それとも環境要因かもしれない？",
    pros: ["データの傾向から見て、外的要因に違いない。", "この兆候は前回と同じだに違いない。"],
    cons: ["測定機器の劣化かもしれない。", "人的ミスの可能性もあるかもしれない."],
  };
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Debate corto — ¿Alta convicción vs posibilidad?</Text>
      <Text style={styles.li}>
        Practica decidir el tono: cuando hay fundamento (根拠) fuerte → に違いない; con incertidumbre → かもしれない.
      </Text>

      <View style={styles.explBox}>
        <Text style={styles.boxTitle}>Gancho</Text>
        <Pressable onPress={() => speakJP(p.hook)}>
          <Text style={styles.jp}>・{p.hook}</Text>
        </Pressable>
      </View>

      <View style={[styles.tileRow, { marginTop: 8 }]}>
        <View style={[styles.formTile, { borderColor: "#22D3EE" }]}>
          <Text style={styles.tileHead}>Alta convicción（に違いない）</Text>
          {p.pros.map((t, i) => (
            <Pressable key={i} onPress={() => speakJP(t)}>
              <Text style={styles.note}>• {t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.formTile, { borderColor: "#34D399" }]}>
          <Text style={styles.tileHead}>Posibilidad（かもしれない）</Text>
          {p.cons.map((t, i) => (
            <Pressable key={i} onPress={() => speakJP(t)}>
              <Text style={styles.note}>• {t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Historia bilingüe con audio */}
      <View style={[styles.explBox, { marginTop: 10 }]}>
        <Text style={styles.boxTitle}>Historia — Convicción vs posibilidad</Text>
        {STORY_LINES.map((jpLine, idx) => {
          const esLine = STORY_LINES_ES[idx] ?? "";
          return (
            <View key={idx} style={{ marginTop: 8 }}>
              {/* JP + audio */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable onPress={() => speakJP(jpLine)} style={styles.pill}>
                  <MCI name="play" size={14} color="#fff" />
                </Pressable>
                <Text style={styles.jp}>{jpLine}</Text>
              </View>
              {/* ES + audio */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Pressable onPress={() => speakES(esLine)} style={styles.pill}>
                  <MCI name="volume-high" size={14} color="#fff" />
                </Pressable>
                <Text style={styles.esLine}>{esLine}</Text>
              </View>
            </View>
          );
        })}
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
    speakES(ok ? "¡Bien!" : "Casi...");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Test de matices — elige lo más natural</Text>
      <View style={styles.puzzleBox}>
        <Text style={styles.jp}>{item.stem}</Text>
      </View>
      <View style={[styles.bankRow, { marginTop: 8 }]}>
        {item.options.map((o, k) => {
          const on = pick === o;
          const color = o === "に違いない" ? "#0891B2" : "#047857";
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
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
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
      <Text style={styles.cardTitle}>Kanjis del tema</Text>
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

/* ---------- Tabs ---------- */
type TabKey = "quick" | "examples" | "role" | "debate" | "nuance" | "kanji";
const TAB_LABELS: Record<TabKey, string> = {
  quick: "Guía",
  examples: "Ejemplos",
  role: "Roleplay",
  debate: "Debate",
  nuance: "Test",
  kanji: "Kanjis",
};
function TabBar({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const labels: TabKey[] = ["quick", "examples", "role", "debate", "nuance", "kanji"];
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
export default function N2_B3_U3() {
  const [tab, setTab] = useState<TabKey>("quick");
  const [progress, setProgress] = useState(0);
  const next = () => setProgress((p) => Math.min(1, p + 0.25));

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b3_u3.webp")}
      accent={accent}
      breadcrumb="B3 · U3"
      title="〜に違いない／〜かもしれない"
      subtitle="Cómo sonar seguro o prudente: deducción fuerte vs posibilidad — con audio, roleplay, historia y test"
      ctas={[
        { label: "Escuchar guía", onPress: () => speakES("Repasemos 〜に違いない y 〜かもしれない con ejemplos claros.") },
        { label: "Ir al test", onPress: () => setTab("nuance") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Marcar avance"
    >
      <TabBar tab={tab} setTab={setTab} />
      {tab === "quick" && <QuickBox />}
      {tab === "examples" && <ExamplesBox />}
      {tab === "role" && <RoleplayBox />}
      {tab === "debate" && <DebateBox />}
      {tab === "nuance" && <NuanceTest />}
      {tab === "kanji" && <KanjiGrid />}

      {progress >= 1 && (
        <View style={[styles.card, { borderColor: "rgba(6, 182, 212, 0.5)" }]}>
          <Text style={styles.cardTitle}>🏅 ¡Unidad completada!</Text>
          <Text style={styles.li}>Has visto teoría, ejemplos, roleplay, historia y test.</Text>
        </View>
      )}
    </UnitTemplate>
  );
}

/* =========================================================
   Styles — oscuro, TODOS los textos en blanco
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

  // chips
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0F1117",
  },
  chipOn: { backgroundColor: "#0891B2", borderColor: "#22D3EE" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  // ejemplos
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

  // info boxes
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

  // botones / controles
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

  // role (interactivo)
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

  // debate tiles
  tileRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  formTile: { backgroundColor: "#0B1222", borderWidth: 1.5, borderRadius: 14, padding: 10, minWidth: 150 },
  tileHead: { fontWeight: "900", fontSize: 12, color: "#fff" },

  // test
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

  // kanji grid
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

  // modal
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

  // tabbar
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0F1117",
  },
  tabBtnOn: { backgroundColor: "#0891B2", borderColor: "#22D3EE" },
  tabTxt: { color: "#fff", fontWeight: "800" },
  tabTxtOn: { color: "#fff", fontWeight: "900" },

  // modal: lista de palabras en blanco
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
