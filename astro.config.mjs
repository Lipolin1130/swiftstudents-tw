import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swiftstudents.tw',
  redirects: {
    '/activities': '/events#past',
    '/en/activities': '/en/events#past',
    '/community': '/winners',
    '/en/community': '/en/winners',
    // Winner pages moved from /winners/<year>-<name> to /winners/<year>/<name>.
    '/winners/2024-lin-kai-yu': '/winners/2024/lin-kai-yu',
    '/en/winners/2024-lin-kai-yu': '/en/winners/2024/lin-kai-yu',
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
