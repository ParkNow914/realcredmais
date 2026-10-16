import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const root = import.meta.dirname;

// Cabeçalho e rodapé ficam em partials/ e entram em todas as páginas no lugar de
// <!-- @header --> e <!-- @footer -->. Assim um telefone ou endereço muda num lugar só.
const partials = {
  name: 'partials',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<!--\s*@(\w+)\s*-->/g, (match, name) => {
        try {
          return readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8');
        } catch {
          return match;
        }
      });
    },
  },
};

// Toda página .html do projeto vira uma entrada do build, inclusive as geradas por
// scripts/gerar.mjs (páginas de produto, Lorena e artigos).
const IGNORAR = new Set(['node_modules', 'dist', 'partials', 'public', '.git', 'content', 'scripts', 'tests']);
function paginas(dir = root, lista = {}) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue;
    const caminho = resolve(dir, item.name);
    if (item.isDirectory()) paginas(caminho, lista);
    else if (item.name.endsWith('.html')) {
      const nome = relative(root, caminho).split(sep).join('/').replace(/\.html$/, '').replace(/[/.]/g, '_');
      lista[nome] = caminho;
    }
  }
  return lista;
}

export default defineConfig({
  plugins: [partials],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: paginas(),
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  server: { port: 3000 },
});
