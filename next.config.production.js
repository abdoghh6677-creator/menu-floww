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

  // Headers الأمنية
  async headers() {
    return [
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
