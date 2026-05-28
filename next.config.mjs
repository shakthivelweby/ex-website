/** @type {import('next').NextConfig} */
const mobileIp = '192.168.1.38';

/** Laravel origin used by Next.js rewrites (proxy /api/web → Laravel). */
const laravelOrigin = (
  process.env.LARAVEL_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  `http://${mobileIp}:8000`
)
  .trim()
  .replace(/\/+$/, '');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/web/:path*',
        destination: `${laravelOrigin}/api/web/:path*`,
      },
    ];
  },
  typescript: {
    // Disable type checking during build (for faster dev)
    ignoreBuildErrors: true,
  },

  // NOTE: Next.js doesn't accept arbitrary config keys. Keep non-Next settings out of this file.

  // ✅ Configure remote images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: mobileIp,
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'api.exploreworld.com',
        pathname: '/images/**',
      },
    ],
  },

  // Turbopack is stable; no experimental.turbo needed (and it breaks config validation in v15).
};

export default nextConfig;
