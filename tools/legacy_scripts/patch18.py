import re
import codecs

path_hub = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with codecs.open(path_hub, 'r', 'utf-8') as f:
    hub_text = f.read()

new_refresh = """Window_FlexHelp.prototype.refresh = function() {
        this.contents.clear();
        var item = this._item;
        if (!item) return;

        // Logo & Name
        this.drawIcon(item.iconIndex, 0, 0);
        this.resetTextColor();
        
        // Auto scale name text if it's too long
        this.contents.fontSize = 24;
        var nameW = this.textWidth(item.name);
        var maxNameW = this.contentsWidth() - 40;
        if (nameW > maxNameW && maxNameW > 0) {
            this.contents.fontSize = Math.floor(24 * (maxNameW / nameW));
            if (this.contents.fontSize < 14) this.contents.fontSize = 14;
        }
        this.drawText(item.name, 40, 0, maxNameW);

        // Description with word wrap
        this.contents.fontSize = 20;
        var desc = item.description || '';
        var words = desc.split(' ');
        var line = '';
        var currentY = 36;
        for (var w = 0; w < words.length; w++) {
            var testLine = line + (line ? ' ' : '') + words[w];
            // Strip simple control characters for width measuring
            var cleanLine = testLine.replace(/\\\\C\\[\\d+\\]/gi, '').replace(/\\x1bC\\[\\d+\\]/gi, '');
            if (this.textWidth(cleanLine) > this.contentsWidth() && line !== '') {
                this.drawTextEx(line, 0, currentY);
                line = words[w];
                currentY += this.lineHeight();
            } else {
                line = testLine;
            }
        }
        if (line) {
            this.drawTextEx(line, 0, currentY);
            currentY += this.lineHeight();
        }

        // Stats
        var y = currentY + 8;
        this.contents.fontSize = 18;
        
        if (DataManager.isWeapon(item) || DataManager.isArmor(item) || item.isEmptySlot) {
            var paramNames = [TextManager.param(0), TextManager.param(1), TextManager.param(2), TextManager.param(3), TextManager.param(4), TextManager.param(5), TextManager.param(6), TextManager.param(7)];
            
            // If window is very narrow, use 1 column instead of 2
            var cols = this.contentsWidth() < 250 ? 1 : 2;
            var colWidth = this.contentsWidth() / cols;
            var drawIdx = 0;
            
            for (var i = 0; i < 8; i++) {
                if (item.params[i] !== 0) {
                    var px = (drawIdx % cols) * colWidth;
                    var py = y + Math.floor(drawIdx / cols) * 24;
                    this.changeTextColor(this.systemColor());
                    this.drawText(paramNames[i], px, py, colWidth/2);
                    this.resetTextColor();
                    var sign = item.params[i] > 0 ? '+' : '';
                    this.drawText(sign + item.params[i], px + colWidth/2, py, colWidth/2 - 10, 'right');
                    drawIdx++;
                }
            }
        } else if (DataManager.isSkill(item) || (DataManager.isItem(item) && !item.isEmptySlot)) {
            // Draw MP Cost, TP Cost, etc for skills
            if (item.mpCost > 0) {
                this.changeTextColor(this.mpCostColor());
                this.drawText(TextManager.mpA + " Cost: " + item.mpCost, 0, y, this.contentsWidth());
                y += 24;
            }
            if (item.tpCost > 0) {
                this.changeTextColor(this.tpCostColor());
                this.drawText(TextManager.tpA + " Cost: " + item.tpCost, 0, y, this.contentsWidth());
                y += 24;
            }
        }
        
        this.contents.fontSize = this.standardFontSize();
    };"""

hub_text = re.sub(
    r'Window_FlexHelp\.prototype\.refresh = function\(\) \{.*?this\.contents\.fontSize = this\.standardFontSize\(\);\n\s*\};',
    new_refresh,
    hub_text,
    flags=re.DOTALL
)

with codecs.open(path_hub, 'w', 'utf-8') as f:
    f.write(hub_text)
