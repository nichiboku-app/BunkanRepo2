// src/content/n4/types.ts
// Ajustado con los campos nuevos para MCQ y ordenamiento que comentamos.
// Mantiene total compatibilidad con pantallas anteriores.

export type QuizSet = {
  title?: string;      // opcional, se muestra como “Quiz n: <title>”
  lines: string[];     // frases en el orden correcto
};

/* ===== Nuevos tipos para interactividad (MCQ y Lecturas) ===== */
export type MCQItem = {
  id: string;                // identificador único
  promptJp: string;          // enunciado JP (puede incluir 【　】)
  roma?: string;             // romaji para TTS
  answers: string[];         // opciones a mostrar (A, B, C, D…)
  correctIndex: number;      // índice 0-based de la respuesta correcta
  explainEs?: string;        // explicación corta (opcional)
};

export type ReadingQuestion = {
  q: string;                 // pregunta en JP/ES
  roma?: string;             // romaji opcional
  choices: string[];         // opciones
  correctIndex: number;      // índice 0-based
};

export type ReadingItem = {
  title: string;             // título del texto
  kana: string[];            // líneas en kana (TTS)
  kanji: string[];           // mismas líneas con kanji
  questions: ReadingQuestion[]; // 3 MCQ estilo JLPT
};

/* ===== Tipos existentes (conservar) ===== */
export type ThemeContent = {
  objetivos: string[];
  vocabClase: { key: string; jp: string; romaji?: string; es: string }[];
  oraciones6: { key: string; jp: string; romaji?: string; es: string; exp?: string }[];
  gramatica: {
    titulo: string;
    puntos: Array<{
      regla: string;
      pasoapaso: string[];
      ejemploJP?: string;
      ejemploRoma?: string;
      ejemploES?: string;
      ejemplos?: { jp: string; roma?: string; es?: string }[];
      tabla?: { title?: string; headers: string[]; rows: string[][]; note?: string };
    }>;
  };
  dialogos: Array<{ title: string; kana: string[]; kanji: string[]; es?: string[] }>;

  /** 👇 compat: lo que ya usabas (1 solo quiz) */
  quizLines?: string[];

  /** 👇 nuevo: soporta N quizzes (ordenar). La UI usa hasta 6 sets. */
  quizzes?: QuizSet[];

  /** ===== NUEVOS CAMPOS OPCIONALES (interactividad) =====
   *  Se pueden usar en pantallas como la 30 (repaso/simulacro).
   *  Si no están presentes, la UI debe ignorarlos sin romper.
   */
  mcqVocab?: MCQItem[];        // Vocabulario en formato MCQ (cloze)
  mcqGrammar?: MCQItem[];      // Gramática en formato MCQ
  orderSentences?: string[][]; // Oraciones para ordenar (fragmentos)
  orderDialogs?: string[][];   // Diálogos para ordenar (líneas)
  readings?: ReadingItem[];    // Lecturas con preguntas MCQ

  kanji10: Array<{
    ch: string; kun?: string[]; on?: string[]; es: string; trazos?: number;
    strokeCode?: string; ej?: Array<{ jp: string; yomi: string; es: string }>;
  }>;
};
