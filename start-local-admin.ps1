$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$editorUrl = 'http://127.0.0.1:8792/admin/'
try {
    $existing = Invoke-RestMethod -Uri 'http://127.0.0.1:8792/admin/api/state' -TimeoutSec 2
    if ($existing.site -ne 'Adelaide Tiling & Waterproofing') { throw 'Port 8792 belongs to another application.' }
} catch {
    if (Get-NetTCPConnection -State Listen -LocalPort 8792 -ErrorAction SilentlyContinue) { throw 'Port 8792 is occupied. Ask Codex to check it.' }
    $nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
    if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'node_modules/parse5'))) {
        Push-Location $siteRoot
        try { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' } } finally { Pop-Location }
    }
    $runtimeFolder = Join-Path $siteRoot '.local-admin'
    New-Item -ItemType Directory -Path $runtimeFolder -Force | Out-Null
    $serverPath = Join-Path $siteRoot 'local-admin/server.mjs'
    $process = Start-Process -FilePath $nodeExe -ArgumentList @('"' + $serverPath + '"') -WorkingDirectory $siteRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeFolder 'server.log') -RedirectStandardError (Join-Path $runtimeFolder 'server-error.log')
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        try { $ready = Invoke-RestMethod -Uri 'http://127.0.0.1:8792/admin/api/state' -TimeoutSec 2; if ($ready.site -eq 'Adelaide Tiling & Waterproofing') { break } } catch {}
        if ($process.HasExited) { throw 'Startup failed. Check .local-admin/server-error.log.' }
    }
    if (-not $ready) { throw 'Startup timed out. Ask Codex to check it.' }
}
Start-Process $editorUrl
