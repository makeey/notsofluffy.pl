"use client";

import { useEffect, useState } from "react";
import { CheckIcon, TruckIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type OrderResponse } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Polish status translations
const getStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "Oczekujące";
    case "processing":
      return "W realizacji";
    case "shipped":
      return "Wysłane";
    case "delivered":
      return "Dostarczone";
    case "cancelled":
      return "Anulowane";
    default:
      return status;
  }
};

// Status icon component
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "delivered":
      return <CheckIcon aria-hidden="true" className="size-6 flex-none text-green-500" />;
    case "shipped":
      return <TruckIcon aria-hidden="true" className="size-6 flex-none text-blue-500" />;
    case "processing":
      return <ClockIcon aria-hidden="true" className="size-6 flex-none text-orange-500" />;
    case "cancelled":
      return <XMarkIcon aria-hidden="true" className="size-6 flex-none text-red-500" />;
    default:
      return <ClockIcon aria-hidden="true" className="size-6 flex-none text-gray-500" />;
  }
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // Fetch orders if user is authenticated
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserOrders();
      setOrders(response.orders || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  if (authLoading || loading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Ładowanie zamówień...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Błąd</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header />
      <div className="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Historia zamówień
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sprawdź status swoich zamówień i przeglądaj szczegóły zakupów.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mt-16 text-center">
            <h2 className="text-lg font-medium text-gray-900">Brak zamówień</h2>
            <p className="mt-2 text-sm text-gray-500">
              Nie masz jeszcze żadnych zamówień. Rozpocznij zakupy w naszym sklepie!
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Przejdź do sklepu
            </Link>
          </div>
        ) : (
          <div className="mt-16">
            <h2 className="sr-only">Ostatnie zamówienia</h2>

            <div className="space-y-16 sm:space-y-24">
              {orders.map((order) => (
                <div key={order.id}>
                  <h3 className="sr-only">
                    Zamówienie złożone{" "}
                    <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
                  </h3>

                  <div className="bg-gray-50 px-4 py-6 sm:rounded-lg sm:p-6 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8">
                    <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 md:grid md:grid-cols-4 md:gap-x-6 md:divide-y-0 lg:w-2/3 lg:flex-none lg:gap-x-8">
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-gray-900">Numer zamówienia</dt>
                        <dd className="md:mt-1">#{order.id}</dd>
                      </div>
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-gray-900">Data złożenia</dt>
                        <dd className="md:mt-1">
                          <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
                        </dd>
                      </div>
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-gray-900">Łączna kwota</dt>
                        <dd className="md:mt-1">
                          {order.discount_amount > 0 ? (
                            <div className="text-right">
                              <div className="text-sm text-gray-500 line-through">
                                {order.subtotal.toFixed(2)} zł
                              </div>
                              <div className="font-medium text-gray-900">
                                {order.total_amount.toFixed(2)} zł
                              </div>
                              <div className="text-xs text-green-600">
                                Oszczędności: {order.discount_amount.toFixed(2)} zł
                              </div>
                            </div>
                          ) : (
                            <div className="font-medium text-gray-900">
                              {order.total_amount.toFixed(2)} zł
                            </div>
                          )}
                        </dd>
                      </div>
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-gray-900">Faktura</dt>
                        <dd className="md:mt-1">
                          {order.requires_invoice ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Wymagana
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">Nie</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-6 space-y-4 sm:flex sm:space-y-0 sm:space-x-4 md:mt-0">
                      <Link
                        href={`/order/${order.id}`}
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden md:w-auto"
                      >
                        Zobacz zamówienie
                        <span className="sr-only">#{order.id}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
                    <div className="-my-6 divide-y divide-gray-200 sm:-my-10">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex py-6 sm:py-10">
                          <div className="min-w-0 flex-1 lg:flex lg:flex-col">
                            <div className="lg:flex-1">
                              <div className="sm:flex sm:justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item.product_name}
                                  </h4>
                                  <div className="mt-2 hidden sm:block space-y-1">
                                    {item.variant_name && (
                                      <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">Wariant:</span> {item.variant_name}
                                      </div>
                                    )}
                                    {item.variant_color_name && (
                                      <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">Kolor:</span> {item.variant_color_name}
                                      </div>
                                    )}
                                    {item.size_name && (
                                      <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">Rozmiar:</span> {item.size_name}
                                      </div>
                                    )}
                                    {item.size_dimensions && (
                                      <div className="text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">Wymiary:</span>
                                        <div className="mt-1 grid grid-cols-3 gap-x-4 gap-y-1 ml-2">
                                          {Object.entries(item.size_dimensions).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                              <span className="font-medium">{key.toUpperCase()}:</span> {value}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {item.services && item.services.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-900">Dodatkowe usługi:</p>
                                      {item.services.map((service) => (
                                        <p key={service.id} className="text-sm text-gray-500">
                                          • {service.service_name} (+{service.service_price.toFixed(2)} zł)
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1 sm:mt-0 sm:ml-6 text-right">
                                  <p className="font-medium text-gray-900">
                                    {item.quantity}x {item.unit_price.toFixed(2)} zł
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between items-center text-sm font-medium sm:mt-4">
                                <Link
                                  href={`/products/${item.product_id}`}
                                  className="text-indigo-600 hover:text-indigo-500"
                                >
                                  Zobacz produkt
                                </Link>
                                <p className="text-lg font-semibold text-gray-900">
                                  Razem: {item.total_price.toFixed(2)} zł
                                </p>
                              </div>
                            </div>
                            <div className="mt-6 font-medium">
                              <div className="flex space-x-2">
                                <StatusIcon status={order.status} />
                                <p className="text-gray-900">
                                  {getStatusText(order.status)}
                                  <span className="hidden sm:inline text-gray-600">
                                    {" "}
                                    z dnia{" "}
                                    <time dateTime={order.updated_at}>
                                      {formatDate(order.updated_at)}
                                    </time>
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                            <div className="col-start-2 col-end-3 size-24 rounded-lg bg-gray-100 sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:size-48 lg:size-64 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl text-gray-400">📦</div>
                                <p className="text-xs text-gray-500 mt-1">Zdjęcie produktu</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}