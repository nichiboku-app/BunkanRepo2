export type RootStackParamList = {
  // Core
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;
  Home: undefined;

  // N5
  N5Bienvenida: undefined;
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
  Hiragana: undefined;
  TemaN5: { title?: string } | undefined;
  TemaGramaticaFamiliaN5: undefined;

  // Pantallas separadas N5
  OrigenesDelIdioma: undefined;
  EscrituraN5: undefined;
  CulturaN5: undefined;
   RetoN5: undefined;

  // Actividades intro
  QuizCultural: undefined;
  GifSaludo: undefined;
  N5_Diagnostico: undefined;
  // Ejercicios
  VowelExercises: undefined;
    TemasBasicos: undefined;
      
  ActividadesN5: undefined;
  ActividadesN4: undefined;
  ActividadesN3: undefined;
  ActividadesN2: undefined;
  ActividadesN1: undefined;

  // Reproductor
  VideoIntroModal: { videoId?: string } | undefined;

  // Hiragana Grupo A
  TrazosGrupoA: undefined;
  PronunciacionGrupoA: undefined;
  EjemplosGrupoA: undefined;

  // Implementadas nuevas
  ATarjetas: undefined;
  ATrazoAnimado: undefined;
  ADictadoVisual: undefined;

  // Placeholders varios
  TarjetasGrupoA: undefined;
  TrazoAnimadoGrupoA: undefined;
  DictadoVisualGrupoA: undefined;

  // Grupo K
  TrazoGrupoK: undefined;
  PronunciacionGrupoK: undefined;
  VocabularioGrupoK: undefined;
  MatchingGrupoK: undefined;
  MemoriaGrupoK: undefined;

  // Familias S/T
  FamiliaS: undefined;
 OnboardingN5: undefined;
  // Grupo S
  SEscrituraGrupoS: undefined;
  SEjemplosGrupoS: undefined;
  SCaligrafiaDigital: undefined;
  SLecturaSilabas: undefined;

  // Grupo T
  TTrazoGif: undefined;
  TQuizEscucha: undefined;
  FamiliaNH: undefined;
  NLecturaGuiada: undefined;
  HRoleplaySaludo: undefined;
    CrearCuenta: undefined;

  
  MapaNiveles: undefined;
  NivelN5: undefined;
  NivelN4: undefined;
  NivelN3: undefined;
  NivelN2: undefined;
  NivelN1: undefined;

  // Menús y subpantallas Hiragana
  HiraganaMMenu: undefined;
  HiraganaYRMenu: undefined;
  M_Dictado: undefined;
  M_PracticaVoz: undefined;
  YR_AudioInteractivo: undefined;
  YR_CompletarPalabras: undefined;

  HiraganaWNMenu: undefined;
  WN_LecturaFrases: undefined;
  WN_PracticaNFinal: undefined;

  // Katakana
  KatakanaMenu: undefined;
  KatakanaChallenge: undefined;
  KatakanaRow:
    | { row: "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W" }
    | undefined;

  // Bloques N5
  B3VocabularioMenu: undefined;
  B4GramaticaIMenu: undefined;
  B5GramaticaIIMenu: undefined;
  B6VidaCotidianaMenu: undefined;
  B7LecturaPracticaMenu: undefined;
  B8EvaluacionesLogrosMenu: undefined;
  ExamenFinalMapacheN5: undefined;

  // B3 — Números y Edad
  B3_NumerosEdad: undefined;
  B3_NumerosEdad_Roleplay: undefined;
  B3_NumerosEdad_Tarjetas: undefined;
  B3_NumerosEdad_Contadores: undefined;

  // B3 — Familia
  B3_Familia: undefined;
  B3_Familia_Roleplay: undefined;
  B3_Familia_Tarjetas: undefined;
  B3_Familia_Arbol: undefined;

  // B3 — Profesiones
  B3_Profesiones: undefined;
  B3_Profesiones_Tarjetas: undefined;
  B3_Profesiones_Roleplay: undefined;
  B3_Profesiones_Oraciones: undefined;
  B3_Profesiones_Dialogo: undefined;

  // ⭐ B3 — Nuevas pantallas
  B3_ObjetosClase: undefined;
  B3_LugaresCiudad: undefined;
  B3_PreguntasBasicas: undefined;
  B3_ComidaBebidas: undefined;
  B3_ColoresAdjetivos: undefined;
  B3_Cortesia: undefined;

  // ===== B4: Gramática I =====
  B4_Desu: undefined;
  B4_DesuNeg: undefined;
  B4_PregKa: undefined;
  B4_KoreSoreAre: undefined;
  B4_NoModifier: undefined; // の (posesión/modificador)
  B4_WaGa: undefined;
  B4_Wo: undefined;
  B4_NiHe: undefined;
  B4_De: undefined;
  B4_ArimasuImasu: undefined;
  B4_Adjetivos: undefined; // い／な adjetivos
  B4_Mo: undefined;
  B4_Tiempo: undefined; // 時間・曜日・に
  B4_MasuIntro: undefined; // ます afirmativo
  B4_MasuNeg: undefined; // ません negativo

  // ===== B5 =====
  B5_Contadores: undefined;
  B5_TiempoPuntos: undefined;
  B5_TiempoDuracion: undefined;
  B5_Frecuencia: undefined;
  B5_AdverbiosFrecuencia: undefined;
  B5_DiasMeses: undefined;
  B5_HorariosRutina: undefined;
  B5_VecesContador: undefined;
  B5_ParticulasTiempo: undefined;

  // ===== B6 =====
  B6_Compras: undefined;
  B6_Restaurante: undefined;
  B6_Transporte: undefined;
  B6_Dinero: undefined;
  B6_Direcciones: undefined;
  B6_Tiendas: undefined;
  B6_Hotel: undefined;
  B6_Emergencias: undefined;

  // === N4 ===
  N4Intro: undefined;
  CursoN4: undefined;
  N4_Tema: undefined;

  // === N3 ===
  N3Intro: undefined;
  CursoN3: undefined;
  N3_Unit: { block: number; unit: number; title: string } | undefined;
  N3_MetasFinalidad: undefined;
  N3_DecisionesCambios: undefined;
  N3_HabitosRutinas: undefined;
  N3_AccionesSin: undefined;
  N3_ReglasPermisos: undefined;
  N3_Block1_Unit3: undefined;
  N3_Block1_Unit4: undefined | { block: number; unit: number; title?: string };
  N3_Block1_Unit5: undefined | { block: number; unit: number; title?: string };

  // N3 B2
  N3_B2_U1: undefined | { block?: 2; unit?: 1; title?: string };
  N3_B2_U1_Practice: undefined | { from?: "N3_B2_U1" };
  N3_B2_U2_Practice: undefined | { from?: "N3_B2_U2" };
  N3_B2_U3_Practice: undefined | { from?: "N3_B2_U3" };
  N3_B2_U4_Practice: undefined | { from?: "N3_B2_U4" };
  N3_B2_U10_Practice: undefined | { from?: "N3_B2_U10" };

  // N3 B3
  N3_B3_U1_Practice: undefined | { from?: string };
  N3_B3_U2_Practice: undefined | { from?: string };
  N3_B3_U3_Practice: undefined | { from?: string };
  N3_B3_U4_Practice: undefined | { from?: string };
  N3_B3_U5_Practice: undefined | { from?: string };

  // N3 B4
  N3_B4_U1_Practice: undefined | { from?: string };
  N3_B4_U2_Practice: undefined | { from?: string };
  N3_B4_U3_Practice: undefined | { from?: string };
  N3_B4_U4_Practice: undefined | { from?: string };
  N3_B4_U20_Practice: undefined | { from?: string };

  // N3 B5
  N3_B5_U1_Practice: undefined | { from?: string };
  N3_B5_U2_Practice: undefined | { from?: string };
  N3_B5_U3_Practice: undefined | { from?: string };
  N3_B5_U4_Practice: undefined | { from?: string };
  N3_B5_U5_Practice: undefined | { from?: string };

  // N3 B6
  N3_B6_U2_Practice: undefined | { from?: string };
  N3_B6_U3_Practice: undefined | { from?: string };
  N3_B6_U4_Practice: undefined | { from?: string };
  N3_B6_U6_Practice: undefined | { from?: string };

  N3_FinalExam: undefined;

  // === N2 ===
  N2Intro: undefined;
  CursoN2: undefined;
  N2_B1_U1: undefined;
  N2_B1_U2: undefined;
  N2_B1_U3: undefined;
  N2_B2_U1: undefined;
  N2_B2_U2: undefined;
  N2_B2_U3: undefined;

  // === N1 ===
   N1_Tech: undefined;
  N1_Culture: undefined;
  N1_Law: undefined;
  N1_Environment: undefined;
  N1_Health: undefined;
  N1_Work: undefined;
  N1_Opinion: undefined;
  N1_International: undefined;
  N1Intro: undefined;
  CursoN1: undefined;
  N1Home: undefined;
  N1Lesson: { id: string };
  N1KanjiHub: undefined;
  N1Exam: undefined;
  N1KanjiLesson: { id: string; kanji: string };
  N1Quiz: {
    id: string;
    hex: string;
    kanji: string;
    on: string[];
    kun: string[];
    es: string;
    words: { jp: string; reading: string; es: string }[];
  };
  Economy: undefined;
  N1Game: {
    id: string;
    hex: string;
    kanji: string;
    on: string[];
    kun: string[];
    es: string;
    words: { jp: string; reading: string; es: string }[];
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
