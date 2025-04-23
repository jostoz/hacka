import path from 'node:path';
import { fileURLToPath } from 'node:url';
import localConfig from './config.local.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_APP_URL: localConfig.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_URL: localConfig.NEXTAUTH_URL,
    POSTGRES_URL: localConfig.POSTGRES_URL,
    OPENAI_API_KEY: localConfig.OPENAI_API_KEY,
    NEXT_PUBLIC_SHOW_MARKETING: localConfig.NEXT_PUBLIC_SHOW_MARKETING
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
      bodySizeLimit: '10mb',
    }
  },
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

    // Optimizaciones para el chat
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            chat: {
              test: /[\\/]components[\\/]chat[\\/]/,
              name: 'chat',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  }
};

export default nextConfig; 