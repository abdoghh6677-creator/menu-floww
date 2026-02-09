#!/usr/bin/env bash
# Vercel Deploy Helper
# يساعدك بنشر التطبيق على Vercel بشكل صحيح

set -e

echo "🚀 Vercel Deploy Helper"
echo "======================="
echo ""

# Step 1: Check Git
echo "1️⃣ فحص Git Repository..."
if ! git status > /dev/null 2>&1; then
    echo "❌ لا يوجد git repository"
    exit 1
fi
echo "✅ Git جاهز"
echo ""

# Step 2: Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ هناك تغييرات محلية لم يتم commit"
    echo "اختر:"
    echo "  1) commit والـ push الآن"
    echo "  2) تخطي"
    read -p "الخيار (1 أو 2): " choice
    
    if [ "$choice" = "1" ]; then
        git add .
        read -p "الرسالة (مثال: Add translations): " msg
        git commit -m "$msg"
        git push origin main
        echo "✅ تم الـ push"
    fi
fi

echo ""
echo "2️⃣ تعليمات النشر على Vercel:"
echo "================================"
echo ""
echo "1️⃣ اذهب إلى: https://vercel.com/new"
echo "2️⃣ اختر 'Import Git Repository'"
echo "3️⃣ اختر: digital-menu-saas"
echo "4️⃣ أضف Environment Variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "5️⃣ اضغط 'Deploy'"
echo ""
echo "✅ تم!"
