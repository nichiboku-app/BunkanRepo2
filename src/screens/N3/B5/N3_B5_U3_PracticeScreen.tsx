// src/screens/N3/B5/N3_B5_U3_PracticeScreen.tsx
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
type RootStackParamList = { N3_B5_U3_Practice: undefined | { from?: string } };
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B5_U3_Practice">;
type Quiz = { id:number; stem:string; options:string[]; answer:string; jp_full:string; es:string; why:string; };
type Fill = { id:number; hint:string; jp_base:string; answer:string; jp_full:string; es:string; why:string; };
type Kanji = { hex:string; char:string; gloss:string; sample:string; strokes:number };

const speakJa = (t:string) => Speech.speak(t, { language:"ja-JP", rate:0.96, pitch:1.05 });

/* --- Audio: secuencias para los 2 patrones (HERO) --- */
const AUDIO_TRACKS: Record<string, { label:string; lines:string[] }> = {
  taishite: {
    label: "に対して",
    lines: [
      "に たいして。",
      "彼は 子ども に 対して やさしい。",
      "A クラス は 静かな の に 対して、B クラス は にぎやか だ。"
    ],
  },
  kurabete: {
    label: "に比べて",
    lines: [
      "に くらべて。",
      "今年 は 去年 に 比べて 雨が多い。",
      "東京 に 比べて 大阪 は 人が 気さく だ。"
    ],
  },
};

// Reproducir una secuencia con fallback (Android a veces es quisquilloso)
const speakSeq = async (
  lines: string[],
  opts: Partial<Speech.SpeechOptions> = {}
) => new Promise<void>((resolve) => {
  let i = 0;
  let started = false;

  const play = () => {
    if (i >= lines.length) return resolve();
    started = true;
    Speech.speak(lines[i++], {
      language: "ja-JP",
      rate: 0.96,
      pitch: 1.05,
      onDone: play,
      onStopped: () => resolve(),
      onError: () => resolve(),
      ...opts,
    });
  };

  setTimeout(() => {
    play();
    // Fallback: si en 300ms no arrancó, al menos habla la primera línea
    setTimeout(() => {
      if (!started) {
        Speech.speak(lines[0], {
          language: "ja-JP",
          rate: 0.96,
          pitch: 1.05,
          onDone: () => resolve(),
          onStopped: () => resolve(),
          onError: () => resolve(),
          ...opts,
        });
      }
    }, 300);
  }, 0);
});

/* -------- Guía -------- */
const GUIA_ES = `⚖️ Relación y contraste — 「〜に対して」「〜に比べて」

1) 「N／文 普通形」に対して
   ・‘respecto a / hacia / en contraste con’.
   ・Usos:
     a) actitud/acción dirigida a un objeto/persona: 彼は子供に対してやさしい。
     b) contraste A vs B: Aは静かなのに対して、Bはにぎやかだ。

2) 「N／文 普通形」に比べて
   ・‘comparado con / en comparación con’.
   ・Se usa para medir diferencias: 去年に比べて、売上が増えた。

Matices:
・に対して = dirección/actitud o contraste claro A⇄B.
・に比べて = comparación cuantitativa/cualitativa con un referente.`;

const GUIA_JA = `⚖️「〜に対して」「〜に比べて」

① に対して
　相手・対象への態度／行動、または対比。例：彼は部下に対して厳しい。Aに対してBだ。

② に比べて
　基準Nとくらべての評価。例：去年に比べて、気温が低い。`;

/* -------- Tabla -------- */
type Row = { patron:string; forma:string; tradu:string; nota:string };
const GRAM_TABLE: Row[] = [
  { patron:"対象・態度", forma:"N に対して／に対し（て）", tradu:"hacia / respecto a", nota:"formal: に対し" },
  { patron:"対比", forma:"A に対して B", tradu:"en contraste con A, B", nota:"A⇄B" },
  { patron:"比較", forma:"N に比べて", tradu:"comparado con N", nota:"基準N＋評価" },
];

