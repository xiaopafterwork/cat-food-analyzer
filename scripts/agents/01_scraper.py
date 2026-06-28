# -*- coding: utf-8 -*-
import io
import json
import os
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 讓 import crawlers 找得到
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from crawlers.momo_crawler import scrape_momo

TARGETS_PATH = os.path.join(os.path.dirname(__file__), "../targets.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../data/raw")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def safe_filename(text: str) -> str:
    return text.replace(" ", "_").replace("/", "-")


def main():
    with open(TARGETS_PATH, encoding="utf-8") as f:
        targets = json.load(f)

    print(f"共 {len(targets)} 筆目標，開始爬取...\n")
    success, failed = 0, 0

    for i, target in enumerate(targets, 1):
        brand = target["brand"]
        name = target["name"]
        url = target.get("momo_url", "")

        print(f"[{i}/{len(targets)}] {brand} - {name}")

        if not url:
            print("  缺少 URL，跳過")
            failed += 1
            continue

        try:
            data = scrape_momo(url, brand, name)
            filename = f"{safe_filename(brand)}_{safe_filename(name)}.json"
            out_path = os.path.join(OUTPUT_DIR, filename)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  OK: {filename}")
            success += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            failed += 1

        if i < len(targets):
            time.sleep(2)

    print(f"\n完成：成功 {success} 筆，失敗 {failed} 筆")
    print(f"輸出目錄：{OUTPUT_DIR}")


if __name__ == "__main__":
    main()
