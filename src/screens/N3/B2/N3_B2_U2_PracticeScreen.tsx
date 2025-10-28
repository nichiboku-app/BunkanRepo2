// src/screens/N3/B2/N3_B2_U2_PracticeScreen.tsx
// BLOQUE 2 — 02 Opinión y deducción（そうだ・らしい）— PRÁCTICA
// Hero: assets/images/n3/b2_u2.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ✅ Ruta del hook (desde src/screens/N3/B2 → subir 3 niveles)
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B2_U2: undefined | { from?: string };
  N3_B2_U2_Practice: undefined | { from?: "N3_B2_U2" };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B2_U2_Practice">;

type Ex = { jp: string; romaji: string; es: string };
type Q = { id: number; stem: string; options: string[]; answer: string; explain: string };
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string };

/* ---------------- Gramática "como en primaria" ---------------- */
/**
 * Idea central:
 *  - （見た目）そうだ  = “Se ve que…” por lo que tú observas ahora (visual/indicios inmediatos).
 *  - （伝聞）そうだ    = “Dicen que…” reportado por una fuente (noticias, alguien, leí).
 *  - らしい            = “Se dice que…”/“al parecer…” rumor o percepción general (no viste tú).
 *
 * Formas (cómo se unen):
 *  A) （見た目）そうだ  ← aspecto/apariencia
 *     - いAdj（−い） →  い を消す + そうだ　　　例）おいし**い** → おいし**そうだ**
 *       ※ いい → よさそうだ　／　ない系 → なさそうだ（例：高くな**い** → 高くな**さそうだ**）
 *     - なAdj        → そのまま + そうだ　　　例）元気 → 元気そうだ
 *     - V-ます形（−ます）→ ますを消す + そうだ  例）降り**ます** → 降り**そうだ**
 *       ※ する→しそうだ／来る→来そうだ／転ぶ→転びそうだ
 *
 *  B) （伝聞）そうだ  ← fuente externa (“según…/dicen que…”)
 *     - 普通形 + そうだ
 *       Verbo(普通形)／いAdj(普通形)／なAdj(だ)／名詞(だ) + そうだ
 *       例）ニュースによると、明日は休校**だそうだ**。
 *
 *  C) らしい  ← rumor/rasgo-percepción general (no necesariamente una fuente concreta)
 *     - N／いAdj／なAdj／V(普通形) + らしい
 *       例）彼は関西出身**らしい**。／この店は安い**らしい**。
 *
 * Pistas rápidas:
 *  👀 Si lo deduces por lo que ves ahora → （見た目）そうだ
 *  📰 Si vino de noticias, alguien, leí → （伝聞）そうだ
 *  🗣️ Si es rumor/impresión general     → らしい
 */
const PRIMARIA = {
  definiciones: [
    { tag: "（見た目）そうだ", exp: "‘Se ve que…/parece que…’ por apariencia o indicios visibles ahora. No es rumor." },
    { tag: "（伝聞）そうだ", exp: "‘Dicen que…/según…’ información reportada por otra fuente (noticias, alguien, leí)." },
    { tag: "らしい", exp: "‘Al parecer…/se dice que…’ rumor o percepción general (no necesariamente una fuente concreta)." },
  ],
  pistas: [
    "👀 Aspecto inmediato (nubes negras, cara cansada…) → （見た目）そうだ",
    "📰 Lo dijo alguien/TV/noticia/libro → （伝聞）そうだ",
    "🗣️ Fama/rumor/impresión general → らしい",
  ],
  patrones: [
    "（見た目）そうだ： いAdj(−い)＋そうだ ／ なAdj＋そうだ ／ V-ます(−ます)＋そうだ",
    "（伝聞）そうだ： 普通形（V/Adj/Nだ）＋ そうだ",
    "らしい： N／いAdj／なAdj／V(普通形) ＋ らしい",
  ],
  trucos: [
    "👍 いい → よさそうだ",
    "👍 ない → なさそうだ（高くない → 高くなさそうだ）",
    "👍 する → しそうだ ／ 来る → 来そうだ",
    "⛔ （見た目）そうだ は “今見える状態” に自然",
  ],
};

