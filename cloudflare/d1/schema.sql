-- AdoptPaws D1 schema for full Cloudflare migration

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'Dog',
  breed TEXT,
  age INTEGER NOT NULL DEFAULT 1,
  gender TEXT NOT NULL DEFAULT 'unknown',
  price REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  medical_history TEXT,
  personality_traits TEXT,
  category TEXT NOT NULL DEFAULT 'dogs',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history_timeline (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  product_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  products TEXT,
  total_amount REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  push_notifications INTEGER NOT NULL DEFAULT 1,
  sms_notifications INTEGER NOT NULL DEFAULT 0,
  marketing_emails INTEGER NOT NULL DEFAULT 0,
  adoption_updates INTEGER NOT NULL DEFAULT 1,
  message_alerts INTEGER NOT NULL DEFAULT 1,
  dark_mode_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_user ON adoption_requests(user_id, created_at);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name', 'AdoptPaws'),
  ('contact_email', 'info@adoptpaws.com'),
  ('contact_phone', '(555) 123-4567'),
  ('contact_address', '150 Park Row, New York, NY 10007');

INSERT OR IGNORE INTO categories (id, name, slug, description, display_order) VALUES
  ('1', 'All Pets', 'all', 'Browse all available pets', 1),
  ('2', 'Dogs', 'dogs', 'Loyal and loving canine companions', 2),
  ('3', 'Cats', 'cats', 'Independent and affectionate feline friends', 3),
  ('4', 'Special Needs', 'special-needs', 'Pets requiring extra care and love', 4);

INSERT OR IGNORE INTO team_members (id, name, role, bio, photo, display_order) VALUES
  ('t1', 'Dr. Sarah Chen', 'Founder & Director', 'Animal lover and community advocate with 15 years of experience in animal welfare.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop', 1),
  ('t2', 'Michael Rodriguez', 'Adoption Coordinator', 'Former veterinary assistant passionate about finding perfect matches for our pets.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 2),
  ('t3', 'Emily Watson', 'Veterinary Care Manager', 'Licensed veterinary technician with a decade of experience in rescue care.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop', 3);

INSERT OR IGNORE INTO history_timeline (id, year, title, description, display_order) VALUES
  ('h1', '2012', 'The Beginning', 'AdoptPaws launched with a mission to find loving homes for rescued pets.', 1),
  ('h2', '2018', 'Community Growth', 'Expanded adoption services and veterinary partnerships.', 2),
  ('h3', '2026', 'Cloud-Native Future', 'Migrated the platform to run entirely on Cloudflare.', 3);

INSERT OR IGNORE INTO products (
  id, name, species, breed, age, gender, price, description, image_url,
  location, medical_history, personality_traits, category, status
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'The Three Musketeers',
    'Dog',
    'Mixed Breed',
    1,
    'unknown',
    50,
    'Playful and energetic trio of puppies looking for a loving home.',
    'https://cdn.pixabay.com/photo/2018/09/23/11/04/dog-3697190_1280.jpg',
    'New York',
    'Vaccinated',
    'Playful, social',
    'dogs',
    'available'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'PeaceMaker',
    'Dog',
    'Golden Retriever',
    2,
    'female',
    100,
    'PeaceMaker is a gentle soul who brings calm wherever she goes.',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1324&auto=format&fit=crop&ixlib=rb-4.0.3',
    'New York',
    'Vaccinated, microchipped',
    'Calm, family-friendly',
    'dogs',
    'available'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Smiley',
    'Dog',
    'Labrador',
    1,
    'male',
    150,
    'Smiley is always happy and ready for adventure.',
    'https://cdn.pixabay.com/photo/2023/02/05/19/54/dog-7770426_1280.jpg',
    'Brooklyn',
    'Vaccinated',
    'Active, cheerful',
    'dogs',
    'available'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Whiskers',
    'Cat',
    'Tabby',
    3,
    'female',
    75,
    'Whiskers is a beautiful tabby cat with stunning green eyes.',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1400&q=80',
    'Queens',
    'Spayed, vaccinated',
    'Calm, independent',
    'cats',
    'available'
  );
