import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function testLogin() {
  try {
    const email = 'admin@adoptpaws.com';
    const password = 'admin123';
    
    // Get user from database
    const result = await pool.query(
      'SELECT email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✓ User found:', user.email);
    console.log('Password hash in DB:', user.password_hash);

    // Test password comparison
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (isValid) {
      console.log('✅ Password is valid! Login should work.');
    } else {
      console.log('❌ Password is invalid');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
