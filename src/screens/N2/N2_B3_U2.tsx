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
type Ex = { jp: string; reading: string; es: string; tag: "っけ" | "ものだ" | "んじゃない？" };
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
  "5fd8": require("../../../assets/kanjivg/n2/5fd8_nums.webp"), // 忘
  "601d": require("../../../assets/kanjivg/n2/601d_nums.webp"), // 思
  "6628": require("../../../assets/kanjivg/n2/6628_nums.webp"), // 昔
  "82e5": require("../../../assets/kanjivg/n2/82e5_nums.webp"), // 若
  "4f8b": require("../../../assets/kanjivg/n2/4f8b_nums.webp"), // 例
  "8ad6": require("../../../assets/kanjivg/n2/8ad6_nums.webp"), // 論
  "8b70": require("../../../assets/kanjivg/n2/8b70_nums.webp"), // 議
  "72ec": require("../../../assets/kanjivg/n2/72ec_nums.webp"), // 独
  "4f4f": require("../../../assets/kanjivg/n2/4f4f_nums.webp"), // 住
  "610f": require("../../../assets/kanjivg/n2/610f_nums.webp"), // 意
  "899a": require("../../../assets/kanjivg/n2/899a_nums.webp"), // 覚
  "611f": require("../../../assets/kanjivg/n2/611f_nums.webp"), // 感
};

function createKanji(kanji: string, readingJP: string, meaningEs: string, hex?: string, words: Word[] = []): KanjiItem {
  const normalizedHex = hex ? hex.replace(/^0+/, "").toLowerCase() : undefined;
  const strokeAsset = normalizedHex ? STROKE_ASSETS[normalizedHex] : undefined;
  return { kanji, readingJP, meaningEs, hex: normalizedHex, strokeAsset, words };
}

const KANJIS: KanjiItem[] = [
  createKanji("忘", "わす(れる)", "olvidar", "5fd8", [{ jp: "忘れ物", reading: "わすれもの", es: "objeto perdido" }]),
  createKanji("思", "おも(う)", "pensar", "601d", [{ jp: "思い出", reading: "おもいで", es: "recuerdo" }]),
  createKanji("昔", "むかし", "antiguamente", "6628", [{ jp: "昔話", reading: "むかしばなし", es: "cuento tradicional" }]),
  createKanji("若", "わか(い)／じゃく", "joven", "82e5"),
  createKanji("例", "れい", "ejemplo", "4f8b", [{ jp: "例えば", reading: "たとえば", es: "por ejemplo" }]),
  createKanji("論", "ろん", "discurso; lógica", "8ad6", [{ jp: "議論", reading: "ぎろん", es: "debate" }]),
  createKanji("議", "ぎ", "deliberar", "8b70", [{ jp: "会議", reading: "かいぎ", es: "reunión" }]),
  createKanji("独", "ひと(り)／どく", "solo; independiente", "72ec", [{ jp: "独り暮らし", reading: "ひとりぐらし", es: "vivir solo" }]),
  createKanji("住", "す(む)／じゅう", "vivir (residir)", "4f4f"),
  createKanji("意", "い", "intención; idea", "610f", [{ jp: "意見", reading: "いけん", es: "opinión" }]),
  createKanji("覚", "おぼ(える)／かく", "recordar", "899a", [{ jp: "感覚", reading: "かんかく", es: "sensación" }]),
  createKanji("感", "かん", "sentir", "611f", [{ jp: "感想", reading: "かんそう", es: "impresiones" }]),
];

/* =========================================================
   Guía rápida (qué es / cómo se une)
========================================================= */
const QUICK = [
  {
    title: "〜っけ",
    lines: [
      "Recordar o confirmar algo que ‘no recuerdas bien’: “¿no era…?”, “¿cómo era…?”",
      "Unión: 普通形 (pasado muy frecuente) ＋ っけ。/ だっけ。",
      "Coloquial, entonación ascendente. Ej: 「明日って休みだっけ？」",
    ],
    color: "#22D3EE",
  },
  {
    title: "〜ものだ",
    lines: [
      "① Costumbre/verdad general: “se suele…”, “así es la vida”.",
      "② Recuerdo nostálgico (pasado): “solía…”.",
      "③ Exclamativo emotivo: “¡De veras…!”",
      "Unión: V-辞書/ない形 ＋ ものだ / V-た ＋ ものだ。",
    ],
    color: "#34D399",
  },
  {
    title: "〜んじゃない？",
    lines: [
      "Suaviza una opinión/consejo: “¿no crees que…?”, “¿no sería que…?”",
      "Es 〜のではない？ → forma coloquial 〜んじゃない？",
      "Unión: 普通形 ＋ んじゃない？（なA/名 だ→なんじゃない？）",
    ],
    color: "#F59E0B",
  },
];

