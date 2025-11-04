import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const META = path.join(__dirname, "..", "src", "data", "n1_kanji_meta.ts");
const INDEX = path.join(__dirname, "..", "src", "data", "n1_kanjivg.ts");
const OUT = path.join(__dirname, "..", "missing_n1_hex.txt");

const meta = fs.readFileSync(META, "utf8");
const index = fs.readFileSync(INDEX, "utf8");

// hex del META
const metaHex = Array.from(meta.matchAll(/hex:\s*["'`](\w{4})["'`]/g)).map(m=>m[1].toLowerCase());

// claves presentes en el índice de assets
const idxHex = Array.from(index.matchAll(/["'`](\w{4})["'`]\s*:/g)).map(m=>m[1].toLowerCase());

const missing = metaHex.filter(h => !idxHex.includes(h));

fs.writeFileSync(OUT, missing.join(" "), "utf8");
console.log(`Faltan ${missing.length}. Hex guardados en ${OUT}`);
