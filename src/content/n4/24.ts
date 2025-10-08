// src/content/n4/24.ts
import { type ThemeContent } from "./types";

const TEMA_24: ThemeContent = {
  numero: 24,
  emoji: "🧩",
  titulo: "Suposiciones y probabilidades",
  subtitulo: "「〜でしょう」「〜かもしれない」",

  objetivos: [
    "Hacer suposiciones con 〜でしょう (probabilidad media-alta, tono suave).",
    "Expresar posibilidad con 〜かもしれない (quizá, baja-media).",
    "Conjugar con VERBO / い-adjetivo / な-adjetivo / sustantivo en forma corta.",
    "Usar marcadores: きっと／たぶん／もしかして para graduar certeza.",
    "Practicar con clima, planes y pequeños reportes.",
  ],

  vocabClase: [
    { key: "v1",  jp: "てんき",         romaji: "tenki",              es: "clima/tiempo" },
    { key: "v2",  jp: "はれる",         romaji: "hareru",             es: "despejarse (clima)" },
    { key: "v3",  jp: "あめ",           romaji: "ame",                es: "lluvia" },
    { key: "v4",  jp: "ゆき",           romaji: "yuki",               es: "nieve" },
    { key: "v5",  jp: "かぜ",           romaji: "kaze",               es: "viento" },
    { key: "v6",  jp: "くもり",         romaji: "kumori",             es: "nublado" },
    { key: "v7",  jp: "たぶん",         romaji: "tabun",              es: "probablemente" },
    { key: "v8",  jp: "もしかして",     romaji: "moshikashite",       es: "a lo mejor / tal vez" },
    { key: "v9",  jp: "きっと",         romaji: "kitto",              es: "seguramente" },
    { key: "v10", jp: "かもしれない",   romaji: "kamoshirenai",       es: "quizá / puede que" },
    { key: "v11", jp: "でしょう",       romaji: "deshō",              es: "(suposición) ¿no?, supongo" },
    { key: "v12", jp: "よてい",         romaji: "yotei",              es: "plan (programa)" },
    { key: "v13", jp: "へんこう",       romaji: "henkō",              es: "cambio (de plan)" },
    { key: "v14", jp: "おそく",         romaji: "osoku",              es: "tarde (adv.)" },
    { key: "v15", jp: "まにあう",       romaji: "maniau",             es: "alcanzar/llegar a tiempo" },
    { key: "v16", jp: "こんしゅう",     romaji: "konshū",             es: "esta semana" },
    { key: "v17", jp: "きょう",         romaji: "kyō",                es: "hoy" },
    { key: "v18", jp: "あした",         romaji: "ashita",             es: "mañana" },
  ],

  oraciones6: [
    { key: "o1", jp: "あしたは てんきが いいでしょう。", romaji: "Ashita wa tenki ga ii deshō.", es: "Mañana probablemente hará buen tiempo.", exp: "〜でしょう: suposición con base." },
    { key: "o2", jp: "ゆきが ふるかもしれない。", romaji: "Yuki ga furu kamoshirenai.", es: "Puede que nieve.", exp: "〜かもしれない: posibilidad baja-media." },
    { key: "o3", jp: "たぶん かいしゃに おそく つくでしょう。", romaji: "Tabun kaisha ni osoku tsuku deshō.", es: "Probablemente llegaré tarde a la empresa.", exp: "たぶん + 〜でしょう." },
    { key: "o4", jp: "きょうは はれるでしょう？", romaji: "Kyō wa hareru deshō?", es: "¿Hoy despejará, verdad?", exp: "Confirmar suavemente con でしょう？" },
    { key: "o5", jp: "もしかして、でんしゃが おくれるかもしれない。", romaji: "Moshikashite, densha ga okureru kamoshirenai.", es: "A lo mejor el tren se retrasa.", exp: "もしかして + 〜かもしれない." },
    { key: "o6", jp: "その よていは へんこうに なるかもしれない。", romaji: "Sono yotei wa henkō ni naru kamoshirenai.", es: "Ese plan puede cambiar.", exp: "名詞 + に なる + かもしれない." },
  ],

  gramatica: {
    titulo: "Como en primaria: suponer y hablar de posibilidad",
    puntos: [
      {
        regla: "① 〜でしょう（です） — suposición (probabilidad media-alta)",
        pasoapaso: [
          "Se pone al final. Forma corta + でしょう。",
          "Con sustantivo/な-adj: だ → でしょう。",
          "Para confirmar suave: 〜でしょう？／〜でしょうね。",
        ],
        ejemploJP: "あしたは あついでしょう。",
        ejemploRoma: "Ashita wa atsui deshō.",
        ejemploES: "Mañana probablemente hará calor。",
        tabla: {
          headers: ["Elemento", "Base (JP)", "＋でしょう (JP)", "Base (romaji)", "＋deshō (romaji)"],
          rows: [
            ["Verbo (presente +)", "行く", "行くでしょう", "iku", "iku deshō"],
            ["Verbo (presente −)", "行かない", "行かないでしょう", "ikanai", "ikanai deshō"],
            ["Verbo (pasado +)", "行った", "行ったでしょう", "itta", "itta deshō"],
            ["Verbo (pasado −)", "行かなかった", "行かなかったでしょう", "ikanakatta", "ikanakatta deshō"],
            ["い-adj (+)", "高い", "高いでしょう", "takai", "takai deshō"],
            ["い-adj (−)", "高くない", "高くないでしょう", "takakunai", "takakunai deshō"],
            ["い-adj (pas. +)", "高かった", "高かったでしょう", "takakatta", "takakatta deshō"],
            ["い-adj (pas. −)", "高くなかった", "高くなかったでしょう", "takakunakatta", "takakunakatta deshō"],
            ["な-adj (+)", "便利だ", "便利でしょう", "benri da", "benri deshō"],
            ["な-adj (−)", "便利ではない", "便利ではないでしょう", "benri dewa nai", "benri dewa nai deshō"],
            ["名詞 (+)", "学生だ", "学生でしょう", "gakusei da", "gakusei deshō"],
            ["名詞 (−)", "学生ではない", "学生ではないでしょう", "gakusei dewa nai", "gakusei dewa nai deshō"],
          ],
        },
        // ✅ 6 oraciones de ejemplo con 〜でしょう
        ejemplos: [
          { jp: "明日は 晴れるでしょう。", roma: "Ashita wa hareru deshō.", es: "Mañana probablemente despejará." },
          { jp: "今夜は 雨でしょう。", roma: "Kon'ya wa ame deshō.", es: "Esta noche probablemente lloverá." },
          { jp: "かぜは つよく ないでしょう。", roma: "Kaze wa tsuyoku nai deshō.", es: "El viento probablemente no será fuerte." },
          { jp: "電車は 遅れないでしょう。", roma: "Densha wa okurenai deshō.", es: "Probablemente el tren no se retrasará." },
          { jp: "こんしゅうは あめが 多いでしょう。", roma: "Konshū wa ame ga ōi deshō.", es: "Esta semana probablemente habrá mucha lluvia." },
          { jp: "かいぎは いちじ でしょう。", roma: "Kaigi wa ichiji deshō.", es: "La reunión probablemente es a la una." },
        ],
      },
      {
        regla: "② 〜かもしれない — posibilidad (quizá)",
        pasoapaso: [
          "Forma corta + かもしれない。",
          "Más débil que でしょう。",
          "Formal: 〜かもしれません。",
          "Con sustantivo/な-adj el だ puede omitirse antes de かもしれない。",
        ],
        ejemploJP: "ゆきに なるかもしれない。",
        ejemploRoma: "Yuki ni naru kamoshirenai.",
        ejemploES: "Puede que nieve。",
        tabla: {
          headers: ["Elemento", "Base (JP)", "＋かもしれない (JP)", "Base (romaji)", "＋kamoshirenai (romaji)"],
          rows: [
            ["Verbo (presente +)", "行く", "行くかもしれない", "iku", "iku kamoshirenai"],
            ["Verbo (presente −)", "行かない", "行かないかもしれない", "ikanai", "ikanai kamoshirenai"],
            ["Verbo (pasado +)", "行った", "行ったかもしれない", "itta", "itta kamoshirenai"],
            ["Verbo (pasado −)", "行かなかった", "行かなかったかもしれない", "ikanakatta", "ikanakatta kamoshirenai"],
            ["い-adj (+)", "高い", "高いかもしれない", "takai", "takai kamoshirenai"],
            ["い-adj (−)", "高くない", "高くないかもしれない", "takakunai", "takakunai kamoshirenai"],
            ["な-adj (+)", "便利だ（×しばしば省略）", "便利（だ）かもしれない", "benri da", "benri (da) kamoshirenai"],
            ["な-adj (−)", "便利ではない", "便利ではないかもしれない", "benri dewa nai", "benri dewa nai kamoshirenai"],
            ["名詞 (+)", "学生だ（×しばしば省略）", "学生（だ）かもしれない", "gakusei da", "gakusei (da) kamoshirenai"],
            ["名詞 (−)", "学生ではない", "学生ではないかもしれない", "gakusei dewa nai", "gakusei dewa nai kamoshirenai"],
            ["Formal (ej.)", "行く", "行くかもしれません", "iku", "iku kamoshiremasen"],
          ],
        },
        // ✅ 6 oraciones de ejemplo con 〜かもしれない
        ejemplos: [
          { jp: "雪に なるかもしれない。", roma: "Yuki ni naru kamoshirenai.", es: "Puede que nieve." },
          { jp: "電車が 遅れるかもしれない。", roma: "Densha ga okureru kamoshirenai.", es: "Puede que el tren se retrase." },
          { jp: "きょうは さむいかもしれない。", roma: "Kyō wa samui kamoshirenai.", es: "Hoy puede hacer frío." },
          { jp: "その 予定は へんこうに なるかもしれない。", roma: "Sono yotei wa henkō ni naru kamoshirenai.", es: "Ese plan puede cambiar." },
          { jp: "まにあわないかもしれない。", roma: "Maniawanai kamoshirenai.", es: "Puede que no alcance a llegar a tiempo." },
          { jp: "空が くらいかもしれない。", roma: "Sora ga kurai kamoshirenai.", es: "Puede que el cielo esté oscuro." },
        ],
      },
      {
        regla: "③ Marcadores de certeza",
        pasoapaso: [
          "きっと（seguramente）+ 〜でしょう。",
          "たぶん（probablemente）+ 〜でしょう。",
          "もしかして（tal vez）+ 〜かもしれない。",
        ],
        ejemploJP: "たぶん あめでしょう。",
        ejemploRoma: "Tabun ame deshō.",
        ejemploES: "Probablemente llueva。",
      },
      {
        regla: "④ Negación y cortesía",
        pasoapaso: [
          "Negación normal + でしょう／かもしれない。",
          "こないでしょう／こないかもしれない（usa kana si el kanji no está visto）。",
          "Formal: 〜ないかもしれません。",
        ],
        ejemploJP: "いかないかもしれない。",
        ejemploRoma: "Ikanai kamoshirenai.",
        ejemploES: "Puede que no vaya。",
      },
    ],
  },

  dialogos: [
    {
      title: "Clima de mañana",
      kana: ["A: あしたは てんきが いいでしょう？","B: うん、たぶん はれるよ。","A: かぜは つよいかな。","B: つよく ないでしょう。"],
      kanji:["A: 明日は 天気が いいでしょう？","B: うん、たぶん 晴れるよ。","A: 風は つよいかな。","B: つよく ないでしょう。"],
      es:["A: ¿Mañana hará buen tiempo, verdad?","B: Sí, probablemente despeje.","A: ¿El viento será fuerte?","B: Probablemente no sea fuerte."]
    },
    {
      title: "Tren y retrasos",
      kana:["A: でんしゃが おくれるかもしれない。","B: じゃ、すこし はやめに いこう。","A: まにあうでしょうか。","B: きっと だいじょうぶでしょう。"],
      kanji:["A: 電車が 遅れるかもしれない。","B: じゃ、少し 早めに 行こう。","A: 間に合うでしょうか。","B: きっと 大丈夫でしょう。"],
      es:["A: Puede que el tren se retrase.","B: Entonces, vamos un poco antes.","A: ¿Alcanzaremos?","B: Seguro que sí."]
    },
    {
      title: "Cambios en el plan",
      kana:["A: その よていは へんこうに なるかもしれない。","B: え？ あしたは いけない かも。","A: じゃ、こんしゅうの すいよう日は どうでしょう。","B: うん、いいと おもう。"],
      kanji:["A: その 予定は 変更に なるかもしれない。","B: え？ 明日は 行けない かも。","A: じゃ、今週の 水曜日は どうでしょう。","B: うん、いいと 思う。"],
      es:["A: Ese plan puede cambiar.","B: Quizá mañana no pueda ir.","A: Entonces, ¿miércoles de esta semana?","B: Sí, me parece bien."]
    },
    {
      title: "¿Lloverá hoy?",
      kana:["A: きょうは あめでしょうか。","B: たぶん。くもり だけ かもしれないけど。","A: かさを もって いった ほうが いいね。","B: うん、そのほうが あんしん。"],
      kanji:["A: 今日は 雨でしょうか。","B: たぶん。曇り だけ かもしれないけど。","A: 傘を 持って 行った ほうが いいね。","B: うん、そのほうが 安心。"],
      es:["A: ¿Hoy lloverá?","B: Probablemente. Quizá solo esté nublado.","A: Mejor llevo paraguas.","B: Sí, así más tranquilo."]
    },
    {
      title: "Aciertos",
      kana:["A: この よそうは あたるでしょうか。","B: たぶん あたると おもう。","A: はずれかもしれない とも おもう。","B: うん、どちらも あるね。"],
      kanji:["A: この 予想は 当たるでしょうか。","B: たぶん 当たると 思う。","A: 外れかもしれない とも 思う。","B: うん、どちらも あるね。"],
      es:["A: ¿Este pronóstico acertará?","B: Probablemente acierte.","A: También podría fallar.","B: Sí, puede pasar cualquiera."]
    },
    {
      title: "Mirando el cielo",
      kana:["A: そらが くらい。ゆきかもしれない。","B: いや、あめでしょう。","A: かぜも でてきたね。","B: きょうの てんきは へんだね。"],
      kanji:["A: 空が くらい。雪かもしれない。","B: いや、雨でしょう。","A: 風も 出てきたね。","B: 今日の 天気は 変だね。"],
      es:["A: El cielo está oscuro. Puede que nieve.","B: No, probablemente llueva.","A: También empezó viento.","B: El clima de hoy está raro."]
    },
    {
      title: "Confirmando con cortesía",
      kana:["A: あしたの かいぎは いちじ でしょうか。","B: はい、その よてい でしょう。","A: おくれるかもしれません。","B: では、オンラインでも だいじょうぶでしょう。"],
      kanji:["A: 明日の 会議は 一時 でしょうか。","B: はい、その 予定 でしょう。","A: 遅れるかもしれません。","B: では、オンラインでも 大丈夫でしょう。"],
      es:["A: ¿La reunión de mañana es a la una, verdad?","B: Sí, ese es el plan.","A: Puede que llegue tarde.","B: Entonces, seguramente online está bien."]
    },
  ],

  quizSets: [
    ["A: あしたは てんきが いいでしょう？","B: うん、たぶん はれるよ。","A: かぜは つよいかな。","B: つよく ないでしょう。"],
    ["A: でんしゃが おくれるかもしれない。","B: じゃ、すこし はやめに いこう。","A: まにあうでしょうか。","B: きっと だいじょうぶでしょう。"],
    ["A: その よていは へんこうに なるかもしれない。","B: あしたは いけない かも。","A: じゃ、こんしゅうの すいよう日は どうでしょう。","B: うん、いいと おもう。"],
    ["A: きょうは あめでしょうか。","B: たぶん。くもり かもしれない。","A: かさを もっていこう。","B: うん、そのほうが いい。"],
    ["A: この よそうは あたるでしょうか。","B: たぶん あたると おもう。","A: はずれかもしれない けどね。","B: どちらも あるね。"],
    ["A: そらが くらい。ゆきかもしれない。","B: いや、あめでしょう。","A: かぜも でてきたよ。","B: きょうの てんきは へんだね。"],
  ],

  kanji10: [
    { ch: "今", kun: ["いま"], on: ["コン"], es: "ahora", trazos: 4, strokeCode: "4eca",
      ej: [{ jp: "今", yomi: "いま", es: "ahora" },{ jp: "今週", yomi: "こんしゅう", es: "esta semana" }] },
    { ch: "天", kun: ["あま"], on: ["テン"], es: "cielo", trazos: 4, strokeCode: "5929",
      ej: [{ jp: "天気", yomi: "てんき", es: "clima" },{ jp: "晴天", yomi: "せいてん", es: "cielo despejado" }] },
    { ch: "気", kun: [], on: ["キ"], es: "espíritu; aire", trazos: 6, strokeCode: "6c17",
      ej: [{ jp: "天気", yomi: "てんき", es: "clima" },{ jp: "気分", yomi: "きぶん", es: "ánimo" }] },
    { ch: "雨", kun: ["あめ","あま"], on: ["ウ"], es: "lluvia", trazos: 8, strokeCode: "96e8",
      ej: [{ jp: "雨", yomi: "あめ", es: "lluvia" },{ jp: "大雨", yomi: "おおあめ", es: "lluvia fuerte" }] },
    { ch: "雪", kun: ["ゆき"], on: ["セツ"], es: "nieve", trazos: 11, strokeCode: "96ea",
      ej: [{ jp: "雪", yomi: "ゆき", es: "nieve" },{ jp: "降雪", yomi: "こうせつ", es: "nevada" }] },
    { ch: "晴", kun: ["は(れる)","は(らす)"], on: ["セイ"], es: "despejarse", trazos: 12, strokeCode: "6674",
      ej: [{ jp: "晴れる", yomi: "はれる", es: "despejarse" },{ jp: "晴天", yomi: "せいてん", es: "cielo claro" }] },
    { ch: "多", kun: ["おお(い)"], on: ["タ"], es: "mucho", trazos: 6, strokeCode: "591a",
      ej: [{ jp: "多分", yomi: "たぶん", es: "probablemente" },{ jp: "多い", yomi: "おおい", es: "muchos" }] },
    { ch: "少", kun: ["すく(ない)","すこ(し)"], on: ["ショウ"], es: "poco", trazos: 4, strokeCode: "5c11",
      ej: [{ jp: "少し", yomi: "すこし", es: "un poco" },{ jp: "多少", yomi: "たしょう", es: "más o menos" }] },
    { ch: "当", kun: ["あ(たる)","あ(てる)"], on: ["トウ"], es: "acertar; apropiado", trazos: 6, strokeCode: "5f53",
      ej: [{ jp: "当たる", yomi: "あたる", es: "acertar" },{ jp: "本当", yomi: "ほんとう", es: "verdad (real)" }] },
    { ch: "空", kun: ["そら","あ(く)","あ(ける)","から"], on: ["クウ"], es: "cielo; vacío", trazos: 8, strokeCode: "7a7a",
      ej: [{ jp: "空", yomi: "そら", es: "cielo" },{ jp: "空気", yomi: "くうき", es: "aire; atmósfera" }] },
  ],
};

export default TEMA_24;
