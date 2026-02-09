# 🚀 نشر على Vercel - نظام الترجمة جاهز

دليل كامل لنشر التطبيق على Vercel مع ترجمات متعددة اللغات.

---

## 📋 قبل البدء

تأكد من:
- ✅ حساب GitHub متصل بـ Vercel
- ✅ Supabase مشروع موجود
- ✅ Git repo محدثة (commit آخر التغييرات)

---

## 🔍 الخطوة 1: احصل على DATABASE_URL

### من Supabase Dashboard:
1. اذهب إلى: **Project → Settings → Database**
2. اختر **Connection → URI** من القائمة
3. انسخ الـ URL كاملاً (يبدو مثل):
```
postgres://USER:PASSWORD@db.HASH.supabase.co:5432/postgres
```

**حفظ في مكان آمن!** ستحتاجه بعد قليل.

---

## 💾 الخطوة 2: تشغيل الترحيل (مهم!)

### اختر الطريقة:

#### الطريقة أ: SQL Editor (الأسهل)
1. افتح **Supabase Dashboard → SQL Editor**
2. اضغط **"+ New query"**
3. **انسخ الملف كاملاً:**
   ```
   migrations/001_add_translation_columns.sql
   ```
4. اضغط **"Run"**
5. تأكد من رسالة النجاح ✅

#### الطريقة ب: PowerShell (من جهازك)
```powershell
cd C:\Users\VIP\digital-menu-saas

# ضع DATABASE_URL
$env:DATABASE_URL = "postgres://USER:PASS@db.HASH.supabase.co:5432/postgres"

# شغّل الترحيل
node scripts/run_translation_migration.js
```

**النتيجة المتوقعة:**
```
Connected to DB
Migration applied successfully
```

---

## 🔗 الخطوة 3: ربط Vercel مع GitHub

### أولاً: Push التغييرات على GitHub
```powershell
cd C:\Users\VIP\digital-menu-saas

git add .
git commit -m "✨ Add multilingual translations (6 languages)"
git push origin main
```

### ثانياً: ربط مع Vercel

1. افتح: **https://vercel.com/new**
2. اختر **"Import Git Repository"**
3. ابحث عن repo: **`digital-menu-saas`**
4. اضغط **"Import"**

---

## ⚙️ الخطوة 4: ضبط متغيرات البيئة

في شاشة **"Configure Project"** على Vercel:

### إضافة Environment Variables:

| المتغير | القيمة | الملاحظة |
|--------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ylvygdlfggcaavxexuqv.supabase.co` | من Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | من Supabase API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | (اختياري) | للـ migrations المتقدمة |

### كيفية الحصول على المتغيرات:

**من Supabase Dashboard:**
1. اذهب إلى: **Settings → API**
2. انسخ:
   - **`Project URL`** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role`** (اختياري) → `SUPABASE_SERVICE_ROLE_KEY`

### أضف المتغيرات:
```
في Vercel:
غيّر Environment اختياري من "Production" إلى "Preview, Production"

ثم اضغط "Add" لـ كل متغير
```

---

## 🚀 الخطوة 5: النشر

1. اضغط **"Deploy"** 🎯
2. انتظر البناء (عادة < 2 دقيقة)
3. تأكد من الرسالة الخضراء: ✅ **"Congratulations! Your site is live"**

---

## ✅ اختبر الموقع الحي

### بعد النشر:
1. افتح الـ URL الخاص بـ Vercel (مثل: `https://your-project.vercel.app`)

2. **اختبر Dashboard:**
   - تسجيل دخول
   - اضافة صنف جديد
   - تأكد من ظهور حقول الترجمات

3. **اختبر Menu:**
   - افتح صفحة المنيو
   - غيّر اللغة
   - تأكد من عرض الترجمات

---

## 🔄 التحديثات المستقبلية

### طريقة Vercel السهلة:
كل ما تحتاجه هو:
```powershell
git add .
git commit -m "Your changes"
git push origin main
```

Vercel سيعيد نشر تلقائياً! 🚀

---

## 🆘 مشاكل شائعة

### المشكلة: "حقول الترجمة لا تظهر"
**الحل:**
1. تأكد من تشغيل الترحيل قبل النشر
2. تحقق من Supabase أن الأعمدة موجودة:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'menu_items' ORDER BY column_name;
   ```

### المشكلة: "خطأ: Supabase connection failed"
**الحل:**
1. تأكد من `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` مصحيحة
2. تحقق من متغيرات البيئة في Vercel (Settings → Environment Variables)
3. أعد النشر (Vercel Dashboard → Deployments → Redeploy)

### المشكلة: "Database connection error in script"
**الحل:**
1. تأكد من تشغيل `node scripts/run_translation_migration.js` قبل النشر
2. استخدم SQL Editor بدلاً من السكربت للـ production

---

## 📊 قائمة التحقق قبل النشر

- [ ] ✅ الترحيل تم تشغيله (أعمدة موجودة في Supabase)
- [ ] ✅ GitHub repo محدثة (push تم)
- [ ] ✅ متغيرات البيئة مضبوطة على Vercel
- [ ] ✅ Build يمر بنجاح (لا توجد أخطاء)
- [ ] ✅ Dashboard يعرض حقول الترجمة
- [ ] ✅ Menu يعرض الترجمات بشكل صحيح
- [ ] ✅ البحث يعمل بجميع اللغات

---

## 🎯 الخطوات السريعة (ملخص)

```powershell
# 1. تشغيل الترحيل
$env:DATABASE_URL = "postgres://..."
node scripts/run_translation_migration.js

# 2. Push على GitHub
git add .
git commit -m "✨ Add translations"
git push origin main

# 3. على Vercel:
# - Import repo من GitHub
# - ضيف Environment Variables
# - اضغط Deploy
```

---

## 📞 معلومات مفيدة

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Console:** https://app.supabase.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**استعد للإطلاق! 🎉 الموقع الحي قريباً! 🚀**
