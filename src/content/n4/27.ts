// src/content/n4/27.ts
import { type ThemeContent } from "./types";

const TEMA_27: ThemeContent = {
  numero: 27,
  emoji: "🪄",
  titulo: "Expresiones de intención",
  subtitulo: "「〜つもり」「〜ようと思う」",

  objetivos: [
    "Expresar plan firme con 〜つもり（だ／です） y negación 〜ないつもり",
    "Expresar intención/decisión (a veces reciente) con 〜ようと思う／〜ようと思っている",
    "Conjugar volitivo: 五段（u→o＋う）、一段（語幹＋よう）、する→しよう、来る→こよう",
    "Elegir entre つもり（plan claro） y ようと思う（idea/decisión, más suave)",
    "Usar vocabulario de estudio, trabajo y vida diaria para planes",
  ],

  vocabClase: [
    { key: "v1",  jp: "つもり",         romaji: "tsumori",        es: "intención / plan" },
    { key: "v2",  jp: "〜ようと おもう", romaji: "…yō to omou",    es: "pensar en hacer (intención)" },
    { key: "v3",  jp: "けいかく",       romaji: "keikaku",        es: "plan (計画)" },
    { key: "v4",  jp: "しゅうまつ",     romaji: "shūmatsu",       es: "fin de semana (週末)" },
    { key: "v5",  jp: "けんきゅう",     romaji: "kenkyū",         es: "investigación (研究)" },
    { key: "v6",  jp: "うんどう",       romaji: "undō",           es: "ejercicio (運動)" },
    { key: "v7",  jp: "しらべる",       romaji: "shiraberu",      es: "investigar/buscar (調べる)" },
    { key: "v8",  jp: "つくる",         romaji: "tsukuru",        es: "hacer / crear (作る)" },
    { key: "v9",  jp: "しる",           romaji: "shiru",          es: "saber / conocer (知る)" },
    { key: "v10", jp: "はじめる",       romaji: "hajimeru",       es: "empezar" },
    { key: "v11", jp: "つづける",       romaji: "tsuzukeru",      es: "continuar (続ける)" },
    { key: "v12", jp: "やめる",         romaji: "yameru",         es: "dejar / parar" },
    { key: "v13", jp: "うごく",         romaji: "ugoku",          es: "moverse (動く)" },
    { key: "v14", jp: "そうしん",       romaji: "sōshin",         es: "envío (de mensaje) (送信)" },
    { key: "v15", jp: "もうしあげる",   romaji: "mōshiageru",     es: "decir (humilde) (申し上げる)" },
    { key: "v16", jp: "みらい",         romaji: "mirai",          es: "futuro (未来)" },
  ],

  oraciones6: [
    { key: "o1", jp: "しゅうまつは 家で ゆっくり するつもりです。", romaji: "Shūmatsu wa ie de yukkuri suru tsumori desu.", es: "Este fin de semana pienso descansar en casa.", exp: "V(dic) + つもり（だ）: plan claro." },
    { key: "o2", jp: "来月から うんどうを はじめるつもりだ。", romaji: "Raigetsu kara undō o hajimeru tsumori da.", es: "Desde el mes que viene pienso empezar a hacer ejercicio.", exp: "Plan con fecha." },
    { key: "o3", jp: "きょうは 早く ねようと おもう。", romaji: "Kyō wa hayaku neyō to omou.", es: "Hoy creo que me iré a dormir temprano.", exp: "Volitivo + と思う: decisión/intención (suave)." },
    { key: "o4", jp: "レポートを 調べてから、出そうと おもっています。", romaji: "Repōto o shirabete kara, dasō to omotte imasu.", es: "Pienso entregar el informe después de investigar.", exp: "〜ようと思っている: intención en curso." },
    { key: "o5", jp: "この アプリを 作るつもりは ありません。", romaji: "Kono apuri o tsukuru tsumori wa arimasen.", es: "No tengo la intención de hacer esta app.", exp: "〜つもりはない: ‘no pienso …’." },
    { key: "o6", jp: "わからなかったら、 先生に きこうと おもう。", romaji: "Wakaranakattara, sensei ni kikō to omou.", es: "Si no entiendo, pienso preguntar a la profe.", exp: "Volitivo + と思う con たら." },
  ],

  gramatica: {
    titulo: "Como en primaria: decir lo que piensas hacer",
    puntos: [
      {
        regla: "① 〜つもり（だ／です）— plan firme",
        pasoapaso: [
          "Fórmula: V(diccionario) + つもり（だ／です）。",
          "Negación de intención: V(dic) + つもりはない／ありません。",
          "Pasado: 〜つもりだった（‘pensaba…’）。",
          "Con sustantivo: N + の + つもり（だ）『学生のつもりだ』= ‘me creo estudiante’ (matiz especial).",
          "⚠️ つもり suena a plan decidido. Si es idea del momento, mejor 〜ようと思う。"
        ],
        ejemploJP: "来週、旅行するつもりです。",
        ejemploRoma: "Raishū, ryokō suru tsumori desu.",
        ejemploES: "La semana que viene pienso viajar.",
        // 8 oraciones de ejemplo
        ejemplos: [
          { jp: "毎日 うんどうを つづけるつもりです。", roma: "Mainichi undō o tsuzukeru tsumori desu.", es: "Pienso continuar haciendo ejercicio cada día." },
          { jp: "週末は 家で 勉強するつもりだ。", roma: "Shūmatsu wa ie de benkyō suru tsumori da.", es: "El fin de semana pienso estudiar en casa." },
          { jp: "しらべてから、レポートを 出すつもりです。", roma: "Shirabete kara, repōto o dasu tsumori desu.", es: "Pienso entregar el informe tras investigar." },
          { jp: "アプリを 作るつもりは ありません。", roma: "Apuri o tsukuru tsumori wa arimasen.", es: "No pienso crear la app." },
          { jp: "来年は 研究を はじめるつもりです。", roma: "Rainen wa kenkyū o hajimeru tsumori desu.", es: "El año que viene pienso empezar una investigación." },
          { jp: "その ことは 言わないつもりだ。", roma: "Sono koto wa iwanai tsumori da.", es: "No pienso decir eso." },
          { jp: "もっと 日本語を しる つもりです。", roma: "Motto nihongo o shiru tsumori desu.", es: "Pienso saber (aprender) más japonés." },
          { jp: "週末に うごかない つもり。", roma: "Shūmatsu ni ugokanai tsumori.", es: "El fin de semana pienso no moverme (descansar)." }
        ],
        tabla: {
          headers: ["Elemento", "Forma base", "+ つもり（JP）", "Romaji"],
          rows: [
            ["動詞（五段）", "作る", "作るつもり", "tsukuru tsumori"],
            ["動詞（一段）", "始める", "始めるつもり", "hajimeru tsumori"],
            ["否定（五段）", "行かない", "行かないつもり", "ikanai tsumori"],
            ["否定（一段）", "食べない", "食べないつもり", "tabenai tsumori"],
            ["名詞の意図", "研究", "研究のつもり", "kenkyū no tsumori"],
          ],
        },
      },

      {
        regla: "② 〜ようと思う／〜ようと思っている — intención/decisión",
        pasoapaso: [
          "Usa la **forma volitiva** + と思う（とおもう）。",
          "五段: 読む→読もう, 行く→行こう, 話す→話そう。",
          "一段: 食べる→食べよう, 見る→見よう, 始める→始めよう。",
          "不規則: する→しよう, 来る(くる)→こよう。",
          "Progresivo/plan en curso: 〜ようと思っている（‘llevo pensando/estoy por…’）。",
          "⚠️ Más suave que つもり. Suele sonar a ‘me late hacer…’, ‘tengo la intención de…’."
        ],
        ejemploJP: "しゅうまつは 早く 起きようと おもう。",
        ejemploRoma: "Shūmatsu wa hayaku okiyō to omou.",
        ejemploES: "El fin de semana pienso levantarme temprano.",
        ejemplos: [
          { jp: "きょうは 早く ねようと おもう。", roma: "Kyō wa hayaku neyō to omou.", es: "Hoy creo que me dormiré temprano." },
          { jp: "レポートを なおそうと おもっています。", roma: "Repōto o naosō to omotte imasu.", es: "Estoy pensando corregir el informe." },
          { jp: "毎朝 うんどうしようと おもう。", roma: "Maiasa undō shiyō to omou.", es: "Pienso hacer ejercicio cada mañana." },
          { jp: "もっと 調べようと おもう。", roma: "Motto shirabeyō to omou.", es: "Pienso investigar más." },
          { jp: "アプリを 作ろうと おもう。", roma: "Apuri o tsukurō to omou.", es: "Estoy pensando crear una app." },
          { jp: "週末、出かけないで いようと おもう。", roma: "Shūmatsu, dekakenai de i-yō to omou.", es: "Este fin de semana creo que me quedaré en casa." },
          { jp: "わからなければ、先生に きこうと おもう。", roma: "Wakaranakereba, sensei ni kikō to omou.", es: "Si no entiendo, pienso preguntar a la profe." },
          { jp: "来月から 勉強を ふやそうと おもう。", roma: "Raigetsu kara benkyō o fuyasō to omou.", es: "Desde el mes que viene quiero estudiar más." }
        ],
        tabla: {
          headers: ["Tipo", "Base", "→ Volitivo (JP)", "Romaji"],
          rows: [
            ["五段", "行く／読む／話す／買う／作る", "行こう／読もう／話そう／買おう／作ろう", "ikō / yomō / hasō / kaō / tsukurō"],
            ["一段", "食べる／見る／始める／調べる", "食べよう／見よう／始めよう／調べよう", "tabeyō / miyō / hajimeyō / shirabeyō"],
            ["不規則", "する／来る", "しよう／こよう", "shiyō / koyō"],
          ],
        },
      },

      {
        regla: "③ ¿Cuál uso? Diferencia clara",
        pasoapaso: [
          "Plan decidido → **つもり**（‘lo tengo planeado’）",
          "Idea/decisión (a veces reciente) → **〜ようと思う**",
          "En curso/ya lo vengo pensando → **〜ようと思っている**",
          "Para negar intención: **〜つもりはない**",
        ],
        ejemploJP: "来月から 研究を はじめるつもりです。",
        ejemploRoma: "Raigetsu kara kenkyū o hajimeru tsumori desu.",
        ejemploES: "Pienso comenzar una investigación el mes que viene。",
      },
    ],
  },

  dialogos: [
    {
      title: "Plan de fin de semana",
      kana: [
        "A: しゅうまつは なにを するつもり？",
        "B: うんどうを はじめるつもりだよ。",
        "A: いいね。ぼくは ねようと おもう。"
      ],
      kanji: [
        "A: 週末は 何を するつもり？",
        "B: 運動を 始めるつもりだよ。",
        "A: いいね。ぼくは 寝ようと 思う。"
      ],
      es: [
        "A: ¿Qué planeas hacer el fin de semana?",
        "B: Pienso empezar a hacer ejercicio.",
        "A: Genial. Yo creo que me dormiré temprano."
      ],
    },
    {
      title: "Investigar y entregar",
      kana: [
        "A: レポートは どうする？",
        "B: まず しらべて、月曜に 出すつもり。",
        "A: わたしは なおそうと おもっている。"
      ],
      kanji: [
        "A: レポートは どうする？",
        "B: まず 調べて、月曜に 出すつもり。",
        "A: わたしは 直そうと 思っている。"
      ],
      es: [
        "A: ¿Qué harás con el informe?",
        "B: Primero investigar y entregarlo el lunes.",
        "A: Yo estoy pensando corregirlo."
      ],
    },
    {
      title: "Nueva app",
      kana: [
        "A: アプリを 作るつもり？",
        "B: うん。なまえは あとで きめようと おもう。"
      ],
      kanji: [
        "A: アプリを 作るつもり？",
        "B: うん。名前は あとで 決めようと 思う。"
      ],
      es: [
        "A: ¿Piensas crear una app?",
        "B: Sí. El nombre lo decidiré después."
      ],
    },
    {
      title: "Más estudio",
      kana: [
        "A: らいげつから べんきょうを ふやすつもり。",
        "B: ぼくも まいにち よむようと おもう。"
      ],
      kanji: [
        "A: 来月から 勉強を 増やすつもり。",
        "B: ぼくも 毎日 読むようと 思う。"
      ],
      es: [
        "A: Desde el mes que viene pienso estudiar más.",
        "B: Yo también, creo que leeré todos los días."
      ],
    },
    {
      title: "Quedarse en casa",
      kana: [
        "A: でかける？",
        "B: ううん、きょうは いえに いるつもり。",
        "A: じゃ、あとで メッセージを おくろうと おもう。"
      ],
      kanji: [
        "A: 出かける？",
        "B: ううん、今日は 家に いるつもり。",
        "A: じゃ、あとで メッセージを 送ろうと 思う。"
      ],
      es: [
        "A: ¿Vas a salir?",
        "B: No, hoy pienso quedarme en casa.",
        "A: Entonces creo que te enviaré un mensaje luego."
      ],
    },
    {
      title: "No pienso decirlo",
      kana: [
        "A: その こと、言う？",
        "B: 言わないつもりだ。",
        "A: そうか。じゃ、きこうと おもう。"
      ],
      kanji: [
        "A: その 事、言う？",
        "B: 言わないつもりだ。",
        "A: そうか。じゃ、聞こうと 思う。"
      ],
      es: [
        "A: ¿Vas a decir eso?",
        "B: No pienso decirlo.",
        "A: Ya veo. Entonces creo que voy a preguntar."
      ],
    },
    {
      title: "Presentación humilde",
      kana: [
        "A: はじめまして。なまえを もうしあげます。",
        "B: どうぞ。"
      ],
      kanji: [
        "A: 初めまして。名前を 申し上げます。",
        "B: どうぞ。"
      ],
      es: [
        "A: Mucho gusto. Permítame decir mi nombre (humilde).",
        "B: Adelante."
      ],
    },
  ],

  quizSets: [
    [
      "A: しゅうまつは なにを するつもり？",
      "B: うんどうを はじめるつもりだよ。",
      "A: いいね。ぼくは ねようと おもう。"
    ],
    [
      "A: レポートは どうする？",
      "B: まず しらべて、月曜に 出すつもり。",
      "A: わたしは なおそうと おもっている。"
    ],
    [
      "A: アプリを 作るつもり？",
      "B: うん。なまえは あとで きめようと おもう。"
    ],
    [
      "A: らいげつから べんきょうを ふやすつもり。",
      "B: ぼくも まいにち よむようと おもう。"
    ],
    [
      "A: でかける？",
      "B: ううん、きょうは いえに いるつもり。",
      "A: じゃ、あとで メッセージを おくろうと おもう。"
    ],
    [
      "A: その こと、言う？",
      "B: 言わないつもりだ。",
      "A: そうか。じゃ、きこうと おもう。"
    ],
  ],

  // 10 kanji nuevos del tema (N4 razonables)
  kanji10: [
    { ch: "調", kun: ["しら(べる)"], on: ["チョウ"], es: "investigar; tono", trazos: 15, strokeCode: "8abf",
      ej: [{ jp: "調べる", yomi: "しらべる", es: "investigar/buscar" }, { jp: "調子", yomi: "ちょうし", es: "condición/tono" }] },
    { ch: "研", kun: [], on: ["ケン"], es: "afilar; estudiar", trazos: 9, strokeCode: "7814",
      ej: [{ jp: "研究", yomi: "けんきゅう", es: "investigación" }, { jp: "研修", yomi: "けんしゅう", es: "entrenamiento" }] },
    { ch: "究", kun: [], on: ["キュウ"], es: "investigar a fondo", trazos: 7, strokeCode: "7a76",
      ej: [{ jp: "究明", yomi: "きゅうめい", es: "esclarecimiento" }, { jp: "研究", yomi: "けんきゅう", es: "investigación" }] },
    { ch: "作", kun: ["つく(る)"], on: ["サク","サ"], es: "hacer; crear", trazos: 7, strokeCode: "4f5c",
      ej: [{ jp: "作る", yomi: "つくる", es: "hacer" }, { jp: "作文", yomi: "さくぶん", es: "redacción" }] },
    { ch: "知", kun: ["し(る)"], on: ["チ"], es: "saber; conocer", trazos: 8, strokeCode: "77e5",
      ej: [{ jp: "知る", yomi: "しる", es: "saber" }, { jp: "知人", yomi: "ちじん", es: "conocido" }] },
    { ch: "未", kun: ["いま(だ)","ま(だ)"], on: ["ミ"], es: "aún no; inmaduro", trazos: 5, strokeCode: "672a",
      ej: [{ jp: "未定", yomi: "みてい", es: "sin decidir" }, { jp: "未来", yomi: "みらい", es: "futuro" }] },
    { ch: "末", kun: ["すえ"], on: ["マツ","バツ"], es: "final; extremo", trazos: 5, strokeCode: "672b",
      ej: [{ jp: "週末", yomi: "しゅうまつ", es: "fin de semana" }, { jp: "年末", yomi: "ねんまつ", es: "fin de año" }] },
    { ch: "運", kun: ["はこ(ぶ)"], on: ["ウン"], es: "transportar; suerte", trazos: 12, strokeCode: "904b",
      ej: [{ jp: "運ぶ", yomi: "はこぶ", es: "transportar" }, { jp: "運動", yomi: "うんどう", es: "ejercicio" }] },
    { ch: "動", kun: ["うご(く)","うご(かす)"], on: ["ドウ"], es: "mover(se)", trazos: 11, strokeCode: "52d5",
      ej: [{ jp: "動く", yomi: "うごく", es: "moverse" }, { jp: "自動", yomi: "じどう", es: "automático" }] },
    { ch: "申", kun: ["もう(す)"], on: ["シン"], es: "decir (humilde)", trazos: 5, strokeCode: "7533",
      ej: [{ jp: "申す", yomi: "もうす", es: "decir (humilde)" }, { jp: "申し出", yomi: "もうしで", es: "propuesta, solicitud" }] },
  ],
};

export default TEMA_27;
