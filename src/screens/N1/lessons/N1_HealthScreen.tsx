// src/screens/N1/lessons/N1_HealthScreen.tsx
// (Mismo esquema/estilos que Environment/Law — con GRAMÁTICAS N1 NUEVAS)

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";
import { coverFor } from "../covers";

type Nav = NativeStackNavigationProp<RootStackParamList, "N1Home">;
const { width } = Dimensions.get("window");
const PALETTE = { bg:"#0B0F19", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.12)", blue:"#2B7FFF", aqua:"#33DAC6", text:"#FFFFFF" };

function speakJP(t:string){ try{ Speech.stop(); Speech.speak(t,{language:"ja-JP",rate:1.0}); }catch{} }
function speakES(t:string){ try{ Speech.stop(); Speech.speak(t,{language:"es-MX",rate:1.0}); }catch{} }

function Section({ title, children }:{title:string; children:React.ReactNode}){
  return(<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>);
}
function PillBtn({label,onPress,kind="primary",disabled}:{label:string;onPress:()=>void;kind?:"primary"|"ghost";disabled?:boolean;}){
  const base=kind==="primary"?styles.primaryBtn:styles.ghostBtn;
  const baseTxt=kind==="primary"?styles.primaryTxt:styles.ghostTxt;
  return(<Pressable style={[base,disabled&&{opacity:0.5}]} onPress={onPress} disabled={disabled}><Text style={baseTxt}>{label}</Text></Pressable>);
}
function Choice({label,selected,state,onPress,disabled}:{label:string;selected?:boolean;state?:"neutral"|"correct"|"wrong";onPress:()=>void;disabled?:boolean;}){
  let bg="#101827";
  if(selected) bg="#2742A0";
  if(state==="correct") bg="#1F7A3D";
  if(state==="wrong") bg="#7A1F1F";
  return(<Pressable style={[styles.choice,{backgroundColor:bg}]} onPress={onPress} disabled={!!disabled}><Text style={styles.choiceTxt}>{label}</Text></Pressable>);
}

/* Vocab 20 (salud pública) */
type Vocab = { jp:string; reading:string; es:string };
const VOCAB: Vocab[] = [
  { jp:"公衆衛生", reading:"こうしゅうえいせい", es:"salud pública" },
  { jp:"疫学", reading:"えきがく", es:"epidemiología" },
  { jp:"監視体制", reading:"かんしたいせい", es:"sistema de vigilancia" },
  { jp:"予防接種", reading:"よぼうせっしゅ", es:"vacunación" },
  { jp:"有効性", reading:"ゆうこうせい", es:"eficacia" },
  { jp:"安全性", reading:"あんぜんせい", es:"seguridad (de fármaco)" },
  { jp:"対策", reading:"たいさく", es:"medidas" },
  { jp:"集団免疫", reading:"しゅうだんめんえき", es:"inmunidad de rebaño" },
  { jp:"保健指標", reading:"ほけんしひょう", es:"indicadores de salud" },
  { jp:"健康格差", reading:"けんこうかくさ", es:"desigualdades en salud" },
  { jp:"リスク要因", reading:"リスクよういん", es:"factor de riesgo" },
  { jp:"罹患率", reading:"りかんりつ", es:"tasa de morbilidad" },
  { jp:"死亡率", reading:"しぼうりつ", es:"tasa de mortalidad" },
  { jp:"検査体制", reading:"けんさたいせい", es:"capacidad diagnóstica" },
  { jp:"行動変容", reading:"こうどうへんよう", es:"cambio de conducta" },
  { jp:"保健所", reading:"ほけんじょ", es:"centro de salud pública" },
  { jp:"啓発", reading:"けいはつ", es:"sensibilización" },
  { jp:"慢性疾患", reading:"まんせいしっかん", es:"enfermedad crónica" },
  { jp:"合併症", reading:"がっぺいしょう", es:"complicación" },
  { jp:"対人距離", reading:"たいじんきょり", es:"distancia interpersonal" },
];

