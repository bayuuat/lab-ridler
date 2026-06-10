#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DERIVED_DATA_PATH="${HABITQUEST_MAC_DERIVED_DATA_PATH:-${ROOT_DIR}/.build/habitquest-mac}"
APP_PATH="${DERIVED_DATA_PATH}/Build/Products/Debug-maccatalyst/HabitQuest.app"

"${ROOT_DIR}/scripts/build-habitquest-mac.sh"
open "${APP_PATH}"
