/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 360,
  webpack5: true,
  reactStrictMode: false,
  transpilePackages: ['react-hook-mousetrap'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // experimental: {
    // cpus: 1,
    // workerThreads: false
  // }
}

module.exports = nextConfig
