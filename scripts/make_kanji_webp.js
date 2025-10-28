// scripts/make_kanji_webp.js
// Uso:
//   node scripts/make_kanji_webp.js 5b88 898f ...
//   node scripts/make_kanji_webp.js --suffix nums 5b88 898f
//   node scripts/make_kanji_webp.js --level n2 --suffix nums 8a33 9650 ...
//   node scripts/make_kanji_webp.js --debug --suffix=nums 6613
//
// Salida: assets/kanjivg/<level>/<hex>_<suffix>.webp
//  - <level>: n2 (si pasas --level n2), por defecto n3
//  - <suffix>: "nums" por defecto (puedes poner "web", etc.)

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { Resvg } = require("@resvg/resvg-js");

const args = process.argv.slice(2).map(String);

// ---------------------------
// Flags y parsing robusto
// ---------------------------
const DEBUG = args.includes("--debug");

function readFlagWithValue(flag, fallback) {
  // Soporta "--flag valor" y "--flag=valor"
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("--")) return String(args[i + 1]).trim();
  const eq = args.find(a => a.startsWith(flag + "="));
  if (eq) {
    const v = eq.split("=")[1];
    return (v ? String(v).trim() : "") || fallback;
  }
  return fallback;
}

const OUT_SUFFIX = readFlagWithValue("--suffix", "nums"); // por ej. "nums"
const LEVEL = readFlagWithValue("--level", "n3").toLowerCase(); // "n2" o "n3" (default n3)

// Marcar índices a omitir (valores de flags) al construir HEXES:
const skip = new Set();
["--suffix", "--level"].forEach((flag) => {
  const i = args.indexOf(flag);
  if (i !== -1) {
    skip.add(i);
    if (args[i + 1] && !args[i + 1].startsWith("--")) skip.add(i + 1);
  }
  // formato con "=" (omitimos toda la entrada)
  args.forEach((a, idx) => { if (a.startsWith(flag + "=")) skip.add(idx); });
});

// HEX de entrada: solo posicionales reales
const HEXES = args
  .filter((a, i) => !a.startsWith("--") && !skip.has(i))
  .map(h => h.toLowerCase().trim().replace(/^u/, ""));

if (!HEXES.length) {
  console.log("Uso: node scripts/make_kanji_webp.js <hex1> <hex2> ... [--level n2|n3] [--suffix nums|web] [--debug]");
  process.exit(1);
}

// ---------------------------
// Paths base
// ---------------------------
const ROOT = path.join(__dirname, "..");
const SEARCH_DIRS = [
  path.join(ROOT, "assets", "kanjivg", "raw"),
  path.join(ROOT, "vendor", "kanjivg", "kanji"),
];
const OUT_DIR = path.join(ROOT, "assets", "kanjivg", LEVEL);
const TMP_DIR = path.join(ROOT, "assets", "kanjivg", "tmp");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ---------------------------
// Helpers de búsqueda
// ---------------------------
function pad5(hex) { return hex.length === 4 ? "0" + hex : hex; }

function listFilesRecursively(dir) {
  const out = [];
  try {
    const stack = [dir];
    while (stack.length) {
      const d = stack.pop();
      if (!fs.existsSync(d)) continue;
      const items = fs.readdirSync(d, { withFileTypes: true });
      for (const it of items) {
        const full = path.join(d, it.name);
        if (it.isDirectory()) {
          stack.push(full);
        } else {
          out.push(full);
        }
      }
    }
  } catch {}
  return out;
}

function findSvg(hex) {
  const hex5 = pad5(hex);
  const candidatesExact = new Set([
    `u${hex}.svg`, `u${hex5}.svg`,
    `${hex}.svg`, `${hex5}.svg`,
  ]);
  const lowerEq = (a, b) => a.toLowerCase() === b.toLowerCase();

  for (const dir of SEARCH_DIRS) {
    const files = listFilesRecursively(dir);
    if (!files.length) continue;

    // 1) intentos exactos
    for (const f of files) {
      const base = path.basename(f);
      for (const want of candidatesExact) {
        if (lowerEq(base, want)) return f;
      }
    }

    // 2) variantes tipo "u8a33-01.svg", "65e5-var.svg", etc.
    for (const f of files) {
      const base = path.basename(f).toLowerCase();
      if (!base.endsWith(".svg")) continue;
      if (
        base.startsWith(`u${hex}-`) || base.startsWith(`u${hex5}-`) ||
        base.startsWith(`${hex}-`) || base.startsWith(`${hex5}-`) ||
        base.includes(`-${hex}.svg`) || base.includes(`-${hex5}.svg`) ||
        base.includes(`${hex}-`) || base.includes(`${hex5}-`)
      ) {
        return f;
      }
    }
  }
  return null;
}

