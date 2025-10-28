// scripts/generate-kanjivg-u3.js
// Uso:
//   node scripts/generate-kanjivg-u3.js 決 定 参 加 断 由 訳 必 然 証 責 任
//   ó con hex:
//   node scripts/generate-kanjivg-u3.js 06c7a 05b9a 053c2 052a0 065ad 07531 08a33 05fc5 07136 08a3c 08cac 04efb

const fs = require("fs");
const path = require("path");

// === CONFIG ===
const DEST_DIR = path.join(process.cwd(), "assets", "kanjivg", "n2");

// --- helpers ---
function toHex5(input) {
  if (/^[0-9a-fA-F]{4,5}$/.test(input)) {
    return input.toLowerCase().padStart(5, "0");
  }
  const cp = input.codePointAt(0);
  if (!cp) throw new Error(`Entrada inválida: ${input}`);
  return cp.toString(16).toLowerCase().padStart(5, "0");
}
function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function downloadSvgToWebp(hex5, destFile) {
  // ✅ Ruta correcta en KanjiVG (SIN 'u' y SIEMPRE 5 dígitos)
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex5}.svg`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url} (${res.status})`);
  const svg = await res.text();

  const sharp = require("sharp");
  await sharp(Buffer.from(svg)).webp({ quality: 95 }).toFile(destFile);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("✋ Pásame kanjis o hex:\n  node scripts/generate-kanjivg-u3.js 決 定 参 ...\n  ó\n  node scripts/generate-kanjivg-u3.js 06c7a 05b9a ...");
    process.exit(1);
  }

  ensureDir(DEST_DIR);

  const results = [];
  for (const raw of args) {
    try {
      const hex5 = toHex5(raw); // e.g. 決 => 06c7a
      const out = path.join(DEST_DIR, `${hex5}_nums.webp`);

      if (fs.existsSync(out)) {
        results.push(`= ${raw} -> ${hex5}_nums.webp (ya existía)`);
        continue;
      }

      await downloadSvgToWebp(hex5, out);
      results.push(`✓ ${raw} -> ${hex5}_nums.webp (descargado y convertido)`);
    } catch (e) {
      results.push(`✗ ${raw} -> error: ${e.message}`);
    }
  }

  console.log(results.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
