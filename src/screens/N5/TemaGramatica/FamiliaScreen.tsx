// src/screens/N5/TemaGramaticaFamiliaScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

type Props = NativeStackScreenProps<RootStackParamList, "TemaGramaticaFamiliaN5">;

const { width: W, height: H } = Dimensions.get("window");

/* ======== Fondo de Linternas y Fuegos Artificiales ======== */
function Lantern({ x, y, size = 30, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  const rot = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] });
  const bob = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, 0] });

  return (
    <>
      <View
        style={{
          position: "absolute",
          left: x + size / 2 - 1,
          top: 0,
          width: 2,
          height: y - 6,
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      />
      <Animated.Text
        style={{
          position: "absolute",
          left: x,
          top: y,
          fontSize: size,
          transform: [{ rotate: rot }, { translateY: bob }],
          textShadowColor: "rgba(255,120,80,0.6)",
          textShadowRadius: 8,
        }}
      >
        🏮
      </Animated.Text>
    </>
  );
}

function FireworkBurst({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 1600, useNativeDriver: false }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  const size = t.interpolate({ inputRange: [0, 1], outputRange: [0, 140] });
  const op = t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.0, 0.6, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - 70,
        top: y - 70,
        width: size as any,
        height: size as any,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "rgba(255,215,130,0.9)",
        opacity: op as any,
        shadowColor: "#ffd782",
        shadowOpacity: 0.8,
        shadowRadius: 10,
      }}
    />
  );
}

/* ======== Helper de Audio ======== */
function speak(text: string) {
  try {
    Vibration.vibrate(8);
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 1.0, pitch: 1.0 });
  } catch {}
}

