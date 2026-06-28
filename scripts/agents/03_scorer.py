# -*- coding: utf-8 -*-
import io, json, os, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

CLEANED_DIR = os.path.join(os.path.dirname(__file__), "../data/cleaned")
SCORED_DIR  = os.path.join(os.path.dirname(__file__), "../data/scored")
os.makedirs(SCORED_DIR, exist_ok=True)


def get_label(total: int) -> str:
    if total >= 85: return "優質主食"
    if total >= 70: return "不錯的選擇"
    if total >= 50: return "可以接受"
    return "需謹慎"


def score(food: dict) -> dict:
    """
    加分制，滿分 100。
    蛋白質 40 + 碳水 25 + 脂肪 10 + 透明度 20 + 無穀 5 = 100
    AAFCO 降權（台灣優質品牌不一定有美國認證），蛋白質與碳水加重。
    所有營養數值均為去除水分後的實際含量（乾重）。
    """
    p = food.get("protein_dm_pct") or 0
    c = food.get("carb_dm_pct")    or 100
    f = food.get("fat_dm_pct")     or 0
    a = food.get("ash_pct")        or 0
    has_grain  = food.get("has_grain", False)
    is_aafco   = food.get("is_aafco_certified", False)
    has_ingredients = bool(food.get("ingredients_raw"))
    has_ash_data    = food.get("ash_pct") is not None
    has_fat_data    = food.get("fat_dm_pct") is not None

    total = 0
    breakdown = {}

    # ── 蛋白質 (40分) ──────────────────────────────────────
    if   p >= 50: pts = 40
    elif p >= 45: pts = 35
    elif p >= 40: pts = 30
    elif p >= 35: pts = 26
    elif p >= 30: pts = 18
    elif p >= 26: pts = 9
    else:         pts = 3
    total += pts
    breakdown["protein"] = pts

    # ── 碳水 (25分) ────────────────────────────────────────
    if   c <= 10: pts = 25
    elif c <= 20: pts = 20
    elif c <= 30: pts = 15
    elif c <= 40: pts = 12
    else:         pts = 3
    total += pts
    breakdown["carb"] = pts

    # ── 脂肪 (10分，有數據才計算) ──────────────────────────
    if has_fat_data and f > 0:
        if   20 <= f <= 40: pts = 10
        elif 15 <= f < 20 or 40 < f <= 50: pts = 7
        elif  9 <= f < 15: pts = 4
        else:               pts = 1
    else:
        pts = 0
    total += pts
    breakdown["fat"] = pts

    # ── 透明度 (20分) ──────────────────────────────────────
    aafco_pts       = 8 if is_aafco else 0   # 從 18 降至 8
    ingredient_pts  = 7 if has_ingredients else 0
    ash_label_pts   = 5 if has_ash_data else 0
    trans = aafco_pts + ingredient_pts + ash_label_pts
    total += trans
    breakdown["transparency"] = trans

    # ── 無穀 (5分) ─────────────────────────────────────────
    grain_pts = 0 if has_grain else 5        # 從 8 降至 5
    total += grain_pts
    breakdown["no_grain"] = grain_pts

    # ── 灰分品質 (5分) ─────────────────────────────────────
    if has_ash_data:
        if   a <= 8:  pts = 5
        elif a <= 10: pts = 2
        else:         pts = 0
    else:
        pts = 0
    total += pts
    breakdown["ash"] = pts

    total = max(0, min(100, total))
    food["score_total"]      = total
    food["score_label"]      = get_label(total)
    food["score_breakdown"]  = breakdown
    food["score_ingredient"] = None
    food["score_nutrition"]  = None
    food["score_transparency"] = None
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
        print(f"  {scored['name']} ({scored['brand']}) → {scored['score_total']} 分 [{scored['score_label']}]")
    print(f"\n完成：{len(files)} 筆")


if __name__ == "__main__":
    main()
