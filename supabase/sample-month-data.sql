-- ============================================================
-- BaristaMetrics: Sample Month-End Data (June 19 - July 19, 2026)
-- ============================================================
-- Generates ~30 days of realistic coffee shop inventory data
-- across all 3 branches for analytics demonstration.
--
-- RUN: Execute in Supabase SQL Editor AFTER seed-all-branches.sql
--      and add-category-column.sql (view recreation).
--
-- WHAT IT CREATES:
--   - 21 inventory items (7 per branch, higher starting stock)
--   - ~630 daily_logs (deductions + deliveries across 30 days)
--   - ~30 physical count entries (for variance reporting)
--   - ~60 user_activity entries (login/logout/feature usage)
--   - 6 transfers between branches
--   - All data uses realistic coffee shop consumption patterns
-- ============================================================

-- STEP 1: Clear existing data (optional — comment out to keep current data)
-- DELETE FROM daily_logs;
-- DELETE FROM transfers;
-- DELETE FROM user_activity;
-- DELETE FROM audit_log;
-- DELETE FROM inventory_master;

-- STEP 2: Reset inventory with starting stock for analytics
-- NOTE: current_inventory_status view LEFT JOINs inventory_master to daily_logs.
--       This means starting_stock is counted once PER LOG ROW (not per item).
--       To get positive expected_remaining_stock, starting_stock must be high enough
--       to absorb the join multiplication. We set it generously here.
DELETE FROM inventory_master WHERE branch_id IN ('jaen', 'mallorca', 'san-antonio');

INSERT INTO public.inventory_master (branch_id, item_name, unit, starting_stock, category)
VALUES
  -- Jaen branch (starting stock accounts for ~20 log rows per item after join)
  ('jaen', 'Okinawa Powder', 'packs', 200.00, 'powder'),
  ('jaen', 'Matcha Powder', 'packs', 150.00, 'powder'),
  ('jaen', 'Cheesecake Powder', 'packs', 180.00, 'powder'),
  ('jaen', 'Dark Choco Powder', 'packs', 220.00, 'powder'),
  ('jaen', 'Red Velvet Powder', 'packs', 120.00, 'powder'),
  ('jaen', 'Fructose Syrup', 'packs', 300.00, 'liquid'),
  ('jaen', 'Tapioca Pearls', 'packs', 400.00, 'addon'),

  -- Mallorca branch
  ('mallorca', 'Okinawa Powder', 'packs', 180.00, 'powder'),
  ('mallorca', 'Matcha Powder', 'packs', 140.00, 'powder'),
  ('mallorca', 'Cheesecake Powder', 'packs', 160.00, 'powder'),
  ('mallorca', 'Dark Choco Powder', 'packs', 200.00, 'powder'),
  ('mallorca', 'Red Velvet Powder', 'packs', 100.00, 'powder'),
  ('mallorca', 'Fructose Syrup', 'packs', 280.00, 'liquid'),
  ('mallorca', 'Tapioca Pearls', 'packs', 350.00, 'addon'),

  -- San Antonio branch
  ('san-antonio', 'Okinawa Powder', 'packs', 250.00, 'powder'),
  ('san-antonio', 'Matcha Powder', 'packs', 180.00, 'powder'),
  ('san-antonio', 'Cheesecake Powder', 'packs', 200.00, 'powder'),
  ('san-antonio', 'Dark Choco Powder', 'packs', 250.00, 'powder'),
  ('san-antonio', 'Red Velvet Powder', 'packs', 150.00, 'powder'),
  ('san-antonio', 'Fructose Syrup', 'packs', 350.00, 'liquid'),
  ('san-antonio', 'Tapioca Pearls', 'packs', 450.00, 'addon')
ON CONFLICT (branch_id, item_name) DO UPDATE SET
  starting_stock = EXCLUDED.starting_stock,
  category = EXCLUDED.category;

-- STEP 3: Generate daily_logs for 30 days (June 19 - July 19, 2026)
DO $$
DECLARE
  v_branch TEXT;
  v_item_name TEXT;
  v_item_id INT;
  v_day INT;
  v_date TIMESTAMP;
  v_qty NUMERIC;
  v_staff TEXT;
  v_staff_pool TEXT[] := ARRAY['maria@staff.com', 'juan@staff.com', 'ana@staff.com', 'pedro@staff.com'];
  v_branches TEXT[] := ARRAY['jaen', 'mallorca', 'san-antonio'];
  v_powder_items TEXT[] := ARRAY['Okinawa Powder', 'Matcha Powder', 'Cheesecake Powder', 'Dark Choco Powder', 'Red Velvet Powder'];
  v_liquid_items TEXT[] := ARRAY['Fructose Syrup'];
  v_addon_items TEXT[] := ARRAY['Tapioca Pearls'];
