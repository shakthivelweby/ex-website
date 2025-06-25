/** @type {import('next').NextConfig} */

const mobileIp = '192.168.1.38';
const nextConfig = {
  allowedDevOrigins: [mobileIp, 'http://localhost:3000'],
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
      }
    ],
  },
};


export default nextConfig;
