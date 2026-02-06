import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in environment')
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export async function POST(req) {
  try {
    const body = await req.json()
    const { item, addons = [], variants = [] } = body

    const res = await supabaseAdmin.from('menu_items').insert([item]).select()
    if (res.error) return new Response(JSON.stringify({ error: res.error }), { status: 500 })
    const created = res.data && res.data[0]
    if (!created) return new Response(JSON.stringify({ error: 'No item created' }), { status: 500 })

    const itemId = created.id

    if (addons && addons.length > 0) {
      const addonsToInsert = addons.map(a => ({ ...a, menu_item_id: itemId }))
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
    }

    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({ ...v, menu_item_id: itemId }))
      const { error: variantsError } = await supabaseAdmin.from('item_variants').insert(variantsToInsert)
      if (variantsError) return new Response(JSON.stringify({ error: variantsError }), { status: 500 })
    }

    return new Response(JSON.stringify({ data: created }), { status: 200 })
  } catch (e) {
    console.error('API POST /api/admin/menu-item error:', e)
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'Missing id query parameter' }), { status: 400 })

    const body = await req.json()
    const { item, addons = [], variants = [] } = body

    // update item
    const upd = await supabaseAdmin.from('menu_items').update(item).eq('id', id)
    if (upd.error) return new Response(JSON.stringify({ error: upd.error }), { status: 500 })

    // replace addons
    const delAddons = await supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', id)
    if (delAddons.error) return new Response(JSON.stringify({ error: delAddons.error }), { status: 500 })
    if (addons && addons.length > 0) {
      const addonsToInsert = addons.map(a => ({ ...a, menu_item_id: id }))
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
    }

    // replace variants
    const delVariants = await supabaseAdmin.from('item_variants').delete().eq('menu_item_id', id)
    if (delVariants.error) return new Response(JSON.stringify({ error: delVariants.error }), { status: 500 })
    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({ ...v, menu_item_id: id }))
      const { error: variantsError } = await supabaseAdmin.from('item_variants').insert(variantsToInsert)
      if (variantsError) return new Response(JSON.stringify({ error: variantsError }), { status: 500 })
    }

    return new Response(JSON.stringify({ data: true }), { status: 200 })
  } catch (e) {
    console.error('API PUT /api/admin/menu-item error:', e)
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 500 })
  }
}
