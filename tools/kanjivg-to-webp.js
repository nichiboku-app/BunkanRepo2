// scripts/make_kanji_webp.js
// Uso:
//   node scripts/make_kanji_webp.js --level n1 --suffix nums 4f8b 5ddd 6f22 ...
//   node scripts/make_kanji_webp.js --level n3 --suffix nums --stroke white 5408
//
// Crea imágenes WebP desde SVGs de KanjiVG.
// Si se usa --stroke white, todos los trazos se colorean de blanco.
//
// Salida: assets/kanjivg/<level>/<hex>_<suffix>.webp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { Resvg } = require("@resvg/resvg-js");

/* ---------- CLI ARGUMENTOS ---------- */
const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");

// sufijo (por defecto: nums)
const suffixFlagIndex = args.indexOf("--suffix");
const OUT_SUFFIX =
  suffixFlagIndex !== -1 && args[suffixFlagIndex + 1]
    ? String(args[suffixFlagIndex + 1]).trim()
    : "nums";

// nivel (por defecto: n1)
const levelFlagIndex = args.indexOf("--level");
const OUT_LEVEL =
  levelFlagIndex !== -1 && args[levelFlagIndex + 1]
    ? String(args[levelFlagIndex + 1]).trim()
    : "n1";

// color de trazo forzado (por defecto: ninguno)
const strokeFlagIndex = args.indexOf("--stroke");
const STROKE_COLOR =
  strokeFlagIndex !== -1 && args[strokeFlagIndex + 1]
    ? String(args[strokeFlagIndex + 1]).trim()
    : null;

// lista de kanji hex
const HEXES = args.filter(
  (a) =>
    !a.startsWith("--") &&
    ![args[suffixFlagIndex + 1], args[levelFlagIndex + 1], args[strokeFlagIndex + 1]].includes(a)
);

if (HEXES.length === 0) {
  console.error("⚠️  Usa: node scripts/make_kanji_webp.js --level n1 --suffix nums 4f8b 8a55 ...");
  process.exit(1);
}

console.log(`▶ Nivel de salida: ${OUT_LEVEL}  ·  Sufijo: ${OUT_SUFFIX}`);
if (STROKE_COLOR) console.log(`▶ Forzando color de trazo: ${STROKE_COLOR}`);
console.log("▶ Kanji a procesar:", HEXES.join(", "));

/* ---------- RUTAS BASE ---------- */
const RAW_DIRS = [
  path.join(__dirname, "..", "assets", "kanjivg", "raw"),
  path.join(__dirname, "..", "vendor", "kanjivg", "kanji"),
];
const OUT_DIR = path.join(__dirname, "..", "assets", "kanjivg", OUT_LEVEL);
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- FUNCIONES ---------- */
function findSvg(hex) {
  const fname = `${hex.length === 4 ? "0" + hex : hex}.svg`.replace(/^00/, "0");
  for (const dir of RAW_DIRS) {
    const p = path.join(dir, fname);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function convertSvgToWebp(svgPath, outPath) {
  let svg = fs.readFileSync(svgPath, "utf8");

  // Forzar color de trazo (blanco, etc.)
  if (STROKE_COLOR) {
    const forcedCSS = `
      <style>
        path[stroke], .stroke { stroke: ${STROKE_COLOR} !important; }
        path[fill="none"] { stroke: ${STROKE_COLOR} !important; }
      </style>
    `;
    svg = svg.replace(/<svg[^>]*>/, (m) => m + forcedCSS);
  }

  // Renderizar con resvg
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1024 } });
  const pngBuffer = resvg.render().asPng();

  // Convertir a WebP
  await sharp(pngBuffer).webp({ quality: 95 }).toFile(outPath);
}

/* ---------- PROCESAMIENTO ---------- */
(async () => {
  for (const hex of HEXES) {
    const svgPath = findSvg(hex);
    if (!svgPath) {
      console.warn(`❌ No se encontró SVG para ${hex}`);
      continue;
    }

    const outPath = path.join(OUT_DIR, `${hex}_${OUT_SUFFIX}.webp`);
    try {
      await convertSvgToWebp(svgPath, outPath);
      console.log(`✅ ${path.relative(process.cwd(), outPath)} creado`);
    } catch (err) {
      console.error(`❌ Error al convertir ${hex}:`, err.message);
    }
  }
})();
