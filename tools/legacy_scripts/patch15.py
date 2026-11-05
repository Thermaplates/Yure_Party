import json

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\data\System.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ensure there are 8 valid slots (index 1 to 8)
while len(data['equipTypes']) < 9:
    data['equipTypes'].append('Accessory')

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))

print('Updated equipTypes to 8 slots!')
