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
      // Research worksheets and the markdown pilot download are artifacts, not
      // pages. The Intelligence Dossier PDF and the HTML worksheets stay indexable.
      {
        source: '/research/:file.json',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/downloads/:file.md',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/desktop-manufacturing', destination: '/ai', permanent: true },
      { source: '/fees/walmart/cell-phones', destination: '/fees/walmart', permanent: true },
      { source: '/solutions/:path*', destination: '/tools', permanent: true },
      { source: '/partners/:path*', destination: '/articles', permanent: true },
      { source: '/community/:path*', destination: '/articles', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
