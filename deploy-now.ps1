# Complete Deployment - Git + Vercel
# Run: .\deploy-now.ps1

Write-Host "🚀 Complete Deployment - Git & Vercel" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Git Add
Write-Host "📝 Step 1: Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host "✅ Changes added" -ForegroundColor Green
Write-Host ""

# Step 2: Git Commit
Write-Host "💾 Step 2: Committing changes..." -ForegroundColor Yellow
$commitMsg = @"
🎨 Premium UI Update and Build Fixes

✨ Features:
- Modern premium restaurant ordering UI
- Deep charcoal (#111111) and warm gold (#D4AF37) colors
- Inter font for modern typography
- Smooth animations (200-300ms transitions)
- Sliding cart drawer from right side
- Enhanced checkout experience
- Mobile-first responsive design

🔧 Fixes:
- Fixed Next.js build configuration
- Explicit app directory settings
- Clear conflicting production config
- Improved deployment workflow

🚀 Ready for Vercel deployment!
"@

git commit -m "$commitMsg"
Write-Host "✅ Committed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Git Push
Write-Host "📤 Step 3: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 4: Build
Write-Host "🔨 Step 4: Building application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "🚀 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "⏳ This may take a few minutes..." -ForegroundColor Cyan

# Check if Vercel CLI exists
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

vercel --prod

Write-Host ""
Write-Host "✨ Deployment Complete! ✨" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your premium restaurant UI is now live!" -ForegroundColor Cyan
Write-Host "📱 Visit your Vercel dashboard to see the deployment" -ForegroundColor White
Write-Host ""
Write-Host "Features deployed:" -ForegroundColor Yellow
Write-Host "  ✅ Modern premium design" -ForegroundColor Green
Write-Host "  ✅ Gold & Charcoal color scheme" -ForegroundColor Green
Write-Host "  ✅ Smooth animations" -ForegroundColor Green
Write-Host "  ✅ Mobile-responsive" -ForegroundColor Green
Write-Host "  ✅ Sliding cart drawer" -ForegroundColor Green
Write-Host ""
Write-Host "🍽️ Ready to serve customers! 🍽️" -ForegroundColor Cyan