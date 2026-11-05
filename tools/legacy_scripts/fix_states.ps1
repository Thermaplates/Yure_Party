$raw = Get-Content 'data\States.json' -Raw
if ($raw.StartsWith('{"value":[')) {
    $raw = $raw.Substring(9)
    $raw = $raw.TrimEnd()
    if ($raw.EndsWith('}')) {
        $raw = $raw.Substring(0, $raw.Length - 1)
    }
    Set-Content 'data\States.json' $raw
}
