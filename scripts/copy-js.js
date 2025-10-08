import { fileURLToPath } from 'url';
import fse from 'fs-extra';

async function copyJavaScriptFiles() {
  try {
    // Copiar arquivos JavaScript para a pasta dist
    await fse.ensureDir('dist/js');
    await fse.copy('js', 'dist/js', { overwrite: true });

    console.log('✅ Arquivos JavaScript copiados para dist/js com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao copiar arquivos JavaScript:', err);
    process.exit(1);
  }
}

// Executa a função principal
copyJavaScriptFiles().catch(console.error);
