# tools/list-missing-n1-webp.ps1
$ErrorActionPreference = "Stop"

$metaPath = "src\data\n1_kanji_meta.ts"
if (!(Test-Path $metaPath)) { throw "No existe $metaPath" }

$ts = Get-Content $metaPath -Raw
$hexes = [regex]::Matches($ts, 'hex:\s*"([0-9A-Fa-f]{4,5})"') | ForEach-Object { $_.Groups[1].Value.ToLower() }

$base = "assets\kanjivg\n1"
if (!(Test-Path $base)) { New-Item -ItemType Directory -Path $base | Out-Null }

$missing = New-Object System.Collections.Generic.List[string]
foreach ($h in $hexes) {
  $p = Join-Path $base "${h}_nums.webp"
  if (!(Test-Path $p)) { $missing.Add($h) }
}

"FALTAN {0} webp" -f $missing.Count
$missing | Set-Content "missing_n1_hex.txt"
"Guardado missing_n1_hex.txt"
