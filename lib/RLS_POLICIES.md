/**
 * 🔒 سياسات الأمان في Supabase (RLS - Row Level Security)
 * 
 * تطبيق هذه السياسات يضمن أن كل مستخدم لا يمكنه الوصول إلا إلى بياناته الخاصة
 */

/**
 * جدول: restaurants
 * 
 * السياسة 1: SELECT - يمكن فقط لمالك المطعم قراءة بيانات المطعم
 * ```sql
 * CREATE POLICY "Users can view their own restaurants"
 * ON restaurants FOR SELECT
 * USING (auth.uid() = user_id)
 * ```
 * 
 * السياسة 2: INSERT - يمكن إدراج مطعم جديد فقط إذا كان user_id = المستخدم الحالي
 * ```sql
 * CREATE POLICY "Users can create their own restaurants"
 * ON restaurants FOR INSERT
 * WITH CHECK (auth.uid() = user_id)
 * ```
 * 
 * السياسة 3: UPDATE - يمكن تحديث بيانات المطعم فقط من قبل مالكه
 * ```sql
 * CREATE POLICY "Users can update their own restaurants"
 * ON restaurants FOR UPDATE
 * USING (auth.uid() = user_id)
 * WITH CHECK (auth.uid() = user_id)
 * ```
 * 
 * السياسة 4: DELETE - يمكن حذف المطعم فقط من قبل مالكه
 * ```sql
 * CREATE POLICY "Users can delete their own restaurants"
 * ON restaurants FOR DELETE
 * USING (auth.uid() = user_id)
 * ```
 */

/**
 * جدول: menu_items
 * 
 * السياسة 1: SELECT - يمكن قراءة الأصناف التي تنتمي إلى المطاعم المملوكة للمستخدم
 * ```sql
 * CREATE POLICY "Users can view menu items of their restaurants"
 * ON menu_items FOR SELECT
 * USING (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 * 
 * السياسة 2: INSERT - يمكن إضافة صنف فقط للمطاعم المملوكة للمستخدم
 * ```sql
 * CREATE POLICY "Users can create menu items in their restaurants"
 * ON menu_items FOR INSERT
 * WITH CHECK (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 * 
 * السياسة 3: UPDATE - يمكن تحديث صنف فقط في مطعمك
 * ```sql
 * CREATE POLICY "Users can update menu items in their restaurants"
 * ON menu_items FOR UPDATE
 * USING (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * WITH CHECK (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 * 
 * السياسة 4: DELETE - يمكن حذف صنف فقط من مطعمك
 * ```sql
 * CREATE POLICY "Users can delete menu items from their restaurants"
 * ON menu_items FOR DELETE
 * USING (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 */

/**
 * جدول: orders
 * 
 * السياسة 1: SELECT - يمكن قراءة الطلبات الخاصة بمطاعمك فقط
 * ```sql
 * CREATE POLICY "Users can view orders for their restaurants"
 * ON orders FOR SELECT
 * USING (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 * 
 * السياسة 2: SELECT (عام) - أي شخص يمكنه قراءة الطلبات العامة
 * ```sql
 * CREATE POLICY "Anyone can view orders by ID"
 * ON orders FOR SELECT
 * USING (true) -- يمكن تحديده حسب احتياجك
 * ```
 * 
 * السياسة 3: INSERT - يمكن إضافة طلب لأي مطعم
 * ```sql
 * CREATE POLICY "Anyone can create orders"
 * ON orders FOR INSERT
 * WITH CHECK (true)
 * ```
 * 
 * السياسة 4: UPDATE - يمكن تحديث الطلب من قبل مالك المطعم فقط
 * ```sql
 * CREATE POLICY "Users can update orders in their restaurants"
 * ON orders FOR UPDATE
 * USING (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * WITH CHECK (
 *   restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 */

/**
 * جدول: menu_addons و menu_item_variants و item_variants
 * 
 * نفس السياسات مثل menu_items، بدل restaurant_id بـ:
 * ```sql
 * menu_item_id IN (
 *   SELECT id FROM menu_items 
 *   WHERE restaurant_id IN (
 *     SELECT id FROM restaurants WHERE user_id = auth.uid()
 *   )
 * )
 * ```
 */

/**
 * تفعيل RLS على جميع الجداول
 * ```sql
 * ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE menu_addons ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE bill_splits ENABLE ROW LEVEL SECURITY;
 * ```
 */

/**
 * ملاحظات أمنية مهمة:
 * 
 * 1. لا تستخدم Service Role Key في المتصفح أبداً
 *    - استخدم فقط Anon Key
 *    - Service Role Key يجب أن يكون فقط في الخادم (backend)
 * 
 * 2. فعّل البريد الإلكتروني والتحقق
 *    - تفعيل تأكيد البريد الإلكتروني
 *    - إرسال رابط إعادة تعيين كلمة المرور
 * 
 * 3. استخدم HTTPS فقط
 *    - الإرسال الآمن للبيانات الحساسة
 * 
 * 4. حماية من CORS
 *    - حدد Origins المسموحة
 * 
 * 5. تسجيل الأحداث الأمنية
 *    - احفظ محاولات تسجيل الدخول الفاشلة
 *    - احفظ التغييرات المهمة
 * 
 * 6. مراجعة الصلاحيات بانتظام
 *    - تحقق من أن المستخدمين لا يرون بيانات الآخرين
 */

export const RLS_POLICIES = {
  documentation: 'انسخ والصق قوانين RLS أعلاه في SQL editor في Supabase dashboard',
  url: 'https://app.supabase.com'
}

export default RLS_POLICIES
