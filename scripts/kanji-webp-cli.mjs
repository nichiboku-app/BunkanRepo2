import fs from "fs-extra";
import fg from "fast-glob";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const pExec = promisify(execFile);

const args = process.argv.slice(2);
const getArg = (k, def = undefined) => {
  const i = args.indexOf(k);
  return i !== -1 ? args[i + 1] : def;
};

const dir = getArg("--dir", "assets/kanjivg/n3");
const hexCsv = getArg("--hex"); // opcional
await fs.ensureDir(dir);

const wanted = hexCsv ? new Set(hexCsv.split(",").map(s => s.trim().toLowerCase())) : null;
const svgs = await fg("*.svg", { cwd: dir, absolute: true });

if (svgs.length === 0) {
  console.log(`No se hallaron SVG en ${dir}`);
  process.exit(0);
}

// Detecta si hay magick.exe disponible
let haveMagick = false;
try {
  await pExec(process.platform === "win32" ? "where" : "which", ["magick"]);
  haveMagick = true;
} catch { haveMagick = false; }

const isSvgFile = async (file) => {
  try {
    const fh = await fs.open(file, "r");
    const buf = Buffer.alloc(256);
    await fh.read(buf, 0, 256, 0);
    await fh.close();
    return buf.toString("utf8").includes("<svg");
  } catch { return false; }
};

let ok=0, skipped=0, madeNums=0, failed=0;

for (const svg of svgs) {
  const hex = path.basename(svg, ".svg").toLowerCase();
  if (wanted && !wanted.has(hex)) continue;

  const webp = path.join(dir, `${hex}.webp`);
  const nums = path.join(dir, `${hex}_nums.webp`);

  if (await fs.pathExists(webp)) { skipped++; }
  else {
    // Primero intenta con ImageMagick; si falla o no está, usa sharp
    try {
      if (haveMagick) {
        await pExec("magick", [svg, "-density", "320", "-background", "white", "-flatten", webp]);
      } else {
        // Verifica que realmente sea SVG válido antes de sharp
        const valid = await isSvgFile(svg);
        if (!valid) throw new Error("no parece SVG válido");
        await sharp(svg, { density: 320 })
          .flatten({ background: "#ffffff" })
          .webp({ quality: 92 })
          .toFile(webp);
      }
      console.log(`WEBP OK: ${path.basename(webp)}`);
      ok++;
    } catch (e) {
      console.error(`ERROR WEBP ${hex}: ${e.message}`);
      failed++;
      continue;
    }
  }

  // Crea placeholder *_nums.webp si no existe
  if (!(await fs.pathExists(nums)) && (await fs.pathExists(webp))) {
    await fs.copy(webp, nums);
    console.log(`NUMS OK: ${path.basename(nums)}`);
    madeNums++;
  }
}

console.log(`\nResumen  creados:${ok}, saltados(webp ya existía):${skipped}, nums creados:${madeNums}, errores:${failed}`);
