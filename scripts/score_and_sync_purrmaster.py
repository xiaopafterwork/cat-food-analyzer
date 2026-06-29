# -*- coding: utf-8 -*-
"""
score_and_sync_purrmaster.py
v3.0 評分：蛋白質(40) + 碳水(25) + 品質(35) = 100
同步 780 筆 Purrmaster 資料到 Supabase
"""
import io, sys, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from supabase import create_client

SUPABASE_URL = "https://hltnbcqcsmchmfwdcpoc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdG5iY3Fjc21jaG1md2RjcG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTAzOTgsImV4cCI6MjA5ODEyNjM5OH0.fsWtKXvdg4dtUVlgvXAQ-IK8T5Eq1QtF06TCYMRhyN0"
JSON_PATH = "data/raw/purrmaster_20260629_1518.json"

# ── 認證品牌（同 update_certified.py）──
CERTIFIED_PREFIXES = [
    'royal canin', "hill's", 'hills', 'proplan', 'pro plan',
    'wellness', 'nulo', 'blackwood', 'instinct', 'natural balance',
    'halo', 'solid gold', 'open farm', 'merrick', 'earthborn',
    'chicken soup', 'canidae', 'blue buffalo', 'avoderm', 'kirkland',
    'diamond naturals', 'taste of the wild', 'annamaet', "grandma mae's",
    'evolve', 'nutri source', 'organix', 'nutro', 'orijen', 'acana',
    'best breed', 'bravo', 'health extension', "dr.tim", 'verus',
    'harlow blend', 'holistic select', 'now!', 'now fresh',
    'boreal', 'nutrience', 'go!', 'pronature', '1st choice', 'carna4',
    'firstmate', 'north paw', 'loveabowl', 'nutram', 'tundra',
    'ziwipeak', 'k9 natural', 'kiwi kitchens', 'addiction', 'zeal',
    'vetalogica', 'ivory coat', 'advance', 'kaniva', 'regal',
    'blue bay', 'real power', 'anf',
    'n&d farmina', 'farmina', 'monge', 'alleva', 'renske',
    'ownat', 'natural greatness', 'aatu', 'applaws', 'equilibrio', 'krave',
    'wild islands',
]

def is_certified(brand: str) -> bool:
    b = brand.lower().strip()
    return any(b.startswith(p) or p in b for p in CERTIFIED_PREFIXES)


# ── v3.0 評分公式 ──

def score_protein(p: float) -> int:
    if p is None: return 0
    if p >= 50: return 50
    if p >= 45: return 46
    if p >= 40: return 41
    if p >= 35: return 35
    if p >= 30: return 30
    if p >= 26: return 18
    return 5

def score_carb(c: float) -> int:
    if c is None: return 15   # 無資料給中位值
    if c <= 10:  return 30
    if c <= 20:  return 26
    if c <= 30:  return 21
    if c <= 40:  return 18
    if c <= 50:  return 15
    return 8

def score_quality(certified: bool, has_ingredients: bool, ash_dm: float | None) -> int:
    pts = 0
    if certified:          pts += 15
    if ash_dm is not None: pts += 5
    return pts

def score_label(total: int) -> str:
    if total >= 75: return "優質主食"
    if total >= 60: return "均衡日常"
    if total >= 45: return "基礎配方"
    return "建議搭配"

def calc_score(food: dict) -> dict:
    p   = food.get("protein_dm_pct")
    c   = food.get("carb_dm_pct")
    ash = food.get("ash_dm_pct")
    certified    = is_certified(food.get("brand", ""))
    has_ingr     = bool(food.get("has_ingredients"))

    sp = score_protein(p)
    sc = score_carb(c)
    sq = score_quality(certified, has_ingr, ash)
    total = sp + sc + sq

    return {
        "score_protein": sp,
        "score_carb":    sc,
        "score_quality": sq,
        "score_total":   total,
        "score_label":   score_label(total),
    }


# ── 清理非法字符（避免 Supabase text 欄位問題）──
_illegal = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')

def clean(v):
    if isinstance(v, str):
        return _illegal.sub('', v) or None
    return v


# ── 主流程 ──
def main():
    with open(JSON_PATH, encoding='utf-8') as f:
        foods = json.load(f)
    print(f"載入 {len(foods)} 筆")

    rows = []
    score_dist = {"優質主食": 0, "均衡日常": 0, "基礎配方": 0, "建議搭配": 0}

    for food in foods:
        scores = calc_score(food)
        score_dist[scores["score_label"]] += 1

        row = {
            "id":               food.get("id"),
            "brand":            clean(food.get("brand")),
            "name":             clean(food.get("name")),
            "life_stage":       clean(food.get("life_stage")),
            "country":          clean(food.get("country")),
            "source_url":       clean(food.get("source_url")),
            "protein_pct":      food.get("protein_pct"),
            "fat_pct":          food.get("fat_pct"),
            "fiber_pct":        food.get("fiber_pct"),
            "ash_pct":          food.get("ash_pct"),
            "moisture_pct":     food.get("moisture_pct"),
            "carb_pct":         food.get("carb_pct"),
            "protein_dm_pct":   food.get("protein_dm_pct"),
            "fat_dm_pct":       food.get("fat_dm_pct"),
            "carb_dm_pct":      food.get("carb_dm_pct"),
            "ash_dm_pct":       food.get("ash_dm_pct"),
            "fiber_dm_pct":     food.get("fiber_dm_pct"),
            "has_grain":        food.get("has_grain"),
            "has_ingredients":  food.get("has_ingredients"),
            "ingredients_raw":  clean(food.get("ingredients_raw")),
            "is_aafco_certified": is_certified(food.get("brand", "")),
            "food_type":        "dry",
            **scores,
        }
        rows.append(row)

    print("評分分佈：")
    for label, cnt in score_dist.items():
        print(f"  {label}: {cnt} 筆")

    # 連線 Supabase
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 清空
    print("\n清空 Supabase cat_foods...")
    client.table("cat_foods").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("清空完成")

    # 批次 insert
    BATCH = 50
    success = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i+BATCH]
        try:
            client.table("cat_foods").insert(batch).execute()
            success += len(batch)
            print(f"  [{i+1}~{i+len(batch)}] OK")
        except Exception as e:
            print(f"  [{i+1}~{i+len(batch)}] FAIL: {e}")
            for row in batch:
                try:
                    client.table("cat_foods").insert(row).execute()
                    success += 1
                except Exception as e2:
                    print(f"    FAIL {row.get('name','?')}: {e2}")

    print(f"\n完成：{success}/{len(rows)} 筆上傳")


if __name__ == "__main__":
    main()
