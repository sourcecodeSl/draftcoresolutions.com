#!/usr/bin/env bash
#
# Build the frontend and deploy frontend/dist/* to the live site over FTPS.
# Credentials are read from the repo's git config (git-ftp.* keys) so they
# are never hardcoded here. Set them once with:
#   git config git-ftp.url      ftps://draftcoresolutions.com/
#   git config git-ftp.user     draftcoresolutions@draftcoresolutions.com
#   git config git-ftp.password '<password>'
#   git config git-ftp.insecure 1   # server uses a self-signed TLS cert
#
# Usage:
#   ./deploy.sh            build + upload
#   ./deploy.sh --no-build upload existing frontend/dist as-is
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$ROOT/frontend/dist"

# Credentials come from env vars (CI, e.g. GitHub Actions secrets) when set,
# otherwise fall back to the repo's local git config (interactive use).
URL="${FTP_URL:-$(git -C "$ROOT" config git-ftp.url || true)}"
USER="${FTP_USER:-$(git -C "$ROOT" config git-ftp.user || true)}"
PASS="${FTP_PASSWORD:-$(git -C "$ROOT" config git-ftp.password || true)}"
INSECURE_RAW="${FTP_INSECURE:-$(git -C "$ROOT" config --bool git-ftp.insecure 2>/dev/null || echo false)}"
INSECURE_FLAG=""
if [ "$INSECURE_RAW" = "true" ] || [ "$INSECURE_RAW" = "1" ]; then
  INSECURE_FLAG="-k"
fi

if [ -z "$URL" ] || [ -z "$USER" ] || [ -z "$PASS" ]; then
  echo "!! Missing FTP credentials. Set FTP_URL/FTP_USER/FTP_PASSWORD env vars" >&2
  echo "   or git-ftp.{url,user,password} in git config." >&2
  exit 1
fi

# Use explicit TLS on port 21 (ftp:// + --ftp-ssl). The ftps:// scheme would
# force implicit FTPS on port 990, which this server does not accept.
BASE="${URL%/}/"
BASE="ftp://${BASE#*://}"

if [ "${1:-}" != "--no-build" ]; then
  echo ">> Building frontend..."
  ( cd "$ROOT/frontend" && npm run build )
fi

if [ ! -d "$DIST" ]; then
  echo "!! $DIST not found. Build first (omit --no-build)." >&2
  exit 1
fi

echo ">> Uploading $DIST  ->  $BASE"
count=0
failed=()
# Upload every file under dist, preserving relative paths.
# --ftp-create-dirs creates remote directories as needed.
# --retry handles transient FTPS hiccups (e.g. 451); a single bad file
# no longer aborts the whole deploy.
while IFS= read -r -d '' f; do
  rel="${f#"$DIST"/}"
  # normalize Windows backslashes just in case
  rel="${rel//\\//}"
  if curl -sS --fail $INSECURE_FLAG --ftp-ssl --ftp-create-dirs \
       --retry 4 --retry-delay 2 --retry-all-errors \
       --user "$USER:$PASS" \
       -T "$f" "$BASE$rel"; then
    echo "   uploaded: $rel"
    count=$((count + 1))
  else
    echo "   FAILED:   $rel" >&2
    failed+=("$rel")
  fi
done < <(find "$DIST" -type f -print0)

echo ">> Done. $count file(s) deployed to $BASE"
if [ "${#failed[@]}" -gt 0 ]; then
  echo "!! ${#failed[@]} file(s) failed:" >&2
  printf '   - %s\n' "${failed[@]}" >&2
  exit 1
fi
