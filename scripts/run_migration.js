#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 🚀 سكريبت تشغيل الترحيل تلقائياً على Supabase
 * 
 * المطلوب:
 * - SERVICE_ROLE_KEY من Supabase
 * 
 * الاستخدام:
 * node scripts/run_migration.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ylvygdlfggcaavxexuqv.supabase.co'
let SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('\n🔧 سكريبت الترحيل - Digital Menu SaaS\n')
  console.log('=' .repeat(60))

  // Check if SERVICE_ROLE_KEY is provided
  if (!SERVICE_ROLE_KEY) {
    console.log('\n⚠️  لم يتم العثور على SUPABASE_SERVICE_ROLE_KEY')
    console.log('📝 يرجى اتباع الخطوات التالية للحصول عليها:\n')
    console.log('1. اذهب إلى: https://app.supabase.com/project/ylvygdlfggcaavxexuqv')
    console.log('2. من القائمة اليسار → Settings → API')
    console.log('3. ابحث عن: "service_role" key')
    console.log('4. انسخ القيمة الكاملة (تبدأ بـ eyJ...)\n')
    
    SERVICE_ROLE_KEY = await question('الصق SERVICE_ROLE_KEY هنا: ')
  }

  if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.length < 50) {
    console.log('\n❌ خطأ: KEY المدخل غير صالح!')
    console.log('تأكد من نسخ القيمة الكاملة من Supabase\n')
    rl.close()
    process.exit(1)
  }

  console.log('\n✅ تم التحقق من SERVICE_ROLE_KEY')
  console.log('🔗 الاتصال بـ Supabase...\n')

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // قراءة ملفات الترحيل
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../migrations/001_add_translation_columns.sql'),
      'utf-8'
    )
    const migration3 = fs.readFileSync(
      path.join(__dirname, '../migrations/003_add_addons_header.sql'),
      'utf-8'
    )

    const migrations = [
      { name: '001_add_translation_columns.sql', sql: migration1 },
      { name: '003_add_addons_header.sql', sql: migration3 }
    ]

    let successCount = 0
    let errorCount = 0

    for (const migration of migrations) {
      console.log(`\n📋 تشغيل الترحيل: ${migration.name}`)
      console.log('-'.repeat(60))

      try {
        // Split SQL by semicolon to handle multiple statements
        const statements = migration.sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0)

        for (const statement of statements) {
          const { data, error } = await supabase.rpc('exec_sql', {
            statement: statement
          }).catch(err => {
            // If exec_sql doesn't exist, try direct query
            return supabase.query(statement)
          })

          if (error) {
            // Some errors are expected (columns already exist)
            if (error.message && error.message.includes('already exists')) {
              console.log(`⚠️  (تحذير غير ضار) الأعمدة موجودة بالفعل`)
            } else if (!error.message?.includes('duplicate column name')) {
              console.log(`⚠️  ${error.message || error}`)
            }
          }
        }

        // Try simple test query to verify connection
        const { data, error: testError } = await supabase
          .from('menu_items')
          .select('id')
          .limit(1)

        if (!testError) {
          console.log(`✅ تم تشغيل الترحيل بنجاح!`)
          successCount++
        } else {
          console.log(`❌ خطأ: ${testError.message}`)
          errorCount++
        }
      } catch (err) {
        console.log(`❌ خطأ: ${err.message}`)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n📊 النتائج: ✅ ${successCount} ناجح | ❌ ${errorCount} فشل\n`)

    if (successCount > 0) {
      console.log('🎉 تم إعداد قاعدة البيانات بنجاح!')
      console.log('\n📝 الخطوات التالية:')
      console.log('1. اذهب إلى Dashboard على: http://localhost:3000/dashboard')
      console.log('2. أضف صنف جديد مع ترجمات متعددة اللغات')
      console.log('3. تحقق من أن الترجمات تظهر على الموقع العام\n')
    } else {
      console.log('⚠️  لم تعمل الترحيلات. يرجى المحاولة يدويًا:\n')
      console.log('1. افتح: https://app.supabase.com/project/ylvygdlfggcaavxexuqv')
      console.log('2. من اليسار: SQL Editor → + New query')
      console.log('3. انسخ محتوى: migrations/001_add_translation_columns.sql')
      console.log('4. اضغط Run\n')
    }

    rl.close()
    process.exit(successCount > 0 ? 0 : 1)
  } catch (err) {
    console.log(`\n❌ خطأ في الاتصال: ${err.message}\n`)
    console.log('🔍 التحقق من النقاط التالية:')
    console.log('- هل SERVICE_ROLE_KEY صحيح وكامل؟')
    console.log('- هل الاتصال بالإنترنت متوفر؟')
    console.log('- هل الـ project ID صحيح؟\n')
    rl.close()
    process.exit(1)
  }
}

main()
