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

for ($row = 0; $row -lt 4; $row++) {
    # MV Col 0 (Step 1) <- User Col 1
    DrawFrame -dstCol 0 -dstRow $row -srcCol 1 -srcRow $row
    # MV Col 1 (Stand) <- User Col 0
    DrawFrame -dstCol 1 -dstRow $row -srcCol 0 -srcRow $row
    # MV Col 2 (Step 2) <- User Col 3
    DrawFrame -dstCol 2 -dstRow $row -srcCol 3 -srcRow $row
}

$g.Dispose()
$srcImg.Dispose()

$bmp.Save('img\characters\$nia.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
