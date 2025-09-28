import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
// ✅ Hook global de puntaje (usado SOLO en el quiz)
import { useB3Score } from "../../../context/B3ScoreContext";

const { width: W, height: H } = Dimensions.get("window");

/* ======================
   Utilidades de voz (JA)
====================== */
function speakJa(text: string, opts: Partial<Speech.SpeechOptions> = {}) {
  Speech.speak(text, { language: "ja", rate: 1.0, pitch: 1.0, ...opts });
}
function stopSpeech() {
  Speech.stop();
}
function speakJaPrice(n: number) {
  speakJa(`${numberToKana(n)}、${n}円です`);
}
function speakJaTotal(n: number) {
  speakJa(`合計は、${numberToKana(n)}、${n}円です`);
}

/* ============================
   FONDO animado — estilo “caja”
============================ */
function SweepLight({ y = 32, width = W * 0.9, height = 26, angle = -12, duration = 4200 }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-width, W + width] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: y,
        left: -width,
        width: width,
        height,
        backgroundColor: "rgba(255,255,255,0.11)",
        borderRadius: 16,
        transform: [{ translateX: tx }, { rotateZ: `${angle}deg` }],
        shadowColor: "#ffffff",
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}
function Shelves() {
  const rows = [H * 0.22, H * 0.36, H * 0.50];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {rows.map((top, i) => (
        <ShelfRow key={i} top={top} delay={i * 200} />
      ))}
    </View>
  );
}
function ShelfRow({ top, delay = 0 }: { top: number; delay?: number }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(s, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(s, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [s, delay]);
  const ty = s.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left: 12,
        right: 12,
        height: 46,
        transform: [{ translateY: ty }],
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    />
  );
}
function FloatingTag({ x = 40, delay = 0 }: { x?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 5200 + Math.random() * 1200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);

  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [H * 0.7 + Math.random() * 60, H * 0.18] });
  const opacity = t.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.7, 0.7, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1, 0.9] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x + (Math.random() * 40 - 20),
        transform: [{ translateY: ty }, { scale }],
        opacity,
        fontSize: 20,
      }}
    >
      🏷️
    </Animated.Text>
  );
}
function CartLoop() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 9000, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-40, W] });
  const scale = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.96, 1.04, 0.96] });
  return (
    <Animated.Text
      style={{
        position: "absolute",
        bottom: 22,
        left: -40,
        transform: [{ translateX: tx }, { scale }],
        fontSize: 28,
        opacity: 0.85,
      }}
    >
      🛒
    </Animated.Text>
  );
}

