import codecs, re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(path, 'r', 'utf-8-sig') as f:
    text = f.read()

idx = text.find('"Yure_CustomHub"')
param_start = text.find('"parameters":{', idx)
param_end = text.find('}}', param_start) + 2
old_params = text[param_start:param_end]

print("BEFORE:")
for m in re.findall(r'"Help [^"]+":"[^"]*"', old_params):
    print(' ', m)

# Layar = 1280x720. Panel kanan cyclops mulai sekitar x=520
# Help window: tepat di kanan cyclops, tinggi hampir full
new_params = old_params
new_params = re.sub(r'"Help X":"[^"]*"', '"Help X":"510"', new_params)
new_params = re.sub(r'"Help Y":"[^"]*"', '"Help Y":"10"', new_params)
new_params = re.sub(r'"Help W":"[^"]*"', '"Help W":"460"', new_params)  # 1280-510-310(status) = lebar panel kanan
new_params = re.sub(r'"Help H":"[^"]*"', '"Help H":"700"', new_params)  # hampir full height 720

new_text = text[:param_start] + new_params + text[param_end:]
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(new_text)

print("\nAFTER:")
for m in re.findall(r'"Help [^"]+":"[^"]*"', new_params):
    print(' ', m)
print("Done!")
