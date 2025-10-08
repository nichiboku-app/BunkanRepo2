// src/content/n4/15.ts
import type { ThemeContent } from "../types";

// Tema 15 — Comparaciones y preferencias: 「〜より」「〜のほうが」
export const TEMA_15: ThemeContent = {
  id: 15,
  nivel: "N4",
  titulo: "Comparaciones y preferencias – 「〜より」「〜のほうが」",

  objetivos: [
    "Comparar dos elementos con 〜より y 〜のほうが.",
    "Expresar preferencia con A より B のほうが 〜 です.",
    "Usar comparaciones con sustantivos, adjetivos -い/-な y verbos (〜するより 〜するほうが).",
    "Hacer preguntas de comparación: A と B と どちら（のほう）が〜？",
    "Conectar comparación con razones simples para justificar la preferencia.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "比べる",    romaji: "kuraberu",     es: "comparar" },
    { key: "vc02", jp: "選ぶ",      romaji: "erabu",        es: "elegir" },
    { key: "vc03", jp: "高い",      romaji: "takai",        es: "alto, caro" },
    { key: "vc04", jp: "低い",      romaji: "hikui",        es: "bajo" },
    { key: "vc05", jp: "近い",      romaji: "chikai",       es: "cerca" },
    { key: "vc06", jp: "遠い",      romaji: "tooi",         es: "lejos" },
    { key: "vc07", jp: "速い",      romaji: "hayai",        es: "rápido (velocidad)" },
    { key: "vc08", jp: "遅い",      romaji: "osoi",         es: "lento, tarde" },
    { key: "vc09", jp: "方（〜のほう）", romaji: "hō (no hō)", es: "lado, ‘la parte de…’" },
    { key: "vc10", jp: "好き",      romaji: "suki",         es: "gustar, preferir" },
    { key: "vc11", jp: "色",        romaji: "iro",          es: "color" },
    { key: "vc12", jp: "味",        romaji: "aji",          es: "sabor" },
    { key: "vc13", jp: "質",        romaji: "shitsu",       es: "calidad" },
    { key: "vc14", jp: "量",        romaji: "ryō",          es: "cantidad" },
    { key: "vc15", jp: "速さ",      romaji: "hayasa",       es: "rapidez (sustantivo)" },
    { key: "vc16", jp: "遅さ",      romaji: "ososa",        es: "lentitud (sustantivo)" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "A より B の ほうが 高い です。",
      romaji: "A yori B no hō ga takai desu.",
      es: "B es más caro/alto que A.",
      exp: "Estructura básica: ‘B es más 〜 que A’."
    },
    {
      key: "ex02",
      jp: "バス より でんしゃ の ほうが 速い です。",
      romaji: "basu yori densha no hō ga hayai desu.",
      es: "El tren es más rápido que el autobús.",
      exp: "Sustantivo + より / Sustantivo + のほうが + adjetivo."
    },
    {
      key: "ex03",
      jp: "ホット と アイス と どちら の ほうが すき です か。",
      romaji: "hotto to aisu to dochira no hō ga suki desu ka.",
      es: "¿Cuál te gusta más, caliente o con hielo?",
      exp: "Pregunta de preferencia con どちら（のほう）."
    },
    {
      key: "ex04",
      jp: "A する より、B する ほうが いい です。",
      romaji: "A suru yori, B suru hō ga ii desu.",
      es: "Es mejor hacer B que hacer A.",
      exp: "Comparación con verbos (diccionario + ほうがいい)."
    },
    {
      key: "ex05",
      jp: "この しつ は たかい です が、あの しつ の ほうが いい と おもいます。",
      romaji: "kono shitsu wa takai desu ga, ano shitsu no hō ga ii to omoimasu.",
      es: "Esta calidad es alta, pero creo que aquella calidad es mejor.",
      exp: "Conectar comparación con と思います para una opinión suave."
    },
    {
      key: "ex06",
      jp: "きんじょ は べんり です。さらに、えき に 近い ので、ここ の ほうが すき です。",
      romaji: "kinjo wa benri desu. sarani, eki ni chikai node, koko no hō ga suki desu.",
      es: "El barrio es práctico. Además, como está cerca de la estación, me gusta más aquí.",
      exp: "Añadir motivo con ので + preferencia."
    },
  ],

  // Gramática
  gramatica: {
    titulo: "Comparar y preferir: 〜より／〜のほうが",
    puntos: [
      {
        key: "g01",
        titulo: "① A より B のほうが 〜（B es ‘más 〜’ que A）",
        jp: "A より B の ほうが 〜 です。",
        roma: "A yori B no hō ga 〜 desu.",
        es: "B es más 〜 que A.",
        exp: "『より』 marca el referente (lo que comparas). 『のほうが』 señala el lado ganador (más 〜).",
        tabla: {
          title: "Cómo unir con cada elemento",
          headers: ["Elemento", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Sustantivo", "N1 より N2 のほうが Aい", "バス より でんしゃ の ほうが 速い です。", "basu yori densha no hō ga hayai desu.", "El tren es más rápido que el autobús."],
            ["Adjetivo -い", "N1 より N2 のほうが Aい", "この 色 より あの 色 の ほうが 明るい です。", "kono iro yori ano iro no hō ga akarui desu.", "Ese color es más claro que este."],
            ["Adjetivo -な", "N1 より N2 のほうが Aな", "ここ より あそこ の ほうが べんり です。", "koko yori asoko no hō ga benri desu.", "Allá es más práctico que aquí."],
            ["Verbo（preferencia）", "A する より B する ほうが いい", "あるく より、はしる ほうが いい です。", "aruku yori, hashiru hō ga ii desu.", "Es mejor correr que caminar."],
          ],
          note: "『のほうが』 usa の para ‘lado/parte’. Con verbos: diccionario + ほうがいい."
        },
        ejemplos: [
          { jp: "この しつ より、あの しつ の ほうが すき です。", roma: "kono shitsu yori, ano shitsu no hō ga suki desu.", es: "Me gusta más aquella calidad que esta." },
          { jp: "むら より まち の ほうが にぎやか です。", roma: "mura yori machi no hō ga nigiyaka desu.", es: "La ciudad es más animada que el pueblo." },
          { jp: "ちかい みせ より、えき に 近い みせ の ほうが べんり です。", roma: "chikai mise yori, eki ni chikai mise no hō ga benri desu.", es: "Una tienda cerca de la estación es más práctica que una cercana (a casa, por ej.)." },
          { jp: "おそく ねる より、はやく ねる ほうが からだ に いい です。", roma: "osoku neru yori, hayaku neru hō ga karada ni ii desu.", es: "Es mejor para el cuerpo dormir temprano que dormir tarde." },
        ],
      },

      {
        key: "g02",
        titulo: "② B のほうが 〜（enfatizar solo el ganador）",
        jp: "（A と くらべて）B の ほうが 〜 です。",
        roma: "(A to kurabete) B no hō ga 〜 desu.",
        es: "B es más 〜 (que el otro).",
        exp: "Puedes omitir 『より』 si está claro el referente (contexto).",
        tabla: {
          title: "Combinaciones comunes",
          headers: ["Elemento", "Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Sustantivo", "B のほうが Aい", "この 量 より、こちら の ほうが 多い です。", "kono ryō yori, kochira no hō ga ōi desu.", "Aquí hay más cantidad que allí."],
            ["Adjetivo -い", "B のほうが Aい", "あの みち の ほうが 速い です。", "ano michi no hō ga hayai desu.", "Aquella ruta es más rápida."],
            ["Adjetivo -な", "B のほうが Aな", "こちら の ほうが しずか です。", "kochira no hō ga shizuka desu.", "Por aquí es más tranquilo."],
            ["Verbo（preferencia）", "B する ほうが いい", "たべる なら、さっぱり たべる ほうが いい です。", "taberu nara, sappari taberu hō ga ii desu.", "Si vas a comer, es mejor comer ligero."],
          ],
          note: "『のほうが』 resalta ‘el lado ganador’. 『より』 puede omitirse si ya se entiende."
        },
        ejemplos: [
          { jp: "この 色 より、しろ の ほうが すき です。", roma: "kono iro yori, shiro no hō ga suki desu.", es: "Me gusta más el blanco que este color." },
          { jp: "ここ より、えき に 近い ところ の ほうが いい です。", roma: "koko yori, eki ni chikai tokoro no hō ga ii desu.", es: "Es mejor un lugar más cerca de la estación que aquí." },
          { jp: "あるく より、じてんしゃ の ほうが 速い です。", roma: "aruku yori, jitensha no hō ga hayai desu.", es: "La bici es más rápida que caminar." },
          { jp: "おおい より、ちょうど いい 量 の ほうが いい です。", roma: "ōi yori, chōdo ii ryō no hō ga ii desu.", es: "Mejor una cantidad justa que demasiada." },
        ],
      },

      {
        key: "g03",
        titulo: "③ A と B と どちら（のほう）が 〜 です か（preguntar）",
        jp: "A と B と どちら（の ほう）が 〜 です か。",
        roma: "A to B to dochira (no hō) ga 〜 desu ka.",
        es: "¿Cuál (de A o B) es más 〜?",
        exp: "『どちら』 = cuál de los dos. Añade 『のほう』 para sonar más natural en comparaciones.",
        tabla: {
          title: "Patrones de pregunta",
          headers: ["Estructura", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["N と N と どちら の ほうが Aい です か", "コーヒー と おちゃ と どちら の ほうが すき です か。", "kōhī to ocha to dochira no hō ga suki desu ka.", "¿Qué te gusta más, café o té?"],
            ["どちら…？ → N の ほう が…", "どちら が 速い です か。— でんしゃ の ほう が 速い です。", "dochira ga hayai desu ka? — densha no hō ga hayai desu.", "¿Cuál es más rápido? — El tren."],
          ],
          note: "Respuesta natural: 『B のほうが〜です』."
        },
        ejemplos: [
          { jp: "バス と でんしゃ と どちら の ほうが べんり です か。", roma: "basu to densha to dochira no hō ga benri desu ka.", es: "¿Qué es más práctico, autobús o tren?" },
          { jp: "この 色 と あの 色 と どちら の ほうが すき です か。", roma: "kono iro to ano iro to dochira no hō ga suki desu ka.", es: "¿Cuál color te gusta más, este o aquel?" },
          { jp: "あるく の と じてんしゃ で いく の と どちら の ほうが 速い です か。", roma: "aruku no to jitensha de iku no to dochira no hō ga hayai desu ka.", es: "¿Qué es más rápido, ir caminando o en bici?" },
          { jp: "ちかい ところ と しずかな ところ と どちら の ほうが いい です か。", roma: "chikai tokoro to shizuka na tokoro to dochira no hō ga ii desu ka.", es: "¿Qué es mejor, un lugar cercano o tranquilo?" },
        ],
      },

      {
        key: "g04",
        titulo: "④ 〜するより 〜するほうが いい（preferir hacer B）",
        jp: "A する より、B する ほうが いい です。",
        roma: "A suru yori, B suru hō ga ii desu.",
        es: "Es mejor hacer B que hacer A.",
        exp: "Verbos en forma diccionario. Se puede usar con pasado para experiencias: A した より、B した ほうが…",
        tabla: {
          title: "Con verbos",
          headers: ["Patrón", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Vる より Vる ほうが いい", "テレビ を みる より、ほん を よむ ほうが いい です。", "terebi o miru yori, hon o yomu hō ga ii desu.", "Es mejor leer que ver TV."],
            ["Vた より Vた ほうが …", "まった あと より、はやく うごいた ほうが うまく いきます。", "matta ato yori, hayaku ugoita hō ga umaku ikimasu.", "Mejor moverse rápido que esperar (después) si quieres que salga bien."],
          ],
          note: "Para ‘deberías’, existe Vた ほうが いい, pero aquí trabajamos preferencia A vs B."
        },
        ejemplos: [
          { jp: "おそく ねる より、はやく ねる ほうが いい です。", roma: "osoku neru yori, hayaku neru hō ga ii desu.", es: "Es mejor dormir temprano que tarde." },
          { jp: "おおい 量 を かう より、ひつよう な 量 を えらぶ ほうが いい です。", roma: "ōi ryō o kau yori, hitsuyō na ryō o erabu hō ga ii desu.", es: "Es mejor elegir la cantidad necesaria que comprar de más." },
          { jp: "とおい みち を いく より、ちかい みち を えらぶ ほうが 速い です。", roma: "too i michi o iku yori, chikai michi o erabu hō ga hayai desu.", es: "Es más rápido elegir un camino cercano que ir por uno lejano." },
          { jp: "にぎやか な ところ に いく より、しずか な ところ で すごす ほうが すき です。", roma: "nigiyaka na tokoro ni iku yori, shizuka na tokoro de sugosu hō ga suki desu.", es: "Prefiero pasar el tiempo en un lugar tranquilo que ir a un lugar animado." },
        ],
      },
    ],
  },

  // 7 diálogos (usa kanji ya vistos + los 10 nuevos de este tema)
  dialogos: [
    {
      title: "どちらが速い？",
      kana: [
        "バス と でんしゃ と どちら の ほうが はやい です か。",
        "でんしゃ の ほうが はやい です。ちかい みち を つかいます。"
      ],
      kanji: [
        "バス と 電車 と どちら の ほうが 速い です か。",
        "電車 の ほうが 速い です。近い 道 を 使います。"
      ],
      es: [
        "¿Qué es más rápido, el autobús o el tren?",
        "El tren es más rápido. Usa un camino cercano."
      ]
    },
    {
      title: "味と色",
      kana: [
        "この あじ と あの あじ と どちら の ほうが すき です か。",
        "この 色 は あかるい です が、あの 色 の ほうが すき です。"
      ],
      kanji: [
        "この 味 と あの 味 と どちら の ほうが 好き です か。",
        "この 色 は 明るい です が、あの 色 の ほうが 好き です。"
      ],
      es: [
        "¿Cuál sabor te gusta más, este o aquel?",
        "Este color es claro, pero me gusta más aquel color."
      ]
    },
    {
      title: "近いほうが便利",
      kana: [
        "ここ より、えき に 近い ところ の ほうが べんり ですね。",
        "そう です ね。あるく より、じてんしゃ の ほうが いい です。"
      ],
      kanji: [
        "ここ より、駅 に 近い ところ の ほうが 便利 ですね。",
        "そう ですね。歩く より、自転車 の ほうが いい です。"
      ],
      es: [
        "Es más práctico un lugar más cerca de la estación que aquí, ¿verdad?",
        "Sí. Es mejor ir en bici que caminar."
      ]
    },
    {
      title: "量と質",
      kana: [
        "おおい 量 より、いい しつ の ほうが たいせつ だ と おもいます。",
        "わたし も そう おもいます。"
      ],
      kanji: [
        "多い 量 より、良い 質 の ほうが 大切 だ と 思います。",
        "私 も そう 思います。"
      ],
      es: [
        "Creo que la calidad es más importante que la cantidad.",
        "Yo también lo creo."
      ]
    },
    {
      title: "遠いけど速い",
      kana: [
        "この みち は とおい です が、はやい です。",
        "なら、ここ より この みち の ほうが いい です ね。"
      ],
      kanji: [
        "この 道 は 遠い です が、速い です。",
        "なら、ここ より この 道 の ほうが いい です ね。"
      ],
      es: [
        "Este camino es lejano, pero es rápido.",
        "Entonces, este camino es mejor que aquí (la opción actual), ¿verdad?"
      ]
    },
    {
      title: "選ぶなら",
      kana: [
        "えらぶ なら、しずか な ところ の ほうが すき です。",
        "わかりました。じゃあ、こちら を えらびます。"
      ],
      kanji: [
        "選ぶ なら、静か な ところ の ほうが 好き です。",
        "わかりました。じゃあ、こちら を 選びます。"
      ],
      es: [
        "Si tengo que elegir, prefiero un lugar tranquilo.",
        "Entendido. Entonces elegiré este."
      ]
    },
    {
      title: "比べて決める",
      kana: [
        "まず くらべて、どちら が いい か きめましょう。",
        "さんせい。バス より でんしゃ の ほうが いい と おもいます。"
      ],
      kanji: [
        "まず 比べて、どちら が 良い か 決めましょう。",
        "賛成。バス より 電車 の ほうが 良い と 思います。"
      ],
      es: [
        "Primero comparemos y decidamos cuál es mejor.",
        "De acuerdo. Creo que el tren es mejor que el autobús."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: バス と でんしゃ と どちら の ほうが べんり です か。",
      "B: でんしゃ の ほうが べんり です。",
      "A: なるほど。"
    ],
    [
      "A: この 色 と あの 色 と どちら の ほうが すき です か。",
      "B: あの 色 の ほうが すき です。",
      "A: わかりました。"
    ],
    [
      "A: あるく より、じてんしゃ の ほうが 速い です。",
      "B: そう ですね。",
      "A: じゃあ、じてんしゃ に します。"
    ],
    [
      "A: ここ より、えき に 近い ところ の ほうが いい です ね。",
      "B: はい、近い ほう が べんり です。",
      "A: そこ に します。"
    ],
    [
      "A: 多い 量 より、良い 質 の ほうが たいせつ です。",
      "B: わたし も そう おもいます。",
      "A: じゃあ、これ を えらび ましょう。"
    ],
    [
      "A: とおい みち です が、はやい です。",
      "B: なら、ここ より その みち の ほうが いい です ね。",
      "A: はい、そう おもいます。"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — sin repetir los de 13 y 14
  kanji10: [
    {
      ch: "比",
      kun: [],
      on: ["ひ"],
      es: "comparar",
      trazos: 4,
      strokeCode: "6bd4",
      ej: ["比較（ひかく）: comparación", "比べる（くらべる）: comparar"]
    },
    {
      ch: "選",
      kun: ["えら(ぶ)"],
      on: ["せん"],
      es: "elegir",
      trazos: 15,
      strokeCode: "9078",
      ej: ["選ぶ（えらぶ）: elegir", "選手（せんしゅ）: jugador"]
    },
    {
      ch: "低",
      kun: ["ひく(い)"],
      on: ["てい"],
      es: "bajo",
      trazos: 7,
      strokeCode: "4f4e",
      ej: ["低い（ひくい）: bajo", "最低（さいてい）: lo mínimo"]
    },
    {
      ch: "高",
      kun: ["たか(い)"],
      on: ["こう"],
      es: "alto, caro",
      trazos: 10,
      strokeCode: "9ad8",
      ej: ["高い（たかい）: alto/caro", "高校（こうこう）: secundaria alta"]
    },
    {
      ch: "近",
      kun: ["ちか(い)"],
      on: ["きん"],
      es: "cerca",
      trazos: 7,
      strokeCode: "8fd1",
      ej: ["近い（ちかい）: cerca", "最近（さいきん）: recientemente"]
    },
    {
      ch: "遠",
      kun: ["とお(い)"],
      on: ["えん"],
      es: "lejos",
      trazos: 13,
      strokeCode: "9060",
      ej: ["遠い（とおい）: lejos", "遠足（えんそく）: excursión"]
    },
    {
      ch: "速",
      kun: ["はや(い)"],
      on: ["そく"],
      es: "rápido (velocidad)",
      trazos: 10,
      strokeCode: "901f",
      ej: ["速い（はやい）: rápido", "速度（そくど）: velocidad"]
    },
    {
      ch: "遅",
      kun: ["おそ(い)","おく(れる)"],
      on: ["ち"],
      es: "tarde, lento",
      trazos: 12,
      strokeCode: "9045",
      ej: ["遅い（おそい）: lento/tarde", "遅れる（おくれる）: retrasarse"]
    },
    {
      ch: "量",
      kun: [],
      on: ["りょう"],
      es: "cantidad",
      trazos: 12,
      strokeCode: "91cf",
      ej: ["量（りょう）: cantidad", "少量（しょうりょう）: poca cantidad"]
    },
    {
      ch: "好",
      kun: ["す(き)","この(む)"],
      on: ["こう"],
      es: "gustar, preferir",
      trazos: 6,
      strokeCode: "597d",
      ej: ["好き（すき）: gustar", "好み（このみ）: preferencia"]
    },
  ],
};

export default TEMA_15;
