// نسخة من page.js مع تغيير param من id إلى slug
'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabaseClient'
// ... باقي الاستيرادات كما في الأصل ...

export default function MenuPage({ params }) {
  const { slug } = params;
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadMenu();
  }, [slug]);

  const loadMenu = async () => {
    setLoading(true);
    // جلب بيانات المطعم عبر slug
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();
    if (restaurantError || !restaurant) {
      setRestaurant(null);
      setMenuItems([]);
      setLoading(false);
      return;
    }
    setRestaurant(restaurant);
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_slug', slug);
    setMenuItems(items || []);
    setLoading(false);
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (!restaurant) return <div>المطعم غير موجود</div>;

  return (
    <div>
      <h1>{restaurant.name}</h1>
      <div>
        {menuItems.map(item => (
          <div key={item.id}>{item.name_ar || item.name}</div>
        ))}
      </div>
    </div>
  );
}
