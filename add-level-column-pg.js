const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Get credentials from environment variables
const connectionString = process.env.SUPABASE_POSTGRES_CONNECTION_STRING;

// If connection string is not available, construct it
const postgresUser = process.env.POSTGRES_USER || 'postgres';
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresHost = 'db.corswudbikzvzprlznrl.supabase.co';
const postgresDatabase = 'postgres';
const postgresPort = 5432;

// Create connection pool
const pool = connectionString 
  ? new Pool({ connectionString }) 
  : new Pool({
      user: postgresUser,
      password: postgresPassword,
      host: postgresHost,
      database: postgresDatabase,
      port: postgresPort,
      ssl: {
        rejectUnauthorized: false
      }
    });

async function addLevelColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to Supabase PostgreSQL database');
    
    // Check if the column already exists
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'level';
    `);
    
    if (checkColumnResult.rows.length > 0) {
      console.log('Level column already exists in profiles table');
    } else {
      console.log('Adding level column to profiles table...');
      
      // Add the level column
      await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN level INTEGER DEFAULT 1 NOT NULL;
      `);
      
      console.log('Successfully added level column to profiles table');
    }
    
    // Verify column was added by querying a record
    const verifyResult = await client.query(`
      SELECT id, level FROM profiles LIMIT 1;
    `);
    
    console.log('Verification query result:', verifyResult.rows);
    
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    client.release();
    console.log('Database connection closed');
    pool.end();
  }
}

// Run the function
addLevelColumn().catch(console.error); 