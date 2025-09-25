// src/screens/N5/B3Vocabulario/B3_ColoresAdjetivos.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/** ===================== Navegación ===================== */
type Nav = NativeStackNavigationProp<RootStackParamList>;

/** ===================== Datos ===================== */
type Word = {
  key: string;
  kana: string;
  es: string;
  emoji?: string;
  group: "color" | "adj";
  kind?: "i" | "na"; // para adjetivos
};

// Colores (formas comunes y aptas para N5; usamos “〜い” cuando aplica)
const COLORS: Word[] = [
  { key: "akai", kana: "あかい", es: "rojo", emoji: "🔴", group: "color" },
  { key: "aoi", kana: "あおい", es: "azul", emoji: "🔵", group: "color" },
  { key: "kiiroi", kana: "きいろい", es: "amarillo", emoji: "🟡", group: "color" },
  { key: "shiroi", kana: "しろい", es: "blanco", emoji: "⚪", group: "color" },
  { key: "kuroi", kana: "くろい", es: "negro", emoji: "⚫", group: "color" },
  { key: "chairo", kana: "ちゃいろ", es: "café (marrón)", emoji: "🟤", group: "color" },
  { key: "midori", kana: "みどり", es: "verde", emoji: "🟢", group: "color" },
  { key: "murasaki", kana: "むらさき", es: "morado", emoji: "🟣", group: "color" },
  { key: "orenji", kana: "オレンジ", es: "naranja", emoji: "🟠", group: "color" },
  { key: "pinku", kana: "ピンク", es: "rosa", emoji: "🌸", group: "color" },
  { key: "haiiro", kana: "はいいろ", es: "gris", emoji: "⚙️", group: "color" },
];

// Adjetivos (mezcla de i-adj y na-adj útiles en descripciones)
const ADJS: Word[] = [
  { key: "ookii", kana: "おおきい", es: "grande", group: "adj", kind: "i" },
  { key: "chiisai", kana: "ちいさい", es: "pequeño", group: "adj", kind: "i" },
  { key: "atarashii", kana: "あたらしい", es: "nuevo", group: "adj", kind: "i" },
  { key: "furui", kana: "ふるい", es: "viejo (obj.)", group: "adj", kind: "i" },
  { key: "omoshiroi", kana: "おもしろい", es: "interesante/divertido", group: "adj", kind: "i" },
  { key: "tsumaranai", kana: "つまらない", es: "aburrido", group: "adj", kind: "i" },
  { key: "oishii", kana: "おいしい", es: "rico (sabroso)", group: "adj", kind: "i" },
  { key: "karai", kana: "からい", es: "picante", group: "adj", kind: "i" },
  { key: "kirei", kana: "きれい", es: "bonito/limpio", group: "adj", kind: "na" },
  { key: "shizuka", kana: "しずか", es: "tranquilo/silencioso", group: "adj", kind: "na" },
];

const ITEMS: Word[] = [...COLORS, ...ADJS];

