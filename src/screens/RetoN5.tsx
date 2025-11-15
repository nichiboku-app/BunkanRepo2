import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 🦝 Imágenes del mapache
const tanukiNormal = require('../../assets/tanuki.png');
const tanukiFail = require('../../assets/mapachemalo.png');
const tanukiHappy = require('../../assets/mapachefeliz.png');

// 📝 Tipo de pregunta
type Section = 'goi' | 'bunpou' | 'moji' | 'dokkai' | 'gengochishiki';

type Question = {
  question: string;
  options: string[];
  correct: string;
  hint: string;
  section: Section;
};

// ---------- NIVELES Y FASES ----------

type PhaseConfig = {
  id: number;
  name: string;
};

type LevelConfig = {
  id: number;
  name: string;
  phases: PhaseConfig[];
};

const QUESTIONS_PER_PHASE = 10;
const PHASES_PER_LEVEL = 5;
const TOTAL_LEVELS = 4;
const TOTAL_PHASES = TOTAL_LEVELS * PHASES_PER_LEVEL;

// 4 niveles * 5 fases * 10 preguntas = 200 preguntas
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Nivel 1 · Sendero del Bosque',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario A' },
      { id: 2, name: 'Fase 2 · Gramática A' },
      { id: 3, name: 'Fase 3 · Kanji A' },
      { id: 4, name: 'Fase 4 · Lectura A' },
      { id: 5, name: 'Fase 5 · Expresiones A' },
    ],
  },
  {
    id: 2,
    name: 'Nivel 2 · Aldea Tanuki',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario B' },
      { id: 2, name: 'Fase 2 · Gramática B' },
      { id: 3, name: 'Fase 3 · Kanji B' },
      { id: 4, name: 'Fase 4 · Lectura B' },
      { id: 5, name: 'Fase 5 · Expresiones B' },
    ],
  },
  {
    id: 3,
    name: 'Nivel 3 · Templo del Kanji',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario C' },
      { id: 2, name: 'Fase 2 · Gramática C' },
      { id: 3, name: 'Fase 3 · Kanji C' },
      { id: 4, name: 'Fase 4 · Lectura C' },
      { id: 5, name: 'Fase 5 · Expresiones C' },
    ],
  },
  {
    id: 4,
    name: 'Nivel 4 · Monte JLPT N5',
    phases: [
      { id: 1, name: 'Fase 1 · Vocabulario D' },
      { id: 2, name: 'Fase 2 · Gramática D' },
      { id: 3, name: 'Fase 3 · Kanji D' },
      { id: 4, name: 'Fase 4 · Lectura D' },
      { id: 5, name: 'Fase 5 · Expresiones D' },
    ],
  },
];


