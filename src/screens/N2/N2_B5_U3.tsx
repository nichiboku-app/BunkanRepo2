// src/screens/N2/N2_B5_U3.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import UnitTemplate from "./UnitTemplate";

const accent = "#0EA5E9"; 
const BG = "#0B0F19"; 
const BORDER = "rgba(255,255,255,0.08)";
const { width } = Dimensions.get("window");

function speakJP(t: string){ try{ Speech.stop(); Speech.speak(t,{language:"ja-JP",rate:1.0}); }catch{} }
function speakES(t: string){ try{ Speech.stop(); Speech.speak(t,{language:"es-MX",rate:1.0}); }catch{} }

/* ====================== GUÍA DE USO (más clara) ====================== */
const GUIA_URBANA: { tag:string; descES:string; bullets:string[] }[] = [
  {
    tag: "Trenes / transporte",
    descES: "Usa preguntas claras en 〜ますか／〜でしょうか y confirma destino + andén. Para cambios/errores, explica breve + pregunta de alternativas.",
    bullets: [
      "Ruta: 〜までの行き方を教えていただけますか。",
      "Confirmar parada: この電車は〜に止まりますか。",
      "Transferencia: 乗り換えはどこですか。",
      "Tiempo: 〜まで何分ぐらいかかりますか。",
      "Retraso: 遅延（ちえん）していますか。",
    ],
  },
  {
    tag: "Konbini / pagos",
    descES: "Para bolsas/calentar/pagos, fórmulas fijas con 〜てもらえますか／〜で支払えますか。 Habla corto y cortés.",
    bullets: [
      "Bolsa: 袋は要りません／袋をお願いします。",
      "Calentar: 温めてもらえますか。",
      "Pago: カードで支払えますか。",
      "Recarga: チャージできますか。",
      "Ticket: 領収書（りょうしゅうしょ）をお願いします。",
    ],
  },
  {
    tag: "Cita médica / hospital",
    descES: "Expón síntoma + duración con 〜です／〜があります／〜から〜です。 Disculpa si llegas tarde y pregunta procedimiento.",
    bullets: [
      "Reservar: 予約を取りたいです。",
      "Síntoma: 熱があります／頭が痛いです。",
      "Duración: 昨日から／今朝から〜です。",
      "Seguro: 保険証を忘れました。どうすればいいですか。",
      "Medicinas: アレルギーがあります／処方箋（しょほうせん）をお願いします。",
    ],
  },
  {
    tag: "Restaurante / oficina",
    descES: "Alergias/pedidos con 〜を避（さ）けたいのですが／〜抜きでお願いします。 En oficina, anuncia cita y usa forma humilde おります.",
    bullets: [
      "Alergia: 〜を避けたいのですが。",
      "Pedido: 〜抜きでお願いします。",
      "Cuenta: お会計をお願いします。",
      "Recepción: 受付で面会（めんかい）の予約をしております。",
      "Entrega: 書類をお持ちしました（謙譲語）。",
    ],
  },
];

/* ====================== 20 EJEMPLOS POR SECCIÓN ====================== */
type Ex = { jp: string; yomi: string; es: string };

