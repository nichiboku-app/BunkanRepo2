// src/screens/N2/N2_B4_U3.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import UnitTemplate from "./UnitTemplate";

const { width } = Dimensions.get("window");
const accent = "#9333EA"; // 💜 B4 morado (coherencia con U2)
const BG_CARD = "#0B0F19";
const BORDER = "rgba(255,255,255,0.08)";

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* --------------------- Guía gramatical (ES + yomi) --------------------- */
type Ex = { jp: string; yomi: string; es: string };

const GUIA = [
  {
    tag: "〜そうだ（伝聞）",
    descES:
      "“dicen que / según se informa que …”. **Transmisión de información** oída de terceros/medios. (≠ 〜そうだ de apariencia).",
    ambitosES: [
      "Ámbitos: noticias, reportes oficiales, rumores verificados por prensa.",
      "Estructuras: 「〜によると／によれば、〜そうだ」, 「関係者によると〜そうだ」",
      "Marca distancia del hablante con el contenido (no es opinión personal).",
    ],
    ejemplos: [
      { jp: "当局によると、被害は拡大しているそうだ。", yomi: "とうきょく に よると、ひがい は かくだい して いる そうだ。", es: "Según las autoridades, los daños se están expandiendo, dicen." },
      { jp: "気象庁の発表では、明日は大雨になるそうだ。", yomi: "きしょうちょう の はっぴょう では、あした は おおあめ に なる そうだ。", es: "Según el servicio meteorológico, mañana habrá lluvias fuertes." },
      { jp: "専門家によれば、需要は今後も増えるそうだ。", yomi: "せんもんか に よれば、じゅよう は こんご も ふえる そうだ。", es: "De acuerdo con especialistas, la demanda seguirá aumentando." },
      { jp: "政府関係者の話では、法案は可決されるそうだ。", yomi: "せいふ かんけいしゃ の はなし では、ほうあん は かけつ される そうだ。", es: "Según fuentes del gobierno, el proyecto de ley se aprobará." },
      { jp: "警察によると、容疑者は逮捕されたそうだ。", yomi: "けいさつ に よると、ようぎしゃ は たいほ された そうだ。", es: "Según la policía, el sospechoso fue arrestado." },
    ] as Ex[],
  },
  {
    tag: "〜らしい",
    descES:
      "“al parecer / por lo visto”. Inferencia basada en **indicios/rumores/impresiones**; algo se **percibe** como cierto (no cita directa).",
    ambitosES: [
      "Ámbitos: crónica, color de la información, tono de ‘se dice que / parece que’.",
      "Se une a forma simple/verbo/adj/sust.; adnominal: 〜らしい + 名詞.",
      "Más subjetivo que 〜そうだ(伝聞) y menos comprometido que 〜と思われる。",
    ],
    ejemplos: [
      { jp: "景気は回復しつつあるらしい。", yomi: "けいき は かいふく しつつ ある らしい。", es: "Al parecer, la economía se está recuperando." },
      { jp: "あの会社は海外進出を加速するらしい。", yomi: "あの かいしゃ は かいがい しんしゅつ を かそく する らしい。", es: "Parece que esa empresa acelerará su expansión al extranjero." },
      { jp: "新駅は来月オープンらしい。", yomi: "しんえき は らいげつ オープン らしい。", es: "Parece que la nueva estación abre el mes que viene." },
      { jp: "彼は昇進が決まったらしい。", yomi: "かれ は しょうしん が きまった らしい。", es: "Dicen que lo ascendieron / Al parecer, fue ascendido." },
      { jp: "インフルが流行しているらしい。", yomi: "インフル が りゅうこう して いる らしい。", es: "Parece que hay brote de influenza." },
    ] as Ex[],
  },
  {
    tag: "〜によると／〜によれば",
    descES:
      "“según … / de acuerdo con …”. **Fuente/cita** (medio, institución, experto). Suele combinar con **〜そうだ / 〜という** para reportar.",
    ambitosES: [
      "Ámbitos: redacción periodística; introduce autoridad (警察、政府、研究、気象庁).",
      "Estructura: **N + によると／によれば、（引用）**",
      "No evalúa veracidad; sólo atribuye la información a la fuente.",
    ],
    ejemplos: [
      { jp: "警察によると、事故の原因は調査中だという。", yomi: "けいさつ に よると、じこ の げんいん は ちょうさちゅう だ と いう。", es: "Según la policía, la causa del accidente está bajo investigación." },
      { jp: "気象庁によれば、午後から雨になるという。", yomi: "きしょうちょう に よれば、ごご から あめ に なる と いう。", es: "De acuerdo con la agencia meteorológica, lloverá por la tarde." },
      { jp: "政府筋によると、来月にも会談が行われるそうだ。", yomi: "せいふすじ に よると、らいげつ にも かいだん が おこなわれる そうだ。", es: "Según fuentes del gobierno, habría reunión el mes próximo." },
      { jp: "主催者によれば、入場者数は過去最多だという。", yomi: "しゅさいしゃ に よれば、にゅうじょうしゃすう は かこ さいた だ と いう。", es: "Según los organizadores, la asistencia fue récord." },
      { jp: "現地メディアによると、被害はさらに拡大している。", yomi: "げんち メディア に よると、ひがい は さらに かくだい して いる。", es: "Según medios locales, los daños siguen aumentando." },
    ] as Ex[],
  },
];

