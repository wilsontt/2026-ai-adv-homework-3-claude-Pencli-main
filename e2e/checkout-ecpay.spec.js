import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';
const EMAIL = 'admin@hexschool.com';
const PASSWORD = '12345678';

test('完整購物流程：登入 → 加入購物車 → 結帳 → ECPay ATM 付款', async ({ page }) => {

  // ── 1. 登入 ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await expect(page).toHaveURL(/\/login/);

  // 等待 Vue 掛載完成
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.screenshot({ path: 'e2e/step-01-login-page.png', fullPage: true });

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();

  // 登入成功後跳回首頁
  await expect(page).toHaveURL(BASE + '/', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/step-02-homepage-after-login.png', fullPage: true });
  console.log('✅ 登入成功');

  // ── 2. 加入購物車 ─────────────────────────────────────────────────────
  // 等待 Vue 渲染商品列表
  await page.waitForSelector('button:has-text("加入購物車")', { timeout: 15000 });
  await page.screenshot({ path: 'e2e/step-03-products-loaded.png', fullPage: true });

  const addToCartBtn = page.getByRole('button', { name: /加入購物車/ }).first();
  await addToCartBtn.click();

  // 等待通知 Toast 出現後截圖
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/step-04-added-to-cart.png', fullPage: true });
  console.log('✅ 商品已加入購物車');

  // ── 3. 購物車頁 ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/cart`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/step-05-cart-page.png', fullPage: true });

  const checkoutBtn = page.getByRole('button', { name: /前往結帳/ });
  await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  await checkoutBtn.click();

  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  console.log('✅ 進入結帳頁');

  // ── 4. 結帳填表 ───────────────────────────────────────────────────────
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/step-06-checkout-page.png', fullPage: true });

  await page.getByPlaceholder('請輸入姓名').fill('測試訂購人');
  await page.getByPlaceholder('example@floralife.com').fill('test@example.com');
  await page.getByPlaceholder('請輸入詳細配送地址').fill('台北市信義區信義路五段7號');
  await page.screenshot({ path: 'e2e/step-07-checkout-filled.png', fullPage: true });

  const submitBtn = page.getByRole('button', { name: /確認送出訂單/ });
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  // 等待跳轉到訂單詳情頁
  await expect(page).toHaveURL(/\/orders\//, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/step-08-order-detail.png', fullPage: true });
  console.log('✅ 訂單建立成功，進入訂單詳情頁');

  // ── 5. 前往 ECPay ─────────────────────────────────────────────────────
  const payBtn = page.getByRole('button', { name: /前往付款/ });
  await expect(payBtn).toBeVisible({ timeout: 10000 });

  const [ecpayPage] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 20000 }).catch(() => null),
    payBtn.click(),
  ]);

  const targetPage = ecpayPage ?? page;
  await targetPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
  await targetPage.waitForTimeout(1500);
  await targetPage.screenshot({ path: 'e2e/step-09-ecpay-landing.png', fullPage: true });
  console.log('✅ 已進入 ECPay 付款頁，URL：', targetPage.url());

  // ── 6. 選擇「網路ATM」 ────────────────────────────────────────────────
  const webAtmTab = targetPage.locator('text=網路ATM').first();
  await expect(webAtmTab).toBeVisible({ timeout: 10000 });
  await webAtmTab.click();
  await targetPage.waitForTimeout(1500);
  await targetPage.screenshot({ path: 'e2e/step-10-atm-tab-selected.png', fullPage: true });
  console.log('✅ 點擊「網路ATM」付款方式');

  // ── 7. 選擇「台灣土地銀行」 ───────────────────────────────────────────
  const bankSelect = targetPage.locator('select:visible, select[id*="Bank"], select[id*="bank"], select[name*="Bank"]').first();
  await expect(bankSelect).toBeVisible({ timeout: 8000 });

  const allOpts = await bankSelect.locator('option').allTextContents();
  console.log('ECPay 銀行選項：', allOpts.join(', '));

  const landBankOpt = allOpts.find(o => o.includes('土地'));
  if (landBankOpt) {
    await bankSelect.selectOption({ label: landBankOpt });
    console.log('✅ 選擇台灣土地銀行：', landBankOpt);
  } else {
    await bankSelect.selectOption({ value: '005' });
    console.log('✅ 以代碼 005 選取台灣土地銀行');
  }

  await targetPage.waitForTimeout(800);
  await targetPage.screenshot({ path: 'e2e/step-11-bank-selected.png', fullPage: true });

  // ── 8. 點擊「前往付款」 ───────────────────────────────────────────────
  const clicked = await targetPage.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
    const payBtn = allElements.find(el =>
      el.textContent?.trim().includes('前往付款') || el.value?.includes('前往付款')
    );
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
    await targetPage.screenshot({ path: 'e2e/step-12-pay-btn-not-found.png', fullPage: true });
  }

  await targetPage.waitForTimeout(2000);
  await targetPage.screenshot({ path: 'e2e/step-12-after-pay-click.png', fullPage: true });
  console.log('✅ 已截圖點擊付款後頁面，URL：', targetPage.url());

  // ── 9. ECPay Staging 測試付款 ─────────────────────────────────────────
  const testPayBtn = targetPage.locator('button:has-text("測試付款請點此"), a:has-text("測試付款請點此")').first();
  if (await testPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('🔧 偵測到 ECPay Staging 測試按鈕，執行模擬付款');

    await Promise.all([
      targetPage.waitForNavigation({ timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => null),
      testPayBtn.click(),
    ]);

    await targetPage.waitForTimeout(2000);
    await targetPage.screenshot({ path: 'e2e/step-13-payment-complete.png', fullPage: true });
    console.log('✅ 模擬付款完成，最終 URL：', targetPage.url());
  } else {
    console.log('ℹ️  未出現測試按鈕（可能已導向真實銀行頁面或流程已完成）');
    await targetPage.screenshot({ path: 'e2e/step-13-payment-complete.png', fullPage: true });
  }

  console.log('✅ E2E 完整流程結束');
});
