// scripts/gen-kanji.js
const path = require("path");
const fs = require("fs");
const fg = require("fast-glob");
const sharp = require("sharp");

// Uso: node scripts/gen-kanji.js --src assets/kanjivg/src/n2 --out assets/kanjivg/n2 --size 330
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.replace(/^--/, ""), arr[i + 1]]);
    return acc;
  }, [])
);

const SRC = args.src || "assets/kanjivg/src/n2";
const OUT = args.out || "assets/kanjivg/n2";
const SIZE = parseInt(args.size || "330", 10);

(async () => {
  const absSrc = path.resolve(process.cwd(), SRC);
  const absOut = path.resolve(process.cwd(), OUT);

  console.log(`cwd: ${process.cwd()}`);
  console.log(`SRC: ${SRC} -> ${absSrc}`);
  console.log(`OUT: ${OUT} -> ${absOut}`);

  try {
    await fs.promises.access(absSrc, fs.constants.R_OK);
  } catch {
    console.error(`❌ La carpeta SRC no existe o no se puede leer: ${absSrc}`);
    process.exit(1);
  }

  await fs.promises.mkdir(absOut, { recursive: true });

  // IMPORTANTE: búsqueda recursiva
  const files = await fg("**/*.svg", { cwd: absSrc, onlyFiles: true });

  console.log(`➡️  ${files.length} SVG encontrados en ${SRC}`);
  if (files.length === 0) {
    console.log("ℹ️  Revisa que existan .svg dentro de esa carpeta o sus subcarpetas.");
  }

  for (const rel of files) {
    const inPath = path.join(absSrc, rel);
    const base = path.basename(rel, ".svg"); // p. ej. "05c0a"
    const outPath = path.join(absOut, `${base}_plain.webp`);
    try {
      const svg = await fs.promises.readFile(inPath);
      await sharp(svg, { density: 300 })
        .resize(SIZE, SIZE, { fit: "contain", background: "#FFFFFF" })
        .webp({ quality: 92 })
        .toFile(outPath);
      console.log(`✔ ${path.relative(process.cwd(), outPath)}`);
    } catch (e) {
      console.error(`✖ Error con ${rel}: ${e.message}`);
    }
  }

  console.log("✅ Terminado.");
})();
