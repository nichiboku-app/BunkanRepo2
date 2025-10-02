# scripts/gen_kanjivg_batch_ps5.ps1
# KanjiVG -> WEBP (batch) - PowerShell 5 compatible
#  - Descarga la release "main" de KanjiVG (ZIP), busca los SVG y los
#    convierte a WEBP transparente 1024x1024 con ImageMagick (magick).
#  - Nombres de salida: <hex4>_web.webp  (p.ej. 98f2_web.webp)
# Requisitos: ImageMagick en PATH (magick.exe)

param(
  [Parameter(Mandatory=$true)][string]$Hex,   # lista separada por coma, ej: "98df,98f2,7c73"
  [Parameter(Mandatory=$true)][string]$Out    # carpeta destino, ej: "assets\kanjivg\n4"
)

$ErrorActionPreference = "Stop"

# --- Comprobar ImageMagick ---
try { & magick -version | Out-Null } catch {
  throw "No se encontro 'magick'. Instala ImageMagick y abre una nueva PowerShell. Ej: winget install ImageMagick.ImageMagick -e"
}

# --- Preparar salida ---
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$HexList = $Hex.Split(",") | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ -ne "" }

# --- Bajar release ZIP (kanjivg-YYYYMMDD-main.zip) ---
function Get-ReleaseZip {
  $hdr = @{ "User-Agent"="pwsh" }
  $rel = Invoke-RestMethod "https://api.github.com/repos/KanjiVG/kanjivg/releases/latest" -Headers $hdr
  $asset = $rel.assets | Where-Object { $_.name -match "kanjivg-\d+-main\.zip$" } | Select-Object -First 1
  if (-not $asset) { throw "No encontre el zip 'main' en la release." }
  $zip = Join-Path $env:TEMP $asset.name
  if (-not (Test-Path $zip)) {
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip -UseBasicParsing
  }
  return $zip
}

# --- Expandir el ZIP solo una vez ---
function Expand-Zip-Once {
  if (-not (Get-Variable -Scope Script -Name ExpandedRoot -ErrorAction SilentlyContinue)) {
    $zip = Get-ReleaseZip
    $tmp = Join-Path $env:TEMP ("kanjivg_zip_" + [guid]::NewGuid())
    Expand-Archive $zip $tmp -Force
    Set-Variable -Scope Script -Name ExpandedRoot -Value $tmp
  }
  return $script:ExpandedRoot
}

# --- Resolver el SVG por codigo hex (4 digitos) ---
function Resolve-Svg-ByHex {
  param([Parameter(Mandatory=$true)][string]$hex4)
  $hex4 = $hex4.ToLower()
  $hex5 = "0$hex4"   # ej. 98f2 -> 098f2
  $root = Expand-Zip-Once

  # nombres habituales dentro del ZIP
  $names = @("$hex5.svg","u$hex4.svg","u$hex5.svg","$hex4.svg")
  foreach ($n in $names) {
    $m = Get-ChildItem -Path $root -Recurse -Filter $n -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($m) { return $m.FullName }
  }
  throw "No encontre SVG para U+$($hex4.ToUpper())."
}

# --- Convertir a WEBP ---
$ok = 0; $fail = 0
foreach ($hex in $HexList) {
  try {
    $svg = Resolve-Svg-ByHex -hex4 $hex
    $outFile = Join-Path $Out ($hex + "_web.webp")
    & magick -background none -density 512 "$svg" -resize 1024x1024 -define webp:lossless=true "$outFile"
    if (-not (Test-Path $outFile)) { throw "Fallo la conversion a WEBP" }
    Write-Host ("OK {0} -> {1}" -f $hex, $outFile)
    $ok++
  } catch {
    Write-Warning ("FAIL {0}: {1}" -f $hex, $_.Exception.Message)
    $fail++
  }
}
Write-Host ("Listo. OK={0} FAIL={1} Out={2}" -f $ok, $fail, $Out)