const SUPERVIVENCIA: { tag:string; descES:string; ejemplos:Ex[] }[] = [
  /* --- TRENES / TRANSPORTE (20) --- */
  {
    tag:"Trenes / transporte",
    descES:"Comprar boleto, perder transferencia, pedir indicaciones, tiempos y retrasos.",
    ejemplos:[
      { jp:"○○駅までの行き方を教えていただけますか。", yomi:"まるまる えき まで の いきかた を おしえて いただけます か。", es:"¿Podría indicarme cómo llegar a la estación ○○?" },
      { jp:"この電車は○○に止まりますか。", yomi:"この でんしゃ は まるまる に とまります か。", es:"¿Este tren se detiene en ○○?" },
      { jp:"○○線はどこですか。", yomi:"まるまる せん は どこ です か。", es:"¿Dónde está la línea ○○?" },
      { jp:"乗り換えはどこでしますか。", yomi:"のりかえ は どこ で します か。", es:"¿Dónde hago la transferencia?" },
      { jp:"○番ホームはどちらですか。", yomi:"まる ばん ホーム は どちら です か。", es:"¿Dónde está el andén número ○?" },
      { jp:"急行は何分おきに来ますか。", yomi:"きゅうこう は なんぷん おき に きます か。", es:"¿Cada cuántos minutos pasa el expreso?" },
      { jp:"○○駅まで何分ぐらいかかりますか。", yomi:"まるまる えき まで なんぷん ぐらい かかります か。", es:"¿Cuánto toma llegar a ○○?" },
      { jp:"ICカードは使えますか。", yomi:"アイシー カード は つかえます か。", es:"¿Puedo usar tarjeta IC?" },
      { jp:"切符の買い方を教えてください。", yomi:"きっぷ の かいかた を おしえて ください。", es:"¿Me indica cómo comprar el ticket?" },
      { jp:"この列は○○方面ですか。", yomi:"この れつ は まるまる ほうめん です か。", es:"¿Esta fila es hacia ○○?" },
      { jp:"終電は何時ですか。", yomi:"しゅうでん は なんじ です か。", es:"¿A qué hora es el último tren?" },
      { jp:"遅延していますか。", yomi:"ちえん して います か。", es:"¿Está retrasado?" },
      { jp:"優先席に座ってもいいですか。", yomi:"ゆうせんせき に すわっても いい です か。", es:"¿Puedo sentarme en el asiento prioritario?" },
      { jp:"ベビーカーはどこに置けばいいですか。", yomi:"ベビーカー は どこ に おけば いい です か。", es:"¿Dónde coloco la carriola?" },
      { jp:"エレベーターはありますか。", yomi:"エレベーター は あります か。", es:"¿Hay elevador?" },
      { jp:"忘れ物をしてしまいました。", yomi:"わすれもの を して しまいました。", es:"He olvidado algo." },
      { jp:"落とし物はどこに問い合わせればいいですか。", yomi:"おとしもの は どこ に といあわせれば いい です か。", es:"¿Dónde pregunto por objetos perdidos?" },
      { jp:"車内アナウンスが聞き取りにくいです。", yomi:"しゃない アナウンス が ききとり にくい です。", es:"No escucho bien los anuncios." },
      { jp:"この電車は快速ですか、各駅ですか。", yomi:"この でんしゃ は かいそく です か、かくえき です か。", es:"¿Este tren es rápido o local?" },
      { jp:"次はどの駅ですか。", yomi:"つぎ は どの えき です か。", es:"¿Cuál es la próxima estación?" },
    ]
  },
  /* --- KONBINI / PAGOS (20) --- */
  {
    tag:"Konbini / pagos",
    descES:"Bolsas, calentar, pagar con tarjeta/efectivo, recargas y tickets.",
    ejemplos:[
      { jp:"袋は要りません。", yomi:"ふくろ は いりません。", es:"No necesito bolsa." },
      { jp:"袋をお願いします。", yomi:"ふくろ を おねがいします。", es:"Una bolsa, por favor." },
      { jp:"温めてもらえますか。", yomi:"あたためて もらえます か。", es:"¿Podría calentarlo?" },
      { jp:"箸をつけてもらえますか。", yomi:"はし を つけて もらえます か。", es:"¿Me añade palillos?" },
      { jp:"スプーンは要ります。", yomi:"スプーン は いります。", es:"Necesito cuchara." },
      { jp:"カードで支払えますか。", yomi:"カード で しはらえます か。", es:"¿Puedo pagar con tarjeta?" },
      { jp:"現金で払います。", yomi:"げんきん で はらいます。", es:"Pago en efectivo." },
      { jp:"レシートをください。", yomi:"レシート を ください。", es:"El recibo, por favor." },
      { jp:"領収書をお願いします。", yomi:"りょうしゅうしょ を おねがいします。", es:"Una factura, por favor." },
      { jp:"ICカードをチャージできますか。", yomi:"アイシー カード を チャージ できます か。", es:"¿Puedo recargar mi IC?" },
      { jp:"公共料金の支払いをしたいです。", yomi:"こうきょう りょうきん の しはらい を したい です。", es:"Quiero pagar servicios." },
      { jp:"コピー機の使い方を教えてください。", yomi:"コピーき の つかいかた を おしえて ください。", es:"¿Cómo uso la copiadora?" },
      { jp:"宅配便を送りたいです。", yomi:"たくはいびん を おくりたい です。", es:"Quiero enviar paquetería." },
      { jp:"冷たいままで大丈夫です。", yomi:"つめたい まま で だいじょうぶ です。", es:"Está bien frío, no caliente." },
      { jp:"温めなくて大丈夫です。", yomi:"あたためなくて だいじょうぶ です。", es:"No es necesario calentar." },
      { jp:"ポイントは付きますか。", yomi:"ポイント は つきます か。", es:"¿Acumula puntos?" },
      { jp:"棚の在庫はありますか。", yomi:"たな の ざいこ は あります か。", es:"¿Hay stock en almacén?" },
      { jp:"年齢確認が必要ですか。", yomi:"ねんれい かくにん が ひつよう です か。", es:"¿Necesitan verificar la edad?" },
      { jp:"クレジットのサインはどこですか。", yomi:"クレジット の サイン は どこ です か。", es:"¿Dónde firmo?" },
      { jp:"こちらでいいですか。", yomi:"こちら で いい です か。", es:"¿Está bien así?" },
    ]
  },
  /* --- CITA MÉDICA / HOSPITAL (20) --- */
  {
    tag:"Cita médica / hospital",
    descES:"Síntomas, seguro, receta, dolor y duración. Mantén cortesía y exactitud.",
    ejemplos:[
      { jp:"予約を取りたいです。", yomi:"よやく を とりたい です。", es:"Quiero agendar una cita." },
      { jp:"本日、空きはありますか。", yomi:"ほんじつ、あき は あります か。", es:"¿Hay espacios hoy?" },
      { jp:"初診です。", yomi:"しょしん です。", es:"Es mi primera consulta." },
      { jp:"再診です。", yomi:"さいしん です。", es:"Es seguimiento." },
      { jp:"頭が痛いです。", yomi:"あたま が いたい です。", es:"Me duele la cabeza." },
      { jp:"のどが痛いです。", yomi:"のど が いたい です。", es:"Me duele la garganta." },
      { jp:"熱があります。", yomi:"ねつ が あります。", es:"Tengo fiebre." },
      { jp:"昨日から咳が出ます。", yomi:"きのう から せき が でます。", es:"Desde ayer tengo tos." },
      { jp:"吐き気があります。", yomi:"はきけ が あります。", es:"Tengo náuseas." },
      { jp:"めまいがします。", yomi:"めまい が します。", es:"Me siento mareado." },
      { jp:"保険証を忘れました。", yomi:"ほけんしょう を わすれました。", es:"Olvidé mi seguro." },
      { jp:"どうすればいいですか。", yomi:"どう すれば いい です か。", es:"¿Qué debo hacer?" },
      { jp:"薬のアレルギーがあります。", yomi:"くすり の アレルギー が あります。", es:"Soy alérgico a medicamentos." },
      { jp:"処方箋をお願いします。", yomi:"しょほうせん を おねがいします。", es:"La receta, por favor." },
      { jp:"検査結果はいつ分かりますか。", yomi:"けんさ けっか は いつ わかります か。", es:"¿Cuándo sabré los resultados?" },
      { jp:"食後に飲めばいいですか。", yomi:"しょくご に のめば いい です か。", es:"¿Tomarlo después de comer?" },
      { jp:"副作用はありますか。", yomi:"ふくさよう は あります か。", es:"¿Hay efectos secundarios?" },
      { jp:"会計はどこですか。", yomi:"かいけい は どこ です か。", es:"¿Dónde pago?" },
      { jp:"領収書をください。", yomi:"りょうしゅうしょ を ください。", es:"Deme una factura, por favor." },
      { jp:"次回の予約をお願いします。", yomi:"じかい の よやく を おねがいします。", es:"Quiero la próxima cita." },
    ]
  },
  /* --- RESTAURANTE / OFICINA (20) --- */
  {
    tag:"Restaurante / oficina",
    descES:"Pedidos con restricciones, cuenta, y fórmulas de recepción/oficina con humildad.",
    ejemplos:[
      { jp:"アレルギーがあります。小麦を避けたいのですが。", yomi:"アレルギー が あります。こむぎ を さけたい の ですが。", es:"Tengo alergia; deseo evitar trigo." },
      { jp:"小麦抜きでお願いします。", yomi:"こむぎ ぬき で おねがいします。", es:"Sin trigo, por favor." },
      { jp:"辛さは控えめにしてください。", yomi:"からさ は ひかえめ に して ください。", es:"Por favor, poco picante." },
      { jp:"ベジタリアン用はありますか。", yomi:"ベジタリアン よう は あります か。", es:"¿Tienen opción vegetariana?" },
      { jp:"水をもう一杯お願いします。", yomi:"みず を もう いっぱ い おねがいします。", es:"Otra agua, por favor." },
      { jp:"お会計をお願いします。", yomi:"おかいけい を おねがいします。", es:"La cuenta, por favor." },
      { jp:"別々に払えますか。", yomi:"べつべつ に はらえます か。", es:"¿Podemos pagar por separado?" },
      { jp:"予約の名前は〜です。", yomi:"よやく の なまえ は 〜 です。", es:"La reserva está a nombre de ~." },
      { jp:"受付で面会の予約をしております。", yomi:"うけつけ で めんかい の よやく を して おります。", es:"Tengo cita de visita en recepción." },
      { jp:"担当の方はいらっしゃいますか。", yomi:"たんとう の かた は いらっしゃいます か。", es:"¿Está la persona encargada?" },
      { jp:"書類をお持ちしました。", yomi:"しょるい を おもち しました。", es:"He traído los documentos." },
      { jp:"名刺を交換してもよろしいですか。", yomi:"めいし を こうかん しても よろしい です か。", es:"¿Intercambiamos tarjetas?" },
      { jp:"少々お待ちください。", yomi:"しょうしょう おまち ください。", es:"Espere un momento, por favor." },
      { jp:"上司に確認して、後ほどご連絡いたします。", yomi:"じょうし に かくにん して、のちほど ごれんらく いたします。", es:"Confirmo con mi superior y le contacto." },
      { jp:"恐れ入りますが、こちらにご記入ください。", yomi:"おそれいります が、こちら に ごきにゅう ください。", es:"Disculpe, rellene aquí." },
      { jp:"エレベーターで5階へお上がりください。", yomi:"エレベーター で ごかい へ おあがり ください。", es:"Suba al piso 5 en elevador." },
      { jp:"会議室は右手にございます。", yomi:"かいぎしつ は みぎて に ございます。", es:"La sala de juntas está a la derecha." },
      { jp:"本日はよろしくお願いいたします。", yomi:"ほんじつ は よろしく おねがい いたします。", es:"Quedo a sus órdenes hoy." },
      { jp:"ご来訪ありがとうございます。", yomi:"ごらいほう ありがとう ございます。", es:"Gracias por su visita." },
      { jp:"失礼いたします。", yomi:"しつれい いたします。", es:"Con permiso (muy cortés)." },
    ]
  },
];