/** ===================== Utilidades ===================== */
const speakJa = (text: string) => {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
};
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/** ===================== Componente ===================== */
export default function B3_ColoresAdjetivos() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  // Animación de entrada
  const fade = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  /** ---------- QUIZ (8 preguntas, sin rōmaji) ---------- */
  type Quiz = { prompt: Word; options: Word[]; correctKey: string };
  const buildOptions = (prompt: Word) => {
    const pool = ITEMS.filter((it) => it.key !== prompt.key);
    return shuffle([prompt, ...shuffle(pool).slice(0, 2)]);
  };
  const newQuizSet = () => shuffle(ITEMS).slice(0, 8);
  const [quizSet, setQuizSet] = useState<Word[]>(() => newQuizSet());
  const [quizIdx, setQuizIdx] = useState(0);
  const [quiz, setQuiz] = useState<Quiz>(() => {
    const p = quizSet[0];
    return { prompt: p, options: buildOptions(p), correctKey: p.key };
  });
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);

  const advanceQuiz = useCallback(
    (nextIdx: number) => {
      const p = quizSet[nextIdx];
      setQuiz({ prompt: p, options: buildOptions(p), correctKey: p.key });
      setQuizIdx(nextIdx);
    },
    [quizSet]
  );

  const restartQuiz = () => {
    const ns = newQuizSet();
    setQuizSet(ns);
    setQuizIdx(0);
    const p = ns[0];
    setQuiz({ prompt: p, options: buildOptions(p), correctKey: p.key });
    setQuizFeedback(null);
  };

  const onAnswer = useCallback(
    async (key: string) => {
      if (key === quiz.correctKey) {
        setQuizFeedback("correct");
        if (ready) await playCorrect();
        speakJa(quiz.prompt.kana);
        setTimeout(() => {
          setQuizFeedback(null);
          if (quizIdx < 7) {
            advanceQuiz(quizIdx + 1);
          }
        }, 800);
      } else {
        setQuizFeedback("wrong");
        Vibration.vibrate(40);
        if (ready) await playWrong();
        setTimeout(() => setQuizFeedback(null), 600);
      }
    },
    [quiz, quizIdx, ready, playCorrect, playWrong, advanceQuiz]
  );

  /** ---------- Ordena la oración (8 ítems) ---------- */
  type OrderItem = { id: string; jpTokens: string[]; es: string };
  const ORDER_BANK: OrderItem[] = [
    // Colores + sustantivo
    { id: "akai-ring", jpTokens: ["りんごは", "あかい", "です。"], es: "La manzana es roja." },
    { id: "aoi-sora", jpTokens: ["そらは", "あおい", "です。"], es: "El cielo es azul." },
    { id: "kuroi-pen", jpTokens: ["ペンは", "くろい", "です。"], es: "El bolígrafo es negro." },
    { id: "midori-ki", jpTokens: ["きは", "みどり", "です。"], es: "El árbol es verde." },

    // i-adjetivos
    { id: "ookii-kasa", jpTokens: ["かさは", "おおきい", "です。"], es: "El paraguas es grande." },
    { id: "chiisai-tori", jpTokens: ["とりは", "ちいさい", "です。"], es: "El pájaro es pequeño." },
    { id: "oishii-pan", jpTokens: ["パンは", "おいしい", "です。"], es: "El pan está rico." },
    { id: "karai-karee", jpTokens: ["カレーは", "からい", "です。"], es: "El curry es picante." },
  ];
  const newOrderSeq = () => shuffle(ORDER_BANK).slice(0, 8);
  const [orderSeq, setOrderSeq] = useState<OrderItem[]>(() => newOrderSeq());
  const [orderIdx, setOrderIdx] = useState(0);
  const currentOrder = orderSeq[orderIdx];
  const [poolTokens, setPoolTokens] = useState<string[]>(() => shuffle(currentOrder.jpTokens));
  const [answerTokens, setAnswerTokens] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<"correct" | "wrong" | null>(null);

  const resetOrderRound = useCallback((seq?: OrderItem[], idx?: number) => {
    const s = seq ?? orderSeq;
    const i = typeof idx === "number" ? idx : orderIdx;
    setPoolTokens(shuffle(s[i].jpTokens));
    setAnswerTokens([]);
    setOrderFeedback(null);
  }, [orderSeq, orderIdx]);

  const restartOrder = () => {
    const seq = newOrderSeq();
    setOrderSeq(seq);
    setOrderIdx(0);
    setPoolTokens(shuffle(seq[0].jpTokens));
    setAnswerTokens([]);
    setOrderFeedback(null);
  };

  const addToken = (t: string, i: number) => {
    const copy = [...poolTokens];
    copy.splice(i, 1);
    setPoolTokens(copy);
    setAnswerTokens((prev) => [...prev, t]);
  };

  const removeToken = (i: number) => {
    const ans = [...answerTokens];
    const removed = ans.splice(i, 1)[0];
    setAnswerTokens(ans);
    setPoolTokens((prev) => [...prev, removed]);
  };

  const checkOrder = async () => {
    const correct = answerTokens.join("") === currentOrder.jpTokens.join("");
    if (correct) {
      setOrderFeedback("correct");
      if (ready) await playCorrect();
      Speech.speak(currentOrder.jpTokens.join(""), { language: "ja-JP", pitch: 1.0, rate: 0.98 });
      setTimeout(() => {
        setOrderFeedback(null);
        if (orderIdx < 7) {
          const next = orderIdx + 1;
          setOrderIdx(next);
          resetOrderRound(undefined, next);
        }
      }, 900);
    } else {
      setOrderFeedback("wrong");
      Vibration.vibrate(40);
      if (ready) await playWrong();
      setTimeout(() => setOrderFeedback(null), 600);
    }
  };

  /** ---------- UI ---------- */
  const wordsColor = useMemo(() => ITEMS.filter((w) => w.group === "color"), []);
  const wordsAdj = useMemo(() => ITEMS.filter((w) => w.group === "adj"), []);

  // justo antes del return de B3_ColoresAdjetivos
