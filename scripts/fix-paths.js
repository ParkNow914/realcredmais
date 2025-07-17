import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixPaths() {
  try {
    const distDir = path.join(__dirname, '..', 'dist');
    
    // Corrigir caminhos nos arquivos HTML
    const files = await fs.readdir(distDir);
    
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(distDir, file);
        let content = await fs.readFile(filePath, 'utf-8');
        
        // Corrigir caminhos de assets
        content = content.replace(/(href|src)="([^"]*\.(?:png|jpg|jpeg|gif|svg|webp|css|js))(")/g, (match, p1, p2, p3) => {
          // Se já começar com /, mantém como está
          if (p2.startsWith('/') || p2.startsWith('http')) {
            return match;
          }
          // Se for um caminho relativo, adiciona / no início
          return `${p1}="${p2.startsWith('./') ? p2.substring(1) : '/' + p2}${p3}`;
        });
        
        await fs.writeFile(filePath, content, 'utf-8');
      }
    }
    
    console.log('✅ Caminhos corrigidos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao corrigir caminhos:', err);
    process.exit(1);
  }
}

// Executa a função principal
fixPaths().catch(console.error);
