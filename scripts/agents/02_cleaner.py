# -*- coding: utf-8 -*-
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

RAW_DIR = os.path.join(os.path.dirname(__file__), "../data/raw")
CLEANED_DIR = os.path.join(os.path.dirname(__file__), "../data/cleaned")
os.makedirs(CLEANED_DIR, exist_ok=True)

REQUIRED_FIELDS = [
    "name", "brand", "life_stage", "food_type", "country", "source_url",
    "ingredients_raw", "protein_pct", "fat_pct", "fiber_pct",
    "moisture_pct", "ash_pct", "has_grain", "has_allergen",
    "has_4d_meat", "is_aafco_certified"
]


def clean(raw: dict) -> dict:
    cleaned = {}
    for field in REQUIRED_FIELDS:
        cleaned[field] = raw.get(field)

    # 計算乾物質基礎（Dry Matter）
    moisture = cleaned.get("moisture_pct") or 0
    dm_factor = 100 / (100 - moisture) if moisture < 100 else 1

    protein = cleaned.get("protein_pct")
    fat = cleaned.get("fat_pct")
    fiber = cleaned.get("fiber_pct")
    ash = cleaned.get("ash_pct")

    if protein:
        cleaned["protein_dm_pct"] = round(protein * dm_factor, 1)
    else:
        cleaned["protein_dm_pct"] = None

    if fat:
        cleaned["fat_dm_pct"] = round(fat * dm_factor, 1)
    else:
        cleaned["fat_dm_pct"] = None

    # 碳水化合物（乾物質）= 100 - 蛋白質 - 脂肪 - 纖維 - 灰分
    if all(v is not None for v in [protein, fat, fiber, ash, moisture]):
        carb_as_is = 100 - protein - fat - fiber - ash - moisture
        cleaned["carb_dm_pct"] = round(max(carb_as_is, 0) * dm_factor, 1)
    else:
        cleaned["carb_dm_pct"] = None

    return cleaned


def main():
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".json")]
    print(f"清洗 {len(files)} 筆資料...\n")
    for filename in sorted(files):
        with open(os.path.join(RAW_DIR, filename), encoding="utf-8") as f:
            raw = json.load(f)
        cleaned = clean(raw)
        out_path = os.path.join(CLEANED_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, ensure_ascii=False, indent=2)
        print(f"  OK: {filename}")
    print(f"\n完成：{len(files)} 筆")


if __name__ == "__main__":
    main()
