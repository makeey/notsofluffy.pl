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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, AdditionalServiceResponse, ImageResponse } from "@/lib/api";

const additionalServiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  price: z.number().min(0, "Price must be positive"),
  image_ids: z.array(z.number()).optional(),
});

type AdditionalServiceFormData = z.infer<typeof additionalServiceSchema>;

interface AdditionalServiceFormProps {
  service?: AdditionalServiceResponse;
  onSuccess?: () => void;
}

export function AdditionalServiceForm({ service, onSuccess }: AdditionalServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);

  const isEditing = !!service;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AdditionalServiceFormData>({
    resolver: zodResolver(additionalServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      image_ids: service?.images?.map(img => img.id) || [],
    },
  });

  // Set initial selected images
  useEffect(() => {
    if (service?.images) {
      setSelectedImageIds(service.images.map(img => img.id));
    }
  }, [service]);

  // Fetch images
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

  const handleImageToggle = (imageId: number, checked: boolean) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedImageIds, imageId];
    } else {
      newSelectedIds = selectedImageIds.filter(id => id !== imageId);
    }
    setSelectedImageIds(newSelectedIds);
    setValue("image_ids", newSelectedIds);
  };

  const onSubmit = async (data: AdditionalServiceFormData) => {
    try {
      setLoading(true);
      setError("");

      const submitData = {
        ...data,
        image_ids: selectedImageIds,
      };

      if (isEditing) {
        await apiClient.updateAdditionalService(service.id, submitData);
      } else {
        await apiClient.createAdditionalService(submitData);
      }

      if (onSuccess) {
        onSuccess();
      }

      if (!isEditing) {
        reset();
        setSelectedImageIds([]);
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Service name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Service description"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-600 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-red-600 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Images (Optional)</Label>
          {imagesLoading ? (
            <p className="text-sm text-muted-foreground">Loading images...</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Images</CardTitle>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No images available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {images.map((image) => (
                      <div key={image.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={`image-${image.id}`}
                          checked={selectedImageIds.includes(image.id)}
                          onCheckedChange={(checked) => handleImageToggle(image.id, !!checked)}
                        />
                        <Label
                          htmlFor={`image-${image.id}`}
                          className="flex items-center space-x-2 cursor-pointer flex-1"
                        >
                          <img
                            src={`http://localhost:8080/${image.path}`}
                            alt={image.original_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-xs truncate">{image.original_name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || imagesLoading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Service"
            : "Create Service"}
        </Button>
      </div>
    </form>
  );
}