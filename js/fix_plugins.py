import json

with open('plugins.js', 'r', encoding='utf-8') as f:
    raw = f.read()

start_idx = raw.find('var $plugins =')
end_idx = raw.rfind(']')

if start_idx == -1 or end_idx == -1:
    print("Cannot find JSON in plugins.js")
    exit(1)

header = raw[:start_idx]
json_part = raw[start_idx+14:end_idx+1].strip()

# parse json
try:
    arr = json.loads(json_part)
except Exception as e:
    print("JSON Parse error:", e)
    exit(1)

# format
out = header + "var $plugins =\n[\n"
for i, item in enumerate(arr):
    # JSON dump single line
    line = json.dumps(item, separators=(',', ':'))
    out += line
    if i < len(arr) - 1:
        out += ",\n"
    else:
        out += "\n"
out += "];"

with open('plugins.js', 'w', encoding='utf-8') as f:
    f.write(out)
print("Done")
