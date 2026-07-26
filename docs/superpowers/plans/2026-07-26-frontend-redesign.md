# 花漾生活前台重設計（苗圃吊牌與市集收據）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Pencil MCP 中繪製花漾生活前台 8 個頁面（含共用元件）的全新設計稿，並匯出截圖與規格文件至 `docs/design/`。

**Architecture:** 先建立設計 Variables 與 8 個 reusable component（Stamp Button、Status Stamp、Header、Footer、Product Tag Card、Receipt Row、Receipt Total、Ticket Form Card），再以 `ref` instance 組裝 8 個頁面 frame，最後匯出截圖並撰寫對照文件。

**Tech Stack:** Pencil MCP（`.pen` 檔案、`batch_design` JS API）、Markdown（規格文件）。

## Global Constraints

- **色彩實作方式（Task 1 執行後確認）**：此 Pencil 版本的 `batch_design` 不支援 `Update(document,{variables:...})`，變數系統無法使用。**已改用備援方案**：本計畫所有程式碼區塊中出現的 `"$paper"`、`"$paper-deep"`、`"$ink"`、`"$ink-soft"`、`"$moss"`、`"$stamp"`、`"$gold-thread"` 字串**皆已替換為對應字面 hex 色碼**（`#F2EDE1`、`#E4DCC8`、`#23261D`、`#5B5D4E`、`#445540`、`#C1442C`、`#B98B2E`）。之後所有任務直接依計畫程式碼區塊中的字面色碼執行即可，不需再嘗試建立變數。
- **工作檔案路徑（已由使用者建立）**：`docs/design/20260726.pen`。所有 Pencil MCP 工具呼叫（`get_editor_state`、`batch_design`、`get_screenshot`、`export_nodes`、`get_variables` 等）**必須**帶上 `filePath: "docs/design/20260726.pen"` 參數，避免誤操作到其他同時開啟的 `.pen` 檔案（例如 `pencil-welcome-desktop.pen`）
- 色彩 token（7 個，色碼需完全一致）：`$paper #F2EDE1`、`$paper-deep #E4DCC8`、`$ink #23261D`、`$ink-soft #5B5D4E`、`$moss #445540`、`$stamp #C1442C`、`$gold-thread #B98B2E`
- 字型：展示大標（拉丁/數字）`Fraunces`；中文大標 `Noto Serif TC`；內文/按鈕 `Noto Sans TC`；帳目/價格/單號 `JetBrains Mono`
- 形狀：吊牌/票根用撕線＋圓孔，直角或極小圓角（4px），禁止膠囊型按鈕；陰影僅用 `0 1px 2px rgba(35,38,29,0.08)`
- 頁面範圍（8 頁，不含後台管理頁）：首頁 `/`、商品詳情 `/products/:id`、購物車 `/cart`、結帳 `/checkout`、登入 `/login`、我的訂單 `/orders`、訂單詳情 `/orders/:id`、404
- **RWD 範圍**：本計畫僅繪製 Desktop（1440px）版面；spec 第 6 節的 RWD 策略表為日後 EJS/Tailwind 實作階段的換算依據，本次不額外產出 Mobile frame（此為明確排除項，非遺漏）
- 交付物路徑：截圖 `docs/design/screenshots/<page-slug>.png`；規格文件 `docs/design/README.md`（皆與 `.pen` 檔案同層 `docs/design/` 目錄）
- 範圍外：後台管理頁重設計、EJS/TailwindCSS 實際程式碼落地
- 每個任務開始時，若是新的 Pencil 工作階段（含每個 subagent），第一步必須呼叫 `mcp__pencil__get_editor_state({include_schema: true, filePath: "docs/design/20260726.pen"})` 載入目前作用中 `.pen` 檔案的 schema 與規則，否則後續 `batch_design` 呼叫會因不熟悉 schema 而出錯
- 所有 `batch_design` 呼叫請一次聚焦一個 frame/元件；若回傳 warnings，必須在下一個 `batch_design` 呼叫中修正
- Pencil `ref` instance 覆寫子節點時優先用**節點名稱**（如 `"Label"`）而非 ID，除非該名稱在元件內不唯一

---

### Task 1: 建立設計 Variables

**Files:** 無實體檔案（Pencil 文件內部狀態）

**Interfaces:**
- Produces：Pencil 顏色變數 `$paper`、`$paper-deep`、`$ink`、`$ink-soft`、`$moss`、`$stamp`、`$gold-thread`，後續所有任務的 `fill`/`stroke` 屬性皆可用 `"$變數名"` 字串引用

- [ ] **Step 1: 載入 schema**

呼叫 `mcp__pencil__get_editor_state({include_schema: true})`，確認目前作用中檔案（非 `pencil-welcome-desktop.pen` 這類與本專案無關的範例檔）。

- [ ] **Step 2: 建立變數**

呼叫 `mcp__pencil__batch_design`：

```js
Update(document, {
  variables: {
    "paper": { type: "color", value: "#F2EDE1" },
    "paper-deep": { type: "color", value: "#E4DCC8" },
    "ink": { type: "color", value: "#23261D" },
    "ink-soft": { type: "color", value: "#5B5D4E" },
    "moss": { type: "color", value: "#445540" },
    "stamp": { type: "color", value: "#C1442C" },
    "gold-thread": { type: "color", value: "#B98B2E" }
  }
})
```

- [ ] **Step 3: 驗證**

呼叫 `mcp__pencil__get_variables`，確認回傳 7 筆變數且色碼與上表完全一致。

**若此呼叫失敗**（Pencil 版本不支援於 `document` 上直接寫入 `variables`）：改用**備援方案**——後續所有任務直接使用字面色碼（例如 `fill:"#C1442C"`）取代 `"#C1442C"`，並在 Task 16 的 `docs/design/README.md` 中註明「本次設計未使用 Pencil 變數系統，色彩以字面值套用」。此為本計畫唯一允許的分支決策，後續任務一律照此二選一執行到底，不可中途切換。

---

### Task 2: 建立 Stamp Button 與 Status Stamp 元件

**Files:** 無實體檔案

**Interfaces:**
- Consumes：Task 1 產出的 `$stamp`、`$moss` 變數（或字面色碼，依 Task 1 結果）
- Produces：reusable component `"Stamp Button"`（子節點 text 名稱固定為 `"Label"`，預設文字「查看更多」）；reusable component `"Status Stamp"`（子節點 text 名稱固定為 `"Label"`，預設文字「已付款」，根節點可覆寫 `stroke`／`fill`）

- [ ] **Step 1: 建立元件**

