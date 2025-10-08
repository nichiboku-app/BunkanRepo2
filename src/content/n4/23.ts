// src/content/n4/23.ts
import { type ThemeContent } from "./types"; // ajusta si tu ThemeContent vive en otra ruta

const TEMA_23: ThemeContent = {
  numero: 23,
  emoji: "📢",
  titulo: "Dar opiniones y consejos",
  subtitulo: "「〜たほうがいい」「〜べき」",

  objetivos: [
    "Dar consejos suaves con 〜たほうがいい／〜ないほうがいい",
    "Expresar obligación/criterio fuerte con 〜べき／〜べきではない",
    "Elegir el matiz correcto según el contexto (suave vs. fuerte)",
    "Usar vocabulario de salud, estudio y hábitos para opinar",
    "Practicar pasado + ほうがいい y diccionario + べき",
  ],

  vocabClase: [
    { key: "v1",  jp: "けんこう",        romaji: "kenkō",            es: "salud" },
    { key: "v2",  jp: "ねつ",            romaji: "netsu",            es: "fiebre" },
    { key: "v3",  jp: "くすり",          romaji: "kusuri",           es: "medicina" },
    { key: "v4",  jp: "やすむ",          romaji: "yasumu",           es: "descansar; ausentarse" },
    { key: "v5",  jp: "はやく",          romaji: "hayaku",           es: "temprano; rápido" },
    { key: "v6",  jp: "おそく",          romaji: "osoku",            es: "tarde; lento" },
    { key: "v7",  jp: "むり",            romaji: "muri",             es: "exceso; forzarse" },
    { key: "v8",  jp: "しゅうかん",      romaji: "shūkan",           es: "hábito" },
    { key: "v9",  jp: "ふくしゅう",      romaji: "fukushū",          es: "repaso (estudio)" },
    { key: "v10", jp: "れんしゅう",      romaji: "renshū",           es: "práctica" },
    { key: "v11", jp: "そうだん",        romaji: "sōdan",            es: "consulta; pedir consejo" },
    { key: "v12", jp: "たいせつ",        romaji: "taisetsu",         es: "importante" },
    { key: "v13", jp: "べき",            romaji: "beki",             es: "deber (fuerte)" },
    { key: "v14", jp: "したほうがいい",  romaji: "shita hō ga ii",   es: "es mejor hacer (consejo)" },
    { key: "v15", jp: "しないほうがいい",romaji: "shinai hō ga ii",  es: "es mejor no hacer (consejo)" },
  ],

  oraciones6: [
    {
      key: "o1",
      jp: "ねつがあるなら、やすんだほうがいいよ。",
      romaji: "Netsu ga aru nara, yasunda hō ga ii yo.",
      es: "Si tienes fiebre, es mejor que descanses.",
      exp: "Consejo suave con 〜たほうがいい (pasado)."
    },
    {
      key: "o2",
      jp: "むりをしないほうがいいです。",
      romaji: "Muri o shinai hō ga ii desu.",
      es: "Es mejor no exigirte demasiado.",
      exp: "Consejo negativo: 〜ないほうがいい."
    },
    {
      key: "o3",
      jp: "たいせつなテストだから、はやくねるべきだ。",
      romaji: "Taisetsu na tesuto dakara, hayaku neru beki da.",
      es: "Como es un examen importante, deberías dormir temprano.",
      exp: "〜べき expresa deber u obligación fuerte."
    },
    {
      key: "o4",
      jp: "まいにちすこしでも、れんしゅうしたほうがいい。",
      romaji: "Mainichi sukoshi demo, renshū shita hō ga ii.",
      es: "Aunque sea un poco, es mejor practicar cada día.",
      exp: "Hábito + consejo suave."
    },
    {
      key: "o5",
      jp: "ひとりでかいけつするより、せんせいにそうだんすべきだ。",
      romaji: "Hitori de kaiketsu suru yori, sensei ni sōdan subeki da.",
      es: "En lugar de resolverlo solo, deberías consultar al profesor.",
      exp: "べき con する → すべき (forma irregular común)."
    },
    {
      key: "o6",
      jp: "よるおそくまでおきないほうがいいよ。",
      romaji: "Yoru osoku made okinai hō ga ii yo.",
      es: "Es mejor no quedarse despierto hasta tarde.",
      exp: "Negación + 〜ないほうがいい para hábitos."
    },
  ],

  gramatica: {
    titulo: "Como en primaria: dar consejos claros",
    puntos: [
      {
        regla: "① 〜たほうがいい（です）",
        pasoapaso: [
          "Usa el PASADO del verbo + ほうがいい。",
          "Consejo suave / recomendación amable.",
          "Con personas cercanas: añade よ al final.",
        ],
        ejemploJP: "くすりを飲んだほうがいい。",
        ejemploRoma: "Kusuri o nonda hō ga ii.",
        ejemploES: "Es mejor tomar la medicina.",
        ejemplos: [
          { jp: "はやくねたほうがいい。", roma: "Hayaku neta hō ga ii.", es: "Es mejor dormir temprano." },
          { jp: "れんしゅうしたほうがいい。", roma: "Renshū shita hō ga ii.", es: "Es mejor practicar." },
        ]
      },
      {
        regla: "② 〜ないほうがいい（です）",
        pasoapaso: [
          "Usa la forma 〜ない del verbo + ほうがいい。",
          "Consejo negativo: 'mejor no ...'.",
        ],
        ejemploJP: "むりをしないほうがいい。",
        ejemploRoma: "Muri o shinai hō ga ii.",
        ejemploES: "Es mejor no forzarte.",
        ejemplos: [
          { jp: "よるおそくまでおきないほうがいい。", roma: "Yoru osoku made okinai hō ga ii.", es: "Es mejor no quedarse hasta tarde." },
        ]
      },
      {
        regla: "③ 〜べきだ／〜べきではない",
        pasoapaso: [
          "Diccionario + べき（だ）。",
          "Negativo: 〜べきではない。",
          "Matiz fuerte: norma u obligación personal.",
        ],
        ejemploJP: "まいにちふくしゅうすべきだ。",
        ejemploRoma: "Mainichi fukushū subeki da.",
        ejemploES: "Debes repasar todos los días.",
        ejemplos: [
          { jp: "うそをつくべきではない。", roma: "Uso o tsuku beki de wa nai.", es: "No debes mentir." },
        ]
      },
      {
        regla: "④ すべき（する＋べき）",
        pasoapaso: [
          "Con する → すべき。",
          "Ej.: 勉強する → 勉強すべき。",
        ],
        ejemploJP: "せんせいにそうだんすべきだ。",
        ejemploRoma: "Sensei ni sōdan subeki da.",
        ejemploES: "Deberías consultar al profesor."
      },
      {
        regla: "⑤ Matiz: elegir la fuerza",
        pasoapaso: [
          "〜たほうがいい：suave, suena amable.",
          "〜べき：fuerte, puede sonar rígido.",
          "En clase o con amigos: prefiere 〜たほうがいい.",
        ],
        ejemploJP: "テストのまえははやくねたほうがいい。",
        ejemploRoma: "Tesuto no mae wa hayaku neta hō ga ii.",
        ejemploES: "Antes del examen es mejor dormir temprano."
      }
    ]
  },

  dialogos: [
    {
      title: "Fiebre y descanso",
      kana: [
        "A: ねつがあるんだ。",
        "B: それなら、きょうはやすんだほうがいいよ。",
        "A: くすりも飲んだほうがいい？",
        "B: うん、むりしないほうがいい。"
      ],
      kanji: [
        "A: 熱があるんだ。",
        "B: それなら、今日は休んだほうがいいよ。",
        "A: 薬も飲んだほうがいい？",
        "B: うん、無理しないほうがいい。"
      ],
      es: [
        "A: Tengo fiebre.",
        "B: Entonces hoy es mejor que descanses.",
        "A: ¿También debería tomar medicina?",
        "B: Sí, mejor no te fuerces."
      ]
    },
    {
      title: "Antes del examen",
      kana: [
        "A: あしたテストだよね。",
        "B: はやくねたほうがいいよ。",
        "A: でも、まだべんきょうしたい…",
        "B: むりはすべきではない。"
      ],
      kanji: [
        "A: 明日テストだよね。",
        "B: 早く寝たほうがいいよ。",
        "A: でも、まだ勉強したい…",
        "B: 無理はすべきではない。"
      ],
      es: [
        "A: Mañana es el examen, ¿no?",
        "B: Es mejor dormir temprano.",
        "A: Pero aún quiero estudiar…",
        "B: No deberías forzarte."
      ]
    },
    {
      title: "Hábitos de estudio",
      kana: [
        "A: まいにちれんしゅうしてる？",
        "B: ううん、たまにだけ。",
        "A: すこしでも、まいにちしたほうがいい。",
        "B: わかった。ふくしゅうすべきだね。"
      ],
      kanji: [
        "A: 毎日練習してる？",
        "B: ううん、たまにだけ。",
        "A: 少しでも、毎日したほうがいい。",
        "B: わかった。復習すべきだね。"
      ],
      es: [
        "A: ¿Practicas todos los días?",
        "B: No, solo a veces.",
        "A: Aunque sea un poco, hazlo a diario.",
        "B: Entiendo. Debo repasar."
      ]
    },
    {
      title: "Llegar tarde",
      kana: [
        "A: いつもおそくまでおきてしまう。",
        "B: よるおそくまでおきないほうがいいよ。",
        "A: あさはやくおきるべき？",
        "B: うん、そのほうがけんこうにいい。"
      ],
      kanji: [
        "A: いつも遅くまで起きてしまう。",
        "B: 夜遅くまで起きないほうがいいよ。",
        "A: 朝早く起きるべき？",
        "B: うん、そのほうが健康にいい。"
      ],
      es: [
        "A: Siempre me desvelo.",
        "B: Es mejor no quedarse despierto hasta tarde.",
        "A: ¿Debería levantarme temprano?",
        "B: Sí, es mejor para la salud."
      ]
    },
    {
      title: "Redes sociales",
      kana: [
        "A: しごとのまえにSNSをみるくせがある。",
        "B: それはやめたほうがいい。",
        "A: かわりに、なにをするべき？",
        "B: たいせつなよういをすべきだよ。"
      ],
      kanji: [
        "A: 仕事の前にSNSを見る癖がある。",
        "B: それはやめたほうがいい。",
        "A: 代わりに、何をするべき？",
        "B: 大切な用意をすべきだよ。"
      ],
      es: [
        "A: Tengo la costumbre de ver redes antes del trabajo.",
        "B: Es mejor dejar eso.",
        "A: ¿Qué debería hacer en su lugar?",
        "B: Deberías preparar lo importante."
      ]
    },
    {
      title: "Pedir consejo al profe",
      kana: [
        "A: レポートがむずかしい…",
        "B: せんせいにそうだんしたほうがいいよ。",
        "A: じぶんでやるべきだとおもうけど…",
        "B: まずはたしかめるべきだ。"
      ],
      kanji: [
        "A: レポートが難しい…",
        "B: 先生に相談したほうがいいよ。",
        "A: 自分でやるべきだと思うけど…",
        "B: まずは確かめるべきだ。"
      ],
      es: [
        "A: El reporte es difícil…",
        "B: Es mejor consultarlo con el profesor.",
        "A: Creo que debería hacerlo solo…",
        "B: Primero deberías confirmar."
      ]
    },
    {
      title: "Consejo general",
      kana: [
        "A: けんこうのために、なにをすべき？",
        "B: うんどうして、ねむるじかんをまもるべきだよ。",
        "A: たべすぎは？",
        "B: しないほうがいいね。"
      ],
      kanji: [
        "A: 健康のために、何をすべき？",
        "B: 運動して、眠る時間を守るべきだよ。",
        "A: 食べ過ぎは？",
        "B: しないほうがいいね。"
      ],
      es: [
        "A: ¿Qué debería hacer por la salud?",
        "B: Hacer ejercicio y respetar las horas de sueño.",
        "A: ¿Y comer en exceso?",
        "B: Es mejor no hacerlo."
      ]
    },
  ],

  // 6 ejercicios tipo ordenar (OrderDialogCard)
  quizSets: [
    [
      "A: あしたテストだよね。",
      "B: はやくねたほうがいいよ。",
      "A: あさはやくおきるべき？",
      "B: むりはすべきではないよ。"
    ],
    [
      "A: ねつがあるんだ。",
      "B: きょうはやすんだほうがいいよ。",
      "A: くすりをのむべき？",
      "B: うん、のんだほうがいい。"
    ],
    [
      "A: よるおそくまでおきてる。",
      "B: おそくまでおきないほうがいいよ。",
      "A: まいにちすこしずつれんしゅうすべき？",
      "B: うん、そのほうがいいね。"
    ],
    [
      "A: レポートがむずかしい…",
      "B: せんせいにそうだんしたほうがいい。",
      "A: まずはしらべるべき？",
      "B: どちらもしたほうがいい。"
    ],
    [
      "A: SNSをみすぎてしまう。",
      "B: しごとのまえはみないほうがいい。",
      "A: かわりに、なにをするべき？",
      "B: よういをすべきだ。"
    ],
    [
      "A: しゅくだいをわすれた。",
      "B: つぎから、すぐにやるべきだよ。",
      "A: まいにちすこしずつしたほうがいいね。",
      "B: そう、それがいちばん。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — ej con objetos {jp, yomi, es}
  kanji10: [
    {
      ch: "必",
      kun: ["かなら(ず)"],
      on: ["ヒツ"],
      es: "necesario; sin falta",
      trazos: 5,
      strokeCode: "5fc5",
      ej: [
        { jp: "必要", yomi: "ひつよう", es: "necesario" },
        { jp: "必ず", yomi: "かならず", es: "sin falta" },
        { jp: "必死", yomi: "ひっし", es: "desesperado; a muerte" },
      ]
    },
    {
      ch: "要",
      kun: ["い(る)"],
      on: ["ヨウ"],
      es: "necesitar; punto clave",
      trazos: 9,
      strokeCode: "8981",
      ej: [
        { jp: "必要", yomi: "ひつよう", es: "necesario" },
        { jp: "要点", yomi: "ようてん", es: "punto clave" },
        { jp: "重要", yomi: "じゅうよう", es: "importante" },
      ]
    },
    {
      ch: "健",
      kun: ["すこ(やか)"],
      on: ["ケン"],
      es: "saludable",
      trazos: 11,
      strokeCode: "5065",
      ej: [
        { jp: "健康", yomi: "けんこう", es: "salud" },
        { jp: "健全", yomi: "けんぜん", es: "sano; correcto" },
      ]
    },
    {
      ch: "康",
      kun: [],
      on: ["コウ"],
      es: "salud; bienestar",
      trazos: 11,
      strokeCode: "5eb7",
      ej: [
        { jp: "健康", yomi: "けんこう", es: "salud" },
      ]
    },
    {
      ch: "早",
      kun: ["はや(い)"],
      on: ["ソウ", "サッ"],
      es: "temprano; rápido",
      trazos: 6,
      strokeCode: "65e9",
      ej: [
        { jp: "早起き", yomi: "はやおき", es: "madrugar" },
        { jp: "早速",   yomi: "さっそく", es: "de inmediato" },
      ]
    },
    {
      ch: "遅",
      kun: ["おそ(い)", "おく(れる)"],
      on: ["チ"],
      es: "tarde; retraso",
      trazos: 13,
      strokeCode: "9045",
      ej: [
        { jp: "遅刻", yomi: "ちこく", es: "llegar tarde" },
        { jp: "遅れる", yomi: "おくれる", es: "retrasarse" },
      ]
    },
    {
      ch: "習",
      kun: ["なら(う)"],
      on: ["シュウ"],
      es: "aprender; práctica",
      trazos: 11,
      strokeCode: "7fd2",
      ej: [
        { jp: "学習", yomi: "がくしゅう", es: "aprendizaje" },
        { jp: "習う", yomi: "ならう", es: "aprender (de alguien)" },
      ]
    },
    {
      ch: "練",
      kun: ["ね(る)"],
      on: ["レン"],
      es: "pulir; practicar",
      trazos: 14,
      strokeCode: "7df4",
      ej: [
        { jp: "練習", yomi: "れんしゅう", es: "práctica" },
        { jp: "訓練", yomi: "くんれん", es: "entrenamiento" },
      ]
    },
    {
      ch: "仕",
      kun: ["つか(える)"],
      on: ["シ", "ジ"],
      es: "servir; trabajo",
      trazos: 5,
      strokeCode: "4ed5",
      ej: [
        { jp: "仕事", yomi: "しごと", es: "trabajo" },
        { jp: "仕方", yomi: "しかた", es: "manera; forma" },
      ]
    },
    {
      ch: "困",
      kun: ["こま(る)"],
      on: ["コン"],
      es: "estar en problemas",
      trazos: 7,
      strokeCode: "56f0",
      ej: [
        { jp: "困難", yomi: "こんなん", es: "dificultad" },
        { jp: "困る", yomi: "こまる", es: "tener problemas" },
      ]
    },
  ],
};

export default TEMA_23;
