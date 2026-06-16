# Swift Students Taiwan 官網 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Astro 靜態網站打造 Swift Students Taiwan 雙語（繁中預設 `/`、英文 `/en`）社群官網，部署於 Cloudflare Pages。

**Architecture:** Astro 5 靜態輸出（SSG）。每個語系用獨立的薄頁面檔案，HTML 結構集中在共用 `.astro` 元件，由 `lang` prop 驅動並透過 `t()` 字典取字串。活動內容用 Content Collections（glob loader，每場活動每語言各一 Markdown 檔），由日期區分「即將／過往」。i18n 與內容的純函式抽出來用 Vitest 做 TDD。

**Tech Stack:** Astro 5、`@astrojs/sitemap`、TypeScript（`astro check`）、Vitest、原生 CSS（design tokens）、Cloudflare Pages。

**Spec:** `docs/superpowers/specs/2026-06-16-swift-students-taiwan-website-design.md`

---

## File Structure

```
swiftstudents/
  package.json            # scripts + deps
  astro.config.mjs        # site, i18n, sitemap
  tsconfig.json           # astro strict
  vitest.config.ts        # 純函式單元測試
  .gitignore
  README.md
  public/
    robots.txt
    favicon.svg
  src/
    config.ts             # 站名、discordUrl、社群連結等常數
    content.config.ts     # events 集合（glob loader + Zod schema）
    styles/global.css     # design tokens + base
    i18n/
      ui.ts               # 語言清單 + 字典 + Lang 型別
      utils.ts            # 純函式：lang/path/翻譯（無 astro: 匯入）→ 可單元測試
      utils.test.ts
    lib/
      event-utils.ts      # 純函式：splitEvents（無 astro: 匯入）→ 可單元測試
      event-utils.test.ts
      events.ts           # astro:content 包裝：getEventsByLang、eventSlug
    layouts/Layout.astro
    components/
      Header.astro  Footer.astro  Hero.astro  AboutSection.astro
      Highlights.astro  EventCard.astro  EventList.astro  CommunityCTA.astro
      pages/
        HomeContent.astro  EventsListContent.astro
        ActivitiesListContent.astro  EventDetailContent.astro
    content/events/
      zh-Hant/*.md
      en/*.md
    pages/
      index.astro  events.astro  activities.astro  404.astro
      events/[slug].astro
      en/index.astro  en/events.astro  en/activities.astro
      en/events/[slug].astro
```

**關鍵分層原則：** 任何會被 Vitest 測到的純函式，**不可**匯入 `astro:content`（那是 build 期虛擬模組，vitest 跑不動）。因此 `splitEvents` 放 `lib/event-utils.ts`，`parseEventId` 與 path 工具放 `i18n/utils.ts`，兩者只依賴普通 TS。`lib/events.ts` 才匯入 `astro:content`，不寫單元測試（靠 `astro build` 驗證）。

---

