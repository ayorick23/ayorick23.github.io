// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://ayorick23.github.io',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap(), icon({
      iconDir: 'src/assets/icons',
      // SVGO's default cleanupIds shortens every gradient id to "a", "b"... in
      // each icon, so two full-color logos on the same page end up pointing at
      // each other's gradients (the Polars logo rendered invisible).
      svgoOptions: {
        plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false } } }],
      },
    })],
});
