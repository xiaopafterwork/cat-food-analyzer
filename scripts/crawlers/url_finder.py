# -*- coding: utf-8 -*-
"""
url_finder.py — 自動尋找飼料的官網 URL 與零售店第二來源

策略：
  官網  → 1. 品牌對照表（已知品牌直接對應）
           2. DuckDuckGo 搜尋官網頁面
  零售  → DuckDuckGo 搜尋台灣寵物零售店商品頁
           優先：lovecat / ation / catbird / ipet / pethealth 等專門店
           有成分表的頁面優先，電商（pchome/momo/shopee）排除
"""

import re, time
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
}

# 排除電商平台（不含成分表）
EXCLUDE_ECOMMERCE = [
    "pchome", "momo", "shopee", "ruten", "yahoo", "facebook",
    "instagram", "youtube", "line", "google", "wiki",
]

# 優先零售寵物店域名（有成分表的機率高）
PREFERRED_RETAIL = [
    "lovecat.com.tw",
    "ation.com.tw",
    "catbird.com.tw",
    "ipetstore.com.tw",
    "pethealth.com.tw",
    "bestpets.com.tw",
    "petsmile.com.tw",
    "4pawspet.com.tw",
    "petmart.com.tw",
    "pethonest.com.tw",
]


# ── 品牌官網對照表 ────────────────────────────────────────────
BRAND_OFFICIAL: dict[str, str] = {
    # 台灣品牌
    "汪喵星球":         "https://www.wangmiao.com.tw/",
    "heromama":         "https://www.heromama.com.tw/",
    "虎貓":             "https://www.heromama.com.tw/",
    "御天貓":           "https://www.catpool.com.tw/",
    "catpool":          "https://www.catpool.com.tw/",
    "seeds":            "https://www.seeds.com.tw/",
    "惜時":             "https://www.seeds.com.tw/",
    "addiction":        "https://www.addictionpet.com/",
    "自然癮食":         "https://www.addictionpet.com/",
    "ziwi":             "https://www.ziwipets.com/",
    "滋益巔峰":         "https://www.ziwipets.com/",
    "k9 natural":       "https://k9natural.com/",
    "inaba":            "https://www.inaba-petfood.co.jp/",
    "伊納寶":           "https://www.inaba-petfood.co.jp/",
    # 國際品牌台灣官網
    "法國皇家":         "https://www.royalcanin.com/tw",
    "royal canin":      "https://www.royalcanin.com/tw",
    "希爾思":           "https://www.hillspet.com.tw",
    "hill's":           "https://www.hillspet.com.tw",
    "hills":            "https://www.hillspet.com.tw",
    "冠能":             "https://www.purina.com.tw/brands/pro-plan",
    "pro plan":         "https://www.purina.com.tw/brands/pro-plan",
    "purina":           "https://www.purina.com.tw",
    "法米納":           "https://www.farmina.com/tw/",
    "farmina":          "https://www.farmina.com/tw/",
    "威樂":             "https://www.wellnesspetfood.com/",
    "wellness":         "https://www.wellnesspetfood.com/",
    "本能":             "https://www.instinctpetfood.com/",
    "instinct":         "https://www.instinctpetfood.com/",
    "歐睿健":           "https://www.orijen.ca/",
    "orijen":           "https://www.orijen.ca/",
    "愛肯拿":           "https://www.acana.com/",
    "acana":            "https://www.acana.com/",
    "藍饌":             "https://www.bluebuffalo.com/",
    "blue buffalo":     "https://www.bluebuffalo.com/",
    "史黛拉奇":         "https://www.stellaandchewys.com/",
    "stella & chewy's": "https://www.stellaandchewys.com/",
    "曠野":             "https://www.tasteofthewildpetfood.com/",
    "taste of the wild":"https://www.tasteofthewildpetfood.com/",
    "卡比":             "https://www.canidae.com/",
    "canidae":          "https://www.canidae.com/",
    "地球天然":         "https://www.earthbornholisticpetfood.com/",
    "earthborn":        "https://www.earthbornholisticpetfood.com/",
    "紐樂":             "https://www.nulo.com/",
    "nulo":             "https://www.nulo.com/",
    "固德":             "https://solidgoldpet.com/",
    "solid gold":       "https://solidgoldpet.com/",
    "瑪瑞克":           "https://www.merrickpetcare.com/",
    "merrick":          "https://www.merrickpetcare.com/",
    "自然均衡":         "https://www.naturalbalanceinc.com/",
    "natural balance":  "https://www.naturalbalanceinc.com/",
    "真特":             "https://zignature.com/",
    "zignature":        "https://zignature.com/",
    "布莉特":           "https://www.brit-petfood.com/",
    "brit":             "https://www.brit-petfood.com/",
    "卡尼洛夫":         "https://carnilove.com/",
    "carnilove":        "https://carnilove.com/",
    "go! solutions":    "https://www.petcurean.com/brand/go-solutions/",
    "now fresh":        "https://www.petcurean.com/brand/now-fresh/",
    "原鮮":             "https://www.petcurean.com/brand/now-fresh/",
    "fromm":            "https://www.frommfamily.com/",
    "法蘭":             "https://www.frommfamily.com/",
    "nutro":            "https://www.nutro.com/",
    "美士":             "https://www.nutro.com/",
    "eukanuba":         "https://www.eukanuba.com/",
    "優卡":             "https://www.eukanuba.com/",
    "iams":             "https://www.iams.com/",
    "耐吉斯":           "https://www.nutrience.com/",
    "nutrience":        "https://www.nutrience.com/",
    "samurai":          "https://www.samuraipetfood.com.tw/",
    "武士":             "https://www.samuraipetfood.com.tw/",
}


