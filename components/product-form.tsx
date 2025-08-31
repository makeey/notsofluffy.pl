"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  apiClient,
  ProductResponse,
  ImageResponse,
  MaterialResponse,
  CategoryResponse,
  AdditionalServiceResponse,
} from "@/lib/api";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(512, "Short description too long"),
  description: z.string().min(1, "Description is required"),
  material_id: z.number().optional(),
  main_image_id: z.number().min(1, "Main image is required"),
  category_id: z.number().optional(),
  image_ids: z.array(z.number()).min(1, "At least one image is required"),
  additional_service_ids: z.array(z.number()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductResponse;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalServiceResponse[]
  >([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedMainImageId, setSelectedMainImageId] = useState<number | null>(
    null,
  );

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      short_description: product?.short_description || "",
      description: product?.description || "",
      material_id: product?.material_id,
      main_image_id: product?.main_image_id || 0,
      category_id: product?.category_id,
      image_ids: product?.images?.map((img) => img.id) || [],
      additional_service_ids:
        product?.additional_services?.map((service) => service.id) || [],
    },
  });

  // Set initial selected values
  useEffect(() => {
    if (product) {
      setSelectedImageIds(product.images?.map((img) => img.id) || []);
      setSelectedServiceIds(
        product.additional_services?.map((service) => service.id) || [],
      );
      setSelectedMainImageId(product.main_image_id);
    }
  }, [product]);

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [imagesRes, materialsRes, categoriesRes, servicesRes] =
          await Promise.all([
            apiClient.listImages(1, 100),
            apiClient.listMaterials(1, 100),
            apiClient.listCategories(1, 100),
            apiClient.listAdditionalServices(1, 100),
          ]);

        setImages(imagesRes.images);
        setMaterials(materialsRes.materials);
        setCategories(categoriesRes.categories);
        setAdditionalServices(servicesRes.additional_services);
      } catch (err) {
        console.error("Failed to fetch form data:", err);
        setError("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImageToggle = (imageId: number, checked: boolean) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedImageIds, imageId];
    } else {
      newSelectedIds = selectedImageIds.filter((id) => id !== imageId);
      // If main image is unchecked, clear main image selection
      if (imageId === selectedMainImageId) {
        setSelectedMainImageId(null);
        setValue("main_image_id", 0);
      }
    }
    setSelectedImageIds(newSelectedIds);
    setValue("image_ids", newSelectedIds);
  };

  const handleServiceToggle = (serviceId: number, checked: boolean) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedServiceIds, serviceId];
    } else {
      newSelectedIds = selectedServiceIds.filter((id) => id !== serviceId);
    }
    setSelectedServiceIds(newSelectedIds);
    setValue("additional_service_ids", newSelectedIds);
  };

  const handleMainImageSelect = (imageId: number) => {
    setSelectedMainImageId(imageId);
    setValue("main_image_id", imageId);

    // Ensure main image is also selected in images array
    if (!selectedImageIds.includes(imageId)) {
      const newSelectedIds = [...selectedImageIds, imageId];
      setSelectedImageIds(newSelectedIds);
      setValue("image_ids", newSelectedIds);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      setError("");

      const submitData = {
        ...data,
        image_ids: selectedImageIds,
        additional_service_ids: selectedServiceIds,
        main_image_id: selectedMainImageId || 0,
      };

      if (isEditing) {
        await apiClient.updateProduct(product.id, submitData);
      } else {
        await apiClient.createProduct(submitData);
      }

      if (onSuccess) {
        onSuccess();
      }

      if (!isEditing) {
        reset();
        setSelectedImageIds([]);
        setSelectedServiceIds([]);
        setSelectedMainImageId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground">
          Loading form data...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register("name")} placeholder="Product name" />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description *</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
              placeholder="Brief product description"
              rows={3}
            />
            {errors.short_description && (
              <p className="text-red-600 text-sm">
                {errors.short_description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <RichTextEditor
              content={watch("description") || ""}
              onChange={(content) => setValue("description", content)}
              placeholder="Detailed product description"
            />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "category_id",
                    value === "none" ? undefined : parseInt(value),
                  )
                }
                defaultValue={product?.category_id?.toString() || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material_id">Material</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "material_id",
                    value === "none" ? undefined : parseInt(value),
                  )
                }
                defaultValue={product?.material_id?.toString() || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No material</SelectItem>
                  {materials.map((material) => (
                    <SelectItem
                      key={material.id}
                      value={material.id.toString()}
                    >
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right Column - Images and Services */}
        <div className="space-y-4">
          {/* Main Image Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Main Image *</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMainImageId && (
                <div className="mb-4">
                  <div className="aspect-square w-32 bg-muted rounded-md overflow-hidden">
                    <img
                      src={`http://localhost:8080/${images.find((img) => img.id === selectedMainImageId)?.path}`}
                      alt="Main image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current main image
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-2">
                Select from your chosen images below
              </div>
              {errors.main_image_id && (
                <p className="text-red-600 text-sm">
                  {errors.main_image_id.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Images Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Product Images * ({selectedImageIds.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No images available
                </p>
              ) : (
                <div className="space-y-3">
                  <Select
                    onValueChange={(value) => {
                      if (value !== "none") {
                        const imageId = parseInt(value);
                        if (!selectedImageIds.includes(imageId)) {
                          handleImageToggle(imageId, true);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select images to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select an image</SelectItem>
                      {images
                        .filter((img) => !selectedImageIds.includes(img.id))
                        .map((image) => (
                          <SelectItem
                            key={image.id}
                            value={image.id.toString()}
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={`http://localhost:8080/${image.path}`}
                                alt={image.original_name}
                                className="w-6 h-6 object-cover rounded"
                              />
                              <span className="text-sm">
                                {image.original_name.length > 10
                                  ? `${image.original_name.substring(0, 10)}...`
                                  : image.original_name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Images */}
                  {selectedImageIds.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Images:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedImageIds.map((imageId) => {
                          const image = images.find(
                            (img) => img.id === imageId,
                          );
                          if (!image) return null;
                          return (
                            <div
                              key={imageId}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <img
                                  src={`http://localhost:8080/${image.path}`}
                                  alt={image.original_name}
                                  className="w-6 h-6 object-cover rounded"
                                />
                                <span className="text-sm">
                                  {image.original_name.length > 10
                                    ? `${image.original_name.substring(0, 10)}...`
                                    : image.original_name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  type="button"
                                  variant={
                                    selectedMainImageId === imageId
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() => handleMainImageSelect(imageId)}
                                >
                                  {selectedMainImageId === imageId
                                    ? "Main"
                                    : "Set Main"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleImageToggle(imageId, false)
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errors.image_ids && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.image_ids.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Services Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Additional Services ({selectedServiceIds.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {additionalServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No additional services available
                </p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {additionalServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2 p-2 border rounded"
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServiceIds.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleServiceToggle(service.id, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="flex items-center justify-between cursor-pointer flex-1"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {service.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          ${service.price.toFixed(2)}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="submit" disabled={loading || dataLoading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
