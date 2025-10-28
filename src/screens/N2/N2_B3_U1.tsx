// src/screens/N2/N2_B3_U1.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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
const accent = "#F59E0B";

/* ---------- TTS ---------- */
function speakJP(text: string) { try { Speech.stop(); Speech.speak(text, { language: "ja-JP", rate: 0.98, pitch: 1.02 }); } catch {} }
function speakES(text: string) { try { Speech.stop(); Speech.speak(text, { language: "es-MX", rate: 1.0, pitch: 1.0 }); } catch {} }

/* =========================================================
   Tipos
========================================================= */
type Ex = { jp: string; reading: string; es: string; tag: "わけだ" | "とは限らない" | "わけではない" | "わけがない" };
type Word = { jp: string; reading: string; es: string };
export type KanjiItem = {
  kanji: string;
  readingJP: string;
  meaningEs: string;
  hex?: string;
  strokeAsset?: any;
  words?: Word[];
};

/* =========================================================
   Kanjis (usa tus *_nums.webp n2/)
========================================================= */
const STROKE_ASSETS: Record<string, any> = {
  "8a33": require("../../../assets/kanjivg/n2/8a33_nums.webp"),
  "9650": require("../../../assets/kanjivg/n2/9650_nums.webp"),
  "5fc5": require("../../../assets/kanjivg/n2/5fc5_nums.webp"),
  "7136": require("../../../assets/kanjivg/n2/7136_nums.webp"),
  "53ef": require("../../../assets/kanjivg/n2/53ef_nums.webp"),
  "80fd": require("../../../assets/kanjivg/n2/80fd_nums.webp"),
  "72b6": require("../../../assets/kanjivg/n2/72b6_nums.webp"),
  "614b": require("../../../assets/kanjivg/n2/614b_nums.webp"),
  "5b9a": require("../../../assets/kanjivg/n2/5b9a_nums.webp"),
};

function createKanji(kanji: string, readingJP: string, meaningEs: string, hex?: string, words: Word[] = []): KanjiItem {
  const normalizedHex = hex ? hex.replace(/^0+/, "").toLowerCase() : undefined;
  const strokeAsset = normalizedHex ? STROKE_ASSETS[normalizedHex] : undefined;
  return { kanji, readingJP, meaningEs, hex: normalizedHex, strokeAsset, words };
}

const KANJIS: KanjiItem[] = [
  createKanji("訳", "わけ", "razón, conclusión", "8a33", [
    { jp: "〜わけだ", reading: "わけだ", es: "por eso / con razón" },
    { jp: "言い訳", reading: "いいわけ", es: "excusa" },
  ]),
  createKanji("限", "かぎ(る)／げん", "límite; restringir", "9650", [
    { jp: "〜とは限らない", reading: "とは かぎらない", es: "no necesariamente" },
  ]),
  createKanji("必", "ひつ", "necesario", "5fc5", [
    { jp: "必ずしも", reading: "かならずしも", es: "no necesariamente (con否定)" },
  ]),
  createKanji("然", "ぜん", "así; naturaleza de", "7136"),
  createKanji("可", "か", "posible; permitido", "53ef"),
  createKanji("能", "のう", "capacidad; poder", "80fd"),
  createKanji("状", "じょう", "estado; condición", "72b6"),
  createKanji("態", "たい", "actitud; estado", "614b"),
  createKanji("定", "てい／じょう", "fijar; decidir", "5b9a"),
];

/* =========================================================
   Teoría
========================================================= */
const QUICK_POINTS = [
  {
    title: "〜わけだ",
    lines: [
      "Conclusión/explicación lógica: “por eso / con razón”.",
      "Unión: Forma neutra (V/いAdj/なAdj(な)/名詞(な)) ＋ わけだ。",
      "Matiz: confirma algo que se entiende por la causa ya mencionada.",
    ],
  },
  {
    title: "〜とは限らない",
    lines: [
      "Niega generalización absoluta: “no necesariamente / no siempre”.",
      "Unión: Forma neutra ＋ とは限らない。",
      "Señales: 必ずしも／いつも／みんな／全部 + とは限らない。",
    ],
  },
  {
    title: "Familia わけ〜",
    lines: [
      "〜わけではない：No es que… (matiza, niega totalmente la conclusión).",
      "〜わけがない：De ninguna manera (negación fuerte).",
      "〜というわけだ：O sea que… (paráfrasis/confirmación).",
    ],
  },
];

