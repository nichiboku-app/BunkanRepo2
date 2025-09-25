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

  // Pantallas separadas N5
  OrigenesDelIdioma: undefined;
  EscrituraN5: undefined;
  CulturaN5: undefined;

  // Actividades intro
  QuizCultural: undefined;
  GifSaludo: undefined;

  // Ejercicios
  VowelExercises: undefined;

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

  // ...rutas que ya tienes
  HiraganaMMenu: undefined;
  HiraganaYRMenu: undefined;
  // (opcional si luego creas subpantallas)
  M_Dictado: undefined;
  M_PracticaVoz: undefined;
  YR_AudioInteractivo: undefined;
  YR_CompletarPalabras: undefined;

  HiraganaWNMenu: undefined;
  WN_LecturaFrases: undefined;
  WN_PracticaNFinal: undefined;

  KatakanaMenu: undefined;
  KatakanaChallenge: undefined;
  KatakanaRow: { row: "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W" } | undefined;

  // Bloques
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
      B3_PreguntasBasicas: undefined; // 👈 NUEVA RUTA
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
