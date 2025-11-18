import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('[INFO] Running team & history migration...');
    
    const schemaPath = path.join(__dirname, 'schema_team.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('[INFO] ✅ Team members and history tables created successfully');
    console.log('[INFO] ✅ Sample data seeded');
    
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
