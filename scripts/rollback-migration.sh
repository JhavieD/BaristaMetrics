#!/bin/bash
# Migration rollback script for BaristaMetrics
# Usage: ./scripts/rollback-migration.sh <rollback-file.sql>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <rollback-file.sql>"
  echo ""
  echo "Create a rollback file in supabase/rollbacks/ directory"
  echo "Naming convention: YYYYMMDDHHMMSS_rollback_description.sql"
  exit 1
fi

ROLLBACK_FILE="$1"

if [ ! -f "$ROLLBACK_FILE" ]; then
  echo "Error: Rollback file not found: $ROLLBACK_FILE"
  exit 1
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set."
  exit 1
fi

echo "=== Migration Rollback ==="
echo "File: $ROLLBACK_FILE"
echo ""
cat "$ROLLBACK_FILE"
echo ""
read -p "Execute this rollback? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Rollback cancelled."
  exit 0
fi

psql "$SUPABASE_DB_URL" -f "$ROLLBACK_FILE"
echo "Rollback complete."
