#!/usr/bin/env bash
set -euo pipefail

CLEAN=false
RUN=false

for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN=true ;;
    --run)   RUN=true ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

if $CLEAN; then
  echo "==> Cleaning build artifacts..."
  pkill -x Freelens 2>/dev/null && sleep 1 || true
  rm -rf .turbo packages/core/dist freelens/dist
fi

echo "==> Building packages..."
pnpm build

echo "==> Packaging Electron app..."
pnpm -w run build:app:dir

if $RUN; then
  APP_PATH="$(find freelens/dist -name 'Freelens.app' -maxdepth 2 | head -1)"
  if [ -z "$APP_PATH" ]; then
    echo "ERROR: Freelens.app not found in freelens/dist" >&2
    exit 1
  fi
  echo "==> Launching $APP_PATH"
  open "$APP_PATH"
fi
