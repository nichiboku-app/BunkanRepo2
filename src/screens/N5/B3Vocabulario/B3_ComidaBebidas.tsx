// src/screens/N5/B3Vocabulario/B3_ComidaBebidas.tsx
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
type Item = {
  key: string;
  kana: string;
  ro: string;
  es: string;
  emoji?: string;
  type: "food" | "drink";
};

const ITEMS: Item[] = [
  { key: "gohan", kana: "ごはん", ro: "gohan", es: "arroz (cocido / comida)", emoji: "🍚", type: "food" },
  { key: "pan", kana: "パン", ro: "pan", es: "pan", emoji: "🍞", type: "food" },
  { key: "ramen", kana: "ラーメン", ro: "raamen", es: "ramen", emoji: "🍜", type: "food" },
  { key: "sushi", kana: "すし", ro: "sushi", es: "sushi", emoji: "🍣", type: "food" },
  { key: "sakana", kana: "さかな", ro: "sakana", es: "pescado", emoji: "🐟", type: "food" },
  { key: "niku", kana: "にく", ro: "niku", es: "carne", emoji: "🥩", type: "food" },
  { key: "yasai", kana: "やさい", ro: "yasai", es: "verduras", emoji: "🥦", type: "food" },
  { key: "kudamono", kana: "くだもの", ro: "kudamono", es: "frutas", emoji: "🍎", type: "food" },
  { key: "tamago", kana: "たまご", ro: "tamago", es: "huevo", emoji: "🥚", type: "food" },
  { key: "karee", kana: "カレー", ro: "karee", es: "curry", emoji: "🍛", type: "food" },
  { key: "misoshiru", kana: "みそしる", ro: "misoshiru", es: "sopa de miso", emoji: "🥣", type: "food" },
  { key: "onigiri", kana: "おにぎり", ro: "onigiri", es: "bola de arroz", emoji: "🍙", type: "food" },
  { key: "mizu", kana: "みず", ro: "mizu", es: "agua", emoji: "💧", type: "drink" },
  { key: "ocha", kana: "おちゃ", ro: "ocha", es: "té (verde)", emoji: "🍵", type: "drink" },
  { key: "koohii", kana: "コーヒー", ro: "koohii", es: "café", emoji: "☕", type: "drink" },
  { key: "gyuunyuu", kana: "ぎゅうにゅう", ro: "gyuunyuu", es: "leche", emoji: "🥛", type: "drink" },
  { key: "juusu", kana: "ジュース", ro: "juusu", es: "jugo", emoji: "🧃", type: "drink" },
  { key: "koora", kana: "コーラ", ro: "koora", es: "refresco (cola)", emoji: "🥤", type: "drink" },
  { key: "sake", kana: "さけ", ro: "sake", es: "sake (licor de arroz)", emoji: "🍶", type: "drink" },
  { key: "biiru", kana: "ビール", ro: "biiru", es: "cerveza", emoji: "🍺", type: "drink" },
];

