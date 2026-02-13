#!/bin/bash
# Deploy to Vercel - Bash Helper
# Safe script for Linux/macOS deployments

echo "================================"
echo "Vercel Deployment Helper (Bash)"
echo "================================"
echo ""

# Step 1: Database Migration
echo "Step 1: Database Migration"
read -p "Run migration? (y/n): " runMigration
echo ""

if [[ "$runMigration" == "y" || "$runMigration" == "Y" ]]; then
    read -p "Enter DATABASE_URL from Supabase (or press Enter to skip): " dbUrl
    
    if [ -n "$dbUrl" ]; then
        export DATABASE_URL="$dbUrl"
        echo "Running migration..."
        if node scripts/run_translation_migration.js; then
            echo "Migration completed."
        else
            echo "Migration error occurred."
        fi
    else
        echo "Skipped (no DATABASE_URL)"
    fi
else
    echo "Skipped migration."
fi

echo ""

# Step 2: Git commit and push
echo "Step 2: Commit and Push Changes"

if ! git status > /dev/null 2>&1; then
    echo "Git error or not a repository"
    exit 1
fi

if ! git diff-index --quiet HEAD --; then
    echo "Uncommitted changes found."
    read -p "Commit and push? (y/n): " doPush
    
    if [[ "$doPush" == "y" || "$doPush" == "Y" ]]; then
        read -p "Commit message: " msg
        if [ -n "$msg" ]; then
            git add .
            if git commit -m "$msg"; then
                if git push origin main; then
                    echo "Pushed to origin/main"
                else
                    echo "Push failed"
                fi
            else
                echo "Commit failed"
            fi
        else
            echo "No message provided, skipping commit."
        fi
    else
        echo "Skipped. Push manually before deploying."
    fi
else
    echo "No changes to commit."
fi

echo ""

# Step 3: Deploy with Vercel CLI
echo "Step 3: Deploy to Vercel"

if command -v vercel &> /dev/null; then
    read -p "Deploy now with Vercel CLI? (y/n): " doDeploy
    
    if [[ "$doDeploy" == "y" || "$doDeploy" == "Y" ]]; then
        echo "Running: vercel --prod"
        vercel --prod
        echo "Deployment initiated!"
    else
        echo "Skipped. Run 'vercel --prod' manually when ready."
    fi
else
    echo "Vercel CLI not installed."
    echo "Install: npm install -g vercel"
    echo "Or manual deploy at: https://vercel.com/dashboard"
fi

echo ""
echo "Deployment preparation complete!"
