import fs from "fs-extra";
import fg from "fast-glob";
import sharp from "sharp";
import path from "node:path";

/**
 * Uso:
 *  node scripts/kanji-webp.mjs --dir assets/kanjivg/n3
 *  node scripts/kanji-webp.mjs --dir assets/kanjivg/n3 --hex 4ef6,95a2,9023,984c,8ad6,554f,8a18,8ff0,6848,8cc7
 */

const args = process.argv.slice(2);
const getArg = (k, def = undefined) => {
  const i = args.indexOf(k);
  return i !== -1 ? args[i + 1] : def;
};

const dir = getArg("--dir", "assets/kanjivg/n3");
const hexCsv = getArg("--hex"); // opcional

await fs.ensureDir(dir);

const wanted = hexCsv
  ? new Set(hexCsv.split(",").map((s) => s.trim().toLowerCase()))
  : null;

// Busca SVGs en la carpeta destino (ej: assets/kanjivg/n3/*.svg)
const svgs = await fg("*.svg", { cwd: dir, absolute: true });
if (svgs.length === 0) {
  console.log(`No se hallaron SVG en ${dir}`);
  process.exit(0);
}

let ok = 0, skipped = 0, madeNums = 0;

for (const svg of svgs) {
  const hex = path.basename(svg, ".svg").toLowerCase();
  if (wanted && !wanted.has(hex)) continue;

  const webp = path.join(dir, `${hex}.webp`);
  const nums = path.join(dir, `${hex}_nums.webp`);

  if (!(await fs.pathExists(webp))) {
    try {
      await sharp(svg, { density: 320 })
        .flatten({ background: "#ffffff" }) // fondo blanco si hay transparencia
        .webp({ quality: 92 })
        .toFile(webp);
      console.log(`WEBP OK: ${path.basename(webp)}`);
      ok++;
    } catch (e) {
      console.error(`ERROR WEBP ${hex}: ${e.message}`);
      continue;
    }
  } else {
    skipped++;
  }

  if (!(await fs.pathExists(nums)) && (await fs.pathExists(webp))) {
    await fs.copy(webp, nums);
    console.log(`NUMS OK: ${path.basename(nums)}`);
    madeNums++;
  }
}

console.log(`\nResumen  creados: ${ok}, saltados(webp ya existía): ${skipped}, nums creados: ${madeNums}`);
