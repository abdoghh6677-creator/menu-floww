/* Production configuration for Next.js (used on deployment)
  Kept minimal here because primary config lives in next.config.ts */

module.exports = {
  // Next.js Config
  reactStrictMode: true,

  // Compression
  compress: true,

  // Image Optimization
  images: {
    domains: [
      'supabase.co',
      'subdomain.supabase.co', // أدخل دومين Supabase الفعلي إن وجدت
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        source: '/dashboard',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=5, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/menu/:id',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
    ]
  },

  // Redirects
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

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/sitemap.xml', destination: '/api/sitemap.xml' },
      ],
    }
  },

  // Webpack customizations
  webpack: (config, { isServer }) => {
    config.optimization = { ...config.optimization, minimize: true }
    return config
  },

  // Minify with SWC
  swcMinify: true,

  // Experimental flags
    experimental: { isrMemoryCacheSize: 50 },
  }
