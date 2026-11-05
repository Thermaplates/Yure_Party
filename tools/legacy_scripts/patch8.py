import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace itemRect to support up to 8 slots
start = text.find('Window_LeftSlots.prototype.itemRect')
end = text.find('};', start) + 2
old_func = text[start:end]

new_func = """Window_LeftSlots.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var i = index + 1;
        
        // Defaults for up to 8 slots
        // Index 0: Souls (Center Gray)
        // Index 1: Anchor (Above Cyclops)
        // Index 2: Seal (Top-Left)
        // Index 3: Spirit Catalyst (Top-Right)
        // Index 4: Accessory (Bottom-Left)
        // Index 5: Accessory (Bottom-Right)
        var defaultX = [130, 20, 35, 225, 35, 225, 130, 130];
        var defaultY = [510, 20, 420, 420, 600, 600, 300, 300];
        var defaultW = [60, 280, 60, 60, 60, 60, 60, 60];
        
        var defX = defaultX[index] !== undefined ? defaultX[index] : 0;
        var defY = defaultY[index] !== undefined ? defaultY[index] : 0;
        var defW = defaultW[index] !== undefined ? defaultW[index] : 60;
        
        rect.x = getHubParam('ui_slot' + i + '_x', 'Slot ' + i + ' X', defX);
        rect.y = getHubParam('ui_slot' + i + '_y', 'Slot ' + i + ' Y', defY);
        rect.width = getHubParam('ui_slot' + i + '_w', 'Slot ' + i + ' W', defW);
        rect.height = getHubParam('ui_slot' + i + '_h', 'Slot ' + i + ' H', 60);
        return rect;
    };"""
text = text.replace(old_func, new_func)

# Replace drawItem to support drawing Name if width > 100
start2 = text.find('Window_LeftSlots.prototype.drawItem')
end2 = text.find('};', start2) + 2
old_func2 = text[start2:end2]

new_func2 = """Window_LeftSlots.prototype.drawItem = function(index) {
        if (!this._actor) return;
        var item = this._actor.equips()[index];
        var rect = this.itemRect(index);
        
        if (item) {
            // Center icon vertically
            var iy = rect.y + (rect.height - Window_Base._iconHeight) / 2;
            
            if (rect.width > 100) {
                // Wide slot: Icon on left, name on right
                var ix = rect.x + 14; 
                this.drawIcon(item.iconIndex, ix, iy);
                
                this.resetTextColor();
                // Draw text starting at +90 from rect.x
                this.drawText(item.name, rect.x + 90, rect.y + (rect.height - this.lineHeight())/2, rect.width - 90, 'left');
            } else {
                // Normal square slot: Center icon horizontally
                var ix = rect.x + (rect.width - Window_Base._iconWidth) / 2;
                this.drawIcon(item.iconIndex, ix, iy);
            }
        }
    };"""
text = text.replace(old_func2, new_func2)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated LeftSlots for 8 slots and custom Name display!')
