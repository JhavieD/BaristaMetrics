# BaristaMetrics (MVP Master Development File)

This is the definitive master plan, project scope, and reference architecture file for **BaristaMetrics**. This single file serves as the core context blueprint whenever building out new modules, frontend interfaces, backend API routes, or database configurations from scratch.

> **Status (Phase 1 Complete):** Core MVP is built and functional. See Section 17 for Phase 2 remaining work.

---

## 1. Tech Stack & Architecture Overview

*   **Frontend Framework:** Next.js 16 (React App Router) + Tailwind CSS v4 (Custom, mobile-first design) ✅
*   **Backend-as-a-Service (BaaS):** Supabase (PostgreSQL Database + Authentication) ✅
*   **Security Protocol:** Supabase Row-Level Security (RLS) policies ✅
*   **AI Engine Layer:** Direct OpenAI API integration via serverless Next.js API Routes ⏸️ Skipped (no API key)
*   **Validation Layer:** Zod schemas for API input/output validation ✅
*   **State Management:** React Context + Supabase real-time subscriptions ✅
*   **Data Fetching:** Supabase client-side queries + React hooks (raw useState/useEffect) ✅ (no React Query/SWR)
*   **Error Tracking:** Client-side toast notifications + server-side structured logging ✅
*   **Testing:** Jest 29.7 + React Testing Library (127+ tests) ✅ (no Cypress)
*   **CI/CD:** GitHub Actions (ci.yml + deploy.yml) ✅
*   **Hosting:** Vercel (serverless functions + edge middleware)
*   **CDN:** Vercel Edge Network for static assets
*   **Monitoring:** Structured logging + health check endpoint ✅ (no Vercel Analytics)
*   **Offline Support:** OfflineBanner component ✅ (no service worker/IndexedDB yet — Phase 2)

---

## 2. Project Structure

> **Status:** Actual file tree as built. Items marked ⏸️ are Phase 2.

```
baristaMetrics/
├── app/
│   ├── layout.tsx                  # Root layout (providers, fonts, metadata) ✅
│   ├── page.tsx                    # Landing/redirect page ✅
│   ├── error.tsx                   # Root error boundary ✅
│   ├── not-found.tsx               # 404 page ✅
│   ├── (auth)/
│   │   └── login/page.tsx          # Staff/admin login ✅
│   │   └── register/page.tsx       # Staff registration (admin-only) ⏸️ Phase 2
│   ├── staff/
│   │   ├── layout.tsx              # Staff dashboard layout (conditional sidebar for admin) ✅
│   │   ├── page.tsx                # Staff log submission form ✅
│   │   └── error.tsx               # Staff error boundary ✅
│   └── admin/
│       ├── layout.tsx              # Admin dashboard layout ✅
│       ├── page.tsx                # Admin inventory audit grid ✅
│       ├── users/page.tsx          # Staff management (add/remove/branch assign) ✅
│       ├── transfers/page.tsx      # Cross-branch transfer management ✅
│       ├── analytics/page.tsx      # Monitoring dashboard + CSV export ✅
│       ├── audit/page.tsx          # Audit log viewer (paginated) ✅
│       ├── error.tsx               # Admin error boundary ✅
│       └── audit/error.tsx         # Audit page error boundary ✅
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Reusable button ✅
│   │   ├── Card.tsx                # Reusable card ✅
│   │   ├── ErrorBoundary.tsx       # React error boundary with retry ✅
│   │   ├── Input.tsx               # Reusable input ✅
│   │   ├── Pagination.tsx          # Reusable pagination with ellipsis ✅
│   │   ├── Select.tsx              # Reusable select ✅
│   │   └── Toast.tsx               # Toast notification system ✅
│   ├── forms/
│   │   ├── StaffLogForm.tsx        # Staff inventory log submission ✅
│   │   └── InventoryEditRow.tsx    # Admin editable inventory row ⏸️ Phase 2
│   │   └── TransferForm.tsx        # Cross-branch transfer form ⏸️ Phase 2
│   ├── dashboard/
│   │   ├── BranchToggle.tsx        # Jaen/Mallorca/San Antonio branch switcher ✅
│   │   ├── InventoryGrid.tsx       # Admin calculation ledger (sortable, category filter, real-time) ✅
│   │   └── AIForensicButton.tsx    # AI audit trigger button (frontend only, no backend) ⏸️
│   ├── analytics/                  # ⏸️ Phase 2 — currently inline in analytics page
│   │   ├── SummaryCards.tsx        # Key metrics overview
│   │   ├── ConsumptionChart.tsx    # Line/bar chart (not just progress bars)
│   │   └── VarianceReport.tsx      # Expected vs actual comparison
│   ├── layout/
│   │   ├── Header.tsx              # App header with brand mark, dark mode toggle ✅
│   │   └── Sidebar.tsx             # Navigation sidebar (grouped sections) ✅
│   ├── modals/
│   │   ├── ConfirmDialog.tsx       # Reusable confirmation modal ✅
│   │   └── LoadingSkeleton.tsx     # Skeleton loading states ✅
│   ├── offline/
│   │   └── OfflineBanner.tsx       # Network status indicator ✅
│   │   └── QueueStatus.tsx         # Pending submissions counter ⏸️ Phase 2
│   ├── Providers.tsx               # App-wide providers (React Query, Theme) ✅
│   └── ThemeContext.tsx             # Dark/light mode context ✅
├── hooks/
│   ├── useBranch.ts                # Current branch context hook ✅
│   ├── useDailyLogs.ts             # Daily logs data fetching hook ✅
│   ├── useInventory.ts             # Inventory data fetching hook ✅
│   ├── useRealtime.ts              # Supabase Realtime subscription hook ✅
│   ├── useTransfers.ts             # Transfer data fetching hook ⏸️ Phase 2
│   ├── useActivity.ts              # User activity data hook ⏸️ Phase 2
│   ├── useOfflineQueue.ts          # Offline submission queue hook ⏸️ Phase 2
│   └── useAnalytics.ts             # Analytics data fetching hook ⏸️ Phase 2
├── types/
│   ├── inventory.ts                # All TS interfaces (inventory, logs, transfers) ✅
│   └── api.ts                      # API response/error types ✅
│   ├── activity.ts                 # TypeScript interfaces for user activity ⏸️ Phase 2
│   ├── logs.ts                     # TypeScript interfaces for logs ⏸️ Phase 2
│   ├── transfers.ts                # TypeScript interfaces for transfers ⏸️ Phase 2
│   └── analytics.ts                # TypeScript interfaces for analytics ⏸️ Phase 2
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser-side Supabase client (singleton) ✅
│   │   ├── server.ts               # Server-side Supabase client ✅
│   │   └── middleware.ts           # Auth middleware for protected routes ✅
│   ├── validations/
│   │   └── inventory.ts            # All Zod schemas (inventory, logs, transfers) ✅
│   │   ├── activity.ts             # Zod schemas for user activity ⏸️ Phase 2
│   │   ├── analytics.ts            # Zod schemas for analytics queries ⏸️ Phase 2
│   │   └── auth.ts                 # Zod schemas for authentication ⏸️ Phase 2
│   ├── utils/
│   │   ├── constants.ts            # Branch IDs, item categories, units ✅
│   │   ├── helpers.ts              # Formatting, calculation helpers ✅
│   │   ├── errors.ts               # Custom error classes (AppError) ✅
│   │   ├── activity.ts             # Client-side activity logging helper ✅
│   │   └── logger.ts               # Structured server-side logger ✅
│   └── middleware/
│       ├── api-wrapper.ts          # Rate limiting + security headers + logging ✅
│       ├── error-handler.ts        # Global API error handler ✅
│       ├── rate-limiter.ts         # Rate limiting configuration ✅
│       ├── security-headers.ts     # CSP and security headers ✅
│       └── request-logger.ts       # Structured request logging ✅
├── app/api/
│   ├── inventory/
│   │   ├── route.ts                # GET inventory, POST new items (admin) ✅
│   │   └── [itemId]/route.ts       # PUT, DELETE single item (admin) ✅
│   │   └── [itemId]/route.ts       # GET single item ⏸️ Phase 2
│   ├── logs/
│   │   ├── route.ts                # GET logs, POST new log (staff) ✅
│   │   └── [logId]/route.ts        # GET single log ⏸️ Phase 2
│   ├── transfers/
│   │   └── route.ts                # POST new transfer (admin) ✅
│   │   └── route.ts                # GET transfers ⏸️ Phase 2
│   ├── audit/
│   │   └── route.ts                # GET audit log (paginated) ✅
│   │   └── route.ts                # POST AI forensic audit ⏸️ Skipped (no OpenAI key)
│   ├── users/
│   │   ├── route.ts                # GET users, POST invite staff (admin) ✅
│   │   └── [userId]/route.ts       # DELETE remove staff (admin) ✅
│   ├── activity/
│   │   └── route.ts                # GET user activity (admin, paginated) ✅
│   └── health/
│       └── route.ts                # GET health check (DB latency, stats) ✅
├── middleware.ts                    # Root Next.js middleware (security headers) ✅
├── docs/
│   ├── api-reference.md            # API endpoint documentation ✅
│   ├── architecture.md             # Architecture documentation ✅
│   ├── deployment.md               # Deployment guide ✅
│   ├── email-templates.md          # Email notification templates ✅
│   ├── incident-response.md        # Incident response procedures ✅
│   ├── security.md                 # Security documentation ✅
│   ├── user-guide-admin.md         # Admin user manual ✅
│   └── user-guide-staff.md         # Staff user manual ✅
├── scripts/
│   ├── backup-database.sh          # Database backup script ✅
│   ├── restore-database.sh         # Database restore script ✅
│   ├── rollback-migration.sh       # Migration rollback script ✅
│   └── load-test.sh                # Bash load test script ✅
├── supabase/
│   ├── seed-all-branches.sql       # Seed data (3 branches) ✅
│   ├── add-category-column.sql     # Add category column migration ✅
│   ├── clear-all-data.sql          # Clear all data script ✅
│   ├── audit-triggers.sql          # Audit trigger functions ✅
│   └── rollbacks/README.md         # Migration rollback directory ✅
├── .github/workflows/
│   ├── ci.yml                      # CI pipeline (lint/typecheck/test/build) ✅
│   └── deploy.yml                  # CD pipeline (CI + Vercel deploy) ✅
├── __tests__/                      # 127+ tests ✅
│   ├── utils/helpers.test.ts
│   ├── validations/inventory.test.ts
│   ├── constants.test.ts
│   ├── api/inventory.test.ts
│   ├── api/logs.test.ts
│   ├── api/transfers.test.ts
│   ├── components/StaffLogForm.test.tsx
│   ├── database/schema.test.ts
│   ├── database/view-calculations.test.ts
│   ├── database/rls-policies.test.ts
│   ├── load/concurrent-submissions.test.ts
│   └── load/rate-limiter.test.ts
├── public/sw.js                    # Service worker for offline caching ⏸️ Phase 2
├── .env.example                    # Environment variable template ✅
├── next.config.ts                  # Next.js configuration (poweredByHeader: false) ✅
├── tsconfig.json                   # TypeScript configuration ✅
├── jest.config.js                  # Jest testing config ✅
├── postcss.config.mjs              # PostCSS config (Tailwind v4) ✅
└── eslint.config.mjs               # ESLint config ✅
```

