'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, OrderResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Package, CreditCard, Truck, CheckCircle, XCircle, User, MapPin, Phone, Mail } from 'lucide-react';
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StatusUpdateData>({
    resolver: zodResolver(statusUpdateSchema),
  });

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrder(orderId);
      setOrder(response);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (data: StatusUpdateData) => {
    if (!order) return;
    
    try {
      await apiClient.updateOrderStatus(order.id, { status: data.status });
      setIsStatusUpdateDialogOpen(false);
      reset();
      loadOrder();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const openStatusUpdateDialog = () => {
    if (order) {
      setValue('status', order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled');
      setIsStatusUpdateDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Order not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order #{order.id}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status and Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Status</CardTitle>
              <Button variant="outline" size="sm" onClick={openStatusUpdateDialog}>
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={`inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Payment: {order.payment_status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Variant: {item.variant_name}
                      </div>
                      {item.variant_color_name && (
                        <div className="text-sm text-muted-foreground">
                          Color: {item.variant_color_name} {item.variant_color_custom && '(Custom)'}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Size: {item.size_name}
                      </div>
                      {item.size_dimensions && (
                        <div className="text-sm text-muted-foreground">
                          Dimensions: {JSON.stringify(item.size_dimensions)}
                        </div>
                      )}
                      {item.services && item.services.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Services: {item.services.map(s => `${s.service_name} (+$${s.service_price.toFixed(2)})`).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${item.unit_price.toFixed(2)} × {item.quantity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: ${item.total_price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Info and Addresses */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{order.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{order.phone}</span>
                </div>
                {order.user_id && (
                  <div className="text-sm text-muted-foreground">
                    User ID: {order.user_id}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </div>
                  {order.shipping_address.company && (
                    <div>{order.shipping_address.company}</div>
                  )}
                  <div>{order.shipping_address.address_line1}</div>
                  {order.shipping_address.address_line2 && (
                    <div>{order.shipping_address.address_line2}</div>
                  )}
                  <div>
                    {order.shipping_address.city}, {order.shipping_address.state_province} {order.shipping_address.postal_code}
                  </div>
                  <div>{order.shipping_address.country}</div>
                  {order.shipping_address.phone && (
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4" />
                      <span>{order.shipping_address.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {order.billing_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.billing_address.same_as_shipping ? (
                  <div className="text-sm text-muted-foreground">
                    Same as shipping address
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">
                      {order.billing_address.first_name} {order.billing_address.last_name}
                    </div>
                    {order.billing_address.company && (
                      <div>{order.billing_address.company}</div>
                    )}
                    <div>{order.billing_address.address_line1}</div>
                    {order.billing_address.address_line2 && (
                      <div>{order.billing_address.address_line2}</div>
                    )}
                    <div>
                      {order.billing_address.city}, {order.billing_address.state_province} {order.billing_address.postal_code}
                    </div>
                    <div>{order.billing_address.country}</div>
                    {order.billing_address.phone && (
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.billing_address.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                value={order.status} 
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