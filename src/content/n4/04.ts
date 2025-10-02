// src/content/n4/04.ts
import type { ThemeContent } from "./types";

/**
 * TEMA 4 (N4) · 🏪 En tiendas y centros comerciales – Tallas, precios y ofertas
 * Compatible con N4TemaScreen (objetivos, vocabClase, oraciones6, gramatica, dialogos, quizLines, kanji10)
 */

export const TEMA_4 = {
  objetivos: [
    "Preguntar precios con いくら／～円です。",
    "Pedir tallas y colores: ～サイズはありますか／～色はありますか。",
    "Pedir permiso: 試着してもいいですか。",
    "Pedir alternativas/ofertas: もう少し安いのはありますか／セール・割引の確認。",
    "Usar colores como adjetivos (～い) y como sustantivos＋の（赤いシャツ／赤のシャツ, 緑のシャツ）。",
  ],

  /* ======================
     VOCABULARIO (≥15 + 10 prendas hombre/mujer)
  ====================== */
  vocabClase: [
    { key: "v1",  jp: "値段",           romaji: "nedan",            es: "precio" },
    { key: "v2",  jp: "～円",           romaji: "～ en",            es: "yen(es)" },
    { key: "v3",  jp: "サイズ",         romaji: "saizu",            es: "talla" },
    { key: "v4",  jp: "試着",           romaji: "shichaku",         es: "probarse (ropa)" },
    { key: "v5",  jp: "試着室",         romaji: "shichakushitsu",   es: "probador" },
    { key: "v6",  jp: "色",             romaji: "iro",              es: "color" },
    { key: "v7",  jp: "赤",             romaji: "aka",              es: "rojo (sust.)" },
    { key: "v8",  jp: "青",             romaji: "ao",               es: "azul (sust.)" },
    { key: "v9",  jp: "黒",             romaji: "kuro",             es: "negro (sust.)" },
    { key: "v10", jp: "白",             romaji: "shiro",            es: "blanco (sust.)" },
    { key: "v11", jp: "靴",             romaji: "kutsu",            es: "zapatos" },
    { key: "v12", jp: "服",             romaji: "fuku",             es: "ropa" },
    { key: "v13", jp: "セール",         romaji: "sēru",             es: "rebajas/venta" },
    { key: "v14", jp: "割引",           romaji: "waribiki",         es: "descuento" },
    { key: "v15", jp: "レシート",       romaji: "reshīto",          es: "ticket/recibo" },
    { key: "v16", jp: "現金",           romaji: "genkin",           es: "efectivo" },
    { key: "v17", jp: "クレジットカード", romaji: "kurejitto kādo", es: "tarjeta (crédito)" },
    { key: "v18", jp: "交換",           romaji: "kōkan",            es: "cambio (producto)" },

    // +10 prendas (mujer/hombre)
    { key: "v19", jp: "ワンピース",     romaji: "wanpīsu",          es: "vestido (mujer)" },
    { key: "v20", jp: "スカート",       romaji: "sukāto",           es: "falda (mujer)" },
    { key: "v21", jp: "ブラウス",       romaji: "burausu",          es: "blusa (mujer)" },
    { key: "v22", jp: "ハイヒール",     romaji: "haihīru",          es: "tacones (mujer)" },
    { key: "v23", jp: "カーディガン",   romaji: "kādigān",          es: "cárdigan (mujer)" },
    { key: "v24", jp: "スーツ",         romaji: "sūtsu",            es: "traje (hombre)" },
    { key: "v25", jp: "ネクタイ",       romaji: "nekutai",          es: "corbata (hombre)" },
    { key: "v26", jp: "シャツ",         romaji: "shatsu",           es: "camisa (hombre)" },
    { key: "v27", jp: "ズボン",         romaji: "zubon",            es: "pantalón (hombre)" },
    { key: "v28", jp: "ジャケット",     romaji: "jaketto",          es: "chaqueta (hombre)" },
  ],

  /* ======================
     ORACIONES (6)
  ====================== */
  oraciones6: [
    { key: "s1", jp: "これはいくらですか。",              romaji: "kore wa ikura desu ka",               es: "¿Cuánto cuesta esto?",                        exp: "Pregunta básica de precio." },
    { key: "s2", jp: "このシャツは３５００円です。",      romaji: "kono shatsu wa sanzen gohyaku en desu", es: "Esta camisa cuesta 3500 yenes.",             exp: "Respuesta con ～円です。" },
    { key: "s3", jp: "Ｍサイズはありますか。",            romaji: "emu saizu wa arimasu ka",              es: "¿Tienen talla M?",                             exp: "Disponibilidad con ～はありますか。" },
    { key: "s4", jp: "黒いのはありますか。",              romaji: "kuroi no wa arimasu ka",               es: "¿Hay en color negro?",                         exp: "の para referirse al artículo mostrado." },
    { key: "s5", jp: "試着してもいいですか。",            romaji: "shichaku shite mo ii desu ka",         es: "¿Puedo probármelo?",                           exp: "て-form + もいいですか (pedir permiso)." },
    { key: "s6", jp: "もう少し安いのはありますか。",      romaji: "mō sukoshi yasui no wa arimasu ka",     es: "¿Tiene algo un poco más barato?",              exp: "Comparativo suave もう少し + adjetivo." },
  ],

  /* ======================
     GRAMÁTICA
  ====================== */
  gramatica: {
    titulo: "Gramática",
    puntos: [
      {
        regla: "いくらですか／～円です",
        pasoapaso: [
          "A: これはいくらですか。 (¿Cuánto cuesta?)",
          "B: ～円です。 (Cuesta ~ yenes.)",
        ],
        ejemploJP: "これはいくらですか。— ３５００円です。",
        ejemploRoma: "kore wa ikura desu ka — sanzen gohyaku en desu",
        ejemploES: "¿Cuánto cuesta? — Son 3500 yenes.",
        ejemplos: [
          { jp: "この靴はいくらですか。", roma: "kono kutsu wa ikura desu ka", es: "¿Cuánto cuestan estos zapatos?" },
          { jp: "あの帽子は２０００円です。", roma: "ano bōshi wa nisen en desu", es: "Ese sombrero cuesta 2000 yenes." },
        ],
      },
      {
        regla: "～サイズ／～色 はありますか",
        pasoapaso: ["[opción] + はありますか → preguntar disponibilidad.", "S/M/L や 色（黒・白・赤…）"],
        ejemploJP: "Ｍサイズはありますか。",
        ejemploRoma: "emu saizu wa arimasu ka",
        ejemploES: "¿Tienen talla M?",
        ejemplos: [
          { jp: "黒いのはありますか。", roma: "kuroi no wa arimasu ka", es: "¿Hay en negro?" },
          { jp: "赤いシャツはありますか。", roma: "akai shatsu wa arimasu ka", es: "¿Hay camisas rojas?" },
        ],
        tabla: {
          title: "Tallas comunes",
          headers: ["Etiqueta", "Lectura", "Notas"],
          rows: [
            ["Sサイズ（pequeña）", "esu saizu", "talla pequeña"],
            ["Mサイズ（mediana）", "emu saizu", "talla mediana"],
            ["Lサイズ（grande）",  "eru saizu", "talla grande"],
          ],
        },
      },
      {
        regla: "～てもいいですか (pedir permiso)",
        pasoapaso: ["Verbo（て形）+ もいいですか → ¿Puedo ~?", "Respuesta afirmativa: どうぞ／いいですよ。"],
        ejemploJP: "試着してもいいですか。",
        ejemploRoma: "shichaku shite mo ii desu ka",
        ejemploES: "¿Puedo probármelo?",
        ejemplos: [
          { jp: "写真をとってもいいですか。", roma: "shashin o totte mo ii desu ka", es: "¿Puedo tomar una foto?" },
          { jp: "触ってもいいですか。",       roma: "sawatte mo ii desu ka",       es: "¿Puedo tocarlo?" },
        ],
      },

      // Colores: sustantivo（～の） vs adjetivo（～い）
      {
        regla: "Colores：sustantivo（～の） vs adjetivo（～い）＋ ‘の’ para elípsis",
        pasoapaso: [
          "1) I-adjetivos (terminan en ～い): 赤い(akai) rojo, 青い(aoi) azul, 白い(shiroi) blanco, 黒い(kuroi) negro, 黄色い(kiiroi) amarillo → modifican directo: 例) 赤いシャツ。",
          "2) Sustantivos de color: 緑(midori) verde, 茶色(chairo) marrón, 紫(murasaki) morado, ピンク(pinku) rosa, オレンジ(orenji) naranja, グレー(gurē) gris, ベージュ(bēju) beige, 金色(kin'iro) dorado, 銀色(gin'iro) plateado → usan の: 例) 緑のシャツ。",
          "3) ‘El/la …’ (el rojo / la roja): (i-adj)+の → 赤いの; (sust.)+の → 緑の。",
          "4) Disponibilidad: (i-adj) 赤いのはありますか。／(sust.) 緑のはありますか。",
          "※ Notas: 黄色い／黄色の ambos se usan; 茶色い existe, pero es más común 茶色の. Los colores básicos no llevan な。",
        ],
        ejemploJP: "赤いシャツと緑のシャツ、どちらが人気ですか。",
        ejemploRoma: "akai shatsu to midori no shatsu, dochira ga ninki desu ka",
        ejemploES: "¿La camisa roja o la verde, cuál es más popular?",
        tabla: {
          title: "Colores por tipo（JP・rōmaji・ES）",
          headers: ["Tipo", "Forma base", "Como adjetivo", "Como sustantivo + の", "Ejemplo（→ traducción）"],
          rows: [
            ["i-adj", "赤い (akai) — rojo",      "赤いシャツ (camisa roja)",             "—",                          "赤いのはありますか。→ ¿Hay una roja?"],
            ["i-adj", "青い (aoi) — azul",       "青い帽子 (sombrero azul)",             "—",                          "青いのはありますか。→ ¿Hay uno azul?"],
            ["i-adj", "白い (shiroi) — blanco",  "白いコート (abrigo blanco)",             "—",                          "白いのはありますか。→ ¿Hay uno blanco?"],
            ["i-adj", "黒い (kuroi) — negro",    "黒いズボン (pantalón negro)",           "—",                          "黒いのはありますか。→ ¿Hay uno negro?"],
            ["i-adj*", "黄色い/黄色 (kiiroi/kiiro) — amarillo", "黄色いバッグ (bolsa amarilla)", "黄色のバッグ (bolsa amarilla)", "黄色い(の)も自然。"],
            ["sust.", "緑 (midori) — verde",     "—",                                    "緑のシャツ (camisa verde)",   "緑のはありますか。→ ¿Hay una verde?"],
            ["sust.", "茶色 (chairo) — marrón",  "（茶色い también）",                      "茶色の靴 (zapatos marrones)", "茶色のはありますか。→ ¿Hay marrón?"],
            ["sust.", "紫 (murasaki) — morado",  "—",                                    "紫のスカート (falda morada)", "紫のはありますか。→ ¿Hay morado?"],
            ["sust.", "ピンク (pinku) — rosa",   "—",                                    "ピンクのワンピース (vestido rosa)", "ピンクのはありますか。→ ¿Hay rosa?"],
            ["sust.", "グレー (gurē) — gris",    "—",                                    "グレーのジャケット (chaqueta gris)", "グレーのはありますか。→ ¿Hay gris?"],
          ],
          note: "‘な’ no se usa con los colores básicos. Usa の para sustantivar o elidir el nombre de la prenda.",
        },
        // Lista con audio (toca el altavoz en cada línea)
        ejemplos: [
          { jp: "赤い",    roma: "akai",      es: "rojo (adjetivo)" },
          { jp: "青い",    roma: "aoi",       es: "azul (adjetivo)" },
          { jp: "白い",    roma: "shiroi",    es: "blanco (adjetivo)" },
          { jp: "黒い",    roma: "kuroi",     es: "negro (adjetivo)" },
          { jp: "黄色い",  roma: "kiiroi",    es: "amarillo (adjetivo)" },
          { jp: "緑",      roma: "midori",    es: "verde (sustantivo)" },
          { jp: "茶色",    roma: "chairo",    es: "marrón (sustantivo)" },
          { jp: "紫",      roma: "murasaki",  es: "morado (sustantivo)" },
          { jp: "ピンク",   roma: "pinku",     es: "rosa (sustantivo)" },
          { jp: "グレー",   roma: "gurē",      es: "gris (sustantivo)" },
        ],
      },

      {
        regla: "もう少し＋adjetivo＋の はありますか",
        pasoapaso: ["Comparativo suave: ‘un poco más ~’.", "Usa の para elípsis del sustantivo."],
        ejemploJP: "もう少し安いのはありますか。",
        ejemploRoma: "mō sukoshi yasui no wa arimasu ka",
        ejemploES: "¿Tiene algo un poco más barato?",
        ejemplos: [
          { jp: "もう少し大きいのはありますか。", roma: "mō sukoshi ōkii no wa arimasu ka", es: "¿Hay uno un poco más grande?" },
          { jp: "もう少し短いのはありますか。",   roma: "mō sukoshi mijikai no wa arimasu ka", es: "¿Hay uno un poco más corto?" },
        ],
      },
    ],
  },

  /* ======================
     DIÁLOGOS (4) + QUIZ en dialogos (5 bloques)
  ====================== */
  dialogos: [
    {
      title: "Precio básico",
      kana:  ["これは いくら ですか。", "３５００えん です。", "ちょっと たかい ですね。"],
      kanji: ["これは いくら ですか。", "３５００円です。",       "ちょっと 高い ですね。"],
      es:    ["¿Cuánto cuesta esto?", "Son 3500 yenes.", "Es un poco caro, ¿no?"],
    },
    {
      title: "Talla y probador",
      kana:  ["Ｍさいず は ありますか。", "はい、あります。", "しちゃく しても いいですか。", "どうぞ、しちゃくしつ は こちら です。"],
      kanji: ["Ｍサイズ は ありますか。", "はい、あります。", "試着しても いいですか。",     "どうぞ、試着室は こちら です。"],
      es:    ["¿Tienen talla M?", "Sí, tenemos.", "¿Puedo probármelo?", "Adelante, el probador es por aquí."],
    },
    {
      title: "Color y alternativa",
      kana:  ["くろい の は ありますか。", "はい、こちら です。", "もう すこし やすい の は ありますか。"],
      kanji: ["黒い の は ありますか。",   "はい、こちら です。",   "もう 少し 安い の は ありますか。"],
      es:    ["¿Hay en negro?", "Sí, por aquí.", "¿Tiene algo un poco más barato?"],
    },
    {
      title: "Oferta y pago",
      kana:  ["この くつ は セール です か。", "はい、２０パーセント おふ です。", "では、それ を ください。", "げんきん と かーど、どちら に します か。"],
      kanji: ["この 靴 は セール です か。",   "はい、２０％オフ です。",            "では、それ を ください。", "現金 と カード、どちら に します か。"],
      es:    ["¿Estos zapatos están en oferta?", "Sí, 20% de descuento.", "Entonces, me los llevo.", "¿En efectivo o con tarjeta?"],
    },

    // —— 5 “quizzes” de ordenar (en esta misma sección) ——
    {
      title: "【QUIZ color #1】(ordena) シャツ：青い（i-adj）",
      kana:  ["はい、こちら です。", "あおい シャツ は ありますか。", "しちゃく しても いい です か。", "どうぞ。"],
      kanji: ["はい、こちらです。",   "青い シャツ は ありますか。",      "試着しても いいですか。",          "どうぞ。"],
      es:    ["Sí, por aquí.", "¿Hay camisas azules?", "¿Puedo probármela?", "Adelante."],
    },
    {
      title: "【QUIZ color #2】(ordena) ワンピース：緑（sust.+の）",
      kana:  ["みどり の ワンピース は ありますか。", "はい、あります。", "しちゃく しても いい です か。", "どうぞ。"],
      kanji: ["緑 の ワンピース は ありますか。",     "はい、あります。", "試着しても いいですか。",         "どうぞ。"],
      es:    ["¿Hay vestido verde?", "Sí, tenemos.", "¿Puedo probármelo?", "Adelante."],
    },
    {
      title: "【QUIZ color #3】(ordena) ‘の’ elíptico：黒いの",
      kana:  ["くろい の は ありますか。", "はい、こちら です。", "すこし やすい の は ありますか。", "しょうしょう おまち ください。"],
      kanji: ["黒い の は ありますか。",   "はい、こちら です。",   "少し 安い の は ありますか。",        "少々 お待ちください。"],
      es:    ["¿Tienen uno en negro?", "Sí, por aquí.", "¿Hay uno un poco más barato?", "Un momento, por favor."],
    },
    {
      title: "【QUIZ color #4】(ordena) 靴：茶色（sust.+の）",
      kana:  ["ちゃいろ の くつ は ありますか。", "はい、ございます。", "こちら に なります。", "ありがとうございます。"],
      kanji: ["茶色 の 靴 は ありますか。",       "はい、ございます。", "こちら に なります。", "ありがとうございます。"],
      es:    ["¿Hay zapatos marrones?", "Sí, cómo no.", "Por aquí están.", "Muchas gracias."],
    },
    {
      title: "【QUIZ color #5】(ordena) コート：黄色（ambas formas）",
      kana:  ["きいろ の コート は ありますか。", "きいろい コート も あります。", "みて も いい です か。", "どうぞ。"],
      kanji: ["黄色 の コート は ありますか。",   "黄色い コート も あります。",    "見ても いいですか。",  "どうぞ。"],
      es:    ["¿Hay abrigo amarillo?", "También tenemos abrigo amarillo (i-adj).", "¿Puedo verlo?", "Adelante."],
    },
  ],

  /* ======================
     QUIZ (ordenar diálogo) — se mantiene el de probador (compat)
  ====================== */
  quizLines: [
    "Ｍサイズはありますか。",
    "はい、あります。",
    "試着してもいいですか。",
    "どうぞ、試着室はこちらです。",
  ],

  // 👇 extras para que N4TemaScreen pueda renderizar 6 quizzes (1+5)
  // (el screen los leerá con (content as any).quizSets)
  quizSets: [
    ["Ｍサイズはありますか。","はい、あります。","試着してもいいですか。","どうぞ、試着室はこちらです。"],
    ["青いシャツはありますか。","はい、こちらです。","試着してもいいですか。","どうぞ。"],
    ["緑のワンピースはありますか。","はい、あります。","少し高いです。","もう少し安いのはありますか。"],
    ["黒いのはありますか。","はい、こちらです。","Ｍサイズはありますか。","はい、あります。"],
    ["この靴はいくらですか。","２０００円です。","レシートをお願いします。","ありがとうございます。"],
    ["黄色いコートはセールですか。","はい、２０％オフです。","それをください。","カードでお願いします。"],
  ],

  /* ======================
     KANJI (10) con KanjiVG
  ====================== */
  kanji10: [
    { ch: "買", kun: ["か-う"], on: ["バイ"], es: "comprar", trazos: 12, strokeCode: "8cb7",
      ej: [{ jp: "買います", yomi: "かいます", es: "comprar (formal)" }] },
    { ch: "売", kun: ["う-る"], on: ["バイ"], es: "vender", trazos: 7, strokeCode: "58f2",
      ej: [{ jp: "売ります", yomi: "うります", es: "vender (formal)" }] },
    { ch: "値", kun: [], on: ["チ"], es: "valor/precio (値段)", trazos: 10, strokeCode: "5024",
      ej: [{ jp: "値段", yomi: "ねだん", es: "precio" }] },
    { ch: "安", kun: ["やす-い"], on: ["アン"], es: "barato / seguro", trazos: 6, strokeCode: "5b89",
      ej: [{ jp: "安い", yomi: "やすい", es: "barato" }] },
    { ch: "高", kun: ["たか-い"], on: ["コウ"], es: "caro / alto", trazos: 10, strokeCode: "9ad8",
      ej: [{ jp: "高い", yomi: "たかい", es: "caro/alto" }] },
    { ch: "色", kun: ["いろ"], on: ["ショク"], es: "color", trazos: 6, strokeCode: "8272",
      ej: [{ jp: "色", yomi: "いろ", es: "color" }] },
    { ch: "服", kun: [], on: ["フク"], es: "ropa", trazos: 8, strokeCode: "670d",
      ej: [{ jp: "服", yomi: "ふく", es: "ropa" }] },
    { ch: "靴", kun: ["くつ"], on: [], es: "zapatos", trazos: 13, strokeCode: "9774",
      ej: [{ jp: "靴", yomi: "くつ", es: "zapatos" }] },
    { ch: "試", kun: ["こころ-みる", "ため-す"], on: ["シ"], es: "probar/ensayar", trazos: 13, strokeCode: "8a66",
      ej: [{ jp: "試着", yomi: "しちゃく", es: "probarse (ropa)" }] },
    { ch: "着", kun: ["き-る", "つ-く"], on: ["チャク"], es: "ponerse/llegar", trazos: 12, strokeCode: "7740",
      ej: [{ jp: "着ます", yomi: "きます", es: "ponerse (ropa)" }] },
  ],
} as unknown as ThemeContent;

export default TEMA_4;
