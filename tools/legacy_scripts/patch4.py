import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Turn off debug mode
text = re.sub(r'this\.opacity\s*=\s*255;', 'this.opacity = 0;', text)
text = re.sub(r'this\.backOpacity\s*=\s*150;', 'this.backOpacity = 0;', text)

replacements = {
    'ui_eqlist_x': ("'ui_eqlist_x', 'Equip List X', 20", "20"),
    'ui_eqlist_y': ("'ui_eqlist_y', 'Equip List Y', 20", "20"),
    'ui_eqlist_w': ("'ui_eqlist_w', 'Equip List W', 320", "320"),
    'ui_eqlist_h': ("'ui_eqlist_h', 'Equip List H', 680", "680"),
    
    'ui_eqslots_x': ("'ui_eqslots_x', 'Equip Slots X', 20", "20"),
    'ui_eqslots_y': ("'ui_eqslots_y', 'Equip Slots Y', 20", "20"),
    'ui_eqslots_w': ("'ui_eqslots_w', 'Equip Slots W', 320", "320"),
    'ui_eqslots_h': ("'ui_eqslots_h', 'Equip Slots H', 680", "680"),
    
    'ui_slot1_x': ("'ui_slot1_x', 'Slot 1 X', 35", "35"),
    'ui_slot1_y': ("'ui_slot1_y', 'Slot 1 Y', 420", "420"),
    
    'ui_slot2_x': ("'ui_slot2_x', 'Slot 2 X', 225", "225"),
    'ui_slot2_y': ("'ui_slot2_y', 'Slot 2 Y', 420", "420"),
    
    'ui_slot3_x': ("'ui_slot3_x', 'Slot 3 X', 130", "130"),
    'ui_slot3_y': ("'ui_slot3_y', 'Slot 3 Y', 510", "510"),
    
    'ui_slot4_x': ("'ui_slot4_x', 'Slot 4 X', 35", "35"),
    'ui_slot4_y': ("'ui_slot4_y', 'Slot 4 Y', 600", "600"),
    
    'ui_slot5_x': ("'ui_slot5_x', 'Slot 5 X', 225", "225"),
    'ui_slot5_y': ("'ui_slot5_y', 'Slot 5 Y', 600", "600"),
}

for key, val in replacements.items():
    pattern = r'getHubParam\(\'' + key + r'\',\s*\'[^\']+\',\s*\d+\)'
    text = re.sub(pattern, f"getHubParam({val[0]})", text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Patched correctly!')
