# -*- coding: utf-8 -*-
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

CLEANED_DIR = os.path.join(os.path.dirname(__file__), "../data/cleaned")
SCORED_DIR = os.path.join(os.path.dirname(__file__), "../data/scored")
os.makedirs(SCORED_DIR, exist_ok=True)


def score_ingredient(food: dict) -> int:
    """成分評分，滿分 40"""
    s = 0
    protein_dm = food.get("protein_dm_pct") or 0

    # 蛋白質品質（最高 20）— 對齊 CatInfo.org：40% DM 即為優秀
    if protein_dm >= 40:
        s += 20
    elif protein_dm >= 35:
        s += 16
    elif protein_dm >= 30:
        s += 11
    elif protein_dm >= 26:
        s += 6  # AAFCO 成貓最低標準
    else:
        s += 0  # 低於 AAFCO 最低標準，重扣

    # 是否無穀（最高 10）
    if not food.get("has_grain"):
        s += 10
    elif food.get("has_allergen"):
        s += 0
    else:
        s += 4

    # 無 4D 肉（最高 10）
    if not food.get("has_4d_meat"):
        s += 10

    return min(s, 40)


def score_nutrition(food: dict) -> int:
    """營養評分，滿分 30"""
    s = 0
    protein_dm = food.get("protein_dm_pct") or 0
    carb_dm = food.get("carb_dm_pct") or 100
    fat_dm = food.get("fat_dm_pct") or 0
    ash_dm = food.get("ash_pct") or 0  # 用標示值近似乾重

    # 蛋白質乾物質（最高 13）— 對齊 CatInfo.org 40% 為理想值
    if protein_dm >= 40:
        s += 13
    elif protein_dm >= 35:
        s += 10
    elif protein_dm >= 30:
        s += 7
    elif protein_dm >= 26:
        s += 4
    else:
        s += 0

    # 低碳水（最高 10）— CatInfo.org 核心紅線：< 10%
    if carb_dm <= 10:
        s += 10
    elif carb_dm <= 20:
        s += 8
    elif carb_dm <= 30:
        s += 5
    elif carb_dm <= 40:
        s += 2
    else:
        s += 0

    # 脂肪合理範圍（最高 4）— 放寬低脂懲罰，≥ 8% 即可接受
    if 15 <= fat_dm <= 35:
        s += 4
    elif 8 <= fat_dm < 15 or 35 < fat_dm <= 45:
        s += 2
    else:
        s += 0

    # 灰分腎臟風險扣分（最高扣 3）— 灰分 > 9% 開始扣
    if ash_dm > 11:
        s -= 3
    elif ash_dm > 9:
        s -= 1

    return max(0, min(s, 30))


def score_transparency(food: dict) -> int:
    """透明度評分，滿分 30"""
    s = 0

    # AAFCO 認證（10）
    if food.get("is_aafco_certified"):
        s += 10

    # 有成分列表（10）
    if food.get("ingredients_raw"):
        s += 10

    # 有完整數值（蛋白/脂肪/纖維/水分/灰分都有）（10）
    keys = ["protein_pct", "fat_pct", "fiber_pct", "moisture_pct", "ash_pct"]
    if all(food.get(k) is not None for k in keys):
        s += 10

    return min(s, 30)


def get_label(total: int) -> str:
    if total >= 80:
        return "強烈推薦"
    if total >= 65:
        return "不錯的選擇"
    if total >= 50:
        return "還可以，但有更好的"
    if total >= 35:
        return "謹慎考慮"
    return "不推薦"


def score(food: dict) -> dict:
    si = score_ingredient(food)
    sn = score_nutrition(food)
    st = score_transparency(food)
    total = si + sn + st
    food["score_ingredient"] = si
    food["score_nutrition"] = sn
    food["score_transparency"] = st
    food["score_total"] = total
    food["score_label"] = get_label(total)
    return food


def main():
    files = [f for f in os.listdir(CLEANED_DIR) if f.endswith(".json")]
    print(f"評分 {len(files)} 筆資料...\n")
    for filename in sorted(files):
        with open(os.path.join(CLEANED_DIR, filename), encoding="utf-8") as f:
            food = json.load(f)
        scored = score(food)
        out_path = os.path.join(SCORED_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(scored, f, ensure_ascii=False, indent=2)
        print(f"  {scored['name']} ({scored['brand']}) -> {scored['score_total']}分 [{scored['score_label']}]")
    print(f"\n完成：{len(files)} 筆")


if __name__ == "__main__":
    main()
