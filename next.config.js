const nextConfig = {
  compress: true,
  images: {
    domains: [
      'supabase.co',
      'subdomain.supabase.co',
      'localhost'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 960, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  output: 'standalone',
  typescript: { ignoreBuildErrors: false },
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=600' }
        ]
      }
    ];
  },
  turbopack: {},
};

module.exports = nextConfig;
