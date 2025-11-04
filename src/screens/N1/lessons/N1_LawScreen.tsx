// N1_LawScreen.tsx
// (MISMO HEADER/IMPORTS/HELPERS/ESTILOS que Culture — copiado completo y adaptado)
// ——— Cambian: títulos, coverFor("law"), VOCAB/GRAMMAR/READINGS/ACTIVITIES ———

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

function Section({ title, children }:{title:string; children:React.ReactNode}){ return(<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>); }
function PillBtn({label,onPress,kind="primary",disabled}:{label:string;onPress:()=>void;kind?:"primary"|"ghost";disabled?:boolean;}){ const base=kind==="primary"?styles.primaryBtn:styles.ghostBtn; const baseTxt=kind==="primary"?styles.primaryTxt:styles.ghostTxt; return(<Pressable style={[base,disabled&&{opacity:0.5}]} onPress={onPress} disabled={disabled}><Text style={baseTxt}>{label}</Text></Pressable>); }
function Choice({label,selected,state,onPress,disabled}:{label:string;selected?:boolean;state?:"neutral"|"correct"|"wrong";onPress:()=>void;disabled?:boolean;}){ let bg="#101827"; if(selected) bg="#2742A0"; if(state==="correct") bg="#1F7A3D"; if(state==="wrong") bg="#7A1F1F"; return(<Pressable style={[styles.choice,{backgroundColor:bg}]} onPress={onPress} disabled={!!disabled}><Text style={styles.choiceTxt}>{label}</Text></Pressable>); }

/* Vocab 20 (legal) */
type Vocab = { jp:string; reading:string; es:string };
const VOCAB: Vocab[] = [
  { jp:"司法手続", reading:"しほうてつづき", es:"procedimiento judicial" },
  { jp:"判例", reading:"はんれい", es:"jurisprudencia" },
  { jp:"憲法上の権利", reading:"けんぽうじょうのけんり", es:"derechos constitucionales" },
  { jp:"適正手続", reading:"てきせいてつづき", es:"debido proceso" },
  { jp:"証拠能力", reading:"しょうこのうりょく", es:"fuerza probatoria" },
  { jp:"違憲審査", reading:"いけんしんさ", es:"control de constitucionalidad" },
  { jp:"差止め", reading:"さしとめ", es:"medida cautelar (suspensión)" },
  { jp:"救済", reading:"きゅうさい", es:"tutela/relieve" },
  { jp:"公益", reading:"こうえき", es:"interés público" },
  { jp:"正当性", reading:"せいとうせい", es:"legitimidad" },
  { jp:"訴権", reading:"そけん", es:"derecho de acción" },
  { jp:"原告", reading:"げんこく", es:"actor/demandante" },
  { jp:"被告", reading:"ひこく", es:"demandado/imputado" },
  { jp:"裁量", reading:"さいりょう", es:"discrecionalidad" },
  { jp:"比例原則", reading:"ひれいげんそく", es:"principio de proporcionalidad" },
  { jp:"手続保障", reading:"てつづきほしょう", es:"garantías procesales" },
  { jp:"合憲性", reading:"ごうけんせい", es:"constitucionalidad" },
  { jp:"判示", reading:"はんじ", es:"considerandos/razonamiento judicial" },
  { jp:"訴訟費用", reading:"そしょうひよう", es:"costas procesales" },
  { jp:"立証責任", reading:"りっしょうせきにん", es:"carga de la prueba" },
];

