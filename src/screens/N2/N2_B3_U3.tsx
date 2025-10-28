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
   Kanji (12) — usa tus *_nums.webp ya generados (N2)
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

function createKanji(kanji: string, readingJP: string, meaningEs: string, hex?: string, words: Word[] = []): KanjiItem {
  const normalizedHex = hex ? hex.replace(/^0+/, "").toLowerCase() : undefined;
  const strokeAsset = normalizedHex ? STROKE_ASSETS[normalizedHex] : undefined;
  return { kanji, readingJP, meaningEs, hex: normalizedHex, strokeAsset, words };
}

const KANJIS: KanjiItem[] = [
  createKanji("推", "お(す)／すい", "empujar; inferir", "63a8", [{ jp: "推測", reading: "すいそく", es: "inferencia" }]),
  createKanji("想", "おも(う)／そう", "pensar; idea", "60f3", [{ jp: "想像", reading: "そうぞう", es: "imaginación" }]),
  createKanji("疑", "うたが(う)／ぎ", "duda", "7591", [{ jp: "疑問", reading: "ぎもん", es: "duda/pregunta" }]),
  createKanji("予", "よ", "antes; prever", "4e88", [{ jp: "予想", reading: "よそう", es: "pronóstico" }]),
  createKanji("兆", "ちょう／きざ(し)", "indicio; señal", "5146", [{ jp: "兆候", reading: "ちょうこう", es: "síntoma/indicio" }]),
  createKanji("的", "てき", "relativo a; objetivo", "7684", [{ jp: "目的", reading: "もくてき", es: "objetivo" }]),
  createKanji("可", "か", "posible; aprobable", "53ef", [{ jp: "可能", reading: "かのう", es: "posible" }]),
  createKanji("能", "のう", "capacidad; poder", "80fd", [{ jp: "能力", reading: "のうりょく", es: "capacidad" }]),
  createKanji("確", "たし(か)／かく", "seguro; confirmar", "78ba", [{ jp: "確信", reading: "かくしん", es: "convicción" }]),
  createKanji("測", "はか(る)／そく", "medir; estimar", "6e2c", [{ jp: "推測", reading: "すいそく", es: "suposición" }]),
  createKanji("根", "ね／こん", "raíz; base", "6839", [{ jp: "根拠", reading: "こんきょ", es: "fundamento" }]),
  createKanji("拠", "きょ", "apoyarse; base", "62e0", [{ jp: "証拠", reading: "しょうこ", es: "prueba" }]),
];

/* =========================================================
   Guía rápida + Formación (cómo se une)
========================================================= */
const QUICK = [
  {
    title: "〜に違いない — alta convicción del hablante",
    lines: [
      "Significa: “debe ser… / sin duda… / estoy casi seguro…”. Subjetivo pero basado en indicios.",
      "Verbos: 普通形（辞書・た・ない・なかった）＋ に違いない",
      "い形容詞: 普通形（〜い／〜くない／〜かった／〜くなかった）＋ に違いない",
      "な形容詞: 語幹＋だ／だった／ではない／ではなかった ＋ に違いない",
      "名詞: 名詞＋だ／だった／ではない／ではなかった ＋ に違いない",
      "Registro más cuidado/escrito: （名詞／な形）＋ である に違いない",
      "⚠ No es evidencia objetiva; en informes fríos usa 「〜と考えられる」「〜と思われる」.",
    ],
    color: "#22D3EE",
  },
  {
    title: "〜かもしれない — posibilidad (baja→media)",
    lines: [
      "Significa: “quizá / puede que… / tal vez…”. Suaviza la aseveración.",
      "Verbos: 普通形（辞書・た・ない・なかった）＋ かもしれない（会話：〜かも）",
      "い形容詞: 普通形（〜い／〜くない／〜かった／〜くなかった）＋ かもしれない",
      "な形容詞: 語幹＋だ／だった／ではない／ではなかった ＋ かもしれない",
      "名詞: 名詞＋だ／だった／ではない／ではなかった ＋ かもしれない",
      "Coloquial: 文末を「〜かも」「〜かもね」にすると柔らかい響き。",
      "⚠ Evítalo cuando necesitas compromiso u orden clara (suena inseguro).",
    ],
    color: "#34D399",
  },
];

