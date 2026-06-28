# -*- coding: utf-8 -*-
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from supabase import create_client

SUPABASE_URL = "https://hltnbcqcsmchmfwdcpoc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdG5iY3Fjc21jaG1md2RjcG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTAzOTgsImV4cCI6MjA5ODEyNjM5OH0.fsWtKXvdg4dtUVlgvXAQ-IK8T5Eq1QtF06TCYMRhyN0"

FINAL_DIR = os.path.join(os.path.dirname(__file__), "data/final")

UPLOAD_FIELDS = [
    "name", "brand", "life_stage", "food_type", "country", "source_url",
    "ingredients_raw", "protein_pct", "fat_pct", "fiber_pct", "moisture_pct",
    "ash_pct", "carb_dm_pct", "protein_dm_pct", "fat_dm_pct",
    "score_total", "score_ingredient", "score_nutrition", "score_transparency",
    "score_label", "ai_summary", "ai_pros", "ai_cons",
    "ai_suitable_for", "ai_not_suitable",
    "has_grain", "has_allergen", "has_4d_meat", "is_aafco_certified"
]


def upload():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    files = sorted([f for f in os.listdir(FINAL_DIR) if f.endswith(".json")])

    if not files:
        print("找不到 final JSON 檔案")
        return

    print(f"準備上傳 {len(files)} 筆...\n")
    success, failed = 0, 0

    for filename in files:
        with open(os.path.join(FINAL_DIR, filename), encoding="utf-8") as f:
            data = json.load(f)

        # 只取 Supabase schema 有的欄位
        row = {k: data.get(k) for k in UPLOAD_FIELDS}

        try:
            client.table("cat_foods").insert(row).execute()
            print(f"  OK: {row['name']} ({row['brand']}) [{row['score_total']}分]")
            success += 1
        except Exception as e:
            print(f"  FAIL: {filename} -> {e}")
            failed += 1

    print(f"\n完成：成功 {success} 筆，失敗 {failed} 筆")


if __name__ == "__main__":
    upload()