---

## 3. Database Schema & RLS Setup

Execute the following idempotent script inside the Supabase SQL Editor to create tables, real-time tracking views, and secure access permissions. The admin email identifier is hardcoded as `jana@admin.com`.

### 3.1 Core Tables

**inventory_master** - Master ingredient list per branch
*   `item_id` (SERIAL PRIMARY KEY)
*   `branch_id` (VARCHAR(50), NOT NULL) - Multi-branch segmentation (`jaen`, `mallorca`, `san-antonio`)
*   `item_name` (VARCHAR(100), NOT NULL)
*   `unit` (VARCHAR(20), NOT NULL) - `packs` (default, hidden from UI)
*   `category` (VARCHAR(20), NOT NULL) - `powder`, `liquid`, `addon` — for filtering in inventory grid
*   `starting_stock` (NUMERIC(10,2), DEFAULT 0.00)
*   `actual_physical_count` (NUMERIC(10,2), NULL) - Admin-entered physical count
*   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)
*   UNIQUE CONSTRAINT on (branch_id, item_name)

**daily_logs** - Transaction log for deductions and deliveries
*   `log_id` (SERIAL PRIMARY KEY)
*   `branch_id` (VARCHAR(50), NOT NULL)
*   `item_id` (INT, FK REFERENCES inventory_master.item_id)
*   `log_type` (VARCHAR(20), CHECK IN `deduction`, `delivery`)
*   `quantity_opened` (NUMERIC(10,2), NOT NULL)
*   `logged_by` (VARCHAR(100), NOT NULL) - Staff email stamp
*   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

**audit_log** - System-wide change tracking (admin-only visibility)
*   `audit_id` (SERIAL PRIMARY KEY)
*   `table_name` (VARCHAR(50), NOT NULL)
*   `operation` (VARCHAR(10), NOT NULL) - INSERT, UPDATE, DELETE
*   `user_email` (VARCHAR(100), NOT NULL)
*   `old_data` (JSONB, NULL)
*   `new_data` (JSONB, NULL)
*   `timestamp` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

**user_activity** - User session and feature usage tracking (admin-only visibility)
*   `activity_id` (SERIAL PRIMARY KEY)
*   `user_email` (VARCHAR(100), NOT NULL)
*   `activity_type` (VARCHAR(50), NOT NULL) - login, logout, password_change, export, ai_audit
*   `details` (JSONB, NULL) - Additional context (IP, duration, etc.)
*   `timestamp` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

**transfers** - Cross-branch stock transfers (admin-only)
*   `transfer_id` (SERIAL PRIMARY KEY)
*   `source_branch` (VARCHAR(50), NOT NULL)
*   `destination_branch` (VARCHAR(50), NOT NULL)
*   `item_id` (INT, FK REFERENCES inventory_master.item_id)
*   `quantity` (NUMERIC(10,2), NOT NULL)
*   `initiated_by` (VARCHAR(100), NOT NULL) - Admin email
*   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP)

### 3.2 Real-Time Inventory View

**current_inventory_status** - Calculated view showing live stock balances
*   Reads from `inventory_master` LEFT JOIN `daily_logs`
*   Calculates `total_deducted` (SUM of deduction logs)
*   Calculates `total_added` (SUM of delivery logs)
*   Computes `expected_remaining_stock` = starting_stock + total_added - total_deducted
*   Displays `actual_physical_count` for admin comparison

### 3.3 Row-Level Security Policies

**inventory_master policies:**
*   `Allow authenticated to view inventory` - SELECT for all authenticated users
*   `Allow admin to modify inventory` - ALL operations restricted to `jana@admin.com`

**daily_logs policies:**
*   `Allow authenticated to view daily logs` - SELECT for all authenticated users
*   `Allow staff to insert logs with identity enforcement` - INSERT only, `logged_by` must match `auth.jwt() ->> 'email'`
*   `Allow admin full control over logs` - ALL operations restricted to `jana@admin.com`

**audit_log policies:**
*   `Allow admin to view audit log` - SELECT restricted to `jana@admin.com`
*   `System inserts audit records` - INSERT via trigger functions only

**user_activity policies:**
*   `Allow admin to view activity` - SELECT restricted to `jana@admin.com`
*   `System inserts activity records` - INSERT via trigger functions only

**transfers policies:**
*   `Allow authenticated to view transfers` - SELECT for all authenticated users
*   `Allow admin to manage transfers` - ALL operations restricted to `jana@admin.com`

### 3.4 Database Validation Constraints

