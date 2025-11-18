import pool from '../config/database.js';

async function addDarkModeColumn() {
  try {
    console.log('[INFO] Adding dark_mode_enabled column...');
    
    await pool.query(`
      ALTER TABLE user_preferences 
      ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT true
    `);
    
    console.log('[INFO] ✅ dark_mode_enabled column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Migration failed:', error);
    process.exit(1);
  }
}

addDarkModeColumn();
