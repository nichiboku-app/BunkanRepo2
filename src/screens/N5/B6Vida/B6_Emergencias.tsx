// src/screens/N5/B6Emergencias/B6_Emergencias.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/* =========================================================
   🔊 TTS helper
   ========================================================= */
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

/* =========================================================
   🎆 Fondo sutil con sirenas / emergencia
   ========================================================= */
function PrettyBG() {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(a1, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a1, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(a2, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a2, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop1.start(); loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, [a1, a2]);

  const fx = (a: Animated.Value, x: number, y: number) => ({
    position: "absolute" as const,
    left: x, top: y,
    transform: [
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
      { rotate: a.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "6deg"] }) },
    ],
    opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={require("../../../../assets/images/final_home_background.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.9 }}
      />
      <Animated.Text style={[styles.bgEmoji, fx(a1, 16, 40)]}>🚑</Animated.Text>
      <Animated.Text style={[styles.bgEmoji, fx(a2, 24, 110)]}>🚓</Animated.Text>
      <Animated.Text style={[styles.bgEmoji, fx(a1, 18, 180)]}>🚒</Animated.Text>
      <Animated.Text style={[styles.bgEmoji, fx(a2, 22, 250)]}>⛑️</Animated.Text>
    </View>
  );
}

/* =========================================================
   🗣️ Frases clave (con audio)
   ========================================================= */
function Phrase({ jp, es }: { jp: string; es: string }) {
  return (
    <View style={styles.phraseRow}>
      <Text style={styles.phraseJP}>{jp}</Text>
      <Pressable onPress={() => speakJP(jp)} style={styles.playBtn} accessibilityLabel="Escuchar en japonés">
        <Ionicons name="volume-high-outline" size={16} color="#3b2f2f" />
      </Pressable>
      <Text style={styles.phraseES}>/ {es}</Text>
    </View>
  );
}

const FRASES = [
  { jp: "たすけて ください。", es: "¡Ayuda, por favor!" },
  { jp: "けいさつ を よんで ください。", es: "Llame a la policía, por favor." },
  { jp: "きゅうきゅうしゃ を よんで ください。", es: "Llame a la ambulancia, por favor." },
  { jp: "びょういん は どこ ですか。", es: "¿Dónde está el hospital?" },
  { jp: "さいふ を なくしました。", es: "Perdí la cartera." },
  { jp: "パスポート を なくしました。", es: "Perdí el pasaporte." },
  { jp: "かばん を ぬすまれました。", es: "Me robaron la bolsa/mochila." },
  { jp: "ねつ が あります。", es: "Tengo fiebre." },
  { jp: "いたい です。", es: "Me duele." },
  { jp: "にほんご が すこし しか わかりません。", es: "Entiendo solo un poco de japonés." },
];

/* =========================================================
   🎭 Diálogos (5 situaciones)
   ========================================================= */
type Line = { who: "A" | "B"; jp: string; es: string };
type Dialog = { title: string; lines: Line[]; hint?: string };

const DIALOGS: Dialog[] = [
  {
    title: "① Robo / pérdida (policía 110)",
    hint: "Di “けいさつ を よんで ください” si necesitas ayuda inmediata.",
    lines: [
      { who: "A", jp: "すみません。たすけて ください。", es: "Disculpe. ¡Ayuda, por favor!" },
      { who: "B", jp: "どう しましたか。", es: "¿Qué pasó?" },
      { who: "A", jp: "かばん を ぬすまれました。", es: "Me robaron la bolsa/mochila." },
      { who: "B", jp: "けいさつ を よびます。", es: "Llamaré a la policía." },
      { who: "A", jp: "ありがとうございます。", es: "Gracias." },
    ],
  },
  {
    title: "② Emergencia médica (ambulancia 119)",
    hint: "“きゅうきゅうしゃ を よんで ください” = llame a la ambulancia.",
    lines: [
      { who: "A", jp: "ひと が たおれました。", es: "Una persona se desmayó." },
      { who: "B", jp: "だいじょうぶ ですか。", es: "¿Está bien?" },
      { who: "A", jp: "きゅうきゅうしゃ を よんで ください。", es: "Llame a la ambulancia, por favor." },
      { who: "B", jp: "わかりました。119 に でんわ します。", es: "Entendido. Llamo al 119." },
    ],
  },
  {
    title: "③ Incendio (119 bomberos)",
    hint: "“かじ です！” para avisar ¡fuego!",
    lines: [
      { who: "A", jp: "かじ です！", es: "¡Fuego!" },
      { who: "B", jp: "あぶない です。ここ から はなれて ください。", es: "¡Peligro! Aléjese de aquí, por favor." },
      { who: "A", jp: "119 に でんわ します。", es: "Llamaré al 119." },
      { who: "B", jp: "はい、よろしく おねがい します。", es: "Sí, por favor." },
    ],
  },
  {
    title: "④ Perdido / necesito ayuda",
    lines: [
      { who: "A", jp: "みち に まよいました。", es: "Me perdí." },
      { who: "B", jp: "どこ に いきたい ですか。", es: "¿A dónde quiere ir?" },
      { who: "A", jp: "この じゅうしょ まで おねがい します。", es: "A esta dirección, por favor." },
      { who: "B", jp: "ちかい です。いっしょ に いきましょう。", es: "Está cerca. Vayamos juntos." },
    ],
  },
  {
    title: "⑤ Terremoto (じしん)",
    hint: "Protégete: “テーブル の した に はいって ください”。",
    lines: [
      { who: "A", jp: "じしん です！", es: "¡Terremoto!" },
      { who: "B", jp: "テーブル の した に はいって ください。", es: "Métase bajo la mesa, por favor." },
      { who: "A", jp: "あんぜんな ばしょ に ひなん しましょう。", es: "Vamos a un lugar seguro." },
      { who: "B", jp: "けが は ありませんか。", es: "¿Tiene alguna herida?" },
    ],
  },
];

function playDialogue(lines: Line[]) {
  // encadena línea por línea
  const queue = [...lines];
  const sayNext = () => {
    const l = queue.shift();
    if (!l) return;
    Speech.speak(l.jp, {
      language: "ja-JP",
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
      onDone: () => sayNext(),
    });
  };
  Speech.stop();
  sayNext();
}

function DialogCard({ d }: { d: Dialog }) {
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>{d.title}</Text>
        <Pressable onPress={() => playDialogue(d.lines)} style={styles.speakChip} accessibilityLabel="Reproducir diálogo completo">
          <Ionicons name="play-outline" size={16} color="#3b2f2f" />
        </Pressable>
      </View>
      {d.hint ? <Text style={styles.hint}>{d.hint}</Text> : null}
      {d.lines.map((l, i) => (
        <View key={i} style={styles.lineRow}>
          <Text style={[styles.bubbleWho, l.who === "A" ? styles.whoA : styles.whoB]}>{l.who}</Text>
          <View style={styles.lineBubble}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text style={styles.lineJP}>{l.jp}</Text>
              <Pressable onPress={() => speakJP(l.jp)} style={styles.playBtnSm} accessibilityLabel="Escuchar línea">
                <Ionicons name="volume-high-outline" size={14} color="#3b2f2f" />
              </Pressable>
            </View>
            <Text style={styles.lineES}>{l.es}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   🧩 Arma la oración (tap-to-order)
   ========================================================= */
type BuildItem = { id: string; tokens: string[]; answer: string[]; hintES: string };
const BUILD_ITEMS: BuildItem[] = [
  { id: "b1", tokens: ["けいさつ", "ください", "を", "よんで"], answer: ["けいさつ", "を", "よんで", "ください"], hintES: "Llame a la policía, por favor." },
  { id: "b2", tokens: ["きゅうきゅうしゃ", "ください", "を", "よんで"], answer: ["きゅうきゅうしゃ", "を", "よんで", "ください"], hintES: "Llame a la ambulancia, por favor." },
  { id: "b3", tokens: ["びょういん", "どこ", "です", "か", "は"], answer: ["びょういん", "は", "どこ", "です", "か"], hintES: "¿Dónde está el hospital?" },
  { id: "b4", tokens: ["さいふ", "なくしました", "を"], answer: ["さいふ", "を", "なくしました"], hintES: "Perdí la cartera." },
  { id: "b5", tokens: ["にほんご", "すこし", "しか", "わかりません"], answer: ["にほんご", "が", "すこし", "しか", "わかりません"], hintES: "Entiendo solo un poco de japonés." },
  { id: "b6", tokens: ["かじ", "です"], answer: ["かじ", "です"], hintES: "¡Fuego!" },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SentenceBuilder({ item }: { item: BuildItem }) {
  const [pool, setPool] = useState<string[]>(() => shuffle(item.tokens));
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<"idle" | "ok" | "bad">("idle");

  function choose(tok: string, i: number) {
    setResult("idle");
    const p = [...pool]; p.splice(i, 1);
    setPool(p);
    setPicked([...picked, tok]);
  }
  function remove(i: number) {
    setResult("idle");
    const p = [...picked]; const tok = p.splice(i, 1)[0];
    setPicked(p);
    setPool([...pool, tok]);
  }
  function check() {
    const ok = picked.join(" ") === item.answer.join(" ");
    setResult(ok ? "ok" : "bad");
    if (ok) speakJP(picked.join(" "));
  }
  function reset() {
    setPool(shuffle(item.tokens));
    setPicked([]);
    setResult("idle");
  }

  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="construct-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>Arma la oración</Text>
      </View>
      <Text style={styles.hint}>Pista: {item.hintES}</Text>

      <Text style={styles.sbTitle}>Tu oración</Text>
      <View style={styles.chipsRow}>
        {picked.length === 0 ? <Text style={{ opacity: 0.6 }}>— (toca las piezas) —</Text> : null}
        {picked.map((t, i) => (
          <Pressable key={`p${i}`} onPress={() => remove(i)} style={styles.chipPicked}>
            <Text style={styles.chipTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sbTitle}>Piezas</Text>
      <View style={styles.chipsRow}>
        {pool.map((t, i) => (
          <Pressable key={`c${i}`} onPress={() => choose(t, i)} style={styles.chip}>
            <Text style={styles.chipTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={check} style={styles.btn}>
          <Text style={styles.btnTxt}>Comprobar</Text>
        </Pressable>
        <Pressable onPress={reset} style={styles.btnGhost}>
          <Text style={styles.btnGhostTxt}>Reiniciar</Text>
        </Pressable>
      </View>

      {result === "ok" && <Text style={styles.good}>✔ ¡Correcto!</Text>}
      {result === "bad" && <Text style={styles.bad}>✖ Revisa el orden.</Text>}
    </View>
  );
}

/* =========================================================
   ☎️ Números de emergencia en Japón
   ========================================================= */
function EmergencyNumbers() {
  return (
    <View style={s.box}>
      <View style={styles.cardHeader}>
        <Ionicons name="call-outline" size={18} color="#3b2f2f" />
        <Text style={styles.cardTitle}>Números de emergencia en Japón</Text>
      </View>
      <View style={styles.numRow}>
        <Text style={styles.numBadge}>110</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.numTitle}>Policía（けいさつ）</Text>
          <Text style={styles.numTxt}>Robo, pérdida, pelea, accidente leve.</Text>
          <Pressable onPress={() => speakJP("ひじょう です。けいさつ を おねがい します。")} style={styles.speakChip}>
            <Text style={styles.numSpeak}>ひじょう です。けいさつ を おねがい します。 🔊</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.numRow}>
        <Text style={[styles.numBadge, { backgroundColor: "#e64c3c" }]}>119</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.numTitle}>Ambulancia・Bomberos（きゅうきゅう／しょうぼう）</Text>
          <Text style={styles.numTxt}>Incendio, emergencia médica, accidentes graves.</Text>
          <Pressable onPress={() => speakJP("きゅうきゅうしゃ を おねがい します。ばしょ は ここ です。")} style={styles.speakChip}>
            <Text style={styles.numSpeak}>きゅうきゅうしゃ を おねがい します。ばしょ は ここ です。 🔊</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   🖼️ Pantalla principal
   ========================================================= */
export default function B6_Emergencias() {
  useEffect(() => {
    return () => { void Speech.stop(); }; // cleanup sin Promise
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <PrettyBG />
      <ScrollView contentContainerStyle={s.c} nestedScrollEnabled>
        <View style={s.header}>
          <Text style={s.kicker}>🚑 Emergencias</Text>
          <Text style={s.h}>Frases, diálogos y práctica para actuar rápido</Text>
          <Text style={s.sub}>Vocabulario en hiragana/kana (estilo N5) y audio nativo del sistema.</Text>
        </View>

        {/* Frases clave */}
        <View style={s.box}>
          <Text style={s.b}>🗣️ Frases clave</Text>
          {FRASES.map((f, i) => <Phrase key={i} jp={f.jp} es={f.es} />)}
        </View>

        {/* Números de emergencia */}
        <EmergencyNumbers />

        {/* 5 diálogos */}
        {DIALOGS.map((d, i) => <DialogCard key={i} d={d} />)}

        {/* Armar oraciones (6 retos) */}
        {BUILD_ITEMS.map((b) => <SentenceBuilder key={b.id} item={b} />)}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   🎨 Estilos
   ========================================================= */
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
  bgEmoji: { fontSize: 34 },

  phraseRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  phraseJP: { fontSize: 16, fontWeight: "800", color: INK },
  phraseES: { fontSize: 14, opacity: 0.9, color: INK },
  playBtn: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  playBtnSm: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  /* Dialogs */
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: INK, flex: 1 },
  hint: { fontSize: 12, color: INK, opacity: 0.9, marginBottom: 6 },
  lineRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  bubbleWho: { width: 22, height: 22, borderRadius: 11, textAlign: "center", lineHeight: 22, fontWeight: "900", color: "white" },
  whoA: { backgroundColor: "#3b82f6" }, // azul
  whoB: { backgroundColor: "#f97316" }, // naranja
  lineBubble: { flex: 1, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 8 },
  lineJP: { fontWeight: "800", color: INK },
  lineES: { color: INK, opacity: 0.95 },

  /* Builder */
  sbTitle: { fontWeight: "800", color: INK, marginTop: 6 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, backgroundColor: "white",
    paddingVertical: 6, paddingHorizontal: 10,
  },
  chipPicked: {
    borderWidth: 1, borderColor: "#5cb85c", borderRadius: 999, backgroundColor: "rgba(92,184,92,0.10)",
    paddingVertical: 6, paddingHorizontal: 10,
  },
  chipTxt: { fontWeight: "800", color: INK },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  btnTxt: { fontWeight: "800" },
  btnGhost: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "transparent",
  },
  btnGhostTxt: { fontWeight: "800", opacity: 0.8 },
  good: { marginTop: 6, fontWeight: "900", color: "#0a7a0a" },
  bad: { marginTop: 6, fontWeight: "900", color: "#8a0b0b" },

  /* Numbers */
  numRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  numBadge: {
    width: 48, height: 48, borderRadius: 12, textAlign: "center", lineHeight: 48, fontWeight: "900",
    backgroundColor: "#2563eb", color: "white", fontSize: 18,
  },
  numTitle: { fontWeight: "800", color: INK },
  numTxt: { color: INK },
  speakChip: {
    marginTop: 4,
    borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8,
    alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.95)",
  },
  numSpeak: { fontWeight: "800", color: INK },
});
