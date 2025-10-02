// src/content/n4/03.ts
import type { ThemeContent } from "./types";

/**
 * TEMA 3 (N4) · 🍱 En un restaurante – Hacer pedidos y preferencias
 * Shape compatible con TEMA_01 / TEMA_2 y N4TemaScreen:
 * - objetivos, vocabClase, oraciones6, gramatica.{titulo,puntos}, dialogos, quizLines, kanji10
 */

export const TEMA_3: ThemeContent = {
  objetivos: [
    "Pedir comida y bebida con ～をください／～をお願いします。",
    "Expresar gustos con ～が好きです／～が嫌いです。",
    "Expresar deseos con ～たいです。",
    "Resolver totales, pagos y cambio en yenes.",
  ],

  /* ======================
     VOCABULARIO (con key + romaji)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "レストラン",   romaji: "resutoran",        es: "restaurante" },
    { key: "v2",  jp: "メニュー",     romaji: "menyū",            es: "menú" },
    { key: "v3",  jp: "注文",         romaji: "chūmon",           es: "pedido" },
    { key: "v4",  jp: "ご飯",         romaji: "gohan",            es: "arroz / comida" },
    { key: "v5",  jp: "寿司",         romaji: "sushi",            es: "sushi" },
    { key: "v6",  jp: "刺身",         romaji: "sashimi",          es: "sashimi" },
    { key: "v7",  jp: "肉",           romaji: "niku",             es: "carne" },
    { key: "v8",  jp: "魚",           romaji: "sakana",           es: "pescado" },
    { key: "v9",  jp: "野菜",         romaji: "yasai",            es: "verduras" },
    { key: "v10", jp: "水",           romaji: "mizu",             es: "agua" },
    { key: "v11", jp: "お茶",         romaji: "ocha",             es: "té" },
    { key: "v12", jp: "ビール",       romaji: "bīru",             es: "cerveza" },
    { key: "v13", jp: "牛肉",         romaji: "gyūniku",          es: "carne de res" },
    { key: "v14", jp: "鶏肉",         romaji: "toriniku",         es: "carne de pollo" },
    { key: "v15", jp: "焼肉",         romaji: "yakiniku",         es: "carne asada (estilo japonés)" },
    { key: "v16", jp: "デザート",     romaji: "dezāto",           es: "postre" },
    { key: "v17", jp: "会計",         romaji: "kaikei",           es: "cuenta" },
  ],

  /* ======================
     ORACIONES (6) con key + romaji + exp
  ====================== */
  oraciones6: [
    { key: "s1", jp: "寿司をください。",     romaji: "sushi o kudasai",         es: "Deme sushi, por favor.",              exp: "Pedido directo con ～をください。" },
    { key: "s2", jp: "お茶をお願いします。", romaji: "ocha o onegai shimasu",    es: "Un té, por favor.",                   exp: "Más cortesía con ～をお願いします。" },
    { key: "s3", jp: "私は魚が好きです。",   romaji: "watashi wa sakana ga suki desu", es: "Me gusta el pescado.",         exp: "Sujetos de gusto usan が." },
    { key: "s4", jp: "辛い料理が嫌いです。", romaji: "karai ryōri ga kirai desu", es: "No me gusta la comida picante.",   exp: "嫌い（きらい） = no gustar." },
    { key: "s5", jp: "ラーメンを食べたいです。", romaji: "rāmen o tabetai desu", es: "Quiero comer ramen.",               exp: "～たいです expresa deseo." },
    { key: "s6", jp: "水を飲みたいです。",   romaji: "mizu o nomitai desu",     es: "Quiero beber agua.",                  exp: "Verbo-masu + たいです." },
  ],

  /* ======================
     GRAMÁTICA (claves: regla, pasoapaso, ejemplo*)
  ====================== */
  gramatica: {
    titulo: "Gramática",
    puntos: [
      {
        regla: "～をください",
        pasoapaso: ["[objeto] + を + ください → pedido directo y cortés."],
        ejemploJP: "寿司をください。",
        ejemploRoma: "sushi o kudasai",
        ejemploES: "Deme sushi, por favor.",
        ejemplos: [
          { jp: "水をください。", roma: "mizu o kudasai", es: "Agua, por favor." },
        ],
      },
      {
        regla: "～をお願いします",
        pasoapaso: ["[objeto] + を + お願いします → más cortesía que ください。"],
        ejemploJP: "お茶をお願いします。",
        ejemploRoma: "ocha o onegai shimasu",
        ejemploES: "Un té, por favor.",
        ejemplos: [
          { jp: "メニューをお願いします。", roma: "menyū o onegai shimasu", es: "El menú, por favor." },
        ],
      },
     // ⬇️ Reemplazo 1: 「～が好きです／～が嫌いです」
{
  regla: "～が好きです／～が嫌いです",
  pasoapaso: ["Sujeto de gusto lleva が.", "A + は + B(が)好き／嫌いです。", "Negativo habitual: 好きではありません。"],
  ejemploJP: "私は魚が好きです。",
  ejemploRoma: "watashi wa sakana ga suki desu",
  ejemploES: "Me gusta el pescado.",
  ejemplos: [
    { jp: "肉が好きです。",         roma: "niku ga suki desu",            es: "Me gusta la carne." },
    { jp: "野菜が好きです。",       roma: "yasai ga suki desu",           es: "Me gustan las verduras." },
    { jp: "甘いものが好きです。",   roma: "amai mono ga suki desu",       es: "Me gustan los dulces." },
    { jp: "コーヒーが好きです。",   roma: "kōhī ga suki desu",            es: "Me gusta el café." },
    { jp: "辛い食べ物が嫌いです。", roma: "karai tabemono ga kirai desu", es: "No me gusta la comida picante." },
    { jp: "納豆が嫌いです。",       roma: "nattō ga kirai desu",          es: "No me gusta el natto." },
    { jp: "牛乳は好きではありません。", roma: "gyūnyū wa suki de wa arimasen", es: "No me gusta la leche." },
    { jp: "ビールは好きではありません。", roma: "bīru wa suki de wa arimasen", es: "No me gusta la cerveza." },
  ],
},

// ⬇️ Reemplazo 2: 「～たいです」
{
  regla: "～たいです",
  pasoapaso: [
    "Verbo en raíz (forma ます sin ます) + たいです → ‘quiero ~’.",
    "Negativo: ～たくないです／～たくありません（más formal）。",
    "Pregunta: ～たいですか。",
  ],
  ejemploJP: "ラーメンを食べたいです。",
  ejemploRoma: "rāmen o tabetai desu",
  ejemploES: "Quiero comer ramen.",
  tabla: {
    title: "Conjugación básica de ～たい",
    headers: ["Forma", "Ejemplo"],
    rows: [
      ["Afirmativa", "食べたいです"],
      ["Negativa", "食べたくないです／食べたくありません"],
      ["Interrogativa", "食べたいですか"],
    ],
    note: "Se usa para deseos personales (1.ª persona o preguntas).",
  },
  ejemplos: [
    { jp: "寿司を食べたいです。",           roma: "sushi o tabetai desu",            es: "Quiero comer sushi." },
    { jp: "カレーを食べたいです。",         roma: "karē o tabetai desu",             es: "Quiero comer curry." },
    { jp: "デザートを食べたいです。",       roma: "dezāto o tabetai desu",           es: "Quiero comer postre." },
    { jp: "水を飲みたいです。",             roma: "mizu o nomitai desu",             es: "Quiero beber agua." },
    { jp: "コーヒーは飲みたくないです。",   roma: "kōhī wa nomitakunai desu",        es: "No quiero beber café." },
    { jp: "ビールは飲みたくありません。",   roma: "bīru wa nomitaku arimasen",       es: "No quiero beber cerveza." },
    { jp: "ここで食べたいです。",           roma: "koko de tabetai desu",            es: "Quiero comer aquí." },
    { jp: "野菜をもっと食べたいです。",     roma: "yasai o motto tabetai desu",      es: "Quiero comer más verduras." },
    { jp: "何か甘いものを食べたいです。",   roma: "nanika amai mono o tabetai desu", es: "Quiero comer algo dulce." },
    { jp: "メニューを見たいです。",         roma: "menyū o mitai desu",              es: "Quiero ver el menú." },
  ],
},

    ],
  },

  /* ======================
     DIÁLOGOS (usa title, kana[], kanji[], es[])
  ====================== */
  dialogos: [
    {
      title: "Pedir comida (básico)",
      kana:  ["すみません、すしをください。", "はい、すしですね。"],
      kanji: ["すみません、寿司をください。", "はい、寿司ですね。"],
      es:    ["Disculpe, deme sushi por favor.", "Claro, sushi, ¿verdad?"],
    },
    {
      title: "Pedir bebida y pagar (💴)",
      kana:  ["おちゃをおねがいします。", "はい、200えんです。", "500えんあります。", "300えんのおつりです。どうぞ。"],
      kanji: ["お茶をお願いします。",       "はい、２００円です。",   "５００円あります。",   "３００円のおつりです。どうぞ。"],
      es:    ["Un té, por favor.", "Sí, son 200 yenes.", "Tengo 500 yenes.", "Son 300 yenes de cambio. Adelante."],
    },
    {
      title: "Preferencias",
      kana:  ["わたしは さかな が すきです。", "では、さしみ を おすすめします。"],
      kanji: ["私は 魚 が 好きです。",         "では、刺身 を おすすめします。"],
      es:    ["A mí me gusta el pescado.", "Entonces, le recomiendo sashimi."],
    },
    {
      title: "Deseo + cuenta final (💴)",
      kana:  ["ぎゅうにく を たべたいです。", "やきにく は いかがですか？", "それをください。", "やきにく と おちゃ で 1500えんです。", "2000えんで おねがいします。", "500えん の おつりです。ありがとうございました！"],
      kanji: ["牛肉を食べたいです。",         "焼肉はいかがですか？",     "それをください。",   "焼肉とお茶で１５００円です。",            "２０００円でお願いします。",             "５００円のおつりです。ありがとうございました！"],
      es:    ["Quiero comer carne de res.", "¿Qué le parece yakiniku?", "Lo tomaré, por favor.", "Yakiniku y té son 1500 yenes.", "Pago con 2000 yenes.", "500 yenes de cambio. ¡Gracias!"],
    },
  ],

  /* ======================
     QUIZ (ordenar diálogo) — usa strings
  ====================== */
  quizLines: [
    "お茶をお願いします。",
    "はい、２００円です。",
    "５００円あります。",
    "３００円のおつりです。どうぞ。",
  ],

  /* ======================
     KANJI (usa ch/kun/on/es/…)
  ====================== */
  kanji10: [
    {
      ch: "食", kun: ["た-べる"], on: ["ショク"], es: "comer", trazos: 9, strokeCode: "98df",
      ej: [{ jp: "食べます", yomi: "たべます", es: "comer (formal)" }, { jp: "食べたい", yomi: "たべたい", es: "quiero comer" }],
    },
    {
      ch: "飲", kun: ["の-む"], on: ["イン"], es: "beber", trazos: 12, strokeCode: "98f2",
      ej: [{ jp: "飲みます", yomi: "のみます", es: "beber (formal)" }],
    },
    {
      ch: "米", kun: ["こめ"], on: [], es: "arroz (grano)", trazos: 6, strokeCode: "7c73",
      ej: [{ jp: "米を買います", yomi: "こめをかいます", es: "compro arroz" }],
    },
    {
      ch: "肉", kun: [], on: ["ニク"], es: "carne", trazos: 6, strokeCode: "8089",
      ej: [{ jp: "肉が好きです", yomi: "にくがすきです", es: "me gusta la carne" }],
    },
    {
      ch: "魚", kun: ["さかな"], on: [], es: "pescado", trazos: 11, strokeCode: "9b5a",
      ej: [{ jp: "魚を食べます", yomi: "さかなをたべます", es: "como pescado" }],
    },
    {
      ch: "野", kun: [], on: ["ヤ"], es: "campo → (野菜) verdura", trazos: 11, strokeCode: "91ce",
      ej: [{ jp: "野菜", yomi: "やさい", es: "verduras" }],
    },
    {
      ch: "菜", kun: [], on: ["サイ"], es: "verdura / plato", trazos: 11, strokeCode: "83dc",
      ej: [{ jp: "野菜の料理", yomi: "やさいのりょうり", es: "plato de verduras" }],
    },
    {
      ch: "茶", kun: [], on: ["チャ"], es: "té", trazos: 9, strokeCode: "8336",
      ej: [{ jp: "お茶を飲みます", yomi: "おちゃをのみます", es: "bebo té" }],
    },
    {
      ch: "牛", kun: ["うし"], on: ["ギュウ"], es: "vaca → 牛肉", trazos: 4, strokeCode: "725b",
      ej: [{ jp: "牛肉", yomi: "ぎゅうにく", es: "carne de res" }],
    },
    {
      ch: "店", kun: ["みせ"], on: ["テン"], es: "tienda / restaurante", trazos: 8, strokeCode: "5e97",
      ej: [{ jp: "この店は人気です", yomi: "このみせはにんきです", es: "este restaurante es popular" }],
    },
  ],
};

export default TEMA_3;
