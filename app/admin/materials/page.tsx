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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { apiClient, MaterialResponse } from "@/lib/api";
import { MaterialForm } from "@/components/material-form";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialResponse | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listMaterials(page, limit, search);
      setMaterials(response.materials);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [page, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await apiClient.deleteMaterial(id);
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete material");
    }
  };

  const handleMaterialCreated = () => {
    setIsCreateDialogOpen(false);
    fetchMaterials();
  };

  const handleMaterialUpdated = () => {
    setEditingMaterial(null);
    fetchMaterials();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Materials</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Material</DialogTitle>
            </DialogHeader>
            <MaterialForm onSuccess={handleMaterialCreated} />
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
          <CardTitle>Material Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    {new Date(material.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(material.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMaterial(material)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {materials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-gray-500">
                      {search ? "No materials found matching your search." : "No materials found."}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} materials
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

      {editingMaterial && (
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <MaterialForm
              material={editingMaterial}
              onSuccess={handleMaterialUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}