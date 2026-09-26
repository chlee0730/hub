import { defineConfig } from 'vite';

// GitHub Pages 경로: https://chlee0730.github.io/hub/  → base '/hub/'
export default defineConfig({
  base: '/hub/',
  build: { outDir: 'dist', emptyOutDir: true },
});