/* ------------- Actividad 1: contenido → titular adecuado ------------- */
type HeadlineItem = {
  id: string;
  contentJP: string;
  yomi?: string;
  choices: { label: string; trans: string; why: string; correct: boolean }[];
};

const MATCH_NEWS: HeadlineItem[] = [
  {
    id: "m1",
    contentJP: "現地メディアは、空港の閉鎖が延長される可能性を報じている。",
    yomi: "げんち メディア は、くうこう の へいさ が えんちょう される かのうせい を ほうじて いる。",
    choices: [
      { label: "当局によると、空港の閉鎖は延長されるそうだ", trans: "Según las autoridades, el cierre del aeropuerto se extendería.", why: "‘según X … そうだ’ encaja con reporte de medios/autoridad.", correct: true },
      { label: "空港の閉鎖は延長するらしい", trans: "Al parecer, se extenderá el cierre del aeropuerto.", why: "‘らしい’ es posible, pero el contenido enfatiza fuente mediática.", correct: false },
      { label: "空港の閉鎖によると延長される", trans: "Según el cierre del aeropuerto, se extenderá (incorrecto).", why: "La fuente debe ser una entidad, no el evento mismo.", correct: false },
      { label: "空港の閉鎖は延長という", trans: "Se dice que el cierre se extenderá (poco natural).", why: "Falta atribución natural de fuente.", correct: false },
    ],
  },
  {
    id: "m2",
    contentJP: "専門家は、物価の上昇は年内も続くとみている。",
    yomi: "せんもんか は、ぶっか の じょうしょう は ねんない も つづく と みて いる。",
    choices: [
      { label: "専門家によれば、物価上昇は年内も続くという", trans: "De acuerdo con expertos, la subida de precios continuará dentro del año.", why: "Fuente + という (reportado) es lo más natural.", correct: true },
      { label: "物価上昇は年内も続くらしい", trans: "Parece que la subida de precios seguirá dentro del año.", why: "Admisible, pero el contenido menciona explícitamente a expertos.", correct: false },
      { label: "専門家は年内も続くそうだ", trans: "Los expertos: ‘continuará’, dicen. (faltan detalles del tema)", correct: false, why: "Falta el tema explícito." },
      { label: "専門家によると、年内は続くのようだ", trans: "Según expertos, parece que continuará (poco natural).", correct: false, why: "‘のようだ’ aquí no encaja en titular." },
    ],
  },
  {
    id: "m3",
    contentJP: "市は新線の開業時期を検討しているが、来春になる可能性が高い。",
    yomi: "し は しんせん の かいぎょう じき を けんとう して いる が、らいしゅん に なる かのうせい が たかい。",
    choices: [
      { label: "市当局によると、新線は来春開業するそうだ", trans: "Según el ayuntamiento, la nueva línea abriría en primavera.", why: "Fuente + そうだ.", correct: true },
      { label: "新線は来春開業らしい", trans: "Parece que la nueva línea abrirá en primavera.", why: "Posible, pero hay decisión oficial en estudio.", correct: false },
      { label: "市は来春開業という", trans: "La ciudad ‘abrirá en primavera’, se dice. (poco natural)", correct: false, why: "Falta construcción de reporte natural." },
      { label: "新線の来春によると開業", trans: "Según ‘primavera’, abrirá (incorrecto).", correct: false, why: "La fuente no puede ser ‘primavera’." },
    ],
  },
  {
    id: "m4",
    contentJP: "大会主催者は、来場者は過去最多になる見込みだと述べた。",
    yomi: "たいかい しゅさいしゃ は、らいじょうしゃ は かこ さいた に なる みこみ だ と のべた。",
    choices: [
      { label: "主催者によれば、来場者は過去最多だという", trans: "Según los organizadores, la asistencia será la más alta de la historia.", why: "Fuente + という.", correct: true },
      { label: "来場者は過去最多らしい", trans: "Parece que la asistencia será récord.", why: "Ya hay fuente oficial; mejor という.", correct: false },
      { label: "主催者によると、来場者は過去最多らしい", trans: "Según organizadores, al parecer será récord.", why: "Introduce duda innecesaria.", correct: false },
      { label: "主催者は過去最多そうだ", trans: "‘Parece récord’ (mal formado).", correct: false, why: "Uso no natural." },
    ],
  },
];