// ⚠️ Banco de preguntas (Total: 230 preguntas)
export const questions: Question[] = [
  // ==== GOI (Vocabulario: 60 preguntas) ====

  {
    question: "¿Cuál es el significado de 'おとこ'?",
    options: ['Mujer', 'Hombre', 'Niño', 'Perro'],
    correct: 'Hombre',
    hint: 'おとこ (男) se refiere a un varón o hombre adulto.',
    section: 'goi',
  },
  {
    question: "Elige la traducción correcta de 'Reloj'.",
    options: ['とけい', 'おかね', 'じかん', 'ふでばこ'],
    correct: 'とけい',
    hint: 'とけい (時計) es la palabra general para reloj o cronómetro.',
    section: 'goi',
  },
  {
    question: "Elige el verbo que significa 'comer'.",
    options: ['のむ', 'たべる', 'かく', 'はなす'],
    correct: 'たべる',
    hint: 'たべる (食べる) es el verbo de Grupo II para comer.',
    section: 'goi',
  },
  {
    question: "Elige el adjetivo que significa 'caliente' (para el clima).",
    options: ['さむい', 'あつい', 'つめたい', 'やすい'],
    correct: 'あつい',
    hint: 'あつい (暑い) se usa para describir el calor ambiental o del clima.',
    section: 'goi',
  },
  {
    question: "La palabra para 'mañana' (día siguiente) es:",
    options: ['せんしゅう', 'きょう', 'きのう', 'あした'],
    correct: 'あした',
    hint: 'あした o あす es la forma estándar de referirse al día de mañana.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'まいにち'?",
    options: ['Cada semana', 'Cada día', 'Cada mes', 'Cada año'],
    correct: 'Cada día',
    hint: 'まい (毎) significa "cada" y にち (日) significa "día".',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'universidad'.",
    options: ['がっこう', 'こうこう', 'だいがく', 'ちゅうがく'],
    correct: 'だいがく',
    hint: 'だいがく (大学) es el término japonés para universidad.',
    section: 'goi',
  },
  {
    question: "La palabra para 'escuela primaria' es:",
    options: ['しょうがっこう', 'ちゅうがっこう', 'こうこう', 'だいがく'],
    correct: 'しょうがっこう',
    hint: 'しょうがっこう (小学校) es la escuela primaria.',
    section: 'goi',
  },
  {
    question: "Elige la palabra que significa 'dinero'.",
    options: ['くるま', 'おかね', 'かばん', 'でんわ'],
    correct: 'おかね',
    hint: 'おかね (お金) es la palabra para dinero.',
    section: 'goi',
  },
  {
    question: "La palabra para 'mesa' es:",
    options: ['つくえ', 'いす', 'ほん', 'まど'],
    correct: 'つくえ',
    hint: 'つくえ (机) es la palabra que designa una mesa o escritorio.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'profesor/maestro'.",
    options: ['がくせい', 'せんせい', 'かいしゃいん', 'いしゃ'],
    correct: 'せんせい',
    hint: 'せんせい (先生) se utiliza para referirse a un profesor o maestro.',
    section: 'goi',
  },
  {
    question: "Si quieres decir 'tres', ¿qué dices?",
    options: ['いち', 'に', 'さん', 'よん'],
    correct: 'さん',
    hint: 'さん (三) es el número tres.',
    section: 'goi',
  },
  {
    question: "Elige el opuesto de 'ちいさい' (pequeño).",
    options: ['ふるい', 'おおきい', 'あたらしい', 'ひくい'],
    correct: 'おおきい',
    hint: 'おおきい (大きい) significa grande.',
    section: 'goi',
  },
  {
    question: "El verbo para 'ver' o 'mirar' es:",
    options: ['きく', 'みる', 'よむ', 'あるく'],
    correct: 'みる',
    hint: 'みる (見る) es el verbo de Grupo II para ver o mirar.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'さかな'?",
    options: ['Carne', 'Pez/Pescado', 'Verdura', 'Fruta'],
    correct: 'Pez/Pescado',
    hint: 'さかな (魚) significa pez o pescado.',
    section: 'goi',
  },
  {
    question: "Elige la traducción de 'Tren'.",
    options: ['じどうしゃ', 'でんしゃ', 'ひこうき', 'ふね'],
    correct: 'でんしゃ',
    hint: 'でんしゃ (電車) significa tren eléctrico.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'いそがしい'?",
    options: ['Aburrido', 'Ocupado', 'Interesante', 'Tranquilo'],
    correct: 'Ocupado',
    hint: 'いそがしい (忙しい) es un adjetivo-i que significa ocupado.',
    section: 'goi',
  },
  {
    question: "La palabra para 'parque' es:",
    options: ['びょういん', 'こうえん', 'ぎんこう', 'えいが'],
    correct: 'こうえん',
    hint: 'こうえん (公園) significa parque.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'padre'.",
    options: ['おかあさん', 'おとうさん', 'おにいさん', 'いもうと'],
    correct: 'おとうさん',
    hint: 'おとうさん (お父さん) es la forma respetuosa o general para padre.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'げつようび'?",
    options: ['Domingo', 'Lunes', 'Sábado', 'Miércoles'],
    correct: 'Lunes',
    hint: 'げつようび (月曜日) es el lunes.',
    section: 'goi',
  },
  {
    question: "Elige el número 'cien'.",
    options: ['じゅう', 'ひゃく', 'せん', 'まん'],
    correct: 'ひゃく',
    hint: 'ひゃく (百) significa cien.',
    section: 'goi',
  },
  {
    question: "Elige el adjetivo que significa 'barato'.",
    options: ['たかい', 'やすい', 'ふるい', 'ながい'],
    correct: 'やすい',
    hint: 'やすい (安い) significa barato.',
    section: 'goi',
  },
  {
    question: "El verbo para 'ir' es:",
    options: ['くる', 'かえる', 'いく', 'する'],
    correct: 'いく',
    hint: 'いく (行く) es el verbo para ir.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'みせ'?",
    options: ['Casa', 'Tienda/Negocio', 'Calle', 'Estación'],
    correct: 'Tienda/Negocio',
    hint: 'みせ (店) significa tienda o negocio.',
    section: 'goi',
  },
  {
    question: "Elige la traducción de 'biblioteca'.",
    options: ['ぎんこう', 'びじゅつかん', 'としょかん', 'ゆうびんきょく'],
    correct: 'としょかん',
    hint: 'としょかん (図書館) es biblioteca.',
    section: 'goi',
  },
  {
    question: "La palabra para 'leche' es:",
    options: ['みず', 'おちゃ', 'ぎゅうにゅう', 'さけ'],
    correct: 'ぎゅうにゅう',
    hint: 'ぎゅうにゅう (牛乳) significa leche de vaca.',
    section: 'goi',
  },
  {
    question: "Elige la palabra que significa 'cuarto/habitación'.",
    options: ['へや', 'うち', 'たてもの', 'きょうしつ'],
    correct: 'へや',
    hint: 'へや (部屋) es un cuarto o habitación.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'しずか'?",
    options: ['Ruidoso', 'Ocupado', 'Limpio', 'Tranquilo/Silencioso'],
    correct: 'Tranquilo/Silencioso',
    hint: 'しずか (静か) es un adjetivo-na que significa tranquilo.',
    section: 'goi',
  },
  {
    question: "Elige el opuesto de 'やすい' (fácil/barato).",
    options: ['むずかしい', 'たかい', 'ひくい', 'あかるい'],
    correct: 'たかい',
    hint: 'たかい (高い) significa caro o alto (su opuesto más relevante aquí).',
    section: 'goi',
  },
  {
    question: "El verbo para 'beber' es:",
    options: ['かう', 'のむ', 'よむ', 'まつ'],
    correct: 'のむ',
    hint: 'のむ (飲む) es el verbo de Grupo I para beber.',
    section: 'goi',
  },
  {
    question: "Elige la traducción de 'hospital'.",
    options: ['びょういん', 'えき', 'ぎんこう', 'がっこう'],
    correct: 'びょういん',
    hint: 'びょういん (病院) significa hospital.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'ごご'?",
    options: ['Mañana (AM)', 'Tarde (PM)', 'Mediodía', 'Noche'],
    correct: 'Tarde (PM)',
    hint: 'ごご (午後) es el término japonés para la tarde (Post Meridiem).',
    section: 'goi',
  },
  {
    question: "La palabra para 'flor' es:",
    options: ['さくら', 'はな', 'とり', 'いぬ'],
    correct: 'はな',
    hint: 'はな (花) significa flor.',
    section: 'goi',
  },
  {
    question: "Elige la traducción de 'periódico'.",
    options: ['ざっし', 'てがみ', 'しんぶん', 'えいが'],
    correct: 'しんぶん',
    hint: 'しんぶん (新聞) es periódico.',
    section: 'goi',
  },
  {
    question: "El adjetivo para 'nuevo' es:",
    options: ['ふるい', 'ながい', 'あたらしい', 'みじかい'],
    correct: 'あたらしい',
    hint: 'あたらしい (新しい) es el adjetivo-i para nuevo.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'じゅぎょう'?",
    options: ['Deporte', 'Examen', 'Clase/Lección', 'Tarea'],
    correct: 'Clase/Lección',
    hint: 'じゅぎょう (授業) se refiere a una clase o lección escolar.',
    section: 'goi',
  },
  {
    question: "Elige la palabra que significa 'autobús'.",
    options: ['じてんしゃ', 'タクシー', 'バス', 'ふね'],
    correct: 'バス',
    hint: 'バス es la transcripción katakana de "bus".',
    section: 'goi',
  },
  {
    question: "La palabra para 'izquierda' es:",
    options: ['ひだり', 'みぎ', 'うえ', 'した'],
    correct: 'ひだり',
    hint: 'ひだり (左) significa izquierda.',
    section: 'goi',
  },
  {
    question: "El verbo para 'escribir' es:",
    options: ['きく', 'はなす', 'かく', 'あう'],
    correct: 'かく',
    hint: 'かく (書く) es el verbo de Grupo I para escribir.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'としょかん'?",
    options: ['Banco', 'Museo', 'Biblioteca', 'Estación de tren'],
    correct: 'Biblioteca',
    hint: 'としょかん (図書館) es biblioteca.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'zapatos'.",
    options: ['くつ', 'かさ', 'ふく', 'ぼうし'],
    correct: 'くつ',
    hint: 'くつ (靴) significa zapatos.',
    section: 'goi',
  },
  {
    question: "El adjetivo que significa 'frío' (para cosas) es:",
    options: ['さむい', 'あつい', 'つめたい', 'いそがしい'],
    correct: 'つめたい',
    hint: 'つめたい (冷たい) se usa para describir el frío de objetos o bebidas.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'hermano mayor'.",
    options: ['おとうと', 'あに', 'いもうと', 'あね'],
    correct: 'あに',
    hint: 'あに (兄) es la forma humilde para referirse a tu propio hermano mayor.',
    section: 'goi',
  },
  {
    question: "Si quieres decir 'diez mil', ¿qué dices?",
    options: ['じゅう', 'ひゃく', 'せん', 'まん'],
    correct: 'まん',
    hint: 'まん (万) significa diez mil.',
    section: 'goi',
  },
  {
    question: "El verbo para 'abrir' (algo) es:",
    options: ['しめる', 'あける', 'はいる', 'でる'],
    correct: 'あける',
    hint: 'あける (開ける) es el verbo transitivo para abrir.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'かいもの'?",
    options: ['Limpieza', 'Cocinar', 'Comprar/Ir de compras', 'Dormir'],
    correct: 'Comprar/Ir de compras',
    hint: 'かいもの (買い物) significa ir de compras.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'coche'.",
    options: ['じどうしゃ', 'じてんしゃ', 'ふね', 'でんしゃ'],
    correct: 'じどうしゃ',
    hint: 'じどうしゃ (自動車) es la palabra formal para coche/automóvil, aunque くるま es común.',
    section: 'goi',
  },
  {
    question: "El opuesto de 'みじかい' (corto) es:",
    options: ['やすい', 'ながい', 'ひくい', 'ふるい'],
    correct: 'ながい',
    hint: 'ながい (長い) significa largo.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'ごぜん'?",
    options: ['Mañana (AM)', 'Tarde (PM)', 'Mediodía', 'Noche'],
    correct: 'Mañana (AM)',
    hint: 'ごぜん (午前) es el término japonés para la mañana (Ante Meridiem).',
    section: 'goi',
  },
  {
    question: "La palabra para 'té (verde)' es:",
    options: ['おちゃ', 'みず', 'コーヒー', 'ぎゅうにゅう'],
    correct: 'おちゃ',
    hint: 'おちゃ (お茶) se refiere comúnmente al té verde japonés.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'tiempo/hora'.",
    options: ['いちにち', 'じかん', 'らいねん', 'せんしゅう'],
    correct: 'じかん',
    hint: 'じかん (時間) significa tiempo u hora.',
    section: 'goi',
  },
  {
    question: "El verbo para 'comprar' es:",
    options: ['うる', 'かう', 'もらう', 'あげる'],
    correct: 'かう',
    hint: 'かう (買う) es el verbo de Grupo I para comprar.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'たのしい'?",
    options: ['Triste', 'Aburrido', 'Divertido/Agradable', 'Enojado'],
    correct: 'Divertido/Agradable',
    hint: 'たのしい (楽しい) es un adjetivo-i que significa divertido o placentero.',
    section: 'goi',
  },
  {
    question: "La palabra para 'bicicleta' es:",
    options: ['バス', 'じてんしゃ', 'ひこうき', 'でんしゃ'],
    correct: 'じてんしゃ',
    hint: 'じてんしゃ (自転車) significa bicicleta.',
    section: 'goi',
  },
  {
    question: "Elige la traducción de 'correo/carta'.",
    options: ['しんぶん', 'ざっし', 'てがみ', 'でんわ'],
    correct: 'てがみ',
    hint: 'てがみ (手紙) significa carta.',
    section: 'goi',
  },
  {
    question: "El adjetivo para 'difícil' es:",
    options: ['やさしい', 'むずかしい', 'たかい', 'ひくい'],
    correct: 'むずかしい',
    hint: 'むずかしい (難しい) es el adjetivo-i para difícil.',
    section: 'goi',
  },
  {
    question: "¿Qué significa 'かいしゃ'?",
    options: ['Hospital', 'Tienda', 'Compañía/Empresa', 'Estación'],
    correct: 'Compañía/Empresa',
    section: 'goi',
    hint: 'かいしゃ (会社) significa compañía o empresa.',
  },
  {
    question: "El verbo para 'hacer' es:",
    options: ['する', 'くる', 'たてる', 'おわる'],
    correct: 'する',
    hint: 'する (する) es el verbo irregular para hacer.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'número de teléfono'.",
    options: ['でんしゃ', 'でんわばんごう', 'おかね', 'じかん'],
    correct: 'でんわばんごう',
    hint: 'でんわばんごう (電話番号) es el número de teléfono.',
    section: 'goi',
  },
  {
    question: "El adjetivo que significa 'bueno' o 'bien'.",
    options: ['わるい', 'すき', 'いい', 'きらい'],
    correct: 'いい',
    hint: 'いい (良い) es el adjetivo que significa bueno/bien.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'cielo'.",
    options: ['そら', 'うみ', 'かわ', 'やま'],
    correct: 'そら',
    hint: 'そら (空) significa cielo.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'lunes'.",
    options: ['かようび', 'げつようび', 'すいようび', 'もくようび'],
    correct: 'げつようび',
    hint: 'げつようび (月曜日) es lunes.',
    section: 'goi',
  },
  {
    question: "Elige la palabra para 'martes'.",
    options: ['かようび', 'げつようび', 'すいようび', 'もくようび'],
    correct: 'かようび',
    hint: 'かようび (火曜日) es martes.',
    section: 'goi',
  },

  // ==== BUNPOU (Gramática: 50 preguntas) ====

  {
    question: "Completa la frase: わたし ( ) がくせい です。",
    options: ['は', 'を', 'と', 'が'],
    correct: 'は',
    hint: 'La partícula は (wa) marca el tema de la oración (わたし).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: パン ( ) たべます。",
    options: ['は', 'で', 'を', 'に'],
    correct: 'を',
    hint: 'La partícula を (o) marca el objeto directo del verbo たべる (comer).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは がっこう ( ) いきます。",
    options: ['を', 'で', 'へ', 'と'],
    correct: 'へ',
    hint: 'La partícula へ (e) marca la dirección o el destino de un movimiento (ir a la escuela).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: えき ( ) しんぶんを よみます。",
    options: ['に', 'で', 'を', 'と'],
    correct: 'で',
    hint: 'La partícula で marca el lugar donde se realiza una acción (leer en la estación).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは コーヒー ( ) おちゃを のみます。",
    options: ['に', 'で', 'と', 'も'],
    correct: 'と',
    hint: 'La partícula と (to) une dos sustantivos, significando "y".',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: それは わたし ( ) ほん です。",
    options: ['と', 'に', 'の', 'を'],
    correct: 'の',
    hint: 'La partícula の (no) indica posesión o modifica un sustantivo (mi libro).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'きる' (cortar) a la forma て形.",
    options: ['きります', 'きって', 'きりて', 'きらない'],
    correct: 'きって',
    hint: 'El verbo de Grupo I きる (terminado en -る pero es irregular) se convierte en きって.',
    section: 'bunpou',
  },
  {
    question: "Convierte 'ねる' (dormir) a la forma ない形 (negativo).",
    options: ['ねない', 'ねません', 'ねるない', 'ねますない'],
    correct: 'ねない',
    hint: 'ねる es Grupo II, por lo que se quita る y se añade ない.',
    section: 'bunpou',
  },
  {
    question: "Elige la forma 'quiero ir'.",
    options: ['いきます', 'いきたい', 'いかない', 'いった'],
    correct: 'いきたい',
    hint: 'Se utiliza la forma ます stem + たい para expresar deseo (forma たい).',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: あした ( ) べんきょうしません。",
    options: ['が', 'を', 'に', 'は'],
    correct: 'は',
    hint: 'La partícula は se utiliza para enfatizar el contraste o negar una acción.',
    section: 'bunpou',
  },
  {
    question: "Convierte 'たべる' a la forma pasado negativo (cortés).",
    options: ['たべます', 'たべません', 'たべませんでした', 'たべたいです'],
    correct: 'たべませんでした',
    hint: 'La forma pasado negativo cortés es ます stem + ませんでした.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: あつい ( ) 、みずを のみます。",
    options: ['な', 'に', 'と', 'から'],
    correct: 'から',
    hint: 'から (kara) se usa después de una oración para indicar una razón o causa ("porque").',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: わたし ( ) メアリーさん ( ) アメリカに いきます。",
    options: ['は、に', 'は、が', 'と、を', 'は、と'],
    correct: 'は、と',
    hint: 'は marca el tema; と marca el acompañamiento ("con Mary-san").',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa '¿hay un gato?'.",
    options: ['ねこが いますか', 'ねこが ありますか', 'ねこは いますか', 'ねこは ありますか'],
    correct: 'ねこが いますか',
    hint: 'います se usa para seres vivos (gato), y が marca el sujeto en oraciones de existencia.',
    section: 'bunpou',
  },
  {
    question: "Convierte 'わかる' (entender) a la forma pasado afirmativo.",
    options: ['わかった', 'わかっている', 'わかります', 'わからなかった'],
    correct: 'わかった',
    hint: 'La forma diccionario (分かる) en pasado simple es わかった.',
    section: 'bunpou',
  },
  {
    question: "Elige la frase más natural: 'Vayamos a la tienda.'",
    options: ['みせに いきましょう', 'みせは いきます', 'みせを いきます', 'みせが いきましょう'],
    correct: 'みせに いきましょう',
    hint: 'に indica destino y ましょう es la forma volitiva para sugerir una acción ("Vayamos").',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: きのう、にほんご ( ) べんきょうしました。",
    options: ['を', 'で', 'に', 'が'],
    correct: 'を',
    hint: 'を marca el objeto directo ("estudiar japonés").',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは おかね ( ) ありません。",
    options: ['は', 'も', 'を', 'が'],
    correct: 'が',
    hint: 'が se usa con ありません (no hay/no tengo) para negar la existencia o posesión.',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: これは わたし ( ) カメラ です。",
    options: ['の', 'は', 'が', 'を'],
    correct: 'の',
    hint: 'の indica posesión ("mi cámara").',
    section: 'bunpou',
  },
  {
    question: "Convierte 'する' (hacer) a la forma て形.",
    options: ['して', 'しって', 'すて', 'しますて'],
    correct: 'して',
    hint: 'する es un verbo irregular (o de grupo III) que se convierte en して.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは きょねん ( ) にほんに きました。",
    options: ['に', 'を', 'と', 'は'],
    correct: 'に',
    hint: 'に se usa con expresiones de tiempo específicas (como きょねん, año pasado) y el verbo くる (venir).',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa 'por favor, espere'.",
    options: ['まって ください', 'まちます', 'まつ たい', 'まて'],
    correct: 'まって ください',
    hint: 'て形 + ください se usa para hacer una petición cortés.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたし ( ) すきな たべもの は さかな です。",
    options: ['は', 'が', 'を', 'と'],
    correct: 'が',
    hint: 'が se usa para vincular el adjetivo すき (gustar) con su objeto (たべもの).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'いく' (ir) a la forma pasado simple (informal).",
    options: ['いった', 'いきて', 'いきった', 'いったない'],
    correct: 'いった',
    hint: 'いく es el único verbo -く que se convierte en -った en la forma pasado simple.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: コーヒー ( ) のみませんか。",
    options: ['は', 'に', 'が', 'を'],
    correct: 'を',
    hint: 'を marca el objeto directo. みませんか es una invitación cortés ("¿quiere beber café?").',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa 'no he comido' (informal).",
    options: ['たべます', 'たべた', 'たべなかった', 'たべる'],
    correct: 'たべなかった',
    hint: 'La forma negativo pasado informal es ない + かった.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: この かばん は とても あたらしく ( ) です。",
    options: ['な', 'を', 'い', 'て'],
    correct: 'て',
    hint: 'La forma て de un adjetivo-i (あたらしい) se usa para conectar dos cláusulas o características.',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: わたしは ぎんこう ( ) はたらきます。",
    options: ['に', 'で', 'を', 'が'],
    correct: 'で',
    hint: 'で marca el lugar donde se realiza la acción de trabajar (はたらく).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'よむ' (leer) a la forma て形.",
    options: ['よんで', 'よって', 'よんでて', 'よみって'],
    correct: 'よんで',
    hint: 'El verbo -む (Grupo I) se convierte en -んで en la forma て.',
    section: 'bunpou',
  },
  {
    question: "Elige la forma más cortés para decir 'está bien'.",
    options: ['いいよ', 'いいです', 'いいな', 'いいわ'],
    correct: 'いいです',
    hint: 'です es la terminación más básica de cortesía de N5.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは にほんご ( ) べんきょうしたいです。",
    options: ['で', 'に', 'は', 'を'],
    correct: 'を',
    hint: 'を marca el objeto directo de la acción de estudiar (べんきょうする).',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: あれは だれ ( ) ほん ですか。",
    options: ['が', 'の', 'を', 'に'],
    correct: 'の',
    hint: 'だれ (quién) + の indica posesión o pertenencia ("¿de quién es el libro?").',
    section: 'bunpou',
  },
  {
    question: "Convierte 'かく' (escribir) a la forma pasado negativo informal.",
    options: ['かかなかった', 'かきなかった', 'かきました', 'かきます'],
    correct: 'かかなかった',
    hint: 'La forma pasado negativo informal es ない + かった.',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa 'por favor, haz'.",
    options: ['します', 'する ください', 'して ください', 'したいです'],
    correct: 'して ください',
    hint: 'La forma て de する es して; して ください es "por favor, haz".',
    section: 'bunpou',
  },
  {
    question: "Elige la negación correcta para 'しずか です'.",
    options: ['しずか なです', 'しずか で ありません', 'しずか ですません', 'しずか の ありません'],
    correct: 'しずか で ありません',
    hint: 'Para adjetivos-na y sustantivos, el negativo cortés es で ありません (o じゃありません).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: テスト ( ) むずかしい です。",
    options: ['は', 'を', 'に', 'と'],
    correct: 'は',
    hint: 'は marca el tema sobre el que se hace una afirmación ("el examen es difícil").',
    section: 'bunpou',
  },
  {
    question: "Convierte 'あつい' (caliente) a la forma negativo.",
    options: ['あつくない', 'あつない', 'あつく なです', 'あつありません'],
    correct: 'あつくない',
    hint: 'Para adjetivos-i, se cambia い por くない.',
    section: 'bunpou',
  },
  {
    question: "Elige la frase más natural: 'Estudio en la universidad.'",
    options: ['だいがくを べんきょうします', 'だいがくが べんきょうします', 'だいがくで べんきょうします', 'だいがくへ べんきょうします'],
    correct: 'だいがくで べんきょうします',
    hint: 'で marca el lugar donde se realiza una acción (estudiar).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは おかね ( ) くるま ( ) あります。",
    options: ['も、を', 'と、が', 'と、も', 'は、を'],
    correct: 'と、も',
    hint: 'と une "dinero y coche"; も (también) después de くるま enfatiza que hay ambos.',
    section: 'bunpou',
  },
  {
    question: "Convierte 'おきる' (levantarse) a la forma pasado afirmativo.",
    options: ['おきた', 'おきて', 'おきった', 'おきない'],
    correct: 'おきた',
    hint: 'おきる es Grupo II, se quita る y se añade た.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: きのう、わたしは すし ( ) たべました。",
    options: ['で', 'を', 'が', 'に'],
    correct: 'を',
    hint: 'を marca el objeto directo de たべる (comer).',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa 'no quiero beber'.",
    options: ['のみます たい', 'のみたくない', 'のむない', 'のみたいです'],
    correct: 'のみたくない',
    hint: 'ます stem + たくない es el negativo informal de la forma de deseo.',
    section: 'bunpou',
  },
  {
    question: "Convierte 'あう' (encontrarse) a la forma て形.",
    options: ['あいて', 'あって', 'あうで', 'あいますて'],
    correct: 'あって',
    hint: 'El verbo -う (Grupo I) se convierte en -って en la forma て.',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: わたしは ほん ( ) あげます。",
    options: ['と', 'に', 'を', 'が'],
    correct: 'を',
    hint: 'を marca el objeto directo (dar el libro).',
    section: 'bunpou',
  },
  {
    question: "Elige la negación correcta para 'ゆうめい です'.",
    options: ['ゆうめい で ありません', 'ゆうめい ないです', 'ゆうめい ですない', 'ゆうめい の ありません'],
    correct: 'ゆうめい で ありません',
    hint: 'ゆうめい (有名) es un adjetivo-na. El negativo es で ありません.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: バス ( ) がっこうに いきます。",
    options: ['を', 'に', 'で', 'へ'],
    correct: 'で',
    hint: 'で marca el medio de transporte o instrumento (ir en autobús).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'しぬ' (morir) a la forma て形.",
    options: ['しにて', 'しんで', 'しりて', 'しぬで'],
    correct: 'しんで',
    hint: 'El verbo -ぬ (Grupo I) se convierte en -んで en la forma て.',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: あそこに ( ) があります。",
    options: ['と', 'を', 'に', 'で'],
    correct: 'に',
    hint: 'に se usa a menudo con あそこ para indicar la ubicación de existencia (formalmente se usaría un marcador de tópico, pero に funciona para ubicación).',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: きょうと ( ) おさけを のみましょう。",
    options: ['へ', 'に', 'で', 'と'],
    correct: 'で',
    hint: 'で marca el lugar donde se realiza la acción de beber (en Kyoto).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'まつ' (esperar) a la forma te + iru (acción en progreso).",
    options: ['まっています', 'まっていまする', 'まちますいます', 'まったいます'],
    correct: 'まっています',
    hint: 'まつ (Grupo I, -つ) se convierte a まって. Forma continua: まっています.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: わたしは なに ( ) しません。",
    options: ['も', 'を', 'に', 'と'],
    correct: 'も',
    hint: 'なに (qué) + も + forma negativa significa "nada" o "no hago nada".',
    section: 'bunpou',
  },
  {
    question: "Elige la forma que significa 'por favor, no uses'.",
    options: ['つかわない', 'つかう ない', 'つかわないで ください', 'つかって ください'],
    correct: 'つかわないで ください',
    hint: 'La forma negativa de て形 + ください se usa para pedir cortésmente no hacer algo.',
    section: 'bunpou',
  },
  {
    question: "Elige la partícula correcta: あした ( ) にほんごの テストが あります。",
    options: ['を', 'と', 'に', 'へ'],
    correct: 'に',
    hint: 'に marca el momento específico en el que ocurre algo (mañana).',
    section: 'bunpou',
  },
  {
    question: "Convierte 'やすむ' (descansar) a la forma pasado cortés.",
    options: ['やすみました', 'やすむました', 'やすみますた', 'やすんだ'],
    correct: 'やすみました',
    hint: 'La forma pasado cortés es ます stem + ました.',
    section: 'bunpou',
  },
  {
    question: "Completa la frase: とうきょう ( ) ふじさんに のぼりました。",
    options: ['で', 'に', 'へ', 'を'],
    correct: 'から',
    hint: 'から (kara) se utiliza para indicar el punto de inicio ("desde Tokyo").',
    section: 'bunpou',
  },

  // ==== MOJI (Kanji / Escritura: 70 preguntas) ====

  {
    question: "Elige la lectura correcta para: 人",
    options: ['ほん', 'ひと', 'やま', 'みず'],
    correct: 'ひと',
    hint: '人 (hito) significa persona.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'やま'.",
    options: ['川', '山', '日', '月'],
    correct: '山',
    hint: '山 (yama) significa montaña.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: 月曜日",
    options: ['ひび', 'つきようび', 'げつようび', 'じんび'],
    correct: 'げつようび',
    hint: '月曜日 (getsuyōbi) significa lunes.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'みぎ'.",
    options: ['左', '右', '上', '下'],
    correct: '右',
    hint: '右 (migi) significa derecha.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: くるま",
    options: ['車', '電', '口', '目'],
    correct: '車',
    hint: '車 (kuruma) significa coche/automóvil.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'ごぜん'.",
    options: ['前', '後', '時', '分'],
    correct: '前',
    hint: '前 (mae/zen) significa antes/delante. 午 (go) + 前 (zen) = 午前 (gozen, AM).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: あめ",
    options: ['天', '雨', '空', '水'],
    correct: '雨',
    hint: '雨 (ame) significa lluvia.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'せんせい'.",
    options: ['学生', '先生', '先週', '大学'],
    correct: '先生',
    hint: '先生 (sensei) significa profesor. Ambos kanji son básicos de N5.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: たべる",
    options: ['飲める', '食べる', '書ける', '読む'],
    correct: '食べる',
    hint: '食べる (taberu) significa comer.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'でんしゃ'.",
    options: ['車', '電', '車', '火'],
    correct: '電車',
    hint: '電車 (densha) significa tren. 電 (electricidad) + 車 (coche).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: なな",
    options: ['五', '六', '七', '八'],
    correct: '七',
    hint: '七 (nana) es el número siete.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'ひだり'.",
    options: ['上', '下', '左', '右'],
    correct: '左',
    hint: '左 (hidari) significa izquierda.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: いぬ",
    options: ['猫', '犬', '魚', '鳥'],
    correct: '犬',
    hint: '犬 (inu) significa perro.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'がくせい'.",
    options: ['大学', '先生', '学生', '本屋'],
    correct: '学生',
    hint: '学生 (gakusei) significa estudiante.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: おおきい",
    options: ['小さい', '中', '大きい', '高い'],
    correct: '大きい',
    hint: '大きい (ookii) significa grande.',
    section: 'moji',
  },
  {
    question: "El kanji para 'agua' (みず) es:",
    options: ['日', '水', '火', '金'],
    correct: '水',
    hint: '水 (mizu) significa agua.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: としょかん",
    options: ['図書館', '学校', '病院', '銀行'],
    correct: '図書館',
    hint: '図書館 (toshokan) significa biblioteca.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'よる'.",
    options: ['朝', '昼', '夜', '晩'],
    correct: '夜',
    hint: '夜 (yoru) significa noche.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: くち",
    options: ['目', '口', '手', '足'],
    correct: '口',
    hint: '口 (kuchi) significa boca.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'きんようび'.",
    options: ['月', '水', '金', '土'],
    correct: '金',
    hint: '金 (kin) es el kanji de oro/metal y se usa en 金曜日 (viernes).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: いま",
    options: ['時', '今', '分', '日'],
    correct: '今',
    hint: '今 (ima) significa ahora.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'ひゃく'.",
    options: ['十', '千', '万', '百'],
    correct: '百',
    hint: '百 (hyaku) significa cien.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: がっこう",
    options: ['大学', '小学校', '中学校', '学校'],
    correct: '学校',
    hint: '学校 (gakkō) significa escuela.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'いしゃ'.",
    options: ['先生', '医者', '会社', '銀行'],
    correct: '医者',
    hint: '医者 (isha) significa doctor/médico.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: なか",
    options: ['上', '下', '中', '外'],
    correct: '中',
    hint: '中 (naka) significa dentro/en medio.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'かわ'.",
    options: ['山', '川', '田', '空'],
    correct: '川',
    hint: '川 (kawa) significa río.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: さかな",
    options: ['魚', '肉', '鳥', '犬'],
    correct: '魚',
    hint: '魚 (sakana) significa pez/pescado.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'にほん'.",
    options: ['本', '国', '日本', '語'],
    correct: '日本',
    hint: '日本 (Nihon/Nippon) significa Japón.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: とき",
    options: ['時間', '時', '分', '秒'],
    correct: '時',
    hint: '時 (toki/ji) significa tiempo u hora.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'せん'.",
    options: ['十', '百', '千', '万'],
    correct: '千',
    hint: '千 (sen) significa mil.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'しごと'.",
    options: ['仕事', '人間', '会社', '勉強'],
    correct: '仕事',
    hint: '仕事 (shigoto) significa trabajo.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: くに",
    options: ['国', '語', '日本', '人'],
    correct: '国',
    hint: '国 (kuni) significa país.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'まえ'.",
    options: ['後', '前', '中', '外'],
    correct: '前',
    hint: '前 (mae) significa delante.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: ごはん",
    options: ['朝食', 'ご飯', '魚', '肉'],
    correct: 'ご飯',
    hint: 'ご飯 (gohan) significa arroz cocido o comida.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'はいる'.",
    options: ['入る', '出る', '住む', '作る'],
    correct: '入る',
    hint: '入る (hairu) significa entrar.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: しろい",
    options: ['黒い', '白い', '赤', '青い'],
    correct: '白い',
    hint: '白い (shiroi) significa blanco.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'ふるい'.",
    options: ['新', '古', '長', '大'],
    correct: '古',
    hint: '古い (furui) significa viejo (no para personas).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: らいしゅう",
    options: ['先週', '来週', '今週', '毎週'],
    correct: '来週',
    hint: '来週 (raishū) significa próxima semana. 来 (venir) + 週 (semana).',
    section: 'moji',
  },
  {
    question: "Elige el kanji para la lectura 'あう'.",
    options: ['会う', '話す', '聞く', '読む'],
    correct: '会う',
    hint: '会う (au) significa encontrarse.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: せん",
    options: ['十', '百', '千', '万'],
    correct: '千',
    hint: '千 (sen) significa mil.',
    section: 'moji',
  },

  // --- 30 preguntas de Kanji adicionales ---
  {
    question: "Elige la lectura correcta para: おかあさん",
    options: ['父', '母', '兄', '弟'],
    correct: '母',
    hint: '母 (haha) es la forma humilde de decir madre.',
    section: 'moji',
  },
  {
    question: "Elige el kanji para 'fuego' (ひ/か).",
    options: ['水', '火', '土', '金'],
    correct: '火',
    hint: 'Es un radical común.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: おとうと",
    options: ['兄', '弟', '姉', '妹'],
    correct: '弟',
    hint: '弟 (otōto) es hermano menor.',
    section: 'moji',
  },
  {
    question: "El kanji para 'salir' (でる) es:",
    options: ['入', '出', '行', '来'],
    correct: '出',
    hint: '出 (deru) es el kanji de salida.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: ご",
    options: ['一', '二', '三', '五'],
    correct: '五',
    hint: 'Es el número cinco.',
    section: 'moji',
  },
  {
    question: "El kanji para 'diez' (とお/じゅう) es:",
    options: ['五', '七', '九', '十'],
    correct: '十',
    hint: 'El número 10.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: かく",
    options: ['書く', '読む', '話す', '聞く'],
    correct: '書く',
    hint: '書く (kaku) significa escribir.',
    section: 'moji',
  },
  {
    question: "El kanji para 'año' (とし/ねん) es:",
    options: ['月', '日', '年', '時'],
    correct: '年',
    hint: 'Se usa en 去年 (kyonen).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: たかい",
    options: ['安い', '高い', '長い', '短い'],
    correct: '高い',
    hint: '高い (takai) significa caro/alto.',
    section: 'moji',
  },
  {
    question: "El kanji para 'decir' (いう) es:",
    options: ['言', '話', '聞', '読'],
    correct: '言',
    hint: 'Es el radical para palabra o discurso.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: いぬ",
    options: ['犬', '猫', '鳥', '魚'],
    correct: '犬',
    hint: '犬 (inu) es perro.',
    section: 'moji',
  },
  {
    question: "El kanji para 'madre' (はは) es:",
    options: ['父', '母', '子', '女'],
    correct: '母',
    hint: 'El kanji es 母.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: なな",
    options: ['六', '七', '八', '九'],
    correct: '七',
    hint: 'Es el número siete.',
    section: 'moji',
  },
  {
    question: "El kanji para 'estudiante' (がくせい) es:",
    options: ['先', '学', '生', '者'],
    correct: '学生',
    hint: '学 (aprender) y 生 (nacer).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: とお",
    options: ['五', '七', '九', '十'],
    correct: '十',
    hint: 'Es la lectura nativa del número diez.',
    section: 'moji',
  },
  {
    question: "El kanji para 'comprar' (かう) es:",
    options: ['売', '買', '作', '持'],
    correct: '買',
    hint: '買 (kau) significa comprar.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: くる",
    options: ['行く', '来る', '帰る', '入る'],
    correct: '来る',
    hint: '来る (kuru) es el verbo irregular venir.',
    section: 'moji',
  },
  {
    question: "El kanji para 'este año' (ことし) es:",
    options: ['去年', '今年', '来年', '毎年'],
    correct: '今年',
    hint: '今 (ahora) y 年 (año).',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: いち",
    options: ['一', '二', '三', '四'],
    correct: '一',
    hint: 'Es el número uno.',
    section: 'moji',
  },
  {
    question: "El kanji para 'mujer' (おんな) es:",
    options: ['人', '男', '女', '子'],
    correct: '女',
    hint: '女 (onna) significa mujer.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: はん",
    options: ['半', '分', '時', '間'],
    correct: '半',
    hint: '半 (han) significa mitad.',
    section: 'moji',
  },
  {
    question: "El kanji para 'flor' (はな) es:",
    options: ['木', '森', '花', '草'],
    correct: '花',
    hint: '花 (hana) significa flor.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: やすむ",
    options: ['休む', '働く', '遊ぶ', '寝る'],
    correct: '休む',
    hint: '休む (yasumu) significa descansar.',
    section: 'moji',
  },
  {
    question: "El kanji para 'puerta' (と) es:",
    options: ['口', '戸', '門', '目'],
    correct: '戸',
    hint: '戸 (to) significa puerta simple.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: よっつ",
    options: ['一', '二', '三', '四'],
    correct: '四',
    hint: 'Es la lectura para cuatro cosas.',
    section: 'moji',
  },
  {
    question: "El kanji para 'leer' (よむ) es:",
    options: ['聞く', '話す', '書く', '読む'],
    correct: '読む',
    hint: '読む (yomu) significa leer.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: あに",
    options: ['父', '母', '兄', '弟'],
    correct: '兄',
    hint: '兄 (ani) es hermano mayor.',
    section: 'moji',
  },
  {
    question: "El kanji para 'barato/tranquilo' (やすい) es:",
    options: ['高', '安', '低', '静'],
    correct: '安',
    hint: '安 (yasu) significa barato.',
    section: 'moji',
  },
  {
    question: "Elige la lectura correcta para: まいとし",
    options: ['去年', '来年', '毎年', '今年'],
    correct: '毎年',
    hint: '毎 (cada) y 年 (año).',
    section: 'moji',
  },
  {
    question: "El kanji para 'boca' (くち) es:",
    options: ['目', '耳', '鼻', '口'],
    correct: '口',
    hint: '口 (kuchi) es boca.',
    section: 'moji',
  },


  // ==== DOKKAI (Comprensión Lectora: 30 preguntas) ====

  {
    question: "Texto: わたしは きのう としょかんで ほんを よみました。 Pregunta: ¿Dónde leyó el libro?",
    options: ['En la escuela', 'En casa', 'En la biblioteca', 'En el banco'],
    correct: 'En la biblioteca',
    hint: 'としょかん (図書館) significa biblioteca.',
    section: 'dokkai',
  },
  {
    question: "Texto: あしたは にちようび です。わたしは どこにも いきません。うちで ゆっくり やすみます。 Pregunta: ¿Qué hará mañana?",
    options: ['Ir de compras', 'Visitar a un amigo', 'Estudiar japonés', 'Descansar tranquilamente en casa'],
    correct: 'Descansar tranquilamente en casa',
    hint: 'うちで ゆっくり やすみます significa "descansar tranquilamente en casa".',
    section: 'dokkai',
  },
  {
    question: "Texto: これは さかなと やさいの たべものです。とても おいしいです。 Pregunta: ¿De qué está hecha la comida?",
    options: ['Carne y arroz', 'Pescado y verduras', 'Pan y leche', 'Fruta y agua'],
    correct: 'Pescado y verduras',
    hint: 'さかな (魚) es pescado y やさい (野菜) es verdura.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしの でんわばんごうは ０９０の１２３４の５６７８です。 Pregunta: ¿Qué número aparece después de ０９０の？",
    options: ['５６７８', '０９０', '１２３４', '１２３'],
    correct: '１２３４',
    hint: 'El número de teléfono se lee secuencialmente.',
    section: 'dokkai',
  },
  {
    question: "Texto: きょうは あめが ふっていますから、さむいです。 Pregunta: ¿Por qué hace frío hoy?",
    options: ['Porque es invierno', 'Porque está lloviendo', 'Porque es de noche', 'Porque el sol es débil'],
    correct: 'Porque está lloviendo',
    hint: 'あめが ふっていますから significa "porque está lloviendo".',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは まいにち ６じに おきます。そして、あさごはんを たべます。 Pregunta: ¿A qué hora se levanta la persona mientras come su desayuno?",
    options: ['A las 7', 'A las 5', 'A las 6', 'A las 8'],
    correct: 'A las 6',
    hint: '６じに おきます significa "se levanta a las 6 en punto".',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは せんせいに えいごを おしえて もらいます。 Pregunta: ¿Qué le enseña el profesor a la persona?",
    options: ['Japonés', 'Matemáticas', 'Inglés', 'Historia'],
    correct: 'Inglés',
    hint: 'えいご (英語) significa inglés.',
    section: 'dokkai',
  },
  {
    question: "Texto: あの みせは とても たかいです。でも、おいしいです。 Pregunta: ¿Qué dos cosas se dicen sobre la tienda?",
    options: ['Es barata y mala', 'Es cara y sabrosa', 'Es vieja y pequeña', 'Es tranquila y nueva'],
    correct: 'Es cara y sabrosa',
    hint: 'たかい (高い) es cara y おいしい (美味しい) es sabrosa.',
    section: 'dokkai',
  },
  {
    question: "Texto: きのう、わたしは ともだちと えいがを みました。 Pregunta: ¿Con quién vio la película?",
    options: ['Con su familia', 'Con su profesor', 'Solo', 'Con un amigo/a'],
    correct: 'Con un amigo/a',
    hint: 'ともだち (友達) significa amigo/a.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは バスで がっこうに いきます。 Pregunta: ¿Cómo va a la escuela?",
    options: ['En tren', 'Caminando', 'En autobús', 'En coche'],
    correct: 'En autobús',
    hint: 'バス (basu) es autobús, y で indica el medio de transporte.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは あまり おさけを のみません。 Pregunta: ¿Bebe mucho alcohol la persona?",
    options: ['Sí, mucho', 'No, casi nada', 'Solo los fines de semana', 'A veces'],
    correct: 'No, casi nada',
    hint: 'あまり (amari) + forma negativa significa "no mucho" o "casi nada".',
    section: 'dokkai',
  },
  {
    question: "Texto: いま、わたしは しんぶんを よんでいます。 Pregunta: ¿Qué está haciendo la persona ahora?",
    options: ['Escribiendo una carta', 'Viendo la televisión', 'Leyendo el periódico', 'Comiendo arroz'],
    correct: 'Leyendo el periódico',
    hint: 'よんでいます (leyendo) + しんぶん (periódico).',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは かいしゃいんじゃ ありません。がくせい です。 Pregunta: ¿Cuál es la ocupación de la persona?",
    options: ['Trabajador de empresa', 'Estudiante', 'Doctor', 'Profesor'],
    correct: 'Estudiante',
    hint: 'がくせい (学生) significa estudiante; じゃありません significa "no es".',
    section: 'dokkai',
  },
  {
    question: "Texto: あそこは ぎんこう ですか。…いいえ、ちがいます。ゆうびんきょく です。 Pregunta: ¿Qué es el lugar, en realidad?",
    options: ['Un banco', 'Una biblioteca', 'Una oficina de correos', 'Una estación'],
    correct: 'Una oficina de correos',
    hint: 'ゆうびんきょく (郵便局) significa oficina de correos.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは おかねが ほしいです。 Pregunta: ¿Qué es lo que la persona desea?",
    options: ['Una casa', 'Dinero', 'Un coche', 'Comida'],
    correct: 'Dinero',
    hint: 'おかね (お金) es dinero, y ほしい (欲しい) expresa deseo.',
    section: 'dokkai',
  },
  {
    question: "Texto: にほんごの べんきょうは むずかしいですか。…はい、とても むずかしいです。 Pregunta: ¿Qué opina la persona sobre el estudio del japonés?",
    options: ['Es muy fácil', 'Es divertido', 'Es muy difícil', 'Es aburrido'],
    correct: 'Es muy difícil',
    hint: 'はい (sí) + とても むずかしいです (muy difícil).',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは ９じから ５じまで はたらきます。 Pregunta: ¿Durante qué período de tiempo trabaja la persona?",
    options: ['De 8 a 4', 'De 9 a 5', 'De 7 a 3', 'De 10 a 6'],
    correct: 'De 9 a 5',
    hint: '９じから (desde las 9) ５じまで (hasta las 5).',
    section: 'dokkai',
  },
  {
    question: "Texto: かのじょは いつも ぎゅうにゅうを のみます。 Pregunta: ¿Qué bebida prefiere ella (かのじょ)?",
    options: ['Agua', 'Té', 'Leche', 'Zumo'],
    correct: 'Leche',
    hint: 'ぎゅうにゅう (牛乳) es leche. いつも (siempre) la bebe.',
    section: 'dokkai',
  },
  {
    question: "Texto: この へやは あまり しずかじゃ ありません。うるさいです。 Pregunta: ¿Cómo es la habitación?",
    options: ['Es muy tranquila', 'Es ruidosa', 'Es grande', 'Es pequeña'],
    correct: 'Es ruidosa',
    hint: 'うるさい (urusai) significa ruidoso. あまり + negativo (no muy tranquilo).',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは きのう ゆうびんきょくで てがみを だしました。 Pregunta: ¿Qué envió la persona en la oficina de correos?",
    options: ['Dinero', 'Un paquete', 'Una carta', 'Un periódico'],
    correct: 'Una carta',
    hint: 'てがみ (手紙) es carta. だしました es la forma pasada de dar/enviar.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは けさ、パンを たべませんでした。 Pregunta: ¿Qué no comió la persona esta mañana?",
    options: ['Arroz', 'Huevo', 'Pan', 'Pescado'],
    correct: 'Pan',
    hint: 'パン (pan) + たべませんでした (no comió).',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは よく バスに のります。 Pregunta: ¿Qué medio de transporte usa la persona con frecuencia?",
    options: ['Tren', 'Avión', 'Autobús', 'Bicicleta'],
    correct: 'Autobús',
    hint: 'よく (yoku, a menudo) + バスに のります (montar en autobús).',
    section: 'dokkai',
  },
  {
    question: "Texto: あしたは ともだちの たんじょうびです。わたしは あした かいものを します。 Pregunta: ¿Por qué irá de compras mañana?",
    options: ['Para comprar comida', 'Para comprar un regalo de cumpleaños', 'Para comprar ropa nueva', 'Para ir al supermercado'],
    correct: 'Para comprar un regalo de cumpleaños',
    hint: 'たんじょうび (tanjōbi) significa cumpleaños. Implica comprar un regalo.',
    section: 'dokkai',
  },
  {
    question: "Texto: この しゅうまつ、なにか しませんか。…いいですね。えいがを みましょう。 Pregunta: ¿Cuál es la sugerencia que acepta la otra persona?",
    options: ['Ir a un restaurante', 'Ver una película', 'Comprar un libro', 'Ir a la playa'],
    correct: 'Ver una película',
    hint: 'えいがを みましょう significa "vayamos a ver una película".',
    section: 'dokkai',
  },
  {
    question: "Texto: これは あおい くるま です。 Pregunta: ¿Qué característica tiene el coche?",
    options: ['Es rojo', 'Es grande', 'Es rápido', 'Es azul'],
    correct: 'Es azul',
    hint: 'あおい (青い) significa azul.',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは うちから がっこうまで あるいて いきます。 Pregunta: ¿Cómo va la persona desde casa a la escuela?",
    options: ['En coche', 'En bicicleta', 'Caminando', 'En tren'],
    correct: 'Caminando',
    hint: 'あるいて いきます significa "ir caminando".',
    section: 'dokkai',
  },
  {
    question: "Texto: きのう、あつい ですか。…いいえ、さむかったです。 Pregunta: ¿Cómo fue el clima ayer?",
    options: ['Hizo calor', 'Hizo frío', 'Llovió', 'Hizo viento'],
    correct: 'Hizo frío',
    hint: 'さむかったです (samukatta desu) significa "hizo frío" (pasado afirmativo).',
    section: 'dokkai',
  },
  {
    question: "Texto: わたしは ほんやで ざっしを かいました。 Pregunta: ¿Qué compró y dónde?",
    options: ['Un periódico en la librería', 'Una revista en la librería', 'Un libro en la tienda', 'Una revista en el supermercado'],
    correct: 'Una revista en la librería',
    hint: 'ほんや (本屋, librería) + ざっし (revista).',
    section: 'dokkai',
  },
  {
    question: "Texto: あの ひと は だれですか。…わたしの おとうと です。 Pregunta: ¿Quién es la persona de la que hablan?",
    options: ['Su hermano mayor', 'Su hermana mayor', 'Su padre', 'Su hermano menor'],
    correct: 'Su hermano menor',
    hint: 'おとうと (弟) significa hermano menor.',
    section: 'dokkai',
  },
  {
    question: "Texto: あしたは しゅくだいを しなくては なりません。 Pregunta: ¿Qué tiene que hacer la persona mañana?",
    options: ['Hacer la cena', 'Ir al trabajo', 'Hacer la tarea', 'Ver la televisión'],
    correct: 'Hacer la tarea',
    hint: 'しゅくだい (宿題) es tarea. しなくては なりません significa "debo hacer".',
    section: 'dokkai',
  },

  // ==== GENGOCHISHIKI (Conocimiento del idioma: 30 preguntas) ====

  {
    question: "Elige el saludo apropiado al levantarse por la mañana.",
    options: ['こんにちは', 'こんばんは', 'おはようございます', 'さようなら'],
    correct: 'おはようございます',
    hint: 'おはようございます (ohayō gozaimasu) es el saludo de la mañana.',
    section: 'gengochishiki',
  },
  {
    question: "La frase 'Ittekimasu' (いってきます) se dice al:",
    options: ['Llegar a casa', 'Salir de casa', 'Recibir una visita', 'Empezar a comer'],
    correct: 'Salir de casa',
    hint: 'いってきます significa "me voy y vuelvo".',
    section: 'gengochishiki',
  },
  {
    question: "Elige la respuesta apropiada a 'Arigatō gozaimasu'.",
    options: ['さようなら', 'いいえ', 'いただきます', 'ごちそうさま'],
    correct: 'いいえ',
    hint: 'いいえ (iie) o どういたしまして (dō itashimashite) son respuestas adecuadas a un agradecimiento.',
    section: 'gengochishiki',
  },
  {
    question: "La expresión 'Tadaima' (ただいま) se dice al:",
    options: ['Llegar a casa', 'Salir de casa', 'Ir a dormir', 'Despedirse'],
    correct: 'Llegar a casa',
    hint: 'ただいま significa "ya regresé" o "estoy en casa".',
    section: 'gengochishiki',
  },
  {
    question: "Elige la expresión para empezar a comer o beber.",
    options: ['ごちそうさま', 'おやすみ', 'いただきます', 'おかえり'],
    correct: 'いただきます',
    hint: 'いただきます (itadakimasu) se dice antes de empezar una comida.',
    section: 'gengochishiki',
  },
  {
    question: "La expresión 'Gochisōsama deshita' (ごちそうさま でした) se dice al:",
    options: ['Empezar a comer', 'Terminar de comer', 'Servir la comida', 'Pedir la cuenta'],
    correct: 'Terminar de comer',
    hint: 'ごちそうさま でした se dice para expresar agradecimiento por la comida después de haber terminado.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la respuesta que se dice al recibir un 'Ittekimasu'.",
    options: ['ただいま', 'おかえり', 'いってらっしゃい', 'ごめんなさい'],
    correct: 'いってらっしゃい',
    hint: 'いってらっしゃい (itterasshai) significa "ve y vuelve".',
    section: 'gengochishiki',
  },
  {
    question: "Para llamar la atención de alguien o pedir disculpas menores se usa:",
    options: ['どうも', 'すみません', 'じゃあね', 'しつれいします'],
    correct: 'すみません',
    hint: 'すみません (sumimasen) puede significar "disculpa", "perdón" o "permiso".',
    section: 'gengochishiki',
  },
  {
    question: "Elige el saludo para decir 'Buenas noches' (al llegar o saludar).",
    options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'],
    correct: 'こんばんは',
    hint: 'こんばんは (konbanwa) es el saludo de la tarde/noche.',
    section: 'gengochishiki',
  },
  {
    question: "La expresión 'Okaeri' (おかえり) se dice al recibir un:",
    options: ['さようなら', 'おやすみ', 'ただいま', 'いただきます'],
    correct: 'ただいま',
    hint: 'おかえり (okaeri) o おかえりなさい se dice para dar la bienvenida al que llega con ただいま.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la forma de despedirse de forma casual (amigos).",
    options: ['さようなら', 'しつれいします', 'じゃあね', 'おげんきで'],
    correct: 'じゃあね',
    hint: 'じゃあね (jā ne) es una forma común y casual de despedirse.',
    section: 'gengochishiki',
  },
  {
    question: "¿Qué significa 'Gomen nasai' (ごめんなさい)?",
    options: ['Gracias', 'Por favor', 'Lo siento', 'Salud'],
    correct: 'Lo siento',
    hint: 'ごめんなさい es una disculpa, más informal que すみません.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la frase para decir 'muchas gracias' (muy cortés).",
    options: ['どうも', 'ありがとう', 'どういたしまして', 'どうも ありがとう ございます'],
    correct: 'どうも ありがとう ございます',
    hint: 'La forma más larga de agradecer en N5 es la más cortés.',
    section: 'gengochishiki',
  },
  {
    question: "Si alguien dice 'O-genki desu ka' (¿cómo está?), ¿cuál es una respuesta común?",
    options: ['おやすみ', 'おげんきで', 'はい、げんきです', 'さようなら'],
    correct: 'はい、げんきです',
    hint: 'はい、げんきです (sí, estoy bien) es una respuesta directa y cortés.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la expresión para decir 'Buenas tardes'/'Hola' (durante el día).",
    options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'],
    correct: 'こんにちは',
    hint: 'こんにちは (konnichiwa) es el saludo diurno más común.',
    section: 'gengochishiki',
  },
  {
    question: "Cuando vas a ir a dormir, ¿qué dices?",
    options: ['おはよう', 'おやすみ', 'ただいま', 'おげんきで'],
    correct: 'おやすみ',
    hint: 'おやすみなさい (oyasuminasai) o la forma corta おやすみ es para desear buenas noches antes de dormir.',
    section: 'gengochishiki',
  },
  {
    question: "La expresión 'Shitsurei shimasu' (しつれいします) se usa típicamente para:",
    options: ['Agradecer', 'Pedir comida', 'Disculparse por retirarse (en contexto formal)', 'Preguntar la hora'],
    correct: 'Disculparse por retirarse (en contexto formal)',
    hint: 'しつれいします es "con permiso" o "disculpe la intromisión/retirada" en un entorno formal.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la forma de pedir el nombre de alguien cortésmente.",
    options: ['なまえは なに', 'なまえは なんですか', 'なまえは だれ', 'あなたは だれ'],
    correct: 'なまえは なんですか',
    hint: 'なまえは なんですか (namae wa nan desu ka) es la forma cortés de N5.',
    section: 'gengochishiki',
  },
  {
    question: "Elige la frase para decir 'Encantado/a de conocerte' al presentarse.",
    options: ['さようなら', 'おげんきですか', 'はじめまして', 'おめでとう'],
    correct: 'はじめまして',
    hint: 'はじめまして (hajimemashite) es la frase inicial al conocer a alguien.',
    section: 'gengochishiki',
  },
  {
    question: "¿Qué significa 'Dōmo' (どうも)?",
    options: ['No', 'Lo siento', 'Hola/Gracias (informal)', 'Adiós'],
    correct: 'Hola/Gracias (informal)',
    hint: 'どうも es una forma casual y abreviada de agradecer o saludar.',
    section: 'gengochishiki',
  },
  {
    question: "La frase 'Yoroshiku onegaishimasu' (よろしく おねがいします) se dice al:",
    options: ['Comer', 'Despedirse', 'Terminar una presentación', 'Pedir disculpas'],
    correct: 'Terminar una presentación',
    hint: 'Se usa para expresar la esperanza de una buena relación o cooperación futura.',
    section: 'gengochishiki',
  },
  {
    question: "Elige el saludo apropiado para un profesor al final del día.",
    options: ['おはよう', 'さようなら', 'おやすみ', 'いってきます'],
    correct: 'さようなら',
    hint: 'さようなら (sayōnara) se usa como despedida general, adecuado en este contexto.',
    section: 'gengochishiki',
  },
  {
    question: "Si invitas a alguien a beber café y dice 'いいえ、けっこうです', significa:",
    options: ['Sí, por favor', 'No, gracias', 'Quiero agua', 'Me gusta mucho'],
    correct: 'No, gracias',
    hint: 'けっこうです (kekkō desu) es una forma cortés de rechazar una oferta.',
    section: 'gengochishiki',
  },
  {
    question: "Al recibir un regalo, la expresión común es:",
    options: ['どういたしまして', 'いただきます', 'ありがとうございます', 'さようなら'],
    correct: 'ありがとうございます',
    hint: 'Agradecer es la reacción apropiada al recibir un regalo.',
    section: 'gengochishiki',
  },
  {
    question: "¿Cuál es la forma más casual de decir 'sí'?",
    options: ['はい', 'ええ', 'うん', 'いいえ'],
    correct: 'うん',
    hint: 'うん (un) es la forma informal de "sí".',
    section: 'gengochishiki',
  },
  {
    question: "Elige la frase para decir 'Disculpe, ¿dónde está el baño?'",
    options: ['トイレは どこですか', 'トイレを ありますか', 'トイレが どこです', 'トイレの ありますか'],
    correct: 'トイレは どこですか',
    hint: 'La estructura correcta es [Tema] は どこですか (dónde está el tema).',
    section: 'gengochishiki',
  },
  {
    question: "Para confirmar si alguien es estudiante, se pregunta:",
    options: ['がくせい は ありますか', 'がくせいは なに', 'がくせい ですか', 'がくせい を いますか'],
    correct: 'がくせい ですか',
    hint: 'El final ですか (desu ka) convierte la afirmación en una pregunta cortés de N5.',
    section: 'gengochishiki',
  },
  {
    question: "Alguien te pregunta la hora. Si son las 4:00 PM, ¿qué debes decir?",
    options: ['よじ です', 'ろくじ です', 'よんじ です', 'ごじ です'],
    correct: 'よじ です',
    hint: 'Las 4 en punto se dice よじ (yoji).',
    section: 'gengochishiki',
  },
  {
    question: "La frase 'Dō itashimashite' (どういたしまして) se usa para:",
    options: ['Despedirse', 'Agradecer', 'Responder a un agradecimiento', 'Disculparse'],
    correct: 'Responder a un agradecimiento',
    hint: 'Significa "De nada".',
    section: 'gengochishiki',
  },
  {
    question: "Elige el adjetivo-na que significa 'bonito/limpio'.",
    options: ['たのしい', 'きれい', 'さむい', 'いそがしい'],
    correct: 'きれい',
    hint: 'きれい (kirei) es un adjetivo-na que significa bonito, limpio, o hermoso.',
    section: 'gengochishiki',
  },
];


