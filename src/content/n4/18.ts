// src/content/n4/18.ts
import type { ThemeContent } from "../types";

// Tema 18 — Narrar historias: conectores y secuencias
export const TEMA_18: ThemeContent = {
  id: 18,
  nivel: "N4",
  titulo: "Narrar historias – Uso de conectores y secuencias",

  objetivos: [
    "Ordenar acciones con conectores: まず／つぎに／それから／そして／最後に.",
    "Unir acciones con 〜て／〜てから, y hablar del orden: 〜たあとで／〜まえに.",
    "Ubicar eventos en el tiempo con 前（まえ）／後（あと）／時（とき）.",
    "Iniciar y cerrar relatos: はじめに／おわりに；始まる・終わる（nuevo kanji）.",
    "Describir el hilo de la historia de forma clara y sencilla.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "まず",           romaji: "mazu",            es: "primero" },
    { key: "vc02", jp: "つぎに",         romaji: "tsugi ni",        es: "después / a continuación" },
    { key: "vc03", jp: "それから",       romaji: "sorekara",        es: "luego / y después" },
    { key: "vc04", jp: "そして",         romaji: "soshite",         es: "y (conecta oraciones)" },
    { key: "vc05", jp: "最後に",         romaji: "saigo ni",        es: "al final / por último" },
    { key: "vc06", jp: "はじめに",       romaji: "hajime ni",       es: "para comenzar" },
    { key: "vc07", jp: "おわりに",       romaji: "owari ni",        es: "para terminar" },
    { key: "vc08", jp: "前に",           romaji: "mae ni",          es: "antes de…" },
    { key: "vc09", jp: "あとで",         romaji: "ato de",          es: "después de…" },
    { key: "vc10", jp: "時",             romaji: "toki",            es: "cuando…" },
    { key: "vc11", jp: "順番",           romaji: "junban",          es: "orden / turno" },
    { key: "vc12", jp: "物語",           romaji: "monogatari",      es: "relato, historia (escribe en kana si hace falta)" },
    { key: "vc13", jp: "途中で",         romaji: "tochū de",        es: "a mitad de / en medio de" },
    { key: "vc14", jp: "急に",           romaji: "kyū ni",          es: "de repente" },
    { key: "vc15", jp: "準備する",       romaji: "junbi suru",      es: "preparar(se) (kanji fuera del set → usar kana si prefieres)" },
    { key: "vc16", jp: "連続",           romaji: "renzoku",         es: "en serie, continuo" },
    { key: "vc17", jp: "先に",           romaji: "saki ni",         es: "antes / primero (ir adelantado)" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "まず 朝ごはん を 食べて、それから しゅっぱつ しました。",
      romaji: "mazu asagohan o tabete, sorekara shuppatsu shimashita.",
      es: "Primero desayuné y luego salí.",
      exp: "Conecta acciones con 〜て y それから."
    },
    {
      key: "ex02",
      jp: "でんわ を してから 家 を 出ました。",
      romaji: "denwa o shite kara ie o demashita.",
      es: "Después de llamar por teléfono, salí de casa.",
      exp: "Vて + から：‘después de V’ (orden claro)."
    },
    {
      key: "ex03",
      jp: "しごと の まえに コーヒー を のみます。",
      romaji: "shigoto no mae ni kōhī o nomimasu.",
      es: "Antes del trabajo, tomo café.",
      exp: "N の まえに：‘antes de N’."
    },
    {
      key: "ex04",
      jp: "しごと が おわった あとで さんぽ しました。",
      romaji: "shigoto ga owatta ato de sanpo shimashita.",
      es: "Después de terminar el trabajo, di un paseo.",
      exp: "Vた + あとで：‘después de V’."
    },
    {
      key: "ex05",
      jp: "子ども の とき、毎日 外で あそびました。",
      romaji: "kodomo no toki, mainichi soto de asobimashita.",
      es: "Cuando era niño, jugaba fuera todos los días.",
      exp: "N の とき：‘cuando N’."
    },
    {
      key: "ex06",
      jp: "最後に かんたんに まとめます。",
      romaji: "saigo ni kantan ni matomemasu.",
      es: "Por último, lo resumiré brevemente.",
      exp: "最後に cierra la secuencia."
    },
  ],

  gramatica: {
    titulo: "Conectores y secuencias: 〜て／〜てから／〜たあとで／〜まえに／時",
    puntos: [
      {
        key: "g01",
        regla: "① Conectores simples（para ordenar）",
        pasoapaso: [
          "1) まず（primero）→ つぎに（después）→ それから／そして（luego／y）→ 最後に（por último）.",
          "2) Úsalos al inicio de la oración para guiar la historia.",
          "3) そして une oraciones de mismo nivel; それから añade ‘luego’.",
          "4) Mantén frases cortas y claras."
        ],
        ejemploJP: "まず 準備して、つぎに 出かけます。最後に まとめます。",
        ejemploRoma: "mazu junbi shite, tsugi ni dekakemasu. saigo ni matomemasu.",
        ejemploES: "Primero preparo, después salgo. Por último, resumo.",
        tabla: {
          title: "Conectores de secuencia",
          headers: ["Conector", "Uso", "Ejemplo", "Roma", "Traducción"],
          rows: [
            ["まず", "inicio", "まず はじめに あいさつ します。", "mazu hajime ni aisatsu shimasu.", "Primero, saludo."],
            ["つぎに", "paso siguiente", "つぎに 説明 します。", "tsugi ni setsumei shimasu.", "Después, explico."],
            ["それから", "luego", "それから しごと を します。", "sorekara shigoto o shimasu.", "Luego, trabajo."],
            ["そして", "y (suma)", "そして しめい を 言います。", "soshite shimei o iimasu.", "Y digo mi nombre."],
            ["最後に", "cierre", "最後に まとめます。", "saigo ni matomemasu.", "Por último, resumo."]
          ],
          note: "Puedes combinar con 〜て／〜てから／〜たあとで para más detalle."
        },
        ejemplos: [
          { jp: "まず ドア を あけて、そして 入りました。", roma: "mazu doa o akete, soshite hairimashita.", es: "Primero abrí la puerta y entré." },
          { jp: "つぎに みち を わたって、右 に まがりました。", roma: "tsugi ni michi o watatte, migi ni magarimashita.", es: "Después crucé la calle y giré a la derecha." },
          { jp: "それから 友だち に あって はなしました。", roma: "sorekara tomodachi ni atte hanashimashita.", es: "Luego me vi con un amigo y charlamos." },
          { jp: "最後に しゃしん を とって おわりました。", roma: "saigo ni shashin o totte owarimashita.", es: "Por último saqué fotos y terminé." },
        ],
      },

      {
        key: "g02",
        regla: "② 〜て／〜てから（después de…）",
        pasoapaso: [
          "1) Vて：encadena acciones (‘y luego…’).",
          "2) Vてから：‘después de V, (entonces)…’ → orden más claro.",
          "3) 〜てから に なる：‘desde que…’ (idea de punto de cambio).",
          "4) No mezcles tiempos: mantén pasado o presente según narración."
        ],
        ejemploJP: "かいもの を してから 家 に かえりました。",
        ejemploRoma: "kaimono o shite kara ie ni kaerimashita.",
        ejemploES: "Después de hacer compras, volví a casa.",
        tabla: {
          title: "Comparación 〜て vs 〜てから",
          headers: ["Patrón", "Matiz", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Vて, Vて…", "lista simple", "ごはん を 食べて テレビ を 見た。", "gohan o tabete terebi o mita.", "Comí y vi la TV."],
            ["Vてから, …", "orden explícito", "メール を してから 出かけた。", "mēru o shite kara dekaketa.", "Después de enviar un mail, salí."],
            ["Vてから に なる", "desde que…", "日本 に 来てから に なって、さむさ に なれた。", "nihon ni kite kara ni natte, samusa ni nareta.", "Desde que llegué a Japón, me acostumbré al frío."]
          ],
          note: "En relatos, 〜てから marca claramente el orden."
        },
        ejemplos: [
          { jp: "本 を よんでから ねました。", roma: "hon o yonde kara nemashita.", es: "Después de leer un libro, dormí." },
          { jp: "しごと を おえて かえりました。", roma: "shigoto o oete kaerimashita.", es: "Terminé el trabajo y volví." },
          { jp: "さら を あらって、つぎに そうじ しました。", roma: "sara o aratte, tsugi ni sōji shimashita.", es: "Lavé los platos y luego limpié." },
          { jp: "来てから に なって 日本語 を たくさん つかいます。", roma: "kite kara ni natte nihongo o takusan tsukaimasu.", es: "Desde que vine, uso mucho japonés." },
        ],
      },

      {
        key: "g03",
        regla: "③ 〜たあとで／N のあとで（después de）・〜まえに／N のまえに（antes de）",
        pasoapaso: [
          "1) Vた + あとで：‘después de V’.",
          "2) N の あとで：‘después de N’.",
          "3) Vる + まえに：‘antes de V’.",
          "4) N の まえに：‘antes de N’.",
        ],
        ejemploJP: "しごと が おわった あとで 友だち に あいました。",
        ejemploRoma: "shigoto ga owatta ato de tomodachi ni aimashita.",
        ejemploES: "Después de terminar el trabajo, me vi con un amigo.",
        tabla: {
          title: "Antes y después: patrones básicos",
          headers: ["Función", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["después", "Vた あとで", "食べた あとで さんぽ した。", "tabeta ato de sanpo shita.", "Después de comer, paseé."],
            ["después", "N の あとで", "しごと の あとで かいもの。", "shigoto no ato de kaimono.", "Después del trabajo, compras."],
            ["antes", "Vる まえに", "出かける まえに ドア を しめる。", "dekakeru mae ni doa o shimeru.", "Antes de salir, cierro la puerta."],
            ["antes", "N の まえに", "会議 の まえに じゅんび する。", "kaigi no mae ni junbi suru.", "Antes de la reunión, preparo."],
          ],
          note: "Atención al tiempo: Vる まえに（futuro/hábito）／Vた あとで（ya ocurrió）."
        },
        ejemplos: [
          { jp: "でんしゃ に のる まえに きっぷ を かいます。", roma: "densha ni noru mae ni kippu o kaimasu.", es: "Antes de subir al tren, compro el boleto." },
          { jp: "映画 を 見た あとで レビュー を 書きます。", roma: "eiga o mita ato de rebyū o kakimasu.", es: "Después de ver la película, escribo reseña." },
          { jp: "朝 ごはん の まえに 水 を のみます。", roma: "asa gohan no mae ni mizu o nomimasu.", es: "Antes del desayuno, tomo agua." },
          { jp: "会議 の あとで まとめ を します。", roma: "kaigi no ato de matome o shimasu.", es: "Después de la reunión, hago el resumen." },
        ],
      },

      {
        key: "g04",
        regla: "④ 時（とき） para ubicar el momento",
        pasoapaso: [
          "1) N の とき：‘cuando N’.",
          "2) Vる／Vた とき：‘cuando (va a pasar / pasó)’.",
          "3) い形容詞＋とき／な形容詞＋な とき：‘cuando estaba A(adj)’.",
          "4) Añade lugar/tema al inicio para claridad: 子ども の とき…／日本 に いる とき…"
        ],
        ejemploJP: "子ども の とき、外で よく あそびました。",
        ejemploRoma: "kodomo no toki, soto de yoku asobimashita.",
        ejemploES: "Cuando era niño, jugaba mucho fuera.",
        tabla: {
          title: "Modelos con 時（とき）",
          headers: ["Tipo", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["nombre", "N の とき", "学生 の とき は いそがしかった。", "gakusei no toki wa isogashikatta.", "Cuando era estudiante, estaba ocupado."],
            ["verbo futuro/hábito", "Vる とき", "出かける とき でんわ します。", "dekakeru toki denwa shimasu.", "Cuando salga, te llamo."],
            ["verbo pasado", "Vた とき", "会った とき しゃしん を とった。", "atta toki shashin o totta.", "Cuando nos vimos, tomé fotos."],
            ["adjetivo", "Aい／Aな＋とき", "ひま な とき 本 を よむ。", "hima na toki hon o yomu.", "Cuando tengo tiempo libre, leo."],
          ],
          note: "Vる とき（antes de ocurrir)／Vた とき（ya ocurrió）."
        },
        ejemplos: [
          { jp: "日本 に いる とき、毎日 あるきました。", roma: "nihon ni iru toki, mainichi arukimashita.", es: "Cuando estaba en Japón, caminaba cada día." },
          { jp: "つかれた とき は 早く ねます。", roma: "tsukareta toki wa hayaku nemasu.", es: "Cuando me canso, duermo temprano." },
          { jp: "雨 の とき は かさ を もちます。", roma: "ame no toki wa kasa o mochimasu.", es: "Cuando llueve, llevo paraguas." },
          { jp: "会った とき に あいさつ しました。", roma: "atta toki ni aisatsu shimashita.", es: "Cuando nos encontramos, saludé." },
        ],
      },
    ],
  },

  // 7 diálogos
  dialogos: [
    {
      title: "朝のルーティン",
      kana: [
        "まず おきて、かお を あらいます。",
        "つぎに あさごはん を たべます。",
        "それから しごと に いきます。"
      ],
      kanji: [
        "まず 起きて、かお を あらいます。",
        "つぎに 朝ごはん を 食べます。",
        "それから 仕事 に 行きます。"
      ],
      es: [
        "Primero me levanto y me lavo la cara.",
        "Después desayuno.",
        "Luego voy al trabajo."
      ]
    },
    {
      title: "買い物のあとで",
      kana: [
        "かいもの を してから いえ に かえりました。",
        "その あとで ゆっくり しました。",
        "最後に ほん を よみました。"
      ],
      kanji: [
        "買い物 を してから 家 に 帰りました。",
        "その あとで ゆっくり しました。",
        "最後に 本 を 読みました。"
      ],
      es: [
        "Después de hacer compras, volví a casa.",
        "Después descansé tranquilamente.",
        "Por último leí un libro."
      ]
    },
    {
      title: "会うまえに",
      kana: [
        "あう まえに れんらく してください。",
        "わかりました。つぎに じかん を おくります。",
        "ありがとう。"
      ],
      kanji: [
        "会う まえに 連絡 してください。",
        "わかりました。つぎに 時間 を おくります。",
        "ありがとう。"
      ],
      es: [
        "Antes de vernos, por favor contáctame.",
        "Entendido. Luego te envío la hora.",
        "Gracias."
      ]
    },
    {
      title: "子どものとき",
      kana: [
        "子ども の とき、毎日 そと で あそびました。",
        "わたし も そう でした。",
        "たのしかった ですね。"
      ],
      kanji: [
        "子ども の 時、毎日 外 で 遊びました。",
        "私 も そう でした。",
        "楽しかった ですね。"
      ],
      es: [
        "Cuando era niño, jugaba fuera cada día.",
        "Yo también.",
        "Fue divertido, ¿verdad?"
      ]
    },
    {
      title: "道の説明",
      kana: [
        "まず まっすぐ いって、右 に まがって ください。",
        "それから 二つ め の かど を 左 に まがります。",
        "最後に 小さい みせ が みえます。"
      ],
      kanji: [
        "まず まっすぐ 行って、右 に まがって ください。",
        "それから 二つ 目 の 角 を 左 に まがります。",
        "最後に 小さい 店 が 見えます。"
      ],
      es: [
        "Primero siga recto y gire a la derecha.",
        "Luego, en la segunda esquina, gire a la izquierda.",
        "Por último verá una tienda pequeña."
      ]
    },
    {
      title: "はじめとおわり",
      kana: [
        "はじめに あいさつ を して、しょうかい を しました。",
        "つぎに スライド を つかって せつめい しました。",
        "おわりに しつもん を うけました。"
      ],
      kanji: [
        "はじめに あいさつ を して、紹介 を しました。",
        "つぎに スライド を 使って 説明 しました。",
        "おわりに 質問 を 受けました。"
      ],
      es: [
        "Al principio saludé e hice una presentación.",
        "Luego expliqué usando diapositivas.",
        "Al final recibí preguntas."
      ]
    },
    {
      title: "連続の話",
      kana: [
        "先に きっぷ を かって、つぎに でんしゃ に のりました。",
        "それから とちゅうで 友だち に あいました。",
        "最後に えき で おりて、さんぽ しました。"
      ],
      kanji: [
        "先に きっぷ を 買って、つぎに 電車 に 乗りました。",
        "それから 途中で 友だち に 会いました。",
        "最後に 駅 で おりて、散歩 しました。"
      ],
      es: [
        "Primero compré el boleto y luego tomé el tren.",
        "Después, a mitad de camino, me encontré con un amigo.",
        "Al final me bajé en la estación y di un paseo."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: まず はじめに じこしょうかい します。",
      "B: それから しごと の はなし を します。",
      "A: 最後に しつもん を うけます。"
    ],
    [
      "A: ごはん を 食べてから 出かけました。",
      "B: その あとで 友だち に 会いました。",
      "A: 夜 に 家 に 帰りました。"
    ],
    [
      "A: 出かける まえに メール を しました。",
      "B: つぎに バス に のりました。",
      "A: それから 学校 に つきました。"
    ],
    [
      "A: 子ども の 時、サッカー を して いました。",
      "B: そして まいにち れんしゅう しました。",
      "A: 試合 の あとで パン を 食べました。"
    ],
    [
      "A: 先に かばん を じゅんび してください。",
      "B: はい。つぎに 何 を します か。",
      "A: それから 出発 します。"
    ],
    [
      "A: 映画 を 見た あとで どう しました か。",
      "B: それから 夕ごはん を 食べました。",
      "A: 最後に 家 で 本 を 読みました。"
    ],
  ],

  // 10 kanji nuevos (relacionados con secuencia/tiempo)
  kanji10: [
    {
      ch: "前",
      kun: ["まえ"],
      on: ["ぜん"],
      es: "antes; delante",
      trazos: 9,
      strokeCode: "524d",
      ej: [
        { jp: "前に", yomi: "まえに", es: "antes de" },
        { jp: "午前", yomi: "ごぜん", es: "AM (mañana)" }
      ]
    },
    {
      ch: "後",
      kun: ["あと","のち","うし(ろ)"],
      on: ["ご","こう"],
      es: "después; detrás",
      trazos: 9,
      strokeCode: "5f8c",
      ej: [
        { jp: "あとで", yomi: "あとで", es: "después" },
        { jp: "午後", yomi: "ごご", es: "PM (tarde)" }
      ]
    },
    {
      ch: "次",
      kun: ["つぎ"],
      on: ["じ"],
      es: "siguiente",
      trazos: 6,
      strokeCode: "6b21",
      ej: [
        { jp: "次に", yomi: "つぎに", es: "después / a continuación" },
        { jp: "次回", yomi: "じかい", es: "la próxima vez" }
      ]
    },
    {
      ch: "先",
      kun: ["さき"],
      on: ["せん"],
      es: "antes; previo; punta",
      trazos: 6,
      strokeCode: "5148",
      ej: [
        { jp: "先に", yomi: "さきに", es: "primero / antes" },
        { jp: "先生", yomi: "せんせい", es: "profesor" }
      ]
    },
    {
      ch: "始",
      kun: ["はじ(まる)","はじ(める)"],
      on: ["し"],
      es: "empezar",
      trazos: 8,
      strokeCode: "59cb",
      ej: [
        { jp: "始まる", yomi: "はじまる", es: "(algo) empieza" },
        { jp: "始めに", yomi: "はじめに", es: "al inicio" }
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
        { jp: "終わる", yomi: "おわる", es: "terminar" },
        { jp: "終電", yomi: "しゅうでん", es: "último tren" }
      ]
    },
    {
      ch: "連",
      kun: ["つ(れる)"],
      on: ["れん"],
      es: "conectar; llevar",
      trazos: 10,
      strokeCode: "9023",
      ej: [
        { jp: "連絡", yomi: "れんらく", es: "contacto, aviso" },
        { jp: "連続", yomi: "れんぞく", es: "continuo, en serie" }
      ]
    },
    {
      ch: "時",
      kun: ["とき"],
      on: ["じ"],
      es: "tiempo; cuando",
      trazos: 10,
      strokeCode: "6642",
      ej: [
        { jp: "時", yomi: "とき", es: "cuando" },
        { jp: "時間", yomi: "じかん", es: "tiempo; horas" }
      ]
    },
    {
      ch: "週",
      kun: [],
      on: ["しゅう"],
      es: "semana",
      trazos: 11,
      strokeCode: "9031",
      ej: [
        { jp: "今週", yomi: "こんしゅう", es: "esta semana" },
        { jp: "来週", yomi: "らいしゅう", es: "la próxima semana" }
      ]
    },
    {
      ch: "事",
      kun: ["こと"],
      on: ["じ"],
      es: "cosa; asunto; hecho",
      trazos: 8,
      strokeCode: "4e8b",
      ej: [
        { jp: "大事", yomi: "だいじ", es: "importante" },
        { jp: "用事", yomi: "ようじ", es: "asunto/quehacer" }
      ]
    },
  ],
};

export default TEMA_18;
