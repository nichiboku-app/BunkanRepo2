// src/screens/N1/lessons/N1_OpinionScreen.tsx
// Screen N1 - Opinión y ensayo (mismo patrón de Environment/Law)

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../../../../types";
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

/* Vocab 20 (opinión/ensayo) */
type Vocab = { jp:string; reading:string; es:string };
const VOCAB: Vocab[] = [
  { jp:"論説", reading:"ろんせつ", es:"editorial/ensayo" },
  { jp:"根拠", reading:"こんきょ", es:"fundamento" },
  { jp:"立論", reading:"りつろん", es:"argumentación" },
  { jp:"反証", reading:"はんしょう", es:"refutación" },
  { jp:"説得力", reading:"せっとくりょく", es:"poder persuasivo" },
  { jp:"仮説", reading:"かせつ", es:"hipótesis" },
  { jp:"前提", reading:"ぜんてい", es:"premisa" },
  { jp:"論点", reading:"ろんてん", es:"punto de debate" },
  { jp:"帰結", reading:"きけつ", es:"conclusión" },
  { jp:"含意", reading:"がんい", es:"implicación" },
  { jp:"反論", reading:"はんろん", es:"contraargumento" },
  { jp:"比較衡量", reading:"ひかくこうりょう", es:"ponderación/comparación" },
  { jp:"価値判断", reading:"かちはんだん", es:"juicio de valor" },
  { jp:"論拠", reading:"ろんきょ", es:"evidencia/razón" },
  { jp:"説示", reading:"せつじ", es:"exposición" },
  { jp:"推論", reading:"すいろん", es:"inferencia" },
  { jp:"帰納", reading:"きのう", es:"inducción" },
  { jp:"演繹", reading:"えんえき", es:"deducción" },
  { jp:"整合性", reading:"せいごうせい", es:"coherencia" },
  { jp:"思考実験", reading:"しこうじっけん", es:"experimento mental" },
];

/* Gramática 7 (registro argumentativo N1) */
type GPoint = { pat:string; uso:string; tradu:string; matices:string; difs?:string; ejJP:string; ejES:string };
const GRAMMAR: GPoint[] = [
  { pat:"〜にしては", uso:"Resultado inesperado dado X.", tradu:"para ser...", matices:"Contraste/expectativa.", difs:"〜わりに。", ejJP:"短文にしては含意が深い。", ejES:"Para ser breve, tiene mucha implicación." },
  { pat:"〜とあって", uso:"Causa marcada por condición destacada.", tradu:"dado que / por ser", matices:"Noticioso/enfático.", difs:"〜ので。", ejJP:"重要論点とあって議論が白熱した。", ejES:"Al ser un punto clave, el debate se acaloró." },
  { pat:"〜に至るまで", uso:"Alcance hasta extremos.", tradu:"hasta / incluso", matices:"Cobertura amplia.", difs:"〜まで。", ejJP:"例示は哲学に至るまで幅広い。", ejES:"Los ejemplos abarcan hasta la filosofía." },
  { pat:"〜にもまして", uso:"Comparación enfática.", tradu:"más que", matices:"Valoración.", difs:"〜より。", ejJP:"論証では感情にもまして根拠が重視される。", ejES:"En la argumentación importa más la evidencia que la emoción." },
  { pat:"〜というものだ", uso:"Juicio categórico/definición social.", tradu:"eso es...", matices:"Sentencia general.", ejJP:"根拠なき主張は無責任というものだ。", ejES:"Una afirmación sin base es, por definición, irresponsable." },
  { pat:"〜に越したことはない", uso:"Recomendación ideal.", tradu:"lo mejor es", matices:"Prudente.", ejJP:"一次資料を読むに越したことはない。", ejES:"Lo mejor es leer fuentes primarias." },
  { pat:"〜ないではすまない", uso:"Obligación moral/social de hacer X.", tradu:"no puede quedar sin...", matices:"Deber normativo.", ejJP:"虚偽の引用は訂正しないではすまない。", ejES:"Una cita falsa no puede quedar sin corrección." },
];

