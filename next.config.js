/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 1000,
  ignoreBuildErrors: true,
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
  experimental: {
    optimizePackageImports: [
      'lodash', '@mui/material', '@mui/icons-material', 'store', 'yup', 'next/router', "crypto-js", 
      'primereact/datatable', 'primereact/column', 'store', 'react-number-format', 'moment', 'libphonenumber-js',
      'react-countdown'
    ],
  },
}

module.exports = nextConfig
