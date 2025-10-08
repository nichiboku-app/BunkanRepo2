// src/content/n4/25.ts
import { type ThemeContent } from "./types";

export const TEMA_25: ThemeContent = {
  numero: 25,
  emoji: "📑",
  titulo: "Expresiones de permiso y prohibición",
  subtitulo: "「〜てもいい」「〜てはいけない」",

  objetivos: [
    "Pedir y dar permiso con 〜てもいい（です）",
    "Prohibir con 〜てはいけない（です）/ 〜ちゃだめ",
    "Usar en contextos reales: escuela, biblioteca, parque, museo",
    "Hacer preguntas corteses: 〜てもいいですか",
    "Diferenciar registro: neutral, cortés y coloquial",
  ],

  vocabClase: [
    { key: "v1",  jp: "きょか",        romaji: "kyoka",         es: "permiso (autorización)" },
    { key: "v2",  jp: "きんし",        romaji: "kinshi",        es: "prohibición" },
    { key: "v3",  jp: "こうえん",      romaji: "kōen",          es: "parque (público)" },
    { key: "v4",  jp: "としょかん",    romaji: "toshokan",      es: "biblioteca" },
    { key: "v5",  jp: "いりぐち",      romaji: "iriguchi",      es: "entrada" },
    { key: "v6",  jp: "でぐち",        romaji: "deguchi",       es: "salida" },
    { key: "v7",  jp: "そと",          romaji: "soto",          es: "afuera" },
    { key: "v8",  jp: "しずか（な）",  romaji: "shizuka(na)",   es: "tranquilo (adjetivo na)" },
    { key: "v9",  jp: "とめる",        romaji: "tomeru",        es: "detener; estacionar" },
    { key: "v10", jp: "すわる",        romaji: "suwaru",        es: "sentarse" },
    { key: "v11", jp: "すてる",        romaji: "suteru",        es: "tirar (botar basura)" },
    { key: "v12", jp: "しゃしん",      romaji: "shashin",       es: "foto" },
    { key: "v13", jp: "いんしょく",    romaji: "inshoku",       es: "comer y beber" },
    { key: "v14", jp: "はいる",        romaji: "hairu",         es: "entrar" },
    { key: "v15", jp: "でる",          romaji: "deru",          es: "salir" },
    { key: "v16", jp: "たばこ",        romaji: "tabako",        es: "tabaco; cigarro" },
    { key: "v17", jp: "きょうしつ",    romaji: "kyōshitsu",     es: "aula; salón" },
    { key: "v18", jp: "おと",          romaji: "oto",           es: "sonido; ruido" },
  ],

  oraciones6: [
    { key: "o1", jp: "ここで しゃしんを とっても いいですか。", romaji: "Koko de shashin o tottemo ii desu ka.", es: "¿Puedo tomar fotos aquí?", exp: "Pedir permiso: 〜てもいいですか。" },
    { key: "o2", jp: "きょうしつで いんしょくしては いけません。", romaji: "Kyōshitsu de inshoku shite wa ikemasen.", es: "No se puede comer y beber en el salón.", exp: "Prohibición: 〜てはいけません。" },
    { key: "o3", jp: "こうえんで すわっても いいです。", romaji: "Kōen de suwatte mo ii desu.", es: "En el parque, está permitido sentarse.", exp: "Afirmar permiso." },
    { key: "o4", jp: "ここに くるまを とめては いけない。", romaji: "Koko ni kuruma o tomete wa ikenai.", es: "Aquí no puedes estacionar el coche.", exp: "Coloquial: 〜てはいけない → 〜ちゃだめ (informal)." },
    { key: "o5", jp: "としょかんでは しずかに して ください。", romaji: "Toshokan de wa shizuka ni shite kudasai.", es: "En la biblioteca, por favor mantén silencio.", exp: "Regla suave con 〜てください (no prohibición fuerte)." },
    { key: "o6", jp: "ごみを すてては いけません。", romaji: "Gomi o sutete wa ikemasen.", es: "No se permite tirar basura.", exp: "Prohibición con verbo en て-forma + はいけません。" },
  ],

  gramatica: {
    titulo: "Como en primaria: pedir permiso y decir ‘no se puede’",
    puntos: [
      {
        regla: "① 〜てもいい（です）— permiso",
        pasoapaso: [
          "Usa la forma て del verbo + もいい（です）。",
          "Pregunta cortés: 〜てもいいですか。",
          "Respuesta afirmativa: はい、いいです／どうぞ。",
          "Respuesta negativa suave: すみません、ちょっと…（だめです）。",
        ],
        ejemploJP: "ここで すわっても いいですか。",
        ejemploRoma: "Koko de suwatte mo ii desu ka.",
        ejemploES: "¿Puedo sentarme aquí?",
        tabla: {
          headers: ["Tipo", "Base (JP)", "Forma て", "＋もいい（JP）", "Romaji"],
          rows: [
            ["五段（u）", "入る（はいる）", "入って", "入ってもいい", "hairu → haitte mo ii"],
            ["一段（ru）", "出る（でる）", "出て", "出てもいい", "deru → dete mo ii"],
            ["い形容詞", "静か（×い形容詞ではない）", "—", "（形容詞では使わない）", "—"],
            ["名詞", "入場（にゅうじょう）", "—", "入場してもいい", "nyūjō shite mo ii"],
          ],
        },
      },
      {
        regla: "② 〜てはいけない（です）— prohibición",
        pasoapaso: [
          "Forma て + はいけない。‘No debes / No se permite’.",
          "Formal: 〜てはいけません。",
          "Coloquial fuerte: 〜ちゃだめ（＝ てはだめ）。",
          "Se usa en reglas, señales, normas.",
        ],
        ejemploJP: "ここで たばこを すっては いけません。",
        ejemploRoma: "Koko de tabako o sutte wa ikemasen.",
        ejemploES: "Aquí no se puede fumar.",
        tabla: {
          headers: ["Tipo", "Base (JP)", "Forma て", "＋てはいけない（JP）", "Romaji"],
          rows: [
            ["五段（u）", "止める（とめる/五段扱い例: とる→とって）", "とって", "とってはいけない", "totte wa ikenai"],
            ["一段（ru）", "捨てる（すてる）", "捨てて", "捨ててはいけない", "sutete wa ikenai"],
            ["名詞（行為）", "飲食", "して", "飲食してはいけない", "inshoku shite wa ikenai"],
            ["場所", "教室", "で", "教室で〜てはいけない", "kyōshitsu de ~ te wa ikenai"],
          ],
        },
      },
    {
  regla: "③ Ocho oraciones de ejemplo (con el vocab de esta lección)",
  pasoapaso: [
    "Usa 〜てもいい para permiso y 〜てはいけない para prohibición.",
    "Todos los ejemplos usan vocabulario del tema 25 (parque, biblioteca, entrada/salida, etc.)."
  ],
  ejemplos: [
    { jp: "こうえんで すわっても いいです。", roma: "Kōen de suwatte mo ii desu.", es: "Está permitido sentarse en el parque." },
    { jp: "としょかんでは おとを おおきく しては いけません。", roma: "Toshokan de wa oto o ōkiku shite wa ikemasen.", es: "En la biblioteca no se puede subir el volumen." },
    { jp: "いりぐちから はいっても いいですか。", roma: "Iriguchi kara haitte mo ii desu ka.", es: "¿Puedo entrar por la entrada?" },
    { jp: "でぐちから はいっては いけません。", roma: "Deguchi kara haitte wa ikemasen.", es: "No se puede entrar por la salida." },
    { jp: "そとで たばこを すっても いいですか。", roma: "Soto de tabako o sutte mo ii desu ka.", es: "¿Se puede fumar afuera?" },
    { jp: "ここに くるまを とめては いけない。", roma: "Koko ni kuruma o tomete wa ikenai.", es: "Aquí no debes estacionar el coche." },
    { jp: "しずかに すれば、ここで べんきょうしても いいです。", roma: "Shizuka ni sureba, koko de benkyō shite mo ii desu.", es: "Si guardas silencio, puedes estudiar aquí." },
    { jp: "ごみを すてては いけません。", roma: "Gomi o sutete wa ikemasen.", es: "No se permite tirar basura." }
  ]
}

    ],
  },

  dialogos: [
    {
      title: "Entrada del museo",
      kana: [
        "A: ここから はいっても いいですか。",
        "B: はい、こちらが いりぐちです。",
        "A: しゃしんは いいですか。",
        "B: すみません、しゃしんは きんしです。"
      ],
      kanji: [
        "A: ここから 入っても いいですか。",
        "B: はい、こちらが 入口です。",
        "A: 写真は いいですか。",
        "B: すみません、写真は 禁止です。"
      ],
      es: [
        "A: ¿Puedo entrar por aquí?",
        "B: Sí, esta es la entrada.",
        "A: ¿Se permiten fotos?",
        "B: Disculpe, las fotos están prohibidas."
      ]
    },
    {
      title: "En la biblioteca",
      kana: [
        "A: としょかんで いんしょくしても いいですか。",
        "B: いいえ、いけません。",
        "A: じゃ、そとで たべます。",
        "B: はい、そとなら いいです。"
      ],
      kanji: [
        "A: 図書館で 飲食しても いいですか。",
        "B: いいえ、いけません。",
        "A: じゃ、外で 食べます。",
        "B: はい、外なら いいです。"
      ],
      es: [
        "A: ¿Puedo comer/beber en la biblioteca?",
        "B: No, no se puede.",
        "A: Entonces comeré afuera.",
        "B: Sí, afuera está permitido."
      ]
    },
    {
      title: "Silencio, por favor",
      kana: [
        "A: ここは しずかに しなければ いけませんか。",
        "B: はい、しずかに してください。",
        "A: おとを 大きく しては いけないですね。",
        "B: そうです。"
      ],
      kanji: [
        "A: ここは 静かに しなければ いけませんか。",
        "B: はい、静かに してください。",
        "A: 音を 大きく しては いけないですね。",
        "B: そうです。"
      ],
      es: [
        "A: ¿Aquí hay que estar en silencio?",
        "B: Sí, por favor, guarden silencio.",
        "A: No debemos subir el volumen, ¿verdad?",
        "B: Así es."
      ]
    },
    {
      title: "Prohibido estacionar",
      kana: [
        "A: ここに くるまを とめても いい？",
        "B: だめだよ。ここは とめては いけない。",
        "A: じゃ、そとの ちゅうしゃじょうに とめる。"
      ],
      kanji: [
        "A: ここに 車を 止めても いい？",
        "B: だめだよ。ここは 止めては いけない。",
        "A: じゃ、外の 駐車場に 止める。"
      ],
      es: [
        "A: ¿Puedo estacionar aquí?",
        "B: No. Aquí está prohibido estacionar.",
        "A: Entonces lo dejo en el estacionamiento de afuera."
      ]
    },
    {
      title: "Circulación",
      kana: [
        "A: でぐちから はいっては いけないよ。",
        "B: あ、そうか。いりぐちは あっちだね。",
        "A: うん、こっちは でぐち。"
      ],
      kanji: [
        "A: 出口から 入っては いけないよ。",
        "B: あ、そうか。入口は あっちだね。",
        "A: うん、こっちは 出口。"
      ],
      es: [
        "A: No debes entrar por la salida.",
        "B: Ah, ya veo. La entrada está por allá.",
        "A: Sí, por aquí es la salida."
      ]
    },
    {
      title: "En el parque",
      kana: [
        "A: こうえんで あそんでも いい？",
        "B: もちろん。ごみは すてては いけないよ。",
        "A: わかった。"
      ],
      kanji: [
        "A: 公園で 遊んでも いい？",
        "B: もちろん。ごみは 捨てては いけないよ。",
        "A: わかった。"
      ],
      es: [
        "A: ¿Puedo jugar en el parque?",
        "B: Claro. No tires basura.",
        "A: Entendido."
      ]
    },
    {
      title: "Zona tranquila",
      kana: [
        "A: ここで はなしても いいですか。",
        "B: すみません、ここは しずかに してください。",
        "A: じゃ、そとで はなします。"
      ],
      kanji: [
        "A: ここで 話しても いいですか。",
        "B: すみません、ここは 静かに してください。",
        "A: じゃ、外で 話します。"
      ],
      es: [
        "A: ¿Podemos conversar aquí?",
        "B: Disculpe, aquí por favor mantengan silencio.",
        "A: Entonces hablamos afuera."
      ]
    },
  ],

  quizSets: [
    [
      "A: ここから はいっても いいですか。",
      "B: はい、こちらが いりぐちです。",
      "A: しゃしんは いいですか。",
      "B: すみません、しゃしんは きんしです。"
    ],
    [
      "A: としょかんで いんしょくしても いいですか。",
      "B: いいえ、いけません。",
      "A: じゃ、そとで たべます。",
      "B: はい、そとなら いいです。"
    ],
    [
      "A: ここに くるまを とめても いい？",
      "B: だめ。ここは とめては いけないよ。",
      "A: じゃ、そとの ちゅうしゃじょうに いく。"
    ],
    [
      "A: でぐちから はいっては いけないよ。",
      "B: あ、いりぐちは どこ？",
      "A: あっち。"
    ],
    [
      "A: ここで はなしても いいですか。",
      "B: すみません、しずかに してください。",
      "A: では、そとで はなします。"
    ],
    [
      "A: こうえんで あそんでも いい？",
      "B: もちろん。でも ごみは すてては いけないよ。",
      "A: わかった。"
    ],
  ],

  kanji10: [
    {
      ch: "入", kun: ["はい(る)", "い(れる)"], on: ["ニュウ"],
      es: "entrar / introducir", trazos: 2, strokeCode: "5165",
      ej: [{ jp: "入口", yomi: "いりぐち", es: "entrada" }, { jp: "入場", yomi: "にゅうじょう", es: "entrada (acceso)" }]
    },
    {
      ch: "出", kun: ["で(る)", "だ(す)"], on: ["シュツ"],
      es: "salir / sacar", trazos: 5, strokeCode: "51fa",
      ej: [{ jp: "出口", yomi: "でぐち", es: "salida" }, { jp: "出発", yomi: "しゅっぱつ", es: "salida (partida)" }]
    },
    {
      ch: "外", kun: ["そと", "ほか"], on: ["ガイ"],
      es: "afuera / exterior", trazos: 5, strokeCode: "5916",
      ej: [{ jp: "外", yomi: "そと", es: "afuera" }, { jp: "外国", yomi: "がいこく", es: "país extranjero" }]
    },
    {
      ch: "公", kun: [], on: ["コウ"],
      es: "público", trazos: 4, strokeCode: "516c",
      ej: [{ jp: "公園", yomi: "こうえん", es: "parque público" }, { jp: "公立", yomi: "こうりつ", es: "público (institución)" }]
    },
    {
      ch: "園", kun: ["その"], on: ["エン"],
      es: "jardín / parque", trazos: 13, strokeCode: "5712",
      ej: [{ jp: "公園", yomi: "こうえん", es: "parque" }, { jp: "動物園", yomi: "どうぶつえん", es: "zoológico" }]
    },
    {
      ch: "止", kun: ["と(まる)", "と(める)"], on: ["シ"],
      es: "detener / parar", trazos: 4, strokeCode: "6b62",
      ej: [{ jp: "止まる", yomi: "とまる", es: "detenerse" }, { jp: "中止", yomi: "ちゅうし", es: "suspensión" }]
    },
    {
      ch: "可", kun: [], on: ["カ"],
      es: "posible / permitido", trazos: 5, strokeCode: "53ef",
      ej: [{ jp: "可", yomi: "か", es: "aprobado / permitido" }, { jp: "可能", yomi: "かのう", es: "posibilidad" }]
    },
    {
      ch: "禁", kun: [], on: ["キン"],
      es: "prohibir", trazos: 13, strokeCode: "7981",
      ej: [{ jp: "禁止", yomi: "きんし", es: "prohibición" }, { jp: "禁煙", yomi: "きんえん", es: "prohibido fumar" }]
    },
    {
      ch: "静", kun: ["しず(か)"], on: ["セイ", "ジョウ"],
      es: "tranquilo / quieto", trazos: 14, strokeCode: "9759",
      ej: [{ jp: "静か", yomi: "しずか", es: "tranquilo" }, { jp: "静止", yomi: "せいし", es: "inmovilidad" }]
    },
    {
      ch: "館", kun: [], on: ["カン"],
      es: "edificio (institución)", trazos: 16, strokeCode: "9928",
      ej: [{ jp: "図書館", yomi: "としょかん", es: "biblioteca" }, { jp: "旅館", yomi: "りょかん", es: "posada japonesa" }]
    },
  ],
};

export default TEMA_25;
