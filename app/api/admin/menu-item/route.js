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
    const { item = {}, addons = [], variants = [] } = body

    // whitelist allowed item fields to avoid inserting unexpected columns
    const allowedItemFields = [
      'id','restaurant_id','name','name_en','name_fr','name_de','name_ru','name_ja',
      'description','description_en','description_fr','description_de','description_ru','description_ja',
      'addons_header',
      'price','category','image_url','has_promotion','promotion_discount','hide_when_available'
    ]
    const pick = (src, keys) => keys.reduce((acc, k) => { if (src && Object.prototype.hasOwnProperty.call(src, k)) acc[k] = src[k]; return acc }, {})

    // Generate UUID for new menu_item if not provided
    const itemId = item.id || randomUUID()
    const cleanItem = pick(item, allowedItemFields)
    const itemWithId = { ...cleanItem, id: itemId }
    // warn about unexpected keys
    const extraKeys = Object.keys(item || {}).filter(k => !allowedItemFields.includes(k) && k !== 'id')
    if (extraKeys.length > 0) console.warn('[WARN] Ignoring unexpected item fields:', extraKeys)
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
      const allowedAddonFields = ['id','menu_item_id','name','name_en','name_fr','name_de','name_ru','name_ja','price']
      const addonsToInsert = addons.map(a => {
        const id = a.id && typeof a.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(a.id) ? a.id : randomUUID()
        const clean = pick(a, allowedAddonFields)
        return ({ ...clean, id, menu_item_id: itemId })
      })
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) {
        console.error('Supabase insert menu_addons error:', addonsError)
        return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
      }
    }

    if (variants && variants.length > 0) {
      const allowedVariantFields = ['id','menu_item_id','name','name_en','name_fr','name_de','name_ru','name_ja','price','is_default']
      const variantsToInsert = variants.map(v => {
        const id = v.id && typeof v.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(v.id) ? v.id : randomUUID()
        const clean = pick(v, allowedVariantFields)
        return ({ ...clean, id, menu_item_id: itemId })
      })
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
    const { item = {}, addons = [], variants = [] } = body

    console.log(`[DEBUG] API PUT: addons count: ${addons.length}, variants count: ${variants.length}`)
    console.log(`[DEBUG] API PUT: addons:`, JSON.stringify(addons))
    console.log(`[DEBUG] API PUT: variants:`, JSON.stringify(variants))

    // update item — try to use numeric id if it looks like one
    console.log(`[DEBUG] Attempting to update menu_items with id=${id}`)

    // If the provided id is not a UUID (e.g., a temporary Date.now() value),
    // attempt to resolve the real menu_item by matching on stable fields
    // (restaurant_id + name + price). This helps when the client used a
    // temporary numeric id and then attempts to PUT updates.
    const isUuid = (s) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
    let targetId = id
    if (!isUuid(id)) {
      console.warn('[WARN] Provided id is not a UUID, attempting to resolve real item id')
      try {
        if (item && item.restaurant_id && item.name) {
          const found = await supabaseAdmin.from('menu_items')
            .select('id')
            .eq('restaurant_id', item.restaurant_id)
            .eq('name', item.name)
            .eq('price', item.price)
            .order('created_at', { ascending: false })
            .limit(1)

          if (found.error) {
            console.error('[ERROR] lookup menu_item by attributes failed:', found.error)
          } else if (found.data && found.data.length > 0) {
            targetId = found.data[0].id
            console.log('[DEBUG] Resolved real menu_item id ->', targetId)
          } else {
            console.warn('[WARN] Could not resolve real id for temporary id:', id)
            return new Response(JSON.stringify({ error: 'Invalid id: not a UUID and could not resolve real item. Refresh and try again.' }), { status: 400 })
          }
        } else {
          return new Response(JSON.stringify({ error: 'Invalid id and insufficient item data to resolve real item' }), { status: 400 })
        }
      } catch (err) {
        console.error('[ERROR] exception while resolving real id:', err)
        return new Response(JSON.stringify({ error: 'Server error while resolving item id' }), { status: 500 })
      }
    }

    // whitelist update fields
    const allowedItemFields = [
      'restaurant_id','name','name_en','name_fr','name_de','name_ru','name_ja',
      'description','description_en','description_fr','description_de','description_ru','description_ja',
      'addons_header',
      'price','category','image_url','has_promotion','promotion_discount','hide_when_available'
    ]
    const pick = (src, keys) => keys.reduce((acc, k) => { if (src && Object.prototype.hasOwnProperty.call(src, k)) acc[k] = src[k]; return acc }, {})
    const itemPayload = pick(item, allowedItemFields)

    const upd = await supabaseAdmin.from('menu_items').update(itemPayload).eq('id', targetId)
    if (upd.error) {
      console.error('[ERROR] Supabase update menu_items error:', upd.error)
      console.error('[ERROR] Full error object:', JSON.stringify(upd.error))
      return new Response(JSON.stringify({ error: upd.error }), { status: 500 })
    }

    // replace addons (use resolved UUID targetId)
    const delAddons = await supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', targetId)
    if (delAddons.error) {
      console.error('Supabase delete menu_addons error:', delAddons.error)
      return new Response(JSON.stringify({ error: delAddons.error }), { status: 500 })
    }
    if (addons && addons.length > 0) {
      const allowedAddonFields = ['id','menu_item_id','name','name_en','name_fr','name_de','name_ru','name_ja','price']
      const addonsToInsert = addons.map(a => {
        const aid = a.id && typeof a.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(a.id) ? a.id : randomUUID()
        const clean = pick(a, allowedAddonFields)
        return ({ ...clean, id: aid, menu_item_id: targetId })
      })
      const { error: addonsError } = await supabaseAdmin.from('menu_addons').insert(addonsToInsert)
      if (addonsError) {
        console.error('Supabase insert menu_addons error (PUT):', addonsError)
        return new Response(JSON.stringify({ error: addonsError }), { status: 500 })
      }
    }

    // replace variants
    const delVariants = await supabaseAdmin.from('item_variants').delete().eq('menu_item_id', targetId)
    if (delVariants.error) {
      console.error('Supabase delete item_variants error:', delVariants.error)
      return new Response(JSON.stringify({ error: delVariants.error }), { status: 500 })
    }
    if (variants && variants.length > 0) {
      const allowedVariantFields = ['id','menu_item_id','name','name_en','name_fr','name_de','name_ru','name_ja','price','is_default']
      const variantsToInsert = variants.map(v => {
        const vid = v.id && typeof v.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(v.id) ? v.id : randomUUID()
        const clean = pick(v, allowedVariantFields)
        return ({ ...clean, id: vid, menu_item_id: targetId })
      })
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