/* ====================== ACTIVIDAD 1: ESCENARIOS (se mantiene) ====================== */
type Choice = { jp:string; yomi:string; es:string; why:string; polite:number; correct:boolean };
type Scene = { id:string; area:string; promptJP:string; yomi:string; choices:Choice[] };

const ESCENARIOS: Scene[] = [
  {
    id:"e1",
    area:"Apartamento",
    promptJP:"大家さんに騒音の相談。どう切り出す？",
    yomi:"おおやさん に そうおん の そうだん。どう きりだす？",
    choices:[
      { jp:"うるさい！どうにかして！", yomi:"うるさい！どうにかして！", es:"¡Está ruidoso! ¡Hagan algo!", why:"Agresivo.", polite:0, correct:false },
      { jp:"恐れ入りますが、夜間の騒音についてご相談させていただけますか。", yomi:"おそれいります が、やかん の そうおん について ごそうだん させて いただけます か。", es:"Disculpe, ¿podría hablar del ruido nocturno?", why:"Cortés + tema claro.", polite:3, correct:true },
      { jp:"騒音です。よろしく。", yomi:"そうおん です。よろしく。", es:"Hay ruido, gracias.", why:"Vago/corto.", polite:1, correct:false },
    ]
  },
  {
    id:"e2",
    area:"Hospital",
    promptJP:"受付で、予約時間に少し遅れそう。どう言う？",
    yomi:"うけつけ で、よやく じかん に すこし おくれそう。どう いう？",
    choices:[
      { jp:"ちょっと遅れます。", yomi:"ちょっと おくれます。", es:"Llegaré tantito tarde.", why:"Casual.", polite:1, correct:false },
      { jp:"申し訳ありません。10分ほど遅れて到着いたします。", yomi:"もうしわけ ありません。じゅっぷん ほど おくれて とうちゃく いたします。", es:"Una disculpa; llegaré ~10 minutos tarde.", why:"Disculpa + tiempo concreto.", polite:3, correct:true },
      { jp:"遅刻。よろしく。", yomi:"ちこく。よろしく。", es:"Tarde. Gracias.", why:"Inadecuado.", polite:0, correct:false },
    ]
  },
  {
    id:"e3",
    area:"Restaurante",
    promptJP:"注文前にアレルギーを伝える。自然なのは？",
    yomi:"ちゅうもん まえ に アレルギー を つたえる。しぜん なの は？",
    choices:[
      { jp:"小麦がだめです。", yomi:"こむぎ が だめ です。", es:"No puedo comer trigo.", why:"Correcto pero neutro.", polite:2, correct:false },
      { jp:"アレルギーがあります。小麦を避けたいのですが。", yomi:"アレルギー が あります。こむぎ を さけたい の ですが。", es:"Tengo alergia; quisiera evitar trigo.", why:"Claro + cortesía.", polite:3, correct:true },
      { jp:"小麦抜きで。", yomi:"こむぎ ぬき で。", es:"Sin trigo.", why:"Telegráfico.", polite:1, correct:false },
    ]
  },
];

