// src/content/n4/29.ts
import { type ThemeContent } from "./types";

const TEMA_29: ThemeContent = {
  numero: 29,
  emoji: "📊",
  titulo: "Expresiones complejas con partículas",
  subtitulo: "「〜について」「〜によって」「〜だけ」",

  objetivos: [
    "Usar N＋について para decir ‘acerca de…’ y N＋についての＋N2 (‘N2 relacionado con N’).",
    "Usar N＋によって para ‘según/por/mediante’ y como agente formal del pasivo.",
    "Usar N＋だけ para ‘solo/solamente’; patrones だけの, だけで, できるだけ.",
    "Distinguir sentidos y elegir la partícula correcta en contexto.",
    "Practicar con ejemplos cortos y claros (como en primaria) y TTS-friendly.",
  ],

  vocabClase: [
    { key: "v1",  jp: "トピック",            romaji: "topikku",         es: "tema / tópico" },
    { key: "v2",  jp: "れい（例）",          romaji: "rei",             es: "ejemplo" },
    { key: "v3",  jp: "べつ（別）",          romaji: "betsu",           es: "separado / distinto" },
    { key: "v4",  jp: "おなじ（同じ）",      romaji: "onaji",           es: "mismo / igual" },
    { key: "v5",  jp: "ほか（他）",          romaji: "hoka",            es: "otro" },
    { key: "v6",  jp: "ぜんぶ（全部）",      romaji: "zenbu",           es: "todo / entero" },
    { key: "v7",  jp: "てん（点）",          romaji: "ten",             es: "punto" },
    { key: "v8",  jp: "りょうきん（料金）",  romaji: "ryōkin",          es: "tarifa" },
    { key: "v9",  jp: "しな（品）",          romaji: "shina",           es: "artículo / producto" },
    { key: "v10", jp: "ほう（方）",          romaji: "hō",              es: "manera / lado" },
    { key: "v11", jp: "〜たち（達）",        romaji: "…tachi",          es: "plural de personas" },
    { key: "v12", jp: "げんいん（原因）",    romaji: "gen'in",          es: "causa" },
    { key: "v13", jp: "しゅだん（手段）",    romaji: "shudan",          es: "medio / método" },
    { key: "v14", jp: "ちいき（地域）",      romaji: "chiiki",          es: "región / zona" },
    { key: "v15", jp: "りゆう（理由）",      romaji: "riyū",            es: "razón / motivo" },
    { key: "v16", jp: "データ",              romaji: "dēta",            es: "datos" },
    { key: "v17", jp: "ひょう（表）",        romaji: "hyō",             es: "tabla" },
  ],

  oraciones6: [
    { key: "o1", jp: "このトピックについて 話します。", romaji: "Kono topikku ni tsuite hanashimasu.", es: "Hablaré sobre este tema.", exp: "N + について：‘acerca de…’" },
    { key: "o2", jp: "学生についての 例を あげます。", romaji: "Gakusei ni tsuite no rei o agemasu.", es: "Daré un ejemplo sobre estudiantes.", exp: "N + についての + N2：‘relacionado con…’" },
    { key: "o3", jp: "ちいきに よって りょうきんが ちがいます。", romaji: "Chiiki ni yotte ryōkin ga chigaimasu.", es: "La tarifa cambia según la región.", exp: "N + によって：‘dependiendo de…’" },
    { key: "o4", jp: "げんいんに よって はつげんを 変えます。", romaji: "Gen'in ni yotte hatsugen o kaemasu.", es: "Cambio la expresión según la causa.", exp: "N によって：motivo/medio." },
    { key: "o5", jp: "きょうは みずだけ 飲みます。", romaji: "Kyō wa mizu dake nomimasu.", es: "Hoy solo tomaré agua.", exp: "N + だけ：‘solo…’" },
    { key: "o6", jp: "この表は 点だけ ひかえめです。", romaji: "Kono hyō wa ten dake hikaeme desu.", es: "En esta tabla, solo los puntos son discretos.", exp: "N + だけ：limita el alcance." },
  ],

  gramatica: {
    titulo: "Como en primaria: について・によって・だけ",
    puntos: [
      {
        regla: "⓪ Estas 3 son gramáticas de SUSTANTIVO (N)",
        pasoapaso: [
          "En N4, el uso principal es con NOMBRES (sustantivos).",
          "Patrones base:",
          "• N + について… ＝ ‘acerca de N’. / N + についての + N2 ＝ ‘N2 relacionado con N’.",
          "• N + によって… ＝ ‘según/por/mediante N’; N + により（formal）；N + による + N2（adjetival）.",
          "• N + だけ… ＝ ‘solo N’; N + だけの + N2 ＝ ‘N2 solo de N’; N + だけで… ＝ ‘con solo N’.",
          "Contraste útil: N + しか + V-ない ＝ ‘no … más que N’ (también ‘solo N’, pero con negación).",
          "Nota: existen extensiones con verbos/adjetivos (p. ej., できるだけ), pero aquí nos centramos en N.",
        ],
        ejemploJP: "計画について 話します。ちいきに よって りょうきんが 変わります。きょうは コーヒーだけ に します。",
        ejemploRoma: "Keikaku ni tsuite hanashimasu. Chiiki ni yotte ryōkin ga kawarimasu. Kyō wa kōhī dake ni shimasu.",
        ejemploES: "Hablo sobre el plan. Según la región cambia la tarifa. Hoy solo tomaré café.",
        tabla: {
          headers: ["Patrón", "Función", "Ejemplo (JP)", "Romaji", "Traducción"],
          rows: [
            ["Nについて", "acerca de N", "計画について 話します", "Keikaku ni tsuite hanashimasu", "Hablo sobre el plan"],
            ["NについてのN2", "‘N2’ relacionado con ‘N’", "りょうきんについての 説明", "Ryōkin ni tsuite no setsumei", "Explicación sobre la tarifa"],
            ["Nによって", "según/por/mediante", "ちいきに よって 値段が ちがう", "Chiiki ni yotte nedan ga chigau", "El precio cambia según la región"],
            ["Nにより", "forma formal", "メールに より 連絡します", "Mēru ni yori renraku shimasu", "Contactaré por correo"],
            ["NによるN2", "adjetiva a N2", "データに よる 表", "Dēta ni yoru hyō", "Tabla según los datos"],
            ["Nだけ", "solo N", "水だけ 飲みます", "Mizu dake nomimasu", "Solo bebo agua"],
            ["NだけのN2", "‘N2 solo de N’", "学生だけの 集会", "Gakusei dake no shūkai", "Reunión solo de estudiantes"],
            ["Nだけで", "con solo N", "名前だけで 分かります", "Namae dake de wakarimasu", "Lo entiendo con solo el nombre"],
          ],
        },
      },

      {
        regla: "① 〜について — ‘acerca de / sobre’（Nについて / NについてのN2）",
        pasoapaso: [
          "N + について：hablar, preguntar, pensar ‘sobre…’.",
          "N + についての + N2：‘N2 relacionado con N’.",
          "Se usa con: 話す, 調べる, 考える, しつもんする, 意見を言う, まとめる, など。",
          "Evita usarlo para cosas obvias; si es muy formal, se usa 〜に関して（N3+）."
        ],
        ejemploJP: "学生について 話しましょう。",
        ejemploRoma: "Gakusei ni tsuite hanashimashō.",
        ejemploES: "Hablemos sobre estudiantes.",
        ejemplos: [
          { jp: "この 例について 説明します。", roma: "Kono rei ni tsuite setsumei shimasu.", es: "Explicaré acerca de este ejemplo." },
          { jp: "表について の しつもんは ありますか。", roma: "Hyō ni tsuite no shitsumon wa arimasu ka.", es: "¿Hay preguntas sobre la tabla?" },
          { jp: "りょうきんについて 調べました。", roma: "Ryōkin ni tsuite shirabemashita.", es: "Investigué sobre la tarifa." },
          { jp: "同じ点について 意見が あります。", roma: "Onaji ten ni tsuite iken ga arimasu.", es: "Tengo una opinión sobre el mismo punto." },
          { jp: "他の品について 知りたいです。", roma: "Hoka no shina ni tsuite shiritai desu.", es: "Quiero saber sobre otros productos." },
          { jp: "この ほうほうについて 先生に ききました。", roma: "Kono hōhō ni tsuite sensei ni kikimashita.", es: "Le pregunté al profe sobre este método." },
          { jp: "全体について かんたんに まとめます。", roma: "Zentai ni tsuite kantan ni matomemasu.", es: "Haré un resumen sobre el conjunto." },
        ],
      },

      {
        regla: "② 〜によって — ‘según / por / a causa de / mediante’（Nによって / Nにより / NによるN2）",
        pasoapaso: [
          "A) Variación: ちいきに よって（según la región）ねだんが ちがう。",
          "B) Causa: じしんに よって たてものが こわれた（por el sismo…).",
          "C) Medio: メールに よって れんらくします（mediante correo).",
          "D) Agente del pasivo (formal): この歌は 多くの人に よって 歌われている。",
          "Formas: N + によって／N + により（formal）／N + による + N2（adjetival）.",
        ],
        ejemploJP: "きせつに よって 服が 変わります。",
        ejemploRoma: "Kisetsu ni yotte fuku ga kawarimasu.",
        ejemploES: "La ropa cambia según la estación.",
        ejemplos: [
          { jp: "ちいきに よって りょうきんは ことなります。", roma: "Chiiki ni yotte ryōkin wa kotonarimasu.", es: "La tarifa difiere según la región." },
          { jp: "ひとに よって 意見が ちがいます。", roma: "Hito ni yotte iken ga chigaimasu.", es: "La opinión cambia según la persona." },
          { jp: "げんいんに よって たいおうが かわります。", roma: "Gen'in ni yotte taiō ga kawarimasu.", es: "La respuesta cambia según la causa." },
          { jp: "この表は データに よって 作られました。", roma: "Kono hyō wa dēta ni yotte tsukuraremashita.", es: "Esta tabla fue hecha mediante datos." },
          { jp: "先生に よって 説明の しかたが ちがう。", roma: "Sensei ni yotte setsumei no shikata ga chigau.", es: "Según el profesor, cambia la forma de explicar." },
          { jp: "ほうほうに よって はやく できます。", roma: "Hōhō ni yotte hayaku dekimasu.", es: "Dependiendo del método, se puede acabar rápido." },
          { jp: "国に よって 例が べつです。", roma: "Kuni ni yotte rei ga betsu desu.", es: "Según el país, los ejemplos son distintos." },
        ],
      },

      {
        regla: "③ 〜だけ — ‘solo / solamente / hasta donde…’（Nだけ / NだけのN2 / Nだけで）",
        pasoapaso: [
          "N + だけ：limita la cantidad (‘solo N’).",
          "N + だけの + N2：‘N2 solo de N’（学生だけの 集会）。",
          "N + だけで：‘con solo N’（名前だけで 分かります）。",
          "V-辞書形 + だけ：hasta donde…, できるだけ＝‘lo más que se pueda’.",
        ],
        ejemploJP: "きょうは コーヒーだけ に します。",
        ejemploRoma: "Kyō wa kōhī dake ni shimasu.",
        ejemploES: "Hoy me quedo solo con café.",
        ejemplos: [
          { jp: "この店は ひとりだけ いれます。", roma: "Kono mise wa hitori dake iremasu.", es: "En esta tienda solo puede entrar una persona." },
          { jp: "例だけ 見て ください。", roma: "Rei dake mite kudasai.", es: "Mire solo el ejemplo, por favor." },
          { jp: "今は 表だけ 作ります。", roma: "Ima wa hyō dake tsukurimasu.", es: "Por ahora haré solo la tabla." },
          { jp: "できるだけ 早く 連絡します。", roma: "Dekiru dake hayaku renraku shimasu.", es: "Contactaré lo antes posible." },
          { jp: "学生だけの しゅうかい です。", roma: "Gakusei dake no shūkai desu.", es: "Es una reunión solo de estudiantes." },
          { jp: "品だけ こうかん できます。", roma: "Shina dake kōkan dekimasu.", es: "Solo los artículos se pueden cambiar." },
          { jp: "今日は コーヒーだけ に します。", roma: "Kyō wa kōhī dake ni shimasu.", es: "Hoy solo café." },
        ],
      },
    ],
  },

  dialogos: [
    {
      title: "Sobre la tarea",
      kana: [
        "A: しゅくだいについて しつもんが あります。",
        "B: いいよ。どう したの？",
        "A: れいだけ みても いいですか。"
      ],
      kanji: [
        "A: しゅくだいについて しつもんが あります。",
        "B: いいよ。どう したの？",
        "A: 例だけ 見ても いいですか。"
      ],
      es: [
        "A: Tengo una pregunta sobre la tarea.",
        "B: Vale. ¿Qué pasó?",
        "A: ¿Puedo ver solo el ejemplo?"
      ]
    },
    {
      title: "Depende del lugar",
      kana: [
        "A: りょうきんは どう？",
        "B: ちいきに よって ちがいます。",
        "A: じゃ、データを みせて。"
      ],
      kanji: [
        "A: りょうきんは どう？",
        "B: ちいきに よって ちがいます。",
        "A: じゃ、データを 見せて。"
      ],
      es: [
        "A: ¿Y la tarifa?",
        "B: Cambia según la región.",
        "A: Entonces, muéstrame los datos."
      ]
    },
    {
      title: "Solo uno",
      kana: [
        "A: この しなは ひとりだけ こうにゅう できます。",
        "B: そうなんだ。べつの しなは？"
      ],
      kanji: [
        "A: この 品は ひとりだけ 買えます。",
        "B: そうなんだ。別の 品は？"
      ],
      es: [
        "A: Este artículo solo lo puede comprar una persona.",
        "B: Ya veo. ¿Y otros artículos?"
      ]
    },
    {
      title: "Acerca del plan",
      kana: [
        "A: けいかくについて の ひょうを 作りました。",
        "B: おなじ てんについて もうすこし 話そう。"
      ],
      kanji: [
        "A: 計画について の 表を 作りました。",
        "B: 同じ 点について もうすこし 話そう。"
      ],
      es: [
        "A: Hice una tabla sobre el plan.",
        "B: Hablemos un poco más del mismo punto."
      ]
    },
    {
      title: "Mediante correo",
      kana: [
        "A: しりょうは どうやって おくる？",
        "B: メールに よって おくります。"
      ],
      kanji: [
        "A: しりょうは どうやって おくる？",
        "B: メールに よって 送ります。"
      ],
      es: [
        "A: ¿Cómo enviarás los materiales?",
        "B: Los enviaré por correo."
      ]
    },
    {
      title: "Solo café",
      kana: [
        "A: のむ？",
        "B: きょうは コーヒーだけ に します。"
      ],
      kanji: [
        "A: 飲む？",
        "B: 今日は コーヒーだけ に します。"
      ],
      es: [
        "A: ¿Tomas algo?",
        "B: Hoy me quedo solo con café."
      ]
    },
    {
      title: "Según el profesor",
      kana: [
        "A: せつめいは せんせいに よって ちがうね。",
        "B: どの ほうほうが いい？",
        "A: れいについて は Aせんせいが いい。"
      ],
      kanji: [
        "A: 説明は 先生に よって ちがうね。",
        "B: どの ほうほうが いい？",
        "A: 例について は A先生が いい。"
      ],
      es: [
        "A: La explicación cambia según el profesor, ¿no?",
        "B: ¿Qué método es mejor?",
        "A: Para los ejemplos, el profesor A es mejor."
      ]
    },
  ],

  quizSets: [
    [
      "A: しゅくだいについて しつもんが あります。",
      "B: いいよ。どう したの？",
      "A: れいだけ みても いいですか。"
    ],
    [
      "A: りょうきんは どう？",
      "B: ちいきに よって ちがいます。",
      "A: じゃ、データを みせて。"
    ],
    [
      "A: この 品は ひとりだけ 買えます。",
      "B: そうなんだ。別の 品は？"
    ],
    [
      "A: 計画について の 表を 作りました。",
      "B: 同じ 点について もうすこし 話そう。"
    ],
    [
      "A: しりょうは どうやって おくる？",
      "B: メールに よって 送ります。"
    ],
    [
      "A: 飲む？",
      "B: 今日は コーヒーだけ に します。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables)
  kanji10: [
    { ch: "例", kun: ["たと(えば)"], on: ["レイ"], es: "ejemplo", trazos: 8, strokeCode: "4f8b",
      ej: [{ jp: "例", yomi: "れい", es: "ejemplo" }, { jp: "例えば", yomi: "たとえば", es: "por ejemplo" }] },
    { ch: "別", kun: ["わか(れる)","べつ"], on: ["ベツ"], es: "separado; distinto", trazos: 7, strokeCode: "5225",
      ej: [{ jp: "別々", yomi: "べつべつ", es: "por separado" }, { jp: "区別", yomi: "くべつ", es: "distinción" }] },
    { ch: "同", kun: ["おな(じ)"], on: ["ドウ"], es: "mismo", trazos: 6, strokeCode: "540c",
      ej: [{ jp: "同じ", yomi: "おなじ", es: "igual, mismo" }, { jp: "同時", yomi: "どうじ", es: "al mismo tiempo" }] },
    { ch: "他", kun: ["ほか","た"], on: ["タ"], es: "otro", trazos: 5, strokeCode: "4ed6",
      ej: [{ jp: "他", yomi: "ほか", es: "otro" }, { jp: "他人", yomi: "たにん", es: "otra persona" }] },
    { ch: "全", kun: ["まった(く)","すべ(て)"], on: ["ゼン"], es: "todo; entero", trazos: 6, strokeCode: "5168",
      ej: [{ jp: "全部", yomi: "ぜんぶ", es: "todo" }, { jp: "全員", yomi: "ぜんいん", es: "todos (miembros)" }] },
    { ch: "点", kun: ["てん"], on: ["テン"], es: "punto", trazos: 9, strokeCode: "70b9",
      ej: [{ jp: "点", yomi: "てん", es: "punto" }, { jp: "点数", yomi: "てんすう", es: "puntuación" }] },
    { ch: "料", kun: [], on: ["リョウ"], es: "tarifa; material", trazos: 10, strokeCode: "6599",
      ej: [{ jp: "料金", yomi: "りょうきん", es: "tarifa" }, { jp: "材料", yomi: "ざいりょう", es: "ingredientes" }] },
    { ch: "品", kun: ["しな"], on: ["ヒン"], es: "artículo; calidad", trazos: 9, strokeCode: "54c1",
      ej: [{ jp: "品", yomi: "しな", es: "producto" }, { jp: "上品", yomi: "じょうひん", es: "elegante" }] },
    { ch: "方", kun: ["かた"], on: ["ホウ"], es: "dirección; manera", trazos: 4, strokeCode: "65b9",
      ej: [{ jp: "方法", yomi: "ほうほう", es: "método" }, { jp: "夕方", yomi: "ゆうがた", es: "atardecer" }] },
    { ch: "達", kun: ["たち"], on: ["タツ"], es: "sufijo plural; alcanzar", trazos: 12, strokeCode: "9054",
      ej: [{ jp: "私達", yomi: "わたしたち", es: "nosotros" }, { jp: "上達", yomi: "じょうたつ", es: "mejora/progreso" }] },
  ],
};

export default TEMA_29;
