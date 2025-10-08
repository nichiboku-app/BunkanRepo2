// src/content/n4/14.ts
import type { ThemeContent } from "../types";

// Tema 14 — Dar explicaciones: 「〜から」「〜ので」「〜のに」
export const TEMA_14: ThemeContent = {
  id: 14,
  nivel: "N4",
  titulo: "Dar explicaciones – Uso de 「〜から」「〜ので」「〜のに」",

  objetivos: [
    "Explicar causas con 〜から y 〜ので (matiz directo vs suave).",
    "Usar 〜のに para contraste: ‘aunque / a pesar de que’.",
    "Unir con verbo, sustantivo, adjetivo -い y -な correctamente.",
    "Elegir el tiempo (presente/pasado) en la cláusula de causa según el sentido.",
    "Producir respuestas corteses con 〜のでです y 〜からです.",
  ],

  // ≥ 15 ítems, con romaji para TTS
  vocabClase: [
    { key: "vc01", jp: "りゆう（理由）",  romaji: "riyū",         es: "razón, motivo" },
    { key: "vc02", jp: "げんいん（原因）", romaji: "gen'in",      es: "causa" },
    { key: "vc03", jp: "せつめい",        romaji: "setsumei",     es: "explicación" },
    { key: "vc04", jp: "きゅう（急）",     romaji: "kyū",          es: "urgente" },
    { key: "vc05", jp: "こんなん（困難）", romaji: "konnan",      es: "dificultad" },
    { key: "vc06", jp: "べんり（便利）",   romaji: "benri",        es: "práctico, conveniente" },
    { key: "vc07", jp: "ひつよう",        romaji: "hitsuyō",      es: "necesario" },
    { key: "vc08", jp: "いそぐ",          romaji: "isogu",        es: "apresurarse" },
    { key: "vc09", jp: "つたえる",        romaji: "tsutaeru",     es: "transmitir, comunicar" },
    { key: "vc10", jp: "れんきゅう（連休）", romaji: "renkyū",    es: "puente, vacaciones seguidas" },
    { key: "vc11", jp: "せっする（接する）", romaji: "sessuru",    es: "tratar con, estar en contacto" },
    { key: "vc12", jp: "せつ",            romaji: "setsu",        es: "sección / teoría / explicación (acad.)" },
    { key: "vc13", jp: "いけん（意見）",   romaji: "iken",         es: "opinión" },
    { key: "vc14", jp: "じゅうよう（重要）", romaji: "jūyō",     es: "importante" },
    { key: "vc15", jp: "ずけい（図形）",   romaji: "zukei",        es: "figura, forma (geom.)" },
    { key: "vc16", jp: "べん（便）",       romaji: "ben",          es: "conveniencia / correo" },
    { key: "vc17", jp: "こまる（困る）",   romaji: "komaru",       es: "tener problemas" },
  ],

  // 6 modelos (jp / romaji / es / exp)
  oraciones6: [
    {
      key: "ex01",
      jp: "あめ だから、うちで べんきょう します。",
      romaji: "ame dakara, uchi de benkyō shimasu.",
      es: "Como llueve, estudiaré en casa.",
      exp: "〜から con N/na usa だから. Tono directo, causal."
    },
    {
      key: "ex02",
      jp: "ねつ が ある ので、はやく かえります。",
      romaji: "netsu ga aru no de, hayaku kaerimasu.",
      es: "Como tengo fiebre, regresaré temprano.",
      exp: "〜ので suena más suave/educado que 〜から."
    },
    {
      key: "ex03",
      jp: "やすい のに、だれも かいません。",
      romaji: "yasui noni, dare mo kaimasen.",
      es: "Aunque es barato, nadie lo compra.",
      exp: "〜のに expresa contradicción / sorpresa."
    },
    {
      key: "ex04",
      jp: "いそいで いる から、あとで はなして も いい です か。",
      romaji: "isoide iru kara, ato de hanashite mo ii desu ka.",
      es: "Como estoy apurado, ¿podemos hablar más tarde?",
      exp: "Verbo (forma simple) + から."
    },
    {
      key: "ex05",
      jp: "しずか な ので、ここ で べんきょう しましょう。",
      romaji: "shizuka na no de, koko de benkyō shimashō.",
      es: "Como es tranquilo, estudiemos aquí.",
      exp: "na-adjetivo + な + ので."
    },
    {
      key: "ex06",
      jp: "がんばった のに、テスト は むずかしかった です。",
      romaji: "ganbatta noni, tesuto wa muzukashikatta desu.",
      es: "Aunque me esforcé, el examen fue difícil.",
      exp: "Pasado + のに mantiene el contraste."
    },
  ],

  // Gramática — “como en primaria”: tablas + 3 ejemplos por punto
  gramatica: {
    titulo: "Explicar y contrastar: 〜から／〜ので／〜のに",
    puntos: [
      // ① 〜から
      {
        key: "g01",
        titulo: "① 〜から（porque）",
        jp: "A から、B。",
        roma: "A kara, B.",
        romaji: "A kara, B.",
        es: "Porque A, (entonces) B.",
        exp: "Causa directa. Conversación diaria. Con N y adjetivo-na usa だから.",
        tabla: {
          title: "Cómo unir A + から",
          headers: ["Elemento", "Forma antes de から", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo (diccionario)", "V（普通形）", "あめ が ふる から、でかけません。", "ame ga furu kara, dekakemasen.", "Como va a llover, no salgo."],
            ["Adjetivo -い", "Aい", "この みせ は やすい から、にんき です。", "kono mise wa yasui kara, ninki desu.", "Como es barato, es popular."],
            ["Adjetivo -な", "Aな → だから", "しずか だから、すき です。", "shizuka dakara, suki desu.", "Porque es tranquilo, me gusta."],
            ["Sustantivo", "N → だから", "じゅうよう だから、いま はなします。", "jūyō dakara, ima hanashimasu.", "Como es importante, lo hablamos ahora."],
          ],
          note: "Con N/na usa だから. Evita 「ですから」 dentro de una oración larga casual; en formal sí se usa."
        },
        ejemplos: [
          { jp: "きゅう に ようじ が できた から、でんわ します。", roma: "kyū ni yōji ga dekita kara, denwa shimasu.", es: "Como surgió un asunto urgente, llamaré." },
          { jp: "こまって いる から、てつだって ください。", roma: "komatte iru kara, tetsudatte kudasai.", es: "Como estoy en problemas, por favor ayúdame." },
          { jp: "れんきゅう だから、まち が にぎやか です。", roma: "renkyū dakara, machi ga nigiyaka desu.", es: "Como es puente, la ciudad está animada." },
        ],
      },

      // ② 〜ので
      {
        key: "g02",
        titulo: "② 〜ので（puesto que / como que）",
        jp: "A ので、B。",
        roma: "A no de, B.",
        romaji: "A no de, B.",
        es: "Puesto que A, B. / Como A, B.",
        exp: "Más suave y educado que 〜から. Con N/na usa 〜な ので.",
        tabla: {
          title: "Cómo unir A + ので",
          headers: ["Elemento", "Forma antes de ので", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo (diccionario/pasado)", "V（普通形）", "はやく ついた ので、まちます。", "hayaku tsuita no de, machimasu.", "Como llegué temprano, espero."],
            ["Adjetivo -い", "Aい", "さむい ので、ジャケット を きます。", "samui no de, jaketto o kimasu.", "Como hace frío, me pongo chaqueta."],
            ["Adjetivo -な", "Aな → 〜な ので", "しずか な ので、ねむれます。", "shizuka na no de, nemuremasu.", "Como es tranquilo, puedo dormir."],
            ["Sustantivo", "N → 〜な ので", "がくせい な ので、わりびき です。", "gakusei na no de, waribiki desu.", "Como soy estudiante, hay descuento."],
          ],
          note: "「〜ので」 suena más objetivo/suave. En disculpas / peticiones formales se prefiere."
        },
        ejemplos: [
          { jp: "せつめい が ながい ので、スライド を みて ください。", roma: "setsumei ga nagai no de, suraido o mite kudasai.", es: "Como la explicación es larga, por favor mira las diapositivas." },
          { jp: "かぜ なので、今日は やすみます。", roma: "kaze na no de, kyō wa yasumimasu.", es: "Como estoy resfriado, hoy descanso." },
          { jp: "じゅうよう な ので、あとで もういちど はなします。", roma: "jūyō na no de, ato de mō ichido hanashimasu.", es: "Como es importante, lo hablamos otra vez luego." },
        ],
      },

      // ③ 〜のに
      {
        key: "g03",
        titulo: "③ 〜のに（aunque / a pesar de que）",
        jp: "A のに、B。",
        roma: "A noni, B.",
        romaji: "A noni, B.",
        es: "Aunque A, B. (contraste/sorpresa)",
        exp: "Se usa cuando el resultado B contradice la expectativa de A. Con N/na usa なのに.",
        tabla: {
          title: "Cómo unir A + のに",
          headers: ["Elemento", "Forma antes de のに", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo (pasado/presente)", "V（普通形）", "がんばった のに、うまく いきません でした。", "ganbatta noni, umaku ikimasen deshita.", "Aunque me esforcé, no salió bien."],
            ["Adjetivo -い", "Aい", "やすい のに、だれも かいません。", "yasui noni, dare mo kaimasen.", "Aunque es barato, nadie compra."],
            ["Adjetivo -な", "Aな → なのに", "べんり なのに、つかわない です。", "benri na noni, tsukawanai desu.", "Aunque es práctico, no lo usan."],
            ["Sustantivo", "N → なのに", "がくせい なのに、たかい チケット を かいました。", "gakusei na noni, takai chiketto o kaimashita.", "Aunque es estudiante, compró un boleto caro."],
          ],
          note: "「のに」 expresa sorpresa / queja. No se usa para dar razones."
        },
        ejemplos: [
          { jp: "あめ なのに、れんきゅう で ひと が おおい です。", roma: "ame na noni, renkyū de hito ga ōi desu.", es: "Aunque llueve, hay mucha gente por el puente." },
          { jp: "やくそく した のに、こなかった です。", roma: "yakusoku shita noni, konakatta desu.", es: "Aunque lo prometió, no vino." },
          { jp: "じゅうよう なのに、だれも きに しません。", roma: "jūyō na noni, dare mo ki ni shimasen.", es: "Aunque es importante, a nadie le importa." },
        ],
      },

      // ④ Tiempo y traducción de la cláusula de causa
      {
        key: "g04",
        titulo: "④ Tiempo en la causa（traducir bien）",
        jp: "A（presente/pasado）＋ から／ので",
        roma: "A (genzai/kako) + kara / no de",
        romaji: "A (genzai/kako) + kara / no de",
        es: "La forma verbal de A cambia el sentido temporal de la causa.",
        exp: "Presente: causa general/hábito (‘como…’). Pasado: hecho ya ocurrido (‘como/ya que…’).",
        tabla: {
          title: "Tiempo en A",
          headers: ["Tiempo de A", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Presente", "V辞書形 + から", "じかん が ない から、いきません。", "jikan ga nai kara, ikimasen.", "Como no tengo tiempo, no voy."],
            ["Pasado", "Vた + ので", "おわった ので、かえります。", "owatta no de, kaerimasu.", "Como ya terminé, me voy a casa."],
            ["Presente", "Aい + のに", "ひま なのに、てつだいません。", "hima na noni, tetsudaimasen.", "Aunque está libre, no ayuda."],
          ],
          note: "El tiempo de A se traduce en español con ‘como/ya que/aunque’ según el caso."
        },
        ejemplos: [
          { jp: "きゅう に よばれた ので、でかけます。", roma: "kyū ni yobareta no de, dekakemasu.", es: "Como me llamaron de repente, salgo." },
          { jp: "しめきり が ある から、いそいで います。", roma: "shimekiri ga aru kara, isoide imasu.", es: "Como hay fecha límite, estoy apurado." },
          { jp: "あつい のに、エアコン を つけません。", roma: "atsui noni, eakon o tsukemasen.", es: "Aunque hace calor, no encienden el aire." },
        ],
      },
    ],
  },

  // 7 diálogos (kana/kanji/es con mismas líneas)
  dialogos: [
    {
      title: "から：razón directa",
      kana: [
        "いま いそいで いる から、あとで でんわ して も いい？",
        "うん、だいじょうぶ。どうして いそいで いる の？",
        "きゅう に ようじ が できた から だよ。"
      ],
      kanji: [
        "今 急いで いる から、あとで 電話 して も いい？",
        "うん、大丈夫。どうして 急いで いる の？",
        "急 に 用事 が できた から だよ。"
      ],
      es: [
        "Como ahora estoy apurado, ¿puedo llamarte luego?",
        "Sí, está bien. ¿Por qué estás apurado?",
        "Porque surgió un asunto urgente."
      ]
    },
    {
      title: "ので：suave / cortés",
      kana: [
        "せつめい が ながい ので、すこし きゅうけい しましょう。",
        "さんせい。のど が かわいた ので、みず を のみたい です。",
        "じゃあ、べんり な ばしょ を さがします。"
      ],
      kanji: [
        "説明 が 長い ので、少し 休憩 しましょう。",
        "賛成。喉 が 乾いた ので、水 を 飲みたい です。",
        "じゃあ、便利 な 場所 を 探します。"
      ],
      es: [
        "Como la explicación es larga, tomemos un descanso.",
        "De acuerdo. Como tengo sed, quiero beber agua.",
        "Entonces buscaré un lugar conveniente."
      ]
    },
    {
      title: "のに：contraste",
      kana: [
        "やすい のに、だれも かいません ね。",
        "そう ですね。せつめい が たりない のかも。",
        "じゃあ、もっと ていねい に つたえます。"
      ],
      kanji: [
        "安い のに、誰も 買いません ね。",
        "そう ですね。説明 が 足りない の かも。",
        "じゃあ、もっと 丁寧 に 伝えます。"
      ],
      es: [
        "Aunque es barato, nadie lo compra, ¿no?",
        "Sí. Tal vez falta explicación.",
        "Entonces lo comunicaré con más cuidado."
      ]
    },
    {
      title: "連休の予定",
      kana: [
        "れんきゅう なので、まち は にぎやか です。",
        "ひと が おおい のに、ホテル は あいて います ね。",
        "はやく よやく した から、へや は あります。"
      ],
      kanji: [
        "連休 なので、町 は にぎやか です。",
        "人 が 多い のに、ホテル は 空いて います ね。",
        "早く 予約 した から、部屋 は あります。"
      ],
      es: [
        "Como es puente, la ciudad está animada.",
        "Aunque hay mucha gente, el hotel tiene disponibilidad.",
        "Como reservamos temprano, hay habitación."
      ]
    },
    {
      title: "図と形",
      kana: [
        "この ずけい に ついて せつめい してください。",
        "かたち が かんたん なので、だれでも かけます。",
        "かんたん なのに、きれい ですね。"
      ],
      kanji: [
        "この 図形 に ついて 説明 してください。",
        "形 が 簡単 なので、誰でも 描けます。",
        "簡単 なのに、きれい ですね。"
      ],
      es: [
        "Explique sobre esta figura, por favor.",
        "Como la forma es simple, cualquiera puede dibujarla.",
        "Aunque es simple, es bonita."
      ]
    },
    {
      title: "接する仕事",
      kana: [
        "おきゃくさま に せっする しごと なので、ことば は たいせつ です。",
        "たいせつ なのに、まちがえ ました。",
        "れんしゅう した から、つぎ は だいじょうぶ です。"
      ],
      kanji: [
        "お客様 に 接する 仕事 なので、言葉 は 大切 です。",
        "大切 なのに、間違え ました。",
        "練習 した から、次 は 大丈夫 です。"
      ],
      es: [
        "Como es un trabajo de trato con clientes, el lenguaje es importante.",
        "Aunque es importante, me equivoqué.",
        "Como practiqué, la próxima vez estará bien."
      ]
    },
    {
      title: "困った時",
      kana: [
        "こまって いる のに、だれ にも いえません でした。",
        "どうして？",
        "きゅう だった ので、じかん が ありません でした。"
      ],
      kanji: [
        "困って いる のに、誰 にも 言えません でした。",
        "どうして？",
        "急 だった ので、時間 が ありません でした。"
      ],
      es: [
        "Aunque estaba en problemas, no pude decírselo a nadie.",
        "¿Por qué?",
        "Porque fue de repente y no tuve tiempo."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: きゅう に ようじ が できた から、でかけます。",
      "B: そう です か。きを つけて。",
      "A: はい。あとで でんわ します。"
    ],
    [
      "A: しずか な ので、ここで べんきょう しましょう。",
      "B: さんせい です。",
      "A: じゃあ、せきを えらび ましょう。"
    ],
    [
      "A: やすい のに、にんき が ありません ね。",
      "B: せつめい が たりない の かも。",
      "A: じゃ、ポスター を つくります。"
    ],
    [
      "A: こまって いる から、てつだって ください。",
      "B: もちろん。",
      "A: ありがとう。たすかります。"
    ],
    [
      "A: れんきゅう なので、ひと が おおい です。",
      "B: なのに、ホテル は あいて います ね。",
      "A: はやく よやく した から でしょう。"
    ],
    [
      "A: ずけい に ついて の せつめい を おねがい します。",
      "B: かたち が かんたん なので、すぐ できます。",
      "A: かんたん なのに、きれい ですね。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — sin repetir los del tema 13
  kanji10: [
    {
      ch: "困",
      kun: ["こま(る)"],
      on: ["こん"],
      es: "estar en problemas",
      trazos: 7,
      strokeCode: "56f0",
      ej: ["困る: estar en problemas", "大困難: gran dificultad"]
    },
    {
      ch: "急",
      kun: ["いそ(ぐ)"],
      on: ["きゅう"],
      es: "apresurado, repentino",
      trazos: 9,
      strokeCode: "6025",
      ej: ["急ぐ: apresurarse", "急用: asunto urgente"]
    },
    {
      ch: "連",
      kun: ["つら(なる)","つ(れる)"],
      on: ["れん"],
      es: "conectar, serie",
      trazos: 10,
      strokeCode: "9023",
      ej: ["連休: puente", "連れる: llevar a alguien"]
    },
    {
      ch: "接",
      kun: ["せっ(する)"],
      on: ["せつ"],
      es: "contacto, tratar con",
      trazos: 11,
      strokeCode: "63a5",
      ej: ["接する: tratar con", "直接: directo"]
    },
    {
      ch: "説",
      kun: [],
      on: ["せつ"],
      es: "explicación, teoría",
      trazos: 14,
      strokeCode: "8aac",
      ej: ["説明: explicación", "説: teoría"]
    },
    {
      ch: "要",
      kun: ["い(る)"],
      on: ["よう"],
      es: "necesitar, importante",
      trazos: 9,
      strokeCode: "8981",
      ej: ["要る: necesitar", "重要: importante"]
    },
    {
      ch: "図",
      kun: ["はか(る)"],
      on: ["ず","と"],
      es: "diagrama, plano",
      trazos: 7,
      strokeCode: "56f3",
      ej: ["図形: figura", "地図: mapa"]
    },
    {
      ch: "形",
      kun: ["かたち","かた"],
      on: ["けい","ぎょう"],
      es: "forma",
      trazos: 7,
      strokeCode: "5f62",
      ej: ["形: forma", "図形: figura"]
    },
    {
      ch: "重",
      kun: ["おも(い)","かさ(なる)"],
      on: ["じゅう","ちょう"],
      es: "pesado; importante",
      trazos: 9,
      strokeCode: "91cd",
      ej: ["重要: importante", "重ねる: apilar"]
    },
    {
      ch: "便",
      kun: ["たよ(り)"],
      on: ["べん","びん"],
      es: "conveniencia; correo",
      trazos: 9,
      strokeCode: "4fbf",
      ej: ["便利: práctico", "航空便: correo aéreo"]
    },
  ],
};

export default TEMA_14;
