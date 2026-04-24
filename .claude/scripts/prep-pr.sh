#!/usr/bin/env bash
# Pre-PR safety check for Freelens contributions.
# Run before staging commits intended for the upstream OSS repo.
set -euo pipefail

echo "=== Freelens PR Prep Check ==="

CLAUDE_STAGED=$(git diff --cached --name-only | grep "\.claude/" || true)
if [ -n "$CLAUDE_STAGED" ]; then
  echo "ERROR: .claude/ files are staged:"
  echo "$CLAUDE_STAGED"
  echo "Unstage with: git restore --staged .claude/"
  exit 1
fi

echo "Staged files for PR:"
git diff --cached --name-only
echo ""
pnpm lint
pnpm test:unit:core
echo "=== Ready for PR ==="
