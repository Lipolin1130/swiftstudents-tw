# Swift Students Taiwan 官網 — 設計規格（Design Spec）

- 日期：2026-06-16
- 狀態：待使用者審閱
- 參考站：https://swiftstudents.jp/en

## 1. 專案概述

為「Swift Students Taiwan」（台灣學生 Apple 開發者社群）打造一個對外的社群官網，風格與 swiftstudents.jp 類似，但內容針對台灣，並支援**繁體中文 / 英文**雙語切換。社群為全新成立，目前**沒有真實內容**，因此本站先以結構完整的範例／佔位內容呈現，方便日後替換。

品牌名稱：中英文統一使用 **Swift Students Taiwan**。

> 與 swiftstudents.jp 一致，本站為獨立、志工經營，**與 Apple Inc. 無關**；不使用 Apple 官方 Swift 鳥形 logo，改用中性原創文字標誌（wordmark）。

## 2. 目標與非目標

**目標（v1）**
- 多頁式社群官網：首頁、即將舉辦、過往活動、活動詳情頁。
- 繁中（預設）/ 英文 雙語，URL 分流（`/` 與 `/en`）。
- 簡約編輯風（Apple 官網味）+ Swift 橘 `#F05138` 點綴。
- 部署於 Cloudflare Pages，靜態輸出。
- SEO（hreflang、sitemap、OG）、RWD、基本無障礙。

**非目標（v1，未來再做）**
- 深色模式（design tokens 預留，但 v1 不實作）。
- 會員系統、登入、後台 CMS。
- 動態功能（表單送出、報名系統）——之後可用 Cloudflare Pages Functions 補。
- 自動依瀏覽器語言重導。

## 3. 技術架構

- **框架**：Astro（最新穩定版，Astro 5.x），`output: 'static'`。
- **託管**：Cloudflare Pages（接 git repo 自動 build；輸出 `dist/`）。
- **`astro.config.mjs`**
  - `site: 'https://swiftstudents.tw'`（canonical / sitemap / hreflang 絕對網址用）。
  - `i18n: { defaultLocale: 'zh-Hant', locales: ['zh-Hant', 'en'], routing: { prefixDefaultLocale: false } }`。
  - integrations：`@astrojs/sitemap`。
- **字體**：系統字體堆疊，零下載：
  `-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Segoe UI", system-ui, sans-serif`。
  等寬（小地方用）：`ui-monospace, "SF Mono", "JetBrains Mono", monospace`。
- **樣式**：原生 CSS + CSS 變數（design tokens）放於 `src/styles/global.css`，不引入 UI 框架。
- **語言**：TypeScript（`astro check` 型別檢查）。

## 4. 資訊架構與路由

| 頁面 | 繁中 | 英文 | 說明 |
|---|---|---|---|
| 首頁 | `/` | `/en` | 含 About 區塊錨點 `#about` |
| 即將舉辦 | `/events` | `/en/events` | 未來日期的活動列表 |
| 過往活動 | `/activities` | `/en/activities` | 已過日期的活動列表 |
| 活動詳情 | `/events/[slug]` | `/en/events/[slug]` | 即將／過往共用同一詳情路徑 |
| 404 | `/404` | （共用） | 本地化文案依當前語言 |

- **導覽列**：About（捲動至首頁 `#about`）· Events（`/events`）· Activities（`/activities`）· Contact（Discord 外連）+ 繁中·EN 切換鈕。
- **頁面組織**：採「明確的語系資料夾 + 共用區塊元件」。每個語系頁面檔案很薄（設定 `lang` 後渲染共用元件），HTML 結構只存在於共用元件中，避免重複。
  ```
  src/pages/
    index.astro              -> /
    events.astro             -> /events
    activities.astro         -> /activities
    events/[slug].astro      -> /events/:slug
    404.astro
    en/
      index.astro            -> /en
      events.astro           -> /en/events
      activities.astro       -> /en/activities
      events/[slug].astro    -> /en/events/:slug
  ```
- **活動實體統一**：「即將／過往」由 `date` 與 build 當下時間比較決定；詳情頁統一 `/(en/)events/[slug]`，兩個列表都連到此。

## 5. 國際化（i18n）

