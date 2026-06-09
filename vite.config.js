import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  root: '.', // index.html está na raiz
  base: '/', // Usar caminhos absolutos a partir da raiz
  publicDir: 'public', // Pasta de arquivos públicos
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.gif', '**/*.webp'],
  server: {
    host: true, // Permite acesso em rede local
    port: 3000,
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 3001,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
      },
      '/lead': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..'],
    },
  },
  // Remove console.* e debugger em qualquer build de produção (`vite build`),
  // independente de NODE_ENV (que nem sempre é definido pelo Netlify/npm).
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash][ext]',
      },
    },
  },
}));