// ---------------------------
// Sanitización de SVG
// ---------------------------
function removeBom(str) { return str.replace(/^\uFEFF/, ""); }
function removeDeclarations(str) { return str.replace(/<![\s\S]*?>/g, ""); }
function keepOnlySvgElement(str) {
  const start = str.search(/<svg\b/i);
  const end = str.toLowerCase().lastIndexOf("</svg>");
  if (start === -1 || end === -1) return str;
  return str.slice(start, end + "</svg>".length);
}
function stripControlChars(str) { return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""); }
function addMissingNamespaces(svgStr) {
  const ns = {
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    kvg: 'http://kanjivg.tagaini.net',
    inkscape: 'http://www.inkscape.org/namespaces/inkscape',
    sodipodi: 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
    dc: 'http://purl.org/dc/elements/1.1/',
    cc: 'http://creativecommons.org/ns#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  };
  return svgStr.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
    const has = (k) => new RegExp(`\\sxmlns:${k}=`, "i").test(attrs);
    const hasSvgDefault = /\sxmlns=/.test(attrs) || /\sxmlns:svg=/.test(attrs);
    let fixed = attrs.trim();
    if (!hasSvgDefault) fixed += ` xmlns="${ns.svg}"`;
    if (!has("svg") && /svg:/.test(svgStr)) fixed += ` xmlns:svg="${ns.svg}"`;
    if (!has("xlink") && /xlink:/.test(svgStr)) fixed += ` xmlns:xlink="${ns.xlink}"`;
    if (!has("kvg") && /kvg:/.test(svgStr)) fixed += ` xmlns:kvg="${ns.kvg}"`;
    if (!has("inkscape") && /inkscape:/.test(svgStr)) fixed += ` xmlns:inkscape="${ns.inkscape}"`;
    if (!has("sodipodi") && /sodipodi:/.test(svgStr)) fixed += ` xmlns:sodipodi="${ns.sodipodi}"`;
    if (!has("dc") && /dc:/.test(svgStr)) fixed += ` xmlns:dc="${ns.dc}"`;
    if (!has("cc") && /cc:/.test(svgStr)) fixed += ` xmlns:cc="${ns.cc}"`;
    if (!has("rdf") && /rdf:/.test(svgStr)) fixed += ` xmlns:rdf="${ns.rdf}"`;
    return `<svg ${fixed}>`;
  });
}
function sanitizeSvg(raw) {
  let s = String(raw);
  s = removeBom(s);
  s = removeDeclarations(s);
  s = keepOnlySvgElement(s);
  s = stripControlChars(s);
  s = addMissingNamespaces(s);
  return s;
}

// ---------------------------
// Render: Resvg -> webp (fallback sharp)
// ---------------------------
async function renderWithResvgToWebp(svgString, outPath, width = 900) {
  const resvg = new Resvg(svgString, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  await sharp(pngBuffer).webp({ quality: 88 }).toFile(outPath);
}
async function renderWithSharpDirect(svgString, outPath, width = 900) {
  await sharp(Buffer.from(svgString)).resize({ width }).webp({ quality: 88 }).toFile(outPath);
}

// ---------------------------
// Main
// ---------------------------
(async () => {
  console.log(`▶ Nivel de salida: ${LEVEL}  ·  Sufijo: ${OUT_SUFFIX}`);
  console.log(`▶ Buscando SVG en:\n  - ${SEARCH_DIRS.join("\n  - ")}`);
  console.log(`▶ Kanji a procesar: ${HEXES.join(", ")}`);

  for (const hex of HEXES) {
    const src = findSvg(hex);
    if (!src) {
      console.error(`❌ No se encontró SVG para ${hex} en: ${SEARCH_DIRS.join(" ; ")}`);
      continue;
    }
    const out = path.join(OUT_DIR, `${hex}_${OUT_SUFFIX}.webp`);

    try {
      const raw = fs.readFileSync(src, "utf8");
      const fixed = sanitizeSvg(raw);

      if (DEBUG) {
        const debugPath = path.join(TMP_DIR, `${hex}_sanitized.svg`);
        fs.writeFileSync(debugPath, fixed, "utf8");
        console.log(`🔎 DEBUG guardado: ${path.relative(ROOT, debugPath)}`);
      }

      try {
        await renderWithResvgToWebp(fixed, out, 900);
      } catch (e1) {
        console.warn(`⚠️  Resvg falló para ${hex}: ${e1.message} — intento fallback con sharp...`);
        await renderWithSharpDirect(fixed, out, 900);
      }

      console.log(`✅ ${path.basename(out)} creado desde ${path.relative(ROOT, src)}`);
    } catch (e) {
      console.error(`⚠️  Falló ${hex}: ${e.message}`);
    }
  }
})();