// ===================== COMPONENTE =====================

export default function RetoN5() {
  // ⭐ Progreso / stars (ahora 5)
  const [stars, setStars] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // 🔥 Racha de aciertos seguidos (para +15s cada 5 correctas seguidas)
  const [correctStreak, setCorrectStreak] = useState(0);

  // 🎯 Nivel y fase actuales (del CÓDIGO A)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0 = Nivel 1
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // 0 = Fase 1

  // ❓ Pregunta actual (dentro de la fase)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 💡 Pistas (máx 10)
  const [hintUses, setHintUses] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // 🧾 Modales
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState(false);

  // 🔁 Animaciones botones
  const bgmRef = useRef<Audio.Sound | null>(null);
  const scaleHint = useRef(new Animated.Value(1)).current;
  const scaleNext = useRef(new Animated.Value(1)).current;
  const scaleEnd = useRef(new Animated.Value(1)).current;

  // ⏱ Estado del temporizador (59:00 minutos)
  const [timeLeft, setTimeLeft] = useState(59 * 60); // 59 minutos en segundos

  // 🦝 Estado del mapache
  const [tanukiState, setTanukiState] = useState<'normal' | 'fail' | 'happy'>(
    'normal'
  );

  // ---------- DERIVAR PREGUNTAS DE LA FASE ACTUAL ----------

  const currentLevel = LEVELS[currentLevelIndex];
  const currentPhase = currentLevel.phases[currentPhaseIndex];

  // índice global de la fase
  const globalPhaseIndex =
    currentLevelIndex * PHASES_PER_LEVEL + currentPhaseIndex;

  const phaseStartIndex = globalPhaseIndex * QUESTIONS_PER_PHASE;
  const phaseQuestions = questions.slice(
    phaseStartIndex,
    phaseStartIndex + QUESTIONS_PER_PHASE
  );

  // Verificación para no acceder a preguntas fuera del array (maneja el caso de final de juego)
  const isGameComplete = phaseStartIndex >= questions.length;
  const currentQuestion = !isGameComplete ? phaseQuestions[currentQuestionIndex] : null;
  
  const totalQuestionsInPhase = phaseQuestions.length;
  const totalAnswered = correctCount + wrongCount;
  const isLastQuestionInPhase = currentQuestionIndex === totalQuestionsInPhase - 1;


  // ⏱ Cronómetro en marcha
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🎧 Música de fondo
  useEffect(() => {
    const loadBGM = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/retobgm.mp3')
      );
      bgmRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    };

    if (!showSummaryModal && timeLeft > 0) {
      loadBGM();
    }


    return () => {
      if (bgmRef.current) {
        bgmRef.current.unloadAsync();
      }
    };
  }, [showSummaryModal]); // Controlamos la música solo si el modal de resumen no está abierto

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  // ⏱ Cuando el tiempo llega a 0 → game over automático
  useEffect(() => {
    if (timeLeft === 0 && !showSummaryModal) {
      (async () => {
        if (bgmRef.current) {
          try {
            await bgmRef.current.stopAsync();
          } catch (e) {}
        }
        setTanukiState('fail');
        await playSound(require('../../assets/sounds/end.mp3'));
        setIsPhaseCompleted(false); // No completada por tiempo
        setShowSummaryModal(true);
      })();
    }
  }, [timeLeft, showSummaryModal]);

  const animateButton = (scaleRef: Animated.Value) => {
    Animated.sequence([
      Animated.spring(scaleRef, {
        toValue: 1.15,
        useNativeDriver: true,
      }),
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 💡 Manejar pista (máx 10)
  const handleHint = () => {
    if (hintUses >= 10 || !currentQuestion) return;
    animateButton(scaleHint);
    playSound(require('../../assets/sounds/hint.mp3'));

    setHintUses((prev) => prev + 1);
    setCurrentHint(currentQuestion.hint);
  };

  // ⏭ Pasar a la siguiente pregunta (USANDO BOTÓN)
  const handleNext = () => {
    if (!selectedOption) return; // Obliga a responder primero

    animateButton(scaleNext);
    playSound(require('../../assets/sounds/next.mp3'));

    // Si ya es la última pregunta de la fase y se respondió, el botón NEXT se deshabilita
    // y solo el botón END debe usarse para ver el resumen manual.
    if (isLastQuestionInPhase) return;

    if (currentQuestionIndex < totalQuestionsInPhase - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setCurrentHint(null);
      setTanukiState('normal');
    }
  };

  // 🔚 Fin del nivel/fase actual: parar música + mostrar resumen (salida manual)
  const handleEnd = async () => {
    animateButton(scaleEnd);

    if (bgmRef.current) {
      try {
        await bgmRef.current.stopAsync();
      } catch (e) {}
    }

    // Calculamos si la fase fue completada (no es necesario si el avance es automático,
    // pero lo calculamos para el caso de salida manual/tiempo agotado)
    const completed = totalAnswered >= totalQuestionsInPhase && totalQuestionsInPhase > 0;
    setIsPhaseCompleted(completed);

    if (completed) {
      setTanukiState('happy');
      await playSound(require('../../assets/sounds/sucess.mp3'));
    } else {
      setTanukiState('fail');
      await playSound(require('../../assets/sounds/end.mp3'));
    }

    setShowSummaryModal(true);
  };

  // Lógica para avanzar a la siguiente fase o reintentar
  const handleNextPhase = async (success: boolean) => {
    // Si la fase fue completada con éxito, intentamos avanzar
    if (success) {
      const nextPhaseIndex = currentPhaseIndex + 1;
      const nextLevelIndex = currentLevelIndex + 1;

      // 1. ¿Hay más fases en el nivel actual?
      if (nextPhaseIndex < LEVELS[currentLevelIndex].phases.length) {
        setCurrentPhaseIndex(nextPhaseIndex);
      } 
      // 2. Si no, ¿hay más niveles?
      else if (nextLevelIndex < LEVELS.length) {
        setCurrentLevelIndex(nextLevelIndex);
        setCurrentPhaseIndex(0); // Reiniciar a la primera fase del nuevo nivel
      } 
      // 3. ¡Juego completado!
      else {
        // Marcamos como completado para el mensaje final
        setShowSummaryModal(false);
        setTanukiState('happy');
        return; 
      }
    }
    
    // Reiniciar contadores para la nueva fase/reintento
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCurrentHint(null);
    setCorrectCount(0); // Reiniciar solo el contador de aciertos/fallos para la nueva fase
    setWrongCount(0);
    setCorrectStreak(0);
    setStars(0); // Se reinician las estrellas por fase

    // Mantener el tiempo total para el desafío, pero reanudar
    setTimeLeft((prevTime) => (prevTime > 0 ? prevTime : 59 * 60)); // Si el tiempo llegó a cero, lo reiniciamos, si no, lo mantenemos.
    setShowSummaryModal(false);
    setTanukiState('normal');

    if (bgmRef.current) {
      try {
        await bgmRef.current.playAsync();
      } catch (e) {}
    }
  };


  // ✅ Manejo de selección de opción y avance automático de FASE
  const handleOptionPress = (option: string) => {
    if (selectedOption || timeLeft === 0 || !currentQuestion) return;

    setSelectedOption(option);

    const isCorrect = option === currentQuestion.correct;

    if (isCorrect) {
      playSound(require('../../assets/sounds/correct.mp3'));

      setCorrectCount((prevCorrect) => {
        const newCorrect = prevCorrect + 1;

        if (newCorrect % 3 === 0) {
          setStars((prevStars) => Math.min(prevStars + 1, 5));
        }

        return newCorrect;
      });

      setCorrectStreak((prevStreak) => {
        const updated = prevStreak + 1;
        if (updated === 5) {
          setTimeLeft((prevTime) => prevTime + 15);
          return 0;
        }
        return updated;
      });

      setTanukiState('normal');
    } else {
      playSound(require('../../assets/sounds/wrong.mp3'));
      setWrongCount((prevWrong) => prevWrong + 1);
      setStars((prevStars) => Math.max(prevStars - 1, 0));
      setTanukiState('fail');
      setCorrectStreak(0);
    }

    // --- LÓGICA DE AVANCE AUTOMÁTICO DE FASE ---
    if (isLastQuestionInPhase) {
      // Si fue la última pregunta, avanzamos de fase automáticamente
      // Usamos setTimeout para dar tiempo a ver el resultado antes de la transición
      setTimeout(async () => {
        if (bgmRef.current) {
            try {
                await bgmRef.current.stopAsync();
            } catch (e) {}
        }
        // Pasamos directamente a la siguiente fase
        handleNextPhase(true); 
      }, 1500); // 1.5 segundos de retraso para la transición

    } 
    // Si no es la última pregunta, el usuario debe presionar el botón "Next"
    // para avanzar.
  };

  const getOptionStyle = (option: string) => {
    if (!selectedOption) return styles.option;

    if (currentQuestion && option === selectedOption && option === currentQuestion.correct) {
      return [styles.option, { backgroundColor: '#b6e3b6' }];
    }

    if (option === selectedOption && (!currentQuestion || option !== currentQuestion.correct)) {
      return [styles.option, { backgroundColor: '#f4b5b5' }];
    }

    // Mostrar la respuesta correcta cuando el usuario ya falló
    if (currentQuestion && option === currentQuestion.correct) {
        return [styles.option, { backgroundColor: '#b6e3b6', borderColor: '#4CAF50' }];
    }

    return styles.option;
  };

  // 🕒 Formatear segundos a MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Elegir imagen según estado del mapache
  const getTanukiSource = () => {
    if (tanukiState === 'fail') return tanukiFail;
    if (tanukiState === 'happy') return tanukiHappy;
    return tanukiNormal;
  };

  // Si el juego está completo, evitamos errores al intentar acceder a currentQuestion
  if (isGameComplete && !showSummaryModal) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>¡Reto Finalizado!</Text>
        <Text>Todas las fases del JLPT N5 completadas.</Text>
      </View>
    );
  }
  
  // Determinamos si el botón Next debe estar desactivado o visible
  const isNextDisabled = !selectedOption || timeLeft === 0 || isLastQuestionInPhase;


  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* ⏱ Cronómetro */}
        <View style={styles.timerContainer}>
          <Image
            source={require('../../assets/timer.png')}
            style={styles.timerImage}
          />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* 🦝 Tanuki */}
        <Image
          source={getTanukiSource()}
          style={styles.tanuki}
          resizeMode="contain"
        />

        {/* Nivel / Fase y Progreso (Añadido para lógica del CÓDIGO A) */}
        <View style={styles.starsInfoContainer}>
          <Text style={styles.levelInfoText}>{currentLevel.name}</Text>
          <Text style={styles.phaseInfoText}>{currentPhase.name}</Text>
          <Text style={styles.questionProgressText}>
            Pregunta {currentQuestionIndex + 1} / {totalQuestionsInPhase}
          </Text>
        </View>


        {/* ⭐ Estrellas (5) */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Image
              key={i}
              source={
                i <= stars
                  ? require('../../assets/estrella_llena.png')
                  : require('../../assets/estrella_vacia.png')
              }
              style={styles.star}
            />
          ))}
        </View>

        {/* ❓ Panel de pregunta */}
        <View style={styles.panelContainer}>
          <ImageBackground
            source={require('../../assets/panel_pregunta.png')}
            style={styles.panel}
            resizeMode="stretch"
          >
            <View style={styles.questionBackground}>
              <Text style={styles.questionText}>
                {currentQuestion ? currentQuestion.question : 'Fase completada. Presiona END para salir.'}
              </Text>
            </View>

            {/* 💡 Texto de pista */}
            {currentHint && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintTitle}>Pista:</Text>
                <Text style={styles.hintText}>{currentHint}</Text>
              </View>
            )}

            <View style={styles.options}>
              {currentQuestion &&
                currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={getOptionStyle(option)}
                    onPress={() => handleOptionPress(option)}
                    disabled={!!selectedOption || timeLeft === 0}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ImageBackground>
        </View>

        {/* 🔘 Botones */}
        <View style={styles.controls}>
          <TouchableWithoutFeedback onPress={handleHint}>
            <Animated.Image
              source={require('../../assets/hint.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleHint }] },
                hintUses >= 10 && { opacity: 0.4 },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Botón NEXT restaurado */}
          <TouchableWithoutFeedback onPress={handleNext} disabled={isNextDisabled}>
            <Animated.Image
              source={require('../../assets/next.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleNext }] },
                isNextDisabled && { opacity: 0.4 }, // Desactivado si no ha respondido o es la última pregunta
              ]}
            />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={handleEnd}>
            <Animated.Image
              source={require('../../assets/end.png')}
              style={[
                styles.controlIcon,
                { transform: [{ scale: scaleEnd }] },
              ]}
            />
          </TouchableWithoutFeedback>
        </View>

        {/* 🧾 MODAL INTRODUCCIÓN */}
        <Modal visible={showIntroModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.introModalContent}>
              <Text style={styles.introTitle}>Aldea de los Tanuki</Text>
              <Text style={styles.introSubtitle}>
                Bienvenido al desafío JLPT N5 por niveles
              </Text>

              <Text style={styles.introText}>
                En lo profundo del bosque existe una pequeña aldea donde viven
                los tanuki, espíritus traviesos que adoran poner a prueba a los
                viajeros. El desafío consta de un total de **{TOTAL_PHASES} fases**, cada una con 10 preguntas.
                Supera todas las fases para conquistar la aldea.
              </Text>

              <Text style={styles.introText}>
                💠 <Text style={{ fontWeight: 'bold' }}>Reglas del juego:</Text>
              </Text>
              <Text style={styles.introListItem}>
                • Cada 3 respuestas correctas → ganas una ⭐ (hasta 5 estrellas).
              </Text>
              <Text style={styles.introListItem}>
                • Cada respuesta incorrecta → pierdes una ⭐.
              </Text>
              <Text style={styles.introListItem}>
                • Solo puedes usar la pista 💡 hasta 10 veces en todo el reto.
              </Text>
              <Text style={styles.introListItem}>
                • Si aciertas 5 preguntas seguidas → el reloj suma +15 segundos.
              </Text>
              <Text style={styles.introListItem}>
                • Si el tiempo llega a 0 → la partida termina automáticamente.
              </Text>

              <Text style={styles.introPhrase}>
                “Supera la aldea de los tanuki para obtener un logro especial.”
              </Text>

              <TouchableOpacity
                style={styles.introButton}
                onPress={() => setShowIntroModal(false)}
              >
                <Text style={styles.introButtonText}>¡Comenzar reto!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🧾 MODAL RESUMEN FINAL */}
        <Modal visible={showSummaryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.summaryModalContent}>
              <Text style={styles.summaryTitle}>
                Resumen de la Fase
              </Text>
              <Text style={[styles.summaryText, { marginBottom: 8 }]}>
                {currentLevel.name} - {currentPhase.name}
              </Text>

              <Text style={styles.summaryText}>
                Preguntas respondidas: {totalAnswered} / {totalQuestionsInPhase}
              </Text>
              <Text style={styles.summaryText}>
                ✓ Correctas: {correctCount}
              </Text>
              <Text style={styles.summaryText}>
                ✗ Incorrectas: {wrongCount}
              </Text>
              <Text style={styles.summaryText}>
                ⭐ Estrellas obtenidas: {stars} / 5
              </Text>
              <Text
                style={[styles.summaryText, { marginTop: 10, fontSize: 14 }]}
              >
                Pistas utilizadas: {hintUses} / 10
              </Text>
              
              <TouchableOpacity 
                style={[styles.summaryButton, isPhaseCompleted && {backgroundColor: '#4CAF50'}]} 
                onPress={() => handleNextPhase(isPhaseCompleted)}
              >
                <Text style={styles.summaryButtonText}>
                  {isPhaseCompleted ? 'Continuar a la siguiente fase' : 'Reintentar fase'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    width,
    height: height + 210,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  // 🕒 Estilos cronómetro
  timerContainer: {
    position: 'absolute',
    top: 45,
    left: 25,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
  },
  // 🦝 Tanuki centrado
  tanuki: {
    width: 140,
    height: 140,
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    zIndex: 10,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 180,
  },
  star: {
    width: 50,
    height: 42,
    marginHorizontal: 5,
  },
  panelContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  panel: {
    width: width * 0.9,
    paddingVertical: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 330,
    paddingTop: 30,
  },
  // ❓ Fondo del texto de la pregunta
  questionBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  // 💡 Pista
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 204, 0.9)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  hintTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 14,
  },
  hintText: {
    fontSize: 14,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  option: {
    width: '40%',
    borderWidth: 2,
    borderColor: '#5aa6f8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    margin: 6,
    backgroundColor: '#ffffffaa',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 5,
  },
  controlIcon: {
    width: 122,
    height: 110,
  },

  // 🧾 Modales (intro y resumen)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Intro modal
  introModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    elevation: 10,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#3b4a6b',
  },
  introSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#556',
  },
  introText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  introListItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
    color: '#333',
  },
  introPhrase: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
    color: '#444',
  },
  introButton: {
    marginTop: 16,
    backgroundColor: '#5aa6f8',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  introButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Summary modal
  summaryModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b4a6b',
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  summaryButton: {
    marginTop: 14,
    backgroundColor: '#5aa6f8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  summaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // ============= ESTILOS AÑADIDOS/AJUSTADOS para la lógica de Nivel/Fase =============
  // Posiciona la información de nivel/fase en la esquina superior derecha.
  starsInfoContainer: {
    position: 'absolute',
    top: 50,
    right: 25,
    alignItems: 'flex-end',
  },
  levelInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#233',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  phaseInfoText: {
    fontSize: 12,
    color: '#445',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  questionProgressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
});