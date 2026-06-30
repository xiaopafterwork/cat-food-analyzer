import json

with open('data/raw/purrmaster_20260629_1518.json', encoding='utf-8') as f:
    foods = json.load(f)

targets = ['Hill', 'Royal', 'Purina', 'PURINA']
for food in foods:
    brand = food.get('brand', '')
    if any(t in brand for t in targets):
        name = food.get('name', '')[:28]
        p = food.get('protein_dm_pct')
        c = food.get('carb_dm_pct')
        fat = food.get('fat_dm_pct')
        ash = food.get('ash_dm_pct')
        print(f"{brand[:20]:20} | {name:28} | P={p} C={c} F={fat} Ash={ash}")
