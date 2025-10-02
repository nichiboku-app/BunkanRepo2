// KanjiVG → WEBP con fallback, 4/5 dígitos en Commons y saneo de namespaces kvg.
// Node 16–22 compatible (usa node-fetch si hace falta).

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ------- fetch compatible -------
let _fetch = globalThis.fetch;
if (!_fetch) {
  const { default: nf } = await import("node-fetch");
  _fetch = nf;
}

// ------- rutas -------
const OUT_DIR  = path.resolve("assets/kanjivg/n4");
const RAW_DIR  = path.resolve("assets/kanjivg/raw/kanji"); // cache opcional de SVG
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

// 10 kanji de la lección
const LIST = [
  { ch: "私", cp: "79c1" },
  { ch: "名", cp: "540d" },
  { ch: "前", cp: "524d" },
  { ch: "国", cp: "56fd" },
  { ch: "学", cp: "5b66" },
  { ch: "生", cp: "751f" },
  { ch: "社", cp: "793e" },
  { ch: "員", cp: "54e1" },
  { ch: "仕", cp: "4ed5" },
  { ch: "事", cp: "4e8b" },
];

// ——— util: U+ code (4 y 5 dígitos) ———
const uHex = (ch) => ch.codePointAt(0).toString(16).toUpperCase();        // p.ej. "540D"
const uHex5 = (ch) => uHex(ch).padStart(5, "0");                           // p.ej. "0540D"

// Wikimedia posibles nombres
const commonsNames = (ch) => {
  const u4 = uHex(ch);
  const u5 = uHex5(ch);
  return [
    `${ch} - U+${u4} - KanjiVG stroke order.svg`,
    `${ch} - U+${u4} (Kaisho) - KanjiVG stroke order.svg`,
    `${ch} - U+${u5} - KanjiVG stroke order.svg`,
    `${ch} - U+${u5} (Kaisho) - KanjiVG stroke order.svg`,
  ];
};

// GitHub/jsDelivr: algunos mirrors usan 4 dígitos con cero a la izquierda
const cp4 = (cp) => cp.toLowerCase();                 // "540d"
const cp5 = (cp) => cp.toLowerCase().padStart(5,"0"); // "0540d"

// Candidatos de descarga
const urlCandidates = (cp, ch) => {
  const commons = commonsNames(ch).map(encodeURIComponent);
  return [
    // 1) GitHub Raw (4 y 5)
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${cp4(cp)}.svg`,
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${cp5(cp)}.svg`,

    // 2) jsDelivr (4 y 5)
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${cp4(cp)}.svg`,
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${cp5(cp)}.svg`,

    // 3) Mirror
    `https://kan-g.vnaka.dev/k/${cp4(cp)}.svg`,
    `https://kan-g.vnaka.dev/k/${cp5(cp)}.svg`,

    // 4) Wikimedia Commons (Special:FilePath variantes)
    ...commons.map((c) => `https://commons.wikimedia.org/wiki/Special:FilePath/${c}`),
    ...commons.map((c) => `https://commons.wikimedia.org/w/index.php?title=Special:FilePath&file=${c}`),
  ];
};

const UA = "KitsuneApp Kanji Fetcher/1.4 (+https://example.org; edu use)";

async function getWithRetry(url, { tries = 4, timeout = 15000 } = {}) {
  for (let i = 1; i <= tries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await _fetch(url, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          "Accept": "image/svg+xml,text/xml,*/*",
          "Accept-Language": "es,en;q=0.9",
          "Referrer-Policy": "no-referrer",
        },
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return buf;
    } catch (e) {
      clearTimeout(timer);
      if (i === tries) throw e;
      await new Promise((r) => setTimeout(r, 500 * i)); // backoff
    }
  }
}

async function fetchSvg(cp, ch) {
  // cache local
  const cache = path.join(RAW_DIR, `${cp}.svg`);
  if (fs.existsSync(cache)) {
    const str = fs.readFileSync(cache, "utf8");
    if (str.startsWith("<svg")) return { svg: str, source: "cache" };
  }

  for (const url of urlCandidates(cp, ch)) {
    try {
      const buf = await getWithRetry(url);
      const str = buf.toString("utf8").trim();
      if (str.startsWith("<svg") || str.startsWith("<?xml")) {
        fs.writeFileSync(cache, str); // guarda cache para siguiente corrida
        return { svg: str, source: url };
      }
    } catch {
      // probar siguiente
    }
  }
  throw new Error("No se pudo obtener el SVG desde ningún proveedor.");
}

// —— saneo: remover namespaces no-SVG (kvg:, inkscape:, sodipodi:, rdf:, dc:, cc:) ——
function sanitizeSvg(svg) {
  let s = svg;

  // quita atributos namespaced
  s = s.replace(/\s(?:kvg|inkscape|sodipodi|rdf|dc|cc):[a-zA-Z0-9._:-]+="[^"]*"/g, "");

  // quita etiquetas namespaced completas <kvg:* ...>...</kvg:*>
  s = s.replace(/<\s*(?:kvg|inkscape|sodipodi|rdf|dc|cc):[^>]*>[\s\S]*?<\/\s*(?:kvg|inkscape|sodipodi|rdf|dc|cc):[^>]*>/g, "");

  // quita cualquier tag de metadatos grandes
  s = s.replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/g, "");

  // elimina xmlns:* que ya no necesitamos
  s = s.replace(/\sxmlns:(?:kvg|inkscape|sodipodi|rdf|dc|cc)="[^"]*"/g, "");

  // a veces ponen kvg: en IDs/element names de grupos: normaliza tag names <kvg:g ...> → <g ...>
  s = s.replace(/<\s*\/\s*kvg:/g, "</");
  s = s.replace(/<\s*kvg:/g, "<");

  return s;
}

function renderToWebp(svgString, outFile) {
  const clean = sanitizeSvg(svgString);

  const r = new Resvg(clean, {
    fitTo: { mode: "width", value: 700 }, // nítido para móvil
    background: "#fffdf8",                 // papel cálido
  });
  const png = r.render().asPng();

  return sharp(png)
    .resize(1024, 1024, { fit: "contain", background: "#fffdf8" })
    .webp({ quality: 96 })
    .toFile(outFile);
}

async function main() {
  let ok = 0;
  for (const { cp, ch } of LIST) {
    const out = path.join(OUT_DIR, `${cp}_web.webp`);
    try {
      const { svg, source } = await fetchSvg(cp, ch);
      await renderToWebp(svg, out);
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`✅ ${ch} (${cp}) · ${kb} KB · ${source}`);
      ok++;
    } catch (e) {
      console.error(`❌ ${ch} (${cp}) · ${e.message || e}`);
    }
  }

  fs.writeFileSync(
    path.resolve("assets/kanjivg/ATTRIBUTION.txt"),
    `Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0
https://kanjivg.tagaini.net/
Incluye copias obtenidas de Wikimedia Commons.
Generado automáticamente para uso educativo.`
  );

  console.log(`\nListo: ${ok}/${LIST.length} imágenes generadas → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
