# 喵評鑑 — Claude 工作指引

## ⚠️ 最重要：工作目錄
所有指令（git、npm、python）必須在此目錄執行：
```
C:\Users\P\cat-food-analyzer
```
新 session 開始前務必先 cd 到這個路徑，否則 git push 會失敗。

## 專案資訊
- 網址：https://cat-food-analyzer.vercel.app
- GitHub：https://github.com/xiaopafterwork/cat-food-analyzer
- 部署：git push origin master → Vercel 自動上線

## 溝通語言
繁體中文。回覆簡潔，結論優先。

## Agent 團隊
叫「工程師」「設計師」「編輯」「分析師」「CEO」「商業」即可觸發對應 Skill。
詳細觸發詞與規範見 memory/agents_team.md。

## 資料庫
- Supabase URL：https://hltnbcqcsmchmfwdcpoc.supabase.co
- 環境變數在 .env.local（不可 commit）

## 部署前確認
1. `cd C:\Users\P\cat-food-analyzer`
2. `npx next build`（確認無錯誤）
3. `git add` → `git commit` → `git push origin master`