```js
const btnPos = FindEmptySpace({width:220, height:100, direction:"top", padding:100})
stampBtn = Insert(document, {type:"frame", name:"Stamp Button", x:btnPos.x, y:btnPos.y, reusable:true, placeholder:true, layout:"horizontal", justifyContent:"center", alignItems:"center", padding:[14,28], cornerRadius:4, fill:"#C1442C"})
Insert(stampBtn, {type:"text", name:"Label", content:"查看更多", fontFamily:"Noto Sans TC", fontWeight:"700", fontSize:14, letterSpacing:0.5, fill:"#FFFFFF"})
Update(stampBtn, {placeholder:false})

const stampPos = FindEmptySpace({width:160, height:70, direction:"right", padding:60, nodeId:stampBtn})
statusStamp = Insert(document, {type:"frame", name:"Status Stamp", x:stampPos.x, y:stampPos.y, reusable:true, placeholder:true, layout:"horizontal", justifyContent:"center", alignItems:"center", padding:[6,16], cornerRadius:4, stroke:"#445540", strokeWidth:1.5})
Insert(statusStamp, {type:"text", name:"Label", content:"已付款", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:12, letterSpacing:1, fill:"#445540"})
Update(statusStamp, {placeholder:false})
```

- [ ] **Step 2: 截圖驗證**

呼叫 `mcp__pencil__get_screenshot` 檢視 `stampBtn` 與 `statusStamp`：確認白字在 `$stamp` 紅底上對比足夠、`Status Stamp` 邊框與文字在 `$paper` 背景上清晰可辨。若有裁切或對齊問題，直接 `Update` 修正尺寸/padding，不要刪除重建。

---

### Task 3: 建立 Header 與 Footer 元件

**Files:** 無實體檔案

**Interfaces:**
- Produces：reusable component `"Header"`（含子節點 `"Cart Label"`、`"Badge Count"`、`"Login"` 供頁面依登入狀態覆寫文字）；reusable component `"Footer"`

- [ ] **Step 1: 建立 Header**

```js
const pos = FindEmptySpace({width:1440,height:88,direction:"top",padding:120})
header = Insert(document, {type:"frame", name:"Header", x:pos.x, y:pos.y, reusable:true, placeholder:true, layout:"horizontal", justifyContent:"space_between", alignItems:"center", width:1440, height:88, padding:[0,64], fill:"#F2EDE1", stroke:"#23261D", strokeWidth:{bottom:1}, strokeAlignment:"inner"})

logo = Insert(header, {type:"frame", name:"Logo", layout:"vertical", gap:2})
Insert(logo, {type:"text", name:"Eyebrow", content:"FLORA MARKET · NO.24", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:2, fill:"#5B5D4E"})
Insert(logo, {type:"text", name:"Wordmark", content:"花漾生活", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:24, fill:"#23261D"})

nav = Insert(header, {type:"frame", name:"Nav", layout:"horizontal", gap:40, alignItems:"center"})
for (const label of ["首頁","我的訂單"]) {
  Insert(nav, {type:"text", name:label, content:label, fontFamily:"Noto Sans TC", fontSize:14, fill:"#5B5D4E"})
}

right = Insert(header, {type:"frame", name:"Right", layout:"horizontal", gap:24, alignItems:"center"})
Insert(right, {type:"text", name:"Login", content:"登入", fontFamily:"Noto Sans TC", fontSize:14, fill:"#5B5D4E"})
cartBtn = Insert(right, {type:"frame", name:"Cart Button", layout:"horizontal", gap:8, alignItems:"center", padding:[10,18], cornerRadius:4, fill:"#445540"})
Insert(cartBtn, {type:"icon", name:"Cart Icon", library:"lucide", icon:"shopping-basket", width:16, height:16, fill:"#FFFFFF"})
Insert(cartBtn, {type:"text", name:"Cart Label", content:"購物車", fontFamily:"Noto Sans TC", fontWeight:"600", fontSize:13, fill:"#FFFFFF"})
badge = Insert(cartBtn, {type:"frame", name:"Badge", layout:"horizontal", justifyContent:"center", alignItems:"center", width:18, height:18, cornerRadius:9, fill:"#C1442C"})
Insert(badge, {type:"text", name:"Badge Count", content:"2", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:10, fill:"#FFFFFF"})

Update(header, {placeholder:false})
```

- [ ] **Step 2: 建立 Footer**

```js
const pos = FindEmptySpace({width:1440,height:96,direction:"bottom",padding:80,nodeId:header})
footer = Insert(document, {type:"frame", name:"Footer", x:pos.x, y:pos.y, reusable:true, placeholder:true, layout:"horizontal", justifyContent:"center", alignItems:"center", width:1440, height:96, fill:"#E4DCC8"})
Insert(footer, {type:"text", name:"Copyright", content:"© 2026 花漾生活 Flora Market · 本設計稿由 Pencil 製作", fontFamily:"JetBrains Mono", fontSize:12, fill:"#5B5D4E"})
Update(footer, {placeholder:false})
```

（`header` 變數在同一個 `batch_design` 呼叫中無法跨 Step 共用；若 Step 2 為獨立呼叫，先用 `get_editor_state` 找到名稱為 `"Header"` 的元件 id 取代 `nodeId:header`。）

- [ ] **Step 3: 截圖驗證**

`get_screenshot` 檢查 Header 三欄是否對齊、Badge 數字置中；Footer 文字置中且與 `$paper-deep` 對比足夠。

---

### Task 4: 建立 Product Tag Card 元件

**Files:** 無實體檔案

**Interfaces:**
- Consumes：Task 2 的 `"Stamp Button"`、`"Status Stamp"` 元件 id（呼叫 `get_editor_state`，於 `Reusable Components` 清單中依名稱找出，下稱 `STAMP_BUTTON_ID`、`STATUS_STAMP_ID`）
- Produces：reusable component `"Product Tag Card"`，子節點名稱：`"Catalog No"`、`"Product Name"`、`"Price"`、`"Stock Stamp"`（ref instance）、`"Add To Cart"`（ref instance）、`"Image"`（供 `Generate` 套圖）

- [ ] **Step 1: 查詢依賴元件 id**

呼叫 `mcp__pencil__get_editor_state({include_schema:false})`，記下 `Reusable Components` 清單中 `"Stamp Button"` 與 `"Status Stamp"` 的 id。

- [ ] **Step 2: 建立元件**

