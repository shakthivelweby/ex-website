/** @type {import('next').NextConfig} */

const mobileIp = '192.168.1.38';

const nextConfig = {
  // ✅ Custom config for your own use (not used by Next.js itself)
  allowedDevOrigins: [
    mobileIp,
    'http://localhost:3000',
    'https://api.exploreworld.com',
  ],

  // ✅ Remote image patterns used by Next.js <Image />
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: mobileIp,
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
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
};

export default nextConfig;
