# Swift Students Taiwan

台灣學生 Apple 開發者社群官網。Astro 靜態網站，繁中（`/`）與英文（`/en`）雙語，以 Cloudflare Workers 靜態資產部署。

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
image: "https://..."       # 選填，活動封面圖（卡片縮圖與詳情頁）
tags: ["工作坊"]
featured: false            # true 會出現在首頁「精選活動」
registerUrl: "https://..." # 選填，詳情頁出現報名按鈕
---

活動詳情內文…
```

繁中與英文檔名（slug）必須一致，語言切換才能對應到同一場活動。

## 設定

站台常數（站名、Discord 連結、Email、GitHub）在 `src/config.ts`。
**部署前請把 `discordUrl` 換成真實邀請連結。**

## 部署（Cloudflare Workers）

以 Cloudflare Workers 靜態資產（static assets）部署，透過 **Workers Builds** 連接此 git repo——push 到 `main` 會自動 `npm run build` 後 `wrangler deploy`。

設定在 `wrangler.jsonc`：

- `assets.directory`: `./dist`（build 輸出）
- `assets.not_found_handling`: `404-page`（以 `dist/404.html` 當 404 頁）
- Node 版本由 `.nvmrc` 指定為 `22`
- 自訂網域 `swiftstudents.tw` 掛在 `swiftstudents-tw` 這個 Worker（Worker → Settings → Domains & Routes → Custom Domain）

> ⚠️ `pages_build_output_dir` 是 Cloudflare **Pages** 專用欄位，本專案用的是 Workers，改用它會讓 `wrangler deploy` 失敗。
