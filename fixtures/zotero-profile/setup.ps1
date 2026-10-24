# Crea las carpetas del perfil de desarrollo, tras validar que no apuntan a la biblioteca real.
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $root

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Se creó .env desde .env.example; revisa las rutas y vuelve a ejecutar."
  exit 1
}

npx tsx scripts/env-guard.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

foreach ($line in Get-Content ".env") {
  if ($line -match '^(ZOTERO_DEV_PROFILE|ZOTERO_DEV_DATA)=(.+)$') {
    New-Item -ItemType Directory -Force -Path $Matches[2] | Out-Null
    Write-Host "OK: $($Matches[2])"
  }
}
