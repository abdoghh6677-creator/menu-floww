#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 🚀 سكريبت إنشاء bucket للصور في Supabase
 *
 * المطلوب:
 * - SERVICE_ROLE_KEY من Supabase
 *
 * الاستخدام:
 * node scripts/create_storage_bucket.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ylvygdlfggcaavxexuqv.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.log('❌ يرجى تعيين SUPABASE_SERVICE_ROLE_KEY في متغيرات البيئة')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  console.log('🔧 إنشاء bucket "menu-images"...')

  try {
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('menu-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ البكت موجود بالفعل')
      } else {
        console.log('❌ خطأ في إنشاء البكت:', error.message)
        return
      }
    } else {
      console.log('✅ تم إنشاء البكت بنجاح')
    }

    // Set up policies
    console.log('🔧 إعداد الصلاحيات...')

    // Policy for uploading (authenticated users)
    const { error: uploadPolicyError } = await supabase.rpc('create_storage_policy', {
      name: 'Users can upload menu images',
      bucket: 'menu-images',
      operation: 'INSERT',
      definition: `bucket_id = 'menu-images' AND auth.role() = 'authenticated'`
    })

    if (uploadPolicyError && !uploadPolicyError.message.includes('already exists')) {
      console.log('⚠️ تحذير في إعداد صلاحية الرفع:', uploadPolicyError.message)
    }

    // Policy for viewing (public)
    const { error: viewPolicyError } = await supabase.rpc('create_storage_policy', {
      name: 'Public can view menu images',
      bucket: 'menu-images',
      operation: 'SELECT',
      definition: `bucket_id = 'menu-images'`
    })

    if (viewPolicyError && !viewPolicyError.message.includes('already exists')) {
      console.log('⚠️ تحذير في إعداد صلاحية العرض:', viewPolicyError.message)
    }

    console.log('✅ تم إعداد الصلاحيات بنجاح')
    console.log('🎉 جاهز لرفع الصور!')

  } catch (err) {
    console.log('❌ خطأ:', err.message)
  }
}

main()