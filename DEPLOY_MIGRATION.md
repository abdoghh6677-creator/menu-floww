# خطوات ترحيل قاعدة البيانات لتفعيل slug

1. شغّل جميع ملفات migration الجديدة:
   - 005_add_slug_to_restaurants.sql
   - 006_add_restaurant_slug_to_menu_items.sql

2. تأكد من أن جميع المطاعم لديها slug فريد.

3. تأكد من أن جميع عناصر المنيو لديها restaurant_slug مطابق لجدول المطاعم.

4. اختبر الروابط الجديدة (مثال: /menu/al-amir).

5. احذف أو عطّل مسار /menu/[id] إذا لم يعد مطلوبًا.

6. حدث أي روابط أو تحويلات في النظام أو QR code لتستخدم slug.

> يمكنك تنفيذ الترحيل عبر Supabase SQL editor أو أي أداة migration.
