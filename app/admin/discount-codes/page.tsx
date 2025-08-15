"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { DiscountCodeResponse, DiscountCodeRequest } from "@/lib/api";

export default function DiscountCodesAdminPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeResponse | null>(null);
  const [formData, setFormData] = useState<DiscountCodeRequest>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    usage_type: "once_per_user",
    active: true,
    start_date: new Date().toISOString().split('T')[0],
  });

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listDiscountCodes(page, limit);
      let codes = response.discount_codes || [];
      
      // Apply local search filter
      if (search) {
        codes = codes.filter(code => 
          code.code.toLowerCase().includes(search.toLowerCase()) ||
          (code.description && code.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      setDiscountCodes(codes);
      setTotal(codes.length);
    } catch (err) {
      console.error('Failed to fetch discount codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch discount codes');
      setDiscountCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, [page, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert date strings to proper datetime format for backend
      const formattedData = {
        ...formData,
        start_date: formData.start_date + 'T00:00:00Z',
        end_date: formData.end_date ? formData.end_date + 'T23:59:59Z' : undefined,
      };

      if (editingCode) {
        await apiClient.updateDiscountCode(editingCode.id, formattedData);
      } else {
        await apiClient.createDiscountCode(formattedData);
      }
      setIsCreateDialogOpen(false);
      setEditingCode(null);
      resetForm();
      await fetchDiscountCodes();
    } catch (err) {
      console.error('Failed to save discount code:', err);
      setError(err instanceof Error ? err.message : 'Failed to save discount code');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      await apiClient.deleteDiscountCode(id);
      await fetchDiscountCodes();
    } catch (err) {
      console.error('Failed to delete discount code:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete discount code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_amount: 0,
      usage_type: "once_per_user",
      active: true,
      start_date: new Date().toISOString().split('T')[0],
    });
  };


  const openEditDialog = (code: DiscountCodeResponse) => {
    setFormData({
      code: code.code,
      description: code.description,
      discount_type: code.discount_type as 'percentage' | 'fixed_amount',
      discount_value: code.discount_value,
      min_order_amount: code.min_order_amount,
      usage_type: code.usage_type as 'one_time' | 'once_per_user' | 'unlimited',
      max_uses: code.max_uses || undefined,
      active: code.active,
      start_date: code.start_date.split('T')[0],
      end_date: code.end_date ? code.end_date.split('T')[0] : undefined,
    });
    setEditingCode(code);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && discountCodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading discount codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Discount Code</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="DISCOUNT20"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount_type">Type</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed_amount' })}
                    className="w-full px-3 py-2 mt-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer sale discount"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_value">Value</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">Min Order Amount</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="usage_type">Usage Type</Label>
                <select
                  id="usage_type"
                  value={formData.usage_type}
                  onChange={(e) => setFormData({ ...formData, usage_type: e.target.value as 'one_time' | 'once_per_user' | 'unlimited' })}
                  className="w-full px-3 py-2 mt-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="one_time">One Time</option>
                  <option value="once_per_user">Once Per User</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {formData.usage_type === 'unlimited' && (
                <div>
                  <Label htmlFor="max_uses">Max Uses (optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </form>
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
          <CardTitle>Discount Code Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search discount codes..."
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
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {code.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{code.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {code.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {code.discount_type === 'percentage' 
                      ? `${code.discount_value}%` 
                      : `$${code.discount_value}`}
                    {code.min_order_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        Min: ${code.min_order_amount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge variant={code.active ? "default" : "secondary"}>
                        {code.active ? "Active" : "Inactive"}
                      </Badge>
                      {code.is_expired && (
                        <Badge variant="outline" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {code.is_usage_exceeded && (
                        <Badge variant="outline" className="text-xs">
                          Usage Exceeded
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {code.used_count}
                      {code.max_uses && ` / ${code.max_uses}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {code.usage_type.replace('_', ' ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(code)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(code.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {discountCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {search ? "No discount codes found matching your search." : "No discount codes found."}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} discount codes
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

      {editingCode && (
        <Dialog open={!!editingCode} onOpenChange={() => setEditingCode(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Discount Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-code">Code</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-discount_type">Type</Label>
                  <select
                    id="edit-discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed_amount' })}
                    className="w-full px-3 py-2 mt-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-discount_value">Value</Label>
                  <Input
                    id="edit-discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-min_order_amount">Min Order Amount</Label>
                  <Input
                    id="edit-min_order_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-usage_type">Usage Type</Label>
                <select
                  id="edit-usage_type"
                  value={formData.usage_type}
                  onChange={(e) => setFormData({ ...formData, usage_type: e.target.value as 'one_time' | 'once_per_user' | 'unlimited' })}
                  className="w-full px-3 py-2 mt-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="one_time">One Time</option>
                  <option value="once_per_user">Once Per User</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {formData.usage_type === 'unlimited' && (
                <div>
                  <Label htmlFor="edit-max_uses">Max Uses (optional)</Label>
                  <Input
                    id="edit-max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start_date">Start Date</Label>
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_date">End Date (optional)</Label>
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingCode(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}