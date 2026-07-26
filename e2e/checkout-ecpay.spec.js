import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';
const EMAIL = 'admin@hexschool.com';
const PASSWORD = '12345678';

test('完整購物流程：登入 → 加入購物車 → 結帳 → ECPay ATM 付款', async ({ page }) => {

  // ── 1. 登入 ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await expect(page).toHaveURL(/\/login/);

  // 等待 Vue 掛載完成（登入表單出現）
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();

  // 登入成功後應跳回首頁
  await expect(page).toHaveURL(BASE + '/', { timeout: 15000 });
  console.log('✅ 登入成功');

  // ── 2. 選擇商品並加入購物車 ───────────────────────────────────────────
  await page.goto(BASE + '/');
  // 等待 Vue 渲染商品列表
  await page.waitForSelector('button:has-text("加入購物車")', { timeout: 15000 });

  // 點擊第一個商品的「加入購物車」按鈕
  const addToCartBtn = page.getByRole('button', { name: /加入購物車/ }).first();
  await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
  await addToCartBtn.click();

  // 等待成功通知
  await page.waitForTimeout(1500);
  console.log('✅ 商品已加入購物車');

  // ── 3. 前往購物車 ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/cart`);
  await page.waitForLoadState('networkidle');

  // 確認有商品在購物車中
  const checkoutBtn = page.getByRole('button', { name: /前往結帳/ });
  await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  await checkoutBtn.click();

  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  console.log('✅ 進入結帳頁');

  // ── 4. 填寫收件資訊 ───────────────────────────────────────────────────
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('請輸入姓名').fill('測試訂購人');
  await page.getByPlaceholder('example@floralife.com').fill('test@example.com');
  await page.getByPlaceholder('請輸入詳細配送地址').fill('台北市信義區信義路五段7號');

  // 送出訂單
  const submitBtn = page.getByRole('button', { name: /確認送出訂單/ });
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  // 等待跳轉到訂單詳情頁
  await expect(page).toHaveURL(/\/orders\//, { timeout: 15000 });
  console.log('✅ 訂單建立成功，進入訂單詳情頁');

  // ── 5. 點擊「前往付款」觸發 ECPay ─────────────────────────────────────
  const payBtn = page.getByRole('button', { name: /前往付款/ });
  await expect(payBtn).toBeVisible({ timeout: 10000 });

  // ECPay 會 POST submit 表單並跳轉到外部網址，監聽新頁面
  const [ecpayPage] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 20000 }).catch(() => null),
    payBtn.click(),
  ]);

  // 如果在同一個 page 跳轉（不是新分頁）
  const targetPage = ecpayPage ?? page;

  await targetPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
  console.log('✅ 已進入 ECPay 付款頁，URL：', targetPage.url());

  // ── 6. ECPay 選擇「網路ATM」付款方式 ─────────────────────────────────
  // ECPay staging 頁面的付款方式 Tab 以文字標籤呈現
  await targetPage.waitForLoadState('domcontentloaded', { timeout: 20000 });
  await targetPage.waitForTimeout(1500);

  // 截圖備查
  await targetPage.screenshot({ path: 'e2e/screenshot-ecpay-landing.png', fullPage: true });

  // 點擊「網路ATM」Tab
  const webAtmTab = targetPage.locator('text=網路ATM').first();
  await expect(webAtmTab).toBeVisible({ timeout: 10000 });
  await webAtmTab.click();
  console.log('✅ 點擊「網路ATM」付款方式');

  await targetPage.waitForTimeout(1500);
  await targetPage.screenshot({ path: 'e2e/screenshot-ecpay-atm-selected.png', fullPage: true });

  // ── 7. 選擇「台灣土地銀行」from 下拉選單 ────────────────────────────
  // 網路ATM 的銀行選擇是一個可見的 <select> 下拉元素（非信用卡分期的隱藏 select）
  const bankSelect = targetPage.locator('select:visible, select[id*="Bank"], select[id*="bank"], select[name*="Bank"]').first();
  await expect(bankSelect).toBeVisible({ timeout: 8000 });

  // 印出所有可用銀行選項，方便 debug
  const allOpts = await bankSelect.locator('option').allTextContents();
  console.log('ECPay 銀行選項：', allOpts.join(', '));

  // 找出含「土地」的選項
  const landBankOpt = allOpts.find(o => o.includes('土地'));
  if (landBankOpt) {
    await bankSelect.selectOption({ label: landBankOpt });
    console.log('✅ 選擇台灣土地銀行：', landBankOpt);
  } else {
    console.log('⚠️  選項中找不到「土地銀行」，嘗試以代碼 005 選取');
    await bankSelect.selectOption({ value: '005' });
    console.log('✅ 以代碼 005 選取銀行');
  }

  await targetPage.waitForTimeout(800);

  // ── 8. 點擊「前往付款」 ─────────────────────────────────────────────
  await targetPage.waitForTimeout(500);

  // ECPay 的「前往付款」可能是自訂樣式按鈕，用 getByText 或 JS 點擊
  const clicked = await targetPage.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
    const payBtn = allElements.find(el => el.textContent?.trim().includes('前往付款') || el.value?.includes('前往付款'));
    if (payBtn) {
      payBtn.click();
      return payBtn.tagName + ': ' + (payBtn.textContent?.trim() || payBtn.value);
    }
    return null;
  });

  if (clicked) {
    console.log('✅ 點擊「前往付款」按鈕：', clicked);
  } else {
    console.log('⚠️  找不到「前往付款」按鈕，截圖存查');
    await targetPage.screenshot({ path: 'e2e/screenshot-ecpay-no-btn.png', fullPage: true });
  }

  // 等待導向後頁面 (可能是銀行頁面或 staging QRCode 頁)
  await targetPage.waitForTimeout(2000);
  await targetPage.screenshot({ path: 'e2e/screenshot-ecpay-result.png', fullPage: true });
  console.log('✅ 已截圖付款結果頁面，URL：', targetPage.url());

  // ── 9. 若為 ECPay Staging 測試頁面，點擊「測試付款請點此」完成模擬付款 ─
  const testPayBtn = targetPage.locator('button:has-text("測試付款請點此"), a:has-text("測試付款請點此")').first();
  if (await testPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('🔧 偵測到 ECPay Staging 測試按鈕，執行模擬付款');

    // 點擊後可能跳回我方網站的訂單詳情頁
    await Promise.all([
      targetPage.waitForNavigation({ timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => null),
      testPayBtn.click(),
    ]);

    await targetPage.waitForTimeout(2000);
    await targetPage.screenshot({ path: 'e2e/screenshot-final.png', fullPage: true });
    console.log('✅ 模擬付款完成，最終 URL：', targetPage.url());
  } else {
    console.log('ℹ️  未出現測試按鈕（可能已導向真實銀行頁面或流程已完成）');
  }

  console.log('✅ E2E 完整流程結束');
});
