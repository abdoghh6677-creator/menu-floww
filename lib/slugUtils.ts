// أداة توليد slug تدعم العربية والإنجليزية وتتحقق من التكرار
import { supabase } from '@/lib/supabaseClient';

const ARABIC_MAP: Record<string, string> = {
  'أ': 'a', 'ا': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
  'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
  'ء': '', 'ؤ': 'w', 'ئ': 'y', 'ة': 'h', 'ﻻ': 'la', ' ': '-', '_': '-',
};

function transliterate(str: string): string {
  return str.split('').map(c => ARABIC_MAP[c] || c).join('');
}

function slugify(str: string): string {
  return transliterate(str)
    .toLowerCase()
    .replace(/[^a-z0-9\u0621-\u064A-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let base = slugify(name);
  let slug = base;
  let exists = false;
  let tries = 0;
  do {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    const { data } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    exists = !!data;
    if (exists) {
      // أضف لاحقة عشوائية قصيرة
      const suffix = Math.random().toString(36).substring(2, 5);
      slug = `${base}-${suffix}`;
      tries++;
    }
  } while (exists && tries < 5);
  return slug;
}
