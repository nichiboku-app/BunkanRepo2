// src/screens/N2/N2_B4_U2.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";
import UnitTemplate from "./UnitTemplate";

const { width } = Dimensions.get("window");

/* ================== THEME ================== */
const accent = "#9333EA";            // 💜 morado para B4_U2
const BG_CARD = "#0B0F19";
const BORDER = "rgba(255,255,255,0.08)";

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

/* ===================== 1) GUÍA GRAMATICAL ===================== */
type Ex = { jp: string; yomi: string; es: string };

const GUIA = [
  {
    tag: "〜をめぐって",
    descES:
      "“En torno a / a propósito de” un **tema controvertido** (debate, disputa, posturas enfrentadas). Se une a **sustantivo (N)**.",
    ambitosES: [
      "Ámbitos: política (予算案, 法改正), sociedad (表現の自由, 開発計画), economía (物価, 税制), educación (入試制度).",
      "No marca lugar ni tiempo; resalta el **foco de conflicto** o intercambio de posturas.",
      "Estructuras: **N + をめぐって** / **N + をめぐる + 名詞** (adjetival).",
      "Matiz vs. について: について es neutral/informativo; **をめぐって** implica controversia.",
    ],
    ejemplos: [
      { jp: "予算案をめぐって与野党の議論が続いている。", yomi: "よさんあん を めぐって よやとう の ぎろん が つづいて いる。", es: "Sigue el debate entre oficialismo y oposición en torno al presupuesto." },
      { jp: "開発計画をめぐって住民と市が対立している。", yomi: "かいはつけいかく を めぐって じゅうみん と し が たいりつ して いる。", es: "Residentes y ayuntamiento están enfrentados sobre el plan de desarrollo." },
      { jp: "表現の自由をめぐる議論が活発だ。", yomi: "ひょうげん の じゆう を めぐる ぎろん が かっぱつ だ。", es: "Está activo el debate en torno a la libertad de expresión." },
      { jp: "増税案をめぐって世論が二分している。", yomi: "ぞうぜいあん を めぐって よろん が にぶん して いる。", es: "La opinión pública está dividida sobre la subida de impuestos." },
      { jp: "新法案をめぐって専門家の見解が割れている。", yomi: "しんほうあん を めぐって せんもんか の けんかい が われて いる。", es: "Las opiniones de expertos se encuentran divididas sobre el nuevo proyecto de ley." },
    ] as Ex[],
  },
  {
    tag: "〜において",
    descES:
      "“En / en el ámbito de / en el contexto de”. Marca **lugar, tiempo, campo/ámbito o situación**. Se une a **sustantivo (N)**.",
    ambitosES: [
      "Ámbitos: lugar (大阪, 会場), tiempo (今年, 令和期), campo (教育, 医療, IT), situación (緊急時).",
      "Registro formal periodístico; forma adnominal: **N + における + 名詞**.",
      "Sirve para **situar** el marco; no implica disputa.",
      "Formalidad mayor que で en noticias/informes.",
    ],
    ejemplos: [
      { jp: "大阪において国際会議が開かれた。", yomi: "おおさか に おいて こくさい かいぎ が ひらかれた。", es: "Se celebró una conferencia internacional en Osaka." },
      { jp: "教育の現場においてICTの活用が進む。", yomi: "きょういく の げんば に おいて ICT の かつよう が すすむ。", es: "En educación avanza el uso de las TIC." },
      { jp: "今年において最も注目された作品だ。", yomi: "ことし に おいて もっとも ちゅうもく された さくひん だ。", es: "La obra más destacada del año." },
      { jp: "医療におけるAIの役割が拡大している。", yomi: "いりょう に おける AI の やくわり が かくだい して いる。", es: "Se expande el rol de la IA en medicina." },
      { jp: "緊急時において迅速な判断が求められる。", yomi: "きんきゅうじ に おいて じんそく な はんだん が もとめられる。", es: "En emergencias se requiere juicio rápido." },
    ] as Ex[],
  },
  {
    tag: "〜に関して",
    descES:
      "“Con respecto a / en relación con”. Presenta **tema de explicación, anuncio o investigación**. Se une a **sustantivo (N)**.",
    ambitosES: [
      "Ámbitos: comunicados, avisos, informes (説明, 発表, 情報, 調査, 注意).",
      "Adnominal: **N + に関する + 名詞**. Más formal que について.",
      "No marca marco espacial/temporal (para eso: 〜において).",
      "Típico en administración pública y notas informativas.",
    ],
    ejemplos: [
      { jp: "新制度に関して詳細が公開された。", yomi: "しんせいど に かんして しょうさい が こうかい された。", es: "Se publicaron los detalles del nuevo sistema." },
      { jp: "交通規制に関するお知らせです。", yomi: "こうつう きせい に かんする おしらせ です。", es: "Aviso relativo a las restricciones de tráfico." },
      { jp: "調査結果に関して記者会見が行われた。", yomi: "ちょうさ けっか に かんして きしゃ かいけん が おこなわれた。", es: "Rueda de prensa sobre los resultados de la investigación." },
      { jp: "契約条件に関して質問がある。", yomi: "けいやく じょうけん に かんして しつもん が ある。", es: "Tengo preguntas respecto a las condiciones del contrato." },
      { jp: "安全対策に関する報告書を提出した。", yomi: "あんぜん たいさく に かんする ほうこくしょ を ていしゅつ した。", es: "Se presentó un informe relativo a las medidas de seguridad." },
    ] as Ex[],
  },
];

