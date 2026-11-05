import codecs, re, json

# 1. Baca semua parameter dari plugins.js
ppath = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(ppath, 'r', 'utf-8-sig') as f:
    ptext = f.read()

# Ekstrak json array-nya
match = re.search(r'var\s+\$plugins\s*=\s*(\[.*\])\s*;?', ptext, re.DOTALL)
if not match:
    print("Gagal parse plugins.js!")
    exit()

plugins_data = json.loads(match.group(1))

# Temukan CustomHub
current_params = None
for p in plugins_data:
    if 'Yure_CustomHub' in str(p.get('name', '')):
        current_params = p.get('parameters', {})
        break

if not current_params:
    print("Tidak ketemu Yure_CustomHub di plugins.js!")
    exit()

print("Current parameters dari plugins.js:")
for k, v in current_params.items():
    if v and not k.startswith('---'):
        print(f'  "{k}": "{v}"')

# 2. Baca Yure_CustomHub.js
hpath = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with codecs.open(hpath, 'r', 'utf-8') as f:
    hub_text = f.read()

# 3. Update @default values berdasarkan label (@text)
updated_count = 0
def replace_default(match):
    global updated_count
    text_label = match.group(1).strip()
    old_default = match.group(2)
    
    # Cari di current_params dengan label ini
    if text_label in current_params and current_params[text_label] != '':
        new_val = current_params[text_label]
        if old_default.strip() != new_val.strip():
            print(f'  Updating "{text_label}": "{old_default}" -> "{new_val}"')
            updated_count += 1
            return f'@text {text_label}\r\n * @type number\r\n * @default {new_val}'
    return match.group(0)

# Pattern: @text LABEL\n * @type number\n * @default VALUE
pattern = r'@text (.*?)\r?\n\s*\*\s*@type number\r?\n\s*\*\s*@default\s*(.*?)(?:\r?\n)'

print("\nUpdating @default values...")
new_hub = re.sub(pattern, replace_default, hub_text)

# Also update the hardcoded fallback values at the bottom of the file
print("\nUpdating hardcoded fallbacks...")
# For Help Window
new_hub = re.sub(r'var hX = getHubParam\(\'ui_help_x\', \'Help X\', \d+\);', f'var hX = getHubParam(\'ui_help_x\', \'Help X\', {current_params.get("Help X", "510")});', new_hub)
new_hub = re.sub(r'var hY = getHubParam\(\'ui_help_y\', \'Help Y\', \d+\);', f'var hY = getHubParam(\'ui_help_y\', \'Help Y\', {current_params.get("Help Y", "10")});', new_hub)
new_hub = re.sub(r'var hW = Math\.min\(Math\.max\(getHubParam\(\'ui_help_w\', \'Help W\', \d+\), 10\), 4000\);', f'var hW = Math.min(Math.max(getHubParam(\'ui_help_w\', \'Help W\', {current_params.get("Help W", "460")}), 10), 4000);', new_hub)
new_hub = re.sub(r'var hH = Math\.min\(Math\.max\(getHubParam\(\'ui_help_h\', \'Help H\', \d+\), 10\), 4000\);', f'var hH = Math.min(Math.max(getHubParam(\'ui_help_h\', \'Help H\', {current_params.get("Help H", "700")}), 10), 4000);', new_hub)


with codecs.open(hpath, 'w', 'utf-8') as f:
    f.write(new_hub)

print(f"\nDone! Updated {updated_count} defaults in header.")
