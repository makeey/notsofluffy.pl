'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { CartResponse, CartItemRequest, CartItemUpdateRequest, ApplyDiscountRequest, ApplyDiscountResponse } from '@/lib/api';

interface CartContextType {
  cart: CartResponse | null;
  cartCount: number;
  loading: boolean;
  error: string | null;
  discountLoading: boolean;
  discountError: string | null;
  addToCart: (item: CartItemRequest) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<ApplyDiscountResponse>;
  removeDiscount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Fetch cart data
  const refreshCart = async () => {
    try {
      setError(null);
      const [cartData, countData] = await Promise.all([
        apiClient.getCart(),
        apiClient.getCartCount()
      ]);
      setCart(cartData);
      setCartCount(countData.count);
    } catch (err) {
      console.error('Error fetching cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      
      // Don't show "Invalid token" errors to users, just log them
      if (errorMessage.includes('Invalid token') || errorMessage.includes('Authentication failed')) {
        console.warn('Cart fetch failed due to authentication issue, using empty cart for guest user');
        setError(null); // Don't show error to user
      } else {
        setError(errorMessage);
      }
      
      // Set defaults for error state (empty cart for guest users)
      setCart({ items: [], total_items: 0, subtotal: 0, discount_amount: 0, total_price: 0 });
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (item: CartItemRequest) => {
    try {
      setError(null);
      await apiClient.addToCart(item);
      await refreshCart(); // Refresh cart after adding
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err; // Re-throw so UI can handle it
    }
  };

  // Update cart item quantity
  const updateCartItem = async (id: number, quantity: number) => {
    try {
      setError(null);
      const updateRequest: CartItemUpdateRequest = { quantity };
      await apiClient.updateCartItem(id, updateRequest);
      await refreshCart(); // Refresh cart after updating
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: number) => {
    try {
      setError(null);
      await apiClient.removeFromCart(id);
      await refreshCart(); // Refresh cart after removing
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setError(null);
      await apiClient.clearCart();
      await refreshCart(); // Refresh cart after clearing
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    }
  };

  // Apply discount code
  const applyDiscount = async (code: string): Promise<ApplyDiscountResponse> => {
    try {
      setDiscountError(null);
      setDiscountLoading(true);
      const request: ApplyDiscountRequest = { code };
      const response = await apiClient.applyDiscountToCart(request);
      await refreshCart(); // Refresh cart to get updated totals
      return response;
    } catch (err) {
      console.error('Error applying discount:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply discount';
      setDiscountError(errorMessage);
      throw err;
    } finally {
      setDiscountLoading(false);
    }
  };

  // Remove discount from cart
  const removeDiscount = async () => {
    try {
      setDiscountError(null);
      setDiscountLoading(true);
      await apiClient.removeDiscountFromCart();
      await refreshCart(); // Refresh cart to get updated totals
    } catch (err) {
      console.error('Error removing discount:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove discount';
      setDiscountError(errorMessage);
      throw err;
    } finally {
      setDiscountLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    cart,
    cartCount,
    loading,
    error,
    discountLoading,
    discountError,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    applyDiscount,
    removeDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}