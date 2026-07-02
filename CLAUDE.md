# 喵評鑑 — Claude 工作指引

## ⚠️ 工作目錄
所有指令（git、npm、python）必須在此目錄執行：
```
C:\Users\P\cat-food-analyzer
```

## 專案資訊
- 品牌名：喵評鑑 MEOWPJ
- 網址：https://meowpj.com（✅ 已上線）/ cat-food-analyzer.vercel.app（備用）
- 社群：IG + Threads `meowpj.official`
- GitHub：https://github.com/xiaopafterwork/cat-food-analyzer
- 部署：`git push origin HEAD:master` → Vercel 自動上線
- 資料庫：Supabase（乾飼料 775 筆 + 主食罐 1,870 筆，合計 2,645 筆）

## 溝通語言
繁體中文。回覆簡潔，結論優先。

## Agent 團隊
叫「工程師」「設計師」「編輯」「分析師」「CEO」「商業」「QA」「社群」即可觸發。
詳細規範見 `.ai-team/` 資料夾。

## Git Push
```
git push origin HEAD:master
```

## 快取策略
- 飼料詳情頁（/food/[id]）、品牌頁（/brand/[brand]）使用 **ISR**（`revalidate = 86400`）
- 第一個人點擊時建立快取，24 小時內都是瞬開；24 小時後自動重新抓取最新資料
- 不使用 `generateStaticParams`（曾導致部署要 12 分鐘去預建全部 2,645 頁，已移除）
- 資料更新想立刻反映：git push 觸發重新部署即可
- **不可改回 `force-dynamic` 或 `revalidate = 0`**，會導致每次點擊都重新打 Supabase，速度很慢
- **不可加回 `generateStaticParams`**，會讓部署時間暴增到 10 分鐘以上

## ⚠️ 動手改權限/安全設定前必做
- 收緊任何權限（RLS、API 金鑰、環境變數）之前，**必須先搜尋整個 `scripts/` 資料夾**，確認有沒有現有流程依賴這個權限
- 2026-07-01 教訓：資安健檢時只看 `.ai-team/ENGINEER.md` 的文件說明就收回 RLS UPDATE/DELETE，沒查 `sync_excel_to_supabase.py` 等 5 支腳本正在用這權限運作，導致老闆的 Excel 審核流程差點壞掉
- 規則：改權限前先 `grep` 找出所有用到該 key/權限的地方，逐一確認影響範圍，才能動手

## ⚠️ 絕對禁止
- 爬蟲不可自動排程寫入 Supabase，必須老闆批准後才上傳
- 爬蟲只產出 JSON/Excel，確認後才執行上傳
- TypeScript 禁用 `[...new Set()]`，改用 `Record<string, boolean>` + `Object.keys()`
- **不可重新開放 Supabase anon 的 UPDATE / DELETE 權限**（2026-07-01 資安修正已收回，anon key 曝露在前端，開放會讓任何人竄改或刪除資料）
- 本地腳本若需要 UPDATE/DELETE/UPSERT（如 `sync_excel_to_supabase.py`、`dedup.py`），一律讀取 `.env.local` 的 `SUPABASE_SERVICE_ROLE_KEY`，不可用 anon key

## 核心資料結構
- `food_type`：`'dry'`（乾飼料）| `'wet'`（主食罐）
- `life_stage`：資料庫存**中文**（`成貓`/`幼貓`/`熟齡貓`/`全齡`），filter 必須對應
- 分頁抓取：Supabase 每次上限 1000 筆，超過需 `.range()` 分頁

## 文案規範
- 任何頁面提到「飼料」，必須確認主食罐是否也需要提及
- 禁用詞：最好、最安全、醫療宣稱、台灣最完整、台灣貓奴最信賴
- 可以寫「推薦」；**不可寫「不業配／不推銷」**（老闆未來可能接業配）
- 資料來源說明：「成分資料來自網路公開資訊彙整」（不說「官方包裝」）
- 品牌名：英文雙空格中文（如 `Nutro  美士`）

## ⚠️ 資料庫已知地雷

### has_grain 規則
- 必須依 `ingredients_raw` 成分表判斷，不可信品牌名稱
- 已修復 122 筆（2026-06-30）

### 凍乾不納入評分
- 凍乾主食餐、凍乾生食 → 不入庫
- 已移除 3 筆（2026-06-30）

### 品牌名稱格式
- `go!` → `Go!`
- `Hill's` → `Hill's  希爾思`（雙空格）
- 其他：`英文  中文`（雙空格）

## 待辦（老闆自行）
- [x] meowpj.com 域名購買 ✅（2026-07-01，Cloudflare + Vercel 已綁定）
- [x] GSC + Bing Webmaster 接好，sitemap 提交成功 ✅（2026-07-01）
- [x] Vercel 環境變數：NEXT_PUBLIC_GA_ID = G-4BJMH3MSCL ✅
- [x] Ko-fi 接通 ✅（2026-07-02，ko-fi.com/meowpj，三顆支持按鈕已串）
- [ ] 綠界審核中（約 3 天），通過後做 /support 子頁並列兩種付款
- [ ] 社群首發（Threads + IG 草稿已定稿，帳號 meowpj.official 已開）
- [ ] Canva 三模板製作（規格：.ai-team/CANVA_TEMPLATES.md）
