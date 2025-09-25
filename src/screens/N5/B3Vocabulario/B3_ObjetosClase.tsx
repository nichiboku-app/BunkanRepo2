// src/screens/N5/B3Vocabulario/B3_ObjetosClase.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

// ⬇️ Hook de sonido (tu archivo exacto)
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/** ===================== Navegación ===================== */
type Nav = NativeStackNavigationProp<RootStackParamList>;

/** ===================== Datos ===================== */
type Item = {
  key: string;
  kana: string; // sin kanji
  ro: string;
  es: string;
  emoji?: string;
};

const ITEMS: Item[] = [
  { key: "enpitsu", kana: "えんぴつ", ro: "enpitsu", es: "lápiz", emoji: "✏️" },
  { key: "keshigomu", kana: "けしごむ", ro: "keshigomu", es: "goma", emoji: "🧽" },
  { key: "hon", kana: "ほん", ro: "hon", es: "libro", emoji: "📗" },
  { key: "nooto", kana: "ノート", ro: "nōto", es: "cuaderno", emoji: "📓" },
  { key: "tsukue", kana: "つくえ", ro: "tsukue", es: "escritorio", emoji: "🧑‍💻" },
  { key: "isu", kana: "いす", ro: "isu", es: "silla", emoji: "🪑" },
  { key: "kaban", kana: "かばん", ro: "kaban", es: "mochila/bolso", emoji: "🎒" },
  { key: "jisho", kana: "じしょ", ro: "jisho", es: "diccionario", emoji: "📘" },
  { key: "chizu", kana: "ちず", ro: "chizu", es: "mapa", emoji: "🗺️" },
  { key: "kokuban", kana: "こくばん", ro: "kokuban", es: "pizarra", emoji: "🧑‍🏫" },
];

