# 🚀 تشغيل الترحيل على Supabase

اختر الطريقة التي تناسبك أفضل:

---

## الطريقة 1️⃣: SQL Editor (الأسهل والأسرع)

### الخطوات:
1. افتح **Supabase Dashboard**: https://app.supabase.com
2. اذهب إلى: **Your Project → SQL Editor**
3. اضغط **"+ New query"**
4. **انسخ والصق** محتوى الملف:
   ```
   c:\Users\VIP\digital-menu-saas\migrations\001_add_translation_columns.sql
   ```
5. اضغط **"Run"** (الزر الأسود)
6. تأكد من الرسالة الخضراء: ✅ **"Success"**

**مدة التنفيذ:** < 5 ثواني

---

## الطريقة 2️⃣: PowerShell (السكربت التلقائي)

### المتطلبات:
- Node.js مثبت (`npm --version` في PowerShell)
- DATABASE_URL من Supabase

### الخطوات:

#### أ) احصل على DATABASE_URL:
1. افتح Supabase Dashboard → Your Project
2. اذهب إلى: **Settings → Database → Connection**
3. اختر **URI** من القائمة
4. انسخ الـ URL (يبدو مثل: `postgres://USER:PASS@HOST/DBNAME`)

#### ب) شغّل السكربت:
```powershell
# افتح PowerShell كمسؤول
cd C:\Users\VIP\digital-menu-saas

# ضع DATABASE_URL في المتغير (استبدل بالـ URL الفعلي):
$env:DATABASE_URL = "postgres://YOUR_USER:YOUR_PASSWORD@db.ylvygdlfggcaavxexuqv.supabase.co:5432/postgres"

# شغّل الترحيل:
node scripts/run_translation_migration.js
```

#### النتيجة المتوقعة:
```
Connected to DB
Migration applied successfully
```

---

## الطريقة 3️⃣: psql (إذا كان مثبتاً)

```powershell
# تحقق من تثبيت psql:
psql --version

# إذا كان مثبتاً:
$DATABASE_URL = "postgres://USER:PASS@db.ylvygdlfggcaavxexuqv.supabase.co:5432/postgres"
psql $DATABASE_URL -f "C:\Users\VIP\digital-menu-saas\migrations\001_add_translation_columns.sql"
```

---

## ⚙️ تفاصيل DATABASE_URL

مثال كامل:
```
postgres://postgres:MyStrongPassword123@db.ylvygdlfggcaavxexuqv.supabase.co:5432/postgres
```

الأجزاء:
- `postgres://` — البروتوكول
- `USER` — اسم المستخدم (عادة `postgres`)
- `PASS` — كلمة المرور
- `HOST` — اسم الخادم (من Supabase)
- `PORT` — 5432 (الافتراضي)
- `DBNAME` — عادة `postgres`

---

## ✅ التحقق من نجاح الترحيل

شغّل هذا الاستعلام في **SQL Editor**:

```sql
-- التحقق من وجود الأعمدة الجديدة
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY column_name;
```

**يجب أن تظهر:**
```
description
description_de
description_en
description_fr
description_ja
description_ru
name
name_de
name_en
name_fr
name_ja
name_ru
... (أعمدة أخرى)
```

---

## 🎯 بعد الترحيل

1. عد إلى PowerShell وشغّل:
   ```bash
   npm run dev
   ```

2. افتح: **http://localhost:3000/dashboard**

3. أضف صنفاً جديداً مع ملء الترجمات

4. تحقق من الحفظ بشكل صحيح

---

## ❌ استكشاف الأخطاء

### الخطأ: "connect ECONNREFUSED"
**السبب:** DATABASE_URL غير صحيحة  
**الحل:** تحقق من الـ URL من Supabase Settings

### الخطأ: "permission denied"
**السبب:** صلاحيات غير كافية  
**الحل:** استخدم حساب `postgres` (المسؤول)

### الخطأ: "column already exists"
**السبب:** الترحيل نُفِّذ مسبقاً  
**الحل:** هذا طبيعي - استخدم `IF NOT EXISTS` (البرنامج يتعامل معه)

---

**تم! الترحيل جاهز الآن. 🎉**
