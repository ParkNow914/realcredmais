const fs = require('fs-extra');
const path = require('path');

async function copyAssets() {
  try {
    // Criar diretório de destino se não existir
    await fs.ensureDir('public/assets');
    await fs.ensureDir('public/assets/images');
    
    // Copiar assets estáticos
    await fs.copy('assets', 'public/assets', { overwrite: true });
    
    // Copiar artigos para a pasta de build
    await fs.ensureDir('public/artigos');
    await fs.copy('artigos', 'public/artigos', { overwrite: true });
    
    console.log('Assets copiados com sucesso!');
  } catch (err) {
    console.error('Erro ao copiar assets:', err);
    process.exit(1);
  }
}

copyAssets();
