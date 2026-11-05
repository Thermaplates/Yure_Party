import re

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hide Layout.png by commenting out this.create_layout()
content = content.replace('this.create_layout();', '// this.create_layout();')

# 2. Change image names for HP, MP, TP meters
content = content.replace('ImageManager.loadAHud("HP_Meter")', 'ImageManager.loadAHud("Hp_bar")')
content = content.replace('ImageManager.loadAHud("MP_Meter")', 'ImageManager.loadAHud("Mana_bar")')
content = content.replace('ImageManager.loadAHud("TP_Meter")', 'ImageManager.loadAHud("Sanity_bar")')

# 3. Add Scale Parameters to Header
header_add = ''' * @param Layout Overlay Scale
 * @desc Skala untuk Layout Overlay.
 * @default 1.00
 *
 * @param HP Meter Scale
 * @desc Skala untuk HP Meter.
 * @default 1.00
 *
 * @param MP Meter Scale
 * @desc Skala untuk MP Meter.
 * @default 1.00
 *
 * @param TP Meter Scale
 * @desc Skala untuk TP Meter.
 * @default 1.00
 *
'''
# Insert after ' * @param Layout Overlay Y-Axis ... \n * @default ...'
pattern_header = re.compile(r'( \* @param Layout Overlay Y-Axis\n \* @desc[^\n]+\n \* @default[^\n]+\n \*)')
content = pattern_header.sub(r'\1\n' + header_add, content)

# 4. Parse Scale Parameters
parse_add = '''
	Moghunter.ahud_layout2_scale = Number(Moghunter.parameters['Layout Overlay Scale'] || 1.00);
	Moghunter.ahud_hp_meter_scale = Number(Moghunter.parameters['HP Meter Scale'] || 1.00);
	Moghunter.ahud_mp_meter_scale = Number(Moghunter.parameters['MP Meter Scale'] || 1.00);
	Moghunter.ahud_tp_meter_scale = Number(Moghunter.parameters['TP Meter Scale'] || 1.00);
'''
content = content.replace('Moghunter.ahud_layout2_y = Number(Moghunter.parameters[\'Layout Overlay Y-Axis\'] || 0);', 
                          'Moghunter.ahud_layout2_y = Number(Moghunter.parameters[\'Layout Overlay Y-Axis\'] || 0);' + parse_add)

# 5. Inject F8 Live Update logic into Actor_Hud.prototype.update
update_hook = '''
    // [LIVE DEV F8] Auto-Update for HUD positions and scales
    var p = PluginManager.parameters('MOG_ActorHud');
    if (p) {
        var hash = JSON.stringify(p);
        if (this._lastParamHash !== hash) {
            this._lastParamHash = hash;
            if (p['Layout Overlay X-Axis'] !== undefined) {
                Moghunter.ahud_layout2_x = Number(p['Layout Overlay X-Axis'] || 0);
                Moghunter.ahud_layout2_y = Number(p['Layout Overlay Y-Axis'] || 0);
                Moghunter.ahud_layout2_scale = Number(p['Layout Overlay Scale'] || 1.00);
                
                Moghunter.ahud_hp_meter_pos_x = Number(p['HP Meter X-Axis'] || 143);
                Moghunter.ahud_hp_meter_pos_y = Number(p['HP Meter Y-Axis'] || 85);
                Moghunter.ahud_hp_meter_scale = Number(p['HP Meter Scale'] || 1.00);
                
                Moghunter.ahud_mp_meter_pos_x = Number(p['MP Meter X-Axis'] || 160);
                Moghunter.ahud_mp_meter_pos_y = Number(p['MP Meter Y-Axis'] || 115);
                Moghunter.ahud_mp_meter_scale = Number(p['MP Meter Scale'] || 1.00);
                
                Moghunter.ahud_tp_meter_pos_x = Number(p['TP Meter X-Axis'] || 143);
                Moghunter.ahud_tp_meter_pos_y = Number(p['TP Meter Y-Axis'] || 145);
                Moghunter.ahud_tp_meter_scale = Number(p['TP Meter Scale'] || 1.00);
                
                if (this._layout2) {
                    this._layout2.x = this._pos_x + Moghunter.ahud_layout2_x;
                    this._layout2.y = this._pos_y + Moghunter.ahud_layout2_y;
                    this._layout2.scale.x = Moghunter.ahud_layout2_scale;
                    this._layout2.scale.y = Moghunter.ahud_layout2_scale;
                }
                if (this._hp_meter) {
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
                }
            }
        }
    }
'''
content = content.replace('Actor_Hud.prototype.update = function() {\\n    Sprite.prototype.update.call(this);', 
                          'Actor_Hud.prototype.update = function() {\\n    Sprite.prototype.update.call(this);' + update_hook)

# Apply scale during initial creation as well
content = content.replace('this._layout2.x = this._pos_x + Moghunter.ahud_layout2_x;', 
                          'this._layout2.x = this._pos_x + Moghunter.ahud_layout2_x;\\n\\tthis._layout2.scale.x = Moghunter.ahud_layout2_scale;\\n\\tthis._layout2.scale.y = Moghunter.ahud_layout2_scale;')
content = content.replace('this._hp_meter.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;',
                          'this._hp_meter.x = this._pos_x + Moghunter.ahud_hp_meter_pos_x;\\n\\tthis._hp_meter.scale.x = Moghunter.ahud_hp_meter_scale;\\n\\tthis._hp_meter.scale.y = Moghunter.ahud_hp_meter_scale;')
content = content.replace('this._mp_meter.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;',
                          'this._mp_meter.x = this._pos_x + Moghunter.ahud_mp_meter_pos_x;\\n\\tthis._mp_meter.scale.x = Moghunter.ahud_mp_meter_scale;\\n\\tthis._mp_meter.scale.y = Moghunter.ahud_mp_meter_scale;')
content = content.replace('this._tp_meter.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;',
                          'this._tp_meter.x = this._pos_x + Moghunter.ahud_tp_meter_pos_x;\\n\\tthis._tp_meter.scale.x = Moghunter.ahud_tp_meter_scale;\\n\\tthis._tp_meter.scale.y = Moghunter.ahud_tp_meter_scale;')

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Injection complete!')
