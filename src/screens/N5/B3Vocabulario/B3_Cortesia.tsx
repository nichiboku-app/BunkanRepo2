// src/screens/N5/B3Vocabulario/B3_Cortesia.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
  useWindowDimensions,
} from "react-native";
import type { RootStackParamList } from "../../../../types";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ============== Navegación ============== */
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ============== Datos ============== */
type Phrase = {
  key: string;
  kana: string;
  es: string;
  emoji?: string;
};
const PHRASES: Phrase[] = [
  { key: "ohayo", kana: "おはようございます", es: "Buenos días", emoji: "🌅" },
  { key: "konnichiwa", kana: "こんにちは", es: "Buenas tardes (hola)", emoji: "☀️" },
  { key: "konbanwa", kana: "こんばんは", es: "Buenas noches (saludo)", emoji: "🌙" },
  { key: "arigato", kana: "ありがとうございます", es: "Muchas gracias", emoji: "🙏" },
  { key: "sumimasen", kana: "すみません", es: "Perdón / Disculpe / Gracias (leve)", emoji: "🙇" },
  { key: "onegai", kana: "お願いします", es: "Por favor (servicio/petición)", emoji: "📝" },
  { key: "kudasai", kana: "〜をください", es: "Me da… por favor", emoji: "🛒" },
  { key: "douzo", kana: "どうぞ", es: "Tome/Adelante/Con gusto", emoji: "👐" },
  { key: "hai", kana: "はい", es: "Sí", emoji: "✅" },
  { key: "iie", kana: "いいえ", es: "No / De nada (al negar agradecimiento)", emoji: "❌" },
  { key: "yoroshiku", kana: "よろしくお願いします", es: "Mucho gusto / Quedo a su cuidado", emoji: "🤝" },
  { key: "shitsurei", kana: "失礼します", es: "Con permiso / Disculpe (entrar/salir)", emoji: "🚪" },
  { key: "otsukare", kana: "おつかれさまです", es: "Buen trabajo / Gracias por el esfuerzo", emoji: "💼" },
  { key: "itadakimasu", kana: "いただきます", es: "¡A comer! (antes de comer)", emoji: "🍽️" },
  { key: "gochisou", kana: "ごちそうさまでした", es: "Gracias por la comida (después)", emoji: "😋" },
  { key: "sayounara", kana: "さようなら", es: "Adiós", emoji: "👋" },
  { key: "mata", kana: "じゃあ、また", es: "Nos vemos", emoji: "👋" },
  { key: "sumimasen-mizu", kana: "すみません、みずをください。", es: "Disculpe, agua por favor.", emoji: "💧" },
  { key: "arigato-gozaimashita", kana: "ありがとうございました", es: "Muchas gracias (pasado)", emoji: "🙏" },
  { key: "kochira", kana: "こちらこそ", es: "Al contrario (el gusto es mío)", emoji: "🙂" },
];

/* Videos: sustituye las URI por tus mp4 (locales o CDN) */
type LessonVideo = {
  id: string;
  title: string;
  uri: string; // Reemplaza por tus rutas reales
  keyPhrases: string[];
  suggestedEs: string;
};
const VIDEOS: LessonVideo[] = [
  {
    id: "v1",
    title: "Recepción en tienda",
    uri: "https://YOUR-CDN/video1.mp4", // ← reemplaza
    keyPhrases: ["いらっしゃいませ", "すみません", "〜をください", "ありがとうございます", "どうぞ"],
    suggestedEs:
      "Bienvenido. — Disculpe, ¿me da agua por favor? — Claro, adelante. — Muchas gracias.",
  },
  {
    id: "v2",
    title: "Primer día de clase",
    uri: "https://YOUR-CDN/video2.mp4", // ← reemplaza
    keyPhrases: ["はじめまして", "よろしくお願いします", "ありがとうございます"],
    suggestedEs: "Mucho gusto. — Quedo a su cuidado. — Muchas gracias.",
  },
  {
    id: "v3",
    title: "Restaurante simple",
    uri: "https://YOUR-CDN/video3.mp4", // ← reemplaza
    keyPhrases: ["すみません", "メニューをください", "ごちそうさまでした"],
    suggestedEs: "Disculpe. — ¿Me trae el menú, por favor? — Gracias por la comida.",
  },
];

