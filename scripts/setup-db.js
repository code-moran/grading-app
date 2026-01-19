#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps you set up the PostgreSQL database for the grading application.
 * 
 * Usage:
 * 1. Make sure PostgreSQL is running
 * 2. Create a database named 'grading_app'
 * 3. Update the .env.local file with your database credentials
 * 4. Run: node scripts/setup-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'grading_app',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Setting up database...');
    console.log(`📊 Connecting to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      }
    }

    console.log('✅ Database schema created successfully');
    
    // Check if we should seed the database
    const lessonCount = await client.query('SELECT COUNT(*) FROM lessons');
    if (parseInt(lessonCount.rows[0].count) === 0) {
      console.log('🌱 Seeding database with initial data...');
      
      // Import and run the initialization
      const { initializeDatabase } = require('../lib/init-db.ts');
      await initializeDatabase();
      
      console.log('✅ Database seeded successfully');
    } else {
      console.log('📚 Database already contains data, skipping seed');
    }
    
    client.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
