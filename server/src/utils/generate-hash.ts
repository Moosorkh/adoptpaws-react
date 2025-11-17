import bcrypt from 'bcryptjs';

// Generate proper bcrypt hash for admin123
const password = 'admin123';
const hash = await bcrypt.hash(password, 10);
console.log('Bcrypt hash for admin123:', hash);
