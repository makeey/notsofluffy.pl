"use client";

export const dynamic = 'force-dynamic';

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
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import type { OrderRequest, AddressRequest, UserAddressResponse } from "@/lib/api";
import { FurgonetkaMap, type FurgonetkaPoint } from "@/components/FurgonetkaMap";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  // Shipping method state
  const [shippingMethod, setShippingMethod] = useState<'home_delivery' | 'pickup_point'>('home_delivery');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<FurgonetkaPoint | null>(null);
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<UserAddressResponse[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null);

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
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Invoice fields
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [nip, setNip] = useState("");

  // Form validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load saved addresses for authenticated users
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Load user profile and addresses
          const profile = await apiClient.getUserProfile();
          
          // Pre-populate user data
          if (user.email) setEmail(user.email);
          if (profile.phone) setPhone(profile.phone);
          
          // Load addresses
          const addresses = profile.addresses || [];
          setSavedAddresses(addresses);
          
          // Auto-select default address if available
          const defaultAddress = addresses.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedShippingAddressId(defaultAddress.id);
            populateAddressForm(defaultAddress, 'shipping');
          }
        } catch (err) {
          console.error('Failed to load user data:', err);
        }
      }
    };

    if (!authLoading) {
      loadUserData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
      setSelectedBillingAddressId(selectedShippingAddressId);
    }
  }, [sameAsShipping, shippingAddress, selectedShippingAddressId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = "Adres e-mail jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Wprowadź prawidłowy adres e-mail";
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Numer telefonu jest wymagany";
    }

    // Shipping method validation
    if (shippingMethod === 'pickup_point' && !selectedPickupPoint) {
      newErrors.pickup_point = "Wybierz punkt odbioru";
    }

    // Shipping address validation (only for home delivery)
    if (shippingMethod === 'home_delivery') {
      if (!shippingAddress.first_name) newErrors.shipping_first_name = "Imię jest wymagane";
      if (!shippingAddress.last_name) newErrors.shipping_last_name = "Nazwisko jest wymagane";
      if (!shippingAddress.address_line1) newErrors.shipping_address_line1 = "Adres jest wymagany";
      if (!shippingAddress.city) newErrors.shipping_city = "Miasto jest wymagane";
      if (!shippingAddress.state_province) newErrors.shipping_state_province = "Województwo jest wymagane";
      if (!shippingAddress.postal_code) newErrors.shipping_postal_code = "Kod pocztowy jest wymagany";
      if (!shippingAddress.country) newErrors.shipping_country = "Kraj jest wymagany";
    }

    // Billing address validation (if different from shipping)
    if (!sameAsShipping) {
      if (!billingAddress.first_name) newErrors.billing_first_name = "Imię jest wymagane";
      if (!billingAddress.last_name) newErrors.billing_last_name = "Nazwisko jest wymagane";
      if (!billingAddress.address_line1) newErrors.billing_address_line1 = "Adres jest wymagany";
      if (!billingAddress.city) newErrors.billing_city = "Miasto jest wymagane";
      if (!billingAddress.state_province) newErrors.billing_state_province = "Województwo jest wymagane";
      if (!billingAddress.postal_code) newErrors.billing_postal_code = "Kod pocztowy jest wymagany";
      if (!billingAddress.country) newErrors.billing_country = "Kraj jest wymagany";
    }

    // Invoice validation
    if (requiresInvoice) {
      if (!nip.trim()) {
        newErrors.nip = "NIP jest wymagany gdy żądana jest faktura";
      } else {
        // Basic NIP validation - 10 digits
        const nipDigits = nip.replace(/\D/g, '');
        if (nipDigits.length !== 10) {
          newErrors.nip = "NIP musi mieć 10 cyfr";
        }
      }
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      newErrors.acceptTerms = "Musisz zaakceptować regulamin przed złożeniem zamówienia";
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
      setError("Twój koszyk jest pusty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Copy main phone number to address objects for API compatibility
      const shippingWithPhone = { ...shippingAddress, phone };
      const billingWithPhone = sameAsShipping ? shippingWithPhone : { ...billingAddress, phone };

      // For pickup point, use a minimal shipping address
      const finalShippingAddress = shippingMethod === 'pickup_point' 
        ? {
            first_name: email.split('@')[0], // Use email prefix as name
            last_name: '',
            company: '',
            address_line1: selectedPickupPoint?.name || '',
            address_line2: '',
            city: '',
            state_province: '',
            postal_code: '',
            country: 'Poland',
            phone: phone
          }
        : shippingWithPhone;

      const orderRequest: OrderRequest = {
        email,
        phone,
        shipping_address: finalShippingAddress,
        billing_address: billingWithPhone,
        same_as_shipping: sameAsShipping,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined,
        requires_invoice: requiresInvoice,
        nip: requiresInvoice ? nip : undefined,
        shipping_method: shippingMethod,
        pickup_point_code: shippingMethod === 'pickup_point' ? selectedPickupPoint?.code : undefined,
        pickup_point_name: shippingMethod === 'pickup_point' ? selectedPickupPoint?.name : undefined,
        pickup_point_type: shippingMethod === 'pickup_point' ? selectedPickupPoint?.type : undefined,
        pickup_point_address: shippingMethod === 'pickup_point' ? selectedPickupPoint?.address : undefined,
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
      setError(err instanceof Error ? err.message : "Nie udało się utworzyć zamówienia");
    } finally {
      setLoading(false);
    }
  };

  const populateAddressForm = (address: UserAddressResponse, type: 'shipping' | 'billing') => {
    const addressData: AddressRequest = {
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
    };

    if (type === 'shipping') {
      setShippingAddress(addressData);
    } else {
      setBillingAddress(addressData);
    }
  };

  const handleShippingAddressSelect = (addressId: number) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedShippingAddressId(addressId);
      populateAddressForm(address, 'shipping');
    }
  };

  const handleBillingAddressSelect = (addressId: number) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedBillingAddressId(addressId);
      populateAddressForm(address, 'billing');
    }
  };

  const updateShippingAddress = (field: keyof AddressRequest, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear selection when manually editing
    setSelectedShippingAddressId(null);
  };

  const updateBillingAddress = (field: keyof AddressRequest, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
    // Clear selection when manually editing
    setSelectedBillingAddressId(null);
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
              Twój koszyk jest pusty
            </h1>
            <p className="text-gray-600 mb-8">
              Dodaj produkty do koszyka przed przejściem do kasy.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Kontynuuj zakupy
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
        <h1 className="sr-only">Informacje o zamówieniu</h1>

        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pt-16 pb-10 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2
              id="summary-heading"
              className="text-lg font-medium text-gray-900"
            >
              Podsumowanie zamówienia
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
                      <p className="text-gray-500">Ilość: {item.quantity}</p>
                      {item.additional_services && item.additional_services.length > 0 && (
                        <p className="text-gray-500">
                          Usługi: {item.additional_services.map(s => s.name).join(', ')}
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
                <dt className="text-gray-600">Suma częściowa</dt>
                <dd>${(cart.subtotal || 0).toFixed(2)}</dd>
              </div>

              {cart.applied_discount && (
                <div className="flex items-center justify-between text-green-600">
                  <dt>
                    Zniżka ({cart.applied_discount.code})
                    {cart.applied_discount.discount_type === 'percentage' && 
                      ` (${cart.applied_discount.discount_value}%)`}
                  </dt>
                  <dd>-${(cart.discount_amount || 0).toFixed(2)}</dd>
                </div>
              )}

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Dostawa</dt>
                <dd>{shippingMethod === 'pickup_point' ? 'Paczkomat/Punkt odbioru' : 'Dostawa do domu'} - Bezpłatna</dd>
              </div>

              {shippingMethod === 'pickup_point' && selectedPickupPoint && (
                <div className="flex items-start justify-between text-sm">
                  <dt className="text-gray-500">Punkt odbioru:</dt>
                  <dd className="text-gray-700 text-right max-w-xs">
                    <div>{selectedPickupPoint.name}</div>
                    {selectedPickupPoint.address && (
                      <div className="text-xs text-gray-500 mt-1">{selectedPickupPoint.address}</div>
                    )}
                  </dd>
                </div>
              )}

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Podatki</dt>
                <dd>Obliczane przy kasie</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base">Suma</dt>
                <dd className="text-base">${cart.total_price.toFixed(2)}</dd>
              </div>
            </dl>

            <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-gray-900 lg:hidden">
              <div className="relative z-10 border-t border-gray-200 bg-white px-4 sm:px-6">
                <div className="mx-auto max-w-lg">
                  <PopoverButton className="flex w-full items-center py-6 font-medium">
                    <span className="mr-auto text-base">Suma</span>
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
                    <dt className="text-gray-600">Suma częściowa</dt>
                    <dd>${(cart.subtotal || 0).toFixed(2)}</dd>
                  </div>

                  {cart.applied_discount && (
                    <div className="flex items-center justify-between text-green-600">
                      <dt>
                        Zniżka ({cart.applied_discount.code})
                        {cart.applied_discount.discount_type === 'percentage' && 
                          ` (${cart.applied_discount.discount_value}%)`}
                      </dt>
                      <dd>-${(cart.discount_amount || 0).toFixed(2)}</dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Dostawa</dt>
                    <dd>{shippingMethod === 'pickup_point' ? 'Paczkomat/Punkt odbioru' : 'Dostawa do domu'} - Bezpłatna</dd>
                  </div>

                  {shippingMethod === 'pickup_point' && selectedPickupPoint && (
                    <div className="flex items-start justify-between text-sm">
                      <dt className="text-gray-500">Punkt odbioru:</dt>
                      <dd className="text-gray-700 text-right max-w-xs">
                        <div>{selectedPickupPoint.name}</div>
                        {selectedPickupPoint.address && (
                          <div className="text-xs text-gray-500 mt-1">{selectedPickupPoint.address}</div>
                        )}
                      </dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Podatki</dt>
                    <dd>Obliczane przy kasie</dd>
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
              <div className="flex items-center justify-between">
                <h2
                  id="contact-info-heading"
                  className="text-lg font-medium text-gray-900"
                >
                  Informacje kontaktowe
                </h2>
                {user && (
                  <a
                    href="/profile"
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Zarządzaj adresami
                  </a>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Adres e-mail
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
                    Numer telefonu
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

            <section aria-labelledby="shipping-method-heading" className="mt-10">
              <h2
                id="shipping-method-heading"
                className="text-lg font-medium text-gray-900"
              >
                Metoda dostawy
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="relative flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        id="home-delivery"
                        name="shipping-method"
                        type="radio"
                        checked={shippingMethod === 'home_delivery'}
                        onChange={() => setShippingMethod('home_delivery')}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="home-delivery" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Dostawa do domu
                      </label>
                      <p className="text-sm text-gray-500">Kurier dostarczy przesyłkę pod wskazany adres</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="relative flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        id="pickup-point"
                        name="shipping-method"
                        type="radio"
                        checked={shippingMethod === 'pickup_point'}
                        onChange={() => setShippingMethod('pickup_point')}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="pickup-point" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Odbiór w punkcie
                      </label>
                      <p className="text-sm text-gray-500">Odbierz przesyłkę w wybranym paczkomacie lub punkcie odbioru</p>
                    </div>
                  </label>
                </div>

                {shippingMethod === 'pickup_point' && (
                  <div className="mt-4 ml-7">
                    <FurgonetkaMap
                      courierServices={['inpost', 'orlen', 'poczta', 'ups', 'dpd']}
                      type="parcel_machine"
                      city={shippingAddress.city || undefined}
                      onPointSelect={(point) => setSelectedPickupPoint(point)}
                      selectedPoint={selectedPickupPoint}
                      buttonText="Wybierz paczkomat lub punkt odbioru"
                    />
                    {errors.pickup_point && (
                      <p className="mt-1 text-sm text-red-600">{errors.pickup_point}</p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="shipping-heading" className={`mt-10 ${shippingMethod === 'pickup_point' ? 'hidden' : ''}`}>
              <h2
                id="shipping-heading"
                className="text-lg font-medium text-gray-900"
              >
                Adres dostawy
              </h2>

              {/* Saved Addresses Selector */}
              {user && savedAddresses.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Wybierz z zapisanych adresów
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`relative cursor-pointer rounded-lg border p-3 ${
                          selectedShippingAddressId === address.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleShippingAddressSelect(address.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="radio"
                              name="shipping-address-select"
                              checked={selectedShippingAddressId === address.id}
                              onChange={() => handleShippingAddressSelect(address.id)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {address.label}
                              </span>
                              {address.is_default && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>{address.first_name} {address.last_name}</p>
                              <p>{address.address_line1}</p>
                              <p>{address.postal_code} {address.city}, {address.state_province}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      className={`relative cursor-pointer rounded-lg border p-3 ${
                        selectedShippingAddressId === null
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedShippingAddressId(null)}
                    >
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            name="shipping-address-select"
                            checked={selectedShippingAddressId === null}
                            onChange={() => setSelectedShippingAddressId(null)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">
                            Wprowadź nowy adres
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="shipping-first-name"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Imię
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
                    Nazwisko
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
                    Firma (opcjonalne)
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
                    Adres
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
                    Mieszkanie, lokal, itp. (opcjonalne)
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
                    Miasto
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
                    Województwo
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
                    Kod pocztowy
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
                Informacje do faktury
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
                  Takie same jak adres dostawy
                </label>
              </div>

              {!sameAsShipping && (
                <>
                  {/* Saved Billing Addresses Selector */}
                  {user && savedAddresses.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Wybierz z zapisanych adresów do faktury
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={`relative cursor-pointer rounded-lg border p-3 ${
                              selectedBillingAddressId === address.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => handleBillingAddressSelect(address.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="radio"
                                  name="billing-address-select"
                                  checked={selectedBillingAddressId === address.id}
                                  onChange={() => handleBillingAddressSelect(address.id)}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    {address.label}
                                  </span>
                                  {address.is_default && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <p>{address.first_name} {address.last_name}</p>
                                  <p>{address.address_line1}</p>
                                  <p>{address.postal_code} {address.city}, {address.state_province}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div
                          className={`relative cursor-pointer rounded-lg border p-3 ${
                            selectedBillingAddressId === null
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => setSelectedBillingAddressId(null)}
                        >
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                type="radio"
                                name="billing-address-select"
                                checked={selectedBillingAddressId === null}
                                onChange={() => setSelectedBillingAddressId(null)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">
                                Wprowadź nowy adres
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="billing-first-name"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Imię
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
                      Nazwisko
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
                      Firma (opcjonalne)
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
                      Adres
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
                      Mieszkanie, lokal, itp. (opcjonalne)
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
                      Miasto
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
                      Województwo
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
                      Kod pocztowy
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
                </>
              )}
            </section>

            <section aria-labelledby="invoice-heading" className="mt-10">
              <h2
                id="invoice-heading"
                className="text-lg font-medium text-gray-900"
              >
                Informacje do faktury
              </h2>

              <div className="mt-6 flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id="requires-invoice"
                      name="requires-invoice"
                      type="checkbox"
                      checked={requiresInvoice}
                      onChange={(e) => setRequiresInvoice(e.target.checked)}
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
                  htmlFor="requires-invoice"
                  className="text-sm/6 font-medium text-gray-900"
                >
                  Potrzebuję faktury
                </label>
              </div>

              {requiresInvoice && (
                <div className="mt-6">
                  <label
                    htmlFor="nip"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    NIP (Numer identyfikacji podatkowej)
                  </label>
                  <div className="mt-2">
                    <input
                      id="nip"
                      name="nip"
                      type="text"
                      placeholder="1234567890"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 ${
                        errors.nip ? 'outline-red-500' : 'outline-gray-300'
                      } placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
                    />
                    {errors.nip && (
                      <p className="mt-1 text-sm text-red-600">{errors.nip}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Wprowadź swój 10-cyfrowy numer identyfikacji podatkowej (NIP)
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="notes-heading" className="mt-10">
              <h2
                id="notes-heading"
                className="text-lg font-medium text-gray-900"
              >
                Uwagi do zamówienia (opcjonalne)
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="notes"
                  className="block text-sm/6 font-medium text-gray-700"
                >
                  Specjalne instrukcje do zamówienia
                </label>
                <div className="mt-2">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    placeholder="Jakiekolwiek specjalne instrukcje do zamówienia..."
                  />
                </div>
              </div>
            </section>

            {/* Terms Acceptance */}
            <section aria-labelledby="terms-heading" className="mt-10">
              <div className="flex items-start space-x-3">
                <div className="flex h-5 items-center">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="accept-terms" className="text-gray-700">
                    Akceptuję{' '}
                    <a href="/regulamin" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                      regulamin sklepu
                    </a>{' '}
                    oraz{' '}
                    <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                      politykę prywatności
                    </a>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none sm:order-last sm:ml-6 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Przetwarzanie..." : "Złóż zamówienie"}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
                Sprawdź zamówienie przed jego złożeniem.
              </p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}