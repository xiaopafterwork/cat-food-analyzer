# -*- coding: utf-8 -*-
"""
重新計算所有飼料的評分並更新 Supabase。
評分公式已更新：蛋白質 40 + 碳水 25 + 脂肪 10 + 透明度 20 + 無穀 5 = 100
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from supabase import create_client

SUPABASE_URL = "https://hltnbcqcsmchmfwdcpoc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdG5iY3Fjc21jaG1md2RjcG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTAzOTgsImV4cCI6MjA5ODEyNjM5OH0.fsWtKXvdg4dtUVlgvXAQ-IK8T5Eq1QtF06TCYMRhyN0"


def get_label(total: int) -> str:
    if total >= 85: return "優質主食"
    if total >= 70: return "不錯的選擇"
    if total >= 50: return "可以接受"
    return "需謹慎"


def score(food: dict) -> tuple[int, str]:
    p = food.get("protein_dm_pct") or 0
    c = food.get("carb_dm_pct")    or 100
    f = food.get("fat_dm_pct")     or 0
    a = food.get("ash_pct")        or 0
    has_grain       = food.get("has_grain", False)
    is_aafco        = food.get("is_aafco_certified", False)
    has_ingredients = bool(food.get("ingredients_raw"))
    has_ash_data    = food.get("ash_pct") is not None
    has_fat_data    = food.get("fat_dm_pct") is not None

    total = 0

    # 蛋白質 (40分)
    if   p >= 50: total += 40
    elif p >= 45: total += 35
    elif p >= 40: total += 30
    elif p >= 35: total += 26
    elif p >= 30: total += 18
    elif p >= 26: total += 9
    else:         total += 3

    # 碳水 (25分)
    if   c <= 10: total += 25
    elif c <= 20: total += 20
    elif c <= 30: total += 15
    elif c <= 40: total += 12
    else:         total += 3

    # 脂肪 (10分)
    if has_fat_data and f > 0:
        if   20 <= f <= 40: total += 10
        elif 15 <= f < 20 or 40 < f <= 50: total += 7
        elif  9 <= f < 15: total += 4
        else: total += 1

    # 透明度 (20分)
    if is_aafco:        total += 8
    if has_ingredients: total += 7
    if has_ash_data:    total += 5

    # 無穀 (5分)
    if not has_grain: total += 5

    # 灰分品質 (5分)
    if has_ash_data:
        if   a <= 8:  total += 5
        elif a <= 10: total += 2

    total = max(0, min(100, total))
    return total, get_label(total)


def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    resp = client.table("cat_foods").select(
        "id,name,brand,protein_dm_pct,carb_dm_pct,fat_dm_pct,ash_pct,"
        "has_grain,is_aafco_certified,ingredients_raw,score_total"
    ).execute()

    foods = resp.data
    print(f"取得 {len(foods)} 筆，開始重新評分...\n")

    updated = 0
    label_counts = {"優質主食": 0, "不錯的選擇": 0, "可以接受": 0, "需謹慎": 0}

    for food in foods:
        old_score = food.get("score_total") or 0
        new_score, new_label = score(food)
        label_counts[new_label] += 1

        diff = new_score - old_score
        diff_str = f"+{diff}" if diff > 0 else str(diff)
        print(f"  {food['brand']} {food['name'][:20]:<20} {old_score:>3} → {new_score:>3} ({diff_str:>4})  [{new_label}]")

        client.table("cat_foods").update({
            "score_total": new_score,
            "score_label": new_label,
        }).eq("id", food["id"]).execute()
        updated += 1

    print(f"\n✅ 完成！更新 {updated} 筆")
    print(f"\n分數分佈：")
    for label, count in label_counts.items():
        print(f"  {label}：{count} 筆")


if __name__ == "__main__":
    main()
