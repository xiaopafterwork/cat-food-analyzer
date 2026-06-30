# -*- coding: utf-8 -*-
"""
匯出 Supabase cat_foods 資料表為 Excel 檔案
輸出至 data/cat_foods_database.xlsx
"""
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

from supabase import create_client
import pandas as pd

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://hltnbcqcsmchmfwdcpoc.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_KEY:
    # 讀取 .env.local
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(env_path):
        with open(env_path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                    SUPABASE_KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break

if not SUPABASE_KEY:
    print("找不到 SUPABASE_ANON_KEY，請先設定環境變數或 .env.local")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("正在從 Supabase 讀取資料...")
response = supabase.from_("cat_foods").select("*").order("brand").order("name").execute()
rows = response.data
print(f"共取得 {len(rows)} 筆資料")

# 定義欄位順序與中文標題
COLUMNS = [
    ("brand",               "品牌"),
    ("name",                "飼料名稱"),
    ("life_stage",          "適用階段"),
    ("score_total",         "總分"),
    ("score_label",         "評級"),
    ("protein_dm_pct",      "蛋白質% (乾重)"),
    ("fat_dm_pct",          "脂肪% (乾重)"),
    ("carb_dm_pct",         "碳水% (乾重)"),
    ("ash_dm_pct",          "灰分% (乾重)"),
    ("moisture_pct",        "水分%"),
    ("protein_pct",         "蛋白質% (標示)"),
    ("fat_pct",             "脂肪% (標示)"),
    ("fiber_pct",           "纖維% (標示)"),
    ("ash_pct",             "灰分% (標示)"),
    ("has_grain",           "含穀物"),
    ("is_aafco_certified",  "AAFCO 認證"),
    ("has_ingredient_list", "有成分表"),
    ("has_ash_listed",      "有標示灰分"),
    ("score_protein",       "蛋白質分"),
    ("score_carb",          "碳水分"),
    ("score_fat",           "脂肪分"),
    ("score_transparency",  "透明度分"),
    ("score_grain",         "無穀分"),
    ("score_ash_quality",   "灰分品質分"),
    ("source_url",          "來源網址"),
    ("id",                  "UUID"),
]

df_data = {}
for key, label in COLUMNS:
    df_data[label] = [row.get(key) for row in rows]

df = pd.DataFrame(df_data)

# 布林值中文化
for col in ["含穀物", "AAFCO 認證", "有成分表", "有標示灰分"]:
    if col in df.columns:
        df[col] = df[col].map({True: "是", False: "否", None: ""})

# 適用階段中文化
stage_map = {"kitten": "幼貓", "adult": "成貓", "senior": "熟齡貓", "all": "全齡"}
df["適用階段"] = df["適用階段"].map(lambda x: stage_map.get(x, x))

output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'cat_foods_database.xlsx')

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name='飼料資料庫')

    ws = writer.sheets['飼料資料庫']

    # 凍結首列
    ws.freeze_panes = 'A2'

    # 自動調整欄寬
    for col_idx, col in enumerate(df.columns, 1):
        max_len = max(
            len(str(col)),
            df.iloc[:, col_idx - 1].astype(str).str.len().max() if len(df) > 0 else 0
        )
        ws.column_dimensions[ws.cell(1, col_idx).column_letter].width = min(max_len + 4, 40)

print(f"✅ 匯出完成：{output_path}")
print(f"   共 {len(df)} 筆，{len(df.columns)} 個欄位")
