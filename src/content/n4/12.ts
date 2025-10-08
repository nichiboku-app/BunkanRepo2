// src/content/n4/12.ts
import type { ThemeContent } from "./types"; // ajusta si tu tipo vive en otra ruta

/**
 * N4-12: 🧭 Dar instrucciones – Imperativo y causativa
 * Convenciones igual que temas 3–5.
 */
export const TEMA_12: ThemeContent = {
  id: 12,
  titulo: "🧭 Dar instrucciones – Imperativo y causativa",
  objetivos: [
    "Pedir/dar instrucciones con 〜てください y 〜ないでください.",
    "Usar 〜なさい y diccionario + な para órdenes/prohibiciones.",
    "Comprender y producir causativa (〜せる／〜させる).",
    "Ampliar vocabulario típico de instrucciones en clase/trabajo.",
    "Escuchar y ordenar minidiálogos con órdenes y confirmaciones.",
  ],

  /* ============ VOCABULARIO (≥15) ============ */
  vocabClase: [
    { key: "v1",  jp: "開ける",      romaji: "akeru",       es: "abrir" },
    { key: "v2",  jp: "閉める",      romaji: "shimeru",     es: "cerrar" },
    { key: "v3",  jp: "並べる",      romaji: "naraberu",    es: "ordenar/acomodar" },
    { key: "v4",  jp: "捨てる",      romaji: "suteru",      es: "tirar/botar" },
    { key: "v5",  jp: "持ってくる",  romaji: "motte kuru",  es: "traer (algo)" },
    { key: "v6",  jp: "連れていく",  romaji: "tsurete iku", es: "llevar (a alguien)" },
    { key: "v7",  jp: "置く",        romaji: "oku",         es: "poner/colocar" },
    { key: "v8",  jp: "使う",        romaji: "tsukau",      es: "usar" },
    { key: "v9",  jp: "伝える",      romaji: "tsutaeru",    es: "transmitir/avisar" },
    { key: "v10", jp: "守る",        romaji: "mamoru",      es: "proteger/obedecer (reglas)" },
    { key: "v11", jp: "指示する",    romaji: "shiji suru",  es: "dar instrucciones" },
    { key: "v12", jp: "注意する",    romaji: "chūi suru",   es: "advertir/atender" },
    { key: "v13", jp: "準備する",    romaji: "junbi suru",  es: "preparar" },
    { key: "v14", jp: "始める",      romaji: "hajimeru",    es: "empezar" },
    { key: "v15", jp: "止める",      romaji: "tomeru",      es: "detener/parar" },
    { key: "v16", jp: "締め切る",    romaji: "shimekiru",   es: "cerrar por completo / deadline" },
    { key: "v17", jp: "必ず",        romaji: "kanarazu",    es: "sin falta / obligatoriamente" },
  ],

  /* ============ ORACIONES (6) ============ */
  oraciones6: [
    {
      key: "o1",
      jp: "ドアを開けてください。",
      romaji: "Doa o akete kudasai.",
      es: "Por favor, abre la puerta.",
      exp: "Petición cortés con 〜てください.",
    },
    {
      key: "o2",
      jp: "ここに置いてください。",
      romaji: "Koko ni oite kudasai.",
      es: "Por favor, colócalo aquí.",
      exp: "Colocar con 置く(おく) en forma 〜て.",
    },
    {
      key: "o3",
      jp: "そこに並べないでください。",
      romaji: "Soko ni narabenaide kudasai.",
      es: "Por favor, no lo acomodes allí.",
      exp: "Negación cortés con 〜ないでください.",
    },
    {
      key: "o4",
      jp: "注意して聞きなさい。",
      romaji: "Chūi shite kikinasai.",
      es: "Pon atención y escucha.",
      exp: "〜なさい: instrucción suave (docente/padre).",
    },
    {
      key: "o5",
      jp: "この書類を田中さんに伝えてください。",
      romaji: "Kono shorui o Tanaka-san ni tsutaete kudasai.",
      es: "Por favor, comunica estos documentos a Tanaka.",
      exp: "伝える + に: ‘comunicar a …’.",
    },
    {
      key: "o6",
      jp: "子どもに片づけさせます。",
      romaji: "Kodomo ni katazuke-sasemasu.",
      es: "Haré que el niño ordene.",
      exp: "Causativa: に + 〜させる ‘hacer/dejar que alguien haga’.",
    },
  ],

  /* ============ GRAMÁTICA (alineada a tus tipos) ============ */
  gramatica: {
  titulo: "Dar instrucciones: 〜ないでください / 〜なさい / 使役（〜せる・〜させる）",
  puntos: [
    {
      regla: "① 〜てください： “por favor, …”",
      pasoapaso: [
        "1) Verbo → forma て。",
        "2) + ください。",
        "3) Cortés. Se usa mucho en clase/tienda/oficina。",
      ],
      ejemploJP: "まどをあけてください。",
      ejemploRoma: "mado o akete kudasai。",
      ejemploES: "Por favor, abre la ventana。",
      ejemplos: [
        { jp: "ここにおいてください。", roma: "koko ni oite kudasai。", es: "Ponlo aquí, por favor。" },
      ],
    },

    {
      regla: "② 〜ないでください： “por favor, no …”",
      pasoapaso: [
        "Regla general: NEGATIVA（〜ない） + でください。",
        "Primero haz la forma ない. Luego añade 「でください」。",
      ],
      ejemploJP: "ここでたべないでください。",
      ejemploRoma: "koko de tabenaide kudasai。",
      ejemploES: "Por favor, no comas aquí。",
      tabla: {
        title: "Cómo hago 〜ない（3 grupos）",
        headers: ["Grupo", "Diccionario → ない", "Ejemplo ないでください"],
        rows: [
          // G1（五段）: u→a + ない（う→わない）
          ["G1（う）", "かく→かかない / いく→いかない / つかう→つかわない", "ここで かかないでください。"],
          // G2（一段）
          ["G2（る）", "たべる→たべない / みる→みない / あける→あけない", "そこに たべないでください。"],
          // G3（不規則）
          ["G3（する・くる）", "する→しない / くる→こない", "いま しないでください。"],
        ],
        note: "G1 regla: última う→fila あ + ない（う→わない）／G2: quita る + ない／G3: する→しない、くる→こない。",
      },
      ejemplos: [
        { jp: "そこに ならべないでください。", roma: "soko ni narabenaide kudasai。", es: "Por favor, no lo acomodes allí。" },
        { jp: "でんわで さわがないでください。", roma: "denwa de sawaganaide kudasai。", es: "Por favor, no hagas ruido por teléfono。" },
      ],
    },

    {
      regla: "③ 〜なさい： instrucción suave (autoridad → alumno/hijo)",
      pasoapaso: [
        "Verbo → forma ます sin ます（れんようけい）。",
        "Añade 「なさい」。",
        "Más fuerte que ください, pero educado。",
      ],
      ejemploJP: "ちゅういして ききなさい。",
      ejemploRoma: "chūi shite kikinasai。",
      ejemploES: "Escucha con atención。",
      ejemplos: [
        { jp: "はやく おきなさい。", roma: "hayaku okinasai。", es: "Levántate pronto。" },
      ],
    },

    {
      regla: "④ Prohibición directa： 辞書形 + な",
      pasoapaso: [
        "Verbo en diccionario + 「な」。",
        "Habla ruda (no formal).",
      ],
      ejemploJP: "さわるな！",
      ejemploRoma: "sawaru na!",
      ejemploES: "¡No toques!",
    },

    {
      regla: "⑤ 使役（しえき） 〜せる／〜させる： “hacer/dejar que alguien haga”",
      pasoapaso: [
        "G1（う-verbo）：u→a + せる（例：かく→かかせる、いく→いかせる、つかう→つかわせる）。",
        "G2（る-verbo）：る を 取って + させる（例：たべる→たべさせる、あける→あけさせる）。",
        "G3：する→させる、くる→こさせる。",
        "Estructura：人 に + 動詞（使役）＋ます／ました…",
      ],
      ejemploJP: "こどもに へやを かたづけさせます。",
      ejemploRoma: "kodomo ni heya o katazuke-sasemasu。",
      ejemploES: "Hago que el niño ordene el cuarto。",
      tabla: {
        title: "Formar 使役（3 grupos）",
        headers: ["Grupo", "Diccionario → 使役", "Ejemplo"],
        rows: [
          ["G1（う）", "かく→かかせる / のむ→のませる / いく→いかせる", "せんせいは がくせいに かかせます。"],
          ["G2（る）", "たべる→たべさせる / あける→あけさせる", "りょうしんは こどもに たべさせます。"],
          ["G3", "する→させる / くる→こさせる", "ぶちょうは かいぎに こさせます。"],
        ],
        note: "意味： ‘A（に）〜させる’ = ‘hacer/dejar que A haga…’。",
      },
      ejemplos: [
        { jp: "かれに せつめいさせてください。", roma: "kare ni setsumei sasete kudasai。", es: "Permita que él explique。" },
        { jp: "いもうとに そうじを させました。", roma: "imōto ni sōji o sasemashita。", es: "Hice que mi hermana limpiara。" },
      ],
    },

    {
      regla: "⑥ 使役 + ください： pedir permiso/encargo",
      pasoapaso: [
        "〜させてください： “permítame …” / “déjeme …”。",
        "人 に 〜させてください： “deje que X …”。",
      ],
      ejemploJP: "わたしに れんらく させてください。",
      ejemploRoma: "watashi ni renraku sasete kudasai。",
      ejemploES: "Permítame comunicarme con usted。",
      ejemplos: [
        { jp: "たなかさんに つたえさせてください。", roma: "tanaka-san ni tsutae-sasete kudasai。", es: "Permita que se lo comunique a Tanaka。" },
      ],
    },
  ],
},

  /* ============ DIÁLOGOS (7) ============ */
  dialogos: [
    {
      title: "1) En clase: abrir/cerrar",
      kana: [
        "せんせい：まどをあけてください。",
        "がくせい：はい、あけます。",
        "せんせい：つぎは、ドアをしめてください。",
        "がくせい：わかりました。",
      ],
      kanji: [
        "先生：窓を開けてください。",
        "学生：はい、開けます。",
        "先生：次は、ドアを閉めてください。",
        "学生：分かりました。",
      ],
      es: [
        "Profe: Por favor, abre la ventana.",
        "Alumno: Sí, la abro.",
        "Profe: Luego, cierra la puerta.",
        "Alumno: Entendido.",
      ],
    },
    {
      title: "2) Coloca las bolsas",
      kana: [
        "A：このふくろをここにおいてください。",
        "B：はい、ここでいいですか。",
        "A：はい、ならべてください。",
        "B：わかりました。",
      ],
      kanji: [
        "A：この袋をここに置いてください。",
        "B：はい、ここでいいですか。",
        "A：はい、並べてください。",
        "B：分かりました。",
      ],
      es: [
        "A: Por favor, coloca estas bolsas aquí.",
        "B: Sí, ¿aquí está bien?",
        "A: Sí, ordénalas.",
        "B: Entendido.",
      ],
    },
    {
      title: "3) No lo pongas allí",
      kana: [
        "A：それをそこにおかないでください。",
        "B：すみません。どこにおきますか。",
        "A：つくえのうえにおいてください。",
      ],
      kanji: [
        "A：それをそこに置かないでください。",
        "B：すみません。どこに置きますか。",
        "A：机の上に置いてください。",
      ],
      es: [
        "A: Por favor, no lo pongas allí.",
        "B: Disculpa. ¿Dónde lo pongo?",
        "A: Ponlo sobre el escritorio.",
      ],
    },
    {
      title: "4) Mensaje a Tanaka",
      kana: [
        "A：このれんらくをたなかさんに つたえてください。",
        "B：はい、かならず つたえます。",
      ],
      kanji: [
        "A：この連絡を田中さんに 伝えてください。",
        "B：はい、必ず 伝えます。",
      ],
      es: [
        "A: Por favor, transmite este aviso a Tanaka.",
        "B: Sí, lo transmitiré sin falta.",
      ],
    },
    {
      title: "5) Prepara el salón",
      kana: [
        "A：じゅんびしてください。いすを ならべなさい。",
        "B：はい。つぎは どうしますか。",
        "A：しょるいを ここにおいてください。",
      ],
      kanji: [
        "A：準備してください。椅子を 並べなさい。",
        "B：はい。次は どうしますか。",
        "A：書類を ここに置いてください。",
      ],
      es: [
        "A: Por favor prepárate. Acomoda las sillas.",
        "B: Sí. ¿Qué sigue?",
        "A: Coloca los documentos aquí.",
      ],
    },
    {
      title: "6) Haz que lo ordene",
      kana: [
        "A：こどもに へやを かたづけさせます。",
        "B：いい アイデアですね。",
      ],
      kanji: [
        "A：子どもに 部屋を 片づけさせます。",
        "B：いい アイデアですね。",
      ],
      es: [
        "A: Haré que el niño ordene el cuarto.",
        "B: Buena idea.",
      ],
    },
    {
      title: "7) ¡Atención!",
      kana: [
        "せんせい：ちゅういして ききなさい。",
        "がくせい：はい、ききます。",
      ],
      kanji: [
        "先生：注意して 聞きなさい。",
        "学生：はい、聞きます。",
      ],
      es: [
        "Profe: Presta atención y escucha.",
        "Alumno: Sí, escucharé.",
      ],
    },
  ],

  /* ============ QUIZ SETS (6 minidiálogos para ordenar) ============ */
  quizSets: [
    [
      "A：まどをあけてください。",
      "B：はい、あけます。",
      "A：つぎはドアをしめてください。",
      "B：わかりました。",
    ],
    [
      "A：このはこを ここにおいてください。",
      "B：はい、ここでいいですか。",
      "A：はい、ならべてください。",
    ],
    [
      "A：そこに ならべないでください。",
      "B：すみません。どこに ならべますか。",
      "A：つくえのうえに おいてください。",
    ],
    [
      "A：このれんらくを たなかさんに つたえてください。",
      "B：はい、かならず つたえます。",
    ],
    [
      "A：じゅんびしてください。いすを ならべなさい。",
      "B：はい。つぎは どうしますか。",
      "A：しょるいを ここに おいてください。",
    ],
    [
      "A：こどもに かたづけさせます。",
      "B：いい アイデアですね。",
    ],
  ],

  /* ============ KANJI (10 nuevos, con strokeCode hex4 minúscula) ============ */
  kanji10: [
    {
      ch: "伝",
      kun: ["つた(える)", "つた(わる)"],
      on: ["デン"],
      es: "transmitir; comunicar",
      trazos: 6,
      strokeCode: "4f1d",
      ej: [
        { jp: "伝える", yomi: "tsutaeru", es: "transmitir/avisar" },
        { jp: "伝言",   yomi: "dengon",   es: "recado, mensaje" },
      ],
    },
    {
      ch: "使",
      kun: ["つか(う)"],
      on: ["シ"],
      es: "usar",
      trazos: 8,
      strokeCode: "4f7f",
      ej: [
        { jp: "使う", yomi: "tsukau", es: "usar" },
        { jp: "大使", yomi: "taishi", es: "embajador" },
      ],
    },
    {
      ch: "守",
      kun: ["まも(る)"],
      on: ["シュ", "ス"],
      es: "proteger; obedecer (reglas)",
      trazos: 6,
      strokeCode: "5b88",
      ej: [
        { jp: "守る", yomi: "mamoru", es: "proteger/obedecer" },
        { jp: "留守", yomi: "rusu",   es: "ausencia en casa" },
      ],
    },
    {
      ch: "指",
      kun: ["ゆび", "さ(す)"],
      on: ["シ"],
      es: "dedo; señalar",
      trazos: 9,
      strokeCode: "6307",
      ej: [
        { jp: "指す", yomi: "sasu",  es: "señalar" },
        { jp: "指示", yomi: "shiji", es: "instrucción" },
      ],
    },
    {
      ch: "示",
      kun: ["しめ(す)"],
      on: ["ジ", "シ"],
      es: "mostrar; indicar",
      trazos: 5,
      strokeCode: "793a",
      ej: [
        { jp: "示す", yomi: "shimesu", es: "mostrar" },
        { jp: "指示", yomi: "shiji",   es: "instrucción" },
      ],
    },
    {
      ch: "置",
      kun: ["お(く)"],
      on: ["チ"],
      es: "colocar; poner",
      trazos: 13,
      strokeCode: "7f6e",
      ej: [
        { jp: "置く", yomi: "oku",  es: "poner, colocar" },
        { jp: "位置", yomi: "ichi", es: "posición" },
      ],
    },
    {
      ch: "注",
      kun: ["そそ(ぐ)"],
      on: ["チュウ"],
      es: "verter; anotar; atención",
      trazos: 8,
      strokeCode: "6ce8",
      ej: [
        { jp: "注意", yomi: "chūi",   es: "atención, cuidado" },
        { jp: "注ぐ", yomi: "sosogu", es: "verter" },
      ],
    },
    {
      ch: "準",
      kun: [],
      on: ["ジュン"],
      es: "preparación; estándar",
      trazos: 13,
      strokeCode: "6e96",
      ej: [
        { jp: "準備", yomi: "junbi", es: "preparación" },
        { jp: "基準", yomi: "kijun", es: "criterio" },
      ],
    },
    {
      ch: "開",
      kun: ["あ(ける)", "ひら(く)"],
      on: ["カイ"],
      es: "abrir",
      trazos: 12,
      strokeCode: "958b",
      ej: [
        { jp: "開ける", yomi: "akeru",  es: "abrir" },
        { jp: "公開",   yomi: "kōkai",  es: "publicación" },
      ],
    },
    {
      ch: "閉",
      kun: ["し(める)", "と(じる)"],
      on: ["ヘイ"],
      es: "cerrar",
      trazos: 11,
      strokeCode: "9589",
      ej: [
        { jp: "閉める", yomi: "shimeru", es: "cerrar" },
        { jp: "閉館",   yomi: "heikan",  es: "cierre (edificio)" },
      ],
    },
  ],
};

export default TEMA_12;
