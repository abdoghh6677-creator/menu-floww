# 🚀 سكريبت النشر السريع (Windows PowerShell)
# شغّل: powershell -ExecutionPolicy Bypass -File deploy.ps1

Write-Host "🚀 بدء تجهيز النشر..." -ForegroundColor Green
Write-Host ""

# 1. تنظيف المشروع
Write-Host "🧹 تنظيف المشروع..." -ForegroundColor Cyan
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
Write-Host "تثبيت الحزم..." -ForegroundColor Cyan
npm install | Out-Null

# 2. اختبار البناء
Write-Host "🔨 اختبار البناء..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ فشل البناء! تحقق من الأخطاء أعلاه" -ForegroundColor Red
  exit 1
}
Write-Host "✅ البناء نجح!" -ForegroundColor Green
Write-Host ""

# 3. اختبار الـ lint
Write-Host "🔍 فحص الكود..." -ForegroundColor Cyan
npm run lint 2>$null
Write-Host ""

# 4. معلومات Git
Write-Host "📦 حالة المشروع:" -ForegroundColor Cyan
git status
Write-Host ""

# 5. ملخص
Write-Host "✅ المشروع جاهز للنشر!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. اذهب إلى https://vercel.com" -ForegroundColor White
Write-Host "2. اضغط 'New Project'" -ForegroundColor White
Write-Host "3. اختر مستودع GitHub الخاص بك" -ForegroundColor White
Write-Host "4. أضف متغيرات البيئة:" -ForegroundColor White
Write-Host "   ✓ NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "5. اضغط Deploy" -ForegroundColor White
Write-Host ""
Write-Host "🎉 موقعك سيكون متاحاً في:" -ForegroundColor Green
Write-Host "   https://YOUR_PROJECT.vercel.app" -ForegroundColor Cyan
Write-Host ""
