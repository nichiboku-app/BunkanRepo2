// src/screens/N1/lessons/N1_EconomyScreen.tsx
// (Mismo esquema/estilos que Environment/Law/Health — con GRAMÁTICAS N1 NUEVAS para trabajo/empresa)

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

/* Vocab 20 (trabajo y empresa) */
type Vocab = { jp:string; reading:string; es:string };
const VOCAB: Vocab[] = [
  { jp:"労働生産性", reading:"ろうどうせいさんせい", es:"productividad laboral" },
  { jp:"人材育成", reading:"じんざいいくせい", es:"formación de talento" },
  { jp:"離職率", reading:"りしょくりつ", es:"tasa de rotación" },
  { jp:"賃上げ", reading:"ちんあげ", es:"aumento salarial" },
  { jp:"業務効率化", reading:"ぎょうむこうりつか", es:"optimización operativa" },
  { jp:"意思決定", reading:"いしけってい", es:"toma de decisiones" },
  { jp:"企業文化", reading:"きぎょうぶんか", es:"cultura corporativa" },
  { jp:"内部統制", reading:"ないぶとうせい", es:"control interno" },
  { jp:"資金調達", reading:"しきんちょうたつ", es:"levantamiento de capital" },
  { jp:"資本コスト", reading:"しほんコスト", es:"costo de capital" },
  { jp:"利害関係者", reading:"りがいかんけいしゃ", es:"partes interesadas (stakeholders)" },
  { jp:"合弁", reading:"ごうべん", es:"joint venture" },
  { jp:"買収", reading:"ばいしゅう", es:"adquisición" },
  { jp:"事業再編", reading:"じぎょうさいへん", es:"reestructura de negocio" },
  { jp:"在宅勤務", reading:"ざいたくきんむ", es:"trabajo remoto" },
  { jp:"成果連動型", reading:"せいかれんどうがた", es:"basado en desempeño" },
  { jp:"越境学習", reading:"えっきょうがくしゅう", es:"aprendizaje interfuncional" },
  { jp:"稼働率", reading:"かどうりつ", es:"tasa de utilización (operaciones)" },
  { jp:"適正配置", reading:"てきせいはいち", es:"asignación adecuada de personal" },
  { jp:"多様性と包摂", reading:"たようせいとほうせつ", es:"diversidad e inclusión" },
];

/* Gramática N1 NUEVA para economía/empresa (8 puntos, distintas a Health/Environment) */
type GPoint = { pat:string; uso:string; tradu:string; matices:string; ejJP:string; ejES:string };
const GRAMMAR: GPoint[] = [
  { pat:"〜なくして（は）…ない", uso:"Sin X, no se logra Y.", tradu:"sin X, no hay Y", matices:"Políticas/visión corporativa.", ejJP:"データなくして戦略的意思決定はあり得ない。", ejES:"Sin datos no hay decisiones estratégicas." },
  { pat:"〜を皮切りに", uso:"Comienzo de una serie.", tradu:"a partir de / comenzando con", matices:"Planes de expansión.", ejJP:"国内での成功を皮切りに海外展開を加速する。", ejES:"Comenzando con el éxito local, aceleramos la expansión global." },
  { pat:"〜と相まって", uso:"X combinado con Y produce efecto.", tradu:"sumado a / en combinación con", matices:"Análisis causal.", ejJP:"人材育成がデジタル化と相まって生産性が向上した。", ejES:"La formación, sumada a la digitalización, elevó la productividad." },
  { pat:"〜に鑑み（て）", uso:"Tomar medidas en vista de antecedentes.", tradu:"en vista de / considerando", matices:"Comunicados formales.", ejJP:"最近の不正事案に鑑み、内部統制を強化する。", ejES:"En vista de incidentes recientes, se refuerza el control interno." },
  { pat:"〜に照らして", uso:"Evaluar a la luz de criterios.", tradu:"a la luz de / conforme a", matices:"Auditoría/criterios.", ejJP:"ガイドラインに照らして評価を実施した。", ejES:"Se evaluó a la luz de las guías." },
  { pat:"〜には当たらない", uso:"No amerita X / no es motivo de.", tradu:"no amerita / no hace falta", matices:"Desactivar alarma excesiva.", ejJP:"一時的な売上減は直ちに危機と断ずるには当たらない。", ejES:"Una baja temporal no amerita llamarla crisis." },
  { pat:"〜きらいがある", uso:"Tendencia negativa de X.", tradu:"tiende a / peca de", matices:"Crítica suave-formal.", ejJP:"会議が長文化するきらいがある。", ejES:"Las reuniones tienden a alargarse en exceso." },
  { pat:"〜を踏まえ（て）", uso:"Basándose en X para decidir/actuar.", tradu:"con base en / tomando en cuenta", matices:"Cierre de planes/briefs.", ejJP:"市場調査を踏まえ来期の投資配分を見直す。", ejES:"Con base en el estudio de mercado, se ajusta la inversión." },
];

