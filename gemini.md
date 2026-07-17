# BaristaMetrics (MVP Master Development File)

This is the definitive master plan, project scope, and reference architecture file for **BaristaMetrics**. This single file serves as the core context blueprint whenever building out new modules, frontend interfaces, backend API routes, or database configurations from scratch.

---

## 1. Tech Stack & Architecture Overview

*   **Frontend Framework:** Next.js (React App Router) + Tailwind CSS (Custom, mobile-first design)
*   **Backend-as-a-Service (BaaS):** Supabase (PostgreSQL Database + Authentication)
*   **Security Protocol:** Supabase Row-Level Security (RLS) policies
*   **AI Engine Layer:** Direct OpenAI API integration via serverless Next.js API Routes (Semi-manual execution)
*   **Validation Layer:** Zod schemas for API input/output validation
*   **State Management:** React Context + Supabase real-time subscriptions
*   **Data Fetching:** React Query (SWR) with stale-while-revalidate
*   **Error Tracking:** Client-side toast notifications + server-side structured logging
*   **Testing:** Jest (unit) + Cypress (integration/E2E)
*   **CI/CD:** GitHub Actions with staging/production pipelines
*   **Hosting:** Vercel (serverless functions + edge middleware)
*   **CDN:** Vercel Edge Network for static assets
*   **Monitoring:** Vercel Analytics + custom logging pipeline
*   **Offline Support:** Service Worker + IndexedDB for queue management

---

## 2. Project Structure

