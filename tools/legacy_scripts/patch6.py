import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Turn debug borders back on in makeTransparentHub
text = re.sub(r'this\.opacity\s*=\s*0;', 'this.opacity = 255;', text)
text = re.sub(r'this\.backOpacity\s*=\s*0;', 'this.backOpacity = 150;', text)

# But force Window_LeftSlots to be invisible so it doesn't cover the cyclops!
old_left_slots_init = """Window_LeftSlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this._actor = null;
    };"""

new_left_slots_init = """Window_LeftSlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this.opacity = 0;
        this.backOpacity = 0;
        this._actor = null;
    };"""

text = text.replace(old_left_slots_init, new_left_slots_init)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Patched successfully!')