/** ===================== Utilidades ===================== */
const speakJa = (text: string) => {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
};
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/** ===================== Componente ===================== */
export default function B3_ComidaBebidas() {
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

  /** ---------- QUIZ RÁPIDO (8 preguntas, sin rōmaji) ---------- */
  type Quiz = { prompt: Item; options: Item[]; correctKey: string };
  const buildOptions = (prompt: Item) => {
    const pool = ITEMS.filter((it) => it.key !== prompt.key);
    return shuffle([prompt, ...shuffle(pool).slice(0, 2)]);
  };
  const newQuizSet = () => shuffle(ITEMS).slice(0, 8);
  const [quizSet, setQuizSet] = useState<Item[]>(() => newQuizSet());
  const [quizIdx, setQuizIdx] = useState(0);
  const [quiz, setQuiz] = useState<Quiz>(() => {
    const p = newQuizSet()[0];
    return { prompt: p, options: buildOptions(p), correctKey: p.key };
  });
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);

  const advanceQuiz = useCallback(
    (nextIdx: number, set?: Item[]) => {
      const activeSet = set ?? quizSet;
      const p = activeSet[nextIdx];
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

  /** ---------- Ordena la oración (8 oraciones) ---------- */
  type OrderItem = { id: string; jpTokens: string[]; ro: string; es: string };
  const ORDER_BANK: OrderItem[] = [
    { id: "suki-sushi", jpTokens: ["わたしは", "すしが", "すきです。"], ro: "watashi wa / sushi ga / suki desu.", es: "Me gusta el sushi." },
    { id: "sukidewa-niku", jpTokens: ["にくは", "すきでは", "ありません。"], ro: "niku wa / suki de wa / arimasen.", es: "No me gusta la carne." },
    { id: "tabemasu-pan", jpTokens: ["わたしは", "パンを", "たべます。"], ro: "watashi wa / pan o / tabemasu.", es: "Yo como pan." },
    { id: "tabemasen-gohan", jpTokens: ["わたしは", "ごはんを", "たべません。"], ro: "watashi wa / gohan o / tabemasen.", es: "Yo no como arroz." },
    { id: "nomimasu-coffee", jpTokens: ["わたしは", "コーヒーを", "のみます。"], ro: "watashi wa / koohii o / nomimasu.", es: "Yo bebo café." },
    { id: "nomimasen-beer", jpTokens: ["わたしは", "ビールを", "のみません。"], ro: "watashi wa / biiru o / nomimasen.", es: "Yo no bebo cerveza." },
    { id: "suki-oyasai", jpTokens: ["わたしは", "やさいが", "すきです。"], ro: "watashi wa / yasai ga / suki desu.", es: "Me gustan las verduras." },
    { id: "nomimasen-gyuunyuu", jpTokens: ["わたしは", "ぎゅうにゅうを", "のみません。"], ro: "watashi wa / gyuunyuu o / nomimasen.", es: "Yo no bebo leche." },
  ];
  const newOrderSeq = () => shuffle(ORDER_BANK).slice(0, 8);
  const [orderSeq, setOrderSeq] = useState<OrderItem[]>(() => newOrderSeq());
  const [orderIdx, setOrderIdx] = useState(0);
  const [poolTokens, setPoolTokens] = useState<string[]>(() => shuffle(orderSeq[0].jpTokens));
  const [answerTokens, setAnswerTokens] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<"correct" | "wrong" | null>(null);
  const currentOrder = orderSeq[orderIdx];

  const resetOrderRound = useCallback(
    (seq?: OrderItem[], idx?: number) => {
      const s = seq ?? orderSeq;
      const i = typeof idx === "number" ? idx : orderIdx;
      setPoolTokens(shuffle(s[i].jpTokens));
      setAnswerTokens([]);
      setOrderFeedback(null);
    },
    [orderSeq, orderIdx]
  );

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
      speakJa(currentOrder.jpTokens.join(""));
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
  const foods = useMemo(() => ITEMS.filter((i) => i.type === "food"), []);
  const drinks = useMemo(() => ITEMS.filter((i) => i.type === "drink"), []);

  const Pill = ({ label }: { label: string }) => (
    <View style={styles.pill}><Text style={styles.pillText}>{label}</Text></View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </Pressable>
        <Text style={styles.title}>Comida y Bebidas — 食べ物・飲み物</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* ===== 1) VOCABULARIO ===== */}
        <SectionHeader icon="restaurant-outline" label="Comidas" />
        <View style={styles.grid}>
          {foods.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        <SectionHeader icon="cafe-outline" label="Bebidas" />
        <View style={styles.grid}>
          {drinks.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        {/* ===== 2) GRAMÁTICA ===== */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Gramática clave (explicado fácil)</Text>

          {/* (1) が好きです */}
          <View style={[styles.grammarBlock, styles.g1]}>
            <Text style={styles.blockTitle}>① が好きです — “Me gusta…”</Text>
            <Text style={styles.blockExplain}>
              Usa <Text style={styles.bold}>が</Text> para marcar lo que te gusta y di{" "}
              <Text style={styles.bold}>好きです</Text>.{"\n"}
              Fórmula: <Text style={styles.code}>[sujeto] は [objeto] が 好きです。</Text>
            </Text>
            <Example jp="わたしは すしが すきです。" es="Me gusta el sushi." onSpeak={() => speakJa("わたしは すしが すきです。")} />
            <Example jp="わたしは パンが すきです。" es="Me gusta el pan." onSpeak={() => speakJa("わたしは パンが すきです。")} />
            <Example jp="わたしは にくが すきです。" es="Me gusta la carne." onSpeak={() => speakJa("わたしは にくが すきです。")} />
          </View>

          {/* (2) は好きではありません */}
          <View style={[styles.grammarBlock, styles.g2]}>
            <Text style={styles.blockTitle}>② は好きではありません — “No me gusta…”</Text>
            <Text style={styles.blockExplain}>
              Para negar, usa <Text style={styles.bold}>は</Text> y di{" "}
              <Text style={styles.bold}>好きではありません</Text>.{"\n"}
              Fórmula: <Text style={styles.code}>[objeto] は 好きではありません。</Text>
            </Text>
            <Example jp="わたしは にくは すきでは ありません。" es="No me gusta la carne." onSpeak={() => speakJa("わたしは にくは すきでは ありません。")} />
            <Example jp="わたしは さかなは すきでは ありません。" es="No me gusta el pescado." onSpeak={() => speakJa("わたしは さかなは すきでは ありません。")} />
            <Example jp="わたしは ぎゅうにゅうは すきでは ありません。" es="No me gusta la leche." onSpeak={() => speakJa("わたしは ぎゅうにゅうは すきでは ありません。")} />
          </View>

          {/* (3) を + 食べます／食べません */}
          <View style={[styles.grammarBlock, styles.g3]}>
            <Text style={styles.blockTitle}>③ を + 食べます／食べません — “Comer / No comer”</Text>
            <Text style={styles.blockExplain}>
              <Text style={styles.bold}>を</Text> marca el objeto directo. Con comida usa{" "}
              <Text style={styles.bold}>食べます</Text> (como) o{" "}
              <Text style={styles.bold}>食べません</Text> (no como).{"\n"}
              Fórmula: <Text style={styles.code}>[comida] を 食べます／食べません。</Text>
            </Text>
            <Example jp="パンを たべます。" es="(Yo) como pan." onSpeak={() => speakJa("パンを たべます。")} />
            <Example jp="ごはんを たべません。" es="(Yo) no como arroz." onSpeak={() => speakJa("ごはんを たべません。")} />
            <Example jp="カレーを たべません。" es="(Yo) no como curry." onSpeak={() => speakJa("カレーを たべません。")} />
          </View>

          {/* (4) を + 飲みます／飲みません */}
          <View style={[styles.grammarBlock, styles.g4]}>
            <Text style={styles.blockTitle}>④ を + 飲みます／飲みません — “Beber / No beber”</Text>
            <Text style={styles.blockExplain}>
              Con bebidas usa <Text style={styles.bold}>飲みます</Text> (bebo) o{" "}
              <Text style={styles.bold}>飲みません</Text> (no bebo).{"\n"}
              Fórmula: <Text style={styles.code}>[bebida] を 飲みます／飲みません。</Text>
            </Text>
            <Example jp="コーヒーを のみます。" es="(Yo) bebo café." onSpeak={() => speakJa("コーヒーを のみます。")} />
            <Example jp="ビールを のみません。" es="(Yo) no bebo cerveza." onSpeak={() => speakJa("ビールを のみません。")} />
            <Example jp="ぎゅうにゅうを のみません。" es="(Yo) no bebo leche." onSpeak={() => speakJa("ぎゅうにゅうを のみません。")} />
          </View>
        </View>

        {/* ===== TIPS DE ESTUDIO ===== */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>Cómo estudiar esta pantalla</Text>
          <View style={styles.rowWrap}>
            <Pill label="Vocabulario: 3 pasadas" />
            <Pill label="Gramática: leer + repetir" />
            <Pill label="Ejercicios: 8/8 ✔️" />
          </View>
          <Text style={styles.hint}>
            • <Text style={styles.bold}>Vocabulario:</Text> lee el kaná, toca para escuchar y repite 2–3 veces. Cubre con el dedo y di el significado.{"\n"}
            • <Text style={styles.bold}>Gramática:</Text> copia las fórmulas en una libreta, crea 2 ejemplos con comida y 2 con bebida. Léelos en voz alta.{"\n"}
            • <Text style={styles.bold}>Quiz rápido:</Text> sin rōmaji, escucha y reconoce el kaná. Si fallas, toca de nuevo para oír la pronunciación.{"\n"}
            • <Text style={styles.bold}>Ordena la oración:</Text> piensa “sujeto は / objeto が o を / verbo”, arma y luego presiona “Comprobar”.
          </Text>
        </View>

        {/* ===== 3) EJERCICIOS ===== */}

        {/* Quiz rápido (8 preguntas) */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Quiz rápido — Progreso {quizIdx + 1}/8</Text>
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

          {/* Estado final / reinicio */}
          {quizIdx >= 7 && quizFeedback === "correct" && (
            <Text style={styles.correctText}>¡Completaste las 8 preguntas! 🎉</Text>
          )}
          {quizIdx >= 7 && !quizFeedback && (
            <Text style={styles.correctText}>¡Quiz completo! 🎉</Text>
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

        {/* Ordena la oración (8 oraciones) */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Ordena la oración — Progreso {orderIdx + 1}/8</Text>
          <Text style={styles.quizPrompt}>Arma la frase correcta con la gramática vista:</Text>
          <View style={{ height: 6 }} />
          <Text style={styles.subHint}>Objetivo: {currentOrder.es}</Text>

          {/* Pool de fichas */}
          <Text style={[styles.quizPrompt, { marginTop: 8 }]}>Fichas:</Text>
          <View style={styles.tokenWrap}>
            {poolTokens.map((t, i) => (
              <Pressable key={`${t}-${i}`} style={styles.token} onPress={() => addToken(t, i)}>
                <Text style={styles.tokenText}>{t}</Text>
              </Pressable>
            ))}
            {poolTokens.length === 0 && <Text style={styles.tokenGhost}>—</Text>}
          </View>

          {/* Respuesta construida */}
          <Text style={[styles.quizPrompt, { marginTop: 8 }]}>Tu oración (toca para quitar):</Text>
          <View style={styles.tokenWrapAnswer}>
            {answerTokens.map((t, i) => (
              <Pressable key={`${t}-ans-${i}`} style={styles.tokenAnswer} onPress={() => removeToken(i)}>
                <Text style={styles.tokenText}>{t}</Text>
              </Pressable>
            ))}
            {answerTokens.length === 0 && <Text style={styles.tokenGhost}>Toca fichas para armar la oración…</Text>}
          </View>

          {/* Controles */}
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

          {/* Estado */}
          {orderIdx >= 7 && (
            <Text style={styles.correctText}>¡Completaste las 8 oraciones! 🎉</Text>
          )}
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

function WordCard({ it, onSpeak }: { it: Item; onSpeak: () => void }) {
  return (
    <Pressable onPress={onSpeak} style={styles.wordCard}>
      <Text style={styles.emoji}>{it.emoji ?? "🍽️"}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.kana}>{it.kana}</Text>
        <Text style={styles.romaji}>{it.ro}</Text>
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
  g1: { backgroundColor: "#fff6ec", borderColor: "#f2d7b5" },
  g2: { backgroundColor: "#ffefef", borderColor: "#f2c0c0" },
  g3: { backgroundColor: "#eefaf1", borderColor: "#ccebd6" },
  g4: { backgroundColor: "#eef6ff", borderColor: "#cfe3ff" },

  blockTitle: { fontSize: 15, fontWeight: "900", color: "#1f1f1f", marginBottom: 6 },
  blockExplain: { fontSize: 13, color: "#2f2f2f", lineHeight: 20 },
  bold: { fontWeight: "800" },
  code: { fontFamily: "monospace", backgroundColor: "#0000000c", paddingHorizontal: 6, borderRadius: 6 },

  examples: { marginTop: 8, gap: 8 },
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
  emoji: { fontSize: 24 },
  kana: { fontSize: 16, fontWeight: "800", color: "#1f1f1f" },
  romaji: { fontSize: 12, color: "#6b6b6b", marginTop: 1 },
  es: { fontSize: 12, color: "#3a3a3a" },

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
    borderColor: "#cfe7fb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tokenText: { fontSize: 14, color: "#2a2a2a", fontWeight: "600" },
  tokenGhost: { fontSize: 12, color: "#8a8a8a" },

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

  /* Pills */
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
     