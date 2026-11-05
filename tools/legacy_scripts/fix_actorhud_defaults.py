import json
import re

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('[')
end_idx = content.rfind(']') + 1
plugins = json.loads(content[start_idx:end_idx])

hud_params = None
for p in plugins:
    if p['name'] == 'MOG_ActorHud':
        hud_params = p['parameters']
        break

if not hud_params:
    print('MOG_ActorHud not found in plugins.js')
    exit(1)

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace defaults in header
def repl(m):
    param_name = m.group(1).strip()
    if param_name in hud_params:
        new_val = hud_params[param_name]
        return f"@param {param_name}\n * @desc{m.group(2)}\n * @default {new_val}"
    return m.group(0)

# Matches @param Name \n * @desc ... \n * @default ...
pattern = re.compile(r"@param ([^\n]+)\n \* @desc([^\n]+)\n \* @default[^\n]*")
new_js_content = pattern.sub(repl, js_content)

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'w', encoding='utf-8') as f:
    f.write(new_js_content)

print('MOG_ActorHud defaults updated!')
