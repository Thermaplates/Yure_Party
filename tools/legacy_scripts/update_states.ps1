$text = Get-Content 'data\States.json' -Raw
$states = ConvertFrom-Json $text
$states[12].note = @"
<desc: Memiliki 3 nyawa (Revive 15% HP). Setelah habis, tahan 1x serangan mematikan.>
<Custom React Effect>
if (value > 0 && value >= target.hp) {
    if (target._sakiNyawa === undefined) { target._sakiNyawa = 3; }
    if (target._sakiNyawa > 0) {
        target._sakiNyawa -= 1;
        value = 0;
        target.setHp(Math.floor(target.mhp * 0.15));
        target.startAnimation(49);
    } else {
        if (!target._sakiEnduranceUsed) {
            target._sakiEnduranceUsed = true;
            value = target.hp - 1;
            target.startAnimation(53);
        }
    }
}
</Custom React Effect>

<Custom Battle End Effect>
target._sakiNyawa = 3;
target._sakiEnduranceUsed = false;
</Custom Battle End Effect>
"@
$json = ConvertTo-Json $states -Depth 10 -Compress
Set-Content 'data\States.json' $json
