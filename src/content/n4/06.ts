import type { ThemeContent } from "./types";

/**
 * TEMA 6 (N4) · 🏫 En la escuela – Asignaturas, horarios y eventos
 * - Vocabulario: 15 items
 * - Gramática: explicada simple (nivel primaria)
 * - Tabla: ejemplo de 時間割 (horario)
 * - Diálogos: 7
 * - Quizzes: 6 (quizSets)
 * - Kanji: 10 con KanjiVG strokeCode
 */

const TEMA_6: ThemeContent = {
  objetivos: [
    "Hablar de materias: ～が得意です／苦手です。",
    "Decir horarios: ～は何時から／何時まで・～時～分に始まります／終わります。",
    "Decir que hay clase o evento: ～があります／～は～日にあります。",
    "Pedir/indicar acciones en clase: ～てください／～てもいいですか。",
    "Participar en eventos: ～に参加します／～に出ます。",
  ],

  /* ======================
     VOCABULARIO (15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "授業",     romaji: "jugyō",     es: "clase / lección" },
    { key: "v2",  jp: "時間割",   romaji: "jikanwari", es: "horario escolar" },
    { key: "v3",  jp: "宿題",     romaji: "shukudai",  es: "tarea" },
    { key: "v4",  jp: "試験",     romaji: "shiken",    es: "examen" },
    { key: "v5",  jp: "先生",     romaji: "sensei",    es: "maestro/a" },
    { key: "v6",  jp: "生徒",     romaji: "seito",     es: "alumno/a" },
    { key: "v7",  jp: "国語",     romaji: "kokugo",    es: "lengua japonesa" },
    { key: "v8",  jp: "英語",     romaji: "eigo",      es: "inglés" },
    { key: "v9",  jp: "数学",     romaji: "sūgaku",    es: "matemáticas" },
    { key: "v10", jp: "理科",     romaji: "rika",      es: "ciencias" },
    { key: "v11", jp: "社会",     romaji: "shakai",    es: "estudios sociales" },
    { key: "v12", jp: "音楽",     romaji: "ongaku",    es: "música" },
    { key: "v13", jp: "体育",     romaji: "taiiku",    es: "educación física" },
    { key: "v14", jp: "文化祭",   romaji: "bunkasai",  es: "festival cultural" },
    { key: "v15", jp: "運動会",   romaji: "undōkai",   es: "día deportivo" },
  ],

  /* ======================
     ORACIONES (6)
  ====================== */
  oraciones6: [
    { key: "s1", jp: "月曜日に英語の授業があります。", romaji: "getsuyōbi ni eigo no jugyō ga arimasu", es: "El lunes hay clase de inglés.", exp: "Día + に + [materia] の 授業 が あります（hay clase de…）。" },
    { key: "s2", jp: "数学は９時に始まります。",     romaji: "sūgaku wa ku-ji ni hajimarimasu", es: "Matemáticas empieza a las 9.", exp: "[Materia] は [hora] に 始まります（empieza）／終わります（termina）。" },
    { key: "s3", jp: "１０時半に終わります。",       romaji: "jū-ji han ni owarimasu", es: "Termina a las 10:30.", exp: "半（はん） = y media." },
    { key: "s4", jp: "宿題を出してください。",         romaji: "shukudai o dashite kudasai", es: "Entreguen la tarea, por favor.", exp: "～てください = ‘por favor, haz…’ (petición cortés)." },
    { key: "s5", jp: "私は音楽が得意です。",         romaji: "watashi wa ongaku ga tokui desu", es: "Soy bueno en música.", exp: "得意（とくい）= se me da bien; 苦手（にがて）= se me da mal." },
    { key: "s6", jp: "来週、試験があります。",         romaji: "raishū, shiken ga arimasu", es: "La próxima semana hay examen.", exp: "Evento + が あります（hay…）。" },
  ],

  /* ======================
     GRAMÁTICA (explicada simple)
  ====================== */
  gramatica: {
    titulo: "Gramática",
    puntos: [
      {
        regla: "～があります（hay…）",
        pasoapaso: [
          "Piensa que あります = ‘existe/hay’.",
          "Dices qué hay + が + あります.",
          "Para tiempo: [día] に 〜があります（el lunes hay…）."
        ],
        ejemploJP: "月曜日に英語の授業があります。",
        ejemploRoma: "getsuyōbi ni eigo no jugyō ga arimasu",
        ejemploES: "El lunes hay clase de inglés.",
        ejemplos: [
          { jp: "来週、試験があります。", roma: "raishū, shiken ga arimasu", es: "La próxima semana hay examen." },
          { jp: "文化祭があります。",     roma: "bunkasai ga arimasu",     es: "Hay festival cultural." },
        ],
      },
      {
        regla: "何時から／何時まで・始まります／終わります",
        pasoapaso: [
          "何時（なんじ）= ¿a qué hora?",
          "～は [hora] に 始まります（empieza）／終わります（termina）.",
          "Para preguntar: ～は 何時からですか／何時までですか。"
        ],
        ejemploJP: "数学は９時に始まります。",
        ejemploRoma: "sūgaku wa ku-ji ni hajimarimasu",
        ejemploES: "Matemáticas empieza a las 9.",
        ejemplos: [
          { jp: "１０時半に終わります。", roma: "jū-ji han ni owarimasu", es: "Termina a las 10:30." },
          { jp: "英語は何時からですか。", roma: "eigo wa nanji kara desu ka", es: "¿Desde qué hora es inglés?" },
        ],
        tabla: {
          title: "Mini horario（時間割）— ejemplo",
          headers: ["曜日", "１限", "２限", "３限"],
          rows: [
            ["月", "英語", "数学", "理科"],
            ["火", "国語", "社会", "音楽"],
            ["水", "体育", "英語", "数学"],
          ],
          note: "曜日（ようび）: 月(lu)・火(ma)・水(mi)・木(ju)・金(vi). １限(いちげん)=1ª hora, etc."
        },
      },
      {
        regla: "得意（とくい）／苦手（にがて）",
        pasoapaso: [
          "A は B が 得意です（A es bueno en B）.",
          "A は B が 苦手です（A es malo / le cuesta B）.",
          "Usa con materias: 数学／英語／音楽…"
        ],
        ejemploJP: "私は音楽が得意です。",
        ejemploRoma: "watashi wa ongaku ga tokui desu",
        ejemploES: "Soy bueno en música.",
        ejemplos: [
          { jp: "数学が苦手です。", roma: "sūgaku ga nigate desu", es: "Se me dan mal las matemáticas." },
          { jp: "英語が得意です。", roma: "eigo ga tokui desu",   es: "Soy bueno en inglés." },
        ],
      },
      {
        regla: "～てください（por favor, haz…）",
        pasoapaso: [
          "Verbo en forma て + ください = petición educada.",
          "El profe la usa mucho: 「聞いてください」「読んでください」."
        ],
        ejemploJP: "宿題を出してください。",
        ejemploRoma: "shukudai o dashite kudasai",
        ejemploES: "Entreguen la tarea, por favor.",
        ejemplos: [
          { jp: "静かにして ください。", roma: "shizuka ni shite kudasai", es: "Guarden silencio, por favor." },
          { jp: "ページ１０を読んでください。", roma: "pēji jū o yonde kudasai", es: "Lean la página 10, por favor." },
        ],
      },
      {
        regla: "イベントに参加します／出ます",
        pasoapaso: [
          "Lugar/Evento + に + 参加します（さんか）= participar.",
          "～に出ます también se usa (presentarse, salir)."
        ],
        ejemploJP: "運動会に参加します。",
        ejemploRoma: "undōkai ni sanka shimasu",
        ejemploES: "Participaré en el día deportivo.",
        ejemplos: [
          { jp: "文化祭に出ます。", roma: "bunkasai ni demasu", es: "Me presentaré en el festival cultural." },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7)
  ====================== */
  dialogos: [
    {
      title: "¿Qué hay hoy?",
      kana:  ["きょう は なに の じゅぎょう が ありますか。", "えいご と さんすう が あります。"],
      kanji: ["今日は 何の 授業が ありますか。",           "英語と 数学が あります。"],
      es:    ["¿Qué clases hay hoy?", "Hay inglés y matemáticas."],
    },
    {
      title: "Empieza y termina",
      kana:  ["すうがく は なんじ から ですか。", "９じ に はじまって、１０じ はん に おわります。"],
      kanji: ["数学は 何時から ですか。",           "９時に 始まって、１０時半に 終わります。"],
      es:    ["¿A qué hora empieza matemáticas?", "Empieza a las 9 y termina a las 10:30."],
    },
    {
      title: "Tarea",
      kana:  ["しゅくだい を だして ください。", "はい、せんせい。"],
      kanji: ["宿題を 出して ください。",          "はい、先生。"],
      es:    ["Entreguen la tarea, por favor.", "Sí, profe."],
    },
    {
      title: "¿Se te da bien?",
      kana:  ["おんがく は とくい です か。", "はい、とくい です。"],
      kanji: ["音楽は 得意ですか。",             "はい、得意です。"],
      es:    ["¿Se te da bien música?", "Sí, se me da bien."],
    },
    {
      title: "Examen",
      kana:  ["らいしゅう、しけん が あります。", "がんばりましょう。"],
      kanji: ["来週、試験があります。",           "頑張りましょう。"],
      es:    ["La próxima semana hay examen.", "¡Esforcémonos!"],
    },
    {
      title: "Permiso",
      kana:  ["トイレ に いっても いい です か。", "いい ですよ。"],
      kanji: ["トイレに 行っても いいですか。",     "いいですよ。"],
      es:    ["¿Puedo ir al baño?", "Sí, adelante."],
    },
    {
      title: "Evento escolar",
      kana:  ["ぶんかさい に さんか します か。", "はい、うた で でます。"],
      kanji: ["文化祭に 参加しますか。",          "はい、歌で 出ます。"],
      es:    ["¿Participas en el festival cultural?", "Sí, salgo cantando."],
    },
  ],

  /* ======================
     QUIZZES (6 sets) — usa N4TemaScreen (quizSets)
  ====================== */
  quizSets: [
    [
      "今日は 何の 授業が ありますか。",
      "英語と 数学が あります。",
      "よろしく おねがいします。",
    ],
    [
      "数学は 何時から ですか。",
      "９時に 始まります。",
      "１０時半に 終わります。",
    ],
    [
      "来週、試験があります。",
      "頑張りましょう。",
      "ありがとうございます。",
    ],
    [
      "宿題を 出して ください。",
      "はい、先生。",
      "明日も ありますか。",
    ],
    [
      "音楽は 得意ですか。",
      "はい、得意です。",
      "私は 英語が 苦手です。",
    ],
    [
      "運動会に 参加します。",
      "文化祭にも 出ます。",
      "楽しみです！",
    ],
  ],

  /* ======================
     KANJI (10) — genera las imágenes KanjiVG con estos códigos
  ====================== */
  kanji10: [
    { ch: "校", kun: [], on: ["コウ"], es: "escuela (〜校)", trazos: 10, strokeCode: "6821",
      ej: [{ jp: "学校", yomi: "がっこう", es: "escuela" }] },
    { ch: "教", kun: ["おし-える"], on: ["キョウ"], es: "enseñar", trazos: 11, strokeCode: "6559",
      ej: [{ jp: "教える", yomi: "おしえる", es: "enseñar" }] },
    { ch: "宿", kun: [], on: ["シュク"], es: "alojar → (宿題)", trazos: 11, strokeCode: "5bbf",
      ej: [{ jp: "宿題", yomi: "しゅくだい", es: "tarea" }] },
    { ch: "題", kun: [], on: ["ダイ"], es: "título / problema", trazos: 18, strokeCode: "984c",
      ej: [{ jp: "宿題", yomi: "しゅくだい", es: "tarea" }] },
    { ch: "科", kun: [], on: ["カ"], es: "asignatura", trazos: 9, strokeCode: "79d1",
      ej: [{ jp: "理科", yomi: "りか", es: "ciencias" }] },
    { ch: "数", kun: ["かず"], on: ["スウ"], es: "número → (数学)", trazos: 13, strokeCode: "6570",
      ej: [{ jp: "数学", yomi: "すうがく", es: "matemáticas" }] },
    { ch: "音", kun: ["おと"], on: ["オン"], es: "sonido", trazos: 9, strokeCode: "97f3",
      ej: [{ jp: "音楽", yomi: "おんがく", es: "música" }] },
    { ch: "楽", kun: ["たの-しい"], on: ["ガク","ラク"], es: "música / diversión", trazos: 13, strokeCode: "697d",
      ej: [{ jp: "音楽", yomi: "おんがく", es: "música" }] },
    { ch: "体", kun: ["からだ"], on: ["タイ"], es: "cuerpo → (体育)", trazos: 7, strokeCode: "4f53",
      ej: [{ jp: "体育", yomi: "たいいく", es: "educación física" }] },
    { ch: "文", kun: ["ふみ"], on: ["ブン"], es: "frase / texto", trazos: 4, strokeCode: "6587",
      ej: [{ jp: "作文", yomi: "さくぶん", es: "redacción" }] },
  ],
};

export default TEMA_6;
