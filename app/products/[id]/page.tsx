"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import type {
  ProductResponse,
  ProductVariantResponse,
  SizeResponse,
} from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ProductDetailData {
  product: ProductResponse;
  variants: ProductVariantResponse[];
  sizes: SizeResponse[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  const [data, setData] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponse | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeResponse | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPublicProduct(productId);
        setData(response);

        // Set default variant (first one or the default one)
        if (response.variants.length > 0) {
          const defaultVariant =
            response.variants.find((v) => v.is_default) || response.variants[0];
          setSelectedVariant(defaultVariant);
        }

        // Set initial images (main image + product images)
        const initialImages = [
          `${process.env.NEXT_PUBLIC_API_URL}/${response.product.main_image.path}`,
          ...response.product.images.map(
            (img) => `${process.env.NEXT_PUBLIC_API_URL}/${img.path}`,
          ),
        ];
        setCurrentImages(initialImages);

        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Update images when variant changes
  useEffect(() => {
    if (selectedVariant && data) {
      const variantImages =
        selectedVariant.images.length > 0
          ? selectedVariant.images.map(
              (img) => `${process.env.NEXT_PUBLIC_API_URL}/${img.path}`,
            )
          : [
              `${process.env.NEXT_PUBLIC_API_URL}/${data.product.main_image.path}`,
              ...data.product.images.map(
                (img) => `${process.env.NEXT_PUBLIC_API_URL}/${img.path}`,
              ),
            ];
      setCurrentImages(variantImages);
      setCurrentImageIndex(0);
    }
  }, [selectedVariant, data]);

  const calculatePrice = (): number => {
    if (!selectedSize || !selectedVariant) return 0;

    let price = selectedSize.base_price;

    // Apply 10% markup for custom colors
    if (selectedVariant.color.custom) {
      price *= 1.1;
    }

    // Add additional services
    if (data && data.product.additional_services && selectedServices.length > 0) {
      const servicesPrice = selectedServices.reduce((total, serviceId) => {
        const service = data.product.additional_services.find(
          (s) => s.id === serviceId,
        );
        return total + (service?.price || 0);
      }, 0);
      price += servicesPrice;
    }

    return Math.round(price * 100) / 100; // Round to 2 decimal places
  };

  const isAddToCartEnabled = selectedVariant && selectedSize;

  if (loading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error || "Product not found"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={currentImages[currentImageIndex]}
                alt={data.product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-indigo-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${data.product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Product Info */}
          <div className="space-y-6">
            {/* Product Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {data.product.name}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {data.product.short_description}
              </p>
              {data.product.description && (
                <p className="mt-4 text-gray-700">{data.product.description}</p>
              )}
            </div>

            {/* Variants Selection */}
            {data.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Color
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {data.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {variant.color.image && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${variant.color.image.path}`}
                            alt={variant.color.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {variant.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {variant.color.name}
                            {variant.color.custom && " (Custom +10%)"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {data.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {data.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        selectedSize?.id === size.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{size.name}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>A: {size.a}, B: {size.b}, C: {size.c}</p>
                          <p>D: {size.d}, E: {size.e}, F: {size.f}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${size.base_price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {data.product.additional_services && data.product.additional_services.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Additional Services
                </h3>
                <div className="space-y-2">
                  {data.product.additional_services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([
                              ...selectedServices,
                              service.id,
                            ]);
                          } else {
                            setSelectedServices(
                              selectedServices.filter(
                                (id) => id !== service.id,
                              ),
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.description}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        +${service.price}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${calculatePrice().toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                disabled={!isAddToCartEnabled}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isAddToCartEnabled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAddToCartEnabled ? "Add to Cart" : "Select Size to Continue"}
              </button>

              {!selectedVariant && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select a color variant
                </p>
              )}
              {!selectedSize && selectedVariant && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select a size
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
