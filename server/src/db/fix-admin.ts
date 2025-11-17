import pool from '../config/database.js';
import { logger } from '../utils/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixAdminPassword() {
  try {
    const sql = readFileSync(join(__dirname, 'fix_admin_password.sql'), 'utf-8');
    await pool.query(sql);
    logger.info('Admin password fixed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdminPassword();
