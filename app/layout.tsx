import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'Ecom Intel Hub | The Intelligence Hub for Marketplace Commerce',
  description: 'Breaking news, platform updates, M&A activity, and actionable insights for Amazon sellers, agencies, SaaS providers, and e-commerce operators — all in one place.',
  generator: 'v0.app',
  keywords: ['e-commerce', 'Amazon FBA', 'marketplace sellers', 'e-commerce news', 'seller tools', 'Amazon news'],
  authors: [{ name: 'Ecom Intel Hub' }],
  openGraph: {
    title: 'Ecom Intel Hub | The Intelligence Hub for Marketplace Commerce',
    description: 'Breaking news, platform updates, and actionable insights for marketplace sellers and e-commerce operators.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecom Intel Hub',
    description: 'The Intelligence Hub for Marketplace Commerce',
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#14b8a6',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geistSans.variable} ${_geistMono.variable} font-sans antialiased text-base`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
