# -*- coding: utf-8 -*-
"""
PChome 24h 貓飼料爬蟲（Playwright 版）
執行：python scripts/pchome_crawl.py
輸出：data/raw/pchome_YYYY-MM-DD.json
"""
import io, json, os, re, sys, time
from datetime import date

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout

RAW_DIR = os.path.join(os.path.dirname(__file__), "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)
OUTPUT_PATH = os.path.join(RAW_DIR, f"pchome_{date.today()}.json")

KEYWORDS = ["貓乾糧", "貓飼料 無穀", "貓飼料 高蛋白", "幼貓飼料"]
MAX_PRODS_PER_KW = 30   # 每個關鍵字最多抓幾個商品連結

SKIP_KW = ["貓砂", "貓抓板", "貓玩具", "貓床", "貓跳台", "貓籠", "美容", "除臭", "貓廁所"]


# ── 工具函數 ───────────────────────────────────────────────
def parse_float(text):
    m = re.search(r"(\d+\.?\d*)", text)
    return float(m.group(1)) if m else None

def parse_nutrition(text):
    patterns = {
        "protein_pct":  r"粗蛋白質?\s*[：:≥≦(（]?\s*(\d+\.?\d*)\s*%",
        "fat_pct":      r"粗脂肪\s*[：:≥≦(（]?\s*(\d+\.?\d*)\s*%",
        "fiber_pct":    r"粗纖維\s*[：:≥≦(（]?\s*(\d+\.?\d*)\s*%",
        "moisture_pct": r"水分\s*[：:≥≦(（]?\s*(\d+\.?\d*)\s*%",
        "ash_pct":      r"粗灰分\s*[：:≥≦(（]?\s*(\d+\.?\d*)\s*%",
    }
    result = {}
    for key, pat in patterns.items():
        m = re.search(pat, text)
        if m:
            result[key] = float(m.group(1))
    return result

def parse_life_stage(text):
    t = text.lower()
    if any(k in t for k in ["幼貓", "kitten", "幼齡"]):
        return "kitten"
    if any(k in t for k in ["熟齡", "老貓", "senior"]):
        return "senior"
    if any(k in t for k in ["全齡", "all age", "all life", "各年齡"]):
        return "all"
    return "adult"

def parse_food_type(text):
    t = text.lower()
    if any(k in t for k in ["濕食", "罐頭", "肉泥", "湯包", "wet", "pouch", "主食罐"]):
        return "wet"
    return "dry"

def parse_ingredients(text):
    m = re.search(
        r"(?:成分|原料)[：:]\s*(.{10,600}?)(?:\n\n|保證分析|分析保證|營養成分|粗蛋白|$)",
        text, re.DOTALL
    )
    if m:
        raw = re.sub(r"\s+", " ", m.group(1).strip())
        return raw[:500] if len(raw) > 10 else None
    return None

def detect_grain(ingredients):
    if not ingredients:
        return False
    kw = ["玉米", "小麥", "大麥", "燕麥", "白米", "糙米", "高粱", "corn", "wheat", "barley", "rice"]
    return any(k in ingredients.lower() for k in kw)

KNOWN_BRANDS = [
    "皇家", "希爾思", "Hills", "Royal Canin", "冠能", "PRO PLAN", "Purina",
    "耐吉斯", "Nutrience", "自然平衡", "Natural Balance", "奇境", "Zignature",
    "魏大夫", "Lotus", "藍饌", "Blue Buffalo", "愛肯拿", "ACANA",
    "歐肯拿根", "Orijen", "ORIJEN", "Go!", "Farmina", "法米納",
    "Wellness", "比利傑", "Belcando", "Applaws", "怡親", "Eukanuba",
    "幸福貓", "CIAO", "原野優", "Taste of the Wild", "Solid Gold",
    "ProNature", "Pronature", "WDJ", "DR.ELSEY", "instinct", "Instinct",
    "渴望", "Canidae", "Merrick", "Iams", "愛慕絲",
]

def guess_brand(name):
    for b in KNOWN_BRANDS:
        if b.lower() in name.lower():
            return b
    words = re.split(r"[\s【】\[\]「」（）|｜]", name)
    return words[0][:6] if words else name[:4]


# ── 主流程 ───────────────────────────────────────────────
def run():
    results = []
    seen_urls = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="zh-TW",
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.new_page()
        page.set_extra_http_headers({"Accept-Language": "zh-TW,zh;q=0.9"})

        # 收集商品 URL
        all_links = []
        for kw in KEYWORDS:
            print(f"\n🔍 搜尋：{kw}")
            search_url = f"https://24h.pchome.com.tw/search/?q={kw}&scope=24h"
            try:
                page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)

                # 取商品連結
                links = page.evaluate(
                    "() => [...new Set([...document.querySelectorAll('a')].filter(a => a.href.includes('/prod/')).map(a => a.href))]"
                )
                # 過濾 + 去重
                for link in links:
                    m = re.search(r"/prod/([A-Z0-9\-]+)", link)
                    if not m:
                        continue
                    clean = f"https://24h.pchome.com.tw/prod/{m.group(1)}"
                    if clean not in seen_urls:
                        seen_urls.add(clean)
                        all_links.append(clean)
                    if len([l for l in all_links]) >= MAX_PRODS_PER_KW * len(KEYWORDS):
                        break

                print(f"  累計 {len(all_links)} 個商品連結")
            except PwTimeout:
                print(f"  ⚠️  頁面逾時")
            time.sleep(2)

        print(f"\n共 {len(all_links)} 個商品連結，開始逐一爬取...\n")

        # 爬各商品
        for i, url in enumerate(all_links, 1):
            print(f"[{i}/{len(all_links)}] {url}")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=25000)
                page.wait_for_timeout(2000)

                name = ""
                try:
                    name = page.locator("h1").first.inner_text(timeout=5000).strip()
                except Exception:
                    pass

                if not name:
                    print("  ⏭  無法取得商品名，跳過")
                    continue

                if any(k in name for k in SKIP_KW):
                    print(f"  ⏭  非目標商品：{name[:30]}")
                    continue

                full_text = page.inner_text("body")
                nutrition = parse_nutrition(full_text)
                ingredients = parse_ingredients(full_text)
                is_aafco = bool(re.search(r"AAFCO|aafco", full_text))

                has_nutrition = any(nutrition.get(k) for k in ["protein_pct", "fat_pct", "moisture_pct"])
                if not has_nutrition:
                    print(f"  ⚠️  無法解析營養成分：{name[:30]}")
                    continue

                data = {
                    "name": name,
                    "brand": guess_brand(name),
                    "life_stage": parse_life_stage(name + " " + full_text[:300]),
                    "food_type": parse_food_type(name),
                    "source_url": url,
                    "ingredients_raw": ingredients,
                    "protein_pct": nutrition.get("protein_pct"),
                    "fat_pct": nutrition.get("fat_pct"),
                    "fiber_pct": nutrition.get("fiber_pct"),
                    "moisture_pct": nutrition.get("moisture_pct"),
                    "ash_pct": nutrition.get("ash_pct"),
                    "has_grain": detect_grain(ingredients or ""),
                    "is_aafco_certified": is_aafco,
                    "has_ingredient_list": bool(ingredients),
                    "has_ash_listed": nutrition.get("ash_pct") is not None,
                }
                results.append(data)
                print(f"  ✅ {name[:30]} | 蛋白質={nutrition.get('protein_pct')}% 水分={nutrition.get('moisture_pct')}%")

            except PwTimeout:
                print(f"  ⚠️  頁面逾時")
            except Exception as e:
                print(f"  ❌ 錯誤：{e}")

            time.sleep(2)

        browser.close()

    with open(OUTPUT_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"完成！有效資料：{len(results)} 筆")
    print(f"輸出：{OUTPUT_PATH}")
    print(f"\n確認資料後，執行 upload 腳本同步到 Supabase。")


if __name__ == "__main__":
    run()
