"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { apiClient } from "@/lib/api";
import type { OrderRequest, AddressRequest } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState<AddressRequest>({
    first_name: "",
    last_name: "",
    company: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "Poland",
    phone: "",
  });
  const [billingAddress, setBillingAddress] = useState<AddressRequest>({
    first_name: "",
    last_name: "",
    company: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "Poland",
    phone: "",
  });

  const [paymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  // Form validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [sameAsShipping, shippingAddress]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
    }

    // Shipping address validation
    if (!shippingAddress.first_name) newErrors.shipping_first_name = "First name is required";
    if (!shippingAddress.last_name) newErrors.shipping_last_name = "Last name is required";
    if (!shippingAddress.address_line1) newErrors.shipping_address_line1 = "Address is required";
    if (!shippingAddress.city) newErrors.shipping_city = "City is required";
    if (!shippingAddress.state_province) newErrors.shipping_state_province = "State/Province is required";
    if (!shippingAddress.postal_code) newErrors.shipping_postal_code = "Postal code is required";
    if (!shippingAddress.country) newErrors.shipping_country = "Country is required";

    // Billing address validation (if different from shipping)
    if (!sameAsShipping) {
      if (!billingAddress.first_name) newErrors.billing_first_name = "First name is required";
      if (!billingAddress.last_name) newErrors.billing_last_name = "Last name is required";
      if (!billingAddress.address_line1) newErrors.billing_address_line1 = "Address is required";
      if (!billingAddress.city) newErrors.billing_city = "City is required";
      if (!billingAddress.state_province) newErrors.billing_state_province = "State/Province is required";
      if (!billingAddress.postal_code) newErrors.billing_postal_code = "Postal code is required";
      if (!billingAddress.country) newErrors.billing_country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Copy main phone number to address objects for API compatibility
      const shippingWithPhone = { ...shippingAddress, phone };
      const billingWithPhone = sameAsShipping ? shippingWithPhone : { ...billingAddress, phone };

      const orderRequest: OrderRequest = {
        email,
        phone,
        shipping_address: shippingWithPhone,
        billing_address: billingWithPhone,
        same_as_shipping: sameAsShipping,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined,
      };

      const orderResponse = await apiClient.createOrder(orderRequest);
      
      // Redirect based on user authentication status
      if (orderResponse.public_hash) {
        // Guest order - redirect to order page using hash
        router.push(`/order/${orderResponse.public_hash}`);
      } else {
        // Authenticated user - redirect to order history
        router.push('/orders');
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const updateShippingAddress = (field: keyof AddressRequest, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const updateBillingAddress = (field: keyof AddressRequest, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  if (cartLoading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue Shopping
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
      
      {/* Background color split screen for large screens */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 hidden h-full w-1/2 bg-white lg:block z-[-1]"
      />
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 hidden h-full w-1/2 bg-gray-50 lg:block z-[-1]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pt-16 pb-10 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2
              id="summary-heading"
              className="text-lg font-medium text-gray-900"
            >
              Order summary
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 text-sm font-medium text-gray-900"
            >
              {cart.items?.map((item) => {
                const imageUrl = item.variant?.images && item.variant.images.length > 0 
                  ? `${process.env.NEXT_PUBLIC_API_URL}/${item.variant.images[0].path}`
                  : `${process.env.NEXT_PUBLIC_API_URL}/${item.product.main_image.path}`;

                return (
                  <li
                    key={item.id}
                    className="flex items-start space-x-4 py-6"
                  >
                    <img
                      alt={item.product.name}
                      src={imageUrl}
                      className="size-20 flex-none rounded-md object-cover"
                    />
                    <div className="flex-auto space-y-1">
                      <h3>{item.product.name}</h3>
                      <p className="text-gray-500">{item.variant?.name}</p>
                      <p className="text-gray-500">
                        {item.variant?.color?.name}
                        {item.variant?.color?.custom && " (Custom)"}
                      </p>
                      <p className="text-gray-500">{item.size?.name}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                      {item.additional_services && item.additional_services.length > 0 && (
                        <p className="text-gray-500">
                          Services: {item.additional_services.map(s => s.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="flex-none text-base font-medium">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd>${cart.total_price.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd>Free</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Taxes</dt>
                <dd>Calculated at checkout</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base">Total</dt>
                <dd className="text-base">${cart.total_price.toFixed(2)}</dd>
              </div>
            </dl>

            <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 lg:hidden">
              <div className="relative z-10 border-t border-gray-200 bg-white px-4 sm:px-6">
                <div className="mx-auto max-w-lg">
                  <PopoverButton className="flex w-full items-center py-6 font-medium">
                    <span className="mr-auto text-base">Total</span>
                    <span className="mr-2 text-base">${cart.total_price.toFixed(2)}</span>
                    <ChevronUpIcon
                      aria-hidden="true"
                      className="size-5 text-gray-500"
                    />
                  </PopoverButton>
                </div>
              </div>

              <PopoverBackdrop
                transition
                className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
              />
              <PopoverPanel
                transition
                className="relative transform bg-white px-4 py-6 transition duration-300 ease-in-out data-closed:translate-y-full sm:px-6"
              >
                <dl className="mx-auto max-w-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd>${cart.total_price.toFixed(2)}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd>Free</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Taxes</dt>
                    <dd>Calculated at checkout</dd>
                  </div>
                </dl>
              </PopoverPanel>
            </Popover>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="px-4 pt-16 pb-36 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
          <div className="mx-auto max-w-lg lg:max-w-none">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <section aria-labelledby="contact-info-heading">
              <h2
                id="contact-info-heading"
                className="text-lg font-medium text-gray-900"
              >
                Contact information
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email-address"
                      name="email-address"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.email ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone-number"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Phone number
                  </label>
                  <div className="mt-2">
                    <input
                      id="phone-number"
                      name="phone-number"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.phone ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2
                id="shipping-heading"
                className="text-lg font-medium text-gray-900"
              >
                Shipping address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="shipping-first-name"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-first-name"
                      name="shipping-first-name"
                      type="text"
                      autoComplete="given-name"
                      value={shippingAddress.first_name}
                      onChange={(e) => updateShippingAddress('first_name', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_first_name ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_first_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-last-name"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-last-name"
                      name="shipping-last-name"
                      type="text"
                      autoComplete="family-name"
                      value={shippingAddress.last_name}
                      onChange={(e) => updateShippingAddress('last_name', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_last_name ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-company"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Company (optional)
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-company"
                      name="shipping-company"
                      type="text"
                      value={shippingAddress.company || ''}
                      onChange={(e) => updateShippingAddress('company', e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="shipping-address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-address"
                      name="shipping-address"
                      type="text"
                      autoComplete="street-address"
                      value={shippingAddress.address_line1}
                      onChange={(e) => updateShippingAddress('address_line1', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_address_line1 ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_address_line1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_address_line1}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="shipping-apartment"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Apartment, suite, etc. (optional)
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-apartment"
                      name="shipping-apartment"
                      type="text"
                      value={shippingAddress.address_line2 || ''}
                      onChange={(e) => updateShippingAddress('address_line2', e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-city"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-city"
                      name="shipping-city"
                      type="text"
                      autoComplete="address-level2"
                      value={shippingAddress.city}
                      onChange={(e) => updateShippingAddress('city', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_city ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_city && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-region"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    State / Province
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-region"
                      name="shipping-region"
                      type="text"
                      autoComplete="address-level1"
                      value={shippingAddress.state_province}
                      onChange={(e) => updateShippingAddress('state_province', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_state_province ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_state_province && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_state_province}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-postal-code"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Postal code
                  </label>
                  <div className="mt-2">
                    <input
                      id="shipping-postal-code"
                      name="shipping-postal-code"
                      type="text"
                      autoComplete="postal-code"
                      value={shippingAddress.postal_code}
                      onChange={(e) => updateShippingAddress('postal_code', e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.shipping_postal_code ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.shipping_postal_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.shipping_postal_code}</p>
                    )}
                  </div>
                </div>

              </div>
            </section>

            <section aria-labelledby="billing-heading" className="mt-10">
              <h2
                id="billing-heading"
                className="text-lg font-medium text-gray-900"
              >
                Billing information
              </h2>

              <div className="mt-6 flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id="same-as-shipping"
                      name="same-as-shipping"
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-checked:opacity-100"
                      />
                      <path
                        d="M3 7H11"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-indeterminate:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="same-as-shipping"
                  className="text-sm/6 font-medium text-gray-900"
                >
                  Same as shipping information
                </label>
              </div>

              {!sameAsShipping && (
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="billing-first-name"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-first-name"
                        name="billing-first-name"
                        type="text"
                        autoComplete="given-name"
                        value={billingAddress.first_name}
                        onChange={(e) => updateBillingAddress('first_name', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_first_name ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_first_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="billing-last-name"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-last-name"
                        name="billing-last-name"
                        type="text"
                        autoComplete="family-name"
                        value={billingAddress.last_name}
                        onChange={(e) => updateBillingAddress('last_name', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_last_name ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="billing-company"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Company (optional)
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-company"
                        name="billing-company"
                        type="text"
                        value={billingAddress.company || ''}
                        onChange={(e) => updateBillingAddress('company', e.target.value)}
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="billing-address"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-address"
                        name="billing-address"
                        type="text"
                        autoComplete="street-address"
                        value={billingAddress.address_line1}
                        onChange={(e) => updateBillingAddress('address_line1', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_address_line1 ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_address_line1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_address_line1}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="billing-apartment"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Apartment, suite, etc. (optional)
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-apartment"
                        name="billing-apartment"
                        type="text"
                        value={billingAddress.address_line2 || ''}
                        onChange={(e) => updateBillingAddress('address_line2', e.target.value)}
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="billing-city"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      City
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-city"
                        name="billing-city"
                        type="text"
                        autoComplete="address-level2"
                        value={billingAddress.city}
                        onChange={(e) => updateBillingAddress('city', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_city ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_city && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_city}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="billing-region"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      State / Province
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-region"
                        name="billing-region"
                        type="text"
                        autoComplete="address-level1"
                        value={billingAddress.state_province}
                        onChange={(e) => updateBillingAddress('state_province', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_state_province ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_state_province && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_state_province}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="billing-postal-code"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Postal code
                    </label>
                    <div className="mt-2">
                      <input
                        id="billing-postal-code"
                        name="billing-postal-code"
                        type="text"
                        autoComplete="postal-code"
                        value={billingAddress.postal_code}
                        onChange={(e) => updateBillingAddress('postal_code', e.target.value)}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                          errors.billing_postal_code ? 'outline-red-500' : 'outline-gray-300'
                        } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                      />
                      {errors.billing_postal_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.billing_postal_code}</p>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </section>

            <section aria-labelledby="notes-heading" className="mt-10">
              <h2
                id="notes-heading"
                className="text-lg font-medium text-gray-900"
              >
                Order notes (optional)
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="notes"
                  className="block text-sm/6 font-medium text-gray-700"
                >
                  Special instructions for your order
                </label>
                <div className="mt-2">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </section>

            <div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none sm:order-last sm:ml-6 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
                Review your order before placing it.
              </p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}