const FORM_TILES = [
  { head: "V/いA/なA/名", body: "普通形（名/なA→「な」）", tail: "＋ わけだ", color: "#F59E0B" },
  { head: "V/いA/なA/名", body: "普通形", tail: "＋ とは限らない", color: "#60A5FA" },
  { head: "頻出副詞", body: "必ずしも / いつも / みんな", tail: "＋ 〜とは限らない", color: "#34D399" },
];

const SIGNALS = [
  "価格が高い＝品質が良い とは限らない。",
  "外国人＝日本語が話せない とは限らない。",
  "努力した→結果が出る わけだ（納得）",
  "観光地→物価が高い わけだ（説明）",
];

const PITFALLS = [
  "No confundas わけだ (conclusión lógica) con ようだ (parecer).",
  "とは限らない se usa con NEGACIÓN; no lo combines con afirmativas directas.",
  "わけではない (matiza) ≠ とは限らない (niega generalizaciones).",
];

const EQUIV = [
  "‘That explains it’ ≈ それで〜わけだ",
  "‘Not necessarily’ ≈ 必ずしも〜とは限らない",
];

/* =========================================================
   Ejemplos
========================================================= */
const EXAMPLES: Ex[] = [
  { jp: "ここは観光地だから、物価が高いわけだ。", reading: "ここ は かんこうち だから、ぶっか が たかい わけ だ。", es: "Es zona turística, por eso los precios son altos.", tag: "わけだ" },
  { jp: "彼は毎日練習している。上手なわけだ。", reading: "かれ は まいにち れんしゅう して いる。じょうず な わけ だ。", es: "Él entrena diario; con razón es bueno.", tag: "わけだ" },
  { jp: "雨が多い地域だ。湿度が高いわけだ。", reading: "あめ が おおい ちいき だ。しつど が たかい わけ だ。", es: "Es zona lluviosa, con razón hay mucha humedad.", tag: "わけだ" },
  { jp: "予約が殺到した。それでサーバーが落ちたわけだ。", reading: "よやく が さっとう した。それで さーばー が おちた わけ だ。", es: "Llovieron reservas; por eso se cayó el servidor.", tag: "わけだ" },
  { jp: "熱があるのか。だるいわけだ。", reading: "ねつ が ある の か。だるい わけ だ。", es: "¿Tienes fiebre? Con razón te sientes débil.", tag: "わけだ" },

  { jp: "値段が高いからといって、品質が良いとは限らない。", reading: "ねだん が たかい から と いって、ひんしつ が よい と は かぎらない。", es: "Que sea caro no significa que sea de calidad.", tag: "とは限らない" },
  { jp: "外国人だからといって、日本語が話せないとは限らない。", reading: "がいこくじん だから と いって、にほんご が はなせない と は かぎらない。", es: "Ser extranjero no implica no hablar japonés.", tag: "とは限らない" },
  { jp: "必ずしも努力がすぐ報われるとは限らない。", reading: "かならずしも どりょく が すぐ むくわれる と は かぎらない。", es: "No necesariamente el esfuerzo se recompensa de inmediato.", tag: "とは限らない" },
  { jp: "レビューが多いからといって、内容が正しいとは限らない。", reading: "れびゅー が おおい から と いって、ないよう が ただしい と は かぎらない。", es: "Que tenga muchas reseñas no garantiza que el contenido sea correcto.", tag: "とは限らない" },
  { jp: "有名大学を出た人が皆優秀だとは限らない。", reading: "ゆうめい だいがく を でた ひと が みな ゆうしゅう だ と は かぎらない。", es: "No todos los egresados de universidades famosas son excelentes.", tag: "とは限らない" },

  { jp: "甘い物が嫌いなわけではないが、控えている。", reading: "あまい もの が きらい な わけ で は ない が、ひかえて いる。", es: "No es que odie lo dulce; solo lo estoy evitando.", tag: "わけではない" },
  { jp: "彼が嘘をつくわけがない。", reading: "かれ が うそ を つく わけ が ない。", es: "Él no mentiría de ninguna manera.", tag: "わけがない" },
];