const EQUIV = [
  "Evidencia + alta convicción → 〜に違いない",
  "Hipótesis sin afirmar → 〜かもしれない（＝〜かも）",
];

const PITFALLS = [
  "「に違いない」 es subjetivo: no lo presentes como hecho absoluto sin respaldo.",
  "「かもしれない」 reduce la fuerza de la oración; evita en instrucciones/mandatos.",
  "Con 名詞／な形 antes de に違いない en estilo formal, prefiere である（例：学生であるに違いない）。",
];

/* =========================================================
   Ejemplos (10) con audio
========================================================= */
const EXAMPLES: Ex[] = [
  { tag: "に違いない", jp: "この結果は入力ミスに違いない。", reading: "この けっか は にゅうりょく ミス に ちがいない。", es: "Este resultado debe ser un error de captura." },
  { tag: "に違いない", jp: "彼はもう駅に着いたに違いない。", reading: "かれ は もう えき に ついた に ちがいない。", es: "Él debe haber llegado ya a la estación." },
  { tag: "に違いない", jp: "あの静けさ… 会議はもう終わったに違いない。", reading: "あの しずけさ… かいぎ は もう おわった に ちがいない。", es: "Con ese silencio… la reunión sin duda terminó." },
  { tag: "かもしれない", jp: "今日は渋滞がひどいかもしれない。", reading: "きょう は じゅうたい が ひどい かもしれない。", es: "Puede que hoy el tráfico esté pesado." },
  { tag: "かもしれない", jp: "彼女は予定を勘違いしたかもしれない。", reading: "かのじょ は よてい を かんちがい した かもしれない。", es: "Quizá confundió el horario." },
  { tag: "かもしれない", jp: "仕様の解釈が人によって違うかもしれない。", reading: "しよう の かいしゃく が ひと に よって ちがう かもしれない。", es: "La interpretación de las especificaciones podría variar según la persona." },
  { tag: "に違いない", jp: "この足跡、犬のだに違いない。", reading: "この あしあと、いぬ の だ に ちがいない。", es: "Estas huellas deben ser de un perro." },
  { tag: "かもしれない", jp: "明日のピクニックは雨で中止かもしれない。", reading: "あした の ピクニック は あめ で ちゅうし かもしれない。", es: "Tal vez se cancele el picnic de mañana por lluvia." },
  { tag: "に違いない", jp: "彼の表情からして、良い知らせに違いない。", reading: "かれ の ひょうじょう からして、よい しらせ に ちがいない。", es: "Por su expresión, debe ser una buena noticia." },
  { tag: "かもしれない", jp: "この案ならコストを抑えられるかもしれない。", reading: "この あん なら コスト を おさえられる かもしれない。", es: "Con esta propuesta quizá podamos reducir costos." },
];

/* =========================================================
   Historia / Debate (7+ oraciones)
========================================================= */
const STORY_LINES = [
  "昨夜、研究室の電源が突然落ちたに違いないと思った。",
  "温度センサーのログが不自然だから、冷却不良が原因に違いない。",
  "でも、近所で停電があったかもしれないとも感じた。",
  "サーバーのファン音が弱かった… これは劣化の兆候に違いない。",
  "一方で、設定を誰かが変更したかもしれないという可能性も残る。",
  "まず原因を切り分ければ、無駄な交換を避けられるかもしれない。",
  "結論として、換気とセンサー校正は必要に違いない。",
  "念のため、非常電源の点検も依頼しておくかもしれない。"
];

