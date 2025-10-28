// tools/kanjivg-to-nums.js
// Genera *_nums.webp con números de orden de trazo sobre los paths del KanjiVG.
// Uso:
//   node tools/kanjivg-to-nums.js 従 連 伴
//   node tools/kanjivg-to-nums.js 5f93 9023 4f34
//   node tools/kanjivg-to-nums.js --in assets/kanjivg/n2 --out assets/kanjivg/n2 従 5f93 連
//
// Requisitos:
//   - Tener los SVG KanjiVG en <INPUT_DIR>/<hex>.svg  (hex = codepoint minúsculas; p.ej. 従 => 5f93.svg)
// Salida:
//   - <OUTPUT_DIR>/<hex>_nums.webp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { parse } = require("svgson");
const pathBounds = require("svg-path-bounds");

// ===== CLI =====
const args = process.argv.slice(2);
const flags = {};
const terms = [];
for (const a of args) {
  if (a.startsWith("--")) {
    const [k, v] = a.replace(/^--/, "").split("=");
    flags[k] = v ?? true;
  } else {
    terms.push(a);
  }
}

const INPUT_DIR = path.resolve(flags.in || "assets/kanjivg/n2");
const OUTPUT_DIR = path.resolve(flags.out || INPUT_DIR);
const WIDTH = Number(flags.w || 768);
const HEIGHT = Number(flags.h || 768);
const FONT_SIZE = Number(flags.font || 28);
const CIRCLE_R = Number(flags.r || 18);

if (!terms.length) {
  console.error(
    "Uso: node tools/kanjivg-to-nums.js [--in=assets/kanjivg/n2] [--out=assets/kanjivg/n2] 従 5f93 連 ..."
  );
  process.exit(1);
}

function toHexCode(term) {
  // si ya viene en hex (ej. 5f93)
  if (/^[0-9a-f]{4,6}$/i.test(term)) return term.toLowerCase();
  // si viene como kanji (1 char)
  const cp = term.codePointAt(0);
  return cp.toString(16).toLowerCase();
}

async function svgToNumberedWebp(hex) {
  const svgPath = path.join(INPUT_DIR, `${hex}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`NO SVG: ${svgPath}`);
    return false;
  }

  const raw = fs.readFileSync(svgPath, "utf8");
  const ast = await parse(raw);

  // Extraer paths y número de trazo
  const strokes = [];
  (function walk(node) {
    if (!node) return;
    if (node.name === "path") {
      const d = node.attributes?.d;
      if (d) {
        let n = null;
        const id = node.attributes?.id || "";
        const m = id.match(/-s(\d+)/); // ...-s1, ...-s2
        if (m) n = parseInt(m[1], 10);
        strokes.push({ d, n });
      }
    }
    if (node.children) node.children.forEach(walk);
  })(ast);

  if (strokes.length === 0) {
    console.error(`ERROR: ${hex} no tiene <path d="...">`);
    return false;
  }

  const withOrder = strokes.every((s) => typeof s.n === "number");
  if (withOrder) strokes.sort((a, b) => a.n - b.n);

  // BBoxes por path para situar números
  const labels = [];
  let idx = 1;
  for (const s of strokes) {
    try {
      const [minX, minY, maxX, maxY] = pathBounds(s.d);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      labels.push({ n: withOrder ? s.n : idx, x: cx, y: cy });
      idx++;
    } catch {
      // si un path raro falla, lo saltamos
    }
  }

  // viewBox para escalar coords
  const vbAttr = ast.attributes?.viewBox || ast.attributes?.viewbox || "";
  let [vbX, vbY, vbW, vbH] = vbAttr.split(/\s+/).map(Number);
  if (!Number.isFinite(vbX) || !Number.isFinite(vbY) || !Number.isFinite(vbW) || !Number.isFinite(vbH)) {
    vbX = 0; vbY = 0; vbW = 109; vbH = 109;
  }

  const basePng = await sharp(Buffer.from(raw))
    .resize(WIDTH, HEIGHT, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const scaleX = (x) => ((x - vbX) / vbW) * WIDTH;
  const scaleY = (y) => ((y - vbY) / vbH) * HEIGHT;

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .knum { font-family: Arial, Helvetica, sans-serif; font-size: ${FONT_SIZE}px; font-weight: 700; fill: #ffffff; dominant-baseline: middle; text-anchor: middle; }
      </style>
      ${labels.map(l => `
        <g>
          <circle cx="${scaleX(l.x)}" cy="${scaleY(l.y)}" r="${CIRCLE_R}" fill="#0E1015" opacity="0.95"/>
          <text class="knum" x="${scaleX(l.x)}" y="${scaleY(l.y)}">${l.n}</text>
        </g>
      `).join("\n")}
    </svg>`;

  const out = await sharp(basePng)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, `${hex}_nums.webp`);
  fs.writeFileSync(outPath, out);
  console.log(`OK: ${path.relative(process.cwd(), outPath)} (trazos numerados)`);
  return true;
}

(async () => {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error("No existe INPUT_DIR:", INPUT_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let ok = 0, fail = 0;
  for (const term of terms) {
    const hex = toHexCode(term);
    try {
      const res = await svgToNumberedWebp(hex);
      res ? ok++ : fail++;
    } catch (e) {
      console.error(`ERR ${term} (${hex}):`, e.message);
      fail++;
    }
  }
  console.log(`Listo. OK=${ok}  Faltaron=${fail}`);
})();
