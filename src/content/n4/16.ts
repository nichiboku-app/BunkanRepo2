// src/content/n4/16.ts
import type { ThemeContent } from "../types";

// Tema 16 — Deseos y esperanzas: 「〜たい」「〜てほしい」「〜と思う」
export const TEMA_16: ThemeContent = {
  id: 16,
  nivel: "N4",
  titulo: "Deseos y esperanzas – 「〜たい」「〜てほしい」「〜と思う」",

  objetivos: [
    "Decir lo que quieres hacer con 〜たい (forma -masu + たい).",
    "Pedir que alguien haga algo con 〜てほしい（Nに + Vて + ほしい）.",
    "Suavizar y expresar deseo/plan con 〜たいと思う／〜てほしいと思う／〜と思う.",
    "Usar negación: 〜たくない（no querer）／〜ないでほしい（no quiero que…）.",
    "Entender el matiz de tercera persona: 〜たがっています（parece que quiere）.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "願う",      romaji: "negau",          es: "desear, pedir" },
    { key: "vc02", jp: "希望",      romaji: "kibō",           es: "esperanza, deseo" },
    { key: "vc03", jp: "夢",        romaji: "yume",           es: "sueño (sueño/meta)" },
    { key: "vc04", jp: "計画",      romaji: "keikaku",        es: "plan" },
    { key: "vc05", jp: "努力",      romaji: "doryoku",        es: "esfuerzo" },
    { key: "vc06", jp: "続ける",    romaji: "tsuzukeru",      es: "continuar (trans.)" },
    { key: "vc07", jp: "練習",      romaji: "renshū",         es: "práctica" },
    { key: "vc08", jp: "成長",      romaji: "seichō",         es: "crecimiento" },
    { key: "vc09", jp: "勉強",      romaji: "benkyō",         es: "estudio" },
    { key: "vc10", jp: "強くなる",  romaji: "tsuyoku naru",   es: "hacerse fuerte" },
    { key: "vc11", jp: "弱い",      romaji: "yowai",          es: "débil" },
    { key: "vc12", jp: "楽しい",    romaji: "tanoshii",       es: "divertido" },
    { key: "vc13", jp: "楽しむ",    romaji: "tanoshimu",      es: "disfrutar" },
    { key: "vc14", jp: "お願い",    romaji: "onegai",         es: "petición, favor" },
    { key: "vc15", jp: "手伝う",    romaji: "tetsudau",       es: "ayudar" },
    { key: "vc16", jp: "準備",      romaji: "junbi",          es: "preparación" },
    { key: "vc17", jp: "成功",      romaji: "seikō",          es: "éxito" },
  ],

  // 6 modelos (jp / romaji / es / exp)
  oraciones6: [
    {
      key: "ex01",
      jp: "日本に 行きたい です。",
      romaji: "nihon ni ikitai desu.",
      es: "Quiero ir a Japón.",
      exp: "V-ます → quita ます → + たい（形）."
    },
    {
      key: "ex02",
      jp: "この しゅくだい を 手伝って ほしい です。",
      romaji: "kono shukudai o tetsudatte hoshii desu.",
      es: "Quiero que me ayudes con esta tarea.",
      exp: "N（persona）に + Vて + ほしい. Aquí el ‘ni’ se omite por contexto."
    },
    {
      key: "ex03",
      jp: "来年も 日本語を つづけたい と 思います。",
      romaji: "rainen mo nihongo o tsuzuketai to omoimasu.",
      es: "Creo que quiero seguir con japonés el próximo año.",
      exp: "〜たい + と思う：deseo/plan más suave y educado."
    },
    {
      key: "ex04",
      jp: "学校では しずかに して ほしい です。",
      romaji: "gakkō de wa shizuka ni shite hoshii desu.",
      es: "Quiero que en la escuela estén en silencio.",
      exp: "Comportamiento deseado para otros：〜てほしい."
    },
    {
      key: "ex05",
      jp: "今日は 勉強 したくない です。",
      romaji: "kyō wa benkyō shitakunai desu.",
      es: "Hoy no quiero estudiar.",
      exp: "Negativo：〜たくない."
    },
    {
      key: "ex06",
      jp: "夜は メッセージ を おくらないで ほしい です。",
      romaji: "yoru wa messeeji o okuranaide hoshii desu.",
      es: "Por la noche no quiero que envíes mensajes.",
      exp: "Negativo para otros：Vないで ほしい."
    },
  ],

  // Gramática — “como en primaria”: tablas + 4 ejemplos por punto
  gramatica: {
    titulo: "Desear y esperar: 〜たい／〜てほしい／〜と思う",
    puntos: [
      // ① 〜たい
      {
        key: "g01",
        regla: "① 〜たい（quiero hacer…）",
        pasoapaso: [
          "1) Toma el verbo en -ます（ます形）.",
          "2) Quita ます → queda la base: 行きます → 行き.",
          "3) Añade たい：行きたい → ‘quiero ir’.",
          "4) Negativo：〜たくない／Pasado：〜たかった／Pasado neg.：〜たくなかった.",
          "※ Objeto suele marcarse con が (deseo de algo) o を (acción): 水が飲みたい／本を読みたい."
        ],
        ejemploJP: "映画を 見たい です。",
        ejemploRoma: "eiga o mitai desu.",
        ejemploES: "Quiero ver una película.",
        tabla: {
          title: "Conjugación básica de 〜たい",
          headers: ["Forma", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Afirm.", "Vます→Vたい", "日本に 行きたい です。", "nihon ni ikitai desu.", "Quiero ir a Japón."],
            ["Neg.", "Vたくない", "今日は 勉強 したくない。", "kyō wa benkyō shitakunai.", "Hoy no quiero estudiar."],
            ["Pasado", "Vたかった", "子どものころ 医者に なりたかった。", "kodomo no koro isha ni naritakatta.", "De niño quería ser médico."],
            ["3ª pers.", "Vたがっています", "かれは 日本へ 行きたがっています。", "kare wa nihon e ikitagatte imasu.", "Parece que él quiere ir a Japón."],
          ],
          note: "3ª persona: usa 〜たがっています para ‘parece que quiere’ (observación)."
        },
        ejemplos: [
          { jp: "休みに 海で 泳ぎたい です。", roma: "yasumi ni umi de oyogitai desu.", es: "En vacaciones quiero nadar en el mar." },
          { jp: "新しい 本が 読みたい。", roma: "atarashii hon ga yomitai.", es: "Quiero leer un libro nuevo." },
          { jp: "もっと 練習 したい と 思います。", roma: "motto renshū shitai to omoimasu.", es: "Creo que quiero practicar más." },
          { jp: "今日は 外で 食べたくない です。", roma: "kyō wa soto de tabetakunai desu.", es: "Hoy no quiero comer fuera." },
        ],
      },

      // ② 〜てほしい
      {
        key: "g02",
        regla: "② 〜てほしい（quiero que hagas…）",
        pasoapaso: [
          "1) Sujeto (quien hace la acción) + に.",
          "2) Verbo en forma て + ほしい（です）.",
          "3) Negativo: Vないで ほしい（no quiero que…）.",
          "4) Suave/cortés: 〜ていただきたい（más formal; no obligatorio aquí）."
        ],
        ejemploJP: "あなたに 手伝って ほしい です。",
        ejemploRoma: "anata ni tetsudatte hoshii desu.",
        ejemploES: "Quiero que tú ayudes.",
        tabla: {
          title: "Patrones de 〜てほしい",
          headers: ["Tipo", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Pedir acción", "Nに Vて ほしい", "先生に 説明して ほしい。", "sensei ni setsumei shite hoshii.", "Quiero que el profesor explique."],
            ["Pedir general", "Vて ほしい（人省略）", "静かに して ほしい です。", "shizuka ni shite hoshii desu.", "Quiero que estén en silencio."],
            ["Negar acción", "Nに Vないで ほしい", "夜に メールしないで ほしい。", "yoru ni mēru shinai de hoshii.", "No quiero que envíes mails por la noche."],
          ],
          note: "Quien quieres que actúe va con に. Si es obvio, puede omitirse."
        },
        ejemplos: [
          { jp: "友だちに いっしょに 勉強して ほしい。", roma: "tomodachi ni issho ni benkyō shite hoshii.", es: "Quiero que mi amigo estudie conmigo." },
          { jp: "ここでは 静かに して ほしい です。", roma: "koko de wa shizuka ni shite hoshii desu.", es: "Aquí quiero que estén en silencio." },
          { jp: "今日は 遅れないで ほしい。", roma: "kyō wa okurenaide hoshii.", es: "Hoy no quiero que llegues tarde." },
          { jp: "先生に 宿題を 見て ほしい と 思います。", roma: "sensei ni shukudai o mite hoshii to omoimasu.", es: "Creo que quiero que el profe revise la tarea." },
        ],
      },

      // ③ 〜と思う（para deseo/plan/esperanza）
      {
        key: "g03",
        regla: "③ 〜と思う（pienso/creo que…）",
        pasoapaso: [
          "1) A + と 思う：‘Creo que A’.",
          "2) 〜たい + と思う：‘Creo que quiero…’ (suave, plan).",
          "3) 〜てほしい + と思う：‘Creo que quiero que…’ (suave).",
          "4) Pasado/negación siguen reglas normales antes de と."
        ],
        ejemploJP: "来年 留学したい と 思います。",
        ejemploRoma: "rainen ryūgaku shitai to omoimasu.",
        ejemploES: "Creo que quiero estudiar fuera el próximo año.",
        tabla: {
          title: "Usos frecuentes con 〜と思う",
          headers: ["Uso", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Opinión simple", "A と 思う", "この 計画は いい と 思います。", "kono keikaku wa ii to omoimasu.", "Creo que este plan es bueno."],
            ["Deseo propio", "Vたい と 思う", "もっと 練習したい と 思う。", "motto renshū shitai to omou.", "Creo que quiero practicar más."],
            ["Deseo a otros", "Nに Vて ほしい と 思う", "子どもに 夢を もって ほしい と 思います。", "kodomo ni yume o motte hoshii to omoimasu.", "Creo que quiero que los niños tengan sueños."],
          ],
          note: "〜と思います suena más educado y suave que decirlo directo."
        },
        ejemplos: [
          { jp: "これから も 日本語を 続けたい と 思います。", roma: "korekara mo nihongo o tsuzuketai to omoimasu.", es: "Creo que quiero seguir estudiando japonés." },
          { jp: "毎日 少しずつ 練習しよう と 思う。", roma: "mainichi sukoshi zutsu renshū shiyō to omou.", es: "Creo que practicaré un poco cada día." },
          { jp: "友だちに もっと 話して ほしい と 思います。", roma: "tomodachi ni motto hanashite hoshii to omoimasu.", es: "Creo que quiero que mis amigos hablen más." },
          { jp: "楽しく 勉強できる と 思います。", roma: "tanoshiku benkyō dekiru to omoimasu.", es: "Creo que puedo estudiar de forma divertida." },
        ],
      },
    ],
  },

  // 7 diálogos (kana/kanji/es con mismas líneas; usa kanji vistos y de este tema)
  dialogos: [
    {
      title: "行きたい",
      kana: [
        "らいねん 日本に いきたい と おもいます。",
        "いい ですね。どこ に いきたい です か。",
        "きょうと に いきたい です。"
      ],
      kanji: [
        "来年 日本に 行きたい と 思います。",
        "いい ですね。どこ に 行きたい です か。",
        "京都 に 行きたい です。"
      ],
      es: [
        "Creo que quiero ir a Japón el próximo año.",
        "Qué bien. ¿A dónde quieres ir?",
        "Quiero ir a Kioto."
      ]
    },
    {
      title: "てつだってほしい",
      kana: [
        "しゅくだい を てつだって ほしい です。",
        "いい よ。どこ から はじめる？",
        "この もんだい を みて ほしい。"
      ],
      kanji: [
        "宿題 を 手伝って ほしい です。",
        "いい よ。どこ から 始める？",
        "この 問題 を 見て ほしい。"
      ],
      es: [
        "Quiero que me ayudes con la tarea.",
        "Vale. ¿Por dónde empezamos?",
        "Quiero que veas este ejercicio."
      ]
    },
    {
      title: "たくない日",
      kana: [
        "きょう は べんきょう したくない。",
        "じゃあ、すこし だけ れんしゅう しよう と おもう。",
        "それ なら できる！"
      ],
      kanji: [
        "今日は 勉強 したくない。",
        "じゃあ、少し だけ 練習 しよう と 思う。",
        "それ なら できる！"
      ],
      es: [
        "Hoy no quiero estudiar.",
        "Entonces creo que practicaré solo un poco.",
        "¡Así sí puedo!"
      ]
    },
    {
      title: "ねがい",
      kana: [
        "こども に ゆめ を もって ほしい と おもいます。",
        "わたし も そう おもいます。たのしく まなべる と いい ですね。",
        "うん。"
      ],
      kanji: [
        "子ども に 夢 を もって ほしい と 思います。",
        "私 も そう 思います。楽しく 学べる と いい ですね。",
        "うん。"
      ],
      es: [
        "Creo que quiero que los niños tengan sueños.",
        "Yo también. Ojalá puedan aprender de forma divertida.",
        "Sí."
      ]
    },
    {
      title: "つづけたい",
      kana: [
        "これから も にほんご を つづけたい と おもいます。",
        "どうして？",
        "たのしい から です。"
      ],
      kanji: [
        "これから も 日本語 を 続けたい と 思います。",
        "どうして？",
        "楽しい から です。"
      ],
      es: [
        "Creo que quiero seguir con el japonés a partir de ahora.",
        "¿Por qué?",
        "Porque es divertido."
      ]
    },
    {
      title: "おねがい",
      kana: [
        "よる は メッセージ を おくらないで ほしい。",
        "わかった。ごめん ね。",
        "ありがとう。"
      ],
      kanji: [
        "夜 は メッセージ を 送らないで ほしい。",
        "わかった。ごめん ね。",
        "ありがとう。"
      ],
      es: [
        "Por la noche no quiero que envíes mensajes.",
        "Entendido. Perdón.",
        "Gracias."
      ]
    },
    {
      title: "たがっています",
      kana: [
        "かれ は りゅうがく したがって います。",
        "ほんとう？",
        "うん。まいにち べんきょう して いる よ。"
      ],
      kanji: [
        "彼 は 留学 したがって います。",
        "本当？",
        "うん。毎日 勉強 して いる よ。"
      ],
      es: [
        "Él parece que quiere estudiar en el extranjero.",
        "¿De verdad?",
        "Sí. Estudia todos los días."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar (aptos para OrderDialogCard)
  quizSets: [
    [
      "A: 日本に 行きたい と 思います。",
      "B: いい ですね。どこ に 行きたい です か。",
      "A: 京都 に 行きたい です。"
    ],
    [
      "A: 宿題 を 手伝って ほしい です。",
      "B: いい よ。どこ から 始める？",
      "A: この 問題 を 見て ほしい。"
    ],
    [
      "A: 今日は 勉強 したくない。",
      "B: じゃあ、少し だけ 練習 しよう と 思う。",
      "A: それ なら できる！"
    ],
    [
      "A: 夜 は メッセージ を 送らないで ほしい。",
      "B: わかった。ごめん ね。",
      "A: ありがとう。"
    ],
    [
      "A: これから も 日本語 を 続けたい と 思います。",
      "B: どうして？",
      "A: 楽しい から です。"
    ],
    [
      "A: 彼 は 留学 したがって います。",
      "B: 本当？",
      "A: 毎日 勉強 して いる よ。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — sin repetir los de 13–15
  kanji10: [
    {
      ch: "希",
      kun: [],
      on: ["き"],
      es: "esperanza (esperar algo)",
      trazos: 7,
      strokeCode: "5e0c",
      ej: [
        { jp: "希望", yomi: "きぼう", es: "esperanza, deseo" },
        { jp: "希少", yomi: "きしょう", es: "escaso, raro" }
      ]
    },
    {
      ch: "望",
      kun: ["のぞ(む)"],
      on: ["ぼう"],
      es: "desear, esperar",
      trazos: 11,
      strokeCode: "671b",
      ej: [
        { jp: "望む", yomi: "のぞむ", es: "desear" },
        { jp: "希望", yomi: "きぼう", es: "esperanza" }
      ]
    },
    {
      ch: "願",
      kun: ["ねが(う)"],
      on: ["がん"],
      es: "pedir, rogar",
      trazos: 19,
      strokeCode: "9858",
      ej: [
        { jp: "願う", yomi: "ねがう", es: "desear, pedir" },
        { jp: "願書", yomi: "がんしょ", es: "solicitud escrita" }
      ]
    },
    {
      ch: "夢",
      kun: ["ゆめ"],
      on: ["む"],
      es: "sueño (meta)",
      trazos: 13,
      strokeCode: "5922",
      ej: [
        { jp: "夢", yomi: "ゆめ", es: "sueño" },
        { jp: "夢中", yomi: "むちゅう", es: "absorto, fascinado" }
      ]
    },
    {
      ch: "楽",
      kun: ["たの(しい)","たの(しむ)"],
      on: ["らく","がく"],
      es: "diversión; cómodo; música",
      trazos: 13,
      strokeCode: "697d",
      ej: [
        { jp: "楽しい", yomi: "たのしい", es: "divertido" },
        { jp: "音楽", yomi: "おんがく", es: "música" }
      ]
    },
    {
      ch: "勉",
      kun: [],
      on: ["べん"],
      es: "esfuerzo, estudiar",
      trazos: 10,
      strokeCode: "52c9",
      ej: [
        { jp: "勉強", yomi: "べんきょう", es: "estudio" },
        { jp: "勤勉", yomi: "きんべん", es: "diligente" }
      ]
    },
    {
      ch: "強",
      kun: ["つよ(い)","つよ(める)","し(いる)"],
      on: ["きょう","ごう"],
      es: "fuerte; forzar",
      trazos: 11,
      strokeCode: "5f37",
      ej: [
        { jp: "強い", yomi: "つよい", es: "fuerte" },
        { jp: "勉強", yomi: "べんきょう", es: "estudio (literal: esforzarse fuerte)" }
      ]
    },
    {
      ch: "弱",
      kun: ["よわ(い)"],
      on: ["じゃく"],
      es: "débil",
      trazos: 10,
      strokeCode: "5f31",
      ej: [
        { jp: "弱い", yomi: "よわい", es: "débil" },
        { jp: "弱点", yomi: "じゃくてん", es: "punto débil" }
      ]
    },
    {
      ch: "続",
      kun: ["つづ(く)","つづ(ける)"],
      on: ["ぞく"],
      es: "continuar",
      trazos: 13,
      strokeCode: "7d9a",
      ej: [
        { jp: "続く", yomi: "つづく", es: "(algo) continúa" },
        { jp: "続ける", yomi: "つづける", es: "continuar (algo)" }
      ]
    },
    {
      ch: "成",
      kun: ["な(る)","な(す)"],
      on: ["せい","じょう"],
      es: "lograr, hacerse",
      trazos: 6,
      strokeCode: "6210",
      ej: [
        { jp: "成長", yomi: "せいちょう", es: "crecimiento" },
        { jp: "完成", yomi: "かんせい", es: "completación" }
      ]
    },
  ],
};

export default TEMA_16;