/** ===================== Utilidades ===================== */
function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.98 });
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ===================== Pantalla principal ===================== */
export default function B3_ObjetosClase() {
  const navigation = useNavigation<Nav>();

  // ✅ Hook de sonido (tu versión)
  const { playCorrect, playWrong } = useFeedbackSounds();

  // === Quiz simple: escucha y elige (se conserva) ===
  const rounds = 6;
  const deck = useMemo(() => shuffle(ITEMS).slice(0, rounds), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [okCount, setOkCount] = useState(0);

  const target = deck[i];
  const options = useMemo(() => {
    const others = shuffle(ITEMS.filter((x) => x.key !== target.key)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => speakJA(`${target.kana}。`);

  const onPick = async (k: string) => {
    if (picked) return;
    setPicked(k);
    const ok = k === target.key;

    if (ok) {
      setOkCount((s) => s + 1);
      Vibration.vibrate(25);
      await playCorrect();
    } else {
      Vibration.vibrate(15);
      await playWrong();
    }
  };

  const next = () => {
    if (i + 1 >= deck.length) {
      setI(0);
      setPicked(null);
      setOkCount(0);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />
      <ScrollView contentContainerStyle={s.c}>
        {/* ===== Header ===== */}
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>Objetos de clase — きょうしつ の もの</Text>
          <Text style={s.jpSub}>これ／それ／あれ + は + ○○ です ・ これはなんですか</Text>
          <View style={s.tagsRow}>
            <Tag label="カード" />
            <Tag label="メモリー" />
            <Tag label="ボイス" />
          </View>
        </View>

        {/* ===== Mini Guía ===== */}
        <MiniGuide />

        {/* ===== Diagrama deíctico ===== */}
        <DeixisDiagram />

        {/* ===== Vocabulario ===== */}
        <View style={s.card}>
          <Text style={s.h2}>Vocabulario (vista rápida)</Text>
          <Text style={[s.p, { marginTop: 6 }]}>
            Pulsa el altavoz para escuchar cada palabra.
          </Text>
          <View style={[s.grid, { marginTop: 10 }]}>
            {ITEMS.map((it) => (
              <View key={it.key} style={s.smallCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={s.emoji}>{it.emoji ?? "📦"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{it.es}</Text>
                    <Text style={s.cardJP}>{it.kana}</Text>
                  </View>
                  <Pressable onPress={() => speakJA(it.kana)} style={btn.iconBtn}>
                    <Ionicons name="volume-high-outline" size={16} color={CRIMSON} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== Juego de deícticos ===== */}
        <DeicticGame playCorrect={playCorrect} playWrong={playWrong} />

        {/* ===== Mini-quiz original ===== */}
        <View style={[s.card, { marginTop: 14 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.h2}>Mini-quiz: escucha y elige</Text>
            <Text style={s.meta}>
              Punto(s): {okCount} / {deck.length}
            </Text>
          </View>
          <Text style={[s.p, { marginTop: 6 }]}>
            Pulsa ▶︎ y elige el objeto correcto.
          </Text>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 }}>
            <Pressable onPress={play} style={btn.play}>
              <Text style={btn.playTxt}>▶︎</Text>
            </Pressable>
            <Text style={{ color: "#6B7280" }}>
              Ronda {i + 1}/{deck.length}
            </Text>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            {options.map((opt) => {
              const chosen = picked != null;
              const isPicked = picked === opt.key;
              const isRight = chosen && opt.key === target.key;
              const bg =
                !chosen
                  ? "#111827"
                  : isRight
                  ? "#059669"
                  : isPicked
                  ? "#DC2626"
                  : "#374151";
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => onPick(opt.key)}
                  disabled={chosen}
                  style={[s.opt, { backgroundColor: bg }]}
                >
                  <Text style={s.optKana}>{opt.kana}</Text>
                  <Text style={s.optEs}>{opt.es}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={next}
            disabled={picked == null}
            style={[
              s.primaryBtn,
              { marginTop: 12, opacity: picked == null ? 0.5 : 1 },
            ]}
          >
            <Text style={s.primaryBtnText}>
              {i + 1 >= deck.length ? "Reiniciar" : "Siguiente"}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

/** ===================== Mini Guía (explicación textual) ===================== */
function MiniGuide() {
  const [romaji, setRomaji] = useState(true);
  const [esp, setEsp] = useState(true);

  const ex = [
    { ja: "これは えんぴつ です.", ro: "kore wa enpitsu desu.", es: "Esto es un lápiz." },
    { ja: "それは ほん では ありません.", ro: "sore wa hon dewa arimasen.", es: "Eso no es un libro." },
    { ja: "あれは こくばん ですか.", ro: "are wa kokuban desu ka?", es: "¿Aquello es una pizarra?" },
    { ja: "これは なん ですか.", ro: "kore wa nan desu ka?", es: "¿Qué es esto?" },
    { ja: "それは けしごむ です.", ro: "sore wa keshigomu desu.", es: "Eso es una goma." },
  ];

  return (
    <View style={s.card}>
      <Text style={s.h2}>Mini-guía (súper simple)</Text>

      <Text style={s.p}>
        <Text style={s.kbd}>これ</Text> = “esto” (cerca de <Text style={s.bold}>mí</Text>){"\n"}
        <Text style={s.kbd}>それ</Text> = “eso” (cerca de <Text style={s.bold}>ti</Text> / la otra persona){"\n"}
        <Text style={s.kbd}>あれ</Text> = “aquello” (lejos de ambos){"\n"}
        Estructura básica: <Text style={s.kbd}>[これ／それ／あれ] + は + [objeto] + です</Text>{"\n"}
        Negación amable: <Text style={s.kbd}>では ありません</Text> (o <Text style={s.kbd}>じゃ ありません</Text>).{"\n"}
        Pregunta amable: termina en <Text style={s.kbd}>ですか</Text>.{"\n"}
      </Text>

      <Text style={[s.p, { marginTop: 6 }]}>
        🔎 Para preguntar “¿qué es?”: <Text style={s.kbd}>これは なん ですか。</Text>
      </Text>

      <Text style={[s.note, { marginTop: 6 }]}>
        💡 “Esto/eso/aquello” (これ/それ/あれ) son pronombres. Para “este/ese/aquel + sustantivo”
        usa <Text style={s.kbd}>この／その／あの</Text>: <Text style={s.kbd}>この ほん</Text>,
        <Text style={s.kbd}>その えんぴつ</Text>, <Text style={s.kbd}>あの つくえ</Text>.
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <ToggleBtn
          icon="text"
          label={romaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}
          onPress={() => setRomaji((v) => !v)}
        />
        <ToggleBtn
          icon="globe-outline"
          label={esp ? "Ocultar ES" : "Mostrar ES"}
          onPress={() => setEsp((v) => !v)}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        {ex.map((e, i) => (
          <View key={i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.line}>{e.ja}</Text>
              <IconBtn onPress={() => speakJA(e.ja)} />
            </View>
            {romaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
            {esp ? <Text style={s.es}>{e.es}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** ===================== Diagrama deíctico (visual + audio) ===================== */
function DeixisDiagram() {
  const lines = [
    {
      label: "これ（近い・yo）",
      ja: "これは ほん です。",
      ro: "kore wa hon desu.",
      es: "Esto es un libro.",
      icon: "person",
    },
    {
      label: "それ（近い・tú）",
      ja: "それは えんぴつ です。",
      ro: "sore wa enpitsu desu.",
      es: "Eso es un lápiz.",
      icon: "person-outline",
    },
    {
      label: "あれ（lejos de ambos）",
      ja: "あれは こくばん です。",
      ro: "are wa kokuban desu.",
      es: "Aquello es una pizarra.",
      icon: "earth-outline",
    },
    {
      label: "¿Qué es…?",
      ja: "これは なん ですか。",
      ro: "kore wa nan desu ka?",
      es: "¿Qué es esto?",
      icon: "help-circle-outline",
    },
  ];

  return (
    <View style={s.card}>
      <Text style={s.h2}>Distancias: ¿esto, eso o aquello?</Text>
      <Text style={[s.p, { marginTop: 6 }]}>
        Imagina tres zonas: <Text style={s.kbd}>yo (aquí)</Text>, <Text style={s.kbd}>tú (ahí)</Text>,{" "}
        <Text style={s.kbd}>lejos (allá)</Text>. Usa <Text style={s.kbd}>これ</Text> cerca de ti,{" "}
        <Text style={s.kbd}>それ</Text> cerca de la otra persona, y <Text style={s.kbd}>あれ</Text> para lo lejano.
      </Text>

      <View style={{ marginTop: 10, gap: 10 }}>
        {lines.map((l, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              backgroundColor: "#fffdfc",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#EFE7DA",
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFF4F6",
                borderWidth: 1,
                borderColor: "#F7D3DA",
              }}
            >
              <Ionicons name={l.icon as any} size={18} color={CRIMSON} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.bold, { marginBottom: 2 }]}>{l.label}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={s.line}>{l.ja}</Text>
                <IconBtn onPress={() => speakJA(l.ja)} />
              </View>
              <Text style={s.romaji}>{l.ro}</Text>
              <Text style={s.es}>{l.es}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[s.note, { marginTop: 10 }]}>
        📝 También existen <Text style={s.kbd}>どれ</Text> (“¿cuál?” entre varias cosas),
        y los adjetivos demostrativos: <Text style={s.kbd}>この／その／あの</Text> + sustantivo.
      </Text>
    </View>
  );
}

/** ===================== Juego de deícticos ===================== */
type DeicticScenario = {
  id: number;
  prompt: string; // descripción en ES
  right: "これ" | "それ" | "あれ";
  ja: string; // frase modelo
};

const SCENARIOS: DeicticScenario[] = [
  { id: 1, prompt: "Tienes el cuaderno en la mano (cerca de TI). ¿Cuál usas?", right: "これ", ja: "これは ノート です。" },
  { id: 2, prompt: "El lápiz está frente a tu compañero (cerca de ÉL/ELLA, no de ti).", right: "それ", ja: "それは えんぴつ です。" },
  { id: 3, prompt: "La pizarra está al fondo del salón (lejos de ambos).", right: "あれ", ja: "あれは こくばん です。" },
  { id: 4, prompt: "La mochila está junto a ti.", right: "これ", ja: "これは かばん です。" },
  { id: 5, prompt: "El libro está más cerca de la otra persona.", right: "それ", ja: "それは ほん です。" },
  { id: 6, prompt: "Ese mapa cuelga lejos, al fondo del aula.", right: "あれ", ja: "あれは ちず です。" },
];

function DeicticGame({
  playCorrect,
  playWrong,
}: {
  playCorrect: () => Promise<void> | void;
  playWrong: () => Promise<void> | void;
}) {
  const [order] = useState<number[]>(() => shuffle(SCENARIOS.map((s) => s.id)));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<null | "これ" | "それ" | "あれ">(null);

  const current = SCENARIOS.find((s) => s.id === order[idx])!;

  const choose = async (opt: "これ" | "それ" | "あれ") => {
    if (chosen) return;
    setChosen(opt);
    const ok = opt === current.right;
    if (ok) {
      setScore((v) => v + 1);
      Vibration.vibrate(25);
      await playCorrect();
    } else {
      Vibration.vibrate(15);
      await playWrong();
    }
  };

  const next = () => {
    if (idx + 1 >= order.length) {
      setIdx(0);
      setScore(0);
      setChosen(null);
      return;
    }
    setIdx((v) => v + 1);
    setChosen(null);
  };

  const btnColor = (opt: "これ" | "それ" | "あれ") => {
    if (!chosen) return "#111827";
    if (opt === current.right) return "#059669";
    if (opt === chosen) return "#DC2626";
    return "#374151";
  };

  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={s.h2}>Juego: elige これ／それ／あれ</Text>
        <Text style={s.meta}>Puntaje: {score}/{order.length}</Text>
      </View>

      <Text style={[s.p, { marginTop: 6 }]}>{current.prompt}</Text>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 10 }}>
        <Pressable onPress={() => speakJA(current.ja)} style={btn.play}>
          <Text style={btn.playTxt}>▶︎</Text>
        </Pressable>
        <Text style={{ color: "#6B7280" }}>Ejemplo en japonés (audio)</Text>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {(["これ", "それ", "あれ"] as const).map((opt) => (
          <Pressable
            key={opt}
            onPress={() => choose(opt)}
            disabled={!!chosen}
            style={[s.opt, { backgroundColor: btnColor(opt) }]}
          >
            <Text style={s.optKana}>{opt}</Text>
            <Text style={s.optEs}>
              {opt === "これ" ? "esto (cerca de mí)" : opt === "それ" ? "eso (cerca de ti)" : "aquello (lejos)"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={next}
        disabled={!chosen}
        style={[s.primaryBtn, { marginTop: 12, opacity: !chosen ? 0.5 : 1 }]}
      >
        <Text style={s.primaryBtnText}>
          {idx + 1 >= order.length ? "Reiniciar" : "Siguiente"}
        </Text>
      </Pressable>

      <Text style={[s.note, { marginTop: 10 }]}>
        💬 Para preguntar: <Text style={s.kbd}>これは なん ですか。</Text>{"\n"}
        Respuesta: <Text style={s.kbd}>それは えんぴつ です。</Text>
      </Text>
    </View>
  );
}

/** ===================== UI helpers & styles ===================== */
function ToggleBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagTxt}>{label}</Text>
    </View>
  );
}

/** ===================== Fondo de sakuras ===================== */
function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.round(Math.random() * 10);
        const x = Math.round(Math.random() * (width - size));
        const delay = Math.round(Math.random() * 2500);
        const rotStart = Math.random() * 360;
        const duration = 6000 + Math.round(Math.random() * 2000);
        return { id: i, size, x, delay, rotStart, duration };
      }),
    [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((p) => (
        <Petal key={p.id} {...p} H={height} />
      ))}
    </View>
  );
}

function Petal({
  size,
  x,
  delay,
  rotStart,
  duration,
  H,
}: {
  size: number;
  x: number;
  delay: number;
  rotStart: number;
  duration: number;
  H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, {
        toValue: H + size + 20,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (!alive) return;
        setTimeout(fall, Math.random() * 1000);
      });
    };
    const rotLoop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const start = setTimeout(() => {
      fall();
      rotLoop.start();
      swayLoop.start();
    }, delay);
    return () => {
      alive = false;
      clearTimeout(start);
      rot.stopAnimation();
      sway.stopAnimation();
      y.stopAnimation();
    };
  }, [H, delay, duration, rot, size, sway, y]);
  const translateX = Animated.add(
    new Animated.Value(x),
    sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] })
  );
  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`],
  });
  return (
    <Animated.View
      style={[
        s.petal,
        {
          width: size,
          height: size * 1.4,
          borderRadius: size,
          transform: [{ translateX }, { translateY: y }, { rotate }],
        },
      ]}
    />
  );
}

/** ===================== Tema / estilos ===================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    backgroundColor: "#fffdf7",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    overflow: "hidden",
    padding: 16,
  },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },
  bold: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },
  note: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  grid: { marginTop: 10, gap: 10 },
  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: INK },
  cardJP: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emoji: { fontSize: 18 },

  meta: { fontSize: 12, color: "#6B7280", fontWeight: "700" },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optKana: { color: "#fff", fontSize: 20, fontWeight: "900" },
  optEs: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

  primaryBtn: {
    backgroundColor: CRIMSON,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },

  petal: {
    position: "absolute",
    top: -30,
    left: 0,
    backgroundColor: "#FFD7E6",
    borderWidth: 1,
    borderColor: "#F9AFC6",
    opacity: 0.8,
  },
});

const btn = StyleSheet.create({
  iconBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#fff5f6",
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
  play: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  playTxt: { color: "#fff", fontWeight: "900" },
});
