// One-off script: convert the PNG logo to WebP variants for use in the app header.
const path = require('path');
const fs = require('fs');
const sharp = require(path.join(process.env.TEMP, 'node_modules', 'sharp'));

const src = 'G:\\KRISHI-PRABANDH-1\\background-removed-background-removed (1).png';
const outDir = 'G:\\KRISHI-PRABANDH-1\\frontend\\public';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const meta = await sharp(src).metadata();
  console.log('Source:', meta.width + 'x' + meta.height, meta.format, meta.hasAlpha ? '(alpha)' : '');

  // Full-resolution lossless webp (good master copy, transparent)
  await sharp(src)
    .webp({ quality: 92, lossless: false, alphaQuality: 100, effort: 6 })
    .toFile(path.join(outDir, 'krishi-logo.webp'));

  // 256px variant used in header / sidebar (transparent, crisp)
  await sharp(src)
    .resize({ width: 256, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(outDir, 'krishi-logo-256.webp'));

  // 128px tiny variant
  await sharp(src)
    .resize({ width: 128, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(outDir, 'krishi-logo-128.webp'));

  // PNG icons used by manifest.json / apple-touch-icon
  await sharp(src)
    .resize({ width: 192, height: 192, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'icon-192.png'));

  await sharp(src)
    .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'icon-512.png'));

  // 32x32 favicon (transparent png)
  await sharp(src)
    .resize({ width: 32, height: 32, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'favicon-32.png'));

  const list = fs.readdirSync(outDir).filter((f) =>
    f.startsWith('krishi-logo') || f === 'icon-192.png' || f === 'icon-512.png' || f === 'favicon-32.png'
  );
  list.forEach((f) => {
    const s = fs.statSync(path.join(outDir, f));
    console.log(' -', f, '(' + s.size + ' bytes)');
  });
}

run().catch((e) => { console.error(e); process.exit(1); });
