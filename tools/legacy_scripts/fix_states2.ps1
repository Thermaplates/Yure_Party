$raw = Get-Content 'data\States.json' -Raw
$lastIndex = $raw.LastIndexOf(']')
if ($lastIndex -gt -1) {
    $raw = $raw.Substring(0, $lastIndex + 1)
    Set-Content 'data\States.json' $raw
}
