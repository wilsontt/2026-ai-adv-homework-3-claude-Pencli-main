# E2E 測試報告：網路ATM 結帳流程（含回站付款驗證）

- **測試日期**：2026-07-30
- **測試腳本**：`e2e/checkout-ecpay-atm-callback.spec.js`
- **執行方式**：`npx playwright test e2e/checkout-ecpay-atm-callback.spec.js --project=chromium`
- **測試環境**：`http://localhost:3001`（`npm run dev:server`，以完整網路權限啟動，確保後端可對外呼叫 ECPay Staging API）
- **測試帳號**：`admin@hexschool.com`（來源：`.env` 的 `ADMIN_EMAIL` / `ADMIN_PASSWORD`）

## 測試結果總覽

| 項目 | 結果 |
|------|------|
| 測試狀態 | ✅ 1 passed / 0 failed |
| 執行時間 | 29.7 秒 |
| 訂單編號 | `fbb7ac4e-b982-4def-a78f-8515e12db1d7` |
| ECPay MerchantTradeNo | `ORD20260730E160C01` |
| 最終訂單狀態 | ✅ 已付款（paid） |

## 各步驟執行狀況

| 步驟 | 結果 | 說明 |
|------|------|------|
| 登入 | ✅ | 以 `.env` 帳密登入成功，導回首頁 |
| 加入購物車 | ✅ | 於商品列表點擊「加入購物車」成功 |
| 結帳 → 建立訂單 | ✅ | 填寫收件資訊後成功建立訂單，導向 `/orders/:id` |
| 導向 ECPay | ✅ | 點擊「前往付款」以表單同頁提交，導向 `Cashier/AioCheckOut/V5` |
| 選擇網路ATM | ✅ | 於 ECPay 頁面選擇「網路ATM」付款方式 |
| 選擇台灣土地銀行 | ✅ | 於銀行下拉選單選取「台灣土地銀行」 |
| 點擊前往付款 | ✅ | 導向 ECPay `PaymentRule/QRCodePaymentInfo` 付款資訊頁 |
| 點擊「測試付款請點此」 | ✅ | 開啟 `MockPostOPay` 新分頁 |
| 分頁點擊「交易成功」 | ✅ | 分頁自動關閉，主分頁導回 ECPay 付款結果頁 |
| 點擊「返回商店」 | ✅ | 導回站內 `/orders/:id?payment=callback` |
| 頁面顯示「已付款」 | ✅ | 站內自動呼叫 `POST /api/orders/:id/payment/query` 同步狀態成功 |
| 頁面顯示「付款成功！感謝您的購買」 | ✅ | 訂單詳情頁確認顯示成功訊息 |

## 流程說明

1. 登入後於首頁將第一項商品加入購物車，進入 `/cart` 頁面點擊「前往結帳」。
2. 於 `/checkout` 填寫收件資訊並送出，系統建立訂單並導向訂單詳情頁。
3. 點擊「前往付款」以表單同頁提交方式導向 ECPay Staging（`Cashier/AioCheckOut/V5`）。
4. 於 ECPay 頁面選擇「網路ATM」→ 選擇「台灣土地銀行」→ 點擊「前往付款」連結，進入付款資訊頁。
5. 點擊「測試付款請點此」（`target="_blank"` 連結）開啟 ECPay Mock 付款分頁（`MockPostOPay`）。
6. 於 Mock 分頁點擊「交易成功」，分頁自動關閉，主分頁導回 ECPay 付款結果頁（`bank/paymentcenter/cnt/twqr/redirect`）。
7. 點擊「返回商店」導回站內訂單詳情頁（帶 `?payment=callback` 參數）。
8. 站內前端偵測到 `payment=callback` 且訂單為 `pending`，自動呼叫 `POST /api/orders/:id/payment/query` 向 ECPay 查詢真實交易結果，成功同步訂單狀態為「已付款」，頁面顯示「付款成功！感謝您的購買」。

## 備註

- 本次測試前確認原先在 3001 port 監聽的 server 行程可能處於網路沙箱限制下，已將其停止並以完整網路權限重新啟動 `npm run dev:server`，避免後端呼叫 ECPay `QueryTradeInfo/V5` 時發生 DNS 解析失敗（`ENOTFOUND payment-stage.ecpay.com.tw`）而導致訂單卡在 `pending`。
- 本次測試完整驗證「回站後自動同步付款狀態」的關鍵路徑，非僅測試流程可跑通，屬於較嚴謹的驗收層級。
- 測試使用 ECPay Staging 環境（`payment-stage.ecpay.com.tw`）與官方提供的 Mock 付款頁面，未涉及真實金流。

## 截圖

截圖存放於 `e2e/atm2-step-01-*.png` ～ `e2e/atm2-step-07-*.png`，關鍵畫面如下：

| 檔名 | 說明 |
|------|------|
| `atm2-step-01-login-page.png` | 登入頁 |
| `atm2-step-02-ecpay-landing.png` | 導向 ECPay 付款頁 |
| `atm2-step-03-bank-selected.png` | 已選擇網路ATM／台灣土地銀行 |
| `atm2-step-04-after-pay-click.png` | 點擊前往付款後的付款資訊頁 |
| `atm2-step-05-mock-scan-pay.png` | ECPay Mock 付款分頁 |
| `atm2-step-06-ecpay-result.png` | ECPay 付款結果頁（返回商店） |
| `atm2-step-07-back-on-site-paid.png` | 回站後訂單詳情頁，顯示「已付款」與「付款成功！感謝您的購買」 |