/* ====================== ACTIVIDAD 2: QUIZ (12) ====================== */
type Q = { id:string; stem:string; options:string[]; answer:number; explain:string };
const QUIZ: Q[] = [
  { id:"q1", stem:"“¿Podría recargar esta tarjeta, por favor?”", options:["このカードをチャージできますか。","カード、お願い。","チャージして"], answer:0, explain:"丁寧形 + できますか。" },
  { id:"q2", stem:"“¿Dónde está la línea ○○?” (trenes)", options:["○○線はどこですか。","○○線どこ？","○○線？"], answer:0, explain:"Forma completa y clara." },
  { id:"q3", stem:"“Quiero pedir una cita (médica)”", options:["予約が欲しい","予約を取りたいです","予約ください"], answer:1, explain:"〜たいです cortés." },
  { id:"q4", stem:"“¿Puede calentar esto?”", options:["温めてくれる？","温めてください","温めてもらえますか"], answer:2, explain:"もらえますか → más cortés." },
  { id:"q5", stem:"“Olvidé mi seguro”", options:["保険証ない","保険証を忘れました","保険証忘れた"], answer:1, explain:"Pasado educado." },
  { id:"q6", stem:"“¿Se detiene en ○○?”", options:["○○止まる？","○○に止まりますか","○○で止まる"], answer:1, explain:"〜ますか forma pregunta cortés." },
  { id:"q7", stem:"“No necesito bolsa” (konbini)", options:["袋いらない","袋は要りません","袋いい"], answer:1, explain:"要りません = formal neutro." },
  { id:"q8", stem:"“¿Tiene menú sin gluten?”", options:["グルテンないメニュー？","グルテンフリーのメニューはありますか。","メニューある？"], answer:1, explain:"ありますか + sust." },
  { id:"q9", stem:"“Me siento mareado” (hospital)", options:["気持ち悪いです","やばい","吐きそう"], answer:0, explain:"Cortés neutro claro." },
  { id:"q10", stem:"“¿Puedo pagar con tarjeta?”", options:["カードOK？","カードで支払えますか。","カードいい？"], answer:1, explain:"〜えますか forma posible cortés." },
  { id:"q11", stem:"“Perdí mi transferencia”", options:["乗換え失敗した","乗り換えを間違えました","乗換え無理"], answer:1, explain:"間違えました = claro y educado." },
  { id:"q12", stem:"“Tengo una reserva de visita en recepción.”", options:["受付で面会予約です","受付で面会の予約をしております","受付面会よろしく"], answer:1, explain:"おる（謙譲語） + しております." },
];