```js
const pos = FindEmptySpace({width:320,height:460,direction:"top",padding:140})
tagCard = Insert(document, {type:"frame", name:"Product Tag Card", x:pos.x, y:pos.y, reusable:true, placeholder:true, layout:"vertical", width:320, fill:"#E4DCC8", cornerRadius:6, clip:true})

tearRow = Insert(tagCard, {type:"frame", name:"Tear Line", layout:"horizontal", justifyContent:"center", width:"fill_container", padding:[10,0]})
Insert(tearRow, {type:"ellipse", name:"Hole", width:10, height:10, fill:"#F2EDE1"})

imageFrame = Insert(tagCard, {type:"frame", name:"Image", width:"fill_container", height:320, fill:"#F2EDE1"})
Generate(imageFrame, "stock", "pink rose bouquet")

info = Insert(tagCard, {type:"frame", name:"Info", layout:"vertical", width:"fill_container", padding:[16,18], gap:6})
Insert(info, {type:"text", name:"Catalog No", content:"No.014 · 玫瑰", fontFamily:"JetBrains Mono", fontSize:11, letterSpacing:1, fill:"#5B5D4E"})
Insert(info, {type:"text", name:"Product Name", content:"粉霧玫瑰花束", fontFamily:"Noto Serif TC", fontWeight:"600", fontSize:18, fill:"#23261D"})
Insert(info, {type:"text", name:"Price", content:"NT$ 1,280", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:16, fill:"#C1442C"})

actionRow = Insert(info, {type:"frame", name:"Action Row", layout:"horizontal", justifyContent:"space_between", alignItems:"center", width:"fill_container", padding:[8,0,0,0]})
Insert(actionRow, {type:"ref", ref:"STATUS_STAMP_ID", name:"Stock Stamp", descendants:{"Label":{content:"現貨"}}})
Insert(actionRow, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Add To Cart", padding:[8,16], descendants:{"Label":{content:"+ 加入購物車", fontSize:12}}})

Update(tagCard, {placeholder:false})
```

將 `"STATUS_STAMP_ID"` / `"STAMP_BUTTON_ID"` 換成 Step 1 查到的實際 id。

- [ ] **Step 3: 截圖驗證**

`get_screenshot` 檢查：圖片是否鋪滿方形區域、撕線圓孔是否可見、售完狀態時（另建一個測試 instance 覆寫 `Stock Stamp` 為「已售完」＋ `$stamp` 色）文字與底色對比是否足夠。確認後刪除測試 instance，只保留元件本身。

---

### Task 5: 建立 Receipt Row 與 Receipt Total 元件

**Files:** 無實體檔案

**Interfaces:**
- Produces：reusable component `"Receipt Row"`（子節點 `"Item Name"`、`"Qty"`、`"Unit Price"`、`"Subtotal"`）；reusable component `"Receipt Total"`（子節點 `"Total Value"`）

- [ ] **Step 1: 建立元件**

```js
const pos = FindEmptySpace({width:480,height:40,direction:"top",padding:140})
receiptRow = Insert(document, {type:"frame", name:"Receipt Row", x:pos.x, y:pos.y, reusable:true, placeholder:true, layout:"horizontal", alignItems:"center", width:480, gap:12})
Insert(receiptRow, {type:"text", name:"Item Name", content:"粉霧玫瑰花束", textGrowth:"fixed-width", width:"fill_container", fontFamily:"Noto Sans TC", fontSize:13, fill:"#23261D"})
Insert(receiptRow, {type:"text", name:"Qty", content:"x1", textGrowth:"fixed-width", width:50, textAlign:"right", fontFamily:"JetBrains Mono", fontSize:13, fill:"#5B5D4E"})
Insert(receiptRow, {type:"text", name:"Unit Price", content:"1,280", textGrowth:"fixed-width", width:80, textAlign:"right", fontFamily:"JetBrains Mono", fontSize:13, fill:"#5B5D4E"})
Insert(receiptRow, {type:"text", name:"Subtotal", content:"1,280", textGrowth:"fixed-width", width:80, textAlign:"right", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:13, fill:"#23261D"})
Update(receiptRow, {placeholder:false})

const pos2 = FindEmptySpace({width:480,height:90,direction:"right",padding:60,nodeId:receiptRow})
receiptTotal = Insert(document, {type:"frame", name:"Receipt Total", x:pos2.x, y:pos2.y, reusable:true, placeholder:true, layout:"vertical", width:480, gap:10})
dashRow = Insert(receiptTotal, {type:"frame", name:"Dashed Divider", layout:"horizontal", width:"fill_container", gap:6})
for (let i=0;i<34;i++) Insert(dashRow,{type:"rectangle",name:"Dash",width:8,height:1,fill:"#5B5D4E"})
totalRow = Insert(receiptTotal, {type:"frame", name:"Total Row", layout:"horizontal", justifyContent:"space_between", alignItems:"center", width:"fill_container"})
Insert(totalRow, {type:"text", name:"Total Label", content:"合計", fontFamily:"Noto Serif TC", fontWeight:"600", fontSize:16, fill:"#23261D"})
Insert(totalRow, {type:"text", name:"Total Value", content:"NT$ 2,640", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:20, fill:"#C1442C"})
Update(receiptTotal, {placeholder:false})
```

- [ ] **Step 2: 截圖驗證**

確認 4 欄對齊（品項左靠、數量/單價/小計右靠且視覺對齊同一右邊界）、虛線分隔清晰、合計金額為視覺焦點。

---

### Task 6: 建立 Ticket Form Card 元件

**Files:** 無實體檔案

**Interfaces:**
- Produces：reusable component `"Ticket Form Card"`，子節點 `"Title"`（標題文字，供各頁覆寫如「收件資訊」「登入」）

- [ ] **Step 1: 建立元件**

```js
const pos = FindEmptySpace({width:440,height:200,direction:"top",padding:140})
ticketCard = Insert(document, {type:"frame", name:"Ticket Form Card", x:pos.x, y:pos.y, reusable:true, placeholder:true, layout:"vertical", width:440, fill:"#E4DCC8", cornerRadius:6, padding:32, gap:20})
notches = Insert(ticketCard, {type:"frame", name:"Ticket Notches", layout:"horizontal", justifyContent:"space_between", width:460, x:-10, y:20, layoutPosition:"absolute"})
Insert(notches,{type:"ellipse",name:"Notch Left",width:20,height:20,fill:"#F2EDE1"})
Insert(notches,{type:"ellipse",name:"Notch Right",width:20,height:20,fill:"#F2EDE1"})
Insert(ticketCard, {type:"text", name:"Title", content:"收件資訊", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:20, fill:"#23261D"})
fieldsPlaceholder = Insert(ticketCard, {type:"frame", name:"Fields Slot", layout:"vertical", width:"fill_container", gap:16, slot:false})
Update(ticketCard, {placeholder:false})
```

- [ ] **Step 2: 截圖驗證**

