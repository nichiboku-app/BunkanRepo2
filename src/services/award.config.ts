// src/services/award.config.ts
export type AwardCfg = { points: number; achievementId?: string; mode: 'onEnter' | 'onSuccess' };

export type AwardPatterns = {
  test: RegExp;
  cfg: Omit<AwardCfg, 'achievementId'> & { achievementPrefix?: string };
}[];

/**
 * 1) EXACT MATCHES — usan los puntos/logros de tu reporte (N5→N1)
 *    Úsalas para pantallas clave o donde ya tenemos puntos claros.
 */
export const SCREEN_AWARDS: Record<string, AwardCfg> = {
  // N5 (ejemplos clave)
  'CursoN5Screen':             { points: 10, achievementId: 'n5_explorador',     mode: 'onEnter'   },
  'ActividadesN5Screen':       { points: 10, achievementId: 'n5_primer_modulo',  mode: 'onSuccess' },
  'BienvenidaCursoN5_1Screen': { points: 5,  achievementId: 'n5_bienvenida',     mode: 'onEnter'   },
  'QuizCultural':              { points: 50, achievementId: 'n5_quiz_mapache',   mode: 'onSuccess' },
  'B8EvaluacionesLogrosMenu':  { points: 50, achievementId: 'n5_gamificacion',   mode: 'onSuccess' },

  // N4
  'N4IntroScreen.tsx':         { points: 10, achievementId: 'n4_intro',          mode: 'onEnter'   },
  'CursoN4Screen.tsx':         { points: 20, achievementId: 'n4_zorro_estudioso',mode: 'onEnter'   },

  // N3 (bloque 1 + examen, como ejemplo)
  'N3_UnitScreen.tsx':               { points: 30, achievementId: 'n3_b1_u1',       mode: 'onSuccess' },
  'N3_Block1_Unit2Screen.tsx':       { points: 25, achievementId: 'n3_b1_u2',       mode: 'onSuccess' },
  'N3_Block1_Unit3Screen.tsx':       { points: 25, achievementId: 'n3_b1_u3',       mode: 'onSuccess' },
  'N3_Block1_Unit4Screen.tsx':       { points: 30, achievementId: 'n3_b1_u4',       mode: 'onSuccess' },
  'N3_Block1_Unit5Screen.tsx':       { points: 35, achievementId: 'n3_b1_u5',       mode: 'onSuccess' },
  'N3_B2_U1_Screen.tsx':             { points: 20, achievementId: 'n3_b2_u1',       mode: 'onSuccess' },
  'N3_B2_U2_PracticeScreen.tsx':     { points: 25, achievementId: 'n3_b2_u2',       mode: 'onSuccess' },
  'N3_B2_U3_PracticeScreen.tsx':     { points: 25, achievementId: 'n3_b2_u3',       mode: 'onSuccess' },
  'N3_B2_U4_PracticeScreen.tsx':     { points: 30, achievementId: 'n3_b2_u4',       mode: 'onSuccess' },
  'N3_B2_U5_PracticeScreen.tsx':     { points: 35, achievementId: 'n3_b2_u5',       mode: 'onSuccess' },
  'N3_B3_U3_PracticeScreen.tsx':     { points: 35, achievementId: 'n3_b3_u3',       mode: 'onSuccess' },
  'N3_B4_U20_PracticeScreen.tsx':    { points: 35, achievementId: 'n3_b4_u20',      mode: 'onSuccess' },
  'N3_FinalExamScreen.tsx':          { points: 50, achievementId: 'n3_exam_leon',   mode: 'onSuccess' },

  // N2 (bloque 1 claro + browse)
  'N2_B1_U1.tsx':              { points: 25, achievementId: 'n2_b1_u1',          mode: 'onSuccess' },
  'N2_B1_U2.tsx':              { points: 30, achievementId: 'n2_b1_u2',          mode: 'onSuccess' },
  'N2_B1_U3.tsx':              { points: 35, achievementId: 'n2_b1_u3',          mode: 'onSuccess' },
  'N2BrowseScreen.tsx':        { points: 5,  achievementId: 'n2_explorador',      mode: 'onEnter'   },

  // N1
  'CursoN1.tsx':               { points: 10, achievementId: 'n1_inicio',         mode: 'onEnter'   },
  'N1_EconomyScreen.tsx':      { points: 20, achievementId: 'n1_economia',       mode: 'onSuccess' },
  'N1GameScreen.tsx':          { points: 100,achievementId: 'n1_reflejos',       mode: 'onSuccess' },
  'N1ExamScreen.tsx':          { points: 150,achievementId: 'n1_exam',           mode: 'onSuccess' },
  'N1KanjiGameScreen.tsx':     { points: 10, achievementId: 'n1_kanji_game',     mode: 'onSuccess' },
};

/**
 * 2) PATTERNS — cubren “familias” de pantallas sin mapear una a una.
 *    Puedes ajustar puntos y prefijos de logro por bloque.
 */
export const SCREEN_PATTERNS: AwardPatterns = [
  // N3: cualquier práctica de B3 (por defecto 30 PX), luego override exacto para U3/U5 arriba.
  { test: /^N3_B3_U\d+_PracticeScreen(?:\.tsx)?$/, cfg: { points: 30, mode: 'onSuccess', achievementPrefix: 'n3_b3' } },

  // N3: prácticas de B4 (30 PX por defecto) — override exacto de U20 arriba.
  { test: /^N3_B4_U\d+_PracticeScreen(?:\.tsx)?$/, cfg: { points: 30, mode: 'onSuccess', achievementPrefix: 'n3_b4' } },

  // N3: prácticas de B5 (30 PX por defecto)
  { test: /^N3_B5_U\d+(?:_PracticeScreen)?(?:\.tsx)?$/, cfg: { points: 30, mode: 'onSuccess', achievementPrefix: 'n3_b5' } },

  // N6: prácticas de B6 (30 PX por defecto) — habrá overrides exactos si cambian.
  { test: /^N3_B6_U\d+_PracticeScreen(?:\.tsx)?$/, cfg: { points: 30, mode: 'onSuccess', achievementPrefix: 'n3_b6' } },

  // N2: unidades B2–B5 (25 PX por defecto por unidad)
  { test: /^N2_B([2-5])_U\d+(?:\.tsx)?$/, cfg: { points: 25, mode: 'onSuccess', achievementPrefix: 'n2_b' } },

  // “Intro / Browse / Menu / Hub” suelen premiar al entrar
  { test: /(Intro|Browse|Menu|Hub)/i, cfg: { points: 5, mode: 'onEnter', achievementPrefix: 'explorer' } },
];
