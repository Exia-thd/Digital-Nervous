#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Ensures Digital-Nervous local memory (mem0-cli) is initialized
# in the host project (.Digital-Nervous/memory.jsonl).
#
# Usage (from host project):
#   bash <path-to-Digital-Nervous>/scripts/ensure-mem0.sh [PROJECT_ROOT]
#   ./Digital-Nervous/scripts/ensure-mem0.sh
#
# If PROJECT_ROOT is omitted: same resolution as mcp-generate.sh (sibling of
# this repo with a .git, else this repo root).
#
# Skip (CI / headless only): Digital-Nervous_SKIP_MEM0=1
# ─────────────────────────────────────────────────────────

set -euo pipefail

if [ "${Digital-Nervous_SKIP_MEM0:-}" = "1" ]; then
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
Digital-Nervous_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -n "${1:-}" ]; then
  PROJECT_ROOT="$(cd "$1" && pwd)"
else
  if [ -f "${Digital-Nervous_DIR}/../.git" ] || [ -d "${Digital-Nervous_DIR}/../.git" ]; then
    PROJECT_ROOT="$(cd "${Digital-Nervous_DIR}/.." && pwd)"
  else
    PROJECT_ROOT="$Digital-Nervous_DIR"
  fi
fi

MEMORY_FILE="${PROJECT_ROOT}/.Digital-Nervous/memory.jsonl"
MEM0_CLI="${Digital-Nervous_DIR}/scripts/mem0-cli.py"

if [ -f "$MEMORY_FILE" ]; then
  exit 0
fi

if ! command -v python3 &>/dev/null; then
  echo "[Digital-Nervous] mem0 requires python3. Install Python 3 and re-run:" >&2
  echo "  bash ${Digital-Nervous_DIR}/scripts/ensure-mem0.sh" >&2
  exit 1
fi

if [ ! -f "$MEM0_CLI" ]; then
  echo "[Digital-Nervous] Missing mem0 CLI at ${MEM0_CLI}" >&2
  exit 1
fi

(
  cd "$PROJECT_ROOT"
  python3 "$MEM0_CLI" setup
)

if [ ! -f "$MEMORY_FILE" ]; then
  echo "[Digital-Nervous] mem0 setup did not create ${MEMORY_FILE}" >&2
  exit 1
fi

echo "[Digital-Nervous] mem0 initialized (.Digital-Nervous/memory.jsonl). Run: python3 ${MEM0_CLI} refresh" >&2
