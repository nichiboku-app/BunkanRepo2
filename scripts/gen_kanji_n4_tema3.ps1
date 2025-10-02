# KanjiVG -> WEBP (N4 tema 3) - PowerShell 5 compatible
# Salida: assets/kanjivg/n4/<hex4>_web.webp
# Requiere: ImageMagick ("magick") disponible en PATH

$ErrorActionPreference = "Stop"

# --- Comprobar magick ---
try { & magick -version | Out-Null } catch { throw "No se encontró 'magick'. Instala y abre nueva PowerShell." }

# --- Carpeta de salida ---
$Out = "assets/kanjivg/n4"
New-Item -ItemType Directory -Force -Path $Out | Out-Null

# --- HEX (minúscula, 4 dígitos) para esta lección ---
# 食 98df, 飲 98f2, 米 7c73, 肉 8089, 魚 9b5a, 野 91ce, 菜 83dc, 茶 8336, 牛 725b, 店 5e97
$HexList = @('98df','98f2','7c73','8089','9b5a','91ce','83dc','8336','725b','5e97')

# --- Bajar release zip (kanjivg-YYYYMMDD-main.zip) ---
function Get-ReleaseZip {
  $hdr = @{ "User-Agent"="pwsh" }
  $rel = Invoke-RestMethod "https://api.github.com/repos/KanjiVG/kanjivg/releases/latest" -Headers $hdr
  $asset = $rel.assets | Where-Object { $_.name -match "kanjivg-\d+-main\.zip$" } | Select-Object -First 1
  if (-not $asset) { throw "No encontré el zip 'main' en la release." }
  $zip = Join-Path $env:TEMP $asset.name
  if (-not (Test-Path $zip)) {
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip -UseBasicParsing
  }
  return $zip
}

# --- Expandir una sola vez ---
function Expand-ZipOnce {
  param([string]$Kind = "main")
  if (-not (Get-Variable -Name ExpandedDir -Scope Script -ErrorAction SilentlyContinue)) {
    Set-Variable -Name ExpandedDir -Scope Script -Value @{}
  }
  if ($script:ExpandedDir.ContainsKey($Kind)) { return $script:ExpandedDir[$Kind] }
  $zip = Get-ReleaseZip
  $tmpDir = Join-Path $env:TEMP ("kanjivg_zip_" + [guid]::NewGuid())
  Expand-Archive $zip $tmpDir -Force
  $script:ExpandedDir[$Kind] = $tmpDir
  return $tmpDir
}

# --- Resolver SVG por hex (busca 5 dígitos y variantes con 'u') ---
function Resolve-Svg-ByHex {
  param([Parameter(Mandatory=$true)][string]$hex4)
  $hex4 = $hex4.ToLower()
  $hex5 = "0$hex4"  # ej. 98f2 -> 098f2

  $root = Expand-ZipOnce

  # Busca por nombre exacto en todo el árbol (la release trae todos los SVG)
  $names = @("$hex5.svg","u$hex4.svg","u$hex5.svg","$hex4.svg")
  foreach ($n in $names) {
    $m = Get-ChildItem -Path $root -Recurse -Filter $n -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($m) { return $m.FullName }
  }
  throw "No encontré SVG para U+$($hex4.ToUpper())."
}

# --- Convertir a WEBP transparente 1024x1024 ---
$ok = 0; $fail = 0
foreach ($hex in $HexList) {
  try {
    $svg = Resolve-Svg-ByHex -hex4 $hex
    $outWebp = Join-Path $Out ($hex + "_web.webp")
    & magick -background none -density 512 "$svg" -resize 1024x1024 -define webp:lossless=true "$outWebp"
    if (-not (Test-Path $outWebp)) { throw "falló la conversión a WEBP" }
    Write-Host ("OK {0} -> {1}" -f $hex, $outWebp)
    $ok++
  } catch {
    Write-Warning ("FAIL {0}: {1}" -f $hex, $_.Exception.Message)
    $fail++
  }
}
Write-Host ("Listo. OK={0} FAIL={1} Out={2}" -f $ok, $fail, $Out)
