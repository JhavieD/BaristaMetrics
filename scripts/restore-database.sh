#!/bin/bash
# Database restore script for BaristaMetrics
# Usage: ./scripts/restore-database.sh <backup-file.sql>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file.sql>"
  echo ""
  echo "Available backups:"
  ls -la ./backups/baristametrics_*.sql 2>/dev/null || echo "  No backups found"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL environment variable is not set."
  exit 1
fi

echo "WARNING: This will overwrite the current database."
read -p "Are you sure? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "Restoring from: $BACKUP_FILE"
psql "$SUPABASE_DB_URL" -f "$BACKUP_FILE"
echo "Restore complete."
