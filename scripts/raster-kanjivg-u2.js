// scripts/raster-kanjivg-u2.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.join(__dirname, "../assets/kanjivg/n2");
const OUT_SIZE = 1024; // resolución base; tu app escala a ~330px sin perder nitidez

(async () => {
  const files = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith(".svg") && !f.includes("_nums"));

  for (const f of files) {
    const src = path.join(SRC_DIR, f);
    const base = f.replace(".svg", "");
    const out = path.join(SRC_DIR, `${base}_nums.webp`);

    process.stdout.write(`→ ${f}  →  ${path.basename(out)}\n`);
    try {
      const svg = fs.readFileSync(src);

      // Nota: KanjiVG ya trae <text> con números (grupo StrokeNumbers).
      // Rasterizamos con buena densidad y fondo blanco.
      await sharp(svg, { density: 460 }) // alta densidad para nitidez
        .flatten({ background: "#ffffff" }) // coloca fondo blanco
        .resize(OUT_SIZE, OUT_SIZE, { fit: "contain", background: "#ffffff" })
        .webp({ quality: 92 })
        .toFile(out);

      process.stdout.write(`  ✓ ok\n`);
    } catch (e) {
      process.stdout.write(`  ✗ error: ${e.message}\n`);
    }
  }

  console.log("\nListo. Revisa assets/kanjivg/n2/*_nums.webp");
})();
