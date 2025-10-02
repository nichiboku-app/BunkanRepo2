import type { ThemeContent } from "./types";

/**
 * TEMA 10 (N4) · 📈 Proyectos y metas – Expresar intenciones, objetivos y planes futuros
 * Regla: en gramática y diálogos usamos solo kanji ya vistos + los 10 nuevos de este tema.
 * Lo que no esté cubierto va en かな／カタカナ.
 */

const TEMA_10: ThemeContent = {
  objetivos: [
    "Decir intención: 〜つもりです／〜たいです。",
    "Plan fijo: 〜予定です。",
    "Decidir ahora / hábito decidido: 〜ことにします／〜ことにしています。",
    "Preparación para el futuro: 〜ておきます。",
    "Presentar avances: 発表（はっぴょう）・表（ひょう）を使う。",
  ],

  /* ======================
     VOCABULARIO (≥15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "計画",         romaji: "keikaku",       es: "plan (planificación)" },
    { key: "v2",  jp: "目標",         romaji: "mokuhyō",       es: "objetivo (meta)" }, // ※ 標 lo dejamos implícito; se puede mostrar en kana en diálogos
    { key: "v3",  jp: "発表",         romaji: "happyō",        es: "presentación" },
    { key: "v4",  jp: "集まる",       romaji: "atsumaru",      es: "reunirse (personas)" },
    { key: "v5",  jp: "決める",       romaji: "kimeru",        es: "decidir" },
    { key: "v6",  jp: "変える",       romaji: "kaeru",         es: "cambiar (algo)" },
    { key: "v7",  jp: "始める",       romaji: "hajimeru",      es: "empezar (algo)" },
    { key: "v8",  jp: "終わる",       romaji: "owaru",         es: "terminar" },
    { key: "v9",  jp: "記録",         romaji: "kiroku",        es: "registro" }, // ※ 録 no se usa en kanji en los diálogos (se puede usar メモ)
    { key: "v10", jp: "表",           romaji: "hyō",           es: "cuadro/tabla" },
    { key: "v11", jp: "資料",         romaji: "shiryō",        es: "material (documentos)" }, // en diálogos mejor メモ／ファイル
    { key: "v12", jp: "準備",         romaji: "junbi",         es: "preparación" }, // se mostrará como じゅんび si hace falta
    { key: "v13", jp: "つもり",       romaji: "tsumori",       es: "intención (sust.)" },
    { key: "v14", jp: "予定",         romaji: "yotei",         es: "plan (programado)" },
    { key: "v15", jp: "やる気",       romaji: "yaruki",        es: "motivación" },
    { key: "v16", jp: "しめきり",     romaji: "shimekiri",     es: "fecha límite (deadline)" },
    { key: "v17", jp: "プロジェクト", romaji: "purojekuto",    es: "proyecto" },
    { key: "v18", jp: "スケジュール", romaji: "sukejūru",      es: "calendario/cronograma" },
  ],

  /* ======================
     ORACIONES MODELO (6)
  ====================== */
  oraciones6: [
    {
      key: "s1",
      jp: "来月、発表を します。",
      romaji: "raigetsu, happyō o shimasu",
      es: "El próximo mes haré una presentación.",
      exp: "Tiempo + は/、 + 発表をします。",
    },
    {
      key: "s2",
      jp: "新しい 計画を 決めます。",
      romaji: "atarashii keikaku o kimemasu",
      es: "Decidimos un plan nuevo.",
      exp: "名詞 + を + 決めます（decidir）",
    },
    {
      key: "s3",
      jp: "来週から 早く 勉強を 始める つもりです。",
      romaji: "raishū kara hayaku benkyō o hajimeru tsumori desu",
      es: "Desde la próxima semana pienso empezar a estudiar temprano.",
      exp: "diccionario + つもりです（intención）",
    },
    {
      key: "s4",
      jp: "きょうは 表を 作って おきます。",
      romaji: "kyō wa hyō o tsukutte okimasu",
      es: "Hoy voy a dejar hecha una tabla.",
      exp: "〜ておきます（hacer por preparación）",
    },
    {
      key: "s5",
      jp: "計画を 変えたいです。",
      romaji: "keikaku o kaetai desu",
      es: "Quiero cambiar el plan.",
      exp: "ます語幹 + たいです（querer hacer）",
    },
    {
      key: "s6",
      jp: "７時に 作業を 終わる 予定です。",
      romaji: "shichi-ji ni sagyō o owaru yotei desu",
      es: "Planeo terminar el trabajo a las 7.",
      exp: "diccionario + 予定です（plan fijado）",
    },
  ],

  /* ======================
     GRAMÁTICA (explicada “como en primaria”)
  ====================== */
  gramatica: {
    titulo: "Gramática — intenciones, planes y preparación",
    puntos: [
      {
        regla: "① 〜たいです（quiero hacer…）",
        pasoapaso: [
          "Verbo（ます形）-ます + たいです。",
          "Negativo: 〜たくないです（no quiero）。",
        ],
        ejemploJP: "計画を 変えたいです。",
        ejemploRoma: "keikaku o kaetai desu",
        ejemploES: "Quiero cambiar el plan.",
        ejemplos: [
          { jp: "早く 始めたいです。", roma: "hayaku hajimetai desu", es: "Quiero empezar temprano." },
          { jp: "発表を 見せたいです。", roma: "happyō o misetai desu", es: "Quiero mostrar la presentación." },
        ],
      },
      {
        regla: "② 〜つもりです（intención personal）",
        pasoapaso: [
          "Verbo（diccionario）+ つもりです。",
          "Negativo: 〜ない つもりです（no pienso…）。",
        ],
        ejemploJP: "来週から 勉強を 始める つもりです。",
        ejemploRoma: "raishū kara benkyō o hajimeru tsumori desu",
        ejemploES: "Pienso empezar a estudiar desde la próxima semana.",
        ejemplos: [
          { jp: "計画を 変えない つもりです。", roma: "keikaku o kaenai tsumori desu", es: "No pienso cambiar el plan." },
          { jp: "７時に 終わる つもりです。",  roma: "shichi-ji ni owaru tsumori desu", es: "Pienso terminar a las 7." },
        ],
      },
      {
        regla: "③ 〜予定です（plan fijado）",
        pasoapaso: [
          "Verbo（diccionario）+ 予定です。",
          "Nombre + の + 予定です。",
        ],
        ejemploJP: "会議を ８時に 始める 予定です。",
        ejemploRoma: "kaigi o hachi-ji ni hajimeru yotei desu",
        ejemploES: "Está previsto empezar la reunión a las 8.",
        ejemplos: [
          { jp: "来月 発表の 予定です。", roma: "raigetsu happyō no yotei desu", es: "La presentación está prevista para el mes que viene." },
          { jp: "作業を 今日 終わる 予定です。", roma: "sagyō o kyō owaru yotei desu", es: "Planeo terminar el trabajo hoy." },
        ],
      },
      {
        regla: "④ 〜ておきます（preparar, dejar hecho）",
        pasoapaso: [
          "Verbo（て形）+ おきます。",
          "Sentido: “lo hago ahora para el futuro”.",
        ],
        ejemploJP: "表を 作って おきます。",
        ejemploRoma: "hyō o tsukutte okimasu",
        ejemploES: "Haré la tabla y la dejaré lista.",
        ejemplos: [
          { jp: "資料を よんで おきます。", roma: "shiryō o yonde okimasu", es: "Leeré el material de antemano." },
          { jp: "場所を 決めて おきます。", roma: "basho o kimete okimasu", es: "Dejaré decidido el lugar." },
        ],
      },
      {
        regla: "⑤ 〜ことにします／〜ことにしています",
        pasoapaso: [
          "Verbo（diccionario）+ ことにします → “decido ahora”.",
          "Verbo（diccionario）+ ことにしています → “tengo decidido hacerlo (hábito)”.",
        ],
        ejemploJP: "まいにち 早く 起きる ことにします。",
        ejemploRoma: "mainichi hayaku okiru koto ni shimasu",
        ejemploES: "Decido levantarme temprano todos los días.",
        ejemplos: [
          { jp: "夜９時に 勉強する ことにしています。", roma: "yoru ku-ji ni benkyō suru koto ni shiteimasu", es: "Tengo por costumbre estudiar a las 9 p. m." },
          { jp: "計画を 変えない ことにします。",        roma: "keikaku o kaenai koto ni shimasu", es: "Decido no cambiar el plan." },
        ],
      },
      {
        regla: "⑥ 発表（はっぴょう）・表（ひょう）を使う",
        pasoapaso: [
          "発表＝presentación (hablar/mostrar).",
          "表＝tabla/cuadro (documento).",
          "動詞：発表する／表を作る。",
        ],
        ejemploJP: "来月、発表を する つもりです。",
        ejemploRoma: "raigetsu, happyō o suru tsumori desu",
        ejemploES: "Pienso hacer la presentación el mes que viene.",
        ejemplos: [
          { jp: "表を 作って おきます。", roma: "hyō o tsukutte okimasu", es: "Dejo hecha la tabla." },
          { jp: "チームで 集まって 発表します。", roma: "chīmu de atsumatte happyō shimasu", es: "Nos reunimos en equipo y presentamos." },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7) — kana/kanji paralelos
  ====================== */
  dialogos: [
    {
      title: "Decidir el plan",
      kana:  ["あした 計画を きめましょう。", "いいですね。 ７じに あつまりましょう。"],
      kanji: ["明日 計画を 決めましょう。",  "いいですね。 ７時に 集まりましょう。"],
      es:    ["Mañana decidamos el plan.", "Bien. Reunámonos a las 7."],
    },
    {
      title: "Intención personal",
      kana:  ["らいげつ、はっぴょうを する つもりです。", "たのしみ です。"],
      kanji: ["来月、発表を する つもりです。",        "楽しみ です。"],
      es:    ["El mes que viene pienso presentar.", "Qué emoción."],
    },
    {
      title: "Preparación",
      kana:  ["きょう、ひょうを つくって おきます。", "ありがとうございます。"],
      kanji: ["今日、表を 作って おきます。",          "ありがとうございます。"],
      es:    ["Hoy dejo hecha la tabla.", "Gracias."],
    },
    {
      title: "Cambiar plan",
      kana:  ["すみません、けいかくを かえても いいですか。", "はい、いいです。"],
      kanji: ["すみません、計画を 変えても いいですか。", "はい、いいです。"],
      es:    ["Perdón, ¿puedo cambiar el plan?", "Sí, está bien."],
    },
    {
      title: "Terminar a tiempo",
      kana:  ["７じに しごとを おわる よていです。", "わかりました。"],
      kanji: ["７時に 仕事を 終わる 予定です。",       "わかりました。"],
      es:    ["Planeo terminar el trabajo a las 7.", "Entendido."],
    },
    {
      title: "Decisión ahora",
      kana:  ["まいにち ３０ふん 日本語を べんきょう する ことにします。", "がんばって ください。"],
      kanji: ["毎日 ３０分 日本語を 勉強 する ことにします。",          "がんばって ください。"],
      es:    ["Decido estudiar japonés 30 min cada día.", "¡Ánimo!"],
    },
    {
      title: "Reunión del equipo",
      kana:  ["らいしゅうの かようびに チームで あつまりますか。", "はい、あつまりましょう。"],
      kanji: ["来週の 火曜日に チームで 集まりますか。",            "はい、集まりましょう。"],
      es:    ["¿Nos reunimos el martes de la próxima semana?", "Sí, reunámonos."],
    },
  ],

  /* ======================
     QUIZ — 6 sets (OrderDialogCard)
  ====================== */
  quizSets: [
    [
      "明日 計画を 決めましょう。",
      "いいですね。",
      "７時に 集まりましょう。",
    ],
    [
      "来月、発表を する つもりです。",
      "楽しみ です。",
    ],
    [
      "今日、表を 作って おきます。",
      "ありがとうございます。",
    ],
    [
      "すみません、計画を 変えても いいですか。",
      "はい、いいです。",
    ],
    [
      "７時に 仕事を 終わる 予定です。",
      "わかりました。",
    ],
    [
      "毎日 ３０分 日本語を 勉強 する ことにします。",
      "がんばって ください。",
    ],
  ],

  /* ======================
     KANJI (10) — nuevos de la lección
     strokeCode = hex4 minúscula (coincide con filename *_web.webp)
  ====================== */
  kanji10: [
    {
      ch: "計", kun: ["はか-る"], on: ["ケイ"], es: "medir; planear",
      trazos: 9, strokeCode: "8a08",
      ej: [{ jp: "計画", yomi: "けいかく", es: "plan" }],
    },
    {
      ch: "画", kun: [], on: ["ガ","カク"], es: "trazo; plan/dibujo",
      trazos: 8, strokeCode: "753b",
      ej: [{ jp: "計画", yomi: "けいかく", es: "plan" }],
    },
    {
      ch: "決", kun: ["き-める"], on: ["ケツ"], es: "decidir",
      trazos: 7, strokeCode: "6c7a",
      ej: [{ jp: "決めます", yomi: "きめます", es: "decidir" }],
    },
    {
      ch: "変", kun: ["か-える","か-わる"], on: ["ヘン"], es: "cambiar",
      trazos: 9, strokeCode: "5909",
      ej: [{ jp: "変えます", yomi: "かえます", es: "cambiar (algo)" }],
    },
    {
      ch: "始", kun: ["はじ-める","はじ-まる"], on: ["シ"], es: "empezar",
      trazos: 8, strokeCode: "59cb",
      ej: [{ jp: "始めます", yomi: "はじめます", es: "empezar" }],
    },
    {
      ch: "終", kun: ["お-わる","お-える"], on: ["シュウ"], es: "terminar",
      trazos: 11, strokeCode: "7d42",
      ej: [{ jp: "終わります", yomi: "おわります", es: "terminar" }],
    },
    {
      ch: "表", kun: ["おもて"], on: ["ヒョウ"], es: "tabla; expresar",
      trazos: 8, strokeCode: "8868",
      ej: [{ jp: "表", yomi: "ひょう", es: "tabla/cuadro" }],
    },
    {
      ch: "記", kun: ["しる-す"], on: ["キ"], es: "anotar; registro",
      trazos: 10, strokeCode: "8a18",
      ej: [{ jp: "記事", yomi: "きじ", es: "artículo; nota" }],
    },
    {
      ch: "発", kun: [], on: ["ハツ","ホツ"], es: "emitir; partir; presentar",
      trazos: 9, strokeCode: "767a",
      ej: [{ jp: "発表", yomi: "はっぴょう", es: "presentación" }],
    },
    {
      ch: "集", kun: ["あつ-まる","あつ-める"], on: ["シュウ"], es: "reunir(se)",
      trazos: 12, strokeCode: "96c6",
      ej: [{ jp: "集まります", yomi: "あつまります", es: "reunirse" }],
    },
  ],
};

export default TEMA_10;
