'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, GripVertical, Upload } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/admin/SortableItem';

interface ClientReview {
  id: number;
  client_name: string;
  instagram_handle?: string;
  image_id: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image?: {
    id: number;
    filename: string;
    original_name: string;
    path: string;
    size_bytes: number;
    mime_type: string;
    uploaded_by: number;
    created_at: string;
    updated_at: string;
  };
}

interface ImageResponse {
  id: number;
  filename: string;
  original_name: string;
  path: string;
  size_bytes: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

interface ReviewCardProps {
  review: ClientReview;
  onEdit: (review: ClientReview) => void;
  onDelete: (id: number) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function ReviewCard({ review, onEdit, onDelete, dragHandleProps }: ReviewCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div 
            {...dragHandleProps} 
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {review.image && (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${review.image.path}`}
                alt={review.client_name}
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{review.client_name}</h3>
          {review.instagram_handle && (
            <p className="text-sm text-muted-foreground">@{review.instagram_handle}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              review.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {review.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-muted-foreground">Order: {review.display_order}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(review)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(review.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    instagram_handle: '',
    image_id: 0,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadReviews();
    loadImages();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/client-reviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setReviews(data.client_reviews || []);
    } catch (error) {
      console.error('Failed to load client reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/images?limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingReview 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/client-reviews/${editingReview.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/client-reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          client_name: formData.client_name,
          instagram_handle: formData.instagram_handle || null,
          image_id: formData.image_id,
          display_order: editingReview ? editingReview.display_order : reviews.length,
          is_active: formData.is_active,
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingReview(null);
        setFormData({ client_name: '', instagram_handle: '', image_id: 0, is_active: true });
        loadReviews();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save client review');
      }
    } catch (error) {
      console.error('Failed to save client review:', error);
      alert('Failed to save client review');
    }
  };

  const handleEdit = (review: ClientReview) => {
    setEditingReview(review);
    setFormData({
      client_name: review.client_name,
      instagram_handle: review.instagram_handle || '',
      image_id: review.image_id,
      is_active: review.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client review?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/client-reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        loadReviews();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete client review');
      }
    } catch (error) {
      console.error('Failed to delete client review:', error);
      alert('Failed to delete client review');
    }
  };

  const handleDragEnd = async (event: { active: { id: number }; over: { id: number } | null }) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = reviews.findIndex((review) => review.id === active.id);
    const newIndex = reviews.findIndex((review) => review.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    const newReviews = arrayMove(reviews, oldIndex, newIndex);
    setReviews(newReviews);

    // Update display orders
    const reorderData = newReviews.map((review, index) => ({
      id: review.id,
      display_order: index,
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/client-reviews/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ review_orders: reorderData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder reviews');
      }
    } catch (error) {
      console.error('Failed to reorder reviews:', error);
      // Reload to get correct order if reorder failed
      loadReviews();
    }
  };

  const openCreateDialog = () => {
    setEditingReview(null);
    setFormData({ client_name: '', instagram_handle: '', image_id: 0, is_active: true });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage client review photos for the homepage gallery</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No client reviews yet</h3>
            <p className="text-muted-foreground mb-4">Add your first client review to get started</p>
            <Button onClick={openCreateDialog}>Add First Review</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={reviews.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <SortableItem key={review.id} id={review.id}>
                    <ReviewCard review={review} onEdit={handleEdit} onDelete={handleDelete} />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? 'Edit Client Review' : 'Add Client Review'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="instagram_handle">Instagram Handle (optional)</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                placeholder="@username"
              />
            </div>
            
            <div>
              <Label htmlFor="image_id">Image</Label>
              <div className="space-y-3">
                <select
                  id="image_id"
                  value={formData.image_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_id: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                >
                  <option value={0}>Select an image</option>
                  {images.map((image) => (
                    <option key={image.id} value={image.id}>
                      {image.original_name}
                    </option>
                  ))}
                </select>
                
                {/* Image Preview */}
                {formData.image_id > 0 && (
                  <div className="mt-3">
                    <Label className="text-sm text-muted-foreground">Preview:</Label>
                    <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden bg-muted border">
                      {(() => {
                        const selectedImage = images.find(img => img.id === formData.image_id);
                        return selectedImage ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${selectedImage.path}`}
                            alt={selectedImage.original_name}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingReview ? 'Update' : 'Create'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}