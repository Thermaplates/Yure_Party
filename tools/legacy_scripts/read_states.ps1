$states = Get-Content 'data\States.json' -Raw | ConvertFrom-Json
$states[12] | ConvertTo-Json -Depth 5
$states[13] | ConvertTo-Json -Depth 5
