// src/content/n4/05.ts 
import type { ThemeContent } from "./types";

/**
 * TEMA 5 (N4) · 🚉 Transporte y viajes – Preguntar rutas, horarios, retrasos
 * Gramática simple (explicada “como en primaria”) + tabla de 時/分 y
 * tabla específica del CONTADOR de minutos 〜分（ふん／ぷん） con ejemplos sonoros.
 */

const TEMA_5: ThemeContent = {
  objetivos: [
    "Preguntar y decir adónde vas: ～へ行きます／～へ行きたいです。",
    "Rutas: ～から／～まで y uso de ～で（medio）／～で（lugar de transbordo）。",
    "Horarios: ～は何時ですか／～時～分に〜。",
    "Transbordos y retrasos: のりかえ／おくれる。",
  ],

  /* ======================
     VOCABULARIO (10 transportes)
  ====================== */
  vocabClase: [
    { key: "t1",  jp: "電車",         romaji: "densha",      es: "tren" },
    { key: "t2",  jp: "バス",         romaji: "basu",        es: "autobús" },
    { key: "t3",  jp: "ちかてつ",     romaji: "chikatetsu",  es: "metro" },
    { key: "t4",  jp: "しんかんせん", romaji: "shinkansen",  es: "tren bala" },
    { key: "t5",  jp: "タクシー",     romaji: "takushī",     es: "taxi" },
    { key: "t6",  jp: "じてんしゃ",   romaji: "jitensha",    es: "bicicleta" },
    { key: "t7",  jp: "ひこうき",     romaji: "hikōki",      es: "avión" },
    { key: "t8",  jp: "ふね",         romaji: "fune",        es: "barco" },
    { key: "t9",  jp: "モノレール",   romaji: "monorēru",    es: "monorriel" },
    { key: "t10", jp: "あるいて",     romaji: "aruite",      es: "a pie" },
  ],

  /* ======================
     ORACIONES (6)
  ====================== */
  oraciones6: [
    { key: "s1", jp: "電車で駅へ行きます。", romaji: "densha de eki e ikimasu", es: "Voy a la estación en tren.", exp: "～で (medio) + ～へ行きます。" },
    { key: "s2", jp: "この駅からあの駅まで行きます。", romaji: "kono eki kara ano eki made ikimasu", es: "Voy desde esta estación hasta aquella.", exp: "～から／～まで (origen/destino)." },
    { key: "s3", jp: "６時３０分に出ます。", romaji: "roku-ji sanjippun ni demasu", es: "Salgo a las 6:30.", exp: "Hora con 時（じ） y 分（ふん／ぷん）。" },
    { key: "s4", jp: "この駅で のりかえ です。", romaji: "kono eki de norikae desu", es: "Hago transbordo en esta estación.", exp: "のりかえ (transbordo)." },
    { key: "s5", jp: "電車は５分 おくれています。", romaji: "densha wa go-fun okurete imasu", es: "El tren tiene 5 minutos de retraso.", exp: "おくれる (retrasarse)." },
    { key: "s6", jp: "つぎの電車は なんじ ですか。", romaji: "tsugi no densha wa nanji desu ka", es: "¿A qué hora pasa el siguiente tren?", exp: "Pregunta de hora con なんじ。" },
  ],

  /* ======================
     GRAMÁTICA — explicada “como en primaria”
  ====================== */
  gramatica: {
    titulo: "Gramática",
    puntos: [
      {
        regla: "～へ行きます／来ます／帰ります",
        pasoapaso: [
          "Piensa que へ es una flechita ➜ hacia un lugar.",
          "Primero dices el lugar, luego pones へ y al final el verbo.",
          "行きます = voy, 来ます = vengo, 帰ります = regreso.",
          "Para decir ‘quiero’: pon たいです → 行きたいです（quiero ir）.",
        ],
        ejemploJP: "駅へ行きたいです。",
        ejemploRoma: "eki e ikitai desu",
        ejemploES: "Quiero ir a la estación.",
        ejemplos: [
          { jp: "電車で駅へ行きます。", roma: "densha de eki e ikimasu", es: "Voy a la estación en tren." },
          { jp: "空港へ来ます。",        roma: "kūkō e kimasu",         es: "Vengo al aeropuerto." },
        ],
      },
      {
        regla: "～で（medio）／～に（時）",
        pasoapaso: [
          "〜で dice ‘con qué’ o ‘en qué’ viajas: 電車で（en tren），バスで（en bus）.",
          "〜に pega la hora exacta: ６時に（a las seis）／７時に（a las siete）.",
          "Fórmula fácil: [medio]で + [lugar]へ + [hora]に + [verbo].",
        ],
        ejemploJP: "バスで７時に着きます。",
        ejemploRoma: "basu de shichi-ji ni tsukimasu",
        ejemploES: "Llego en bus a las 7.",
        ejemplos: [
          { jp: "８時に出ます。", roma: "hachi-ji ni demasu", es: "Salgo a las 8." },
          { jp: "電車で行きます。", roma: "densha de ikimasu", es: "Voy en tren." },
        ],
      },
      {
        regla: "～から／～まで（origen/destino）",
        pasoapaso: [
          "から = desde. まで = hasta.",
          "Se dice: A から B まで 行きます（voy de A hasta B）.",
          "Si cambias de tren en un lugar: [lugar]で のりかえ（transbordo）.",
        ],
        ejemploJP: "この駅から あの駅まで 行きます。",
        ejemploRoma: "kono eki kara ano eki made ikimasu",
        ejemploES: "Voy desde esta estación hasta aquella.",
        ejemplos: [
          { jp: "この駅で のりかえ です。", roma: "kono eki de norikae desu", es: "Hago transbordo en esta estación." },
          { jp: "空港まで タクシーで 行きます。", roma: "kūkō made takushī de ikimasu", es: "Voy al aeropuerto en taxi." },
        ],
      },
      {
        regla: "のりかえ／遅れ（おくれ）",
        pasoapaso: [
          "のりかえ = cambiar de tren o de línea.",
          "遅れ（おくれ）= retraso. Se dice: 〜分 おくれています（tiene ~ min de retraso）.",
        ],
        ejemploJP: "電車は５分おくれています。",
        ejemploRoma: "densha wa go-fun okurete imasu",
        ejemploES: "El tren tiene 5 minutos de retraso.",
        ejemplos: [
          { jp: "この線で 行きます。", roma: "kono sen de ikimasu", es: "Voy por esta línea." },
          { jp: "つぎの電車は なんじ ですか。", roma: "tsugi no densha wa nanji desu ka", es: "¿A qué hora pasa el siguiente tren?" },
        ],
      },
      {
        regla: "時（じ）と 分（ふん／ぷん）— cómo leer la hora",
        pasoapaso: [
          "時（じ） = ‘en punto’. 分（ふん／ぷん） = minutos. 半（はん） = y media.",
          "Irregularidades de hora: ４時（よじ）, ７時（しちじ）, ９時（くじ）.",
          "Minutos con sonido ‘ぷん’: 1・3・4・6・8・10 → いっぷん／さんぷん／よんぷん／ろっぷん／はっぷん／じゅっぷん.",
        ],
        ejemploJP: "６時半に出ます。",
        ejemploRoma: "roku-ji han ni demasu",
        ejemploES: "Salgo a las seis y media.",
        tabla: {
          title: "Lecturas de 時（じ） y 分（ふん／ぷん）",
          headers: ["Número", "Hora (〜時)", "Minuto (〜分)", "Rōmaji"],
          rows: [
            ["1",  "いちじ",  "いっぷん",   "ichi-ji / ip-pun"],
            ["2",  "にじ",    "にふん",     "ni-ji / ni-fun"],
            ["3",  "さんじ",  "さんぷん",   "san-ji / san-pun"],
            ["4",  "よじ",    "よんぷん",   "yo-ji / yon-pun"],
            ["5",  "ごじ",    "ごふん",     "go-ji / go-fun"],
            ["6",  "ろくじ",  "ろっぷん",   "roku-ji / rop-pun"],
            ["7",  "しちじ",  "ななふん",   "shichi-ji / nana-fun"],
            ["8",  "はちじ",  "はっぷん",   "hachi-ji / hap-pun"],
            ["9",  "くじ",    "きゅうふん", "ku-ji / kyū-fun"],
            ["10", "じゅうじ","じゅっぷん", "jū-ji / jup-pun"],
            ["30", "—",       "さんじゅっぷん／半", "sanjup-pun / han"],
          ],
          note: "Usa los ejemplos de abajo para escuchar el audio y fijar el patrón.",
        },
        ejemplos: [
          { jp: "１時です。",         roma: "ichi-ji desu",               es: "Es la una." },
          { jp: "４時です。",         roma: "yo-ji desu",                 es: "Son las cuatro." },
          { jp: "７時に出ます。",     roma: "shichi-ji ni demasu",        es: "Salgo a las siete." },
          { jp: "９時に着きます。",   roma: "ku-ji ni tsukimasu",         es: "Llego a las nueve." },
          { jp: "１０分まちます。",   roma: "jup-pun machimasu",          es: "Espero diez minutos." },
          { jp: "３分かかります。",   roma: "san-pun kakarimasu",         es: "Tarda tres minutos." },
          { jp: "６時半に会います。",  roma: "roku-ji han ni aimasu",      es: "Nos vemos a las seis y media." },
        ],
      },

      // ⬇️ Tabla específica: CONTADOR de minutos (〜分)
      {
        regla: "Contador de minutos（〜分 ふん／ぷん）",
        pasoapaso: [
          "Para contar minutos NO dices ‘minutos’ aparte: solo el número + 分.",
          "Ojo con los que suenan 〜ぷん: 1・3・4・6・8・10（y 20, 30…）.",
          "Úsalo para ‘tarda’, ‘espera’ o ‘retraso’: 〜分 かかります／まちます／おくれています。",
        ],
        ejemploJP: "５分まちます。",
        ejemploRoma: "go-fun machimasu",
        ejemploES: "Espero 5 minutos.",
        tabla: {
          title: "Contador 〜分（ふん／ぷん）",
          headers: ["N.º", "Lectura", "Ejemplo corto", "Rōmaji"],
          rows: [
            ["1",  "いっぷん",           "１分",               "ip-pun"],
            ["2",  "にふん",             "２分",               "ni-fun"],
            ["3",  "さんぷん",           "３分",               "san-pun"],
            ["4",  "よんぷん",           "４分",               "yon-pun"],
            ["5",  "ごふん",             "５分",               "go-fun"],
            ["6",  "ろっぷん",           "６分",               "rop-pun"],
            ["7",  "ななふん",           "７分",               "nana-fun"],
            ["8",  "はっぷん",           "８分",               "hap-pun"],
            ["9",  "きゅうふん",         "９分",               "kyū-fun"],
            ["10", "じゅっぷん",         "１０分",              "jup-pun"],
            ["15", "じゅうごふん",       "１５分",              "jū-go-fun"],
            ["20", "にじゅっぷん",       "２０分",              "ni-jup-pun"],
            ["25", "にじゅうごふん",     "２５分",              "ni-jū-go-fun"],
            ["30", "さんじゅっぷん／半", "３０分／半（はん）",   "san-jup-pun / han"],
          ],
          note: "Memotruco: 1・3・4・6・8・10 (y 20・30…) usan ‘ぷん’.",
        },
        // Muchos ejemplos para que el usuario tenga AUDIO de cada forma
        ejemplos: [
          { jp: "１分 まちます。",  roma: "ip-pun machimasu",        es: "Espero 1 minuto." },
          { jp: "２分 かかります。", roma: "ni-fun kakarimasu",       es: "Tarda 2 minutos." },
          { jp: "３分 おくれています。", roma: "san-pun okurete imasu", es: "Hay 3 minutos de retraso." },
          { jp: "４分 まちます。",  roma: "yon-pun machimasu",       es: "Espero 4 minutos." },
          { jp: "５分 かかります。", roma: "go-fun kakarimasu",       es: "Tarda 5 minutos." },
          { jp: "６分 おくれています。", roma: "rop-pun okurete imasu", es: "Hay 6 minutos de retraso." },
          { jp: "８分 かかります。", roma: "hap-pun kakarimasu",      es: "Tarda 8 minutos." },
          { jp: "１０分 まちます。", roma: "jup-pun machimasu",       es: "Espero 10 minutos." },
          { jp: "２０分 かかります。", roma: "ni-jup-pun kakarimasu",  es: "Tarda 20 minutos." },
          { jp: "３０分 まちます。", roma: "san-jup-pun machimasu",   es: "Espero 30 minutos." },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (5)
  ====================== */
  dialogos: [
    {
      title: "A la estación",
      kana:  ["すみません、えき へ は どう 行きますか。", "でんしゃ で 行きます。", "ありがとうございます。"],
      kanji: ["すみません、駅へはどう行きますか。",       "電車で行きます。",         "ありがとうございます。"],
      es:    ["Disculpe, ¿cómo voy a la estación?", "Vaya en tren.", "Gracias."],
    },
    {
      title: "Ruta y horario",
      kana:  ["この えき から あの えき まで いきます。", "６じ はん に でます。"],
      kanji: ["この駅から あの駅まで 行きます。",          "６時半に出ます。"],
      es:    ["Voy desde esta estación hasta aquella.", "Salgo a las 6 y media."],
    },
    {
      title: "Transbordo",
      kana:  ["この えき で のりかえ です か。", "はい、この せん で いきます。"],
      kanji: ["この駅で のりかえ ですか。",        "はい、この線で 行きます。"],
      es:    ["¿Hago transbordo en esta estación?", "Sí, vaya por esta línea."],
    },
    {
      title: "Retraso",
      kana:  ["でんしゃ は ５ふん おくれています。", "わかりました。"],
      kanji: ["電車は５分おくれています。",            "わかりました。"],
      es:    ["El tren tiene 5 minutos de retraso.", "Entendido."],
    },
    {
      title: "Subir y bajar",
      kana:  ["ここ で のります。", "さき の えき で おります。"],
      kanji: ["ここで 乗ります。",   "先の駅で 降ります。"],
      es:    ["Subo aquí.", "Bajo en la próxima estación."],
    },
  ],

  /* ======================
     QUIZZES (5 juegos de ordenar)
     — Tu pantalla ya soporta arrays en `quizzes`.
  ====================== */
  quizzes: [
    {
      title: "Camino a la estación",
      lines: [
        "すみません、駅へはどう行きますか。",
        "電車で行きます。",
        "この駅から あの駅まで 行きます。",
        "ありがとうございます。",
      ],
    },
    {
      title: "Transbordo y salida",
      lines: [
        "この駅で のりかえ です。",
        "この線で 行きます。",
        "６時半に出ます。",
        "わかりました。",
      ],
    },
    {
      title: "Retraso y bajada",
      lines: [
        "電車は５分おくれています。",
        "わかりました。",
        "先の駅で 降ります。",
        "ありがとうございます。",
      ],
    },
    {
      title: "Hasta el aeropuerto",
      lines: [
        "空港まで タクシーで 行きます。",
        "７時に着きます。",
        "ありがとうございます。",
      ],
    },
    {
      title: "Próximo tren",
      lines: [
        "つぎの電車は なんじ ですか。",
        "７時に 出ます。",
        "この駅から あの駅まで 行きます。",
        "ありがとうございます。",
      ],
    },
  ],

  /* ======================
     KANJI (10) — de la lección
  ====================== */
  kanji10: [
    { ch: "駅", kun: [], on: ["エキ"], es: "estación", trazos: 14, strokeCode: "99c5",
      ej: [{ jp: "駅", yomi: "えき", es: "estación" }] },
    { ch: "電", kun: [], on: ["デン"], es: "electricidad → tren", trazos: 13, strokeCode: "96fb",
      ej: [{ jp: "電車", yomi: "でんしゃ", es: "tren" }] },
    { ch: "車", kun: ["くるま"], on: ["シャ"], es: "vehículo", trazos: 7, strokeCode: "8eca",
      ej: [{ jp: "車", yomi: "くるま", es: "auto; vehículo" }] },
    { ch: "行", kun: ["い-く"], on: ["コウ"], es: "ir", trazos: 6, strokeCode: "884c",
      ej: [{ jp: "行きます", yomi: "いきます", es: "ir (formal)" }] },
    { ch: "乗", kun: ["の-る"], on: ["ジョウ"], es: "subir", trazos: 9, strokeCode: "4e57",
      ej: [{ jp: "乗ります", yomi: "のります", es: "subir (a un vehículo)" }] },
    { ch: "降", kun: ["お-りる"], on: ["コウ"], es: "bajar", trazos: 10, strokeCode: "964d",
      ej: [{ jp: "降ります", yomi: "おります", es: "bajar (de un vehículo)" }] },
    { ch: "時", kun: ["とき"], on: ["ジ"], es: "hora/tiempo", trazos: 10, strokeCode: "6642",
      ej: [{ jp: "６時", yomi: "ろくじ", es: "las seis" }] },
    { ch: "分", kun: ["わ-ける"], on: ["フン"], es: "minuto/dividir", trazos: 4, strokeCode: "5206",
      ej: [{ jp: "５分", yomi: "ごふん", es: "cinco minutos" }] },
    { ch: "先", kun: ["さき"], on: ["セン"], es: "previo / próximo", trazos: 6, strokeCode: "5148",
      ej: [{ jp: "先の駅", yomi: "さきのえき", es: "la próxima estación" }] },
    { ch: "線", kun: ["すじ"], on: ["セン"], es: "línea", trazos: 15, strokeCode: "7dda",
      ej: [{ jp: "この線", yomi: "このせん", es: "esta línea" }] },
  ],
};

export default TEMA_5;
