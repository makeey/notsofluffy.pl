"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, MaterialResponse } from "@/lib/api";

const materialSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  material?: MaterialResponse;
  onSuccess?: () => void;
}

export function MaterialForm({ material, onSuccess }: MaterialFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!material;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name || "",
    },
  });

  const onSubmit = async (data: MaterialFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await apiClient.updateMaterial(material.id, data);
      } else {
        await apiClient.createMaterial(data);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Material Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter material name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Material"
            : "Create Material"}
        </Button>
      </div>
    </form>
  );
}