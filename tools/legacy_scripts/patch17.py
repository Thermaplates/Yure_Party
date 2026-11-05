import json
import codecs
import re

# 1. READ PARAMS FROM plugins.js
with codecs.open(r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js', 'r', 'utf-8-sig') as f:
    text = f.read()

match = re.search(r'var\s+\$plugins\s*=\s*(\[.*\])\s*;?', text, re.DOTALL)
if match:
    plugins = json.loads(match.group(1))
    current_params = {}
    for p in plugins:
        if p.get('name') == 'Yure_CustomHub':
            current_params = p['parameters']
            break

    # 2. UPDATE DEFAULTS IN Yure_CustomHub.js
    path_hub = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
    with codecs.open(path_hub, 'r', 'utf-8') as f:
        hub_text = f.read()

    def replace_default(match):
        param_name = match.group(1)
        if param_name in current_params and current_params[param_name] != '':
            return f"@param {param_name}\n * @text {match.group(2)}\n * @default {current_params[param_name]}"
        return match.group(0)

    hub_text = re.sub(r'@param\s+([a-zA-Z0-9_]+)\n\s*\*\s*@text\s+(.+?)\n\s*\*\s*@default\s+[^\n]*', replace_default, hub_text)

    new_draw_item = """Window_LeftSlots.prototype.drawItem = function(index) {
        if (!this._actor) return;
        var rect = this.itemRect(index);
        this.changePaintOpacity(this.isEnabled(index));
        var item = this._actor.equips()[index];
        
        var iconBoxWidth = Window_Base._iconWidth + 4;
        var isLongBox = rect.width > 100;
        var nameX = rect.x + iconBoxWidth + 4;
        var nameW = rect.width - iconBoxWidth - 8;
        var textY = rect.y + (rect.height - this.lineHeight()) / 2;

        if (item) {
            this.drawIcon(item.iconIndex, rect.x + 2, rect.y + 2);
            if (isLongBox) {
                this.drawText(item.name, nameX, textY, nameW);
            }
        } else {
            this.drawIcon(16, rect.x + 2, rect.y + 2);
            if (isLongBox) {
                var slotName = this._actor ? $dataSystem.equipTypes[this._actor.equipSlots()[index]] : '';
                this.changeTextColor(this.systemColor());
                this.drawText(slotName, nameX, textY, nameW);
                this.resetTextColor();
            }
        }
        this.changePaintOpacity(true);
    };"""

    new_update_help = """Window_LeftSlots.prototype.updateHelp = function() {
        var item = this.item();
        if (!item) {
            var slotName = this._actor ? $dataSystem.equipTypes[this._actor.equipSlots()[this.index()]] : 'Slot';
            item = {
                name: slotName,
                iconIndex: 16,
                description: "Belum ada equipment yang dipasang di slot ini.",
                params: [0,0,0,0,0,0,0,0],
                isEmptySlot: true
            };
        }
        this.setHelpWindowItem(item);
    };"""

    hub_text = re.sub(
        r'Window_LeftSlots\.prototype\.drawItem = function\(index\) \{.*?this\.changePaintOpacity\(true\);\n\s*\};',
        new_draw_item,
        hub_text,
        flags=re.DOTALL
    )

    hub_text = re.sub(
        r'Window_LeftSlots\.prototype\.updateHelp = function\(\) \{.*?this\.setHelpWindowItem\(this\.item\(\)\);\n\s*\};',
        new_update_help,
        hub_text,
        flags=re.DOTALL
    )

    with codecs.open(path_hub, 'w', 'utf-8') as f:
        f.write(hub_text)

    print('Successfully applied changes to Yure_CustomHub.js!')
else:
    print('Failed to parse plugins.js!')
