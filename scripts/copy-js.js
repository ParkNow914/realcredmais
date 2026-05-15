import fse from 'fs-extra';

async function copyJavaScriptFiles() {
  try {
    await fse.ensureDir('dist/js');
    await fse.copy('js', 'dist/js', { overwrite: true });
    await fse.copy('assets', 'dist/assets', { overwrite: true });
    await fse.copy('artigos', 'dist/artigos', { overwrite: true });
    await fse.copy('styles', 'dist/styles', { overwrite: true });

    const staticFiles = [
      'scripts.js',
      'styles.css',
      'sw.js',
      'offline.html',
      'manifest.json',
      'browserconfig.xml',
      'robots.txt',
      'sitemap.xml',
      'privacy-policy.html',
      'terms-of-use.html',
    ];

    for (const file of staticFiles) {
      if (await fse.pathExists(file)) {
        await fse.copy(file, `dist/${file}`, { overwrite: true });
      }
    }

    console.log('✅ Arquivos estáticos copiados para dist com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao copiar arquivos estáticos:', err);
    process.exit(1);
  }
}

// Executa a função principal
copyJavaScriptFiles().catch(console.error);
