import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const page = (path) => resolve(root, path);

export default defineConfig({
  plugins: [partials],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: page('index.html'),
        notFound: page('404.html'),
        privacidade: page('privacy-policy.html'),
        termos: page('terms-of-use.html'),
        dividas: page('artigos/como-sair-das-dividas-2026.html'),
        comparativo: page('artigos/emprestimo-consignado-vs-credito-pessoal.html'),
        fgts: page('artigos/saque-aniversario-fgts-2026.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  server: { port: 3000 },
});
