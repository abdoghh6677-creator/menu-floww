import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Helper: perform safe update to handle missing-column schema-cache errors
export async function safeUpdate(table, payload, match) {
  if (!table || !payload) return { error: { message: 'Invalid args' } }
  let toSave = { ...payload }
  for (let attempt = 0; attempt < 5; attempt++) {
    const q = supabase.from(table).update(toSave)
    if (match && typeof match === 'object') {
      Object.keys(match).forEach(k => { q.eq(k, match[k]) })
    }
    const { data, error } = await q
    if (!error) return { data }

    const msg = (error && (error.message || error.details || '')) + ''
    const m = msg.match(/Could not find the '([^']+)' column/)
    if (m && m[1]) {
      const col = m[1]
      if (col in toSave) delete toSave[col]
      else return { error }
      continue
    }
    return { error }
  }
  return { error: { message: 'Failed to update after removing missing columns' } }
}
