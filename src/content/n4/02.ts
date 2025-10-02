// src/content/n4/02.ts

// Tipos locales mínimos (no exportados)
type VocabItem = { key: string; jp: string; romaji: string; es: string };
type OracionItem = { key: string; jp: string; romaji: string; es: string; exp: string };
type KanjiExample = { jp: string; yomi: string; es: string };
type KanjiItem = {
  ch: string; kun: string[]; on: string[]; es: string;
  ej: KanjiExample[]; strokeCode?: string; trazos?: number;
};
type Dialogo = { title: string; kana: string[]; kanji: string[]; es: string[] };

// 👇 Para “tablas” en gramática (las dibuja la screen con MiniTableView)
export type MiniTable = { title?: string; headers: string[]; rows: string[][]; note?: string };

const TEMA_2 = {
  objetivos: [
    "Clasificar verbos en 3 grupos y pasar: ます → diccionario → て.",
    "Pedir y prohibir suave: 「〜てください」「〜ないでください」。",
    "Pedir/recibir ayuda: 「〜てくれる」「〜てもらう」。",
    "Dar consejo: 「〜たほうが いい」「〜ないほうが いい」。",
    "Dar orden suave: 「〜なさい」。",
  ],

  vocabClase: [
    { key: "v1",  jp: "ドア", romaji: "doa", es: "puerta" },
    { key: "v2",  jp: "まど", romaji: "mado", es: "ventana" },
    { key: "v3",  jp: "でんき", romaji: "denki", es: "luz / electricidad" },
    { key: "v4",  jp: "エアコン", romaji: "eakon", es: "aire acondicionado" },
    { key: "v5",  jp: "てれび", romaji: "terebi", es: "televisión" },
    { key: "v6",  jp: "おと", romaji: "oto", es: "sonido / volumen" },
    { key: "v7",  jp: "へや", romaji: "heya", es: "habitación" },
    { key: "v8",  jp: "しゅくだい", romaji: "shukudai", es: "tarea" },
    { key: "v9",  jp: "かたづける", romaji: "katazukeru", es: "ordenar / recoger" },
    { key: "v10", jp: "てつだう", romaji: "tetsudau", es: "ayudar" },
  ],

  oraciones6: [
    { key: "s1", jp: "まどを あけてください。", romaji: "mado o akete kudasai.", es: "Por favor, abre la ventana.", exp: "Vてください (pedir favor)" },
    { key: "s2", jp: "ここで おおきい こえで はなさないでください。", romaji: "koko de ookii koe de hanasanaide kudasai.", es: "Por favor, no hables fuerte aquí.", exp: "Vないでください (prohibición suave)" },
    { key: "s3", jp: "このはこ、はこんでくれる？", romaji: "kono hako, hakonde kureru?", es: "¿Me ayudas a cargar esta caja?", exp: "Vてくれる (favor hacia mí)" },
    { key: "s4", jp: "あしたまでに なおして もらえますか。", romaji: "ashita made ni naoshite moraemasu ka.", es: "¿Podrías arreglarlo para mañana (para mí)?", exp: "Vてもらう (yo recibo la ayuda)" },
    { key: "s5", jp: "さむいから、まどは しめたほうが いいです。", romaji: "samui kara, mado wa shimeta hou ga ii desu.", es: "Hace frío, mejor cierra la ventana.", exp: "Vたほうが いい (consejo +)" },
    { key: "s6", jp: "おそいから、いまは てれびを みないほうが いいです。", romaji: "osoi kara, ima wa terebi o minai hou ga ii desu.", es: "Es tarde; mejor no veas la tele ahora.", exp: "Vないほうが いい (consejo −)" },
  ],

  gramatica: {
    titulo: "Gramática (explicado fácil, sin kanji)",

    puntos: [
      /* === CÓMO CLASIFICAR VERBOS (3 GRUPOS) — ‘regla de las vocales’ === */
      {
        regla: "Cómo clasificar los verbos (3 grupos) — regla de las vocales (primaria)",
        pasoapaso: [
          "Paso 1: quita 「ます」 y mira la raíz (ej.: よみます→よみ / たべます→たべ / みます→み).",
          "Grupo 2 (ichidan): si la raíz tiene 1 vocal (ej.: み) o termina en え (…え), es G2 → a diccionario solo agregas 「る」 (み→みる / たべ→たべる).",
          "Grupo 1 (godan): si la raíz tiene 2 vocales o más (ej.: よみ, はなし, かい, およぎ), es G1 → usas el cambio de い→う (ver tabla).",
          "Grupo 3 (irregulares): します→する、きます→くる (de memoria).",
          "Nota: hay excepciones raras; si dudas, revisa en diccionario. Pero este truco funciona muy bien en primaria.",
        ],
        ejemploJP: "みます → みる ／ たべます → たべる ／ よみます → よむ",
        ejemploRoma: "mimasu → miru / tabemasu → taberu / yomimasu → yomu",
        ejemploES: "Clasificamos con la raíz y aplicamos la regla de vocales.",
        tabla: {
          title: "Guía rápida: ¿G1 o G2 con vocales?",
          headers: ["raíz (sin ます)", "vocales", "grupo", "a diccionario"],
          rows: [
            ["み", "1", "G2", "み＋る → みる"],
            ["たべ", "termina en え", "G2", "たべ＋る → たべる"],
            ["よみ", "2+", "G1", "よみ(ます) → よむ"],
            ["はなし", "2+", "G1", "はなし(ます) → はなす"],
            ["かい", "2+", "G1", "かい(ます) → かう"],
            ["およぎ", "2+", "G1", "およぎ(ます) → およぐ"],
          ],
          note: "Grupo 3: します→する、きます→くる.",
        } as MiniTable,
      },

      /* === ます → diccionario (con mapa i→u para G1) === */
      {
        regla: "De ます a diccionario — paso a paso",
        pasoapaso: [
          "Grupo 2: quita 「ます」 y agrega 「る」 (たべます→たべる／みます→みる).",
          "Grupo 1: cambia la última い a su う correspondiente (ver mapa).",
          "Grupo 3: します→する、きます→くる。",
        ],
        ejemploJP: "かきます → かく ／ よみます → よむ",
        ejemploRoma: "kakimasu → kaku / yomimasu → yomu",
        ejemploES: "Para G1 usamos el mapa i→u.",
        tabla: {
          title: "Grupo 1: mapa い → う (ます → diccionario)",
          headers: ["terminación ます", "diccionario", "ejemplo (kana)"],
          rows: [
            ["…きます", "…く", "かきます→かく"],
            ["…ぎます", "…ぐ", "およぎます→およぐ"],
            ["…します", "…す", "はなします→はなす"],
            ["…ちます", "…つ", "まちます→まつ"],
            ["…にます", "…ぬ", "しにます→しぬ"],
            ["…びます", "…ぶ", "あそびます→あそぶ"],
            ["…みます", "…む", "よみます→よむ"],
            ["…ります", "…る", "とります→とる"],
            ["…います", "…う", "かいます→かう ／ あいます→あう"],
          ],
          note: "Especial: いきます→いく。",
        } as MiniTable,
      },

      /* === diccionario → て形 === */
      {
        regla: "De diccionario a て形 (tabla sencilla)",
        pasoapaso: [
          "Grupo 2: 〜る → 〜て (たべる→たべて／みる→みて).",
          "Grupo 1: depende de la última sílaba (ver tabla).",
          "Grupo 3: する→して、くる→きて。",
        ],
        ejemploJP: "たべる → たべて",
        ejemploRoma: "taberu → tabete",
        ejemploES: "Ejemplo G2.",
        tabla: {
          title: "diccionario → て形",
          headers: ["tipo", "regla", "ejemplo (かな)"],
          rows: [
            ["G1", "う・つ・る → って", "あう→あって ／ まつ→まって ／ とる→とって"],
            ["G1", "む・ぶ・ぬ → んで", "よむ→よんで ／ あそぶ→あそんで ／ しぬ→しんで"],
            ["G1", "く → いて（※ いく→いって）", "かく→かいて ／ いく→いって"],
            ["G1", "ぐ → いで", "およぐ→およいで"],
            ["G1", "す → して", "はなす→はなして"],
            ["G2", "〜る → 〜て", "たべる→たべて ／ みる→みて"],
            ["G3", "する→して ／ くる→きて", ""],
          ],
          note: "Excepción: いく→いって。",
        } as MiniTable,
      },

      /* === Vてください === */
      {
        regla: "Vてください — pide algo con educación",
        pasoapaso: [
          "1) Convierte el verbo a て形.",
          "2) Añade 「ください」。",
          "「〜してください」 suena más formal.",
        ],
        ejemploJP: "まどを あけてください。",
        ejemploRoma: "mado o akete kudasai.",
        ejemploES: "Por favor, abre la ventana.",
        ejemplos: [
          { jp: "でんきを つけてください.", roma: "denki o tsukete kudasai.", es: "Enciende la luz, por favor." },
          { jp: "おとを さげてください.", roma: "oto o sagete kudasai.", es: "Baja el volumen, por favor." },
          { jp: "ここに すわってください.", roma: "koko ni suwatte kudasai.", es: "Siéntate aquí, por favor." },
          { jp: "ごみを だしてください.", roma: "gomi o dashite kudasai.", es: "Saca la basura, por favor." },
          { jp: "どあを しめてください.", roma: "doa o shimete kudasai.", es: "Cierra la puerta, por favor." },
          { jp: "へやを かたづけてください.", roma: "heya o katazukete kudasai.", es: "Ordena el cuarto, por favor." },
          { jp: "しゅくだいを てつだってください.", roma: "shukudai o tetsudatte kudasai.", es: "Ayúdame con la tarea, por favor." },
        ],
      },

      /* === Vないでください (con TABLA diccionario → ない形 → ないでください) === */
      {
        regla: "Vないでください — ‘por favor, no hagas…’ (prohibición suave)",
        pasoapaso: [
          "Primero forma ない形.",
          "Grupo 2: 〜る → 〜ない（たべる→たべない／みる→みない）",
          "Grupo 1: 〜う → 〜あ＋ない（かく→かかない／よむ→よまない／はなす→はなさない／いく→いかない／あう→あわない など）",
          "Grupo 3: する→しない、くる→こない",
          "Luego añade 「ないでください」。",
        ],
        ejemploJP: "ここで はしらないでください。",
        ejemploRoma: "koko de hashiranai de kudasai.",
        ejemploES: "Por favor, no corras aquí.",
        tabla: {
          title: "diccionario → ない形 → ないでください",
          headers: ["grupo/patrón", "diccionario", "ない形", "〜ないでください (ej.)"],
          rows: [
            ["G2", "たべる / みる", "たべない / みない", "たべないでください / みないでください"],
            ["G1 う", "あう", "あわない", "あわないでください"],
            ["G1 く", "かく", "かかない", "かかないでください"],
            ["G1 ぐ", "およぐ", "およがない", "およがないでください"],
            ["G1 す", "はなす", "はなさない", "はなさないでください"],
            ["G1 つ", "まつ", "またない", "またないでください"],
            ["G1 る", "とる", "とらない", "とらないでください"],
            ["G1 む", "よむ", "よまない", "よまないでください"],
            ["G1 ぶ", "あそぶ", "あそばない", "あそばないでください"],
            ["G1 ぬ", "しぬ", "しなない", "しなないでください"],
            ["G1 (esp.)", "いく", "いかない", "いかないでください"],
            ["G3", "する / くる", "しない / こない", "しないでください / こないでください"],
          ],
          note: "Recuerda: ある → ない（estado; no lleva でください).",
        } as MiniTable,
        ejemplos: [
          { jp: "おおきい こえで はなさないでください.", roma: "ookii koe de hanasanaide kudasai.", es: "No hables fuerte, por favor." },
          { jp: "でんきを けさないでください.", roma: "denki o kesanaide kudasai.", es: "No apagues la luz, por favor." },
          { jp: "まどを あけないでください.", roma: "mado o akenaide kudasai.", es: "No abras la ventana, por favor." },
          { jp: "ごみを すてないでください.", roma: "gomi o sutenaide kudasai.", es: "No tires basura, por favor." },
          { jp: "てれびを つけっぱなしに しないでください.", roma: "terebi o tsukeppanashi ni shinaide kudasai.", es: "No dejes la tele encendida." },
          { jp: "きけんな ところへ いかないでください.", roma: "kikenna tokoro e ikanaide kudasai.", es: "No vayas a lugares peligrosos." },
          { jp: "ここで たべないでください.", roma: "koko de tabenaide kudasai.", es: "No comas aquí, por favor." },
        ],
      },

      /* === Vてくれる === */
      {
        regla: "Vてくれる — alguien hace algo por mí (favor hacia mí)",
        pasoapaso: [
          "Vて＋くれる.",
          "Para pedir: 「〜てくれる？」 / más amable 「〜てくれますか？」.",
          "Se siente que el favor viene hacia ‘yo / nuestro grupo’.",
        ],
        ejemploJP: "このはこ、はこんでくれる？",
        ejemploRoma: "kono hako, hakonde kureru?",
        ejemploES: "¿Me ayudas a cargar esta caja?",
        ejemplos: [
          { jp: "まどを しめてくれる？", roma: "mado o shimete kureru?", es: "¿Me cierras la ventana?" },
          { jp: "でんきを けしてくれる？", roma: "denki o keshite kureru?", es: "¿Apagas la luz por mí?" },
          { jp: "おとを ちいさく してくれる？", roma: "oto o chiisaku shite kureru?", es: "¿Bajas el volumen, por favor?" },
          { jp: "へやを かたづけてくれる？", roma: "heya o katazukete kureru?", es: "¿Ordenas el cuarto por mí?" },
          { jp: "この にもつを はこんでくれる？", roma: "kono nimotsu o hakonde kureru?", es: "¿Me ayudas con este equipaje?" },
          { jp: "しゅくだいを てつだってくれる？", roma: "shukudai o tetsudatte kureru?", es: "¿Me ayudas con la tarea?" },
          { jp: "じかんを おしえてくれる？", roma: "jikan o oshiete kureru?", es: "¿Me dices la hora?" },
        ],
      },

      /* === Vてもらう === */
      {
        regla: "Vてもらう — yo recibo la ayuda de alguien",
        pasoapaso: [
          "（ひと）に＋Vて＋もらう。",
          "Pedir amable: 「〜てもらえますか？」.",
          "En pasado: 「〜てもらいました」 (recibí ayuda).",
        ],
        ejemploJP: "せんせいに なおして もらえますか。",
        ejemploRoma: "sensei ni naoshite moraemasu ka.",
        ejemploES: "¿Podría el profe arreglarlo por mí?",
        ejemplos: [
          { jp: "ともだちに にもつを はこんで もらいました。", roma: "tomodachi ni nimotsu o hakonde moraimashita.", es: "Un amigo me ayudó con el equipaje." },
          { jp: "ははに まどを あけて もらいました。", roma: "haha ni mado o akete moraimashita.", es: "Mi mamá abrió la ventana por mí." },
          { jp: "どうりょうに しりょうを おくって もらいました。", roma: "douryou ni shiryou o okutte moraimashita.", es: "Un colega me envió los documentos." },
          { jp: "かんりにんさんに なおして もらえますか。", roma: "kanrinin-san ni naoshite moraemasen ka.", es: "¿Podemos pedir al conserje que lo arregle?" },
          { jp: "せんぱいに べんきょうを おしえて もらいました。", roma: "senpai ni benkyou o oshiete moraimashita.", es: "Un senpai me enseñó a estudiar." },
          { jp: "いもうとに ドアを しめて もらった。", roma: "imouto ni doa o shimete moratta.", es: "Mi hermana cerró la puerta por mí." },
          { jp: "でんわで てつだって もらえますか。", roma: "denwa de tetsudatte moraemasu ka.", es: "¿Podrías ayudarme por teléfono?" },
        ],
      },

      /* === Vたほうが いい (con TABLA diccionario → た形) === */
      {
        regla: "Vたほうが いい — consejo: ‘es mejor hacer…’",
        pasoapaso: [
          "Convierte a た形 y añade 「ほうが いい」。",
          "Con 「です」 suena más formal.",
          "La た形 sigue las mismas reglas que la て形, pero て→た y で→だ.",
        ],
        ejemploJP: "へやを かたづけたほうが いいよ。",
        ejemploRoma: "heya o katazuketa hou ga ii yo.",
        ejemploES: "Mejor ordena tu cuarto.",
        tabla: {
          title: "diccionario → た形（paralela a て形）",
          headers: ["tipo", "regla", "ejemplo (かな)"],
          rows: [
            ["G1", "う・つ・る → った", "あう→あった ／ まつ→まった ／ とる→とった"],
            ["G1", "む・ぶ・ぬ → んだ", "よむ→よんだ ／ あそぶ→あそんだ ／ しぬ→しんだ"],
            ["G1", "く → いた（※ いく→いった）", "かく→かいた ／ いく→いった"],
            ["G1", "ぐ → いだ", "およぐ→およいだ"],
            ["G1", "す → した", "はなす→はなした"],
            ["G2", "〜る → 〜た", "たべる→たべた ／ みる→みた"],
            ["G3", "する→した ／ くる→きた", ""],
          ],
          note: "Piensa: ‘si era 〜て, ahora 〜た; si era 〜で, ahora 〜だ’.",
        } as MiniTable,
        ejemplos: [
          { jp: "はやく ねたほうが いい。", roma: "hayaku neta hou ga ii.", es: "Mejor duérmete temprano." },
          { jp: "つかれたら やすんだほうが いい。", roma: "tsukaretara yasunda hou ga ii.", es: "Si te cansas, mejor descansa." },
          { jp: "あめの ひは かさを もって いったほうが いい。", roma: "ame no hi wa kasa o motte itta hou ga ii.", es: "Si llueve, mejor lleva paraguas." },
          { jp: "おとを さげたほうが いい。", roma: "oto o sageta hou ga ii.", es: "Mejor baja el volumen." },
          { jp: "でんきを けしたほうが いい。", roma: "denki o keshita hou ga ii.", es: "Mejor apaga la luz." },
          { jp: "しゅくだいは きょう したほうが いい。", roma: "shukudai wa kyou shita hou ga ii.", es: "Mejor haz la tarea hoy." },
          { jp: "あさ ごはんを たべたほうが いい。", roma: "asa gohan o tabeta hou ga ii.", es: "Mejor desayuna." },
        ],
      },

      /* === Vないほうが いい === */
      {
        regla: "Vないほうが いい — consejo: ‘es mejor no hacer…’",
        pasoapaso: [
          "Usa la ない形 + 「ほうが いい」。",
          "Para する: しないほうが いい。",
        ],
        ejemploJP: "よるは こーひーを のまないほうが いい。",
        ejemploRoma: "yoru wa koohii o nomanai hou ga ii.",
        ejemploES: "De noche, mejor no tomes café.",
        ejemplos: [
          { jp: "いまは てれびを みないほうが いい。", roma: "ima wa terebi o minai hou ga ii.", es: "Mejor no veas la tele ahora." },
          { jp: "おおきい こえで はなさないほうが いい。", roma: "ookii koe de hanasanai hou ga ii.", es: "Mejor no hables fuerte." },
          { jp: "でんきを つけっぱなしに しないほうが いい。", roma: "denki o tsukeppanashi ni shinai hou ga ii.", es: "Mejor no dejes la luz encendida." },
          { jp: "あぶない ところへ いかないほうが いい。", roma: "abunai tokoro e ikanai hou ga ii.", es: "Mejor no vayas a lugares peligrosos." },
          { jp: "たべすぎないほうが いい。", roma: "tabesuginai hou ga ii.", es: "Mejor no comas de más." },
          { jp: "ねる まえに けいたいを つかわないほうが いい。", roma: "neru mae ni keitai o tsukawanai hou ga ii.", es: "Mejor no uses el móvil antes de dormir." },
          { jp: "よる おそく でかけないほうが いい。", roma: "yoru osoku dekakenai hou ga ii.", es: "Mejor no salgas muy tarde." },
        ],
      },

      /* === Vます語幹＋なさい === */
      {
        regla: "Vますごかん＋なさい — orden suave (de mayor a menor)",
        pasoapaso: [
          "Quita 「ます」 (queda la raíz).",
          "Añade 「なさい」。",
          "Se usa de arriba hacia abajo (mamá, profe).",
        ],
        ejemploJP: "ここに すわりなさい。",
        ejemploRoma: "koko ni suwari nasai.",
        ejemploES: "Siéntate aquí.",
        ejemplos: [
          { jp: "はやく ねなさい。", roma: "hayaku ne nasai.", es: "Duérmete temprano." },
          { jp: "しゅくだいを しなさい。", roma: "shukudai o shi nasai.", es: "Haz la tarea." },
          { jp: "てれびを けしなさい。", roma: "terebi o keshi nasai.", es: "Apaga la tele." },
          { jp: "てを あらいなさい。", roma: "te o arai nasai.", es: "Lávate las manos." },
          { jp: "へやを かたづけなさい。", roma: "heya o katazuke nasai.", es: "Ordena tu cuarto." },
          { jp: "でんきを つけなさい。", roma: "denki o tsuke nasai.", es: "Enciende la luz." },
          { jp: "しずかに しなさい。", roma: "shizuka ni shi nasai.", es: "Guarda silencio." },
        ],
      },
    ],
  },

  // Diálogos (usan la gramática de esta screen) con traducción línea por línea
  dialogos: [
    {
      title: "おねがい １（てください・ないでください）",
      kana: [
        "A: すみません、まどを あけてください。",
        "B: はい、あけます。てれびは つけないでくださいね。",
        "A: わかりました。おとを さげてください。",
        "B: はい、さげます。",
      ],
      kanji: [
        "A: すみません、窓を開けてください。",
        "B: はい、開けます。テレビはつけないでくださいね。",
        "A: わかりました。音を下げてください。",
        "B: はい、下げます。",
      ],
      es: [
        "A: Disculpa, por favor abre la ventana.",
        "B: Sí, la abro. Y por favor no enciendas la tele, ¿vale?",
        "A: Entendido. Baja el volumen, por favor.",
        "B: Sí, lo bajo.",
      ],
    },
    {
      title: "おねがい ２（てくれる・てもらう）",
      kana: [
        "A: このはこ、はこんでくれる？",
        "B: いいよ。せんせいに もしらせて もらえる？",
        "A: うん、メールを おくって もらうね。",
      ],
      kanji: [
        "A: この箱、運んでくれる？",
        "B: いいよ。先生にも知らせて もらえる？",
        "A: うん、メールを送って もらうね。",
      ],
      es: [
        "A: ¿Me ayudas a cargar esta caja?",
        "B: Claro. ¿Puedes avisarle al profe por mí?",
        "A: Sí, pediré que envíen un correo.",
      ],
    },
    {
      title: "アドバイス（たほうが いい・ないほうが いい・なさい）",
      kana: [
        "A: さむいね。まどは しめたほうが いいよ。",
        "B: そうだね。きょうは おそいから、てれびは みないほうが いい？",
        "A: うん。はやく ねなさい。",
      ],
      kanji: [
        "A: 寒いね。窓は閉めたほうがいいよ。",
        "B: そうだね。今日は遅いから、テレビは見ないほうがいい？",
        "A: うん。早く寝なさい。",
      ],
      es: [
        "A: Hace frío. Es mejor cerrar la ventana.",
        "B: Sí. Como hoy es tarde, ¿mejor no ver la tele?",
        "A: Sí. Duérmete temprano.",
      ],
    },
  ] as Dialogo[],

  // Este es el set que usa el componente de ordenar (un único diálogo)
  quizLines: [
    "A: すみません、でんきを つけてください。",
    "B: はい、つけます。まどは あけないでくださいね。",
    "A: わかりました。おとを さげてくれる？",
    "B: いいよ。はやく ねたほうが いいよ。",
  ],

  // Kanji (para tu carrusel KanjiVG)
  kanji10: [
    { ch: "家", kun: ["いえ","や"], on: ["カ"], es: "casa / hogar", ej: [
      { jp: "家に帰ってください。", yomi: "いえにかえってください。", es: "Por favor, vuelve a casa." },
      { jp: "家を出る前に電気を消しなさい。", yomi: "いえをでるまえにでんきをけしなさい。", es: "Apaga la luz antes de salir." },
    ], strokeCode: "5bb6" },
    { ch: "室", kun: [], on: ["シツ"], es: "cuarto / sala", ej: [
      { jp: "教室の窓を開けてください。", yomi: "きょうしつのまどをあけてください。", es: "Abre la ventana del salón, por favor." },
      { jp: "室内で音楽を流さないでください。", yomi: "しつないでおんがくをながさないでください。", es: "No pongas música dentro del cuarto." },
    ], strokeCode: "5ba4" },
    { ch: "窓", kun: ["まど"], on: [], es: "ventana", ej: [
      { jp: "窓を閉めたほうがいいです。", yomi: "まどをしめたほうがいいです。", es: "Mejor cierra la ventana." },
      { jp: "窓から身を乗り出さないでください。", yomi: "まどからみをのりださないでください。", es: "No te asomes por la ventana." },
    ], strokeCode: "7a93" },
    { ch: "戸", kun: ["と"], on: [], es: "puerta (corrediza)", ej: [
      { jp: "戸を静かに閉めてください。", yomi: "とをしずかにしめてください。", es: "Cierra la puerta con cuidado." },
      { jp: "戸を開けっぱなしにしないでください。", yomi: "とをあけっぱなしにしないでください。", es: "No dejes la puerta abierta." },
    ], strokeCode: "6238" },
    { ch: "開", kun: ["あ-く","あ-ける"], on: ["カイ"], es: "abrir", ej: [
      { jp: "ドアを開けてください。", yomi: "どあをあけてください。", es: "Abre la puerta, por favor." },
      { jp: "雨だから窓は開けないほうがいい。", yomi: "あめだからまどはあけないほうがいい。", es: "Como llueve, mejor no abras la ventana." },
    ], strokeCode: "958b" },
    { ch: "閉", kun: ["し-める","と-じる"], on: ["ヘイ"], es: "cerrar", ej: [
      { jp: "窓を閉めてください。", yomi: "まどをしめてください。", es: "Cierra la ventana, por favor." },
      { jp: "ドアを閉じなさい。", yomi: "どあをとじなさい。", es: "Cierra la puerta." },
    ], strokeCode: "9589" },
    { ch: "電", kun: [], on: ["デン"], es: "electricidad", ej: [
      { jp: "電気をつけてください。", yomi: "でんきをつけてください。", es: "Enciende la luz, por favor." },
      { jp: "出る時は電気を消しなさい。", yomi: "でるときはでんきをけしなさい。", es: "Cuando salgas, apaga la luz." },
    ], strokeCode: "96fb" },
    { ch: "明", kun: ["あか-るい","あ-ける"], on: ["メイ"], es: "claro / abrir", ej: [
      { jp: "外は明るいから、電気を消してもいい。", yomi: "そとはあかるいから、でんきをけしてもいい。", es: "Afuera está claro; puedes apagar la luz." },
      { jp: "戸を明けてください。", yomi: "とをあけてください。", es: "Abre la puerta (variante escrita)." },
    ], strokeCode: "660e" },
    { ch: "付", kun: ["つ-ける","つ-く"], on: ["フ"], es: "prender / pegar", ej: [
      { jp: "電気を付けてください。", yomi: "でんきをつけてください。", es: "Por favor, prende la luz." },
      { jp: "エアコンが付いている。", yomi: "えあこんがついている。", es: "El aire acondicionado está encendido." },
    ], strokeCode: "4ed8" },
    { ch: "消", kun: ["け-す","き-える"], on: ["ショウ"], es: "apagar / desaparecer", ej: [
      { jp: "テレビを消してください。", yomi: "てれびをけしてください。", es: "Por favor, apaga la tele." },
      { jp: "火を消しなさい。", yomi: "ひをけしなさい。", es: "Apaga el fuego." },
    ], strokeCode: "6d88" },
  ] as KanjiItem[],
};

export default TEMA_2;
