#!/usr/bin/env bash
set -euo pipefail

if rg --files-with-matches '<<<<<<<' --glob '!scripts/check-conflicts.sh' >/dev/null; then
  echo "Conflict markers found"
  exit 1
fi

echo "No conflict markers found"
