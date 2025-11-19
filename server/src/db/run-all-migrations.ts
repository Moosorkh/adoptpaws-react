import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration files in order
const migrations = [
  'schema.sql',             // Main schema first (creates products table)
  'schema_extensions.sql',  // Extensions and additional tables (needs products table)
  'schema_users.sql',       // Users and auth (needs adoption_requests)
  'schema_team.sql',        // Team and history
  'migration_add_missing_fields.sql'  // Additional fields
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      
      const migrationPath = join(__dirname, migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      await client.query(sql);
      
      console.log(`✓ Completed: ${migration}`);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
