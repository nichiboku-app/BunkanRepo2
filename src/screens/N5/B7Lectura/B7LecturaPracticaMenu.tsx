// src/screens/N5/B7Lectura/B7LecturaPracticaMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ========== 🔊 TTS helper ========== */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    });
  } catch {}
}

/* ========= 🎌 Fondo bonito: Montañas + linternas + luciérnagas (sin imágenes) ========= */
function Mountain({ left, size, color }: { left: number; size: number; color: string }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: -4,
        left,
        width: 0,
        height: 0,
        borderLeftWidth: size,
        borderRightWidth: size,
        borderBottomWidth: Math.round(size * 0.9),
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: color,
        opacity: 0.95,
      }}
    />
  );
}

function KyoZenBG() {
  const driftFar = useRef(new Animated.Value(0)).current;
  const driftNear = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const flicker = Array.from({ length: 10 }, () => useRef(new Animated.Value(Math.random())).current);

  useEffect(() => {
    const loop = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );

    const L1 = loop(driftFar, 8000);
    const L2 = loop(driftNear, 6000);
    const L3 = loop(float, 5200);
    const L4 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const Lf = flicker.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(300 * i),
          Animated.timing(v, { toValue: 1, duration: 1600 + i * 80, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.2, duration: 1400 + i * 60, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      )
    );

    L1.start(); L2.start(); L3.start(); L4.start(); Lf.forEach((l) => l.start());
    return () => { L1.stop(); L2.stop(); L3.stop(); L4.stop(); Lf.forEach((l) => l.stop()); };
  }, [driftFar, driftNear, float, pulse, flicker]);

  const auraScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.06] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const floatX = float.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const farX = driftFar.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
  const nearX = driftNear.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#1d2130" }]}>
      {/* Auras suaves (simulan degradados) */}
      <Animated.View
        style={{
          position: "absolute",
          width: 360, height: 360, left: -80, top: -60, borderRadius: 180,
          backgroundColor: "rgba(255,215,170,0.10)",
          transform: [{ scale: auraScale }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 420, height: 420, right: -120, bottom: -120, borderRadius: 210,
          backgroundColor: "rgba(255,240,210,0.08)",
          transform: [{ scale: auraScale }],
        }}
      />

      {/* Montañas capa lejana (parallax) */}
      <Animated.View style={{ transform: [{ translateX: farX }] }}>
        <Mountain left={-20} size={180} color="#2a3042" />
        <Mountain left={120} size={160} color="#2a3042" />
        <Mountain left={260} size={140} color="#2a3042" />
      </Animated.View>

      {/* Montañas capa cercana (parallax opuesto) */}
      <Animated.View style={{ transform: [{ translateX: nearX }] }}>
        <Mountain left={-40} size={220} color="#3c4460" />
        <Mountain left={80} size={200} color="#3c4460" />
        <Mountain left={240} size={210} color="#3c4460" />
      </Animated.View>

      {/* Niebla suave */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, backgroundColor: "rgba(255,255,255,0.03)" }} />

      {/* Camino de linternas */}
      <View style={{ position: "absolute", bottom: 18, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Animated.Text
            key={i}
            style={{
              fontSize: 22,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
              transform: [{ translateY: i % 2 ? 0 : -2 }],
            }}
          >
            🏮
          </Animated.Text>
        ))}
      </View>

      {/* Torii y flor flotando */}
      <Animated.Text
        style={{
          position: "absolute", fontSize: 66, left: 16, top: 24, opacity: 0.95,
          transform: [{ translateX: floatX }, { translateY: floatY }, { rotate: "2deg" }],
        }}
      >
        ⛩️
      </Animated.Text>
      <Animated.Text
        style={{
          position: "absolute", fontSize: 34, left: 26, top: 104,
          transform: [{ translateX: floatX }, { translateY: floatY }],
          opacity: 0.9,
        }}
      >
        🪷
      </Animated.Text>

      {/* Luciérnagas ✨ */}
      {flicker.map((v, i) => (
        <Animated.Text
          key={i}
          style={{
            position: "absolute",
            left: 20 + (i * 32) % 280,
            top: 180 + ((i * 37) % 120),
            fontSize: 14,
            opacity: v,
          }}
        >
          ✨
        </Animated.Text>
      ))}
    </View>
  );
}