/* ---------------- Actividad 2: JLPT (16 preguntas + feedback) ---------------- */
type Q = { id: string; stem: string; options: string[]; answer: number; explain: string };
const JLPT_QUESTIONS: Q[] = [
  { id: "q1", stem: "当局＿＿被害は拡大している＿＿。", options: ["によると／そうだ", "により／らしい", "によれば／ようだ"], answer: 0, explain: "Fuente + そうだ（伝聞）が自然。" },
  { id: "q2", stem: "来週は寒くなる＿＿。", options: ["によると", "らしい", "そうだ（伝聞）"], answer: 1, explain: "Rumor/indicio general → らしい。" },
  { id: "q3", stem: "専門家＿＿、物価は年内も上昇する＿＿。", options: ["によると／そうだ", "により／らしい", "によれば／らしい"], answer: 0, explain: "Fuente + そうだ（伝聞）。" },
  { id: "q4", stem: "新駅は来月オープン＿＿。", options: ["そうだ（伝聞）", "らしい", "によると"], answer: 1, explain: "‘al parecer’ sin citar fuente → らしい。" },
  { id: "q5", stem: "警察＿＿容疑者は逃走中＿＿。", options: ["によると／らしい", "によれば／そうだ", "により／そうだ"], answer: 1, explain: "Fuente + そうだ（伝聞）。" },
  { id: "q6", stem: "主催者＿＿入場者数は過去最多＿＿。", options: ["によると／だという", "により／らしい", "によれば／ようだ"], answer: 0, explain: "Fuente + 〜という（引用）も自然。" },
  { id: "q7", stem: "その会社は人員を増やす＿＿。", options: ["そうだ（伝聞）", "らしい", "によると"], answer: 1, explain: "Impresión/rumor → らしい。" },
  { id: "q8", stem: "現地報道＿＿、道路は全面通行止め＿＿。", options: ["によると／という", "により／そうだ", "によれば／らしい"], answer: 0, explain: "Fuente + 〜という（引用）。" },
  { id: "q9",  stem: "‘según X’ に最も近いのは？", options: ["〜らしい", "〜によると", "〜そうだ（伝聞）"], answer: 1, explain: "‘según …’: 〜によると／によれば。" },
  { id: "q10", stem: "‘dicen que …’ に最も近いのは？", options: ["〜らしい", "〜そうだ（伝聞）", "〜によると"], answer: 1, explain: "伝聞は 〜そうだ。" },
  { id: "q11", stem: "‘al parecer …’ に最も近いのは？", options: ["〜そうだ（伝聞）", "〜によると", "〜らしい"], answer: 2, explain: "推量・印象：〜らしい。" },
  { id: "q12", stem: "ニュース文体で自然：＿＿、来週にも会談が行われる＿＿。", options: ["専門家らしい／という", "政府によると／そうだ", "政府らしい／そうだ"], answer: 1, explain: "Fuente + そうだ。" },
  { id: "q13", stem: "目撃情報＿＿、容疑者は北へ向かった＿＿。", options: ["によれば／そうだ", "によると／らしい", "により／という"], answer: 0, explain: "Fuente + そうだ。" },
  { id: "q14", stem: "市場は回復傾向＿＿。", options: ["によると", "らしい", "そうだ（伝聞）"], answer: 2, explain: "Titular de reporte: そうだ も自然。" },
  { id: "q15", stem: "来月の打ち上げは延期＿＿。", options: ["らしい", "により", "によると"], answer: 0, explain: "Rumor/impresión → らしい。" },
  { id: "q16", stem: "当局＿＿、避難は完了した＿＿。", options: ["によれば／という", "らしい／そうだ", "によると／らしい"], answer: 0, explain: "Fuente + 〜という。" },
];

/* -------------------- Actividad 3: Construye el titular -------------------- */
type BuilderItem = {
  id: string;
  base: string;
  yomi: string;
  answer: "そうだ" | "らしい" | "によると…そうだ" | "によれば…という";
  preview: string;
  why: string;
};

const BUILDER: BuilderItem[] = [
  {
    id: "b1",
    base: "気象庁＿＿午後から雨になる＿＿。",
    yomi: "きしょうちょう ＿＿ ごご から あめ に なる ＿＿。",
    answer: "によると…そうだ",
    preview: "気象庁によると、午後から雨になるそうだ。",
    why: "Fuente (気象庁) + そうだ（伝聞）。",
  },
  {
    id: "b2",
    base: "新駅は来月オープン＿＿。",
    yomi: "しんえき は らいげつ オープン ＿＿。",
    answer: "らしい",
    preview: "新駅は来月オープンらしい。",
    why: "Rumor/impresión sin citar fuente.",
  },
  {
    id: "b3",
    base: "当局＿＿、避難は完了した＿＿。",
    yomi: "とうきょく ＿＿、ひなん は かんりょう した ＿＿。",
    answer: "によれば…という",
    preview: "当局によれば、避難は完了したという。",
    why: "Fuente + 〜という（cita indirecta).",
  },
];

/* ===================== 20 KANJI NUEVOS (con traducción) ===================== */
type KanjiEx = { w: string; yomi: string; es: string };
type KanjiItem = {
  kanji: string;
  on?: string;
  kun?: string;
  glosa: string;
  ejemplo: string;
  ejYomi: string;
  palabras: KanjiEx[];
};

