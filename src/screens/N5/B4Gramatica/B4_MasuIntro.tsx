import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Utilidades ========= */
function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.98 });
}
function speakBoth(jp: string, es: string) {
  Speech.speak(`${jp} — ${es}`, { language: "ja-JP", rate: 0.98 });
}
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ========= Lista de 15 verbos (forma -ます) =========
 *  Todo en hiragana (N5), con significado y ejemplo simple.
 */
type VItem = { jp: string; es: string; ejemplo: string; trad: string };
const VERBOS: VItem[] = [
  { jp: "たべます", es: "comer",         ejemplo: "まいにち ごはん を たべます。", trad: "Como arroz todos los días." },
  { jp: "のみます", es: "beber",         ejemplo: "あさ みず を のみます。",         trad: "Por la mañana bebo agua." },
  { jp: "いきます", es: "ir",            ejemplo: "がっこう に いきます。",         trad: "Voy a la escuela." },
  { jp: "きます",   es: "venir",         ejemplo: "あした きます。",                 trad: "Mañana vengo." },
  { jp: "かえります", es: "volver",     ejemplo: "よる うち に かえります。",       trad: "Por la noche vuelvo a casa." },
  { jp: "みます",   es: "ver / mirar",    ejemplo: "えいが を みます。",             trad: "Veo una película." },
  { jp: "ききます", es: "escuchar",       ejemplo: "おんがく を ききます。",         trad: "Escucho música." },
  { jp: "よみます", es: "leer",           ejemplo: "ほん を よみます。",             trad: "Leo un libro." },
  { jp: "かきます", es: "escribir",       ejemplo: "てがみ を かきます。",           trad: "Escribo una carta." },
  { jp: "はなします", es: "hablar",      ejemplo: "ともだち と はなします。",       trad: "Hablo con un amigo." },
  { jp: "べんきょうします", es: "estudiar", ejemplo: "にほんご を べんきょうします。", trad: "Estudio japonés." },
  { jp: "ねます",   es: "dormir",         ejemplo: "はやく ねます。",                 trad: "Duermo temprano." },
  { jp: "おきます", es: "levantarse",     ejemplo: "あさ ６じ に おきます。",        trad: "Me levanto a las 6." },
  { jp: "あいます", es: "encontrarse",    ejemplo: "ともだち に あいます。",         trad: "Me encuentro con un amigo." },
  { jp: "かいます", es: "comprar",        ejemplo: "パン を かいます。",             trad: "Compro pan." },
];

/** ========= Tipos para quizzes ========= */
type TipoChoice = { key: "ok" | "ko"; label: string };
type MasuChoice = { key: "masu" | "masen"; jp: "ます" | "ません"; es: string };

