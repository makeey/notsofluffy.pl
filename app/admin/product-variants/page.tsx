"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit2, Plus, Filter, Star } from "lucide-react";
import {
  apiClient,
  ProductVariantResponse,
  ProductResponse,
  ColorResponse,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ProductVariantForm } from "@/components/product-variant-form";

export default function ProductVariantsAdmin() {
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVariants, setTotalVariants] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantResponse | null>(null);
  const { toast } = useToast();

  const fetchVariants = async (page: number = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.listProductVariants(
        page,
        10,
        searchQuery || undefined,
        selectedProduct && selectedProduct !== "all" ? parseInt(selectedProduct) : undefined,
        selectedColor && selectedColor !== "all" ? parseInt(selectedColor) : undefined
      );
      setVariants(response.product_variants || []);
      setTotalVariants(response.total);
      setTotalPages(Math.ceil(response.total / response.limit));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching product variants:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch product variants");
      toast({
        title: "Error",
        description: "Failed to fetch product variants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.listProducts(1, 100);
      setProducts(response.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await apiClient.listColors(1, 100);
      setColors(response.colors || []);
    } catch (err) {
      console.error("Failed to fetch colors:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchColors();
    fetchVariants();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchVariants(1);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedProduct, selectedColor]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product variant?")) {
      return;
    }

    try {
      await apiClient.deleteProductVariant(id);
      toast({
        title: "Success",
        description: "Product variant deleted successfully",
      });
      fetchVariants(currentPage);
    } catch (err) {
      console.error("Error deleting product variant:", err);
      setError(err instanceof Error ? err.message : "Failed to delete product variant");
      toast({
        title: "Error",
        description: "Failed to delete product variant",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchVariants(page);
  };

  const handleVariantCreated = () => {
    setIsCreateDialogOpen(false);
    fetchVariants(currentPage);
    toast({
      title: "Success",
      description: "Product variant created successfully",
    });
  };

  const handleVariantUpdated = () => {
    setEditingVariant(null);
    fetchVariants(currentPage);
    toast({
      title: "Success",
      description: "Product variant updated successfully",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProduct("all");
    setSelectedColor("all");
    setCurrentPage(1);
  };

  if (loading && (!variants || variants.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading product variants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Variants</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product color variants and images
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product Variant</DialogTitle>
            </DialogHeader>
            <ProductVariantForm onSuccess={handleVariantCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search variants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products && products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All colors</SelectItem>
                  {colors && colors.map((color) => (
                    <SelectItem key={color.id} value={color.id.toString()}>
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchQuery ||
            (selectedProduct && selectedProduct !== "all") ||
            (selectedColor && selectedColor !== "all")) && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variants ({totalVariants})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants && variants.length > 0 ? (
                  variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{variant.product?.name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{variant.color?.name}</Badge>
                          {variant.color?.material && (
                            <span className="text-xs text-muted-foreground">
                              ({variant.color.material.name})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{variant.images?.length || 0}</span>
                          {variant.images && variant.images.length > 0 && (
                            <div className="flex -space-x-2">
                              {variant.images.slice(0, 3).map((image) => (
                                <div
                                  key={image.id}
                                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                                >
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${image.path}`}
                                    alt={image.filename}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {variant.images.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    +{variant.images.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant.is_default ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">Default</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(variant.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVariant(variant)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(variant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchQuery ||
                        (selectedProduct && selectedProduct !== "all") ||
                        (selectedColor && selectedColor !== "all")
                          ? "No variants found matching your filters."
                          : "No product variants found. Create your first variant to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Showing {variants ? variants.length : 0} of {totalVariants} variants
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingVariant && (
        <Dialog
          open={!!editingVariant}
          onOpenChange={() => setEditingVariant(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product Variant</DialogTitle>
            </DialogHeader>
            <ProductVariantForm
              productVariant={editingVariant}
              onSuccess={handleVariantUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}