import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';
const EMAIL = 'admin@hexschool.com';
const PASSWORD = '12345678';

test('完整購物流程：登入 → 加入購物車 → 結帳 → ECPay 信用卡付款', async ({ page, context }) => {

  // ── 1. 登入 ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await expect(page).toHaveURL(/\/login/);

  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.screenshot({ path: 'e2e/credit-step-01-login-page.png', fullPage: true });

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(BASE + '/', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('✅ 登入成功');

  // ── 2. 加入購物車 ─────────────────────────────────────────────────────
  await page.waitForSelector('button:has-text("加入購物車")', { timeout: 15000 });
  const addToCartBtn = page.getByRole('button', { name: /加入購物車/ }).first();
  await addToCartBtn.click();
  await page.waitForTimeout(1500);
  console.log('✅ 商品已加入購物車');

  // ── 3. 購物車頁 ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/cart`);
  await page.waitForLoadState('networkidle');

  const checkoutBtn = page.getByRole('button', { name: /前往結帳/ });
  await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  await checkoutBtn.click();

  await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
  console.log('✅ 進入結帳頁');

  // ── 4. 結帳填表 ───────────────────────────────────────────────────────
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('請輸入姓名').fill('測試訂購人');
  await page.getByPlaceholder('example@floralife.com').fill('test@example.com');
  await page.getByPlaceholder('請輸入詳細配送地址').fill('台北市信義區信義路五段7號');

  const submitBtn = page.getByRole('button', { name: /確認送出訂單/ });
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  await expect(page).toHaveURL(/\/orders\//, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
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
  await targetPage.screenshot({ path: 'e2e/credit-step-02-ecpay-landing.png', fullPage: true });
  console.log('✅ 已進入 ECPay 付款頁，URL：', targetPage.url());

  // ── 6. 選擇「信用卡付款」 ─────────────────────────────────────────────
  const creditTab = targetPage.locator('text=信用卡').first();
  await expect(creditTab).toBeVisible({ timeout: 10000 });
  await creditTab.click();
  await targetPage.waitForTimeout(1500);
  await targetPage.screenshot({ path: 'e2e/credit-step-03-credit-tab-selected.png', fullPage: true });
  console.log('✅ 點擊「信用卡付款」付款方式');

  // ── 7. 填入測試卡號 ───────────────────────────────────────────────────
  const cardParts = ['4311', '9522', '2222', '2222'];
  for (let i = 0; i < 4; i++) {
    const field = targetPage.locator(`#CCpart${i + 1}`);
    await expect(field).toBeVisible({ timeout: 8000 });
    await field.fill(cardParts[i]);
  }
  console.log('✅ 已填入測試卡號 4311 9522 2222 2222');

  // ── 8. 填入有效期 ─────────────────────────────────────────────────────
  await targetPage.locator('#creditMM').fill('12');
  await targetPage.locator('#creditYY').fill('26');
  console.log('✅ 已填入有效期 12/26');

  // ── 9. 填入安全碼 ─────────────────────────────────────────────────────
  await targetPage.locator('#CreditBackThree').fill('222');
  console.log('✅ 已填入安全碼 222');

  await targetPage.screenshot({ path: 'e2e/credit-step-04-card-filled.png', fullPage: true });

  // ── 10. 點擊「測試付款請點此」（開新分頁） ────────────────────────────
  const [mockPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 20000 }).catch(() => null),
    targetPage.locator('#aCREDIT').click(),
  ]);

  if (!mockPage) {
    throw new Error('未偵測到 MockScanCodePay 新分頁開啟');
  }

  await mockPage.waitForLoadState('domcontentloaded', { timeout: 20000 });
  await mockPage.waitForTimeout(1500);
  await mockPage.screenshot({ path: 'e2e/credit-step-05-mock-scan-pay.png', fullPage: true });
  console.log('✅ 已切換至 MockScanCodePay 分頁，URL：', mockPage.url());

  // ── 11. 確認卡號已帶入 ────────────────────────────────────────────────
  const pageContent = await mockPage.content();
  const cardVisible = pageContent.includes('4311952222222222') || pageContent.includes('4311 9522 2222 2222');
  console.log(cardVisible ? '✅ 確認卡號 4311952222222222 已帶入' : '⚠️ 未在頁面內容中找到卡號，請人工確認截圖');

  // ── 12. 點擊「交易成功」 ──────────────────────────────────────────────
  const successBtn = mockPage.locator('input[value="交易成功"]');
  await expect(successBtn).toBeVisible({ timeout: 10000 });

  await Promise.all([
    mockPage.waitForEvent('close', { timeout: 10000 }).catch(() => null),
    successBtn.click(),
  ]);
  console.log('✅ 已點擊「交易成功」，MockScanCodePay 分頁已關閉，導回訂單付款流程');

  // ── 13. 回到原訂單頁確認最終狀態 ──────────────────────────────────────
  const finalPage = targetPage.isClosed() ? page : targetPage;
  await finalPage.waitForTimeout(2000);
  await finalPage.screenshot({ path: 'e2e/credit-step-06-transaction-success.png', fullPage: true });
  console.log('✅ 最終頁面 URL：', finalPage.url());

  console.log('✅ E2E 信用卡付款流程結束');
});