/* ========== Datos (10 kanji) ========== */
type KItem = { k: string; yomi: string; es: string };
const TEN_KANJI: KItem[] = [
  { k: "人", yomi: "ひと", es: "persona" },
  { k: "日", yomi: "ひ", es: "día/sol" },
  { k: "月", yomi: "つき", es: "luna/mes" },
  { k: "火", yomi: "ひ", es: "fuego" },
  { k: "水", yomi: "みず", es: "agua" },
  { k: "木", yomi: "き", es: "árbol/madera" },
  { k: "金", yomi: "きん", es: "oro/dinero" },
  { k: "土", yomi: "つち", es: "tierra/suelo" },
  { k: "山", yomi: "やま", es: "montaña" },
  { k: "店", yomi: "みせ", es: "tienda" },
];

function KanjiChip({ item }: { item: KItem }) {
  return (
    <View style={styles.kchip}>
      <Text style={styles.kbig}>{item.k}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.kyomi}>{item.yomi}</Text>
        <Text style={styles.kes}>{item.es}</Text>
      </View>
      <Pressable onPress={() => speakJP(item.yomi)} style={styles.speakChip} accessibilityLabel={`Escuchar ${item.k}`}>
        <Ionicons name="volume-high-outline" size={14} color="#3b2f2f" />
      </Pressable>
    </View>
  );
}

/* ========== Lecturas (10) con toggle de traducción ========== */
const LECTURAS: Array<{ title: string; jp: string; es: string }> = [
  { title: "① Presentación en el templo", jp: "あさ、ひと は 山 の てら に いきます。みち に 店 が あります。", es: "Por la mañana la gente va al templo en la montaña. En el camino hay una tienda." },
  { title: "② Compras simples", jp: "わたし は 店 で 水 と パン を かいます。金 は すこし です。", es: "Compro agua y pan en la tienda. Tengo poco dinero." },
  { title: "③ Días con gente", jp: "土 と 日 は ひと が おおい です。月 の よる は しずか です。", es: "Sábado y domingo hay mucha gente. La noche del lunes está tranquila." },
  { title: "④ Direcciones cortas", jp: "山 から まっすぐ いって、店 で みず。つぎ に えき へ いきます。", es: "Desde la montaña ve recto, compra agua en la tienda y luego ve a la estación." },
  { title: "⑤ Descanso bajo el árbol", jp: "木 の した に いす が あります。ひと は すわります。", es: "Hay una silla bajo el árbol. La gente se sienta." },
  { title: "⑥ Sol y luna", jp: "日 は あかるい です。月 の よる は しずか です。", es: "El sol es brillante. La noche de luna es tranquila." },
  { title: "⑦ Camino de tierra", jp: "土 の みち を あるいて、山 に のぼります。", es: "Caminamos por el sendero de tierra y subimos la montaña." },
  { title: "⑧ Fuego y agua", jp: "火 は あぶない です。水 で けします。", es: "El fuego es peligroso. Se apaga con agua." },
  { title: "⑨ Ahorro", jp: "金 は たいせつ です。店 で すこし だけ つかいます。", es: "El dinero es valioso. En la tienda uso solo un poco." },
  { title: "⑩ Visita al templo", jp: "山 の てら で おいのり します。ひと は しずか に ならびます。", es: "Rezamos en el templo de la montaña. La gente hace fila en silencio." },
];

function LecturaCard({ t, jp, es, showES }: { t: string; jp: string; es: string; showES: boolean }) {
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="book-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>{t}</Text>
        <Pressable onPress={() => speakJP(jp)} style={styles.speakChip}>
          <Ionicons name="play-outline" size={16} color="#3b2f2f" />
        </Pressable>
      </View>
      <Text style={styles.jp}>{jp}</Text>
      {showES && <Text style={styles.es}>— {es}</Text>}
    </View>
  );
}

