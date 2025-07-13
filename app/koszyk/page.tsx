"use client";

import { useState } from "react";
import {
  CheckIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, applyDiscount, removeDiscount, discountLoading, discountError } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [discountCode, setDiscountCode] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleApplyDiscount = async () => {
    setDiscountSuccess(null);
    try {
      const response = await applyDiscount(discountCode);
      setDiscountSuccess(response.message);
      setDiscountCode(""); // Clear input on success
    } catch (err) {
      // Error is handled by the context
      console.error('Failed to apply/remove discount:', err);
    }
  };

  const handleRemoveDiscount = async () => {
    setDiscountSuccess(null);
    try {
      await removeDiscount();
      setDiscountSuccess("Discount removed successfully");
    } catch (err) {
      // Error is handled by the context
      console.error('Failed to apply/remove discount:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex py-6">
                  <div className="size-24 bg-gray-200 rounded-md sm:size-48"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
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
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Error
            </h1>
            <p className="mt-4 text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const safeItems = cart?.items || [];

  return (
    <div className="bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>

        {isEmpty ? (
          <div className="mt-12 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart to continue shopping.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul
                role="list"
                className="divide-y divide-gray-200 border-t border-b border-gray-200"
              >
                {safeItems.map((item) => {
                  const isUpdating = updatingItems.has(item.id);
                  // Priority: variant images first, then product main image
                  const mainImageUrl = item.variant?.images && item.variant.images.length > 0 
                    ? `${process.env.NEXT_PUBLIC_API_URL}/${item.variant.images[0].path}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/${item.product.main_image.path}`;

                  return (
                    <li key={item.id} className="flex py-6 sm:py-10">
                      <div className="shrink-0">
                        <img
                          alt={item.product.name}
                          src={mainImageUrl}
                          className="size-24 rounded-md object-cover sm:size-48"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link
                                  href={`/products/${item.product.id}`}
                                  className="font-medium text-gray-700 hover:text-gray-800"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                            </div>
                            {item.variant?.name && (
                              <p className="mt-1 text-sm font-medium text-gray-800">
                                {item.variant.name}
                              </p>
                            )}
                            <div className="mt-1 flex text-sm">
                              <p className="text-gray-500">
                                {item.variant?.color?.name || 'No color'}
                                {item.variant?.color?.custom && " (Custom)"}
                              </p>
                              {item.size?.name && (
                                <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">
                                  {item.size.name}
                                </p>
                              )}
                            </div>
                            {item.size && (
                              <div className="mt-1 text-sm text-gray-500">
                                <p>Size: A:{item.size.a}, B:{item.size.b}, C:{item.size.c}</p>
                                <p>D:{item.size.d}, E:{item.size.e}, F:{item.size.f}</p>
                              </div>
                            )}
                            {item.additional_services && item.additional_services.length > 0 && (
                              <div className="mt-1 text-sm text-gray-500">
                                <p>Services: {item.additional_services.map(s => s.name).join(', ')}</p>
                              </div>
                            )}
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              ${(item.price_per_item || 0).toFixed(2)} each
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isUpdating || item.quantity >= 99}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="absolute top-0 right-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isUpdating}
                                className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                              >
                                <span className="sr-only">Usuń</span>
                                <XMarkIcon aria-hidden="true" className="size-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between">
                          <p className="flex space-x-2 text-sm text-gray-700">
                            <CheckIcon
                              aria-hidden="true"
                              className="size-5 shrink-0 text-green-500"
                            />
                            <span>In stock</span>
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Total: ${(item.total_price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${(cart.subtotal || 0).toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Total Items</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {cart.total_items || 0}
                  </dd>
                </div>
                
                {/* Discount code section */}
                <div className="border-t border-gray-200 pt-4">
                  {!cart.applied_discount ? (
                    <div className="space-y-2">
                      <label htmlFor="discount-code" className="text-sm font-medium text-gray-700">
                        Discount code
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          id="discount-code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          disabled={discountLoading}
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscount}
                          disabled={!discountCode || discountLoading}
                          className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {discountLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-sm text-red-600">{discountError}</p>
                      )}
                      {discountSuccess && (
                        <p className="text-sm text-green-600">{discountSuccess}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Discount applied</p>
                          <p className="text-sm text-gray-500">
                            {cart.applied_discount.code}: {cart.applied_discount.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDiscount}
                          disabled={discountLoading}
                          className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {cart.applied_discount && (
                  <div className="flex items-center justify-between text-green-600">
                    <dt className="text-sm">
                      Discount
                      {cart.applied_discount.discount_type === 'percentage' && 
                        ` (${cart.applied_discount.discount_value}%)`}
                    </dt>
                    <dd className="text-sm font-medium">
                      -${(cart.discount_amount || 0).toFixed(2)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <Link
                      href="/shipping-info"
                      className="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Learn more about how shipping is calculated
                      </span>
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="size-5"
                      />
                    </Link>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    Calculated at checkout
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${(cart.total_price || 0).toFixed(2)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-4">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Przejdź do kasy
                </Link>
                <Link
                  href="/products"
                  className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Kontynuuj zakupy
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}