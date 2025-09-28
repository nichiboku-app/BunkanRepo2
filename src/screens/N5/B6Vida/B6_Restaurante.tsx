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

/* ============================
   FONDO — Restaurante japonés
============================ */
/** Cortinas のれん (noren) que se mecen */
function Noren({ x = 12, width = 96, delay = 0, color = "#b91c1c" }: { x?: number; width?: number; delay?: number; color?: string }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  const rot = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-1.6deg", "1.6deg", "-1.6deg"] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: x,
        width,
        height: 68,
        backgroundColor: color,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        transform: [{ rotateZ: rot }],
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "900", letterSpacing: 2 }}>のれん</Text>
    </Animated.View>
  );
}

/** Vapor de ramen que sube y desaparece */
function Steam({ x = W * 0.75, y = 88, delay = 0 }: { x?: number; y?: number; delay?: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);

  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [0, -36] });
  const op = t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.9, 0] });
  const sx = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: op,
        transform: [{ translateY: ty }, { scale: sx }],
        fontSize: 18,
      }}
    >
      ♨️
    </Animated.Text>
  );
}

/** Banda de sushi (kaiten) abajo */
function KaitenSushi() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 9000, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-W, W] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        bottom: 18,
        left: -W,
        transform: [{ translateX: tx }],
        fontSize: 22,
        opacity: 0.85,
      }}
    >
      🍣🍣 🍤 🍣 🍣 🍙 🍣 🍤 🍣 🍣
    </Animated.Text>
  );
}

/* ===========================
   Datos del menú (12 ítems)
=========================== */
type Dish = { key: string; icon: string; jp: string; es: string; price: number };
const MENU: Dish[] = [
  { key: "ramen", icon: "🍜", jp: "ラーメン", es: "Ramen", price: 820 },
  { key: "udon", icon: "🥢", jp: "うどん", es: "Udon", price: 700 },
  { key: "sushi", icon: "🍣", jp: "寿司", es: "Sushi", price: 980 },
  { key: "gyoza", icon: "🥟", jp: "ぎょうざ", es: "Gyoza", price: 480 },
  { key: "curry", icon: "🍛", jp: "カレー", es: "Curry", price: 750 },
  { key: "miso", icon: "🍲", jp: "みそしる", es: "Sopa de miso", price: 220 },
  { key: "tenpura", icon: "🍤", jp: "てんぷら", es: "Tempura", price: 540 },
  { key: "onigiri", icon: "🍙", jp: "おにぎり", es: "Onigiri", price: 120 },
  { key: "ocha", icon: "🍵", jp: "お茶", es: "Té", price: 140 },
  { key: "juice", icon: "🥤", jp: "ジュース", es: "Jugo", price: 180 },
  { key: "water", icon: "💧", jp: "お水", es: "Agua", price: 0 },
  { key: "dessert", icon: "🍡", jp: "だんご", es: "Dango", price: 300 },
];

/* ===========================
   Contadores nativos 1–10
=========================== */
const NATIVE_COUNTER: Record<number, { kana: string; romaji: string }> = {
  1: { kana: "ひとつ", romaji: "hitotsu" },
  2: { kana: "ふたつ", romaji: "futatsu" },
  3: { kana: "みっつ", romaji: "mittsu" },
  4: { kana: "よっつ", romaji: "yottsu" },
  5: { kana: "いつつ", romaji: "itsutsu" },
  6: { kana: "むっつ", romaji: "muttsu" },
  7: { kana: "ななつ", romaji: "nanatsu" },
  8: { kana: "やっつ", romaji: "yattsu" },
  9: { kana: "ここのつ", romaji: "kokonotsu" },
  10: { kana: "とお", romaji: "too" },
};

/* Construye “X を Nつ ください” */
function speakOrder(jpDish: string, qty: number) {
  const q = Math.max(1, Math.min(10, qty));
  const read = NATIVE_COUNTER[q].kana;
  speakJa(`${jpDish} を ${read} ください。`);
}

