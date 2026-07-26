import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';
const EMAIL = 'admin@hexschool.com';
const PASSWORD = '12345678';

test('完整購物流程：登入 → 加入購物車 → 結帳 → ECPay 網路ATM付款 → 自動導回站內訂單頁確認已付款', async ({ page, context }) => {

  // ── 1. 登入 ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.screenshot({ path: 'e2e/atm2-step-01-login-page.png', fullPage: true });

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(BASE + '/', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('✅ 登入成功');

  // ── 2. 加入購物車 ─────────────────────────────────────────────────────
  await page.waitForSelector('button:has-text("加入購物車")', { timeout: 15000 });
  await page.getByRole('button', { name: /加入購物車/ }).first().click();
  await page.waitForTimeout(1500);
  console.log('✅ 商品已加入購物車');

  // ── 3. 購物車 → 結帳 ──────────────────────────────────────────────────
  await page.goto(`${BASE}/cart`);
  await page.waitForLoadState('networkidle');
  const checkoutBtn = page.getByRole('button', { name: /前往結帳/ });
  await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  await checkoutBtn.click();
  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  console.log('✅ 進入結帳頁');

  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('請輸入姓名').fill('測試訂購人');
  await page.getByPlaceholder('example@floralife.com').fill('test@example.com');
  await page.getByPlaceholder('請輸入詳細配送地址').fill('台北市信義區信義路五段7號');
  await page.getByRole('button', { name: /確認送出訂單/ }).click();
  await expect(page).toHaveURL(/\/orders\//, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('✅ 訂單建立成功，進入訂單詳情頁：', page.url());

  // ── 4. 前往 ECPay（同頁表單提交） ─────────────────────────────────────
  const payBtn = page.getByRole('button', { name: /前往付款/ });
  await expect(payBtn).toBeVisible({ timeout: 10000 });
  await Promise.all([
    page.waitForURL(/payment-stage\.ecpay\.com\.tw/, { timeout: 20000 }),
    payBtn.click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/atm2-step-02-ecpay-landing.png', fullPage: true });
  console.log('✅ 已進入 ECPay 付款頁，URL：', page.url());

  // ── 5.1 選擇「網路ATM」 ───────────────────────────────────────────────
  const webAtmTab = page.locator('text=網路ATM').first();
  await expect(webAtmTab).toBeVisible({ timeout: 10000 });
  await webAtmTab.click();
  await page.waitForTimeout(1000);
  console.log('✅ 已選擇「網路ATM」');

  // ── 5.2 選擇「台灣土地銀行」 ──────────────────────────────────────────
  const bankSelect = page.locator('select:visible, select[id*="Bank"], select[id*="bank"], select[name*="Bank"]').first();
  await expect(bankSelect).toBeVisible({ timeout: 8000 });
  const allOpts = await bankSelect.locator('option').allTextContents();
  const landBankOpt = allOpts.find(o => o.includes('土地'));
  if (landBankOpt) {
    await bankSelect.selectOption({ label: landBankOpt });
  } else {
    await bankSelect.selectOption({ value: '005' });
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'e2e/atm2-step-03-bank-selected.png', fullPage: true });
  console.log('✅ 已選擇「台灣土地銀行」');

  // ── 5.3 點擊「前往付款」連結 ──────────────────────────────────────────
  const clicked = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
    const btn = els.find(el => el.textContent?.trim().includes('前往付款') || el.value?.includes('前往付款'));
    if (btn) {
      btn.click();
      return btn.tagName + ': ' + (btn.textContent?.trim() || btn.value);
    }
    return null;
  });
  console.log(clicked ? `✅ 點擊「前往付款」連結：${clicked}` : '⚠️ 找不到「前往付款」連結');
  await page.waitForURL(/PaymentRule\/QRCodePaymentInfo/, { timeout: 20000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/atm2-step-04-after-pay-click.png', fullPage: true });
  console.log('目前頁面 URL：', page.url());

  // ── 5.4 點擊「測試付款請點此」（開新分頁 MockPostOPay） ───────────────
  const [mockPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 15000 }),
    page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
      const btn = els.find(el => el.textContent?.trim().includes('測試付款') || el.value?.includes('測試付款'));
      btn?.click();
    }),
  ]);
  await mockPage.waitForLoadState('domcontentloaded', { timeout: 15000 });
  await mockPage.waitForTimeout(1000);
  await mockPage.screenshot({ path: 'e2e/atm2-step-05-mock-scan-pay.png', fullPage: true });
  console.log('✅ 已開啟 MockPostOPay 分頁，URL：', mockPage.url());

  // ── 5.5 於新分頁點擊「交易成功」 ──────────────────────────────────────
  const successBtn = mockPage.locator('input[value="交易成功"], button:has-text("交易成功")');
  await expect(successBtn).toBeVisible({ timeout: 10000 });
  await Promise.all([
    mockPage.waitForEvent('close', { timeout: 10000 }).catch(() => null),
    successBtn.click(),
  ]);
  console.log('✅ 已點擊「交易成功」，MockPostOPay 分頁關閉，導回 ECPay 付款結果頁');

  // ── 5.6 ECPay 付款成功頁 → 點擊「返回商店」 ───────────────────────────
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/atm2-step-06-ecpay-result.png', fullPage: true });
  console.log('ECPay 付款結果頁 URL：', page.url());

  const backToShopBtn = page.locator('button:has-text("返回商店"), a:has-text("返回商店"), input[value*="返回商店"]').first();
  await expect(backToShopBtn).toBeVisible({ timeout: 10000 });
  await Promise.all([
    page.waitForURL(new RegExp(BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 15000 }),
    backToShopBtn.click(),
  ]);
  console.log('✅ 已點擊「返回商店」，導回站內訂單詳情頁');

  // ── 6. 確認站內訂單詳情頁自動同步為已付款 ─────────────────────────────
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/atm2-step-07-back-on-site-paid.png', fullPage: true });
  console.log('✅ 最終回到站內頁面：', page.url());

  const bodyText = await page.textContent('body');
  const hasPaidLabel = bodyText.includes('已付款');
  const hasSuccessMsg = bodyText.includes('付款成功！感謝您的購買');

  console.log(hasPaidLabel ? '✅ 頁面顯示「已付款」' : '❌ 未顯示「已付款」');
  console.log(hasSuccessMsg ? '✅ 頁面顯示「付款成功！感謝您的購買」' : '❌ 未顯示「付款成功！感謝您的購買」');

  expect(page.url().startsWith(BASE)).toBeTruthy();
  expect(hasPaidLabel).toBeTruthy();
  expect(hasSuccessMsg).toBeTruthy();

  console.log('✅ E2E 完整流程結束（含自動回站確認付款成功）');
});
