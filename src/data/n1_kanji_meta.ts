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

  {
    hex: "8AAD", k: "読", on: ["ドク"], kun: ["よ.む"],
    es: "leer",
    words: [
      { jp: "読書", reading: "どくしょ", es: "lectura (actividad)" },
      { jp: "読解", reading: "どっかい", es: "comprensión lectora" },
      { jp: "読者", reading: "どくしゃ", es: "lector" },
      { jp: "読む", reading: "よむ", es: "leer" },
    ],
  },
  {
    hex: "8A18", k: "記", on: ["キ"], kun: ["しる.す"],
    es: "registrar; anotar",
    words: [
      { jp: "日記", reading: "にっき", es: "diario" },
      { jp: "記録", reading: "きろく", es: "registro" },
      { jp: "記事", reading: "きじ", es: "artículo (nota)" },
      { jp: "記す", reading: "しるす", es: "anotar" },
    ],
  },
  {
    hex: "8A9E", k: "語", on: ["ゴ"], kun: ["かた.る", "かた.らう"],
    es: "lengua; hablar",
    words: [
      { jp: "日本語", reading: "にほんご", es: "japonés" },
      { jp: "語彙", reading: "ごい", es: "vocabulario" },
      { jp: "語学", reading: "ごがく", es: "estudio de idiomas" },
      { jp: "語る", reading: "かたる", es: "contar/relatar" },
    ],
  },
  {
    hex: "8A55", k: "評", on: ["ヒョウ"], kun: [],
    es: "evaluar; crítica",
    words: [
      { jp: "評価", reading: "ひょうか", es: "evaluación" },
      { jp: "批評", reading: "ひひょう", es: "crítica" },
      { jp: "好評", reading: "こうひょう", es: "buena reputación" },
      { jp: "定評", reading: "ていひょう", es: "prestigio (reconocido)" },
    ],
  },
  {
    hex: "8A08", k: "計", on: ["ケイ"], kun: ["はか.る"],
    es: "medir; plan",
    words: [
      { jp: "計画", reading: "けいかく", es: "plan" },
      { jp: "時計", reading: "とけい", es: "reloj" },
      { jp: "統計", reading: "とうけい", es: "estadística" },
      { jp: "計る", reading: "はかる", es: "medir" },
    ],
  },
  {
    hex: "89E3", k: "解", on: ["カイ", "ゲ"], kun: ["と.く", "と.ける"],
    es: "resolver; desatar",
    words: [
      { jp: "理解", reading: "りかい", es: "comprensión" },
      { jp: "誤解", reading: "ごかい", es: "malentendido" },
      { jp: "解説", reading: "かいせつ", es: "explicación" },
      { jp: "解く", reading: "とく", es: "resolver/desatar" },
    ],
  },
  {
    hex: "8996", k: "視", on: ["シ"], kun: ["み.る"],
    es: "observar; vista",
    words: [
      { jp: "視覚", reading: "しかく", es: "visión" },
      { jp: "無視", reading: "むし", es: "ignorar" },
      { jp: "監視", reading: "かんし", es: "vigilancia" },
      { jp: "視る", reading: "みる", es: "ver/observar (atento)" },
    ],
  },
  {
    hex: "898B", k: "見", on: ["ケン"], kun: ["み.る", "み.える", "み.せる"],
    es: "ver; mostrar",
    words: [
      { jp: "意見", reading: "いけん", es: "opinión" },
      { jp: "発見", reading: "はっけん", es: "descubrimiento" },
      { jp: "見学", reading: "けんがく", es: "visita de estudio" },
      { jp: "見せる", reading: "みせる", es: "mostrar" },
    ],
  },
  {
    hex: "77E5", k: "知", on: ["チ"], kun: ["し.る"],
    es: "saber; conocer",
    words: [
      { jp: "知識", reading: "ちしき", es: "conocimiento" },
      { jp: "通知", reading: "つうち", es: "aviso/notificación" },
      { jp: "知人", reading: "ちじん", es: "conocido" },
      { jp: "知る", reading: "しる", es: "saber" },
    ],
  },
  {
    hex: "7684", k: "的", on: ["テキ"], kun: ["まと"],
    es: "objetivo; -mente",
    words: [
      { jp: "目的", reading: "もくてき", es: "objetivo" },
      { jp: "具体的", reading: "ぐたいてき", es: "concreto" },
      { jp: "象徴的", reading: "しょうちょうてき", es: "simbólico" },
      { jp: "的", reading: "まと", es: "blanco/objetivo" },
    ],
  },
  {
    hex: "76EE", k: "目", on: ["モク", "ボク"], kun: ["め"],
    es: "ojo; objetivo",
    words: [
      { jp: "目的", reading: "もくてき", es: "objetivo" },
      { jp: "注目", reading: "ちゅうもく", es: "atención" },
      { jp: "目標", reading: "もくひょう", es: "meta" },
      { jp: "目", reading: "め", es: "ojo" },
    ],
  },
  {
    hex: "773C", k: "眼", on: ["ガン", "ゲン"], kun: ["まなこ"],
    es: "globo ocular; mirada",
    words: [
      { jp: "眼科", reading: "がんか", es: "oftalmología" },
      { jp: "主眼", reading: "しゅがん", es: "objetivo principal" },
      { jp: "肉眼", reading: "にくがん", es: "ojo desnudo" },
      { jp: "眼", reading: "まなこ", es: "ojo (literario)" },
    ],
  },
  {
    hex: "77ED", k: "短", on: ["タン"], kun: ["みじか.い"],
    es: "corto; breve",
    words: [
      { jp: "短期", reading: "たんき", es: "corto plazo" },
      { jp: "短所", reading: "たんしょ", es: "punto débil" },
      { jp: "短縮", reading: "たんしゅく", es: "acortamiento" },
      { jp: "短い", reading: "みじかい", es: "corto" },
    ],
  },
  {
    hex: "7D4C", k: "経", on: ["ケイ", "キョウ"], kun: ["へ.る"],
    es: "pasar; economía",
    words: [
      { jp: "経済", reading: "けいざい", es: "economía" },
      { jp: "経験", reading: "けいけん", es: "experiencia" },
      { jp: "経由", reading: "けいゆ", es: "vía/por medio de" },
      { jp: "経る", reading: "へる", es: "pasar por" },
    ],
  },
  {
    hex: "7D50", k: "結", on: ["ケツ"], kun: ["むす.ぶ"],
    es: "atar; conclusión",
    words: [
      { jp: "結論", reading: "けつろん", es: "conclusión" },
      { jp: "結婚", reading: "けっこん", es: "matrimonio" },
      { jp: "結果", reading: "けっか", es: "resultado" },
      { jp: "結ぶ", reading: "むすぶ", es: "atar/unir" },
    ],
  },
  {
    hex: "8003", k: "考", on: ["コウ"], kun: ["かんが.える"],
    es: "pensar",
    words: [
      { jp: "考察", reading: "こうさつ", es: "consideración" },
      { jp: "参考", reading: "さんこう", es: "referencia" },
      { jp: "再考", reading: "さいこう", es: "reconsideración" },
      { jp: "考える", reading: "かんがえる", es: "pensar" },
    ],
  },
  {
    hex: "8033", k: "耳", on: ["ジ"], kun: ["みみ"],
    es: "oído; oreja",
    words: [
      { jp: "中耳炎", reading: "ちゅうじえん", es: "otitis media" },
      { jp: "空耳", reading: "そらみみ", es: "oír mal / pareidolia auditiva" },
      { jp: "耳鼻科", reading: "じびか", es: "otorrinolaringología" },
      { jp: "耳", reading: "みみ", es: "oreja" },
    ],
  },
  {
    hex: "81EA", k: "自", on: ["ジ", "シ"], kun: ["みずか.ら"],
    es: "sí mismo; auto-",
    words: [
      { jp: "自信", reading: "じしん", es: "autoconfianza" },
      { jp: "自由", reading: "じゆう", es: "libertad" },
      { jp: "自然", reading: "しぜん", es: "naturaleza" },
      { jp: "自ら", reading: "みずから", es: "uno mismo" },
    ],
  },
  {
    hex: "8D70", k: "走", on: ["ソウ"], kun: ["はし.る"],
    es: "correr",
    words: [
      { jp: "走行", reading: "そうこう", es: "circular (vehículo)" },
      { jp: "競走", reading: "きょうそう", es: "carrera" },
      { jp: "暴走", reading: "ぼうそう", es: "descontrolado" },
      { jp: "走る", reading: "はしる", es: "correr" },
    ],
  },
  {
    hex: "8D77", k: "起", on: ["キ"], kun: ["お.きる", "お.こる", "お.こす"],
    es: "levantarse; ocurrir",
    words: [
      { jp: "起動", reading: "きどう", es: "arranque" },
      { jp: "起源", reading: "きげん", es: "origen" },
      { jp: "早起き", reading: "はやおき", es: "madrugar" },
      { jp: "起こす", reading: "おこす", es: "causar / levantar" },
    ],
  },
  {
    hex: "8DB3", k: "足", on: ["ソク"], kun: ["あし", "た.りる", "た.す"],
    es: "pie; suficiente",
    words: [
      { jp: "不足", reading: "ふそく", es: "insuficiencia" },
      { jp: "遠足", reading: "えんそく", es: "excursión" },
      { jp: "満足", reading: "まんぞく", es: "satisfacción" },
      { jp: "足りる", reading: "たりる", es: "bastar" },
    ],
  },
  {
    hex: "8EAB", k: "身", on: ["シン"], kun: ["み"],
    es: "cuerpo; uno mismo",
    words: [
      { jp: "出身", reading: "しゅっしん", es: "procedencia" },
      { jp: "身分", reading: "みぶん", es: "estatus" },
      { jp: "自身", reading: "じしん", es: "uno mismo" },
      { jp: "身", reading: "み", es: "cuerpo/mi ser" },
    ],
  },
  {
    hex: "9053", k: "道", on: ["ドウ"], kun: ["みち"],
    es: "camino; vía",
    words: [
      { jp: "茶道", reading: "さどう／ちゃどう", es: "camino del té" },
      { jp: "柔道", reading: "じゅうどう", es: "judo" },
      { jp: "道具", reading: "どうぐ", es: "herramienta" },
      { jp: "道", reading: "みち", es: "camino" },
    ],
  },
  {
    hex: "91D1", k: "金", on: ["キン", "コン"], kun: ["かね", "かな"],
    es: "oro; dinero; metal",
    words: [
      { jp: "金属", reading: "きんぞく", es: "metal" },
      { jp: "料金", reading: "りょうきん", es: "tarifa" },
      { jp: "現金", reading: "げんきん", es: "efectivo" },
      { jp: "金", reading: "かね", es: "dinero" },
    ],
  },
  {
    hex: "9577", k: "長", on: ["チョウ"], kun: ["なが.い"],
    es: "largo; jefe",
    words: [
      { jp: "社長", reading: "しゃちょう", es: "presidente (empresa)" },
      { jp: "成長", reading: "せいちょう", es: "crecimiento" },
      { jp: "校長", reading: "こうちょう", es: "director (escuela)" },
      { jp: "長い", reading: "ながい", es: "largo" },
    ],
  },
  {
    hex: "982D", k: "頭", on: ["トウ", "ズ"], kun: ["あたま"],
    es: "cabeza",
    words: [
      { jp: "頭痛", reading: "ずつう", es: "dolor de cabeza" },
      { jp: "先頭", reading: "せんとう", es: "cabeza (fila)" },
      { jp: "頭脳", reading: "ずのう", es: "cerebro/intelecto" },
      { jp: "頭", reading: "あたま", es: "cabeza" },
    ],
  },
  {
    hex: "9996", k: "首", on: ["シュ"], kun: ["くび"],
    es: "cuello; jefe",
    words: [
      { jp: "首都", reading: "しゅと", es: "capital" },
      { jp: "首相", reading: "しゅしょう", es: "primer ministro" },
      { jp: "首位", reading: "しゅい", es: "primer lugar" },
      { jp: "首", reading: "くび", es: "cuello" },
    ],
  },
  {
    hex: "610F", k: "意", on: ["イ"], kun: [],
    es: "intención; idea",
    words: [
      { jp: "意味", reading: "いみ", es: "significado" },
      { jp: "意見", reading: "いけん", es: "opinión" },
      { jp: "意識", reading: "いしき", es: "conciencia" },
      { jp: "決意", reading: "けつい", es: "determinación" },
    ],
  },
  {
    hex: "601D", k: "思", on: ["シ"], kun: ["おも.う"],
    es: "pensar; creer",
    words: [
      { jp: "思考", reading: "しこう", es: "pensamiento" },
      { jp: "思想", reading: "しそう", es: "ideología" },
      { jp: "思い出", reading: "おもいで", es: "recuerdo" },
      { jp: "思う", reading: "おもう", es: "pensar/creer" },
    ],
  },
  {
    hex: "60C5", k: "情", on: ["ジョウ"], kun: ["なさ.け"],
    es: "emoción; situación",
    words: [
      { jp: "感情", reading: "かんじょう", es: "emoción" },
      { jp: "事情", reading: "じじょう", es: "circunstancias" },
      { jp: "表情", reading: "ひょうじょう", es: "expresión (facial)" },
      { jp: "情け", reading: "なさけ", es: "compasión" },
    ],
  },
  {
    hex: "5FC3", k: "心", on: ["シン"], kun: ["こころ"],
    es: "corazón; mente",
    words: [
      { jp: "中心", reading: "ちゅうしん", es: "centro" },
      { jp: "心理", reading: "しんり", es: "psicología" },
      { jp: "安心", reading: "あんしん", es: "tranquilidad" },
      { jp: "心", reading: "こころ", es: "corazón/mente" },
    ],
  },
  {
    hex: "624B", k: "手", on: ["シュ"], kun: ["て"],
    es: "mano",
    words: [
      { jp: "手段", reading: "しゅだん", es: "medio/recurso" },
      { jp: "選手", reading: "せんしゅ", es: "jugador/atleta" },
      { jp: "手紙", reading: "てがみ", es: "carta" },
      { jp: "手", reading: "て", es: "mano" },
    ],
  },
  {
    hex: "65B0", k: "新", on: ["シン"], kun: ["あたら.しい"],
    es: "nuevo",
    words: [
      { jp: "新聞", reading: "しんぶん", es: "periódico" },
      { jp: "新規", reading: "しんき", es: "nuevo/reciente" },
      { jp: "更新", reading: "こうしん", es: "actualización" },
      { jp: "新しい", reading: "あたらしい", es: "nuevo" },
    ],
  },
  {
    hex: "66F8", k: "書", on: ["ショ"], kun: ["か.く"],
    es: "escribir; documento",
    words: [
      { jp: "読書", reading: "どくしょ", es: "lectura (actividad)" },
      { jp: "書類", reading: "しょるい", es: "documentos" },
      { jp: "辞書", reading: "じしょ", es: "diccionario" },
      { jp: "書く", reading: "かく", es: "escribir" },
    ],
  },
  {
    hex: "6709", k: "有", on: ["ユウ"], kun: ["あ.る"],
    es: "tener; existir",
    words: [
      { jp: "有名", reading: "ゆうめい", es: "famoso" },
      { jp: "所有", reading: "しょゆう", es: "propiedad" },
      { jp: "有利", reading: "ゆうり", es: "ventajoso" },
      { jp: "有る", reading: "ある", es: "haber/existir" },
    ],
  },
  {
    hex: "671F", k: "期", on: ["キ"], kun: [],
    es: "período; plazo",
    words: [
      { jp: "学期", reading: "がっき", es: "semestre" },
      { jp: "期限", reading: "きげん", es: "fecha límite" },
      { jp: "期待", reading: "きたい", es: "expectativa" },
      { jp: "短期", reading: "たんき", es: "corto plazo" },
    ],
  },
  {
    hex: "6C42", k: "求", on: ["キュウ"], kun: ["もと.める"],
    es: "pedir; buscar",
    words: [
      { jp: "要求", reading: "ようきゅう", es: "exigencia" },
      { jp: "追求", reading: "ついきゅう", es: "búsqueda" },
      { jp: "需要と供給", reading: "じゅようときょうきゅう", es: "demanda y oferta" },
      { jp: "求める", reading: "もとめる", es: "solicitar/buscar" },
    ],
  },
  {
    hex: "6C7A", k: "決", on: ["ケツ"], kun: ["き.める", "き.まる"],
    es: "decidir",
    words: [
      { jp: "決定", reading: "けってい", es: "decisión" },
      { jp: "解決", reading: "かいけつ", es: "solución" },
      { jp: "決勝", reading: "けっしょう", es: "final (competición)" },
      { jp: "決める", reading: "きめる", es: "decidir" },
    ],
  },
  {
    hex: "6D3B", k: "活", on: ["カツ"], kun: [],
    es: "activo; vida",
    words: [
      { jp: "生活", reading: "せいかつ", es: "vida cotidiana" },
      { jp: "活動", reading: "かつどう", es: "actividad" },
      { jp: "活用", reading: "かつよう", es: "aprovechamiento" },
      { jp: "活気", reading: "かっき", es: "vitalidad" },
    ],
  },
  {
    hex: "6D77", k: "海", on: ["カイ"], kun: ["うみ"],
    es: "mar",
    words: [
      { jp: "海外", reading: "かいがい", es: "extranjero" },
      { jp: "海岸", reading: "かいがん", es: "costa" },
      { jp: "海水", reading: "かいすい", es: "agua de mar" },
      { jp: "海", reading: "うみ", es: "mar" },
    ],
  },


];
