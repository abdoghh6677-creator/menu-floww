-- Database Migrations for Payment Methods
-- إضافة أعمدة طرق الدفع
-- تاريخ: 2025

-- ================================================
-- خطوة 1: إضافة أعمدة طرق الدفع لجدول restaurants
-- ================================================

-- Payment method acceptance flags
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_cash BOOLEAN DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_instapay BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_visa BOOLEAN DEFAULT false;

-- InstaPay configuration
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instapay_username VARCHAR(255);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instapay_link VARCHAR(500);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instapay_receipt_number VARCHAR(255);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instapay_phone VARCHAR(20);

-- Order type acceptance flags
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_dine_in BOOLEAN DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_delivery BOOLEAN DEFAULT true;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS accepts_pickup BOOLEAN DEFAULT true;

-- Delivery configuration
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0;

-- WhatsApp notifications
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- ================================================
-- خطوة 2: إضافة تعليقات توثيقية
-- ================================================

COMMENT ON COLUMN restaurants.accepts_cash IS 'Whether the restaurant accepts cash on delivery';
COMMENT ON COLUMN restaurants.accepts_instapay IS 'Whether the restaurant accepts InstaPay payments';
COMMENT ON COLUMN restaurants.accepts_visa IS 'Whether the restaurant accepts Visa/Mastercard payments';
COMMENT ON COLUMN restaurants.instapay_username IS 'InstaPay username for the restaurant';
COMMENT ON COLUMN restaurants.instapay_link IS 'Direct payment link for InstaPay';
COMMENT ON COLUMN restaurants.instapay_receipt_number IS 'Receipt/phone number for InstaPay verification';
COMMENT ON COLUMN restaurants.instapay_phone IS 'Phone number associated with InstaPay account';
COMMENT ON COLUMN restaurants.accepts_dine_in IS 'Whether the restaurant accepts dine-in orders';
COMMENT ON COLUMN restaurants.accepts_delivery IS 'Whether the restaurant accepts delivery orders';
COMMENT ON COLUMN restaurants.accepts_pickup IS 'Whether the restaurant accepts pickup orders';
COMMENT ON COLUMN restaurants.delivery_fee IS 'Flat delivery fee in local currency';
COMMENT ON COLUMN restaurants.whatsapp_notifications IS 'Whether to send order notifications via WhatsApp';
COMMENT ON COLUMN restaurants.whatsapp_number IS 'WhatsApp business number for notifications';
