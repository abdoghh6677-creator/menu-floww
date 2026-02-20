# Complete Deployment Script for Digital Menu SaaS
# This script handles the full deployment process

Write-Host "🚀 Digital Menu SaaS - Complete Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "git")) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Step 1: Check git status
Write-Host "🔍 Checking git status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "📝 Found uncommitted changes:" -ForegroundColor Yellow
        Write-Host $gitStatus
        Write-Host ""

        $commit = Read-Host "Commit changes? (y/n)"
        if ($commit -eq 'y' -or $commit -eq 'Y') {
            $message = Read-Host "Commit message"
            if (-not $message) { $message = "Update deployment" }

            git add .
            git commit -m $message
            Write-Host "✅ Changes committed" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Git error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Push failed: $_" -ForegroundColor Red
    Write-Host "Please check your GitHub repository and try again" -ForegroundColor Yellow
    exit 1
}

# Step 3: Install dependencies and build
Write-Host ""
Write-Host "🔨 Building application..." -ForegroundColor Yellow
try {
    # Clear Next.js cache
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force .next
        Write-Host "🧹 Cleared Next.js cache" -ForegroundColor Gray
    }

    # Install dependencies
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green

    # Build the application
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red

    # Try alternative build approach
    Write-Host "🔄 Trying alternative build approach..." -ForegroundColor Yellow
    try {
        # Check if app directory exists
        if (Test-Path "app") {
            Write-Host "📁 App directory found" -ForegroundColor Green
        } else {
            Write-Host "❌ App directory not found" -ForegroundColor Red
            exit 1
        }

        # Check Next.js version
        $nextVersion = npm list next --depth=0
        Write-Host "📦 Next.js version: $nextVersion" -ForegroundColor Gray

        # Try build with verbose output
        npm run build --verbose
    } catch {
        Write-Host "❌ Alternative build also failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
        Write-Host "1. Check if all dependencies are installed: npm install" -ForegroundColor White
        Write-Host "2. Clear cache: Remove-Item -Recurse -Force .next, node_modules" -ForegroundColor White
        Write-Host "3. Reinstall: npm install" -ForegroundColor White
        Write-Host "4. Check Next.js config: next.config.ts" -ForegroundColor White
        Write-Host "5. Verify app directory structure" -ForegroundColor White
        exit 1
    }
}

# Step 4: Deploy to Vercel
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow

# Check if Vercel CLI is installed
if (-not (Test-Command "vercel")) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    try {
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Vercel CLI: $_" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
}

# Try to deploy
try {
    Write-Host "🌐 Starting Vercel deployment..." -ForegroundColor Cyan
    $deployResult = vercel --prod 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Your app is now live!" -ForegroundColor Green
        Write-Host "Check your Vercel dashboard for the deployment URL" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Vercel CLI needs authentication" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Click 'New Project'" -ForegroundColor White
        Write-Host "3. Import your 'digital-menu-saas' repository" -ForegroundColor White
        Write-Host "4. Add environment variables:" -ForegroundColor White
        Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
        Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
        Write-Host "5. Click 'Deploy'" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Your app will be available at: https://digital-menu-saas.vercel.app" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Vercel deployment needs manual setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Complete Manual Setup:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. New Project → Import Git Repository" -ForegroundColor White
    Write-Host "3. Select 'digital-menu-saas' from GitHub" -ForegroundColor White
    Write-Host "4. Configure:" -ForegroundColor White
    Write-Host "   - Framework: Next.js" -ForegroundColor Gray
    Write-Host "   - Root Directory: ./" -ForegroundColor Gray
    Write-Host "5. Environment Variables:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ..." -ForegroundColor Gray
    Write-Host "6. Deploy!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎊 Deployment process completed!" -ForegroundColor Green
Write-Host "Your premium restaurant ordering UI is ready to serve customers! 🍽️✨" -ForegroundColor Cyan