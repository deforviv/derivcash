const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('./admin_migration.sql', 'utf8');

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
    console.log('Admin migration successful! Admin account and admin tables are ready.');
  } catch (err) {
    console.error('Admin migration error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