/* Gramática 7 (registro jurídico) */
type GPoint = { pat:string; uso:string; tradu:string; matices:string; ejJP:string; ejES:string };
const GRAMMAR: GPoint[] = [
  { pat:"〜に照らして", uso:"Evaluar a la luz de un criterio (ley, precedente).", tradu:"a la luz de / conforme a", matices:"Muy jurídico/administrativo.", ejJP:"判例に照らして、本件の合憲性を判断する。", ejES:"A la luz de la jurisprudencia, se evalúa la constitucionalidad." },
  { pat:"〜を旨として", uso:"Tomar X como principio/directriz.", tradu:"teniendo por principio", matices:"Fórmula de resoluciones y lineamientos.", ejJP:"適正手続の確保を旨として運用する。", ejES:"Se operará teniendo por principio el debido proceso." },
  { pat:"〜に鑑み（かんがみ）", uso:"Considerando X (circunstancias).", tradu:"considerando / habida cuenta de", matices:"Cláusulas de motivación.", ejJP:"被告の事情に鑑み、執行を猶予する。", ejES:"Considerando las circunstancias del reo, se difiere la ejecución." },
  { pat:"〜をもって（通知・施行）", uso:"Medio/efecto: con la notificación/entrada en vigor.", tradu:"mediante / con (efecto jurídico)", matices:"Fija un hito procesal.", ejJP:"本決定の送達をもって、効力を生ずる。", ejES:"El presente produce efectos con su notificación." },
  { pat:"〜いかんにかかわらず", uso:"Independientemente de X.", tradu:"independientemente de", matices:"Fórmulas generales.", ejJP:"訴額いかんにかかわらず、手数料は同一とする。", ejES:"Independientemente del monto, la tasa es la misma." },
  { pat:"〜に先立ち", uso:"Antes de X, formal.", tradu:"con anterioridad a / previo a", matices:"Trámite/preparación.", ejJP:"口頭弁論に先立ち、書面を提出すること。", ejES:"Previo a la audiencia, deberá presentarse el escrito." },
  { pat:"〜べく", uso:"Finalidad elevada.", tradu:"a fin de / para", matices:"Estilo normativo.", ejJP:"権利救済を迅速化すべく、暫定措置を認める。", ejES:"A fin de agilizar la tutela, se admiten medidas provisionales." },
];

/* Lecturas 3 x 5 */
type RQ = { id:string; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string };
type Reading = { id:string; title:string; jp:string; es:string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  { id:"l1", title:"Proporcionalidad en medidas cautelares",
    jp:"比例原則は、目的の重要性・手段の適合性・必要性・均衡性から審査される。差止めは回復不能の損害を避けるため、厳格な理由付けを要する。",
    es:"La proporcionalidad considera fin, idoneidad, necesidad y balance. La suspensión busca evitar daños irreparables y exige motivación estricta.",
    questions:[
      { id:"l1q1", prompt:"比例原則の要素は？", choices:["目的・適合性・必要性・均衡","量刑・費用・人員","公開・即時・口頭","監督・捜索・押収"], answerIndex:0, expJP:"四要素で審査。", expES:"Fin, idoneidad, necesidad, balance." },
      { id:"l1q2", prompt:"差止めの要件は？", choices:["厳格な理由付け","自動付与","費用免除","陪審員の同意"], answerIndex:0, expJP:"厳格な動機付け。", expES:"Motivación estricta." },
      { id:"l1q3", prompt:"目的は？", choices:["回復不能の損害回避","費用削減","統計改善","人員補充"], answerIndex:0, expJP:"不可逆的被害の回避。", expES:"Evitar daño irreparable." },
      { id:"l1q4", prompt:"適合性は？", choices:["手段が目的に合うか","手段が安いか","手段が人気か","手段が古いか"], answerIndex:0, expJP:"目的との整合。", expES:"Idoneidad con el fin." },
      { id:"l1q5", prompt:"本文の調子は？", choices:["実務的・基準提示", "情緒的", "宣伝的", "皮肉的"], answerIndex:0, expJP:"基準を述べる。", expES:"Marco operativo/criterial." },
    ] },
  { id:"l2", title:"Debido proceso y publicidad",
    jp:"適正手続の核心は、公正な聴聞と理由付け、そして公開の原則にある。もっとも、被害者保護などで限定が正当化されうる。",
    es:"El núcleo del debido proceso es audiencia justa, motivación y publicidad. Existen límites justificados por protección de víctimas, etc.",
    questions:[
      { id:"l2q1", prompt:"核心に含まれないのは？", choices:["公開原則","公正聴聞","理由付け","量刑の固定"], answerIndex:3, expJP:"量刑固定は本文にない。", expES:"No se menciona pena fija." },
      { id:"l2q2", prompt:"公開原則の例外は？", choices:["被害者保護", "費用節約", "人気維持", "迅速化"], answerIndex:0, expJP:"保護目的の限定。", expES:"Protección de víctimas." },
      { id:"l2q3", prompt:"本文の主旨は？", choices:["原則+限定の均衡", "全面公開の否定", "密室主義の肯定", "宣伝強化"], answerIndex:0, expJP:"原則と例外の均衡。", expES:"Equilibrar principio y límites." },
      { id:"l2q4", prompt:"理由付けは何の要件？", choices:["決定の正当性", "量刑の重さ", "費用算定", "陪審員選任"], answerIndex:0, expJP:"決定の正当化。", expES:"Legitimar decisiones." },
      { id:"l2q5", prompt:"『限定が正当化』の場面は？", choices:["被害者保護", "人員不足", "天候", "祝日"], answerIndex:0, expJP:"保護目的の例外。", expES:"Límites por protección." },
    ] },
  { id:"l3", title:"Carga de la prueba",
    jp:"立証責任の所在は手続の設計に直結する。誰がどの事実を証明すべきかを明確化することが、予見可能性と公正を担保する。",
    es:"La ubicación de la carga probatoria diseña el proceso. Clarificar quién prueba qué asegura previsibilidad y justicia.",
    questions:[
      { id:"l3q1", prompt:"本文の焦点は？", choices:["立証責任の明確化", "費用の軽減", "量刑の画一化", "裁判所の装飾"], answerIndex:0, expJP:"立証責任の所在。", expES:"Claridad en la carga probatoria." },
      { id:"l3q2", prompt:"効果は？", choices:["予見可能性・公正の担保", "放送拡大", "人事評価", "広告収入"], answerIndex:0, expJP:"予見性と公正。", expES:"Previsibilidad y equidad." },
      { id:"l3q3", prompt:"『直結する』は？", choices:["密接に関係する", "無関係", "偶然一致", "逆相関"], answerIndex:0, expJP:"密接な関係。", expES:"Conexión directa." },
      { id:"l3q4", prompt:"誰が何を？ 明確化の目的は？", choices:["負担の配分", "費用倍増", "期間短縮", "翻訳"], answerIndex:0, expJP:"負担の公正配分。", expES:"Asignación justa de cargas." },
      { id:"l3q5", prompt:"本文の文体に近いのは？", choices:["規範的・実務的", "情緒的", "比喩的", "叙情的"], answerIndex:0, expJP:"規範的トーン。", expES:"Normativo/práctico." },
    ] },
];

