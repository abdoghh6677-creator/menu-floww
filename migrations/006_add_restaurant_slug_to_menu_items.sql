-- Migration: Add restaurant_slug to menu_items
ALTER TABLE menu_items ADD COLUMN restaurant_slug VARCHAR(255);
UPDATE menu_items SET restaurant_slug = (SELECT slug FROM restaurants WHERE restaurants.id = menu_items.restaurant_id);
CREATE INDEX idx_menu_items_restaurant_slug ON menu_items(restaurant_slug);