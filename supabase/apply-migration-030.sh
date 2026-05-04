#!/bin/bash
set -e

MIGRATION_FILE="$(dirname "$0")/030_classroom_expansion.sql"

# Connection params - use Supabase client connection
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://catecismo.kipadmon.com}"

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "Error: SUPABASE_DB_PASSWORD environment variable not set"
  echo "Usage: SUPABASE_DB_PASSWORD=your_password $0"
  exit 1
fi

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

echo "Applying migration 030_classroom_expansion.sql..."
psql \
  -h db.catecismo.kipadmon.com \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f "$MIGRATION_FILE"

echo "Migration applied successfully!"
