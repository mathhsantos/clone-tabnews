#!/usr/bin/env sh
set -eu

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

STAGED_FILES="$(git diff --cached --name-only --diff-filter=ACMR)"
if [ -z "$STAGED_FILES" ]; then
  echo "No staged files to scan for secrets."
  exit 0
fi

printf '%s\n' "$STAGED_FILES" | while IFS= read -r file; do
  [ -z "$file" ] && continue
  mkdir -p "$TMP_DIR/$(dirname "$file")"
  git show ":$file" > "$TMP_DIR/$file"
done

if command -v gitleaks >/dev/null 2>&1; then
  gitleaks dir "$TMP_DIR" --config "$PROJECT_ROOT/.gitleaks.toml"
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  docker run --rm \
    -v "$TMP_DIR:/scan:ro" \
    -v "$PROJECT_ROOT/.gitleaks.toml:/config/.gitleaks.toml:ro" \
    ghcr.io/gitleaks/gitleaks:latest \
    dir /scan --config /config/.gitleaks.toml
  exit 0
fi

echo "gitleaks not found. Install gitleaks or Docker to run secret scanning pre-commit hook."
exit 1
