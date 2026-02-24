import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 960, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Output configuration for Vercel
  output: 'standalone',

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // Explicitly set the dist directory
  distDir: '.next',

  // Ensure the app directory is recognized
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // HTTP Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=600'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
