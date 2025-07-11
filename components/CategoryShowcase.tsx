"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient, Category } from "@/lib/api";

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPublicCategories();
        setCategories(response.categories);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories",
        );
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section
        aria-labelledby="category-heading"
        className="pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8"
      >
        <div className="px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-md w-48 mb-4"></div>
            <div className="flex space-x-4 overflow-x-auto">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-56 h-80 bg-gray-300 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-labelledby="category-heading"
        className="pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8"
      >
        <div className="px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading categories: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="category-heading"
      className="pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8"
    >
      <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
        <h2
          id="category-heading"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          Kategorie
        </h2>
        <Link
          href="/products"
          className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
        >
          Przeglądaj wszystkie kategorie
          <span aria-hidden="true"> →</span>
        </Link>
      </div>

      <div className="mt-4 flow-root">
        <div className="-my-2">
          <div className="relative box-content h-80 overflow-x-auto py-2 xl:overflow-visible">
            <div className="absolute flex space-x-8 px-4 sm:px-6 lg:px-8 xl:relative xl:grid xl:grid-cols-5 xl:gap-x-8 xl:space-x-0 xl:px-0">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                >
                  <span aria-hidden="true" className="absolute inset-0">
                    {category.image && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${category.image.path}`}
                        alt={category.name}
                        className="h-full w-full object-cover object-center"
                      />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                  ></span>
                  <span className="relative mt-auto text-center text-xl font-bold text-white">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 sm:hidden">
        <Link
          href="/products"
          className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Przeglądaj wszystkie kategorie
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </section>
  );
}
