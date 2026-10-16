/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // Pretty URL for programmatic sale pages: /fees/amazon/on-a-30-sale
      beforeFiles: [
        { source: '/fees/:marketplace/on-a-:price(\\d+)-sale', destination: '/fees/:marketplace/sale/:price' },
      ],
    }
  },
  async headers() {
    return [
      // Everything except /embed/* refuses third-party framing.
      {
        source: '/((?!embed/).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
      // Embeddable widgets may be framed by any site.
      {
        source: '/embed/:path*',
        headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }],
      },
    ]
  },
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
