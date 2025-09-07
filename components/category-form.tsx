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
import { apiClient, CategoryResponse, ImageResponse } from "@/lib/api";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(256, "Slug too long"),
  image_id: z.number().optional(),
  active: z.boolean(),
  chart_only: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: CategoryResponse;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      image_id: category?.image_id,
      active: category?.active ?? true,
      chart_only: category?.chart_only ?? false,
    },
  });

  const watchedName = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [watchedName, setValue, isEditing]);

  // Fetch available images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setImagesLoading(true);
        const response = await apiClient.listImages(1, 100); // Get all images
        setImages(response.images);
      } catch (err) {
        console.error("Failed to fetch images:", err);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, []);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await apiClient.updateCategory(category.id, data);
      } else {
        await apiClient.createCategory(data);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Category name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="category-slug"
          />
          {errors.slug && (
            <p className="text-red-600 text-sm">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_id">Image</Label>
        <Select
          onValueChange={(value) => 
            setValue("image_id", value === "none" ? undefined : parseInt(value))
          }
          defaultValue={category?.image_id?.toString() || "none"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an image (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No image</SelectItem>
            {imagesLoading ? (
              <SelectItem value="loading" disabled>
                Loading images...
              </SelectItem>
            ) : (
              images.map((image) => (
                <SelectItem key={image.id} value={image.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${image.path}`}
                      alt={image.original_name}
                      className="w-6 h-6 object-cover rounded"
                    />
                    <span>{image.original_name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            {...register("active")}
            defaultChecked={category?.active ?? true}
            onCheckedChange={(checked) => setValue("active", !!checked)}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="chart_only"
            {...register("chart_only")}
            defaultChecked={category?.chart_only ?? false}
            onCheckedChange={(checked) => setValue("chart_only", !!checked)}
          />
          <Label htmlFor="chart_only">Chart Only</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}