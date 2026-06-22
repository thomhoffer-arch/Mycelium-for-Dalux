# Mycelium-for-Dalux — one-click installer (Windows PowerShell)
# Usage: Right-click → "Run with PowerShell"  OR  .\install.ps1
#        If blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
[CmdletBinding()] param()
$ErrorActionPreference = 'Stop'
$connector = "mycelium-draft\connectors\dalux"
$envFile   = "$connector\.env"

function ok   { param($m) Write-Host "✔  $m" -ForegroundColor Green }
function warn { param($m) Write-Host "⚠  $m" -ForegroundColor Yellow }
function die  { param($m) Write-Host "✖  $m" -ForegroundColor Red; exit 1 }
function h    { param($m) Write-Host "`n$m" -ForegroundColor White }

# ── 1. Node.js version check ──────────────────────────────────────────────────
h "Checking Node.js …"
try { $nodeVer = node -e "process.stdout.write(process.versions.node)" }
catch { die "Node.js not found. Install Node 18+ from https://nodejs.org and re-run." }
$major = [int]($nodeVer -split '\.')[0]
if ($major -lt 18) { die "Node.js $nodeVer found but 18+ is required. Upgrade at https://nodejs.org" }
ok "Node.js $nodeVer"

# ── 2. npm install ────────────────────────────────────────────────────────────
h "Installing dependencies …"
Push-Location $connector
npm install --silent
Pop-Location
ok "npm install complete"

# ── 3. Credentials setup ──────────────────────────────────────────────────────
h "Dalux credentials"

function Prompt-Var {
    param([string]$Label, [string]$Hint = "")
    $display = if ($Hint) { "$Label ($Hint)" } else { $Label }
    $val = Read-Host "  $display"
    return $val
}

if (Test-Path $envFile) {
    warn ".env already exists — skipping credential prompts. Edit $envFile to change."
} else {
    Write-Host "  Enter your Dalux details (press Enter to leave blank and fill in later).`n"
    $lines = @(
        "# Mycelium-for-Dalux — credentials",
        "# See README.md for descriptions of each variable.",
        "",
        "DALUX_TOKEN_URL=$(Prompt-Var 'Dalux OAuth2 token URL' 'e.g. https://auth.dalux.com/token')",
        "DALUX_CLIENT_ID=$(Prompt-Var 'Dalux Client ID')",
        "DALUX_CLIENT_SECRET=$(Prompt-Var 'Dalux Client Secret')",
        "DALUX_SCOPE=$(Prompt-Var 'OAuth2 Scope' 'leave blank if unsure')",
        "DALUX_TOKEN=$(Prompt-Var 'Pre-obtained token' 'optional — bypasses OAuth2')",
        "DALUX_PROJECT_ID=$(Prompt-Var 'Dalux Project ID' 'UUID from Dalux')",
        "DALUX_PROJECT_KEY=$(Prompt-Var 'Project key' 'short label, e.g. horizons')"
    )
    $lines | Set-Content $envFile -Encoding UTF8
    ok ".env written to $envFile"
}

# ── 4. Smoke-run ──────────────────────────────────────────────────────────────
h "Smoke-run …"
Write-Host "  Running: node connector.mjs"
Write-Host "  (Will fail if credentials are not yet filled in — that's fine.)`n"
Push-Location $connector
$result = node connector.mjs 2>&1
$exit   = $LASTEXITCODE
Pop-Location

if ($exit -eq 0) {
    Write-Host $result
    Write-Host ""
    ok "Connector ran successfully — conformant records printed above."
} else {
    Write-Host $result
    Write-Host ""
    warn "Connector exited with an error."
    Write-Host "     Fill in $envFile with your Dalux credentials and run:"
    Write-Host "     cd $connector; node connector.mjs"
}

Write-Host "`nDone. To re-run at any time:"
Write-Host "  cd $connector; node connector.mjs"
