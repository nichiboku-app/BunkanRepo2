export type QuizSet = {
  title?: string;      // opcional, se muestra como “Quiz n: <title>”
  lines: string[];     // frases en el orden correcto
};

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

  /** 👇 nuevo: soporta N quizzes (nos quedamos con 6 como tope en UI) */
  quizzes?: QuizSet[];

  kanji10: Array<{
    ch: string; kun?: string[]; on?: string[]; es: string; trazos?: number;
    strokeCode?: string; ej?: Array<{ jp: string; yomi: string; es: string }>;
  }>;
};
