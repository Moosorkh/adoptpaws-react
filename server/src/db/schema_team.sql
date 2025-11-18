-- Drop tables if they exist
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS history_timeline CASCADE;

-- Team Members Table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  photo VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- History Timeline Table
CREATE TABLE history_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_history_timeline_updated_at
  BEFORE UPDATE ON history_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed team members data
INSERT INTO team_members (name, role, bio, photo, display_order) VALUES
('Dr. Sarah Chen', 'Founder & Director', 'Animal lover and community advocate with 15 years of experience in animal welfare. Dr. Chen founded AdoptPaws with a mission to create lasting bonds between pets and families.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop', 1),
('Michael Rodriguez', 'Adoption Coordinator', 'Former veterinary assistant passionate about finding perfect matches for our pets. Michael brings expertise in animal behavior and family counseling to every adoption.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 2),
('Emily Watson', 'Veterinary Care Manager', 'Licensed veterinary technician with a decade of experience. Emily ensures all our animals receive top-quality medical care and are healthy before adoption.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop', 3),
('James Park', 'Community Outreach Director', 'Dedicated to building partnerships and educating the community about responsible pet ownership. James organizes adoption events and volunteer programs.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop', 4),
('Lisa Thompson', 'Foster Program Manager', 'Coordinates our network of foster families who provide temporary homes for animals. Lisa has personally fostered over 100 animals in her career.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', 5),
('David Kim', 'Operations Manager', 'Handles daily operations and facility management. David ensures our shelter runs smoothly and provides the best environment for our animals.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', 6)
ON CONFLICT DO NOTHING;

-- Seed history timeline data
INSERT INTO history_timeline (year, title, description, display_order) VALUES
('2012', 'The Beginning', 'AdoptPaws was founded with a simple mission: to find loving homes for abandoned and rescued animals. Started in a small facility with just 3 volunteers.', 1),
('2014', 'First Major Milestone', 'Reached 500 successful adoptions and expanded our facility to accommodate 50 animals. Launched our volunteer training program.', 2),
('2016', 'Community Growth', 'Partnered with 10 local veterinary clinics and established our foster network. Introduced our special needs animal program.', 3),
('2018', 'Digital Transformation', 'Launched our first online adoption platform, making it easier for families to find their perfect pet. Adoptions increased by 60%.', 4),
('2020', 'Pandemic Response', 'Adapted operations during COVID-19, implemented virtual meet-and-greets, and saw record adoption numbers as families sought companionship.', 5),
('2023', 'Major Expansion', 'Opened a second facility and reached 5,000 total adoptions. Launched mobile adoption events and educational programs in schools.', 6),
('2025', 'Innovation & Growth', 'Introduced AI-powered pet matching system and expanded to serve three counties. Continuing our mission with cutting-edge technology.', 7)
ON CONFLICT DO NOTHING;
