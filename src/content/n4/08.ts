import type { ThemeContent } from "./types";

/**
 * TEMA 8 (N4) · 📅 Planes y citas – Acordar fechas, sugerir actividades, rechazar planes
 * Nota: En gramática/diálogos se usan solo kanji ya vistos + los 10 nuevos de este tema.
 * Si algo no está en la lista, va en かな.
 */

const TEMA_8: ThemeContent = {
  objetivos: [
    "Invitar: ～ませんか／～ましょう。",
    "Sugerir: ～はどうですか。",
    "Rechazar amable: すみませんが…／きょうはむりです／またこんど。",
    "Fechas y horas: ～月～日／～時～分。",
    "Diferenciar 予定（plan）y 予約（reserva）。",
  ],

  /* ======================
     VOCABULARIO (≥15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "予定",       romaji: "yotei",        es: "plan, agenda" },
    { key: "v2",  jp: "予約",       romaji: "yoyaku",       es: "reserva" },
    { key: "v3",  jp: "会う",       romaji: "au",           es: "quedar / reunirse" },
    { key: "v4",  jp: "月",         romaji: "tsuki",        es: "mes; luna" },
    { key: "v5",  jp: "日",         romaji: "hi",           es: "día; sol" },
    { key: "v6",  jp: "年",         romaji: "toshi",        es: "año" },
    { key: "v7",  jp: "週",         romaji: "shū",          es: "semana" },
    { key: "v8",  jp: "月曜日",     romaji: "getsuyōbi",    es: "lunes" },
    { key: "v9",  jp: "日曜日",     romaji: "nichiyōbi",    es: "domingo" },
    { key: "v10", jp: "はやい（早い）", romaji: "hayai",   es: "temprano; rápido" },
    { key: "v11", jp: "こんしゅう", romaji: "konshū",       es: "esta semana" },
    { key: "v12", jp: "らいしゅう", romaji: "raishū",       es: "la próxima semana" },
    { key: "v13", jp: "あした",     romaji: "ashita",       es: "mañana (día sig.)" },
    { key: "v14", jp: "あさって",   romaji: "asatte",       es: "pasado mañana" },
    { key: "v15", jp: "つごう",     romaji: "tsugō",        es: "conveniencia; disponibilidad" },
    { key: "v16", jp: "ひま",       romaji: "hima",         es: "tiempo libre" },
    { key: "v17", jp: "キャンセル", romaji: "kyanseru",     es: "cancelación" },
    { key: "v18", jp: "いいですか", romaji: "ii desu ka",   es: "¿está bien?/¿puede ser?" },
  ],

  /* ======================
     ORACIONES MODELO (6)
  ====================== */
  oraciones6: [
    {
      key: "s1",
      jp: "らいしゅうの 日曜日、会いませんか。",
      romaji: "raishū no nichiyōbi, aimasen ka",
      es: "¿Quedamos el domingo de la próxima semana?",
      exp: "Invitación con ～ませんか（¿te parece si…?）",
    },
    {
      key: "s2",
      jp: "月曜日は ちょっと… 予約が あります。",
      romaji: "getsuyōbi wa chotto… yoyaku ga arimasu",
      es: "El lunes… mmm, tengo una reserva.",
      exp: "Rechazo suave con ちょっと… + razón.",
    },
    {
      key: "s3",
      jp: "じゃあ、６時に 会いましょう。",
      romaji: "jaa, roku-ji ni aimashō",
      es: "Entonces, quedemos a las 6.",
      exp: "Propuesta con ～ましょう（hagamos…）",
    },
    {
      key: "s4",
      jp: "８月１０日は どうですか。",
      romaji: "hachigatsu tōka wa dō desu ka",
      es: "¿Qué tal el 10 de agosto?",
      exp: "Sugerencia con ～はどうですか。",
    },
    {
      key: "s5",
      jp: "すみません、きょうは むりです。 またこんど。",
      romaji: "sumimasen, kyō wa muri desu. mata kondo",
      es: "Perdón, hoy no puedo. Tal vez la próxima.",
      exp: "Rechazo amable + posponer.",
    },
    {
      key: "s6",
      jp: "予定を 早く きめましょう。",
      romaji: "yotei o hayaku kimemashō",
      es: "Decidamos el plan pronto.",
      exp: "Adverbio 早く (temprano/rápido) + ～ましょう。",
    },
  ],

  /* ======================
     GRAMÁTICA (explicado “como en primaria”)
  ====================== */
  gramatica: {
    titulo: "Gramática — invitar, sugerir y rechazar (fácil)",
    puntos: [
      {
        regla: "① Invitar con ～ませんか",
        pasoapaso: [
          "Usa la forma ます del verbo.",
          "Pon ませんか al final: “¿(no) hacemos…?” = invitación amable.",
          "Respuestas: いいですね（sí）／ちょっと…（no suave）",
        ],
        ejemploJP: "日曜日、会いませんか。",
        ejemploRoma: "nichiyōbi, aimasen ka",
        ejemploES: "¿Quedamos el domingo?",
        ejemplos: [
          { jp: "６時に 会いませんか。", roma: "roku-ji ni aimasen ka", es: "¿Quedamos a las 6?" },
          { jp: "らいしゅう、どうですか。", roma: "raishū, dō desu ka", es: "¿La próxima semana, qué tal?" },
        ],
      },
      {
        regla: "② Proponer con ～ましょう",
        pasoapaso: [
          "Forma ます del verbo + ましょう.",
          "Significa “¡hagamos…!” (propuesta directa).",
        ],
        ejemploJP: "６時に 会いましょう。",
        ejemploRoma: "roku-ji ni aimashō",
        ejemploES: "Quedemos a las 6.",
        ejemplos: [
          { jp: "日曜日に 会いましょう。", roma: "nichiyōbi ni aimashō", es: "Quedemos el domingo." },
          { jp: "早く きめましょう。", roma: "hayaku kimemashō", es: "Decidamos pronto." },
        ],
      },
      {
        regla: "③ Sugerir con ～はどうですか",
        pasoapaso: [
          "【tema】は どうですか → “¿qué tal …?”",
          "Tema puede ser fecha, hora o lugar.",
        ],
        ejemploJP: "８月１０日は どうですか。",
        ejemploRoma: "hachigatsu tōka wa dō desu ka",
        ejemploES: "¿Qué tal el 10 de agosto?",
        ejemplos: [
          { jp: "月曜日は どうですか。", roma: "getsuyōbi wa dō desu ka", es: "¿Qué tal el lunes?" },
          { jp: "６時は どうですか。",   roma: "roku-ji wa dō desu ka",  es: "¿Qué tal a las 6?" },
        ],
      },
      {
        regla: "④ Rechazar amable",
        pasoapaso: [
          "Empieza con すみませんが…（perdón, pero…）。",
          "Da una razón simple: きょうは むりです。／よやくが あります。",
          "Ofrece otra opción: またこんど。／らいしゅう は どうですか。",
        ],
        ejemploJP: "すみませんが、きょうは むりです。",
        ejemploRoma: "sumimasen ga, kyō wa muri desu",
        ejemploES: "Perdón, hoy no puedo.",
        ejemplos: [
          { jp: "予約が あります。", roma: "yoyaku ga arimasu", es: "Tengo una reserva." },
          { jp: "またこんど おねがいします。", roma: "mata kondo onegai shimasu", es: "Tal vez la próxima, por favor." },
        ],
      },
      {
        regla: "⑤ 予定 vs 予約",
        pasoapaso: [
          "予定（よてい）= plan personal/agenda.",
          "予約（よやく）= reserva con tienda/hospital/etc.",
          "Ambas usan kanji nuevos: 予 + 定／約。",
        ],
        ejemploJP: "予定を 早く きめます。",
        ejemploRoma: "yotei o hayaku kimemasu",
        ejemploES: "Decido el plan pronto.",
        ejemplos: [
          { jp: "予約を します。", roma: "yoyaku o shimasu", es: "Hago una reserva." },
          { jp: "予定を 変えます。", roma: "yotei o kaemasu", es: "Cambio el plan." },
        ],
      },

      /* === NUEVO: cómo cambiar el verbo (paso a paso + tabla) === */
      {
        regla: "⑥ Cómo cambio el verbo para invitar/proponer",
        pasoapaso: [
          "1) Toma la forma diccionario (ej.: 会う／行く／する／くる).",
          "2) Pasa a forma ます (polite): 会い→会います／行き→行きます／します／きます。",
          "3) Invitación: ます → ませんか（会いませんか）。",
          "4) Propuesta: ます → ましょう（会いましょう）。",
        ],
        ejemploJP: "会います → 会いませんか／会いましょう",
        ejemploRoma: "aimasu → aimasen ka / aimashō",
        ejemploES: "me reúno → ¿nos reunimos? / reunámonos",
        tabla: {
          title: "Verbo → ます／ませんか／ましょう（modelo）",
          headers: ["Diccionario", "ます形", "～ませんか", "～ましょう", "Español"],
          rows: [
            ["会う（あう）", "会います", "会いませんか", "会いましょう", "reunirse / ¿nos reunimos? / reunámonos"],
            ["行く（いく）", "行きます", "行きませんか", "行きましょう", "ir / ¿vamos? / vamos"],
            ["する", "します", "しませんか", "しましょう", "hacer / ¿hacemos? / hagamos"],
            ["くる", "きます", "きませんか", "きましょう", "venir / ¿vienes? / ven (vamos a venir)"],
          ],
          note: "Usamos kanji ya vistos. Para する・くる lo mostramos en kana.",
        },
      },

      /* === Listas/tablas pedidas === */
      {
        regla: "⑦ Meses del año（1〜12）",
        pasoapaso: [
          "Número arábigo + 月（がつ）.",
          "Ej.: ８月（はちがつ）= agosto.",
        ],
        tabla: {
          title: "Meses",
          headers: ["Nº", "JP (〜月)", "Rōmaji"],
          rows: [
            ["1", "１月", "ichigatsu"],
            ["2", "２月", "nigatsu"],
            ["3", "３月", "sangatsu"],
            ["4", "４月", "shigatsu"],
            ["5", "５月", "gogatsu"],
            ["6", "６月", "rokugatsu"],
            ["7", "７月", "shichigatsu"],
            ["8", "８月", "hachigatsu"],
            ["9", "９月", "kugatsu"],
            ["10", "１０月", "jūgatsu"],
            ["11", "１１月", "jū-ichigatsu"],
            ["12", "１２月", "jū-nigatsu"],
          ],
          note: "Solo usamos 月 como kanji (nuevo del tema). El número va en arábigo.",
        },
      },
      {
        regla: "⑧ Días del mes（1〜31）",
        pasoapaso: [
          "Número arábigo + 日（にち）.",
          "Irregulares: 1,2,3,4,5,6,7,8,9,10,14,20,24.",
        ],
        tabla: {
          title: "Días del mes",
          headers: ["Nº", "JP (〜日)", "Lectura", "Rōmaji"],
          rows: [
            ["1", "１日", "ついたち", "tsuitachi"],
            ["2", "２日", "ふつか", "futsuka"],
            ["3", "３日", "みっか", "mikka"],
            ["4", "４日", "よっか", "yokka"],
            ["5", "５日", "いつか", "itsuka"],
            ["6", "６日", "むいか", "muika"],
            ["7", "７日", "なのか", "nanoka"],
            ["8", "８日", "ようか", "yōka"],
            ["9", "９日", "ここのか", "kokonoka"],
            ["10", "１０日", "とおか", "tōka"],
            ["11", "１１日", "じゅういちにち", "jū-ichi-nichi"],
            ["12", "１２日", "じゅうににち", "jū-ni-nichi"],
            ["13", "１３日", "じゅうさんにち", "jū-san-nichi"],
            ["14", "１４日", "じゅうよっか", "jū-yokka"],
            ["15", "１５日", "じゅうごにち", "jū-go-nichi"],
            ["16", "１６日", "じゅうろくにち", "jū-roku-nichi"],
            ["17", "１７日", "じゅうしちにち", "jū-shichi-nichi"],
            ["18", "１８日", "じゅうはちにち", "jū-hachi-nichi"],
            ["19", "１９日", "じゅうくにち", "jū-ku-nichi"],
            ["20", "２０日", "はつか", "hatsuka"],
            ["21", "２１日", "にじゅういちにち", "ni-jū-ichi-nichi"],
            ["22", "２２日", "にじゅうににち", "ni-jū-ni-nichi"],
            ["23", "２３日", "にじゅうさんにち", "ni-jū-san-nichi"],
            ["24", "２４日", "にじゅうよっか", "ni-jū-yokka"],
            ["25", "２５日", "にじゅうごにち", "ni-jū-go-nichi"],
            ["26", "２６日", "にじゅうろくにち", "ni-jū-roku-nichi"],
            ["27", "２７日", "にじゅうしちにち", "ni-jū-shichi-nichi"],
            ["28", "２８日", "にじゅうはちにち", "ni-jū-hachi-nichi"],
            ["29", "２９日", "にじゅうくにち", "ni-jū-ku-nichi"],
            ["30", "３０日", "さんじゅうにち", "san-jū-nichi"],
            ["31", "３１日", "さんじゅういちにち", "san-jū-ichi-nichi"],
          ],
          note: "Kanji usados: 日（nuevo) + números arábigos. Lecturas en かな con rōmaji.",
        },
      },
      {
        regla: "⑨ Días de la semana（かな）",
        pasoapaso: [
          "Mostramos en かな para no usar kanji no vistos aún.",
          "Ya conoces: 月（げつ）・日（にち）・曜日（ようび）.",
        ],
        tabla: {
          title: "Días de la semana (kana)",
          headers: ["Español", "JP (kana)", "Rōmaji"],
          rows: [
            ["lunes", "げつようび", "getsuyōbi"],
            ["martes", "かようび", "kayōbi"],
            ["miércoles", "すいようび", "suiyōbi"],
            ["jueves", "もくようび", "mokuyōbi"],
            ["viernes", "きんようび", "kin'yōbi"],
            ["sábado", "どようび", "doyōbi"],
            ["domingo", "にちようび", "nichiyōbi"],
          ],
          note: "Si quieres verlos con kanji: 月曜日／日曜日 ya están en este tema; los demás se verán en una lección futura.",
        },
      },
      {
        regla: "⑩ Fechas y horas (patrones útiles)",
        pasoapaso: [
          "年（ねん）／月（がつ）／日（にち） con números arábigos.",
          "曜日（～ようび）: げつようび／にちようび など。",
          "Hora: ～時（じ）／minutos: ～分（ふん・ぷん）。",
        ],
        ejemploJP: "８月１０日（に） 会います。",
        ejemploRoma: "hachigatsu tōka (ni) aimasu",
        ejemploES: "Nos vemos el 10 de agosto.",
        tabla: {
          title: "Patrones rápidos",
          headers: ["Español", "JP", "Rōmaji"],
          rows: [
            ["8 de agosto", "８月８日", "hachigatsu yōka"],
            ["10 de agosto", "８月１０日", "hachigatsu tōka"],
            ["domingo", "にちようび", "nichiyōbi"],
            ["lunes", "げつようび", "getsuyōbi"],
            ["a las 6", "６時", "roku-ji"],
          ],
          note: "Usa números arábigos para evitar kanji no vistos todavía.",
        },
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7) — kana/kanji paralelos
  ====================== */
  dialogos: [
    {
      title: "Invitación (domingo)",
      kana:  ["らいしゅうの にちようび、あいませんか。", "いいですね。", "６じに あいましょう。"],
      kanji: ["来週の 日曜日、会いませんか。",       "いいですね。", "６時に 会いましょう。"],
      es:    ["¿Quedamos el domingo de la próxima semana?", "Suena bien.", "Quedemos a las 6."],
    },
    {
      title: "No puedo lunes",
      kana:  ["げつようびは ちょっと…", "よやくが あります。", "また こんど。"],
      kanji: ["月曜日は ちょっと…",        "予約が あります。",   "また 今度。"],
      es:    ["El lunes… mmm…", "Tengo una reserva.", "Quizá la próxima."],
    },
    {
      title: "Elegir fecha",
      kana:  ["８がつ１０日は どうですか。", "いいですね。", "はやく きめましょう。"],
      kanji: ["８月１０日は どうですか。",  "いいですね。",  "早く きめましょう。"],
      es:    ["¿Qué tal el 10 de agosto?", "Bien.", "Decidamos pronto."],
    },
    {
      title: "Proponer hora",
      kana:  ["６じは どうですか。", "すこし はやい です。", "じゃあ、６じ３０ぷん は どうですか。"],
      kanji: ["６時は どうですか。",  "少し 早い です。",     "じゃあ、６時３０分 は どうですか。"],
      es:    ["¿Qué tal a las 6?", "Un poco temprano.", "Entonces, ¿6:30?"],
    },
    {
      title: "Confirmar plan",
      kana:  ["にちようびに あいましょう。", "ばしょは？", "えきの まえ は どうですか。"],
      kanji: ["日曜日に 会いましょう。",     "場所は？",   "駅の 前 は どうですか。"],
      es:    ["Quedemos el domingo.", "¿Lugar?", "¿Frente a la estación?"],
    },
    {
      title: "Cancelar (suave)",
      kana:  ["すみませんが、きょうは むりです。", "だいじょうぶ です。 また こんど。"],
      kanji: ["すみませんが、今日は むりです。",  "大丈夫 です。 また 今度。"],
      es:    ["Perdón, hoy no puedo.", "No pasa nada. La próxima."],
    },
    {
      title: "Reserva",
      kana:  ["よやく を おねがい します。", "なんにち ですか。", "８がつ１０日 です。"],
      kanji: ["予約 を お願い します。",     "何日 ですか。",    "８月１０日 です。"],
      es:    ["Quiero hacer una reserva.", "¿Qué día?", "El 10 de agosto."],
    },
  ],

  /* ======================
     QUIZ — 6 sets (OrderDialogCard)
  ====================== */
  quizSets: [
    // 1
    [
      "らいしゅうの 日曜日、会いませんか。",
      "いいですね。",
      "６時に 会いましょう。",
    ],
    // 2
    [
      "月曜日は ちょっと…",
      "予約が あります。",
      "また こんど。",
    ],
    // 3
    [
      "８月１０日は どうですか。",
      "いいですね。",
      "早く きめましょう。",
    ],
    // 4
    [
      "６時は どうですか。",
      "少し 早い です。",
      "じゃあ、６時３０分 は どうですか。",
    ],
    // 5
    [
      "日曜日に 会いましょう。",
      "場所は？",
      "駅の 前 は どうですか。",
    ],
    // 6
    [
      "予約 を お願い します。",
      "何日 ですか。",
      "８月１０日 です。",
    ],
  ],

  /* ======================
     KANJI (10) — nuevos de la lección
     (strokeCode en minúsculas, hex de 4 dígitos)
  ====================== */
  kanji10: [
    {
      ch: "会", kun: ["あ-う"], on: ["カイ"], es: "reunirse",
      trazos: 6, strokeCode: "4f1a",
      ej: [{ jp: "会う", yomi: "あう", es: "quedar/reunirse" }],
    },
    {
      ch: "予", kun: [], on: ["ヨ"], es: "antes; prever",
      trazos: 4, strokeCode: "4e88",
      ej: [{ jp: "予定", yomi: "よてい", es: "plan" }],
    },
    {
      ch: "約", kun: [], on: ["ヤク"], es: "promesa; aprox.",
      trazos: 9, strokeCode: "7d04",
      ej: [{ jp: "予約", yomi: "よやく", es: "reserva" }],
    },
    {
      ch: "定", kun: ["さだ-める"], on: ["テイ"], es: "fijar; decidir",
      trazos: 8, strokeCode: "5b9a",
      ej: [{ jp: "予定", yomi: "よてい", es: "plan (fijado)" }],
    },
    {
      ch: "週", kun: [], on: ["シュウ"], es: "semana",
      trazos: 11, strokeCode: "9031",
      ej: [{ jp: "１週", yomi: "いっしゅう", es: "una semana" }],
    },
    {
      ch: "月", kun: ["つき"], on: ["ゲツ","ガツ"], es: "mes; luna",
      trazos: 4, strokeCode: "6708",
      ej: [{ jp: "月曜日", yomi: "げつようび", es: "lunes" }],
    },
    {
      ch: "日", kun: ["ひ","か"], on: ["ニチ","ジツ"], es: "día; sol",
      trazos: 4, strokeCode: "65e5",
      ej: [{ jp: "日曜日", yomi: "にちようび", es: "domingo" }],
    },
    {
      ch: "年", kun: ["とし"], on: ["ネン"], es: "año",
      trazos: 6, strokeCode: "5e74",
      ej: [{ jp: "1年", yomi: "いちねん", es: "un año" }],
    },
    {
      ch: "曜", kun: [], on: ["ヨウ"], es: "día (de la semana)",
      trazos: 18, strokeCode: "66dc",
      ej: [{ jp: "曜日", yomi: "ようび", es: "día de la semana" }],
    },
    {
      ch: "早", kun: ["はや-い"], on: ["ソウ"], es: "temprano",
      trazos: 6, strokeCode: "65e9",
      ej: [{ jp: "早い", yomi: "はやい", es: "temprano; rápido" }],
    },
  ],
};

export default TEMA_8;
