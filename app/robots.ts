import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/preview/'],
      },
    ],
    sitemap: 'https://marketplacebeta.com/sitemap.xml',
  }
}
