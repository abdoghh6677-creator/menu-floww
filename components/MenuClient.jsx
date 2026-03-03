"use client";
import { useState } from "react";

export default function MenuClient({ restaurant, menuItems }) {
  const [search, setSearch] = useState("");
  const filtered = menuItems.filter(
    (item) =>
      item.name_ar?.includes(search) ||
      item.name?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">{restaurant.name}</h1>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="ابحث في المنيو..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-4">
        {filtered.length === 0 && <div>لا توجد نتائج</div>}
        {filtered.map((item) => (
          <div key={item.id} className="border rounded p-4 bg-white/80">
            <div className="font-semibold text-lg">{item.name_ar || item.name}</div>
            <div className="text-gray-600">{item.description_ar || item.description}</div>
            <div className="text-orange-600 font-bold mt-2">{item.price} ج.م</div>
          </div>
        ))}
      </div>
    </div>
  );
}
