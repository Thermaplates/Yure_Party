import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace itemRect with proper getHubParam calls
start = text.find('Window_LeftSlots.prototype.itemRect')
end = text.find('};', start) + 2

old_func = text[start:end]
new_func = """Window_LeftSlots.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var i = index + 1;
        var defaultX = [35, 225, 130, 35, 225];
        var defaultY = [420, 420, 510, 600, 600];
        
        rect.x = getHubParam('ui_slot' + i + '_x', 'Slot ' + i + ' X', defaultX[index]);
        rect.y = getHubParam('ui_slot' + i + '_y', 'Slot ' + i + ' Y', defaultY[index]);
        rect.width = getHubParam('ui_slot' + i + '_w', 'Slot ' + i + ' W', 60);
        rect.height = getHubParam('ui_slot' + i + '_h', 'Slot ' + i + ' H', 60);
        return rect;
    };"""

text = text.replace(old_func, new_func)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed itemRect!')
