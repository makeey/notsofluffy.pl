"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  apiClient,
  ProductVariantResponse,
  ProductResponse,
  ColorResponse,
  ImageResponse,
} from "@/lib/api";

const productVariantSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  product_id: z.number().min(1, "Product is required"),
  color_id: z.number().min(1, "Color is required"),
  is_default: z.boolean(),
  image_ids: z.array(z.number()).min(1, "At least one image is required"),
});

type ProductVariantFormData = z.infer<typeof productVariantSchema>;

interface ProductVariantFormProps {
  productVariant?: ProductVariantResponse;
  onSuccess?: () => void;
}

export function ProductVariantForm({ productVariant, onSuccess }: ProductVariantFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);

  const isEditing = !!productVariant;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductVariantFormData>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      name: productVariant?.name || "",
      product_id: productVariant?.product_id || 0,
      color_id: productVariant?.color_id || 0,
      is_default: productVariant?.is_default || false,
      image_ids: productVariant?.images?.map(img => img.id) || [],
    },
  });

  const selectedProductId = watch("product_id");
  const selectedColorId = watch("color_id");
  const selectedImageIds = watch("image_ids");
  const isDefault = watch("is_default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await apiClient.listProducts(1, 100);
        setProducts(response.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setColorsLoading(true);
        const response = await apiClient.listColors(1, 100);
        setColors(response.colors || []);
      } catch (err) {
        console.error("Failed to fetch colors:", err);
        setColors([]);
      } finally {
        setColorsLoading(false);
      }
    };

    fetchColors();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setImagesLoading(true);
        const response = await apiClient.listImages(1, 100);
        setImages(response.images || []);
      } catch (err) {
        console.error("Failed to fetch images:", err);
        setImages([]);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, []);

  const onSubmit = async (data: ProductVariantFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await apiClient.updateProductVariant(productVariant.id, data);
      } else {
        await apiClient.createProductVariant(data);
      }

      if (onSuccess) {
        onSuccess();
      }

      if (!isEditing) {
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleImageToggle = (imageId: number) => {
    const currentImages = selectedImageIds || [];
    const newImages = currentImages.includes(imageId)
      ? currentImages.filter(id => id !== imageId)
      : [...currentImages, imageId];
    setValue("image_ids", newImages);
  };

  const selectedImages = images.filter(img => selectedImageIds?.includes(img.id));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Variant Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter variant name (e.g., Red Small, Blue Large)"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_id">Product *</Label>
        <Select
          value={selectedProductId > 0 ? selectedProductId.toString() : "0"}
          onValueChange={(value) => setValue("product_id", parseInt(value) || 0)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>
              {productsLoading ? "Loading products..." : "Select a product"}
            </SelectItem>
            {products && products.length > 0 && products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
            {!productsLoading && (!products || products.length === 0) && (
              <SelectItem value="none" disabled>
                No products available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.product_id && (
          <p className="text-red-600 text-sm">{errors.product_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="color_id">Color *</Label>
        <Select
          value={selectedColorId > 0 ? selectedColorId.toString() : "0"}
          onValueChange={(value) => setValue("color_id", parseInt(value) || 0)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" disabled>
              {colorsLoading ? "Loading colors..." : "Select a color"}
            </SelectItem>
            {colors && colors.length > 0 && colors.map((color) => (
              <SelectItem key={color.id} value={color.id.toString()}>
                {color.name} {color.material?.name && `(${color.material.name})`}
              </SelectItem>
            ))}
            {!colorsLoading && (!colors || colors.length === 0) && (
              <SelectItem value="none" disabled>
                No colors available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.color_id && (
          <p className="text-red-600 text-sm">{errors.color_id.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={isDefault}
          onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
        />
        <Label htmlFor="is_default">Set as default variant</Label>
        <p className="text-sm text-muted-foreground">
          (Only one variant per product can be default)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Images *</Label>
          <p className="text-sm text-muted-foreground">
            Select one or more images for this variant
          </p>
          {errors.image_ids && (
            <p className="text-red-600 text-sm">{errors.image_ids.message}</p>
          )}
        </div>

        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Images ({selectedImages.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((image) => (
                <Badge
                  key={image.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {image.filename}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleImageToggle(image.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Available Images</CardTitle>
            <CardDescription>
              Click on images to select/deselect them for this variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imagesLoading ? (
              <p className="text-center text-muted-foreground">Loading images...</p>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImageIds?.includes(image.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleImageToggle(image.id)}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${image.path}`}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">
                        {image.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No images available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Variant"
            : "Create Variant"}
        </Button>
      </div>
    </form>
  );
}