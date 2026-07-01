# -*- coding: utf-8 -*-
"""
upload_wet_to_supabase.py
把 purrmaster_wet_*.json 上傳到 Supabase cat_foods 表（濕食專用）。
策略：upsert by id，不清空，不影響現有乾飼料資料。
執行前請老闆確認 JSON 內容正確！
"""
import io, sys, os, json, glob

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from supabase import create_client

SUPABASE_URL = "https://hltnbcqcsmchmfwdcpoc.supabase.co"

def _load_service_role_key():
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if key:
        return key
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("SUPABASE_SERVICE_ROLE_KEY="):
                    return line.strip().split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("找不到 SUPABASE_SERVICE_ROLE_KEY，請確認 .env.local 內有設定")

SUPABASE_KEY = _load_service_role_key()

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")

# ── 評分公式 v4.0（與乾飼料相同，乾物比換算已在爬蟲完成）──────────────────

def calc_protein_score(dm: float | None) -> int:
    # 濕食專用門檻：乾物比蛋白普遍偏高，拉高標準才有鑑別力
    if dm is None: return 0
    if dm >= 65: return 50
    if dm >= 60: return 46
    if dm >= 55: return 41
    if dm >= 50: return 35
    if dm >= 45: return 28
    if dm >= 40: return 18
    return 5

def calc_carb_score(dm: float | None) -> int:
    # 濕食碳水天生較低，門檻稍嚴
    if dm is None: return 0
    if dm <= 5:  return 30
    if dm <= 10: return 26
    if dm <= 15: return 21
    if dm <= 20: return 18
    if dm <= 30: return 12
    return 5

def calc_quality_score(is_aafco: bool, ash_pct: float | None) -> int:
    score = 0
    if is_aafco: score += 15
    if ash_pct is not None: score += 5
    return score

def get_score_label(total: int) -> str:
    if total >= 75: return "優質主食"
    if total >= 60: return "均衡日常"
    if total >= 45: return "基礎配方"
    return "建議搭配"

def score_row(row: dict) -> dict:
    p = calc_protein_score(row.get("protein_dm_pct"))
    c = calc_carb_score(row.get("carb_dm_pct"))
    q = calc_quality_score(False, row.get("ash_pct"))  # 濕食暫無 AAFCO 資料
    total = p + c + q
    return {
        "score_ingredient": None,
        "score_nutrition": None,
        "score_transparency": None,
        "score_total": total,
        "score_label": get_score_label(total),
    }

# ── 主程式 ──────────────────────────────────────────────────────────────────

def main():
    # 找最新的 wet JSON
    pattern = os.path.join(RAW_DIR, "purrmaster_wet_*.json")
    files = sorted(glob.glob(pattern))
    if not files:
        print("❌ 找不到 purrmaster_wet_*.json，請先執行爬蟲")
        sys.exit(1)
    json_path = files[-1]
    print(f"來源：{os.path.basename(json_path)}")

    with open(json_path, encoding="utf-8") as f:
        raw = json.load(f)
    print(f"讀取：{len(raw)} 筆")

    # 過濾：至少有蛋白質乾物比才能計分
    valid = [r for r in raw if r.get("protein_dm_pct")]
    print(f"有效（含蛋白質乾物比）：{len(valid)} 筆，略過 {len(raw)-len(valid)} 筆")

    # 組 Supabase rows
    sb_rows = []
    for r in valid:
        scores = score_row(r)
        sb = {
            "id":               r["id"],
            "brand":            r["brand"].strip(),
            "name":             r["name"].strip(),
            "food_type":        "wet",
            "life_stage":       r.get("life_stage") or "all",
            "source_url":       r.get("source_url"),
            # 標示值
            "protein_pct":      r.get("protein_pct"),
            "fat_pct":          r.get("fat_pct"),
            "fiber_pct":        r.get("fiber_pct"),
            "moisture_pct":     r.get("moisture_pct"),
            "ash_pct":          r.get("ash_pct") if r.get("ash_pct") else None,
            # 乾物比
            "protein_dm_pct":   r.get("protein_dm_pct"),
            "fat_dm_pct":       r.get("fat_dm_pct"),
            "carb_dm_pct":      r.get("carb_dm_pct"),
            "ash_dm_pct":       r.get("ash_dm_pct"),
            "fiber_dm_pct":     r.get("fiber_dm_pct"),
            # 旗標
            "has_grain":        bool(r.get("has_grain")),
            "is_aafco_certified": False,
            "has_allergen":     False,
            "has_4d_meat":      False,
            # 成分
            "ingredients_raw":  r.get("ingredients_raw") or None,
            "ai_summary":       None,
            # 評分
            **scores,
        }
        sb_rows.append(sb)

    # 預覽前 5 筆
    print("\n── 預覽前 5 筆 ──")
    for row in sb_rows[:5]:
        print(f"  {row['brand']} | {row['name'][:30]} | 蛋白DM={row['protein_dm_pct']}% 碳水DM={row['carb_dm_pct']}% | {row['score_total']}分 {row['score_label']}")

    # 分數分布
    print("\n── 分數分布 ──")
    from collections import Counter
    dist = Counter(r["score_label"] for r in sb_rows)
    for label in ["優質主食", "均衡日常", "基礎配方", "建議搭配"]:
        print(f"  {label}: {dist[label]} 筆")

    # 確認上傳
    print(f"\n⚠️  即將 upsert {len(sb_rows)} 筆濕食到 Supabase（不清空現有乾飼料）")
    ans = input("確認上傳？(y/N): ").strip().lower()
    if ans != "y":
        print("取消。")
        return

    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    BATCH = 50
    success = 0
    for i in range(0, len(sb_rows), BATCH):
        batch = sb_rows[i:i+BATCH]
        try:
            client.table("cat_foods").upsert(batch).execute()
            success += len(batch)
            print(f"  ✅ [{i+1}~{i+len(batch)}]")
        except Exception as e:
            print(f"  ❌ [{i+1}~{i+len(batch)}] 批次失敗，逐筆重試... {e}")
            for row in batch:
                try:
                    client.table("cat_foods").upsert(row).execute()
                    success += 1
                except Exception as e2:
                    print(f"    ❌ {row.get('name','?')} 失敗：{e2}")

    print(f"\n完成：成功 {success}/{len(sb_rows)} 筆")


if __name__ == "__main__":
    main()
