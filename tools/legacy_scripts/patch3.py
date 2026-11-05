import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    'ui_eqlist_x': ("'ui_eqlist_x', 'Equip List X', 670", "670"),
    'ui_eqlist_y': ("'ui_eqlist_y', 'Equip List Y', 10", "10"),
    'ui_eqlist_w': ("'ui_eqlist_w', 'Equip List W', 300", "300"),
    'ui_eqlist_h': ("'ui_eqlist_h', 'Equip List H', 690", "690"),
    
    'ui_eqslots_x': ("'ui_eqslots_x', 'Equip Slots X', 20", "20"),
    'ui_eqslots_y': ("'ui_eqslots_y', 'Equip Slots Y', 20", "20"),
    'ui_eqslots_w': ("'ui_eqslots_w', 'Equip Slots W', 320", "320"),
    'ui_eqslots_h': ("'ui_eqslots_h', 'Equip Slots H', 680", "680"),
    
    'ui_slot1_x': ("'ui_slot1_x', 'Slot 1 X', 80", "80"),
    'ui_slot1_y': ("'ui_slot1_y', 'Slot 1 Y', 400", "400"),
    'ui_slot2_x': ("'ui_slot2_x', 'Slot 2 X', 180", "180"),
    'ui_slot2_y': ("'ui_slot2_y', 'Slot 2 Y', 400", "400"),
    'ui_slot3_x': ("'ui_slot3_x', 'Slot 3 X', 130", "130"),
    'ui_slot3_y': ("'ui_slot3_y', 'Slot 3 Y', 480", "480"),
    'ui_slot4_x': ("'ui_slot4_x', 'Slot 4 X', 80", "80"),
    'ui_slot4_y': ("'ui_slot4_y', 'Slot 4 Y', 560", "560"),
    'ui_slot5_x': ("'ui_slot5_x', 'Slot 5 X', 180", "180"),
    'ui_slot5_y': ("'ui_slot5_y', 'Slot 5 Y', 560", "560"),
}

new_text = text
for key, val in replacements.items():
    pattern = r'getHubParam\(\'' + key + r'\',\s*\'[^\']+\',\s*\d+\)'
    new_text = re.sub(pattern, f"getHubParam({val[0]})", new_text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Patched correctly!')