/* =========== 2) ACTIVIDAD 1: contenido → titular adecuado =========== */
type HeadlineItem = {
  id: string;
  contentJP: string;
  yomi?: string;
  choices: { label: string; trans: string; why: string; correct: boolean }[];
};

const MATCH_NEWS: HeadlineItem[] = [
  {
    id: "m1",
    contentJP: "政府と野党が来年度の予算案について激しく意見を戦わせている。折り合いはまだついていない。",
    yomi: "せいふ と やとう が らいねんど の よさんあん について はげしく いけん を たたかわせて いる。おりあい は まだ ついて いない。",
    choices: [
      { label: "予算案において協力体制を構築", trans: "Construyen un marco de cooperación en el presupuesto.", why: "において sitúa; aquí hay conflicto.", correct: false },
      { label: "予算案をめぐって与野党の対立深まる", trans: "Se profundiza la confrontación entre partidos en torno al presupuesto.", why: "をめぐって expresa controversia.", correct: true },
      { label: "予算案に関して説明会を開催", trans: "Se celebra sesión informativa sobre el presupuesto.", why: "に関して: informativo, no disputa.", correct: false },
      { label: "予算案における雇用対策を強化", trans: "Se refuerzan políticas de empleo en el presupuesto.", why: "No refleja controversia.", correct: false },
    ],
  },
  {
    id: "m2",
    contentJP: "大阪の大型展示場で国際ロボット展が開かれ、最新技術が披露された。",
    yomi: "おおさか の おおがた てんじじょう で こくさい ロボット てん が ひらかれ、さいしん ぎじゅつ が ひろう された。",
    choices: [
      { label: "大阪において国際ロボット展を開催", trans: "Se celebra la exposición internacional de robótica en Osaka.", why: "において marca lugar formal.", correct: true },
      { label: "大阪をめぐって意見が対立", trans: "Opiniones enfrentadas en torno a Osaka.", why: "No hay disputa.", correct: false },
      { label: "大阪に関して詳細を発表", trans: "Se publican detalles con respecto a Osaka.", why: "Tema informativo; el contenido trata evento en lugar.", correct: false },
      { label: "大阪における議論が紛糾", trans: "La discusión en Osaka se complica.", why: "No hay discusión.", correct: false },
    ],
  },
  {
    id: "m3",
    contentJP: "新設された給付制度の申請方法について、政府が丁寧に説明した。",
    yomi: "しんせつ された きゅうふ せいど の しんせい ほうほう について、せいふ が ていねい に せつめい した。",
    choices: [
      { label: "新制度に関して申請方法を説明", trans: "Se explica el método de solicitud con respecto al nuevo sistema.", why: "に関して: explicación de tema.", correct: true },
      { label: "新制度において申請方法が議論", trans: "Se debate el método en el marco del sistema.", why: "El contenido no habla de debate.", correct: false },
      { label: "新制度をめぐって説明会が中止", trans: "Se cancela la sesión en torno al nuevo sistema.", why: "No menciona cancelación.", correct: false },
      { label: "新制度における受付が混雑", trans: "Se congestiona la recepción en el marco del sistema.", why: "El contenido es una explicación, no congestión.", correct: false },
    ],
  },
  {
    id: "m4",
    contentJP: "地震の発生を受けて、被災地域の学校で避難訓練が行われた。",
    yomi: "じしん の はっせい を うけて、ひさい ちいき の がっこう で ひなん くんれん が おこなわれた。",
    choices: [
      { label: "被災地域において避難訓練を実施", trans: "Se realiza simulacro de evacuación en zonas afectadas.", why: "において = marco/lugar.", correct: true },
      { label: "被災地域をめぐって住民説明会", trans: "Sesión con residentes en torno a las zonas afectadas.", why: "をめぐって implicaría disputa.", correct: false },
      { label: "被災地域に関して注意を呼びかけ", trans: "Llamado de atención con respecto a zonas afectadas.", why: "Contenido trata de ‘realizar’; no de ‘avisar’.", correct: false },
      { label: "被災地域における議論が活発化", trans: "Se intensifica el debate en las zonas afectadas.", why: "No hay debate.", correct: false },
    ],
  },
];

