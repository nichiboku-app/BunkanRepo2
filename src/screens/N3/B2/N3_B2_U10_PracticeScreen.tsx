// src/screens/N3/B2/N3_B2_U5_PracticeScreen.tsx
// BLOQUE 2 — 05 Creencias y suposiciones（はずだ・にちがいない）— PRÁCTICA
// Hero: assets/images/n3/b2_u5.webp

import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ---------------- Types (local) ---------------- */
type RootStackParamList = {
  N3_B2_U5: undefined | { from?: string };
  N3_B2_U5_Practice: undefined | { from?: "N3_B2_U5" };
};
type Nav = NativeStackNavigationProp<RootStackParamList, "N3_B2_U5_Practice">;

type Ex = { jp: string; romaji: string; es: string };
type Q = {
  id: number;
  stem: string;
  options: string[];
  answer: string;
  explain: string;
  solutionJP: string;
  solutionES: string;
};
type OrderQ = { id: number; jp: string; romaji: string; es: string; tokens: string[] };
type Kanji = { hex: string; char: string; gloss: string; sample: string; strokes: number };

type ExtraAItem = {
  id: number;
  contexto: string; // mezcla temas previos
  pregunta: string; // consigna
  opciones: string[];
  respuesta: string; // opción correcta literal
  pista: string;     // por qué esa forma
  solucionJP: string;
  solucionES: string;
};

type ExtraBItem = {
  id: number;
  texto: string;     // lectura sencilla
  opciones: string[];
  respuesta: string; // opción correcta
  razon: string;
  solucionJP: string;
  solucionES: string;
};

/* ---------------- Gramática “como en primaria” ---------------- */
/**
  Tema: Creencias y suposiciones — 「〜はずだ」「〜にちがいない」

  🧠 ¿Qué significan?
    ・〜はずだ ＝ “debería/seguro que... (por lógica/planes/reglas)”
       → Hay **razón concreta**: horario, promesa, datos previos.
    ・〜にちがいない ＝ “no hay duda de que... (fuerte certeza)”
       → **Convicción** por varias pistas/indicios; más enfático.

  🔧 Cómo se unen（普通形 + はずだ／にちがいない）:
    A) Verbo（普通形） + はずだ／にちがいない
    B) い形容詞（普通形） + はずだ／にちがいない
    C) な形容詞 + な + はずだ／にちがいない
    D) 名詞 + の + はずだ／にちがいない

  🧭 Diferencias rápidas:
    ・見た目の様態： 〜そうだ（様態）「降りそうだ」 vs. はずだ（lógica）.
    ・伝聞： 〜そうだ／〜らしい（情報源）.
    ・外見/比喩： 〜ようだ／〜みたい.
    ・直感： 〜気がする／〜ような気がする.
    ・説明/帰結： 〜わけだ／〜わけではない.
    ✳️ Fuerza: 気がする ＜ ようだ/みたい ＜ らしい/そうだ（伝聞） ＜ はずだ ＜ にちがいない

  💡 Tips
    ・“Horario/contrato/propiedad” ⇒ **はずだ**.
    ・“Indicios fuertes y acumulados” ⇒ **にちがいない**.
    ・Pasado esperado pero no cumplido: **〜はずだった**（が…）.
*/
const PRIMARIA = {
  definiciones: [
    { tag: "〜はずだ", exp: "‘debería ser / seguramente…’ (lógica/plan/regla)" },
    { tag: "〜にちがいない", exp: "‘no hay duda de que…’ (certeza fuerte por indicios)" },
  ],
  patrones: [
    "V(普通形) + はずだ ／ V(普通形) + にちがいない",
    "いAdj(普通形) + はずだ ／ いAdj(普通形) + にちがいない",
    "なAdj + な + はずだ ／ なAdj + な + にちがいない",
    "名 + の + はずだ ／ 名 + の + にちがいない",
  ],
  pistas: [
    "Horario/Promesa/Regla → はずだ",
    "Indicios múltiples → にちがいない",
    "‘esperaba pero no’ → はずだった（が、…）",
  ],
};

/* ---------------- Contenido — PRÁCTICA base ---------------- */
// Ejemplos
const EX_HAZU: Ex[] = [
  { jp: "電車は10時に来るはずだ。", romaji: "Densha wa jūji ni kuru hazu da.", es: "El tren debería llegar a las 10." },
  { jp: "彼は約束したから、来るはずだ。", romaji: "Kare wa yakusoku shita kara, kuru hazu da.", es: "Como prometió, debería venir." },
  { jp: "今日は祝日だから、学校は休みのはずだ。", romaji: "Kyō wa shukujitsu dakara, gakkō wa yasumi no hazu da.", es: "Hoy es festivo, la escuela debería estar cerrada." },
  { jp: "この問題は簡単なはずだ。", romaji: "Kono mondai wa kantan na hazu da.", es: "Este ejercicio debería ser fácil." },
  { jp: "雨はもう止んだはずだ。", romaji: "Ame wa mō yanda hazu da.", es: "La lluvia ya debería haber parado." },
];

