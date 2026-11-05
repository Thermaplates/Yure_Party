Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('img\characters\$Nia_backup.png')

$minX = 9999
$minY = 9999
$maxX = -1
$maxY = -1

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $color = $img.GetPixel($x, $y)
        if ($color.A -gt 0) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Bounds: X:$minX-$maxX, Y:$minY-$maxY"
$img.Dispose()
