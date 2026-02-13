# Deploy to Vercel - PowerShell Helper
# Safe UTF-8 encoding, English only to avoid parser errors

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Optional migration
Write-Host "Step 1: Database Migration" -ForegroundColor Yellow
$runMigration = Read-Host "Run migration? (y/n)"
if ($runMigration -eq 'y' -or $runMigration -eq 'Y') {
    $dbUrl = Read-Host "Enter DATABASE_URL from Supabase (or press Enter to skip)"
    
    if ($dbUrl) {
        $env:DATABASE_URL = $dbUrl
        Write-Host "Running migration..." -ForegroundColor Cyan
        try {
            node scripts/run_translation_migration.js
            Write-Host "Migration completed." -ForegroundColor Green
        }
        catch {
            Write-Host "Migration error: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Skipped (no DATABASE_URL)" -ForegroundColor Gray
    }
}
else {
    Write-Host "Skipped migration." -ForegroundColor Gray
}

Write-Host ""

# Step 2: Git commit and push
Write-Host "Step 2: Commit and Push Changes" -ForegroundColor Yellow
try {
    git status > $null 2>&1
}
catch {
    Write-Host "Git error or not a repository" -ForegroundColor Red
    exit 1
}

$hasChanges = $false
git diff-index --quiet HEAD --
if ($LASTEXITCODE -ne 0) { $hasChanges = $true }

if ($hasChanges) {
    Write-Host "Uncommitted changes found."
    $choice = Read-Host "Commit and push? (y/n)"
    
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        $msg = Read-Host "Commit message"
        if ($msg) {
            git add .
            git commit -m $msg
            git push origin main
            Write-Host "Pushed to origin/main" -ForegroundColor Green
        }
        else {
            Write-Host "No message provided, skipping commit." -ForegroundColor Gray
        }
    }
    else {
        Write-Host "Skipped. Push manually before deploying." -ForegroundColor Gray
    }
}
else {
    Write-Host "No changes to commit." -ForegroundColor Gray
}

Write-Host ""

# Step 3: Deploy with Vercel CLI
Write-Host "Step 3: Deploy to Vercel" -ForegroundColor Yellow
try {
    $vercel = Get-Command vercel -ErrorAction Stop
    $doDeploy = Read-Host "Deploy now with Vercel CLI? (y/n)"
    
    if ($doDeploy -eq 'y' -or $doDeploy -eq 'Y') {
        Write-Host "Running: vercel --prod" -ForegroundColor Cyan
        vercel --prod
        Write-Host "Deployment initiated!" -ForegroundColor Green
    }
    else {
        Write-Host "Skipped. Run 'vercel --prod' manually when ready." -ForegroundColor Gray
    }
}
catch {
    Write-Host "Vercel CLI not installed." -ForegroundColor Red
    Write-Host "Install: npm install -g vercel" -ForegroundColor Cyan
    Write-Host "Or manual deploy at: https://vercel.com/dashboard" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Deployment preparation complete!" -ForegroundColor Green