const EX_NICHIGAI: Ex[] = [
  { jp: "こんなに行列が長いなら、きっとおいしいにちがいない。", romaji: "Konna ni gyōretsu ga nagai nara, kitto oishii ni chigainai.", es: "Con una fila tan larga, no hay duda de que es rico." },
  { jp: "部屋が暗くて静かだ。誰もいないにちがいない。", romaji: "Heya ga kurakute shizuka da. Dare mo inai ni chigainai.", es: "Está oscuro y silencioso: seguramente no hay nadie." },
  { jp: "彼の説明は論理的だ。正しいにちがいない。", romaji: "Kare no setsumei wa ronriteki da. Tadashii ni chigainai.", es: "Su explicación es lógica: debe de ser correcta." },
  { jp: "足跡が濡れている。さっきまで雨だったにちがいない。", romaji: "Ashiato ga nurete iru. Sakki made ame datta ni chigainai.", es: "Las huellas están mojadas: sin duda llovía hace poco." },
  { jp: "この印鑑と署名…本物にちがいない。", romaji: "Kono inkan to shomei... honmono ni chigainai.", es: "Sello y firma… no hay duda, es auténtico." },
];

// Ordenar
const ORDERS: OrderQ[] = [
  { id: 1, jp: "彼は約束したから来るはずだ。", romaji: "Kare wa yakusoku shita kara kuru hazu da.", es: "Vendrá porque lo prometió.", tokens: ["彼は","約束したから","来る","はずだ。"] },
  { id: 2, jp: "今日は祝日だから学校は休みのはずだ。", romaji: "Kyō wa shukujitsu dakara gakkō wa yasumi no hazu da.", es: "Hoy es festivo; la escuela debería estar cerrada.", tokens: ["今日は","祝日だから","学校は","休み","の","はずだ。"] },
  { id: 3, jp: "行列が長い。おいしいにちがいない。", romaji: "Gyōretsu ga nagai. Oishii ni chigainai.", es: "La fila es larga. No hay duda de que es rico.", tokens: ["行列が","長い。","おいしい","に","ちがいない。"] },
  { id: 4, jp: "足跡が濡れている。雨だったにちがいない。", romaji: "Ashiato ga nurete iru. Ame datta ni chigainai.", es: "Huellas mojadas: seguro llovía.", tokens: ["足跡が","濡れている。","雨だった","に","ちがいない。"] },
  { id: 5, jp: "彼は来るはずだったが、来なかった。", romaji: "Kare wa kuru hazu datta ga, konakatta.", es: "Se suponía que vendría, pero no vino.", tokens: ["彼は","来る","はずだった","が、","来なかった。"] },
];

// Quiz (con solución JP/ES)
const QUIZ: Q[] = [
  {
    id: 1,
    stem: "約束がある。彼は＿＿。",
    options: ["来るはずだ", "来るにちがいない"],
    answer: "来るはずだ",
    explain: "Promesa = base lógica → はずだ。",
    solutionJP: "彼は来るはずだ。",
    solutionES: "Él debería venir."
  },
  {
    id: 2,
    stem: "みんなが『おいしい！』と言う。＿＿。",
    options: ["おいしいにちがいない", "おいしいはずだ"],
    answer: "おいしいにちがいない",
    explain: "Indicios múltiples/convicción fuerte → にちがいない。",
    solutionJP: "おいしいにちがいない。",
    solutionES: "No hay duda de que es delicioso."
  },
  {
    id: 3,
    stem: "今日は休校の連絡があった。授業は＿＿。",
    options: ["ないはずだ", "ないにちがいない"],
    answer: "ないはずだ",
    explain: "Aviso oficial = regla → はずだ。",
    solutionJP: "授業はないはずだ。",
    solutionES: "No debería haber clases."
  },
  {
    id: 4,
    stem: "足跡が玄関まで続く。誰かが入った＿＿。",
    options: ["にちがいない", "はずだ"],
    answer: "にちがいない",
    explain: "Evidencia fuerte acumulada → にちがいない。",
    solutionJP: "誰かが入ったにちがいない。",
    solutionES: "No hay duda de que alguien entró."
  },
  {
    id: 5,
    stem: "時刻表ではもう着いている＿＿が、まだ来ない。",
    options: ["はずだ", "にちがいない"],
    answer: "はずだ",
    explain: "Horario = はずだ +（realidad contraria）",
    solutionJP: "もう着いているはずだが、まだ来ない。",
    solutionES: "Debería haber llegado ya, pero aún no llega."
  },
  {
    id: 6,
    stem: "彼の論理は一貫している。正しい＿＿。",
    options: ["にちがいない", "はずだ"],
    answer: "にちがいない",
    explain: "Convicción por múltiples razones → にちがいない。",
    solutionJP: "正しいにちがいない。",
    solutionES: "No hay duda de que es correcto."
  },
  {
    id: 7,
    stem: "鍵を家に置いた＿＿。ポケットにない。",
    options: ["はずだ", "にちがいない"],
    answer: "はずだ",
    explain: "Propia acción esperada → はずだ。",
    solutionJP: "鍵は家に置いたはずだ。",
    solutionES: "Debería haber dejado las llaves en casa."
  },
  {
    id: 8,
    stem: "レビュー★5が1万件。これは良い＿＿。",
    options: ["にちがいない", "はずだ"],
    answer: "にちがいない",
    explain: "Pruebas masivas → にちがいない。",
    solutionJP: "これは良いにちがいない。",
    solutionES: "No hay duda de que esto es bueno."
  },
];

