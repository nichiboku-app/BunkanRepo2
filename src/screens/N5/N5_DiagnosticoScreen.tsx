// src/screens/N5/N5_DiagnosticoScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useMemo, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SakuraLayer from "../../components/exam/SakuraLayer";
import ScrollPergamino from "../../components/exam/ScrollPergamino";
import ChoicePill from "../../components/ui/ChoicePill";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

/* ★★★ XP/Logros ★★★ */
import { awardOnSuccess, useAwardOnEnter } from "../../services/achievements";

/* -------- ASSETS -------- */
const BG_WAVES = require("../../../assets/images/diagnostic/bg_waves.webp");
const MAPACHE  = require("../../../assets/images/diagnostic/mapache_estudio.webp");

/* -------- TIPOS -------- */
type ColorKey = "pink"|"teal"|"amber"|"peach";
type Q = {
  id: string;
  kind: "kana_id" | "read_word" | "grammar_particle" | "gobi_desu";
  promptJP?: string;
  promptES: string;
  stem: string;
  options: string[];
  correct: number;
  colorMap?: ColorKey[];
  explainJP?: string;
  explainES?: string;
};

/* -------- UTIL -------- */
function lcg(seed: number) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0); }
function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function makeShuffledQuestion(
  base: Omit<Q, "options" | "correct"> & { options: string[], correctValue: string },
  rnd: () => number
): Q {
  const shuffled = shuffle(base.options, rnd);
  const correct = Math.max(0, shuffled.indexOf(base.correctValue));
  return {
    id: base.id,
    kind: base.kind,
    promptJP: base.promptJP,
    promptES: base.promptES,
    stem: base.stem,
    options: shuffled,
    correct,
    colorMap: base.colorMap,
    explainJP: base.explainJP,
    explainES: base.explainES,
  };
}

/* -------- DATOS -------- */
const KANA: [string, string, string][] = [
  ["あ","a","『あ』は “a” です。"],["い","i","『い』は “i” です。"],["う","u","『う』は “u” です。"],
  ["え","e","『え』は “e” です。"],["お","o","『お』は “o” です。"],
  ["か","ka","『か』は “ka” です。"],["き","ki","『き』は “ki” です。"],["く","ku","『く』は “ku” です。"],
  ["け","ke","『け』は “ke” です。"],["こ","ko","『こ』は “ko” です。"],
  ["さ","sa","『さ』は “sa” です。"],["し","shi","『し』は “shi” です。"],["す","su","『す』は “su” です。"],
  ["せ","se","『せ』は “se” です。"],["そ","so","『そ』は “so” です。"],
  ["た","ta","『た』は “ta” です。"],["ち","chi","『ち』は “chi” です。"],["つ","tsu","『つ』は “tsu” です。"],
  ["て","te","『て』は “te” です。"],["と","to","『と』は “to” です。"],
  ["な","na","『な』は “na” です。"],["に","ni","『に』は “ni” です。"],["ぬ","nu","『ぬ』は “nu” です。"],
  ["ね","ne","『ね』は “ne” です。"],["の","no","『の』は “no” です。"],
  ["は","ha","『は』は “ha” です。"],["ひ","hi","『ひ』は “hi” です。"],["ふ","fu","『ふ』は “fu” です。"],
  ["へ","he","『へ』は “he” です。"],["ほ","ho","『ほ』は “ho” です。"],
  ["ま","ma","『ま』は “ma” です。"],["み","mi","『み』は “mi” です。"],["む","mu","『む』は “mu” です。"],
  ["め","me","『め』は “me” です。"],["も","mo","『も』は “mo” です。"],
  ["や","ya","『や』は “ya” です。"],["ゆ","yu","『ゆ』は “yu” です。"],["よ","yo","『よ』は “yo” です。"],
  ["ら","ra","『ら』は “ra” です。"],["り","ri","『り』は “ri” です。"],["る","ru","『る』は “ru” です。"],
  ["れ","re","『れ』は “re” です。"],["ろ","ro","『ろ』は “ro” です。"],
  ["わ","wa","『わ』は “wa” です。"],["を","wo","『を』は “wo/o” です。"],["ん","n","『ん』は “n” です。"],
];

