// src/navigation/routeForN1.ts
// Mapea el id del item de N1_LESSONS a la ruta (nombre del <Stack.Screen>)

export function routeForN1(id?: string): string | null {
  if (!id) return null;
  const key = id.trim().toLowerCase();

  switch (key) {
    case "politics":       return "Politics";           // ya existente
    case "economy":        return "Economy";            // ya existente

    // NUEVAS PANTALLAS N1
    case "tech":           return "N1_Tech";
    case "culture":        return "N1_Culture";
    case "law":            return "N1_Law";
    case "environment":    return "N1_Environment";
    case "health":         return "N1_Health";
    case "work":           return "N1_Work";
    case "opinion":        return "N1_Opinion";
    case "international":  return "N1_International";

    default:               return null; // caerá al fallback genérico N1Lesson
  }
}