/* ======== Fila de palabra con audio ======== */
function PlayRow({ romaji, hint, icon }: { romaji: string; hint?: string; icon?: string }) {
  return (
    <View style={styles.row}>
      {!!icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={{ flex: 1 }}>
        <Text style={styles.jp}>{romaji}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Pressable
        onPress={() => speak(romaji)}
        style={({ pressed }) => [styles.speakBtn, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="volume-high" size={18} color="#0b1221" />
      </Pressable>
    </View>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

/* ======== Quiz Genérico ======== */
type Q = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  tip?: string;
};

function QuizSection({ title, color, questions }: { title: string; color: string; questions: Q[] }) {
  const [selected, setSelected] = useState<(number | null)[]>(() => Array(questions.length).fill(null));
  const [score, setScore] = useState<number | null>(null);

  // 🔊 Hook de sonidos
  const { playCorrect, playWrong } = useFeedbackSounds();

  const choose = async (qi: number, ci: number) => {
    if (selected[qi] !== null) return;
    const next = [...selected];
    next[qi] = ci;
    setSelected(next);

    // reproducir sonido según acierto/error
    if (ci === questions[qi].answerIndex) {
      await playCorrect();
    } else {
      await playWrong();
    }
  };

  useEffect(() => {
    const done = selected.every((v) => v !== null);
    if (done) {
      let s = 0;
      selected.forEach((ci, i) => {
        if (ci === questions[i].answerIndex) s += 1;
      });
      setScore(s);
    }
  }, [selected, questions]);

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardTitle}>{title}</Text>

      {questions.map((q, qi) => {
        const sel = selected[qi];
        const correct = sel !== null && sel === q.answerIndex;
        return (
          <View key={qi} style={[styles.quizBlock, sel !== null && (correct ? styles.quizCorrect : styles.quizWrong)]}>
            <Text style={styles.quizPrompt}>Q{qi + 1}. {q.prompt}</Text>
            <View style={styles.choicesWrap}>
              {q.choices.map((c, ci) => {
                const chosen = sel === ci;
                return (
                  <Pressable
                    key={ci}
                    onPress={() => choose(qi, ci)}
                    style={({ pressed }) => [
                      styles.choiceBtn,
                      chosen && {
                        borderColor: ci === q.answerIndex ? "#16a34a" : "#b91c1c",
                        backgroundColor: ci === q.answerIndex ? "rgba(22,163,74,0.12)" : "rgba(185,28,28,0.08)",
                      },
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text style={styles.choiceTxt}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
            {sel !== null && (
              <Text style={styles.tipTxt}>
                {sel === q.answerIndex ? "✓ Correcto." : "✗ Incorrecto."} {q.tip ?? ""}
              </Text>
            )}
          </View>
        );
      })}

      {score !== null && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreTxt}>Resultado: {score} / {questions.length}</Text>
        </View>
      )}
    </View>
  );
}

/* ======== Datos ======== */
const presentacion = [
  { romaji: "Hajimemashite.", hint: "Mucho gusto (al iniciar una presentación)", icon: "😊" },
  { romaji: "Watashi wa Leslie desu.", hint: "Yo soy Leslie.", icon: "🙋‍♀️" },
  { romaji: "Watashi no namae wa Leslie desu.", hint: "Mi nombre es Leslie.", icon: "🪪" },
  { romaji: "Yoroshiku onegaishimasu.", hint: "Cuento contigo / Encantado de conocerte.", icon: "🤝" },
];

const explicacion = [
  { romaji: "wa: marca el tema. Indica de qué se habla." },
  { romaji: "desu: 'ser/estar' neutro y cortés. No cambia por persona/tiempo básico." },
  { romaji: "no: 'de' (posesión/relación). Ej: watashi no namae = mi nombre." },
  { romaji: "ka: pregunta. Se coloca al final. Ej: Anata wa sensei desu ka?" },
  { romaji: "ni sundeimasu: vivir en. Ej: Watashi wa Mexico ni sundeimasu." },
];

/* NUEVO: Uchi / Kazoku / Soto */
const uchiKazokuSotoExplain = [
  { romaji: "kazoku: familia (palabra general).", icon: "👨‍👩‍👧‍👦" },
  { romaji: "uchi: 'mi lado / casa / grupo interno'. Se usa para hablar de tu propia familia en términos modestos.", icon: "🏠" },
  { romaji: "soto: 'afuera / grupo externo'. Se usa para la familia de otra persona (formas respetuosas).", icon: "🏯" },
  { romaji: "Ejemplo: chichi = 'mi papá' (uchi). otousan = 'papá de otra persona' (soto).", icon: "🔁" },
];

const familiaPropia = [
  { romaji: "chichi", hint: "mi papá", icon: "👨" },
  { romaji: "haha", hint: "mi mamá", icon: "👩" },
  { romaji: "ani", hint: "mi hermano mayor", icon: "👱‍♂️" },
  { romaji: "ane", hint: "mi hermana mayor", icon: "👱‍♀️" },
  { romaji: "otouto", hint: "mi hermano menor", icon: "🧒" },
  { romaji: "imouto", hint: "mi hermana menor", icon: "👧" },
];

const familiaOtra = [
  { romaji: "otousan", hint: "papá (de otra persona)", icon: "👨‍🦳" },
  { romaji: "okaasan", hint: "mamá (de otra persona)", icon: "👩‍🦳" },
  { romaji: "oniisan", hint: "hermano mayor (de otra persona)", icon: "👦" },
  { romaji: "oneesan", hint: "hermana mayor (de otra persona)", icon: "👧" },
];

/* ======== Quizzes (4 actividades x 5 preguntas) ======== */
// 1) Partículas básicas
const quiz1: Q[] = [
  { prompt: "¿Qué partícula marca el tema?", choices: ["wa", "no", "ka", "ni"], answerIndex: 0, tip: "wa presenta el tema (de qué se habla)." },
  { prompt: "¿Cuál se usa para 'de' (posesión)?", choices: ["ka", "no", "wa", "desu"], answerIndex: 1, tip: "no = 'de' (posesión/relación)." },
  { prompt: "¿Cuál convierte una oración en pregunta?", choices: ["desu", "wa", "ni", "ka"], answerIndex: 3, tip: "ka al final = pregunta." },
  { prompt: "Completa: Watashi ___ sensei desu.", choices: ["no", "ka", "wa", "ni"], answerIndex: 2, tip: "wa marca el tema: watashi wa..." },
  { prompt: "¿Qué palabra cierra la frase con cortesía básica?", choices: ["desu", "wa", "no", "ka"], answerIndex: 0, tip: "desu da cierre cortés." },
];

// 2) Presentación
const quiz2: Q[] = [
  { prompt: "Mucho gusto (inicio) se dice:", choices: ["Ogenki desu ka", "Hajimemashite", "Konbanwa", "Itadakimasu"], answerIndex: 1, tip: "Hajimemashite abre la presentación." },
  { prompt: "Yo soy Leslie:", choices: ["Watashi wa Leslie desu", "Leslie wa watashi desu", "Watashi no Leslie desu", "Leslie desu ka"], answerIndex: 0, tip: "Sujeto/tema + wa + nombre + desu." },
  { prompt: "Mi nombre es X:", choices: ["Watashi wa namae X desu", "Watashi no namae wa X desu", "Watashi wa X no namae desu", "Namae wa watashi desu"], answerIndex: 1, tip: "no = 'de': watashi no namae = mi nombre." },
  { prompt: "Cuento contigo / encantado:", choices: ["Yoroshiku onegaishimasu", "Arigatou", "Sumimasen", "Gomen nasai"], answerIndex: 0, tip: "Frase social de cierre tras presentarte." },
  { prompt: "¿Eres maestro?:", choices: ["Anata wa sensei desu", "Anata no sensei desu ka", "Anata wa sensei desu ka", "Anata ka sensei desu"], answerIndex: 2, tip: "Pregunta = ka al final." },
];

// 3) Uchi / soto / familia
const quiz3: Q[] = [
  { prompt: "chichi se usa para:", choices: ["mi papá (uchi)", "papá de otra persona (soto)", "hermano mayor", "mamá"], answerIndex: 0, tip: "chichi = 'mi papá' (modesto, uchi)." },
  { prompt: "otousan se usa para:", choices: ["mi papá (uchi)", "papá de otra persona (soto)", "mi mamá", "mi hermano menor"], answerIndex: 1, tip: "otousan = papá respetuoso (soto)." },
  { prompt: "okaasan significa:", choices: ["mi mamá (modesto)", "mamá de otra persona (respetuoso)", "mi hermana menor", "mi hermano mayor"], answerIndex: 1, tip: "okaasan = mamá de otra persona." },
  { prompt: "ani y oniisan son:", choices: ["mi hermano mayor / hermano mayor (soto)", "mis hermanas", "tíos", "abuelos"], answerIndex: 0, tip: "ani (mi). oniisan (de otra fam./trato respetuoso)." },
  { prompt: "kazoku significa:", choices: ["hijo", "hermano", "familia", "casa"], answerIndex: 2, tip: "kazoku = familia." },
];

// 4) ni sundeimasu (vivir en)
const quiz4: Q[] = [
  { prompt: "Vivo en México:", choices: ["Watashi wa Mexico ni sundeimasu", "Watashi wa Mexico de sundeimasu", "Watashi wa Mexico wa sundeimasu", "Watashi no Mexico ni sundeimasu"], answerIndex: 0, tip: "Lugar + ni + sundeimasu." },
  { prompt: "Mi familia vive en Osaka:", choices: ["Kazoku wa Osaka ni sundeimasu", "Kazoku no Osaka ni sundeimasu", "Kazoku wa Osaka ka sundeimasu", "Kazoku wa Osaka de sundeimasu"], answerIndex: 0, tip: "Tema (kazoku) + wa + lugar + ni + sundeimasu." },
  { prompt: "La mamá de Tanaka vive en Nagoya:", choices: ["Tanaka-san no okaasan wa Nagoya ni sundeimasu", "Tanaka-san wa okaasan no Nagoya ni sundeimasu", "Tanaka-san no okaasan no Nagoya wa sundeimasu", "Tanaka-san no okaasan wa Nagoya ka"], answerIndex: 0, tip: "no = 'de': X no Y (Y de X)." },
  { prompt: "¿Dónde vives? (en romaji):", choices: ["Doko ni sundeimasu ka", "Doko wa sundeimasu ka", "Doko de sundeimasu ka", "Doko no sundeimasu ka"], answerIndex: 0, tip: "Pregunta de lugar: doko + ni + sundeimasu + ka." },
  { prompt: "Yo soy Leslie y vivo en Puebla:", choices: ["Watashi wa Leslie desu. Puebla ni sundeimasu.", "Watashi Leslie desu ka. Puebla wa sundeimasu.", "Watashi wa Leslie ka. Puebla ni sundeimasu ka.", "Watashi no Leslie desu. Puebla no sundeimasu."], answerIndex: 0, tip: "Frases simples: A wa B desu. Lugar ni sundeimasu." },
];

/* ======== Pantalla ======== */
export default function TemaGramaticaFamiliaScreen({}: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0b1221" }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#0f1a3a",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            transform: [{ translateY: H * 0.25 }],
          },
        ]}
      />
      {/* Linternas y Fuegos */}
      <Lantern x={30} y={40} />
      <Lantern x={110} y={58} />
      <Lantern x={W - 90} y={50} size={32} />
      <FireworkBurst x={W * 0.2} y={H * 0.18} delay={200} />
      <FireworkBurst x={W * 0.55} y={H * 0.15} delay={800} />
      <FireworkBurst x={W * 0.85} y={H * 0.2} delay={1200} />

      <ScrollView contentContainerStyle={styles.c} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>Curso N5 — Introducción al japonés</Text>
          <Text style={styles.h}>Tema: Familia y Presentación</Text>
          <Text style={styles.sub}>
            Aprende a presentarte, usar “wa”, “no”, “ka”, y “ni sundeimasu”. Todo en romaji.
          </Text>
        </View>

        {/* Presentación */}
        <Section title="① Cómo presentarte" color="rgba(255,255,255,0.96)">
          <Text style={styles.explain}>Primero 'mucho gusto', luego 'yo soy...', después 'cuento contigo'.</Text>
          {presentacion.map((p, i) => <PlayRow key={i} {...p} />)}
        </Section>

        {/* Partículas + verbo */}
        <Section title="② Partículas básicas y 'desu'" color="rgba(255,245,200,0.96)">
          {explicacion.map((e, i) => (
            <Text key={i} style={styles.exp}>• {e.romaji}</Text>
          ))}
        </Section>

        {/* NUEVO: Uchi / Kazoku / Soto */}
        <Section title="③ Uchi / Kazoku / Soto (conceptos clave)" color="rgba(210,235,255,0.96)">
          {uchiKazokuSotoExplain.map((p, i) => (
            <PlayRow key={i} romaji={p.romaji} icon={p.icon} />
          ))}
          <Text style={styles.explain}>
            Regla práctica: para tu familia usa términos modestos (uchi), para la familia de otra persona usa términos respetuosos (soto).
          </Text>
        </Section>

        {/* Vocabulario familia (propia y otra) */}
        <Section title="④ Mi familia (uchi no kazoku)" color="rgba(220,255,220,0.96)">
          {familiaPropia.map((f, i) => <PlayRow key={i} {...f} />)}
        </Section>

        <Section title="⑤ La familia de otra persona (soto no kazoku)" color="rgba(200,225,255,0.96)">
          {familiaOtra.map((f, i) => <PlayRow key={i} {...f} />)}
        </Section>

        {/* Ejemplos 'ni sundeimasu' */}
        <Section title="⑥ Ejemplos con 'ni sundeimasu' (vivir en…)" color="rgba(255,235,183,0.96)">
          <PlayRow romaji="Watashi wa Mexico ni sundeimasu." hint="Yo vivo en México." icon="🏠" />
          <PlayRow romaji="Kazoku wa Nagoya ni sundeimasu." hint="Mi familia vive en Nagoya." icon="🏡" />
          <PlayRow romaji="Tanaka-san no okaasan wa Osaka ni sundeimasu." hint="La mamá de Tanaka vive en Osaka." icon="👩‍🦳" />
        </Section>

        {/* ACTIVIDADES (4 x 5) */}
        <QuizSection title="⑦ Actividad 1: Partículas" color="rgba(255,255,255,0.96)" questions={quiz1} />
        <QuizSection title="⑧ Actividad 2: Presentación" color="rgba(255,245,210,0.96)" questions={quiz2} />
        <QuizSection title="⑨ Actividad 3: Uchi / Soto / Familia" color="rgba(220,255,240,0.96)" questions={quiz3} />
        <QuizSection title="⑩ Actividad 4: 'ni sundeimasu'" color="rgba(210,230,255,0.96)" questions={quiz4} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ======== Estilos ======== */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b1221" },
  c: { padding: 16, paddingTop: 96, gap: 12 },
  header: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  kicker: { color: "#0b1221", fontSize: 12, fontWeight: "800" },
  h: { color: "#0b1221", fontSize: 22, fontWeight: "900", marginTop: 2 },
  sub: { color: "#0b1221", opacity: 0.9, marginTop: 4 },

  card: { borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  cardTitle: { fontWeight: "900", color: "#0b1221", marginBottom: 8, fontSize: 16 },
  explain: { color: "#0b1221", marginBottom: 8, lineHeight: 22 },
  exp: { color: "#0b1221", marginBottom: 6, lineHeight: 20 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ebeff4",
    marginBottom: 8,
  },
  icon: { fontSize: 20, marginRight: 8 },
  jp: { color: "#0b1221", fontWeight: "900", fontSize: 16 },
  hint: { color: "#6b7280", fontSize: 12 },
  speakBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#ffd782",
    borderRadius: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#f6c86d",
  },

  /* Quiz */
  quizBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "rgba(255,255,255,0.98)",
    padding: 10,
    marginBottom: 10,
  },
  quizCorrect: { borderColor: "#16a34a" },
  quizWrong: { borderColor: "#b91c1c" },
  quizPrompt: { color: "#0b1221", fontWeight: "900", marginBottom: 8 },
  choicesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choiceBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  choiceTxt: { color: "#0b1221", fontWeight: "800" },
  tipTxt: { marginTop: 6, color: "#374151" },
  scoreBox: {
    marginTop: 8,
    backgroundColor: "rgba(11,18,33,0.06)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  scoreTxt: { color: "#0b1221", fontWeight: "900" },
});
