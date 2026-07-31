import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://donovan-family-dentistry-demo.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
