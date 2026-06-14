#!/usr/bin/env bash
# Install STORM git hooks into the CURRENT repo (project-local opt-in).
#
# Sets git core.hooksPath to .githooks/ (relative to repo root). This is
# repo-scoped — does NOT touch your global git config.
#
# Run once per project after `git init`. Idempotent.
#
# Two ways to run:
#   1. From the storm-framework source repo:
#        bash scripts/install-storm-hooks.sh
#   2. From any STORM-using project, after install-to-global.sh ran:
#        bash ~/.claude/storm-githooks/install.sh

set -euo pipefail

# Recognised STORM hook filenames (extend here if new hooks land)
STORM_HOOK_FILES=(commit-msg)

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "✗ Not inside a git repo. Run \`git init\` first." >&2
  exit 1
fi

cd "$REPO_ROOT"

HOOKS_DEST=".githooks"
mkdir -p "$HOOKS_DEST"

# Resolve hook source — try in order:
#   1. ./.githooks/<hook>            (this IS the storm-framework source repo)
#   2. ~/.claude/storm-githooks/<hook>  (global install)
GLOBAL_HOOKS="$HOME/.claude/storm-githooks"
copied=0

for hook in "${STORM_HOOK_FILES[@]}"; do
  if [[ -f "$REPO_ROOT/.githooks/$hook" && ! "$REPO_ROOT/.githooks/$hook" -ef "$HOOKS_DEST/$hook" ]]; then
    # Source repo case — hook is already in place; skip copy. (Covered by guard below.)
    :
  fi
  if [[ -f "$HOOKS_DEST/$hook" ]]; then
    # Already exists locally — nothing to do for this hook
    continue
  fi
  if [[ -f "$GLOBAL_HOOKS/$hook" ]]; then
    cp "$GLOBAL_HOOKS/$hook" "$HOOKS_DEST/$hook"
    chmod +x "$HOOKS_DEST/$hook"
    copied=$((copied + 1))
    continue
  fi
  echo "✗ Hook '$hook' not found in $HOOKS_DEST/ or $GLOBAL_HOOKS/." >&2
  echo "  Run scripts/install-to-global.sh from the storm-framework source repo first," >&2
  echo "  OR copy .githooks/$hook from the source repo manually." >&2
  exit 1
done

# Point this repo's git at .githooks/
git config core.hooksPath "$HOOKS_DEST"

echo "✓ STORM hooks installed for this repo."
echo "  repo:           $REPO_ROOT"
echo "  core.hooksPath: $HOOKS_DEST"
echo "  hooks present:  $(ls "$HOOKS_DEST" 2>/dev/null | tr '\n' ' ')"
if (( copied > 0 )); then
  echo "  ($copied hook(s) copied from $GLOBAL_HOOKS)"
fi
echo ""
echo "  Smoke test (should reject):"
echo "    git commit --allow-empty -m 'storm:META::test - smoke'"
echo "  Expected: hook rejects, no commit created. Then test that --no-verify bypasses."