/* ===========================
   Conversor número → かな / romaji
   Soporta 0 - 99,999
=========================== */
const DIGITS_KANA: Record<number, string> = {
  0: "",
  1: "いち",
  2: "に",
  3: "さん",
  4: "よん",
  5: "ご",
  6: "ろく",
  7: "なな",
  8: "はち",
  9: "きゅう",
};
const DIGITS_ROMAJI: Record<number, string> = {
  0: "",
  1: "ichi",
  2: "ni",
  3: "san",
  4: "yon",
  5: "go",
  6: "roku",
  7: "nana",
  8: "hachi",
  9: "kyuu",
};
function onesKana(n: number) { return DIGITS_KANA[n] ?? ""; }
function onesRomaji(n: number) { return DIGITS_ROMAJI[n] ?? ""; }
function tensKana(n: number) {
  const t = Math.floor(n / 10), r = n % 10;
  if (t === 0) return onesKana(r);
  if (t === 1) return "じゅう" + onesKana(r);
  return onesKana(t) + "じゅう" + onesKana(r);
}
function tensRomaji(n: number) {
  const t = Math.floor(n / 10), r = n % 10;
  if (t === 0) return onesRomaji(r);
  if (t === 1) return ["juu", onesRomaji(r)].filter(Boolean).join(" ");
  return [onesRomaji(t), "juu", onesRomaji(r)].filter(Boolean).join(" ");
}
function hundredsKana(n: number) {
  const h = Math.floor(n / 100), r = n % 100;
  if (h === 0) return tensKana(r);
  let head = "";
  if (h === 1) head = "ひゃく";
  else if (h === 3) head = "さんびゃく";
  else if (h === 6) head = "ろっぴゃく";
  else if (h === 8) head = "はっぴゃく";
  else head = onesKana(h) + "ひゃく";
  return head + tensKana(r);
}
function hundredsRomaji(n: number) {
  const h = Math.floor(n / 100), r = n % 100;
  if (h === 0) return tensRomaji(r);
  let head = "";
  if (h === 1) head = "hyaku";
  else if (h === 3) head = "sanbyaku";
  else if (h === 6) head = "roppyaku";
  else if (h === 8) head = "happyaku";
  else head = `${onesRomaji(h)} hyaku`;
  return [head, tensRomaji(r)].filter(Boolean).join(" ");
}
function thousandsKana(n: number) {
  const th = Math.floor(n / 1000), r = n % 1000;
  if (th === 0) return hundredsKana(r);
  let head = "";
  if (th === 1) head = "せん";
  else if (th === 3) head = "さんぜん";
  else if (th === 8) head = "はっせん";
  else head = onesKana(th) + "せん";
  return head + hundredsKana(r);
}
function thousandsRomaji(n: number) {
  const th = Math.floor(n / 1000), r = n % 1000;
  if (th === 0) return hundredsRomaji(r);
  let head = "";
  if (th === 1) head = "sen";
  else if (th === 3) head = "sanzen";
  else if (th === 8) head = "hassen";
  else head = `${onesRomaji(th)} sen`;
  return [head, hundredsRomaji(r)].filter(Boolean).join(" ");
}
function lessThan10000Kana(n: number) { return n < 1000 ? hundredsKana(n) : thousandsKana(n); }
function lessThan10000Romaji(n: number) { return n < 1000 ? hundredsRomaji(n) : thousandsRomaji(n); }
function numberToKana(n: number): string {
  if (n === 0) return "れい";
  const man = Math.floor(n / 10000), rest = n % 10000;
  let res = "";
  if (man > 0) res += (man === 1 ? "いち" : lessThan10000Kana(man)) + "まん";
  if (rest > 0) res += lessThan10000Kana(rest);
  return res;
}
function numberToRomaji(n: number): string {
  if (n === 0) return "rei";
  const man = Math.floor(n / 10000), rest = n % 10000;
  const parts: string[] = [];
  if (man > 0) parts.push(`${man === 1 ? "ichi" : lessThan10000Romaji(man)} man`);
  if (rest > 0) parts.push(lessThan10000Romaji(rest));
  return parts.join(" ");
}

