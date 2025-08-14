import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const IMG_DIR = path.resolve('assets/images');
const OUTPUT_DIR = IMG_DIR; // Salva ao lado do original

async function processDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await processDir(fullPath);
      } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
        const outName = entry.name.replace(/\.(png|jpe?g)$/i, '.webp');
        const outPath = path.join(dir, outName);
        try {
          await sharp(fullPath).toFormat('webp', { quality: 80 }).toFile(outPath);
          console.log('Converted', outPath);
        } catch (e) {
          console.error('Error converting', fullPath, e.message);
        }
      }
    })
  );
}

processDir(IMG_DIR).catch(console.error);
