"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Search, Edit, Trash2, Ruler, Package, AlertTriangle } from "lucide-react";
import { apiClient, SizeResponse, ProductResponse } from "@/lib/api";
import { SizeForm } from "@/components/size-form";

export default function SizesPage() {
  const [sizes, setSizes] = useState<SizeResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<SizeResponse | null>(null);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const productFilter = selectedProductId !== "all" ? parseInt(selectedProductId) : undefined;
      const response = await apiClient.listSizes(page, limit, search, productFilter);
      setSizes(response.sizes || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error("Failed to fetch sizes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sizes");
      setSizes([]);
      setTotal(0);
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
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchSizes();
  }, [page, search, selectedProductId]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleProductFilter = (value: string) => {
    setSelectedProductId(value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this size?")) return;

    try {
      await apiClient.deleteSize(id);
      await fetchSizes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete size");
    }
  };

  const handleSizeCreated = () => {
    setIsCreateDialogOpen(false);
    fetchSizes();
  };

  const handleSizeUpdated = () => {
    setEditingSize(null);
    fetchSizes();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && sizes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading sizes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sizes</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Size
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Size</DialogTitle>
            </DialogHeader>
            <SizeForm onSuccess={handleSizeCreated} />
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

      <Card>
        <CardHeader>
          <CardTitle>Size Management</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sizes..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedProductId} onValueChange={handleProductFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading products...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes && sizes.length > 0 && sizes.map((size) => {
                const getStockStatus = () => {
                  if (!size.use_stock) {
                    return (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Unlimited</span>
                      </div>
                    );
                  }
                  
                  const availableStock = size.available_stock || 0;
                  
                  if (availableStock === 0) {
                    return (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Out of Stock</span>
                      </div>
                    );
                  }
                  
                  if (availableStock <= 5) {
                    return (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Low Stock ({availableStock})</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">In Stock ({availableStock})</span>
                    </div>
                  );
                };

                return (
                  <TableRow key={size.id}>
                    <TableCell className="font-medium">{size.name}</TableCell>
                    <TableCell>{size.product?.name || 'N/A'}</TableCell>
                    <TableCell>${size.base_price.toFixed(2)}</TableCell>
                    <TableCell>{getStockStatus()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Ruler className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {size.a} × {size.b} × {size.c} × {size.d} × {size.e} × {size.f}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(size.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSize(size)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(size.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {sizes.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No sizes found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {editingSize && (
        <Dialog open={!!editingSize} onOpenChange={() => setEditingSize(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Size</DialogTitle>
            </DialogHeader>
            <SizeForm size={editingSize} onSuccess={handleSizeUpdated} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}