```
baristaMetrics/
├── app/
│   ├── layout.tsx                  # Root layout (providers, fonts, metadata)
│   ├── page.tsx                    # Landing/redirect page
│   ├── (auth)/
│   │   ├── login/page.tsx          # Staff/admin login
│   │   └── register/page.tsx       # Staff registration (admin-only)
│   ├── staff/
│   │   ├── layout.tsx              # Staff dashboard layout
│   │   └── page.tsx                # Staff log submission form
│   └── admin/
│       ├── layout.tsx              # Admin dashboard layout
│       ├── page.tsx                # Admin inventory audit grid
│       ├── users/page.tsx          # Staff management (add/remove)
│       ├── transfers/page.tsx      # Cross-branch transfer management
│       └── analytics/page.tsx      # Monitoring dashboard and reports
├── components/
│   ├── ui/                         # Reusable UI primitives (Button, Input, Select, Card)
│   ├── forms/
│   │   ├── StaffLogForm.tsx        # Staff inventory log submission
│   │   ├── InventoryEditRow.tsx    # Admin editable inventory row
│   │   └── TransferForm.tsx        # Cross-branch transfer form
│   ├── dashboard/
│   │   ├── BranchToggle.tsx        # Jaen/Ktown branch switcher
│   │   ├── InventoryGrid.tsx       # Admin calculation ledger
│   │   ├── AIForensicButton.tsx    # AI audit trigger button
│   │   └── TransferHistory.tsx     # Transfer log table
│   ├── analytics/
│   │   ├── SummaryCards.tsx        # Key metrics overview
│   │   ├── ConsumptionChart.tsx    # Consumption trend visualization
│   │   └── VarianceReport.tsx      # Expected vs actual comparison
│   ├── layout/
│   │   ├── Header.tsx              # App header with user info
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── Toast.tsx               # Notification toast component
│   └── modals/
│       ├── ConfirmDialog.tsx       # Reusable confirmation modal
│       └── LoadingSkeleton.tsx     # Skeleton loading states
│   └── offline/
│       ├── OfflineBanner.tsx       # Network status indicator
│       └── QueueStatus.tsx         # Pending submissions counter
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser-side Supabase client
│   │   ├── server.ts               # Server-side Supabase client
│   │   └── middleware.ts           # Auth middleware for protected routes
│   ├── validations/
│   │   ├── inventory.ts            # Zod schemas for inventory operations
│   │   ├── logs.ts                 # Zod schemas for daily log submissions
│   │   ├── transfers.ts            # Zod schemas for cross-branch transfers
│   │   ├── activity.ts             # Zod schemas for user activity
│   │   ├── analytics.ts            # Zod schemas for analytics queries
│   │   └── auth.ts                 # Zod schemas for authentication
│   ├── utils/
│   │   ├── constants.ts            # Branch IDs, item categories, units
│   │   ├── helpers.ts              # Formatting, calculation helpers
│   │   └── errors.ts               # Custom error classes (AppError)
│   └── middleware/
│       ├── error-handler.ts        # Global API error handler
│       ├── rate-limiter.ts         # Rate limiting configuration
│       ├── security-headers.ts     # CSP and security headers
│       └── request-logger.ts       # Structured request logging
├── api/
│   ├── inventory/
│   │   ├── route.ts                # GET inventory, POST new items (admin)
│   │   └── [itemId]/route.ts       # GET, PUT, DELETE single item (admin)
│   ├── logs/
│   │   ├── route.ts                # GET logs, POST new log (staff)
│   │   └── [logId]/route.ts        # GET single log (admin)
│   ├── transfers/
│   │   └── route.ts                # GET transfers, POST new transfer (admin)
│   ├── audit/
│   │   └── route.ts                # POST run AI forensic audit (admin)
│   ├── users/
│   │   ├── route.ts                # GET users, POST invite staff (admin)
│   │   └── [userId]/route.ts       # DELETE remove staff (admin)
│   ├── activity/
│   │   └── route.ts                # GET user activity (admin only)
│   ├── analytics/
│   │   ├── summary/route.ts        # GET summary analytics (admin)
│   │   ├── consumption/route.ts    # GET consumption trends (admin)
│   │   └── variance/route.ts       # GET variance reports (admin)
│   └── health/
│       └── route.ts                # GET health check endpoint
├── hooks/
│   ├── useInventory.ts             # Inventory data fetching hook
│   ├── useDailyLogs.ts             # Daily logs data fetching hook
│   ├── useBranch.ts                # Current branch context hook
│   ├── useTransfers.ts             # Transfer data fetching hook
│   ├── useActivity.ts              # User activity data hook
│   ├── useOfflineQueue.ts          # Offline submission queue hook
│   └── useAnalytics.ts             # Analytics data fetching hook
├── types/
│   ├── inventory.ts                # TypeScript interfaces for inventory
│   ├── logs.ts                     # TypeScript interfaces for logs
│   ├── transfers.ts                # TypeScript interfaces for transfers
│   ├── activity.ts                 # TypeScript interfaces for user activity
│   ├── analytics.ts                # TypeScript interfaces for analytics
│   └── api.ts                      # API response/error types
├── public/
│   └── assets/                     # Static assets (logos, icons)
├── public/sw.js                    # Service worker for offline caching
├── .env.example                    # Environment variable template
├── .github/workflows/ci.yml        # CI/CD pipeline config
├── tailwind.config.ts              # Tailwind customization
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing config
└── cypress.config.ts               # Cypress testing config
```

---

## 3. Database Schema & RLS Setup

Execute the following idempotent script inside the Supabase SQL Editor to create tables, real-time tracking views, and secure access permissions. The admin email identifier is hardcoded as `jana@gmail.com`.

### 3.1 Core Tables

**inventory_master** - Master ingredient list per branch
*   `item_id` (SERIAL PRIMARY KEY)
*   `branch_id` (VARCHAR(50), NOT NULL) - Multi-branch segmentation (`jaen`, `ktown`)
*   `item_name` (VARCHAR(100), NOT NULL)
*   `unit` (VARCHAR(20), NOT NULL) - `packs`, `kg`, `grams`
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
*   `Allow admin to modify inventory` - ALL operations restricted to `jana@gmail.com`

**daily_logs policies:**
*   `Allow authenticated to view daily logs` - SELECT for all authenticated users
*   `Allow staff to insert logs with identity enforcement` - INSERT only, `logged_by` must match `auth.jwt() ->> 'email'`
*   `Allow admin full control over logs` - ALL operations restricted to `jana@gmail.com`

**audit_log policies:**
*   `Allow admin to view audit log` - SELECT restricted to `jana@gmail.com`
*   `System inserts audit records` - INSERT via trigger functions only

