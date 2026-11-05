import codecs, re

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins.js'
with codecs.open(path, 'r', 'utf-8-sig') as f:
    text = f.read()

# Update Slot 2 parameters
text = re.sub(r'"Slot 2 X":"\d+"', '"Slot 2 X":"20"', text)
text = re.sub(r'"Slot 2 Y":"\d+"', '"Slot 2 Y":"20"', text)
text = re.sub(r'"Slot 2 W":"\d+"', '"Slot 2 W":"280"', text)
text = re.sub(r'"Slot 2 H":"\d+"', '"Slot 2 H":"60"', text)

with codecs.open(path, 'w', 'utf-8-sig') as f:
    f.write(text)

print("Slot 2 updated in plugins.js")
