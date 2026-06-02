#!/usr/bin/env bash
# =============================================================================
# ExcelGens - Azure seed backdate runner
# =============================================================================
# API se seed create hone ke baad is script ko run karo.
# Ye Docker ke andar sqlcmd chalata hai, so macOS par sqlcmd install karne ki
# zarurat nahi hai.
#
# Usage:
#   DB_SERVER='anshulnegiserver.database.windows.net' \
#   DB_NAME='training-institute-db' \
#   DB_USER='sqladmin' \
#   DB_PASS='your-password' \
#   bash scripts/backdate-azure.sh
# =============================================================================

set -euo pipefail

DB_SERVER="${DB_SERVER:-}"
DB_NAME="${DB_NAME:-}"
DB_USER="${DB_USER:-}"
DB_PASS="${DB_PASS:-}"

color() { printf "\033[%sm%s\033[0m" "$1" "$2"; }
fail()  { color "1;31" "  ✗ $*"; echo; exit 1; }
ok()    { color "1;32" "  ✔ $*"; echo; }

[[ -n "$DB_SERVER" ]] || fail "DB_SERVER is required"
[[ -n "$DB_NAME" ]] || fail "DB_NAME is required"
[[ -n "$DB_USER" ]] || fail "DB_USER is required"
[[ -n "$DB_PASS" ]] || fail "DB_PASS is required"

command -v docker >/dev/null 2>&1 || fail "Docker is required for this script"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/backdate-seed.sql"

[[ -f "$SQL_FILE" ]] || fail "Missing SQL file: $SQL_FILE"

echo
color "1;36" "==== Backdating Azure seed data ===="
echo
echo "Server : $DB_SERVER"
echo "DB     : $DB_NAME"
echo

docker run --rm \
  -e DB_SERVER="$DB_SERVER" \
  -e DB_NAME="$DB_NAME" \
  -e DB_USER="$DB_USER" \
  -e DB_PASS="$DB_PASS" \
  -v "$SCRIPT_DIR:/scripts:ro" \
  mcr.microsoft.com/mssql-tools \
  /bin/bash -lc '
    set -euo pipefail

    if [[ -x /opt/mssql-tools18/bin/sqlcmd ]]; then
      SQLCMD=/opt/mssql-tools18/bin/sqlcmd
    else
      SQLCMD=/opt/mssql-tools/bin/sqlcmd
    fi

    # Azure SQL TLS certificate ke liye newer sqlcmd me -C chahiye hota hai.
    # Agar image old sqlcmd use kar rahi ho to fallback without -C try karenge.
    "$SQLCMD" -S "$DB_SERVER" -d "$DB_NAME" -U "$DB_USER" -P "$DB_PASS" -C -b -l 30 -i /scripts/backdate-seed.sql \
      || "$SQLCMD" -S "$DB_SERVER" -d "$DB_NAME" -U "$DB_USER" -P "$DB_PASS" -b -l 30 -i /scripts/backdate-seed.sql
  '

ok "Backdating complete. Open /admin/reports and refresh the reports page."