/* Gramática N1 NUEVA (8 puntos) */
type GPoint = { pat:string; uso:string; tradu:string; matices:string; ejJP:string; ejES:string };
const GRAMMAR: GPoint[] = [
  { pat:"〜たりとも…ない", uso:"Negación absoluta hasta la unidad mínima.", tradu:"ni siquiera…", matices:"Normas/alertas tajantes.", ejJP:"一日たりとも監視を緩めるわけにはいかない。", ejES:"Ni un solo día podemos relajar la vigilancia." },
  { pat:"〜といえども", uso:"Concesión alta: incluso X (autoridad/excepción).", tradu:"aunque / incluso si (sea X)", matices:"Formal, contrasta expectativa.", ejJP:"専門家といえどもデータなしに断定はできない。", ejES:"Aun siendo experto, no puede afirmarlo sin datos." },
  { pat:"〜を余儀なくされる", uso:"Ser forzado por circunstancias.", tradu:"verse obligado a", matices:"Reportes institucionales.", ejJP:"感染状況により予定変更を余儀なくされた。", ejES:"La situación obligó a cambiar el plan." },
  { pat:"〜べくもない", uso:"Imposibilidad objetiva de lograr X.", tradu:"no es posible / no cabe esperar", matices:"Evaluación sobria.", ejJP:"短期で慢性疾患が解決できると考えるべくもない。", ejES:"No cabe esperar resolver lo crónico en el corto plazo." },
  { pat:"〜をもってしても", uso:"Incluso con el mejor medio/recurso.", tradu:"ni siquiera con…", matices:"Resalta dificultad.", ejJP:"最新機器をもってしても偽陰性はゼロにできない。", ejES:"Ni con equipos de última generación se elimina todo falso negativo." },
  { pat:"〜いかんでは", uso:"Resultado depende del estado/variable.", tradu:"según / dependiendo de", matices:"Cláusulas de política.", ejJP:"年齢いかんでは投与量を再調整する。", ejES:"Dependiendo de la edad, se reajusta la dosis." },
  { pat:"〜ずにはおかない", uso:"Algo inevitablemente provoca X (reacción/acción).", tradu:"inevitablemente llevará a", matices:"Causa fuerte (psicol./social).", ejJP:"透明性の欠如は不信を招かずにはおかない。", ejES:"La falta de transparencia inevitablemente genera desconfianza." },
  { pat:"〜に堪えない", uso:"No ser tolerable/digno (de ver/leer/escuchar).", tradu:"no soportable / no apto para", matices:"Juicio crítico formal.", ejJP:"根拠なき誹謗は論として聞くに堪えない。", ejES:"La difamación sin evidencia no es tolerable como argumento." },
];

