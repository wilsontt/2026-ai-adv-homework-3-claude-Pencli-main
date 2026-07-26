---
name: e2e-checkout
description: 執行花漾生活電商的端對端購物流程測試，涵蓋登入、加入購物車、結帳、到 ECPay 綠界金流（網路ATM、信用卡）的完整流程，並可驗證回站後自動同步「已付款」，測試結束後附上截圖。
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
- 「測試 ECPay 金流，並完成付款」
- 「測試信用卡付款」
- 「測試網路ATM並確認回站已付款」
- `/e2e-checkout`

---

## 執行模式

**本 Skill 預設以 Auto Mode 執行**，不必為每個步驟詢問確認，直接依下列步驟推進。若發生非預期錯誤，切換 Plan Mode 與使用者討論後再繼續。

---

## 測試腳本一覽

依使用者需求選擇對應腳本；未特別指定時，預設執行 `checkout-ecpay.spec.js`（基本網路ATM流程）。

| 腳本 | 涵蓋範圍 | 使用時機 |
|------|----------|----------|
| `e2e/checkout-ecpay.spec.js` | 登入 → 加入購物車 → 結帳 → 網路ATM/台灣土地銀行 → 點擊測試付款按鈕即結束 | 一般性「跑 E2E 測試」「測試結帳流程」 |
| `e2e/checkout-ecpay-atm-callback.spec.js` | 同上，並延伸完成 ECPay 端交易、點擊「返回商店」導回站內，驗證訂單自動同步為「已付款」與顯示「付款成功！感謝您的購買」 | 使用者要求「確認已付款」「完成這筆訂單交易」「回站驗證」等 |
| `e2e/checkout-ecpay-credit.spec.js` | 登入 → 加入購物車 → 結帳 → 信用卡付款（填測試卡號/效期/安全碼）→ MockScanCodePay 分頁完成交易 | 使用者要求「測試信用卡付款」 |

若使用者同時要求多種付款方式，依序執行對應腳本。

---

## 執行步驟

### Step 1 — 確認環境