const KANJI_NEW: KanjiItem[] = [
  { kanji: "総", on: "ソウ", glosa: "total / general", ejemplo: "総額を発表する。", ejYomi: "そうがく を はっぴょう する。", palabras: [
    { w: "総理", yomi: "そうり", es: "primer ministro" },
    { w: "総額", yomi: "そうがく", es: "monto total" },
    { w: "総合", yomi: "そうごう", es: "integral / general" },
    { w: "総選挙", yomi: "そうせんきょ", es: "elecciones generales" },
  ]},
  { kanji: "額", on: "ガク", glosa: "importe / cantidad", ejemplo: "支給額が増える。", ejYomi: "しきゅうがく が ふえる。", palabras: [
    { w: "金額", yomi: "きんがく", es: "importe" },
    { w: "額面", yomi: "がくめん", es: "valor nominal" },
    { w: "増額", yomi: "ぞうがく", es: "aumento de monto" },
    { w: "減額", yomi: "げんがく", es: "reducción de monto" },
  ]},
  { kanji: "増", on: "ゾウ", kun: "ふ-える", glosa: "aumentar", ejemplo: "人口が増加する。", ejYomi: "じんこう が ぞうか する。", palabras: [
    { w: "増加", yomi: "ぞうか", es: "aumento" },
    { w: "増税", yomi: "ぞうぜい", es: "alza de impuestos" },
    { w: "増収", yomi: "ぞうしゅう", es: "mayor recaudación" },
    { w: "倍増", yomi: "ばいぞう", es: "duplicación" },
  ]},
  { kanji: "減", on: "ゲン", kun: "へ-る", glosa: "disminuir", ejemplo: "赤字を削減する。", ejYomi: "あかじ を さくげん する。", palabras: [
    { w: "減少", yomi: "げんしょう", es: "disminución" },
    { w: "減税", yomi: "げんぜい", es: "baja de impuestos" },
    { w: "低減", yomi: "ていげん", es: "reducción" },
    { w: "削減", yomi: "さくげん", es: "recorte" },
  ]},
  { kanji: "率", on: "リツ", glosa: "tasa / índice", ejemplo: "成長率が上がる。", ejYomi: "せいちょうりつ が あがる。", palabras: [
    { w: "失業率", yomi: "しつぎょうりつ", es: "tasa de desempleo" },
    { w: "成長率", yomi: "せいちょうりつ", es: "tasa de crecimiento" },
    { w: "利率", yomi: "りりつ", es: "tasa de interés" },
    { w: "合格率", yomi: "ごうかくりつ", es: "tasa de aprobación" },
  ]},
  { kanji: "株", on: "カブ", glosa: "acciones /株", ejemplo: "株価が急落した。", ejYomi: "かぶか が きゅうらく した。", palabras: [
    { w: "株価", yomi: "かぶか", es: "precio de la acción" },
    { w: "株式", yomi: "かぶしき", es: "acciones (mercado)" },
    { w: "株主", yomi: "かぶぬし", es: "accionista" },
    { w: "株安", yomi: "かぶやす", es: "baja bursátil" },
  ]},
  { kanji: "為", on: "イ", kun: "ため", glosa: "motivo / divisas (為替)", ejemplo: "為替相場が動く。", ejYomi: "かわせ そうば が うごく。", palabras: [
    { w: "為替", yomi: "かわせ", es: "cambio de divisas" },
    { w: "行為", yomi: "こうい", es: "acto / conducta" },
    { w: "人為的", yomi: "じんいてき", es: "artificial" },
    { w: "為になる", yomi: "ために なる", es: "ser útil / provechoso" },
  ]},
  { kanji: "輸", on: "ユ", glosa: "transportar / exportar", ejemplo: "自動車を輸出する。", ejYomi: "じどうしゃ を ゆしゅつ する。", palabras: [
    { w: "輸出", yomi: "ゆしゅつ", es: "exportación" },
    { w: "輸入", yomi: "ゆにゅう", es: "importación" },
    { w: "輸送", yomi: "ゆそう", es: "transporte" },
    { w: "輸血", yomi: "ゆけつ", es: "transfusión" },
  ]},
  { kanji: "貿", on: "ボウ", glosa: "comercio (exterior)", ejemplo: "貿易額が増えた。", ejYomi: "ぼうえきがく が ふえた。", palabras: [
    { w: "貿易", yomi: "ぼうえき", es: "comercio exterior" },
    { w: "通商", yomi: "つうしょう", es: "comercio / relaciones comerciales" },
    { w: "貿易額", yomi: "ぼうえきがく", es: "valor comercial" },
    { w: "貿易黒字", yomi: "ぼうえき くろじ", es: "superávit comercial" },
  ]},
  { kanji: "雇", on: "コ", glosa: "emplear", ejemplo: "新規に雇用を生む。", ejYomi: "しんき に こよう を うむ。", palabras: [
    { w: "雇用", yomi: "こよう", es: "empleo" },
    { w: "解雇", yomi: "かいこ", es: "despido" },
    { w: "雇い主", yomi: "やといぬし", es: "empleador" },
    { w: "被雇用者", yomi: "ひこようしゃ", es: "empleado" },
  ]},
  { kanji: "失", on: "シツ", glosa: "perder / fallar", ejemplo: "工場閉鎖で失業する人も。", ejYomi: "こうじょう へいさ で しつぎょう する ひと も。", palabras: [
    { w: "失業", yomi: "しつぎょう", es: "desempleo" },
    { w: "失敗", yomi: "しっぱい", es: "fracaso" },
    { w: "喪失", yomi: "そうしつ", es: "pérdida" },
    { w: "損失", yomi: "そんしつ", es: "pérdida (económica)" },
  ]},
  { kanji: "業", on: "ギョウ", glosa: "industria / negocio", ejemplo: "観光業が回復。", ejYomi: "かんこうぎょう が かいふく。", palabras: [
    { w: "産業", yomi: "さんぎょう", es: "industria" },
    { w: "企業", yomi: "きぎょう", es: "empresa" },
    { w: "農業", yomi: "のうぎょう", es: "agricultura" },
    { w: "工業", yomi: "こうぎょう", es: "industria manufacturera" },
  ]},
  { kanji: "景", on: "ケイ", glosa: "panorama / coyuntura", ejemplo: "景気が上向く。", ejYomi: "けいき が うわむく。", palabras: [
    { w: "景気", yomi: "けいき", es: "coyuntura económica" },
    { w: "景況", yomi: "けいきょう", es: "situación económica" },
    { w: "光景", yomi: "こうけい", es: "escena / panorama" },
    { w: "景観", yomi: "けいかん", es: "paisaje (urbanístico)" },
  ]},
  { kanji: "況", on: "キョウ", glosa: "condición / estado", ejemplo: "市況は改善傾向。", ejYomi: "しきょう は かいぜん けいこう。", palabras: [
    { w: "状況", yomi: "じょうきょう", es: "situación" },
    { w: "好況", yomi: "こうきょう", es: "bonanza" },
    { w: "不況", yomi: "ふきょう", es: "recesión" },
    { w: "悪況", yomi: "あっきょう", es: "mala situación" },
  ]},
  { kanji: "統", on: "トウ", glosa: "unificar /統-", ejemplo: "統一方針を示す。", ejYomi: "とういつ ほうしん を しめす。", palabras: [
    { w: "統計", yomi: "とうけい", es: "estadística" },
    { w: "統一", yomi: "とういつ", es: "unificación" },
    { w: "伝統", yomi: "でんとう", es: "tradición" },
    { w: "統治", yomi: "とうち", es: "gobernanza" },
  ]},
  { kanji: "計", on: "ケイ", kun: "はか-る", glosa: "plan / medir", ejemplo: "計画を見直す。", ejYomi: "けいかく を みなおす。", palabras: [
    { w: "計画", yomi: "けいかく", es: "plan" },
    { w: "合計", yomi: "ごうけい", es: "suma total" },
    { w: "会計", yomi: "かいけい", es: "contabilidad" },
    { w: "計測", yomi: "けいそく", es: "medición" },
  ]},
  { kanji: "調", on: "チョウ", kun: "しら-べる", glosa: "investigar / ajustar", ejemplo: "需給を調整する。", ejYomi: "じゅきゅう を ちょうせい する。", palabras: [
    { w: "調査", yomi: "ちょうさ", es: "investigación" },
    { w: "調整", yomi: "ちょうせい", es: "ajuste" },
    { w: "強調", yomi: "きょうちょう", es: "énfasis" },
    { w: "好調", yomi: "こうちょう", es: "buen desempeño" },
  ]},
  { kanji: "指", on: "シ", kun: "ゆび", glosa: "señalar / índice", ejemplo: "新たな指標を公表。", ejYomi: "あらた な しひょう を こうひょう。", palabras: [
    { w: "指標", yomi: "しひょう", es: "índice / indicador" },
    { w: "指示", yomi: "しじ", es: "instrucción" },
    { w: "指定", yomi: "してい", es: "designación" },
    { w: "指導", yomi: "しどう", es: "dirección / guía" },
  ]},
  { kanji: "需", on: "ジュ", glosa: "demanda", ejemplo: "需要が拡大する。", ejYomi: "じゅよう が かくだい する。", palabras: [
    { w: "需要", yomi: "じゅよう", es: "demanda" },
    { w: "需給", yomi: "じゅきゅう", es: "oferta y demanda" },
    { w: "必需品", yomi: "ひつじゅひん", es: "artículos de primera necesidad" },
    { w: "電力需給", yomi: "でんりょく じゅきゅう", es: "balance eléctrico" },
  ]},
  { kanji: "供", on: "キョウ", kun: "とも", glosa: "suministrar / ofrecer", ejemplo: "医療体制を提供する。", ejYomi: "いりょう たいせい を ていきょう する。", palabras: [
    { w: "供給", yomi: "きょうきゅう", es: "suministro" },
    { w: "提供", yomi: "ていきょう", es: "ofrecimiento / provisión" },
    { w: "供述", yomi: "きょうじゅつ", es: "declaración (judicial)" },
    { w: "供養", yomi: "くよう", es: "ofrenda conmemorativa" },
  ]},
].filter((k, idx, arr) => arr.findIndex(x => x.kanji === k.kanji) === idx).slice(0, 20);