/* ---------------- Extra A (14) — Integrador (todos los temas) ---------------- */
const EXTRA_A: ExtraAItem[] = [
  {
    id: 1,
    contexto: "空は真っ黒で風も強い。",
    pregunta: "→（見た目）『雨が＿＿』",
    opciones: ["降りそうだ", "降るらしい", "降るはずだ"],
    respuesta: "降りそうだ",
    pista: "様態そうだ（見た目）",
    solucionJP: "雨が降りそうだ。",
    solucionES: "Parece que va a llover (por el aspecto del cielo)."
  },
  {
    id: 2,
    contexto: "天気アプリ：『午後から雨』",
    pregunta: "→（情報源）『午後から雨＿＿』",
    opciones: ["らしい", "にちがいない", "ようだ"],
    respuesta: "らしい",
    pista: "情報源→らしい/そうだ（伝聞）",
    solucionJP: "午後から雨らしい。",
    solucionES: "Dicen que por la tarde lloverá (según la app)."
  },
  {
    id: 3,
    contexto: "彼は『行く』と言った。真面目な人。",
    pregunta: "→『彼は来る＿＿』",
    opciones: ["にちがいない", "はずだ", "ようだ"],
    respuesta: "はずだ",
    pista: "約束・性格＝論理",
    solucionJP: "彼は来るはずだ。",
    solucionES: "Debería venir (porque lo prometió y es formal)."
  },
  {
    id: 4,
    contexto: "店の前に長い行列＋SNSで高評価。",
    pregunta: "→『ここはおいしい＿＿』",
    opciones: ["にちがいない", "はずだ", "みたい"],
    respuesta: "にちがいない",
    pista: "根拠多数→強い確信",
    solucionJP: "ここはおいしいにちがいない。",
    solucionES: "No hay duda de que aquí la comida es rica."
  },
  {
    id: 5,
    contexto: "写真は合成っぽい光と影。",
    pregunta: "→『合成の＿＿』",
    opciones: ["ようだ", "そうだ（伝聞）", "はずだ"],
    respuesta: "ようだ",
    pista: "見た目の比喩/様子→ようだ/みたい",
    solucionJP: "合成のようだ。",
    solucionES: "Parece que es un montaje (por el aspecto)."
  },
  {
    id: 6,
    contexto: "足跡が濡れている。今は晴れ。",
    pregunta: "→『さっきまで雨だった＿＿』",
    opciones: ["わけだ", "にちがいない", "気がする"],
    respuesta: "わけだ",
    pista: "結果→原因の説明＝わけだ",
    solucionJP: "さっきまで雨だったわけだ。",
    solucionES: "Con razón: hasta hace poco estaba lloviendo."
  },
  {
    id: 7,
    contexto: "なんとなく音が小さい。",
    pregunta: "→『音が小さい＿＿』",
    opciones: ["気がする", "らしい", "にちがいない"],
    respuesta: "気がする",
    pista: "主観・直感",
    solucionJP: "音が小さい気がする。",
    solucionES: "Siento que el volumen está bajo."
  },
  {
    id: 8,
    contexto: "『必ず行く』と言ったのに来なかった。",
    pregunta: "→『来る＿＿が、来なかった』",
    opciones: ["にちがいない", "はずだった", "わけだ"],
    respuesta: "はずだった",
    pista: "期待と現実のズレ",
    solucionJP: "来るはずだったが、来なかった。",
    solucionES: "Se suponía que vendría, pero no vino."
  },
  {
    id: 9,
    contexto: "駅員：『この電車は運休です』",
    pregunta: "→『運休＿＿』",
    opciones: ["だそうだ", "にちがいない", "ようだ"],
    respuesta: "だそうだ",
    pista: "伝聞（公式）",
    solucionJP: "運休だそうだ。",
    solucionES: "Dicen que el tren está suspendido (según el personal)."
  },
  {
    id: 10,
    contexto: "鍵を机に置いた記憶がある。",
    pregunta: "→『鍵は机の上にある＿＿』",
    opciones: ["にちがいない", "はずだ", "気がする"],
    respuesta: "はずだ",
    pista: "自己行動の論理",
    solucionJP: "鍵は机の上にあるはずだ。",
    solucionES: "Las llaves deberían estar sobre el escritorio."
  },
  {
    id: 11,
    contexto: "あの人の服は濡れている。",
    pregunta: "→『今、外は雨の＿＿』",
    opciones: ["わけではない", "にちがいない", "そうだ（様態）"],
    respuesta: "にちがいない",
    pista: "強い根拠",
    solucionJP: "今、外は雨のにちがいない。",
    solucionES: "No hay duda: afuera está lloviendo."
  },
  {
    id: 12,
    contexto: "A：『先生、来ないらしいよ』",
    pregunta: "→B『え？じゃ、授業はない＿＿』",
    opciones: ["はずだ", "ようだ", "にちがいない"],
    respuesta: "はずだ",
    pista: "条件からの論理",
    solucionJP: "授業はないはずだ。",
    solucionES: "Entonces no debería haber clase."
  },
  {
    id: 13,
    contexto: "ニュース：『価格は上がる見込み』",
    pregunta: "→『値段が上がる＿＿』",
    opciones: ["そうだ（伝聞）", "にちがいない", "はずだ"],
    respuesta: "そうだ（伝聞）",
    pista: "ニュース＝情報源",
    solucionJP: "値段が上がるそうだ。",
    solucionES: "Dicen que los precios subirán."
  },
  {
    id: 14,
    contexto: "体感として今日は涼しい。",
    pregunta: "→『今日は涼しい＿＿』",
    opciones: ["気がする", "にちがいない", "はずだ"],
    respuesta: "気がする",
    pista: "主観",
    solucionJP: "今日は涼しい気がする。",
    solucionES: "Siento que hoy hace fresco."
  },
];