**user_activity policies:**
*   `Allow admin to view activity` - SELECT restricted to `jana@gmail.com`
*   `System inserts activity records` - INSERT via trigger functions only

**transfers policies:**
*   `Allow authenticated to view transfers` - SELECT for all authenticated users
*   `Allow admin to manage transfers` - ALL operations restricted to `jana@gmail.com`

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

**Seeded Ingredients (jaen branch):**
*   Okinawa Powder (15 packs)
*   Matcha Powder (10 packs)
*   Cheesecake Powder (12 packs)
*   Dark Choco Powder (15 packs)
*   Red Velvet Powder (8 packs)
*   Fructose Syrup (25 kg)
*   Tapioca Pearls (30 kg)

**Sample Logs:**
*   Staff member1 deducted 1.0 Okinawa Powder
*   Staff member2 deducted 2.0 Dark Choco Powder
*   Admin delivered 10.0 Dark Choco Powder

---

## 5. Role-Based Access Control (RBAC) Requirements
### 5.1 Staff Layer (Add-Only)

*   **Permitted:** SELECT (view menu items), INSERT (record log entries)
*   **Blocked:** UPDATE, DELETE (protects historical raw logs from tampering)
*   **Identity Enforcement:** `logged_by` field auto-populated from JWT email, cannot be overridden
*   **Branch Scope:** Staff can only submit logs for their assigned branch
*   **Log Limits:** Maximum 50 log submissions per shift (configurable)
*   **Offline Support:** Queue submissions when offline, sync when online
### 5.2 Admin Layer (Owner Override)

*   **Permitted:** ALL PRIVILEGES on all tables
*   **Access Restriction:** Hardcoded to `jana@gmail.com` via RLS policies
*   **Capabilities:** Full CRUD, audit log access, user management, AI forensic execution
*   **Audit Trail:** All admin actions logged to audit_log table
*   **Batch Operations:** Bulk inventory updates, bulk log corrections
*   **System Settings:** Configure thresholds, notification preferences, branches
### 5.3 Authentication Flow

*   Staff logs in via Supabase Auth (email/password)
*   JWT token contains email used for RLS policy enforcement
*   Protected routes redirect unauthenticated users to login
*   Admin-only routes check email claim before rendering
*   Social login (Google) available for convenience
*   Magic link login for passwordless option
*   Email verification required for new accounts
*   Session refresh on token expiry
### 5.4 Password Policy

*   Minimum 8 characters required
*   Must contain at least one uppercase letter
*   Must contain at least one number
*   Password reset via Supabase Auth magic link
*   Admin cannot view staff passwords (hashed by Supabase)
*   Password history: Prevent reuse of last 5 passwords
*   Password expiry: 90 days (optional, admin-configurable)
*   Account lockout: 5 failed attempts = 15 minute lockout
### 5.5 Session Management

*   Session timeout: 24 hours (configurable via Supabase dashboard)
*   Refresh token rotation on active use
*   Concurrent session limit: 3 devices per user
*   Forced logout on password change
*   Session invalidation on admin account removal
*   Session activity tracking (last active timestamp)
*   Device fingerprinting for session management
*   Session export for security audit
### 5.6 Two-Factor Authentication (2FA) - Optional

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

### 6.1 Staff Form Panel (Mobile-First Layout)

*   **Location Picker:** Dropdown selector defaulting to active storefront context (e.g., `[Big Brew - Jaen]`)
*   **Action Toggle Cards:** Large visual tap boxes:
    *   "Used / Refill" (Maps to database `deduction`)
    *   "New Delivery" (Maps to database `delivery`)
*   **Ingredient Target Input:** Labeled as *Ingredients - Particulars*. Menu dropdown mapping to active flavors
*   **Quantity Entry Split-Row:** Labeled as *Quantity Opened*. Side-by-side layout:
    *   **Left:** Decimal numeric text field (e.g., `6.0`)
    *   **Right:** Unit picker dropdown (`KG`, `grams`, `per pack`)
