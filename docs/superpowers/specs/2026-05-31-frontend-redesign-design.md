# 花漾生活前台 UI 重設計規格

- **日期**：2026-05-31
- **Stitch 專案**：`projects/14070587591868653062`（花漾生活 Flower Life — 前台 UI 重設計）
- **設計系統**：`assets/2176297934944263533`（花漾生活 Design System）

---

## 1. 商業背景與設計目標

花漾生活（Flower Life）為花卉電商 Demo 專案，技術棧為 Node.js + Express + EJS + TailwindCSS。前台需同時服務：

- **一般訪客**：瀏覽商品、加入購物車（訪客模式，X-Session-Id）
- **會員**：登入後完整購物流程、查看訂單、ECPay 付款

設計目標：在維持現有 EJS SSR 架構與 TailwindCSS 的前提下，以更完整的視覺規範重新設計所有前台頁面，提升品牌識別與轉換率。

---

## 2. 設計系統（Design Tokens）

### 色彩

| Token | 色碼 | 用途 |
|-------|------|------|
| `rose-primary` | `#C4727F` | 主要 CTA 按鈕、價格、品牌名、強調色 |
| `rose-dark` | `#A85B67` | Hover 狀態 |
| `rose-light` | `#E8A5AE` | 裝飾、邊框輔助 |
| `sage` | `#7EA584` | 庫存在售、付款成功、免運達標 |
| `apricot` | `#D4956A` | 星星評分、暖調輔助 |
| `cream` | `#FBF8F4` | 頁面主背景 |
| `blush` | `#FFF1EC` | Section 背景、購買須知卡 |
| `rose-bg` | `#FDEAE4` | Hero 漸層終點色 |
| `text-primary` | `#2C2A28` | 主要文字 |
| `text-secondary` | `#6B6560` | 次要文字 |
| `text-muted` | `#9A948E` | 說明、日期 |

### 字型

| 用途 | 字型 |
|------|------|
| 品牌名、區塊標題、H1/H2 | Noto Serif TC |
| 導覽、按鈕、表單、內文 | Noto Sans TC |

### 形狀與陰影

- **卡片圓角**：`border-radius: 16px`（`rounded-2xl`）
- **按鈕**：膠囊型 `border-radius: 9999px`（`rounded-full`）
- **陰影**：`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`（`shadow-sm`）
- **Hover 效果**：陰影升級 `shadow-md` 或主色加深

---

## 3. 共用元件規格

### Header（Sticky）

```
[花漾生活 (serif, rose-primary)]  [商品列表] [購物車🔴] [我的訂單*]  [登入 / 使用者名稱 + 登出]
```

- 高度 64px，`bg-white`，`border-b border-rose-bg`，`z-50`
- 購物車數字徽章：玫瑰粉背景，白字，`min-width: 20px`
- 「我的訂單」連結：登入後才顯示
- 登入後替換為使用者名稱 + 登出按鈕

### Footer

```
© 2026 花漾生活 Flower Life
```

- `bg-white`，`border-t border-rose-bg`，`py-6`，居中，`text-text-muted text-sm`

### 通知（Notification）

- 右上角浮動 Toast，`bg-text-primary text-white`，`rounded-xl`，3 秒自動消失

---

## 4. 頁面規格

### 4.1 首頁（`/`）

**Stitch Screen**：`7d5f4c0980284e279c79aaf27454ff82`（Desktop）、`6819f089f3154bc284b8333caf3a7c8e`（Mobile）

**版面結構（由上而下）**：

1. **Hero Banner**
   - 背景：`linear-gradient(to right, #FFF1EC, #FDEAE4)`，`rounded-3xl`
   - 左：H1「讓花裝點生活每一刻」（Noto Serif）、副標說明、「立即選購」膠囊按鈕（`#products` 錨點）
   - 右：花束圖片，`rounded-2xl shadow-lg`
   - RWD：手機改為上下堆疊

