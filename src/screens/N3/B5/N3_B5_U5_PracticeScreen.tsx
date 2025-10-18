import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import {
    Animated,
    Pressable,
    Image as RNImage,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* -------- Types -------- */
type RootStackParamList = { N3_B5_U5_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B5_U5_Practice">;
type Quiz = { id:number; stem:string; options:string[]; answer:string; jp_full:string; es:string; why:string; };
type Fill = { id:number; hint:string; jp_base:string; answer:string; jp_full:string; es:string; why:string; };
type Kanji = { hex:string; char:string; gloss:string; sample:string; strokes:number };

const speakJa = (t:string) =>
  Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

/* -------- Guía -------- */
const GUIA_ES = `🗣️ Opinión indirecta — 「〜によると」「〜によれば」

• Ambos = “según / de acuerdo con”.
• Estructura típica: 〈fuente〉によると／によれば、〈oración en estilo formal〉そうだ・とのことだ・らしい など。
• “によると” es la forma más frecuente; “によれば” suena un poco más formal o escrita. En la práctica son intercambiables.

Ejemplos:
・天気予報によると、明日は雨だそうです。→ Según el pronóstico, mañana lloverá.
・新聞によれば、円安が続くらしい。→ Según el periódico, seguirá el yen débil.`;

const GUIA_JA = `🗣️「〜によると」「〜によれば」

・情報源＋によると／によれば、〜そうだ／〜とのことだ／〜らしい……
・「によると」↔「によれば」ほぼ同義。書き言葉では「によれば」もよく使う。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"citar fuente", forma:"N（情報源）＋によると", tradu:"según N", nota:"más común" },
  { patron:"citar fuente", forma:"N（情報源）＋によれば", tradu:"según N", nota:"más formal/escrita" },
  { patron:"cola reportativa", forma:"〜そうだ／〜とのことだ／〜らしい", tradu:"se dice que / al parecer", nota:"estilo indirecto" },
];

/* -------- Práctica elegir -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"天気予報（　　　）、午後から雪が降るそうだ。", options:["によると","によれば","について"], answer:"によると", jp_full:"天気予報によると、午後から雪が降るそうだ。", es:"Según el pronóstico, nevará por la tarde.", why:"Fuente + によると。" },
  { id:2, stem:"新聞（　　　）、物価は来年も上がるらしい。", options:["によれば","によると","に関して"], answer:"によれば", jp_full:"新聞によれば、物価は来年も上がるらしい。", es:"Según el periódico, los precios seguirán subiendo el año que viene.", why:"Matiz formal → によれば。" },
  { id:3, stem:"先生（　　　）、この課題は金曜日までだとのことです。", options:["によると","によれば","について"], answer:"によると", jp_full:"先生によると、この課題は金曜日までだとのことです。", es:"Según el profesor, la tarea es hasta el viernes.", why:"Fuente directa → によると。" },
  { id:4, stem:"ニュース（　　　）、高速道路で事故があったそうだ。", options:["によれば","によると","にとって"], answer:"によれば", jp_full:"ニュースによれば、高速道路で事故があったそうだ。", es:"Según las noticias, hubo un accidente en la autopista.", why:"Intercambiable; escogemos によれば。" },
  { id:5, stem:"この本（　　　）、江戸時代の文化がよくわかるとのことだ。", options:["によると","によれば","にしたがって"], answer:"によると", jp_full:"この本によると、江戸時代の文化がよくわかるとのことだ。", es:"Según este libro, se entiende bien la cultura del período Edo.", why:"Fuente escrita → によると。" },
  { id:6, stem:"友だち（　　　）、その店のラーメンは最高らしい。", options:["によると","によれば","について"], answer:"によると", jp_full:"友だちによると、その店のラーメンは最高らしい。", es:"Según mi amigo, el ramen de ese local es el mejor.", why:"Conversación cotidiana → によると。" },
];

/* -------- Extra rellenar -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"según TV", jp_base:"テレビ____ 来週は連休になるそうだ。", answer:"によると", jp_full:"テレビによると来週は連休になるそうだ。", es:"Según la TV, la próxima semana habrá puente.", why:"Fuente → によると。" },
  { id:2, hint:"matiz formal", jp_base:"報告書____ 事故の原因は人為的だとのことだ。", answer:"によれば", jp_full:"報告書によれば事故の原因は人為的だとのことだ。", es:"Según el informe, la causa del accidente fue humana.", why:"Documento formal → によれば。" },
  { id:3, hint:"rumor/cita", jp_base:"父____ 来月引っ越すらしい。", answer:"によると", jp_full:"父によると来月引っ越すらしい。", es:"Según mi padre, nos mudamos el mes que viene.", why:"Familia/conversación → によると。" },
];

/* -------- Kanji (10 con trazos disponibles) -------- */
const KANJI: Kanji[] = [
  { hex:"5225", char:"別", gloss:"separar/distinto", sample:"区別（くべつ）", strokes:7 },
  { hex:"6a19", char:"標", gloss:"marca/estándar", sample:"標準（ひょうじゅん）", strokes:15 },
  { hex:"6c7a", char:"決", gloss:"decidir", sample:"決定（けってい）", strokes:7 },
  { hex:"7684", char:"的", gloss:"-al / objetivo", sample:"目的（もくてき）", strokes:8 },
  { hex:"76ee", char:"目", gloss:"ojo/objetivo", sample:"目的（もくてき）", strokes:5 },
  { hex:"7df4", char:"練", gloss:"entrenar", sample:"練習（れんしゅう）", strokes:14 },
  { hex:"7fd2", char:"習", gloss:"aprender", sample:"習慣（しゅうかん）", strokes:11 },
  { hex:"8a66", char:"試", gloss:"probar/examinar", sample:"試験（しけん）", strokes:13 },
  { hex:"9078", char:"選", gloss:"elegir", sample:"選択（せんたく）", strokes:15 },
  { hex:"90e8", char:"部", gloss:"sección/depart.", sample:"部長（ぶちょう）", strokes:11 },
];

/* ---- assets (nums) ----
   Usamos solo los que ya confirmaste que existen como *_nums.webp para evitar errores de require.
*/
const STROKES_NUMS: Record<string, any> = {
  "5225": require("../../../../assets/kanjivg/n3/5225_nums.webp"),
  "6a19": require("../../../../assets/kanjivg/n3/6a19_nums.webp"),
  "6c7a": require("../../../../assets/kanjivg/n3/6c7a_nums.webp"),
  "7684": require("../../../../assets/kanjivg/n3/7684_nums.webp"),
  "76ee": require("../../../../assets/kanjivg/n3/76ee_nums.webp"),
  "7df4": require("../../../../assets/kanjivg/n3/7df4_nums.webp"),
  "7fd2": require("../../../../assets/kanjivg/n3/7fd2_nums.webp"),
  "8a66": require("../../../../assets/kanjivg/n3/8a66_nums.webp"),
  "9078": require("../../../../assets/kanjivg/n3/9078_nums.webp"),
  "90e8": require("../../../../assets/kanjivg/n3/90e8_nums.webp"),
};

/* -------- Pantalla -------- */
export default function N3_B5_U5_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange:[-100,0,200], outputRange:[-80,60,100] });
  const scale = scrollY.interpolate({ inputRange:[-100,0], outputRange:[1.08,1] });

  const speakChip = (txt: string) => speakJa(txt);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b5_u5.webp")}
          style={[styles.heroImg, { transform:[{ translateY:tY },{ scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>B5 — 04 Opinión indirecta（によると・によれば）</Text>

          {/* chips con audio */}
          <View style={styles.chipsRow}>
            <Pressable style={styles.chip} onPress={()=>speakChip("てんきよほう によると")}>
              <Text style={styles.chipTxt}>天気予報によると</Text>
              <MCI name="volume-high" size={16} color="#fff" />
            </Pressable>
            <Pressable style={styles.chip} onPress={()=>speakChip("しんぶん によれば")}>
              <Text style={styles.chipTxt}>新聞によれば</Text>
              <MCI name="volume-high" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 48 }}
        onScroll={Animated.event([{ nativeEvent:{ contentOffset:{ y: scrollY } } }], { useNativeDriver:true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Guía */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía clara — Español</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_ES}</Text></View>
          <Text style={[styles.h2, { marginTop: 10 }]}>🧭 ガイド — にほんご</Text>
          <View style={styles.tipBox}><Text style={styles.p}>{GUIA_JA}</Text></View>
        </View>

        {/* Tabla */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 かたち と ニュアンス</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.th, { flex:1.2 }]}>パターン</Text>
              <Text style={[styles.th, { flex:1.6 }]}>かたち</Text>
              <Text style={[styles.th, { flex:1.0 }]}>意味（ES）</Text>
              <Text style={[styles.th, { flex:1.4 }]}>メモ</Text>
            </View>
            {GRAM_TABLE.map((r,i)=>(
              <View key={i} style={styles.tr}>
                <Text style={[styles.td,{ flex:1.2, fontWeight:"800"}]}>{r.patron}</Text>
                <Text style={[styles.td,{ flex:1.6 }]}>{r.forma}</Text>
                <Text style={[styles.td,{ flex:1.0 }]}>{r.tradu}</Text>
                <Text style={[styles.td,{ flex:1.4 }]}>{r.nota}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Práctica */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} />
          ))}
        </View>

        {/* Extra */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra — Rellenar</Text>
          {EXTRA.map((f)=>(<FillItem key={f.id} f={f} />))}
        </View>

        {/* Kanji */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Pulsa “Trazos” para ver el orden numerado.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map(k => <KanjiCard key={k.hex} k={k} />)}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* -------- Subcomponentes -------- */
function ChoiceItem({ q, idx }:{ q:Quiz; idx:number }) {
  const [sel, setSel] = useState<string|null>(null);
  const done = sel !== null;
  const pick = (op:string)=>{ if(done) return; setSel(op); };
  const optStyle = (op:string)=>{
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
          const s=optStyle(op);
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
            <Pressable onPress={()=>speakJa(q.jp_full)} style={styles.kIconBtn}>
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
  const BANK = ["によると","によれば","について"];
  const check = (ans:string)=>{ const ok = ans===f.answer; setState(ok); };
  const palette = state===null
    ? { b:"rgba(0,0,0,0.08)", bg:"transparent", col:"#0E1015" }
    : state ? { b:"#10B981", bg:"rgba(16,185,129,.12)", col:"#0f9a6a" }
            : { b:"#EF4444", bg:"rgba(239,68,68,.12)", col:"#c62828" };
  return (
    <View style={{ marginTop:12 }}>
      <Text style={styles.gray}>Pista: {f.hint}</Text>
      <View style={[styles.answerBox,{ borderColor:palette.b, backgroundColor:palette.bg }]}>
        <Text style={[styles.jp,{ color:palette.col }]}>{f.jp_base.replace("____","＿＿")}</Text>
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
            <Pressable onPress={()=>speakJa(f.jp_full)} style={styles.kIconBtn}>
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
  const hasStroke = Boolean(STROKES_NUMS[k.hex]);

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {showStroke && hasStroke ? (
          <RNImage source={STROKES_NUMS[k.hex]} style={{ width:"100%", height:"100%" }} resizeMode="contain" />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable
          onPress={()=> hasStroke && setShowStroke(s=>!s)}
          style={[styles.kBtn,{ opacity: hasStroke ? 1 : 0.6 }]}
        >
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={()=>Speech.speak(k.sample,{ language:"ja-JP", rate:0.96, pitch:1.05 })} style={styles.kIconBtn}>
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
  heroWrap:{ position:"absolute", left:0, right:0, top:0, overflow:"hidden" },
  heroImg:{ position:"absolute", width:"100%", height:"100%" },
  heroContent:{ flex:1, justifyContent:"flex-end", alignItems:"center", paddingBottom:18 },
  heroTitle:{ color:"#fff", fontSize:18, fontWeight:"900", textAlign:"center", textShadowColor:"rgba(0,0,0,.75)", textShadowRadius:10 },

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
