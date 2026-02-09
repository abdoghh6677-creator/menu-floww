# 🚀 Deploy to Vercel - PowerShell Helper
# استخدم هذا السكربت لتسهيل النشر على Vercel

Write-Host "🚀 نشر على Vercel - مساعد PowerShell" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1️⃣ تشغيل الترحيل (اختياري لكن موصى به)
# ============================================
Write-Host "1️⃣ هل تريد تشغيل الترحيل الآن؟" -ForegroundColor Yellow
Write-Host "   (ضروري قبل النشر!)" -ForegroundColor Gray

$runMigration = Read-Host "اختر (y/n)"
if ($runMigration -eq "y" -or $runMigration -eq "Y") {
    Write-Host ""
    Write-Host "⏳ سأساعدك بتشغيل الترحيل..." -ForegroundColor Green
    Write-Host ""
    
    $dbUrl = Read-Host "الصق DATABASE_URL من Supabase"
    
    if ($dbUrl) {
        $env:DATABASE_URL = $dbUrl
        Write-Host "🔄 جاري تشغيل الترحيل..." -ForegroundColor Cyan
        
        try {
            & node scripts/run_translation_migration.js
            Write-Host "✅ الترحيل تم بنجاح!" -ForegroundColor Green
        } catch {
            Write-Host "❌ خطأ في الترحيل: $_" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# ============================================
# 2️⃣ Commit والـ Push على GitHub
# ============================================
Write-Host "2️⃣ إرسال التغييرات إلى GitHub..." -ForegroundColor Yellow
Write-Host ""

# فحص Git
try {
    git status > $null 2>&1
    Write-Host "✅ Git جاهز" -ForegroundColor Green
} catch {
    Write-Host "❌ لا يوجد Git repository" -ForegroundColor Red
    exit 1
}

# فحص التغييرات
$isDirty = git diff-index --quiet HEAD --; $?
if (-not $isDirty) {
    Write-Host "⚠️ هناك تغييرات محلية" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "الخيارات:"
    Write-Host "  1) Commit والـ push الآن"
    Write-Host "  2) تخطي (push يدويّ)"
    
    $choice = Read-Host "الخيار (1 أو 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "📝 أدخل رسالة الـ commit:" -ForegroundColor Cyan
        $msg = Read-Host "الرسالة (مثال: ✨ Add translations)"
        
        Write-Host ""
        Write-Host "🔄 جاري الـ commit..." -ForegroundColor Cyan
        git add .
        git commit -m $msg
        
        Write-Host "🔄 جاري الـ push..." -ForegroundColor Cyan
        git push origin main
        
        Write-Host "✅ تم الـ push بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ تذكر: أنت بحاجة لتشغيل:" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Gray
        Write-Host "  git commit -m 'Your message'" -ForegroundColor Gray
        Write-Host "  git push origin main" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ لا توجد تغييرات جديدة" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 3️⃣ تعليمات النشر على Vercel
# ============================================
Write-Host "3️⃣ الخطوات التالية على Vercel:" -ForegroundColor Yellow
Write-Host ""
Write-Host "اتبع هذه الخطوات:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1️⃣ اذهب إلى: https://vercel.com/new" -ForegroundColor White
Write-Host "  2️⃣ اختر: Import Git Repository" -ForegroundColor White
Write-Host "  3️⃣ ابحث واختر: digital-menu-saas" -ForegroundColor White
Write-Host ""
Write-Host "  في 'Configure Project' أضف:" -ForegroundColor Cyan
Write-Host "    - NEXT_PUBLIC_SUPABASE_URL = https://ylvygdlfggcaavxexuqv.supabase.co" -ForegroundColor Gray
Write-Host "    - NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc..." -ForegroundColor Gray
Write-Host ""
Write-Host "  4️⃣ اضغط Deploy 🚀" -ForegroundColor White
Write-Host ""

Write-Host "✅ بعدها موقعك سيكون متاح على:" -ForegroundColor Green
Write-Host "   https://your-project-name.vercel.app" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 4️⃣ ملاحظات مهمة
# ============================================
Write-Host "⚠️ ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "  - تأكد من تشغيل الترحيل قبل الـ deploy" -ForegroundColor Gray
Write-Host "  - استخدم SQL Editor في Supabase بدلاً من السكربت للـ production" -ForegroundColor Gray
Write-Host "  - Database URL يجب أن تكون آمنة (لا تشاركها مع أحد)" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ تم المساعدة! استعد للإطلاق 🎉" -ForegroundColor Green
