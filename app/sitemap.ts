import { MetadataRoute } from 'next'
import { apiClient } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notsofluffy.pl'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/zaloguj`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/rejestracja`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/koszyk`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/regulamin`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/polityka-prywatnosci`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  
  try {
    // Fetch all products for sitemap
    // Note: You might want to create a dedicated API endpoint for this
    // that returns just the necessary data (id, updated_at) for better performance
    const products = await apiClient.getPublicProducts({ page: 1, limit: 1000 })
    
    productPages = products.products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    // If there's an error fetching products, continue with static pages only
  }

  // Category pages (if you have them)
  let categoryPages: MetadataRoute.Sitemap = []
  
  try {
    const categoriesResponse = await apiClient.getPublicCategories()
    
    categoryPages = categoriesResponse.categories.map((category) => ({
      url: `${baseUrl}/products?category=${encodeURIComponent(category.name.toLowerCase())}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    // If there's an error fetching categories, continue without them
  }

  return [...staticPages, ...productPages, ...categoryPages]
}