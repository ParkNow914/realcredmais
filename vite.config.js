import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
        rewrite: (path) => path.replace(/^\/api/, ''),
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
});
