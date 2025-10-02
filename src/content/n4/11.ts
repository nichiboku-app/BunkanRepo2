import type { ThemeContent } from "./types";

/**
 * TEMA 11 (N4) · 🧑‍💼 Solicitudes formales – Usar lenguaje educado（〜ていただけますか）
 * Regla: en gramática y diálogos usamos solo kanji ya vistos + los 10 nuevos de este tema.
 * Si algo no está cubierto, va en かな／カタカナ.
 */

const TEMA_11: ThemeContent = {
  objetivos: [
    "Pedir algo con respeto: 〜ていただけますか／〜ていただけませんか。",
    "Fórmula cortés: お／ご〜ください・お／ご〜いただけますか。",
    "Pedir permiso formal: 〜てもよろしいでしょうか。",
    "Frases útiles en ventanilla/recepción: うけつけ・まどぐち・部長・内線。",
    "Usar ‘すみませんが…’ + petición suave.",
  ],

  /* ======================
     VOCABULARIO (≥15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "お願い",         romaji: "onegai",          es: "favor / por favor" },
    { key: "v2",  jp: "うけつけ",       romaji: "uketsuke",        es: "recepción" },                 // evitar 受付 (付 no listado)
    { key: "v3",  jp: "窓口",           romaji: "madoguchi",       es: "ventanilla (mostrador)" },    // 窓＋口（ok）
    { key: "v4",  jp: "お客さま",       romaji: "okyakusama",      es: "cliente (respetuoso)" },      // 客（ok）
    { key: "v5",  jp: "お問い合わせ",   romaji: "otoiawase",       es: "consulta (de contacto)" },     // 問（ok）+ あわせ
    { key: "v6",  jp: "へんじ",         romaji: "henji",           es: "respuesta (a mensaje)" },     // 返事 → 事 fuera; dejar kana
    { key: "v7",  jp: "内線",           romaji: "naisen",          es: "extensión interna" },         // 内＋線（線 ya visto）
    { key: "v8",  jp: "部長",           romaji: "buchō",           es: "jefe de departamento" },      // 部（nuevo）＋長（vista）
    { key: "v9",  jp: "連休",           romaji: "renkyū",          es: "puente / varios días" },      // 連＋休（ok）
    { key: "v10", jp: "ごうけい",       romaji: "gōkei",           es: "total (suma)" },              // 合計 → 計 fuera; todo kana
    { key: "v11", jp: "願書",           romaji: "gansho",          es: "solicitud (documento)" },     // 願＋書（ok）
    { key: "v12", jp: "受け取り",       romaji: "uketori",         es: "recepción/recogida" },        // 受（ok）+ 取り（kana）
    { key: "v13", jp: "ごあんない",     romaji: "go-annai",        es: "guía / información" },        // 案内 permitidos, pero dejamos kana
    { key: "v14", jp: "ごれんらく",     romaji: "go-renraku",      es: "aviso / contacto" },          // 連絡→絡 fuera; todo kana
    { key: "v15", jp: "しょるい",       romaji: "shorui",          es: "documentos" },                // 書類→ 類 fuera; kana
    { key: "v16", jp: "内よう",         romaji: "naiyō",           es: "contenido (interno)" },       // 内 + よう(kana)
    { key: "v17", jp: "合わせる",       romaji: "awaseru",         es: "ajustar / coordinar" },       // 合（ok）
    { key: "v18", jp: "へんきん",       romaji: "henkin",          es: "reembolso" },                 // 返金 → 金 fuera; kana
  ],

  /* ======================
     ORACIONES MODELO (6)
  ====================== */
  oraciones6: [
    {
      key: "s1",
      jp: "すみませんが、こちらに おなまえを 書いて いただけますか。",
      romaji: "sumimasen ga, kochira ni onamae o kaite itadakemasu ka",
      es: "Disculpe, ¿podría escribir su nombre aquí?",
      exp: "て形 + いただけますか（petición formal y amable）",
    },
    {
      key: "s2",
      jp: "うけつけで 部長に れんらくして いただけませんか。",
      romaji: "uketsuke de buchō ni renraku shite itadakemasen ka",
      es: "¿Podrían avisar al jefe de departamento en recepción?",
      exp: "〜ていただけませんか（todavía más suave）",
    },
    {
      key: "s3",
      jp: "ごあんない ください。",
      romaji: "go-annai kudasai",
      es: "Por favor, oriénteme / guíeme.",
      exp: "お／ご + (ます語幹/名詞) + ください（fórmula cortés）",
    },
    {
      key: "s4",
      jp: "こちらで おまち ください。",
      romaji: "kochira de omachi kudasai",
      es: "Por favor, espere aquí.",
      exp: "お + ます語幹 + ください（まつ→おまちください）",
    },
    {
      key: "s5",
      jp: "ここで しゃしんを とっても よろしいでしょうか。",
      romaji: "koko de shashin o tottemo yoroshii deshō ka",
      es: "¿Estaría bien tomar una foto aquí?",
      exp: "〜てもよろしいでしょうか（permiso muy formal）",
    },
    {
      key: "s6",
      jp: "しょるいを 窓口へ 返して いただけると たすかります。",
      romaji: "shorui o madoguchi e kaeshite itadakeru to tasukarimasu",
      es: "Si puede devolver los documentos a la ventanilla, me ayuda mucho.",
      exp: "〜ていただけると たすかります（‘me ayudaría’ educado）",
    },
  ],

  /* ======================
     GRAMÁTICA (explicada “como en primaria”)
  ====================== */
  gramatica: {
    titulo: "Gramática — pedir con respeto (paso a paso)",
    puntos: [
      {
        regla: "① 〜ていただけますか／〜ていただけませんか",
        pasoapaso: [
          "1) Haz la て形 del verbo.",
          "2) + いただけますか → “¿Podría (hacer)…?” (amable).",
          "3) + いただけませんか → aún más suave.",
        ],
        ejemploJP: "ここに なまえを 書いて いただけますか。",
        ejemploRoma: "koko ni namae o kaite itadakemasu ka",
        ejemploES: "¿Podría escribir su nombre aquí?",
        ejemplos: [
          { jp: "れんらくして いただけませんか。", roma: "renraku shite itadakemasen ka", es: "¿Podría avisar, por favor?" },
          { jp: "ここで すこし まって いただけますか。", roma: "koko de sukoshi matte itadakemasu ka", es: "¿Podría esperar un momento aquí?" },
        ],
      },
      {
        regla: "② お／ご〜ください（fórmula cortés）",
        pasoapaso: [
          "お + ます語幹 + ください（palabras nativas）→ おまちください。",
          "ご + サ変名詞 + ください（tipo Xする）→ ごあんないください・ごれんらくください。",
        ],
        ejemploJP: "こちらで おまちください。",
        ejemploRoma: "kochira de omachi kudasai",
        ejemploES: "Por favor, espere aquí.",
        ejemplos: [
          { jp: "ごあんない ください。", roma: "go-annai kudasai", es: "Por favor, oriénteme." },
          { jp: "ごれんらく ください。", roma: "go-renraku kudasai", es: "Por favor, contácteme." },
        ],
      },
      {
        regla: "③ 〜てもよろしいでしょうか（permiso formal）",
        pasoapaso: [
          "1) て形 + も + よろしいですか → ‘¿está bien si…?’",
          "2) でしょうか lo hace más suave.",
        ],
        ejemploJP: "ここで しゃしんを とっても よろしいでしょうか。",
        ejemploRoma: "koko de shashin o tottemo yoroshii deshō ka",
        ejemploES: "¿Sería correcto tomar una foto aquí?",
        ejemplos: [
          { jp: "内線を つかっても よろしいですか。", roma: "naisen o tsukattemo yoroshii desu ka", es: "¿Puedo usar la extensión interna?" },
          { jp: "部長に れんらくしても よろしいでしょうか。", roma: "buchō ni renraku shitemo yoroshii deshō ka", es: "¿Podría avisar al jefe?" },
        ],
      },

      /* === Te-form explicado “como primaria” con 3 tablas === */
      {
        regla: "④ て形 — Grupo 1（ichidan）",
        pasoapaso: [
          "Verbos en -ます → quita ます → + て。",
          "例）たべます→たべて／みます→みて。",
        ],
        tabla: {
          title: "Grupo 1（ichidan）— Quita ます, añade て",
          headers: ["Diccionario", "ます形", "て形", "Rōmaji"],
          rows: [
            ["たべる", "たべます", "たべて", "taberu → tabete"],
            ["みる",   "みます",   "みて",   "miru → mite"],
            ["きめる", "きめます", "きめて", "kimeru → kimete"],
          ],
          note: "Regla simple: −ます ＋ て.",
        },
        ejemploJP: "すこし まって ください。",
        ejemploRoma: "sukoshi matte kudasai",
        ejemploES: "Por favor, espere un momento.",
      },
      {
        regla: "⑤ て形 — Grupo 2（godan）",
        pasoapaso: [
          "う・つ・る → って（あう→あって）",
          "む・ぶ・ぬ → んで（よむ→よんで）",
          "く → いて（かく→かいて）／ぐ → いで（いそぐ→いそいで）",
          "す → して（はなす→はなして）",
        ],
        tabla: {
          title: "Grupo 2（godan）— Cambios rápidos",
          headers: ["Termina en…", "Regla て形", "Ejemplo", "Rōmaji"],
          rows: [
            ["う・つ・る", "→ って", "あう→あって", "au → atte"],
            ["む・ぶ・ぬ", "→ んで", "よむ→よんで", "yomu → yonde"],
            ["く",         "→ いて", "かく→かいて", "kaku → kaite"],
            ["ぐ",         "→ いで", "いそぐ→いそいで", "isogu → isoide"],
            ["す",         "→ して", "はなす→はなして", "hanasu → hanashite"],
          ],
          note: "Memoriza por columna: って／んで／いて／いで／して。",
        },
        ejemploJP: "書いて いただけますか。",
        ejemploRoma: "kaite itadakemasu ka",
        ejemploES: "¿Podría escribirlo?",
      },
      {
        regla: "⑥ て形 — Irregulares（する／くる）",
        pasoapaso: [
          "する → して",
          "くる → きて",
        ],
        tabla: {
          title: "Irregulares — て形",
          headers: ["Diccionario", "ます形", "て形", "Rōmaji"],
          rows: [
            ["する", "します", "して", "suru → shite"],
            ["くる", "きます", "きて", "kuru → kite"],
          ],
          note: "¡Solo dos! Recítalos.",
        },
        ejemploJP: "ごあんない して いただけませんか。",
        ejemploRoma: "go-annai shite itadakemasen ka",
        ejemploES: "¿Podría orientarme, por favor?",
      },

      /* === お／ご — “como en primaria” (cuándo usar) === */
      {
        regla: "⑦ ¿お o ご?（hablar bonito）",
        pasoapaso: [
          "お〜：palabras nativas（おちゃ／おみず／おかね／おしごと）",
          "ご〜：tipo Xする（ごあんない／ごれんらく／ごようい）",
          "Se usa para respetar al oyente / sus cosas.",
        ],
        ejemploJP: "おなまえ を おねがい します。",
        ejemploRoma: "onamae o onegai shimasu",
        ejemploES: "Su nombre, por favor.",
        tabla: {
          title: "¿お o ご? — guía rápida",
          headers: ["Tipo", "Expresión", "Rōmaji", "ES"],
          rows: [
            ["お（nativas）", "おちゃ／おみず／おかね", "ocha / omizu / okane", "té／agua／dinero"],
            ["ご（Xする）", "ごあんない／ごれんらく", "go-annai / go-renraku", "guía / contacto"],
            ["fijas", "おじかん／おしごと", "ojikan / oshigoto", "tiempo / trabajo"],
          ],
          note: "Para ‘lo mío’ casi no se usa お／ご.",
        },
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7) — kana/kanji paralelos
     (solo kanji permitidos)
  ====================== */
  dialogos: [
    {
      title: "En recepción",
      kana:  ["すみませんが、ここに おなまえを かいて いただけますか。", "はい、こちらです。"],
      kanji: ["すみませんが、ここに おなまえを 書いて いただけますか。",   "はい、こちらです。"],
      es:    ["Disculpe, ¿podría escribir su nombre aquí?", "Sí, por aquí."],
    },
    {
      title: "Llamar al jefe",
      kana:  ["うけつけで ぶちょうに れんらくして いただけませんか。", "かしこまりました。"],
      kanji: ["うけつけで 部長に れんらくして いただけませんか。",             "かしこまりました。"],
      es:    ["¿Podrían avisar al jefe de departamento en recepción?", "Enseguida."],
    },
    {
      title: "Ventanilla",
      kana:  ["しょるいを まどぐちへ かえして ください。", "はい、すぐ かえします。"],
      kanji: ["しょるいを 窓口へ 返して ください。",             "はい, すぐ 返します。"],
      es:    ["Devuelva los documentos a la ventanilla, por favor.", "Sí, los regreso enseguida."],
    },
    {
      title: "Guía al cliente",
      kana:  ["おきゃくさまを ごあんない します。", "ありがとうございます。"],
      kanji: ["お客さまを ご案内 します。",          "ありがとうございます。"],
      es:    ["Acompaño al cliente y le doy la guía.", "Muchas gracias."],
    },
    {
      title: "Permiso formal",
      kana:  ["ここで しゃしんを とっても よろしいでしょうか。", "はい、どうぞ。"],
      kanji: ["ここで しゃしんを とっても よろしいでしょうか。",     "はい、どうぞ。"],
      es:    ["¿Sería correcto tomar una foto aquí?", "Sí, adelante."],
    },
    {
      title: "Contacto",
      kana:  ["なにか あれば ごれんらく ください。", "はい、れんらく します。"],
      kanji: ["なにか あれば ごれんらく ください。",   "はい、れんらく します。"],
      es:    ["Si pasa algo, por favor contácteme.", "Sí, me pondré en contacto."],
    },
    {
      title: "Solicitud escrita",
      kana:  ["ねんのため、がんしょを だして いただけますか。", "はい、つぎの ないせんに おねがいします。"],
      kanji: ["ねんのため、願書を だして いただけますか。",         "はい、つぎの 内線に おねがいします。"],
      es:    ["Por si acaso, ¿podría entregar la solicitud?", "Sí, por favor a la siguiente extensión."],
    },
  ],

  /* ======================
     QUIZ — 6 sets (OrderDialogCard)
  ====================== */
  quizSets: [
    [
      "すみませんが、ここに おなまえを 書いて いただけますか。",
      "はい、こちらです。",
    ],
    [
      "うけつけで 部長に れんらくして いただけませんか。",
      "かしこまりました。",
    ],
    [
      "しょるいを 窓口へ 返して ください。",
      "はい、すぐ 返します。",
    ],
    [
      "お客さまを ご案内 します。",
      "ありがとうございます。",
    ],
    [
      "ここで しゃしんを とっても よろしいでしょうか。",
      "はい、どうぞ。",
    ],
    [
      "願書を だして いただけますか。",
      "はい、内線に おねがいします。",
    ],
  ],

  /* ======================
     KANJI (10) — nuevos de la lección
     strokeCode = hex4 minúscula (coincide con filename *_web.webp)
  ====================== */
  kanji10: [
    { ch: "願", kun: ["ねが-う"], on: ["ガン"], es: "pedir; desear", trazos: 19, strokeCode: "9858",
      ej: [{ jp: "願書", yomi: "がんしょ", es: "solicitud (documento)" }] },
    { ch: "受", kun: ["う-ける"], on: ["ジュ"], es: "recibir", trazos: 8, strokeCode: "53d7",
      ej: [{ jp: "受け取り", yomi: "うけとり", es: "recogida" }] },
    { ch: "客", kun: [], on: ["キャク"], es: "cliente; invitado", trazos: 9, strokeCode: "5ba2",
      ej: [{ jp: "お客さま", yomi: "おきゃくさま", es: "cliente (respetuoso)" }] },
    { ch: "問", kun: ["と-う"], on: ["モン"], es: "preguntar", trazos: 11, strokeCode: "554f",
      ej: [{ jp: "お問い合わせ", yomi: "おといあわせ", es: "consulta" }] },
    { ch: "合", kun: ["あ-う"], on: ["ゴウ","ガッ"], es: "juntar; ajustar", trazos: 6, strokeCode: "5408",
      ej: [{ jp: "合わせる", yomi: "あわせる", es: "ajustar" }] },
    { ch: "連", kun: ["つら-なる","つ-れる"], on: ["レン"], es: "conectar; llevar", trazos: 10, strokeCode: "9023",
      ej: [{ jp: "連休", yomi: "れんきゅう", es: "puente (varios días)" }] },
    { ch: "返", kun: ["かえ-す","かえ-る"], on: ["ヘン"], es: "devolver", trazos: 7, strokeCode: "8fd4",
      ej: [{ jp: "返す", yomi: "かえす", es: "devolver" }] },
    { ch: "内", kun: ["うち"], on: ["ナイ"], es: "interior; dentro", trazos: 4, strokeCode: "5185",
      ej: [{ jp: "内線", yomi: "ないせん", es: "extensión interna" }] },
    { ch: "部", kun: [], on: ["ブ"], es: "sección; departamento", trazos: 11, strokeCode: "90e8",
      ej: [{ jp: "部長", yomi: "ぶちょう", es: "jefe de departamento" }] },
    { ch: "窓", kun: ["まど"], on: ["ソウ"], es: "ventana; ventanilla", trazos: 11, strokeCode: "7a93",
      ej: [{ jp: "窓口", yomi: "まどぐち", es: "ventanilla" }] },
  ],
};

export default TEMA_11;
