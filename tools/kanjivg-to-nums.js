// tools/kanjivg-to-nums.js
// Genera *_nums.webp con números de orden de trazo sobre los paths del KanjiVG.
// Uso:
//   node tools/kanjivg-to-nums.js 96ea 5bfa ...
//
// Requisitos:
//   - Tener el SVG base en assets/kanjivg/n3/<hex>.svg
//   - Tener el contorno ya renderizado (opcional) en <hex>_web.webp (no obligatorio)
// Salida:
//   - assets/kanjivg/n3/<hex>_nums.webp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { parse } = require("svgson");
const pathBounds = require("svg-path-bounds");

const INPUT_DIR = path.resolve("assets/kanjivg/n3");
const WIDTH = 768;    // resolución de salida
const HEIGHT = 768;
const FONT_SIZE = 28; // tamaño del número
const CIRCLE_R = 18;  // radio del circulito detrás del número

async function svgToNumberedPng(hex) {
  const svgPath = path.join(INPUT_DIR, `${hex}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`NO SVG: ${svgPath}`);
    return false;
  }

  const raw = fs.readFileSync(svgPath, "utf8");

  // 1) Parsear SVG
  const ast = await parse(raw);

  // 2) Extraer todos los <path ... d="..."> y su número de trazo (por id ...-sN)
  //    KanjiVG tiene ids como "...-s1", "...-s2" para cada trazo en orden.
  //    Si no hay -sN, igual numeramos según el orden de aparición.
  const strokes = [];
  function walk(node) {
    if (!node) return;
    if (node.name === "path") {
      const d = node.attributes?.d;
      if (d) {
        let n = null;
        const id = node.attributes?.id || "";
        // buscar sufijo -sN
        const m = id.match(/-s(\d+)/);
        if (m) n = parseInt(m[1], 10);
        strokes.push({ d, n });
      }
    }
    if (node.children) node.children.forEach(walk);
  }
  walk(ast);

  if (strokes.length === 0) {
    console.error(`ERROR: ${hex} no tiene <path d="...">`);
    return false;
  }

  // Ordenar por n (si lo hay); si algún path no tiene n, cae al final por orden
  const withOrder = strokes.every(s => typeof s.n === "number");
  if (withOrder) {
    strokes.sort((a, b) => a.n - b.n);
  }

  // 3) Calcular posiciones para los números (centro del bbox de cada path)
  const labels = [];
  let index = 1;
  for (const s of strokes) {
    let minX, minY, maxX, maxY;
    try {
      [minX, minY, maxX, maxY] = pathBounds(s.d);
    } catch (e) {
      // Si el parser falla en un path raro, lo saltamos sin romper todo
      continue;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Guardamos en coords originales del viewBox; luego escalamos al WIDTH/HEIGHT.
    labels.push({
      n: withOrder ? s.n : index,
      x: cx,
      y: cy,
    });
    index++;
  }

  // 4) Tomar viewBox del SVG para escalar coordenadas correctamente.
  // Intentaremos leerlo del nodo raíz.
  const vbAttr = ast.attributes?.viewBox || ast.attributes?.viewbox || "";
  let vb = vbAttr.split(/\s+/).map(Number);
  if (vb.length !== 4 || vb.some(isNaN)) {
    // fallback a 0 0 109 109 (tamaño común en KanjiVG)
    vb = [0, 0, 109, 109];
  }
  const [vbX, vbY, vbW, vbH] = vb;

  // 5) Render base: usamos el SVG original como fondo rasterizado
  const basePng = await sharp(Buffer.from(raw))
    .resize(WIDTH, HEIGHT, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  // 6) Construir una capa SVG con círculos + números posicionados (escalados a salida)
  function scaleX(x) { return ((x - vbX) / vbW) * WIDTH; }
  function scaleY(y) { return ((y - vbY) / vbH) * HEIGHT; }

  const overlaySvg =
    `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
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

  const outPath = path.join(INPUT_DIR, `${hex}_nums.webp`);
  fs.writeFileSync(outPath, out);
  console.log(`OK: ${hex}_nums.webp (trazos numerados)`);
  return true;
}

(async () => {
  const hexes = process.argv.slice(2);
  if (hexes.length === 0) {
    console.error("Uso: node tools/kanjivg-to-nums.js <hex> [<hex> ...]");
    process.exit(1);
  }

  let ok = 0, fail = 0;
  for (const h of hexes) {
    try {
      const res = await svgToNumberedPng(h);
      res ? ok++ : fail++;
    } catch (e) {
      console.error(`ERR ${h}:`, e.message);
      fail++;
    }
  }
  console.log(`Listo. OK=${ok}  Faltaron=${fail}`);
})();
