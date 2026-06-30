# 花漾生活前台 UI 重設計 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依照 Stitch 設計稿（`projects/14070587591868653062`），重新實作花漾生活前台全部 7 個頁面的 EJS 模板與共用元件，使視覺與互動符合規格文件定義的設計系統。

**Architecture:** 現有架構（EJS SSR + TailwindCSS v4 + Vue 3 CDN）維持不變，僅修改 `views/` 下的 EJS 模板檔案與 `public/css/input.css`。所有頁面共用 `views/layouts/front.ejs`、`views/partials/header.ejs`、`views/partials/footer.ejs`，各頁面 Vue 邏輯位於 `public/js/pages/` 不在本計畫修改範圍。

**Tech Stack:** Node.js 22、Express 4、EJS 3、TailwindCSS v4（`@import "tailwindcss"` + `@theme`）、Vue 3 CDN（`vue.global.prod.js`）、Noto Sans TC + Noto Serif TC（Google Fonts）

---

## 開發前置步驟

```bash
# 開兩個終端：
# Terminal 1 — CSS watch
npm run dev:css

# Terminal 2 — Server（每次改 EJS 後重啟）
npm run dev:server
```

驗證用帳號：`admin@hexschool.com` / `12345678`（admin），或自行註冊一般用戶。

---

## 檔案地圖

| 操作 | 路徑 |
|------|------|
| 修改 | `public/css/input.css` |
| 修改 | `views/partials/header.ejs` |
| 修改 | `views/partials/footer.ejs` |
| 修改 | `views/pages/index.ejs` |
| 修改 | `views/pages/product-detail.ejs` |
| 修改 | `views/pages/cart.ejs` |
| 修改 | `views/pages/checkout.ejs` |
| 修改 | `views/pages/login.ejs` |
| 修改 | `views/pages/orders.ejs` |
| 修改 | `views/pages/order-detail.ejs` |

---

## Task 1: CSS Design Token 更新

**Files:**
- Modify: `public/css/input.css`

- [ ] **Step 1: 確認並更新 CSS Token**

完整取代 `public/css/input.css` 內容：

```css
@import "tailwindcss";

@theme {
  --color-rose-primary: #C4727F;
  --color-rose-dark: #A85B67;
  --color-rose-light: #E8A5AE;
  --color-apricot: #D4956A;
  --color-sage: #7EA584;
  --color-cream: #FBF8F4;
  --color-blush: #FFF1EC;
  --color-rose-bg: #FDEAE4;
  --color-text-primary: #2C2A28;
  --color-text-secondary: #6B6560;
  --color-text-muted: #9A948E;
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  background-color: var(--color-cream);
  color: var(--color-text-primary);
}

/* Noto Serif TC 用於品牌標題 */
.font-serif-tc {
  font-family: 'Noto Serif TC', serif;
}
```

- [ ] **Step 2: 重新建置 CSS**

```bash
npm run css:build
```

預期輸出：`public/css/output.css` 更新，無 error。

- [ ] **Step 3: Commit**

```bash
git add public/css/input.css public/css/output.css
git commit -m "style: 補齊 CSS design token，新增 font-serif-tc utility"
```

---

## Task 2: Header 共用元件重設計

**Files:**
- Modify: `views/partials/header.ejs`

- [ ] **Step 1: 取代 header.ejs 為以下完整內容**

```html
<header class="sticky top-0 z-50 bg-white shadow-sm border-b border-rose-bg">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">

    <!-- 品牌名 -->
    <a href="/" class="text-xl font-bold text-rose-primary shrink-0" style="font-family:'Noto Serif TC',serif;">
      花漾生活
    </a>

    <!-- 導覽 -->
    <nav class="flex items-center gap-6 text-sm text-text-secondary">
      <a href="/" class="hover:text-rose-primary transition-colors">商品列表</a>
      <a href="/cart" class="relative hover:text-rose-primary transition-colors">
        購物車
        <span
          id="cart-badge"
          class="absolute -top-2 -right-5 bg-rose-primary text-white text-xs rounded-full w-5 h-5 hidden items-center justify-center leading-none"
        ></span>
      </a>
      <a id="orders-link" href="/orders" class="hover:text-rose-primary transition-colors hidden">
        我的訂單
      </a>
    </nav>

    <!-- 登入 / 使用者 -->
    <div id="auth-nav" class="flex items-center gap-3 text-sm shrink-0">
      <a href="/login" class="bg-rose-primary text-white px-4 py-1.5 rounded-full hover:bg-rose-dark transition-colors text-sm">登入</a>
    </div>

  </div>
</header>
```

- [ ] **Step 2: 重啟 server 並驗證**

```bash
npm run dev:server
```

開啟 http://localhost:3001，確認：
- 品牌名「花漾生活」顯示玫瑰粉 Noto Serif TC
- 導覽列含「商品列表 / 購物車 / 我的訂單（登入後才出現）」
- 右側顯示「登入」膠囊按鈕
- 登入後右側顯示使用者名稱 + 登出按鈕（由 `public/js/header-init.js` 控制）

