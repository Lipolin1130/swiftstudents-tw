import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swiftstudents.tw',
  redirects: {
    '/activities': '/events#past',
    '/en/activities': '/en/events#past',
  },
  i18n: {
    defaultLocale: 'zh-Hant',
    locales: ['zh-Hant', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'zh-Hant',
        locales: { 'zh-Hant': 'zh-Hant', en: 'en' },
      },
    }),
  ],
});
