import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://donovanfamilydentistry.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  vite: {
    css: {
      postcss: { plugins: [] }
    }
  }
});
