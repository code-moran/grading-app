import { query, testConnection } from './database';
import { readFileSync } from 'fs';
import { join } from 'path';

// Create database schema only (without seeding)
export const createSchema = async () => {
  try {
    console.log('🚀 Creating database schema...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaPath = join(process.cwd(), 'lib', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema statements...');
    
    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          successCount++;
        } catch (error) {
          errorCount++;
          console.warn(`⚠️  Warning executing statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.warn(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log(`📊 Schema execution completed: ${successCount} successful, ${errorCount} errors`);

    // Verify that key tables exist
    console.log('🔍 Verifying schema creation...');
    const tables = ['students', 'lessons', 'exercises', 'rubrics', 'grades'];
    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table '${table}' exists`);
      } catch (error) {
        console.error(`❌ Table '${table}' does not exist or is not accessible`);
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      throw new Error(`Schema creation failed - missing tables: ${missingTables.join(', ')}`);
    }

    console.log('✅ Database schema created and verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    throw error;
  }
};

// Run schema creation if this file is executed directly
if (require.main === module) {
  createSchema()
    .then(() => {
      console.log('Schema creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema creation failed:', error);
      process.exit(1);
    });
}
