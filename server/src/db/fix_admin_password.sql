-- Fix admin user password hash
-- Password: admin123
UPDATE users 
SET password_hash = '$2b$10$tfgKtt7.a8XerDN.OqkDDOLa6spTRKenwTqoyeTqGNQ882zDuLeUi'
WHERE email = 'admin@adoptpaws.com';

-- If admin user doesn't exist, create it
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES ('admin@adoptpaws.com', '$2b$10$tfgKtt7.a8XerDN.OqkDDOLa6spTRKenwTqoyeTqGNQ882zDuLeUi', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$tfgKtt7.a8XerDN.OqkDDOLa6spTRKenwTqoyeTqGNQ882zDuLeUi';
