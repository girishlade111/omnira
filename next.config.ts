import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
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