/* ---------------- Contenido — PRÁCTICA ---------------- */
// 1) そうだ（見た目・様子＝parece por apariencia）
const EX_SOUDA_LOOK: Ex[] = [
  { jp: "空が真っ黒だ。雨が降りそうだ。", romaji: "Sora ga makkuro da. Ame ga furi-sō da.", es: "El cielo está negrísimo. Parece que va a llover." },
  { jp: "そのケーキ、おいしそうだ。", romaji: "Sono kēki, oishi-sō da.", es: "Ese pastel se ve delicioso." },
  { jp: "彼は疲れていそうだ。", romaji: "Kare wa tsukarete i-sō da.", es: "Él parece cansado." },
  { jp: "道がすべりやすい。転びそうだ。", romaji: "Michi ga suberiyasui. Korobi-sō da.", es: "El camino resbala. Parece que me caeré." },
  { jp: "雪が積もりそうだ。", romaji: "Yuki ga tsumori-sō da.", es: "Parece que se acumulará nieve." },
  { jp: "あの雲は嵐になりそうだ。", romaji: "Ano kumo wa arashi ni nari-sō da.", es: "Esas nubes parecen volverse tormenta." },
  { jp: "電池が切れそうだ。", romaji: "Denchi ga kire-sō da.", es: "Parece que la batería está por acabarse." },
];

// 2) そうだ（伝聞＝dicen que / he oído que）
const EX_SOUDA_HEARSAY: Ex[] = [
  { jp: "ニュースによると、明日は休校だそうだ。", romaji: "Nyūsu ni yoru to, ashita wa kyūkō da sō da.", es: "Según las noticias, mañana habrá suspensión de clases." },
  { jp: "彼は来月転勤するそうだ。", romaji: "Kare wa raigetsu tenkin suru sō da.", es: "Dicen que lo transferirán el próximo mes." },
  { jp: "この店、来週オープンするそうだ。", romaji: "Kono mise, raishū ōpun suru sō da.", es: "He oído que esta tienda abrirá la próxima semana." },
  { jp: "先生は今日は来られないそうだ。", romaji: "Sensei wa kyō wa korarenai sō da.", es: "Parece (dicen) que el profe no podrá venir hoy." },
  { jp: "その映画はとても感動的だそうだ。", romaji: "Sono eiga wa totemo kandōteki da sō da.", es: "Dicen que esa película es muy conmovedora." },
  { jp: "あの製品は値上げするそうだ。", romaji: "Ano seihin wa neage suru sō da.", es: "He oído que ese producto subirá de precio." },
  { jp: "駅前に新しい病院ができるそうだ。", romaji: "Ekimae ni atarashii byōin ga dekiru sō da.", es: "Dicen que construirán un hospital frente a la estación." },
];

// 3) らしい（rumor/generalización）
const EX_RASHII: Ex[] = [
  { jp: "彼は南の島で暮らしていたらしい。", romaji: "Kare wa minami no shima de kurashite ita rashii.", es: "Se dice que él vivió en una isla del sur." },
  { jp: "この地域は夏でも涼しいらしい。", romaji: "Kono chiiki wa natsu demo suzushii rashii.", es: "Al parecer, esta zona es fresca incluso en verano." },
  { jp: "あの人は英語が得意らしい。", romaji: "Ano hito wa eigo ga tokui rashii.", es: "Se comenta que esa persona es buena en inglés." },
  { jp: "彼女は猫好きらしい。", romaji: "Kanojo wa neko-zuki rashii.", es: "Parece que a ella le encantan los gatos (se dice)." },
  { jp: "その会社は採用を増やすらしい。", romaji: "Sono kaisha wa saiyō o fuyasu rashii.", es: "Al parecer, esa empresa incrementará contrataciones." },
  { jp: "駅前の店は安いらしい。", romaji: "Ekimae no mise wa yasui rashii.", es: "Se dice que la tienda frente a la estación es barata." },
  { jp: "彼は関西出身らしい。", romaji: "Kare wa Kansai shusshin rashii.", es: "Se dice que él es de Kansai." },
];

