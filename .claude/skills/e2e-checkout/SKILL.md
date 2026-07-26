---
name: e2e-checkout
description: 執行花漾生活電商的端對端購物流程測試，涵蓋登入、加入購物車、結帳、到 ECPay 綠界金流（網路ATM、台灣土地銀行）的完整流程，並在測試結束後附上截圖。
metadata:
  origin: project
  type: e2e-test
---

# E2E 購物流程測試 Skill

## 適用情境

當使用者要求執行以下任一情境時啟動本 Skill：

- 「執行 E2E 測試」
- 「跑購物流程測試」
- 「測試結帳流程」
- 「測試 ECPay 金流」
- `/e2e-checkout`

---

## 執行模式

**本 Skill 預設以 Auto Mode 執行**，不必為每個步驟詢問確認，直接依下列步驟推進。若發生非預期錯誤，切換 Plan Mode 與使用者討論後再繼續。

---

## 執行步驟

### Step 1 — 確認環境

1. 確認 `http://localhost:3001` 是否已有服務監聽（`lsof -i :3001 | grep LISTEN`）。
2. 若無，執行 `npm run dev:server`（背景執行），等待 3 秒後再繼續。
3. 確認 `@playwright/test` 套件已安裝（`npx playwright --version`）；若未安裝，執行 `npm install --save-dev @playwright/test`。
4. 確認 Chromium 瀏覽器已下載（`ls ~/.cache/ms-playwright/chromium-* 2>/dev/null || ls ~/Library/Caches/ms-playwright/chromium-* 2>/dev/null`）；若無，執行 `npx playwright install chromium`（需停用 sandbox）。

### Step 2 — 執行 Playwright 測試

執行指令：

```bash
npx playwright test e2e/checkout-ecpay.spec.js --project=chromium
```

- 若測試腳本不存在（`e2e/checkout-ecpay.spec.js`），先參照 [測試腳本規格](#測試腳本規格) 建立。
- 測試需停用 sandbox（`dangerouslyDisableSandbox: true`），因 Playwright 需存取 `~/Library/Caches`。
- 逾時設定：120 秒。

### Step 3 — 收集截圖

測試執行後，截圖儲存於 `e2e/` 目錄。收集以下檔案（若存在）：

| 截圖檔案 | 說明 |
|----------|------|
| `e2e/screenshot-ecpay-landing.png` | ECPay 金流頁初始畫面 |
| `e2e/screenshot-ecpay-atm-selected.png` | 選擇網路ATM + 台灣土地銀行後 |
| `e2e/screenshot-ecpay-result.png` | 點擊「前往付款」後的頁面 |
| `e2e/screenshot-final.png` | 點擊「測試付款請點此」後的最終狀態 |

使用 `SendUserFile` 工具一次傳送所有截圖給使用者。

### Step 4 — 回報結果

以下列格式向使用者回報：

```
## E2E 測試結果

- 測試狀態：[passed N / failed N]
- 執行時間：[秒數]
- 訂單編號：[從截圖或 console log 擷取]

### 各步驟狀況
| 步驟 | 結果 |
|------|------|
| 登入 | ✅ / ❌ |
| 加入購物車 | ✅ / ❌ |
| 結帳 → 建立訂單 | ✅ / ❌ |
| 導向 ECPay | ✅ / ❌ |
| 選擇網路ATM | ✅ / ❌ |
| 選擇台灣土地銀行 | ✅ / ❌ |
| 點擊前往付款 | ✅ / ❌ |
| ECPay Staging 測試付款 | ✅ / ❌ |

### 備註
[說明 ECPay Staging 限制、localhost 回調限制等非 bug 的預期行為]
```

---

## 測試腳本規格

若 `e2e/checkout-ecpay.spec.js` 不存在，依下列規格建立（同時需建立 `playwright.config.js`）：

### playwright.config.js

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    headless: false,
    viewport: { width: 1280, height: 800 },
    locale: 'zh-TW',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

### 測試流程（checkout-ecpay.spec.js）

流程依序：

1. **登入**：`/login` → `input[type="email"]` 填入帳號、`input[type="password"]` 填入密碼 → `button[type="submit"]` → 等待跳回 `/`
2. **加入購物車**：`/` → 等待 `button:has-text("加入購物車")` 出現 → 點擊第一個
3. **結帳**：`/cart` → 點擊「前往結帳」→ 等待跳轉 `/checkout`
4. **填寫收件資訊**：姓名 / Email / 地址 → 點擊「確認送出訂單」→ 等待跳轉 `/orders/:id`
5. **前往 ECPay**：點擊「前往付款」→ 以 `page.context().waitForEvent('page')` 接新分頁（或同頁跳轉）
6. **選擇網路ATM**：`targetPage.locator('text=網路ATM').first().click()`
7. **選擇台灣土地銀行**：找到可見的 `select` → `selectOption({ label: /土地/ })`
8. **點擊前往付款**：`page.evaluate()` 找到文字含「前往付款」的元素並 `.click()`
9. **Staging 測試付款**：若出現「測試付款請點此」按鈕，點擊並等待頁面更新
10. **截圖**：從登入到加入購物車，然後結帳付款，每個各關鍵步驟截圖儲存至 `e2e/screenshot-*.png`

### 帳號資訊

從 `.env` 讀取，預設值：

- Email：`admin@hexschool.com`
- Password：`12345678`

### ECPay 特性說明

- **網路ATM 的「前往付款」**是 `<a>` 標籤，需用 `page.evaluate()` 點擊。
- Staging 環境下，點擊後可能導向 TWQR QRCode 頁，此為正常行為。
- 因本機 localhost 無法被 ECPay 回調，訂單不會自動標記為「已付款」，需手動至訂單詳情頁的「DEV: 模擬付款」完成最後驗證。

---

## 錯誤處理

| 情況 | 對應行動 |
|------|----------|
| `browserType.launch: Executable doesn't exist` | 執行 `npx playwright install chromium`（停用 sandbox） |
| `TimeoutError` on login form | 確認 Vue 已掛載，改用 `input[type="email"]` 而非 placeholder |
| 找不到「加入購物車」按鈕 | 等待 `waitForSelector('button:has-text("加入購物車")')` |
| ECPay 頁找不到銀行 select | 用 `locator('select:visible')` 或 `select[id*="Bank"]` |
| 「前往付款」button 找不到 | 改用 `page.evaluate()` 掃描所有可點擊元素 |
| 任何其他未預期錯誤 | 截圖存查，切換 Plan Mode 與使用者討論 |
