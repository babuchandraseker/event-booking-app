# =============================================================================
# Clean heavy artifacts + create lightweight source ZIP (LUXE theme project)
# Run: Right-click -> Run with PowerShell, OR:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\clean-and-zip.ps1
# =============================================================================
$ErrorActionPreference = 'Stop'

$mobileRoot = $PSScriptRoot
$appRoot    = Join-Path $mobileRoot 'event-booking-app'
$project    = Join-Path $appRoot 'event-booking-app-main'

if (-not (Test-Path $project)) {
  Write-Error "Project not found: $project"
}

$removeDirNames = @(
  'node_modules', 'dist', 'build', '.vite', '.cache', 'coverage',
  'temp', 'tmp', 'logs', '.turbo', '.parcel-cache', '.next', '.nuxt'
)

Write-Host 'Removing heavy folders/files...' -ForegroundColor Cyan
$removed = [System.Collections.Generic.List[string]]::new()

Get-ChildItem -Path $project -Recurse -Directory -Force -ErrorAction SilentlyContinue |
  Where-Object { $removeDirNames -contains $_.Name } |
  ForEach-Object {
    Write-Host "  DELETE $($_.FullName)"
    Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    $removed.Add($_.FullName)
  }

Get-ChildItem -Path $project -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -in '.log', '.tmp' } |
  ForEach-Object {
    Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    $removed.Add($_.FullName)
  }

Write-Host "Removed $($removed.Count) paths." -ForegroundColor Green

# Stage copy (exclude .git only — heavy dirs already deleted)
$staging = Join-Path $env:TEMP ("event-booking-luxe-" + [guid]::NewGuid().ToString('n'))
$zipRoot = Join-Path $staging 'event-booking-app-mobile-fixed-luxe'
$null = New-Item -ItemType Directory -Path $zipRoot -Force

Write-Host 'Staging source-only tree...' -ForegroundColor Cyan
robocopy $mobileRoot $zipRoot /E /XD .git /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

$downloads = Split-Path $mobileRoot -Parent
$zipPath  = Join-Path $downloads 'event-booking-app-mobile-fixed-luxe-theme.zip'
$zipCopy  = Join-Path $downloads 'event-booking-app-mobile-fixed (2)-luxe.zip'

foreach ($z in @($zipPath, $zipCopy)) {
  if (Test-Path $z) { Remove-Item $z -Force }
}

Write-Host 'Creating ZIP...' -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $zipRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal -Force
Copy-Item -LiteralPath $zipPath -Destination $zipCopy -Force

Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue

$sizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
$report = Join-Path $mobileRoot 'clean-zip-report.txt'

@"
LUXE theme — clean ZIP report
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Removed paths: $($removed.Count)
$(
  if ($removed.Count -gt 0) {
    ($removed | ForEach-Object { "  - $_" }) -join "`n"
  } else {
    '  (none — already clean)'
  }
)

ZIP: $zipPath
Size: $sizeMb MB ($((Get-Item $zipPath).Length) bytes)
Copy: $zipCopy

Kept: source, client, server, public, package.json, package-lock.json, configs, README
Deleted: node_modules, dist, build, .vite, .cache, coverage, temp, logs

Restore deps after extract:
  cd event-booking-app\event-booking-app-main
  npm install
  cd client && npm install
  cd ..\server && npm install
"@ | Set-Content -Path $report -Encoding UTF8

Write-Host ''
Write-Host 'DONE' -ForegroundColor Green
Write-Host "ZIP: $zipPath ($sizeMb MB)"
Write-Host "Copy: $zipCopy"
Write-Host "Report: $report"
