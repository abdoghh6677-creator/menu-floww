#!/usr/bin/env node
// Run the SQL migration file to add translation columns.
// Usage: set DATABASE_URL env var (Postgres connection string) then run:
// node scripts/run_translation_migration.js

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const sqlFile = path.join(__dirname, '..', 'migrations', '001_add_translation_columns.sql')
if (!fs.existsSync(sqlFile)) {
  console.error('Migration SQL not found at', sqlFile)
  process.exit(1)
}

const sql = fs.readFileSync(sqlFile, 'utf8')
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.PG_CONN
if (!connectionString) {
  console.error('Please set DATABASE_URL (Postgres connection string) in environment')
  process.exit(1)
}

async function run() {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    console.log('Connected to DB')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('Migration applied successfully')
    process.exit(0)
  } catch (e) {
    console.error('Migration failed:', e)
    try { await client.query('ROLLBACK') } catch (er) {}
    process.exit(1)
  } finally {
    try { await client.end() } catch (e) {}
  }
}

run()
