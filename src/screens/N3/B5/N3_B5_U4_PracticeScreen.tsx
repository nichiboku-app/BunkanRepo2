// src/screens/N3/B5/N3_B5_U4_PracticeScreen.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
    Animated, Pressable, ScrollView, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* -------- Types -------- */
type RootStackParamList = { N3_B5_U4_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B5_U4_Practice">;
type Quiz = { id:number; stem:string; options:string[]; answer:string; jp_full:string; es:string; why:string; };
type Fill = { id:number; hint:string; jp_base:string; answer:string; jp_full:string; es:string; why:string; };
type Kanji = { hex:string; char:string; gloss:string; sample:string; strokes:number };

const speakJa = (t:string) => Speech.speak(t, { language:"ja-JP", rate:0.96, pitch:1.05 });

/* --- Audio: secuencias (HERO) --- */
const AUDIO_TRACKS: Record<string, { label:string; lines:string[] }> = {
  nitsuite: {
    label: "〜について",
    lines: [
      "について。",
      "この 問題 について、 話し合いましょう。",
      "日本の 文化 について、 論文を 書きました。"
    ],
  },
  nikanshite: {
    label: "〜に関して",
    lines: [
      "に かんして。",
      "新しい 規則 に 関して、 会社 から 発表が ありました。",
      "環境 に 関して、 重要な 研究が 進んでいます。"
    ],
  },
};

const speakSeq = async (lines: string[]) => new Promise<void>((resolve) => {
  let i = 0; let started = false;
  const play = () => {
    if (i >= lines.length) return resolve();
    started = true;
    Speech.speak(lines[i++], {
      language: "ja-JP", rate: 0.96, pitch: 1.05,
      onDone: play, onStopped: () => resolve(), onError: () => resolve(),
    });
  };
  setTimeout(() => {
    play();
    setTimeout(() => { if (!started) Speech.speak(lines[0], { language:"ja-JP", rate:0.96, pitch:1.05, onDone:()=>resolve() }); }, 300);
  }, 0);
});

/* -------- Guía -------- */
const GUIA_ES = `24️⃣ Tema y referencia — 「〜について」「〜に関して」

● 「N について」: ‘sobre / acerca de / acerca de un tema’.
   ・自然で幅広い文脈。口語でも書き言葉でもOK。
   例）この問題について話しましょう。

● 「N に関して」: ‘en relación con / con respecto a’.
   ・少しフォーマル／書き言葉寄り。告知・発表・研究報告によく使う。
   例）新しい規則に関して発表があった。

ニュアンス
・について = テーマ一般。説明・意見・調査対象。
・に関して = 関連性・観点を明示。やや硬め。`;

const GUIA_JA = `「〜について」「〜に関して」

・Nについて … あるテーマを話題にする。自然で広い文脈。
・Nに関して … ある事柄との関係・関連の観点から述べる。やや硬い表現。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"テーマ一般", forma:"N について", tradu:"sobre / acerca de", nota:"自然・中立" },
  { patron:"関連・観点（硬め）", forma:"N に関して", tradu:"en relación con / con respecto a", nota:"ややフォーマル" },
];

/* -------- Práctica elegir (10) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"この件（　　　）ご連絡いたします。", options:["に関して","について","に対して"], answer:"に関して", jp_full:"この件に関してご連絡いたします。", es:"Nos pondremos en contacto con respecto a este asunto.", why:"Notificación formal → に関して。" },
  { id:2, stem:"日本の歴史（　　　）本を読みたい。", options:["について","に関して","によって"], answer:"について", jp_full:"日本の歴史について本を読みたい。", es:"Quiero leer un libro sobre la historia de Japón.", why:"Tema general → について。" },
  { id:3, stem:"新製品（　　　）説明会があります。", options:["に関して","について","に対して"], answer:"に関して", jp_full:"新製品に関して説明会があります。", es:"Habrá una sesión informativa con respecto al nuevo producto.", why:"Anuncio institucional → に関して。" },
  { id:4, stem:"環境問題（　　　）意見を述べてください。", options:["について","に関して","については"], answer:"について", jp_full:"環境問題について意見を述べてください。", es:"Expresa tu opinión sobre los problemas medioambientales.", why:"Tema de discusión → について。" },
  { id:5, stem:"規則の変更（　　　）詳細は後日発表します。", options:["に関して","について","として"], answer:"に関して", jp_full:"規則の変更に関して詳細は後日発表します。", es:"Los detalles con respecto al cambio de normas se anunciarán más adelante.", why:"Comunicación formal → に関して。" },
  { id:6, stem:"この映画（　　　）どう思いますか。", options:["について","に関して","に対して"], answer:"について", jp_full:"この映画についてどう思いますか。", es:"¿Qué piensas sobre esta película?", why:"Opinión sobre un tema → について。" },
  { id:7, stem:"安全（　　　）調査が行われています。", options:["に関して","について","により"], answer:"に関して", jp_full:"安全に関して調査が行われています。", es:"Se está realizando una investigación en relación con la seguridad.", why:"Informe/estudio → に関して。" },
  { id:8, stem:"卒業後の進路（　　　）先生に相談した。", options:["について","に関して","についても"], answer:"について", jp_full:"卒業後の進路について先生に相談した。", es:"Consulté al profesor sobre mi camino tras graduarme.", why:"Consulta personal sobre tema → について。" },
  { id:9, stem:"この資料（　　　）質問がある方はどうぞ。", options:["について","に関して","については"], answer:"について", jp_full:"この資料について質問がある方はどうぞ。", es:"Si tienen preguntas sobre este material, adelante.", why:"Tema del material → について。" },
  { id:10, stem:"データの取り扱い（　　　）社内規定を参照してください。", options:["に関して","について","に対して"], answer:"に関して", jp_full:"データの取り扱いに関して社内規定を参照してください。", es:"Con respecto al manejo de datos, consulten las normas internas.", why:"Documento normativo → に関して。" },
];

/* -------- EXTRA rellenar (6) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"tema", jp_base:"このニュース____ 詳しく教えてください。", answer:"について", jp_full:"このニュースについて詳しく教えてください。", es:"Cuéntame más sobre esta noticia.", why:"Tema → について。" },
  { id:2, hint:"anuncio formal", jp_base:"人事異動____ お知らせします。", answer:"に関して", jp_full:"人事異動に関してお知らせします。", es:"Informamos con respecto a los cambios de personal.", why:"Formal → に関して。" },
  { id:3, hint:"discusión", jp_base:"計画____ 意見を集めています。", answer:"について", jp_full:"計画について意見を集めています。", es:"Reunimos opiniones sobre el plan.", why:"Tema → について。" },
  { id:4, hint:"investigación", jp_base:"健康____ 研究が進んでいる。", answer:"に関して", jp_full:"健康に関して研究が進んでいる。", es:"Avanza la investigación en relación con la salud.", why:"Informe → に関して。" },
  { id:5, hint:"pregunta", jp_base:"その言葉____ どういう意味ですか。", answer:"について", jp_full:"その言葉についてどういう意味ですか。", es:"¿Qué significa esa palabra (sobre esa palabra)?", why:"Tema puntual → について。" },
  { id:6, hint:"política", jp_base:"新方針____ 詳細はPDFをご覧ください。", answer:"に関して", jp_full:"新方針に関して詳細はPDFをご覧ください。", es:"Con respecto a la nueva política, vean el PDF con detalles.", why:"Documento corporativo → に関して。" },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"4ef6", char:"件", gloss:"caso/asunto", sample:"事件（じけん）・案件（あんけん）", strokes:6 },
  { hex:"95a2", char:"関", gloss:"relación", sample:"関係（かんけい）", strokes:14 },
  { hex:"9023", char:"連", gloss:"conectar", sample:"関連（かんれん）", strokes:10 },
  { hex:"984c", char:"題", gloss:"título/tema", sample:"話題（わだい）", strokes:18 },
  { hex:"8ad6", char:"論", gloss:"discutir", sample:"論文（ろんぶん）", strokes:15 },
  { hex:"554f", char:"問", gloss:"pregunta", sample:"質問（しつもん）", strokes:11 },
  { hex:"8a18", char:"記", gloss:"anotar", sample:"記事（きじ）・記述（きじゅつ）", strokes:10 },
  { hex:"8ff0", char:"述", gloss:"enunciar", sample:"記述（きじゅつ）", strokes:8 },
  { hex:"6848", char:"案", gloss:"propuesta", sample:"提案（ていあん）", strokes:10 },
  { hex:"8cc7", char:"資", gloss:"recursos", sample:"資料（しりょう）・資源（しげん）", strokes:13 },
];

/* ---- assets (nums) ---- */
const HAS_WEB: Record<string, boolean> = {};
const STROKES_NUMS: Record<string, ImageSourcePropType> = {
  "4ef6": require("../../../../assets/kanjivg/n3/4ef6_nums.webp"),
  "95a2": require("../../../../assets/kanjivg/n3/95a2_nums.webp"),
  "9023": require("../../../../assets/kanjivg/n3/9023_nums.webp"),
  "984c": require("../../../../assets/kanjivg/n3/984c_nums.webp"),
  "8ad6": require("../../../../assets/kanjivg/n3/8ad6_nums.webp"),
  "554f": require("../../../../assets/kanjivg/n3/554f_nums.webp"),
  "8a18": require("../../../../assets/kanjivg/n3/8a18_nums.webp"),
  "8ff0": require("../../../../assets/kanjivg/n3/8ff0_nums.webp"),
  "6848": require("../../../../assets/kanjivg/n3/6848_nums.webp"),
  "8cc7": require("../../../../assets/kanjivg/n3/8cc7_nums.webp"),
};
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {};
const strokeSrc = (hex:string): ImageSourcePropType | null =>
  (HAS_WEB[hex] && STROKES_WEB[hex]) ? STROKES_WEB[hex]! : (STROKES_NUMS[hex] ?? null);

/* -------- Pantalla -------- */
export default function N3_B5_U4_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();
  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange:[-100,0,200], outputRange:[-80,60,100] });
  const scale = scrollY.interpolate({ inputRange:[-100,0], outputRange:[1.08,1] });

  const [speaking, setSpeaking] = useState<null | "nitsuite" | "nikanshite">(null);
  const playTrack = async (key: "nitsuite" | "nikanshite") => {
    if (speaking === key) { Speech.stop(); setSpeaking(null); return; }
    if (speaking) Speech.stop();
    setSpeaking(key);
    await speakSeq(AUDIO_TRACKS[key].lines);
    setSpeaking(null);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b5_u4.webp")}
          style={[styles.heroImg, { transform:[{ translateY:tY },{ scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.heroContent} pointerEvents="box-none">
          <Text style={styles.heroTitle}>B5 — 04 Tema y referencia（について・に関して）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋について</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋に関して</Text></View>
          </View>
          {/* Audio */}
          <View style={styles.audioRow} pointerEvents="box-none">
            <Pressable onPress={()=>playTrack("nitsuite")} style={[styles.audioBtn, speaking==="nitsuite" && styles.audioBtnActive]}>
              <MCI name={speaking==="nitsuite" ? "stop-circle" : "play-circle"} size={18} color="#fff" />
              <Text style={styles.audioTxt}>について</Text>
            </Pressable>
            <Pressable onPress={()=>playTrack("nikanshite")} style={[styles.audioBtn, speaking==="nikanshite" && styles.audioBtnActive]}>
              <MCI name={speaking==="nikanshite" ? "stop-circle" : "play-circle"} size={18} color="#fff" />
              <Text style={styles.audioTxt}>に関して</Text>
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
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (10)</Text>
          {PRACTICE.map((q, idx) => (
            <ChoiceItem key={q.id} q={q} idx={idx} onResult={(ok)=> (ok ? playCorrect() : playWrong())} />
          ))}
        </View>

        {/* Extra */}
        <View style={styles.card}>
          <Text style={styles.h2}>⭐ Extra — Rellenar (6)</Text>
          {EXTRA.map((f)=>(
            <FillItem key={f.id} f={f} onResult={(ok)=> (ok ? playCorrect() : playWrong())} />
          ))}
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
function ChoiceItem({ q, idx, onResult }:{ q:Quiz; idx:number; onResult:(ok:boolean)=>void }) {
  const [sel, setSel] = useState<string|null>(null);
  const done = sel !== null;
  const pick = (op:string)=>{ if(done) return; setSel(op); onResult(op===q.answer); };
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

function FillItem({ f, onResult }:{ f:Fill; onResult:(ok:boolean)=>void }) {
  const [state, setState] = useState<null|boolean>(null);
  const BANK = ["について","に関して","については"];
  const check = (ans:string)=>{ const ok = ans===f.answer; setState(ok); onResult(ok); };
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
  const src = strokeSrc(k.hex);
  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        <View style={styles.strokeBadge}><Text style={styles.strokeBadgeTxt}>{k.strokes}</Text></View>
        {showStroke && src
          ? <ExpoImage source={src} style={{ width:"100%", height:"100%" }} contentFit="contain" />
          : <Text style={styles.kChar}>{k.char}</Text>}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={()=>setShowStroke(s=>!s)} style={[styles.kBtn,{ opacity: src ? 1 : 0.6 }]}>
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
  heroWrap:{ position:"absolute", left:0, right:0, top:0, overflow:"hidden", zIndex:1 },
  heroImg:{ position:"absolute", width:"100%", height:"100%" },
  heroContent:{ flex:1, justifyContent:"flex-end", alignItems:"center", paddingBottom:18, zIndex:2 },
  heroTitle:{ color:"#fff", fontSize:18, fontWeight:"900", textAlign:"center", textShadowColor:"rgba(0,0,0,.75)", textShadowRadius:10 },
  chipsRow:{ flexDirection:"row", gap:8, marginTop:6, flexWrap:"wrap", justifyContent:"center" },
  chip:{ paddingHorizontal:12, paddingVertical:6, borderRadius:999, backgroundColor:"rgba(255,255,255,0.22)", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" },
  chipTxt:{ color:"#fff", fontWeight:"800" },

  audioRow:{ flexDirection:"row", gap:8, marginTop:8, zIndex:3 },
  audioBtn:{ flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:6, borderRadius:999, backgroundColor:"rgba(255,255,255,0.22)", borderWidth:1, borderColor:"rgba(255,255,255,0.30)" },
  audioBtnActive:{ backgroundColor:"rgba(16,185,129,0.35)", borderColor:"rgba(16,185,129,0.55)" },
  audioTxt:{ color:"#fff", fontWeight:"900" },

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
