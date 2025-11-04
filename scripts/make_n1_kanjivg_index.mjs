import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const META = path.join(ROOT, "src", "data", "n1_kanji_meta.ts");
const DIR = path.join(ROOT, "assets", "kanjivg", "n1");
const OUT = path.join(ROOT, "missing_n1_hex.txt");

if (!fs.existsSync(META)) {
  console.error("❌ No existe", META);
  process.exit(1);
}
if (!fs.existsSync(DIR)) {
  console.error("❌ No existe", DIR);
  process.exit(1);
}

const ts = fs.readFileSync(META, "utf8");

// hex declarados en el META
const want = new Set(
  [...ts.matchAll(/hex:\s*["']([0-9A-Fa-f]{4,5})["']/g)].map(m => m[1].toLowerCase())
);

// hex presentes como webp (_nums.webp o .webp)
const have = new Set(
  fs.readdirSync(DIR)
    .filter(f => f.toLowerCase().endsWith(".webp"))
    .map(f => f.toLowerCase().replace(/_nums\.webp$|\.webp$/g, ""))
);

const missing = [...want].filter(h => !have.has(h)).sort();

console.log(`META: ${want.size} | WEBP: ${have.size} | FALTAN: ${missing.length}`);
if (missing.length) {
  fs.writeFileSync(OUT, missing.join("\n") + "\n");
  console.log("→ Guardado listado en", OUT);
} else {
  console.log("✅ No faltan assets.");
}
