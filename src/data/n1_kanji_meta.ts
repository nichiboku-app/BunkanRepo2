// Kanji N1 con lecturas, significado y 4 palabras de ejemplo
// Nota: agrega más entradas siguiendo el mismo formato para llegar a 200.
export type N1KanjiMeta = {
  hex: string;         // Unicode hex (sin "0x")
  k: string;           // Carácter
  on: string[];        // lecturas ON
  kun: string[];       // lecturas KUN
  es: string;          // significado breve ES
  words: { jp: string; reading: string; es: string }[]; // 4 ejemplos
};

export const N1_KANJI_META: N1KanjiMeta[] = [
  {
    hex: "61F2", k: "懲", on: ["チョウ"], kun: ["こ.りる", "こ.らす", "こ.らしめる"],
    es: "castigar; escarmentar",
    words: [
      { jp: "懲戒", reading: "ちょうかい", es: "disciplina/sanción" },
      { jp: "懲罰", reading: "ちょうばつ", es: "castigo" },
      { jp: "懲役", reading: "ちょうえき", es: "trabajos forzados" },
      { jp: "懲りる", reading: "こりる", es: "escarmentar" },
    ],
  },
  {
    hex: "9867", k: "顧", on: ["コ"], kun: ["かえり.みる"],
    es: "considerar; cliente",
    words: [
      { jp: "顧客", reading: "こきゃく", es: "cliente" },
      { jp: "顧問", reading: "こもん", es: "asesor" },
      { jp: "回顧", reading: "かいこ", es: "retrospectiva" },
      { jp: "顧みる", reading: "かえりみる", es: "considerar/reflexionar" },
    ],
  },
  {
    hex: "8B19", k: "謙", on: ["ケン"], kun: ["へりくだ.る"],
    es: "modesto; humilde",
    words: [
      { jp: "謙虚", reading: "けんきょ", es: "humildad" },
      { jp: "謙遜", reading: "けんそん", es: "modestia" },
      { jp: "謙譲語", reading: "けんじょうご", es: "lenguaje humilde" },
      { jp: "へりくだる", reading: "へりくだる", es: "humillarse (ser humilde)" },
    ],
  },
  {
    hex: "52E7", k: "勧", on: ["カン"], kun: ["すす.める"],
    es: "recomendar; fomentar",
    words: [
      { jp: "勧誘", reading: "かんゆう", es: "captación/invitación" },
      { jp: "勧告", reading: "かんこく", es: "recomendación/aviso" },
      { jp: "勧進", reading: "かんじん", es: "recaudación (trad.)" },
      { jp: "勧める", reading: "すすめる", es: "recomendar" },
    ],
  },
  {
    hex: "8B39", k: "謹", on: ["キン"], kun: ["つつし.む"],
    es: "respetuoso; prudente",
    words: [
      { jp: "謹賀新年", reading: "きんがしんねん", es: "Feliz Año Nuevo (formal)" },
      { jp: "謹慎", reading: "きんしん", es: "arresto domiciliario/abstinencia" },
      { jp: "謹書", reading: "きんしょ", es: "escrito respetuosamente" },
      { jp: "謹む", reading: "つつしむ", es: "ser prudente" },
    ],
  },
  {
    hex: "61D0", k: "懐", on: ["カイ"], kun: ["ふところ", "なつ.かしい", "なつ.かしむ", "なつ.く"],
    es: "pecho/bolsillo; añorar",
    words: [
      { jp: "懐疑", reading: "かいぎ", es: "escepticismo" },
      { jp: "懐古", reading: "かいこ", es: "nostalgia" },
      { jp: "懐中電灯", reading: "かいちゅうでんとう", es: "linterna" },
      { jp: "懐かしい", reading: "なつかしい", es: "nostálgico" },
    ],
  },
  {
    hex: "8CE0", k: "賠", on: ["バイ"], kun: [],
    es: "indemnizar",
    words: [
      { jp: "賠償", reading: "ばいしょう", es: "indemnización" },
      { jp: "損害賠償", reading: "そんがいばいしょう", es: "daños y perjuicios" },
      { jp: "賠償金", reading: "ばいしょうきん", es: "compensación monetaria" },
      { jp: "国家賠償", reading: "こっかばいしょう", es: "responsabilidad del Estado" },
    ],
  },
  {
    hex: "8CC4", k: "賄", on: ["ワイ"], kun: ["まかな.う"],
    es: "sobornar; sufragar",
    words: [
      { jp: "賄賂", reading: "わいろ", es: "soborno" },
      { jp: "贈賄", reading: "ぞうわい", es: "cohecho (dar)" },
      { jp: "収賄", reading: "しゅうわい", es: "cohecho (recibir)" },
      { jp: "賄う", reading: "まかなう", es: "sufragar/proveer" },
    ],
  },
  {
    hex: "8CD3", k: "賓", on: ["ヒン"], kun: [],
    es: "huésped; invitado",
    words: [
      { jp: "来賓", reading: "らいひん", es: "invitado" },
      { jp: "主賓", reading: "しゅひん", es: "invitado de honor" },
      { jp: "賓客", reading: "ひんきゃく", es: "huésped" },
      { jp: "外賓", reading: "がいひん", es: "visitante extranjero (formal)" },
    ],
  },
  {
    hex: "8B01", k: "謁", on: ["エツ"], kun: [],
    es: "audiencia (solemne)",
    words: [
      { jp: "謁見", reading: "えっけん", es: "audiencia" },
      { jp: "拝謁", reading: "はいえつ", es: "audiencia imperial" },
      { jp: "内謁", reading: "ないえつ", es: "audiencia privada" },
      { jp: "謁する", reading: "えっする", es: "tener audiencia" },
    ],
  },
  {
    hex: "8B00", k: "謀", on: ["ボウ"], kun: ["はか.る"],
    es: "tramar; conspirar",
    words: [
      { jp: "陰謀", reading: "いんぼう", es: "complot" },
      { jp: "共謀", reading: "きょうぼう", es: "conspiración" },
      { jp: "謀略", reading: "ぼうりゃく", es: "estratagema" },
      { jp: "謀る", reading: "はかる", es: "tramar/maquinar" },
    ],
  },
  {
    hex: "790E", k: "礎", on: ["ソ"], kun: ["いしずえ"],
    es: "piedra angular; base",
    words: [
      { jp: "礎石", reading: "そせき", es: "piedra angular" },
      { jp: "定礎", reading: "ていそ", es: "colocación de primera piedra" },
      { jp: "国の礎", reading: "くにのいしずえ", es: "pilar del país" },
      { jp: "文化の礎", reading: "ぶんかのいしずえ", es: "pilar de la cultura" },
    ],
  },
  {
    hex: "935B", k: "鍛", on: ["タン"], kun: ["きた.える"],
    es: "forjar; entrenar",
    words: [
      { jp: "鍛錬", reading: "たんれん", es: "entrenamiento/templado" },
      { jp: "鍛造", reading: "たんぞう", es: "forja" },
      { jp: "鍛工", reading: "たんこう", es: "herrero" },
      { jp: "鍛える", reading: "きたえる", es: "entrenar/forjar" },
    ],
  },
  {
    hex: "93AE", k: "鎮", on: ["チン"], kun: ["しず.める", "しず.まる"],
    es: "apaciguar; sofocar",
    words: [
      { jp: "鎮圧", reading: "ちんあつ", es: "represión/sofocar" },
      { jp: "鎮静", reading: "ちんせい", es: "sedación/calma" },
      { jp: "鎮魂", reading: "ちんこん", es: "reposo de almas" },
      { jp: "鎮める", reading: "しずめる", es: "apaciguar" },
    ],
  },
  {
    hex: "61F8", k: "懸", on: ["ケン", "ケ"], kun: ["か.ける", "か.かる"],
    es: "suspender; preocupación",
    words: [
      { jp: "懸念", reading: "けねん", es: "preocupación" },
      { jp: "懸賞", reading: "けんしょう", es: "recompensa/premio" },
      { jp: "懸命", reading: "けんめい", es: "con esmero" },
      { jp: "懸ける", reading: "かける", es: "colgar/apostar" },
    ],
  },
  {
    hex: "8B72", k: "譲", on: ["ジョウ"], kun: ["ゆず.る"],
    es: "ceder; transferir",
    words: [
      { jp: "譲渡", reading: "じょうと", es: "cesión/transferencia" },
      { jp: "譲歩", reading: "じょうほ", es: "concesión" },
      { jp: "謙譲", reading: "けんじょう", es: "modestia (humilde)" },
      { jp: "譲る", reading: "ゆずる", es: "ceder" },
    ],
  },
  {
    hex: "7E4A", k: "繊", on: ["セン"], kun: [],
    es: "fibra; delicado",
    words: [
      { jp: "繊維", reading: "せんい", es: "fibra" },
      { jp: "繊細", reading: "せんさい", es: "delicado/sutil" },
      { jp: "天然繊維", reading: "てんねんせんい", es: "fibras naturales" },
      { jp: "化学繊維", reading: "かがくせんい", es: "fibras sintéticas" },
    ],
  },
  {
    hex: "983B", k: "頻", on: ["ヒン"], kun: [],
    es: "frecuencia; a menudo",
    words: [
      { jp: "頻度", reading: "ひんど", es: "frecuencia" },
      { jp: "頻繁", reading: "ひんぱん", es: "a menudo" },
      { jp: "高頻度", reading: "こうひんど", es: "alta frecuencia" },
      { jp: "低頻度", reading: "ていひんど", es: "baja frecuencia" },
    ],
  },
  {
    hex: "8074", k: "聴", on: ["チョウ"], kun: ["き.く"],
    es: "escuchar (atento)",
    words: [
      { jp: "聴覚", reading: "ちょうかく", es: "audición" },
      { jp: "傾聴", reading: "けいちょう", es: "escucha activa" },
      { jp: "聴取", reading: "ちょうしゅ", es: "recepción/escucha" },
      { jp: "視聴者", reading: "しちょうしゃ", es: "audiencia (TV/web)" },
    ],
  },
  {
    hex: "6182", k: "憂", on: ["ユウ"], kun: ["うれ.える", "うれ.い"],
    es: "aflicción; preocupación",
    words: [
      { jp: "憂鬱", reading: "ゆううつ", es: "melancolía" },
      { jp: "憂慮", reading: "ゆうりょ", es: "preocupación" },
      { jp: "憂国", reading: "ゆうこく", es: "patriotismo (preocupación por el país)" },
      { jp: "憂える", reading: "うれえる", es: "preocuparse" },
    ],
  },
  {
    hex: "9855", k: "顕", on: ["ケン"], kun: ["あらわ.れる"],
    es: "manifiesto; evidente",
    words: [
      { jp: "顕著", reading: "けんちょ", es: "notable" },
      { jp: "顕微鏡", reading: "けんびきょう", es: "microscopio" },
      { jp: "顕現", reading: "けんげん", es: "manifestación" },
      { jp: "顕在化", reading: "けんざいか", es: "salir a la luz" },
    ],
  },
  {
    hex: "61C7", k: "懇", on: ["コン"], kun: ["ねんご.ろ"],
    es: "cordial; cercano",
    words: [
      { jp: "懇談", reading: "こんだん", es: "charla amistosa" },
      { jp: "懇親会", reading: "こんしんかい", es: "convivio/meetup" },
      { jp: "懇請", reading: "こんせい", es: "ruego; súplica" },
      { jp: "懇切", reading: "こんせつ", es: "amable/detallado" },
    ],
  },
];
