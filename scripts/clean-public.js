import fse from 'fs-extra';

// Remove os artefatos gerados em builds anteriores dentro de `public/`
// para evitar que arquivos obsoletos sejam publicados.
async function cleanPublic() {
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
cleanPublic().catch(console.error);
