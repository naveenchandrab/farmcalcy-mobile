#!/usr/bin/env bash
#
# End-to-end runner for the FarmCalcy auth suite on a booted Android emulator.
#
# Most flows are self-contained, but the password-reset HAPPY path needs the
# REAL one-time code that the backend emails. In local/dev the API delivers mail
# to Mailpit (SMTP :1025, web/API :8025), so this script: requests an OTP through
# the app, reads it back from Mailpit, then feeds it into the reset flow.
#
# Prerequisites:
#   • Android emulator booted, app installed, Metro running (npm start)
#   • farmcalcy-api running on the host (reachable at 10.0.2.2:3000 from the AVD)
#   • Mailpit running (docker compose up in farmcalcy-api) — only for the
#     reset-success happy path
#
# Usage:
#   EMAIL=admin@farmcalcy.com PASSWORD='ChangeMe123@' ./maestro/run-e2e.sh
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EMAIL="${EMAIL:-admin@farmcalcy.com}"
PASSWORD="${PASSWORD:-ChangeMe123@}"
MAILPIT="${MAILPIT:-http://localhost:8025}"

pass=0; fail=0
run() {
  local name="$1"; shift
  echo "▶ $name"
  if maestro test "$@" >/tmp/e2e-"$RANDOM".log 2>&1; then
    echo "  ✓ PASS"; pass=$((pass + 1))
  else
    echo "  ✗ FAIL"; fail=$((fail + 1))
  fi
}

# Pull the most recent 6-digit OTP Mailpit received.
latest_otp() {
  curl -s "$MAILPIT/api/v1/messages?limit=1" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const id=JSON.parse(d).messages[0].ID;
  require('http').get('$MAILPIT/api/v1/message/'+id,r=>{let b='';
    r.on('data',c=>b+=c).on('end',()=>{const m=JSON.parse(b);
      const t=(m.Text||'')+(m.HTML||'');console.log((t.match(/\\b\\d{6}\\b/)||[''])[0]);});});});"
}

echo "=== Login ==="
run "login/empty-form-validation"      "$DIR/login/empty-form-validation.yaml"
run "login/password-visibility-toggle" "$DIR/login/password-visibility-toggle.yaml"
run "login/successful-login"           -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" "$DIR/login/successful-login.yaml"
run "login/invalid-login"              -e EMAIL="$EMAIL" "$DIR/login/invalid-login.yaml"

echo "=== Forgot password ==="
run "forgot/invalid-email-validation"  "$DIR/forgot-password/invalid-email-validation.yaml"
run "forgot/request-otp"               -e EMAIL="$EMAIL" "$DIR/forgot-password/request-otp.yaml"
run "forgot/invalid-otp"               -e EMAIL="$EMAIL" "$DIR/forgot-password/invalid-otp.yaml"

# Reset happy path — capture the real emailed OTP between request and entry.
echo "=== Forgot password (reset happy path, real OTP) ==="
curl -s -X DELETE "$MAILPIT/api/v1/messages" -o /dev/null
if maestro test -e EMAIL="$EMAIL" "$DIR/forgot-password/request-otp.yaml" >/dev/null 2>&1; then
  sleep 2
  OTP="$(latest_otp)"
  echo "  captured OTP: $OTP"
  run "forgot/reset-success"           -e OTP="$OTP" "$DIR/forgot-password/_reset-continue.yaml"
  # Restore the seed password so re-runs keep working.
  curl -s -X DELETE "$MAILPIT/api/v1/messages" -o /dev/null
  maestro test -e EMAIL="$EMAIL" "$DIR/forgot-password/request-otp.yaml" >/dev/null 2>&1
  sleep 2
  curl -s -X POST http://localhost:3000/api/v1/auth/reset-password \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$EMAIL\",\"otp\":\"$(latest_otp)\",\"newPassword\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}" >/dev/null
else
  echo "  ✗ FAIL (could not request OTP)"; fail=$((fail + 1))
fi

echo "=== Session ==="
run "session/session-restore"          -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" "$DIR/session/session-restore.yaml"
run "session/logout"                   -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" "$DIR/session/logout.yaml"

echo
echo "════════════════════════════════"
echo "  PASS: $pass   FAIL: $fail"
echo "════════════════════════════════"
exit $((fail > 0 ? 1 : 0))