/* ---------------- 並び替え（Ordenar） ---------------- */
const ORDERS: OrderQ[] = [
  // originales (3)
  { id: 1, jp: "空が暗い。雨が降りそうだ。", romaji: "Sora ga kurai. Ame ga furi-sō da.", es: "El cielo está oscuro. Parece que va a llover.", tokens: ["空が暗い。","雨が","降り","そうだ。"] },
  { id: 2, jp: "ニュースによると、明日は休校だそうだ。", romaji: "Nyūsu ni yoru to, ashita wa kyūkō da sō da.", es: "Según noticias, mañana hay suspensión.", tokens: ["ニュースによると、","明日は","休校だ","そうだ。"] },
  { id: 3, jp: "あの店は安いらしい。", romaji: "Ano mise wa yasui rashii.", es: "Se dice que esa tienda es barata.", tokens: ["あの店は","安い","らしい。"] },

  // +8 nuevos (id 4–11)
  { id: 4, jp: "その川は深そうだ。", romaji: "Sono kawa wa fuka-sō da.", es: "Ese río se ve profundo.", tokens: ["その川は","深","そうだ。"] },
  { id: 5, jp: "彼は結婚するそうだ。", romaji: "Kare wa kekkon suru sō da.", es: "Dicen que él se casará.", tokens: ["彼は","結婚する","そうだ。"] },
  { id: 6, jp: "この辺は夜は静からしい。", romaji: "Kono hen wa yoru wa shizuka rashii.", es: "Se dice que por aquí en la noche es tranquilo.", tokens: ["この辺は","夜は","静か","らしい。"] },
  { id: 7, jp: "あの子は眠そうだ。", romaji: "Ano ko wa nemu-sō da.", es: "Ese niño parece tener sueño.", tokens: ["あの子は","眠","そうだ。"] },
  { id: 8, jp: "天気予報では、明日は雪だそうだ。", romaji: "Tenki yohō de wa, ashita wa yuki da sō da.", es: "Según el pronóstico, mañana nieva.", tokens: ["天気予報では、","明日は","雪だ","そうだ。"] },
  { id: 9, jp: "彼女は猫アレルギーらしい。", romaji: "Kanojo wa neko arerugī rashii.", es: "Al parecer, ella es alérgica a los gatos.", tokens: ["彼女は","猫アレルギー","らしい。"] },
  { id: 10, jp: "バスがすぐ来そうだ。", romaji: "Basu ga sugu ki-sō da.", es: "Parece que el autobús llega en seguida.", tokens: ["バスが","すぐ","来","そうだ。"] },
  { id: 11, jp: "駅前に新しい図書館ができるそうだ。", romaji: "Ekimae ni atarashii toshokan ga dekiru sō da.", es: "Dicen que construirán una biblioteca frente a la estación.", tokens: ["駅前に","新しい","図書館が","できる","そうだ。"] },
];

/* ---------------- QUIZ（multiple choice） ---------------- */
const QUIZ: Q[] = [
  // originales (1–5)
  { id: 1, stem: "雲が黒い。雨が降り____。", options: ["そうだ（見た目）","そうだ（伝聞）","らしい"], answer: "そうだ（見た目）", explain: "Indicios visibles → そうだ（見た目）" },
  { id: 2, stem: "先生によると、来週テストがある____。", options: ["らしい","そうだ（伝聞）","そうだ（見た目）"], answer: "そうだ（伝聞）", explain: "Fuente externa clara → そうだ（伝聞）" },
  { id: 3, stem: "彼は大阪出身____よ。", options: ["そうだ（見た目）","らしい","そうだ（伝聞）"], answer: "らしい", explain: "Rumor/percepción general → らしい" },
  { id: 4, stem: "そのケーキ、おいし____。", options: ["そうだ（見た目）","らしい","そうだ（伝聞）"], answer: "そうだ（見た目）", explain: "Apariencia (se ve rico) → そうだ（見た目）" },
  { id: 5, stem: "ニュースで、物価が上がる____。", options: ["らしい","そうだ（伝聞）","そうだ（見た目）"], answer: "そうだ（伝聞）", explain: "Lo dijeron en noticias → そうだ（伝聞）" },

  // +8 nuevos (6–13)
  { id: 6, stem: "風が強い。波が高くなり____。", options: ["そうだ（見た目）","らしい","そうだ（伝聞）"], answer: "そうだ（見た目）", explain: "Lo deduces por la apariencia del momento → そうだ（見た目）" },
  { id: 7, stem: "先生によれば、来月から教科書が変わる____。", options: ["らしい","そうだ（伝聞）","そうだ（見た目）"], answer: "そうだ（伝聞）", explain: "Fuente explícita → そうだ（伝聞）" },
  { id: 8, stem: "彼は沖縄出身____よ。", options: ["らしい","そうだ（見た目）","そうだ（伝聞）"], answer: "らしい", explain: "Rumor/impresión general → らしい" },
  { id: 9, stem: "空が明るくなってきた。雨は止み____。", options: ["そうだ（見た目）","らしい","そうだ（伝聞）"], answer: "そうだ（見た目）", explain: "Cambio observable → そうだ（見た目）" },
  { id: 10, stem: "ニュースで、その俳優は結婚した____。", options: ["そうだ（伝聞）","らしい","そうだ（見た目）"], answer: "そうだ（伝聞）", explain: "Lo dicen en las noticias → そうだ（伝聞）" },
  { id: 11, stem: "口コミでは、この店のラーメンはおいしい____。", options: ["らしい","そうだ（見た目）","そうだ（伝聞）"], answer: "らしい", explain: "Comentarios/rumor general → らしい" },
  { id: 12, stem: "あの山道は危な____、気をつけて。", options: ["そうだ（見た目）","らしい","そうだ（伝聞）"], answer: "そうだ（見た目）", explain: "Se ve peligroso por el aspecto → そうだ（見た目）" },
  { id: 13, stem: "市役所の人の話では、来週から手続きが簡単になる____。", options: ["そうだ（伝聞）","らしい","そうだ（見た目）"], answer: "そうだ（伝聞）", explain: "Reporte directo de fuente externa → そうだ（伝聞）" },
];

