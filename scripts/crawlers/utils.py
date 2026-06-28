import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
}


def get_html(url: str, timeout: int = 15) -> BeautifulSoup | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"  ⚠️  抓取失敗 {url}：{e}")
        return None


def parse_float(text: str) -> float | None:
    """從字串中提取第一個數字"""
    m = re.search(r"(\d+\.?\d*)", text)
    return float(m.group(1)) if m else None


def parse_nutrition_table(soup: BeautifulSoup) -> dict:
    """
    從頁面中找營養成分數值。
    支援表格形式或純文字形式。
    """
    result = {
        "protein_pct": None,
        "fat_pct": None,
        "fiber_pct": None,
        "moisture_pct": None,
        "ash_pct": None,
    }

    text = soup.get_text()

    patterns = {
        "protein_pct": r"粗蛋白質?\s*[：:≥≦]?\s*(\d+\.?\d*)\s*%",
        "fat_pct":     r"粗脂肪\s*[：:≥≦]?\s*(\d+\.?\d*)\s*%",
        "fiber_pct":   r"粗纖維\s*[：:≥≦]?\s*(\d+\.?\d*)\s*%",
        "moisture_pct":r"水分\s*[：:≥≦]?\s*(\d+\.?\d*)\s*%",
        "ash_pct":     r"粗灰分\s*[：:≥≦]?\s*(\d+\.?\d*)\s*%",
    }

    for key, pattern in patterns.items():
        m = re.search(pattern, text)
        if m:
            result[key] = float(m.group(1))

    return result


def parse_life_stage(text: str) -> str:
    text = text.lower()
    if any(k in text for k in ["幼貓", "kitten", "k36", "k28"]):
        return "kitten"
    if any(k in text for k in ["熟齡", "老貓", "senior", "7歲", "7+"]):
        return "senior"
    return "adult"


def parse_food_type(text: str) -> str:
    text = text.lower()
    if any(k in text for k in ["濕食", "罐頭", "肉泥", "湯包", "wet", "pouch"]):
        return "wet"
    return "dry"


def parse_ingredients(soup: BeautifulSoup) -> str | None:
    """嘗試從頁面找成分列表字串"""
    text = soup.get_text()
    m = re.search(r"成分[：:]\s*(.{10,300}?)(?:\n|。|保證|分析)", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return None