/* Lecturas 3 x 5 (igual que antes) */
type RQ = { id:string; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string };
type Reading = { id:string; title:string; jp:string; es:string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id:"health-r1",
    title:"Gobernanza y coordinación",
    jp:"本テキストはテーマに関する背景と課題を概説する。複数の利害が交錯し、調整が不可欠である。",
    es:"El texto describe el contexto, retos y la necesidad de conciliar intereses.",
    questions:[
      { id:"health-r1-q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心命題。", expES:"Idea principal." },
      { id:"health-r1-q2", prompt:"課題として挙げられるのは？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"本文の課題。", expES:"Problema señalado." },
      { id:"health-r1-q3", prompt:"語彙の意味として最も近いのは？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"health-r1-q4", prompt:"本文の態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"実務的。", expES:"Equilibrado." },
      { id:"health-r1-q5", prompt:"示唆された解決策は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
  {
    id:"health-r2",
    title:"Diseño institucional basado en datos",
    jp:"制度設計は現場の実態に即して見直されるべきだ。データに基づく検証が鍵となる。",
    es:"El diseño institucional debe revisarse conforme a la realidad; la verificación basada en datos es clave.",
    questions:[
      { id:"health-r2-q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心命題。", expES:"Idea principal." },
      { id:"health-r2-q2", prompt:"課題として挙げられるのは？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"本文の課題。", expES:"Problema señalado." },
      { id:"health-r2-q3", prompt:"語彙の意味として最も近いのは？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"health-r2-q4", prompt:"本文の態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"実務的。", expES:"Práctico." },
      { id:"health-r2-q5", prompt:"示唆された解決策は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
  {
    id:"health-r3",
    title:"Transparencia y confianza",
    jp:"利点とリスクは表裏一体であり、透明性の確保が信頼に直結する。",
    es:"Beneficios y riesgos coexisten; asegurar transparencia se vincula con la confianza.",
    questions:[
      { id:"health-r3-q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心命題。", expES:"Idea principal." },
      { id:"health-r3-q2", prompt:"課題として挙げられるのは？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"本文の課題。", expES:"Problema señalado." },
      { id:"health-r3-q3", prompt:"語彙の意味として最も近いのは？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"health-r3-q4", prompt:"本文の態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"実務的。", expES:"Equilibrado." },
      { id:"health-r3-q5", prompt:"示唆された解決策は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
];

/* Actividades 2x8 — actualizadas a las NUEVAS gramáticas */
type Q = { id:string; type:"kanji"|"vocab"|"grammar"|"reading"; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string; tip?:string; };
const ACTIVITY_A: Q[] = [
  { id:"ha1", type:"grammar", prompt:"『〜たりとも…ない』の用法は？", choices:["最小単位でも否定","仮定","逆接","例示"], answerIndex:0, expJP:"一分・一日など最小単位も否定。", expES:"Negación absoluta (ni siquiera…)." },
  { id:"ha2", type:"grammar", prompt:"『〜を余儀なくされる』は？", choices:["状況に強いられる","丁寧依頼","願望","禁止"], answerIndex:0, expJP:"外的要因でやむなく。", expES:"Forzado por las circunstancias." },
  { id:"ha3", type:"grammar", prompt:"『〜べくもない』のニュアンスは？", choices:["不可能客観","軽い推量","命令","丁寧断り"], answerIndex:0, expJP:"客観的不可能。", expES:"No es posible objetivamente." },
  { id:"ha4", type:"reading", prompt:"r1の主旨は？", choices:["利害調整の必要","広告戦略","価格交渉","観光促進"], answerIndex:0, expJP:"利害調整。", expES:"Conciliar intereses." },
  { id:"ha5", type:"vocab", prompt:"『検査体制』に最も近いのは？", choices:["capacidad diagnóstica","capacidad hotelera","capacidad vial","capacidad fiscal"], answerIndex:0, expJP:"検査の仕組み。", expES:"Sistema para pruebas." },
  { id:"ha6", type:"grammar", prompt:"『〜いかんでは』の訳は？", choices:["場合によっては","にもかかわらず","すなわち","あえて"], answerIndex:0, expJP:"条件により。", expES:"Dependiendo de / según." },
  { id:"ha7", type:"grammar", prompt:"『〜といえども』の使い方は？", choices:["権威に対する譲歩","原因","結果","並列"], answerIndex:0, expJP:"高い譲歩。", expES:"Concesión alta (incluso si es X)." },
  { id:"ha8", type:"vocab", prompt:"『行動変容』は？", choices:["cambio de conducta","cambio de horario","cambio de ruta","cambio de turno"], answerIndex:0, expJP:"行動が変わること。", expES:"Modificar conductas." },
];

const ACTIVITY_B: Q[] = [
  { id:"hb1", type:"grammar", prompt:"『〜をもってしても』の含意は？", choices:["最高手段でも困難","簡単","命令","謝罪"], answerIndex:0, expJP:"最高の手段でも難しい。", expES:"Ni siquiera con el mejor medio." },
  { id:"hb2", type:"grammar", prompt:"『〜ずにはおかない』は？", choices:["必然的に引き起こす","控えめ要請","逆接","例示"], answerIndex:0, expJP:"必然の反応。", expES:"Inevitablemente provoca." },
  { id:"hb3", type:"grammar", prompt:"『〜に堪えない』に最も近いのは？", choices:["耐えられない/不適当","軽い称賛","義務","可能"], answerIndex:0, expJP:"耐えられない評価。", expES:"No tolerable/apto." },
  { id:"hb4", type:"reading", prompt:"r3の核心は？", choices:["透明性→信頼","速度→信頼","広告→信頼","秘匿→信頼"], answerIndex:0, expJP:"透明性が鍵。", expES:"Transparencia genera confianza." },
  { id:"hb5", type:"vocab", prompt:"『有効性』は？", choices:["eficacia","eficiencia","inocuidad","utilidad fiscal"], answerIndex:0, expJP:"どれだけ効くか。", expES:"Grado en que funciona." },
  { id:"hb6", type:"grammar", prompt:"次の文の自然な補完：『最新機器＿＿偽陰性はゼロにできない。』", choices:["をもってしても","といえども","たりとも","に堪えない"], answerIndex:0, expJP:"固定句的に自然。", expES:"Colocación natural." },
  { id:"hb7", type:"grammar", prompt:"『専門家＿＿データなしに断定はできない。』", choices:["といえども","たりとも","をもってしても","に堪えない"], answerIndex:0, expJP:"譲歩。", expES:"Concesión alta." },
  { id:"hb8", type:"grammar", prompt:"『一日＿＿監視を緩めるな』の空所は？", choices:["たりとも","といえども","ずには","いかんでは"], answerIndex:0, expJP:"最小単位の否定。", expES:"Ni un solo…", },
];

/* ReadingBlock (igual) */
function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const correctCount = useMemo(
    () => data.questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0),
    [answers, data.questions]
  );
  const onPick = (q: RQ, idx: number) => { const ok = idx === q.answerIndex; ok ? playCorrect() : playWrong(); setAnswers(p => ({ ...p, [q.id]: idx })); };
  return (
    <View style={styles.readingCard}>
      <Text style={styles.readingTitle}>{data.title}</Text>
      <Text style={styles.listenJP}>{data.jp}</Text>
      <View style={styles.listenBtns}>
        <PillBtn label="Reproducir lectura (JP)" onPress={() => speakJP(data.jp)} />
        <PillBtn label={showES ? "Ocultar traducción" : "Mostrar traducción"} kind="ghost" onPress={() => setShowES(v=>!v)} />
      </View>
      {showES && (<><Text style={styles.listenESTitle}>Traducción (ES)</Text><Text style={styles.listenES}>{data.es}</Text></>)}
      <View style={{ height: 8 }} />
      {data.questions.map((q, idx) => {
        const sel = answers[q.id];
        const state: "neutral" | "correct" | "wrong" = sel == null ? "neutral" : sel === q.answerIndex ? "correct" : "wrong";
        return (
          <View key={q.id} style={styles.cardQ}>
            <Text style={styles.qMeta}>{idx + 1}/{data.questions.length} · LECTURA</Text>
            <Text style={styles.prompt}>{q.prompt}</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {q.choices.map((c, i) => (
                <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i ? state : "neutral"} onPress={() => onPick(q, i)} />
              ))}
            </View>
            {sel != null && (
              <View style={styles.expBox}>
                <Text style={styles.expHeader}>{sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}</Text>
                <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                <Text style={styles.expES}>【ES】{q.expES}</Text>
              </View>
            )}
          </View>
        );
      })}
      <Text style={styles.scoreTxt}>Resultado: {correctCount}/{data.questions.length}</Text>
    </View>
  );
}

/* Screen */
export default function N1_HealthScreen(){
  const nav = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answersA, setAnswersA] = useState<Record<string, number | undefined>>({});
  const [answersB, setAnswersB] = useState<Record<string, number | undefined>>({});
  const scoreA = useMemo(()=>ACTIVITY_A.reduce((a,q)=>a+(((answersA[q.id]??-1)===q.answerIndex)?1:0),0),[answersA]);
  const scoreB = useMemo(()=>ACTIVITY_B.reduce((a,q)=>a+(((answersB[q.id]??-1)===q.answerIndex)?1:0),0),[answersB]);

  return (
    <View style={{ flex:1, backgroundColor: PALETTE.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Salud pública</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key:"content" }]}
        keyExtractor={(it)=>it.key}
        contentContainerStyle={{ paddingBottom:120 }}
        renderItem={()=>(<>
          {/* HERO */}
          <View style={styles.hero}>
            <ExpoImage source={coverFor("health")} style={styles.heroImg} contentFit="cover"/>
            <LinearGradient colors={["rgba(0,0,0,0.35)","rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject}/>
            <View style={styles.heroIn}>
              <Text style={styles.kicker}>N1 · Contenido aplicado</Text>
              <Text style={styles.heroTitle}>Salud pública y sistemas</Text>
              <Text style={styles.heroSub}>Vocabulario técnico, gramática N1 real y lecturas aplicadas.</Text>
            </View>
          </View>

          {/* VOCAB */}
          <Section title="Vocabulario clave (20)">
            <View style={{ gap: 8 }}>
              {VOCAB.map((w,i)=>(
                <View key={i} style={styles.wordCard}>
                  <View style={{ flex:1 }}>
                    <Text style={styles.wordJP}>{w.jp} <Text style={styles.wordRd}>{w.reading}</Text></Text>
                    <Text style={styles.wordES}>{w.es}</Text>
                  </View>
                  <Pressable style={styles.play} onPress={()=>speakJP(w.jp)}><Text style={styles.playTxt}>JP</Text></Pressable>
                  <Pressable style={styles.play} onPress={()=>speakES(w.es)}><Text style={styles.playTxt}>ES</Text></Pressable>
                </View>
              ))}
            </View>
          </Section>

          {/* GRAMMAR */}
          <Section title="Gramática en contexto (N1 · 8 puntos)">
            <View style={{ gap: 12 }}>
              {GRAMMAR.map((g,i)=>(
                <View key={i} style={styles.gramCard}>
                  <Text style={styles.gramPat}>{g.pat}</Text>
                  <View style={{ flexDirection:"row", gap:8, marginTop:6, flexWrap:"wrap" }}>
                    <PillBtn label="🔊 Pronunciación (JP)" kind="ghost" onPress={()=>speakJP(g.pat)} />
                    <PillBtn label="🎧 Explicación (ES)" kind="ghost" onPress={()=>speakES(`${g.tradu}. ${g.uso}. ${g.matices}.`)} />
                  </View>
                  <Text style={styles.gramH}>¿Cuándo se usa?</Text><Text style={styles.gramTxt}>{g.uso}</Text>
                  <Text style={styles.gramH}>Traducción natural</Text><Text style={styles.gramTxt}>{g.tradu}</Text>
                  <Text style={styles.gramH}>Matices</Text><Text style={styles.gramTxt}>{g.matices}</Text>
                  <Text style={styles.gramExJP}>例) {g.ejJP}</Text><Text style={styles.gramExES}>→ {g.ejES}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* LECTURAS */}
          <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
            <View style={{ gap: 14 }}>
              {READING_PASSAGES.map((b)=>(<ReadingBlock key={b.id} data={b}/>))}
            </View>
          </Section>

          {/* ACTIVIDAD A */}
          <Section title="Actividad A (8 preguntas)">
            <View style={{ gap: 12 }}>
              {ACTIVITY_A.map((q,idx)=>{
                const sel = answersA[q.id];
                const state: "neutral"|"correct"|"wrong" = sel==null?"neutral": sel===q.answerIndex?"correct":"wrong";
                return (
                  <View key={q.id} style={styles.cardQ}>
                    <Text style={styles.qMeta}>{idx+1}/{ACTIVITY_A.length} · {q.type.toUpperCase()}</Text>
                    <Text style={styles.prompt}>{q.prompt}</Text>
                    <View style={{ gap: 8, marginTop: 8 }}>
                      {q.choices.map((c,i)=>(
                        <Choice
                          key={i}
                          label={c}
                          selected={sel===i && state==="neutral"}
                          state={sel===i?state:"neutral"}
                          onPress={()=>{
                            (i===q.answerIndex?playCorrect():playWrong());
                            setAnswersA(p=>({...p,[q.id]:i}));
                          }}
                        />
                      ))}
                    </View>
                    {sel!=null && (
                      <View style={styles.expBox}>
                        <Text style={styles.expHeader}>{sel===q.answerIndex?"✅ 正解 / ¡Correcto!":"❌ 不正解 / Incorrecto"}</Text>
                        <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                        <Text style={styles.expES}>【ES】{q.expES}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <Text style={styles.scoreTxt}>Resultado: {scoreA}/{ACTIVITY_A.length}</Text>
          </Section>

          {/* ACTIVIDAD B */}
          <Section title="Actividad B (8 preguntas)">
            <View style={{ gap: 12 }}>
              {ACTIVITY_B.map((q,idx)=>{
                const sel = answersB[q.id];
                const state: "neutral"|"correct"|"wrong" = sel==null?"neutral": sel===q.answerIndex?"correct":"wrong";
                return (
                  <View key={q.id} style={styles.cardQ}>
                    <Text style={styles.qMeta}>{idx+1}/{ACTIVITY_B.length} · {q.type.toUpperCase()}</Text>
                    <Text style={styles.prompt}>{q.prompt}</Text>
                    <View style={{ gap: 8, marginTop: 8 }}>
                      {q.choices.map((c,i)=>(
                        <Choice
                          key={i}
                          label={c}
                          selected={sel===i && state==="neutral"}
                          state={sel===i?state:"neutral"}
                          onPress={()=>{
                            (i===q.answerIndex?playCorrect():playWrong());
                            setAnswersB(p=>({...p,[q.id]:i}));
                          }}
                        />
                      ))}
                    </View>
                    {sel!=null && (
                      <View style={styles.expBox}>
                        <Text style={styles.expHeader}>{sel===q.answerIndex?"✅ 正解 / ¡Correcto!":"❌ 不正解 / Incorrecto"}</Text>
                        <Text style={styles.expJP}>【JP】{q.expJP}</Text>
                        <Text style={styles.expES}>【ES】{q.expES}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <Text style={styles.scoreTxt}>Resultado: {scoreB}/{ACTIVITY_B.length}</Text>
          </Section>
        </>)}
      />
    </View>
  );
}

/* styles (idénticos a Environment/Law) */
const styles = StyleSheet.create({
  topBar:{height:56+(StatusBar.currentHeight??0),paddingTop:(StatusBar.currentHeight??0),paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"rgba(8,12,18,0.8)",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:"rgba(255,255,255,0.08)"},
  topTitle:{color:"#EAF1FF",fontWeight:"900",fontSize:18},
  closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:999,backgroundColor:"rgba(255,255,255,0.08)"},
  closeTxt:{color:"#BFD9FF",fontWeight:"800"},

  hero:{margin:14,height:220,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,0.07)"},
  heroImg:{...StyleSheet.absoluteFillObject,width,height:220},
  heroIn:{flex:1,padding:16,justifyContent:"flex-end",gap:6},
  kicker:{color:"#C5FFF9",fontWeight:"900",letterSpacing:0.6},
  heroTitle:{color:"#FFF",fontSize:26,lineHeight:28,fontWeight:"900"},
  heroSub:{color:"rgba(255,255,255,0.9)"},

  section:{paddingHorizontal:14,paddingTop:8,paddingBottom:12},
  sectionTitle:{color:"#FFFFFF",fontWeight:"900",fontSize:16,marginBottom:8},

  wordCard:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",borderRadius:12,padding:10},
  wordJP:{color:"#FFFFFF",fontWeight:"900"},
  wordRd:{color:"rgba(255,255,255,0.75)",fontWeight:"700"},
  wordES:{color:"rgba(255,255,255,0.9)"},
  play:{backgroundColor:"#2B7FFF",paddingHorizontal:10,paddingVertical:8,borderRadius:10},
  playTxt:{color:"#EAF1FF",fontWeight:"900"},

  gramCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:12},
  gramPat:{color:"#8FF1F2",fontWeight:"900",marginBottom:6,fontSize:15},
  gramH:{color:"#CFE4FF",fontWeight:"900",marginTop:2},
  gramTxt:{color:"rgba(255,255,255,0.9)"},
  gramExJP:{color:"#FFFFFF",marginTop:6,fontWeight:"900"},
  gramExES:{color:"rgba(255,255,255,0.9)"},

  readingCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:14},
  readingTitle:{color:"#EAF1FF",fontWeight:"900",marginBottom:8,fontSize:15},

  cardQ:{backgroundColor:"#111727",borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,0.06)",padding:14},
  qMeta:{color:"rgba(255,255,255,0.6)",fontWeight:"800",marginBottom:6},
  prompt:{color:"white",fontSize:16,fontWeight:"900",lineHeight:22},
  choice:{paddingHorizontal:12,paddingVertical:12,borderRadius:10,borderWidth:1,borderColor:"rgba(255,255,255,0.06)"},
  choiceTxt:{color:"#EAF1FF",fontWeight:"800"},

  expBox:{marginTop:10,backgroundColor:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.18)",borderWidth:1,borderRadius:10,padding:10,gap:4},
  expHeader:{color:"#EAF1FF",fontWeight:"900"},
  expJP:{color:"#FFFFFF"},
  expES:{color:"rgba(255,255,255,0.92)"},
  scoreTxt:{color:"#D3FFF7",fontWeight:"900",textAlign:"center",marginTop:8},

  primaryBtn:{backgroundColor:PALETTE.blue,paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  primaryTxt:{color:"#EAF1FF",fontWeight:"900",letterSpacing:0.3},
  ghostBtn:{backgroundColor:"transparent",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  ghostTxt:{color:"rgba(255,255,255,0.9)",fontWeight:"900",letterSpacing:0.3},

  listenJP:{color:"#fff"},
  listenESTitle:{color:"#CFE4FF",fontWeight:"900",marginTop:8},
  listenES:{color:"rgba(255,255,255,0.95)"},
  listenBtns:{flexDirection:"row",gap:8,marginTop:8,flexWrap:"wrap"},
});
