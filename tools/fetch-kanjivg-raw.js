// tools/fetch-kanjivg-raw.js (CommonJS)
// Descarga directo desde GitHub Raw con la ruta canónica kanji/XYZ/XXXXX.svg

const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");
const https = require("https");

function toHexLower(term) {
  if (/^[0-9a-f]{4,6}$/i.test(term)) return term.toLowerCase();
  const cp = term.codePointAt(0);
  return cp ? cp.toString(16).toLowerCase() : null;
}
function pad5(hexLower) { return hexLower.padStart(5, "0"); }
function fetchBuf(url) {
  return new Promise((res, rej) => {
    https.get(url, r => {
      if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode} ${url}`));
      const chunks = [];
      r.on("data", c => chunks.push(c));
      r.on("end", () => res(Buffer.concat(chunks)));
    }).on("error", rej);
  });
}

(async () => {
  const args = process.argv.slice(2);
  let outDir = "assets/kanjivg/n2";
  for (const a of args) if (a.startsWith("--out=")) outDir = a.slice("--out=".length);
  const tokens = args.filter(a => !a.startsWith("--"));
  if (!tokens.length) {
    console.error("Uso: node tools/fetch-kanjivg-raw.js --out=assets/kanjivg/n2 従 連 ...");
    process.exit(1);
  }
  await fse.ensureDir(outDir);

  let ok = 0, fail = 0;
  for (const t of tokens) {
    const hexLower = toHexLower(t);
    if (!hexLower) { console.error(`✖ token inválido: ${t}`); fail++; continue; }
    const HEX5 = pad5(hexLower).toUpperCase();
    const DIR = HEX5.slice(0, 3).toLowerCase();
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${DIR}/${HEX5}.svg`;
    try {
      const buf = await fetchBuf(url);
      const outPath = path.join(outDir, `${hexLower}.svg`);
      fs.writeFileSync(outPath, buf);
      console.log(`✓ OK ${t} → ${outPath}`);
      ok++;
    } catch (e) {
      console.error(`✖ fallo ${t}: ${e.message}`);
      fail++;
    }
  }
  console.log(`Listo. OK=${ok}  Faltaron=${fail}`);
})();
