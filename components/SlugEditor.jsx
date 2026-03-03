import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateUniqueSlug } from '@/lib/slugUtils';

export default function SlugEditor({ restaurantId, initialSlug, onSlugChange }) {
  const [slug, setSlug] = useState(initialSlug || '');
  const [available, setAvailable] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    const check = setTimeout(async () => {
      setChecking(true);
      setError('');
      const valid = /^[a-zA-Z0-9-]+$/.test(slug);
      if (!valid) {
        setAvailable(false);
        setError('يُسمح فقط بالحروف والأرقام والشرطات');
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (data && data.id !== restaurantId) {
        setAvailable(false);
        setError('هذا الرابط مستخدم بالفعل');
      } else {
        setAvailable(true);
        setError('');
      }
      setChecking(false);
    }, 400);
    return () => clearTimeout(check);
  }, [slug, restaurantId]);

  const handleChange = async (e) => {
    setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''));
  };

  const handleAuto = async () => {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single();
    if (restaurant?.name) {
      const newSlug = await generateUniqueSlug(restaurant.name);
      setSlug(newSlug);
    }
  };

  useEffect(() => {
    if (onSlugChange) onSlugChange(slug, available);
  }, [slug, available, onSlugChange]);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold">رابط المنيو (slug):</label>
      <div className="flex gap-2 items-center">
        <input
          className="border rounded px-2 py-1"
          value={slug}
          onChange={handleChange}
          dir="ltr"
        />
        <button type="button" className="text-xs bg-gray-100 px-2 py-1 rounded" onClick={handleAuto}>
          توليد تلقائي
        </button>
        {checking && <span className="text-xs text-gray-500">...جاري الفحص</span>}
        {!checking && available && slug && <span className="text-xs text-green-600">متاح ✓</span>}
        {!checking && !available && slug && <span className="text-xs text-red-600">غير متاح ✗</span>}
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
