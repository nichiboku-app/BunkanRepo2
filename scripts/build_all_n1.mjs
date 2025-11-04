// scripts/build_all_n1.mjs
// Ejecuta: node scripts/build_all_n1.mjs
// 1) Extrae todos los HEX de src/data/n1_kanji_meta.ts
// 2) Genera los WEBP (assets/kanjivg/n1/<hex>_nums.webp) con Resvg+Sharp
// 3) Regenera el índice src/data/n1_kanjivg.ts
// Requiere: npm i -D @resvg/resvg-js sharp

import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const META_TS = path.join(ROOT, "src", "data", "n1_kanji_meta.ts");
const OUT_DIR = path.join(ROOT, "assets", "kanjivg", "n1");
const RAW1 = path.join(ROOT, "assets", "kanjivg", "raw");
const RAW2 = path.join(ROOT, "vendor", "kanjivg", "kanji");

// Helpers
const ensureDir = p => fs.mkdirSync(p, { recursive: true });
const pad = hex => hex.toLowerCase().padStart(5, "0");
const read = p => fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";

function extractHexesFromMeta(tsText) {
  const re = /hex:\s*["'`](?<h>[0-9a-fA-F]{4,5})["'`]/g;
  const set = new Set();
  let m;
  while ((m = re.exec(tsText))) set.add(m.groups.h.toLowerCase());
  return [...set];
}

function findSvg(hex) {
  const p1 = path.join(RAW1, `${pad(hex)}.svg`);
  const p2 = path.join(RAW2, `${pad(hex)}.svg`);
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return null;
}

async function svgToWebp(svgPath, outPath) {
  const svg = fs.readFileSync(svgPath);
  // ⬇️ Forzamos relleno/contorno blanco para que tinte bien en dark
  // (KanjiVG viene negro; lo dejamos negro y “tintColor” lo pone blanco.
  // Si prefieres fijo blanco, descomenta la línea .tint({ r:255,g:255,b:255 }))
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 1024 } });
  const png = r.render().asPng();
  const out = await sharp(png)
    .webp({ quality: 100, lossless: true })
    //.tint({ r: 255, g: 255, b: 255 })
    .toBuffer();
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, out);
}

async function main() {
  const metaText = read(META_TS);
  if (!metaText) {
    console.error(`❌ No encontré ${META_TS}`);
    process.exit(1);
  }
  const hexes = extractHexesFromMeta(metaText);
  console.log(`▶ HEX en META: ${hexes.length}`);

  ensureDir(OUT_DIR);

  let ok = 0, miss = 0;
  for (const h of hexes) {
    const svg = findSvg(h);
    const out = path.join(OUT_DIR, `${h.toLowerCase()}_nums.webp`);
    if (!svg) {
      console.log(`  ⚠️  Sin SVG para ${h}`);
      miss++;
      continue;
    }
    if (!fs.existsSync(out)) {
      await svgToWebp(svg, out);
      console.log(`  ✅ ${path.relative(ROOT, out)}`);
      ok++;
    } else {
      // ya existe
    }
  }
  console.log(`✔ Generación terminada. Nuevos: ${ok}  | Sin SVG: ${miss}`);

  // Regenera el índice require() estático para Metro
  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith("_nums.webp"))
    .sort();
  const lines = files.map(f => {
    const hex = f.split("_")[0].toLowerCase();
    const rel = `../../assets/kanjivg/n1/${f}`;
    return `  "${hex}": require("${rel}"),`;
  });

  const outIndex = `// AUTO-GENERADO por build_all_n1.mjs
// Mapa: hex -> require(WebP) (solo N1)
// ¡No edites a mano!

export const N1_KANJIVG: Record<string, any> = {
${lines.join("\n")}
};
`;
  const indexPath = path.join(ROOT, "src", "data", "n1_kanjivg.ts");
  fs.writeFileSync(indexPath, outIndex);
  console.log(`✔ Escrito ${indexPath} con ${files.length} entradas.`);
  console.log("\nSiguiente paso:");
  console.log("  - Reinicia bundler: npx expo start -c");
}

main().catch(e => { console.error(e); process.exit(1); });
