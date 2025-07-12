'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchInput } from '@/components/SearchInput';
import { apiClient, ProductResponse, Category, SearchResponse } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name A-Z' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getPublicCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load search results when params change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const categories = searchParams.getAll('category');
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');

    setSearchQuery(query);
    setSelectedCategories(categories);
    setSortBy(sort);
    setCurrentPage(page);

    if (query || categories.length > 0) {
      performSearch(query, categories, sort, page);
    } else {
      // Show popular products when no search query
      performSearch('', [], sort, page);
    }
  }, [searchParams]);

  // Perform search
  const performSearch = useCallback(async (
    query: string,
    categories: string[],
    sort: string,
    page: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.searchProducts({
        q: query,
        category: categories,
        sort: sort as any,
        page,
        limit: 12,
      });
      setSearchResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL with search parameters
  const updateURL = (query: string, categories: string[], sort: string, page: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (categories.length > 0) {
      categories.forEach(cat => params.append('category', cat));
    }
    if (sort !== 'relevance') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle category filter change
  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categorySlug]
      : selectedCategories.filter(cat => cat !== categorySlug);
    setSelectedCategories(newCategories);
    updateURL(searchQuery, newCategories, sortBy, 1);
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL(searchQuery, selectedCategories, newSort, 1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL(searchQuery, selectedCategories, sortBy, newPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy('relevance');
    updateURL(searchQuery, [], 'relevance', 1);
  };

  return (
    <div className="bg-white">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Search Header */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Search</h1>
            
            {/* Search Form */}
            <div className="mt-6">
              <SearchInput
                initialValue={searchQuery}
                onSearch={(query) => updateURL(query, selectedCategories, sortBy, 1)}
                redirectOnSubmit={false}
                size="md"
                className="mb-4"
              />
            </div>
          </div>

          {/* Results Header */}
          {searchResults && (
            <div className="flex items-center justify-between border-b border-gray-200 pt-6 pb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-medium text-gray-900">
                  {searchResults.total} {searchResults.total === 1 ? 'result' : 'results'}
                  {searchQuery && ` for "${searchQuery}"`}
                </h2>
                
                {/* Clear Filters */}
                {(selectedCategories.length > 0 || sortBy !== 'relevance') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center lg:hidden"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
            {/* Filters Sidebar */}
            <div className="hidden lg:block">
              <div className="py-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={`category-${category.id}`}
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-600">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => performSearch(searchQuery, selectedCategories, sortBy, currentPage)}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Try again
                  </button>
                </div>
              )}

              {searchResults && !loading && (
                <>
                  {searchResults.products.length === 0 ? (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchResults.suggestion || "Try different keywords or browse our categories"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Products Grid */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 py-6">
                        {searchResults.products.map((product) => (
                          <div key={product.id} className="group relative">
                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
                              {product.main_image ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${product.main_image.path}`}
                                  alt={product.name}
                                  width={400}
                                  height={400}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                  <div className="text-center">
                                    <div className="text-4xl text-gray-400 mb-2">📦</div>
                                    <p className="text-sm text-gray-500">No image</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex justify-between">
                              <div>
                                <h3 className="text-sm text-gray-700">
                                  <Link href={`/products/${product.id}`}>
                                    <span aria-hidden="true" className="absolute inset-0" />
                                    {product.name}
                                  </Link>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">{product.short_description}</p>
                                {product.category && (
                                  <p className="mt-1 text-xs text-indigo-600">{product.category.name}</p>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.min_price ? `from ${product.min_price.toFixed(2)} zł` : 'Price on request'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {searchResults.total > 12 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                          <div className="flex flex-1 justify-between sm:hidden">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage <= 1}
                              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= Math.ceil(searchResults.total / 12)}
                              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                          
                          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">{(currentPage - 1) * 12 + 1}</span>
                                {' '}to{' '}
                                <span className="font-medium">
                                  {Math.min(currentPage * 12, searchResults.total)}
                                </span>
                                {' '}of{' '}
                                <span className="font-medium">{searchResults.total}</span>
                                {' '}results
                              </p>
                            </div>
                            <div>
                              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  disabled={currentPage <= 1}
                                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                  Previous
                                </button>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, Math.ceil(searchResults.total / 12)) }, (_, i) => {
                                  const pageNum = i + 1;
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => handlePageChange(pageNum)}
                                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        pageNum === currentPage
                                          ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                                
                                <button
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={currentPage >= Math.ceil(searchResults.total / 12)}
                                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </nav>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}