const EQUIV = [
  "‘¿No era…?’ ≈ 〜っけ",
  "‘Se suele…’ ≈ 〜ものだ (generalidad)",
  "‘¿No crees que…?’ ≈ 〜んじゃない？ (sugerencia suave)",
];

const PITFALLS = [
  "〜っけ es para recordar/confirmar, no para afirmar seguro.",
  "〜ものだ (generalidad) ≠ 〜ことだ (recomendación).",
  "〜んじゃない？ es suave; 〜じゃない！ (¡no!) es reproche.",
];

/* =========================================================
   Ejemplos con audio
========================================================= */
const EXAMPLES: Ex[] = [
  { tag: "っけ", jp: "提出期限って、明日だっけ？", reading: "ていしゅつ きげん って、あした だっけ？", es: "¿La fecha de entrega era mañana?" },
  { tag: "っけ", jp: "田中さん、どこの部署だったっけ。", reading: "たなか さん、どこ の ぶしょ だったっけ。", es: "Tanaka, ¿de qué departamento era?" },
  { tag: "ものだ", jp: "若い頃は、毎晩のように友達と遊んだものだ。", reading: "わかい ころ は、まいばん の よう に ともだち と あそんだ ものだ。", es: "Cuando era joven, solía salir casi todas las noches con amigos." },
  { tag: "ものだ", jp: "失敗は誰にでもあるものだ。", reading: "しっぱい は だれ に でも ある ものだ。", es: "Los errores le ocurren a cualquiera." },
  { tag: "んじゃない？", jp: "一人暮らし、いい経験になるんじゃない？", reading: "ひとりぐらし、いい けいけん に なる んじゃない？", es: "Vivir solo, ¿no crees que sería una buena experiencia?" },
  { tag: "んじゃない？", jp: "資料は先に共有した方がいいんじゃない？", reading: "しりょう は さき に きょうゆう した ほう が いい んじゃない？", es: "¿No sería mejor compartir los materiales antes?" },
];

/* =========================================================
   Dinámicas — Roleplay interactivo con ramificación
========================================================= */
type RPTag = "っけ" | "ものだ" | "んじゃない？";
type RPChoice = { key: "A" | "B" | "C"; jp: string; es: string; tag: RPTag };
type RPStep = { prompt: string; choices: RPChoice[]; tip?: string };
type RPScene = { title: string; context: string; steps: RPStep[] };

const ROLEPLAY_SCENES: RPScene[] = [
  {
    title: "議題：新サービスの開始時期",
    context:
      "Equipo de producto discute si lanzar en verano. Usa 〜っけ (confirmar), 〜ものだ (generalidad) y 〜んじゃない？ (sugerir).",
    steps: [
      {
        prompt: "1) Abres la reunión. ¿Cómo propones el marco?",
        tip: "Sugerencia suave → 〜んじゃない？ / Generalidad → 〜ものだ / Confirmación → 〜っけ",
        choices: [
          { key: "A", jp: "夏は旅行客が増えるんじゃない？ その波に乗った方がいいんじゃない？", es: "¿No crees que en verano suben los turistas? Conviene aprovechar esa ola.", tag: "んじゃない？" },
          { key: "B", jp: "繁忙期は品質が落ちるものだ。まずは安定運用を優先しよう。", es: "En alta demanda suele bajar la calidad. Prioricemos estabilidad.", tag: "ものだ" },
          { key: "C", jp: "去年の夏のコンバージョン率って、どれくらいだったっけ？", es: "¿Cuánto era la conversión del verano pasado?", tag: "っけ" },
        ],
      },
      {
        prompt: "2) Te preguntan por presupuesto. ¿Cómo respondes?",
        choices: [
          { key: "A", jp: "予算の最終承認って、今週末までだったっけ？", es: "¿La aprobación final del presupuesto era hasta este fin de semana?", tag: "っけ" },
          { key: "B", jp: "大規模施策は想定外のコストが出るものだ。余裕を見よう。", es: "Las iniciativas grandes suelen traer costos inesperados. Dejemos margen.", tag: "ものだ" },
          { key: "C", jp: "一部の機能は段階的に出せばいいんじゃない？", es: "¿No crees que podemos lanzar algunas funciones por fases?", tag: "んじゃない？" },
        ],
      },
      {
        prompt: "3) Cierre. Necesitas alinear el plan.",
        choices: [
          { key: "A", jp: "まずβ版を先に出すのが無難なんじゃない？", es: "¿No sería más seguro sacar primero una beta?", tag: "んじゃない？" },
          { key: "B", jp: "検証は地道に重ねるものだ。段階ごとにKPIを見よう。", es: "La verificación es paso a paso. Midamos KPI por fases.", tag: "ものだ" },
          { key: "C", jp: "ローンチ候補日って、8月15日だったっけ？", es: "¿La fecha candidata de lanzamiento era el 15 de agosto?", tag: "っけ" },
        ],
      },
    ],
  },
  {
    title: "議題：資料共有のタイミング",
    context: "¿Cuándo compartir materiales? Úsalas según intención: confirmar, generalizar o sugerir.",
    steps: [
      {
        prompt: "1) Inicio del debate.",
        choices: [
          { key: "A", jp: "ミーティング前日に送るのが普通なものだと思う。", es: "Se suele enviar el día previo.", tag: "ものだ" },
          { key: "B", jp: "早めに出して読んでもらった方がいいんじゃない？", es: "¿No sería mejor compartirlos antes para que los lean?", tag: "んじゃない？" },
          { key: "C", jp: "添付ファイルの上限って、何MBだったっけ？", es: "¿Cuál era el límite de tamaño del adjunto?", tag: "っけ" },
        ],
      },
      {
        prompt: "2) Objeciones y logística.",
        choices: [
          { key: "A", jp: "人は締切が近いと集中するものだ。前日で十分じゃない？", es: "La gente se concentra cerca de la fecha límite. ¿No basta con el día previo?", tag: "ものだ" },
          { key: "B", jp: "要点だけ先に配布したらどうなんじゃない？", es: "¿No crees que distribuir primero los puntos clave?", tag: "んじゃない？" },
          { key: "C", jp: "出席者の確定って、もう終わったっけ？", es: "¿Ya estaba cerrada la lista de asistentes?", tag: "っけ" },
        ],
      },
    ],
  },
];

