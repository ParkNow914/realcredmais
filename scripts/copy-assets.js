import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyAssets() {
  try {
    // Criar diretório de destino se não existir
    await fse.ensureDir('public/assets');
    await fse.ensureDir('public/assets/images');
    
    // Copiar assets estáticos
    await fse.copy('assets', 'public/assets', { overwrite: true });
    
    // Copiar artigos para a pasta de build
    await fse.ensureDir('public/artigos');
    await fse.copy('artigos', 'public/artigos', { overwrite: true });
    
    // Copiar service worker para a pasta de build
    await fse.copy('sw.js', 'public/sw.js', { overwrite: true });
    
    console.log('✅ Assets copiados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao copiar assets:', err);
    process.exit(1);
  }
}

// Executa a função principal
copyAssets().catch(console.error);
