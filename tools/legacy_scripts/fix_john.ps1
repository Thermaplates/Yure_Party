# fix_john.ps1 — Rebuild img\characters\$John.png as a clean MV 3x4 sheet.
#
# Problem: $John.png is a 500x500 RAW sheet in the artist's 4-column layout
# (like $Nia_backup.png / $niatot_raw_backup.png were). MV slices any $-sheet
# into 3 cols x 4 rows, so 500/3 = 166.67px cells cut every figure -> the NPC
# looks "cut off" in game (Map002 EV013).
#
# Fix (same convention as fix_nia/final_fix_nia/crop_nia for Nia):
#   raw layout per row = [stand, step1, stand-copy, step2]  (col0 == col2,
#   verified pixel-identical; stand = tallest / closed-stance figure)
#   MV layout per row  = [step1, stand, step2] = raw cols [1,0,3]
#   Direction rows stay in place: DOWN, LEFT, RIGHT, UP.
#   Target cell 96x128 (same as the other fixed sheets: $niatot.png etc.),
#   figure centered horizontally, feet 8px above the cell bottom (Nia parity).
#   Raw file is preserved as $John_raw_backup.png.
#
# RUN FROM THE GAME ROOT:  powershell -ExecutionPolicy Bypass -File fix_john.ps1

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$srcPath = 'img\characters\$John.png'
$bakPath = 'img\characters\$John_raw_backup.png'

if (-not (Test-Path $srcPath)) { throw "Missing $srcPath (run from game root)" }

# Preserve the raw sheet once, same convention as $Nia_backup.png
if (-not (Test-Path $bakPath)) {
    Copy-Item $srcPath $bakPath
    Write-Host "Raw sheet preserved as $bakPath"
}

$srcImg = [System.Drawing.Image]::FromFile((Join-Path (Get-Location) $srcPath))
$bmpSrc = New-Object System.Drawing.Bitmap($srcImg)
$srcImg.Dispose()
$W = $bmpSrc.Width
$H = $bmpSrc.Height
if ($W -eq 288 -and $H -eq 512) {
    Write-Host '$John.png is already a 288x512 fixed sheet - nothing to do.'
    $bmpSrc.Dispose()
    exit 0
}
if ($W -ne 500 -or $H -ne 512 -and $H -ne 500) {
    Write-Host "NOTE: unexpected raw size ${W}x${H} - continuing with blob detection anyway."
}

function IsOpaque($x, $y) { return ($bmpSrc.GetPixel($x, $y).A -gt 8) }

# --- Row bands: split the sheet into the 4 direction rows at the
# --- fully-transparent separator gaps between figure bands.
$sepY = @()
for ($y = 0; $y -lt $H; $y++) {
    $any = $false
    for ($x = 0; $x -lt $W; $x++) { if (IsOpaque $x $y) { $any = $true; break } }
    if (-not $any) { $sepY += $y }
}
$bands = @()
$bs = -1; $be = -1
foreach ($y in $sepY) {
    if ($bs -eq -1) { $bs = $y; $be = $y }
    elseif ($y -eq ($be + 1)) { $be = $y }
    else {
        if (($be - $bs + 1) -ge 3 -and $bs -gt 0 -and $be -lt ($H - 1)) { $bands += ,@($bs, $be) }
        $bs = $y; $be = $y
    }
}
if ($bs -ne -1 -and (($be - $bs + 1) -ge 3) -and $bs -gt 0 -and $be -lt ($H - 1)) { $bands += ,@($bs, $be) }
if ($bands.Count -ne 3) { throw "Expected 3 separator gaps (4 rows), found $($bands.Count)" }

$rowWins = @(
    @(0, ($bands[0][0] - 1)),
    @(($bands[0][1] + 1), ($bands[1][0] - 1)),
    @(($bands[1][1] + 1), ($bands[2][0] - 1)),
    @(($bands[2][1] + 1), ($H - 1))
)
Write-Host ("Row windows: " + (($rowWins | ForEach-Object { "y{0}..{1}" -f $_[0], $_[1] }) -join ' '))

# --- Per row: find the 4 figure column-runs, then each figure's tight bbox.
$figs = @()
for ($r = 0; $r -lt 4; $r++) {
    $ry0, $ry1 = $rowWins[$r]
    $runs = @()
    $rs = -1
    for ($x = 0; $x -lt $W; $x++) {
        $any = $false
        for ($y = $ry0; $y -le $ry1; $y++) { if (IsOpaque $x $y) { $any = $true; break } }
        if ($any -and $rs -eq -1) { $rs = $x }
        elseif ((-not $any) -and $rs -ne -1) { $runs += ,@($rs, ($x - 1)); $rs = -1 }
    }
    if ($rs -ne -1) { $runs += ,@($rs, ($W - 1)) }
    if ($runs.Count -ne 4) { throw "Row $r : expected 4 figures, found $($runs.Count)" }
    $rowFigs = @()
    foreach ($run in $runs) {
        $fx0 = $W; $fy0 = $H; $fx1 = 0; $fy1 = 0
        for ($y = $ry0; $y -le $ry1; $y++) {
            for ($x = $run[0]; $x -le $run[1]; $x++) {
                if (IsOpaque $x $y) {
                    if ($x -lt $fx0) { $fx0 = $x }
                    if ($y -lt $fy0) { $fy0 = $y }
                    if ($x -gt $fx1) { $fx1 = $x }
                    if ($y -gt $fy1) { $fy1 = $y }
                }
            }
        }
        $rowFigs += ,@($fx0, $fy0, $fx1, $fy1)
    }
    $figs += ,$rowFigs
    Write-Host ("Row ${r}: " + (($rowFigs | ForEach-Object { "({0},{1})-({2},{3})" -f $_[0], $_[1], $_[2], $_[3] }) -join ' '))
}

# --- Compose the fixed 3x4 sheet: cell 96x128, feet 8px above cell bottom.
$cellW = 96; $cellH = 128; $footMargin = 8
$dst = New-Object System.Drawing.Bitmap(($cellW * 3), ($cellH * 4))
$g = [System.Drawing.Graphics]::FromImage($dst)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.Clear([System.Drawing.Color]::Transparent)

$map = @(1, 0, 3)  # MV col -> raw col : [step1, stand, step2]
for ($r = 0; $r -lt 4; $r++) {
    for ($f = 0; $f -lt 3; $f++) {
        $b = $figs[$r][$map[$f]]
        $fw = $b[2] - $b[0] + 1
        $fh = $b[3] - $b[1] + 1
        if ($fw -gt $cellW -or $fh -gt ($cellH - $footMargin)) {
            throw ("Figure row {0} raw-col {1} is {2}x{3} - does not fit 96x128 cell" -f $r, $map[$f], $fw, $fh)
        }
        $dx = $f * $cellW + [int][Math]::Round(($cellW - $fw) / 2.0)
        $dy = $r * $cellH + ($cellH - $footMargin - $fh)
        $srcRect = New-Object System.Drawing.Rectangle($b[0], $b[1], $fw, $fh)
        $dstRect = New-Object System.Drawing.Rectangle($dx, $dy, $fw, $fh)
        $g.DrawImage($bmpSrc, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    }
}

$g.Dispose()
$bmpSrc.Dispose()
$dst.Save((Join-Path (Get-Location) $srcPath), [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
Write-Host "Wrote fixed 288x512 $srcPath (MV 3x4, cells 96x128, mapping raw [1,0,3])."
