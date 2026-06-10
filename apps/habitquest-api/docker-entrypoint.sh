#!/usr/bin/env sh
set -eu

DB_PATH="${HABITQUEST_SQLITE_PATH:-/data/habitquest/dev.db}"
DB_DIR="$(dirname "$DB_PATH")"

mkdir -p "$DB_DIR"
sqlite3 "$DB_PATH" ".read prisma/migrations/20260606081500_init/migration.sql"

exec "$@"