/* ====================== KANJI PRO (tarjetas) — 20 kanji × 4 palabras ====================== */
type KV = { w: string; yomi: string; es: string };
type KCard = { kanji: string; on?: string; kun?: string; es: string; palabras: KV[] };
const KANJI: KCard[] = [
  { kanji:"駅", on:"エキ", es:"estación", palabras:[
    { w:"駅員", yomi:"えきいん", es:"empleado de estación" },
    { w:"駅前", yomi:"えきまえ", es:"frente a la estación" },
    { w:"駅名", yomi:"えきめい", es:"nombre de estación" },
    { w:"駅弁", yomi:"えきべん", es:"bento de estación" },
  ]},
  { kanji:"線", on:"セン", es:"línea", palabras:[
    { w:"路線", yomi:"ろせん", es:"ruta/línea" },
    { w:"内線", yomi:"ないせん", es:"extensión (tel.)" },
    { w:"外線", yomi:"がいせん", es:"línea externa" },
    { w:"直線", yomi:"ちょくせん", es:"línea recta" },
  ]},
  { kanji:"券", on:"ケン", es:"boleto", palabras:[
    { w:"乗車券", yomi:"じょうしゃけん", es:"boleto de tren" },
    { w:"定期券", yomi:"ていきけん", es:"abono mensual" },
    { w:"入場券", yomi:"にゅうじょうけん", es:"boleto de entrada" },
    { w:"回数券", yomi:"かいすうけん", es:"boleto múltiple" },
  ]},
  { kanji:"換", on:"カン", kun:"か(える)", es:"cambiar", palabras:[
    { w:"乗り換え", yomi:"のりかえ", es:"transferencia" },
    { w:"交換", yomi:"こうかん", es:"intercambio" },
    { w:"換気", yomi:"かんき", es:"ventilación" },
    { w:"変換", yomi:"へんかん", es:"conversión" },
  ]},
  { kanji:"払", on:"フツ", kun:"はら(う)", es:"pagar", palabras:[
    { w:"支払い", yomi:"しはらい", es:"pago" },
    { w:"払戻し", yomi:"はらいもどし", es:"reembolso" },
    { w:"分割払い", yomi:"ぶんかつばらい", es:"pago a plazos" },
    { w:"前払い", yomi:"まえばらい", es:"prepago" },
  ]},
  { kanji:"袋", on:"タイ", kun:"ふくろ", es:"bolsa", palabras:[
    { w:"手袋", yomi:"てぶくろ", es:"guantes" },
    { w:"紙袋", yomi:"かみぶくろ", es:"bolsa de papel" },
    { w:"レジ袋", yomi:"レジぶくろ", es:"bolsa de caja" },
    { w:"袋入り", yomi:"ふくろいり", es:"embolsado" },
  ]},
  { kanji:"温", on:"オン", kun:"あたた(かい)", es:"cálido", palabras:[
    { w:"温度", yomi:"おんど", es:"temperatura" },
    { w:"温める", yomi:"あたためる", es:"calentar" },
    { w:"温情", yomi:"おんじょう", es:"benevolencia" },
    { w:"体温", yomi:"たいおん", es:"temperatura corporal" },
  ]},
  { kanji:"症", on:"ショウ", es:"síntoma", palabras:[
    { w:"症状", yomi:"しょうじょう", es:"síntomas" },
    { w:"花粉症", yomi:"かふんしょう", es:"alergia al polen" },
    { w:"不眠症", yomi:"ふみんしょう", es:"insomnio" },
    { w:"熱症", yomi:"ねっしょう", es:"fiebre (sintom.)" },
  ]},
  { kanji:"薬", on:"ヤク", kun:"くすり", es:"medicina", palabras:[
    { w:"薬局", yomi:"やっきょく", es:"farmacia" },
    { w:"薬代", yomi:"くすりだい", es:"costo de medicinas" },
    { w:"目薬", yomi:"めぐすり", es:"gotas para ojos" },
    { w:"薬指", yomi:"くすりゆび", es:"anular (dedo)" },
  ]},
  { kanji:"診", on:"シン", kun:"み(る)", es:"examinar (médico)", palabras:[
    { w:"診察", yomi:"しんさつ", es:"consulta" },
    { w:"診断", yomi:"しんだん", es:"diagnóstico" },
    { w:"初診", yomi:"しょしん", es:"primera consulta" },
    { w:"再診", yomi:"さいしん", es:"revisión" },
  ]},
  { kanji:"会", on:"カイ", kun:"あ(う)", es:"reunión/encontrar", palabras:[
    { w:"会計", yomi:"かいけい", es:"caja/pago" },
    { w:"面会", yomi:"めんかい", es:"visita" },
    { w:"社会", yomi:"しゃかい", es:"sociedad" },
    { w:"会議", yomi:"かいぎ", es:"reunión" },
  ]},
  { kanji:"受", on:"ジュ", kun:"う(ける)", es:"recibir", palabras:[
    { w:"受付", yomi:"うけつけ", es:"recepción" },
    { w:"受信", yomi:"じゅしん", es:"recepción (señal)" },
    { w:"受験", yomi:"じゅけん", es:"presentar examen" },
    { w:"受取", yomi:"うけとり", es:"recibo" },
  ]},
  { kanji:"別", on:"ベツ", kun:"わか(れる)", es:"separar/distinto", palabras:[
    { w:"別々", yomi:"べつべつ", es:"por separado" },
    { w:"特別", yomi:"とくべつ", es:"especial" },
    { w:"区別", yomi:"くべつ", es:"distinción" },
    { w:"別件", yomi:"べっけん", es:"otro asunto" },
  ]},
  { kanji:"記", on:"キ", kun:"しる(す)", es:"anotar/registro", palabras:[
    { w:"記入", yomi:"きにゅう", es:"llenado (form.)" },
    { w:"記事", yomi:"きじ", es:"artículo (nota)" },
    { w:"日記", yomi:"にっき", es:"diario" },
    { w:"記号", yomi:"きごう", es:"símbolo" },
  ]},
  { kanji:"室", on:"シツ", es:"cuarto/sala", palabras:[
    { w:"会議室", yomi:"かいぎしつ", es:"sala de juntas" },
    { w:"教室", yomi:"きょうしつ", es:"aula" },
    { w:"病室", yomi:"びょうしつ", es:"cuarto de hospital" },
    { w:"応接室", yomi:"おうせつしつ", es:"sala de visitas" },
  ]},
  { kanji:"階", on:"カイ", es:"piso (nivel)", palabras:[
    { w:"一階", yomi:"いっかい", es:"primer piso" },
    { w:"地階", yomi:"ちかい", es:"sótano" },
    { w:"階段", yomi:"かいだん", es:"escaleras" },
    { w:"高階", yomi:"こうかい", es:"pisos altos" },
  ]},
  { kanji:"係", on:"ケイ", kun:"かかり", es:"encargado", palabras:[
    { w:"係員", yomi:"かかりいん", es:"personal encargado" },
    { w:"関係", yomi:"かんけい", es:"relación" },
    { w:"係長", yomi:"かかりちょう", es:"jefe de sección" },
    { w:"無関係", yomi:"むかんけい", es:"sin relación" },
  ]},
  { kanji:"書", on:"ショ", kun:"か(く)", es:"escribir/documento", palabras:[
    { w:"書類", yomi:"しょるい", es:"documentos" },
    { w:"申込書", yomi:"もうしこみしょ", es:"solicitud" },
    { w:"領収書", yomi:"りょうしゅうしょ", es:"recibo/factura" },
    { w:"案内書", yomi:"あんないしょ", es:"folleto/guía" },
  ]},
  { kanji:"対", on:"タイ", kun:"たい(する)", es:"enfrentar/tratar", palabras:[
    { w:"対応", yomi:"たいおう", es:"atención/gestión" },
    { w:"対面", yomi:"たいめん", es:"cara a cara" },
    { w:"反対", yomi:"はんたい", es:"oposición" },
    { w:"対策", yomi:"たいさく", es:"medidas" },
  ]},
  { kanji:"課", on:"カ", es:"sección/lección", palabras:[
    { w:"課長", yomi:"かちょう", es:"jefe de sección" },
    { w:"課題", yomi:"かだい", es:"tarea/desafío" },
    { w:"担当課", yomi:"たんとうか", es:"departamento encargado" },
    { w:"総務課", yomi:"そうむか", es:"depto. administración" },
  ]},
];

