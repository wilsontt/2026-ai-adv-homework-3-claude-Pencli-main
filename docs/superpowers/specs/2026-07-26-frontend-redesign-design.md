# 花漾生活前台 UI 重設計規格（苗圃吊牌與市集收據 Botanical Ledger）

- **日期**：2026-07-26
- **設計工具**：Pencil MCP（`.pen` 檔案）
- **狀態**：取代 `2026-05-31-frontend-redesign-design.md`（該版採用 Stitch 工具與玫瑰粉圓角膠囊風格，尚未落地為 Pencil 設計稿；本次為使用者要求的「全新品牌方向」重新設計，不沿用舊版視覺）

---

## 1. 商業背景與設計目標

花漾生活（Flora Life）為花卉電商 Demo 專案，技術棧為 Node.js + Express 4 + EJS + TailwindCSS + Vue（前台互動）。前台需同時服務：

- **一般訪客**：瀏覽商品、加入購物車（訪客模式，`X-Session-Id`）
- **會員**：登入後完整購物流程、查看訂單、透過綠界 ECPay 完成付款

設計目標：

1. 產出一套具**辨識度、不落入生成式 AI 常見樣板**（暖米白＋高對比襯線＋陶土色 / 純黑＋螢光色 / 密集無圓角報紙式排版）的全新視覺方向。
2. 視覺語言需**扣合花卉電商的真實業務場景**——花市/苗圃掛牌標價、開立收據——藉此同時強化結帳與付款流程的清晰度與信任感。
3. 涵蓋所有前台頁面（不含後台管理頁），並在 Pencil 中建立可複用元件，確保 8 個頁面視覺一致、日後易於維護。
4. 設計稿需以截圖＋規格文件形式存入 `docs/design/`，供不開 Pencil 也能查閱。

---

## 2. 設計概念：苗圃吊牌與市集收據

以「花市/苗圃」實體物件的結構語言取代裝飾性設計：

- **商品卡 → 苗圃吊牌**：撕線圓孔＋目錄編號＋印章式現貨標籤，如同苗圃植株上懸掛的標價吊牌。
- **購物車／結帳／訂單詳情 → 市集收據**：虛線分隔、等寬字對齊金額、撕邊總計列，如同市集攤販開立的手寫收據。
- **登入／註冊 → 票根卡片**：票根虛線＋騎縫章角，呼應市集買票入場的意象。
- **404 → 遺失的吊牌**：撕掉一半的吊牌插畫，文案「此標本已從目錄中移除」＋「返回目錄」按鈕。

此語彙貫穿選購到付款的完整流程，讓「一目了然的帳目」成為結帳頁的核心體驗，而非單純裝飾。

---

## 3. 設計 Token

### 色彩

| 變數 | 色碼 | 用途 |
|------|------|------|
| `$paper` | `#F2EDE1` | 主背景（帶灰調石紙色） |
| `$paper-deep` | `#E4DCC8` | 區塊交替背景／吊牌紙色 |
| `$ink` | `#23261D` | 主文字（偏綠黑墨色） |
| `$ink-soft` | `#5B5D4E` | 次要文字 |
| `$moss` | `#445540` | 品牌綠（連結、次要按鈕、現貨戳章） |
| `$stamp` | `#C1442C` | 印章紅（主要 CTA、售完戳章、價格重點） |
| `$gold-thread` | `#B98B2E` | 吊牌繩線、分隔裝飾、評分星星 |

### 字型

| 用途 | 字型 |
|------|------|
| 展示大標（拉丁文字/數字） | Fraunces（600–900） |
| 中文大標 | Noto Serif TC（Bold） |
| 內文／表單／按鈕 | Noto Sans TC |
| 帳目／價格／單號（收據感） | JetBrains Mono |

### 形狀語言

- 吊牌／票根：頂部撕線（虛線）＋小圓孔，卡片直角或極小圓角（非膠囊）
- 收據：虛線分隔列，總計列用鋸齒／撕邊效果
- 按鈕：矩形帶輕微圓角（4px），主要 CTA 用 `$stamp` 底色＋白字，模擬印章質感
- 陰影：極輕量 `0 1px 2px rgba(35,38,29,0.08)`，避免厚重擬物陰影

---

## 4. 共用元件（Pencil reusable component）

| 元件 | 說明 |
|------|------|
| Header | 品牌名（Fraunces＋Noto Serif TC）、導覽、購物車圖示（`$stamp` 徽章數字） |
| Footer | 極簡單列，`$paper-deep` 底色 |
| Product Tag Card | 苗圃吊牌樣式商品卡：撕線圓孔、目錄編號、商品名、mono 價格、現貨/售完戳章、加入購物車按鈕 |
| Receipt Row | 收據列：品項名／數量／單價／小計，mono 對齊 |
| Receipt Total | 撕邊總計列 |
| Ticket Form Card | 票根樣式表單卡（登入、結帳收件資訊） |
| Stamp Button | 印章式主要按鈕（`$stamp` 底、白字、輕微旋轉戳章質感） |
| Status Stamp | 訂單狀態戳章標籤（待付款/已付款/失敗，對應 `$gold-thread`／`$moss`／`$stamp`） |

---

## 5. 頁面規格（8 頁）

### 5.1 首頁（`/`）