/* -------- PREGUNTAS (100, sin "word_order") -------- */
function buildQuestions(): Q[] {
  const rnd = lcg(20251104);
  const colors: ColorKey[] = ["pink","teal","amber","peach"];
  const out: Q[] = [];

  /* 1) KANA ID — 50 preguntas */
  for (let i = 0; i < 50; i++) {
    const idx = (rnd() % KANA.length);
    const [kana, roma, jp] = KANA[idx];

    // crea 3 distractores
    const pool = new Set<string>([roma]);
    while (pool.size < 4) {
      const j = rnd() % KANA.length;
      if (j !== idx) pool.add(KANA[j][1]);
    }
    const opts = Array.from(pool);

    out.push(makeShuffledQuestion({
      id: `kana_${i}`,
      kind: "kana_id",
      promptJP: "この文字は なんですか？",
      promptES: "¿Qué sonido representa este kana?",
      stem: kana,
      options: opts,
      correctValue: roma,
      colorMap: colors,
      explainJP: `正解！ ${jp}`,
      explainES: `Correcto: 「${kana}」 se lee “${roma}”.`,
    }, rnd));
  }

  /* 2) PARTÍCULAS — 25 preguntas */
  const particlesBase = [
    { s: "ほん __ かいます。", ok: "を", jp:"目的語には『を』", es:"『を』 marca objeto directo." },
    { s: "がっこう __ いきます。", ok: "に", jp:"到着点は『に』", es:"Dirección/destino con 『に』." },
    { s: "にほんご __ べんきょうします。", ok: "を", jp:"目的語には『を』", es:"『を』 para objeto directo." },
    { s: "きょう __ テストが あります。", ok: "は", jp:"話題提示は『は』", es:"『は』 marca el tema." },
    { s: "うち __ ごはんを たべます。", ok: "で", jp:"場所『で』＋動作", es:"『で』 marca el lugar de la acción." },
  ];
  const particleOptions = ["を","に","で","は","が","へ"];

  for (let i = 0; i < 25; i++) {
    const base = particlesBase[i % particlesBase.length];
    const optsSet = new Set<string>([base.ok]);
    while (optsSet.size < 4) {
      const c = particleOptions[rnd() % particleOptions.length];
      optsSet.add(c);
    }
    const opts = Array.from(optsSet);

    out.push(makeShuffledQuestion({
      id: `prt_${i}`,
      kind: "grammar_particle",
      promptJP: "助詞（じょし）を えらびましょう。",
      promptES: "Completa con la partícula correcta:",
      stem: base.s.replace("__","＿"),
      options: opts,
      correctValue: base.ok,
      colorMap: colors,
      explainJP: base.jp,
      explainES: base.es,
    }, rnd));
  }

  /* 3) DESU/MASU — 10 preguntas */
  const desuBase = [
    { s: "わたしは がくせい＿＿。",   ok: "です",  opts: ["です","ます","でした","ではない"], jp:"丁寧語：名詞＋です", es:"Con sustantivos se usa です." },
    { s: "まいにち べんきょう＿＿。", ok: "します", opts: ["します","です","した","しない"], jp:"『する』の丁寧形＝します", es:"Verbo する en forma cortés: します." },
    { s: "きのう テスト＿＿。",       ok: "でした", opts: ["でした","です","ではない","します"], jp:"過去：でした", es:"Pasado de です es でした." },
    { s: "いま はれ＿＿。",           ok: "です",  opts: ["です","でした","じゃない","します"], jp:"名詞述語『です』", es:"Predicado nominal con です." },
    { s: "こんしゅう は いそがしい＿＿。", ok: "です", opts: ["です","ました","ではない","する"], jp:"イ形容詞＋です", es:"Adjetivo i + です para cortesía." },
  ];
  for (let i = 0; i < 10; i++) {
    const base = desuBase[i % desuBase.length];
    out.push(makeShuffledQuestion({
      id: `desu_${i}`,
      kind: "gobi_desu",
      promptJP: "正しい形は どれ？",
      promptES: "Elige la forma correcta:",
      stem: base.s,
      options: base.opts,
      correctValue: base.ok,
      colorMap: colors,
      explainJP: base.jp,
      explainES: base.es,
    }, rnd));
  }

  /* 4) LECTURA DE PALABRA — 15 preguntas */
  const words: [string, string, string][] = [
    ["さくら","sakura","『さくら』は “sakura” です。"],
    ["がっこう","gakkou","『がっこう』は “gakkou” です。"],
    ["ともだち","tomodachi","『ともだち』は “tomodachi” です。"],
    ["ねこ","neko","『ねこ』は “neko” です。"],
    ["みず","mizu","『みず』は “mizu” です。"],
    ["きょう","kyou","『きょう』は “kyou” です。"],
    ["あした","ashita","『あした』は “ashita” です。"],
    ["せんせい","sensei","『せんせい』は “sensei” です。"],
    ["でんしゃ","densha","『でんしゃ』は “densha” です。"],
    ["えいが","eiga","『えいが』は “eiga” です。"],
    ["くるま","kuruma","『くるま』は “kuruma” です。"],
    ["じしょ","jisho","『じしょ』は “jisho” です。"],
    ["てがみ","tegami","『てがみ』は “tegami” です。"],
    ["きっぷ","kippu","『きっぷ』は “kippu” です。"],
    ["ぎゅうにゅう","gyuunyuu","『ぎゅうにゅう』は “gyuunyuu” です。"],
  ];
  for (let i = 0; i < 15; i++) {
    const [w, roma, jp] = words[i % words.length];

    const sylls = ["ka","ki","ku","ke","ko","sa","shi","su","se","so","ta","chi","tsu","te","to","na","ni","nu","ne","no","ra","ri","ru","re","ro","ya","yu","yo","ga","gi","gu","ge","go"];
    const pool = new Set<string>([roma]);
    while (pool.size < 4) {
      const s = sylls[rnd() % sylls.length] + (rnd()%2 ? "a" : "o");
      if (s !== roma) pool.add(s);
    }
    const opts = Array.from(pool);

    out.push(makeShuffledQuestion({
      id:`read_${i}`,
      kind:"read_word",
      promptJP:"この言葉（ことば）の よみかたは？",
      promptES:"¿Cómo se lee esta palabra?",
      stem:w,
      options:opts,
      correctValue: roma,
      colorMap:colors,
      explainJP: jp,
      explainES:`Se pronuncia “${roma}”.`
    }, rnd));
  }

  // Mezcla global
  return shuffle(out, rnd).slice(0, 100);
}