/* ---------------- Extra B (14) — Lectura/Inferencia (fácil) ---------------- */
const EXTRA_B: ExtraBItem[] = [
  {
    id: 1,
    texto: "アナウンス：『じこで でんしゃが おくれています』。",
    opciones: ["でんしゃは すぐ くるはずだ。", "でんしゃは おくれているそうだ。", "ていこくどおり に ちがいない。"],
    respuesta: "でんしゃは おくれているそうだ。",
    razon: "アナウンス＝情報源 → そうだ。",
    solucionJP: "でんしゃは おくれているそうだ。",
    solucionES: "Dicen que el tren está retrasado."
  },
  {
    id: 2,
    texto: "そらが まっくろ。かぜが つよい。",
    opciones: ["あめが ふりそうだ。", "あめが ふるそうだ。", "あめは ふらない わけだ。"],
    respuesta: "あめが ふりそうだ。",
    razon: "見た目の推量 → 〜そうだ（様態）。",
    solucionJP: "あめが ふりそうだ。",
    solucionES: "Parece que va a llover."
  },
  {
    id: 3,
    texto: "かれは まいにち まじめ。『いく』と いった。",
    opciones: ["くるはずだ。", "こないに ちがいない。", "くるようだ。"],
    respuesta: "くるはずだ。",
    razon: "約束・習慣＝根拠 → はずだ。",
    solucionJP: "かれは くるはずだ。",
    solucionES: "Él debería venir."
  },
  {
    id: 4,
    texto: "ともだち：『せんせいは らいしゅう やすむって』。",
    opciones: ["やすむそうだ。", "やすむに ちがいない。", "やすむ きがする。"],
    respuesta: "やすむそうだ。",
    razon: "伝聞そのまま → そうだ（伝聞）。",
    solucionJP: "せんせいは らいしゅう やすむそうだ。",
    solucionES: "Dicen que el profe descansará la próxima semana."
  },
  {
    id: 5,
    texto: "ずっと べんきょうした。テストも よく できた。",
    opciones: ["ごうかくするに ちがいない。", "ごうかく しそうに ない。", "ごうかくの ようだ。"],
    respuesta: "ごうかくするに ちがいない。",
    razon: "強い根拠 → にちがいない。",
    solucionJP: "ごうかくするに ちがいない。",
    solucionES: "No hay duda de que aprobará."
  },
  {
    id: 6,
    texto: "ちずは『みぎ』と ある。でも おてらが みえない。",
    opciones: ["ちずが ふるい わけだ。", "ちずが まちがっている きがする。", "おてらは ここに あるはずだ。"],
    respuesta: "ちずが まちがっている きがする。",
    razon: "直感 → 〜気がする。",
    solucionJP: "ちずが まちがっている きがする。",
    solucionES: "Siento que el mapa está mal."
  },
  {
    id: 7,
    texto: "みちが ぬれている。いまは くもが ない。",
    opciones: ["さっき まで あめだった わけだ。", "これから あめに なりそうだ。", "あめは ふらない わけでは ない。"],
    respuesta: "さっき まで あめだった わけだ。",
    razon: "結果→原因の説明 → わけだ。",
    solucionJP: "さっき まで あめだった わけだ。",
    solucionES: "Con razón: hasta hace poco llovía."
  },
  {
    id: 8,
    texto: "ネットきじ：『その しゃしんは ごうせい』。",
    opciones: ["ごうせい らしい。", "ほんもの に ちがいない。", "ほんものの ようだ。"],
    respuesta: "ごうせい らしい。",
    razon: "記事＝情報源 → らしい。",
    solucionJP: "その しゃしんは ごうせい らしい。",
    solucionES: "Parece que esa foto es un montaje (según el artículo)."
  },
  {
    id: 9,
    texto: "みせの まえに ながい ならび。SNS でも こうひょう。",
    opciones: ["おいしい に ちがいない。", "おいしそうだ。", "おいしい きがする。"],
    respuesta: "おいしい に ちがいない。",
    razon: "証拠が いくつも → にちがいない。",
    solucionJP: "おいしい に ちがいない。",
    solucionES: "No hay duda de que es rico."
  },
  {
    id: 10,
    texto: "『しょうめいしょ』に ハンコ と サイン が ある。",
    opciones: ["ほんもの に ちがいない。", "ほんもの らしい。", "ほんもの の ようだ。"],
    respuesta: "ほんもの に ちがいない。",
    razon: "強い確信。",
    solucionJP: "ほんもの に ちがいない。",
    solucionES: "No hay duda de que es auténtico."
  },
  {
    id: 11,
    texto: "くも なし・かぜ なし・すずしい。",
    opciones: ["きょうは すごしやすい きがする。", "たいふう らしい。", "あめが ふりそうだ。"],
    respuesta: "きょうは すごしやすい きがする。",
    razon: "体感・主観 → 気がする。",
    solucionJP: "きょうは すごしやすい きがする。",
    solucionES: "Siento que hoy se está a gusto."
  },
  {
    id: 12,
    texto: "パンフレット：『この じんじゃは えどじだいに たてられた』。",
    opciones: ["たてられた そうだ。", "たてられた に ちがいない。", "たてられた きがする。"],
    respuesta: "たてられた そうだ。",
    razon: "文字情報の伝聞 → そうだ（伝聞）。",
    solucionJP: "この じんじゃは えどじだいに たてられた そうだ。",
    solucionES: "Dicen que este santuario fue construido en la era Edo."
  },
  {
    id: 13,
    texto: "かれは ロンリてきで、せつめい が うまい。",
    opciones: ["せつめい が うまい に ちがいない。", "せつめい の ようだ。", "せつめい そうだ。"],
    respuesta: "せつめい が うまい に ちがいない。",
    razon: "背景→強い推量。",
    solucionJP: "かれは せつめい が うまい に ちがいない。",
    solucionES: "No hay duda de que explica bien."
  },
  {
    id: 14,
    texto: "『かならず いく』と いった のに、きょう は こなかった。",
    opciones: ["くる はず だった が、こなかった。", "こない わけでは ない。", "くる ような きが した。"],
    respuesta: "くる はず だった が、こなかった。",
    razon: "予定 と 現実 の 不一致。",
    solucionJP: "かれは くる はず だった が、こなかった。",
    solucionES: "Se suponía que vendría, pero no vino."
  },
];

