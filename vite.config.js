import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3005,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