*   **Submission Button:** High-contrast `SUBMIT LOG TO JANA`
*   **Confirmation Feedback:** Success toast with log summary after submission
*   **Loading State:** Button shows spinner + "Submitting..." text during API call
*   **Empty State:** Friendly message when no inventory items exist yet for selected branch

### 6.2 Admin Balance Audit Interface

*   **Branch View Toggle:** Instant dynamic filter to switch between `Jaen` and `Ktown`
*   **Calculation Ledger Grid:** Reads from `current_inventory_status` view:
    *   *Expected Remaining* (or *Dapat Meron Pa*) - read-only calculated field
    *   *Actual Physical Count* - editable input for admin physical inventory check
    *   *Variance Indicator* - highlights discrepancies between expected vs actual
    *   *Skeleton Loading:* Shows placeholder rows while data fetches
    *   *Empty State:* "No inventory items yet. Add ingredients to get started."
*   **AI Forensic Executor:** `RUN AI FORENSIC AUDIT` button triggers backend analysis
*   **Audit Report Panel:** Displays AI findings (anomalies, run-out projections)
*   **Confirmation Dialogs:** Required before:
    *   Deleting an inventory item
    *   Running AI forensic audit (cost awareness)
    *   Removing a staff member

### 6.3 Staff Management Page (Admin Only)

*   **Staff List Table:** Displays registered staff with email, role, last active
*   **Invite Staff Button:** Opens form to send Supabase Auth invitation
*   **Remove Staff Button:** Confirmation dialog with warning message before soft-delete

### 6.4 Analytics Dashboard (Admin Only)

*   **Summary Cards:** Key metrics at a glance
    *   Total items tracked
    *   Total logs today/this week
    *   Average consumption rate
    *   Items below threshold
*   **Consumption Chart:** Line/bar chart showing consumption trends over time
*   **Variance Report:** Table comparing expected vs actual with variance percentage
*   **Date Range Picker:** Filter analytics by custom date range
*   **Export Button:** Download report as CSV
*   **Refresh Button:** Manual data refresh for real-time updates

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

### 6.5 Responsive Breakpoints

*   **Mobile:** 0-639px (single column, full-width form)
*   **Tablet:** 640-1023px (2-column grid, side panel for audit)
*   **Desktop:** 1024px+ (full dashboard layout with sidebar)

**Mobile-Specific Behaviors:**
*   Staff form: Full-width input fields, stacked layout
*   Action toggle cards: Full-width, large touch targets (min 48px height)
*   Admin grid: Horizontal scroll for ledger table
*   Bottom navigation for mobile (instead of sidebar)

### 6.6 Accessibility (a11y) Standards

*   WCAG 2.1 AA compliance target
*   Color contrast ratio: minimum 4.5:1 for text, 3:1 for large text
*   All interactive elements keyboard navigable
*   Focus indicators visible on all focusable elements
*   ARIA labels on icon-only buttons
*   Form inputs associated with labels via `htmlFor`
*   Error messages linked to inputs via `aria-describedby`
*   Live regions for dynamic content updates (toasts, loading)
*   Skip-to-content link for keyboard users
*   Screen reader announcements for page navigation

### 6.7 Keyboard Navigation

*   `Tab` / `Shift+Tab`: Move between interactive elements
*   `Enter` / `Space`: Activate buttons and toggles
*   `Arrow keys`: Navigate within dropdowns and toggle groups
*   `Escape`: Close modals and dropdowns
*   `Ctrl+Enter`: Quick submit on forms (optional shortcut)
*   Focus trap in modals (cannot tab outside modal while open)

### 6.8 Dark/Light Mode

*   Default: Light mode (professional, clean aesthetic)
*   Dark mode: Optional toggle in user profile settings
*   Tailwind `dark:` class strategy for theme switching
*   Persist preference in localStorage
*   Respect system preference on first visit
*   Color palette adjusted for dark mode readability

### 6.9 Offline Handling & Network Resilience

*   **Network status indicator:** Persistent banner showing online/offline state
*   **Offline mode:** Staff can queue log submissions locally
*   **Service worker:** Basic caching for static assets (App Shell pattern)
*   **IndexedDB:** Store pending log submissions when offline
*   **Sync on reconnect:** Auto-submit queued logs when connection restored
*   **Conflict detection:** If item modified offline, prompt user before overwriting
*   **Offline toast:** "You're offline. Logs will be submitted when connection is restored."
*   **Maximum queue size:** 50 pending submissions
*   **Queue expiry:** Queued items older than 24 hours deleted on sync