/* =========================================================
   Actividades
========================================================= */
type JoinPuzzle = { stem: string; slots: number; options: string[]; answer: string[]; hint: string; };
const JOIN_PUZZLES: JoinPuzzle[] = [
  { stem: "（説明）この辺は学生が多い。家賃が安い____。", slots: 1, options: ["わけだ", "とは限らない", "わけではない"], answer: ["わけだ"], hint: "Explicación lógica" },
  { stem: "（一般化×）高学歴だから成功する____。", slots: 1, options: ["とは限らない", "わけだ", "わけがない"], answer: ["とは限らない"], hint: "No necesariamente" },
  { stem: "（頻出）値段が高くても、____ 良いとは限らない.", slots: 1, options: ["必ずしも", "実は", "案外"], answer: ["必ずしも"], hint: "Adverbio típico" },
  { stem: "（matiz）嫌いな____、食べられないわけではない。", slots: 1, options: ["わけだ", "わけではない", "とは限らない"], answer: ["わけではない"], hint: "No es que (parcial)" },
];

type TAItem = { text: string; tag: "わけだ" | "とは限らない" };
const TIME_ATTACK_POOL: TAItem[] = [
  { text: "努力した。合格するわけだ。", tag: "わけだ" },
  { text: "高い＝良いとは限らない。", tag: "とは限らない" },
  { text: "観光地だ。混むわけだ。", tag: "わけだ" },
  { text: "便利でも、みんな使うとは限らない。", tag: "とは限らない" },
];

/* =========================================================
   Helpers UI
========================================================= */
const IconPlay = ({ size = 14 }: { size?: number }) => (
  <View style={styles.playPill}><MCI name="play" size={size} color="#fff" /></View>
);
const IconVol = ({ size = 14 }: { size?: number }) => (
  <View style={styles.playPill}><MCI name="volume-high" size={size} color="#fff" /></View>
);

function KaraokeLine({ text, reading }: { text: string; reading: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
    const id = setInterval(() => setIdx((x) => Math.min(reading.length, x + 1)), 25);
    return () => clearInterval(id);
  }, [reading]);
  return (
    <View>
      <Text style={styles.jp}>{text}</Text>
      <Text style={styles.readingSmall}>
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
      {QUICK_POINTS.map((q, i) => (
        <View key={i} style={styles.quickItem}>
          <Text style={styles.quickHead}>{q.title}</Text>
          {q.lines.map((l, j) => (<Text key={j} style={styles.quickLine}>・{l}</Text>))}
        </View>
      ))}
      <View style={[styles.tileRow, { marginTop: 8 }]}>
        {FORM_TILES.map((t, i) => (
          <View key={i} style={[styles.formTile, { borderColor: t.color }]}>
            <Text style={[styles.tileHead, { color: "#fff" }]}>{t.head}</Text>
            <Text style={styles.tileBody}>{t.body}</Text>
            <Text style={styles.tileTail}>{t.tail}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.explBox, { marginTop: 10 }]}>
        <Text style={styles.boxTitle}>Señales útiles</Text>
        {SIGNALS.map((s, i) => (<Text key={i} style={styles.note}>• {s}</Text>))}
      </View>
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Errores comunes</Text>
        {PITFALLS.map((s, i) => (<Text key={i} style={styles.note}>• {s}</Text>))}
      </View>
      <View style={[styles.explBox, { marginTop: 8 }]}>
        <Text style={styles.boxTitle}>Equivalencias</Text>
        {EQUIV.map((s, i) => (<Text key={i} style={styles.note}>• {s}</Text>))}
      </View>
    </View>
  );
}

