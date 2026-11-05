import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Change Equip List X default back to 670
text = re.sub(r"'ui_eqlist_x',\s*'Equip List X',\s*\d+", "'ui_eqlist_x', 'Equip List X', 670", text)

# Add Equip Layout X and Y if not exists
if 'ui_eqlayout_x' not in text:
    # Find the _equipLayoutSprite creation
    start = text.find('this._equipLayoutSprite.bitmap = ImageManager.loadYureStatus(eqp);')
    if start != -1:
        insert_idx = text.find(';', start) + 1
        injection = "\n        this._equipLayoutSprite.x = getHubParam('ui_eqlayout_x', 'Equip Layout X', 670);\n        this._equipLayoutSprite.y = getHubParam('ui_eqlayout_y', 'Equip Layout Y', 0);"
        text = text[:insert_idx] + injection + text[insert_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Patched custom layout sprite position and restored equip list x to 670!')
