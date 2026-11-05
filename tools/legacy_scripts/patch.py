import sys, re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

insert_str = "var parameters = PluginManager.parameters('Yure_CustomHub');\n"
insert_idx = text.find(insert_str)
insert_idx += len(insert_str)

helper_func = """
function getHubParam(id, label, def) {
    if (parameters[id] !== undefined && parameters[id] !== '') return Number(parameters[id]);
    if (parameters[label] !== undefined && parameters[label] !== '') return Number(parameters[label]);
    return def;
}
"""

new_text = text[:insert_idx] + helper_func + text[insert_idx:]

replacements = {
    'ui_help_x': ("'ui_help_x', 'Help X', 890", "890"),
    'ui_help_y': ("'ui_help_y', 'Help Y', 20", "20"),
    'ui_help_w': ("'ui_help_w', 'Help W', 370", "370"),
    'ui_help_h': ("'ui_help_h', 'Help H', 280", "280"),
    'ui_status_x': ("'ui_status_x', 'Status X', 400", "400"),
    'ui_status_y': ("'ui_status_y', 'Status Y', 20", "20"),
    'ui_status_w': ("'ui_status_w', 'Status W', 470", "470"),
    'ui_status_h': ("'ui_status_h', 'Status H', 680", "680"),
    'ui_skill_x': ("'ui_skill_x', 'Skill X', 890", "890"),
    'ui_skill_y': ("'ui_skill_y', 'Skill Y', 310", "310"),
    'ui_skill_w': ("'ui_skill_w', 'Skill W', 370", "370"),
    'ui_skill_h': ("'ui_skill_h', 'Skill H', 390", "390"),
    'ui_eqlist_x': ("'ui_eqlist_x', 'Equip List X', 890", "890"),
    'ui_eqlist_y': ("'ui_eqlist_y', 'Equip List Y', 310", "310"),
    'ui_eqlist_w': ("'ui_eqlist_w', 'Equip List W', 370", "370"),
    'ui_eqlist_h': ("'ui_eqlist_h', 'Equip List H', 390", "390"),
    'ui_eqslots_x': ("'ui_eqslots_x', 'Equip Slots X', 20", "20"),
    'ui_eqslots_y': ("'ui_eqslots_y', 'Equip Slots Y', 20", "20"),
    'ui_eqslots_w': ("'ui_eqslots_w', 'Equip Slots W', 360", "360"),
    'ui_eqslots_h': ("'ui_eqslots_h', 'Equip Slots H', 680", "680"),
    
    'ui_slot1_x': ("'ui_slot1_x', 'Slot 1 X', 60", "60"),
    'ui_slot1_y': ("'ui_slot1_y', 'Slot 1 Y', 380", "380"),
    'ui_slot2_x': ("'ui_slot2_x', 'Slot 2 X', 240", "240"),
    'ui_slot2_y': ("'ui_slot2_y', 'Slot 2 Y', 380", "380"),
    'ui_slot3_x': ("'ui_slot3_x', 'Slot 3 X', 150", "150"),
    'ui_slot3_y': ("'ui_slot3_y', 'Slot 3 Y', 450", "450"),
    'ui_slot4_x': ("'ui_slot4_x', 'Slot 4 X', 60", "60"),
    'ui_slot4_y': ("'ui_slot4_y', 'Slot 4 Y', 520", "520"),
    'ui_slot5_x': ("'ui_slot5_x', 'Slot 5 X', 240", "240"),
    'ui_slot5_y': ("'ui_slot5_y', 'Slot 5 Y', 520", "520"),
    
    'ui_name_x': ("'ui_name_x', 'Status Name X', 30", "30"),
    'ui_name_y': ("'ui_name_y', 'Status Name Y', 60", "60"),
    'ui_hp_x': ("'ui_hp_x', 'Status HP X', 30", "30"),
    'ui_hp_y': ("'ui_hp_y', 'Status HP Y', 100", "100"),
    'ui_mp_x': ("'ui_mp_x', 'Status MP X', 30", "30"),
    'ui_mp_y': ("'ui_mp_y', 'Status MP Y', 140", "140"),
    'ui_tp_x': ("'ui_tp_x', 'Status TP X', 30", "30"),
    'ui_tp_y': ("'ui_tp_y', 'Status TP Y', 180", "180"),
    'ui_param_x': ("'ui_param_x', 'Status Param Start X', 30", "30"),
    'ui_param_y': ("'ui_param_y', 'Status Param Start Y', 250", "250"),
    'ui_param_space': ("'ui_param_space', 'Status Param Y Spacing', 35", "35"),
    'ui_bust_x': ("'ui_bust_x', 'Bust Image X', 180", "180"),
    'ui_bust_y': ("'ui_bust_y', 'Bust Image Y', 60", "60"),
}

for key, val in replacements.items():
    pattern = r'Number\(parameters\[\'' + key + r'\'\]\s*\|\|[^\)]+\)'
    new_text = re.sub(pattern, f"getHubParam({val[0]})", new_text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Patched successfully!')