/* ---------------- Kanji de la unidad (certeza/verdad/fe) ---------------- */
const KANJI: Kanji[] = [
  { hex: "5fc5", char: "必", gloss: "inevitable", sample: "必ず（かならず）", strokes: 5 },
  { hex: "5b9a", char: "定", gloss: "fijar/decidir", sample: "予定（よてい）", strokes: 8 },
  { hex: "7531", char: "由", gloss: "motivo/origen", sample: "理由（りゆう）", strokes: 5 },
  { hex: "7406", char: "理", gloss: "lógica/razón", sample: "理由・理論", strokes: 11 },
  { hex: "8a8d", char: "認", gloss: "reconocer", sample: "認める（みとめる）", strokes: 14 },
  { hex: "4fe1", char: "信", gloss: "fe/confiar", sample: "自信（じしん）", strokes: 9 },
  { hex: "7591", char: "疑", gloss: "duda", sample: "疑う（うたがう）", strokes: 14 },
  { hex: "771f", char: "真", gloss: "verdad", sample: "真実（しんじつ）", strokes: 10 },
  { hex: "8a3c", char: "証", gloss: "prueba", sample: "証拠（しょうこ）", strokes: 12 },
  { hex: "78ba", char: "確", gloss: "seguro", sample: "確か（たしか）", strokes: 15 },
];

/* ---------------- Helpers ---------------- */
function useChevron(open: boolean) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: open ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  }, [open]);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  return rotate;
}

