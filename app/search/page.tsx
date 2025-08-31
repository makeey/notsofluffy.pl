import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageContent from './SearchPageContent';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const categories = Array.isArray(params.category) ? params.category : params.category ? [params.category] : [];
  
  let title = 'Wyszukiwanie | NotSoFluffy';
  let description = 'Wyszukaj produkty w sklepie NotSoFluffy. Znajdź idealne ubranka dla swojego psa.';
  
  if (query) {
    title = `Wyniki wyszukiwania dla "${query}" | NotSoFluffy`;
    description = `Wyniki wyszukiwania dla "${query}" w sklepie NotSoFluffy. ${categories.length > 0 ? `Filtrowane według kategorii: ${categories.join(', ')}.` : ''}`;
  } else if (categories.length > 0) {
    title = `Produkty w kategoriach: ${categories.join(', ')} | NotSoFluffy`;
    description = `Przeglądaj produkty w kategoriach: ${categories.join(', ')} w sklepie NotSoFluffy.`;
  }

  return {
    title,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://notsofluffy.pl/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      siteName: 'NotSoFluffy',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}