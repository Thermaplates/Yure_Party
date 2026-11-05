with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_hook = '''                if (this._hp_meter) {
                    this._hp_meter.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;
                    this._hp_meter.y = this._pos_y + Moghunter.ahud_hp_meter_pos_y;
                    this._hp_meter.scale.x = Moghunter.ahud_hp_meter_scale;
                    this._hp_meter.scale.y = Moghunter.ahud_hp_meter_scale;
                }
                if (this._mp_meter) {
                    this._mp_meter.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;
                    this._mp_meter.y = this._pos_y + Moghunter.ahud_mp_meter_pos_y;
                    this._mp_meter.scale.x = Moghunter.ahud_mp_meter_scale;
                    this._mp_meter.scale.y = Moghunter.ahud_mp_meter_scale;
                }
                if (this._tp_meter) {
                    this._tp_meter.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;
                    this._tp_meter.y = this._pos_y + Moghunter.ahud_tp_meter_pos_y;
                    this._tp_meter.scale.x = Moghunter.ahud_tp_meter_scale;
                    this._tp_meter.scale.y = Moghunter.ahud_tp_meter_scale;
                }'''

new_hook = '''                if (this._hp_meter_red) {
                    this._hp_meter_red.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;
                    this._hp_meter_red.y = this._pos_y + Moghunter.ahud_hp_meter_pos_y;
                    this._hp_meter_red.scale.x = Moghunter.ahud_hp_meter_scale;
                    this._hp_meter_red.scale.y = Moghunter.ahud_hp_meter_scale;
                }
                if (this._hp_meter_blue) {
                    this._hp_meter_blue.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;
                    this._hp_meter_blue.y = this._pos_y + Moghunter.ahud_hp_meter_pos_y;
                    this._hp_meter_blue.scale.x = Moghunter.ahud_hp_meter_scale;
                    this._hp_meter_blue.scale.y = Moghunter.ahud_hp_meter_scale;
                }
                if (this._mp_meter_red) {
                    this._mp_meter_red.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;
                    this._mp_meter_red.y = this._pos_y + Moghunter.ahud_mp_meter_pos_y;
                    this._mp_meter_red.scale.x = Moghunter.ahud_mp_meter_scale;
                    this._mp_meter_red.scale.y = Moghunter.ahud_mp_meter_scale;
                }
                if (this._mp_meter_blue) {
                    this._mp_meter_blue.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;
                    this._mp_meter_blue.y = this._pos_y + Moghunter.ahud_mp_meter_pos_y;
                    this._mp_meter_blue.scale.x = Moghunter.ahud_mp_meter_scale;
                    this._mp_meter_blue.scale.y = Moghunter.ahud_mp_meter_scale;
                }
                if (this._tp_meter_red) {
                    this._tp_meter_red.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;
                    this._tp_meter_red.y = this._pos_y + Moghunter.ahud_tp_meter_pos_y;
                    this._tp_meter_red.scale.x = Moghunter.ahud_tp_meter_scale;
                    this._tp_meter_red.scale.y = Moghunter.ahud_tp_meter_scale;
                }
                if (this._tp_meter_blue) {
                    this._tp_meter_blue.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;
                    this._tp_meter_blue.y = this._pos_y + Moghunter.ahud_tp_meter_pos_y;
                    this._tp_meter_blue.scale.x = Moghunter.ahud_tp_meter_scale;
                    this._tp_meter_blue.scale.y = Moghunter.ahud_tp_meter_scale;
                }'''

content = content.replace(old_hook, new_hook)

# Now fix the initial creation scale setup which also used _hp_meter instead of _hp_meter_red etc.
content = content.replace('this._hp_meter.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;\\n\\tthis._hp_meter.scale.x = Moghunter.ahud_hp_meter_scale;\\n\\tthis._hp_meter.scale.y = Moghunter.ahud_hp_meter_scale;', '')
content = content.replace('this._mp_meter.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;\\n\\tthis._mp_meter.scale.x = Moghunter.ahud_mp_meter_scale;\\n\\tthis._mp_meter.scale.y = Moghunter.ahud_mp_meter_scale;', '')
content = content.replace('this._tp_meter.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;\\n\\tthis._tp_meter.scale.x = Moghunter.ahud_tp_meter_scale;\\n\\tthis._tp_meter.scale.y = Moghunter.ahud_tp_meter_scale;', '')

# To inject the scale properly in create_hp_meter etc, we can use regex
import re
content = re.sub(r'(this\._hp_meter_blue\.y = this\._hp_meter_red\.y;)', 
                 r'\1\\n\\tthis._hp_meter_red.scale.x = Moghunter.ahud_hp_meter_scale;\\n\\tthis._hp_meter_red.scale.y = Moghunter.ahud_hp_meter_scale;\\n\\tthis._hp_meter_blue.scale.x = Moghunter.ahud_hp_meter_scale;\\n\\tthis._hp_meter_blue.scale.y = Moghunter.ahud_hp_meter_scale;', content)
content = re.sub(r'(this\._mp_meter_blue\.y = this\._mp_meter_red\.y;)', 
                 r'\1\\n\\tthis._mp_meter_red.scale.x = Moghunter.ahud_mp_meter_scale;\\n\\tthis._mp_meter_red.scale.y = Moghunter.ahud_mp_meter_scale;\\n\\tthis._mp_meter_blue.scale.x = Moghunter.ahud_mp_meter_scale;\\n\\tthis._mp_meter_blue.scale.y = Moghunter.ahud_mp_meter_scale;', content)
content = re.sub(r'(this\._tp_meter_blue\.y = this\._tp_meter_red\.y;)', 
                 r'\1\\n\\tthis._tp_meter_red.scale.x = Moghunter.ahud_tp_meter_scale;\\n\\tthis._tp_meter_red.scale.y = Moghunter.ahud_tp_meter_scale;\\n\\tthis._tp_meter_blue.scale.x = Moghunter.ahud_tp_meter_scale;\\n\\tthis._tp_meter_blue.scale.y = Moghunter.ahud_tp_meter_scale;', content)


with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed F8 hook and creation!')
