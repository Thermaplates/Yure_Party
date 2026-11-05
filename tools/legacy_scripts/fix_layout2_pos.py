with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('this._layout2.x = this._pos_x + Moghunter.ahud_layout2_x;', 'this._layout2.x = Moghunter.ahud_layout2_x;')
content = content.replace('this._layout2.y = this._pos_y + Moghunter.ahud_layout2_y;', 'this._layout2.y = Moghunter.ahud_layout2_y;')

with open('c:/Users/Fauzi/Documents/Games/Yure Party/js/plugins/MOG_ActorHud.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed layout2 positioning!')
