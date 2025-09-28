import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ===== Hook LOCAL con estado (puedes reemplazar por tu store global) ===== */
function useDineroQuizLocal() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const start = (_n: number) => {
    setIndex(0);
    setAnswers({});
  };
  const answer = (qid: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  };
  const reset = () => {
    setIndex(0);
    setAnswers({});
  };

  return { index, answers, start, answer, setIndex, reset };
}

// Si tienes tu hook global, reemplaza esta línea por tu import y borra el local.
// import { useQuiz } from "@/hooks/useQuizGlobal";
const useQuiz = useDineroQuizLocal;
/* ======================================================================== */

type Choice = { key: string; label: string; correct?: boolean };
type Q = { id: string; prompt: string; choices: Choice[] };

const QUESTIONS: Q[] = [
  {
    id: "q1",
    prompt: "¿Qué moneda tiene agujero y es de buena suerte?",
    choices: [
      { key: "a", label: "5 えん", correct: true },
      { key: "b", label: "1 えん" },
      { key: "c", label: "100 えん" },
    ],
  },
  {
    id: "q2",
    prompt: "¿Cuál billete es el más usado día a día?",
    choices: [
      { key: "a", label: "1,000 えん", correct: true },
      { key: "b", label: "5,000 えん" },
      { key: "c", label: "10,000 えん" },
    ],
  },
  {
    id: "q3",
    prompt: "すいか（suica） sirve principalmente para…",
    choices: [
      { key: "a", label: "cambiar dinero" },
      { key: "b", label: "pagar transporte y compras", correct: true },
      { key: "c", label: "reservar hoteles" },
    ],
  },
  {
    id: "q4",
    prompt: "Al llegar a Japón, puedes cambiar dinero en…",
    choices: [
      { key: "a", label: "aeropuertos, estaciones y bancos", correct: true },
      { key: "b", label: "solo en tiendas pequeñas" },
      { key: "c", label: "solo en hoteles" },
    ],
  },
  {
    id: "q5",
    prompt: "“いくら ですか。” significa…",
    choices: [
      { key: "a", label: "¿cuánto cuesta?", correct: true },
      { key: "b", label: "¿dónde está el baño?" },
      { key: "c", label: "¿tiene cambio?" },
    ],
  },
  {
    id: "q6",
    prompt: "Para pagos grandes normalmente se usa…",
    choices: [
      { key: "a", label: "10,000 えん", correct: true },
      { key: "b", label: "1,000 えん" },
      { key: "c", label: "500 えん" },
    ],
  },
  {
    id: "q7",
    prompt: "Si un lugar no acepta tarjeta, lo mejor es…",
    choices: [
      { key: "a", label: "pagar en げんきん (efectivo)", correct: true },
      { key: "b", label: "irse sin pagar" },
      { key: "c", label: "pagar en dólares" },
    ],
  },
  {
    id: "q8",
    prompt: "Consejo al cambiar MXN→JPY:",
    choices: [
      { key: "a", label: "cambiar todo en Japón" },
      { key: "b", label: "cambiar una parte antes de viajar", correct: true },
      { key: "c", label: "no llevar efectivo" },
    ],
  },
];

