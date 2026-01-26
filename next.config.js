/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no experimental flag needed
  
  // Optimize for production
  reactStrictMode: true,
  
  // Ensure Prisma works correctly
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
}

module.exports = nextConfig
