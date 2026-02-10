-- Add addons_header column to menu_items to allow storing a header text for addons
ALTER TABLE IF EXISTS menu_items
  ADD COLUMN IF NOT EXISTS addons_header TEXT;

-- No backfill required; default NULL for existing rows
