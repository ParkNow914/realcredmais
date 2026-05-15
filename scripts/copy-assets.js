import fse from 'fs-extra';

async function copyAssets() {
  try {
    await fse.remove('public/assets');
    await fse.remove('public/artigos');
    await fse.remove('public/sw.js');

    console.log('✅ Diretórios públicos gerados limpos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao limpar diretórios públicos gerados:', err);
    process.exit(1);
  }
}

// Executa a função principal
copyAssets().catch(console.error);
