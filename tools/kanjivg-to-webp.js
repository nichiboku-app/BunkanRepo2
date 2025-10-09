// tools/kanjivg-to-webp.js
// Extrae sólo los <path d="..."> de KanjiVG y genera <hex>_web.webp
// Uso: node tools/kanjivg-to-webp.js 670d 5225 610f ...

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.join("assets", "kanjivg", "n3");
const OUT_W = 1000;  // ancho destino para móvil

const hexes = process.argv.slice(2);
if (!hexes.length) {
  console.log("Usage: node tools/kanjivg-to-webp.js 670d 5225 ...");
  process.exit(1);
}

function buildCleanSvg(paths) {
  // SVG mínimo y válido con los trazos
  // (viewBox fijo de KanjiVG: 0 0 109 109)
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109" width="109" height="109">
  <g fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    ${paths.map(d => `<path d="${d}"/>`).join("\n    ")}
  </g>
</svg>`.trim();
}

for (const h of hexes) {
  const svgPath = path.join(SRC_DIR, `${h}.svg`);
  const outPath = path.join(SRC_DIR, `${h}_web.webp`);

  if (!fs.existsSync(svgPath)) {
    console.log("NO SVG:", svgPath);
    continue;
  }
  if (fs.existsSync(outPath)) {
    console.log("SKIP (exists):", path.basename(outPath));
    continue;
  }

  try {
    // lee como binario y conviértelo a UTF-8 lo mejor posible
    // (algunos SVG en Windows quedan en ANSI; esto evita mojibake fatal)
    let raw = fs.readFileSync(svgPath);
    let text;
    try {
      text = raw.toString("utf8");
    } catch {
      // fallback Latin-1 -> UTF-8
      text = Buffer.from(raw, "binary").toString("utf8");
    }

    // extraer TODAS las rutas d="..."; robusto, no dependemos de XML válido
    const ds = [];
    const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/gi;
    let m;
    while ((m = re.exec(text))) ds.push(m[1]);

    if (ds.length === 0) {
      console.log(`ERROR: ${h} no tiene <path d="...">`);
      continue;
    }

    const cleanSvg = buildCleanSvg(ds);

    // opcional: guarda el SVG limpio para inspección
    const tmpDir = path.join(SRC_DIR, ".tmp_clean");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, `${h}.clean.svg`), cleanSvg, "utf8");

    // render a WEBP
    sharp(Buffer.from(cleanSvg))
      .resize({ width: OUT_W })
      .webp({ quality: 88 })
      .toFile(outPath)
      .then(() => console.log("OK:", path.basename(outPath)))
      .catch(err => console.error("ERROR:", h, err.message));
  } catch (e) {
    console.error("ERROR:", h, e.message);
  }
}