def _normalize(s: str) -> str:
    import unicodedata
    return unicodedata.normalize("NFKC", str(s)).strip().lower()


def find_official_url(brand: str, name: str) -> str | None:
    """先查對照表，找不到再 DuckDuckGo 搜官網。"""
    brand_n = _normalize(brand)
    for key, url in BRAND_OFFICIAL.items():
        if key in brand_n:
            return url
    # DDG 搜品牌官方產品頁
    query = f"{brand} {name} 官網 成分"
    return _ddg_first_result(query, exclude_domains=EXCLUDE_ECOMMERCE + PREFERRED_RETAIL)


def find_retail_url(brand: str, name: str) -> str | None:
    """
    用 DuckDuckGo 搜台灣寵物零售店商品頁。
    優先取 PREFERRED_RETAIL 清單內的網域，
    找不到就取任何非電商的貓飼料零售頁。
    """
    name_short = (name.replace("配方", "").replace("全齡貓", "")
                  .replace("成貓", "").replace("幼貓", "")
                  .replace("貓糧", "").strip())
    query = f"{brand} {name_short} 貓 成分 site:*.com.tw OR site:*.com"

    # 第一輪：優先找台灣寵物專門店
    result = _ddg_first_result(
        query,
        exclude_domains=EXCLUDE_ECOMMERCE,
        prefer_domains=PREFERRED_RETAIL,
    )
    if result:
        return result

    # 第二輪：放寬，任何非電商台灣站都接受
    return _ddg_first_result(
        f"{brand} {name_short} 貓 成分表",
        exclude_domains=EXCLUDE_ECOMMERCE,
    )


def _ddg_first_result(
    query: str,
    exclude_domains: list[str] | None = None,
    prefer_domains: list[str] | None = None,
) -> str | None:
    """
    DuckDuckGo HTML 搜尋。
    prefer_domains: 若有符合的域名優先回傳；沒有才回傳第一筆非排除結果。
    """
    exclude_domains = exclude_domains or []
    prefer_domains  = prefer_domains  or []
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.encoding = "utf-8"
        soup = BeautifulSoup(resp.text, "html.parser")
        candidates = []
        for a in soup.select("a.result__url, a.result__a"):
            href = a.get("href", "")
            if not href.startswith("http"):
                continue
            domain = re.sub(r"https?://([^/]+).*", r"\1", href).lower()
            if any(ex in domain for ex in exclude_domains):
                continue
            candidates.append((domain, href))

        # 優先域名
        for domain, href in candidates:
            if any(p in domain for p in prefer_domains):
                return href
        # fallback: 第一個非排除結果
        if candidates:
            return candidates[0][1]

    except Exception as e:
        print(f"    DDG 搜尋失敗：{e}")
    return None


def find_urls(brand: str, name: str, delay: float = 1.5) -> dict:
    """
    回傳 {"official_url": ..., "second_url": ...}
    official_url = 官網（有成分數據優先）
    second_url   = 台灣寵物零售店商品頁（交叉比對用）
    """
    official = find_official_url(brand, name)
    time.sleep(delay)
    retail = find_retail_url(brand, name)
    time.sleep(delay)
    return {"official_url": official, "second_url": retail}