- [ ] **Step 3: Commit**

```bash
git add views/partials/header.ejs
git commit -m "style: header 重設計 — 補齊導覽與 auth nav"
```

---

## Task 3: Footer 共用元件更新

**Files:**
- Modify: `views/partials/footer.ejs`

- [ ] **Step 1: 取代 footer.ejs**

```html
<footer class="bg-white border-t border-rose-bg py-8 mt-auto">
  <div class="max-w-7xl mx-auto px-4 text-center text-text-muted text-sm">
    <p class="mb-2 font-medium text-text-secondary" style="font-family:'Noto Serif TC',serif;">花漾生活 Flower Life</p>
    <p>&copy; 2026 花漾生活 Flower Life. All rights reserved.</p>
  </div>
</footer>
```

- [ ] **Step 2: 驗證頁尾出現在所有頁面底部**

開啟 http://localhost:3001，捲動至底部確認頁尾樣式正確。

- [ ] **Step 3: Commit**

```bash
git add views/partials/footer.ejs
git commit -m "style: footer 新增品牌名稱與版權文字"
```

---

## Task 4: 首頁重設計（`/`）

**Files:**
- Modify: `views/pages/index.ejs`

- [ ] **Step 1: 取代 index.ejs 為以下完整內容**

```html
<div id="app">
  <!-- Hero Banner -->
  <section class="relative bg-gradient-to-r from-blush to-rose-bg rounded-3xl overflow-hidden mb-12 -mx-4 px-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center py-12 md:py-20 px-6 md:px-12 gap-8">
      <div class="flex-1 text-center md:text-left">
        <p class="text-xs text-rose-primary tracking-widest uppercase mb-3">Handcrafted with Love</p>
        <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-4" style="font-family:'Noto Serif TC',serif;">
          讓花裝點生活每一刻
        </h1>
        <p class="text-text-secondary mb-6 leading-relaxed text-sm md:text-base">
          精選當季鮮花，由專業花藝師手工包裝。每一束花都傳遞著溫暖與祝福，為您的生活增添色彩與芬芳。
        </p>
        <a href="#products" class="inline-block bg-rose-primary text-white px-8 py-3 rounded-full hover:bg-rose-dark transition-colors text-sm font-medium shadow-sm">
          立即選購
        </a>
      </div>
      <div class="flex-1 max-w-md">
        <img
          src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600"
          alt="花束"
          class="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]"
        />
      </div>
    </div>
  </section>

  <!-- 精選推薦 4 欄 -->
  <section class="mb-12">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-text-primary mb-1" style="font-family:'Noto Serif TC',serif;">
        🌹 精選推薦
      </h2>
      <p class="text-text-muted text-sm">本季最受歡迎的花卉精選</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="(product, idx) in products.slice(0, 4)"
        :key="product.id"
        class="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
        @click="goToProduct(product.id)"
      >
        <div class="aspect-square overflow-hidden">
          <img
            :src="product.image_url || featuredImages[idx % 4]"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div class="p-3 text-center">
          <h3 class="font-medium text-sm text-text-primary truncate">{{ product.name }}</h3>
          <p class="text-rose-primary font-bold mt-1 text-sm">NT$ {{ product.price.toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 品牌故事 -->
  <section class="mb-12 bg-white rounded-3xl overflow-hidden shadow-sm">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600"
          alt="花藝師"
          class="w-full h-64 md:h-full object-cover"
        />
      </div>
      <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <h2 class="text-2xl font-bold text-text-primary mb-4" style="font-family:'Noto Serif TC',serif;">
          專心，做好一束花的感動
        </h2>
        <p class="text-text-secondary leading-relaxed mb-4 text-sm">
          花漾生活成立於 2020 年，我們相信每一朵花都有自己的故事。透過專業花藝師的巧手，將大自然的美好帶進您的日常生活中。
        </p>
        <p class="text-text-muted text-sm italic">
          「每一束花，都是一份用心的禮物。」
        </p>
      </div>
    </div>
  </section>

  <!-- 所有商品 3 欄 -->
  <section id="products" class="mb-12">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-text-primary mb-1" style="font-family:'Noto Serif TC',serif;">
        探索所有花藝
      </h2>
      <p class="text-text-muted text-sm">找到屬於您的那束花</p>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <div v-if="products.length === 0" class="text-center py-12">
        <div class="text-5xl mb-3">🌸</div>
        <p class="text-text-secondary mb-1">目前沒有商品</p>
        <p class="text-text-muted text-sm">請稍後再來看看</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in products"
          :key="product.id"
          @click="goToProduct(product.id)"
          class="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div class="aspect-square overflow-hidden">
            <img
              :src="product.image_url || 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400'"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="p-4">
            <h3 class="font-medium text-text-primary mb-1 truncate text-sm">{{ product.name }}</h3>
            <p class="text-rose-primary font-bold text-lg mb-3">NT$ {{ product.price.toLocaleString() }}</p>
            <button
              @click.stop="addToCart(product)"
              :disabled="product._adding || product.stock <= 0"
              class="w-full bg-rose-primary text-white py-2 rounded-full text-sm hover:bg-rose-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ product.stock <= 0 ? '已售完' : (product._adding ? '加入中...' : '加入購物車') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button
          v-for="p in pagination.totalPages"
          :key="p"
          @click="loadProducts(p)"
          class="w-10 h-10 rounded-full text-sm transition-colors font-medium"
          :class="p === pagination.page ? 'bg-rose-primary text-white shadow-sm' : 'bg-white text-text-secondary hover:bg-blush'"
        >
          {{ p }}
        </button>
      </div>
    </template>
  </section>

  <!-- 顧客評價 3 欄 -->
  <section class="mb-12">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-text-primary" style="font-family:'Noto Serif TC',serif;">
        顧客花束好評分享
      </h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-apricot mb-2 text-lg">★★★★★</div>
        <p class="text-text-secondary text-sm mb-4 leading-relaxed">「花束非常漂亮，包裝精緻，送給媽媽她超開心的！配送也很準時。」</p>
        <p class="text-text-muted text-xs font-medium">— 小美</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-apricot mb-2 text-lg">★★★★★</div>
        <p class="text-text-secondary text-sm mb-4 leading-relaxed">「第二次購買了，品質一如既往的好。花材新鮮，整體搭配很有美感。」</p>
        <p class="text-text-muted text-xs font-medium">— 阿明</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-apricot mb-2 text-lg">★★★★★</div>
        <p class="text-text-secondary text-sm mb-4 leading-relaxed">「女朋友收到花束超感動！會再回購的，推薦給大家！」</p>
        <p class="text-text-muted text-xs font-medium">— 大衛</p>
      </div>
    </div>
  </section>

  <!-- 服務特色 3 欄 -->
  <section class="mb-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl mb-3">🚚</div>
        <h3 class="font-semibold text-text-primary mb-1">快速配送</h3>
        <p class="text-text-muted text-sm">台北市區當日配送</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl mb-3">🎁</div>
        <h3 class="font-semibold text-text-primary mb-1">精美包裝</h3>
        <p class="text-text-muted text-sm">每束花都經過精心包裝</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="text-3xl mb-3">💚</div>
        <h3 class="font-semibold text-text-primary mb-1">滿額免運</h3>
        <p class="text-text-muted text-sm">消費滿 NT$ 500 免運費</p>
      </div>
    </div>
  </section>
</div>
```