/* -------- UI -------- */
export default function N5_DiagnosticoScreen() {
  const QUESTIONS = useMemo(buildQuestions, []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fbH, setFbH] = useState(0);
  const [finished, setFinished] = useState(false); // evita doble premio

  const { playCorrect, playWrong } = useFeedbackSounds();

  /* ★ onEnter: +10 XP primera vez, +5 en repetición, logro de primera visita */
  useAwardOnEnter("N5_Diagnostico", {
    xpOnEnter: 10,
    repeatXp: 5,
    achievementId: "intro_primera_visita",
    achievementSub: "N5",
    meta: { label: "Diagnóstico N5" },
  });

  const q = QUESTIONS[idx];
  const { width: W, height: H } = Dimensions.get("window");

  // No exceder ancho de pantalla
  const PANEL_W = Math.min(Math.round(W * 0.985), W - 8);
  const PANEL_H = Math.round(H * 0.83);

  const progress = `${idx + 1} / ${QUESTIONS.length}`;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) {
      setScore(s => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
  }

  async function handleFinishOnce() {
    if (finished) return;
    setFinished(true);
    // ★ onSuccess: +20 XP y logro de completado
    await awardOnSuccess("N5_Diagnostico", {
      xpOnSuccess: 20,
      achievementId: "n5_diagnostico_completado",
      achievementSub: "N5",
      meta: { score, total: QUESTIONS.length },
    });
  }

  function next() {
    if (idx < QUESTIONS.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
    } else if (selected !== null) {
      // última pregunta respondida → éxito
      handleFinishOnce();
    }
  }

  function prev() {
    if (idx > 0) {
      setIdx(idx - 1);
      setSelected(null);
    }
  }

  const headerColors = ["#85C8FF","#7FD8FF","#FFC14D"];

  // 2x2 círculos (pequeños, fijos)
  const OPTION_SIZE = 88;
  const renderCell = (i: number) => {
    const op = q.options[i];
    const color = (q.colorMap && q.colorMap[i % q.colorMap.length]) || "pink";
    return (
      <View key={i} style={styles.optCell}>
        <ChoicePill
          label={op}
          color={color as any}
          disabled={selected !== null}
          onPress={() => pick(i)}
          style={{ width: OPTION_SIZE, height: OPTION_SIZE, borderRadius: OPTION_SIZE / 2 }}
          labelStyle={{ fontSize: 20, fontWeight: "900" }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ExpoImage source={BG_WAVES} style={StyleSheet.absoluteFill} contentFit="cover" />
      <SakuraLayer width={W} height={H} count={14} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}><Text style={styles.badgeText}>{progress}</Text></View>
        <Text style={styles.titleJP}>
          <Text style={{ color: headerColors[0], fontWeight:"900" }}>日</Text>
          <Text style={{ color: headerColors[1], fontWeight:"900" }}>本</Text>
          <Text style={{ color: "#AEE3FF",       fontWeight:"900" }}>語</Text>
          <Text> </Text><Text style={{ fontWeight:"900" }}>N5</Text><Text> </Text>
          <Text style={{ color: headerColors[2], fontWeight:"900" }}>診断！</Text>
        </Text>
        <Text style={styles.subtitle}>8 actividades ・ Progreso educativo</Text>
        <View style={styles.tipsBtn}><Ionicons name="book-outline" size={18} color="#2b2117" /></View>
      </View>

      {/* Centro estable */}
      <View style={styles.center}>
        <ScrollPergamino width={PANEL_W} height={PANEL_H}>
          <View style={styles.panel}>
            {/* STEM */}
            <View style={styles.stemBox}>
              <Text
                style={styles.bigKana}
                numberOfLines={q.kind === "kana_id" ? 1 : 2}
                adjustsFontSizeToFit
              >
                <Text style={{ fontSize: q.kind === "kana_id" ? 96 : 40 }}>
                  {q.stem}
                </Text>
              </Text>
            </View>

            {/* PROMPTS */}
            <View style={styles.promptsBox}>
              <Text style={styles.promptJP} numberOfLines={1} adjustsFontSizeToFit>
                {q.promptJP ?? ""}
              </Text>
              <Text style={[styles.promptES, { fontWeight: "900", marginTop: 4 }]} numberOfLines={1} adjustsFontSizeToFit>
                {q.promptES}
              </Text>
            </View>

            {/* OPCIONES 2×2 */}
            <View style={styles.optionsBox}>
              <View style={styles.row}>{renderCell(0)}{renderCell(1)}</View>
              <View style={[styles.row, { marginTop: 10 }]}>{renderCell(2)}{renderCell(3)}</View>
            </View>
          </View>
        </ScrollPergamino>
      </View>

      {/* Mapache */}
      <ExpoImage
        source={MAPACHE}
        style={{ position:"absolute", left: 14, bottom: 550, width: 120, height: 120 }}
        contentFit="contain"
        pointerEvents="none"
      />

      {/* FEEDBACK a la derecha del mapache */}
      {selected !== null && (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 14 + 120 + 10,
            bottom: 550 + (120 - fbH) / 2,
            right: 16,
            alignItems: "flex-start",
          }}
        >
          <View
            onLayout={e => setFbH(e.nativeEvent.layout.height)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: (selected === q.correct) ? "#DCF7E3" : "#FBE4E4",
              borderWidth: 1,
              borderColor: (selected === q.correct) ? "#96D1A5" : "#E3B2B2",
              maxWidth: 360,
            }}
          >
            <Text style={{ fontWeight: "900", textAlign: "left", color: (selected === q.correct) ? "#1f7a3e" : "#8b1a1a" }}>
              {selected === q.correct ? "¡Correcto!" : "Incorrecto"}
            </Text>

            {selected !== q.correct && (
              <Text style={{ marginTop: 4, textAlign: "left", fontWeight: "700" }}>
                Correcta: {q.options[q.correct]}
              </Text>
            )}

            {!!q.explainES && (
              <Text style={{ marginTop: 4, textAlign: "left" }}>
                {q.explainES}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Barra inferior */}
      <View style={[styles.bottomBar, { bottom: 92 }]}>
        <View style={[styles.navPill, { backgroundColor: "#1E2A44" }]} onTouchEnd={prev}>
          <Ionicons name="chevron-back" size={18} color="#fff" /><Text style={styles.navText}>Anterior</Text>
        </View>
        <Text style={styles.progressMid}>Puntaje: {score}</Text>
        <View style={[styles.navPill, { backgroundColor: "#2E3E63" }]} onTouchEnd={next}>
          <Text style={styles.navText}>Siguiente</Text><Ionicons name="chevron-forward" size={18} color="#fff" />
        </View>
      </View>
    </View>
  );
}

/* -------- STYLES -------- */
const styles = StyleSheet.create({
  header: { paddingTop: 8, paddingBottom: 2, alignItems: "center" },
  badge: {
    position: "absolute", left: 18, top: 2, height: 28, minWidth: 46, paddingHorizontal: 10,
    borderRadius: 14, backgroundColor: "#FFE9C6", borderWidth: 1, borderColor: "#E3BBB3",
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { fontWeight: "900", color: "#6B3C2F", fontSize: 12 },
  titleJP: { color: "#EAF1FF", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: "#ffffffaa", fontWeight: "700", fontSize: 12, marginTop: 2 },
  tipsBtn: {
    position: "absolute", right: 18, top: 2, width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#f1e2c6", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#d8c09a"
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  panel: { flex: 1, paddingHorizontal: 30,  paddingTop: -20, paddingBottom: 8 },

  // Zonas con altura proporcional
  stemBox:   { flex: 3, alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 6 },
  promptsBox:{ flex: 1.2, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  optionsBox:{ flex: 3.1, paddingTop: 6 },

  row: { flexDirection: "row", justifyContent: "space-evenly" },
  optCell: { width: 120, alignItems: "center" },

  bigKana: {
    color: "#37C6C9",
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: "center",
  },
  promptJP: { fontSize: 14, color: "#40332a", textAlign: "center" },
  promptES: { fontSize: 16, color: "#1c1a19", textAlign: "center" },

  bottomBar: {
    position: "absolute", left: 12, right: 12, height: 56,
    backgroundColor: "rgba(16,22,36,0.66)", borderRadius: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  navPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 40, borderRadius: 20 },
  navText: { color: "#fff", fontWeight: "800", marginHorizontal: 6 },
  progressMid: { color: "#EAF1FF", fontWeight: "900" },
});
