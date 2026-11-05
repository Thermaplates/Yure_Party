import sys

path = r'c:\Users\Fauzi\Documents\Games\Yure Party\js\plugins\Yure_CustomHub.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

injection = """
 * @param ui_slot6_x
 * @text Slot 6 X
 * @type number
 * @default 225
 *
 * @param ui_slot6_y
 * @text Slot 6 Y
 * @type number
 * @default 600
 *
 * @param ui_slot6_w
 * @text Slot 6 W
 * @type number
 * @default 60
 *
 * @param ui_slot6_h
 * @text Slot 6 H
 * @type number
 * @default 60
 *
 * @param ui_slot7_x
 * @text Slot 7 X
 * @type number
 * @default 130
 *
 * @param ui_slot7_y
 * @text Slot 7 Y
 * @type number
 * @default 300
 *
 * @param ui_slot7_w
 * @text Slot 7 W
 * @type number
 * @default 60
 *
 * @param ui_slot7_h
 * @text Slot 7 H
 * @type number
 * @default 60
 *
 * @param ui_slot8_x
 * @text Slot 8 X
 * @type number
 * @default 130
 *
 * @param ui_slot8_y
 * @text Slot 8 Y
 * @type number
 * @default 300
 *
 * @param ui_slot8_w
 * @text Slot 8 W
 * @type number
 * @default 60
 *
 * @param ui_slot8_h
 * @text Slot 8 H
 * @type number
 * @default 60
"""

insert_target = " * @param ui_slot5_h\n * @text Slot 5 H\n * @type number\n * @default 60"
if insert_target in text and "ui_slot6_x" not in text:
    text = text.replace(insert_target, insert_target + injection)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Injected parameters for Slots 6-8!")
else:
    print("Already injected or target not found.")
