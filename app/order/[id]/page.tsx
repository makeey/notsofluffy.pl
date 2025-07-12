"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckIcon, TruckIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type OrderResponse } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

export default function OrderPage() {
  const { user } = useAuth();
  const params = useParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract order ID or hash from params
  const orderIdentifier = params.id as string;
  const isHash = orderIdentifier && orderIdentifier.length > 10; // Hashes are longer than regular IDs

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: OrderResponse;
      
      if (isHash) {
        // Use hash endpoint for guest orders
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/hash/${orderIdentifier}`)
          .then(res => {
            if (!res.ok) {
              throw new Error('Order not found');
            }
            return res.json();
          });
      } else {
        // Use regular order endpoint with authentication
        response = await apiClient.getOrder(parseInt(orderIdentifier));
      }
      
      setOrder(response);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }, [orderIdentifier, isHash]);

  useEffect(() => {
    if (orderIdentifier) {
      fetchOrder();
    }
  }, [orderIdentifier, fetchOrder]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date and time for display
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Ładowanie zamówienia...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Błąd</h1>
            <p className="text-gray-600">{error || "Zamówienie nie zostało znalezione"}</p>
            <div className="mt-6 space-x-4">
              <button
                onClick={fetchOrder}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Spróbuj ponownie
              </button>
              <Link
                href="/orders"
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Powrót do zamówień
              </Link>
            </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Zamówienie #{order.id}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Złożone dnia {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex space-x-2">
              <StatusIcon status={order.status} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {getStatusText(order.status)}
                </p>
                <p className="text-xs text-gray-500">
                  Zaktualizowane {formatDateTime(order.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {/* Order Summary */}
          <div className="bg-gray-50 px-6 py-6 sm:rounded-lg sm:p-8 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8">
            <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 md:grid md:grid-cols-3 md:gap-x-8 md:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-10">
              <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                <dt className="font-medium text-gray-900">Email</dt>
                <dd className="md:mt-1 text-gray-700">{order.email}</dd>
              </div>
              <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                <dt className="font-medium text-gray-900">Telefon</dt>
                <dd className="md:mt-1 text-gray-700">{order.phone}</dd>
              </div>
              <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                <dt className="font-medium text-gray-900">Łączna kwota</dt>
                <dd className="font-medium text-gray-900 md:mt-1">
                  {order.total_amount.toFixed(2)} zł
                </dd>
              </div>
            </dl>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Zamówione produkty</h2>
            <div className="flow-root">
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
                            {item.product_description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {item.product_description}
                              </p>
                            )}
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
                    </div>
                    <div className="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                      <div className="col-start-2 col-end-3 size-24 rounded-lg bg-gray-100 sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:size-48 lg:size-64 flex items-center justify-center overflow-hidden">
                        {item.main_image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${item.main_image.path}`}
                            alt={item.product_name}
                            width={256}
                            height={256}
                            className="size-full object-cover object-center"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-2xl text-gray-400">📦</div>
                            <p className="text-xs text-gray-500 mt-1">Brak zdjęcia</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Shipping Address */}
            {order.shipping_address && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adres dostawy</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  {order.shipping_address.company && (
                    <p className="text-sm text-gray-600">{order.shipping_address.company}</p>
                  )}
                  <p className="text-sm text-gray-600">{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p className="text-sm text-gray-600">{order.shipping_address.address_line2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {order.shipping_address.postal_code} {order.shipping_address.city}
                  </p>
                  <p className="text-sm text-gray-600">{order.shipping_address.country}</p>
                  <p className="text-sm text-gray-600 mt-2">Tel: {order.shipping_address.phone}</p>
                </div>
              </div>
            )}

            {/* Billing Address */}
            {order.billing_address && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adres rozliczeniowy</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {order.billing_address.same_as_shipping ? (
                    <p className="text-sm text-gray-600 italic">Taki sam jak adres dostawy</p>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900">
                        {order.billing_address.first_name} {order.billing_address.last_name}
                      </p>
                      {order.billing_address.company && (
                        <p className="text-sm text-gray-600">{order.billing_address.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{order.billing_address.address_line1}</p>
                      {order.billing_address.address_line2 && (
                        <p className="text-sm text-gray-600">{order.billing_address.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {order.billing_address.postal_code} {order.billing_address.city}
                      </p>
                      <p className="text-sm text-gray-600">{order.billing_address.country}</p>
                      <p className="text-sm text-gray-600 mt-2">Tel: {order.billing_address.phone}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Podsumowanie zamówienia</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-700">Wartość produktów</dt>
                  <dd className="text-gray-900 font-medium">{order.subtotal.toFixed(2)} zł</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-700">Dostawa</dt>
                  <dd className="text-gray-900 font-medium">{order.shipping_cost.toFixed(2)} zł</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-700">Podatek</dt>
                  <dd className="text-gray-900 font-medium">{order.tax_amount.toFixed(2)} zł</dd>
                </div>
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-gray-300">
                  <dt className="text-gray-900">Łącznie</dt>
                  <dd className="text-gray-900">{order.total_amount.toFixed(2)} zł</dd>
                </div>
              </dl>
              
              {order.payment_method && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Metoda płatności:</span> {order.payment_method}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium text-gray-900">Status płatności:</span> {order.payment_status}
                  </p>
                </div>
              )}
              
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Uwagi:</span> {order.notes}
                  </p>
                </div>
              )}
              
              {/* Invoice Information */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Faktura:</span>
                  </p>
                  <div className="text-right">
                    {order.requires_invoice ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Wymagana
                        </span>
                        {order.nip && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium text-gray-900">NIP:</span> {order.nip}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nie wymagana</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            {user ? (
              <Link
                href="/orders"
                className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
              >
                Powrót do zamówień
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
              >
                Powrót do strony głównej
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}