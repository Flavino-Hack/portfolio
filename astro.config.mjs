// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://fhkdev.kdns.fr', // J'ai mis à jour l'URL de ton site
  output: 'server', // INDISPENSABLE pour que l'API fonctionne sur Netlify
  devToolbar: { enabled: false },

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()], // J'ai retiré db()
  adapter: netlify(),
});