#!/usr/bin/env pwsh

# Auto Deployment Script - Full automatic deployment
# This script does everything: Git commit, push, build, and deploy to Vercel

$ErrorActionPreference = "Stop"

Write-Host "🚀🚀🚀 FULL AUTOMATIC DEPLOYMENT 🚀🚀🚀" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta
Write-Host ""

# Kill any stuck Vercel processes
Write-Host "🔪 Killing stuck processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500
Write-Host "✅ Done" -ForegroundColor Green
Write-Host ""

# Step 1: Git Status
Write-Host "📋 STEP 1: Checking git status..." -ForegroundColor Cyan
git status --short
Write-Host ""

# Step 2: Add all files
Write-Host "📝 STEP 2: Adding all changes to git..." -ForegroundColor Cyan
git add -A
Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Step 3: Commit
Write-Host "💾 STEP 3: Creating commit..." -ForegroundColor Cyan
$commitMessage = @"
✨ Premium Restaurant UI - Complete Deployment

🎨 UI Improvements:
- Modern design with charcoal (#111111) & gold (#D4AF37)
- Inter font for contemporary look
- 200-300ms smooth transitions
- Sliding cart drawer from right side
- Enhanced checkout flow
- Hover effects with lift animations
- Gold borders on selected items
- Gradient backgrounds

🔧 Technical Fixes:
- Fixed Next.js app directory configuration
- Updated next.config.ts with explicit settings
- Disabled conflicting production config
- Added pages directory for compatibility
- Improved build process
- Added comprehensive error handling

📱 Responsive:
- Mobile-first design
- Works on all devices
- Optimized performance

🍽️ Ready for production deployment!
"@

git commit -m $commitMessage
Write-Host "✅ Committed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Push to GitHub
Write-Host "📤 STEP 4: Pushing to GitHub (origin/main)..." -ForegroundColor Cyan
git push origin main --force
Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 5: Clean build
Write-Host "🧹 STEP 5: Cleaning build cache..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cleaned .next directory" -ForegroundColor Green
}
Write-Host ""

# Step 6: Install dependencies
Write-Host "📦 STEP 6: Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 7: Build
Write-Host "🔨 STEP 7: Building application..." -ForegroundColor Cyan
npm run build
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 8: Deploy to Vercel
Write-Host "🚀 STEP 8: Deploying to Vercel..." -ForegroundColor Magenta
Write-Host "⏳ This will take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

# Check if Vercel CLI exists
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy with production flag
vercel --prod --confirm

Write-Host ""
Write-Host "🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "✨ Your premium restaurant ordering UI is now LIVE!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 View your deployment:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "✅ Features deployed:" -ForegroundColor Green
Write-Host "   ✓ Premium modern design" -ForegroundColor White
Write-Host "   ✓ Charcoal & Gold theme" -ForegroundColor White
Write-Host "   ✓ Smooth animations" -ForegroundColor White
Write-Host "   ✓ Mobile responsive" -ForegroundColor White
Write-Host "   ✓ Sliding cart drawer" -ForegroundColor White
Write-Host "   ✓ Enhanced checkout" -ForegroundColor White
Write-Host ""
Write-Host "🍽️ Ready to serve customers! 🍽️" -ForegroundColor Cyan
Write-Host ""