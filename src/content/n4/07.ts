// src/content/n4/07.ts
import type { ThemeContent } from "./types";

/**
 * TEMA 7 (N4) · 🏥 En el hospital — síntomas y citas
 * Nota: en gramática/diálogos usamos kanji ya vistos + los 10 nuevos de esta lección;
 * todo lo demás se queda en kana para no romper el nivel.
 */

const TEMA_7: ThemeContent = {
  objetivos: [
    "Reservar cita y decir la hora: ～時／～分 に ～します。",
    "Explicar síntomas básicos: ～が いたいです／～が あります。",
    "Pedir indicaciones sencillas al médico: ～てください。",
    "Hablar de ir al hospital/doctor: 病院／医者。",
  ],

  /* ======================
     VOCABULARIO (≥15)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "病院",        romaji: "byōin",        es: "hospital" },
    { key: "v2",  jp: "医者",        romaji: "isha",         es: "médico/a" },
    { key: "v3",  jp: "くすり（薬）", romaji: "kusuri",       es: "medicina/medicamento" },
    { key: "v4",  jp: "びょうき",    romaji: "byōki",        es: "enfermedad" },
    { key: "v5",  jp: "いたい",      romaji: "itai",         es: "duele / doloroso" },
    { key: "v6",  jp: "いたみ",      romaji: "itami",        es: "dolor" },
    { key: "v7",  jp: "ねつ",        romaji: "netsu",        es: "fiebre" },
    { key: "v8",  jp: "せき",        romaji: "seki",         es: "tos" },
    { key: "v9",  jp: "のど",        romaji: "nodo",         es: "garganta" },
    { key: "v10", jp: "め（目）",     romaji: "me",           es: "ojo(s)" },
    { key: "v11", jp: "みみ（耳）",   romaji: "mimi",         es: "oído(s)" },
    { key: "v12", jp: "くち（口）",   romaji: "kuchi",        es: "boca" },
    { key: "v13", jp: "こころ（心）", romaji: "kokoro",       es: "corazón/ánimo" },
    { key: "v14", jp: "よやく",      romaji: "yoyaku",       es: "cita/reserva" },
    { key: "v15", jp: "しんさつ",    romaji: "shinsatsu",    es: "consulta/revisión" },
  ],

  /* ======================
     ORACIONES (6)
  ====================== */
  oraciones6: [
    { key: "s1", jp: "病院へ行きたいです。",               romaji: "byōin e ikitai desu",              es: "Quiero ir al hospital.",               exp: "Lugar + へ + 行きたいです： deseo de ir." },
    { key: "s2", jp: "のどが いたいです。",                 romaji: "nodo ga itai desu",                es: "Me duele la garganta.",                exp: "[Parte del cuerpo] + が + いたいです。" },
    { key: "s3", jp: "ねつが あります。",                   romaji: "netsu ga arimasu",                 es: "Tengo fiebre.",                         exp: "Síntoma + が あります： ‘hay/tengo ~’." },
    { key: "s4", jp: "３時に 来ます。",                     romaji: "san-ji ni kimasu",                 es: "Vengo a las 3.",                        exp: "Hora + に + 来ます／行きます。" },
    { key: "s5", jp: "くすりを のんでください。",            romaji: "kusuri o nonde kudasai",           es: "Por favor, tome la medicina.",          exp: "Verbo（て形）+ ください： petición amable." },
    { key: "s6", jp: "医者に みてもらいます。",              romaji: "isha ni mite moraimasu",           es: "Me revisa el médico.",                  exp: "～に みてもらいます： pedir que te revisen." },
  ],

  /* ======================
     GRAMÁTICA (explicado “como en primaria”)
  ====================== */
  gramatica: {
    titulo: "Gramática",
    puntos: [
      {
        regla: "① [Parte del cuerpo] + が いたいです。",
        pasoapaso: [
          "Dices qué parte duele con が.",
          "いたいです = ‘duele / me duele’.",
          "Ej.: のど／め／みみ／くち が いたいです。",
        ],
        ejemploJP: "のどが いたいです。",
        ejemploRoma: "nodo ga itai desu",
        ejemploES: "Me duele la garganta.",
        ejemplos: [
          { jp: "目が いたいです。",  roma: "me ga itai desu",   es: "Me duelen los ojos." },
          { jp: "耳が いたいです。",  roma: "mimi ga itai desu", es: "Me duelen los oídos." },
        ],
      },
      {
        regla: "② [Síntoma] + が あります。",
        pasoapaso: [
          "Usa あります para decir ‘tengo/hay’.",
          "Síntomas comunes: ねつ（fiebre）、せき（tos）。",
        ],
        ejemploJP: "ねつが あります。",
        ejemploRoma: "netsu ga arimasu",
        ejemploES: "Tengo fiebre.",
        ejemplos: [
          { jp: "せきが あります。", roma: "seki ga arimasu", es: "Tengo tos." },
        ],
      },
      {
        regla: "③ ～てください（petición amable）",
        pasoapaso: [
          "Verbo（て形）+ ください = ‘por favor, haga ~’.",
          "En la clínica: まってください（espere）／すわってください（siéntese）／のんでください（tome）。",
        ],
        ejemploJP: "くすりを のんでください。",
        ejemploRoma: "kusuri o nonde kudasai",
        ejemploES: "Por favor, tome la medicina.",
        ejemplos: [
          { jp: "ここで まってください。", roma: "koko de matte kudasai", es: "Por favor, espere aquí." },
        ],
      },
      {
        regla: "④ ～時／～分 に ～（来ます／行きます）",
        pasoapaso: [
          "Hora + に + 来ます／行きます。",
          "Media hora: ～時半（はん）。 Minutos irregulares: ３分(さんぷん)・６分(ろっぷん)・１０分(じゅっぷん) など。",
        ],
        ejemploJP: "３時に 来ます。",
        ejemploRoma: "san-ji ni kimasu",
        ejemploES: "Vengo a las 3.",
        tabla: {
          title: "Mini-guía 時（じ）／分（ふん・ぷん）",
          headers: ["Número", "Hora (〜時)", "Minuto (〜分)", "Rōmaji"],
          rows: [
            ["1", "いちじ", "いっぷん", "ichi-ji / ip-pun"],
            ["3", "さんじ", "さんぷん", "san-ji / san-pun"],
            ["6", "ろくじ", "ろっぷん", "roku-ji / rop-pun"],
            ["10","じゅうじ","じゅっぷん","jū-ji / jup-pun"],
            ["半","—", "（はん）", "han = y media"],
          ],
          note: "Practica con tus citas: 何時（なんじ）に 来ますか。",
        },
      },
      {
        regla: "⑤ ～たいです（repaso: ‘quiero ~’）",
        pasoapaso: [
          "Raíz del verbo + たいです。",
          "Ej.: 行きたいです（quiero ir）／ 会いたいです（quiero ver a… ※escolarización futura）",
        ],
        ejemploJP: "病院へ行きたいです。",
        ejemploRoma: "byōin e ikitai desu",
        ejemploES: "Quiero ir al hospital.",
        ejemplos: [
          { jp: "医者に みてもらいたいです。", roma: "isha ni mite moraitai desu", es: "Quiero que me revise el médico." },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (7)
  ====================== */
  dialogos: [
    {
      title: "Reservar cita",
      kana:  ["すみません、よやくを したいです。", "いつが いいですか。", "あした ３じに おねがいします。", "はい、だいじょうぶです。おなまえは？", "たなか です。"],
      kanji: ["すみません、よやくを したいです。", "いつが いいですか。", "あした ３時に お願いします。", "はい、だいじょうぶです。お名前は？", "たなか です。"],
      es:    ["Disculpe, quiero reservar cita.", "¿Qué día/hora le va bien?", "Mañana a las 3, por favor.", "De acuerdo. ¿Su nombre?", "Soy Tanaka."],
    },
    {
      title: "Síntomas básicos",
      kana:  ["ねつが あります。", "せきも でます。", "わかりました。しんさつを します。"],
      kanji: ["ねつが あります。", "せきも でます。", "わかりました。診察を します。"],
      es:    ["Tengo fiebre.", "También tengo tos.", "Entendido. Haremos la revisión."],
    },
    {
      title: "Dolor localizado",
      kana:  ["どこが いたいですか。", "のどが いたいです。", "くすりを のんでください。"],
      kanji: ["どこが いたいですか。", "のどが いたいです。", "薬を のんでください。"],
      es:    ["¿Dónde le duele?", "Me duele la garganta.", "Por favor, tome la medicina."],
    },
    {
      title: "Hora de llegada",
      kana:  ["なんじに 来ますか。", "３じ はんに 来ます。", "はい、おまちして います。"],
      kanji: ["なん時に 来ますか。", "３時半に 来ます。", "はい、お待ちして います。"],
      es:    ["¿A qué hora viene?", "Vengo a las tres y media.", "De acuerdo, le esperamos."],
    },
    {
      title: "En la sala",
      kana:  ["ここで まってください。", "はい、わかりました。"],
      kanji: ["ここで 待ってください。", "はい、わかりました。"],
      es:    ["Espere aquí, por favor.", "Entendido."],
    },
    {
      title: "Después de la consulta",
      kana:  ["１にち ３かい のんで ください。", "いつまで ですか。", "３にち まで です。"],
      kanji: ["１日 ３回 のんで ください。", "いつまで ですか。", "３日 まで です。"],
      es:    ["Tómelo 3 veces al día.", "¿Hasta cuándo?", "Durante 3 días."],
    },
    {
      title: "Ánimo",
      kana:  ["しんぱい しないで ください。", "はい、ありがとうございます。"],
      kanji: ["心配 しないで ください。", "はい、ありがとうございます。"],
      es:    ["No se preocupe.", "Gracias."],
    },
  ],

  /* ======================
     QUIZ (6 sets para ordenar)
  ====================== */
  quizSets: [
    [
      "すみません、よやくを したいです。",
      "あした ３時に お願いします。",
      "はい、だいじょうぶです。お名前は？",
      "たなか です。",
    ],
    [
      "ねつが あります。",
      "せきも でます。",
      "わかりました。診察を します。",
    ],
    [
      "どこが いたいですか。",
      "のどが いたいです。",
      "薬を のんでください。",
    ],
    [
      "なん時に 来ますか。",
      "３時半に 来ます。",
      "はい、お待ちして います。",
    ],
    [
      "ここで 待ってください。",
      "はい、わかりました。",
    ],
    [
      "１日 ３回 のんで ください。",
      "いつまで ですか。",
      "３日 まで です。",
    ],
  ],

  /* ======================
     KANJI (10) — de la lección
  ====================== */
  kanji10: [
    { ch: "病", kun: [], on: ["ビョウ"], es: "enfermedad", strokeCode: "75c5",
      ej: [{ jp: "病院", yomi: "びょういん", es: "hospital" }] },
    { ch: "院", kun: [], on: ["イン"], es: "institución (hospital)", strokeCode: "9662",
      ej: [{ jp: "病院", yomi: "びょういん", es: "hospital" }] },
    { ch: "医", kun: [], on: ["イ"], es: "medicina/médico", strokeCode: "533b",
      ej: [{ jp: "医者", yomi: "いしゃ", es: "médico/a" }] },
    { ch: "者", kun: [], on: ["シャ"], es: "persona (prof.)", strokeCode: "8005",
      ej: [{ jp: "医者", yomi: "いしゃ", es: "médico/a" }] },
    { ch: "薬", kun: ["くすり"], on: ["ヤク"], es: "medicina", strokeCode: "85ac",
      ej: [{ jp: "薬", yomi: "くすり", es: "medicamento" }] },
    { ch: "痛", kun: ["いた-い"], on: ["ツウ"], es: "dolor", strokeCode: "75db",
      ej: [{ jp: "痛い", yomi: "いたい", es: "duele" }] },
    { ch: "目", kun: ["め"], on: ["モク"], es: "ojo", strokeCode: "76ee",
      ej: [{ jp: "目", yomi: "め", es: "ojo" }] },
    { ch: "耳", kun: ["みみ"], on: ["ジ"], es: "oído", strokeCode: "8033",
      ej: [{ jp: "耳", yomi: "みみ", es: "oído" }] },
    { ch: "口", kun: ["くち"], on: ["コウ"], es: "boca", strokeCode: "53e3",
      ej: [{ jp: "口", yomi: "くち", es: "boca" }] },
    { ch: "心", kun: ["こころ"], on: ["シン"], es: "corazón/ánimo", strokeCode: "5fc3",
      ej: [{ jp: "安心", yomi: "あんしん", es: "tranquilidad" }],
    },
  ],
};

export default TEMA_7;
