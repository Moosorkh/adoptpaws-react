-- Migration: Add missing fields for user dashboard functionality
-- Run this to update your existing database

-- Add breed and age columns to products if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS breed VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS age VARCHAR(50);

-- Update existing products with breed and age data
UPDATE products SET breed = 'Mixed Breed', age = '3 months' WHERE id = '00000000-0000-0000-0000-000000000001' AND breed IS NULL;
UPDATE products SET breed = 'Golden Retriever', age = '2 years' WHERE id = '00000000-0000-0000-0000-000000000002' AND breed IS NULL;
UPDATE products SET breed = 'Labrador', age = '1 year' WHERE id = '00000000-0000-0000-0000-000000000003' AND breed IS NULL;
UPDATE products SET breed = 'Tabby', age = '3 years' WHERE id = '00000000-0000-0000-0000-000000000004' AND breed IS NULL;
UPDATE products SET breed = 'Domestic Shorthair', age = '2 years' WHERE id = '00000000-0000-0000-0000-000000000005' AND breed IS NULL;
UPDATE products SET breed = 'Mixed Breed', age = '4 years' WHERE id = '00000000-0000-0000-0000-000000000006' AND breed IS NULL;

-- Add product_id to adoption_requests if it doesn't exist
ALTER TABLE adoption_requests ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Make products and total_amount nullable for adoption_requests (if they were required before)
ALTER TABLE adoption_requests ALTER COLUMN products DROP NOT NULL;
ALTER TABLE adoption_requests ALTER COLUMN total_amount DROP NOT NULL;

-- Ensure user_id exists on adoption_requests (should already exist from schema_users.sql)
ALTER TABLE adoption_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_adoption_requests_user_id ON adoption_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_product_id ON adoption_requests(product_id);
