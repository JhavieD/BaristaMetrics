#!/bin/bash
# Database backup script for BaristaMetrics
# Usage: ./scripts/backup-database.sh
# Requires: SUPABASE_DB_URL environment variable

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/baristametrics_${TIMESTAMP}.sql"

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set."
  echo "Find it in Supabase Dashboard > Settings > Database > Connection string"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting backup..."
pg_dump "$SUPABASE_DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  -f "$BACKUP_FILE"

echo "Backup saved to: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Keep only last 30 backups
cd "$BACKUP_DIR"
ls -t baristametrics_*.sql 2>/dev/null | tail -n +31 | xargs -r rm
echo "Cleanup complete. Keeping last 30 backups."
