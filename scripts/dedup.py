# -*- coding: utf-8 -*-
"""
dedup.py — 重複偵測工具（不消耗 AI token）

用途：
  1. 偵測 data/ 各階段目錄內的本地重複 JSON
  2. 偵測本地 JSON 與 Supabase 資料庫的重複
  3. （選用）直接刪除 Supabase 重複列，只保留最新一筆

判斷重複依據：brand + name（忽略全形/半形空白、大小寫）

用法：
  python dedup.py           # 只列出重複，不做任何修改
  python dedup.py --fix     # 偵測 + 刪除 Supabase 重複（保留 id 最大的那筆）
  python dedup.py --local   # 只檢查本地 JSON，不連線 Supabase
"""

import io, json, os, sys, argparse, unicodedata
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from supabase import create_client

SUPABASE_URL = "https://hltnbcqcsmchmfwdcpoc.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd"
    "G5iY3Fjc21jaG1md2RjcG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTAzOTgsImV4cCI6MjA5ODEyNjM5OH0"
    ".fsWtKXvdg4dtUVlgvXAQ-IK8T5Eq1QtF06TCYMRhyN0"
)

SCRIPT_DIR = os.path.dirname(__file__)
DATA_DIRS = {
    "raw":     os.path.join(SCRIPT_DIR, "data/raw"),
    "cleaned": os.path.join(SCRIPT_DIR, "data/cleaned"),
    "scored":  os.path.join(SCRIPT_DIR, "data/scored"),
    "final":   os.path.join(SCRIPT_DIR, "data/final"),
}

SEP = "─" * 60


def normalize(s: str) -> str:
    """統一全形→半形、去空白、小寫，方便比對。"""
    s = unicodedata.normalize("NFKC", str(s or ""))
    return s.strip().lower()


def key(brand: str, name: str) -> str:
    return f"{normalize(brand)}||{normalize(name)}"


# ── 1. 本地 JSON 重複偵測 ──────────────────────────────────────
def check_local():
    found_any = False
    for stage, folder in DATA_DIRS.items():
        if not os.path.isdir(folder):
            continue
        files = sorted(f for f in os.listdir(folder) if f.endswith(".json"))
        seen: dict[str, list[str]] = {}
        for fname in files:
            path = os.path.join(folder, fname)
            try:
                data = json.load(open(path, encoding="utf-8"))
            except Exception:
                continue
            k = key(data.get("brand", ""), data.get("name", ""))
            seen.setdefault(k, []).append(fname)

        dups = {k: v for k, v in seen.items() if len(v) > 1}
        if dups:
            found_any = True
            print(f"\n[本地重複] 階段：{stage}/")
            for k, fnames in dups.items():
                brand, name = k.split("||")
                print(f"  ⚠ {brand} / {name}")
                for f in fnames:
                    print(f"      {f}")

    if not found_any:
        print("✅ 本地 JSON 無重複")


# ── 2. 與 Supabase 比對 ──────────────────────────────────────
def fetch_db(client):
    rows = client.table("cat_foods").select("id,brand,name").execute().data
    return rows


def check_db(client):
    rows = fetch_db(client)
    seen: dict[str, list[dict]] = {}
    for r in rows:
        k = key(r.get("brand", ""), r.get("name", ""))
        seen.setdefault(k, []).append(r)

    dups = {k: v for k, v in seen.items() if len(v) > 1}
    if not dups:
        print("✅ Supabase 資料庫無重複")
        return {}

    print(f"\n[資料庫重複] 共 {len(dups)} 組：")
    for k, rows in dups.items():
        brand, name = k.split("||")
        ids = [r["id"] for r in rows]
        print(f"  ⚠ {brand} / {name}  → id: {ids}")
    return dups


def check_local_vs_db(client):
    db_keys: set[str] = set()
    for r in fetch_db(client):
        db_keys.add(key(r.get("brand", ""), r.get("name", "")))

    print(f"\n[本地 vs 資料庫] 資料庫已有 {len(db_keys)} 筆")
    for stage, folder in DATA_DIRS.items():
        if not os.path.isdir(folder):
            continue
        files = [f for f in os.listdir(folder) if f.endswith(".json")]
        hits = []
        for fname in files:
            path = os.path.join(folder, fname)
            try:
                data = json.load(open(path, encoding="utf-8"))
            except Exception:
                continue
            k = key(data.get("brand", ""), data.get("name", ""))
            if k in db_keys:
                hits.append(fname)
        if hits:
            print(f"  [{stage}] 以下檔案已存在於資料庫（上傳前請確認是否要覆蓋）：")
            for h in hits:
                print(f"      {h}")

    print()


# ── 3. 修復：刪除 Supabase 重複（保留 id 最大） ────────────────
def fix_db(client, dups: dict):
    if not dups:
        print("無需修復")
        return
    deleted = 0
    for k, rows in dups.items():
        keep = max(rows, key=lambda r: r["id"])
        to_delete = [r["id"] for r in rows if r["id"] != keep["id"]]
        brand, name = k.split("||")
        for rid in to_delete:
            client.table("cat_foods").delete().eq("id", rid).execute()
            print(f"  🗑 刪除 id={rid}（{brand} / {name}，保留 id={keep['id']}）")
            deleted += 1
    print(f"\n完成，共刪除 {deleted} 筆重複。")


# ── main ─────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix",   action="store_true", help="刪除 Supabase 重複列")
    parser.add_argument("--local", action="store_true", help="只檢查本地，不連線 Supabase")
    args = parser.parse_args()

    print(SEP)
    print("  喵評鑑 dedup.py — 重複偵測工具")
    print(SEP)

    check_local()

    if args.local:
        return

    print(f"\n連線 Supabase…")
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    check_local_vs_db(client)

    dups = check_db(client)

    if args.fix and dups:
        print()
        fix_db(client, dups)
    elif dups:
        print("\n💡 加上 --fix 參數可自動刪除重複（保留最新 id）")

    print(SEP)


if __name__ == "__main__":
    main()