- [ ] **Step 2: 重建 CSS 並驗證首頁**

```bash
npm run css:build && npm run dev:server
```

開啟 http://localhost:3001 驗證：
- Hero Banner 顯示淡粉漸層背景 + 大標題 + 「立即選購」膠囊按鈕
- 精選推薦 4 欄商品卡（點擊跳轉詳情）
- 品牌故事左圖右文
- 商品格 3 欄（手機 1 欄 / sm 2 欄 / lg 3 欄）
- 評價卡 + 服務特色卡各 3 欄

- [ ] **Step 3: Commit**

```bash
git add views/pages/index.ejs public/css/output.css
git commit -m "style: 首頁全版重設計 — Hero/精選/品牌故事/商品格/評價/服務特色"
```

---

## Task 5: 商品詳情頁重設計（`/products/:id`）

**Files:**
- Modify: `views/pages/product-detail.ejs`

- [ ] **Step 1: 取代 product-detail.ejs**

```html
<div id="app" data-product-id="<%= productId %>">

  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-16">
    <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <!-- Not Found -->
  <div v-else-if="notFound" class="text-center py-16">
    <div class="text-5xl mb-4">🌸</div>
    <h2 class="text-xl font-medium text-text-primary mb-2" style="font-family:'Noto Serif TC',serif;">找不到此商品</h2>
    <p class="text-text-muted text-sm mb-6">該商品可能已下架或不存在</p>
    <a href="/" class="inline-block bg-rose-primary text-white px-6 py-2 rounded-full text-sm hover:bg-rose-dark transition-colors">回到首頁</a>
  </div>

  <!-- 商品詳情 -->
  <div v-else-if="product" class="flex flex-col md:flex-row gap-8 md:gap-12">

    <!-- 左欄：商品圖 -->
    <div class="md:w-1/2">
      <div class="rounded-2xl overflow-hidden shadow-sm aspect-square">
        <img
          :src="product.image_url || 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600'"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- 右欄：商品資訊 -->
    <div class="md:w-1/2 flex flex-col">
      <h1 class="text-2xl md:text-3xl font-bold text-text-primary mb-2" style="font-family:'Noto Serif TC',serif;">
        {{ product.name }}
      </h1>
      <p class="text-3xl text-rose-primary font-bold mb-3">NT$ {{ product.price.toLocaleString() }}</p>

      <!-- 庫存狀態 -->
      <div class="mb-5">
        <span v-if="product.stock > 0" class="text-sage text-sm font-medium">✓ 尚有 {{ product.stock }} 件</span>
        <span v-else class="text-red-400 text-sm font-medium">✗ 已售完</span>
      </div>

      <!-- 商品描述 -->
      <p class="text-text-secondary leading-relaxed mb-6 text-sm">{{ product.description }}</p>

      <!-- 數量選擇器 -->
      <div class="flex items-center gap-4 mb-6">
        <span class="text-sm text-text-secondary font-medium">數量</span>
        <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            @click="decrease"
            :disabled="quantity <= 1"
            class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors disabled:opacity-40 text-lg"
          >−</button>
          <span class="w-12 h-10 flex items-center justify-center text-sm border-x border-gray-200 font-medium">
            {{ quantity }}
          </span>
          <button
            @click="increase"
            :disabled="quantity >= product.stock"
            class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors disabled:opacity-40 text-lg"
          >+</button>
        </div>
      </div>

      <!-- 加入購物車 -->
      <button
        @click="addToCart"
        :disabled="adding || product.stock <= 0"
        class="w-full bg-rose-primary text-white py-3 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {{ product.stock <= 0 ? '已售完' : (adding ? '加入中...' : '加入購物車') }}
      </button>

      <!-- 購買須知 -->
      <div class="bg-blush rounded-2xl p-5">
        <h3 class="font-semibold text-text-primary mb-3 text-sm">購買須知</h3>
        <ul class="text-text-muted text-xs space-y-2">
          <li class="flex items-start gap-2"><span class="text-rose-primary mt-0.5">•</span>花材依據季節供應，實際花束可能略有差異</li>
          <li class="flex items-start gap-2"><span class="text-rose-primary mt-0.5">•</span>台北市區可享當日配送服務</li>
          <li class="flex items-start gap-2"><span class="text-rose-primary mt-0.5">•</span>消費滿 NT$ 500 享免運優惠</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 驗證商品詳情頁**

1. 點擊首頁任一商品卡
2. 確認兩欄版型（大圖 + 商品資訊）
3. 確認庫存顯示（綠色 ✓）
4. 確認數量選擇器可增減
5. 點擊「加入購物車」確認出現 Toast 通知並跳轉

- [ ] **Step 3: Commit**

```bash
git add views/pages/product-detail.ejs
git commit -m "style: 商品詳情頁重設計 — 兩欄版型/庫存狀態/購買須知"
```

---

## Task 6: 購物車頁重設計（`/cart`）

**Files:**
- Modify: `views/pages/cart.ejs`

- [ ] **Step 1: 取代 cart.ejs**

```html
<div id="app">
  <h1 class="text-2xl font-bold text-text-primary mb-6" style="font-family:'Noto Serif TC',serif;">購物車</h1>

  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-16">
    <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <!-- 空購物車 -->
  <div v-else-if="items.length === 0" class="text-center py-16">
    <div class="text-5xl mb-3">🛒</div>
    <p class="text-text-secondary mb-1 font-medium">購物車是空的</p>
    <p class="text-text-muted text-sm mb-6">快去挑選喜歡的花束吧！</p>
    <a href="/" class="inline-block bg-rose-primary text-white px-8 py-3 rounded-full text-sm hover:bg-rose-dark transition-colors font-medium">去逛逛</a>
  </div>

  <template v-else>
    <!-- 免運提示 -->
    <div v-if="total < 500" class="bg-blush rounded-2xl p-4 mb-6 text-sm text-rose-primary text-center font-medium">
      🌸 再買 NT$ {{ (500 - total).toLocaleString() }} 即可享免運費！
    </div>
    <div v-else class="bg-sage/10 rounded-2xl p-4 mb-6 text-sm text-sage text-center font-medium">
      ✓ 已達免運門檻！
    </div>

    <!-- 商品列表 + 摘要（lg 改兩欄） -->
    <div class="flex flex-col lg:flex-row gap-6">

      <!-- 左：商品列表 -->
      <div class="flex-1">
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0"
          >
            <img
              :src="item.product.image_url || 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=100'"
              :alt="item.product.name"
              class="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-text-primary text-sm truncate mb-1">{{ item.product.name }}</h3>
              <p class="text-rose-primary text-sm font-medium">NT$ {{ item.product.price.toLocaleString() }}</p>
            </div>

            <!-- 數量控制 -->
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-text-secondary text-sm disabled:opacity-40"
              >−</button>
              <span class="w-8 h-8 flex items-center justify-center text-sm border-x border-gray-200 font-medium">
                {{ item.quantity }}
              </span>
              <button
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock"
                class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-text-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>

            <p class="text-text-primary font-semibold text-sm w-24 text-right shrink-0">
              NT$ {{ (item.product.price * item.quantity).toLocaleString() }}
            </p>

            <button
              @click="confirmDelete(item.id)"
              class="text-text-muted hover:text-red-400 transition-colors text-base shrink-0 ml-1"
              aria-label="刪除"
            >🗑</button>
          </div>
        </div>
      </div>

      <!-- 右：訂單摘要 -->
      <div class="lg:w-80 shrink-0">
        <div class="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-24">
          <h2 class="font-semibold text-text-primary mb-4">訂單摘要</h2>
          <div class="space-y-3 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-text-secondary">商品小計</span>
              <span class="text-text-primary">NT$ {{ total.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">運費</span>
              <span :class="total >= 500 ? 'text-sage' : 'text-text-primary'">
                {{ total >= 500 ? '免運' : 'NT$ 150' }}
              </span>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
            <span class="font-bold text-text-primary">總計</span>
            <span class="font-bold text-xl text-rose-primary">
              NT$ {{ (total + (total >= 500 ? 0 : 150)).toLocaleString() }}
            </span>
          </div>
          <button
            @click="goCheckout"
            class="w-full bg-rose-primary text-white py-3 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors"
          >
            前往結帳
          </button>
        </div>
      </div>

    </div>
  </template>

  <!-- 刪除確認 Dialog -->
  <div v-if="confirmVisible" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="confirmVisible = false"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
      <h3 class="text-lg font-semibold text-text-primary mb-2">確認移除</h3>
      <p class="text-text-secondary text-sm mb-6">確定要從購物車中移除這個商品嗎？</p>
      <div class="flex gap-3 justify-center">
        <button @click="confirmVisible = false" class="px-5 py-2 text-sm rounded-xl border border-gray-200 text-text-secondary hover:bg-gray-50 transition-colors">取消</button>
        <button @click="handleDelete" class="px-5 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">確認移除</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 驗證購物車頁**

1. 加入商品至購物車後，開啟 http://localhost:3001/cart
2. 確認免運提示橫幅（未滿 NT$500 顯示粉色；已滿顯示綠色）
3. 確認商品列表（圖 + 名稱 + 數量選擇器 + 小計 + 刪除）
4. 確認右側摘要（小計 / 運費 / 總計）
5. 點「前往結帳」跳轉 `/checkout`

- [ ] **Step 3: Commit**

```bash
git add views/pages/cart.ejs
git commit -m "style: 購物車重設計 — 免運提示/兩欄摘要/刪除 Dialog"
```

---

## Task 7: 結帳頁重設計（`/checkout`）

**Files:**
- Modify: `views/pages/checkout.ejs`

- [ ] **Step 1: 取代 checkout.ejs**

```html
<div id="app">
  <h1 class="text-2xl font-bold text-text-primary mb-6" style="font-family:'Noto Serif TC',serif;">結帳</h1>

  <div v-if="loading" class="flex justify-center py-16">
    <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else class="flex flex-col lg:flex-row gap-8">

    <!-- 左：收件資訊 -->
    <div class="lg:w-3/5">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="font-semibold text-text-primary mb-5">收件資訊</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-1.5 font-medium">收件人姓名 <span class="text-rose-primary">*</span></label>
            <input
              v-model="form.recipientName"
              type="text"
              placeholder="請輸入收件人姓名"
              class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
              :class="errors.recipientName ? 'border-red-400' : 'border-gray-200'"
            />
            <p v-if="errors.recipientName" class="text-red-500 text-xs mt-1">{{ errors.recipientName }}</p>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1.5 font-medium">Email <span class="text-rose-primary">*</span></label>
            <input
              v-model="form.recipientEmail"
              type="email"
              placeholder="請輸入 Email"
              class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
              :class="errors.recipientEmail ? 'border-red-400' : 'border-gray-200'"
            />
            <p v-if="errors.recipientEmail" class="text-red-500 text-xs mt-1">{{ errors.recipientEmail }}</p>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1.5 font-medium">收件地址 <span class="text-rose-primary">*</span></label>
            <input
              v-model="form.recipientAddress"
              type="text"
              placeholder="請輸入收件地址"
              class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
              :class="errors.recipientAddress ? 'border-red-400' : 'border-gray-200'"
            />
            <p v-if="errors.recipientAddress" class="text-red-500 text-xs mt-1">{{ errors.recipientAddress }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 右：訂單摘要 -->
    <div class="lg:w-2/5">
      <div class="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-24">
        <h2 class="font-semibold text-text-primary mb-4">訂單摘要</h2>
        <div class="space-y-2 mb-4">
          <div v-for="item in cartItems" :key="item.id" class="flex justify-between text-sm">
            <span class="text-text-secondary">{{ item.product.name }} × {{ item.quantity }}</span>
            <span class="text-text-primary font-medium">NT$ {{ (item.product.price * item.quantity).toLocaleString() }}</span>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-3 space-y-2 text-sm mb-4">
          <div class="flex justify-between">
            <span class="text-text-secondary">商品小計</span>
            <span class="text-text-primary">NT$ {{ cartTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-secondary">運費</span>
            <span :class="cartTotal >= 500 ? 'text-sage' : 'text-text-primary'">
              {{ cartTotal >= 500 ? '免運' : 'NT$ 150' }}
            </span>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-3 flex justify-between items-center mb-5">
          <span class="font-bold text-text-primary">總計</span>
          <span class="font-bold text-xl text-rose-primary">
            NT$ {{ (cartTotal + (cartTotal >= 500 ? 0 : 150)).toLocaleString() }}
          </span>
        </div>
        <button
          @click="submitOrder"
          :disabled="submitting"
          class="w-full bg-rose-primary text-white py-3 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors disabled:opacity-50"
        >
          {{ submitting ? '處理中...' : '確認送出訂單' }}
        </button>
      </div>
    </div>

  </div>
</div>
```

- [ ] **Step 2: 驗證結帳頁**

1. 填入收件資訊後送出
2. 確認欄位驗證錯誤提示（紅色邊框 + 紅字）
3. 確認訂單摘要（商品列表 + 運費 + 總計）
4. 成功後跳轉至訂單詳情頁

- [ ] **Step 3: Commit**

```bash
git add views/pages/checkout.ejs
git commit -m "style: 結帳頁重設計 — 兩欄版型/驗證提示/必填標記"
```

---

## Task 8: 登入／註冊頁重設計（`/login`）

**Files:**
- Modify: `views/pages/login.ejs`

- [ ] **Step 1: 取代 login.ejs**

```html
<div id="app">
  <div class="min-h-[65vh] flex items-center justify-center py-8">
    <div class="bg-white rounded-2xl shadow-sm w-full max-w-md p-8">

      <!-- 品牌名 -->
      <h1 class="text-2xl font-bold text-rose-primary text-center mb-6" style="font-family:'Noto Serif TC',serif;">
        花漾生活
      </h1>

      <!-- Tab 切換 -->
      <div class="flex mb-6 border border-gray-200 rounded-full overflow-hidden">
        <button
          @click="activeTab = 'login'; errors = {}"
          class="flex-1 py-2.5 text-sm font-medium transition-colors rounded-full"
          :class="activeTab === 'login' ? 'bg-rose-primary text-white' : 'text-text-secondary hover:bg-gray-50'"
        >
          登入
        </button>
        <button
          @click="activeTab = 'register'; errors = {}"
          class="flex-1 py-2.5 text-sm font-medium transition-colors rounded-full"
          :class="activeTab === 'register' ? 'bg-rose-primary text-white' : 'text-text-secondary hover:bg-gray-50'"
        >
          註冊
        </button>
      </div>

      <!-- 登入表單 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-text-secondary mb-1.5 font-medium">Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="請輸入 Email"
            class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
            :class="errors.email ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-sm text-text-secondary mb-1.5 font-medium">密碼</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
            :class="errors.password ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>
        <p v-if="errors.general" class="text-red-500 text-xs text-center">{{ errors.general }}</p>
        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-rose-primary text-white py-3 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors disabled:opacity-50 mt-2"
        >
          {{ submitting ? '登入中...' : '登入' }}
        </button>
      </form>

      <!-- 註冊表單 -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm text-text-secondary mb-1.5 font-medium">姓名</label>
          <input
            v-model="registerForm.name"
            type="text"
            placeholder="請輸入姓名"
            class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
            :class="errors.name ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <label class="block text-sm text-text-secondary mb-1.5 font-medium">Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="請輸入 Email"
            class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
            :class="errors.email ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-sm text-text-secondary mb-1.5 font-medium">密碼</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="至少 6 個字元"
            class="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-primary transition-colors"
            :class="errors.password ? 'border-red-400' : 'border-gray-200'"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>
        <p v-if="errors.general" class="text-red-500 text-xs text-center">{{ errors.general }}</p>
        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-rose-primary text-white py-3 rounded-full text-sm font-medium hover:bg-rose-dark transition-colors disabled:opacity-50 mt-2"
        >
          {{ submitting ? '註冊中...' : '立即註冊' }}
        </button>
      </form>

    </div>
  </div>
</div>
```

- [ ] **Step 2: 驗證登入/註冊頁**

1. 開啟 http://localhost:3001/login
2. 確認 Tab 切換（登入 ↔ 註冊，選中 tab 玫瑰粉背景）
3. 嘗試送出空表單，確認錯誤提示
4. 用有效帳密登入，確認跳轉首頁

- [ ] **Step 3: Commit**

```bash
git add views/pages/login.ejs
git commit -m "style: 登入/註冊頁重設計 — 圓角卡/Tab 切換/錯誤提示"
```

---

## Task 9: 我的訂單頁重設計（`/orders`）

**Files:**
- Modify: `views/pages/orders.ejs`

- [ ] **Step 1: 取代 orders.ejs**

```html
<div id="app">
  <h1 class="text-2xl font-bold text-text-primary mb-6" style="font-family:'Noto Serif TC',serif;">我的訂單</h1>

  <div v-if="loading" class="flex justify-center py-16">
    <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else-if="orders.length === 0" class="text-center py-16">
    <div class="text-5xl mb-3">📦</div>
    <p class="text-text-secondary mb-1 font-medium">尚無訂單</p>
    <p class="text-text-muted text-sm mb-6">快去選購喜歡的花束吧！</p>
    <a href="/" class="inline-block bg-rose-primary text-white px-8 py-3 rounded-full text-sm hover:bg-rose-dark transition-colors font-medium">去逛逛</a>
  </div>

  <div v-else class="space-y-3">
    <a
      v-for="order in orders"
      :key="order.id"
      :href="'/orders/' + order.id"
      class="flex items-center justify-between bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow block"
    >
      <div>
        <p class="text-sm font-medium text-text-primary">{{ order.order_no }}</p>
        <p class="text-xs text-text-muted mt-1">{{ new Date(order.created_at).toLocaleDateString('zh-TW') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-bold text-text-primary text-sm">NT$ {{ order.total_amount.toLocaleString() }}</span>
        <span
          class="text-xs px-3 py-1 rounded-full font-medium"
          :class="{
            'bg-apricot/20 text-apricot': order.status === 'pending',
            'bg-sage/20 text-sage': order.status === 'paid',
            'bg-red-100 text-red-500': order.status === 'failed'
          }"
        >
          {{ statusMap[order.status]?.label || order.status }}
        </span>
        <span class="text-text-muted text-sm">→</span>
      </div>
    </a>
  </div>
</div>
```

- [ ] **Step 2: 驗證訂單列表頁**

1. 登入後開啟 http://localhost:3001/orders
2. 確認每筆訂單卡片顯示：訂單編號、日期、金額、狀態標籤
3. 狀態標籤顏色：`pending`=橙色、`paid`=綠色、`failed`=紅色
4. 點擊卡片跳轉訂單詳情

- [ ] **Step 3: Commit**

```bash
git add views/pages/orders.ejs
git commit -m "style: 訂單列表重設計 — 狀態標籤色彩系統/卡片 hover"
```

---

## Task 10: 訂單詳情頁重設計（`/orders/:id`）

**Files:**
- Modify: `views/pages/order-detail.ejs`

- [ ] **Step 1: 取代 order-detail.ejs**

```html
<div id="app" data-order-id="<%= orderId %>" data-payment-result="<%= paymentResult %>">
  <h1 class="text-2xl font-bold text-text-primary mb-6" style="font-family:'Noto Serif TC',serif;">訂單詳情</h1>

  <div v-if="loading" class="flex justify-center py-16">
    <div class="w-8 h-8 border-4 border-rose-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <template v-else-if="order">

    <!-- 付款結果 Alert -->
    <div
      v-if="paymentResult && paymentMessages[paymentResult]"
      class="rounded-2xl p-4 mb-6 text-sm font-medium"
      :class="paymentMessages[paymentResult].cls"
    >
      {{ paymentMessages[paymentResult].text }}
    </div>

    <!-- 卡片 1：訂單資訊 -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-text-secondary font-medium">訂單編號</p>
          <p class="text-text-primary font-mono text-sm mt-1">{{ order.order_no }}</p>
          <p class="text-xs text-text-muted mt-2">建立日期：{{ new Date(order.created_at).toLocaleDateString('zh-TW') }}</p>
        </div>
        <span
          class="text-xs px-3 py-1 rounded-full font-medium"
          :class="{
            'bg-apricot/20 text-apricot': order.status === 'pending',
            'bg-sage/20 text-sage': order.status === 'paid',
            'bg-red-100 text-red-500': order.status === 'failed'
          }"
        >
          {{ statusMap[order.status]?.label || order.status }}
        </span>
      </div>
    </div>

    <!-- 卡片 2：收件資訊 -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <h2 class="font-semibold text-text-primary mb-4">收件資訊</h2>
      <dl class="text-sm space-y-2">
        <div class="flex gap-2">
          <dt class="text-text-muted w-16 shrink-0">收件人</dt>
          <dd class="text-text-secondary">{{ order.recipient_name }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="text-text-muted w-16 shrink-0">Email</dt>
          <dd class="text-text-secondary">{{ order.recipient_email }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="text-text-muted w-16 shrink-0">地址</dt>
          <dd class="text-text-secondary">{{ order.recipient_address }}</dd>
        </div>
      </dl>
    </div>

    <!-- 卡片 3：商品明細 -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <h2 class="font-semibold text-text-primary mb-4">商品明細</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-text-muted text-xs">
            <th class="text-left py-2 font-normal">商品名稱</th>
            <th class="text-right py-2 font-normal">單價</th>
            <th class="text-right py-2 font-normal">數量</th>
            <th class="text-right py-2 font-normal">小計</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id" class="border-b border-gray-50 last:border-0">
            <td class="py-3 text-text-primary">{{ item.product_name }}</td>
            <td class="py-3 text-right text-text-secondary">NT$ {{ item.product_price.toLocaleString() }}</td>
            <td class="py-3 text-right text-text-secondary">{{ item.quantity }}</td>
            <td class="py-3 text-right text-text-primary font-medium">NT$ {{ (item.product_price * item.quantity).toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="pt-4 text-right font-bold text-text-primary text-sm">總計</td>
            <td class="pt-4 text-right font-bold text-rose-primary text-lg">NT$ {{ order.total_amount.toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- 卡片 4：付款（僅 pending 狀態） -->
    <div v-if="order.status === 'pending'" class="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <h2 class="font-semibold text-text-primary mb-4">付款</h2>
      <div class="flex flex-wrap gap-3">
        <button
          @click="handleEcpay"
          :disabled="paying || querying"
          class="bg-sage text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-sage/90 transition-colors disabled:opacity-50"
        >
          {{ paying ? '導向付款頁面中...' : '前往付款' }}
        </button>
        <button
          v-if="paymentResult === 'callback' || paymentResult === null"
          @click="handleQueryPayment"
          :disabled="querying || paying"
          class="bg-white text-sage border border-sage px-8 py-3 rounded-full text-sm font-medium hover:bg-sage/5 transition-colors disabled:opacity-50"
        >
          {{ querying ? '查詢中...' : '查詢付款結果' }}
        </button>
      </div>

      <!-- DEV 模擬付款 -->
      <details class="text-xs text-text-muted mt-4">
        <summary class="cursor-pointer hover:text-text-secondary select-none">DEV: 模擬付款</summary>
        <div class="flex gap-3 mt-3">
          <button
            @click="handlePaySuccess"
            :disabled="paying"
            class="border border-gray-300 text-gray-500 px-4 py-1.5 rounded-full text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
          >模擬成功</button>
          <button
            @click="handlePayFail"
            :disabled="paying"
            class="border border-gray-300 text-gray-500 px-4 py-1.5 rounded-full text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
          >模擬失敗</button>
        </div>
      </details>
    </div>

  </template>
</div>
```

- [ ] **Step 2: 驗證訂單詳情頁**

1. 從「我的訂單」點進任一訂單
2. 確認 4 張卡片（訂單資訊 / 收件資訊 / 商品明細 / 付款）
3. 付款卡片僅 `pending` 訂單顯示
4. 確認「前往付款」可跳轉 ECPay（需 `.env` 設定 ECPay 金鑰）
5. 使用 DEV 模擬付款功能，確認狀態更新

- [ ] **Step 3: Commit**

```bash
git add views/pages/order-detail.ejs
git commit -m "style: 訂單詳情頁重設計 — 4 張卡片/狀態徽章/付款按鈕"
```

---

## Task 11: 整合驗證

**Files:** 無修改

- [ ] **Step 1: 執行全套自動化測試，確認後端邏輯未受影響**

```bash
npm test
```

預期：所有測試通過（EJS 變更不影響 API 測試）。

- [ ] **Step 2: 重建 CSS**

```bash
npm run css:build
```

- [ ] **Step 3: 啟動服務完整驗證**

```bash
npm start
```

依序開啟並手動驗證：

| URL | 驗證重點 |
|-----|---------|
| http://localhost:3001/ | Hero / 精選 / 品牌故事 / 商品格 / 評價 / 服務特色 |
| http://localhost:3001/products/1 | 兩欄版型、數量選擇器、加入購物車 |
| http://localhost:3001/cart | 免運橫幅、商品列表、訂單摘要 |
| http://localhost:3001/checkout | 收件表單、訂單摘要、欄位驗證 |
| http://localhost:3001/login | Tab 切換、表單驗證、登入成功 |
| http://localhost:3001/orders | 訂單列表、狀態標籤 |
| http://localhost:3001/orders/:id | 4 卡片結構、付款按鈕 |

- [ ] **Step 4: 最終 commit**

```bash
git add public/css/output.css
git commit -m "style: 前台 UI 重設計完成 — 整合驗證通過"
```

---

## 附錄：色彩速查

| 用途 | Tailwind Class |
|------|---------------|
| 主要 CTA 按鈕 | `bg-rose-primary text-white hover:bg-rose-dark` |
| 膠囊按鈕 | `rounded-full` |
| 卡片 | `bg-white rounded-2xl shadow-sm` |
| 商品價格 | `text-rose-primary font-bold` |
| 在售庫存 | `text-sage` |
| 訂單待付款 | `bg-apricot/20 text-apricot` |
| 訂單已付款 | `bg-sage/20 text-sage` |
| 訂單失敗 | `bg-red-100 text-red-500` |
| 頁面背景 | `bg-cream`（由 body 預設） |
| 淡粉 Section | `bg-blush` |
| 標題字型 | `style="font-family:'Noto Serif TC',serif;"` |
