// 🌀 BLOQUE 3 — 1 Condicionales I（〜ば・〜たら・なら）— PRÁCTICA
// Hero: assets/images/n3/b3_u1.webp

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
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import "react-native-gesture-handler";

import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types ---------------- */
type RootStackParamList = {
  N3_B3_U1_Practice: undefined | { from?: string };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B3_U1_Practice">;

type Quiz = {
  id: number;
  stem: string;
  options: string[];
  answer: string;
  jp_full: string;
  es: string;
  why: string;
};

type Fill = {
  id: number;
  hint: string;
  jp_base: string;
  answer: string;
  jp_full: string;
  es: string;
  why: string;
};

type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

/* ---------------- Tabla de gramática (compacta) ---------------- */
type Row = { base: string; ba: string; tara: string; nara: string; uso: string };
const GRAM_TABLE: Row[] = [
  { base: "G1（読む）", ba: "読めば／読まなければ", tara: "読んだら／読まなかったら", nara: "—", uso: "regla/tendencia → 〜ば ; secuencia/descubrimiento → 〜たら" },
  { base: "G2（食べる）", ba: "食べれば／食べなければ", tara: "食べたら／食べなかったら", nara: "—", uso: "igual que arriba" },
  { base: "G3（する）", ba: "すれば／しなければ", tara: "したら／しなかったら", nara: "—", uso: "consejo: 〜ばいい" },
  { base: "G3（来る）", ba: "くれば／こなければ", tara: "きたら／こなかったら", nara: "—", uso: "evento tras llegada → 〜たら" },
  { base: "Adj.い（高い）", ba: "高ければ／高くなければ", tara: "高かったら／高くなかったら", nara: "—", uso: "**いい→よければ / よかったら**（cortés general vs. invitación concreta）" },
  { base: "Adj.な（便利）", ba: "便利なら（＝であれば）／便利でなければ", tara: "便利だったら／便利じゃなかったら", nara: "便利なら", uso: "tema-condicional: ‘si es el caso de…’ → 〜なら" },
  { base: "Sust.（学生）", ba: "学生なら（＝であれば）／学生でなければ", tara: "学生だったら／学生じゃなかったら", nara: "学生なら", uso: "anclar tema: ‘si hablamos de…’" },
  { base: "Uso preferente", ba: "reglas/causa-efecto, manuales, condiciones generales", tara: "‘cuando/si sucede A, luego B’, sorpresa/descubrimiento", nara: "condición temática (‘si X, entonces…’)", uso: "resumen rápido" },
];

/* ---------------- Gramática detallada (datos) ---------------- */
type MiniRow = { etiqueta: string; forma: string; ejemplo: string };
const FORM_BA: MiniRow[] = [
  { etiqueta: "G1 (u→e)+ば", forma: "書く→書けば / 読む→読めば", ejemplo: "読めば分かる。（Si lo lees, entiendes.）" },
  { etiqueta: "G2 (辞書形)+れば", forma: "食べる→食べれば / 見る→見れば", ejemplo: "食べれば元気になる。（Si comes, recuperas energía.）" },
  { etiqueta: "G3", forma: "する→すれば / 来る→くれば", ejemplo: "準備すれば大丈夫。（Si te preparas, estás bien.）" },
  { etiqueta: "Negativo", forma: "〜ない→〜なければ", ejemplo: "時間がなければ行けない。（Si no hay tiempo, no puedo ir.）" },
  { etiqueta: "Adj.い", forma: "高い→高ければ / 高くなければ", ejemplo: "安ければ買う。（Si es barato, compro.）" },
  { etiqueta: "Adj.な / Sust.", forma: "便利なら / 学生なら（＝であれば）", ejemplo: "静かなら勉強できる。（Si está tranquilo, se puede estudiar.）" },
];

const FORM_TARA: MiniRow[] = [
  { etiqueta: "Pasado + ら", forma: "読む→読んだら / 行く→行ったら", ejemplo: "家に着いたら連絡する。（Cuando llegue a casa, aviso.）" },
  { etiqueta: "Negativo pasado", forma: "〜なかったら", ejemplo: "雨が降らなかったら行く。（Si no llueve, voy.）" },
  { etiqueta: "Adj.い", forma: "高い→高かったら / 高くなかったら", ejemplo: "安かったら買う。（Si fue/está barato, compro.）" },
  { etiqueta: "Adj.な / Sust.", forma: "便利だったら / 学生だったら", ejemplo: "学生だったら無料。（Si eres estudiante, gratis.）" },
];

const USO_CLAVE: { caso: string; preferir: string; nota: string; jp?: string; es?: string }[] = [
  { caso: "Reglas / causa-efecto general", preferir: "〜ば", nota: "manuales, relaciones mecánicas", jp:"押せば開きます。", es:"Si presionas, se abre." },
  { caso: "Secuencia puntual / después de A, B", preferir: "〜たら", nota: "evento completado → acción siguiente", jp:"着いたら電話します。", es:"Cuando llegue, llamo." },
  { caso: "Descubrimiento / sorpresa", preferir: "〜たら", nota: "ば no sirve para ‘me encontré con…’", jp:"開けたら誰もいなかった。", es:"Al abrir, no había nadie." },
  { caso: "Tema-condición ‘si es el caso de…’", preferir: "〜なら", nota: "ancla el tema/escenario", jp:"日本人なら漢字が読めますか。", es:"Si eres japonés, ¿lees kanji?" },
  { caso: "Sugerencia", preferir: "〜ばいい／〜たらどう", nota: "consejo: すればいい； invitación amable: 〜たらどう", jp:"もっと練習すればいい。", es:"Te vendría bien practicar." },
  { caso: "Peticiones / invitaciones", preferir: "〜たら／〜なら", nota: "ば + imperativo suena raro; usa 〜て, 〜たら／なら", jp:"よかったら来てください。", es:"Si te va, ven por favor." },
];

const YOI_DIF: { forma: string; uso: string; ejemplo: string }[] = [
  { forma: "よければ（良ければ）", uso: "cortés/general; ‘si le parece bien’", ejemplo: "よければ、ここに座ってください。" },
  { forma: "よかったら（良かったら）", uso: "invitación concreta/cercana", ejemplo: "よかったら、一緒に行きませんか。" },
];

const PITFALLS: string[] = [
  "‘Descubrimiento/sorpresa’ requiere 〜たら. ❌ ば",
  "Para pedir algo, evita ば + imperativo: usa 〜てください／〜たら／〜なら。",
  "〜なら presenta un ‘si hablamos de X…’ (tema); no siempre implica causa-efecto.",
  "Negativos condicionales: 〜なければ（general), 〜なかったら（escena puntual/condición concreta).",
  "Voluntad/plan del hablante encaja mejor con 〜たら／〜なら que con 〜ば.",
];

/* ---------------- PRÁCTICAS ---------------- */
const PRACTICE: Quiz[] = [
  { id: 1, stem: "明日、晴れ＿＿、ピクニックに行こう。", options: ["れば","たら"], answer: "たら", jp_full: "明日、晴れたら、ピクニックに行こう。", es: "Si mañana está despejado, vayamos de picnic.", why: "Secuencia concreta (A luego B) → 〜たら." },
  { id: 2, stem: "ボタンを押せ＿＿、ドアが開きます。", options: ["ば","たら"], answer: "ば", jp_full: "ボタンを押せば、ドアが開きます。", es: "Si presionas el botón, la puerta se abre.", why: "Relación mecánica/regla → 〜ば." },
  { id: 3, stem: "安けれ＿＿、買います。", options: ["ば","たら"], answer: "ば", jp_full: "安ければ、買います。", es: "Si es barato, lo compro.", why: "Condición general sobre precio → 〜ば." },
  { id: 4, stem: "家に着い＿＿、連絡します。", options: ["たら","ば"], answer: "たら", jp_full: "家に着いたら、連絡します。", es: "Cuando llegue a casa, te contacto.", why: "A terminado → luego B → 〜たら." },
  { id: 5, stem: "時間がなけれ＿＿、行けません。", options: ["ば","たら"], answer: "ば", jp_full: "時間がなければ、行けません。", es: "Si no tengo tiempo, no puedo ir.", why: "Negativo condicional general → 〜なければ." },
  { id: 6, stem: "ドアを開け＿＿、誰もいなかった。", options: ["たら","ば"], answer: "たら", jp_full: "ドアを開けたら、誰もいなかった。", es: "Al abrir la puerta, no había nadie.", why: "Descubrimiento → 〜たら." },
  { id: 7, stem: "もっと勉強すれ＿＿、合格できるよ。", options: ["ば","たら"], answer: "ば", jp_full: "もっと勉強すれば、合格できるよ。", es: "Si estudias más, podrás aprobar.", why: "Consejo/regla → 〜ば." },
  { id: 8, stem: "日本人＿＿、漢字が読めますか。", options: ["なら","であれば"], answer: "なら", jp_full: "日本人なら、漢字が読めますか。", es: "Si eres japonés, ¿puedes leer kanji?", why: "Tema-condicional → なら." },
  { id: 9, stem: "このボタンを押し＿＿、電源が切れます。", options: ["たら","ば"], answer: "たら", jp_full: "このボタンを押したら、電源が切れます。", es: "Si pulsas este botón, se apaga la energía.", why: "Acción concreta → efecto después → 〜たら." },
  { id: 10, stem: "よ＿＿、ここに座ってください。", options: ["ければ","かったら"], answer: "ければ", jp_full: "よければ、ここに座ってください。", es: "Si le parece bien, siéntese aquí.", why: "Cortés/general → よければ." },
  { id: 11, stem: "よ＿＿、後で一緒に行きませんか。", options: ["ければ","かったら"], answer: "かったら", jp_full: "よかったら、後で一緒に行きませんか。", es: "Si te va bien, ¿vamos juntos después?", why: "Invitación concreta/cercana → よかったら." },
  { id: 12, stem: "静か＿＿、ここで勉強できます。", options: ["なら","でなければ"], answer: "なら", jp_full: "静かなら、ここで勉強できます。", es: "Si está tranquilo, se puede estudiar aquí.", why: "な-adj + なら." },
  { id: 13, stem: "雨が降ら＿＿、試合は続けます。", options: ["なければ","なかったら"], answer: "なければ", jp_full: "雨が降らなければ、試合は続けます。", es: "Si no llueve, continuamos el partido.", why: "Regla/condición general → 〜なければ." },
  { id: 14, stem: "問題があっ＿＿、連絡してください。", options: ["たら","ば"], answer: "たら", jp_full: "問題があったら、連絡してください。", es: "Si hay algún problema, por favor avise.", why: "Aviso para posible situación → 〜たら natural." },
];

const EXTRA_A: Fill[] = [
  { id: 1, hint: "G1 〜ば", jp_base: "急げ____、まだ間に合います。", answer: "ば", jp_full: "急げば、まだ間に合います。", es: "Si te apuras, aún llegas a tiempo.", why: "急ぐ→急げ＋ば（u→e）" },
  { id: 2, hint: "G2 〜たら", jp_base: "終わっ____、教えてください。", answer: "たら", jp_full: "終わったら、教えてください。", es: "Cuando termines, avísame.", why: "Secuencia たら." },
  { id: 3, hint: "Neg. 〜なければ", jp_base: "お金が足り____、買えません。", answer: "なければ", jp_full: "お金が足りなければ、買えません。", es: "Si no alcanza el dinero, no puedo comprar.", why: "足りない→足りなければ" },
  { id: 4, hint: "Adj.い ければ", jp_base: "この道が近____、ここを通りましょう。", answer: "ければ", jp_full: "この道が近ければ、ここを通りましょう。", es: "Si este camino es más corto, pasemos por aquí.", why: "い→ければ" },
  { id: 5, hint: "Adj.な なら", jp_base: "静か____、図書館で勉強しよう。", answer: "なら", jp_full: "静かなら、図書館で勉強しよう。", es: "Si está tranquilo, estudiemos en la biblioteca.", why: "な + なら" },
  { id: 6, hint: "Sust. なら", jp_base: "学生____、割引があります。", answer: "なら", jp_full: "学生なら、割引があります。", es: "Si eres estudiante, hay descuento.", why: "Sust. + なら" },
  { id: 7, hint: "する ば", jp_base: "準備をすれ____、すぐ出発できます。", answer: "ば", jp_full: "準備をすれば、すぐ出発できます。", es: "Si te preparas, puedes salir enseguida.", why: "する→すれば" },
  { id: 8, hint: "来る たら", jp_base: "彼が来____、始めましょう。", answer: "たら", jp_full: "彼が来たら、始めましょう。", es: "Cuando él llegue, empecemos.", why: "Secuencia concreta" },
  { id: 9, hint: "Descubrimiento", jp_base: "開け____、中は真っ暗だった。", answer: "たら", jp_full: "開けたら、中は真っ暗だった。", es: "Al abrir, estaba todo oscuro.", why: "Sorpresa/descubrimiento → たら" },
  { id: 10, hint: "Cortesía", jp_base: "____、資料を共有します。", answer: "よければ", jp_full: "よければ、資料を共有します。", es: "Si te parece bien, comparto los materiales.", why: "Cortés/general" },
  { id: 11, hint: "Invitación", jp_base: "____、あとでお茶しませんか。", answer: "よかったら", jp_full: "よかったら、あとでお茶しませんか。", es: "Si te va bien, ¿tomamos té luego?", why: "Invitación concreta" },
  { id: 12, hint: "Neg. たら", jp_base: "連絡が来____、出発しません。", answer: "なかったら", jp_full: "連絡が来なかったら、出発しません。", es: "Si no llega el aviso, no salimos.", why: "Negativo pasado + ら" },
  { id: 13, hint: "G1 ば", jp_base: "読め____、もっと楽しくなるよ。", answer: "ば", jp_full: "読めば、もっと楽しくなるよ。", es: "Si lo lees, se vuelve más divertido.", why: "読む→読めば" },
  { id: 14, hint: "G2 たら", jp_base: "見____、感想を教えてください。", answer: "たら", jp_full: "見たら、感想を教えてください。", es: "Cuando lo veas, dime tu impresión.", why: "Secuencia" },
];

const EXTRA_B: Fill[] = [
  { id: 1, hint: "ば", jp_base: "行け____、行きます。", answer: "ば", jp_full: "行けば、行きます。", es: "Si puedo ir, voy.", why: "行く→行えば ❌; correcto: 行く→行けば（u→e）" },
  { id: 2, hint: "たら", jp_base: "着い____、電話します。", answer: "たら", jp_full: "着いたら、電話します。", es: "Cuando llegue, llamo.", why: "Secuencia simple" },
  { id: 3, hint: "ければ", jp_base: "安____、買います。", answer: "ければ", jp_full: "安ければ、買います。", es: "Si es barato, compro.", why: "Adj.い → ければ" },
  { id: 4, hint: "なら", jp_base: "学生____、入場無料です。", answer: "なら", jp_full: "学生なら、入場無料です。", es: "Si eres estudiante, entras gratis.", why: "Sust. + なら" },
  { id: 5, hint: "なければ", jp_base: "雨が降ら____、行きます。", answer: "なければ", jp_full: "雨が降らなければ、行きます。", es: "Si no llueve, voy.", why: "Neg. condicional" },
  { id: 6, hint: "たら", jp_base: "終わっ____、帰ります。", answer: "たら", jp_full: "終わったら、帰ります。", es: "Cuando termine, vuelvo.", why: "Secuencia" },
  { id: 7, hint: "すれば", jp_base: "練習____、上手になります。", answer: "すれば", jp_full: "練習すれば、上手になります。", es: "Si practicas, mejoras.", why: "する→すれば" },
  { id: 8, hint: "よければ", jp_base: "____、ここで待ってください。", answer: "よければ", jp_full: "よければ、ここで待ってください。", es: "Si te parece bien, espera aquí.", why: "Cortés/general" },
  { id: 9, hint: "よかったら", jp_base: "____、一緒にどう？", answer: "よかったら", jp_full: "よかったら、一緒にどう？", es: "Si te va bien, ¿vamos juntos?", why: "Invitación casual" },
  { id: 10, hint: "なら", jp_base: "時間がある____、手伝います。", answer: "なら", jp_full: "時間があるなら、手伝います。", es: "Si hay tiempo, ayudo.", why: "Tema-condicional" },
  { id: 11, hint: "たら", jp_base: "会え____、うれしいです。", answer: "たら", jp_full: "会えたら、うれしいです。", es: "Si pudiera verte, me alegraría.", why: "Hipótesis amable" },
  { id: 12, hint: "ば", jp_base: "飲め____、飲んでください。", answer: "ば", jp_full: "飲めば、飲んでください。", es: "Si puedes beberlo, tómalo.", why: "飲む→飲めば" },
  { id: 13, hint: "たら", jp_base: "分かっ____、教えて。", answer: "たら", jp_full: "分かったら、教えて。", es: "Si entiendes, dime.", why: "Uso cotidiano" },
  { id: 14, hint: "なかったら", jp_base: "用事が____、行きます。", answer: "なかったら", jp_full: "用事がなかったら、行きます。", es: "Si no tengo nada que hacer, voy.", why: "Neg. pasado + ら" },
];

/* ---------------- Kanji de la lección (10) ---------------- */
const KANJI: Kanji[] = [
  { hex: "5fc5", char: "必", gloss: "necesario", sample: "必要（ひつよう）", strokes: 5 },
  { hex: "6761", char: "条", gloss: "cláusula", sample: "条約（じょうやく）", strokes: 7 },
  { hex: "4ef6", char: "件", gloss: "asunto/caso", sample: "事件（じけん）", strokes: 6 },
  { hex: "56e0", char: "因", gloss: "causa", sample: "原因（げんいん）", strokes: 6 },
  { hex: "679c", char: "果", gloss: "resultado/fruto", sample: "結果（けっか）", strokes: 8 },
  { hex: "5834", char: "場", gloss: "lugar", sample: "場所（ばしょ）", strokes: 12 },
  { hex: "4fbf", char: "便", gloss: "conveniente", sample: "便利（べんり）", strokes: 9 },
  { hex: "697d", char: "楽", gloss: "diversión/fácil", sample: "楽（らく）", strokes: 13 },
  { hex: "6765", char: "来", gloss: "venir", sample: "来る（くる）", strokes: 7 },
  { hex: "884c", char: "行", gloss: "ir/actuar", sample: "行く（いく）", strokes: 6 },
];

/* ---------------- UI helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => { Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start(); }, [open]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
}
const speakJa = (t: string) => Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* ---------------- Screen ---------------- */
export default function N3_B3_U1_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b3_u1.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage source={require("../../../../assets/images/leon_blanco_transparente.webp")} style={styles.heroMark} />
          <Text style={styles.heroTitle}>BLOQUE 3 — Condicionales I（〜ば・〜たら・なら）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>ば</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>たら</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>なら</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática en tabla (resumen) */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Tabla rápida de formación y uso</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, {flex:1.2}]}>Base</Text>
              <Text style={[styles.th, {flex:1.4}]}>〜ば</Text>
              <Text style={[styles.th, {flex:1.4}]}>〜たら</Text>
              <Text style={[styles.th, {flex:0.9}]}>〜なら</Text>
              <Text style={[styles.th, {flex:1.6}]}>Uso típico</Text>
            </View>
            {GRAM_TABLE.map((r, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, {flex:1.2, fontWeight:"800"}]}>{r.base}</Text>
                <Text style={[styles.td, {flex:1.4}]}>{r.ba}</Text>
                <Text style={[styles.td, {flex:1.4}]}>{r.tara}</Text>
                <Text style={[styles.td, {flex:0.9}]}>{r.nara}</Text>
                <Text style={[styles.td, {flex:1.6}]}>{r.uso}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.gray,{marginTop:6}]}>
            Tip: <Text style={styles.bold}>よければ</Text> (cortés/general) vs <Text style={styles.bold}>よかったら</Text> (invitación/escena concreta).
          </Text>
        </View>

        {/* 📚 Gramática detallada (formación + usos) */}
        <View style={styles.card}>
          <Text style={styles.h2}>📚 Gramática detallada</Text>

          <Text style={[styles.bold, {marginTop:6}]}>Formación — 〜ば</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, {flex:1.2}]}>Regla</Text>
              <Text style={[styles.th, {flex:1.4}]}>Forma</Text>
              <Text style={[styles.th, {flex:1.8}]}>Ejemplo</Text>
            </View>
            {FORM_BA.map((r, i)=>(
              <View key={`ba-${i}`} style={styles.tr}>
                <Text style={[styles.td,{flex:1.2,fontWeight:"800"}]}>{r.etiqueta}</Text>
                <Text style={[styles.td,{flex:1.4}]}>{r.forma}</Text>
                <Text style={[styles.td,{flex:1.8}]}>{r.ejemplo}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.bold, {marginTop:10}]}>Formación — 〜たら</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, {flex:1.2}]}>Regla</Text>
              <Text style={[styles.th, {flex:1.4}]}>Forma</Text>
              <Text style={[styles.th, {flex:1.8}]}>Ejemplo</Text>
            </View>
            {FORM_TARA.map((r, i)=>(
              <View key={`tara-${i}`} style={styles.tr}>
                <Text style={[styles.td,{flex:1.2,fontWeight:"800"}]}>{r.etiqueta}</Text>
                <Text style={[styles.td,{flex:1.4}]}>{r.forma}</Text>
                <Text style={[styles.td,{flex:1.8}]}>{r.ejemplo}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.bold, {marginTop:10}]}>¿Cuál uso elijo?</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, {flex:1.2}]}>Caso</Text>
              <Text style={[styles.th, {flex:0.9}]}>Mejor</Text>
              <Text style={[styles.th, {flex:1.6}]}>Nota</Text>
            </View>
            {USO_CLAVE.map((u, i)=>(
              <View key={`uso-${i}`} style={styles.tr}>
                <Text style={[styles.td,{flex:1.2,fontWeight:"800"}]}>{u.caso}</Text>
                <Text style={[styles.td,{flex:0.9}]}>{u.preferir}</Text>
                <Text style={[styles.td,{flex:1.6}]}>{u.nota}{u.jp ? ` 例）${u.jp}（${u.es}）` : ""}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.bold, {marginTop:10}]}>よければ vs よかったら</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, {flex:1}]}>Forma</Text>
              <Text style={[styles.th, {flex:1.4}]}>Uso</Text>
              <Text style={[styles.th, {flex:1.6}]}>Ejemplo</Text>
            </View>
            {YOI_DIF.map((r, i)=>(
              <View key={`yoi-${i}`} style={styles.tr}>
                <Text style={[styles.td,{flex:1,fontWeight:"800"}]}>{r.forma}</Text>
                <Text style={[styles.td,{flex:1.4}]}>{r.uso}</Text>
                <Text style={[styles.td,{flex:1.6}]}>{r.ejemplo}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.bold, {marginTop:10}]}>⚠️ Pitfalls</Text>
          {PITFALLS.map((p, i)=>(
            <View key={`pf-${i}`} style={{marginTop:4}}>
              <Text style={styles.p}>• {p}</Text>
            </View>
          ))}
        </View>

        {/* ✅ PRÁCTICA */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (14)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* ⭐ EXTRA A */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra A — Rellenar (14)</Text>
          {EXTRA_A.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🌱 EXTRA B */}
        <View style={styles.card}>
          <Text style={styles.h2}>🌱 Extra B — Más fácil (14)</Text>
          {EXTRA_B.map((f) => (<FillItem key={f.id} f={f} onResult={(ok)=> ok?playCorrect():playWrong()} />))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver la imagen numerada. El badge muestra el total de trazos.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (<KanjiCard key={k.hex} k={k} />))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function ChoiceItem({ q, idx, onResult }: { q: Quiz; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;
  const pick = (op: string) => { if (done) return; setSel(op); onResult(op === q.answer); };

  const optStyle = (op: string) => {
    const picked = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => pick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>

      {done && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{q.jp_full}</Text>
          <Text style={styles.esSmall}>{q.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{q.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={() => Speech.speak(q.jp_full, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function FillItem({ f, onResult }: { f: Fill; onResult: (ok:boolean)=>void }) {
  const [state, setState] = useState<null | boolean>(null);
  const BANK = ["ば","たら","ければ","なければ","だったら","なら","すれば","くれば","なかったら","よければ","よかったら"];

  const check = (ans: string) => { const ok = ans === f.answer; setState(ok); onResult(ok); };

  const palette = state === null ? { b: "rgba(0,0,0,0.08)", bg: "transparent", col: "#0E1015" }
    : state ? { b: "#10B981", bg: "rgba(16,185,129,.12)", col: "#0f9a6a" }
    : { b: "#EF4444", bg: "rgba(239,68,68,.12)", col: "#c62828" };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.gray}>Pista: {f.hint}</Text>
      <View style={[styles.answerBox, { borderColor: palette.b, backgroundColor: palette.bg }]}>
        <Text style={[styles.jp, { color: palette.col }]}>{f.jp_base.replace("____", "＿＿")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
        {BANK.map((op) => (
          <Pressable key={op} onPress={() => check(op)} style={styles.tokenBtn}><Text style={styles.tokenTxt}>{op}</Text></Pressable>
        ))}
      </ScrollView>

      {state !== null && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{f.jp_full}</Text>
          <Text style={styles.esSmall}>{f.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{f.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={() => Speech.speak(f.jp_full, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function KanjiCard({ k }: { k: Kanji }) {
  const [showStroke, setShowStroke] = useState(false);

  // Asegúrate de que estos archivos existen (ver script PowerShell más abajo)
  const REQ: Record<string, any> = {
    "5fc5": require("../../../../assets/kanjivg/n3/5fc5_nums.webp"),
    "6761": require("../../../../assets/kanjivg/n3/6761_nums.webp"),
    "4ef6": require("../../../../assets/kanjivg/n3/4ef6_nums.webp"),
    "56e0": require("../../../../assets/kanjivg/n3/56e0_nums.webp"),
    "679c": require("../../../../assets/kanjivg/n3/679c_nums.webp"),
    "5834": require("../../../../assets/kanjivg/n3/5834_nums.webp"),
    "4fbf": require("../../../../assets/kanjivg/n3/4fbf_nums.webp"),
    "697d": require("../../../../assets/kanjivg/n3/697d_nums.webp"),
    "6765": require("../../../../assets/kanjivg/n3/6765_nums.webp"),
    "884c": require("../../../../assets/kanjivg/n3/884c_nums.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage source={src} style={{ width: "100%", height: "100%" }} contentFit="contain" />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
        <Text style={styles.kStrokesLine}>Trazos: {k.strokes}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke(s => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={() => Speech.speak(k.sample, { language: "ja-JP", rate: 0.96, pitch: 1.05 })} style={styles.kIconBtn}>
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
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "900", textAlign: "center", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015" },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },

  // Tabla
  table: { marginTop: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  trHead: { backgroundColor: "#0b0c0f" },
  th: { color: "#fff", fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
  td: { paddingHorizontal: 8, paddingVertical: 8, color: "#0E1015" },

  // Quiz
  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explainBox: { backgroundColor: "#F6F7FB", borderRadius: 12, padding: 10, marginTop: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  jpStrong: { fontSize: 15, fontWeight: "900", color: "#0E1015" },
  esSmall: { color: "#374151", marginTop: 2 },
  why: { color: "#1f2330", marginTop: 4 },
  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center", marginTop: 6 },
  inlineBtns: { flexDirection: "row", gap: 8 },

  // Kanji grid
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kStrokesLine: { color: "#6B7280", marginTop: 2 },
  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  strokeBadge: { position: "absolute", right: 8, top: 8, backgroundColor: "#0E1015", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  strokeBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
