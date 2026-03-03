'use client'
import { useEffect, useState } from 'react';

export default function InstallPrompt({ restaurantName }: { restaurantName: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 z-50 bg-white border shadow-lg flex items-center justify-between px-4 py-3 rounded-lg rtl flex-row-reverse" style={{direction:'rtl'}}>
      <span className="text-base font-semibold">أضف المنيو لشاشتك ({restaurantName})</span>
      <div className="flex gap-2">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              setShowBanner(false);
              setDeferredPrompt(null);
            }
          }}
        >تثبيت</button>
        <button
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          onClick={() => setShowBanner(false)}
        >إغلاق</button>
      </div>
    </div>
  );
}
