/** @type {import('next').NextConfig} */
const mobileIp = '192.168.1.38';

const nextConfig = {
  typescript: {
    // Disable type checking during build (for faster dev)
    ignoreBuildErrors: true,
  },

  // ✅ Your custom config (not used by Next.js)
  customConfig: {
    allowedDevOrigins: [
      `http://${mobileIp}:3000`,
      'http://localhost:3000',
      'https://api.exploreworld.com',
    ],
  },

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

  // ✅ Optional performance improvements
  experimental: {
    turbo: true, // enables Rust-based turbo compilation for dev speed
  },
};

export default nextConfig;
