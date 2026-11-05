Add-Type -AssemblyName System.Drawing

$srcPath = 'img\characters\$Nia_backup.png'
$srcImg = [System.Drawing.Image]::FromFile($srcPath)
$srcW = 72
$srcH = 96

$tgtW = 72
$tgtH = 96

$bmp = New-Object System.Drawing.Bitmap( ($tgtW * 3), ($tgtH * 4) )
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function DrawFrame {
    param($dstCol, $dstRow, $srcCol, $srcRow)
    $srcRect = New-Object System.Drawing.Rectangle(($srcCol * $srcW), ($srcRow * $srcH), $srcW, $srcH)
    $dstRect = New-Object System.Drawing.Rectangle(($dstCol * $tgtW), ($dstRow * $tgtH), $tgtW, $tgtH)
    $g.DrawImage($srcImg, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

# Row 0: Front
DrawFrame -dstCol 0 -dstRow 0 -srcCol 0 -srcRow 1
DrawFrame -dstCol 1 -dstRow 0 -srcCol 0 -srcRow 0
DrawFrame -dstCol 2 -dstRow 0 -srcCol 0 -srcRow 3

# Row 1: Left
DrawFrame -dstCol 0 -dstRow 1 -srcCol 3 -srcRow 1
DrawFrame -dstCol 1 -dstRow 1 -srcCol 3 -srcRow 0
DrawFrame -dstCol 2 -dstRow 1 -srcCol 3 -srcRow 3

# Row 2: Right
DrawFrame -dstCol 0 -dstRow 2 -srcCol 1 -srcRow 1
DrawFrame -dstCol 1 -dstRow 2 -srcCol 1 -srcRow 0
DrawFrame -dstCol 2 -dstRow 2 -srcCol 1 -srcRow 3

# Row 3: Back
DrawFrame -dstCol 0 -dstRow 3 -srcCol 2 -srcRow 1
DrawFrame -dstCol 1 -dstRow 3 -srcCol 2 -srcRow 0
DrawFrame -dstCol 2 -dstRow 3 -srcCol 2 -srcRow 3

$g.Dispose()
$srcImg.Dispose()

$bmp.Save('img\characters\$Nia.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
