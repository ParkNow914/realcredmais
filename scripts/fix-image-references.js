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
  'artigos/base.html',
  'scripts.js',
  'sw.js',
  'server.js',
];

// Mapeamento de correções
const IMAGE_REPLACEMENTS = {
  // Corrige caminhos com espaços
  'assets/LOGO%202.jpeg': 'assets/LOGO%202.jpeg', // Mantém o mesmo, mas padroniza a referência
  'assets/LOGO 2.jpeg': 'assets/LOGO%202.jpeg',

  // Garante que os caminhos estão corretos
  '/assets/images/': 'assets/images/',
  'assets/images//': 'assets/images/',

  // Imagens específicas
  'assets/images/realcred_logo.png': 'assets/images/realcred_logo.png',
  'assets/images/realcred_logo.webp': 'assets/images/realcred_logo.webp',
  'assets/images/happy_people1.jpg': 'assets/images/happy_people1.jpg',
  'assets/images/happy_people1.webp': 'assets/images/happy_people1.webp',
  'assets/images/happy_people2.jpg': 'assets/images/happy_people2.jpg',
  'assets/images/happy_people2.webp': 'assets/images/happy_people2.webp',
  'assets/images/security_icon1.png': 'assets/images/security_icon1.png',
  'assets/images/security_icon1.webp': 'assets/images/security_icon1.webp',
  'assets/images/security_icon2.png': 'assets/images/security_icon2.png',
  'assets/images/security_icon2.webp': 'assets/images/security_icon2.webp',
  'assets/images/financial_icon1.png': 'assets/images/financial_icon1.png',
  'assets/images/financial_icon1.webp': 'assets/images/financial_icon1.webp',
  'assets/images/financial_icon2.png': 'assets/images/financial_icon2.png',
  'assets/images/loan_icon1.png': 'assets/images/loan_icon1.png',
  'assets/images/loan_icon1.webp': 'assets/images/loan_icon1.webp',
  'assets/images/loan_icon2.png': 'assets/images/loan_icon2.png',
  'assets/images/loan_icon2.webp': 'assets/images/loan_icon2.webp',
  'assets/images/sairdasdividas.png': 'assets/images/sairdasdividas.png',
  'assets/images/creditopessoalvsconsignado.png': 'assets/images/creditopessoalvsconsignado.png',
  'assets/images/fgtsvaleapena.png': 'assets/images/fgtsvaleapena.png',
  'assets/images/testimonials_template.png': 'assets/images/testimonials_template.png',
  'assets/images/testimonials_template.webp': 'assets/images/testimonials_template.webp',
};

// Função para processar um arquivo
async function processFile(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    try {
      await fs.access(fullPath);
    } catch (error) {
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