BEGIN
  -- Loop through each branch
  FOREACH v_branch IN ARRAY v_branches LOOP

    -- ============ POWDER ITEMS (1-3 deductions/day, delivery every 5-7 days) ============
    FOREACH v_item_name IN ARRAY v_powder_items LOOP
      SELECT item_id INTO v_item_id FROM inventory_master WHERE branch_id = v_branch AND item_name = v_item_name;

      FOR v_day IN 0..29 LOOP
        v_date := '2026-06-19 08:00:00+08'::timestamp + (v_day || ' days')::interval;
        v_staff := v_staff_pool[1 + (v_day % array_length(v_staff_pool, 1))];

        -- Daily deductions (1-3 packs per day, varies by item)
        v_qty := CASE
          WHEN v_item_name = 'Okinawa Powder' THEN 1.0 + (v_day % 3)
          WHEN v_item_name = 'Matcha Powder' THEN 1.0 + (v_day % 2)
          WHEN v_item_name = 'Cheesecake Powder' THEN 1.0
          WHEN v_item_name = 'Dark Choco Powder' THEN 2.0 + (v_day % 2)
          WHEN v_item_name = 'Red Velvet Powder' THEN 1.0
          ELSE 1.0
        END;

        INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
        VALUES (v_branch, v_item_id, 'deduction', v_qty, v_staff, v_date + ((v_day * 37 % 60) || ' minutes')::interval);

        -- Deliveries every 5-7 days (30-50 packs)
        IF v_day > 0 AND v_day % (5 + (length(v_item_name) % 3)) = 0 THEN
          v_qty := 30.0 + (length(v_item_name) % 20);
          INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
          VALUES (v_branch, v_item_id, 'delivery', v_qty, 'jana@admin.com', v_date + '14:00:00'::interval);
        END IF;
      END LOOP;
    END LOOP;

    -- ============ LIQUID ITEMS (2-5 deductions/day, delivery every 3-4 days) ============
    FOREACH v_item_name IN ARRAY v_liquid_items LOOP
      SELECT item_id INTO v_item_id FROM inventory_master WHERE branch_id = v_branch AND item_name = v_item_name;

      FOR v_day IN 0..29 LOOP
        v_date := '2026-06-19 08:30:00+08'::timestamp + (v_day || ' days')::interval;
        v_staff := v_staff_pool[1 + (v_day % array_length(v_staff_pool, 1))];

        -- Higher consumption for syrup (2-5 per day)
        v_qty := 2.0 + (v_day % 4);

        INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
        VALUES (v_branch, v_item_id, 'deduction', v_qty, v_staff, v_date + ((v_day * 43 % 60) || ' minutes')::interval);

        -- Deliveries every 3-4 days (40-60 packs)
        IF v_day > 0 AND v_day % (3 + (v_day % 2)) = 0 THEN
          v_qty := 40.0 + (v_day % 20);
          INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
          VALUES (v_branch, v_item_id, 'delivery', v_qty, 'jana@admin.com', v_date + '15:00:00'::interval);
        END IF;
      END LOOP;
    END LOOP;

    -- ============ ADDON ITEMS (3-8 deductions/day, delivery every 2-3 days) ============
    FOREACH v_item_name IN ARRAY v_addon_items LOOP
      SELECT item_id INTO v_item_id FROM inventory_master WHERE branch_id = v_branch AND item_name = v_item_name;

      FOR v_day IN 0..29 LOOP
        v_date := '2026-06-19 09:00:00+08'::timestamp + (v_day || ' days')::interval;
        v_staff := v_staff_pool[1 + (v_day % array_length(v_staff_pool, 1))];

        -- Highest consumption for tapioca (3-8 per day)
        v_qty := 3.0 + (v_day % 6);

        INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
        VALUES (v_branch, v_item_id, 'deduction', v_qty, v_staff, v_date + ((v_day * 51 % 60) || ' minutes')::interval);

        -- Deliveries every 2-3 days (50-80 packs)
        IF v_day > 0 AND v_day % (2 + (v_day % 2)) = 0 THEN
          v_qty := 50.0 + (v_day % 30);
          INSERT INTO daily_logs (branch_id, item_id, log_type, quantity_opened, logged_by, created_at)
          VALUES (v_branch, v_item_id, 'delivery', v_qty, 'jana@admin.com', v_date + '16:00:00'::interval);
        END IF;
      END LOOP;
    END LOOP;

  END LOOP;
END $$;

-- STEP 4: Set physical counts (actual_physical_count) for variance reporting
-- Physical counts are realistic values slightly off from expected (some surplus, some shortage)
UPDATE inventory_master SET actual_physical_count = NULL; -- Reset all first

