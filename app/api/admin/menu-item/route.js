import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabaseAdmin = null

if (SUPABASE_URL && SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

export async function POST(req) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Cannot run POST /api/admin/menu-item: missing Supabase server config')
      return new Response(JSON.stringify({ error: 'Server misconfigured: missing Supabase service role key or URL' }), { status: 500 })
    }

    const body = await req.json()
    console.log('[DEBUG] API POST /api/admin/menu-item body:', JSON.stringify(body))
    const { item, addons = [], variants = [] } = body

    // Generate UUID for new menu_item if not provided
    const itemId = item.id || randomUUID()
    const itemWithId = { ...item, id: itemId }
    console.log('[DEBUG] Creating menu_item with UUID:', itemId)

    const res = await supabaseAdmin.from('menu_items').insert([itemWithId]).select()
    if (res.error) {
      console.error('[ERROR] Supabase insert menu_items error:', res.error)
      return new Response(JSON.stringify({ error: res.error }), { status: 500 })
    }
    const created = res.data && res.data[0]
    console.log('[DEBUG] Created menu_item:', created)
    if (!created) return new Response(JSON.stringify({ error: 'No item created' }), { status: 500 })

    // itemId already set above from randomUUID()

    if (addons && addons.length > 0) {
      const addonsToInsert = addons.map(a => ({ ...a, menu_item_id: itemId }))
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) {
        console.error('Supabase insert menu_addons error:', addonsError)
        return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
      }
    }

    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({ ...v, menu_item_id: itemId }))
      const { error: variantsError } = await supabaseAdmin.from('item_variants').insert(variantsToInsert)
      if (variantsError) {
        console.error('Supabase insert item_variants error:', variantsError)
        return new Response(JSON.stringify({ error: variantsError }), { status: 500 })
      }
    }

    return new Response(JSON.stringify({ data: created }), { status: 200 })
  } catch (e) {
    console.error('API POST /api/admin/menu-item error:', e)
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 500 })
  }
}

export async function PUT(req) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Cannot run PUT /api/admin/menu-item: missing Supabase server config')
      return new Response(JSON.stringify({ error: 'Server misconfigured: missing Supabase service role key or URL' }), { status: 500 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'Missing id query parameter' }), { status: 400 })

    const body = await req.json()
    console.log(`[DEBUG] API PUT /api/admin/menu-item id=${id} (typeof: ${typeof id}) body:`, JSON.stringify(body))
    const { item, addons = [], variants = [] } = body

    console.log(`[DEBUG] API PUT: addons count: ${addons.length}, variants count: ${variants.length}`)
    console.log(`[DEBUG] API PUT: addons:`, JSON.stringify(addons))
    console.log(`[DEBUG] API PUT: variants:`, JSON.stringify(variants))

    // update item — try to use numeric id if it looks like one
    console.log(`[DEBUG] Attempting to update menu_items with id=${id}`)
    const upd = await supabaseAdmin.from('menu_items').update(item).eq('id', id)
    if (upd.error) {
      console.error('[ERROR] Supabase update menu_items error:', upd.error)
      console.error('[ERROR] Full error object:', JSON.stringify(upd.error))
      return new Response(JSON.stringify({ error: upd.error }), { status: 500 })
    }

    // replace addons
    const delAddons = await supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', id)
    if (delAddons.error) {
      console.error('Supabase delete menu_addons error:', delAddons.error)
      return new Response(JSON.stringify({ error: delAddons.error }), { status: 500 })
    }
    if (addons && addons.length > 0) {
      const addonsToInsert = addons.map(a => ({ ...a, menu_item_id: id }))
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) {
        console.error('Supabase insert menu_addons error (PUT):', addonsError)
        return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
      }
    }

    // replace variants
    const delVariants = await supabaseAdmin.from('item_variants').delete().eq('menu_item_id', id)
    if (delVariants.error) {
      console.error('Supabase delete item_variants error:', delVariants.error)
      return new Response(JSON.stringify({ error: delVariants.error }), { status: 500 })
    }
    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({ ...v, menu_item_id: id }))
      const { error: variantsError } = await supabaseAdmin.from('item_variants').insert(variantsToInsert)
      if (variantsError) {
        console.error('Supabase insert item_variants error (PUT):', variantsError)
        return new Response(JSON.stringify({ error: variantsError }), { status: 500 })
      }
    }

    return new Response(JSON.stringify({ data: true }), { status: 200 })
  } catch (e) {
    console.error('API PUT /api/admin/menu-item error:', e)
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 500 })
  }
}