/* =========================================================
   Test (8 ítems)
========================================================= */
type NuItem = {
  stem: string;
  options: ("に違いない" | "かもしれない")[];
  answer: "に違いない" | "かもしれない";
  why: string;
};
const NU_TEST: NuItem[] = [
  { stem: "足跡が濡れている… さっき雨が降っていた（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Indicios fuertes → alta convicción." },
  { stem: "彼、今日は来ない（　　）。既読がつかないし。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Falta certeza; probabilidad media/baja." },
  { stem: "この結論には計算ミスがある（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Quien habla está convencido por evidencia." },
  { stem: "明日は混む（　　）。連休前だから。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Es una suposición prudente, no un hecho." },
  { stem: "この声は田中さんの（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Reconocimiento claro del hablante." },
  { stem: "ネットが遅い… 回線の不具合（　　）。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Puede haber varias causas; no afirmes." },
  { stem: "鍵が見当たらない。車の中に置き忘れた（　　）。", options: ["に違いない", "かもしれない"], answer: "かもしれない", why: "Hipótesis sin confirmar." },
  { stem: "このデータの一致は偶然ではない（　　）。", options: ["に違いない", "かもしれない"], answer: "に違いない", why: "Convicción fuerte basada en evidencia." },
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

      {/* Formación explícita */}
      {QUICK.map((q, i) => (
        <View key={i} style={[styles.explBox, { borderColor: q.color }]}>
          <Text style={styles.boxTitle}>{q.title}</Text>
          {q.lines.map((l, j) => (
            <Text key={j} style={styles.note}>・{l}</Text>
          ))}
        </View>
      ))}

      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Elección rápida</Text>
        {EQUIV.map((s, i) => (
          <Text key={i} style={styles.note}>• {s}</Text>
        ))}
      </View>

      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Errores comunes</Text>
        {PITFALLS.map((s, i) => (
          <Text key={i} style={styles.note}>• {s}</Text>
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
      <Text style={styles.cardTitle}>Ejemplos con audio + lectura + traducción (10)</Text>
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
            <View style={[styles.tagPill, ex.tag === "に違いない" ? { backgroundColor: "#0891B2" } : { backgroundColor: "#047857" }]}>
              <Text style={styles.tagTxt}>{ex.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- Historia (debate narrativo) ---------- */
function StoryBox() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Historia — Convicción vs posibilidad (7+ oraciones)</Text>
      <Text style={styles.li}>Lee/escucha y detecta dónde el hablante suena seguro y dónde prudente.</Text>
      <View style={[styles.explBox, { marginTop: 6 }]}>
        {STORY_LINES.map((line, i) => (
          <Pressable key={i} onPress={() => speakJP(line)} style={{ marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconPlay />
            <Text style={styles.jp}>・{line}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.controlsRow, { marginTop: 8 }]}>
        <Pressable
          onPress={async () => {
            for (const l of STORY_LINES) {
              speakJP(l);
              await new Promise((r) => setTimeout(r, 1200));
            }
            speakES("Observa el contraste entre certeza y posibilidad en la historia.");
          }}
          style={styles.ctrlBtn}
        >
          <MCI name="playlist-play" size={18} color="#fff" />
          <Text style={styles.ctrlTxt}>Reproducir todo</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Test ---------- */
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
    speakES(ok ? "¡Correcto!" : "Casi… sigue practicando.");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Test de matices — elige lo más natural (8)</Text>
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
type TabKey = "quick" | "examples" | "story" | "nuance" | "kanji";
const TAB_LABELS: Record<TabKey, string> = {
  quick: "Guía",
  examples: "Ejemplos",
  story: "Historia",
  nuance: "Test",
  kanji: "Kanjis",
};
function TabBar({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const labels: TabKey[] = ["quick", "examples", "story", "nuance", "kanji"];
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
      subtitle="Cómo sonar seguro o prudente: deducción fuerte vs posibilidad — con audio, historia y test"
      ctas={[
        { label: "Escuchar guía", onPress: () => speakES("Repasemos 〜に違いない y 〜かもしれない con formación y ejemplos claros.") },
        { label: "Ir al test", onPress: () => setTab("nuance") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Marcar avance"
    >
      <TabBar tab={tab} setTab={setTab} />
      {tab === "quick" && <QuickBox />}
      {tab === "examples" && <ExamplesBox />}
      {tab === "story" && <StoryBox />}
      {tab === "nuance" && <NuanceTest />}
      {tab === "kanji" && <KanjiGrid />}

      {progress >= 1 && (
        <View style={[styles.card, { borderColor: "rgba(6, 182, 212, 0.5)" }]}>
          <Text style={styles.cardTitle}>🏅 ¡Unidad completada!</Text>
          <Text style={styles.li}>Has visto formación, ejemplos, historia y test.</Text>
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