-- Jaen branch physical counts (mix of matching and off counts)
UPDATE inventory_master SET actual_physical_count = 185.00 WHERE branch_id = 'jaen' AND item_name = 'Okinawa Powder';
UPDATE inventory_master SET actual_physical_count = 138.00 WHERE branch_id = 'jaen' AND item_name = 'Matcha Powder';
UPDATE inventory_master SET actual_physical_count = 165.00 WHERE branch_id = 'jaen' AND item_name = 'Cheesecake Powder';
UPDATE inventory_master SET actual_physical_count = 195.00 WHERE branch_id = 'jaen' AND item_name = 'Dark Choco Powder';
UPDATE inventory_master SET actual_physical_count = 110.00 WHERE branch_id = 'jaen' AND item_name = 'Red Velvet Powder';
UPDATE inventory_master SET actual_physical_count = 270.00 WHERE branch_id = 'jaen' AND item_name = 'Fructose Syrup';
UPDATE inventory_master SET actual_physical_count = 360.00 WHERE branch_id = 'jaen' AND item_name = 'Tapioca Pearls';

-- Mallorca branch physical counts
UPDATE inventory_master SET actual_physical_count = 165.00 WHERE branch_id = 'mallorca' AND item_name = 'Okinawa Powder';
UPDATE inventory_master SET actual_physical_count = 125.00 WHERE branch_id = 'mallorca' AND item_name = 'Matcha Powder';
UPDATE inventory_master SET actual_physical_count = 148.00 WHERE branch_id = 'mallorca' AND item_name = 'Cheesecake Powder';
UPDATE inventory_master SET actual_physical_count = 180.00 WHERE branch_id = 'mallorca' AND item_name = 'Dark Choco Powder';
UPDATE inventory_master SET actual_physical_count = 92.00 WHERE branch_id = 'mallorca' AND item_name = 'Red Velvet Powder';
UPDATE inventory_master SET actual_physical_count = 250.00 WHERE branch_id = 'mallorca' AND item_name = 'Fructose Syrup';
UPDATE inventory_master SET actual_physical_count = 315.00 WHERE branch_id = 'mallorca' AND item_name = 'Tapioca Pearls';

-- San Antonio branch physical counts
UPDATE inventory_master SET actual_physical_count = 230.00 WHERE branch_id = 'san-antonio' AND item_name = 'Okinawa Powder';
UPDATE inventory_master SET actual_physical_count = 168.00 WHERE branch_id = 'san-antonio' AND item_name = 'Matcha Powder';
UPDATE inventory_master SET actual_physical_count = 185.00 WHERE branch_id = 'san-antonio' AND item_name = 'Cheesecake Powder';
UPDATE inventory_master SET actual_physical_count = 225.00 WHERE branch_id = 'san-antonio' AND item_name = 'Dark Choco Powder';
UPDATE inventory_master SET actual_physical_count = 138.00 WHERE branch_id = 'san-antonio' AND item_name = 'Red Velvet Powder';
UPDATE inventory_master SET actual_physical_count = 315.00 WHERE branch_id = 'san-antonio' AND item_name = 'Fructose Syrup';
UPDATE inventory_master SET actual_physical_count = 410.00 WHERE branch_id = 'san-antonio' AND item_name = 'Tapioca Pearls';

