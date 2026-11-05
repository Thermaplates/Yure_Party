import codecs
import re
import os

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read(100) # Only read a small part first to verify

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
            // Simple check without control chars
            var cleanLine = testLine.replace(/\\x1bC\\[\\d+\\]/gi, '');
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

print("File size:", os.path.getsize(path))

if text.startswith(new_refresh):
    print("YES IT IS CORRUPTED!")
    # Read the whole file
    with codecs.open(path, 'r', 'utf-8') as f:
        full_text = f.read()
    
    # We just need to split by new_refresh and join!
    res = ''.join(full_text.split(new_refresh))
    
    # But wait! We DO want to put ONE new_refresh where the OLD refresh was!
    # Let's check where the old refresh was! We can't, it was deleted!
    # Wait, the old refresh was NEVER deleted, because old_refresh was '' !
    # That means the old refresh is STILL IN THE FILE!
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(res)
    print("Saved recovered file!")
else:
    print("Not corrupted??")
