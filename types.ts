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
  
     // ===== B4: Gramática I =====
B4_Desu: undefined;
B4_DesuNeg: undefined;
B4_PregKa: undefined;
B4_KoreSoreAre: undefined;
B4_NoModifier: undefined;      // の (posesión/modificador)
B4_WaGa: undefined;
B4_Wo: undefined;
B4_NiHe: undefined;
B4_De: undefined;
B4_ArimasuImasu: undefined;
B4_Adjetivos: undefined;       // い／な adjetivos
B4_Mo: undefined;
B4_Tiempo: undefined;          // 時間・曜日・に
B4_MasuIntro: undefined;       // ます afirmativo
B4_MasuNeg: undefined;         // ません negativo

  B5_Contadores: undefined;
  B5_TiempoPuntos: undefined;
  B5_TiempoDuracion: undefined;
  B5_Frecuencia: undefined;
  B5_AdverbiosFrecuencia: undefined;
  B5_DiasMeses: undefined;
  B5_HorariosRutina: undefined;
  B5_VecesContador: undefined;
  B5_ParticulasTiempo: undefined;

  B6_Compras: undefined;
  B6_Restaurante: undefined;
  B6_Transporte: undefined;
  B6_Dinero: undefined;
  B6_Direcciones: undefined;
  B6_Tiendas: undefined;
  B6_Hotel: undefined;
  B6_Emergencias: undefined;

  N4Intro: undefined;
  
    // N3
  N3Intro: undefined;
  CursoN3: undefined;
  N3_Unit: { block: number; unit: number; title: string } | undefined;
N3_MetasFinalidad: undefined;
N3_DecisionesCambios: undefined;
N3_HabitosRutinas: undefined;
N3_AccionesSin: undefined;
N3_ReglasPermisos: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
