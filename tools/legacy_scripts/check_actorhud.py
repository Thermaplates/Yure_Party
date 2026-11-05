import json
with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('[')
end_idx = content.rfind(']') + 1

plugins = json.loads(content[start_idx:end_idx])

for p in plugins:
    if 'ActorHud' in p['name']:
        print(f"Plugin: {p['name']}")
        for k, v in p['parameters'].items():
            print(f"{k}: {v}")
