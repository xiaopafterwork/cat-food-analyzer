# Pipeline 主程式
# 依序執行四個 Agent，完成後寫入 Supabase
# 用法：python scripts/run_pipeline.py --brand "法國皇家" --product "K36"

import argparse
import subprocess
import sys
import os

SCRIPTS_DIR = os.path.dirname(__file__)
AGENTS_DIR = os.path.join(SCRIPTS_DIR, "agents")


def run(script: str, label: str):
    print(f"\n{'='*40}")
    print(f"▶ {label}")
    print(f"{'='*40}")
    result = subprocess.run([sys.executable, os.path.join(AGENTS_DIR, script)])
    if result.returncode != 0:
        print(f"❌ {label} 失敗，停止 pipeline")
        sys.exit(1)
    print(f"✅ {label} 完成")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--brand", required=True)
    parser.add_argument("--product", required=True)
    args = parser.parse_args()

    print(f"🐱 開始處理：{args.brand} {args.product}")

    run("01_scraper.py", "爬蟲 Agent")
    run("02_cleaner.py", "清洗 Agent")
    run("03_scorer.py", "評分 Agent")
    run("04_copywriter.py", "文案 Agent")

    print("\n▶ 寫入 Supabase")
    result = subprocess.run([sys.executable, os.path.join(SCRIPTS_DIR, "upload_to_supabase.py")])
    if result.returncode != 0:
        print("❌ 寫入 Supabase 失敗")
        sys.exit(1)

    print("\n🎉 Pipeline 完成！")
