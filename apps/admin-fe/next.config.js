/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@table-order/shared-types'],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
