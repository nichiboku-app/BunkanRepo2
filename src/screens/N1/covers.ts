// src/screens/N1/covers.ts
// Mapea cada id de lección a su require estático (siempre .webp)
export function coverFor(id: string) {
  switch (id) {
    case "politics":
      return require("../../../assets/images/n1/politics.webp");
    case "economy":
      return require("../../../assets/images/n1/economy.webp");
    case "tech":
      return require("../../../assets/images/n1/tech.webp");
    case "culture":
      return require("../../../assets/images/n1/culture.webp");
    case "law":
      return require("../../../assets/images/n1/law.webp");
    case "environment":
      return require("../../../assets/images/n1/environment.webp");
    case "health":
      return require("../../../assets/images/n1/health.webp");
    case "work":
      return require("../../../assets/images/n1/work.webp");
    case "opinion":
      return require("../../../assets/images/n1/opinion.webp");
    case "international":
      return require("../../../assets/images/n1/international.webp");
    // fondo del HERO de N1 Home:
    case "n1_intro_bg":
      return require("../../../assets/images/n1/n1_intro_bg.webp");
    default:
      // Fallback (elige una que tengas)
      return require("../../../assets/images/n1/tech.webp");
  }
}