/* =========== 3) ACTIVIDAD 2: Examen JLPT (16 + feedback) =========== */
type Q = { id: string; stem: string; options: string[]; answer: number; explain: string };
const JLPT_QUESTIONS: Q[] = [
  { id: "q1", stem: "新税制＿＿詳細は本日公表された。", options: ["において", "に関して", "をめぐって"], answer: 1, explain: "‘Con respecto a’ la nueva política: に関して。" },
  { id: "q2", stem: "研究会は東京大学＿＿行われる。", options: ["において", "に関して", "をめぐって"], answer: 0, explain: "Lugar/ámbito formal: において。" },
  { id: "q3", stem: "法改正＿＿市民の意見が割れている。", options: ["において", "に関して", "をめぐって"], answer: 2, explain: "Disputa en torno a: をめぐって。" },
  { id: "q4", stem: "医療＿＿AIの活用が注目される。", options: ["において", "に関して", "をめぐって"], answer: 0, explain: "Ámbito/campo: において。" },
  { id: "q5", stem: "入試方式＿＿説明会が行われた。", options: ["に関して", "において", "をめぐって"], answer: 0, explain: "Explicación/acerca de: に関して。" },
  { id: "q6", stem: "開発計画＿＿住民と市の対立が続く。", options: ["において", "をめぐって", "に関して"], answer: 1, explain: "Conflicto en torno a: をめぐって。" },
  { id: "q7", stem: "今年＿＿最大のイベントだ。", options: ["に関して", "において", "をめぐって"], answer: 1, explain: "Marco temporal ‘este año’: において。" },
  { id: "q8", stem: "安全対策＿＿報告書を提出した。", options: ["において", "に関して", "をめぐって"], answer: 1, explain: "‘Con respecto a’ un tema: に関して。" },
  { id: "q9", stem: "大阪＿＿国際会議（名詞を修飾）", options: ["における", "に関する", "をめぐる"], answer: 0, explain: "Adnominal marco/lugar: における + 名詞。" },
  { id: "q10", stem: "新制度＿＿説明（名詞を修飾）", options: ["における", "に関する", "をめぐる"], answer: 1, explain: "Adnominal informativo: に関する + 名詞。" },
  { id: "q11", stem: "表現の自由＿＿議論（名詞を修飾）", options: ["における", "に関する", "をめぐる"], answer: 2, explain: "Adnominal de controversia: をめぐる + 名詞。" },
  { id: "q12", stem: "教育＿＿ICTの活用（名詞を修飾）", options: ["における", "に関する", "をめぐる"], answer: 0, explain: "Marco/ámbito educativo: における + 名詞。" },
  { id: "q13", stem: "“debate/controversia” に最も近いのは？", options: ["〜において", "〜に関して", "〜をめぐって"], answer: 2, explain: "‘Debate’: をめぐって。" },
  { id: "q14", stem: "“marco/lugar/ámbito” に最も近いのは？", options: ["〜において", "〜に関して", "〜をめぐって"], answer: 0, explain: "‘Marco/ámbito’: において。" },
  { id: "q15", stem: "“acerca de / respecto a” に最も近いのは？", options: ["〜において", "〜に関して", "〜をめぐって"], answer: 1, explain: "‘Acerca de’: に関して。" },
  { id: "q16", stem: "ニュース文体で自然：____国際会議が開かれた。", options: ["東京に関して", "東京において", "東京をめぐって"], answer: 1, explain: "Evento que ocurre en un lugar: において。" },
];

/* =========== 4) ACTIVIDAD 3: Construye el titular =========== */
type BuilderItem = {
  id: string;
  base: string;
  yomi: string;
  answer: "をめぐって" | "において" | "に関して";
  preview: string;
  why: string;
};
const BUILDER: BuilderItem[] = [
  {
    id: "b1",
    base: "原発再稼働＿＿賛否が分かれる。",
    yomi: "げんぱつ さいかどう ＿＿ さんぴ が わかれる。",
    answer: "をめぐって",
    preview: "原発再稼働をめぐって賛否が分かれる。",
    why: "Controversia (賛否). ‘En torno a’ un tema: をめぐって。",
  },
  {
    id: "b2",
    base: "首都圏＿＿大規模な交通規制を実施。",
    yomi: "しゅとけん ＿＿ だいきぼ な こうつう きせい を じっし。",
    answer: "において",
    preview: "首都圏において大規模な交通規制を実施。",
    why: "Marco/lugar (首都圏). Para situar: において。",
  },
  {
    id: "b3",
    base: "新型ワクチンの安全性＿＿最新の報告。",
    yomi: "しんがた ワクチン の あんぜんせい ＿＿ さいしん の ほうこく。",
    answer: "に関して",
    preview: "新型ワクチンの安全性に関して最新の報告。",
    why: "Informe ‘con respecto a’ un tema: に関して。",
  },
];

/* ===================== 5) KANJI (20 tarjetas) ===================== */
type KanjiEx = { w: string; yomi: string; es: string };
type KanjiItem = {
  kanji: string;
  on?: string;
  kun?: string;
  glosa: string;
  ejemplo: string;
  ejYomi: string;
  palabras: KanjiEx[];      // ahora con traducción ES
};

