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
import { Trash2, Edit2, Plus, Filter, ShoppingBag } from "lucide-react";
import {
  apiClient,
  ProductResponse,
  CategoryResponse,
  MaterialResponse,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/product-form";

export default function ProductsAdmin() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null,
  );
  const { toast } = useToast();

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.listProducts(
        page,
        12, // Show more products per page since we have cards
        searchQuery || undefined,
        selectedCategory && selectedCategory !== "all"
          ? parseInt(selectedCategory)
          : undefined,
        selectedMaterial && selectedMaterial !== "all"
          ? parseInt(selectedMaterial)
          : undefined,
      );
      setProducts(response.products);
      setTotalProducts(response.total);
      setTotalPages(Math.ceil(response.total / response.limit));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.listCategories(1, 100);
      setCategories(response.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.listMaterials(1, 100);
      setMaterials(response.materials);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMaterials();
    fetchProducts();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategory, selectedMaterial]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await apiClient.deleteProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts(currentPage);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err instanceof Error ? err.message : "Failed to delete product");
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleProductCreated = () => {
    setIsCreateDialogOpen(false);
    fetchProducts(currentPage);
    toast({
      title: "Success",
      description: "Product created successfully",
    });
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    fetchProducts(currentPage);
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMaterial("all");
    setCurrentPage(1);
  };

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={handleProductCreated} />
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories && categories.map((category) => (
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
            <div>
              <Select
                value={selectedMaterial}
                onValueChange={setSelectedMaterial}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All materials</SelectItem>
                  {materials && materials.map((material) => (
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
          {(searchQuery ||
            (selectedCategory && selectedCategory !== "all") ||
            (selectedMaterial && selectedMaterial !== "all")) && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products &&
          products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Main Image */}
                <div className="aspect-square bg-muted overflow-hidden rounded-t-lg">
                  <img
                    src={`http://localhost:8080/${product.main_image.path}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-3">
                  {/* Product Title and Actions */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.short_description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    {product.material && (
                      <Badge variant="outline" className="text-xs">
                        {product.material.name}
                      </Badge>
                    )}
                  </div>

                  {/* Image Count and Services */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.images?.length || 0} images</span>
                    <span>{product.additional_services?.length || 0} services</span>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {(!products || products.length === 0) && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ||
              (selectedCategory && selectedCategory !== "all") ||
              (selectedMaterial && selectedMaterial !== "all")
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first product."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Showing {products ? products.length : 0} of {totalProducts}{" "}
              products
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
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSuccess={handleProductUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