確認票根圓孔落在卡片左右邊緣（模擬騎縫章視覺）、標題與 `$paper-deep` 底色對比足夠、`Fields Slot` 有足夠空間容納後續表單欄位（Task 11、13 會在此 slot 下插入實際欄位）。

---

### Task 7: 首頁 `/`

**Files:** 無實體檔案

**Interfaces:**
- Consumes：`"Header"`、`"Footer"`、`"Product Tag Card"`、`"Stamp Button"` 元件 id（`get_editor_state` 查詢）

- [ ] **Step 1: 查詢依賴元件 id**，記下 `HEADER_ID`、`FOOTER_ID`、`PRODUCT_CARD_ID`、`STAMP_BUTTON_ID`

- [ ] **Step 2: 建立頁面 frame 與 Hero**

```js
const pos = FindEmptySpace({width:1440,height:3400,padding:160})
homePage = Insert(document, {type:"frame", name:"首頁 Home", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(homePage, {type:"ref", ref:"HEADER_ID", name:"Header"})

hero = Insert(homePage, {type:"frame", name:"Hero", layout:"horizontal", width:"fill_container", padding:[64,64], gap:0})
heroImg = Insert(hero, {type:"frame", name:"Hero Image", width:640, height:520, fill:"#E4DCC8", stroke:"#23261D", strokeWidth:1, strokeAlignment:"inner"})
Generate(heroImg, "stock", "flower market stall")
heroText = Insert(hero, {type:"frame", name:"Hero Text", layout:"vertical", width:"fill_container", padding:[40,56], gap:16, justifyContent:"center"})
Insert(heroText, {type:"text", name:"Eyebrow", content:"No.024 · SEASONAL CATALOG · 花漾生活", fontFamily:"JetBrains Mono", fontSize:12, letterSpacing:2, fill:"#5B5D4E"})
Insert(heroText, {type:"text", name:"Headline", content:"讓花，裝點生活每一刻", textGrowth:"fixed-width", width:"fill_container", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:44, lineHeight:1.25, fill:"#23261D"})
Insert(heroText, {type:"text", name:"Subhead", content:"精選當季鮮花，職人手工包裝，每一束都傳遞溫暖與祝福。", textGrowth:"fixed-width", width:"fill_container", fontFamily:"Noto Sans TC", fontSize:15, lineHeight:1.7, fill:"#5B5D4E"})
ctaRow = Insert(heroText, {type:"frame", name:"CTA Row", layout:"horizontal", gap:20, alignItems:"center"})
Insert(ctaRow, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Primary CTA", descendants:{"Label":{content:"立即選購"}}})
Insert(ctaRow, {type:"text", name:"Secondary CTA", content:"瀏覽目錄 →", fontFamily:"Noto Sans TC", fontSize:14, fill:"#445540"})
dashRow = Insert(heroText, {type:"frame", name:"Dashed Divider", layout:"horizontal", width:"fill_container", gap:6})
for (let i=0;i<40;i++) Insert(dashRow,{type:"rectangle",name:"Dash",width:8,height:1,fill:"#5B5D4E"})
featureRow = Insert(heroText, {type:"frame", name:"Feature Strip", layout:"horizontal", gap:28})
for (const f of ["全台配送","手工包裝","滿額免運"]) {
  Insert(featureRow, {type:"text", name:f, content:f, fontFamily:"Noto Sans TC", fontSize:12, fill:"#5B5D4E"})
}
```

- [ ] **Step 3: 精選推薦（4 欄）**

```js
featured = Insert(homePage, {type:"frame", name:"Featured Section", layout:"vertical", width:"fill_container", padding:[48,64], gap:24})
Insert(featured, {type:"text", name:"Section Title", content:"精選推薦", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:28, fill:"#23261D"})
grid = Insert(featured, {type:"frame", name:"Grid", layout:"horizontal", gap:20, width:"fill_container"})
const names=["粉霧玫瑰花束","向日葵手束","白色繡球盆栽","乾燥花花圈"]
const prices=["1,280","680","980","1,560"]
for (let i=0;i<4;i++){
  Insert(grid,{type:"ref", ref:"PRODUCT_CARD_ID", name:names[i], width:"fill_container", descendants:{"Product Name":{content:names[i]},"Price":{content:"NT$ "+prices[i]},"Catalog No":{content:"No.0"+(i+11)+" · 花藝"}}})
}
```

- [ ] **Step 4: 所有商品（3 欄 x 2 排）與分頁器**

```js
allProducts = Insert(homePage, {type:"frame", name:"All Products Section", layout:"vertical", width:"fill_container", padding:[48,64], gap:24, alignItems:"center"})
Insert(allProducts, {type:"text", name:"Section Title", content:"探索所有花藝", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:28, fill:"#23261D"})
grid2 = Insert(allProducts, {type:"frame", name:"Grid", layout:"horizontal", gap:20, width:"fill_container"})
row2 = Insert(allProducts, {type:"frame", name:"Grid Row 2", layout:"horizontal", gap:20, width:"fill_container"})
const names2=["紫色桔梗花束","療癒多肉組","粉色康乃馨"]
for (let i=0;i<3;i++){
  Insert(grid2,{type:"ref", ref:"PRODUCT_CARD_ID", name:names[i%4], width:"fill_container", descendants:{"Product Name":{content:names[i%4]},"Catalog No":{content:"No.0"+(i+15)+" · 花藝"}}})
}
for (let i=0;i<3;i++){
  Insert(row2,{type:"ref", ref:"PRODUCT_CARD_ID", name:names2[i], width:"fill_container", descendants:{"Product Name":{content:names2[i]},"Catalog No":{content:"No.0"+(i+20)+" · 花藝"}}})
}
pager = Insert(allProducts, {type:"frame", name:"Pager", layout:"horizontal", gap:8})
for (const p of ["1","2","3"]) {
  Insert(pager, {type:"frame", name:"Page "+p, layout:"horizontal", justifyContent:"center", alignItems:"center", width:36, height:36, fill: p==="1"?"#C1442C":"#E4DCC8"})
}
```

（第三個 `Insert(pager...)` 內的頁碼文字需再補一個子 `Insert`：`Insert(pageNode, {type:"text", content:p, fontFamily:"JetBrains Mono", fontSize:13, fill: p==="1"?"#FFFFFF":"#23261D"})`，請將 `Insert(pager,...)` 的回傳值存成變數後再插入文字子節點。）

- [ ] **Step 5: 顧客評價、訂閱、Footer**

