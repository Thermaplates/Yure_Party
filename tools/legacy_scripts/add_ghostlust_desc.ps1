$raw = Get-Content 'data\States.json' -Raw
$states = ConvertFrom-Json $raw
$states[13].note = "<desc: The Ultimate Tanker! TGR 300% dan mengurangi damage yang diterima hingga 75% saat sekarat!>`n" + $states[13].note
$json = ConvertTo-Json $states -Depth 10 -Compress
Set-Content 'data\States.json' $json
