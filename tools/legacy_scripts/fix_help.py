import codecs, re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(path, 'r', 'utf-8-sig') as f:
    text = f.read()

idx = text.find('"Yure_CustomHub"')
if idx == -1:
    print("Not found!")
    exit()

# Find the parameters object for Yure_CustomHub
# Get the section from idx until the closing }}
param_start = text.find('"parameters":{', idx)
param_end = text.find('}}', param_start) + 2

old_params = text[param_start:param_end]
print("Old Help params:")
import re
for m in re.findall(r'"Help [^"]+":"[^"]*"', old_params):
    print(' ', m)

# Update Help Window values to fit inside 816x624 screen, right of cyclops
new_params = old_params
new_params = re.sub(r'"Help X":"[^"]*"', '"Help X":"510"', new_params)
new_params = re.sub(r'"Help Y":"[^"]*"', '"Help Y":"10"', new_params)
new_params = re.sub(r'"Help W":"[^"]*"', '"Help W":"290"', new_params)
new_params = re.sub(r'"Help H":"[^"]*"', '"Help H":"600"', new_params)

new_text = text[:param_start] + new_params + text[param_end:]
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(new_text)

print("Done! New Help params:")
updated = new_params
for m in re.findall(r'"Help [^"]+":"[^"]*"', updated):
    print(' ', m)
