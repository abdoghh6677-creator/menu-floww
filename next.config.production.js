/**
 * 🚀 إعدادات الإنتاج - Production Configuration
 * تحسينات الأداء والأمان للنشر أونلاين
 */

module.exports = {
  // Next.js Config
  reactStrictMode: true,
  
  // Compression
  compress: true,
  
  // Image Optimization
  images: {
    domains: [
      'supabase.co',
      'subdomain.supabase.co', // ادخل دومين Supabase الفعلي
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers الأمنية والـ Cache
  async headers() {
    return [
      // API Routes - لا تُحفظ
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      // Dashboard - تحديث الـ cache كل 5 ثواني
      {
        source: '/dashboard',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=5, stale-while-revalidate=604800',
          },
        ],
      },
      // الصفحات الديناميكية - تعطيل الكاش على صفحات القائمة لتجنب المحتوى القديم على الموبايل
      {
        source: '/menu/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      // جميع الصفحات الأخرى
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },

  // إعادة التوجيه
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/auth',
        missing: [{ type: 'header', key: 'authorization' }],
        permanent: false,
      },
    ]
  },

  // إعادة الكتابة
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap.xml',
        },
      ],
    }
  },

  // متغيرات البيئة
  env: {
    // هذه تُعدّل تلقائياً من Vercel
  },

  // Webpack
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    }
    return config
  },

  // SWR Cache
  swcMinify: true,

  // ISO String
  experimental: {
    isrMemoryCacheSize: 50,
  },
}
