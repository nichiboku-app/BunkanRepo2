// src/utils/geo.ts
export type CCA2 = string;

/** Acepta cualquier string y devuelve un CCA2 válido (fallback "MX"). */
export function sanitizeCCA2(code?: string | null): CCA2 {
  if (!code) return "MX";
  const up = code.toUpperCase().trim();
  // Validar formato AA
  if (!/^[A-Z]{2}$/.test(up)) return "MX";
  // Bloquear códigos inventados como "XX"
  if (["XX", "ZZ"].includes(up)) return "MX";
  return up;
}