2. **精選推薦（4 欄）**
   - 標題「🌹 精選推薦」（Noto Serif，居中）
   - 取商品列表前 4 筆；卡片點擊跳轉商品詳情頁

3. **品牌故事（左圖右文）**
   - 左半：花藝師工作照
   - 右半：標題（Noto Serif）、兩段說明、斜體引言
   - RWD：手機改為上下堆疊

4. **所有商品（3 欄格，含分頁）**
   - `id="products"` 錨點
   - 每頁 10 筆（API `limit=10`）
   - 商品卡：方形圖 + 名稱 + 玫瑰粉價格 + 「加入購物車」按鈕（售完時 disabled）
   - 分頁器：圓形頁碼按鈕，當前頁玫瑰粉填色

5. **顧客評價（3 欄卡片）**
   - 金色 ★★★★★、引言、顧客名

6. **服務特色（3 欄）**
   - 🚚 快速配送（台北市區當日）
   - 🎁 精美包裝（專業手工）
   - 💚 滿額免運（消費滿 NT$500）

---

### 4.2 商品詳情（`/products/:id`）

**Stitch Screen**：`bf52649d6cc14584a3bb23b65394b0db`

**版面（兩欄）**：

- **左欄 1/2**：商品大圖，`aspect-square rounded-2xl shadow-sm`
- **右欄 1/2**：
  - H1 商品名（Noto Serif）
  - 價格（`text-3xl rose-primary font-bold`）
  - 庫存「✓ 尚有 N 件」（`text-sage`），售完改為「已售完」（`text-red-400`）
  - 商品描述段落
  - 數量選擇器：`- 數字 +`，圓角 border，min=1、max=stock
  - 「加入購物車」全寬膠囊按鈕；售完時 disabled
  - 淡粉購買須知卡（`bg-blush`）：花材說明、當日配送、滿額免運

---

### 4.3 購物車（`/cart`）

**Stitch Screen**：`6f436eeb38154b68806df360bdf72b71`

**版面**：

- **免運提示橫幅**：
  - 未達 NT$500：淡粉背景「🌸 再買 NT$X 即可享免運費！」
  - 已達：鼠尾草綠淡背景「✓ 已達免運門檻！」

- **商品列表**（白色大卡）：每列 = 縮圖 + 商品名+單價 + 數量選擇器 + 小計 + 刪除按鈕
  - 刪除點擊彈出確認 Dialog

- **訂單摘要卡**（Desktop：右側固定；Mobile：底部）：
  - 商品小計
  - 運費（滿 NT$500 免運，否則 NT$150）
  - 分隔線
  - 總計（`text-xl rose-primary font-bold`）
  - 「前往結帳」全寬膠囊按鈕

- **空購物車狀態**：圖示 + 說明 + 「去逛逛」按鈕

---

### 4.4 結帳（`/checkout`）

**Stitch Screen**：`85c8d7099658499696c0c316b356af39`

**版面（兩欄，lg breakpoint）**：

- **左欄 3/5**—「收件資訊」白色卡：
  - 收件人姓名（必填）
  - Email（必填，格式驗證）
  - 收件地址（必填）
  - 錯誤提示：`text-red-500 text-xs`，欄位 `border-red-400`

- **右欄 2/5**—「訂單摘要」白色卡（`sticky top-24`）：
  - 商品列表（名稱 × 數量 + 金額）
  - 小計 / 運費 / 總計
  - 「確認送出訂單」全寬膠囊按鈕（處理中 disabled + loading 文字）

---

### 4.5 登入／註冊（`/login`）

**Stitch Screen**：`bb1d8fc7cd5c4120971ae9772580cb42`

**版面（垂直居中卡片）**：

- 白色圓角大卡，`max-w-md`
- 頂部品牌名「花漾生活」（Noto Serif，rose-primary，居中）
- Tab 切換「登入 / 註冊」：選中 tab = 玫瑰粉填色 + 白字；未選中 = 白底 + 灰字
- **登入表單**：Email + 密碼 + 「登入」按鈕
- **註冊表單**：姓名 + Email + 密碼（≥6 字元）+ 「註冊」按鈕
- 成功後 redirect 回前一頁或首頁，JWT 存 localStorage

