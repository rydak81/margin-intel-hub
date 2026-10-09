/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/solutions/:path*', destination: '/tools', permanent: false },
      { source: '/partners/:path*', destination: '/articles', permanent: false },
      { source: '/community/:path*', destination: '/articles', permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
