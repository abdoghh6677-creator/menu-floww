#!/usr/bin/env bash
SQL_FILE="migrations/002_add_payment_method_columns.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL}}"
if [ -z "$DB_URL" ]; then
  echo "No DATABASE_URL or SUPABASE_DB_URL set."
  echo "Use: export DATABASE_URL=\"postgres://user:pass@host:5432/dbname\""
  echo "Or run the SQL from Supabase Console → SQL Editor"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install psql or use supabase CLI: supabase db query $SQL_FILE"
  exit 1
fi

echo "Running $SQL_FILE against $DB_URL"
psql "$DB_URL" -f "$SQL_FILE"
exit $?
