import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  integrations: [vue()],
  output: 'static',
  build: {
    format: 'directory',
  },
  outDir: 'dist',
  site: 'https://temuglowz.com',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./src/site', import.meta.url)),
      },
    },
  },
});
