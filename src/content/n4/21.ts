// src/content/n4/21.ts
import type { ThemeContent } from "../types";

// Tema 21 — Rutinas y hábitos: 「〜ながら」「〜とき」「〜まえに」「〜あとで」
export const TEMA_21: ThemeContent = {
  id: 21,
  nivel: "N4",
  titulo: "Rutinas y hábitos – 「〜ながら」「〜とき」「〜まえに」「〜あとで」",

  objetivos: [
    "Describir dos acciones simultáneas con 〜ながら（forma -ます sin ます + ながら）.",
    "Hablar del momento con 〜とき（antes/justo cuando/después).",
    "Expresar anterioridad con 〜まえに y posterioridad con 〜あとで.",
    "Usar patrones de rutina con tiempos del día（朝／夕／毎〜／週）.",
    "Ordenar acciones y crear horarios simples con conectores temporales.",
  ],

  // ≥ 15 ítems
  vocabClase: [
    { key: "vc01", jp: "朝", romaji: "asa", es: "mañana (temprano)" },
    { key: "vc02", jp: "夕方", romaji: "yūgata", es: "atardecer" },
    { key: "vc03", jp: "毎朝", romaji: "maiasa", es: "todas las mañanas" },
    { key: "vc04", jp: "毎晩", romaji: "maiban", es: "todas las noches" },
    { key: "vc05", jp: "毎週", romaji: "maishū", es: "todas las semanas" },
    { key: "vc06", jp: "習慣", romaji: "shūkan", es: "hábito (usa en kana si prefieres)" },
    { key: "vc07", jp: "ながら", romaji: "nagara", es: "mientras (dos acciones a la vez)" },
    { key: "vc08", jp: "とき", romaji: "toki", es: "cuando (momento)" },
    { key: "vc09", jp: "まえに", romaji: "mae ni", es: "antes de" },
    { key: "vc10", jp: "あとで", romaji: "ato de", es: "después de" },
    { key: "vc11", jp: "走る", romaji: "hashiru", es: "correr" },
    { key: "vc12", jp: "歩く", romaji: "aruku", es: "caminar" },
    { key: "vc13", jp: "支度（する）", romaji: "shitaku (suru)", es: "arreglo/prepararse (puedes usar したく en kana)" },
    { key: "vc14", jp: "先に", romaji: "saki ni", es: "primero / antes" },
    { key: "vc15", jp: "後で", romaji: "ato de", es: "luego / después" },
    { key: "vc16", jp: "時", romaji: "toki", es: "tiempo; hora; cuando" },
    { key: "vc17", jp: "予定", romaji: "yotei", es: "plan, programa (ya visto)" },
    { key: "vc18", jp: "復習（する）", romaji: "fukushū (suru)", es: "repaso / repasar" },
  ],

  // 6 modelos
  oraciones6: [
    {
      key: "ex01",
      jp: "朝 ごはん を 食べながら ニュース を 見ます。",
      romaji: "asa gohan o tabenagara nyūsu o mimasu.",
      es: "Veo las noticias mientras desayuno.",
      exp: "V-ます形の語幹 + ながら：dos acciones a la vez (foco en la principal)."
    },
    {
      key: "ex02",
      jp: "出かける とき ドア を しめて ください。",
      romaji: "dekakeru toki doa o shimete kudasai.",
      es: "Cuando salgas, por favor cierra la puerta.",
      exp: "V(辞書形)+とき：‘cuando (antes o justo antes de)’ según el aspecto."
    },
    {
      key: "ex03",
      jp: "寝る まえに 歯 を みがきます。",
      romaji: "neru mae ni ha o migakimasu.",
      es: "Me cepillo los dientes antes de dormir.",
      exp: "V(辞書形)+まえに：antes de hacer A, hago B."
    },
    {
      key: "ex04",
      jp: "食事 の あとで 散歩 します。",
      romaji: "shokuji no ato de sanpo shimasu.",
      es: "Después de comer, paseo.",
      exp: "N + の + あとで：después de N."
    },
    {
      key: "ex05",
      jp: "走りながら 音楽 を きく の が 好き です。",
      romaji: "hashirinagara ongaku o kiku no ga suki desu.",
      es: "Me gusta escuchar música mientras corro.",
      exp: "ながら + 動詞：se combina con la acción secundaria."
    },
    {
      key: "ex06",
      jp: "日本 に 行く まえに もう 一度 復習 します。",
      romaji: "nihon ni iku mae ni mō ichido fukushū shimasu.",
      es: "Antes de ir a Japón, repaso otra vez.",
      exp: "‘antes de ir’ marca preparación previa (rutina/plan)."
    },
  ],

  // Gramática “como en primaria”
  gramatica: {
    titulo: "Rutinas y tiempo：〜ながら／〜とき／〜まえに／〜あとで",
    puntos: [
      {
        key: "g01",
        regla: "① 〜ながら（hacer dos cosas a la vez）",
        pasoapaso: [
          "1) Toma el verbo en forma -ます y quita ます → 読み・歩き・食べ・見…",
          "2) Añade ながら：読みながら、歩きながら、食べながら…",
          "3) La acción con ながら es secundaria; la principal va al final.",
          "4) Sujeto debe poder hacer ambas cosas a la vez (natural)."
        ],
        ejemploJP: "音楽 を ききながら 勉強 します。",
        ejemploRoma: "ongaku o kikinagara benkyō shimasu.",
        ejemploES: "Estudio mientras escucho música.",
        tabla: {
          title: "Unión de 〜ながら",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo", "V-ます語幹 + ながら", "歩きながら 話します。", "aruki-nagara hanashimasu.", "Hablo mientras camino."],
            ["×", "No con adjetivos", "—", "—", "Usa conectores en vez de ながら."],
            ["×", "No con nombres", "—", "—", "Usa N を しながら（名詞化）など."],
          ],
          note: "Naturalidad: ‘ながら’ suena bien con acciones físicas sencillas."
        },
        ejemplos: [
          { jp: "朝 ごはん を 食べながら 計画 を たてます。", roma: "asa gohan o tabenagara keikaku o tatemasu.", es: "Hago el plan mientras desayuno." },
          { jp: "歩きながら 写真 を 見ました。", roma: "aruki-nagara shashin o mimashita.", es: "Vi fotos mientras caminaba." },
          { jp: "音楽 を ききながら 走ります。", roma: "ongaku o kikinagara hashirimasu.", es: "Corro mientras escucho música." },
        ],
      },

      {
        key: "g02",
        regla: "② 〜とき（cuando…）",
        pasoapaso: [
          "1) V(辞書形)+とき：‘cuando (todavía no ocurrió la acción principal)’ o coincide.",
          "2) V(た形)+とき：‘cuando después de haber…’ (acción completada).",
          "3) Aい + とき；Aな + とき；N の とき：adjetivos y nombres también.",
          "4) El tiempo de とき marca la fase del evento."
        ],
        ejemploJP: "家 を 出る とき 電気 を けします。",
        ejemploRoma: "ie o deru toki denki o keshimasu.",
        ejemploES: "Cuando salgo de casa, apago la luz.",
        tabla: {
          title: "Cómo se une 〜とき",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo (antes/justo)", "V(辞書形)+とき", "出る とき", "deru toki", "cuando (antes de salir / al salir)"],
            ["Verbo (después)", "V(た)+とき", "出た とき", "deta toki", "cuando (después de haber salido)"],
            ["Aい", "Aい+とき", "いそがしい とき", "isogashii toki", "cuando estoy ocupado"],
            ["Aな", "Aな+とき", "しずか な とき", "shizuka na toki", "cuando está silencioso"],
            ["Nombre", "N の とき", "朝 の とき", "asa no toki", "por la mañana / en la mañana"],
          ],
          note: "La diferencia Vる/Vた + とき cambia el ‘momento’ exacto."
        },
        ejemplos: [
          { jp: "雨 の とき は 走りません。", roma: "ame no toki wa hashirimasen.", es: "Cuando llueve, no corro." },
          { jp: "家 に 帰った とき 手 を あらいました。", roma: "ie ni kaetta toki te o araimashita.", es: "Cuando llegué a casa, me lavé las manos." },
          { jp: "ひま な とき 日本語 を 復習 します。", roma: "hima na toki nihongo o fukushū shimasu.", es: "Cuando tengo tiempo libre, repaso japonés." },
        ],
      },

      {
        key: "g03",
        regla: "③ 〜まえに（antes de…）",
        pasoapaso: [
          "1) V(辞書形)+まえに：antes de hacer X, hago Y.",
          "2) N の まえに：antes de N.",
          "3) Acciones planificadas/constantes: perfecto para rutinas.",
          "4) Orden: [X まえに] Y（Y ocurre primero）."
        ],
        ejemploJP: "寝る まえに スマホ を とじます。",
        ejemploRoma: "neru mae ni sumaho o tojimasu.",
        ejemploES: "Antes de dormir, cierro el móvil.",
        tabla: {
          title: "Unión de 〜まえに",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo", "V(辞書形)+まえに", "食べる まえに 手 を あらう。", "taberu mae ni te o arau.", "Antes de comer me lavo las manos."],
            ["Nombre", "N の まえに", "授業 の まえに 復習。", "jugyō no mae ni fukushū.", "Repaso antes de clase."],
          ],
          note: "Con pasado NO: usa diccionario (Vる) para la acción futura planeada."
        },
        ejemplos: [
          { jp: "朝 走る まえに 水 を 飲みます。", roma: "asa hashiru mae ni mizu o nomimasu.", es: "Antes de correr por la mañana, bebo agua." },
          { jp: "出かける まえに ドア を しめます。", roma: "dekakeru mae ni doa o shimemasu.", es: "Cierro la puerta antes de salir." },
          { jp: "授業 の まえに ノート を 準備 します。", roma: "jugyō no mae ni nōto o junbi shimasu.", es: "Preparo el cuaderno antes de clase." },
        ],
      },

      {
        key: "g04",
        regla: "④ 〜あとで（después de…）",
        pasoapaso: [
          "1) V(た形)+あとで：después de haber hecho X, hago Y.",
          "2) N の あとで：después de N.",
          "3) Rutinas en cadena: perfecto ‘primero esto, luego aquello’.",
          "4) Se puede usar pasado o presente según el relato."
        ],
        ejemploJP: "ごはん を 食べた あとで 散歩 しました。",
        ejemploRoma: "gohan o tabeta ato de sanpo shimashita.",
        ejemploES: "Después de comer, di un paseo.",
        tabla: {
          title: "Unión de 〜あとで",
          headers: ["Elemento", "Forma", "Ejemplo JP", "Roma", "Traducción"],
          rows: [
            ["Verbo", "V(た)+あとで", "勉強 した あとで 寝ます。", "benkyō shita ato de nemasu.", "Después de estudiar, duermo."],
            ["Nombre", "N の あとで", "仕事 の あとで 走ります。", "shigoto no ato de hashirimasu.", "Corro después del trabajo."],
          ],
          note: "A diferencia de まえに, aquí la acción está completada (Vた)."
        },
        ejemplos: [
          { jp: "家 に 帰った あとで シャワー を あびます。", roma: "ie ni kaetta ato de shawā o abimasu.", es: "Después de llegar a casa, me ducho." },
          { jp: "朝ごはん の あとで ニュース を 見ます。", roma: "asagohan no ato de nyūsu o mimasu.", es: "Después del desayuno, veo noticias." },
          { jp: "運動 した あとで よく ねむれます。", roma: "undō shita ato de yoku nemuremasu.", es: "Después de hacer ejercicio, duermo bien." },
        ],
      },
    ],
  },

  // 7 diálogos (kana/kanji/es) TTS-friendly
  dialogos: [
    {
      title: "朝のルーティン",
      kana: [
        "毎朝、コーヒー を 飲みながら ニュース を 見ます。",
        "へえ、わたし は 音楽 を ききながら 支度 します。",
        "いい ですね。"
      ],
      kanji: [
        "毎朝、コーヒー を 飲みながら ニュース を 見ます。",
        "へえ、私 は 音楽 を 聴きながら 支度 します。",
        "いい ですね。"
      ],
      es: [
        "Todas las mañanas veo noticias mientras tomo café.",
        "Yo me arreglo escuchando música.",
        "Suena bien."
      ]
    },
    {
      title: "出かけるとき",
      kana: [
        "出かける とき、電気 を けして ください。",
        "わかりました。ドア も しめます。",
        "お願いします。"
      ],
      kanji: [
        "出かける とき、電気 を 消して ください。",
        "わかりました。ドア も 閉めます。",
        "お願いします。"
      ],
      es: [
        "Cuando salgas, apaga la luz, por favor.",
        "De acuerdo. Cierro la puerta también.",
        "Te lo agradezco."
      ]
    },
    {
      title: "まえに・あとで",
      kana: [
        "走る まえに 水 を 飲みます。",
        "わたし は 走った あとで ストレッチ を します。",
        "いい 習慣 ですね。"
      ],
      kanji: [
        "走る まえに 水 を 飲みます。",
        "私は 走った あとで ストレッチ を します。",
        "いい 習慣 ですね。"
      ],
      es: [
        "Antes de correr, bebo agua.",
        "Yo estiro después de correr.",
        "Buen hábito."
      ]
    },
    {
      title: "週の予定",
      kana: [
        "毎週 火曜日 は 日本語 を 復習 します。",
        "わたし は 夕方 に 散歩 します。",
        "いっしょに 歩きながら はなしません か。"
      ],
      kanji: [
        "毎週 火曜日 は 日本語 を 復習 します。",
        "私は 夕方 に 散歩 します。",
        "いっしょに 歩きながら 話しません か。"
      ],
      es: [
        "Cada martes repaso japonés.",
        "Yo paseo por la tarde.",
        "¿Caminamos y charlamos juntos?"
      ]
    },
    {
      title: "朝と夜",
      kana: [
        "朝 の とき は いそがしい です。",
        "じゃあ、夜 の あとで メッセージ を 送り ます。",
        "ありがとう。"
      ],
      kanji: [
        "朝 の とき は 忙しい です。",
        "じゃあ、夜 の あとで メッセージ を 送ります。",
        "ありがとう。"
      ],
      es: [
        "Por la mañana estoy ocupado.",
        "Entonces te escribo por la noche, después.",
        "Gracias."
      ]
    },
    {
      title: "先に・後で",
      kana: [
        "先に 宿題 を して、あとで 映画 を 見ます。",
        "いい ですね。わたし も そう します。",
        "うん。"
      ],
      kanji: [
        "先に 宿題 を して、あとで 映画 を 見ます。",
        "いい ですね。私 も そう します。",
        "うん。"
      ],
      es: [
        "Primero hago la tarea y luego veo una peli.",
        "Bien. Yo también.",
        "Sí."
      ]
    },
    {
      title: "ときの違い",
      kana: [
        "家 を 出る とき、かぎ を わすれました。",
        "家 を 出た とき、かぎ が ない と 気づきました。",
        "それ は たいへん でした ね。"
      ],
      kanji: [
        "家 を 出る とき、鍵 を 忘れました。",
        "家 を 出た とき、鍵 が ない と 気づきました。",
        "それ は 大変 でした ね。"
      ],
      es: [
        "Al salir de casa, olvidé la llave.",
        "Cuando ya había salido, me di cuenta de que no estaba la llave.",
        "Vaya, qué problema."
      ]
    },
  ],

  // 6 sets — diálogos breves para ordenar
  quizSets: [
    [
      "A: 寝る まえに 歯 を みがきます。",
      "B: その あとで 本 を 読みます。",
      "A: いい ですね。"
    ],
    [
      "A: 出かける とき ドア を しめて ください。",
      "B: はい、電気 も けします。",
      "A: お願いします。"
    ],
    [
      "A: 音楽 を ききながら 勉強 します。",
      "B: わたし は しずか な とき 勉強 します。",
      "A: そう なんだ。"
    ],
    [
      "A: 毎朝、走る まえに 水 を 飲みます。",
      "B: わたし は 走った あとで ストレッチ します。",
      "A: いい 習慣 ですね。"
    ],
    [
      "A: 家 を 出る とき、メッセージ を 送りました。",
      "B: 家 を 出た とき、電話 を 見ました。",
      "A: なるほど。"
    ],
    [
      "A: 先に 宿題 を して、あとで 映画 を 見ません か。",
      "B: はい、見ましょう。",
      "A: やった！"
    ],
  ],

  // 10 kanji nuevos (N4 razonables) — no repetidos
  kanji10: [
    {
      ch: "時",
      kun: ["とき","と"],
      on: ["じ"],
      es: "tiempo; cuando; hora",
      trazos: 10,
      strokeCode: "6642",
      ej: [
        { jp: "〜とき", yomi: "とき", es: "cuando..." },
        { jp: "時間", yomi: "じかん", es: "tiempo/hora (visto antes)" }
      ]
    },
    {
      ch: "朝",
      kun: ["あさ"],
      on: ["ちょう"],
      es: "mañana",
      trazos: 12,
      strokeCode: "671d",
      ej: [
        { jp: "朝", yomi: "あさ", es: "mañana" },
        { jp: "毎朝", yomi: "まいあさ", es: "cada mañana" }
      ]
    },
    {
      ch: "夕",
      kun: ["ゆう"],
      on: ["せき"],
      es: "tarde (atardecer)",
      trazos: 3,
      strokeCode: "5915",
      ej: [
        { jp: "夕方", yomi: "ゆうがた", es: "atardecer" },
        { jp: "夕食", yomi: "ゆうしょく", es: "cena" }
      ]
    },
    {
      ch: "毎",
      kun: [],
      on: ["まい"],
      es: "cada-",
      trazos: 6,
      strokeCode: "6bce",
      ej: [
        { jp: "毎週", yomi: "まいしゅう", es: "cada semana" },
        { jp: "毎日", yomi: "まいにち", es: "cada día" }
      ]
    },
    {
      ch: "週",
      kun: [],
      on: ["しゅう"],
      es: "semana",
      trazos: 11,
      strokeCode: "9031",
      ej: [
        { jp: "毎週", yomi: "まいしゅう", es: "cada semana" },
        { jp: "週末", yomi: "しゅうまつ", es: "fin de semana" }
      ]
    },
    {
      ch: "習",
      kun: ["なら(う)"],
      on: ["しゅう"],
      es: "aprender; costumbre",
      trazos: 11,
      strokeCode: "7fd2",
      ej: [
        { jp: "習う", yomi: "ならう", es: "aprender (de alguien)" },
        { jp: "練習", yomi: "れんしゅう", es: "práctica" }
      ]
    },
    {
      ch: "走",
      kun: ["はし(る)"],
      on: ["そう"],
      es: "correr",
      trazos: 7,
      strokeCode: "8d70",
      ej: [
        { jp: "走る", yomi: "はしる", es: "correr" },
        { jp: "走者", yomi: "そうしゃ", es: "corredor" }
      ]
    },
    {
      ch: "歩",
      kun: ["ある(く)","あゆ(む)"],
      on: ["ほ","ぶ"],
      es: "caminar",
      trazos: 8,
      strokeCode: "6b69",
      ej: [
        { jp: "歩く", yomi: "あるく", es: "caminar" },
        { jp: "散歩", yomi: "さんぽ", es: "paseo" }
      ]
    },
    {
      ch: "先",
      kun: ["さき"],
      on: ["せん"],
      es: "antes; primero; punta",
      trazos: 6,
      strokeCode: "5148",
      ej: [
        { jp: "先生", yomi: "せんせい", es: "profesor" },
        { jp: "先に", yomi: "さきに", es: "primero / antes" }
      ]
    },
    {
      ch: "後",
      kun: ["のち","あと","うし(ろ)"],
      on: ["ご","こう"],
      es: "después; atrás",
      trazos: 9,
      strokeCode: "5f8c",
      ej: [
        { jp: "あとで", yomi: "あとで", es: "después" },
        { jp: "午後", yomi: "ごご", es: "tarde (p.m.)" }
      ]
    },
  ],
};

export default TEMA_21;
