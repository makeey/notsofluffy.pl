'use client';

import { useState, useEffect } from 'react';
import { apiClient, OrderResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Eye, Edit, Trash2, Package, CreditCard, Truck, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

type StatusUpdateData = z.infer<typeof statusUpdateSchema>;

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Package className="w-4 h-4" />;
    case 'processing':
      return <CreditCard className="w-4 h-4" />;
    case 'shipped':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Payment method translations
const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case "przelew_tradycyjny":
      return "Przelew tradycyjny";
    default:
      return method;
  }
};

// Payment status translations
const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "Oczekujące";
    case "completed":
      return "Zakończone";
    case "failed":
      return "Nieudane";
    case "refunded":
      return "Zwrócone";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<OrderResponse | null>(null);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StatusUpdateData>({
    resolver: zodResolver(statusUpdateSchema),
  });

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listOrders({
        page: currentPage,
        limit: 10,
        email: searchTerm || undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(response.orders);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (data: StatusUpdateData) => {
    if (!updatingOrder) return;
    
    try {
      await apiClient.updateOrderStatus(updatingOrder.id, { status: data.status });
      setIsStatusUpdateDialogOpen(false);
      setUpdatingOrder(null);
      reset();
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleDeleteOrder = async (order: OrderResponse) => {
    if (!confirm(`Are you sure you want to delete order #${order.id}?`)) return;
    
    try {
      await apiClient.deleteOrder(order.id);
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const openStatusUpdateDialog = (order: OrderResponse) => {
    setUpdatingOrder(order);
    setValue('status', order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled');
    setIsStatusUpdateDialogOpen(true);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and track fulfillment</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.email}</div>
                      <div className="text-sm text-muted-foreground">{order.phone}</div>
                      {order.user_id && (
                        <div className="text-sm text-muted-foreground">
                          User ID: {order.user_id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${order.total_amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Subtotal: ${order.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getPaymentStatusText(order.payment_status)}</div>
                      {order.payment_method && (
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodText(order.payment_method)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.requires_invoice ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                          Required
                        </span>
                        {order.nip && (
                          <span className="text-xs text-muted-foreground">
                            {order.nip}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusUpdateDialog(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(order)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, total)} of {total} orders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdateStatus)} className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={updatingOrder?.status} 
                onValueChange={(value) => setValue('status', value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-destructive text-sm mt-1">{errors.status.message}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Status</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}