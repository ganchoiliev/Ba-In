$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\ZapEc\.gemini\antigravity\brain\b7223f44-bf89-418c-ab44-faa0b73da211\media__1772408564591.jpg'
$src = [System.Drawing.Image]::FromFile($srcPath)

# 1. Create the THUMBNAIL (370x209, padded white background)
$bmpSmall = New-Object System.Drawing.Bitmap(370, 209)
$gSmall = [System.Drawing.Graphics]::FromImage($bmpSmall)
$gSmall.Clear([System.Drawing.Color]::White)
$gSmall.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$hSmall = 150
$wSmall = [int]($src.Width * ($hSmall / $src.Height))
$xSmall = [int]((370 - $wSmall) / 2)
$ySmall = [int]((209 - $hSmall) / 2)
$gSmall.DrawImage($src, $xSmall, $ySmall, $wSmall, $hSmall)
$bmpSmall.Save('c:\xampp\htdocs\ba-in\assets\images\blog\1-s.jpg', [System.Drawing.Imaging.ImageFormat]::Jpeg)

$gSmall.Dispose()
$bmpSmall.Dispose()

# 2. Create the HOVER IMAGE (370x260, cropped to fill)
$bmpBig = New-Object System.Drawing.Bitmap(370, 260)
$gBig = [System.Drawing.Graphics]::FromImage($bmpBig)
$gBig.Clear([System.Drawing.Color]::White)
$gBig.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$scale = [math]::Max((370.0 / $src.Width), (260.0 / $src.Height))
$wBig = [int]($src.Width * $scale)
$hBig = [int]($src.Height * $scale)
$xBig = [int]((370 - $wBig) / 2)
$yBig = [int]((260 - $hBig) / 2)

$gBig.DrawImage($src, $xBig, $yBig, $wBig, $hBig)
$bmpBig.Save('c:\xampp\htdocs\ba-in\assets\images\blog\1.jpg', [System.Drawing.Imaging.ImageFormat]::Jpeg)

$gBig.Dispose()
$bmpBig.Dispose()
$src.Dispose()

Write-Host "Generated 1-s.jpg and 1.jpg perfectly!"
