"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient, SizeResponse, ProductResponse } from "@/lib/api";

const sizeSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  product_id: z.number().min(1, "Product is required"),
  base_price: z.number().min(0, "Base price must be positive"),
  a: z.number().min(0, "Dimension A must be positive"),
  b: z.number().min(0, "Dimension B must be positive"),
  c: z.number().min(0, "Dimension C must be positive"),
  d: z.number().min(0, "Dimension D must be positive"),
  e: z.number().min(0, "Dimension E must be positive"),
  f: z.number().min(0, "Dimension F must be positive"),
});

type SizeFormData = z.infer<typeof sizeSchema>;

interface SizeFormProps {
  size?: SizeResponse;
  onSuccess?: () => void;
}

export function SizeForm({ size, onSuccess }: SizeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const isEditing = !!size;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SizeFormData>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: size?.name || "",
      product_id: size?.product_id || 0,
      base_price: size?.base_price || 0,
      a: size?.a || 0,
      b: size?.b || 0,
      c: size?.c || 0,
      d: size?.d || 0,
      e: size?.e || 0,
      f: size?.f || 0,
    },
  });

  const selectedProductId = watch("product_id");

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

  const onSubmit = async (data: SizeFormData) => {
    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await apiClient.updateSize(size.id, data);
      } else {
        await apiClient.createSize(data);
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
        <Label htmlFor="name">Size Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter size name (e.g., Small, Medium, Large)"
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
        <Label htmlFor="base_price">Base Price *</Label>
        <Input
          id="base_price"
          type="number"
          step="0.01"
          {...register("base_price", { valueAsNumber: true })}
          placeholder="Enter base price"
        />
        {errors.base_price && (
          <p className="text-red-600 text-sm">{errors.base_price.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="a">Dimension A *</Label>
          <Input
            id="a"
            type="number"
            step="0.01"
            {...register("a", { valueAsNumber: true })}
            placeholder="Enter dimension A"
          />
          {errors.a && (
            <p className="text-red-600 text-sm">{errors.a.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="b">Dimension B *</Label>
          <Input
            id="b"
            type="number"
            step="0.01"
            {...register("b", { valueAsNumber: true })}
            placeholder="Enter dimension B"
          />
          {errors.b && (
            <p className="text-red-600 text-sm">{errors.b.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="c">Dimension C *</Label>
          <Input
            id="c"
            type="number"
            step="0.01"
            {...register("c", { valueAsNumber: true })}
            placeholder="Enter dimension C"
          />
          {errors.c && (
            <p className="text-red-600 text-sm">{errors.c.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="d">Dimension D *</Label>
          <Input
            id="d"
            type="number"
            step="0.01"
            {...register("d", { valueAsNumber: true })}
            placeholder="Enter dimension D"
          />
          {errors.d && (
            <p className="text-red-600 text-sm">{errors.d.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="e">Dimension E *</Label>
          <Input
            id="e"
            type="number"
            step="0.01"
            {...register("e", { valueAsNumber: true })}
            placeholder="Enter dimension E"
          />
          {errors.e && (
            <p className="text-red-600 text-sm">{errors.e.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="f">Dimension F *</Label>
          <Input
            id="f"
            type="number"
            step="0.01"
            {...register("f", { valueAsNumber: true })}
            placeholder="Enter dimension F"
          />
          {errors.f && (
            <p className="text-red-600 text-sm">{errors.f.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Size"
            : "Create Size"}
        </Button>
      </div>
    </form>
  );
}