function ExamplesBox() {
  const [filter, setFilter] = useState<Ex["tag"] | "all">("all");
  const list = EXAMPLES.filter(e => filter === "all" ? true : e.tag === filter);

  const FilterChip = ({ label, on, onPress }: any) => (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: on ? accent : "#0F1117", borderColor: on ? "#FBBF24" : "rgba(255,255,255,0.12)" }]}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ejemplos con audio + karaoke</Text>
      <View style={styles.controlsRow}>
        <FilterChip label="Todos" on={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip label="わけだ" on={filter === "わけだ"} onPress={() => setFilter("わけだ")} />
        <FilterChip label="とは限らない" on={filter === "とは限らない"} onPress={() => setFilter("とは限らない")} />
        <FilterChip label="わけではない" on={filter === "わけではない"} onPress={() => setFilter("わけではない")} />
        <FilterChip label="わけがない" on={filter === "わけがない"} onPress={() => setFilter("わけがない")} />
      </View>

      <View style={{ marginTop: 6, gap: 10 }}>
        {list.map((ex, i) => (
          <View key={i} style={styles.exampleRow}>
            <Pressable onPress={() => speakJP(ex.jp)}><IconPlay /></Pressable>
            <View style={{ flex: 1 }}>
              <KaraokeLine text={`・${ex.jp}`} reading={ex.reading} />
              <View style={styles.transRow}>
                <Pressable onPress={() => speakES(ex.es)}><IconVol /></Pressable>
                <Text style={styles.esLine}>{ex.es}</Text>
              </View>
            </View>
            <View style={[styles.tagPill, ex.tag === "わけだ" ? { backgroundColor: "#B45309" } : ex.tag === "とは限らない" ? { backgroundColor: "#1E40AF" } : { backgroundColor: "#4B5563" }]}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>{ex.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

type SlotAnswer = string | null;
function JoinActivity() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<SlotAnswer[]>([]);
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null);

  const puzzle = JOIN_PUZZLES[i];
  useEffect(() => { setPicked(Array(puzzle.slots).fill(null)); setFeedback(null); }, [i]);

  const choose = (word: string) => {
    const idx = picked.findIndex((x) => x === null);
    if (idx === -1) return;
    const next = [...picked]; next[idx] = word; setPicked(next);
  };
  const reset = () => setPicked(Array(puzzle.slots).fill(null));
  const check = () => {
    const ok = JSON.stringify(puzzle.answer) === JSON.stringify(picked);
    setFeedback({ ok, msg: ok ? "¡Perfecto! 🎉" : "Revisa la pista y vuelve a intentar." });
    speakES(ok ? "¡Perfecto!" : "Casi...");
  };

  const renderStem = () => {
    let out = puzzle.stem;
    picked.forEach((ans) => { out = out.replace("____", ans ?? "____"); });
    return out;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Une las piezas correctas</Text>
      <Text style={styles.li}>Pista: {puzzle.hint}</Text>

      <View style={styles.puzzleBox}>
        <Text style={styles.jp}>{renderStem()}</Text>
      </View>

      <Text style={[styles.li, { marginTop: 6 }]}>Opciones</Text>
      <View style={styles.bankRow}>
        {puzzle.options.map((opt, k) => (
          <Pressable key={k} onPress={() => choose(opt)} style={[styles.dndChip, { backgroundColor: "#0B0F19", borderColor: accent }]}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.controlsRow, { marginTop: 10 }]}>
        <Pressable onPress={check} style={styles.ctrlBtn}><MCI name="check" size={18} color="#fff" /><Text style={styles.ctrlTxt}>Comprobar</Text></Pressable>
        <Pressable onPress={reset} style={styles.ctrlBtn}><MCI name="refresh" size={18} color="#fff" /><Text style={styles.ctrlTxt}>Reiniciar</Text></Pressable>
        <View style={[styles.ctrlBtnAlt, { gap: 6 }]}><MCI name="progress-check" size={16} color="#fff" /><Text style={styles.ctrlTxt}>{i + 1}/{JOIN_PUZZLES.length}</Text></View>
      </View>

      {feedback && (
        <View style={[styles.explBox, feedback.ok ? styles.okBox : styles.badBox]}>
          <Text style={{ fontWeight: "900", color: "#fff" }}>{feedback.msg}</Text>
        </View>
      )}

      <Pressable onPress={() => setI((x) => (x + 1) % JOIN_PUZZLES.length)} style={[styles.ctrlBtn, { marginTop: 8, alignSelf: "flex-start" }]}>
        <MCI name="arrow-right-bold" size={18} color="#fff" />
        <Text style={styles.ctrlTxt}>Siguiente</Text>
      </Pressable>
    </View>
  );
}

function TimeAttack() {
  const [time, setTime] = useState(30);
  const [lives, setLives] = useState(3);
  const [points, setPoints] = useState(0);
  const [i, setI] = useState(0);
  const [showHelp, setShowHelp] = useState(true); // Mostrar reglas al entrar por 1ª vez
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // timers
  useEffect(() => { setTime(30); setLives(3); setPoints(0); setI(0); }, []);
  useEffect(() => {
    if (time <= 0 || lives <= 0) return;
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [time, lives]);

  // shake error
  const doShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };
  const shakeInter = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  // botón pulse (para llamar atención)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const scalePulse = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  const item = TIME_ATTACK_POOL[i % TIME_ATTACK_POOL.length];
  const pick = (tag: TAItem["tag"]) => {
    if (time <= 0 || lives <= 0) return;
    if (tag === item.tag) {
      setPoints((p) => p + 10); speakES("¡Bien!"); setI((x) => x + 1);
    } else {
      setLives((l) => l - 1); speakES("¡Uy!"); doShake(); setI((x) => x + 1);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>Minijuego — Time Attack</Text>
        <Pressable onPress={() => setShowHelp(true)} style={styles.helpBtn}>
          <MCI name="help-circle-outline" size={20} color="#fff" />
          <Text style={styles.helpTxt}>¿Cómo se juega?</Text>
        </Pressable>
      </View>

      <View style={styles.hudRow}>
        <Text style={styles.hudTxt}>⏱ {time}s</Text>
        <Text style={styles.hudTxt}>❤️ {lives}</Text>
        <Text style={styles.hudTxt}>⭐ {points}</Text>
      </View>

      <View style={styles.tipRow}>
        <MCI name="lightbulb-on-outline" size={16} color={accent} />
        <Text style={styles.tipTxt}>Toca la frase para escucharla en japonés. Elige si expresa “explicación lógica (わけだ)” o “no necesariamente (とは限らない)”.</Text>
      </View>

      <Animated.View style={[styles.puzzleBox, { transform: [{ translateX: shakeInter }] }]}>
        <Pressable onPress={() => speakJP(item.text)}><Text style={[styles.jp, { textAlign: "center" }]}>{item.text}</Text></Pressable>
      </Animated.View>

      <View style={[styles.controlsRow, { justifyContent: "center" }]}>
        <Animated.View style={{ transform: [{ scale: scalePulse }] }}>
          <Pressable onPress={() => pick("わけだ")} style={[styles.bigBtn, { backgroundColor: "#B45309", borderColor: "#F59E0B" }]}>
            <Text style={styles.bigBtnTxt}>わけだ</Text>
            <Text style={styles.bigSub}>explicación lógica</Text>
          </Pressable>
        </Animated.View>

        <Pressable onPress={() => pick("とは限らない")} style={[styles.bigBtn, { backgroundColor: "#1E40AF", borderColor: "#60A5FA" }]}>
          <Text style={styles.bigBtnTxt}>とは限らない</Text>
          <Text style={styles.bigSub}>no necesariamente</Text>
        </Pressable>
      </View>

      {(time <= 0 || lives <= 0) && (
        <View style={[styles.explBox, { marginTop: 8, borderColor: "#22C55E" }]}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>🏁 ¡Fin!</Text>
          <Text style={{ color: "#fff", marginTop: 4 }}>Puntaje: {points}</Text>
        </View>
      )}

      {/* Modal de ayuda */}
      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.helpCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Cómo se juega?</Text>
              <Pressable onPress={() => setShowHelp(false)} style={styles.closeBtn}><MCI name="close" size={22} color="#fff" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
              <Text style={styles.note}>• Lee o toca para escuchar la frase en japonés.</Text>
              <Text style={styles.note}>• Decide si expresa <Text style={styles.boldWhite}>“explicación lógica (わけだ)”</Text> o <Text style={styles.boldWhite}>“no necesariamente (とは限らない)”</Text>.</Text>
              <Text style={styles.note}>• Toca el botón correcto antes de que el tiempo llegue a 0. Tienes 3 vidas.</Text>
              <View style={[styles.explBox, { marginTop: 10 }]}>
                <Text style={styles.boxTitle}>Ejemplo</Text>
                <Text style={styles.note}>観光地だ。混むわけだ。 → <Text style={styles.boldWhite}>わけだ</Text></Text>
                <Text style={styles.note}>高い＝良いとは限らない。 → <Text style={styles.boldWhite}>とは限らない</Text></Text>
              </View>
              <Pressable onPress={() => setShowHelp(false)} style={[styles.ctrlBtn, { alignSelf: "flex-start", marginTop: 10 }]}>
                <MCI name="check" size={18} color="#fff" /><Text style={styles.ctrlTxt}>¡Entendido!</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function KanjiModal({ visible, onClose, data }: { visible: boolean; onClose: () => void; data: KanjiItem | null; }) {
  if (!data) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kanji: {data.kanji}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}><MCI name="close" size={22} color="#fff" /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Text style={styles.modalReading} onPress={() => speakJP(data.readingJP)}>
              {data.readingJP} · {data.meaningEs} <Text style={{ opacity: 0.7, color: "#fff" }}>(Toca para oír)</Text>
            </Text>

            {data.strokeAsset ? (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <ExpoImage
                  source={data.strokeAsset}
                  style={{ width: Math.min(width - 32, 330), height: Math.min(width - 32, 330), borderRadius: 16, backgroundColor: "#0B0F19" }}
                  contentFit="contain"
                />
                <Text style={{ color: "#fff", opacity: 0.7, fontSize: 12, textAlign: "center", marginTop: 6 }}>Orden de trazos (KanjiVG)</Text>
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
          <Pressable key={idx} onPress={() => { setCur(k); setShow(true); }} style={[styles.kanjiCell, { borderColor: "rgba(255,255,255,0.1)" }]}>
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

/* Tabs */
type TabKey = "quick" | "how" | "examples" | "practice" | "game" | "kanji";
const TAB_LABELS: Record<TabKey, string> = {
  quick: "Guía",
  how: "Formación",
  examples: "Ejemplos",
  practice: "Práctica",
  game: "Minijuego",
  kanji: "Kanjis",
};
function TabBar({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const labels: TabKey[] = ["quick", "how", "examples", "practice", "game", "kanji"];
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

function HowToBox() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Cómo se forma + Con qué se une</Text>
      <View style={[styles.tileRow, { marginTop: 4 }]}>
        {FORM_TILES.map((t, i) => (
          <View key={i} style={[styles.formTile, { borderColor: t.color }]}>
            <Text style={[styles.tileHead, { color: "#fff" }]}>{t.head}</Text>
            <Text style={styles.tileBody}>{t.body}</Text>
            <Text style={styles.tileTail}>{t.tail}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.explBox, { marginTop: 10 }]}>
        <Text style={styles.boxTitle}>Notas de unión</Text>
        <Text style={styles.note}>• 〜わけだ → forma neutra. 名詞/な形容詞: 「<Text style={styles.boldWhite}>な</Text>」＋わけだ.</Text>
        <Text style={styles.note}>• 〜とは限らない → forma neutra; acompaña con <Text style={styles.boldWhite}>必ずしも/いつも/みんな</Text>.</Text>
        <Text style={styles.note}>• Matizar vs negar: 「わけではない」 ≠ 「とは限らない」.</Text>
      </View>
    </View>
  );
}

/* =========================================================
   Screen
========================================================= */
export default function N2_B3_U1() {
  const [tab, setTab] = useState<TabKey>("quick");
  const [progress, setProgress] = useState(0);
  const next = () => setProgress((p) => Math.min(1, p + 0.2));

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b3_u1.webp")}
      accent={accent}
      breadcrumb="B3 · U1"
      title="〜わけだ／〜とは限らない"
      subtitle="Explicación visual + audio + práctica + minijuego + kanjis"
      ctas={[
        { label: "Escuchar visión general", onPress: () => speakES("Diferencias, formación y usos de 〜わけだ y 〜とは限らない.") },
        { label: "Ir a práctica", onPress: () => setTab("practice") },
      ]}
      progress={progress}
      onContinue={next}
      continueLabel="Marcar avance"
    >
      <TabBar tab={tab} setTab={setTab} />
      {tab === "quick" && <QuickBox />}
      {tab === "how" && <HowToBox />}
      {tab === "examples" && <ExamplesBox />}
      {tab === "practice" && <JoinActivity />}
      {tab === "game" && <TimeAttack />}
      {tab === "kanji" && <KanjiGrid />}

      {progress >= 1 && (
        <View style={[styles.card, { borderColor: "rgba(245, 158, 11, 0.5)" }]}>
          <Text style={styles.cardTitle}>🏅 ¡Dominio de la unidad!</Text>
          <Text style={styles.li}>Has recorrido todas las pestañas y practicado el contenido.</Text>
        </View>
      )}
    </UnitTemplate>
  );
}

/* =========================================================
   Styles — TODO BLANCO, fondos oscuros (incluye modales)
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

  // quick
  quickItem: { backgroundColor: "#0F1117", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 10, marginTop: 6 },
  quickHead: { color: "#fff", fontWeight: "900" },
  quickLine: { color: "rgba(255,255,255,0.90)", marginTop: 4 },

  // tiles
  tileRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  formTile: { backgroundColor: "#0B1222", borderWidth: 1.5, borderRadius: 14, padding: 10, minWidth: 150 },
  tileHead: { fontWeight: "900", fontSize: 12, color: "#fff" },
  tileBody: { color: "#fff", marginTop: 2 },
  tileTail: { color: "#fff", marginTop: 2, fontWeight: "900" },

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
  readingSmall: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  esLine: { color: "#fff", fontSize: 13, flexShrink: 1, flexWrap: "wrap" },

  playPill: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  tagPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: "center" },

  // puzzle
  puzzleBox: { backgroundColor: "#0B0F19", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, marginTop: 6 },
  bankRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 },
  dndChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },

  controlsRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },
  ctrlBtn: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  ctrlTxt: { color: "#fff", fontWeight: "800" },
  ctrlBtnAlt: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },

  okBox: { backgroundColor: "rgba(34,197,94,0.18)", borderColor: "#22C55E" },
  badBox: { backgroundColor: "rgba(239,68,68,0.18)", borderColor: "#EF4444" },

  // Time attack
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  helpBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  helpTxt: { color: "#fff", fontWeight: "800" },
  tipRow: { flexDirection: "row", gap: 6, alignItems: "center", marginTop: 8 },
  tipTxt: { color: "rgba(255,255,255,0.9)", flex: 1 },
  hudRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  hudTxt: { color: "#fff", fontWeight: "900" },
  bigBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, marginTop: 8, alignItems: "center" },
  bigBtnTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  bigSub: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 2 },

  // tabs
  tabBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#0F1117" },
  tabBtnOn: { backgroundColor: "#B45309", borderColor: "#F59E0B" },
  tabTxt: { color: "#fff", fontWeight: "800" },
  tabTxtOn: { color: "#fff", fontWeight: "900" },

  // kanji grid
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  kanjiCell: { width: "30.8%", backgroundColor: "#0F1117", borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  kanjiBig: { color: "#fff", fontSize: 28, fontWeight: "900" },
  kanjiReading: { color: "#fff", marginTop: 4 },
  kanjiEs: { color: "#fff", fontSize: 12, marginTop: 2, textAlign: "center", paddingHorizontal: 6 },

  // modal genérico oscuro
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#0B0F19", borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)", backgroundColor: "#0B0F19" },
  closeBtn: { width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  modalReading: { color: "#fff", marginTop: 6 },

  // modal ayuda
  helpCard: { backgroundColor: "#0B0F19", borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },

  // kanji modal words
  wordsTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  wordItem: { backgroundColor: "#0F1117", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  wordJp: { color: "#fff", fontWeight: "900", marginRight: 8 },
  wordReading: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginRight: 8 },
  wordEs: { color: "#fff", flex: 1 },

  // cajas explicativas
  explBox: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  boxTitle: { color: "#fff", fontWeight: "900", marginBottom: 6 },
  note: { color: "#fff", marginTop: 4 },
  boldWhite: { color: "#fff", fontWeight: "900" },
});