/* Actividades 2x8 */
type Q = { id:string; type:"kanji"|"vocab"|"grammar"|"reading"; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string; tip?:string; };
const ACTIVITY_A: Q[] = [
  { id:"la1", type:"vocab", prompt:"『適正手続』は？", choices:["debido proceso","cosa juzgada","acción popular","competencia"], answerIndex:0, expJP:"デュープロセス。", expES:"Debido proceso." },
  { id:"la2", type:"vocab", prompt:"『比例原則』は？", choices:["proporcionalidad","progresividad","propiedad","proactividad"], answerIndex:0, expJP:"原則のひとつ。", expES:"Proporcionalidad." },
  { id:"la3", type:"grammar", prompt:"『〜に照らして』の意味は？", choices:["基準に合わせて判断","逆説","譲歩","例示"], answerIndex:0, expJP:"基準・先例に照合。", expES:"Evaluar a la luz de." },
  { id:"la4", type:"reading", prompt:"l1の差止め目的は？", choices:["回復不能の損害回避","費用削減","人員補充","宣伝"], answerIndex:0, expJP:"不可逆的被害の回避。", expES:"Evitar daño irreparable." },
  { id:"la5", type:"vocab", prompt:"『証拠能力』は？", choices:["fuerza probatoria","fuerza laboral","fuerza mayor","fuerza física"], answerIndex:0, expJP:"証拠の採用可能性。", expES:"Valor probatorio." },
  { id:"la6", type:"grammar", prompt:"『〜に鑑み』のレジスターは？", choices:["高い","口語","俗語","命令"], answerIndex:0, expJP:"やや硬い。", expES:"Formal/elevado." },
  { id:"la7", type:"reading", prompt:"l2の核心に近いのは？", choices:["原則・例外の均衡","全面公開否定","密室肯定","費用論"], answerIndex:0, expJP:"均衡論。", expES:"Equilibrio." },
  { id:"la8", type:"vocab", prompt:"『立証責任』は？", choices:["carga de la prueba","acción penal","fuero","conciliación"], answerIndex:0, expJP:"誰が証明するか。", expES:"Quién debe probar qué." },
];
const ACTIVITY_B: Q[] = [
  { id:"lb1", type:"grammar", prompt:"『〜を旨として』の機能は？", choices:["方針・原則を示す","例外を示す","禁止を示す","願望を示す"], answerIndex:0, expJP:"基本方針。", expES:"Principio/lineamiento." },
  { id:"lb2", type:"vocab", prompt:"『違憲審査』は？", choices:["control de constitucionalidad","control de legalidad","control de convencionalidad","control de calidad"], answerIndex:0, expJP:"合憲性チェック。", expES:"Constitucionalidad." },
  { id:"lb3", type:"reading", prompt:"l3の効果は？", choices:["予見可能性と公正", "費用削減", "宣伝効果", "速度向上のみ"], answerIndex:0, expJP:"予見性・公正。", expES:"Previsibilidad y justicia." },
  { id:"lb4", type:"vocab", prompt:"『原告』『被告』は？", choices:["actor/demandante・demandado", "acusador/policía", "juez/fiscal", "testigo/perito"], answerIndex:0, expJP:"当事者の基本。", expES:"Partes procesales." },
  { id:"lb5", type:"grammar", prompt:"『〜べく』の意味は？", choices:["目的", "条件", "原因", "逆接"], answerIndex:0, expJP:"目的表現。", expES:"Finalidad." },
  { id:"lb6", type:"vocab", prompt:"『判例』は？", choices:["jurisprudencia","juramento","jurado","jurisdicción"], answerIndex:0, expJP:"裁判例。", expES:"Jurisprudencia." },
  { id:"lb7", type:"reading", prompt:"l1の審査枠組みは？", choices:["四要素", "三審制", "三権分立", "四則演算"], answerIndex:0, expJP:"目的・適合性・必要性・均衡。", expES:"Cuatro elementos." },
  { id:"lb8", type:"vocab", prompt:"『手続保障』は？", choices:["garantías procesales","garantías mobiliarias","garantías reales","garantías laborales"], answerIndex:0, expJP:"手続の権利保障。", expES:"Garantías procesales." },
];

