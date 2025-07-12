"use client";
import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api";
import { Category } from "@/lib/api";

// Transform API categories to navigation structure
const transformCategoriesToNavigation = (categories: Category[]) => {
  const chartyCategories = categories.filter((cat) => cat.chart_only);
  const innyCategories = categories.filter((cat) => !cat.chart_only);

  const transformToFeatured = (cats: Category[]) =>
    cats.map((cat) => ({
      name: cat.name,
      href: `/products?category=${cat.slug}`,
      imageSrc: cat.image
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${cat.image.path}`
        : "",
      imageAlt: cat.name,
    }));

  return {
    categories: [
      {
        name: "Charty",
        featured: transformToFeatured(chartyCategories),
      },
      {
        name: "Inny rasy",
        featured: transformToFeatured(innyCategories),
      },
    ],
    pages: [],
  };
};
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [navigation, setNavigation] = useState<{
    categories: {
      name: string;
      featured: {
        name: string;
        href: string;
        imageSrc: string;
        imageAlt: string;
      }[];
    }[];
    pages: never[];
  }>({
    categories: [],
    pages: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPublicCategories();
        setNavigation(transformCategoriesToNavigation(response.categories));
        setError(null);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load categories",
        );
        // Fallback to empty navigation
        setNavigation({
          categories: [
            { name: "Charty", featured: [] },
            { name: "Inny rasy", featured: [] },
          ],
          pages: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel
                    key={category.name}
                    className="space-y-12 px-4 py-6"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                      {loading && (
                        <div className="col-span-2 p-4 text-center text-sm text-gray-600">
                          Ładowanie kategorii...
                        </div>
                      )}
                      {error && (
                        <div className="col-span-2 p-4 text-center text-sm text-red-600">
                          Błąd: {error}
                        </div>
                      )}
                      {!loading && !error && category.featured.length === 0 && (
                        <div className="col-span-2 p-4 text-center text-sm text-gray-600">
                          Brak dostępnych kategorii
                        </div>
                      )}
                      {!loading &&
                        category.featured.map((item) => (
                          <div key={item.name} className="group relative">
                            <img
                              alt={item.imageAlt}
                              src={item.imageSrc}
                              className="aspect-square w-full rounded-md bg-gray-100 object-cover group-hover:opacity-75"
                            />
                            <Link
                              href={item.href}
                              className="mt-6 block text-sm font-medium text-gray-900"
                            >
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 z-10"
                              />
                              {item.name}
                            </Link>
                            <p
                              aria-hidden="true"
                              className="mt-1 text-sm text-gray-500"
                            >
                              Zaprasamy do zakupu
                            </p>
                          </div>
                        ))}
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {/* Orders link for authenticated users */}
              {user && (
                <Link
                  href="/orders"
                  className="text-base font-medium text-gray-900 hover:text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Moje zamówienia
                </Link>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <div className="relative bg-gray-900">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <img alt="" src="/images/bg.jpg" className="size-full object-cover" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900 opacity-50"
        />
        {/* Navigation */}
        <header className="relative z-10">
          <nav aria-label="Top">
            {/* Secondary navigation */}
            <div className="bg-white/10 backdrop-blur-md backdrop-filter">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div>
                  <div className="flex h-16 items-center justify-between">
                    {/* Logo (lg+) */}
                    <div className="hidden lg:flex lg:flex-1 lg:items-center">
                      <Link href="/">
                        <span className="sr-only">Not so fluffy</span>
                        <img
                          alt=""
                          src="/images/logo2.svg"
                          className="h-8 w-auto"
                        />
                      </Link>
                    </div>

                    <div className="hidden h-full lg:flex">
                      {/* Flyout menus */}
                      <PopoverGroup className="inset-x-0 bottom-0 px-4">
                        <div className="flex h-full justify-center space-x-8">
                          {navigation.categories.map((category) => (
                            <Popover key={category.name} className="flex">
                              <div className="relative flex">
                                <PopoverButton className="group relative flex items-center justify-center text-sm font-medium text-white transition-colors duration-200 ease-out">
                                  {category.name}
                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-white"
                                  />
                                </PopoverButton>
                              </div>
                              <PopoverPanel
                                transition
                                className="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                              >
                                {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                <div
                                  aria-hidden="true"
                                  className="absolute inset-0 top-1/2 bg-white shadow-sm"
                                />
                                <div className="relative bg-white">
                                  <div className="mx-auto max-w-7xl px-8">
                                    <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                      {loading && (
                                        <div className="col-span-4 p-4 text-center text-sm text-gray-600">
                                          Ładowanie kategorii...
                                        </div>
                                      )}
                                      {error && (
                                        <div className="col-span-4 p-4 text-center text-sm text-red-600">
                                          Błąd: {error}
                                        </div>
                                      )}
                                      {!loading &&
                                        !error &&
                                        category.featured.length === 0 && (
                                          <div className="col-span-4 p-4 text-center text-sm text-gray-600">
                                            Brak dostępnych kategorii
                                          </div>
                                        )}
                                      {!loading &&
                                        category.featured.map((item) => (
                                          <div
                                            key={item.name}
                                            className="group relative"
                                          >
                                            <img
                                              alt={item.imageAlt}
                                              src={item.imageSrc}
                                              className="aspect-square w-full rounded-md bg-gray-100 object-cover group-hover:opacity-75"
                                            />
                                            <Link
                                              href={item.href}
                                              className="mt-4 block font-medium text-gray-900"
                                            >
                                              <span
                                                aria-hidden="true"
                                                className="absolute inset-0 z-10"
                                              />
                                              {item.name}
                                            </Link>
                                            <p
                                              aria-hidden="true"
                                              className="mt-1 text-gray-500"
                                            >
                                              Zaprasamy do zakupu
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </PopoverPanel>
                            </Popover>
                          ))}
                        </div>
                      </PopoverGroup>
                    </div>

                    {/* Mobile menu and search (lg-) */}
                    <div className="flex flex-1 items-center lg:hidden">
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="-ml-2 p-2 text-white"
                      >
                        <span className="sr-only">Open menu</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                      </button>

                      {/* Search */}
                      <Link href="/search" className="ml-2 p-2 text-white">
                        <span className="sr-only">Wyszukaj</span>
                        <MagnifyingGlassIcon
                          aria-hidden="true"
                          className="size-6"
                        />
                      </Link>
                    </div>

                    {/* Logo (lg-) */}
                    <Link href="/" className="lg:hidden">
                      <span className="sr-only">Not so fluffy</span>
                      <img
                        alt=""
                        src="/images/logo2.svg"
                        className="h-8 w-auto"
                      />
                    </Link>

                    <div className="flex flex-1 items-center justify-end">
                      <Link
                        href="/search"
                        className="hidden text-sm font-medium text-white lg:block"
                      >
                        Wyszukaj
                      </Link>

                      {/* Orders link for authenticated users */}
                      {user && (
                        <Link
                          href="/orders"
                          className="hidden text-sm font-medium text-white lg:block lg:ml-8"
                        >
                          Moje zamówienia
                        </Link>
                      )}

                      <div className="flex items-center lg:ml-8">
                        {/* Help */}
                        <Link href="/kontakt" className="p-2 text-white lg:hidden">
                          <span className="sr-only">Pomoc</span>
                          <QuestionMarkCircleIcon
                            aria-hidden="true"
                            className="size-6"
                          />
                        </Link>
                        <Link
                          href="/kontakt"
                          className="hidden text-sm font-medium text-white lg:block"
                        >
                          Pomoc
                        </Link>

                        {/* Cart */}
                        <div className="ml-4 flow-root lg:ml-8">
                          <Link
                            href="/koszyk"
                            className="group -m-2 flex items-center p-2"
                          >
                            <ShoppingBagIcon
                              aria-hidden="true"
                              className="size-6 shrink-0 text-white"
                            />
                            <span className="ml-2 text-sm font-medium text-white">
                              {cartCount}
                            </span>
                            <span className="sr-only">
                              produkty w koszyku, pokaż koszyk
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center sm:py-64 lg:px-0">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">
            Not so fluffy
          </h1>
          <p className="mt-4 text-2xl text-white">
            Pewnie już jesteś przygotowany na zimę...
            <br /> A twój pies?
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </>
  );
}