*   `chk_starting_stock_non_negative` - starting_stock must be >= 0
*   `chk_quantity_positive` - quantity_opened must be > 0
*   `chk_log_type_valid` - log_type restricted to `deduction` or `delivery`

### 3.5 Performance Indexes

*   `idx_daily_logs_branch_created` - Composite index on (branch_id, created_at DESC) for filtered log queries
*   `idx_inventory_branch_item` - Composite index on (branch_id, item_name) for inventory lookups
*   `idx_user_activity_email_timestamp` - Composite index on (user_email, timestamp DESC) for activity lookups
*   `idx_transfers_branch` - Composite index on (source_branch, destination_branch) for transfer history

### 3.6 Audit Triggers

*   `after_inventory_changes` - Fires on INSERT/UPDATE/DELETE of inventory_master, logs to audit_log
*   `after_logs_changes` - Fires on INSERT/UPDATE/DELETE of daily_logs, logs to audit_log
*   `after_user_activity` - Fires on login/logout events, logs to user_activity table
*   `after_transfer_complete` - Fires on successful transfer, logs to transfers table

---

## 4. Testing Area: Big Brew Menu Seed Data

Run this block inside the Supabase SQL Editor to insert authentic storefront ingredients and sample transactions for verification testing.

**Seeded Ingredients (all 3 branches — jaen, mallorca, san-antonio):**

**Powder category:**
*   Okinawa Powder (15 packs)
*   Matcha Powder (10 packs)
*   Cheesecake Powder (12 packs)
*   Dark Choco Powder (15 packs)
*   Red Velvet Powder (8 packs)

**Liquid category:**
*   Fructose Syrup (25 packs)
*   Tapioca Pearls (30 packs)

**Addon category:**
*   (empty — admin adds per branch)

**Sample Logs:**
*   Staff member1 deducted 1.0 Okinawa Powder
*   Staff member2 deducted 2.0 Dark Choco Powder
*   Admin delivered 10.0 Dark Choco Powder

---

## 5. Role-Based Access Control (RBAC) Requirements

### 5.1 Staff Layer (Add-Only) ✅ Implemented

*   **Permitted:** SELECT (view menu items), INSERT (record log entries) ✅
*   **Blocked:** UPDATE, DELETE (protects historical raw logs from tampering) ✅
*   **Identity Enforcement:** `logged_by` field auto-populated from JWT email, cannot be overridden ✅
*   **Branch Scope:** Staff can only submit logs for their assigned branch ✅
*   **Log Limits:** Maximum 50 log submissions per shift (configurable) ⏸️ Phase 2
*   **Offline Support:** Queue submissions when offline, sync when online ⏸️ Phase 2
### 5.2 Admin Layer (Owner Override) ✅ Implemented

*   **Permitted:** ALL PRIVILEGES on all tables ✅
*   **Access Restriction:** Hardcoded to `jana@admin.com` via RLS policies ✅
*   **Capabilities:** Full CRUD, audit log access, user management ✅
*   **Audit Trail:** All admin actions logged to audit_log table ✅
*   **Batch Operations:** Bulk inventory updates, bulk log corrections ⏸️ Phase 2
*   **System Settings:** Configure thresholds, notification preferences, branches ⏸️ Phase 2
### 5.3 Authentication Flow ✅ Implemented (core)

*   Staff logs in via Supabase Auth (email/password) ✅
*   JWT token contains email used for RLS policy enforcement ✅
*   Protected routes redirect unauthenticated users to login ✅
*   Admin-only routes check email claim before rendering ✅
*   Social login (Google) available for convenience ⏸️ Phase 2
*   Magic link login for passwordless option ⏸️ Phase 2
*   Email verification required for new accounts ⚠️ Relies on Supabase defaults
*   Session refresh on token expiry ✅ (Supabase SDK handles)
### 5.4 Password Policy ⏸️ Phase 2

*   Minimum 8 characters required ✅ (enforced in loginSchema)
*   Must contain at least one uppercase letter ⏸️ Phase 2
*   Must contain at least one number ⏸️ Phase 2
*   Password reset via Supabase Auth magic link ⏸️ Phase 2
*   Admin cannot view staff passwords (hashed by Supabase) ✅ (Supabase default)
*   Password history: Prevent reuse of last 5 passwords ⏸️ Phase 2
*   Password expiry: 90 days (optional, admin-configurable) ⏸️ Phase 2
*   Account lockout: 5 failed attempts = 15 minute lockout ⏸️ Phase 2
### 5.5 Session Management ⏸️ Phase 2 (most features)

*   Session timeout: 24 hours (configurable via Supabase dashboard) ✅ (Supabase default)
*   Refresh token rotation on active use ✅ (Supabase default)
*   Concurrent session limit: 3 devices per user ⏸️ Phase 2
*   Forced logout on password change ⏸️ Phase 2
*   Session invalidation on admin account removal ⏸️ Phase 2
*   Session activity tracking (last active timestamp) ✅ (uses `last_sign_in_at`)
*   Device fingerprinting for session management ⏸️ Phase 2
*   Session export for security audit ⏸️ Phase 2
### 5.6 Two-Factor Authentication (2FA) — Post-MVP ⏸️

*   TOTP-based 2FA for admin accounts (post-MVP)
*   Backup recovery codes generated on 2FA enable
*   2FA enforced on admin login for enhanced security
*   Staff 2FA optional per admin preference
*   2FA setup wizard with QR code generation
*   2FA bypass prevention (cannot disable without verification)
*   2FA audit logging (setup, disable, recovery code use)

---

## 6. Frontend UI Layout Specs (Simple English UI)

The frontline interface relies entirely on clear, operational instructions customized to avoid database terminology.

### 6.1 Staff Form Panel (Mobile-First Layout) ✅ Implemented

*   **Location Picker:** Dropdown selector defaulting to active storefront context ✅ (auto-detected from session; admin gets branch picker)
*   **Action Toggle Cards:** Large visual tap boxes: ✅
    *   "Used / Refill" (Maps to database `deduction`) ✅
    *   "New Delivery" (Maps to database `delivery`) ✅
*   **Ingredient Target Input:** Labeled as *Ingredients - Particulars*. Searchable dropdown with category tabs (Powder/Liquid/Addons) ✅
*   **Quantity Entry Split-Row:** Labeled as *Quantity Opened*. Side-by-side layout: ✅
    *   **Left:** Decimal numeric text field (e.g., `6.0`) ✅
    *   **Right:** Unit picker dropdown (`KG`, `grams`, `per pack`) ⏸️ Removed — defaults to `packs`
*   **Submission Button:** High-contrast `SUBMIT LOG TO JANA` ✅
*   **Confirmation Feedback:** Success toast with log summary after submission ✅
*   **Loading State:** Button shows spinner + "Submitting..." text during API call ✅
*   **Empty State:** Friendly message when no inventory items exist yet for selected branch ✅

### 6.2 Admin Balance Audit Interface ✅ Implemented

*   **Branch View Toggle:** Instant dynamic filter to switch between branches ✅
*   **Category Filter:** Dropdown filter for Powder/Liquid/Addons ✅
*   **Sortable Columns:** Click-to-sort on Name, Starting, Added, Deducted, Expected, Physical Count ✅
*   **Calculation Ledger Grid:** Reads from `current_inventory_status` view: ✅
    *   *Expected Remaining* (or *Dapat Meron Pa*) - read-only calculated field ✅
    *   *Actual Physical Count* - editable input for admin physical inventory check ✅
    *   *Variance Indicator* - highlights discrepancies between expected vs actual ✅
    *   *Skeleton Loading:* Shows placeholder rows while data fetches ✅
    *   *Empty State:* "No inventory items yet. Add ingredients to get started." ✅
*   **Real-Time Updates:** Supabase Realtime subscription with "Live" badge ✅
*   **AI Forensic Executor:** `RUN AI FORENSIC AUDIT` button — frontend exists, backend skipped ⏸️
*   **Audit Report Panel:** Displays AI findings (anomalies, run-out projections) ⏸️ Skipped
*   **Confirmation Dialogs:** Required before: ✅
    *   Deleting an inventory item (with log count warning + cascade delete) ✅
    *   Running AI forensic audit (cost awareness) ⏸️
    *   Removing a staff member ✅

