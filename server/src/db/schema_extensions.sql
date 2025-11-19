-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table for site configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- History timeline table
CREATE TABLE IF NOT EXISTS history_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adoption requests table
CREATE TABLE IF NOT EXISTS adoption_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_address TEXT,
  products JSONB,
  total_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_adoption_status ON adoption_requests(status, created_at);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('site_name', 'AdoptPaws'),
  ('contact_email', 'info@adoptpaws.com'),
  ('contact_phone', '(555) 123-4567'),
  ('contact_address', '150 Park Row, New York, NY 10007'),
  ('shelter_hours_weekday', '9:00 AM - 6:00 PM'),
  ('shelter_hours_saturday', '10:00 AM - 5:00 PM'),
  ('shelter_hours_sunday', '11:00 AM - 4:00 PM')
ON CONFLICT (key) DO NOTHING;

-- Insert team members
INSERT INTO team_members (name, role, photo_url, bio, display_order) VALUES
  ('Mehdi Azar', 'Founder & Director', 'https://randomuser.me/api/portraits/men/32.jpg', 
   'Animal lover and community advocate with 15 years of experience in animal welfare.', 1),
  ('Sarah Johnson', 'Adoption Coordinator', 'https://randomuser.me/api/portraits/women/44.jpg',
   'Former veterinary assistant passionate about finding perfect matches for our pets.', 2),
  ('David Chen', 'Veterinarian', 'https://randomuser.me/api/portraits/men/76.jpg',
   'Certified veterinarian ensuring all our animals receive the care they need.', 3)
ON CONFLICT DO NOTHING;

-- Insert history timeline
INSERT INTO history_timeline (year, title, description, display_order) VALUES
  ('2012', 'Foundation', 'AdoptPaws was founded with just 5 volunteers and a small facility.', 1),
  ('2015', 'Expansion', 'Moved to our current location and expanded services to include community education.', 2),
  ('2018', 'Community Impact', 'Reached our 1000th successful adoption and launched our outreach program.', 3),
  ('2026', 'The Future', 'Expanding digital presence to help even more pets find their forever homes.', 4)
ON CONFLICT DO NOTHING;

-- Insert categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('All Pets', 'all', 'Browse all available pets', 1),
  ('Dogs', 'dogs', 'Loyal and loving canine companions', 2),
  ('Cats', 'cats', 'Independent and affectionate feline friends', 3),
  ('Special Needs', 'special-needs', 'Pets requiring extra care and love', 4)
ON CONFLICT (slug) DO NOTHING;