- **UI 字串字典**：`src/i18n/ui.ts`
  - `export const languages = { 'zh-Hant': '繁體中文', en: 'English' }`
  - `export const defaultLang = 'zh-Hant'`
  - `export const ui = { 'zh-Hant': { 'nav.about': '關於', ... }, en: { 'nav.about': 'About', ... } }`
- **工具函式**：`src/i18n/utils.ts`（純函式，會寫單元測試）
  - `getLangFromUrl(url: URL): 'zh-Hant' | 'en'` — 由路徑判斷語言。
  - `useTranslations(lang)` → `t(key)`；缺 key 時退回 `defaultLang`，再退回 key 本身。
  - `localizePath(path: string, lang): string` — 產生對應語系的路徑（繁中無前綴、英文加 `/en`）。
  - `getAltLangUrl(url: URL): string` — 給語言切換鈕用，回傳「當前頁的另一語言」URL。
- `<html lang>`：繁中為 `zh-Hant`、英文為 `en`。
- `<head>` 加入 `hreflang` alternate（`zh-Hant`、`en`、`x-default` 指向繁中）。
- **不做**自動語言重導；由切換鈕決定。

## 6. 內容模型（Content Collections）

- 使用 Astro 5 Content Layer 的 `glob()` loader，集合 `events`。
- **每場活動、每語言各一檔**（body 即該語言的詳情文章）：
  ```
  src/content/events/
    zh-Hant/2026-07-wwdc-recap.md
    en/2026-07-wwdc-recap.md
  ```
- `src/content.config.ts`：
  - `loader: glob({ pattern: '**/*.md', base: './src/content/events' })`
  - 條目 `id` 形如 `zh-Hant/2026-07-wwdc-recap`；以 helper `parseEventId(id)` 解析出 `{ lang, slug }`（不在 frontmatter 重複放 lang/slug）。
- **frontmatter schema（Zod 驗證）**：
  - `title: string`
  - `date: z.coerce.date()`
  - `endDate: z.coerce.date().optional()`
  - `location: string`
  - `summary: string`
  - `heroImage: image().optional()`（Astro 資產；缺省走預設佔位）
  - `tags: string[].default([])`
  - `registerUrl: string.url().optional()`
  - `featured: z.boolean().default(false)` — 首頁「Highlights 精選」取 `featured: true` 的活動。
- **列表分類**：`date >= 今日` → 即將；否則 → 過往（依日期排序）。
- **跨語言對應**：以 `slug` 比對，供語言切換在詳情頁切到對應文章。

## 7. 元件設計

站台常數（站名、Discord 連結、社群連結等）集中在 `src/config.ts`（含 `discordUrl` 佔位值，待替換）。以下元件皆為 `.astro`，接收 `lang` 並用 `t()` 取字串；`Layout` 放 `src/layouts/`，其餘放 `src/components/`：

- `Layout.astro`（`src/layouts/`）— base HTML、`<head>`（meta、canonical、hreflang、OG、favicon）、skip link、`Header`、`Footer`、`<slot/>`。
- `Header.astro` — wordmark、導覽、`LanguageToggle`、手機選單（無 JS 也可用的 details/summary 或極簡 JS）。
- `Footer.astro` — 連結、社群、`LanguageToggle`、「Not affiliated with Apple Inc.」、版權。
- `LanguageToggle.astro` — 用 `getAltLangUrl` 切到另一語言對應頁。
- `Hero.astro` — 標題、標語、主要 CTA（Join Discord）、次要 CTA（查看活動）。
- `AboutSection.astro` — 使命一句話 + 2–3 重點 + 與 Apple 無關小字。
- `Highlights.astro` — 取 `featured: true` 的活動（約 3 張卡）。
- `EventCard.astro` — 縮圖、日期、地點、標題、摘要；列表與首頁預覽共用。
- `EventList.astro` — `EventCard` 的 grid + 空狀態。
- `CommunityCTA.astro` — Discord 行動呼籲區塊。

## 8. 視覺設計系統