/* =========================================================
   Test de matices
========================================================= */
type NuItem = {
  stem: string;
  options: ("っけ" | "ものだ" | "んじゃない？")[];
  answer: "っけ" | "ものだ" | "んじゃない？";
  why: string;
};
const NU_TEST: NuItem[] = [
  { stem: "この案件の担当、誰だった（　　）？", options: ["っけ", "ものだ", "んじゃない？"], answer: "っけ", why: "Confirmar algo que no recuerdas bien → 〜っけ。" },
  { stem: "子供は好奇心が強い（　　）。", options: ["っけ", "ものだ", "んじゃない？"], answer: "ものだ", why: "Generalidad/verdad común → 〜ものだ。" },
  { stem: "今日のうちに送った方がいい（　　）。", options: ["っけ", "ものだ", "んじゃない？"], answer: "んじゃない？", why: "Sugerencia/opinión suave → 〜んじゃない？。" },
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
            <Text key={j} style={styles.note}>・{l}</Text>
          ))}
        </View>
      ))}
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Equivalencias</Text>
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
      <Text style={styles.cardTitle}>Ejemplos con audio + lectura + traducción</Text>
      <View style={styles.controlsRow}>
        <Chip label="Todos" on={() => setFilter("all")} on={filter === "all"} />
        <Chip label="〜っけ" on={() => setFilter("っけ")} on={filter === "っけ"} />
        <Chip label="〜ものだ" on={() => setFilter("ものだ")} on={filter === "ものだ"} />
        <Chip label="〜んじゃない？" on={() => setFilter("んじゃない？")} on={filter === "んじゃない？"} />
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
                ex.tag === "っけ"
                  ? { backgroundColor: "#0891B2" }
                  : ex.tag === "ものだ"
                  ? { backgroundColor: "#047857" }
                  : { backgroundColor: "#B45309" },
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
  const [used, setUsed] = useState<{ "っけ": boolean; "ものだ": boolean; "んじゃない？": boolean }>({
    "っけ": false,
    "ものだ": false,
    "んじゃない？": false,
  });

  const scene = ROLEPLAY_SCENES[sceneIdx];
  const step = scene.steps[stepIdx];

  useEffect(() => {
    // al cambiar de escena, resetea
    setStepIdx(0);
    setTranscript([]);
    setUsed({ "っけ": false, "ものだ": false, "んじゃない？": false });
  }, [sceneIdx]);

  const pick = (choice: RPChoice) => {
    // Guarda elección
    setTranscript((prev) => [...prev, choice]);
    setUsed((u) => ({ ...u, [choice.tag]: true }));
    speakJP(choice.jp);
    // Avanza al siguiente paso si existe
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
    const flags = { "っけ": false, "ものだ": false, "んじゃない？": false };
    for (const c of copy) flags[c.tag] = true;
    setUsed(flags);
  };

  const resetScene = () => {
    setStepIdx(0);
    setTranscript([]);
    setUsed({ "っけ": false, "ものだ": false, "んじゃない？": false });
  };

  const finished = stepIdx >= scene.steps.length - 1 && transcript.length === scene.steps.length;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Roleplay — Opiniones en una reunión</Text>
      <Text style={styles.li}>Elige A/B/C en cada turno: ¡la historia avanza con tu elección!</Text>

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
      {!finished && (
        <View style={[styles.explBox, { marginTop: 8 }]}>
          <Text style={styles.boxTitle}>
            Turno {stepIdx + 1} / {scene.steps.length}
          </Text>
          <Text style={styles.note}>→ {step.prompt}</Text>
          {step.tip ? <Text style={[styles.note, { opacity: 0.8 }]}>💡 {step.tip}</Text> : null}

          <View style={{ gap: 8, marginTop: 10 }}>
            {step.choices.map((ch) => {
              const color = ch.tag === "っけ" ? "#0891B2" : ch.tag === "ものだ" ? "#047857" : "#B45309";
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
          <Text style={styles.note}>• 〜っけ: {used["っけ"] ? "✔" : "✖"}</Text>
          <Text style={styles.note}>• 〜ものだ: {used["ものだ"] ? "✔" : "✖"}</Text>
          <Text style={styles.note}>• 〜んじゃない？: {used["んじゃない？"] ? "✔" : "✖"}</Text>

          <View style={[styles.controlsRow, { marginTop: 10 }]}>
            <Pressable onPress={resetScene} style={styles.ctrlBtn}>
              <MCI name="replay" size={18} color="#fff" />
              <Text style={styles.ctrlTxt}>Volver a intentar</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const msg =
                  used["っけ"] && used["ものだ"] && used["んじゃない？"]
                    ? "¡Dominaste las tres! 🏅"
                    : "Buen intento. Juega de nuevo usando las tres.";
                speakES(msg);
              }}
              style={styles.ctrlBtn}
            >
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
    hook: "初期費用って、いくらかかったっけ？",
    pros: ["自立心が育つものだ。", "生活スキルが身につくものだ。"],
    cons: ["家賃や光熱費、思ったより負担が大きいんじゃない？", "防犯や健康管理、気をつけないといけないんじゃない？"],
  };
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Debate corto — 「一人暮らし」 ¿Debe irse a vivir solo?</Text>
      <Text style={styles.li}>
        Usa 〜ものだ para generalidades, 〜んじゃない？ para sugerencias y 〜っけ para confirmar datos.
      </Text>

      <View style={styles.explBox}>
        <Text style={styles.boxTitle}>Gancho</Text>
        <Pressable onPress={() => speakJP(p.hook)}>
          <Text style={styles.jp}>・{p.hook}</Text>
        </Pressable>
      </View>

      <View style={[styles.tileRow, { marginTop: 8 }]}>
        <View style={[styles.formTile, { borderColor: "#34D399" }]}>
          <Text style={styles.tileHead}>Pros (ものだ)</Text>
          {p.pros.map((t, i) => (
            <Pressable key={i} onPress={() => speakJP(t)}>
              <Text style={styles.note}>• {t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.formTile, { borderColor: "#F59E0B" }]}>
          <Text style={styles.tileHead}>Contras (んじゃない？)</Text>
          {p.cons.map((t, i) => (
            <Pressable key={i} onPress={() => speakJP(t)}>
              <Text style={styles.note}>• {t}</Text>
            </Pressable>
          ))}
        </View>
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
          const color = o === "っけ" ? "#0891B2" : o === "ものだ" ? "#047857" : "#B45309";
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
    // 👇 fuerza trazos/números a blanco
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
export default function N2_B3_U2() {
  const [tab, setTab] = useState<TabKey>("quick");
  const [progress, setProgress] = useState(0);
  const next = () => setProgress((p) => Math.min(1, p + 0.25));

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b3_u2.webp")}
      accent={accent}
      breadcrumb="B3 · U2"
      title="〜っけ／〜ものだ／〜んじゃない？"
      subtitle="Memoria, costumbres/verdades y sugerencias suaves — con audio, roleplay, debate y test"
      ctas={[
        { label: "Escuchar guía", onPress: () => speakES("Repasemos 〜っけ, 〜ものだ y 〜んじゃない？ con ejemplos claros.") },
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
          <Text style={styles.li}>Has recorrido teoría, ejemplos, roleplay, debate y test.</Text>
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
  tipRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  tipTxt: { color: "rgba(255,255,255,0.9)", flex: 1 },

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
    // --- modal: lista de palabras en blanco ---
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
