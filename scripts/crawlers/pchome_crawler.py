# -*- coding: utf-8 -*-
"""
PChome 24h 貓飼料爬蟲
使用 PChome 搜尋 API + 商品詳細頁面解析
"""
import re
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
    "Referer": "https://24h.pchome.com.tw/",
}

SEARCH_API = "https://ecshweb.pchome.com.tw/search/v3.3/"


def search_pchome(keyword: str, pages: int = 3) -> list[dict]:
    """搜尋 PChome 商品，回傳商品基本列表"""
    products = []
    for page in range(1, pages + 1):
        params = {
            "q": keyword,
            "scope": "24h",
            "page": page,
            "sort": "sale/dc",
            "rows": 40,
        }
        try:
            resp = requests.get(SEARCH_API, params=params, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            prods = data.get("prods", [])
            if not prods:
                break
            products.extend(prods)
            print(f"  第 {page} 頁：取得 {len(prods)} 筆")
            time.sleep(1)
        except Exception as e:
            print(f"  搜尋失敗 (page {page})：{e}")
            break
    return products


def get_product_page(prod_id: str) -> BeautifulSoup | None:
    url = f"https://24h.pchome.com.tw/prod/{prod_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        return BeautifulSoup(resp.text, "html.parser"), url
    except Exception as e:
        print(f"  ⚠️  商品頁失敗 {prod_id}：{e}")
        return None, url


def parse_float(text: str) -> float | None:
    m = re.search(r"(\d+\.?\d*)", text.replace(",", ""))
    return float(m.group(1)) if m else None


def parse_nutrition(text: str) -> dict:
    """從純文字中抓營養成分數值"""
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


def parse_life_stage(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["幼貓", "kitten", "幼齡"]):
        return "kitten"
    if any(k in t for k in ["熟齡", "老貓", "senior", "7歲", "7+"]):
        return "senior"
    if any(k in t for k in ["全齡", "all age", "all life"]):
        return "all"
    return "adult"


def parse_food_type(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["濕食", "罐頭", "肉泥", "湯包", "wet", "pouch", "主食罐"]):
        return "wet"
    return "dry"


def parse_ingredients(text: str) -> str | None:
    m = re.search(
        r"(?:成分|原料)[：:]\s*(.{10,600}?)(?:\n\n|保證分析|分析保證|營養成分|粗蛋白|$)",
        text, re.DOTALL
    )
    if m:
        raw = m.group(1).strip()
        raw = re.sub(r"\s+", " ", raw)
        return raw[:500] if len(raw) > 10 else None
    return None


def has_grain(ingredients: str | None) -> bool:
    if not ingredients:
        return False
    grain_keywords = ["玉米", "小麥", "大麥", "燕麥", "米", "糙米", "白米", "高粱",
                      "corn", "wheat", "barley", "oat", "rice", "sorghum"]
    text = ingredients.lower()
    return any(k in text for k in grain_keywords)


def scrape_product(prod: dict) -> dict | None:
    """抓單一商品完整資料，回傳符合 cat_foods schema 的 dict"""
    prod_id = prod.get("Id", "")
    name = prod.get("Name", "").strip()
    price = prod.get("Price", {}).get("M", 0)

    # 過濾明顯不是貓飼料的商品
    skip_keywords = ["貓砂", "貓抓板", "貓玩具", "貓床", "貓跳台", "貓籠", "貓咪玩", "美容"]
    if any(k in name for k in skip_keywords):
        return None

    # 只要乾糧（wet food 可之後再加）
    # if parse_food_type(name) == "wet":
    #     return None

    soup, url = get_product_page(prod_id)
    if soup is None:
        return None

    # 取完整商品描述文字
    desc_el = (
        soup.select_one("#Description") or
        soup.select_one(".prod-description") or
        soup.select_one("[class*='description']") or
        soup.select_one("[class*='Description']")
    )
    full_text = desc_el.get_text(separator="\n") if desc_el else soup.get_text(separator="\n")

    nutrition = parse_nutrition(full_text)
    ingredients_raw = parse_ingredients(full_text)

    # 推斷品牌：嘗試從麵包屑或商品名推斷
    brand = ""
    breadcrumb = soup.select(".breadcrumb a, [class*='breadcrumb'] a, [class*='Breadcrumb'] a")
    if len(breadcrumb) >= 3:
        brand = breadcrumb[-2].get_text(strip=True)

    # 若麵包屑沒有，從標題推斷第一個詞
    if not brand:
        # 常見貓糧品牌
        known_brands = [
            "皇家", "希爾思", "Hills", "Royal Canin", "冠能", "PRO PLAN", "Purina",
            "耐吉斯", "Nutrience", "自然平衡", "Natural Balance", "奇境", "Zignature",
            "魏大夫", "VET", "Lotus", "藍饌", "Blue Buffalo", "愛肯拿", "ACANA",
            "歐肯拿根", "Orijen", "ORIJEN", "Go!", "GO!", "Farmina", "法米納",
            "Wellness", "比利傑", "Belcando", "Applaws", "冰島純", "Icecat",
            "怡親", "Eukanuba", "Science Diet", "伊納寶", "Inaba",
            "幸福貓", "CIAO", "寵愛一生", "原野優", "Taste of the Wild",
            "Solid Gold", "固力果", "Dr. Elsey", "ProNature", "Pronature",
        ]
        for b in known_brands:
            if b.lower() in name.lower():
                brand = b
                break

    if not brand:
        # 取第一個有意義的詞作為品牌
        words = re.split(r"[\s【】\[\]「」（）]", name)
        brand = words[0] if words else name[:4]

    # 有沒有 AAFCO（從描述文字判斷）
    is_aafco = bool(re.search(r"AAFCO|aafco", full_text))

    ingredients_text = ingredients_raw or ""
    result = {
        "name": name,
        "brand": brand,
        "life_stage": parse_life_stage(name + " " + full_text[:200]),
        "food_type": parse_food_type(name),
        "source_url": url,
        "ingredients_raw": ingredients_raw,
        "protein_pct": nutrition.get("protein_pct"),
        "fat_pct": nutrition.get("fat_pct"),
        "fiber_pct": nutrition.get("fiber_pct"),
        "moisture_pct": nutrition.get("moisture_pct"),
        "ash_pct": nutrition.get("ash_pct"),
        "has_grain": has_grain(ingredients_text),
        "is_aafco_certified": is_aafco,
        "has_ingredient_list": bool(ingredients_raw),
        "has_ash_listed": nutrition.get("ash_pct") is not None,
        "price_approx": price,
    }
    return result
