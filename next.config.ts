import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit app directory configuration
  experimental: {
    appDir: true,
  },

  // Compression
  compress: true,

  // Image optimization
  images: {
    domains: [
      'supabase.co',
      'subdomain.supabase.co',
      'localhost',
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Output configuration for Vercel
  output: 'standalone',

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Explicitly set the dist directory
  distDir: '.next',

  // Ensure the app directory is recognized
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
