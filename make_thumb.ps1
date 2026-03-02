$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile('c:\xampp\htdocs\ba-in\assets\images\blog\1.jpg')
$bmp = New-Object System.Drawing.Bitmap(370, 209)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$h = 160
$w = [int]($src.Width * ($h / $src.Height))
$x = [int]((370 - $w) / 2)
$y = [int]((209 - $h) / 2)
$g.DrawImage($src, $x, $y, $w, $h)
$bmp.Save('c:\xampp\htdocs\ba-in\assets\images\blog\1-thumb.jpg', [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Host "Thumbnail created successfully"
