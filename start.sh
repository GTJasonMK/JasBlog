#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$REPO_ROOT"

exec npm run dev -- "$@"
