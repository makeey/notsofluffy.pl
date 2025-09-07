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
import { apiClient, ColorResponse, ImageResponse, MaterialResponse } from "@/lib/api";

const colorSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  image_id: z.number().optional(),
  custom: z.boolean(),
  material_id: z.number().min(1, "Material is required"),
});

type ColorFormData = z.infer<typeof colorSchema>;

interface ColorFormProps {
  color?: ColorResponse;
  onSuccess?: () => void;
}

export function ColorForm({ color, onSuccess }: ColorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  const isEditing = !!color;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: color?.name || "",
      image_id: color?.image_id,
      custom: color?.custom ?? false,
      material_id: color?.material_id || 0,
    },
  });

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const response = await apiClient.listMaterials(1, 100); // Get all materials
        setMaterials(response.materials);
      } catch (err) {
        console.error("Failed to fetch materials:", err);
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

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

  const onSubmit = async (data: ColorFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await apiClient.updateColor(color.id, data);
      } else {
        await apiClient.createColor(data);
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
          <Label htmlFor="name">Color Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Color name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="material_id">Material *</Label>
          <Select
            onValueChange={(value) => setValue("material_id", parseInt(value))}
            defaultValue={color?.material_id?.toString() || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a material" />
            </SelectTrigger>
            <SelectContent>
              {materialsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading materials...
                </SelectItem>
              ) : (
                materials.map((material) => (
                  <SelectItem key={material.id} value={material.id.toString()}>
                    {material.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.material_id && (
            <p className="text-red-600 text-sm">{errors.material_id.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_id">Image (Optional)</Label>
        <Select
          onValueChange={(value) => 
            setValue("image_id", value === "none" ? undefined : parseInt(value))
          }
          defaultValue={color?.image_id?.toString() || "none"}
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom"
          {...register("custom")}
          defaultChecked={color?.custom ?? false}
          onCheckedChange={(checked) => setValue("custom", !!checked)}
        />
        <Label htmlFor="custom">Custom Color</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || materialsLoading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Color"
            : "Create Color"}
        </Button>
      </div>
    </form>
  );
}