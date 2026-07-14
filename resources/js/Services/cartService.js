const CART_KEY = 'pos_cart';

export const cartService = {
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  },

  addToCart(product, quantity = 1, size = '42', color = 'White') {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      if (size) cart[existingIndex].size = size;
      if (color) cart[existingIndex].color = color;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size,
        color
      });
    }

    this.saveCart(cart);
    return cart;
  },

  removeFromCart(itemId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== itemId);
    this.saveCart(cart);
    return cart;
  },

  updateQuantity(itemId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }
    return cart;
  },

  clearCart() {
    this.saveCart([]);
    return [];
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
};
