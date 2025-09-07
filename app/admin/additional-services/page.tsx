'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Edit2, Plus, Search, Filter } from 'lucide-react';
import { apiClient, AdditionalServiceResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AdditionalServiceForm } from '@/components/additional-service-form';

export default function AdditionalServicesAdmin() {
  const [services, setServices] = useState<AdditionalServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdditionalServiceResponse | null>(null);
  const { toast } = useToast();

  const fetchServices = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.listAdditionalServices(
        page,
        10,
        searchQuery || undefined,
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined
      );
      setServices(response.additional_services);
      setTotalServices(response.total);
      setTotalPages(Math.ceil(response.total / response.limit));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching additional services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch additional services');
      toast({
        title: 'Error',
        description: 'Failed to fetch additional services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchServices(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this additional service?')) {
      return;
    }

    try {
      await apiClient.deleteAdditionalService(id);
      toast({
        title: 'Success',
        description: 'Additional service deleted successfully',
      });
      fetchServices(currentPage);
    } catch (err) {
      console.error('Error deleting additional service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete additional service');
      toast({
        title: 'Error',
        description: 'Failed to delete additional service',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchServices(page);
  };

  const handleServiceCreated = () => {
    setIsCreateDialogOpen(false);
    fetchServices(currentPage);
    toast({
      title: 'Success',
      description: 'Additional service created successfully',
    });
  };

  const handleServiceUpdated = () => {
    setEditingService(null);
    fetchServices(currentPage);
    toast({
      title: 'Success',
      description: 'Additional service updated successfully',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading additional services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Additional Services</h1>
          <p className="text-muted-foreground mt-2">
            Manage additional services and their pricing
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Additional Service</DialogTitle>
            </DialogHeader>
            <AdditionalServiceForm onSuccess={handleServiceCreated} />
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {formatPrice(service.price)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              
              {service.images && service.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Images ({service.images.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {service.images.slice(0, 3).map((image) => (
                      <div key={image.id} className="aspect-square bg-muted rounded-md overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${image.path}`}
                          alt={image.original_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {service.images.length > 3 && (
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        +{service.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p>Created: {new Date(service.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(service.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No additional services found</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Showing {services.length} of {totalServices} services
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
      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Additional Service</DialogTitle>
            </DialogHeader>
            <AdditionalServiceForm
              service={editingService}
              onSuccess={handleServiceUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}