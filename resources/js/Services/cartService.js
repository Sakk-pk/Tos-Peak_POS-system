import axios from 'axios';

const GUEST_CART_KEY = 'pos_cart_guest';

/**
 * Cart Service — single source of truth for all cart operations.
 *
 * For GUESTS: uses localStorage keyed by GUEST_CART_KEY.
 * For AUTHENTICATED users: uses the database via /api/cart endpoints.
 * On login: caller should invoke syncGuestCartToServer() to merge guest items.
 */
export const cartService = {

  // ── Guest (localStorage) helpers ────────────────────────────────────────

  getGuestCart() {
    try {
      const gItems = JSON.parse(localStorage.getItem(GUEST_CART_KEY));
      const pItems = JSON.parse(localStorage.getItem('pos_cart'));
      if (Array.isArray(gItems) && gItems.length > 0) return gItems;
      if (Array.isArray(pItems) && pItems.length > 0) return pItems;
      return [];
    } catch {
      return [];
    }
  },

  saveGuestCart(cart) {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    } catch (e) {}
    window.dispatchEvent(new Event('storage'));
  },

  clearGuestCart() {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
      localStorage.removeItem('pos_cart');
    } catch (e) {}
    window.dispatchEvent(new Event('storage'));
  },

  // ── Synchronous local read (always returns current state) ───────────────
  // Used by useCart initializer; returns guest cart; DB cart is async-loaded.

  getCart() {
    return this.getGuestCart();
  },

  // ── Database API helpers (authenticated users only) ──────────────────────

  async fetchServerCart() {
    try {
      const res = await axios.get('/api/cart');
      return res.data.cart || [];
    } catch {
      return [];
    }
  },

  async addToCartServer(product, quantity, size, color) {
    try {
      const res = await axios.post('/api/cart', {
        product_id: product.id,
        quantity,
        size: size || 'Unisex',
        color: color || 'Standard',
      });
      return res.data.cart || [];
    } catch {
      return null; // signal failure to caller
    }
  },

  async updateQuantityServer(productId, quantity, size, color) {
    try {
      const res = await axios.patch(`/api/cart/${productId}`, { quantity, size, color });
      return res.data.cart || [];
    } catch {
      return null;
    }
  },

  async removeFromCartServer(productId, size, color) {
    try {
      const res = await axios.delete(`/api/cart/${productId}`, {
        params: { size: size || 'Unisex', color: color || 'Standard' }
      });
      return res.data.cart || [];
    } catch {
      return null;
    }
  },

  async clearServerCart() {
    try {
      await axios.delete('/api/cart');
    } catch { /* best-effort */ }
  },

  /**
   * Merge guest cart items into the authenticated user's database cart.
   * Called on successful login, before switching to DB-mode.
   */
  async syncGuestCartToServer() {
    const guestItems = this.getGuestCart();
    if (guestItems.length === 0) return;
    try {
      const res = await axios.post('/api/cart/sync', { items: guestItems });
      this.clearGuestCart();
      return res.data.cart || [];
    } catch {
      return null;
    }
  },

  // ── Legacy local helpers (kept for compatibility) ────────────────────────

  addToCart(product, quantity = 1, size = 'Unisex', color = 'Standard') {
    const cart = this.getGuestCart();
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size,
        color,
        stock: product.stock,
        category: product.category || '',
        brand: product.brand || '',
      });
    }

    this.saveGuestCart(cart);
    return cart;
  },

  removeFromCart(itemId) {
    let cart = this.getGuestCart();
    cart = cart.filter(item => item.id !== itemId);
    this.saveGuestCart(cart);
    return cart;
  },

  updateQuantity(itemId, quantity) {
    const cart = this.getGuestCart();
    const item = cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.saveGuestCart(cart);
    }
    return cart;
  },

  clearCart(isLoggedIn = false) {
    this.saveGuestCart([]);
    if (isLoggedIn) {
      this.clearServerCart();
    }
    return [];
  },

  getCartCount() {
    return this.getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartTotal() {
    return this.getGuestCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  clearAllSessionData() {
    try {
      this.clearGuestCart();
      this.saveGuestCart([]);
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key && (
            key.startsWith('wishlist_items') ||
            key.startsWith('pos_cart') ||
            key === 'cart' ||
            key === '_tp_intended'
          )
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (e) {}
    window.dispatchEvent(new Event('storage'));
  }
};
