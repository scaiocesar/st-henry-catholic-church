#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
SCHEMA_FILE="$BACKUP_DIR/sync_schema_${TIMESTAMP}.sql"
DATA_FILE="$BACKUP_DIR/sync_data_${TIMESTAMP}.sql"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env file at $ENV_FILE"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found in PATH"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found in PATH"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set in .env"
  exit 1
fi

if [[ -z "${SUPPA_URL:-}" ]]; then
  echo "SUPPA_URL is not set in .env"
  exit 1
fi

TARGET_URL="$SUPPA_URL"
if [[ -n "${SUPPA_POOLER_URL:-}" ]]; then
  TARGET_URL="$SUPPA_POOLER_URL"
fi

TARGET_HOST="$(python3 - "$TARGET_URL" <<'PY'
import sys, urllib.parse
u = sys.argv[1] if len(sys.argv) > 1 else ""
print(urllib.parse.urlparse(u).hostname or "")
PY
)"

if [[ -z "$TARGET_HOST" ]]; then
  echo "Could not parse host from destination URL."
  echo "Check SUPPA_URL (or SUPPA_POOLER_URL) in .env"
  exit 1
fi

HOST_IPS="$(dig +short "$TARGET_HOST" 2>/dev/null || true)"
if [[ -z "${HOST_IPS// }" ]]; then
  echo "Could not resolve destination host: $TARGET_HOST"
  echo "If using Supabase, prefer the pooler connection string from Dashboard > Connect."
  echo "Set it as SUPPA_POOLER_URL in .env and run again."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Generating schema-only dump..."
pg_dump \
  --schema-only \
  --format=plain \
  --no-owner \
  --no-privileges \
  --schema=public \
  --file="$SCHEMA_FILE" \
  "$DATABASE_URL"

# SQL editors and managed DBs already have public schema.
perl -0pi -e 's/CREATE SCHEMA public;/CREATE SCHEMA IF NOT EXISTS public;/g' "$SCHEMA_FILE"

echo "Generating data-only dump..."
pg_dump \
  --data-only \
  --format=plain \
  --no-owner \
  --no-privileges \
  --schema=public \
  --inserts \
  --column-inserts \
  --file="$DATA_FILE" \
  "$DATABASE_URL"

echo "Applying schema to destination..."
psql "$TARGET_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE" >/dev/null

echo "Truncating existing public tables..."
TABLE_LIST="$(psql "$TARGET_URL" -Atqc "SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') FROM pg_tables WHERE schemaname='public';")"
if [[ -n "$TABLE_LIST" ]]; then
  psql "$TARGET_URL" -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE $TABLE_LIST RESTART IDENTITY CASCADE;" >/dev/null
fi

echo "Applying data to destination..."
psql "$TARGET_URL" -v ON_ERROR_STOP=1 -f "$DATA_FILE" >/dev/null

echo ""
echo "Sync finished successfully."
echo "Schema dump: $SCHEMA_FILE"
echo "Data dump:   $DATA_FILE"
