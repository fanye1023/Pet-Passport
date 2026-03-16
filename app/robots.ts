import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.petsharelink.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/pets/', '/settings/', '/onboarding/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
