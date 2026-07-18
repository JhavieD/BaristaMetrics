-- ====================================================================
-- SEED ALL BRANCHES WITH BIG BREW INGREDIENTS
-- Run this once to set up all 3 branches
-- Requires: category column (run add-category-column.sql first)
-- ====================================================================

INSERT INTO public.inventory_master (branch_id, item_name, unit, starting_stock, category) VALUES
('jaen', 'Okinawa Powder', 'packs', 15.00, 'powder'),
('jaen', 'Matcha Powder', 'packs', 10.00, 'powder'),
('jaen', 'Cheesecake Powder', 'packs', 12.00, 'powder'),
('jaen', 'Dark Choco Powder', 'packs', 15.00, 'powder'),
('jaen', 'Red Velvet Powder', 'packs', 8.00, 'powder'),
('jaen', 'Fructose Syrup', 'kg', 25.00, 'liquid'),
('jaen', 'Tapioca Pearls', 'kg', 30.00, 'addon'),

('mallorca', 'Okinawa Powder', 'packs', 15.00, 'powder'),
('mallorca', 'Matcha Powder', 'packs', 10.00, 'powder'),
('mallorca', 'Cheesecake Powder', 'packs', 12.00, 'powder'),
('mallorca', 'Dark Choco Powder', 'packs', 15.00, 'powder'),
('mallorca', 'Red Velvet Powder', 'packs', 8.00, 'powder'),
('mallorca', 'Fructose Syrup', 'kg', 25.00, 'liquid'),
('mallorca', 'Tapioca Pearls', 'kg', 30.00, 'addon'),

('san-antonio', 'Okinawa Powder', 'packs', 15.00, 'powder'),
('san-antonio', 'Matcha Powder', 'packs', 10.00, 'powder'),
('san-antonio', 'Cheesecake Powder', 'packs', 12.00, 'powder'),
('san-antonio', 'Dark Choco Powder', 'packs', 15.00, 'powder'),
('san-antonio', 'Red Velvet Powder', 'packs', 8.00, 'powder'),
('san-antonio', 'Fructose Syrup', 'kg', 25.00, 'liquid'),
('san-antonio', 'Tapioca Pearls', 'kg', 30.00, 'addon')
ON CONFLICT (branch_id, item_name) DO NOTHING;
