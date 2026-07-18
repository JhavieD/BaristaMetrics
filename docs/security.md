# Security Architecture

## Authentication
- Supabase Auth (email/password)
- JWT tokens for API access
- Session stored in browser (Supabase client handles refresh)

## Authorization (RLS)

### Admin (jana@admin.com)
- Full CRUD on all tables
- Access to audit log, user activity
- Can manage users, run transfers

### Staff (all other users)
- SELECT on inventory, logs
- INSERT on daily_logs only
- Branch-scoped (can only submit for assigned branch)
- Cannot update, delete, or access admin features

## API Security

### Rate Limiting
- General: 100 requests/15 min per IP
- Admin: 10 requests/5 min per IP
- Auth: 5 requests/5 min per IP

### Security Headers
- CSP: Blocks XSS, clickjacking
- HSTS: Forces HTTPS
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- CORS: Restricted to app domain

### Input Validation
- All API inputs validated with Zod schemas
- Branch IDs whitelisted
- Quantities must be positive
- Email format validated

## Data Protection
- Service role key server-side only (never exposed to client)
- Admin email hardcoded in RLS (not user-configurable)
- Passwords hashed by Supabase (never visible to anyone)
- Audit trail on all data modifications

## Incident Response
See `docs/incident-response.md`

## Known Limitations (MVP)
- Single admin account (hardcoded email)
- No 2FA
- No password complexity beyond 8 chars
- No failed login lockout
- No IP-based blocking (rate limit only)
