import codecs
import re
import os

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read(100)

with codecs.open(r'c:\Users\Fauzi\Documents\Games\Yure Party\patch19.py', 'r', 'utf-8') as f:
    patch_code = f.read()

start = patch_code.find('new_refresh = """') + 17
end = patch_code.find('"""', start)
new_refresh = patch_code[start:end]

with codecs.open(path, 'r', 'utf-8') as f:
    full_text = f.read()

# RECOVER THE TEXT
chunks = full_text.split(new_refresh)
recovered = "".join(chunks)

print("Recovered length:", len(recovered))

# Let's find refresh
idx = recovered.find('Window_FlexHelp.prototype.refresh')
print("Index of refresh:", idx)
if idx != -1:
    print("Around refresh:")
    print(repr(recovered[idx-20:idx+80]))
    
    # We will manually replace the old refresh using regex!
    # Let's find the end of the refresh function.
    # It ends with 'this.contents.fontSize = this.standardFontSize();\n    };'
    import re
    # Match the old refresh function exactly
    pattern = r'Window_FlexHelp\.prototype\.refresh = function\(\) \{.*?this\.contents\.fontSize = this\.standardFontSize\(\);\s*\};'
    
    match = re.search(pattern, recovered, flags=re.DOTALL)
    if match:
        print("Found old refresh! Replacing...")
        final_text = recovered[:match.start()] + new_refresh + recovered[match.end():]
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(final_text)
        print("Done. New size:", len(final_text))
    else:
        print("Regex did not match old refresh!")
