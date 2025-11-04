// src/screens/N1/lessons/N1_EnvironmentScreen.tsx
// (MISMO HEADER/IMPORTS/HELPERS/ESTILOS que Law — copiado completo y adaptado)
// ——— Cambian: títulos, coverFor("environment"), VOCAB/GRAMMAR/READINGS/ACTIVITIES ———

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

/* Vocab 20 (medio ambiente) */
type Vocab = { jp:string; reading:string; es:string };
const VOCAB: Vocab[] = [
  { jp:"温室効果ガス", reading:"おんしつこうかガス", es:"gases de efecto invernadero" },
  { jp:"脱炭素", reading:"だつたんそ", es:"descarbonización" },
  { jp:"再生可能エネルギー", reading:"さいせいかのうエネルギー", es:"energías renovables" },
  { jp:"循環型経済", reading:"じゅんかんがたけいざい", es:"economía circular" },
  { jp:"生物多様性", reading:"せいぶつたようせい", es:"biodiversidad" },
  { jp:"生態系サービス", reading:"せいたいけいサービス", es:"servicios ecosistémicos" },
  { jp:"持続可能性", reading:"じぞくかのうせい", es:"sostenibilidad" },
  { jp:"気候適応", reading:"きこうてきおう", es:"adaptación climática" },
  { jp:"緩和策", reading:"かんわさく", es:"medidas de mitigación" },
  { jp:"排出量取引", reading:"はいしゅつりょうとりひき", es:"comercio de emisiones" },
  { jp:"移行コスト", reading:"いこうコスト", es:"costes de transición" },
  { jp:"公害", reading:"こうがい", es:"contaminación" },
  { jp:"環境影響評価", reading:"かんきょうえいきょうひょうか", es:"evaluación de impacto ambiental" },
  { jp:"森林吸収源", reading:"しんりんきゅうしゅうげん", es:"sumideros forestales" },
  { jp:"極端現象", reading:"きょくたんげんしょう", es:"fenómenos extremos" },
  { jp:"海面上昇", reading:"かいめんじょうしょう", es:"elevación del nivel del mar" },
  { jp:"都市緑化", reading:"としりょっか", es:"reforestación/verde urbano" },
  { jp:"水資源管理", reading:"みずしげんかんり", es:"gestión de recursos hídricos" },
  { jp:"熱波", reading:"ねっぱ", es:"ola de calor" },
  { jp:"レジリエンス", reading:"—", es:"resiliencia" },
];

/* Gramática 7 (registro técnico/ambiental) */
type GPoint = { pat:string; uso:string; tradu:string; matices:string; ejJP:string; ejES:string };
const GRAMMAR: GPoint[] = [
  { pat:"〜に即して", uso:"Aplicar lineamientos conforme a datos/contexto.", tradu:"conforme a / ajustado a", matices:"Informe/técnico.", ejJP:"地域データに即して適応策を策定した。", ejES:"Se diseñaron medidas de adaptación conforme a datos locales." },
  { pat:"〜をめぐって", uso:"Debate o controversia en torno a X.", tradu:"en torno a", matices:"Frecuente en noticias.", ejJP:"排出量取引をめぐって議論が続く。", ejES:"Sigue el debate en torno al comercio de emisiones." },
  { pat:"〜に伴い", uso:"Cambio acompañado de X.", tradu:"a medida que / junto con", matices:"Formal técnico.", ejJP:"海面上昇に伴い、沿岸計画を見直す。", ejES:"Con la elevación del mar se revisa la planeación costera." },
  { pat:"〜をもって", uso:"Hito/medio institucional.", tradu:"mediante / con", matices:"Cortes, políticas.", ejJP:"本ガイドの施行をもって新基準が適用される。", ejES:"Con la entrada en vigor de esta guía aplica el nuevo estándar." },
  { pat:"〜いかんによらず", uso:"Independiente de X.", tradu:"independientemente de", matices:"Cláusula normativa.", ejJP:"規模いかんによらず、報告を義務付ける。", ejES:"Independientemente del tamaño, se exige reporte." },
  { pat:"〜に先立ち", uso:"Antes de X (trámite).", tradu:"previo a / con anterioridad a", matices:"Procedimental.", ejJP:"建設に先立ち、環境影響評価を行う。", ejES:"Antes de construir, realizar EIA." },
  { pat:"〜べく", uso:"Finalidad elevada.", tradu:"a fin de / para", matices:"Tono normativo.", ejJP:"レジリエンスを高めるべく、緑地を拡張する。", ejES:"A fin de aumentar la resiliencia, ampliar áreas verdes." },
];

/* Lecturas 3 x 5 */
type RQ = { id:string; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string };
type Reading = { id:string; title:string; jp:string; es:string; questions: RQ[] };

