#!/usr/bin/env bash
set -euo pipefail

# Load .env if present (simple parser)
if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source .env || true
fi

BRANCH="dev"
BASE_BRANCH="${BASE_BRANCH:-main}"

# 1) Make sure we're on dev
git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"

# 2) Pull latest (avoid non-fast-forward)
# If remote dev doesn't exist yet, this will fail; ignore in that case.
git fetch origin >/dev/null 2>&1 || true
git pull --rebase origin "$BRANCH" >/dev/null 2>&1 || true

# 3) Run build
npm run build

# 4) Commit changes (if any)
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit after build."
else
  git add -A
  COMMIT_MSG="${COMMIT_MSG:-"chore(build): build output $(date -u +'%Y-%m-%dT%H:%M:%SZ')"}"
  git commit -m "$COMMIT_MSG"
  echo "✅ Committed: $COMMIT_MSG"
fi

# 5) Push to dev
git push -u origin "$BRANCH"

# 6) Optional PR creation via GitHub CLI (gh)
if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE:-"Build update"}"
  PR_BODY="${PR_BODY:-"Automated build + push from npm script."}"

  # Create PR if one doesn't already exist
  if gh pr view --head "$BRANCH" >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for $BRANCH"
  else
    gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$PR_TITLE" --body "$PR_BODY" || true
    echo "✅ PR created (or attempted) via gh"
  fi
else
  echo "ℹ️  'gh' not found. Skipping PR creation."
  echo "    Install: https://github.com/cli/cli (or your package manager)"
fi
