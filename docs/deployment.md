# Deployment Runbook

## Prerequisites

- Node.js 18+
- Vercel account connected to GitHub
- Supabase project with tables and RLS configured
- Environment variables set in Vercel

## Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

| Variable | Where to find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

## Deploy

### Automatic (CI/CD)
Push to `main` branch triggers:
1. Lint + typecheck + tests
2. Build
3. Deploy to Vercel

### Manual
```bash
npm run build
npx vercel --prod
```

## Database Setup (First Deploy)

1. Run base schema SQL in Supabase SQL Editor
2. Run RLS policies SQL
3. Run audit triggers SQL
4. Run the view recreation SQL (for category column)
5. Create admin user in Supabase Auth dashboard

## Post-Deploy Verification

1. Visit `/api/health` — should return `{"status":"healthy"}`
2. Login as admin — should redirect to `/admin`
3. Login as staff — should redirect to `/staff`
4. Test inventory CRUD operations
5. Test log submission
6. Test transfer between branches

## Rollback

If issues found after deploy:
1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

For database rollback:
```bash
./scripts/rollback-migration.sh supabase/rollbacks/<file>.sql
```

## Monitoring

- Health: `GET /api/health`
- Logs: Vercel Dashboard > Functions > Logs
- Errors: Vercel Dashboard > Functions > Error tab
- Database: Supabase Dashboard > Logs
