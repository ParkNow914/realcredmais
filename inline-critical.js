import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import Critters from 'critters';

const distDir = path.resolve('dist');

(async () => {
  const critters = new Critters({
    path: distDir,
    pruneSource: false,
    preload: 'swap',
    inlineFonts: false,
  });
  const indexPath = path.join(distDir, 'index.html');
  let html = await readFile(indexPath, 'utf8');
  const processed = await critters.process(html);
  await writeFile(indexPath, processed);
  console.log('Critical CSS inlined into dist/index.html');
})();
