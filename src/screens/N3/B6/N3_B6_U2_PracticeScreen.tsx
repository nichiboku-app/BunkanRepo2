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
type RootStackParamList = { N3_B6_U2_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B6_U2_Practice">;
type Quiz = { id:number; stem:string; options:string[]; answer:string; jp_full:string; es:string; why:string; };
type Fill = { id:number; hint:string; jp_base:string; answer:string; jp_full:string; es:string; why:string; };
type Kanji = { hex:string; char:string; gloss:string; sample:string; strokes:number };

/* -------- Speech helpers -------- */
const speak = async (text: string) => {
  try { if (await Speech.isSpeakingAsync()) await Speech.stop(); } catch {}
  Speech.speak(text, { language:"ja-JP", rate:0.96, pitch:1.05 });
};
const speakJa = (t:string) => speak(t);

/* -------- Guía -------- */
const GUIA_ES = `💡 Dar consejos y sugerencias — 「〜たほうがいい」「〜べきだ」

1) 〜たほうがいい
・‘sería mejor que…’ Recomendación fuerte pero flexible.
・Aconsejar HACER: 動た + ほうがいい（よ）
・Aconsejar NO HACER: 動ない + ほうがいい（よ）

2) 〜べきだ
・‘deberías / lo correcto es…’ Norma/obligación moral. Más fuerte/formal.
・動辞書形 + べきだ（/ではない）
・「するべき」→「すべき」 también es común.

Matices:
・ほうがいい = consejo pragmático del hablante.
・べきだ = deber moral/regla general; úsalo con cuidado para no sonar severo.`;

const GUIA_JA = `💡「〜たほうがいい」「〜べきだ」

① たほうがいい：助言・提案。例）早く寝たほうがいいよ。
② べきだ：当然・義務に近い。例）約束は守るべきだ。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"アドバイス",        forma:"V-た ほうがいい",               tradu:"sería mejor (hacer)",   nota:"cotidiano" },
  { patron:"アドバイス(否定)",  forma:"V-ない ほうがいい",              tradu:"mejor no (hacer)",      nota:"cotidiano" },
  { patron:"義務・当然",        forma:"V-辞書形 べきだ／べきではない", tradu:"deber moral / no deber", nota:"fuerte/formal" },
];

/* -------- Práctica elegir (10) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"もう夜遅いから、早く寝（　　　）。", options:["たほうがいい","べきだ","そうだ"], answer:"たほうがいい", jp_full:"もう夜遅いから、早く寝たほうがいい。", es:"Ya es tarde; sería mejor dormir pronto.", why:"Consejo cotidiano → たほうがいい。" },
  { id:2, stem:"約束は守る（　　　）。", options:["べきだ","たほうがいい","かもしれない"], answer:"べきだ", jp_full:"約束は守るべきだ。", es:"Las promesas deben cumplirse.", why:"Deber moral → べきだ。" },
  { id:3, stem:"体調が悪いなら、無理をしない（　　　）。", options:["ほうがいい","べきだ","に違いない"], answer:"ほうがいい", jp_full:"体調が悪いなら、無理をしないほうがいい。", es:"Si te sientes mal, mejor no te esfuerces.", why:"Aconsejar no hacer → ないほうがいい。" },
  { id:4, stem:"個人情報は他人に簡単に見せる（　　　）。", options:["べきではない","たほうがいい","にすぎない"], answer:"べきではない", jp_full:"個人情報は他人に簡単に見せるべきではない。", es:"No se debería mostrar la info personal a cualquiera.", why:"Prohibición moral → べきではない。" },
  { id:5, stem:"日本語を上達させたいなら、毎日少しでも勉強（　　　）。", options:["したほうがいい","すべきだ","させるべきだ"], answer:"したほうがいい", jp_full:"日本語を上達させたいなら、毎日少しでも勉強したほうがいい。", es:"Si quieres mejorar, sería mejor estudiar cada día.", why:"Consejo práctico → たほうがいい。" },
  { id:6, stem:"電車ではお年寄りに席をゆずる（　　　）。", options:["べきだ","たほうがいい","みたいだ"], answer:"べきだ", jp_full:"電車ではお年寄りに席をゆずるべきだ。", es:"En el tren se debería ceder el asiento a mayores.", why:"Norma social → べきだ。" },
  { id:7, stem:"その薬は空腹時に飲まない（　　　）。", options:["ほうがいい","べきではない","に違いない"], answer:"ほうがいい", jp_full:"その薬は空腹時に飲まないほうがいい。", es:"Es mejor no tomar esa medicina en ayunas.", why:"Recomendación negativa → ないほうがいい。" },
  { id:8, stem:"提出期限は守る（　　　）。", options:["べきだ","ほうがいい","ことがある"], answer:"べきだ", jp_full:"提出期限は守るべきだ。", es:"Se deben respetar los plazos de entrega.", why:"Regla/obligación → べきだ。" },
  { id:9, stem:"疲れているなら、今日は早く帰った（　　　）。", options:["ほうがいい","べきだ","ものだ"], answer:"ほうがいい", jp_full:"疲れているなら、今日は早く帰ったほうがいい。", es:"Si estás cansado, mejor vuelve temprano.", why:"Consejo → たほうがいい。" },
  { id:10, stem:"危険なサイトにはアクセスしない（　　　）。", options:["べきだ","ほうがいい","らしい"], answer:"べきだ", jp_full:"危険なサイトにはアクセスしないべきだ。", es:"No se debería acceder a sitios peligrosos.", why:"Deber/seguridad → べきだ（文調 fuerte）。" },
];

/* -------- Extra rellenar (5) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"consejo positivo", jp_base:"毎日野菜をもっと食べ____。", answer:"たほうがいい", jp_full:"毎日野菜をもっと食べたほうがいい。", es:"Sería mejor comer más verduras cada día.", why:"習慣の助言。" },
  { id:2, hint:"consejo negativo", jp_base:"その話は本人の前で言わ____。", answer:"ないほうがいい", jp_full:"その話は本人の前で言わないほうがいい。", es:"Es mejor no decir eso delante de la persona.", why:"否定助言。" },
  { id:3, hint:"deber moral", jp_base:"危険を感じたら避難す____。", answer:"べきだ", jp_full:"危険を感じたら避難すべきだ。", es:"Si sientes peligro, deberías evacuar.", why:"当然性。" },
  { id:4, hint:"norma social", jp_base:"公共の場ではマスクを着用する____ と思う。", answer:"べきだ", jp_full:"公共の場ではマスクを着用するべきだと思う。", es:"Creo que en lugares públicos se debería usar mascarilla.", why:"規範。" },
  { id:5, hint:"tono suave", jp_base:"そんなに無理をし____ よ。", answer:"ないほうがいい", jp_full:"そんなに無理をしないほうがいいよ。", es:"Mejor no te esfuerces tanto.", why:"やさしい助言。" },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"6a19", char:"標", gloss:"estándar", sample:"標準（ひょうじゅん）", strokes:15 },
  { hex:"6c7a", char:"決", gloss:"decidir", sample:"決定（けってい）", strokes:7 },
  { hex:"7684", char:"的", gloss:"-al / objetivo", sample:"目的（もくてき）", strokes:8 },
  { hex:"76ee", char:"目", gloss:"objetivo", sample:"目標（もくひょう）", strokes:5 },
  { hex:"7df4", char:"練", gloss:"entrenar", sample:"練習（れんしゅう）", strokes:14 },
  { hex:"7fd2", char:"習", gloss:"aprender", sample:"習慣（しゅうかん）", strokes:11 },
  { hex:"8a66", char:"試", gloss:"probar", sample:"試験（しけん）", strokes:13 },
  { hex:"9078", char:"選", gloss:"elegir", sample:"選択（せんたく）", strokes:15 },
  { hex:"90e8", char:"部", gloss:"sección", sample:"部長（ぶちょう）", strokes:11 },
  { hex:"5225", char:"別", gloss:"separar", sample:"区別（くべつ）", strokes:7 },
];

/* ---- assets (nums) ---- */
const NUMS: Record<string, any> = {
  "6a19": require("../../../../assets/kanjivg/n3/6a19_nums.webp"),
  "6c7a": require("../../../../assets/kanjivg/n3/6c7a_nums.webp"),
  "7684": require("../../../../assets/kanjivg/n3/7684_nums.webp"),
  "76ee": require("../../../../assets/kanjivg/n3/76ee_nums.webp"),
  "7df4": require("../../../../assets/kanjivg/n3/7df4_nums.webp"),
  "7fd2": require("../../../../assets/kanjivg/n3/7fd2_nums.webp"),
  "8a66": require("../../../../assets/kanjivg/n3/8a66_nums.webp"),
  "9078": require("../../../../assets/kanjivg/n3/9078_nums.webp"),
  "90e8": require("../../../../assets/kanjivg/n3/90e8_nums.webp"),
  "5225": require("../../../../assets/kanjivg/n3/5225_nums.webp"),
};

/* -------- Pantalla (con ScrollView) -------- */
export default function N3_B6_U2_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 260;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO dentro del ScrollView */}
        <View style={{ height: heroH }}>
          <RNImage
            source={require("../../../../assets/images/n3/b6_u2.webp")}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>B6 — 02 Dar consejos（たほうがいい・べきだ）</Text>
            <View style={styles.chipsRow}>
              <Pressable style={styles.chip} onPress={()=>speakJa("はやく ねた ほうが いい")} hitSlop={8}>
                <Text style={styles.chipTxt}>早く寝たほうがいい</Text>
                <MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
              <Pressable style={styles.chip} onPress={()=>speakJa("やくそく は まもる べきだ")} hitSlop={8}>
                <Text style={styles.chipTxt}>約束は守るべきだ</Text>
                <MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

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

        {/* Práctica elegir */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta</Text>
          {PRACTICE.map((q, idx) => <ChoiceItem key={q.id} q={q} idx={idx} />)}
        </View>

        {/* Extra rellenar */}
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
      </ScrollView>
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
  const BANK = ["たほうがいい","ないほうがいい","べきだ","べきではない"];
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
        <Pressable onPress={()=> speakJa(k.sample)} style={styles.kIconBtn}>
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
