#!/usr/bin/env bash
set -euo pipefail

# --- helpers ---
prompt() {
  local var_name="$1"
  local msg="$2"
  local secret="${3:-false}"

  if [[ "${secret}" == "true" ]]; then
    read -r -s -p "${msg}: " value
    echo
  else
    read -r -p "${msg}: " value
  fi

  if [[ -z "${value}" ]]; then
    echo "❌ ${var_name} cannot be empty"
    exit 1
  fi

  printf -v "${var_name}" "%s" "${value}"
}

ensure_line_in_file() {
  local line="$1"
  local file="$2"
  mkdir -p "$(dirname "$file")" 2>/dev/null || true
  touch "$file"
  grep -qxF "$line" "$file" || echo "$line" >> "$file"
}

# --- 1) Git global identity ---
git config --global user.email "gary@revrebel.io"
git config --global user.name "RR-Gary-Stringham"
echo "✅ Set global git user.email and user.name"

# --- 2) Initialize git repo if needed ---
if [[ ! -d ".git" ]]; then
  git init
  echo "✅ Initialized git repo"
else
  echo "ℹ️  Git repo already initialized"
fi

# --- 3) Prompt for repo name and token ---
prompt REPO_NAME "Enter repo name (e.g., guestbook-form)"
prompt TOKEN "Enter GitHub access token" true

# --- 4) Write token to .env (idempotent-ish) ---
ENV_FILE="./.env"
touch "$ENV_FILE"

# Remove existing GITHUB_ACCESS_TOKEN line (if any), then add new
grep -v '^GITHUB_ACCESS_TOKEN=' "$ENV_FILE" > "${ENV_FILE}.tmp" || true
mv "${ENV_FILE}.tmp" "$ENV_FILE"
echo "GITHUB_ACCESS_TOKEN=\"${TOKEN}\"" >> "$ENV_FILE"

echo "✅ Wrote GITHUB_ACCESS_TOKEN to .env"

# --- 5) Set remote URL (as requested) ---
# Note: This embeds the token in the origin URL. It's functional but can leak.
REMOTE_URL="https://${TOKEN}@github.com/REVREBEL/${REPO_NAME}.git"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
  echo "✅ Updated origin remote URL"
else
  git remote add origin "$REMOTE_URL"
  echo "✅ Added origin remote URL"
fi

# --- 6) Ensure dev branch ---
# If no commits yet, branch -M still works but HEAD may be unborn; handle gracefully.
git checkout -B dev >/dev/null 2>&1 || true
git branch -M dev
echo "✅ Ensured branch is dev"

# --- 7) Update .gitignore ---
ensure_line_in_file "webflow.json" ".gitignore"
ensure_line_in_file "lost+found/" ".gitignore"
echo "✅ Updated .gitignore"

# --- 8) First commit (optional but helpful) ---
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "chore: initial commit" || true
  echo "✅ Created initial commit"
else
  echo "ℹ️  Repo already has commits; skipping initial commit"
fi

echo
echo "🎉 Repo setup complete."
echo "Next: run 'npm run build:push' to build + commit + push to dev (and open a PR if gh is installed)."