/* Lecturas 3 x 5 */
type RQ = { id:string; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string };
type Reading = { id:string; title:string; jp:string; es:string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id:"biz-r1",
    title:"Productividad y capacitación",
    jp:"人材育成が設備投資と相まって、労働生産性の底上げをもたらした。ただし評価は指標に照らして継続的に見直されるべきだ。",
    es:"La formación, combinada con inversión en equipos, elevó la productividad; la evaluación debe revisarse continuamente a la luz de indicadores.",
    questions:[
      { id:"biz-r1-q1", prompt:"生産性向上の要因は？", choices:["人材育成＋設備投資","広告のみ","為替のみ","運のみ"], answerIndex:0, expJP:"相まって。", expES:"Combinación de factores." },
      { id:"biz-r1-q2", prompt:"評価の姿勢は？", choices:["継続見直し","一度のみ","不要","勘に頼る"], answerIndex:0, expJP:"継続的。", expES:"Revisión continua." },
      { id:"biz-r1-q3", prompt:"『指標に照らして』の意味は？", choices:["基準に沿って","直感で","多数決で","前例で"], answerIndex:0, expJP:"基準参照。", expES:"Conforme a criterios." },
      { id:"biz-r1-q4", prompt:"本文の文体は？", choices:["実務的","感傷的","皮肉的","文学的"], answerIndex:0, expJP:"実務。", expES:"Práctico." },
      { id:"biz-r1-q5", prompt:"示唆は？", choices:["評価を続ける","放置","削減のみ","外注のみ"], answerIndex:0, expJP:"継続的評価。", expES:"Seguir evaluando." },
    ]
  },
  {
    id:"biz-r2",
    title:"Gobernanza y control interno",
    jp:"不正リスクに鑑み、内部統制の整備を皮切りに、通報制度と監査の頻度を引き上げる方針だ。",
    es:"En vista del riesgo de fraude, se inicia reforzando control interno y se elevará la frecuencia de auditorías y los canales de denuncia.",
    questions:[
      { id:"biz-r2-q1", prompt:"最初の施策は？", choices:["内部統制の整備","広告増","値下げ","採用凍結"], answerIndex:0, expJP:"皮切りに。", expES:"Comenzar por control interno." },
      { id:"biz-r2-q2", prompt:"背景の判断根拠は？", choices:["不正リスクに鑑み","直感","競合の真似","世論のみ"], answerIndex:0, expJP:"鑑み。", expES:"En vista de." },
      { id:"biz-r2-q3", prompt:"今後強化するのは？", choices:["通報制度と監査頻度","社食","制服","社歌"], answerIndex:0, expJP:"通報/監査。", expES:"Denuncia y auditoría." },
      { id:"biz-r2-q4", prompt:"語のレジスターは？", choices:["フォーマル","砕けた","俗語","学童向け"], answerIndex:0, expJP:"公文書調。", expES:"Formal." },
      { id:"biz-r2-q5", prompt:"方針の性格は？", choices:["段階的・体系的","衝動的","恣意的","場当たり的"], answerIndex:0, expJP:"段階的。", expES:"Escalonado/sistémico." },
    ]
  },
  {
    id:"biz-r3",
    title:"Remoto e inclusión",
    jp:"在宅勤務は柔軟性を高める一方で、評価が会議時間の長さに偏るきらいがある。成果に照らした指標設計が望ましい。",
    es:"El trabajo remoto aumenta la flexibilidad, pero existe tendencia a valorar por horas de reunión. Conviene diseñar métricas en función de resultados.",
    questions:[
      { id:"biz-r3-q1", prompt:"問題視される傾向は？", choices:["会議時間偏重","賃上げ偏重","現場軽視","広告過多"], answerIndex:0, expJP:"きらいがある。", expES:"Sesgo por horas de reunión." },
      { id:"biz-r3-q2", prompt:"推奨は？", choices:["成果基準の設計","会議増やす","出社義務化","雑談削除"], answerIndex:0, expJP:"成果に照らす。", expES:"Métricas por resultados." },
      { id:"biz-r3-q3", prompt:"在宅勤務の利点は？", choices:["柔軟性","孤立","監視強化","雑務増"], answerIndex:0, expJP:"柔軟性。", expES:"Flexibilidad." },
      { id:"biz-r3-q4", prompt:"語のトーンは？", choices:["実務的","感情的","皮肉","攻撃的"], answerIndex:0, expJP:"実務。", expES:"Práctico." },
      { id:"biz-r3-q5", prompt:"『照らす』のニュアンスは？", choices:["基準に合わせる","偶然性","対立","揶揄"], answerIndex:0, expJP:"基準合わせ。", expES:"Alineado a criterios." },
    ]
  },
];

