// src/content/n4/13.ts
import type { ThemeContent } from "../types";

// Tema 13 — Opiniones y pensamientos: expresar puntos de vista y razones
export const TEMA_13: ThemeContent = {
  id: 13,
  nivel: "N4",
  titulo: "Opiniones y pensamientos – Expresar puntos de vista y razones",

  objetivos: [
    "Dar una opinión con 〜と思います (〜to omoimasu) de forma clara y cortés.",
    "Pedir y dar razones con どうして／なぜ ＋ 〜からです。",
    "Presentar motivos con 理由（りゆう） y conectores simples (だから、でも、まず・次に・最後に).",
    "Opinar sobre un tema usando 〜について y comparar con 〜のほうが／〜より。",
    "Explicar por qué piensas así con 〜のは〜からだ。",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "意見",     romaji: "iken",           es: "opinión" },
    { key: "vc02", jp: "理由",     romaji: "riyū",           es: "razón, motivo" },
    { key: "vc03", jp: "思う",     romaji: "omou",           es: "pensar, opinar" },
    { key: "vc04", jp: "考える",   romaji: "kangaeru",       es: "considerar, pensar" },
    { key: "vc05", jp: "自分",     romaji: "jibun",          es: "uno mismo" },
    { key: "vc06", jp: "自由",     romaji: "jiyū",           es: "libertad" },
    { key: "vc07", jp: "以上",     romaji: "ijō",            es: "más de; en adelante" },
    { key: "vc08", jp: "以外",     romaji: "igai",           es: "excepto; aparte de" },
    { key: "vc09", jp: "原因",     romaji: "gen'in",         es: "causa" },
    { key: "vc10", jp: "主に",     romaji: "omo ni",         es: "principalmente" },
    { key: "vc11", jp: "なぜ／どうして", romaji: "naze / dōshite", es: "¿por qué?" },
    { key: "vc12", jp: "だから",   romaji: "dakara",         es: "por eso; por lo tanto" },
    { key: "vc13", jp: "たとえば", romaji: "tatoeba",        es: "por ejemplo" },
    { key: "vc14", jp: "はっきり", romaji: "hakkiri",       es: "claramente" },
    { key: "vc15", jp: "まとめる", romaji: "matomeru",       es: "resumir; compilar" },
    { key: "vc16", jp: "賛成じゃない", romaji: "sansei janai", es: "no estar de acuerdo (coloquial)" },
    { key: "vc17", jp: "気持ち",   romaji: "kimochi",        es: "sentimiento" },
    { key: "vc18", jp: "決める",   romaji: "kimeru",         es: "decidir" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "わたしは こう 思います。",
      romaji: "watashi wa kō omoimasu.",
      es: "Yo pienso así.",
      exp: "Modelo base para opinar. Cortés y directo."
    },
    {
      key: "ex02",
      jp: "わたしは この いけんが いい と 思います。",
      romaji: "watashi wa kono iken ga ii to omoimasu.",
      es: "Creo que esta opinión es buena.",
      exp: "〜と 思います para citar lo que piensas."
    },
    {
      key: "ex03",
      jp: "どうして？ — りゆうは じかんが ない から です。",
      romaji: "dōshite? — riyū wa jikan ga nai kara desu.",
      es: "¿Por qué? — La razón es que no tengo tiempo.",
      exp: "Pregunta de motivo + 〜からです (porque…)."
    },
    {
      key: "ex04",
      jp: "Aに ついて は、Bの ほうが いい と 思います。",
      romaji: "A ni tsuite wa, B no hō ga ii to omoimasu.",
      es: "Sobre A, creo que B es mejor.",
      exp: "〜について（sobre…）＋ 比較（〜のほうが）＋ 思います。"
    },
    {
      key: "ex05",
      jp: "わたしの いけんは シンプルです。まず 一つ目の りゆうは…",
      romaji: "watashi no iken wa shinpuru desu. mazu hitotsu-me no riyū wa…",
      es: "Mi opinión es simple. Primero, la razón número uno es…",
      exp: "Estructura para enumerar razones: まず／次に／最後に。"
    },
    {
      key: "ex06",
      jp: "オンラインで べんきょう する のは べんり だから です。",
      romaji: "onrain de benkyō suru no wa benri dakara desu.",
      es: "Es porque estudiar en línea es conveniente.",
      exp: "〜のは〜からです: Explica el motivo de forma clara."
    },
  ],

  // Gramática: “como en primaria” + romaji + key por punto
  // ⬇️ Reemplaza TODO el bloque gramatica por este
