// src/content/n4/22.ts
import type { ThemeContent } from "../types";

// Tema 22 — Cambios y transformaciones: 「〜になる」「〜ようになる」
export const TEMA_22: ThemeContent = {
  id: 22,
  nivel: "N4",
  titulo: "Cambios y transformaciones – 「〜になる」「〜ようになる」",

  objetivos: [
    "Usar 〜になる con sustantivos y adjetivos（Aい→Aくなる／Aな→Aになる）.",
    "Expresar cambio de habilidad o hábito con 〜ようになる（V辞書・Vない・可能形）.",
    "Distinguir 〜ようになる (cambio natural) vs 〜ようにする (esfuerzo voluntario).",
    "Describir cambios graduales（だんだん／少しずつ／もっと） y resultados.",
    "Conectar cambios con causa simple（から／ので） sin perder claridad.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "変わる", romaji: "kawaru", es: "cambiar (intr.)" },
    { key: "vc02", jp: "変える", romaji: "kaeru", es: "cambiar (tr.)" },
    { key: "vc03", jp: "強い", romaji: "tsuyoi", es: "fuerte" },
    { key: "vc04", jp: "弱い", romaji: "yowai", es: "débil" },
    { key: "vc05", jp: "新しい", romaji: "atarashii", es: "nuevo" },
    { key: "vc06", jp: "古い", romaji: "furui", es: "viejo, antiguo" },
    { key: "vc07", jp: "増える", romaji: "fueru", es: "aumentar (intr.)" },
    { key: "vc08", jp: "減る", romaji: "heru", es: "disminuir (intr.)" },
    { key: "vc09", jp: "始める／始まる", romaji: "hajimeru / hajimaru", es: "empezar (tr./intr.)" },
    { key: "vc10", jp: "終わる", romaji: "owaru", es: "terminar" },
    { key: "vc11", jp: "だんだん", romaji: "dandan", es: "poco a poco" },
    { key: "vc12", jp: "少しずつ", romaji: "sukoshi zutsu", es: "gradualmente" },
    { key: "vc13", jp: "もっと", romaji: "motto", es: "más" },
    { key: "vc14", jp: "上手（な）", romaji: "jōzu (na)", es: "hábil (ya visto)" },
    { key: "vc15", jp: "下手（な）", romaji: "heta (na)", es: "poco hábil" },
    { key: "vc16", jp: "できる", romaji: "dekiru", es: "poder / saber hacer (posible)" },
    { key: "vc17", jp: "習慣", romaji: "shūkan", es: "hábito (usa kana si prefieres)" },
    { key: "vc18", jp: "練習（する）", romaji: "renshū (suru)", es: "práctica / practicar" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "日本語 が だんだん 上手 に なりました。",
      romaji: "nihongo ga dandan jōzu ni narimashita.",
      es: "Mi japonés se volvió poco a poco más hábil.",
      exp: "Aな → Aに＋なる（上手に・きれいに など）."
    },
    {
      key: "ex02",
      jp: "冬 は 早く 暗く なります。",
      romaji: "fuyu wa hayaku kuraku narimasu.",
      es: "En invierno se vuelve oscuro temprano.",
      exp: "Aい → Aく＋なる（あつい→あつく なる／くらい→くらく なる）."
    },
    {
      key: "ex03",
      jp: "大学生 に なって、生活 が 変わりました。",
      romaji: "daigakusei ni natte, seikatsu ga kawarimashita.",
      es: "Al convertirme en universitario, mi vida cambió.",
      exp: "N＋に なる：‘convertirse en N’."
    },
    {
      key: "ex04",
      jp: "毎日 れんしゅう した ので、話せる ように なりました。",
      romaji: "mainichi renshū shita no de, hanaseru yō ni narimashita.",
      es: "Como practiqué a diario, llegué a poder hablar.",
      exp: "可能形＋ように なる：cambio de habilidad."
    },
    {
      key: "ex05",
      jp: "甘い もの を あまり 食べない ように なりました。",
      romaji: "amai mono o amari tabenai yō ni narimashita.",
      es: "He llegado a no comer muchos dulces.",
      exp: "Vない＋ように なる：cambio de costumbre（dejar de…）."
    },
    {
      key: "ex06",
      jp: "新しい 仕事 が 始まって から、早く 起きる ように なりました。",
      romaji: "atarashii shigoto ga hajimatte kara, hayaku okiru yō ni narimashita.",
      es: "Desde que empezó el trabajo nuevo, ahora me levanto temprano.",
      exp: "V辞＋ように なる：se forma un nuevo hábito."
    },
  ],

  // Gramática “como en primaria”
  gramatica: {
    titulo: "Cambios: 〜になる／〜ようになる",
    puntos: [
      {
        key: "g01",
        regla: "① 〜になる（volverse／convertirse）",
        pasoapaso: [
          "1) Con sustantivo: N＋に なる → ‘convertirse en N’.",
          "2) Con Aい: Aい → Aく＋なる → ‘volverse A’（あつい→あつくなる）.",
          "3) Con Aな: Aな → Aに＋なる → ‘volverse A’（べんり→べんりに なる）.",
          "4) Con adverbios de grado: だんだん／少しずつ／もっと para matizar.",
        ],
        ejemploJP: "古い 町 が 新しく なりました。",
        ejemploRoma: "furui machi ga atarashiku narimashita.",
        ejemploES: "La ciudad vieja se volvió nueva (se renovó).",
        tabla: {
          title: "Cómo se une 〜になる",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Sustantivo", "N＋に なる", "先生 に なる。", "sensei ni naru.", "Volverse profesor."],
            ["Aい", "Aい→Aく なる", "弱く なる。", "yowaku naru.", "Volverse débil."],
            ["Aな", "Aな→Aに なる", "便利 に なる。", "benri ni naru.", "Volverse conveniente."],
            ["Grado", "だんだん／少しずつ", "だんだん 強く なる。", "dandan tsuyoku naru.", "Volverse más fuerte poco a poco."],
          ],
          note: "‘〜になってから’ marca el punto de cambio (‘desde que se volvió…’)."
        },
        ejemplos: [
          { jp: "気温 が 低く なりました。", roma: "kion ga hikuku narimashita.", es: "La temperatura se hizo más baja." },
          { jp: "日本語 の 発音 が 上手 に なった。", roma: "nihongo no hatsuon ga jōzu ni natta.", es: "La pronunciación de japonés se volvió mejor." },
          { jp: "父 は しごと で 忙しく なった。", roma: "chichi wa shigoto de isogashiku natta.", es: "Mi padre se volvió ocupado por el trabajo." },
        ],
      },

      {
        key: "g02",
        regla: "② 〜ようになる（llegar a poder / empezar a… / dejar de…）",
        pasoapaso: [
          "1) V辞書＋ように なる：llegar a hacer algo con regularidad.",
          "2) 可能形＋ように なる：llegar a poder hacer algo.",
          "3) Vない＋ように なる：llegar a no hacer (cambio de costumbre).",
          "4) Diferencia: 〜ようになる = cambio natural／resultado; 〜ようにする = esfuerzo voluntario.",
        ],
        ejemploJP: "毎日 よみます → 毎日 よむ ように なりました。",
        ejemploRoma: "mainichi yomimasu → mainichi yomu yō ni narimashita.",
        ejemploES: "Leo a diario → (ahora) he llegado a leer a diario.",
        tabla: {
          title: "Formas con 〜ようになる",
          headers: ["Meta", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Hábito", "V辞＋ように なる", "早く 起きる ように なる。", "hayaku okiru yō ni naru.", "Llegar a levantarse temprano."],
            ["Habilidad", "可能形＋ように なる", "話せる ように なる。", "hanaseru yō ni naru.", "Llegar a poder hablar."],
            ["Dejar de", "Vない＋ように なる", "あまり 食べない ように なる。", "amari tabenai yō ni naru.", "Llegar a no comer mucho."],
          ],
          note: "‘〜ようにする’ = ‘intentar/forzarse’; ‘〜ようになる’ = ‘llegó a ser así’."
        },
        ejemplos: [
          { jp: "日本語 で メール が 書ける ように なった。", roma: "nihongo de mēru ga kakeru yō ni natta.", es: "Llegué a poder escribir emails en japonés." },
          { jp: "夜更かし を しない ように なりました。", roma: "yofukashi o shinai yō ni narimashita.", es: "He llegado a no desvelarme." },
          { jp: "じしん が ついて、人前 で 話す ように なりました。", roma: "jishin ga tsuite, hitomae de hanasu yō ni narimashita.", es: "Con confianza, ahora hablo en público." },
        ],
      },

      {
        key: "g03",
        regla: "③ Mini comparativa（になる vs ようになる）",
        pasoapaso: [
          "A) になる → estado que cambia（adjetivo/sustantivo).",
          "B) ようになる → conducta/habilidad que aparece o cesa.",
          "C) Se pueden combinar con だんだん／少しずつ para cambio gradual."
        ],
        ejemploJP: "だんだん 早起き に なって、走る ように なった。",
        ejemploRoma: "dandan hayaoki ni natte, hashiru yō ni natta.",
        ejemploES: "Poco a poco me volví madrugador y empecé a correr.",
      },
    ],
  },

  // 7 diálogos (kana/kanji/es) TTS-friendly
  dialogos: [
    {
      title: "だんだん上手に",
      kana: [
        "日本語 が だんだん 上手 に なりました。",
        "すごい ですね。どの ぐらい れんしゅう しました か。",
        "毎日 少しずつ しました。"
      ],
      kanji: [
        "日本語 が だんだん 上手 に なりました。",
        "すごい ですね。どの ぐらい 練習 しました か。",
        "毎日 少しずつ しました。"
      ],
      es: [
        "Tu japonés se volvió poco a poco más bueno.",
        "¡Genial! ¿Cuánto practicaste?",
        "Un poco cada día."
      ]
    },
    {
      title: "できるようになる",
      kana: [
        "ニュース が 少し 分かる ように なりました。",
        "いい ですね。むずかしい ことば も 分かります か。",
        "まだ ですが、もっと がんばります。"
      ],
      kanji: [
        "ニュース が 少し 分かる ように なりました。",
        "いい ですね。難しい 言葉 も 分かります か。",
        "まだ ですが、もっと がんばります。"
      ],
      es: [
        "Llegué a entender un poco las noticias.",
        "Bien. ¿También entiendes palabras difíciles?",
        "Aún no, pero me esforzaré más."
      ]
    },
    {
      title: "習慣が変わる",
      kana: [
        "あまい もの を 食べない ように なりました。",
        "健康 に なります ね。",
        "はい。体重 も 少し 減りました。"
      ],
      kanji: [
        "甘い もの を 食べない ように なりました。",
        "健康 に なります ね。",
        "はい。体重 も 少し 減りました。"
      ],
      es: [
        "He llegado a no comer dulces.",
        "Eso te vuelve más saludable.",
        "Sí, también bajé un poco de peso."
      ]
    },
    {
      title: "新しい生活",
      kana: [
        "大学生 に なって、生活 が 変わりました。",
        "どんな ふう に 変わりました か。",
        "自分 で 料理 する ように なりました。"
      ],
      kanji: [
        "大学生 に なって、生活 が 変わりました。",
        "どんな ふう に 変わりました か。",
        "自分 で 料理 する ように なりました。"
      ],
      es: [
        "Al volverme universitario, mi vida cambió.",
        "¿En qué sentido cambió?",
        "Ahora cocino por mí mismo."
      ]
    },
    {
      title: "強くなる",
      kana: [
        "毎日 トレーニング して、強く なりました。",
        "すごい。大会 に 出られる ように なりました か。",
        "はい、今年 は 出ます。"
      ],
      kanji: [
        "毎日 トレーニング して、強く なりました。",
        "すごい。大会 に 出られる ように なりました か。",
        "はい、今年 は 出ます。"
      ],
      es: [
        "Entrené a diario y me hice más fuerte.",
        "¿Ya llegaste a poder participar en torneos?",
        "Sí, este año participaré."
      ]
    },
    {
      title: "古い→新しい",
      kana: [
        "町 は 古く て ふべん でした が、新しく なりました。",
        "便利 に なって、店 も 増えました ね。",
        "はい、生活 が 楽 に なりました。"
      ],
      kanji: [
        "町 は 古く て 不便 でした が、新しく なりました。",
        "便利 に なって、店 も 増えました ね。",
        "はい、生活 が 楽 に なりました。"
      ],
      es: [
        "La ciudad era vieja e incómoda, pero se renovó.",
        "Se volvió conveniente y aumentaron las tiendas, ¿no?",
        "Sí, la vida se hizo más fácil."
      ]
    },
    {
      title: "ようにする vs ようになる",
      kana: [
        "早く 起きる ように して います。",
        "へえ。最近 は、早く 起きる ように なりました か。",
        "はい、休み の 日 も 起きる ように なりました。"
      ],
      kanji: [
        "早く 起きる ように して います。",
        "へえ。最近 は、早く 起きる ように なりました か。",
        "はい、休み の 日 も 起きる ように なりました。"
      ],
      es: [
        "Estoy intentando levantarme temprano.",
        "¿Y últimamente ya llegaste a levantarte temprano?",
        "Sí, incluso en días libres."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: だんだん 日本語 が 上手 に なりました。",
      "B: すごい。何 を しました か。",
      "A: 毎日 練習 しました。"
    ],
    [
      "A: 走れる ように なりました。",
      "B: 本当？どの くらい 走れます か。",
      "A: 3キロ ぐらい です。"
    ],
    [
      "A: 甘い もの を 食べない ように なりました。",
      "B: いい 習慣 ですね。",
      "A: はい、体重 が 減りました。"
    ],
    [
      "A: 大学生 に なって、生活 が 変わりました。",
      "B: どう 変わりました か。",
      "A: 自分 で 料理 する ように なりました。"
    ],
    [
      "A: 町 は 新しく なりました ね。",
      "B: はい。店 が 増えました。",
      "A: 便利 に なりました。"
    ],
    [
      "A: 早く 起きる ように して います。",
      "B: へえ。起きる ように なりました か。",
      "A: はい、毎朝 6時 です。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — no repetidos en N4 previos aquí
  kanji10: [
    {
      ch: "変",
      kun: ["か(わる)","か(える)"],
      on: ["へん"],
      es: "cambiar",
      trazos: 9,
      strokeCode: "5909",
      ej: [
        { jp: "変わる", yomi: "かわる", es: "cambiar (intr.)" },
        { jp: "変える", yomi: "かえる", es: "cambiar (tr.)" }
      ]
    },
    {
      ch: "化",
      kun: ["ば(ける)"],
      on: ["か","け"],
      es: "transformar; cambio",
      trazos: 4,
      strokeCode: "5316",
      ej: [
        { jp: "文化", yomi: "ぶんか", es: "cultura" },
        { jp: "化学", yomi: "かがく", es: "química" }
      ]
    },
    {
      ch: "新",
      kun: ["あたら(しい)"],
      on: ["しん"],
      es: "nuevo",
      trazos: 13,
      strokeCode: "65b0",
      ej: [
        { jp: "新しい", yomi: "あたらしい", es: "nuevo" },
        { jp: "新聞", yomi: "しんぶん", es: "periódico" }
      ]
    },
    {
      ch: "古",
      kun: ["ふる(い)"],
      on: ["こ"],
      es: "viejo",
      trazos: 5,
      strokeCode: "53e4",
      ej: [
        { jp: "古い", yomi: "ふるい", es: "viejo" },
        { jp: "中古", yomi: "ちゅうこ", es: "usado/segunda mano" }
      ]
    },
    {
      ch: "強",
      kun: ["つよ(い)","つよ(める)"],
      on: ["きょう","ごう"],
      es: "fuerte; fortalecer",
      trazos: 11,
      strokeCode: "5f37",
      ej: [
        { jp: "強い", yomi: "つよい", es: "fuerte" },
        { jp: "勉強", yomi: "べんきょう", es: "estudio" }
      ]
    },
    {
      ch: "弱",
      kun: ["よわ(い)","よわ(める)"],
      on: ["じゃく"],
      es: "débil; debilitar",
      trazos: 10,
      strokeCode: "5f31",
      ej: [
        { jp: "弱い", yomi: "よわい", es: "débil" },
        { jp: "弱点", yomi: "じゃくてん", es: "punto débil" }
      ]
    },
    {
      ch: "増",
      kun: ["ふ(える)","ふ(やす)"],
      on: ["ぞう"],
      es: "aumentar",
      trazos: 14,
      strokeCode: "5897",
      ej: [
        { jp: "増える", yomi: "ふえる", es: "aumentar (intr.)" },
        { jp: "増やす", yomi: "ふやす", es: "aumentar (tr.)" }
      ]
    },
    {
      ch: "減",
      kun: ["へ(る)","へ(らす)"],
      on: ["げん"],
      es: "disminuir",
      trazos: 12,
      strokeCode: "6e1b",
      ej: [
        { jp: "減る", yomi: "へる", es: "disminuir (intr.)" },
        { jp: "減らす", yomi: "へらす", es: "disminuir (tr.)" }
      ]
    },
    {
      ch: "始",
      kun: ["はじ(める)","はじ(まる)"],
      on: ["し"],
      es: "empezar",
      trazos: 8,
      strokeCode: "59cb",
      ej: [
        { jp: "始める", yomi: "はじめる", es: "empezar (tr.)" },
        { jp: "始まる", yomi: "はじまる", es: "empezar (intr.)" }
      ]
    },
    {
      ch: "終",
      kun: ["お(わる)","お(える)"],
      on: ["しゅう"],
      es: "terminar",
      trazos: 11,
      strokeCode: "7d42",
      ej: [
        { jp: "終わる", yomi: "おわる", es: "terminar (intr.)" },
        { jp: "終える", yomi: "おえる", es: "terminar (tr.)" }
      ]
    },
  ],
};

export default TEMA_22;