---

## 7. Serverless AI Schema Pipeline

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

**Inventory API (`/api/inventory`)**
*   `GET /api/inventory` - List all inventory items (filtered by branch query param)
*   `POST /api/inventory` - Create new inventory item (admin only)
*   `GET /api/inventory/[itemId]` - Get single inventory item details
*   `PUT /api/inventory/[itemId]` - Update inventory item (admin only)
*   `DELETE /api/inventory/[itemId]` - Remove inventory item (admin only)

**Logs API (`/api/logs`)**
*   `GET /api/logs` - List daily logs (filtered by branch, date range, item)
*   `POST /api/logs` - Submit new log entry (staff, identity enforced)
*   `GET /api/logs/[logId]` - Get single log entry (admin only)

**Transfers API (`/api/transfers`)**
*   `GET /api/transfers` - List all transfers (filtered by branch, date range)
*   `POST /api/transfers` - Initiate cross-branch transfer (admin only)

**Audit API (`/api/audit`)**
*   `POST /api/audit` - Execute AI forensic audit on branch data (admin only)

**Users API (`/api/users`)**
*   `GET /api/users` - List all staff users (admin only)
*   `POST /api/users` - Invite new staff member (admin only)
*   `DELETE /api/users/[userId]` - Remove staff member (admin only)

**Activity API (`/api/activity`)**
*   `GET /api/activity` - Get user activity logs (admin only)

**Analytics API (`/api/analytics`)**
*   `GET /api/analytics/summary` - Get daily/weekly/monthly summary (admin only)
*   `GET /api/analytics/consumption` - Get consumption trends (admin only)
*   `GET /api/analytics/variance` - Get variance reports (admin only)

**Health API (`/api/health`)**
*   `GET /api/health` - System health check (database connectivity, version info)

### 8.2 Request/Response Standards

All API responses follow a standardized format:
*   `success` (boolean) - Request success status
*   `data` (object/array, optional) - Response payload
*   `error` (object, optional) - Contains `code`, `message`, `details`
*   `metadata` (object) - Contains `timestamp`, `requestId`, `version`

### 8.3 Input Validation

All API inputs validated using Zod schemas before processing:
*   Branch IDs validated against allowed values (`jaen`, `ktown`)
*   Quantities validated as positive numbers
*   Log types validated against allowed values
*   Email formats validated for user operations
*   Request body size limits enforced

### 8.4 Error Handling

Centralized error handler middleware:
*   Custom `AppError` class with code, message, statusCode, details
*   Database errors mapped to user-friendly messages
*   Validation errors include field-level details
*   Production mode hides internal error details
*   All errors logged with full context (requestId, timestamp, user)

### 8.5 Pagination Strategy

*   **Default page size:** 25 items
*   **Maximum page size:** 100 items
*   **Cursor-based pagination** for large datasets (logs, audit trail)
*   **Response metadata:** `page`, `pageSize`, `totalCount`, `hasNextPage`, `cursor`
*   **Infinite scroll** on mobile for log history
*   **Page numbers** on desktop for inventory grid
*   **Query params:** `?page=1&pageSize=25` or `?cursor=<id>&limit=25`
*   **Search pagination:** Full-text search with pagination support
*   **Filter pagination:** Combined filters with pagination

### 8.6 API Versioning

*   **Versioning strategy:** URL path versioning (`/api/v1/...`)
*   **Current version:** v1
*   **Version header:** `X-API-Version` included in responses
*   **Deprecation policy:** 6 months notice before version removal
*   **Backward compatibility:** New fields added without breaking existing clients
*   **Breaking changes:** Major version bump required
*   **Version discovery:** `/api/versions` endpoint lists available versions
*   **Version migration:** Automated migration scripts for major version upgrades

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

### 8.7 Real-Time Subscription Strategy