/* ---------------- Screen ---------------- */
export default function N3_B2_U5_PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const heroH = 300;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tY = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [-80, 60, 100] });
  const scale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1] });

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const [openHazu, setOpenHazu] = useState(true);
  const [openNichi, setOpenNichi] = useState(false);
  const r1 = useChevron(openHazu);
  const r2 = useChevron(openNichi);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* HERO */}
      <Animated.View style={[styles.heroWrap, { height: heroH }]}>
        <Animated.Image
          source={require("../../../../assets/images/n3/b2_u5.webp")}
          style={[styles.heroImg, { transform: [{ translateY: tY }, { scale }] }]}
          resizeMode="cover"
        />
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <ExpoImage
            source={require("../../../../assets/images/leon_blanco_transparente.webp")}
            style={styles.heroMark}
          />
          <Text style={styles.heroTitle}>BLOQUE 2 — Práctica</Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>はずだ</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>にちがいない</Text></View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: heroH + 12, paddingBottom: 64 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 📘 Gramática */}
        <View style={styles.card}>
          <Text style={styles.h2}>📘 Gramática como en primaria</Text>

          <Text style={styles.h3}>Definiciones & uso</Text>
          {PRIMARIA.definiciones.map((d, i) => (
            <View key={i} style={styles.liDot}>
              <Text style={styles.p}><Text style={styles.bold}>{d.tag}</Text> — {d.exp}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Cómo se une</Text>
          {PRIMARIA.patrones.map((p, i) => (
            <View key={i} style={styles.codeBlock}><Text style={styles.code}>{p}</Text></View>
          ))}

          <Text style={styles.h3}>Pistas</Text>
          {PRIMARIA.pistas.map((s, i) => (
            <View key={i} style={styles.liDot}><Text style={styles.p}>{s}</Text></View>
          ))}
        </View>

        {/* 🗣️ Ejemplos */}
        <View style={styles.card}>
          <Text style={styles.h2}>🗣️ Ejemplos para escuchar y leer</Text>

          <Pressable onPress={() => setOpenHazu(!openHazu)} style={styles.toggleHeader}>
            <Text style={styles.h3}>1) 〜はずだ（lógica/plan）</Text>
            <Animated.View style={{ transform: [{ rotate: r1 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openHazu && EX_HAZU.map((ex, i) => (
            <View key={`hz-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}

          <Pressable onPress={() => setOpenNichi(!openNichi)} style={styles.toggleHeader}>
            <Text style={styles.h3}>2) 〜にちがいない（certeza fuerte）</Text>
            <Animated.View style={{ transform: [{ rotate: r2 }] }}>
              <MCI name="chevron-down" size={20} color="#0E1015" />
            </Animated.View>
          </Pressable>
          {openNichi && EX_NICHIGAI.map((ex, i) => (
            <View key={`nc-${i}`} style={styles.exampleRow}>
              <Pressable onPress={() => speakJa(ex.jp)} style={styles.playBtn}>
                <MCI name="volume-high" size={18} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.jp}>{ex.jp}</Text>
                <Text style={styles.romaji}>{ex.romaji}</Text>
                <Text style={styles.es}>{ex.es}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 🧩 ORDENAR */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧩 Construye la oración（並び替え）</Text>
        {ORDERS.map((o) => (<OrderQuestion key={o.id} q={o} onCorrect={playCorrect} />))}
        </View>

        {/* ✅ QUIZ */}
        <View style={styles.card}>
          <Text style={styles.h2}>✅ Práctica (elige la correcta)</Text>
          {QUIZ.map((q, idx) => (
            <QuizItem key={q.id} q={q} idx={idx} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* 🧪 EXTRA A（14） */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧪 Extra A — Integra todos los temas (14)</Text>
          {EXTRA_A.map((it) => (
            <MiniMC key={it.id} it={it} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* 🧪 EXTRA B（14, fácil） */}
        <View style={styles.card}>
          <Text style={styles.h2}>🧪 Extra B — Lectura/Inferencia (fácil, 14)</Text>
          {EXTRA_B.map((it) => (
            <MiniMCB key={it.id} it={it} onResult={(ok)=> ok?playCorrect():playWrong()} />
          ))}
        </View>

        {/* 🈶 KANJI */}
        <View style={styles.card}>
          <Text style={styles.h2}>🈶 Kanji de la unidad（10）</Text>
          <Text style={styles.p}>Toca “Trazos” para ver la imagen numerada. El badge muestra el total de trazos.</Text>
          <View style={styles.kanjiGrid}>
            {KANJI.map((k) => (
              <KanjiCard key={k.hex} k={k} onSpeak={() => speakJa(k.sample)} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */
function OrderQuestion({ q, onCorrect }: { q: OrderQ; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<null | boolean>(null);
  const pool = useRef<string[]>([...q.tokens].sort(() => Math.random() - 0.5)).current;

  const speakJa = (t: string) =>
    Speech.speak(t, { language: "ja-JP", rate: 0.96, pitch: 1.05 });

  const onPick = (t: string) => {
    if (done !== null) return;
    const arr = [...picked, t];
    setPicked(arr);
    if (arr.length === q.tokens.length) {
      const ok = arr.join("") === q.tokens.join("");
      setDone(ok);
      if (ok) onCorrect();
    }
  };

  const undo = () => { if (done !== null) return; setPicked((a) => a.slice(0, -1)); };
  const reset = () => { setPicked([]); setDone(null); };

  const border = done === null ? "rgba(0,0,0,0.08)" : done ? "#10B981" : "#EF4444";
  const bg = done === null ? "transparent" : done ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)";
  const col = done === null ? "#0E1015" : done ? "#0f9a6a" : "#c62828";

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.p}>{q.es}</Text>
      <View style={[styles.answerBox, { borderColor: border, backgroundColor: bg }]}>
        <Text style={[styles.jp, { color: col }]}>{picked.join("") || "　"}</Text>
      </View>
      <View style={styles.tokenRow}>
        {pool.map((t, i) => (
          <Pressable key={i} onPress={() => onPick(t)} style={styles.tokenBtn}>
            <Text style={styles.tokenTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={undo} style={styles.kBtn}><Text style={styles.kBtnTxt}>Deshacer</Text></Pressable>
        <Pressable onPress={reset} style={styles.kBtn}><Text style={styles.kBtnTxt}>Reiniciar</Text></Pressable>
        <Pressable onPress={() => speakJa(q.jp)} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
      {done !== null && (
        <Text style={[styles.gray, { marginTop: 6 }]}>
          <Text style={styles.bold}>Solución JP: </Text>{q.jp}（{q.romaji}）
        </Text>
      )}
      {done !== null && (
        <Text style={[styles.gray, { marginTop: 4 }]}>
          <Text style={styles.bold}>Traducción: </Text>{q.es}
        </Text>
      )}
    </View>
  );
}

function QuizItem({ q, idx, onResult }: { q: Q; idx: number; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const optStyle = (op: string) => {
    const pickedNow = sel === op;
    const border = !done ? "rgba(0,0,0,0.08)" : op === q.answer ? "#10B981" : pickedNow ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : op === q.answer ? "rgba(16,185,129,.12)" : pickedNow ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && op === q.answer ? "#0f9a6a" : done && pickedNow ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === q.answer);
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.qStem}>{String(idx + 1).padStart(2, "0")}．{q.stem}</Text>
      <View style={styles.optRow}>
        {q.options.map((op) => {
          const s = optStyle(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && (
        <>
          <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{q.explain}</Text>
          <Text style={[styles.explain, { marginTop: 4 }]}><Text style={styles.bold}>Solución JP: </Text>{q.solutionJP}</Text>
          <Text style={[styles.explain, { marginTop: 2 }]}><Text style={styles.bold}>Traducción: </Text>{q.solutionES}</Text>
        </>
      )}
    </View>
  );
}

function MiniMC({ it, onResult }: { it: ExtraAItem; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === it.respuesta);
  };

  const opt = (op: string) => {
    const picked = sel === op;
    const isAns = op === it.respuesta;
    const border = !done ? "rgba(0,0,0,0.08)" : isAns ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : isAns ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && isAns ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.p}><Text style={styles.bold}>Contexto:</Text> {it.contexto}</Text>
      <Text style={[styles.p, { marginTop: 4 }]}>{it.pregunta}</Text>
      <View style={styles.optRow}>
        {it.opciones.map((op) => {
          const s = opt(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && (
        <>
          <Text style={styles.explain}><Text style={styles.bold}>Pista: </Text>{it.pista}</Text>
          <Text style={[styles.explain, { marginTop: 4 }]}><Text style={styles.bold}>Solución JP: </Text>{it.solucionJP}</Text>
          <Text style={[styles.explain, { marginTop: 2 }]}><Text style={styles.bold}>Traducción: </Text>{it.solucionES}</Text>
        </>
      )}
    </View>
  );
}

function MiniMCB({ it, onResult }: { it: ExtraBItem; onResult: (ok:boolean)=>void }) {
  const [sel, setSel] = useState<string | null>(null);
  const done = sel !== null;

  const onPick = (op: string) => {
    if (done) return;
    setSel(op);
    onResult(op === it.respuesta);
  };

  const opt = (op: string) => {
    const picked = sel === op;
    const isAns = op === it.respuesta;
    const border = !done ? "rgba(0,0,0,0.08)" : isAns ? "#10B981" : picked ? "#EF4444" : "rgba(0,0,0,0.08)";
    const bg = !done ? "transparent" : isAns ? "rgba(16,185,129,.12)" : picked ? "rgba(239,68,68,.12)" : "transparent";
    const col = done && isAns ? "#0f9a6a" : done && picked ? "#c62828" : "#0E1015";
    return { border, bg, col };
  };

  return (
    <View style={styles.qItem}>
      <Text style={styles.p}>{it.texto}</Text>
      <View style={styles.optRow}>
        {it.opciones.map((op) => {
          const s = opt(op);
          return (
            <Pressable key={op} onPress={() => onPick(op)} style={[styles.optBtn, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.optTxt, { color: s.col }]}>{op}</Text>
            </Pressable>
          );
        })}
      </View>
      {done && (
        <>
          <Text style={styles.explain}><Text style={styles.bold}>Explicación: </Text>{it.razon}</Text>
          <Text style={[styles.explain, { marginTop: 4 }]}><Text style={styles.bold}>Solución JP: </Text>{it.solucionJP}</Text>
          <Text style={[styles.explain, { marginTop: 2 }]}><Text style={styles.bold}>Traducción: </Text>{it.solucionES}</Text>
        </>
      )}
    </View>
  );
}

function KanjiCard({ k, onSpeak }: { k: Kanji; onSpeak: () => void }) {
  const [showStroke, setShowStroke] = useState(false);

  const REQ: Record<string, any> = {
    "5fc5": require("../../../../assets/kanjivg/n3/5fc5_nums.webp"),
    "5b9a": require("../../../../assets/kanjivg/n3/5b9a_nums.webp"),
    "7531": require("../../../../assets/kanjivg/n3/7531_nums.webp"),
    "7406": require("../../../../assets/kanjivg/n3/7406_nums.webp"),
    "8a8d": require("../../../../assets/kanjivg/n3/8a8d_nums.webp"),
    "4fe1": require("../../../../assets/kanjivg/n3/4fe1_nums.webp"),
    "7591": require("../../../../assets/kanjivg/n3/7591_nums.webp"),
    "771f": require("../../../../assets/kanjivg/n3/771f_nums.webp"),
    "8a3c": require("../../../../assets/kanjivg/n3/8a3c_nums.webp"),
    "78ba": require("../../../../assets/kanjivg/n3/78ba_nums.webp"),
  };

  const src = REQ[k.hex];

  return (
    <View style={styles.kCard}>
      <View style={styles.kTop}>
        {/* Badge de nº de trazos */}
        <View style={styles.strokeBadge}>
          <Text style={styles.strokeBadgeTxt}>{k.strokes}</Text>
        </View>

        {!showStroke ? (
          <Text style={styles.kChar}>{k.char}</Text>
        ) : src ? (
          <ExpoImage
            source={src}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            cachePolicy="none"
            key={`${k.hex}-${showStroke ? "nums" : "char"}`}
          />
        ) : (
          <Text style={styles.kChar}>{k.char}</Text>
        )}
      </View>
      <View style={styles.kMeta}>
        <Text style={styles.kGloss}>{k.gloss}</Text>
        <Text style={styles.kSample}>{k.sample}</Text>
        <Text style={styles.kStrokesLine}>Trazos: {k.strokes}</Text>
      </View>
      <View style={styles.kActions}>
        <Pressable onPress={() => src && setShowStroke((s) => !s)} style={[styles.kBtn, { opacity: src ? 1 : 0.6 }]}>
          <Text style={styles.kBtnTxt}>{showStroke ? "Ocultar trazos" : "Trazos"}</Text>
        </Pressable>
        <Pressable onPress={onSpeak} style={styles.kIconBtn}>
          <MCI name="volume-high" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const R = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0C0F" },
  heroWrap: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden" },
  heroImg: { position: "absolute", width: "100%", height: "100%" },
  heroContent: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 18 },
  heroMark: { width: 78, height: 78, marginBottom: 6, opacity: 0.95 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: "rgba(0,0,0,.75)", textShadowRadius: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  chipTxt: { color: "#fff", fontWeight: "800" },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "#fff", borderRadius: R, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  h2: { fontSize: 16, fontWeight: "900", color: "#0E1015", marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: "900", color: "#0E1015", marginTop: 2, marginBottom: 6 },
  p: { color: "#1f2330", lineHeight: 20 },
  bold: { fontWeight: "900" },
  gray: { color: "#6B7280" },
  codeBlock: { backgroundColor: "#0b0c0f", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  code: { color: "#fff", fontWeight: "800", marginBottom: 4 },

  liDot: { marginTop: 4 },

  toggleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  exampleRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  jp: { fontSize: 15, fontWeight: "800", color: "#0E1015" },
  romaji: { color: "#6B7280", marginTop: 2 },
  es: { color: "#111827", marginTop: 2 },

  answerBox: { borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 8 },
  tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tokenBtn: { borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F6F7FB" },
  tokenTxt: { fontWeight: "800", color: "#0E1015" },

  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  kCard: { width: "48%", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", padding: 10 },
  kTop: { height: 110, borderRadius: 10, backgroundColor: "#F6F7FB", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  kChar: { fontSize: 64, fontWeight: "900", color: "#0E1015" },
  kMeta: { marginTop: 8 },
  kGloss: { fontWeight: "900", color: "#0E1015" },
  kSample: { color: "#6B7280", marginTop: 2 },
  kStrokesLine: { color: "#6B7280", marginTop: 2 },

  kActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  kBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#0E1015" },
  kBtnTxt: { color: "#fff", fontWeight: "900" },
  kIconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  qItem: { marginTop: 12 },
  qStem: { fontWeight: "800", color: "#0E1015", marginBottom: 8 },
  optRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optBtn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optTxt: { fontWeight: "800" },
  explain: { color: "#1f2330", marginTop: 6 },

  // Badge de nº de trazos
  strokeBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#0E1015",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  strokeBadgeTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
