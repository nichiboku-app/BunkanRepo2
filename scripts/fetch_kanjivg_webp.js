// scripts/fetch_kanjivg_webp.mjs  (v3 con trazas y códigos minúscula)
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

console.log("▶ KanjiVG → WEBP (v3) — usando códigos en minúscula");

// Carpeta de salida
const OUT_DIR = path.resolve("assets/kanjivg/weekdays");

// Kanji de los días (códigos Unicode). ¡OJO: ya los pongo en minúscula!
const KANJI = [
  { char: "月", code: "06708", out: "getsu_web.webp" }, // lunes
  { char: "火", code: "0706b", out: "ka_web.webp"   },   // martes  (minúscula)
  { char: "水", code: "06c34", out: "sui_web.webp"  },   // miércoles(minúscula)
  { char: "木", code: "06728", out: "moku_web.webp" },   // jueves
  { char: "金", code: "091d1", out: "kin_web.webp"  },   // viernes (minúscula)
  { char: "土", code: "0571f", out: "do_web.webp"   },   // sábado  (minúscula)
  { char: "日", code: "065e5", out: "nichi_web.webp"}    // domingo (minúscula)
];

const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fetchSvg(code) {
  const file = `${code.toLowerCase()}.svg`; // por si acaso
  const url  = `${BASE}/${file}`;
  console.log("  · Descargando:", url);     // 👈 traza para verificar minúsculas
  const res  = await fetch(url, { headers: { "User-Agent": "kanjivg-webp-script/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} al bajar ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function svgToWebp(svgBuf, outFile) {
  const buf = await sharp(svgBuf, { density: 384 })
    .resize(1024, 1024, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 92 })
    .toBuffer();
  await fs.writeFile(outFile, buf);
}

(async () => {
  await ensureDir(OUT_DIR);
  for (const k of KANJI) {
    try {
      const svg = await fetchSvg(k.code);
      const outPath = path.join(OUT_DIR, k.out);
      await svgToWebp(svg, outPath);
      console.log(`✔ ${k.char} → ${outPath}`);
    } catch (e) {
      console.error(`✖ Error con ${k.char}:`, e.message);
      process.exitCode = 1;
    }
  }
  console.log("\n✅ Listo. Imágenes en assets/kanjivg/weekdays/");
  console.log("ℹ Acredita: “Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0”.");
})();
