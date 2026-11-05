$raw = Get-Content 'data\States.json' -Raw
$states = ConvertFrom-Json $raw
Write-Output $states[12].note
