-- Add category column to inventory_master
-- Run this in Supabase SQL Editor

ALTER TABLE inventory_master
ADD COLUMN category TEXT NOT NULL DEFAULT 'powder'
CHECK (category IN ('powder', 'liquid', 'addon'));