/* ========== Dictados (20) ========== */
type Dict = { id: string; jp: string; hint: string };
const DICTADOS: Dict[] = [
  { id: "d1", jp: "ひと は 店 で 水 を かいます。", hint: "persona / tienda / agua / comprar" },
  { id: "d2", jp: "土 と 日 は ひと が おおい です。", hint: "fin de semana / mucha gente" },
  { id: "d3", jp: "月 の よる、山 は しずか です。", hint: "luna / noche / montaña" },
  { id: "d4", jp: "火 は あぶない です。", hint: "fuego" },
  { id: "d5", jp: "木 の した に いす が あります。", hint: "árbol / debajo / hay" },
  { id: "d6", jp: "金 は つかいません。げんきん です。", hint: "dinero / efectivo" },
  { id: "d7", jp: "店 の まえ に ひと が ならびます。", hint: "fila / frente a la tienda" },
  { id: "d8", jp: "山 から まっすぐ いきます。", hint: "dirección / recto" },
  { id: "d9", jp: "日 は あかるい です。", hint: "sol / brillante" },
  { id: "d10", jp: "水 を のんで やすみます。", hint: "beber agua / descansar" },
  { id: "d11", jp: "木 は おおきい です。", hint: "árbol grande" },
  { id: "d12", jp: "土 の みち は すこし きたない です。", hint: "sendero de tierra" },
  { id: "d13", jp: "月 と 日 を みます。", hint: "mirar la luna y el sol" },
  { id: "d14", jp: "店 で パン と みず。", hint: "compras rápidas" },
  { id: "d15", jp: "山 の うえ は かぜ が つよい です。", hint: "cima / viento fuerte" },
  { id: "d16", jp: "火 を みたら、すぐ 水。", hint: "si ves fuego, usa agua" },
  { id: "d17", jp: "金 は すくない です。", hint: "poco dinero" },
  { id: "d18", jp: "ひと は てら で しずか に します。", hint: "templo / silencio" },
  { id: "d19", jp: "山 の した に 店 が あります。", hint: "tienda al pie de la montaña" },
  { id: "d20", jp: "木 と 水 が すき です。", hint: "gustos" },
];

function DictadoItem({ d, onReveal }: { d: Dict; onReveal?: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="create-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>Dictado</Text>
      </View>
      <Text style={styles.hint}>Pista: {d.hint}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <Pressable onPress={() => speakJP(d.jp)} style={styles.btn}>
          <Text style={styles.btnTxt}>▶︎ Escuchar</Text>
        </Pressable>
        <Pressable
          onPress={() => { const nx = !show; setShow(nx); if (nx && onReveal) onReveal(); }}
          style={styles.btnGhost}
        >
          <Text style={styles.btnGhostTxt}>{show ? "Ocultar respuesta" : "Mostrar respuesta"}</Text>
        </Pressable>
      </View>
      {show && <Text style={[styles.jp, { marginTop: 6 }]}>{d.jp}</Text>}
    </View>
  );
}

/* ========== Hook universal (local) + Quiz (20) ========== */
type Q = { id: string; stemJP?: string; stemES?: string; opts: string[]; correct: number; speak?: string };
function useUniversalQuiz(questions: Q[]) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const total = questions.length;
  const finished = i >= total;
  const q = finished ? null : questions[i];
  function pick(k: number) { if (picked !== null || !q) return; setPicked(k); if (k === q.correct) setScore(s => s + 1); }
  function next() { if (!finished) { setI(n => n + 1); setPicked(null); } }
  function reset() { setI(0); setPicked(null); setScore(0); }
  return { q, i, total, picked, score, finished, pick, next, reset };
}

