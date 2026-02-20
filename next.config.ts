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
};

export default nextConfig;
