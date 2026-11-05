Add-Type -AssemblyName System.Drawing

$srcPath = 'img\characters\$Nia_backup.png'
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$bmp = New-Object System.Drawing.Bitmap(216, 384)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRect = New-Object System.Drawing.Rectangle(0, 0, 216, 384)
$dstRect = New-Object System.Drawing.Rectangle(0, 0, 216, 384)
$g.DrawImage($srcImg, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$srcImg.Dispose()

$bmp.Save('img\characters\$nia.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
