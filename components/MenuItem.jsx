"use client";
import React, { useState } from 'react';

export default function MenuItem({ item, language, t, onAddToCart, onAddAddonsOnly, onRemoveFromCart, cart }) {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [open, setOpen] = useState(false);

  // ... بقية الكود المنسوخ من الصفحة ...
  // يجب نقل جميع الدوال والمتحولات المتعلقة بـ MenuItem هنا
  // يمكنك نقل الكود من ملف الصفحة مباشرة

  return (
    <div>
      {/* ... كود العرض ... */}
    </div>
  );
}
