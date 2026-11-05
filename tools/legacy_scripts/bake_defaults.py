import json
import os
import re

def main():
    plugins_path = os.path.join('js', 'plugins.js')
    if not os.path.exists(plugins_path):
        print("plugins.js not found!")
        return

    with open(plugins_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON part
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    if start_idx == -1 or end_idx == -1:
        print("Could not find JSON array in plugins.js")
        return

    json_text = content[start_idx:end_idx+1]
    try:
        plugins = json.loads(json_text)
    except Exception as e:
        print("Error parsing JSON:", e)
        return

    for plugin in plugins:
        plugin_name = plugin.get('name')
        if not plugin_name: continue
        
        params = plugin.get('parameters', {})
        if not params: continue

        js_path = os.path.join('js', 'plugins', f"{plugin_name}.js")
        if not os.path.exists(js_path):
            continue
            
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()

        modified = False
        for key, val in params.items():
            if val is None or val == "": continue
            
            safe_key = re.escape(key)
            
            pattern1 = r"(parameters\['" + safe_key + r"'\]\s*\|\|\s*)([^\);,\n\}]+)"
            pattern2 = r'(parameters\["' + safe_key + r'"\]\s*\|\|\s*)([^\);,\n\}]+)'
            
            def replacer(match):
                p1 = match.group(1)
                p2 = match.group(2).strip()
                new_val = val
                if p2.startswith("'") or p2.startswith('"'):
                    quote = p2[0]
                    new_val = f"{quote}{val}{quote}"
                elif p2.lower() in ('true', 'false'):
                    new_val = str(val).lower()
                else:
                    # check if val is a number
                    try:
                        float(val)
                        new_val = str(val)
                    except ValueError:
                        new_val = f"'{val}'"
                return p1 + new_val

            new_content, count1 = re.subn(pattern1, replacer, js_content)
            if count1 > 0: modified = True
            js_content = new_content
            
            new_content, count2 = re.subn(pattern2, replacer, js_content)
            if count2 > 0: modified = True
            js_content = new_content
            
        if modified:
            with open(js_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            print(f"Baked defaults into {plugin_name}.js")

if __name__ == '__main__':
    main()
