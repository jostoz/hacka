import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: true,
  },
  serverExternalPackages: ['bcrypt-ts'],
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd()),
      'components': path.join(process.cwd(), 'components'),
      'lib': path.join(process.cwd(), 'lib'),
    };
    return config;
  },
};

export default nextConfig;
