import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingExcludes: {
    '*': [
      './research/**',
      './assets-source/**',
      './scripts/**',
      './tests/**',
      './docs/**',
    ],
  },
};

export default nextConfig;
