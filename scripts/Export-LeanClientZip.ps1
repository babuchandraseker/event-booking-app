<#
.SYNOPSIS
  Build a lean, production-ready ZIP of the Vite client (no node_modules, no build output).

.DESCRIPTION
  Copies only:
    - client/src
    - client/public
    - client/index.html
    - client/package.json + package-lock.json
    - client/vite.config.js, tailwind.config.js, postcss.config.js, eslint.config.js
    - client/README.md, .gitignore
  Excludes: node_modules, dist, build, .git, .next, .cache, coverage, logs, temp folders.

.PARAMETER ClientPath
  Absolute or relative path to the `client` folder. Default: sibling `client` next to this `scripts` folder.

.PARAMETER OutZip
  Output .zip path. Default: parent of `client` + velvet-nights-client-lean.zip
#>
[CmdletBinding()]
param(
  [string] $ClientPath = "",
  [string] $OutZip = ""
)

$ErrorActionPreference = "Stop"

$scripts = $PSScriptRoot
if ($ClientPath -and $ClientPath.Trim().Length -gt 0) {
  $client = (Resolve-Path -LiteralPath $ClientPath).Path
} else {
  $candidate = Join-Path (Split-Path -Parent $scripts) "client"
  if (-not (Test-Path -LiteralPath $candidate)) {
    throw "Could not find client folder at: $candidate. Pass -ClientPath explicitly."
  }
  $client = (Resolve-Path -LiteralPath $candidate).Path
}
if (-not $OutZip -or $OutZip.Trim().Length -eq 0) {
  $OutZip = Join-Path (Split-Path -Parent $client) "velvet-nights-client-lean.zip"
} else {
  $OutZip = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutZip)
}

$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("vn-lean-" + [Guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $staging -Force | Out-Null

Write-Host "Client:  $client"
Write-Host "Staging: $staging"
Write-Host "OutZip:  $OutZip"

# --- copy trees (exclude heavy / disposable dirs) ---
$robArgs = @(
  $client, $staging, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/XF", "*.log",
  "/XD", "node_modules", "dist", "build", ".git", ".cache", ".next", "coverage",
  ".turbo", ".vite", "tmp", "temp", "__pycache__"
)
& robocopy.exe @robArgs | Out-Null
$code = $LASTEXITCODE
if ($code -ge 8) {
  throw "robocopy failed with exit code $code"
}

# --- ensure only intended root artifacts (trim anything else copied at root) ---
$allowedRootFiles = @(
  "index.html", "package.json", "package-lock.json",
  "vite.config.js", "tailwind.config.js", "postcss.config.js", "eslint.config.js",
  "jsconfig.json", "tsconfig.json", "tsconfig.node.json", "components.json",
  "README.md", ".gitignore"
)
Get-ChildItem -LiteralPath $staging -File | ForEach-Object {
  if ($allowedRootFiles -notcontains $_.Name) {
    Write-Host "Removing extra root file: $($_.Name)"
    Remove-Item -LiteralPath $_.FullName -Force
  }
}

# --- require critical paths ---
foreach ($req in @("src", "public", "package.json", "index.html", "vite.config.js")) {
  $p = Join-Path $staging $req
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Missing required path after copy: $req"
  }
}

# --- refresh small root docs for lean handoff ---
$ts = Get-Date -Format "yyyy-MM-dd HH:mm"
$readmeLean = (@'
# A WonderOne Suprise — client (lean export)

This archive contains **source and configuration only** (no `node_modules`, no `dist`).

## Install & run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Contents

- `src/` — application code
- `public/` — static assets at site root (`/themes/...`, icons, etc.)
- Vite / Tailwind / ESLint configs and `package-lock.json` for reproducible installs

## Media

If `public/themes/` is missing in your handoff, add MP4/JPEG assets there or configure media via the admin **Hero Section** / gallery tools.

Generated: PLACEHOLDER_TS (local time)
'@) -replace 'PLACEHOLDER_TS', $ts
Set-Content -LiteralPath (Join-Path $staging "README.md") -Value $readmeLean -Encoding UTF8

$gitignore = @"
node_modules/
dist/
build/
.next/
.cache/
coverage/
.turbo/
.vite/
*.log
.env.local
.DS_Store
Thumbs.db
"@
Set-Content -LiteralPath (Join-Path $staging ".gitignore") -Value $gitignore -Encoding UTF8

# --- zip (Windows built-in; fast extraction: deflate, no nested junk folder) ---
if (Test-Path -LiteralPath $OutZip) {
  Remove-Item -LiteralPath $OutZip -Force
}
Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $OutZip -CompressionLevel Optimal -Force

Remove-Item -LiteralPath $staging -Recurse -Force

$len = (Get-Item -LiteralPath $OutZip).Length
Write-Host ""
Write-Host "DONE: $OutZip ($len bytes)"
