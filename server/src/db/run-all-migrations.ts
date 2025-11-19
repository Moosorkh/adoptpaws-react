import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration files in order
const migrations = [
  'schema_extensions.sql',  // UUID extension first
  'schema.sql',             // Main schema
  'schema_users.sql',       // Users and auth
  'schema_team.sql',        // Team and history
  'migration_add_missing_fields.sql'  // Additional fields
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database migrations...');
    
    for (const migration of migrations) {
      logger.info(`Running migration: ${migration}`);
      
      const migrationPath = join(__dirname, migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      await client.query(sql);
      
      logger.info(`✓ Completed: ${migration}`);
    }
    
    logger.info('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations();
