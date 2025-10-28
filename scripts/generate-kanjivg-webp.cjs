// scripts/generate-kanjivg-webp.cjs
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");

// ===== CONFIG =====
const OUTPUT_DIR = path.resolve(__dirname, "../assets/kanjivg/n2"); // destino
const SIZE = 1024;                 // tamaño (px)
const STROKE_WIDTH = 6;            // grosor de línea
const NUMBER_FONT_SIZE = 42;       // (sin uso ahora; se mantiene por compatibilidad)
const GRID = true;                 // cuadrícula estilo genkō

// Lista por defecto: keigo (B2_U1). Puedes pasar otra por CLI.
const DEFAULT_KANJIS = "尊敬謙譲伺申致存参拝御様";

function parseCliKanjis() {
  const raw = process.argv[2];
  if (!raw || !raw.trim()) return DEFAULT_KANJIS.split("");
  return raw.includes(",")
    ? raw.split(",").map(s => s.trim()).filter(Boolean)
    : raw.split("");
}
function toUHex(ch) {
  const code = ch.codePointAt(0);
  return code.toString(16).padStart(5, "0").toLowerCase();
}
function svgURL(hex) {
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
}
async function ensureDir(dir) { await fsp.mkdir(dir, { recursive: true }); }

const HTML_TEMPLATE = (svgUrl, size, strokeWidth, numberFontSize, grid) => `
<!doctype html><html><head><meta charset="utf-8"/>
<style>
html,body{margin:0;padding:0;background:#fff}
#stage{width:${size}px;height:${size}px;position:relative;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center}
.grid line{stroke:#E5E7EB;stroke-width:2}.grid .diag{stroke:#F0F2F5;stroke-width:1.5}
.frame{stroke:#D0D4DA;stroke-width:3;fill:none}
svg{width:${size-32}px;height:${size-32}px}
</style></head><body>
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
  if(!res.ok) throw new Error("No se pudo cargar SVG: "+res.status);
  const text = await res.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(text, "image/svg+xml");
  const srcSvg = svgDoc.documentElement;
  srcSvg.removeAttribute("width"); srcSvg.removeAttribute("height");
  srcSvg.setAttribute("preserveAspectRatio","xMidYMid meet");

  const paths = srcSvg.querySelectorAll("path");
  paths.forEach(p => {
    p.setAttribute("fill","none");
    p.setAttribute("stroke","#111111");
    p.setAttribute("stroke-width","${strokeWidth}");
    p.setAttribute("stroke-linecap","round");
    p.setAttribute("stroke-linejoin","round");
  });

  const stage = document.getElementById("stage");
  stage.appendChild(srcSvg);

  // IMPORTANTE: SIN numeración de orden de trazo (se eliminó la lógica de <text class="order">)
  await new Promise(r=>requestAnimationFrame(r));
})().catch(e=>{document.body.innerHTML="<pre style='padding:16px;color:#111'>"+e.stack+"</pre>";});
</script></body></html>`;

// Render de un kanji
async function renderKanji(browser, ch) {
  const hex = toUHex(ch);
  // Mantenemos el nombre con _nums.webp para no romper rutas existentes en la app
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
  const list = parseCliKanjis();
  const browser = await puppeteer.launch({ headless: "new" });
  for (const k of list) {
    try {
      const f = await renderKanji(browser, k);
      console.log("✔ Generado:", path.basename(f));
    } catch (e) {
      console.error("✖ Error con", k, e.message);
    }
  }
  await browser.close();
  console.log("Listo.");
})().catch(e => { console.error(e); process.exit(1); });
