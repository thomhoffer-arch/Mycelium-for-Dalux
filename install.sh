#!/usr/bin/env bash
# Mycelium-for-Dalux — one-click installer (Mac / Linux)
# Usage: ./install.sh
set -euo pipefail

CONNECTOR="mycelium-draft/connectors/dalux"
ENV_FILE="$CONNECTOR/.env"

# ── colour helpers ─────────────────────────────────────────────────────────────
bold=$'\e[1m'; green=$'\e[32m'; yellow=$'\e[33m'; red=$'\e[31m'; reset=$'\e[0m'
ok()   { echo "${green}✔${reset}  $*"; }
warn() { echo "${yellow}⚠${reset}  $*"; }
die()  { echo "${red}✖${reset}  $*" >&2; exit 1; }
h()    { echo; echo "${bold}$*${reset}"; }

# ── 1. Node.js version check ───────────────────────────────────────────────────
h "Checking Node.js …"
if ! command -v node &>/dev/null; then
  die "Node.js not found. Install Node 18+ from https://nodejs.org and re-run."
fi
NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  die "Node.js $NODE_VER found but 18+ is required. Upgrade at https://nodejs.org"
fi
ok "Node.js $NODE_VER"

# ── 2. npm install ─────────────────────────────────────────────────────────────
h "Installing dependencies …"
(cd "$CONNECTOR" && npm install --silent)
ok "npm install complete"

# ── 3. Credentials setup ───────────────────────────────────────────────────────
h "Dalux credentials"

if [ -f "$ENV_FILE" ]; then
  warn ".env already exists — skipping credential prompts. Edit $ENV_FILE to change."
else
  echo "  Enter your Dalux details (press Enter to leave blank and fill in later)."
  echo

  prompt() {
    local label="$1" var="$2" hint="${3:-}"
    local full_label="  ${bold}${label}${reset}"
    [ -n "$hint" ] && full_label+=" ${yellow}(${hint})${reset}"
    read -rp "${full_label}: " val
    echo "$var=$val"
  }

  {
    echo "# Mycelium-for-Dalux — credentials"
    echo "# See README.md for descriptions of each variable."
    echo ""
    prompt "Dalux OAuth2 token URL"  DALUX_TOKEN_URL    "e.g. https://auth.dalux.com/token — check Dalux API docs"
    prompt "Dalux Client ID"          DALUX_CLIENT_ID
    prompt "Dalux Client Secret"      DALUX_CLIENT_SECRET
    prompt "OAuth2 Scope"             DALUX_SCOPE        "leave blank if unsure"
    prompt "Pre-obtained token"       DALUX_TOKEN        "optional — bypasses OAuth2"
    prompt "Dalux Project ID"         DALUX_PROJECT_ID   "UUID from Dalux"
    prompt "Project key (short label)" DALUX_PROJECT_KEY "e.g. horizons"
  } > "$ENV_FILE"

  ok ".env written to $ENV_FILE"
fi

# ── 4. Smoke-run ───────────────────────────────────────────────────────────────
h "Smoke-run …"
echo "  Running: node connector.mjs"
echo "  (Will fail if credentials are not yet filled in — that's fine.)"
echo

if (cd "$CONNECTOR" && node connector.mjs 2>&1); then
  echo
  ok "Connector ran successfully — conformant records printed above."
else
  echo
  warn "Connector exited with an error."
  echo "     Fill in $ENV_FILE with your Dalux credentials and run:"
  echo "     cd $CONNECTOR && node connector.mjs"
fi

echo
echo "${bold}Done.${reset} To re-run at any time:"
echo "  cd $CONNECTOR && node connector.mjs"
