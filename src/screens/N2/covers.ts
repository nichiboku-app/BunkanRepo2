// src/screens/N2/covers.ts
// Mapea (bloque, unidad) -> imagen local (require estático para que Expo la empaquete)

const FALLBACK = require("../../../assets/images/n2/n2_hero_street.webp");

// Cambia la extensión .webp si tus archivos son .jpg/.png
export const COVERS = {
  b1u1: require("../../../assets/images/n2/covers/b1_u1.webp"),
  b1u2: require("../../../assets/images/n2/covers/b1_u2.webp"),
  b1u3: require("../../../assets/images/n2/covers/b1_u3.webp"),

  b2u1: require("../../../assets/images/n2/covers/b2_u1.webp"),
  b2u2: require("../../../assets/images/n2/covers/b2_u2.webp"),
  b2u3: require("../../../assets/images/n2/covers/b2_u3.webp"),

  b3u1: require("../../../assets/images/n2/covers/b3_u1.webp"),
  b3u2: require("../../../assets/images/n2/covers/b3_u2.webp"),
  b3u3: require("../../../assets/images/n2/covers/b3_u3.webp"),

  b4u1: require("../../../assets/images/n2/covers/b4_u1.webp"),
  b4u2: require("../../../assets/images/n2/covers/b4_u2.webp"),
  b4u3: require("../../../assets/images/n2/covers/b4_u3.webp"),

  b5u1: require("../../../assets/images/n2/covers/b5_u1.webp"),
  b5u2: require("../../../assets/images/n2/covers/b5_u2.webp"),
  b5u3: require("../../../assets/images/n2/covers/b5_u3.webp"),
} as const;

export type CoverKey = keyof typeof COVERS;

export function coverFor(block: number, unit: number) {
  const key = (`b${block}u${unit}`) as CoverKey;
  return COVERS[key] ?? FALLBACK;
}
