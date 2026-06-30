# 喵評鑑 MEOWPJ

台灣貓咪飼料與主食罐科學評分平台。  
成分透明・科學評分・乾飼料和主食罐都有。

**網址**：https://meowpj.com

---

## 技術棧

- **前端**：Next.js 14 App Router + TypeScript + Tailwind CSS
- **資料庫**：Supabase (PostgreSQL)
- **部署**：Vercel（push to master 自動上線）

## 本地開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

環境變數（`.env.local`，不可 commit）：
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 部署

```bash
git push origin HEAD:master
```

## 資料庫

| 類型 | 筆數 |
|------|------|
| 乾飼料 | 775 筆 |
| 主食罐 | 1,870 筆 |
| 合計 | 2,645 筆 |

## 評分系統 v4.0

蛋白質(50) + 碳水(30) + AAFCO(15) + 灰分(5) = 100 分

| 分數 | 等級 |
|------|------|
| 75–100 | 優質主食 |
| 60–74 | 均衡日常 |
| 45–59 | 基礎配方 |
| <45 | 建議搭配 |

## 資料夾結構

```
cat-food-analyzer/
├── app/                    # Next.js 頁面
│   ├── page.tsx            # 首頁
│   ├── food/[id]/          # 飼料/主食罐詳情
│   ├── brand/[brand]/      # 品牌頁
│   ├── brands/             # 所有品牌
│   ├── compare/            # 比較頁
│   ├── how-we-score/       # 評分標準
│   └── request/            # 新增需求
├── components/             # 共用元件（Nav 等）
├── lib/                    # Supabase client
├── public/                 # 靜態資源（logo.png 等）
├── LOGO/                   # Logo 原始檔
├── 飼料資料庫/              # 乾飼料 Excel + JSON
├── 主食罐資料庫/            # 主食罐 Excel + JSON
├── .ai-team/               # AI 團隊 Agent 規範
└── dev.log                 # 開發日誌
```
