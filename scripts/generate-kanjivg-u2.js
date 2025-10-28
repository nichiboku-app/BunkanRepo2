// scripts/generate-kanjivg-u2.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../assets/kanjivg/n2");

// Kanji de la U2 (los que definimos)
const KANJI = [
  { ch: "原", cp: 0x539f },
  { ch: "因", cp: 0x56e0 },
  { ch: "結", cp: 0x7d50 },
  { ch: "果", cp: 0x679c },
  { ch: "功", cp: 0x529f },
  { ch: "失", cp: 0x5931 },
  { ch: "敗", cp: 0x6557 },
  { ch: "努", cp: 0x52aa },
  { ch: "力", cp: 0x529b },
  { ch: "影", cp: 0x5f71 },
  { ch: "響", cp: 0x97ff },
  { ch: "効", cp: 0x52b9 },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const k of KANJI) {
    const hex5 = k.cp.toString(16).toLowerCase().padStart(5, "0"); // 👈 clave
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex5}.svg`;
    const outSvg = path.join(OUT_DIR, `${hex5}.svg`);

    process.stdout.write(`→ ${k.ch} (${hex5}) … descargando SVG\n`);
    try {
      const { data } = await axios.get(url, { responseType: "text" });
      fs.writeFileSync(outSvg, data, "utf8");
      process.stdout.write(`  ✓ guardado: ${path.relative(process.cwd(), outSvg)}\n`);
    } catch (e) {
      process.stdout.write(`  ✗ error con ${k.ch} (${hex5}): ${e.message}\n`);
      continue;
    }

    // (opcional) si luego conviertes a *_nums.webp aquí llama a tu pipeline de numeración/raster.
    // await rasterAndNumber(outSvg, path.join(OUT_DIR, `${hex5}_nums.webp`));
  }

  console.log("\nHecho. Revisa assets/kanjivg/n2/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
