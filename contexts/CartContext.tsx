'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { CartResponse, CartItemRequest, CartItemUpdateRequest } from '@/lib/api';

interface CartContextType {
  cart: CartResponse | null;
  cartCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (item: CartItemRequest) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      // Set defaults for error state
      setCart({ items: [], total_items: 0, total_price: 0 });
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

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    cart,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
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