/* ReadingBlock (igual que Culture) */
function ReadingBlock({ data }: { data: Reading }) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [showES, setShowES] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const correctCount = useMemo(() => data.questions.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0), [answers, data.questions]);
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
              {q.choices.map((c, i) => <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i ? state : "neutral"} onPress={() => onPick(q, i)} />)}
            </View>
            {sel != null && (<View style={styles.expBox}><Text style={styles.expHeader}>{sel === q.answerIndex ? "✅ 正解 / ¡Correcto!" : "❌ 不正解 / Incorrecto"}</Text><Text style={styles.expJP}>【JP】{q.expJP}</Text><Text style={styles.expES}>【ES】{q.expES}</Text></View>)}
          </View>
        );
      })}
      <Text style={styles.scoreTxt}>Resultado: {correctCount}/{data.questions.length}</Text>
    </View>
  );
}

/* Screen */
export default function N1_LawScreen(){
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
        <Text style={styles.topTitle}>Derecho y justicia</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key:"content" }]}
        keyExtractor={(it)=>it.key}
        contentContainerStyle={{ paddingBottom:120 }}
        renderItem={()=>(<>
          <View style={styles.hero}>
            <ExpoImage source={coverFor("law")} style={styles.heroImg} contentFit="cover"/>
            <LinearGradient colors={["rgba(0,0,0,0.35)","rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject}/>
            <View style={styles.heroIn}>
              <Text style={styles.kicker}>N1 · Derecho y justicia</Text>
              <Text style={styles.heroTitle}>Cortes, procesos y legalidad</Text>
              <Text style={styles.heroSub}>Términos procesales, gramática normativa y análisis de textos jurídicos.</Text>
            </View>
          </View>

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

          <Section title="Gramática normativa (7)">
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
                  <Text style={styles.gramH}>Matices y diferencias</Text><Text style={styles.gramTxt}>{g.matices}</Text>
                  <Text style={styles.gramExJP}>例) {g.ejJP}</Text><Text style={styles.gramExES}>→ {g.ejES}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Comprensión de lectura (3 pasajes · 5 preguntas c/u)">
            <View style={{ gap: 14 }}>
              {READING_PASSAGES.map((b)=>(<ReadingBlock key={b.id} data={b}/>))}
            </View>
          </Section>

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
                        <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i?state:"neutral"} onPress={()=>{ (i===q.answerIndex?playCorrect():playWrong()); setAnswersA(p=>({...p,[q.id]:i})); }}/>
                      ))}
                    </View>
                    {sel!=null && (<View style={styles.expBox}><Text style={styles.expHeader}>{sel===q.answerIndex?"✅ 正解 / ¡Correcto!":"❌ 不正解 / Incorrecto"}</Text><Text style={styles.expJP}>【JP】{q.expJP}</Text><Text style={styles.expES}>【ES】{q.expES}</Text></View>)}
                  </View>
                );
              })}
            </View>
            <Text style={styles.scoreTxt}>Resultado: {scoreA}/{ACTIVITY_A.length}</Text>
          </Section>

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
                        <Choice key={i} label={c} selected={sel===i && state==="neutral"} state={sel===i?state:"neutral"} onPress={()=>{ (i===q.answerIndex?playCorrect():playWrong()); setAnswersB(p=>({...p,[q.id]:i})); }}/>
                      ))}
                    </View>
                    {sel!=null && (<View style={styles.expBox}><Text style={styles.expHeader}>{sel===q.answerIndex?"✅ 正解 / ¡Correcto!":"❌ 不正解 / Incorrecto"}</Text><Text style={styles.expJP}>【JP】{q.expJP}</Text><Text style={styles.expES}>【ES】{q.expES}</Text></View>)}
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

