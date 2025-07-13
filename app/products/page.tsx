"use client";

import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient, ProductResponse, Category } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

function ProductsContent() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const filteringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryFiltersOpen, setCategoryFiltersOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const productsPerPage = 12;
  const isInitialLoad = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingURL = useRef(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getPublicCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Read URL params and sync with state (only on navigation, not our own URL updates)
  useEffect(() => {
    // Skip if we're updating the URL ourselves
    if (isUpdatingURL.current) {
      return;
    }

    const categoryParams = searchParams.getAll("category");
    const searchParam = searchParams.get("search") || "";
    const pageParam = parseInt(searchParams.get("page") || "1");

    // Check if URL params differ from current state
    const categoryParamsDiffer = JSON.stringify(categoryParams.sort()) !== JSON.stringify(selectedCategories.sort());
    const searchParamDiffer = searchParam !== searchQuery;
    const pageParamDiffer = pageParam !== currentPage;

    // Only update state if URL params actually differ
    if (categoryParamsDiffer || searchParamDiffer || pageParamDiffer) {
      setSelectedCategories(categoryParams);
      setSearchQuery(searchParam);
      setCurrentPage(pageParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams to prevent feedback loops

  // Fetch products when state changes
  useEffect(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Only proceed if categories are loaded
    if (categories.length === 0) {
      return;
    }

    // Function to fetch products with current state
    const fetchProducts = async (signal: AbortSignal) => {
      try {
        // Show different loading states for initial load vs filtering
        if (isInitialLoadRef.current) {
          setLoading(true);
          isInitialLoadRef.current = false;
        } else {
          // Clear any existing filtering timeout
          if (filteringTimeoutRef.current) {
            clearTimeout(filteringTimeoutRef.current);
          }
          setIsFiltering(true);
        }
        setError(null);

        const response = await apiClient.getPublicProducts({
          page: currentPage,
          limit: productsPerPage,
          search: searchQuery || undefined,
          category:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        });

        // Check if request was aborted
        if (signal.aborted) {
          return;
        }

        setProducts(response.products);
        setTotalPages(Math.ceil(response.total / productsPerPage));
      } catch (error) {
        // Don't show error if request was aborted
        if (signal.aborted) {
          return;
        }
        console.error("Failed to fetch products:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
        // Delay hiding the filtering state to prevent flickering
        if (filteringTimeoutRef.current) {
          clearTimeout(filteringTimeoutRef.current);
        }
        filteringTimeoutRef.current = setTimeout(() => {
          setIsFiltering(false);
        }, 100);
      }
    };

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Fetch immediately if it's the first load, otherwise debounce
    const delay = isInitialLoadRef.current ? 0 : 150;
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchProducts(abortControllerRef.current!.signal);
    }, delay);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [categories, currentPage, searchQuery, selectedCategories, productsPerPage]);

  // Update URL when filters change (immediate, no debounce needed since main effect handles debouncing)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    selectedCategories.forEach((cat) => params.append("category", cat));

    const queryString = params.toString();
    const newUrl = `/products${queryString ? `?${queryString}` : ""}`;
    
    // Set flag to indicate we're updating the URL
    isUpdatingURL.current = true;
    
    // Use shallow routing to prevent full page re-renders
    router.push(newUrl, { scroll: false });
    
    // Reset flag after a short delay to allow the URL change to propagate
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 50);
  }, [searchQuery, currentPage, selectedCategories, router]);

  const handleCategoryChange = useCallback((categoryName: string, checked: boolean) => {
    // Batch state updates to prevent multiple effect triggers
    setSelectedCategories((prev) => {
      const newCategories = checked 
        ? [...prev, categoryName]
        : prev.filter((cat) => cat !== categoryName);
      return newCategories;
    });
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const formatPrice = useCallback((price: number) => {
    return `${price.toFixed(2)} ZL`;
  }, []);

  // Memoize pagination buttons to prevent unnecessary re-renders
  const paginationButtons = useMemo(() => {
    if (totalPages <= 1) return null;
    
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-2 text-sm font-medium rounded-md ${
          page === currentPage
            ? "bg-indigo-600 text-white"
            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
        }`}
      >
        {page}
      </button>
    ));
  }, [totalPages, currentPage]);

  // Handlers for pagination with scroll preservation
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage]);

  const renderCategoryFilters = useCallback(() => (
    <div className="border-t border-gray-200 pb-4 pt-4">
      <fieldset>
        <legend className="w-full px-2">
          <button
            type="button"
            onClick={() => setCategoryFiltersOpen(!categoryFiltersOpen)}
            className="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500"
            aria-expanded={categoryFiltersOpen}
          >
            <span className="text-sm font-medium text-gray-900">Kategorie</span>
            <span className="ml-6 flex h-7 items-center">
              <ChevronDownIcon
                className={`h-5 w-5 transform ${categoryFiltersOpen ? "-rotate-180" : "rotate-0"}`}
                aria-hidden="true"
              />
            </span>
          </button>
        </legend>
        {categoryFiltersOpen && (
          <div className="px-4 pb-2 pt-4">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <input
                    id={`category-${category.id}`}
                    name="category[]"
                    value={category.name}
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={(e) =>
                      handleCategoryChange(category.name, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="ml-3 text-sm text-gray-500"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>
    </div>
  ), [categories, categoryFiltersOpen, selectedCategories, handleCategoryChange]);

  return (
    <div className="bg-white">
      <Header />

      {/* Mobile filter dialog */}
      {mobileFiltersOpen && (
        <div
          className="relative z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filtry</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="relative -mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Zamknij menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <form className="mt-4">{renderCategoryFilters()}</form>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
        <div className="border-b border-gray-200 pb-10 pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Not so fluffy
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Ubranka dla psów - ciepłe, wygodne i stylowe
          </p>
        </div>

        <div className="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          {/* Desktop filters */}
          <aside>
            <h2 className="sr-only">Filtry</h2>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center lg:hidden"
            >
              <span className="text-sm font-medium text-gray-700">Filtry</span>
              <PlusIcon
                className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </button>

            {/* Desktop filters */}
            <div className="hidden lg:block">
              <form className="space-y-10 divide-y divide-gray-200">
                {renderCategoryFilters()}
              </form>
            </div>
          </aside>

          {/* Product grid */}
          <section
            aria-labelledby="product-heading"
            className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
          >
            <h2 id="product-heading" className="sr-only">
              Produkty
            </h2>
            

            {/* Products grid with smooth loading overlay */}
            <div className="relative">
              {/* Loading overlay - only during filtering, not initial load */}
              {isFiltering && products.length > 0 && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-start justify-center pt-6 transition-all duration-200">
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-2 text-xs text-gray-600 bg-white/90 rounded-full shadow-sm border border-gray-200">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Filtrowanie...
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-sm text-red-600">Błąd: {error}</p>
                </div>
              )}
              
              {/* Empty state */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    Nie znaleziono produktów
                  </p>
                </div>
              )}
              
              {/* Products grid - always rendered when products exist */}
              {products.length > 0 && (
                <div 
                  className={`grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3 transition-opacity duration-300 ${
                    isFiltering ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-md"
                      style={{
                        animation: `fadeInUp 400ms ease-out ${index * 30}ms forwards`
                      }}
                    >
                      <div className="aspect-[3/4] bg-gray-200 group-hover:opacity-75 relative">
                        {product.main_image && (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${product.main_image.path}`}
                            alt={product.name}
                            fill
                            className="object-cover object-center transition-opacity duration-200"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col space-y-2 p-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link href={`/products/${product.id}`}>
                            <span
                              aria-hidden="true"
                              className="absolute inset-0"
                            />
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.short_description}
                        </p>
                        <div className="flex flex-1 flex-col justify-end">
                          <p className="text-base font-medium text-gray-900">
                            {product.min_price
                              ? formatPrice(product.min_price)
                              : "Cena na żądanie"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Initial loading skeleton - only shown when no products exist yet */}
              {loading && products.length === 0 && (
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                    >
                      <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                      <div className="flex flex-1 flex-col space-y-2 p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={handlePreviousPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Poprzednia
                    </button>
                  )}

                  {paginationButtons}

                  {currentPage < totalPages && (
                    <button
                      onClick={handleNextPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Następna
                    </button>
                  )}
                </nav>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
