import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [vue()],
  output: 'static',
  build: {
    format: 'directory',
  },
  outDir: 'dist-site',
  site: 'https://temuglowz.com',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
        '~': '/src/site',
      },
    },
  },
});
