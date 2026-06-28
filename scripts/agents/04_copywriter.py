# 文案 Agent（規則式，不呼叫 AI API）
# 輸入：scripts/data/scored/*.json
# 輸出：加上文案欄位的 JSON，存到 scripts/data/final/

import json
import os

SCORED_DIR = os.path.join(os.path.dirname(__file__), "../data/scored")
FINAL_DIR = os.path.join(os.path.dirname(__file__), "../data/final")
os.makedirs(FINAL_DIR, exist_ok=True)


def generate_summary(food: dict) -> dict:
    """依規則產生 ai_summary（good / warning / bad 三行）"""
    protein_dm = food.get("protein_dm_pct", 0) or 0
    carb_dm = food.get("carb_dm_pct", 0) or 0
    has_4d = food.get("has_4d_meat", False)
    has_grain = food.get("has_grain", False)
    has_allergen = food.get("has_allergen", False)

    # ✅ 好的結論
    if protein_dm >= 45:
        good = "蛋白質含量極高，非常適合肉食性的貓咪需求"
    elif protein_dm >= 40:
        good = "蛋白質含量優秀，符合貓咪日常營養需求"
    elif protein_dm >= 30:
        good = "蛋白質含量達標，基本需求足夠"
    else:
        good = "蛋白質含量偏低，建議搭配其他蛋白質來源"

    # ⚠️ 注意
    if carb_dm > 35:
        warning = f"碳水化合物偏高（{carb_dm}%），長期食用建議搭配濕食"
    elif carb_dm > 25:
        warning = f"碳水化合物中等（{carb_dm}%），在可接受範圍內"
    else:
        warning = "碳水化合物控制良好，適合需要低碳飲食的貓咪"

    # ❌ 差的地方
    if has_4d:
        bad = "含來源不明肉品，長期食用有健康疑慮"
    elif has_grain and has_allergen:
        bad = "含穀類及易過敏成分，敏感體質需謹慎"
    elif has_grain:
        bad = "含穀類成分，有穀物過敏的貓咪需避免"
    else:
        bad = "無明顯成分疑慮"

    return {"good": good, "warning": warning, "bad": bad}


def write_copy(food: dict) -> dict:
    food["ai_summary"] = generate_summary(food)
    return food


if __name__ == "__main__":
    for filename in os.listdir(SCORED_DIR):
        if not filename.endswith(".json"):
            continue
        with open(os.path.join(SCORED_DIR, filename), encoding="utf-8") as f:
            food = json.load(f)
        final = write_copy(food)
        out_path = os.path.join(FINAL_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(final, f, ensure_ascii=False, indent=2)
        print(f"已產生文案：{filename}")
