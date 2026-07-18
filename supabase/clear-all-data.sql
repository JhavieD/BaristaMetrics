-- Clear all data so admin can add ingredients fresh
-- Run this in Supabase SQL Editor

DELETE FROM daily_logs;
DELETE FROM transfers;
DELETE FROM audit_log;
DELETE FROM activity_log;
DELETE FROM inventory_master;

-- Reset sequences if needed
ALTER SEQUENCE inventory_master_item_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_logs_log_id_seq RESTART WITH 1;
ALTER SEQUENCE transfers_transfer_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_log_audit_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_log_activity_id_seq RESTART WITH 1;
