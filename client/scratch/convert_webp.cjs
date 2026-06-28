const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const targets = [
  path.join(PUBLIC_DIR, 'themes'),
  path.join(PUBLIC_DIR, 'images'),
  path.join(PUBLIC_DIR, 'addons')
];

async function convertDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await convertDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const dirName = path.dirname(fullPath);
        const baseName = path.basename(entry.name, ext);
        const webpPath = path.join(dirName, `${baseName}.webp`);

        try {
          const stats = fs.statSync(fullPath);
          const originalSize = stats.size;

          // Convert to webp
          await sharp(fullPath)
            .webp({ quality: 85 })
            .toFile(webpPath);

          const webpStats = fs.statSync(webpPath);
          const newSize = webpStats.size;

          const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
          console.log(`Converted: ${entry.name} -> ${baseName}.webp | Original: ${(originalSize/1024).toFixed(1)}KB, WebP: ${(newSize/1024).toFixed(1)}KB (${savings}% savings)`);

          // Delete original
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Error converting ${entry.name}:`, err.message);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting WebP conversion...');
  for (const t of targets) {
    console.log(`Processing: ${t}`);
    await convertDir(t);
  }
  console.log('Conversion complete!');
}

main().catch(err => console.error(err));
