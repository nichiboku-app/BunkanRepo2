// src/screens/N3/B6/N3_B6_U3_PracticeScreen.tsx
// B6 — 03 Reacciones y sorpresas 「〜とは思わなかった」「〜なんて」 — PRÁCTICA
// Hero: assets/images/n3/b6_u3.webp
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
type RootStackParamList = { N3_B6_U3_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B6_U3_Practice">;
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
const GUIA_ES = `💡 Reacciones y sorpresas — 「〜とは思わなかった」「〜なんて」

1) 〜とは思わなかった：‘no pensé que…’, sorpresa real (a menudo positiva/negativa).
   ・V/Adj/Nombre + とは思わなかった
   例）彼が優勝するとは思わなかった。= No pensé que él ganaría.

2) 〜なんて：‘… semejante cosa’, enfatiza sorpresa, incredulidad o desprecio (según tono).
   ・V/Adj/Nombre + なんて…
   例）彼が来るなんて（！）= ¡Que él venga, quién lo diría!

Matices:
・「なんて」 es coloquial; en escrito neutral usa 「とは」 / 「なんという」.
・Entonación cambia el matiz: sorpresa positiva (“¡no me lo esperaba!”) o negativa (“¡menuda cosa!”).`;

const GUIA_JA = `💡「〜とは思わなかった」「〜なんて」

① 〜とは思わなかった：予想外で驚いた気持ち。
　例）合格できるとは思わなかった。

② 〜なんて：意外・驚き・軽い否定的感情。口語的。
　例）彼が来るなんて！／そんなことを言うなんて…。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"Sorpresa (neutral)", forma:"X + とは思わなかった", tradu:"no pensé que X", nota:"escrito/neutro" },
  { patron:"Sorpresa coloquial", forma:"X + なんて（！）", tradu:"¡X (quién lo diría)!", nota:"coloquial; tono según contexto" },
  { patron:"Énfasis fuerte", forma:"なんて + N / V-る + こと", tradu:"menuda N / hacer tal cosa", nota:"a veces negativo" },
];

/* -------- Práctica elegir (10) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"（positivo）Aprobaste el N3… ¡No ____！", options:["とは思わなかった","じゃない","かもしれない"], answer:"とは思わなかった", jp_full:"N3に合格できるとは思わなかった！", es:"¡No pensé que podrías aprobar el N3!", why:"Sorpresa neutral con resultado inesperado." },
  { id:2, stem:"（coloquial）Él vino a la fiesta, ____！", options:["なんて","とは思わない","らしい"], answer:"なんて", jp_full:"彼がパーティーに来るなんて！", es:"¡Que él viniera a la fiesta, quién lo diría!", why:"Comentario exclamativo → なんて。" },
  { id:3, stem:"（negativo）Decir algo así ____…", options:["なんて","とは思わなかった","ことにする"], answer:"なんて", jp_full:"そんなことを言うなんて…", es:"Decir algo así… (qué barbaridad).", why:"Matiz de leve reproche → なんて。" },
  { id:4, stem:"No creí que nevara en abril ____。", options:["とは思わなかった","なんて","そうだ"], answer:"とは思わなかった", jp_full:"四月に雪が降るとは思わなかった。", es:"No pensé que nevaría en abril.", why:"Hecho inesperado → とは思わなかった。" },
  { id:5, stem:"¡Tú cocinando ramen casero ____！", options:["なんて","とは思わなかった","わけだ"], answer:"なんて", jp_full:"君が自家製ラーメンを作るなんて！", es:"¡Tú haciendo ramen casero, quién lo diría!", why:"Sorpresa coloquial." },
  { id:6, stem:"Jamás imaginé que ganáramos el primer premio ____。", options:["とは思わなかった","なんて","に違いない"], answer:"とは思わなかった", jp_full:"最優秀賞を取れるとは思わなかった。", es:"No pensé que ganaríamos el primer premio.", why:"Resultado inesperado." },
  { id:7, stem:"Comprar eso tan caro ____…", options:["なんて","とは思わない","ことだ"], answer:"なんて", jp_full:"あんな高いものを買うなんて…", es:"Comprar algo tan caro… (vaya cosa).", why:"Leve crítica/sorpresa → なんて。" },
  { id:8, stem:"Nunca pensé que él hablara español tan bien ____。", options:["とは思わなかった","なんて","べきだ"], answer:"とは思わなかった", jp_full:"彼がこんなにスペイン語が上手だとは思わなかった。", es:"No pensé que hablara tan bien español.", why:"Evaluación inesperada." },
  { id:9, stem:"Que justo hoy se descomponga el PC ____。", options:["なんて","とは思わない","だらけ"], answer:"なんて", jp_full:"よりによって今日パソコンが壊れるなんて。", es:"¡Que justo hoy se rompa el PC…!", why:"Lamento/sorpresa coloquial." },
  { id:10, stem:"No pensé que terminaríamos el proyecto a tiempo ____。", options:["とは思わなかった","なんて","らしい"], answer:"とは思わなかった", jp_full:"期限までにプロジェクトを終えられるとは思わなかった。", es:"No pensé que acabaríamos a tiempo.", why:"Sorpresa positiva." },
];

/* -------- Extra rellenar (5) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"sorpresa positiva (neutral)", jp_base:"彼女が優勝する____。", answer:"とは思わなかった", jp_full:"彼女が優勝するとは思わなかった。", es:"No pensé que ella ganaría.", why:"Neutral/escrito." },
  { id:2, hint:"coloquial exclamativo", jp_base:"雨の中、こんなに人が集まる____！", answer:"なんて", jp_full:"雨の中、こんなに人が集まるなんて！", es:"¡Con lluvia y se reúne tanta gente!", why:"Asombro coloquial." },
  { id:3, hint:"leve reproche", jp_base:"約束を忘れる____…。", answer:"なんて", jp_full:"約束を忘れるなんて…。", es:"Olvidar la cita… (vaya).", why:"Matiz negativo suave." },
  { id:4, hint:"inesperado grado", jp_base:"彼がここまで成長する____。", answer:"とは思わなかった", jp_full:"彼がここまで成長するとは思わなかった。", es:"No pensé que crecería tanto.", why:"Grado inesperado." },
  { id:5, hint:"sorpresa + crítica leve", jp_base:"締切前日に始める____！", answer:"なんて", jp_full:"締切前日に始めるなんて！", es:"¡Empezar el día antes del plazo, vaya cosa!", why:"Expresa sorpresa crítica." },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"9a5a", char:"驚", gloss:"sorpresa", sample:"驚く（おどろく）", strokes:22 },
  { hex:"60f3", char:"想", gloss:"pensar", sample:"予想（よそう）", strokes:13 },
  { hex:"611f", char:"感", gloss:"sentir", sample:"感情（かんじょう）", strokes:13 },
  { hex:"610f", char:"意", gloss:"intención", sample:"意外（いがい）", strokes:13 },
  { hex:"5916", char:"外", gloss:"fuera", sample:"意外（いがい）", strokes:5 },
  { hex:"4e88", char:"予", gloss:"anticipar", sample:"予想（よそう）", strokes:4 },
  { hex:"671f", char:"期", gloss:"esperar", sample:"期待（きたい）", strokes:12 },
  { hex:"4fe1", char:"信", gloss:"creer", sample:"信じる（しんじる）", strokes:9 },
  { hex:"8a00", char:"言", gloss:"decir", sample:"言うなんて", strokes:7 },
  { hex:"4f55", char:"何", gloss:"qué", sample:"何なんて…", strokes:7 },
];

/* ---- assets (nums) ---- */
const NUMS: Record<string, any> = {
  "9a5a": require("../../../../assets/kanjivg/n3/9a5a_nums.webp"),
  "60f3": require("../../../../assets/kanjivg/n3/60f3_nums.webp"),
  "611f": require("../../../../assets/kanjivg/n3/611f_nums.webp"),
  "610f": require("../../../../assets/kanjivg/n3/610f_nums.webp"),
  "5916": require("../../../../assets/kanjivg/n3/5916_nums.webp"),
  "4e88": require("../../../../assets/kanjivg/n3/4e88_nums.webp"),
  "671f": require("../../../../assets/kanjivg/n3/671f_nums.webp"),
  "4fe1": require("../../../../assets/kanjivg/n3/4fe1_nums.webp"),
  "8a00": require("../../../../assets/kanjivg/n3/8a00_nums.webp"),
  "4f55": require("../../../../assets/kanjivg/n3/4f55_nums.webp"),
};

/* -------- Pantalla -------- */
export default function N3_B6_U3_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 240;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={{ height: heroH }}>
          <RNImage source={require("../../../../assets/images/n3/b6_u3.webp")} style={styles.heroImg} resizeMode="cover" />
          <LinearGradient colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>B6 — 03 Reacciones y sorpresas（とは思わなかった／なんて）</Text>
            <View style={styles.chipsRow}>
              <Pressable style={styles.chip} onPress={()=>speakJa("かれ が しょうり する とは おもわなかった")} hitSlop={8}>
                <Text style={styles.chipTxt}>優勝するとは思わなかった</Text>
                <MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
              <Pressable style={styles.chip} onPress={()=>speakJa("かれ が くる なんて")} hitSlop={8}>
                <Text style={styles.chipTxt}>彼が来るなんて！</Text>
                <MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Guía */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧭 Guía — Español</Text>
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
          <Text style={styles.h2}>🈶 Kanji del tema（10）</Text>
          <Text style={styles.p}>Pulsa “Trazos” para ver el orden numerado.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map(k => <KanjiCard key={k.hex} k={k} />)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* -------- Subcomponentes (Choice/Fill/KanjiCard) — iguales a pantallas previas -------- */
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
  const BANK = ["とは思わなかった","なんて"];
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
