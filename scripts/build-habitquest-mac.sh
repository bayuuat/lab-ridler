#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DERIVED_DATA_PATH="${HABITQUEST_MAC_DERIVED_DATA_PATH:-${ROOT_DIR}/.build/habitquest-mac}"
CODE_SIGNING_ALLOWED_VALUE="${HABITQUEST_CODE_SIGNING_ALLOWED:-NO}"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"

xcodebuild \
  -project "${ROOT_DIR}/apps/habitquest-ios/HabitQuest.xcodeproj" \
  -scheme HabitQuest \
  -destination "platform=macOS,variant=Mac Catalyst" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  CODE_SIGNING_ALLOWED="${CODE_SIGNING_ALLOWED_VALUE}" \
  build

APP_PATH="${DERIVED_DATA_PATH}/Build/Products/Debug-maccatalyst/HabitQuest.app"

echo
echo "HabitQuest Mac app built:"
echo "${APP_PATH}"
