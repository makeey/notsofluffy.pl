import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/regulamin',
          '/polityka-prywatnosci',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/zaloguj',
          '/rejestracja',
          '/koszyk',
          '/checkout',
          '/orders',
          '/orders/*',
          '/profil',
          '/coming-soon',
          '/_next/',
          '/uploads/temp/',
          '*.json',
        ],
      },
      // Specific rules for search engines
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/regulamin',
          '/polityka-prywatnosci',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/zaloguj',
          '/rejestracja',
          '/koszyk',
          '/checkout',
          '/orders',
          '/orders/*',
          '/profil',
          '/coming-soon',
        ],
      },
      // Block admin areas for all bots
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/*'],
      },
    ],
    sitemap: 'https://notsofluffy.pl/sitemap.xml',
    host: 'https://notsofluffy.pl',
  }
}