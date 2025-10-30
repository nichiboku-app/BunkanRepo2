export type N1LessonId =
  | "politics" | "economy" | "tech" | "culture" | "law"
  | "environment" | "health" | "work" | "opinion" | "international";

export interface N1Lesson {
  id: N1LessonId;
  title: string;
  subtitle: string;   // breve, 1 línea
  durationMin: number;
  image: any;         // require(...)
  cta: string;        // "Empezar"
}
