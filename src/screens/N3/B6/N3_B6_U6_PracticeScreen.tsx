// src/screens/N3/B6/N3_B6_U6_PracticeScreen.tsx
// B6 — U6 Matizar opiniones y juicios
// 3⿠ Conversaciones y modismos – 「〜わけがない」「〜っけ」 — PRÁCTICA
// Hero: assets/images/n3/b6_u6.webp
// KVG nums: assets/kanjivg/n3/{hex}_nums.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
    Pressable,
    Image as RNImage,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* -------- Types -------- */
type RootStackParamList = { N3_B6_U6_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B6_U6_Practice">;
type Quiz = { id:number; stem:string; options:string[]; answer:string; jp_full:string; es:string; why:string; };
type Fill = { id:number; hint:string; jp_base:string; answer:string; jp_full:string; es:string; why:string; };
type Kanji = { hex:string; char:string; gloss:string; sample:string; strokes:number };

/* -------- Speech helpers -------- */
const speak = async (text: string) => {
  try { if (await Speech.isSpeakingAsync()) await Speech.stop(); } catch {}
  Speech.speak(text, { language:"ja-JP", rate:0.96, pitch:1.05 });
};
const ja = (t:string) => speak(t);

/* -------- Guía -------- */
const GUIA_ES = `💡 Conversaciones y modismos — 「〜わけがない」「〜っけ」

1) 〜わけがない
   • ‘de ninguna manera’, ‘no hay forma de que…’ (negación categórica).
   • 普通形 + わけがない
   例）彼がそんなミスをするわけがない。= No hay forma de que él cometa tal error.

2) 〜っけ
   • Partícula de recuerdo dudoso (‘¿cómo era…?’ / confirmación casual).
   • 普通形 + っけ（habla coloquial）
   例）明日の集合時間、何時だっけ？ = ¿A qué hora era mañana?

Tips:
・「わけがない」 es fuerte; úsalo cuando estás seguro.
・「っけ」 suena casual e íntimo; evita en situaciones muy formales.`;

const GUIA_JA = `💡「〜わけがない」「〜っけ」

① 〜わけがない：強い否定・ありえないという判断。
② 〜っけ：記憶があいまいで確認・回想する時の口語表現。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"Negación categórica", forma:"普通形 + わけがない", tradu:"de ninguna manera", nota:"fuerte/contundente" },
  { patron:"Recuerdo dudoso", forma:"普通形 + っけ", tradu:"¿cómo era…? / ¿era…?", nota:"coloquial" },
];

/* -------- Práctica elegir (8) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"彼が試験でカンニングする（　　　）。", options:["わけがない","っけ"], answer:"わけがない",
    jp_full:"彼が試験でカンニングするわけがない。", es:"No hay forma de que él copie en un examen.", why:"Negación categórica。" },
  { id:2, stem:"明日の集合時間って何時（　　　）？", options:["っけ","わけがない"], answer:"っけ",
    jp_full:"明日の集合時間って何時だっけ？", es:"¿A qué hora era que nos reuníamos mañana?", why:"Recuerdo dudoso → っけ。" },
  { id:3, stem:"こんな値段で本物な（　　　）。", options:["わけがない","っけ"], answer:"わけがない",
    jp_full:"こんな値段で本物なわけがない。", es:"A este precio, no puede ser auténtico.", why:"Imposibilidad rotunda。" },
  { id:4, stem:"その映画、監督は誰（　　　）？", options:["っけ","わけがない"], answer:"っけ",
    jp_full:"その映画、監督は誰だっけ？", es:"Esa película, ¿quién era el director?", why:"Confirmación casual。" },
  { id:5, stem:"彼が約束を破る（　　　）。", options:["わけがない","っけ"], answer:"わけがない",
    jp_full:"彼が約束を破るわけがない。", es:"No hay manera de que él rompa una promesa.", why:"Juicio fuerte basado en confianza。" },
  { id:6, stem:"この単語、スペルはこうだった（　　　）？", options:["っけ","わけがない"], answer:"っけ",
    jp_full:"この単語、スペルはこうだったっけ？", es:"¿Era así la ortografía de esta palabra?", why:"Duda/recuerdo。" },
  { id:7, stem:"昨日も雨だった（　　　）？", options:["っけ","わけがない"], answer:"っけ",
    jp_full:"昨日も雨だったっけ？", es:"¿Ayer también llovió… era así?", why:"Uso típico de っけ con pasado。" },
  { id:8, stem:"彼女が遅刻する（　　　）。いつも早い。", options:["わけがない","っけ"], answer:"わけがない",
    jp_full:"彼女が遅刻するわけがない。いつも早い。", es:"No hay forma de que llegue tarde; siempre llega temprano.", why:"Contraste con evidencia habitual。" },
];

/* -------- Extra rellenar (3) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"‘de ninguna manera’", jp_base:"このサイズで十人入れる____。", answer:"わけがない",
    jp_full:"このサイズで十人入れるわけがない。", es:"De ninguna manera caben diez personas en este tamaño.", why:"Imposibilidad objetiva。" },
  { id:2, hint:"‘¿cómo era…?’", jp_base:"あの店の定休日、何曜日____？", answer:"だっけ",
    jp_full:"あの店の定休日、何曜日だっけ？", es:"¿Qué día cerraba esa tienda?", why:"Recordar un dato." },
  { id:3, hint:"negación categórica", jp_base:"彼が嘘をつく____。", answer:"わけがない",
    jp_full:"彼が嘘をつくわけがない。", es:"No hay manera de que él mienta.", why:"Juicio fuerte." },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"7121", char:"無", gloss:"no / sin", sample:"無理（むり）", strokes:12 },
  { hex:"7406", char:"理", gloss:"razón", sample:"理由（りゆう）", strokes:11 },
  { hex:"8a33", char:"訳", gloss:"explicación", sample:"言い訳（いいわけ）", strokes:11 },
  { hex:"7d76", char:"絶", gloss:"absoluto", sample:"絶対（ぜったい）", strokes:12 },
  { hex:"5bfe", char:"対", gloss:"contra / hacia", sample:"反対（はんたい）", strokes:7 },
  { hex:"7591", char:"疑", gloss:"duda", sample:"疑問（ぎもん）", strokes:14 },
  { hex:"554f", char:"問", gloss:"pregunta", sample:"質問（しつもん）", strokes:11 },
  { hex:"5fd8", char:"忘", gloss:"olvidar", sample:"忘年会（ぼうねんかい）", strokes:7 },
  { hex:"899a", char:"覚", gloss:"recordar", sample:"覚える（おぼえる）", strokes:12 },
  { hex:"8a18", char:"記", gloss:"anotar/registro", sample:"記憶（きおく）", strokes:10 },
];

/* ---- assets (nums) ---- */
const NUMS: Record<string, any> = {
  "7121": require("../../../../assets/kanjivg/n3/7121_nums.webp"),
  "7406": require("../../../../assets/kanjivg/n3/7406_nums.webp"),
  "8a33": require("../../../../assets/kanjivg/n3/8a33_nums.webp"),
  "7d76": require("../../../../assets/kanjivg/n3/7d76_nums.webp"),
  "5bfe": require("../../../../assets/kanjivg/n3/5bfe_nums.webp"),
  "7591": require("../../../../assets/kanjivg/n3/7591_nums.webp"),
  "554f": require("../../../../assets/kanjivg/n3/554f_nums.webp"),
  "5fd8": require("../../../../assets/kanjivg/n3/5fd8_nums.webp"),
  "899a": require("../../../../assets/kanjivg/n3/899a_nums.webp"),
  "8a18": require("../../../../assets/kanjivg/n3/8a18_nums.webp"),
};

/* -------- Pantalla -------- */
export default function N3_B6_U6_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 240;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={{ height: heroH }}>
          <RNImage
            source={require("../../../../assets/images/n3/b6_u6.webp")}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <LinearGradient colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill}/>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>B6 — U6 Matizar opiniones y juicios</Text>
            <Text style={styles.heroSub}>「〜わけがない」「〜っけ」</Text>
            <View style={styles.chipsRow}>
              <Pressable style={styles.chip} onPress={()=>ja("かれ が そんな ミス を する わけが ない")}>
                <Text style={styles.chipTxt}>…するわけがない</Text><MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
              <Pressable style={styles.chip} onPress={()=>ja("あした の しゅうごう じかん なんじ だっけ")}>
                <Text style={styles.chipTxt}>何時だっけ？</Text><MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Guía */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía — Español</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_ES}</Text></View>
          <Text style={[styles.h2, { marginTop:10 }]}>🧭 ガイド — にほんご</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_JA}</Text></View>
        </View>

        {/* Tabla */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Patrones y uso</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th,{flex:1.4}]}>パターン</Text>
              <Text style={[styles.th,{flex:1.6}]}>かたち</Text>
              <Text style={[styles.th,{flex:1.2}]}>意味（ES）</Text>
              <Text style={[styles.th,{flex:1.2}]}>メモ</Text>
            </View>
            {GRAM_TABLE.map((r,i)=>(
              <View key={i} style={styles.tr}>
                <Text style={[styles.td,{flex:1.4, fontWeight:"800"}]}>{r.patron}</Text>
                <Text style={[styles.td,{flex:1.6}]}>{r.forma}</Text>
                <Text style={[styles.td,{flex:1.2}]}>{r.tradu}</Text>
                <Text style={[styles.td,{flex:1.2}]}>{r.nota}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Práctica elegir */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Elige la forma correcta</Text>
          {PRACTICE.map((q, idx) => <ChoiceItem key={q.id} q={q} idx={idx} />)}
        </View>

        {/* Extra rellenar */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Rellenar</Text>
          {EXTRA.map((f)=>(<FillItem key={f.id} f={f} />))}
        </View>

        {/* Kanji */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Pulsa “Trazos” para mostrar el orden.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map(k => <KanjiCard key={k.hex} k={k} />)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* -------- Subcomponentes -------- */
function ChoiceItem({ q, idx }:{ q:Quiz; idx:number }) {
  const [sel, setSel] = useState<string|null>(null);
  const done = sel !== null;
  const pick = (op:string)=>{ if(done) return; setSel(op); };
  const color = (op:string)=>{
    const picked = sel===op, ok = op===q.answer;
    const border = !done ? "rgba(0,0,0,0.08)" : ok ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : ok ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && ok ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border,bg,col };
  };
  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx+1).padStart(2,"0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map(op=>{
          const s=color(op);
          return (
            <Pressable key={op} onPress={()=>pick(op)} style={[styles.optBtn,{ backgroundColor:s.bg, borderColor:s.border }]}>
              <Text style={[styles.optTxt,{ color:s.col }]}>{op}</Text>
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
            <Pressable onPress={()=>ja(q.jp_full)} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function FillItem({ f }:{ f:Fill }) {
  const [state, setState] = useState<null|boolean>(null);
  const BANK = ["わけがない","だっけ"];
  const check = (ans:string)=>{ const ok = ans===f.answer; setState(ok); };
  const palette = state===null
    ? { b:"rgba(0,0,0,0.08)", bg:"transparent", col:"#0E1015" }
    : state ? { b:"#10B981", bg:"rgba(16,185,129,.12)", col:"#0f9a6a" }
            : { b:"#EF4444", bg:"rgba(239,68,68,.12)", col:"#c62828" };
  return (
    <View style={{ marginTop:12 }}>
      <Text style={styles.gray}>Pista: {f.hint}</Text>
      <View style={[styles.answerBox,{ borderColor:palette.b, backgroundColor:palette.bg }]}>
        <Text style={[styles.jp,{ color:palette.col }]}>{f.jp_base.replace(/____/g,"＿＿")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8, marginTop:8 }}>
        {BANK.map(op=>(
          <Pressable key={op} onPress={()=>check(op)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{op}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {state!==null && (
        <View style={styles.explainBox}>
          <Text style={styles.jpStrong}>{f.jp_full}</Text>
          <Text style={styles.esSmall}>{f.es}</Text>
          <Text style={styles.why}><Text style={styles.bold}>Explicación: </Text>{f.why}</Text>
          <View style={styles.inlineBtns}>
            <Pressable onPress={()=>ja(f.jp_full)} style={styles.kIconBtn}>
              <MCI name="volume-high" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function KanjiCard({ k }:{ k:Kanji }) {
  const [showStroke, setShowStroke] = useState(false);
  const hasStroke = Boolean(NUMS[k.hex]);

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {showStroke && hasStroke
          ? <RNImage source={NUMS[k.hex]} style={{ width:"100%", height:"100%" }} resizeMode="contain" />
          : <Text style={styles.kChar}>{k.char}</Text>}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={()=> hasStroke && setShowStroke(s=>!s)} style={[styles.kBtn,{ opacity: hasStroke ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={()=> ja(k.sample)} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* -------- Styles -------- */
const R = 16;
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:"#0B0C0F" },

  heroImg:{ width:"100%", height:"100%" },
  heroContent:{ position:"absolute", left:0, right:0, bottom:16, alignItems:"center" },
  heroTitle:{ color:"#fff", fontSize:18, fontWeight:"900", textAlign:"center", textShadowColor:"rgba(0,0,0,.75)", textShadowRadius:10 },
  heroSub:{ color:"#ffe29a", marginTop:2, fontWeight:"700" },

  chipsRow:{ flexDirection:"row", gap:8, marginTop:6, flexWrap:"wrap", justifyContent:"center" },
  chip:{ flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:999, backgroundColor:"rgba(255,255,255,0.22)", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" },
  chipTxt:{ color:"#fff", fontWeight:"800" },

  card:{ marginHorizontal:16, marginTop:12, backgroundColor:"#fff", borderRadius:R, padding:14, borderWidth:1, borderColor:"rgba(0,0,0,0.06)" },
  h2:{ fontSize:16, fontWeight:"900", color:"#0E1015" },
  p:{ color:"#1f2330", lineHeight:20, marginBottom:2 },
  bold:{ fontWeight:"900" },
  gray:{ color:"#6B7280" },

  tipBox:{ backgroundColor:"#F3F7FF", borderLeftWidth:4, borderLeftColor:"#3757FF", padding:12, borderRadius:10 },

  table:{ marginTop:6, borderWidth:1, borderColor:"rgba(0,0,0,0.08)", borderRadius:10, overflow:"hidden" },
  tr:{ flexDirection:"row", borderTopWidth:1, borderTopColor:"rgba(0,0,0,0.06)" },
  trHead:{ backgroundColor:"#0b0c0f" },
  th:{ color:"#fff", fontWeight:"900", paddingHorizontal:8, paddingVertical:6, fontSize:12 },
  td:{ paddingHorizontal:8, paddingVertical:8, color:"#0E1015" },

  qItem:{ marginTop:12 },
  qStem:{ fontWeight:"800", color:"#0E1015", marginBottom:8 },
  optRow:{ flexDirection:"row", gap:10, flexWrap:"wrap" },
  optBtn:{ borderRadius:10, borderWidth:1, paddingHorizontal:10, paddingVertical:6 },
  optTxt:{ fontWeight:"800" },

  explainBox:{ backgroundColor:"#F6F7FB", borderRadius:12, padding:10, marginTop:8, borderWidth:1, borderColor:"rgba(0,0,0,0.06)" },
  jpStrong:{ fontSize:15, fontWeight:"900", color:"#0E1015" },
  esSmall:{ color:"#374151", marginTop:2 },
  why:{ color:"#1f2330", marginTop:4 },

  answerBox:{ borderRadius:10, borderWidth:1, paddingVertical:10, paddingHorizontal:12, marginTop:8 },
  tokenBtn:{ borderWidth:1, borderColor:"rgba(0,0,0,0.08)", borderRadius:10, paddingHorizontal:10, paddingVertical:6, backgroundColor:"#F6F7FB" },
  tokenTxt:{ fontWeight:"800", color:"#0E1015" },

  kIconBtn:{ width:34, height:34, borderRadius:8, backgroundColor:"#111827", alignItems:"center", justifyContent:"center", marginTop:6 },
  inlineBtns:{ flexDirection:"row", gap:8 },

  kanjiGrid:{ flexDirection:"row", flexWrap:"wrap", gap:10, marginTop:8 },
  kCard:{ width:"48%", borderRadius:14, borderWidth:1, borderColor:"rgba(0,0,0,0.08)", padding:10 },
  kTop:{ height:110, borderRadius:10, backgroundColor:"#F6F7FB", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" },
  kChar:{ fontSize:64, fontWeight:"900", color:"#0E1015" },
  kMeta:{ marginTop:8 },
  kGloss:{ fontWeight:"900", color:"#0E1015" },
  kSample:{ color:"#6B7280", marginTop:2 },
  kActions:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginTop:10 },
  kBtn:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:"#0E1015" },
  kBtnTxt:{ color:"#fff", fontWeight:"900" },
  strokeBadge:{ position:"absolute", right:8, top:8, backgroundColor:"#0E1015", borderRadius:999, paddingHorizontal:8, paddingVertical:2 },
  strokeBadgeTxt:{ color:"#fff", fontWeight:"900", fontSize:12 },
});