const READING_PASSAGES: Reading[] = [
  {
    id:"e1",
    title:"Transición energética justa",
    jp:"移行はコスト配分と雇用創出の両面から設計されるべきだ。負担の不均衡は合意形成を阻害する。",
    es:"La transición debe considerar costos y empleos. Un reparto inequitativo frena el consenso.",
    questions:[
      { id:"e1q1", prompt:"核心は？", choices:["コスト+雇用","技術のみ","補助金のみ","価格のみ"], answerIndex:0, expJP:"二面性。", expES:"Doble enfoque." },
      { id:"e1q2", prompt:"阻害要因は？", choices:["不均衡な負担","高い日照","風力過多","低コスト"], answerIndex:0, expJP:"不公平。", expES:"Inequidad." },
      { id:"e1q3", prompt:"設計観点は？", choices:["配分と創出","輸出のみ","輸入のみ","広告"], answerIndex:0, expJP:"配分・雇用。", expES:"Reparto y empleo." },
      { id:"e1q4", prompt:"合意形成に与える影響は？", choices:["阻害する","加速する","無関係","自動化する"], answerIndex:0, expJP:"阻害。", expES:"Obstaculiza." },
      { id:"e1q5", prompt:"文体は？", choices:["実務的","感傷的","詩的","皮肉的"], answerIndex:0, expJP:"実務。", expES:"Práctico." },
    ]
  },
  {
    id:"e2",
    title:"Ciudades y calor extremo",
    jp:"都市の熱波対策には、緑化・日陰・冷却舗装が効果的だが、維持費と公平性の配慮が不可欠だ。",
    es:"Verde urbano, sombra y pavimentos fríos ayudan ante olas de calor, pero exigen presupuesto y equidad.",
    questions:[
      { id:"e2q1", prompt:"対策は？", choices:["緑化・日陰・冷却舗装","渋滞促進","夜間照明増","広告柱増"], answerIndex:0, expJP:"三本柱。", expES:"Tres medidas." },
      { id:"e2q2", prompt:"課題は？", choices:["維持費と公平性","景観のみ","輸出促進","通信費"], answerIndex:0, expJP:"費用と公正。", expES:"Costo y equidad." },
      { id:"e2q3", prompt:"文脈は？", choices:["都市熱波","農業灌漑","港湾物流","空港税"], answerIndex:0, expJP:"都市気候。", expES:"Isla de calor." },
      { id:"e2q4", prompt:"効果は？", choices:["温度が下がる","温度が上がる","不明","逆効果"], answerIndex:0, expJP:"低減。", expES:"Reduce la temperatura." },
      { id:"e2q5", prompt:"不可欠なのは？", choices:["維持費と公平性への配慮","広告費の増加","完全民営化","冬季のみ実施"], answerIndex:0, expJP:"配慮が必要。", expES:"Atender presupuesto y equidad." },
    ]
  },
  {
    id:"e3",
    title:"Interoperabilidad hídrica regional",
    jp:"流域管理は標準化と協定の整備によって相互運用性を高め、分散的な監視と冗長化によりレジリエンスを向上させる。ただし過度の標準化は柔軟性を損なう恐れがあり、段階的適用が現実的だ。",
    es:"La gestión por cuencas mejora interoperabilidad con estándares y acuerdos. Monitoreo distribuido y redundancia elevan la resiliencia; una estandarización rígida puede restar flexibilidad, por lo que conviene aplicarla por etapas.",
    questions:[
      { id:"e3q1", prompt:"相互運用性の前提は？", choices:["標準化と協定","単一OS","同一言語","GUI色統一"], answerIndex:0, expJP:"標準・協定。", expES:"Estándares y acuerdos." },
      { id:"e3q2", prompt:"レジリエンス向上に資するのは？", choices:["分散監視・冗長化","単一点監視","手動同期のみ","紙台帳"], answerIndex:0, expJP:"分散+冗長。", expES:"Monitoreo distribuido + redundancia." },
      { id:"e3q3", prompt:"標準化のリスクは？", choices:["柔軟性低下","費用のみ増","停電増","安全性のみ低下"], answerIndex:0, expJP:"柔軟性の損失。", expES:"Menos flexibilidad." },
      { id:"e3q4", prompt:"現実的折衷は？", choices:["段階的適用","即時全面適用","一切不適用","部署別バラバラ"], answerIndex:0, expJP:"段階的。", expES:"Por etapas." },
      { id:"e3q5", prompt:"本文の性格は？", choices:["実務的設計論","感情論","政治宣伝","文学評論"], answerIndex:0, expJP:"実務重視。", expES:"Diseño práctico." },
    ]
  },
];