/* ===========================
   Componente principal
=========================== */
export default function B6_Restaurante() {
  // Animación de entrada
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    return () => stopSpeech();
  }, [fadeIn, slideUp]);

  // Carrito simple (platillo -> cantidad)
  const [cart, setCart] = useState<Record<string, number>>({});
  function add(d: Dish) {
    Vibration.vibrate(8);
    setCart((c) => {
      const nextQty = Math.min(10, (c[d.key] ?? 0) + 1);
      const next = { ...c, [d.key]: nextQty };
      speakOrder(d.jp, nextQty);
      return next;
    });
  }
  function sub(d: Dish) {
    Vibration.vibrate(6);
    setCart((c) => {
      const nextQty = Math.max(0, (c[d.key] ?? 0) - 1);
      const n = { ...c, [d.key]: nextQty };
      if (nextQty === 0) delete n[d.key];
      return n;
    });
  }
  const itemsInCart = useMemo(() => MENU.filter((d) => cart[d.key] > 0), [cart]);
  const total = useMemo(
    () => itemsInCart.reduce((sum, d) => sum + d.price * (cart[d.key] ?? 0), 0),
    [itemsInCart, cart]
  );

  function speakTotal() {
    if (total === 0) {
      speakJa("なにも ありません。");
      return;
    }
    speakJa("お会計を おねがいします。");
    speakJa(`合計は ${total} 円です。`);
  }

  function clearAll() {
    Vibration.vibrate(12);
    setCart({});
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0f1c" }}>
      {/* Capa base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0a0f1c" }]} />
      {/* Panel curvo del local */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#0f1834",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            transform: [{ translateY: H * 0.28 }],
          },
        ]}
      />
      {/* Decoración de restaurante */}
      <Noren x={12} width={W / 3 - 20} color="#b91c1c" />
      <Noren x={W / 3} width={W / 3 - 20} color="#b91c1c" delay={200} />
      <Noren x={(2 * W) / 3 - 12} width={W / 3 - 20} color="#b91c1c" delay={400} />
      <Steam x={W * 0.14} y={90} />
      <Steam x={W * 0.20} y={96} delay={400} />
      <Steam x={W * 0.26} y={90} delay={800} />
      <KaitenSushi />

      <ScrollView contentContainerStyle={s.c} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], gap: 14 }}>
          {/* Encabezado “modo primaria” */}
          <View style={s.header}>
            <Text style={s.kicker}>⛩️ Bloque 6</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={s.h}>🍣 Restaurante</Text>
              <Text style={{ fontSize: 22 }}>🍜</Text>
            </View>
            <Text style={s.sub}>
              Hoy pedimos comida como en primaria:{" "}
              <Text style={s.bold}>fácil, claro y con dibujitos</Text>. Tocamos para escuchar japonés.
            </Text>
          </View>

          {/* Frases clave — con hiragana */}
          <View style={s.box}>
            <Text style={s.b}>Frases clave (tocas y suenan)</Text>

            <Phrase
              jp="おすすめは何ですか。"
              hira="おすすめは なんですか。"
              es="¿Cuál recomienda?"
              onPlay={() => speakJa("おすすめは なんですか。")}
            />
            <Phrase
              jp="～をお願いします。"
              hira="～を おねがいします。"
              es="Quisiera ~, por favor."
              onPlay={() => speakJa("～を おねがいします。")}
            />
            <Phrase
              jp="お会計をお願いします。"
              hira="おかいけいを おねがいします。"
              es="La cuenta, por favor."
              onPlay={() => speakJa("おかいけいを おねがいします。")}
            />

            <View style={s.note}>
              <Ionicons name="bulb-outline" size={16} color="#0b1221" />
              <Text style={s.noteTxt}>
                <Text style={s.bold}>ください</Text> y <Text style={s.bold}>お願いします</Text> son amables.{"\n"}
                Piensa: “esto, porfi” → <Text style={s.jp}>これをください</Text>{"\n"}
                <Text style={s.dim}>ひらがな：</Text> <Text style={s.jp}>これを ください</Text>
              </Text>
            </View>
          </View>

          {/* Contadores nativos 1–5 (modo primaria) */}
          <View style={s.box}>
            <Text style={s.b}>¿Cuántos quieres? (1–5)</Text>
            <View style={s.counterRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  style={s.counterChip}
                  onPress={() => speakJa(NATIVE_COUNTER[n].kana)}
                  android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                >
                  <Text style={s.counterNum}>{n}</Text>
                  <Text style={s.counterKana}>{NATIVE_COUNTER[n].kana}</Text>
                  <Text style={s.counterRoma}>{NATIVE_COUNTER[n].romaji}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[s.esSmall, { marginTop: 6 }]}>
              Patrón para pedir: <Text style={s.jp}>（料理）を（数）ください。</Text>{" "}
              <Text style={s.dim}>ひらがな：</Text> <Text style={s.jp}>（りょうり）を（かず）ください。</Text>
            </Text>
          </View>

          {/* Menú interactivo (sumar/restar y escuchar pedido) */}
          <View style={s.box}>
            <Text style={s.b}>Menú — toca + para pedir (suena en japonés)</Text>
            <View style={s.grid}>
              {MENU.map((d) => {
                const qty = cart[d.key] ?? 0;
                return (
                  <View key={d.key} style={[s.card, qty > 0 && s.cardActive]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={s.emoji}>{d.icon}</Text>
                      <View>
                        <Text style={s.cardTitle}>{d.jp}</Text>
                        <Text style={s.cardSub}>{d.es}</Text>
                      </View>
                    </View>

                    <View style={s.priceTag}>
                      <Ionicons name="pricetags-outline" size={14} color="#0b1221" />
                      <Text style={s.priceTxt}>¥{d.price}</Text>
                      <Pressable onPress={() => speakJa(`${d.jp} は ${d.price}円です。`)} style={{ marginLeft: 6, paddingHorizontal: 6 }}>
                        <Ionicons name="volume-high-outline" size={14} color="#0b1221" />
                      </Pressable>
                    </View>

                    <View style={s.qtyRow}>
                      <Pressable style={[s.qtyBtn]} onPress={() => sub(d)} android_ripple={{ color: "rgba(0,0,0,0.06)" }}>
                        <Ionicons name="remove-outline" size={18} color="#0b1221" />
                      </Pressable>
                      <Text style={s.qtyVal}>{qty}</Text>
                      <Pressable style={[s.qtyBtn]} onPress={() => add(d)} android_ripple={{ color: "rgba(0,0,0,0.06)" }}>
                        <Ionicons name="add-outline" size={18} color="#0b1221" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Ticket / Cuenta */}
            <View style={s.ticket}>
              <Text style={s.ticketTitle}>🧾 Cuenta</Text>
              {itemsInCart.length === 0 ? (
                <Text style={s.ticketEmpty}>Aún no pediste nada. Agrega con “+”.</Text>
              ) : (
                <>
                  {itemsInCart.map((d) => (
                    <View key={d.key} style={s.ticketRow}>
                      <Text style={s.ticketItem}>
                        {d.jp} <Text style={s.dim}>({d.es})</Text> × {cart[d.key]}
                      </Text>
                      <Text style={s.ticketPrice}>¥{d.price * (cart[d.key] ?? 0)}</Text>
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
                <Pressable
                  style={[s.btn, s.btnPrimary]}
                  onPress={speakTotal}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="volume-high-outline" size={16} color="#fff" />
                  <Text style={s.btnTxtPrimary}>Escuchar “La cuenta”</Text>
                </Pressable>
                <Pressable style={s.btn} onPress={clearAll} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                  <Ionicons name="trash-outline" size={16} color="#0b1221" />
                  <Text style={s.btnTxt}>Limpiar</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Mini diálogo — con hiragana */}
          <View style={s.box}>
            <Text style={s.b}>Mini diálogo — “Como en el restaurante”</Text>
            <View style={s.dialog}>
              <DialogLine who="👩‍🍳 Mesero" jp="いらっしゃいませ！" hira="いらっしゃいませ！" es="¡Bienvenido/a!" />
              <DialogLine who="🧒 Tú" jp="おすすめは何ですか。" hira="おすすめは なんですか。" es="¿Cuál recomienda?" />
              <DialogLine who="👩‍🍳 Mesero" jp="カレーが おすすめです。" hira="カレーが おすすめです。" es="Recomiendo el curry." />
              <DialogLine who="🧒 Tú" jp="カレーを ひとつ ください。" hira="カレーを ひとつ ください。" es="Un curry, por favor." />
              <DialogLine who="👩‍🍳 Mesero" jp="かしこまりました。" hira="かしこまりました。" es="¡Enseguida!" />
              <DialogLine who="🧒 Tú" jp="お会計を おねがいします。" hira="おかいけいを おねがいします。" es="La cuenta, por favor." />
            </View>

            <View style={s.rowBtns}>
              <Pressable
                style={[s.btn, s.btnPrimary]}
                onPress={() => {
                  const lines = [
                    "いらっしゃいませ！",
                    "おすすめは なんですか。",
                    "カレーが おすすめです。",
                    "カレーを ひとつ ください。",
                    "かしこまりました。",
                    "おかいけいを おねがいします。",
                  ];
                  (function play(i = 0) {
                    if (i >= lines.length) return;
                    speakJa(lines[i], { onDone: () => play(i + 1) } as any);
                  })();
                }}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name="play-outline" size={16} color="#fff" />
                <Text style={s.btnTxtPrimary}>Escuchar diálogo</Text>
              </Pressable>

              <Pressable style={s.btn} onPress={() => stopSpeech()} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
                <Ionicons name="stop-outline" size={16} color="#0b1221" />
                <Text style={s.btnTxt}>Detener</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 48 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ==========
   Subcomponentes
=========== */
function Phrase({ jp, hira, es, onPlay }: { jp: string; hira: string; es: string; onPlay: () => void }) {
  return (
    <View style={s.phraseRow}>
      <View style={{ flex: 1 }}>
        <Text style={[s.jpBig]}>{jp}</Text>
        <Text style={s.hiraSmall}><Text style={s.dim}>ひらがな：</Text>{hira}</Text>
        <Text style={s.esSmall}>{es}</Text>
      </View>
      <Pressable style={s.audioBtn} onPress={onPlay} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
        <Ionicons name="volume-high-outline" size={16} color="#0b1221" />
      </Pressable>
    </View>
  );
}

function DialogLine({ who, jp, hira, es }: { who: string; jp: string; hira: string; es: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={s.dialogWho}>{who}</Text>
      <Text style={s.dialogJp}>{jp}</Text>
      <Text style={s.dialogHira}><Text style={s.dim}>ひらがな：</Text>{hira}</Text>
      <Text style={s.dialogEs}>{es}</Text>
    </View>
  );
}

/* ===========================
           Estilos
=========================== */
const s = StyleSheet.create({
  c: { padding: 16, paddingTop: 110 },
  header: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 16,
    gap: 6,
  },
  kicker: { fontSize: 12, letterSpacing: 1, color: "#e8f0ff", opacity: 0.9, fontWeight: "700" },
  h: { fontSize: 24, fontWeight: "900", color: "#ffffff" },
  sub: { marginTop: 2, color: "#e8f0ff", opacity: 0.9 },
  bold: { fontWeight: "900" },

  box: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    padding: 14,
    gap: 10,
    marginTop: 14,
  },

  /* Phrases */
  phraseRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  jpBig: { fontSize: 18, fontWeight: "800", color: "#0b1221" },
  hiraSmall: { color: "#0b1221", opacity: 0.8, fontSize: 13 },
  esSmall: { color: "#0b1221", opacity: 0.75 },
  audioBtn: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 10,
  },

  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    backgroundColor: "#ffebb7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,235,183,0.8)",
  },
  noteTxt: { color: "#0b1221" },
  jp: { fontWeight: "800", color: "#0b1221" },
  dim: { opacity: 0.6 },

  /* Counters */
  counterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  counterChip: {
    width: (W - 16 * 2 - 8 * 3) / 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  counterNum: { fontSize: 12, color: "#0b1221", opacity: 0.7 },
  counterKana: { fontWeight: "900", color: "#0b1221" },
  counterRoma: { color: "#0b1221", opacity: 0.7, fontSize: 12 },

  /* Menú */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexBasis: (W - 16 * 2 - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    padding: 12,
    gap: 8,
  },
  cardActive: {
    borderColor: "rgba(20,180,120,0.9)",
    shadowColor: "rgba(20,180,120,0.4)",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 26 },
  cardTitle: { color: "#0b1221", fontWeight: "900" },
  cardSub: { color: "#0b1221", opacity: 0.8 },

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

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: { minWidth: 22, textAlign: "center", fontWeight: "900", color: "#0b1221" },

  /* Ticket */
  ticket: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.98)",
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
  ticketItem: {
    color: "#0b1221",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  ticketPrice: {
    color: "#0b1221",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  ticketSep: { height: 1, backgroundColor: "rgba(0,0,0,0.12)", marginVertical: 6 },

  /* Botones */
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

  /* Diálogo */
  dialog: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    padding: 12,
    gap: 8,
  },
  dialogWho: { fontSize: 12, color: "#0b1221", opacity: 0.7 },
  dialogJp: { fontWeight: "900", color: "#0b1221" },
  dialogHira: { color: "#0b1221", opacity: 0.8 },
  dialogEs: { color: "#0b1221", opacity: 0.8 },
});
