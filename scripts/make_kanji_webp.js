// scripts/make_kanji_webp.js
// Uso:
//   node scripts/make_kanji_webp.js 5b88 898f ...
//   node scripts/make_kanji_webp.js --suffix nums 5b88 898f
//   node scripts/make_kanji_webp.js --debug --suffix nums 6613
//
// Salida (por defecto): assets/kanjivg/n3/<hex>_nums.webp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { Resvg } = require("@resvg/resvg-js");

const args = process.argv.slice(2).map(String);

// flags
const DEBUG = args.includes("--debug");
const suffixFlagIndex = args.indexOf("--suffix");
const OUT_SUFFIX = (suffixFlagIndex !== -1 && args[suffixFlagIndex + 1])
  ? String(args[suffixFlagIndex + 1]).trim()
  : "nums";

// hexes
const HEXES = args
  .filter(a => !a.startsWith("--"))
  .map(h => h.toLowerCase().trim().replace(/^u/, ""));

if (!HEXES.length) {
  console.log("Uso: node scripts/make_kanji_webp.js <hex1> <hex2> ... [--debug] [--suffix nums|web|loquequieras]");
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const SEARCH_DIRS = [
  path.join(ROOT, "assets", "kanjivg", "raw"),
  path.join(ROOT, "vendor", "kanjivg", "kanji"),
];
const OUT_DIR = path.join(ROOT, "assets", "kanjivg", "n3");
const TMP_DIR = path.join(ROOT, "assets", "kanjivg", "tmp");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

function pad5(hex) { return hex.length === 4 ? "0" + hex : hex; }

function findSvg(hex) {
  const hex5 = pad5(hex);
  for (const dir of SEARCH_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    const exacts = [`u${hex}.svg`, `u${hex5}.svg`, `${hex}.svg`, `${hex5}.svg`];
    for (const name of exacts) {
      const found = files.find(f => f.toLowerCase() === name.toLowerCase());
      if (found) return path.join(dir, found);
    }

    const variant = files.find(f => {
      const fl = f.toLowerCase();
      return (
        (fl.startsWith(`u${hex}-`) || fl.startsWith(`u${hex5}-`) ||
         fl.startsWith(`${hex}-`) || fl.startsWith(`${hex5}-`)) && fl.endsWith(".svg")
      );
    });
    if (variant) return path.join(dir, variant);
  }
  return null;
}

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

async function renderWithResvgToWebp(svgString, outPath, width = 900) {
  const resvg = new Resvg(svgString, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  await sharp(pngBuffer).webp({ quality: 88 }).toFile(outPath);
}
async function renderWithSharpDirect(svgString, outPath, width = 900) {
  await sharp(Buffer.from(svgString)).resize({ width }).webp({ quality: 88 }).toFile(outPath);
}

(async () => {
  for (const hex of HEXES) {
    const src = findSvg(hex);
    if (!src) {
      console.error(`❌ No se encontró SVG para ${hex} en: ${SEARCH_DIRS.join(" ; ")}`);
      continue;
    }
    const out = path.join(OUT_DIR, `${hex}_${OUT_SUFFIX}.webp`); // ⟵ ⟵ ⟵ NOMBRE CLAVE

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

      console.log(`✅ ${path.basename(out)} creado desde ${path.basename(src)}`);
    } catch (e) {
      console.error(`⚠️  Falló ${hex}: ${e.message}`);
    }
  }
})();
