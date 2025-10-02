import type { ThemeContent } from "./types";

/**
 * TEMA 9 (N4) · 💻 En la oficina – Expresar tareas, responsabilidades y permisos
 * Regla: en gramática y diálogos solo usamos kanji ya vistos + los 10 nuevos de este tema.
 * Lo demás va en かな／カタカナ.
 */

const TEMA_9: ThemeContent = {
  objetivos: [
    "Decir tareas y responsables: 部／課／係（nuevo）＋ 仕事（ya visto）",
    "Pedir y dar permiso: ～てもいいです／～てもいいですか",
    "Prohibir: ～てはいけません",
    "Obligación simple: ～なければなりません（explicado fácil）",
    "Escribir propuestas/documentos: 案／書（nuevo）",
  ],

  /* ======================
     VOCABULARIO (≥15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "会社",      romaji: "kaisha",       es: "empresa" },         // 社 ya visto
    { key: "v2",  jp: "仕事",      romaji: "shigoto",      es: "trabajo/tarea" },   // 仕・事 ya visto
    { key: "v3",  jp: "部",        romaji: "bu",           es: "departamento (nuevo)" },
    { key: "v4",  jp: "課",        romaji: "ka",           es: "sección (nuevo)" },
    { key: "v5",  jp: "係",        romaji: "kakari",       es: "encargado (nuevo)" },
    { key: "v6",  jp: "部長",      romaji: "buchō",        es: "jefe de depto. (nuevo 長)" },
    { key: "v7",  jp: "課長",      romaji: "kachō",        es: "jefe de sección (nuevo 課・長)" },
    { key: "v8",  jp: "案",        romaji: "an",           es: "propuesta/borrador (nuevo)" },
    { key: "v9",  jp: "書",        romaji: "sho",          es: "documento; escribir (nuevo)" },
    { key: "v10", jp: "用事",      romaji: "yōji",         es: "diligencia/asunto (nuevo 用 + 事)" },
    { key: "v11", jp: "休み",      romaji: "yasumi",       es: "descanso/día libre (nuevo 休)" },
    { key: "v12", jp: "働く",      romaji: "hataraku",     es: "trabajar (nuevo)" },
    { key: "v13", jp: "メール",    romaji: "mēru",         es: "correo electrónico" },
    { key: "v14", jp: "コピー",    romaji: "kopī",         es: "copia; fotocopiar" },
    { key: "v15", jp: "ミーティング", romaji: "mītingu",   es: "reunión" },
    { key: "v16", jp: "スケジュール", romaji: "sukejūru",  es: "agenda/horario" },
    { key: "v17", jp: "パソコン",  romaji: "pasokon",      es: "computadora" },
    { key: "v18", jp: "許す",      romaji: "yurusu",       es: "permitir (nuevo 許)" },
  ],

  /* ======================
     ORACIONES MODELO (6)
  ====================== */
  oraciones6: [
    {
      key: "s1",
      jp: "ミーティングの 案を 書きます。",
      romaji: "mītingu no an o kakimasu",
      es: "Escribo la propuesta de la reunión.",
      exp: "Sujeto + の + 案（propuesta）+ を + 書きます。",
    },
    {
      key: "s2",
      jp: "この 仕事は 課の 係です。",
      romaji: "kono shigoto wa ka no kakari desu",
      es: "Este trabajo es responsabilidad de la sección (del encargado).",
      exp: "Aは Bの 係（encargado）です。",
    },
    {
      key: "s3",
      jp: "ここで コピーしても いいですか。",
      romaji: "koko de kopī shite mo ii desu ka",
      es: "¿Puedo sacar copias aquí?",
      exp: "Verbo て + も いいですか（¿puedo…?）",
    },
    {
      key: "s4",
      jp: "ここで たべては いけません。",
      romaji: "koko de tabete wa ikemasen",
      es: "No se puede comer aquí.",
      exp: "Verbo て + は いけません（prohibido）",
    },
    {
      key: "s5",
      jp: "９時までに レポートを 書かなければ なりません。",
      romaji: "ku-ji made ni repōto o kakana kereba narimasen",
      es: "Debo escribir el reporte antes de las 9.",
      exp: "～なければ なりません（obligación）",
    },
    {
      key: "s6",
      jp: "きょうは 休んでも いいですか。",
      romaji: "kyō wa yasunde mo ii desu ka",
      es: "¿Puedo descansar hoy?",
      exp: "休む → 休んで（forma て）+ も いいですか。",
    },
  ],

  /* ======================
     GRAMÁTICA (explicado “como en primaria”)
  ====================== */
  gramatica: {
    titulo: "Gramática — responsabilidades y permisos（fácil）",
    puntos: [
      {
        regla: "① 部／課／係 — quién se encarga",
        pasoapaso: [
          "部（ぶ）= departamento. 課（か）= sección.",
          "係（かかり）= encargado. 人の なまえ + 係。",
          "Aは Bの 係です： “A es el encargado de B”.",
        ],
        ejemploJP: "この 仕事は 課の 係です。",
        ejemploRoma: "kono shigoto wa ka no kakari desu",
        ejemploES: "Este trabajo es responsabilidad de la sección.",
        ejemplos: [
          { jp: "部長に 案を 出します。", roma: "buchō ni an o dashimasu", es: "Entrego la propuesta al jefe de departamento." },
          { jp: "係に きいて ください。", roma: "kakari ni kiite kudasai", es: "Pregunte al encargado, por favor." },
        ],
      },
      {
        regla: "② Permiso: ～ても いいです／～ても いいですか",
        pasoapaso: [
          "Verbo → forma て + も いいです（puedo）",
          "～ても いいですか（¿puedo…?）",
          "Sí: いいですよ。 No suave: すみません、いまは だめです。",
        ],
        ejemploJP: "ここで コピーしても いいですか。",
        ejemploRoma: "koko de kopī shite mo ii desu ka",
        ejemploES: "¿Puedo sacar copias aquí?",
        tabla: {
          title: "Cómo hago la forma て（mini guía）",
          headers: ["Diccionario", "ます形", "Forma て", "Ejemplo español"],
          rows: [
            ["書く（かく）", "書きます", "書いて", "escribir → escribe y…"],
            ["休む（やすむ）", "休みます", "休んで", "descansar → descansa y…"],
            ["する", "します", "して", "hacer → haz y…"],
            ["くる", "きます", "きて", "venir → ven y…"],
          ],
          note: "Reglas rápidas: ～き→いて / ～み→んで / する→して / くる→きて。",
        },
        ejemplos: [
          { jp: "きょう 休んでも いいですか。", roma: "kyō yasunde mo ii desu ka", es: "¿Puedo descansar hoy?" },
          { jp: "この パソコンを つかっても いいです。", roma: "kono pasokon o tsukatte mo ii desu", es: "Puedes usar esta compu." },
        ],
      },
      {
        regla: "③ Prohibido: ～ては いけません",
        pasoapaso: [
          "Verbo → forma て + は いけません = “no se permite”.",
          "Frase corta, clara y educada.",
        ],
        ejemploJP: "ここで たべては いけません。",
        ejemploRoma: "koko de tabete wa ikemasen",
        ejemploES: "No se puede comer aquí.",
        ejemplos: [
          { jp: "しごと中（ちゅう）は さわいでは いけません。", roma: "shigoto chū wa sawaide wa ikemasen", es: "Durante el trabajo no hagas ruido." },
          { jp: "この 部屋で ゲームを しては いけません。", roma: "kono heya de gēmu o shite wa ikemasen", es: "No puedes jugar en esta sala." },
        ],
      },
      {
  regla: "⑤ Obligación（〜なければなりません） / No hace falta（〜なくてもいい）— cómo formar la negativa (ない形)",
  pasoapaso: [
    "PASO 1: Toma el verbo en diccionario（〜る／〜う）.",
    "PASO 2: Forma la NEGATIVA（ない形）.",
    "  • Grupo 1（う-verbos, 五段）: cambia la última sílaba a la fila あ + ない。",
    "    例）働く→働かない／書く→書かない／行く→行かない／休む→休まない。",
    "    ⚠️ Si termina en う: う→わない（つかう→つかわない）。",
    "  • Grupo 2（る-verbos, 一段）: quita る + ない。",
    "    例）たべる→たべない／みる→みない。",
    "  • Grupo 3（irregulares）: する→しない／くる→こない。※ ある→ない（especial).",
    "PASO 3a: OBLIGACIÓN → reemplaza ない → なければなりません。",
    "  例）書かない → 書かなければなりません（debo escribir）。",
    "PASO 3b: NO HACE FALTA → reemplaza ない → なくてもいい（です）。",
    "  例）書かない → 書かなくてもいいです（no hace falta escribir）。",
    "※ Conversacional: 〜ないといけません／〜ないとだめ ＝ “debo…”.",
  ],
  ejemploJP: "書かない → 書かなければなりません／書かなくてもいいです。",
  ejemploRoma: "kakanai → kakanakereba narimasen / kakanakute mo ii desu",
  ejemploES: "no escribir → debo escribir / no hace falta escribir",
  ejemplos: [
    { jp: "働かなければなりません。", roma: "hatarakanakereba narimasen", es: "Debo trabajar." },
    { jp: "休まなくてもいいです。",   roma: "yasumanakute mo ii desu",   es: "No hace falta descansar." },
    { jp: "行かなければなりません。", roma: "ikanakereba narimasen",     es: "Debo ir." },
    { jp: "しなくてもいいです。",       roma: "shinakute mo ii desu",     es: "No hace falta hacerlo." },
    { jp: "許さなくてもいいです。",     roma: "yurusanakute mo ii desu", es: "No hace falta permitirlo." },
  ],
  tabla: {
    title: "De ない形 a “debo…” / “no hace falta…”",
    headers: ["Verbo (dic.)", "Grupo", "ない形", "Obligación", "No hace falta"],
    rows: [
      ["働く（はたらく）", "G1", "働かない", "働かなければなりません", "働かなくてもいいです"],
      ["書く（かく）",       "G1", "書かない", "書かなければなりません", "書かなくてもいいです"],
      ["行く（いく）",       "G1", "行かない", "行かなければなりません", "行かなくてもいいです"],
      ["休む（やすむ）",     "G1", "休まない", "休まなければなりません", "休まなくてもいいです"],
      ["たべる",             "G2", "たべない", "たべなければなりません", "たべなくてもいいです"],
      ["する",               "G3", "しない",   "しなければなりません",   "しなくてもいいです"],
      ["こる（くる）",       "G3", "こない",   "こなければなりません",   "こなくてもいいです"],
      ["許す（ゆるす）",     "G1", "許さない", "許さなければなりません", "許さなくてもいいです"],
    ],
    note: "Regla G1: [う段→あ段] + ない（う→わない）。G2: quita る + ない。G3: する→しない／くる→こない。",
  },
},

      {
        regla: "⑤ Escribir propuesta/documento: 案／書",
        pasoapaso: [
          "案（あん）= idea / borrador.",
          "書（しょ）= documento; 書きます = escribir.",
          "Aに 案を 出します（entregar idea a A）。",
        ],
        ejemploJP: "課長に 案を 出します。",
        ejemploRoma: "kachō ni an o dashimasu",
        ejemploES: "Entrego la propuesta al jefe de sección.",
        ejemplos: [
          { jp: "書を 書きます。", roma: "sho o kakimasu", es: "Escribo el documento." },
          { jp: "案を 直して ください。", roma: "an o naoshite kudasai", es: "Corrige la propuesta, por favor." },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7) — kana/kanji paralelos
  ====================== */
  dialogos: [
    {
      title: "Quién se encarga",
      kana:  ["この しごとは だれの かかり ですか。", "か の かかり です。", "わかりました。"],
      kanji: ["この 仕事は だれの 係 ですか。",      "課 の 係 です。",        "わかりました。"],
      es:    ["¿Quién está a cargo de este trabajo?", "Es la sección (el encargado).", "Entendido."],
    },
    {
      title: "Pedir permiso (copias)",
      kana:  ["ここで コピーしても いいですか。", "はい、いいですよ。", "ありがとうございます。"],
      kanji: ["ここで コピーしても いいですか。", "はい、いいですよ。", "ありがとうございます。"],
      es:    ["¿Puedo sacar copias aquí?", "Sí, claro.", "Gracias."],
    },
    {
      title: "Prohibición en sala",
      kana:  ["この へやで たべては いけません。", "すみません。 きを つけます。"],
      kanji: ["この 部屋で たべては いけません。", "すみません。 気を つけます。"],
      es:    ["No se puede comer en esta sala.", "Perdón. Tendré cuidado."],
    },
    {
      title: "Obligación de reporte",
      kana:  ["９じ までに レポートを かかなければ なりません。", "てつだいましょうか。"],
      kanji: ["９時 までに レポートを 書かなければ なりません。", "手伝いましょうか。"],
      es:    ["Debo escribir el reporte antes de las 9.", "¿Te ayudo?"],
    },
    {
      title: "Entregar a jefes",
      kana:  ["ぶちょう に あんを だします。", "そのあと、かちょう に も だします。"],
      kanji: ["部長 に 案を 出します。",        "そのあと、課長 に も 出します。"],
      es:    ["Entrego la propuesta al jefe de depto.", "Después, también al jefe de sección."],
    },
    {
      title: "Pedir día libre",
      kana:  ["きょうは 休んでも いいですか。", "はい、きょう は いいです。 あした は しごと です。"],
      kanji: ["きょうは 休んでも いいですか。", "はい、きょう は いいです。 明日 は 仕事 です。"],
      es:    ["¿Puedo descansar hoy?", "Sí, hoy está bien. Mañana hay trabajo."],
    },
    {
      title: "Correo y agenda",
      kana:  ["メールを かいて ください。", "スケジュールに かきます。", "ありがとうございます。"],
      kanji: ["メールを 書いて ください。",   "スケジュールに 書きます。",  "ありがとうございます。"],
      es:    ["Escribe un correo, por favor.", "Lo apunto en la agenda.", "Gracias."],
    },
  ],

  /* ======================
     QUIZ — 6 sets (OrderDialogCard)
  ====================== */
  quizSets: [
    [
      "この 仕事は だれの 係 ですか。",
      "課 の 係 です。",
      "わかりました。",
    ],
    [
      "ここで コピーしても いいですか。",
      "はい、いいですよ。",
      "ありがとうございます。",
    ],
    [
      "この 部屋で たべては いけません。",
      "すみません。",
      "気を つけます。",
    ],
    [
      "９時 までに レポートを 書かなければ なりません。",
      "手伝いましょうか。",
      "お願いします。",
    ],
    [
      "部長 に 案を 出します。",
      "そのあと、課長 に も 出します。",
      "よろしく お願いします。",
    ],
    [
      "きょうは 休んでも いいですか。",
      "はい、きょう は いいです。",
      "あした は 仕事 です。",
    ],
  ],

  /* ======================
     KANJI (10) — nuevos de la lección
     (strokeCode en minúsculas, hex de 4 dígitos)
  ====================== */
  kanji10: [
    {
      ch: "働", kun: ["はたら-く"], on: ["ドウ"], es: "trabajar",
      trazos: 13, strokeCode: "50cd",
      ej: [{ jp: "働きます", yomi: "はたらきます", es: "trabajar (formal)" }],
    },
    {
      ch: "係", kun: ["かか-り"], on: [], es: "encargado",
      trazos: 9, strokeCode: "4fc2",
      ej: [{ jp: "係", yomi: "かかり", es: "persona encargada" }],
    },
    {
      ch: "部", kun: [], on: ["ブ"], es: "departamento",
      trazos: 11, strokeCode: "90e8",
      ej: [{ jp: "部長", yomi: "ぶちょう", es: "jefe de departamento" }],
    },
    {
      ch: "課", kun: [], on: ["カ"], es: "sección",
      trazos: 15, strokeCode: "8ab2",
      ej: [{ jp: "課長", yomi: "かちょう", es: "jefe de sección" }],
    },
    {
      ch: "長", kun: ["なが-い"], on: ["チョウ"], es: "largo; jefe",
      trazos: 8, strokeCode: "9577",
      ej: [{ jp: "部長", yomi: "ぶちょう", es: "jefe (depto.)" }],
    },
    {
      ch: "許", kun: ["ゆる-す"], on: ["キョ"], es: "permitir",
      trazos: 11, strokeCode: "8a31",
      ej: [{ jp: "許します", yomi: "ゆるします", es: "permitir" }],
    },
    {
      ch: "案", kun: [], on: ["アン"], es: "propuesta",
      trazos: 10, strokeCode: "6848",
      ej: [{ jp: "案", yomi: "あん", es: "idea, borrador" }],
    },
    {
      ch: "書", kun: ["か-く"], on: ["ショ"], es: "escribir; documento",
      trazos: 10, strokeCode: "66f8",
      ej: [{ jp: "書きます", yomi: "かきます", es: "escribir (formal)" }],
    },
    {
      ch: "用", kun: ["もち-いる"], on: ["ヨウ"], es: "uso; asunto",
      trazos: 5, strokeCode: "7528",
      ej: [{ jp: "用事", yomi: "ようじ", es: "asunto/diligencia" }],
    },
    {
      ch: "休", kun: ["やす-む"], on: ["キュウ"], es: "descansar",
      trazos: 6, strokeCode: "4f11",
      ej: [{ jp: "休みます", yomi: "やすみます", es: "descansar (formal)" }],
    },
  ],
};

export default TEMA_9;