const Pill = ({ label }: { label: string }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </Pressable>
        <Text style={styles.title}>Colores y Adjetivos — 色・けいようし</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* ===== 1) VOCABULARIO ===== */}
        <SectionHeader icon="color-palette-outline" label="Colores" />
        <View style={styles.grid}>
          {wordsColor.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        <SectionHeader icon="sparkles-outline" label="Adjetivos básicos" />
        <View style={styles.grid}>
          {wordsAdj.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        {/* ===== 2) GRAMÁTICA “como primaria” ===== */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Gramática clave (explicado fácil)</Text>

          {/* i-adjetivos */}
          <View style={[styles.grammarBlock, styles.gI]}>
            <Text style={styles.blockTitle}>① i-adjetivos（〜い）</Text>
            <Text style={styles.blockExplain}>
              Los i-adjetivos terminan en <Text style={styles.bold}>〜い</Text> (p. ej., おおきい, あたらしい).{"\n"}
              Afirmativo: <Text style={styles.code}>A は（が） 〈i-adj〉 です。</Text>{"\n"}
              Negativo (cortés): <Text style={styles.code}>〈i-adj〉 くないです。</Text>
            </Text>
            <Example jp="かさは おおきい です。" es="El paraguas es grande." onSpeak={() => speakJa("かさは おおきい です。")} />
            <Example jp="パンは おいしい です。" es="El pan está rico." onSpeak={() => speakJa("パンは おいしい です。")} />
            <Example jp="カレーは からくない です。" es="El curry no es picante." onSpeak={() => speakJa("カレーは からくない です。")} />
          </View>

          {/* na-adjetivos */}
          <View style={[styles.grammarBlock, styles.gNa]}>
            <Text style={styles.blockTitle}>② na-adjetivos（〜な）</Text>
            <Text style={styles.blockExplain}>
              Los na-adjetivos usan <Text style={styles.bold}>〜な</Text> antes de un sustantivo y{" "}
              <Text style={styles.bold}>です</Text> para afirmar. Negación:{" "}
              <Text style={styles.bold}>ではありません</Text>.{"\n"}
              Afirmativo: <Text style={styles.code}>A は（が） 〈na-adj〉 です。</Text>{"\n"}
              Negativo: <Text style={styles.code}>〈na-adj〉 では ありません。</Text>
            </Text>
            <Example jp="へやは しずか です。" es="El cuarto es tranquilo." onSpeak={() => speakJa("へやは しずか です。")} />
            <Example jp="まちは にぎやか では ありません。" es="La ciudad no es animada." onSpeak={() => speakJa("まちは にぎやか では ありません。")} />
            <Example jp="ふくは きれい です。" es="La ropa es bonita/limpia." onSpeak={() => speakJa("ふくは きれい です。")} />
          </View>

          {/* Colores en predicado */}
          <View style={[styles.grammarBlock, styles.gColor]}>
            <Text style={styles.blockTitle}>③ Colores como adjetivo</Text>
            <Text style={styles.blockExplain}>
              Muchos colores se usan como adjetivo <Text style={styles.bold}>〜い</Text> (あかい/あおい/しろい/くろい/きいろい).{"\n"}
              Otros (みどり・むらさき・ちゃいろ) también se escuchan con です en N5.{"\n"}
              Patrones: <Text style={styles.code}>A は あかい です。</Text>{" "}
              / <Text style={styles.code}>A は みどり です。</Text>
            </Text>
            <Example jp="りんごは あかい です。" es="La manzana es roja." onSpeak={() => speakJa("りんごは あかい です。")} />
            <Example jp="きは みどり です。" es="El árbol es verde." onSpeak={() => speakJa("きは みどり です。")} />
            <Example jp="シャツは しろい です。" es="La camisa es blanca." onSpeak={() => speakJa("シャツは しろい です。")} />
          </View>

          <Text style={styles.hint}>
            💡 Tips rápidos:{"\n"}
            • i-adj → negación en N5: <Text style={styles.bold}>〜くないです</Text>.{"\n"}
            • na-adj → negación cortés: <Text style={styles.bold}>〜ではありません</Text>.{"\n"}
            • Colores “〜い” funcionan igual que i-adjetivos; みどり/むらさき/ちゃいろ también se aceptan con 「です」 en frases simples.
          </Text>
        </View>

        {/* ===== TIPS DE ESTUDIO ===== */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>Cómo estudiar esta pantalla</Text>
          <View style={styles.rowWrap}>
            <Pill label="Vocabulario: escucha y repite" />
            <Pill label="Gramática: fórmulas + 4 ejemplos tuyos" />
            <Pill label="Ejercicios: completa 8/8" />
          </View>
          <Text style={styles.hint}>
            • <Text style={styles.bold}>Colores:</Text> di 3 objetos de tu entorno con color: “A は 色 です”。{"\n"}
            • <Text style={styles.bold}>i-adj:</Text> escribe pares afirm./neg.: おおきいです／おおきくないです.{"\n"}
            • <Text style={styles.bold}>na-adj:</Text> crea 2 oraciones con しずか y きれい (afirm./neg.).{"\n"}
            • <Text style={styles.bold}>Ejercicios:</Text> completa ambos (8/8) y reinicia para variaciones.
          </Text>
        </View>

        {/* ===== 3) EJERCICIOS ===== */}

        {/* Quiz (8 preguntas) */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Quiz de vocabulario — Progreso {quizIdx + 1}/8</Text>
          <Text style={styles.quizPrompt}>
            ¿Qué significa:{" "}
            <Text style={styles.jpBig} onPress={() => speakJa(quiz.prompt.kana)}>
              {quiz.prompt.kana}
            </Text>
            ?
          </Text>

          <View style={{ height: 8 }} />
          {quiz.options.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => onAnswer(opt.key)}
              style={[
                styles.optBtn,
                quizFeedback && opt.key === quiz.correctKey && styles.optCorrect,
                quizFeedback && opt.key !== quiz.correctKey && styles.optDisabled,
              ]}
              disabled={!!quizFeedback || quizIdx >= 8}
            >
              <Text style={styles.optText}>
                {opt.emoji ? `${opt.emoji} ` : ""}
                {opt.es}
              </Text>
            </Pressable>
          ))}

          {quizIdx >= 7 && quizFeedback === "correct" && (
            <Text style={styles.correctText}>¡Completaste las 8 preguntas! 🎉</Text>
          )}

          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionBtn, styles.resetBtn]} onPress={restartQuiz}>
              <Ionicons name="refresh-outline" size={16} />
              <Text style={styles.actionText}>Reiniciar (8 nuevas)</Text>
            </Pressable>
          </View>

          {quizFeedback === "wrong" && <Text style={styles.wrongText}>Ups, intenta de nuevo ❌</Text>}
          {quizFeedback === "correct" && quizIdx < 7 && <Text style={styles.correctText}>¡Correcto! ✅</Text>}
          <Text style={styles.subHint}>Toca el japonés para escuchar la pronunciación.</Text>
        </View>

        {/* Ordena la oración (8 ítems) */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Ordena la oración — Progreso {orderIdx + 1}/8</Text>
          <Text style={styles.quizPrompt}>Arma la frase correcta con la gramática vista:</Text>
          <View style={{ height: 6 }} />
          <Text style={styles.subHint}>Objetivo: {currentOrder.es}</Text>

          <Text style={[styles.quizPrompt, { marginTop: 8 }]}>Fichas:</Text>
          <View style={styles.tokenWrap}>
            {poolTokens.map((t, i) => (
              <Pressable key={`${t}-${i}`} style={styles.token} onPress={() => addToken(t, i)}>
                <Text style={styles.tokenText}>{t}</Text>
              </Pressable>
            ))}
            {poolTokens.length === 0 && <Text style={styles.tokenGhost}>—</Text>}
          </View>

          <Text style={[styles.quizPrompt, { marginTop: 8 }]}>Tu oración (toca para quitar):</Text>
          <View style={styles.tokenWrapAnswer}>
            {answerTokens.map((t, i) => (
              <Pressable key={`${t}-ans-${i}`} style={styles.tokenAnswer} onPress={() => removeToken(i)}>
                <Text style={styles.tokenText}>{t}</Text>
              </Pressable>
            ))}
            {answerTokens.length === 0 && <Text style={styles.tokenGhost}>Toca fichas para armar la oración…</Text>}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionBtn, styles.checkBtn]} onPress={checkOrder} disabled={orderIdx >= 8}>
              <Ionicons name="checkmark-done-outline" size={16} />
              <Text style={styles.actionText}>Comprobar</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.resetBtn]} onPress={restartOrder}>
              <Ionicons name="refresh-outline" size={16} />
              <Text style={styles.actionText}>Reiniciar (8 nuevas)</Text>
            </Pressable>
          </View>

          {orderIdx >= 7 && <Text style={styles.correctText}>¡Completaste las 8 oraciones! 🎉</Text>}
          {orderFeedback === "wrong" && <Text style={styles.wrongText}>Revisa el orden y vuelve a intentar ❌</Text>}
          {orderFeedback === "correct" && orderIdx < 7 && <Text style={styles.correctText}>¡Excelente! ✅</Text>}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Animated.View>
  );
}