*   Supabase Realtime enabled for `daily_logs` table
*   Admin dashboard subscribes to log inserts for live updates
*   Inventory grid refreshes on any inventory_master change
*   Subscription scoped to current branch (filtered by branch_id)
*   Reconnection logic with exponential backoff
*   Visual indicator when real-time is active ("Live" badge)
*   Graceful degradation to polling if WebSocket fails (30s fallback)
*   Subscription throttling: Maximum 1 subscription per table per client
*   Subscription cleanup: Unsubscribe on component unmount
*   Subscription analytics: Track subscription health and performance

### 8.8 Branch Transfer Logic

*   Admin can initiate stock transfer between branches
*   Transfer creates two log entries:
    *   Deduction from source branch
    *   Delivery to destination branch
*   Transfer logged with `transfer_id` linking both entries
*   Transfer history viewable in admin audit trail
*   Requires admin confirmation before execution
*   Both branches' inventory updated atomically (single transaction)
*   Transfer validation: Source must have sufficient stock
*   Transfer limits: Maximum quantity per transfer (configurable)
*   Transfer notification: Email alert to both branch managers
*   Transfer reversal: Admin can reverse completed transfers

### 8.9 Data Export & Reporting

*   **CSV Export:** Admin can export inventory status to CSV
*   **Date Range Filter:** Export filtered by date range
*   **Branch Filter:** Export filtered by selected branch
*   **Report Types:**
    *   Daily summary (total deductions, deliveries, net change)
    *   Weekly consumption report per ingredient
    *   Monthly variance report (expected vs actual)
    *   Staff activity report (who logged what, when)
    *   Transfer history report (cross-branch movements)
*   **Export Format:** CSV with UTF-8 encoding for Filipino characters
*   **Export Location:** Downloaded to browser, not stored on server
*   **Export Limits:** Maximum 10,000 rows per export
*   **Export Scheduling:** Optional daily/weekly email exports (admin preference)

### 8.10 User Activity Logging

*   **Login/Logout events** logged to user_activity table
*   **Failed login attempts** logged with IP and timestamp
*   **Password changes** logged (not the password itself)
*   **Session duration** tracked for usage analytics
*   **Feature usage** tracked (AI audit runs, exports, etc.)
*   **Activity retention:** 90 days (matches audit_log)
*   **Admin-only access** to activity logs
*   **Activity export:** CSV download for management review
*   **Activity alerts:** Notify admin of unusual patterns (off-hours access, multiple failed logins)

---

## 9. Security & Middleware Layer

### 9.1 Rate Limiting

*   **General API:** 100 requests per 15 minutes per IP
*   **Admin Endpoints:** 10 requests per 5 minutes per IP
*   **Auth Endpoints:** 5 requests per 5 minutes per IP
*   Rate limit headers returned in responses

### 9.2 Security Headers

*   Content Security Policy (CSP) configured for Supabase + Next.js
*   X-Frame-Options: DENY (prevent clickjacking)
*   X-Content-Type-Options: nosniff
*   Strict-Transport-Security enabled
*   Referrer Policy: strict-origin-when-cross-origin
*   Permissions Policy: camera=(), microphone=(), geolocation=()
*   X-XSS-Protection: 1; mode=block
*   Cross-Origin-Opener-Policy: same-origin
*   Cross-Origin-Resource-Policy: same-origin

### 9.3 Request Logging

All API requests logged with:
*   Request ID (unique identifier)
*   Timestamp
*   HTTP method and path
*   User email (from JWT)
*   Response status code
*   Error details (if applicable)
*   Request duration
*   Request body size
*   Response body size
*   User agent string
*   IP address (anonymized for privacy)

### 9.4 CORS Configuration

*   Allowed origins: Production domain + localhost (dev)
*   Allowed methods: GET, POST, PUT, DELETE
*   Allowed headers: Authorization, Content-Type
*   Credentials allowed for authenticated requests

### 9.5 Service Worker & Offline Caching

