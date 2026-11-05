import sys

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

new_code = """
    Window_FlexHelp.prototype.setItem = function(item) {
        this._item = item;
        this.refresh();
    };

    Window_FlexHelp.prototype.refresh = function() {
        this.contents.clear();
        var item = this._item;
        if (!item) return;

        // Logo & Name
        this.drawIcon(item.iconIndex, 0, 0);
        this.resetTextColor();
        this.contents.fontSize = 28;
        this.drawText(item.name, 40, 0, this.contentsWidth() - 40);

        // Description
        this.contents.fontSize = 20;
        this.drawTextEx(item.description, 0, 36);

        // Stats
        var y = 36 + this.lineHeight() * 2;
        this.contents.fontSize = 18;
        
        if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
            var paramNames = [TextManager.param(0), TextManager.param(1), TextManager.param(2), TextManager.param(3), TextManager.param(4), TextManager.param(5), TextManager.param(6), TextManager.param(7)];
            var cols = 2;
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
        } else if (DataManager.isSkill(item) || DataManager.isItem(item)) {
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
    };
"""

# Insert right after Window_FlexHelp.prototype.initialize
start = text.find('Window_FlexHelp.prototype.initialize = function')
end = text.find('};', start) + 2
if "Window_FlexHelp.prototype.setItem = function" not in text:
    text = text[:end] + "\n" + new_code + text[end:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Injected custom Help Window drawing logic!")
else:
    print("Already injected.")