/* Actividades 2x8 — vinculadas a las NUEVAS gramáticas */
type Q = { id:string; type:"kanji"|"vocab"|"grammar"|"reading"; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string; tip?:string; };
const ACTIVITY_A: Q[] = [
  { id:"ba1", type:"grammar", prompt:"『〜なくしては…ない』の訳は？", choices:["sin X no hay Y","aunque X, Y","siempre que X, Y","X pese a Y"], answerIndex:0, expJP:"必須条件の否定。", expES:"Condición indispensable." },
  { id:"ba2", type:"grammar", prompt:"『〜を皮切りに』の用法は？", choices:["開始の契機","対比","譲歩","例示"], answerIndex:0, expJP:"ここから連鎖。", expES:"Marca el inicio de una serie." },
  { id:"ba3", type:"grammar", prompt:"『〜と相まって』の含意は？", choices:["相乗/複合効果","原因否定","軽視","偶然"], answerIndex:0, expJP:"相乗。", expES:"Efecto combinado." },
  { id:"ba4", type:"vocab", prompt:"『内部統制』は？", choices:["control interno","control aduanero","control de calidad","control meteorológico"], answerIndex:0, expJP:"統制。", expES:"Governanza interna." },
  { id:"ba5", type:"grammar", prompt:"『〜には当たらない』の自然な訳は？", choices:["no amerita / no hace falta","debe ser","es obligatorio","nunca"], answerIndex:0, expJP:"過剰反応の否定。", expES:"No amerita." },
  { id:"ba6", type:"reading", prompt:"r2で最初に行う施策は？", choices:["内部統制の強化","出社義務化","値上げ","採用凍結"], answerIndex:0, expJP:"皮切り。", expES:"Control interno." },
  { id:"ba7", type:"vocab", prompt:"『資金調達』は？", choices:["levantamiento de capital","cobranza","impuestos","gasto corriente"], answerIndex:0, expJP:"資金。", expES:"Financiamiento." },
  { id:"ba8", type:"grammar", prompt:"『〜に鑑み』のレジスターは？", choices:["フォーマル","口語","俗語","幼児語"], answerIndex:0, expJP:"公文書調。", expES:"Formal." },
];

const ACTIVITY_B: Q[] = [
  { id:"bb1", type:"reading", prompt:"r1の評価で重要視されるのは？", choices:["指標に照らした継続見直し","一次調査の廃止","属人化の強化","偶発性の容認"], answerIndex:0, expJP:"継続評価。", expES:"Revisión continua con métricas." },
  { id:"bb2", type:"grammar", prompt:"『〜きらいがある』の意味は？", choices:["〜する傾向がある（否定的）","強制","絶対肯定","一時停止"], answerIndex:0, expJP:"否定的傾向。", expES:"Tendencia negativa." },
  { id:"bb3", type:"grammar", prompt:"『〜を踏まえて』は？", choices:["根拠に基づき","偶然に","感覚で","反射的に"], answerIndex:0, expJP:"根拠ベース。", expES:"Basándose en." },
  { id:"bb4", type:"vocab", prompt:"『成果連動型』に最も近いのは？", choices:["basado en desempeño","basado en antigüedad","basado en horario","basado en turnos"], answerIndex:0, expJP:"成果連動。", expES:"Pay for performance." },
  { id:"bb5", type:"grammar", prompt:"空所補完：『市場調査＿＿来期の投資配分を見直す。』", choices:["を踏まえ","に鑑み","には当たらない","と相まって"], answerIndex:0, expJP:"根拠→意思決定。", expES:"Basado en estudio de mercado." },
  { id:"bb6", type:"grammar", prompt:"空所補完：『データ＿＿意思決定はあり得ない。』", choices:["なくしては","に照らして","きらいがある","を皮切りに"], answerIndex:0, expJP:"必須条件。", expES:"Sin datos, no hay decisión." },
  { id:"bb7", type:"reading", prompt:"r3の問題は？", choices:["会議時間の長さに偏る評価","成果無視","対面信仰","完全出社義務"], answerIndex:0, expJP:"偏重。", expES:"Sesgo por horas de reunión." },
  { id:"bb8", type:"grammar", prompt:"『〜に照らして』のコロケーションとして自然なのは？", choices:["ガイドライン／基準","冗談","雑談","天気"], answerIndex:0, expJP:"基準に照らす。", expES:"A la luz de lineamientos." },
];

/* ReadingBlock (igual que en otras screens) */
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
export default function N1_EconomyScreen(){
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
        <Text style={styles.topTitle}>Economía y negocios</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key:"content" }]}
        keyExtractor={(it)=>it.key}
        contentContainerStyle={{ paddingBottom:120 }}
        renderItem={()=>(<>
          {/* HERO */}
          <View style={styles.hero}>
            <ExpoImage source={coverFor("economy")} style={styles.heroImg} contentFit="cover"/>
            <LinearGradient colors={["rgba(0,0,0,0.35)","rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject}/>
            <View style={styles.heroIn}>
              <Text style={styles.kicker}>N1 · Contenido aplicado</Text>
              <Text style={styles.heroTitle}>Trabajo, empresa y estrategia</Text>
              <Text style={styles.heroSub}>Vocabulario técnico, gramática N1 real y lecturas enfocadas al mundo laboral.</Text>
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

/* styles (idénticos a las otras N1) */
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
