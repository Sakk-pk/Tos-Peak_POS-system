import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { cartService } from '@/Services/cartService';

/**
 * useCart — database-backed for authenticated users, localStorage for guests.
 *
 * Flow:
 *  1. On mount: if user is logged in, fetch cart from DB and merge any guest items.
 *     If not logged in, read from guest localStorage.
 *  2. On login (auth.user changes null → user): sync guest cart to DB, clear local.
 *  3. On logout (auth.user changes user → null): clear React state, show empty cart.
 *  4. All mutations (add/remove/update) write to the appropriate source.
 */
export function useCart() {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;
  const isLoggedIn = !!user;

  // Initialize cartLoading=true for authenticated users so the very first render
  // never shows cartItems=[] with cartLoading=false simultaneously (which would
  // cause CheckoutPage to redirect before the async fetch completes).
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(isLoggedIn);
  const prevUserIdRef = useRef(user?.id ?? null);

  // ── Load cart from correct source ───────────────────────────────────────
  const loadCart = useCallback(async () => {
    if (isLoggedIn) {
      setCartLoading(true);
      await cartService.syncGuestCartToServer();
      const serverCart = await cartService.fetchServerCart();
      setCartItems(serverCart);
      setCartLoading(false);
    } else {
      setCartItems(cartService.getGuestCart());
      setCartLoading(false);
    }
  }, [isLoggedIn]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadCart();
  }, []);

  // ── React to auth state changes ─────────────────────────────────────────
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currUserId = user?.id ?? null;

    if (currUserId !== prevUserId) {
      prevUserIdRef.current = currUserId;

      if (currUserId) {
        // Logged in: merge guest cart then load from DB
        (async () => {
          setCartLoading(true);
          await cartService.syncGuestCartToServer();
          const serverCart = await cartService.fetchServerCart();
          setCartItems(serverCart);
          setCartLoading(false);
        })();
      } else {
        // Logged out: purge all local cart/wishlist storage & clear React state
        cartService.clearAllSessionData();
        setCartItems([]);
      }
    }
  }, [user?.id]);

  // ── Listen for guest localStorage changes (multi-tab / same-page) ───────
  const refreshGuestCart = useCallback(() => {
    if (!isLoggedIn) {
      setCartItems(cartService.getGuestCart());
    }
  }, [isLoggedIn]);

  useEffect(() => {
    window.addEventListener('storage', refreshGuestCart);
    return () => window.removeEventListener('storage', refreshGuestCart);
  }, [refreshGuestCart]);

  // ── Mutations ────────────────────────────────────────────────────────────

  const addToCart = useCallback(async (product, quantity, size, color) => {
    if (isLoggedIn) {
      const updated = await cartService.addToCartServer(product, quantity, size, color);
      if (updated !== null) setCartItems(updated);
    } else {
      const updated = cartService.addToCart(product, quantity, size, color);
      setCartItems(updated);
    }
  }, [isLoggedIn]);

  const removeFromCart = useCallback(async (itemId, size, color) => {
    if (isLoggedIn) {
      const updated = await cartService.removeFromCartServer(itemId, size, color);
      if (updated !== null) setCartItems(updated);
    } else {
      const updated = cartService.removeFromCart(itemId);
      setCartItems(updated);
    }
  }, [isLoggedIn]);

  const updateQuantity = useCallback(async (itemId, quantity, size, color) => {
    if (isLoggedIn) {
      const updated = await cartService.updateQuantityServer(itemId, quantity, size, color);
      if (updated !== null) setCartItems(updated);
    } else {
      const updated = cartService.updateQuantity(itemId, quantity);
      setCartItems(updated);
    }
  }, [isLoggedIn]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      await cartService.clearServerCart();
    } else {
      cartService.clearCart();
    }
    // Also clear localStorage in all cases so guest key is clean
    cartService.clearGuestCart();
    setCartItems([]);
  }, [isLoggedIn]);

  // Explicit React state setter (used by CheckoutPage after success)
  const resetCartState = useCallback(() => {
    cartService.clearGuestCart();
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cartItems,
    setCartItems: resetCartState,   // kept for backward-compat in CheckoutPage
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    cartLoading,
    refreshCart: loadCart,
  };
}