```js
reviews = Insert(homePage, {type:"frame", name:"Reviews Section", layout:"vertical", width:"fill_container", padding:[56,64], gap:24, fill:"#23261D"})
Insert(reviews, {type:"text", name:"Section Title", content:"顧客花束好評分享", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:26, fill:"#F2EDE1"})
reviewGrid = Insert(reviews, {type:"frame", name:"Grid", layout:"horizontal", gap:20, width:"fill_container"})
const quotes=[["王小美","包裝非常精美，花材也很新鮮！送給媽媽的母親節禮物，她非常喜歡。"],["陳阿明","台北市區當日配送真的救了我一命，花束狀態完美。"],["大衛","收到花束的瞬間能感受到那份溫暖與心意，會繼續支持。"]]
for (const [name,quote] of quotes){
  card = Insert(reviewGrid, {type:"frame", name:name, layout:"vertical", width:"fill_container", padding:24, gap:14, stroke:"#E4DCC8", strokeWidth:1})
  Insert(card,{type:"text", name:"Stars", content:"★★★★★", fontFamily:"Noto Sans TC", fontSize:14, fill:"#B98B2E"})
  Insert(card,{type:"text", name:"Quote", content:quote, textGrowth:"fixed-width", width:"fill_container", fontFamily:"Noto Sans TC", fontSize:13, lineHeight:1.8, fill:"#E4DCC8"})
  Insert(card,{type:"text", name:"Author", content:"— "+name, fontFamily:"JetBrains Mono", fontSize:12, fill:"#F2EDE1"})
}

newsletter = Insert(homePage, {type:"frame", name:"Newsletter", layout:"vertical", width:"fill_container", padding:[56,64], gap:16, alignItems:"center", fill:"#E4DCC8"})
Insert(newsletter,{type:"text", name:"Title", content:"訂閱花訊，不錯過任何限定特惠", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:22, fill:"#23261D"})
Insert(newsletter, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Subscribe CTA", descendants:{"Label":{content:"訂閱"}}})

Insert(homePage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(homePage, {placeholder:false, height:"fit_content"})
```

- [ ] **Step 6: 截圖驗證與修正**

`get_screenshot` 檢視整頁：確認無內容溢出（若有，`Update(homePage,{height:...})` 放大）、對比足夠、Hero 圖片與相框線正確顯示、商品卡網格對齊。用本任務開頭的「驗收標準」checklist（層次、裁切、對比、對齊、schema 對應）逐項確認。

---