### 6.3 Staff Management Page (Admin Only) ✅ Implemented

*   **Staff List Table:** Displays registered staff with email, role, last active ✅
*   **Branch Assignment:** Admin can assign/edit branch on invite and for existing staff ✅
*   **Invite Staff Button:** Opens form to send Supabase Auth invitation ✅
*   **Remove Staff Button:** Confirmation dialog with warning message before soft-delete ✅
*   **Admin Filtered Out:** Admin user excluded from staff list ✅

### 6.4 Analytics Dashboard (Admin Only) ✅ Implemented (partial)

*   **Summary Cards:** Key metrics at a glance ✅
    *   Total items tracked ✅
    *   Total logs today/this week ✅
    *   Average consumption rate ✅
    *   Items below threshold ✅
*   **Consumption Chart:** Line/bar chart showing consumption trends over time ⏸️ Phase 2 (currently progress bars)
*   **Variance Report:** Table comparing expected vs actual with variance percentage ✅
*   **Date Range Picker:** Filter analytics by custom date range ⏸️ Phase 2
*   **Export Button:** Download report as CSV ✅
*   **Refresh Button:** Manual data refresh for real-time updates ⏸️ Phase 2

### 6.4 Design System

**Typography:**
*   Primary font: Inter (clean, mobile-optimized sans-serif)
*   Headings: 600-700 weight, sizes scale from 14px (h6) to 32px (h1)
*   Body text: 400 weight, 14-16px base size
*   Monospace (for quantities): JetBrains Mono

