-- Add brand domain and product variant columns to food_preferences table
-- These support the brand autocomplete feature with logo display

-- Add brand_domain column for fetching logos from Clearbit API
ALTER TABLE food_preferences ADD COLUMN IF NOT EXISTS brand_domain TEXT;

-- Add product_variant column for storing flavor/formula selection
ALTER TABLE food_preferences ADD COLUMN IF NOT EXISTS product_variant TEXT;

-- Note: The table originally had a UNIQUE constraint on pet_id, but the app
-- supports multiple food preferences per pet. If the constraint exists, remove it:
ALTER TABLE food_preferences DROP CONSTRAINT IF EXISTS food_preferences_pet_id_key;
