/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{
      source: '/api/v1/:path*',
      destination: 'https://soma-bms-production.up.railway.app/api/v1/:path*',
    }]
  },
}
module.exports = nextConfig