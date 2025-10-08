// src/content/n4/26.ts
import { type ThemeContent } from "./types";

const TEMA_26: ThemeContent = {
  numero: 26,
  emoji: "💭",
  titulo: "Condicionales",
  subtitulo: "「〜たら」「〜ば」「〜なら」",

  objetivos: [
    "Usar 〜たら para ‘cuando/si (después de que…)’",
    "Formar 〜ば (condición hipotética, más formal)",
    "Usar 〜なら para ‘si es el caso de…/en cuanto a…’",
    "Combinar con tiempo, direcciones y acciones cotidianas",
    "Evitar kanji no vistos: usar kana si hace falta"
  ],

  vocabClase: [
    { key: "v1",  jp: "ばあい（場合）",      romaji: "baai",             es: "caso; en caso de" },
    { key: "v2",  jp: "みち（道）",          romaji: "michi",            es: "camino; calle" },
    { key: "v3",  jp: "かえる（帰る）",      romaji: "kaeru",            es: "volver a casa" },
    { key: "v4",  jp: "まつ（待つ）",        romaji: "matsu",            es: "esperar" },
    { key: "v5",  jp: "おくる（送る）",      romaji: "okuru",            es: "enviar" },
    { key: "v6",  jp: "わすれる（忘れる）",  romaji: "wasureru",         es: "olvidar" },
    { key: "v7",  jp: "むかう（向かう）",    romaji: "mukau",            es: "dirigirse a" },
    { key: "v8",  jp: "まがる（曲がる）",    romaji: "magaru",           es: "girar; doblar" },
    { key: "v9",  jp: "ちがう（違う）",      romaji: "chigau",           es: "estar equivocado; ser distinto" },
    { key: "v10", jp: "かど（角）",          romaji: "kado",             es: "esquina" },
    { key: "v11", jp: "こうさてん",          romaji: "kōsaten",          es: "cruce/intersección" },
    { key: "v12", jp: "まっすぐ",            romaji: "massugu",          es: "recto; derecho" },
    { key: "v13", jp: "みぎ",                romaji: "migi",             es: "derecha" },
    { key: "v14", jp: "ひだり",              romaji: "hidari",           es: "izquierda" },
    { key: "v15", jp: "でんわ",              romaji: "denwa",            es: "teléfono; llamada" },
    { key: "v16", jp: "メッセージ",          romaji: "messēji",         es: "mensaje" },
    { key: "v17", jp: "ゆき（雪）",          romaji: "yuki",             es: "nieve" },
    { key: "v18", jp: "あめ（雨）",          romaji: "ame",              es: "lluvia" },
  ],

  oraciones6: [
    { key: "o1", jp: "あめが ふったら、いえに 帰ります。", romaji: "Ame ga futtara, ie ni kaerimasu.", es: "Si llueve, volveré a casa.", exp: "V-た + ら：condición cumplida → resultado." },
    { key: "o2", jp: "じかんが あれば、こうえんへ 行きます。", romaji: "Jikan ga areba, kōen e ikimasu.", es: "Si tengo tiempo, iré al parque.", exp: "V/adj/nombre + ば：hipótesis general." },
    { key: "o3", jp: "えきに 着いたら、でんわして ください。", romaji: "Eki ni tsuitara, denwa shite kudasai.", es: "Cuando llegues a la estación, llámame.", exp: "Hecho terminado + たら → acción siguiente." },
    { key: "o4", jp: "ひだりに 曲がれば、としょかんです。", romaji: "Hidari ni magareba, toshokan desu.", es: "Si giras a la izquierda, está la biblioteca.", exp: "五段→え段 + ば（曲がる→曲がれ＋ば）" },
    { key: "o5", jp: "ゆきなら、バスで 行きましょう。", romaji: "Yuki nara, basu de ikimashō.", es: "Si es nieve, vayamos en bus.", exp: "〜なら：‘si es el caso de…’ (tema/condición)" },
    { key: "o6", jp: "メッセージを 忘れたら、あとで 送ります。", romaji: "Messēji o wasuretara, ato de okurimasu.", es: "Si olvido el mensaje, lo enviaré después.", exp: "一段：忘れる→忘れた＋ら。" },
  ],

  gramatica: {
  titulo: "Como en primaria: tres condicionales (usar y no usar)",
  puntos: [
    {
      regla: "① 〜たら — ‘cuando/si X (después de que ocurra), Y’",
      pasoapaso: [
        "Fórmula: ‘forma pasada + ら’.",
        "Verbos: 行く → 行ったら / する → したら / 来る(くる) → 来たら(きたら)。",
        "い-adj: 高い → 高かったら。 な-adj: 便利だ → 便利だったら。 名詞: 雨だ → 雨だったら。",
        "Uso típico: secuencia real/temporal. ‘Cuando llegue, llamo’.",
        "⚠️ Evita たら cuando la 1ª parte es algo que no puede “completarse” (p. ej., ‘もし お金があったら…’ sí; ‘時間がある’ no es un suceso, mejor ば).",
        "Marcador opcional もし al inicio: enfatiza ‘si’."
      ],
      ejemploJP: "家に 帰ったら、でんわします。",
      ejemploRoma: "Ie ni kaettara, denwa shimasu.",
      ejemploES: "Cuando llegue a casa, llamaré.",
      tabla: {
        headers: ["Tipo", "Base", "→ た形", "＋ら（JP）", "Romaji"],
        rows: [
          ["五段", "待つ", "待った", "待ったら", "matsu → matta → mattara"],
          ["一段", "忘れる", "忘れた", "忘れたら", "wasureru → wasureta → wasuretara"],
          ["不規則", "する／来る", "した／来た", "したら／来たら", "suru→shitara／kuru→kitara"],
          ["い-adj", "高い", "高かった", "高かったら", "takai → takakatta → takakattara"],
          ["な-adj", "静かだ", "静かだった", "静かだったら", "shizuka da → shizuka datta → shizuka dattara"],
          ["名詞", "雨だ", "雨だった", "雨だったら", "ame da → ame datta → ame dattara"],
          ["否定", "行かない", "行かなかった", "行かなかったら", "ikanai → ikanakatta → ikanakattara"]
        ]
      },
      ejemplos: [
        { jp: "あめが ふったら、いえに 帰ります。", roma: "Ame ga futtara, ie ni kaerimasu.", es: "Si llueve, volveré a casa." },
        { jp: "えきに 着いたら、でんわして ください。", roma: "Eki ni tsuitara, denwa shite kudasai.", es: "Cuando llegues a la estación, llámame." },
        { jp: "時間が あったら、こうえんを さんぽ します。", roma: "Jikan ga attara, kōen o sanpo shimasu.", es: "Si tengo tiempo, paseo por el parque." },
        { jp: "角を まがったら、としょかんが 見えます。", roma: "Kado o magattara, toshokan ga miemasu.", es: "Al doblar la esquina, verás la biblioteca." },
        { jp: "家に 帰ったら、メッセージを おくります。", roma: "Ie ni kaettara, messēji o okurimasu.", es: "Cuando vuelva a casa, enviaré el mensaje." },
        { jp: "ゆきが やんだら、出かけましょう。", roma: "Yuki ga yandara, dekakemashō.", es: "Cuando pare la nieve, salgamos." },
        { jp: "もし まちがえたら、もういちど 聞いて ください。", roma: "Moshi machigaetara, mō ichido kiite kudasai.", es: "Si te equivocas, vuelve a preguntar." },
        { jp: "電車が 来たら、のりかえます。", roma: "Densha ga kitara, norikaemasu.", es: "Cuando llegue el tren, hago transbordo." }
      ]
    },

    {
      regla: "② 〜ば — ‘si… (condición lógica/general), entonces…’",
      pasoapaso: [
        "Más neutro/lógico que たら. No marca orden temporal.",
        "五段: ‘u→e’ + ば（行く→行けば／読む→読めば／待つ→待てば）。",
        "一段: ‘る を取る’+ れば（食べる→食べれば／忘れる→忘れれば）。",
        "否定: 〜ない → 〜なければ（行かない→行かなければ）。",
        "い-adj: 〜い → 〜ければ（安い→安ければ／新しい→新しければ）。",
        "な-adj・名詞: N4 usa 〜なら（静かなら／雨なら）。Formal: 〜であれば。",
        "⚠️ Evita ば si quieres decir ‘cuando pase A, después hago B’ → usa たら."
      ],
      ejemploJP: "時間が あれば、連絡します。",
      ejemploRoma: "Jikan ga areba, renraku shimasu.",
      ejemploES: "Si tengo tiempo, te contacto.",
      tabla: {
        headers: ["Tipo", "Base", "→ ば形", "Romaji (→ば)"],
        rows: [
          ["五段", "行く／読む／待つ／話す／買う", "行けば／読めば／待てば／話せば／買えば", "iku→ikeba / yomu→yomeba / matsu→mateba / hanasu→hanaseba / kau→kaeba"],
          ["一段", "食べる／忘れる／見る／出る", "食べれば／忘れれば／見れば／出れば", "taberu→tabereba / wasureru→wasurereba / miru→mireba / deru→dereba"],
          ["不規則", "する／来る", "すれば／くれば", "suru→sureba / kuru→kureba"],
          ["否定(動詞)", "行かない", "行かなければ", "ikanai→ikanakereba"],
          ["い-adj", "あつい／ひろい／安い", "あつければ／ひろければ／安ければ", "atsui→atsukereba / hiroi→hirokereba / yasui→yasukereba"],
          ["例外", "いい", "よければ", "ii→yokereba"],
          ["な-adj/名詞", "静かだ／雨", "静かなら／雨なら（N4）", "shizuka nara / ame nara"]
        ]
      },
      ejemplos: [
        { jp: "時間が あれば、行きます。", roma: "Jikan ga areba, ikimasu.", es: "Si tengo tiempo, voy." },
        { jp: "お金が なければ、買いません。", roma: "Okane ga nakereba, kaimasen.", es: "Si no tengo dinero, no compro." },
        { jp: "まっすぐ 行けば、駅です。", roma: "Massugu ikeba, eki desu.", es: "Si vas recto, está la estación." },
        { jp: "左に 曲がれば、としょかんが あります。", roma: "Hidari ni magareba, toshokan ga arimasu.", es: "Si giras a la izquierda, está la biblioteca." },
        { jp: "ひま で なければ、メッセージを おねがいします。", roma: "Hima de nakereba, messēji o onegaishimasu.", es: "Si no estás ocupado, mándame un mensaje." },
        { jp: "安ければ、これに します。", roma: "Yasukereba, kore ni shimasu.", es: "Si es barato, elijo este." },
        { jp: "よければ、ここで 待ちましょう。", roma: "Yokereba, koko de machimashō.", es: "Si te parece bien, esperemos aquí." },
        { jp: "行かなければ、間に合いません。", roma: "Ikanakereba, maniaimasen.", es: "Si no voy, no llegaré a tiempo." }
      ]
    },

    {
      regla: "③ 〜なら — ‘si es el caso de… / en cuanto a…’（tema dado）",
      pasoapaso: [
        "名詞/フレーズ + なら + 結果（XならY）。",
        "Se usa cuando el ‘tema X’ ya se mencionó/entiende (respuesta, sugerencia).",
        "Sirve para orientar: ‘Xなら、Yがいい’（Si es X, Y es buena opción）.",
        "No expresa orden temporal (para eso たら).",
        "⚠️ No digas なら sin tema claro; primero presenta el tema o responde a alguien."
      ],
      ejemploJP: "交差点なら、角で 会いましょう。",
      ejemploRoma: "Kōsaten nara, kado de aimashō.",
      ejemploES: "Si es en el cruce, quedemos en la esquina.",
      ejemplos: [
        { jp: "駅なら、ここから 近いです。", roma: "Eki nara, koko kara chikai desu.", es: "Si es la estación, está cerca de aquí." },
        { jp: "雨なら、バスで 行きます。", roma: "Ame nara, basu de ikimasu.", es: "Si llueve, voy en bus." },
        { jp: "映画なら、よる が いいです。", roma: "Eiga nara, yoru ga ii desu.", es: "Si es cine, mejor por la noche." },
        { jp: "この みち が ちがう なら、もどりましょう。", roma: "Kono michi ga chigau nara, modorimashō.", es: "Si esta calle no es, volvamos." },
        { jp: "時間なら、午後 が ひまです。", roma: "Jikan nara, gogo ga hima desu.", es: "Si es por tiempo, por la tarde estoy libre." },
        { jp: "メッセージなら、あとで 送ります。", roma: "Messēji nara, ato de okurimasu.", es: "Si es mensaje, lo envío después." },
        { jp: "図書館なら、左へ 曲がって すぐです。", roma: "Toshokan nara, hidari e magatte sugu desu.", es: "Si es la biblioteca, es girar a la izquierda y está cerca." },
        { jp: "帰る なら、早めが いいです。", roma: "Kaeru nara, hayame ga ii desu.", es: "Si vas a volver, mejor temprano." }
      ]
    },

    {
      regla: "④ Forma POTENCIAL（できる・行ける）＋ condicional（extra útil）",
      pasoapaso: [
        "¿Cómo formar potencial?",
        "五段: ‘u→e’ + る（行く→行ける／読む→読める／待つ→待てる）。否定：行けない。",
        "一段: ‘る→られる’（食べる→食べられる／忘れる→忘れられる）。否定：食べられない。",
        "不規則: する→できる／来る→こられる。否定：できない／こられない。",
        "Combínalo: 行ければ（si puedo ir）／行けたら（si puedo ir, cuando se dé）／行けるなら（si se trata de poder ir）"
      ],
      tabla: {
        headers: ["Tipo", "Base", "→ Potencial (JP)", "Negativo", "Romaji"],
        rows: [
          ["五段", "行く／読む／待つ／話す／買う", "行ける／読める／待てる／話せる／買える", "行けない／読めない など", "ikeru / yomeru / materu / hanaseru / kaeru"],
          ["一段", "食べる／忘れる／見る／出る", "食べられる／忘れられる／見られる／出られる", "食べられない など", "taberareru / wasurerareru / mirareru / derareru"],
          ["不規則", "する／来る", "できる／こられる", "できない／こられない", "dekiru / korareru"]
        ]
      },
      ejemplos: [
        { jp: "時間が あれば 行けます。", roma: "Jikan ga areba ikemasu.", es: "Si tengo tiempo, puedo ir." },
        { jp: "雨でも 行けるなら、行きます。", roma: "Ame demo ikeru nara, ikimasu.", es: "Si incluso con lluvia puedes ir, voy." },
        { jp: "着けたら 行けます。", roma: "Tsuketara ikemasu.", es: "Si llego a tiempo, podré ir." },
        { jp: "読めれば、図書館で 調べます。", roma: "Yomereba, toshokan de shirabemasu.", es: "Si puedo leerlo, lo consulto en la biblioteca." },
        { jp: "待てなければ、角で 会いましょう。", roma: "Matenakereba, kado de aimashō.", es: "Si no puedes esperar, nos vemos en la esquina." },
        { jp: "できれば、メッセージで おねがいします。", roma: "Dekireba, messēji de onegaishimasu.", es: "Si es posible, por mensaje, por favor." },
        { jp: "こられないなら、オンラインで いいです。", roma: "Korarena i nara, onrain de ii desu.", es: "Si no puedes venir, está bien en línea." },
        { jp: "見られたら、送って ください。", roma: "Miraretara, okutte kudasai.", es: "Si puedes verlo, envíamelo." }
      ]
    },

    {
      regla: "⑤ ¿Cuál uso? — guía de elección rápida",
      pasoapaso: [
        "Tiempo/orden real (‘cuando pase A, haré B’) → たら。",
        "Condición lógica/hipotética (‘si A, entonces B’) → ば。",
        "Responder/limitar el tema (‘si es X…’) → なら。",
        "Con ‘poder’（できる・行ける…）usa potencial + ば／たら／なら según el matiz.",
        "Marcadores: もし（si）, 〜ならば（formal de なら）, 〜たらどうですか（sugerencia suave）"
      ],
      tabla: {
        headers: ["Quiero decir…", "Mejor usar…", "Ejemplo (JP)", "Romaji", "Traducción"],
        rows: [
          ["Cuando llegue, te llamo", "たら", "着いたら、でんわします。", "Tsuitara, denwa shimasu.", "Cuando llegue, llamaré."],
          ["Si vas recto, está la estación", "ば", "まっすぐ 行けば、駅です。", "Massugu ikeba, eki desu.", "Si vas recto, es la estación."],
          ["Si es la biblioteca…", "なら", "図書館なら、左へ 曲がって すぐです。", "Toshokan nara, hidari e magatte sugu desu.", "Si es la biblioteca, está cerca a la izquierda."],
          ["Si puedo ir, voy", "Potencial＋ば", "行ければ、行きます。", "Ikereba, ikimasu.", "Si puedo ir, voy."]
        ]
      }
    }
  ]
},


  dialogos: [
    {
      title: "Si llueve",
      kana: [
        "A: あめが ふったら、どうする？",
        "B: いえに かえれば いいと おもう。",
        "A: じゃ、メッセージを おくってね。",
        "B: うん、ついたら おくる。"
      ],
      kanji: [
        "A: 雨が 降ったら、どうする？",
        "B: 家に 帰れば いいと 思う。",
        "A: じゃ、メッセージを 送ってね。",
        "B: うん、着いたら 送る。"
      ],
      es: [
        "A: Si llueve, ¿qué hacemos?",
        "B: Creo que es mejor volver a casa.",
        "A: Entonces mándame un mensaje.",
        "B: Sí, te lo envío cuando llegue."
      ]
    },
    {
      title: "En la esquina",
      kana: [
        "A: かどで まっていて。",
        "B: ひだりに まがれば いい？",
        "A: うん、まっすぐ 行って ひだりだよ。"
      ],
      kanji: [
        "A: 角で 待っていて。",
        "B: 左に 曲がれば いい？",
        "A: うん、まっすぐ 行って 左だよ。"
      ],
      es: [
        "A: Espérame en la esquina.",
        "B: ¿Giro a la izquierda?",
        "A: Sí, ve recto y a la izquierda."
      ]
    },
    {
      title: "Si te pierdes",
      kana: [
        "A: みちに まよったら、どうする？",
        "B: えきの ほうへ むかえば だいじょうぶ。",
        "A: わかった。でんわ するね。"
      ],
      kanji: [
        "A: 道に 迷ったら、どうする？",
        "B: 駅の 方へ 向かえば 大丈夫。",
        "A: わかった。電話 するね。"
      ],
      es: [
        "A: Si me pierdo, ¿qué hago?",
        "B: Si te diriges hacia la estación, estarás bien.",
        "A: Entendido, te llamo."
      ]
    },
    {
      title: "Después de llegar",
      kana: [
        "A: ついたら、メッセージを ください。",
        "B: はい、ついたら すぐ おくります。"
      ],
      kanji: [
        "A: 着いたら、メッセージを ください。",
        "B: はい、着いたら すぐ 送ります。"
      ],
      es: [
        "A: Cuando llegues, mándame un mensaje.",
        "B: De acuerdo, lo envío en seguida."
      ]
    },
    {
      title: "Plan alterno",
      kana: [
        "A: あめなら、えいがに 行く？",
        "B: うん、じかんが あれば 行こう。"
      ],
      kanji: [
        "A: 雨なら、映画に 行く？",
        "B: うん、時間が あれば 行こう。"
      ],
      es: [
        "A: Si llueve, ¿vamos al cine?",
        "B: Sí, si tenemos tiempo, vamos."
      ]
    },
    {
      title: "Confirmando camino",
      kana: [
        "A: この みちで いい？ ちがったら どうする？",
        "B: まがらなければ、こうさてんで まつ。"
      ],
      kanji: [
        "A: この 道で いい？ 違ったら どうする？",
        "B: 曲がらなければ、交差点で 待つ。"
      ],
      es: [
        "A: ¿Es por esta calle? Si no, ¿qué hacemos?",
        "B: Si no doblamos, te espero en el cruce."
      ]
    },
    {
      title: "Último mensaje",
      kana: [
        "A: いえに 帰ったら、メッセージを わすれないでね。",
        "B: わすれれば、あとで 送る。"
      ],
      kanji: [
        "A: 家に 帰ったら、メッセージを 忘れないでね。",
        "B: 忘れれば、あとで 送る。"
      ],
      es: [
        "A: Cuando vuelvas a casa, no olvides el mensaje.",
        "B: Si lo olvido, lo enviaré después."
      ]
    },
  ],

  quizSets: [
    [
      "A: あめが ふったら、どうする？",
      "B: いえに かえれば いいと おもう。",
      "A: じゃ、メッセージを おくってね。",
      "B: うん、ついたら おくる。"
    ],
    [
      "A: かどで まっていて。",
      "B: ひだりに まがれば いい？",
      "A: うん、まっすぐ 行って ひだりだよ。"
    ],
    [
      "A: みちに まよったら、どうする？",
      "B: えきの ほうへ むかえば だいじょうぶ。",
      "A: わかった。でんわ するね。"
    ],
    [
      "A: ついたら、メッセージを ください。",
      "B: はい、ついたら すぐ おくります。"
    ],
    [
      "A: あめなら、えいがに 行く？",
      "B: うん、じかんが あれば 行こう。"
    ],
    [
      "A: この みちで いい？ ちがったら どうする？",
      "B: まがらなければ、こうさてんで まつ。"
    ],
  ],

  kanji10: [
    { ch: "待", kun: ["ま(つ)"], on: ["タイ"], es: "esperar", trazos: 9, strokeCode: "5f85",
      ej: [{ jp: "待つ", yomi: "まつ", es: "esperar" }, { jp: "待合", yomi: "まちあい", es: "punto de espera" }] },
    { ch: "忘", kun: ["わす(れる)"], on: ["ボウ"], es: "olvidar", trazos: 7, strokeCode: "5fd8",
      ej: [{ jp: "忘れる", yomi: "わすれる", es: "olvidar" }, { jp: "忘れ物", yomi: "わすれもの", es: "objeto olvidado" }] },
    { ch: "場", kun: ["ば"], on: ["ジョウ"], es: "lugar", trazos: 12, strokeCode: "5834",
      ej: [{ jp: "場合", yomi: "ばあい", es: "caso" }, { jp: "場所", yomi: "ばしょ", es: "lugar" }] },
    { ch: "道", kun: ["みち"], on: ["ドウ"], es: "camino", trazos: 12, strokeCode: "9053",
      ej: [{ jp: "道", yomi: "みち", es: "camino" }, { jp: "歩道", yomi: "ほどう", es: "acera" }] },
    { ch: "帰", kun: ["かえ(る)","かえ(す)"], on: ["キ"], es: "volver", trazos: 10, strokeCode: "5e30",
      ej: [{ jp: "帰る", yomi: "かえる", es: "volver" }, { jp: "帰国", yomi: "きこく", es: "regresar al país" }] },
    { ch: "曲", kun: ["ま(がる)","ま(げる)"], on: ["キョク"], es: "curvar; canción", trazos: 6, strokeCode: "66f2",
      ej: [{ jp: "曲がる", yomi: "まがる", es: "girar" }, { jp: "曲", yomi: "きょく", es: "canción; pieza musical" }] },
    { ch: "向", kun: ["む(く)","む(かう)"], on: ["コウ"], es: "orientar; hacia", trazos: 6, strokeCode: "5411",
      ej: [{ jp: "向かう", yomi: "むかう", es: "dirigirse a" }, { jp: "方向", yomi: "ほうこう", es: "dirección" }] },
    { ch: "違", kun: ["ちが(う)","ちが(える)"], on: ["イ"], es: "diferir; equivocarse", trazos: 13, strokeCode: "9055",
      ej: [{ jp: "違う", yomi: "ちがう", es: "diferir; estar equivocado" }, { jp: "間違い", yomi: "まちがい", es: "error" }] },
    { ch: "送", kun: ["おく(る)"], on: ["ソウ"], es: "enviar", trazos: 10, strokeCode: "9001",
      ej: [{ jp: "送る", yomi: "おくる", es: "enviar" }, { jp: "送信", yomi: "そうしん", es: "transmisión/envío" }] },
    { ch: "角", kun: ["かど","つの"], on: ["カク"], es: "esquina; cuerno", trazos: 7, strokeCode: "89d2",
      ej: [{ jp: "角", yomi: "かど", es: "esquina" }, { jp: "四角", yomi: "しかく", es: "cuadrado" }] },
  ],
};

export default TEMA_26;
