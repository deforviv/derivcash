const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('./supabase_migration.sql', 'utf8');

if (!process.env.SUPABASE_DATABASE_URL) {
  console.error('Missing SUPABASE_DATABASE_URL environment variable.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase!');
    await client.query(sql);
    console.log('Migration successful! Table "profiles" created.');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

run();
