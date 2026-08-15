-- Synchronize public AdoptPaws content with the local PostgreSQL seed data.
-- This intentionally does not modify users, favorites, notifications, or adoption requests.

INSERT INTO team_members (id, name, role, bio, photo, display_order) VALUES
  ('t1', 'Dr. Sarah Chen', 'Founder & Director', 'Animal lover and community advocate with 15 years of experience in animal welfare. Dr. Chen founded AdoptPaws with a mission to create lasting bonds between pets and families.', '/images/sara-chen.webp', 1),
  ('t2', 'Michael Rodriguez', 'Adoption Coordinator', 'Former veterinary assistant passionate about finding perfect matches for our pets. Michael brings expertise in animal behavior and family counseling to every adoption.', '/images/michael-rodriguez.webp', 2),
  ('t3', 'Emily Watson', 'Veterinary Care Manager', 'Licensed veterinary technician with a decade of experience. Emily ensures all our animals receive top-quality medical care and are healthy before adoption.', '/images/emily-watson.webp', 3),
  ('t4', 'James Park', 'Community Outreach Director', 'Dedicated to building partnerships and educating the community about responsible pet ownership. James organizes adoption events and volunteer programs.', '/images/james-park.webp', 4),
  ('t5', 'Lisa Thompson', 'Foster Program Manager', 'Coordinates our network of foster families who provide temporary homes for animals. Lisa has personally fostered over 100 animals in her career.', '/images/lisa-thompson.webp', 5),
  ('t6', 'David Kim', 'Operations Manager', 'Handles daily operations and facility management. David ensures our shelter runs smoothly and provides the best environment for our animals.', '/images/david-kim.webp', 6)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  photo = excluded.photo,
  display_order = excluded.display_order,
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO history_timeline (id, year, title, description, display_order) VALUES
  ('h1', '2012', 'The Beginning', 'AdoptPaws was founded with a simple mission: to find loving homes for abandoned and rescued animals. Started in a small facility with just 3 volunteers.', 1),
  ('h2', '2014', 'First Major Milestone', 'Reached 500 successful adoptions and expanded our facility to accommodate 50 animals. Launched our volunteer training program.', 2),
  ('h3', '2016', 'Community Growth', 'Partnered with 10 local veterinary clinics and established our foster network. Introduced our special needs animal program.', 3),
  ('h4', '2018', 'Digital Transformation', 'Launched our first online adoption platform, making it easier for families to find their perfect pet. Adoptions increased by 60%.', 4),
  ('h5', '2020', 'Pandemic Response', 'Adapted operations during COVID-19, implemented virtual meet-and-greets, and saw record adoption numbers as families sought companionship.', 5),
  ('h6', '2023', 'Major Expansion', 'Opened a second facility and reached 5,000 total adoptions. Launched mobile adoption events and educational programs in schools.', 6),
  ('h7', '2025', 'Innovation & Growth', 'Introduced AI-powered pet matching system and expanded to serve three counties. Continuing our mission with cutting-edge technology.', 7)
ON CONFLICT(id) DO UPDATE SET
  year = excluded.year,
  title = excluded.title,
  description = excluded.description,
  display_order = excluded.display_order,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  id, name, species, breed, age, gender, price, description, image_url,
  location, medical_history, personality_traits, category, status
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'The Three Musketeers', 'Dog', 'Mixed Breed', '3 months', 'unknown', 50, 'Playful and energetic trio of puppies looking for a loving home. They''re well-socialized and get along great with children and other pets.', 'https://cdn.pixabay.com/photo/2018/09/23/11/04/dog-3697190_1280.jpg', 'New York', 'Vaccinated', 'Playful, social', 'dogs', 'available'),
  ('00000000-0000-0000-0000-000000000002', 'PeaceMaker', 'Dog', 'Golden Retriever', '2 years', 'female', 100, 'PeaceMaker is a gentle soul who brings calm wherever she goes. This sweet dog is house-trained and knows basic commands. Great with families!', 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1324&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'New York', 'Vaccinated, microchipped', 'Calm, family-friendly', 'dogs', 'available'),
  ('00000000-0000-0000-0000-000000000003', 'Smiley', 'Dog', 'Labrador', '1 year', 'male', 150, 'Smiley is always happy and ready for adventure! This energetic dog needs an active family who can provide plenty of exercise and outdoor activities.', 'https://cdn.pixabay.com/photo/2023/02/05/19/54/dog-7770426_1280.jpg', 'Brooklyn', 'Vaccinated', 'Active, cheerful', 'dogs', 'available'),
  ('00000000-0000-0000-0000-000000000004', 'Whiskers', 'Cat', 'Tabby', '3 years', 'female', 75, 'Whiskers is a beautiful tabby cat with stunning green eyes. She''s calm, independent, and loves to curl up in sunny spots for afternoon naps.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80', 'Queens', 'Spayed, vaccinated', 'Calm, independent', 'cats', 'available'),
  ('00000000-0000-0000-0000-000000000005', 'Shadow', 'Cat', 'Domestic Shorthair', '2 years', 'unknown', 85, 'Shadow is a sleek black cat with a playful personality. He''s curious and loves interactive toys. Would do well in a home with older children.', 'https://images.unsplash.com/photo-1570018144715-43110363d70a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80', NULL, NULL, NULL, 'cats', 'available'),
  ('00000000-0000-0000-0000-000000000006', 'Lucky', 'Dog', 'Mixed Breed', '4 years', 'unknown', 120, 'Lucky is a special dog who was born with only three legs, but it doesn''t slow him down one bit! He''s full of life and loves everyone he meets.', 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80', NULL, NULL, NULL, 'special-needs', 'available')
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  species = excluded.species,
  breed = excluded.breed,
  age = excluded.age,
  gender = excluded.gender,
  price = excluded.price,
  description = excluded.description,
  image_url = excluded.image_url,
  location = excluded.location,
  medical_history = excluded.medical_history,
  personality_traits = excluded.personality_traits,
  category = excluded.category,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;
