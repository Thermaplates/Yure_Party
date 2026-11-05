import json
import codecs
import re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(path, 'r', 'utf-8-sig') as f:
    text = f.read()

# Match the json part
match = re.search(r'var\s+\$plugins\s*=\s*(\[.*\])\s*;?', text, re.DOTALL)
if match:
    json_text = match.group(1)
    plugins = json.loads(json_text)
    
    modified = False
    for p in plugins:
        if p.get('name') == 'Yure_CustomHub':
            for i in range(6, 9):
                key_x = f'ui_slot{i}_x'
                if key_x not in p['parameters']:
                    p['parameters'][f'ui_slot{i}_x'] = ''
                    p['parameters'][f'ui_slot{i}_y'] = ''
                    p['parameters'][f'ui_slot{i}_w'] = ''
                    p['parameters'][f'ui_slot{i}_h'] = ''
                    modified = True
            break
            
    if modified:
        new_json = json.dumps(plugins, indent=4, ensure_ascii=False)
        new_text = 'var $plugins =\n' + new_json + ';\n'
        with codecs.open(path, 'w', 'utf-8-sig') as f:
            f.write(new_text)
        print('Injected missing parameters into plugins.js!')
    else:
        print('Parameters were already there.')
else:
    print('Failed to parse plugins.js JSON!')