/** ===================== Subcomponentes ===================== */

function SectionHeader({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#333" style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function WordCard({ it, onSpeak }: { it: Word; onSpeak: () => void }) {
  return (
    <Pressable onPress={onSpeak} style={styles.wordCard}>
      <Text style={styles.emoji}>{it.emoji ?? "✨"}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.kana}>{it.kana}</Text>
        <Text style={styles.es}>{it.es}</Text>
      </View>
      <Ionicons name="volume-high-outline" size={20} color="#333" />
    </Pressable>
  );
}

function Example({ jp, es, onSpeak }: { jp: string; es: string; onSpeak: () => void }) {
  return (
    <View style={styles.exampleRow}>
      <Pressable onPress={onSpeak} style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="volume-high-outline" size={18} color="#333" style={{ marginRight: 6 }} />
        <Text style={styles.jp}>{jp}</Text>
      </Pressable>
      <Text style={styles.esSmall}>{es}</Text>
    </View>
  );
}

/** ===================== Estilos ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf7f0" },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e6dbc7",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2eee6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1f1f1f" },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#efe2cd",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#2b2b2b", marginBottom: 8 },

  /* Bloques de gramática */
  grammarBlock: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  gI: { backgroundColor: "#fff6ec", borderColor: "#f2d7b5" },
  gNa: { backgroundColor: "#eefaf1", borderColor: "#ccebd6" },
  gColor: { backgroundColor: "#eef6ff", borderColor: "#cfe3ff" },

  blockTitle: { fontSize: 15, fontWeight: "900", color: "#1f1f1f", marginBottom: 6 },
  blockExplain: { fontSize: 13, color: "#2f2f2f", lineHeight: 20 },
  bold: { fontWeight: "800" },
  code: { fontFamily: "monospace", backgroundColor: "#0000000c", paddingHorizontal: 6, borderRadius: 6 },

  exampleRow: {
    backgroundColor: "#fffaf1",
    borderWidth: 1,
    borderColor: "#f0e2c9",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  jp: { fontSize: 14, color: "#242424", fontWeight: "700" },
  esSmall: { fontSize: 12, color: "#4a4a4a", marginTop: 2 },

  hint: { marginTop: 12, fontSize: 12, color: "#5a4632", lineHeight: 18 },

  /* Vocabulario */
  grid: { marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  wordCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#efdfc7",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emoji: { fontSize: 22 },
  kana: { fontSize: 16, fontWeight: "800", color: "#1f1f1f" },
  es: { fontSize: 12, color: "#3a3a3a" },

  /* Quiz */
  quizCard: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#efe2cd",
  },
  quizTitle: { fontSize: 16, fontWeight: "800", color: "#2b2b2b", marginBottom: 6 },
  quizPrompt: { fontSize: 14, color: "#2b2b2b" },
  jpBig: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", textDecorationLine: "underline" },
  optBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eddcbe",
    backgroundColor: "#fffaf2",
  },
  optText: { fontSize: 14, color: "#2b2b2b" },
  optCorrect: { backgroundColor: "#e8f9ef", borderColor: "#bde7cb" },
  optDisabled: { opacity: 0.5 },
  correctText: { marginTop: 8, color: "#137a35", fontWeight: "700" },
  wrongText: { marginTop: 8, color: "#b00020", fontWeight: "700" },
  subHint: { marginTop: 4, fontSize: 12, color: "#6b6b6b" },

  /* Ordena la oración */
  tokenWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 6, minHeight: 42 },
  tokenWrapAnswer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 6,
    minHeight: 42,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#f0e3c9",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  token: {
    backgroundColor: "#f7efe0",
    borderWidth: 1,
    borderColor: "#ecd9b8",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tokenAnswer: {
    backgroundColor: "#eaf6ff",
    borderWidth: 1,
    borderColor: "#cfe3ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tokenText: { fontSize: 14, color: "#2a2a2a", fontWeight: "600" },
  tokenGhost: { fontSize: 12, color: "#8a8a8a" },

  /* Botones y pills */
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetBtn: { backgroundColor: "#f4eee3", borderColor: "#e7dac2" },
  checkBtn: { backgroundColor: "#e3f7eb", borderColor: "#c9ebd7" },
  actionText: { fontSize: 13, fontWeight: "700", color: "#222" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 6 },
  pill: {
    backgroundColor: "#f6efe1",
    borderWidth: 1,
    borderColor: "#eadcc4",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, color: "#5a4632", fontWeight: "600" },
});
