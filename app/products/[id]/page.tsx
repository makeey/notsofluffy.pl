import { Metadata } from 'next';
import { apiClient } from "@/lib/api";
import { ProductPageClient } from './ProductPageClient';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const data = await apiClient.getPublicProduct(productId);
    const product = data.product;

    // Get main image URL
    const mainImageUrl = product.main_image 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${product.main_image.path}`
      : '/images/default-product.jpg';

    // Generate description from short_description and description
    const description = product.short_description || product.description || 
      `${product.name} - wysokiej jakości produkt dostępny w NotSoFluffy.pl. Zamów online z szybką dostawą.`;

    // Get price range from sizes
    const prices = data.sizes.map(size => size.base_price);
    const minPrice = Math.min(...prices);

    return {
      title: `${product.name} | NotSoFluffy`,
      description: description.substring(0, 160), // SEO-friendly length
      keywords: [
        product.name,
        product.category?.name || '',
        product.material?.name || '',
        'sklep online',
        'NotSoFluffy',
        ...product.name.split(' ')
      ].filter(Boolean),
      
      // Open Graph
      openGraph: {
        title: `${product.name} | NotSoFluffy`,
        description,
        type: 'website',
        locale: 'pl_PL',
        url: `https://notsofluffy.pl/products/${productId}`,
        siteName: 'NotSoFluffy',
        images: [
          {
            url: mainImageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
          // Add additional product images
          ...product.images.slice(0, 3).map(img => ({
            url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${img.path}`,
            width: 800,
            height: 800,
            alt: `${product.name} - dodatkowe zdjęcie`,
          }))
        ],
      },
      
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | NotSoFluffy`,
        description: description.substring(0, 200),
        images: [mainImageUrl],
      },
      
      // Additional meta tags
      alternates: {
        canonical: `https://notsofluffy.pl/products/${productId}`,
      },
      
      // Product-specific meta
      other: {
        'product:price:amount': minPrice.toString(),
        'product:price:currency': 'USD',
        'product:availability': data.sizes.some(size => !size.use_stock || size.available_stock > 0) ? 'in stock' : 'out of stock',
        'product:category': product.category?.name || '',
        'product:brand': 'NotSoFluffy',
      },
    };
  } catch {
    // Fallback metadata if product not found
    return {
      title: 'Produkt nie znaleziony | NotSoFluffy',
      description: 'Szukany produkt nie został znaleziony w naszym sklepie.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    // Fetch product data on the server
    const data = await apiClient.getPublicProduct(productId);
    
    // Generate JSON-LD structured data
    const product = data.product;
    const prices = data.sizes.map(size => size.base_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const mainImageUrl = product.main_image 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${product.main_image.path}`
      : '/images/default-product.jpg';

    // Check availability
    const inStock = data.sizes.some(size => !size.use_stock || size.available_stock > 0);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.short_description,
      image: [
        mainImageUrl,
        ...product.images.map(img => 
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${img.path}`
        )
      ],
      brand: {
        '@type': 'Brand',
        name: 'NotSoFluffy'
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'NotSoFluffy'
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: minPrice,
        highPrice: maxPrice,
        availability: inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'NotSoFluffy',
          url: 'https://notsofluffy.pl'
        },
        url: `https://notsofluffy.pl/products/${productId}`
      },
      category: product.category?.name,
      material: product.material?.name,
      productID: product.id.toString(),
      sku: `NSF-${product.id}`,
      gtin: `NotSoFluffy-${product.id}`,
    };

    // Add breadcrumb structured data
    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Główna',
          item: 'https://notsofluffy.pl'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Produkty',
          item: 'https://notsofluffy.pl/products'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: `https://notsofluffy.pl/products/${productId}`
        }
      ]
    };

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
        
        {/* Client Component for Interactive Features */}
        <ProductPageClient initialData={data} />
      </>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  try {
    // You can implement this to pre-generate popular products
    // For now, we'll let Next.js generate them on-demand
    return [];
  } catch {
    return [];
  }
}