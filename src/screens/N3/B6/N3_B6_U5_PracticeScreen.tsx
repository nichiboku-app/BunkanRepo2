// src/screens/N3/B6/N3_B6_U5_PracticeScreen.tsx
// B6 — U5 Expresar reacciones naturales
// 2⿩ Expresiones naturales – 「〜ことは〜が」「〜にしては」 — PRÁCTICA
// Hero: assets/images/n3/b6_u5.webp
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
type RootStackParamList = { N3_B6_U5_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B6_U5_Practice">;
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
const GUIA_ES = `💡 Expresiones naturales — 「〜ことは〜が」「〜にしては」

1) 〜ことは〜が
   • ‘…lo es, PERO…’ Reconoce algo y pone un matiz/limitación.
   • 「AことはAが、B」 → A es cierto, pero B.
   例）この店は高いことは高いが、品質はいい。

2) 〜にしては
   • ‘para ser … / siendo … (sorprendentemente)’
   • Se usa cuando el resultado contradice la expectativa normal para esa base.
   例）初心者にしては上手だね。＝ Para ser principiante, es bueno.

Tips:
・「ことは〜が」 enfatiza dos caras: afirmas A y añades PERO B.
・「にしては」 expresa sorpresa/matiz fuera de lo esperado.`;

const GUIA_JA = `💡「〜ことは〜が」「〜にしては」

① 〜ことは〜が：肯定しつつ、制限・不満を付け加える。
   例）便利なことは便利だが、値段が高い。
② 〜にしては：基準から考えると意外だという評価。
   例）子どもにしては落ち着いている。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"Reconozco pero…", forma:"AことはAが、B", tradu:"A es cierto, pero B", nota:"A=adjetivo/動辞書形/名" },
  { patron:"Sorpresa vs. base", forma:"名/普通形 + にしては", tradu:"para ser / siendo", nota:"resultado fuera de lo esperado" },
];

/* -------- Práctica elegir (8) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"この店は安い（　　　）安い（　　　）、品質は普通だ。", options:["ことは","が","にしては"], answer:"ことは", jp_full:"この店は安いことは安いが、品質は普通だ。", es:"Barata es, PERO la calidad es normal.", why:"Patrón AことはAが…" },
  { id:2, stem:"彼は初心者（　　　）とても上手だ。", options:["にしては","ことは","について"], answer:"にしては", jp_full:"彼は初心者にしてはとても上手だ。", es:"Para ser principiante, es muy bueno.", why:"‘para ser…’ sorprende positivamente." },
  { id:3, stem:"この部屋は広い（　　　）広い（　　　）、駅から遠い。", options:["ことは","にしては","が"], answer:"ことは", jp_full:"この部屋は広いことは広いが、駅から遠い。", es:"Amplio es, PERO está lejos de la estación.", why:"Reconoce A y añade un pero." },
  { id:4, stem:"雨（　　　）暖かいね。", options:["にしては","ことは","としても"], answer:"にしては", jp_full:"雨にしては暖かいね。", es:"Para ser un día de lluvia, hace calor.", why:"Resultado inesperado para la base ‘lluvia’." },
  { id:5, stem:"便利（　　　）便利（　　　）だが、値段が高い。", options:["ことは","にしては","が"], answer:"ことは", jp_full:"便利なことは便利だが、値段が高い。", es:"Conveniente es, PERO es caro.", why:"AことはAが…" },
  { id:6, stem:"留学生（　　　）日本語が自然だ。", options:["にしては","ことは","のわりに"], answer:"にしては", jp_full:"留学生にしては日本語が自然だ。", es:"Para ser estudiante extranjero, su japonés suena natural.", why:"Sorpresa positiva." },
  { id:7, stem:"このパソコンは速い（　　　）速い（　　　）、ファンがうるさい。", options:["ことは","にしては","が"], answer:"ことは", jp_full:"このパソコンは速いことは速いが、ファンがうるさい。", es:"Rápido es, PERO el ventilador es ruidoso.", why:"Contraste." },
  { id:8, stem:"小学生（　　　）背が高いね。", options:["にしては","ことは","について"], answer:"にしては", jp_full:"小学生にしては背が高いね。", es:"Para ser de primaria, es alto.", why:"Fuera de lo esperado." },
];

/* -------- Extra rellenar (3) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"A es cierto pero B", jp_base:"この道は静かな____静か____、夜は暗すぎる。", answer:"ことは", jp_full:"この道は静かなことは静かだが、夜は暗すぎる。", es:"Tranquila es, pero por la noche es demasiado oscura.", why:"AことはAが…" },
  { id:2, hint:"para ser ~ (sorpresa)", jp_base:"初めて____わりに / ではなく、____ を使って：初めて____上手だ。", answer:"にしては", jp_full:"初めてにしては上手だ。", es:"Para ser la primera vez, lo haces bien.", why:"Usa にしては para contradicción de expectativa." },
  { id:3, hint:"A es cierto pero B", jp_base:"安い____安い____、保証がない。", answer:"ことは", jp_full:"安いことは安いが、保証がない。", es:"Barato es, pero no hay garantía.", why:"Fórmula fija." },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"4e8b", char:"事", gloss:"asunto", sample:"事実（じじつ）", strokes:8 },
  { hex:"5ea6", char:"度", gloss:"grado / veces", sample:"程度（ていど）", strokes:9 },
  { hex:"7a0b", char:"程", gloss:"grado / medida", sample:"程度（ていど）", strokes:12 },
  { hex:"6bd4", char:"比", gloss:"comparar", sample:"比較（ひかく）", strokes:4 },
  { hex:"5408", char:"合", gloss:"ajustar / encajar", sample:"割合（わりあい）", strokes:6 },
  { hex:"5272", char:"割", gloss:"porcentaje / dividir", sample:"割引（わりびき）", strokes:12 },
  { hex:"4f8b", char:"例", gloss:"ejemplo", sample:"例えば（たとえば）", strokes:8 },
  { hex:"8a55", char:"評", gloss:"evaluar", sample:"評価（ひょうか）", strokes:12 },
  { hex:"4fa1", char:"価", gloss:"valor", sample:"価値（かち）", strokes:8 },
  { hex:"5fdc", char:"応", gloss:"respuesta", sample:"対応（たいおう）", strokes:7 },
];

/* ---- assets (nums) ---- */
const NUMS: Record<string, any> = {
  "4e8b": require("../../../../assets/kanjivg/n3/4e8b_nums.webp"),
  "5ea6": require("../../../../assets/kanjivg/n3/5ea6_nums.webp"),
  "7a0b": require("../../../../assets/kanjivg/n3/7a0b_nums.webp"),
  "6bd4": require("../../../../assets/kanjivg/n3/6bd4_nums.webp"),
  "5408": require("../../../../assets/kanjivg/n3/5408_nums.webp"),
  "5272": require("../../../../assets/kanjivg/n3/5272_nums.webp"),
  "4f8b": require("../../../../assets/kanjivg/n3/4f8b_nums.webp"),
  "8a55": require("../../../../assets/kanjivg/n3/8a55_nums.webp"),
  "4fa1": require("../../../../assets/kanjivg/n3/4fa1_nums.webp"),
  "5fdc": require("../../../../assets/kanjivg/n3/5fdc_nums.webp"),
};

/* -------- Pantalla -------- */
export default function N3_B6_U5_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 240;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={{ height: heroH }}>
          <RNImage
            source={require("../../../../assets/images/n3/b6_u5.webp")}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <LinearGradient colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill}/>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>B6 — U5 Expresiones naturales</Text>
            <Text style={styles.heroSub}>「〜ことは〜が」「〜にしては」</Text>
            <View style={styles.chipsRow}>
              <Pressable style={styles.chip} onPress={()=>ja("べんり な ことは べんり だが ねだん が たかい")}>
                <Text style={styles.chipTxt}>便利なことは便利だが…</Text><MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
              <Pressable style={styles.chip} onPress={()=>ja("しょしんしゃ にしては じょうず だね")}>
                <Text style={styles.chipTxt}>初心者にしては上手だ</Text><MCI name="volume-high" size={16} color="#fff" />
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
  const BANK = ["ことは","にしては"];
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
