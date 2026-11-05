$raw = Get-Content 'data\States.json' -Raw
$states = ConvertFrom-Json $raw
$states[12].note = "<desc: Memiliki 3 nyawa (Revive 15% HP). Setelah habis, tahan 1x serangan mematikan.>"
$json = ConvertTo-Json $states -Depth 10 -Compress
Set-Content 'data\States.json' $json