export default function B6_Dinero() {
  const quiz = useQuiz();
  const total = QUESTIONS.length;

  useEffect(() => {
    quiz.start(total);
  }, []);

  const score = useMemo(() => {
    let s = 0;
    for (const q of QUESTIONS) {
      const pick = quiz.answers[q.id];
      const ok = q.choices.find((c) => c.key === pick)?.correct;
      if (ok) s++;
    }
    return s;
  }, [quiz.answers]);

  const allAnswered = useMemo(
    () => Object.keys(quiz.answers).length === total,
    [quiz.answers, total]
  );

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground />
      <ScrollView contentContainerStyle={s.c}>
        <Text style={s.h}>💴 おかね（dinero）</Text>

        {/* Info útil breve (sin kanji) */}
        <View style={s.box}>
          <Text style={s.b}>💰 もねーだ（monedas）</Text>
          <Text style={s.t}>
            1 / 5 / 10 / 50 / 100 / 500 えん. Las más comunes son 10, 100, 500.
            1 えん es muy ligera. 5 えん tiene agujero y da buena suerte.
          </Text>
        </View>

        <View style={s.box}>
          <Text style={s.b}>💵 びる（billetes）</Text>
          <Text style={s.t}>
            1,000 / 5,000 / 10,000 えん. 1,000 えん se usa mucho día a día. 10,000 えん para pagos grandes.
          </Text>
        </View>

        <View style={s.box}>
          <Text style={s.b}>📱 でんし けっさい（pago electrónico）</Text>
          <Text style={s.t}>
            すいか／ぱすも son tarjetas recargables para tren, tiendas y máquinas.
            Muchas tiendas aceptan かーど y apps (ぺいぺい).
          </Text>
        </View>

        <View style={s.box}>
          <Text style={s.b}>💱 へんかん（cambiar MXN→JPY）</Text>
          <Text style={s.t}>
            Cambia una parte en México y otra en Japón. En Japón puedes cambiar en
            くうこう（aeropuerto） y えき（estación）. Lleva げんきん (efectivo) por si no aceptan tarjeta.
          </Text>
        </View>

        {/* Frases útiles (hiragana) */}
        <View style={s.box}>
          <Text style={s.b}>🗣️ れんしゅう（frases）</Text>
          <Text>・ りょうがえ できますか。/ ¿Puedo cambiar dinero?</Text>
          <Text>・ かーど は つかえますか。/ ¿Aceptan tarjeta?</Text>
          <Text>・ れしーと を ください。/ Recibo, por favor.</Text>
          <Text>・ いくら ですか。/ ¿Cuánto cuesta?</Text>
          <Text>・ おつり は ありますか。/ ¿Hay cambio?</Text>
        </View>

        {/* Quiz interactivo */}
        <View style={s.box}>
          <Text style={s.b}>📝 くいず（8 もん）</Text>

          {QUESTIONS.map((q, idx) => {
            const picked = quiz.answers[q.id];
            const answered = !!picked;
            const correctKey = q.choices.find((c) => c.correct)?.key;

            return (
              <View key={q.id} style={s.qBox}>
                <Text style={s.qNum}>
                  {idx + 1} / {total}
                </Text>
                <Text style={s.qPrompt}>{q.prompt}</Text>

                <View style={{ gap: 8, marginTop: 8 }}>
                  {q.choices.map((c) => {
                    const selected = picked === c.key;
                    const good = answered && selected && c.correct;
                    const bad = answered && selected && !c.correct;
                    return (
                      <Pressable
                        key={c.key}
                        onPress={() => {
                          if (answered) return;
                          quiz.answer(q.id, c.key);
                          if (idx < total - 1) quiz.setIndex(idx + 1);
                        }}
                        style={[
                          s.opt,
                          selected && s.optSelected,
                          good && s.optGood,
                          bad && s.optBad,
                        ]}
                      >
                        <Text style={[s.optTxt, selected && s.optTxtSel]}>
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {answered && (
                  <View style={s.feedback}>
                    {picked === correctKey ? (
                      <Text style={s.good}>✔ せいかい（¡correcto!）</Text>
                    ) : (
                      <Text style={s.bad}>
                        ✖ ざんねん（incorrecto）. Respuesta:{" "}
                        {q.choices.find((c) => c.correct)?.label}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Footer del quiz (SIN botón Siguiente) */}
          <View style={s.quizFooter}>
            <Text style={s.score}>
              Puntuación: <Text style={s.bold}>{score}</Text> / {total}
            </Text>

            {allAnswered && (
              <Pressable
                onPress={() => {
                  quiz.reset();
                  quiz.start(total);
                }}
                style={s.navBtn}
              >
                <Text style={s.navTxt}>Reintentar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ==================== Fondo animado (translate/opacity) ==================== */
const ITEMS = ["¥", "えん", "にほん", "すいか", "¥", "えん", "¥"];

function AnimatedBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {ITEMS.map((txt, i) => (
        <Float key={i} delay={i * 400} leftPct={(i * 14) % 90} text={txt} />
      ))}
    </View>
  );
}

function Float({ delay = 0, leftPct = 10, text = "¥" }: { delay?: number; leftPct?: number; text?: string }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, {
          toValue: 1,
          duration: 12000,
          delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 1200, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 9000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ]).start(loop);
    };
    loop();
  }, [delay, opacity, y]);

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [60, -320] });
  const scale = y.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  return (
    <Animated.View
      style={[
        stylesFloat.item,
        {
          left: `${leftPct}%`,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={stylesFloat.text}>{text}</Text>
    </Animated.View>
  );
}

const stylesFloat = StyleSheet.create({
  item: { position: "absolute", bottom: 0 },
  text: { fontSize: 28, opacity: 0.6 },
});

/* ==================== Estilos UI ==================== */
const s = StyleSheet.create({
  c: { padding: 16, gap: 14, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: "900", marginBottom: 4 },
  b: { fontWeight: "900", fontSize: 18, marginBottom: 6 },
  t: { fontSize: 15, marginBottom: 6, lineHeight: 22 },
  box: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  qBox: { marginTop: 8, paddingTop: 6 },
  qNum: { fontSize: 12, opacity: 0.6, marginBottom: 4 },
  qPrompt: { fontSize: 16, fontWeight: "800" },

  opt: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  optSelected: { borderColor: "rgba(0,0,0,0.35)" },
  optGood: { backgroundColor: "rgba(0,200,0,0.10)" },
  optBad: { backgroundColor: "rgba(200,0,0,0.10)" },
  optTxt: { fontSize: 15 },
  optTxtSel: { fontWeight: "800" },

  feedback: { marginTop: 8 },
  good: { fontWeight: "800", color: "#0a7a0a" },
  bad: { fontWeight: "800", color: "#8a0b0b" },

  quizFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  score: { fontSize: 14 },
  bold: { fontWeight: "900" },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  navTxt: { fontWeight: "800" },
});
