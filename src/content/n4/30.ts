// src/content/n4/30.ts
// 🎓 Tema 30 — Repaso final + simulacro N4 (MCQ + Ordenar)
// Usa los campos nuevos de src/content/n4/types.ts:
//   - mcqVocab (20 ítems, cloze de vocabulario)
//   - mcqGrammar (20 ítems)
//   - orderDialogs (20 diálogos para ordenar)
// No agrega kanji nuevos en esta pantalla.

import { type ThemeContent } from "./types";

const TEMA_30: ThemeContent = {
  objetivos: [
    "Elegir la palabra correcta en 20 oraciones (vocabulario MCQ).",
    "Responder 20 preguntas de gramática N4 (MCQ).",
    "Ordenar 20 mini-diálogos de los temas 1–29.",
  ],

  vocabClase: [],

  oraciones6: [
    { key: "ins1", jp: "語いは えらぶ式です。", romaji: "Goi wa erabu-shiki desu.", es: "Vocabulario: opción múltiple." },
    { key: "ins2", jp: "文法も えらぶ式です。", romaji: "Bunpō mo erabu-shiki desu.", es: "Gramática: opción múltiple." },
    { key: "ins3", jp: "会話は ならべ替えます。", romaji: "Kaiwa wa narabekaemasu.", es: "Diálogos: ordenar líneas." },
    { key: "ins4", jp: "ローマ字で 発音を 練習します。", romaji: "Rōmaji de hatsuon o renshū shimasu.", es: "Practica con rōmaji y TTS." },
    { key: "ins5", jp: "チェックすると 音が 出ます。", romaji: "Chekku suru to oto ga demasu.", es: "Acierto/error usan tu hook de sonido." },
    { key: "ins6", jp: "がんばって！", romaji: "Ganbatte!", es: "¡Ánimo!" },
  ],

  gramatica: {
    titulo: "Repaso N4（instrucciones）",
    puntos: [
      {
        regla: "Cómo jugar",
        pasoapaso: [
          "1) Elige la opción correcta y pulsa «Comprobar».",
          "2) Si aciertas: ✔️ sonido OK; si fallas: ✖️ sonido error.",
          "3) En diálogos, toca líneas para formar el orden.",
        ],
        ejemploJP: "ここで 写真を 撮っても いいですか。",
        ejemploRoma: "Koko de shashin o totte mo ii desu ka.",
        ejemploES: "¿Puedo tomar fotos aquí?",
      },
    ],
  },

  /* ====== MCQ — VOCABULARIO (20) ====== */
  mcqVocab: [
    { id: "v01", promptJp: "来週の【　】を 取ります。", roma: "Raishū no (   ) o torimasu.", answers: ["予約", "魚", "祭"], correctIndex: 0 },
    { id: "v02", promptJp: "この【　】を 使って 説明します。", roma: "Kono (   ) o tsukatte setsumei shimasu.", answers: ["表", "駅", "夏"], correctIndex: 0 },
    { id: "v03", promptJp: "新しい【　】を 作りました。", roma: "Atarashii (   ) o tsukurimashita.", answers: ["計画", "肉", "花"], correctIndex: 0 },
    { id: "v04", promptJp: "【　】に 相談します。", roma: "(   ) ni sōdan shimasu.", answers: ["先生", "海", "雪"], correctIndex: 0 },
    { id: "v05", promptJp: "【　】で 診てもらいます。", roma: "(   ) de mite moraimasu.", answers: ["病院", "教室", "駅"], correctIndex: 0 },
    { id: "v06", promptJp: "【　】で 行きます。", roma: "(   ) de ikimasu.", answers: ["電車", "牛", "茶"], correctIndex: 0 },
    { id: "v07", promptJp: "ここは【　】ですか。", roma: "Koko wa (   ) desu ka.", answers: ["受付", "宿題", "練習"], correctIndex: 0 },
    { id: "v08", promptJp: "春の【　】に 参加します。", roma: "Haru no (   ) ni sanka shimasu.", answers: ["祭", "肉", "雨"], correctIndex: 0 },
    { id: "v09", promptJp: "学校の【　】を 読んで ください。", roma: "Gakkō no (   ) o yonde kudasai.", answers: ["案内", "魚", "花"], correctIndex: 0 },
    { id: "v10", promptJp: "この【　】は 使いやすいです。", roma: "Kono (   ) wa tsukaiyasui desu.", answers: ["方法", "駅", "月"], correctIndex: 0 },
    { id: "v11", promptJp: "旅行の【　】を 立てます。", roma: "Ryokō no (   ) o tatemasu.", answers: ["予定", "夜", "雨"], correctIndex: 0 },
    { id: "v12", promptJp: "会社の【　】に 提出します。", roma: "Kaisha no (   ) ni teishutsu shimasu.", answers: ["部長", "花", "魚"], correctIndex: 0 },
    { id: "v13", promptJp: "メールで【　】します。", roma: "Mēru de (   ) shimasu.", answers: ["連絡", "料理", "祭"], correctIndex: 0 },
    { id: "v14", promptJp: "毎日 日本語の【　】を します。", roma: "Mainichi nihongo no (   ) o shimasu.", answers: ["練習", "駅", "肉"], correctIndex: 0 },
    { id: "v15", promptJp: "午後【　】に 会いましょう。", roma: "Gogo (   ) ni aimashō.", answers: ["三時", "花", "魚"], correctIndex: 0 },
    { id: "v16", promptJp: "この【　】は どこですか。", roma: "Kono (   ) wa doko desu ka.", answers: ["表", "先生", "夏"], correctIndex: 0 },
    { id: "v17", promptJp: "Aの【　】が 高いです。", roma: "A no (   ) ga takai desu.", answers: ["価格", "花", "魚"], correctIndex: 0 },
    { id: "v18", promptJp: "来週の【　】を 決めましょう。", roma: "Raishū no (   ) o kimemashō.", answers: ["予定", "駅", "夏"], correctIndex: 0 },
    { id: "v19", promptJp: "きょうの【　】は 何ですか。", roma: "Kyō no (   ) wa nan desu ka.", answers: ["目標", "魚", "花"], correctIndex: 0 },
    { id: "v20", promptJp: "この問題の【　】を 教えて ください。", roma: "Kono mondai no (   ) o oshiete kudasai.", answers: ["理由", "駅", "薬"], correctIndex: 0 },
  ],

  /* ====== MCQ — GRAMÁTICA (20) ====== */
  mcqGrammar: [
    { id: "g01", promptJp: "ここで 写真を 撮っ（　） いいですか。", roma: "… tot(te) ii desu ka.", answers: ["ても", "では", "しか", "だけ"], correctIndex: 0 },
    { id: "g02", promptJp: "ここで 座っては（　）ません。", roma: "… suwatte wa (   ) masen.", answers: ["いけない", "よく", "ならないです", "べき"], correctIndex: 0 },
    { id: "g03", promptJp: "つかれて いるなら、休んだ（　）が いい。", roma: "… yasunda (   ) ga ii.", answers: ["ほう", "より", "まで", "だけ"], correctIndex: 0 },
    { id: "g04", promptJp: "学生は 宿題を 出す（　）だ。", roma: "… dasu (   ) da.", answers: ["べき", "よう", "つもり", "だけ"], correctIndex: 0 },
    { id: "g05", promptJp: "あしたは 雨（　）。", roma: "Ashita wa ame (   ).", answers: ["でしょう", "かもしれない", "にする", "について"], correctIndex: 0 },
    { id: "g06", promptJp: "彼は おくれる（　）。", roma: "Kare wa okureru (   ).", answers: ["かもしれない", "べき", "だけ", "について"], correctIndex: 0 },
    { id: "g07", promptJp: "家に 着い（　）、連絡します。", roma: "Ie ni tsui(   ), …", answers: ["たら", "ば", "なら", "まで"], correctIndex: 0 },
    { id: "g08", promptJp: "安けれ（　）、買います。", roma: "Yasukere(   ), …", answers: ["ば", "たら", "なら", "ので"], correctIndex: 0 },
    { id: "g09", promptJp: "東京（　）、このホテルが いいです。", roma: "Tōkyō (   ), …", answers: ["なら", "たら", "ば", "ほど"], correctIndex: 0 },
    { id: "g10", promptJp: "来年 日本へ 行く（　）です。", roma: "… iku (   ) desu.", answers: ["つもり", "よう", "らしい", "べき"], correctIndex: 0 },
    { id: "g11", promptJp: "今から 勉強し（　）と 思う。", roma: "… benkyō shi(   ) to omou.", answers: ["よう", "たい", "た", "ば"], correctIndex: 0 },
    { id: "g12", promptJp: "ドアが 開け（　）。", roma: "Doa ga ake(   ).", answers: ["られた", "させた", "てはいけない", "ようだ"], correctIndex: 0 },
    { id: "g13", promptJp: "先生は 学生に 発表を させ（　）。", roma: "… happyō o sase(   ).", answers: ["た", "られた", "たい", "すぎた"], correctIndex: 0 },
    { id: "g14", promptJp: "この歌は 多くの人（　）よって 歌われて います。", roma: "… hito (   ) yotte …", answers: ["に", "で", "を", "が"], correctIndex: 0 },
    { id: "g15", promptJp: "この件（　）話しましょう。", roma: "Kono ken (   ) …", answers: ["について", "によって", "だけ", "でも"], correctIndex: 0 },
    { id: "g16", promptJp: "地域（　）料金が ちがいます。", roma: "Chiiki (   ) ryōkin …", answers: ["によって", "について", "だけ", "ほど"], correctIndex: 0 },
    { id: "g17", promptJp: "今日は 水（　）飲みます。", roma: "Kyō wa mizu (   ) nomimasu.", answers: ["だけ", "しか", "まで", "より"], correctIndex: 0 },
    { id: "g18", promptJp: "日本料理を 食べ（　）。", roma: "Nihon ryōri o tabe(   ).", answers: ["たい", "てほしい", "べき", "らしい"], correctIndex: 0 },
    { id: "g19", promptJp: "京都に 行っ（　）ことが あります。", roma: "Kyōto ni it(   ) koto ga arimasu.", answers: ["た", "て", "ば", "なら"], correctIndex: 0 },
    { id: "g20", promptJp: "できる（　） 早く 来てください。", roma: "Dekiru (   ) hayaku …", answers: ["だけ", "しか", "より", "ほど"], correctIndex: 0 },
  ],

  /* ====== ORDENAR — 20 DIÁLOGOS ====== */
  orderDialogs: [
    ["A: はじめまして。", "B: こちらこそ、よろしく お願いします。"],
    ["A: これは いくらですか。", "B: セールで 安いです。", "A: じゃ、これに します。"],
    ["A: 上野へは どう 行きますか。", "B: この線で 行けます。", "A: ありがとうございます。"],
    ["A: 明日の 授業は 何時から？", "B: 九時から だよ。", "A: 分かった。"],
    ["A: のどが 痛いんです。", "B: 熱は ありますか。", "A: ちょっと あります。"],
    ["A: 来週の 計画について 話しましょう。", "B: はい、お願いします。", "A: 火曜日は どうですか。"],
    ["A: 資料を 提出しました。", "B: 確認します。", "A: よろしく お願いします。"],
    ["A: Aの 方が 便利です。", "B: じゃ、Aに しましょう。", "A: はい。"],
    ["A: ここで 写真を 撮っても いいですか。", "B: どうぞ。", "A: ありがとうございます。"],
    ["A: ここで 座っては いけません。", "B: 分かりました。", "A: すみません。"],
    ["A: 家に 着いたら、連絡して。", "B: はい、します。", "A: お願いね。"],
    ["A: 来年 日本に 行く つもりです。", "B: いいですね。", "A: 今 貯金して います。"],
    ["A: 明日は 忙しい でしょう。", "B: 早く 寝ます。", "A: その ほうが いいです。"],
    ["A: 雨なら 屋内で しましょう。", "B: そうしましょう。", "A: 準備します。"],
    ["A: 安ければ 買います。", "B: 値段を 確認します。", "A: お願いします。"],
    ["A: 先生に 発表を させられた。", "B: 大変 だったね。", "A: でも 勉強に なった。"],
    ["A: 地域によって 料金が 違います。", "B: 表を 見せて ください。", "A: はい。"],
    ["A: この件について 話しましょう。", "B: はい、どうぞ。", "A: まず はじめに…"],
    ["A: 日本料理を 食べたい。", "B: じゃ、近い 店に 行こう。", "A: いいね。"],
    ["A: もう少し ゆっくり 話して ください。", "B: はい、ゆっくり 話します。", "A: 助かります。"],
  ],

  quizLines: [],
  quizzes: [],
  kanji10: [],
};

export default TEMA_30;
