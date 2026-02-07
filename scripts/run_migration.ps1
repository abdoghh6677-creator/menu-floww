Param(
  [string]$SqlFile = "migrations/002_add_payment_method_columns.sql"
)

Write-Host "Running migration from file: $SqlFile"

if (-not (Test-Path $SqlFile)) {
  Write-Error "SQL file not found: $SqlFile"
  exit 1
}

# Prefer DATABASE_URL (Postgres connection string). Alternatively set SUPABASE_DB_URL.
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) { $dbUrl = $env:SUPABASE_DB_URL }

if (-not $dbUrl) {
  Write-Host "No DATABASE_URL or SUPABASE_DB_URL found in environment."
  Write-Host "Options:"
  Write-Host "  1) Set env var DATABASE_URL to your Postgres connection string and re-run this script."
  Write-Host "  2) Open Supabase Console → SQL Editor and run migrations/002_add_payment_method_columns.sql manually."
  exit 1
}

# Ensure psql is available
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Host "psql not found in PATH. If you have the Supabase CLI installed, you can run: `supabase db query $SqlFile`"
  exit 1
}

Write-Host "Executing psql against DATABASE_URL..."
try {
  psql $dbUrl -f $SqlFile
  if ($LASTEXITCODE -ne 0) { throw "psql exited with code $LASTEXITCODE" }
  Write-Host "Migration executed successfully."
} catch {
  Write-Error "Migration failed: $_"
  exit 1
}
