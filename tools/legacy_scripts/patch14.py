import sys

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('Math.min(this._actor.equipSlots().length, 5)', 'Math.min(this._actor.equipSlots().length, 8)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated maxItems limit to 8!')
