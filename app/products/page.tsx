"use client";

import { useState, useEffect, Suspense } from "react";
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

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParams = searchParams.getAll("category");
    const searchParam = searchParams.get("search") || "";
    const pageParam = parseInt(searchParams.get("page") || "1");

    setSelectedCategories(categoryParams);
    setSearchQuery(searchParam);
    setCurrentPage(pageParam);
  }, [searchParams]);

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

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.getPublicProducts({
          page: currentPage,
          limit: productsPerPage,
          search: searchQuery || undefined,
          category:
            selectedCategories.length > 0 ? selectedCategories : undefined,
        });

        setProducts(response.products);
        setTotalPages(Math.ceil(response.total / productsPerPage));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [currentPage, searchQuery, selectedCategories, categories]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    selectedCategories.forEach((cat) => params.append("category", cat));

    const queryString = params.toString();
    const newUrl = `/products${queryString ? `?${queryString}` : ""}`;
    router.replace(newUrl);
  }, [searchQuery, currentPage, selectedCategories, router]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, categoryName];
      } else {
        return prev.filter((cat) => cat !== categoryName);
      }
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ZL`;
  };

  const renderCategoryFilters = () => (
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
  );

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

            {loading && (
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

            {error && (
              <div className="text-center py-12">
                <p className="text-sm text-red-600">Błąd: {error}</p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  Nie znaleziono produktów
                </p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="aspect-[3/4] bg-gray-200 group-hover:opacity-75 relative">
                      {product.main_image && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${product.main_image.path}`}
                          alt={product.name}
                          fill
                          className="object-cover object-center"
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

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Poprzednia
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    ),
                  )}

                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
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
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
