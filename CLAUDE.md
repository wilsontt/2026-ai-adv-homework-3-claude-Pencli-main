# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述
花卉電商 Demo（backend-project）— Node.js + Express 4 + better-sqlite3 + JWT + EJS + TailwindCSS 的全端電商示範專案。提供 REST API（/api/*）、EJS SSR 前台頁面與後台管理頁面；以 Vitest + Supertest 進行整合測試。

## 常用指令
| 指令 | 說明 |
|------|------|
| `npm start` | 先 build Tailwind CSS，再用 `node server.js` 啟動（預設 port 3001） |
| `npm run dev:server` | 純啟動 server（跳過 CSS build） |
| `npm run dev:css` | Tailwind CSS watch 模式 |
| `npm run css:build` | Tailwind CSS 壓縮輸出 `public/css/output.css` |
| `npm run openapi` | 從 JSDoc 註解產生 `openapi.json` |
| `npm test` | 執行 Vitest 整合測試（循序執行） |
| `npx vitest run tests/auth.test.js` | 執行單一測試檔（替換為目標檔名） |

## 架構

**入口分層**：`server.js` 僅處理 port 監聽與 `JWT_SECRET` 守衛；`app.js` 組裝所有 middleware 與路由，可直接被 Supertest `require`。

**路由層**（`src/routes/`）直接操作 DB，無獨立 controller 層。業務邏輯僅在 `src/services/ecpayService.js` 中抽出（CheckMacValue 演算法、AioCheckOut 參數組合、交易查詢）。

**資料庫**：`src/database.js` 在 `require` 時初始化所有 table 並 seed 資料，回傳 `db` singleton。啟用 WAL mode 與 `foreign_keys ON`。

**視圖**：EJS + layouts（`views/layouts/front.ejs` / `admin.ejs`）+ partials，SSR 頁面路由在 `src/routes/pageRoutes.js`。

## 環境變數

| 變數 | 說明 | 預設 |
|------|------|------|
| `JWT_SECRET` | **必填**，缺少時 server 直接 `process.exit(1)` | — |
| `ADMIN_EMAIL` | seed admin 帳號 | `admin@hexschool.com` |
| `ADMIN_PASSWORD` | seed admin 密碼 | `12345678` |
| `ECPAY_MERCHANT_ID` | 綠界商店代號 | — |
| `ECPAY_HASH_KEY` | 綠界 HashKey | — |
| `ECPAY_HASH_IV` | 綠界 HashIV | — |
| `ECPAY_ENV` | `staging` / `production` | `staging` |
| `BASE_URL` | 組 ECPay ReturnURL / ClientBackURL 的基底網址 | `http://localhost:3001` |
| `FRONTEND_URL` | CORS 允許的來源 | `http://localhost:3001` |
| `NODE_ENV` | 設為 `test` 時 bcrypt saltRounds 降為 1（加速測試） | — |

## 關鍵規則

- 所有 API 一律回傳統一信封格式：`{ data, error, message }`；成功時 `error: null`，失敗時 `data: null`，`error` 為常數字串（例 `VALIDATION_ERROR`、`UNAUTHORIZED`、`NOT_FOUND`、`CONFLICT`、`STOCK_INSUFFICIENT`、`INVALID_STATUS`、`CART_EMPTY`、`INTERNAL_ERROR`）。
- JWT 使用 HS256、7 天有效；payload 為 `{ userId, email, role }`；`JWT_SECRET` 缺失時 server.js 直接 `process.exit(1)`。
- 購物車支援「雙模式認證」：有 `Authorization: Bearer` 走 user_id 綁定、僅有 `X-Session-Id` header 走 session_id 綁定；Authorization 有但 token 無效直接回 401，不降級到 session。
- 金額（price、total_amount）一律以整數（新台幣元）儲存，DB 層有 `CHECK(price > 0)`、`CHECK(stock >= 0)`、`CHECK(quantity > 0)`。
- 訂單建立使用 `db.transaction()` 包裹：插入 orders、order_items、扣 products.stock、清空 cart_items，失敗會整筆 rollback。
- ECPay `MerchantTradeNo` 格式：`order_no` 去除 `-` 後取 16 碼 + `payment_no` 補零 2 碼（≤ 20 字元）；每次呼叫 `POST /api/orders/:id/payment` 會遞增 `payment_no`，確保重試時 MerchantTradeNo 唯一。
- 訂單有三條付款路徑，勿混淆：
  - `PATCH /api/orders/:id/pay`（body: `{ action: "success"|"fail" }`）— 模擬付款，**僅非 production 環境可用**。
  - `POST /api/orders/:id/payment` — 產生 ECPay AioCheckOut 表單參數（`action_url` + `params`），前端 POST 表單後導向綠界。
  - `POST /api/orders/:id/payment/query` — 主動向綠界查詢交易結果並同步訂單狀態。
- `POST /api/ecpay/notify`（ReturnURL callback）無需 JWT，以 `CheckMacValue` 驗簽；成功回傳純文字 `1|OK`（非 JSON），失敗回 `0|xxx`；非成功 RtnCode 也回 `1|OK` 避免綠界無限重試。
- SQLite 檔案（`database.sqlite`）在專案根目錄，跨測試與跨次啟動持久保存；需重設資料時刪除該檔再重啟即可重新 seed。
- 功能開發使用 docs/plans/ 記錄計畫；完成後移至 docs/plans/archive/。

## 測試

- 測試直接使用真實 SQLite（`app.js` require 後 DB 已初始化），**不 mock DB**。
- 所有測試檔**循序執行**（`fileParallelism: false`），執行順序固定於 `vitest.config.js`；測試間共用同一 DB 實例，注意跨測試資料狀態。
- `tests/setup.js` 提供 `getAdminToken()`、`registerUser()` 輔助函式供各測試 import。
- `ECPAY_*` 環境變數未設時，ECPay 測試需自行用 `generateCheckMacValue` 產生有效簽章再傳入（見 `tests/ecpay.test.js`）。

## 詳細文件
- ./docs/README.md — 項目介紹與快速開始
- ./docs/ARCHITECTURE.md — 架構、目錄結構、資料流
- ./docs/DEVELOPMENT.md — 開發規範、命名規則
- ./docs/FEATURES.md — 功能列表與完成狀態
- ./docs/TESTING.md — 測試規範與指南
- ./docs/CHANGELOG.md — 更新日誌