/* Actividades 2x8 */
type Q = { id:string; type:"kanji"|"vocab"|"grammar"|"reading"; prompt:string; choices:string[]; answerIndex:number; expJP:string; expES:string; tip?:string; };
const ACTIVITY_A: Q[] = [
  { id:"ea1", type:"vocab", prompt:"『緩和策』は？", choices:["medidas de mitigación","medidas punitivas","medidas fiscales","medidas estéticas"], answerIndex:0, expJP:"温室効果の緩和。", expES:"Mitigar el cambio climático." },
  { id:"ea2", type:"vocab", prompt:"『適応』は？", choices:["adaptación","adopción","adsorción","adecuación fiscal"], answerIndex:0, expJP:"影響に適応。", expES:"Ajustarse a impactos." },
  { id:"ea3", type:"grammar", prompt:"『〜をめぐって』の用法は？", choices:["議論・争点","逆接","例示","禁止"], answerIndex:0, expJP:"論点を示す。", expES:"Debate en torno a X." },
  { id:"ea4", type:"reading", prompt:"e1の阻害要因は？", choices:["不均衡な負担","強風","低日照","港湾渋滞"], answerIndex:0, expJP:"不公平。", expES:"Reparto inequitativo." },
  { id:"ea5", type:"vocab", prompt:"『森林吸収源』は？", choices:["sumideros forestales","bosques urbanos","madera certificada","deforestación"], answerIndex:0, expJP:"CO₂吸収源。", expES:"Absorben CO₂." },
  { id:"ea6", type:"grammar", prompt:"『〜に先立ち』は？", choices:["事前に/前提として","対比表現","譲歩","願望"], answerIndex:0, expJP:"事前手続。", expES:"Previo a X." },
  { id:"ea7", type:"reading", prompt:"e2の三本柱は？", choices:["緑化・日陰・冷却舗装","輸出・輸入・備蓄","広告・観光・集客","港湾・空港・道路"], answerIndex:0, expJP:"本文参照。", expES:"Verde, sombra y pavimento frío." },
  { id:"ea8", type:"vocab", prompt:"『循環型経済』は？", choices:["economía circular","economía lineal","economía cerrada","economía de trueque"], answerIndex:0, expJP:"循環利用。", expES:"Recircular recursos." },
];
const ACTIVITY_B: Q[] = [
  { id:"eb1", type:"grammar", prompt:"『〜に即して』の訳は？", choices:["conforme a / ajustado a","a pesar de","por más que","salvo que"], answerIndex:0, expJP:"基準・現場に合わせ。", expES:"Conforme a." },
  { id:"eb2", type:"vocab", prompt:"『海面上昇』は？", choices:["elevación del nivel del mar","marejada","tsunami","pleamar"], answerIndex:0, expJP:"海面が上がる現象。", expES:"Sube el nivel del mar." },
  { id:"eb3", type:"reading", prompt:"e3の折衷案は？", choices:["段階的適用","全面即時適用","一切不適用","部署別運用"], answerIndex:0, expJP:"段階的が現実的。", expES:"Aplicar por etapas." },
  { id:"eb4", type:"vocab", prompt:"『環境影響評価』は？", choices:["evaluación de impacto ambiental","evaluación de riesgos laborales","evaluación financiera","evaluación médica"], answerIndex:0, expJP:"EIA。", expES:"EIA." },
  { id:"eb5", type:"grammar", prompt:"『〜べく』は？", choices:["目的表現","条件","原因","逆接"], answerIndex:0, expJP:"目的の硬い表現。", expES:"Finalidad elevada." },
  { id:"eb6", type:"vocab", prompt:"『レジリエンス』は？", choices:["resiliencia","resistencia térmica","resistencia eléctrica","resistencia química"], answerIndex:0, expJP:"回復・耐性。", expES:"Capacidad de recuperarse." },
  { id:"eb7", type:"reading", prompt:"e2で不可欠なのは？", choices:["維持費と公平性配慮","全面民営化","冬季限定","広告増設"], answerIndex:0, expJP:"費用・公正配慮。", expES:"Presupuesto y equidad." },
  { id:"eb8", type:"vocab", prompt:"『排出量取引』は？", choices:["comercio de emisiones","comercio minorista","comercio exterior","comercio digital"], answerIndex:0, expJP:"排出枠の取引。", expES:"Cap-and-trade." },
];

/* ReadingBlock (igual que Law) */
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
export default function N1_EnvironmentScreen(){
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
        <Text style={styles.topTitle}>Medio ambiente y clima</Text>
        <Pressable style={styles.closeBtn} onPress={() => nav.goBack()}><Text style={styles.closeTxt}>Cerrar</Text></Pressable>
      </View>

      <FlatList
        data={[{ key:"content" }]}
        keyExtractor={(it)=>it.key}
        contentContainerStyle={{ paddingBottom:120 }}
        renderItem={()=>(<>
          {/* HERO */}
          <View style={styles.hero}>
            <ExpoImage source={coverFor("environment")} style={styles.heroImg} contentFit="cover"/>
            <LinearGradient colors={["rgba(0,0,0,0.35)","rgba(0,0,0,0.65)"]} style={StyleSheet.absoluteFillObject}/>
            <View style={styles.heroIn}>
              <Text style={styles.kicker}>N1 · Medio ambiente</Text>
              <Text style={styles.heroTitle}>Clima, ciudades y resiliencia</Text>
              <Text style={styles.heroSub}>Vocabulario técnico, gramática formal y lecturas aplicadas al clima.</Text>
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
                  <Text style={styles.gramH}>Matices y diferencias</Text><Text style={styles.gramTxt}>{g.matices}</Text>
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

/* styles (idénticos a Law, copiados) */
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
