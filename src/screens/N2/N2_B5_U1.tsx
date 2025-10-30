// src/screens/N2/N2_B5_U1.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import UnitTemplate from "./UnitTemplate";

const { width } = Dimensions.get("window");
const accent = "#0EA5E9"; // B5: cian amable
const BG = "#0B0F19";
const BORDER = "rgba(255,255,255,0.08)";

function speakJP(t: string){ try{ Speech.stop(); Speech.speak(t,{language:"ja-JP", rate:1.0}); }catch{} }
function speakES(t: string){ try{ Speech.stop(); Speech.speak(t,{language:"es-MX", rate:1.0}); }catch{} }

/* ──────────────────────────────────────────────────────────────────────────────
   GUÍA: 8 bloques de uso real (30+ expresiones) con lectura (hiragana) y ES
   Incluye diferencias jefe (上司) vs. colegas (同僚), cliente (顧客)
────────────────────────────────────────────────────────────────────────────── */
type Ex = { jp:string; yomi:string; es:string };
const GUIA: { tag:string; ambito:string; descES:string; jefe?:string; colegas?:string; puntos:string[]; ejemplos:Ex[] }[] = [
  {
    tag: "Llegada/Salida",
    ambito: "挨拶（あいさつ）・身だしなみ",
    descES: "Saludo profesional, tono amable, puntualidad y apariencia cuidada.",
    jefe: "Registra superioridad con keigo: ～でございます／～いたします。",
    colegas: "Más neutro, pero profesional; evita coloquialismos fuertes.",
    puntos: [
      "Al llegar: おはようございます／お疲れ様です",
      "Al irse: お先に失礼いたします／お疲れ様でした",
      "Presentarse con cliente: 〜社の〜でございます",
    ],
    ejemplos: [
      { jp:"お疲れ様です。田中でございます。", yomi:"おつかれさまです。たなか で ございます。", es:"Buen día, soy Tanaka (muy formal)." },
      { jp:"本日はよろしくお願いいたします。", yomi:"ほんじつ は よろしく おねがい いたします。", es:"Quedo a sus órdenes hoy." },
      { jp:"お先に失礼いたします。", yomi:"おさき に しつれい いたします。", es:"Con permiso, me retiro antes." },
      { jp:"お疲れ様でした。", yomi:"おつかれさまでした。", es:"Gracias por su esfuerzo." },
    ]
  },
  {
    tag: "Correo/Chat de empresa",
    ambito: "メール・チャット",
    descES: "Estructura: saludo → propósito breve → petición/entrega → cierre cortés.",
    jefe: "Usa 何卒／恐れ入りますが／ご確認のほどお願い申し上げます。",
    colegas: "Puedes usar 〜お願いします／ご確認ください (neutro educado).",
    puntos: [
      "Asunto claro, fechas/hora, tareas con bullet",
      "Pedir confirmación: ご確認のほどお願いいたします",
      "Cierre: 何卒よろしくお願いいたします",
    ],
    ejemplos: [
      { jp:"資料を共有いたしました。ご確認ください。", yomi:"しりょう を きょうゆう いたしました。ごかくにん ください。", es:"He compartido los materiales. Por favor confirme." },
      { jp:"何卒よろしくお願いいたします。", yomi:"なにとぞ よろしく おねがい いたします。", es:"Agradezco de antemano su amable apoyo." },
      { jp:"恐れ入りますが、添付をご確認いただけますでしょうか。", yomi:"おそれいりますが、てんぷ を ごかくにん いただけます でしょうか。", es:"Disculpe, ¿podría revisar el adjunto?" },
      { jp:"返信が遅れ、申し訳ございません。", yomi:"へんしん が おくれ、もうしわけ ございません。", es:"Disculpe la demora en responder." },
    ]
  },
  {
    tag: "Reuniones",
    ambito: "会議・打ち合わせ",
    descES: "Objetivo claro, confirmar agenda, tomar turnos para hablar, minutas.",
    jefe: "Evita interrumpir; valida y resume: 〜承知いたしました。",
    colegas: "Tono colaborativo; preguntas breves y precisas.",
    puntos: [
      "Abrir: 本日の議題は〜です",
      "Tomar turno: よろしいでしょうか／一点だけ確認させてください",
      "Cerrar: 本日は貴重なお時間をありがとうございました",
    ],
    ejemplos: [
      { jp:"一点だけ確認させてください。", yomi:"いってん だけ かくにん させて ください。", es:"Permítame confirmar solo un punto." },
      { jp:"承知いたしました。こちらで対応いたします。", yomi:"しょうち いたしました。こちら で たいおう いたします。", es:"Entendido; lo atenderemos de nuestro lado." },
      { jp:"本日の議題は三点ございます。", yomi:"ほんじつ の ぎだい は さんてん ございます。", es:"La agenda de hoy tiene 3 puntos." },
      { jp:"貴重なご意見をありがとうございます。", yomi:"きちょう な ごいけん を ありがとうございます。", es:"Gracias por la valiosa opinión." },
    ]
  },
  {
    tag: "Reportar/Consultar",
    ambito: "報連相（ほうれんそう）",
    descES: "報＝reportar, 連＝avisar cambios, 相＝consultar antes de decidir.",
    jefe: "Siempre ofrecer solución/plan: 〜までに〜いたします。",
    colegas: "Comunicación proactiva y breve.",
    puntos: [
      "Estado: 進捗をご報告いたします",
      "Cambio: 日程が変更となりました",
      "Consulta: ご相談させていただけますか",
    ],
    ejemplos: [
      { jp:"進捗をご報告いたします。", yomi:"しんちょく を ごほうこく いたします。", es:"Le informo el progreso." },
      { jp:"日程が変更となりました。", yomi:"にってい が へんこう と なりました。", es:"El calendario ha cambiado." },
      { jp:"この件についてご相談させていただけますか。", yomi:"この けん に ついて ごそうだん させて いただけます か。", es:"¿Podría consultarle sobre este asunto?" },
      { jp:"不備があり、至急修正いたします。", yomi:"ふび が あり、しきゅう しゅうせい いたします。", es:"Hubo una deficiencia; lo corregimos de inmediato." },
    ]
  },
  {
    tag: "Comida/Visita",
    ambito: "会食・訪問マナー",
    descES: "Al comer: agradecimiento, servir a otros primero, manejo de cuenta.",
    jefe: "Más deferencia; evita tomar el último bocado primero.",
    colegas: "Relax moderado, pero cuida modales.",
    puntos: [
      "Antes de comer: いただきます／Después: ごちそうさまでした",
      "Ofrecer servir: お注ぎいたします／取り分けましょうか",
      "Cuenta: こちらでお支払いさせてください（cliente）",
    ],
    ejemplos: [
      { jp:"本日はお招きいただき、誠にありがとうございます。", yomi:"ほんじつ は おまねき いただき、まことに ありがとうございます。", es:"Muchas gracias por la invitación." },
      { jp:"お先にどうぞ。", yomi:"おさき に どうぞ。", es:"Por favor, primero usted." },
      { jp:"ごちそうさまでした。", yomi:"ごちそうさまでした。", es:"Gracias por la comida." },
      { jp:"失礼して先にいただきます。", yomi:"しつれい して さき に いただきます。", es:"Con permiso, empezaré." },
    ]
  },
  {
    tag: "Citas/Agenda",
    ambito: "日程調整・アポイント",
    descES: "Proponer opciones, confirmar lugar y plataforma, zona horaria.",
    jefe: "Ofrece alternativas y respeta disponibilidad.",
    colegas: "Más directo pero cortesía neutra.",
    puntos: [
      "Proponer: 〜はいかがでしょうか",
      "Confirmar TZ: 日本時間で〜時／メキシコ時間で〜時",
      "Reprogramar: 恐れ入りますが、再調整できますか",
    ],
    ejemplos: [
      { jp:"来週の水曜10時はいかがでしょうか。", yomi:"らいしゅう の すいよう 10じ は いかが でしょうか。", es:"¿Qué tal el miércoles próximo a las 10?" },
      { jp:"日本時間で午後3時、メキシコ時間で午前0時です。", yomi:"にほんじかん で ごご さんじ、メキシコじかん で ごぜん れいじ です。", es:"3 p.m. JST, 12 a.m. hora de México." },
      { jp:"恐れ入りますが、再調整できますでしょうか。", yomi:"おそれいりますが、さいちょうせい できます でしょうか。", es:"Disculpe, ¿podríamos reprogramar?" },
      { jp:"当日はオンラインでお願いできますか。", yomi:"とうじつ は オンライン で おねがい できます か。", es:"¿Podemos hacerlo en línea ese día?" },
    ]
  },
  {
    tag: "Retrasos/Errores",
    ambito: "遅延・ミス対応",
    descES: "Disculpa + causa breve + plan concreto + hora comprometedora.",
    jefe: "El plan es obligatorio; evita justificarte.",
    colegas: "Sé objetivo y ofrece ayuda si afecta a otros.",
    puntos: [
      "遅れて申し訳ございません → 新しい提出時刻を明示",
      "原因は簡潔に／再発防止案を示す",
      "謝意＋リカバリー： ご協力に感謝し、〜までに挽回いたします",
    ],
    ejemplos: [
      { jp:"共有が遅れ、大変申し訳ございません。10時までに送付いたします。", yomi:"きょうゆう が おくれ、たいへん もうしわけ ございません。10じ まで に そうふ いたします。", es:"Disculpe el retraso; envío antes de las 10." },
      { jp:"以後、同様のことがないよう改善いたします。", yomi:"いご、どうよう の こと が ない よう かいぜん いたします。", es:"Mejoraremos para evitar reincidencia." },
      { jp:"ご迷惑をおかけして申し訳ありません。", yomi:"ごめいわく を おかけして もうしわけ ありません。", es:"Disculpe las molestias." },
      { jp:"至急対応いたします。", yomi:"しきゅう たいおう いたします。", es:"Lo atiendo de inmediato." },
    ]
  },
  {
    tag: "Despedidas/Formalidades",
    ambito: "締め・見送り",
    descES: "Cerrar con agradecimiento, próximos pasos y disponibilidad.",
    jefe: "Cierre alto: 引き続きよろしくお願い申し上げます。",
    colegas: "Neutro cordial: 引き続きよろしくお願いします。",
    puntos: [
      "Próximos pasos claros; fecha/hora de seguimiento",
      "Agradecimiento específico (por tiempo/atención)",
      "Disponibilidad: 何かございましたらご連絡ください",
    ],
    ejemplos: [
      { jp:"本日は貴重なお時間をありがとうございました。", yomi:"ほんじつ は きちょう な おじかん を ありがとう ございました。", es:"Gracias por su valioso tiempo." },
      { jp:"引き続きよろしくお願い申し上げます。", yomi:"ひきつづき よろしく おねがい もうしあげます。", es:"Seguimos a sus órdenes (muy formal)." },
      { jp:"何かございましたらご連絡ください。", yomi:"なにか ございましたら ごれんらく ください。", es:"Si hay algo, por favor contacte." },
      { jp:"本件は以上です。失礼いたします。", yomi:"ほんけん は いじょう です。しつれい いたします。", es:"Eso sería todo por mi parte. Con permiso." },
    ]
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   ACTIVIDAD 1: 10 escenarios de oficina (elige la mejor). Con “por qué”.
────────────────────────────────────────────────────────────────────────────── */
type Choice = { jp:string; yomi:string; es:string; why:string; correct:boolean };
type Scene = { id:string; promptJP:string; yomi:string; choices:Choice[] };

const ESCENARIOS: Scene[] = [
  {
    id:"s1",
    promptJP:"朝、課長に初めて会いました。最も自然な挨拶は？",
    yomi:"あさ、かちょう に はじめて あいました。もっとも しぜん な あいさつ は？",
    choices:[
      { jp:"おはよう。田中です。", yomi:"おはよう。たなか です。", es:"Buenos días. Soy Tanaka.", why:"Demasiado informal para superior.", correct:false },
      { jp:"おはようございます。田中でございます。よろしくお願いいたします。", yomi:"おはようございます。たなか で ございます。よろしく おねがい いたします。", es:"Buenos días. Soy Tanaka. Mucho gusto.", why:"Keigo correcto y completo.", correct:true },
      { jp:"ねえ、課長。今日よろしく。", yomi:"ねえ、かちょう。きょう よろしく。", es:"Oiga, jefe. Hoy a darle.", why:"Muy coloquial/inadecuado.", correct:false },
    ]
  },
  {
    id:"s2",
    promptJP:"依頼した資料が遅れました。どう伝える？",
    yomi:"いらい した しりょう が おくれました。どう つたえる？",
    choices:[
      { jp:"遅れました。すみません。", yomi:"おくれました。すみません。", es:"Se retrasó. Perdón.", why:"Insuficiente para formal/empresa.", correct:false },
      { jp:"資料の共有が遅れ、大変申し訳ございません。10時までに送付いたします。", yomi:"しりょう の きょうゆう が おくれ、たいへん もうしわけ ございません。10じ まで に そうふ いたします。", es:"Disculpe el retraso; lo envío antes de las 10.", why:"Disculpa formal + solución concreta.", correct:true },
      { jp:"忙しかったので遅れました。", yomi:"いそがしかった ので おくれました。", es:"Me retrasé porque estaba ocupado.", why:"Excusa directa, poco profesional.", correct:false },
    ]
  },
  {
    id:"s3",
    promptJP:"取引先にオンライン会議の提案をします。自然なのは？",
    yomi:"とりひきさき に オンライン かいぎ の ていあん を します。しぜん なの は？",
    choices:[
      { jp:"オンラインでいいですか？", yomi:"オンライン で いい です か？", es:"¿Online está bien?", why:"Muy directo; poco formal.", correct:false },
      { jp:"当日はオンラインにてお願いできますでしょうか。", yomi:"とうじつ は オンライン にて おねがい できます でしょうか。", es:"¿Podemos hacerlo en línea ese día?", why:"Fórmula formal correcta.", correct:true },
      { jp:"Zoomで。", yomi:"ズーム で。", es:"Por Zoom.", why:"Telegráfico.", correct:false },
    ]
  },
  {
    id:"s4",
    promptJP:"会議中、上司の意見に異なる視点を述べたい時は？",
    yomi:"かいぎ ちゅう、じょうし の いけん に ことなる してん を のべたい とき は？",
    choices:[
      { jp:"違います。", yomi:"ちがいます。", es:"No, está mal.", why:"Demasiado frontal.", correct:false },
      { jp:"恐れ入りますが、別の観点から一点だけよろしいでしょうか。", yomi:"おそれいりますが、べつ の かんてん から いってん だけ よろしい でしょう か。", es:"Con su permiso, ¿puedo aportar otro ángulo?", why:"Amortigua + pide turno.", correct:true },
      { jp:"でもそれは…", yomi:"でも それ は…", es:"Pero eso…", why:"Corta y poco profesional.", correct:false },
    ]
  },
  {
    id:"s5",
    promptJP:"同僚に軽く手伝いを依頼。どれ？",
    yomi:"どうりょう に かるく てつだい を いらい。どれ？",
    choices:[
      { jp:"ちょっと手伝って。", yomi:"ちょっと てつだって。", es:"Échame la mano.", why:"Muy casual.", correct:false },
      { jp:"可能でしたら、こちらの確認をお願いできますか。", yomi:"かのう でしたら、こちら の かくにん を おねがい できます か。", es:"Si es posible, ¿podrías confirmar esto?", why:"Cortés y neutro.", correct:true },
      { jp:"今やって。", yomi:"いま やって。", es:"Hazlo ahora.", why:"Imperativo.", correct:false },
    ]
  },
  {
    id:"s6",
    promptJP:"会食で上席が箸を取る前の一言は？",
    yomi:"かいしょく で じょうせき が はし を とる まえ の ひとこと は？",
    choices:[
      { jp:"いただきます。", yomi:"いただきます。", es:"¡A comer!", why:"Sin deferencia previa.", correct:false },
      { jp:"お先にどうぞ。", yomi:"おさき に どうぞ。", es:"Por favor, primero usted.", why:"Cortesía correcta.", correct:true },
      { jp:"早く食べましょう。", yomi:"はやく たべましょう。", es:"Comamos rápido.", why:"Inadecuado.", correct:false },
    ]
  },
  {
    id:"s7",
    promptJP:"締切延長をお願いしたい。最も丁寧？",
    yomi:"しめきり えんちょう を おねがい したい。もっとも ていねい？",
    choices:[
      { jp:"無理です。延ばしてください。", yomi:"むり です。のばして ください。", es:"Imposible, extienda.", why:"Tono rudo.", correct:false },
      { jp:"恐れ入りますが、三日ほど延長いただくことは可能でしょうか。", yomi:"おそれいりますが、みっか ほど えんちょう いただく こと は かのう でしょう か。", es:"¿Sería posible extender ~3 días?", why:"Pide con atenuadores + cifra.", correct:true },
      { jp:"締切を変えて。", yomi:"しめきり を かえて。", es:"Cambia la fecha.", why:"Imperativo.", correct:false },
    ]
  },
  {
    id:"s8",
    promptJP:"電話で名乗る最初の一言は？",
    yomi:"でんわ で なのる さいしょ の ひとこと は？",
    choices:[
      { jp:"もしもし、田中です。", yomi:"もしもし、たなか です。", es:"¿Hola? Soy Tanaka.", why:"Vale con conocidos; falta empresa.", correct:false },
      { jp:"お電話ありがとうございます。株式会社Aの田中でございます。", yomi:"おでんわ ありがとう ございます。かぶしきがいしゃ A の たなか で ございます。", es:"Gracias por llamar, habla Tanaka de A.", why:"Formal correcto.", correct:true },
      { jp:"はい、田中。", yomi:"はい、たなか。", es:"Sí, Tanaka.", why:"Seco.", correct:false },
    ]
  },
  {
    id:"s9",
    promptJP:"客先で名刺交換のあと、自然な流れは？",
    yomi:"きゃくさき で めいし こうかん の あと、しぜん な ながれ は？",
    choices:[
      { jp:"では本題に。", yomi:"では ほんだい に。", es:"A lo que vamos.", why:"Brusco.", correct:false },
      { jp:"本日はお時間をいただき、誠にありがとうございます。", yomi:"ほんじつ は おじかん を いただき、まことに ありがとうございます。", es:"Gracias por su tiempo hoy.", why:"Cortesía adecuada.", correct:true },
      { jp:"長いですね。", yomi:"ながい です ね。", es:"Qué largo.", why:"Comentario fuera de lugar.", correct:false },
    ]
  },
  {
    id:"s10",
    promptJP:"退勤時、上司が席にいる。最も適切？",
    yomi:"たいきん じ、じょうし が せき に いる。もっとも てきせつ？",
    choices:[
      { jp:"じゃ、お先に。", yomi:"じゃ、おさき に。", es:"Bueno, me voy.", why:"Muy casual.", correct:false },
      { jp:"お先に失礼いたします。本日もありがとうございました。", yomi:"おさき に しつれい いたします。ほんじつ も ありがとうございました。", es:"Con permiso, me retiro; gracias por hoy.", why:"Cierre perfecto.", correct:true },
      { jp:"バイバイ。", yomi:"ばいばい。", es:"Bye.", why:"Demasiado coloquial.", correct:false },
    ]
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   ACTIVIDAD 2: Keigo/empresa (20 reactivos) con sonido y explicación
────────────────────────────────────────────────────────────────────────────── */
type Q = { id:string; stem:string; options:string[]; answer:number; explain:string };
const QUIZ: Q[] = [
  { id:"q1",  stem:"“Lo revisaré” (muy formal) →", options:["確認します","確認いたします","確認させます"], answer:1, explain:"いたします = humilde formal." },
  { id:"q2",  stem:"“Disculpe las molestias” →", options:["ご苦労さまです","よろしくお願いします","お手数をおかけして申し訳ございません"], answer:2, explain:"Fórmula alta para incomodar a otro." },
  { id:"q3",  stem:"“Le compartí el archivo” →", options:["共有しました","共有いたしました","共有させました"], answer:1, explain:"謙譲語（けんじょうご）." },
  { id:"q4",  stem:"“Gracias por su valiosa opinión” →", options:["貴重なご意見をありがとうございます","すみません","助かります"], answer:0, explain:"Empresa/pulido." },
  { id:"q5",  stem:"“Me permitiré consultarlo” →", options:["相談します","相談いたします","相談ください"], answer:1, explain:"Humilde correcto." },
  { id:"q6",  stem:"“Entendido (recibido)” →", options:["了解です","承知いたしました","わかりました"], answer:1, explain:"Con superior/cliente, 承知いたしました." },
  { id:"q7",  stem:"“Le avisaré más tarde” →", options:["後で知らせます","後ほどご連絡いたします","またね"], answer:1, explain:"後ほど + ご連絡 + いたします." },
  { id:"q8",  stem:"“Muchas gracias por hoy” →", options:["今日はありがとう","本日は誠にありがとうございました","今日もよろしく"], answer:1, explain:"誠に eleva." },
  { id:"q9",  stem:"“¿Podría confirmar?” →", options:["確認して","ご確認いただけますでしょうか","見てください"], answer:1, explain:"Fórmula de ruego." },
  { id:"q10", stem:"“Le pido una disculpa” →", options:["ごめん","申し訳ありません","悪かった"], answer:1, explain:"Formal neutro." },
  { id:"q11", stem:"“Le acompaño” (humilde) →", options:["一緒に行きます","ご案内いたします","行きますね"], answer:1, explain:"案内 + いたします." },
  { id:"q12", stem:"“Se lo enviaré de inmediato” →", options:["すぐ送る","ただちに送付いたします","今から送るね"], answer:1, explain:"送付 + いたします + ただちに." },
  { id:"q13", stem:"“Disculpe, ¿podría repetir?”", options:["もう一度言って","もう一度お願いいたします","何？"], answer:1, explain:"お願いいたします = elegante." },
  { id:"q14", stem:"“Entregaremos antes de las 17:00”", options:["17時までに提出します","17時前に提出いたします","17時に提出する"], answer:1, explain:"前に + いたします sube registro." },
  { id:"q15", stem:"“Gracias por la coordinación”", options:["調整ありがとう","調整ありがとうございます","調整いただき、誠にありがとうございます"], answer:2, explain:"いただき + 誠に → alto." },
  { id:"q16", stem:"“Solicito su amable apoyo”", options:["助けて","ご協力をお願いいたします","よろしく"], answer:1, explain:"Fórmula fija empresa." },
  { id:"q17", stem:"“Lamento el inconveniente”", options:["ご迷惑をおかけして申し訳ございません","すみませんでした","悪いです"], answer:0, explain:"Más alto." },
  { id:"q18", stem:"“Confirmé la agenda”", options:["日程確認した","日程を確認いたしました","確認OK"], answer:1, explain:"いたしました." },
  { id:"q19", stem:"“Agradeceríamos su presencia”", options:["来てください","ご参加いただけますと幸いです","来てほしい"], answer:1, explain:"〜いただけますと幸い." },
  { id:"q20", stem:"“Quedo atento(a) a sus comentarios”", options:["返信待ってます","ご意見をお待ちしております","コメントよろしく"], answer:1, explain:"お待ちしております = formal." },
];

/* ──────────────────────────────────────────────────────────────────────────────
   ACTIVIDAD 3: Puntos de cortesía (15 expresiones)
   Toca una opción; si es 3 = correcto (alto), 2 = medio, 1 = bajo.
────────────────────────────────────────────────────────────────────────────── */
type Etiqueta = { id:string; jp:string; yomi:string; es:string; polite:number };
const EXPRESIONES: Etiqueta[] = [
  { id:"p1",  jp:"承知いたしました。", yomi:"しょうち いたしました。", es:"Entendido (muy formal).", polite:3 },
  { id:"p2",  jp:"了解です。", yomi:"りょうかい です。", es:"Enterado (neutro).", polite:2 },
  { id:"p3",  jp:"わかりました。", yomi:"わかりました。", es:"Entendido (casual/neutral).", polite:1 },
  { id:"p4",  jp:"恐れ入りますが、", yomi:"おそれいります が、", es:"Disculpe, pero… (amortiguador)", polite:3 },
  { id:"p5",  jp:"差し支えなければ、", yomi:"さしつかえ なければ、", es:"Si no es inconveniente…", polite:3 },
  { id:"p6",  jp:"お手数ですが、", yomi:"おてすう です が、", es:"Perdón la molestia, pero…", polite:3 },
  { id:"p7",  jp:"すみませんが、", yomi:"すみません が、", es:"Perdón, pero…", polite:2 },
  { id:"p8",  jp:"よろしくお願いします。", yomi:"よろしく おねがい します。", es:"Gracias/por favor (neutro).", polite:2 },
  { id:"p9",  jp:"お願いします。", yomi:"おねがい します。", es:"Por favor.", polite:1 },
  { id:"p10", jp:"ご教示いただけますでしょうか。", yomi:"ごきょうじ いただけます でしょう か。", es:"¿Podría orientarme?", polite:3 },
  { id:"p11", jp:"見てください。", yomi:"みて ください。", es:"Mire por favor.", polite:1 },
  { id:"p12", jp:"ご確認のほどお願いいたします。", yomi:"ごかくにん の ほど おねがい いたします。", es:"Agradezco su confirmación.", polite:3 },
  { id:"p13", jp:"至急お願いします。", yomi:"しきゅう おねがい します。", es:"Urgente, por favor.", polite:2 },
  { id:"p14", jp:"早めにお願いします。", yomi:"はやめ に おねがい します。", es:"Si puede, temprano.", polite:2 },
  { id:"p15", jp:"ただちに送付いたします。", yomi:"ただちに そうふ いたします。", es:"Lo envío de inmediato.", polite:3 },
];

/* ──────────────────────────────────────────────────────────────────────────────
   COMPONENTE
────────────────────────────────────────────────────────────────────────────── */
export default function N2_B5_U1(){
  const [progress, setProgress] = useState(0);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const mark = () => setProgress(p=>Math.min(1,p+0.2));

  // A1
  const [ans1, setAns1] = useState<Record<string, number|null>>(
    Object.fromEntries(ESCENARIOS.map(s=>[s.id,null]))
  );
  const [done1, setDone1] = useState(false);

  // A2
  const [ans2, setAns2] = useState<Record<string, number|null>>(
    Object.fromEntries(QUIZ.map(q=>[q.id,null]))
  );
  const score2 = useMemo(()=>QUIZ.reduce((s,q)=>s+((ans2[q.id]===q.answer)?1:0),0),[ans2]);

  // A3
  const [picked, setPicked] = useState<string|null>(null);
  const courtesy = useMemo(()=>{
    const sel=EXPRESIONES.find(e=>e.id===picked);
    return sel? sel.polite:0;
  },[picked]);

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b5_u1.webp")}
      accent={accent}
      breadcrumb="B5 · U1"
      title="Comportamiento en empresas japonesas"
      subtitle="Saludo, keigo, 報連相 y consenso — diferencias con jefes, colegas y clientes."
      ctas={[
        { label:"Consejo de etiqueta", onPress:()=>speakES("Para superiores/cliente usa formas humildes (いたします／でございます). Atenúa con 恐れ入りますが／差し支えなければ antes de pedir.") },
        { label:"Marcar avance", onPress:mark }
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Siguiente"
    >
      {/* Guía */}
      <View style={[styles.card,{borderColor:accent}]}>
        <Text style={styles.h2}>Guía clara por ámbitos (con hiragana y diferencia 上司 vs 同僚)</Text>
        {GUIA.map((g,i)=>(
          <View key={i} style={{marginTop:10}}>
            <View style={styles.tagRow}>
              <Text style={styles.badge}>{g.tag} · {g.ambito}</Text>
            </View>
            <Text style={styles.p}>{g.descES}</Text>
            {!!g.jefe && <Text style={styles.tip}>Con jefe/cliente: {g.jefe}</Text>}
            {!!g.colegas && <Text style={styles.tip}>Con colegas: {g.colegas}</Text>}
            {g.puntos.map((p,k)=>(<Text key={k} style={styles.li}>• {p}</Text>))}
            {g.ejemplos.map((ex,k)=>(
              <View key={k} style={styles.inner}>
                <View style={styles.rowBetween}>
                  <Text style={styles.jp}>{ex.jp}</Text>
                  <Pressable onPress={()=>speakJP(ex.jp)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
                </View>
                <Text style={styles.yomi}>{ex.yomi}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* A1 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 1 · 10 escenarios en oficina</Text>
        {ESCENARIOS.map(s=>{
          const chosen = ans1[s.id];
          const show = done1 && chosen!==null;
          return (
            <View key={s.id} style={{marginTop:10}}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{s.promptJP}</Text>
                <Pressable onPress={()=>speakJP(s.promptJP)}><MCI name="volume-high" size={18} color="#fff"/></Pressable>
              </View>
              <Text style={styles.yomi}>{s.yomi}</Text>
              {s.choices.map((c,idx)=>{
                const isChosen = chosen===idx;
                const ok = show && isChosen && c.correct;
                const ko = show && isChosen && !c.correct;
                return (
                  <Pressable
                    key={idx}
                    onPress={()=>{
                      setAns1(prev=>({...prev,[s.id]:idx}));
                      if (done1) (c.correct?playCorrect():playWrong());
                    }}
                    style={[
                      styles.choice,
                      isChosen && { backgroundColor:"rgba(14,165,233,0.18)", borderColor:accent },
                      ok && { borderColor:"#16a34a" },
                      ko && { borderColor:"#ef4444" },
                    ]}
                  >
                    <Text style={styles.choiceText}>{c.jp}</Text>
                    <Text style={styles.yomi}>{c.yomi}</Text>
                    <Text style={styles.es}>{c.es}</Text>
                    {show && isChosen && <Text style={styles.explain}>Por qué: {c.why}</Text>}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        <View style={styles.actions}>
          <Btn label="Calificar" onPress={()=>{
            setDone1(true);
            Object.entries(ans1).forEach(([id,idx])=>{
              const sc=ESCENARIOS.find(x=>x.id===id);
              if (!sc || idx==null) return;
              sc.choices[idx].correct?playCorrect():playWrong();
            });
          }}/>
          <Btn label="Reiniciar" variant="ghost" onPress={()=>{
            setDone1(false);
            setAns1(Object.fromEntries(ESCENARIOS.map(s=>[s.id,null])));
          }}/>
        </View>
      </View>

      {/* A2 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 2 · Keigo/empresa (20)</Text>
        {QUIZ.map(q=>{
          const chosen = ans2[q.id];
          const show = chosen!==null && chosen!==undefined;
          return (
            <View key={q.id} style={{marginTop:10}}>
              <Text style={styles.jp}>{q.stem}</Text>
              {q.options.map((opt,idx)=>{
                const isChosen = chosen===idx;
                const isCorrect = idx===q.answer;
                const border = show && isChosen ? (isCorrect?{borderColor:"#16a34a"}:{borderColor:"#ef4444"}) : {};
                return (
                  <Pressable
                    key={idx}
                    onPress={()=>{
                      setAns2(prev=>({...prev,[q.id]:idx}));
                      (idx===q.answer)?playCorrect():playWrong();
                    }}
                    style={[styles.choice, isChosen && { backgroundColor:"rgba(14,165,233,0.18)", borderColor:accent }, border]}
                  >
                    <Text style={styles.choiceText}>{opt}</Text>
                  </Pressable>
                );
              })}
              {show && <Text style={styles.explain}>Explicación: {q.explain}</Text>}
            </View>
          );
        })}
        <View style={styles.actions}>
          <Btn label={`Ver puntuación: ${score2}/20`} onPress={()=>Alert.alert("Resultado",`Tu puntuación: ${score2}/20`)}/>
          <Btn label="Reiniciar" variant="ghost" onPress={()=>setAns2(Object.fromEntries(QUIZ.map(q=>[q.id,null])))}/>
        </View>
      </View>

      {/* A3 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 3 · Puntos de cortesía (15)</Text>
        <Text style={styles.p}>Elige la frase que usarías con superior/cliente. Ganas puntos según el nivel de cortesía (1–3).</Text>
        <View style={{marginTop:8}}>
          {EXPRESIONES.map(e=>{
            const chosen = picked===e.id;
            return (
              <Pressable
                key={e.id}
                onPress={()=>{
                  setPicked(e.id);
                  if (e.polite>=3) playCorrect(); else playWrong();
                }}
                style={[
                  styles.choice,
                  chosen && { backgroundColor:"rgba(14,165,233,0.18)", borderColor:accent },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.jp}>{e.jp}</Text>
                  <Pressable onPress={()=>speakJP(e.jp)}><MCI name="volume-high" size={18} color="#fff"/></Pressable>
                </View>
                <Text style={styles.yomi}>{e.yomi}</Text>
                <Text style={styles.es}>{e.es}</Text>
              </Pressable>
            );
          })}
          <Text style={[styles.es,{marginTop:8}]}>Puntos de cortesía: <Text style={{color:"#86efac",fontWeight:"900"}}>{courtesy}</Text> / 3</Text>
          <Text style={styles.explain}>
            {courtesy>=3 ? "¡Excelente etiqueta! 🏅" : courtesy===2 ? "Bien, pero intenta elevar registro con formas humildes." : "Muy casual para la oficina; prefiera ‘〜いたします／恐れ入りますが…’"}
          </Text>
        </View>
      </View>
    </UnitTemplate>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   UI helpers
────────────────────────────────────────────────────────────────────────────── */
function Btn({label,onPress,variant="primary"}:{label:string;onPress?:()=>void;variant?:"primary"|"ghost"|"alt"}) {
  return (
    <Pressable onPress={onPress} style={[
      styles.btn, variant==="primary"?styles.btnPrimary:variant==="ghost"?styles.btnGhost:styles.btnAlt
    ]}>
      <Text style={[styles.btnText, variant==="alt" && {color:"#0B0F19"}]}>{label}</Text>
    </Pressable>
  );
}

const R=14;
const styles = StyleSheet.create({
  card:{ backgroundColor:BG, borderRadius:R, padding:14, borderWidth:1, borderColor:BORDER, marginHorizontal:16, marginBottom:12 },
  tagRow:{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:4 },
  badge:{ color:"#fff", backgroundColor:"rgba(14,165,233,0.95)", paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:"800" },
  h2:{ color:"#fff", fontWeight:"900", fontSize:16, marginBottom:6 },
  p:{ color:"rgba(255,255,255,0.9)", lineHeight:20 },
  li:{ color:"rgba(255,255,255,0.85)", marginTop:2 },
  tip:{ color:"#93C5FD", marginTop:4 },

  inner:{ backgroundColor:"#0F1423", borderRadius:12, borderWidth:1, borderColor:"rgba(255,255,255,0.06)", padding:12, marginTop:8 },

  rowBetween:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  jp:{ color:"#fff", fontSize:16, fontWeight:"800" }, // JP blanco
  yomi:{ color:"#D1D5DB", fontSize:14, marginTop:4 },
  es:{ color:"#93C5FD", fontSize:15 },
  explain:{ color:"rgba(255,255,255,0.85)", fontSize:13, marginTop:4 },

  choice:{ borderRadius:12, padding:12, borderWidth:2, borderColor:"transparent", marginTop:8 },
  choiceText:{ color:"#fff" },

  actions:{ flexDirection:"row", gap:10, alignItems:"center", marginTop:10 },
  btn:{ flexDirection:"row", alignItems:"center", gap:6, paddingVertical:8, paddingHorizontal:12, borderRadius:999 },
  btnPrimary:{ backgroundColor:"rgba(14,165,233,0.95)" },
  btnGhost:{ backgroundColor:"rgba(255,255,255,0.14)" },
  btnAlt:{ backgroundColor:"#60A5FA" },
  btnText:{ color:"#fff", fontWeight:"700", letterSpacing:0.3 },
});