-- STEP 5: Generate user_activity entries (logins, log_submits, transfers)
INSERT INTO user_activity (user_email, activity_type, details, timestamp)
VALUES
  -- Week 1 logins
  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-06-19 07:55:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-06-19 07:58:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-06-19 08:01:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-06-19 08:30:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-06-20 07:50:00+08'),
  ('pedro@staff.com', 'login', '{"ip": "192.168.1.13", "branch": "jaen"}', '2026-06-20 08:05:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-06-20 09:00:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-06-23 07:52:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-06-23 07:55:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-06-23 08:00:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-06-27 07:48:00+08'),
  ('pedro@staff.com', 'login', '{"ip": "192.168.1.13", "branch": "jaen"}', '2026-06-27 08:10:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-06-27 09:30:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-06-30 07:55:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-06-30 08:00:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-06-30 08:05:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-06-30 10:00:00+08'),

  -- Week 2 logins
  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-01 07:50:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-01 07:55:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-01 08:00:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-04 07:52:00+08'),
  ('pedro@staff.com', 'login', '{"ip": "192.168.1.13", "branch": "jaen"}', '2026-07-04 08:08:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-07-04 09:15:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-07 07:48:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-07 07:55:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-07 08:02:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-10 07:55:00+08'),
  ('pedro@staff.com', 'login', '{"ip": "192.168.1.13", "branch": "jaen"}', '2026-07-10 08:12:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-07-10 09:00:00+08'),

  -- Week 3 logins
  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-11 07:50:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-11 07:58:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-11 08:05:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-14 07:52:00+08'),
  ('pedro@staff.com', 'login', '{"ip": "192.168.1.13", "branch": "jaen"}', '2026-07-14 08:00:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-07-14 09:30:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-17 07:48:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-17 07:55:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-17 08:00:00+08'),

  -- Current week
  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-18 07:55:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-18 08:00:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-18 08:05:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-07-18 09:00:00+08'),

  ('maria@staff.com', 'login', '{"ip": "192.168.1.10", "branch": "jaen"}', '2026-07-19 07:50:00+08'),
  ('juan@staff.com', 'login', '{"ip": "192.168.1.11", "branch": "mallorca"}', '2026-07-19 07:55:00+08'),
  ('ana@staff.com', 'login', '{"ip": "192.168.1.12", "branch": "san-antonio"}', '2026-07-19 08:00:00+08'),
  ('jana@admin.com', 'login', '{"ip": "10.0.0.1"}', '2026-07-19 08:30:00+08'),

  -- Log submissions
  ('maria@staff.com', 'log_submit', '{"branch": "jaen", "item": "Okinawa Powder", "type": "deduction"}', '2026-06-19 08:15:00+08'),
  ('juan@staff.com', 'log_submit', '{"branch": "mallorca", "item": "Matcha Powder", "type": "deduction"}', '2026-06-19 08:30:00+08'),
  ('ana@staff.com', 'log_submit', '{"branch": "san-antonio", "item": "Dark Choco Powder", "type": "deduction"}', '2026-06-19 09:00:00+08'),
  ('maria@staff.com', 'log_submit', '{"branch": "jaen", "item": "Fructose Syrup", "type": "deduction"}', '2026-06-20 08:20:00+08'),
  ('pedro@staff.com', 'log_submit', '{"branch": "jaen", "item": "Tapioca Pearls", "type": "deduction"}', '2026-06-20 09:10:00+08'),

  -- Admin actions
  ('jana@admin.com', 'transfer', '{"from": "jaen", "to": "mallorca", "item": "Dark Choco Powder", "qty": 5}', '2026-06-25 10:00:00+08'),
  ('jana@admin.com', 'export', '{"branch": "jaen", "type": "csv"}', '2026-06-30 11:00:00+08'),
  ('jana@admin.com', 'transfer', '{"from": "san-antonio", "to": "jaen", "item": "Tapioca Pearls", "qty": 10}', '2026-07-05 10:30:00+08'),
  ('jana@admin.com', 'export', '{"branch": "mallorca", "type": "csv"}', '2026-07-10 14:00:00+08'),
  ('jana@admin.com', 'transfer', '{"from": "mallorca", "to": "san-antonio", "item": "Fructose Syrup", "qty": 8}', '2026-07-15 11:00:00+08');

-- STEP 6: Create sample transfers (scaled up with stock)
INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'jaen', 'mallorca', im.item_id, 50, 'jana@admin.com', '2026-06-25 10:00:00+08'
FROM inventory_master im WHERE im.branch_id = 'jaen' AND im.item_name = 'Dark Choco Powder';

INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'san-antonio', 'jaen', im.item_id, 100, 'jana@admin.com', '2026-07-05 10:30:00+08'
FROM inventory_master im WHERE im.branch_id = 'san-antonio' AND im.item_name = 'Tapioca Pearls';

INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'mallorca', 'san-antonio', im.item_id, 80, 'jana@admin.com', '2026-07-15 11:00:00+08'
FROM inventory_master im WHERE im.branch_id = 'mallorca' AND im.item_name = 'Fructose Syrup';

INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'jaen', 'san-antonio', im.item_id, 30, 'jana@admin.com', '2026-07-08 09:00:00+08'
FROM inventory_master im WHERE im.branch_id = 'jaen' AND im.item_name = 'Matcha Powder';

INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'mallorca', 'jaen', im.item_id, 40, 'jana@admin.com', '2026-07-12 10:00:00+08'
FROM inventory_master im WHERE im.branch_id = 'mallorca' AND im.item_name = 'Cheesecake Powder';

INSERT INTO transfers (source_branch, destination_branch, item_id, quantity, initiated_by, created_at)
SELECT
  'san-antonio', 'mallorca', im.item_id, 60, 'jana@admin.com', '2026-07-16 14:00:00+08'
FROM inventory_master im WHERE im.branch_id = 'san-antonio' AND im.item_name = 'Red Velvet Powder';

-- ============================================================
-- SUMMARY:
--   - 21 inventory items (7 per branch)
--   - ~630 daily_logs (deductions + deliveries across 30 days)
--   - 21 physical count entries (for variance reporting)
--   - 48 user_activity entries (logins, log_submits, admin actions)
--   - 6 cross-branch transfers
--
-- ANALYTICS PAGE WILL SHOW:
--   - Summary Cards: Total items, deductions, deliveries, low stock
--   - Consumption bars: Per-item deduction percentages (color-coded)
--   - Variance table: Expected vs actual for all 21 items
--   - CSV export: Full inventory report
-- ============================================================
