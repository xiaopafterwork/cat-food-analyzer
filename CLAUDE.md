# 喵評鑑 — Claude 工作指引

## ⚠️ 工作目錄
所有指令（git、npm、python）必須在此目錄執行：
```
C:\Users\P\cat-food-analyzer
```

## 專案資訊
- 品牌名：喵評鑑 MEOWPJ
- 網址：https://meowpj.com（域名即將購買）/ https://cat-food-analyzer.vercel.app（現行）
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
- 飼料詳情頁（/food/[id]）、品牌頁（/brand/[brand]）使用**永久快取**（`revalidate = false`）
- 資料不會自動更新，需要手動重新部署才會反映新資料
- 流程：上傳資料到 Supabase → git push → Vercel 重新部署 → 快取更新
- **不可改回 `force-dynamic` 或 `revalidate = 0`**，會導致每次點擊都重新打 Supabase，速度很慢

## ⚠️ 絕對禁止
- 爬蟲不可自動排程寫入 Supabase，必須老闆批准後才上傳
- 爬蟲只產出 JSON/Excel，確認後才執行上傳
- TypeScript 禁用 `[...new Set()]`，改用 `Record<string, boolean>` + `Object.keys()`

## 核心資料結構
- `food_type`：`'dry'`（乾飼料）| `'wet'`（主食罐）
- `life_stage`：資料庫存**中文**（`成貓`/`幼貓`/`熟齡貓`/`全齡`），filter 必須對應
- 分頁抓取：Supabase 每次上限 1000 筆，超過需 `.range()` 分頁

## 文案規範
- 任何頁面提到「飼料」，必須確認主食罐是否也需要提及
- 禁用詞：推薦、最好、最安全、醫療宣稱、台灣最完整、台灣貓奴最信賴
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
- [ ] meowpj.com 域名購買
- [ ] Ko-fi 帳號 + 支持按鈕串上連結
- [x] Vercel 環境變數：NEXT_PUBLIC_GA_ID = G-4BJMH3MSCL ✅
- [ ] 社群首發（草稿已備好）
