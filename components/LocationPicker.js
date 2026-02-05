'use client'
import { useEffect, useRef, useState } from 'react'

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null)
  const [mapError, setMapError] = useState(null)

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return

      // موقع افتراضي (القاهرة) أو الموقع الحالي
      const defaultPos = { lat: 30.0444, lng: 31.2357 }
      const pos = initialLocation || defaultPos

      const map = new window.google.maps.Map(mapRef.current, {
        center: pos,
        zoom: 15,
      })

      const marker = new window.google.maps.Marker({
        position: pos,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      })

      const updatePosition = async (latLng) => {
        const lat = latLng.lat()
        const lng = latLng.lng()
        
        // محاولة استخدام Geocoder من Google إن وجد
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          try {
            const { results } = await geocoder.geocode({ location: { lat, lng } })
            if (results && results[0]) {
              onLocationSelect({ lat, lng, address: results[0].formatted_address })
            } else {
              onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
            }
          } catch (error) {
            console.error('Geocoding error:', error)
            onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
          }
        } else {
          onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
        }
      }

      map.addListener('click', (e) => {
        marker.setPosition(e.latLng)
        updatePosition(e.latLng)
      })

      marker.addListener('dragend', (e) => {
        updatePosition(e.latLng)
      })
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const scriptId = 'google-maps-script'
    let script = document.getElementById(scriptId)

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Google Maps API Key is missing or not configured')
        setMapError('⚠️ خريطة Google Maps غير متوفرة. يرجى إضافة مفتاح API صحيح في .env.local')
        return
      }
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoder&language=ar`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps')
        setMapError('❌ فشل تحميل خريطة Google Maps - تحقق من مفتاح API')
      }
      document.head.appendChild(script)
    }

    const handleLoad = () => initMap()
    script.addEventListener('load', handleLoad)

    return () => {
      script.removeEventListener('load', handleLoad)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (mapError) {
    return (
      <div className="w-full h-64 rounded-lg border-2 border-yellow-300 bg-yellow-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="font-bold text-yellow-700 mb-2">📍 الخريطة غير متوفرة الآن</p>
        <p className="text-sm text-yellow-600 mb-3">{mapError}</p>
        <div className="w-full">
          <input
            type="text"
            placeholder="يمكنك إدخال العنوان أو الإحداثيات يدويًا"
            onChange={(e) => {
              onLocationSelect({
                lat: 30.0444,
                lng: 31.2357,
                address: e.target.value || 'الموقع الافتراضي - القاهرة'
              })
            }}
            className="w-full px-3 py-2 border border-yellow-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-64 rounded-lg border border-gray-300" />
}