/* ---------------- Kanji de esta unidad ---------------- */
const KANJI: Kanji[] = [
  { hex: "4f1d", char: "伝", gloss: "transmitir/trasladar", sample: "伝える（つたえる）" },
  { hex: "4fe1", char: "信", gloss: "creer/confianza", sample: "信じる（しんじる）" },
  { hex: "4e88", char: "予", gloss: "pre-/anticipar", sample: "予想（よそう）" },
  { hex: "5831", char: "報", gloss: "reportar", sample: "報道（ほうどう）" },
  { hex: "8aac", char: "説", gloss: "explicar/afirmar", sample: "説（せつ）" },
  { hex: "610f", char: "意", gloss: "intención/opinión", sample: "意見（いけん）" },
  { hex: "63a8", char: "推", gloss: "inferir/empujar", sample: "推測（すいそく）" },
  { hex: "5b9a", char: "定", gloss: "decidir/fijar", sample: "決定（けってい）" },
  { hex: "65ad", char: "断", gloss: "cortar/decidir", sample: "判断（はんだん）" },
  { hex: "8a71", char: "話", gloss: "habla/relato", sample: "話（はなし）" },
];

/* ---------------- Helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [open]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  return rotate;
}

/* ---------------- Screen ---------------- */
export default function N3_B2_U2_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  // Toggles
  const [openSoudaLook, setOpenSoudaLook] = useState(true);
  const [openSoudaHear, setOpenSoudaHear] = useState(false);
  const [openRashii, setOpenRashii] = useState(false);

  const r1 = useChevron(openSoudaLook);
  const r2 = useChevron(openSoudaHear);
  const r3 = useChevron(openRashii);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b2_u2.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 2 — Práctica</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>そうだ（見た目/伝聞）</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>らしい</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática como en primaria */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Gramática como en primaria</Text>

          <Text style={styles.h3}>Definiciones rápidas</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}>
              <Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Cómo se une (reglas cortas)</Text>
          {PRIMARIA.patrones.map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}

          <Text style={styles.h3}>Trucos útiles</Text>
          {PRIMARIA.trucos.map((t, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{t}</Text></View>
          ))}

          <Text style={styles.h3}>Pistas para elegir</Text>
          {PRIMARIA.pistas.map((s, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>
          ))}
        </View>

        {/* 🗣️ Ejemplos (toggles) */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos para escuchar y leer</Text>

          {/* そうだ（見た目） */}
          <Pressable onPress={() => setOpenSoudaLook(!openSoudaLook)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) そうだ（parece por apariencia）</Text>
            <Animated.View style={{ transform: [{ rotate: r1 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openSoudaLook && EX_SOUDA_LOOK.map((ex, i) => (
            <View key={`sl-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          {/* そうだ（伝聞） */}
          <Pressable onPress={() => setOpenSoudaHear(!openSoudaHear)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) そうだ（dicen que / he oído que）</Text>
            <Animated.View style={{ transform: [{ rotate: r2 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openSoudaHear && EX_SOUDA_HEARSAY.map((ex, i) => (
            <View key={`sh-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          {/* らしい */}
          <Pressable onPress={() => setOpenRashii(!openRashii)} style={styles.toggleHeader}>
            <Text style={styles.h3}>3) らしい（rumor / generalización）</Text>
            <Animated.View style={{ transform: [{ rotate: r3 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openRashii && EX_RASHII.map((ex, i) => (
            <View key={`rs-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 🧩 ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
          {ORDERS.map((o) => (<OrderQuestion key={o.id} q={o} onCorrect={playCorrect} />))}
        </View>

        {/* ✅ QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Practica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => (
            <QuizItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver el orden; toca el altavoz para escuchar el compuesto.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function OrderQuestion({ q, onCorrect }: { q: OrderQ; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<null | boolean>(null);
  const pool = useRef<string[]>([...q.tokens].sort(() => Math.random() - 0.5)).current;

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const onPick = (t: string) => {
    if (done !== null) return;
    const arr = [...picked, t];
    setPicked(arr);
    if (arr.length === q.tokens.length) {
      const ok = arr.join("") === q.tokens.join("");
      setDone(ok);
      if (ok) onCorrect();
    }
  };

  const undo = () => { if (done !== null) return; setPicked((a) => a.slice(0, -1)); };
  const reset = () => { setPicked([]); setDone(null); };

  const border = done === null ? "rgba(0,0,0,0.08)" : done ? "#10B981" : "#EF4444";
  const bg = done === null ? "transparent" : done ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)";
  const col = done === null ? "#0E1015" : done ? "#0f9a6a" : "#c62828";

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.p}>{q.es}</Text>
      <View style={[styles.answerBox, { borderColor: border, backgroundColor: bg }]}>
        <Text style={[styles.jp, { color: col }]}>{picked.join("") || "　"}</Text>
      </View>
      <View style={styles.tokenRow}>
        {pool.map((t, i) => (
          <Pressable key={i} onPress={() => onPick(t)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={undo} style={styles.kBtn}><Text style={styles.kBtnTxt}>Deshacer</Text></Pressable>
        <Pressable onPress={reset} style={styles.kBtn}><Text style={styles.kBtnTxt}>Reiniciar</Text></Pressable>
        <Pressable onPress={() => speakJa(q.jp)} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
      {done !== null && (
        <Text style={[styles.gray, { marginTop: 6 }]}>
          <Text style={styles.bold}>Solución: </Text>{q.jp}（{q.romaji}）
        </Text>
      )}
    </View>
  );
}

function QuizItem({ q, idx, onResult }: { q: Q; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const optStyle = (op: string) => {
    const pickedNow = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : pickedNow ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : pickedNow ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && pickedNow ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === q.answer);
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{q.explain}</Text>}
    </View>
  );
}

function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);

  // ✅ Mapa a *_nums.webp (trazos + números)
  const REQ: Record<string, any> = {
   "4f1d": require("../../../../assets/kanjivg/n3/4f1d_nums.webp"),
  "4fe1": require("../../../../assets/kanjivg/n3/4fe1_nums.webp"),
  "4e88": require("../../../../assets/kanjivg/n3/4e88_nums.webp"),
  "5831": require("../../../../assets/kanjivg/n3/5831_nums.webp"),
  "8aac": require("../../../../assets/kanjivg/n3/8aac_nums.webp"),
  "610f": require("../../../../assets/kanjivg/n3/610f_nums.webp"),
    "63a8": require("../../../../assets/kanjivg/n3/63a8_nums.webp"),
    "5b9a": require("../../../../assets/kanjivg/n3/5b9a_nums.webp"),
    "65ad": require("../../../../assets/kanjivg/n3/65ad_nums.webp"),
    "8a71": require("../../../../assets/kanjivg/n3/8a71_nums.webp"),
     "60f3": require("../../../../assets/kanjivg/n3/60f3.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage
            source={src}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            // cachePolicy="none" // <- usar temporalmente si quieres evitar caché durante pruebas
          />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke((s) => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={onSpeak} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015", marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "900", color: "#0E1015", marginTop: 2, marginBottom: 6 },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },
  codeBlock: { backgroundColor: "#0b0c0f", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  code: { color: "#fff", fontWeight: "800", marginBottom: 4 },

  liDot: { marginTop: 4 },

  toggleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },
});