1. 確認 `http://localhost:3001` 是否已有服務監聽（`lsof -i :3001 | grep LISTEN`）。
2. 若無，執行 `npm run dev:server`（背景執行），等待 3 秒後再繼續。
   - **務必以完整網路權限啟動**（`dangerouslyDisableSandbox: true`）。若 server 行程本身處於網路沙箱限制下，呼叫綠界 `QueryTradeInfo` API 時會 DNS 解析失敗（`fetch failed` / `ENOTFOUND payment-stage.ecpay.com.tw`），導致 ATM 回站驗證流程卡在 `pending` 無法自動同步為「已付款」（詳見 [ECPay 特性說明](#ecpay-特性說明)）。
   - 若已有 server 在跑但懷疑是在沙箱限制下啟動的（例如回站驗證測試失敗、訂單一直是 pending），先 `kill <pid>` 再以 `dangerouslyDisableSandbox: true` 重新啟動。
3. 確認 `@playwright/test` 套件已安裝（`npx playwright --version`）；若未安裝，執行 `npm install --save-dev @playwright/test`。
4. 確認 Chromium 瀏覽器已下載（`ls ~/.cache/ms-playwright/chromium-* 2>/dev/null || ls ~/Library/Caches/ms-playwright/chromium-* 2>/dev/null`）；若無，執行 `npx playwright install chromium`（需停用 sandbox）。

### Step 2 — 執行 Playwright 測試

依 [測試腳本一覽](#測試腳本一覽) 選定腳本後執行：

```bash
npx playwright test e2e/checkout-ecpay.spec.js --project=chromium
# 或
npx playwright test e2e/checkout-ecpay-atm-callback.spec.js --project=chromium
# 或
npx playwright test e2e/checkout-ecpay-credit.spec.js --project=chromium
```

- 若對應測試腳本不存在，先參照 [測試腳本規格](#測試腳本規格) 建立。
- 測試需停用 sandbox（`dangerouslyDisableSandbox: true`），因 Playwright 需存取 `~/Library/Caches`。
- 逾時設定：120 秒。

### Step 3 — 收集截圖

測試執行後，截圖依腳本各自存於 `e2e/` 目錄，檔名前綴不同：

| 腳本 | 截圖前綴 | 關鍵截圖 |
|------|----------|----------|
| `checkout-ecpay.spec.js` | `e2e/step-01-*.png` ~ `step-13-*.png` | `step-09-ecpay-landing`、`step-10-atm-tab-selected`、`step-11-bank-selected`、`step-12-after-pay-click`、`step-13-payment-complete` |
| `checkout-ecpay-atm-callback.spec.js` | `e2e/atm2-step-01-*.png` ~ `atm2-step-07-*.png` | `atm2-step-02-ecpay-landing`、`atm2-step-03-bank-selected`、`atm2-step-04-after-pay-click`、`atm2-step-05-mock-scan-pay`、`atm2-step-06-ecpay-result`、`atm2-step-07-back-on-site-paid`（顯示已付款的最終畫面） |
| `checkout-ecpay-credit.spec.js` | `e2e/credit-step-01-*.png` ~ `credit-step-06-*.png` | `credit-step-02-ecpay-landing`、`credit-step-03-credit-tab-selected`、`credit-step-04-card-filled`、`credit-step-05-mock-scan-pay`、`credit-step-06-transaction-success` |

收集實際執行腳本所產生的截圖，使用 `SendUserFile` 工具一次傳送給使用者。

### Step 4 — 回報結果

依實際跑的腳本挑選對應表格回報：

**基本流程 / 信用卡流程**（僅跑到 ECPay 端完成測試交易，不驗證回站）：

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
| 選擇付款方式（網路ATM／信用卡） | ✅ / ❌ |
| （網路ATM）選擇台灣土地銀行 | ✅ / ❌ |
| （信用卡）填入測試卡號/效期/安全碼 | ✅ / ❌ |
| 點擊測試付款並完成交易 | ✅ / ❌ |

### 備註
[說明 ECPay Staging 限制、localhost 回調限制等非 bug 的預期行為；此模式下訂單通常仍為 pending，需另行補完]
```

**ATM 回站驗證流程**（`checkout-ecpay-atm-callback.spec.js`）：

```
## E2E 測試結果（網路ATM + 回站驗證）

- 測試狀態：[passed N / failed N]
- 執行時間：[秒數]
- 訂單編號：[從截圖或 console log 擷取]，最終狀態：[paid / pending]

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
| MockPostOPay 分頁完成交易 | ✅ / ❌ |
| 點擊「返回商店」導回站內 | ✅ / ❌ |
| 頁面顯示「已付款」 | ✅ / ❌ |
| 頁面顯示「付款成功！感謝您的購買」 | ✅ / ❌ |

### 備註
[若未顯示已付款，優先檢查 server 是否具備對外連線至 payment-stage.ecpay.com.tw 的網路權限]
```

---

## 測試腳本規格

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

帳號密碼從 `.env` 讀取，預設值：Email `admin@hexschool.com`、Password `12345678`。

### 共通前半段（登入 → 加入購物車 → 結帳）

三支腳本共用此段邏輯：

1. **登入**：`/login` → `input[type="email"]` 填帳號、`input[type="password"]` 填密碼 → `button[type="submit"]` → 等待跳回 `/`
2. **加入購物車**：`/` → 等待 `button:has-text("加入購物車")` 出現 → 點擊第一個
3. **結帳**：`/cart` → 點擊「前往結帳」→ 等待跳轉 `/checkout`
4. **填寫收件資訊**：姓名 / Email / 地址 → 點擊「確認送出訂單」→ 等待跳轉 `/orders/:id`
5. **前往 ECPay**：點擊「前往付款」→ 表單以 `form.submit()` 送出（**同頁跳轉，非新分頁**）；用 `page.waitForURL(/payment-stage\.ecpay\.com\.tw/)` 搭配點擊事件等待跳轉完成

### 分支 A：`checkout-ecpay.spec.js`（網路ATM，基本流程）

6. **選擇網路ATM**：`page.locator('text=網路ATM').first().click()`
7. **選擇台灣土地銀行**：找到可見的 `select` → 讀出所有 `option` 文字，挑含「土地」的選項 `selectOption({ label })`
8. **點擊前往付款**：`page.evaluate()` 掃描 `button, input[type=submit/button], a`，找文字含「前往付款」者並 `.click()`
9. **Staging 測試付款**：若出現「測試付款請點此」按鈕即點擊並等待頁面更新（**不追蹤是否真的完成付款**，僅確認流程可跑通）
10. 每個關鍵步驟截圖至 `e2e/step-*.png`

### 分支 B：`checkout-ecpay-atm-callback.spec.js`（網路ATM，含回站驗證）

延續分支 A 的步驟 6–8，但完整走到底並驗證訂單狀態：

9. **點擊「測試付款請點此」**：該元素是 **`<a target="_blank">`**，`href` 指向 `MockPostOPay/MockPaid?...`，點擊會**開新分頁**。需用 `context.waitForEvent('page')` 搭配 `page.evaluate()` 點擊來同時捕捉新分頁。
10. **新分頁點擊「交易成功」**：`mockPage.locator('input[value="交易成功"], button:has-text("交易成功")')`。點擊後**該分頁會自動關閉**（用 `mockPage.waitForEvent('close')` 搭配點擊事件等待，不要對已關閉的分頁做後續操作）。
11. **主分頁自動導航**：分頁關閉後，主分頁（原本的 `page`）會依序導向 ECPay 的付款結果頁（`.../bank/paymentcenter/cnt/twqr/redirect` 或類似頁面），頁面上有「返回商店」按鈕。
12. **點擊「返回商店」**：此按鈕（`<a>` 或 `<button>`）的 `href`/導向目標即為 ECPay `ClientBackURL`：`http://localhost:3001/orders/:id?payment=callback`。點擊後用 `page.waitForURL(/localhost:3001/)` 等待導回站內。
13. **驗證站內頁面**：`page.textContent('body')` 應包含「已付款」與「付款成功！感謝您的購買」——站內 `order-detail.js` 偵測到 URL 帶 `?payment=callback` 且訂單為 `pending` 時，會自動呼叫 `POST /api/orders/:id/payment/query` 向綠界查詢真實交易結果並同步狀態，成功時顯示上述文字。
14. 每個關鍵步驟截圖至 `e2e/atm2-step-*.png`。

### 分支 C：`checkout-ecpay-credit.spec.js`（信用卡付款）

延續共通前半段，於 ECPay 頁改走：

6. **選擇信用卡付款**：`page.locator('text=信用卡').first().click()`
7. **填入測試卡號**：分四段填入 `#CCpart1` ~ `#CCpart4`，值為 `4311` / `9522` / `2222` / `2222`
8. **填入有效期**：`#creditMM` 填 `12`、`#creditYY` 填 `26`
9. **填入安全碼**：`#CreditBackThree` 填 `222`
10. **點擊「測試付款請點此」（`#aCREDIT`）**：同樣是 `target="_blank"` 連結，開新分頁 `MockScanCodePay/MockScanCodePayPaid`，需用 `context.waitForEvent('page')` 捕捉
11. **新分頁確認卡號已帶入**：檢查頁面內容含 `4311952222222222`
12. **新分頁點擊「交易成功」**：`input[value="交易成功"]`，點擊後分頁關閉
13. 每個關鍵步驟截圖至 `e2e/credit-step-*.png`

> 若需比照分支 B 驗證信用卡回站後的「已付款」狀態，可在步驟 12 後比照分支 B 的步驟 11–13 補上「等待主分頁導向 ECPay 結果頁 → 點擊返回商店 → 驗證站內文字」。

---

## ECPay 特性說明

- **「前往付款」按鈕**在訂單詳情頁是同頁 `form.submit()`，不會開新分頁；ECPay 頁內部分付款方式的**「前往付款」連結**（如網路ATM選完銀行後）則是 `<a>` 標籤，需用 `page.evaluate()` 點擊。
- **「測試付款請點此」/「測試付款請點此」等 Staging 測試按鈕，統一是 `target="_blank"` 的 `<a>` 標籤**，點擊會開新分頁進入 ECPay 的 Mock 頁面（`MockPostOPay`、`MockScanCodePay` 等），新分頁上才有真正的「交易成功」按鈕；點擊後新分頁會**自動關閉**並讓主分頁繼續導航。務必用 `context.waitForEvent('page')` 捕捉新分頁、用 `waitForEvent('close')` 等待其關閉，避免對已關閉分頁操作導致 `Target page, context or browser has been closed` 錯誤。
- 完成 Mock 付款後，ECPay 會導向自己的付款結果頁（依付款方式不同，可能是 `PaymentRule/QRCodePaymentInfoResult`、`bank/paymentcenter/cnt/twqr/redirect` 等），頁面上的**「返回商店」**才是真正導回站內的入口，其目標網址即為 `ClientBackURL`（`/orders/:id?payment=callback`）。
- 站內訂單詳情頁（`public/js/pages/order-detail.js`）偵測到網址帶 `?payment=callback` 且訂單仍是 `pending` 時，會**自動**呼叫 `POST /api/orders/:id/payment/query` 向綠界查詢真實交易結果並同步狀態——**這一步才是訂單變成「已付款」的關鍵**，並非 ECPay 直接回調 localhost。
- **關鍵前提**：上述查詢是由**後端 server 行程**對外呼叫 `https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5`。若啟動 `npm run dev:server` 的環境本身有網路沙箱限制（例如透過限制網路白名單的工具啟動、白名單未包含 `payment-stage.ecpay.com.tw`），該 fetch 會出現 `fetch failed` / DNS `ENOTFOUND` 錯誤，導致查詢永遠失敗、訂單卡在 `pending`，即使 ECPay 端交易已經成功。此為**環境限制，非程式邏輯錯誤**——判斷方式：直接 `node -e "require('./src/services/ecpayService.js').queryTradeInfo('<MerchantTradeNo>')"` 測試，若丟出 `ENOTFOUND`，代表 server 行程需要以具備完整網路權限的方式重啟。
- 若不需要驗證真實查詢同步、只想讓本機訂單狀態變成已付款供其他測試使用，可繞過上述流程，改用 DEV 模擬付款端點：

```bash
# 需帶 JWT；將 {orderId} 換成訂單 UUID
curl -s -X PATCH "http://localhost:3001/api/orders/{orderId}/pay" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action":"success"}'
```

此端點僅限**非 production 環境**可用（見 CLAUDE.md）。

---

## 錯誤處理

| 情況 | 對應行動 |
|------|----------|
| `browserType.launch: Executable doesn't exist` | 執行 `npx playwright install chromium`（停用 sandbox） |
| `TimeoutError` on login form | 確認 Vue 已掛載，改用 `input[type="email"]` 而非 placeholder |
| 找不到「加入購物車」按鈕 | 等待 `waitForSelector('button:has-text("加入購物車")')` |
| ECPay 頁找不到銀行 select | 用 `locator('select:visible')` 或 `select[id*="Bank"]` |
| 「前往付款」button 找不到 | 改用 `page.evaluate()` 掃描所有可點擊元素 |
| `page.evaluate: Execution context was destroyed` | 點擊觸發導航後，先 `page.waitForURL(...)` 等目標頁面穩定，再操作 DOM |
| 點擊「測試付款請點此」後找不到「交易成功」按鈕 | 該按鈕在**新分頁**（`context.waitForEvent('page')` 捕捉），不在原分頁上找 |
| `Target page, context or browser has been closed` | 通常是對已關閉的 Mock 分頁做後續操作；改用 `waitForEvent('close')` 等待分頁關閉後再操作主分頁 |
| 回站後未顯示「已付款」/「付款成功」 | 先確認 `POST /api/orders/:id/payment/query` 是否成功；若回傳 `fetch failed`/`ENOTFOUND`，代表 server 行程網路受限，需以完整網路權限重啟 `npm run dev:server` |
| 任何其他未預期錯誤 | 截圖存查，切換 Plan Mode 與使用者討論 |