const KANJI_NEW: KanjiItem[] = [
  { kanji: "議", on: "ギ", kun: "", glosa: "deliberar / discutir", ejemplo: "議論が続く。", ejYomi: "ぎろん が つづく。", palabras: [
    { w: "議論", yomi: "ぎろん", es: "debate" }, { w: "議会", yomi: "ぎかい", es: "parlamento" }, { w: "協議", yomi: "きょうぎ", es: "negociación" }, { w: "審議", yomi: "しんぎ", es: "deliberación" },
  ]},
  { kanji: "論", on: "ロン", kun: "", glosa: "argumento / teoría", ejemplo: "結論を出す。", ejYomi: "けつろん を だす。", palabras: [
    { w: "議論", yomi: "ぎろん", es: "debate" }, { w: "結論", yomi: "けつろん", es: "conclusión" }, { w: "論文", yomi: "ろんぶん", es: "tesis / artículo" }, { w: "論点", yomi: "ろんてん", es: "punto de debate" },
  ]},
  { kanji: "関", on: "カン", kun: "かか-る", glosa: "relacionar", ejemplo: "問題に関する報告。", ejYomi: "もんだい に かんする ほうこく。", palabras: [
    { w: "関係", yomi: "かんけい", es: "relación" }, { w: "機関", yomi: "きかん", es: "organismo / institución" }, { w: "関心", yomi: "かんしん", es: "interés" }, { w: "関連", yomi: "かんれん", es: "relación conexa" },
  ]},
  { kanji: "係", on: "ケイ", kun: "かか-り", glosa: "encargado / relación", ejemplo: "受付係に聞く。", ejYomi: "うけつけ がかり に きく。", palabras: [
    { w: "関係", yomi: "かんけい", es: "relación" }, { w: "係員", yomi: "かかりいん", es: "personal encargado" }, { w: "連係", yomi: "れんけい", es: "enlace / coordinación" }, { w: "係長", yomi: "かかりちょう", es: "jefe de sección" },
  ]},
  { kanji: "設", on: "セツ", kun: "もう-ける", glosa: "establecer / equipar", ejemplo: "新制度を設ける。", ejYomi: "しんせいど を もうける。", palabras: [
    { w: "設立", yomi: "せつりつ", es: "fundación" }, { w: "施設", yomi: "しせつ", es: "instalación" }, { w: "設計", yomi: "せっけい", es: "diseño" }, { w: "設置", yomi: "せっち", es: "colocación / instalación" },
  ]},
  { kanji: "制", on: "セイ", kun: "", glosa: "sistema / control", ejemplo: "新しい制度。", ejYomi: "あたらしい せいど。", palabras: [
    { w: "制度", yomi: "せいど", es: "sistema" }, { w: "制限", yomi: "せいげん", es: "límite / restricción" }, { w: "制服", yomi: "せいふく", es: "uniforme" }, { w: "体制", yomi: "たいせい", es: "estructura" },
  ]},
  { kanji: "災", on: "サイ", kun: "わざわ-い", glosa: "desastre", ejemplo: "災害対策。", ejYomi: "さいがい たいさく。", palabras: [
    { w: "災害", yomi: "さいがい", es: "desastre" }, { w: "被災", yomi: "ひさい", es: "afectación por desastre" }, { w: "天災", yomi: "てんさい", es: "desastre natural" }, { w: "火災", yomi: "かさい", es: "incendio" },
  ]},
  { kanji: "被", on: "ヒ", kun: "こうむ-る", glosa: "sufrir / recibir", ejemplo: "被害をこうむる。", ejYomi: "ひがい を こうむる。", palabras: [
    { w: "被害", yomi: "ひがい", es: "daños / perjuicios" }, { w: "被災", yomi: "ひさい", es: "damnificación" }, { w: "被告", yomi: "ひこく", es: "acusado" }, { w: "被験者", yomi: "ひけんしゃ", es: "sujeto experimental" },
  ]},
  { kanji: "救", on: "キュウ", kun: "すく-う", glosa: "socorrer", ejemplo: "救助活動。", ejYomi: "きゅうじょ かつどう。", palabras: [
    { w: "救急", yomi: "きゅうきゅう", es: "emergencias" }, { w: "救助", yomi: "きゅうじょ", es: "rescate" }, { w: "救援", yomi: "きゅうえん", es: "auxilio" }, { w: "救済", yomi: "きゅうさい", es: "alivio / ayuda" },
  ]},
  { kanji: "済", on: "サイ/ザイ", kun: "す-む/す-ます", glosa: "terminar / economía", ejemplo: "経済が回復。", ejYomi: "けいざい が かいふく。", palabras: [
    { w: "経済", yomi: "けいざい", es: "economía" }, { w: "救済", yomi: "きゅうさい", es: "socorro / alivio" }, { w: "済む", yomi: "すむ", es: "finalizar / bastar" }, { w: "返済", yomi: "へんさい", es: "reembolso" },
  ]},
  { kanji: "経", on: "ケイ", kun: "へ-る", glosa: "pasar / administrar", ejemplo: "経験を積む。", ejYomi: "けいけん を つむ。", palabras: [
    { w: "経験", yomi: "けいけん", es: "experiencia" }, { w: "経済", yomi: "けいざい", es: "economía" }, { w: "経営", yomi: "けいえい", es: "administración" }, { w: "経由", yomi: "けいゆ", es: "vía / por (ruta)" },
  ]},
  { kanji: "政", on: "セイ", kun: "まつりごと", glosa: "política", ejemplo: "政治改革。", ejYomi: "せいじ かいかく。", palabras: [
    { w: "政治", yomi: "せいじ", es: "política" }, { w: "政策", yomi: "せいさく", es: "política pública" }, { w: "行政", yomi: "ぎょうせい", es: "administración pública" }, { w: "政党", yomi: "せいとう", es: "partido político" },
  ]},
  { kanji: "策", on: "サク", kun: "", glosa: "medida / plan", ejemplo: "対策を講じる。", ejYomi: "たいさく を こうじる。", palabras: [
    { w: "対策", yomi: "たいさく", es: "medida" }, { w: "政策", yomi: "せいさく", es: "política (medidas)" }, { w: "方策", yomi: "ほうさく", es: "estrategia" }, { w: "策定", yomi: "さくてい", es: "formulación" },
  ]},
  { kanji: "像", on: "ゾウ", kun: "", glosa: "imagen / estatua", ejemplo: "想像力を育む。", ejYomi: "そうぞうりょく を はぐくむ。", palabras: [
    { w: "映像", yomi: "えいぞう", es: "video / imagen en movimiento" }, { w: "想像", yomi: "そうぞう", es: "imaginación" }, { w: "画像", yomi: "がぞう", es: "imagen" }, { w: "銅像", yomi: "どうぞう", es: "estatua de bronce" },
  ]},
  { kanji: "報", on: "ホウ", kun: "むく-いる", glosa: "informar / reportar", ejemplo: "報告書を提出。", ejYomi: "ほうこくしょ を ていしゅつ。", palabras: [
    { w: "報告", yomi: "ほうこく", es: "informe" }, { w: "情報", yomi: "じょうほう", es: "información" }, { w: "速報", yomi: "そくほう", es: "última hora" }, { w: "広報", yomi: "こうほう", es: "difusión / RR. PP." },
  ]},
  { kanji: "告", on: "コク", kun: "つ-げる", glosa: "avisar / anunciar", ejemplo: "警告が出された。", ejYomi: "けいこく が だされた。", palabras: [
    { w: "警告", yomi: "けいこく", es: "advertencia" }, { w: "告知", yomi: "こくち", es: "aviso" }, { w: "報告", yomi: "ほうこく", es: "informe" }, { w: "告白", yomi: "こくはく", es: "confesión" },
  ]},
  { kanji: "象", on: "ショウ/ゾウ", kun: "", glosa: "fenómeno / imagen", ejemplo: "気象情報。", ejYomi: "きしょう じょうほう。", palabras: [
    { w: "現象", yomi: "げんしょう", es: "fenómeno" }, { w: "対象", yomi: "たいしょう", es: "objeto / destinatario" }, { w: "印象", yomi: "いんしょう", es: "impresión" }, { w: "気象", yomi: "きしょう", es: "meteorología" },
  ]},
  { kanji: "震", on: "シン", kun: "ふる-える", glosa: "temblor", ejemplo: "震度５の地震。", ejYomi: "しんど ご の じしん。", palabras: [
    { w: "地震", yomi: "じしん", es: "terremoto" }, { w: "震度", yomi: "しんど", es: "intensidad sísmica" }, { w: "震源", yomi: "しんげん", es: "hipocentro" }, { w: "耐震", yomi: "たいしん", es: "antisísmico" },
  ]},
  { kanji: "援", on: "エン", kun: "", glosa: "apoyo / ayuda", ejemplo: "支援物資を送る。", ejYomi: "しえん ぶっし を おくる。", palabras: [
    { w: "支援", yomi: "しえん", es: "apoyo" }, { w: "援助", yomi: "えんじょ", es: "asistencia" }, { w: "救援", yomi: "きゅうえん", es: "auxilio" }, { w: "後援", yomi: "こうえん", es: "patrocinio / respaldo" },
  ]},
  { kanji: "拘", on: "コウ", kun: "かか-わる", glosa: "relacionarse / retener", ejemplo: "拘束時間が長い。", ejYomi: "こうそく じかん が ながい。", palabras: [
    { w: "拘束", yomi: "こうそく", es: "restricción / sujeción" }, { w: "拘留", yomi: "こうりゅう", es: "detención" }, { w: "拘置", yomi: "こうち", es: "prisión preventiva" }, { w: "拘泥", yomi: "こうでい", es: "terquedad / apego excesivo" },
  ]},
].filter((k, idx, arr) => {
  // eliminar duplicados accidentales
  return arr.findIndex(x => x.kanji === k.kanji) === idx;
}).slice(0, 20);