---

### 4.6 我的訂單（`/orders`）

**Stitch Screen**：`213a23a2067f44d683b6db1b6f5f4e7a`

**版面**：

- 頁面標題「我的訂單」（Noto Serif）
- 訂單卡片列表（`space-y-4`）：
  - 每張：訂單編號 + 日期（左）｜金額 + 狀態標籤 + 右箭頭（右）
  - 狀態標籤：
    - `pending`「待付款」：`bg-apricot/20 text-apricot`
    - `paid`「已付款」：`bg-sage/20 text-sage`
    - `failed`「付款失敗」：`bg-red-100 text-red-500`
  - 點擊整張卡片跳轉訂單詳情
- **空訂單狀態**：圖示 + 說明 + 「去逛逛」按鈕
- 需登入（前端判斷，未登入 redirect `/login`）

---

### 4.7 訂單詳情（`/orders/:id`）

**Stitch Screen**：`6709e2b5db734d7f8ed530bdee38baba`

**版面（單欄卡片堆疊）**：

- **付款結果 Alert**（`?payment=callback` / `?payment=success` / `?payment=fail`）：
  - success：鼠尾草綠背景「付款成功！感謝您的購買」
  - fail：紅色背景「付款未完成，請重試」
  - callback：淡黃背景「正在確認付款狀態...」

- **卡片 1「訂單資訊」**：訂單編號、建立日期、狀態標籤
- **卡片 2「收件資訊」**：收件人、Email、地址
- **卡片 3「商品明細」**：表格（名稱 / 單價 / 數量 / 小計）+ 總計列（rose-primary 粗體）
- **卡片 4「付款」**（僅 `pending` 狀態顯示）：
  - 「前往付款」（`bg-sage` 膠囊按鈕）→ POST `/api/orders/:id/payment` → 動態建 form submit 至 ECPay
  - 「查詢付款結果」（sage 空心按鈕）→ POST `/api/orders/:id/payment/query`
  - DEV 折疊區：「模擬成功 / 模擬失敗」（僅非 production 環境）

---

## 5. RWD 斷點策略

| 斷點 | 適用裝置 | 商品格欄數 |
|------|---------|------------|
| `sm`（640px+） | 小平板 | 2 欄 |
| `md`（768px+） | 平板 | 2 欄 |
| `lg`（1024px+） | 桌機 | 3 欄 |

- Header 導覽：手機版可考慮 hamburger 選單（現有版本無此功能，可列為後續改善）
- Hero：手機改為上下堆疊，圖片置頂

---

## 6. 尚未完成的功能（不在本次設計範圍）

- 手機版 hamburger 選單
- 訪客購物車登入後合併
- 商品搜尋 / 分類篩選
- 404 頁面美化

---

## 7. Stitch 資源索引

| 資源 | ID |
|------|-----|
| 專案 | `projects/14070587591868653062` |
| 設計系統 | `assets/2176297934944263533` |
| 首頁 Desktop | `screens/7d5f4c0980284e279c79aaf27454ff82` |
| 首頁 Mobile | `screens/6819f089f3154bc284b8333caf3a7c8e` |
| 商品詳情 Desktop | `screens/bf52649d6cc14584a3bb23b65394b0db` |
| 購物車 Desktop | `screens/6f436eeb38154b68806df360bdf72b71` |
| 結帳 Desktop | `screens/85c8d7099658499696c0c316b356af39` |
| 登入/註冊 Desktop | `screens/bb1d8fc7cd5c4120971ae9772580cb42` |
| 我的訂單 Desktop | `screens/213a23a2067f44d683b6db1b6f5f4e7a` |
| 訂單詳情 Desktop | `screens/6709e2b5db734d7f8ed530bdee38baba` |