/* Lecturas 3 x 5 */
type RQ = { id:string; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string };
type Reading = { id:string; title:string; jp:string; es:string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id:"op1",
    title:"Arquitectura del argumento",
    jp:"本テキストはテーマに関する背景と課題を概説する。複数の利害が交錯し、調整が不可欠である。",
    es:"El texto describe el contexto, retos y la necesidad de conciliar intereses.",
    questions:[
      { id:"op1q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心主張の整理。", expES:"Idea principal." },
      { id:"op1q2", prompt:"課題は？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"課題提示。", expES:"Problema señalado." },
      { id:"op1q3", prompt:"語彙の意味は？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"op1q4", prompt:"本文の態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"落ち着いた論調。", expES:"Tono equilibrado." },
      { id:"op1q5", prompt:"示唆は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
  {
    id:"op2",
    title:"Diseño y evidencia",
    jp:"制度設計は現場の実態に即して見直されるべきだ。データに基づく検証が鍵となる。",
    es:"El diseño institucional debe revisarse conforme a la realidad; la verificación basada en datos es clave.",
    questions:[
      { id:"op2q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心主張。", expES:"Idea principal." },
      { id:"op2q2", prompt:"課題は？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"課題提示。", expES:"Problema señalado." },
      { id:"op2q3", prompt:"語彙の意味は？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"op2q4", prompt:"態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"実務的。", expES:"Práctico/equilibrado." },
      { id:"op2q5", prompt:"示唆は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
  {
    id:"op3",
    title:"Transparencia y confianza",
    jp:"利点とリスクは表裏一体であり、透明性の確保が信頼に直結する。",
    es:"Beneficios y riesgos coexisten; asegurar transparencia se vincula con la confianza.",
    questions:[
      { id:"op3q1", prompt:"本文の主旨は？", choices:["要点の整理","無関係","誤情報","宣伝のみ"], answerIndex:0, expJP:"中心主張。", expES:"Idea principal." },
      { id:"op3q2", prompt:"課題は？", choices:["具体的課題","無関係","偶然","対話不要"], answerIndex:0, expJP:"課題提起。", expES:"Problema señalado." },
      { id:"op3q3", prompt:"語彙の意味は？", choices:["適切な定義","反対語","無関係","固有名詞"], answerIndex:0, expJP:"文脈定義。", expES:"Definición contextual." },
      { id:"op3q4", prompt:"態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"実務的。", expES:"Práctico." },
      { id:"op3q5", prompt:"示唆は？", choices:["改善策の提示","放置","回避","無視"], answerIndex:0, expJP:"改善提案。", expES:"Vías de mejora." },
    ]
  },
];

/* Actividades 2x8 */
type Q = { id:string; type:"kanji"|"vocab"|"grammar"|"reading"; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string; tip?:string; };
const ACTIVITY_A: Q[] = [
  { id:"oa1", type:"grammar", prompt:"『〜にしては』の語感は？", choices:["期待外れ/意外性","単なる並列","時間のみ","禁止"], answerIndex:0, expJP:"基準から外れた感じ。", expES:"Resultado inesperado respecto a X." },
  { id:"oa2", type:"vocab", prompt:"『論拠』の最適訳は？", choices:["evidencia/razón","valor","premisa dudosa","retórica"], answerIndex:0, expJP:"根拠。", expES:"Base/evidencia." },
  { id:"oa3", type:"reading", prompt:"op1の示唆は？", choices:["改善策の提示","広告増加","低日照","人事異動"], answerIndex:0, expJP:"改善提案。", expES:"Mejoras sugeridas." },
  { id:"oa4", type:"vocab", prompt:"『含意』は？", choices:["implicación","subtítulo","ejemplo","cita"], answerIndex:0, expJP:"暗に含む意味。", expES:"Significado implícito." },
  { id:"oa5", type:"grammar", prompt:"『〜ないではすまない』は？", choices:["道義的必然","軽い推量","許可","願望"], answerIndex:0, expJP:"しなければ済まない。", expES:"Debe hacerse por obligación social/moral." },
  { id:"oa6", type:"vocab", prompt:"『比較衡量』は？", choices:["ponderación","comparsa","comparativo débil","promoción"], answerIndex:0, expJP:"利害の比較衡量。", expES:"Sopesar razones." },
  { id:"oa7", type:"reading", prompt:"op2の鍵は？", choices:["データ検証","流行り言葉","感傷","広告費"], answerIndex:0, expJP:"エビデンス重視。", expES:"Comprobación con datos." },
  { id:"oa8", type:"grammar", prompt:"『〜にもまして』は？", choices:["比較強調","時点指定","否定婉曲","例示"], answerIndex:0, expJP:"より一層。", expES:"Más que..." },
];
const ACTIVITY_B: Q[] = [
  { id:"ob1", type:"vocab", prompt:"『思考実験』は？", choices:["experimento mental","experimento químico","test A/B","simulación meteorológica"], answerIndex:0, expJP:"頭の中での検証。", expES:"Prueba conceptual." },
  { id:"ob2", type:"grammar", prompt:"『〜とあって』は？", choices:["顕著な事情ゆえ","並列","譲歩","逆接"], answerIndex:0, expJP:"特別な事情による原因。", expES:"Causa marcada por condición destacada." },
  { id:"ob3", type:"reading", prompt:"op3の核心は？", choices:["透明性→信頼","価格のみ","装飾表現","比喩中心"], answerIndex:0, expJP:"透明性が信頼を生む。", expES:"Transparencia vincula confianza." },
  { id:"ob4", type:"vocab", prompt:"『立論』は？", choices:["argumentación","lectura en voz alta","suscripción","concesión"], answerIndex:0, expJP:"論を立てる。", expES:"Construcción del argumento." },
  { id:"ob5", type:"grammar", prompt:"『〜に越したことはない』は？", choices:["最善の勧め","禁止","逆接","婉曲否定"], answerIndex:0, expJP:"理想的。", expES:"Recomendación ideal." },
  { id:"ob6", type:"vocab", prompt:"『価値判断』は？", choices:["juicio de valor","precio de mercado","veredicto penal","predicción"], answerIndex:0, expJP:"価値づけ。", expES:"Valoración." },
  { id:"ob7", type:"reading", prompt:"op2の態度は？", choices:["実務的/均衡","攻撃的","皮肉的","無関心"], answerIndex:0, expJP:"落ち着いた論調。", expES:"Práctico/equilibrado." },
  { id:"ob8", type:"grammar", prompt:"『〜に至るまで』は？", choices:["範囲の極端まで","軽い並列","時刻指定","不確実"], answerIndex:0, expJP:"隅々まで。", expES:"Hasta extremos/alcance amplio." },
];

/* ReadingBlock */
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
export default function N1_OpinionScreen(){
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
        <Text style={styles.topTitle}>Opinión y ensayo</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key:"content" }]}
        keyExtractor={(it)=>it.key}
        contentContainerStyle={{ paddingBottom:120 }}
        renderItem={()=>(<>
          {/* HERO */}
          <View style={styles.hero}>
            <ExpoImage source={coverFor("opinion")} style={styles.heroImg} contentFit="cover"/>
            <LinearGradient colors={["rgba(0,0,0,0.35)","rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject}/>
            <View style={styles.heroIn}>
              <Text style={styles.kicker}>N1 · Opinión</Text>
              <Text style={styles.heroTitle}>Argumentar con precisión</Text>
              <Text style={styles.heroSub}>Vocabulario lógico, gramática avanzada y lectura crítica.</Text>
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
          <Section title="Gramática en contexto (7)">
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
                  {g.difs ? (<><Text style={styles.gramH}>Matices y diferencias</Text><Text style={styles.gramTxt}>{g.matices}（Dif: {g.difs}）</Text></>) : (<><Text style={styles.gramH}>Matices</Text><Text style={styles.gramTxt}>{g.matices}</Text></>)}
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

/* styles (idénticos a Law/Environment) */
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