/* -------- Práctica elegir (12) -------- */
const PRACTICE: Quiz[] = [
  { id:1, stem:"彼は子ども（　　　）とてもやさしい。", options:["に対して","に比べて","について"], answer:"に対して", jp_full:"彼は子どもに対してとてもやさしい。", es:"Él es muy amable con los niños.", why:"Actitud dirigida → に対して。" },
  { id:2, stem:"今年は去年（　　　）雨が多い。", options:["に比べて","に対して","によっては"], answer:"に比べて", jp_full:"今年は去年に比べて雨が多い。", es:"Este año, comparado con el anterior, llueve más.", why:"Comparación con referente → に比べて。" },
  { id:3, stem:"A社は保守的なの（　　　）、B社は挑戦的だ。", options:["に対して","に比べて","について"], answer:"に対して", jp_full:"A社は保守的なのに対して、B社は挑戦的だ。", es:"La empresa A es conservadora, en contraste la B es desafiante.", why:"Contraste A⇄B → に対して。" },
  { id:4, stem:"日本人（　　　）韓国人は辛い料理をよく食べると言われる。", options:["に比べて","に対して","について"], answer:"に比べて", jp_full:"日本人に比べて韓国人は辛い料理をよく食べると言われる。", es:"Se dice que, comparados con los japoneses, los coreanos comen más picante.", why:"Comparación → に比べて。" },
  { id:5, stem:"この規則は未成年者（　　　）厳しく適用される。", options:["に対して","に比べて","によって"], answer:"に対して", jp_full:"この規則は未成年者に対して厳しく適用される。", es:"Esta norma se aplica estrictamente a los menores.", why:"‘hacia / respecto a’ un grupo → に対して。" },
  { id:6, stem:"首都圏（　　　）地方は家賃が安い。", options:["に比べて","に対して","については"], answer:"に比べて", jp_full:"首都圏に比べて地方は家賃が安い。", es:"Comparado con el área metropolitana, en provincias el alquiler es más barato.", why:"Comparación → に比べて。" },
  { id:7, stem:"彼の親（　　　）態度は失礼だ。", options:["に対して","に比べて","について"], answer:"に対して", jp_full:"彼の親に対して態度は失礼だ。", es:"Su actitud hacia sus padres es grosera.", why:"Actitud dirigida → に対して。" },
  { id:8, stem:"去年（　　　）観光客が減った。", options:["に比べて","に対して","によっては"], answer:"に比べて", jp_full:"去年に比べて観光客が減った。", es:"Comparado con el año pasado, los turistas disminuyeron.", why:"Comparación temporal → に比べて。" },
  { id:9, stem:"Aクラスは静かなの（　　　）、Bクラスはにぎやかだ。", options:["に対して","に比べて","について"], answer:"に対して", jp_full:"Aクラスは静かなのに対して、Bクラスはにぎやかだ。", es:"La clase A es tranquila; en cambio, la B es bulliciosa.", why:"Contraste → に対して。" },
  { id:10, stem:"東京（　　　）大阪は人が気さくだと言われる。", options:["に比べて","に対して","について"], answer:"に比べて", jp_full:"東京に比べて大阪は人が気さくだと言われる。", es:"Se dice que, comparada con Tokio, Osaka tiene gente más abierta.", why:"Comparación de ciudades → に比べて。" },
  { id:11, stem:"この先生は生徒（　　　）きびしい。", options:["に対して","に比べて","について"], answer:"に対して", jp_full:"この先生は生徒に対してきびしい。", es:"Este profesor es estricto con los alumnos.", why:"Actitud hacia un objeto → に対して。" },
  { id:12, stem:"兄（　　　）私は運動が苦手だ。", options:["に比べて","に対して","については"], answer:"に比べて", jp_full:"兄に比べて私は運動が苦手だ。", es:"Comparado con mi hermano, soy malo en deportes.", why:"Comparación familiar → に比べて。" },
];

/* -------- EXTRA rellenar (6) -------- */
const EXTRA: Fill[] = [
  { id:1, hint:"actitud dirigida", jp_base:"お客様____ ていねいに説明してください。", answer:"に対して", jp_full:"お客様に対してていねいに説明してください。", es:"Explique con cortesía a los clientes, por favor.", why:"対象→に対して。" },
  { id:2, hint:"contraste A⇄B", jp_base:"地方はのどかな____、都会は便利だ。", answer:"のに対して", jp_full:"地方はのどかなのに対して、都会は便利だ。", es:"El campo es apacible; en cambio, la ciudad es conveniente.", why:"対比のに対して。" },
  { id:3, hint:"comparación", jp_base:"今年____ 去年より寒い。", answer:"に比べて", jp_full:"今年に比べて去年より寒い。", es:"Comparado con este año, el pasado fue más frío.", why:"比較→に比べて。" },
  { id:4, hint:"hacia", jp_base:"環境問題____ 企業の責任は大きい。", answer:"に対して", jp_full:"環境問題に対して企業の責任は大きい。", es:"Respecto al medioambiente, la responsabilidad de las empresas es grande.", why:"対象→に対して。" },
  { id:5, hint:"comparar grupos", jp_base:"男性____ 女性の方が平均寿命が長い。", answer:"に比べて", jp_full:"男性に比べて女性の方が平均寿命が長い。", es:"Comparadas con los hombres, las mujeres viven más.", why:"比較→に比べて。" },
  { id:6, hint:"contraste claro", jp_base:"A店は高級な____、B店は手頃だ。", answer:"のに対して", jp_full:"A店は高級なのに対して、B店は手頃だ。", es:"La tienda A es de lujo; en contraste, la B es accesible.", why:"対比→のに対して。" },
];

