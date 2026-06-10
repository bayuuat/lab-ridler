#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HABITQUEST_API_PORT="${HABITQUEST_API_PORT:-3001}"
ANTISLOP_PORT="${ANTISLOP_PORT:-3000}"
HABITQUEST_PUBLIC_BASE_URL="${HABITQUEST_PUBLIC_BASE_URL:-http://127.0.0.1:${HABITQUEST_API_PORT}}"
HABITQUEST_WEBHOOK_URL="${HABITQUEST_WEBHOOK_URL:-${HABITQUEST_PUBLIC_BASE_URL}/api/v1/webhook/external-verify}"

cleanup() {
  if [[ -n "${API_PID:-}" ]]; then kill "${API_PID}" 2>/dev/null || true; fi
  if [[ -n "${ANTISLOP_PID:-}" ]]; then kill "${ANTISLOP_PID}" 2>/dev/null || true; fi
}

trap cleanup EXIT INT TERM

echo "Starting HabitQuest API on ${HABITQUEST_PUBLIC_BASE_URL}"
(
  cd "${ROOT_DIR}/apps/habitquest-api"
  HOST=127.0.0.1 PORT="${HABITQUEST_API_PORT}" PUBLIC_BASE_URL="${HABITQUEST_PUBLIC_BASE_URL}" npm run dev
) &
API_PID=$!

echo "Starting AntiSlop on http://127.0.0.1:${ANTISLOP_PORT}"
(
  cd "${ROOT_DIR}/apps/antislop"
  PORT="${ANTISLOP_PORT}" HABITQUEST_WEBHOOK_URL="${HABITQUEST_WEBHOOK_URL}" pnpm dev
) &
ANTISLOP_PID=$!

while true; do
  if ! kill -0 "${API_PID}" 2>/dev/null; then
    wait "${API_PID}"
    exit $?
  fi

  if ! kill -0 "${ANTISLOP_PID}" 2>/dev/null; then
    wait "${ANTISLOP_PID}"
    exit $?
  fi

  sleep 1
done
