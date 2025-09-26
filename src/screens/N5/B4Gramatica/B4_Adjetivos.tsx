import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import {
  Archive, BookOpen,
  Brain,
  Building,
  DollarSign,
  Frown,
  Heart,
  Lightbulb,
  Map,
  Maximize, Minimize,
  Settings,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Tag,
  Timer,
  Turtle,
  Users,
  Volume2,
  Wrench,
  Zap
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/** ========= Tipos ========= */
type Choice = { key: "i" | "na"; jp: "い" | "な"; es: string };
const CHOICES: Choice[] = [
  { key: "i", jp: "い", es: "い-けいようし (adjetivo i)" },
  { key: "na", jp: "な", es: "な-けいようし (adjetivo na)" },
];

/** ========= Utilidades ========= */
function speakJA(t: string) {
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

/** ========= Datos ========= */
const I_ADJETIVOS = [
  { jp: "あつい", es: "caliente", ejemplo: "きょう は あつい です。", trad: "Hoy hace calor.", Icon: Sun },
  { jp: "さむい", es: "frío", ejemplo: "きょう は さむい です。", trad: "Hoy hace frío.", Icon: Snowflake },
  { jp: "たかい", es: "caro / alto", ejemplo: "この ほん は たかい です。", trad: "Este libro es caro.", Icon: DollarSign },
  { jp: "やすい", es: "barato", ejemplo: "この りんご は やすい です。", trad: "Esta manzana es barata.", Icon: Tag },
  { jp: "おおきい", es: "grande", ejemplo: "いぬ は おおきい です。", trad: "El perro es grande.", Icon: Maximize },
  { jp: "ちいさい", es: "pequeño", ejemplo: "ねこ は ちいさい です。", trad: "El gato es pequeño.", Icon: Minimize },
  { jp: "はやい", es: "rápido", ejemplo: "かれ は はやい です。", trad: "Él es rápido.", Icon: Zap },
  { jp: "おそい", es: "lento", ejemplo: "バス は おそい です。", trad: "El autobús es lento.", Icon: Turtle },
  { jp: "あたらしい", es: "nuevo", ejemplo: "あたらしい くるま です。", trad: "Es un auto nuevo.", Icon: Sparkles },
  { jp: "ふるい", es: "viejo", ejemplo: "ふるい ほん です。", trad: "Es un libro viejo.", Icon: Archive },
  { jp: "おもしろい", es: "interesante", ejemplo: "この えいが は おもしろい です。", trad: "Esta película es interesante.", Icon: BookOpen },
  { jp: "つまらない", es: "aburrido", ejemplo: "この クラス は つまらない です。", trad: "Esta clase es aburrida.", Icon: Frown },
];

const NA_ADJETIVOS = [
  { jp: "しずか", es: "tranquilo", ejemplo: "しずか な まち です。", trad: "Es una ciudad tranquila.", Icon: Building },
  { jp: "にぎやか", es: "animado", ejemplo: "にぎやか な パーティー です。", trad: "Es una fiesta animada.", Icon: Users },
  { jp: "きれい", es: "bonito / limpio", ejemplo: "きれい な はな です。", trad: "Es una flor bonita.", Icon: Star },
  { jp: "ゆうめい", es: "famoso", ejemplo: "ゆうめい な ひと です。", trad: "Es una persona famosa.", Icon: Lightbulb },
  { jp: "げんき", es: "con energía", ejemplo: "かのじょ は げんき です。", trad: "Ella está llena de energía.", Icon: Heart },
  { jp: "しんせつ", es: "amable", ejemplo: "しんせつ な せんせい です。", trad: "Es un profesor amable.", Icon: Brain },
  { jp: "たいせつ", es: "importante", ejemplo: "たいせつ な しごと です。", trad: "Es un trabajo importante.", Icon: Lightbulb },
  { jp: "べんり", es: "práctico / útil", ejemplo: "この ツール は べんり です。", trad: "Esta herramienta es útil.", Icon: Settings },
  { jp: "ふべん", es: "poco práctico", ejemplo: "ふべん な ばしょ です。", trad: "Es un lugar poco práctico.", Icon: Map },
  { jp: "じょうず", es: "hábil", ejemplo: "かれ は じょうず です。", trad: "Él es hábil.", Icon: Wrench },
  { jp: "へた", es: "torpe", ejemplo: "かのじょ は へた です。", trad: "Ella es torpe.", Icon: Frown },
  { jp: "ひま", es: "libre", ejemplo: "ひま な ひと です。", trad: "Es una persona con tiempo libre.", Icon: Timer },
];

/** ========= Pantalla ========= */
export default function B4_Adjetivos() {
  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="color-wand-outline" size={28} color={ACCENT} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>いけいようし ／ なけいようし — Adjetivos</Text>
          <Text style={s.subtitle}>Aprende a describir personas, objetos y lugares 🧸</Text>
        </View>
      </View>

      {/* Explicación */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📘 Definición fácil</Text>
        <Text style={s.text}>En japonés hay <Text style={s.bold}>dos tipos</Text> de adjetivos:</Text>
        <Text style={s.text}>• <Text style={s.bold}>い-adjetivos</Text>: terminan en い y se usan directamente.</Text>
        <Text style={s.text}>• <Text style={s.bold}>な-adjetivos</Text>: no terminan en い y usan な antes del sustantivo.</Text>
      </View>

      {/* い-adjetivos */}
      <Text style={s.sectionTitle}>🌟 い-adjetivos</Text>
      {I_ADJETIVOS.map((item, idx) => (
        <View key={idx} style={s.adjCard}>
          <item.Icon size={50} color={ACCENT} style={{ alignSelf: "center", marginBottom: 6 }} />
          <Text style={s.adjJP}>{item.jp}</Text>
          <Pressable style={s.audioBtn} onPress={() => speakBoth(item.jp, item.es)}>
            <Volume2 size={20} color="#fff" />
            <Text style={s.audioTxt}>Escuchar pronunciación</Text>
          </Pressable>
          <Text style={s.meaning}>📖 Significado: {item.es}</Text>
          <Text style={s.example}>📝 Ej.: {item.ejemplo}</Text>
          <Text style={s.translation}>💬 {item.trad}</Text>
        </View>
      ))}

      {/* な-adjetivos */}
      <Text style={s.sectionTitle}>🌿 な-adjetivos</Text>
      {NA_ADJETIVOS.map((item, idx) => (
        <View key={idx} style={s.adjCard}>
          <item.Icon size={50} color={ACCENT} style={{ alignSelf: "center", marginBottom: 6 }} />
          <Text style={s.adjJP}>{item.jp}</Text>
          <Pressable style={s.audioBtn} onPress={() => speakBoth(item.jp, item.es)}>
            <Volume2 size={20} color="#fff" />
            <Text style={s.audioTxt}>Escuchar pronunciación</Text>
          </Pressable>
          <Text style={s.meaning}>📖 Significado: {item.es}</Text>
          <Text style={s.example}>📝 Ej.: {item.ejemplo}</Text>
          <Text style={s.translation}>💬 {item.trad}</Text>
        </View>
      ))}

      {/* Quizzes */}
      <QuizTipo />
      <QuizSignificado />
    </ScrollView>
  );
}

/** ========= QUIZ 1 — Tipo ========= */
/** ========= QUIZ 1 — Tipo (corregido) ========= */
function QuizTipo() {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const allItems = useMemo(() => shuffle([...I_ADJETIVOS, ...NA_ADJETIVOS]).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice["key"] | null>(null);
  const [score, setScore] = useState(0);

  const current = allItems[i];
  const tipo: Choice["key"] = I_ADJETIVOS.some(a => a.jp === current.jp) ? "i" : "na";

  const onPick = (k: Choice["key"]) => {
    if (picked) return; // ya respondido
    setPicked(k);

    const ok = k === tipo;
    if (ok) {
      setScore(s => s + 1);
      Vibration.vibrate(12);
      playCorrect().catch(() => {});
    } else {
      Vibration.vibrate([0, 40, 50, 40]);
      playWrong().catch(() => {});
    }
  };

  const next = () => {
    if (picked == null) return; // seguridad
    if (i + 1 >= allItems.length) {
      // Reiniciar al terminar
      setI(0);
      setScore(0);
      setPicked(null);
      return;
    }
    setI(v => v + 1);
    setPicked(null);
  };

  return (
    <View style={s.quiz}>
      <Text style={s.quizTitle}>🎯 Quiz 1 — ¿い o な?</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <Text style={s.bigLine}>{current.jp}</Text>
        <Pressable onPress={() => speakJA(current.jp)} style={{ padding: 6, borderRadius: 999, backgroundColor: "#FEF3C7" }}>
          <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12, justifyContent: "space-between" }}>
        {CHOICES.map(c => {
          const chosen = picked != null;
          const isPicked = picked === c.key;
          const isRight = chosen && c.key === tipo;
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
        <View style={[s.explainBox, { borderWidth: 1, borderColor: picked === tipo ? "#16A34A" : "#DC2626", marginTop: 10, borderRadius: 12, padding: 10, backgroundColor: "#FFFBEB" }]}>
          <Text style={{ color: "#1E293B" }}>
            <Text style={{ fontWeight: "900", color: "#92400E" }}>Por qué: </Text>
            {tipo === "i" ? "Termina en い → es un adjetivo い." : "No termina en い → es un adjetivo な."}
          </Text>
        </View>
      )}

      <Pressable
        onPress={next}
        disabled={picked == null}
        style={[
          s.qbtn,
          {
            marginTop: 12,
            backgroundColor: picked == null ? "#9CA3AF" : ACCENT,
            alignSelf: "stretch",
          },
        ]}
      >
        <Text style={s.qbtnEs}>{i + 1 >= allItems.length ? "Reiniciar" : "Siguiente"}</Text>
      </Pressable>

      <Text style={s.meta}>Aciertos: {score}/{allItems.length}</Text>
    </View>
  );
}


/** ========= QUIZ 2 — Significado ========= */
/** ========= QUIZ 2 — Significado (corregido) ========= */
function QuizSignificado() {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const pool = useMemo(() => [...I_ADJETIVOS, ...NA_ADJETIVOS], []);
  const allItems = useMemo(() => shuffle(pool).slice(0, 10), [pool]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = allItems[i];

  const options = useMemo(() => {
    const distractores = shuffle(pool.filter(a => a.jp !== current.jp))
      .slice(0, 2)
      .map(a => a.es);
    return shuffle([current.es, ...distractores]);
  }, [current, pool]);

  const onPick = (es: string) => {
    if (picked) return;
    setPicked(es);

    const ok = es === current.es;
    if (ok) {
      setScore(s => s + 1);
      Vibration.vibrate(12);
      playCorrect().catch(() => {});
    } else {
      Vibration.vibrate([0, 40, 50, 40]);
      playWrong().catch(() => {});
    }
  };

  const next = () => {
    if (picked == null) return;
    if (i + 1 >= allItems.length) {
      setI(0);
      setScore(0);
      setPicked(null);
      return;
    }
    setI(v => v + 1);
    setPicked(null);
  };

  return (
    <View style={s.quiz}>
      <Text style={s.quizTitle}>📖 Quiz 2 — Significado</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <Text style={s.bigLine}>{current.jp}</Text>
        <Pressable onPress={() => speakJA(current.jp)} style={{ padding: 6, borderRadius: 999, backgroundColor: "#FEF3C7" }}>
          <Ionicons name="volume-high-outline" size={18} color={ACCENT} />
        </Pressable>
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        {options.map((opt, idx) => {
          const chosen = picked != null;
          const isPicked = picked === opt;
          const isRight = chosen && opt === current.es;
          const bg = !chosen ? ACCENT : isRight ? "#16A34A" : isPicked ? "#DC2626" : "#6B7280";
          return (
            <Pressable
              key={`${opt}-${idx}`}
              onPress={() => onPick(opt)}
              disabled={chosen}
              style={[s.qbtn, { backgroundColor: bg }]}
            >
              <Text style={s.qbtnEs}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {picked && (
        <View style={[s.explainBox, { borderWidth: 1, borderColor: picked === current.es ? "#16A34A" : "#DC2626", marginTop: 10, borderRadius: 12, padding: 10, backgroundColor: "#FFFBEB" }]}>
          <Text style={{ color: "#1E293B" }}>
            <Text style={{ fontWeight: "900", color: "#92400E" }}>Correcto: </Text>
            {current.jp} = “{current.es}”
          </Text>
        </View>
      )}

      <Pressable
        onPress={next}
        disabled={picked == null}
        style={[
          s.qbtn,
          {
            marginTop: 12,
            backgroundColor: picked == null ? "#9CA3AF" : ACCENT,
            alignSelf: "stretch",
          },
        ]}
      >
        <Text style={s.qbtnEs}>{i + 1 >= allItems.length ? "Reiniciar" : "Siguiente"}</Text>
      </Pressable>

      <Text style={s.meta}>Aciertos: {score}/{allItems.length}</Text>
    </View>
  );
}


/** ========= ESTILOS ========= */
const BG = "#FEFCE8";
const ACCENT = "#B45309";

const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: BG },
  header: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#FDE68A", padding: 16, borderRadius: 16 },
  title: { fontSize: 22, fontWeight: "900", color: ACCENT },
  subtitle: { marginTop: 4, color: "#92400E", lineHeight: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginTop: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#92400E", marginBottom: 6 },
  text: { color: "#1E293B", lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: "900", marginTop: 24, marginBottom: 12, color: "#92400E" },
  adjCard: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#FCD34D" },
  adjJP: { fontSize: 24, fontWeight: "900", textAlign: "center", color: "#92400E", marginBottom: 8 },
  audioBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: ACCENT, borderRadius: 12, padding: 8, gap: 6, marginBottom: 8 },
  audioTxt: { color: "#fff", fontWeight: "900" },
  meaning: { fontSize: 16, color: "#374151", marginBottom: 4 },
  example: { fontSize: 15, color: "#374151" },
  translation: { fontSize: 15, color: "#4B5563", fontStyle: "italic", marginTop: 2 },
  quiz: { marginTop: 24, backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#FCD34D" },
  quizTitle: { fontSize: 18, fontWeight: "900", color: "#92400E", marginBottom: 10 },
  bigLine: { fontSize: 24, textAlign: "center", fontWeight: "900", color: "#92400E", marginBottom: 12 },
  btnRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  qbtn: { paddingVertical: 10, borderRadius: 12, alignItems: "center", marginTop: 8 },
  qbtnJp: { color: "#fff", fontSize: 20, fontWeight: "900" },
  qbtnEs: { color: "#fff", fontWeight: "800", fontSize: 16 },
  meta: { textAlign: "center", marginTop: 10, color: "#92400E", fontWeight: "700" }
});
