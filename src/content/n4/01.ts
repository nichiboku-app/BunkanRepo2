// src/content/n4/01.ts
import type { ThemeContent } from "./types";

export const TEMA_01: ThemeContent = {
  objetivos: [
    "Comprender vocabulario formal de presentación (10 palabras).",
    "Producir y entender 6 oraciones modelo de presentación.",
    "Reconocer orden de trazos y uso básico de 10 kanji del tema.",
  ],
  vocabClase: [
    { key: "w1", jp: "なまえ", romaji: "namae", es: "nombre" },
    { key: "w2", jp: "しゅっしん", romaji: "shusshin", es: "origen / lugar de procedencia" },
    { key: "w3", jp: "くに", romaji: "kuni", es: "país" },
    { key: "w4", jp: "ねんれい", romaji: "nenrei", es: "edad" },
    { key: "w5", jp: "しごと", romaji: "shigoto", es: "trabajo / ocupación" },
    { key: "w6", jp: "かいしゃ", romaji: "kaisha", es: "empresa" },
    { key: "w7", jp: "かいしゃいん", romaji: "kaishain", es: "empleado de empresa" },
    { key: "w8", jp: "がくせい", romaji: "gakusei", es: "estudiante" },
    { key: "w9", jp: "せんもん", romaji: "senmon", es: "especialidad" },
    { key: "w10", jp: "しゅみ", romaji: "shumi", es: "afición" },
  ],
  oraciones6: [
    { key: "s1", jp: "はじめまして。わたしはまりおです。", romaji: "hajimemashite. watashi wa mario desu.", es: "Mucho gusto. Yo soy Mario.", exp: "Saludo inicial + A は B です (soy X)." },
    { key: "s2", jp: "おなまえをおしえてください。", romaji: "onamae o oshiete kudasai.", es: "Por favor, dígame su nombre.", exp: "Petición amable con ～てください (por favor, haga X)." },
    { key: "s3", jp: "しゅっしんはどちらですか。", romaji: "shusshin wa dochira desu ka?", es: "¿De dónde es (usted)?", exp: "Pregunta cortés con ですか y どちら (dónde)." },
    { key: "s4", jp: "しゅっしんはメキシコです。", romaji: "shusshin wa mekishiko desu.", es: "Mi origen es México.", exp: "A は B です para hablar del origen." },
    { key: "s5", jp: "しごとはかいしゃいんです。", romaji: "shigoto wa kaishain desu.", es: "Mi trabajo es ser empleado de empresa.", exp: "Tema は + profesión です." },
    { key: "s6", jp: "しゅみはえいがです。", romaji: "shumi wa eiga desu.", es: "Mi afición es el cine.", exp: "Tema は + gusto/afición です." },
  ],
  gramatica: {
    titulo: "Gramática de esta unidad (explicación sencilla)",
    puntos: [
      { regla: "A は B です", pasoapaso: ["A = tema.", "は (wa) marca el tema.", "B = información sobre A.", "です = es/soy/son (cortés)."], ejemploJP: "わたし は がくせい です。", ejemploRoma: "watashi wa gakusei desu.", ejemploES: "Yo soy estudiante." },
      { regla: "A は B ですか", pasoapaso: ["Agrega か al final para pregunta cortés."], ejemploJP: "しゅっしん は どちら です か。", ejemploRoma: "shusshin wa dochira desu ka?", ejemploES: "¿De dónde es?" },
      { regla: "～てください (por favor, ...)", pasoapaso: ["Verbo en forma て + ください."], ejemploJP: "おなまえ を おしえて ください。", ejemploRoma: "onamae o oshiete kudasai.", ejemploES: "Por favor, dígame su nombre." },
    ],
  },
  dialogos: [
    { title: "Diálogo 1 — Presentación", kana: ["A: はじめまして。わたしはまりおです。", "B: はじめまして。わたしはたなかです。", "A: おなまえはなんですか。", "B: たなかです。よろしくおねがいします。"], kanji: ["A: はじめまして。私はマリオです。", "B: はじめまして。私はたなかです。", "A: お名前はなんですか。", "B: たなかです。よろしくおねがいします。"] },
    { title: "Diálogo 2 — País y trabajo", kana: ["A: しゅっしんのくにはどこですか。", "B: くにはメキシコです。", "A: しごとはなんですか。", "B: かいしゃいんです。"], kanji: ["A: しゅっしんの国はどこですか。", "B: 国はメキシコです。", "A: 仕事はなんですか。", "B: 会社員です。"] },
    { title: "Diálogo 3 — Estudios y antes", kana: ["A: いまはがくせいですか。", "B: はい、がくせいです。", "A: まえのしごとは？", "B: まえはかいしゃでしごとでした。"], kanji: ["A: いまは学生ですか。", "B: はい、学生です。", "A: 前のしごとは？", "B: 前は会社で仕事でした。"] },
  ],
  quizLines: [
    "A: しゅっしんの国はどこですか。",
    "B: 国はメキシコです。",
    "A: 仕事はなんですか。",
    "B: 会社員です。",
  ],
  kanji10: [
    { ch: "私", kun: ["わたし"], on: ["シ"], es: "yo", ej: [ { jp: "私は学生です。", yomi: "わたしはがくせいです。", es: "Yo soy estudiante." }, { jp: "私はかいしゃいんです。", yomi: "わたしはかいしゃいんです。", es: "Yo soy empleado de empresa." } ], strokeCode: "79c1" },
    { ch: "名", kun: ["な"], on: ["メイ"], es: "nombre", ej: [ { jp: "お名前はなんですか。", yomi: "おなまえはなんですか。", es: "¿Cuál es su nombre?" }, { jp: "名前はまりおです。", yomi: "なまえはまりおです。", es: "Mi nombre es Mario." } ], strokeCode: "540d" },
    { ch: "前", kun: ["まえ"], on: ["ゼン"], es: "antes / frente", ej: [ { jp: "前のしごとはなんですか。", yomi: "まえのしごとはなんですか。", es: "¿Cuál es el trabajo anterior?" }, { jp: "前はがくせいでした。", yomi: "まえはがくせいでした。", es: "Antes era estudiante." } ], strokeCode: "524d" },
    { ch: "国", kun: ["くに"], on: ["コク"], es: "país", ej: [ { jp: "国はメキシコです。", yomi: "くにはめきしこです。", es: "Mi país es México." }, { jp: "国はどこですか。", yomi: "くにはどこですか。", es: "¿Cuál es su país?" } ], strokeCode: "56fd" },
    { ch: "学", kun: ["まな-ぶ"], on: ["ガク"], es: "estudiar", ej: [ { jp: "学生です。", yomi: "がくせいです。", es: "Soy estudiante." }, { jp: "学生ですか。", yomi: "がくせいですか。", es: "¿Es estudiante?" } ], strokeCode: "5b66" },
    { ch: "生", kun: ["い-きる","う-まれる"], on: ["セイ"], es: "vida / nacer", ej: [ { jp: "学生です。", yomi: "がくせいです。", es: "Soy estudiante." }, { jp: "学生ですか。", yomi: "がくせいですか。", es: "¿Es estudiante?" } ], strokeCode: "751f" },
    { ch: "社", kun: [], on: ["シャ"], es: "compañía", ej: [ { jp: "会社です。", yomi: "かいしゃです。", es: "Es una empresa." }, { jp: "会社ですか。", yomi: "かいしゃですか。", es: "¿Es una empresa?" } ], strokeCode: "793e" },
    { ch: "員", kun: [], on: ["イン"], es: "miembro / empleado", ej: [ { jp: "会社員です。", yomi: "かいしゃいんです。", es: "Soy empleado de empresa." }, { jp: "会社員ですか。", yomi: "かいしゃいんですか。", es: "¿Es empleado de empresa?" } ], strokeCode: "54e1" },
    { ch: "仕", kun: [], on: ["シ"], es: "servir / hacer", ej: [ { jp: "仕事です。", yomi: "しごとです。", es: "Es trabajo." }, { jp: "仕事はなんですか。", yomi: "しごとはなんですか。", es: "¿Cuál es el trabajo?" } ], strokeCode: "4ed5" },
    { ch: "事", kun: ["こと"], on: ["ジ"], es: "cosa / asunto / trabajo", ej: [ { jp: "仕事の事です。", yomi: "しごとのことです。", es: "Es sobre el trabajo." } ], strokeCode: "4e8b" },
  ],
};
