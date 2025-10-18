// src/screens/N3/B6/N3_B6_U2_PracticeScreen.tsx
// B6 — 02 Solicitudes suaves 「〜ていただけませんか」 — PRÁCTICA
// Hero: assets/images/n3/b6_u2.webp
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
const GUIA_ES = `💡 Solicitudes suaves — 「〜ていただけませんか」

Objetivo: pedir algo con cortesía “alta”.

Formas clave (de más formal a general):
1) 〜ていただけませんか     → ¿Podría (ser tan amable de)…?  (muy cortés)
2) 〜ていただけますか       → ¿Podría …? (cortés estándar)
3) 〜てもらえますか         → ¿Me podrías …? (neutral/formal suave)
4) 〜てください              → Por favor … (imperativo cortés; más directo)

Notas de uso:
・「〜ていただけませんか」 se usa cuando pides un favor al beneficio TUYO y respetas al interlocutor.
・Con superiores/clientes: prefiere 「〜ていただけますか／〜ていただけませんか」.
・Con amigos/compas: 「〜てもらえる？」 es común en registro casual (aquí usamos 〜てもらえますか).`;

const GUIA_JA = `💡「〜ていただけませんか」丁寧な依頼

丁寧度の目安：
とても丁寧：Vて + いただけませんか
丁寧　　　：Vて + いただけますか
丁寧め　　：Vて + もらえますか
通常丁寧　：Vて + ください

例）
・こちらにサインしていただけませんか。
・少々お待ちいただけますか。
・写真を送ってもらえますか。
・静かにして下さい。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"Muy cortés", forma:"V-て いただけませんか", tradu:"¿Podría … por favor?", nota:"negativa posible → más suave" },
  { patron:"Cortés estándar", forma:"V-て いただけますか", tradu:"¿Podría …?", nota:"oficial/cliente" },
  { patron:"Suave neutral", forma:"V-て もらえますか", tradu:"¿Me podría …?", nota:"interlocutor cercano" },
  { patron:"Directo cortés", forma:"V-て ください", tradu:"Por favor …", nota:"más directo" },
];

/* -------- Práctica elegir (10) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"（cliente）Aquí su documento. ¿____ こちらにご署名____。", options:["していただけませんか","してもらえますか","してください"], answer:"していただけませんか", jp_full:"こちらにご署名していただけませんか。", es:"¿Podría firmar aquí, por favor?", why:"Contexto cliente → máxima cortesía." },
  { id:2, stem:"（recepción）Un momento, ¿____ 少々お待ち____。", options:["ちいただけますか","ってください","ってもらえますか"], answer:"ちいただけますか", jp_full:"少々お待ちいただけますか。", es:"¿Podría esperar un momento?", why:"Fórmula fija de recepción." },
  { id:3, stem:"（equipo）¿____ 明日の会議資料を共有____。", options:["してもらえますか","していただけませんか","してください"], answer:"してもらえますか", jp_full:"明日の会議資料を共有してもらえますか。", es:"¿Me podrías compartir el material de la reunión de mañana?", why:"Registro más cercano en equipo." },
  { id:4, stem:"（aviso general）Silencio, por favor: 静かに____。", options:["してください","していただけますか","してもらえますか"], answer:"してください", jp_full:"静かにしてください。", es:"Por favor, guarden silencio.", why:"Cartel/petición directa cortés." },
  { id:5, stem:"(cliente) ¿____ こちらのフォームにご記入____。", options:["していただけますか","してもらえますか","してください"], answer:"していただけますか", jp_full:"こちらのフォームにご記入していただけますか。", es:"¿Podría rellenar este formulario?", why:"Cortesía alta pero estándar." },
  { id:6, stem:"(compañero) ¿____ 写真を送って____。", options:["もらえますか","いただけませんか","ください"], answer:"もらえますか", jp_full:"写真を送ってもらえますか。", es:"¿Me podrías mandar la foto?", why:"Relación cercana → てもらえますか。" },
  { id:7, stem:"(soporte) ¿____ 画面を共有して____。", options:["いただけますか","ください","もらえますか"], answer:"いただけますか", jp_full:"画面を共有していただけますか。", es:"¿Podría compartir la pantalla?", why:"Atención/soporte → いただけますか。" },
  { id:8, stem:"(oficina) ¿____ マスクの着用にご協力____。", options:["いただけませんか","してください","もらえますか"], answer:"いただけませんか", jp_full:"マスクの着用にご協力いただけませんか。", es:"¿Podrían colaborar usando mascarilla?", why:"Pedir cooperación → いただけませんか (suave)." },
  { id:9, stem:"(profesor) ¿____ ここをもう一度説明して____。", options:["いただけますか","もらえますか","してください"], answer:"いただけますか", jp_full:"ここをもう一度説明していただけますか。", es:"¿Podría explicar esto otra vez?", why:"Respeto al profesor." },
  { id:10, stem:"(señal) Por favor, apague su móvil: 携帯電話の電源を____。", options:["お切りください","いただけませんか","もらえますか"], answer:"お切りください", jp_full:"携帯電話の電源をお切りください。", es:"Por favor, apague su teléfono móvil.", why:"Fórmula fija con おV-ください." },
];

/* -------- Extra rellenar (5) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"muy cortés / cliente", jp_base:"こちらの受付でお待ち____。", answer:"いただけませんか", jp_full:"こちらの受付でお待ちいただけませんか。", es:"¿Podría esperar aquí en recepción?", why:"〜ていただけませんか = más suave." },
  { id:2, hint:"cortés estándar", jp_base:"お名前をもう一度教えて____。", answer:"いただけますか", jp_full:"お名前をもう一度教えていただけますか。", es:"¿Podría decirme su nombre otra vez?", why:"Petición formal normal." },
  { id:3, hint:"neutral suave (equipo)", jp_base:"このリンクを確認して____。", answer:"もらえますか", jp_full:"このリンクを確認してもらえますか。", es:"¿Me podrías revisar este enlace?", why:"Relación cercana." },
  { id:4, hint:"directo cortés (cartel)", jp_base:"ここに並んで____。", answer:"ください", jp_full:"ここに並んでください。", es:"Por favor, hagan fila aquí.", why:"Instrucción general." },
  { id:5, hint:"muy cortés", jp_base:"明日の予定を共有して____。", answer:"いただけませんか", jp_full:"明日の予定を共有していただけませんか。", es:"¿Podría compartir la agenda de mañana?", why:"Favores con máximo respeto." },
];

/* -------- Kanji (10) —— (mantengo tus assets existentes para no romper rutas) -------- */
const KANJI: Kanji[] = [
  { hex:"539f", char:"原", gloss:"origen / base", sample:"原因（げんいん）", strokes:10 },
  { hex:"56e0", char:"因", gloss:"causa", sample:"原因（げんいん）", strokes:6 },
  { hex:"7531", char:"由", gloss:"origen / razón", sample:"由来（ゆらい）", strokes:5 },
  { hex:"7d4c", char:"経", gloss:"pasar por / vía", sample:"経由（けいゆ）", strokes:11 },
  { hex:"6cd5", char:"法", gloss:"método / ley", sample:"方法（ほうほう）", strokes:8 },
  { hex:"624b", char:"手", gloss:"mano / medio", sample:"手段（しゅだん）", strokes:4 },
  { hex:"5a92", char:"媒", gloss:"medio / mediación", sample:"媒体（ばいたい）", strokes:12 },
  { hex:"9014", char:"途", gloss:"ruta / camino", sample:"途中（とちゅう）", strokes:10 },
  { hex:"4ee5", char:"以", gloss:"por / mediante", sample:"以上・以下・以来", strokes:5 },
  { hex:"5f79", char:"役", gloss:"papel / función", sample:"役割（やくわり）", strokes:7 },
];

/* ---- assets (nums) ---- */
const NUMS: Record<string, any> = {
  "539f": require("../../../../assets/kanjivg/n3/539f_nums.webp"),
  "56e0": require("../../../../assets/kanjivg/n3/56e0_nums.webp"),
  "7531": require("../../../../assets/kanjivg/n3/7531_nums.webp"),
  "7d4c": require("../../../../assets/kanjivg/n3/7d4c_nums.webp"),
  "6cd5": require("../../../../assets/kanjivg/n3/6cd5_nums.webp"),
  "624b": require("../../../../assets/kanjivg/n3/624b_nums.webp"),
  "5a92": require("../../../../assets/kanjivg/n3/5a92_nums.webp"),
  "9014": require("../../../../assets/kanjivg/n3/9014_nums.webp"),
  "4ee5": require("../../../../assets/kanjivg/n3/4ee5_nums.webp"),
  "5f79": require("../../../../assets/kanjivg/n3/5f79_nums.webp"),
};

/* -------- Pantalla -------- */
export default function N3_B6_U2_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const heroH = 240;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ScrollView sencillo */}
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
            <Text style={styles.heroTitle}>B6 — 02 Solicitudes suaves（〜ていただけませんか）</Text>
            <View style={styles.chipsRow}>
              <Pressable style={styles.chip} onPress={()=>speakJa("ここに ごしょめい して いただけませんか")} hitSlop={8}>
                <Text style={styles.chipTxt}>ご署名していただけませんか</Text>
                <MCI name="volume-high" size={16} color="#fff" />
              </Pressable>
              <Pressable style={styles.chip} onPress={()=>speakJa("すこし おまち いただけますか")} hitSlop={8}>
                <Text style={styles.chipTxt}>少々お待ちいただけますか</Text>
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
  const BANK = ["ていただけませんか","ていただけますか","てもらえますか","てください"];
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
