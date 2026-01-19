import { testConnection, query } from './database';

// Test database connection and basic operations
export const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    
    // Test basic query
    console.log('🔍 Testing basic query...');
    const result = await query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);
    
    // Test if we can create a simple table
    console.log('🔍 Testing table creation...');
    await query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Test table created successfully');
    
    // Test insert
    console.log('🔍 Testing insert operation...');
    await query('INSERT INTO test_table (name) VALUES ($1)', ['test_record']);
    console.log('✅ Insert operation successful');
    
    // Test select
    console.log('🔍 Testing select operation...');
    const selectResult = await query('SELECT * FROM test_table WHERE name = $1', ['test_record']);
    console.log('✅ Select operation successful, found', selectResult.rows.length, 'records');
    
    // Clean up test table
    console.log('🧹 Cleaning up test table...');
    await query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Test table cleaned up');
    
    console.log('🎉 All database tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testDatabase()
    .then(() => {
      console.log('Database test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database test failed:', error);
      process.exit(1);
    });
}
