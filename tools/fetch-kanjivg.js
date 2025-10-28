// tools/fetch-kanjivg.js (CommonJS)
// Baja la última release ZIP de KanjiVG y extrae solo los kanji pedidos.
// Uso:
//   node tools/fetch-kanjivg.js --out=assets/kanjivg/n2 従 連 伴 ...
//   node tools/fetch-kanjivg.js --out=assets/kanjivg/n2 5f93 9023 ...

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const https = require("https");
const AdmZip = require("adm-zip");

const FALLBACKS = [
  // Releases conocidas; si cambia, prueba las de abajo o “latest”
  "https://github.com/KanjiVG/kanjivg/releases/download/r20160426/kanjivg-20160426-all.zip",
  "https://github.com/KanjiVG/kanjivg/releases/download/r20150615/kanjivg-20150615-all.zip",
  "https://github.com/KanjiVG/kanjivg/releases/latest/download/kanjivg-20160426-all.zip"
];

function toHexLower(term) {
  if (/^[0-9a-f]{4,6}$/i.test(term)) return term.toLowerCase();
  const cp = term.codePointAt(0);
  return cp ? cp.toString(16).toLowerCase() : null;
}
function pad5(hexLower) {
  return hexLower.padStart(5, "0");
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} ${url}`));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function downloadZip(cacheDir) {
  await fse.ensureDir(cacheDir);
  const existing = fs.readdirSync(cacheDir).find(n => n.endsWith(".zip"));
  if (existing) return path.join(cacheDir, existing);

  for (const url of FALLBACKS) {
    try {
      const buf = await fetchBuffer(url);
      if (buf.length < 1024) continue;
      const out = path.join(cacheDir, path.basename(url));
      fs.writeFileSync(out, buf);
      return out;
    } catch (_) {}
  }
  throw new Error("No se pudo descargar la release ZIP de KanjiVG.");
}

function listEntries(zip) {
  return zip.getEntries().map(e => e.entryName);
}

(async () => {
  const args = process.argv.slice(2);
  let outDir = "assets/kanjivg/n2";
  for (const a of args) {
    if (a.startsWith("--out=")) outDir = a.slice("--out=".length);
  }
  const tokens = args.filter(a => !a.startsWith("--"));
  if (tokens.length === 0) {
    console.error("Uso: node tools/fetch-kanjivg.js --out=assets/kanjivg/n2 従 連 ...");
    process.exit(1);
  }
  await fse.ensureDir(outDir);

  const cacheDir = path.resolve(".cache", "kanjivg");
  const zipPath = await downloadZip(cacheDir);
  const zip = new AdmZip(zipPath);
  const entries = listEntries(zip); // e.g. kanji/05f/05F93.svg

  let ok = 0, fail = 0;
  for (const t of tokens) {
    const hexLower = toHexLower(t);
    if (!hexLower) { console.error(`✖ token inválido: ${t}`); fail++; continue; }

    const HEX5 = pad5(hexLower).toUpperCase();     // 05F93
    const DIR = HEX5.slice(0, 3).toLowerCase();    // 05f
    const wanted = `kanji/${DIR}/${HEX5}.svg`;     // kanji/05f/05F93.svg

    // Busca exacto; si la release trae estructura distinta, probamos endsWith también
    let entryName = entries.find(e => e === wanted);
    if (!entryName) entryName = entries.find(e => e.toLowerCase().endsWith(`/${HEX5.toLowerCase()}.svg`));

    if (!entryName) {
      console.error(`✖ fallo ${t} (${hexLower}): no se encontró ${wanted} en el ZIP`);
      fail++; continue;
    }

    const entry = zip.getEntry(entryName);
    if (!entry) { console.error(`✖ fallo ${t}: entry corrupta`); fail++; continue; }

    const outPath = path.join(outDir, `${hexLower}.svg`); // guardamos minúsculas sin pad extra
    fs.writeFileSync(outPath, entry.getData());
    console.log(`✓ OK ${t} → ${path.relative(process.cwd(), outPath)}  (from ${entryName})`);
    ok++;
  }

  console.log(`Listo. OK=${ok}  Faltaron=${fail}`);
})().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