**Color Palette:**
*   Primary (Admin): Indigo (#4F46E5) - Trust, authority
*   Primary (Staff): Emerald (#10B981) - Action, positive
*   Accent: Amber (#F59E0B) - Alerts, variance indicators
*   Background: White (#FFFFFF) - Clean, professional
*   Surface: Gray-50 (#F9FAFB) - Card backgrounds
*   Text Primary: Gray-900 (#111827)
*   Text Secondary: Gray-500 (#6B7280)
*   Success: Green-500 (#22C55E)
*   Error: Red-500 (#EF4444)
*   Warning: Orange-500 (#F97316)

**Spacing Scale:**
*   Base unit: 4px
*   Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

**Border Radius:**
*   Small (buttons, inputs): 6px
*   Medium (cards): 8px
*   Large (modals): 12px

### 6.5 Responsive Breakpoints ✅ Implemented

*   **Mobile:** 0-639px (single column, full-width form) ✅
*   **Tablet:** 640-1023px (2-column grid, side panel for audit) ✅
*   **Desktop:** 1024px+ (full dashboard layout with sidebar) ✅

**Mobile-Specific Behaviors:**
*   Staff form: Full-width input fields, stacked layout ✅
*   Action toggle cards: Full-width, large touch targets (min 48px height) ✅
*   Admin grid: Horizontal scroll for ledger table ✅
*   Bottom navigation for mobile (instead of sidebar) ⏸️ Phase 2
*   Mobile hamburger menu toggle ✅

### 6.6 Accessibility (a11y) Standards ⏸️ Phase 2

*   WCAG 2.1 AA compliance target ⏸️
*   Color contrast ratio: minimum 4.5:1 for text, 3:1 for large text ⏸️
*   All interactive elements keyboard navigable ⏸️
*   Focus indicators visible on all focusable elements ⏸️
*   ARIA labels on icon-only buttons ⏸️
*   Form inputs associated with labels via `htmlFor` ✅ (Input/Select components)
*   Error messages linked to inputs via `aria-describedby` ⏸️
*   Live regions for dynamic content updates (toasts, loading) ⏸️
*   Skip-to-content link for keyboard users ⏸️
*   Screen reader announcements for page navigation ⏸️

### 6.7 Keyboard Navigation ⏸️ Phase 2

*   `Tab` / `Shift+Tab`: Move between interactive elements ⏸️
*   `Enter` / `Space`: Activate buttons and toggles ⏸️
*   `Arrow keys`: Navigate within dropdowns and toggle groups ⏸️
*   `Escape`: Close modals and dropdowns ⏸️
*   `Ctrl+Enter`: Quick submit on forms (optional shortcut) ⏸️
*   Focus trap in modals (cannot tab outside modal while open) ⏸️

### 6.8 Dark/Light Mode ✅ Implemented

*   Default: Light mode (professional, clean aesthetic) ✅
*   Dark mode: Toggle in header ✅
*   Tailwind `dark:` class strategy for theme switching ✅
*   Persist preference in localStorage ✅
*   Respect system preference on first visit ⏸️ Phase 2 (currently defaults to light)
*   Color palette adjusted for dark mode readability ✅

### 6.9 Offline Handling & Network Resilience ⏸️ Phase 2

*   **Network status indicator:** Persistent banner showing online/offline state ✅ (OfflineBanner)
*   **Offline mode:** Staff can queue log submissions locally ⏸️
*   **Service worker:** Basic caching for static assets (App Shell pattern) ⏸️
*   **IndexedDB:** Store pending log submissions when offline ⏸️
*   **Sync on reconnect:** Auto-submit queued logs when connection restored ⏸️
*   **Conflict detection:** If item modified offline, prompt user before overwriting ⏸️
*   **Offline toast:** "You're offline. Logs will be submitted when connection is restored." ✅
*   **Maximum queue size:** 50 pending submissions ⏸️
*   **Queue expiry:** Queued items older than 24 hours deleted on sync ⏸️

---

## 7. Serverless AI Schema Pipeline ⏸️ Skipped (no OpenAI API key)

When the audit button is executed, backend routes process snapshot matrices and stream insights back to the UI.

### 7.1 Audit Execution Flow

1. Admin clicks `RUN AI FORENSIC AUDIT`
2. Frontend POSTs to `/api/audit` with current branch filter
3. Server queries `current_inventory_status` view for selected branch
4. Server formats data into JSON payload
5. Server calls OpenAI API with system prompt + data payload
6. Response streamed back to frontend and displayed in audit panel

### 7.2 Reference System Prompt Template

> You are the **BaristaMetrics Expert AI Forensic Auditor**. You are evaluating operational inventory logs for a multi-branch business environment.
>
> Analyze the following JSON array representing weekly/monthly inventory performance metrics. Look for critical consumption anomalies, unexplained data deviations, or usage trajectories that do not map appropriately to standard transaction speeds.
>
> **Data Payload:** `{{INSERT_JSON_DATA_STREAM}}`
>
> **Provide a clear bulleted brief identifying:**
> 1. Significant operational negative variances (potential internal loss/waste)
> 2. Out-of-stock projections and item run-out velocities
>
> *Keep assertions data-focused, specific, and direct. Do not assume or hallucinate unlogged information.*

### 7.3 Future AI Enhancements

*   Trend analysis across multiple audit periods
*   Branch-to-branch comparison reports
*   Automated low-stock alerts via email/Telegram
*   Predictive restock scheduling based on consumption velocity

---

## 8. API Layer Architecture

### 8.1 Endpoint Definitions

**Inventory API (`/api/inventory`)** ✅ Implemented
*   `GET /api/inventory` - List all inventory items (filtered by branch query param) ✅
*   `POST /api/inventory` - Create new inventory item (admin only) ✅
*   `GET /api/inventory/[itemId]` - Get single inventory item details ⏸️ Phase 2
*   `PUT /api/inventory/[itemId]` - Update inventory item (admin only) ✅
*   `DELETE /api/inventory/[itemId]` - Remove inventory item (admin only, cascades to daily_logs + transfers) ✅

**Logs API (`/api/logs`)** ✅ Implemented
*   `GET /api/logs` - List daily logs (filtered by branch, date range, item) ✅
*   `POST /api/logs` - Submit new log entry (staff, identity enforced) ✅
*   `GET /api/logs/[logId]` - Get single log entry ⏸️ Phase 2

**Transfers API (`/api/transfers`)** ✅ Implemented
*   `GET /api/transfers` - List all transfers ⏸️ Phase 2
*   `POST /api/transfers` - Initiate cross-branch transfer (admin only) ✅

**Audit API (`/api/audit`)** ✅ Implemented (read-only)
*   `GET /api/audit` - Get audit log entries (paginated) ✅
*   `POST /api/audit` - Execute AI forensic audit on branch data ⏸️ Skipped (no OpenAI key)

**Users API (`/api/users`)** ✅ Implemented
*   `GET /api/users` - List all staff users (admin only) ✅
*   `POST /api/users` - Invite new staff member (admin only, with branch assignment) ✅
*   `DELETE /api/users/[userId]` - Remove staff member (admin only) ✅

**Activity API (`/api/activity`)** ✅ Implemented
*   `GET /api/activity` - Get user activity logs (admin only, paginated) ✅

**Analytics API (`/api/analytics`)** ⏸️ Phase 2
*   `GET /api/analytics/summary` - Get daily/weekly/monthly summary (admin only) ⏸️
*   `GET /api/analytics/consumption` - Get consumption trends (admin only) ⏸️
*   `GET /api/analytics/variance` - Get variance reports (admin only) ⏸️

**Health API (`/api/health`)** ✅ Implemented
*   `GET /api/health` - System health check (DB latency, inventory/log/activity counts) ✅

### 8.2 Request/Response Standards ✅ Implemented

All API responses follow a standardized format:
*   `success` (boolean) - Request success status ✅
*   `data` (object/array, optional) - Response payload ✅
*   `error` (object, optional) - Contains `code`, `message`, `details` ✅
*   `metadata` (object) - Contains `timestamp`, `requestId`, `version` ✅

### 8.3 Input Validation ✅ Implemented

All API inputs validated using Zod schemas before processing:
*   Branch IDs validated against allowed values (`jaen`, `mallorca`, `san-antonio`) ✅
*   Quantities validated as positive numbers ✅
*   Log types validated against allowed values ✅
*   Email formats validated for user operations ✅
*   Request body size limits enforced ✅

### 8.4 Error Handling ✅ Implemented

Centralized error handler middleware:
*   Custom `AppError` class with code, message, statusCode, details ✅
*   Database errors mapped to user-friendly messages ✅
*   Validation errors include field-level details ✅
*   Production mode hides internal error details ✅
*   All errors logged with full context (requestId, timestamp, user) ✅
*   PostgrestError objects properly serialized (not generic "Unknown error") ✅

### 8.5 Pagination Strategy ✅ Implemented (offset-based)

*   **Default page size:** 25 items ✅
*   **Maximum page size:** 100 items ✅
*   **Cursor-based pagination** for large datasets ⏸️ Phase 2 (currently offset-based)
*   **Response metadata:** `page`, `pageSize`, `totalCount`, `hasNextPage` ✅
*   **Infinite scroll** on mobile for log history ⏸️ Phase 2
*   **Page numbers** on desktop for inventory grid ✅ (Pagination component with ellipsis)
*   **Query params:** `?page=1&pageSize=25` or `?offset=0&limit=25` ✅
*   **Search pagination:** Full-text search with pagination support ⏸️ Phase 2
*   **Filter pagination:** Combined filters with pagination ✅

### 8.6 API Versioning ⏸️ Phase 2

*   **Versioning strategy:** URL path versioning (`/api/v1/...`) ⏸️
*   **Current version:** v1 ⏸️
*   **Version header:** `X-API-Version` included in responses ⏸️
*   **Deprecation policy:** 6 months notice before version removal ⏸️
*   **Backward compatibility:** New fields added without breaking existing clients ⏸️
*   **Breaking changes:** Major version bump required ⏸️
*   **Version discovery:** `/api/versions` endpoint lists available versions ⏸️
*   **Version migration:** Automated migration scripts for major version upgrades ⏸️

**Client-Side Caching:**
*   React Query / SWR for data fetching with stale-while-revalidate
*   Inventory data cached for 5 minutes (refetch on window focus)
*   Branch selection persisted in localStorage
*   User session cached in Supabase client

**Server-Side Caching:**
*   AI audit results cached for 1 hour per branch
*   Health check response cached for 30 seconds
*   No caching on log submission endpoints (always fresh)

**CDN Caching:**
*   Static assets (images, fonts): 1 year, immutable
*   JS/CSS bundles: 1 year with content hash
*   HTML pages: No cache (SSR dynamic content)

### 8.7 Real-Time Subscription Strategy ✅ Implemented

*   Supabase Realtime enabled for `daily_logs` table ✅
*   Admin dashboard subscribes to log inserts for live updates ✅
*   Inventory grid refreshes on any inventory_master change ✅
*   Subscription scoped to current branch (filtered by branch_id) ✅
*   Reconnection logic with exponential backoff ✅
*   Visual indicator when real-time is active ("Live" badge with pulsing dot) ✅
*   Graceful degradation to polling if WebSocket fails ⏸️ Phase 2
*   Subscription throttling: Maximum 1 subscription per table per client ✅
*   Subscription cleanup: Unsubscribe on component unmount ✅
*   Subscription analytics: Track subscription health and performance ⏸️ Phase 2

### 8.8 Branch Transfer Logic ✅ Implemented (core)

*   Admin can initiate stock transfer between branches ✅
*   Transfer creates two log entries: ✅
    *   Deduction from source branch ✅
    *   Delivery to destination branch ✅
*   Transfer history viewable in admin transfers page ✅
*   Requires admin confirmation before execution ✅
*   Both branches' inventory updated atomically (single transaction) ✅
*   Transfer validation: Source must have sufficient stock ✅
*   Transfer limits: Maximum quantity per transfer (configurable) ⏸️ Phase 2
*   Transfer notification: Email alert to both branch managers ⏸️ Phase 2
*   Transfer reversal: Admin can reverse completed transfers ⏸️ Phase 2

### 8.9 Data Export & Reporting ✅ Implemented (basic)

*   **CSV Export:** Admin can export inventory status to CSV ✅
*   **Date Range Filter:** Export filtered by date range ⏸️ Phase 2
*   **Branch Filter:** Export filtered by selected branch ✅
*   **Report Types:** ⏸️ Phase 2 (currently single export type)
    *   Daily summary (total deductions, deliveries, net change) ⏸️
    *   Weekly consumption report per ingredient ⏸️
    *   Monthly variance report (expected vs actual) ⏸️
    *   Staff activity report (who logged what, when) ⏸️
    *   Transfer history report (cross-branch movements) ⏸️
*   **Export Format:** CSV with UTF-8 encoding for Filipino characters ✅
*   **Export Location:** Downloaded to browser, not stored on server ✅
*   **Export Limits:** Maximum 10,000 rows per export ⚠️ Constant defined but not enforced
*   **Export Scheduling:** Optional daily/weekly email exports (admin preference) ⏸️ Phase 2

### 8.10 User Activity Logging ✅ Implemented (core)

*   **Login/Logout events** logged to user_activity table ✅
*   **Failed login attempts** logged with IP and timestamp ⏸️ Phase 2
*   **Password changes** logged (not the password itself) ⏸️ Phase 2
*   **Session duration** tracked for usage analytics ⏸️ Phase 2
*   **Feature usage** tracked (log_submit, transfer, export) ✅
*   **Activity retention:** 90 days (matches audit_log) ✅
*   **Admin-only access** to activity logs ✅
*   **Activity export:** CSV download for management review ⏸️ Phase 2
*   **Activity alerts:** Notify admin of unusual patterns (off-hours access, multiple failed logins) ⏸️ Phase 2

---

## 9. Security & Middleware Layer

### 9.1 Rate Limiting ✅ Implemented

*   **General API:** 100 requests per 15 minutes per IP ✅
*   **Admin Endpoints:** 10 requests per 5 minutes per IP ✅
*   **Auth Endpoints:** 5 requests per 5 minutes per IP ✅
*   Rate limit headers returned in responses ✅

### 9.2 Security Headers ✅ Implemented

*   Content Security Policy (CSP) configured for Supabase + Next.js ✅
*   X-Frame-Options: DENY (prevent clickjacking) ✅
*   X-Content-Type-Options: nosniff ✅
*   Strict-Transport-Security enabled ✅
*   Referrer Policy: strict-origin-when-cross-origin ✅
*   Permissions Policy: camera=(), microphone=(), geolocation=() ✅
*   X-XSS-Protection: 1; mode=block ✅
*   Cross-Origin-Opener-Policy: same-origin ✅
*   Cross-Origin-Resource-Policy: same-origin ✅
*   `poweredByHeader: false` in next.config.ts ✅

### 9.3 Request Logging ✅ Implemented

All API requests logged with:
*   Request ID (unique identifier) ✅
*   Timestamp ✅
*   HTTP method and path ✅
*   User email (from JWT) ✅
*   Response status code ✅
*   Error details (if applicable) ✅
*   Request duration ✅
*   Request body size ✅
*   Response body size ⏸️ Phase 2
*   User agent string ✅
*   IP address (anonymized for privacy) ✅

### 9.4 CORS Configuration ⏸️ Phase 2

*   Allowed origins: Production domain + localhost (dev) ⏸️
*   Allowed methods: GET, POST, PUT, DELETE ⏸️
*   Allowed headers: Authorization, Content-Type ⏸️
*   Credentials allowed for authenticated requests ⏸️

### 9.5 Service Worker & Offline Caching ⏸️ Phase 2

*   **App Shell Strategy:** Cache static assets (HTML, CSS, JS) for instant load ⏸️
*   **Cache-first:** Static assets served from cache, network fallback ⏸️
*   **Network-first:** API requests try network, fallback to cache ⏸️
*   **Cache versioning:** Cache names include version number for easy invalidation ⏸️
*   **Offline fallback:** Custom offline page when no cache available ⏸️
*   **Background sync:** Queue failed requests for retry when online ⏸️
*   **Cache size limit:** Maximum 50MB for offline assets ⏸️
*   **Update mechanism:** New service worker activates on next page load ⏸️

---

## 10. Monitoring & Observability

### 10.1 Client-Side Monitoring ✅ Implemented (core)

*   Error boundaries on all page layouts ✅ (error.tsx files + ErrorBoundary component)
*   Toast notifications for user-facing errors ✅
*   Loading states for all async operations ✅
*   Form validation feedback in real-time ✅
*   Performance metrics (Core Web Vitals) ⏸️ Phase 2
*   User interaction tracking (clicks, form submissions) ⏸️ Phase 2
*   Network error detection and reporting ✅ (OfflineBanner)
*   Offline status tracking ✅ (OfflineBanner)

### 10.2 Server-Side Monitoring ✅ Implemented (core)

*   Structured JSON logging for all API routes ✅
*   Error tracking with stack traces and context ✅
*   Performance metrics (response times) ✅ (request duration logged)
*   Health check endpoint for uptime monitoring ✅
*   Memory usage tracking ⏸️ Phase 2
*   CPU utilization monitoring ⏸️ Phase 2
*   Disk space alerts ⏸️ Phase 2
*   Network latency measurement ✅ (DB latency in health check)

### 10.3 Database Monitoring ⏸️ Phase 2

*   Audit log tracks all data modifications ✅ (triggers must be run)
*   Slow query identification via index usage ⏸️
*   Connection pool health checks ✅ (health endpoint)
*   Backup verification procedures ⏸️
*   Table size monitoring ⏸️
*   Index usage statistics ⏸️
*   Query performance analysis ⏸️
*   Dead tuple detection and cleanup ⏸️

### 10.4 Alerting ⏸️ Phase 2

*   Failed login attempts (brute force detection) ⏸️
*   Unusual inventory deduction patterns ⏸️
*   High error rates on API endpoints ⏸️
*   Database connectivity issues ✅ (health check)
*   Low stock alerts (configurable threshold) ⏸️
*   Offline queue backup alerts ⏸️
*   Performance degradation alerts ⏸️
*   Security anomaly detection ⏸️
*   Capacity planning alerts (approaching limits) ⏸️

### 10.5 Monitoring Dashboard ⏸️ Phase 2

*   **Real-time metrics:** Active users, API response times, error rates ⏸️
*   **Inventory health:** Stock levels, variance trends, consumption rates ⏸️
*   **System status:** Database connections, memory usage, CPU utilization ⏸️
*   **User activity:** Login frequency, feature usage, session duration ⏸️
*   **Exportable reports:** CSV/PDF for management review ⏸️
*   **Historical trends:** 7-day, 30-day, 90-day comparison charts ⏸️
*   **Alert configuration:** Customizable thresholds and notification channels ⏸️
*   **Performance tracking:** Response time percentiles (p50, p95, p99) ⏸️
*   **Error tracking:** Error rate trends, top errors, resolution time ⏸️

### 10.6 Connection Pooling ✅ Implemented (Supabase default)

*   Supabase connection pooler enabled (PgBouncer) ✅
*   Maximum connections: 50 (Supabase default) ✅
*   Connection timeout: 10 seconds ✅
*   Idle timeout: 300 seconds (5 minutes) ✅
*   Serverless function connection reuse via Supabase client singleton ✅
*   No raw connection management in application code (handled by Supabase SDK) ✅

---

## 11. Testing Strategy

### 11.1 Unit Testing ✅ Implemented (127+ tests)

*   Component rendering tests (React Testing Library) ✅ (StaffLogForm)
*   Utility function tests (Jest) ✅ (helpers, constants)
*   Validation schema tests (Zod) ✅
*   API route handler tests (mocked Supabase) ✅ (inventory, logs, transfers)
*   Hook behavior tests ⏸️ Phase 2
*   Error handling tests ✅ (via API tests)
*   Form validation tests ✅ (via StaffLogForm tests)
*   Date/time utility tests ⏸️ Phase 2 (no date utilities exist yet)

### 11.2 Integration Testing ✅ Implemented (API tests)

*   End-to-end staff log submission flow ⏸️ Phase 2 (Cypress)
*   Admin inventory audit workflow ⏸️ Phase 2 (Cypress)
*   Authentication and authorization flows ⏸️ Phase 2 (Cypress)
*   Branch switching and data filtering ⏸️ Phase 2 (Cypress)
*   Cross-branch transfer workflow ⏸️ Phase 2 (Cypress)
*   Offline queue sync testing ⏸️ Phase 2 (no offline queue yet)
*   Export functionality testing ⏸️ Phase 2
*   Real-time subscription testing ⏸️ Phase 2
*   API integration tests (inventory, logs, transfers) ✅

### 11.3 Database Testing ✅ Implemented

*   RLS policy verification (staff cannot delete) ✅
*   Audit trigger functionality ✅ (tests exist, triggers must be run)
*   View calculation accuracy ✅
*   Constraint enforcement ✅
*   Index performance verification ⏸️ Phase 2
*   Connection pool behavior ⏸️ Phase 2
*   Data integrity checks ✅
*   Backup and recovery testing ⏸️ Phase 2

### 11.4 Load Testing ✅ Implemented

*   Concurrent log submissions ✅
*   Multiple admin sessions ⏸️ Phase 2
*   Real-time subscription performance ⏸️ Phase 2
*   Database connection pool stress ⏸️ Phase 2
*   API rate limit effectiveness ✅
*   Offline queue sync performance ⏸️ Phase 2
*   Large dataset pagination ⏸️ Phase 2
*   Export functionality under load ⏸️ Phase 2

---

## 12. CI/CD Pipeline ✅ Implemented

### 12.1 Pipeline Stages

**On Push to any branch (`ci.yml`):** ✅
1. Install dependencies (`npm ci`) ✅
2. Run linting (`npm run lint`) ✅
3. Run type checking (`npm run typecheck`) ✅
4. Run unit tests (`npm run test`) ✅
5. Build application (`npm run build`) ✅

**On Push to `main` (`deploy.yml`):** ✅
1. All CI checks pass ✅
2. Build production bundle ✅
3. Deploy to Vercel production ✅
4. Post-deployment health check ⏸️ Phase 2

### 12.2 Quality Gates

*   Zero lint errors ✅
*   Zero type errors ✅
*   90%+ test coverage ⏸️ Phase 2 (not configured yet)
*   Build succeeds without warnings ✅
*   Health check passes post-deploy ⏸️ Phase 2
*   Lighthouse score > 90 (performance, accessibility, best practices) ⏸️ Phase 2
*   Bundle size within threshold (< 500KB initial) ⏸️ Phase 2
*   Security audit passes (no critical vulnerabilities) ⏸️ Phase 2

### 12.3 Environment Management

*   Staging: Auto-deployed from `develop` branch ⏸️ Phase 2
*   Production: Auto-deployed from `main` branch ✅
*   Rollback: Manual trigger via GitHub Actions workflow dispatch ⏸️ Phase 2
*   Secrets: Stored in GitHub repository secrets, injected at build time ✅
*   Feature flags: LaunchDarkly or similar for gradual rollouts ⏸️ Phase 2
*   Environment parity: Staging mirrors production configuration ⏸️ Phase 2
*   Blue-green deployments: Zero-downtime production updates ⏸️ Phase 2
*   Database migrations: Run automatically on deploy ⏸️ Phase 2

---

## 13. Environment Configuration

### 13.1 Required Environment Variables

*   `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
*   `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
*   `OPENAI_API_KEY` - OpenAI API key (server-side only)
*   `NEXT_PUBLIC_APP_URL` - Application base URL
*   `NODE_ENV` - Environment mode (development/staging/production)

### 13.2 Branch Configuration Constants

*   `ALLOWED_BRANCHES` - Array of valid branch IDs (`jaen`, `mallorca`, `san-antonio`) ✅
*   `ADMIN_EMAIL` - Admin email for RLS (`jana@admin.com`) ✅
*   `LOG_TYPES` - Valid log types (`deduction`, `delivery`) ✅
*   `VALID_UNITS` - Valid measurement units (`kg`, `grams`, `packs`) ✅
*   `DEFAULT_BRANCH` - Default branch for new users (`jaen`) ✅
*   `ITEM_CATEGORIES` - Ingredient categories for grouping (`powder`, `liquid`, `addon`) ✅

### 13.3 Application Constants

*   `RATE_LIMIT_WINDOW_MS` - Rate limit window (15 minutes)
*   `RATE_LIMIT_MAX_GENERAL` - General API limit (100 requests)
*   `RATE_LIMIT_MAX_ADMIN` - Admin API limit (10 requests)
*   `MAX_REQUEST_BODY_SIZE` - Maximum request payload size
*   `SESSION_TIMEOUT_MS` - Session timeout (24 hours)
*   `MAX_CONCURRENT_SESSIONS` - Maximum concurrent sessions per user (3)
*   `PASSWORD_MIN_LENGTH` - Minimum password length (8)
*   `PASSWORD_REQUIRE_UPPERCASE` - Require uppercase letter (true)
*   `PASSWORD_REQUIRE_NUMBER` - Require number (true)
*   `CACHE_TTL_MS` - Cache time-to-live (5 minutes)
*   `STALE_WHILE_REVALIDATE_MS` - SWR stale time (30 seconds)
*   `OFFLINE_QUEUE_MAX_SIZE` - Maximum offline queue size (50)
*   `OFFLINE_QUEUE_EXPIRY_MS` - Offline queue expiry (24 hours)
*   `EXPORT_MAX_ROWS` - Maximum export rows (10,000)
*   `LOW_STOCK_THRESHOLD_PERCENT` - Low stock alert threshold (20%)
*   `ANOMALY_DETECTION_THRESHOLD` - Anomaly detection sensitivity (2 standard deviations)

---

## 14. Disaster Recovery & Data Integrity

### 14.1 Backup Strategy

*   Supabase automatic daily backups ✅ (Supabase default)
*   Manual backup before schema migrations ✅ (scripts/backup-database.sh)
*   Weekly database export to external storage ⏸️ Phase 2
*   Audit log retention: 90 days minimum ✅
*   User activity retention: 90 days minimum ✅
*   Transfer log retention: 1 year minimum ✅
*   Backup verification: Weekly restore test ⏸️ Phase 2
*   Backup encryption: AES-256 for external storage ⏸️ Phase 2

### 14.2 Data Integrity Checks

*   Daily validation procedure checks for impossible deductions ⏸️ Phase 2
*   Negative stock alert detection ⏸️ Phase 2
*   Orphaned log detection (logs without valid inventory items) ⏸️ Phase 2
*   Duplicate entry prevention via unique constraints ✅
*   Cross-branch transfer validation ✅
*   Timestamp consistency checks ✅
*   User email format validation ✅
*   Quantity range validation (prevent unreasonable values) ✅

### 14.3 Rollback Procedures

*   Database migration rollback scripts ✅ (scripts/rollback-migration.sh)
*   Application version rollback via CI/CD ⏸️ Phase 2
*   Configuration rollback via environment variables ✅
*   Feature flags for gradual rollouts ⏸️ Phase 2
*   Database schema versioning (semantic versioning) ⏸️ Phase 2
*   Migration naming convention: `YYYYMMDDHHMMSS_description.sql` ⏸️ Phase 2
*   Rollback testing: Every migration must have tested rollback script ⏸️ Phase 2
*   Data migration backup: Full table backup before destructive migrations ⏸️ Phase 2

### 14.4 Incident Response

*   Error rate spike detection ⏸️ Phase 2
*   Automatic fallback to read-only mode ⏸️ Phase 2
*   Admin notification system for critical failures ⏸️ Phase 2
*   Post-incident review and documentation process ✅ (docs/incident-response.md)
*   Incident severity levels (P0-P3) ✅ (documented)
*   Response time SLAs (P0: 15 min, P1: 1 hour, P2: 4 hours, P3: 24 hours) ✅ (documented)
*   Communication templates for stakeholders ✅ (docs/email-templates.md)
*   Root cause analysis process ⏸️ Phase 2

### 14.5 Email Notification Templates

**Staff Invitation Email:**
*   Subject: "You're invited to join BaristaMetrics"
*   Content: Welcome message, setup link, expected role
*   Expiry: Invitation link expires in 7 days

**Password Reset Email:**
*   Subject: "Reset your BaristaMetrics password"
*   Content: Reset link, security notice
*   Expiry: Reset link expires in 1 hour

**Low Stock Alert (Admin Only):**
*   Subject: "Low stock alert: [Item Name] - [Branch]"
*   Content: Current stock level, recommended reorder quantity
*   Trigger: When expected_remaining_stock falls below threshold
*   Threshold: Configurable per item (default: 20% of starting stock)

**Weekly Summary (Admin Only):**
*   Subject: "BaristaMetrics Weekly Report - [Branch]"
*   Content: Total deductions, deliveries, top consumed items, variances
*   Schedule: Every Monday at 8:00 AM
*   Recipients: Admin email + designated managers

**Security Alert (Admin Only):**
*   Subject: "Security alert: Unusual activity detected"
*   Content: Activity type, timestamp, user, IP address
*   Trigger: Failed login attempts, large deductions, off-hours activity
*   Threshold: 5 failed logins in 10 minutes, deduction > 50% of stock

**Transfer Confirmation:**
*   Subject: "Stock transfer completed: [Source] → [Destination]"
*   Content: Item name, quantity, initiated by, timestamp
*   Trigger: Successful cross-branch transfer
*   Recipients: Admin + both branch managers

---

## 15. Documentation Requirements

### 15.1 Developer Documentation

*   API endpoint documentation ✅ (docs/api-reference.md)
*   Database schema diagrams ⏸️ Phase 2
*   Environment setup guide ⏸️ Phase 2
*   Contributing guidelines ⏸️ Phase 2
*   Code review checklist ⏸️ Phase 2
*   Architecture decision records (ADRs) ⏸️ Phase 2
*   Component storybook ⏸️ Phase 2
*   API Postman collection ⏸️ Phase 2

### 15.2 User Documentation

*   Staff user manual (log submission workflow) ✅ (docs/user-guide-staff.md)
*   Admin user manual (audit and management workflow) ✅ (docs/user-guide-admin.md)
*   FAQ and troubleshooting guide ⏸️ Phase 2
*   Video tutorials for common operations ⏸️ Phase 2
*   Quick reference cards (printable) ⏸️ Phase 2
*   Onboarding checklist for new staff ⏸️ Phase 2
*   Glossary of terms (English/Filipino) ⏸️ Phase 2

### 15.3 Operations Documentation

*   Deployment runbook ✅ (docs/deployment.md)
*   Monitoring and alerting setup ⏸️ Phase 2
*   Backup and recovery procedures ✅ (scripts/backup-database.sh, restore-database.sh)
*   Security incident response plan ✅ (docs/incident-response.md)
*   Performance tuning guide ⏸️ Phase 2
*   Scaling procedures ⏸️ Phase 2
*   Cost optimization strategies ⏸️ Phase 2
*   Vendor management (Supabase, OpenAI, Vercel) ⏸️ Phase 2

### 15.4 Security Documentation

*   Security architecture overview ✅ (docs/security.md)
*   RLS policy documentation ⏸️ Phase 2
*   Access control matrix ⏸️ Phase 2
*   Vulnerability assessment procedures ⏸️ Phase 2
*   Compliance checklist (data protection) ⏸️ Phase 2
*   Incident response playbook ✅ (docs/incident-response.md)

---

## 16. Future Enhancements (Post-MVP)

*   Multi-language support (Filipino/English toggle)
*   Telegram bot for daily summary reports
*   Mobile app (React Native) for offline logging
*   Advanced analytics dashboard with charts
*   Automated reorder alerts based on consumption patterns
*   Supplier integration for automatic purchase orders
*   Cost tracking and profit margin analysis
*   Employee performance metrics based on logging accuracy
*   Barcode scanning for ingredient tracking
*   Multi-admin support (role-based admin hierarchy)
*   Webhook integrations (Slack, Discord for alerts)
*   Data archival strategy (move old logs to cold storage)
*   API rate limit dashboard for monitoring abuse
*   A/B testing framework for UI improvements
*   Progressive Web App (PWA) installation prompts
*   Predictive analytics for demand forecasting
*   Seasonal trend analysis and reporting
*   Multi-currency support for international branches
*   Automated backup verification and reporting
*   Real-time collaboration features (multiple admins editing simultaneously)
*   Machine learning models for anomaly detection
*   Natural language query interface for analytics
*   Voice-activated logging for hands-free staff operation
*   Integration with POS systems for automatic transaction logging
*   Customer feedback integration for inventory optimization

---

## 17. Phase 2: Remaining Work (Prioritized Backlog)

> Items below are organized by priority. Work through these in order.
> Items marked with 🔴 are blocking functionality; 🟡 improve UX; 🟢 are nice-to-have.

### P0 — Critical (Must fix before production)

1. **Run SQL scripts in Supabase** — `add-category-column.sql` (recreate view) + `audit-triggers.sql` must be run before the app works correctly
2. **`GET /api/inventory/[itemId]`** — Single item fetch endpoint (only PUT/DELETE exist)
3. **`GET /api/transfers`** — Transfer list endpoint (only POST exists)
4. **`GET /api/logs/[logId]`** — Single log fetch endpoint
5. **Dark mode system preference** — Check `prefers-color-scheme` on first visit instead of defaulting to light

### P1 — High (Should fix for v1.1)

6. **Accessibility (a11y)** — Skip-to-content link, ARIA labels on icon-only buttons, `aria-describedby` on error messages, `aria-live` regions for toasts/loading
7. **Keyboard navigation** — Focus trap in modals, Escape to close modals
8. **Password policy** — Enforce uppercase + number requirements in validation schema
9. **Account lockout** — 5 failed attempts = 15 minute lockout (Supabase Edge Function or middleware)
10. **CORS configuration** — Add CORS headers for production domain
11. **`/api/analytics/*` routes** — Move analytics queries from client-side to API routes (summary, consumption, variance)
12. **Export limits** — Enforce 10,000 row maximum in CSV export
13. **Failed login logging** — Log failed attempts with IP to user_activity
14. **`GET /api/audit` POST endpoint** — If/when OpenAI key is obtained, implement AI forensic audit POST route

### P2 — Medium (Improve UX for v1.2)

15. **Consumption chart** — Replace progress bars with actual line/bar chart (Recharts or Chart.js)
16. **Date range picker** — Filter analytics and export by custom date range
17. **Refresh button** — Manual data refresh on analytics page
18. **Bottom mobile navigation** — Replace sidebar with bottom nav on mobile
19. **Offline queue** — IndexedDB + service worker for queueing log submissions when offline, sync on reconnect
20. **Service worker** — `public/sw.js` for App Shell caching (static assets)
21. **Transfer reversal** — Admin can reverse completed transfers
22. **Transfer limits** — Maximum quantity per transfer (configurable)
23. **Log limits** — Max 50 log submissions per staff shift
24. **Infinite scroll** — Mobile-friendly infinite scroll for log history
25. **Cursor-based pagination** — Replace offset-based with cursor-based for large datasets
26. **API versioning** — `/api/v1/...` path prefix + `X-API-Version` header
27. **Response body size** — Log response body size in request logger
28. **Batch operations** — Bulk inventory updates, bulk log corrections for admin
29. **System settings** — Admin-configurable thresholds, notification preferences
30. **Social login** — Google OAuth via Supabase
31. **Magic link login** — Passwordless option via Supabase

### P3 — Low (Nice-to-have for v2.0)

32. **`app/(auth)/register/page.tsx`** — Staff registration page (admin-only)
33. **`components/forms/InventoryEditRow.tsx`** — Extract editable row into component
34. **`components/forms/TransferForm.tsx`** — Extract transfer form into component
35. **`components/dashboard/TransferHistory.tsx`** — Extract transfer history into component
36. **`components/analytics/*`** — Extract SummaryCards, ConsumptionChart, VarianceReport into components
37. **`components/offline/QueueStatus.tsx`** — Pending submissions counter
38. **Missing hooks** — `useTransfers.ts`, `useActivity.ts`, `useOfflineQueue.ts`, `useAnalytics.ts`
39. **Missing types** — `types/activity.ts`, `types/logs.ts`, `types/transfers.ts`, `types/analytics.ts`
40. **Missing validations** — `lib/validations/activity.ts`, `analytics.ts`, `auth.ts`
41. **Export scheduling** — Daily/weekly email exports
42. **Transfer notification emails** — Email alert to branch managers
43. **Password history** — Prevent reuse of last 5 passwords
44. **Password expiry** — 90-day configurable expiry
45. **Session management** — Concurrent session limit, forced logout on password change, device fingerprinting
46. **2FA** — TOTP-based for admin accounts
47. **Core Web Vitals** — Performance tracking
48. **Monitoring dashboard** — Real-time metrics, inventory health, system status
49. **Alerting** — Low stock, unusual patterns, high error rates
50. **Hook behavior tests** — Jest tests for custom hooks
51. **Cypress E2E tests** — Full end-to-end testing
52. **Database schema diagrams** — Visual schema documentation
53. **Contributing guidelines** — CONTRIBUTING.md
54. **API Postman collection** — Importable API collection
55. **FAQ / troubleshooting guide** — User-facing docs
56. **Onboarding checklist** — New staff setup guide
57. **Glossary (English/Filipino)** — Terms reference
58. **RLS policy documentation** — Detailed policy explanations
59. **Access control matrix** — Role-permission table
60. **Cypress config** — `cypress.config.ts` + `cypress/` directory
