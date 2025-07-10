"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { apiClient, ColorResponse, MaterialResponse } from "@/lib/api";
import { ColorForm } from "@/components/color-form";

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [customFilter, setCustomFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorResponse | null>(null);

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.listMaterials(1, 100); // Get all materials
      setMaterials(response.materials);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  const fetchColors = async () => {
    try {
      setLoading(true);
      const materialId = selectedMaterial ? parseInt(selectedMaterial) : undefined;
      const custom = customFilter ? customFilter === "true" : undefined;
      
      const response = await apiClient.listColors(page, limit, search, materialId, custom);
      setColors(response.colors);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchColors();
  }, [page, search, selectedMaterial, customFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleMaterialFilter = (value: string) => {
    setSelectedMaterial(value === "all" ? "" : value);
    setPage(1);
  };

  const handleCustomFilter = (value: string) => {
    setCustomFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      await apiClient.deleteColor(id);
      await fetchColors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete color");
    }
  };

  const handleColorCreated = () => {
    setIsCreateDialogOpen(false);
    fetchColors();
  };

  const handleColorUpdated = () => {
    setEditingColor(null);
    fetchColors();
  };

  const clearFilters = () => {
    setSelectedMaterial("");
    setCustomFilter("");
    setSearch("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && colors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading colors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Colors</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Color
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Color</DialogTitle>
            </DialogHeader>
            <ColorForm onSuccess={handleColorCreated} />
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
          <CardTitle>Color Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search colors..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={selectedMaterial || "all"} onValueChange={handleMaterialFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All materials</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={customFilter || "all"} onValueChange={handleCustomFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="true">Custom only</SelectItem>
                  <SelectItem value="false">Standard only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedMaterial || customFilter || search) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell className="font-medium">{color.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {color.material?.name || `Material ${color.material_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {color.image ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={`http://localhost:8080/${color.image.path}`}
                          alt={color.image.original_name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-gray-600">
                          {color.image.original_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={color.custom ? "default" : "secondary"}>
                      {color.custom ? "Custom" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(color.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingColor(color)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(color.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {colors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      {search || selectedMaterial || customFilter
                        ? "No colors found matching your filters."
                        : "No colors found."}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} colors
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editingColor && (
        <Dialog open={!!editingColor} onOpenChange={() => setEditingColor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Color</DialogTitle>
            </DialogHeader>
            <ColorForm
              color={editingColor}
              onSuccess={handleColorUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}