## Task 1: 專案骨架、設定、工具鏈

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/config.ts`, `src/pages/index.astro`(暫時)

- [ ] **Step 1: 建立 `package.json`**

```json
{
  "name": "swiftstudents-tw",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.2.0",
    "@astrojs/sitemap": "^3.2.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: 建立 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swiftstudents.tw',
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
```

- [ ] **Step 3: 建立 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 建立 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: 建立 `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.DS_Store
*.log
.env
.env.production
```

- [ ] **Step 6: 建立 `src/config.ts`**

```ts
export const SITE = {
  name: 'Swift Students Taiwan',
  url: 'https://swiftstudents.tw',
  discordUrl: 'https://discord.gg/REPLACE_ME',
  github: 'https://github.com/swift-students-taiwan',
  email: 'hello@swiftstudents.tw',
} as const;
```

- [ ] **Step 7: 建立暫時首頁 `src/pages/index.astro`（之後 Task 11 取代）**

```astro
---
---
<html lang="zh-Hant">
  <head><meta charset="utf-8" /><title>Swift Students Taiwan</title></head>
  <body><h1>Swift Students Taiwan — scaffolding</h1></body>
</html>
```

- [ ] **Step 8: 安裝相依套件並初始化 git**

Run:
```bash
npm install
git init
git add -A
git commit -m "chore: scaffold Astro project with i18n + sitemap config"
```
Expected: `npm install` 成功；git 完成第一個 commit。

- [ ] **Step 9: 驗證 build 成功**

Run: `npm run build`
Expected: build 成功，產生 `dist/index.html`。

---

## Task 2: i18n 字典與型別（`src/i18n/ui.ts`）

**Files:**
- Create: `src/i18n/ui.ts`

- [ ] **Step 1: 建立 `src/i18n/ui.ts`（完整字典）**

```ts
export const languages = { 'zh-Hant': '繁體中文', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'zh-Hant';

export const ui: Record<Lang, Record<string, string>> = {
  'zh-Hant': {
    'a11y.skip': '跳到主要內容',
    'nav.about': '關於',
    'nav.events': '活動',
    'nav.activities': '過往活動',
    'nav.contact': '加入我們',
    'hero.tagline': '台灣學生 Apple 開發者社群 — 一起學習、分享，做出自己的作品。',
    'hero.cta_primary': '加入 Discord',
    'hero.cta_secondary': '查看活動',
    'about.heading': '關於我們',
    'about.body': '我們是一群熱愛 Swift 與 Apple 平台的台灣學生，定期舉辦工作坊、讀書會與交流活動，幫助彼此成長。',
    'about.p1_title': '一起學習',
    'about.p1_body': '從 SwiftUI 到 Swift Student Challenge，互相分享資源與經驗。',
    'about.p2_title': '互相啟發',
    'about.p2_body': '展示作品、交換點子，在社群裡找到一起做專案的夥伴。',
    'about.p3_title': '連結社群',
    'about.p3_body': '跨校交流，認識全台灣對 Apple 開發有熱情的同學。',
    'about.disclaimer': '本社群為獨立、志工經營，與 Apple Inc. 無關。',
    'highlights.heading': '精選活動',
    'events.heading': '即將舉辦',
    'events.intro': '接下來的工作坊、聚會與分享。',
    'events.empty': '敬請期待，活動籌備中。',
    'activities.heading': '過往活動',
    'activities.heading_home': '近期活動回顧',
    'activities.intro': '我們辦過的工作坊、讀書會與聚會。',
    'activities.empty': '還沒有過往活動，第一場即將到來。',
    'common.see_all': '看全部',
    'community.heading': '加入我們的社群',
    'community.body': '在 Discord 問問題、找夥伴、展示作品，得到大家的回饋。',
    'community.cta': '加入 Discord',
    'detail.back': '回活動列表',
    'detail.register': '報名 / 了解更多',
    'footer.tagline': '台灣學生 Apple 開發者社群',
    'footer.disclaimer': 'Not affiliated with Apple Inc.',
    'notfound.body': '找不到這個頁面。',
    'notfound.home': '回首頁',
    'meta.home_title': 'Swift Students Taiwan — 台灣學生 Apple 開發者社群',
    'meta.home_desc': '台灣學生 Apple 開發者社群，定期舉辦 Swift / SwiftUI 工作坊、讀書會與交流活動。',
    'meta.events_title': '即將舉辦的活動 — Swift Students Taiwan',
    'meta.events_desc': 'Swift Students Taiwan 即將舉辦的工作坊、聚會與分享活動。',
    'meta.activities_title': '過往活動 — Swift Students Taiwan',
    'meta.activities_desc': 'Swift Students Taiwan 舉辦過的工作坊、讀書會與聚會回顧。',
    'meta.notfound_title': '找不到頁面 — Swift Students Taiwan',
    'meta.notfound_desc': '找不到這個頁面。',
  },
  en: {
    'a11y.skip': 'Skip to main content',
    'nav.about': 'About',
    'nav.events': 'Events',
    'nav.activities': 'Activities',
    'nav.contact': 'Join us',
    'hero.tagline': 'A community for student Apple developers in Taiwan — learn, share, and build together.',
    'hero.cta_primary': 'Join Discord',
    'hero.cta_secondary': 'See events',
    'about.heading': 'About us',
    'about.body': 'We are Taiwanese students who love Swift and the Apple platforms. We run workshops, study jams, and meetups to help each other grow.',
    'about.p1_title': 'Learn together',
    'about.p1_body': 'From SwiftUI to the Swift Student Challenge, we share resources and experience.',
    'about.p2_title': 'Inspire each other',
    'about.p2_body': 'Show your work, swap ideas, and find teammates to build projects with.',
    'about.p3_title': 'Connect the community',
    'about.p3_body': 'Meet students across Taiwan who are passionate about Apple development.',
    'about.disclaimer': 'An independent, volunteer-run community. Not affiliated with Apple Inc.',
    'highlights.heading': 'Highlights',
    'events.heading': 'Upcoming events',
    'events.intro': 'Workshops, meetups, and talks coming up.',
    'events.empty': 'Nothing scheduled yet — stay tuned.',
    'activities.heading': 'Past activities',
    'activities.heading_home': 'Latest activities',
    'activities.intro': 'Workshops, study jams, and meetups we have run.',
    'activities.empty': 'No past activities yet — the first one is coming soon.',
    'common.see_all': 'See all',
    'community.heading': 'Join our community',
    'community.body': 'Ask questions, find teammates, and show your work on Discord.',
    'community.cta': 'Join our Discord',
    'detail.back': 'Back to activities',
    'detail.register': 'Register / learn more',
    'footer.tagline': 'A community for student Apple developers in Taiwan',
    'footer.disclaimer': 'Not affiliated with Apple Inc.',
    'notfound.body': "We couldn't find that page.",
    'notfound.home': 'Back to home',
    'meta.home_title': 'Swift Students Taiwan — student Apple developer community',
    'meta.home_desc': 'A community for student Apple developers in Taiwan. Swift / SwiftUI workshops, study jams, and meetups.',
    'meta.events_title': 'Upcoming events — Swift Students Taiwan',
    'meta.events_desc': 'Upcoming workshops, meetups, and talks from Swift Students Taiwan.',
    'meta.activities_title': 'Past activities — Swift Students Taiwan',
    'meta.activities_desc': 'Workshops, study jams, and meetups Swift Students Taiwan has run.',
    'meta.notfound_title': 'Page not found — Swift Students Taiwan',
    'meta.notfound_desc': "We couldn't find that page.",
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat(i18n): add bilingual UI string dictionary"
```

---

## Task 3: i18n 純函式（TDD，`src/i18n/utils.ts`）

**Files:**
- Test: `src/i18n/utils.test.ts`
- Create: `src/i18n/utils.ts`

- [ ] **Step 1: 先寫失敗測試 `src/i18n/utils.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  getLangFromUrl,
  useTranslations,
  localizePath,
  stripLocale,
  localizedPaths,
  getAltLangUrl,
  parseEventId,
} from './utils';

describe('getLangFromUrl', () => {
  it('returns en for /en paths', () => {
    expect(getLangFromUrl(new URL('https://x.tw/en'))).toBe('en');
    expect(getLangFromUrl(new URL('https://x.tw/en/events'))).toBe('en');
  });
  it('returns zh-Hant for root paths', () => {
    expect(getLangFromUrl(new URL('https://x.tw/'))).toBe('zh-Hant');
    expect(getLangFromUrl(new URL('https://x.tw/events'))).toBe('zh-Hant');
  });
  it('does not treat /energy as a locale', () => {
    expect(getLangFromUrl(new URL('https://x.tw/energy'))).toBe('zh-Hant');
  });
});

describe('stripLocale', () => {
  it('removes the en segment only', () => {
    expect(stripLocale('/en/events')).toBe('/events');
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/energy')).toBe('/energy');
    expect(stripLocale('/events')).toBe('/events');
    expect(stripLocale('/')).toBe('/');
  });
});

describe('localizePath', () => {
  it('keeps zh-Hant unprefixed', () => {
    expect(localizePath('/events', 'zh-Hant')).toBe('/events');
    expect(localizePath('/', 'zh-Hant')).toBe('/');
  });
  it('prefixes en', () => {
    expect(localizePath('/events', 'en')).toBe('/en/events');
    expect(localizePath('/', 'en')).toBe('/en');
  });
  it('is idempotent regardless of incoming locale prefix', () => {
    expect(localizePath('/en/events', 'zh-Hant')).toBe('/events');
    expect(localizePath('/en/events', 'en')).toBe('/en/events');
  });
});

describe('localizedPaths', () => {
  it('maps both locales from a zh path', () => {
    expect(localizedPaths('/events')).toEqual({ 'zh-Hant': '/events', en: '/en/events' });
  });
  it('maps both locales from an en path', () => {
    expect(localizedPaths('/en/events')).toEqual({ 'zh-Hant': '/events', en: '/en/events' });
  });
});

describe('getAltLangUrl', () => {
  it('switches en to zh', () => {
    expect(getAltLangUrl(new URL('https://x.tw/en/events'))).toBe('/events');
  });
  it('switches zh to en', () => {
    expect(getAltLangUrl(new URL('https://x.tw/events'))).toBe('/en/events');
  });
});

describe('useTranslations', () => {
  it('returns the string for a key', () => {
    expect(useTranslations('en')('nav.about')).toBe('About');
    expect(useTranslations('zh-Hant')('nav.about')).toBe('關於');
  });
  it('falls back to the key when missing', () => {
    expect(useTranslations('en')('does.not.exist')).toBe('does.not.exist');
  });
});

describe('parseEventId', () => {
  it('parses lang and slug from the collection id', () => {
    expect(parseEventId('en/2026-07-wwdc-recap')).toEqual({ lang: 'en', slug: '2026-07-wwdc-recap' });
    expect(parseEventId('zh-Hant/2026-07-wwdc-recap')).toEqual({ lang: 'zh-Hant', slug: '2026-07-wwdc-recap' });
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL — `Cannot find module './utils'`（或匯出不存在）。

- [ ] **Step 3: 實作 `src/i18n/utils.ts`**

```ts
import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return seg === 'en' ? 'en' : defaultLang;
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'en') segments.shift();
  return '/' + segments.join('/');
}

export function localizePath(path: string, lang: Lang): string {
  const withSlash = path.startsWith('/') ? path : '/' + path;
  const logical = stripLocale(withSlash);
  if (lang === 'en') return logical === '/' ? '/en' : '/en' + logical;
  return logical;
}

export function localizedPaths(pathname: string): Record<Lang, string> {
  return {
    'zh-Hant': localizePath(pathname, 'zh-Hant'),
    en: localizePath(pathname, 'en'),
  };
}

export function getAltLangUrl(url: URL): string {
  const lang = getLangFromUrl(url);
  const other: Lang = lang === 'en' ? 'zh-Hant' : 'en';
  return localizePath(url.pathname, other);
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

export function parseEventId(id: string): { lang: Lang; slug: string } {
  const [first, ...rest] = id.split('/');
  const lang: Lang = first === 'en' ? 'en' : 'zh-Hant';
  return { lang, slug: rest.join('/') };
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS（所有 utils 測試綠燈）。

- [ ] **Step 5: Commit**

```bash
git add src/i18n/utils.ts src/i18n/utils.test.ts
git commit -m "feat(i18n): add tested lang/path/translation helpers"
```

---

## Task 4: 設計系統與全域樣式（`src/styles/global.css`）

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: 建立 `src/styles/global.css`**

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #fafafa;
  --color-text: #1d1d1f;
  --color-text-muted: #6e6e73;
  --color-border: rgba(0, 0, 0, 0.1);
  --color-accent: #f05138;
  --color-accent-hover: #d83c24;
  --color-accent-ink: #993c1d;
  --color-accent-soft: #fbede9;

  --font-sans: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;

  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-6: 3rem;
  --space-8: 4rem;
  --space-12: 6rem;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  --maxw: 1080px;

  --fs-hero: clamp(2.5rem, 6vw, 4.5rem);
  --fs-h2: clamp(1.6rem, 3vw, 2.25rem);
  --fs-h3: 1.25rem;
  --fs-body: 1.0625rem;
  --fs-small: 0.875rem;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: 1.7;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; display: block; }
h1, h2, h3 { font-weight: 500; line-height: 1.15; letter-spacing: -0.01em; margin: 0; }
h2 { font-size: var(--fs-h2); }
h3 { font-size: var(--fs-h3); }
p { margin: 0; }

.container { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--space-3); }
.section { padding-block: var(--space-12); }
.muted { color: var(--color-text-muted); }

.btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font: inherit; font-size: var(--fs-small); font-weight: 500;
  padding: 0.7rem 1.25rem; border-radius: var(--radius-pill);
  border: 1px solid transparent; cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.btn--primary { background: var(--color-accent); color: #fff; }
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--ghost { border-color: var(--color-border); color: var(--color-text); }
.btn--ghost:hover { border-color: var(--color-text); }

.link-accent { color: var(--color-accent); font-weight: 500; }
.link-accent:hover { text-decoration: underline; }

:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; border-radius: 4px; }

.skip-link {
  position: absolute; left: -9999px; top: 0;
  background: var(--color-text); color: #fff;
  padding: 0.5rem 1rem; border-radius: 0 0 var(--radius-sm) 0; z-index: 100;
}
.skip-link:focus { left: 0; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(style): add design tokens and base styles"
```

---

## Task 5: Layout（head / SEO / hreflang）

**Files:**
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro`（暫時改用 Layout 以驗證）

- [ ] **Step 1: 建立 `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { localizedPaths, useTranslations } from '../i18n/utils';
import { SITE } from '../config';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang;
  title: string;
  description: string;
  image?: string;
}
const { lang, title, description, image } = Astro.props;
const t = useTranslations(lang);

const canonical = new URL(Astro.url.pathname, SITE.url).href.replace(/\/$/, '') || SITE.url;
const paths = localizedPaths(Astro.url.pathname);
const zhHref = new URL(paths['zh-Hant'], SITE.url).href;
const enHref = new URL(paths.en, SITE.url).href;
const htmlLang = lang === 'en' ? 'en' : 'zh-Hant';
const ogImage = image ? new URL(image, SITE.url).href : undefined;
---
<!doctype html>
<html lang={htmlLang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang="zh-Hant" href={zhHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={zhHref} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="sitemap" href="/sitemap-index.xml" />
  </head>
  <body>
    <a class="skip-link" href="#main">{t('a11y.skip')}</a>
    <Header lang={lang} />
    <main id="main">
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>
```

- [ ] **Step 2: 暫時改寫 `src/pages/index.astro` 以驗證 Layout**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout lang="zh-Hant" title="Swift Students Taiwan" description="scaffolding">
  <section class="section"><div class="container"><h1>Layout OK</h1></div></section>
</Layout>
```

（此步驟依賴 Task 6 的 Header / Footer；若先做本任務會 build 失敗，請與 Task 6 連續執行，最後一起驗證。）

- [ ] **Step 3: Commit（與 Task 6 合併驗證後）**

```bash
git add src/layouts/Layout.astro src/pages/index.astro
git commit -m "feat(layout): add base Layout with SEO + hreflang head"
```

---

## Task 6: Header、Footer、語言切換

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: 建立 `src/components/Header.astro`**

```astro
---
import { useTranslations, localizePath, getAltLangUrl } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import { SITE } from '../config';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const home = localizePath('/', lang);
const altUrl = getAltLangUrl(Astro.url);
const altLabel = lang === 'en' ? '繁中' : 'EN';
const nav = [
  { href: home === '/' ? '/#about' : home + '#about', label: t('nav.about') },
  { href: localizePath('/events', lang), label: t('nav.events') },
  { href: localizePath('/activities', lang), label: t('nav.activities') },
];
---
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href={home}>{SITE.name}</a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false" data-nav-toggle>
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" data-nav aria-label="Primary">
      {nav.map((item) => <a href={item.href}>{item.label}</a>)}
      <a class="lang-toggle" href={altUrl} aria-label="Switch language" hreflang={lang === 'en' ? 'zh-Hant' : 'en'}>{altLabel}</a>
      <a class="btn btn--primary nav-cta" href={SITE.discordUrl}>{t('nav.contact')}</a>
    </nav>
  </div>
</header>
<script>
  const btn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  btn?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(!!open));
  });
</script>
<style>
  .site-header {
    position: sticky; top: 0; z-index: 50;
    background: color-mix(in srgb, var(--color-bg) 85%, transparent);
    backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid var(--color-border);
  }
  .site-header__inner { display: flex; align-items: center; justify-content: space-between; min-height: 60px; }
  .brand { font-weight: 500; font-size: 1.05rem; letter-spacing: -0.01em; }
  .site-nav { display: flex; align-items: center; gap: 1.5rem; font-size: var(--fs-small); }
  .site-nav a { color: var(--color-text-muted); }
  .site-nav a:hover { color: var(--color-text); }
  .lang-toggle { font-weight: 500; color: var(--color-accent) !important; }
  .nav-cta { color: #fff !important; }
  .nav-toggle { display: none; }
  @media (max-width: 768px) {
    .nav-toggle {
      display: inline-flex; flex-direction: column; gap: 4px;
      background: none; border: 0; cursor: pointer; padding: 8px;
    }
    .nav-toggle span { width: 22px; height: 2px; background: var(--color-text); display: block; }
    .site-nav {
      position: absolute; top: 60px; left: 0; right: 0;
      flex-direction: column; align-items: flex-start; gap: 1rem;
      background: var(--color-bg); border-bottom: 1px solid var(--color-border);
      padding: 1.25rem var(--space-3); display: none;
    }
    .site-nav.is-open { display: flex; }
  }
</style>
```

- [ ] **Step 2: 建立 `src/components/Footer.astro`**

```astro
---
import { useTranslations, localizePath, getAltLangUrl } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import { SITE } from '../config';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const altUrl = getAltLangUrl(Astro.url);
const altLabel = lang === 'en' ? '繁體中文' : 'English';
const year = 2026;
---
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div>
      <p class="brand">{SITE.name}</p>
      <p class="muted">{t('footer.tagline')}</p>
    </div>
    <nav class="footer-links" aria-label="Footer">
      <a href={localizePath('/events', lang)}>{t('nav.events')}</a>
      <a href={localizePath('/activities', lang)}>{t('nav.activities')}</a>
      <a href={SITE.discordUrl}>Discord</a>
      <a href={altUrl} hreflang={lang === 'en' ? 'zh-Hant' : 'en'}>{altLabel}</a>
    </nav>
  </div>
  <div class="container site-footer__bottom">
    <span class="muted">© {year} {SITE.name}</span>
    <span class="muted">{t('footer.disclaimer')}</span>
  </div>
</footer>
<style>
  .site-footer { border-top: 1px solid var(--color-border); margin-top: var(--space-12); }
  .site-footer__inner {
    display: flex; flex-wrap: wrap; gap: var(--space-4);
    justify-content: space-between; padding-block: var(--space-6) var(--space-3);
  }
  .brand { font-weight: 500; }
  .footer-links { display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: var(--fs-small); }
  .footer-links a { color: var(--color-text-muted); }
  .footer-links a:hover { color: var(--color-text); }
  .site-footer__bottom {
    display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; justify-content: space-between;
    padding-block: var(--space-3) var(--space-6); font-size: var(--fs-small);
  }
</style>
```

- [ ] **Step 3: 驗證型別與 build**

Run: `npm run check && npm run build`
Expected: 兩者皆成功；`dist/index.html` 含 header / footer / hreflang。

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/components/Header.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat(layout): add Header, Footer, language toggle"
```

---

## Task 7: 內容集合與範例內容

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/events/zh-Hant/*.md`、`src/content/events/en/*.md`（5 場 × 2 語言 = 10 檔）

- [ ] **Step 1: 建立 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/events',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    registerUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { events };
```

- [ ] **Step 2: 建立繁中範例活動（5 檔，`src/content/events/zh-Hant/`）**

`2026-07-wwdc-recap.md`:
```markdown
---
title: "WWDC Recap for Swift Students"
date: 2026-07-25
location: "台北"
summary: "一起回顧今年 WWDC 的重點更新，並看看對學生開發者的影響。"
tags: ["WWDC", "分享會"]
featured: true
---

今年的 WWDC 帶來不少對學生開發者重要的更新。我們會用一個下午，從 SwiftUI、Swift 語言到開發工具，挑出最值得關注的部分一起討論。

歡迎帶著筆電一起動手玩玩看新 API，現場也會有時間互相交流與提問。
```

`2026-08-swiftui-workshop.md`:
```markdown
---
title: "SwiftUI 新手工作坊"
date: 2026-08-15
location: "新竹"
summary: "從零開始，用一個下午做出你的第一個 SwiftUI App。"
tags: ["SwiftUI", "工作坊", "新手"]
featured: true
---

完全沒寫過 Swift 也沒關係！這場工作坊會帶你從安裝 Xcode 開始，一步步做出一個可以執行的 SwiftUI App。

請自備 Mac。我們會準備範例專案與講義，讓你帶著作品回家。
```

`2026-09-ssc-prep.md`:
```markdown
---
title: "Swift Student Challenge 準備分享會"
date: 2026-09-20
location: "線上"
summary: "邀請往年入選者分享經驗，一起準備明年的 Swift Student Challenge。"
tags: ["Swift Student Challenge"]
---

Swift Student Challenge 是學生展現創意的好機會。這場線上分享會邀請往年入選的同學，聊聊他們的作品發想、製作過程與評選心得。

無論你是第一次參加還是想再挑戰，都歡迎來聽聽看。
```

`2026-03-ios-hackathon.md`:
```markdown
---
title: "跨校 iOS Hackathon"
date: 2026-03-08
location: "台中"
summary: "48 小時，跨校組隊，一起做出一個 iOS App。"
tags: ["Hackathon"]
featured: true
---

來自全台各校的同學齊聚台中，在 48 小時內組隊開發 iOS App。從發想、設計到實作，體驗完整的開發流程。

最後由各隊上台 demo，並由業界前輩給予回饋。
```

`2025-12-study-jam.md`:
```markdown
---
title: "年末讀書會"
date: 2025-12-14
location: "台北"
summary: "一起讀 Swift 官方文件，互相解惑、交流學習方法。"
tags: ["讀書會"]
---

年末的最後一場聚會，我們一起讀 Swift 官方文件，挑出大家常卡關的章節討論。

現場也聊了各自的學習方法與資源，為新的一年做準備。
```

- [ ] **Step 3: 建立英文範例活動（5 檔，`src/content/events/en/`，slug 與繁中一致）**

`2026-07-wwdc-recap.md`:
```markdown
---
title: "WWDC Recap for Swift Students"
date: 2026-07-25
location: "Taipei"
summary: "A recap of this year's key WWDC updates and what they mean for student developers."
tags: ["WWDC", "Talk"]
featured: true
---

This year's WWDC brought plenty of updates that matter to student developers. Over one afternoon we'll walk through the highlights — from SwiftUI and the Swift language to the developer tools.

Bring your laptop to try the new APIs hands-on. There will be time to chat and ask questions.
```

`2026-08-swiftui-workshop.md`:
```markdown
---
title: "SwiftUI Beginner Workshop"
date: 2026-08-15
location: "Hsinchu"
summary: "Start from scratch and build your first SwiftUI app in an afternoon."
tags: ["SwiftUI", "Workshop", "Beginner"]
featured: true
---

Never written Swift before? No problem. This workshop starts from installing Xcode and walks you step by step to a running SwiftUI app.

Bring a Mac. We'll provide a sample project and handouts so you leave with something you built.
```

`2026-09-ssc-prep.md`:
```markdown
---
title: "Swift Student Challenge Prep Session"
date: 2026-09-20
location: "Online"
summary: "Past winners share their experience as we prepare for next year's Swift Student Challenge."
tags: ["Swift Student Challenge"]
---

The Swift Student Challenge is a great chance for students to show their creativity. In this online session, past participants share how they came up with ideas, built their submissions, and what they learned.

Whether it's your first attempt or your next, you're welcome to join.
```

`2026-03-ios-hackathon.md`:
```markdown
---
title: "Inter-University iOS Hackathon"
date: 2026-03-08
location: "Taichung"
summary: "48 hours, cross-school teams, one iOS app."
tags: ["Hackathon"]
featured: true
---

Students from universities across Taiwan gathered in Taichung to build an iOS app in 48 hours — from ideation and design to implementation, experiencing the full development flow.

Each team demoed their work and got feedback from industry mentors.
```

`2025-12-study-jam.md`:
```markdown
---
title: "Year-end Study Jam"
date: 2025-12-14
location: "Taipei"
summary: "Read the official Swift docs together and swap study tips."
tags: ["Study jam"]
---

For the last meetup of the year, we read the official Swift documentation together and dug into the chapters people commonly get stuck on.

We also shared our own study methods and resources to kick off the new year.
```

- [ ] **Step 4: 驗證 schema 與 build**

Run: `npm run build`
Expected: build 成功；無 Zod schema 錯誤。

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat(content): add events collection and bilingual seed content"
```

---

## Task 8: 內容純函式（TDD，`src/lib/event-utils.ts`）+ Astro 包裝（`src/lib/events.ts`）

**Files:**
- Test: `src/lib/event-utils.test.ts`
- Create: `src/lib/event-utils.ts`, `src/lib/events.ts`

- [ ] **Step 1: 先寫失敗測試 `src/lib/event-utils.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { splitEvents } from './event-utils';

const ev = (iso: string) => ({ data: { date: new Date(iso) } });

describe('splitEvents', () => {
  const now = new Date('2026-06-16T00:00:00Z');

  it('splits upcoming (>= now) and past (< now)', () => {
    const { upcoming, past } = splitEvents([ev('2026-01-01'), ev('2026-12-01'), ev('2026-07-01')], now);
    expect(upcoming.map((e) => e.data.date.getFullYear())).toHaveLength(2);
    expect(past).toHaveLength(1);
    expect(past[0].data.date.toISOString().slice(0, 10)).toBe('2026-01-01');
  });

  it('sorts upcoming ascending and past descending', () => {
    const events = [ev('2026-08-01'), ev('2026-07-01'), ev('2026-03-01'), ev('2026-01-01')];
    const { upcoming, past } = splitEvents(events, now);
    expect(upcoming.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-07-01', '2026-08-01']);
    expect(past.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-03-01', '2026-01-01']);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test`
Expected: FAIL — `Cannot find module './event-utils'`。

- [ ] **Step 3: 實作 `src/lib/event-utils.ts`**

```ts
export interface DatedEntry {
  data: { date: Date };
}

export function splitEvents<T extends DatedEntry>(
  events: T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[] } {
  const upcoming = events
    .filter((e) => e.data.date.getTime() >= now.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const past = events
    .filter((e) => e.data.date.getTime() < now.getTime())
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return { upcoming, past };
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 實作 `src/lib/events.ts`（Astro 包裝，不寫單元測試）**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { parseEventId } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export type EventEntry = CollectionEntry<'events'>;

export function eventSlug(entry: EventEntry): string {
  return parseEventId(entry.id).slug;
}

export async function getEventsByLang(lang: Lang): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all
    .filter((e) => parseEventId(e.id).lang === lang)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat(events): add tested splitEvents and content helpers"
```

---

## Task 9: EventCard 與 EventList

**Files:**
- Create: `src/components/EventCard.astro`, `src/components/EventList.astro`

- [ ] **Step 1: 建立 `src/components/EventCard.astro`**

```astro
---
import type { EventEntry } from '../lib/events';
import { eventSlug } from '../lib/events';
import { localizePath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { entry: EventEntry; lang: Lang; }
const { entry, lang } = Astro.props;
const slug = eventSlug(entry);
const href = localizePath(`/events/${slug}`, lang);
const dateFmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-TW', {
  year: 'numeric', month: 'short', day: 'numeric',
}).format(entry.data.date);
---
<a class="card" href={href}>
  <div class="card__thumb" aria-hidden="true"><span>SS</span></div>
  <div class="card__body">
    <p class="card__meta muted">{dateFmt} · {entry.data.location}</p>
    <h3 class="card__title">{entry.data.title}</h3>
    <p class="card__summary muted">{entry.data.summary}</p>
  </div>
</a>
<style>
  .card {
    display: flex; flex-direction: column;
    border: 1px solid var(--color-border); border-radius: var(--radius-lg);
    overflow: hidden; background: var(--color-bg);
    transition: border-color .15s, transform .15s;
  }
  .card:hover { border-color: var(--color-text); transform: translateY(-2px); }
  .card__thumb {
    aspect-ratio: 16 / 9; background: var(--color-surface);
    display: flex; align-items: center; justify-content: center;
    color: var(--color-accent); font-weight: 500; font-size: 1.5rem; letter-spacing: 0.1em;
    border-bottom: 1px solid var(--color-border);
  }
  .card__body { padding: var(--space-3); display: flex; flex-direction: column; gap: 0.4rem; }
  .card__meta { font-size: var(--fs-small); }
  .card__summary { font-size: var(--fs-small); }
</style>
```

- [ ] **Step 2: 建立 `src/components/EventList.astro`**

```astro
---
import EventCard from './EventCard.astro';
import type { EventEntry } from '../lib/events';
import type { Lang } from '../i18n/ui';
import { useTranslations } from '../i18n/utils';

interface Props { events: EventEntry[]; lang: Lang; emptyKey?: string; }
const { events, lang, emptyKey = 'events.empty' } = Astro.props;
const t = useTranslations(lang);
---
{events.length === 0 ? (
  <p class="empty muted">{t(emptyKey)}</p>
) : (
  <div class="grid">
    {events.map((entry) => <EventCard entry={entry} lang={lang} />)}
  </div>
)}
<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--space-3);
  }
  .empty { padding-block: var(--space-4); }
</style>
```

- [ ] **Step 3: 驗證 build**

Run: `npm run check && npm run build`
Expected: 成功（元件尚未被任何頁面引用，但型別需正確）。

- [ ] **Step 4: Commit**

```bash
git add src/components/EventCard.astro src/components/EventList.astro
git commit -m "feat(components): add EventCard and EventList"
```

---

## Task 10: Hero、AboutSection、Highlights、CommunityCTA

**Files:**
- Create: `src/components/Hero.astro`, `src/components/AboutSection.astro`, `src/components/Highlights.astro`, `src/components/CommunityCTA.astro`

- [ ] **Step 1: 建立 `src/components/Hero.astro`**

```astro
---
import { useTranslations, localizePath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import { SITE } from '../config';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
---
<section class="hero">
  <div class="container">
    <h1 class="hero__title">{SITE.name}</h1>
    <p class="hero__tagline muted">{t('hero.tagline')}</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href={SITE.discordUrl}>{t('hero.cta_primary')}</a>
      <a class="btn btn--ghost" href={localizePath('/events', lang)}>{t('hero.cta_secondary')}</a>
    </div>
  </div>
</section>
<style>
  .hero { padding-block: clamp(4rem, 12vw, 9rem); }
  .hero__title { font-size: var(--fs-hero); max-width: 16ch; }
  .hero__tagline { font-size: clamp(1.1rem, 2.5vw, 1.5rem); margin-top: var(--space-2); max-width: 46ch; }
  .hero__actions { display: flex; flex-wrap: wrap; gap: var(--space-1); margin-top: var(--space-4); }
</style>
```

- [ ] **Step 2: 建立 `src/components/AboutSection.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const points = [
  { title: t('about.p1_title'), body: t('about.p1_body') },
  { title: t('about.p2_title'), body: t('about.p2_body') },
  { title: t('about.p3_title'), body: t('about.p3_body') },
];
---
<section id="about" class="section">
  <div class="container">
    <div class="about__intro">
      <h2>{t('about.heading')}</h2>
      <p class="muted">{t('about.body')}</p>
    </div>
    <div class="about__grid">
      {points.map((p) => (
        <div class="about__point">
          <h3>{p.title}</h3>
          <p class="muted">{p.body}</p>
        </div>
      ))}
    </div>
    <p class="about__disclaimer muted">{t('about.disclaimer')}</p>
  </div>
</section>
<style>
  .about__intro { max-width: 52ch; }
  .about__grid {
    display: grid; gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    margin-top: var(--space-6);
  }
  .about__point h3 { margin-bottom: 0.4rem; }
  .about__disclaimer { font-size: var(--fs-small); margin-top: var(--space-6); }
</style>
```

- [ ] **Step 3: 建立 `src/components/Highlights.astro`**

```astro
---
import EventList from './EventList.astro';
import { getEventsByLang } from '../lib/events';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const events = (await getEventsByLang(lang)).filter((e) => e.data.featured).slice(0, 3);
---
{events.length > 0 && (
  <section class="section">
    <div class="container">
      <h2>{t('highlights.heading')}</h2>
      <div class="highlights__list">
        <EventList events={events} lang={lang} />
      </div>
    </div>
  </section>
)}
<style>
  .highlights__list { margin-top: var(--space-4); }
</style>
```

- [ ] **Step 4: 建立 `src/components/CommunityCTA.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
import { SITE } from '../config';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
---
<section class="section">
  <div class="container">
    <div class="cta">
      <h2>{t('community.heading')}</h2>
      <p class="muted">{t('community.body')}</p>
      <a class="btn btn--primary" href={SITE.discordUrl}>{t('community.cta')}</a>
    </div>
  </div>
</section>
<style>
  .cta {
    background: var(--color-accent-soft); border-radius: var(--radius-lg);
    padding: clamp(2rem, 6vw, 4rem); text-align: center;
  }
  .cta h2 { color: var(--color-accent-ink); }
  .cta p { margin-top: 0.5rem; }
  .cta .btn { margin-top: var(--space-3); }
</style>
```

- [ ] **Step 5: 驗證 build**

Run: `npm run check && npm run build`
Expected: 成功。

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/components/AboutSection.astro src/components/Highlights.astro src/components/CommunityCTA.astro
git commit -m "feat(components): add Hero, About, Highlights, Community sections"
```

---

## Task 11: 首頁（HomeContent + 兩語系頁面）

**Files:**
- Create: `src/components/pages/HomeContent.astro`, `src/pages/en/index.astro`
- Modify: `src/pages/index.astro`（取代暫時版）

- [ ] **Step 1: 建立 `src/components/pages/HomeContent.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import Hero from '../Hero.astro';
import AboutSection from '../AboutSection.astro';
import Highlights from '../Highlights.astro';
import CommunityCTA from '../CommunityCTA.astro';
import EventList from '../EventList.astro';
import { getEventsByLang } from '../../lib/events';
import { splitEvents } from '../../lib/event-utils';
import { useTranslations, localizePath } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const { upcoming, past } = splitEvents(await getEventsByLang(lang));
const upcomingPreview = upcoming.slice(0, 3);
const pastPreview = past.slice(0, 4);
---
<Layout lang={lang} title={t('meta.home_title')} description={t('meta.home_desc')}>
  <Hero lang={lang} />
  <AboutSection lang={lang} />
  <Highlights lang={lang} />

  <section class="section">
    <div class="container">
      <div class="section-head">
        <h2>{t('events.heading')}</h2>
        <a class="link-accent" href={localizePath('/events', lang)}>{t('common.see_all')} →</a>
      </div>
      <div class="section-head__list">
        <EventList events={upcomingPreview} lang={lang} emptyKey="events.empty" />
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <h2>{t('activities.heading_home')}</h2>
        <a class="link-accent" href={localizePath('/activities', lang)}>{t('common.see_all')} →</a>
      </div>
      <div class="section-head__list">
        <EventList events={pastPreview} lang={lang} emptyKey="activities.empty" />
      </div>
    </div>
  </section>

  <CommunityCTA lang={lang} />
</Layout>
<style>
  .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  .section-head__list { margin-top: var(--space-4); }
</style>
```

- [ ] **Step 2: 取代 `src/pages/index.astro`**

```astro
---
import HomeContent from '../components/pages/HomeContent.astro';
---
<HomeContent lang="zh-Hant" />
```

- [ ] **Step 3: 建立 `src/pages/en/index.astro`**

```astro
---
import HomeContent from '../../components/pages/HomeContent.astro';
---
<HomeContent lang="en" />
```

- [ ] **Step 4: 驗證**

Run: `npm run build`
Expected: 產生 `dist/index.html` 與 `dist/en/index.html`，皆含 hero / about / 即將 / 過往 / community。

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/HomeContent.astro src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(pages): add bilingual homepage"
```

---

## Task 12: 活動列表頁（即將 / 過往，兩語系）

**Files:**
- Create: `src/components/pages/EventsListContent.astro`, `src/components/pages/ActivitiesListContent.astro`
- Create: `src/pages/events.astro`, `src/pages/activities.astro`, `src/pages/en/events.astro`, `src/pages/en/activities.astro`

- [ ] **Step 1: 建立 `src/components/pages/EventsListContent.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import EventList from '../EventList.astro';
import { getEventsByLang } from '../../lib/events';
import { splitEvents } from '../../lib/event-utils';
import { useTranslations } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const { upcoming } = splitEvents(await getEventsByLang(lang));
---
<Layout lang={lang} title={t('meta.events_title')} description={t('meta.events_desc')}>
  <section class="section">
    <div class="container">
      <h1>{t('events.heading')}</h1>
      <p class="muted">{t('events.intro')}</p>
      <div class="list">
        <EventList events={upcoming} lang={lang} emptyKey="events.empty" />
      </div>
    </div>
  </section>
</Layout>
<style>
  .list { margin-top: var(--space-6); }
</style>
```

- [ ] **Step 2: 建立 `src/components/pages/ActivitiesListContent.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import EventList from '../EventList.astro';
import { getEventsByLang } from '../../lib/events';
import { splitEvents } from '../../lib/event-utils';
import { useTranslations } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';

const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const { past } = splitEvents(await getEventsByLang(lang));
---
<Layout lang={lang} title={t('meta.activities_title')} description={t('meta.activities_desc')}>
  <section class="section">
    <div class="container">
      <h1>{t('activities.heading')}</h1>
      <p class="muted">{t('activities.intro')}</p>
      <div class="list">
        <EventList events={past} lang={lang} emptyKey="activities.empty" />
      </div>
    </div>
  </section>
</Layout>
<style>
  .list { margin-top: var(--space-6); }
</style>
```

- [ ] **Step 3: 建立四個薄頁面**

`src/pages/events.astro`:
```astro
---
import EventsListContent from '../components/pages/EventsListContent.astro';
---
<EventsListContent lang="zh-Hant" />
```

`src/pages/activities.astro`:
```astro
---
import ActivitiesListContent from '../components/pages/ActivitiesListContent.astro';
---
<ActivitiesListContent lang="zh-Hant" />
```

`src/pages/en/events.astro`:
```astro
---
import EventsListContent from '../../components/pages/EventsListContent.astro';
---
<EventsListContent lang="en" />
```

`src/pages/en/activities.astro`:
```astro
---
import ActivitiesListContent from '../../components/pages/ActivitiesListContent.astro';
---
<ActivitiesListContent lang="en" />
```

- [ ] **Step 4: 驗證**

Run: `npm run build`
Expected: 產生 `dist/events/`, `dist/activities/`, `dist/en/events/`, `dist/en/activities/`。

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/EventsListContent.astro src/components/pages/ActivitiesListContent.astro src/pages/events.astro src/pages/activities.astro src/pages/en/events.astro src/pages/en/activities.astro
git commit -m "feat(pages): add bilingual events and activities list pages"
```

---

## Task 13: 活動詳情頁（兩語系，動態路由）

**Files:**
- Create: `src/components/pages/EventDetailContent.astro`, `src/pages/events/[slug].astro`, `src/pages/en/events/[slug].astro`

- [ ] **Step 1: 建立 `src/components/pages/EventDetailContent.astro`**

```astro
---
import { render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import type { EventEntry } from '../../lib/events';
import { useTranslations, localizePath } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';
import { SITE } from '../../config';

interface Props { lang: Lang; entry: EventEntry; }
const { lang, entry } = Astro.props;
const t = useTranslations(lang);
const { Content } = await render(entry);
const dateFmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric',
}).format(entry.data.date);
---
<Layout lang={lang} title={`${entry.data.title} · ${SITE.name}`} description={entry.data.summary}>
  <article class="section">
    <div class="container article">
      <a class="link-accent" href={localizePath('/activities', lang)}>← {t('detail.back')}</a>
      <h1 class="article__title">{entry.data.title}</h1>
      <p class="muted article__meta">{dateFmt} · {entry.data.location}</p>
      {entry.data.registerUrl && (
        <a class="btn btn--primary article__cta" href={entry.data.registerUrl}>{t('detail.register')}</a>
      )}
      <div class="prose">
        <Content />
      </div>
    </div>
  </article>
</Layout>
<style>
  .article { max-width: 720px; }
  .article__title { margin-top: var(--space-3); }
  .article__meta { margin-top: 0.5rem; }
  .article__cta { margin-top: var(--space-3); }
  .prose { margin-top: var(--space-4); }
  .prose :global(p) { margin-block: var(--space-2); }
  .prose :global(h2) { font-size: var(--fs-h3); margin-top: var(--space-4); }
</style>
```

- [ ] **Step 2: 建立 `src/pages/events/[slug].astro`**

```astro
---
import EventDetailContent from '../../components/pages/EventDetailContent.astro';
import { getEventsByLang, eventSlug } from '../../lib/events';

export async function getStaticPaths() {
  const events = await getEventsByLang('zh-Hant');
  return events.map((entry) => ({ params: { slug: eventSlug(entry) }, props: { entry } }));
}

const { entry } = Astro.props;
---
<EventDetailContent lang="zh-Hant" entry={entry} />
```

- [ ] **Step 3: 建立 `src/pages/en/events/[slug].astro`**

```astro
---
import EventDetailContent from '../../../components/pages/EventDetailContent.astro';
import { getEventsByLang, eventSlug } from '../../../lib/events';

export async function getStaticPaths() {
  const events = await getEventsByLang('en');
  return events.map((entry) => ({ params: { slug: eventSlug(entry) }, props: { entry } }));
}

const { entry } = Astro.props;
---
<EventDetailContent lang="en" entry={entry} />
```

- [ ] **Step 4: 驗證**

Run: `npm run build`
Expected: 產生 `dist/events/2026-07-wwdc-recap/index.html` 等 5 頁，及 `dist/en/events/<slug>/` 對應 5 頁。

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/EventDetailContent.astro src/pages/events/ src/pages/en/events/
git commit -m "feat(pages): add bilingual event detail pages"
```

---

## Task 14: 404、靜態資源、README、最終驗收

**Files:**
- Create: `src/pages/404.astro`, `public/robots.txt`, `public/favicon.svg`, `README.md`

- [ ] **Step 1: 建立 `src/pages/404.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { getLangFromUrl, useTranslations, localizePath } from '../i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---
<Layout lang={lang} title={t('meta.notfound_title')} description={t('meta.notfound_desc')}>
  <section class="section">
    <div class="container notfound">
      <h1>404</h1>
      <p class="muted">{t('notfound.body')}</p>
      <a class="btn btn--primary" href={localizePath('/', lang)}>{t('notfound.home')}</a>
    </div>
  </section>
</Layout>
<style>
  .notfound { text-align: center; padding-block: var(--space-12); }
  .notfound .btn { margin-top: var(--space-3); }
</style>
```

- [ ] **Step 2: 建立 `public/robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://swiftstudents.tw/sitemap-index.xml
```

- [ ] **Step 3: 建立 `public/favicon.svg`（SS 字標，Swift 橘）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f05138"/>
  <text x="32" y="43" font-family="-apple-system, system-ui, sans-serif" font-size="30" font-weight="600" fill="#ffffff" text-anchor="middle">SS</text>
</svg>
```

- [ ] **Step 4: 建立 `README.md`**

````markdown
# Swift Students Taiwan

台灣學生 Apple 開發者社群官網。Astro 靜態網站，繁中（`/`）與英文（`/en`）雙語，部署於 Cloudflare Pages。

## 開發

```bash
npm install
npm run dev      # http://localhost:4321
```

## 指令

- `npm run dev` — 開發伺服器（熱重載）
- `npm run build` — 產生靜態站到 `dist/`
- `npm run preview` — 本地預覽 build 結果
- `npm run check` — TypeScript / Astro 型別檢查
- `npm test` — Vitest 單元測試

## 新增活動

在 `src/content/events/zh-Hant/` 與 `src/content/events/en/` 各放一個同檔名的 Markdown：

```markdown
---
title: "活動名稱"
date: 2026-10-01           # 早於今天 → 過往活動；今天(含)之後 → 即將舉辦
location: "台北"
summary: "一句話摘要。"
tags: ["工作坊"]
featured: false            # true 會出現在首頁「精選活動」
registerUrl: "https://..." # 選填，詳情頁出現報名按鈕
---

活動詳情內文…
```

## 設定

站台常數（站名、Discord 連結、Email、GitHub）在 `src/config.ts`。
**部署前請把 `discordUrl` 換成真實邀請連結。**

## 部署（Cloudflare Pages）

連接此 git repo，設定：

- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- 自訂網域: `swiftstudents.tw`
````

- [ ] **Step 5: 最終全套驗收**

Run: `npm test && npm run check && npm run build`
Expected: 測試全綠、型別無誤、build 成功；`dist/` 應包含：
`index.html`、`en/index.html`、`events/`、`activities/`、`en/events/`、`en/activities/`、各 5 場活動詳情（中英）、`404.html`、`sitemap-index.xml`、`robots.txt`、`favicon.svg`。

- [ ] **Step 6: 本地手動驗收（dev server）**

Run: `npm run dev`，瀏覽器開 `http://localhost:4321`
檢查清單：
- 首頁繁中正常；點 EN 切到 `/en` 且內容變英文。
- 導覽 About 捲到 `#about`；Events / Activities 連結正確。
- 活動卡片可點進詳情；詳情頁「回活動列表」可回。
- 語言切換在列表頁、詳情頁都切到對應語言的同一頁。
- 手機寬度下導覽列收成漢堡選單可展開。

- [ ] **Step 7: Commit**

```bash
git add src/pages/404.astro public/ README.md
git commit -m "feat: add 404, robots, favicon, README; finalize site"
```

---

## Self-Review

**1. Spec coverage（逐節對照）**
- 技術架構（Astro static + Cloudflare、i18n config、字體、accent）→ Task 1, 4 ✅
- 路由表（`/`、`/en`、events、activities、`/events/[slug]`、404）→ Task 11, 12, 13, 14 ✅
- i18n（ui.ts 字典、utils 純函式、hreflang、`<html lang>`、不自動重導、切換鈕）→ Task 2, 3, 5, 6 ✅
- 內容模型（glob loader、Zod schema、per-locale 檔、featured、日期分類、parseEventId）→ Task 7, 8 ✅
- 元件清單（Layout/Header/Footer/LanguageToggle/Hero/About/Highlights/EventCard/EventList/CommunityCTA）→ Task 5, 6, 9, 10 ✅（語言切換併入 Header/Footer）
- 視覺 design tokens → Task 4 ✅
- SEO（title/desc、canonical、hreflang、sitemap、robots、favicon、OG）→ Task 1, 5, 14 ✅
- 無障礙（skip link、lang、focus、語意標籤）→ Task 4, 5 ✅
- RWD（手機選單、auto-fit grid）→ Task 6, 9 ✅
- 邊界情況（空狀態、404、缺翻譯退回、Zod 驗證）→ Task 3, 9, 14；缺 heroImage：本版範例不含圖、卡片用 SS 佔位縮圖（schema 未含 heroImage 以簡化 v1）✅
- 測試（Vitest 純函式、astro check、astro build）→ Task 3, 8, 14 ✅
- 部署說明 → Task 14 README ✅
- 範例內容（5 場、中英成對、featured 混合）→ Task 7 ✅

  **與 spec 的差異（已對齊）：** spec 第 6 節列了 `heroImage`（選填）。為簡化 v1 並避免圖片資產管線，本計畫**先不放圖片**，活動卡片用「SS」字標佔位縮圖；`heroImage` 欄位延後到有真實圖片時再加。其餘與 spec 一致。

**2. Placeholder scan：** 無 TBD/TODO；所有步驟均含完整程式碼與指令。`discordUrl` 的 `REPLACE_ME` 是刻意的待填值，README 已標明部署前替換。

**3. Type consistency：** `Lang`（`'zh-Hant'|'en'`）全程一致；`EventEntry` 由 `lib/events.ts` 統一匯出；`splitEvents`/`getEventsByLang`/`eventSlug`/`parseEventId`/`localizePath`/`getAltLangUrl`/`useTranslations` 命名在各 Task 一致；`emptyKey` 為 `string`，`t(key: string)` 相容。

---

## 部署後 / 設計微調

骨架完成後，建議用 `npm run dev` 起本地站，再進行「對著真網站即時調設計」的迴圈（調 `global.css` tokens 與各元件 `<style>`）。深色模式、真實活動圖片、報名表單為 v1 範圍外的後續工作。
