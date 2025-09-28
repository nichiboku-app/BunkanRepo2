import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const dir = 'assets/kanjivg/tiendas';
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.svg'));

// codepoint(hex) -> nombre final
const renameMap = {
  '05186': 'en',    // 円
  '05343': 'sen',   // 千
  '0767e': 'hyaku', // 百
  '04e07': 'man',   // 万
  '05e97': 'mise',  // 店
};

// Quita xmlns:kvg y cualquier atributo kvg:* (no afectan paths)
function sanitizeKanjiVG(svgBuf) {
  let s = svgBuf.toString('utf8');
  // quita la declaración del namespace kvg
  s = s.replace(/\s+xmlns:kvg="[^"]*"/i, '');
  // quita atributos con prefijo kvg: (comillas dobles o simples)
  s = s.replace(/\s+kvg:[\w:-]+="[^"]*"/gi, '');
  s = s.replace(/\s+kvg:[\w:-]+='[^']*'/gi, '');
  return Buffer.from(s, 'utf8');
}

(async () => {
  for (const name of files) {
    const inPath = path.join(dir, name);
    const base = name.replace(/\.svg$/i, '');
    const friendly = renameMap[base] || base;
    const outPath = path.join(dir, friendly + '_web.webp');

    try {
      console.log('', inPath, '', outPath);

      // 1) lee y sanea el SVG (elimina prefijos kvg:)
      const svgRaw = fs.readFileSync(inPath);
      const svg = sanitizeKanjiVG(svgRaw);

      // 2) renderiza SVG -> PNG en memoria (ancho máx 1024)
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1024 },
        font: { loadSystemFonts: true },
        // svgRenderingIntent: 'relative-colorimetric' // opcional
      });
      const png = resvg.render().asPng();

      // 3) PNG -> WEBP
      await sharp(png).webp({ quality: 90 }).toFile(outPath);
    } catch (err) {
      console.error(' Error con', name, err?.message || err);
      process.exitCode = 1;
    }
  }
  console.log(' Listo');
})();
