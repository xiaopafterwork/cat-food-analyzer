# 喵評鑑 — Claude 工作指引

## ⚠️ 最重要：工作目錄
所有指令（git、npm、python）必須在此目錄執行：
```
C:\Users\P\cat-food-analyzer
```

## 專案資訊
- 網址：https://cat-food-analyzer.vercel.app
- GitHub：https://github.com/xiaopafterwork/cat-food-analyzer
- 部署：push to master → Vercel 自動上線
- 資料庫：Supabase（67 筆乾糧，RLS anon 全開）
- 環境變數：.env.local（不可 commit）

## 溝通語言
繁體中文。回覆簡潔，結論優先。

## Agent 團隊
叫「工程師」「設計師」「編輯」「分析師」「CEO」「商業」即可觸發。
詳細規範見 `.ai-team/` 資料夾與 memory/agents_team.md。

## Git Push
```
git push origin HEAD:master
```
不管在哪個分支（包含 claude/xxx worktree 分支）都能推到 master。

## 待辦清單（2026-06-28）
- [ ] GA4 Measurement ID 填入 Vercel（NEXT_PUBLIC_GA_ID）
- [ ] 補齊 6 筆 ai_cons（法米納×3、威樂、Go!×2）
- [ ] Donate 按鈕（Ko-fi）
- [ ] 評論區（星等+文字，匿名，老闆手動核准）→ 詳見 .ai-team/PROJECT.md
- [ ] 關於我們頁（/about）

## ⚠️ 資料庫已知地雷（爬蟲工程師負責）

### has_grain 不可信任爬蟲判斷
- **問題**：爬蟲依產品名稱含「無穀」就標 `has_grain = false`，但成分表可能含玉米/小麥/大豆
- **已修復**：2026-06-30 依 `ingredients_raw` 關鍵字重新掃描 780 筆，修正 122 筆
- **規則**：未來同步資料時，`has_grain` 必須依成分表判斷，不可信任品牌名稱標榜

### 凍乾產品不歸類為飼料
- 凍乾主食餐、凍乾生食 → 不納入評分資料庫
- 已移除 Munchee 貪貪凍乾 3 筆（2026-06-30）

### 品牌名稱統一規則
- `go!` → `Go!`
- `Hill's` → `Hill's  希爾思`（雙空格，維持既有格式）
- 其他品牌中英文並列，格式：`英文  中文`（雙空格）

## 內容規範
- 品牌名：中文 + 英文並列（如「希爾思 Hill's」）
- 禁用詞：推薦、最好、最安全、醫療宣稱
- DM → 乾物比（已全資料庫替換）
- 免責聲明：①非醫療建議 ②資料時效（不加評分獨立性聲明）
