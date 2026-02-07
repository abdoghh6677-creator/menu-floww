Run the payment-methods migration

Options to apply `migrations/002_add_payment_method_columns.sql` to your Supabase Postgres:

1) Supabase Console (recommended)
   - Open your Supabase project → `SQL Editor`
   - Paste the contents of `migrations/002_add_payment_method_columns.sql`
   - Click `Run`

2) Using Supabase CLI
   - Install Supabase CLI: https://supabase.com/docs/guides/cli
   - Run:
     ```bash
     supabase db query migrations/002_add_payment_method_columns.sql
     ```

3) Using psql (you must have `psql` installed and `DATABASE_URL` set)
   - On Windows PowerShell:
     ```powershell
     $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
     .\scripts\run_migration.ps1
     ```
   - On macOS / Linux:
     ```bash
     export DATABASE_URL="postgres://user:pass@host:5432/dbname"
     ./scripts/run_migration.sh
     ```

Notes:
- Use a Service Role / admin DB URL when running migrations against production.
- After running, refresh Supabase console or restart any schema-caching services if needed.
