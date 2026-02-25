-- Migration: Add slug column to restaurants
ALTER TABLE restaurants ADD COLUMN slug VARCHAR(255) UNIQUE;
-- Optionally fill slug for existing restaurants
UPDATE restaurants SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;