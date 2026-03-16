import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14b8a6',
}

export const metadata: Metadata = {
  title: 'MarketplaceBeta | The Intelligence Hub for Marketplace Commerce',
  description: 'Breaking news, platform updates, M&A activity, and actionable insights for Amazon sellers, agencies, SaaS providers, and e-commerce operators — all in one place.',
  generator: 'v0.app',
  keywords: ['e-commerce', 'Amazon FBA', 'marketplace sellers', 'e-commerce news', 'seller tools', 'Amazon news'],
  authors: [{ name: 'MarketplaceBeta' }],
  openGraph: {
    title: 'MarketplaceBeta | The Intelligence Hub for Marketplace Commerce',
    description: 'Breaking news, platform updates, and actionable insights for marketplace sellers and e-commerce operators.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarketplaceBeta',
    description: 'The Intelligence Hub for Marketplace Commerce',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-base`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