/* ===========================
   Datos de productos (24)
=========================== */
type Product = { key: string; icon: string; jp: string; es: string; price: number };
const PRODUCTS: Product[] = [
  { key: "onigiri", icon: "🍙", jp: "おにぎり", es: "Onigiri", price: 120 },
  { key: "ramen", icon: "🍜", jp: "ラーメン", es: "Ramen", price: 820 },
  { key: "agua", icon: "💧", jp: "お水", es: "Agua", price: 100 },
  { key: "te", icon: "🍵", jp: "お茶", es: "Té", price: 140 },
  { key: "bento", icon: "🍱", jp: "弁当", es: "Bento", price: 650 },
  { key: "sushi", icon: "🍣", jp: "寿司", es: "Sushi", price: 980 },
  { key: "curry", icon: "🍛", jp: "カレー", es: "Curry", price: 750 },
  { key: "karaage", icon: "🍗", jp: "からあげ", es: "Karaage", price: 420 },
  { key: "takoyaki", icon: "🐙", jp: "たこ焼き", es: "Takoyaki", price: 500 },
  { key: "okonomiyaki", icon: "🥞", jp: "お好み焼き", es: "Okonomiyaki", price: 680 },
  { key: "gyoza", icon: "🥟", jp: "ぎょうざ", es: "Gyoza", price: 480 },
  { key: "miso", icon: "🍲", jp: "みそしる", es: "Sopa de miso", price: 220 },
  { key: "udon", icon: "🍜", jp: "うどん", es: "Udon", price: 700 },
  { key: "tempura", icon: "🍤", jp: "てんぷら", es: "Tempura", price: 540 },
  { key: "dango", icon: "🍡", jp: "だんご", es: "Dango", price: 300 },
  { key: "kakigori", icon: "🍧", jp: "かき氷", es: "Raspado", price: 350 },
  { key: "milk", icon: "🥛", jp: "ぎゅうにゅう", es: "Leche", price: 160 },
  { key: "juice", icon: "🥤", jp: "ジュース", es: "Jugo", price: 180 },
  { key: "bread", icon: "🍞", jp: "パン", es: "Pan", price: 200 },
  { key: "apple", icon: "🍎", jp: "りんご", es: "Manzana", price: 120 },
  { key: "banana", icon: "🍌", jp: "バナナ", es: "Banana", price: 130 },
  { key: "grapes", icon: "🍇", jp: "ぶどう", es: "Uvas", price: 260 },
  { key: "strawberry", icon: "🍓", jp: "いちご", es: "Fresa", price: 240 },
  { key: "naruto", icon: "🍥", jp: "なると", es: "Narutomaki", price: 210 },
];

/* ===========================
   Ejercicio de números
=========================== */
const TARGET_POOL = [80, 100, 120, 160, 180, 200, 210, 220, 240, 250, 260, 300, 350, 420, 480, 540, 650, 700, 750, 820, 980];
function randomTarget() { return TARGET_POOL[Math.floor(Math.random() * TARGET_POOL.length)]; }

/* ===========================
   Tabla de números (paginada)
=========================== */
const PAGE_SIZE = 120;
function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/* ===========================
   Helpers
=========================== */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===========================
   Pantalla principal