/* styles (idénticos a Culture, copiados) */
const styles = StyleSheet.create({
  topBar:{height:56+(StatusBar.currentHeight??0),paddingTop:(StatusBar.currentHeight??0),paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"rgba(8,12,18,0.8)",borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:"rgba(255,255,255,0.08)"},
  topTitle:{color:"#EAF1FF",fontWeight:"900",fontSize:18}, closeBtn:{paddingHorizontal:10,paddingVertical:6,borderRadius:999,backgroundColor:"rgba(255,255,255,0.08)"}, closeTxt:{color:"#BFD9FF",fontWeight:"800"},
  hero:{margin:14,height:220,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,0.07)"},
  heroImg:{...StyleSheet.absoluteFillObject,width,height:220}, heroIn:{flex:1,padding:16,justifyContent:"flex-end",gap:6},
  kicker:{color:"#C5FFF9",fontWeight:"900",letterSpacing:0.6}, heroTitle:{color:"#FFF",fontSize:26,lineHeight:28,fontWeight:"900"}, heroSub:{color:"rgba(255,255,255,0.9)"},
  section:{paddingHorizontal:14,paddingTop:8,paddingBottom:12}, sectionTitle:{color:"#FFFFFF",fontWeight:"900",fontSize:16,marginBottom:8},
  wordCard:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",borderRadius:12,padding:10},
  wordJP:{color:"#FFFFFF",fontWeight:"900"}, wordRd:{color:"rgba(255,255,255,0.75)",fontWeight:"700"}, wordES:{color:"rgba(255,255,255,0.9)"},
  play:{backgroundColor:"#2B7FFF",paddingHorizontal:10,paddingVertical:8,borderRadius:10}, playTxt:{color:"#EAF1FF",fontWeight:"900"},
  gramCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:12},
  gramPat:{color:"#8FF1F2",fontWeight:"900",marginBottom:6,fontSize:15}, gramH:{color:"#CFE4FF",fontWeight:"900",marginTop:2},
  gramTxt:{color:"rgba(255,255,255,0.9)"}, gramExJP:{color:"#FFFFFF",marginTop:6,fontWeight:"900"}, gramExES:{color:"rgba(255,255,255,0.9)"},
  readingCard:{backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",borderRadius:14,padding:14},
  readingTitle:{color:"#EAF1FF",fontWeight:"900",marginBottom:8,fontSize:15},
  cardQ:{backgroundColor:"#111727",borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,0.06)",padding:14},
  qMeta:{color:"rgba(255,255,255,0.6)",fontWeight:"800",marginBottom:6},
  prompt:{color:"white",fontSize:16,fontWeight:"900",lineHeight:22},
  choice:{paddingHorizontal:12,paddingVertical:12,borderRadius:10,borderWidth:1,borderColor:"rgba(255,255,255,0.06)"},
  choiceTxt:{color:"#EAF1FF",fontWeight:"800"},
  expBox:{marginTop:10,backgroundColor:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.18)",borderWidth:1,borderRadius:10,padding:10,gap:4},
  expHeader:{color:"#EAF1FF",fontWeight:"900"}, expJP:{color:"#FFFFFF"}, expES:{color:"rgba(255,255,255,0.92)"},
  scoreTxt:{color:"#D3FFF7",fontWeight:"900",textAlign:"center",marginTop:8},
  primaryBtn:{backgroundColor:PALETTE.blue,paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  primaryTxt:{color:"#EAF1FF",fontWeight:"900",letterSpacing:0.3},
  ghostBtn:{backgroundColor:"transparent",borderWidth:1,borderColor:"rgba(255,255,255,0.16)",paddingVertical:12,paddingHorizontal:16,borderRadius:12,alignItems:"center",justifyContent:"center"},
  ghostTxt:{color:"rgba(255,255,255,0.9)",fontWeight:"900",letterSpacing:0.3},
  listenJP:{color:"#fff"}, listenESTitle:{color:"#CFE4FF",fontWeight:"900",marginTop:8}, listenES:{color:"rgba(255,255,255,0.95)"}, listenBtns:{flexDirection:"row",gap:8,marginTop:8,flexWrap:"wrap"},
});