const QUIZ: Q[] = [
  { id: "q1",  stemES: "¿Cuál kanji es 'tienda'?", opts: ["山", "店", "木"], correct: 1, speak: "みせ" },
  { id: "q2",  stemES: "Elige la lectura de 山", opts: ["やま", "ひと", "つち"], correct: 0, speak: "やま" },
  { id: "q3",  stemJP: "火 は あぶない です。 ¿Qué significa?", opts: ["El fuego es peligroso", "El agua es barata", "El árbol es nuevo"], correct: 0 },
  { id: "q4",  stemES: "“agua” en kanji es…", opts: ["水", "木", "金"], correct: 0, speak: "みず" },
  { id: "q5",  stemJP: "土 と 日 は ひと が おおい です。", opts: ["Fin de semana hay mucha gente", "Lunes hay fuego", "La montaña es oro"], correct: 0 },
  { id: "q6",  stemES: "¿Cuál corresponde a 'dinero/oro'?", opts: ["金", "月", "店"], correct: 0, speak: "きん" },
  { id: "q7",  stemES: "¿Qué kanji representa 'árbol'?", opts: ["木", "水", "火"], correct: 0, speak: "き" },
  { id: "q8",  stemES: "Lectura de 店", opts: ["みず", "みせ", "やま"], correct: 1, speak: "みせ" },
  { id: "q9",  stemJP: "月 の よる は しずか です。", opts: ["Noche de luna tranquila", "Mañana con fuego", "Tarde con mucha gente"], correct: 0 },
  { id: "q10", stemES: "Selecciona 'persona'", opts: ["人", "日", "月"], correct: 0, speak: "ひと" },
  { id: "q11", stemES: "¿Qué kanji aparece en ‘fin de semana’ del texto?", opts: ["土・日", "火・水", "金・木"], correct: 0 },
  { id: "q12", stemES: "Lectura de 金", opts: ["きん", "やま", "つき"], correct: 0, speak: "きん" },
  { id: "q13", stemJP: "店 で 水 を かいます。", opts: ["Compra agua en la tienda", "Vende oro en la montaña", "Corre bajo el árbol"], correct: 0 },
  { id: "q14", stemES: "“sol/día” en kanji es…", opts: ["日", "人", "店"], correct: 0, speak: "ひ" },
  { id: "q15", stemES: "¿Cuál es 'tierra/suelo'?", opts: ["土", "山", "木"], correct: 0, speak: "つち" },
  { id: "q16", stemJP: "山 から まっすぐ いきます。", opts: ["Ir recto desde la montaña", "Girar a la derecha", "Llamar a la policía"], correct: 0 },
  { id: "q17", stemES: "Lectura de 水", opts: ["みず", "もく", "にち"], correct: 0, speak: "みず" },
  { id: "q18", stemES: "Kanji para 'luna/mes'", opts: ["月", "金", "人"], correct: 0, speak: "つき" },
  { id: "q19", stemJP: "金 は すくない です。", opts: ["Poco dinero", "Mucha gente", "Árbol grande"], correct: 0 },
  { id: "q20", stemES: "¿Cuál NO es de los 10 kanji?", opts: ["川", "山", "店"], correct: 0 },
];

