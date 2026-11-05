import json

with open(r'c:\Users\Fauzi\Documents\Games\Yure Party\data\Classes.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for c in data:
    if c and 'note' in c:
        print(f"Class {c['id']}: {c['name']}")
        print(c['note'])
        print('---')
