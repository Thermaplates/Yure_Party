Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('img\characters\$Nia_backup.png')

$empty = $true
for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $color = $img.GetPixel($x, $y)
        if ($color.A -gt 0) {
            $empty = $false
            Write-Output "Found non-transparent pixel at $x, $y"
            break
        }
    }
    if (-not $empty) { break }
}

if ($empty) {
    Write-Output "Image is COMPLETELY TRANSPARENT"
}
$img.Dispose()
