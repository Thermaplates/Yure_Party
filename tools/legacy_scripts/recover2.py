import codecs

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read(100) # Check first 100

with codecs.open(r'c:\Users\Fauzi\Documents\Games\Yure Party\patch19.py', 'r', 'utf-8') as f:
    patch_code = f.read()

start = patch_code.find('new_refresh = """') + 17
end = patch_code.find('"""', start)
new_refresh = patch_code[start:end]

print("new_refresh length:", len(new_refresh))

if text.startswith(new_refresh[:100]):
    print("Confirmed corrupted!")
    with codecs.open(path, 'r', 'utf-8') as f:
        full_text = f.read()
    
    # Split the full text by new_refresh to get the original characters
    chunks = full_text.split(new_refresh)
    
    # The first chunk will be empty because it starts with new_refresh
    # The original string is just ''.join(chunks)
    recovered = "".join(chunks)
    
    # But wait! We actually wanted to REPLACE the OLD refresh with the NEW refresh!
    # Because old_refresh was "", it inserted new_refresh everywhere.
    # To fix it, we should find the OLD refresh in `recovered` and replace it with `new_refresh`.
    
    old_start = recovered.find('Window_FlexHelp.prototype.refresh = function() {')
    old_end = recovered.find('this.contents.fontSize = this.standardFontSize();\\n    };', old_start)
    if old_end == -1:
        old_end = recovered.find('this.contents.fontSize = this.standardFontSize();\\r\\n    };', old_start)
    
    if old_end == -1:
        # Just use standard find for the end
        old_end = recovered.find('};', old_start) + 2
    else:
        old_end += 57
        
    old_refresh = recovered[old_start:old_end]
    
    final_text = recovered.replace(old_refresh, new_refresh)
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(final_text)
    print("Recovered and patched successfully! Length:", len(final_text))
else:
    print("Not corrupted??")