- **Hero「標本圖鑑跨頁」**：左側大幅花卉攝影（相框內縮邊框線），右側目錄編號 eyebrow＋Fraunces/Noto Serif TC 大標＋副標＋Stamp Button「立即選購」＋次要文字連結「瀏覽目錄→」，下方虛線分隔＋服務特色一行（全台配送／手工包裝／滿額免運）
- **精選推薦**：4 欄 Product Tag Card，取商品列表前 4 筆
- **品牌故事**：左圖右文，文＋斜體引言（`$gold-thread` 左框線）
- **所有商品**：`id="products"` 錨點，3 欄 Product Tag Card 格 + 分頁器（方形頁碼，當前頁 `$stamp` 填色）
- **顧客評價**：`$moss` 深色底，3 欄，`$gold-thread` 星等
- **訂閱**：`$paper-deep` 底，email 輸入＋Stamp Button

### 5.2 商品詳情（`/products/:id`）

- 放大版 Product Tag Card：左欄大圖（相框感），右欄目錄編號＋商品名（Noto Serif TC）＋mono 價格＋庫存戳章（現貨「尚有 N 件」`$moss` / 售完 `$stamp`）＋商品描述＋數量選擇器＋Stamp Button「加入購物車」（sticky bottom on mobile）＋`$paper-deep` 購買須知卡

### 5.3 購物車（`/cart`）

- 免運提示橫幅（未達門檻 `$stamp` 淡底 / 已達 `$moss` 淡底）
- 商品列表：Receipt Row 樣式，含縮圖、數量選擇器、刪除
- 訂單摘要：Receipt Total 樣式（小計／運費／總計）＋Stamp Button「前往結帳」
- 空購物車：吊牌插畫＋「去逛逛」按鈕

### 5.4 結帳（`/checkout`）

- 左欄：Ticket Form Card「收件資訊」（姓名／Email／地址，錯誤提示 `$stamp` 文字）
- 右欄（sticky）：Receipt Row + Receipt Total ＋Stamp Button「確認送出訂單」（處理中 disabled）

### 5.5 登入／註冊（`/login`）

- 置中 Ticket Form Card，票根虛線＋騎縫章角
- 頂部品牌名，Tab 切換「登入／註冊」以票根印章樣式呈現選中狀態
- 表單：登入（Email＋密碼）／註冊（姓名＋Email＋密碼 ≥6 字元）

### 5.6 我的訂單（`/orders`）

- 每筆訂單＝收據存根卡：訂單編號＋日期／金額＋Status Stamp／右箭頭
- 空訂單：吊牌插畫＋「去逛逛」按鈕
- 未登入 redirect `/login`（前端判斷）

### 5.7 訂單詳情（`/orders/:id`）

- 付款結果 Alert（`?payment=` callback/success/fail，對應戳章色）
- 訂單資訊／收件資訊：Ticket Form Card 唯讀樣式
- 商品明細：Receipt Row + Receipt Total
- 付款區（僅 `pending`）：Stamp Button「前往付款」＋「查詢付款結果」空心按鈕＋DEV 折疊區（模擬成功/失敗，僅非 production）

### 5.8 404 頁

- 撕掉一半的吊牌插畫＋文案「此標本已從目錄中移除」＋說明一行＋「返回目錄」按鈕

---

## 6. RWD 策略

| 斷點 | 商品格欄數 |
|------|------------|
| `sm`（640px+） | 2 欄 |
| `md`（768px+） | 2 欄 |
| `lg`（1024px+） | 3 欄 |

Hero／品牌故事／結帳雙欄，手機版皆改上下堆疊。

---

## 7. 交付物與存放位置

| 內容 | 位置 |
|------|------|
| Pencil 原始設計檔 | 專案根目錄 `botanical-ledger.pen` |
| 各頁面截圖（PNG） | `docs/design/screenshots/<page-slug>.png` |
| 設計規格說明文件 | `docs/design/README.md`（含 token 表、元件清單、Pencil Node ID 對照表、頁面清單） |
| 本 spec 文件 | `docs/superpowers/specs/2026-07-26-frontend-redesign-design.md`（本檔） |

Pencil Node ID 對照表待實際繪製後於 `docs/design/README.md` 補齊（元件與 8 個頁面 frame 的 ID）。

---

## 8. 不在本次設計範圍

- 後台管理頁（`/admin/products`、`/admin/orders`）重設計
- 實際 EJS/TailwindCSS 前端程式碼落地實作（本次僅產出 Pencil 設計稿與規格文件）
- 手機版 hamburger 選單、訪客購物車登入後合併、商品搜尋/分類篩選（沿用舊 spec 的未完成項目，非本次範圍）

---

## 9. 驗收標準

- [ ] 8 個頁面皆在 Pencil 建立完整 frame，且視覺無破版（無內容溢出、對比足夠、間距一致）
- [ ] 共用元件（Header/Footer/Product Tag Card/Receipt Row/Receipt Total/Ticket Form Card/Stamp Button/Status Stamp）皆為 reusable component，頁面中以 instance 呼叫
- [ ] 每頁至少 1 張截圖存於 `docs/design/screenshots/`
- [ ] `docs/design/README.md` 含完整 token 表、元件表、頁面 Node ID 對照表
- [ ] 設計需符合現有業務邏輯（如商品售完 disabled、訂單狀態三態、付款流程按鈕文案與 API 對應正確）
