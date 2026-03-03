import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  // جلب بيانات المطعم من Supabase
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('name, short_name, logo_url, branding')
    .eq('slug', slug)
    .single();

  if (error || !restaurant) {
    return NextResponse.json({ error: 'لم يتم العثور على المطعم' }, { status: 404 });
  }

  const { name, short_name, logo_url, branding } = restaurant;
  const background_color = branding?.background_color || '#ffffff';
  const theme_color = branding?.theme_color || '#222222';

  const manifest = {
    name: name,
    short_name: short_name || name,
    start_url: `/menu/${slug}`,
    display: 'standalone',
    background_color,
    theme_color,
    icons: [
      {
        src: logo_url,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: logo_url,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    lang: 'ar',
    dir: 'rtl',
  };

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
