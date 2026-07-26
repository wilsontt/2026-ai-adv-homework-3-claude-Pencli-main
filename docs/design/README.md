# 花漾生活前台 UI 重設計稿

苗圃吊牌與市集收據（Botanical Ledger）方向。完整規格見
[`docs/superpowers/specs/2026-07-26-frontend-redesign-design.md`](../superpowers/specs/2026-07-26-frontend-redesign-design.md)，
實作計畫見 [`docs/superpowers/plans/2026-07-26-frontend-redesign.md`](../superpowers/plans/2026-07-26-frontend-redesign.md)。

## 設計概念

以「花市/苗圃」實體物件的結構語言取代裝飾性設計：商品卡做成撕線圓孔＋目錄編號＋印章式現貨標籤的**苗圃吊牌**；購物車／結帳／訂單詳情做成虛線分隔＋等寬字對齊金額＋撕邊總計列的**市集收據**；登入／收件表單做成票根虛線＋騎縫章角的**票根卡片**。此語彙貫穿選購到付款全流程，讓「一目了然的帳目」成為結帳頁的核心體驗，同時避開暖米白＋高對比襯線＋陶土色這類生成式 AI 常見樣板。

## Pencil 檔案

- 路徑：`docs/design/20260726.pen`
- **色彩實作方式**：此 Pencil 版本的 `batch_design` 不支援 `Update(document,{variables:...})`（呼叫回傳 `Node 'document' not found`），因此本次設計**未使用 Pencil 變數系統**，所有色彩皆以下表字面 hex 值直接套用於各節點的 `fill`/`stroke` 屬性。

## 色彩 Token

| 名稱 | 色碼 | 用途 |
|------|------|------|
| paper | `#F2EDE1` | 主背景（帶灰調石紙色） |
| paper-deep | `#E4DCC8` | 區塊交替背景／吊牌紙色 |
| ink | `#23261D` | 主文字（偏綠黑墨色） |
| ink-soft | `#5B5D4E` | 次要文字 |
| moss | `#445540` | 品牌綠（連結、次要按鈕、現貨戳章） |
| stamp | `#C1442C` | 印章紅（主要 CTA、售完戳章、價格重點） |
| gold-thread | `#B98B2E` | 吊牌繩線、分隔裝飾、評分星星、待付款戳章 |

## 字型

| 用途 | 字型 |
|------|------|
| 展示大標（拉丁/數字） | Fraunces |
| 中文大標 | Noto Serif TC |
| 內文／表單／按鈕 | Noto Sans TC |
| 帳目／價格／單號（收據感） | JetBrains Mono |

## 共用元件

| 元件 | Pencil Node ID | 用途 |
|------|------|------|
| Stamp Button | `t3XETX`（Label 子節點 `x2pdO`） | 印章式主要按鈕，紅底白字 |
| Status Stamp | `xQc3H`（Label 子節點 `ZK4t3`） | 狀態戳章，描邊+文字色可覆寫（待付款=金線、已付款=森綠、失敗/售完=印章紅） |
| Header | `YPstw`（Cart Label `Vm87w`、Badge Count `VwssF`、Login `uqTaB`） | 頂部導覽列 |
| Footer | `xxMix` | 頁尾版權列 |
| Product Tag Card | `IgZ8v` | 苗圃吊牌樣式商品卡（撕線圓孔＋目錄編號＋價格＋現貨戳章＋加入購物車） |
| Receipt Row | `BsN1I`（Item Name `pnJ8J`、Qty `xL9iM`、Unit Price `PyHkt`、Subtotal `yU8Ne`） | 收據品項列 |
| Receipt Total | `v6kZH`（Total Value `h5tWE`） | 收據撕邊總計列 |
| Ticket Form Card | `kLkmP`（Title `BXf3V`、Fields Slot `H0X0k`） | 票根樣式表單卡 |

## 頁面

| 頁面 | 路由 | Pencil Node ID | 截圖 |
|------|------|------|------|
| 首頁 | `/` | `z5vwqN` | [home.png](./screenshots/home.png) |
| 商品詳情 | `/products/:id` | `B41mN` | [product-detail.png](./screenshots/product-detail.png) |
| 購物車 | `/cart` | `bM86d` | [cart.png](./screenshots/cart.png) |
| 結帳 | `/checkout` | `Aglol` | [checkout.png](./screenshots/checkout.png) |
| 登入／註冊 | `/login` | `Q1nyey` | [login.png](./screenshots/login.png) |
| 我的訂單 | `/orders` | `VMo9t` | [orders.png](./screenshots/orders.png) |
| 訂單詳情 | `/orders/:id` | `Piikq` | [order-detail.png](./screenshots/order-detail.png) |
| 404 | — | `WsZOa` | [404.png](./screenshots/404.png) |

## 實作過程中的重要偏離與注意事項

- **色彩變數系統不可用**：見上方「Pencil 檔案」段落，一律用字面 hex 值。
- **元件 instance 一律用 `Insert({type:"ref",...})`，避免用 `Copy()`**：`Copy()` 會把來源元件在畫布上的絕對座標一併複製，在 `layout:"vertical"` 的父層裡會造成子節點位置錯誤、被 `clip:true` 裁掉（我的訂單頁一度因此完全空白）。
- **`layoutPosition:"absolute"` 節點可能不計入父層 `fit_content` 高度**：訂單詳情頁原計畫用 absolute 定位置中內容區，導致高度計算漏算、內容被裁切；改用一般 `alignItems:"center"` + `layoutPosition:"auto"` 解決。
- **Pencil session 曾出現渲染快取損毀**：我的訂單頁一度不論如何重建都持續回傳空白截圖，即使版面座標資料本身正確；請使用者在 Pencil App 中重新載入 `.pen` 檔案後即恢復正常。若之後再遇到「`snapshot_layout` 座標合理但 `get_screenshot` 空白」的情況，優先懷疑此問題並重新載入檔案，而非持續修改屬性。
- **`export_nodes` 匯出限制**：`filePath` 參數只能用檔名（`20260726.pen`），不能像 `get_screenshot`/`batch_design` 那樣帶目錄前綴；含大量內嵌圖片（`Generate()` 產生的商品照片）的頁面在預設 `scale:2` 下會匯出失敗，首頁（`z5vwqN`）需降到 `scale:0.5`、商品詳情（`B41mN`）需降到 `scale:1` 才能成功匯出。
- **RWD 範圍**：本次僅繪製 Desktop（1440px）版面，未產出 Mobile frame（spec 明確排除項）。

## 驗收標準勾選

- [x] 8 個頁面皆在 Pencil 建立完整 frame，且視覺無破版（無內容溢出、對比足夠、間距一致）
- [x] 共用元件（Header/Footer/Product Tag Card/Receipt Row/Receipt Total/Ticket Form Card/Stamp Button/Status Stamp）皆為 reusable component，頁面中以 instance 呼叫
- [x] 每頁至少 1 張截圖存於 `docs/design/screenshots/`
- [x] 本文件含完整 token 表、元件表、頁面 Node ID 對照表
- [x] 設計符合現有業務邏輯（商品售完時戳章與按鈕呈現停用感、訂單狀態三態戳章對應正確色彩、付款區按鈕文案與 API 對應：「前往付款」→ `POST /api/orders/:id/payment`、「查詢付款結果」→ `POST /api/orders/:id/payment/query`）
