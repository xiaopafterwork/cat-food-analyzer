# 貓咪飼料分析網站 — 專案現況

## 基本資訊
- 網址：https://cat-food-analyzer.vercel.app/
- 技術：Next.js 14 + Tailwind + Supabase + Vercel
- 目標：台灣最完整的貓飼料＋罐頭分析平台，以此為主業收入來源
- 最後更新：2026-06-28

## 現在做到哪

### ✅ 已完成
- 網站上線（Vercel auto-deploy，push to master 即上線）
- 首頁（搜尋框 + 篩選 + 飼料卡片 + 浮動比較條）
- 飼料詳細頁（分數 + 三行結論 + 折疊分析 + hover tooltip）
- 比較頁（最多 3 款飼料並排）
- 評分標準頁（/how-we-score，80分以上標籤為「優質主食」，無 FAQ）
- 新增飼料需求頁（/request）
- 漢堡選單 Nav（全頁面共用，mobile 優先）
- Supabase 資料庫 67 筆乾糧（品牌格式：中文 English）
- 評分邏輯（成分 40 + 營養 30 + 透明度 30 = 100）
- Python Pipeline：phase1_export.py → Excel 審核 → phase2_crawl.py → run_pipeline.py
- 去重工具：scripts/dedup.py
- 每款飼料 ai_pros / ai_cons / ai_summary（67 筆中 6 筆缺 ai_cons）
- 乾物比 tooltip（DM → 乾物比，全資料庫已替換）
- 包裝保證值 / 熱量來源比 tooltip（down 方向避免被遮）
- 標籤：無穀 / 含穀 / AAFCO / 低碳水 / 高肉含量 / 優質主食
- .claude/settings.json：git/npm/npx/python 免詢問權限

### ❌ 尚未實作
- GA4 Measurement ID 填入 Vercel 環境變數（NEXT_PUBLIC_GA_ID）
- 評論區（星等 + 文字，匿名，需老闆核准 → Supabase reviews table）
- 關於我們頁（/about）
- Donate 按鈕（Ko-fi，第一階段收益）
- 聯盟行銷連結（PChome / momo，流量 1000 UV 後啟動）
- 收藏功能（localStorage）
- 鈣磷比（資料缺失，未來路線圖）
- 罐頭資料與評分邏輯

## Git 工作流
- 主分支：master
- 推送：`git push origin HEAD:master`（新 session 在 worktree 分支時也適用）
- 設定檔：`.claude/settings.json` 已設定免詢問權限

## Python Pipeline 流程
```
phase1_export.py → 輸出 Excel（含自動找 URL）
→ 人工審核 Excel（批准欄填 Y）
→ phase2_crawl.py → 爬官網 + PChome → 輸出 JSON
→ run_pipeline.py → 清洗 → 評分 → 文案 → 上傳 Supabase
```

## 評論區規劃（待實作）
- Supabase 新增 `reviews` table：food_id, rating(1-5), comment, status(pending/approved), created_at
- RLS：anon 可 INSERT，SELECT 只看 approved
- 飼料詳情頁底部顯示已核准評論 + 留言表單
- 老闆在 Supabase Dashboard 手動改 status = approved

## 數據追蹤
- 資料庫筆數：67（乾糧）
- 月收入：NT$0（尚未啟動收益化）
- 月流量：待 GA4 設定後追蹤

## 產品路線圖

### 第一階段：乾糧站穩（現在）
- [x] 67 款乾糧上線
- [ ] GA4 追蹤開啟
- [ ] Donate 按鈕上線
- [ ] 補齊 6 筆缺漏 ai_cons

### 第二階段：流量變現（月流量 1,000 UV 後）
- [ ] PChome 聯盟行銷連結
- [ ] 評論區功能上線
- [ ] SEO 優化

### 第三階段：加入罐頭（1–2 個月後）
- [ ] 新增濕食評分邏輯
- [ ] 目標：20 款主流罐頭

### 第四階段：完整平台（3–6 個月）
- [ ] 月收入目標 NT$30,000+
- [ ] 廠商合作

## 收益路線圖
1. Donate（現在）→ 月收 NT$1,000–3,000
2. 聯盟行銷 PChome（流量 1,000+ UV）→ NT$1,000–3,000/月
3. 廠商合作（流量 5,000+ UV）→ NT$30,000+/月

## 本週目標
（每週由 CEO 更新）
