#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/*
  Backfill translations for existing menu items, variants, and addons.
  Usage:
    Set env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    node scripts/backfill_translations.js
*/

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')
const readline = require('readline')

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  // Try to load from .env.local
  let SUPABASE_URL = process.env.SUPABASE_URL
  let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL) {
    SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  if (!SUPABASE_URL) {
    const envPath = path.join(__dirname, '..', '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
      if (urlMatch) {
        SUPABASE_URL = urlMatch[1].trim()
      }
    }
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment.')
    console.log('Please enter your Service Role Key from Supabase Dashboard → Settings → API')
    SUPABASE_SERVICE_ROLE_KEY = await promptUser('Service Role Key: ')
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // dynamic import of ESM module lib/translate.js
  const translateModulePath = path.join(__dirname, '..', 'lib', 'translate.js')
  const { translateText } = await import(`file://${translateModulePath}`)

  console.log('Checking schema by reading one item...')
  const { data: oneItem } = await supabase.from('menu_items').select('*').limit(1).maybeSingle()
  if (!oneItem) {
    console.error('No menu_items found (or cannot access). Aborting.')
    process.exit(1)
  }

  const hasDescriptionEn = Object.prototype.hasOwnProperty.call(oneItem, 'description_en')
  const hasNameEn = Object.prototype.hasOwnProperty.call(oneItem, 'name_en')

  if (!hasDescriptionEn || !hasNameEn) {
    console.error('Missing translation columns on `menu_items` (description_en or name_en).')
    console.error('Please run the SQL migration in migrations/001_add_translation_columns.sql and ensure menu_items has the expected columns. Aborting.')
    process.exit(1)
  }

  const ITEM_ID = process.env.ITEM_ID || null

  console.log(ITEM_ID ? `Running in TEST mode for ITEM_ID=${ITEM_ID}` : 'Fetching all items, variants and addons...')

  let items = []
  let variants = []
  let addons = []

  if (ITEM_ID) {
    const { data: singleItem } = await supabase.from('menu_items').select('*').eq('id', ITEM_ID).maybeSingle()
    if (singleItem) items = [singleItem]
    const { data: singleVariants } = await supabase.from('item_variants').select('*').eq('menu_item_id', ITEM_ID)
    const { data: singleAddons } = await supabase.from('menu_addons').select('*').eq('menu_item_id', ITEM_ID)
    variants = singleVariants || []
    addons = singleAddons || []
  } else {
    const [{ data: allItems }, { data: allVariants }, { data: allAddons }] = await Promise.all([
      supabase.from('menu_items').select('*'),
      supabase.from('item_variants').select('*'),
      supabase.from('menu_addons').select('*')
    ])
    items = allItems || []
    variants = allVariants || []
    addons = allAddons || []
  }

  // Index variants and addons by menu_item_id
  const variantsByItem = {}
  for (const v of variants) {
    variantsByItem[v.menu_item_id] = variantsByItem[v.menu_item_id] || []
    variantsByItem[v.menu_item_id].push(v)
  }

  const addonsByItem = {}
  for (const a of addons) {
    addonsByItem[a.menu_item_id] = addonsByItem[a.menu_item_id] || []
    addonsByItem[a.menu_item_id].push(a)
  }

  // Translate each item
  for (const item of items) {
    try {
      const id = item.id
      console.log(`Translating item ${id} - ${item.name || '[no-name]'}`)

      // Name
      if (!item.name_en || item.name_en === '') {
        const nameTrans = await translateText(item.name || '')
        await supabase.from('menu_items').update({ name_en: nameTrans.en, name_fr: nameTrans.fr, name_de: nameTrans.de, name_it: nameTrans.it || nameTrans.en }).eq('id', id)
      }

      // Description
      if (!item.description_en || item.description_en === '') {
        const descTrans = await translateText(item.description || '')
        await supabase.from('menu_items').update({ description_en: descTrans.en, description_fr: descTrans.fr, description_de: descTrans.de, description_it: descTrans.it || descTrans.en }).eq('id', id)
      }

      // Variants
      const itemVariants = variantsByItem[id] || []
      for (const v of itemVariants) {
        if (!v.name_en || v.name_en === '') {
          const vt = await translateText(v.name || '')
          await supabase.from('item_variants').update({ name_en: vt.en, name_fr: vt.fr, name_de: vt.de, name_it: vt.it || vt.en }).eq('id', v.id)
        }
      }

      // Addons
      const itemAddons = addonsByItem[id] || []
      for (const a of itemAddons) {
        if (!a.name_en || a.name_en === '') {
          const at = await translateText(a.name || '')
          await supabase.from('menu_addons').update({ name_en: at.en, name_fr: at.fr, name_de: at.de, name_it: at.it || at.en }).eq('id', a.id)
        }
      }

    } catch (err) {
      console.error('Error processing item', item.id, err)
    }
  }

  console.log('Backfill completed.')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
