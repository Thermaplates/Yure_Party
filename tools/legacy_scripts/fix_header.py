with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_SceneMenu.js', 'r', encoding='utf-8') as f:
    content = f.read()

end_of_header = content.find(' */')
if end_of_header != -1 and 'Eyes X-Axis' not in content[:end_of_header]:
    eyes_params = ''' *
 * @param Eyes X-Axis
 * @desc Koordinat X untuk gambar Eyes.
 * @default 350
 *
 * @param Eyes Y-Axis
 * @desc Koordinat Y untuk gambar Eyes.
 * @default 300
 *
 * @param Eyes Scale
 * @desc Skala untuk gambar Eyes.
 * @default 1.00
'''
    content = content[:end_of_header] + eyes_params + content[end_of_header:]
    with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_SceneMenu.js', 'w', encoding='utf-8') as f:
        f.write(content)