/* ============== Utils ============== */
const speakJa = (text: string) => {
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.98 });
};
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/* ============== Screen ============== */
export default function B3_Cortesia() {
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong, ready } = useFeedbackSounds();
  const { width } = useWindowDimensions();

  // Animación
  const fade = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  /* ---------- QUIZ (8 preguntas, sin rōmaji) ---------- */
  type Quiz = { prompt: Phrase; options: Phrase[]; correctKey: string };
  const buildOptions = (p: Phrase) => {
    const pool = PHRASES.filter((x) => x.key !== p.key);
    return shuffle([p, ...shuffle(pool).slice(0, 2)]);
  };
  const newQuizSet = () => shuffle(PHRASES).slice(0, 8);
  const [quizSet, setQuizSet] = useState<Phrase[]>(() => newQuizSet());
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
          if (quizIdx < 7) advanceQuiz(quizIdx + 1);
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

  /* ---------- Ordena la oración (8) ---------- */
  type OrderItem = { id: string; jpTokens: string[]; es: string };
  const ORDER_BANK: OrderItem[] = [
    { id: "ohayo", jpTokens: ["おはようございます。"], es: "Buenos días." },
    { id: "onegai-water", jpTokens: ["すみません、", "みずを", "ください。"], es: "Disculpe, agua por favor." },
    { id: "please-menu", jpTokens: ["メニューを", "お願いします。"], es: "El menú, por favor." },
    { id: "douzo", jpTokens: ["どうぞ。"], es: "Adelante / Tome." },
    { id: "arigato", jpTokens: ["ありがとうございます。"], es: "Muchas gracias." },
    { id: "yoroshiku", jpTokens: ["よろしく", "お願いします。"], es: "Mucho gusto / Quedo a su cuidado." },
    { id: "shitsurei", jpTokens: ["失礼します。"], es: "Con permiso." },
    { id: "gochisou", jpTokens: ["ごちそうさまでした。"], es: "Gracias por la comida." },
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

  /* ---------- UI helpers ---------- */
  const Pill = ({ label }: { label: string }) => (
    <View style={styles.pill}><Text style={styles.pillText}>{label}</Text></View>
  );
  const width16x9 = Math.min(width - 32, 760);
  const videoHeight = (width16x9 * 9) / 16;

  const greetings = useMemo(() => PHRASES.slice(0, 10), []);
  const others = useMemo(() => PHRASES.slice(10), []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </Pressable>
        <Text style={styles.title}>Cortesía — あいさつ・ていねい</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {/* ===== 1) VOCABULARIO ===== */}
        <SectionHeader icon="happy-outline" label="Saludos y frases de cortesía (tap para oír)" />
        <View style={styles.grid}>
          {greetings.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        <SectionHeader icon="hand-left-outline" label="Peticiones y agradecimientos" />
        <View style={styles.grid}>
          {others.map((it) => (
            <WordCard key={it.key} it={it} onSpeak={() => speakJa(it.kana)} />
          ))}
        </View>

        {/* ===== 2) GRAMÁTICA – “como primaria” ===== */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Gramática clave (explicado fácil)</Text>

          <View style={[styles.grammarBlock, styles.g1]}>
            <Text style={styles.blockTitle}>① 〜をください — “Me da… por favor”</Text>
            <Text style={styles.blockExplain}>
              <Text style={styles.bold}>[objeto] を ください</Text> se usa para pedir algo concreto.
              {"\n"}Ej.: <Text style={styles.code}>みずを ください。</Text> “Agua, por favor.”
            </Text>
            <Example jp="すみません、みずを ください。" es="Disculpe, agua por favor." onSpeak={() => speakJa("すみません、みずを ください。")} />
            <Example jp="メニューを ください。" es="El menú, por favor." onSpeak={() => speakJa("メニューを ください。")} />
          </View>

          <View style={[styles.grammarBlock, styles.g2]}>
            <Text style={styles.blockTitle}>② お願いします — “Por favor (servicio)”</Text>
            <Text style={styles.blockExplain}>
              <Text style={styles.bold}>お願いします</Text> se usa para pedir un **servicio/gesto** o cerrar una petición.
              {"\n"}Ej.: <Text style={styles.code}>よろしく お願いします。</Text> “Mucho gusto / Cuento con usted.”
            </Text>
            <Example jp="メニュー、お願いします。" es="El menú, por favor (servicio)." onSpeak={() => speakJa("メニュー、お願いします。")} />
            <Example jp="よろしく お願いします。" es="Mucho gusto / Quedo a su cuidado." onSpeak={() => speakJa("よろしく お願いします。")} />
          </View>

          <View style={[styles.grammarBlock, styles.g3]}>
            <Text style={styles.blockTitle}>③ すみません vs ありがとうございます</Text>
            <Text style={styles.blockExplain}>
              <Text style={styles.bold}>すみません</Text> = “Perdón/Disculpe” (y a veces “gracias” leve).{"\n"}
              <Text style={styles.bold}>ありがとうございます</Text> = “Muchas gracias” (fuerte).{"\n"}
              Respuesta amable: <Text style={styles.code}>いいえ（いえいえ）。</Text> “De nada / no se preocupe.”
            </Text>
            <Example jp="すみません！" es="¡Disculpe!" onSpeak={() => speakJa("すみません！")} />
            <Example jp="ありがとうございます。" es="Muchas gracias." onSpeak={() => speakJa("ありがとうございます。")} />
            <Example jp="いいえ、どういたしまして。" es="No hay de qué." onSpeak={() => speakJa("いいえ、どういたしまして。")} />
          </View>
        </View>

        {/* ===== TIPS ===== */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>Cómo estudiar esta pantalla</Text>
          <View style={styles.rowWrap}>
            <Pill label="Vocabulario: 3 repeticiones" />
            <Pill label="Gramática: fórmulas + 4 ejemplos" />
            <Pill label="Ejercicios: 8/8" />
            <Pill label="Videos: traduce 2–3" />
          </View>
          <Text style={styles.hint}>
            • Di las frases mirando un punto: <Text style={styles.bold}>hola → gracias → despedida</Text>.{"\n"}
            • Escribe 3 peticiones con <Text style={styles.bold}>〜をください</Text> y 2 con <Text style={styles.bold}>お願いします</Text>.{"\n"}
            • En videos: pausa cada línea, anota palabras clave y arma tu traducción natural (no literal).
          </Text>
        </View>

        {/* ===== 3) EJERCICIOS ===== */}
        {/* Quiz */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Quiz de cortesía — Progreso {quizIdx + 1}/8</Text>
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
              <Text style={styles.optText}>{opt.emoji ? `${opt.emoji} ` : ""}{opt.es}</Text>
            </Pressable>
          ))}
          {quizIdx >= 7 && quizFeedback === "correct" && <Text style={styles.correctText}>¡Completaste 8/8! 🎉</Text>}
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

        {/* Ordena */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Ordena la oración — Progreso {orderIdx + 1}/8</Text>
          <Text style={styles.quizPrompt}>Arma la frase correcta según la gramática:</Text>
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
            <Pressable style={[styles.actionBtn, styles.checkBtn]} onPress={checkOrder}>
              <Ionicons name="checkmark-done-outline" size={16} />
              <Text style={styles.actionText}>Comprobar</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.resetBtn]} onPress={restartOrder}>
              <Ionicons name="refresh-outline" size={16} />
              <Text style={styles.actionText}>Reiniciar (8 nuevas)</Text>
            </Pressable>
          </View>

          {orderIdx >= 7 && <Text style={styles.correctText}>¡Completaste 8/8! 🎉</Text>}
          {orderFeedback === "wrong" && <Text style={styles.wrongText}>Revisa el orden y vuelve a intentar ❌</Text>}
          {orderFeedback === "correct" && orderIdx < 7 && <Text style={styles.correctText}>¡Excelente! ✅</Text>}
        </View>

        {/* ===== 4) ZONA DE VIDEOS — TRADUCCIÓN ===== */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Videos para traducir (2–3)</Text>
          <Text style={styles.hint}>
            Pausa en cada línea, anota palabras clave y escribe tu traducción. Puedes mostrar una **guía** o la **traducción sugerida**.
          </Text>

          {VIDEOS.map((v) => (
            <VideoCard key={v.id} v={v} width={width16x9} height={videoHeight} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Animated.View>
  );
}

/* ============== Subcomponentes ============== */

function SectionHeader({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#333" style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function WordCard({ it, onSpeak }: { it: Phrase; onSpeak: () => void }) {
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

/* Tarjeta de video + traducción (expo-video) */
function VideoCard({ v, width, height }: { v: any; width: number; height: number }) {
  const [showGuide, setShowGuide] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userText, setUserText] = useState("");

  // 🎥 expo-video
  const player = useVideoPlayer(v.uri, (p) => {
    // config inicial si quieres
    p.loop = false;
    p.muted = false;
  });

  // helpers (tolerantes a tipos)
  const restart = () => {
    (player as any)?.pause?.();
    (player as any)?.seek?.(0);
  };

  return (
    <View style={styles.videoWrap}>
      <Text style={styles.videoTitle}>{v.title}</Text>
      <VideoView
        style={{ width, height, backgroundColor: "#000", borderRadius: 12 }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
      />
      <View style={styles.actionsRow}>
        <Pressable style={[styles.actionBtn, styles.resetBtn]} onPress={restart}>
          <Ionicons name="refresh-outline" size={16} />
          <Text style={styles.actionText}>Reiniciar</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.checkBtn]} onPress={() => setShowGuide((s) => !s)}>
          <Ionicons name="bulb-outline" size={16} />
          <Text style={styles.actionText}>{showGuide ? "Ocultar guía" : "Mostrar guía"}</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.resetBtn]} onPress={() => setShowSolution((s) => !s)}>
          <Ionicons name="book-outline" size={16} />
          <Text style={styles.actionText}>{showSolution ? "Ocultar sugerida" : "Traducción sugerida"}</Text>
        </Pressable>
      </View>

      {showGuide && (
        <View style={styles.guideBox}>
          <Text style={styles.hint}>Palabras clave: {v.keyPhrases.join(" ・ ")}</Text>
        </View>
      )}

      <Text style={[styles.quizPrompt, { marginTop: 8 }]}>Tu traducción:</Text>
      <TextInput
        placeholder="Escribe aquí tu traducción en español…"
        value={userText}
        onChangeText={setUserText}
        multiline
        style={styles.input}
      />

      {showSolution && (
        <View style={styles.solutionBox}>
          <Text style={styles.esSmall}>Sugerencia (natural): {v.suggestedEs}</Text>
        </View>
      )}
    </View>
  );
}

/* ============== Estilos ============== */
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

  /* Gramática */
  grammarBlock: { borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1 },
  g1: { backgroundColor: "#fff6ec", borderColor: "#f2d7b5" },
  g2: { backgroundColor: "#eefaf1", borderColor: "#ccebd6" },
  g3: { backgroundColor: "#eef6ff", borderColor: "#cfe3ff" },
  blockTitle: { fontSize: 15, fontWeight: "900", color: "#1f1f1f", marginBottom: 6 },
  blockExplain: { fontSize: 13, color: "#2f2f2f", lineHeight: 20 },
  bold: { fontWeight: "800" },
  code: { fontFamily: "monospace", backgroundColor: "#0000000c", paddingHorizontal: 6, borderRadius: 6 },

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

  /* Tips pills */
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

  /* Quiz */
  quizCard: { marginTop: 18, backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#efe2cd" },
  quizTitle: { fontSize: 16, fontWeight: "800", color: "#2b2b2b", marginBottom: 6 },
  quizPrompt: { fontSize: 14, color: "#2b2b2b" },
  jpBig: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", textDecorationLine: "underline" },
  optBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#eddcbe", backgroundColor: "#fffaf2" },
  optText: { fontSize: 14, color: "#2b2b2b" },
  optCorrect: { backgroundColor: "#e8f9ef", borderColor: "#bde7cb" },
  optDisabled: { opacity: 0.5 },
  correctText: { marginTop: 8, color: "#137a35", fontWeight: "700" },
  wrongText: { marginTop: 8, color: "#b00020", fontWeight: "700" },
  subHint: { marginTop: 4, fontSize: 12, color: "#6b6b6b" },

  /* Ordena */
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
  token: { backgroundColor: "#f7efe0", borderWidth: 1, borderColor: "#ecd9b8", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  tokenAnswer: { backgroundColor: "#eaf6ff", borderWidth: 1, borderColor: "#cfe3ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  tokenText: { fontSize: 14, color: "#2a2a2a", fontWeight: "600" },
  tokenGhost: { fontSize: 12, color: "#8a8a8a" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  resetBtn: { backgroundColor: "#f4eee3", borderColor: "#e7dac2" },
  checkBtn: { backgroundColor: "#e3f7eb", borderColor: "#c9ebd7" },
  actionText: { fontSize: 13, fontWeight: "700", color: "#222" },

  /* Videos */
  videoWrap: { marginTop: 14, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eddcbe" },
  videoTitle: { fontSize: 15, fontWeight: "800", color: "#1f1f1f", marginBottom: 8 },
  guideBox: { marginTop: 8, backgroundColor: "#fffaf1", borderWidth: 1, borderColor: "#f0e2c9", borderRadius: 10, padding: 10 },
  solutionBox: { marginTop: 8, backgroundColor: "#eef6ff", borderWidth: 1, borderColor: "#cfe3ff", borderRadius: 10, padding: 10 },
  input: {
    marginTop: 8,
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2d6be",
    backgroundColor: "#fff",
    padding: 10,
    textAlignVertical: "top",
  },
});
