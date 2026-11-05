Add-Type -AssemblyName System.Drawing
$i1 = [System.Drawing.Image]::FromFile('img\characters\$Nia_backup.png')
Write-Output "Backup: $($i1.Width)x$($i1.Height)"
$i1.Dispose()

$i2 = [System.Drawing.Image]::FromFile('img\characters\Nia.png')
Write-Output "Nia: $($i2.Width)x$($i2.Height)"
$i2.Dispose()