/* ====== Lógica de puntos/medalla ====== */
function medalFor(score:number){
  if (score>=15) return { label:"Medalla de Oro — Maestría urbana", color:"#fbbf24" };
  if (score>=10) return { label:"Medalla de Plata — Cortesía sólida", color:"#93c5fd" };
  if (score>=6)  return { label:"Medalla de Bronce — En marcha", color:"#f59e0b" };
  return { label:"Practicante — Sigue puliendo", color:"#9ca3af" };
}

export default function N2_B5_U3(){
  const [progress, setProgress] = useState(0);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const mark = ()=>setProgress(p=>Math.min(1,p+0.2));

  // A1
  const [ans1, setAns1] = useState<Record<string, number|null>>(Object.fromEntries(ESCENARIOS.map(s=>[s.id,null])));
  const [done1, setDone1] = useState(false);
  const scoreCourtesy = useMemo(()=>ESCENARIOS.reduce((sum,s)=>{
    const idx=ans1[s.id]; if (idx==null) return sum;
    const ch=s.choices[idx]; return sum + (ch.polite || 0);
  },0),[ans1]);

  // A2
  const [ans2, setAns2] = useState<Record<string, number|null>>(Object.fromEntries(QUIZ.map(q=>[q.id,null])));
  const scoreQuiz = useMemo(()=>QUIZ.reduce((s,q)=>s+((ans2[q.id]===q.answer)?1:0),0),[ans2]);

  const total = scoreQuiz + Math.min(scoreCourtesy,9); // cap cortesía
  const medal = medalFor(total);

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b5_u3.webp")}
      accent={accent}
      breadcrumb="B5 · U3"
      title="Vida urbana: apartamento, hospital, restaurante, oficina"
      subtitle="Frases de supervivencia + decisiones reales con evaluación por cortesía."
      ctas={[
        { label:"Tip urbano", onPress:()=>speakES("En Japón, suaviza peticiones y da contexto breve. Confirmar y agradecer abre puertas.") },
        { label:"Marcar avance", onPress:mark },
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Terminar"
    >
      {/* Guía ampliada */}
      <View style={[styles.card,{borderColor:accent}]}>
        <Text style={styles.h2}>Cómo usar estas expresiones (guía breve)</Text>
        {GUIA_URBANA.map((g,i)=>(
          <View key={i} style={{marginTop:8}}>
            <View style={styles.tagRow}><Text style={styles.badge}>{g.tag}</Text></View>
            <Text style={styles.p}>{g.descES}</Text>
            {g.bullets.map((b,k)=>(<Text key={k} style={styles.li}>• {b}</Text>))}
          </View>
        ))}
      </View>

      {/* Supervivencia: 20 ejemplos × 4 secciones */}
      <View style={[styles.card,{borderColor:accent}]}>
        <Text style={styles.h2}>Frases de supervivencia urbana</Text>
        {SUPERVIVENCIA.map((g,i)=>(
          <View key={i} style={{marginTop:10}}>
            <View style={styles.tagRow}><Text style={styles.badge}>{g.tag}</Text></View>
            <Text style={styles.p}>{g.descES}</Text>
            {g.ejemplos.map((ex,k)=>(
              <View key={k} style={styles.inner}>
                <View style={styles.rowBetween}>
                  <Text style={styles.jp}>{ex.jp}</Text>
                  <Pressable onPress={()=>speakJP(ex.jp)}>
                    <MCI name="volume-high" size={18} color="#fff"/>
                  </Pressable>
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
        <Text style={styles.h2}>Actividad 1 · Escenarios con decisiones</Text>
        {ESCENARIOS.map(s=>{
          const chosen=ans1[s.id];
          const show=done1 && chosen!==null;
          return (
            <View key={s.id} style={{marginTop:10}}>
              <Text style={styles.badgeMini}>{s.area}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{s.promptJP}</Text>
                <Pressable onPress={()=>speakJP(s.promptJP)}>
                  <MCI name="volume-high" size={18} color="#fff"/>
                </Pressable>
              </View>
              <Text style={styles.yomi}>{s.yomi}</Text>
              {s.choices.map((c,idx)=>{
                const isChosen=chosen===idx;
                const ok=show && isChosen && c.correct;
                const ko=show && isChosen && !c.correct;
                return (
                  <Pressable
                    key={idx}
                    onPress={()=>{
                      setAns1(prev=>({...prev,[s.id]:idx}));
                      if (done1) (c.correct?playCorrect():playWrong());
                    }}
                    style={[styles.choice, isChosen && { backgroundColor:"rgba(14,165,233,0.18)", borderColor:accent }, ok && {borderColor:"#16a34a"}, ko && {borderColor:"#ef4444"} ]}
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
              const item=ESCENARIOS.find(x=>x.id===id);
              if(!item||idx==null) return;
              item.choices[idx].correct?playCorrect():playWrong();
            });
          }}/>
          <Btn label="Reiniciar" variant="ghost" onPress={()=>{
            setDone1(false);
            setAns1(Object.fromEntries(ESCENARIOS.map(s=>[s.id,null])));
          }}/>
        </View>
        <Text style={[styles.es,{marginTop:8}]}>Puntos de cortesía (escenarios): <Text style={{color:"#86efac",fontWeight:"900"}}>{scoreCourtesy}</Text></Text>
      </View>

      {/* A2 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 2 · Frases de supervivencia (12)</Text>
        {QUIZ.map(q=>{
          const chosen=ans2[q.id];
          const show=chosen!==null && chosen!==undefined;
          return (
            <View key={q.id} style={{marginTop:10}}>
              <Text style={styles.jp}>{q.stem}</Text>
              {q.options.map((opt,idx)=>{
                const isChosen=chosen===idx;
                const isCorrect=idx===q.answer;
                const border=show&&isChosen?(isCorrect?{borderColor:"#16a34a"}:{borderColor:"#ef4444"}):{};
                return (
                  <Pressable
                    key={idx}
                    onPress={()=>{
                      setAns2(prev=>({...prev,[q.id]:idx}));
                      (idx===q.answer)?playCorrect():playWrong();
                    }}
                    style={[styles.choice, isChosen && { backgroundColor:"rgba(14,165,233,0.18)", borderColor:accent }, border ]}
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
          <Btn label={`Ver puntuación: ${scoreQuiz}/12`} onPress={()=>Alert.alert("Resultado",`Tu puntuación: ${scoreQuiz}/12`)}/>
          <Btn label="Reiniciar" variant="ghost" onPress={()=>setAns2(Object.fromEntries(QUIZ.map(q=>[q.id,null])))}/>
        </View>
      </View>

      {/* Kanji Pro (tarjetas) */}
      <View style={styles.card}>
        <Text style={styles.h2}>Kanji Pro — 20 kanji clave (con vocabulario y audio)</Text>
        <Text style={styles.p}>Toca el altavoz para escuchar. Practica diciendo cada palabra en voz alta.</Text>
        <View style={styles.kanjiGrid}>
          {KANJI.map((k, idx)=>(
            <View key={idx} style={styles.kanjiCard}>
              <View style={styles.kanjiHeader}>
                <Text style={styles.kanjiChar}>{k.kanji}</Text>
                <View style={{flex:1}}>
                  {!!k.on && <Text style={styles.kanjiMeta}>オン: {k.on}</Text>}
                  {!!k.kun && <Text style={styles.kanjiMeta}>くん: {k.kun}</Text>}
                  <Text style={styles.kanjiMean}>{k.es}</Text>
                </View>
              </View>
              <View style={styles.divider}/>
              {k.palabras.map((v,i)=>(
                <View key={i} style={styles.vocabRow}>
                  <View style={{flex:1}}>
                    <Text style={styles.vocabJP}>{v.w}</Text>
                    <Text style={styles.vocabYomi}>{v.yomi}</Text>
                    <Text style={styles.vocabES}>{v.es}</Text>
                  </View>
                  <Pressable onPress={()=>speakJP(v.w)} style={styles.iconBtn}>
                    <MCI name="volume-high" size={18} color="#fff"/>
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Medalla final */}
      <View style={[styles.card,{alignItems:"center"}]}>
        <Text style={styles.h2}>Tu evaluación por logros</Text>
        <Text style={[styles.badge, { backgroundColor: "transparent", borderWidth:1, borderColor:"rgba(255,255,255,0.14)", color: medal.color }]}>
          {medal.label}
        </Text>
        <Text style={styles.es}>Total (quiz + cortesía cap): <Text style={{color:"#86efac",fontWeight:"900"}}>{total}</Text> / 21</Text>
      </View>
    </UnitTemplate>
  );
}

/* ====================== UI helpers ====================== */
function Btn({label,onPress,variant="primary"}:{label:string;onPress?:()=>void;variant?:"primary"|"ghost"|"alt"}) {
  return (
    <Pressable onPress={onPress} style={[
      styles.btn, variant==="primary"?styles.btnPrimary:variant==="ghost"?styles.btnGhost:styles.btnAlt
    ]}><Text style={[styles.btnText, variant==="alt" && {color:"#0B0F19"}]}>{label}</Text></Pressable>
  );
}

const R=14;
const CARD_W = (width - 16*2 - 12) / 2; // 2 columnas, márgenes agradables

const styles=StyleSheet.create({
  card:{ backgroundColor:BG, borderRadius:R, padding:14, borderWidth:1, borderColor:BORDER, marginHorizontal:16, marginBottom:12 },
  tagRow:{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:4 },
  badge:{ color:"#fff", backgroundColor:"rgba(14,165,233,0.95)", paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:"800" },
  badgeMini:{ color:"#0EA5E9", backgroundColor:"rgba(14,165,233,0.12)", paddingHorizontal:8, paddingVertical:2, borderRadius:999, fontWeight:"800", alignSelf:"flex-start", marginBottom:6 },
  h2:{ color:"#fff", fontWeight:"900", fontSize:16, marginBottom:6 },
  p:{ color:"rgba(255,255,255,0.9)", lineHeight:20 },
  li:{ color:"rgba(255,255,255,0.85)", marginTop:2 },
  inner:{ backgroundColor:"#0F1423", borderRadius:12, borderWidth:1, borderColor:"rgba(255,255,255,0.06)", padding:12, marginTop:8 },

  rowBetween:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  jp:{ color:"#fff", fontSize:16, fontWeight:"800" },
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

  /* Kanji cards */
  kanjiGrid:{ flexDirection:"row", flexWrap:"wrap", gap:12 },
  kanjiCard:{ width:CARD_W, backgroundColor:"#0F1423", borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", padding:12 },
  kanjiHeader:{ flexDirection:"row", alignItems:"center", gap:10 },
  kanjiChar:{ color:"#fff", fontSize:28, fontWeight:"900", width:38, textAlign:"center" },
  kanjiMeta:{ color:"#9CA3AF", fontSize:12 },
  kanjiMean:{ color:"#93C5FD", fontSize:13, fontWeight:"800" },
  divider:{ height:1, backgroundColor:"rgba(255,255,255,0.08)", marginVertical:8 },
  vocabRow:{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 },
  vocabJP:{ color:"#fff", fontSize:15, fontWeight:"800" },
  vocabYomi:{ color:"#D1D5DB", fontSize:12 },
  vocabES:{ color:"#93C5FD", fontSize:13 },
  iconBtn:{ backgroundColor:"rgba(255,255,255,0.12)", borderRadius:999, padding:8 },
});