/* -------- Kanji (10) -------- */
const KANJI: Kanji[] = [
  { hex:"6bd4", char:"比", gloss:"comparar", sample:"比較（ひかく）", strokes:4 },
  { hex:"5bfe", char:"対", gloss:"oponer/para", sample:"対して（たいして）", strokes:7 },
  { hex:"8f03", char:"較", gloss:"cotejar", sample:"比較（ひかく）", strokes:13 },
  { hex:"53cd", char:"反", gloss:"contra", sample:"反対（はんたい）", strokes:4 },
  { hex:"8cdb", char:"賛", gloss:"aprobar", sample:"賛成（さんせい）", strokes:15 },
  { hex:"5426", char:"否", gloss:"negar", sample:"否定（ひてい）", strokes:7 },
  { hex:"5897", char:"増", gloss:"aumentar", sample:"増加（ぞうか）", strokes:14 },
  { hex:"6e1b", char:"減", gloss:"disminuir", sample:"減少（げんしょう）", strokes:12 },
  { hex:"9055", char:"違", gloss:"diferir", sample:"違い（ちがい）", strokes:13 },
  { hex:"540c", char:"同", gloss:"igual", sample:"同様（どうよう）", strokes:6 },
];

/* ---- assets (nums) ---- */
const HAS_WEB: Record<string, boolean> = {};
const STROKES_NUMS: Record<string, ImageSourcePropType> = {
  "6bd4": require("../../../../assets/kanjivg/n3/6bd4_nums.webp"),
  "5bfe": require("../../../../assets/kanjivg/n3/5bfe_nums.webp"),
  "8f03": require("../../../../assets/kanjivg/n3/8f03_nums.webp"),
  "53cd": require("../../../../assets/kanjivg/n3/53cd_nums.webp"),
  "8cdb": require("../../../../assets/kanjivg/n3/8cdb_nums.webp"),
  "5426": require("../../../../assets/kanjivg/n3/5426_nums.webp"),
  "5897": require("../../../../assets/kanjivg/n3/5897_nums.webp"),
  "6e1b": require("../../../../assets/kanjivg/n3/6e1b_nums.webp"),
  "9055": require("../../../../assets/kanjivg/n3/9055_nums.webp"),
  "540c": require("../../../../assets/kanjivg/n3/540c_nums.webp"),
};
const STROKES_WEB: Partial<Record<string, ImageSourcePropType>> = {};
const strokeSrc = (hex:string): ImageSourcePropType | null =>
  (HAS_WEB[hex] && STROKES_WEB[hex]) ? STROKES_WEB[hex]! : (STROKES_NUMS[hex] ?? null);

/* -------- Pantalla -------- */
export default function N3_B5_U3_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();
  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange:[-100,0,200], outputRange:[-80,60,100] });
  const scale = scrollY.interpolate({ inputRange:[-100,0], outputRange:[1.08,1] });

  // Audio en HERO
  const [speaking, setSpeaking] = useState<null | "taishite" | "kurabete">(null);
  const playTrack = async (key: "taishite" | "kurabete") => {
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
          source={require("../../../../assets/images/n3/b5_u3.webp")}
          style={[styles.heroImg, { transform:[{ translateY:tY },{ scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)","rgba(0,0,0,0.45)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.heroContent} pointerEvents="box-none">
          <Text style={styles.heroTitle}>B5 — 03 Relación y contraste（に対して・に比べて）</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋に対して</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>A に対して B</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>N＋に比べて</Text></View>
          </View>

          {/* Audio buttons */}
          <View style={styles.audioRow} pointerEvents="box-none">
            <Pressable
              onPress={()=>playTrack("taishite")}
              style={[styles.audioBtn, speaking==="taishite" && styles.audioBtnActive]}
            >
              <MCI name={speaking==="taishite" ? "stop-circle" : "play-circle"} size={18} color="#fff" />
              <Text style={styles.audioTxt}>に対して</Text>
            </Pressable>

            <Pressable
              onPress={()=>playTrack("kurabete")}
              style={[styles.audioBtn, speaking==="kurabete" && styles.audioBtnActive]}
            >
              <MCI name={speaking==="kurabete" ? "stop-circle" : "play-circle"} size={18} color="#fff" />
              <Text style={styles.audioTxt}>に比べて</Text>
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
          <Text style={[styles.h2, { marginTop: 10 }]}>🧭 ガイド — にほんご（かな）</Text>
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
          <Text style={styles.h2}>✅ Práctica — Elige la forma correcta (12)</Text>
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
  const BANK = ["に対して","に比べて","のに対して"];
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
  audioBtn:{
    flexDirection:"row",
    alignItems:"center",
    gap:6,
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:999,
    backgroundColor:"rgba(255,255,255,0.22)",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.30)"
  },
  audioBtnActive:{
    backgroundColor:"rgba(16,185,129,0.35)",
    borderColor:"rgba(16,185,129,0.55)"
  },
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
