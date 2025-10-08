// src/content/n4/20.ts
import type { ThemeContent } from "../types";

// Tema 20 — Causas y consecuencias: 「〜ために」「〜ので」「〜のに」
export const TEMA_20: ThemeContent = {
  id: 20,
  nivel: "N4",
  titulo: "Causas y consecuencias – 「〜ために」「〜ので」「〜のに」",

  objetivos: [
    "Expresar propósito con 〜ために（para…; con V diccionario / N の）.",
    "Explicar causa/razón con 〜ので（porque…; tono suave/objetivo）.",
    "Contraste inesperado con 〜のに（aunque…）.",
    "Distinguir ために（propósito） vs ために（causa） y su traducción.",
    "Usar conectores simples para causa/resultado（だから・そのため）.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "ために",        romaji: "tame ni",        es: "para; a causa de" },
    { key: "vc02", jp: "ので",          romaji: "node",           es: "porque; dado que (suave)" },
    { key: "vc03", jp: "のに",          romaji: "noni",           es: "aunque; a pesar de" },
    { key: "vc04", jp: "理由",          romaji: "riyū",           es: "razón, motivo" },
    { key: "vc05", jp: "結果",          romaji: "kekka",          es: "resultado" },
    { key: "vc06", jp: "必要",          romaji: "hitsuyō",        es: "necesario" },
    { key: "vc07", jp: "便利",          romaji: "benri",          es: "conveniente" },
    { key: "vc08", jp: "不便",          romaji: "fuben",          es: "inconveniente" },
    { key: "vc09", jp: "注意",          romaji: "chūi",           es: "cuidado, atención" },
    { key: "vc10", jp: "困る",          romaji: "komaru",         es: "tener problemas" },
    { key: "vc11", jp: "速い",          romaji: "hayai",          es: "rápido (veloz)" },
    { key: "vc12", jp: "だから",        romaji: "dakara",         es: "por eso" },
    { key: "vc13", jp: "そのため",      romaji: "sono tame",      es: "por eso/por lo cual" },
    { key: "vc14", jp: "目的",          romaji: "mokuteki",       es: "propósito (usa en kana si prefieres)" },
    { key: "vc15", jp: "原因",          romaji: "gen'in",         es: "causa" },
    { key: "vc16", jp: "準備（する）",  romaji: "junbi (suru)",   es: "preparación / preparar" },
    { key: "vc17", jp: "利用（する）",  romaji: "riyō (suru)",    es: "uso / usar (puedes escribir en kana)" },
    { key: "vc18", jp: "必要な書類",    romaji: "hitsuyō na shorui", es: "documentos necesarios" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "にほんご を 上手 に なる ために、毎日 れんしゅう します。",
      romaji: "nihongo o jōzu ni naru tame ni, mainichi renshū shimasu.",
      es: "Para mejorar en japonés, practico cada día.",
      exp: "Propósito：V(辞書形)+ために（sujeto = quien hace la acción）"
    },
    {
      key: "ex02",
      jp: "雨 なので、イベント は 中止 です。",
      romaji: "ame na no de, ibento wa chūshi desu.",
      es: "Como llueve, el evento se cancela.",
      exp: "Razón suave/objetiva：Aな/N + なので ; V/Aい + ので"
    },
    {
      key: "ex03",
      jp: "早く 出た のに、電車 に おくれました。",
      romaji: "hayaku deta noni, densha ni okuremashita.",
      es: "Aunque salí temprano, perdí el tren.",
      exp: "Contraste inesperado：〜のに（A pasa ‘aunque’ B）"
    },
    {
      key: "ex04",
      jp: "試験 の ために、図書館 を りよう します。",
      romaji: "shiken no tame ni, toshokan o riyō shimasu.",
      es: "Para el examen, uso la biblioteca.",
      exp: "N の ために（para N）"
    },
    {
      key: "ex05",
      jp: "事故 の ために、道 が こんで います。",
      romaji: "jiko no tame ni, michi ga konde imasu.",
      es: "Por un accidente, la calle está congestionada.",
      exp: "Causa：N の ために（resultado negativo a menudo）"
    },
    {
      key: "ex06",
      jp: "大雨 だった ので、外出 しません でした。",
      romaji: "ōame datta no de, gaishutsu shimasen deshita.",
      es: "Como hubo lluvia fuerte, no salí.",
      exp: "Pasado + ので（datta／だった）."
    },
  ],

  gramatica: {
    titulo: "Causa, propósito y contraste：〜ために／〜ので／〜のに",
    puntos: [
      {
        key: "g01",
        regla: "① 〜ために（PARA / A CAUSA DE）",
        pasoapaso: [
          "A) Propósito（meta): V(辞書形)+ために；N の ために。",
          "   → ‘para…’. Sujeto normalmente es el mismo en ambas partes.",
          "B) Causa（motivo): [V/A/N] + ために。",
          "   → ‘a causa de…’. A menudo resultado negativo / fuera de control.",
          "C) Traducción: distingue ‘para (propósito)’ VS ‘por (causa)’.",
        ],
        ejemploJP: "合格 する ために、毎日 勉強 します。",
        ejemploRoma: "gōkaku suru tame ni, mainichi benkyō shimasu.",
        ejemploES: "Para aprobar, estudio cada día.",
        tabla: {
          title: "Cómo se une 〜ために",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo (propósito)", "V(辞書形)+ために", "走る ために 早く 起きる。", "hashiru tame ni hayaku okiru.", "Me levanto temprano para correr."],
            ["Nombre (propósito)", "N の ために", "試験 の ために 休む。", "shiken no tame ni yasumu.", "Descanso para el examen."],
            ["Verbo (causa)", "V(普通形)+ために", "雨 が 降った ために 中止 した。", "ame ga futta tame ni chūshi shita.", "A causa de la lluvia se canceló."],
            ["Aい (causa)", "Aい + ために", "遠い ために 行けない。", "tōi tame ni ikenai.", "Porque está lejos, no puedo ir."],
            ["Aな (causa)", "Aな + ために", "不便 な ために 困る。", "fuben na tame ni komaru.", "Por ser inconveniente, tengo problemas."],
            ["Nombre (causa)", "N の ために", "事故 の ために 遅れた。", "jiko no tame ni okureta.", "Por el accidente, me retrasé."],
          ],
          note: "Propósito: sujeto igual. Si cambia, usa N の ために（‘en beneficio de…’）."
        },
        ejemplos: [
          { jp: "健康 に なる ために、歩きます。", roma: "kenkō ni naru tame ni, arukimasu.", es: "Para estar sano, camino." },
          { jp: "雨 の ために 試合 は 中止 です。", roma: "ame no tame ni shiai wa chūshi desu.", es: "Por la lluvia, el partido está cancelado." },
          { jp: "家族 の ために 料理 を します。", roma: "kazoku no tame ni ryōri o shimasu.", es: "Cocino por/para mi familia." },
        ],
      },

      {
        key: "g02",
        regla: "② 〜ので（porque… / dado que…）",
        pasoapaso: [
          "1) Razón ‘suave/objetiva’. Educado, suena menos directo que から.",
          "2) Forma: V/Aい → 普通形 + ので；Aな／N → なので。",
          "3) Pasado: だった ので；Negativo: ない ので。",
          "4) ので a menudo va con estilo cortés en la principal.",
        ],
        ejemploJP: "忙しい ので、あとで 連絡 します。",
        ejemploRoma: "isogashii no de, ato de renraku shimasu.",
        ejemploES: "Como estoy ocupado, te contacto después.",
        tabla: {
          title: "Cómo se une 〜ので",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo", "V(普通形)+ので", "行けない ので 電話 します。", "ikenai no de denwa shimasu.", "Como no puedo ir, llamo."],
            ["Aい", "Aい + ので", "寒い ので 中に 入ります。", "samui no de naka ni hairimasu.", "Como hace frío, entro."],
            ["Aな", "Aな + ので", "便利 な ので よく 使います。", "benri na no de yoku tsukaimasu.", "Como es conveniente, lo uso mucho."],
            ["Nombre", "N + なので", "雨 なので 家 に います。", "ame na no de ie ni imasu.", "Como llueve, me quedo en casa."],
          ],
          note: "Comparado con から：‘node’ es más amable/objetivo."
        },
        ejemplos: [
          { jp: "必要 なので 注文 します。", roma: "hitsuyō na no de chūmon shimasu.", es: "Como es necesario, haré el pedido." },
          { jp: "人 が 多い ので、早く 行きます。", roma: "hito ga ōi no de, hayaku ikimasu.", es: "Como hay mucha gente, voy temprano." },
          { jp: "天気 が よく ない ので、部屋 で 休みます。", roma: "tenki ga yoku nai no de, heya de yasumimasu.", es: "Como el clima no está bien, descanso en la habitación." },
        ],
      },

      {
        key: "g03",
        regla: "③ 〜のに（aunque… / a pesar de…）",
        pasoapaso: [
          "1) A のに B：B contradice lo esperado por A.",
          "2) Forma: V/Aい → 普通形 + のに；Aな／N → なのに。",
          "3) Matiz emocional (sorpresa, queja suave). No pidas permiso con のに.",
          "4) Traducción: ‘aunque’, ‘a pesar de que’.",
        ],
        ejemploJP: "安い のに、便利 です。",
        ejemploRoma: "yasui noni, benri desu.",
        ejemploES: "Aunque es barato, es conveniente.",
        tabla: {
          title: "Cómo se une 〜のに",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo", "V(普通形)+のに", "早く 出た のに おくれた。", "hayaku deta noni okureta.", "Aunque salí temprano, llegué tarde."],
            ["Aい", "Aい + のに", "近い のに 行かない。", "chikai noni ikanai.", "Aunque está cerca, no voy."],
            ["Aな", "Aな + のに", "静か な のに 眠れない。", "shizuka na noni nemurenai.", "Aunque es silencioso, no puedo dormir."],
            ["Nombre", "N + なのに", "雨 なのに 出かける。", "ame na noni dekakeru.", "Aunque llueve, salgo."],
          ],
          note: "No uses のに para pedir algo: suena quejoso/culpable."
        },
        ejemplos: [
          { jp: "高い のに 売れます。", roma: "takai noni uremasu.", es: "Aunque es caro, se vende." },
          { jp: "元気 な のに 顔色 が よく ない。", roma: "genki na noni kaoiro ga yoku nai.", es: "Aunque está bien, no tiene buen color de cara." },
          { jp: "練習 した のに うまく できなかった。", roma: "renshū shita noni umaku dekinakatta.", es: "Aunque practiqué, no salió bien." },
        ],
      },

      {
        key: "g04",
        regla: "④ Mini contraste：ために（原因） vs ので vs のに",
        pasoapaso: [
          "ために（原因）→ foco en ‘por culpa de/por causa de’（resultado, a veces negativo).",
          "ので → razón objetiva/suave（decir hechos).",
          "のに → contraste inesperado（sorpresa/queja).",
          "Truco: si puedes decir ‘por eso’, piensa en ために/ので; si puedes decir ‘aunque’, usa のに.",
        ],
        ejemploJP: "雨 の ために 中止。／雨 なので 中止。／雨 なのに 出発。",
        ejemploRoma: "ame no tame ni chūshi. / ame na no de chūshi. / ame na noni shuppatsu.",
        ejemploES: "Por la lluvia, cancelado. / Como llueve, se cancela. / Aunque llueve, salimos.",
      },
    ],
  },

  // 7 diálogos (kana/kanji/es)
  dialogos: [
    {
      title: "目的のために",
      kana: [
        "合格 する ために、毎日 れんしゅう します。",
        "いい ですね。必要 な ところ を 重点 に しましょう。",
        "はい、先生。"
      ],
      kanji: [
        "合格 する ために、毎日 練習 します。",
        "いい ですね。必要 な ところ を 重点 に しましょう。",
        "はい、先生。"
      ],
      es: [
        "Para aprobar, practico cada día.",
        "Bien. Centrémonos en lo necesario.",
        "Sí, profe."
      ]
    },
    {
      title: "便利なのに",
      kana: [
        "この アプリ は 安い のに とても べんり です。",
        "そう ですね。よく りよう して います。",
        "わたし も です。"
      ],
      kanji: [
        "この アプリ は 安い のに とても 便利 です。",
        "そう ですね。よく 利用 して います。",
        "私 も です。"
      ],
      es: [
        "Esta app, aunque es barata, es muy práctica.",
        "Sí. La uso mucho.",
        "Yo también."
      ]
    },
    {
      title: "雨なので",
      kana: [
        "雨 なので、出発 を おくらせます。",
        "わかりました。注意 して 行きましょう。",
        "はい。"
      ],
      kanji: [
        "雨 なので、出発 を 遅らせます。",
        "わかりました。注意 して 行きましょう。",
        "はい。"
      ],
      es: [
        "Como llueve, retrasamos la salida.",
        "Entendido. Vayamos con cuidado.",
        "De acuerdo."
      ]
    },
    {
      title: "事故のために",
      kana: [
        "事故 の ために、道 が こんで います。",
        "そう です か。速い ほう を 選びましょう。",
        "はい。"
      ],
      kanji: [
        "事故 の ために、道 が 混んで います。",
        "そう です か。速い 方 を 選びましょう。",
        "はい。"
      ],
      es: [
        "Por un accidente, la calle está congestionada.",
        "¿Ah, sí? Elijamos la vía más rápida.",
        "Vale."
      ]
    },
    {
      title: "家族のために",
      kana: [
        "家族 の ために、早く かえります。",
        "いい と 思います。",
        "ありがとうございます。"
      ],
      kanji: [
        "家族 の ために、早く 帰ります。",
        "いい と 思います。",
        "ありがとうございます。"
      ],
      es: [
        "Por mi familia, vuelvo temprano.",
        "Me parece bien.",
        "Gracias."
      ]
    },
    {
      title: "不便で困る",
      kana: [
        "バス が 少ない ために、不便 で 困ります。",
        "そう ですね。自転車 を 使う の は どう です か。",
        "考えて みます。"
      ],
      kanji: [
        "バス が 少ない ために、不便 で 困ります。",
        "そう ですね。自転車 を 使う の は どう です か。",
        "考えて みます。"
      ],
      es: [
        "Como hay pocos buses, es incómodo y me causa problemas.",
        "Sí. ¿Qué tal usar bicicleta?",
        "Lo pensaré."
      ]
    },
    {
      title: "のにの例",
      kana: [
        "早く 出た のに、間に合いません でした。",
        "次回 は、速い ルート を えらびましょう。",
        "はい、そう します。"
      ],
      kanji: [
        "早く 出た のに、間に合いません でした。",
        "次回 は、速い ルート を 選びましょう。",
        "はい、そう します。"
      ],
      es: [
        "Aunque salí temprano, no llegué a tiempo.",
        "La próxima escojamos una ruta más rápida.",
        "Sí, haré eso."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar (aptos para OrderDialogCard)
  quizSets: [
    [
      "A: 合格 する ために、計画 を 作りました。",
      "B: いいですね。毎日 少しずつ やりましょう。",
      "A: はい。"
    ],
    [
      "A: 雨 なので、屋外 の イベント は 中止 です。",
      "B: そのため、予定 を 変えます。",
      "A: わかりました。"
    ],
    [
      "A: 早く 出た のに、道 が 混んで いました。",
      "B: そう です か。速い ルート に しましょう。",
      "A: はい。"
    ],
    [
      "A: 家族 の ために、夕ごはん を 作ります。",
      "B: すてき ですね。必要 な もの は あります か。",
      "A: 少し あります。"
    ],
    [
      "A: 不便 な ので、新しい バス 時刻表 を 作ります。",
      "B: そのため アプリ を 直します。",
      "A: お願い します。"
    ],
    [
      "A: 注意 した のに、失敗 しました。",
      "B: 大丈夫 です。結果 を 見て 直しましょう。",
      "A: はい、お願いします。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables)
  kanji10: [
    {
      ch: "要",
      kun: ["い(る)"],
      on: ["よう"],
      es: "necesitar; punto clave",
      trazos: 9,
      strokeCode: "8981",
      ej: [
        { jp: "必要", yomi: "ひつよう", es: "necesario" },
        { jp: "要る", yomi: "いる", es: "necesitar" }
      ]
    },
    {
      ch: "必",
      kun: [],
      on: ["ひつ"],
      es: "indispensable",
      trazos: 5,
      strokeCode: "5fc5",
      ej: [
        { jp: "必要", yomi: "ひつよう", es: "necesario" },
        { jp: "必ず", yomi: "かならず", es: "sin falta" }
      ]
    },
    {
      ch: "便",
      kun: [],
      on: ["べん","びん"],
      es: "conveniencia; correo",
      trazos: 9,
      strokeCode: "4fbf",
      ej: [
        { jp: "便利", yomi: "べんり", es: "conveniente" },
        { jp: "便", yomi: "びん", es: "servicio/correo" }
      ]
    },
    {
      ch: "利",
      kun: [],
      on: ["り"],
      es: "beneficio; ventaja",
      trazos: 7,
      strokeCode: "5229",
      ej: [
        { jp: "便利", yomi: "べんり", es: "conveniente" },
        { jp: "利用", yomi: "りよう", es: "uso, utilizar" }
      ]
    },
    {
      ch: "不",
      kun: [],
      on: ["ふ"],
      es: "no-; in-",
      trazos: 4,
      strokeCode: "4e0d",
      ej: [
        { jp: "不便", yomi: "ふべん", es: "inconveniente" },
        { jp: "不安", yomi: "ふあん", es: "inquietud" }
      ]
    },
    {
      ch: "注",
      kun: ["そそ(ぐ)"],
      on: ["ちゅう"],
      es: "verter; notar",
      trazos: 8,
      strokeCode: "6ce8",
      ej: [
        { jp: "注意", yomi: "ちゅうい", es: "cuidado, atención" },
        { jp: "注文", yomi: "ちゅうもん", es: "pedido" }
      ]
    },
    {
      ch: "困",
      kun: ["こま(る)"],
      on: ["こん"],
      es: "dificultad",
      trazos: 7,
      strokeCode: "56f0",
      ej: [
        { jp: "困る", yomi: "こまる", es: "estar en problema" },
        { jp: "困難", yomi: "こんなん", es: "dificultad (avanzado)" }
      ]
    },
    {
      ch: "結",
      kun: ["むす(ぶ)"],
      on: ["けつ"],
      es: "atar; concluir",
      trazos: 12,
      strokeCode: "7d50",
      ej: [
        { jp: "結果", yomi: "けっか", es: "resultado" },
        { jp: "結ぶ", yomi: "むすぶ", es: "atar; unir" }
      ]
    },
    {
      ch: "果",
      kun: ["は(たす)","は(てる)"],
      on: ["か"],
      es: "fruto; resultar",
      trazos: 8,
      strokeCode: "679c",
      ej: [
        { jp: "結果", yomi: "けっか", es: "resultado" },
        { jp: "果たす", yomi: "はたす", es: "cumplir" }
      ]
    },
    {
      ch: "速",
      kun: ["はや(い)","はや(める)"],
      on: ["そく"],
      es: "rápido; velocidad",
      trazos: 10,
      strokeCode: "901f",
      ej: [
        { jp: "速い", yomi: "はやい", es: "rápido" },
        { jp: "速度", yomi: "そくど", es: "velocidad" }
      ]
    },
  ],
};

export default TEMA_20;