*   **App Shell Strategy:** Cache static assets (HTML, CSS, JS) for instant load
*   **Cache-first:** Static assets served from cache, network fallback
*   **Network-first:** API requests try network, fallback to cache
*   **Cache versioning:** Cache names include version number for easy invalidation
*   **Offline fallback:** Custom offline page when no cache available
*   **Background sync:** Queue failed requests for retry when online
*   **Cache size limit:** Maximum 50MB for offline assets
*   **Update mechanism:** New service worker activates on next page load

---

## 10. Monitoring & Observability

### 10.1 Client-Side Monitoring

*   Error boundaries on all page layouts
*   Toast notifications for user-facing errors
*   Loading states for all async operations
*   Form validation feedback in real-time
*   Performance metrics (Core Web Vitals)
*   User interaction tracking (clicks, form submissions)
*   Network error detection and reporting
*   Offline status tracking

### 10.2 Server-Side Monitoring

*   Structured JSON logging for all API routes
*   Error tracking with stack traces and context
*   Performance metrics (response times, database query duration)
*   Health check endpoint for uptime monitoring
*   Memory usage tracking
*   CPU utilization monitoring
*   Disk space alerts
*   Network latency measurement

### 10.3 Database Monitoring

*   Audit log tracks all data modifications
*   Slow query identification via index usage
*   Connection pool health checks
*   Backup verification procedures
*   Table size monitoring
*   Index usage statistics
*   Query performance analysis
*   Dead tuple detection and cleanup

### 10.4 Alerting

*   Failed login attempts (brute force detection)
*   Unusual inventory deduction patterns
*   High error rates on API endpoints
*   Database connectivity issues
*   Low stock alerts (configurable threshold)
*   Offline queue backup alerts
*   Performance degradation alerts
*   Security anomaly detection
*   Capacity planning alerts (approaching limits)

### 10.5 Monitoring Dashboard

*   **Real-time metrics:** Active users, API response times, error rates
*   **Inventory health:** Stock levels, variance trends, consumption rates
*   **System status:** Database connections, memory usage, CPU utilization
*   **User activity:** Login frequency, feature usage, session duration
*   **Exportable reports:** CSV/PDF for management review
*   **Historical trends:** 7-day, 30-day, 90-day comparison charts
*   **Alert configuration:** Customizable thresholds and notification channels
*   **Performance tracking:** Response time percentiles (p50, p95, p99)
*   **Error tracking:** Error rate trends, top errors, resolution time

### 10.5 Connection Pooling

*   Supabase connection pooler enabled (PgBouncer)
*   Maximum connections: 50 (Supabase default)
*   Connection timeout: 10 seconds
*   Idle timeout: 300 seconds (5 minutes)
*   Serverless function connection reuse via Supabase client singleton
*   No raw connection management in application code (handled by Supabase SDK)

---

## 11. Testing Strategy

### 11.1 Unit Testing

*   Component rendering tests (React Testing Library)
*   Utility function tests (Jest)
*   Validation schema tests (Zod)
*   API route handler tests (mocked Supabase)
*   Hook behavior tests
*   Error handling tests
*   Form validation tests
*   Date/time utility tests

### 11.2 Integration Testing

*   End-to-end staff log submission flow
*   Admin inventory audit workflow
*   Authentication and authorization flows
*   Branch switching and data filtering
*   Cross-branch transfer workflow
*   Offline queue sync testing
*   Export functionality testing
*   Real-time subscription testing

### 11.3 Database Testing

*   RLS policy verification (staff cannot delete)
*   Audit trigger functionality
*   View calculation accuracy
*   Constraint enforcement
*   Index performance verification
*   Connection pool behavior
*   Data integrity checks
*   Backup and recovery testing

### 11.4 Load Testing

*   Concurrent log submissions
*   Multiple admin sessions
*   Real-time subscription performance
*   Database connection pool stress
*   API rate limit effectiveness
*   Offline queue sync performance
*   Large dataset pagination
*   Export functionality under load

---

## 12. CI/CD Pipeline

### 12.1 Pipeline Stages

**On Push to `develop`:**
1. Install dependencies (`npm ci`)
2. Run linting (`npm run lint`)
3. Run type checking (`npm run typecheck`)
4. Run unit tests (`npm run test`)
5. Build application (`npm run build`)
6. Deploy to staging environment

