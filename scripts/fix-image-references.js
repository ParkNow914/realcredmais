import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurações
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const FILES_TO_PROCESS = [
  'index.html',
  'artigos/saque-aniversario-fgts-2025.html',
  'artigos/emprestimo-consignado-vs-credito-pessoal.html',
  'artigos/como-sair-das-dividas-2025.html',
  'scripts.js',
  'sw.js',
  'server.js',
];

// Mapeamento de correções
const IMAGE_REPLACEMENTS = {
  // Corrige caminhos com espaços
  'assets/LOGO%202.jpeg': 'assets/LOGO%202.jpeg', // Mantém o mesmo, mas padroniza a referência
  'assets/LOGO 2.jpeg': 'assets/LOGO%202.jpeg',

  // Garante que imagens dos artigos funcionem em /artigos/* e na cópia de build.
  'src="..assets/images/fgtsvaleapena.png"': 'src="/assets/images/fgtsvaleapena.png"',
  'src="assets/images/sairdasdividas.png"': 'src="/assets/images/sairdasdividas.png"',
  'src="assets/images/creditopessoalvsconsignado.png"':
    'src="/assets/images/creditopessoalvsconsignado.png"',
};

// Função para processar um arquivo
async function processFile(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    try {
      await fs.access(fullPath);
    } catch {
      console.log(`Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = await fs.readFile(fullPath, 'utf8');
    let modified = false;

    // Aplica as substituições
    for (const [oldPath, newPath] of Object.entries(IMAGE_REPLACEMENTS)) {
      const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newPath);
        modified = true;
      }
    }

    // Se o conteúdo foi modificado, salva o arquivo
    if (modified) {
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`✅ ${filePath} - Atualizado com sucesso`);
    } else {
      console.log(`ℹ️  ${filePath} - Nenhuma alteração necessária`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função principal assíncrona
async function main() {
  console.log('🚀 Iniciando correção de referências de imagens...\n');

  // Processa todos os arquivos em sequência
  for (const file of FILES_TO_PROCESS) {
    await processFile(file);
  }

  console.log('\n✅ Todas as referências de imagens foram verificadas!');
}

// Executa a função principal
main().catch(console.error);
