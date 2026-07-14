import { useState, useEffect, useCallback } from 'react';
import { cartService } from '@/Services/cartService';

export function useCart() {
  const [cartItems, setCartItems] = useState(() => cartService.getCart());

  const refreshCart = useCallback(() => {
    setCartItems(cartService.getCart());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refreshCart);
    return () => {
      window.removeEventListener('storage', refreshCart);
    };
  }, [refreshCart]);

  const addToCart = useCallback((product, quantity, size, color) => {
    const updated = cartService.addToCart(product, quantity, size, color);
    setCartItems(updated);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    const updated = cartService.removeFromCart(itemId);
    setCartItems(updated);
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    const updated = cartService.updateQuantity(itemId, quantity);
    setCartItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    const updated = cartService.clearCart();
    setCartItems(updated);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    refreshCart
  };
}