- **風格**：簡約編輯（Apple 官網味）。純白底、近黑字、大留白、細緻大字。
- **Design tokens（CSS 變數，`global.css`）**
  - 色：`--color-bg: #ffffff`、`--color-text: #1d1d1f`、`--color-text-muted: #6e6e73`、`--color-border: rgba(0,0,0,0.1)`、`--color-accent: #F05138`、`--color-accent-ink: #993C1D`、`--color-surface: #fafafa`。
  - 字級：模組化尺度（hero ~clamp(40px,6vw,72px) / h2 / h3 / body 17px / small）。
  - 間距、圓角（卡片 12–16px、按鈕 pill）、容器最大寬（~1080px）。
  - 字重只用 400 / 500（與簡約風一致）。
  - 變數命名預留深色模式（之後加 `prefers-color-scheme` 覆寫即可）。
- **點綴**：Swift 橘僅用於連結、主要按鈕、小標記、focus ring。

## 9. SEO / 無障礙 / RWD

- **SEO**：每頁本地化 `<title>`/`description`、canonical、`hreflang` alternate、OG/Twitter 標籤、`@astrojs/sitemap`、`public/robots.txt`、favicon。
- **無障礙**：語意化標籤、`<html lang>`、圖片 `alt`、可見 focus 樣式、skip-to-content、色彩對比達 WCAG AA。
- **RWD**：手機優先；導覽列在窄螢幕收為選單；grid 用 `auto-fit/minmax` 自適應。

## 10. 邊界情況與錯誤處理

- **無即將活動／無過往活動**：列表與首頁預覽顯示友善空狀態（繁中「敬請期待，活動籌備中」／英文對應）。
- **404**：`src/pages/404.astro`，文案依當前語言；提供回首頁連結。
- **缺 `heroImage`**：使用預設佔位圖（`src/assets/placeholder.svg` 之類），不破版。
- **缺翻譯 key**：`t()` 退回繁中 → 再退回 key 本身，不丟錯。
- **內容 frontmatter 不合法**：Zod 在 build 期報錯（fail fast）。
- **跨語言缺對應文章**：語言切換在找不到對應 slug 時，退回該語言的活動列表頁。

## 11. 測試策略

本站以靜態內容為主，測試聚焦在「會壞的邏輯」與「能否成功 build」：

- **單元測試（Vitest）**：i18n 純函式 `getLangFromUrl`、`useTranslations/t`、`localizePath`、`getAltLangUrl`、`parseEventId`。採 TDD：先寫測試。
- **型別檢查**：`astro check` 必須通過。
- **建置檢查**：`astro build` 必須成功（含 content schema 驗證、無壞連結匯入）。
- **手動驗收**：所有語系路由可開、語言切換正確對應、RWD 在手機/桌機正常、Lighthouse 大致良好。

## 12. 部署（Cloudflare Pages）

- 連接 git repo；Framework preset：Astro。
- Build 指令：`npm run build`；輸出目錄：`dist`。
- 自訂網域：`swiftstudents.tw`（已在 Cloudflare 託管）。
- `astro.config` 的 `site` 設為 `https://swiftstudents.tw`。
- 提供 README 說明在地開發（`npm install` / `npm run dev`）與部署設定。

## 13. 範例內容計畫（Seed content）

- 4–6 場範例活動，混合即將／過往，中英文成對：
  - 例：WWDC Recap for Swift Students（即將）、Swift Student Challenge 準備工作坊、新手 SwiftUI hackathon、讀書會、跨校交流等。
- 佔位縮圖（純色或簡單 SVG，無外部相依）。
- About / Highlights / Footer 之文案皆放範例字串，可直接替換。

## 14. 專案目錄結構

```
swiftstudents/
  astro.config.mjs
  package.json
  tsconfig.json
  vitest.config.ts
  public/
    robots.txt
    favicon.svg
  src/
    config.ts                （站名、discordUrl、社群連結等常數）
    content.config.ts
    content/events/{zh-Hant,en}/*.md
    i18n/{ui.ts, utils.ts, utils.test.ts}
    layouts/Layout.astro
    components/*.astro
    pages/{index, events, activities, 404}.astro
    pages/events/[slug].astro
    pages/en/{index, events, activities}.astro
    pages/en/events/[slug].astro
    styles/global.css
    assets/（佔位圖、wordmark）
  docs/superpowers/specs/2026-06-16-swift-students-taiwan-website-design.md
  README.md
```

## 15. 未來（v1 範圍外）

- 深色模式。
- 內容改用 MDX / 接 Headless CMS。
- 報名表單（Cloudflare Pages Functions）。
- 部落格 / 電子報。
- 站內搜尋、活動行事曆訂閱（.ics）。
