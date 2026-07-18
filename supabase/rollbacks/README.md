# Migration Rollbacks

Place rollback SQL files here.

## Naming Convention
`YYYYMMDDHHMMSS_rollback_description.sql`

## Example
`20250101120000_rollback_add_category_column.sql`
```sql
ALTER TABLE inventory_master DROP COLUMN IF EXISTS category;
```

## Usage
```bash
./scripts/rollback-migration.sh supabase/rollbacks/YYYYMMDDHHMMSS_rollback_description.sql
```