/* ==================== UI helpers ==================== */
function PillBtn({
  label,
  onPress,
  variant = "primary",
}: { label: string; onPress?: () => void; variant?: "primary" | "ghost" | "alt" }) {
  return (
    <Pressable onPress={onPress} style={[
      styles.btn,
      variant === "primary" ? styles.btnPrimary : variant === "ghost" ? styles.btnGhost : styles.btnAlt
    ]}>
      <Text style={[styles.btnText, variant === "alt" && { color: "#0B0F19" }]}>{label}</Text>
    </Pressable>
  );
}

function ExampleItem({ ex }: { ex: Ex }) {
  return (
    <View style={styles.cardInner}>
      <View style={styles.rowBetween}>
        <Text style={styles.jp}>{ex.jp}</Text>
        <Pressable onPress={() => speakJP(ex.jp)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
      </View>
      <Text style={styles.yomi}>{ex.yomi}</Text>
      <Text style={styles.es}>{ex.es}</Text>
    </View>
  );
}

/* ================== KANJI Cards ================== */
function KanjiCard({ item }: { item: KanjiItem }) {
  return (
    <View style={styles.kanjiCard}>
      <View style={styles.kanjiRow}>
        <Text style={styles.kanjiBig}>{item.kanji}</Text>
        <View style={{ marginLeft: 12 }}>
          {!!item.on && <Text style={styles.kinfo}>音: {item.on}</Text>}
          {!!item.kun && <Text style={styles.kinfo}>訓: {item.kun}</Text>}
          <Text style={styles.kglosa}>{item.glosa}</Text>
        </View>
      </View>

      <View style={[styles.inner, { marginTop: 10 }]}>
        <View style={styles.rowBetween}>
          <Text style={styles.jp}>{item.ejemplo}</Text>
          <Pressable onPress={() => speakJP(item.ejemplo)}>
            <MCI name="play" size={18} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.yomi}>{item.ejYomi}</Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.h3}>Palabras ejemplo</Text>
        <View style={styles.rowWrap}>
          {item.palabras.map((p, i) => (
            <Pressable key={`${item.kanji}:${p.w}:${i}`} onPress={() => speakJP(p.w)} style={[styles.token, { alignItems: "flex-start" }]}>
              <Text style={[styles.choiceText, { fontWeight: "900" }]}>{p.w}</Text>
              <Text style={styles.smallYomi}>{p.yomi}</Text>
              <Text style={styles.tokenEs}>{p.es}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ================== COMPONENTE PRINCIPAL ================== */
export default function N2_B4_U2() {
  const [progress, setProgress] = useState(0);
  const mark = () => setProgress((p) => Math.min(1, p + 0.2));
  const { playCorrect, playWrong } = useFeedbackSounds();

  /* ---- Estado Actividad 1 ---- */
  const [matchAnswers, setMatchAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(MATCH_NEWS.map(m => [m.id, null]))
  );
  const [matchDone, setMatchDone] = useState(false);

  /* ---- Estado JLPT ---- */
  const [jlptAnswers, setJlptAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(JLPT_QUESTIONS.map(q => [q.id, null]))
  );
  const jlptScore = useMemo(
    () => JLPT_QUESTIONS.reduce((s, q) => s + ((jlptAnswers[q.id] === q.answer) ? 1 : 0), 0),
    [jlptAnswers]
  );

  /* ---- Estado Builder ---- */
  const [builderSel, setBuilderSel] = useState<Record<string, string>>(
    Object.fromEntries(BUILDER.map(b => [b.id, ""]))
  );
  const [builderDone, setBuilderDone] = useState(false);

  /* ================== MATCH KANJI → PALABRA (con keys únicas) ================== */
  type Pair = { id: string; k: string; w: string; yomi: string };
  const KANJI_PAIRS = useMemo<Pair[]>(() => {
    const used = new Set<string>();
    const pairs: Pair[] = [];
    for (const k of KANJI_NEW) {
      const pick = k.palabras.find(v => !used.has(v.w)) ?? k.palabras[0];
      used.add(pick.w);
      pairs.push({ id: `${k.kanji}:${pick.w}`, k: k.kanji, w: pick.w, yomi: pick.yomi });
    }
    return pairs;
  }, []);

  const shuffle = <T,>(arr: T[]) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const [kanjiOrder, setKanjiOrder] = useState<string[]>(
    () => shuffle(KANJI_PAIRS.map(p => p.k))
  );
  const [wordOrder, setWordOrder] = useState<string[]>(
    () => shuffle(KANJI_PAIRS.map(p => p.id))
  );

  const [selKanji, setSelKanji] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [tries, setTries] = useState(0);
  const [hits, setHits] = useState(0);

  const isMatched = (k: string) => !!matches[k];
  const pairForKanji = (k: string) => KANJI_PAIRS.find(p => p.k === k);
  const pairById = (id: string) => KANJI_PAIRS.find(p => p.id === id);

  const resetMatch = () => {
    setSelKanji(null);
    setMatches({});
    setTries(0);
    setHits(0);
    setKanjiOrder(shuffle(KANJI_PAIRS.map(p => p.k)));
    setWordOrder(shuffle(KANJI_PAIRS.map(p => p.id)));
  };

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b4_u2.webp")}
      accent={accent}
      breadcrumb="B4 · U2"
      title="Interpretar expresiones de prensa"
      subtitle="「〜をめぐって」「〜において」「〜に関して」 — Uso natural en titulares y notas."
      ctas={[
        { label: "Consejo rápido", onPress: () => speakES("¿Marca marco/ámbito (において), es informativo ‘acerca de’ (に関して) o muestra controversia (をめぐって)?") },
        { label: "Marcar avance", onPress: mark },
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Siguiente"
    >
      {/* ===== Guía gramatical ===== */}
      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.h2}>Guía de uso gramatical (ámbitos + lectura)</Text>
        {GUIA.map((g, i) => (
          <View key={i} style={styles.guiaBlock}>
            <View style={styles.tagRow}>
              <Text style={styles.badge}>{g.tag}</Text>
              <PillBtn label="Pronunciar" variant="ghost" onPress={() => speakJP(g.tag)} />
            </View>
            <Text style={styles.p}>{g.descES}</Text>
            <View style={{ marginTop: 6 }}>
              {g.ambitosES.map((pt, k) => (<Text key={k} style={styles.li}>• {pt}</Text>))}
            </View>
            <View style={{ marginTop: 10 }}>
              {g.ejemplos.map((ex, k) => <ExampleItem key={k} ex={ex} />)}
            </View>
          </View>
        ))}
      </View>

      {/* ===== Actividad 1: contenido → titular ===== */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 1 · Elige el titular adecuado</Text>
        <Text style={styles.p}>Lee el contenido, selecciona el titular. Al calificar verás si es correcto, su traducción y por qué.</Text>

        {MATCH_NEWS.map((m) => {
          const chosenIdx = matchAnswers[m.id];
          const chosen = chosenIdx !== null ? m.choices[chosenIdx!] : null;
          const isCorrect = chosen?.correct;
          return (
            <View key={m.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{m.contentJP}</Text>
                <Pressable onPress={() => speakJP(m.contentJP)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
              </View>
              {!!m.yomi && <Text style={styles.yomi}>{m.yomi}</Text>}

              {m.choices.map((c, idx) => {
                const selected = chosenIdx === idx;
                const showEval = matchDone && chosenIdx !== null;
                const ok = showEval && selected && c.correct;
                const ko = showEval && selected && !c.correct;
                return (
                  <Pressable
                    key={`${m.id}:${idx}`}
                    onPress={() => {
                      setMatchAnswers(prev => ({ ...prev, [m.id]: idx }));
                      if (matchDone) {
                        c.correct ? playCorrect() : playWrong();
                      }
                    }}
                    style={[
                      styles.choice,
                      selected && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent },
                      ok && { borderColor: "#16a34a" },
                      ko && { borderColor: "#ef4444" },
                    ]}
                  >
                    <Text style={styles.choiceText}>{c.label}</Text>
                  </Pressable>
                );
              })}

              {matchDone && chosen && (
                <View style={styles.feedbackBox}>
                  <Text style={[styles.es, { color: isCorrect ? "#86efac" : "#fecaca" }]}>
                    {isCorrect ? "✓ Correcto." : "✕ Incorrecto."}
                  </Text>
                  <Text style={styles.es}>Traducción: {chosen.trans}</Text>
                  <Text style={styles.explain}>Por qué: {chosen.why}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <PillBtn
            label="Calificar"
            onPress={() => {
              setMatchDone(true);
              Object.entries(matchAnswers).forEach(([id, idx]) => {
                const item = MATCH_NEWS.find(x => x.id === id);
                if (item && idx !== null) {
                  item.choices[idx].correct ? playCorrect() : playWrong();
                }
              });
            }}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => { setMatchDone(false); setMatchAnswers(Object.fromEntries(MATCH_NEWS.map(m => [m.id, null]))); }}
          />
        </View>
      </View>

      {/* ===== Actividad 2: JLPT ===== */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 2 · Examen estilo JLPT (16)</Text>
        <Text style={styles.p}>Feedback inmediato con explicación y sonido.</Text>

        {JLPT_QUESTIONS.map((q) => {
          const chosen = jlptAnswers[q.id];
          const show = chosen !== null && chosen !== undefined;
          return (
            <View key={q.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{q.stem}</Text>
                <Pressable onPress={() => speakJP(q.stem)}><MCI name="volume-high" size={18} color="#fff" /></Pressable>
              </View>
              <View>
                {q.options.map((opt, idx) => {
                  const isChosen = chosen === idx;
                  const isCorrect = idx === q.answer;
                  const border =
                    show && isChosen ? (isCorrect ? { borderColor: "#16a34a" } : { borderColor: "#ef4444" }) : {};
                  return (
                    <Pressable
                      key={`${q.id}:${idx}`}
                      onPress={() => {
                        setJlptAnswers(prev => ({ ...prev, [q.id]: idx }));
                        idx === q.answer ? playCorrect() : playWrong();
                      }}
                      style={[styles.choice, isChosen && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent }, border]}
                    >
                      <Text style={styles.choiceText}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {show && (<Text style={[styles.explain, { marginTop: 6 }]}>Explicación: {q.explain}</Text>)}
            </View>
          );
        })}
        <View style={styles.actions}>
          <PillBtn
            label={`Ver puntuación: ${jlptScore}/16`}
            onPress={() => Alert.alert("Resultado", `Tu puntuación: ${jlptScore} / 16`)}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => setJlptAnswers(Object.fromEntries(JLPT_QUESTIONS.map(q => [q.id, null])))} />
        </View>
      </View>

      {/* ===== Actividad 3: Construye el titular ===== */}
      <View style={styles.card}>
        <Text style={styles.h2}>Actividad 3 · Construye el titular</Text>
        <Text style={styles.p}>Elige la partícula adecuada y escucha el titular natural.</Text>

        {BUILDER.map((b) => {
          const sel = builderSel[b.id];
          const checked = builderDone;
          const correct = sel === b.answer;
          return (
            <View key={b.id} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.jp}>{b.base.replace("＿＿", sel || "＿＿")}</Text>
                <Pressable onPress={() => speakJP(b.preview)}><MCI name="play" size={18} color="#fff" /></Pressable>
              </View>
              <Text style={styles.yomi}>{b.yomi.replace("＿＿", sel || "＿＿")}</Text>

              <View style={styles.rowWrap}>
                {(["をめぐって", "において", "に関して"] as const).map(opt => {
                  const chosen = sel === opt;
                  const border = checked
                    ? opt === b.answer
                      ? { borderColor: "#16a34a" }
                      : chosen
                        ? { borderColor: "#ef4444" }
                        : {}
                    : {};
                  return (
                    <Pressable
                      key={`${b.id}:${opt}`}
                      onPress={() => {
                        setBuilderSel(prev => ({ ...prev, [b.id]: opt }));
                        if (builderDone) opt === b.answer ? playCorrect() : playWrong();
                      }}
                      style={[styles.token, chosen && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent }, border]}
                    >
                      <Text style={styles.choiceText}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {checked && (
                <View style={styles.feedbackBox}>
                  <Text style={[styles.es, { color: correct ? "#86efac" : "#fecaca" }]}>
                    {correct ? "✓ Correcto." : `✕ Incorrecto. Respuesta: ${b.answer}`}
                  </Text>
                  <Text style={styles.es}>Titular natural: {b.preview}</Text>
                  <Text style={styles.explain}>Por qué: {b.why}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.actions}>
          <PillBtn
            label="Comprobar"
            onPress={() => {
              setBuilderDone(true);
              Object.entries(builderSel).forEach(([id, val]) => {
                const item = BUILDER.find(x => x.id === id);
                if (!item) return;
                (val === item.answer) ? playCorrect() : playWrong();
              });
            }}
          />
          <PillBtn
            label="Reiniciar"
            variant="ghost"
            onPress={() => { setBuilderDone(false); setBuilderSel(Object.fromEntries(BUILDER.map(b => [b.id, ""]))); }}
          />
        </View>
      </View>

      {/* ===== KANJI — Tarjetas y Matching ===== */}
      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.h2}>Kanji de la lección（20）</Text>
        <Text style={styles.p}>Toca cualquier elemento para escuchar su lectura. Cada palabra muestra su traducción en español.</Text>

        {/* Tarjetas Kanji */}
        <View style={styles.kanjiGrid}>
          {KANJI_NEW.map((k) => (
            <KanjiCard key={`kcard:${k.kanji}`} item={k} />
          ))}
        </View>

        {/* Mini-juego Matching */}
        <View style={[styles.inner, { marginTop: 12 }]}>
          <Text style={styles.h3}>Mini-juego · Empareja Kanji → Palabra</Text>

          <Text style={[styles.es, { marginTop: 6 }]}>1) Toca un Kanji. 2) Elige su palabra correcta. 3) Verde = acierto.</Text>

          <Text style={[styles.badge, { alignSelf: "flex-start", marginTop: 10, marginBottom: 6 }]}>Kanji</Text>
          <View style={styles.rowWrap}>
            {kanjiOrder.map(k => {
              const matched = isMatched(k);
              const selected = selKanji === k;
              return (
                <Pressable
                  key={`K:${k}`}
                  onPress={() => setSelKanji(prev => (prev === k ? null : k))}
                  disabled={matched}
                  style={[
                    styles.token,
                    selected && { backgroundColor: "rgba(147,51,234,0.18)", borderColor: accent },
                    matched && { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.18)" }
                  ]}
                >
                  <Text style={[styles.choiceText, { fontSize: 18, fontWeight: "900" }]}>{k}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.badge, { alignSelf: "flex-start", marginTop: 10, marginBottom: 6 }]}>Palabras</Text>
          <View style={styles.rowWrap}>
            {wordOrder.map(id => {
              const pr = pairById(id)!;   // id único "kanji:palabra"
              const taken = Object.values(matches).includes(id);
              return (
                <Pressable
                  key={`W:${id}`}   // ✅ key única
                  disabled={taken}
                  onPress={() => {
                    if (!selKanji) return;
                    const target = pairForKanji(selKanji);
                    setTries(t => t + 1);
                    if (target && id === target.id) {
                      setMatches(prev => ({ ...prev, [selKanji!]: id }));
                      setHits(h => h + 1);
                      playCorrect();
                      setSelKanji(null);
                    } else {
                      playWrong();
                    }
                  }}
                  style={[
                    styles.token,
                    { paddingVertical: 10, paddingHorizontal: 14, alignItems: "flex-start" },
                    taken && { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.18)" }
                  ]}
                >
                  <Text style={[styles.choiceText, { fontWeight: "900" }]}>{pr.w}</Text>
                  <Text style={styles.smallYomi}>{pr.yomi}</Text>
                  <Text style={styles.tokenEs}>
                    {
                      // Mostrar la traducción ES de la palabra
                    }
                    {(() => {
                      const k = KANJI_NEW.find(x => x.kanji === pr.k);
                      const found = k?.palabras.find(x => x.w === pr.w);
                      return found?.es ?? "";
                    })()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.actions, { marginTop: 12 }]}>
            <PillBtn label={`Aciertos: ${hits} / ${KANJI_PAIRS.length}`} />
            <PillBtn label={`Intentos: ${tries}`} variant="ghost" />
            <PillBtn label="Reiniciar juego" variant="alt" onPress={resetMatch} />
          </View>
        </View>
      </View>
    </UnitTemplate>
  );
}

/* ----------------------------- styles ------------------------------ */
const R = 14;
const styles = StyleSheet.create({
  card: {
    backgroundColor: BG_CARD,
    borderRadius: R,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardInner: {
    backgroundColor: "#0F1423",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    marginTop: 8,
  },
  guiaBlock: { marginTop: 6, gap: 8 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  badge: {
    color: "#fff",
    backgroundColor: "rgba(147,51,234,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "800",
  },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },

  h2: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  h3: { color: "#fff", fontWeight: "800", fontSize: 15, marginTop: 6, marginBottom: 4 },
  p: { color: "rgba(255,255,255,0.9)", lineHeight: 20 },
  li: { color: "rgba(255,255,255,0.85)", marginTop: 2 },

  jp: { color: "#fff", fontSize: 16, fontWeight: "800" }, // JP en blanco
  yomi: { color: "#D1D5DB", fontSize: 14, marginTop: 6 },
  es: { color: "#93C5FD", fontSize: 15 },
  explain: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  choice: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    marginTop: 8,
  },
  choiceText: { color: "#fff" },

  token: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tokenEs: {
    color: "#e5e7eb",
    fontSize: 12,
    marginTop: 2,
  },
  smallYomi: {
    color: "#cbd5e1",
    fontSize: 12,
  },

  block: { marginTop: 8 },

  feedbackBox: {
    marginTop: 8,
    backgroundColor: "#0F1423",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },

  actions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  btnPrimary: { backgroundColor: "rgba(147,51,234,0.95)" },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.14)" },
  btnAlt: { backgroundColor: "#60A5FA" },
  btnText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  /* Kanji cards */
  kanjiGrid: {
    marginTop: 8,
    rowGap: 10,
  },
  kanjiCard: {
    backgroundColor: "#0F1423",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  kanjiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  kanjiBig: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
  },
  kinfo: {
    color: "#e9d5ff",
    fontWeight: "700",
  },
  kglosa: {
    color: "#93C5FD",
    marginTop: 2,
  },
  inner: {
    backgroundColor: "#0B1222",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
});
