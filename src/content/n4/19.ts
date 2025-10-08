// src/content/n4/19.ts
import type { ThemeContent } from "../types";

// Tema 19 — Eventos y fiestas: celebraciones y planes
export const TEMA_19: ThemeContent = {
  id: 19,
  nivel: "N4",
  titulo: "Eventos y fiestas – Hablar de celebraciones y planes",

  objetivos: [
    "Hablar de intenciones y planes: 〜つもりです／〜予定です。",
    "Expresar decisiones: 〜ことにする／〜ことになる（acuerdo/regla）。",
    "Invitar y proponer: 〜ませんか／〜ましょう。",
    "Enumerar actividades del evento: 〜たり〜たりします。",
    "Usar vocabulario de festivales (夏祭り／花火／音楽／歌 など) y horarios básicos.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "まつり（祭り）", romaji: "matsuri", es: "festival" },
    { key: "vc02", jp: "夏祭り", romaji: "natsu-matsuri", es: "festival de verano" },
    { key: "vc03", jp: "花火", romaji: "hanabi", es: "fuegos artificiales" },
    { key: "vc04", jp: "音楽", romaji: "ongaku", es: "música" },
    { key: "vc05", jp: "歌", romaji: "uta", es: "canción" },
    { key: "vc06", jp: "夜", romaji: "yoru", es: "noche" },
    { key: "vc07", jp: "写真", romaji: "shashin", es: "foto, fotografía" },
    { key: "vc08", jp: "準備（する）", romaji: "junbi (suru)", es: "preparación / preparar" },
    { key: "vc09", jp: "計画（する）", romaji: "keikaku (suru)", es: "plan / planear (usa en kana si prefieres)" },
    { key: "vc10", jp: "予定", romaji: "yotei", es: "plan (programa, agenda)" },
    { key: "vc11", jp: "場所", romaji: "basho", es: "lugar" },
    { key: "vc12", jp: "時間", romaji: "jikan", es: "hora, tiempo" },
    { key: "vc13", jp: "招待（する）", romaji: "shōtai (suru)", es: "invitar (usa kana si hace falta)" },
    { key: "vc14", jp: "屋台", romaji: "yatai", es: "puesto callejero (comida)" },
    { key: "vc15", jp: "ステージ", romaji: "sutēji", es: "escenario" },
    { key: "vc16", jp: "スケジュール", romaji: "sukejūru", es: "horario" },
    { key: "vc17", jp: "中止", romaji: "chūshi", es: "cancelación (usar en kana si hace falta)" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "土曜日は 夏祭り に 行く つもり です。",
      romaji: "doyōbi wa natsu-matsuri ni iku tsumori desu.",
      es: "El sábado pienso ir al festival de verano.",
      exp: "V(辞書形)+つもりです：intención personal."
    },
    {
      key: "ex02",
      jp: "日曜日の よる は 花火 を 見る 予定 です。",
      romaji: "nichiyōbi no yoru wa hanabi o miru yotei desu.",
      es: "El domingo por la noche está previsto ver fuegos artificiales.",
      exp: "V(辞書形)+予定です / Nの予定です：plan fijado."
    },
    {
      key: "ex03",
      jp: "みんな で 歌 を うたったり、写真 を とったり します。",
      romaji: "minna de uta o utattari, shashin o tottari shimasu.",
      es: "Entre todos cantaremos y tomaremos fotos (y más).",
      exp: "〜たり〜たりします：lista de actividades."
    },
    {
      key: "ex04",
      jp: "雨 の とき は 中止 に なる こと に なって います。",
      romaji: "ame no toki wa chūshi ni naru koto ni natte imasu.",
      es: "Si llueve, está decidido que se cancela.",
      exp: "〜ことになっている：regla / decisión establecida."
    },
    {
      key: "ex05",
      jp: "いっしょに 行きません か。— はい、行きましょう。",
      romaji: "issho ni ikimasen ka? — hai, ikimashō.",
      es: "¿Vamos juntos? — Sí, vamos.",
      exp: "〜ませんか（invitación）／〜ましょう（aceptar/proponer）."
    },
    {
      key: "ex06",
      jp: "夜 おそく ならない ように、先に 集合 する こと に しました。",
      romaji: "yoru osoku naranai yō ni, saki ni shūgō suru koto ni shimashita.",
      es: "Para no hacerlo tarde, decidimos reunirnos antes.",
      exp: "〜ことにする：decisión propia/ del grupo."
    },
  ],

  // Gramática “como en primaria”
  gramatica: {
    titulo: "Planes e invitaciones：〜つもりです／〜予定です／〜ことにする／〜たり〜たり／〜ませんか",
    puntos: [
      {
        key: "g01",
        regla: "① 〜つもりです（intención personal）",
        pasoapaso: [
          "1) Usa el verbo en forma diccionario (Vる).",
          "2) + つもりです = ‘pienso / tengo intención de…’.",
          "3) Negativo: Vない つもりです ‘pienso no…’.",
          "4) Pasado de intención: つもりでした（pero quizá no ocurrió）."
        ],
        ejemploJP: "土曜日は まつりに 行く つもりです。",
        ejemploRoma: "doyōbi wa matsuri ni iku tsumori desu.",
        ejemploES: "El sábado pienso ir al festival.",
        tabla: {
          title: "Patrones con つもり",
          headers: ["Tipo", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Afirm.", "Vる+つもりです", "花火 を 見る つもりです。", "hanabi o miru tsumori desu.", "Pienso ver los fuegos."],
            ["Neg.", "Vない+つもりです", "夜 おそく まで いない つもりです。", "yoru osoku made inai tsumori desu.", "Pienso no quedarme hasta tarde."],
            ["Pasado", "Vる+つもりでした", "歌 を うたう つもりでした。", "uta o utau tsumori deshita.", "Pensaba cantar."],
          ],
          note: "Intención propia, no agenda externa."
        },
        ejemplos: [
          { jp: "友だち と 行く つもりです。", roma: "tomodachi to iku tsumori desu.", es: "Pienso ir con amigos." },
          { jp: "写真 を たくさん とる つもりです。", roma: "shashin o takusan toru tsumori desu.", es: "Pienso tomar muchas fotos." },
          { jp: "雨でも 行く つもりです。", roma: "ame demo iku tsumori desu.", es: "Aunque llueva, pienso ir." },
          { jp: "お金 を つかいすぎない つもりです。", roma: "okane o tsukaisuginai tsumori desu.", es: "Pienso no gastar demasiado." },
        ],
      },

      {
        key: "g02",
        regla: "② 〜予定です（plan/horario）",
        pasoapaso: [
          "1) Vる+予定です / N の 予定です。",
          "2) ‘está planeado / programado’. Agenda, no solo intención.",
          "3) Cambios: 予定が 変わる／中止に なる。",
          "4) Pasado: 〜予定でした（pero tal vez cambió)."
        ],
        ejemploJP: "日曜日の 夜 は 花火 を 見る 予定です。",
        ejemploRoma: "nichiyōbi no yoru wa hanabi o miru yotei desu.",
        ejemploES: "El domingo por la noche está planeado ver fuegos.",
        tabla: {
          title: "Patrones con 予定",
          headers: ["Patrón", "Uso", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Vる+予定です", "acción programada", "歌 を きく 予定です。", "uta o kiku yotei desu.", "Está previsto escuchar canciones."],
            ["N の 予定です", "evento/actividad", "夏祭り の 予定です。", "natsu-matsuri no yotei desu.", "Está previsto el festival de verano."],
            ["変更", "cambio de plan", "雨で 中止 の 予定です。", "ame de chūshi no yotei desu.", "Por lluvia, se prevé cancelación."],
          ],
          note: "予定 feels ‘calendarizado’. Diferente de intención personal."
        },
        ejemplos: [
          { jp: "ステージ を 見る 予定でした が、行けません でした。", roma: "sutēji o miru yotei deshita ga, ikemasen deshita.", es: "Estaba previsto ver el escenario, pero no pude." },
          { jp: "場所 は 公園 の 予定です。", roma: "basho wa kōen no yotei desu.", es: "El lugar previsto es el parque." },
          { jp: "時間 は 夜7時 の 予定です。", roma: "jikan wa yoru shichiji no yotei desu.", es: "La hora prevista es a las 7 pm." },
          { jp: "雨 の とき は 予定 が 変わります。", roma: "ame no toki wa yotei ga kawarimasu.", es: "Si llueve, cambia el plan." },
        ],
      },

      {
        key: "g03",
        regla: "③ 〜ことにする／〜ことになる（decidir / quedar decidido）",
        pasoapaso: [
          "1) 〜ことにする：decisión del hablante/grupo (‘decidimos…’).",
          "2) 〜ことになる：resultado/regla decidida por otros o por la situación.",
          "3) Presente continuo de regla: 〜ことに なって いる。",
          "4) Usa V(辞書形) antes de こと."
        ],
        ejemploJP: "先に 集合 する こと に しました。",
        ejemploRoma: "saki ni shūgō suru koto ni shimashita.",
        ejemploES: "Decidimos reunirnos primero.",
        tabla: {
          title: "Decisión: にする vs になる",
          headers: ["Patrón", "Quién decide", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Vる ことにする", "yo/nosotros", "写真 を とらない こと に する。", "shashin o toranai koto ni suru.", "Decido no tomar fotos."],
            ["Vる ことになる", "otros / regla", "雨 の とき 中止 に なる こと に なった。", "ame no toki chūshi ni naru koto ni natta.", "Se decidió cancelar si llueve."],
            ["Vる ことに なっている", "regla vigente", "入る とき ならぶ こと に なって いる。", "hairu toki narabu koto ni natte iru.", "Está establecido hacer fila al entrar."],
          ],
          note: "‘にする’ = elección propia. ‘になる’ = decisión externa/resultado."
        },
        ejemplos: [
          { jp: "夜 おそく ならない ように、早く かえる こと に した。", roma: "yoru osoku naranai yō ni, hayaku kaeru koto ni shita.", es: "Decidí volver temprano para no hacerlo tarde." },
          { jp: "人 が 多い ので、場所 を 変える こと に なった。", roma: "hito ga ōi node, basho o kaeru koto ni natta.", es: "Como hay mucha gente, se decidió cambiar el lugar." },
          { jp: "入り口 で チケット を 見せる こと に なって います。", roma: "iriguchi de chiketto o miseru koto ni natte imasu.", es: "En la entrada hay que mostrar el boleto (regla)." },
          { jp: "みんな で 歌う こと に しました。", roma: "minna de utau koto ni shimashita.", es: "Decidimos cantar todos." },
        ],
      },

      {
        key: "g04",
        regla: "④ 〜たり〜たりします（lista de actividades）",
        pasoapaso: [
          "1) Usa V(た) + り para cada acción representativa.",
          "2) Termina con 〜します / 〜しました.",
          "3) Orden es libre; expresa ‘hacer cosas como A y B’.",
          "4) Añade など para ‘etc.’ si quieres."
        ],
        ejemploJP: "花火 を 見たり、歌 を うたったり します。",
        ejemploRoma: "hanabi o mitari, uta o utattari shimasu.",
        ejemploES: "Veremos fuegos y cantaremos, entre otras cosas.",
        tabla: {
          title: "Patrón 〜たり〜たり",
          headers: ["Paso", "Forma", "Ejemplo", "Roma"],
          rows: [
            ["①", "V(た) + り", "写真 を とったり", "shashin o tottari"],
            ["②", "V(た) + り", "屋台 で 食べたり", "yatai de tabetari"],
            ["③", "…+ します", "…します", "…shimasu"],
          ],
          note: "Tiempo pasado → 〜しました. Negación: あまり しません, etc."
        },
        ejemplos: [
          { jp: "音楽 を きいたり、おどったり しました。", roma: "ongaku o kiitari, odottari shimashita.", es: "Escuchamos música y bailamos, entre otras cosas." },
          { jp: "友だち と 話したり、写真 を とったり します。", roma: "tomodachi to hanashitari, shashin o tottari shimasu.", es: "Charlo con amigos y tomo fotos, etc." },
          { jp: "歌 を うたったり、夜市 を あるいたり しました。", roma: "uta o utattari, yoichi o aruitari shimashita.", es: "Cantamos y paseamos por el mercado nocturno." },
          { jp: "花 を 見たり、ゲーム を したり します。", roma: "hana o mitari, gēmu o shitari shimasu.", es: "Vemos flores y jugamos." },
        ],
      },

      {
        key: "g05",
        regla: "⑤ 〜ませんか／〜ましょう（invitar y proponer）",
        pasoapaso: [
          "1) 〜ませんか：invitación cortés (‘¿te parece si…?’).",
          "2) 〜ましょう：propuesta/aceptación (‘vamos a…’).",
          "3) Rechazo suave：すみません、ちょっと…／また こんど。",
          "4) Añade tiempo/lugar: 夜7時 に 駅 で 〜ませんか。"
        ],
        ejemploJP: "いっしょに 夏祭り に 行きませんか。— 行きましょう！",
        ejemploRoma: "issho ni natsu-matsuri ni ikimasen ka? — ikimashō!",
        ejemploES: "¿Vamos juntos al festival de verano? — ¡Vamos!",
        ejemplos: [
          { jp: "このあと 花火 を 見ませんか。", roma: "kono ato hanabi o mimasen ka.", es: "¿Vemos los fuegos después?" },
          { jp: "先に 集合 しましょう。", roma: "saki ni shūgō shimashō.", es: "Reunámonos primero." },
          { jp: "歌 を ききに 行きませんか。", roma: "uta o kikini ikimasen ka.", es: "¿Vamos a escuchar canciones?" },
          { jp: "公園 で 夜7時 に 会いましょう。", roma: "kōen de yoru shichiji ni aimashō.", es: "Veámonos a las 7 pm en el parque." },
        ],
      },
    ],
  },

  // 7 diálogos (kana/kanji/es — TTS-friendly)
  dialogos: [
    {
      title: "夏祭りの計画",
      kana: [
        "土曜日は 夏祭り に 行く つもり だ よ。",
        "いいね。夜 は 花火 を 見る 予定？",
        "うん。写真 も とりたい。"
      ],
      kanji: [
        "土曜日は 夏祭り に 行く つもり だ よ。",
        "いいね。夜 は 花火 を 見る 予定？",
        "うん。写真 も とりたい。"
      ],
      es: [
        "El sábado pienso ir al festival de verano.",
        "Qué bien. ¿Por la noche está previsto ver fuegos?",
        "Sí. También quiero tomar fotos."
      ]
    },
    {
      title: "集合の時間",
      kana: [
        "先に 集合 する こと に した。",
        "何時 が いい？",
        "夜7時 は どう？"
      ],
      kanji: [
        "先に 集合 する こと に した。",
        "何時 が いい？",
        "夜7時 は どう？"
      ],
      es: [
        "Decidimos reunirnos primero.",
        "¿A qué hora te va bien?",
        "¿A las 7 pm?"
      ]
    },
    {
      title: "招待",
      kana: [
        "いっしょに 行きません か。",
        "はい、行きましょう。",
        "屋台 で 何 を 食べる？"
      ],
      kanji: [
        "いっしょに 行きません か。",
        "はい、行きましょう。",
        "屋台 で 何 を 食べる？"
      ],
      es: [
        "¿Vamos juntos?",
        "Sí, vamos.",
        "¿Qué comemos en los puestos?"
      ]
    },
    {
      title: "雨のとき",
      kana: [
        "雨 の とき は 中止 に なる こと に なって います。",
        "じゃあ 天気 を 見て から 行こう。",
        "そう しよう。"
      ],
      kanji: [
        "雨 の とき は 中止 に なる こと に なって います。",
        "じゃあ 天気 を 見て から 行こう。",
        "そう しよう。"
      ],
      es: [
        "Si llueve, está decidido que se cancela.",
        "Entonces, vamos después de ver el clima.",
        "Hagámoslo así."
      ]
    },
    {
      title: "ステージと歌",
      kana: [
        "音楽 の ステージ を 見たり、歌 を うたったり したい。",
        "いいね。写真 も とろう。",
        "うん、楽しい 夜 に なりそう。"
      ],
      kanji: [
        "音楽 の ステージ を 見たり、歌 を 歌ったり したい。",
        "いいね。写真 も とろう。",
        "うん、楽しい 夜 に なりそう。"
      ],
      es: [
        "Quiero ver el escenario de música y cantar.",
        "Bien. Tomemos fotos también.",
        "Sí, parece que será una noche divertida."
      ]
    },
    {
      title: "場所の確認",
      kana: [
        "場所 は 公園 の 中心 の ところ だ よ。",
        "わかった。先に 行って まって いる ね。",
        "ありがとう。"
      ],
      kanji: [
        "場所 は 公園 の 中心 の ところ だ よ。",
        "わかった。先に 行って 待って いる ね。",
        "ありがとう。"
      ],
      es: [
        "El lugar es la zona central del parque.",
        "Entendido. Iré antes y esperaré allí.",
        "Gracias."
      ]
    },
    {
      title: "帰る時間",
      kana: [
        "夜 おそく ならない ように、十時 ごろ に かえろう。",
        "そうだ ね。人 が 多く なる まえ に かえろう。",
        "うん。"
      ],
      kanji: [
        "夜 おそく ならない ように、十時 ごろ に 帰ろう。",
        "そうだ ね。人 が 多く なる まえ に 帰ろう。",
        "うん。"
      ],
      es: [
        "Para no volver tarde, volvamos alrededor de las diez.",
        "Sí. Volvamos antes de que haya mucha gente.",
        "De acuerdo."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: 夏祭り に 行く つもり です。",
      "B: いいですね。夜 は 花火 を 見ません か。",
      "A: はい、見ましょう。"
    ],
    [
      "A: 日曜日 は 歌 を きく 予定 です。",
      "B: じゃあ、写真 も とりましょう。",
      "A: いい ですね。"
    ],
    [
      "A: 先に 集合 する こと に しました。",
      "B: 何時 に します か。",
      "A: 夜7時 に しましょう。"
    ],
    [
      "A: 雨 の とき は 中止 に なる こと に なって います。",
      "B: じゃあ、天気 を 見て から 行きます か。",
      "A: はい、そう しましょう。"
    ],
    [
      "A: 屋台 で 食べたり、音楽 を きいたり します。",
      "B: それから 花火 も 見ます か。",
      "A: はい、見ます。"
    ],
    [
      "A: 夜 おそく ならない ように、十時 ごろ に 帰りましょう。",
      "B: はい、分かりました。",
      "A: では、楽しい 夜 に しましょう。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables)
  kanji10: [
    {
      ch: "祭",
      kun: ["まつ(り)","まつ(る)"],
      on: ["さい"],
      es: "festival",
      trazos: 11,
      strokeCode: "796d",
      ej: [
        { jp: "祭り", yomi: "まつり", es: "festival" },
        { jp: "夏祭り", yomi: "なつまつり", es: "festival de verano" }
      ]
    },
    {
      ch: "祝",
      kun: ["いわ(う)"],
      on: ["しゅく"],
      es: "celebrar",
      trazos: 9,
      strokeCode: "795d",
      ej: [
        { jp: "祝う", yomi: "いわう", es: "celebrar" },
        { jp: "祝日", yomi: "しゅくじつ", es: "día festivo" }
      ]
    },
    {
      ch: "楽",
      kun: ["たの(しい)","たの(しむ)"],
      on: ["がく","らく"],
      es: "diversión; música",
      trazos: 13,
      strokeCode: "697d",
      ej: [
        { jp: "楽しい", yomi: "たのしい", es: "divertido" },
        { jp: "音楽", yomi: "おんがく", es: "música" }
      ]
    },
    {
      ch: "夏",
      kun: ["なつ"],
      on: ["か"],
      es: "verano",
      trazos: 10,
      strokeCode: "590f",
      ej: [
        { jp: "夏", yomi: "なつ", es: "verano" },
        { jp: "夏祭り", yomi: "なつまつり", es: "festival de verano" }
      ]
    },
    {
      ch: "花",
      kun: ["はな"],
      on: ["か"],
      es: "flor",
      trazos: 7,
      strokeCode: "82b1",
      ej: [
        { jp: "花", yomi: "はな", es: "flor" },
        { jp: "花火", yomi: "はなび", es: "fuegos artificiales" }
      ]
    },
    {
      ch: "夜",
      kun: ["よる"],
      on: ["や"],
      es: "noche",
      trazos: 8,
      strokeCode: "591c",
      ej: [
        { jp: "夜", yomi: "よる", es: "noche" },
        { jp: "今夜", yomi: "こんや", es: "esta noche" }
      ]
    },
    {
      ch: "音",
      kun: ["おと"],
      on: ["おん"],
      es: "sonido",
      trazos: 9,
      strokeCode: "97f3",
      ej: [
        { jp: "音", yomi: "おと", es: "sonido" },
        { jp: "音楽", yomi: "おんがく", es: "música" }
      ]
    },
    {
      ch: "歌",
      kun: ["うた","うた(う)"],
      on: ["か"],
      es: "canción; cantar",
      trazos: 14,
      strokeCode: "6b4c",
      ej: [
        { jp: "歌", yomi: "うた", es: "canción" },
        { jp: "歌う", yomi: "うたう", es: "cantar" }
      ]
    },
    {
      ch: "写",
      kun: ["うつ(す)","うつ(る)"],
      on: ["しゃ"],
      es: "copiar; fotografiar",
      trazos: 5,
      strokeCode: "5199",
      ej: [
        { jp: "写す", yomi: "うつす", es: "copiar; fotografiar" },
        { jp: "写真", yomi: "しゃしん", es: "fotografía" }
      ]
    },
    {
      ch: "真",
      kun: ["ま","まこと"],
      on: ["しん"],
      es: "verdad; real; puro",
      trazos: 10,
      strokeCode: "771f",
      ej: [
        { jp: "真ん中", yomi: "まんなか", es: "centro" },
        { jp: "写真", yomi: "しゃしん", es: "fotografía" }
      ]
    },
  ],
};

export default TEMA_19;
