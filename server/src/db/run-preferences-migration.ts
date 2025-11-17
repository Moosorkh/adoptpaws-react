import pool from '../config/database.js';
import { logger } from '../utils/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    // Create user_preferences table
    const preferencesSql = readFileSync(join(__dirname, 'schema_preferences.sql'), 'utf-8');
    await pool.query(preferencesSql);
    logger.info('✅ user_preferences table created successfully');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