function QuizBlock() {
  const { q, i, total, picked, score, finished, pick, next, reset } = useUniversalQuiz(QUIZ);
  const { playCorrect, playWrong, ready } = useFeedbackSounds();

  const onPick = (idx: number) => {
    if (picked !== null || !q) return;
    const isRight = idx === q.correct;
    if (ready) (isRight ? playCorrect() : playWrong());
    pick(idx);
  };

  if (finished) {
    return (
      <View style={s.box}>
        <View style={styles.cardHeader}>
          <Ionicons name="ribbon-outline" size={18} color="#3b2f2f" />
          <Text style={styles.cardTitle}>Resultados</Text>
        </View>
        <Text style={styles.es}>Puntuación: {score} / {total}</Text>
        <Pressable onPress={reset} style={[styles.btn, { marginTop: 6 }]}>
          <Text style={styles.btnTxt}>Repetir</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="school-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>Quiz — {i + 1}/{total}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {!!q?.stemJP && <Text style={styles.jp}>{q.stemJP}</Text>}
        {!!q?.stemES && <Text style={styles.es}>{q.stemES}</Text>}
        {!!q?.speak && (
          <Pressable onPress={() => speakJP(q.speak!)} style={styles.speakChip}>
            <Ionicons name="volume-high-outline" size={16} color="#3b2f2f" />
          </Pressable>
        )}
      </View>
      <View style={{ marginTop: 8, gap: 8 }}>
        {q?.opts.map((o, idx) => {
          const isPicked = picked === idx;
          const isRight = picked !== null && idx === q.correct;
          const isWrong = picked !== null && isPicked && idx !== q.correct;
          return (
            <Pressable
              key={idx}
              onPress={() => onPick(idx)}
              style={[
                styles.choice,
                isRight && styles.choiceRight,
                isWrong && styles.choiceWrong,
              ]}
            >
              <Text style={styles.choiceTxt}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 10, flexDirection: "row", gap: 10 }}>
        <Pressable onPress={next} disabled={picked === null} style={[styles.btn, picked === null && { opacity: 0.6 }]}>
          <Text style={styles.btnTxt}>Siguiente</Text>
        </Pressable>
        <Text style={[styles.es, { fontWeight: "800" }]}>Aciertos: {score}</Text>
      </View>
    </View>
  );
}

/* ========== Pantalla principal ========== */
export default function B7LecturaPracticaMenu() {
  const [showES, setShowES] = useState(true);
  const { playCorrect, ready } = useFeedbackSounds(); // sonido al revelar dictados

  useEffect(() => {
    return () => { void Speech.stop(); };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <KyoZenBG />
      <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
        <View style={s.header}>
          <Text style={s.kicker}>B7 — Lectura y práctica</Text>
          <Text style={s.h}>Templo/Zen • 10 kanji • actividades integradas</Text>
          <Text style={s.sub}>Usamos solo: 人・日・月・火・水・木・金・土・山・店</Text>

          <View style={{ marginTop: 8, flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => setShowES((v) => !v)}
              style={[styles.btn, { paddingVertical: 6, paddingHorizontal: 10 }]}
            >
              <Text style={styles.btnTxt}>{showES ? "Ocultar traducción" : "Mostrar traducción"}</Text>
            </Pressable>
          </View>
        </View>

        {/* 10 kanji */}
        <View style={s.box}>
          <Text style={s.b}>🏷️ Nuestros 10 kanji</Text>
          {TEN_KANJI.map((it) => <KanjiChip key={it.k} item={it} />)}
        </View>

        {/* Lecturas (10) */}
        {LECTURAS.map((L, i) => (
          <LecturaCard key={i} t={L.title} jp={L.jp} es={L.es} showES={showES} />
        ))}

        {/* Dictados (20) */}
        <View style={s.box}>
          <Text style={s.b}>✍️ Dictado (escucha y escribe) — 20 frases</Text>
          <Text style={styles.hint}>Todas las frases respetan los 10 kanji.</Text>
        </View>
        {DICTADOS.map((d) => (
          <DictadoItem key={d.id} d={d} onReveal={() => { if (ready) playCorrect(); }} />
        ))}

        {/* Quiz (20) */}
        <QuizBlock />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ========== Estilos ========== */
const WASHI = "rgba(255,255,255,0.92)";
const BORDER = "#e8dcc8";
const INK = "#3b2f2f";

const s = StyleSheet.create({
  c: { padding: 16, gap: 14 },
  header: { backgroundColor: WASHI, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 },
  kicker: { fontSize: 12, letterSpacing: 1, color: INK, opacity: 0.8, fontWeight: "700" },
  h: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  sub: { marginTop: 4, color: INK, opacity: 0.9 },
  box: {
    backgroundColor: "rgba(255,251,240,0.95)",
    borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  b: { fontWeight: "900", fontSize: 18, color: INK },
});

const styles = StyleSheet.create({
  /* BG emojis (tamaños) */
  bgHuge:   { position: "absolute", fontSize: 64, opacity: 0.9 },
  bgLantern:{ position: "absolute", fontSize: 42 },
  bgLotus:  { position: "absolute", fontSize: 36 },
  bgPetal:  { position: "absolute", fontSize: 30 },

  /* Chips Kanji */
  kchip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 10, marginBottom: 8,
  },
  kbig: { width: 46, textAlign: "center", fontSize: 30, fontWeight: "900", color: INK },
  kyomi: { fontWeight: "800", color: INK },
  kes: { color: INK, opacity: 0.9 },
  speakChip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* Textos */
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK },
  jp: { fontSize: 16, fontWeight: "800", color: INK },
  es: { color: INK },
  hint: { fontSize: 12, color: INK, opacity: 0.9 },

  /* Botones */
  btn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "rgba(255,255,255,0.96)",
  },
  btnTxt: { fontWeight: "800" },
  btnGhost: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", backgroundColor: "transparent",
  },
  btnGhostTxt: { fontWeight: "800", opacity: 0.8 },

  /* Quiz */
  choice: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "white",
  },
  choiceTxt: { fontWeight: "800", color: INK },
  choiceRight: { borderColor: "#5cb85c", backgroundColor: "rgba(92,184,92,0.10)" },
  choiceWrong: { borderColor: "#d9534f", backgroundColor: "rgba(217,83,79,0.10)" },
});
