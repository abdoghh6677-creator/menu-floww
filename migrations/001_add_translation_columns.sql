-- ملف الترجمة إلى قاعدة البيانات
-- Database Migrations for Auto-Translation System
-- تاريخ: 2025

-- ================================================
-- خطوة 1: إضافة أعمدة الترجمة لجدول item_variants
-- ================================================

ALTER TABLE item_variants ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE item_variants ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE item_variants ADD COLUMN IF NOT EXISTS name_de VARCHAR(255);
ALTER TABLE item_variants ADD COLUMN IF NOT EXISTS name_ru VARCHAR(255);
ALTER TABLE item_variants ADD COLUMN IF NOT EXISTS name_ja VARCHAR(255);

-- ================================================
-- خطوة 2: إضافة أعمدة الترجمة لجدول menu_addons
-- ================================================

ALTER TABLE menu_addons ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE menu_addons ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE menu_addons ADD COLUMN IF NOT EXISTS name_de VARCHAR(255);
ALTER TABLE menu_addons ADD COLUMN IF NOT EXISTS name_ru VARCHAR(255);
ALTER TABLE menu_addons ADD COLUMN IF NOT EXISTS name_ja VARCHAR(255);

-- ================================================
-- خطوة 2b: إضافة أعمدة الترجمة لجدول menu_items (مفقودة مسبقًا)
-- ================================================

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_de VARCHAR(255);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_ru VARCHAR(255);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_ja VARCHAR(255);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_de TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_ru TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_ja TEXT;

-- ================================================
-- اختياري: ملء الأعمدة الجديدة للبيانات القديمة
-- ================================================
-- إذا كان لديك بيانات قديمة وتريد تعبئة حقول الترجمة بـ الأسماء الأصلية:

UPDATE item_variants SET 
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name),
  name_de = COALESCE(name_de, name),
  name_ru = COALESCE(name_ru, name),
  name_ja = COALESCE(name_ja, name)
WHERE name_en IS NULL OR name_fr IS NULL OR name_de IS NULL OR name_ru IS NULL OR name_ja IS NULL;

UPDATE menu_addons SET 
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name),
  name_de = COALESCE(name_de, name),
  name_ru = COALESCE(name_ru, name),
  name_ja = COALESCE(name_ja, name)
WHERE name_en IS NULL OR name_fr IS NULL OR name_de IS NULL OR name_ru IS NULL OR name_ja IS NULL;

-- Backfill translations for menu_items: copy original Arabic/name into new columns if empty
UPDATE menu_items SET
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name),
  name_de = COALESCE(name_de, name),
  name_ru = COALESCE(name_ru, name),
  name_ja = COALESCE(name_ja, name),
  description_en = COALESCE(description_en, description),
  description_fr = COALESCE(description_fr, description),
  description_de = COALESCE(description_de, description),
  description_ru = COALESCE(description_ru, description),
  description_ja = COALESCE(description_ja, description)
WHERE name_en IS NULL OR name_fr IS NULL OR name_de IS NULL OR name_ru IS NULL OR name_ja IS NULL
   OR description_en IS NULL OR description_fr IS NULL OR description_de IS NULL OR description_ru IS NULL OR description_ja IS NULL;

-- ================================================
-- خطوة 3: إضافة تعليقات توثيقية (اختياري)
-- ================================================

COMMENT ON COLUMN item_variants.name_en IS 'English name of the variant';
COMMENT ON COLUMN item_variants.name_fr IS 'French name of the variant';
COMMENT ON COLUMN item_variants.name_de IS 'German name of the variant';
COMMENT ON COLUMN item_variants.name_ru IS 'Russian name of the variant';
COMMENT ON COLUMN item_variants.name_ja IS 'Japanese name of the variant';

COMMENT ON COLUMN menu_addons.name_en IS 'English name of the addon';
COMMENT ON COLUMN menu_addons.name_fr IS 'French name of the addon';
COMMENT ON COLUMN menu_addons.name_de IS 'German name of the addon';
COMMENT ON COLUMN menu_addons.name_ru IS 'Russian name of the addon';
COMMENT ON COLUMN menu_addons.name_ja IS 'Japanese name of the addon';

COMMENT ON COLUMN menu_items.name_en IS 'English name of the item';
COMMENT ON COLUMN menu_items.name_fr IS 'French name of the item';
COMMENT ON COLUMN menu_items.name_de IS 'German name of the item';
COMMENT ON COLUMN menu_items.name_ru IS 'Russian name of the item';
COMMENT ON COLUMN menu_items.name_ja IS 'Japanese name of the item';

COMMENT ON COLUMN menu_items.description_en IS 'English description of the item';
COMMENT ON COLUMN menu_items.description_fr IS 'French description of the item';
COMMENT ON COLUMN menu_items.description_de IS 'German description of the item';
COMMENT ON COLUMN menu_items.description_ru IS 'Russian description of the item';
COMMENT ON COLUMN menu_items.description_ja IS 'Japanese description of the item';

-- ================================================
-- تحقق من الأعمدة الجديدة
-- ================================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'item_variants';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'menu_addons';
