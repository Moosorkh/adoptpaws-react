-- AdoptPaws Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (pets available for adoption)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('dogs', 'cats', 'special-needs')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Insert sample data from your existing products
INSERT INTO products (id, name, price, description, image_url, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'The Three Musketeers', 50.00, 
   'Playful and energetic trio of puppies looking for a loving home. They''re well-socialized and get along great with children and other pets.',
   'https://cdn.pixabay.com/photo/2018/09/23/11/04/dog-3697190_1280.jpg', 'dogs'),
  
  ('00000000-0000-0000-0000-000000000002', 'PeaceMaker', 100.00,
   'PeaceMaker is a gentle soul who brings calm wherever she goes. This sweet dog is house-trained and knows basic commands. Great with families!',
   'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'dogs'),
  
  ('00000000-0000-0000-0000-000000000003', 'Smiley', 150.00,
   'Smiley is always happy and ready for adventure! This energetic dog needs an active family who can provide plenty of exercise and outdoor activities.',
   'https://cdn.pixabay.com/photo/2023/02/05/19/54/dog-7770426_1280.jpg', 'dogs'),
  
  ('00000000-0000-0000-0000-000000000004', 'Whiskers', 75.00,
   'Whiskers is a beautiful tabby cat with stunning green eyes. She''s calm, independent, and loves to curl up in sunny spots for afternoon naps.',
   'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80', 'cats'),
  
  ('00000000-0000-0000-0000-000000000005', 'Shadow', 85.00,
   'Shadow is a sleek black cat with a playful personality. He''s curious and loves interactive toys. Would do well in a home with older children.',
   'https://images.unsplash.com/photo-1570018144715-43110363d70a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80', 'cats'),
  
  ('00000000-0000-0000-0000-000000000006', 'Lucky', 120.00,
   'Lucky is a special dog who was born with only three legs, but it doesn''t slow him down one bit! He''s full of life and loves everyone he meets.',
   'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80', 'special-needs')
ON CONFLICT (id) DO NOTHING;