/** ========= Pantalla principal ========= */
export default function B4_MasuIntro() {
  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="book-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>どうし（verbo）- ます形 — Presente / Habitual</Text>
          <Text style={s.subtitle}>Forma cortés para acciones que haces “en general” o “ahora”.</Text>
        </View>
      </View>

      {/* Definición fácil */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📘 Explicación como en primaria</Text>
        <Text style={s.p}>
          En japonés, la forma <Text style={s.bold}>−ます</Text> es la manera <Text style={s.bold}>cortés</Text> de decir un verbo
          en <Text style={s.bold}>presente</Text> o <Text style={s.bold}>hábito</Text>.
        </Text>
        <Text style={s.p}>Sirve para: cosas que haces siempre, a veces, o que harás pronto.</Text>
        <Text style={s.p}>Ejemplos: <Text style={s.kbd}>たべます</Text> (como), <Text style={s.kbd}>よみます</Text> (leo).</Text>
      </View>

      {/* Diferencias importantes */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🔎 Diferencias básicas</Text>
        <Text style={s.p}>• Afirmativo: <Text style={s.kbd}>〜ます</Text> → <Text style={s.ital}>“hago”</Text>.</Text>
        <Text style={s.p}>• Negativo: <Text style={s.kbd}>〜ません</Text> → <Text style={s.ital}>“no hago”</Text>.</Text>
        <Text style={s.p}>• Pregunta: <Text style={s.kbd}>〜ますか？</Text> → <Text style={s.ital}>“¿haces?”</Text>.</Text>
        <Text style={s.p}>• Respuestas: <Text style={s.kbd}>はい、します</Text> / <Text style={s.kbd}>いいえ、しません</Text>.</Text>
      </View>

      {/* Lista de 15 verbos en tarjetas con audio */}
      <Text style={s.sectionTitle}>🧩 15 verbos útiles (ます)</Text>
      {VERBOS.map((v, idx) => (
        <View key={idx} style={s.vcard}>
          <Text style={s.vjp}>{v.jp}</Text>
          <Pressable onPress={() => speakBoth(v.jp, v.es)} style={btn.audio}>
            <Ionicons name="volume-high-outline" size={18} color="#fff" />
            <Text style={btn.audioTxt}>Escuchar: {v.jp} — {v.es}</Text>
          </Pressable>
          <Text style={s.mean}>📖 {v.es}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Text style={s.exJa}>📝 {v.ejemplo}</Text>
            <Pressable onPress={() => speakJA(v.ejemplo)} style={btn.icon}>
              <Ionicons name="volume-high-outline" size={16} color={ACCENT} />
            </Pressable>
          </View>
          <Text style={s.exEs}>💬 {v.trad}</Text>
        </View>
      ))}

      {/* Quizzes */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🎯 Quiz 1 — ¿Qué significa este verbo?</Text>
        <QuizSignificado />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>🧠 Quiz 2 — Completa con ます o ません</Text>
        <QuizMasuMasen />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/** ========= Quiz 1: Significado del verbo ========= */
function QuizSignificado() {
  const { playCorrect, playWrong } = useFeedbackSounds();

  const all = useMemo(() => shuffle(VERBOS).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = all[i];

  // 2 distractores
  const opciones = useMemo(() => {
    const otros = shuffle(VERBOS.filter(v => v.jp !== current.jp)).slice(0, 2).map(v => v.es);
    return shuffle([current.es, ...otros]);
  }, [current]);

  const onPick = (opt: string) => {
    if (picked) return;
    setPicked(opt);

    const ok = opt === current.es;
    if (ok) {
      setScore(s => s + 1);
      playCorrect().catch(() => {});
      Vibration.vibrate(12);
    } else {
      playWrong().catch(() => {});
      Vibration.vibrate([0, 40, 50, 40]);
    }
  };

  const next = () => {
    if (!picked) return;
    if (i + 1 >= all.length) {
      setI(0); setPicked(null); setScore(0); return;
    }
    setI(v => v + 1); setPicked(null);
  };

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <Text style={s.qBig}>{current.jp}</Text>
        <Pressable onPress={() => speakJA(current.jp)} style={btn.icon}>
          <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
        </Pressable>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {opciones.map((opt, idx) => {
          const chosen = picked != null;
          const isPicked = picked === opt;
          const isRight = chosen && opt === current.es;
          const bg = !chosen ? ACCENT : isRight ? "#16A34A" : isPicked ? "#DC2626" : "#6B7280";
          return (
            <Pressable key={`${opt}-${idx}`} onPress={() => onPick(opt)} disabled={chosen} style={[s.qbtn, { backgroundColor: bg }]}>
              <Text style={s.qbtnEs}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {picked && (
        <View style={[s.explainBox, { borderColor: picked === current.es ? "#16A34A" : "#DC2626" }]}>
          <Text style={s.p}><Text style={s.bold}>Correcto:</Text> {current.jp} = “{current.es}”</Text>
          <Text style={[s.p, { marginTop: 4 }]}>Ej.: {current.ejemplo}  →  {current.trad}</Text>
        </View>
      )}

      <Pressable onPress={next} disabled={!picked} style={[s.primaryBtn, { marginTop: 12, opacity: !picked ? 0.5 : 1 }]}>
        <Text style={s.primaryBtnText}>{i + 1 >= all.length ? "Reiniciar" : "Siguiente"}</Text>
      </Pressable>

      <Text style={[s.meta, { marginTop: 8 }]}>Aciertos: {score}/{all.length}</Text>
    </View>
  );
}

/** ========= Quiz 2: Completa con ます / ません ========= */
const MASU_CHOICES: MasuChoice[] = [
  { key: "masu", jp: "ます", es: "afirmativo" },
  { key: "masen", jp: "ません", es: "negativo" },
];

type FillItem = {
  ja: string;     // con hueco “__” o “( )”
  es: string;     // traducción simple
  answer: "masu" | "masen";
  speak?: string; // para pronunciar sin paréntesis
};

const BANK_MASU: FillItem[] = [
  { ja: "まいにち みず を のみ__", es: "Bebo agua todos los días.", answer: "masu", speak: "まいにち みず を のみます" },
  { ja: "きょう は べんきょう し__", es: "Hoy no estudio.", answer: "masen", speak: "きょう は べんきょう しません" },
  { ja: "あした がっこう に いき__", es: "Mañana voy a la escuela.", answer: "masu", speak: "あした がっこう に いきます" },
  { ja: "よる おそく ね__", es: "Duermo tarde por la noche.", answer: "masu", speak: "よる おそく ねます" },
  { ja: "まいにち テレビ を み__", es: "No veo televisión todos los días.", answer: "masen", speak: "まいにち テレビ を みません" },
  { ja: "よく おんがく を きき__", es: "A menudo escucho música.", answer: "masu", speak: "よく おんがく を ききます" },
  { ja: "ほん を よみ__", es: "No leo libros.", answer: "masen", speak: "ほん を よみません" },
  { ja: "ともだち と はなし__", es: "Hablo con amigos.", answer: "masu", speak: "ともだち と はなします" },
  { ja: "きのう パン を かい__", es: "Ayer no compré pan. (presente negativo para hábito)", answer: "masen", speak: "きのう パン を かいません" },
  { ja: "あした ともだち に あい__", es: "Mañana me encuentro con un amigo.", answer: "masu", speak: "あした ともだち に あいます" },
  { ja: "よく えいが を み__", es: "Veo películas a menudo.", answer: "masu", speak: "よく えいが を みます" },
  { ja: "コーヒー を のみ__", es: "No bebo café.", answer: "masen", speak: "コーヒー を のみません" },
];

function QuizMasuMasen() {
  const { playCorrect, playWrong } = useFeedbackSounds();

  const all = useMemo(() => shuffle(BANK_MASU).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"masu" | "masen" | null>(null);
  const [score, setScore] = useState(0);

  const current = all[i];

  const onPick = (k: "masu" | "masen") => {
    if (picked) return;
    setPicked(k);
    const ok = k === current.answer;
    if (ok) { setScore(s => s + 1); playCorrect().catch(() => {}); Vibration.vibrate(12); }
    else { playWrong().catch(() => {}); Vibration.vibrate([0, 40, 50, 40]); }
  };

  const next = () => {
    if (!picked) return;
    if (i + 1 >= all.length) { setI(0); setPicked(null); setScore(0); return; }
    setI(v => v + 1); setPicked(null);
  };

  const speakLine = () => speakJA(current.speak ?? current.ja.replace("__", current.answer === "masu" ? "ます" : "ません"));

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={s.qBig}>{current.ja.replace("__", "＿＿")}</Text>
        <Pressable onPress={speakLine} style={btn.icon}>
          <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
        </Pressable>
      </View>
      <Text style={[s.p, { marginTop: 4 }]}>{current.es}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        {MASU_CHOICES.map(c => {
          const chosen = picked != null;
          const isPicked = picked === c.key;
          const isRight = chosen && c.key === current.answer;
          const bg = !chosen ? ACCENT : isRight ? "#16A34A" : isPicked ? "#DC2626" : "#6B7280";
          return (
            <Pressable
              key={c.key}
              onPress={() => onPick(c.key)}
              disabled={chosen}
              style={[s.qbtn, { backgroundColor: bg, flex: 1 }]}
            >
              <Text style={s.qbtnJp}>{c.jp}</Text>
              <Text style={s.qbtnEs}>{c.es}</Text>
            </Pressable>
          );
        })}
      </View>

      {picked && (
        <View style={[s.explainBox, { borderColor: picked === current.answer ? "#16A34A" : "#DC2626" }]}>
          <Text style={s.p}>
            <Text style={s.bold}>Respuesta correcta: </Text>
            {current.answer === "masu" ? "ます (afirmativo)" : "ません (negativo)"}
          </Text>
        </View>
      )}

      <Pressable onPress={next} disabled={!picked} style={[s.primaryBtn, { marginTop: 12, opacity: !picked ? 0.5 : 1 }]}>
        <Text style={s.primaryBtnText}>{i + 1 >= all.length ? "Reiniciar" : "Siguiente"}</Text>
      </Pressable>

      <Text style={[s.meta, { marginTop: 8 }]}>Aciertos: {score}/{all.length}</Text>
    </View>
  );
}

/** ========= Estilos ========= */
const BG = "#F5F3FF";      // violeta claro
const ACCENT = "#7C3AED";  // violeta fuerte

const s = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: BG },
  header: {
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#EDE9FE", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#DDD6FE",
  },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#5B21B6", lineHeight: 20 },

  card: {
    backgroundColor: "#fff", padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: "#DDD6FE", gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#5B21B6" },

  p: { color: "#1F2937", lineHeight: 22 },
  bold: { fontWeight: "900", color: "#5B21B6" },
  ital: { fontStyle: "italic" },
  kbd: { fontWeight: "900", color: ACCENT, backgroundColor: "#F3E8FF", paddingHorizontal: 6, borderRadius: 6 },

  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#5B21B6", marginTop: 8 },

  vcard: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E9D5FF",
    padding: 14, marginTop: 10,
  },
  vjp: { fontSize: 22, fontWeight: "900", color: "#5B21B6", textAlign: "center" },
  mean: { marginTop: 6, color: "#374151", fontWeight: "700" },
  exJa: { color: "#5B21B6", fontWeight: "800" },
  exEs: { color: "#374151", marginTop: 2, fontStyle: "italic" },

  qBig: { fontSize: 20, fontWeight: "900", color: "#5B21B6" },
  meta: { fontSize: 12, color: "#5B21B6", fontWeight: "800" },

  qbtn: { borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 12 },

  explainBox: { marginTop: 10, borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: "#FAF5FF" },

  primaryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

const btn = StyleSheet.create({
  icon: {
    padding: 6, borderRadius: 999, backgroundColor: "#F3E8FF",
    borderWidth: 1, borderColor: "#E9D5FF",
  },
  audio: {
    marginTop: 8, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999,
  },
  audioTxt: { color: "#fff", fontWeight: "900" },
});
