# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Validation | Zod |
| Testing | Jest 29 + React Testing Library |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Directory Structure

```
app/                    # Next.js App Router pages
  (auth)/login/         # Login page
  admin/                # Admin dashboard
  staff/                # Staff log form
  api/                  # API routes
components/             # React components
  ui/                   # Reusable UI (Button, Select, Pagination, etc.)
  forms/                # Form components
  dashboard/            # Dashboard components
  layout/               # Header, Sidebar
  modals/               # ConfirmDialog, LoadingSkeleton
lib/
  supabase/             # Supabase client, server, middleware
  validations/          # Zod schemas
  utils/                # Constants, helpers, logger
  middleware/            # API wrapper, rate limiter, security headers
hooks/                  # Custom React hooks
types/                  # TypeScript interfaces
__tests__/              # Jest tests
scripts/                # Utility scripts (backup, restore, load test)
docs/                   # Documentation
supabase/               # SQL migrations and triggers
```

## Data Flow

1. **Staff submits log** → `/api/logs` → `daily_logs` table → real-time triggers `current_inventory_status` view update
2. **Admin views inventory** → reads from `current_inventory_status` view → displays calculated stock
3. **Admin creates transfer** → creates deduction log (source) + delivery log (dest) in single transaction
4. **All changes** → audit triggers fire → `audit_log` table updated

## Security Layers

1. **Supabase RLS** — Database-level access control
2. **API Middleware** — Rate limiting, auth verification, security headers
3. **Input Validation** — Zod schemas on all endpoints
4. **Error Boundary** — React error boundaries on all pages
