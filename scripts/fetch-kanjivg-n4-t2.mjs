// scripts/fetch-kanjivg-n4-t2.mjs
// KanjiVG → WEBP (tema 2) con limpieza de namespace kvg + fallback a sharp

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ------- fetch compatible (Node < 18)
let _fetch = globalThis.fetch;
if (!_fetch) {
  const { default: nf } = await import("node-fetch");
  _fetch = nf;
}

// ------- rutas
const OUT_DIR = path.resolve("assets/kanjivg/n4");
const RAW_DIR = path.resolve("assets/kanjivg/raw/kanji");
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

// ====== LISTA TEMA 2 ======
const LIST = [
  { ch: "家", cp: "5bb6" },
  { ch: "室", cp: "5ba4" },
  { ch: "窓", cp: "7a93" },
  { ch: "戸", cp: "6238" },
  { ch: "開", cp: "958b" },
  { ch: "閉", cp: "9589" },
  { ch: "電", cp: "96fb" },
  { ch: "明", cp: "660e" },
  { ch: "付", cp: "4ed8" },
  { ch: "消", cp: "6d88" },
];

const pad5 = (hex) => hex.toLowerCase().padStart(5, "0");
const UA = "KitsuneApp Kanji Fetcher/1.4 (+https://example.org; edu use)";

// Wikimedia titula archivos como: 「家 - U+05BB6 - KanjiVG stroke order.svg」
const uPlus = (ch) => ch.codePointAt(0).toString(16).toUpperCase().padStart(5, "0");
const commonsNames = (ch) => {
  const u = uPlus(ch);
  const a = `${ch} - U+${u} - KanjiVG stroke order.svg`;
  const b = `${ch} - U+${u} (Kaisho) - KanjiVG stroke order.svg`;
  return [a, b];
};

const urlCandidates = (cp, ch) => {
  const cp5 = pad5(cp);
  const [a, b] = commonsNames(ch).map(encodeURIComponent);
  return [
    // 1) GitHub Raw (preferido)
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${cp5}.svg`,
    // 2) jsDelivr
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${cp5}.svg`,
    // 3) Mirror Kan-G
    `https://kan-g.vnaka.dev/k/${cp5}.svg`,
    // 4) Wikimedia Commons (fallbacks)
    `https://commons.wikimedia.org/wiki/Special:FilePath/${a}`,
    `https://commons.wikimedia.org/wiki/Special:FilePath/${b}`,
    `https://commons.wikimedia.org/w/index.php?title=Special:FilePath&file=${a}`,
    `https://commons.wikimedia.org/w/index.php?title=Special:FilePath&file=${b}`,
  ];
};

async function getWithRetry(url, { tries = 3, timeout = 12000 } = {}) {
  for (let i = 1; i <= tries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await _fetch(url, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          Accept: "image/svg+xml,text/xml,*/*",
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
      await new Promise((r) => setTimeout(r, 400 * i)); // backoff
    }
  }
}

// Limpia atributos kvg:* que a veces rompen al parser.
function sanitizeKanjiVG(svg) {
  let s = svg;

  // 1) quita todos los atributos kvg:*
  s = s.replace(/\s+kvg:[a-zA-Z0-9_-]+=(?:"[^"]*"|'[^']*')/g, "");

  // 2) si quedara el xmlns:kvg, elimínalo (ya no hay atributos kvg)
  s = s.replace(/\s+xmlns:kvg=(?:"[^"]*"|'[^']*')/i, "");

  // 3) asegura xmlns principal
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(s)) {
    s = s.replace(
      /<svg\b/i,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  return s;
}

async function fetchSvg(cp, ch) {
  const cache = path.join(RAW_DIR, `${pad5(cp)}.svg`);
  if (fs.existsSync(cache)) {
    const str = fs.readFileSync(cache, "utf8");
    if (str.startsWith("<svg")) return { svg: str, source: "cache" };
  }
  for (const url of urlCandidates(cp, ch)) {
    try {
      const buf = await getWithRetry(url);
      const str = buf.toString("utf8").trim();
      if (str.startsWith("<svg") || str.startsWith("<?xml")) {
        fs.writeFileSync(cache, str);
        return { svg: str, source: url };
      }
    } catch {
      // intenta siguiente
    }
  }
  throw new Error("No se pudo obtener el SVG desde ningún proveedor.");
}

async function renderToWebp(svgString, outFile) {
  const clean = sanitizeKanjiVG(svgString);

  // 1) intento con Resvg (más fiel)
  try {
    const r = new Resvg(clean, {
      fitTo: { mode: "width", value: 700 },
      background: "#fffdf8",
    });
    const png = r.render().asPng();
    await sharp(png)
      .resize(1024, 1024, { fit: "contain", background: "#fffdf8" })
      .webp({ quality: 96 })
      .toFile(outFile);
    return;
  } catch (e) {
    // 2) fallback: rasteriza directo con Sharp desde SVG
    try {
      await sharp(Buffer.from(clean))
        .resize(1024, 1024, { fit: "contain", background: "#fffdf8" })
        .webp({ quality: 94 })
        .toFile(outFile);
      return;
    } catch (e2) {
      throw e; // re-lanza el error original de Resvg
    }
  }
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

  // Atribución
  fs.mkdirSync(path.resolve("assets/kanjivg"), { recursive: true });
  fs.writeFileSync(
    path.resolve("assets/kanjivg/ATTRIBUTION.txt"),
    `Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0
https://kanjivg.tagaini.net/
Incluye copias obtenidas de Wikimedia Commons (Special:FilePath).
Generado automáticamente para uso educativo.`
  );

  console.log(`\nListo: ${ok}/${LIST.length} imágenes generadas → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