/* ---------------------------------- UI helpers ---------------------------------- */
function PillBtn({
  label,
  onPress,
  variant = "primary",
}: { label: string; onPress?: () => void; variant?: "primary" | "ghost" | "alt" }) {
  return (
    <Pressable onPress={onPress} style={[
      styles.btn,
      variant === "primary" ? styles.btnPrimary : variant === "ghost" ? styles.btnGhost : styles.btnAlt
    ]}>
      <Text style={[styles.btnText, variant === "alt" && { color: "#0B0F19" }]}>{label}</Text>
    </Pressable>
  );
}

function ExampleItem({ ex }: { ex: Ex }) {
  return (
    <View style={styles.cardInner}>
      <View style={styles.rowBetween}>
        <Text style={styles.jp}>{ex.jp}</Text>
        <Pressable onPress={() => speakJP(ex.jp)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
      </View>
      <Text style={styles.yomi}>{ex.yomi}</Text>
      <Text style={styles.es}>{ex.es}</Text>
    </View>
  );
}

/* ================== KANJI Cards ================== */
function KanjiCard({ item }: { item: KanjiItem }) {
  return (
    <View style={styles.kanjiCard}>
      <View style={styles.kanjiRow}>
        <Text style={styles.kanjiBig}>{item.kanji}</Text>
        <View style={{ marginLeft: 12 }}>
          {!!item.on && <Text style={styles.kinfo}>音: {item.on}</Text>}
          {!!item.kun && <Text style={styles.kinfo}>訓: {item.kun}</Text>}
          <Text style={styles.kglosa}>{item.glosa}</Text>
        </View>
      </View>

      <View style={[styles.inner, { marginTop: 10 }]}>
        <View style={styles.rowBetween}>
          <Text style={styles.jp}>{item.ejemplo}</Text>
          <Pressable onPress={() => speakJP(item.ejemplo)}>
            <MCI name="play" size={18} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.yomi}>{item.ejYomi}</Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.h3}>Palabras ejemplo</Text>
        <View style={styles.rowWrap}>
          {item.palabras.map((p, i) => (
            <Pressable key={`${item.kanji}:${p.w}:${i}`} onPress={() => speakJP(p.w)} style={[styles.token, { alignItems: "flex-start" }]}>
              <Text style={[styles.choiceText, { fontWeight: "900" }]}>{p.w}</Text>
              <Text style={styles.smallYomi}>{p.yomi}</Text>
              <Text style={styles.tokenEs}>{p.es}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------- COMPONENTE ---------------------------------- */
export default function N2_B4_U3() {
  const [progress, setProgress] = useState(0);
  const mark = () => setProgress((p) => Math.min(1, p + 0.2));
  const { playCorrect, playWrong } = useFeedbackSounds();

  /* Match estado */
  const [matchAnswers, setMatchAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(MATCH_NEWS.map(m => [m.id, null]))
  );
  const [matchDone, setMatchDone] = useState(false);

  /* JLPT estado */
  const [jlptAnswers, setJlptAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(JLPT_QUESTIONS.map(q => [q.id, null]))
  );
  const jlptScore = useMemo(() =>
    JLPT_QUESTIONS.reduce((s, q) => s + ((jlptAnswers[q.id] === q.answer) ? 1 : 0), 0)
  , [jlptAnswers]);

  /* Builder estado */
  const [builderSel, setBuilderSel] = useState<Record<string, string>>(
    Object.fromEntries(BUILDER.map(b => [b.id, ""]))
  );
  const [builderDone, setBuilderDone] = useState(false);

  /* ======= Mini-juego Kanji → Palabra (con claves únicas) ======= */
  type Pair = { id: string; k: string; w: string; yomi: string };
  const KANJI_PAIRS = useMemo<Pair[]>(() => {
    const used = new Set<string>();
    const pairs: Pair[] = [];
    for (const k of KANJI_NEW) {
      const pick = k.palabras.find(v => !used.has(v.w)) ?? k.palabras[0];
      used.add(pick.w);
      pairs.push({ id: `${k.kanji}:${pick.w}`, k: k.kanji, w: pick.w, yomi: pick.yomi });
    }
    return pairs;
  }, []);

  const shuffle = <T,>(arr: T[]) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const [kanjiOrder, setKanjiOrder] = useState<string[]>(
    () => shuffle(KANJI_PAIRS.map(p => p.k))
  );
  const [wordOrder, setWordOrder] = useState<string[]>(
    () => shuffle(KANJI_PAIRS.map(p => p.id))
  );

  const [selKanji, setSelKanji] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [tries, setTries] = useState(0);
  const [hits, setHits] = useState(0);

  const isMatched = (k: string) => !!matches[k];
  const pairForKanji = (k: string) => KANJI_PAIRS.find(p => p.k === k);
  const pairById = (id: string) => KANJI_PAIRS.find(p => p.id === id);

  const resetMatch = () => {
    setSelKanji(null);
    setMatches({});
    setTries(0);
    setHits(0);
    setKanjiOrder(shuffle(KANJI_PAIRS.map(p => p.k)));
    setWordOrder(shuffle(KANJI_PAIRS.map(p => p.id)));
  };

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b4_u3.webp")}
      accent={accent}
      breadcrumb="B4 · U3"
      title="Reportar hechos en prensa"
      subtitle="「〜そうだ（伝聞）」「〜らしい」「〜によると／によれば」 — citar, inferir y atribuir fuentes."
      ctas={[
        { label: "Consejo rápido", onPress: () => speakES("¿Citas una fuente (によると／によれば + そうだ/という) o sólo expresas ‘al parecer’ (らしい)?") },
        { label: "Marcar avance", onPress: mark },
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Siguiente"
    >

      {/* Guía */}
      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.h2}>Guía de uso (ámbitos + lectura)</Text>
        {GUIA.map((g, i) => (
          <View key={i} style={styles.guiaBlock}>
            <View style={styles.tagRow}>
              <Text style={styles.badge}>{g.tag}</Text>
              <PillBtn label="Pronunciar" variant="ghost" onPress={() => speakJP(g.tag)} />
            </View>
            <Text style={styles.p}>{g.descES}</Text>
            <View style={{ marginTop: 6 }}>
              {g.ambitosES.map((pt, k) => (<Text key={k} style={styles.li}>• {pt}</Text>))}
            </View>
            <View style={{ marginTop: 10 }}>
              {g.ejemplos.map((ex, k) => <ExampleItem key={k} ex={ex} />)}
            </View>
          </View>
        ))}
      </View>

      {/* Actividad 1: Match contenido → titular */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 1 · Elige el titular adecuado</Text>
        <Text style={styles.p}>Selecciona el titular que mejor encaja; verás **correcto/incorrecto**, **traducción** y **por qué**.</Text>

        {MATCH_NEWS.map((m) => {
          const chosenIdx = matchAnswers[m.id];
          const chosen = chosenIdx !== null ? m.choices[chosenIdx!] : null;
          const isCorrect = chosen?.correct;
          return (
            <View key={m.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{m.contentJP}</Text>
                <Pressable onPress={() => speakJP(m.contentJP)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
              </View>
              {!!m.yomi && <Text style={styles.yomi}>{m.yomi}</Text>}

              {m.choices.map((c, idx) => {
                const selected = chosenIdx === idx;
                const showEval = matchDone && chosenIdx !== null;
                const ok = showEval && selected && c.correct;
                const ko = showEval && selected && !c.correct;
                return (
                  <Pressable
                    key={`${m.id}:${idx}`}
                    onPress={() => {
                      setMatchAnswers(prev => ({ ...prev, [m.id]: idx }));
                      if (matchDone) c.correct ? playCorrect() : playWrong();
                    }}
                    style={[
                      styles.choice,
                      selected && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent },
                      ok && { borderColor: "#16a34a" },
                      ko && { borderColor: "#ef4444" },
                    ]}
                  >
                    <Text style={styles.choiceText}>{c.label}</Text>
                  </Pressable>
                );
              })}

              {matchDone && chosen && (
                <View style={styles.feedbackBox}>
                  <Text style={[styles.es, { color: isCorrect ? "#86efac" : "#fecaca" }]}>
                    {isCorrect ? "✓ Correcto." : "✕ Incorrecto."}
                  </Text>
                  <Text style={styles.es}>Traducción: {chosen.trans}</Text>
                  <Text style={styles.explain}>Por qué: {chosen.why}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <PillBtn
            label="Calificar"
            onPress={() => {
              setMatchDone(true);
              Object.entries(matchAnswers).forEach(([id, idx]) => {
                const item = MATCH_NEWS.find(x => x.id === id);
                if (item && idx !== null) (item.choices[idx].correct ? playCorrect() : playWrong());
              });
            }}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => { setMatchDone(false); setMatchAnswers(Object.fromEntries(MATCH_NEWS.map(m => [m.id, null]))); }}
          />
        </View>
      </View>

      {/* Actividad 2: JLPT 16 */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 2 · Examen estilo JLPT (16)</Text>
        <Text style={styles.p}>Marca la opción correcta. Feedback inmediato con sonido y explicación.</Text>

        {JLPT_QUESTIONS.map((q) => {
          const chosen = jlptAnswers[q.id];
          const show = chosen !== null && chosen !== undefined;
          return (
            <View key={q.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{q.stem}</Text>
                <Pressable onPress={() => speakJP(q.stem)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
              </View>
              {q.options.map((opt, idx) => {
                const isChosen = chosen === idx;
                const isCorrect = idx === q.answer;
                const border = show && isChosen ? (isCorrect ? { borderColor: "#16a34a" } : { borderColor: "#ef4444" }) : {};
                return (
                  <Pressable
                    key={`${q.id}:${idx}`}
                    onPress={() => {
                      setJlptAnswers(prev => ({ ...prev, [q.id]: idx }));
                      if (idx === q.answer) playCorrect(); else playWrong();
                    }}
                    style={[styles.choice, isChosen && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent }, border]}
                  >
                    <Text style={styles.choiceText}>{opt}</Text>
                  </Pressable>
                );
              })}
              {show && <Text style={[styles.explain, { marginTop: 6 }]}>Explicación: {q.explain}</Text>}
            </View>
          );
        })}

        <View style={styles.actions}>
          <PillBtn
            label={`Ver puntuación: ${jlptScore}/16`}
            onPress={() => Alert.alert("Resultado", `Tu puntuación: ${jlptScore} / 16`)}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => setJlptAnswers(Object.fromEntries(JLPT_QUESTIONS.map(q => [q.id, null])))}
          />
        </View>
      </View>

      {/* Actividad 3: Construye el titular */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 3 · Construye el titular</Text>
        <Text style={styles.p}>Selecciona la opción que produzca un titular natural (con cita o inferencia correctas).</Text>

        {BUILDER.map((b) => {
          const sel = builderSel[b.id];
          const checked = builderDone;
          const correct = sel === b.answer;
          const OPTIONS: BuilderItem["answer"][] = ["そうだ", "らしい", "によると…そうだ", "によれば…という"];
          return (
            <View key={b.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{b.base.replace("＿＿", sel || "＿＿")}</Text>
                <Pressable onPress={() => speakJP(b.preview)}><MCI name="play" size={18} color="#fff" /></Pressable>
              </View>
              <Text style={styles.yomi}>{b.yomi.replace("＿＿", sel || "＿＿")}</Text>

              <View style={styles.rowWrap}>
                {OPTIONS.map(opt => {
                  const chosen = sel === opt;
                  const border = checked
                    ? opt === b.answer
                      ? { borderColor: "#16a34a" }
                      : chosen
                      ? { borderColor: "#ef4444" }
                      : {}
                    : {};
                  return (
                    <Pressable
                      key={`${b.id}:${opt}`}
                      onPress={() => {
                        setBuilderSel(prev => ({ ...prev, [b.id]: opt }));
                        if (builderDone) (opt === b.answer ? playCorrect() : playWrong());
                      }}
                      style={[styles.token, chosen && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent }, border]}
                    >
                      <Text style={styles.choiceText}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {checked && (
                <View style={styles.feedbackBox}>
                  <Text style={[styles.es, { color: correct ? "#86efac" : "#fecaca" }]}>
                    {correct ? "✓ Correcto." : `✕ Incorrecto. Respuesta: ${b.answer}`}
                  </Text>
                  <Text style={styles.es}>Titular natural: {b.preview}</Text>
                  <Text style={styles.explain}>Por qué: {b.why}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <PillBtn
            label="Comprobar"
            onPress={() => {
              setBuilderDone(true);
              Object.entries(builderSel).forEach(([id, v]) => {
                const item = BUILDER.find(x => x.id === id);
                if (item) (v === item.answer ? playCorrect() : playWrong());
              });
            }}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => { setBuilderDone(false); setBuilderSel(Object.fromEntries(BUILDER.map(b => [b.id, ""]))); }}
          />
        </View>
      </View>

      {/* ===== KANJI — Tarjetas + Mini-juego ===== */}
      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.h2}>Kanji de la lección（20）</Text>
        <Text style={styles.p}>Toca para escuchar. Cada palabra muestra su **traducción al español**.</Text>

        {/* Tarjetas Kanji */}
        <View style={styles.kanjiGrid}>
          {KANJI_NEW.map((k) => (
            <KanjiCard key={`kcard:${k.kanji}`} item={k} />
          ))}
        </View>

        {/* Mini-juego Matching */}
        <View style={[styles.inner, { marginTop: 12 }]}>
          <Text style={styles.h3}>Mini-juego · Empareja Kanji → Palabra</Text>
          <Text style={[styles.es, { marginTop: 6 }]}>1) Toca un Kanji. 2) Elige su palabra correcta. 3) Verde = acierto.</Text>

          <Text style={[styles.badge, { alignSelf: "flex-start", marginTop: 10, marginBottom: 6 }]}>Kanji</Text>
          <View style={styles.rowWrap}>
            {kanjiOrder.map(k => {
              const matched = isMatched(k);
              const selected = selKanji === k;
              return (
                <Pressable
                  key={`K:${k}`}
                  onPress={() => setSelKanji(prev => (prev === k ? null : k))}
                  disabled={matched}
                  style={[
                    styles.token,
                    selected && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent },
                    matched && { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.18)" }
                  ]}
                >
                  <Text style={[styles.choiceText, { fontSize: 18, fontWeight: "900" }]}>{k}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.badge, { alignSelf: "flex-start", marginTop: 10, marginBottom: 6 }]}>Palabras</Text>
          <View style={styles.rowWrap}>
            {wordOrder.map(id => {
              const pr = pairById(id)!;
              const taken = Object.values(matches).includes(id);
              return (
                <Pressable
                  key={`W:${id}`}
                  disabled={taken}
                  onPress={() => {
                    if (!selKanji) return;
                    const target = pairForKanji(selKanji);
                    setTries(t => t + 1);
                    if (target && id === target.id) {
                      setMatches(prev => ({ ...prev, [selKanji!]: id }));
                      setHits(h => h + 1);
                      playCorrect();
                      setSelKanji(null);
                    } else {
                      playWrong();
                    }
                  }}
                  style={[
                    styles.token,
                    { paddingVertical: 10, paddingHorizontal: 14, alignItems: "flex-start" },
                    taken && { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.18)" }
                  ]}
                >
                  <Text style={[styles.choiceText, { fontWeight: "900" }]}>{pr.w}</Text>
                  <Text style={styles.smallYomi}>{pr.yomi}</Text>
                  <Text style={styles.tokenEs}>
                    {(() => {
                      const k = KANJI_NEW.find(x => x.kanji === pr.k);
                      const found = k?.palabras.find(x => x.w === pr.w);
                      return found?.es ?? "";
                    })()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.actions, { marginTop: 12 }]}>
            <PillBtn label={`Aciertos: ${hits} / ${KANJI_PAIRS.length}`} />
            <PillBtn label={`Intentos: ${tries}`} variant="ghost" />
            <PillBtn label="Reiniciar juego" variant="alt" onPress={resetMatch} />
          </View>
        </View>
      </View>

    </UnitTemplate>
  );
}

/* -------------------------------- styles -------------------------------- */
const R = 14;
const styles = StyleSheet.create({
  card: {
    backgroundColor: BG_CARD,
    borderRadius: R,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardInner: {
    backgroundColor: "#0F1423",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    marginTop: 8,
  },
  guiaBlock: { marginTop: 6, gap: 8 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  badge: {
    color: "#fff",
    backgroundColor: "rgba(147,51,234,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "800",
  },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },

  h2: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  h3: { color: "#fff", fontWeight: "800", fontSize: 15, marginTop: 6, marginBottom: 4 },
  p: { color: "rgba(255,255,255,0.9)", lineHeight: 20 },
  li: { color: "rgba(255,255,255,0.85)", marginTop: 2 },

  jp: { color: "#fff", fontSize: 16, fontWeight: "800" },
  yomi: { color: "#D1D5DB", fontSize: 14, marginTop: 6 },
  es: { color: "#93C5FD", fontSize: 15 },
  explain: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  choice: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    marginTop: 8,
  },
  choiceText: { color: "#fff" },

  token: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tokenEs: {
    color: "#e5e7eb",
    fontSize: 12,
    marginTop: 2,
  },
  smallYomi: {
    color: "#cbd5e1",
    fontSize: 12,
  },

  block: { marginTop: 8 },

  feedbackBox: {
    marginTop: 8,
    backgroundColor: "#0F1423",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },

  actions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  btnPrimary: { backgroundColor: "rgba(147,51,234,0.95)" },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.14)" },
  btnAlt: { backgroundColor: "#60A5FA" },
  btnText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  /* Kanji cards */
  kanjiGrid: {
    marginTop: 8,
    rowGap: 10,
  },
  kanjiCard: {
    backgroundColor: "#0F1423",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  kanjiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  kanjiBig: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
  },
  kinfo: {
    color: "#e9d5ff",
    fontWeight: "700",
  },
  kglosa: {
    color: "#93C5FD",
    marginTop: 2,
  },
  inner: {
    backgroundColor: "#0B1222",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
});
