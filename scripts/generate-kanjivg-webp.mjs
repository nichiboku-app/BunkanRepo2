// scripts/generate-kanjivg-webp.cjs
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");

// ====== AJUSTA ESTOS DATOS ======
const OUTPUT_DIR = path.resolve(__dirname, "../assets/kanjivg/n2"); // destino
const SIZE = 1024;                 // tamaño final (cuadrado)
const STROKE_WIDTH = 6;            // grosor de línea
const NUMBER_FONT_SIZE = 42;       // tamaño de los números
const GRID = true;                 // muestra cuadrícula estilo genkō

// Lista por defecto (ejemplo: Keigo B2_U1). Puedes pasar por CLI también.
const DEFAULT_KANJIS = "尊敬謙譲伺申致存参拝御様";

function parseCliKanjis() {
  // Admite: "原因結..." o "原,因,結,..." (argumento 2)
  const raw = process.argv[2];
  if (!raw || !raw.trim()) return DEFAULT_KANJIS.split("");
  // Si trae comas, separa por comas; si no, separa cada caracter
  const list = raw.includes(",")
    ? raw.split(",").map(s => s.trim()).filter(Boolean)
    : raw.split("");
  return list;
}

function toUHex(ch) {
  const code = ch.codePointAt(0);
  return code.toString(16).padStart(5, "0").toLowerCase();
}

function svgURL(hex) {
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

const HTML_TEMPLATE = (svgUrl, size, strokeWidth, numberFontSize, grid) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin:0; padding:0; background:#ffffff; }
    #stage {
      width:${size}px; height:${size}px;
      position:relative; overflow:hidden;
      background:#ffffff;
      display:flex; align-items:center; justify-content:center;
    }
    .grid line { stroke:#E5E7EB; stroke-width:2; }
    .grid .diag { stroke:#F0F2F5; stroke-width:1.5; }
    .frame { stroke:#D0D4DA; stroke-width:3; fill:none; }
    text.order {
      fill:#d00; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
      font-weight:700; font-size:${numberFontSize}px; user-select:none;
      paint-order: stroke; stroke: #fff; stroke-width: 5px;
    }
    svg { width:${size-32}px; height:${size-32}px; }
  </style>
</head>
<body>
  <div id="stage">
    <svg id="overlay" width="${size}" height="${size}">
      <rect x="1.5" y="1.5" width="${size-3}" height="${size-3}" class="frame"/>
      ${grid ? `
      <g class="grid">
        <line x1="${size/2}" y1="0" x2="${size/2}" y2="${size}"/>
        <line x1="0" y1="${size/2}" x2="${size}" y2="${size/2}"/>
        <line class="diag" x1="0" y1="0" x2="${size}" y2="${size}"/>
        <line class="diag" x1="${size}" y1="0" x2="0" y2="${size}"/>
      </g>` : ""}
    </svg>
  </div>
  <script>
    (async function(){
      const res = await fetch(${JSON.stringify(svgUrl)});
      if(!res.ok){ throw new Error("No se pudo cargar SVG: " + res.status); }
      const text = await res.text();

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, "image/svg+xml");
      const srcSvg = svgDoc.documentElement;

      srcSvg.removeAttribute("width");
      srcSvg.removeAttribute("height");
      srcSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      const paths = srcSvg.querySelectorAll("path");
      paths.forEach(p => {
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", "#111111");
        p.setAttribute("stroke-width", "${strokeWidth}");
        p.setAttribute("stroke-linecap", "round");
        p.setAttribute("stroke-linejoin", "round");
      });

      const stage = document.getElementById("stage");
      stage.appendChild(srcSvg);

      await new Promise(r => requestAnimationFrame(r));

      const overlay = document.getElementById("overlay");
      let idx = 1;
      paths.forEach(p => {
        const b = p.getBBox();

        const vb = srcSvg.viewBox && srcSvg.viewBox.baseVal
          ? srcSvg.viewBox.baseVal
          : { x: 0, y: 0, width: ${SIZE-32}, height: ${SIZE-32} };

        const cx = b.x + b.width/2;
        const cy = b.y + b.height/2;

        const ox = 16 + (cx - (vb.x || 0)) * ((${size-32}) / (vb.width || ${size-32}));
        const oy = 16 + (cy - (vb.y || 0)) * ((${size-32}) / (vb.height || ${size-32}));

        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("class", "order");
        t.setAttribute("x", String(ox));
        t.setAttribute("y", String(oy));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dominant-baseline", "central");
        t.textContent = String(idx++);
        overlay.appendChild(t);
      });
    })().catch(e => {
      document.body.innerHTML = "<pre style='padding:16px;color:#111'>"+e.stack+"</pre>";
    });
  </script>
</body>
</html>
`;

async function renderKanji(browser, ch) {
  const hex = toUHex(ch);
  const outFile = path.join(OUTPUT_DIR, `${hex}_nums.webp`);
  const url = svgURL(hex);

  const page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 2 });

  const html = HTML_TEMPLATE(url, SIZE, STROKE_WIDTH, NUMBER_FONT_SIZE, GRID);
  await page.setContent(html, { waitUntil: "networkidle0" });

  const stage = await page.$("#stage");
  if (!stage) throw new Error("No #stage");

  await stage.screenshot({ path: outFile, type: "webp", quality: 90 });
  await page.close();
  return outFile;
}

(async () => {
  await ensureDir(OUTPUT_DIR);
  const kanjis = parseCliKanjis();
  const browser = await puppeteer.launch({ headless: "new" });

  for (const k of kanjis) {
    try {
      const f = await renderKanji(browser, k);
      console.log("✔ Generado:", path.basename(f));
    } catch (e) {
      console.error("✖ Error con", k, e.message);
    }
  }

  await browser.close();
  console.log("Listo.");
})().catch(e => {
  console.error(e);
  process.exit(1);
});