=========================== */
export default function B6_Compras() {
  // animación de entrada
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, slideUp]);

  // carrito
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const total = useMemo(
    () => PRODUCTS.filter((p) => selected[p.key]).reduce((acc, p) => acc + p.price, 0),
    [selected]
  );
  function toggleProduct(p: Product) {
    Vibration.vibrate(8);
    setSelected((prev) => {
      const next = { ...prev, [p.key]: !prev[p.key] };
      speakJa(`${p.jp} は ${numberToKana(p.price)}、${p.price}円です`);
      return next;
    });
  }
  function clearCart() { Vibration.vibrate(10); setSelected({}); }

  // ejercicio formar precio
  const [target, setTarget] = useState<number>(randomTarget());
  const [entered, setEntered] = useState<string>("");
  function addDigit(d: string) {
    if (entered.length >= 5) return;
    setEntered((e) => (e === "0" ? d : e + d));
  }
  function backspace() { setEntered((e) => (e.length ? e.slice(0, -1) : e)); }
  function resetExercise() { setEntered(""); setTarget(randomTarget()); }
  const enteredNum = Number(entered || "0");
  const isRight = entered.length > 0 && enteredNum === target;

  // tabla números
  const [start, setStart] = useState(0);
  const end = Math.min(start + PAGE_SIZE - 1, 99999);
  const data = useMemo(() => range(start, end), [start, end]);

  function prevPage() { Vibration.vibrate(6); setStart((s) => Math.max(0, s - PAGE_SIZE)); }
  function nextPage() { Vibration.vibrate(6); setStart((s) => Math.min(99999 - PAGE_SIZE + 1, s + PAGE_SIZE)); }
  function jumpTo(s: number) {
    Vibration.vibrate(6);
    const clamped = Math.max(0, Math.min(99999 - PAGE_SIZE + 1, s));
    setStart(clamped);
  }

  const [playingAll, setPlayingAll] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  function speakNumber(n: number, onDone?: () => void) {
    const kana = numberToKana(n);
    speakJa(`${kana}、${n}`, { onDone } as any);
  }
  const playingAllRef = useRef(playingAll);
  useEffect(() => { playingAllRef.current = playingAll; }, [playingAll]);

  function playRange() {
    if (playingAll) return;
    setPlayingAll(true);
    let i = 0;
    const step = () => {
      if (!playingAllRef.current) return;
      const item = data[i];
      setPlayingIndex(i);
      speakNumber(item, () => {
        if (!playingAllRef.current) return;
        i += 1;
        if (i < data.length) step();
        else { setPlayingAll(false); setPlayingIndex(null); }
      });
    };
    step();
  }
  function stopRange() { stopSpeech(); setPlayingAll(false); setPlayingIndex(null); }

  /* ===========================
     QUIZ: Ordena la oración (10)
     — hook global SOLO aquí
  ============================ */
  const { addPoints } = useB3Score();
  type QuizItem = { es: string; tokens: string[]; solution: string };
  const QUIZ_ITEMS: QuizItem[] = [
    { es: "Disculpe, este por favor.", tokens: ["すみません、", "これ", "を", "ください", "。"], solution: "すみません、これをください。" },
    { es: "Me da agua, por favor.", tokens: ["お水", "を", "ください", "。"], solution: "お水をください。" },
    { es: "Dos ramen, por favor.", tokens: ["ラーメン", "を", "二つ", "ください", "。"], solution: "ラーメンを二つください。" },
    { es: "Ese (de ahí), por favor.", tokens: ["それ", "を", "ください", "。"], solution: "それをください。" },
    { es: "Este onigiri, por favor.", tokens: ["この", "おにぎり", "を", "ください", "。"], solution: "このおにぎりをください。" },
    { es: "El menú, por favor.", tokens: ["メニュー", "を", "ください", "。"], solution: "メニューをください。" },
    { es: "Disculpe, una caja bento, por favor.", tokens: ["すみません、", "弁当", "を", "一つ", "ください", "。"], solution: "すみません、弁当を一つください。" },
    { es: "Tres jugos, por favor.", tokens: ["ジュース", "を", "三つ", "ください", "。"], solution: "ジュースを三つください。" },
    { es: "Dos panes, por favor.", tokens: ["パン", "を", "二つ", "ください", "。"], solution: "パンを二つください。" },
    { es: "Esa manzana, por favor.", tokens: ["その", "りんご", "を", "ください", "。"], solution: "そのりんごをください。" },
  ];

  const [qIndex, setQIndex] = useState(0);
  const [pool, setPool] = useState<string[]>(() => shuffle(QUIZ_ITEMS[0].tokens));
  const [answer, setAnswer] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    setPool(shuffle(QUIZ_ITEMS[qIndex].tokens));
    setAnswer([]);
    setChecked(null);
  }, [qIndex]);

  function pickToken(i: number) {
    const t = pool[i];
    setPool((p) => p.filter((_, idx) => idx !== i));
    setAnswer((a) => [...a, t]);
    Vibration.vibrate(6);
  }
  function unpickToken(i: number) {
    const t = answer[i];
    setAnswer((a) => a.filter((_, idx) => idx !== i));
    setPool((p) => [...p, t]);
    Vibration.vibrate(4);
  }
  function clearQuiz() {
    setPool(shuffle(QUIZ_ITEMS[qIndex].tokens));
    setAnswer([]);
    setChecked(null);
  }
  function checkQuiz() {
    const good = answer.join("") === QUIZ_ITEMS[qIndex].solution;
    setChecked(good);
    if (good) {
      speakJa(QUIZ_ITEMS[qIndex].solution);
      try { addPoints?.(5, "B6_Compras_Quiz"); } catch {}
    } else {
      Vibration.vibrate(30);
    }
  }
  function nextQuiz() { setQIndex((i) => (i + 1) % QUIZ_ITEMS.length); }

  return (
    <View style={{ flex: 1, backgroundColor: "#0a1020" }}>
      {/* Fondo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0a1020" }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#0e1630",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            transform: [{ translateY: H * 0.28 }],
          },
        ]}
      />
      <SweepLight y={24} angle={-14} />
      <SweepLight y={64} angle={-14} duration={5200} />
      <Shelves />
      {Array.from({ length: 6 }).map((_, i) => (
        <FloatingTag key={i} x={20 + (i * (W - 40)) / 6} delay={i * 350} />
      ))}
      <CartLoop />

      {/* Contenido */}
      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.kicker}>⛩️ Bloque 6</Text>
            <Text style={s.h}>🛍️ Compras</Text>
            <Text style={s.sub}>
              Precios (<Text style={s.bold}>いくらですか</Text>), pedir con <Text style={s.bold}>ください</Text>,
              práctica de números y ticket interactivo con audio.
            </Text>
          </View>

          {/* Frases clave */}
          <View style={s.box}>
            <Text style={s.b}>Frases clave</Text>
            <Text style={s.line}><Text style={s.jp}>いくらですか。</Text> — ¿Cuánto cuesta?</Text>
            <Text style={s.line}><Text style={s.jp}>これをください。</Text> — Me da este, por favor.</Text>
            <Text style={s.line}><Text style={s.jp}>安いのはありますか。</Text> — ¿Tiene uno más barato?</Text>

            <View style={s.rowBtns}>
              <Pressable style={s.btn} onPress={() => speakJa("いくらですか。")} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Escuchar</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={() => speakJa("これをください。")} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Escuchar</Text>
              </Pressable>
            </View>
          </View>

          {/* ください */}
          <View style={s.box}>
            <Text style={s.b}>Cómo usar 「ください」</Text>
            <Text style={s.p}>
              「ください」 se usa para pedir algo de forma cortés. Se añade después del objeto:
              {"\n"}<Text style={s.jp}>これをください。</Text> (Deme este, por favor)
              {"\n"}<Text style={s.jp}>メニューをください。</Text> (El menú, por favor)
            </Text>
          </View>

          {/* Productos + Ticket */}
          <View style={s.box}>
            <Text style={s.b}>Elige productos y escucha el precio</Text>
            <View style={s.grid}>
              {PRODUCTS.map((p) => {
                const active = !!selected[p.key];
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => toggleProduct(p)}
                    android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                    style={[s.card, active && s.cardActive]}
                  >
                    <Text style={s.emoji}>{p.icon}</Text>
                    <Text style={s.cardTitle}>{p.jp}</Text>
                    <Text style={s.cardSub}>{p.es}</Text>
                    <View style={s.priceTag}>
                      <Ionicons name="pricetags-outline" size={14} color="#0b1221" />
                      <Text style={s.priceTxt}>¥{p.price}</Text>
                      <Pressable onPress={() => speakJaPrice(p.price)} style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Ionicons name="volume-high-outline" size={14} color="#0b1221" />
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Ticket */}
            <View style={s.ticket}>
              <Text style={s.ticketTitle}>🧾 Ticket</Text>
              {PRODUCTS.filter((p) => selected[p.key]).length === 0 ? (
                <Text style={s.ticketEmpty}>No hay artículos. Toca un producto para añadirlo.</Text>
              ) : (
                <>
                  {PRODUCTS.filter((p) => selected[p.key]).map((p) => (
                    <View key={p.key} style={s.ticketRow}>
                      <Text style={s.ticketItem}>{p.jp} <Text style={s.dim}>({p.es})</Text></Text>
                      <Text style={s.ticketPrice}>¥{p.price}</Text>
                    </View>
                  ))}
                  <View style={s.ticketSep} />
                  <View style={s.ticketRow}>
                    <Text style={[s.ticketItem, s.bold]}>合計 / Total</Text>
                    <Text style={[s.ticketPrice, s.bold]}>¥{total}</Text>
                  </View>
                </>
              )}

              <View style={s.rowBtns}>
                <Pressable style={[s.btn, s.btnPrimary]} onPress={() => (total > 0 ? speakJaTotal(total) : speakJa("なにも ありません。"))} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                  <Ionicons name="volume-high-outline" size={16} color="#fff" />
                  <Text style={s.btnTxtPrimary}>Escuchar total (JA)</Text>
                </Pressable>
                <Pressable style={s.btn} onPress={clearCart} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                  <Ionicons name="trash-outline" size={16} color="#0b1221" />
                  <Text style={s.btnTxt}>Limpiar</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Ejercicio: forma el precio que escuchas */}
          <View style={s.box}>
            <Text style={s.b}>Ejercicio: arma el precio que escuchas</Text>
            <Text style={s.p}>Toca <Text style={s.bold}>Escuchar objetivo</Text> y escribe el precio (sin símbolo).</Text>

            <View style={s.exerciseRow}>
              <Pressable style={s.btn} onPress={() => speakJaPrice(target)} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Escuchar objetivo</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={resetExercise} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="refresh-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Nuevo</Text>
              </Pressable>
            </View>

            <View style={s.priceInput}>
              <Text style={s.pricePrefix}>¥</Text>
              <Text style={[s.priceVal, isRight ? s.ok : undefined]}>{entered.length ? entered : "—"}</Text>
              {entered.length > 0 && (
                <Pressable onPress={backspace} style={s.backspaceBtn}>
                  <Ionicons name="backspace-outline" size={18} color="#0b1221" />
                </Pressable>
              )}
            </View>

            {/* Teclado */}
            <View style={s.numpad}>
              {["1","2","3","4","5","6","7","8","9","0"].map((d) => (
                <Pressable key={d} style={s.key} onPress={() => addDigit(d)} android_ripple={{ color: "rgba(0,0,0,0.06)" }}>
                  <Text style={s.keyTxt}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <View style={s.exerciseRow}>
              <Pressable style={[s.btn, s.btnPrimary]} onPress={() => speakJaPrice(enteredNum)} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                <Ionicons name="volume-high-outline" size={16} color="#fff" />
                <Text style={s.btnTxtPrimary}>Escuchar tu precio (JA)</Text>
              </Pressable>

              <View style={s.resultPill}>
                <Ionicons name={isRight ? "checkmark-circle-outline" : "close-circle-outline"} size={16} color={isRight ? "#0a7f3f" : "#7f1020"} />
                <Text style={[s.resultTxt, { color: isRight ? "#0a7f3f" : "#7f1020" }]}>
                  {entered.length === 0 ? "Escribe un precio" : isRight ? "¡Correcto!" : "Sigue intentando"}
                </Text>
              </View>
            </View>
          </View>

          {/* ===================== */}
          {/* TABLA DE NÚMEROS (sin FlatList para evitar warning) */}
          {/* ===================== */}
          <View style={s.box}>
            <Text style={s.b}>Tabla de números (0–99,999) con audio</Text>
            <Text style={s.p}>
              1) Elige el <Text style={s.bold}>tramo</Text> • 2) Toca el <Text style={s.bold}>▶︎</Text> para oír una fila •
              3) Usa <Text style={s.bold}>Reproducir tramo</Text> para escuchar todos en orden. La columna <Text style={s.bold}>Romaji</Text> guía la pronunciación.
            </Text>

            {/* Saltos rápidos */}
            <View style={s.pagerRow}>
              {[0, 100, 1000, 10000].map((v) => (
                <Pressable key={v} style={s.btn} onPress={() => jumpTo(v)} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                  <Text style={s.btnTxt}>{v.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>

            {/* Controles de tramo */}
            <View style={s.pagerRow}>
              <Pressable style={s.btn} onPress={prevPage} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="chevron-back-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Anterior</Text>
              </Pressable>

              <View style={s.rangeBadge}>
                <Text style={s.rangeTxt}>
                  {start.toLocaleString()} – {end.toLocaleString()}
                </Text>
              </View>

              <Pressable style={s.btn} onPress={nextPage} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Text style={s.btnTxt}>Siguiente</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#0b1221" />
              </Pressable>
            </View>

            {/* Play/Stop tramo */}
            <View style={[s.pagerRow, { marginTop: 6 }]}>
              {!playingAll ? (
                <Pressable style={[s.btn, s.btnPrimary]} onPress={playRange} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                  <Ionicons name="play-outline" size={16} color="#fff" />
                  <Text style={s.btnTxtPrimary}>Reproducir tramo</Text>
                </Pressable>
              ) : (
                <Pressable style={[s.btn, s.btnPrimary]} onPress={stopRange} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                  <Ionicons name="stop-outline" size={16} color="#fff" />
                  <Text style={s.btnTxtPrimary}>Detener</Text>
                </Pressable>
              )}
            </View>

            {/* Tabla (render plano por página) */}
            <View style={s.tableWrap}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { width: 82 }]}>Nº</Text>
                <Text style={[s.th, { flex: 1 }]}>Lectura (かな)</Text>
                <Text style={[s.th, { flex: 1 }]}>Romaji</Text>
                <Text style={[s.th, { width: 42, textAlign: "center" }]}>▶︎</Text>
              </View>

              <View>
                {data.map((item, index) => {
                  const kana = numberToKana(item);
                  const romaji = numberToRomaji(item);
                  const isPlaying = playingIndex === index && playingAll;
                  return (
                    <View key={item} style={s.tr}>
                      <Text style={[s.tdNum, { width: 82 }]}>{item.toString().padStart(5, "0")}</Text>
                      <Text style={[s.td, { flex: 1 }]}>{kana || "れい"}</Text>
                      <Text style={[s.td, { flex: 1 }]}>{romaji || "rei"}</Text>
                      <Pressable
                        style={[s.playBtn, isPlaying && { backgroundColor: "rgba(11,18,33,0.12)" }]}
                        onPress={() => speakNumber(item)}
                      >
                        <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={[s.p, { marginTop: 8, opacity: 0.8 }]}>
              Nota: se usa lectura estándar (よん／なな／きゅう). Existen variantes (し／しち／く) en contextos específicos.
            </Text>
          </View>

          {/* ===================== */}
          {/* QUIZ FINAL (10 ejercicios) */}
          {/* ===================== */}
          <View style={s.box}>
            <Text style={s.b}>Quiz: ordena la oración para pedir correctamente</Text>
            <Text style={s.p}>
              Arma la frase en japonés para:{" "}
              <Text style={s.bold}>{QUIZ_ITEMS[qIndex].es}</Text>
            </Text>

            {/* Construcción del alumno */}
            <View style={s.quizBuild}>
              {answer.length === 0 ? (
                <Text style={{ color: "#0b1221", opacity: 0.6 }}>Toca las fichas para formar la oración…</Text>
              ) : (
                <View style={s.chipsRow}>
                  {answer.map((t, i) => (
                    <Pressable key={`${t}-${i}`} onPress={() => unpickToken(i)} style={[s.chip, s.chipActive]} android_ripple={{ color: "rgba(0,0,0,0.06)" }}>
                      <Text style={s.chipTxtDark}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Banco de fichas */}
            <View style={s.chipsRow}>
              {pool.map((t, i) => (
                <Pressable key={`${t}-${i}`} onPress={() => pickToken(i)} style={s.chip} android_ripple={{ color: "rgba(0,0,0,0.06)" }}>
                  <Text style={s.chipTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Botones del quiz */}
            <View style={s.rowBtns}>
              <Pressable style={[s.btn, s.btnPrimary]} onPress={checkQuiz} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text style={s.btnTxtPrimary}>Comprobar</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={clearQuiz} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="backspace-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Borrar</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={() => speakJa(QUIZ_ITEMS[qIndex].solution)} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Escuchar correcta</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={nextQuiz} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="arrow-forward-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Siguiente</Text>
              </Pressable>
            </View>

            {/* Feedback */}
            {checked !== null && (
              <View style={[s.resultPill, { marginTop: 8 }]}>
                <Ionicons
                  name={checked ? "checkmark-circle-outline" : "close-circle-outline"}
                  size={16}
                  color={checked ? "#0a7f3f" : "#7f1020"}
                />
                <Text style={[s.resultTxt, { color: checked ? "#0a7f3f" : "#7f1020" }]}>
                  {checked ? "¡Correcto! +5 pts" : "Casi, revisa el orden (～をください／すみません、…)"}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 48 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ===========================
           Estilos
=========================== */
const s = StyleSheet.create({
  c: { padding: 16, paddingTop: 110, gap: 14 },

  header: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 16,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#e8f0ff", opacity: 0.9, fontWeight: "700" },
  h: { fontSize: 24, fontWeight: "900", color: "#ffffff", marginTop: 2 },
  sub: { marginTop: 4, color: "#e8f0ff", opacity: 0.85 },

  bold: { fontWeight: "900" },
  jp: { fontWeight: "800", color: "#0b1221" },
  p: { color: "#0b1221", opacity: 0.95, lineHeight: 18 },
  line: { color: "#0b1221", opacity: 0.95, marginBottom: 4 },

  box: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 14,
    gap: 10,
  },

  /* productos */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexBasis: (W - 16 * 2 - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 12,
  },
  cardActive: {
    borderColor: "rgba(20,180,120,0.9)",
    shadowColor: "rgba(20,180,120,0.4)",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { color: "#0b1221", fontWeight: "900" },
  cardSub: { color: "#0b1221", opacity: 0.8, marginBottom: 6 },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffcf9b",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  priceTxt: { color: "#0b1221", fontWeight: "900" },

  /* ticket */
  ticket: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.15)",
    padding: 14,
    gap: 8,
  },
  ticketTitle: { fontWeight: "900", color: "#0b1221" },
  ticketEmpty: { color: "#0b1221", opacity: 0.7 },
  ticketRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ticketItem: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), color: "#0b1221" },
  dim: { opacity: 0.6 },
  ticketPrice: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), color: "#0b1221" },
  ticketSep: { height: 1, backgroundColor: "rgba(0,0,0,0.12)", marginVertical: 6 },

  /* botones */
  rowBtns: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,235,183,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
  },
  btnTxt: { color: "#0b1221", fontWeight: "800", fontSize: 12 },
  btnPrimary: { backgroundColor: "#0b1221", borderColor: "rgba(255,255,255,0.2)" },
  btnTxtPrimary: { color: "#fff", fontWeight: "900", fontSize: 12 },

  /* ejercicio */
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  priceInput: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pricePrefix: { fontSize: 18, fontWeight: "900", color: "#0b1221" },
  priceVal: { fontSize: 18, fontWeight: "900", color: "#0b1221", letterSpacing: 1 },
  ok: { color: "#0a7f3f" },
  backspaceBtn: { marginLeft: "auto", padding: 6, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 8 },

  numpad: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  key: {
    width: (W - 16 * 2 - 8 * 2 - 8 * 2) / 5,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  keyTxt: { fontSize: 18, fontWeight: "900", color: "#0b1221" },

  resultPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  resultTxt: { fontWeight: "800", fontSize: 12 },

  /* tabla números */
  pagerRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 },
  rangeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  rangeTxt: { fontWeight: "900", color: "#0b1221" },

  tableWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  th: { fontWeight: "800", color: "#0b1221", fontSize: 12 },
  tr: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 44 },
  tdNum: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), color: "#0b1221" },
  td: { color: "#0b1221" },
  playBtn: {
    width: 42, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  hr: { height: 1, backgroundColor: "rgba(0,0,0,0.06)" },

  /* Quiz */
  quizBuild: {
    minHeight: 56,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    padding: 10,
    justifyContent: "center",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffebb7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
  },
  chipActive: { backgroundColor: "#ffd27a", borderColor: "rgba(255,200,120,0.9)" },
  chipTxt: { color: "#0b1221", fontWeight: "800" },
  chipTxtDark: { color: "#0b1221", fontWeight: "900" },
});
