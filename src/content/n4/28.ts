// src/content/n4/28.ts
import { type ThemeContent } from "./types";

const TEMA_28: ThemeContent = {
  numero: 28,
  emoji: "🔄",
  titulo: "Expresiones con pasivo y causativo",
  subtitulo: "「〜られる」「〜せる」",

  objetivos: [
    "Formar el pasivo 〜られる con verbos 五段・一段・不規則",
    "Usar el pasivo para acciones que afectan al sujeto (a veces con matiz de molestia)",
    "Formar el causativo 〜せる／〜させる (hacer/dejar que alguien haga)",
    "Distinguir partículas: に (agente), を (objeto), によって (por …, formal)",
    "Practicar en contextos de escuela, trabajo y vida diaria",
  ],

  vocabClase: [
    { key: "v1",  jp: "みる（見る）",  romaji: "miru",        es: "ver" },
    { key: "v2",  jp: "きく（聞く）",  romaji: "kiku",        es: "escuchar; preguntar" },
    { key: "v3",  jp: "よむ（読む）",  romaji: "yomu",        es: "leer" },
    { key: "v4",  jp: "おこす（起こす）", romaji: "okosu",     es: "despertar (a alguien)" },
    { key: "v5",  jp: "わらう（笑う）", romaji: "warau",      es: "reír" },
    { key: "v6",  jp: "なく（泣く）",  romaji: "naku",        es: "llorar" },
    { key: "v7",  jp: "かりる（借りる）", romaji: "kariru",    es: "pedir prestado" },
    { key: "v8",  jp: "かす（貸す）",  romaji: "kasu",        es: "prestar" },
    { key: "v9",  jp: "かわり（代わり）", romaji: "kawari",    es: "sustituto; en lugar de" },
    { key: "v10", jp: "やく（役）",    romaji: "yaku",        es: "rol; papel" },
    { key: "v11", jp: "せつめい",      romaji: "setsumei",    es: "explicación" },
    { key: "v12", jp: "れんしゅう",    romaji: "renshū",      es: "práctica" },
    { key: "v13", jp: "じゅぎょう",    romaji: "jugyō",       es: "clase (sesión)" },
    { key: "v14", jp: "しごと",        romaji: "shigoto",     es: "trabajo" },
    { key: "v15", jp: "てつだう",      romaji: "tetsudau",    es: "ayudar" },
    { key: "v16", jp: "よてい",        romaji: "yotei",       es: "plan, agenda" },
  ],

  oraciones6: [
    { key: "o1", jp: "先生に しつもんを 聞かれました。", romaji: "Sensei ni shitsumon o kikaremashita.", es: "El maestro me hizo una pregunta (fui preguntado).", exp: "Pasivo: V-られる（聞く→聞かれる）" },
    { key: "o2", jp: "友だちに 笑われて、はずかしかった。", romaji: "Tomodachi ni warawarete, hazukashikatta.", es: "Mis amigos se rieron de mí y me dio vergüenza.", exp: "Pasivo (a veces ‘adversativo’)." },
    { key: "o3", jp: "先生は 学生に 本を 読ませます。", romaji: "Sensei wa gakusei ni hon o yomasemasu.", es: "El profesor hace que los estudiantes lean.", exp: "Causativo: V-せる（読む→読ませる）" },
    { key: "o4", jp: "父は 私を 早く 起こさせた。", romaji: "Chichi wa watashi o hayaku okosaseta.", es: "Mi padre me hizo levantarme temprano.", exp: "Causativo pasado（起こす→起こさせる）" },
    { key: "o5", jp: "むすこは なくられて しまった。", romaji: "Musuko wa nakurarete shimatta.", es: "Mi hijo fue hecho llorar (alguien lo hizo llorar).", exp: "Causativo-pasivo implícito (coloquial). *Ver punto ② extra.*" },
    { key: "o6", jp: "上司に しごとを 代わられた。", romaji: "Jōshi ni shigoto o kawarareta.", es: "Mi jefe me sustituyó (me cambió la tarea).", exp: "Pasivo con 代（cambio/sustitución）" },
  ],

  gramatica: {
  titulo: "Como en primaria: pasivo y causativo (para qué sirve + partículas)",
  puntos: [
    {
      regla: "① PASIVO 〜られる — ‘me… / ser… (visto desde el afectado)’",
      pasoapaso: [
        "¿Para qué sirve? Mostrar el evento desde quien RECIBE el efecto. A veces suena a ‘me hicieron… / me pasó…’ (matiz de molestia).",
        "Estructura base: A は B に V-られる。",
        "五段: 聞く→聞かれる／読む→読まれる／笑う→笑われる。",
        "一段: 見る→見られる／借りる→借りられる。 不規則: する→される／来る(くる)→こられる。",
        "Dos tipos comunes:",
        "  a) Pasivo ‘directo’: すし が 田中さん に 食べられた。",
        "  b) Pasivo ‘adversativo’: 私 は いもうと に ケーキ を 食べられた。（‘me comió el pastel’ → molestia）",
      ],
      ejemploJP: "友だちに わらわれた。",
      ejemploRoma: "Tomodachi ni warawareta.",
      ejemploES: "Mis amigos se rieron de mí.",
      tabla: {
        headers: ["Tipo", "Base (dic)", "→ Pasivo (JP)", "Romaji"],
        rows: [
          ["五段", "聞く", "聞かれる", "kikareru"],
          ["五段", "読む", "読まれる", "yomareru"],
          ["五段", "笑う", "笑われる", "warawareru"],
          ["一段", "見る", "見られる", "mirareru"],
          ["一段", "借りる", "借りられる", "karirareru"],
          ["不規則", "する", "される", "sareru"],
          ["不規則", "来る(くる)", "こられる", "korareru"]
        ]
      },
      // 8 ejemplos (pasivo)
      ejemplos: [
        { jp: "先生に なまえを 聞かれました。", roma: "Sensei ni namae o kikaremashita.", es: "El profesor me preguntó el nombre." },
        { jp: "ともだちに わらわれて、はずかしかった。", roma: "Tomodachi ni warawarete, hazukashikatta.", es: "Se rieron de mí y me dio vergüenza." },
        { jp: "じょうしに けいかくを 見られた。", roma: "Jōshi ni keikaku o mirarareta.", es: "El jefe me vio el plan." },
        { jp: "えきで しらない人に 聞かれた。", roma: "Eki de shiranai hito ni kikareta.", es: "Un desconocido me preguntó en la estación." },
        { jp: "こどもに 起こされました。", roma: "Kodomo ni okosaremashita.", es: "Me despertó mi hijo/a." },
        { jp: "クラスで レポートを 読まれた。", roma: "Kurasu de repōto o yomareta.", es: "En clase me leyeron el informe." },
        { jp: "ははに 本を 借りられた。", roma: "Haha ni hon o karirareta.", es: "Mi madre tomó prestado (me ‘quitó’) el libro." },
        { jp: "先生に れんしゅうを させられた。", roma: "Sensei ni renshū o saserareta.", es: "Me hicieron practicar. (causativo-pasivo)" }
      ]
    },

    {
      regla: "② CAUSATIVO 〜せる／〜させる — ‘hacer/dejar que alguien haga’",
      pasoapaso: [
        "¿Para qué sirve? Ordenar, obligar o PERMITIR que alguien haga algo.",
        "Estructura base: A は B に C を V-させる（hacer que B haga C）。",
        "五段: 読む→読ませる／聞く→聞かせる／笑う→笑わせる。",
        "一段: 見る→見させる／借りる→借りさせる。 不規則: する→させる／来る→こさせる。",
        "Permiso: 〜させる＝‘dejar’（外で あそばせる = dejar jugar afuera）。",
        "Causativo-pasivo: 〜させられる（‘me hacen…’）も muy usado."
      ],
      ejemploJP: "先生は 学生に 本を 読ませます。",
      ejemploRoma: "Sensei wa gakusei ni hon o yomasemasu.",
      ejemploES: "El profesor hace que los alumnos lean.",
      tabla: {
        headers: ["Tipo", "Base (dic)", "→ Causativo (JP)", "Caus.-Pasivo", "Romaji"],
        rows: [
          ["五段", "読む／聞く／笑う", "読ませる／聞かせる／笑わせる", "読まされる／聞かされる／笑わされる", "yomaseru / kikaseru / warawaseru → -sareru"],
          ["一段", "見る／借りる", "見させる／借りさせる", "見させられる／借りさせられる", "misaseru / karisaseru → -saserareru"],
          ["不規則", "する／来る(くる)", "させる／こさせる", "させられる／こさせられる", "saseru / kosaseru → saserareru / kosaserareru"]
        ]
      },
      // 8 ejemplos (causativo)
      ejemplos: [
        { jp: "先生は 学生に 音読を 読ませた。", roma: "Sensei wa gakusei ni ondoku o yomaseta.", es: "El profe hizo leer en voz alta a los alumnos." },
        { jp: "ちちは 私を 早く 起こさせた。", roma: "Chichi wa watashi o hayaku okosaseta.", es: "Mi papá me hizo levantarme temprano." },
        { jp: "ははは 子どもに あやまらせた。", roma: "Haha wa kodomo ni ayamaraseta.", es: "La madre hizo que el niño pidiera perdón." },
        { jp: "てんちょうは Aさんに せつめいを させます。", roma: "Tenchō wa A-san ni setsumei o sasemasu.", es: "El encargado hace que A dé la explicación." },
        { jp: "先生は 学生に しつもんを 聞かせた。", roma: "Sensei wa gakusei ni shitsumon o kikaseta.", es: "El profe hizo que los alumnos hicieran preguntas." },
        { jp: "あには 私に 本を 借りさせて くれた。", roma: "Ani wa watashi ni hon o karisasete kureta.", es: "Mi hermano me permitió pedir prestado el libro." },
        { jp: "コーチは チームを 笑わせた。", roma: "Kōchi wa chīmu o warawaseta.", es: "El coach hizo reír al equipo." },
        { jp: "私は いもうとに 手伝わせる つもりだ。", roma: "Watashi wa imōto ni tetsudawaseru tsumori da.", es: "Pienso hacer que mi hermana ayude." }
      ]
    },

    {
      regla: "③ Partículas en PASIVO（に／によって／を／から／で）",
      pasoapaso: [
        "に：agente (¿quién hizo la acción?)。例：私は 先生に 聞かれた。",
        "によって：‘por (parte de)’ formal, generalizaciones. 例：この歌は 多くの人に よって 歌われている。",
        "を：pasivo adversativo AはBにCをVられる。例：私は いもうとに ケーキを 食べられた。",
        "から：agente como ‘fuente’ (coloquial). 例：先生から ほめられた。",
        "で：lugar/medio. 例：駅で 聞かれた。メールで きかれた。",
        "が：tema afectado en pasivo directo. 例：ケーキが 田中さんに 食べられた。"
      ],
      ejemploJP: "私は 先生に なまえを 聞かれた。",
      ejemploRoma: "Watashi wa sensei ni namae o kikareta.",
      ejemploES: "El profesor me preguntó el nombre.",
      tabla: {
        headers: ["Patrón", "Función", "Ejemplo JP", "Romaji", "Traducción"],
        rows: [
          ["A は B に Vられる", "agente con に", "私は 先生に 聞かれた", "Watashi wa sensei ni kikareta", "Fui preguntado por el profe"],
          ["X が B に Vられる", "paciente sujeto", "ケーキが 田中さんに 食べられた", "Kēki ga Tanaka-san ni taberareta", "El pastel fue comido por Tanaka"],
          ["A は B に C を Vられる", "adversativo (molestia)", "私は いもうとに 本を 読まれた", "Watashi wa imōto ni hon o yomareta", "Mi hermana me leyó (mi) libro"],
          ["B によって Vられる", "por (formal)", "この歌は 多くの人に よって 歌われている", "Kono uta wa ōku no hito ni yotte utawarete iru", "Esta canción es cantada por mucha gente"],
          ["場所で Vられる", "lugar/medio", "駅で 聞かれた", "Eki de kikareta", "Me preguntaron en la estación"]
        ]
      }
    },

    {
      regla: "④ Partículas en CAUSATIVO（に／を の違い）",
      pasoapaso: [
        "に：‘a/por’ quien REALIZA la acción forzada/permitida.",
        "を：cuando tratas a la persona como OBJETO directo del hacer (muy común con verbos de movimiento/estado).",
        "Patrón 1【に + を】: 先生は 学生に 本を 読ませる（hace que B lea C）。",
        "Patrón 2【を + 場所など】: 部長は 私を いえに 帰らせた（me hizo volver a casa）。",
        "Permiso cortés: 〜させてください ‘permítame…’",
        "Benefactivo: 〜させてくれる（me dejan）／〜させてもらう（me permiten）"
      ],
      ejemploJP: "先生は 学生に 本を 読ませた。",
      ejemploRoma: "Sensei wa gakusei ni hon o yomaseta.",
      ejemploES: "El profe hizo que el alumno leyera el libro.",
      tabla: {
        headers: ["Patrón", "Cuándo usar", "Ejemplo JP", "Romaji", "Traducción"],
        rows: [
          ["A は B に C を Vさせる", "B hace la acción C", "先生は 学生に 本を 読ませる", "Sensei wa gakusei ni hon o yomaseru", "Hace que lea el libro"],
          ["A は B を 場所へ Vさせる", "mover/estado de B", "部長は 私を 家に 帰らせた", "Buchō wa watashi o ie ni kaeraseta", "Me hizo volver a casa"],
          ["〜させてください", "pedir permiso", "少し 休ませてください", "Sukoshi yasumasete kudasai", "Permítame descansar un poco"],
          ["〜させてもらう/くれる", "me permiten / me dejan", "母が 行かせてくれた", "Haha ga ikasete kureta", "Mi madre me dejó ir"]
        ]
      }
    },

    {
      regla: "⑤ Causativo-pasivo 〜させられる（‘me hacen…’）",
      pasoapaso: [
        "Muy frecuente: persona (A) es obligada por (B) a hacer algo.",
        "Patrón: A は B に V-させられる。",
        "五段（口語）: 読まされる／書かされる（→‘-sareru’).",
        "一段・不規則: 見させられる／させられる／こさせられる。",
        "Se usa mucho en escuela/trabajo/entrenamiento（me hicieron…）"
      ],
      ejemploJP: "私は 先生に れんしゅうを させられた。",
      ejemploRoma: "Watashi wa sensei ni renshū o saserareta.",
      ejemploES: "Me hicieron practicar (por el profe).",
      tabla: {
        headers: ["Tipo", "Base", "→ Caus.-Pasivo (JP)", "Romaji"],
        rows: [
          ["五段", "読む／書く", "読まされる／書かされる", "yomasareru / kakasareru"],
          ["一段", "見る／借りる", "見させられる／借りさせられる", "misaserareru / karisaserareru"],
          ["不規則", "する／来る", "させられる／こさせられる", "saserareru / kosaserareru"]
        ]
      }
    },

    {
      regla: "⑥ Guía rápida: ¿para qué uso cada una?",
      pasoapaso: [
        "PASIVO：cuando te importa el afectado (yo/lo mío). Puede sonar a ‘me pasó algo’ (molestia).",
        "CAUSATIVO：para mandar/permitir. Útil con に（quién hace） y を（a quién mueves/dejas）.",
        "CAUS.-PASIVO：para obligaciones (‘me hicieron…’).",
        "Partículas clave: に（agente/causado por）, によって（por, formal）, を（objeto o persona movida）, から（fuente, coloquial）, で（lugar/medio）."
      ],
      tabla: {
        headers: ["Quiero expresar…", "Mejor uso", "Ejemplo JP", "Romaji", "Traducción"],
        rows: [
          ["Me preguntaron (afectado=yo)", "Pasivo", "先生に 聞かれた", "Sensei ni kikareta", "El profe me preguntó"],
          ["Hice que leyera", "Causativo", "学生に 読ませた", "Gakusei ni yomaseta", "Hice que el alumno leyera"],
          ["Me hicieron practicar", "Caus.-Pasivo", "れんしゅうを させられた", "Renshū o saserareta", "Me hicieron practicar"]
        ]
      }
    }
  ]
},

  dialogos: [
    {
      title: "Me preguntaron",
      kana: [
        "A: 先生に なまえを きかれたんだ。",
        "B: そうなんだ。こたえられた？",
        "A: うん、だいじょうぶ。"
      ],
      kanji: [
        "A: 先生に 名前を 聞かれたんだ。",
        "B: そうなんだ。答えられた？",
        "A: うん、大丈夫。"
      ],
      es: [
        "A: El profe me preguntó el nombre.",
        "B: Ya veo. ¿Pudiste responder?",
        "A: Sí, todo bien."
      ],
    },
    {
      title: "Hacer leer",
      kana: [
        "A: きょうの じゅぎょうで、先生は みんなに よませたよ。",
        "B: むずかしかった？",
        "A: ううん、たのしかった。"
      ],
      kanji: [
        "A: 今日の 授業で、先生は みんなに 読ませたよ。",
        "B: 難しかった？",
        "A: ううん、楽しかった。"
      ],
      es: [
        "A: En la clase de hoy, el profe hizo leer a todos.",
        "B: ¿Fue difícil?",
        "A: No, estuvo divertido."
      ],
    },
    {
      title: "Me hicieron levantarme",
      kana: [
        "A: あさ、父に はやく おこされた。",
        "B: ねむいよね。れんしゅう？",
        "A: うん、うんどう。"
      ],
      kanji: [
        "A: 朝、父に 早く 起こされた。",
        "B: 眠いよね。練習？",
        "A: うん、運動。"
      ],
      es: [
        "A: Por la mañana, mi papá me hizo levantarme temprano.",
        "B: Da sueño, ¿no? ¿Práctica?",
        "A: Sí, ejercicio."
      ],
    },
    {
      title: "No me dejes leer",
      kana: [
        "A: それ、よませて ください。",
        "B: ごめん、いまは だめ。あとで かりさせるよ。",
        "A: ありがとう。"
      ],
      kanji: [
        "A: それ、読ませて ください。",
        "B: ごめん、今は だめ。あとで 借りさせるよ。",
        "A: ありがとう。"
      ],
      es: [
        "A: Por favor, déjame leer eso.",
        "B: Perdón, ahora no. Te dejaré pedirlo prestado más tarde.",
        "A: Gracias."
      ],
    },
    {
      title: "Me hicieron explicar",
      kana: [
        "A: きょう、てんちょうに せつめいを させられた。",
        "B: たいへんだったね。",
        "A: でも、いい れんしゅうに なった。"
      ],
      kanji: [
        "A: 今日、店長に 説明を させられた。",
        "B: 大変だったね。",
        "A: でも、いい 練習に なった。"
      ],
      es: [
        "A: Hoy el encargado me hizo dar la explicación.",
        "B: Debió ser pesado.",
        "A: Pero fue buena práctica."
      ],
    },
    {
      title: "Me leyeron el informe",
      kana: [
        "A: どうりょうに レポートを よまれた。",
        "B: えっ、いやだった？",
        "A: まあ、ちょっと。"
      ],
      kanji: [
        "A: 同僚に レポートを 読まれた。",
        "B: えっ、嫌だった？",
        "A: まあ、ちょっと。"
      ],
      es: [
        "A: Un colega me leyó el informe.",
        "B: ¿Eh? ¿Te molestó?",
        "A: Bueno, un poco."
      ],
    },
    {
      title: "Hacer reír",
      kana: [
        "A: コーチは チームを わらわせたよ。",
        "B: きょうの れんしゅう、いい ふんいき だったね。"
      ],
      kanji: [
        "A: コーチは チームを 笑わせたよ。",
        "B: 今日の 練習、いい 雰囲気 だったね。"
      ],
      es: [
        "A: El coach hizo reír al equipo.",
        "B: Hoy el entrenamiento tuvo buen ambiente."
      ],
    },
  ],

  quizSets: [
    [
      "A: 先生に なまえを きかれたんだ。",
      "B: そうなんだ。こたえられた？",
      "A: うん、だいじょうぶ。"
    ],
    [
      "A: きょうの じゅぎょうで、先生は みんなに よませたよ。",
      "B: むずかしかった？",
      "A: ううん、たのしかった。"
    ],
    [
      "A: あさ、父に はやく おこされた。",
      "B: ねむいよね。れんしゅう？",
      "A: うん、うんどう。"
    ],
    [
      "A: それ、よませて ください。",
      "B: ごめん、いまは だめ。あとで かりさせるよ。",
      "A: ありがとう。"
    ],
    [
      "A: きょう、てんちょうに せつめいを させられた。",
      "B: たいへんだったね。",
      "A: でも、いい れんしゅうに なった。"
    ],
    [
      "A: どうりょうに レポートを よまれた。",
      "B: えっ、いやだった？",
      "A: まあ、ちょっと。"
    ],
  ],

  kanji10: [
    { ch: "見", kun: ["み(る)","み(せる)","み(える)"], on: ["ケン"], es: "ver", trazos: 7, strokeCode: "898b",
      ej: [{ jp: "見る", yomi: "みる", es: "ver" }, { jp: "見学", yomi: "けんがく", es: "visita de estudio" }] },
    { ch: "聞", kun: ["き(く)","き(こえる)"], on: ["ブン","モン"], es: "escuchar; preguntar", trazos: 14, strokeCode: "805e",
      ej: [{ jp: "聞く", yomi: "きく", es: "escuchar/preguntar" }, { jp: "新聞", yomi: "しんぶん", es: "periódico" }] },
    { ch: "読", kun: ["よ(む)"], on: ["ドク"], es: "leer", trazos: 14, strokeCode: "8aad",
      ej: [{ jp: "読む", yomi: "よむ", es: "leer" }, { jp: "読書", yomi: "どくしょ", es: "lectura" }] },
    { ch: "起", kun: ["お(きる)","お(こす)","お(こる)"], on: ["キ"], es: "levantarse; ocurrir", trazos: 10, strokeCode: "8d77",
      ej: [{ jp: "起きる", yomi: "おきる", es: "levantarse" }, { jp: "起こす", yomi: "おこす", es: "despertar; causar" }] },
    { ch: "役", kun: [], on: ["ヤク"], es: "papel; rol", trazos: 7, strokeCode: "5f79",
      ej: [{ jp: "役", yomi: "やく", es: "rol" }, { jp: "役立つ", yomi: "やくだつ", es: "ser útil" }] },
    { ch: "代", kun: ["か(わる)","か(える)"], on: ["ダイ","タイ"], es: "sustituir; generación", trazos: 5, strokeCode: "4ee3",
      ej: [{ jp: "代わり", yomi: "かわり", es: "en lugar de" }, { jp: "時代", yomi: "じだい", es: "época" }] },
    { ch: "泣", kun: ["な(く)"], on: ["キュウ"], es: "llorar", trazos: 8, strokeCode: "6ce3",
      ej: [{ jp: "泣く", yomi: "なく", es: "llorar" }, { jp: "泣き声", yomi: "なきごえ", es: "llanto" }] },
    { ch: "笑", kun: ["わら(う)","え(む)"], on: ["ショウ"], es: "reír; sonrisa", trazos: 10, strokeCode: "7b11",
      ej: [{ jp: "笑う", yomi: "わらう", es: "reír" }, { jp: "笑顔", yomi: "えがお", es: "sonrisa" }] },
    { ch: "借", kun: ["か(りる)"], on: ["シャク"], es: "pedir prestado", trazos: 10, strokeCode: "501f",
      ej: [{ jp: "借りる", yomi: "かりる", es: "pedir prestado" }, { jp: "借金", yomi: "しゃっきん", es: "deuda" }] },
    { ch: "貸", kun: ["か(す)"], on: ["タイ"], es: "prestar", trazos: 12, strokeCode: "8cb8",
      ej: [{ jp: "貸す", yomi: "かす", es: "prestar" }, { jp: "賃貸", yomi: "ちんたい", es: "alquiler" }] },
  ],
};

export default TEMA_28;
