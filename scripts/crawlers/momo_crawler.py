import re
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from crawlers.utils import get_html, parse_nutrition_table, parse_life_stage, parse_food_type, parse_ingredients


def scrape_momo(url: str, brand: str, name: str) -> dict:
    """
    爬取 momo 商品頁，回傳符合 cat_foods schema 的 dict。
    找不到的欄位填 None，不會 crash。
    """
    result = {
        "name": name,
        "brand": brand,
        "life_stage": parse_life_stage(name),
        "food_type": parse_food_type(name),
        "country": None,
        "source_url": url,
        "ingredients_raw": None,
        "protein_pct": None,
        "fat_pct": None,
        "fiber_pct": None,
        "moisture_pct": None,
        "ash_pct": None,
    }

    soup = get_html(url)
    if soup is None:
        return result

    # 商品名稱（用於 life_stage / food_type 再判斷一次）
    title_el = soup.select_one("h1.prdName") or soup.select_one("h1")
    full_title = title_el.get_text(strip=True) if title_el else name
    result["life_stage"] = parse_life_stage(full_title)
    result["food_type"] = parse_food_type(full_title)

    # 商品描述區塊
    desc = (
        soup.select_one("#goodsDescription")
        or soup.select_one(".goods-description")
        or soup.select_one(".prdInfoDetail")
    )
    if desc:
        result["ingredients_raw"] = parse_ingredients(desc)
        nutrition = parse_nutrition_table(desc)
    else:
        nutrition = parse_nutrition_table(soup)

    result.update({k: v for k, v in nutrition.items() if v is not None})

    # 原產地
    text = soup.get_text()
    country_m = re.search(r"原產地[：:]\s*(\S+)", text)
    if country_m:
        result["country"] = country_m.group(1)

    return result