### Task 8: 商品詳情頁 `/products/:id`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Stamp Button"`、`"Status Stamp"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:900,padding:160})
pdPage = Insert(document, {type:"frame", name:"商品詳情 Product Detail", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(pdPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

body = Insert(pdPage, {type:"frame", name:"Body", layout:"horizontal", width:"fill_container", padding:[56,64], gap:56})
imgCol = Insert(body, {type:"frame", name:"Image Column", width:560, height:560, fill:"#E4DCC8", stroke:"#23261D", strokeWidth:1, strokeAlignment:"inner"})
Generate(imgCol, "stock", "rose bouquet")

infoCol = Insert(body, {type:"frame", name:"Info Column", layout:"vertical", width:"fill_container", gap:14})
Insert(infoCol, {type:"text", name:"Catalog No", content:"No.014 · 玫瑰系列", fontFamily:"JetBrains Mono", fontSize:12, letterSpacing:1, fill:"#5B5D4E"})
Insert(infoCol, {type:"text", name:"Product Name", content:"粉霧玫瑰花束", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:32, fill:"#23261D"})
Insert(infoCol, {type:"text", name:"Price", content:"NT$ 1,280", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:26, fill:"#C1442C"})
Insert(infoCol, {type:"ref", ref:"STATUS_STAMP_ID", name:"Stock Stamp", descendants:{"Label":{content:"尚有 12 件"}}})
Insert(infoCol, {type:"text", name:"Description", content:"以當季粉霧玫瑰為主花材，搭配尤加利葉點綴，職人手工包裝，適合送禮或居家佈置。花期約 5-7 天。", textGrowth:"fixed-width", width:"fill_container", fontFamily:"Noto Sans TC", fontSize:14, lineHeight:1.8, fill:"#5B5D4E"})

qtyRow = Insert(infoCol, {type:"frame", name:"Quantity Row", layout:"horizontal", gap:0, alignItems:"center", stroke:"#5B5D4E", strokeWidth:1, width:120, justifyContent:"space_between", padding:[8,14]})
Insert(qtyRow,{type:"text",name:"Minus",content:"–",fontFamily:"JetBrains Mono",fontSize:16,fill:"#23261D"})
Insert(qtyRow,{type:"text",name:"Qty Value",content:"1",fontFamily:"JetBrains Mono",fontSize:16,fill:"#23261D"})
Insert(qtyRow,{type:"text",name:"Plus",content:"+",fontFamily:"JetBrains Mono",fontSize:16,fill:"#23261D"})

Insert(infoCol, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Add To Cart", width:"fill_container", descendants:{"Label":{content:"加入購物車"}}})

notice = Insert(infoCol, {type:"frame", name:"Notice Card", layout:"vertical", width:"fill_container", padding:18, gap:6, fill:"#E4DCC8"})
for (const line of ["花材依季節略有差異，以實際到貨為準","台北市區當日配送，其他地區 1-3 個工作天","消費滿 NT$500 免運"]) {
  Insert(notice,{type:"text",name:line,content:"· "+line,fontFamily:"Noto Sans TC",fontSize:12,fill:"#5B5D4E"})
}

Insert(pdPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(pdPage, {placeholder:false, height:"fit_content"})
```

- [ ] **Step 3: 截圖驗證與修正**

確認售完狀態（另建測試 instance 將 `Stock Stamp` 覆寫為「已售完」+ 按鈕 `enabled:false` 效果用降低 opacity 模擬，驗證後移除測試節點）、數量選擇器三元素對齊、購買須知卡易讀。

---

### Task 9: 購物車頁 `/cart`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Receipt Row"`、`"Receipt Total"`、`"Stamp Button"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:800,padding:160})
cartPage = Insert(document, {type:"frame", name:"購物車 Cart", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(cartPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

banner = Insert(cartPage, {type:"frame", name:"Free Shipping Banner", layout:"horizontal", justifyContent:"center", width:"fill_container", padding:14, fill:"#E4DCC8"})
Insert(banner,{type:"text",name:"Banner Text",content:"再購 NT$220 即可享免運費！",fontFamily:"Noto Sans TC",fontSize:13,fill:"#445540"})

body = Insert(cartPage, {type:"frame", name:"Body", layout:"horizontal", width:"fill_container", padding:[40,64], gap:48})

itemsCol = Insert(body, {type:"frame", name:"Items Column", layout:"vertical", width:"fill_container", gap:20})
Insert(itemsCol, {type:"text", name:"Title", content:"購物車", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:26, fill:"#23261D"})
const items=[["粉霧玫瑰花束","1","1,280","1,280"],["向日葵手束","2","680","1,360"]]
for (const [n,q,u,s] of items){
  Insert(itemsCol,{type:"ref", ref:"RECEIPT_ROW_ID", name:n, width:"fill_container", descendants:{"Item Name":{content:n},"Qty":{content:"x"+q},"Unit Price":{content:u},"Subtotal":{content:s}}})
}

summaryCol = Insert(body, {type:"frame", name:"Summary Column", layout:"vertical", width:400, padding:28, gap:20, fill:"#E4DCC8"})
Insert(summaryCol, {type:"text", name:"Title", content:"訂單摘要", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:18, fill:"#23261D"})
Insert(summaryCol, {type:"ref", ref:"RECEIPT_TOTAL_ID", name:"Total", width:"fill_container", descendants:{"Total Value":{content:"NT$ 2,640"}}})
Insert(summaryCol, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Checkout CTA", width:"fill_container", descendants:{"Label":{content:"前往結帳"}}})

Insert(cartPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(cartPage, {placeholder:false, height:"fit_content"})
```

- [ ] **Step 3: 截圖驗證與修正**

確認 Receipt Row 在卡片列表中對齊一致、免運橫幅文案清楚、摘要欄 sticky 感（視覺上與商品列表區隔即可，Pencil 無需真的 sticky）。

---

### Task 10: 結帳頁 `/checkout`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Ticket Form Card"`、`"Receipt Row"`、`"Receipt Total"`、`"Stamp Button"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:800,padding:160})
checkoutPage = Insert(document, {type:"frame", name:"結帳 Checkout", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(checkoutPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

body = Insert(checkoutPage, {type:"frame", name:"Body", layout:"horizontal", width:"fill_container", padding:[48,64], gap:48})

formCard = Insert(body, {type:"ref", ref:"TICKET_FORM_ID", name:"Recipient Form", width:"fill_container", descendants:{"Title":{content:"收件資訊"}}})
fieldsSlot = formCard+"/Fields Slot"
for (const label of ["收件人姓名","Email","收件地址"]) {
  field = Insert(fieldsSlot, {type:"frame", name:label, layout:"vertical", width:"fill_container", gap:6})
  Insert(field,{type:"text",name:"Field Label",content:label,fontFamily:"Noto Sans TC",fontSize:12,fill:"#5B5D4E"})
  Insert(field,{type:"frame",name:"Field Input",layout:"horizontal",width:"fill_container",padding:[10,14],stroke:"#5B5D4E",strokeWidth:1})
}

summaryCol = Insert(body, {type:"frame", name:"Order Summary", layout:"vertical", width:420, padding:28, gap:18, fill:"#E4DCC8"})
Insert(summaryCol, {type:"text", name:"Title", content:"訂單摘要", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:18, fill:"#23261D"})
Insert(summaryCol, {type:"ref", ref:"RECEIPT_ROW_ID", name:"Item", width:"fill_container"})
Insert(summaryCol, {type:"ref", ref:"RECEIPT_TOTAL_ID", name:"Total", width:"fill_container"})
Insert(summaryCol, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Submit CTA", width:"fill_container", descendants:{"Label":{content:"確認送出訂單"}}})

Insert(checkoutPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(checkoutPage, {placeholder:false, height:"fit_content"})
```

**注意**：`Insert(fieldsSlot, ...)` 中的 `fieldsSlot` 是字串路徑（`instanceId/Fields Slot`），依 Pencil 規則，向元件 instance 內部路徑插入節點時請改用 `Insert` 對該路徑操作；若執行時發現 `Insert` 不支援對 instance 內部路徑直接插入子節點，改用 `Replace(fieldsSlot, {type:"frame", name:"Fields Slot", layout:"vertical", width:"fill_container", gap:16, children:[...三個欄位的完整節點樹...]})` 一次性替換整個 slot 內容。

- [ ] **Step 3: 截圖驗證與修正**

確認票根圓孔位置正確、三個表單欄位間距一致、右側摘要欄與左側表單視覺平衡。

---

### Task 11: 登入頁 `/login`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Ticket Form Card"`、`"Stamp Button"` 元件 id（登入頁無 Header/Footer，維持置中卡片極簡版面）

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:820,padding:160})
loginPage = Insert(document, {type:"frame", name:"登入 Login", x:pos.x, y:pos.y, layout:"vertical", width:1440, height:820, clip:true, fill:"#E4DCC8", placeholder:true, justifyContent:"center", alignItems:"center"})

wrapper = Insert(loginPage, {type:"frame", name:"Wrapper", layout:"vertical", gap:24, alignItems:"center"})
Insert(wrapper, {type:"text", name:"Brand", content:"花漾生活", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:28, fill:"#23261D"})

tabRow = Insert(wrapper, {type:"frame", name:"Tabs", layout:"horizontal", gap:0})
loginTab = Insert(tabRow,{type:"frame",name:"Login Tab",layout:"horizontal",justifyContent:"center",padding:[10,32],fill:"#C1442C"})
Insert(loginTab,{type:"text",name:"Label",content:"登入",fontFamily:"Noto Sans TC",fontWeight:"700",fontSize:14,fill:"#FFFFFF"})
registerTab = Insert(tabRow,{type:"frame",name:"Register Tab",layout:"horizontal",justifyContent:"center",padding:[10,32],stroke:"#5B5D4E",strokeWidth:1})
Insert(registerTab,{type:"text",name:"Label",content:"註冊",fontFamily:"Noto Sans TC",fontSize:14,fill:"#5B5D4E"})

formCard = Insert(wrapper, {type:"ref", ref:"TICKET_FORM_ID", name:"Login Form", width:440, descendants:{"Title":{content:"登入"}}})
fieldsSlot = formCard+"/Fields Slot"
Replace(fieldsSlot, {type:"frame", name:"Fields Slot", layout:"vertical", width:"fill_container", gap:16, children:[
  {type:"frame", name:"Email Field", layout:"vertical", width:"fill_container", gap:6, children:[
    {type:"text", name:"Label", content:"Email", fontFamily:"Noto Sans TC", fontSize:12, fill:"#5B5D4E"},
    {type:"frame", name:"Input", layout:"horizontal", width:"fill_container", padding:[10,14], stroke:"#5B5D4E", strokeWidth:1, children:[
      {type:"text", name:"Placeholder", content:"admin@hexschool.com", fontFamily:"Noto Sans TC", fontSize:13, fill:"#5B5D4E"}
    ]}
  ]},
  {type:"frame", name:"Password Field", layout:"vertical", width:"fill_container", gap:6, children:[
    {type:"text", name:"Label", content:"密碼", fontFamily:"Noto Sans TC", fontSize:12, fill:"#5B5D4E"},
    {type:"frame", name:"Input", layout:"horizontal", width:"fill_container", padding:[10,14], stroke:"#5B5D4E", strokeWidth:1, children:[
      {type:"text", name:"Placeholder", content:"••••••••", fontFamily:"Noto Sans TC", fontSize:13, fill:"#5B5D4E"}
    ]}
  ]}
]})
Insert(formCard, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Submit CTA", width:"fill_container", descendants:{"Label":{content:"登入"}}})

Update(loginPage, {placeholder:false})
```

- [ ] **Step 3: 截圖驗證與修正**

確認 Tab 選中狀態視覺清楚、表單欄位垂直間距一致、票根卡在深色 `$paper-deep` 背景上仍有足夠層次（可視需要將卡片 `fill` 改為 `$paper` 以拉開對比）。

---

### Task 12: 我的訂單頁 `/orders`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Status Stamp"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:700,padding:160})
ordersPage = Insert(document, {type:"frame", name:"我的訂單 Orders", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(ordersPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

body = Insert(ordersPage, {type:"frame", name:"Body", layout:"vertical", width:"fill_container", padding:[48,64], gap:20})
Insert(body, {type:"text", name:"Title", content:"我的訂單", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:28, fill:"#23261D"})

const orders=[["ORD-20260720-A1B2C","2026-07-20","NT$ 2,640","已付款","#445540"],["ORD-20260715-D3E4F","2026-07-15","NT$ 980","待付款","#B98B2E"],["ORD-20260701-G5H6I","2026-07-01","NT$ 1,560","付款失敗","#C1442C"]]
for (const [no,date,amount,status,color] of orders){
  row = Insert(body, {type:"frame", name:no, layout:"horizontal", justifyContent:"space_between", alignItems:"center", width:"fill_container", padding:20, fill:"#E4DCC8"})
  left = Insert(row,{type:"frame",name:"Left",layout:"vertical",gap:4})
  Insert(left,{type:"text",name:"Order No",content:no,fontFamily:"JetBrains Mono",fontSize:13,fill:"#23261D"})
  Insert(left,{type:"text",name:"Date",content:date,fontFamily:"Noto Sans TC",fontSize:12,fill:"#5B5D4E"})
  right = Insert(row,{type:"frame",name:"Right",layout:"horizontal",gap:16,alignItems:"center"})
  Insert(right,{type:"text",name:"Amount",content:amount,fontFamily:"JetBrains Mono",fontWeight:"700",fontSize:15,fill:"#23261D"})
  Insert(right, {type:"ref", ref:"STATUS_STAMP_ID", name:"Status", descendants:{"Label":{content:status}}, stroke:color, "descendants":{"Label":{content:status, fill:color}}})
}

Insert(ordersPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(ordersPage, {placeholder:false, height:"fit_content"})
```

**注意**：上方最後一個 `Insert(right,...)` 物件字面量中重複出現兩次 `descendants` key（JS 物件字面量後者會覆蓋前者），請改寫為單一 `descendants`：

```js
Insert(right, {type:"ref", ref:"STATUS_STAMP_ID", name:"Status", stroke:color, descendants:{"Label":{content:status, fill:color}}})
```

- [ ] **Step 3: 截圖驗證與修正**

確認三種狀態戳章顏色正確對應（待付款＝金線、已付款＝森綠、付款失敗＝印章紅）、每列對齊一致。

---

### Task 13: 訂單詳情頁 `/orders/:id`

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Ticket Form Card"`、`"Receipt Row"`、`"Receipt Total"`、`"Status Stamp"`、`"Stamp Button"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:1100,padding:160})
odPage = Insert(document, {type:"frame", name:"訂單詳情 Order Detail", x:pos.x, y:pos.y, layout:"vertical", width:1440, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(odPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

body = Insert(odPage, {type:"frame", name:"Body", layout:"vertical", width:900, x:270, layoutPosition:"absolute", padding:[40,0], gap:20})

alert = Insert(body, {type:"frame", name:"Payment Alert", layout:"horizontal", alignItems:"center", gap:10, width:"fill_container", padding:16, fill:"#445540"})
Insert(alert,{type:"text",name:"Alert Text",content:"付款成功！感謝您的購買",fontFamily:"Noto Sans TC",fontWeight:"600",fontSize:14,fill:"#FFFFFF"})

infoCard = Insert(body, {type:"frame", name:"Order Info Card", layout:"vertical", width:"fill_container", padding:24, gap:10, fill:"#E4DCC8"})
Insert(infoCard,{type:"text",name:"Title",content:"訂單資訊",fontFamily:"Noto Serif TC",fontWeight:"700",fontSize:18,fill:"#23261D"})
Insert(infoCard,{type:"text",name:"Order No",content:"訂單編號：ORD-20260720-A1B2C",fontFamily:"JetBrains Mono",fontSize:13,fill:"#5B5D4E"})
Insert(infoCard, {type:"ref", ref:"STATUS_STAMP_ID", name:"Status", descendants:{"Label":{content:"已付款"}}})

recipientCard = Insert(body, {type:"ref", ref:"TICKET_FORM_ID", name:"Recipient Info", width:"fill_container", descendants:{"Title":{content:"收件資訊"}}})

itemsCard = Insert(body, {type:"frame", name:"Items Card", layout:"vertical", width:"fill_container", padding:24, gap:14, fill:"#E4DCC8"})
Insert(itemsCard,{type:"text",name:"Title",content:"商品明細",fontFamily:"Noto Serif TC",fontWeight:"700",fontSize:18,fill:"#23261D"})
Insert(itemsCard, {type:"ref", ref:"RECEIPT_ROW_ID", name:"Item", width:"fill_container"})
Insert(itemsCard, {type:"ref", ref:"RECEIPT_TOTAL_ID", name:"Total", width:"fill_container"})

paymentCard = Insert(body, {type:"frame", name:"Payment Card", layout:"horizontal", gap:16, width:"fill_container", padding:24, fill:"#E4DCC8"})
Insert(paymentCard, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Pay CTA", descendants:{"Label":{content:"前往付款"}}})
Insert(paymentCard,{type:"text",name:"Query Link",content:"查詢付款結果",fontFamily:"Noto Sans TC",fontSize:13,fill:"#445540"})

Insert(odPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(odPage, {placeholder:false, height:"fit_content"})
```

- [ ] **Step 3: 截圖驗證與修正**

確認付款結果 Alert 顏色語意正確（成功＝ `$moss`；若要展示失敗版本另建測試 instance 用 `$stamp`，驗證後移除）、四張卡片間距一致。

---

### Task 14: 404 頁

**Files:** 無實體檔案

**Interfaces:** Consumes：`"Header"`、`"Footer"`、`"Stamp Button"` 元件 id

- [ ] **Step 1: 查詢依賴元件 id**

- [ ] **Step 2: 建立頁面**

```js
const pos = FindEmptySpace({width:1440,height:640,padding:160})
notFoundPage = Insert(document, {type:"frame", name:"404", x:pos.x, y:pos.y, layout:"vertical", width:1440, height:640, clip:true, fill:"#F2EDE1", placeholder:true})
Insert(notFoundPage, {type:"ref", ref:"HEADER_ID", name:"Header"})

center = Insert(notFoundPage, {type:"frame", name:"Center", layout:"vertical", width:"fill_container", height:"fill_container", justifyContent:"center", alignItems:"center", gap:16})
tag = Insert(center, {type:"frame", name:"Torn Tag", layout:"vertical", alignItems:"center", width:180, height:120, fill:"#E4DCC8", cornerRadius:6, rotation:-6})
Insert(tag, {type:"text", name:"Tag Text", content:"404", fontFamily:"JetBrains Mono", fontWeight:"700", fontSize:32, fill:"#C1442C"})
Insert(center, {type:"text", name:"Headline", content:"此標本已從目錄中移除", fontFamily:"Noto Serif TC", fontWeight:"700", fontSize:24, fill:"#23261D"})
Insert(center, {type:"text", name:"Description", content:"您要找的頁面不存在，可能已被下架或網址有誤。", fontFamily:"Noto Sans TC", fontSize:14, fill:"#5B5D4E"})
Insert(center, {type:"ref", ref:"STAMP_BUTTON_ID", name:"Back CTA", descendants:{"Label":{content:"返回目錄"}}})

Insert(notFoundPage, {type:"ref", ref:"FOOTER_ID", name:"Footer"})
Update(notFoundPage, {placeholder:false})
```

- [ ] **Step 3: 截圖驗證與修正**

確認撕裂吊牌插畫在旋轉後仍完整可見（未被父層 `clip:true` 裁掉，必要時調整 `center` 或 `notFoundPage` 尺寸）、文案符合 frontend-design 對空狀態「說明發生什麼事＋如何處理」的要求。

---

### Task 15: 匯出所有頁面截圖

**Files:**
- Create: `docs/design/screenshots/home.png`
- Create: `docs/design/screenshots/product-detail.png`
- Create: `docs/design/screenshots/cart.png`
- Create: `docs/design/screenshots/checkout.png`
- Create: `docs/design/screenshots/login.png`
- Create: `docs/design/screenshots/orders.png`
- Create: `docs/design/screenshots/order-detail.png`
- Create: `docs/design/screenshots/404.png`

**Interfaces:** Consumes：Task 7–14 建立的 8 個頁面 frame id

- [ ] **Step 1: 建立目錄**

```bash
mkdir -p docs/design/screenshots
```

- [ ] **Step 2: 查詢 8 個頁面 frame id**

呼叫 `mcp__pencil__get_editor_state({filePath:"docs/design/20260726.pen"})`，於 `Top-Level Nodes` 中記下 8 個頁面 frame 的 id（名稱分別為「首頁 Home」「商品詳情 Product Detail」「購物車 Cart」「結帳 Checkout」「登入 Login」「我的訂單 Orders」「訂單詳情 Order Detail」「404」）。

- [ ] **Step 3: 匯出**

呼叫一次 `mcp__pencil__export_nodes`：

```json
{
  "filePath": "docs/design/20260726.pen",
  "outputDir": "docs/design/screenshots",
  "format": "png",
  "nodeIds": ["<首頁id>", "<商品詳情id>", "<購物車id>", "<結帳id>", "<登入id>", "<我的訂單id>", "<訂單詳情id>", "<404id>"]
}
```

此工具會以 node id 作為檔名輸出（例如 `<首頁id>.png`）。呼叫完成後，依回傳的絕對路徑，用 `mv` 將每個檔案重新命名為對應 slug（`home.png`、`product-detail.png`、`cart.png`、`checkout.png`、`login.png`、`orders.png`、`order-detail.png`、`404.png`），並確保最終都留在 `docs/design/screenshots/` 目錄下。

- [ ] **Step 4: 驗證**

```bash
ls -la docs/design/screenshots/
```

確認 8 個檔案皆存在且檔案大小 > 0。

---

### Task 16: 撰寫 docs/design/README.md 並最終驗收

**Files:**
- Create: `docs/design/README.md`

**Interfaces:** Consumes：Task 1–15 所有輸出（token 表、元件清單與 id、頁面清單與 id、截圖路徑）

- [ ] **Step 1: 撰寫規格文件**

內容需包含（比照 spec `docs/superpowers/specs/2026-07-26-frontend-redesign-design.md` 第 3–5 節，逐一列出實際建立結果）：

1. 設計概念一段說明（苗圃吊牌與市集收據）
2. 色彩 token 表（含是否使用 Pencil 變數系統，或 Task 1 備援方案的字面色碼說明）
3. 字型表
4. 共用元件表：元件名稱、Pencil Node ID、用途、截圖縮圖（引用 `screenshots/` 內含該元件的頁面截圖或另外匯出元件截圖）
5. 8 個頁面表：頁面名稱、對應路由、Pencil Node ID、截圖連結（`./screenshots/<slug>.png`）
6. `.pen` 檔案位置與名稱（目前作用中 Pencil 檔案的實際檔名，執行時以 `get_editor_state` 回傳的 `Currently active editor` 為準）

- [ ] **Step 2: 對照 spec 驗收標準逐項打勾**

比照 spec 第 9 節「驗收標準」5 項，逐一確認並在 README 末尾附上勾選結果（全部完成才算 Task 16 完成）。

- [ ] **Step 3: Commit**

```bash
git add docs/design/
git commit -m "$(cat <<'EOF'
新增前台重設計 Pencil 設計稿之截圖與規格文件

依 docs/superpowers/specs/2026-07-26-frontend-redesign-design.md 完成 8 頁前台頁面與 8 個共用元件設計，匯出截圖與對照文件供不開 Pencil 也能查閱。
EOF
)"
```

- [ ] **Step 4: 驗證**

```bash
git log --oneline -1
git show --stat HEAD
```

確認 commit 包含 `docs/design/README.md` 與 8 張截圖。
