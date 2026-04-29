param(
    [string]$Source = "public/logo.png",
    [string]$OutDir = "public/icons"
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Common -ErrorAction SilentlyContinue

$ErrorActionPreference = "Stop"

$sourcePath = Resolve-Path $Source
$outDir = (Resolve-Path $OutDir).Path

Write-Host "Source: $sourcePath"
Write-Host "Out:    $outDir"

$src = [System.Drawing.Image]::FromFile($sourcePath)
Write-Host "Logo: $($src.Width)x$($src.Height)"

# Use a centered square crop (logo appears centered in the image)
$square = [Math]::Min($src.Width, $src.Height)
$cropX = [int](($src.Width  - $square) / 2)
$cropY = [int](($src.Height - $square) / 2)

$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#F5EFDF")

function Save-Icon {
    param([int]$Size, [string]$Name, [bool]$Maskable = $false)

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $bmp.SetResolution(72, 72)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $brush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($brush, 0, 0, $Size, $Size)
    $brush.Dispose()

    if ($Maskable) {
        # Maskable icons need safe zone: draw logo at 80% centered so OS masks don't crop it
        $inner = [int]($Size * 0.8)
        $offset = [int](($Size - $inner) / 2)
        $dstRect = New-Object System.Drawing.Rectangle $offset, $offset, $inner, $inner
    } else {
        $dstRect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    }

    $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $square, $square
    $g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $path = Join-Path $outDir $Name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $path"
}

Save-Icon -Size 32  -Name "icon-32.png"
Save-Icon -Size 64  -Name "icon-64.png"
Save-Icon -Size 128 -Name "icon-128.png"
Save-Icon -Size 180 -Name "icon-180.png"
Save-Icon -Size 192 -Name "icon-192.png"
Save-Icon -Size 256 -Name "icon-256.png"
Save-Icon -Size 384 -Name "icon-384.png"
Save-Icon -Size 512 -Name "icon-512.png"
Save-Icon -Size 192 -Name "icon-maskable-192.png" -Maskable $true
Save-Icon -Size 512 -Name "icon-maskable-512.png" -Maskable $true

$src.Dispose()
Write-Host "Done."