**On Push to `main`:**
1. All staging checks pass
2. Integration tests pass
3. Build production bundle
4. Deploy to production environment
5. Post-deployment health check

### 12.2 Quality Gates

*   Zero lint errors
*   Zero type errors
*   90%+ test coverage
*   Build succeeds without warnings
*   Health check passes post-deploy
*   Lighthouse score > 90 (performance, accessibility, best practices)
*   Bundle size within threshold (< 500KB initial)
*   Security audit passes (no critical vulnerabilities)

### 12.3 Environment Management

*   Staging: Auto-deployed from `develop` branch
*   Production: Auto-deployed from `main` branch
*   Rollback: Manual trigger via GitHub Actions workflow dispatch
*   Secrets: Stored in GitHub repository secrets, injected at build time
*   Feature flags: LaunchDarkly or similar for gradual rollouts
*   Environment parity: Staging mirrors production configuration
*   Blue-green deployments: Zero-downtime production updates
*   Database migrations: Run automatically on deploy

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

*   `ALLOWED_BRANCHES` - Array of valid branch IDs (`jaen`, `ktown`)
*   `ADMIN_EMAIL` - Admin email for RLS (`jana@gmail.com`)
*   `LOG_TYPES` - Valid log types (`deduction`, `delivery`)
*   `VALID_UNITS` - Valid measurement units (`kg`, `grams`, `packs`)
*   `DEFAULT_BRANCH` - Default branch for new users (`jaen`)
*   `ITEM_CATEGORIES` - Ingredient categories for grouping

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

*   Supabase automatic daily backups
*   Manual backup before schema migrations
*   Weekly database export to external storage
*   Audit log retention: 90 days minimum
*   User activity retention: 90 days minimum
*   Transfer log retention: 1 year minimum
*   Backup verification: Weekly restore test
*   Backup encryption: AES-256 for external storage

### 14.2 Data Integrity Checks

*   Daily validation procedure checks for impossible deductions
*   Negative stock alert detection
*   Orphaned log detection (logs without valid inventory items)
*   Duplicate entry prevention via unique constraints
*   Cross-branch transfer validation
*   Timestamp consistency checks
*   User email format validation
*   Quantity range validation (prevent unreasonable values)

### 14.3 Rollback Procedures

*   Database migration rollback scripts
*   Application version rollback via CI/CD
*   Configuration rollback via environment variables
*   Feature flags for gradual rollouts
*   Database schema versioning (semantic versioning)
*   Migration naming convention: `YYYYMMDDHHMMSS_description.sql`
*   Rollback testing: Every migration must have tested rollback script
*   Data migration backup: Full table backup before destructive migrations

### 14.4 Incident Response

*   Error rate spike detection
*   Automatic fallback to read-only mode
*   Admin notification system for critical failures
*   Post-incident review and documentation process
*   Incident severity levels (P0-P3)
*   Response time SLAs (P0: 15 min, P1: 1 hour, P2: 4 hours, P3: 24 hours)
*   Communication templates for stakeholders
*   Root cause analysis process

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

*   API endpoint documentation (request/response examples)
*   Database schema diagrams
*   Environment setup guide
*   Contributing guidelines
*   Code review checklist
*   Architecture decision records (ADRs)
*   Component storybook
*   API Postman collection

### 15.2 User Documentation

*   Staff user manual (log submission workflow)
*   Admin user manual (audit and management workflow)
*   FAQ and troubleshooting guide
*   Video tutorials for common operations
*   Quick reference cards (printable)
*   Onboarding checklist for new staff
*   Glossary of terms (English/Filipino)

### 15.3 Operations Documentation

*   Deployment runbook
*   Monitoring and alerting setup
*   Backup and recovery procedures
*   Security incident response plan
*   Performance tuning guide
*   Scaling procedures
*   Cost optimization strategies
*   Vendor management (Supabase, OpenAI, Vercel)

### 15.4 Security Documentation

*   Security architecture overview
*   RLS policy documentation
*   Access control matrix
*   Vulnerability assessment procedures
*   Compliance checklist (data protection)
*   Incident response playbook

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
