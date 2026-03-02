# Main Project Files

هذه قائمة بأهم الملفات والمجلدات الأساسية في مشروع digital-menu-saas:

## الجذر (Root)
- `package.json` — إعدادات الحزم والسكريبتات.
- `tsconfig.json` — إعدادات TypeScript.
- `next.config.ts` — إعدادات Next.js.
- `vercel.json` — إعدادات النشر على Vercel.
- `README.md` — ملف الشرح الرئيسي للمشروع.

## مجلد app/
- `app/layout.tsx` — تخطيط وتصميم التطبيق العام.
- `app/globals.css` — الأنماط العامة (CSS).
- `app/auth/` — صفحات تسجيل الدخول والتسجيل.
- `app/dashboard/` — لوحة التحكم وإدارة القوائم.
- `app/menu/[id]/` — عرض القائمة العامة للمطعم.
- `app/pricing/` — صفحة الأسعار والباقات.

## مجلد components/
- مكونات React القابلة لإعادة الاستخدام (مثل: Analytics.jsx, BillSplitter.js, MenuThemes.js).

## مجلد lib/
- وظائف مساعدة (مثل: supabaseClient.js لإعداد Supabase، وملفات الترجمة).

## public/
- ملفات عامة (صور، أيقونات، إلخ).

## migrations/
- سكريبتات ترحيل قاعدة البيانات (SQL).

---

هذه الملفات والمجلدات هي الأساس الذي يعتمد عليه المشروع. إذا كنت بحاجة لتفاصيل أكثر عن أي ملف أو مجلد، أخبرني بذلك.