gramatica: {
  titulo: "Opiniones y razones（N4）",
  puntos: [
    // ① とおもいます — DESARROLLADO
    {
      key: "g01",
      titulo: "① 〜と おもいます（dar opinión）",
      jp: "（A）と おもいます。",
      roma: "(A) to omoimasu.",
      es: "Creo que (A).",
      exp: "Conecta la forma simple (diccionario) con と おもいます. Con sustantivos y na-adjetivos usa だ antes de と.",
      tabla: {
        title: "Cómo unir A + と おもいます",
        headers: ["Elemento", "Forma antes de と", "Ejemplo JP", "Roma", "Traducción"],
        rows: [
          [
            "Verbo (diccionario)",
            "V（普通形）",
            "あした はやく おきる と おもいます。",
            "ashita hayaku okiru to omoimasu.",
            "Creo que mañana me levantaré temprano."
          ],
          [
            "Sustantivo",
            "N + だ",
            "かれは せんせい だ と おもいます。",
            "kare wa sensei da to omoimasu.",
            "Creo que él es profesor."
          ],
          [
            "Adjetivo -い",
            "Aい",
            "この てんは おもしろい と おもいます。",
            "kono ten wa omoshiroi to omoimasu.",
            "Creo que este punto es interesante."
          ],
          [
            "Adjetivo -な",
            "Aな + だ",
            "これは べんり だ と おもいます。",
            "kore wa benri da to omoimasu.",
            "Creo que esto es práctico."
          ],
        ],
        note: "⚠️ Con sustantivos / adjetivos -な usa だ. No se usa 「です」 antes de と（✗ 学生ですと思います）."
      },
      ejemplos: [
        {
          jp: "この あん が いちばん いい と おもいます。",
          roma: "kono an ga ichiban ii to omoimasu.",
          es: "Creo que esta propuesta es la mejor."
        },
        {
          jp: "にほんごの べんきょうは たのしい と おもいます。",
          roma: "nihongo no benkyō wa tanoshii to omoimasu.",
          es: "Pienso que estudiar japonés es divertido."
        },
        {
          jp: "りゆうは かんたん だ と おもいます。",
          roma: "riyū wa kantan da to omoimasu.",
          es: "Creo que la razón es sencilla."
        },
      ],
    },

    // ② どうして／なぜ ＋ 〜からです（sin cambios fuertes, conservamos breve）
    {
      key: "g02",
      titulo: "② どうして／なぜ ＋ 〜から です（dar razón）",
      jp: "どうして？ — A から です。",
      roma: "doushite? — A kara desu.",
      es: "¿Por qué? — Porque A.",
      exp: "Pregunta el motivo. La respuesta termina con 〜からです.",
      ejemplos: [
        { jp: "どうして おくれましたか。— バスが おそかった から です。", roma: "doushite okuremashita ka? — basu ga osokatta kara desu.", es: "¿Por qué llegaste tarde? — Porque el autobús se retrasó." },
        { jp: "なぜ その あん に さんせい ですか。— あんぜん だ から です。", roma: "naze sono an ni sansei desu ka? — anzen da kara desu.", es: "¿Por qué apoyas esa propuesta? — Porque es segura." },
        { jp: "どうして うちで べんきょう しますか。— しずか だから です。", roma: "doushite uchi de benkyou shimasu ka? — shizuka dakara desu.", es: "¿Por qué estudias en casa? — Porque es tranquilo." },
      ],
    },

    // ③ りゆう＋だから（breve)
    {
      key: "g03",
      titulo: "③ 理由を言う：A。だから、B。",
      jp: "A。だから、B。",
      roma: "A. dakara, B.",
      es: "A. Por eso, B.",
      exp: "Primero dices la razón (A), después la conclusión (B).",
      ejemplos: [
        { jp: "じかんが ありません。だから、かんたんな あん が いい です。", roma: "jikan ga arimasen. dakara, kantan na an ga ii desu.", es: "No hay tiempo. Por eso, es mejor una propuesta simple." },
        { jp: "あめ です。だから、オンラインで します。", roma: "ame desu. dakara, onrain de shimasu.", es: "Está lloviendo. Por eso, lo haremos en línea." },
        { jp: "ねだん が たかい です。だから、かいません。", roma: "nedan ga takai desu. dakara, kaimasen.", es: "El precio es alto. Por eso, no lo compro." },
      ],
    },

    // ④ 〜について — DESARROLLADO
    {
      key: "g04",
      titulo: "④ 〜について（acerca de / sobre）",
      jp: "N ＋ に ついて",
      roma: "N + ni tsuite",
      es: "sobre N; acerca de N",
      exp: "Usa に ついて para introducir el tema del que hablas. Como adjetivo, usa 「N に ついての N」. Para tema/contraste usa 「N については …」。",
      tabla: {
        title: "Usos básicos de 〜について",
        headers: ["Estructura", "Uso", "Ejemplo JP", "Roma", "Traducción"],
        rows: [
          [
            "N + に ついて",
            "Hablar/preguntar sobre N",
            "この テーマに ついて どう おもいますか。",
            "kono tēma ni tsuite dou omoimasu ka.",
            "¿Qué opinas sobre este tema?"
          ],
          [
            "N + に ついての + N",
            "Modificar un sustantivo",
            "りゆう に ついての せつめい を おねがいします。",
            "riyū ni tsuite no setsumei o onegai shimasu.",
            "Por favor, una explicación sobre la razón."
          ],
          [
            "N + に ついては …",
            "Tópico/contraste sobre N",
            "オンライン学習 に ついては、こう おもいます。",
            "onrain gakushū ni tsuite wa, kō omoimasu.",
            "Sobre el estudio en línea, pienso así."
          ]
        ],
        note: "「について」 se une directamente al sustantivo. Con 「についての」 funciona como adjetivo para modificar otro sustantivo."
      },
      ejemplos: [
        {
          jp: "この もんだい に ついて いけん を いって ください。",
          roma: "kono mondai ni tsuite iken o itte kudasai.",
          es: "Por favor, da tu opinión sobre este problema."
        },
        {
          jp: "あしたの プラン に ついての メール を みました。",
          roma: "ashita no puran ni tsuite no mēru o mimashita.",
          es: "Vi el correo sobre el plan de mañana."
        },
        {
          jp: "にほんの りょうり に ついては、てんぷら が すき です。",
          roma: "nihon no ryōri ni tsuite wa, tenpura ga suki desu.",
          es: "Sobre la comida japonesa, me gusta la tempura."
        },
      ],
    },

    // ⑤ のは〜からだ（breve)
    {
      key: "g05",
      titulo: "⑤ 〜のは〜からだ（explicar causa）",
      jp: "A する のは B から だ。",
      roma: "A suru no wa B kara da.",
      es: "Haces A porque B.",
      exp: "Estructura clara para explicar por qué ocurre A.",
      ejemplos: [
        { jp: "はやく ねる のは、あした しごと が ある から だ。", roma: "hayaku neru no wa, ashita shigoto ga aru kara da.", es: "Me acuesto temprano porque mañana tengo trabajo." },
        { jp: "オンラインで べんきょう する のは べんり だから だ。", roma: "onrain de benkyō suru no wa benri dakara da.", es: "Estudio en línea porque es práctico." },
        { jp: "この あん を えらぶ のは、あんぜん だから だ。", roma: "kono an o erabu no wa, anzen dakara da.", es: "Elijo esta propuesta porque es segura." },
      ],
    },

    // ⑥ 比較（のほうが／より）
    {
      key: "g06",
      titulo: "⑥ 比較：〜のほうが／〜より",
      jp: "A より B の ほうが いい と おもいます。",
      roma: "A yori B no hō ga ii to omoimasu.",
      es: "Creo que B es mejor que A.",
      exp: "Compara dos opciones y expresa tu punto de vista.",
      ejemplos: [
        { jp: "バス より でんしゃ の ほうが はやい と おもいます。", roma: "basu yori densha no hō ga hayai to omoimasu.", es: "Creo que el tren es más rápido que el autobús." },
        { jp: "しずかな へや の ほうが しごと が しやすい と おもいます。", roma: "shizuka na heya no hō ga shigoto ga shiyasui to omoimasu.", es: "Creo que es más fácil trabajar en una habitación tranquila." },
        { jp: "A より B の ほうが りゆう が はっきり して います。", roma: "A yori B no hō ga riyū ga hakkiri shite imasu.", es: "B tiene razones más claras que A." },
      ],
    },
  ],
},


  // 7 diálogos (kana/kanji/es con misma cantidad de líneas)
  dialogos: [
    {
      title: "オンライン学習の意見",
      kana: [
        "わたしの いけんは、オンラインの べんきょうは べんり だと おもう。",
        "どうして？",
        "りゆうは、じぶんの ペースで できる から です。",
        "なるほど。わたしは あう きかいが すくない のは すこし ふべん だと おもう。"
      ],
      kanji: [
        "私の意見は、オンラインの勉強は便利だと思う。",
        "どうして？",
        "理由は、自分のペースでできるからです。",
        "なるほど。私は会う機会が少ないのは少し不便だと思う."
      ],
      es: [
        "Mi opinión es que estudiar en línea es conveniente.",
        "¿Por qué?",
        "La razón es que puedo hacerlo a mi propio ritmo.",
        "Ya veo. Creo que es un poco inconveniente tener pocas oportunidades de vernos."
      ]
    },
    {
      title: "理由を言う",
      kana: [
        "どうして この あん に さんせい しないの？",
        "りゆうは かんたんです。ひようが たかい から です。",
        "じゃあ べつの あん を かんがえよう。"
      ],
      kanji: [
        "どうして この案に賛成しないの？",
        "理由は簡単です。費用が高いからです。",
        "じゃあ別の案を考えよう。"
      ],
      es: [
        "¿Por qué no estás a favor de esta propuesta?",
        "La razón es simple. Porque el costo es alto.",
        "Entonces pensemos otra propuesta."
      ]
    },
    {
      title: "自分の考え",
      kana: [
        "わたしは こう おもいます。",
        "まず、ひとつめの りゆうは じかん です。",
        "つぎに、にばんめは しゅ に よって かわる と おもいます。"
      ],
      kanji: [
        "私はこう思います。",
        "まず、一つ目の理由は時間です。",
        "次に、二番目は主によって変わると思います。"
      ],
      es: [
        "Yo pienso así.",
        "Primero, la razón número uno es el tiempo.",
        "Luego, la segunda depende principalmente del tema."
      ]
    },
    {
      title: "原因と結果",
      kana: [
        "げんいんは なんですか。",
        "たぶん ねぼう が いちばんの げんいん です。",
        "だから おくれました。"
      ],
      kanji: [
        "原因は何ですか。",
        "たぶん寝坊が一番の原因です。",
        "だから遅れました。"
      ],
      es: [
        "¿Cuál es la causa?",
        "Tal vez quedarse dormido es la causa principal.",
        "Por eso llegué tarde."
      ]
    },
    {
      title: "Aについて",
      kana: [
        "この トピックに ついて どう おもいますか。",
        "B の ほうが いい と おもいます。りゆうは かんたん です。",
        "いがいの あん も あります か？"
      ],
      kanji: [
        "このトピックについてどう思いますか。",
        "Bのほうがいいと思います。理由は簡単です。",
        "以外の案もありますか？"
      ],
      es: [
        "¿Qué opinas sobre este tema?",
        "Creo que B es mejor. La razón es simple.",
        "¿Hay propuestas aparte de esa?"
      ]
    },
    {
      title: "自由について",
      kana: [
        "じゆう は たいせつ だと おもいます。",
        "でも じぶんの じかんを まもる ことも たいせつ です。",
        "バランスが ひつよう ですね。"
      ],
      kanji: [
        "自由は大切だと思います。",
        "でも自分の時間を守ることも大切です。",
        "バランスが必要ですね。"
      ],
      es: [
        "Creo que la libertad es importante.",
        "Pero también es importante proteger tu tiempo.",
        "Se necesita equilibrio, ¿verdad?"
      ]
    },
    {
      title: "結論をまとめる",
      kana: [
        "さいごに、わたしの いけんを まとめます。",
        "りゆうは ふたつ あります。まず はやい。つぎに あんぜん です。",
        "いじょうです。"
      ],
      kanji: [
        "最後に、私の意見をまとめます。",
        "理由は二つあります。まず速い。次に安全です。",
        "以上です。"
      ],
      es: [
        "Por último, resumo mi opinión.",
        "Hay dos razones. Primero, es rápido. Luego, es seguro.",
        "Eso es todo."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: どうして おくれた の？",
      "B: げんいんは ねぼう です。",
      "A: だから ちこく したんだね。",
      "B: はい、すみません。"
    ],
    [
      "A: この あん に ついて どう 思いますか。",
      "B: B の ほうが いい と 思います。",
      "A: りゆうは なんですか。",
      "B: ひよう が たかい から です。"
    ],
    [
      "A: わたしの いけんを 言っても いい？",
      "B: もちろん。どうぞ。",
      "A: まず、りゆうは じかん です。",
      "B: なるほど。"
    ],
    [
      "A: いがい の あん は あります か。",
      "B: はい、あります。",
      "A: どれ が いい と おもいます か。",
      "B: C が いちばん だ と おもいます。"
    ],
    [
      "A: じゆう は たいせつ だ と おもいます。",
      "B: わたし も そう おもいます。",
      "A: でも、ルール も ひつよう です。",
      "B: バランス が たいせつ ですね。"
    ],
    [
      "A: まとめる と、A より B の ほうが いい です ね。",
      "B: はい。りゆう は 二つ です。",
      "A: まず はやい。つぎに あんぜん。",
      "B: いじょう です。"
    ]
  ],

  // 10 kanji nuevos (N4 razonables)
  kanji10: [
    {
      ch: "思",
      kun: ["おも(う)"],
      on: ["し"],
      es: "pensar",
      trazos: 9,
      strokeCode: "601d",
      ej: ["思う（おもう）: pensar", "思い出（おもいで）: recuerdo"]
    },
    {
      ch: "考",
      kun: ["かんが(える)"],
      on: ["こう"],
      es: "considerar",
      trazos: 6,
      strokeCode: "8003",
      ej: ["考える（かんがえる）: considerar", "考え方（かんがえかた）: manera de pensar"]
    },
    {
      ch: "意",
      kun: [],
      on: ["い"],
      es: "intención, idea",
      trazos: 13,
      strokeCode: "610f",
      ej: ["意見（いけん）: opinión", "意味（いみ）: significado"]
    },
    {
      ch: "理",
      kun: [],
      on: ["り"],
      es: "razón, lógica",
      trazos: 11,
      strokeCode: "7406",
      ej: ["理由（りゆう）: razón", "理科（りか）: ciencias"]
    },
    {
      ch: "由",
      kun: ["よし"],
      on: ["ゆ", "ゆう"],
      es: "origen, razón",
      trazos: 5,
      strokeCode: "7531",
      ej: ["理由（りゆう）: razón", "自由（じゆう）: libertad"]
    },
    {
      ch: "以",
      kun: [],
      on: ["い"],
      es: "por, desde, más de",
      trazos: 5,
      strokeCode: "4ee5",
      ej: ["以上（いじょう）: más de", "以外（いがい）: excepto"]
    },
    {
      ch: "自",
      kun: ["みずか(ら)"],
      on: ["じ", "し"],
      es: "uno mismo",
      trazos: 6,
      strokeCode: "81ea",
      ej: ["自分（じぶん）: uno mismo", "自由（じゆう）: libertad"]
    },
    {
      ch: "主",
      kun: ["おも", "ぬし"],
      on: ["しゅ"],
      es: "principal, dueño",
      trazos: 5,
      strokeCode: "4e3b",
      ej: ["主に（おもに）: principalmente", "主語（しゅご）: sujeto (gram.)"]
    },
    {
      ch: "原",
      kun: ["はら"],
      on: ["げん"],
      es: "origen, campo",
      trazos: 10,
      strokeCode: "539f",
      ej: ["原因（げんいん）: causa", "原本（げんぽん）: original"]
    },
    {
      ch: "因",
      kun: ["よ(る)"],
      on: ["いん"],
      es: "causa",
      trazos: 6,
      strokeCode: "56e0",
      ej: ["原因（げんいん）: causa", "原因不明（げんいんふめい）: causa desconocida"]
    },
  ],
};

export default TEMA_13;
