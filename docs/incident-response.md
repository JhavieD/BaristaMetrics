# Incident Response Plan

## Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P0 | Service down, data loss risk | 15 minutes | Database unreachable, auth broken |
| P1 | Major feature broken | 1 hour | Inventory updates failing, transfers broken |
| P2 | Minor feature degraded | 4 hours | Slow response times, UI glitches |
| P3 | Cosmetic / low impact | 24 hours | Minor styling issues, non-critical errors |

## Incident Response Steps

### 1. Detect
- Monitor `/api/health` endpoint
- Check Vercel function logs for error spikes
- Review structured JSON logs for patterns

### 2. Triage
- Determine severity level
- Identify affected users (all, admin, staff, one branch)
- Check if data is at risk

### 3. Mitigate
- **P0/P1:** Enable maintenance mode if needed
- **Database issues:** Check Supabase dashboard for connection pool exhaustion
- **Auth issues:** Verify Supabase Auth status at status.supabase.com
- **API errors:** Check function logs in Vercel dashboard

### 4. Resolve
- Deploy fix via CI/CD pipeline
- Run database rollback if migration caused issue: `./scripts/rollback-migration.sh <file>`
- Restore from backup if data corruption: `./scripts/restore-database.sh <backup>`

### 5. Communicate
- Notify affected users
- Document timeline and root cause
- Update runbook if new failure mode discovered

## Common Issues

### "Unknown error" on delete
**Cause:** Foreign key constraints blocking deletion
**Fix:** API now deletes dependent records first (daily_logs, transfers)

### RLS blocking legitimate requests
**Cause:** JWT expired or user email doesn't match RLS policy
**Fix:** Refresh session, verify admin email matches ADMIN_EMAIL constant

### Rate limiter blocking valid requests
**Cause:** Too many requests in window
**Fix:** Increase rate limit in constants.ts or wait for window reset

## Emergency Contacts

| Role | Contact |
|------|---------|
| Database (Supabase) | Supabase Dashboard support |
| Hosting (Vercel) | Vercel Dashboard support |
| DNS | Domain registrar support |
