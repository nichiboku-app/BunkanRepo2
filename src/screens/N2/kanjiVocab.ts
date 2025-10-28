// src/screens/N2/kanjiVocab.ts
// 3 palabras por kanji para práctica/examen
export type Vocab = { jp: string; romaji: string; es: string };

export const KANJI_VOCAB: Record<string, Vocab[]> = {
  "従": [
    { jp: "従業員", romaji: "juugyōin", es: "empleado/a" },
    { jp: "従う",   romaji: "shitagau", es: "obedecer / seguir" },
    { jp: "従来",   romaji: "jūrai",    es: "hasta ahora / tradicional" },
  ],
  "連": [
    { jp: "連絡",   romaji: "renraku",  es: "contacto / avisar" },
    { jp: "連続",   romaji: "renzoku",  es: "continuación" },
    { jp: "関連",   romaji: "kanren",   es: "relación / conexión" },
  ],
  "伴": [
    { jp: "伴う",   romaji: "tomonau",  es: "acompañar / conllevar" },
    { jp: "同伴",   romaji: "dōhan",    es: "acompañamiento" },
    { jp: "伴侶",   romaji: "hanryo",   es: "pareja / cónyuge" },
  ],
  "経": [
    { jp: "経験",   romaji: "keiken",   es: "experiencia" },
    { jp: "経営",   romaji: "keiei",    es: "gestión / administración" },
    { jp: "経由",   romaji: "keiyu",    es: "vía / pasando por" },
  ],
  "減": [
    { jp: "減る",   romaji: "heru",     es: "disminuir" },
    { jp: "減少",   romaji: "genshō",   es: "reducción" },
    { jp: "削減",   romaji: "sakugen",  es: "recorte / reducción" },
  ],
  "増": [
    { jp: "増える", romaji: "fueru",    es: "aumentar" },
    { jp: "増加",   romaji: "zōka",     es: "incremento" },
    { jp: "増大",   romaji: "zōdai",    es: "agrandamiento / aumento" },
  ],
  "変": [
    { jp: "変化",   romaji: "henka",    es: "cambio" },
    { jp: "大変",   romaji: "taihen",   es: "tremendo / difícil" },
    { jp: "変更",   romaji: "henkō",    es: "modificación" },
  ],
  "成": [
    { jp: "成功",   romaji: "seikō",    es: "éxito" },
    { jp: "成長",   romaji: "seichō",   es: "crecimiento" },
    { jp: "完成",   romaji: "kansei",   es: "terminación / completar" },
  ],
  "発": [
    { jp: "発表",   romaji: "happyō",   es: "presentación / anuncio" },
    { jp: "出発",   romaji: "shuppatsu",es: "salida / partida" },
    { jp: "発見",   romaji: "hakken",   es: "descubrimiento" },
  ],
  "展": [
    { jp: "展示",   romaji: "tenji",    es: "exhibición" },
    { jp: "発展",   romaji: "hatten",   es: "desarrollo / progreso" },
    { jp: "展開",   romaji: "tenkai",   es: "despliegue / desarrollo" },
  ],
  "需": [
    { jp: "需要",   romaji: "juyō",     es: "demanda (econ.)" },
    { jp: "需給",   romaji: "jukyū",    es: "oferta y demanda" },
    { jp: "必需品", romaji: "hitsuju-hin", es: "artículo de primera necesidad" },
  ],
  "環": [
    { jp: "環境",   romaji: "kankyō",   es: "medioambiente / entorno" },
    { jp: "循環",   romaji: "junkan",   es: "circulación / ciclo" },
    { jp: "環状線", romaji: "kanjō-sen", es: "línea circular (tren)" },
  ],
};
